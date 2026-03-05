# [ARCHIVIERT] Review: Tiefe Phasenanalyse (Dateien + Orte)

> **Status:** Archiviert (read-only Referenz).
> Normative Vorgaben werden in den kanonischen Ziel-Dokumenten gepflegt:
> `docs/specs/EXECUTION_PLAN.md`, `docs/specs/FRONTEND_ARCHITECTURE.md`,
> `docs/MEMORY_ARCHITECTURE.md`, `docs/CONTEXT_ENGINEERING.md`, `docs/specs/API_CONTRACTS.md`.

Diese Liste basiert auf tiefer Codesuche in `src`, `go-backend/internal`, `python-backend`, `prisma`, `e2e`, `scripts` plus den Planangaben.

## Priorisierungstabelle (Startpunkt fuer Reviews)

| Prioritaet | Ziel | Typische Bereiche |
|:--|:--|:--|
| **P0 kritisch (Core Runtime)** | Bricht Kernfluss `Frontend -> Go -> Python/Rust` oder Auth/Security | `src/app/api/**`, `src/proxy.ts`, `go-backend/internal/app/wiring.go`, `go-backend/internal/handlers/http/**`, `go-backend/internal/services/**`, `python-backend/services/**`, `python-backend/ml_ai/indicator_engine/**` |
| **P1 wichtig (Domain/Adapter/Store)** | Fachlogik korrekt, aber nicht immer sofort systemkritisch | `go-backend/internal/connectors/**`, `go-backend/internal/services/geopolitical/**`, `src/lib/geopolitical/**`, `src/features/geopolitical/**`, `src/lib/orders/**`, `src/lib/indicators/**` |
| **P2 verify/test/devx** | Verifikation, Stabilitaet, Regression-Schutz | `python-backend/tests/**`, `go-backend/internal/**/*_test.go`, `e2e/**`, `scripts/*.ps1`, `docs/E2E_VERIFY_PHASES_0-4.md` |

### Priorisierung pro Phase (kompakt)

| Phase | P0 kritisch zuerst | P1 danach | P2 verify |
|:--|:--|:--|:--|
| 0 | Market API-Routen + `wiring.go` + Router + BaseClient | Connector-Migrationen + Provider-Registry | Go/TS Route-Tests |
| 1 | `src/proxy.ts`, Auth-Routen, JWT/RBAC Middleware, GCT Audit | Passkey UX/Consent, Runtime-Flags | E2E Auth/Passkey + Middleware-Tests |
| 2 | Indicator-/Finance-Service + Rust Bridge/Core | Rust Cache/Typings | Phase2 Python-Tests + Smoke |
| 3 | SSE Handler + Streaming Core + Stream Routes | Watchlist/History Integration | Streaming Unit-/E2E-Checks |
| 4 | Geopolitical API + Shell/Canvas Kernpfad | Layer/D3/Seed/Contradictions UX | Visual Walk + Panel-Tests |
| 5 | GCT Portfolio Handler/Connector + Analytics APIs | Portfolio Panels/Stores | GCT/Analytics Tests |
| 7 | Indicator-Service API + Trading Integration | Indicator UI/Actions | `test_phase7_indicators.py` |
| 8 | Pattern-Engine Endpunkte + Overlay-Rendering | Sidebar/Chart UX | `test_phase8_patterns.py` |
| 9e | Candidate/Ingest/Contradiction Thin-Proxy + Go Stores/Handlers | Workspace-Hooks + Adapterlogik | Shadow-Run Script + Handler-Tests |

## Ampel-Matrix (Implementierungsreife)

| Phase | Ampel | Kurzbewertung |
|:--|:--|:--|
| 0 | 🟢 | Go-first Routing + BaseConnector + breite Connector-Migration klar im Runtime-Code sichtbar |
| 1 | 🟢 | Auth/Security/Passkey/JWT/RBAC/Request-ID + GCT Audit klar vorhanden |
| 2 | 🟢 | Rust-Core + Python-Bridge + redb/Polars + Tests deutlich implementiert |
| 3 | 🟢 | Streaming Core + SSE + Frontend-Pfade + Tests klar vorhanden |
| 4 | 🟢 | GeoMap v2.0 Shell/Rendering/Layer/Contradictions deutlich implementiert |
| 5 | 🟢 | Portfolio/GCT-Bridge + Analytics-Pfade im Code vorhanden |
| 6 | 🔴 | Kein klarer Runtime-Beleg fuer Memory-APIs/Stores im Kernpfad gefunden |
| 7 | 🟢 | Indicator-Core Endpunkte/Engine/Integration + Tests vorhanden |
| 8 | 🟡 | Pattern-Logik und Tests vorhanden, End-to-End Vollabnahme teils noch ausstehend |
| 9 (insb. 9e) | 🟢 | UIL-GeoMap Konsolidierung (thin-proxy + go-owned stores/handlers) klar sichtbar |
| 10 | 🔴 | Agent-Runtime/WS/Toolchain im produktiven Kernpfad nicht klar belegt |
| 11 | 🔴 | Entropy/Novelty Runtime-Endpunkte nicht klar belegt |
| 12 | 🟡 | Advanced UI + transitionale APIs vorhanden, Go-Konsolidierung noch offen |
| 13 | 🟡 | Optimize/Analytics-Teile vorhanden, voller Scope (HRP/Kelly/VPIN E2E) nur teilweise sichtbar |
| 14 | 🟢 | Global Provider Expansion (SDMX/Timeseries/Scaffolds) deutlich im Go-Code sichtbar |
| 15 | 🟡 | Erweiterte Indicator-Arbeit vorhanden, voller Eval-/Advanced-Scope nur teilweise nachweisbar |
| 16 | 🟡 | Backtest-Subsystem stark vorhanden, Eval-Hardening-Gates noch separat zu verifizieren |
| 17 | 🟡 | Game-Theory Kernpfad vorhanden, kompletter Sim/Planner/Visual-Scope nur teilweise sichtbar |
| 18 | 🔴 | Geplante Darkpool/Options/DeFi Runtime-Endpunkte nicht klar im Kernpfad gefunden |
| 19 | 🔴 | Kein klarer Runtime-Beleg fuer CRDT/deck.gl/h3o in Produktivpfaden |
| 20 | 🔴 | Kein klarer Runtime-Beleg fuer ML-API (`/api/v1/ml/classify-signal`) im Kernpfad |
| 21 | 🟡 | Viele Hardening-Bausteine vorhanden, aber kein eindeutiger „final cleanup complete“-Nachweis |
| 22 | 🔴 | WASM/Tauri/Desktop Runtime-Struktur im Hauptpfad nicht klar belegt |

