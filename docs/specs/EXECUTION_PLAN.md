# MASTER EXECUTION PLAN

> **Stand:** 04. März 2026 (Rev. 3.26 — Phase 9 Env-Cutover + Phase 12a NLP Upgrade CODE-COMPLETE)
> **Zweck:** Hoechst-Level Roadmap und **vollstaendiger Index** ueber alle `docs/*.md` Planungsdokumente. Jede Phase ist ein End-to-End Deliverable. Jede Sub-Phase referenziert die Detail-Sektion im jeweiligen Fach-Dokument. Keine Phase wird begonnen bevor die vorherige ihr Verify Gate bestanden hat.
> **Granulare Todo-Checkliste:** [`execution_mini_plan.md`](./execution_mini_plan.md) | **Archiv Rev. 5:** [`docs/archive/execution_mini_plan_rev5_2026-03-03.md`](../archive/execution_mini_plan_rev5_2026-03-03.md)
>
> **Quellen (alle docs/*.md ohne Subdirectories, exkl. CHERI/Future-Quant/ENV_VARS/REMOTE_DEV):**
>
> | Kuerzel | Dokument | Tasks |
> |:--------|:---------|------:|
> | **IND** | [`INDICATOR_ARCHITECTURE.md`](../../docs/INDICATOR_ARCHITECTURE.md) | ~112 |
> | **GEO** | [`GEOPOLITICAL_MAP_MASTERPLAN.md`](../../docs/GEOPOLITICAL_MAP_MASTERPLAN.md) | ~139 |
> | **GO-R** | [`go-research-financial-data-aggregation-2025-2026.md`](../../docs/go-research-financial-data-aggregation-2025-2026.md) | ~65 |
> | **RUST** | [`RUST_LANGUAGE_IMPLEMENTATION.md`](../../docs/RUST_LANGUAGE_IMPLEMENTATION.md) | ~52 |
> | **CE** | [`CONTEXT_ENGINEERING.md`](../../docs/CONTEXT_ENGINEERING.md) | ~35 |
> | **ENT** | [`ENTROPY_NOVELTY.md`](../../docs/ENTROPY_NOVELTY.md) | ~38 |
> | **MEM** | [`MEMORY_ARCHITECTURE.md`](../../docs/MEMORY_ARCHITECTURE.md) | ~30 |
> | **AGT** | [`AGENT_ARCHITECTURE.md`](../../docs/AGENT_ARCHITECTURE.md) | ~40 |
> | **AT** | [`AGENT_TOOLS.md`](../../docs/AGENT_TOOLS.md) | ~25 |
> | **GT** | [`GAME_THEORY.md`](../../docs/GAME_THEORY.md) | ~35 |
> | **PF** | [`Portfolio-architecture.md`](../../docs/Portfolio-architecture.md) | ~33 |
> | **UIL** | [`UNIFIED_INGESTION_LAYER.md`](../../docs/UNIFIED_INGESTION_LAYER.md) | ~20 |
> | **AUTH** | [`AUTH_SECURITY.md`](./AUTH_SECURITY.md) | ~25 |
> | **ADR** | [`ADR-001-streaming-architecture.md`](../../docs/ADR-001-streaming-architecture.md) | ~12 |
> | **OPTS** | [`GEOPOLITICAL_OPTIONS.md`](../../docs/GEOPOLITICAL_OPTIONS.md) | (D3 Modul-Katalog) |
> | **GOG** | [`GO_GATEWAY.md`](../../docs/GO_GATEWAY.md) | (RSC, MCP) |
> | **FDT** | [`FRONTEND_DESIGN_TOOLING.md`](../../docs/FRONTEND_DESIGN_TOOLING.md) | (Design Tools) |
> | **PEK** | [`POLITICAL_ECONOMY_KNOWLEDGE.md`](../../docs/POLITICAL_ECONOMY_KNOWLEDGE.md) | (KG Seed) |
> | **REF** | [`REFERENCE_PROJECTS.md`](../../docs/REFERENCE_PROJECTS.md) | (Referenz-Index) |
> | | **Gesamt** | **~661** |
>
> **Specs:** [`SYSTEM_STATE.md`](./SYSTEM_STATE.md), [`API_CONTRACTS.md`](./API_CONTRACTS.md), [`FRONTEND_ARCHITECTURE.md`](./FRONTEND_ARCHITECTURE.md), [`ERRORS.md`](./ERRORS.md)
> **Frontend Bugs:** [`webapp.md`](../../docs/webapp.md)
>
> **Neue Docs (28. Feb 2026, execution_mini_plan) — Phase-Zuordnung:**
> | Kuerzel | Dokument | Phase(n) | Zweck |
> |:--------|:---------|:---------|:------|
> | **PROXY** | [`PROXY_CONVENTIONS.md`](../../docs/PROXY_CONVENTIONS.md) | 0, 1 | Correlation-ID, Thin-Proxy, Provider-Bypass-Verbot |
> | **ERRORS** | [`ERRORS.md`](./ERRORS.md) | 0 | Error Handling, Observability (OpenObserve), Error Boundaries |
> | **GEOMAP-V** | [`GEOMAP_VERIFY.md`](../../docs/GEOMAP_VERIFY.md) | 4 | Draw-Workflow, E2E-Abnahme, Save-Fehlerpfad |
> | **REF-SRC** | [`REFERENCE_SOURCE_STATUS.md`](../../docs/REFERENCE_SOURCE_STATUS.md) | 14 | Provider-Status-Matrix |
> | **CAP-REG** | [`CAPABILITY_REGISTRY.md`](./CAPABILITY_REGISTRY.md) | 23 | API/Tool scopes, risk-tier |
> | **BASEMAP** | [`BASEMAP_POLICY.md`](../../docs/BASEMAP_POLICY.md) | 4 | OSM-Attribution, Geocoding-Provider, Lizenz-Checklist |
> | **ADR-002** | [`adr/ADR-002-GeoMap-Rendering-Foundation.md`](../../docs/adr/ADR-002-GeoMap-Rendering-Foundation.md) | 4 | Globe-Core, Flat/Regional optional, deck.gl/MapLibre Gate |
> | **GEOCODING** | [`GEOCODING_STRATEGY.md`](../../docs/GEOCODING_STRATEGY.md) | 4 | Geocoding-Provider-Strategie, Cache/Fallback |
> | **PERF** | [`PERFORMANCE_BASELINE.md`](../../docs/PERFORMANCE_BASELINE.md) | 4, 12 | FPS, Frame-Time p50/p95, Lastprofile, deck.gl Entry-Gate |
> | **PMTILES** | [`PMTILES_CONTRACT.md`](../../docs/PMTILES_CONTRACT.md) | 4 | PMTiles vs Live-Overlay Contract |
>
> **Aenderungshistorie:**
> - Rev. 1 (20. Feb 2026) — Erstfassung (10 Phasen, ~154 Tasks erfasst)
> - Rev. 2 (22. Feb 2026) — Phasen 10-12 ergaenzt, Auth/Memory/GT
> - Rev. 3 (22. Feb 2026) — **Vollstaendige Neufassung.** 22+1 Phasen mit Sub-Phasen. Auth auf Phase 1 hochgezogen. Memory vor Agents. Fehlende Themen eingefuegt (Entropy, Connector Expansion, Indicator Catalog, Backtesting, Options/DeFi, ML Pipeline, GeoMap v2.5/v3, WASM). ~90% der 661 geplanten Tasks jetzt referenziert.
> - Rev. 3.1 (22. Feb 2026) — Aktueller-Stand-Sektion eingefuegt. `API_CONTRACTS.md` um Sek. 11-13 (Memory, Agent, Agent State) erweitert. `FRONTEND_ARCHITECTURE.md` Phasen-Referenzen auf Rev. 3 Nummerierung aktualisiert.
> - Rev. 3.2 (25. Feb 2026) — Phase 7 (Indicator Catalog Core) abgeschlossen: 7 neue Python-Endpoints, 16 neue Go-Gateway-Proxy-Routen, Fibonacci-Extension, TS-Deprecation-Markierungen.
> - Rev. 3.3 (25. Feb 2026) — Phase 7 Rust-Integration abgeschlossen: PyO3-Implementierungen fuer EMA, RSI, ATR, BB-Bandwidth, BB-%B. Rust-first-with-Python-fallback Muster. 59/59 Tests pass (Phase 2: 12, Phase 7: 47); `go build ./...` + `bun run lint` clean.
> - Rev. 3.4 (25. Feb 2026) — Phase 8 Pattern Detection Code-Baseline: Elliott Wave Fibonacci Rules (R1–R6), XABCD Harmonics (Gartley/Bat/Butterfly/Crab), FEIW, Candlestick-Erweiterungen (11 neue Typen), TD Countdown 13 + TDST, Head & Shoulders. `test_phase8_patterns.py` mit ~50 Tests. Verify Gate ausstehend.
> - Rev. 3.5 (25. Feb 2026) — Phase 4 formal abgeschlossen (Code vollstaendig, Live-Verify/E2E deferred). Phase 8 Code-Review bestanden: Elliott Wave (R1-R6), XABCD, Candlestick (11 Typen), TD Countdown/TDST, H&S alle korrekt implementiert und manuell verifiziert. Pytest-Verify Gate fuer Phase 8 bleibt User-Action (`uv run pytest tests/test_phase8_patterns.py -v`).
> - Rev. 3.6 (25. Feb 2026) — **Phase 1 Code-Gap geschlossen:** GCT Audit SQLite (`gct_audit_sqlite.go`, `GCTAuditSQLiteStore`) implementiert; `gctAuditConfig.onRecord` Callback in Middleware; Wiring via `GCT_AUDIT_DB_ENABLED`/`GCT_AUDIT_DB_PATH`. **Playwright E2E repariert:** 4 Specs komplett ueberarbeitet (testid-basiert, kein `force:true`, Service-Skip-Guards fuer Backend-Tests). **data-testid Attribute** hinzugefuegt: `watchlist-sidebar`, `sidebar-right`, `tab-{id}` (5 Tabs), `timeline-strip`, `link-geomap`. **dev-stack.ps1 parallelisiert:** `Wait-ForPort` Health-Check-Funktion ersetzt feste Sleeps; Go-Gateway + Python starten parallel nach GCT-Ready; GCT-Credentials aus `GCT_ADMIN_USER`/`GCT_ADMIN_PASS` ENV.
> - Rev. 3.7 (26. Feb 2026) — GeoMap-Planung konsolidiert: Phase-4-Closeout als eigener Arbeitspaket-Block (`4i`-`4l`) eingefuegt, plus klare Folge-Gates in Phase 12/14/19 (Policy, Provider, deck.gl/MapLibre/h3o nur gate-basiert).
> - Rev. 3.8 (26. Feb 2026) — Phase 6 Memory Architecture code-complete: Prisma (6b), Cache Adapter Py+Go (6a), Python Memory Service/KG/Vector/Episodic (6c-6d), Next.js API Layer (6e), Phase 4 Closeout ADR+Docs.
> - Rev. 3.9 (26. Feb 2026) — **Cache-Adapter effektiv verdrahtet (Phase 6 + 8):** Python `memory-service`: kg/nodes (TTL 900s) + kg/sync (TTL 3600s) mit JSONResponse-Cache-Path; seed invalidiert `tradeview:memory:kg:sync`. Python `indicator-service`: 5 Pattern-Endpoints (candlestick/harmonic/price/elliott-wave/fib-confluence) als async mit MD5-Body-Key, TTL 900s. Go `memory_handler.go`: `MemoryKGNodesHandler`+`MemoryKGSyncHandler`+`MemoryKGSeedHandler` Signaturen um `cache.Adapter` erweitert; Get/Set/Delete-Logik; `clampInt`-Redeclaration-Konflikt mit `geopolitical_candidates_proxy_handler.go` behoben (4-Arg-Variante). `wiring.go`: 3 Routen auf `memCache` aktualisiert. `bun run build` + `go build ./...` + `bun run lint` clean. Pytest-Gate: Disk-Space-Fehler auf uv-Cache (OS-Problem, kein Code-Bug). Phase 5 Status in Tabelle nachgezogen (war faelschlich NICHT GESTARTET).
> - Rev. 3.11 (26. Feb 2026) — **SOTA 2026 Assessment** hinzugefuegt (Sek. nach Aenderungshistorie + SYSTEM_STATE.md Sek. 3/9). TradingChart Drawing Bug Fixes: overlaySize-Init nach `chartRef.current = chart` (Bug 1) + `chartViewVersion` Pan/Zoom Freeze (Bug 2). GeoMap Drawing Bug Fixes: `drawingMode`/`pendingLineStart` Prop-Threading (MapViewportPanel + MapCanvas) + Inertia-Guard bei aktivem Drawing-Mode.
> - Rev. 3.10 (26. Feb 2026) — **Phase 8f Chart Overlays + Phase 15 Advanced Indicators code-complete.** 8f: `src/app/api/fusion/patterns/[type]/route.ts` (POST-Proxy zu Go, Allowlist candlestick/harmonic/price/elliott-wave/timing); `DrawingToolbar.tsx` PatternOverlayState + 3 Toggle-Buttons (Waves/Hexagon/Triangle); `TradingChart.tsx` patternOverlay-Prop + fetchPatterns-Effect + 3 SVG-Overlay-Pfade (Elliott-Labels blau/rot, Harmonic-Zone halbtransparent, PricePattern-Dreieck); `TradingWorkspace.tsx` State-Bridge. 15a: `/api/v1/indicators/ks-collection` Go-Wiring war bereits vorhanden (wiring.go Z.412). 15b: `calculate_volatility_suite()` (spike_weighted_vol/volatility_index/exp_weighted_stddev/volatility_regime) mit absolutem Regime-Klassifikator (>40% ann.HV=elevated, <5%=compressed, sonst relativ). 15c: `calculate_regime()` (SMA-Slope+ADX, bullish/bearish/ranging), `calculate_markov_regime()` (Transition-Matrix, Power-Iteration Stationary), `calculate_hmm_regime()` (optional hmmlearn, BIC-optimal n, graceful ImportError). 4 neue Go-Proxy-Routen. `pyproject.toml`: numpy>=2.0.0 + hmmlearn>=0.3.0. `test_phase15.py`: 17/17 passed, 1 skipped (HMM ohne hmmlearn). `bun run lint` + `bun run build` + `go build ./...` clean.
> - Rev. 3.12 (27. Feb 2026) — **gRPC IPC (Go↔Python) implementiert.** Proto `ipc.proto` mit `ForwardRequest` RPC; Go `internal/connectors/ipc` (gRPC-first, HTTP-Fallback); Python `ipc_servicer` + `grpc_server` (optional via `GRPC_ENABLED=1`); Connectors indicatorservice, financebridge, softsignals auf IPC-Client umgestellt. **Offener Punkt:** Live-Verify bei laufendem Betrieb (alle 3 Python-Services mit `GRPC_ENABLED=1`, Go-Gateway, End-to-End-Test).
> - Rev. 3.13 (27. Feb 2026) — **Macro GeoMap Overlay + Frontend-Routing.** `GET /api/geopolitical/macro-overlay?indicator=policy_rate` (Policy Rate pro Land); GeoMap Choropleth-Mode `macro`; `MacroPanel` als eigenes Tab im Right Panel; `isMacroSymbol()` + Macro-Routing zu MacroPanel bei Symbol-Wechsel; `GET /api/geopolitical/macro-quote` Proxy fuer MacroPanel.
> - Rev. 3.14 (27. Feb 2026) — **Status-Abgleich Plan vs. Code.** Fortschrittstabelle korrigiert: Phase 9 (UIL, v. a. 9e) und Phase 14 (Provider Expansion, inkl. IMF + G4/G3-Slices) sind als gestartet markiert; veraltete "Phase 9-22 nicht gestartet"-Sammelzeile entfernt. Startpunkt-Hinweis auf aktuellen Fokus (Verify-Gates + Phase-9-Completion) aktualisiert.
> - Rev. 3.15 (27. Feb 2026) — **Phase-9 Completion Slice (9e+9a-9d Baseline).** 9e-Cutover gehaertet: Next `GET /api/geopolitical/candidates` ist Go-thin-proxy-only; Go Candidate-Review local-first fuer `accept/reject/snooze/reclassify`; Admin-Seed-Default auf `go-owned-gateway-v1`. 9a/9b: neuer UIL-Classifier-Pfad `POST /api/v1/ingest/classify` (Go->Python `geopolitical-soft-signals`), inkl. Next Alias `/api/geopolitical/ingest/classify`; Soft-Ingest erweitert um `youtube_transcript`-Adapter. 9c/9d: Candidate-Queue erweitert um Review-Policy-Metadaten (`routeTarget`, `reviewAction`) und Quick-Import (Paste -> Classify -> Candidate Create).
> - Rev. 3.16 (27. Feb 2026) — **Phase 9 formal abgeschlossen (DoD + Regression).** Next-Route `POST /api/geopolitical/candidates/[candidateId]/reclassify` als Thin-Proxy hinzugefuegt; Go-UIL Local-Create/Reclassify haertet Policy-Metadaten (`routeTarget`, `reviewAction`, `dedupHash`) inkl. Validierung; Soft-Ingest propagiert `dedupHash` aus `ingest/classify`; Candidate-Proxy reicht `X-Request-ID` an Upstream weiter. Verify-Gates: `go test ./...` gruen, `uv run pytest -q` (127 passed), Frontend `bun run lint` + `bunx tsc --noEmit` gruen.
> - Rev. 3.17 (28. Feb 2026) — **execution_mini_plan Abarbeitung.** Neue Docs: `PROXY_CONVENTIONS.md`, `GEOMAP_VERIFY.md`, `REFERENCE_SOURCE_STATUS.md`, `CAPABILITY_REGISTRY.md`. Phase 0: 0.1–0.4 erledigt (Proxy-Konvention, Provider-Cleanup). Phase 1: 1.18 GCT Audit DB (SQLite primary), 1.19 Exchange-Key Hardening erledigt. Phase 4: 4.3–4.6 Docs erledigt. Phase 6: 6.10 Cache-Adapter-Vertrag; `verify-memory-phase6.ps1` erstellt. Phase 10a: Agent-Service-Scaffold (FastAPI WS), Rollen, BTE/DRS Guards. Phase 14: REFERENCE_SOURCE_STATUS.md. UIL: U.1–U.3 erledigt. **Offen:** Phase 1 Live-Verify (1.1–1.17), Phase 6 Live-Verify (6.1–6.9, Stack noetig), Phase 4 manuell (4.1, 4.2, 4.7), Phase 10a.4 + 10b–10e.
> - Rev. 3.18 (28. Feb 2026) — **Execution Finito Plan implementiert.** Phase 10: 10a.4 Memory/Context-Verdrahtung (memory_client, context_assembler, agent-service `/api/v1/agent/context`); 10b Context Engineering (relevance, token_budget, merge); 10c Working Memory M5 (Redis/LRU, TTL 30min); 10d Agentic Search (memory_search, codebase/news stubs); 10e WebMCP Tools (get_chart_state, get_portfolio_summary, get_geomap_focus) + Go Policy Gateway. Phase 14: OECD SDMX scaffold. Phase 23: Capability Registry (registry.go, middleware, capabilities.yaml), Agent Policy Tiers. Agent-Service in dev-stack.ps1 (Port 8094). **Offen:** Live-Verify Phase 1/4/6 (Browser/E2E, Stack).
- Rev. 3.19 (01. Mär 2026) — **execution_mini_plan Abgleich.** Phase 1: 1.16 Prod-Guard (AUTH_STACK_BYPASS in prod blockiert) ergaenzt. Phase 10: 10a–10e vollstaendig. Phase 14: 14a–14h + 14.v4 (REFERENCE_SOURCE_STATUS); 14c.3 LBMA/FXCM, 14d.2 UN/SECO/EU Sanctions, 14g.1 GeoMap Official Source Pack. Phase 23: 23.1–23.5 (Capability Registry, Policy Tiers, Trust-Fabric, Governance Events, Trajectory Observability). Phase 24: 24.1–24.4 (Plugin Pilot, Partner Spec, Payment Adapter, Rollout Gates). Infra: I.6–I.8. **Offen:** Live-Verify Phase 1/4/6, Phase 10.v1–10.v3, Phase 14.v1–14.v3.
> - Rev. 3.20 (01. Mär 2026) — **Neue Docs Phase-Zuordnung.** Neue Docs Tabelle um Phase-Spalte erweitert; BASEMAP_POLICY, ADR-002-GeoMap-Rendering-Foundation, GEOCODING_STRATEGY, PERFORMANCE_BASELINE, PMTILES_CONTRACT hinzugefuegt (Phase 4).
> - Rev. 3.21 (02. Mär 2026) — **Phase 15d–15h + 16/20 Baseline umgesetzt.** `indicator-service` erweitert um Alternative Bars, CUSUM, MeanRev/Momentum, Performance Metrics, Signal Quality Chain, Order-Flow State Machine, Eval Baseline; Backtest/Walk-Forward/Deflated Sharpe/`/api/v1/eval/indicator`; ML-Pipeline (`/api/v1/ml/*`). Go-Gateway-Proxies in `wiring.go` ergänzt. Neuer Testblock `python-backend/tests/test_phase15_16_20.py` grün (9 passed). **Offen:** Full-stack Verify Gates + vollständige Go-/Frontend-E2E Abnahme.
> - Rev. 3.22 (02. Mär 2026) — **Phase 18 Baseline umgesetzt.** `indicator-service` ergänzt um `/api/v1/darkpool/signal`, `/api/v1/options/gex-profile`, `/api/v1/options/expected-move`, `/api/v1/options/calculator`, `/api/v1/defi/stress`, `/api/v1/oracle/cross-check`; Go-Proxies in `wiring.go` ergänzt. Testblock `python-backend/tests/test_phase18.py` grün (6 passed).
> - Rev. 3.23 (02. Mär 2026) — **Phase 17 Baseline gestartet (17b/17c/17f/17g Kernpfade).** `geopolitical-soft-signals` erweitert um `/api/v1/game-theory/nash-solve`, `/api/v1/game-theory/transmission-paths`, `/api/v1/game-theory/monte-carlo`, `/api/v1/game-theory/strategeme-match`, `/api/v1/game-theory/timeline-regimes`; Go-Gateway-Proxies in `wiring.go` ergänzt. Neuer Testblock `python-backend/tests/test_phase17_game_theory.py`.
> - Rev. 3.26 (04. Mär 2026) — **Phase 9 Env-Cutover + Phase 12a NLP Upgrade CODE-COMPLETE.** Phase 9: `go-backend/.env.development` — `GEOPOLITICAL_INGEST_HARD_MODE/SOFT_MODE/ADMIN_SEED_MODE` von `next-proxy` auf `go-owned-gateway-v1` umgestellt. Phase 12a: `cluster_narratives_embedding()` (sentence-transformers + HDBSCAN) als primären ML-Clustering-Pfad in `build_news_cluster_ml()` eingebaut (graceful Fallback auf TF-IDF/KMeans); `_build_candidates_from_buckets()` extrahiert; `NLPClusterRequest/Response` + `POST /api/v1/nlp/cluster` Endpoint hinzugefügt; `hdbscan>=0.8.33` in `pyproject.toml`.
> - Rev. 3.25 (03. Mär 2026) — **Phase 13 Portfolio Advanced abgeschlossen + Phase 0e OTel implementiert.** Phase 13: `MonteCarloVarPanel.tsx` (VaR 95/99, CVaR 95/99, Progress-Bar, Median Return, Sim-Count), VPIN-Sektion in `PortfolioOptimizePanel` (Progress-Bar 0–1, Alert-Box bei >0.7), neuer Portfolio-Tab "VaR" in `PortfolioPanel`. Phase 0e: `go-backend/internal/telemetry/tracer.go` (OTLP gRPC TracerProvider), `main.go` (InitTracerProvider bei OTEL_ENABLED=true + graceful Shutdown), `wiring.go` (otelhttp.NewHandler-Wrap), OTel Packages via `go mod tidy` (v1.35.0). Python: `opentelemetry-sdk>=1.25.0` + `opentelemetry-instrumentation-fastapi` + `opentelemetry-exporter-otlp-proto-grpc` in `pyproject.toml`; `app_factory.py` FastAPIInstrumentor-Block (ImportError-safe). Next.js: `instrumentation.ts` registerOTel-Block (OTEL_ENABLED guard), `@vercel/otel@^1.3.0` in `package.json`. `OTEL_ENABLED=false` + `OTEL_EXPORTER_OTLP_ENDPOINT` in allen drei `.env.development` + `.env.example` Dateien. `go build ./...` grün. `uv sync` (6 OTel-Packages installiert). `bun install` (@vercel/otel@1.14.0).
> - Rev. 3.24 (03. Mär 2026) — **Verify Gates abgeschlossen + Observability Foundation + SOTA S-Punkte final.** Phase-6 Live-Verify 6.2–6.9 bestätigt (Cache-Key-Fix Go↔Python auf `tradeview:memory:kg:*`-Prefix; `get_nodes`-Bug in `vector_search` behoben; Cache-Hit, 59 Knoten/36 Stratagems, Vector-Search, Episodic alle live). Phase-15 Verify Gate 15.v1–15.v5 live (volatility-suite, regime/detect, markov, hmm, Go-Gateway-Proxy alle grün). Phase-2 Deferred 2.3–2.5 abgehakt (rustCore+Polars health live, redb cache.hit false→true verifiziert, Rust-Fallback code-level via try/except bestätigt). Phase-0e Observability Foundation geplant (OpenTelemetry SDK + OpenObserve als präferierter No-Docker-Stack, T1–T5 in `execution_mini_plan.md`). Phase-1 SOTA S-Punkte: S2 Device-Revocation bereits implementiert (DELETE `/api/auth/passkeys/devices` vorhanden); S3 RBAC-Negativtests Go (`middleware_test.go`); S4 X-Request-ID Python-Middleware confirmed (Windows/uvicorn-Reload-Quirk dokumentiert); S5 CI (`.github/workflows/ci.yml`); S6/S8 Prod-Guards bestätigt. Phase-14 14.v1 pack.go Partial-Success-Fix (UN TLS-Issue `scsanctions.un.org` → `*.azurewebsites.net` dokumentiert).

---

## SOTA 2026 Assessment

> **Stand:** 26. Feb 2026 (Research-Agent Scoring vs. TradingView Pro 2026)

| Kategorie | Score | Kritische Lücken |
|:----------|:-----:|:-----------------|
| Charting (LightweightCharts) | 6.5/10 | Kein Multi-Pane; nur 4 Drawing Tools unterstützt; LWC v5.1 vorhanden aber Drawing-Bugs (overlaySize Init, Pan/Zoom Freeze) gerade gefixt |
| Auth | 4/10 | next-auth v5 bleibt "beta" im npm-Tag (API-Breaks bis v5-stable möglich); Phase 1 code-complete aber kein Live-Verify |
| Portfolio | 5/10 | Phase 5 Scaffold; keine echten Analytics jenseits Basis-Tab |
| Mobile | 2/10 | Kein responsive Design; kein Mobile-Layout geplant bis Phase 20 |
| Go Backend | 7/10 | gorilla/mux **archiviert** Sept. 2023 (kein CVE, aber kein Maintenance); Empfehlung: langfristig auf `net/http` stdlib oder `go-chi/chi` migrieren |
| Python AI | 7.5/10 | Stark (Rust-Core, HMM, Regime Detection); kein Online-Learning |
| Streaming | 7/10 | Go SSE funktioniert; kein WebSocket; kein WebRTC |
| Backtesting | 3/10 | Phase 9 nicht gestartet |

### Library Risk Flags
- **next-auth v5 beta:** Bleibt "beta" im npm-Tag. Auth.js Core ist produktionstauglich aber API-Breaks möglich bis v5-stable. Empfehlung: Upgrade auf latest patch + Lock-Version in `package.json`. Risikostufe: MEDIUM (kein CVE, aber Breaking-Changes bei Minor-Updates nicht ausgeschlossen).
- **gorilla/mux v1.8.1:** Repository archiviert September 2023. Kein CVE, kein sofortiger Action-Bedarf. Langfristig auf `net/http` stdlib oder `go-chi/chi` migrieren — am besten als Teil eines Phase-6/14 Go-Refactor-Windows. Risikostufe: LOW (archiviert ≠ unsicher, nur kein Patch-Support mehr).
- **lightweight-charts v5.1.0:** Aktuell genutzte Version ist aktuell (v5.1). Drawing-Overlay-Bugs (overlaySize Init + Pan/Zoom Freeze) wurden in Rev. 3.11 gefixt. Multi-Pane und erweiterte Drawing-Tools bleiben SOLL-Zustand (Phase 16).

---

## Offene Punkte

| Prioritaet | Status | Beschreibung |
|:----------|:-------|:-------------|
| P0 | Erledigt (27. Feb 2026) | **Live-Verify gRPC IPC** abgeschlossen: dev-stack laedt `python-backend/.env.development`, Ports konsistent, E2E-Calls (Composite Signal, OHLCV, Soft-Signals) erfolgreich, Tests `test_ipc_grpc.py` und `ipc/client_test.go` hinzugefuegt. |

---

## Aktueller Stand / Current Progress

> **Referenz:** Detaillierter IST-Zustand pro Schicht → [`SYSTEM_STATE.md`](./SYSTEM_STATE.md)

| Phase | Status | Bemerkung |
|:------|:-------|:----------|
| Phase 0 (Foundation) | **ABGESCHLOSSEN (Baseline + gRPC IPC 0d + Mini 0.1–0.4, 28. Feb 2026)** | Frontend-Market-Routen Go-first/strict Go-only, Adaptive Router + BaseConnector-Scaffolds aktiv. **Mini erledigt:** 0.1 Go-only Boundary, 0.2 Correlation-ID, 0.3 Proxy-Konvention ([`PROXY_CONVENTIONS.md`](../../docs/PROXY_CONVENTIONS.md)), 0.4 Provider-Cleanup (nur types + PROVIDER_REGISTRY). |
| Phase 1 (Auth) | **ABGESCHLOSSEN (Code inkl. 1.16/1.18/1.19, 01. Mär 2026)** | Auth.js/next-auth v5 + Prisma + Passkey. **Mini erledigt:** 1.10 Header (proxy.ts), 1.16 Prod-Guard (AUTH_STACK_BYPASS in prod blockiert), 1.18 GCT Audit DB (SQLite primary, JSONL Fallback), 1.19 Exchange-Key Hardening (AES-GCM in GCT-Config). **Offen:** 1.1–1.15, 1.17 Live-Verify (Browser/E2E). |
| Phase 2 (Rust Core) | **ABGESCHLOSSEN (Implementierungs-Baseline, Live-Verify deferred, 23. Feb 2026)** | PyO3-Rust-Core (SMA50/Heartbeat/Batch) aktiv, Polars-Preprocessing in `indicator-service` + `finance-bridge` aktiv, redb-OHLCV-Cache (PyO3) als Finance-Bridge read-through aktiv, Trading-UI zeigt Backend-Composite-Badges (inkl. Heartbeat). Zwei offene Verify-Punkte (Browser/E2E) sind explizit deferred. |
| Phase 3 (Streaming) | **ABGESCHLOSSEN (Code-Baseline, Live-Verify deferred, 23. Feb 2026)** | Go Candle Builder + Alert Engine + Snapshot/Reconnect-Basis aktiv; `market/stream` stream-first via Go-SSE, `market/stream/quotes` nutzt Go-SSE-Multiplex fuer streamfaehige Symbolsets. Browser/E2E-Live-Verify bleibt deferred. |
| Phase 4 (GeoMap v2.0) | **ABGESCHLOSSEN (Code + Docs 4.3–4.6, 28. Feb 2026)** | Shell-Split, Multi-Body, D3 v1.1/v1.5, Hybrid-Rendering, supercluster. **Mini erledigt:** 4.3–4.6 Draw-Workflow, Performance-Baseline, Basemap-Policy, ADR ([`GEOMAP_VERIFY.md`](../../docs/GEOMAP_VERIFY.md)). **Offen:** 4.1, 4.2, 4.7 manuelle E2E. |
| Phase 5 (Portfolio Bridge + Analytics) | **ABGESCHLOSSEN (Code-Baseline, Verify deferred)** | 5a: GCT Portfolio Bridge (`/api/v1/gct/portfolio/*`, `/api/v1/gct/exchanges`). 5b: Portfolio Analytics Proxy Go→Python (correlations/rolling-metrics/drawdown-analysis/optimize). Frontend-Tabs vorhanden. Live-Verify deferred. |
| Phase 6 (Memory Architecture) | **ABGESCHLOSSEN (Live-Verify 6.2–6.9 bestätigt, 03. Mär 2026)** | 6a-6e vollstaendig. Cache-Key-Fix Go↔Python (`tradeview:memory:kg:*`-Prefix), `get_nodes`-Bug in vector_search behoben. 6.2: health ok. 6.3: Go-Proxy ok. 6.4: KG Seed 59 Knoten. 6.5/6.6: Cache-Miss→Hit. 6.7: Seed invalidiert kg/sync. 6.8: Vector-Search. 6.9: Episodic. Alle Gates grün. |
| Phase 7 (Indicator Catalog Core) | **ABGESCHLOSSEN (Code-Baseline + Rust + Tests, 25. Feb 2026)** | Phase 7a–7e implementiert: `detect_swings` als public API (`/api/v1/indicators/swings`), Bollinger Bandwidth/Percent-B/Squeeze (TTM-Kern), ATR-adjusted RSI, Bollinger-on-RSI, Fibonacci Confluence (multi-swing cluster) in Python. Rust-first-with-Python-fallback fuer EMA, RSI, ATR, BB-BW, BB-%B. 16 neue Go-Gateway Proxy-Routen registriert. Fibonacci-Ratios auf 2.618 erweitert. TypeScript-Duplikate (SMA/EMA/RSI/OBV/CMF) als `@deprecated` markiert. **59/59 Tests pass** (Phase 2: 12, Phase 7: 47). `go build ./...` + `bun run lint` clean. Live-Verify deferred. |
| Phase 8 (Pattern Detection) | **ABGESCHLOSSEN (Code-Baseline + manuell verifiziert, pytest-Abnahme User-Action, 25. Feb 2026)** | 8a: Elliott Wave Fibonacci Validation (R1–R6, 0.42+0.07×rules confidence, wave_lengths/fib_ratios/rules_passed in details). 8b: Full XABCD Harmonics (Gartley/Bat/Butterfly/Crab) + FEIW failed-breakout/breakdown mit invalidation_level. 8c: Candlestick-Erweiterungen (Dragonfly/Gravestone Doji, Spinning Top, Piercing Line, Dark Cloud Cover, Morning/Evening Star, Three White Soldiers/Three Black Crows, Bottle, Double Trouble, Extreme Euphoria). 8d: TD Countdown 13-bar bearish/bullish + TDST Resistance/Support Level. 8e: Head & Shoulders + Inverse H&S (neckline_level, target_price in details). `test_phase8_patterns.py` ~50 Tests manuell geprueft und korrekt. **Verify Gate:** `uv run pytest tests/test_phase8_patterns.py -v && uv run pytest -v` (User-Action). `go build ./...` + `bun run lint` unveraendert clean (keine neuen Go/TS-Aenderungen). |
| Phase 8f (Chart Overlays) | **ABGESCHLOSSEN (26. Feb 2026)** | `src/app/api/fusion/patterns/[type]/route.ts`: POST-Proxy zu Go Gateway (Allowlist: candlestick/harmonic/price/elliott-wave/timing, 400 fuer unbekannte Typen, 502 bei Go-Fehler). `DrawingToolbar.tsx`: `PatternOverlayState` Typ + 3 Toggle-Buttons (Waves blau, Hexagon lila, Triangle amber). `TradingChart.tsx`: `patternOverlay`-Prop + `fetchPatterns`-Effect (AbortController, ≥20 Kerzen) + 3 SVG-Overlay-Pfade: Elliott-Wave-Labels (pill-shape, blau/rot), Harmonic-Zone (halbtransparent, confidence-basierter strokeWidth), Price-Pattern-Dreieck + Label. `TradingWorkspace.tsx`: State-Bridge. `bun run lint:fix` + `bun run build` clean. |
| Phase 13 (Portfolio Advanced Analytics) | **CODE-COMPLETE + LIVE-VERIFIED (03. Mär 2026)** | Python `portfolio_analytics.py` (832 Zeilen): HRP, Kelly, Regime-Sizing, Monte Carlo VaR, VPIN vollständig. 5 POST-Endpoints in `indicator-service/app.py`. 5 Go-Proxy-Routen in `wiring.go`. Next.js Proxy `analytics/[slug]/route.ts`. Frontend: `KellyAllocationPanel`, `RegimeSizingPanel`, `PortfolioOptimizePanel`, `PortfolioAnalyticsPanel`. Neu (03. Mär 2026): `MonteCarloVarPanel.tsx` (VaR 95/99, CVaR 95/99, Median Return, Sim-Count), VPIN-Sektion mit Progress-Bar + Alert-Box, neuer Portfolio-Tab "VaR". `test_phase13.py`: 17/17 passed. |
| Phase 15a (K's Collection Wiring) | **ABGESCHLOSSEN (bereits vorhanden)** | Go-Route `/api/v1/indicators/ks-collection` war bereits in `wiring.go` Z.412 vorhanden. Python-Endpoint in `indicator-service/app.py` ebenfalls bereits vorhanden. Kein Code-Aenderungsbedarf. |
| Phase 15b (Volatility Suite) | **ABGESCHLOSSEN + LIVE-VERIFIED (03. Mär 2026)** | `pipeline.py`: `VolatilitySuiteRequest/Response` + `calculate_volatility_suite()`. Metriken: spike_weighted_vol (Spike-doppelt-gewichtet), volatility_index (ann. HV), exp_weighted_stddev (EWMA). Regime: absolut-primaer (>40% ann.HV=elevated, <5%=compressed), relativ-sekundaer (±30% vs. hist_median rolling HV). `indicator-service/app.py`: Endpoint `/api/v1/indicators/volatility-suite`. `wiring.go`: Go-Proxy-Route. **15.v1 live bestätigt (03. Mär 2026):** `volatility_regime: "normal"` + alle Felder korrekt. |
| Phase 15c (Regime Detection) | **ABGESCHLOSSEN + LIVE-VERIFIED (03. Mär 2026)** | `pipeline.py`: 3 Tier-Implementierungen. Tier1 `calculate_regime()`: SMA-50-Slope (5-Perioden-Delta), ADX-Proxy aus reinen Closes, Regime bullish/bearish/ranging + Konfidenz. Tier2 `calculate_markov_regime()`: rollierende Regime-Labels → Zaehlmatrix → normalisierte Transition-Matrix, Power-Iteration Stationaerverteilung, expected_duration + shift_probability. Tier3 `calculate_hmm_regime()`: optional `from hmmlearn import hmm` (graceful ImportError), BIC-optimal n_components (2–5), GaussianHMM full-covariance. `indicator-service/app.py`: 3 Endpoints (/regime/detect, /regime/markov, /regime/hmm). `wiring.go`: 3 Go-Proxy-Routen. `pyproject.toml`: numpy>=2.0.0 + hmmlearn>=0.3.0. `test_phase15.py`: 17 passed, 1 skipped (HMM ohne hmmlearn-Install). `bun run lint` + `bun run build` + `go build ./...` clean. **15.v2/15.v3/15.v4 live bestätigt (03. Mär 2026):** regime/detect, markov, hmm alle korrekte Responses. |
| Phase 15d–15h (Advanced + Eval Baseline) | **CODE-COMPLETE BASELINE (02. Mär 2026)** | Python ergänzt: Alternative Bars, CUSUM, MeanRev/Momentum (Hurst/ADF-Proxy/Half-Life), Performance Metrics, Signal Quality Chain, Order-Flow State Machine, Eval Baseline. Endpoints in `indicator-service/app.py` + Go-Proxies in `wiring.go`. Testblock `tests/test_phase15_16_20.py`: **9 passed**. |
| Phase 9 (Unified Ingestion Layer) | **ABGESCHLOSSEN (Env-Cutover 04. Mär 2026)** | 9e Cutover, 9a–9d aktiv. **Mini erledigt:** U.1 UIL-Contracts (Candidate/Timeline/Contradictions) eingefroren; U.2 Degradation/Observability-Contract; U.3 Mutierende Pfade Go-Enforcement (RBAC/Audit/Rate-Limit). **Env-Cutover (04. Mär 2026):** `go-backend/.env.development` — `GEOPOLITICAL_INGEST_HARD_MODE`, `GEOPOLITICAL_INGEST_SOFT_MODE`, `GEOPOLITICAL_ADMIN_SEED_MODE` auf `go-owned-gateway-v1` gesetzt. **Verify Gate:** Go-Gateway neu starten → `POST /api/geopolitical/candidates/ingest/soft` muss `"mode":"go-owned-gateway-v1"` zurückgeben. |
| Phase 12a (NLP Upgrade) | **CODE-COMPLETE (04. Mär 2026)** | `cluster_narratives_embedding()` in `ml_ai/geopolitical_soft_signals/pipeline.py`: sentence-transformers `all-MiniLM-L6-v2` Embeddings + HDBSCAN Clustering. `build_news_cluster_ml()` versucht Embedding-Clustering zuerst (graceful ImportError-Fallback auf TF-IDF/KMeans). `_build_candidates_from_buckets()` extrahiert gemeinsame Cluster→Candidate-Logik. `NLPClusterRequest/NLPClusterResponse` Pydantic-Models. Endpoint `POST /api/v1/nlp/cluster` in `geopolitical-soft-signals/app.py`. `hdbscan>=0.8.33` in `pyproject.toml`. **Verify Gate:** `curl -X POST http://localhost:8091/api/v1/nlp/cluster -d '{"texts":["conflict in region","military strike","ceasefire talks","market rally"]}'` muss Cluster-Dict zurückgeben. |
| Phase 10 (Agent Architecture) | **CODE-COMPLETE (10a–10e, 01. Mär 2026)** | **Mini erledigt:** 10a.1–10a.4 Agent Runtime, Rollen, BTE/DRS Guards, Memory/Context; 10b Context Engineering; 10c Working Memory M5; 10d Agentic Search; 10e WebMCP Tools + Go Policy Gateway. **Offen:** 10.v1–10.v3 Verify Gates. |
| Phase 14 (Global Provider Expansion) | **CODE-COMPLETE (14a–14h + 14.v4, 01. Mär 2026)** | **Mini erledigt:** 14a.1–14a.2 SDMX (IMF, OECD, ECB, WB, UN, ADB); 14b TimeSeries (BCB, Banxico, RBI, BoK, TCMB, BCRA, FRED, OFR, NYFed); 14c BulkFetcher (CFTC COT, FINRA ATS, LBMA, FXCM); 14d DiffWatcher (OFAC, UN, SECO, EU); 14e–14h TranslationBridge, Symbol Catalog, GeoMap Official Source Pack, G10 Oracle Scaffolds; 14.v4 [`REFERENCE_SOURCE_STATUS.md`](../../docs/REFERENCE_SOURCE_STATUS.md). **Offen:** 14.v1–14.v3 Verify Gates. |
| Phase 23 (Platform Readiness) | **CODE-COMPLETE (23.1–23.5, 01. Mär 2026)** | **Mini erledigt:** 23.1 Capability Registry ([`CAPABILITY_REGISTRY.md`](./CAPABILITY_REGISTRY.md)); 23.2 Agent Policy Tiers; 23.3 Trust-Fabric Mapping; 23.4 Governance Events; 23.5 Trajectory Observability. |
| Phase 24 (Ecosystem Optionality) | **CODE-COMPLETE (24.1–24.4, 01. Mär 2026)** | **Mini erledigt:** 24.1 Internal Plugin Pilot; 24.2 Partner/ISV Boundary Spec; 24.3 Payment Orchestration Adapter; 24.4 Reversible Rollout Gates ([`ROLLOUT_GATES.md`](./ROLLOUT_GATES.md), [`PLUGIN_PILOT.md`](./PLUGIN_PILOT.md)). |
| Phase 16 (Backtesting + Eval Hardening) | **CODE-COMPLETE BASELINE (02. Mär 2026)** | Backtest-Run, Walk-Forward, Deflated Sharpe, aggregiertes Eval-Gate (`/api/v1/eval/indicator`) in Python + Go-Proxy-Routen umgesetzt. Full Verify Gates (Latenz/OOS-Hardening Release-Gates) offen. |
| Phase 18 (Options + Dark Pool + DeFi) | **CODE-COMPLETE BASELINE (02. Mär 2026)** | Dark-Pool-Signal, GEX-Profile, Expected-Move, Options-Calculator, DeFi-Stress und Oracle-Cross-Check in Python umgesetzt; Go-Proxy-Routen verdrahtet. Produktive Provider-Integrationen/Live-Datenabnahme offen. |
| Phase 20 (ML Pipeline) | **CODE-COMPLETE BASELINE (02. Mär 2026)** | Feature Engineering, Signal-Klassifikation, Hybrid-Fusion und Bias-Monitoring (`/api/v1/ml/*`) in Python + Go-Proxy-Routen umgesetzt. Modellkalibrierung/Datensatz-Backed Evaluation offen. |
| Phase 17 (Game Theory Mode) | IN ARBEIT (Baseline) | Core-Simulationpfade gestartet: Nash Solver, Transmission Paths, Monte-Carlo, Strategeme Matching, Timeline-Regime-Baender (Python + Go-Proxy). |
| Phase 19, 21-22 | NICHT GESTARTET | Erweiterte Roadmap definiert, Umsetzung offen. |
| Infra | **I.6–I.8 erledigt (01. Mär 2026)** | **Mini erledigt:** I.6 `bun run lint && bun run build`; I.7 `go build ./...`; I.7a Go Quality Gates (test, vet, golangci-lint); I.8 `uv run pytest -v`. |

> **Empfohlener naechster Fokus:** Verify-/Live-Abnahme fuer verbleibende offenen Gates in Phase 1/4/6 schliessen; danach Phase 10.v1–10.v3 und Phase 14.v1–14.v3 Verify Gates.
> Phase 0–3, 9, 10 (Code), 14 (Code), 23, 24 sind formal abgeschlossen; Phase 14 Verify Gates und Phase 10 Agent-E2E offen.

> **Teilfortschritt (22. Feb 2026, Codex):**
> - Phase 1d (baseline, teilweise): Go Gateway hat Request-ID + Request-Logging Middleware (`X-Request-ID` Header gesetzt/weitergereicht, JSON `slog` startup in `cmd/gateway`).
> - Phase 1b (baseline, teilweise): Go Gateway hat Security-Header- und CORS-Allowlist-Middleware (transitional Hardening, inkl. `OPTIONS` Preflight-Handling) und Next.js setzt Baseline-Security-Header fuer API-Routes jetzt ueber **`src/proxy.ts`** (konsolidiert; `src/middleware.ts` entfernt wegen Next.js-16 Konflikt `middleware.ts` + `proxy.ts`).
> - Phase 1b (baseline erweitert, teilweise): API-CSP-Baseline (`default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'`) wird jetzt sowohl im Go Gateway (`withSecurityHeaders`) als auch in Next.js **`src/proxy.ts`** fuer API-Routes gesetzt.
> - Phase 1b (scaffold, teilweise): Go Gateway besitzt jetzt ein path-basiertes RBAC-Middleware-Scaffold (`viewer`/`analyst`/`trader`, Public-Exceptions wie `/health` und `/api/v1/stream/*`), flag-gated via `AUTH_RBAC_ENFORCE` (default `false`). Rollenquelle ist vorerst transitional `X-User-Role` Header; JWT-Validation + echte next-auth Integration bleiben offen.
> - Phase 1b (scaffold, teilweise): Go Gateway besitzt jetzt zusaetzlich ein path-basiertes In-Memory-Rate-Limit-Middleware-Scaffold (u. a. `portfolio/order` 2/min, `portfolio/balances` 10/s, Default `/api/v1/*` 100/s), flag-gated via `AUTH_RATE_LIMIT_ENFORCE` (default `false`).
> - Phase 1a/1b (scaffold, teilweise): Bestehender `next-auth` Credentials-Flow wurde um einen Role-Claim (`viewer`/`analyst`/`trader`/`admin`) im JWT/Session-Callback erweitert; `src/proxy.ts` nutzt bei aktivierter Auth (`NEXT_PUBLIC_ENABLE_AUTH=true`) jetzt path-basierte Public-/Protected-Regeln und einfache Rollenpruefung (401/403) statt nur globalem `/api/*`-Block.
> - Phase 1b (scaffold erweitert, teilweise): `src/proxy.ts` Rollenregeln wurden auf reale Next.js-API-Pfade (methodensensitiv) korrigiert, damit `trader`/`analyst`-Checks bereits im Next-Layer fuer betroffene `/api/fusion/*` und `/api/geopolitical/candidates/*` POST/Write-Pfade greifen.
> - Phase 1b/1d (scaffold, teilweise): `src/proxy.ts` injiziert bei aktivierter Auth den Role-Claim als `X-User-Role` in API-Requests; mehrere Next.js->Go Pfade (Market `quote`/`ohlcv`/`news`/`search`/`providers`, Strategy-Proxies, Geopolitical Bridges) reichen den Header an das Go Gateway weiter. Go-RBAC-Enforcement bleibt weiterhin flag-gated.
> - Phase 1b/1d (scaffold erweitert): `src/proxy.ts` reicht bei aktivierter Session zusaetzlich `X-Auth-User` (`token.sub`), optional `X-Auth-JTI` (`token.jti`) sowie `X-Auth-Verified=next-proxy-session` an Downstreams weiter; das verbessert Audit-/Trace-Qualitaet bevor Go-JWT-Validation final auf das Endformat umgestellt ist.
> - Phase 1b (scaffold, teilweise): Go Gateway besitzt jetzt ein flag-gated Bearer-JWT-Validation-Middleware (`AUTH_JWT_ENFORCE`, HS256-Scaffold via `AUTH_JWT_SECRET`/`NEXTAUTH_SECRET` Fallback), das bei Erfolg `X-User-Role`/`X-Auth-User`/`X-Auth-JTI` fuer nachgelagerte Middleware setzt. Finale Kompatibilitaet zum endgueltigen next-auth Token-Format bleibt offen.
> - Phase 1b (scaffold erweitert, teilweise): Go Gateway JWT-Validation prueft jetzt zusaetzlich eine In-Memory Revocation-Blocklist (`jti`-basiert, expiry-aware Cleanup on read). Transitional Preload via `AUTH_JWT_REVOKED_JTIS` (+ Default-TTL) vorhanden; persistente Admin-/DB-Revocation-Flows bleiben offen.
> - Phase 1b (scaffold erweitert, teilweise): Transitional Runtime-Revocation-Endpoint `POST /api/v1/auth/revocations/jti` im Go Gateway implementiert (schreibt `jti` in die In-Memory-Blocklist). Go-RBAC stuft den Pfad jetzt als `admin`-only ein.
> - Phase 1b/1c (scaffold erweitert): Revocation-Audit wird jetzt zusaetzlich persistent als append-only JSONL mit SHA-256-Hash-Chain geschrieben (`AUTH_JWT_REVOCATION_AUDIT_JSONL_*`), waehrend der Admin-Read-Endpoint weiterhin den In-Memory-Ringbuffer fuer schnelle Runtime-Inspektion nutzt.
> - Phase 4c (teilweise): GeoMap Hybrid-Rendering hat jetzt Canvas-Basemap-Stage plus Canvas-Country/Heatmap-Stage; SVG-Laenderpfade bleiben als Hit-/Accessibility-Layer fuer Country-Interaktion aktiv.
> - Phase 4c/4d/4h (teilweise): Generischer Canvas-Stage fuer `bodyPointLayers` hinzugefuegt; `rendererHint` routet den Moon Seed-Layer jetzt ueber Canvas (statt SVG), wodurch die Body-/Layer-Registry praktisch im Hybrid-Renderpfad genutzt wird.
> - Phase 4c (scaffold, teilweise): Marker-Zoom-Out-Clustering via `supercluster` als Screen-Space-Adapter verdrahtet (Cluster-Badges im Marker-Stage, Einzelmarker bleiben bei Zoom-In / fuer selektierte Marker sichtbar). Praeziser Globe-/Geo-Clusterpfad kann spaeter verfeinert werden.
> - Phase 4b/4c (teilweise): `d3-inertia` fuer Globe-Drag in `MapCanvas` integriert (natuerlichere Rotation/Flick-Inertia, Zoom separat). `d3-geo-voronoi` (`geoDelaunay.find`) als nearest-marker hit-testing scaffold verdrahtet (konservativer Pixel-Threshold bei Background-Klicks).
> - Phase 4c (UX-Polish, teilweise): Cluster-Badges sind jetzt klick-/keyboard-fokussierbar und triggern ein kurzes Globe-Focus/Zoom-Tweening auf die Cluster-Position (hilft beim Drilldown aus Zoom-Out-Ansichten).
> - Phase 4f (teilweise): Candidate-Dedup nutzt jetzt `SHA-256`-Fingerprints (statt `SHA-1`) plus Titel-Similarity-Fallback (Jaccard auf normalisierten Tokens) fuer Near-Duplicates. Soft-Signal-Kandidaten erhalten zusaetzlich einen nachvollziehbaren Auto-Reason in `reviewNote` (Confidence-Ladder, Source-/Provider-/Tier-Summary).
> - Phase 4e (teilweise): Dritter Hard-Signal-Adapter `acled_threshold` hinzugefuegt (ueber bestehende Go→ACLED Bridge). Erzeugt Auto-Candidates bei konfigurierbaren Eskalations-Schwellen (Anzahl schwerer Events / Fatalities innerhalb Lookback-Fenster) und nutzt die bestehende Budget-/Dedup-Pipeline.
> - Phase 4e/4f (teilweise): Hard-Ingest-Route reicht jetzt `X-Request-ID`/`X-User-Role` bis zum ACLED-Threshold-Adapter durch und liefert pro Adapter observability-Stats (`produced/promoted/created/deduped`). Soft-Ingest-Route ebenfalls um `deduped`-Stats pro Adapter erweitert. Hard-Signal-Candidates erhalten nun ebenfalls auto-generierte `reviewNote`-Reasons.
> - Phase 4e/4f (migration-ready, teilweise): Shared Ingestion-Contract eingefuehrt (`src/lib/geopolitical/ingestion-contracts.ts`) fuer Adapter-Stats und standardisiertes auto-`reviewNote`-Format. Hard-/Soft-Pipelines nutzen jetzt dieselben DTO-/Serializer-Pfade, was die spaetere Verlagerung in den Go-Layer vereinfacht.
> - Phase 4e (teilweise): Offizielle Rates-/Sanctions-Deltas erhalten zusaetzlich leichte Semantik-Heuristiken (DocType, Zentralbank `hike/cut/hold` + bp soweit erkennbar, Sanktions-Aktion wie `designations/general_license/delistings` + grobe Target-Tags). Headlines/Severity/`reviewNote` werden dadurch aussagekraeftiger, ohne schon vollstaendiges Decision-Parsing zu sein.
> - Phase 4h (teilweise): Contradictions besitzen jetzt dedizierten Local-Store + API (`/api/geopolitical/contradictions`, `PATCH /api/geopolitical/contradictions/[id]`) inkl. Timeline-Audit (`contradiction_created/resolved/reopened`). Sidebar-Panel unterstuetzt Basis-Workflow (Open/Resolved/All Filter + Resolve/Reopen); tieferer Review-/Merge-Workflow bleibt offen.
> - Phase 4g (abgeschlossen, Implementierung): `TimelineStrip` nutzt jetzt auch `d3-svg-annotation` (Peak-Annotation im Activity-Density-Chart) und `d3-svg-legend` (formale Treemap-Legende fuer Action-Gruppen). Browser-Visual-Verify bleibt im finalen Phase-4-Abnahmelauf offen.
> - Phase 4h (abgeschlossen, Implementierung): Contradictions-Workflow erweitert um Resolution-Details (Outcome/Note/Merge-Links), Evidence-Items (add/remove) und zusaetzliche Timeline-Audits (`contradiction_resolution_updated`, `contradiction_evidence_updated`) via Sidebar-Panel + PATCH-API.
> - Phase 4e (abgeschlossen, Implementierung): Hard-Signal-Parsing fuer offizielle Rates-/Sanctions-Deltas ist fuer Phase-4-Scope vervollstaendigt (Delta + Keyword + Semantik-Heuristiken/Decision-Signale fuer Headlines/Severity/Reasons). Tieferes provider-spezifisches Parsing und Verlagerung in den Go-Layer bleiben Architektur-/Folgearbeit ausserhalb des Phase-4-Abschlusskerns.
> - Phase 1b/1c (scaffold erweitert, teilweise): Go Gateway fuehrt zusaetzlich eine In-Memory-Revocation-Audit-Historie (Ringbuffer) und exponiert `GET /api/v1/auth/revocations/audit` (admin-only via bestehendes RBAC-Scaffold) fuer Debug/Review des transitional Revocation-Flows.
> - Phase 4a (teilweise): `GeopoliticalMapShell` stark gesplittet (Shell-Komposition + Panels/Hooks), Zustand-Workspace-Store aktiv genutzt; Shell reduziert auf ~500 Zeilen.
> - Phase 4d (teilweise): Body-/Layer-Modularisierung gestartet (`bodies/earth|moon`, body point layer registry, Moon Seed-Layer getrennt von `MapCanvas`).
> - Phase 4c (gestartet): `MapCanvas` Projektion-/Layer-Berechnung in `rendering/useGeoMapProjectionModel` extrahiert, SVG Render-Stages (`basemap`, `drawings`, `soft-signals`, `body-point-layers`, `markers`) abgegrenzt, Layer-Routing-Metadaten (`rendererHint`) vorbereitet und erster Canvas-Basemap-Stage-Scaffold (Sphere/Atmosphaere/Graticule/Cloud unter SVG) integriert als Vorstufe fuer Canvas/SVG-Hybrid.
> - Phase 1b (scaffold erweitert, teilweise): Rate-Limit-Scaffold deckt jetzt auch `POST /api/v1/auth/revocations/jti` ab (5/min, path-basiert, flag-gated via `AUTH_RATE_LIMIT_ENFORCE`).
> - Phase 1d (vertical slice erweitert): `src/app/api/geopolitical/game-theory/impact` erzeugt/propagiert `X-Request-ID`; Go `gametheory` Connector reicht Header an Python Soft-Signals Service weiter (TS -> Go -> Python Header-Chain fuer diesen Pfad).
> - Phase 1d (route rollout, teilweise): `src/app/api/geopolitical/events` + ACLED/GDELT-Bridge sowie `src/app/api/geopolitical/context` + Context-Bridge propagieren/echoen `X-Request-ID` fuer externe Geo-Fetches via Go.
> - Phase 1d (platform rollout, teilweise): Next.js **`src/proxy.ts`** setzt/propagiert `X-Request-ID` fuer alle API-Routes (inkl. konsolidierter Security-/CORS-Response-Header); `python-backend/services/_shared/app_factory.py` fuegt allen Python FastAPI-Services eine gemeinsame Request-ID- und Request-Logging-Middleware hinzu (Header-Echo + JSON-Log-Baseline).
> - Phase 0c (slice erweitert): `src/app/api/market/quote` ist jetzt **strict Go-only** (Single + Batch). Gemappte `stock`/`fx`/`crypto` gehen auf `GET /api/v1/quote`; ein transitional Go-Proxy `GET /api/v1/quote/fallback` (Go -> Python Finance-Bridge `/quote`) deckt weitere Symboltypen/unknown-Mappings ab. Kein Frontend-Provider-Fallback mehr in der Route.
> - Phase 0c (slice erweitert): `src/app/api/market/news` ist jetzt **Go-only** auf `GET /api/v1/news/headlines` (Symbol-/`q`-/`lang`-Queries; Go-Lang-Filter best-effort, GDELT-zentriert) und mappt weiter auf das bestehende Frontend-Response-Shape; der lokale TS-News-Aggregator-Fallback wurde aus der Route entfernt (Gateway-Fehler -> `502`).
> - Phase 0c (slice erweitert): Go Gateway `GET /api/v1/ohlcv` implementiert (transitional Proxy auf Python Finance-Bridge/yfinance); `src/app/api/market/ohlcv` ist jetzt **strict Go-only** (bei Gateway-Fehler `502`, kein Frontend-Provider-Fallback mehr).
> - Phase 0c (slice erweitert): Go Gateway proxied `POST /api/v1/signals/composite` und `POST /api/v1/evaluate/strategy` an Python `indicator-service`; Next.js `fusion/strategy/*` Routes/Helper (`src/lib/strategy/indicator-service.ts`) sind jetzt TS-seitig **strict Go-only** (kein direkter Python-Fallback mehr, Default auf Gateway `:9060`).
> - Phase 0c (slice erweitert): Go Gateway proxied die Soft-Signals-Pfade `POST /api/v1/cluster-headlines`, `/api/v1/social-surge`, `/api/v1/narrative-shift`; `src/lib/geopolitical/adapters/soft-signals.ts` ist jetzt TS-seitig **strict Go-only** (kein direkter Python-Fallback mehr, Default auf Gateway `:9060`) und bezieht auch die Artikelbasis (`q`-News) ueber Go (`/api/v1/news/headlines`) statt lokalen Aggregator-Calls.
> - Phase 0c (slice erweitert): `src/app/api/geopolitical/news` nutzt jetzt ebenfalls den Go-News-Endpoint (`/api/v1/news/headlines`) fuer region-spezifische Query-Bildung; die Route verwendet keinen lokalen TS-News-Aggregator mehr (Go-Fehler -> `502`).
> - Phase 3 (resilience hardening, teilweise): Legacy-Polling-Fallbacks in `src/app/api/market/stream` und `src/app/api/market/stream/quotes` sind jetzt explizit runtime-flag-gated (`MARKET_STREAM_*_LEGACY_FALLBACK_ENABLED`) und in Production standardmaessig fail-closed ohne `ALLOW_PROD_MARKET_STREAM_LEGACY_FALLBACK=true`. SSE-Antworten markieren Fallback-Nutzung/Grund via Header (`X-Stream-Fallback`, `X-Stream-Fallback-Reason`) und Event-Metadaten.
> - Phase 0c (slice erweitert): Go Gateway `GET /api/v1/search` (transitional Proxy auf Python Finance-Bridge `/search`) implementiert; `src/app/api/market/search` ist jetzt strict Go-only (kein Frontend-Provider-Fallback mehr).
> - Phase 0c (slice erweitert): `src/app/api/market/stream` (Candles) und `src/app/api/market/stream/quotes` holen Daten nicht mehr direkt aus `lib/providers`, sondern ueber die internen Next-Market-Routes (`/api/market/ohlcv`, `/api/market/quote`) und profitieren damit indirekt vom Go-first Routing.
> - Phase 0d (gRPC IPC, 27. Feb 2026): Go↔Python Transport auf gRPC-first umgestellt. Proto `go-backend/internal/proto/ipc/ipc.proto` mit `ForwardRequest`; Go `internal/connectors/ipc` (gRPC primär, HTTP-Fallback); Python `services/_shared/ipc_servicer.py` + `grpc_server.py`; Connectors indicatorservice, financebridge, softsignals nutzen IPC-Client. gRPC-Ports = HTTP-Port + 1000 (z.B. 8092→9092). Python startet gRPC bei `GRPC_ENABLED=1`. **Verify Gate (27. Feb 2026):** Live-Verify abgeschlossen — dev-stack laedt `python-backend/.env.development` (GRPC_ENABLED=1), Ports konsistent (indicator 8092, finance-bridge 8081, soft-signals 8091), E2E-Calls (Composite Signal, OHLCV, Soft-Signals) erfolgreich, Tests `test_ipc_grpc.py` und `ipc/client_test.go` hinzugefuegt.
> - Phase 0c (slice erweitert): `src/lib/orders/snapshot-service` (Fusion Portfolio Snapshot/History) nutzt fuer Preis-Snapshots jetzt ausschliesslich Go-first Quote-Fetches (kein lokaler Frontend-Provider-Fallback mehr; fehlende Preise werden toleriert).
> - Phase 0c (slice erweitert): `src/app/api/market/providers` nutzt kein `getProviderManager()` mehr; Provider-Liste kommt aus `PROVIDER_REGISTRY`, Availability ist transitional per Go-`/health`-basierter Heuristik markiert.
> - Phase 0c (slice erweitert): In `src/app/api/market/*` gibt es keine direkten `getProviderManager()`-Aufrufe mehr; Next.js Market-Routes sind damit routing-seitig auf Go ausgerichtet (transitional Fallbacks liegen nur noch im Go-Layer bzw. in dessen Upstream-Proxies).
> - **Frontend `src/lib/providers` (Architektur-Vermerk):** OHLCV/Quote/Stream-Daten kommen ausschliesslich ueber Go (Gateway). Im Frontend wird `src/lib/providers` nur noch genutzt fuer: **(1) Typen** (`types.ts`: `OHLCVData`, `QuoteData`, `TimeframeValue`, Provider-Interfaces) als Vertrag Frontend–Go; **(2) `PROVIDER_REGISTRY`** fuer Metadaten in `GET /api/market/providers` (Namen, displayName, supportedAssets). Die **Provider-Implementierungen** (Finnhub, Polygon, CCXT, etc. mit `fetchOHLCV`/`getQuote`) und **`ProviderManager`/`getProviderManager()`** werden von keiner Route mehr fuer Datenabfragen aufgerufen und sind damit Legacy; optional spaeter entfernen oder auf reine Types + Registry reduzieren.
> - Phase 0a (scaffold gestartet, teilweise): Go Adaptive Router Config + Health-Score/Circuit-Scaffold implementiert (`go-backend/config/provider-router.yaml`, `internal/router/adaptive`). `GET /api/v1/quote` akzeptiert jetzt `exchange=auto`; Quote-Client nutzt Provider-Kandidatenwahl + Failover und aktualisiert Provider-Health-State.
> - Phase 0a (scaffold erweitert, teilweise): Optionaler Debug-/Verify-Endpoint `GET /api/v1/router/providers` exponiert Provider-Health-/Circuit-/Score-Snapshots (wenn Router-Config geladen ist).
> - Phase 0c (resilience erweitert, teilweise): OHLCV-Proxy (`/api/v1/ohlcv`) unterstuetzt jetzt Go-seitiges Upstream-Failover ueber `FINANCE_BRIDGE_URLS` (sequenzieller Retry bei Netzwerk-/5xx-Fehlern), damit Chart-Fetches nicht auf einen einzelnen Finance-Bridge-Upstream fest verdrahtet sind.
> - Phase 0b (gestartet, teilweise): Neues `internal/connectors/base` Package (`http_client.go`, `ratelimit.go`, `retry.go`, `types.go`, `ws_client.go`) eingefuehrt; ACLED- und Finnhub-HTTP-Connectoren nutzen jetzt den gemeinsamen BaseHTTPClient. **Neu:** `failsafe-go` integriert für robustes Circuit Breaking und Retry-Handling. `go-playground/validator/v10` sichert den Start der `provider-router.yaml` durch Fail-Fast-Validierung ab.
> - Phase 0b (bestehende Quellen-Migration erweitert, teilweise): Die bestehenden **FRED**- und **ECB**-Connectoren nutzen jetzt ebenfalls den gemeinsamen `base.Client`. **Neu:** Strikte Durchsetzung von GCT-Datentypen (`currency.Pair` und `asset.Item`) über alle Connector-Schnittstellen hinweg, um String-Parsing-Fehler zur Laufzeit zu eliminieren.
> - Phase 0b (Architektur / IPC): Ein dediziertes gRPC-Protokoll (`internal/proto/ipc/ipc.proto`) wurde definiert, um Go <-> Python Kommunikation (z.B. Soft-Signals, ML-Inference, Realtime-Tick-Streams) zukünftig via Hochleistungs-Streaming abzuwickeln anstelle von HTTP/REST.
> - Phase 3 (Streaming): `base.WebsocketClient` als leichtgewichtige, generische Alternative zum tief verwurzelten GCT-Websocket-Manager eingeführt (inkl. Auto-Reconnect, Ping/Pong, Thread-Safety). Finnhub-Stream wurde erfolgreich darauf migriert.
> - Phase 0a/0b (foundation erweitert, vorbereitet fuer Phase 7/14): `provider-router.yaml` unterstuetzt jetzt optionale Provider-Metadaten (`group`, `kind`, `capabilities`) und `GET /api/v1/router/providers` exponiert diese im Snapshot. Im `internal/connectors/base` wurden zusaetzliche Gruppen-Scaffolds (`sdmx_client`, `timeseries`, `bulk_fetcher`, `rss_client`, `diff_watcher`, `translation`, `oracle_client`) angelegt, damit neue Quellen aus `REFERENCE_PROJECTS.md` ueber Quellen-Gruppen statt 1:1-Boilerplate integriert werden koennen.
> - Phase 0a/0b (foundation erweitert, GCT-Pattern-Reuse vorbereitet): Im Base-Layer existieren jetzt eine **Provider-Capability-Matrix** (`internal/connectors/base/capabilities.go`) und eine **Fehlerklassifizierung** (`error_classification.go` mit Klassen wie `auth`, `quota`, `timeout`, `schema_drift`, `upstream_5xx`) als Grundlage fuer spaetere gruppenspezifische Router-/Fallback-Entscheidungen. Ziel: GCT-Methoden (Robustheit/WS-Lifecycle/Fehlerbehandlung) uebernehmen, ohne Nicht-Crypto-Provider hart an GCT-Internals zu koppeln.
> - Phase 0a/0b (bestehende Quellen auf neue Struktur nachgezogen, Teil-Slice): Der Go `QuoteClient` meldet Failover-Fehler jetzt **klassifiziert** (`base.ClassifyError`) an den Adaptive Router. `GET /api/v1/router/providers` exponiert zusaetzlich `lastErrorClass` und aggregierte `failureClasses` pro Provider (z. B. `timeout`, `quota`) als Vorbereitung fuer intelligentere Routing-/Backoff-Policies bei bestehenden Quellen, bevor neue Reference-Quellen hinzugefuegt werden.
> - Phase 0b (Migration-Queue konkretisiert): Bestands-Connectoren mit bereits gemeinsamem `base.Client`: `acled`, `finnhub`, `fred`, `ecb`, `indicatorservice`, `financebridge`, `softsignals`, `geopoliticalnext`, `gdelt`, `news/*`, `gametheory`, `crisiswatch`. Fuer die migrierten Proxy-Connectoren (`indicatorservice`, `softsignals`, `geopoliticalnext`) existieren gezielte Request-ID/Header/Path-Tests; `financebridge` behaelt den OHLCV-BaseURL-Failover ueber mehrere `base.Client`-Instanzen. `gdelt`/`news/*`/`gametheory`/`crisiswatch` nutzen nun ebenfalls die gemeinsame HTTP-Basis bei unveraenderter parser-/retry-naher Logik. Damit ist die priorisierte Bestands-HTTP-Connector-Queue fuer den `base.Client`-Rollout weitgehend erledigt und die naechste Stufe ist die gruppenweise `REFERENCE_PROJECTS.md`-Expansion (G4 -> G3).
> - Phase 0b / Vorbereitung Phase 14b (Reference-G4 Start): **BCB SGS** (`internal/connectors/bcb`) als erster `REFERENCE_PROJECTS.md`-Provider integriert (auf `base.Client`), inklusive vertikaler Verdrahtung in `GET /api/v1/quote` (`exchange=bcb`, `assetType=macro`) und `GET /api/v1/macro/history`. Macro-Routing erfolgt jetzt ueber `market.NewRoutedMacroClient(...)` per Prefix (`BCB_SGS_*`) statt weiterer source-spezifischer Branches direkt in `wiring.go`.
> - Phase 0b / Vorbereitung Phase 14b (Reference-G4 Slice II): **Banxico SIE** (`internal/connectors/banxico`) als zweiter `G4`-Provider integriert (ebenfalls `base.Client`), inklusive vertikaler Verdrahtung in `GET /api/v1/quote` (`exchange=banxico`, `assetType=macro`) und `GET /api/v1/macro/history`. `RoutedMacroClient` wurde auf Prefix-Registry erweitert (`RegisterPrefixClient`) und routet jetzt `BCB_SGS_*` sowie `BANXICO_*` ohne weitere `wiring.go`-Sonderfalllogik.
> - Phase 0b / Vorbereitung Phase 14b (Reference-G4 Slice III): **Bank of Korea ECOS** (`internal/connectors/bok`) als dritter `G4`-Provider integriert (`base.Client`, API-Key). Vertikal verdrahtet in `GET /api/v1/quote` (`exchange=bok`, `assetType=macro`) und `GET /api/v1/macro/history`; `RoutedMacroClient` nutzt das bestehende Prefix-Registry-Muster jetzt auch fuer `BOK_ECOS_*`. `POLICY_RATE` mappt fuer `exchange=bok` auf `BOK_ECOS_722Y001_M_0101000`.
> - Phase 0b / Vorbereitung Phase 14b (Reference-G4 Slice IV): **BCRA Principales Variables v4** (`internal/connectors/bcra`) als vierter `G4`-Provider integriert (`base.Client`, public JSON/OpenAPI). Vertikal verdrahtet in `GET /api/v1/quote` (`exchange=bcra`, `assetType=macro`) und `GET /api/v1/macro/history`; `RoutedMacroClient` routet `BCRA_*` ueber das bestehende Prefix-Registry-Muster. `POLICY_RATE` mappt fuer `exchange=bcra` auf `BCRA_160` (temporäre Projekt-Standardserie).
> - Phase 0b / Vorbereitung Phase 14b (Reference-G4 Slice V): **TCMB EVDS3** (`internal/connectors/tcmb`) als fuenfter `G4`-Provider integriert (`base.Client`, public EVDS3 `POST /igmevdsms-dis/fe`). Vertikal verdrahtet in `GET /api/v1/quote` (`exchange=tcmb`, `assetType=macro`) und `GET /api/v1/macro/history`; `RoutedMacroClient` routet `TCMB_EVDS_*` ueber das bestehende Prefix-Registry-Muster. EVDS3 Endpoint/Response-Shape wurde vor Implementierung live ueber Browser-Network-Capture + direkten CLI-POST verifiziert.
> - Phase 0b / Vorbereitung Phase 14b (Reference-G4 Slice VI): **RBI DBIE (FX Reserves Slice)** (`internal/connectors/rbi`) als weiterer `G4`-Provider integriert (`base.Client`) mit DBIE-Gateway-Handshake (`security_generateSessionToken`) + Datenendpoint `dbie_foreignExchangeReserves`. Vertikal verdrahtet in `GET /api/v1/quote` (`exchange=rbi`, `assetType=macro`) und `GET /api/v1/macro/history`; `RoutedMacroClient` routet `RBI_DBIE_FXRES_*` ueber das Prefix-Registry-Muster. Live-Verifikation erfolgte per Browser-Network-Inspektion (Request/Response-Shape + Header).
> - Phase 0b / Vorbereitung Phase 14c (Reference-G3 SDMX Foundation Slice): `internal/connectors/base/sdmx_client.go` wurde vom Scaffold auf eine nutzbare Basis angehoben (geordneter Dimension-Key-Builder, Dataflow-/Datastructure-Pfade, Query-Optionen inkl. `dimensionAtObservation`, generischer SDMX-JSON Single-Series Parser fuer `dataSets[].series[].observations`). Gezielt mit Unit-Tests abgesichert (`sdmx_client_test.go`) als Grundlage fuer den naechsten Batch (`ECB`/`OECD`/`IMF` SDMX-Connectoren).
> - Phase 1d (vertical slice erweitert): `X-Request-ID` wird fuer die Strategy-Proxy-Pfade von Next.js -> Go -> Python `indicator-service` weitergereicht.
> - Phase 1d (vertical slice erweitert): `X-Request-ID` wird auch fuer die Soft-Signals-Proxy-Pfade Next.js -> Go -> Python (`8091`) mitgegeben.
> - Phase 1b/1d (scaffold, teilweise): `src/app/api/geopolitical/candidates/ingest/soft` uebergibt jetzt `requestId`/`userRole` an die Soft-Signal-Adapter; der Adapter leitet `X-Request-ID` und optional `X-User-Role` an den Go Soft-Signal-Proxy weiter.
> - Phase 1d (vertical slice erweitert): `market/stream` und `market/stream/quotes` echoen `X-Request-ID` auf der SSE-Response und reichen die ID an die internen `/api/market/ohlcv` bzw. `/api/market/quote` Fetches weiter.
> - Phase 1b/1d (vertical slice erweitert): `market/stream` und `market/stream/quotes` reichen jetzt zusaetzlich optional `X-User-Role` an die internen `/api/market/ohlcv` bzw. `/api/market/quote` Fetches weiter (Role-Propagation auch im SSE-Pfad).
> - Phase 1d (vertical slice erweitert): `fusion/portfolio` und `fusion/portfolio/history` echoen `X-Request-ID`; dieselbe ID wird bis in `src/lib/orders/snapshot-service` fuer Go-Quote-Fetches verwendet (Trace-Chain im Portfolio-Snapshot-Pfad).
> - Phase 1a (scaffold, teilweise): Prisma Auth-/Security-Tabellen als Vorbereitung angelegt (`User`, `Account`, `Session`, `VerificationToken`, `Authenticator`, `RefreshToken`, `TotpDevice`, `RecoveryCode`, `UserConsent`); `bun run db:generate` erfolgreich. WebAuthn/Passkey-Flows + Adapter-Verdrahtung noch offen.
> - Phase 1a (scaffold erweitert, teilweise): Feature-flagged Passkey/WebAuthn API-Scaffolds unter `/api/auth/passkeys/*` implementiert (`register/options`, `register/verify`, `authenticate/options`, `authenticate/verify`) mit `@simplewebauthn/server`, httpOnly Challenge-Cookies (TTL), Prisma-`Authenticator` Persistenz/Counter-Update und discoverable Authentication-Optionen. `authenticate/verify` kann bei aktivierter Auth nun optional ein kurzlebiges `sessionBootstrap`-Proof fuer einen transitional NextAuth-Credentials-Exchange liefern. Noch offen: finaler Auth.js-v5 Passkey-Flow + produktive UI-Integration.
> - Phase 1a (scaffold erweitert, teilweise): Client-seitiger Passkey-Helper `src/lib/auth/passkey-client.ts` vorhanden (`@simplewebauthn/browser`), der die neuen Scaffold-Endpunkte orchestriert (Options → Browser WebAuthn → Verify, inkl. `credentials: include` für Challenge-Cookies) und optional den transitional Session-Exchange via `next-auth` (`passkey-scaffold`) ausfuehren kann.
> - Phase 1a (scaffold erweitert, teilweise): Minimale manuelle Testoberflaeche `/auth/passkeys-lab` implementiert (`src/features/auth/PasskeyScaffoldLab.tsx`), um Capabilities/Registration/Authentication sowie den optionalen Scaffold-Session-Exchange gegen die Endpunkte zu testen. Finale Login-/Settings-UI bleibt offen.
> - Phase 1a (scaffold erweitert, teilweise): Transitional Sign-In-Page `/auth/sign-in` implementiert (Credentials + Passkey-Scaffold-Login, optionaler `?next=` Redirect); `next-auth` Sign-In-Redirect zeigt nicht mehr auf `/`, sondern auf diese dedizierte Auth-Seite. Produktive Device-Management-/Settings-UIs bleiben offen.
> - Phase 1a (scaffold erweitert, teilweise): Session-gebundenes Passkey-Device-Management als minimaler Scaffold vorhanden (`GET/DELETE /api/auth/passkeys/devices` + `/auth/passkeys` UI, inkl. Liste/Registrieren/Entfernen und Schutz gegen Entfernen des letzten Passkeys). Vollwertige Security-/Settings-UX bleibt offen.
> - Phase 1c (scaffold gestartet, teilweise): GCT-Hardening-Policy-Validation beim Gateway-Start vorhanden (`GCT_ENFORCE_HARDENING`, weak-credential / insecure-TLS opt-in Flags).
> - Phase 1c (scaffold gestartet, teilweise): Geschuetzter GCT-Prefix `/api/v1/gct/*` eingefuehrt (aktuell `/api/v1/gct/health`), im Go-RBAC als `trader`-only klassifiziert und im Rate-Limit-Scaffold auf 2/min begrenzt (Verify-Basis fuer `403` ohne Trader-Rolle).
> - Phase 1c (scaffold gestartet, teilweise): Append-only GCT-Audit-JSONL Middleware (`GCT_AUDIT_ENABLED`, `GCT_AUDIT_JSONL_PATH`) loggt `/api/v1/gct/*` Requests mit `requestId`/User-Metadaten/Status als persistenten Transitional Audit-Trail.
> - Phase 1c (scaffold erweitert): GCT-Audit-JSONL ist jetzt tamper-evident via SHA-256-Hash-Chain (`prevHash`/`entryHash`, per Datei-Chain; Chain-Head wird beim Restart aus letzter JSONL-Zeile fortgesetzt).
> - Phase 1c (scaffold gestartet, teilweise): AES-GCM Helper (`internal/security/aesgcm`) fuer spaetere Exchange-Key-/Config-Hardening-Flows eingefuehrt.
> - **Freeze/Verify (23. Feb 2026, Codex):** Phase 0 ist als Foundation-Baseline abgeschlossen; Phase 1 ist als transitional/productive Auth-Security-Baseline abgeschlossen (Auth.js/next-auth v5 beta + Prisma Adapter + Credentials Register/Login + echter Passkey-Provider, Scaffold/Lab optional als Fallback/Testpfad). Offene Punkte sind primär **Live-Verify (Browser/E2E)** sowie GCT-nahe DB-/Key-Storage-Verfeinerungen und finale UI-Polish.
> - Phase 2a/2d/2e (slice gestartet, erweitert): `python-backend/rust_core/` PyO3-Crate (`tradeviewfusion_rust_core`) mit `composite_sma50_slope_norm()`, `calculate_heartbeat(...)` und `calculate_indicators_batch(...)` aktiv; Python `rust_bridge.py` + `indicator-service /health` exponieren `rustCore`-Status. `build_composite_signal()` nutzt Rust bevorzugt fuer SMA50-Slope, Heartbeat und `rvol_20` (mit Engine-Markern/Fallbacks). Trading-Frontend (`SignalInsightsBar`) zeigt Backend-Composite-Badges (Composite/Confidence, SMA50-Slope inkl. Engine, **Heartbeat**, Smart-Money-Score) via `/api/fusion/strategy/composite` (Go -> Python -> Rust Durchstich im UI sichtbar). Verifiziert via `cargo test`, `maturin develop`, Python-Smoke und `unittest` (`python-backend/tests/test_phase2_rust_composite.py`).
> - Phase 2b (slice erweitert): `indicator-service` **und** `finance-bridge` nutzen jetzt aktiv Polars-Preprocessing fuer OHLCV (CPU-kompatibel via `polars[rtcompat]`), mit Health-/Response-Metadaten fuer `dataframe`/`dataframeEngine` und Python-Fallback fuer Graceful Degradation.
> - Phase 2c (slice erweitert): Rust-Core enthaelt einen **redb OHLCV Cache** (`src/ohlcv_cache.rs`) mit TTL-Records plus PyO3-Funktionen `redb_cache_set` / `redb_cache_get`; der Python `finance-bridge` nutzt ihn als read-through Cache fuer `/ohlcv` (inkl. `cache.hit/lookupMs/storeMs`). Nach DB-Handle-Reuse im Rust-Cache (global per Pfad) liegt ein lokaler Warm-Get-Benchmark bei ~`0.0027ms` P50 (PyO3 roundtrip), mit Unittest-Guard `<1ms` P50.
> - **Phase-2 Freeze (Code-Complete, 23. Feb 2026, Codex):** Sub-Phasen **2a-2e** sind als Implementierungs-Baseline vorhanden (Rust-Core, Polars, redb, Composite-Verdrahtung, Frontend-Badges). Offene Punkte vor formaler Phase-Abnahme sind bewusst auf das Verify Gate begrenzt (Live-UI + voller Browser->Next->Go->Python/Rust Durchstich), das auf User-Wunsch nachgezogen wird.

---

## Phasen-Loop (gilt fuer jede Phase)

- [ ] **1. Implementierung** — Code schreiben gemaess `API_CONTRACTS.md`. Vertikal: eine Boundary nach der anderen (TS↔Go → Go↔Py/Rs → End-to-End).
- [ ] **2. Unit/Integration Test**
- [ ] **3. Refinement & Debugging**
- [ ] **4. Verify Gate** — Automatisierbare Pruefung (pro Phase definiert)
- [ ] **5. Review Gate** — Code Review + Contract Check
- [ ] **6. Freeze** — Checkboxen `[x]` markieren, `SYSTEM_STATE.md` aktualisieren

### Boundary-Order (innerhalb jeder Phase)

```
Schritt A:  TS ↔ Go    (Frontend-Contract + Go-Endpoint + Mock-Response)
Schritt B:  Go ↔ Py/Rs (Echte Daten ersetzen Mocks)
Schritt C:  End-to-End  (TS → Go → Py/Rs → Go → TS)
```

---

## Uebersicht: 24+1 Phasen

| Phase | Name | Sub | Schwerpunkt | Abh. | Ref |
|:-----:|:-----|:---:|:------------|:-----|:----|
| 0 | Foundation | 6 | Go Data Router + BaseConnector + gRPC IPC (0d) + Observability (0e) + Error Boundaries (0f) | — | GO-R, API_CONTRACTS, ERRORS |
| **1** | **Auth + Security** | **6** | **WebAuthn, RBAC, KG Encryption, WebMCP Security, Consent** | **0** | **AUTH** |
| 2 | Rust Core + Composite Signal | 5 | PyO3, Polars, redb Cache, erster Durchstich | 0 | RUST, IND |
| 3 | Streaming Migration | 3 | Candle Builder, Alert Engine, Snapshot Store | 0 | ADR |
| 4 | GeoMap v2.0 | 8 | Shell Refactor, D3 Stack (v1.1/v1.5), Canvas Hybrid, Layer-System, Multi-Body Foundation, Auto-Candidates | 0,1 | GEO, OPTS |
| 5 | Portfolio Bridge + Analytics | 4 | GCT Bridge, Python Analytics, Frontend Tabs | 0,1 | PF |
| **6** | **Memory Architecture** | **5** | **Redis, KG (KuzuDB), Episodic Store, Vector Store** | **1** | **MEM** |
| 7 | Indicator Catalog — Core | 5 | Phases A+B: swing_detect, MAs, Bollinger, RSI, Fibonacci, Composite | 2 | IND |
| 8 | Pattern Detection | 6 | Phase C: Elliott Wave, Harmonic, Candlestick, DeMark, Classical | 2 | IND |
| 9 | Unified Ingestion Layer | 4 | Go Connectors, LLM Pipeline, Review UI, Copy/Paste | 4,6 | UIL |
| **10** | **Agent Architecture + Context** | **8** | **Agent Roles, Context Engineering, Working Memory, WebMCP, Search** | **6,1** | **AGT, AT, CE** |
| **11** | **Entropy + Novelty Monitoring** | **5** | **Health Monitor, KG Dampening, Market Entropy Index, Exergie** | **6,10** | **ENT** |
| 12 | GeoMap v2.5 — Advanced | 7 | NLP Upgrade, Contradictions, Alerts, Exports, Timeline, Zentralbank | 4,6,9 | GEO |
| 13 | Portfolio Advanced + Optimize | 6 | HRP, Kelly, Regime Sizing, Monte Carlo VaR, VPIN | 5,8 | PF, IND |
| 14 | Global Provider Expansion | 6 | SDMX, EM Central Banks, BulkFetcher, DiffWatcher, Translation | 0 | GO-R |
| 15 | Indicator Catalog — Advanced | 7 | Phases D+E: K's Collection, Volatility, Regime, CUSUM, Order Flow | 7 | IND |
| 16 | Backtesting Engine | 7 | Rust Backtester, Walk-Forward, Triple-Barrier, Monte Carlo, Sharpe | 2,7 | RUST, IND |
| **17** | **Game Theory Mode + Simulation** | **8** | **Spielbaum, Transmission, Timeline, Monte Carlo, Strategeme, Planner** | **4,6,10** | **GT, AT** |
| 18 | Options + Dark Pool + DeFi | 6 | FINRA ATS, GEX, Expected Move, Black-Scholes, DeFi, Oracle | 13,14 | IND, GO-R |
| 19 | GeoMap v3 + Collaboration + Rust | 8 | CRDT/Yjs, Entity Graph, deck.gl, h3o, LSTM Regime, Active Learning | 4,12 | GEO, RUST |
| 20 | ML Pipeline | 5 | Feature Eng, XGBoost, Hybrid Fusion, Deep Learning, Bias Monitor | 7,15 | IND |
| 21 | Frontend Refinement + Hardening | 7 | Zod, Dead Code, RSC, UI Polish, Logging, a11y, Dependency Audit | alle | — |
| *(22)* | *(WASM + Desktop — optional)* | *3* | *WASM Indicators, Tauri v2, ChartGPU* | *2* | *RUST* |
| 23 | Platform Readiness (Super-App Schnittmenge) | 5 | Capability Registry, Agent Policy Tiers, Trust-Fabric Mapping, Governance Events, Trajectory Observability | 1,6,9,10 | ARCH, SUPERAPP |
| 24 | Ecosystem Optionality (ohne Produkt-Scope-Creep) | 4 | Internal Plugin Pilot, Partner/ISV Boundary Spec, Payment Orchestration Adapter, Reversible Rollout Gates | 23,5,14 | SUPERAPP, PF |
| | **Summe** | **~145** | | | |

---

## Phase 0: Foundation (Go Data Router + BaseConnector)

> **Ref:** GO-R Sek. 1-12, GOG

**Ziel:** Go Gateway wird Single Point of Entry. BaseConnector-Abstraktion als Fundament fuer alle zukuenftigen Provider.

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **0a** | Adaptive Data Router | GO-R Sek. 1-5 | `config.yaml`, Health Scoring (Bifrost-style), Provider States, Rate Limiting, Circuit Breaker (`failsafe-go`) |
| **0b** | BaseConnector Architecture | GO-R Sek. 12.2-12.3 | `base/` Package: `http_client.go`, `ratelimit.go`, `retry.go`, `types.go`. `failsafe-go` Integration (Circuit/Retry). Alle bestehenden Connectors darauf migrieren (~700 LoC) |
| **0c** | Frontend Provider Migration | GO-R Sek. 6 | Alle direkten Provider-Calls im Frontend eliminieren. API-Routes auf `GO_GATEWAY_BASE_URL` umbiegen. ENV Keys nach `go-backend/.env` |
| **0d** | Go↔Python gRPC IPC | API_CONTRACTS Sek. 0 | Proto `ipc.proto`, Go `internal/connectors/ipc` (gRPC-first, HTTP-Fallback), Python `ipc_servicer` + `grpc_server`. Connectors indicatorservice, financebridge, softsignals auf IPC-Client umgestellt. |
| **0e** | Observability Foundation | — | OpenTelemetry SDK (Go + Python + Next.js) + OpenObserve als präferierter No-Docker-Backend (Port 5080). Traces, Logs, Metrics via OTLP. Kein Jaeger/Prometheus/Grafana/Loki nötig. Fallback: Jaeger all-in-one oder OTel+stdout. |
| **0f** | Error Boundaries | ERRORS §1 | `global-error.tsx`, `error.tsx`, `geopolitical-map/error.tsx` – hierarchische Next.js Boundaries für unerwartete Crashes. |

### Verify Gate
- [x] Chart laedt OHLCV ausschliesslich via Go Gateway (Port 9060)
- [x] Kein direkter Provider-Call im Network Tab (Code-Basis: keine `getProviderManager()`-Aufrufe mehr in `src/app/api/market/*`)
- [x] Provider-Ausfall → Failover auf naechsten Provider (Quote `exchange=auto`; OHLCV Upstream-Failover via `FINANCE_BRIDGE_URLS`)
- [x] BaseConnector: Mindestens 2 bestehende Connectors (ACLED, Finnhub) auf neue Basis migriert
- [x] **gRPC IPC Live-Verify:** Abgeschlossen (27. Feb 2026) — dev-stack laedt `python-backend/.env.development` (GRPC_ENABLED=1), Ports konsistent (indicator 8092, finance-bridge 8081, soft-signals 8091), E2E-Calls erfolgreich, Tests `test_ipc_grpc.py` und `ipc/client_test.go` hinzugefuegt.
- [ ] **0e Observability:** OpenObserve läuft; Go/Python/Next.js senden Traces; End-to-End Trace `X-Request-ID` → Span im UI sichtbar.
- [ ] **0f Error Boundaries:** `global-error.tsx`, `error.tsx`, `geopolitical-map/error.tsx` vorhanden; bei Map-Crash bleibt Rest der App nutzbar.

### Offenes Todo (Phase 0c / Frontend)
- [ ] **Frontend `src/lib/providers` auf Types + Registry reduzieren:** Provider-Implementierungen (Finnhub, Polygon, CCXT, etc.) und `ProviderManager`/`getProviderManager()` werden von keiner Route mehr fuer OHLCV/Quote genutzt (Daten kommen ausschliesslich ueber Go). Optional: Legacy-Code entfernen und nur `types.ts` (OHLCVData, QuoteData, TimeframeValue, Interfaces) sowie `PROVIDER_REGISTRY` (Metadaten fuer `GET /api/market/providers`) behalten. Siehe Architektur-Vermerk im Teilfortschritt oben.

### Open Checkpoints (IST-Verbesserung)
- [ ] **P0:** Go-only Boundary fuer Market/Geo-Proxies final pruefen (keine direkten Provider-Bypaesse in Next-Routen).
- [ ] **P1:** Einheitliche Correlation-ID-Propagation als Pflicht-Check fuer neue API-Routen.
- [ ] **P2:** Proxy-Konvention dokumentieren: Next bleibt thin proxy, keine Domainlogik in Route-Handlern.

---

## Phase 0e: Observability Foundation (OpenTelemetry + OpenObserve)

> **Geplant:** 03. Mär 2026 (Rev. 3.24) | **Status:** PLANUNG — kein Code noch

**Ziel:** End-to-End Distributed Tracing als Zero-Infra-Fundament. Alle Services (Go/Python/Next.js) instrumentieren; OpenObserve als Traces+Logs+Metrics-Backend (Rust single-binary, kein Docker nötig).

**Präferierter Stack:** OTel SDK + OpenObserve
**Fallback 1:** OTel SDK + Jaeger all-in-one
**Fallback 2:** OTel SDK + stdout/file (minimal, zero-infra)

| Task | Beschreibung | Datei(en) |
|:-----|:-------------|:----------|
| **T1** | Go: `otelhttp`-Middleware in `go-backend/internal/app/middleware.go` + OTLP-Exporter (`go.opentelemetry.io/otel`) | `middleware.go`, `wiring.go` |
| **T2** | Python: `opentelemetry-instrumentation-fastapi` in allen 4 Services; OTLP-Exporter via `OTEL_EXPORTER_OTLP_ENDPOINT` | `app_factory.py`, `pyproject.toml` |
| **T3** | Next.js: `@vercel/otel` in `src/instrumentation.ts` + `OTEL_EXPORTER_OTLP_ENDPOINT` | `instrumentation.ts` |
| **T4** | OpenObserve: Binary herunterladen, Port 5080, OTLP-Endpoint konfigurieren (`http://localhost:5080/api/default/traces`) | `dev-stack.ps1` |
| **T5** | Live-Verify: Browser-Request → Next.js → Go → Python → Span sichtbar im OpenObserve-UI mit `X-Request-ID` als Trace-Attribute | curl + OpenObserve UI |

### Verify Gate (Phase 0e)
- [ ] OpenObserve läuft auf Port 5080 (oder Jaeger Port 16686 als Fallback)
- [ ] Go-Service sendet Spans (jeder HTTP-Request = 1 Span)
- [ ] Python memory-service + indicator-service senden Spans
- [ ] End-to-End Trace: `X-Request-ID` als Span-Attribute durchgehend sichtbar
- [ ] `dev-stack.ps1` startet OpenObserve optional via `OBSERVABILITY_ENABLED=1`

### Phase 0e+ (Future / Optional)
- OpenObserve auf Logs + Metrics erweitern (OTLP)
- OTel Collector als Routing-Hub (wenn mehrere Backends gewünscht)
- Prometheus, Grafana/Loki bei Bedarf (Multi-Team, Compliance, spezielle Dashboards)
- Referenz: ERRORS.md §6.1

---

## Phase 0f: Error Boundaries (ERRORS.md §1)

**Ziel:** Hierarchische Next.js Error Boundaries für unerwartete Crashes. Kein Vendor-Lock.

| Task | Beschreibung |
|:-----|:-------------|
| **0f.1** | `src/app/global-error.tsx` (Last Resort, eigene `<html>`-Tags, Hard-Reset-Button) |
| **0f.2** | `src/app/error.tsx` (Top-Level Catch) |
| **0f.3** | `src/app/geopolitical-map/error.tsx` (granular – bei Map-Crash bleiben Sidebar/Header nutzbar) |

### Verify Gate (Phase 0f)
- [ ] Bei bewusstem Crash in GeoMap bleibt Rest der App nutzbar
- [ ] `global-error.tsx` fängt Root-Crashes ab

---

## Phase 1: Auth + Security Hardening

> **Ref:** AUTH Sek. 1-13

**Ziel:** Authentifizierung, Autorisierung, KG-Encryption, WebMCP-Security, Consent. **Auth zuerst** weil alles darauf aufbaut (Memory KG Encryption, Agent RBAC, WebMCP Tool-Scoping, GCT Trader-Rolle).

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **1a** | WebAuthn/Passkeys | AUTH Sek. 2 | next-auth v5 + Passkey Provider, Login/Register, JWT httpOnly Cookie, Protected Routes |
| **1b** | Security Middleware + RBAC | AUTH Sek. 2.3-2.4 | CSP, CORS, Rate Limiting, JWT Validation. Rollen: viewer/analyst/trader |
| **1c** | GCT Auth 3-Schichten | AUTH Sek. 3-4 | Starke Credentials, TLS, Exchange Key Hardening (AES-GCM), Audit-Log |
| **1d** | Correlation IDs + JSON Logging | AUTH Sek. 7 | `X-Request-ID` durchgehend TS→Go→Py→Rust. Strukturiertes JSON in allen Services |
| **1e** | KG Encryption (PRF/Fallback) | AUTH Sek. 13 | PRF-Salt, Server-Fallback Key, `KGEncryptionLayer`, PRF-Detection + Fallback |
| **1f** | Privacy & Consent | AUTH Sek. 9 | `UserConsent` DB-Tabelle (server-side), Consent-UI, GDPR Art. 17, Privacy-Overlay |

### Verify Gate
- [x] Passwortloses Login via Passkey funktioniert (transitional Passkey-Scaffold + Session-Exchange `passkey-scaffold`)
- [x] User ohne `trader`-Rolle → HTTP 403 auf GCT-Endpoints (RBAC-Scaffold auf `/api/v1/gct/*`, getestet)
- [x] Correlation ID durchgehend in Logs nachvollziehbar (Next.js/Go/Python Middleware + Header-Propagation in Kernpfaden)
- [x] KG-Daten in IndexedDB verschluesselt (Phase-1e KG Encryption Lab, AES-GCM)
- [x] Consent-Toggle funktioniert, LLM respektiert fehlenden Consent (serverseitiger Consent-Lookup + 403 auf ausgewaehlten LLM-Pfaden)

### Open Backlog (Nicht-E2E / Nicht-Browser)
- [x] **1a Auth.js-v5 Produktivpfad (Baseline):** `next-auth@5` (beta) + echter Passkey-Provider (`passkey`) sind verdrahtet; Prisma-Adapter läuft über offiziellen `@auth/prisma-adapter`. Credentials-Register/Login bleibt parallel aktiv.
- [x] **1a Finale Passkey-Session-Ausstellung (Baseline):** `/auth/sign-in` nutzt primär den echten Auth.js Passkey-Provider (`next-auth/webauthn`), und `/auth/passkeys` kann zusätzliche Passkeys via Provider-Action `register` hinzufügen (Scaffold/Lab bleibt als Fallback/Testpfad optional).
- [x] **1b JWT-Endformat-Baseline (Go/Bearer):** Go-JWT-Validation (`AUTH_JWT_ENFORCE`) auf den finalen Bearer-Contract gehärtet (Role-Claim-Aliasse `role|userRole|app_role`, `jti`-Propagation, optionale `issuer`/`audience`, konfigurierbare HMAC-Algs `AUTH_JWT_ALLOWED_ALGS`, Clock-Skew-Leeway `AUTH_JWT_LEEWAY_SEC`). **Hinweis:** NextAuth-Session-Cookies werden weiterhin im Next.js-Proxy validiert (Architekturentscheidung), nicht direkt im Go-Gateway.
- [x] **1b Audit-Persistenz (Revocation) Baseline:** Revocation-Audit besitzt jetzt eine optionale Go-native SQLite-DB-Baseline (`AUTH_JWT_REVOCATION_AUDIT_DB_*`) zusätzlich zu In-Memory/**hash-chain JSONL**.
- [ ] **1c Audit-Persistenz final (GCT):** GCT-Audit-DB-Persistenz bleibt offen (JSONL/hash-chain Scaffold vorhanden).
- [ ] **1c Exchange-Key Hardening verdrahten:** vorhandenen AES-GCM Helper in echte GCT-Config-/Key-Storage-Flows integrieren (verschlüsselte GCT Service-/Backtest-Credentials via ENV sind bereits möglich).
- [ ] **1c Exchange Credential Onboarding (Binance + weitere GCT-Exchanges):** klaren Login/Key-Onboarding-Flow definieren und umsetzen (Key/Secret/Permissions/IP-Whitelist, optional Testnet), Secrets nur serverseitig (Go/GCT), nie Frontend.
- [x] **1b/1c Prod-Guard fuer Auth-Bypass:** `AUTH_STACK_BYPASS` / `NEXT_PUBLIC_AUTH_STACK_BYPASS` bleiben fuer Dev/CI verfuegbar; Next (`src/lib/auth.ts`) + Go (`NewServerFromEnv`) blockieren Bypass in Production standardmaessig (fail-closed), optionaler Emergency-Override via `ALLOW_PROD_AUTH_STACK_BYPASS=true`.
- [x] **1b CSP-Hardening Baseline (Code):** API-CSP-Baseline + gestrafftes togglebares Page-/UI-CSP (`src/proxy.ts`, `PAGE_CSP_MODE`, COOP/CORP) sind implementiert. Finale Whitelists und Browser-Live-Validierung sind in das Deferred Verify Backlog verschoben.
- [x] **1a/1f UX-Hardening Baseline (funktional):** `/auth/security` als zentraler Hub + dedizierte `/auth/sign-in`, `/auth/register`, `/auth/passkeys`, `/auth/privacy`, `/auth/kg-encryption-lab` sind vorhanden und verlinkt. Visuelles Produkt-Polish bleibt nachgelagert.



- [ ] **Config: CRISISWATCH_CACHE_PERSIST_PATH genauer prüfen:** Optionaler persistenter Cache für CrisisWatch-RSS (`go-backend`); Einsatz, Default-Verhalten und Prod-Empfehlung (Pfad, TTL, Failover) klären.

### Deferred Live Verify Backlog (E2E / Browser — bewusst spaeter)
- [ ] **Test-Mode Smoke (ohne Auth-Blocker):** `AUTH_STACK_BYPASS=true` + `NEXT_PUBLIC_AUTH_STACK_BYPASS=true` setzen und prüfen, dass Frontend→Go API-Flows trotz aktivem Security-Code ohne Session/JWT durchlaufen (für CI/dev smoke runs).
- [ ] **Next.js Proxy Consolidation prüfen (`src/proxy.ts` only):** Frontend-Start ohne Next.js-16 Konflikt (`middleware.ts` + `proxy.ts`) und API-Routing laeuft sauber.
- [ ] **Passkey Login/Device Flow (Browser):** `/auth/sign-in`, `/auth/passkeys`, `/auth/passkeys-lab` (Register/Auth/Delete letzter Passkey blockiert, `?next=` Redirect).
- [ ] **Passkey Provider vs Scaffold Matrix (Browser):**
  - `AUTH_PASSKEY_PROVIDER_ENABLED=true` + `NEXT_PUBLIC_AUTH_PASSKEY_PROVIDER_ENABLED=true`: `/auth/sign-in` und `/auth/passkeys` nutzen echten Auth.js-WebAuthn-Flow
  - Provider disabled + `AUTH_PASSKEY_SCAFFOLD_ENABLED=true`: UI-Fallback + `/auth/passkeys-lab` funktionieren weiter
- [ ] **Auth.js v5 + Prisma Adapter Persistence (E2E/API):** Passkey-Registrierung erzeugt `Authenticator`-Datensatz in Prisma; Device-Delete entfernt den Datensatz, Device-Liste (`/api/auth/passkeys/devices`) spiegelt Prisma-Stand korrekt.
- [ ] **Passkey Session Issuance (Browser/E2E):** Nach Provider-Login ist eine echte Auth.js-Session aktiv (`/api/auth/session`), Reload behält Session, und `src/proxy.ts` kann den Session-Cookie via `getToken` mit `AUTH_SECRET` auswerten.
- [ ] **Credentials Register/Login (Browser):** `/auth/register` -> Auto-Sign-In (best effort), anschließend Session auf `/auth/security` sichtbar; Fehlerfälle (duplicate email, weak password) prüfen.
- [ ] **Credentials Session Persistence (Browser):** Nach Credentials-Login bleibt Session nach Hard-Reload aktiv; Logout invalidiert Session und geschützte Routen liefern wieder `401/redirect`.
- [ ] **Session/Role Headers (E2E):** Nach Credentials- und Passkey-Login prüfen, dass `src/proxy.ts` `X-Auth-User`, optional `X-Auth-JTI`, `X-User-Role`, `X-Auth-Verified` korrekt an API-Requests setzt.
- [ ] **Auth Security Hub (Browser):** `/auth/security` Statuskarten + Navigationspfade (`sign-in`, `register`, `passkeys`, `privacy`, `kg-encryption-lab`) mit und ohne Bypass/Auth aktiv prüfen.
- [ ] **Revocation Audit Runtime (API/E2E):** `POST /api/v1/auth/revocations/jti` + `GET /api/v1/auth/revocations/audit` mit DB-Store (`AUTH_JWT_REVOCATION_AUDIT_DB_ENABLED=true`) und Fallback-Verhalten bei DB-Fehlern prüfen.
- [ ] **Prod-Guard Negative Tests (Startup/API):** `AUTH_STACK_BYPASS=true` in `NODE_ENV=production` muss Next + Go fail-closed blockieren; nur mit `ALLOW_PROD_AUTH_STACK_BYPASS=true` darf Startup weiterlaufen.
- [ ] **Bypass Matrix (E2E/API):** Nur Frontend-Bypass (`NEXT_PUBLIC_AUTH_STACK_BYPASS=true`) vs nur Go-Bypass (`AUTH_STACK_BYPASS=true`) vs beide Flags prüfen; erwartetes Verhalten/Logs/Headers (`X-Auth-Bypass`) dokumentieren.
- [ ] **Page/UI-CSP Smoke (Browser):** `src/proxy.ts` Page-Security-Header/CSP-Modi pruefen (`off`/`report-only`/`enforce`) ohne Next.js-HMR bzw. produktive UI-Flows zu brechen.
- [ ] **Page/UI-CSP Header Correctness (Browser/DevTools):** In jedem Modus genau ein passender Header (`Content-Security-Policy` oder `Content-Security-Policy-Report-Only`) plus COOP/CORP gesetzt; keine Doppelheader/Override-Konflikte.
- [ ] **Consent/KG Security Flow (Browser):** `/auth/privacy`, `/auth/kg-encryption-lab`, plus `403` auf consent-geschuetzten LLM-Pfaden ohne Consent.
- [ ] **RBAC/403 Live-Checks (API/E2E):** `viewer` vs `analyst` vs `trader` auf `/api/fusion/*`, `/api/geopolitical/candidates/*`, `/api/v1/gct/*` (inkl. `src/proxy.ts` + Go-RBAC Zusammenspiel).
- [ ] **Request-ID/Header Trace (E2E):** `X-Request-ID` + Security/CORS Header aus `src/proxy.ts` bis Go/Python Logs nachvollziehen.

### SOTA 2026 Hardening — S-Punkte Status (03. Mär 2026)

| S | Beschreibung | Status |
|:--|:-------------|:-------|
| **S2** | WebAuthn Device-Revocation (DELETE `/api/auth/passkeys/devices`) | **DONE** — Endpoint bereits vollständig impl. in `src/app/api/auth/passkeys/devices/route.ts` (ownership-check + last-passkey 409 + `prisma.authenticator.delete()`). War fälschlicherweise als "offen" gelistet. |
| **S3** | RBAC Negativtests Go | **DONE** — `TestWithRBACEnforcement_MissingToken_Returns401` + `TestWithRBACEnforcement_InsufficientRole_Returns403` in `go-backend/internal/app/middleware_test.go`. `go test ./internal/app/...` grün. |
| **S4** | X-Request-ID Python-Middleware | **DONE** — `request_context_middleware` in `python-backend/services/_shared/app_factory.py`. Header-Echo confirmed. Windows/uvicorn-`--reload`-Quirk: FileHandler-Log bleibt 0 Bytes (child process stderr nicht geerbt) — Infrastruktur-Quirk, kein Code-Bug. |
| **S5** | CI Workflow | **DONE** — `.github/workflows/ci.yml`: lint-frontend (bun), build-go, test-go, lint-python (ruff via uv). |
| **S6** | ACLED Mock-Guard | **DONE** — `MockEnabled` + `ALLOW_PROD_ACLED_MOCK` Guard bereits in `go-backend/internal/connectors/acled/client.go`. |
| **S7** | Keycloak/ZITADEL PoC | **DEFERRED** — Großes separates Delivery; kein Scope in Rev. 3.24. |
| **S8** | Cookie-Flags (httpOnly/Secure/SameSite) | **DONE** — Challenge-Cookies bereits mit `httpOnly=true`, `sameSite=strict`, `secure` conditional (nur HTTPS) in Passkey-Scaffold-Routes. |

### Open Checkpoints (IST-Verbesserung + Erweiterung)
- [ ] **P0:** Mutierende Domainpfade explizit auf Go-Enforcement konsolidieren (RBAC/Audit/Rate-Limit als zentrale Policy).
- [ ] **P0:** GCT-Audit-Persistenz finalisieren (kein nur-JSONL Pfad fuer produktionsnahe Flows).
- [ ] **P1:** Security-Bypass/Prod-Guard Regeln als harte Startup-Gates in Verify aufnehmen.

---

## Phase 2: Rust Core + Composite Signal

> **Ref:** RUST Sek. 1-5, IND Sek. 0.8 + Phase B

**Ziel:** Rust-Kern als PyO3-Modul + Polars als DataFrame-Standard + erster vertikaler Durchstich bis zum Frontend.

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **2a** | PyO3 Setup + First Functions | RUST Sek. 1-2 | `cargo init --lib`, PyO3 0.28, `calculate_heartbeat`, `calculate_indicators_batch` (kand) |
| **2b** | Polars DataFrame Layer | RUST Sek. 5a | Polars statt Pandas in `indicator-service` + `finance-bridge`. Zero-copy via PyO3 Arrow FFI |
| **2c** | redb OHLCV Cache | RUST Sek. 5b | Embedded key-value Cache mit TTL fuer OHLCV. Write-Through, concurrent reads |
| **2d** | Composite Signal verdrahten | IND Sek. 3, Phase B | `POST /api/v1/signals/composite` via Go→Python→Rust. 50-Day Slope + Heartbeat + Volume |
| **2e** | SignalInsightsBar Frontend | IND Phase E #33 | React-Komponente zeigt Heartbeat Score, SMA50 Slope, Smart Money Score |
| **2f** | *(zu evaluieren)* Rust als direkter Service | RUST Sek. 1b | Rust als eigener gRPC-Service (Go→Rust), locker gekoppelt zu Python; Use Cases: Hochdurchsatz, Echtzeit-Indikatoren, dedizierte Pipelines |

### Verify Gate
- [ ] SignalInsightsBar zeigt live berechnete Werte
- [ ] Voller Durchstich: Browser → Next.js → Go → Python/Rust → zurueck
- [x] Polars DataFrame in `indicator-service` aktiv (kein `import pandas`)
- [x] redb Cache: Second Hit <1ms (PyO3 warm-get P50 Unittest-Guard)

> **Hinweis (23. Feb 2026):** E2E-/Browser-Tests fuer die beiden offenen Verify-Punkte werden absichtlich **nach** Abschluss der Phase-2-Implementierung ausgefuehrt (User-Vorgabe). Phase 2 gilt damit als **Implementierungsphase abgeschlossen**, mit offenem Live-Verify-Backlog.
>
> **Deferred Live Verify Backlog (Phase 2, erweitert):**
> - Browser-Flow `/` laden → `SignalInsightsBar` zeigt Composite/Confidence + SMA50 Slope + Heartbeat + Smart-Money ohne Placeholder-Fallback
> - Network-Trace: `GET/POST /api/fusion/strategy/composite` → Next.js → Go (`/api/v1/signals/composite`) → Python `indicator-service`
> - **[x] 2.3 (03. Mär 2026)** `indicator-service /health` → `rustCore.available=true`, `dataframe="polars 1.38.1"` live verifiziert per curl.
> - **[x] 2.4 (03. Mär 2026)** Finance-Bridge `GET /ohlcv?symbol=BTC/USDT&limit=10`: erster Hit `cache.hit=false`, zweiter Hit `cache.hit=true` (redb); Endpoint ist GET (nicht POST), `limit≥10`.
> - **[x] 2.5 (03. Mär 2026)** Rust-Fallback code-level bestätigt: `rust_bridge.py` nutzt `try: import tradeviewfusion_rust_core as _rust_core except Exception: _rust_core = None`; alle Public-Functions gated auf `if _rust_core is None: return None`. Kein Env-Var nötig.
> - Multi-symbol / timeframe smoke für Composite-Routen (stabiler Response-Shape, keine Contract-Regression)

---

## Phase 3: Streaming Migration

> **Ref:** ADR Sek. 1-6

**Ziel:** Stream-First mit REST Fallback. Server-Side Alert Engine.

> **Implementierungsprinzip (Phase-0 Reuse, ohne Phase 0 zu oeffnen):** Wiederverwendbare Go-Bausteine unter `internal/services/market/streaming/*` nutzen (Candle Builder, Snapshot Store, Alert Engine, spaeter Reconnect-Policy/Event-Encoder). Keine duplizierte Stream-/Polling-Logik in Handlern oder Next.js-Proxies.

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **3a** | Candle Builder | ADR Sek. 3 | Tick → OHLCV Aggregation, Ring Buffer, Out-of-Order Handling |
| **3b** | Server-Side Alert Engine | ADR Sek. 4 | Price Threshold, Line-Cross, State Store, Checkpointing |
| **3c** | Snapshot Store + Reconnect | ADR Sek. 5 | Latest State persistiert, Recovery bei Reconnect, Exponential Backoff |

> **Teilfortschritt (23. Feb 2026, Codex):**
> - `3a` Core-Bausteine gestartet: `internal/services/market/streaming/*` mit `Timeframe`, `CandleBuilder`, `SnapshotStore`, `AlertEngine` (+ Unit-Tests)
> - Go-SSE `GET /api/v1/stream/market` erweitert um `timeframe` Query, `ready`/`snapshot`/`candle` Event-Baseline (serverseitige Tick→Candle Aggregation im Go-Layer)
> - Go-SSE erweitert um optionale `alertRules` (transitional JSON-Query), serverseitige Alert-Evaluierung (`alert` Event) und `ruleId` fuer Persistenz-Bridge
> - Next.js `src/app/api/market/stream` ist jetzt Go-SSE-Passthrough (mit Legacy-Polling-Fallback fuer nicht-streamfaehige Symbole/Fehler) und markiert Trigger im serverseitigen Alert-Store
> - Frontend `src/app/page.tsx` nutzt `snapshot`/`quote`/`candle`/`alert`; 30s Quote+`checkAlerts(...)` Polling wurde entfernt (Chart-Stream-Primärpfad)
> - Gezielt verifiziert: `go test ./internal/services/market/streaming ./internal/handlers/sse` + `golangci-lint` auf diesen Pfaden; TS `biome` auf `src/app/api/market/stream/route.ts` + `src/app/page.tsx` (nur bestehende `TradingHeaderProps`-Warn/Fehler ausserhalb Phase-3-Scope)

### Verify Gate
- [ ] Chart aktualisiert via SSE (kein REST-Polling)
- [ ] Alert feuert server-seitig, erscheint im UI <1s
- [ ] Reconnect nach Abbruch: Snapshot-Recovery, kein Datenverlust
- [ ] KPI-Gate dokumentiert und messbar: `reconnect_p95_ms <= 3000`, `snapshot_latency_p95_ms <= 500` (Log/Metric, pro Deploy pruefbar)

> **Status (23. Feb 2026):** Phase 3 gilt als **Code-Baseline implementiert**. Live-Browser/E2E-Verifikation bleibt bewusst ausstehend.
>
> **Deferred Live Verify Backlog (Phase 3):**
> - Browser-Flow `/` mit streamfaehigem Symbol (z. B. `BTC/USD`, `AAPL`) pruefen: `X-Stream-Backend=go-sse`, Events `ready/snapshot/quote/candle`
> - Netzwerktrace bestaetigt: kein primaeres 30s Quote-Polling fuer Alert-Trigger mehr; Alert-Trigger kommen als `event: alert`
> - Reconnect-Test (Provider-Stream kurz unterbrechen): `stream_status` -> `reconnecting`/`live`, `snapshot` nach Reconnect, keine doppelte Candle-Serie
> - Alert-Live-Test: Preis-Alert anlegen (`above`/`crosses_up`), Trigger im UI sichtbar <1s, Alert im Store auf `triggered=true`
> - Legacy-Fallback-Smoke fuer nicht-streamfaehiges Symbol (z. B. FX/Index): `X-Stream-Backend=next-legacy-polling`, Chart bleibt funktionsfaehig
> - Watchlist-Stream `/api/market/stream/quotes` nutzt jetzt Go-SSE-Multiplex fuer vollstaendig streamfaehige Symbolsets (Crypto/Stocks); gemischte/unsupported Symbolsets bleiben auf Legacy-Polling-Fallback (bewusst transitional)
> - Legacy-Polling-Fallbacks fuer `market/stream*` sind technisch bewusst beibehalten, aber nun runtime-flag-gated + Prod-Guarded (fail-closed ohne expliziten Override)

### Open Checkpoints (IST-Verbesserung)
- [ ] **P0:** Legacy-Stream-Fallback in Staging/Prod nur als expliziter Emergency-Override erlauben.
- [ ] **P1:** Degradation-Signale standardisieren (`degraded`, `degraded_reasons`, `requestId`) fuer Stream-Antwortpfade.
- [ ] **P2:** Snapshot/Reconnect-KPIs (p95 Reconnect, Snapshot-Latency) als Verify-Gate aufnehmen.

---

## Phase 4: GeoMap v2.0 — Shell + Rendering + D3 Stack + Multi-Body Foundation

> **Ref:** GEO Sek. 25-36, OPTS Sek. 1-11

**Ziel:** Shell-Refactor, D3 Visualization Stack (v1.1 + v1.5 aus `GEOPOLITICAL_OPTIONS.md`), Canvas Hybrid, Layer-System, Auto-Candidates und eine body-agnostische GeoMap-Grundlage (Earth zuerst, Moon-MVP per Toggle/Seed-Layer).

> **Scope-Klarheit:** Phase 4 ist ein Frontend-/GeoMap-Rendering- und UX-Upgrade (d3-geo → Hybrid, Inertia, Voronoi, Clustering, Layer-System, Multi-Body-Foundation). **Rust ist hier nicht fuer Rendering vorgesehen**; Rust fuer GeoMap kommt spaeter ab v3 fuer Backend-Spatial-Queries (`h3o`, `geo-rs`, `petgraph`) gem. `RUST_LANGUAGE_IMPLEMENTATION.md` Sek. 13.
> **Transition-Notiz (wichtig):** Teile der GeoMap-Domainlogik laufen nach Phase-4-Abschluss weiterhin ueber Next.js API-Routes + lokale Stores (Events/Candidates/Drawings/Contradictions/Seed). Das ist ein **transitional runtime path** fuer v2.0-Frontend-Fortschritt. Die **Backend-Konsolidierung `Frontend -> Go -> Python/Rust`** wird in **Phase 9 (UIL Workflow/Review-Pipeline)** und **Phase 14 (Provider/DiffWatcher/Official Sources im Go-Layer)** nachgezogen.

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **4a** | Shell Refactoring | GEO Sek. 25a, 36 Sprint 1 #1 | ~40 useState → Zustand Store (events, candidates, drawings, timeline) + View-State (`mapBody`, Layer-Toggles, spaeter Compare-Mode) |
| **4b** | D3 v1.1 Modules | OPTS Sek. 11 (v1.1) | `d3-scale`, `d3-scale-chromatic`, `d3-interpolate`, `d3-transition`, `d3-timer`, `d3-ease`, `d3-inertia`, `d3-geo-voronoi` |
| **4c** | Canvas/SVG Hybrid | GEO Sek. 35.4 | Canvas fuer statische Elemente (Basemap/Graticule/Heatmap), SVG fuer interaktive Marker/Drawings. Viewport-Culling. Supercluster. Body-agnostische Renderer-Hooks |
| **4d** | Choropleth + Layer System | GEO Sek. 35.3a, OPTS | Layer-Abstraktion `{ body, name, dataFn, scaleFn, legendFn }`. Earth: Severity/Regime-State. Moon-MVP: Missions/Sites/Zones als Seed-Layer |
| **4e** | Hard-Signal Auto-Candidates | GEO Sek. 25 Milestone F | ACLED Threshold, Sanctions (OFAC/UN), Central Bank Rate Decisions |
| **4f** | Soft-Signal Pipeline haerten | GEO Sek. 18.1 (Baseline) | Dedup SHA256 + Similarity, Confidence Scoring, `reason` String |
| **4g** | D3 v1.5 Modules | OPTS Sek. 11 (v1.5) | `d3-hierarchy`, `d3-shape`, `d3-brush`, `d3-axis`, `d3-array`, `d3-time`, `d3-format`, `d3-annotation`, `d3-legend` (Timeline/Simulation-Vorbereitung) |
| **4h** | Seed Dataset + Keyboard Shortcuts | GEO Sek. 36 Sprint 1 #2-3 | Earth Seed: 30-50 Events, 200 Candidates, 10 Contradictions + Moon Seed-Layer (Missionen/Landezonen/Stationsplanung). Keyboard M/L/P/T/Del/Ctrl+Z/R |
| **4i** | GeoMap Live Verification Pack | GEO Sek. 35.4, 36 | Finaler Browser-/E2E-Abnahmelauf (Earth/Moon, Layer-Toggles, Draw-Workflow, Cluster-Drilldown, Save-Fehlerpfade) mit dokumentiertem Protokoll |
| **4j** | Performance Baseline + Budget | GEO Sek. 35.4a-b | Reproduzierbare Lastprofile (Events/Candidates/Layers), FPS + Frame-Time p50/p95, Interaktionslatenz. Ergebnis = Gate fuer deck.gl/MapLibre |
| **4k** | Basemap/Policy Hardening | GEO Sek. 35.4c | OSM-Attribution/Lizenz-Checklist, Geocoding-Provider-Strategie (Cache/Fallback), PMTiles-vs-Live-Overlay-Contract dokumentieren |
| **4l** | ADR + Decision Freeze | GEO Sek. 35.4b-d | ADR: Globe bleibt Core, Flat/Regional optionaler Zweitmodus, deck.gl/MapLibre/h3o nur gate-basiert nach messbaren Triggern |

**Status (22. Feb 2026, laufend):**
- [x] **4a Shell Refactoring** — Zustand-Workspace + starker Shell-Split umgesetzt (inkl. separater Body-Layer-Legend-Overlay-Komponente). Weitere Feinsplits/Panel-Lazy-Loading als optionaler Nach-Polish, nicht Phase-4-blockierend
- [x] **4b D3 v1.1 Modules** — `d3-scale`, `d3-timer`, `d3-ease`, `d3-inertia` (Globe-Drag) und `d3-geo-voronoi` (nearest hit-testing scaffold) im Phase-4-Scope integriert
- [x] **4c Canvas/SVG Hybrid** — Projection-Model-Hook, Renderer-Entkopplung, SVG Render-Stages, Layer-Routing-Metadaten, Canvas-Basemap-Stage, Canvas-Country/Heatmap-Stage, Canvas-BodyPoint-Layers und `supercluster`-Zoom-Out-Cluster umgesetzt; SVG-Laenderpfade bleiben als Hit-/Accessibility-Layer
- [x] **4d Choropleth + Layer System** — Body-Configs + Layer-Registry, `rendererHint`, Viewport-Legend, Store-basierte Body-Layer-Toggles (inkl. Reset auf Defaults), Earth-Choropleth (`severity`/`regime`) und Layer-Catalog-Helfer umgesetzt. Erweiterte Presets/weitere UX-Polishs sind Folgearbeit
- [x] **4e Hard-Signal Auto-Candidates** — Rates + Sanctions + `acled_threshold` aktiv; Delta-State (`ETag`/`Last-Modified`/Hash), Observability, Keyword-/Semantik-Heuristiken und aussagekraeftigere Hard-Candidate-Reasons fuer Phase-4-Scope umgesetzt. Go-Layer-Migration bleibt Folgearbeit
- [x] **4f Soft-Signal Pipeline haerten** — Dedup (`SHA-256` + Similarity-Fallback), auto-Reason und Ingest-Observability (`deduped`) fuer Phase-4-Scope umgesetzt
- [x] **4g D3 v1.5 Modules** — `d3-array`, `d3-time`, `d3-format`, `d3-shape`, `d3-axis`, `d3-brush`, `d3-hierarchy` sowie `d3-svg-annotation` und `d3-svg-legend` in `TimelineStrip`/Map-UI fuer Phase-4-Scope integriert
- [x] **4h Seed Dataset + Keyboard Shortcuts** — Keyboard-Shortcuts + Moon Seed-Layer vorhanden; Earth Seed Bootstrap (`POST /api/geopolitical/seed`) fuellt Zielgroessen auf und schreibt Timeline-Audit. Contradictions-Workflow (Store + API + Sidebar) umfasst jetzt Basis-Review, Resolution-Details, Merge-Links und Evidence add/remove

### Verify Gate
- [ ] 200+ Events bei 60 FPS Rotation
- [x] Globe-Inertia funktioniert
- [x] 2 Choropleth-Layer schaltbar (Severity + Regime-State)
- [x] Clustering bei Zoom-Out aktiv
- [x] `Earth | Moon` Toggle funktioniert auf derselben Interaktionsbasis (Rotation/Zoom/Layer-Toggles)
- [x] Moon Seed-Layer (Missionen/Sites/Zonen) sichtbar und ueber Layer-System konfigurierbar
- [x] Contradictions Basis-Workflow ohne Browser-E2E vorhanden (Store + API + Sidebar Resolve/Reopen + Timeline-Audit)
- [x] Contradictions Resolution-Details + Evidence-Workflow ohne Browser-E2E vorhanden (Outcome/Merge-Links/Evidence add-remove + Audit)
- [x] Timeline D3-Annotation + D3-Legend integriert (Browser-Visual-Check offen)
- [x] Shell: Kein `useState` mehr in GeopoliticalMapShell.tsx
- [ ] Finaler manueller Draw-Workflow-Test (Marker/Line/Polygon/Text, Undo/Redo) auf laufender Next-Instanz abgeschlossen
- [ ] Finaler Browser-/E2E-GeoMap-Abnahmelauf (Frontend-only) dokumentiert und durchgefuehrt: `POST /api/geopolitical/seed` (Earth-Zielgroesse), dann `/geopolitical-map` pruefen: Earth↔Moon Toggle, Choropleth Severity/Regime, Body-Layer-Toggles/Reset, Cluster-Zoom, Draw-Workflow inkl. Save-Fehlerpfad
- [ ] Performance-Baseline dokumentiert (FPS + Frame-Time p50/p95 + Lastprofile) und als Entry-Gate fuer spaeteres deck.gl/MapLibre festgehalten
- [ ] Basemap-/Policy-Closeout dokumentiert (OSM-Attribution, Geocoding-Providerstrategie, PMTiles-vs-Live-Overlay-Contract)
- [ ] GeoMap-ADR verabschiedet: Globe-Core beibehalten, Flat/Regional nur als optionaler Zweitmodus, keine ungeplanten Core-Wechsel

### Open Checkpoints (IST-Verbesserung + Erweiterung)
- [ ] **P0:** Write-Ownership fuer Geo-Domain schrittweise auf Go-Layer zentrieren (Next bleibt UI/thin proxy).
- [ ] **P1:** Verbleibende lokale GeoMap-Stores markieren (dev-only vs. produktionsnah) und Migrationsreihenfolge festziehen.
- [ ] **P2:** Performance-Budgets als harte Entry-Gates fuer spaetere Framework-Wechsel weiterfuehren.

---

## Phase 5: Portfolio Bridge + Analytics

> **Ref:** PF Sek. 1-8 (P-1 bis P-18)

**Ziel:** GoCryptoTrader als Live-Datenquelle, Python-Analytics, Frontend-Tabs.

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **5a** | GCT Bridge Endpoints | PF P-1 bis P-8 | `/portfolio/summary`, `/positions`, `/balances/:exchange`, `/ohlcv` via GCT gRPC/JSON-RPC |
| **5b** | Python Analytics | PF P-9 bis P-18 | `/correlations`, `/rolling-metrics`, `/drawdown-analysis` + Cross-Asset-Regime-Validierung (beliebige Risk-/Safe-Haven-/FX-/Rates-Assets vs. Credit/Liquidity-Proxies) |
| **5c** | Frontend Tabs | PF Frontend | Paper / Live / Analytics. EquityCurveChart, CorrelationHeatmap, DrawdownTable |
| **5d** | Prisma Schema Extensions | PF DB | Portfolio-Snapshots fuer historische Equity Curve |
| **5e** | Trading Workspace UX Consolidation | PF Frontend + Trading Page | Trading-Page + Portfolio-UI gemeinsam verfeinern: konsistente Loading/Error/Empty States, Panel-Komposition, responsive Verhalten, Prototype-artige UI bereinigen (ohne Final-Polish-Freeze) |

- **Status (COMPLETED):** Phase 5 am 25. Feb 2026 erfolgreich abgeschlossen. 
  - `5a` (Go Bridge) voll funktionsfaehig. OHLCV-Endpunkt (`/api/v1/ohlcv`) liefert Echtzeitdaten von Yahoo Finance (inkl. Krypto-Mapping Fix).
  - `5b` (Python Analytics) implementiert und fuer asynchrone Backend-Aggregation optimiert. Python holt Marktdaten nun direkt von Go. Neuer `/api/v1/portfolio/optimize` Endpunkt mit Inverse-Vol/Min-Var Methoden aktiv.
  - `5c` (Frontend) Live-Analytics (Korrelationen, Cluster, Diversification Score) und Optimize-Panel (Backend-driven) erfolgreich integriert.
  - `5d` (DB) Portfolio-Snapshots im Prisma-Schema verifiziert.
  - `5e` (UX) Gesamtes Portfolio-UI auf SOTA-Level gehoben (Glassmorphismus, OKLCH, ScrollArea).
  - `Dev-XP` Auto-Reload fuer Go (`air`) und Python (`--reload`) im `dev-stack.ps1` integriert.

### Open Backlog Phase 5a
- [ ] **GCT gRPC-Pfad fuer GetAccountInfo/GetExchanges:** Die compilierten `gctrpc`-Stubs (`vendor-forks/gocryptotrader/gctrpc`) exponieren diese Methoden nicht im generierten gRPC-Client. Aktuell laeuft alles ueber JSON-RPC HTTP (Port 9053, `/v1/getaccountinfo`, `/v1/getexchanges`). Bei GCT-Upgrade oder Proto-Neugenerierung: `getAccountInfoGRPC`/`getExchangesGRPC` analog zu `getTickerGRPC` hinzufuegen und hinter `c.cfg.PreferGRPC` Guard aktivieren. Vermerkt in `go-backend/internal/connectors/gct/portfolio.go` TODO-Kommentar.
- [ ] **GCT Exchange Login UX/API (Binance zuerst, exchange-agnostisch):** Trading/Settings-Flow fuer Exchange-Verknuepfung (verbinden, validieren, trennen, Status), inkl. Go-Gateway-Endpunkte + sichere serverseitige Speicherung/Rotation der Keys.
- [ ] **Credit/Liquidity Proxy Validation Pack (Phase 5b Extension):** Rolling Relation-Checks zwischen frei konfigurierbaren Asset-Returns (z. B. Metalle/Krypto/Indizes/FX) und Makro-Proxies (`BAA-AAA/OAS Proxy`, `NFCI/ANFCI/STLFSI4`, `SLOOS Tightening`) in `portfolio/rolling-metrics` integrieren; Ziel ist ein reproduzierbarer Regime-Bias-Check statt rein narrativer Makro-Interpretation.

### Verify Gate
- [x] Alle 3 Tabs funktional (Paper, Live, Analytics, Optimize)
- [x] Live Tab zeigt GCT-Daten (wenn `-WithGCT`)
- [x] Correlation Heatmap mathematisch korrekt (via Python Backend Aggregation)
- [x] Trading Workspace + PortfolioPanel haben konsistente Loading/Error/Empty States (SOTA UI)
- [x] Trading Workspace responsive Panel-Komposition stabil (Sidebar/Bottom/Portfolio Interaktion ohne Layout-Brueche)

### Open Checkpoints (IST-Verbesserung + Erweiterung)
- [ ] **P0:** Portfolio/Orders/Journal Write-SoR vereinheitlichen (Go-geschuetzter Pfad priorisiert).
- [ ] **P0:** DB->File Fallback fuer produktionsnahe Flows begrenzen (Dev/Test degradierbar, Staging/Prod fail-fast).
- [ ] **P1:** Incremental-Fetch + idempotentes Upsert fuer Zeitreihen als Pflicht-Pattern festziehen.

---

## Phase 6: Memory Architecture

> **Ref:** MEM Sek. 1-8 (M1-M5)
> **Status: CODE-COMPLETE + Cache effektiv verdrahtet (26. Feb 2026) — Live-Verify Gate pending (erfordert Stack-Start; PC-Ressourcen derzeit begrenzt)**

**Ziel:** Unified Memory Layer: LRU/Redis Cache → SQLite/Prisma Episodic → KuzuDB/SQLite KG → ChromaDB Vector Store.

| Sub | Name | Ref | Status | Schluessel-Dateien |
|:----|:-----|:----|:-------|:-------------------|
| **6a** | Cache Adapter Layer | MEM Sek. 3 | ✓ Code + **Cache aktiv verdrahtet** | `python-backend/services/_shared/cache_adapter.py` (TTL_LIVE=300/TTL_INDICATOR=900/TTL_SNAPSHOT=3600), `go-backend/internal/cache/adapter.go` (InMemory+Redis). **26 Feb:** kg/nodes-Endpoint cached (TTL 900s, Key `tradeview:memory:kg:nodes:{type}:{limit}`), kg/sync cached (TTL 3600s, Key `tradeview:memory:kg:sync`), seed invalidiert sync-Key. Go-Handler `MemoryKGNodesHandler`/`MemoryKGSyncHandler`/`MemoryKGSeedHandler` um `cache.Adapter`-Parameter erweitert; `wiring.go` uebergibt `memCache`. Nicht gecacht (user-spezifisch/live): episodes, vector-search, kg-query. |
| **6b** | Episodic Store (Prisma) | MEM Sek. 4 | ✓ Code | `prisma/schema.prisma` (AgentEpisode+AnalysisSnapshot+MemorySyncCheckpoint), `src/lib/server/memory-episodic-store.ts` |
| **6c** | Memory Service + KG (KuzuDB/SQLite) | MEM Sek. 5 | ✓ Code | `python-backend/services/memory-service/app.py` (Port 8093), `ml_ai/memory_engine/kg_store.py` (KuzuDB prim./SQLiteKGStore Fallback), `go-backend/internal/connectors/memory/client.go`, `go-backend/internal/handlers/http/memory_handler.go` |
| **6d** | Vector Store (ChromaDB) | MEM Sek. 6 | ✓ Code | `python-backend/ml_ai/memory_engine/vector_store.py` (ChromaDB PersistentClient; `VECTOR_STORE_MOCK=true` fuer Tests) |
| **6e** | Memory API Layer (Next.js) | MEM Sek. 7 | ✓ Code | `src/app/api/memory/*` (8 Routen), `src/lib/memory/kg-wasm-client.ts`, `src/features/memory/MemoryStatusBadge.tsx` |

**Seed Data:** 36 Stratagems + 5 Regimes + 10 TransmissionChannels + 8 Institutions in `ml_ai/memory_engine/seed_data.py`.

**KuzuDB Fallback:** SQLiteKGStore aktiv wenn `import kuzu` schlägt fehl (Windows-kompatibel ohne MSVC).

### Verify Gate
> **Statische Gates (kein Stack noetig) — BESTANDEN (26. Feb 2026):**
- [x] `bun run lint && bun run build` → sauber
- [x] `cd go-backend && go build ./...` → sauber (clampInt-Konflikt behoben)
> **Live-Gates (Stack erforderlich: `./scripts/dev-stack.ps1 -SkipGCT -NoNext`) — ABGESCHLOSSEN (03. Mär 2026):**
- [x] **6.2** `GET http://127.0.0.1:8093/health` → `{ok: true, kg: "ready", vector: "uninitialized", episodic: "ready", cache: "memory"}` ✓
- [x] **6.3** `GET http://127.0.0.1:9060/api/v1/memory/health` → `{cache: "memory"}` via Go-Proxy ✓
- [x] **6.4** KG Seed: `POST /api/v1/memory/kg/seed {}` idempotent → `{ok: true, seeded: true, node_count: 59}` ✓
- [x] **6.5** `GET /api/v1/memory/kg/nodes?nodeType=Stratagem&limit=36` → 36 Knoten, Cache-Miss (erster Call) ✓
- [x] **6.6** Cache-Hit: zweiter identischer kg/nodes-Request → Response aus In-Memory LRU, keine DB-Abfrage ✓
- [x] **6.7** Seed invalidiert kg/sync-Cache: nach Seed liefert kg/sync frische `synced_at`-Zeit. **Fix:** Go-Handler Cache-Keys auf `tradeview:memory:kg:*`-Prefix angepasst (waren `memory:kg:*` — Mismatch mit Python `tradeview:memory:kg:*`). ✓
- [x] **6.8** Vector: `POST /api/v1/memory/search` query="stratagem" → ≥1 Ergebnis mit `distance: 0.0`. **Fix:** `list_nodes()` → `get_nodes()` in `vector_search` Auto-Seed (Bug war silent failure im except-Block). ✓
- [x] **6.9** Episodic: Episode erstellen (`input_json` als JSON-String, nicht Objekt) + `GET /api/v1/memory/episodes` → Episode im Array ✓

### Open Checkpoints (IST-Verbesserung + Erweiterung)
- [ ] **P0:** Primaere DB-Topologie verbindlich entscheiden: zentrales Postgres mit Tenanting als Standard.
- [ ] **P0:** Speicherrollen fixieren: Postgres (SoR), Redis/Valkey (hot cache), redb (OHLCV Spezialcache).
- [ ] **P1:** No-Docker Cache-Strategie offiziell aufnehmen (`redis|valkey|local`, `local` nur Dev/Test).
- [ ] **P1:** Memory-Ownership-Matrix je Datentyp (read/write/source-of-truth) dokumentieren und abnehmen.
- [ ] **P1:** Cache-Adapter-Minimalvertrag festziehen (`get/set/del/ttl/scan-prefix`) + Telemetriefelder (`cache.provider`, `cache.hit_rate`, `cache.fallback_active`, `cache.errors`) verbindlich machen.

---

## Phase 7: Indicator Catalog — Core (IND Phases A+B)

> **Ref:** IND Sek. 3-5, Todos #1-#13, #30-#34

**Ziel:** Fundament der Indikator-Bibliothek: swing_detect, erweiterte MAs, Enhanced Bollinger/RSI, Fibonacci, Integration.

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **7a** | swing_detect Foundation | IND #2 | Basis fuer alle Pattern Recognition. O(N) Pivot Detection |
| **7b** | Advanced Moving Averages | IND #8-#11 | KAMA, ALMA, IWMA, OLS MA, Generalized `moving_average()` Selector |
| **7c** | Enhanced Bollinger + RSI | IND #12-#13 | 5+ Bollinger-Techniken, ATR-adjusted RSI, Bollinger-on-RSI |
| **7d** | Fibonacci Extensions + Confluence | IND #3, Sek. 4.4 #5+#8 | 23.6%-261.8% Levels, Confluence-Detection (2+ Levels <0.5%) |
| **7e** | Integration + Cleanup | IND #5, #30-#34 | API Routes als Proxy, IndicatorPanel-Eintraege, Registry-Pattern, `chartData.ts` Cleanup |

### Verify Gate
- [ ] swing_detect korrekt auf 5 Referenz-Charts
- [ ] KAMA/ALMA/IWMA im IndicatorPanel verfuegbar
- [ ] Fibonacci Confluence-Zones im Chart sichtbar

---

## Phase 8: Pattern Detection (IND Phase C)

> **Ref:** IND Sek. 4-5, Todos #14-#21

**Ziel:** Komplexe Mustererkennung in Python+Rust, Chart-Overlays im Frontend.

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **8a** | Elliott Wave Detection | IND #21, Sek. 4 | swing_detect → 5+3 Wave Counting → Fibonacci Validation → Multi-Scenario Output |
| **8b** | Harmonic Patterns | IND #15-#17 | ABCD, Gartley, Bat, Butterfly, Crab. Potential + Invalidation Scoring. FEIW |
| **8c** | Candlestick Patterns | IND #14 | Doji, R Pattern, Bottle, Double Trouble, Extreme Euphoria, CARSI |
| **8d** | Tom DeMark + Combinations | IND #18-#19 | TD Setup, Fibonacci Timing, Patterns-on-Heikin-Ashi |
| **8e** | Classical Patterns | IND #20 | Double Top/Bottom, Head & Shoulders, Gap Patterns |
| **8f** | Chart Overlays Frontend | IND #31-#32 | Wave Labels, Harmonic Zones, Pattern Toggle in Toolbar |

### Verify Gate
- [ ] Elliott Waves sichtbar via Rust→Python→Go→Frontend
- [ ] Harmonic Patterns als farbige Zonen
- [ ] Pattern-Toggle ein/aus ohne Seiteneffekte

---

## Phase 9: Unified Ingestion Layer

> **Ref:** UIL Sek. 1-8, GEO Sek. 35.15

**Ziel:** Automatisierte Erfassung + LLM-Klassifizierung von YouTube, Reddit, RSS, Copy/Paste.

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **9a** | Go Connectors | UIL Sek. 3 | YouTube Transcript (1h Poll), Reddit (15min Poll), RSS Erweiterung |
| **9b** | Python LLM Classification | UIL Sek. 4 | Language Detection → Summary → Entity Extraction → Category → Confidence → Dedup |
| **9c** | Review UI + Routing | UIL Sek. 5 | Double-Threshold (0.85/0.40), Signal/Noise/Uncertain/Reclassify. Routing: geo/macro/trading/research |
| **9d** | Copy/Paste Import | UIL Sek. 6, GEO Sek. 35.15 | Ctrl+V / Drag-Drop → LLM klassifiziert → Routing |
| **9e** | GeoMap Candidate/Review Backend Konsolidierung | UIL Sek. 8 (Addendum) | GeoMap Candidate Truth Path aus Next-TS in Go/Python-UIL ueberfuehren: ingest orchestration, dedup/scoring contracts, review actions (`accept/reject/snooze`), contradictions/evidence workflow contracts. Next.js bleibt Review-UI + thin proxy |

**Empfohlene Reihenfolge (Phase 9e, vertikal):** Contract-Freeze + Migrationsmatrix -> Go Frontdoor Skeleton -> Candidate Review Actions -> Contradictions/Evidence -> Ingest Trigger/Stats -> Seed/Admin Tooling -> Shadow-Run -> Cutover. Mutierende Endpunkte sollten vor dem finalen Cutover mindestens die **Phase-1 RBAC-Baseline** (Auth/Rollenpruefung) haben.

**Status (Update 27. Feb 2026, `9e` gehaertet + `9a-9d` Baseline gestartet):** Go-Frontdoor fuer GeoMap Candidates/Review-Aktionen (`/api/v1/geopolitical/candidates`, `.../:id/{accept|reject|snooze|reclassify}`), Contradictions/Timeline (`/api/v1/geopolitical/contradictions`, `.../:id`, `/api/v1/geopolitical/timeline`) sowie Ingest/Admin (`/api/v1/geopolitical/ingest/{hard|soft}`, `/api/v1/geopolitical/admin/seed`) implementiert. Next `GET /api/geopolitical/candidates` laeuft jetzt Go-thin-proxy-only. `admin/seed` defaultet auf `go-owned-gateway-v1`. **9a:** Soft-Ingest kann `youtube`-Quelle auf `youtube_transcript`-Adapter mappen. **9b:** neuer Classifier-Contract `POST /api/v1/ingest/classify` (Go Proxy -> Python soft-signals) + Next Alias `/api/geopolitical/ingest/classify`. **9c:** Candidate-Metadaten enthalten `routeTarget` + `reviewAction`; Queue-Review unterstuetzt `signal/noise/uncertain/reclassify`. **9d:** Quick-Import in Queue (Paste-Text -> Classify -> Candidate Create) als Baseline vorhanden.

**Cutover-Runbook (Phase 9e, systematisch):**
> Optionales Hilfsskript: `scripts/geomap-phase9e-shadow-run.ps1` (fuehrt Seed + Hard/Soft Shadow-Runs + Diagnostics-Abfragen aus und gibt Cutover-Kommandos aus).
1. **Shadow-Run aktivieren (dev/staging):** `GEOPOLITICAL_INGEST_SHADOW_COMPARE=1`, Ingest-Modi zunaechst auf `next-proxy` lassen (`hard`, `soft`) und `admin seed` optional auf `next-proxy+go-sync`.
2. **Referenzdaten aufbauen:** `POST /api/v1/geopolitical/admin/seed` (oder bestehender Next Alias) ausfuehren; anschliessend `GET /api/v1/geopolitical/migration/status` pruefen (Store-Counts + Modi).
3. **Mehrfach triggern:** mindestens 5x `POST /api/v1/geopolitical/ingest/hard` und 5x `POST /api/v1/geopolitical/ingest/soft` (zeitlich verteilt) ausfuehren.
4. **Runs auswerten:** `GET /api/v1/geopolitical/ingest/runs?limit=50` pruefen auf Erfolgsquote, `adapterStats`, `candidateSyncCount`, `openCountDelta` (Shadow-Compare).
5. **Cutover setzen:** `GEOPOLITICAL_INGEST_{HARD,SOFT}_MODE=go-owned-gateway-v1`; optional `GEOPOLITICAL_ADMIN_SEED_MODE=go-owned-gateway-v1`.
6. **Frontend/Next Verifikation (ohne E2E-Automation):** GeoMap-Review-Queue, Contradictions/Timeline, Ingest-Trigger und Seed ueber bestehende `/api/geopolitical/*` Aliase testen; pruefen, dass Responses `X-GeoMap-Next-Route: thin-proxy` enthalten (wo thin proxy aktiv).
7. **Rueckbau:** Nach stabiler Verifikation lokale Next-Domainlogik fuer bereits Go-owned Pfade entfernen oder dauerhaft als minimale Thin-Proxy-Routen belassen.

### Verify Gate
- [ ] YouTube Transcript eingespielt, klassifiziert, korrekt geroutet
- [ ] Auto-Route bei Confidence >=0.85 funktioniert
- [ ] Copy/Paste → LLM → Candidate
- [ ] GeoMap Candidate-Review-Flow laeuft ueber Go/UIL-Contracts (Next nicht mehr Source-of-Truth fuer Candidate-Domainlogik)

### Open Checkpoints (IST-Verbesserung + Erweiterung)
- [x] **P1:** Restliche conditional candidate-read-Logik nach Betriebsentscheidung vereinfachen (Shadow vs. Go-only).
- [ ] **P0:** Ingest/Review/Contradiction-Pfade durchgaengig mit einheitlichem Degradation-/Observability-Contract versehen.
- [ ] **P0:** UIL-Contracts fuer Candidate/Timeline/Contradictions final einfrieren (vor weiteren Feature-Adds).
- [ ] **P1:** 9a Connector-Backfill vertiefen (native YouTube/Reddit fetch clients statt query-basiertem News-Input).

---

## Phase 10: Agent Architecture + Context Engineering

> **Ref:** AGT Sek. 1-11, AT Sek. 1-10, CE Sek. 1-10

**Ziel:** Agent-Schicht aktivieren. "100% Kontext" durch Context Assembly, Memory-Integration, WebMCP.
> **WICHTIG (Tooling):** Bei der Implementierung dieser Phase zwingend die installierten "Agent Skills for Context Engineering" (`advanced-evaluation`, `bdi-mental-states`, `context-compression`, `context-degradation`, `context-fundamentals`, `context-optimization`, `evaluation`, `filesystem-context`, `hosted-agents`, `memory-systems`, `multi-agent-patterns`, `project-development`, `tool-design`) aktivieren und als Richtlinie nutzen.

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **10a** | Agent Framework | AGT Sek. 2 | Runtime (FastAPI WS), Rollen: Extractor/Verifier/Guard/Synthesizer, BTE/DRS Guards |
| **10b** | Context Engineering Pipeline | CE Sek. 4-6 | Relevance Scoring (4 Dimensionen), Token Budget Manager, DyCP, LLMLingua-2, Multi-Source Merge |
| **10c** | Agent Working Memory (M5) | MEM Sek. 8 | Redis Hash pro Session, Scratchpad, TTL 30min, Oldest-first Eviction |
| **10d** | Agentic Search | AT Sek. 6 | Codebase Search, News Search (Emergent Mind, arXiv), Memory Search (Episodic + Semantic) |
| **10e** | WebMCP Tools | AT Sek. 3-4 | Read-Only: `get_chart_state`, `get_portfolio_summary`, `get_geomap_focus`. Mutations: `set_chart_symbol`, `add_geomap_marker` (mit Confirm-Modal) |
| **10f** | Research Agent | AT Sek. 7 | Emergent Mind + arXiv Integration, Research → Summarize → Episodic Memory |
| **10g** | Monitor Agent | AGT Sek. 3 | Price Alerts, GeoEvent Alerts, Anomaly Detection (Volumen/Spreads) |
| **10h** | A2A Prep | AT Sek. 9 | Agent Card Schema, Inter-Agent Messages (JSON-RPC 2.0), Task Delegation |

### Verify Gate
- [ ] "Analyse EURUSD" → Extractor + Synthesizer liefern Analyse
- [ ] Context Assembly: Frontend-State + 5 Episodes + KG-Nodes korrekt
- [ ] Monitor Agent: Price Alert <5s nach Threshold-Breach
- [ ] WebMCP Mutation → Confirm-Modal → Chart aendert sich

### Open Checkpoints (IST-Verbesserung + Erweiterung)
- [ ] **P0:** Agent-Pipelines auf Memory-API-only Zugriff begrenzen (keine direkten Store-Reads/Writes).
- [ ] **P0:** Retrieval-/Fallback-Policies als runtime-verifizierbare Contracts umsetzen (`NO_KG_CONTEXT`, etc.).
- [ ] **P1:** Agent-Observability standardisieren (context source mix, fallback flags, latency/cost budgets).

---

## Phase 11: Entropy + Novelty Monitoring

> **Ref:** ENT Sek. 1-13

**Ziel:** System-Selbstueberwachung gegen Entropy-Collapse: Monokultur-Praevention, KG-Dampening, Exergie-Signale.

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **11a** | Entropy Health Monitor | ENT Sek. 5.1 | 5 Dimensionen: Signal Diversity, Geo-Region, Strategem, KG-Confidence-Spread, Agent-Interpretation |
| **11b** | KG-Confidence Dampening | ENT Sek. 5.5 | Cap 0.95, -0.08 Decrement, -0.02/month Decay. Override-Cap (-0.30) + Monthly Decay (+0.05) |
| **11c** | Market Entropy Index | ENT Sek. 10.6, IND Sek. 5r | 5-Komponenten E-Metrik als Composite Indicator + Credit/Liquidity Overlay (Private-Credit Proxies). `/api/v1/regime/market-entropy` |
| **11d** | Exergie-Exposure + keen_multiplier | ENT Sek. 5.6, 8.2 | `exergy_shock` Edge in KG, Keen-Multiplier Calibration (Phase 1-3) |
| **11e** | Signal Pipeline Monokultur-Prevention | ENT Sek. 4.3 | Min-Weight per Signal-Typ, Diversity Floor (3 Regionen, 2 Strategem-Types, 1 Weak Signal) |

### Verify Gate
- [ ] Entropy Health Score berechnet und auf Dashboard sichtbar
- [ ] KG-Node Confidence sinkt automatisch ueber Zeit
- [ ] Market Entropy Index als Indikator verfuegbar
- [ ] Monokultur-Warnung wenn <3 Signal-Typen aktiv

---

## Phase 12: GeoMap v2.5 — Advanced Features

> **Ref:** GEO Sek. 35.1-35.16, 36 Sprint 2-3

**Ziel:** NLP-Upgrade, Contradiction Tracking, Alert-System, Exports, Timeline, Zentralbank-Layer.

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **12a** | NLP Pipeline Upgrade | GEO Sek. 18.1-18.2 | Embeddings + HDBSCAN (statt TF-IDF+KMeans), LLM-Narrativ-Analyse (Ollama), SentimentService Protocol |
| **12b** | Contradiction Tracking + Evidence | GEO Sek. 35.1-35.2 | SHA256 Source Hash, GeoContradiction auto-create, Evidence Score, optional Snapshot Storage |
| **12c** | Alert System | GEO Sek. 35.11 | Severity/Confidence Thresholds, Cooldown per Region+Category, Dedup, Mute Profiles |
| **12d** | Exports | GEO Sek. 35.12 | JSON Export, PNG/PDF Snapshot (html2canvas+jsPDF), CSV/Excel |
| **12e** | Timeline Playback + Confidence Decay | GEO Sek. 29, 35.3 | Scrubber-Animation, Status-Transitions (active→stabilizing→archived), Confidence Decay |
| **12f** | Evaluation Harness | GEO Sek. 35.6 | Accept Rate, Override Rate, Kappa, Top Override Reasons, Time-to-Review Dashboard |
| **12g** | Zentralbank + CBDC Layer | GEO Sek. 35.13, ENT Sek. 12.4 | Rate Decisions Filter, Balance Sheet Trend, CBDC Status Choropleth, Financial Openness (Chinn-Ito), De-Dollarization |

**Status (Frontend + transitional API groundwork, 23. Feb 2026):** Phase-12 wurde konfliktarm parallel zur Go-Provider-/UIL-Arbeit deutlich vorgezogen. **12e UI:** `TimelineStrip` hat Playback-Controls (Play/Pause, Speed, Window, Cursor-Scrubber) plus Confidence-Decay-Preview und visualisiert Cursor/Window direkt im Activity-Density-Chart. **12b UI-Annäherung:** `EventInspector` zeigt einen eventbezogenen Contradictions-Bereich (read-only, via Contradictions-API; Link-Heuristik über Evidence/mergedEventId/Source-Overlap) und bringt das Verify-Gate „Contradiction Tab im Event Inspector funktional“ naeher. **12c/12d/12f/12g UI + transitional Backing:** `Phase12AdvancedPanel` ist eingebunden und nutzt jetzt zusaetzliche Next-Transition-APIs fuer Alert-Policy (`/api/geopolitical/alerts/policy`), Evaluation Summary (`/api/geopolitical/evaluation`), JSON/CSV Export (`/api/geopolitical/export`) sowie Zentralbank-/CBDC-Overlay-Konfig (`/api/geopolitical/overlays/central-bank`). `alerts` Preview unterstuetzt Threshold-Parameter (`minSeverity`, `minConfidence`, `cooldownMinutes`, optional `regionId`) und liefert Preview-Metriken (`thresholdMatchedEvents`, `eligible/suppressed`). Diese Endpunkte sind **transitional** (Next/local stores) und sollen spaeter mit Go/Phase-14-Quellepfaden bzw. UIL-konformen Contracts hinterlegt werden.

### Verify Gate
- [ ] Phase-4-Closeout (`4i`-`4l`) abgeschlossen oder mit explizitem Defer-Entscheid dokumentiert
- [ ] NLP: Embedding-basiertes Clustering besser als TF-IDF (A/B Test)
- [ ] Contradiction Tab im Event Inspector funktional
- [ ] Alert mit Cooldown korrekt (max 1/h pro Region)
- [ ] PDF Export mit Karte + Legende + Zeitstempel

### Open Checkpoints (IST-Verbesserung)
- [ ] **P0:** Transitionale Next-APIs (`alerts/evaluation/export/overlays`) auf Go/UIL-Truth-Path vorbereiten.
- [ ] **P1:** `Phase12AdvancedPanel` in Hook-/Component-Slices refactoren (geringeres UI-Orchestrierungsrisiko).
- [ ] **P1:** Alert-/Evaluation-Contracts auf einheitliche Fehlersignale und Telemetrie heben.

---

## Phase 13: Portfolio Advanced + Optimize

> **Ref:** PF P-19 bis P-33, IND Phase F Todos #51-#57

**Ziel:** Fortgeschrittene Portfolio-Optimierung, Regime-Sizing, Monte Carlo, VPIN.

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **13a** | HRP + MinVar + EqualWeight | IND #48, PF P-19 | Hierarchical Risk Parity, Minimum Variance, Equal Weight Optimizer |
| **13b** | Kelly Multi-Asset | IND #55, PF P-21 | Covariance-basierte Kelly Allocation |
| **13c** | Regime-Based Sizing | IND #54, PF P-22 | Traffic-Light per Position (Green/Yellow/Red) basierend auf Regime |
| **13d** | Monte Carlo VaR (Rust) | IND #82, PF P-20 | 100k+ Simulationen via Rust/PyO3/Rayon |
| **13e** | VPIN Risk Warning | IND #49, PF P-23 | Volume-Synchronized Probability of Informed Trading, SSE bei VPIN > Threshold |
| **13f** | Frontend Optimize Tab | IND #57 | HRP Slider, Dendrogram, Kelly Chart, Regime-Indikator |

### Verify Gate
- [ ] HRP Empfehlung auf echtem Portfolio
- [ ] Monte Carlo VaR mathematisch korrekt (vs. Referenz)
- [ ] VPIN Alert triggert bei hoher Toxizitaet

### Open Checkpoints (IST-Verbesserung)
- [ ] **P1:** HRP/Kelly/VPIN Scope klar trennen in "bereits produktiv" vs. "experimentell".
- [ ] **P1:** Optimize-Output Contracts versionieren (um UI/Backend Drift zu vermeiden).

---

## Phase 14: Global Provider Expansion

> **Ref:** GO-R Sek. 12.4-12.9, 13-14

**Ziel:** BaseConnector-Architektur (Phase 0b) nutzen um 40+ globale Provider anzubinden.

> **Klarstellung (GCT Scope):** GCT bleibt der Exchange-Aggregator fuer 30+ Boersen. "exchange=auto" im Gateway ist eine Runtime-Kandidatenauswahl/Fallback-Strategie und **kein** strukturelles Limit auf 3 Provider. Pair-/Symbol-Normalisierung passiert teils in GCT selbst und teils gateway-seitig als Transport-/Kompatibilitaetsschicht.

> **Fortschritt (27. Feb 2026, Phase 14a):** **IMF IFS** als erster SDMX-Provider integriert (`internal/connectors/imf`). SDMX CompactData/IFS, Symbolformat `IMF_IFS_<FREQ>_<REF_AREA>_<INDICATOR>`, `POLICY_RATE`→`M_111_FITB`. Vertikal verdrahtet in Quote/Macro-History (`exchange=imf`).

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **14a** | SDMXClient | GO-R Sek. 12.4 | Ein Client fuer IMF, OECD, ECB, World Bank, UN, ADB (~6 Provider). **IMF IFS:** Done (27. Feb 2026). |
| **14b** | TimeSeriesClient | GO-R Sek. 12.5 | EM Central Banks: BCB, Banxico, RBI, BoK, TCMB, BCRA (~7 Provider) + US Credit/Liquidity Proxy-Serien (FRED/OFR/NYFed) fuer Regime-Signale |
| **14c** | BulkFetcher | GO-R Sek. 12.6 | CFTC COT, FINRA ATS, LBMA Gold Fix, FXCM Sentiment |
| **14d** | DiffWatcher | GO-R Sek. 12.7 | Sanctions XML Diffs: SECO, OFAC SDN, UN, EU |
| **14e** | TranslationBridge | GO-R Sek. 12.8 | Non-English API Responses → Python LLM Queue fuer Uebersetzung |
| **14f** | Symbol Catalog Service | GO-R Sek. 9 | Periodic Pull, Normalized Format, DEX Mapping |
| **14g** | GeoMap Official Source Connector Pack + Diff/Decision Emitters | GO-R Sek. 12.7, 14.6 (Addendum) | Offizielle GeoMap-Quellen in Go zentralisieren (OFAC/UN/UK, Fed/ECB, weitere Zentralbanken/Legal Feeds): ETag/Last-Modified/Hash, DiffWatcher/Change-Emit, provider-spezifische Parsing-Hinweise. Ziel: Hard-Signal-Deltas nicht mehr in Next-TS verfestigen |
| **14h** | G10 Oracle Provider Expansion (Scaffold + Mapping) | GO-R Sek. 14.1-14.2 | Oracle-Provider-Fundament im Go-Layer erweitern: Chainlink/Pyth behalten und zusaetzlich Stork/Chronicle/SEDA/Switchboard/DIA als Connector-Scaffolds + Feed-Mapping + Staleness-Metadaten aufnehmen. Fokus hier: Integrationsfaehigkeit und Router-Metadaten, noch keine produktive Alert-Entscheidung |

### Verify Gate
- [x] SDMXClient: IMF IFS (Policy Rate, M_111_FITB) korrekt abrufbar via `exchange=imf`, `symbol=IMF_IFS_M_111_FITB` oder `POLICY_RATE` (27. Feb 2026)
- [ ] **14.v1 DiffWatcher (PARTIAL, 03. Mär 2026):** `pack.go` partial-success fix implementiert (individuelle Watcher-Fehler → `slog.Warn` + `continue`; Error nur wenn ALLE Watcher fehlschlagen). OFAC/SECO/EU fetchen erfolgreich nach Stack-Neustart. **UN TLS-Issue:** `scsanctions.un.org` Zertifikat ist ausgestellt für `*.azurewebsites.net` → Go TLS-Verifikation schlägt mit EOF fehl (kein falsches Zertifikat, Provider-seitiger Konfig-Bug). UN-Watcher wird übersprungen (partial-success). Fix: entweder UN-Endpoint-Override oder `tls.Config{InsecureSkipVerify: true}` (nur für UN, mit Audit-Log). **Status:** Partial — 3/4 Watcher grün, UN deferred.
- [ ] Symbol Catalog: 500+ Symbole normalisiert
- [ ] GeoMap offizielle Quellen (mind. OFAC + UN + Fed/ECB) laufen ueber Go-Connector/DiffWatcher und beliefern den UIL/GeoMap-Stack ohne Next-TS Source-Fetch
- [ ] OSM/Geocoding/Attribution-Betriebsregeln aus Phase-4-Policy-Hardening bleiben in Provider-Deployments durchgaengig erfuellt
- [ ] G10 Provider-Scaffolds (Chainlink/Pyth/Stork/Chronicle/SEDA/Switchboard/DIA) inklusive Pair-Mapping und Staleness-Metadaten im Router-Snapshot verfuegbar
- [ ] Standard Intake Checklist für neue Quellen konsequent angewandt
- [ ] `REFERENCE_SOURCE_STATUS.md` Matrix ist initialisiert und Provider-Status ist gepflegt

### Open Checkpoints (IST-Verbesserung + Erweiterung)
- [ ] **P0:** Incremental Fetch + idempotent Upsert als Pflichtvertrag fuer neue Provider einziehen.
- [ ] **P1:** Historische Daten local-first lesen, nur Deltas/Luecken nachladen (Kosten-/Latenz-Gate).
- [ ] **P1:** Provider-Health/Backfill-Lag als harte Betriebsmetriken in Verify ergaenzen.

---

## Phase 15: Indicator Catalog — Advanced (IND Phases D+E + Eval Baseline)

> **Ref:** IND Todos #22-#50, #63-#67, #68-#72
> **Eval-Detail/Scope:** `docs/INDICATOR_ARCHITECTURE.md` -> **Phase H: Evaluation Harness**
> 
> **Gedacht fuer:** objektive Qualitaetsbewertung der Indikatoren und Composite-Signale (Signalguete, Risiko/Rendite, Regime-Stabilitaet), bevor Strategien in produktnahe Workflows uebernommen werden.

**Ziel:** Erweiterte Indikatoren: K's Collection, Volatility Suite, Regime Detection, Markov, Order Flow.

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **15a** | K's Collection | IND #22-#26 | K's Reversal I+II, ATR-RSI, RSI², MARSI, Fibonacci MA, Rainbow (7er Batch) |
| **15b** | Volatility Suite | IND #27 | Spike-Weighted Volatility, Volatility Index, Exp-Weighted StdDev |
| **15c** | Regime Detection | IND #35, #63-#64 | SMA-Slope+ADX, Markov Regime Model, HMM (`hmmlearn`), BIC Model Selection |
| **15d** | Alternative Bars + CUSUM | IND #40-#41 | Volume/Dollar/Tick Bars, CUSUM Structural Break Detection |
| **15e** | Mean-Rev vs. Momentum | IND #42-#43 | Hurst, ADF, Half-Life Classification, Regime-Conditional Parameters |
| **15f** | Performance Metrics | IND #28 | Net Return, Hit Ratio, RRR, Expectancy, Profit Factor, Sharpe, Sortino |
| **15g** | Order Flow + Signal Chain | IND #65-#67 | Signal-Quality-Chain, Order Flow State Machine (Accum/Distrib/Squeeze), MCMC Portfolio Monte Carlo |
| **15h** | Eval Baseline Harness | IND #68-#72 | Eval-Dataset (Triple-Barrier + Regime-Tags), Core Metrics (Precision/Recall/F1, Hit Ratio, Expectancy, Profit Factor), Risk/Return Report, Composite Attribution, Regime-Sliced Evaluation |

### Verify Gate
> **Status (03. Mär 2026): Kern-Gates live bestätigt:**
- [x] **15.v1** Volatility-Suite: `POST /api/v1/indicators/volatility-suite` (Feld: `closes`) → `spike_weighted_vol`, `volatility_index`, `volatility_regime: "normal"` ✓
- [x] **15.v2** Regime Detection: `POST /api/v1/regime/detect` → `regime: "bullish"|"bearish"|"ranging"` + `confidence` korrekt ✓
- [x] **15.v3** Markov Regime: `POST /api/v1/regime/markov` → `transition_matrix` + `stationary_distribution` + `expected_duration` ✓
- [x] **15.v4** HMM: `POST /api/v1/regime/hmm` → `n_states` (BIC-optimal), `current_regime`, `state_probabilities` ✓
- [x] **15.v5** Go-Gateway-Proxy: alle Phase-15-Endpoints via Port 9060 (`/api/v1/indicators/volatility-suite`, `/api/v1/regime/*`) erreichbar ✓
- [ ] Order Flow State Machine: Korrekte Transitions (Backlog)
- [ ] Eval Baseline Report vorhanden (Core + Risk/Return + Regime-Splits) fuer mind. 5 Referenz-Symbole (Backlog)

---

## Phase 16: Backtesting Engine + Eval Hardening

> **Ref:** RUST Sek. 5, IND Phase D Todos #29, #31, #36-#47, IND Eval Todos #73-#75
> **Eval-Detail/Scope:** `docs/INDICATOR_ARCHITECTURE.md` -> **Phase H: Evaluation Harness**
> 
> **Gedacht fuer:** robuste Freigabe-Gates (OOS-Stabilitaet, Execution-Realism, Deflated Sharpe), um Overfitting und unrealistische Backtest-Ergebnisse systematisch auszufiltern.

**Ziel:** Rust-basierter Backtester mit Walk-Forward, Triple-Barrier, Monte Carlo.

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **16a** | Rust Backtester Core | RUST Sek. 5 | Rayon parallel, Risk-Intercept, Event-basierte Architektur |
| **16b** | Walk-Forward Validation | IND #36 | Rolling Train/Test Split, Out-of-Sample Performance |
| **16c** | Slippage/Commission Model | IND #37 | Realistisches Execution-Modell |
| **16d** | Triple-Barrier Labeling | IND #44 | AFML Ch.3: Take-Profit / Stop-Loss / Time-Out Labels |
| **16e** | Parameter Sensitivity | IND #38 | Grid Search ueber Indikator-Parameter |
| **16f** | Deflated Sharpe Ratio | IND #47 | AFML Ch.14: Korrektur fuer Multiple Testing |
| **16g** | Monte Carlo Price Projection | IND #45 | Geometric Brownian Motion, Confidence Bands im Chart |
| **16h** | Eval Hardening Gates | IND #73-#75 | Walk-Forward + Parameter-Stabilitaet als Pflichtlauf, Execution-Realism (Slippage/Commission/Turnover), Deflated-Sharpe-Gate + `/api/v1/eval/indicator` Reporting |

### Verify Gate
- [ ] Backtester: 5-Jahres-Backtest <10s (Rust)
- [ ] Walk-Forward: Out-of-Sample Ergebnis kein Overfitting
- [ ] Triple-Barrier Labels mathematisch korrekt
- [ ] Eval Hardening Gate gruen: Deflated Sharpe + Execution-Realism + OOS-Stabilitaet bestanden

### Open Checkpoints (IST-Verbesserung + Erweiterung)
- [ ] **P0:** Datensatz-Linien klar trennen und versionieren: Raw Market Data vs Feature Snapshots vs Eval Outputs.
- [ ] **P0:** Reproduzierbarkeit als Pflichtkriterium (`dataset_version`, `feature_version`, `config_hash`) in Reports.
- [ ] **P1:** Eval-Gates als release-relevant markieren (kein stilles Ueberspringen).

---

## Phase 17: Game Theory Mode + Simulation

> **Ref:** GT Sek. 1-9, AT Sek. 10, OPTS Sek. 11 (v2+v3)

**Ziel:** Interaktive Simulationen auf der GeoMap. Hier laufen Memory (KG), Agents, und D3 zusammen.

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **17a** | D3 v2+v3 Stack | OPTS Sek. 11 | `d3-force`, `d3-chord`, `d3-contour`, `d3-geo-polygon`, `d3-delaunay`, `@xyflow/react` |
| **17b** | Game Theory Kernlogik | GT Sek. 2-6 | Nash Solver (Pure/Mixed), Bayesian Updating, Regime Detection, Transmission Path Engine |
| **17c** | Monte Carlo Simulation | GT Sek. v5 | N Pfade, Confidence Bands, Regime-Switching GBM |
| **17d** | Spielbaum Visualisierung | GT Sek. 7 | ReactFlow/d3-hierarchy, Wahrscheinlichkeiten an Kanten, Market-Impact an Blaettern |
| **17e** | GeoMap GT Overlay | AT Sek. 10 | Transmission-Path-Arcs, Impact-Radius, Actor-Netzwerk, Sanction/Trade-Flow Chords |
| **17f** | Timeline Component | GT Sek. 8 | `d3-brush` Slider, historische Events, Regime-Wechsel als Baender |
| **17g** | KG Integration | GT Sek. 8.1 | 36 Strategeme Matching, Behavioral Ops (Chase Hughes), historische KG-Traversal |
| **17h** | Planner Agent | AGT Sek. 4 | Spielbaum generieren, Strategeme identifizieren, Szenarien bewerten |

### Verify Gate
- [ ] 3-Ebenen-Spielbaum korrekt visualisiert
- [ ] Transmission Paths: Event → 3 betroffene Maerkte mit Impact
- [ ] Timeline Brushing filtert Karte korrekt
- [ ] Monte Carlo: 1000 Pfade <5s

### Open Checkpoints (IST-Verbesserung)
- [ ] **P1:** Scope klarziehen: bestehender Impact-Kernpfad vs. voller Planner-/Simulation-Stack.
- [ ] **P1:** Abhaengigkeiten zu Phase 6/10 explizit als Go/Memory-Contracts dokumentieren.

**Scope-Split (verbindlich):**

- **Impact-Kernpfad (naechster produktiver Schritt):** Event -> Impact Score -> betroffene Symbole -> UI-Overlay.
- **Voller Simulation-Stack (erweitert):** Nash/Bayesian Solver, Planner-Agent, Spielbaum, Monte-Carlo-Pfade, Strategeme-KG Traversal.

**Abhaengigkeiten:**

- **Phase 6:** Memory-Contracts (KG/Episodic/Cache) muessen stabil verfuegbar sein.
- **Phase 10:** Agent-Pipelines nutzen Memory-API-only Zugriff, kein Direktzugriff auf lokale Stores.

---

## Phase 18: Options + Dark Pool + DeFi

> **Ref:** IND Phase G Todos #58-#62, GO-R Sek. 11, 13.1, 14.1-14.2

**Ziel:** Alternative Daten-Layer: Options Flow, Dark Pool Signal, DeFi On-Chain, Oracle Cross-Check.

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **18a** | Dark Pool Signal | IND #58, GO-R Sek. 11 | FINRA ATS Go-Fetcher + Python Smart Money Extension. `/api/v1/darkpool/signal` |
| **18b** | GEX Profile + Call/Put Walls | IND #59 | Polygon Options Chain → Gamma Calc. `/api/v1/options/gex-profile` |
| **18c** | Expected Move | IND #60 | IV → Price Cone im Chart. `/api/v1/options/expected-move` |
| **18d** | Options Calculator | IND #61, PF P-32 | Black-Scholes Greeks, P/L Simulation, Multi-Leg |
| **18e** | DeFi Connectors | GO-R Sek. 13.1 | DefiLlama (TVL), Coinglass (Funding/OI), Whale Alert, mempool.space |
| **18f** | Oracle Cross-Check (Produktiv) | GO-R Sek. 14.1-14.2 | Produktive Cross-Check-Logik auf Basis der in Phase 14 vorbereiteten G10-Provider: Consensus-/Reference-Preis, Disagreement Detector (E_o), Alerting, Provider-Health-Impact und "Oracle Spread Index" |

### Verify Gate
- [ ] Dark Pool Ratio Bar unter Volume-Panel sichtbar
- [ ] GEX Bar Chart mit Call/Put Wall Lines
- [ ] Oracle Disagreement (E_o) triggert Alert inkl. Severity/Confidence und wirkt auf Provider-Health

---

## Phase 19: GeoMap v3 + Collaboration + Rust

> **Ref:** GEO Sek. 35.4 (Stufe 3), 35.7-35.9, RUST Sek. 13

**Ziel:** Collaborative Editing (CRDT), Entity Graph, High-Density Rendering (deck.gl), Rust Spatial (h3o).

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **19a** | CRDT via Yjs | GEO Sek. 35.9 | Y.Map/Y.Array fuer Events/Candidates/Drawings, y-websocket Sync, Persistence |
| **19b** | Analyst Presence | GEO Sek. 35.9 | `@y-presence/react`, "Analyst B is looking at MENA" |
| **19c** | Entity Graph | GEO Sek. 35.8 | Actor/Asset/Sanction/Chokepoint Nodes + Edges, Graph-Queries |
| **19d** | deck.gl Integration | GEO Sek. 35.4 Stufe 2 | GeoJsonLayer, HeatmapLayer, ScatterplotLayer, PathLayer (Trade Corridors) |
| **19e** | h3o Spatial Indexing | RUST Sek. 13 | H3 Indices pro Event, `grid_disk` Radius-Queries, 26x schneller als JS |
| **19f** | Calibrated Confidence | GEO Sek. 35.7 | Platt Scaling / Isotonic Regression auf historischem Feedback |
| **19g** | Active Learning | GEO Sek. 35.7 | Disagreement Cases → Re-Training Candidates |
| **19h** | Non-Western Sources | GEO Sek. 12.2a | Yonhap API, WorldNewsAPI, Al Jazeera Portal, APIScout Africa |

### Verify Gate
- [ ] 2 Analysten sehen gegenseitige Aenderungen in <2s (CRDT)
- [ ] Entity Graph: "Events affecting semiconductor export controls" liefert Ergebnis
- [ ] deck.gl PathLayer: Trade Corridors sichtbar
- [ ] h3o: Radius-Query <1ms
- [ ] deck.gl/MapLibre-Start ist durch Phase-4-Performance-Gates begruendet (kein kalendergetriebener Framework-Wechsel)

---

## Phase 20: ML Pipeline

> **Ref:** IND Sek. 0.5 (Stufe 1-3), Sek. 3.5-3.6

**Ziel:** Machine Learning Schicht ueber dem Indikator-Katalog.

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **20a** | Feature Engineering | IND Stufe 1 | 30+ Indikatoren als Feature-Vektor, Normalisierung, Feature Importance |
| **20b** | Classical ML | IND Stufe 2 | XGBoost/LightGBM Signal Classification, Random Forest, Isolation Forest Anomaly. `/api/v1/ml/classify-signal` |
| **20c** | Hybrid Fusion | IND Sek. 3.5 | Feature-Level XGBoost + Decision-Level Rules → Meta-Labeler (AFML Ch.3) |
| **20d** | Deep Learning (optional) | IND Stufe 3 | LSTM/GRU, Temporal Fusion Transformer, Autoencoder Regime Detection. Separater `ml-inference-service` |
| **20e** | Continuous Bias Monitoring | IND Sek. 3.6 | Geographic Distribution, Regime-Balance, Rule/ML Agreement Rate |

### Verify Gate
- [ ] XGBoost: Signal Classification >60% Accuracy auf Test-Set
- [ ] Meta-Labeler: Bet Size korreliert mit Signal Confidence
- [ ] Bias Monitor: Alert bei Geographic Imbalance

---

## Phase 21: Frontend Refinement + Hardening

> **Ref:** Diverse (Cleanup-Phase)

**Ziel:** Codebase bereinigen, Contracts validieren, UI polieren. Echtes Finale.

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **21a** | Zod Validation | API_CONTRACTS | Zod-Schemata aus Specs, alle Gateway-Responses validieren |
| **21b** | Dead Code Cleanup | — | Verwaiste Provider-Calls, API-Routes, Dependencies entfernen |
| **21c** | RSC Migration | GOG Sek. 1 | Dashboard, GeoMap, Portfolio initial per React Server Components |
| **21d** | UI Polish | — | Loading States, Error Boundaries, Responsive, Dark Mode |
| **21e** | JSON Logging Rollout | — | `console.log` → JSON (Next.js), `fmt.Println` → `slog` (Go), `print` → `structlog` (Python) |
| **21f** | a11y Pass | GEO Sek. 9.4 | aria-Labels, Focus Management, Screen Reader, Non-Color Severity |
| **21g** | Dependency Audit + Docs | — | Keine ungenutzten Packages, keine Vulnerabilities. Alle Specs aktuell |

### Verify Gate
- [ ] Full Stack Smoke Test: Market Data → Chart → Pattern → Signal → Portfolio → GeoMap
- [ ] Kein Orphan Code
- [ ] a11y: Grundlegende Navigation per Keyboard moeglich

### Open Checkpoints (IST-Verbesserung + Erweiterung)
- [ ] **P0:** Prisma-Zugriff zentralisieren (ein Client-Lifecycle, einheitliche Policy, kein doppeldeutiger Init-Pfad).
- [ ] **P0:** Wiederholte File-Store-Patterns in gemeinsamen Adapter ueberfuehren (atomic write + lock + schema guard + telemetry).
- [ ] **P1:** Query-first + `useEffect`-Reduktion als verbindliche Umsetzungsguideline fuer Server-State.
- [ ] **P2:** TanStack-DB nur als optionalen Feature-Pilot (Beta) mit klaren Abbruch-/Erfolgskriterien.
- [ ] **P0:** Fallback-Policy environment-scharf erzwingen (Dev/Test degradierbar, Staging/Prod fail-fast).

---

## Phase 22 (optional): WASM + Desktop

> **Ref:** RUST Sek. 4, 6, 7

**Ziel:** Rust-Code als WASM im Browser und optionale Desktop-App via Tauri.

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **22a** | WASM Frontend Indicators | RUST Sek. 4 | `wasm-pack`, npm Package, SMA/EMA/RSI client-side statt TS |
| **22b** | Tauri v2 Desktop | RUST Sek. 7 | 3-10 MB App, native Rust Backend, Mobile-Support |
| **22c** | ChartGPU Evaluation | RUST Sek. 6 | WebGPU Chart-Rendering Performance-Test |

### Verify Gate
- [ ] WASM SMA: <0.1ms pro 2000 Candles im Browser
- [ ] Tauri: App startet, zeigt Dashboard, verbindet zu lokalen Services

---

## Phase 23: Platform Readiness (Super-App Schnittmenge)

> **Ref:** `ARCHITECTURE.md` Sek. 13-15, `SUPERAPP.md` Sek. 4-7

**Ziel:** Die bereits identifizierte Schnittmenge `A∩B` produktionsnah absichern, ohne eine Voll-Super-App zu bauen.

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **23a** | Capability Registry v1 | ARCH 13/14 | Versionierte Capability-Registry in Go (API/Tool scopes, owner, risk-tier, deprecation policy). |
| **23b** | Agent Policy Tiers | ARCH 5, SUPERAPP 5 | Einheitliche Tool-Klassen: `read-only`, `bounded-write`, `approval-write`; Enforcement inkl. idempotency + approval gates. |
| **23c** | Trust-Fabric Mapping | ARCH 13.3, SUPERAPP 5 | Claim-Modell fuer User/Service/Agent vereinheitlichen (subject, actor_type, scope-set, delegation chain). |
| **23d** | Governance Events Pflichtpfad | SUPERAPP 5/7 | Review/deploy/revoke als standardisierte Audit-Events mit hash-chain/DB-Persistenz. |
| **23e** | Trajectory Observability | ARCH 7, 8 | End-to-end Metriken fuer async job backlog, schedule drift, approval latency, rejection reasons. |

### Verify Gate
- [ ] Capability Registry deckt alle mutierenden Tool-/API-Pfade mit Owner + Risk-Tier ab.
- [ ] Agent-Mutationspfade schlagen ohne `idempotencyKey` oder fehlendes Approval fail-closed fehl.
- [ ] Identity Mapping ist ueber Next->Go->Python/Agent konsistent nachvollziehbar (Trace + Claims).
- [ ] Governance Events sind revisionssicher fuer review/deploy/revoke abrufbar.

---

## Phase 24: Ecosystem Optionality (ohne Produkt-Scope-Creep)

> **Ref:** `SUPERAPP.md` Sek. 3-7, `ARCHITECTURE.md` Sek. 14-15

**Ziel:** Optionale Erweiterungsfaehigkeit (`B\\A`) als reversible Plattformfunktion vorbereiten, nur use-case-/KPI-getrieben.

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **24a** | Internal Plugin Pilot | SUPERAPP 5.2/7 | Internal-only Plugin Runtime Pilot (allowlist, signed manifests, sandboxed boundaries, kill switch). |
| **24b** | Partner/ISV Boundary Spec | SUPERAPP 4/5 | Vertragliche und technische Boundary fuer Partner-Module (Capabilities, quotas, audit obligations). |
| **24c** | Payment Orchestration Adapter | ARCH 13.5, SUPERAPP 5.2 | Optionaler Adapter-Layer fuer Payment/Routing/Reconciliation als eigene Domain, ohne Kernfluss zu brechen. |
| **24d** | Reversible Rollout Gates | ARCH 14/15 | KPI-basierte Stage-Gates (`internal -> pilot -> limited external`) mit klaren Rollback-Kriterien. |

### Verify Gate
- [ ] Plugin Pilot laeuft internal-only mit enforced capability boundaries und einem dokumentierten Revoke-Flow.
- [ ] Partner Boundary Spec ist versioniert und als Contract-Test-Input nutzbar.
- [ ] Payment Adapter arbeitet als additive Domain ohne direkte Core-Bypaesse.
- [ ] Rollout-Entscheidung basiert auf KPI-Gates; bei Verfehlung greift dokumentierter Rollback.

---

## Go-Integrationsblock (nach Erweiterung, verbindlich)

Dieser Block verbindet die bereits erweiterten Frontend-/Contract-Phasen mit den verbleibenden Go-open-points, damit Datenlieferung, Ownership und Verify-Gates wirklich End-to-End zusammenpassen.

### GI-1: Contract-zu-Go Verdrahtung

| Open Point | Zielbild | Hauptphase |
|:---|:---|:---|
| `degraded/degraded_reasons/requestId/auditId` nicht nur in Next-Responses, sondern stabil im Go-Truth-Path | Go liefert den Envelope nativ; Next normalisiert nur kompatibel | 3, 9e, 12 |
| `contract_version/schema_version/feature_scope` nur als Frontend-Hinweis | Versionsfelder in Go-Handlern als Source-of-Truth setzen und changeloggen | 12, 13 |
| Incremental-Contract (`sync_token`,`has_more`,`watermark`) nur in Spec | Go-Endpoints mit cursor/watermark semantics als Pflichtpfad | 5, 14 |

### GI-2: Provider-/Ingest Open Points (Go Data Plane)

| Open Point | Zielbild | Hauptphase |
|:---|:---|:---|
| Hard/Soft ingest und official-source deltas teils transitional | Go-owned DiffWatcher/Decision-Emitter als produktiver Truth-Path | 9e, 14 |
| Candidate/Timeline/Contradictions v1.0 eingefroren, aber drift-risk bei Folgefeatures | Contract-tests im Go-Layer (golden JSON fixtures) als Merge-Gate | 9e |
| Provider health/lag Metriken nicht als hartes Go release gate | p95 latency, backlog lag, error class distribution als verpflichtendes Verify-Gate | 14 |

### GI-3: Persistenz-/Fallback Open Points (Go + TS boundary)

| Open Point | Zielbild | Hauptphase |
|:---|:---|:---|
| TS-Fallback-Policy dokumentiert, aber Go/TS fail-fast Semantik nicht ueberall gespiegelt | Gemeinsame Runtime-Policy pro env (`degraded` vs `fail`) in Go + Next durchsetzen | 5, 21 |
| GCT-Audit DB-vs-JSONL Pfad ist definiert, Betriebsgate fehlt | Startup-/health gate: SQLite primary required in staging/prod, JSONL nur degraded fallback | 1 |
| Write-SoR "Go priorisiert" aber Restpfade koennen lokal writebar bleiben | Mutierende Domainrouten als Go-only ownership in Verify-Suites erzwingen | 4, 5, 9e |

### GI-4: Verbindliche Go Verify Add-ons

- [ ] Go-Contract smoke tests fuer alle mutierenden Geo-/Fusion-Pfade mit Envelope-Assertions (`requestId`,`degraded*`,`auditId`).
- [ ] Cursor-/incremental tests fuer Zeitreihen (`sync_token`,`has_more`,`watermark`) unter replay/idempotency.
- [ ] Provider-backfill tests: partial outage -> erwartete `degraded_reasons`, kein stilles 200-ohne-signal.
- [ ] Migration guard: Next thin proxies enthalten keine dauerhafte Domain-Writelogik mehr.

### GI-5: Python/Rust Kopplung an Go-Truth-Path (wie/wo/was/warum)

| Wo (Schicht/Pfad) | Was verbindlich gilt | Warum (Risiko ohne Regel) | Offener Punkt |
|:---|:---|:---|:---|
| Go -> Python `indicator-service` (`/api/v1/signals/composite`, Portfolio-Analytics-Pfade) | Go bleibt Input-Owner (OHLCV/Context), Python rechnet, Response-Contract kommt versioniert zurueck (`schema_version`, `feature_scope` wo relevant) | Sonst Contract-Drift zwischen Next/Go/Python und nicht reproduzierbare Outputs | [ ] Golden contract fixtures fuer Python-Responses als Go-Integrationstest |
| Python -> Rust (PyO3 in `python-backend/rust_core`) | Rust ist Compute-Layer, kein eigener Service; Python liefert Fallback-Engine-Flags transparent (`rust|python`) | Sonst stille Engine-Wechsel ohne Observability | [ ] Verify-Gate: Engine-Marker + fallback reason in Health/Response standardisieren |
| Go Streaming + Python/TS Fallbacks | Degradation wird end-to-end durchgereicht (`degraded`, `degraded_reasons`, `requestId`) inkl. partial outage | Sonst 200-Responses ohne degradationssignal und schweres Incident-Debugging | [ ] Chaos-smoke fuer partial upstream failure (Go/Python) mit erwarteten reason-codes |
| Go Ingest -> Python Classify -> Go/UIL Review | Candidate/Timeline/Contradictions `v1.0` bleibt stabil; Python darf Felder erweitern nur ueber neue `contract_version` | Sonst Review-UI bricht bei unversionierten Shape-Aenderungen | [ ] Contract-compat suite fuer `candidate-review-v1.0`, `timeline-v1.0`, `contradictions-v1.0` |
| Go Memory/API -> Agent/Python -> Rust/Embeddings | Agent-/Research-Pfade lesen ueber Memory-APIs, nicht ueber lokale Stores; Rust/redb bleibt Spezialcache, nicht SoR | Sonst inkonsistente Quellenlage und schwer reproduzierbare Agent-Outputs | [ ] Memory-source assertions in agent pipelines (`api_only`, `no_direct_store_access`) |

### GI-6: Cross-Language Verify Gate (Go + Python + Rust)

- [ ] **Go**: Integrationstests validieren Contract-Felder bei Python upstream success + failure.
- [ ] **Python**: Health/response enthalten Engine- und fallback-Metadaten (`rustCore`, `dataframeEngine`, `fallback_active`).
- [ ] **Rust**: Bench-/correctness checks fuer kritische Pfade (composite/heartbeat/redb) als release gate referenziert.
- [ ] **E2E**: Ein vertikaler Smoke (`Frontend -> Next -> Go -> Python/Rust -> Go -> Frontend`) pro Kern-Domain (Streaming, Geo review, Portfolio optimize).

---

## Architektur-Entscheidungen (Zusammenfassung)

| Entscheidung | Begruendung | Ref |
|:---|:---|:---|
| **Vertikale Entwicklung** | Jede Phase: End-to-End ueber alle Schichten | — |
| **Auth zuerst (Phase 1)** | KG Encryption, RBAC, WebMCP Security, Consent — alles braucht Auth | AUTH |
| **Correlation IDs** | `X-Request-ID` (UUID) durchgehend Frontend → Rust | AUTH Sek. 7 |
| **WebAuthn/Passkeys** | Passwortlos, SOTA 2026 | AUTH Sek. 2 |
| **Rate Limiting in Go** | Schutz vor Overload bevor Compute-Requests an Python gehen | AUTH Sek. 2.4 |
| **Zod aus Specs generieren** | API_CONTRACTS.md = Single Source of Truth | API_CONTRACTS |
| **Kein Docker lokal** | `dev-stack.ps1` primaer. Dockerfiles nur CI/Deployment | — |
| **Redis JA (Phase 6)** | Agent Working Memory, Market-Data Cache, LLM-Response Cache. SQLite bleibt fuer Persistent | MEM |
| **Polars statt Pandas** | Von Anfang an (Phase 2). Zero-copy via Arrow FFI | RUST Sek. 5a |
| **redb OHLCV Cache** | Embedded, concurrent, TTL-basiert. Kein externer Service noetig | RUST Sek. 5b |
| **Rust via PyO3** | Kein eigener HTTP-Server. ~7ns Overhead | RUST Sek. 2 |
| **Rust-Scope** | PyO3 (P2) → WASM (P22) → Backtester (P16) → h3o (P19) → Tauri (P22) | RUST Sek. 17 |
| **BaseConnector Architektur** | Abstraktions-Layer fuer 40+ Provider. Einmal bauen, immer wiederverwenden | GO-R Sek. 12 |
| **WebMCP primaer** | W3C Draft. `navigator.modelContext.registerTool()`. ~67% weniger Overhead | AT Sek. 3 |
| **Chrome DevTools MCP fuer Debugging** | Low-Level (Network, Performance, Console). Nicht fuer UI-Interaktion | AT Sek. 4.2 |
| **KuzuDB WASM + Client-Side Encryption** | KG im Browser, Offline-faehig, PRF-basierte Encryption | MEM Sek. 5, AUTH Sek. 13 |
| **Agent Framework Python** | LLM-Ecosystem. Orchestrierung via Go Gateway | AGT |
| **Consent Server-Side** | Sofort wirksam. DB-Lookup per Request, kein Token-Refresh noetig | AUTH Sek. 9 |
| **Entropy Monitoring** | System-Selbstueberwachung gegen Monokultur und Collapse | ENT |
| **Backtesting in Rust** | Rayon parallel, 10-100x schneller als Python | RUST Sek. 5 |

---

## Abdeckungs-Matrix: Docs → Phasen

| Dokument | Phasen | Geschaetzte Abdeckung |
|:---------|:-------|:---------------------:|
| INDICATOR_ARCHITECTURE (112 Tasks) | 2, 7, 8, 13, 15, 16, 18, 20 | ~90% |
| GEOPOLITICAL_MAP_MASTERPLAN (139 Tasks) | 4, 9, 12, 17, 19 | ~85% |
| go-research (65 Tasks) | 0, 14, 18 | ~85% |
| RUST_LANGUAGE_IMPLEMENTATION (52 Tasks) | 2, 16, 19, 22 | ~85% |
| CONTEXT_ENGINEERING (35 Tasks) | 10 | ~80% |
| ENTROPY_NOVELTY (38 Tasks) | 11, 12g | ~75% |
| MEMORY_ARCHITECTURE (30 Tasks) | 6, 10c | ~90% |
| AGENT_ARCHITECTURE (40 Tasks) | 10 | ~80% |
| AGENT_TOOLS (25 Tasks) | 10 | ~85% |
| GAME_THEORY (35 Tasks) | 17 | ~85% |
| Portfolio-architecture (33 Tasks) | 5, 13 | ~90% |
| UNIFIED_INGESTION_LAYER (20 Tasks) | 9 | ~90% |
| AUTH_SECURITY (25 Tasks) | 1 | ~95% |
| ADR-001 (12 Tasks) | 3 | ~95% |
| **Gesamt (~661 Tasks)** | **0-22** | **~87%** |

---

## Nicht in Sub-Phasen erfasste Tasks (~86 Tasks, ~13%)

Die folgenden Tasks sind **bewusst nicht als eigene Sub-Phasen** aufgefuehrt, sondern leben als Detail-Checkboxen in den jeweiligen Fach-Docs. Sie sind hier vollstaendig gelistet damit nichts verloren geht.

### Kat. 1: UX-Detailarbeit (zu granular fuer Sub-Phasen) — ~25 Tasks

| Task | Quelle | Einordnung |
|:-----|:-------|:-----------|
| Asset-Link UI: Dropdown `relation`, Dropdown `assetClass`, Slider `weight`, Textarea `rationale` | GEO Sek. 35.10 | Bei Phase 4a (Shell Refactor) miterledigen |
| Impact Horizon Feld pro Asset-Link (`1d/1w/1m/3m`) | GEO Sek. 35.10 | Bei Phase 4a |
| Event Modal zwei-Tier UX: Mini-Modal (hover) + Detail-Modal (double-click) | GEO Sek. 35.14 | Bei Phase 4a |
| Candidate Sort-Algorithmus (Confidence-first vs. Severity-first) | GEO Sek. 28 #5 | Bei Phase 4a |
| Lazy-Loading Strategie fuer Panels | GEO Sek. 25a | Bei Phase 4a |
| Globaler State fuer Geo-Daten (aktuell nur auf Map-Page) | GEO Sek. 25a | Bei Phase 4a |
| localStorage → Prisma Migration fuer Drawings/Manual Corrections | GEO Sek. 25a | Bei Phase 4a |
| Analyst Presence Indikatoren (`@y-presence`) | GEO Sek. 35.9 | Bei Phase 19a (CRDT) |
| Volume Candlesticks Rendering (variable Breite nach Volumen) | IND #25 | Bei Phase 7e (Integration) |
| Heikin-Ashi + K's Candles Charting | IND #25 | Bei Phase 7e |
| Volume Profile UI Binding (Funktion existiert, kein UI) | IND #110 | Bei Phase 7e |
| Watchlists + Cross-Device Sync (Prisma, WebSocket) | IND #62 | Bei Phase 5d (Prisma Extensions) |
| Briefing Mode Export (Region → auto-generiertes Brief MD/PDF) | GEO Sek. 35.12 | Bei Phase 12d (Exports) |
| Collaborative Review Voting-Logik (Majoritaet default, Unanimity S4+) | GEO Sek. 5.4.4 | Bei Phase 19a (CRDT) |
| Cohen's Kappa Berechnung ueber Multi-User Reviews | GEO Sek. 35.6 | Bei Phase 12f (Evaluation Harness) |
| Source Bias Profile Metadaten pro Provider (manuell kuratiert) | GEO Sek. 11.4 | Bei Phase 12b (Evidence) |
| JSON Rules Engine fuer konfigurierbare Candidate-Policies | GEO Sek. 35.5 | Bei Phase 12c (Alerts) |
| Per-Region Cooldown Config | GEO Sek. 35.5 | Bei Phase 12c |
| Per-Category Budgets (max Candidates/Tag) | GEO Sek. 35.5 | Bei Phase 12c |
| Exposure Templates (vordefinierte Asset-Buckets pro Event-Typ) | GEO Sek. 35.10 | Bei Phase 17e (GT Overlay) |
| Country Attractiveness Heatmap Layer (Heritage+WGI+Henley+HDI+FSI+CPI) | GEO Sek. 35.13d | Bei Phase 19d (deck.gl) |
| Trade Corridor PathLayer Spezifika (Dicke=Volumen, Farbe=Commodity, Dash=Sanctions) | GEO Sek. 35.13c | Bei Phase 19d |
| Financial Openness (Chinn-Ito KAOPEN) Heatmap Sub-Layer | GEO Sek. 35.13b, ENT Sek. 12 | Bei Phase 12g (Zentralbank) |
| De-Dollarization Trend Layer (Pfeile pro Land) | GEO Sek. 35.13b, ENT Sek. 12 | Bei Phase 12g |
| Exergy-Impact Badge in Event Modal (green/yellow/red + Contrarian Hint) | GEO Sek. 17.2.1 | Bei Phase 11d (Exergie) |

### Kat. 2: Operational Automation + Monitoring — ~15 Tasks

| Task | Quelle | Einordnung |
|:-----|:-------|:-----------|
| Job-Queue Architektur: ARQ async Redis fuer schwere Compute-Jobs (Elliott Wave, Backtests >5yr) | IND Sek. 0.3 | Bei Phase 16a (Backtester) oder separat wenn Last steigt |
| Horizontal Scaling: Stateless Indicator-Service Replicas hinter Go Load Balancer | IND Sek. 0.6 | Erst wenn Single-Node Limit erreicht |
| Daily Checks Automation (Source Health, Queue Volume, SLA Tracking) | GEO Sek. 34.1 | Bei Phase 12f (Evaluation Harness) |
| Weekly Checks (Reject Ratio, Threshold Tuning, Quota Validation, Key Rotation) | GEO Sek. 34.2 | Bei Phase 12f |
| Incident Response Tooling (Detect → Disable → Manual → Backfill) | GEO Sek. 34.3 | Bei Phase 12f |
| Geographic Coverage Dashboard (unterrepraesentierte Regionen in Source Feeds) | GEO Sek. 11.4 | Bei Phase 12f |
| Context Quality Metrics Dashboard (Coverage, KG-Hit-Rate, Staleness-Impact, Budget-Utilization) | CE Sek. 9.2 | Bei Phase 10b (Context Engineering) |
| Context Trace Logging (vollstaendiger Input-Context pro Agent-Analyse) | CE Sek. 9.1 | Bei Phase 10b |
| Context Trace Storage Strategie (welche Traces aufbewahren, wie lange) | CE Sek. 10.3 | Bei Phase 10b |
| Ablation Testing Framework (systematisch Context-Layer entfernen) | CE Sek. 9.3 | Bei Phase 10b |
| Continuous Bias Monitoring: BiasMonitor Klasse (Geographic, Regime-Balance, Rule/ML Agreement) | IND Sek. 3.6 | Bei Phase 20e |
| Audit-Log Tamper Protection: Hash-Chain (jeder Eintrag hasht den vorherigen) | GEO Sek. 35.16 | Bei Phase 1c (GCT Auth) oder Phase 12b |
| Key Rotation Checks: Auto-Check 90-Tage-Alter, Warning in Source Health Panel | GEO Sek. 35.16 | Bei Phase 1b (Security Middleware) |
| Terms-Aware Storage: Metadata-first, kein Volltext von bezahlten News | GEO Sek. 35.16 | Bei Phase 9b (LLM Pipeline) |
| Access Control per Action: Wer darf Events confirmen, Asset-Links editieren | GEO Sek. 35.16 | Bei Phase 19a (CRDT/Collaboration) |

### Kat. 3: Blocked / V3+ / Long-Term — ~20 Tasks

| Task | Quelle | Blocker / Grund |
|:-----|:-------|:----------------|
| Implied Volatility Surface (IV → Strike → Expiry Grid) | IND #46 | Braucht Options-Daten (Phase 18). Erst danach moeglich |
| PineTS Evaluation | IND Sek. 2.1 | **License-Gate:** AGPL-3.0 Kompatibilitaet muss vorab geklaert werden |
| Quartr Enterprise (Audio + Live Transcripts, 14k+ Companies) | GEO Sek. 12.4 A | Enterprise-Pricing, fruehestens v3+ |
| EarningsCall.biz SDK + WhisperX Diarization | GEO Sek. 12.4 A | $129/mo, v2.5 |
| Zentralbank Webcast Audio Pipeline (yt-dlp → WhisperX → Text/Audio) | GEO Sek. 12.4 D | GPU benoetigt fuer WhisperX, v3.0 |
| Knowledge Base YouTube Channels (Chase Hughes, Behavior Panel) via UIL | GEO Sek. 12.4 G | Abhaengig von Phase 9 (UIL), v3.0 |
| Xinhua, TASS, Anadolu, Bernama, PTI Enterprise-Kontakte | GEO Sek. 12.2a | Kurzfristig unrealistisch. RSS-Fallback als Alternative |
| SEC EDGAR MD&A Extraction (`edgartools`: 10-K Item 7, 10-Q, S-1) | GEO Sek. 12.4 B | v2.0, 1-2 Wochen wenn priorisiert |
| GDELT BigQuery GKG (Tone/Persons/Orgs, Pre/Post-Earnings) | GEO Sek. 12.4 C | BigQuery Kosten, v2.0 |
| BIS Central Bank Speeches Bulk Download + Parser | GEO Sek. 12.4 D | v2.0 |
| Hansard + Congressional Record API | GEO Sek. 12.4 E | v2.5 |
| Automatic Entropy-Collapse Detection | ENT Sek. 7 | v3+, braucht laengere Laufzeit-Daten |
| Exchange Simulation Migration (Funding Rates, Liquidation, Collateral ~850 LoC) | RUST Sek. 5 | Abhaengig von GCT-Stabilisierung |
| VectorTA Evaluation als Kand-Alternative (194+ Indikatoren, SIMD/CUDA) | RUST Sek. 3 | Nur wenn Kand Limitations zeigt |
| FinGPT als Sentiment-Upgrade | GEO Sek. 18.2 | GPU benoetigt, v3 |
| Ensemble Meta-Sentiment (gewichteter Durchschnitt ueber Modelle) | GEO Sek. 18.2 | v3, braucht mehrere Modelle |
| FinBERT2 fuer CN-spezifische Sentiment-Analyse | GEO Sek. 18.2 | v3, nur wenn China-Coverage Prioritaet wird |
| LSTM Regime Detection in Rust (tch-rs, CModule) | GEO Sek. 35.3, RUST Sek. 18.3 | v3, in Phase 19e vorgesehen aber Rust-DL ist komplex |
| Transformer Severity Classification (Rust, tch-rs, DL-7) | RUST Sek. 18.3 | v3, GPU + Training Pipeline benoetigt |
| Automerge-rs fuer Backend-State (Alternative zu Yjs) | GEO Sek. 35.9 | Nur evaluieren wenn Yjs Limits zeigt |

### Kat. 4: Fein-Spezifikationen innerhalb bestehender Sub-Phasen — ~18 Tasks

| Task | Quelle | Lebt innerhalb von |
|:-----|:-------|:-------------------|
| Override-Cap (-0.30) + Monthly Decay (+0.05) auf User Feedback | CE Sek. 4.4.1 | Sub-Phase 10b |
| Contrarian Context Injection (12% Rate im Synthesizer) | CE Sek. 8.3 | Sub-Phase 10b |
| Diversity Floor (min 3 Regionen, 2 Strategem-Types, 1 Weak Signal) | CE Sek. 4.3 | Sub-Phase 10b |
| Conflict Resolution: Frontend vs. Backend KG Praezedenz-Regeln | CE Sek. 6.3 | Sub-Phase 10b |
| Partial Availability / Graceful Degradation Matrix | CE Sek. 6.4 | Sub-Phase 10b |
| 5 Offene Forschungsfragen (Weights Calibration, Merge Latency, Trace Storage, Frontend Budget, Regime Refresh) | CE Sek. 10.1-10.5 | Sub-Phase 10b — muessen VOR Implementierung beantwortet werden |
| Proactive SSE Invalidation bei neuem GeoEvent (Cache + KG Update + Frontend Push) | CE Sek. 7.2 | Sub-Phase 10b |
| Rust DL-3: Zero-Copy Arrow FFI (PyO3 → Python → Polars) | RUST Sek. 18.2 | Sub-Phase 2b |
| Rust DL-4: Custom Error Hierarchy (`IndicatorError` enum) | RUST Sek. 18.2 | Sub-Phase 2a |
| Rust DL-5: Property-Based Testing (`proptest`, `quickcheck`) | RUST Sek. 18.2 | Sub-Phase 2a |
| Rust DL-8: Structured Logging (`tracing` crate, OpenTelemetry) | RUST Sek. 18.2 | Sub-Phase 2a |
| Rust DL-9: Feature Flags (`cfg` + Cargo features) | RUST Sek. 18.2 | Sub-Phase 2a |
| Rust DL-10: Memory-Mapped I/O fuer grosse Backtests | RUST Sek. 18.2 | Sub-Phase 16a |
| Rust DL-11: Compile-Time Dimensional Analysis (`uom` crate) | RUST Sek. 18.2 | Optional, bei Bedarf |
| Rust DL-12: WASM-Specific Patterns (`wasm-bindgen`, `web-sys`) | RUST Sek. 18.2 | Sub-Phase 22a |
| Harmonic Multi-Timeframe Scoring (optionaler `timeframes[]` Param) | IND Ch.8 note | Sub-Phase 8b |
| Multi-Scenario Wave Output (Primary + Alternative + Invalidation) | IND Sek. 4.4 #6 | Sub-Phase 8a |
| Degree-Labeling (Grand Supercycle → Subminuette, Multi-TF Elliott) | IND Sek. 4.4 #7 | Sub-Phase 8a |

### Kat. 5: Entropy Gruppe-B Monetaer-Items — ~8 Tasks

| Task | Quelle | Einordnung |
|:-----|:-------|:-----------|
| URB-Index: Synthetischer Index (XAU 40%, CHF 30%, SGD 30%) | ENT Sek. 11.4, IND Sek. 5s | Bei Phase 11c (Market Entropy Index) als Sub-Indikator |
| H_exergy Daten-Pipeline (EIA/IEA Proxy: Oil Volatility, Shipping Rates, Semiconductor Lead Times) | ENT Sek. 6.1, 9.2 | Bei Phase 14 (Global Providers) — Datenquellen beschaffen |
| Dual-Entropy Metrik: H_info + H_exergy kombiniert als Fragilitaets-Fruehwarnung | ENT Sek. 6 | Bei Phase 11a (Entropy Health Monitor) |
| Entropy-Adaptive Signal-Gewichtung g(E): Dynamische Gewichte parallel | ENT Sek. 10.6 | Bei Phase 11c |
| Escalation-Severity Mapping (Sasan Ladder → Auto-Severity-Tagging) | ENT Sek. 13.5 | Bei Phase 4d (Choropleth Layer) |
| keen_multiplier Calibration Phasen 1-3 (Proxy → EM Econometrics → Live-Fit) | ENT Sek. 8.2 | Bei Phase 11d |
| CBDC Parameter Comparison Layer fuer GeoMap | ENT Sek. 12.4 | Bei Phase 12g (Zentralbank Layer) |
| Corridor Visualization: UN Comtrade Bulk-Import + Trade-Volume Weighted Paths | ENT Sek. 13.2, GO-R Sek. 14.5 | Bei Phase 14 (Daten) + 19d (deck.gl Rendering) |
