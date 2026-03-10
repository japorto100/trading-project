# Platform DX & Quality Delta

> **Stand:** 09. Maerz 2026  
> **Zweck:** Operativer Delta-Plan fuer Developer-Experience-, Quality- und
> Supply-Chain-Hardening (Compose/Devcontainer, Hooks, Testmatrix, Security Scans).

---

## 0. Execution Contract

### Scope In

- reproduzierbares lokales Setup (Compose/Devcontainer)
- shift-left Quality (hooks, lint/type/test pre-commit oder pre-push)
- Testmatrix fuer Frontend/Go/Python
- dependency/security hygiene (Renovate/Dependabot, Trivy/Semgrep)

### Scope Out

- produktive Deployment-Topologie im Detail
- feature-spezifische Produkt-Roadmaps ohne DX/Quality-Bezug

### Mandatory Upstream Sources

- `docs/specs/ERRORS.md`
- `docs/specs/ARCHITECTURE.md`
- `docs/specs/SYSTEM_STATE.md`
- `docs/specs/AUTH_SECURITY.md`
- `docs/specs/FRONTEND_ARCHITECTURE.md`
- `docs/specs/EXECUTION_PLAN.md`

---

## 1. Offene Deltas

- [ ] **PDQ1** Lokaler Startpfad als deterministischer One-Command-Workflow dokumentiert und getestet
- [ ] **PDQ2** Devcontainer-Strategie (falls genutzt) gegen realen Polyglot-Stack verifiziert
- [x] **PDQ3** Hook-Strategie (`Lefthook`/`Husky`) inkl. Mindestchecks verbindlich festgelegt
- [x] **PDQ4** Testmatrix fuer Frontend/Go/Python mit klaren Smoke- und Kern-Suiten definiert
- [x] **PDQ5** Dependency-Update-Pfad (`Renovate`/`Dependabot`) inkl. Freigabeprozess dokumentiert
- [x] **PDQ6** Security-Scans (`Trivy`/`Semgrep`) in verifizierbare Pipeline-Gates ueberfuehrt

### Aktueller DX-Kontext

- Lokaler Infra-Bereich unter `tools/` erweitert:
  - `tools/seaweedfs/weed.exe`
  - `tools/seaweedfs/s3.json`
  - `tools/seaweedfs/Dockerfile`
  - `tools/garage/garage.toml`
  - `tools/garage/garage.docker.toml`
  - `tools/garage/Dockerfile`
- Zusaeztliche lokale Startpfade vorhanden:
  - host-nativ: `scripts/start-seaweedfs.sh`
  - host-nativ: `scripts/start-garage.sh`
  - compose-basiert: `docker-compose.seaweedfs.yml`
  - compose-basiert: `docker-compose.garage.yml`
- `scripts/dev-stack.ps1` startet SeaweedFS jetzt im gleichen lokalen Infra-Bereich wie NATS/OpenObserve
- Rust/Cargo-User-Homes fuer neue Shells dauerhaft auf `D:\DevCache` gesetzt, damit groessere Rust-Builds nicht mehr auf `C:` landen
- `UV_CACHE_DIR` ist fuer neue Shells ebenfalls dauerhaft auf `D:\DevCache\uv\cache` gesetzt, damit Tool-Installationen (`uv tool install`) nicht mehr am vollen `C:` scheitern
- `scripts/dev-stack.ps1` respektiert jetzt dieselben DevCache-Pfade auch im Prozesslauf (`CARGO_HOME`, `RUSTUP_HOME`, `UV_CACHE_DIR`) statt hart `%USERPROFILE%\.cargo` zu bevorzugen
- `PDQ1` bleibt trotzdem offen, bis der komplette One-Command-Stack inkl. SeaweedFS reproduzierbar end-to-end verifiziert wurde

### One-Command Core Stack Evidence (2026-03-09)

