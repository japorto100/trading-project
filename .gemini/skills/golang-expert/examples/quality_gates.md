# Go Quality Gates

Use this order for meaningful backend changes:

1. `golangci-lint run ./...`
2. `go build ./...`
3. `go test ./...`
4. `go test -race ./...`
5. `govulncheck ./...`

For large repositories:

- group tests by package families instead of forcing a single `./...` pass
- keep grouped commands stable so they are easy to rerun
- do not skip `govulncheck`; standard library CVEs often resolve via toolchain patch upgrades

High-signal findings worth fixing early:

- `wrapcheck`
- `errorlint`
- `fatcontext`
- `gosec`
- `spancheck`
- `loggercheck`
- `sqlclosecheck`
- `modernize`
