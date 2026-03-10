# API Next.js to Go Gateway

> **Stand:** 09. Maerz 2026
> **Zweck:** Vertrag fuer Next.js -> Go Gateway: Transportregeln, Gateway-Baseline,
> Market-, Streaming-, Geo-, Strategy-, Portfolio- und Auth-Contracts.
> **Index:** [`../API_CONTRACTS.md`](../API_CONTRACTS.md)

---

## Scope und Source of Truth

Dieses Dokument ist Owner fuer die kontrollierte BFF-Grenze `Next.js -> Go`.

Es beantwortet:

- welche fachlichen Frontdoors das Gateway besitzt
- welche Contractgruppen Next.js kontrolliert an Go weiterreicht
- welche Bereiche public, role-gated oder rein intern gedacht sind

Nicht Owner dieses Dokuments:

- Browser-only State Observation
- Downstream-Details hinter Go zu Python, Rust oder GCT

---

## 1. Next.js -> Go Gateway

- `GO_GATEWAY_BASE_URL` ist der normative Domain-Upstream fuer Market, Geo,
  Strategy, Memory-nahe und weitere Gateway-Pfade.
- Next.js-Routen bleiben BFF/Thin-Proxy, duplizieren aber keine Provider-,
  Security- oder Business-Logik.
- Route-Handler enthalten keine Domain-Truth-Logik und keine direkten Provider-/
  Datenbank-Bypaesse fuer datenliefernde oder mutierende Domainpfade.
- Reine Metadaten-Antworten duerfen lokal in Next.js beantwortet werden, wenn
  keine Backend-Daten noetig sind, z. B. `GET /api/market/providers` auf Basis
  statischer Registry-Metadaten.

### Strukturziel 2026

Fuer Market-/Provider-Arbeit gilt als Zielzustand:

- wenige stabile Next-BFF-Familien
- wenige stabile Gateway-Familien
- neue Provider werden primaer im Go-Gateway ueber Registry, Resolver,
  Capability-Metadaten und Connector-Adapter eingezogen
- weder Next.js noch Go sollen fuer jeden Provider neue oeffentliche
  Route-Familien bekommen, solange dieselbe fachliche Faehigkeit geliefert wird

---

## 2. Public Gateway Baseline

| Endpoint | Zweck |
|:---------|:------|
| `GET /health` | Gateway-Health |
| `GET /api/v1/gct/health` | geschuetzte GCT-Health-Basis |
| `GET /api/v1/router/providers` | optionaler Router-/Provider-Snapshot |

Regel:

- Diese Gateway-Baseline ist klein und stabil zu halten.
- Provider-Rollout erweitert bevorzugt interne Registry-/Adapter-Schichten statt
  neue Public-Gateway-Pfade.

---

## 3. Market Contracts

### Quote

`GET /api/v1/quote` — Query: `symbol`, `exchange`, `assetType`. `exchange=auto` erlaubt Go-seitige Providerwahl.

### OHLCV

`GET /api/v1/ohlcv` — Query: `symbol`, `timeframe`, `limit`, `exchange`, `assetType`. Response candle-zentriert, keine Frontend-Provider-Fallbacks.

### Orderbook

| Endpoint | Typ |
|:---------|:----|
| `GET /api/v1/orderbook` | HTTP snapshot |
| `GET /api/v1/stream/orderbook` | SSE stream |

### Search / News / Providers

| Endpoint | Zweck |
|:---------|:------|
| `GET /api/v1/search` | such-/fallback-orientierter Market-Pfad |
| `GET /api/v1/news/headlines` | Market- und query-basierte Headlines |
| `GET /api/market/providers` | Next-BFF-Pfad fuer Provider-Metadaten |

### Macro History

`GET /api/v1/macro/history` — Query: `symbol`, `exchange`, `assetType`, `limit`.

### Request-scoped Credential Consumer

Aktuell verifiziert: `finnhub`, `fred`, `banxico`, `bok`.
Naechste Kandidaten: weitere auth-pflichtige read-only Quellen nach Einzelentscheidung.
Entscheidung pro Provider: `user-supplied` | `gateway-owned` | `nicht freigegeben`.

Regel:

