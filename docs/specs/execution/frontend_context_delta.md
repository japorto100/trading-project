# Frontend Context Delta

> **Stand:** 18. Maerz 2026 (Rev. 4)
> **Phase:** 22e — Frontend Context Injection
> **Zweck:** Planung und Evaluation der seitenspezifischen Kontext-Injection in den Agent Chat
> und generell fuer alle Agent-nahen Frontend-Einstiegspunkte.
> **Aenderungshistorie:**
> - Rev. 1 (14.03.2026): Erstanlage — AC94 aus agent_chat_ui_delta.md, Page-Kontext-Evaluation, generelle Agent-Context-Checkboxen
> - Rev. 2 (14.03.2026): FC12/FC13/FC14 implementiert — `setChatContext` in GlobalChatContext, `buildTradingContext()` in `src/lib/chat-context-builders.ts`, useEffect (false→true Transition) in trading/page.tsx
> - Rev. 3 (17.03.2026): FC1/FC6/FC9 als done markiert (AC90/AC94/AC95 abgeschlossen); Replication-Matrix fuer alle Shell-Pages ergaenzt; AskAiContextMenu + IndicatorAiTooltip + buildXxxContext als drei Ausbau-Patterns dokumentiert
> - Rev. 4 (18.03.2026): FC3/FC4/FC5 code-complete; FC13 vollstaendig (alle builder functions); Verify-Gates FC.V2/FC.V9/FC.V10 ergaenzt

---

## 0. Scope

### Scope In

- Welcher Kontext wird von welcher Seite automatisch in den Chat injiziert (AC87/AC94)
- Context-Chip UI im Chat-Header (AC94)
- "Ask AI about this" Kontextmenue-Einstiegspunkte (AC90) pro Page/Komponente
- `useCompletion`-basierte Inline-AI-Hints auf Metric-Badges (AC95) pro Page
- Generelle Evaluation: welche Frontend-Kontexte sind fuer Agent-Antworten wertvoll

### Scope Out

- Backend Context Assembly / RAG / Retrieval → `agent_memory_context_delta.md`
- Agent Security / Tool-Policy → `agent_security_runtime_delta.md`
- Keyboard-Shortcuts fuer Chat-Oeffnen → `command_keyboard_delta.md`

---

## 1. Drei Ausbau-Patterns (aus /trading abgeleitet)

| Pattern | Komponente | Beschreibung | Trading: done |
|---------|-----------|-------------|---------------|
| **A** Page-Kontext-Injection | `buildXxxContext()` + `setChatContext` | Wenn Chat oeffnet → Snapshot der aktuellen Page als Kontext-Chip | ✅ `buildTradingContext()` |
| **B** Ask-AI Context-Menu | `<AskAiContextMenu context={...}>` | Rechtsklick auf beliebiges Element → Chat oeffnet mit Element-Kontext | ✅ Chart-Area |
| **C** Inline AI Tooltip | `<IndicatorAiTooltip prompt={...}>` | Hover auf Metric-Badge → `useCompletion` → single-shot Erklaerung | ✅ RVOL/CMF/ATR/Rhythm/Signal |

---

## 2. Offene Deltas

### A. Context-Chip UI (Chat-Header)

- [x] **FC1** Context-Chip in `AgentChatHeader` — dismissible emerald Badge; `chatContext !== null` → Chip sichtbar; X-Button → `clearChatContext()`; implementiert via AC94

### B. Page-spezifische Kontext-Injection (Pattern A)

- [x] **FC2** `/trading` — `buildTradingContext(symbol, tf, stats, lineState)` in `trading/page.tsx`; Trigger: Chat false→true Transition; symbol+timeframe an TradingWorkspace weitergegeben (AC90 context)
- [x] **FC3** `/geopolitical-map` — `buildGeoContext(region, activeEventCount?, focusEventTitle?)` — **code-complete (18.03.2026)**
  - `GeopoliticalMapShell.tsx`: `useGlobalChat` + `useEffect` (chatOpen false→true); Kontext: `activeRegionId` + `visibleEvents.length` + `selectedEvent?.title`
  - Verify: FC.V2 (Live-Verify offen)
