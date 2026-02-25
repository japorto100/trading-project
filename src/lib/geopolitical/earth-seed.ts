import { randomUUID } from "node:crypto";
import { GEO_SYMBOL_CATALOG } from "@/lib/geopolitical/catalog";
import { DEFAULT_GEO_REGIONS } from "@/lib/geopolitical/regions";
import type { CreateGeoEventInput } from "@/lib/geopolitical/validation";
import { createGeoCandidate, listGeoCandidates } from "@/lib/server/geopolitical-candidates-store";
import {
	createGeoContradiction,
	listGeoContradictions,
} from "@/lib/server/geopolitical-contradictions-store";
import { createGeoEvent, listGeoEvents } from "@/lib/server/geopolitical-events-store";
import { appendGeoTimelineEntry } from "@/lib/server/geopolitical-timeline-store";

const EARTH_SEED_EVENT_TARGET = 40;
const EARTH_SEED_CANDIDATE_TARGET = 200;
const EARTH_SEED_CONTRADICTION_TARGET = 10;

type RegionCenter = { lat: number; lng: number };

const REGION_CENTERS: Record<string, RegionCenter> = {
	"north-america": { lat: 41, lng: -100 },
	"south-america": { lat: -15, lng: -60 },
	europe: { lat: 50, lng: 12 },
	mena: { lat: 28, lng: 35 },
	"sub-saharan-africa": { lat: 2, lng: 20 },
	"central-asia": { lat: 43, lng: 69 },
	"south-asia": { lat: 22, lng: 78 },
	"east-asia": { lat: 36, lng: 117 },
	"southeast-asia": { lat: 8, lng: 105 },
	oceania: { lat: -24, lng: 134 },
	"arctic-polar": { lat: 76, lng: 20 },
};

function seededRandom(seed: number): () => number {
	let current = seed;
	return () => {
		current = (current * 1664525 + 1013904223) % 4294967296;
		return current / 4294967296;
	};
}

function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

function jitterCoordinate(base: RegionCenter, rand: () => number): { lat: number; lng: number } {
	const lat = clamp(base.lat + (rand() - 0.5) * 18, -85, 85);
	const lng = ((base.lng + (rand() - 0.5) * 28 + 540) % 360) - 180;
	return { lat: Number(lat.toFixed(4)), lng: Number(lng.toFixed(4)) };
}

function buildSeedSourceRef(provider: string, url: string, title: string) {
	return {
		id: `gs_${randomUUID()}`,
		provider,
		url,
		title,
		fetchedAt: new Date().toISOString(),
		publishedAt: new Date().toISOString(),
		sourceTier: "B" as const,
		reliability: provider.toLowerCase().includes("official") ? 0.9 : 0.72,
	};
}

function buildEventTitle(symbolLabel: string, regionLabel: string, idx: number): string {
	const templates = [
		`${symbolLabel} monitoring update — ${regionLabel}`,
		`${symbolLabel} risk watch escalates in ${regionLabel}`,
		`${regionLabel}: ${symbolLabel} scenario tracking`,
		`${symbolLabel} exposure checkpoint (${regionLabel})`,
	];
	return `${templates[idx % templates.length]} #${idx + 1}`;
}

function buildCandidateHeadline(
	kind: "normal" | "contradiction",
	idx: number,
	regionLabel: string,
	symbolLabel: string,
): string {
	if (kind === "contradiction") {
		return idx % 2 === 0
			? `${regionLabel}: reports signal escalation for ${symbolLabel.toLowerCase()} supply chain`
			: `${regionLabel}: officials deny escalation in ${symbolLabel.toLowerCase()} supply chain`;
	}
	const templates = [
		`${regionLabel} ${symbolLabel.toLowerCase()} watchlist item`,
		`${symbolLabel} policy signal candidate in ${regionLabel}`,
		`${regionLabel} monitoring queue: ${symbolLabel.toLowerCase()}`,
		`${symbolLabel} cross-source review candidate (${regionLabel})`,
	];
	return `${templates[idx % templates.length]} #${idx + 1}`;
}

function buildSeedEventInput(index: number): CreateGeoEventInput {
	const rand = seededRandom(10_000 + index * 97);
	const region = DEFAULT_GEO_REGIONS[index % DEFAULT_GEO_REGIONS.length];
	const symbol = GEO_SYMBOL_CATALOG[index % GEO_SYMBOL_CATALOG.length];
	const center = REGION_CENTERS[region.id] ?? { lat: 0, lng: 0 };
	const { lat, lng } = jitterCoordinate(center, rand);
	const countryCodes =
		region.countryCodes.length > 0 ? [region.countryCodes[index % region.countryCodes.length]] : [];
	return {
		title: buildEventTitle(symbol.label, region.label, index),
		symbol: symbol.symbol,
		category: symbol.category,
		status: index % 9 === 0 ? "persistent" : index % 5 === 0 ? "confirmed" : "candidate",
		severity: (2 + (index % 4)) as 2 | 3 | 4 | 5,
		confidence: (1 + (index % 4)) as 1 | 2 | 3 | 4,
		lat,
		lng,
		countryCodes,
		regionIds: [region.id],
		summary: `Phase-4 Earth seed event for ${region.label} (${symbol.label}).`,
		analystNote: "seed:phase4-earth",
	};
}

