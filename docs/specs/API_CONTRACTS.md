# API CONTRACTS

> **Stand:** 22. Februar 2026  
> **Zweck:** Strikte Definition der Kommunikationsgrenzen zwischen allen Services. Wer ruft wen auf, wie sieht das Payload-Format exakt aus, und welche Cross-Cutting Concerns (Correlation IDs, Rate Limits, Errors) gelten?  
> **Quellen:** `go-backend/` (routes, connectors), `python-backend/` (3 Services), `INDICATOR_ARCHITECTURE.md`, `Portfolio-architecture.md`, `GEOPOLITICAL_MAP_MASTERPLAN.md`, `ADR-001-streaming-architecture.md`, `MEMORY_ARCHITECTURE.md`, `AGENT_ARCHITECTURE.md`, `AGENT_TOOLS.md`  
> **Lebendes Dokument:** Endpoints werden nach Implementierung von "(Geplant)" auf "(Implementiert)" umgelabelt. Die anderen Docs bleiben Referenz -- diese 3 Spec-Dateien sind die einzige Stelle für Progress-Tracking.

**Aenderungshistorie:**

| Rev. | Datum | Beschreibung |
|:-----|:------|:-------------|
| 1 | 20. Feb 2026 | Erstfassung: Sek. 1-10 (Market Data, Indicators, Portfolio, SSE, Error/Correlation/Rate Limit) |
| 2 | 22. Feb 2026 | Sek. 11 (Memory Service), Sek. 12 (Agent System), Sek. 13 (Agent State Observation) ergaenzt |

**Oberste Regel:** `Next.js → Go → Python → Rust`. Keine Service-Ebene wird übersprungen.

---

## 1. Frontend → Go Gateway (Bestehende Endpoints)

Das Frontend kommuniziert ausschließlich mit dem Go Gateway auf Port `9060`. Alle externen API-Keys verbleiben im Go Backend.

### 1.1 Health Check
- **`GET /health`**
- Response: `200 OK` mit Status-Objekt

### 1.2 Market Data — Quote
- **`GET /api/v1/quote`**
- Query: `symbol` (AAPL, BTC/USD), `exchange` (finnhub, gct, ecb), `assetType` (equity, crypto, forex)
- Response `200`:
```json
{
  "symbol": "AAPL",
  "price": 185.30,
  "change": 2.10,
  "changePercent": 1.15,
  "source": "finnhub",
  "timestamp": "2026-02-20T10:00:00Z"
}
```

### 1.3 Macro History
- **`GET /api/v1/macro/history`**
- Query: `series` (GDP, CPI, UNRATE), `startDate`, `endDate`
- Response `200`: Array von `{ date, value, source }` Objekten

### 1.4 Streaming — Market Data (SSE)
- **`GET /api/v1/stream/market`**
- Query: `symbols` (komma-getrennt)
- Response: SSE Event Stream (siehe Sektion 7)

### 1.5 News Headlines
- **`GET /api/v1/news/headlines`**
- Query: `category` (general, forex, crypto, merger), `limit`
- Response `200`: Array von Headlines mit `title`, `url`, `source`, `publishedAt`, `sentiment`

### 1.6 Geopolitical Events
- **`GET /api/v1/geopolitical/events`**
- Query: `region`, `category`, `severity`, `status`
- Response `200`: Array von `GeoEvent` Objekten (siehe GEOPOLITICAL_MAP_MASTERPLAN.md Sek. 13.1)

### 1.7 Geopolitical Context
- **`GET /api/v1/geopolitical/context`**
- Query: `region`, `country`
- Response `200`: Kontextinformationen von CFR/CrisisWatch

### 1.8 Geopolitical Game-Theory Impact
- **`POST /api/v1/geopolitical/game-theory/impact`**
- Body: `{ "event": string, "region": string, "actors": string[] }`
- Response `200`: Impact-Analyse mit Szenarien und Wahrscheinlichkeiten

### 1.9 Backtest Capabilities
- **`GET /api/v1/backtest/capabilities`**
- Response `200`: Verfügbare Strategien, Exchanges, Zeiträume

### 1.10 Backtest Runs
- **`POST /api/v1/backtest/runs`** — Backtest starten
- **`GET /api/v1/backtest/runs`** — Alle Runs auflisten
- **`GET /api/v1/backtest/runs/:id`** — Einzelnen Run abrufen
- **`GET /api/v1/backtest/runs/:id/results`** — Ergebnisse eines Runs

### 1.11 Geopolitical Stream (SSE)
- **`GET /api/geopolitical/stream`**
- Response: SSE mit Event-Types: `candidate.new`, `candidate.updated`, `event.updated`, `timeline.appended`

---

## 2. Frontend → Go Gateway (Geplante neue Endpoints)

Diese Endpoints existieren noch nicht und werden in den jeweiligen Phasen gebaut.