- [x] **FC4** `/research` — `buildResearchContext(regime?, confidence?, degraded?)` — **code-complete (18.03.2026)**
  - `ResearchPage.tsx`: `useGlobalChat` + `useEffect` (vor fruehen Returns); Kontext: `payload.marketSummary.regime` + `.confidence` + `degraded`
  - Verify: FC.V9 (Live-Verify offen)
- [x] **FC5** `/calendar` — `buildCalendarContext(totalEvents?, activeFilter?, focusEventTitle?)` — **code-complete (18.03.2026)**
  - `IntelligenceCalendarPage.tsx`: `useGlobalChat` + `useEffect`; Kontext: `events.length` + `filters.impact` + Focus-Event-Titel
  - Verify: FC.V10 (Live-Verify offen)
- [ ] **FC16** `/events/[eventId]` — `buildEventDetailContext(event)` direkt aus Event-Daten; automatisch injiziert da Page per se einen spezifischen Event zeigt
- [ ] **FC17** `/control` — `buildControlContext(tab, strategy?, mode)` — ueberlegenswert ob wertvoll; Control ist bereits AI-nah

### C. "Ask AI about this" (Pattern B — AskAiContextMenu)

- [x] **FC6** Chart-Area "Ask AI" — `<AskAiContextMenu>` um Chart-Bereich in `TradingWorkspace`; Kontext: Symbol · Timeframe · OHLCV · Signal · Cross · RVOL
- [ ] **FC7** GeoEvent-Marker "Ask AI" — `<AskAiContextMenu>` auf Marker in `MapCanvas`; Kontext: Event-Titel, Typ, Severity, Assets, Koordinaten
- [ ] **FC8** Order/Position "Ask AI" — `<AskAiContextMenu>` auf Zeile in `OrdersPanel`/`PositionsPanel`; Kontext: Symbol, Side, Entry, Current, PnL%
- [ ] **FC10** News-Artikel "Ask AI" — `<AskAiContextMenu>` auf Headline-Card in `NewsPanel`; Kontext: Titel + Source + Datum
- [ ] **FC11** Alert "Ask AI" — `<AskAiContextMenu>` auf ausgeloesten Alert in `AlertPanel`; Kontext: Alert-Typ, Symbol, Trigger-Wert, Zeitstempel
- [ ] **FC18** Research-Artikel "Ask AI" — `<AskAiContextMenu>` auf Artikel-Card in `ResearchPage`; Kontext: Titel, Source, Summary-Snippet
- [ ] **FC19** Kalender-Event "Ask AI" — `<AskAiContextMenu>` auf Event-Row in `IntelligenceCalendarPage`; Kontext: Name, Datum, Land, Impact, Forecast/Actual/Prior

### D. Inline AI Tooltips (Pattern C — IndicatorAiTooltip + useCompletion)

- [x] **FC9** Trading-Indikatoren — RVOL, CMF, ATR, Rhythm-Score, Composite-Signal in `SignalInsightsBar`; `/api/agent/completion` Go-Gateway-Proxy; HoverCard 600ms delay
- [ ] **FC20** Research-Metriken — Sentiment-Score, Source-Count, Recency-Score (sofern `ResearchPage` solche Badges hat) mit `IndicatorAiTooltip`
- [ ] **FC21** Kalender-Impact-Badge — "High/Medium/Low Impact" Badge auf Kalender-Events mit Erklaerung was der jeweilige Indikator bedeutet (z.B. "Non-Farm Payrolls = Leitindikator fuer US-Arbeitsmarkt")
- [ ] **FC22** GeoMap Source-Health-Badges — `SourceHealthPanel` Confidence/Freshness Badges mit Erklaerung

