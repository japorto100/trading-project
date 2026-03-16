# ERRORS — Error Handling & Resilience

> **Stand:** 16. Maerz 2026
> **Zweck:** Verbindliche Fehler- und Resilience-Normen ueber den gesamten Stack
> (Next.js/React, Go, Python).
> **Source-of-Truth-Rolle:** Autoritativ fuer Error Taxonomy, strukturierte Fehlerantworten,
> Error Boundaries, Backend-Fehlerkonventionen und Resilience-Patterns.
> Observability/Telemetrie-Normen: siehe `OBSERVABILITY.md`.

Ziel ist die klare Trennung zwischen:

- **erwarteten Fehlern** (Domain / Validation / Policy / Limits)
- **unerwarteten Crashes** (Bugs / Runtime / Infrastruktur)
- **degraded modes** (Fallback, Retry, Cache, Provider-Ausfall)

Dieses Dokument ist **kein** Sammelcontainer mehr für Frontend-Referenzen, Future-Radar oder allgemeine Architektur-Evaluationen.

---

## 0. Scope und Abgrenzung

### 0.1 Dieses Dokument regelt

- Error Taxonomy
- strukturierte Fehlerantworten
- Frontend Error Boundaries und Route Bubble
- Backend-Fehlerkonventionen in Go und Python
- Retry / Fallback / Circuit Breaker / degraded mode

### 0.2 Dieses Dokument regelt **nicht** primär

- Frontend-Workbench- und Dashboard-Referenzen
- Contract-Driven Development, Codegen und API-Toolchains
- Feature Flags, progressive delivery, capability rollout
- Data-Layer-, ORM-, DuckDB-/Polars-/Arrow-Strategien
- Agent-Runtime, AI-Routing, OpenSandbox, Guardrails, DSPy, A2A
- Future- und Deep-Tech-Radar

---

## 1. Error Taxonomy

Das System unterscheidet verbindlich zwischen:

1. **Expected domain errors**
   - Validierungsfehler
   - fehlende Rechte
   - bekannte Fachregeln
   - API-Limits / Quotas

2. **Unexpected crashes**
   - TypeErrors
   - Runtime-Bugs
   - nil/null-Probleme
   - ungefangene Exceptions / Panics

3. **Upstream / provider failures**
   - Timeout
   - 5xx
   - Netzwerkfehler
   - kaputte Payloads
   - Downstream nicht erreichbar

4. **Policy / permission failures**
   - RBAC verletzt
   - Capability nicht erlaubt
   - Sandbox-/Boundary-Verstoss
   - Partner-/Scope-Verletzung

5. **Transient async / job failures**
   - temporäre Queue-/Worker-Probleme
   - vorübergehende IPC-/stream-Probleme
   - recoverable task failures

6. **Epistemic uncertainty**
   - Widerspruch
   - unklare Evidenz
   - unzureichende Sicherheit
   - nicht genug Signal

Epistemic uncertainty ist **kein klassischer Runtime-Fehler**, muss aber im System als eigener Zustand sichtbar sein und darf nicht als stiller Erfolg erscheinen.

---

## 2. Frontend Error Handling

### 2.1 Error Boundaries & Route Bubble Pattern

Für unvorhergesehene Abstürze nutzen wir hierarchische Next.js Error Boundaries:

- `src/app/global-error.tsx`
  - letzte Fallback-Boundary
  - eigene `<html>`-Tags
  - Hard-Reset-Button
- `src/app/error.tsx`
  - Top-Level-Catch
- `src/app/geopolitical-map/error.tsx`
  - granulare Boundary
  - bei Map-Crash bleiben Sidebar und Header nutzbar

Prinzip:

- Crash einer spezialisierten Surface darf nicht automatisch die gesamte App unbenutzbar machen
- GeoMap-, D3-, WebGL- und chartlastige Flächen brauchen besonders feine Isolation

### 2.2 Expected Errors im UI

Für erwartete Fehler nutzen wir strukturierte Rückgaben statt unkontrollierter Exceptions:

- Server Actions liefern z. B. `{ success: false, error: "..." }`
- Validierung erfolgt strukturiert, z. B. mit `Zod` oder `Valibot`
- `next-safe-action` bleibt eine mögliche Option für typsichere Server Actions

### 2.3 Optimistic Rollback

Bei erwartbaren Mutationsfehlern soll die UI automatisch auf einen gültigen Zustand zurückfallen statt hart zu crashen.

Wichtige React-/Frontend-Optionen, die hier relevant bleiben:

- `useOptimistic`
- `useActionState`

Die detaillierte Server-State-Strategie bleibt in `docs/specs/architecture/FRONTEND_ARCHITECTURE.md` verankert; `TanStack Query` ist dort die primaere Client-Server-State-Referenz.

---

## 3. Backend Error Handling

### 3.1 Go

Prinzipien:

- erwartete Fehler klar typisieren oder semantisch klassifizieren
- Fehler mit Kontext wrappen
- keine stummen Fehlerpfade
- parallele Fehler aggregieren statt verschlucken

