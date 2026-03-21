# GeoMap Experiment Reference Coverage

> Working note for the isolated `/geomap/experiment` surface.  
> Purpose: show which clone-review ideas are already materialized in experiment code, and which remain intentionally out of scope for now.

## Goal

This experiment is not meant to reproduce any single clone. It is meant to lay out the shell, dock, panel, workflow, and support-module ideas from the reference reviews in executable UI form so we can decide what deserves promotion into the real GeoMap.

## Coverage by reference

### `worldmonitor`

Main role:

- shell rhythm
- dock hierarchy
- right-rail composition
- panel primitive discipline
- status/freshness visibility

Materialized in experiment code:

- [`GeoMapExperimentWorkspace.tsx`](D:/tradingview-clones/tradeview-fusion/src/features/geopolitical/geomap/experiment/components/GeoMapExperimentWorkspace.tsx)
- [`GeoMapExperimentPanelFrame.tsx`](D:/tradingview-clones/tradeview-fusion/src/features/geopolitical/geomap/experiment/components/GeoMapExperimentPanelFrame.tsx)
- [`worldmonitor-mission.ts`](D:/tradingview-clones/tradeview-fusion/src/features/geopolitical/geomap/experiment/variants/worldmonitor-mission.ts)

Still intentionally not implemented here:

- full runtime data-loader semantics
- exact feed/panel persistence model
- real map renderer integration

### `worldwideview`

Main role:

- search orchestration
- timeline coupling
- polling/history/availability thinking
- workflow-oriented shell behavior

Materialized in experiment code:

- support modules in all variants, especially:
  - `Search + workflow bar`
  - `Replay + availability strip`
  - `Search + command bar`
  - `Timeline Mode`
  - `Processing + layer pipeline`

Primary code paths:

- [`fusion-analyst.ts`](D:/tradingview-clones/tradeview-fusion/src/features/geopolitical/geomap/experiment/variants/fusion-analyst.ts)
- [`signal-delta-desk.ts`](D:/tradingview-clones/tradeview-fusion/src/features/geopolitical/geomap/experiment/variants/signal-delta-desk.ts)
- [`GeoMapExperimentCoverageBoard.tsx`](D:/tradingview-clones/tradeview-fusion/src/features/geopolitical/geomap/experiment/components/GeoMapExperimentCoverageBoard.tsx)

Still intentionally not implemented here:

- plugin/data-bus runtime
- availability APIs
- real replay contracts

### `Crucix`

Main role:

- `Macro + Markets`
- `Sweep Delta`
- cross-source signal condensation
- denser analyst terminal thinking

Materialized in experiment code:

- `Macro + Markets`
- `Sweep Delta`
- `Cross-Source Signals`
- `Delta Core`
- `Delta + transmission engine`

Primary code paths:

- [`fusion-analyst.ts`](D:/tradingview-clones/tradeview-fusion/src/features/geopolitical/geomap/experiment/variants/fusion-analyst.ts)
- [`signal-delta-desk.ts`](D:/tradingview-clones/tradeview-fusion/src/features/geopolitical/geomap/experiment/variants/signal-delta-desk.ts)

Still intentionally not implemented here:

- real delta computation
- market data plumbing
- notification/cooldown logic

### `GeoSentinel`

Main role:

- operator-first search
- active list <-> map sync
- tactical quick filters
- zoom-aware marker/search workflow

Materialized in experiment code:

- `Layer + Search Dock`
- `Active Lists`
- `Operator search lane`
- `Quick external actions`
- search-focused support modules in all variants

Primary code paths:

- [`worldmonitor-mission.ts`](D:/tradingview-clones/tradeview-fusion/src/features/geopolitical/geomap/experiment/variants/worldmonitor-mission.ts)
- [`signal-delta-desk.ts`](D:/tradingview-clones/tradeview-fusion/src/features/geopolitical/geomap/experiment/variants/signal-delta-desk.ts)

Still intentionally not implemented here:

- real entity tracking flows
- map/list bidirectional runtime binding
- external tool actions

### `Shadowbroker`