### 2.1 Market Data — OHLCV (Phase 0)
- **`GET /api/v1/ohlcv`**
- Query: `symbol`, `timeframe` (1m, 5m, 15m, 1h, 4h, 1D, 1W), `limit` (max 2000), `exchange`, `assetType`
- Response `200`:
```json
{
  "symbol": "AAPL",
  "timeframe": "1D",
  "source": "finnhub",
  "candles": [
    { "t": 1708426800, "o": 180.00, "h": 185.50, "l": 179.20, "c": 184.30, "v": 1200000 }
  ]
}
```

### 2.2 Indicator Proxy — Composite Signal (Phase 1)
- **`POST /api/v1/indicators/composite`**
- Body: `{ "symbol": "AAPL", "timeframe": "1D", "limit": 500 }`
- Go holt OHLCV intern, sendet an Python, gibt Ergebnis zurück.
- Response `200`:
```json
{
  "confidence": 0.85,
  "direction": "buy",
  "breakdown": {
    "sma50Slope": "rising",
    "heartbeatScore": 0.75,
    "smartMoneyScore": "bullish"
  },
  "timestamp": "2026-02-20T10:00:00Z"
}
```

### 2.3 Indicator Proxy — Pattern Detection (Phase 4)
- **`POST /api/v1/patterns/elliott-wave`**
- **`POST /api/v1/patterns/harmonic`**
- **`POST /api/v1/patterns/candlestick`**
- Body: `{ "symbol": "AAPL", "timeframe": "1D", "limit": 500 }`
- Response: Pattern-Arrays mit Koordinaten für Chart-Overlay

### 2.4 Portfolio — GCT Bridge (Phase 2)

> **Auth-Requirements:** Siehe [`AUTH_SECURITY.md`](./AUTH_SECURITY.md) Sek. 2.4 und 3.3 für vollständigen Auth Flow.

| Endpoint | Method | Mindest-Rolle | Rate Limit | Beschreibung |
|:---|:---|:---|:---|:---|
| `/api/v1/portfolio/summary` | GET | `viewer` | 30 req/s | Aggregierte Portfolio-Übersicht |
| `/api/v1/portfolio/positions` | GET | `viewer` | 30 req/s | Offene Positionen |
| `/api/v1/portfolio/balances/:exchange` | GET | **`trader`** | 10 req/s | Balances pro Exchange (sensibel) |
| `/api/v1/portfolio/ohlcv` | GET | `viewer` | 30 req/s | OHLCV für Portfolio-Assets |
| `/api/v1/portfolio/analytics` | POST | `analyst` | 10 req/s | Proxy zu Python Analytics |
| `/api/v1/portfolio/order` | POST | **`trader`** | **2 req/min** | Order an GCT (echtes Geld!) |
| `/api/v1/portfolio/order/:id` | GET | **`trader`** | 10 req/s | Order-Status abfragen |
| `/api/v1/portfolio/order/:id/cancel` | POST | **`trader`** | **2 req/min** | Order stornieren |

- Response Shapes folgen den TypeScript-Interfaces aus `Portfolio-architecture.md`
- **Order-Endpoints (POST):** Go Gateway prüft JWT → RBAC (`trader`) → Rate Limit → Audit-Log → GCT gRPC. Siehe `AUTH_SECURITY.md` Sek. 3.3 für den vollständigen Flow.
- **Keine Exchange API Keys** werden jemals über diese Endpoints exponiert.

### 2.5 Unified Ingestion Layer (Phase 7)
- **`POST /api/v1/ingest/submit`** — Manuelles Content-Submission (Copy/Paste)
- Body: `{ "sourceType": "manual"|"youtube"|"reddit", "content": string, "url"?: string }`
- Go leitet an Python LLM Pipeline weiter.

---

## 3. Go → Python: Soft-Signals Service (Port 8091)

Go ruft diese Endpoints auf dem Python Soft-Signals Service auf. Python antwortet, Go leitet an Frontend weiter.

### 3.1 Game-Theory Impact (Bestehend)
- **`POST /api/v1/game-theory/impact`**
- Body: `{ "event": string, "region": string, "actors": string[], "context"?: object }`
- Response `200`: Impact-Szenarien

### 3.2 News Cluster Analysis (Bestehend, Scaffold)
- **`POST /api/v1/cluster-headlines`**
- Body: `{ "headlines": [{ "title": string, "source": string, "publishedAt": string }], "params"?: { "method": "tfidf"|"embeddings", "minClusterSize": number } }`
- Response `200`: `{ "clusters": [{ "label": string, "headlines": string[], "significance": number }] }`

### 3.3 Social Surge Detection (Bestehend, Scaffold)
- **`POST /api/v1/social-surge`**
- Body: `{ "topic": string, "sources": string[], "windowHours": number }`
- Response `200`: `{ "surgeDetected": boolean, "magnitude": number, "sentiment": number, "sources": object[] }`

