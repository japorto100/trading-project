# Zusatz Check (ChatGPT Conversation Review)

Date: 2026-02-13

## Already covered in current fusion code

- Provider-backed OHLCV in main chart with demo fallback
- Alerts wired to live quote polling
- Symbol normalization across UI/API/alerts
- Page modularization into feature components
- Signal package with Daily SMA50 line logic + power/rhythm metrics
- Incremental chart update path
- Replay preview mode
- Persistence model + backend API scaffold

## Implemented now from Zusatz emphasis

- Indicators expanded:
  - VWAP overlay toggle and rendering
  - ATR toggle/period with chart metric strip + signal bar value
  - VWMA overlay toggle/period with chart rendering
  - SMA +/- ATR channel overlay (upper/middle/lower)
- Alert reproducibility check:
  - in-app `Self-check` for above/below + duplicate prevention
- Backend setup:
  - `GET /api/fusion/persistence/status`
  - `GET/PUT /api/fusion/preferences`
  - anonymous `profileKey` client sync path

## Still open (not forgotten)

- Drawing object model with real persistence (toolbar is still mostly UI workflow)
- Streaming ingestion + candle builder + server-side alert engine
- Integration/E2E flow for search -> chart reload -> favorite persistence
- Broader screener/scanner workflow and strategy presets
