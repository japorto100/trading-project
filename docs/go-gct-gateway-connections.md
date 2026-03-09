# GCT ↔ Go Gateway Plan

Diese Datei bleibt die verdichtete Arbeitsreferenz fuer den aktuellen Stand
zwischen `go-backend` und `go-backend/go-crypto-trader`.

Sie trennt bewusst zwischen:

- erledigten Rebind- und Absorptionsschritten
- den naechsten direkt umsetzbaren Slices
- spaeteren Architektur- und Future-Themen

---

## Erledigt

### Rebind auf `go-crypto-trader`

- `go.mod` zeigt auf `./go-crypto-trader`
- der alte Vendor-Fork ist aus dem aktiven Runtime-Pfad herausgenommen und als
  Archivthema behandelt
- `FORK_NOTES.md`, `.env.example`, `.env.development`, `.env.production`,
  `scripts/dev-stack.ps1`, Backtest-Defaults und weitere Pfadreferenzen wurden
  auf `go-crypto-trader` umgestellt
- Portfolio-/Exchange-Read-Pfade laufen ueber den neuen GCT-Clone; gRPC wird
  bevorzugt und nur bei echten Transport-/Unimplemented-Faellen faellt der
  Connector auf JSON-RPC zurueck

### Gateway-eigene Typgrenze fuer Read-only Marktpfade

- es gibt jetzt Gateway-eigene Marktprimitive in
  `go-backend/internal/contracts/market_target.go`
- eingefuehrt wurden:
  - `contracts.Pair`
  - `contracts.MarketTarget`
  - `contracts.OrderbookLevel`
  - `contracts.OrderbookSnapshot`
- `QuoteHandler`, `OrderbookHandler` und `MarketStreamHandler` geben keine
  GCT-Paare/Asset-Typen mehr direkt an ihre Service-Grenzen weiter, sondern
  benutzen `contracts.MarketTarget`
- `QuoteClient` und `StreamClient` besitzen dafuer Gateway-nahe Wrapper:
  - `GetTickerTarget(...)`
  - `OpenTickerStreamTarget(...)`

### Shared Market Resolver konsolidiert

- Symbol-/Exchange-/Asset-Parsing liegt jetzt zentral in
  `go-backend/internal/handlers/marketparams`
- HTTP und SSE nutzen dieselbe Resolver-Logik fuer:
  - Normalisierung von Symbolen
  - `MarketTarget`-Erzeugung
  - Provider-spezifische Pair-Regeln wie `BTC -> XBT` fuer Kraken
- `QuoteHandler`, `OrderbookHandler` und `MarketStreamHandler` sind damit auf
  dieselbe Vertragsgrenze gehoben

### Capability-/Adapter-Modell verfeinert

- `internal/connectors/base.Capabilities` wurde um `Depth` erweitert
- es gibt jetzt explizitere Gateway-Sichten auf Capabilities:
  - `Market()`
  - `Stream()`
  - `Order()`
  - `Account()`
- damit ist die Trennung von Market / Stream / Order / Account im Gateway klarer
  und besser als Ausgangspunkt fuer spaetere Broker-/DEX-Adapter nutzbar

### Read-only Depth / Orderbook Slice

- GCT-Orderbook wurde als naechster read-only Slice aufgenommen
- der GCT-Connector bietet nun:
  - `GetOrderbook(...)`
  - `OpenOrderbookStream(...)`
- der Markt-Service bietet nun:
  - `DepthClient.GetOrderbook(...)`
  - `DepthClient.OpenOrderbookStream(...)`
- neue Gateway-Oberflaechen:
  - HTTP: `/api/v1/orderbook`
  - SSE: `/api/v1/stream/orderbook`
- damit ist ein erstes selektives Subscription-/Relay-Muster aus GCT im Gateway
  angekommen, ohne Execution oder die komplette GCT-Engine zu uebernehmen

### Selektive `kline`-/request-/credential-Haertung

- `OHLCVHandler` normalisiert Timeframes jetzt konsistenter
- OHLCV-Candles werden vor dem Response dedupliziert und nach Zeit sortiert
- im Connector-Basislayer existiert jetzt eine neutrale Retry-Entscheidung mit
  `Retry-After`-Respektierung:
  - `base.RetryDecision(...)`
