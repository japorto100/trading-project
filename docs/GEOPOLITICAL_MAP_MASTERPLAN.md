# Geopolitical Map Blueprint 2026

Version: 1.0  
Status: Draft for implementation  
Owner: Fusion project  
Last updated: 2026-02-14

---

## 0. Purpose

This is the master blueprint for the Geopolitical Map feature.  
It consolidates:
- your requirements from chat,
- implementation steps,
- architecture decisions,
- source strategy,
- no-noise governance,
- roadmap from v1 (manual-first) to v3 (assisted intelligence).

Use this as:
- product spec,
- engineering spec,
- execution checklist,
- long-term handover doc.

---

## 1. Direct answer to your library question

### 1.1 Are the libraries in `geopoliticalmap.txt` sufficient?

Short answer: **yes for v1, not fully for v2+**.

- Enough for v1:
  - manual marker placement,
  - symbol overlays,
  - region click navigation,
  - side panels,
  - candidate review flow.
- Not enough alone for v2+:
  - precise projection control,
  - high-quality zoom/pan on heavy overlays,
  - robust geometry handling for regions/hotspots,
  - long-term rendering performance with many annotations.

### 1.2 Practical stack recommendation

- v1:
  - `react-svg-map` (or `react-svg-worldmap`) for quick React integration.
  - custom marker + drawing overlay.
- v2:
  - add `topojson` + `d3-geo` for precision and scalability.
- v3:
  - optional hybrid renderer (SVG for entities + canvas/webgl for heavy overlays).

---

## 2. Requirements captured from your answers

1. Standalone fullscreen geopolitical visualization.
2. Manual-first editing (symbols + drawing + notes).
3. Symbol examples: war/tank, trade war, M&A/takeover, chokepoints like Panama Canal.
4. News should support context, not autonomous persistence.
5. Automation only when confidence is very high and noise very low.
6. Timeline required, but only for meaningful changes.
7. Region click should show region-focused news.
8. Hard macro signals (rate decisions etc.) can auto-create candidates.
9. Asset mapping desired, but should be carefully designed.
10. Reuse existing stock-chart drawing capabilities.
11. Consider SOTA/ML later, keep human control central.

Core principle:
- system proposes,
- human confirms,
- map persists only confirmed intelligence.

---

## 3. Red-thread guiding questions

These 10 questions remain the steering framework:

1. Main goal: visualization only, or direct trading signal control?
2. Static/manual or live/API-driven?
3. Granularity: countries only, or regions/hotspots?
4. Which categories must be represented?
5. Which timeline behavior is needed?
6. Which UI interactions are mandatory?
7. Standalone fullscreen or embedded mode?
8. Which sources are mandatory first?
9. How to suppress noise and keep only signal?
10. How to map geopolitical events to concrete assets?

---

## 4. Scope and phase boundaries

### 4.1 In-scope v1

- Fullscreen route `/geopolitical-map`.
- Country + region navigation.
- Manual symbols and drawing.
- Candidate queue (assisted, not autonomous persistence).
- Confirm/reject workflow.
- Change-only timeline.
- Manual asset links per event.

### 4.2 Out-of-scope v1

- autonomous event-to-trade execution,
- zero-touch persistence from news text,
- fully automated model-only approval logic,
- complex geospatial simulation.

### 4.3 In-scope v2

- better projection/geometry stack,
- hard-signal ingestion adapters,
- stronger region news ranking/dedup,
- anti-noise alerting controls.

### 4.4 In-scope v3

- ML-assisted candidate ranking and clustering,
- scenario and regime-state support,
- probabilistic impact hints for assets.

---

## 5. Modes of operation

### 5.1 Manual mode (default)

- user places markers and drawings,
- user adds sources and notes,
- user sets severity and confidence.

### 5.2 Candidate mode (assisted)

- system ingests hard events and selected feeds,
- system generates candidates only,
- user accepts/rejects/snoozes.

### 5.3 Persistent intelligence mode

