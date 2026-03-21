import type { GeoCesiumExperimentOption } from "./types";

export const geoCesiumExperimentOptions: GeoCesiumExperimentOption[] = [
	{
		id: "scene-sidecar",
		name: "Cesium scene sidecar",
		fit: "Use when we want a separate analyst scene mode for terrain, orbital, or time-dynamic tracks without replacing the main GeoMap stack.",
		capabilities: [
			"Terrain and camera-driven scene exploration",
			"Potential 3D tiles and orbital/body sidecar",
			"Time-dynamic track playback",
			"Scene-only specialist workflows",
		],
		costs: [
			"Additional runtime and ops weight",
			"Second scene model to maintain",
			"More complicated camera/state sync",
		],
		decisionRule: [
			"Promote only if sidecar scene value is clear and repeatable",
			"Keep default GeoMap on current Globe/Flat strategy",
			"Treat Cesium as additive, not replacement-first",
		],
	},
	{
		id: "hybrid-tiles-track",
		name: "Hybrid tiles + scene track",
		fit: "Use when we need a path between current stack and richer scene overlays without committing the whole shell to Cesium.",
		capabilities: [
			"Scene experiments for selected domains",
			"Bridge to 3D tiles or terrain-heavy assets",
			"Controlled trial for richer geospatial context",
		],
		costs: [
			"Integration complexity between map modes",
			"Need for stricter sidecar boundaries",
			"Potential user confusion if role boundaries are weak",
		],
		decisionRule: [
			"Promote only if the sidecar solves a real analyst problem",
			"Do not collapse Flat or Globe into a premature scene rewrite",
			"Scene mode must justify itself with unique capabilities",
		],
	},
	{
		id: "defer-cesium",
		name: "Defer scene runtime",
		fit: "Use when current Globe + Flat stack covers near-term analyst needs and scene complexity would mostly distract from shell/product polish.",
		capabilities: [
			"Protect focus on Flat and shell maturity",
			"Keep renderer complexity bounded",
			"Revisit only after experiment evidence exists",
		],
		costs: ["No immediate terrain/scene showcase", "Some advanced scene use cases stay postponed"],
		decisionRule: [
			"Choose this if no scene-only workflow is clearly valuable today",
			"Prefer sidecar experimentation over product rewrite",
			"Reopen after Flat and shell promotion is complete",
		],
	},
];
