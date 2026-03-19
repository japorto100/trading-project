"""Vector store abstraction.

Providers:
    - chroma   (current local default)
    - pgvector (prepared path, opt-in via VECTOR_STORE_PROVIDER=pgvector)

Default Chroma path: python-backend/data/chroma/ (auto-created)
Embedding model: all-MiniLM-L6-v2 (~23 MB, downloaded once, then cached)
Mock fallback for tests: set VECTOR_STORE_MOCK=true
"""
from __future__ import annotations

import os
import re
from pathlib import Path
from typing import Any, Protocol

_DEFAULT_CHROMA_PATH = str(Path(__file__).resolve().parents[2] / "data" / "chroma")
_MODEL_NAME = "all-MiniLM-L6-v2"
_DEFAULT_COLLECTION = "memory"
_DEFAULT_PGVECTOR_TABLE = "memory_embeddings"
_VECTOR_DIMENSION = 384


class _VectorBackend(Protocol):
    def add(self, doc_id: str, text: str, metadata: dict[str, Any] | None = None) -> None: ...
    def search(self, query: str, n_results: int = 5) -> list[dict[str, Any]]: ...
    def count(self) -> int: ...
    def status(self) -> dict[str, Any]: ...
    def delete(self, doc_id: str) -> None: ...
    def seed_from_kg(self, stratagems: list[dict[str, Any]]) -> int: ...


def _normalize_provider(value: str | None) -> str:
    provider = (value or "chroma").strip().lower()
    if provider in {"pg", "postgres", "postgresql"}:
        return "pgvector"
    return provider or "chroma"


def _sanitize_identifier(value: str, fallback: str) -> str:
    cleaned = (value or fallback).strip()
    if not cleaned:
        cleaned = fallback
    if not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", cleaned):
        return fallback
    return cleaned


def _vector_literal(embedding: list[float]) -> str:
    return "[" + ",".join(f"{float(value):.8f}" for value in embedding) + "]"


class _DeterministicEmbeddingFunction:
    """Reproducible mock embeddings for testing (no model download)."""

    def __call__(self, input: list[str]) -> list[list[float]]:  # noqa: A002
        import hashlib
        result = []
        for text in input:
            digest = hashlib.md5(text.encode()).digest()
            # Expand 16 bytes to 384-dim float vector
            base = [((b / 255.0) * 2.0 - 1.0) for b in digest]
            vec = (base * 24)[:384]
            result.append(vec)
        return result


class _SentenceTransformerEmbeddingFunction:
    def __init__(self, mock: bool = False) -> None:
        self._mock = mock
        self._deterministic = _DeterministicEmbeddingFunction()
        self._embedding_function = None
        if not mock:
            from chromadb.utils.embedding_functions import (  # type: ignore[import-untyped]
                SentenceTransformerEmbeddingFunction,
            )

            self._embedding_function = SentenceTransformerEmbeddingFunction(model_name=_MODEL_NAME)

    def embed(self, texts: list[str]) -> list[list[float]]:
        if self._mock:
            return self._deterministic(texts)
        if self._embedding_function is None:
            return self._deterministic(texts)
        return self._embedding_function(texts)


