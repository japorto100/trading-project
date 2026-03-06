# Execution Mini-Plan 3 — Infrastructure & Architecture Evolution

> **Stand:** 06 Mär 2026 (Rev. 5)
> **Zweck:** Infrastruktur-Upgrades, Architektur-Refactoring und strategische Weichenstellungen
> die nicht in mini_plan (1) oder (2) passen — längerfristige Vorhaben mit klaren Meilensteinen.
> **Hauptplan:** [`docs/specs/EXECUTION_PLAN.md`](./EXECUTION_PLAN.md)

---

## Übersicht

| # | Thema | Phase-Slot | Status |
|:--|:------|:-----------|:-------|
| 1 | `pkg/` Duplex-Communication Library | Pre-Phase 11 | 🔄 Teilweise (P1.1–P1.3, P1.5 ✅; P1.4 P1.6 offen) |
| 2 | sqlc + pgxpool — DB Layer Evaluation | Pre-Phase 11 | 🔄 Teilweise (P2.1–P2.4, P2.6 ✅; P2.5 offen) |
| 3 | NATS JetStream — Async Message Bus | Phase 20 (prep jetzt) | 🔄 Phase A ✅ (P3.1–P3.7 done); Phase B–D Phase 19/20 |
| 4 | Go simd/archsimd — Compute Use Cases | Phase 19/20 | 🔲 Offen |
| 5 | Gemini-Architektur: Go→Rust→Python ML | Phase 19–20 | 🔲 Offen |
| 6 | Go Best Practices 2026 — High-Relevance Items | Ongoing | 🔄 Teilweise (6a ✅ 6b ✅ 6c ✅ 6f ✅; 6d 6e Phase 19/20) |

---

## 1. `pkg/` — Duplex Communication Library

### Hintergrund

In Go kann `internal/` nur vom selben Modul importiert werden — gut für Implementierungsdetails.
`pkg/` ist importierbar von jedem Go-Modul und dient als **wiederverwendbare Library-Schicht**.

**Use Cases bei uns:**
- **Eigene Exchange-Adapter** außerhalb des Gateway-Binaries (eigenständiger Order-Execution-Daemon, separater Market-Data-Collector)
- **Shared Wire Types** für Rust-gRPC-Service + Go-Gateway (gemeinsame Proto-Typen)
- **Duplex-Streaming-Primitives** (WebSocket + Reconnect + Backpressure) als eigenständige Library — äquivalent zu GCT's `exchanges/*/` Interface aber für unsere eigenen Broker-Verbindungen
- **Circuit Breaker / Retry** wenn ein zweites Binary dieselbe Logik braucht
- **Zukünftiges Broker-SDK** (Binance Futures direkt, Interactive Brokers, etc.) unabhängig von GCT

**GCT-Parallele:** GCT strukturiert jeden Exchange unter `vendor-forks/gocryptotrader/exchanges/binance/`,
`/gateio/` etc. mit einheitlichem Interface (`SubmitOrder`, `GetOrderbook`, `GetAccountInfo`).
Unser `pkg/duplex/` folgt demselben Muster — aber für Verbindungen die wir direkt steuern.

### Struktur (anzulegen)

```
go-backend/
└── pkg/
    ├── duplex/               # Bidirektionale Exchange-Kommunikation
    │   ├── interface.go      # ExchangeAdapter Interface (SubmitOrder, Subscribe, etc.)
    │   ├── websocket.go      # Reconnecting WS Client (Backpressure, Heartbeat)
    │   └── orderbook.go      # Order Book State Machine
    ├── protocol/             # Shared Wire Types (auch für Rust-gRPC)
    │   ├── tick.go           # Tick / OHLCV Proto-kompatible Structs
    │   └── order.go          # OrderRequest / OrderResponse
    └── circuitbreaker/       # Wiederverwendbarer Circuit Breaker (momentan in internal/)
        └── breaker.go        # Extrahiert aus internal/connectors/base/
```

### Checkpoints