### 3.4 Narrative Shift Detection (Bestehend, Scaffold)
- **`POST /api/v1/narrative-shift`**
- Body: `{ "topic": string, "daysBack": number }`
- Response `200`: `{ "shiftDetected": boolean, "direction": string, "confidence": number, "evidence": string[] }`

### 3.5 UIL Classify (Geplant, Phase 7)
- **`POST /api/v1/ingest/classify`**
- Body:
```json
{
  "sourceType": "youtube"|"reddit"|"rss"|"manual",
  "sourceId": "video_abc123",
  "sourceMeta": { "channel": "...", "publishedAt": "..." },
  "content": "Full text / transcript",
  "language": "en"
}
```
- Response `200`:
```json
{
  "candidateId": "uuid",
  "summary": "...",
  "entities": ["Fed", "Powell", "rate cut"],
  "macroRoutes": ["geo", "macro"],
  "microClassifications": [{ "category": "monetary_policy", "confidence": 0.92 }],
  "confidence": 0.87,
  "reviewAction": "auto_route"|"human_review"|"auto_reject"
}
```

---

## 4. Go → Python: Indicator Service (Port 8092)

Go ruft diese Endpoints auf. Go liefert OHLCV-Daten als Payload mit — Python fetcht NICHT selbst.

### 4.1 Composite Signal
- **`POST /api/v1/signals/composite`**
- Body:
```json
{
  "symbol": "AAPL",
  "timeframe": "1D",
  "ohlcv": [
    { "t": 1708426800, "o": 180, "h": 185, "l": 179, "c": 184, "v": 1200000 }
  ]
}
```
- Response `200`: Composite Signal mit Confidence, Direction, Breakdown

### 4.2 Pattern Detection
- **`POST /api/v1/patterns/candlestick`** — Candlestick Patterns (Doji, Hammer, Engulfing, etc.)
- **`POST /api/v1/patterns/harmonic`** — Gartley, Bat, Butterfly, Crab
- **`POST /api/v1/patterns/timing`** — Timing Patterns
- **`POST /api/v1/patterns/price`** — Price Action Patterns
- **`POST /api/v1/patterns/elliott-wave`** — Elliott Wave Count (5 Impulse + 3 Corrective)
- Body: `{ "ohlcv": OHLCV[], "params"?: object }`
- Response: `{ "patterns": [{ "type": string, "startIndex": number, "endIndex": number, "confidence": number, "coordinates": object }] }`

### 4.3 Indicators
- **`POST /api/v1/indicators/exotic-ma`** — Exotic Moving Averages (DEMA, TEMA, HMA, FRAMA, etc.)
- **`POST /api/v1/indicators/ks-collection`** — KS Indicator Collection
- **`POST /api/v1/indicators/rainbow`** — Rainbow Oscillator
- **`POST /api/v1/indicators/volatility`** — Volatility Indicators
- **`POST /api/v1/indicators/bollinger-enhanced`** — Enhanced Bollinger
- **`POST /api/v1/indicators/rsi-enhanced`** — Enhanced RSI
- Body: `{ "ohlcv": OHLCV[], "params": { "period": number, ... } }`
- Response: `{ "values": number[]|object[], "metadata": { "name": string, "params": object } }`

### 4.4 Charting & Fibonacci
- **`POST /api/v1/charting/transform`** — Heikin-Ashi, Renko, P&F Transformationen
- **`POST /api/v1/charting/alternative-bars`** — Range/Volume/Tick Bars
- **`POST /api/v1/fibonacci/levels`** — Fib Retracement/Extension Levels
- Body: `{ "ohlcv": OHLCV[], "type": string, "params"?: object }`

### 4.5 Strategy Evaluation
- **`POST /api/v1/evaluate/strategy`**
- Body: `{ "trades": Trade[], "ohlcv": OHLCV[], "initialCapital": number }`
- Response: `{ "totalReturn": number, "sharpe": number, "maxDrawdown": number, "winRate": number, "profitFactor": number }`

### 4.6 Regime & Risk (Geplant)
- **`POST /api/v1/regime/detect`** — Markt-Regime-Erkennung
- **`POST /api/v1/risk/position-size`** — Positionsgrößenberechnung

### 4.7 Portfolio Analytics (Geplant, Phase 2)
- **`POST /api/v1/portfolio/correlations`** — Korrelationsmatrix
- **`POST /api/v1/portfolio/rolling-metrics`** — Rolling Sharpe, Sortino, etc.
- **`POST /api/v1/portfolio/drawdown-analysis`** — Drawdown-Analyse
- **`POST /api/v1/portfolio/optimize`** — HRP, MinVar, EqualWeight (Phase 3)
- **`POST /api/v1/portfolio/kelly-allocation`** — Kelly Criterion (Phase 3)
- **`POST /api/v1/portfolio/regime-sizing`** — Regime-basierte Positionierung (Phase 3)
- Body enthält jeweils Portfolio-Positionen + OHLCV-Daten (von Go bereitgestellt)

---