## Phase 0 (Foundation / Go-first Routing / BaseConnector)

Frontend/Next:
- `src/app/api/market/quote/route.ts`
- `src/app/api/market/news/route.ts`
- `src/app/api/market/ohlcv/route.ts`
- `src/app/api/market/search/route.ts`
- `src/app/api/market/providers/route.ts`
- `src/app/api/market/stream/route.ts`
- `src/app/api/market/stream/quotes/route.ts`
- `src/app/api/geopolitical/news/route.ts`
- `src/lib/server/market-gateway-quotes.ts`
- `src/lib/server/geopolitical-gateway-proxy.ts`
- `src/lib/server/geopolitical-acled-bridge.ts`
- `src/lib/server/geopolitical-context-bridge.ts`
- `src/lib/server/geopolitical-game-theory-bridge.ts`
- `src/lib/strategy/indicator-service.ts`
- `src/lib/geopolitical/adapters/soft-signals.ts`
- `src/lib/providers/index.ts`
- `src/lib/providers/types.ts`

Go Gateway / Connector Basis:
- `go-backend/config/provider-router.yaml`
- `go-backend/internal/router/adaptive/router.go`
- `go-backend/internal/router/adaptive/router_test.go`
- `go-backend/internal/connectors/base/http_client.go`
- `go-backend/internal/connectors/base/error_classification.go`
- `go-backend/internal/connectors/base/sdmx_client_test.go`
- `go-backend/internal/connectors/base/scaffold_test.go`
- `go-backend/internal/services/market/quote_client.go`
- `go-backend/internal/services/market/news_service_test.go`
- `go-backend/internal/app/wiring.go`

Connector-Migration (BaseClient/Router-Folgearbeit):
- `go-backend/internal/connectors/acled/client.go`
- `go-backend/internal/connectors/finnhub/client.go`
- `go-backend/internal/connectors/fred/client.go`
- `go-backend/internal/connectors/ecb/client.go`
- `go-backend/internal/connectors/indicatorservice/client.go`
- `go-backend/internal/connectors/financebridge/client.go`
- `go-backend/internal/connectors/softsignals/client.go`
- `go-backend/internal/connectors/geopoliticalnext/client.go`
- `go-backend/internal/connectors/gdelt/client.go`
- `go-backend/internal/connectors/news/rss_client.go`
- `go-backend/internal/connectors/news/finviz_client.go`
- `go-backend/internal/connectors/news/gdelt_client.go`
- `go-backend/internal/connectors/gametheory/client.go`
- `go-backend/internal/connectors/crisiswatch/client.go`
- `go-backend/internal/connectors/bcb/client.go`
- `go-backend/internal/connectors/banxico/client.go`
- `go-backend/internal/connectors/bok/client.go`
- `go-backend/internal/connectors/bcra/client.go`
- `go-backend/internal/connectors/tcmb/client.go`
- `go-backend/internal/connectors/rbi/client.go`
- `go-backend/internal/connectors/ecbsdmx/client.go`

## Phase 1 (Auth/Security/Request-ID/GCT Audit)

Auth/Proxy/Headers:
- `src/proxy.ts`
- `src/lib/auth.ts`
- `src/lib/auth/runtime-flags.ts`
- `src/features/auth/AuthSignInPanel.tsx`
- `src/features/auth/AuthRegisterPanel.tsx`
- `src/app/auth/security/page.tsx`

