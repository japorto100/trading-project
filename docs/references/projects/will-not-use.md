# Projects We Will Not Use

> **Zweck:** Bewusst ausgeschlossene, unklare oder aktuell architektonisch unpassende
> Kandidaten. Dieses Dokument verhindert, dass tote oder unscharfe Referenzen immer
> wieder in `evaluate.md` zurueckdiffundieren.

---

## Arbeitsregel

- Ein Kandidat gehoert hierhin, wenn mindestens eines davon gilt:
  - kein belastbarer Repo-/Produktanker vorhanden
  - kein klarer Mehrwert gegenueber bestehender Baseline
  - architektonisch schlechter Fit fuer den aktuellen Go-first-/Gateway-first-Stand
- `will-not-use` bedeutet nicht fuer immer ausgeschlossen.
- Re-Open nur mit explizitem Trigger, dokumentiertem Owner und neuem Integrationsgrund.

---

## Aktuell ausgeschlossen

| Referenz | Grund fuer Ausschluss | Re-Open nur wenn |
|----------|-----------------------|------------------|
| `EquiCharts` | Kein klarer Benefit gegenueber `lightweight-charts`; `ChartGPU` ist der spaetere echte Perf-Kandidat | bewusste Abkehr von LWC hin zu eigener TS-Canvas-Engine |
| `Order Vantage` | aktuell nicht belastbar identifizierbar; kein sauberer Repo-/Produktanker | exakter Repo-Link und klarer UI-Mehrwert vorliegen |
| `goexchange` | zu unscharf als Go-Kandidat; loest DEX-/Adapter-Thema nicht belastbar | konkreter Repo-Anker plus klarer Exchange-/DEX-Gap im Gateway besteht |

---

## Querverweise

- `evaluate.md`
- `to-watch.md`
- `../../specs/execution/references_projects_evaluate_delta.md`
