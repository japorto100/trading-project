# Sources Index

> **Zweck:** Externe Datenquellen nach Integrationsklasse gruppieren. Diese
> Dateien beschreiben **mögliche** oder bereits evaluierte Quellen. Der aktive
> Ausbaugrad lebt in `../status.md`.

---

## G-Gruppen

| Gruppe | Klasse | Hauptdatei |
|--------|--------|------------|
| `G1-G2` | REST / WebSocket Market Data | `market-data.md` |
| `G3-G4` | SDMX / Zentralbanken / Macro | `macro-and-central-banks.md` |
| `G5-G7` | Bulk / Diff / Regulatory / Batch | `legal-and-regulatory.md`, `financial-stability-and-nbfi.md` |
| Geo / OSINT | Konflikt-, Event-, Dossier- und Feed-Quellen | `geopolitical-and-osint.md` |
| `G8-G9` | Non-English / inoffiziell / Translation | `unconventional-and-translation.md` |
| `G10` | Oracle / Verifikations-Layer, DeFi, On-Chain | `web3-and-oracles.md` |
| Querschnitt | Sovereign / Corridors / CBDC | `sovereign-and-corridors.md` |
| Intake Overlay | Zusatzbewertung neuer Kandidaten | `additional-intake-2026-03.md` |

`G11` aus dem Altbestand war eine Integrations-/Transportklasse (`Python IPC`),
keine eigenstaendige Informationsquellen-Klasse. Sie wird deshalb nicht als
eigene Quellen-Datei gefuehrt.

---

## Intake-Regel

1. Quelle fachlich hier einordnen
2. Tiering in `../../specs/execution/source_selection_delta.md` pruefen (`global baseline`, `tier-1 official`, `long-tail deferred`)
3. Status in `../status.md` fuehren
4. Bei Auth-/Key-Bedarf `../../specs/execution/source_onboarding_and_keys.md` pflegen
5. Persistenzklasse in `../../specs/execution/source_persistence_snapshot_delta.md` pruefen (`api-hot`, `api-snapshot`, `file-snapshot`, `stream-only`)
6. API-/Payload-Contract in den passenden Specs / Owner-Docs dokumentieren
7. Retrieval-/Vector-Folgeschritt nur ueber `../../specs/execution/vector_ingestion_delta.md`
8. Umsetzung im Go-Layer `contract-first`

### Mittelfristige Ownership-Regel

- Solange lokal/dev mehrere SQLite-Pfade pragmatisch existieren, ist das
  akzeptabel.
- Sobald eine Quelle Go-owned Snapshot-, Provider-, Workflow- oder
  Metadata-Zustand erzeugt, ist der Zielpfad **nicht** dauerhaft der
  frontend-/Prisma-nahe DB-Pfad.
- Fuer staging/prod wird dafuer ein backend-owned relational metadata/index
  layer eingeplant und spaeter gehoben.

---

## Querverweise

- `../status.md`
- `../../specs/execution/source_selection_delta.md`
- `../../specs/execution/source_onboarding_and_keys.md`
- `../../specs/execution/source_persistence_snapshot_delta.md`
- `../../specs/execution/vector_ingestion_delta.md`
- `../../specs/EXECUTION_PLAN.md`
- `../../go-research-financial-data-aggregation-2025-2026.md`
- `../../web3/README.md`
