# Cross-Cutting Verify Checklist

> **Stand:** 09. Maerz 2026
> **Zweck:** Aktive Verify- und Cross-Cutting-Checkliste. Erledigte historische
> Sprintmasse wurde in Archiv-/Statusdokumente verdichtet.
> **Archiv:** [`../../archive/execution_mini_plan_rev5_2026-03-03.md`](../../archive/execution_mini_plan_rev5_2026-03-03.md)

---

## 0. Execution Contract (verbindlich fuer CLI-Agents)

### Scope In

- offene Verify-Gates ueber mehrere Phasen (Auth, Streaming, Geo, Portfolio, Agent, Provider)
- browser-/runtime-nahe End-to-End-Abnahme mit reproduzierbaren Nachweisen
- Synchronisierung von Verify-Ergebnissen in Owner-Dokumente

### Scope Out

- Architektur-Rewrites
- neue Produkt-Roadmaps ohne bestehenden Verify-Bezug
- historische Sprint-Erzaehlungen

### Mandatory Upstream Sources (vor Abarbeitung lesen)

- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/SYSTEM_STATE.md`
- `docs/specs/ARCHITECTURE.md`
- `docs/specs/API_CONTRACTS.md`
- `docs/specs/AUTH_SECURITY.md`
- `docs/specs/FRONTEND_ARCHITECTURE.md`
- `docs/geo/GEOMAP_OVERVIEW.md`
- `docs/geo/GEOMAP_VERIFY_GATES.md`
- `docs/references/status.md`

### Arbeitsprinzip

- Jede Gate-Schliessung braucht **Evidence** (Logs, API-Response, UI-Screenshot, Testoutput).
- Jede Gate-Schliessung muss **Propagation Targets** nachziehen (siehe Sek. 9).
- Wenn Root-/Owner-Dokumente und Laufzeitrealitaet divergieren, zuerst Owner-Dokument aktualisieren, dann hier den Gate-Status.

---

## 1. Offene Gate-Gruppen

| Gate | Status | Restlage |
|:-----|:-------|:---------|
| Phase 1 residual auth E2E | offen | `1.v17`, `1.v18`, `1.v19`, `1.v22` |
| Phase 3 streaming browser verify | offen | ready/reconnect/alert/browser flows |
| Phase 4 GeoMap closeout | offen | siehe [`geomap_closeout.md`](./geomap_closeout.md) + `docs/geo/GEOMAP_VERIFY_GATES.md` |
| Phase 5 browser cache/query verify | offen | 5.1–5.3 (Portfolio Bridge, GCT-Onboarding, Panel-Flows) |
| Phase 7 browser verify | offen | restliche indicator UI-/browser-gates |
| Phase 8 acceptance | offen | finale pytest/browser acceptance |
| Phase 10 agent verify | offen | `10.v1-10.v3` |
| Phase 12 broad geo verify | offen | contradiction/alert/pdf export |
| Phase 13 browser remainder | teilweise offen | `13.v4` |
| Phase 14 provider verify | offen | `14.v1-14.v3` |

---

## 2. Phase 1: Residual Auth Verify

- [ ] **1.v17** — Global Revocation E2E: Password Change in Tab B fuehrt zu
      `401` in Tab A auf Go-Route
- [ ] **1.v18** — MFA Enforcement Check: sensible Go-Route ohne MFA-Login wird
      abgelehnt
- [ ] **1.v19** — Hardware/Recovery Check: Passwort-Reset via Recovery-Code
      funktioniert end-to-end
- [ ] **1.v22** — MFA `amr` Verify: Login mit MFA erzeugt erwarteten Claim /
      Observability-Nachweis

### Soft-Lock Browser Verify

- [ ] `IDLE_SOFT_MS` testweise auf kurze Dauer setzen -> LockScreen erscheint
- [ ] RAM-State (Symbol, Watchlist, Workspace) bleibt nach Lock erhalten
- [ ] falsches Passwort 5x -> Hard sign-out
- [ ] richtiges Passwort -> Overlay verschwindet ohne State-Verlust
- [ ] Cross-tab Lock via BroadcastChannel funktioniert

---

## 3. Phase 3 bis 5: Browser / SSE / Cache

### Streaming

- [ ] Browser-Verify fuer `market/stream`
- [ ] reconnect-/snapshot-/alert-Verhalten im UI pruefen
- [ ] mixed/unsupported Symbol-Faelle liefern gated Fallback statt stiller
      Degradation

### GeoMap

- [ ] Phase-4 Closeout und alle offenen Punkte: siehe
      [`geomap_closeout.md`](./geomap_closeout.md)

### Caching / Query

- [ ] regions GET: zweiter Request -> Cache-Hit nachvollziehbar
- [ ] alerts/policy PATCH -> `revalidateTag` -> frischer GET
- [ ] App startet ohne Query-Context-Fehler

### Portfolio (Phase 5)

- [ ] **5.1** Portfolio Bridge + Analytics: Paper-Tab, `/api/fusion/portfolio`, Rolling-Metrics-Endpoint erreichbar
- [ ] **5.2** GCT Exchange-Onboarding Smoke (Binance): verbinden/validieren/trennen + Status in Trading/Settings pruefen
- [ ] **5.3** Portfolio-Panels: Query- und Polling-Flows liefern erwartete Daten (OrdersPanel, PortfolioPanel, MemoryStatusBadge)

---

## 4. Phase 7 und 8: Indicator / Pattern Acceptance

### Phase 7

- [ ] verbleibende Browser-/UI-Gates fuer Swing/MA/Fibonacci schliessen

### Phase 8

- [ ] finale `pytest`-Abnahme fuer Pattern-Block
- [ ] browserseitige Overlay-/pattern-Integration gegen echte Responses pruefen

---

## 5. Phase 10 / 12 / 13 / 14

### Agent Runtime

- [ ] **10.v1** representative agent runtime flow
- [ ] **10.v2** memory/context/tool integration smoke
- [ ] **10.v3** policy-/error-path verify

### Breiter Geo-/UIL-Rest

- [ ] contradiction flow verify
- [ ] alert flow verify
- [ ] PDF/export-path verify

### Portfolio Advanced

- [ ] `13.v4` Browser- oder Surface-Restpunkt schliessen

### Provider Expansion

- [ ] **14.v1** representative provider success-path
- [ ] **14.v2** representative sanctions/source verify sauber dokumentieren
- [ ] **14.v3** error-path / schema-drift / timeout-path schliessen

---

## 6. Bewertungs- / Beobachtungspunkte

- [ ] **ChartGPU Evaluation** als spaetere Frontend-/Perf-Frage offen halten,
      aber nicht vor den aktuellen Verify-Gates priorisieren

---

## 7. Arbeitsregel

Dieses Dokument bleibt eine **aktive Rest-Checkliste**.

- keine langen historischen Erzaehlungen mehr
- keine zweite Phase-Tabelle neben `EXECUTION_PLAN.md`
- erledigte Punkte werden ausgeduennt oder ins Archiv verschoben

---

## 8. Evidence Requirements

Jeder geschlossene Verify-Punkt braucht mindestens:

- eindeutige Gate-ID (`1.v17`, `5.2`, `10.v1`, ...)
- Ausfuehrungskontext (Branch/Datum/Runtime)
- Nachweisart:
  - API: Request + Status + Response-Shape
  - Browser: reproduzierbare Schritte + beobachtetes Ergebnis
  - Test: Kommando + kurzes Ergebnis
- Fehlerfall (falls vorhanden) und wie er sauber klassifiziert wurde

---

## 9. Propagation Targets (Pflicht-Updates nach Gate-Schluss)

- `docs/specs/EXECUTION_PLAN.md` (aktive Gate-Lage)
- `docs/specs/SYSTEM_STATE.md` (wenn IST/SOLL sich aendert)
- `docs/specs/AUTH_SECURITY.md` (Auth-Gates)
- `docs/specs/FRONTEND_ARCHITECTURE.md` (UI-/BFF-/State-Gates)
- `docs/geo/GEOMAP_VERIFY_GATES.md` (GeoMap Verify-Nachweise)
- `docs/references/status.md` (Provider-/Quellen-Gates)

---

## 10. Exit Criteria

Dieses Dokument gilt als "Gate-clean", wenn:

- keine offenen Eintraege mehr ohne Owner und naechsten Schritt existieren
- alle als erledigt markierten Gates Evidence besitzen
- alle betroffenen Owner-Dokumente synchronisiert sind
