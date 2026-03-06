# Execution Mini-Plan 3 — Infrastructure & Architecture Evolution

> **Stand:** 06 Mär 2026 (Rev. 10)
> **Zweck:** Infrastruktur-Upgrades, Architektur-Refactoring und strategische Weichenstellungen
> die nicht in mini_plan (1) oder (2) passen — längerfristige Vorhaben mit klaren Meilensteinen.
> **Hauptplan:** [`docs/specs/EXECUTION_PLAN.md`](./EXECUTION_PLAN.md)

---

## ⚠️ TODO: Live-Verify-Gates — sofort ausführen sobald Stack läuft

**Schritt 1 — Env aktivieren** (`go-backend/.env.development`):
```
NATS_ENABLED=true           # Zeile 137 (war: false)
FLIGHT_RECORDER_ENABLED=true  # Zeile 142 (war: false)
# OTEL_ENABLED=true         # bereits true ✅
```

**Schritt 2 — Stack starten:**
```powershell
.\scripts\dev-stack.ps1 -SkipGCT -SkipNext
# Startet: Go-Gateway (:9060) + Python-Services + OpenObserve (:5080/5081) + NATS (:4222)
# Skipped: GCT (eigene Baustelle), Next.js (nicht nötig für Backend-Gates)
# Alles andere läuft per Default. Weitere Flags: -SkipGo -SkipPython -SkipNats -SkipObservability
```

**Schritt 3 — Gates verifizieren (in Reihenfolge):**

- [x] **P7f** FlightRecorder: `curl http://localhost:9060/debug/flight-recorder` → `.trace`-Download
- [x] **P3** NATS Pub/Sub: `nats pub test.hello "ping"` + NATS-Monitor `:8222` zeigt Verbindung
- [x] **P3** Go publiziert Ticks: Log zeigt `published tick` o.ä. wenn Symbol aktiv
- [x] **P7g** TraceContext in NATS: Header `traceparent` in NATS-Nachricht sichtbar (NATS CLI `nats sub market.>` + Hex-Dump)
- [x] **P6b.4** OpenObserve `:5080` → Logs mit `requestId` + `symbol` sichtbar
- [x] **P6f.3** OpenObserve `:5080` → Logs mit `trace_id` + `span_id` sichtbar (OTel→OO)

**Nach Verify:** Env-Werte wieder auf `false` setzen oder in `.env.local` auslagern (nicht ins Repo committen).

---

## Übersicht

| # | Thema | Phase-Slot | Status |
|:--|:------|:-----------|:-------|
| 1 | `pkg/` Duplex-Communication Library | Pre-Phase 11 | ✅ CODE-COMPLETE (06.03.2026) |
| 2 | sqlc + pgxpool — DB Layer Evaluation | Pre-Phase 11 | 🔄 Teilweise (P2.1–P2.4, P2.6 ✅; P2.5 offen) |
| 3 | NATS JetStream — Async Message Bus | Phase 20 (prep jetzt) | 🔄 Phase A ✅ (P3.1–P3.7 done); Phase B–D Phase 19/20 |
| 4 | Go simd/archsimd — Compute Use Cases | Phase 19/20 | 🔲 Offen (P4.1 aktualisiert: go 1.26 vorhanden) |
| 5 | Gemini-Architektur: Go→Rust→Python ML | Phase 19–20 | 🔲 Offen |
| 6 | Go Best Practices 2026 — High-Relevance Items | Ongoing | 🔄 Teilweise (6a ✅ 6b ✅ 6c ✅ 6f ✅; 6d offen; 6e Phase 19/20) |
| 7 | Sprint 4 — Go 1.26 Upgrade, Benchmarks, Code Quality | Sprint 4 | ✅ CODE-COMPLETE (06.03.2026) |

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
- [x] **P1.4** — `pkg/circuitbreaker/breaker.go`: Generischer `Breaker[R]` Wrapper um failsafe-go (nicht HTTP-spezifisch) für NATS/gRPC/Custom-Adapter. `failsafe.With[R](cb).WithContext(ctx).Get(fn)`. Tests: 3/3 PASS.
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

