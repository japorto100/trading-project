# Postgres + pgvector Local Notes

- Preferred local path for now: `docker compose -f docker-compose.data.yml up -d postgres-pgvector`
- Endpoint: `127.0.0.1:5432`
- Default DB: `tradeviewfusion`
- Default user: `tradeview`

The init script in `init/001_extensions.sql` ensures the `vector` extension is
available immediately for local experiments and future provider wiring.
