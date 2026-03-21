export type GeoMapExperimentSurface = "globe" | "flat" | "both";

export type GeoMapExperimentRole =
	| "primary"
	| "secondary"
	| "contextual"
	| "timeline"
	| "operations"
	| "control";

export type GeoMapExperimentReference =
	| "worldmonitor"
	| "worldwideview"
	| "crucix"
	| "geosentinel"
	| "shadowbroker"
	| "sovereign_watch"
	| "conflict_globe_gl";

export type GeoMapExperimentStatus = "live" | "cached" | "degraded";

export interface GeoMapExperimentPanelSpec {
	id: string;
	title: string;
	subtitle: string;
	role: GeoMapExperimentRole;
	appliesTo: GeoMapExperimentSurface;
	status: GeoMapExperimentStatus;
	references: GeoMapExperimentReference[];
	stats: string[];
	items: string[];
	notes?: string[];
}

export interface GeoMapExperimentModuleSpec {
	id: string;
	title: string;
	summary: string;
	placement: "topbar" | "support" | "runtime" | "overlay";
	appliesTo: GeoMapExperimentSurface;
	status: GeoMapExperimentStatus;
	references: GeoMapExperimentReference[];
	items: string[];
}

export interface GeoMapExperimentVariant {
	id: string;
	name: string;
	summary: string;
	rationale: string[];
	guardrails: string[];
	viewportChips: string[];
	viewportSignals: string[];
	leftRail: GeoMapExperimentPanelSpec[];
	rightPrimary: GeoMapExperimentPanelSpec[];
	rightSecondary: GeoMapExperimentPanelSpec[];
	bottomRail: GeoMapExperimentPanelSpec[];
	supportModules: GeoMapExperimentModuleSpec[];
}