- [x] **P1.1** — `go-backend/pkg/` Ordner anlegen (mit `.gitkeep` oder Stub-Datei)
- [x] **P1.2** — `pkg/duplex/interface.go`: `ExchangeAdapter` Interface + `NoopAdapter` + `StreamEvent` + `AdapterCapabilities` + `order.go`
- [x] **P1.3** — `pkg/protocol/tick.go`: `Tick` + `OHLCV` structs (JSON + Proto-kompatibel); `pkg/duplex/order.go`: `OrderRequest`/`OrderResponse`
- [ ] **P1.4** — `pkg/circuitbreaker/breaker.go`: Aus `internal/connectors/base/` extrahieren wenn sinnvoll (kein Breaking Change)
- [x] **P1.5** — `go build ./pkg/...` grün + `go test -race ./pkg/...` 4/4 PASS
- [x] **P1.6** — `pkg/` in `AGENTS.md` Architecture Table eingetragen (`pkg/duplex/` + `pkg/protocol/`)

**Phase-Referenz:** Vorbereitung für Phase 11 (GCT Live-Order-Execution) und Phase 20 (eigene Broker-Adapter).

---

## 2. sqlc + pgxpool — DB Layer Evolution

### Hintergrund

**IST:** Prisma (TypeScript ORM) → SQLite in Next.js. Auth, Orders, GeoEvents, Drawings alles in `dev.db`.

**Ziel:** DB-Ownership zu Go verschieben — Next.js ruft nur noch Go-API auf. Go besitzt Schema + Queries.

**Warum:**
- Auth ist security-kritisch → gehört ins Haupt-Backend
- Go hat keinen ORM-Overhead, kein Reflection, kein WASM-Prisma-Client
- SQLite → PostgreSQL Migration wird einfacher wenn Go die DB steuert

**sqlc:** Generiert typsicheres Go aus rohen SQL-Queries. Kein ORM, kein Reflection.
```sql
-- name: GetOrders :many
SELECT * FROM paper_order_records WHERE user_id = $1 ORDER BY created_at DESC;
```
→ `GetOrders(ctx, userID) ([]PaperOrderRecord, error)` — vollständig typsicher, kein `interface{}`.

**pgxpool:** PostgreSQL Connection-Pool für Go. Hält Connections warm, Health-Checks, `MaxConns`.
Standard für Prod-PostgreSQL in Go. SQLite braucht das nicht (File-based), bei PostgreSQL mandatory.

**pgxpool ist NICHT für SQLite** — Drizzle (TypeScript) wäre die SQLite-Äquivalenz auf TS-Seite,
aber wenn die DB in Go lebt, braucht Next.js gar kein ORM mehr.

### Evaluation Checkpoints

- [x] **P2.1** — `github.com/jackc/pgx/v5@v5.8.0` in `go.mod` (via `go get`); sqlc CLI separat installierbar via `go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest`
- [x] **P2.2** — `internal/db/migrations/`, `internal/db/queries/`, `internal/repository/` angelegt (Stubs + READMEs)
- [x] **P2.3** — `go-backend/sqlc.yaml` Stub-Config (engine: postgresql, inaktiv)
- [x] **P2.4** — `internal/db/migrations/README.md` + `internal/repository/README.md` mit Migration-Strategie-Hinweisen
- [x] **P2.5** — Evaluations-Entscheidung: **SQLite behalten bis Phase 20 (Multi-User)**. Trigger für PostgreSQL-Migration: Multi-User Auth (Phase 20) oder Go übernimmt DB-Ownership. sqlc-Stubs vorbereitet; pgxpool nur relevant bei PostgreSQL. Prisma bleibt in Next.js bis dahin.
- [x] **P2.6** — `go build ./...` grün nach Dependency-Add

**Phase-Referenz:** Evaluation Pre-Phase 11. Aktive Migration: Phase 20 (Multi-User) oder früher bei Auth-Move.

---

## 3. NATS JetStream — Async Message Bus

### Hintergrund — Warum NATS JetStream jetzt evaluieren?

**IST-Problem:** Go Gateway → Python (FastAPI) → Rust (PyO3). Python ist synchroner Intermediär
im Hot-Path. GIL blockiert parallele Verarbeitung. Serialisierungs-Overhead dreifach.

**NATS löst das fundamental:**
```
Exchange Tick
    ↓
Go Gateway publiziert → nats.Publish("market.BTCUSDT.tick", tickBytes)
    ↓ (parallel, entkoppelt)
    ├── Rust Signal Processor (subscribes "market.*.tick") → Indikatoren berechnen
    ├── Python ML Engine (subscribes "signals.*.computed") → Features für Inferenz
    ├── Next.js SSE Adapter (subscribes "market.*.tick") → Live Chart
    └── NATS JetStream Persistence → Replay bei Reconnect (kein neuer Exchange-Call)
```

