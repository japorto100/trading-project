# Macro and Central Banks Sources

> **Scope:** SDMX, Zentralbanken, globale Macro-Erweiterungen und verwandte
> Zeitreihen-/Statistikquellen.

---

## Hauptgruppen

| Gruppe | Beispiele |
|--------|-----------|
| `G3 SDMX` | IMF IFS/WEO, OECD, ECB, UN, ADB |
| `G4 Zeitreihen / Zentralbanken` | FRED, BCB, Banxico, BoK, BCRA, TCMB, RBI |
| Globale Erweiterung | Tushare, e-Stat, IBGE, INEGI, NBS |

---

## Bereits wichtige Quellen

| Quelle | Rolle |
|--------|-------|
| `IMF IFS` | Globaler Macro-Hebel |
| `World Bank WDI` | Entwicklungs- und Realwirtschaftsdaten |
| `OECD Data Explorer` | Ländervergleich, CLI, standardisierte Indikatoren |
| `BCB`, `Banxico`, `BoK`, `BCRA`, `TCMB`, `RBI` | EM-Zentralbanken |
| `FRED` | US-/globaler Zeitreihen-Anker |

---

## Arbeitsregel

- Die operative Reife einer Quelle lebt in `../status.md`.
- Auth-pflichtige Quellen wie `FRED`, `Banxico` oder `BoK` muessen zusaetzlich in
  `../../specs/execution/source_onboarding_and_keys.md` und den betroffenen
  `*.env`-Vorlagen gepflegt werden.
- Router-, BaseConnector- und Integrationsregeln bleiben in
  `../../go-research-financial-data-aggregation-2025-2026.md`.

---

## Querverweise

- `../status.md`
- `../../specs/execution/source_onboarding_and_keys.md`
- `../../go-research-financial-data-aggregation-2025-2026.md`
- `../../specs/EXECUTION_PLAN.md`