- [x] **P4.1** — Go 1.26 installiert (`go version go1.26.0 windows/amd64`). `go.mod` zeigt noch `go 1.25` → Update auf `go 1.26` in Sprint 4 (P7a.1). `GOEXPERIMENT=simd` verfügbar.
- [x] **P4.2** — `BenchmarkVWAP` + `BenchmarkVWAPBatch` in `candle_builder_bench_test.go`: Scalar-Baseline VWAP (Σ price×vol / Σ vol). 100 Ticks: **1432 ns/op (0 allocs)**, 1000 Ticks: **14267 ns/op (~14 ns/tick)**. Linear scaling. SIMD lohnt erst bei > 200 ns/tick — aktuell nicht der Fall.
- [ ] **P4.3** — GOEXPERIMENT=simd: `math/simd` API evaluieren; nur implementieren wenn Scalar-VWAP > 200 ns/op und Speedup > 3×. Sonst: Rust für schwere Compute (Gemini §5).
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

- [x] **P6d.1** — Go 1.26 ist installiert (`go1.26.0`). `GOEXPERIMENT=runtimesecret` verfügbar. Plattform-Note: Effektiv nur auf `linux/amd64` + `linux/arm64`; Windows-Dev: `secret.Do()` = passthrough (kein Panic, kein Crash). Impl. via Sprint 4 P7e.
- [x] **P6d.2** — `secure_env_decrypt_secret.go` wraps AES-Decrypt in `secret.Do()` under GOEXPERIMENT=runtimesecret build tag; nosecret fallback file for default builds
- [ ] **P6d.3** — Verify: `go test -v -run TestSecureEnv ./internal/app/...` grün + auf Linux: Key nicht in `/proc/mem` Dump sichtbar

**Phase-Referenz:** Sprint 4 (P7e). Vollständig aktiv auf Linux-Prod (Phase 11).

---

---

## 7. Sprint 4 — Go 1.26 Upgrade, Benchmarks, Code Quality

*(Aus Gap-Analyse: go-gateway vs SOTA 2026, 06. Mär 2026)*

### Architectural Decisions Confirmed (Sprint 4 Review)

- [x] **Next.js ↔ Go**: REST over HTTP bleibt (Next.js Route Handlers als BFF-Proxy). Connect RPC / tRPC für Browser nicht notwendig. SOTA 2026: REST ist Standard, tRPC nur sinnvoll in Full-TypeScript-Monorepos.
- [x] **HTTP Router**: `http.NewServeMux()` ist SOTA für Go 1.22+ (kein Chi nötig). Chi nur wenn route-group-spezifische Middleware oder komplexes URL-Parameter-Routing nötig — beides haben wir nicht.
- [x] **Connect RPC Scope**: Nur Go↔Rust (Phase 20, P6e) + optional IPC-Migration. Nicht für Next.js↔Go.
- [x] **Green Tea GC**: Go 1.26 aktiviert automatisch (kein GOEXPERIMENT nötig). 10-50% weniger GC-CPU, kürzere STW-Pausen. Aktiviert via `go 1.26` in go.mod.
- [x] **OTel + NATS**: Ergänzen sich via W3C TraceContext in NATS-Headers (P7g). HTTP-Request → NATS Publish → Subscriber als zusammenhängende Trace-Kette in OpenObserve.
- [x] **synctest SOTA**: Für Korrektheit (race-free, dedup) = done (P6a). Für Performance = Benchmarks (P7b). synctest ist Determinismus-Tool, nicht Perf-Tool.
- [x] **simd GOEXPERIMENT**: In Go 1.26 verfügbar. Erst nach Benchmark-Analyse (P7b + P4.2) entscheiden.

---

### 7a. go.mod → go 1.26

**Warum:** Green Tea GC wird Default, `runtime/secret` (P7e) und `simd` (P4.3) GOEXPERIMENTs aktivierbar. `go.mod` zeigt noch `go 1.25`.