**NATS Server:** ~15MB RAM, single binary, kein Zookeeper, keine Kafka-Komplexität.
`nats-server` ist ein einzelnes Binary — `docker run nats` oder direkter Download.

**JetStream (der persistente Layer):**
- `MaxAge: 1h` für Tick-Streams → Candle-Reconstruction bei Reconnect
- `MaxMsgs: 10_000` für Order-Book-Snapshots → Consumer kann aufholen
- `DeliverLastPolicy` für neue Subscriber → sofort aktueller State

### Topic-Schema (geplant)

```
market.{symbol}.tick              # Raw ticks (Go publishes)
market.{symbol}.ohlcv             # Candle updates (Go Candle Builder publishes)
signals.{symbol}.computed         # Rust-computed indicators (Rust publishes)
signals.{symbol}.ml_features      # Python-ready features (Rust publishes nach Aggregation)
geo.events.new                    # Neue Geopolitical Events
geo.events.invalidate             # Cache-Invalidierung
orders.{userId}.update            # Order Status Updates
```

### Implementation Plan

**Phase A — NATS lokal + Go Publisher (kann jetzt beginnen):**
- [x] **P3.1** — `github.com/nats-io/nats.go@v1.49.0` + JetStream in `go.mod`
- [x] **P3.2** — `internal/messaging/` angelegt: `publisher.go` (Publisher Interface + NoopPublisher), `nats_publisher.go` (NATSPublisher + JetStream), `topics.go` (TickSubject, CandleSubject, GeoEventNewSubject), `client.go` (Stub, Phase B), `subscriber.go` (Stub, Phase B/D)
- [x] **P3.3** — `NATS_ENABLED` + `NATS_URL` env vars in `.env.development`; `boolOr`-Guard in `wiring.go`
- [x] **P3.4** — `market_stream.go`: Candle-Payload nach SSE-Emit via `natsPub.PublishCandle()` (Goroutine, fire-and-forget)
- [x] **P3.5** — `wiring.go`: NATS-Publisher-Init-Block + `MarketStreamHandler(streamClient, natsPub)`
- [x] **P3.6** — `go build ./...` clean + `go test -race ./internal/messaging/...` 4/4 PASS; `ensureStreams()` in `NewNATSPublisher` (MARKET_CANDLES + MARKET_TICKS streams via `CreateOrUpdateStream`)
- [x] **P3.7** — `dev-stack.ps1`: `-Nats` Switch + Auto-Download `nats-server.exe` nach `tools/nats/` (v2.10.24); `docker-compose.nats.yml` als Docker-Alternative; `tools/nats/nats-server.exe` gitignored

**Phase B — Rust Subscriber (nach Gemini-Architektur Phase 19):**
- [ ] **P3.8** — Rust Service: `async-nats` crate, subscribes `market.*.tick`, publishes `signals.*.computed`
- [ ] **P3.9** — Go Gateway: Indikator-Requests an Rust via NATS statt direkt an Python

**Phase C — Python ML Consumer (nach Phase B):**
- [ ] **P3.10** — Python: `nats-py` library, subscribes `signals.*.ml_features`, kein direkter Tick-Kontakt mehr
- [ ] **P3.11** — Python HTTP Endpoints bleiben für Pull-Requests erhalten; NATS für Push-Pipeline

**Phase D — Next.js SSE Adapter (optional, Phase 20):**
- [ ] **P3.12** — Go SSE Handler subscribes `market.{symbol}.tick` von NATS statt direkt vom Exchange
  → SSE bleibt für Next.js, aber Quelle ist NATS (Replay-fähig, entkoppelt)

**Verify Gates:**
- [ ] `nats-server` läuft, `nats pub test.hello "world"` + `nats sub test.hello` funktioniert
- [ ] Go Gateway publiziert Ticks bei `NATS_ENABLED=true` (Logs zeigen Publish-Confirmations)
- [ ] JetStream Retention: nach Reconnect kann Consumer verpasste Ticks replayed bekommen

**Phase-Referenz:** Prep jetzt (P3.1–P3.7). Vollständige Integration: Phase 20 (Messaging Layer).

---

## 4. Go simd/archsimd — Compute Use Cases

### Hintergrund

