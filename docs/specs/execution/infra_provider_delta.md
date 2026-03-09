# Infra, Provider Rollout & Runtime Deltas

> **Stand:** 09. Maerz 2026
> **Zweck:** Aktiver Delta-Plan fuer Provider-Rollout, Credential-Transport,
> Messaging/Infra-Follow-ups und weitere Go-/Gateway-nahe Architekturarbeit.
> Dieses Dokument traegt nur noch offene oder noch lebendige Deltas.

---

## 0. Execution Contract (verbindlich fuer CLI-Agents)

### Scope In

- Credential-Flows (ENV + request-scoped)
- Provider-Rollout und Verify-Contract pro Batch
- Runtime-nahe Infra-Deltas (Messaging, Lock-Contention, Stream-hardening)

### Scope Out

- tiefe Compute-Portierungsfragen (Owner: `compute_delta.md`)
- GeoMap-Produkt-/UX-Detailarbeit (Owner: `geomap_closeout.md`)
- rein katalogische Quellenpflege ohne Rolloutbezug

### Mandatory Upstream Sources (vor Abarbeitung lesen)

- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/SYSTEM_STATE.md`
- `docs/specs/ARCHITECTURE.md`
- `docs/GO_GATEWAY.md`
- `docs/go-gct-gateway-connections.md`
- `docs/references/status.md`
- `docs/references/sources/README.md`
- `docs/specs/execution/source_onboarding_and_keys.md`

### Arbeitsprinzip

- Provider-Rollout wird batchweise geschlossen, nicht als unverbundene Einzelaufgaben.
- Jede Batch-Schliessung braucht Verify-Evidence und Doku-Propagation in `references/*`.

---

## 1. Market Credential Flow Verify

**Voraussetzung:** Next.js + Go Gateway laufen.

- [ ] **MC1** — In `Settings` Finnhub-Key speichern; `localStorage` plus
      serverlesbarer Cookie `tradeview_provider_credentials` vorhanden
- [ ] **MC2** — `GET /api/market/providers` zeigt `requiresAuth=true` und
      `configured=true` fuer `finnhub`
- [ ] **MC3** — Quote-E2E ohne ENV-Zwang:
  - Gateway-ENV-Key leer
  - Browser-/Cookie-Pfad vorhanden
  - `GET /api/market/quote?symbol=AAPL` erfolgreich
- [ ] **MC4** — SSE-E2E:
  - `AAPL` Stream / Watchlist funktioniert ueber denselben Credential-Pfad
- [ ] **MC5** — Negativfall:
  - Cookie loeschen / leerer Key
  - sauberer Fehlerpfad statt stiller Frontend-Fallback

- [ ] **BC1** — Benchmark-Baseline in `go-gct-gateway-connections.md` dokumentiert;
      `go test -bench=. -benchmem` im Paket `market/streaming` reproduzierbar

---

## 2. Provider Rollout Matrix

### Gemeinsamer Verify-Contract

Fuer jeden Provider gilt mindestens:

- [ ] `PV.1` Reachability / Health
- [ ] `PV.2` ein representativer Happy Path
- [ ] `PV.3` ein sauberer Error Path
- [ ] `PV.4` stabiles Gateway-Response-Shape
- [ ] `PV.5` nachvollziehbare Observability (`requestId`, logs, error class)

Fuer auth-pflichtige Provider zusaetzlich:

- [ ] `PV.A1` ENV-only funktioniert
- [ ] `PV.A2` request-scoped Override funktioniert
- [ ] `PV.A3` fehlende Credentials liefern keinen stillen Fallback

### Batch 1 — User-Key / request-scoped credential provider

| Provider | Status | Naechster Schritt |
|:---------|:-------|:------------------|
| `finnhub` | vorbereitet | `MC1-MC5` schliessen |
| `fred` | offen | request-scoped Override pruefen |
| `banxico` | offen | entscheiden, ob user-supplied sinnvoll ist |
| `bok` | offen | entscheiden, ob user-supplied sinnvoll ist |

### Batch 2 — Public / no-auth macro provider

| Providergruppe | Restarbeit |
|:---------------|:-----------|
| `ecb`, `bcb`, `bcra`, `tcmb`, `rbi`, `imf`, `oecd`, `worldbank`, `un`, `adb`, `ofr`, `nyfed` | je ein Success- und ein Invalid-/No-Data-Pfad statt Einzelueberengineering |

### Batch 3 — GCT read-only exchange layer

| Exchangegruppe | Restarbeit |
|:---------------|:-----------|
| `binance`, `kraken`, `coinbase`, `okx`, `bybit`, `auto` router | gemeinsame Quote-/Orderbook-/Stream-Live-Gates mit laufendem GCT |

### Batch 4 — Internal / bridge / service provider

| Gruppe | Restarbeit |
|:-------|:-----------|
| `financebridge`, `indicatorservice`, `softsignals`, `memory`, `agentservice`, `acled`, `gdelt`, `cfr`, `crisiswatch`, `gametheory` | representative smoke endpoints + error classification |

---

## 3. Offene Runtime- und Infra-Deltas

| Thema | Status | Restlage |
|:------|:-------|:---------|
| sqlc + pgxpool evaluation | teilweise | produktive DB-Grenze noch nicht gezogen |
| CandleBuilder Lock-Contention | offen | Shard-Lock/sync.Map Phase 19; Baseline in go-gct-gateway-connections |
| NATS JetStream | teilweise | Folgephasen fuer echte Async-Workloads offen |
| Connect-/Go-native sync boundary | offen | bei neuen Go↔Go bzw. Go↔Rust service-grenzen bevorzugt bewerten |
| SIMD / archsimd | offen | nur mit Profiling / Benchmarks entscheiden |
| weitere request-scoped credential consumers | offen | nach `finnhub` gezielt ausrollen |
| stream-first hardening | offen | Replay/Dedupe/Checkpoint-Regeln fuer SSE- und Live-Marktpfade konsolidieren |

---

## 4. Sofort sinnvolle Slices

1. `finnhub` live verifizieren und denselben Transport auf `fred` pruefen
2. weitere read-only Connectoren auf `RetryDecision(...)` und `CredentialStore`
   heben
3. GCT read-only slices weiter ueber `MarketTarget`-/shared-resolver-Grenzen
   konsolidieren
4. Capability-/router-Metadaten enger an echte Runtime-Adapter koppeln
5. SSE-/Stream-Hardening fuer Reconnect, Replay und kontrollierten REST-Fallback
   explizit verifizieren

---

## 5. Compute-Abgrenzung

Die normative Compute-Schnittentscheidung lebt jetzt in
[`compute_delta.md`](./compute_delta.md).

Dieses Dokument behaelt davon nur die Infra-Folgen:

- Messaging / NATS
- provider / rollout / routing
- service-grenzen fuer spaetere Connect-/Go-/Rust-Pfade
- verify-vertraege fuer credential- und provider-lastige Slices

---

## 6. Keine neuen Infra-Minis

Auch im Infra-Bereich werden aktuell keine zusaetzlichen `mini4/5/6/7`
abgespalten.

Grund:

- Provider-Rollout, credential transport und infra follow-ups sind hier bereits
  thematisch sauber gebuendelt
- weitere Splits wuerden eher Agent-/CLI-Kontext zerstreuen als helfen

---

## 7. Querverweise

| Frage | Dokument |
|:------|:---------|
| Gesamtroadmap | [`../EXECUTION_PLAN.md`](../EXECUTION_PLAN.md) |
| Runtime-/Port-Wahrheit | [`../SYSTEM_STATE.md`](../SYSTEM_STATE.md) |
| Compute-Split Go/Python/Rust | [`compute_delta.md`](./compute_delta.md) |
| GeoMap Source-/Provider-Policy | [`../../geo/GEOMAP_SOURCES_AND_PROVIDER_POLICY.md`](../../geo/GEOMAP_SOURCES_AND_PROVIDER_POLICY.md) |
| Quellen-/Key-Onboarding | [`source_onboarding_and_keys.md`](./source_onboarding_and_keys.md) |
| Gateway-/GCT-Arbeitsreferenz | [`../../go-gct-gateway-connections.md`](../../go-gct-gateway-connections.md) |

---

## 8. Evidence Requirements

Fuer jede geschlossene Provider- oder MC-Aufgabe:

- Provider/Batch-ID + Gate-ID (`MC*`, `PV.*`, Batch 1-4)
- Happy-Path + Error-Path Nachweis
- Request-ID-/Observability-Nachweis
- dokumentierter Credential-Pfad (ENV, request-scoped oder beides)
- Referenzstatus synchronisiert (`docs/references/status.md`)

---

## 9. Propagation Targets

- `docs/references/status.md`
- `docs/references/sources/*.md` (bei neuen/veraenderten Quellen)
- `docs/specs/execution/source_onboarding_and_keys.md` (bei neuen Keys)
- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/SYSTEM_STATE.md` (wenn Runtime-/Boundary-Realitaet betroffen)

---

## 10. Exit Criteria

- `MC1-MC5` entschieden/geschlossen
- Batch 1-4 jeweils mit mindestens einem verifizierten Success+Error Muster
- keine auth-pflichtige Quelle ohne dokumentierten Key-/Onboarding-Pfad
