# Python Ingest Workers

Logical target module for asynchronous ingest, chunking, embedding and indexing.

Current intended ownership:

- future fetch / parse / normalize workers
- chunk / embed / graph-extract jobs
- document and media indexing pipelines
- RAG / GraphRAG ingestion paths that should not live inside the compute module

Current repo rule:

- this is a structure anchor only
- no always-on service split is forced yet
- runtime stays in the shared `python-backend` until worker-specific scaling or
  dependencies justify a real separation

## Memory Write Path (Phase 23+ target)

When ingest workers are implemented, this module owns the **write path** for memory
persistence. The read/retrieve path remains in `python-agent`.

### Architecture split

| Operation | Owner (current) | Owner (target) |
|---|---|---|
| `VectorStore.add()`, `seed_from_kg()` | python-agent/memory_engine | **python-ingest-workers** |
| `KGStore.seed()`, node/edge creation | python-agent/memory_engine | **python-ingest-workers** |
| `VectorStore.search()` | python-agent/memory_engine | python-agent (stays) |
| `KGStore.query()`, `get_nodes()` | python-agent/memory_engine | python-agent (stays) |

### Dependency direction

```
python-ingest-workers → python-agent  (imports VectorStore + KGStore write methods)
python-agent          → (no dep on ingest-workers)
```

`python-ingest-workers/pyproject.toml` will declare:
```toml
dependencies = [
    "tradeview-fusion-python-agent",  # VectorStore.add(), KGStore.seed()
    "tradeview-fusion-python-backend",
]
```

### Vector store providers

| Provider | Use case | Env |
|---|---|---|
| `chroma` | Dev default, lightweight local | `VECTOR_STORE_PROVIDER=chroma` |
| `lancedb` | Production default, Arrow-based, hybrid vector+BM25 | `VECTOR_STORE_PROVIDER=lancedb` |
| `pgvector` | Multi-instance / high-throughput Docker | `VECTOR_STORE_PROVIDER=pgvector` |

### KG store providers

| Provider | Use case | Env |
|---|---|---|
| `kuzu` | Dev + prod default, embedded graph DB, Cypher | `KG_PROVIDER=kuzu` |
| `sqlite` | Fallback if Kuzu build fails (Windows native) | `KG_PROVIDER=sqlite` or `KG_FORCE_SQLITE=true` |
| `falkordb` | Docker, Redis-protocol, scalable | `KG_PROVIDER=falkordb` |