- im Connector-Basislayer existiert jetzt ein neutraler Credential-Contract:
  - `base.CredentialSet`
  - `base.CredentialStore`
  - `IsEmpty()`
  - `HasSecrets()`
  - `Redacted()`
  - `Get()`
  - `Normalized()`

### Request-scoped Credential-Transport bis Frontend/Next/Gateway verdrahtet

- der Gateway-Middleware-Layer versteht jetzt
  `X-Tradeview-Provider-Credentials`
- der Header wird als base64-kodiertes JSON in einen request-scoped
  `CredentialStore` dekodiert und in `requestctx` abgelegt
- `SettingsPanel` synchronisiert gespeicherte Provider-Keys jetzt zusaetzlich in
  einen server-lesbaren Cookie (`tradeview_provider_credentials`)
- die Next-Market-Routen (`quote`, `providers`, `stream`, `stream/quotes`)
  rekonstruieren daraus kontrolliert denselben Gateway-Header
- damit funktionieren browserseitige Fetch- und SSE-Pfade ueber denselben
  Credential-Transport, ohne GCT-Standalone-Config oder `.env` als einzige
  Quelle zu erzwingen

### Erster read-only Provider-Consumer nutzt request-scoped Credentials

- `internal/connectors/finnhub.Client` bevorzugt jetzt request-scoped
  Credentials aus `requestctx` vor statischen ENV-Werten
- damit ist der erste echte read-only Providerpfad von
  Frontend → Next → Go-Gateway → Connector auf die neue Credential-Grenze
  gehoben
- die Loesung bleibt bewusst transitional:
  - Cookie ist `httpOnly`, `sameSite=lax`, in Prod `secure`
  - keine finale Secret-Vault-/DB-Loesung
  - zunaechst nur Key-basierte Provider-Keys, noch keine vollstaendige
    Broker-/Exchange-Credential-Domain

### Validierung

Die neu betroffenen Pakete wurden direkt geprueft:

- `internal/connectors/finnhub`
- `internal/handlers/marketparams`
- `internal/requestctx`
- `internal/app`
- `internal/handlers/http`
- `internal/connectors/base`

Hinweis:

- ein fokussierter Re-Run von `internal/handlers/sse` haengt aktuell bereits
  beim Paket-Build ohne Testausgabe; die Resolver-Umstellung selbst ist dort
  klein und syntaktisch integriert, aber dieser Testlauf sollte vor dem
  naechsten groesseren SSE-Slice separat noch einmal untersucht werden

---

## Jetzt umsetzbar

Die folgenden Schritte sind die naechsten sinnvollen Slices, ohne wieder in eine
komplette GCT-Uebernahme abzurutschen.

### 1. Weitere Provider-/Exchange-Consumer auf dieselbe Credential-Grenze heben

Die Transportbasis steht jetzt. Der naechste praktische Slice ist:

- weitere read-only Provider wie `fred`/`banxico`/`bok` auf request-scoped
  Credentials pruefen und bei Bedarf umstellen
- pro Provider/Exchange klar trennen zwischen:
  - user-supplied request credentials
  - gateway service credentials
  - GCT process credentials
- spaeter entscheiden, welche Broker-/Exchange-Pfade ueberhaupt user-supplied
  Credentials annehmen duerfen

### 2. Mehr read-only GCT-Slices auf dieselbe Vertragsgrenze ziehen

Jetzt, wo `MarketTarget`, `OrderbookSnapshot` und der gemeinsame Resolver
existieren, koennen weitere Read-only Slices ueber dieselbe Gateway-Schicht
absorbiert werden:

- weitere Market-Read-RPCs auf Gateway-Contracts abbilden
- optional Orderbook-Snapshot+Delta-Modell vorbereiten
- spaeter SSE/NATS-Routing fuer Depth standardisieren. **Aladdin-Gap:** GCT Bridge Phase 1–2 (Portfolio-architecture). Go REST Endpoints, Next.js Proxy. NATS für Ingestion. Priorität: Hoch.

### 3. Capability-Registry enger an echte Adapter anbinden

Der Capability-Frame existiert jetzt im Code, ist aber noch nicht komplett mit
den Runtime-Providern verheiratet.

Naechster Schritt:

