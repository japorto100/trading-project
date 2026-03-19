# Command & Keyboard Shortcut Delta

> **Stand:** 14. März 2026 (Rev. 3)
> **Phase:** 22c - Command & Keyboard Surface
> **Zweck:** Execution-Owner für globale Tastaturkürzel, Command Palette und Navigation-Shortcuts im TradeView-Frontend.
> **Aenderungshistorie:**
> - Rev. 1 (14.03.2026): Initialer Slice — IST-Analyse, Fehlerdiagnose, offene Deltas, Verify-Gates
> - Rev. 2 (14.03.2026): Phase-1-Implementierung eingetragen — AC1/AC4/AC5/AC7/AC9/AC10/AC12/AC13 done; `CommandPalette.tsx` komplett überarbeitet
> - Rev. 3 (14.03.2026): Phase-22c abgeschlossen — AC74/AC75/AC76/AC77 done; CommandPalette → `src/components/CommandPalette.tsx` (global); `GlobalKeyboardProvider` + `GlobalChatOverlay` + `GlobalChatContext` in `(shell)/layout.tsx`; AC2 automatisch geschlossen via Context

---

## 0. Execution Contract

### Scope In

- Globale Tastaturkürzel im Trading-Workspace (`/trading`)
- Command Palette (`CommandPalette.tsx`) — Einträge, Shortcuts, Verdrahtung
- Navigation-Shortcuts: Chat öffnen, Map navigieren, Control öffnen
- `onOpenChat` Prop-Lücke schliessen (⌘J/⌘L broken)
- Speech-Shortcut (⌘⇧A) an echten Speech-Button verdrahten
- Neue globale Shortcuts: ⌘⇧M (Map), ⌘⇧C (Control)

### Scope Out

- GeoMap-interne Drawing-Shortcuts (`l`, `m`, `p`, `t`, `c`, `r`, `h`, `s`) — diese bleiben in `geo-keyboard-shortcuts.ts` und funktionieren korrekt
- Backend-Command-Execution (kein Remote-Shell, kein Agent-Tool via Keyboard)
- Mobile / Touch-Gesten

### Mandatory Upstream Sources

- `src/features/trading/CommandPalette.tsx`
- `src/app/trading/page.tsx`
- `src/features/geopolitical/shell/hooks/geo-keyboard-shortcuts.ts`
- `docs/specs/execution/agent_chat_ui_delta.md`
- `docs/specs/execution/control_surface_delta.md`

---

## 1. IST-Zustand (Analyse 14.03.2026)

### 1.1 Globale Shortcuts — Trading Workspace (`/trading`)

| Shortcut | Registriert in | Aktion | Status |
|---|---|---|---|
| `⌘K` / `Ctrl+K` | `CommandPalette.tsx` L39 | Öffnet/schliesst CommandPalette | ✅ Funktioniert |
| `⌘J` / `Ctrl+J` | `CommandPalette.tsx` L43 | Soll Chat öffnen via `onOpenChat?.()` | ❌ BROKEN — prop nicht übergeben |
| `⌘⇧A` / `Ctrl+Shift+A` | `CommandPalette.tsx` L49 | Öffnet CommandPalette (Stub "Voice Command") | ⚠️ Öffnet nur Palette — kein Speech |

**Root Cause `⌘J` broken:**
```tsx
// src/app/trading/page.tsx L327-330 — onOpenChat FEHLT
<CommandPalette
  onSymbolChange={handleSymbolChange}
  onTimeframeChange={setCurrentTimeframe}
  // onOpenChat={...} ← nie übergeben
/>
```

Das Agent-Chat-Panel existiert seit Phase 22a in `src/features/agent-chat/AgentChatPanel.tsx`, ist aber noch nicht im Trading-Workspace eingebunden. Ohne Chat-Panel-Mount gibt es keinen `openChat`-Callback.

### 1.2 CommandPalette Einträge (IST)

| Eintrag | Shortcut angezeigt | Aktion | Status |
|---|---|---|---|
| Geopolitical Map | — | `router.push("/geopolitical-map")` | ✅ |
| Ask AI (Chat) | `⌘J` | `onOpenChat?.()` — no-op | ❌ BROKEN |
| Voice Command | `⌘⇧A` | `void 0` — no-op | ❌ STUB |
| Theme: Light/Dark/Blue/Green | — | `setTheme(...)` | ✅ |
| Symbols (alle FusionSymbols) | — | `onSymbolChange(symbol)` | ✅ |
| Timeframes (1m–1D) | — | `onTimeframeChange(tf)` | ✅ |

### 1.3 GeoMap-Shortcuts (`/geopolitical-map`) — BEREITS KORREKT

Scope: `geo-keyboard-shortcuts.ts` — nur aktiv wenn GeoMap-Shell gemountet.

