# FalkorDB Local Notes

- Preferred local path for now: `docker compose -f docker-compose.data.yml up -d falkordb`
- RESP endpoint: `127.0.0.1:6381`
- Optional UI/HTTP endpoint (image-dependent): `http://127.0.0.1:3001`

This directory exists so the local target-state stack has a stable repo-owned
home under `tools/`, even though FalkorDB is currently started via Docker
instead of a native Windows binary.