- only confirmed events persist on map,
- every change gets timeline and audit entry.

---

## 6. Signal vs noise policy

### 6.1 Practical truth

Absolute \"100% signal, zero noise\" is unrealistic in geopolitics.  
Design target:
- maximize precision,
- accept lower recall,
- enforce manual review gate.

### 6.2 Policy rules

1. No direct persistence from unverified text sources.
2. Hard-signal adapters can create priority candidates.
3. Candidate must satisfy evidence threshold.
4. Candidate expires after TTL if untouched.
5. Source conflict lowers confidence and priority.

### 6.3 Confidence ladder

- C0: unverified mention
- C1: one source
- C2: multi-source consistency
- C3: official confirmation
- C4: official + market-impact corroboration

Only C3/C4 should trigger high-priority alerts by default.

---

## 7. Event taxonomy and symbol catalog

### 7.1 Categories (v1 baseline)

- War / Armed conflict
- Border escalation
- Terror / security incident
- Sanctions / export controls
- Trade war / tariff regime
- Regime change / election shock
- Monetary policy / rates
- Sovereign debt stress
- Commodity shock (oil/gas/grains/metals)
- Shipping chokepoint risk
- Cyber infrastructure event
- Strategic M&A / takeover
- Resource nationalization / expropriation

### 7.2 Symbol examples

- tank: conflict
- gavel: sanctions/legal action
- ship: logistics/chokepoint
- oil drop: energy risk
- microchip: export controls
- ballot: election/regime event
- percent icon: rate decision
- broken handshake: trade rupture
- briefcase/skyscraper: strategic M&A

### 7.3 Severity and lifecycle

Severity:
- S1 informational
- S2 watch
- S3 elevated
- S4 high
- S5 crisis

Lifecycle:
- emerging
- active
- stabilizing
- resolved
- archived

---

## 8. Regions and hotspots

### 8.1 Definitions

- Region: macro area of countries.
- Hotspot: specific corridor/node/territory inside a region.

### 8.2 Region sets

- North America
- South America
- Europe
- MENA
- Sub-Saharan Africa
- Central Asia
- South Asia
- East Asia
- Southeast Asia
- Oceania
- Arctic/Polar (optional layer)

### 8.3 Hotspot examples

- Panama Canal
- Suez Canal
- Strait of Hormuz
- Bab el-Mandeb
- Taiwan Strait
- South China Sea lanes
- Black Sea corridors
- Bosporus
- Red Sea lanes

---

## 9. UX and interaction blueprint

### 9.1 Layout

- center: fullscreen map canvas
- left rail: symbol + drawing tools
- top bar: mode, filters, search, timeline controls
- right panel: event inspector (sources, assets, notes)
- bottom strip: timeline/change feed

### 9.2 Must-have interactions

- click country -> country context
- click region -> region-focused feed
- place marker -> quick-create modal
- draw shape/path -> attach to event
- review candidate -> confirm/reject/snooze
- multi-select markers -> bulk updates

### 9.3 Suggested shortcuts

- `M` marker
- `L` line
- `P` polygon
- `T` text
- `Delete` remove selected
- `Ctrl+Z` undo
- `Ctrl+Shift+Z` redo
- `C` open candidates
- `R` toggle region layer

### 9.4 Accessibility baseline

- keyboard reachable controls
- strong dark-mode contrast
- non-color-only severity encoding
- aria labels on all actions

---

## 10. Reuse of stock drawing tools

### 10.1 Why

- consistency for user workflow,
- faster delivery,
- lower maintenance.

### 10.2 Refactor plan

1. Extract chart drawing primitives to shared module.
2. Introduce coordinate adapter interface.
3. Implement geo adapter for map projection.
4. Keep drawing object schema shared across chart/map.

### 10.3 Primitive set

- point
- line
- arrow
- rectangle
- polygon
- polyline
- label
- measurement annotation

---

## 11. Source strategy: tiers and trust

### 11.1 Source tiers

Tier A (official/high trust):
- central banks,
- sanctions authorities,
- official legal/public notices.