| Key | Modus | Aktion |
|---|---|---|
| `l` | Drawing | Line-Tool |
| `m` | Drawing | Marker-Tool |
| `p` | Drawing | Polygon-Tool |
| `t` | Drawing | Text-Tool |
| `c` | View | Candidate Queue |
| `r` | View | Region-Filter |
| `h` | View | Heatmap-Toggle |
| `s` | View | Soft Signals |
| `⌘Z` | Edit | Undo |
| `⌘⇧Z` / `⌘Y` | Edit | Redo |
| `Escape` | Mode | Cursor-Mode |
| `Delete` | Edit | Delete selected |

→ Diese bleiben unverändert. Kein Konflikt mit neuen globalen Shortcuts (⌘⇧M, ⌘⇧C verwenden Shift+Meta-Kombinationen die nicht in Drawing-Mode genutzt werden).

### 1.4 Fehlende Navigation-Shortcuts

Kein Shortcut registriert für:
- Direkte Navigation zu `/geopolitical-map` ohne CommandPalette-Umweg
- Navigation zu `/control`
- Speech-Aktivierung ohne Palette

---

## 2. Offene Deltas

### A. Broken Shortcuts reparieren

- [x] **AC1** `⌘J` → `⌘L` umbenennen (Taste `l` statt `j`) — User-Erwartung: `⌘L` = Chat
  - `CommandPalette.tsx`: `e.key === "j"` → `e.key === "l"` ✓
  - `CommandShortcut`-Label: `⌘J` → `⌘L` ✓
- [x] **AC2** `onOpenChat` via `GlobalChatContext` geschlossen — `CommandPalette` nutzt `useGlobalChat().openChat()` intern; kein prop-drilling; `GlobalChatOverlay` in `(shell)/layout.tsx` als `Sheet modal=false`
- [ ] **AC3** `⌘⇧A` an echten Speech-Button verdrahten
  - AgentChatComposer hat Speech-Button-Slot (Phase 22a AC-J-Gruppe)
  - Shortcut soll: Chat öffnen + Speech-Input aktivieren (`onOpenChat()` dann `triggerSpeech()`)
  - Erfordert `onTriggerSpeech`-Callback aus ChatComposer nach oben gereicht

### B. Neue Navigation-Shortcuts

- [x] **AC4** `⌘⇧M` — Navigate to Map (`/geopolitical-map`)
  - `e.key === "M" && e.metaKey && e.shiftKey` → `router.push("/geopolitical-map")` ✓
  - CommandPalette-Eintrag "Geopolitical Map" zeigt `⌘⇧M` ✓
- [x] **AC5** `⌘⇧C` — Navigate to Control (`/control/overview`)
  - `e.key === "C" && e.metaKey && e.shiftKey` → `router.push("/control/overview")` ✓
- [x] **AC6** CommandPalette-Eintrag "Control Surface" mit `SlidersHorizontal`-Icon + `⌘⇧C` ✓

### C. CommandPalette Erweiterungen

