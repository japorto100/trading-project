# API Internal Service Boundaries

> **Stand:** 09. Maerz 2026
> **Zweck:** Vertrag fuer die internen Service-Grenzen: Go -> Python, Go -> Rust,
> Go -> GCT.
> **Index:** [`../API_CONTRACTS.md`](../API_CONTRACTS.md)

---

## Scope und Source of Truth

Dieses Dokument ist Owner fuer die internen API- und Transport-Boundaries hinter
dem Gateway:

- Go -> Python Services
- Go -> Rust Compute Boundary
- Go -> GCT
- interne Memory-/Agent-/Compute-/Execution-Kontrakte

Nicht Owner dieses Dokuments:

- Browser- und BFF-Entry Surfaces
- Security-Policy im engeren Sinn
- offene Arbeit / Phase-Tracking

---

## 1. Go -> Python

### 1.1 Oberste Regeln

- heute: gRPC-first moeglich, HTTP-Fallback vorhanden
- Python bleibt interner Service-Layer fuer ML, agent runtime, retrieval,
  simulation und reference-heavy Domainlogik
- Browser oder externe Clients sprechen Python **nie direkt** fuer
  produktive Domainpfade
- Go bleibt Policy-, routing- und audit-tragende Boundary

### 1.2 Servicefamilien

| Servicefamilie | Rolle |
|:---------------|:------|
| finance-bridge | Markt-/Fallback-/research-nahe Datenpfade |
| soft-signals | Geo-/narrative-/game-theory-nahe Auswertung |
| indicator-service | Indikatoren, Eval, ML, Backtests |
| memory-service | KG, Episoden, semantische Suche |
| agent-service | Agent registry, execution, multimodale Analyse |

### 1.3 Memory Service Boundary

Bereits sichtbar oder geplant als interne Go -> Python Contracts:

| Endpoint | Rolle |
|:---------|:------|
| `/api/v1/memory/kg/seed` | KG-Seed / write-scope |
| `/api/v1/memory/kg/query` | KG query |
| `/api/v1/memory/kg/nodes` | KG node retrieval |
| `/api/v1/memory/kg/sync` | Frontend-/client-side sync delta |
| `/api/v1/memory/episode` | einzelne Episode schreiben |
| `/api/v1/memory/episodes` | Episoden lesen |
| `/api/v1/memory/search` | Vector / semantic search |
| `/api/v1/memory/health` | health / dependency status |

Vertragsregeln:

- Go normalisiert Auth, Request-ID, Fehler und optionales Caching
- Python bleibt fachlicher Owner fuer memory-domain responses
- Browser sieht nur Go-fronted Contracts, nicht den Python-Port

Konkrete Contract-Hinweise:

- `GET /api/v1/memory/kg/sync` liefert Delta-/Sync-Daten fuer client-side KG Sync
- `GET /api/v1/memory/episodes` liefert filterbare Episodenlisten
- `POST /api/v1/memory/search` bleibt semantischer Search-Contract statt
  direkter Vector-DB-Exposition

### 1.4 Agent / Analysis Boundary

Aktive oder geplante Contractgruppen:

| Gruppe | Beispiele |
|:-------|:----------|
| multimodale Analyse | `/api/v1/analysis/jobs*` |
| Agent registry | `/api/v1/agents/types`, `/api/v1/agents/templates`, `/api/v1/agents/tools` |
| Agent execution | `/api/v1/agents/execute`, `/api/v1/agents/workflows*` |
| WebMCP / tool proxy | `/api/v1/agent/tools/*` hinter Go Policy Gateway |

Statusregel:

- ein Teil dieser Flaeche ist noch Zielbild / scaffolded surface
- dokumentiert wird hier die Boundary, nicht der Vollzug jedes einzelnen
  Endpunkts

Typische interne Event-/Progress-Form:

```json
{ "type": "status_change", "status": "processing" }
```

