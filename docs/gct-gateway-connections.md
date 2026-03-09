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
- spaeter SSE/NATS-Routing fuer Depth standardisieren

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
  sind, inklusive der Folgephasen aus `docs/specs/execution_mini_plan_3.md`

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

## 2. Aktuelle Architektur

### 2.1 Go Gateway (go-backend)

| File | Rolle |
|------|-------|
| `cmd/gateway/main.go` | Entry Point → `app.NewServerFromEnv()` |
| `internal/app/wiring.go` | GCT-Config, `gct.NewClient()`, Handler-Registrierung |
| `go.mod` | aktuell `replace github.com/thrasher-corp/gocryptotrader => ./vendor-forks/gocryptotrader` |
| `internal/connectors/gct/client.go` | HTTP JSON-RPC + gRPC Client, `GetTicker`, `OpenTickerStream`, `Health` |
| `internal/connectors/gct/portfolio.go` | `GetAccountInfo`, `GetExchanges` aktuell ueber JSON-RPC |
| `internal/services/backtest/gct_executor.go` | gRPC zu GCT Backtester (`btrpc`) |
| `internal/services/market/quote_client.go` | routet Crypto an den GCT-Client |
| `internal/handlers/sse/market_stream.go` | Live Stream ueber `gctClient.OpenTickerStream()` |

### 2.2 Breite GCT-Kopplung im Gateway

Der Gateway haengt nicht nur im GCT-Connector an GCT, sondern auch breit an
den Shared Types:

- `currency.Pair`
- `exchanges/asset.Item`
- `gctrpc`
- `gctrpc/auth`
- `backtester/btrpc`

Das betrifft nicht nur Crypto, sondern auch mehrere Macro-/Forex-/Stock-
Connectors, weil dieselben GCT-Typen als gemeinsame Marktprimitive verwendet
werden.

### 2.3 GCT Upstream (neu)

| Ort | Zweck | Stand |
|-----|-------|-------|
| `go-backend/go-crypto-trader/` | Frischer Clone von GitHub (thrasher-corp/gocryptotrader) | Upstream, aktuell |
| `go-backend/vendor-forks/gocryptotrader/` | Alter Fork fuer `go.mod replace` | veraltet / spaeter archivieren |

Gateway-relevante Unterschiede bestehen mindestens in:

- `gctrpc/`
- `gctrpc/auth/`
- `backtester/btrpc/`
- `engine/rpcserver.go`
- `currency/`
- `exchanges/asset/`

---

## 3. Aktueller Verbindungsfluss

```text
Next.js / Frontend
        |
        v
Go Gateway (:9060)
  cmd/gateway -> internal/app/wiring -> handlers
        |
        | internal/connectors/gct/client.go
        | - gRPC: 127.0.0.1:9052
        | - JSON-RPC proxy: https://127.0.0.1:9053
        v
GoCryptoTrader
  engine/rpcserver.go
  gctrpc/*
  backtester/btrpc/*
```

---

## 4. Env und Runtime-Schnittstelle

| Variable | Default | Bedeutung |
|----------|---------|-----------|
| `GCT_GRPC_ADDRESS` | `127.0.0.1:9052` | gRPC fuer Quotes/Streams/Backtest |
| `GCT_JSONRPC_ADDRESS` | `127.0.0.1:9053` | JSON-RPC Proxy |
| `GCT_USERNAME` / `GCT_USERNAME_ENC` | — | BasicAuth |
| `GCT_PASSWORD` / `GCT_PASSWORD_ENC` | — | BasicAuth |
| `GCT_PREFER_GRPC` | `true` | gRPC vor JSON-RPC bevorzugen |
| `GCT_JSONRPC_INSECURE_TLS` | `false` | lokal fuer self-signed TLS |

Anmerkung:

- Fuer den kurzfristigen Rebind bleibt Auth zunaechst erhalten.
- Langfristig kann Auth entfallen, wenn GCT nicht mehr als separater RPC-Service,
  sondern als engere Go-Library-/Package-Integration genutzt wird.

---

## 5. Plan — Rebind auf neues GCT

### 5.1 Phase A — Minimal-Risk Rebind

Ziel: Modulquelle austauschen, Verhalten moeglichst unveraendert lassen.

Checkpoints:

- [ ] `go.mod` von `./vendor-forks/gocryptotrader` auf `./go-crypto-trader` umstellen
- [ ] Build pruefen fuer alle GCT-abhaengigen Pfade
- [ ] Smoke-Test:
  - [ ] `/health`
  - [ ] `/api/v1/gct/health`
  - [ ] `/api/v1/quote`
  - [ ] `/api/v1/stream/market`
  - [ ] Backtest gRPC path
  - [ ] Portfolio JSON-RPC path

