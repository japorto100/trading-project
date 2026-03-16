# OGI Reference Review

> **Stand:** 16. Maerz 2026  
> **Zweck:** Detailliertes Referenzreview des Open-Source-Projekts `ogi` fuer TradeView-Fusion mit Fokus auf Agent/Runtime/Infra-Muster.  
> **Wichtige Scope-Regel fuer diesen Schritt:** Graph-Themen werden hier bewusst **nicht** weiterverarbeitet.  
> **Quelle (Upstream):** https://github.com/khashashin/ogi  
> **Lokaler Clone:** `D:/tradingview-clones/_tmp_ref_review/geo/ogi`  
> **Extraktion (arbeitsrelevant):** `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/ogi/ogi_mirror`

---

## 1. Warum dieses Dokument existiert

`ogi` ist fuer TradeView Fusion als Referenz wertvoll, weil dort mehrere Runtime-Muster bereits kombiniert sind:

- asynchrone Worker/Queue-Pfade
- Step-basierte Agent-Orchestrierung
- Eventing/Auditierbarkeit
- klare Trennung zwischen API, Store, Engine und Worker

Dieses Dokument ist ein Entscheidungsdokument und kein Porting-Befehl.

Leitregel:

- wir nutzen `ogi` als Blueprint
- wir uebernehmen nur gezielte Muster
- wir halten unsere Architekturgrenzen stabil (`UI -> Next BFF -> Go Gateway -> Downstream`)

---

## 2. Scope fuer diesen Schritt (wichtig)

### 2.1 In Scope

- Agent-Runtime-Muster
- Backend-Execution- und Worker-Muster
- API/Store/Engine-Splitting
- Test-/Infra-/CI-Referenzen

### 2.2 Out of Scope in diesem Schritt

- Graph UI
- Graph Backend
- eigene Graph-Slices aus OGI

Hinweis: Graph-bezogene Extraktionen bestehen weiterhin im Referenzbereich, sind aber fuer diesen Schritt explizit geparkt.

---

## 3. Clone vs. Extraction (klarer Pfadbezug)

### 3.1 Clone (voller Upstream-Kontext)

- `D:/tradingview-clones/_tmp_ref_review/geo/ogi`
- dient als Rohquelle fuer technische Nachverfolgung

### 3.2 Extraction (arbeitsfaehige Teilmenge)

- `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/ogi/ogi_mirror`
- Manifest:
  - `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/ogi/extraction_manifest.txt`
- Empfehlungsmatrix:
  - `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/ogi/OGI_EXTRACTION_RECOMMENDATIONS.md`

Einordnung:

- `ogi_mirror` ist eine gefilterte Auswahl, kein kompletter Repo-Mirror.
- Die Auswahl ist breit und muss weiterhin slice-basiert genutzt werden.

---

## 4. Technische Gesamtbewertung (ohne Graph-Fokus)

## 4.1 Staerken

- **Agent-Orchestrierung mit klaren Zustandsmodellen**:
  - Steps, Budgets, Approval-States, Loop-Schutz
- **Execution-Pfade sind nachvollziehbar**:
  - API -> Service/Engine -> Worker/Queue
- **Operationalisierbarkeit ist mitgedacht**:
  - Events, Audit, Fehlerpfade, Retry-/Recovery-Muster
- **Testbares Design**:
  - mehrere Backend-Tests als Transfervorlage nutzbar

## 4.2 Risiken

- hohe interne Kopplung in Teilen
- projektspezifische Annahmen bei Contracts und Policy-Defaults
- direkte Uebernahme ohne Adapter fuehrt schnell zu Drift

---

## 5. Konkrete OGI-Bloecke fuer diesen Schritt

## 5.1 Agent Runtime (primaer)

Relevante Bereiche:

- `backend/ogi/agent/*`
- `backend/ogi/api/agent.py`
- `backend/ogi/worker/*`
- `backend/ogi/engine/transform_execution_service.py`

Warum relevant:

- diese Pfade liefern robuste Muster fuer orchestrierte Agent-Laufzeiten inklusive Approval/Audit/Budget

## 5.2 Backend-Strukturmuster (primaer)

