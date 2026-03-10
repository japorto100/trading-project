# Error Handling, Observability & Resilience Spec 2026

**Stand:** 07. März 2026  
**Status:** Normatives Spec-Dokument  
**Architektur-Fokus:** Error Handling, Observability, Resilience, No Vendor Lock-In

Dieses Dokument definiert die verbindlichen Fehler-, Telemetrie- und Resilience-Normen über den gesamten Stack (`Next.js`/React, Go, Python).  
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
- Correlation IDs, Traces, Logs, Metrics
- Retry / Fallback / Circuit Breaker / degraded mode
- minimale Betriebsnormen für Observability

### 0.2 Dieses Dokument regelt **nicht** primär

- Frontend-Workbench- und Dashboard-Referenzen  
  Siehe `docs/FRONTEND_COMPONENTS.md`
- Contract-Driven Development, Codegen und API-Toolchains  
  Siehe `docs/specs/API_CONTRACTS.md`, `docs/specs/ARCHITECTURE.md`
- Feature Flags, progressive delivery, capability rollout  
  Siehe `docs/specs/CAPABILITY_REGISTRY.md`, `docs/specs/ROLLOUT_GATES.md`
- Data-Layer-, ORM-, DuckDB-/Polars-/Arrow-Strategien  
  Siehe `docs/specs/ARCHITECTURE.md`, `docs/INDICATOR_ARCHITECTURE.md`, `docs/RUST_LANGUAGE_IMPLEMENTATION.md`
- Agent-Runtime, AI-Routing, OpenSandbox, Guardrails, DSPy, A2A  
  Siehe `docs/AGENT_ARCHITECTURE.md`, `docs/AGENT_TOOLS.md`, spaeter `AGENT_RUNTIME_AND_EXECUTION_ARCHITECTURE.md`
- Future- und Deep-Tech-Radar  
  Siehe `docs/Advanced-architecture-for-the-future.md`

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

Die detaillierte Server-State-Strategie bleibt in `docs/specs/FRONTEND_ARCHITECTURE.md` verankert; `TanStack Query` ist dort die primäre Client-Server-State-Referenz.

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

### 5.1 OpenTelemetry als Standard

Geschäftslogik soll nicht direkt an proprietäre Observability-SDKs gekoppelt werden.

Standard:

- Emission über `OpenTelemetry`
- OTLP als Standardpfad für Traces, Logs, Metrics

Für `tradeview-fusion` gilt aktuell:

- präferierter Stack: `OpenObserve`
- mögliche Ergänzungen / spätere Optionen:
  - `OTel Collector`
  - `Jaeger`
  - `Prometheus`
  - `Grafana`
  - `Loki`

### 5.2 Structured Logging

Logs sollen strukturiert und korrelierbar sein.

Mögliche Stack-Optionen:

| Stack | Optionen |
|---|---|
| TypeScript | `pino`, `winston` |
| Go | `log/slog` |
| Python | `structlog` |

Pflichtfelder in Request-/Fehlerlogs:

- Correlation ID / Request ID
- Service
- Route / Path
- Status
- Dauer / Latenz
- optional User-/Role-Kontext, wenn policy-relevant

### 5.3 Correlation IDs

Jeder relevante Request-Pfad soll durchgängig korrelierbar sein:

- Browser / Next.js
- Go Gateway
- Python Services
- später ggf. Jobs / Agenten / IPC / Streams

Ohne Correlation IDs ist Fehleranalyse in einem polyglotten System nicht ausreichend.

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

## 8. Related Docs / Out of Scope

Die folgenden Themen bleiben wichtig, werden aber **nicht** in diesem Dokument normativ ausformuliert.  
`ERRORS.md` definiert nur die Error-, Observability- und Resilience-Normen.  
Die fachliche Vertiefung liegt in den jeweils zuständigen Dokumenten.

### 8.1 Frontend-Komponenten und Agent-Workbenches

Ziel-Dokument:
- `docs/FRONTEND_COMPONENTS.md`

Beispiele für dort verankerte Referenzen:
- `Agent Zero`
- `Perplexica`
- `Mission Control`
- `GitNexus Web`
- `Paperless-ngx`
- `Tambo`
- `Vercel AI SDK`

### 8.2 Contract-Driven Development und Codegen

Ziel-Dokumente:
- `docs/specs/API_CONTRACTS.md`
- `docs/specs/ARCHITECTURE.md`
- `docs/specs/EXECUTION_PLAN.md`

Beispiele für dort verankerte Optionen:
- `OpenAPI 3.1`
- `Protobuf`
- `gRPC`
- `Orval`
- `Kiota`
- `oapi-codegen`
- `datamodel-code-generator`

### 8.3 Shift-left Quality, Testing und Supply Chain

