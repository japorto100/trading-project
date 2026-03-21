export type GeoBackendPrimaryRuntime = "go" | "python" | "rust";

export type GeoBackendCapabilityType =
	| "replay"
	| "polling"
	| "graph-runtime"
	| "streaming"
	| "freshness"
	| "availability";

export interface GeoBackendCapabilitySpec {
	id: string;
	title: string;
	type: GeoBackendCapabilityType;
	owner: GeoBackendPrimaryRuntime;
	summary: string;
	items: string[];
}

export interface GeoBackendOption {
	id: string;
	name: string;
	summary: string;
	fit: string;
	guardrails: string[];
	goRole: string[];
	pythonRole: string[];
	rustRole: string[];
	capabilities: GeoBackendCapabilitySpec[];
}