function buildSeedCandidateInput(index: number, contradiction = false) {
	const rand = seededRandom(20_000 + index * 131);
	const region = DEFAULT_GEO_REGIONS[index % DEFAULT_GEO_REGIONS.length];
	const symbol = GEO_SYMBOL_CATALOG[index % GEO_SYMBOL_CATALOG.length];
	const provider = contradiction
		? "ConflictSeedSynth"
		: index % 3 === 0
			? "Reuters"
			: "OfficialMonitor";
	const sourceUrl = contradiction
		? `https://seed.local/contradiction/${Math.floor(index / 2)}`
		: `https://seed.local/candidate/${index}`;
	return {
		triggerType: (index % 4 === 0 ? "hard_signal" : "news_cluster") as
			| "hard_signal"
			| "news_cluster",
		confidence: Number((0.46 + rand() * 0.48).toFixed(2)),
		severityHint: (2 + (index % 4)) as 2 | 3 | 4 | 5,
		headline: buildCandidateHeadline(
			contradiction ? "contradiction" : "normal",
			index,
			region.label,
			symbol.label,
		),
		regionHint: region.id,
		countryHints:
			region.countryCodes.length > 0
				? [region.countryCodes[index % region.countryCodes.length]]
				: undefined,
		sourceRefs: [
			buildSeedSourceRef(
				provider,
				sourceUrl,
				contradiction ? "Contradiction seed source" : "Earth seed source",
			),
		],
		reviewNote: contradiction
			? `seed:phase4-earth-contradiction pair=${Math.floor(index / 2)}`
			: "seed:phase4-earth",
		symbol: symbol.symbol,
		category: symbol.category,
	};
}

export interface EnsureGeoEarthSeedDatasetResult {
	targets: {
		events: number;
		candidates: number;
		contradictions: number;
	};
	before: {
		events: number;
		candidates: number;
		contradictions: number;
	};
	created: {
		events: number;
		candidates: number;
		contradictions: number;
	};
	after: {
		events: number;
		candidates: number;
		contradictions: number;
	};
	note: string;
}

export async function ensureGeoEarthSeedDataset(
	actor = "seed-engine",
): Promise<EnsureGeoEarthSeedDatasetResult> {
	const beforeEvents = await listGeoEvents();
	const beforeCandidates = await listGeoCandidates();
	const beforeContradictions = await listGeoContradictions();
	const beforeContradictionCount = beforeContradictions.length;

	let createdEvents = 0;
	let createdCandidates = 0;
	let createdContradictions = 0;

	const missingEvents = Math.max(0, EARTH_SEED_EVENT_TARGET - beforeEvents.length);
	for (let index = 0; index < missingEvents; index += 1) {
		const eventInput = buildSeedEventInput(beforeEvents.length + index);
		const event = await createGeoEvent(eventInput, actor);
		createdEvents += 1;
		await appendGeoTimelineEntry({
			eventId: event.id,
			action: "created",
			actor,
			diffSummary: `Seeded Earth event: ${event.title}`,
		});
	}

	const missingContradictions = Math.max(
		0,
		EARTH_SEED_CONTRADICTION_TARGET - beforeContradictionCount,
	);
	for (let index = 0; index < missingContradictions; index += 1) {
		const contradictionIndex = beforeContradictionCount + index;
		const region = DEFAULT_GEO_REGIONS[contradictionIndex % DEFAULT_GEO_REGIONS.length];
		const symbol = GEO_SYMBOL_CATALOG[contradictionIndex % GEO_SYMBOL_CATALOG.length];
		const sourceRef = buildSeedSourceRef(
			"ConflictSeedSynth",
			`https://seed.local/contradictions/${contradictionIndex}`,
			"Contradiction seed source",
		);
		const contradiction = await createGeoContradiction({
			title: `${region.label}: contradictory signals for ${symbol.label}`,
			severityHint: (2 + (contradictionIndex % 3)) as 2 | 3 | 4,
			regionId: region.id,
			countryCode: region.countryCodes[0],
			summary: "Phase-4 contradiction seed record for review workflow and queue testing.",
			statementA: buildCandidateHeadline(
				"contradiction",
				contradictionIndex * 2,
				region.label,
				symbol.label,
			),
			statementB: buildCandidateHeadline(
				"contradiction",
				contradictionIndex * 2 + 1,
				region.label,
				symbol.label,
			),
			sourceRefs: [sourceRef],
			createdBy: actor,
		});
		await appendGeoTimelineEntry({
			eventId: `contradiction:${contradiction.id}`,
			action: "contradiction_created",
			actor,
			diffSummary: `Seeded contradiction: ${contradiction.title}`,
		});
		createdContradictions += 1;
	}

	const currentCandidateCountEstimate = beforeCandidates.length + createdCandidates;
	const missingCandidates = Math.max(
		0,
		EARTH_SEED_CANDIDATE_TARGET - currentCandidateCountEstimate,
	);
	for (let index = 0; index < missingCandidates; index += 1) {
		const candidateIndex = beforeCandidates.length + createdCandidates + index + 1000;
		const created = await createGeoCandidate(buildSeedCandidateInput(candidateIndex, false));
		if (!created.deduped) {
			createdCandidates += 1;
		}
	}

	const afterEvents = await listGeoEvents();
	const afterCandidates = await listGeoCandidates();
	const afterContradictions = await listGeoContradictions();
	const afterContradictionCount = afterContradictions.length;

	const contradictionNote =
		"Contradictions are seeded as dedicated local records with API + timeline audit; review workflow remains partial.";

	return {
		targets: {
			events: EARTH_SEED_EVENT_TARGET,
			candidates: EARTH_SEED_CANDIDATE_TARGET,
			contradictions: EARTH_SEED_CONTRADICTION_TARGET,
		},
		before: {
			events: beforeEvents.length,
			candidates: beforeCandidates.length,
			contradictions: beforeContradictionCount,
		},
		created: {
			events: createdEvents,
			candidates: createdCandidates,
			contradictions: createdContradictions,
		},
		after: {
			events: afterEvents.length,
			candidates: afterCandidates.length,
			contradictions: afterContradictionCount,
		},
		note: contradictionNote,
	};
}
