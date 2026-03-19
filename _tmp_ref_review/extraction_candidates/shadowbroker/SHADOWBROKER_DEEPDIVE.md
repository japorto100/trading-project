# Shadowbroker Deep Dive (GeoMap Reuse)

## Scope
- Source clone: `d:/tradingview-clones/_tmp_ref_review/geo/Shadowbroker`
- Extraction root: `d:/tradingview-clones/_tmp_ref_review/extraction_candidates/shadowbroker`
- Goal: extract robust patterns for TradeView Fusion global flat-mode (not design/theme copy)

## High-Value Findings
- `backend/main.py` + `frontend/src/app/api/[...path]/route.ts` implement a strong runtime proxy contract with request-time backend URL resolution and safe header stripping.
- `backend/services/data_fetcher.py` contains a mature multi-source scheduler pattern: fast/slow data tiers, freshness timestamps, and cache-aware fetch flow.
- `backend/services/network_utils.py` offers resilient HTTP fetch behavior (requests pooling + retry + curl fallback + domain circuit breaker).
- `frontend/src/components/MaplibreViewer.tsx` uses imperative source updates (`setData`) and viewport culling for high-volume layers.
- `frontend/src/app/page.tsx` has practical two-tier polling and ETag handling (`fast` and `slow` payload cadence).
- `backend/services/liveuamap_scraper.py` shows anti-bot scraping mechanics (Playwright stealth) for hard-to-fetch OSINT sources.
- `frontend/src/components/CesiumViewer.tsx` provides a full alternative 3D renderer contract; useful as optional reference for future globe mode.

## A/B/C Recommendations
- **A (adopt soon)**: Fast/slow payload split + ETag + freshness contract, imperative MapLibre updates, robust fetch/fallback utilities.
- **B (adopt selectively)**: configurable source registry/settings UIs, modal-based filter architecture, region dossier aggregation, stealth scraper pattern.
- **C (reference only)**: tactical UI style, pseudo-analytical messaging, source-specific hardcoded mappings (e.g. carrier region heuristics), Cesium-specific rendering details.

## AI/Backend Relevance
- Direct LLM stack: **none found** (no model inference pipeline, no agent runtime, no RAG orchestration).
- AI-adjacent behavior: heuristic string/risk logic (`machine_assessment`) in news flow; useful only as placeholder pattern.
- Backend benefit level: **high** (scheduler design, caching, resiliency, source contracts, API surface structuring).

## Integration Notes for TradeView Fusion
- Keep architecture/patterns, replace source-coupled and region-coupled details.
- Separate transferable contracts from dataset-specific assumptions early (especially in `data_fetcher.py`).
- Treat the UI as interaction pattern references, not as component drop-in.
- Keep `CesiumViewer.tsx` as a future-sidecar reference only while flat mode remains primary.