### E. Context-Injection-Mechanismus

- [x] **FC12** `openChat(ctx?)` + `setChatContext(ctx)` in `GlobalChatContext`
- [x] **FC13** `src/lib/chat-context-builders.ts` — alle builder functions implementiert (18.03.2026):
  - `buildTradingContext()` (Rev. 2), `buildGeoContext()` + `buildResearchContext()` + `buildCalendarContext()` (Rev. 4)
- [x] **FC14** Context-Persistenz — React-State (kein Reload-Persist); `clearChatContext()` vorhanden
- [ ] **FC15** System-Message-Injection — Kontext-String als System-Message-Prefix an Agent weitergereicht (via `useChatSession` oder AI SDK `initialMessages`); benoetigt Backend oder Phase 22d

---

## 3. Replication-Matrix: Was welche Page bekommt

| Page / Feature | Pattern A (Kontext-Injection) | Pattern B (Ask-AI Menu) | Pattern C (Inline Tooltip) | Prioritaet |
|---------------|------------------------------|------------------------|---------------------------|------------|
| `/trading` | ✅ FC2 | ✅ FC6 (Chart) | ✅ FC9 (RVOL/CMF/ATR) | — fertig |
| `/geopolitical-map` | FC3 | FC7 (Marker) | FC22 (Source-Health) | **Hoch** |
| `/research` | FC4 | FC18 (Artikel) | FC20 (Metriken) | **Hoch** |
| `/calendar` | FC5 | FC19 (Event-Row) | FC21 (Impact-Badge) | **Mittel** |
| `/events/[id]` | FC16 | — (ganzer Screen = Kontext) | — | **Mittel** |
| `/control` | FC17 | — | — | **Niedrig** |
| Orders/Positions (Panel) | — | FC8 | — | **Mittel** |
| News (Panel) | — | FC10 | — | **Mittel** |
| Alerts (Panel) | — | FC11 | — | **Mittel** |

---

## 4. Verify-Gates

### Code-Complete (Browser-Test, kein Stack nötig)

- [ ] **FC.V1** Chat von `/trading` oeffnen → Kontext-Chip mit Symbol/TF/Price sichtbar
- [ ] **FC.V2** Chat von `/geopolitical-map` oeffnen → Kontext-Chip "GeoMap · global · N active events" sichtbar
- [ ] **FC.V9** Chat von `/research` oeffnen → Kontext-Chip mit Regime + Confidence sichtbar
- [ ] **FC.V10** Chat von `/calendar` oeffnen → Kontext-Chip mit Event-Anzahl + Impact-Filter sichtbar
- [ ] **FC.V3** Chip dismiss → `chatContext` cleared, Chip verschwindet

### Live-Verify (Stack nötig — Sprint 3)

- [ ] **FC.V4** Kontext-String landet als System-Message-Prefix im Agent-Request (E2E); Anthropic-Antwort referenziert den Kontext
- [ ] **FC.V5** Rechtsklick auf Chart → "Ask AI about this" → Chat oeffnet pre-filled (FC6)
- [ ] **FC.V6** Rechtsklick auf GeoEvent-Marker → Chat oeffnet mit Event-Kontext (FC7)
- [ ] **FC.V7** Hover auf RVOL-Badge → AI-Tooltip erscheint nach 600ms, streamt Erklaerung (FC9)
- [ ] **FC.V8** Hover auf CMF/ATR/Rhythm/Signal → AI-Tooltip analog zu FC.V7

---

## 5. Propagation Targets

- `docs/specs/execution/agent_chat_ui_delta.md` (AC87, AC90, AC94, AC95)
- `docs/specs/execution/command_keyboard_delta.md`
- `docs/specs/execution/agent_memory_context_delta.md` (Backend-Anbindung FC15)
- `src/lib/chat-context-builders.ts` (FC3/FC4/FC5/FC16 builder functions)
