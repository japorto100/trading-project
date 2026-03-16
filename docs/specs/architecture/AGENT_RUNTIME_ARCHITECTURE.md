# AGENT RUNTIME ARCHITECTURE

> **Stand:** 16. Maerz 2026  
> **Zweck:** Owner-Spec fuer Agent-Architektur-Grenzen, Orchestrationsprinzipien,
> Policy-Regeln und Memory-Write-Policy.
> **Source-of-Truth-Rolle:** Autoritativ fuer agentenspezifische Grenzen und
> Guardrails; vollstaendige Pipeline-Architektur (BTE, Speech, Multimodal, Roles)
> in `docs/AGENT_ARCHITECTURE.md`.

---

## 1. Grundprinzip

- Agenten sind **untrusted orchestrators**, keine impliziten DB/Admin-Clients.
- Tool Calls laufen nur ueber policy-gepruefte Go-Endpunkte.
- Mutationen brauchen: Scope-Pruefung, Idempotency Key, ggf. Approval-Gate.
- Prompt-Injection-resistente Tool-Policy: least privilege, deny-by-default, explicit allowlists.

---

## 2. Die vier Pipeline-Rollen (verbindlich)

| Rolle | Technologie | Darf LLM? | Darf Scores veraendern? |
|:------|:------------|:----------|:------------------------|
| **Extractor** | LLM | Ja | Nein (nur extrahieren) |
| **Verifier** | LLM + Regeln | Ja | Nein (nur accept/reject) |
| **Deterministic Guard** | Code-only | **Nein** | **Ja** (einzige Instanz) |
| **Synthesizer** | LLM | Ja | Nein (nur uebersetzen) |

Der Deterministic Guard ist der Kern: unit-testbar, auditierbar, nicht prompt-injectable, deterministisch.

---

## 3. Orchestration Defaults

### 3.1 Runtime-Entscheidung (verbindlich)

| Ebene | Default | Wann einsetzen |
|:------|:--------|:--------------|
| Agent-/Reasoning-Workflows | **LangGraph** | mehrstufige Agent-Laeufe, HITL, Resume, Checkpoints |
| Produkt-/Business-Workflows | **Temporal** (spaeter, gezielt) | langlebige produktkritische Ablaeufe |

- **LangGraph zuerst** im Python-Agent-/LLM-Layer.
- **Temporal** erst bei belegter Durability-Notwendigkeit.
- Kein gleichzeitiger Frueheinstieg in beide Frameworks ohne klare Trennung.

### 3.2 Plan-Execute-Replan (verbindlich)

1. **Planner** erzeugt oder aktualisiert den Plan (DAG + Policies).
2. **Executor/Orchestrator** arbeitet den naechsten Schritt ab (deterministisch).
3. **Replanner** prueft nach Resultaten/Fehlern ob der Plan angepasst werden muss.

Der Executor arbeitet immer gegen einen expliziten aktuellen Planstand.

---

## 4. Memory-Write-Policy (verbindlich)

| Schicht | Default | Erlaubte Agent-Schreibpfade |
|:--------|:--------|:---------------------------|
| Global Canonical Graph | read-only | keine direkten Agent-Writes |
| Fast Event Layer | read-mostly | nur kontrollierte ingest/derive-Pfade |
| User Overlay Graph | read-only bis freigegeben | bounded writes fuer user-owned Objekte |
| Claim/Evidence/Stance | bounded-write | claims/evidence/stance anlegen und verknuepfen |
| Simulation Branch Layer | bounded-write | branch creation/run/extract-claims |

### Claim vs. Fact-Mutation

- Agenten duerfen Claims vorschlagen und Evidence verknuepfen.
- Agenten duerfen **keine** canonical facts direkt mutieren.
- Promotion Richtung canonical truth erfolgt nur via Policy-/Review-Gates.

### Simulation-Branch-Handling

- Simulation erzeugt `s:branch:*`-Artefakte.
- Branch-Outputs bleiben hypothetisch.
- Nur explizit extrahierte Claims/Evidence duerfen in den Claim-Layer uebergehen.

### Provenance und Idempotency

Alle agentischen Writes muessen tragen:
- `provenance` (wer/woher/wann)
- `idempotency_key`
- `reversible` bzw. nachvollziehbarer Rollback-Pfad
- `audit_event_id`

---

## 5. Agent Policy Tiers

| Tier | Beschreibung |
|:-----|:-------------|
| `read-only` | keine Mutation, kein Approval, keine Idempotency-Pflicht |
| `bounded-write` | mutierend, stark begrenzt; Idempotency-/Policy-Gates empfohlen |
| `approval-write` | explizite Freigabe, besonders strenge Auditierung |

---

## 6. Querverweise

- `docs/AGENT_ARCHITECTURE.md` (vollstaendige Pipeline-Rollen, BTE, Speech, Orchestration, Registry)
- `docs/specs/architecture/ARCHITECTURE_BASELINE.md`
- `docs/specs/CAPABILITY_REGISTRY.md`
- `docs/specs/security/POLICY_GUARDRAILS.md`
- `docs/MEMORY_ARCHITECTURE.md` (Memory-Schichten und KG-Details)
- `docs/specs/architecture/MEMORY_AND_STORAGE_BOUNDARIES.md`
