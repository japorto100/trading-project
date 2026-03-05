.PHONY: run test vet lint build ci

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

# Full CI: test, vet, lint, build (run: make ci)
ci: test vet lint build
