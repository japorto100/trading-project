# worldwideview Stage 3 Timeline/Selection/UI Contract Matrix

Source repo: `d:\tradingview-clones\_tmp_ref_review\geo\worldwideview`

## Extract vs Skip

| File | Decision | Why it matters for GeoMap |
|---|---|---|
| `src/core/globe/TimelineSync.ts` | Extract (partial) | Useful bridge pattern between timeline state, plugin polling, and availability events. |
| `src/core/state/timelineSlice.ts` | Skip (contract only) | Too simple vs your stronger temporal model (`view/filter/selected-time`). Keep only enum/window ideas. |
| `src/components/timeline/Timeline.tsx` | Extract (partial) | Useful playback-mode UX toggles + availability highlight track pattern. |
| `src/core/state/uiSlice.ts` | Extract | Good centralized UI state contract for sidebars, selection, hover, and mobile panel toggles. |
| `src/core/globe/InteractionHandler.ts` | Extract | Solid pick/hover throttling pattern to prevent state thrash on mouse move. |
| `src/core/globe/SelectionHandler.ts` | Extract (partial) | Useful selection behavior extension (`getSelectionBehavior`) + trail-on-select pattern. |
| `src/components/panels/EntityInfoCard.tsx` | Extract (partial) | Good hover card placement/clamping logic for viewport safety. |
| `src/core/globe/GlobeView.tsx` | Review anchor | Keep as wiring reference; do not copy as monolith. Extract hook-boundary ideas only. |

## Transferable Patterns

1. **Timeline sync as logic-only component**  
   Keep UI timeline separate from orchestration component that syncs state -> fetch/update side effects.

2. **Hover throttling + state-change guard**  
   In `InteractionHandler`, expensive pick calls are throttled and React state updates happen only when hovered ID changes.

3. **Selection behavior as plugin extension**  
   `getSelectionBehavior(entity)` allows per-layer customization (trail/camera offsets) without hardcoding in globe core.

4. **UI state centralization**  
   `uiSlice` provides one contract for sidebars, selection, hover, and mobile panel focus.

5. **Availability overlay track**  
   Timeline highlights source availability windows; useful for replay/debug and sparse-history transparency.

## Gaps vs current tradeview-fusion

- `timelineSlice` lacks explicit separation of **visible window** vs **active filter window**.
- No first-class `selected-time` contract comparable to your current GeoMap temporal state.
- Story/preset coupling is weaker than your existing timeline-story integration.

## Recommendation for tradeview-fusion

- Reuse Stage 3 patterns mainly for **interaction efficiency** (hover/pick throttling) and **UI coupling hygiene**.
- Do not regress to worldwideview's simpler timeline contract.
- Keep your current temporal contract as source of truth; adopt only compositional UI/interaction patterns.
