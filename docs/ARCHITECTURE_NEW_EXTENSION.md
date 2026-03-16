# ARCHITECTURE NEW EXTENSION (Bridge/Archiv)

> **Stand:** 16. Maerz 2026  
> **Status:** BRIDGE/ARCHIV — IST-Inhalte wurden in granulare Specs uebernommen.
> Dieses Dokument bleibt als historische Referenz erhalten.

---

## Hinweis

Der gesamte IST-Zustand und die verbindlichen Architekturregeln aus diesem Dokument
wurden in die folgende Spec-Struktur uebergefuehrt:

### Architektur-Owner-Specs (`docs/specs/architecture/`)

- `ARCHITECTURE_BASELINE.md` — IST + verbindliche Zielrichtung (Control Plane, Service-Schnitt)
- `GO_GATEWAY_BOUNDARY.md` — Gateway-Grenzkontrakte, Streaming-Defaults, Agent-Tool-Policy
- `AGENT_RUNTIME_ARCHITECTURE.md` — Agent-Grenzen, Guardrails, Memory-Write-Policy
- `MEMORY_AND_STORAGE_BOUNDARIES.md` — Memory-Schichten, Storage-Ownership, KG-Tech
- `ORCHESTRATION_AND_MESSAGING.md` — Event-Backbone vs. Workflow-Engine

### Data-Specs (`docs/specs/data/`)

- `DATA_ARCHITECTURE.md` — Datenfluss, Zonen, Canonical Model
- `AGGREGATION_IST_AND_GAPS.md` — IST-Stand Aggregation + Gap-Liste

### Umbrella-Docs

- `docs/specs/ARCHITECTURE.md` — Navigationsdokument
- `docs/specs/SYSTEM_STATE.md` — kompakter Runtime-Snapshot

---

## Historischer Kontext

Dieses Dokument war die primaere IST-Zustand-Beschreibung vor der
Spec-Reorganisation vom 16. Maerz 2026. Es diente als Basis fuer die
Erstellung der oben genannten Owner-Specs.

Fuer alle aktuellen Architekturentscheidungen sind die Owner-Specs massgebend.