- [x] **P7a.1** — `go-backend/go.mod`: `go 1.25` → `go 1.26`
- [x] **P7a.2** — `go build ./...` + `go vet ./...` clean (keine neuen Deprecation-Warnings)
- [x] **P7a.3** — `go test -race ./internal/...` weiterhin grün

**Verify Gate:**
- [ ] `go version` im Binary-Output zeigt `go1.26`
- [ ] Green Tea GC aktiv (Default, kein GOEXPERIMENT) — messbar via GODEBUG=gccheckmark=1 in Tests

---

### 7b. Benchmarks — CandleBuilder Hot Path

**Hintergrund:** Zero `BenchmarkXxx`-Funktionen in `go-backend/internal/` (GitNexus-Cypher bestätigt). Keine Performance-Baseline vorhanden. `BenchmarkApplyTickParallel` macht Lock-Contention sichtbar: wenn Parallel-Score deutlich schlechter als Single-Thread → Shard-Lock oder `sync.Map` evaluieren.

**Datei:** `go-backend/internal/services/market/streaming/candle_builder_bench_test.go`

```go
// BenchmarkApplyTick — Single-threaded throughput
func BenchmarkApplyTick(b *testing.B) {
    builder, _ := NewCandleBuilder("1m", CandleBuilderOptions{MaxCandles: 1024})
    b.ResetTimer()
    for i := range b.N {
        builder.ApplyTick(Tick{Timestamp: int64(i%60) + 1, Last: 100.5})
    }
}

// BenchmarkApplyTickParallel — Lock-Contention unter Goroutinen
func BenchmarkApplyTickParallel(b *testing.B) {
    builder, _ := NewCandleBuilder("1m", CandleBuilderOptions{MaxCandles: 1024})
    b.RunParallel(func(pb *testing.PB) {
        i := int64(0)
        for pb.Next() {
            builder.ApplyTick(Tick{Timestamp: i%60 + 1, Last: 100.5})
            i++
        }
    })
}

// BenchmarkSnapshot — Read-Pfad (RLock)
func BenchmarkSnapshot(b *testing.B) {
    builder, _ := NewCandleBuilder("1m", CandleBuilderOptions{MaxCandles: 1024})
    for i := range 100 {
        builder.ApplyTick(Tick{Timestamp: int64(i)*60 + 1, Last: float64(100 + i)})
    }
    b.ResetTimer()
    for range b.N {
        _ = builder.Snapshot(100)
    }
}
```

**pprof Workflow:**
```bash
# Benchmarks mit Baseline
go test -bench=. -benchmem -benchtime=3s ./internal/services/market/streaming/
# CPU-Profil
go test -bench=BenchmarkApplyTick -cpuprofile=cpu.prof ./internal/services/market/streaming/
go tool pprof -http=:8080 cpu.prof
```

- [x] **P7b.1** — `candle_builder_bench_test.go` anlegen: `BenchmarkApplyTick`, `BenchmarkApplyTickParallel`, `BenchmarkSnapshot`
- [x] **P7b.2** — Baseline dokumentieren in `docs/PERFORMANCE_BASELINE.md` (ns/op, allocs/op, B/op): ApplyTick=72ns, Parallel=188ns (2.6× ratio!), Snapshot=1367ns/1alloc
- [x] **P7b.3** — Auswertung: Ratio 2.6× > 2× Threshold → Shard-Lock Phase 19 empfohlen
- [x] **P7b.4** — pprof CPU-Profil ausgewertet: `lockSlow + semasleep + Mutex.Lock/Unlock` = **~35% CPU** unter Parallel-Last. Ursache: `sync.RWMutex` Write-Lock im shared CandleBuilder. Mitigation: ein CandleBuilder-Singleton pro Symbol (bereits so designed) — kein gemeinsamer Lock zwischen Symbolen. Shard-Lock Eval: Phase 19.

**Verify Gate:**
- [ ] `go test -bench=. -benchmem ./internal/services/market/streaming/` läuft durch, kein Panic
- [ ] Baseline-Zahlen in `docs/PERFORMANCE_BASELINE.md` eingetragen

---

### 7c. golangci-lint `.golangci.yml` erweitern

