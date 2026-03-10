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

`G11` aus dem Altbestand war eine Integrations-/Transportklasse (`Python IPC`),
keine eigenstaendige Informationsquellen-Klasse. Sie wird deshalb nicht als
eigene Quellen-Datei gefuehrt.

---

## Intake-Regel

1. Quelle fachlich hier einordnen
2. Status in `../status.md` fuehren
3. Bei Auth-/Key-Bedarf `../../specs/execution/source_onboarding_and_keys.md` pflegen
4. API-/Payload-Contract in den passenden Specs / Owner-Docs dokumentieren
5. Umsetzung im Go-Layer `contract-first`

---

## Querverweise

- `../status.md`
- `../../specs/execution/source_onboarding_and_keys.md`
- `../../specs/EXECUTION_PLAN.md`
- `../../go-research-financial-data-aggregation-2025-2026.md`
- `../../web3/README.md`
