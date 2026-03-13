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
7. [Querverweise](#7-querverweise)

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

## 7. Querverweise

- `specs/FRONTEND_ARCHITECTURE.md`
- `specs/execution/frontend_refinement_perf_delta.md`
- `specs/execution/platform_dx_quality_delta.md`
- `specs/execution/agent_chat_ui_delta.md`
- `AGENT_SECURITY.md`