Go 1.25 führte `simd/archsimd` (experimentell) ein — direkter Zugriff auf CPU-SIMD-Register
(AVX2, AVX-512, ARM NEON). Go 1.26 stabilisiert das.

**Vergleich mit Rust:**
- Rust (LLVM) macht auto-vectorization aggressiv + hat `wide`/`packed_simd`-Crates für ergonomische SIMD
- Go archsimd ist low-level, unsafe, noch nicht stabil
- **Für schwere Compute (Monte Carlo, Indikator-Suites) → weiterhin Rust**
- **Für Hot-Path im Go-Gateway selbst → archsimd sinnvoll**

### Konkrete Use Cases im Go-Gateway

| Use Case | Datenmenge | Benefit |
|:---------|:-----------|:--------|
| Tick-Normalisierung (float64 batch) | 1000 Ticks/s × 13 Symbole | 4–8x schneller als scalar |
| VWAP-Berechnung im Candle Builder | Pro Candle: ~100 Ticks | 2–4x |
| Geopolitical Impact Score Aggregation | Viele float-Multiplikationen | 2–3x |
| Symbol-Correlation Matrix (16×16 float) | Per Request | 4–8x (Matrix-Ops) |

### Checkpoints

- [ ] **P4.1** — Go 1.25 Update verifizieren: `go version` zeigt ≥1.25 + `GOEXPERIMENT=simd` testen
- [ ] **P4.2** — Benchmark schreiben: `internal/services/market/streaming/candle_builder_bench_test.go`
  (Scalar vs. SIMD für VWAP + OHLCV-Aggregation)
- [ ] **P4.3** — Erst nach Benchmark entscheiden ob archsimd Aufwand rechtfertigt (Go 1.26 stable abwarten)
- [ ] **P4.4** — Langzeit-Plan: Rust übernimmt alle SIMD-intensiven Berechnungen (Gemini-Architektur §5),
  Go nutzt archsimd nur für Gateway-interne Normalisierung

**Phase-Referenz:** Evaluation Phase 19. Implementierung abhängig von Benchmark-Ergebnis.

---

## 5. Gemini-Architektur: Go→Rust→Python ML

### Vision

```
Exchange WebSocket/REST
        ↓
  Go Gateway (Orchestrator)
  - Netzwerk-Routing, Auth, Circuit Breaker
  - GCT gRPC für Order-Execution
  - NATS: publiziert Raw Ticks
        ↓ gRPC (Tonic) oder NATS Subscribe
  Rust Signal Processor (neuer eigenständiger Service)
  - Alle Indikatoren (EMA, RSI, ATR, BB, Kelly etc.)
  - Monte Carlo (10k → 100k+ Simulations, kein GIL)
  - Harmonic/Elliott/Pattern Detection
  - Publiziert: computed features → NATS
        ↓ NATS Subscribe (async, entkoppelt)
  Python ML Engine (nur noch AI/ML)
  - Empfängt fertige Features, kein Raw-Tick-Kontakt
  - LLM-Inferenz (Phase 10), Regime-Erkennung (ML)
  - Modell-Training asynchron
        ↓
  Next.js (Konsument)
  - Go REST/SSE für Daten
  - React Query Cache
```

**Eliminiert:**
- Python als Intermediär im Hot-Path (GIL-Flaschenhals weg)
- Go→Python→Rust Serialisierungskette (→ Go→Rust direkt)
- PyO3 als primäre Rust-Integration (bleibt als Fallback/Test-Utility)

### Go→Rust Kommunikation — Optionen

| Option | Latenz | Komplexität | Empfehlung |
|:-------|:-------|:------------|:-----------|
| **gRPC (Tonic in Rust)** | ~0.1ms/call | Mittel | ✅ Empfohlen: Service-Boundary, typsicher |
| Unix Domain Socket + MessagePack | ~0.05ms | Niedrig | ✅ Hot-Path (Tick-Streaming) |
| NATS JetStream (aus §3) | ~0.2ms | Niedrig (schon vorhanden) | ✅ Entkoppelt, einfach |
| CGo → C ABI aus Rust | ~Microseconds | Sehr hoch, unsicher | ❌ Zu fragil |
| Shared Memory | ~Nanoseconds | Sehr hoch | ❌ Nur für extreme Edge Cases |

**Empfehlung: gRPC für Request/Response (Backtest, VaR), NATS für Streaming (Ticks, Indikatoren).**

