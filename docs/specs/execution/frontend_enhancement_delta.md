# Frontend Enhancement Delta

> **Stand:** 16. Maerz 2026
> **Zweck:** Execution-Owner fuer Frontend-Enhancements aus
> `docs/FRONTEND_ENHANCEMENT.md` (TS-Vertraege, Fehlermodell, UI-Execution-Policies,
> Agent-UI-Boundaries).

---

## 0. Execution Contract

### Scope In

- TS boundary contracts fuer exportierte Frontend-Servicefunktionen
- konsistentes, typisiertes Fehlermodell fuer API/Action-Adapter
- event-pfadbezogene Execution-Policies (debounce/throttle/batch/queue)
- Agent-UI-Boundary-Gates fuer riskante Write-Pfade

### Scope Out

- allgemeine Design-System- oder Styling-Refactors
- backendseitige Auth-/Policy-Logik im engeren Sinn
- nicht-frontendbezogene Compute-/Infra-Slices

### Mandatory Upstream Sources

- `docs/FRONTEND_ENHANCEMENT.md`
- `docs/specs/FRONTEND_ARCHITECTURE.md`
- `docs/specs/execution/frontend_refinement_perf_delta.md`
- `docs/specs/execution/platform_dx_quality_delta.md`
- `docs/AGENT_SECURITY.md`

---

## 1. Offene Deltas

- [x] **FEN1** Boundary-Funktionsliste fuer explizite Return-Type-Contracts festlegen
  - 16.03.2026: Boundary-Liste ist in `docs/FRONTEND_ENHANCEMENT.md` Abschnitt 2.2 festgezogen und deckt die aktiven `market`, `fusion` und `agent/chat`-Grenzen ab
- [x] **FEN2** Error-Reason-Union fuer zentrale Servicepfade definieren
  - 16.03.2026: `fetchQuoteViaGateway()` liefert in `src/lib/server/market-gateway-quotes.ts` jetzt ein explizites `GatewayQuoteResult` mit `UNRESOLVED_SYMBOL | DOWNSTREAM_UNAVAILABLE | GATEWAY_REJECTED`; `src/app/api/market/provider-credentials/route.ts` fuehrt zusaetzlich `INVALID_JSON_BODY | INVALID_MUTATION_PAYLOAD` als explizite Route-Fehlergruende ein
  - 17.03.2026: `research/home` verwendet jetzt eine geschlossene `ResearchDegradationReason`-Union (`NO_LOCAL_EVENTS | INSUFFICIENT_EVENT_CONTEXT | INVALID_LOCAL_RESEARCH_SHAPE | LOCAL_RESEARCH_BUILD_FAILED`) statt freier degradierter Strings
  - 17.03.2026: fuer die priorisierten aktiven Frontend-Servicepfade dieser Runde ist die Reason-Union damit festgezogen; neue Pfade laufen kuenftig ueber dieselbe Regel
- [x] **FEN3** Adapter-Mapping fuer API/Action/UI-Reaktionen vereinheitlichen
  - 16.03.2026: `src/app/api/market/quote/route.ts` mappt Gateway-Fehler jetzt explizit auf `{ error, reason }`, `src/lib/orders/snapshot-service.ts` behandelt das Result exhaustiver statt implizitem `null`-Pfad, `src/app/api/market/provider-credentials/route.ts` liefert fuer Parse-/Schemafehler ebenfalls eine explizite `{ error, reason }`-Huelle, und `src/app/api/fusion/orders/route.ts`, `src/app/api/fusion/orders/[orderId]/route.ts`, `src/app/api/fusion/alerts/route.ts`, `src/app/api/fusion/alerts/[alertId]/route.ts`, `src/app/api/fusion/preferences/route.ts` sowie `src/app/api/fusion/trade-journal/route.ts` und `src/app/api/fusion/trade-journal/[entryId]/route.ts` tragen jetzt konsistente `reason`-Felder fuer Query-/JSON-/Payload-/Persistence-Fehler
  - 17.03.2026: `src/app/api/research/home/route.ts` mappt Local-Build-/Shape-Fehler jetzt nur noch auf die geschlossene Fallback-Huelle statt `LOCAL_RESEARCH_BUILD_FAILED:<message>`
  - 17.03.2026: fuer die priorisierten Adapter dieser Runde ist das Mapping damit vereinheitlicht; weitere neue Adapter folgen derselben Regel statt eigener Slice-Arbeit
- [x] **FEN4** Eventreiche Flows mit expliziter Execution-Policy markieren
  - 16.03.2026: mutierende Frontend-Pfade fuer `orders`, `alerts`, `preferences` und `trade-journal` liefern jetzt explizite, UI-taugliche Fehler-Reasons statt diffuser 400/500-Huellen
  - 17.03.2026: auch read-heavy Research-/Calendar-Fallbacks exponieren jetzt nur noch geschlossene degradierte Reasons fuer UI-Handling
  - 17.03.2026: eventreiche Kernpfade dieser Runde sind damit markiert; Last-/Interaktionsnachweise bleiben im Verify-Teil
- [x] **FEN5** Debounce/Throttle/Batch/Queue-Regeln pro Use-Case dokumentieren
  - 16.03.2026: Policy-Matrix in `docs/FRONTEND_ENHANCEMENT.md` dokumentiert jetzt konkrete Regeln fuer `useWatchlist` (180ms debounce), `useCompositeSignal` (300ms debounce), `InactivityMonitor` (500ms throttle), Quote-`quote_batch`-Streaming und Reindex-Queueing
  - 17.03.2026: non-live Dokumentationspflicht ist damit abgeschlossen; policy-konforme Last-Verify bleibt offen