Passkey/WebAuthn:
- `src/lib/auth/passkey-client.ts`
- `src/lib/server/passkeys.ts`
- `src/features/auth/PasskeyScaffoldLab.tsx`
- `src/features/auth/PasskeyDevicesPanel.tsx`
- `src/app/auth/passkeys/page.tsx`
- `src/app/api/auth/passkeys/register/options/route.ts`
- `src/app/api/auth/passkeys/register/verify/route.ts`
- `src/app/api/auth/passkeys/authenticate/options/route.ts`
- `src/app/api/auth/passkeys/authenticate/verify/route.ts`
- `src/app/api/auth/passkeys/devices/route.ts`
- `prisma/schema.prisma` (Authenticator/Token/Consent-Modelle)
- `src/lib/server/consent.ts`
- `src/app/api/auth/consent/route.ts`

Request-ID/RBAC/JWT/Audit (Go):
- `go-backend/internal/app/middleware.go`
- `go-backend/internal/app/authz_middleware.go`
- `go-backend/internal/app/jwt_auth_middleware.go`
- `go-backend/internal/app/gct_audit_middleware.go`
- `go-backend/internal/app/gct_security.go`
- `go-backend/internal/app/wiring.go`
- `go-backend/internal/handlers/http/jwt_revocation_handler.go`
- `go-backend/internal/handlers/http/jwt_revocation_audit_test.go`
- `go-backend/internal/handlers/http/gct_audit_sqlite.go`
- `go-backend/internal/handlers/http/gct_audit_sqlite_test.go`
- `go-backend/.env.example`

Request-ID Vertikalpfade (TS/Python):
- `src/app/api/geopolitical/game-theory/impact/route.ts`
- `src/app/api/geopolitical/events/route.ts`
- `src/app/api/geopolitical/context/route.ts`
- `src/app/api/geopolitical/candidates/ingest/soft/route.ts`
- `src/app/api/fusion/strategy/composite/route.ts`
- `src/app/api/fusion/strategy/evaluate/route.ts`
- `src/app/api/fusion/portfolio/route.ts`
- `src/app/api/fusion/portfolio/history/route.ts`
- `python-backend/services/_shared/app_factory.py`

## Phase 2 (Rust Core / Polars / redb)

Rust + Bridge:
- `python-backend/rust_core/Cargo.toml`
- `python-backend/rust_core/pyproject.toml`
- `python-backend/rust_core/src/lib.rs`
- `python-backend/rust_core/src/ohlcv_cache.rs`
- `python-backend/ml_ai/indicator_engine/rust_bridge.py`

Python Services:
- `python-backend/services/indicator-service/app.py`
- `python-backend/services/finance-bridge/app.py`
- `python-backend/ml_ai/indicator_engine/pipeline.py`
- `python-backend/typings/tradeviewfusion_rust_core/__init__.pyi`

Tests/Smoke:
- `python-backend/tests/test_phase2_rust_composite.py`
- `python-backend/tests/test_phase2_finance_bridge_cache.py`
- `python-backend/scripts/smoke-indicator-service.py`
- `scripts/dev-stack.ps1`

## Phase 3 (Streaming Migration)

Frontend:
- `src/app/api/market/stream/route.ts`
- `src/app/api/market/stream/quotes/route.ts`
- `src/app/page.tsx`
- `src/components/fusion/WatchlistPanel.tsx`
- `src/lib/server/portfolio-history-store.ts`

Go Streaming Core:
- `go-backend/internal/handlers/sse/market_stream.go`
- `go-backend/internal/services/market/streaming/candle_builder.go`
- `go-backend/internal/services/market/streaming/snapshot_store.go`
- `go-backend/internal/services/market/streaming/alert_engine.go`
- `go-backend/internal/app/wiring.go`

Tests:
- `go-backend/internal/handlers/sse/market_stream_test.go`
- `go-backend/internal/services/market/streaming/streaming_core_test.go`

## Phase 4 (GeoMap v2.0)

Map Shell/Rendering/D3:
- `src/features/geopolitical/GeopoliticalMapShell.tsx`
- `src/features/geopolitical/MapCanvas.tsx`
- `src/features/geopolitical/TimelineStrip.tsx`
- `src/features/geopolitical/rendering/useGeoMapProjectionModel.ts`
- `src/features/geopolitical/rendering/useGeoMapMarkerClusters.ts`
- `src/features/geopolitical/rendering/useGeoMapMarkerVoronoi.ts`
- `src/features/geopolitical/rendering/useGeoMapCanvasBasemapStage.ts`
- `src/features/geopolitical/rendering/useGeoMapCanvasCountryStage.ts`
- `src/features/geopolitical/rendering/useGeoMapCanvasBodyPointLayersStage.ts`
- `src/features/geopolitical/layers/bodyPointLayerCatalog.ts`
- `src/features/geopolitical/layers/bodyPointLayerTypes.ts`
- `src/features/geopolitical/layers/moonPointLayers.ts`
- `src/features/geopolitical/d3/extensions.ts`
- `src/types/d3-geo-extensions.d.ts`
- `src/features/geopolitical/shell/MapViewportPanel.tsx`
- `src/features/geopolitical/shell/MapTimelinePanel.tsx`