Leitlinie:

- zuerst Modul austauschen
- erst danach echte API-Breaks beheben
- keine prophylaktischen Gross-Refactorings waehrend des Rebinds

### 5.2 Phase B — Kompatibilitaetsoberflaeche absichern

Hotspots, die beim Rebind hart verglichen werden muessen:

1. `currency/`
2. `exchanges/asset/`
3. `gctrpc/`
4. `gctrpc/auth/`
5. `backtester/btrpc/`

Checkpoints:

- [ ] Typkompatibilitaet fuer `currency.Pair`
- [ ] Typkompatibilitaet fuer `asset.Item`
- [ ] gRPC Stub-Kompatibilitaet fuer `gctrpc`
- [ ] Backtester Stub-Kompatibilitaet fuer `btrpc`
- [ ] Auth- und Metadata-Flow gegen neues GCT validieren

### 5.3 Phase C — Vendor-Fork archivieren

Erst nach erfolgreichem Rebind:

- [ ] `vendor-forks/gocryptotrader/` archivieren
- [ ] alte Scripts, Docs und Referenzen auf `vendor-forks` bereinigen
- [ ] klar festhalten, dass `go-crypto-trader/` die neue Quelle ist

---

## 6. Langfristige Richtung — selektive GCT-Absorption

Das Ziel ist nicht, GCT blind 1:1 zu kopieren, sondern das Gateway gezielt zu
erweitern.

### 6.1 Sofort wertvolle Kandidaten

- `currency/`
- `exchanges/asset/`
- Teile von `exchanges/kline/`
- Exchange-/Capability-Patterns
- Subscription-/Order-/Market-Primitiven
- Teile von `gctrpc` und `btrpc` als Referenz fuer stabile Grenzflaechen

### 6.2 Warum das fuer Broker und DEX relevant ist

Auch wenn DEXs wie Uniswap nicht 1:1 wie zentrale Exchanges funktionieren,
liefert GCT sehr gute Blueprints fuer:

- Asset- und Pair-Normalisierung
- Capability-Modelle
- Trennung von Markt-, Konto-, Order- und Stream-Funktionen
- Validierung und Fehlerbehandlung
- Adapter-Struktur fuer neue Boersen/Broker

### 6.3 Was vorerst nicht uebernommen werden sollte

- komplette Engine
- kompletter DB-Layer
- Script runtime
- Kommunikationsmodule wie Telegram
- allgemeine Bot-/Daemon-Annahmen, die nicht zum Gateway passen

---

## 7. Auth-Entscheidung fuer neues GCT

### Kurzfristig

Auth beibehalten.

Begruendung:

- der bestehende Gateway-Connector rechnet damit
- `dev-stack` und lokale Startpfade rechnen damit
- localhost-only + BasicAuth ist eine sinnvolle defense in depth

### Mittelfristig

Wenn GCT enger als Go-Library benutzt wird und kein separater RPC-Boundary mehr
existiert, kann die GCT-RPC-Auth entfallen.

### Entscheidung

- [ ] kurzfristig: Auth beibehalten, aber keine Default-Creds wie `admin/Password`
- [ ] spaeter evaluieren: in-process Nutzung statt RPC-Auth

---

## 8. GCT Stripping / Build Scope Reduction

### Problem

`gateway.exe` enthaelt viele ungenutzte GCT-Exchange-Treiber und ist dadurch
groesser und schwerer kontrollierbar als noetig.

### Ziel

Kurz- bis mittelfristig:

- Scope-Reduction evaluieren
- Build-/Binary-Kosten senken
- unnoetige Kopplung an ungenutzte Exchanges reduzieren

Langfristig:

- trotzdem alle Exchanges grundsaetzlich unterstuetzen koennen
- also keine dauerhafte funktionale Verarmung, sondern ein bewusstes
  Build-/Packaging-Konzept

### Realistische Optionen

1. Evaluation eines "selected exchange" GCT-Builds fuer Dev/Prod-Profile
2. Conditional Build Tags fuer Exchange-Sets
3. Gateway-seitige Strangulation:
   - GCT zunaechst nur fuer relevante Exchanges
   - spaeter eigene `pkg/duplex/<exchange>` Adapter

### Entscheidung

