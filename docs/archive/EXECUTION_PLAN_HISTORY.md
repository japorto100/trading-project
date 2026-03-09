# EXECUTION PLAN History Ledger

> **Stand:** 09. März 2026
> **Zweck:** Archivierte Revisions- und Fortschrittshistorie des frueher sehr langen
> `docs/specs/EXECUTION_PLAN.md`. Das aktive Masterdokument enthaelt nur noch
> Roadmap, Status, offene Gates und Dokument-Ownership.

---

## Archivierte Revisionsspur

| Rev. | Datum | Kernaussage |
|:-----|:------|:------------|
| 1 | 20. Feb 2026 | Erstfassung des Masterplans |
| 2 | 22. Feb 2026 | Phasen 10-12 ergaenzt |
| 3 | 22. Feb 2026 | Vollstaendige Neufassung mit 22+1 Phasen, Auth nach vorne gezogen |
| 3.1 | 22. Feb 2026 | Current-Progress-Sektion und fruehe Spec-Erweiterungen |
| 3.2 | 25. Feb 2026 | Phase 7 Indicator Catalog Core code-complete |
| 3.3 | 25. Feb 2026 | Phase 7 Rust-Integration fuer Kernindikatoren |
| 3.4 | 25. Feb 2026 | Phase 8 Pattern Detection Baseline |
| 3.5 | 25. Feb 2026 | Phase 4 formal abgeschlossen, Phase 8 manuell verifiziert |
| 3.6 | 25. Feb 2026 | Phase-1 GCT-Audit/SQLite + Playwright/E2E-Reparaturen |
| 3.7 | 26. Feb 2026 | GeoMap-Closeout und Folge-Gates konsolidiert |
| 3.8 | 26. Feb 2026 | Phase 6 Memory Architecture code-complete |
| 3.9 | 26. Feb 2026 | Cache-Adapter effektiv Go↔Python verdrahtet |
| 3.10 | 26. Feb 2026 | Chart Overlays + Advanced Indicator Slice |
| 3.11 | 26. Feb 2026 | SOTA-Assessment + Chart/GeoMap Bugfixes |
| 3.12 | 27. Feb 2026 | gRPC IPC Go↔Python implementiert |
| 3.13 | 27. Feb 2026 | Macro GeoMap Overlay + Frontend-Routing |
| 3.14 | 27. Feb 2026 | Statusabgleich Plan vs. Code |
| 3.15 | 27. Feb 2026 | UIL Completion Slice |
| 3.16 | 27. Feb 2026 | Phase 9 formal abgeschlossen |
| 3.17 | 28. Feb 2026 | `execution_mini_plan.md` Abarbeitung gestartet |
| 3.18 | 28. Feb 2026 | Agent-Service / Context / WebMCP Baseline |
| 3.19 | 01. Maerz 2026 | Mini-Plan-Abgleich, Phase 14/23/24 nachgezogen |
| 3.20 | 01. Maerz 2026 | Neue Docs Phase-Zuordnung aufgenommen |
| 3.21 | 02. Maerz 2026 | Phase 15d-15h + 16/20 Baseline umgesetzt |
| 3.22 | 02. Maerz 2026 | Phase 18 Baseline umgesetzt |
| 3.23 | 02. Maerz 2026 | Phase 17 Baseline gestartet |
| 3.24 | 03. Maerz 2026 | Verify-Gates + Observability Foundation abgeschlossen |
| 3.25 | 03. Maerz 2026 | Phase 13 Portfolio Advanced + OTel Basis |
| 3.26 | 04. Maerz 2026 | Phase 9 Env-Cutover + NLP Upgrade code-complete |
| 3.27 | 05. Maerz 2026 | Phase 1 Soft-Lock / Idle Security Slice |
| 3.28 | 09. Maerz 2026 | Market Credential Flow Slice Frontend→Next→Go dokumentiert |

---

## Archivierte Fortschrittsnotizen

Diese Punkte wurden aus dem frueheren Masterplan ausgezogen, damit das aktive
Dokument nicht mehr als Changelog, Ledger und Roadmap gleichzeitig dienen muss.

- Auth-Baseline, Passkey-/Session-/Revocation-Slices und GCT-Audit-Hardening
  wurden ueber mehrere Rev-Stufen sukzessive in Phase 1 vorgezogen.
- Go-first / Thin-Proxy / Request-ID / Security-Header / gRPC-IPC / Provider-
  Routing und BaseConnector-Foundation wurden ueber Rev. 3.6 bis 3.24 aufgebaut.
- Memory, UIL, Agent-Service, Capability Registry, Plugin Pilot und Rollout Gates
  wurden bereits code-seitig weit vor den spaeteren Langfrist-Phasen umgesetzt.
- Portfolio Advanced, NLP Upgrade, Game-Theory-Baselines, ML-/Eval-/Options-
  Pfade und der Markt-Credential-Transport wurden in separaten, spaeteren
  Slice-Revs nachgezogen.

---

## Warum dieses Archiv existiert

Das aktive `EXECUTION_PLAN.md` soll nach dem Refresh:

- keine lange Rev-Liste mehr tragen
- keine mehrseitigen historischen Teilfortschrittsbloecke mehr enthalten
- keine gemischte Rolle als Spezifikation, Statusspiegel und Projektjournal mehr
  einnehmen

Historische Details bleiben hier bewusst erhalten, damit fruehere Entscheidungen
und Einfuehrungsslices weiterhin nachvollziehbar bleiben, ohne den aktuellen
Arbeitskontext zu verschmutzen.
