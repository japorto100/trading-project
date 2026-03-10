# Frontend Refinement & Performance Delta

> **Stand:** 09. Maerz 2026  
> **Zweck:** Aktiver Delta-Plan fuer Phase 21/22: Frontend-Refinement,
> Surface-Konsistenz, Query-/State-Haertung und Performance-Gates.

---

## 0. Execution Contract

### Scope In

- Frontend-Strukturverbesserungen (Routing, Contracts, Surface-Klarheit)
- UI-/Component-Schnitt aus `FRONTEND_COMPONENTS.md`
- Performance-/A11y-/Browser-Gates fuer produktnahe Surfaces

### Scope Out

- Backend-/Provider-Rollout-Details ohne Frontend-Auswirkung
- GeoMap-Engine-Details ausserhalb der Frontend-Surfaces

### Mandatory Upstream Sources

- `docs/specs/FRONTEND_ARCHITECTURE.md`
- `docs/FRONTEND_COMPONENTS.md`
- `docs/specs/ERRORS.md`
- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/execution/cross_cutting_verify.md`
- `docs/geo/GEOMAP_VERIFY_GATES.md`

---

## 1. Offene Deltas

- [ ] **FE1** Frontend-Surface-Matrix gegen aktuelle Routen/Panel-Flows synchronisieren
- [ ] **FE2** Contract-Hardening (z. B. Zod/Schemas) fuer kritische UI-Inputs/Outputs
- [ ] **FE3** Query-/Polling-/Cache-Fehlerpfade fuer zentrale Panels robust verifizieren
- [ ] **FE4** a11y Baseline fuer priorisierte Surfaces (Labels, Keyboard, Fokuspfade)
- [ ] **FE5** Performance-Baseline fuer UI-kritische Screens dokumentieren
- [ ] **FE6** Chart-/Viz-Performance-Evaluationspfad (inkl. ChartGPU-Entscheid) sauber protokollieren
- [ ] **FE7** TanStack Query Defaults pro Surface verifizieren (`staleTime`, `gcTime`, retry, refetch-Regeln)
- [ ] **FE8** Mutation-Error-Paths (optimistic rollback, form/action errors) fuer Kernflows explizit testen
- [ ] **FE9** Query-Key- und Invalidation-Konzept fuer Portfolio/Market/Memory-Surfaces vereinheitlichen

---

## 2. Verify-Gates

- [ ] **FE.V1** Frontend-Refinement-Checklist fuer Phase 21 abgeschlossen
- [ ] **FE.V2** Performance-Gates fuer Phase 22 mit Messprotokoll abgeschlossen
- [ ] **FE.V3** kritische Browser-Flows ohne Query-/Hydration-/State-Fehler
- [ ] **FE.V4** A11y-Quick-Acceptance auf priorisierten Screens dokumentiert
- [ ] **FE.V5** TanStack-Query-Fehler- und Retry-Verhalten ist fuer Kernsurfaces reproduzierbar nachgewiesen

---

## 3. Evidence Requirements

- FE-ID + betroffener Surface/Screen
- reproduzierbare Browser-Schritte und beobachtetes Ergebnis
- Messwerte bei Performance-Themen (mind. Baseline + Vergleich)
- Verweis auf aktualisierte Owner-Dokumente

---

## 4. Propagation Targets

- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/SYSTEM_STATE.md` (falls Runtime/State-Grenzen betroffen)
- `docs/specs/FRONTEND_ARCHITECTURE.md`
- `docs/FRONTEND_COMPONENTS.md`
- `docs/specs/execution/cross_cutting_verify.md`

---

## 5. Exit Criteria

- `FE1-FE6` entschieden (geschlossen oder deferred mit Owner/Datum)
- Phase 21/22 sind nicht nur geplant, sondern mit konkreten Verify-Gates unterlegt
- keine offene Divergenz zwischen Frontend-Owner-Docs und Execution-Realitaet