Tier B (structured commercial APIs):
- market/news providers with stable contracts.

Tier C (open/community/unofficial):
- wrappers,
- social feeds,
- forum streams.

### 11.2 Hard-signal first adapters

- Fed/ECB/BoE/BoJ rate schedule and decision pages,
- OFAC sanctions service updates,
- UK sanctions list updates,
- UN sanctions list updates.

### 11.3 Soft-signal candidates

- News APIs,
- selected finance media feeds,
- optional Reddit streams.

Rule: soft signals can only produce candidates, never auto-persistent map events.

---

## 12. Provider matrix and practical notes

### 12.1 Market providers (project context)

| Provider | Role | Note |
|---|---|---|
| Twelve Data | Core market feed | pricing page references free 8 credits/min and 800/day |
| Alpha Vantage | Secondary feed | support page states free usage up to 25 requests/day |
| Finnhub | Market/fundamentals | docs include auth methods, global caps, 429 behavior |
| FMP | Backup data | official pricing lists free 250 API calls/day |
| EODHD | Backup feed | pricing/API limits docs show free-tier constraints |
| Marketstack | EOD backup | free tier: 100 requests/month |
| Polygon | US-centric optional | knowledge-base references free-tier request limits |
| CoinMarketCap | Crypto | official pricing lists free monthly credits |
| Finage | Optional provider | product page indicates docs/playground + paid-first model |
| FRED | Macro series | public API docs with free usage model |
| Yahoo unofficial / yfinance | fallback | broad coverage but unofficial/legal caveats |
| InsightSentry | optional | free plan messaging exists, production suitability must be verified |

### 12.2 News providers for candidate engine

| Provider | Role | Note |
|---|---|---|
| NewsData.io | broad ingestion | official pages exist; exact limits should be verified in account dashboard |
| NewsAPI.ai (Event Registry) | event-centric feed | official plans page and token model |
| GNews | quick setup | free plan listed with request/day and delay |
| Webz News API | broader web coverage | News API Lite and free key onboarding visible |
| NewsAPI.org (optional) | fallback | dev plan includes request/day limit |

### 12.3 Official geopolitics and sanctions sources

| Source | Usage |
|---|---|
| OFAC SLS | machine-readable sanctions updates |
| UK sanctions list | UK legal designation updates |
| UN consolidated sanctions list | global sanctions baseline |
| EU sanctions map/datasets | EU restrictive measures context |

---

## 13. Canonical data contracts

### 13.1 Event type

```ts
export type GeoEventStatus = \"candidate\" | \"confirmed\" | \"persistent\" | \"archived\";
export type GeoSeverity = 1 | 2 | 3 | 4 | 5;
export type GeoConfidence = 0 | 1 | 2 | 3 | 4;

export interface GeoSourceRef {
  id: string;
  provider: string;
  url: string;
  title?: string;
  publishedAt?: string;
  fetchedAt: string;
  sourceTier: \"A\" | \"B\" | \"C\";
  reliability: number; // 0..1
}

export interface GeoAssetLink {
  id: string;
  symbol: string;
  assetClass: \"equity\" | \"etf\" | \"fx\" | \"commodity\" | \"crypto\" | \"index\";
  relation: \"beneficiary\" | \"exposed\" | \"hedge\" | \"uncertain\";
  weight?: number; // 0..1
  rationale?: string;
}

export interface GeoEvent {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  status: GeoEventStatus;
  severity: GeoSeverity;
  confidence: GeoConfidence;
  countryCodes: string[]; // ISO alpha-2
  regionIds: string[];
  hotspotIds?: string[];
  coordinates?: { lat: number; lng: number }[];
  summary?: string;
  analystNote?: string;
  sources: GeoSourceRef[];
  assets: GeoAssetLink[];
  createdAt: string;
  updatedAt: string;
  validFrom?: string;
  validTo?: string;
  createdBy: string;
  updatedBy: string;
}
```

### 13.2 Candidate type