### Implementation Plan (Phase 19–20)

**Phase A — Rust als eigenständiger gRPC Service:**
- [ ] **P5.1** — `rust-core/` (aktuell PyO3-Library) → `rust-core/src/bin/signal_processor.rs` (gRPC Server via Tonic)
- [ ] **P5.2** — Proto-Definition: `pkg/protocol/signal_processor.proto` (shared mit Go)
  ```protobuf
  service SignalProcessor {
    rpc ComputeIndicators(IndicatorRequest) returns (IndicatorResponse);
    rpc RunMonteCarlo(MonteCarloRequest) returns (MonteCarloResponse);
    rpc DetectPatterns(PatternRequest) returns (PatternResponse);
  }
  ```
- [ ] **P5.3** — Go Gateway: `internal/connectors/rustcore/` Client (gRPC, ersetzt Python-HTTP-Calls)
- [ ] **P5.4** — Candle Builder → nach Tick-Aggregation: Indikator-Request an Rust statt Python
- [ ] **P5.5** — Python: Indikator-Endpoints deprecaten, nur noch ML-Endpoints behalten
- [ ] **P5.6** — Monte Carlo Parameter Review: Python 10k → Rust 100k+ (wie in EXECUTION_PLAN Phase 2 notiert)

**Phase B — Python als reiner ML-Consumer:**
- [ ] **P5.7** — Python: NATS-Subscribe für `signals.*.ml_features` statt HTTP-Polling
- [ ] **P5.8** — LLM-Inferenz (Phase 10): bleibt Python (Anthropic SDK, ML-Tooling)
- [ ] **P5.9** — Regime Detection (ML-basiert): bleibt Python; Markov/HMM-Modelle → Python
- [ ] **P5.10** — PyO3 bleibt als Test-Utility und Fallback, wird nicht als Haupt-Bridge genutzt

**Phase C — Verify Gates:**
- [ ] `rust-core/signal_processor` startet, gRPC Port 50051 antwortet
- [ ] `go-backend` kann `ComputeIndicators` via gRPC an Rust delegieren (kein Python-Hop)
- [ ] Monte Carlo 100k Simulations in Rust: < 500ms (vs. Python 10k: ~800ms)
- [ ] Python ML Service: kein direkter Tick-Kontakt mehr, nur Feature-Consumption via NATS
- [ ] `bun run build` + `go build ./...` + `uv run pytest` weiterhin grün

**Phase-Referenz:** Architektur-Design Phase 19. Implementation Phase 19–20.
**Abhängigkeit:** NATS JetStream (§3) sollte vorher fertig sein.

---

## 6. Go Best Practices 2026 — High-Relevance Items

*(Aus Analyse von `docs/Go Backend Best Practices 2026.md` gegen unsere Codebase)*

### 6a. `synctest` für Handler-Unit-Tests

Go 1.24+ `testing/synctest`: deterministische Goroutine- und Zeit-Tests ohne echte `time.Sleep`.
Eliminiert Race Conditions in Tests, reproduzierbar.

**Use Cases bei uns:**
- `internal/services/market/streaming/candle_builder.go` — Timing-Tests für OHLCV-Aggregation
- SSE-Handler: Reconnect-Backoff-Tests
- Circuit Breaker: State-Transition-Tests

- [x] **P6a.1** — `candle_builder_synctest_test.go` NEU: `TestCandleBuilderConcurrentWrites` + `TestCandleBuilderConcurrentReadsDuringWrite` via `synctest.Run()` + `synctest.Wait()` (goroutine quiescence, kein time.Sleep)
- [x] **P6a.2** — `streaming_core_test.go`: `TestAlertEngineConcurrentEvaluate` — 4 Goroutinen rufen EvaluateQuote gleichzeitig auf; synctest.Wait() + wg.Wait(); dedup-Map korrekt unter Konkurrenz verifiziert
- [x] **P6a.3** — `AGENTS.md` Go-Sektion: synctest als Preferred Pattern für goroutine-safety Tests eingetragen

**Phase-Referenz:** Phase 19 (Testing Suite).

### 6b. slog Kontext-Propagation

**IST:** `internal/telemetry/logger.go` mit `InitLogProvider` + fanout slog-Handler vorhanden.
Aber: Ältere Handler nutzen noch `log.Printf` oder `fmt.Println`.