**IST:** `errcheck`, `govet`, `ineffassign`, `staticcheck`, `unused` aktiv. Solide Basis.

**Fehlende Linter + Erklärung:**

| Linter | Was es prüft |
|--------|-------------|
| `gocritic` | 100+ Checks: `%w`-Wrapping in `fmt.Errorf`, unnötige Type-Assertions, simplifiable Loops |
| `exhaustive` | Vollständige Switch-Cases auf iota-Typen — verhindert vergessene Cases bei neuen Werten |
| `revive` | Moderner `golint`-Ersatz: Naming, Export-Kommentare, Error-Wrapping-Stil |
| `nolintlint` | Verhindert ungültige `//nolint:` Kommentare (Typos, veraltete Linter-Namen) |

- [x] **P7c.1** — `.golangci.yml`: `gocritic`, `exhaustive`, `revive`, `nolintlint` unter `linters.enable` hinzufügen
- [x] **P7c.2** — `make lint` grün nach Erweiterung: 7 Findings behoben (appendAssign, exitAfterDefer, 2×singleCaseSwitch, 3×nolintlint)
- [x] **P7c.3** — CI: `make ci` (test + vet + lint + build) dokumentiert als Standard-Gate

**Verify Gate:**
- [ ] `make lint` läuft durch ohne ungerechtfertigte Suppressions
- [ ] Keine neuen `//nolint:` ohne Kommentar-Begründung

---

### 7d. errgroup — Referenz-Implementierung

**Hintergrund:** Kein einziger `errgroup`-Aufruf in `internal/` (GitNexus bestätigt). `sync.WaitGroup` ohne Error-Propagation: wenn ein Worker fehlschlägt, laufen alle anderen weiter. SOTA: `errgroup.WithContext` → erster Fehler cancelt alle anderen Goroutinen.

**Ziel:** Einen parallelen Handler umschreiben als Referenz für das Team.

**Kandidat:** Multi-Source-Fetch in einem Geopolitical- oder Quote-Handler wo mehrere externe Calls parallel gemacht werden.

```go
// Pattern: errgroup.WithContext statt sync.WaitGroup
g, ctx := errgroup.WithContext(ctx)
for _, source := range sources {
    source := source
    g.Go(func() error {
        return fetchFrom(ctx, source)
    })
}
if err := g.Wait(); err != nil {
    return nil, err // erster Fehler; andere wurden via ctx gecancelt
}
```

- [x] **P7d.1** — Handler identifiziert: `GeoMapSourcePack.FetchAndMapToCandidates` in `internal/connectors/geomapsources/pack.go`
- [x] **P7d.2** — `errgroup.WithContext` implementiert: alle 4 Watcher (OFAC/UN/SECO/EU) parallel; erster Fehler cancelt alle via gctx
- [x] **P7d.3** — `go test -race ./internal/connectors/geomapsources/...` grün

**Verify Gate:**
- [ ] Handler gibt ersten Fehler zurück, Context-Cancel propagiert zu allen Goroutinen
- [ ] `go test -race` keine Data Races

---

### 7e. `runtime/secret` für AES-Key Material

**Hintergrund:** Go 1.26 installiert (`go1.26.0`). `GOEXPERIMENT=runtimesecret` aktiviert `runtime/secret` Package. AES-256-GCM Keys in `secureEnvDecoderFromEnv()` liegen momentan als plain `[]byte` im Heap.

**Was `runtime/secret.Do()` macht:** Nach Rückkehr werden Registers, Stack und Heap-Allokationen des Closures genullt — Key-Material überlebt den GC nicht. Auf Windows = Passthrough (kein Panic, kein Build-Fehler).

**Einschränkungen:** Nur wirksam auf `linux/amd64` + `linux/arm64`. Kein Goroutine-Start innerhalb von `secret.Do()`.

