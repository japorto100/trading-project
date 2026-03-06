.PHONY: run test vet lint build ci bench bench-streaming

run:
	go run ./cmd/gateway

test:
	go test ./...

vet:
	go vet ./...

lint:
	golangci-lint run ./cmd/... ./internal/...

build:
	go build ./...

bench:
	go test -bench=. -benchmem -benchtime=3s ./internal/...

bench-streaming:
	go test -bench=. -benchmem -benchtime=3s ./internal/services/market/streaming/

# Full CI: test, vet, lint, build (run: make ci)
ci: test vet lint build