class _ChromaVectorStore:
    def __init__(
        self,
        path: str | None = None,
        collection_name: str = _DEFAULT_COLLECTION,
        mock: bool = False,
    ) -> None:
        self._path = path or os.getenv("VECTOR_STORE_PATH", _DEFAULT_CHROMA_PATH)
        self._collection_name = collection_name
        self._mock = mock or os.getenv("VECTOR_STORE_MOCK", "false").lower() in ("1", "true")

        Path(self._path).mkdir(parents=True, exist_ok=True)

        if self._mock:
            # Mock mode must not require chromadb at runtime.
            self._client = None
            self._collection = None
            self._mock_docs: dict[str, tuple[str, dict[str, Any]]] = {}
            return
        else:
            import chromadb  # type: ignore[import-untyped]

            self._client = chromadb.PersistentClient(path=self._path)
            ef = _SentenceTransformerEmbeddingFunction(mock=False)

        self._collection = self._client.get_or_create_collection(
            name=collection_name,
            embedding_function=ef,
        )

    def add(self, doc_id: str, text: str, metadata: dict[str, Any] | None = None) -> None:
        if self._mock:
            self._mock_docs[doc_id] = (text, metadata or {})
            return
        self._collection.upsert(
            ids=[doc_id],
            documents=[text],
            metadatas=[metadata or {}],
        )

    def search(self, query: str, n_results: int = 5) -> list[dict[str, Any]]:
        if self._mock:
            if not self._mock_docs:
                return []
            q_tokens = set(query.lower().split())
            ranked: list[tuple[float, str, str, dict[str, Any]]] = []
            for doc_id, (text, metadata) in self._mock_docs.items():
                t_tokens = set(text.lower().split())
                if not q_tokens or not t_tokens:
                    distance = 1.0
                else:
                    overlap = len(q_tokens & t_tokens)
                    distance = 1.0 - (overlap / max(len(q_tokens), 1))
                ranked.append((distance, doc_id, text, metadata))
            ranked.sort(key=lambda x: x[0])
            safe_n = min(max(1, n_results), len(ranked), 20)
            return [
                {
                    "id": doc_id,
                    "text": text,
                    "distance": float(distance),
                    "metadata": metadata,
                }
                for distance, doc_id, text, metadata in ranked[:safe_n]
            ]
        if self._collection.count() == 0:
            return []
        safe_n = min(n_results, self._collection.count(), 20)
        results = self._collection.query(
            query_texts=[query],
            n_results=safe_n,
            include=["documents", "distances", "metadatas"],
        )
        output = []
        ids = results.get("ids", [[]])[0]
        docs = results.get("documents", [[]])[0]
        distances = results.get("distances", [[]])[0]
        metadatas = results.get("metadatas", [[]])[0]
        for i, doc_id in enumerate(ids):
            output.append(
                {
                    "id": doc_id,
                    "text": docs[i] if i < len(docs) else "",
                    "distance": float(distances[i]) if i < len(distances) else 1.0,
                    "metadata": metadatas[i] if i < len(metadatas) else {},
                }
            )
        return output

    def count(self) -> int:
        if self._mock:
            return len(self._mock_docs)
        return self._collection.count()

    def status(self) -> dict[str, Any]:
        try:
            count = self.count()
            return {"status": "ready", "count": count, "collection": self._collection_name, "provider": "chroma"}
        except Exception as e:
            return {"status": "unavailable", "error": str(e), "provider": "chroma"}

    def delete(self, doc_id: str) -> None:
        if self._mock:
            self._mock_docs.pop(doc_id, None)
            return
        self._collection.delete(ids=[doc_id])

    def seed_from_kg(self, stratagems: list[dict[str, Any]]) -> int:
        """Seed the vector store from KG Stratagem nodes."""
        count = 0
        for s in stratagems:
            text = f"{s.get('name', '')} — category: {s.get('category', '')} — market_bias: {s.get('market_bias', '')}"
            self.add(
                doc_id=s.get("id", f"s_{count}"),
                text=text,
                metadata={
                    "type": "Stratagem",
                    "category": s.get("category", ""),
                    "market_bias": s.get("market_bias", ""),
                },
            )
            count += 1
        return count