```ts
export interface GeoCandidate {
  id: string;
  generatedAt: string;
  triggerType: \"hard_signal\" | \"news_cluster\" | \"manual_import\";
  confidence: number; // 0..1
  severityHint: GeoSeverity;
  headline: string;
  regionHint?: string;
  countryHints?: string[];
  sourceRefs: GeoSourceRef[];
  mergedIntoEventId?: string;
  state: \"open\" | \"accepted\" | \"rejected\" | \"snoozed\" | \"expired\";
  reviewNote?: string;
}
```

### 13.3 Timeline entry type

```ts
export interface GeoTimelineEntry {
  id: string;
  eventId: string;
  action:
    | \"created\"
    | \"status_changed\"
    | \"severity_changed\"
    | \"confidence_changed\"
    | \"geometry_changed\"
    | \"sources_updated\"
    | \"assets_updated\"
    | \"note_updated\"
    | \"archived\";
  actor: string;
  at: string;
  diffSummary: string;
}
```

---

## 14. Backend API design

### 14.1 REST endpoints

- `GET /api/geopolitical/events`
- `POST /api/geopolitical/events`
- `PATCH /api/geopolitical/events/:id`
- `POST /api/geopolitical/events/:id/archive`
- `GET /api/geopolitical/candidates`
- `POST /api/geopolitical/candidates/:id/accept`
- `POST /api/geopolitical/candidates/:id/reject`
- `POST /api/geopolitical/candidates/:id/snooze`
- `GET /api/geopolitical/timeline`
- `GET /api/geopolitical/regions`
- `GET /api/geopolitical/news?region=...`
- `GET /api/geopolitical/sources/health`

### 14.2 SSE endpoint

- `GET /api/geopolitical/stream`

Event types:
- `candidate.new`
- `candidate.updated`
- `event.updated`
- `timeline.appended`

---

## 15. Storage architecture

### 15.1 v1 JSON-first

- `data/geopolitical/events.json`
- `data/geopolitical/candidates.json`
- `data/geopolitical/timeline.json`
- `data/geopolitical/regions.json`
- `data/geopolitical/symbol-catalog.json`

Pros:
- fast bootstrap,
- transparent debugging,
- no DB blocker.

Cons:
- weak concurrent edit support,
- limited audit robustness.

### 15.2 v2 Prisma-first

Tables:
- `GeoEventRecord`
- `GeoSourceRecord`
- `GeoAssetLinkRecord`
- `GeoCandidateRecord`
- `GeoTimelineRecord`
- `GeoDrawingRecord`

Migration:
- keep JSON fallback until DB maturity,
- optional dual-write period.

---

## 16. Region-specific news flow

When user clicks a region (example: South America):
1. right panel switches to region context,
2. queries constrained to region country set,
3. candidate queue filtered for that region,
4. active persistent events highlighted on map.

Dedup strategy:
- canonical URL hash,
- normalized title hash,
- publish-time window clustering.

---

## 17. Hard-signal design

### 17.1 Families

- policy-rate decisions,
- sanctions list additions/removals,
- formal trade restrictions,
- official emergency legal decrees (selected jurisdictions).

### 17.2 Score proposal

Base score components:
- official source +0.50
- recency +0.15
- structured field completeness +0.10
- cross-source official consistency +0.15
- market mapping availability +0.10

If score >= 0.75 -> priority candidate.

Hard signal still enters as candidate, not direct persistence.

---

## 18. Soft-signal NLP/ML (v2/v3)

Pipeline:
1. ingest
2. language detection
3. dedup cluster
4. entity extraction
5. category classification
6. severity tagging
7. confidence scoring
8. candidate creation

Guardrails:
- no direct persistence from model output,
- explanation bundle required,
- conflict awareness required.

SOTA 2026 stance:
- use models for extraction, ranking, summarization,
- do not use models as sole legal/trading authority.

---

## 19. Asset mapping framework

### 19.1 Relation types

- beneficiary
- exposed
- hedge
- uncertain

### 19.2 Example