Geo-Domain/Seed/Contradictions:
- `src/lib/geopolitical/ingestion-contracts.ts`
- `src/lib/geopolitical/adapters/hard-signals.ts`
- `src/lib/geopolitical/adapters/soft-signals.ts`
- `src/lib/geopolitical/earth-seed.ts`
- `src/lib/geopolitical/types.ts`
- `src/features/geopolitical/GeoContradictionsPanel.tsx`
- `src/features/geopolitical/EventInspector.tsx`
- `src/features/geopolitical/shell/hooks/useGeopoliticalWorkspaceData.ts`
- `src/features/geopolitical/shell/hooks/useGeopoliticalMarkerMutations.ts`
- `src/app/geopolitical-map/page.tsx`
- `src/app/api/geopolitical/contradictions/route.ts`
- `src/app/api/geopolitical/contradictions/[contradictionId]/route.ts`
- `src/app/api/geopolitical/timeline/route.ts`
- `src/app/api/geopolitical/evaluation/route.ts`

## Phase 5 (Portfolio/GCT/Analytics)

Frontend:
- `src/features/trading/PortfolioPanel.tsx`
- `src/features/trading/LiveBalancesPanel.tsx`
- `src/features/trading/PortfolioAnalyticsPanel.tsx`
- `src/features/trading/PortfolioOptimizePanel.tsx`
- `src/lib/orders/portfolio.ts`
- `src/app/api/fusion/portfolio/live/route.ts`
- `src/app/api/fusion/portfolio/analytics/[slug]/route.ts`

Go/Python:
- `go-backend/internal/connectors/gct/portfolio.go`
- `go-backend/internal/connectors/gct/client.go`
- `go-backend/internal/handlers/http/gct_portfolio_handler.go`
- `go-backend/internal/handlers/http/gct_audit_sqlite.go`
- `python-backend/ml_ai/indicator_engine/portfolio_analytics.py`

Open-Backlog-bezogen:
- `go-backend/vendor-forks/gocryptotrader/gctrpc`

## Phase 7 (Indicator Catalog Core)

Python/Engine:
- `python-backend/services/indicator-service/app.py`
- `python-backend/ml_ai/indicator_engine/pipeline.py`
- `python-backend/ml_ai/indicator_engine/rust_bridge.py`
- `python-backend/ml_ai/indicator_engine/__init__.py`
- `python-backend/tests/test_phase7_indicators.py`

Frontend/Integration:
- `src/lib/indicators/index.ts`
- `src/components/IndicatorPanel.tsx`
- `src/components/trading-chart/indicatorSeries.ts`
- `src/features/trading/useIndicatorActions.ts`
- `src/features/trading/TradingSidebar.tsx`
- `src/features/trading/SignalInsightsBar.tsx`
- `src/app/api/fusion/strategy/composite/route.ts`

## Phase 8 (Pattern Detection)

Python (Core + Tests):
- `python-backend/services/indicator-service/app.py`
- `python-backend/tests/test_phase8_patterns.py`

Frontend-Darstellung:
- `src/components/TradingChart.tsx`
- `src/features/trading/RightDetailsSidebar.tsx`
- `src/app/page.tsx`

## Phase 9e (UIL / GeoMap Backend Konsolidierung)

Next thin-proxy + Candidate/Review:
- `src/lib/server/geopolitical-gateway-proxy.ts`
- `src/app/api/geopolitical/candidates/route.ts`
- `src/app/api/geopolitical/candidates/[candidateId]/accept/route.ts`
- `src/app/api/geopolitical/candidates/[candidateId]/reject/route.ts`
- `src/app/api/geopolitical/candidates/[candidateId]/snooze/route.ts`
- `src/app/api/geopolitical/candidates/ingest/hard/route.ts`
- `src/app/api/geopolitical/candidates/ingest/soft/route.ts`
- `src/app/api/geopolitical/seed/route.ts`
- `src/app/api/geopolitical/contradictions/route.ts`
- `src/app/api/geopolitical/contradictions/[contradictionId]/route.ts`
- `src/app/api/geopolitical/timeline/route.ts`
- `src/proxy.ts`

Go-owned Stores/Handlers:
- `go-backend/internal/handlers/http/geopolitical_candidates_proxy_handler.go`
- `go-backend/internal/handlers/http/geopolitical_ingest_hard_handler.go`
- `go-backend/internal/handlers/http/geopolitical_ingest_soft_handler.go`
- `go-backend/internal/handlers/http/geopolitical_ingest_runs_handler.go`
- `go-backend/internal/handlers/http/geopolitical_migration_status_handler.go`
- `go-backend/internal/handlers/http/geopolitical_seed_handler.go`
- `go-backend/internal/handlers/http/geopolitical_contradictions_handler.go`
- `go-backend/internal/handlers/http/geopolitical_ingest_admin_proxy_handler.go`
- `go-backend/internal/services/geopolitical/candidate_review_store.go`
- `go-backend/internal/services/geopolitical/contradictions_store.go`
- `go-backend/internal/services/geopolitical/events_store.go`
- `go-backend/internal/services/geopolitical/ingest_runs_store.go`
- `go-backend/internal/app/wiring.go`
- `go-backend/internal/app/authz_middleware.go`

