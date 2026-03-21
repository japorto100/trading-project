import type { GeoBackendOption } from "./types";

export const geoBackendOptions: GeoBackendOption[] = [
	{
		id: "gateway-first",
		name: "Gateway-first reliability",
		summary:
			"Conservative option aligned to the current stack: Go owns network contracts, replay windows, availability, and source trust while Python stays thin and Rust remains compute-only.",
		fit: "Best default if we want maximum control-flow clarity and minimal runtime drift from the current architecture rules.",
		guardrails: [
			"Browser still talks only to Go.",
			"Replay and freshness contracts stay explicit in Go APIs.",
			"Python does not become a second orchestration layer.",
		],
		goRole: [
			"Replay and availability endpoints",
			"Source freshness registry",
			"Polling policy / fanout contracts",
			"Graph overlay API aggregation",
		],
		pythonRole: [
			"Soft-signal enrichment",
			"Scenario and classification support",
			"Thin async wrappers around model/inference services",
		],
		rustRole: [
			"Hot-path delta and ranking kernels",
			"Large event sorting or scoring",
			"Potential graph adjacency scoring if profiling proves need",
		],
		capabilities: [
			{
				id: "replay-go",
				title: "Replay contract in Go",
				type: "replay",
				owner: "go",
				summary:
					"History windows, replay cursors, and availability should be defined as stable gateway contracts.",
				items: [
					"Replay cursor",
					"Window validation",
					"History fetch contract",
					"Timeline bucket support",
				],
			},
			{
				id: "polling-go",
				title: "Polling governance in Go",
				type: "polling",
				owner: "go",
				summary: "Gateway owns source budgets, cadences, and degrade policy.",
				items: ["Provider budgets", "Cadence classes", "Backoff policy", "Freshness timestamps"],
			},
			{
				id: "graph-python-rust",
				title: "Graph hints from Python/Rust",
				type: "graph-runtime",
				owner: "python",
				summary:
					"Graph overlays stay optional and derived; heavy scoring can move into Rust later.",
				items: [
					"Relation candidates",
					"Scenario links",
					"Entity adjacency scoring",
					"Overlay payload shaping",
				],
			},
		],
	},
	{
		id: "balanced-event-runtime",
		name: "Balanced event runtime",
		summary:
			"Intermediate option: Go remains the contract owner, but Python services become stronger event processors with explicit replay/freshness semantics, and Rust accelerates priority and delta computation.",
		fit: "Good if the Geo workspace becomes more event-heavy and we need richer runtime behavior without changing browser boundaries.",
		guardrails: [
			"Go still owns public API contracts.",
			"Python services must expose deterministic status/freshness metadata.",
			"Rust is only introduced behind measured hotspots.",
		],
		goRole: [
			"API contracts and orchestration",
			"Request-ID and policy enforcement",
			"Realtime fanout entrypoint",
		],
		pythonRole: [
			"Replay materialization service",
			"Timeline availability service",
			"Delta snapshot precomputation",
			"Relation overlay candidate generation",
		],
		rustRole: ["Delta engine", "Priority scoring", "Cluster ranking and label budget helpers"],
		capabilities: [
			{
				id: "replay-python",
				title: "Replay materialization service",
				type: "replay",
				owner: "python",
				summary:
					"Python builds timeline windows and event buckets, Go exposes them as stable contracts.",
				items: [
					"Bucket assembly",
					"Replay snapshots",
					"Availability summaries",
					"Degraded replay mode",
				],
			},
			{
				id: "polling-balanced",
				title: "Polling + freshness split runtime",
				type: "polling",
				owner: "go",
				summary: "Go enforces policy while Python can handle domain-specific fetch shaping.",
				items: ["Gateway policy", "Service-level freshness", "Retry hints", "Source arbitration"],
			},
			{
				id: "graph-balanced",
				title: "Relation overlay precompute",
				type: "graph-runtime",
				owner: "python",
				summary:
					"Graph-like overlays are precomputed as overlay payloads, not as a full graph database commitment.",
				items: [
					"Arc candidates",
					"Path emphasis",
					"Entity relation groups",
					"Scenario-linked edges",
				],
			},
		],
	},
	{
		id: "graph-heavy-analyst",
		name: "Graph-heavy analyst runtime",
		summary:
			"Exploratory option for a later stage: relation overlays, replay, and analyst annotations become first-class runtime concepts, still exposed through Go but backed by stronger Python/Rust graph and event services.",
		fit: "Only makes sense if relation overlays and collaborative analyst workflows become central product requirements.",
		guardrails: [
			"Do not imply a KG migration without a real product commitment.",
			"Keep graph runtime optional and analyst-gated.",
			"Protect the default Geo shell from graph complexity.",
		],
		goRole: [
			"Gateway and public contracts",
			"Auth/policy for analyst graph features",
			"Unified stream/replay surface",
		],
		pythonRole: [
			"Relation runtime service",
			"Annotation/collaboration coordination",
			"Replay and scenario branching support",
		],
		rustRole: ["Graph scoring kernels", "Path/arc ranking", "Large overlay pruning"],
		capabilities: [
			{
				id: "graph-runtime-heavy",
				title: "Analyst graph runtime",
				type: "graph-runtime",
				owner: "python",
				summary:
					"Support arcs, paths, relation clustering, and annotation-linked overlays as explicit runtime concepts.",
				items: [
					"Graph overlay payloads",
					"Annotation linking",
					"Arc/path ranking",
					"Analyst-only relation mode",
				],
			},
			{
				id: "replay-branching",
				title: "Replay + branch scenarios",
				type: "replay",
				owner: "python",
				summary: "Replay is not just history; it becomes a branchable analyst workspace primitive.",
				items: [
					"Branch timeline",
					"Scenario overlays",
					"Availability bands",
					"What-changed slices",
				],
			},
			{
				id: "streaming-graph",
				title: "Streaming relation updates",
				type: "streaming",
				owner: "go",
				summary:
					"Go exposes a unified stream while Python/Rust feed it with relation updates and ranked event changes.",
				items: [
					"Unified stream surface",
					"Relation deltas",
					"Priority updates",
					"Annotation events",
				],
			},
		],
	},
];
