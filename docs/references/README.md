# References Index

> **Stand:** 09. Maerz 2026  
> **Zweck:** Kanonischer Einstieg fuer externe Projekte, Libraries, Datenquellen
> und Provider-Status. Dieses Verzeichnis entkoppelt externe Referenzkataloge von
> Root-Masterdokumenten und Specs.

---

## 1. Was liegt wo?

| Bereich | Datei | Rolle |
|---------|------|-------|
| Projekte / Libraries | `projects/README.md` | Typ-Legende und Einstieg |
| Frontend / UI | `projects/frontend-ui.md` | UI- und Chart-nahe OSS-Referenzen |
| Go / Adapter | `projects/go-clients-and-adapters.md` | Go-Repos und Adapter-Referenzen |
| Python / Rust | `projects/python-and-rust.md` | Compute-, Indicator- und Acceleration-Referenzen |
| Knowledge / ML | `projects/knowledge-and-ml.md` | KG-, ML- und Research-Projekte |
| Evaluate | `projects/evaluate.md` | aktive Evaluationskandidaten mit klaren Gates |
| To Watch | `projects/to-watch.md` | Beobachten, pruefen, nicht committen |
| Will Not Use | `projects/will-not-use.md` | bewusst ausgeschlossene oder unscharfe Kandidaten |
| Quellen-Gruppen | `sources/README.md` | G1-G10-Legende und Mapping |
| Market Data | `sources/market-data.md` | Commodities, Forex, Equities, Futures, Symbol-Universum |
| Macro / Zentralbanken | `sources/macro-and-central-banks.md` | SDMX, Zentralbanken, globale Macro-Erweiterung |
| Legal / Regulatory | `sources/legal-and-regulatory.md` | Legal- und Regulierungsquellen |
| Financial Stability | `sources/financial-stability-and-nbfi.md` | BIS, FSB, OFR, Shadow Banking, Stress-Layer |
| Unkonventionell | `sources/unconventional-and-translation.md` | Non-English, Translation, YouTube, Reddit, inoffizielle Quellen |
| Sovereign / Corridors | `sources/sovereign-and-corridors.md` | CBDC, De-Dollarization, Trade Corridors, Attractiveness |
| Quellen-Intake Overlay | `sources/additional-intake-2026-03.md` | Zusatzbewertung neuer Kandidaten inkl. API-/Kosten-Kontext |
| Monitoring | `monitor.md` | Beobachtungsliste fuer offene API-/Pricing-/Compliance-Faelle |
| Aktiver Status | `status.md` | Implementiert, Scaffold, geplant |

---

## 2. Arbeitsregel

- Root-Dateien wie `REFERENCE_PROJECTS.md` und `REFERENCE_SOURCE_STATUS.md`
  bleiben als **Bridge-/Index-Pfade** erhalten.
- Detailkataloge leben hier unter `docs/references/`.
- Auth-/Token-pflichtige Quellen brauchen zusaetzlich den operativen Pfad ueber
  `../specs/execution/source_onboarding_and_keys.md`.
- Owner-Dokumente bleiben Owner:
  - Sentiment / FinBERT / FinGPT: `../specs/geo/GEOMAP_DATA_CONTRACTS_AND_FEEDBACK.md`
  - Indikator-Buecher und Quant-Referenzen: `../INDICATOR_ARCHITECTURE.md`
  - Rust-Bewertungen: `../RUST_LANGUAGE_IMPLEMENTATION.md`
  - Frontend-LWC-Patterns: `../FRONTEND_COMPONENTS.md`
  - Web3-Deep-Dives: `../web3/`

---

## 3. Typ-Legende

| Typ | Bedeutung |
|-----|-----------|
| **Projekt** | Eigenstaendiges Repo / OSS-Projekt mit Architektur- oder Code-Relevanz |
| **Library** | Paket / Toolkit / Runtime-Baustein |
| **Dokumentation** | Offizielle Doku, Plugin-Beispiele, Specs, API-Handbuecher |
| **Quelle** | Datenquelle / Feed / API / regulatorische Datenbasis |
| **To Watch** | Noch nicht nehmen; nur beobachten, pruefen oder spaeter evaluieren |

---

## 4. Verwandte Root-Pfade

| Pfad | Rolle |
|------|-------|
| `../REFERENCE_PROJECTS.md` | Schlanker Root-Index fuer externe Referenzen |
| `../REFERENCE_SOURCE_STATUS.md` | Schlanker Root-Einstieg fuer Quellen-/Provider-Status |
| `../archive/REFERENCE_PROJECTS_full.md` | Historische Vollfassung des alten Katalogs |