Runbook/Script:
- `scripts/geomap-phase9e-shadow-run.ps1`

## E2E/Verify quer ueber mehrere Phasen

- `e2e/integration-stack.spec.ts`
- `e2e/visual-walk.spec.ts`
- `e2e_full.py`
- `docs/E2E_VERIFY_PHASES_0-4.md`
- `scripts/dev-stack.ps1`

## Fazit

- Deine Einschaetzung war richtig: betroffen sind **deutlich mehr** Dateien als in der ersten Kurzliste.
- Die groesste Flaeche liegt in **Phase 0, 1, 4 und 9e** (TS + Go + Python + Tests + Scripts).

## Deep Dive Addendum (alle Phasen)

Filter fuer diesen Deep-Dive:
- Fokus auf Runtime-Code in `src`, `go-backend/internal`, `python-backend`, `prisma`, `scripts`, `e2e`.
- Doku-Dateien, `vendor-forks` und `.gemini`-Skill-Referenzen nicht als primaere Implementierungsbelege gewertet.

### Phase 6 (Memory Architecture)

Status nach Codesuche:
- **Kein klarer Runtime-Implementierungsbeleg** fuer die geplanten Memory-APIs (`/api/memory/*`) oder DB-Artefakte wie `agent_episodes`/`analysis_snapshots`.
- Der Stand wirkt aktuell eher als Planungs-/Architekturphase.

### Phase 10 (Agent Architecture + Context Engineering)

Status nach Codesuche:
- **Kein klarer Runtime-Implementierungsbeleg** fuer Agent-Endpoints/WS-Runtime in den Kernpfaden (`src`/`go-backend/internal`/`python-backend`).
- Relevanz aktuell vor allem auf Spezifikationsebene.

### Phase 11 (Entropy + Novelty Monitoring)

Status nach Codesuche:
- **Kein klarer Runtime-Implementierungsbeleg** fuer `market-entropy`/Monokultur-Guards/Entropy-Dashboard-Endpunkte im produktiven Code.

### Phase 12 (GeoMap v2.5 Advanced)

Konkrete Artefakte im Code:
- `src/features/geopolitical/Phase12AdvancedPanel.tsx`
- `src/features/geopolitical/TimelineStrip.tsx`
- `src/features/geopolitical/EventInspector.tsx`
- `src/app/api/geopolitical/alerts/policy/route.ts`
- `src/app/api/geopolitical/evaluation/route.ts`
- `src/app/api/geopolitical/export/route.ts`
- `src/app/api/geopolitical/overlays/central-bank/route.ts`

Einordnung:
- Advanced-UI und transitionale API-Pfade sind vorhanden.
- Backend-Konsolidierung dieser Pfade in Go ist weiterhin ein Folgepfad.

### Phase 13 (Portfolio Advanced + Optimize)

Konkrete Artefakte im Code:
- `src/features/trading/PortfolioOptimizePanel.tsx`
- `src/features/trading/PortfolioPanel.tsx`
- `src/app/api/fusion/risk/position-size/route.ts`
- `src/lib/orders/risk.ts`
- `python-backend/ml_ai/indicator_engine/portfolio_analytics.py`
- `python-backend/services/indicator-service/app.py`

Einordnung:
- Optimize/Analytics-Teile sind implementiert.
- Voller Scope (z. B. explizite HRP/Kelly/VPIN End-to-End Belege) ist nur teilweise sichtbar.

### Phase 14 (Global Provider Expansion)

Konkrete Artefakte im Code:
- `go-backend/internal/connectors/base/sdmx_client.go`
- `go-backend/internal/connectors/base/translation.go`
- `go-backend/internal/connectors/base/oracle_client.go`
- `go-backend/internal/connectors/bcb/client.go`
- `go-backend/internal/connectors/banxico/client.go`
- `go-backend/internal/connectors/bok/client.go`
- `go-backend/internal/connectors/bcra/client.go`
- `go-backend/internal/connectors/tcmb/client.go`
- `go-backend/internal/connectors/rbi/client.go`
- `go-backend/internal/connectors/ecbsdmx/client.go`
- plus jeweilige `*_test.go` Dateien.

Einordnung:
- Deutlich implementiert (mindestens Connector-Scaffolds + Teile vertikaler Verdrahtung).

### Phase 15 (Indicator Advanced + Eval Baseline)

Konkrete Artefakte im Code (teilweise):
- `python-backend/ml_ai/indicator_engine/pipeline.py`
- `python-backend/ml_ai/indicator_engine/portfolio_analytics.py`
- `python-backend/services/indicator-service/app.py`

Einordnung:
- Erweiterte Indicator-Arbeit vorhanden, aber der komplette Phase-15-Scope (HMM/CUSUM/Order-Flow-Chain/Eval-Baseline-Report) ist im Code nicht vollstaendig eindeutig zuordenbar.

### Phase 16 (Backtesting + Eval Hardening)

