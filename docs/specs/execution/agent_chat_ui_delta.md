# Agent Chat UI Delta

> **Stand:** 13. Maerz 2026 (Rev. 8)
> **Phase:** 22a — Agent Chat UI + Streaming Frontend
> **Zweck:** Execution-Owner fuer den Chat-UI-Layer ueber dem Go/Python Agent-Stack (Chat-UI first; Harness nur frontend-relevante Boundaries).
> **Aenderungshistorie:**
> - Rev. 1 (12.03.2026): Scaffold erstellt; Typ-Definitionen + Stub-Komponente vorhanden
> - Rev. 2 (13.03.2026): Evaluationsspur TanStack AI vs. Vercel AI SDK
> - Rev. 3 (13.03.2026): Slice auf Standardstruktur normalisiert (0–4)
> - Rev. 4 (13.03.2026): Priorisierung geschaerft (Chat-Core zuerst), Checklisten/Gates erweitert, Referenz auf `frontend_chat_ui.md` als Detailquelle
> - Rev. 5 (13.03.2026): Mission-Control Add-on explizit eingeordnet (session-zentriertes Threading, SSE-first + polling fallback, operator-nahe Tool-Event UX)
> - Rev. 6 (13.03.2026): Chat -> Control Einstieg als expliziter End-Checkpoint ergaenzt; Referenz auf `control_surface_delta.md`
> - Rev. 7 (13.03.2026): Onyx-Add-on fuer Chat-Robustheit ergaenzt (Packet-Placement, Message-Tree-Branching, session-isolierter Store)
> - Rev. 8 (13.03.2026): Deepdive-Hardening aus Perplexica/AgentZero/Tambo ergaenzt (Parser-Robustheit, Terminal-Idempotenz, Thread-Migration, Merge-Policy, Queue/Composer Contracts)

---

## 0. Execution Contract

### Scope In

- Frontend Chat-UI ueber Agent-Layer (Go Gateway -> Python memory-service -> LLM), mit Fokus auf Message-Thread + Composer + Streaming
- SSE-Streaming-Rendering fuer Antwort-Chunks inkl. Fehler-/Reconnect-UX
- Message-Thread-Management inkl. Persistenzanbindung (`AgentEpisode`)
- optionales session-zentriertes Threading fuer lokale/gateway Runtimes (`session:*`), sofern fuer Chat-UX sinnvoll
- Tool-Call-Visualisierung im Thread (collapsible / timeline-artig)
- Frontend-nahe Harness-/Security-Boundaries (kein browser-direkter Tool-Wirkpfad, read-only/bounded-write sichtbar)
- SDK-Entscheid fuer Chat-UI-Layer (TanStack AI vs. Vercel AI SDK) als Evaluate-Track
- LLM-Provider-Interface im Gateway (Anthropic/Ollama/vLLM) nur soweit noetig fuer Chat-UI-Verifikation
- Hybrid-Realtime-Verhalten (`SSE-first`, polling als kontrollierter fallback ohne duplicate side-effects)

### Scope Out

- Agent-Business-Logic in Python
- tiefe Memory-KG-/Vector-Store-Strategien ausser Chat-bezogener Persistenznutzung
- generelle Frontend-Styling- und Design-System-Refactors ausser Chat-Surface
- vollstaendige Harness-/Security-Programmatik ausser frontend-relevanter Chat-Boundaries

### Priorisierungsregel (verbindlich)

1. Chat-Core zuerst (Composer, Thread, SSE, Fehlerpfade, Persistenz)
2. Tool-Event-UX + Reconnect/Degradation
3. Provider/SDK-Track
4. Alles andere bleibt explizit nachgelagert

### Mandatory Upstream Sources

- `docs/specs/FRONTEND_ARCHITECTURE.md`
- `docs/specs/execution/frontend_enhancement_delta.md`
- `docs/specs/execution/agent_harness_runtime_delta.md`
- `docs/frontend_chat_ui.md`
- `docs/AGENT_SECURITY.md`
- `docs/AGENT_TOOLS.md`
- `docs/GO_GATEWAY.md`

### Baseline (wichtig)

- Scaffold existiert bereits in `src/features/agent-chat/`:
  - `types.ts`
  - `AgentChatPanel.tsx` (Stub)
- Zielpfad bleibt:
  - `AgentChatPanel` -> `/api/agent/chat` (BFF, SSE) -> Go Gateway -> Python memory-service
- API-Contract (Ziel):

```ts
// POST /api/agent/chat (SSE)
// Request:
{ threadId?: string; message: string; agentId?: string }

// SSE Events:
// event: chunk    data: { delta: string }
// event: done     data: { threadId: string; messageId: string }
// event: tool     data: { name: string; input: unknown; result: unknown }
// event: error    data: { message: string }
```

---

## 1. Offene Deltas

### A. Chat-Core UI