- `internal/router/adaptive` staerker mit den verfeinerten Capabilities koppeln
- read-only vs mutation expliziter im Registry-/Provider-Meta-Modell fuehren
- Broker-/DEX-Adapter spaeter auf dieselbe Sprache heben

### 4. Selektive weitere `kline`-Uebernahme

Sofort sinnvoll bleiben nur neutrale Teile aus GCT:

- Intervall-Normalisierung
- Range-Cleanup
- Padding-/Dedupe-Mechaniken

Nicht sinnvoll in dieser Phase:

- komplette GCT-Candle-Pipeline
- TA-/Storage-Abhaengigkeiten
- GCT-interne Historic-Konstrukte als 1:1-Uebernahme

### 5. Request-/Credential-Hardening breiter anwenden

Die neutralen Muster sind jetzt im Basislayer und im HTTP-Einstieg verankert.
Der naechste Schritt ist deren praktische Verbreiterung:

- weitere Connectoren auf `RetryDecision(...)` heben
- sensible Credential-Logs konsequent auf `CredentialStore.Redacted()` umstellen
- Subaccount-/Passphrase-Muster fuer spaetere Broker-Anbindungen vorbereiten
- Connector-seitig entscheiden, welche Read-only Provider bereits direkt
  request-scoped Credentials konsumieren sollen

---

## Future

### Auth-Entscheidung fuer GCT

Kurzfristig bleibt Auth fuer den separaten GCT-Prozess sinnvoll.

Spaeter neu bewerten, wenn:

- GCT enger als Library genutzt wird
- RPC-Grenzen kleiner werden
- das Gateway selbst die fachliche Hauptgrenze uebernimmt

### GCT Stripping / Build Scope Reduction

Dieses Thema bleibt bewusst eine Evaluation und keine Sofortmassnahme.

Zu klaeren:

- wie Exchange-Registrierung in GCT fuer reduzierte Builds isolierbar ist
- ob Dev-/Prod-Profile fuer kleinere Exchange-Sets sinnvoll sind
- welche Exchanges langfristig direkt im Gateway landen sollen

### Gateway-DB statt GCT-DB kopieren

Das Gateway braucht nicht sofort eine GCT-aehnliche DB.

Sobald das Gateway selbst Domain-Truth fuer Broker-/Boersen-Flows haelt, wird
eine Gateway-eigene DB aber sehr wahrscheinlich notwendig fuer:

- Orders und Order-Status
- Positions und Balances
- fills / executions
- Audit / Reconciliation
- Idempotency / Retry-State
- Broker-Credentials / Mappings
- spaetere Backtest-/Run-Artefakte

Wichtig:

- keine Kopie des GCT-DB-Layers bauen
- stattdessen spaeter eine Gateway-owned Domain-DB modellieren
- dieses Thema erst angehen, wenn die vorgelagerten Spezifikationen konsolidiert
  sind, inklusive der Folgephasen aus `docs/specs/execution/infra_provider_delta.md`

### Nicht in diese Phase aufnehmen

Explizit ausserhalb des aktuellen Scopes bleiben:

- komplette GCT-Engine
- mutierende Flows wie `SubmitOrder`, `CancelOrder`, `Withdraw`
- `communications/*` als direkte Uebernahme
- GCT-DB-Layer
- Script-Runtime
- vollstaendige In-Process-Verschmelzung

---

## Leitlinie

Weiterhin gilt:

1. GCT nur dort absorbieren, wo es das Gateway direkt verbessert.
2. Read-only Marktpfade vor mutierenden Flows ausbauen.
3. Gateway-eigene Vertraege zuerst, GCT-Typen nur an der Connector-Kante.
4. Broker-/DEX-Faehigkeit als Zielbild mitdenken, aber nicht durch vorschnelle
   Komplettuebernahme erzwingen.

## Aktuelle Architektur

### Runtime-Grenze heute

```text
Next.js / Frontend
        |
        v
Go Gateway
  - HTTP + SSE Surface
  - request-scoped credentials
  - Gateway-owned MarketTarget contracts
  - adaptive/provider routing
        |
        v
GCT (`go-crypto-trader`)
  - gRPC bevorzugt
  - JSON-RPC als Fallback fuer bestehende Pfade
  - Backtest-/Portfolio-/Exchange-Runtime
```

