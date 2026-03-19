# Frontend Enhancement -- TS Contracts, Runtime Quality, UX Policies

> **Stand:** 13. Maerz 2026
> **Zweck:** Arbeitsdokument fuer gezielte Frontend-Verbesserungen mit Fokus auf
> TypeScript-Vertragsklarheit, robustes Error-Handling, Execution-Policies im UI
> und sichere Agent-UI-Integrationen.
> **Abgrenzung:** `specs/FRONTEND_ARCHITECTURE.md` bleibt die autoritative
> Spezifikation. Dieses Dokument sammelt arbeitsnahe Enhancement-Pfade, die in
> Execution-Slices und danach in Specs gehoben werden.

---

## Inhaltsverzeichnis

1. [Leitbild](#1-leitbild)
2. [TS-Vertragsgrenzen](#2-ts-vertragsgrenzen)
3. [Fehlermodell und Adapter-Trennung](#3-fehlermodell-und-adapter-trennung)
4. [Execution-Policies im Frontend](#4-execution-policies-im-frontend)
5. [Agent-UI Sicherheitsgrenzen](#5-agent-ui-sicherheitsgrenzen)
6. [Priorisierte Einfuehrungsreihenfolge](#6-priorisierte-einfuehrungsreihenfolge)
7. [Sofort-Handlungsfelder aus Frontend Analysis](#7-sofort-handlungsfelder-aus-frontend-analysis)
8. [Execution-Slice Synchronisierung](#8-execution-slice-synchronisierung)
9. [Querverweise](#9-querverweise)

---

## 1. Leitbild

Frontend-Code soll nicht nur "funktionieren", sondern bei laufenden Aenderungen
vertraglich stabil, testbar und sicher bleiben.

Kernziele:

- klare TS-Vertraege an echten API-/Service-Grenzen
- reproduzierbares Error-Handling statt lokaler Sonderpfade
- explizite Execution-Policies fuer eventreiche UI-Pfade
- sichere Agent-UI-Integration ohne implizite Write-Macht

---

## 2. TS-Vertragsgrenzen

### 2.1 Wann explizite Return Types

Explizite Return Types sind Pflicht fuer:

- exportierte Service-/Adapterfunktionen
- Funktionen mit vielen Call-Sites
- diskriminierte Unions als Rueckgabe
- Stellen mit bekannter Inferenz-Aufweitung

Inference bleibt Default fuer kleine lokale Helper ohne API-Charakter.

### 2.2 Fehler als geschlossene Menge

Erwartbare Fehler sollen als endliche, typisierte Menge modelliert werden
(`reason` als Union statt freier String), damit exhaustive Handling moeglich ist.

---

## 3. Fehlermodell und Adapter-Trennung

### 3.1 Schichtregel

- Service-/Domain-Layer liefert Fehlerbedeutung.
- Adapter/UI entscheidet Darstellung (Toast, Redirect, HTTP mapping, etc.).

### 3.2 Zielbild

- keine vermischten Redirect-/Transportentscheidungen in Servicefunktionen
- kein stilles Error-Driften zwischen API- und Action-Pfaden
- strukturierte Fehlerdetails statt reinem Message-String

---

## 4. Execution-Policies im Frontend

Event-starke Flows bekommen explizite Laufzeitpolitik:

- Debounce fuer Intent-stabile Inputs (Search, Filter)
- Throttle fuer kontinuierliche Streams (Resize/Scroll/Drag)
- Batch/Queue fuer chattige Mutation-Pfade
- klare Unmount-/Flush- und Retry/Abort-Regeln

`TanStack Pacer` bleibt hier ein Werkzeug, nicht Architektur-Ersatz.

---

## 5. Agent-UI Sicherheitsgrenzen

Agentische UI-Komponenten bleiben strikt bounded:

- read/write scopes sichtbar und kontrolliert
- keine stillen High-risk Tool-Calls aus UI-Events
- Tool- und Storage-Schreibpfade nur ueber backendseitige Policy-Boundaries
- auditierbare user intent -> action Kette

---

## 6. Priorisierte Einfuehrungsreihenfolge

1. TS-Vertragsgrenzen fuer Frontend-Servicefunktionen
2. vereinheitlichtes Fehlermodell fuer API/Action-Adapter
3. Execution-Policy-Hygiene fuer Search/Streaming/Autosave
4. Agent-UI Boundary-Gates fuer riskante Write-Pfade

---

## 7. Sofort-Handlungsfelder aus Frontend Analysis

> Quelle: `docs/FRONTEND_ANALYSIS.md`
>
> Wichtige Regel fuer dieses Root-Dokument: **Hier keine Checkboxen pflegen.**
> Checkbox-Tracking in diesem Dokument macht keinen Sinn, weil der Ausfuehrungsstatus
> sonst parallel in mehreren Dokumenten driftet.
> Dieses Dokument beschreibt Richtung und Prioritaeten; Verifikation/Status liegt in den
> Execution-Slices.

### 7.1 A11y + Kontrast zuerst

Aus dem Analysis-Audit ist die groesste kurzfristige Reife-Luecke die fehlende
systematische A11y-/Kontrast-Haertung.

Sofortfokus:

- A11y-Baseline-Regeln aktivieren und verbindlich in CI verankern
- Kontrast-Hotspots auf priorisierten Surfaces pruefen (TopBar, StatusBar, TradingHeader, MapHeader)
- kritische Kleinsttypografie und stark gedimmte Texte harmonisieren
- Keyboard-/Fokuspfade fuer Kernrouten als Standard-Gate behandeln

### 7.2 Design-Token-Konsistenz

Der Audit zeigt ein starkes Token-Fundament, aber auch Hardcoded-Farbdrift in
Feature-Komponenten. Deshalb gilt:

- neue Aenderungen token-first statt direkter Tailwind-Farbwerte
- semantische Statusfarben zentralisieren (live/degraded/warn/error)
- Fallback-/Skeleton-States auf Theme-Tokens konsolidieren

### 7.3 Runtime-/Query-/Error-Pfade

Neben visueller Qualitaet sollen Laufzeitpfade abgesichert werden:

- kritische Query-/Polling-/Retry-Fehlerpfade reproduzierbar machen
- Mutation-Error-Handling inkl. optimistic rollback explizit testen
- Execution-Policies (debounce/throttle/batch/queue) als feste Konvention kennzeichnen
- Konfigurationskonsistenz (`next.config.ts` vs reale deps) regelmaessig gegenpruefen

### 7.4 Test-/Gate-Hygiene

Damit die Refinements nicht regressieren:

- klare Test-Entry-Points pro Ebene (unit/integration/e2e)
- verbindliche Verify-Nachweise fuer abgeschlossene Punkte
- "Done" nur mit belegtem Gate-Evidence im zugehoerigen Execution-Slice

---

## 8. Execution-Slice Synchronisierung

Ja, es gibt passende Execution-Slices und diese Datei soll darauf zeigen:

- `docs/specs/execution/frontend_refinement_perf_delta.md`
- `docs/specs/execution/frontend_enhancement_delta.md`

Synchronisationsregel:

- Wenn ein Punkt aus Abschnitt 7 gestartet wird, wird der korrespondierende FE-/FEN-Status
  im jeweiligen Execution-Slice aktualisiert.
- Dieses Root-Dokument bleibt absichtlich checkbox-frei; FE-/FEN-IDs und Verify-Gates
  werden nur in den Slices gepflegt.
- Kein "done" ohne Verify-Hinweis im passenden Execution-Slice.

---

## 9. Querverweise

- `specs/FRONTEND_ARCHITECTURE.md`
- `specs/execution/frontend_refinement_perf_delta.md`
- `specs/execution/platform_dx_quality_delta.md`
- `specs/execution/agent_chat_ui_delta.md`
- `AGENT_SECURITY.md`


