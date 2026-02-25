# Go Data Router: Adaptive Multi-Source Financial Data Routing

> **Stand:** 2026-02-22 | **Kontext:** Unser Go-Gateway aggregiert 15+ bestehende und 30+ geplante Datenquellen (Global Expansion: EM-Zentralbanken, SDMX-Statistik, Asia/Latam-Boersen, Legal/Sanctions -- siehe [`REFERENCE_PROJECTS.md`](./REFERENCE_PROJECTS.md)). Aktuell: statische Prioritaetsliste im TS-`ProviderManager`. Ziel: intelligentes Asset-Class-Routing mit adaptiver Gesundheitsmessung im Go-Layer + **BaseConnector-Architektur** (Sek. 12) die 50+ Connectors skalierbar macht.
>
> **Fazit vorab:** Kein Open-Source-Projekt loest das komplett. Aber mit `failsafe-go` (Resilience) + Bifrost-Pattern (adaptive Gewichtung) + OpenBB-Pattern (Asset-Class-Priority) + **9 Quellen-Gruppen mit speziellem Handling** (Sek. 12.1) laesst sich das in ~500 LoC Router + ~600 LoC BaseConnector Go-Code bauen.
>
> **Abgrenzung:** Dieses Dokument behandelt **strukturierte API-Daten** (OHLCV, Macro, News-Headlines). Fuer **unstrukturierte Quellen** (YouTube-Transcripts, Reddit-Posts, Copy/Paste, Chat-Exports) die LLM-Verarbeitung und Human-in-the-Loop Review benoetigen, siehe [`UNIFIED_INGESTION_LAYER.md`](./UNIFIED_INGESTION_LAYER.md). Beide nutzen Go als Fetching-Layer -- der Go Data Router fuer API-Routing mit Health/Fallback, die UIL-Connectors fuer einfaches Polling.

---

## 1. Problemstellung

Mit 15+ bestehenden Providern (4 Go, 11 TS-Uebergang) und 30+ geplanten (EM-Zentralbanken, SDMX, Asia-Boersen, Legal/Sanctions -- Sek. 13) brauchen wir:

1. **Asset-Class-Routing:** "US Equities Intraday" → andere Provider-Reihenfolge als "Commodity EOD"
2. **Adaptive Gesundheit:** Latenz, Error Rate, Freshness, Rate-Limit-Headroom pro Provider tracken
3. **Automatischer Fallback:** Circuit Breaker pro Provider, naechster in der Kette bei Ausfall
4. **Rate-Limit-Awareness:** Provider mit erschoepftem Kontingent temporaer ueberspringen

Statische Pro-Symbol-Konfiguration skaliert nicht (10.000+ Symbole). Asset-Class-Regeln (~10 Eintraege) schon.

---

## 2. Empfehlung: Architektur

### Paketstruktur

```
go-backend/internal/router/
  config.yaml       # Asset-Class → Provider-Priority (~50 Zeilen)
  router.go         # Asset-Class-Erkennung + Provider-Selection
  health.go         # Latenz/Error/Freshness-Tracker pro Provider (Ring-Buffer, 5s Window)
  scoring.go        # Adaptive Gewichtung (Bifrost-Pattern)
  ratelimit.go      # Token-Bucket pro Provider (aus Config)
```

### Datenfluss

```
Request: GetQuote("AAPL", equity)
  |
  v
router.go: Asset-Class = us_equities_realtime
  |
  v
config.yaml: providers = [finnhub_ws, polygon, twelve_data, fmp, yahoo]
  |
  v
scoring.go: Gewichte berechnen (Bifrost-Pattern, alle 5s)
  finnhub_ws:  0.92 (healthy, 12ms, 0.1% errors)
  polygon:     0.78 (healthy, 45ms, 0.3% errors)
  twelve_data: 0.00 (circuit open, 15% errors)  ← uebersprungen
  fmp:         0.71 (healthy, 80ms, 0.5% errors)
  |
  v
failsafe-go: Fallback-Chain [finnhub_ws → polygon → fmp → yahoo]
  |
  v
Response: AAPL Quote von finnhub_ws
```

### Config-Beispiel

```yaml
asset_classes:
  us_equities_realtime:
    providers: [finnhub_ws, polygon, twelve_data, fmp, yahoo]
    strategy: latency_first
  us_equities_eod:
    providers: [polygon, yahoo, fmp, alpha_vantage]
    strategy: freshness_first
  commodity_futures:
    providers: [nasdaq_dl, yahoo, alpha_vantage]
    strategy: coverage_first
  forex_spot:
    providers: [ecb, finnhub, tiingo, twelve_data]
    strategy: freshness_first
  macro:
    providers: [fred, world_bank, imf]
    strategy: authority_first
  crypto_spot:
    providers: [gct, ccxt]
    strategy: latency_first
  crypto_derivatives:
    providers: [ccxt, gct]
    strategy: latency_first
  cot_positioning:
    providers: [cftc]
  bonds_yields:
    providers: [fred, us_treasury, ecb_yields]
    strategy: authority_first

provider_limits:
  finnhub:     { rpm: 60,  daily: null }
  polygon:     { rpm: 5,   daily: null }     # Free Tier
  alpha_vantage: { rpm: 5, daily: 500 }
  twelve_data: { rpm: 8,   daily: 800 }
  nasdaq_dl:   { rpm: 30,  daily: 50000 }
  fred:        { rpm: 120, daily: null }
  yahoo:       { rpm: null, daily: null }    # Inoffiziell, kein hartes Limit
```

---

## 3. Adaptive Gewichtung (Bifrost-Pattern)

Alle 5 Sekunden pro Provider neu berechnen:

```
weight = (1 - error_penalty * 0.50)    # 50% Gewicht: Fehlerrate
       * (1 - latency_score * 0.20)    # 20% Gewicht: Latenz (normalisiert)
       * (1 - utilization  * 0.05)     # 5% Gewicht: Rate-Limit-Auslastung
       * momentum                       # Recovery-Faktor (langsam hochfahren nach Ausfall)
```

| Zustand | Bedingung | Effekt |
|---|---|---|
| **Healthy** | error_rate < 2% | Volles Gewicht |
| **Degraded** | 2% < error_rate < 5% | Gewicht reduziert, noch in Rotation |
| **Failed** | error_rate > 5% oder Timeout-Serie | Circuit Breaker offen, aus Rotation |
| **Recovering** | Nach Circuit-Breaker-Reset | Momentum-Faktor startet bei 0.1, steigt ueber 30s auf 1.0 |