## 5. Go → Python: Finance Bridge (Port 8081)

> **Hinweis:** Dieser Service wird möglicherweise in den Go Data Router absorbiert (Phase 0). Bis dahin:

### 5.1 Quote
- **`GET /quote`**
- Query: `symbol`, `exchange`
- Response: Quote-Objekt (price, change, volume, etc.) via yfinance

### 5.2 OHLCV
- **`GET /ohlcv`**
- Query: `symbol`, `interval` (1m–1mo), `period` (1d–max)
- Response: Array von OHLCV-Objekten

### 5.3 Search
- **`GET /search`**
- Query: `q` (Suchbegriff)
- Response: Array von Symbol-Matches

---

## 6. Python → Rust Core (PyO3 Interface)

Rust ist kein HTTP-Server. Python importiert Rust via `import tradeview_rust_core` (PyO3-Modul, gebaut mit `maturin`).

### 6.1 Indicator Functions

```rust
// Heartbeat Score (Composite Signal Baustein)
#[pyfunction]
pub fn calculate_heartbeat(
    closes: Vec<f64>,
    highs: Vec<f64>,
    lows: Vec<f64>,
    sensitivity: f64
) -> PyResult<f64>

// Batch Indicator Calculation (Rayon parallel)
#[pyfunction]
pub fn calculate_indicators_batch(
    timestamps: Vec<i64>,
    opens: Vec<f64>,
    highs: Vec<f64>,
    lows: Vec<f64>,
    closes: Vec<f64>,
    volumes: Vec<f64>,
    indicators: Vec<String>  // ["sma_50", "rsi_14", "macd"]
) -> PyResult<HashMap<String, Vec<f64>>>
```

### 6.2 Pattern Functions

```rust
// Elliott Wave Detection
#[pyfunction]
pub fn detect_elliott_waves(
    highs: Vec<f64>,
    lows: Vec<f64>,
    closes: Vec<f64>,
    min_wave_size: f64
) -> PyResult<Vec<WaveResult>>  // WaveResult { wave_type, start_idx, end_idx, confidence }

// Harmonic Pattern Detection
#[pyfunction]
pub fn detect_harmonic_patterns(
    highs: Vec<f64>,
    lows: Vec<f64>,
    tolerance: f64
) -> PyResult<Vec<PatternResult>>
```

### 6.3 Portfolio Functions (Phase 3+)

```rust
// Monte Carlo VaR
#[pyfunction]
pub fn monte_carlo_var(
    returns: Vec<Vec<f64>>,  // Multi-Asset Returns
    simulations: usize,
    confidence: f64
) -> PyResult<VarResult>

// Correlation Matrix (optimiert für große Portfolios)
#[pyfunction]
pub fn correlation_matrix(
    price_series: Vec<Vec<f64>>,
    method: String  // "pearson"|"spearman"
) -> PyResult<Vec<Vec<f64>>>
```

### 6.4 Python-Seitiger Aufruf

```python
import tradeview_rust_core

@app.post("/api/v1/signals/composite")
async def calculate_composite(req: SignalRequest):
    closes = [c.c for c in req.ohlcv]
    highs = [c.h for c in req.ohlcv]
    lows = [c.l for c in req.ohlcv]

    # GIL-free Rust-Aufruf
    heartbeat = tradeview_rust_core.calculate_heartbeat(closes, highs, lows, 0.02)
    indicators = tradeview_rust_core.calculate_indicators_batch(
        timestamps, opens, highs, lows, closes, volumes,
        ["sma_50", "rsi_14", "macd"]
    )

    return CompositeSignalResponse(
        heartbeatScore=heartbeat,
        sma50Slope=compute_slope(indicators["sma_50"]),
        direction=determine_direction(indicators),
        confidence=aggregate_confidence(heartbeat, indicators)
    )
```

---

## 7. SSE Event Format

Go Gateway sendet Server-Sent Events an das Frontend.

### 7.1 Stream Status
```
event: stream_status
data: {"status":"connected","symbols":["AAPL","BTC/USD"],"timestamp":"2026-02-20T10:00:00Z"}
```

### 7.2 Quote Update
```
event: quote
data: {"symbol":"AAPL","price":185.30,"change":2.10,"volume":1200000,"timestamp":"2026-02-20T10:00:01Z"}
```

### 7.3 Candle Update (Geplant, Phase 5)
```
event: candle
data: {"symbol":"AAPL","timeframe":"1m","t":1708426860,"o":185.20,"h":185.50,"l":185.10,"c":185.40,"v":15000,"closed":true}
```

### 7.4 Alert Trigger (Geplant, Phase 5)
```
event: alert
data: {"alertId":"uuid","symbol":"AAPL","type":"price_threshold","trigger":"above","value":186.00,"currentPrice":186.05,"timestamp":"2026-02-20T10:01:00Z"}
```

