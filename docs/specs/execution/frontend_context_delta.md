# Frontend Context Delta

> **Stand:** 14. Maerz 2026 (Rev. 2)
> **Phase:** 22e — Frontend Context Injection
> **Zweck:** Planung und Evaluation der seitenspezifischen Kontext-Injection in den Agent Chat
> und generell fuer alle Agent-nahen Frontend-Einstiegspunkte.
> **Aenderungshistorie:**
> - Rev. 1 (14.03.2026): Erstanlage — AC94 aus agent_chat_ui_delta.md, Page-Kontext-Evaluation, generelle Agent-Context-Checkboxen

---

## 0. Scope

### Scope In

- Welcher Kontext wird von welcher Seite automatisch in den Chat injiziert (AC87/AC94)
- Context-Chip UI im Chat-Header (AC94)
- "Ask AI about this" Kontextmenue-Einstiegspunkte (AC90) pro Page/Komponente
- Generelle Evaluation: welche Frontend-Kontexte sind fuer Agent-Antworten wertvoll
- Context-Injection-Mechanismus (wie kommt der Kontext in den Chat — `openWithContext()`)

### Scope Out

- Backend Context Assembly / RAG / Retrieval → `agent_memory_context_delta.md`
- Agent Security / Tool-Policy → `agent_security_runtime_delta.md`
- Keyboard-Shortcuts fuer Chat-Oeffnen → `command_keyboard_delta.md`

---

## 1. Offene Deltas

### A. Context-Chip UI (Chat-Header)

- [ ] **FC1** Context-Chip in `AgentChatHeader` — dismissible Badge mit injiziertem Kontext-String;
  zeigt aktiven Kontext wenn `chatContext !== null`; X-Button → `clearChatContext()`
  - Chip-Format: `"{symbol} · {timeframe} · {price}"` oder `"Geo: {eventTitle}"`
  - Chip verschwindet nicht bei Seitennavigation (bleibt bis dismiss oder neuer Kontext)
  - Referenz: AC94 in `agent_chat_ui_delta.md`

### B. Page-spezifische Kontext-Evaluation

Fuer jede Shell-Seite: welcher Kontext soll beim `openWithContext()` injiziert werden.
Noch nicht implementiert — erst evaluieren + entscheiden.

- [ ] **FC2** `/trading` Kontext-Evaluation
  - Kandidaten: `symbol`, `timeframe`, `lastClose`, `changePercent`, `rsi`, `regime`, `streamState`
  - Format-Kandidat: `"Context: {symbol} · {tf} · Close {price} · {pct}% · RSI {rsi}"`
  - Trigger: wenn User `⌘L` oder Bot-Icon klickt — Snapshot aus `useTradingWorkspaceStore` + letztem Candle
  - Frage: RSI berechnen on-the-fly oder aus `signalSnapshot`?

- [ ] **FC3** `/geopolitical-map` Kontext-Evaluation
  - Kandidaten: aktives/selektiertes `GeoEvent` (Titel, Typ, Severity, betroffene Assets)
  - Format-Kandidat: `"Geo Event: {title} · {severity} · Assets: {assets}"`
  - Trigger: selektiertes Event bei Chat-Oeffnen; falls kein Event selektiert → kein Kontext
  - Frage: woher kommt das selektierte Event (GeoMap-State)?

- [ ] **FC4** `/control` Kontext-Evaluation
  - Kandidaten: aktiver Tab (`overview/backtest/paper/live`), aktive Strategie, Paper-Modus-Status
  - Format-Kandidat: `"Control: {tab} · Strategy: {strategy} · Mode: {mode}"`
  - Frage: ob Kontext hier ueberhaupt wertvoll ist (Control ist schon AI-nah)

- [ ] **FC5** `/files` Kontext-Evaluation
  - Kandidaten: aktiver Dateiname, Dateityp, Groesse
  - Format-Kandidat: `"File: {filename} ({type}, {size})"`
  - Frage: ob sinnvoll — Files-AI koennte eigene In-File-Analyse sein

### C. "Ask AI about this" Einstiegspunkte (AC90)

Rechtsklick-Kontextmenue — pro Komponente evaluieren ob sinnvoll.
Noch nicht implementiert — erst Evaluation + Prioritaet festlegen.

- [ ] **FC6** Chart-Candle "Ask AI" — Rechtsklick auf Candle → Kontext: OHLCV + Datum + Indikatoren
- [ ] **FC7** GeoEvent-Marker "Ask AI" — Rechtsklick auf Marker → Kontext: Event-Daten
- [ ] **FC8** Open-Position "Ask AI" — Rechtsklick auf Position in OrderPanel → Kontext: Symbol/Entry/PnL
- [ ] **FC9** Indicator-Annotation "Ask AI" — Hover/Rechtsklick auf RSI/BB-Signal → Kontext: Wert + Signal
- [ ] **FC10** News-Artikel "Ask AI" — Rechtsklick auf Headline → Kontext: Titel + Source
- [ ] **FC11** Alert "Ask AI" — Klick auf ausgeloesten Alert → Kontext: Alert-Typ + Wert

### D. Context-Injection-Mechanismus

- [ ] **FC12** `openWithContext(ctx: string)` aus `GlobalChatContext` als einheitlicher Einstieg
  fuer alle Page-Kontext-Injektionen — bereits implementiert in `GlobalChatContext.tsx`
- [ ] **FC13** Kontext-String-Builder pro Page — pure Hilfsfunktion (kein Hook, kein State),
  nimmt Snapshot-Werte entgegen, gibt formatierten String zurueck
  - `buildTradingContext(symbol, tf, price, pct, rsi?): string`
  - `buildGeoContext(event: GeoEvent): string`
- [ ] **FC14** Context-Persistenz-Scope — Kontext lebt nur fuer diese Chat-Sitzung;
  kein Persistieren ueber Reload; bei `clearChatContext()` entfernt
- [ ] **FC15** System-Message-Injection — Kontext-String wird als System-Message-Prefix
  an den Agent weitergereicht (via `useChatSession` oder AI SDK `initialMessages`);
  User sieht nur den Chip, nicht die rohe System-Message

---

## 2. Verify-Gates

- [ ] **FC.V1** Chat von `/trading` oeffnen → Kontext-Chip erscheint mit korrekten Werten
- [ ] **FC.V2** Chat von `/geopolitical-map` oeffnen (Event selektiert) → Event-Chip erscheint
- [ ] **FC.V3** Chip dismiss → `chatContext` cleared, Chip verschwindet
- [ ] **FC.V4** Kontext-String wird als System-Message an Agent weitergegeben (E2E — Backend noetig)
- [ ] **FC.V5** "Ask AI" Rechtsklick auf Candle → Chat oeffnet sich mit Candle-Kontext pre-filled
- [ ] **FC.V6** "Ask AI" Rechtsklick auf GeoEvent-Marker → Chat oeffnet sich mit Event-Kontext
- [ ] **FC.V7** Kein Kontext-Chip wenn keine Seite Kontext liefert (z.B. direkte ⌘L ohne Seitenkontext)

---

## 3. Propagation Targets

- `docs/specs/execution/agent_chat_ui_delta.md` (AC87, AC90, AC94)
- `docs/specs/execution/command_keyboard_delta.md`
- `docs/specs/execution/agent_memory_context_delta.md` (Backend-Anbindung FC15)
