# DATA AGGREGATION MASTER (Bridge/Archiv)

> **Stand:** 16. Maerz 2026  
> **Status:** BRIDGE/ARCHIV — IST-Inhalte wurden in granulare Specs uebernommen.
> Dieses Dokument bleibt als historische Referenz und vollstaendiger Code-Analyse-Report erhalten.

---

## Hinweis

Der gesamte IST-Zustand der Datenaggregation aus diesem Dokument wurde in die
folgende Spec-Struktur uebergefuehrt:

### Data-Owner-Specs (`docs/specs/data/`)

- `DATA_ARCHITECTURE.md` — Datenfluss, IST-Topologie, Datenzonen, Canonical Data Model
- `AGGREGATION_IST_AND_GAPS.md` — IST-Stand Aggregation + bekannte Gaps und Prioritaeten
- `STORAGE_AND_PERSISTENCE.md` — Storage-Prinzipien, Persistenzklassen, Cache-Abgrenzung
- `SOURCE_STATUS.md` — Provider-Status-Matrix (implementiert, scaffold, geplant)

### Ergaenzende Specs

- `docs/references/status.md` — vollstaendige Persistenzprofile und Credential-Details pro Provider
- `docs/specs/SYSTEM_STATE.md` — kompakter Runtime-Snapshot inkl. Datenebene
- `docs/specs/data/UNSTRUCTURED_INGESTION_UIL.md` — UIL-Grenzkontrakte

---

## Historischer Kontext

Dieses Dokument war die primaere Code-Analyse und IST-Zustandsbeschreibung der
Datenaggregationsschicht vor der Spec-Reorganisation vom 16. Maerz 2026.

Es diente als Basis fuer die Erstellung der oben genannten Data-Owner-Specs
und bleibt als vollstaendiger Analyse-Report mit Code-Verifikations-Details erhalten.
Fuer alle aktuellen verbindlichen Regeln sind die Owner-Specs massgebend.