Strait escalation:
- exposed: shipping-dependent importers
- beneficiary: selected energy producers / freight proxies
- hedge: relevant commodity or volatility instruments

### 19.3 Rule

Asset link confidence is independent from event confidence.
High-impact asset links must include analyst rationale.

---

## 20. Alerting framework

Alert classes:
- candidate priority alert,
- severity escalation alert,
- status transition alert,
- asset exposure alert.

Anti-noise controls:
- cooldown by region/category,
- duplicate suppression windows,
- confidence thresholds per class,
- user mute profiles.

Defaults:
- high alert: C3+ and S4+
- medium alert: C2+ and S3+
- low alerts: off by default.

---

## 21. Governance and audit

Every change records:
- actor,
- old/new fields,
- timestamp,
- reason note.

Every candidate/event displays:
- why it exists,
- source set,
- confidence and severity explanation,
- latest change history.

Conflict policy:
- preserve conflict notes,
- reduce confidence until resolved.

---

## 22. Legal and usage constraints

- avoid storing full article bodies unless terms permit.
- store metadata-first: headline, snippet, URL, timestamps.
- unofficial wrappers (Yahoo/yfinance) are fallback only.
- market-data redistribution requires licensing review.

---

## 23. Security and reliability

Security:
- server-side secrets only,
- strict URL/input sanitization,
- output escaping in labels/tooltips.

Reliability:
- per-provider rate budget,
- circuit breaker,
- cache-first pulls for repeated region requests.

---

## 24. Test strategy

Unit:
- scoring logic,
- dedup logic,
- state transitions,
- schema validation.

Integration:
- ingestion -> candidate -> review -> persistence,
- timeline append on every mutation,
- provider outage fallback.

E2E:
- draw + marker workflow,
- candidate review lifecycle,
- region click -> filtered feed,
- timeline interactions.

---

## 25. Implementation milestones

### Milestone A (foundation)

- [x] route `/geopolitical-map`
- [x] base map renderer
- [x] symbol toolbar
- [x] marker CRUD
- [x] JSON persistence

### Milestone B (workflow)

- [x] candidate queue UI
- [x] confirm/reject/snooze actions
- [x] timeline strip + detail pane
- [x] event inspector with sources/assets

### Milestone C (sources)

- [x] hard-signal adapters (rates + sanctions)
- [x] soft-signal adapter scaffolds
- [x] source health endpoint/panel

### Milestone D (quality)

- [x] confidence + dedup engine
- [x] anti-noise alerting
- [x] perf + a11y pass

### Milestone E (v2)

- [x] Prisma persistence
- [x] geospatial stack upgrade (code integrated; run `bun install` to resolve local modules)
- [x] advanced filters/search

---

## 26. Planned file structure

Frontend:
- `src/app/geopolitical-map/page.tsx`
- `src/features/geopolitical/GeopoliticalMapShell.tsx`
- `src/features/geopolitical/MapCanvas.tsx`
- `src/features/geopolitical/SymbolToolbar.tsx`
- `src/features/geopolitical/EventInspector.tsx`
- `src/features/geopolitical/CandidateQueue.tsx`
- `src/features/geopolitical/TimelineStrip.tsx`

Backend:
- `src/app/api/geopolitical/events/route.ts`
- `src/app/api/geopolitical/events/[eventId]/route.ts`
- `src/app/api/geopolitical/candidates/route.ts`
- `src/app/api/geopolitical/candidates/[candidateId]/accept/route.ts`
- `src/app/api/geopolitical/candidates/[candidateId]/reject/route.ts`
- `src/app/api/geopolitical/candidates/[candidateId]/snooze/route.ts`
- `src/app/api/geopolitical/timeline/route.ts`
- `src/app/api/geopolitical/news/route.ts`

Data:
- `data/geopolitical/events.json`
- `data/geopolitical/candidates.json`
- `data/geopolitical/timeline.json`
- `data/geopolitical/regions.json`
- `data/geopolitical/symbol-catalog.json`

