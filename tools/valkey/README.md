# Valkey (future target-state path)

This folder remains reserved for the actual `Valkey` target state.

Current usage:

- `docker-compose.data.yml` contains the optional `valkey` service for later
  local bring-up
- host-native Windows development currently uses `tools/redis/` instead
- production target state remains `Valkey`

Files kept here:

- `valkey.conf` for the future container/native target-state path
- optional placeholders for later Valkey-specific tooling

Local Windows note:

- use `tools/redis/` for the native compatibility path
- do not treat that Redis shim as a production decision