Konkrete Artefakte im Code:
- `go-backend/internal/handlers/http/backtest_handler.go`
- `go-backend/internal/handlers/http/backtest_runs_handler.go`
- `go-backend/internal/services/backtest/manager.go`
- `go-backend/internal/services/backtest/executor.go`
- `go-backend/internal/services/backtest/gct_executor.go`
- `go-backend/internal/services/backtest/gct_report_parser.go`
- zugehoerige Tests in denselben Verzeichnissen.

Einordnung:
- Solider Backtest-Implementierungsstand erkennbar.
- Spezifische Eval-Hardening-Gates (z. B. Deflated Sharpe als API-Gate) sollten separat verifiziert werden.

### Phase 17 (Game Theory Mode + Simulation)

Konkrete Artefakte im Code:
- `src/app/api/geopolitical/game-theory/impact/route.ts`
- `src/lib/server/geopolitical-game-theory-bridge.ts`
- `go-backend/internal/connectors/gametheory/client.go`
- `go-backend/internal/handlers/http/geopolitical_game_theory_handler.go`
- `go-backend/internal/services/geopolitical/game_theory_service.go`
- zugehoerige Tests.

Einordnung:
- Kernpfad fuer Game-Theory-Impact ist implementiert.
- Voller Phase-17-Scope (v2+v3 Visual Stack, Planner-Agent, tiefe Simulation) wirkt nur teilweise umgesetzt.

### Phase 18 (Options + Dark Pool + DeFi)

Status nach Codesuche:
- **Kein klarer Endpunkt-Beleg** fuer geplante APIs wie `/api/v1/darkpool/signal`, `/api/v1/options/gex-profile`, `/api/v1/options/expected-move` in den Kernpfaden.
- Kann als offen/teilweise vorbereitet eingeordnet werden.

### Phase 19 (GeoMap v3 + Collaboration + Rust)

Status nach Codesuche:
- **Kein klarer Runtime-Beleg** fuer Yjs/CRDT, deck.gl/MapLibre oder h3o-Integration im Produktivpfad.
- Eher als Zukunfts-/Planungsphase zu betrachten.

### Phase 20 (ML Pipeline)

Status nach Codesuche:
- **Kein klarer Runtime-Beleg** fuer `/api/v1/ml/classify-signal` oder dedizierten `ml-inference-service`.
- ML-nahe Arbeiten existieren in Indicator/Pipeline-Kontext, aber nicht als voller Phase-20-Runtime-Stack.

### Phase 21 (Frontend Refinement + Hardening)

Konkrete Artefakte im Code (Teilbereiche):
- Zod-validierte API-Routen in `src/app/api/fusion/**` (mehrere `route.ts` Treffer).
- a11y-/UI-Hardening-nahe Komponenten u. a. in `src/components/ui/**` und GeoMap-/Trading-UI.
- Go-Logging-Basis in `go-backend/internal/app/middleware.go` (`slog`-Nutzung).

Einordnung:
- Viele Einzelbausteine vorhanden; als umfassende Finale-Cleanup-Phase schwer als "abgeschlossen" belegbar.

### Phase 22 (WASM + Desktop, optional)

Status nach Codesuche:
- **Kein klarer Runtime-Beleg** fuer `wasm-pack` Frontend-Paket oder Tauri-App-Struktur im Hauptprojektpfad.
- Rust-Core via PyO3 existiert, ist aber nicht gleichbedeutend mit Phase-22-WASM/Desktop-Scope.

## Persistenz: IST-Zustand + was noch fehlt

### IST-Zustand (heute)

- **Primäre App-Persistenz: Prisma + SQLite**
  - `prisma/schema.prisma` nutzt `provider = "sqlite"`.
  - `.env.example` setzt `DATABASE_URL="file:./dev.db"`.
  - Das ist aktuell **eine zentrale DB-Datei** (nicht pro User separate DBs).
  - Multi-User wird logisch über User/Profile-Modelle abgebildet (z. B. `User`, `UserProfile`, `profileKey`).

- **Hybrid-Persistenz in mehreren Stores**
  - Mehrere Server-Stores nutzen **Prisma mit JSON-Fallback** (wenn DB nicht erreichbar/konfiguriert).
  - Beispielpfade: `src/lib/server/*-store.ts` (u. a. Portfolio, Orders, GeoMap-Domainstores).

- **Marktdaten-Cache (OHLCV): redb (Rust, embedded, TTL)**
  - Aktiv im Finance-Bridge-Pfad als read-through Cache.
  - Relevante Pfade: `python-backend/services/finance-bridge/app.py`, `python-backend/rust_core/src/ohlcv_cache.rs`.

- **Go-Audit SQLite**
  - GCT-Audit ist zusaetzlich in Go optional per SQLite persistierbar.
  - Pfad: `go-backend/internal/handlers/http/gct_audit_sqlite.go`.

### Einordnung gegen den Plan

- **Phase 1**: Auth/Prisma-Baseline + Audit-Hardening (inkl. SQLite-Auditbausteine).
- **Phase 2**: redb OHLCV Cache als persistenter Embedded-Cache.
- **Phase 5d**: Prisma-Schema-Erweiterungen (Portfolio-Snapshots etc.).
- **Phase 6 (entscheidend fuer naechsten Schritt)**: Zielbild Redis + PostgreSQL Episodic + KG + Vector Store.
- **Phase 10c**: Agent Working Memory (Redis), baut auf Phase 6 auf.