Optionen / relevante Standards, die ausdrücklich erhalten bleiben:

- `errors.AsType[T]` als moderne Go-1.26-Option
- `errors.Join(errs...)` für parallele Fehler
- behaviorale Interfaces statt reinem Sentinel-Pattern

Beispiel für behaviorale Prüfung:

```go
type Retryable interface { Retryable() bool }
```

### 3.2 Python

Prinzipien:

- Exceptions nicht als versteckten Business-Control-Flow missbrauchen
- Domain Exceptions auf Modulebene definieren
- low-level Fehler in fachliche Fehler übersetzen
- ganz oben in API-/CLI-Grenzen loggen und mappen
- keine stillen `except Exception: pass`-Blöcke

Optionen / relevante Standards, die ausdrücklich erhalten bleiben:

- `returns`
- `python-result-type`
- `asyncio.TaskGroup`
- `except*`

---

## 4. Structured Responses & Error Contracts

Erwartete Fehler sollen als strukturierte Rückgaben und standardisierte Fehlerformen modelliert werden.

Mindestanforderungen:

- maschinenlesbarer Fehlercode oder klarer Fehlertyp
- menschenlesbare Nachricht
- Retry-Hinweis, falls relevant
- Correlation ID / Request ID
- bei Streams: explizite Error-Events statt stiller Verbindungsabbrüche

Dieses Dokument definiert das Prinzip.  
Die konkrete Form der Fehlerobjekte und streamenden Error-Events gehört in `docs/specs/API_CONTRACTS.md`.

---

## 5. Observability & Telemetrie

> Vollstaendige Observability-Normen (OTel, Structured Logging, Correlation IDs, Golden Signals):
> **`docs/specs/OBSERVABILITY.md`**

Kurzfassung: OTel/OTLP fuer alle Services, `OpenObserve` als praeferierter Stack,
`log/slog` (Go), `structlog` (Python), `pino` (TS). Correlation IDs von Next.js → Go → Python → Jobs.

---

## 6. Resilience Patterns

### 6.1 Retry

Retry ist nur dort zulässig, wo das Verhalten sicher und fachlich vertretbar ist.

Prinzipien:

- idempotente Operationen bevorzugt retrybar
- nicht-idempotente Writes nur mit großer Vorsicht
- Retry nie als Ersatz für gutes Fehlerdesign

### 6.2 Circuit Breaker

Provider- oder Netzwerkfehler sollen nicht unkontrolliert auf die Produktoberfläche durchschlagen.

Relevante Optionen, die ausdrücklich erhalten bleiben:

- `gobreaker`
- `failsafe-go`
- `Opossum`

### 6.3 Fallback & degraded mode

Bei Upstream-Ausfällen gilt:

- Fallback-Provider oder Cache wenn fachlich sinnvoll
- degraded mode explizit markieren
- keine stille Qualitätsverschlechterung ohne Kennzeichnung

### 6.4 Health, readiness, verify

Error- und Observability-Standards sind nur wertvoll, wenn sie verifizierbar sind.

Deshalb gehören konkrete Verify Gates in:

- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/ROLLOUT_GATES.md`

---

## 7. Security-Bezug von Fehlern

Security ist hier nicht nur klassische Authentifizierung.

Fehler- und Betriebsnormen berühren auch:

- capability scoping
- policy failures
- audit logging
- sandbox boundaries
- replay-/telemetry-privacy
- mutation restrictions

Die eigentlichen Security- und Privacy-Regeln bleiben in `docs/specs/AUTH_SECURITY.md`.

---

## 8. Out of Scope

Dieses Dokument bleibt bei Fehler-, Observability- und Resilience-Normen.
Nicht Teil dieses Specs sind:

- Frontend-Workbench-Referenzen
- Contract-Driven Development und Codegen
- Shift-left Quality, Testing und Supply-Chain-Standards
- Feature Flags und Progressive Delivery
- Data-Layer-, ORM- und Compute-Architektur
- Agent-Runtime, AI-Routing und Governance-Erweiterungen
- Future-/Deep-Tech-Radar sowie Geo-/Rendering-Radar
- Gateway-/IPC-/Transport-Auswahlentscheidungen

## 9. Priorisierung

### Muss
- Error Taxonomy
- structured error responses
- Error Boundaries / Route Bubble
- Correlation IDs
- OpenTelemetry-Basis
- structured logging
- Retry / Fallback / degraded mode

### Soll
- Circuit Breaker-Standardisierung
- Verify Gates für End-to-End Tracing
- einheitliche Stream-Error-Formen
- klarer degraded-mode Vertrag

### Nicht dieses Dokuments
- Frontend-Workbench-Referenzen
- ORM-/DuckDB-/Polars-Strategie
- Agent-Routing / DSPy / A2A / OpenSandbox-Vertiefung
- WebGPU / deck.gl / WebTransport / eBPF / Nix / Confidential Computing