Relevante Bereiche:

- `backend/ogi/api/*`
- `backend/ogi/store/*`
- `backend/ogi/engine/*`
- `backend/ogi/models/*`
- `backend/ogi/db/*`

Warum relevant:

- saubere Schichtentrennung als Vorlage fuer weitere Runtime-Hardening-Slices

## 5.3 Tests und Delivery-Muster (sekundaer)

Relevante Bereiche:

- `backend/tests/*`
- `.github/workflows/*`
- `backend/entrypoint.sh`
- `.env.example`

Warum relevant:

- beschleunigt Verify-Gates, CI-Disziplin und reproduzierbare Runtime-Pfade

---

## 6. Mapping auf eure aktiven Execution-Dokumente

## 6.1 `docs/specs/execution/control_surface_delta.md`

Nutzbar fuer:

- Step-Transparenz und Approval-Flow-Muster
- auditierbare mutierende Aktionen
- runtime-nahe Fehler-/Degradation-Signale

## 6.2 `docs/specs/execution/agent_harness_runtime_delta.md`

Nutzbar fuer:

- Guardrail-/Execution-Boundary-Muster
- Worker-/Claim-/Recovery-Pfade
- klare Trennung zwischen Plan/Tool/Result in Laufzeitablaeufen

## 6.3 `docs/specs/execution/agent_memory_context_delta.md`

Nutzbar fuer:

- Context-Building-Ansatz
- token-/budget-bezogene Runtime-Grenzen
- nachvollziehbare Schrittprotokollierung

## 6.4 GeoMap-Slice

- `geomap_closeout.md` bleibt unberuehrt im Graph-spezifischen Teil fuer diesen Schritt.
- Graph-Folgearbeit wird separat im dafuer vorgesehenen Projektkontext behandelt.

---

## 7. Adopt-Strategie fuer diesen Schritt

## 7.1 `adopt-as-is`

- Testmuster
- bestimmte CI-/Doku-/Entry-Point-Patterns
- einfache Utility-/Contract-Teile mit niedriger Kopplung

## 7.2 `adapt-mit-wrapper` (Default)

- Agent-Orchestrierung
- API/Store/Engine-Laufzeitbausteine
- Queue-/Worker-Integration

Regel:

- keine direkte harte Kopplung
- Integration ueber klare Adapter und interne Contracts

## 7.3 `reference-only`

- stark projektspezifische Plugin-/Registry-/Sandbox-Pfade
- Teile mit hoher infra-/policy-spezifischer Bindung

---

## 8. Integrationsreihenfolge (ohne Graph)

1. Agent-Runtime-Zustandsmodell analysieren und auf eigene Contracts abbilden
2. Worker-/Queue-/Eventing-Pfade gegen eigene Runtime-Grenzen mappen
3. Store-/Engine-Splitting als Strukturmuster uebernehmen
4. relevante Tests zuerst portieren, dann Implementierung angleichen
5. CI-/Entrypoint-Muster nur nach Security-/Policy-Check adaptieren

---

## 9. Anti-Patterns

- 1:1 Copy ganzer OGI-Ordner in produktive Runtime
- Uebernahme ohne Ownership im passenden Execution-Slice
- Vermischung von Agent-Hardening mit geparkten Graph-Themen im selben Arbeitsschritt

---

## 10. Verbindliche Referenzartefakte fuer diesen Schritt

- `D:/tradingview-clones/_tmp_ref_review/geo/ogi`
- `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/ogi/ogi_mirror`
- `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/ogi/extraction_manifest.txt`
- `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/ogi/OGI_EXTRACTION_RECOMMENDATIONS.md`

---

## 11. Schlussfazit

Fuer diesen Schritt liefert `ogi` vor allem Wert als **Agent-/Runtime-/Infra-Referenz**.  
Graph-bezogene Uebernahmen werden bewusst geparkt und in den dafuer vorgesehenen separaten Projektpfad verschoben.

Damit bleibt die Umsetzung sauber:

- runtime-first in den relevanten Agent-/Control-Slices
- kein Scope-Drift in Graph-Themen
- klare Clone-/Extraction-Nachvollziehbarkeit