- [x] **P7e.1** — Build-Test: `GOEXPERIMENT=runtimesecret go build ./cmd/gateway/` kompiliert ✓
- [x] **P7e.2** — `secure_env_decrypt_secret.go` (//go:build goexperiment.runtimesecret) + `secure_env_decrypt_nosecret.go` (!goexperiment.runtimesecret); `secure_env.go` ruft `decryptEnvValue()` auf
- [x] **P7e.3** — `go test ./internal/app/...` grün (beide Pfade)

**Verify Gate (low priority, Linux-Prod):**
- [ ] Key-Material nicht im Goroutine-Dump (`GOTRACEBACK=all`) sichtbar nach Decrypt
- [ ] Phase 11: Linux-Deployment validiert

**Note:** Low priority für Dev (Windows). In Prod-Linux sofort wirksam.

---

### 7f. FlightRecorder Verify Gate

*(P6c.1–P6c.4 bereits als ✅ markiert — Verify steht noch aus.)*

- [ ] **P7f.1** — Verify: `FLIGHT_RECORDER_ENABLED=true go run ./cmd/gateway/` startet ohne Error
- [ ] **P7f.2** — Verify: `curl http://localhost:9060/debug/flight-recorder` liefert `Content-Type: application/octet-stream` `.trace` Datei
- [ ] **P7f.3** — `go tool trace flight.trace` öffnet Trace-Viewer im Browser

**Note:** Braucht laufenden Go-Gateway-Prozess.

---

### 7g. OTel Trace-Propagation in NATS-Publisher

**Hintergrund:** NATS Phase A done (P3.1–P3.7), OTel Phase 0e done. Für vollständiges End-to-End-Tracing: NATS-Messages müssen W3C TraceContext in Headers propagieren. Ergebnis in OpenObserve: HTTP-Request → NATS Publish → Subscriber als eine Trace-Kette.

**Pattern:**
```go
// Publish: inject trace context into NATS headers
func (p *NATSPublisher) PublishCandle(ctx context.Context, subject string, payload []byte) error {
    msg := nats.NewMsg(subject)
    msg.Data = payload
    otel.GetTextMapPropagator().Inject(ctx, natsMsgCarrier{msg})
    _, err := p.js.PublishMsg(ctx, msg)
    return err
}

// Subscriber (Phase B Stub — dokumentiert für Rust-Consumer):
// otel.GetTextMapPropagator().Extract(ctx, natsMsgCarrier{msg})
```

- [x] **P7g.1** — `internal/messaging/nats_publisher.go`: `natsMsgCarrier` + W3C TraceContext Inject in `PublishTick` + `PublishCandle` (via `otel.GetTextMapPropagator().Inject`)
- [x] **P7g.2** — `internal/messaging/subscriber.go`: Extract-Pattern als Kommentar für Phase B Rust-Consumer
- [x] **P7g.3** — `go build ./...` + `go test -race ./internal/messaging/...` grün

**Verify Gate (braucht Dev-Stack mit NATS + OTel):**
- [ ] OpenObserve: Span `nats.publish.market.{symbol}.candle` in Trace sichtbar
- [ ] `trace_id` im NATS-Message-Header vorhanden (überprüfbar via `nats sub` + Header-Inspect)

---

---

### 7h. `golang.org/x/sync` — errgroup Audit (weitere Handler)

**Hintergrund:** `golang.org/x/sync v0.19.0` ist jetzt direct dep (seit Sprint 4). Referenz-Impl in `GeoMapSourcePack` (P7d) zeigt das Pattern. Weitere sequentielle Multi-Source-Fetcher im Go-Gateway profitieren davon.

**Kandidaten (noch sequentiell):**

| File | Funktion | Parallelisierbar? |
|:-----|:---------|:-----------------|
| `internal/services/market/quote_client.go` | `tryStockProviders`, `tryForexProviders` | Nein — fallback-chain, sequentiell by design |
| `internal/handlers/http/` | Bulk-Geo-Handler (mehrere Source-Calls) | Ja — unabhängige Reads |
| `internal/connectors/softsignals/` | Multi-Provider aggregation | Prüfen |

- [x] **P7h.1** — Audit: `rg "for.*range.*watcher\|for.*range.*provider\|for.*range.*source" ./internal/` → alle sequentiellen For-Schleifen über externe Calls listen
- [x] **P7h.2** — Kandidaten nach Schema: `NewsService.Headlines` (3 unabhängige Fetcher: RSS/GDELT/Finviz) → errgroup mit Error-Absorption (non-fatal); `GeoMapSourcePack` bereits ✅ (Sprint 4)
- [x] **P7h.3** — `internal/services/market/news_service.go`: errgroup.WithContext + sync.Mutex für merged-Slice; `go test -race ./internal/...` grün ✅

**Note:** `errgroup.SetLimit(n)` für Concurrency-Begrenzung wenn viele externe APIs (Rate-Limit-Schutz).

---

### 7i. Gateway pprof — Live-Profiling unter echter Last

**Hintergrund:** `cb_cpu.prof` deckt nur `BenchmarkApplyTick` ab — isolierter Test-Binary, nicht das Gateway.
Ein Gateway-Profil unter echter Last zeigt wo Handler, Serialisierung, Routing wirklich Zeit verbrauchen.

**Voraussetzung:** Mehrere Datenquellen aktiv + Traffic fließt (sinnlos bei idle Gateway).

**Workflow:**
```bash
# net/http/pprof bereits eingebunden → einfach fetchen:
curl "http://localhost:9060/debug/pprof/profile?seconds=30" > gateway_live.prof
go tool pprof -top gateway_live.prof   # Claude kann das als CLI auswerten
```

- [ ] **P7i.1** — Voraussetzung: ≥ 3 Datenquellen aktiv (z.B. Binance + Coinbase + Python-Signale) + Frontend läuft + User interagiert
- [ ] **P7i.2** — 30s CPU-Profil fetchen, `go tool pprof -top` auswerten → Hotspots identifizieren
- [ ] **P7i.3** — Baseline in `docs/PERFORMANCE_BASELINE.md` unter neuer Sektion "Gateway Live Profile" eintragen

**Verify Gate:** Auswertung zeigt keine unerwarteten Bottlenecks außerhalb bekannter Hot-Paths (CandleBuilder, SSE-Broadcast).

---

### 7j. Shard-Lock — Multi-Producer Aggregation (Phase 19 Vorbereitung)

**Hintergrund:** Aktuell: 1 Goroutine schreibt pro Symbol → kein Contention-Problem.
**Mittelfristig:** Mehrere unabhängige Quellen wollen **gleichzeitig dasselbe Symbol** aktualisieren:

```
Multi-Producer → CandleBuilder[BTC]:
  Binance Tick   ──┐
  Coinbase Tick  ──┼──→ sync.RWMutex Write-Lock → Contention
  Rust Signal    ──┘
  Python Feature ──
```

Das ist der Kern der **Gemini-Aggregationsschicht**: Go Gateway empfängt Streams von Exchange, Rust, Python → normalisiert → an Frontend (SSE). Jede Quelle ist ein unabhängiger Producer für dasselbe Symbol.

**Lösungsoptionen:**
| Option | Wann | Aufwand |
|:-------|:-----|:--------|
| **Shard-Lock** (`sync.Map[symbol → *Builder]`) | Mehrere Goroutinen/Symbol | Mittel |
| **NATS als Serialisierungspunkt** (`market.BTC.tick` → 1 Consumer/Symbol) | Gemini-Architektur Phase 20 | NATS Phase B (bereits geplant) |
| **Channel-per-symbol** (Go-idiomatisch) | Einfachste Lösung, kein Lock | Klein |

**NATS-Lösung ist die eleganteste** und bereits in §3 geplant (P3.8+): Rust/Python publizieren via NATS, Go subscribt pro Symbol → natürlicher Single-Writer, kein Lock mehr nötig.

- [ ] **P7j.1** — Architektur-Entscheidung dokumentieren: Channel-per-symbol als Bridge bis Phase 20, dann NATS als permanente Lösung
- [ ] **P7j.2** — Wenn Multi-Exchange-Feed aktiv (Phase 11): `CandleBuilder` Registry auf `sync.Map[string, *CandleBuilder]` umstellen (thread-safe Lookup)
- [ ] **P7j.3** — Phase 20: NATS `market.{symbol}.tick` Consumer ersetzt Mutex komplett (P3.12)

**Architektur-Entscheidung (festgehalten):**
NATS `market.{symbol}.tick` als Serialisierungspunkt ist für unsere Architektur **die korrekte Langzeit-Antwort** und SOTA 2026 für Multi-Producer/Multi-Process-Systeme. Sobald Phase 20 (Gemini) aktiv ist, verschwindet der Mutex als Nebeneffekt — kein separates Refactoring nötig. Mutex bleibt korrekt solange nur 1 Quelle/Symbol existiert (heute). Bridge Phase 11: Channel-per-symbol.

**Note:** Shard-Lock ist kein SIMD-Thema. SIMD = Batch-Mathe. Shard-Lock = Concurrency-Isolation. Beides orthogonal.

---

### Sprint 4 Gesamt-Verify Gates

**Ohne Live-Stack (unit-testbar):**
- [x] `go.mod go 1.26` + `go build ./...` + `go test -race ./internal/...` grün (P7a)
- [x] Benchmarks laufen: ApplyTick=72ns, Parallel=188ns (2.6×), Snapshot=1367ns/1alloc (P7b)
- [x] `make lint` grün mit erweiterten Linters — 0 issues (P7c)
- [x] `GOEXPERIMENT=runtimesecret go build ./cmd/gateway/` kompiliert (P7e.1)

**Mit Dev-Stack (NATS_ENABLED=true, OTEL_ENABLED=true, FLIGHT_RECORDER_ENABLED=true):**
- [x] FlightRecorder: `GET /debug/flight-recorder` liefert `.trace` Datei (P7f)
- [x] OpenObserve: strukturierte Logs mit `requestId` + `span_id` (P6b.4 + P6f.3)
- [x] NATS: Go-Gateway publiziert Ticks (Logs + `nats sub market.*.tick` bestätigt) (P3 Verify Gates)
- [x] OTel + NATS: `trace_id` in NATS-Headers sichtbar (P7g)

---

## Änderungshistorie

| Rev. | Datum | Autor | Änderung |
|:-----|:------|:------|:---------|
| 11 | 06.03.2026 | Gemini | Alle Verify-Gates (NATS, FlightRecorder, OTel/OpenObserve) erfolgreich getestet und abgeschlossen. Fixes eingebaut: NATS Subject-Overlap behoben (`market.*.ohlcv.>` vs `market.*.tick`), fehlendes `PublishTick` in `market_stream.go` ergänzt, Context-Propagation repariert (`r.Context()` anstelle `context.Background()`), `otel.SetTextMapPropagator` für Trace-Header in NATS konfiguriert, `slog.InfoContext` genutzt damit OpenObserve Logs `trace_id` erhalten. |
| 10 | 06.03.2026 | Claude | P7h.1–P7h.3 ✅: errgroup in `NewsService.Headlines` (3 Fetcher parallel, error-absorbing, sync.Mutex für merged); `go test -race ./internal/...` grün. §7 Sprint 4+5 vollständig CODE-COMPLETE. Live-Verify: `.env.development` NATS_ENABLED+FLIGHT_RECORDER_ENABLED=true setzen, dann `dev-stack.ps1 -Nats -Observability` (startet Go-Gateway automatisch über Import-EnvFile). |
| 9 | 06.03.2026 | Claude | §7i NEU: Gateway Live-Profiling (wenn ≥3 Quellen aktiv, P7i.1–P7i.3). §7j NEU: Shard-Lock / Multi-Producer Aggregation (Channel-per-symbol → NATS Phase 20, P7j.1–P7j.3). Architectural Note: NATS market.{symbol}.tick als natürlicher Single-Writer eliminiert Lock komplett. |
| 8 | 06.03.2026 | Claude | Sprint 5: P1.4 ✅ pkg/circuitbreaker (Breaker[R] Wrapper, 3 Tests). P4.2 ✅ BenchmarkVWAP/VWAPBatch (1432ns/100ticks, 14ns/tick, linear, 0 allocs → SIMD nicht nötig). P7b.4 ✅ pprof: lockSlow+semasleep = 35% CPU → Mutex-Contention bestätigt, Mitigation: 1 Builder/Symbol. §7h NEU: x/sync errgroup Audit (P7h.1–P7h.3). §1 ✅ COMPLETE. |
| 7 | 06.03.2026 | Claude | Sprint 4 CODE-COMPLETE: P7a (go 1.26 + golang.org/x/sync direkt), P7b (BenchmarkApplyTick/Parallel/Snapshot — 2.6× Lock-Contention), P7c (.golangci.yml + 7 Findings behoben), P7d (errgroup in GeoMapSourcePack), P7e (runtime/secret Build-Tags), P7g (W3C TraceContext in NATS-Publisher). P6d.2 ✅. §7 Übersicht ✅. PERFORMANCE_BASELINE.md Go-Backend-Sektion ergänzt. |
| 1 | 05.03.2026 | Claude | Initialdokument: pkg/, sqlc/pgxpool, NATS JetStream, simd/archsimd, Gemini-Architektur, Go Best Practices High-Relevance |
| 2 | 06.03.2026 | Claude | Go Infrastructure Sprint: P1.1–P1.3+P1.5, P2.1–P2.4+P2.6, P3.1–P3.6, P6c.1–P6c.4 abgehakt. FlightRecorder: runtime/trace (MinAge 10s) ergänzt OTel. NATS: nats.go v1.49 + JetStream, Candle-Publish in market_stream.go. |
| 3 | 06.03.2026 | Claude | Phase A NATS vollständig: P3.7 ✅ (dev-stack.ps1 `-Nats` Switch, Auto-Download nats-server v2.10.24 → tools/nats/, docker-compose.nats.yml). messaging: client.go + subscriber.go als Stubs (Phase B/D). §6e Connect RPC + §6f otelslog Bridge als neue Items eingefügt. Übersichts-Tabelle aktualisiert. |
| 4 | 06.03.2026 | Claude | Sprint 2: P3.6 EnsureStreams ✅ (MARKET_CANDLES + MARKET_TICKS via CreateOrUpdateStream in NewNATSPublisher). P6b.1 ✅ (wiring.go 5× log.Printf → slog, "log" Import entfernt). P6f.1+P6f.2 als ✅ retroaktiv markiert (bereits in logger.go implementiert). P2.5 ✅ SQLite-Entscheidung dokumentiert. P1.6 ✅ AGENTS.md pkg/-Einträge. Übersichts-Tabelle §6 aktualisiert. |
| 5 | 06.03.2026 | Claude | Sprint 3 Abschluss: P6a.1 ✅ candle_builder_synctest_test.go (TestCandleBuilderConcurrentWrites + TestCandleBuilderConcurrentReadsDuringWrite). P6a.2 ✅ TestAlertEngineConcurrentEvaluate in streaming_core_test.go. P6a.3 ✅ AGENTS.md synctest-Guideline. P6b.2+P6b.3 als ✅ retroaktiv markiert (bereits done). Übersichts-Tabelle: 6a ✅ 6b ✅ 6c ✅ 6f ✅; 6d 6e Phase 19/20. |
| 6 | 06.03.2026 | Claude | Rev. 6: Gap-Analyse go-gateway vs SOTA 2026. §7 NEU (Sprint 4): 7a go.mod→1.26, 7b Benchmarks (BenchmarkApplyTick/Parallel/Snapshot + pprof), 7c .golangci.yml (gocritic/exhaustive/revive/nolintlint), 7d errgroup Referenz-Impl, 7e runtime/secret (GOEXPERIMENT=runtimesecret), 7f FlightRecorder Verify, 7g OTel+NATS TraceContext-Propagation. P4.1 ✅ (go 1.26 installiert). P6d.1 ✅ (go 1.26 verfügbar, runtimesecret GOEXPERIMENT bereit). Architectural Decisions: REST Next.js↔Go bestätigt, ServeMux bleibt, Connect RPC nur Go↔Rust Phase 20, Green Tea GC Default. |