### Was noch gebraucht wird (praktisch, SOTA-nah)

- **DB-Strategie festziehen (vor Phase-6 Implementierung)**
  - Empfehlung: **zentrales PostgreSQL** (ein Cluster/DB, tenanting per `user_id`/`profile_key`), nicht „Postgres pro User DB“.
  - Pro-User-DB nur bei harten Isolationsanforderungen.

- **Klare Datenklassen definieren**
  - **System of Record**: Postgres (User, Portfolio, Journal, Episodic Memory, Review/Audit-Metadaten).
  - **Hot Cache**: Redis (Session/Working-Memory, kurzfristige Query-Caches).
  - **Embedded Spezialcache**: redb fuer OHLCV read-through beibehalten, solange sinnvoll.

- **JSON-Fallback kontrolliert abbauen**
  - Fallback-Dateistores sind fuer Dev robust, aber sollten in produktionsnahen Umgebungen schrittweise reduziert/abgesichert werden.
  - Ziel: klarer primärer Persistenzpfad ohne stilles „split brain“ zwischen DB und Files.

- **Incremental Fetch + Persist als Standard**
  - Historische Daten aus Persistenz lesen, nur Lücken/frische Segmente nachladen.
  - Upsert/Idempotenz-Strategie fuer Zeitreihen (symbol/timeframe/timestamp) verbindlich machen.

- **Migration- und Betriebsregeln**
  - SQLite -> Postgres Migrationspfad (Schema + Daten) mit Runbook.
  - Retention/Partitionierung fuer Zeitreihen und Episodic-Daten.
  - Observability: Cache-Hit-Rates, Backfill-Lag, DB-Latenz, Fallback-Nutzung als harte Metriken.

## Entscheidungs-Checkliste (Architektur-Review)

Ziel: in einem Review-Termin verbindliche Entscheidungen treffen, damit Phase 6/10 sauber umgesetzt werden kann.

1. **Primäre DB-Topologie**
   - Option A: Pro User eigene Datenbank
   - Option B: Zentrales PostgreSQL mit Tenanting (`user_id`/`profile_key`)
   - **Empfehlung:** Option B (operativ deutlich einfacher, i. d. R. effizienter)

2. **Cache-Strategie**
   - Option A: Redis-only (hart erforderlich)
   - Option B: Redis/Valkey primär + no-docker Fallback (in-process + optional persistenter local store)
   - **Empfehlung:** Option B (robust fuer lokale Entwicklung und air-gapped Setups)

3. **JSON-Fallback-Politik**
   - Option A: stiller automatischer Fallback in allen Umgebungen
   - Option B: Fallback nur in Dev/Test, in Staging/Prod fail-fast mit klaren Fehlern
   - **Empfehlung:** Option B

4. **Zeitreihen-Persistenz**
   - Option A: vollstaendig jedes Mal remote fetchen
   - Option B: local-first (persistiert lesen), nur Delta/Luecken fetchen, dann upserten
   - **Empfehlung:** Option B (SOTA und kosteneffizient)

5. **Ownership je Datentyp**
   - Option A: keine harte Trennung (historisch gewachsen)
   - Option B: SoR in Postgres, Hot Cache in Redis/Valkey, OHLCV Spezialcache in redb
   - **Empfehlung:** Option B (klare Verantwortlichkeiten)

## Redis ohne Docker: Fallback/Alternative (SOTA 2026)

### Kurzempfehlung

- **Primär:** Redis oder Valkey (je nach Betriebsvorgabe).
- **No-Docker Fallback:** 
  1) lokal gestarteter nativer Binary-Service (Redis/Valkey als Process/Service), oder  
  2) in-process Cache + optional persistenter Local-Store (SQLite/redb) fuer Working-Memory-lite.

### Konkrete Optionen (ohne Docker-Pflicht)

- **Valkey (Redis-kompatibel) als nativer Service**
  - Kein Docker zwingend; lokal als Dienst/Background-Process betreibbar.
  - Vorteil: Redis-kompatibles Protokoll, geringe Anpassung im App-Code.

- **Redis als nativer Service**
  - Ebenfalls ohne Docker betreibbar, wenn lokale Installation erlaubt ist.
  - Vorteil: maximal kompatibel mit bestehenden Redis-Clients/Tooling.

- **In-Process Cache Fallback (wenn kein externer Cache erlaubt)**
  - Kurzfristige Keys/TTL in-process (z. B. LRU/TTL Map), optional persistente Spiegelung in SQLite/redb.
  - Vorteil: funktioniert auf jedem Dev-Rechner ohne weitere Infrastruktur.
  - Nachteil: kein echter verteilter Cache, begrenzte Horizontal-Skalierung.

### Empfohlener Betriebsmodus fuer dieses Projekt

- **Dev local:** no-docker Modus erlaubt (Valkey/Redis native oder in-process fallback).
- **Staging/Prod:** externer Redis/Valkey Pflicht, in-process nur als Notfall-Degradation.
- **Feature-Flagged Cache Provider:** `CACHE_PROVIDER=redis|valkey|local`
  - `local` nur fuer Dev/Test freigeben.

