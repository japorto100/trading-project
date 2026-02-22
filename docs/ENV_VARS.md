# Env-Variablen: Wo eingebunden, Go vs Next

Kurzreferenz: Welche Variablen liest welcher Teil des Projekts, und wo eintragen (Root `.env` vs `go-backend/.env`).

**golangci-lint installieren:**  
`go install github.com/golangci/golangci-lint/v2/cmd/golangci-lint@latest` – von **beliebigem Verzeichnis** (Root oder go-backend). Das Tool landet in `$GOPATH/bin` (bzw. `$env:GOPATH\bin`). Danach in **go-backend** ausführen: `golangci-lint run ./cmd/... ./internal/...`

## Sind alle aus .env.example eingebunden?

Ja. Die Einträge in **Root `.env.example`** und **`go-backend/.env.example`** werden im Code verwendet (Next.js: `process.env.*`, Go: `os.Getenv` in `internal/app/wiring.go`). Unbenutzte oder optionale Blöcke sind auskommentiert.

## Go-Backend: Warum gab es kein .env und wie laufen Tests?

- Das **Go-Gateway** lädt **keine .env-Datei** selbst; es nutzt nur `os.Getenv`. Wenn du `go run ./cmd/gateway` von Hand startest, musst du die Werte in der **Prozess-Umgebung** setzen (z. B. in der Shell oder indem ein Script `go-backend/.env` liest und die Variablen setzt).
- **Tests** (`go test ./...`) brauchen **kein .env**: Sie nutzen Fakes/Mocks (z. B. `fakeQuoteClient`, `fakeGameTheoryScorer`). Die echten Connector-Clients werden nicht aufgebaut; deshalb laufen Tests auch ohne gesetzte API-Keys.
- **Empfehlung:** `go-backend/.env` anlegen (z. B. aus `.env.example` kopieren) und beim Start des Gateways laden. Das Script **`scripts/dev-stack.ps1`** (Repo-Root) lädt `go-backend/.env` in die Prozess-Umgebung, bevor es das Gateway startet.

## GCT (GoCryptoTrader) – „wenn GCT wirklich laufen soll“

- **GCT** ist die **separate Binary** (Crypto/Backtester). Sie ist **nicht** Teil von „alle 3 starten“ (Gateway + Python + Next).  
- **„Alle 3 starten“** = Go-**Gateway** + Python-Services + Next.js. Das Gateway kann **ohne** laufendes GCT betrieben werden (Finnhub, FRED, Geo, News laufen dann; nur Crypto-Quotes und echter Backtest-Executor brauchen GCT).
- **GCT mit „alle starten“:** `bun run dev:full:gct` oder `.\scripts\dev-stack.ps1 -WithGCT` startet **GCT zuerst**, dann Gateway, Python, Next. GCT-Binary muss gebaut sein: `cd go-backend\vendor-forks\gocryptotrader && go build .`
- **GCT_USERNAME** / **GCT_PASSWORD** = die Werte aus der GCT-Config (`remoteControl`). Das Script verwendet Werte aus **go-backend/.env** (oder Default `admin` / `Password`). Dieselben Werte müssen in **go-backend/.env** stehen, damit das Gateway sich bei GCT anmeldet.

## Game-Theory / Geo – _tmp_ref_review vs echte Implementation

- Der Ordner **`_tmp_ref_review`** (z. B. unter `tradingview-clones\_tmp_ref_review\GameTheory`) liegt **außerhalb** von `tradeview-fusion` und dient nur als **Referenz/Review** (z. B. von Codex genutzt). Er ist **nicht** die laufende Implementation.
- **Echte Implementation:**
  - **Python:** `python-backend/services/geopolitical-soft-signals/` (FastAPI, u. a. `POST /api/v1/game-theory/impact`).
  - **Go:** `go-backend/internal/connectors/gametheory/` (HTTP-Client zu diesem Python-Service), `go-backend/internal/services/geopolitical/game_theory_service.go`.
- **GEOPOLITICAL_GAMETHEORY_URL:** Muss auf **denselben** Python-Service zeigen wie die Soft-Signals (ein App, ein Port). Also **`http://127.0.0.1:8091`** – identisch mit `GEOPOLITICAL_SOFT_SIGNAL_URL` im Root-.env.

## Was genau „Prozess-Umgebung“ für Go heißt

- Beim Aufruf `go run ./cmd/gateway` erbt der Go-Prozess die **Umgebung der Shell**. Wenn in der Shell `FINNHUB_API_KEY` oder `GEOPOLITICAL_GAMETHEORY_URL` nicht gesetzt sind, liefert `os.Getenv` leer bzw. Default.
- **Für dich:** Entweder (1) **go-backend/.env** pflegen und ein **Start-Script** (z. B. `scripts/dev-stack.ps1`) diese Datei lesen und die Variablen für den Prozess setzen lassen, oder (2) in der Shell vor `go run` exportieren (z. B. `$env:FINNHUB_API_KEY="..."`). Das Script `scripts/dev-stack.ps1` übernimmt (1).

## Optional: Welche Variable wo (Frontend/Next vs Go)

| Thema | Wo eingetragen | Wer liest es |
|--------|-----------------|--------------|
| **Finnhub, FRED, ECB, ACLED, GDELT, News, CrisisWatch, Game-Theory-URL** | **go-backend/.env** (bzw. Env des Go-Prozesses) | Go-Gateway (`wiring.go`) |
| **GCT_*** (GRPC, User, Password, Backtest)** | **go-backend/.env** | Go-Gateway |
| **GO_GATEWAY_BASE_URL**, **GEOPOLITICAL_*_CACHE_MS**, **INDICATOR_SERVICE_***, **GEOPOLITICAL_SOFT_SIGNAL_*** | **Root .env** | Next.js (Server) |
| **Market-Data-Provider-Keys** (Twelve Data, Alpha Vantage, Polygon, FMP, …), **CCXT_***, **NEWS_*_API_KEY** | **Root .env** | Next.js (TS-Provider, Übergang bis alles über Go läuft) |
| **DATABASE_URL, NEXTAUTH_*, CORS_*** | **Root .env** | Next.js |