---

## 27. Suggested env extensions

```env
# Feature flags
NEXT_PUBLIC_ENABLE_GEOPOLITICAL_MAP=true
GEOPOLITICAL_CANDIDATE_MODE=true
GEOPOLITICAL_HARD_SIGNAL_MODE=true

# Polling and limits
GEOPOLITICAL_POLL_INTERVAL_MS=600000
GEOPOLITICAL_CANDIDATE_TTL_HOURS=72
GEOPOLITICAL_MAX_CANDIDATES_PER_RUN=100

# News providers
NEWSDATA_API_KEY=
NEWSAPIAI_API_KEY=
GNEWS_API_KEY=
WEBZ_API_KEY=
NEWSAPI_ORG_API_KEY=

# Optional geopolitics datasets
RELIEFWEB_APPNAME=
ACLED_API_KEY=

# Official source toggles
ENABLE_OFAC_INGEST=true
ENABLE_UK_SANCTIONS_INGEST=true
ENABLE_UN_SANCTIONS_INGEST=true
ENABLE_CENTRAL_BANK_CALENDAR_INGEST=true
```

---

## 28. Open questions (to finalize before implementation)

1. single-user now vs multi-user from day one?
2. keep simple states only vs add approval states?
3. top 3 categories for first release?
4. first default regions?
5. candidate sort order: confidence-first or severity-first?
6. asset link edit rights: owner-only or shared?
7. exports in v1 (JSON only) or PNG/PDF too?
8. timeline playback in v1 or v2?
9. include Reddit in v1 or postpone to v2?
10. include macro event markers directly on timeline from day one?

---

## 29. Proposed defaults if we proceed immediately

- single-profile first,
- simple lifecycle states only,
- first categories: sanctions, rates, conflict,
- first regions: Europe, MENA, East Asia, South America,
- sort: confidence desc then severity desc,
- asset edits: owner-only first,
- export: JSON in v1, visual exports in v2,
- timeline playback: v2,
- Reddit: v2,
- macro timeline markers: yes in v1.

---

## 30. Execution checklist summary

Product:
- [x] fullscreen map
- [x] manual marker + drawing
- [x] candidate review
- [x] timeline
- [x] region-specific news
- [x] asset links
- [x] no-noise policy

Engineering:
- [x] shared drawing primitives
- [x] REST + SSE routes
- [x] JSON persistence
- [x] Prisma v2 schema
- [x] source adapters
- [x] tests

Ops:
- [x] env docs updated
- [x] source health checks
- [x] ingestion budgets
- [x] alert routing test

---

## 31. Source appendix (internet-validated)

### 31.1 Map/geospatial stack

- https://github.com/VictorCazanave/react-svg-map
- https://github.com/yanivam/react-svg-worldmap
- https://github.com/StephanWagner/svgMap
- https://github.com/StephanWagner/worldMapSvg
- https://github.com/flekschas/simple-world-map
- https://github.com/benhodgson/markedup-svg-worldmap
- https://d3js.org/d3-geo
- https://github.com/topojson/world-atlas

### 31.2 Market providers and limits/pricing

- https://twelvedata.com/pricing
- https://www.alphavantage.co/support/
- https://www.alphavantage.co/premium/
- https://finnhub.io/docs/api
- https://site.financialmodelingprep.com/pricing-plans
- https://eodhd.com/welcome-special-30
- https://eodhd.com/financial-apis/api-limits
- https://marketstack.com/pricing
- https://marketstack.com/documentation
- https://polygon.io/knowledge-base/article/what-is-the-request-limit-for-polygons-restful-apis
- https://polygon.io/docs/rest/quickstart
- https://coinmarketcap.com/api/pricing/
- https://coinmarketcap.com/api/documentation/v4/
- https://finage.co.uk/product/stocks
- https://fred.stlouisfed.org/docs/api/fred/
- https://github.com/ranaroussi/yfinance
- https://insightsentry.com/

### 31.3 News providers