- Die Entscheidung pro Provider aendert die Credential- und Registry-Logik,
  nicht die oeffentliche Market-Route-Familie.

---

## 4. Streaming Contracts

### Market Stream

`GET /api/v1/stream/market` — Query: `symbol`, `exchange`, `assetType`, `timeframe` optional, `alertRules` optional.

### Quotes Multiplex

`GET /api/v1/stream/quotes` — Eventfamilien: `ready`, `snapshot`, `quote`, `quote_batch`, `candle`, `alert`, `stream_status`.

### Streaming-Regeln

- Go-SSE ist primaer
- Legacy-/Polling-Fallbacks fail-closed in Prod
- `X-Request-ID` bleibt im Streaming-Pfad erhalten
- auth-pflichtige Provider duerfen nicht still auf Frontend-Fallbacks zurueckfallen
- `stream`-Faehigkeit bleibt eine gemeinsame Route-Familie; neue Provider werden
  hinter denselben SSE-/Resolver-Grenzen integriert

---

## 5. Geopolitical / UIL Contracts

| Contractgruppe | Primärer Owner |
|:---------------|:---------------|
| `GET /api/v1/geopolitical/events` | Go Gateway |
| `GET /api/v1/geopolitical/context` | Go Gateway |
| `POST /api/v1/geopolitical/game-theory/impact` | Go -> Python soft-signals |
| `POST /api/v1/ingest/classify` | Go -> Python UIL classifier |
| candidate review / reclassify / queue metadata | Go-owned mutation and review policy |

Invarianten: Browser -> Next.js -> Go Pflichtkette; mutierende UIL-Pfade Go-owned.

---

## 6. Strategy / Indicator / Eval Contracts

Pfad: `Browser -> Next.js -> Go -> indicator-service -> Rust optional -> Go -> Next.js`

| Gruppe | Beispiele |
|:-------|:----------|
| Composite / Signals | `/api/v1/signals/composite` |
| Indicator suite | `/api/v1/indicators/*` |
| Regime / volatility | `/api/v1/regime/*`, `/api/v1/indicators/volatility-suite` |
| Eval / backtest | `/api/v1/eval/*`, `/api/v1/backtest/*` |
| ML | `/api/v1/ml/*` |
| Options / darkpool / defi | `/api/v1/options/*`, `/api/v1/darkpool/*`, `/api/v1/defi/*` |

Heavy-Compute-Pfade orientieren sich am Compute-Split aus [`../execution/compute_delta.md`](../execution/compute_delta.md).

---

## 7. Portfolio / GCT Contracts

| Endpointgruppe | Richtung |
|:---------------|:---------|
| `/api/v1/portfolio/*` | Go-owned Frontdoor |
| `/api/v1/gct/*` | geschuetzter GCT-prefix |

GCT-Regeln: interner Upstream hinter Go; gRPC bevorzugt; Audit und Rollenlogik im Gateway.

---

## 8. Memory Contracts

Pfadfamilie: `Browser -> /api/memory/* -> Go -> memory-service`

| Next/BFF Surface | Gateway Contract | Status / Zweck |
|:-----------------|:-----------------|:---------------|
| `/api/memory/kg/sync` | `GET /api/v1/memory/kg/sync` | KG-Delta / client sync |
| `/api/memory/episodes` | `GET /api/v1/memory/episodes` | Episodic retrieval |
| `/api/memory/search` | `POST /api/v1/memory/search` | semantische Suche |

Zusätzliche Go-Contracts, die intern oder spaeter ueber BFF-Surfaces
angehaengt werden koennen:

- `POST /api/v1/memory/episode`
- `POST /api/v1/memory/kg/seed`
- `GET /api/v1/memory/kg/query`
- `GET /api/v1/memory/kg/nodes`
- `GET /api/v1/memory/health`

Regeln:

- Memory bleibt Gateway-owned Frontdoor
- Next.js dupliziert weder KG- noch Vector-/Episodic-Logik
- Privacy-/Consent- und auth-nahe Regeln gelten weiterhin ueber Security-Specs

Kurzbeispiele:

```json
// POST /api/v1/memory/search
{
  "query": "historical sanctions events with oil price impact",
  "top_k": 5,
  "filters": { "episode_type": "analysis_log" }
}
```