### Relevante Kopplungsstellen

| Bereich | Rolle heute |
|---|---|
| `internal/connectors/gct/*` | Runtime-Connector zu GCT |
| `internal/contracts/*` | Gateway-owned Vertraege fuer Marktpfade |
| `internal/handlers/marketparams` | shared resolver fuer HTTP + SSE |
| `internal/connectors/base/*` | Retry-/Credential-/Capability-Basis fuer Gateway-Connectoren |

### Was aus dem alten Rebind-Plan noch uebrig bleibt

Der eigentliche Rebind ist erledigt. Offen bleibt nur noch die saubere
Nachpflege:

- verbliebene Altverweise auf den frueheren Vendor-Fork in Docs/Skripten finden
  und aufraeumen
- gezielte Build-/Smoke-/SSE-Verify dort nachziehen, wo der Rebind nur indirekt
  mitgeprueft wurde
- Vendor-Fork nur noch als Archiv-/Forensik-Thema behandeln, nicht mehr als
  aktive Planbasis

## Env- und Runtime-Schnittstelle

| Variable | Default | Bedeutung |
|----------|---------|-----------|
| `GCT_GRPC_ADDRESS` | `127.0.0.1:9052` | gRPC fuer Quotes/Streams/Backtest |
| `GCT_JSONRPC_ADDRESS` | `127.0.0.1:9053` | JSON-RPC Fallback-/Kompatibilitaetspfad |
| `GCT_USERNAME` / `GCT_USERNAME_ENC` | — | BasicAuth |
| `GCT_PASSWORD` / `GCT_PASSWORD_ENC` | — | BasicAuth |
| `GCT_PREFER_GRPC` | `true` | gRPC vor JSON-RPC bevorzugen |
| `GCT_JSONRPC_INSECURE_TLS` | `false` | lokal fuer self-signed TLS |

Arbeitsregel:

- solange GCT als separater Runtime-Service laeuft, bleibt die Auth-Grenze
  sinnvoll
- wenn GCT spaeter enger in-process oder nur noch selektiv als Library genutzt
  wird, kann diese Auth-Grenze neu bewertet werden

## Benchmark-Baseline (Sprint 4, 06. Mär 2026)

**Platform:** Windows 10, Intel Core i7-2600 @ 3.40 GHz, GOMAXPROCS=8
**Go:** 1.26, `go test -bench=. -benchmem -benchtime=3s`
**Package:** `tradeviewfusion/go-backend/internal/services/market/streaming`

| Benchmark | ns/op | B/op | allocs/op |
|:----------|------:|-----:|----------:|
| `BenchmarkApplyTick` (single-thread) | 72.54 | 0 | 0 |
| `BenchmarkApplyTickParallel` (8 goroutines) | 188.3 | 0 | 0 |
| `BenchmarkSnapshot` (100 candles) | 1367 | 4864 | 1 |

**Lock-Contention Analysis:**
- Parallel/Single ratio: 188.3 / 72.54 ≈ **2.6×** → exceeds 2× threshold
- Indicates `sync.RWMutex` write-lock contention under concurrent writers
- Recommendation: evaluate shard-lock (per-symbol CandleBuilder) or `sync.Map` in Phase 19

**Notes:**
- Zero allocations on hot path (ApplyTick): excellent — no GC pressure
- Snapshot allocates once (slice copy): expected and unavoidable

**Verify:** `go test -bench=. -benchmem ./internal/services/market/streaming/...` reproduzierbar.

## Offene Verify-Luecke

Aktuell bleibt vor dem naechsten groesseren Streaming-Slice vor allem ein Punkt
bewusst offen:

- `internal/handlers/sse` sollte als eigener fokussierter Paket-/Build-/Testlauf
  erneut untersucht werden, weil ein frueherer Re-Run bereits vor Testausgabe
  hing und die Resolver-Umstellung dort nur klein, aber nicht final verifiziert
  war

## Zusammenfassung

Die operative Rolle dieses Dokuments ist jetzt enger:

- aktueller GCT-Absorptionsstand
- naechste read-only Gateway-Slices
- verbleibende GCT-spezifische Future-Fragen

Historische Rebind-Schrittfolgen bleiben Archivmaterial und sind nicht mehr die
aktive Planrealitaet.
