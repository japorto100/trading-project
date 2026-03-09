# Claim Verification Delta

> **Stand:** 09. Maerz 2026  
> **Zweck:** Operativer Delta-Plan fuer Claim/Evidence/Belief-Verification,
> inkl. Widerspruchspfad und Nachvollziehbarkeit.

---

## 0. Execution Contract

### Scope In

- Claim->Evidence->Decision Pipeline
- Contradiction/Disagreement Handling
- Explainability und Auditierbarkeit von Verifikationsentscheidungen

### Scope Out

- allgemeine GeoMap-UI-Features ohne Claim/Evidence-Bezug
- rein akademische Evidenzmodelle ohne Test-/Runtime-Anschluss

### Mandatory Upstream Sources

- `docs/CLAIM_VERIFICATION_ARCHITECTURE.md`
- `docs/geo/GEOMAP_DATA_CONTRACTS_AND_FEEDBACK.md`
- `docs/geo/GEOMAP_PRODUCT_AND_POLICY.md`
- `docs/specs/API_CONTRACTS.md`
- `docs/specs/EXECUTION_PLAN.md`

---

## 1. Offene Deltas

- [ ] **CV1** canonical claim/evidence schema in produktiven Flows abgesichert
- [ ] **CV2** contradiction-tracking explizit in API- und Statuspfad gespiegelt
- [ ] **CV3** analyst-feedback-loop (review/disagreement/override) reproduzierbar
- [ ] **CV4** explain-why payload fuer repraesentative claim-entscheidungen
- [ ] **CV5** confidence-decay / status-transition Regeln verifiziert

---

## 2. Verify-Gates

- [ ] **CV.V1** Happy Path: claim mit belastbarer evidence wird korrekt bewertet
- [ ] **CV.V2** Contradiction Path: widerspruechliche Quellen fuehren zu sauberem Status
- [ ] **CV.V3** Override Path: Analystenentscheidung bleibt auditierbar
- [ ] **CV.V4** Export/Trace Path: Verifikationsgrundlage ist nachvollziehbar

---

## 3. Evidence Requirements

- CV-ID + Test-/Ablaufnachweis
- Request/Response-Nachweis fuer mindestens einen API-Pfad
- dokumentierte Contradiction-Entscheidung
- Referenz auf betroffene Contract-Sektion

---

## 4. Propagation Targets

- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/API_CONTRACTS.md`
- `docs/CLAIM_VERIFICATION_ARCHITECTURE.md`
- `docs/geo/GEOMAP_DATA_CONTRACTS_AND_FEEDBACK.md`

---

## 5. Exit Criteria

- `CV1-CV5` entschieden
- mind. ein verifizierter Contradiction- und Override-Pfad vorhanden
- Claim-/Evidence-Contracts und Laufzeitverhalten sind konsistent
