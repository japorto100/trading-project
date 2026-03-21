import type { GeoFlatExperimentOption } from "./types";

export const geoFlatExperimentOptions: GeoFlatExperimentOption[] = [
	{
		id: "worldmonitor-flat",
		name: "Mission flat workspace",
		derivedFrom: ["worldmonitor", "worldwideview"],
		fit: "Best if Flat mode should become the primary operational map with strong shell discipline and restrained panel count.",
		strengths: [
			"Strong map dominance with clear right-rail rhythm",
			"Panel hierarchy stays readable under pressure",
			"Timeline and source trust fit naturally into the shell",
		],
		risks: [
			"Can feel too OSINT-first if macro/market linkage is not strengthened",
			"May underplay denser shift workflows",
		],
		promoteIf: [
			"Flat should be the main analyst map mode",
			"Panel discipline matters more than terminal density",
			"Source health and replay cues must stay calm and visible",
		],
	},
	{
		id: "operator-flat",
		name: "Operator list-sync flat",
		derivedFrom: ["geosentinel", "worldwideview", "shadowbroker"],
		fit: "Best if Flat mode is primarily used for entity tracking, search, rapid focus changes, and active-list workflows.",
		strengths: [
			"Strong list-to-map and search-to-map affordance",
			"Good fit for aircraft/vessel/entity-heavy operations",
			"Fast path to quick actions and focused detail panes",
		],
		risks: [
			"Can overemphasize tactical operator behavior over broad analyst context",
			"Needs careful control of density and clutter",
		],
		promoteIf: [
			"Entity tracking is a central Flat-mode job",
			"Quick search and active lists matter more than broad context",
			"Operator actions need to be first-class in the shell",
		],
	},
	{
		id: "delta-macro-flat",
		name: "Delta + macro flat desk",
		derivedFrom: ["crucix", "worldmonitor"],
		fit: "Best if Flat mode should function as a decision desk tying geo change directly to market transmission.",
		strengths: [
			"Macro and market transmission become first-class",
			"Delta panels make change visible immediately",
			"Strong support for analyst triage and regime framing",
		],
		risks: [
			"Easier to overload the right rail",
			"Geo context can get displaced by macro cards if not controlled",
		],
		promoteIf: [
			"Geo-to-market reasoning is a core product promise",
			"Change detection matters more than broad feed browsing",
			"Flat should double as a decision desk, not just a map",
		],
	},
];