Quelle: [Bifrost Adaptive Load Balancing](https://docs.getbifrost.ai/enterprise/adaptive-load-balancing) -- <10 µs Overhead.

---

## 4. Go-Libraries (produktionsreif)

| Library | Rolle | Stars | Link |
|---|---|---|---|
| **failsafe-go** | Circuit Breaker + Retry + **Fallback-Chain** composable | ~600 | [failsafe-go.dev](https://failsafe-go.dev) |
| **sony/gobreaker** | 3-State Circuit Breaker (Closed/Open/Half-Open) | ~3.5k | [GitHub](https://github.com/sony/gobreaker) |
| **vulcand/oxy** | Weighted Round-Robin + Circuit Breaker + Rate Limit (Middleware) | ~2.1k | [GitHub](https://github.com/vulcand/oxy) |

**Empfehlung:** `failsafe-go` als Kern. Ermoeglicht:

```go
result, err := failsafe.Get(
    func() (Quote, error) { return finnhub.GetQuote(ctx, symbol) },
    circuitBreaker,   // pro Provider
    retryPolicy,      // 1 Retry mit Backoff
    fallback.WithFunc(func(_ Quote, err error) (Quote, error) {
        return polygon.GetQuote(ctx, symbol)  // naechster Provider
    }),
)
```

---

## 5. Design-Referenzen (Pattern, kein Code-Import)

| Referenz | Was wir uebernehmen | Link |
|---|---|---|
| **OpenBB ODP** | Provider-Priority pro Endpoint + Credential-Check + Fallback-Kette | [docs.openbb.co](https://docs.openbb.co/) |
| **Lava rpcsmartrouter** | Go-native QoS-Routing: Primary/Backup Tiers, Health-Monitoring, YAML-Config | [GitHub](https://github.com/lavanet/lava) |
| **OpenRouter** | API-Design: `order`, `allow_fallbacks`, Sort by latency/throughput | [Docs](https://openrouter.ai/docs/guides/routing/provider-selection) |
| **Gravitee** | WRR + Health Checks (HTTP, CRON) + Failover-Schwellwerte | [Docs](https://documentation.gravitee.io/apim/configure-v2-apis/load-balancing-failover-and-health-checks) |

---

## 6. Relevante Open-Source-Projekte

> Kein Projekt loest unser Problem komplett. Hier die nuetzlichsten, gefiltert nach Relevanz.

| Projekt | Sprache | Was es tut | Unser Nutzen |
|---|---|---|---|
| **Tulip** | **Go** | Multi-Source Market Data API, `Source`-Interface, Cache | Naechster Verwandter; als Pattern-Vorlage fuer unsere Adapter-Abstraktion |
| **unified-data** | Python | Einzelnes API, auto-routet zu ccxt/yfinance/akshare | Blueprint fuer "ein Interface, internes Routing nach Asset-Klasse" |
| **Hummingbot Gateway** | TS | DEX-Aggregation, Rate Limiting, Multi-Network | Unified-API + Rate-Limit Pattern |
| **Databento DBN** | Rust | Normalisierte Multi-Venue-Daten, immutables Format | Referenz fuer Normalisierung und Data-Quality-Semantik |

### Buch-Referenz: Unified Data Import Pattern (Ch.2 L1319-1381) mastering-finance-python.md

Das Buch "Mastering Financial Markets with Python" implementiert eine `import_data()` Funktion die Yahoo Finance, MetaTrader5, FRED und CSV/XLSX hinter einem einzigen Interface vereint (L1369-1381). Konzeptionell ist das exakt unser Go Data Router in Miniatur -- ein Aufrufer, mehrere Provider, automatische Selektion nach `data_provider`-Parameter. Relevante Ideen fuer unseren Go-Router:

- **Einheitliches Interface:** `import_data(name, start_date, end_date, data_provider, time_frame)` → in Go: `router.GetOHLCV(symbol, from, to, asset_class)`
- **Provider als Enum:** Yahoo, MetaTrader, FRED, Manual → in Go: Finnhub, Polygon, AlphaVantage, Yahoo, etc.
- **Fallback-Idee:** Das Buch hat keinen automatischen Fallback (explizite Provider-Wahl). Genau das ist unser Mehrwert: Asset-Class-basiertes Auto-Routing + Health-Fallback.

### Nicht direkt nuetzlich (Archiv)

Projekte die in der Recherche auftauchten aber keinen direkten Nutzen haben: FLOX (C++, Connector-Abstraktion), Wingfoil (Stream-Processing, kein Routing), PMUnifiedAPI (leer), market_data_collector (Go, nur Ingestion), StockMQ (Message Broker), Barter-Data (Rust, nur Crypto), PriceHub (Python, nur Crypto).

---

## 7. Data Quality Scoring

Fuer die adaptive Gewichtung tracken wir pro Provider:

| Metrik | Messung | Quelle |
|---|---|---|
| **Latenz** (p50, p99) | Ring-Buffer, letzte 100 Requests | Eigene Messung im Connector |
| **Error Rate** | Fehler / Gesamt in Sliding Window (5 min) | Circuit Breaker State |
| **Freshness** | Zeitdifferenz zwischen Provider-Timestamp und Empfang | Response-Header oder Payload |
| **Rate-Limit-Headroom** | Verbleibende Requests im aktuellen Fenster | `X-RateLimit-Remaining` Header |
| **Gap Rate** | Fehlende Bars/Ticks in OHLCV-Serien | Nur fuer historische Daten relevant |

Referenzen fuer Quality-Dimensionen: [Intrinio Blog](https://intrinio.com/blog/how-to-ensure-data-quality-when-using-financial-apis), [Databento Integrity](https://medium.databento.com/working-with-high-frequency-market-data-data-integrity-and-cleaning-f611f9834762).

---

## 8. Aufwand und Einordnung

| Aspekt | Schaetzung |
|---|---|
| **Eigencode** | ~500 LoC (router + health + scoring + ratelimit) |
| **Dependency** | `failsafe-go` (oder `sony/gobreaker` + eigener Fallback-Wrapper) |
| **Config** | ~50 Zeilen YAML (Asset-Class → Provider-Liste + Rate Limits) |
| **Zeitaufwand** | 2-3 Tage fuer Basis, +1 Tag fuer adaptive Gewichtung |
| **Wo es lebt** | `go-backend/internal/router/` -- integriert sich in bestehende Handler |

### SOTA-Einordnung (Februar 2026)

Kein Open-Source-Projekt kombiniert Asset-Class-Routing + adaptive Gesundheitsmessung + Financial-Data-spezifisches Rate-Limiting in Go. OpenBB (Python) kommt am naechsten, hat aber kein adaptives Health-Tracking. Die grossen Quant-Shops (Two Sigma, Citadel) haben proprietaere Versionen. Was wir bauen, kombiniert:

- **OpenBB-Pattern:** Asset-Class-Priority + Credential-Check
- **Bifrost-Pattern:** Adaptive Gewichtung (error + latency + utilization + momentum)
- **failsafe-go:** Go-native Resilience (Circuit Breaker + Retry + Fallback)

---

## Quellen

- [Bifrost Adaptive Load Balancing](https://docs.getbifrost.ai/enterprise/adaptive-load-balancing)
- [OpenBB Open Data Platform](https://docs.openbb.co/)
- [Lava rpcsmartrouter (Go)](https://github.com/lavanet/lava)
- [OpenRouter Provider Routing](https://openrouter.ai/docs/guides/routing/provider-selection)
- [failsafe-go](https://failsafe-go.dev)
- [sony/gobreaker](https://github.com/sony/gobreaker)
- [Gravitee Health Checks](https://documentation.gravitee.io/apim/configure-v2-apis/load-balancing-failover-and-health-checks)
- [Tulip (Go Multi-Source)](https://github.com/shoriwe/tulip)
- [Intrinio: Data Quality](https://intrinio.com/blog/how-to-ensure-data-quality-when-using-financial-apis)
- [Databento: Data Integrity](https://medium.databento.com/working-with-high-frequency-market-data-data-integrity-and-cleaning-f611f9834762)

---

## 9. Symbol-Universum + Symbol-Katalog-Service (NEU 2026-02-19)

> Offene Frage: Wie bekommen wir eine vollstaendige Liste aller Symbole (Crypto, Forex, Aktien, Futures, Indizes)?
>
> **Vollstaendige Quellen-Tabelle (URLs, APIs, Formate):** [`REFERENCE_PROJECTS.md`](./REFERENCE_PROJECTS.md) → Sektion "Symbol-Universum" + "DEX vs CEX"

### Empfehlung fuer Go Data Router

1. **Symbol-Katalog-Service** in Go: periodisch (1x/Tag) alle Listen pullen und in lokale DB/JSON speichern
2. **Normalisiertes Format:** `{ symbol: "AAPL", name: "Apple Inc.", assetClass: "us_equity", exchange: "NASDAQ", provider_symbols: { finnhub: "AAPL", polygon: "AAPL", yahoo: "AAPL" } }`
3. **DEX-Token:** v2 -- ueber CoinGecko Contract-Address-Mapping oder Arkham Entity-Labels
4. **CEX vs DEX:** CEX bereits via `gct` + `ccxt`. DEX braucht Chain-spezifische Adapter (v2)

### Aufwand

| Aspekt | Schaetzung |
|---|---|
| Symbol-Katalog Cron-Job (SEC + Finnhub + CoinGecko) | ~150 LoC, 1 Tag |
| Normalisierungs-Layer (Provider-Symbol-Mapping) | ~100 LoC, 0.5 Tage |
| DEX-Adapter (CoinGecko mit Chain-ID) | ~80 LoC, v2 |

---

## 10. GoCryptoTrader Fork-Strategie (aus project_audit2 Sek. 9 uebernommen)

> **Evaluieren:** Die Fork-Strategie ist operativ erprobt (Stand 15.02.2026, Gateway + Adapter laufen). Ob die volle Fork-Tiefe (Exchanges rauswerfen, gctscript entfernen) sinnvoll ist oder ob der leichtgewichtige Ansatz (Fork als Vendor, Gateway davor) genuegt, sollte bei wachsender Codebasis nochmal evaluiert werden.

### 10.1 Warum Fork

GoCryptoTrader ist **MIT-lizenziert** -- uneingeschraenkt forkbar, modifizierbar und kommerziell nutzbar. Der Fork gibt ~20.000-40.000 Zeilen Go-Code fuer WebSocket, Orders, Backtesting, Portfolio die nicht selbst geschrieben werden muessen.

**Warum Fork statt Upstream-Dependency:**
- Nur 5-10 der 30+ Exchanges relevant (Binance, Kraken, Coinbase, etc.)
- CLI/TUI Interface unnoetig (headless betreiben)
- Eigene Events/Hooks fuer Frontend (Custom WebSocket Messages an Next.js)
- Config-System auf eigenes Setup anpassbar
- Upstream-Updates koennen selektiv cherry-picked werden

### 10.2 Ist-Zustand des Forks

| Aspekt | Status |
|--------|--------|
| Fork-Lokation | `go-backend/vendor-forks/gocryptotrader` |
| Gateway | Eigener `go-backend/` Service mit stabilen HTTP-Contracts |
| GCT-Connector | Live (gRPC + JSON-RPC, TLS, Env-gesteuert) |
| Adapter (eigene) | Finnhub (REST+WS), ECB (Forex), FRED (Macro), ACLED, GDELT, CrisisWatch, RSS/News |
| Backtester-Zugriff | Via Gateway (`/api/v1/backtest/runs`), echter GCT-Executor optional |
| Dev-Stack | `go-backend/scripts/dev-stack.ps1`, reproduzierbar |
| Quality-Gates | `go test`, `go vet`, `go test -race`, `golangci-lint` |

### 10.3 Gateway-Architektur-Prinzip

```
GoCryptoTrader (Motor)
  - 30+ Exchange WebSockets
  - Order Execution
  - Backtesting Engine
  - Portfolio Tracking
  - gRPC API
       |
       v
Gateway (go-backend/) = stabiler HTTP-Contract + Validation + eigene Adapter
       |
       v
Next.js API Routes (Proxy) + Python Services (Processing)
```

**Regel:** GCT = Motor (Order, Backtest, Portfolio). Gateway = stabiler HTTP-Contract + Validation + zusaetzliche Adapter. **Kein Rebuild** von Order/Backtest/Portfolio ausserhalb GCT -- nur stabile Contracts drumherum.

### 10.4 Fork-Modifikationen (evaluieren bei Bedarf)

| Bereich | Moegliche Aktion | Prioritaet |
|---------|-----------------|------------|
| `exchanges/` | Nur relevante Exchanges behalten | NIEDRIG -- aktuell kein Problem |
| `gctscript/` | Entfernen (wird nicht gebraucht) | NIEDRIG -- spart Angriffsflaeche |
| `cmd/gocryptotrader/` | CLI-Flags reduzieren | NIEDRIG -- headless genuegt |
| `config/` | Default-Config anpassen | ERLEDIGT (dev-stack.ps1) |
| `engine/` | Custom Event-Hooks fuer Frontend | MITTEL -- bei Bedarf fuer Push-Events |

### 10.5 Integration mit Next.js

| Option | Beschreibung | Status |
|--------|-------------|--------|
| gRPC direkt | `@grpc/grpc-js` npm Package | Moeglich, nicht implementiert |
| REST Gateway | GoCryptoTrader's eingebauter REST-Endpoint | **Aktiv** (JSON-RPC via Gateway) |
| Go Gateway HTTP | Eigener Gateway als Proxy mit Validation | **Aktiv** (primaerer Pfad) |

### 10.6 Upstream-Sync

```bash
git fetch upstream
git merge upstream/main  # oder cherry-pick einzelner Commits
```

Selektiv: nur Security-Fixes und Exchange-API-Updates cherry-picken. Keine strukturellen Aenderungen blind uebernehmen.

> **Fork-Details und Entwicklungsnotizen:** `go-backend/FORK_NOTES.md`

---

---

## 11. Options + Dark Pool Data Sources

> **Kontext:** Neue Datenklassen fuer INDICATOR_ARCHITECTURE.md Sektionen 5n (Dark Pool), 5o (Call/Put Walls / GEX), 5p (Expected Move) und Todo #61 (Options Calculator). Alle Quellen folgen dem Go-first Fetching-Prinzip: Go holt, Python verarbeitet.

### 11.1 Config-Erweiterung: Neue Asset-Classes

```yaml
asset_classes:
  # ... bestehende Klassen ...

  options_flow:
    providers: [polygon_options, tradier_options, unusual_whales]
    strategy: freshness_first
    notes: "Options-Chain inkl. IV, OI, Delta, Gamma pro Strike+Expiry. Polygon kostenlos fuer EOD, Tradier kostenlos mit Account."

  dark_pool_weekly:
    providers: [finra_ats]
    strategy: authority_first
    notes: "FINRA ATS woechentliche Veroeffentlichung. Nur US Equities. Kein Real-Time. Kostenlos."

  volatility_index:
    providers: [cboe_vix, stooq_vix]
    strategy: freshness_first
    notes: "CBOE VIX (S&P500 30D IV), VIX9D (9-Tage), VVIX (Volatilitaet der Volatilitaet). Alle kostenlos."
```

### 11.2 Provider-Detail-Tabelle: Options + Dark Pool

| Provider | Kuerzel | Was | Kosten | Limit | Go-Endpoint |
|----------|---------|-----|--------|-------|-------------|
| **Polygon Options** | `polygon_options` | Options-Chain: Strike, Expiry, Bid/Ask, IV, OI, Delta, Gamma, Theta, Vega | Kostenlos (EOD), $29/Mo (Real-Time) | 5 req/min (Free) | `GET /v3/snapshot/options/{ticker}` |
| **Tradier** | `tradier_options` | Options-Chain + Greeks, EOD Preise | Kostenlos mit Account | 200 req/min | `GET /markets/options/chains` |
| **Unusual Whales** | `unusual_whales` | Ungewoehnliche Options-Flows (grosse Blocks, Sweeps), Sentiment | Freemium (~$30/Mo fuer Full Access) | - | REST API (nach Auth) |
| **FINRA ATS** | `finra_ats` | Dark Pool ATS Volumen pro Symbol (woechentlich) | Kostenlos | Keine Paginierung noetig | `https://otctransparency.finra.org/otctransparency/api/weekly` |
| **CBOE VIX** | `cboe_vix` | S&P500 30-Tage Implied Volatility (VIX), VIX9D, VVIX | Kostenlos | - | Stooq/FRED/Direct Download |
| **FRED (VIX)** | `fred` (bereits) | VIXCLS (VIX taeglich), historisch ab 1990 | Kostenlos | 120 req/min | `GET /fred/series/observations?series_id=VIXCLS` |

### 11.3 FINRA ATS Dark Pool: Go-Fetcher Skizze

```go
// go-backend/internal/adapters/finra_ats.go
//
// FINRA publiziert woechentlich ATS (Alternative Trading System) Volumen-Daten.
// URL: https://otctransparency.finra.org/otctransparency/api/weekly/...
// Format: JSON { data: [{ issueSymbolIdentifier, totalWeeklyShareQuantity, ... }] }
//
// Fetching-Strategie:
// - Jeden Montag um 09:00 EST cron-Job
// - Daten der Vorwoche herunterladen + in DB schreiben (symbol, week_start, dp_volume, dp_trades)
// - Python berechnet dp_ratio = dp_volume / (dp_volume + exchange_volume)

type FINRAAtsRecord struct {
    Symbol      string  `json:"issueSymbolIdentifier"`
    WeekStart   string  `json:"weekStartDate"`
    DPVolume    int64   `json:"totalWeeklyShareQuantity"`
    DPTrades    int64   `json:"totalWeeklyTradeCount"`
}

func (a *FINRAAtsAdapter) FetchWeekly(ctx context.Context) ([]FINRAAtsRecord, error) {
    // https://otctransparency.finra.org/otctransparency/api/weekly/ATS
    // Optional: Filter auf spezifische Symbole (unser Watchlist)
}
```

### 11.4 Polygon Options: Go-Fetcher Skizze

```go
// go-backend/internal/adapters/polygon_options.go
//
// Polygon /v3/snapshot/options/{ticker} liefert die volle Options-Chain eines Symbols.
// Jede Option hat: strike_price, expiration_date, contract_type (call/put),
//                  implied_volatility, open_interest, greeks (delta, gamma, theta, vega)
// Free Tier: EOD-Daten, 5 req/min

type PolygonOption struct {
    Strike     float64 `json:"strike_price"`
    Expiry     string  `json:"expiration_date"`
    Type       string  `json:"contract_type"`  // "call" | "put"
    IV         float64 `json:"implied_volatility"`
    OI         int64   `json:"open_interest"`
    Delta      float64 `json:"delta"`
    Gamma      float64 `json:"gamma"`
    Theta      float64 `json:"theta"`
    Vega       float64 `json:"vega"`
    LastPrice  float64 `json:"last_price"`
    Volume     int64   `json:"day_volume"`
}

// Gateway-Endpoint: GET /api/options/chain?symbol=AAPL&expiry=2026-03-21
// Response: PolygonOption[] (gefiltert auf naechste 2 Expiries, ATM +-5 Strikes)
```

### 11.5 Kosten-Prioritaetsmatrix

| Feature | Minimale Quelle (kostenlos) | Bessere Quelle (Kosten) | Prioritaet |
|---------|----------------------------|------------------------|------------|
| **Dark Pool Volume** | FINRA ATS (woechentlich) | CBOE BZX Dark Book (~$500/Mo) | Todo #58, MITTEL |
| **Call/Put Walls + GEX** | Polygon Options Free (EOD) + Tradier | Polygon Options $29/Mo (Real-Time) | Todo #59, V2+ |
| **Expected Move** | CBOE VIX via FRED (S&P500 only) + Tradier IV | Polygon Options Real-Time | Todo #60, V2+ |
| **Options Calculator** | Tradier (kostenlos, US Stocks) | IBKR (alle Asset-Klassen, auch Futures) | Todo #61, V3+ |

---

## 12. BaseConnector-Architektur + Quellen-Gruppen (NEU 2026-02-22)

> **Kontext:** Mit 15+ bestehenden und 40+ geplanten Connectors (Global Expansion, Legal, Emerging Markets, Oracle Networks, DeFi, CBDC -- siehe [`REFERENCE_PROJECTS.md`](./REFERENCE_PROJECTS.md)) wird die bisherige 1:1 Copy/Paste-Struktur (`client.go` pro Connector mit wiederholtem HTTP-Boilerplate) unwartbar. Dieses Kapitel definiert **Quellen-Gruppen** (10 Gruppen, inkl. G10 Oracle Networks) mit jeweils speziellem Handling und einen **gemeinsamen BaseConnector** der Querschnitts-Logik zentralisiert.
>
> **Ist-Zustand-Analyse:** Jeder der 10 bestehenden Connectors hat eigenes `Config` struct, eigenen `NewClient()`, eigene HTTP-Request-Logik, eigenes Error-Wrapping in `gct.RequestError`. Shared Types (`Ticker`, `SeriesPoint`, `Pair`, `RequestError`) leben in `gct/client.go` -- historisch bedingt, nicht intuitiv. `news/retry.go` hat Backoff-Logik die nur im `news/`-Package sichtbar ist. Interfaces sind implizit am Consumer (Services) definiert, nicht am Provider -- das ist Go-idiomatic und soll so bleiben.

> **Implementierungs-Update (23. Feb 2026, Codex):** Baseline fuer Sek. 12 ist gestartet: `internal/connectors/base` enthaelt bereits `http_client`, `retry`, `ratelimit`, `types` plus erste Gruppen-Scaffolds (`sdmx_client`, `timeseries`, `bulk_fetcher`, `rss_client`, `diff_watcher`, `translation`, `oracle_client`). Der Adaptive Router (`internal/router/adaptive`) kann optionale Provider-Metadaten (`group`, `kind`) aus `provider-router.yaml` laden und im Status-Snapshot ausgeben. Zusaetzlich wurden `capabilities.go` (Provider-Capability-Matrix) und `error_classification.go` (Retry/Auth/Quota/Schema-Drift-Klassen) als GCT-inspirierte Base-Bausteine angelegt.

### 12.1 Die 10 Quellen-Gruppen

Nicht alle Quellen funktionieren gleich. Jede Gruppe hat eigenes Fetch-Pattern, eigene Fehlerbehandlung und eigene Base-Abstraktion.

| Gruppe | Pattern | Beispiele (bestehend) | Beispiele (neu) | Spezielles Handling |
|---|---|---|---|---|
| **G1: REST-API (Standard)** | HTTP GET → JSON → parse → return | Finnhub, FRED, ECB, Polygon, FMP | BCB, Banxico, RBI DBIE, BoK ECOS, TCMB, Tushare, J-Quants | Rate Limiting (Token Bucket), Circuit Breaker, Fallback-Chain. **Groesste Gruppe** (~30+ Connectors) |
| **G2: WebSocket Streams** | Persistent Connection, Subscription-Management | Finnhub WS, GCT (Exchange WS) | Tiingo WS, AllTick WS | Reconnect-Logik, Heartbeat, Subscription-Register, Backpressure. Eigene Lifecycle |
| **G3: SDMX-Protokoll** | Standardisiertes Statistik-Protokoll (REST + spezielle Query-Syntax) | -- (noch keiner) | IMF IFS, IMF WEO, OECD, ECB SDW, World Bank WDI, UN Data | Shared SDMX-Client: Dimension-Codes, Time-Period-Formatting, Cursor-Pagination. **Ein Client bedient 6+ Provider** |
| **G4: Zentralbank-Zeitreihen** | REST mit Series-ID → JSON/CSV Zeitreihe | FRED (de facto) | BCB SGS, Banxico SIE, RBI DBIE, BoK ECOS, TCMB EVDS, BCRA, Bank of Thailand | Alle liefern Zeitreihen im Format `[{date, value}]`. Auth variiert (kein Key / Free Key / Token). Shared `TimeSeriesClient` moeglich |
| **G5: Bulk/Periodic Download** | Cron → Download → Parse → Store. Kein Real-Time, kein Fallback | -- (CrisisWatch JSON-Persist ist Vorstufe) | CFTC COT (CSV weekly), FINRA ATS (JSON weekly), LBMA Fixing (CSV daily), FXCM Historical (CSV.GZ bulk), SCD Bundesgericht (CSV periodic), Stooq (ASCII bulk) | Cron-Scheduler, File-Download + gunzip, CSV/XML-Parser, Dedup, Idempotenz. Kein Health-Scoring noetig |
| **G6: RSS/Atom Feeds** | Periodisches Polling, XML-Parse, Dedup | CrisisWatch, News RSS (rss_client.go) | Global Legal Monitor, Nikkei Asia, Caixin, ET India, Al Jazeera Biz, SEC Enforcement RSS, CFTC RSS, BaFin, FCA | Bestehender `rss_parser.go` erweiterbar. Dedup via `<guid>` oder URL-Hash. Macro-Route-Klassifikation (UIL) |
| **G7: Sanctions/Legal XML-Listen** | Download → Diff-Detection → Alert bei Aenderung | -- (OFAC/UN/EU in Masterplan geplant) | SECO Sanktionslisten (XML), OFAC SDN (XML), UN Consolidated (XML), EU Sanctions Map | Shared `DiffWatcher`: Letzte Version speichern, Diff berechnen, neue Eintraege als GeoMap-Events emittieren |
| **G8: Non-English Sources** | Go fetcht Rohtext → Python LLM uebersetzt + extrahiert | -- | NBS China (Mandarin), PBoC (Mandarin), wenshu.court.gov.cn (Mandarin), SCJN/CVM (ES/PT), arabische Quellen | Go-Connector liefert Raw-Bytes/Text an Python-Queue. Python LLM-Pipeline: Detect Language → Translate → Extract Entities → Classify. Human-Review-Flag fuer Unsicherheit |
| **G9: Inoffizielle/Scraping** | Wie G1, aber fragiler (Format kann brechen) | Yahoo (unofficial) | NSE India (unofficial), investing.com (unofficial) | Extra Error-Monitoring: Response-Format-Validation, Schema-Drift-Detection (erwartet Field X, fehlt → Alert). ToS-Awareness-Flag in Config. Kein Fallback-TO diese Quellen, nur Fallback-FROM |
| **G10: Oracle Networks** | On-Chain Read oder REST-Gateway → aggregierte Preisdaten mit kryptographischer Verifizierung | -- | Chainlink Data Feeds, Pyth Network, Band Protocol, Redstone, API3 | **Dezentrale Preis-Verifikationsschicht.** Nicht als Primaer-Provider, sondern als Cross-Check gegen Web2-Provider. Median aus 17+ unabhaengigen Operators (Chainlink) bzw. 120+ institutionellen Publishern (Pyth). Oracle Disagreement (Divergenz Web2 vs. Web3) als eigenes Stress-Signal. Siehe REFERENCE_PROJECTS.md "Web3 Oracle Networks" |

### 12.2 BaseConnector-Paketstruktur

```
go-backend/internal/connectors/
  base/
    http_client.go     # BaseHTTPClient: Config, NewClient, DoRequest[T], Error-Wrapping
    ratelimit.go       # Token-Bucket pro Connector-Instanz (aus news/retry.go + router/ratelimit.go konsolidiert)
    retry.go           # Configurable Retry/Backoff (extrahiert aus news/retry.go)
    types.go           # Shared Types: Ticker, SeriesPoint, Pair, RequestError (aus gct/client.go migriert)
    sdmx_client.go     # SDMX-Protokoll-Client (Gruppe G3): Query-Builder, Dimension-Codes, Pagination
    timeseries.go      # TimeSeriesClient (Gruppe G4): Zeitreihen-Normalisierung, Date-Parsing
    bulk_fetcher.go    # BulkFetcher (Gruppe G5): Cron-Schedule, File-Download, CSV/XML-Parse
    rss_client.go      # RSSClient (Gruppe G6): extrahiert aus news/rss_client.go + rss_parser.go
    diff_watcher.go    # DiffWatcher (Gruppe G7): XML-List-Monitoring, Diff-Detection, Event-Emission
    translation.go     # TranslationBridge (Gruppe G8): Routing non-EN Text an Python-Queue
    oracle_client.go   # OracleClient (Gruppe G10): Chainlink/Pyth REST-Gateway, Cross-Check, Disagreement-Detection
  finnhub/
    client.go          # Embedded base.HTTPClient + finnhub-spezifische Logik
  fred/
    client.go          # Embedded base.HTTPClient (Gruppe G1 + G4 Hybrid)
  bcb/
    client.go          # Embedded base.TimeSeriesClient (Gruppe G4) -- ~40 LoC
  imf/
    client.go          # Embedded base.SDMXClient (Gruppe G3) -- IFS, WEO, PCPS ueber Dataset-Parameter
  cftc/
    client.go          # Embedded base.BulkFetcher (Gruppe G5) -- COT weekly CSV
  seco/
    client.go          # Embedded base.DiffWatcher (Gruppe G7) -- Sanctions XML
  nbs_china/
    client.go          # Embedded base.HTTPClient + base.TranslationBridge (Gruppe G1 + G8)
  ...
```

### 12.3 BaseHTTPClient (Kern -- Gruppe G1)

```go
// base/http_client.go -- Kern fuer ~30+ Connectors

type Config struct {
    BaseURL    string
    APIKey     string        // Optional (manche Provider brauchen keinen)
    Timeout    time.Duration // Default: 10s
    RateLimit  RateLimitConfig
    RetryCount int           // Default: 1
}

type HTTPClient struct {
    baseURL    string
    apiKey     string
    httpClient *http.Client
    limiter    *TokenBucket
    name       string        // Provider-Name fuer Logging/Metrics
}

func NewHTTPClient(cfg Config) *HTTPClient { ... }

// DoRequest fuehrt HTTP-Request aus mit Rate-Limiting, Retry, Error-Wrapping.
// Generisch ueber T -- erspart json.Unmarshal-Boilerplate in jedem Connector.
func DoRequest[T any](c *HTTPClient, ctx context.Context, method, path string, params url.Values) (T, error) {
    // 1. Rate-Limit warten
    // 2. HTTP-Request bauen (baseURL + path + params + apiKey)
    // 3. Ausfuehren mit Retry (configurable)
    // 4. Status-Code pruefen → RequestError bei != 2xx
    // 5. JSON-Decode in T
    // 6. Latenz + Error an Health-Tracker melden (fuer Router Sek. 3)
}
```

### 12.4 SDMXClient (Gruppe G3 -- Ein Client, 6+ Provider)

```go
// base/sdmx_client.go
//
// SDMX 2.1 / 3.0 REST-Protokoll -- verwendet von IMF, OECD, ECB, World Bank, UN.
// Statt 6 separate Connectors: 1 SDMXClient mit Provider-spezifischer Config.

type SDMXConfig struct {
    HTTPClient               // Embedded BaseHTTPClient
    DataflowID string        // z.B. "IFS" (IMF), "MEI" (OECD), "EXR" (ECB)
    Provider   SDMXProvider  // IMF | OECD | ECB | WorldBank | UN
}

type SDMXProvider int
const (
    IMF SDMXProvider = iota   // https://dataservices.imf.org/REST/SDMX_JSON.svc/
    OECD                       // https://sdmx.oecd.org/public/rest/
    ECB_SDW                    // https://data-api.ecb.europa.eu/service/
    WorldBank                  // https://api.worldbank.org/v2/
    UN                         // https://data.un.org/SdmxRest/
    ADB                        // https://kidb.adb.org/api/
)

func (c *SDMXClient) GetSeries(ctx context.Context, dimensions map[string]string, startPeriod, endPeriod string) ([]SeriesPoint, error) {
    // Baut SDMX-Query: /data/{dataflowID}/{dimensionKey}?startPeriod=2020&endPeriod=2026&format=jsondata
    // Parse SDMX-JSON (standardisiert!) in []SeriesPoint
}
```

> **Implikation:** Die Prios G1 (IMF IFS), G2 (World Bank WDI), G3 (IMF WEO), G9 (OECD) aus REFERENCE_PROJECTS.md werden alle mit **einem einzigen SDMXClient** bedient. Aufwand pro zusaetzlichem SDMX-Provider: ~20 LoC Config statt ~100 LoC Connector.

### 12.5 TimeSeriesClient (Gruppe G4 -- EM-Zentralbanken)

```go
// base/timeseries.go
//
// Viele Zentralbank-APIs liefern dasselbe Grundformat: [{date, value}]
// Nur URL-Pattern und Auth variieren.

type TimeSeriesConfig struct {
    HTTPClient
    URLTemplate  string  // z.B. "https://api.bcb.gov.br/dados/serie/bcdata.sgs.%s/dados?formato=json"
    DateField    string  // "data" (BCB), "date" (RBI), "time" (TCMB)
    ValueField   string  // "valor" (BCB), "value" (RBI), "TP_DK1_USD_A_YTL_S" (TCMB)
    DateFormat   string  // "02/01/2006" (BCB), "2006-01-02" (RBI)
    AuthStyle    AuthStyle // None | QueryParam | Header | BearerToken
}

type AuthStyle int
const (
    AuthNone AuthStyle = iota    // BCB, BCRA
    AuthQueryParam               // BoK ECOS (?authKey=...), Banxico (?token=...)
    AuthHeader                   // TCMB (X-Api-Key), RBI (optional)
)

func (c *TimeSeriesClient) GetSeries(ctx context.Context, seriesID string, from, to time.Time) ([]SeriesPoint, error) {
    // 1. URL aus Template + seriesID bauen
    // 2. Auth anhaengen (je nach AuthStyle)
    // 3. DoRequest
    // 4. JSON-Response parsen: dynamische Feld-Namen via DateField/ValueField
    // 5. Normalisieren in []SeriesPoint
}
```

> **Implikation:** BCB, Banxico, RBI, BoK, TCMB, BCRA, Bank of Thailand werden alle ueber einen konfigurierbaren `TimeSeriesClient` bedient. Neuer Zentralbank-Connector = ~15-25 LoC Config-Struct statt ~80-120 LoC Full-Client.

### 12.6 BulkFetcher (Gruppe G5 -- Periodische Downloads)

```go
// base/bulk_fetcher.go

type BulkConfig struct {
    Name         string
    URL          string           // Download-URL (kann Template sein)
    Schedule     string           // Cron-Expression: "0 9 * * MON" (Montag 09:00)
    Format       BulkFormat       // CSV | TSV | XML | JSON | CSVGZ
    ParseFunc    func(io.Reader) ([]any, error)  // Provider-spezifischer Parser
    IdempotentBy string           // Dedup-Key: z.B. "weekStartDate" (FINRA) oder "report_date" (CFTC)
}

type BulkFormat int
const (
    CSV BulkFormat = iota
    TSV
    XML
    JSON
    CSVGZ  // gzipped CSV (FXCM Historical)
)
```

> **Provider in dieser Gruppe:** CFTC COT, FINRA ATS, LBMA Fixing, FXCM Historical, SCD Bundesgericht, Stooq ASCII, World Bank Pink Sheet.

### 12.7 DiffWatcher (Gruppe G7 -- Sanctions/Legal XML)

```go
// base/diff_watcher.go
//
// Fuer Quellen die als XML-Liste publiziert werden und wo
// AENDERUNGEN (neue Eintraege, Loeschungen) das Signal sind.

type DiffWatcherConfig struct {
    Name       string
    URL        string
    Schedule   string           // z.B. "0 */4 * * *" (alle 4h)
    Format     string           // "xml" | "json"
    IDField    string           // Welches Feld identifiziert einen Eintrag eindeutig
    StorePath  string           // Lokaler Pfad fuer letzte Version (JSON-Persist)
}

type DiffResult struct {
    Added   []map[string]any
    Removed []map[string]any
    Changed []map[string]any
}

func (w *DiffWatcher) CheckForUpdates(ctx context.Context) (*DiffResult, error) {
    // 1. Aktuelle Liste herunterladen
    // 2. Gegen gespeicherte Version vergleichen (IDField als Key)
    // 3. Diff berechnen (Added/Removed/Changed)
    // 4. Neue Version speichern
    // 5. Falls Diff nicht leer: Events emittieren (GeoMap gavel-Icon)
}
```

> **Provider in dieser Gruppe:** SECO Sanktionslisten, OFAC SDN, UN Consolidated Sanctions, EU Sanctions Map.

#### 12.7a Phase-14 Addendum: GeoMap Official Source Delta/Decision Pipeline (Go-owned)

> **Kontext:** In Phase 4 (GeoMap v2.0) wurden Hard-Signal-Deltas/Heuristiken teilweise in Next.js-Servercode umgesetzt, um GeoMap-UX und Candidate-Qualitaet schnell voranzubringen. Das ist **transitional**. In Phase 14 sollen offizielle Quellen + Delta-Detection in den Go-Layer verlagert werden.

**Ziel:** Go ist Source-of-Truth fuer offizielle GeoMap-Quellen (Sanctions + Zentralbank-/Policy-Quellen), inkl. Fetching, Header-basierter Delta-Erkennung und provider-spezifischen Parsing-Hinweisen. UIL/GeoMap erhalten standardisierte Change-Events/Records statt raw HTML-Delta-Heuristiken aus Next.js.

##### Scope (Phase 14)

| Quelle/Gruppe | Go-Verantwortung | Output fuer UIL/GeoMap |
|---|---|---|
| OFAC / UN / UK / SECO / EU (G7) | Download + Diff (`ETag`, `Last-Modified`, Hash), XML/HTML/CSV Parse-Hints, Added/Removed/Changed | Geo hard-signal candidates / diff records / audit metadata |
| Fed / ECB (+ spaeter weitere Zentralbanken) | Official calendar/statement fetch, delta detection, einfache decision hints (meeting/statement/minutes, hold/hike/cut heuristics) | Geo hard-signal candidates / policy delta records |
| Legal / Regulatory RSS (G6) | Polling + dedup + source metadata | UIL/GeoMap input queue (nicht direkt Event-Truth) |

##### Gemeinsamer Go-Output (empfohlen)

Statt provider-spezifischer Sonderformen pro Endpoint:

- `sourceId` / `provider`
- `fetchedAt`
- `delta.changed` + `delta.reason`
- `delta.headers` (`etag`, `lastModified`)
- `changeSummary` (counts: added/removed/changed)
- `semanticHints` (z. B. `rateAction=hold|hike|cut`, `sanctionsAction=designations|delistings|general_license`)
- `evidenceRefs` / source links
- `requestId`

> Diese Struktur ist absichtlich kompatibel mit den in Phase 4 eingefuehrten GeoMap `reviewNote`-/Adapter-Stats-Ideen und soll die TS->Go Migration erleichtern.

##### Migrationsreihenfolge (Phase 14)

1. **G7 Sanctions via DiffWatcher** (OFAC/UN zuerst, dann UK/SECO/EU)
2. **Fed/ECB official delta sources** (policy/calendar)
3. **Weitere Zentralbanken / Legal feeds** (regional rollout)
4. **Next.js hard-signals TS route auf thin proxy / compatibility mode zurueckbauen**

##### Verify (GeoMap-relevant, Phase 14)

- OFAC/UN Delta wird im Go-Layer erkannt und als standardisierter change-record ausgegeben
- Fed/ECB Delta mit `semanticHints` (`docType`, optional `rateAction`) verfuegbar
- GeoMap/UIL consume denselben Go-output ohne provider-spezifische UI-Sonderlogik
- Next.js Geo hard-signal TS code ist nicht mehr Fetch-Owner fuer offizielle Quellen

### 12.8 TranslationBridge (Gruppe G8 -- Non-English)

```go
// base/translation.go
//
// Wrapper fuer Connectors die nicht-englische Daten liefern.
// Go fetcht den Rohtext, schickt ihn an die Python-LLM-Queue.

type TranslationConfig struct {
    SourceLang string           // "zh" (Mandarin), "es", "pt", "ar"
    QueueURL   string           // Python-Service Endpoint: POST /api/translate
    Confidence float64          // Schwellwert fuer automatische Weiterverarbeitung (0.8 = 80%)
    FallbackEN bool             // Wenn Source auch EN-Version hat: EN bevorzugen
}

type TranslatedResult struct {
    OriginalText  string
    TranslatedEN  string
    Confidence    float64
    NeedsReview   bool           // true wenn Confidence < Schwellwert
    ExtractedData map[string]any // LLM-extrahierte strukturierte Daten
}
```

> **Provider in dieser Gruppe:** NBS China, PBoC, wenshu.court.gov.cn, SCJN (Mexiko), CVM (Brasilien), arabische Zentralbank-Reports.
> **Sprach-Tiers (aus REFERENCE_PROJECTS.md):**
> - **Tier 1 (EN nativ):** Direkt in Go → kein Translation-Overhead
> - **Tier 2 (EN verfuegbar):** EN-Version bevorzugen, `FallbackEN: true`
> - **Tier 3 (Uebersetzung noetig):** Go fetcht Raw → Python Queue → LLM Translate

### 12.9 Migration-Plan (Ist → Soll)

| Phase | Was | Aufwand | Abhaengigkeit |
|---|---|---|---|
| **M0: types.go extrahieren** | `Ticker`, `SeriesPoint`, `Pair`, `RequestError` von `gct/client.go` nach `base/types.go` verschieben. `gct/client.go` re-exportiert via Type-Alias (backwards-compatible) | 0.5 Tage | Keine |
| **M1: BaseHTTPClient** | `base/http_client.go` + `base/ratelimit.go` + `base/retry.go` erstellen. Bestehende Connectors (Finnhub, FRED, ECB) schrittweise umstellen | 1-2 Tage | M0 |
| **M2: SDMXClient** | `base/sdmx_client.go` bauen. Erster Consumer: IMF IFS (Prio G1). Dann OECD, ECB SDW, WB WDI | 1 Tag | M1 |
| **M3: TimeSeriesClient** | `base/timeseries.go` bauen. Erster Consumer: BCB SGS (Prio G4). Dann BoK, RBI, TCMB, Banxico, BCRA | 1 Tag | M1 |
| **M4: BulkFetcher + RSS** | `base/bulk_fetcher.go` + `base/rss_client.go` (aus `news/` extrahiert). Consumer: CFTC COT, FINRA ATS, Global Legal Monitor RSS | 1 Tag | M1 |
| **M5: DiffWatcher** | `base/diff_watcher.go`. Consumer: SECO Sanktionslisten | 0.5 Tage | M1 |
| **M6: TranslationBridge** | `base/translation.go`. Consumer: NBS China (wenn Mandarin-Sources aktiv) | 0.5 Tage | M1 + Python-Queue-Endpoint |

> **Empfehlung:** M0-M1 **vor** dem Bau neuer Connectors (G1-G16, L1-L16). M2 parallel mit IMF IFS (Prio G1). M3 parallel mit BCB (Prio G4). Das verhindert dass 30+ neue Connectors die alte Copy/Paste-Schuld vervielfachen.

---

## 13. Globale Provider-Erweiterung: Config + Routing (NEU 2026-02-22)

> **Kontext:** Erweiterung der Asset-Class-Config (Sek. 2) und Provider-Limits um alle neuen globalen Quellen aus [`REFERENCE_PROJECTS.md`](./REFERENCE_PROJECTS.md) Sek. "Globale Datenquellen-Erweiterung".

### 13.1 Erweiterte Config: Neue Asset-Classes

```yaml
asset_classes:
  # --- Bestehend (Sek. 2) ---
  us_equities_realtime:
    providers: [finnhub_ws, polygon, twelve_data, fmp, yahoo]
    strategy: latency_first
  us_equities_eod:
    providers: [polygon, yahoo, fmp, alpha_vantage]
    strategy: freshness_first
  commodity_futures:
    providers: [nasdaq_dl, yahoo, alpha_vantage]
    strategy: coverage_first
  forex_spot:
    providers: [ecb, finnhub, tiingo, twelve_data]
    strategy: freshness_first
  macro:
    providers: [fred, world_bank, imf]
    strategy: authority_first
  crypto_spot:
    providers: [gct, ccxt]
    strategy: latency_first
  crypto_derivatives:
    providers: [ccxt, gct]
    strategy: latency_first
  cot_positioning:
    providers: [cftc]
  bonds_yields:
    providers: [fred, us_treasury, ecb_yields]
    strategy: authority_first
  options_flow:
    providers: [polygon_options, tradier_options]
    strategy: freshness_first
  dark_pool_weekly:
    providers: [finra_ats]
    strategy: authority_first
  volatility_index:
    providers: [cboe_vix, fred]
    strategy: freshness_first

  # --- NEU: Globale Macro (SDMX-Gruppe G3) ---
  macro_global:
    providers: [imf_ifs, world_bank_wdi, oecd]
    strategy: authority_first
    group: sdmx
    notes: "200+ Laender. Ein SDMXClient, 3 Provider via Dataset-Parameter."
  macro_forecast:
    providers: [imf_weo]
    strategy: authority_first
    group: sdmx
    notes: "Forward-looking GDP/Inflation-Prognosen. Halbjahres-Update."

  # --- NEU: EM-Zentralbank-Zeitreihen (Gruppe G4) ---
  macro_brazil:
    providers: [bcb_sgs, ibge_sidra]
    strategy: authority_first
    group: timeseries
  macro_mexico:
    providers: [banxico_sie, inegi]
    strategy: authority_first
    group: timeseries
  macro_india:
    providers: [rbi_dbie, mospi]
    strategy: authority_first
    group: timeseries
  macro_korea:
    providers: [bok_ecos, kosis]
    strategy: authority_first
    group: timeseries
  macro_turkey:
    providers: [tcmb_evds, tuik]
    strategy: authority_first
    group: timeseries
  macro_argentina:
    providers: [bcra]
    strategy: authority_first
    group: timeseries
    notes: "Einzige API mit Blue Dollar (Parallel-Kurs ARS/USD)"
  macro_japan_ext:
    providers: [boj, e_stat]
    strategy: authority_first
    group: timeseries
    notes: "Ergaenzt bestehenden BoJ-Adapter mit e-Stat Regierungsstatistiken"
  macro_china:
    providers: [nbs_china, tushare_macro]
    strategy: authority_first
    group: timeseries
    notes: "NBS = Mandarin (Gruppe G8). Tushare als EN-Alternative."

  # --- NEU: EM-Forex (Gruppe G4, via Zentralbank-APIs) ---
  forex_em:
    providers: [bcb_sgs, banxico_sie, tcmb_evds, bok_ecos, rbi_dbie, bcra]
    strategy: authority_first
    group: timeseries
    notes: "EM-Waehrungen direkt von Zentralbanken. Inkl. Parallel-Kurse (ARS, NGN)."

  # --- NEU: EM-Aktien ---
  equities_china:
    providers: [tushare]
    strategy: coverage_first
    notes: "A-Shares (SSE/SZSE), 8000+ Symbole. Einziger Zugang zu China-Aktien."
  equities_japan:
    providers: [j_quants, yahoo]
    strategy: freshness_first
  equities_em:
    providers: [yahoo, eodhd, finnhub]
    strategy: coverage_first
    notes: "Fallback fuer alle EM-Boersen die keine eigene API haben"

  # --- NEU: Asian Commodities ---
  commodity_china:
    providers: [tushare]
    strategy: coverage_first
    notes: "SHFE (Kupfer, Gold), DCE (Eisenerz), ZCE via Tushare"

  # --- NEU: Sanctions / Legal (Gruppe G7) ---
  sanctions_lists:
    providers: [seco, ofac, un_sanctions, eu_sanctions]
    strategy: authority_first
    group: diff_watcher
    notes: "XML-Listen. DiffWatcher erkennt neue/geloeschte Eintraege."

  # --- NEU: Legal Intelligence (Gruppe G6/G1) ---
  legal_rulings:
    providers: [open_legal_data, courtlistener, eur_lex]
    strategy: freshness_first
    notes: "Neue Urteile/Entscheide. open_legal_data fuer CH+DE, courtlistener fuer US."
  legal_feeds:
    providers: [global_legal_monitor, sec_enforcement_rss, finma_rss]
    strategy: freshness_first
    group: rss
    notes: "RSS-Feeds. Bestehender rss_client.go."

  # --- NEU: Asia/EM News (Gruppe G6) ---
  news_asia:
    providers: [nikkei_rss, caixin_rss, economic_times_rss, scmp_rss]
    strategy: freshness_first
    group: rss
    notes: "Englischsprachige Asia-Business-Headlines via RSS."
  news_latam:
    providers: [el_financiero_rss]
    strategy: freshness_first
    group: rss
    notes: "Spanisch -- Gruppe G8 Translation wenn Volltext gebraucht."
  news_mena:
    providers: [al_jazeera_biz_rss]
    strategy: freshness_first
    group: rss

  # --- NEU: Web3 Oracle Networks (Gruppe G10) -- Preis-Verifikation ---
  oracle_price_verification:
    providers: [chainlink, pyth_network]
    strategy: cross_check
    group: oracle
    notes: >
      NICHT als Primaer-Provider. Cross-Check gegen Web2-Feeds.
      Chainlink: FX (CHF/USD 17 Ops, SGD/USD, EUR/USD, GBP/USD, JPY/USD),
      Commodities (XAU/USD), Crypto (BTC/USD, ETH/USD).
      Pyth: 295+ Feeds, Sub-Sekunde, Publisher = Jane Street, Jump Trading.
      Divergenz > 1% → Data Quality Alert. Persistente Divergenz → Provider-Score runter.
      Referenz: UVD Whitepaper Sek. 8.1 "multiple independent data sources, median aggregation".

  # --- NEU: DeFi-Leverage / On-Chain Stress ---
  defi_tvl:
    providers: [defillama]
    strategy: authority_first
    notes: "DeFi TVL pro Protokoll/Chain, Yields, Stablecoin Flows. Kein Key, kein Rate-Limit. Crypto-NBFI-Parallel."
  crypto_leverage:
    providers: [coinglass]
    strategy: freshness_first
    notes: "OI, Funding Rates, Liquidation Heatmaps, Long/Short Ratio. Free Tier."
  onchain_flows:
    providers: [whale_alert, glassnode, cryptoquant]
    strategy: freshness_first
    notes: "Grosse Wallet-Transfers, Exchange Flows, Miner Flows. GeoMap On-Chain Events."
  bitcoin_network:
    providers: [mempool_space, blockchain_com]
    strategy: freshness_first
    notes: "Mempool, Fee Pressure, Hash Rate, Block Timing, Mining Pool Stats. mempool.space = Open Source, kein Key."

  # --- NEU: CBDC + De-Dollarization ---
  cbdc_status:
    providers: [atlantic_council_cbdc]
    strategy: authority_first
    group: bulk
    notes: "137 Laender CBDC-Status. Periodischer Scrape. GeoMap Heatmap-Layer (Launched/Pilot/Dev/Research)."
  de_dollarization:
    providers: [imf_cofer, swift_rmb_tracker, atlantic_council_dollar]
    strategy: authority_first
    group: bulk
    notes: "Quartal/Monat. IMF COFER = USD-Anteil an Reserven, SWIFT RMB = Yuan-Anteil, AC = Aggregiert."

  # --- NEU: Financial Stability / NBFI / Shadow Banking ---
  liquidity_plumbing:
    providers: [fred, ny_fed_markets]
    strategy: authority_first
    notes: "ON RRP, TGA, Reserves, SOFR, Tri-Party via FRED + NY Fed API. Taeglich."
    fred_series: [RRPONTSYD, WTREGEN, TOTRESNS, WRESBAL, SOFR, SOFR30, SOFR90, EFFR]
  financial_stress:
    providers: [ofr_fsi, fred, ecb_sdw, bis]
    strategy: authority_first
    notes: "OFR FSI (eigene API), NFCI/STLFSI (FRED), ECB CISS (SDMX), BIS EWI (API)."
    fred_series: [NFCI, ANFCI, STLFSI4]
  credit_cycle:
    providers: [fred, finra_margin]
    strategy: authority_first
    notes: "SLOOS, Z.1 Shadow Banking, Margin Debt. Quartal/Monatlich."
    fred_series: [DRTSCILM, DRTSCLCC, BOGZ1FL664090005Q]
  nbfi_positioning:
    providers: [cftc, isda_swapsinfo]
    strategy: freshness_first
    notes: "CFTC TFF (HF Futures Positioning, woechentlich) + ISDA CDS/IRS Volumes."
  basel_regime:
    providers: [bis_rcap]
    strategy: authority_first
    group: diff_watcher
    notes: "Statischer GeoMap-Layer. Basel-Compliance Traffic-Light pro Land. Seltene Updates."
```

### 13.2 Erweiterte Provider-Limits

```yaml
provider_limits:
  # --- Bestehend ---
  finnhub:       { rpm: 60,  daily: null }
  polygon:       { rpm: 5,   daily: null }
  alpha_vantage: { rpm: 5,   daily: 500 }
  twelve_data:   { rpm: 8,   daily: 800 }
  nasdaq_dl:     { rpm: 30,  daily: 50000 }
  fred:          { rpm: 120, daily: null }
  yahoo:         { rpm: null, daily: null, unofficial: true }

  # --- NEU: SDMX (Gruppe G3) ---
  imf_ifs:       { rpm: 10,  daily: null, notes: "SDMX, kein Key" }
  imf_weo:       { rpm: 10,  daily: null, notes: "SDMX, kein Key, halbjahres-Update" }
  world_bank_wdi:{ rpm: 30,  daily: null, notes: "Kein Key" }
  oecd:          { rpm: 10,  daily: null, notes: "SDMX, kein Key" }

  # --- NEU: EM-Zentralbanken (Gruppe G4) ---
  bcb_sgs:       { rpm: null, daily: null, notes: "Kein Key, kein dokumentiertes Limit. Defensiv: 30 rpm" }
  banxico_sie:   { rpm: 30,  daily: null, notes: "Free Token noetig" }
  rbi_dbie:      { rpm: null, daily: null, notes: "Kein Key, limits unklar. Defensiv: 20 rpm" }
  bok_ecos:      { rpm: null, daily: null, notes: "Free Key noetig" }
  tcmb_evds:     { rpm: null, daily: null, notes: "Free Key noetig" }
  bcra:          { rpm: null, daily: null, notes: "Kein Key" }
  e_stat:        { rpm: null, daily: null, notes: "Free Key noetig" }

  # --- NEU: EM-Boersen ---
  tushare:       { rpm: null, daily: 500, notes: "Free Token, 500 req/Tag" }
  j_quants:      { rpm: null, daily: null, notes: "Free Tier, Limits auf Website" }

  # --- NEU: Bulk (Gruppe G5) -- keine rpm, nur Schedule ---
  cftc:          { schedule: "0 9 * * MON" }
  finra_ats:     { schedule: "0 9 * * MON" }
  lbma_fixing:   { schedule: "0 18 * * MON-FRI" }

  # --- NEU: Diff-Watcher (Gruppe G7) ---
  seco:          { schedule: "0 */4 * * *", notes: "Alle 4h pruefen" }
  ofac:          { schedule: "0 */6 * * *" }

  # --- NEU: Financial Stability ---
  ofr_fsi:       { rpm: null, daily: null, notes: "OFR REST-API, kein Key, kein dokumentiertes Limit" }
  ny_fed_markets:{ rpm: null, daily: null, notes: "NY Fed Markets API, kein Key" }
  isda_swapsinfo:{ rpm: null, daily: null, notes: "Kein Key, woechentlich" }
  finra_margin:  { schedule: "0 9 15 * *", notes: "Monatlich, ~15. des Monats" }
  bis_rcap:      { schedule: "0 9 1 */3 *", notes: "Quartal, bei Aenderung" }

  # --- NEU: Web3 Oracle Networks (Gruppe G10) ---
  chainlink:     { rpm: null, daily: null, notes: "On-Chain Read via Public RPC oder data.chain.link REST. Kostenlos" }
  pyth_network:  { rpm: null, daily: null, notes: "Hermes REST API. Kostenlos, kein Key" }

  # --- NEU: DeFi / On-Chain ---
  defillama:     { rpm: null, daily: null, notes: "Kein Key, kein dokumentiertes Limit. Open Source" }
  coinglass:     { rpm: 10,  daily: null, notes: "Free Tier, Rate-Limited" }
  whale_alert:   { rpm: 10,  daily: null, notes: "Free Tier: 10 req/min" }
  glassnode:     { rpm: null, daily: null, notes: "Free Tier eingeschraenkt (10+ Metriken). Pro ab $39/Mo" }
  cryptoquant:   { rpm: null, daily: null, notes: "Free Tier eingeschraenkt" }
  mempool_space: { rpm: null, daily: null, notes: "Kein Key, Open Source. Self-hostbar" }
  blockchain_com:{ rpm: null, daily: null, notes: "Kein Key" }

  # --- NEU: CBDC / De-Dollarization ---
  atlantic_council_cbdc: { schedule: "0 9 * * MON", notes: "Woechentlich pruefen. Scrape oder manuell" }
  imf_cofer:     { schedule: "0 9 1 1,4,7,10 *", notes: "Quartal. IMF Data API" }
  swift_rmb_tracker: { schedule: "0 9 15 * *", notes: "Monatlich. PDF-Parse" }

  # --- NEU: RSS (Gruppe G6) -- Polling-Intervall statt rpm ---
  nikkei_rss:    { poll_interval: "15m" }
  caixin_rss:    { poll_interval: "15m" }
  economic_times_rss: { poll_interval: "15m" }
  global_legal_monitor: { poll_interval: "1h" }
  sec_enforcement_rss:  { poll_interval: "30m" }
```

### 13.3 Quellen-Gruppen → Router-Integration

Der Router (Sek. 2-3) muss die `group`-Property aus der Config kennen, weil verschiedene Gruppen **verschiedene Fallback-Semantiken** haben:

| Gruppe | Fallback-Semantik | Health-Scoring? | Circuit Breaker? |
|---|---|---|---|
| **G1 (REST)** | Vollstaendige Fallback-Chain (naechster Provider) | Ja (Sek. 3) | Ja |
| **G2 (WebSocket)** | Reconnect-First, dann Fallback auf REST | Ja (Heartbeat-basiert) | Ja (Disconnect = Open) |
| **G3 (SDMX)** | Fallback zwischen SDMX-Providern (IMF → OECD → WB) | Ja | Ja |
| **G4 (Zeitreihen)** | Kein Fallback (jede Zentralbank ist autoritativ fuer eigene Daten) | Ja (aber kein Fallback-Trigger) | Ja (Alert statt Fallback) |
| **G5 (Bulk)** | Kein Fallback. Retry bei Download-Fehler, dann Alert | Nein (Cron-basiert) | Nein |
| **G6 (RSS)** | Kein Fallback (jeder Feed ist unique). Retry bei Fehler | Ja (simpel: up/down) | Nein |
| **G7 (Diff)** | Kein Fallback. Retry bei Download-Fehler, dann Alert | Nein (Cron-basiert) | Nein |
| **G8 (Translation)** | Fallback: EN-Version wenn verfuegbar (`FallbackEN: true`) | Ja (Python-Queue Health) | Ja (Queue-Timeout) |
| **G9 (Inoffiziell)** | Nur Fallback-FROM (nie Fallback-TO). Schema-Drift → deaktivieren | Ja (erhoeht) | Ja (Schema-Drift = Open) |
| **G10 (Oracle)** | **Cross-Check**, nicht Fallback. Divergenz Web2 vs. Oracle > Threshold → Data Quality Alert. Nie als Primaer-Provider | Ja (Divergenz-basiert: Chainlink-Preis vs. Web2-Provider-Preis) | Nein (ist selbst Verifikation, nicht primär) |

### 13.4 Aufwand-Update (erweitert)

| Aspekt | Original (Sek. 8) | Erweitert (mit Base + Global) |
|---|---|---|
| **Router Eigencode** | ~500 LoC | ~500 LoC (unveraendert) |
| **BaseConnector (`base/`)** | -- | ~700 LoC (http_client + sdmx + timeseries + bulk + rss + diff + translation + oracle_client) |
| **Neue Connectors (G1-G16)** | -- | ~400 LoC (mit Base ~25 LoC/Connector statt ~100) |
| **Neue Connectors (L1-L16)** | -- | ~300 LoC (Legal, aehnlich kompakt) |
| **Neue Connectors (Oracle/DeFi/CBDC)** | -- | ~400 LoC (Chainlink, Pyth, DefiLlama, Coinglass, Whale Alert, mempool.space, Atlantic Council) |
| **Config YAML** | ~50 Zeilen | ~200 Zeilen |
| **Zeitaufwand BaseConnector** | -- | 3-5 Tage (M0-M6, inkl. Migration bestehender Connectors) |
| **Zeitaufwand neue Connectors** | -- | 5-7 Tage (40+ Connectors bei ~25 LoC/Stueck) |
| **Gesamt-Zeitaufwand** | 2-3 Tage (Router only) | 10-15 Tage (Router + Base + 40+ neue Connectors) |

> **Reihenfolge-Empfehlung:**
> 1. **M0-M1** (BaseHTTPClient + Types-Migration) -- 1-2 Tage
> 2. **Router** (Sek. 2-3, unveraendert) -- 2-3 Tage
> 3. **M2 + G1** (SDMXClient + IMF IFS) -- 1 Tag, groesster globaler Hebel
> 4. **M3 + G4-G8** (TimeSeriesClient + EM-Zentralbanken) -- 1-2 Tage, 6+ Connectors
> 5. **M4 + G5** (BulkFetcher + Bulk-Sources) -- 1 Tag
> 6. **M5 + L1** (DiffWatcher + SECO Sanctions) -- 0.5 Tage
> 7. **G16 + RSS** (Asia/EM News-Feeds) -- sofort, bestehender rss_client.go
> 8. **G10 (Oracle)** (Chainlink + Pyth REST Clients) -- 1 Tag, Cross-Check-Infrastruktur
> 9. **DeFi/On-Chain** (DefiLlama + Coinglass + mempool.space) -- 1 Tag, alle haben saubere REST-APIs
> 10. **CBDC/De-Dollarization** (Atlantic Council Scrape + IMF COFER) -- 0.5 Tage, Bulk/Periodic

---

## 14. Web3 Oracle Networks: OracleClient-Architektur (NEU 2026-02-22)

> **Design Decision: Oracles = Verifikations-Layer (Layer 2), NICHT Primaer-Datenquelle (Layer 1)**
>
> Die Daten-Hierarchie im Go-Router ist:
>
> | Layer | Rolle | Quellen | Liefert |
> |---|---|---|---|
> | **Layer 1 (Primaer)** | Daten-Beschaffung | Web2 Provider (Finnhub, Polygon, FRED, ECB, 40+ Connectors) | OHLCV, Volume, Orderbuch, Fundamentals, Macro, News, Legal, Sentiment |
> | **Layer 2 (Verifikation)** | Preis-Cross-Check | Oracle Networks (Chainlink 17+ Ops, Pyth 120+ Publisher) | Nur Spot-Preise, aber aus unabhaengig aggregierten Quellen |
> | **Layer 3 (Enrichment)** | Zusatz-Kontext | On-Chain (DefiLlama, Coinglass, mempool.space, Whale Alert) | DeFi-Leverage, Whale Flows, Bitcoin-Netzwerk-Metriken |
>
> **Warum Oracles nicht Layer 1 sind:**
> - **Coverage:** Chainlink ~1000 Feeds, Pyth ~295. Wir brauchen zehntausende Instrumente (8000+ China A-Shares, 10k+ US Equities, 50k+ FRED-Serien)
> - **Daten-Tiefe:** Oracles liefern einen Spot-Preis. Kein Open/High/Low/Close, kein Volume, keine Candle-History, keine Fundamentals, kein Macro
> - **Latenz:** Chainlink Heartbeat 1-60 Min (Update nur bei Deviation > Threshold). Finnhub WS liefert Ticks in Echtzeit
> - **Kein Macro/Legal/Sentiment:** FRED hat 800k+ Zeitreihen, Oracles haben null davon
>
> **Warum Oracles trotzdem essentiell sind (Layer 2):**
> - **Unabhaengige Verifikation:** 17 Oracle Operators (Chainlink CHF/USD) vs. 1 Provider (Finnhub). Median aus 17 Quellen ist manipulationsresistenter als jeder einzelne Web2-Feed
> - **Oracle Disagreement = eigenes Signal:** Divergenz Web2 vs. Oracle > 1% → Data Quality Alert → Provider-Health-Score runter. Das ist das E_o Konzept aus dem Entropy Network (Kiyan Sasan, o.day)
> - **Fuer Crypto besonders wertvoll:** CEX-Preise koennen manipuliert werden (Wash Trading). Oracle-Preis aus 17+ unabhaengigen Quellen ist robuster
>
> Diese Hierarchie ist bewusst gewaehlt und soll nicht geaendert werden. Oracles ersetzen Web2 nicht -- sie machen Web2 vertrauenswuerdiger.

> **Kontext:** Oracle Networks (Chainlink, Pyth) sind eine neue Quellen-Gruppe (G10) die sich fundamental von allen anderen unterscheidet: Sie sind **nicht als Primaer-Datenquelle** gedacht, sondern als **Verifikationsschicht** die die Qualitaet unserer Web2-Feeds ueberwacht. Die Architektur-Parallele zum Entropy Network (Kiyan Sasan, o.day) ist direkt: Das Entropy Network misst "Oracle Disagreement" (E_o) als Stress-Signal. Wir implementieren dasselbe Konzept als Data Quality Feature.
> **Referenz:** UVD Whitepaper Sek. 3.3 (Oracle Mechanism) + Sek. 8.1 (Oracle Risk) -- [`REFERENCE_PROJECTS.md`](./REFERENCE_PROJECTS.md) Sek. "Web3 Oracle Networks".

### 14.1 OracleClient (base/oracle_client.go)

```go
// base/oracle_client.go -- Gruppe G10: Dezentrale Preis-Verifikation

type OracleProvider string

const (
    OracleChainlink OracleProvider = "chainlink"
    OraclePyth      OracleProvider = "pyth"
)

type OracleConfig struct {
    Provider       OracleProvider
    GatewayURL     string        // Chainlink: data.chain.link oder Public RPC; Pyth: Hermes API
    Timeout        time.Duration // Default: 5s (Oracle-Reads sind schnell)
    FeedIDs        map[string]string // Mapping: "CHF/USD" → Chainlink Feed Address / Pyth Price ID
}

type OraclePrice struct {
    Pair      string    // z.B. "XAU/USD", "CHF/USD", "BTC/USD"
    Price     float64
    Source    OracleProvider
    Timestamp time.Time
    Operators int       // Chainlink: Anzahl Oracle Operators die zum Median beigetragen haben
    Deviation float64   // Chainlink: aktuelle Deviation vom Threshold
}

type OracleClient struct {
    config     OracleConfig
    httpClient *http.Client
}

// GetPrice holt den aktuellen aggregierten Preis fuer ein Pair.
func (c *OracleClient) GetPrice(ctx context.Context, pair string) (*OraclePrice, error)

// CrossCheck vergleicht Oracle-Preis mit Web2-Provider-Preis.
// Gibt Divergenz in Prozent zurueck. > threshold → Alert.
func (c *OracleClient) CrossCheck(ctx context.Context, pair string, web2Price float64) (divergencePct float64, err error)
```

### 14.2 Oracle Disagreement Detector (Router-Integration)

```go
// Im Router (Sek. 2-3): Nach jedem Web2-Fetch optionaler Oracle Cross-Check

type OracleDisagreement struct {
    Pair          string
    Web2Provider  string   // z.B. "finnhub"
    Web2Price     float64
    OraclePrice   float64
    OracleSource  OracleProvider
    DivergencePct float64  // abs((web2 - oracle) / oracle * 100)
    Timestamp     time.Time
    IsAlert       bool     // > AlertThreshold
}

// Config:
//   oracle_cross_check:
//     enabled: true
//     alert_threshold_pct: 1.0    # >1% Divergenz = Alert
//     pairs: [BTC/USD, ETH/USD, XAU/USD, CHF/USD, EUR/USD]
//     check_interval: 5m
//     providers: [chainlink, pyth]
```

> **Datenfluss:**
> 1. Router holt Preis von Web2-Provider (Finnhub, Polygon, etc.) → primaeres Ergebnis
> 2. Parallel: OracleClient holt Chainlink/Pyth-Preis fuer dasselbe Pair
> 3. CrossCheck: Divergenz berechnen
> 4. Divergenz > 1% → `OracleDisagreement` Event emittieren → Provider-Health-Score anpassen
> 5. Persistente Divergenz (>3 Checks hintereinander) → Provider-Score drastisch runter → Fallback
> 6. Historische Divergenz-Daten → "Oracle Spread Index" als eigener Indikator (INDICATOR_ARCHITECTURE.md)

### 14.3 Verfuegbare Oracle Feeds (Chainlink + Pyth)

| Pair | Chainlink Feed | Chainlink Operators | Pyth Price ID | Besonderheit |
|---|---|---|---|---|
| **XAU/USD** (Gold) | `0x214eD...` (Ethereum) | 17 | `0x765d2ba...` | Kernbestandteil des UVD URB-Baskets (40% Gewicht) |
| **CHF/USD** | `0x449d1...` (Ethereum) | 17 | `0xa995d0...` | URB-Basket (30%). 0.15% Deviation Threshold |
| **SGD/USD** | `0xe25277...` (Multi-Chain) | 10+ | `0x396a96...` | URB-Basket (30%). Auf Ethereum, Arbitrum, BSC, Polygon |
| **EUR/USD** | Verfuegbar | 17 | Verfuegbar | Wichtigster FX-Cross-Check |
| **GBP/USD** | Verfuegbar | 17 | Verfuegbar | |
| **JPY/USD** | Verfuegbar | 17 | Verfuegbar | |
| **BTC/USD** | Verfuegbar | 31 | Verfuegbar | Hoechste Operator-Abdeckung |
| **ETH/USD** | Verfuegbar | 31 | Verfuegbar | |

> **Prioritaet-Empfehlung:** Erst BTC/USD + ETH/USD (hoechste Operator-Anzahl, staerkstes Signal). Dann XAU/USD + CHF/USD + EUR/USD (FX/Commodity Cross-Check). Spaeter alle verfuegbaren Pairs.

### 14.4 Market Entropy Index: Go-Datenlieferung fuer Python-Composite (NEU 2026-02-22)

> **Kontext:** Der Market Entropy Index (INDICATOR_ARCHITECTURE.md Sek. 5r) ist ein Python-seitiger Composite-Indikator der fuenf Stress-Dimensionen aggregiert. Drei davon benoetigen Daten die der Go-Router liefern muss.
> **Referenz:** [`ENTROPY_NOVELTY.md`](../ENTROPY_NOVELTY.md) Sek. 10.1 (E-Metrik), [`INDICATOR_ARCHITECTURE.md`](./INDICATOR_ARCHITECTURE.md) Sek. 5r.

| Komponente | Go-Adapter | Python-Berechnung | Status |
|---|---|---|---|
| **E_v (Volatility Dispersion)** | Nicht noetig -- OHLCV reicht | Vol-of-Vol, Cross-Asset Vol-Korrelation | Sofort machbar |
| **E_c (Congestion)** | mempool.space API (Bitcoin Fee Pressure, Block Timing) | Normalisierung auf [0,1] | Geplant (REFERENCE_PROJECTS.md) |
| **E_m (Market Variance)** | Nicht noetig -- OHLCV reicht | ATR-normalisierte Intraday-Range | Sofort machbar |
| **E_l (Leverage Proxy)** | DefiLlama TVL + Coinglass Funding Rate + OI | DeFi+TradFi Leverage Composite | Geplant (REFERENCE_PROJECTS.md) |
| **E_o (Oracle Disagreement)** | OracleClient CrossCheck() (diese Sektion) | Divergenz-Normalisierung | Geplant (Sek. 14.1-14.2) |

**Go-seitige Lieferung:**
- Neuer Endpoint im Go-Gateway: `/api/go/entropy-inputs` → liefert die drei Go-seitigen Rohdaten (Mempool Fees, DeFi TVL/Funding, Oracle Divergenzen) als JSON an Python
- Python aggregiert alle fuenf Komponenten zu `market_entropy ∈ [0, 1]`
- **v1-Fallback (OHLCV-only):** E_v + E_m sind rein auf OHLCV berechenbar → Market Entropy Index v1 kann sofort geliefert werden, ohne Go-Adapter-Abhaengigkeit

### 14.5 Trade Corridor Daten fuer GeoMap (NEU 2026-02-22)

> **Kontext:** Die GeoMap Corridor Visualization (GEOPOLITICAL_MAP_MASTERPLAN.md Sek. 35.13c) benoetigt bilaterale Handels-Daten die der Go-Service periodisch fetcht.
> **Referenz:** [`REFERENCE_PROJECTS.md`](./REFERENCE_PROJECTS.md) "Trade Corridor / Bilateral Trade Daten".

| Datenquelle | Go-Adapter | Frequenz | Aufwand |
|---|---|---|---|
| **UN Comtrade API** | REST/JSON, Auth-Token, Top-50 bilaterale Paare | Monatlich (Bulk) | Mittel (~150 LoC) |
| **WTO Disputes RSS** | RSS/XML Feed | Taeglich | Klein (~80 LoC) |
| **Chinn-Ito KAOPEN** | CSV Bulk Download | Jaehrlich | Trivial (~40 LoC) |
| **Heritage EFI** | JSON/CSV Download | Jaehrlich | Klein (~80 LoC) |

Diese Adapter gehoeren in die bestehende Kategorie **G5 (Bulk/Periodic)** (Sek. 12) da sie keine Echtzeit-Daten liefern sondern periodisch gefetcht werden.

---

*Recherche-Datum: Februar 2026. Sek. 10 (GCT Fork) hinzugefuegt am 19. Februar 2026 (aus archiviertem project_audit2.md Sek. 9 extrahiert). Sek. 11 (Options + Dark Pool Sources) hinzugefuegt am 19. Februar 2026. Sek. 12-13 (BaseConnector + Global Expansion) hinzugefuegt am 22. Februar 2026. Sek. 14 (Oracle Networks + DeFi/CBDC) hinzugefuegt am 22. Februar 2026. Sek. 14.4-14.5 (Market Entropy Index Datenlieferung + Trade Corridors) hinzugefuegt am 22. Februar 2026.*