- https://newsapi.ai/plans
- https://gnews.io/pricing
- https://webz.io/products/news-api/
- https://newsdata.io/blog/pricing-plan-in-newsdata-io/
- https://newsdata.io/blog/newsdata-rate-limit/
- https://newsapi.org/pricing

### 31.4 Official geopolitics and sanctions

- https://ofac.treasury.gov/sanctions-list-service
- https://ofac.treasury.gov/recent-actions/20240506_33
- https://www.gov.uk/government/publications/the-uk-sanctions-list
- https://www.gov.uk/government/publications/uk-sanctions-list-change-in-format
- https://main.un.org/securitycouncil/en/content/un-sc-consolidated-list
- https://scsanctions.un.org/consolidated/
- https://data.europa.eu/en/news-events/news/find-out-about-eu-restrictive-measures-across-globe-through-eu-sanctions-map

### 31.5 Central bank schedules

- https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm
- https://www.ecb.europa.eu/press/accounts/html/index.en.html
- https://www.bankofengland.co.uk/monetary-policy/upcoming-mpc-dates
- https://www.boj.or.jp/en/mopo/mpmsche_minu/

### 31.6 Optional datasets and policy references

- https://acleddata.com/acled-api-documentation
- https://apidoc.reliefweb.int/
- https://www.gdeltproject.org/
- https://support.reddithelp.com/hc/en-us/articles/16160319875092-Reddit-Data-API-Wiki
- https://redditinc.com/policies/data-api-terms

---

## 32. Final recommendation

Build Geopolitical Map as:
- standalone fullscreen module,
- manual-first intelligence surface,
- candidate-based automation with strict review gate,
- phased geospatial stack,
- official-source-first hard signal ingestion,
- explicit asset mapping with analyst rationale.

This matches your requirement: strong control, low noise, scalable toward advanced automation.

---

## 33. Risk register and mitigations

### 33.1 Product risks

- Risk: over-automation introduces false confidence.
  - Mitigation: candidate-only automation, manual confirmation required.
- Risk: UI overload from too many controls.
  - Mitigation: progressive disclosure, simple default mode.
- Risk: inconsistent taxonomy across analysts.
  - Mitigation: strict symbol catalog and category governance.

### 33.2 Technical risks

- Risk: map performance degradation with large annotation volume.
  - Mitigation: clustering, virtualization, layered rendering strategy.
- Risk: source outages or rate-limit failures.
  - Mitigation: circuit breakers, fallback chain, health dashboard.
- Risk: schema drift in third-party APIs.
  - Mitigation: adapter contracts + payload validation + alerting.

### 33.3 Data quality risks

- Risk: duplicate events from multiple feeds.
  - Mitigation: URL/title/time-window dedup and event merge tooling.
- Risk: stale events remain active too long.
  - Mitigation: lifecycle TTL checks and archive reviews.
- Risk: conflicting sources confuse confidence.
  - Mitigation: conflict-aware scoring and explicit analyst notes.

### 33.4 Compliance risks

- Risk: non-compliant content storage from paid news sources.
  - Mitigation: metadata-first storage and provider-term reviews.
- Risk: redistribution constraints on market data.
  - Mitigation: internal analysis mode until licensing approval.
- Risk: public exposure of keys or sensitive configs.
  - Mitigation: server-only env usage + rotation policy.

---

## 34. Operability runbook notes

### 34.1 Daily checks

- Source health endpoint green status.
- Candidate queue volume within normal band.
- No unresolved high-priority candidate older than SLA.
- Timeline integrity check (no missing diffs).

### 34.2 Weekly checks

- Review reject ratio and top noise contributors.
- Tune thresholds for over/under-triggering categories.
- Validate provider quotas against real usage.
- Rotate and verify optional source keys where required.

### 34.3 Incident response quick flow

1. Detect provider or ingestion failure.
2. Disable affected adapter by feature flag.
3. Keep manual workflow active.
4. Backfill missed window after adapter recovery.
5. Record incident and threshold adjustments in changelog.