Ziel-Dokumente:
- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/SYSTEM_STATE.md`
- `docs/specs/AUTH_SECURITY.md`
- `docs/specs/FRONTEND_ARCHITECTURE.md`

Beispiele für dort verankerte Optionen:
- `Lefthook`
- `Husky`
- `Renovate`
- `Dependabot`
- `Trivy`
- `Semgrep`
- `Vitest`
- `React Testing Library`
- `Pytest`

### 8.4 Feature Flags und progressive delivery

Ziel-Dokumente:
- `docs/specs/CAPABILITY_REGISTRY.md`
- `docs/specs/ROLLOUT_GATES.md`
- `docs/specs/AUTH_SECURITY.md`
- `docs/specs/EXECUTION_PLAN.md`

Beispiele für dort verankerte Optionen:
- `Unleash`
- `Flagsmith`

### 8.5 Data-Layer-, ORM- und Compute-Architektur

Ziel-Dokumente:
- `docs/specs/ARCHITECTURE.md`
- `docs/specs/EXECUTION_PLAN.md`
- `docs/INDICATOR_ARCHITECTURE.md`
- `docs/RUST_LANGUAGE_IMPLEMENTATION.md`
- `docs/UNIFIED_INGESTION_LAYER.md`

Beispiele für dort verankerte Optionen:
- `Drizzle`
- `Prisma`
- `Turso`
- `LiteFS`
- `DuckDB`
- `Polars`
- `Apache Arrow`
- `Dremio`
- `MotherDuck`
- `SpiceDB`
- `Topaz`

Wichtiger Kontext:
- `DuckDB`, `Polars` und `Apache Arrow` sind fuer `tradeview-fusion` primaer analytische, batch- und research-nahe Datenpfade.
- Sie sind **nicht** die normative Begründung fuer die härteste Live-Execution- oder HFT-Schicht.
- `Apache Arrow` ist hier vor allem als Zero-Copy-/Low-Serialization-Brücke zwischen Go, Python, Rust und analytischen Pipelines relevant.

### 8.6 Agent-Runtime, AI-Routing und Governance-Erweiterungen

Ziel-Dokumente:
- `docs/AGENT_ARCHITECTURE.md`
- `docs/AGENT_TOOLS.md`
- `docs/specs/AUTH_SECURITY.md`
- `docs/specs/EXECUTION_PLAN.md`
- spaeter `AGENT_RUNTIME_AND_EXECUTION_ARCHITECTURE.md`

Beispiele für dort verankerte Optionen:
- `LiteLLM`
- `RouteLLM`
- `DSPy`
- `PydanticAI`
- `Guardrails AI`
- `OpenSandbox`
- `Scallop`
- `Z3`
- `A2A`

### 8.7 Future- und Deep-Tech-Radar

Ziel-Dokument:
- `docs/Advanced-architecture-for-the-future.md`

Beispiele für dort verankerte Optionen:
- `WebTransport`
- `quic-go`
- `Tetragon`
- `Grafana Beyla`
- `OpenTelemetry eBPF Instrumentation`
- `Temporal`
- `Restate`
- `Redpanda`
- `Aeron`
- `Point72/csp`
- `Pkl`
- `KCL`
- `OpenTofu`
- `Crossplane`
- `Nix`
- `Nix Flakes`
- `Confidential Containers`
- `Intel TDX`
- `AMD SEV-SNP`
- `Servo`

### 8.8 Geo-/Rendering-spezifische Performance-Optionen

Ziel-Dokumente:
- `docs/geo/GEOMAP_OVERVIEW.md`
- `docs/geo/GEOMAP_VERIFY_GATES.md` (Performance-Baseline Sek. 4)
- `docs/geo/GEOMAP_FOUNDATION.md` (Rendering Foundation Sek. 4)
- `docs/specs/EXECUTION_PLAN.md`

Beispiele für dort verankerte Optionen:
- `deck.gl`
- `WebGPU`
- `FlatGeobuf`
- `PMTiles`
- `Three.js`
- `D3.js`

### 8.9 Gateway-/IPC-/Transport-Optionen

Ziel-Dokumente:
- `docs/GO_GATEWAY.md`
- `docs/specs/ARCHITECTURE.md`
- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/API_CONTRACTS.md`

Beispiele für dort verankerte Optionen:
- `Connect RPC`
- `gRPC`

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

## 10. Primärquellen

- `docs/archive/Master_master_architecture_2026_IMPORTANT.md`
- `docs/archive/Master_master_diff_merge_matrix.md`
- `docs/specs/AUTH_SECURITY.md`
- `docs/specs/API_CONTRACTS.md`
- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/ROLLOUT_GATES.md`
- `docs/specs/FRONTEND_ARCHITECTURE.md`