### 7.5 Geopolitical Events (Bestehend)
```
event: candidate.new
data: {"id":"uuid","headline":"OFAC SDN Update","severity":4,"confidence":0.89,...}

event: event.updated
data: {"id":"uuid","field":"severity","oldValue":3,"newValue":4,...}
```

---

## 8. Unified Error Contract

Alle Services verwenden dasselbe Error-Format. Go Gateway transformiert Python-Errors in dieses Format bevor sie ans Frontend gehen.

### 8.1 Error Response Shape

```json
{
  "error": {
    "code": "PROVIDER_UNAVAILABLE",
    "message": "Finnhub rate limit exceeded. Falling back to Twelve Data.",
    "details": {
      "provider": "finnhub",
      "retryAfter": 60
    },
    "requestId": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2026-02-20T10:00:00Z"
  }
}
```

### 8.2 Standard Error Codes

| Code | HTTP Status | Beschreibung |
|:---|:---|:---|
| `VALIDATION_ERROR` | 400 | Ungültige Query Parameter oder Body |
| `UNAUTHORIZED` | 401 | Fehlende oder ungültige Authentifizierung |
| `FORBIDDEN` | 403 | Keine Berechtigung (RBAC) |
| `NOT_FOUND` | 404 | Resource nicht gefunden |
| `RATE_LIMITED` | 429 | Rate Limit überschritten |
| `PROVIDER_UNAVAILABLE` | 502 | Externer Provider nicht erreichbar |
| `SERVICE_UNAVAILABLE` | 503 | Interner Service (Python) nicht erreichbar |
| `COMPUTE_TIMEOUT` | 504 | Python/Rust-Berechnung hat Timeout überschritten |

### 8.3 Validierung pro Schicht

| Schicht | Tool | Verhalten bei Fehler |
|:---|:---|:---|
| **Frontend (TS)** | Zod-Schemata | Parse-Error → UI zeigt "Unexpected response format" + loggt `requestId` |
| **Go Gateway** | `encoding/json` Structs | Python antwortet mit unerwartetem Format → HTTP 502 + Error Contract |
| **Python** | Pydantic Models | Go sendet ungültigen Body → HTTP 422 + Validation Details |
| **Rust** | Typsystem (compile-time) | Ungültige Eingabe → `PyResult::Err` → Python fängt und gibt HTTP 400 |

---

## 9. Correlation ID Protocol

Jeder Request bekommt eine eindeutige ID die durch alle Schichten fließt.

### 9.1 Flow

```
Browser → Next.js (generiert X-Request-ID: UUID v4)
  → Go Gateway (liest Header, loggt, reicht weiter)
    → Python (liest Header, loggt, reicht an Rust)
      → Rust (erhält als Parameter, inkludiert in Errors)
    ← Python (inkludiert in Response Header)
  ← Go (inkludiert in Response Header + Error Body)
← Next.js (loggt, inkludiert in Frontend-Error-UI)
```

### 9.2 Implementation

| Service | Wie |
|:---|:---|
| **Next.js** | Middleware generiert `X-Request-ID` (UUID v4) falls nicht vorhanden. Sendet als Header an Go. |
| **Go Gateway** | Liest `X-Request-ID` aus Request Header. Setzt als Context-Value. Gibt an alle internen Requests weiter. Inkludiert in Response Header + Error Body. |
| **Python** | Liest `X-Request-ID` aus Request Header. Loggt in jedem Log-Eintrag. Inkludiert in Response Header. |
| **Rust** | Erhält `request_id: String` als optionalen Parameter. Inkludiert in `PyResult::Err` Messages. |

### 9.3 Log-Format (alle Services)

```json
{
  "timestamp": "2026-02-20T10:00:00.123Z",
  "level": "info",
  "service": "go-gateway",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "method": "GET",
  "path": "/api/v1/quote",
  "duration_ms": 45,
  "status": 200
}
```

---

## 10. Rate Limiting Contract

Go Gateway enforced Rate Limits bevor Requests an interne Services oder externe Provider weitergeleitet werden.

### 10.1 Gateway-Level Limits

| Endpoint-Gruppe | Limit | Verhalten bei Überschreitung |
|:---|:---|:---|
| **Allgemein (alle Endpoints)** | 100 req/s pro Client-IP | HTTP 429 + `retryAfter` Header |
| **Python Compute** (`/indicators/*`, `/patterns/*`, `/signals/*`) | 10 req/s pro Client-IP | HTTP 429 + `retryAfter` Header |
| **Streaming** (`/stream/*`) | 5 gleichzeitige Connections pro Client-IP | Connection rejected |
| **Backtest** (`/backtest/runs` POST) | 2 req/min pro Client-IP | HTTP 429 |

### 10.2 Provider-Level Limits (Go-Intern)

Go Data Router tracked Provider-Limits und weicht automatisch auf Alternativen aus:

