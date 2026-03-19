# Agent Code Mode -- Optional Runtime Pattern

> **Stand:** 16. Maerz 2026
> **Zweck:** Root-Owner fuer das optionale "code mode"-Pattern in der Agent-Runtime:
> grosse Tool-/API-Payloads lokal in einer Sandbox verarbeiten und nur kompakten
> Output in den Modellkontext geben.
> **Status:** evaluate-only (kein Default-Switch ohne Evidence).
> **Abgrenzung:** Kein Ersatz fuer `AGENT_TOOLS.md`, `AGENT_HARNESS.md` oder
> `CONTEXT_ENGINEERING.md`, sondern fokussierter Entscheidungs- und Betriebsrahmen.

---

## 1. Warum ein eigenes Root-MD?

Dieses Thema ist gross genug fuer ein eigenes Owner-Dokument, weil es gleichzeitig
Tooling, Harness, Security, FinOps und Qualitaet betrifft.

Ohne klaren Owner droht es:

- diffus ueber mehrere Docs verteilt zu werden
- als "schneller Hack" statt als Runtime-Pattern zu landen
- ohne messbare Go/No-Go-Kriterien eingefuehrt zu werden

---

## 2. Scope und Nicht-Scope

### Scope In

- optionales code-mode-Pattern fuer High-Volume Tool-Responses
- konkrete Einsatzregel: wann code mode, wann normaler Tool-Output
- Sicherheits-/Sandbox-Rahmen fuer code-mode-Ausfuehrung
- Evaluate-Gates und Evidence fuer Adoption-Entscheidungen

### Scope Out

- Frontend-Feature-Roadmaps
- allgemeine Agent-Architektur-Neuschreibung
- impliziter Runtime-Switch ohne Verify-Gates

---

## 3. Betriebsregel (verbindlich)

- **evaluate-only:** code mode ist optional und nicht default
- **high-volume only:** nur bei grossen Responses mit klarem Kontextvorteil
- **sandbox only:** keine Host-Ausfuehrung von agentisch generiertem Code
- **deterministischer Output:** kompakt, strukturiert, auditierbar
- **kein Blind-Import:** externe Referenzen sind Kandidaten, keine Architekturvorgaben

---

## 4. Einsatzmatrix

| Situation | Code Mode | Begruendung |
|:----------|:----------|:------------|
| grosse Listen/Bulk-Payloads | ja (optional) | Kontextreduktion + bessere Signalextraktion |
| kleine Tool-Responses | nein | Overhead lohnt nicht |
| policy-kritische Action-Pfade | nur mit Guardrails | Security/Approval/Audit zuerst |
| unklare Datenqualitaet | optional mit explicit flags | Unsicherheit sichtbar halten |

---

## 5. Evaluate-only Kandidaten (GitHub)

- [chenhunghan/code-mode-skill](https://github.com/chenhunghan/code-mode-skill)
- [TheUncharted/zapcode](https://github.com/TheUncharted/zapcode)

Hinweis:

- Beide Kandidaten sind **evaluate-only**.
- Keine Uebernahme als Standard ohne Runtime-Evidence (`AHR*`/`AMC*`).

### Was "betrifft" hier genau bedeutet

- **GitHub-Kandidat betrifft** = externer Evaluationsinput (keine direkte Uebernahme).
- **Interne Wirkung betrifft** = welche Root-MDs und Execution-Slices bei Evaluation/Adoption angepasst werden muessen.

| Kandidat | Externer Zweck | Interne Wirkung (Docs/Slices) |
|:---------|:---------------|:------------------------------|
| `code-mode-skill` | Pattern fuer code-mode bei grossen Tool-Responses | `AGENT_TOOLS.md`, `AGENT_HARNESS.md`, `specs/execution/agent_harness_runtime_delta.md` (`AHR16`) |
| `zapcode` | sandboxed TS-Ausfuehrung als Runtime-Option | `AGENT_HARNESS.md`, `AGENT_SECURITY.md`, `CONTEXT_ENGINEERING.md`, `specs/execution/agent_harness_runtime_delta.md` (`AHR16`), optional `specs/execution/agent_memory_context_delta.md` |

---

## 6. Verify-/Adoption-Gates

Die operative Pruefung liegt in:

- `docs/specs/execution/agent_harness_runtime_delta.md` (`AHR16`, `AHR.V12`)
- `docs/specs/execution/agent_memory_context_delta.md` (Messung Quality/Context/Degradation)
- optional `docs/specs/execution/agent_security_runtime_delta.md` (zus. Security-Gates)

Go/No-Go erst wenn:

- Kontext-/Token-Reduktion reproduzierbar
- keine Qualitaets-Regression in Kernfaellen
- keine Policy-/Sandbox-Regression
- nachvollziehbares Vergleichsprotokoll gegen Baseline

---

## 7. Go/No-Go-Checkliste (kompakt)

Alle Punkte muessen fuer "Go" erfuellt sein:

1. **Wirksamkeit:** messbare Kontext-/Token-Reduktion bei repraesentativen High-Volume-Faellen
2. **Qualitaet:** keine relevante Verschlechterung gegen Baseline in Kern-Use-Cases
3. **Sicherheit:** Sandbox-/Policy-/Capability-Gates bleiben ohne Regression
4. **Betrieb:** Latenz und Fehlerverhalten bleiben innerhalb definierter Runtime-Budgets
5. **Nachweis:** reproduzierbares Evidence-Paket (`status quo` vs. `code mode`) liegt vor

---

## 8. Security-Mindestregeln fuer Code-Mode

Code-Mode darf keine Sicherheitsgrenzen umgehen, sondern muss dieselben
Boundaries strikter einhalten als Standard-Tooling.

Pflicht:

- **taint-aware execution:** untrusted Payloads bleiben bis zum finalen Output markiert
- **secret-safe processing:** keine Klartext-Secrets im Code, Output, Logs oder Artifacts
- **sink control:** Ergebnisse duerfen nicht ungeprueft in `execute/write/delete`-Pfade laufen
- **approval escalation:** high-risk Folgeaktionen bleiben HITL-pflichtig

Minimaler Runtime-Contract je Code-Mode-Run:

- `input_labels` (`trusted|untrusted|sensitive`)
- `sandbox_id`
- `policy_decision_id`
- `output_schema_id`
- `redaction_report`

---

## 9. Frontend vs Backend

Kurz: **20% Frontend, 80% Backend/Runtime**.

- Frontend-nah: sinnvoll bei Browser-/WebMCP-nahen Datenabrufen.
- Backend-first: groesster Hebel bei Aggregator-/Provider-/Ingest-/Control-Responses, also da, wo viel JSON anfaellt.
- Auch fuer Go/Python/Rust-Services relevant, nicht auf UI beschraenkt.

---

## 10. Propagation Targets

- `docs/AGENT_TOOLS.md`
- `docs/AGENT_HARNESS.md`
- `docs/AGENT_SECURITY.md`
- `docs/AGENT_MODEL_TOKEN_TUNING.md`
- `docs/CONTEXT_ENGINEERING.md`
- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/execution/agent_harness_runtime_delta.md`
- `docs/specs/execution/agent_memory_context_delta.md`