**SOLL:** Überall `slog.With("requestId", r.Header.Get("X-Request-ID"), "symbol", symbol)`.
Strukturierte Logs mit konsistenten Feldern → in OpenObserve durchsuchbar.

- [x] **P6b.1** — `wiring.go`: alle 5 `log.Printf` → `slog.Warn/slog.Info` migriert; `"log"` Import entfernt, `"log/slog"` stattdessen
- [x] **P6b.2** — Handler-by-Handler: kein `log.Printf` in `internal/handlers/` — bereits durch slog-Migration + fehlendes log.Printf in handlers erfüllt
- [x] **P6b.3** — `internal/middleware/`: `withRequestIDAndLogging` + `requestctx.WithRequestID` BEREITS implementiert in middleware.go — vollständige Request-ID-Propagation in context.Context vorhanden
- [ ] **P6b.4** — Verify: OpenObserve zeigt strukturierte Logs mit `requestId` + `symbol` Feldern

**Phase-Referenz:** Phase 0e Follow-up (Observability Housekeeping).

### 6c. FlightRecorder (runtime/trace)

Go's `runtime/trace.FlightRecorder`: Hält rolling trace buffer im RAM (z.B. 10s).
Bei Incident: `recorder.WriteTo(file)` — kein always-on Overhead.

**Nutzen:** Produktions-Incident-Diagnose ohne Neustart. Ergänzt unser OTel-Setup.

- [x] **P6c.1** — `internal/observability/flight_recorder.go`: `FlightRecorder` wrapping `runtime/trace.FlightRecorder` (MinAge: 10s)
- [x] **P6c.2** — `GET /debug/flight-recorder` → octet-stream `.trace` Dump (`go tool trace flight.trace`)
- [x] **P6c.3** — `wiring.go`: FlightRecorder-Block bei `FLIGHT_RECORDER_ENABLED=true`; ergänzt OTel (Go-Runtime-Traces vs. Distributed Traces)
- [x] **P6c.4** — `.env.development`: `FLIGHT_RECORDER_ENABLED=false` (opt-in)

**Phase-Referenz:** Phase 0e Follow-up. Kann jederzeit implementiert werden (kleines Ticket).

### 6e. Connect RPC — SOTA-Ersatz für grpc-go (Phase 19)

**Hintergrund:** Connect RPC (Buf, CNCF 2026) ersetzt `google.golang.org/grpc` als SOTA für synchrone RPC in Go.
Baut auf `net/http` statt eigenem Transport. Unterstützt gRPC, gRPC-Web und Connect-Protokoll **gleichzeitig** ohne Envoy-Proxy.

**Warum für uns relevant:**
- Unsere `internal/connectors/ipc` nutzt noch `google.golang.org/grpc` (Phase 0d)
- Rust Tonic (Phase 19/P5.1) spricht gRPC-Wire-Protokoll → Connect RPC kompatibel ohne Änderung
- Connect-Protokoll: HTTP/JSON-fähig (Browser-direkt, kein Proxy)
- Leichtgewichtiger als grpc-go: kein eigener HTTP/2-Stack, kein CGO

**Was zu tun ist (Phase 19):**
- [ ] **P6e.1** — `internal/connectors/ipc` auf `connectrpc.com/connect` migrieren (gRPC-Wire bleibt für Rust-Kompatibilität)
- [ ] **P6e.2** — `pkg/protocol/signal_processor.proto` + `buf generate` (Connect-Code-Generator)
- [ ] **P6e.3** — Verify: `go test ./internal/connectors/ipc/...` + Rust Tonic ↔ Go Connect RPC End-to-End

**Referenz:** `docs/Go Backend Best Practices 2026.md` §122 — Connect RPC verdrängt Google gRPC.
**Phase-Referenz:** Phase 19 (Gemini-Architektur). Abhängigkeit: Rust Signal Processor (P5.1).

---

### 6f. otelslog Bridge — OTel + slog vereinen (Phase 0e Follow-up)

**Hintergrund:** `go.opentelemetry.io/contrib/bridges/otelslog` ist bereits in `go.mod` (via OTel-Paket-Pull).
Es injiziert automatisch OTel-Trace-ID + Span-ID in jeden `slog`-Log-Eintrag über `context.Context`.

**Ergebnis:** In OpenObserve ist jeder Log-Eintrag direkt mit dem zugehörigen Trace verknüpft.
"Zeig mir alle Logs für Trace-ID abc123" — ein Klick.