| Provider | RPM Limit | Daily Limit | Strategie bei Erschöpfung |
|:---|:---|:---|:---|
| Finnhub | 60 | 500K | → Twelve Data → FMP → Yahoo |
| Twelve Data | 8/min (Free) | 800/day | → Finnhub → Alpha Vantage |
| Alpha Vantage | 5/min | 25/day | → FMP → Yahoo |
| FRED | 120 | Unbegrenzt | Kein Fallback nötig |
| ACLED | 20 | 5000 | → Cache |
| GDELT | Unbegrenzt | Unbegrenzt | Kein Limit |

### 10.3 Response Header bei Rate Limit

```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1708426860
X-Request-ID: 550e8400-e29b-41d4-a716-446655440000
Retry-After: 5

{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Compute rate limit exceeded. Max 10 requests/second for indicator endpoints.",
    "details": { "limit": 10, "retryAfter": 5 },
    "requestId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

---

## 11. Memory Service Endpoints (Geplant, Phase 6)

> **Quelle:** `MEMORY_ARCHITECTURE.md` Sek. 5 + Sek. 7, `EXECUTION_PLAN.md` Phase 6e  
> **Service:** Python Memory Service (Port 8094, FastAPI)  
> **Auth:** Alle Endpoints erfordern gueltige JWT + Rolle `viewer` (Lesen) bzw. `analyst` (Schreiben).

### 11.1 Episode Store (M3)

- **`POST /api/v1/memory/episodes`** (Geplant)

Neuen Episodic-Eintrag speichern (Analysis-Log, Routing-Log, Workflow-Log, etc.).

```json
// Request
{
  "episode_type": "analysis_log",
  "event_id": "evt_iran_sanc_20260222",
  "agent": "game_theory_scorer_v1",
  "input_summary": { "region": "mena", "event_type": "sanctions", "fatalities": 0, "keywords": ["iran", "oil"] },
  "output": { "impact_score": 0.7, "market_bias": "risk_off", "confidence": 0.62 },
  "reasoning": ["fatalities_high +0.25", "kinetic_escalation +0.22"]
}

// Response 201 Created
{
  "id": "ep_550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2026-02-22T14:30:00Z",
  "episode_type": "analysis_log"
}
```

- **`GET /api/v1/memory/episodes`** (Geplant)

Episoden abrufen mit Filtern.

| Query-Param | Typ | Beschreibung |
|:---|:---|:---|
| `symbol` | string | Filter nach Symbol (z.B. `GLD`) |
| `event_id` | string | Filter nach GeoEvent-ID |
| `agent` | string | Filter nach Agent-Name |
| `episode_type` | string | `analysis_log`, `routing_log`, `workflow_log`, `research_log`, `evaluation_log` |
| `from` | ISO 8601 | Zeitraum-Start |
| `to` | ISO 8601 | Zeitraum-Ende |
| `limit` | int | Max. Ergebnisse (Default: 50, Max: 500) |
| `offset` | int | Pagination Offset |

```json
// Response 200 OK
{
  "episodes": [
    {
      "id": "ep_550e8400...",
      "episode_type": "analysis_log",
      "timestamp": "2026-02-22T14:30:00Z",
      "agent": "game_theory_scorer_v1",
      "event_id": "evt_iran_sanc_20260222",
      "output": { "impact_score": 0.7, "market_bias": "risk_off", "confidence": 0.62 },
      "accuracy_score": 0.75
    }
  ],
  "total": 142,
  "limit": 50,
  "offset": 0
}
```

### 11.2 Knowledge Graph Sync (M2)

- **`GET /api/v1/memory/kg/sync`** (Geplant)

KG-Delta fuer Frontend IndexedDB Sync. Frontend sendet letzten bekannten Timestamp, Backend liefert alle neuen/geaenderten Nodes+Edges.

| Query-Param | Typ | Beschreibung |
|:---|:---|:---|
| `since` | ISO 8601 | Letzter bekannter Sync-Zeitpunkt |
| `types` | string[] | Node-Typen filtern (z.B. `region,event,strategem`) |

```json
// Response 200 OK
{
  "nodes_added": [
    { "id": "evt_iran_sanc_20260222", "type": "GeoEvent", "properties": { "title": "Iran Sanctions", "severity": "S3" } }
  ],
  "nodes_updated": [],
  "edges_added": [
    { "from": "evt_iran_sanc_20260222", "to": "region_mena", "type": "beeinflusst", "properties": { "strength": 0.8 } }
  ],
  "edges_removed": [],
  "sync_timestamp": "2026-02-22T15:00:00Z"
}
```

- **`POST /api/v1/memory/kg/backup`** (Geplant)

Verschluesselter Upload des User-KG (Frontend → Backend) fuer Key-Recovery-Szenarios.

```json
// Request (Body: encrypted blob)
{
  "user_id": "usr_...",
  "encrypted_payload": "<base64-encoded AES-256-GCM encrypted KG>",
  "key_derivation": "webauthn_prf",
  "schema_version": "1.0.0"
}