- [x] **FEN6** Agent-UI Write-Intents nur ueber sichere Backend-Boundaries routen
  - 16.03.2026: `src/app/api/agent/chat/route.ts` erzwingt jetzt einen strict Request-Envelope (`message`, `threadId`, `agentId`) und lehnt unerwartete Tool-/Scope-/Write-Felder mit `INVALID_CHAT_PAYLOAD` ab; negative Tests liegen in `src/app/api/agent/chat/route.test.ts`
- [x] **FEN7** Lint-/Type-Gates fuer Vertragsdrift und untyped Errors verschaerfen
  - 16.03.2026: Frontend-Gates laufen jetzt ueber `typecheck` + `test:unit` + `test:integration` in `package.json`, `lefthook.yml` und `.github/workflows/ci.yml`
  - 17.03.2026: aktuelle Slice-Anforderung ist damit erfuellt; eine spaetere dedizierte lint rule fuer freie reason-Strings ist Optimierung, kein Blocker fuer diesen Delta-Abschluss
- [x] **FEN8** Slice-uebergreifenden Quality-Gate-Vertrag fuer FE/FEN-Deltas festziehen
  - Status und Verify-Evidence bleiben je Delta eindeutig einem FE- oder FEN-Eintrag zugeordnet
  - keine konkurrierenden Abschlusszustaende zwischen Refinement- und Enhancement-Slice
  - 16.03.2026: aktive Boundary-/Policy-/Gate-Evidence ist jetzt konsistent zwischen `frontend_refinement_perf_delta.md`, `frontend_enhancement_delta.md` und `docs/FRONTEND_ENHANCEMENT.md` verankert
- [x] **FEN9** Intake-Policy fuer neue Frontend-Befunde in die Execution-Deltas etablieren
  - neue Befunde werden als FE- oder FEN-Delta mit Owner und Verify-Gate erfasst
  - kein Abschluss ohne zugehoerige Evidence-ID im jeweiligen Slice
  - 16.03.2026: diese Intake-Regel ist jetzt explizit im Root-Dokument `docs/FRONTEND_ENHANCEMENT.md` und in beiden FE/FEN-Slices gespiegelt

---

## 2. Verify-Gates

- [x] **FEN.V1** Boundary-Functions halten explizite Return-Contracts stabil
  - 16.03.2026: Boundary-Liste ist dokumentiert und zentrale Contract-Guards sind ueber Route-/Query-Tests abgedeckt
  - 17.03.2026: fuer die priorisierten aktiven Frontend-Boundaries dieser Runde ist der non-live Nachweis erbracht; weitere Laufzeitverify bleibt kein Teil dieses non-live Abschlusses
- [x] **FEN.V2** Error-Reasons werden exhaustiv behandelt (keine diffuse fallback-only paths)
  - 17.03.2026: `market/quote`, `provider-credentials`, `orders`, `alerts`, `preferences`, `trade-journal`, `agent/chat`, `research/home` und `intelligence-calendar/events` nutzen jetzt geschlossene Reason-Sets oder explizite degradierte Enums
  - 17.03.2026: fuer die priorisierten Frontend-Pfade dieser Runde ist damit kein diffuser fallback-only Pfad mehr Owner-los offen
- [~] **FEN.V3** Search/streaming/autosave verhalten sich unter Last policy-konform
  - 16.03.2026: Richtlinien und aktuelle Runtime-Pfade sind dokumentiert; echter Last-/Interaktionsnachweis in Browser/DevTools bleibt offen
- [x] **FEN.V4** Agent-UI kann keine unautorisierten High-risk Writes ausloesen
  - 16.03.2026: `agent/chat` rejectet unerwartete Tool-/Scope-/Write-Felder per strict Schema; negative Regressionstests sind hinterlegt
- [x] **FEN.V5** Type-/Lint-Gates erkennen Vertragsdrift reproduzierbar
  - 17.03.2026: aktuelle Runde verifiziert ueber `bunx tsc --noEmit`, `bunx @biomejs/biome check` sowie Route-Tests fuer `research/home`, `intelligence-calendar/events` und `agent/chat`
  - 17.03.2026: dedizierte lint rule fuer freie reason-Strings bleibt Folgearbeit, ist aber kein offener non-live Verify-Block mehr
- [x] **FEN.V6** FE-/FEN-Deltas haben eindeutigen Status ohne widerspruechliche Slice-Zustaende
- [x] **FEN.V7** Fuer neue Frontend-Befunde existiert jeweils ein FE- oder FEN-Eintrag mit Verify-Hinweis
  - 16.03.2026: neue Befunde der laufenden Runde (`agent/chat` boundary, query-default guard, policy-matrix) wurden jeweils unmittelbar in FE/FEN-Deltas mit Evidence erfasst

---

## 3. Evidence Requirements

- konkrete Before/After-Beispiele fuer Vertrags- und Error-Modell-Aenderungen
- Last-/Interaktionsnachweise fuer policy-sensitive UI-Pfade
- negative Tests fuer unautorisierte Agent-UI-Write-Intents
- Querverweise auf geupdatete Frontend-/DX-/Agent-Security-Dokumente

---

## 4. Propagation Targets

- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/FRONTEND_ARCHITECTURE.md`
- `docs/specs/execution/frontend_refinement_perf_delta.md`
- `docs/specs/execution/platform_dx_quality_delta.md`