### 1.5 Indicator / Eval / Simulation Boundary

Diese Gruppe bleibt ebenfalls Go -> Python:

- `/api/v1/indicators/*`
- `/api/v1/signals/*`
- `/api/v1/regime/*`
- `/api/v1/eval/*`
- `/api/v1/backtest/*`
- `/api/v1/ml/*`
- `/api/v1/game-theory/*`
- weitere geo-/research-nahe Python downstreams

---

## 2. Go -> Rust

### 2.1 Heutige Boundary

- heute: ueber Python/PyO3 in bestehenden Pfaden sichtbar
- Ziel: staerkere direkte Produktionsgrenze fuer Hot Paths, ohne Python als
  Agentik-/ML-Schicht zu ersetzen

### 2.2 Vertragslage

- Rust ist Compute-Layer, keine Policy- oder Browser-Frontdoor
- heutige Produktionspfade laufen meist `Go -> Python -> Rust`
- selektive kuenftige Hot-Path-Grenze `Go -> Rust` bleibt erlaubt, wenn die
  Boundary stabiler, schneller oder einfacher wird
- Python bleibt Modellierungs-, ML- und Agentikschicht auch dann, wenn einzelne
  Rust-Pfade direkter werden

### 2.3 Typische Anwendungsfaelle

- Indikator-Kerne
- numerische Hot Paths / Monte-Carlo / Batch Compute
- performanzkritische Signalkerne

Normative Abgrenzung:

- kein Rust als Auth-, Audit- oder orchestration-first layer
- keine direkte Browser-Kommunikation
- keine versteckte Shadow-API ausserhalb des Gateway-/service-Vertrags

---

## 3. Go -> GCT

### 3.1 Oberste Regeln

- gRPC bevorzugt
- JSON-RPC fallback
- GCT bleibt interner execution-/exchange-naher Upstream hinter Go
- Go ist Owner fuer Rollen, Audit, Request-ID, Rate Limits und user-context

### 3.2 Boundary-Vertrag

| Aspekt | Vertrag |
|:------|:--------|
| Transport | gRPC bevorzugt, JSON-RPC nur als fallback / transitional path |
| Security | Service-Credentials, TLS-Hardening, keine direkte Browser-Exposition |
| Scope | read-only und execution-nahe crypto infra, keine generische Plattformlogik |
| Audit | Go mappt User -> GCT action; GCT kennt nur Service-Account |

### 3.3 GCT-Pfadfamilien

| Go-owned Frontdoor | Interne Richtung |
|:-------------------|:-----------------|
| `/api/v1/gct/*` | Go -> GCT |
| portfolio-/order-nahe Pfade | Go -> GCT bzw. Go-owned orchestration |
| health / capability-like checks | Go -> GCT read-path |

### 3.4 Verbotene Muster

- kein direkter Browser -> GCT Zugriff
- kein Wildcard-Proxy ohne method-/scope-Grenze
- keine Exchange- oder Service-Secrets ausserhalb der serverseitigen Boundary

---

## 4. Cross-Cutting Invarianten fuer interne Services

- `X-Request-ID` bleibt ueber Sprach- und Servicegrenzen erhalten
- Go vereinheitlicht Fehler nach aussen; Downstreams duerfen intern reichhaltiger
  sein
- interne Services sind ersetzbare Boundaries, keine zweite oeffentliche API
- Secrets, Roles und Audit duerfen nicht in Python-, Rust- oder GCT-Bypaessen
  verloren gehen

---

## 5. Querverweise

- [`API_NEXT_TO_GO.md`](./API_NEXT_TO_GO.md)
- [`API_SHARED_INVARIANTS.md`](./API_SHARED_INVARIANTS.md)
- [`../execution/compute_delta.md`](../execution/compute_delta.md)
- [`../security/POLICY_GUARDRAILS.md`](../security/POLICY_GUARDRAILS.md)