// Response 200 OK
{ "stored_at": "2026-02-22T15:00:00Z", "size_bytes": 245760 }
```

### 11.3 Vector Store / Semantic Search (M4)

- **`POST /api/v1/memory/search`** (Geplant)

Semantische Suche ueber ChromaDB / FalkorDB Vector Index.

```json
// Request
{
  "query": "historical sanctions events with oil price impact",
  "top_k": 5,
  "filters": { "episode_type": "analysis_log", "from": "2024-01-01" },
  "include_embeddings": false
}

// Response 200 OK
{
  "results": [
    {
      "id": "ep_...",
      "score": 0.92,
      "episode_type": "analysis_log",
      "summary": "Iran sanctions 2024 — GLD +3.2%, CL +5.1%",
      "timestamp": "2024-06-15T10:00:00Z"
    }
  ]
}
```

### 11.4 KG-Update SSE (Backend → Frontend)

Neuer Event-Typ auf dem bestehenden Geopolitical SSE Stream (`GET /api/geopolitical/stream`):

```json
// SSE Event
event: kg_update
data: {
  "event_id": "evt_iran_sanc_20260222",
  "affected_regions": ["mena"],
  "affected_symbols": ["CL", "GLD", "USO"],
  "invalidates": ["impact_cache_mena"],
  "nodes_added": 1,
  "edges_added": 3
}
```

---

## 12. Agent System Endpoints (Geplant, Phase 10 + 16)

> **Quelle:** `AGENT_ARCHITECTURE.md` Sek. 10.3 (Multimodal Analysis) + Sek. 16.1 (Agent Registry)  
> **Service:** Python Agent Service (Port 8095, FastAPI) — via Go Gateway  
> **Auth:** Alle Endpoints erfordern gueltige JWT. RBAC wie in Tabelle angegeben.

### 12.1 Multimodal Analysis Jobs

| Methode | Endpoint | Beschreibung | RBAC |
|:---|:---|:---|:---|
| `POST` | `/api/v1/analysis/jobs` | Neuen Analyse-Job erstellen | `analyst` |
| `GET` | `/api/v1/analysis/jobs/{id}` | Job-Status + Ergebnisse | `analyst` |
| `GET` | `/api/v1/analysis/jobs/{id}/stream` | SSE: Live Progress-Updates | `analyst` |
| `GET` | `/api/v1/analysis/jobs/{id}/audio` | Audio-File streamen (Range Requests) | `analyst` |
| `GET` | `/api/v1/analysis/jobs/{id}/transcript` | Transcript mit Marker-Overlay | `analyst` |
| `GET` | `/api/v1/analysis/profiles/{person}` | Historisches Profil (Needs/Decision Map) | `analyst` |
| `POST` | `/api/v1/analysis/jobs/{id}/feedback` | Human Feedback auf Marker (Verifier-Training) | `analyst` |
| `DELETE` | `/api/v1/analysis/jobs/{id}` | Job + Daten loeschen (Data Minimization) | `analyst` |

**Create Job — Request/Response:**

```json
// POST /api/v1/analysis/jobs — Request
{
  "type": "multimodal",
  "source": { "type": "audio_url", "url": "https://..." },
  "config": {
    "extract_bte": true,
    "extract_drs": true,
    "language": "en",
    "speaker_detection": true
  }
}

// Response 202 Accepted
{
  "id": "job_550e8400-e29b-41d4-a716-446655440000",
  "status": "queued",
  "created_at": "2026-02-22T14:30:00Z",
  "estimated_duration_s": 120,
  "stream_url": "/api/v1/analysis/jobs/job_550e8400.../stream"
}
```

**SSE Events (Progress) auf `/api/v1/analysis/jobs/{id}/stream`:**

```typescript
type AnalysisEvent =
  | { type: 'status_change'; status: 'queued' | 'processing' | 'complete' | 'failed' }
  | { type: 'transcript_ready'; segmentCount: number }
  | { type: 'text_analysis_progress'; percent: number; markersFound: number }
  | { type: 'audio_analysis_progress'; percent: number }
  | { type: 'scores_ready'; scores: { stress: number; confidence: number; deception_risk: number } }
  | { type: 'explanation_ready'; explanation: string }
  | { type: 'complete'; summary: { totalMarkers: number; overallScore: number; duration_ms: number } }
  | { type: 'error'; message: string; retryable: boolean };