class _PgVectorStore:
    def __init__(
        self,
        dsn: str | None = None,
        table_name: str | None = None,
        mock: bool = False,
    ) -> None:
        self._dsn = (dsn or os.getenv("VECTOR_STORE_PGVECTOR_DSN", "")).strip()
        self._table_name = _sanitize_identifier(
            table_name or os.getenv("VECTOR_STORE_PGVECTOR_TABLE", _DEFAULT_PGVECTOR_TABLE),
            _DEFAULT_PGVECTOR_TABLE,
        )
        self._embedding = _SentenceTransformerEmbeddingFunction(mock=mock)

    def _connect(self):
        if not self._dsn:
            raise RuntimeError("VECTOR_STORE_PGVECTOR_DSN is not configured")
        import psycopg

        return psycopg.connect(self._dsn, autocommit=True)

    def _ensure_schema(self) -> None:
        with self._connect() as conn:
            with conn.cursor() as cur:
                cur.execute("CREATE EXTENSION IF NOT EXISTS vector")
                cur.execute(
                    f"""
                    CREATE TABLE IF NOT EXISTS {self._table_name} (
                        id TEXT PRIMARY KEY,
                        content TEXT NOT NULL,
                        metadata JSONB NOT NULL DEFAULT '{{}}'::jsonb,
                        embedding vector({_VECTOR_DIMENSION}) NOT NULL,
                        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                    )
                    """
                )

    def _embed_one(self, text: str) -> list[float]:
        return self._embedding.embed([text])[0]

    def add(self, doc_id: str, text: str, metadata: dict[str, Any] | None = None) -> None:
        from psycopg.types.json import Json

        self._ensure_schema()
        embedding = _vector_literal(self._embed_one(text))
        with self._connect() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    f"""
                    INSERT INTO {self._table_name} (id, content, metadata, embedding, updated_at)
                    VALUES (%s, %s, %s, %s::vector, NOW())
                    ON CONFLICT (id) DO UPDATE SET
                        content = EXCLUDED.content,
                        metadata = EXCLUDED.metadata,
                        embedding = EXCLUDED.embedding,
                        updated_at = NOW()
                    """,
                    (doc_id, text, Json(metadata or {}), embedding),
                )

    def search(self, query: str, n_results: int = 5) -> list[dict[str, Any]]:
        self._ensure_schema()
        safe_n = max(1, min(n_results, 20))
        embedding = _vector_literal(self._embed_one(query))
        with self._connect() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    f"""
                    SELECT id, content, metadata, embedding <=> %s::vector AS distance
                    FROM {self._table_name}
                    ORDER BY embedding <=> %s::vector
                    LIMIT %s
                    """,
                    (embedding, embedding, safe_n),
                )
                rows = cur.fetchall()
        return [
            {
                "id": row[0],
                "text": row[1],
                "metadata": row[2] or {},
                "distance": float(row[3]),
            }
            for row in rows
        ]

    def count(self) -> int:
        self._ensure_schema()
        with self._connect() as conn:
            with conn.cursor() as cur:
                cur.execute(f"SELECT COUNT(*) FROM {self._table_name}")
                row = cur.fetchone()
        return int(row[0]) if row else 0

    def status(self) -> dict[str, Any]:
        try:
            count = self.count()
            return {
                "status": "ready",
                "count": count,
                "provider": "pgvector",
                "table": self._table_name,
            }
        except Exception as e:
            return {
                "status": "unavailable",
                "error": str(e),
                "provider": "pgvector",
                "table": self._table_name,
            }

    def delete(self, doc_id: str) -> None:
        self._ensure_schema()
        with self._connect() as conn:
            with conn.cursor() as cur:
                cur.execute(f"DELETE FROM {self._table_name} WHERE id = %s", (doc_id,))

    def seed_from_kg(self, stratagems: list[dict[str, Any]]) -> int:
        count = 0
        for s in stratagems:
            text = f"{s.get('name', '')} — category: {s.get('category', '')} — market_bias: {s.get('market_bias', '')}"
            self.add(
                doc_id=s.get("id", f"s_{count}"),
                text=text,
                metadata={
                    "type": "Stratagem",
                    "category": s.get("category", ""),
                    "market_bias": s.get("market_bias", ""),
                },
            )
            count += 1
        return count


class VectorStore:
    """Provider-switching vector store facade."""

    def __init__(
        self,
        path: str | None = None,
        collection_name: str = _DEFAULT_COLLECTION,
        mock: bool = False,
        provider: str | None = None,
    ) -> None:
        self._provider = _normalize_provider(provider or os.getenv("VECTOR_STORE_PROVIDER", "chroma"))
        if self._provider == "pgvector":
            self._backend: _VectorBackend = _PgVectorStore(mock=mock)
        else:
            self._backend = _ChromaVectorStore(path=path, collection_name=collection_name, mock=mock)

    def add(self, doc_id: str, text: str, metadata: dict[str, Any] | None = None) -> None:
        self._backend.add(doc_id, text, metadata)

    def search(self, query: str, n_results: int = 5) -> list[dict[str, Any]]:
        return self._backend.search(query, n_results=n_results)

    def count(self) -> int:
        return self._backend.count()

    def status(self) -> dict[str, Any]:
        status = self._backend.status()
        status.setdefault("provider", self._provider)
        return status

    def delete(self, doc_id: str) -> None:
        self._backend.delete(doc_id)

    def seed_from_kg(self, stratagems: list[dict[str, Any]]) -> int:
        return self._backend.seed_from_kg(stratagems)