- [x] **AC7** Eintrag "Ask AI (Chat)" shortcut label → `⌘L` ✓
- [ ] **AC8** Eintrag "Voice Input" — `onOpenChat?.()` Fallback aktiv; Speech-Wiring ausstehend (AC3 Dep)
- [x] **AC9** Eintrag "Control Surface" mit `SlidersHorizontal`-Icon + `⌘⇧C` ✓
- [x] **AC10** Eintrag "Geopolitical Map" shortcut label `⌘⇧M` ✓
- [ ] **AC11** Toggle-Panel Shortcuts (`[`/`]` oder `⌘\`) — ausstehend/evaluieren; Hinweis: nicht nur Trading-Sidebar sondern auch GeoMap-Panels (DrawMode, Selection, SourceHealth) beruecksichtigen — globale Loesung benoetigt page-agnostisches Panel-Konzept; vorerst zurueckgestellt

### D. Scope-Isolation und Konflikt-Prüfung

- [x] **AC12** Konflikt-Analyse: globale Shortcuts kollidieren nicht mit GeoMap-Drawing-Shortcuts
  - GeoMap-Shortcuts sind lower-case ohne Meta → kein Konflikt ✓
  - Im Drawing-Mode: `e.metaKey`-Check verhindert bereits Konflikte bei ⌘Z/⌘⇧Z ✓
- [x] **AC13** Guard implementiert: Shortcuts feuern nicht wenn `<input>`/`<textarea>` fokussiert (ohne Meta/Ctrl)
  - `if (!e.metaKey && !e.ctrlKey && (target instanceof HTMLInputElement || ...)) return;` ✓
  - Meta/Ctrl-Shortcuts (⌘L, ⌘⇧M, ⌘⇧C) passieren den Guard absichtlich (gewolltes Verhalten)

---

## 3. Shortcut-Matrix (SOLL)

| Shortcut | Scope | Aktion | Priorität |
|---|---|---|---|
| `⌘K` | Global (Trading) | Command Palette öffnen | P0 — IST, bleibt |
| `⌘L` | Global (Trading) | Chat Panel öffnen/fokussieren | P0 — Fix von broken ⌘J |
| `⌘⇧A` | Global (Trading) | Chat öffnen + Speech aktivieren | P1 |
| `⌘⇧M` | Global | Navigate → `/geopolitical-map` | P1 |
| `⌘⇧C` | Global | Navigate → `/control/overview` | P1 |
| `l/m/p/t` | GeoMap only | Drawing tools | P0 — IST, bleibt |
| `⌘Z` / `⌘⇧Z` | GeoMap only | Undo/Redo | P0 — IST, bleibt |

**Bewusst ausgelassen:**
- `⌘C` — Copy (Browser-Standard, nie überschreiben)
- `⌘M` — macOS Minimize (nicht sicher überschreibbar)
- `⌘J` — wird zu `⌘L` migriert (kein zweites Binding behalten)

---

## 4. Implementierungsreihenfolge

```
AC1, AC4, AC5, AC6, AC7, AC9, AC10, AC12, AC13  ← DONE (Rev. 2, 14.03.2026)
AC2, AC74, AC75, AC76, AC77                      ← DONE (Rev. 3, 14.03.2026)

# Noch offen
AC3   ← Speech-Shortcut ⌘⇧A → Chat + Speech aktivieren (nach Phase 22d AI SDK)
AC8   ← Voice Input Aktion verdrahten (nach AC3)

# Optional / nachgelagert
AC11  ← Toggle-Sidebar Shortcuts
```

### App-Struktur-Hinweis (14.03.2026)

Alle Haupt-Routen liegen jetzt in `src/app/(shell)/` Route Group:
- `(shell)/trading/page.tsx`, `(shell)/control/[[...tab]]/page.tsx`, `(shell)/geopolitical-map/page.tsx`, `(shell)/files/[[...tab]]/page.tsx`
- `(shell)/layout.tsx` — Mount-Point fuer `GlobalKeyboardProvider` + `GlobalChatOverlay`
- Auth-Routen bleiben aussen — kein Overlay bei Login/Register. Korrekt.

**CommandPalette** muss von `trading/page.tsx` → `(shell)/layout.tsx` migriert werden (AC74).
Danach sind `⌘K`, `⌘L`, `⌘⇧M`, `⌘⇧C`, `⌘T` auf allen Shell-Seiten aktiv.

---

## 5. Verify-Gates

### Implementierbar ohne Stack (Code done, Live-Verify ausstehend)

- [ ] **AC.V1** `⌘K` öffnet CommandPalette (Regression-Check)
- [ ] **AC.V2** `⌘L` öffnet Chat Panel — **blockiert auf AC2** (onOpenChat-Wiring, Phase 22a Frontend fertig)
- [ ] **AC.V3** `⌘⇧M` navigiert direkt zu `/geopolitical-map` ohne Palette-Umweg
- [ ] **AC.V4** `⌘⇧C` navigiert direkt zu `/control/overview`
- [ ] **AC.V5** CommandPalette zeigt "Ask AI (Chat)" mit Label `⌘L` (nicht mehr `⌘J`)
- [ ] **AC.V6** CommandPalette zeigt "Control Surface" Eintrag mit `⌘⇧C`
- [ ] **AC.V7** CommandPalette "Geopolitical Map" zeigt Shortcut `⌘⇧M`
- [ ] **AC.V8** Kein plain-key Shortcut feuert wenn Cursor in `<input>`/`<textarea>` (Composer-Schutz)
- [ ] **AC.V9** GeoMap Drawing-Shortcuts (`l`, `m`, `p`, `t`) weiterhin funktionsfähig

### Blockiert auf Chat-Panel-Wiring (Phase 22a)

- [ ] **AC.V10** `⌘⇧A` öffnet Chat + aktiviert Speech-Input (AC3 Dep)
- [ ] **AC.V11** Speech-Shortcut feuert `triggerSpeech()` auf Composer — Mic-Aktivierung sichtbar
- [ ] **AC.V12** `⌘L` fokussiert Composer-Input wenn Chat bereits offen

---

## 6. Propagation Targets

- `docs/specs/EXECUTION_PLAN.md` (Phase 22c eintragen)
- `docs/specs/execution/agent_chat_ui_delta.md` (Speech-Shortcut AC-J-Gruppe verlinken)
- `docs/specs/execution/control_surface_delta.md` (⌘⇧C-Shortcut als Entry-Point ergänzen)