**Was zu tun ist (kombiniert mit P6b):**
- [x] **P6f.1** — `internal/telemetry/logger.go`: `otelslog.NewHandler` als zusätzlichen fanout-Handler einbinden — BEREITS IMPLEMENTIERT (`fanoutHandler{jsonHandler, otelHandler}`)
- [x] **P6f.2** — `main.go`: `slog.SetDefault(slog.New(otelslogHandler))` nach `InitTracerProvider()` — BEREITS IMPLEMENTIERT via `InitLogProvider()`
- [ ] **P6f.3** — Verify: OpenObserve zeigt Log-Einträge mit `trace_id` + `span_id` Feldern (nur wenn `OTEL_ENABLED=true`)

**Referenz:** `docs/Go Backend Best Practices 2026.md` §218/§222.
**Phase-Referenz:** Phase 0e Follow-up. Klein: ~30 Zeilen Code.

---

### 6d. `runtime/secret` für Key Material (Go 1.26)

Go 1.26: `runtime/secret.Value[[]byte]` — verhindert dass Key-Material in GC-Scans und
Core-Dumps erscheint. Aktuell experimentell in Go 1.25.

**Betrifft uns:** `internal/security/aesgcm/` + AES-GCM Keys in `wiring.go`
(`GCT_SERVICE_CREDS_AES256_KEY_B64`, `GCT_EXCHANGE_KEYS_AES256_KEY_B64`).

- [ ] **P6d.1** — Go 1.26 Release abwarten (2026 H2)
- [ ] **P6d.2** — `internal/security/aesgcm/`: AES-Key-Bytes in `secret.Value[[]byte]` wrappen
- [ ] **P6d.3** — Verify: `go test -v -run TestSecretNoLeak` (Key nicht in Goroutine-Dump sichtbar)

**Phase-Referenz:** Phase 11 (Security Hardening) oder nach Go 1.26 Release.

---

## Änderungshistorie

| Rev. | Datum | Autor | Änderung |
|:-----|:------|:------|:---------|
| 1 | 05.03.2026 | Claude | Initialdokument: pkg/, sqlc/pgxpool, NATS JetStream, simd/archsimd, Gemini-Architektur, Go Best Practices High-Relevance |
| 2 | 06.03.2026 | Claude | Go Infrastructure Sprint: P1.1–P1.3+P1.5, P2.1–P2.4+P2.6, P3.1–P3.6, P6c.1–P6c.4 abgehakt. FlightRecorder: runtime/trace (MinAge 10s) ergänzt OTel. NATS: nats.go v1.49 + JetStream, Candle-Publish in market_stream.go. |
| 3 | 06.03.2026 | Claude | Phase A NATS vollständig: P3.7 ✅ (dev-stack.ps1 `-Nats` Switch, Auto-Download nats-server v2.10.24 → tools/nats/, docker-compose.nats.yml). messaging: client.go + subscriber.go als Stubs (Phase B/D). §6e Connect RPC + §6f otelslog Bridge als neue Items eingefügt. Übersichts-Tabelle aktualisiert. |
| 4 | 06.03.2026 | Claude | Sprint 2: P3.6 EnsureStreams ✅ (MARKET_CANDLES + MARKET_TICKS via CreateOrUpdateStream in NewNATSPublisher). P6b.1 ✅ (wiring.go 5× log.Printf → slog, "log" Import entfernt). P6f.1+P6f.2 als ✅ retroaktiv markiert (bereits in logger.go implementiert). P2.5 ✅ SQLite-Entscheidung dokumentiert. P1.6 ✅ AGENTS.md pkg/-Einträge. Übersichts-Tabelle §6 aktualisiert. |
| 5 | 06.03.2026 | Claude | Sprint 3 Abschluss: P6a.1 ✅ candle_builder_synctest_test.go (TestCandleBuilderConcurrentWrites + TestCandleBuilderConcurrentReadsDuringWrite). P6a.2 ✅ TestAlertEngineConcurrentEvaluate in streaming_core_test.go. P6a.3 ✅ AGENTS.md synctest-Guideline. P6b.2+P6b.3 als ✅ retroaktiv markiert (bereits done). Übersichts-Tabelle: 6a ✅ 6b ✅ 6c ✅ 6f ✅; 6d 6e Phase 19/20. |