```

### 12.2 Agent Registry

| Methode | Endpoint | Beschreibung | RBAC |
|:---|:---|:---|:---|
| `GET` | `/api/v1/agents/types` | Alle Agent-Typen auflisten | `viewer` |
| `POST` | `/api/v1/agents/types` | Neuen Agent-Typ erstellen | `analyst` |
| `PUT` | `/api/v1/agents/types/{id}` | Agent-Typ bearbeiten | `analyst` (eigene) |
| `DELETE` | `/api/v1/agents/types/{id}` | Agent-Typ loeschen | `analyst` (eigene) |
| `GET` | `/api/v1/agents/templates` | Verfuegbare Templates | `viewer` |
| `POST` | `/api/v1/agents/templates/{id}/clone` | Template klonen | `analyst` |
| `GET` | `/api/v1/agents/tools` | Verfuegbare Tools auflisten | `viewer` |

**Agent-Typ Schema:**

```json
// POST /api/v1/agents/types — Request
{
  "name": "Oil Price Impact Analyst",
  "description": "Analysiert Auswirkungen geopolitischer Events auf Oelpreis",
  "role": "research",
  "tools": ["kg_query", "vector_search", "web_search"],
  "model_tier": "high",
  "system_prompt": "Du bist ein Analyst fuer Oelpreis-Auswirkungen..."
}

// Response 201 Created
{
  "id": "agt_type_...",
  "name": "Oil Price Impact Analyst",
  "created_by": "usr_...",
  "created_at": "2026-02-22T14:30:00Z"
}
```

### 12.3 Agent Execution

| Methode | Endpoint | Beschreibung | RBAC |
|:---|:---|:---|:---|
| `POST` | `/api/v1/agents/execute` | Einzelnen Agent ausfuehren | `analyst` |
| `POST` | `/api/v1/agents/workflows` | Multi-Agent Workflow ausfuehren | `analyst` |
| `GET` | `/api/v1/agents/workflows/{id}/stream` | SSE: Live Workflow-Progress | `analyst` |

**Execute Agent — Request/Response:**

```json
// POST /api/v1/agents/execute — Request
{
  "agent_type_id": "agt_type_...",
  "input": {
    "event_id": "evt_iran_sanc_20260222",
    "symbols": ["CL", "GLD", "USO"],
    "context": { "timeframe": "24h", "include_historical": true }
  }
}

// Response 202 Accepted
{
  "execution_id": "exec_...",
  "status": "running",
  "stream_url": "/api/v1/agents/workflows/exec_.../stream"
}
```

---

## 13. Agent State Observation Endpoints (Geplant, Phase 21)

> **Quelle:** `AGENT_TOOLS.md` Sek. 5 (Frontend State Observation)  
> **Service:** Next.js API Route (intern, kein Go Gateway)  
> **Auth:** Agent-interner Zugriff. Bearer Token mit Scope `agent:state:read`.

### 13.1 State Snapshot (REST)

- **`GET /api/agent/state`** (Geplant)

Vollstaendiger Frontend-State-Snapshot fuer On-Demand Context Assembly.

```json
// Response 200 OK
{
  "page": "/chart/AAPL",
  "chart": {
    "symbol": "AAPL",
    "timeframe": "4H",
    "indicators": ["RSI", "MACD", "BB"]
  },
  "geomap": {
    "center": [33.5, 48.2],
    "zoom": 5,
    "mode": "game-theory",
    "filters": { "severity": "S3+" }
  },
  "portfolio": {
    "positions": 5,
    "totalValue": 12450.00,
    "unrealizedPnL": 340.00
  },
  "alerts": {
    "active": 2,
    "triggered_last_24h": 1
  },
  "watchlist": ["AAPL", "GLD", "CL", "BTC-USD"],
  "tradingPanel": {
    "activeTab": "orders",
    "favorites": ["market", "limit"]
  },
  "lastUserAction": {
    "type": "click",
    "target": "geomap-marker-iran-sanctions",
    "timestamp": "2026-02-22T14:30:00Z"
  }
}
```

### 13.2 State Stream (WebSocket)

- **`WS /api/agent/state-stream`** (Geplant)

Real-Time State-Change Events fuer proaktive Agent-Reaktion.

```json
// Verbindungsaufbau: ws://localhost:3000/api/agent/state-stream
// Auth: Bearer Token als Query-Param oder Upgrade-Header

// Server → Agent Events:
{ "type": "chart_symbol_change", "data": { "from": "AAPL", "to": "GLD" }, "ts": "2026-02-22T14:30:01Z" }
{ "type": "geomap_marker_click", "data": { "eventId": "evt_iran_sanc_20260222" }, "ts": "2026-02-22T14:30:02Z" }
{ "type": "alert_triggered", "data": { "alertId": "alt_...", "symbol": "GLD", "condition": "price > 2100" }, "ts": "2026-02-22T14:30:03Z" }
{ "type": "geomap_mode_change", "data": { "from": "standard", "to": "game-theory" }, "ts": "2026-02-22T14:30:04Z" }
{ "type": "indicator_toggle", "data": { "symbol": "AAPL", "indicator": "BB", "enabled": false }, "ts": "2026-02-22T14:30:05Z" }
```

**Nutzung:** REST (`/api/agent/state`) fuer On-Demand Context Assembly bei Agent-Aufruf. WebSocket (`/api/agent/state-stream`) fuer proaktive Reaktion — z.B. "User hat auf Iran-Sanktions-Event geklickt → Game Theory Analyse vorbereiten".
