"""ChromaDB-backed vector store with sentence-transformers embeddings.

DB path: python-backend/data/chroma/ (auto-created)
Embedding model: all-MiniLM-L6-v2 (~23 MB, downloaded once, then cached)
Mock fallback for tests: set VECTOR_STORE_MOCK=true
"""
from __future__ import annotations

import os
from pathlib import Path
from typing import Any

_DEFAULT_CHROMA_PATH = str(Path(__file__).resolve().parents[2] / "data" / "chroma")
_MODEL_NAME = "all-MiniLM-L6-v2"


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


class VectorStore:
    def __init__(
        self,
        path: str | None = None,
        collection_name: str = "memory",
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
            from chromadb.utils.embedding_functions import (  # type: ignore[import-untyped]
                SentenceTransformerEmbeddingFunction,
            )
            ef = SentenceTransformerEmbeddingFunction(model_name=_MODEL_NAME)

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
            return {"status": "ready", "count": count, "collection": self._collection_name}
        except Exception as e:
            return {"status": "unavailable", "error": str(e)}

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