```json
// GET /api/v1/memory/episodes
{
  "episodes": [
    {
      "id": "ep_...",
      "episode_type": "analysis_log",
      "agent": "game_theory_scorer_v1"
    }
  ],
  "total": 142
}
```

---

## 9. Storage / Artifact Contracts

Pfadfamilie: `Browser -> Next.js -> Go -> signed artifact route -> object layer`

| Endpoint | Zweck |
|:---------|:------|
| `POST /api/v1/storage/artifacts/upload-url` | Artefakt registrieren und kurzlebige Upload-URL ausgeben |
| `PUT /api/v1/storage/artifacts/upload/{id}?token=...` | Upload ueber signierten Go-Pfad |
| `GET /api/v1/storage/artifacts/{id}` | Metadaten + optionaler Download-Link |
| `GET /api/v1/storage/artifacts/{id}/download?token=...` | Download ueber signierten Go-Pfad |

Invarianten:

- Browser bekommt keine Root-Credentials fuer Object-Storage.
- Ownership, retention class, content metadata und lifecycle liegen in Go + relationalem Metadaten-Store.
- Signed URLs sind kurzlebig und werden vom Gateway signiert.
- Lokale Baseline ist filesystem-backed; SeaweedFS/Garage folgen als S3-kompatible Provider auf derselben Boundary.

---

## 10. Agent / Analysis Contracts

Pfadfamilien:

- `Browser -> Next.js -> Go -> agent-service`
- `Browser -> Next.js -> Go -> soft-signals / indicator-service` fuer spezielle
  Analysepfade

### Analyse-Jobs

| Contractgruppe | Beispiele |
|:---------------|:----------|
| multimodal / async analysis | `/api/v1/analysis/jobs`, `/api/v1/analysis/jobs/{id}`, `/api/v1/analysis/jobs/{id}/stream` |
| artefakte / transcript / feedback | `/api/v1/analysis/jobs/{id}/audio`, `/api/v1/analysis/jobs/{id}/transcript`, `/api/v1/analysis/jobs/{id}/feedback` |

### Agent Registry / Execution

| Contractgruppe | Beispiele |
|:---------------|:----------|
| agent registry | `/api/v1/agents/types`, `/api/v1/agents/templates`, `/api/v1/agents/tools` |
| execution | `/api/v1/agents/execute`, `/api/v1/agents/workflows`, `/api/v1/agents/workflows/{id}/stream` |

Statusregel:

- Teile dieser Flaeche sind Zielbild oder scaffolded planning surface
- aktive Next-only Observation-Pfade (`/api/agent/state*`) gehoeren **nicht**
  in diese Gateway-Grenze

Kurzbeispiele:

```json
// POST /api/v1/analysis/jobs
{
  "type": "multimodal",
  "source": { "type": "audio_url", "url": "https://..." },
  "config": { "extract_bte": true, "language": "en" }
}
```

```json
// POST /api/v1/agents/execute
{
  "agent_type_id": "agt_type_...",
  "input": {
    "event_id": "evt_iran_sanc_20260222",
    "symbols": ["CL", "GLD", "USO"]
  }
}
```

---

## 10. Auth / Policy Contract

| Thema | Vertragslage |
|:------|:-------------|
| Session / identity | Next.js/Auth.js validiert Session fuer BFF-Pfade |
| Gateway policy | Go erzwingt Rollen, Rate Limits, Audit |
| Public exceptions | nur explizit definierte Health-/Stream-/Read-Ausnahmen |
| Secrets | keine Frontend-owning Provider-Secrets |

Details: [`../security/AUTH_MODEL.md`](../security/AUTH_MODEL.md), [`../security/POLICY_GUARDRAILS.md`](../security/POLICY_GUARDRAILS.md).

---

## Querverweise

- [`API_BROWSER_TO_NEXT.md`](./API_BROWSER_TO_NEXT.md)
- [`API_INTERNAL_SERVICES.md`](./API_INTERNAL_SERVICES.md)
- [`../execution/compute_delta.md`](../execution/compute_delta.md)
- [`../UIL_ROUTE_MATRIX.md`](../UIL_ROUTE_MATRIX.md)