- Verifizierter Orchestrator-Aufruf:
  - `.\scripts\dev-stack.ps1 -SkipGCT -SkipPython -SkipNext -Watch:$false -WaitSeconds 20`
- Beobachtetes Ergebnis:
  - OpenObserve hoert auf `:5080` / `:5081`
  - NATS hoert auf `:4222`
  - SeaweedFS hoert auf `:8333`
  - Go Gateway hoert auf `:9060`
- Go-Gateway-Befund:
  - `air` startete korrekt
  - erster Warmup war durch neue AWS-S3-Module verzoegert (`go: downloading github.com/aws/...`)
  - danach im Log: `running...`, `OTel enabled`, `NATS connected`
- Konsequenz:
  - der Kern-Orchestrator fuer lokalen Infra-/Gateway-Start ist reproduzierbar bestaetigt
  - `PDQ1` bleibt trotzdem offen, bis derselbe One-Command-Pfad auch fuer den breiteren Polyglot-Stack inkl. Frontend/Python sauber evidence-basiert durchgezogen ist

### Testmatrix Evidence (2026-03-10)

**Frontend**

- Smoke-Suiten:
  - `bunx tsc --noEmit`
  - `bun run lint`
  - `bun run build`
- gezielte Kernsuite fuer den aktuellen Provider-/Credential-Slice:
  - `bun test ./src/lib/server/provider-credentials.test.ts ./src/app/api/market/provider-credentials/route.test.ts ./src/app/api/market/providers/route.test.ts ./src/app/api/market/quote/route.test.ts ./src/app/api/market/stream/route.test.ts ./src/app/api/market/stream/quotes/route.test.ts`
- Status:
  - alle oben genannten Frontend-Gates laufen auf dem aktuellen Stand gruen

**Go Gateway**

- Smoke-Suiten:
  - `go test ./internal/app`
  - `go test ./internal/handlers/http`
  - `go test ./internal/handlers/sse`
  - `go test ./internal/storage`
- Kern-/Fokus-Suiten:
  - Provider-/Bridge-Slice:
    - `go test ./internal/connectors/financebridge ./internal/connectors/indicatorservice ./internal/connectors/softsignals ./internal/connectors/memory ./internal/connectors/agentservice ./internal/connectors/acled ./internal/connectors/gdelt ./internal/connectors/cfr ./internal/connectors/crisiswatch ./internal/connectors/gametheory`
  - Streaming-Benchmark:
    - `go test -bench=. -benchmem -benchtime=3s ./internal/services/market/streaming`
- Status:
  - die fokussierten Smoke- und Kernsuiten laufen auf dem aktuellen Stand gruen

**Python Services**

- Smoke-Suite:
  - `uv run pytest tests/test_otel_factory.py tests/test_ipc_grpc.py -q`
- Kernsuiten:
  - breitere Phasen-/Domain-Suiten liegen unter `python-backend/tests/` vor und koennen spaeter blockweise gefahren werden (`phase2`, `phase7`, `phase8`, `phase13`, `phase15`, `phase17`, `phase18`, `phase20`)
- Status:
  - repraesentativer Python-Smoke ist auf dem aktuellen Stand gruen (`7 passed`)

**Arbeitsregel fuer PDQ4**

- Frontend: Typecheck + Lint + Build sind Mindest-Smoke-Gates
- Go: `internal/app` + betroffene Handler/Connector-Pakete sind Mindest-Smoke-Gates; Benchmarks bleiben separater Verify-Pfad
- Python: mindestens ein repraesentativer `pytest`-Smoke pro Service-/IPC-Schicht, breite Fachsuiten blockweise je Slice

### Hook Strategy Evidence (2026-03-10)

- Repo nutzt jetzt `Lefthook` als lokale Hook-Strategie:
  - Konfigurationsdatei: `lefthook.yml`
  - installierter Runner lokal unter `D:/DevCache/bin/lefthook`