### Minimaler Umsetzungsbedarf

- Cache-Adapter-Interface einfuehren (get/set/del/ttl/scan-prefix).
- Drei Implementierungen:
  - Redis/Valkey Client Adapter
  - Local In-Process Adapter
  - Optional Local Persistent Adapter (SQLite/redb-backed TTL)
- Health/Telemetry:
  - `cache.provider`, `cache.hit_rate`, `cache.fallback_active`, `cache.errors`.

## SOTA-Erweiterungsempfehlungen pro Phase (klar als Empfehlung)

> **Hinweis:** Die folgenden Punkte sind **Empfehlungen zur Erweiterung** (SOTA-orientiert), keine Aussage, dass dies heute bereits voll implementiert ist.

### Phase 1 (Auth/Security) — Empfehlung zur Erweiterung

- Security-Grenze fuer mutierende Domainpfade zentralisieren (moeglichst einheitlich ueber Go-Enforcement).
- Einheitliche AuthZ/Audit/Rate-Limit-Policies fuer alle Write-Endpunkte festziehen.
- Ziel: weniger verteilte Sicherheitslogik, klarere Nachvollziehbarkeit/Auditbarkeit.

### Phase 4 + 9e (GeoMap/UIL) — Empfehlung zur Erweiterung

- Thin-proxy-Pfade in Next.js beibehalten, aber Write-Ownership konsequent im Go-Layer verankern.
- Candidate/Review/Contradictions/Timeline als durchgaengige Go-Truth-Path-Domain etablieren.
- Ziel: weniger Drift zwischen lokalen und zentralen Stores.

### Phase 5 (Portfolio/Trading) — Empfehlung zur Erweiterung

- SoR-fuer-Writes vereinheitlichen: Portfolio/Orders/Journal bevorzugt ueber zentralen Gateway-Pfad.
- JSON-Fallback bei produktionsnahen Flows auf kontrollierten Degradation-Modus begrenzen.
- Ziel: konsistente Transaktions-/Audit-Sicht bei Trading-relevanten Daten.

### Phase 6 (Memory Architecture) — Empfehlung zur Erweiterung

- Memory nicht nur als Agent-Feature sehen, sondern als uebergreifende Datenebene:
  - Postgres = System of Record (episodic + persistente Kerndaten)
  - Redis/Valkey = shared hot cache
  - redb = Spezialcache fuer OHLCV/read-through
- Ownership-Matrix je Datentyp fest dokumentieren.

### Phase 10 (Agent/Context Engineering) — Empfehlung zur Erweiterung

- Context-Assembly nur ueber definierte Memory-APIs und Retrieval-Policies anbinden.
- Agent-Pipelines von direkten Store-Zugriffen entkoppeln (stabile Contracts, observability).
- Ziel: reproduzierbare Agent-Antworten, klarere Fehlerbilder bei Partial-Outages.

### Phase 14 (Provider Expansion) — Empfehlung zur Erweiterung

- Incremental Fetch + idempotentes Upsert als verbindlichen Standard fuer neue Provider setzen.
- Historische Daten priorisiert aus Persistenz/Cache lesen, nur Delta/Luecken nachladen.
- Ziel: Kosten/Latenz senken, Datenkonsistenz und Wiederverwendbarkeit erhoehen.

### Phase 16 (Backtesting/Eval) — Empfehlung zur Erweiterung

- Datenherkunft/Versionierung fuer Backtests und Evaluationslaeufe standardisieren.
- Trennung von Raw Market Data, Feature-Snapshots und Eval-Outputs erzwingen.
- Ziel: reproduzierbare Resultate und belastbare Vergleichbarkeit.

### Phase 21 (Refinement/Hardening) — Empfehlung zur Erweiterung

- Fallback-Policy environment-scharf machen:
  - Dev/Test: degradierbar (inkl. local fallback)
  - Staging/Prod: fail-fast + klare Fehlersignale statt stiller lokaler Persistenz
- Runtime-Metriken fuer Fallback-Nutzung als harte Betriebskennzahl erfassen.

## Transferstatus / Archiv-Hinweis

Die frueheren Review-Sektionen zu:
- Docs-Updates,
- Phase-Vermerken vor Execution-Transfer,
- TanStack-DB-Einordnung,
- konkretem IST-Check (Ineffizienzen/Ueberkomplexitaet),
- Vereinfachungsreihenfolge

sind in die Ziel-Dokumente ueberfuehrt worden:
- `docs/specs/EXECUTION_PLAN.md` (phase-spezifische Open Checkpoints inkl. Prioritaeten P0/P1/P2),
- `docs/specs/FRONTEND_ARCHITECTURE.md`,
- `docs/MEMORY_ARCHITECTURE.md`,
- `docs/CONTEXT_ENGINEERING.md`,
- `docs/specs/API_CONTRACTS.md`.

`review.md` bleibt damit als historische Analyse-/Auditbasis nutzbar. Fuer neue normative Entscheidungen zuerst Ziel-Docs aktualisieren; `review.md` nur fuer Herleitung/Begruendung verwenden.