Später „alles in Go“: Weitere Datenquellen dann nur noch in **go-backend/.env**; Next braucht sie nicht mehr.

## Aktuell: Konkret was in Go, was in Next

**Nur Go-Gateway (go-backend/.env):**  
`GATEWAY_HOST`, `GATEWAY_PORT`, `GCT_GRPC_ADDRESS`, `GCT_JSONRPC_ADDRESS`, `GCT_USERNAME`, `GCT_PASSWORD`, `GCT_HTTP_TIMEOUT_MS`, `GCT_HTTP_RETRIES`, `GCT_JSONRPC_INSECURE_TLS`, `GCT_PREFER_GRPC`, `ECB_*`, `FINNHUB_*`, `FRED_*`, `ACLED_*`, `GDELT_*`, `CRISISWATCH_*`, `GEOPOLITICAL_GAMETHEORY_URL`, `GEOPOLITICAL_GAMETHEORY_TIMEOUT_MS`, `NEWS_*`, `GCT_STRATEGY_EXAMPLES_DIR`, `GCT_BACKTEST_*`, `MACRO_INGEST_*`.

**Nur Next.js (Root .env):**  
`GO_GATEWAY_BASE_URL`, `TWELVE_DATA_API_KEY`, `ALPHA_VANTAGE_API_KEY`, `POLYGON_API_KEY`, `FMP_*`, `EODHD_*`, `MARKETSTACK_*`, `COINMARKETCAP_*`, `FINAGE_*`, `FRED_API_KEY` (für TS-Provider-Fallback), `YFINANCE_BRIDGE_URL`, `ENABLE_CCXT_FALLBACK`, `CCXT_*`, `NEWSDATA_*`, `NEWSAPIAI_*`, `GNEWS_*`, `WEBZ_*`, `GEOPOLITICAL_SOFT_SIGNAL_*`, `INDICATOR_SERVICE_*`, `GEOPOLITICAL_*_CACHE_*`, `FINBERT_*`, `DATABASE_URL`, `NEXTAUTH_*`, `CORS_*`, `NEXT_PUBLIC_*`, alle `ENABLE_*_INGEST` (OFAC, UK, UN, Central Bank), `RELIEFWEB_APPNAME`, `ACLED_*` (wenn Next direkt ACLED anspricht).

## Prisma: generate / push vor PR?

- **`bun run db:generate`** (bzw. `prisma generate`): Nach **Schema-Änderung** oder nach **frischem Clone**, damit der Prisma-Client zum aktuellen Schema passt. Bei PR: nur nötig, wenn `prisma/schema.prisma` geändert wurde.
- **`bun run db:push`** (bzw. `prisma db push`): Schreibt das Schema in die **Datenbank** (ohne Migrations-Dateien). Für lokale Dev-DBs. Bei PR: in der Regel **nicht** ausführen (CI/DB getrennt); nur wenn euer Workflow explizit „push vor Commit“ vorsieht.

Wenn am Schema nichts geändert wurde: **weder generate noch push** für einen normalen PR nötig.

**Woher weiß ich, ob sich das Schema geändert hat?**  
Wenn du oder jemand **`prisma/schema.prisma`** bearbeitet hat (Modelle, Felder, Relationen) oder eine **Migration** hinzugefügt wurde. Technisch: `git diff prisma/schema.prisma` oder `git status` vor dem Commit – wenn die Datei geändert ist, nach dem Clone bzw. vor dem Build `prisma generate` ausführen.

## Was ist „Motor“ bei GCT?

**GCT = die Laufzeit-Engine** für alles, was direkt mit Börsen und Backtester zu tun hat:

- **Exchange-Anbindung:** WebSocket/REST zu Binance, Kraken, etc., Orderbuch, Trades, Candles.
- **Order-Execution:** Orders senden, stornieren, Status abfragen (wenn Bot-Modus genutzt wird).
- **Backtester:** Strategien gegen historische Daten laufen lassen, Reports erzeugen.
- **gRPC/JSON-RPC-Server:** GCT exponiert diese Dienste; unser **Gateway** spricht mit GCT (gRPC) und bietet daraus eine **produktorientierte HTTP-API**. Der „Motor“ ist also: alles, was **unter der Haube** läuft (Connections, Datenströme, Backtest-Runtime). Das Gateway ist die **Schnittstelle** davor.

## Warum Gateway + eigene Adapter statt alles in GCT?

- **GoCryptoTrader (GCT)** ist eine **Upstream-**Trading-Engine (Crypto, Backtester). Bei einem Pull/Update werden nur die Dateien unter **vendor-forks/gocryptotrader** aktualisiert.
- **Finnhub, FRED, Geo, News** sind **keine** Bestandteile von GCT. Sie sind **unsere** Produkt-Anforderungen und leben bewusst im **Gateway** (eigene Connectors in `go-backend/internal/connectors/`). So bleiben wir unabhängig vom GCT-Release-Zyklus und können die App-API (HTTP-Contract, Fehlermapping, Geo/Python-Bridge) stabil halten.
- **Ergebnis:** Pull/Update betrifft nur den GCT-Fork; Gateway-Code (inkl. Finnhub, Geo, etc.) bleibt unser und wird nicht überschrieben.