- definierte Mindestchecks:
  - `pre-commit`
    - Frontend Biome-Lint
    - Go `gofmt` auf gestagten Go-Dateien
    - Python `ruff check`
  - `pre-push`
    - Frontend: `bunx tsc --noEmit && bun run lint && bun run build`
    - Go: fokussierte Smoke-Suite fuer `internal/app`, `internal/handlers/http`, `internal/handlers/sse`, `internal/storage`
    - Python: `uv run pytest tests/test_otel_factory.py tests/test_ipc_grpc.py -q`
- lokale Evidence:
  - `lefthook version` -> `1.13.6`
  - `lefthook run pre-push` synchronisiert die Hooks erfolgreich
  - die darunterliegenden Frontend-/Go-/Python-Kommandos sind separat gruen verifiziert

### Dependency Update Evidence (2026-03-10)

- `.github/dependabot.yml` ist jetzt vorhanden
- abgedeckte Oekosysteme:
  - `npm` fuer das Frontend-Root
  - `gomod` fuer `go-backend`
  - `pip` fuer `python-backend`
  - `github-actions` fuer Workflow-Abhaengigkeiten
- Takt:
  - woechentliche Updates
  - PR-Limit pro Oekosystem gesetzt
  - Labels fuer Routing/Freigabe (`dependencies`, sprach-/bereichsspezifische Labels)
- Freigabeprozess fuer den aktuellen Delivery-Stand:
  - Dependabot erzeugt nur Update-PRs
  - Merge erst nach gruenen Repo-Gates (`Frontend`, `Go`, `Python`, Security-Workflows)

### Security Gate Evidence (2026-03-10)

- separater Workflow `.github/workflows/security.yml` hinzugefuegt
- verifizierbare Pipeline-Gates:
  - `Semgrep` ueber `returntocorp/semgrep-action`
  - `Trivy` Filesystem-Scan ueber `aquasecurity/trivy-action`
  - SARIF-Upload fuer GitHub Security UI
- Trigger:
  - `push` auf `main`
  - `pull_request` gegen `main`
  - woechentlicher Schedule
- lokale Vorverifikation:
  - Python-Ruff als Teil der shift-left Baseline laeuft gruen
  - repraesentativer Python-Smoke laeuft gruen
  - CI-Workflow `ci.yml` wurde parallel auf staerkere Mindestgates gehoben (Frontend Typecheck/Build, Go vet, Python smoke)

---

## 2. Verify-Gates

- [ ] **PDQ.V1** Setup-Gate: frisches Setup erreicht lauffaehigen Dev-Stack ohne manuelle Sonderpfade
- [ ] **PDQ.V2** Hook-Gate: fehlerhafter Commit wird durch lokale Qualitaetsgates blockiert
- [ ] **PDQ.V3** Test-Gate: definierte Kernsuiten laufen reproduzierbar in lokaler und CI-naher Umgebung
- [ ] **PDQ.V4** Security-Gate: bekannte Schwachstellen werden in definiertem Prozess sichtbar und triagiert

---

## 3. Evidence Requirements

- PDQ-ID + Plattform-/Tool-Kontext
- reproduzierbare Kommandos und beobachtetes Ergebnis
- Nachweis fuer Erfolg und Error-Path
- Verweis auf aktualisierte Owner-Dokumente

---

## 4. Propagation Targets

- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/SYSTEM_STATE.md`
- `docs/specs/ARCHITECTURE.md`
- `docs/specs/AUTH_SECURITY.md`
- `docs/specs/FRONTEND_ARCHITECTURE.md`
- `docs/specs/ERRORS.md`

---

## 5. Exit Criteria

- `PDQ1-PDQ6` entschieden
- Setup-, Hook-, Test- und Security-Gates sind nicht nur notiert, sondern evidence-basiert verifiziert
- keine offenen Widersprueche zwischen ERRORS-/Architecture-/State-Sicht auf DX/Quality