Dieses Thema wird in den Plan aufgenommen, aber explizit als Evaluation und
nicht als Sofortmassnahme.

Checkpoints:

- [ ] prüfen, wie Exchange-Registrierung in GCT fuer Build-Scope-Reduction isoliert werden kann
- [ ] Dev-vs-Prod-Profile fuer reduzierte Exchange-Sets evaluieren
- [ ] bewerten, welche Exchanges langfristig direkt ins Gateway wandern sollen
- [ ] sicherstellen, dass langfristig trotzdem Vollabdeckung moeglich bleibt

---

## 9. Future — braucht das Gateway eine DB wie GCT?

### Kurzantwort

In der jetzigen Form: nicht zwingend.

Das Gateway kann heute viele Aufgaben ohne zentrale Core-DB abdecken:

- Quotes
- Streams
- Multi-Asset-Routing
- NATS / Observability
- API-Orchestrierung

### Spaeter bei echten Broker-/Boersen-Anbindungen

Dann wird eine Gateway-eigene DB sehr wahrscheinlich sinnvoll bis notwendig.

Sobald das Gateway selbst die fachliche Wahrheit fuer Dinge wie diese halten
soll, reicht reine In-Memory-/Durchleitungslogik nicht mehr:

- Orders
- Order-State-Transitions
- Positions
- fills / executions
- account snapshots
- Balance-Historie
- Audit / Reconciliation
- Idempotency / Retry-State
- Backtest-Runs / Artefakte
- Broker-Credentials / Mappings

### Wichtige Abgrenzung zu GCT

Falls eine DB eingefuehrt wird, dann nicht als Kopie des GCT-DB-Layers, sondern
als Gateway-owned Domain-DB.

Also eher:

- produktorientiert
- user-/account-/order-zentriert
- spaeter wahrscheinlich PostgreSQL

nicht:

- bot-intern
- engine-zentriert
- historisch gewachsene GCT-Struktur kopieren

### Abhaengigkeiten vor Beginn

Dieses Thema darf nicht isoliert begonnen werden. Vorher muessen die bereits
vorhandenen Architektur- und Ausfuehrungsdokumente beruecksichtigt bzw.
teilweise abgearbeitet werden, insbesondere:

- `docs/specs/execution_mini_plan_3.md`
- `docs/specs/execution_mini_2.md`
- weitere Haupt-/Ausfuehrungsplaene, die DB-Ownership, Phase-Dependencies,
  Messaging, Rust/Python-Architektur und Multi-User-Folgen definieren

Entscheidung:

- [ ] Future-Sektion festhalten
- [ ] DB-Arbeit erst angehen, wenn die vorgelagerten Spezifikationen konsolidiert sind
- [ ] vor Start klar entscheiden, welche Domain-Truth im Gateway liegen soll

---

## 10. Build-, Script- und Runtime-Folgen nach dem Rebind

Beim erfolgreichen Rebind auf `go-crypto-trader` muessen mindestens diese
Stellen angepasst oder geprueft werden:

- [ ] `go.mod`
- [ ] GCT-Startskripte wie `scripts/dev-stack.ps1`
- [ ] Build-/Smoke-Test-Skripte
- [ ] Dokumentation mit alten `vendor-forks` Pfaden
- [ ] lokale Datadir-/Config-Pfade

Wichtig:

- `dev-stack` und Helper-Skripte verweisen heute noch auf `vendor-forks`
- diese Anpassung ist Teil des Rebinds, nicht erst eines spaeteren Refactors

---

## 11. Arbeitsprinzipien fuer die Umstellung

1. Erst Rebind, dann Optimierung.
2. Erst kompatibel machen, dann absorbieren.
3. Keine grossen API- oder Typrefactors waehrend des ersten Umstiegs.
4. Auth- und Runtime-Grenzen zunaechst stabil lassen.
5. Selektive Uebernahme nur dort, wo sie dem Gateway direkt hilft.

---

## 12. Zusammenfassung

Kurzfristig ist der richtige Weg:

1. neues `go-crypto-trader` anbinden
2. alten Vendor-Fork abloesen und archivieren
3. Rebind ueber die bestehende RPC-Grenze stabilisieren
4. danach gezielt GCT-Teile fuer Broker/DEX/Gateway-Blueprints absorbieren

Langfristig bleibt offen, ob:

- GCT nur Engine-Layer bleibt
- oder schrittweise als locker integrierte Go-Library in das Gateway hinein
  "verschmilzt"

Diese Datei dient ab jetzt als zentrale Plan-Referenz fuer diesen Pfad.
