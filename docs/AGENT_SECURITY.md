# Agent Security -- Capability, Retrieval, Tooling, Storage

> **Stand:** 13. Maerz 2026
> **Zweck:** Arbeitsdokument fuer die Sicherheitsarchitektur agentischer
> Laufzeitpfade. Definiert die praktischen Leitplanken fuer Retrieval Broker,
> Tool Proxy, Capability Envelope, Agentic Storage und Security-Evaluation.
> **Abgrenzung:** `specs/AUTH_SECURITY.md` und `specs/security/*.md` bleiben
> Security-Source-of-Truth fuer produktive Regeln. Dieses Dokument ist die
> arbeitsnahe Bruecke von Agent-Design zu spaeteren Specs/Execution-Slices.
> **Primaer betroffen:** `AGENT_ARCHITECTURE.md`, `AGENT_TOOLS.md`,
> `CONTEXT_ENGINEERING.md`, `MEMORY_ARCHITECTURE.md`,
> `specs/security/POLICY_GUARDRAILS.md`

---

## Inhaltsverzeichnis

1. [Warum eigenes Agent-Security-Doc?](#1-warum-eigenes-agent-security-doc)
2. [Leitprinzipien](#2-leitprinzipien)
3. [Retrieval Broker als Pflichtpfad](#3-retrieval-broker-als-pflichtpfad)
4. [Tool Proxy + Capability Envelope](#4-tool-proxy--capability-envelope)
5. [Agentic Storage Write-Path](#5-agentic-storage-write-path)
6. [Evidence-Completeness Gates](#6-evidence-completeness-gates)
7. [Security-Evals als Dauer-Gates](#7-security-evals-als-dauer-gates)
8. [Priorisierte Einfuehrungsreihenfolge](#8-priorisierte-einfuehrungsreihenfolge)
9. [Querverweise](#9-querverweise)

---

## 1. Warum eigenes Agent-Security-Doc?

Agentische Systeme scheitern selten nur am Modell. Der Haupt-Risikohebel liegt in:

- falschem Kontextzugriff (Retrieval/Scope)
- ueberbreiten Tool-Rechten (Excessive Agency)
- unkontrollierten Writes (Storage/Mutation)
- fehlenden Regressionstests fuer Injection/Leakage/Misuse

Dieses Dokument macht die Runtime-Sicherheitsgrenzen fuer Agenten explizit, bevor
die Regeln in Specs und Execution-Slices gehoben werden.

---

## 2. Leitprinzipien

1. **Intelligenz != Autoritaet**
   - Agenten analysieren/planen.
   - Deterministische Backend-Schichten autorisieren und fuehren aus.
2. **Least privilege by default**
   - Kein Agent mit globalen Tool-Rechten.
   - Rechte sind task- und zeitgebunden.
3. **Read und write strikt trennen**
   - Retrieval-Pfade sind nicht automatisch Mutationspfade.
4. **Evidence first**
   - Kritische Aussagen/Actions muessen nachvollziehbare Evidenz tragen.
5. **Policy before convenience**
   - Kein direkter Tool- oder Storage-Zugriff aus dem Agent ohne Proxy/Policy.

---

## 3. Retrieval Broker als Pflichtpfad

Der Agent liest Kontext nicht direkt aus beliebigen Stores, sondern ueber einen
Broker mit harten Kontrollen:

- ACL/Tenant-Scope vor Retrieval
- Sensitivity Labels (doc/chunk)
- Source-Trust und Provenance-Pflicht
- Risk- und Class-Filter pro Task-Typ
- Query-Normalisierung und Injection-Hygiene
- explizite Trennung `instruction` vs `data`

**Arbeitsregel:**

`Agent -> Retrieval Broker -> (KG/Vector/Episodic/Docs)`

Kein direkter Agent-Zugriff auf Rohquellen als Produktionspfad.

---

## 4. Tool Proxy + Capability Envelope

Jeder Tool-Call laeuft ueber einen Proxy mit maschinenlesbarer Capability Envelope.

### 4.1 Envelope-Minimum

- `agent_class`
- `allowed_tools`
- `allowed_actions` (`read`, `write`, `delete`, `execute`)
- `risk_level`
- `required_scope`
- `budget_class`
- `needs_human_approval`
- `expiry` / `jit_token`

### 4.2 Runtime-Regeln

- Tool-Calls ohne gueltige Envelope werden abgelehnt.
- High-risk Actions brauchen zustandsabhaengige Freigabe.
- Alle Entscheidungen werden auditierbar protokolliert.

---

## 5. Agentic Storage Write-Path

Agenten schreiben nicht direkt in kanonische Wahrheitsschichten.

### 5.1 Zustaende

`draft -> review -> approved -> published`

### 5.2 Mutationsregel

- append-first/versioned statt silent overwrite
- destructive ops nur mit explizitem Policy-Hit + Audit
- provenance je Artefaktversion

### 5.3 Pflichtfelder pro Write

- actor/agent id
- task id / intent
- source/evidence refs
- previous version hash
- policy decision id
- timestamp

---

## 6. Evidence-Completeness Gates

Gegen silent retrieval failure reicht "es wurde etwas gefunden" nicht.

Pflichtfragen je kritischer Antwort/Aktion:

- Welche Source-Klassen wurden abgefragt?
- Welche Pflichtquellen fehlen?
- Gibt es Widerspruchssuche?
- Reicht die Evidenzdichte fuer den Claim?
- Muss das System abstainen statt raten?

Fehlende Pflichtabdeckung senkt Confidence oder blockiert Action-Pfade.

---

## 7. Security-Evals als Dauer-Gates

Agent Security braucht laufende Regression, nicht nur einmalige Hardening-Runden.

### 7.1 Mindest-Evalfamilien

- prompt injection
- tool misuse / confused deputy
- data leakage / over-retrieval
- policy bypass / scope escalation
- unsafe output handling

### 7.2 Betriebsgate

Neue Agent- oder Tool-Slices gehen nur live, wenn die relevanten Security-Evals
in der Zielkonfiguration reproduzierbar bestehen.

---

## 8. Priorisierte Einfuehrungsreihenfolge

1. Retrieval Broker als erzwungener Pfad
2. Tool Proxy + Capability Envelope
3. Agentic Storage Write-Path mit versionierter Publish-Grenze
4. Evidence-Completeness Gates fuer kritische Flows
5. Security-Evals dauerhaft in Verify-Gates integrieren

---

## 9. Querverweise

- `AGENT_ARCHITECTURE.md` (Planner/Executor/Replanner + Rollen)
- `AGENT_TOOLS.md` (Toolfamilien und Zugriffspfade)
- `AGENT_HARNESS.md` (Harness-Governance, OpenSandbox, Runtime-Guardrails)
- `RAG_GRAPHRAG_STRATEGY_2026.md` (Hybrid Retrieval, Query-Modi, UQ-Strategie)
- `CONTEXT_ENGINEERING.md` (Context Assembly und Retrieval-Policies)
- `MEMORY_ARCHITECTURE.md` (Memory-Tiering und Artefaktlayer)
- `specs/AUTH_SECURITY.md` (Security-Umbrella)
- `specs/security/POLICY_GUARDRAILS.md` (Policy-Gates)
- `specs/security/SECURITY_HARDENING_TRACKS.md` (Hardening-Reihenfolge)
- `specs/execution/agent_security_runtime_delta.md` (Execution-Owner)