- [ ] **AC1** `AgentChatPanel` von Stub auf produktionsnahe Grundstruktur bringen (Thread, Composer, Statusleisten)
- [ ] **AC2** Composer-Funktionen implementieren (send, disabled/pending, enter/shift-enter, basic attachments hook)
- [ ] **AC3** Message-Thread Rendering implementieren (user/assistant getrennt, progressive updates, basic actions)
- [ ] **AC4** Fehler-/Leerlauf-/Initial-Zustaende implementieren (empty, loading, error bubble, retry CTA)

### B. Streaming & Transport

- [ ] **AC5** Next BFF `/api/agent/chat` mit stabilem SSE-Proxy/Adapter verdrahten
- [ ] **AC6** Go Gateway `/agent/chat` SSE-Endpoint implementieren/vervollstaendigen
- [ ] **AC7** Python memory-service Chat-Handler + Anthropic Streaming an Gateway anbinden
- [ ] **AC8** Event-Mapping im Frontend verankern (`chunk`, `done`, `tool`, `error`) inkl. Reihenfolge-/idempotenz-Regeln
- [ ] **AC9** Reconnect-/Degradation-Pfad implementieren (unterbrochener Stream -> resume oder sauberer Retry) und polling-fallback nur kontrolliert aktivieren

### C. Thread & Persistenz

- [ ] **AC10** Thread-Lifecycle (new, load, switch, restore) auf `AgentEpisode` abbilden; optionaler `session:*`-Threadtyp klar abgegrenzt
- [ ] **AC11** Reload-Restore sauber implementieren (letzter Thread + in-flight state konsistent)
- [ ] **AC12** Thread-History UX minimal lauffaehig machen (list/search/new/fork als gestufter Scope)

### D. Tool-Event UX

- [ ] **AC13** Tool-Event-Visualisierung als collapsible Eintraege implementieren
- [ ] **AC14** Process-/Status-Aggregation fuer Tool-Events definieren (running/success/error, timestamps, duration) und operator-tauglich collapsible machen
- [ ] **AC15** Message-Action Contract festziehen (copy/retry/regenerate/stop je nach status)

### E. Frontend-nahe Harness/Security-Grenzen

- [ ] **AC16** "kein browser-direkter Tool-Wirkpfad" technisch absichern (nur `UI -> BFF -> Gateway -> Tool`)
- [ ] **AC17** read-only/bounded-write Markierung fuer Agent-UI Aktionen sichtbar machen
- [ ] **AC18** audit-faehige Event-Spur im Chat-Kontext fuehren (intent -> event -> result)

### F. SDK/Provider Evaluate-Track

- [ ] **AC19** TanStack AI vs. Vercel AI SDK gegen bestehenden no-SDK-Pfad evaluieren
- [ ] **AC20** Primaeren SDK-Pfad mit Begruendung festlegen (oder no-SDK beibehalten)
- [ ] **AC21** Gateway `LLM_PROVIDER` Track (Anthropic/Ollama/vLLM) auf Chat-UI-Verifizierbarkeit begrenzen
- [ ] **AC22** Ollama/vLLM dev-opt-in Nachweise fuer Chat-Flow dokumentieren

### G. Onyx-inspirierte Robustheits-Add-ons (additiv)

- [ ] **AC23** Event-Contract um optionale Packet-Metadaten erweitern (`turn_index`, optional `tab_index`) fuer stabile Reihenfolge bei Tool-/Parallel-Events
- [ ] **AC24** Message-Tree-Branching-Contract fuer regenerate/fork/switch definieren und im Frontend konsistent abbilden
- [ ] **AC25** Session-isolierten Chat-State festziehen (pro Session: in-flight state, error state, abort-controller) ohne Cross-Session-Leaks
- [ ] **AC26** Scroll-/Autofollow-Regeln stabilisieren (auto-follow nur wenn "at bottom", kein jumpy Verhalten bei Streaming)
- [ ] **AC27** Message-Toolbar-Action-Vertrag explizit machen (statusabhaengig copy/retry/regenerate/sources)

### H. Deepdive-Hardening aus den 3 Chat-Blueprints

- [ ] **AC28** Stream-Parser-Robustheit absichern (partial-frame buffering, keine hard-fails bei unvollstaendigen Chunks, klare Behandlung malformed frames)
- [ ] **AC29** Terminal-Event-Idempotenz absichern (`done`/`messageEnd` pro Message nur einmal wirksam; doppelte End-Frames ohne Side-Effects)
- [ ] **AC30** Placeholder->Real-Thread-Migration contract festziehen (lokaler Placeholder-Thread wird bei finaler Thread-ID deterministisch ueberfuehrt)
- [ ] **AC31** Poll/Reload-Merge-Policy definieren (bei aktivem Stream kontrolliertes merge/skip, dedupe per messageId, stabile Sortierung nach createdAt)
- [ ] **AC32** Queue-Concurrency-Contract absichern (sequential queue-add operations, pending-upload guard, cancel/remove semantics, send-all safety)
- [ ] **AC33** Composer-Optimistic-Submit-Contract absichern (optimistic clear bei submit, restore-on-failure ohne Input-Loss)