Main role:

- freshness
- degraded mode
- history/replay trust cues
- runtime resilience visibility

Materialized in experiment code:

- `Source Health`
- `Source + Ops`
- `Runtime trust strip`
- `Replay + availability strip`
- `Feed + settings config`
- `Situation detail lane`

Primary code paths:

- [`worldmonitor-mission.ts`](D:/tradingview-clones/tradeview-fusion/src/features/geopolitical/geomap/experiment/variants/worldmonitor-mission.ts)
- [`fusion-analyst.ts`](D:/tradingview-clones/tradeview-fusion/src/features/geopolitical/geomap/experiment/variants/fusion-analyst.ts)

Still intentionally not implemented here:

- actual polling/failover runtime
- websocket/live-path behavior
- backend contract details

### `Sovereign_Watch`

Main role:

- replay/history/availability as real operator concerns
- runtime and ingestion realism
- worker/layer/realtime mindset

Materialized in experiment code:

- replay/freshness support modules
- source/runtime trust lanes
- timeline kept as explicit workspace strip rather than a hidden tab
- `Processing + layer pipeline`

Primary code paths:

- [`fusion-analyst.ts`](D:/tradingview-clones/tradeview-fusion/src/features/geopolitical/geomap/experiment/variants/fusion-analyst.ts)
- [`worldmonitor-mission.ts`](D:/tradingview-clones/tradeview-fusion/src/features/geopolitical/geomap/experiment/variants/worldmonitor-mission.ts)

Still intentionally not implemented here:

- worker-first processing
- replay backend contract
- broadcast/historian patterns

### `conflict-globe.gl`

Main role:

- relation overlays
- arcs / paths / rings / hexbin
- optional analyst graph-style visual layer

Materialized in experiment code:

- `Relation overlay lane`
- `Relation overlays`
- `Graph emphasis`
- `Collaboration + annotations`

Primary code paths:

- [`worldmonitor-mission.ts`](D:/tradingview-clones/tradeview-fusion/src/features/geopolitical/geomap/experiment/variants/worldmonitor-mission.ts)
- [`fusion-analyst.ts`](D:/tradingview-clones/tradeview-fusion/src/features/geopolitical/geomap/experiment/variants/fusion-analyst.ts)
- [`signal-delta-desk.ts`](D:/tradingview-clones/tradeview-fusion/src/features/geopolitical/geomap/experiment/variants/signal-delta-desk.ts)

Still intentionally not implemented here:

- actual arc/path rendering
- correlation heuristics
- collaboration/room behavior

## Current boundary

This experiment now covers the reference clones at the level of:

- shell structure
- panel roles
- dock hierarchy
- support-module placement
- clone-specific capability lanes
- backend option lanes for replay, polling, and graph-runtime thinking adapted to Go/Python/Rust
- dedicated Flat-mode comparison options derived from the strongest clone patterns
- dedicated Cesium/scene sidecar decision options

This experiment does not yet claim to cover:

- real backend/runtime behavior
- production data contracts
- actual replay engines
- actual graph overlay rendering
- final promoted product decisions
- a production-grade Cesium sidecar beyond the current experiment preview
- a real alternate Flat renderer integrated into the productive GeoMap

## Honest extraction statement

For UI and shell decisions, the experiment now contains the parts that are most interesting for us from the clone reviews:

- panel hierarchy
- dock rhythm
- search/workflow entrypoints
- timeline/replay placement
- delta/macro/market panels
- runtime trust/freshness surfaces
- relation-overlay lanes
- operator list/action surfaces

What is still not extracted one-to-one:

- every cosmetic variant
- every clone-specific micro-panel
- backend adapters and provider-specific flows
- real runtime behavior behind those surfaces

That is intentional. The target is to have all decision-relevant UI ideas visible in code, not to rebuild each clone in full.

## Promotion rule

Nothing graduates from this experiment into the productive GeoMap until it passes three steps:

1. Selected as the preferred variant or preferred sub-pattern
2. Mapped into execution work and verify gates
3. Reimplemented in the real GeoMap shell with live verification
