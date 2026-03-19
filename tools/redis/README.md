# Redis (local Windows compatibility shim)

This folder is the local Windows cache path for development.

Why it exists:

- upstream `Valkey` does not currently provide a straightforward native Windows
  server binary for this repo workflow
- local development still benefits from a native cache server on Windows
- production and target-state remain `Valkey`

Current repo contract:

- `scripts/dev-stack.ps1` starts `tools/redis/redis-server.exe` by default
- `-SkipRedis` disables it
- `-SkipValkey` remains accepted as a compatibility alias
- runtime env defaults in local development point to `redis://127.0.0.1:6379/0`

Download helper:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\redis\download.ps1
```

Default source:

- `https://github.com/tporadowski/redis/releases/tag/v5.0.14.1`

Runtime config:

- config: `tools/redis/redis.conf`
- data dir: `tools/redis/data`
- port: `6379`