---

## 2. Verify-Gates

- [ ] **AC.V1** Nachricht senden -> Antwort wird chunk-fuer-chunk sichtbar (kein Freeze, korrekte Reihenfolge)
- [ ] **AC.V2** Stream-Unterbruch -> Reconnect oder kontrollierter Retry-Pfad greift ohne UI-Crash
- [ ] **AC.V3** Thread wird nach Reload konsistent wiederhergestellt (inkl. letztem aktiven Thread)
- [ ] **AC.V4** Tool-Events erscheinen als eigene, kollabierbare Thread-Eintraege mit Status
- [ ] **AC.V5** Fehlerfall erzeugt Error-Bubble + Retry-Action; keine silent failures
- [ ] **AC.V6** Frontend nutzt keinen browser-direkten Tool-Wirkpfad (nur via BFF/Gateway)
- [ ] **AC.V7** read-only/bounded-write Kennzeichnung ist im Chat-UI sichtbar/testbar
- [ ] **AC.V8** SDK-Entscheid (TanStack AI vs. Vercel AI SDK vs no-SDK) ist datiert, begruendet und reproduzierbar dokumentiert
- [ ] **AC.V9** Fallback-Betrieb validiert: bei SSE-Ausfall funktioniert polling kontrolliert weiter (keine doppelten Messages, keine stillen Side-Effects)
- [ ] **AC.V10** Chat -> Control Einstieg ist vorhanden/testbar (Button/Action in `AgentChatPanel`), verlinkt auf `/control` bzw. Subtab-Deep-Link; Umsetzung konsistent mit `docs/specs/execution/control_surface_delta.md`
- [ ] **AC.V11** Packet-Placement-Reihenfolge ist deterministisch (keine vertauschten Tool-/Parallel-Ereignisse)
- [ ] **AC.V12** Regenerate/Fork fuehrt zu konsistentem Message-Branching ohne Verlust des aktiven Threads
- [ ] **AC.V13** Session-Wechsel zeigt keine State-Leaks (errors/in-flight/abort) zwischen Sessions
- [ ] **AC.V14** Partial/fragmentierte Stream-Frames werden robust verarbeitet; unvollstaendige Chunks crashen die UI nicht
- [ ] **AC.V15** Doppelte Terminal-Events (`done`/`messageEnd`) erzeugen keine doppelten Persistenzen/Statuswechsel
- [ ] **AC.V16** Placeholder->Real-Thread-Uebernahme ist deterministisch (keine Message-Verluste, aktive Ansicht konsistent)
- [ ] **AC.V17** Poll/Reload-Merge liefert keine Duplikate und bleibt bei Streaming stabil (skip/merge-Regel nachweisbar)
- [ ] **AC.V18** Queue mit pending uploads blockiert unsichere send-all Aktionen; cancel/remove Verhalten konsistent
- [ ] **AC.V19** Composer verliert bei Send-Fehlern keinen Text (optimistic clear + restore-on-failure nachweisbar)

---

## 3. Evidence Requirements

- Screenshot/Recording fuer AC.V1–AC.V7 (mind. Happy Path + Error/Reconnect Path)
- Screenshot/Recording fuer AC.V9 (SSE down -> fallback polling -> recover)
- kurzer Vergleichsreport TanStack AI vs. Vercel AI SDK vs no-SDK (Stabilitaet, DX, Integrationsaufwand, Boundary-Fit)
- Nachweis der Thread-Persistenz (`AgentEpisode`) vor/nach Reload + bei Thread-Switch
- API-Contract-Validierung der SSE-Events (`chunk`, `done`, `tool`, `error`) inkl. Beispielpayloads
- Nachweis Gateway-bound Tool-Pfad (Request-Trace oder technische Dokumentation der Aufrufkette)
- Nachweis fuer AC.V11-AC.V13 (Packet-Reihenfolge, Branching-Flow, Session-Isolation)
- Nachweis fuer AC.V14-AC.V19 (Parser-Robustheit, End-Idempotenz, Thread-Migration, Merge-Policy, Queue-Concurrency, Composer-Restore)
- Referenzabgleich auf Detail-Blueprint:
  - `docs/frontend_chat_ui.md` Abschnitte zu Component Map, Gap-Matrix, Security-Boundaries
  - inkl. Mission-Control + Onyx Add-on Abschnitte (nur additive Uebernahmen, kein Chat-Core-Shift)

---

## 4. Propagation Targets

- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/FRONTEND_ARCHITECTURE.md`
- `docs/specs/execution/frontend_enhancement_delta.md`
- `docs/specs/execution/agent_harness_runtime_delta.md`
- `docs/frontend_chat_ui.md`
- `docs/specs/execution/control_surface_delta.md`
