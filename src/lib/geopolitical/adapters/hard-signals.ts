import { randomUUID } from "node:crypto";
import { scoreCandidateConfidence } from "@/lib/geopolitical/confidence";
import type { GeopoliticalIngestionBudget } from "@/lib/geopolitical/ingestion-budget";
import type { GeoCandidate, GeoSourceRef } from "@/lib/geopolitical/types";

export interface HardSignalAdapterResult {
	provider: string;
	ok: boolean;
	message?: string;
	candidates: GeoCandidate[];
}

interface FetchedSource {
	provider: string;
	url: string;
	title: string;
	sourceTier: "A" | "B" | "C";
	reliability: number;
	enabled: boolean;
}

const DEFAULT_REQUEST_TIMEOUT_MS = 12000;

function buildSourceRef(input: {
	provider: string;
	url: string;
	title: string;
	sourceTier?: "A" | "B" | "C";
	reliability?: number;
	publishedAt?: string;
}): GeoSourceRef {
	return {
		id: `gs_${randomUUID()}`,
		provider: input.provider,
		url: input.url,
		title: input.title,
		publishedAt: input.publishedAt,
		fetchedAt: new Date().toISOString(),
		sourceTier: input.sourceTier ?? "A",
		reliability: input.reliability ?? 0.92,
	};
}

function createCandidate(input: {
	triggerType: GeoCandidate["triggerType"];
	headline: string;
	severityHint: GeoCandidate["severityHint"];
	regionHint?: string;
	countryHints?: string[];
	sourceRefs: GeoSourceRef[];
	symbol?: string;
	category?: string;
}): GeoCandidate {
	const base: GeoCandidate = {
		id: `gc_${randomUUID()}`,
		generatedAt: new Date().toISOString(),
		triggerType: input.triggerType,
		confidence: 0,
		severityHint: input.severityHint,
		headline: input.headline,
		regionHint: input.regionHint,
		countryHints: input.countryHints,
		sourceRefs: input.sourceRefs,
		state: "open",
		symbol: input.symbol,
		category: input.category,
	};
	return {
		...base,
		confidence: scoreCandidateConfidence(base),
	};
}

function latestPublishedAtFromText(text: string): string | undefined {
	const isoMatches = text.match(/\b(20\d{2}-\d{2}-\d{2})\b/g) ?? [];
	let latestMs = -1;

	for (const match of isoMatches) {
		const ms = Date.parse(match);
		if (Number.isFinite(ms) && ms > latestMs) {
			latestMs = ms;
		}
	}

	if (latestMs < 0) return undefined;
	return new Date(latestMs).toISOString();
}

async function fetchOfficialSource(
	source: FetchedSource,
): Promise<{ sourceRef?: GeoSourceRef; error?: string }> {
	if (!source.enabled) {
		return { error: `ingest disabled for ${source.provider}` };
	}

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), DEFAULT_REQUEST_TIMEOUT_MS);
	try {
		const response = await fetch(source.url, {
			method: "GET",
			headers: {
				"user-agent": "tradeview-fusion-geopolitical-ingestor/1.0",
				accept: "text/html,application/json,text/plain,*/*",
			},
			signal: controller.signal,
			cache: "no-store",
		});

		if (!response.ok) {
			return { error: `${source.provider} returned HTTP ${response.status}` };
		}

		const text = await response.text();
		const publishedAt =
			latestPublishedAtFromText(text) ??
			response.headers.get("last-modified") ??
			new Date().toISOString();

		return {
			sourceRef: buildSourceRef({
				provider: source.provider,
				url: source.url,
				title: source.title,
				sourceTier: source.sourceTier,
				reliability: source.reliability,
				publishedAt,
			}),
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "unknown fetch error";
		return { error: `${source.provider} fetch failed: ${message}` };
	} finally {
		clearTimeout(timeout);
	}
}

async function ingestRatesSignals(
	budget?: GeopoliticalIngestionBudget,
): Promise<HardSignalAdapterResult> {
	if (budget && !budget.reserveProviderCall("rates")) {
		return {
			provider: "rates",
			ok: false,
			message: "provider-call budget exhausted",
			candidates: [],
		};
	}

	const sources: FetchedSource[] = [
		{
			provider: "federal_reserve",
			url: "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm",
			title: "Federal Reserve FOMC calendar",
			sourceTier: "A",
			reliability: 0.97,
			enabled: process.env.ENABLE_CENTRAL_BANK_CALENDAR_INGEST !== "false",
		},
		{
			provider: "ecb",
			url: "https://www.ecb.europa.eu/press/calendars/html/index.en.html",
			title: "ECB Governing Council calendar",
			sourceTier: "A",
			reliability: 0.97,
			enabled: process.env.ENABLE_CENTRAL_BANK_CALENDAR_INGEST !== "false",
		},
	];

	const fetched = await Promise.all(sources.map((source) => fetchOfficialSource(source)));
	const sourceRefs = fetched
		.map((entry) => entry.sourceRef)
		.filter((entry): entry is GeoSourceRef => Boolean(entry));
	const errors = fetched
		.map((entry) => entry.error)
		.filter((entry): entry is string => Boolean(entry));

	if (sourceRefs.length === 0) {
		return {
			provider: "rates",
			ok: false,
			message: errors.join(" | ") || "no enabled sources available",
			candidates: [],
		};
	}

	const candidates: GeoCandidate[] = [];
	if (!budget || budget.reserveCandidate()) {
		candidates.push(
			createCandidate({
				triggerType: "hard_signal",
				headline: `Central bank schedule signal detected (${sourceRefs.length} official source${sourceRefs.length > 1 ? "s" : ""})`,
				severityHint: 2,
				regionHint: "global",
				sourceRefs,
				symbol: "percent",
				category: "monetary_policy_rates",
			}),
		);
	}

	return {
		provider: "rates",
		ok: true,
		message:
			errors.length > 0
				? `partial source failures: ${errors.join(" | ")}`
				: candidates.length === 0
					? "candidate budget exhausted"
					: undefined,
		candidates,
	};
}

async function ingestSanctionsSignals(
	budget?: GeopoliticalIngestionBudget,
): Promise<HardSignalAdapterResult> {
	if (budget && !budget.reserveProviderCall("sanctions")) {
		return {
			provider: "sanctions",
			ok: false,
			message: "provider-call budget exhausted",
			candidates: [],
		};
	}

	const sources: FetchedSource[] = [
		{
			provider: "ofac",
			url: "https://ofac.treasury.gov/sanctions-list-service",
			title: "OFAC sanctions list service",
			sourceTier: "A",
			reliability: 0.98,
			enabled: process.env.ENABLE_OFAC_INGEST !== "false",
		},
		{
			provider: "uk_sanctions",
			url: "https://www.gov.uk/government/publications/the-uk-sanctions-list",
			title: "UK Sanctions List",
			sourceTier: "A",
			reliability: 0.97,
			enabled: process.env.ENABLE_UK_SANCTIONS_INGEST !== "false",
		},
		{
			provider: "un_sanctions",
			url: "https://main.un.org/securitycouncil/en/content/un-sc-consolidated-list",
			title: "UN consolidated sanctions list",
			sourceTier: "A",
			reliability: 0.96,
			enabled: process.env.ENABLE_UN_SANCTIONS_INGEST !== "false",
		},
	];

	const fetched = await Promise.all(sources.map((source) => fetchOfficialSource(source)));
	const sourceRefs = fetched
		.map((entry) => entry.sourceRef)
		.filter((entry): entry is GeoSourceRef => Boolean(entry));
	const errors = fetched
		.map((entry) => entry.error)
		.filter((entry): entry is string => Boolean(entry));

	if (sourceRefs.length === 0) {
		return {
			provider: "sanctions",
			ok: false,
			message: errors.join(" | ") || "no enabled sources available",
			candidates: [],
		};
	}

	const candidates: GeoCandidate[] = [];
	if (!budget || budget.reserveCandidate()) {
		candidates.push(
			createCandidate({
				triggerType: "hard_signal",
				headline: `Sanctions signal detected (${sourceRefs.length} official source${sourceRefs.length > 1 ? "s" : ""})`,
				severityHint: 3,
				regionHint: "global",
				sourceRefs,
				symbol: "gavel",
				category: "sanctions_export_controls",
			}),
		);
	}

	return {
		provider: "sanctions",
		ok: true,
		message:
			errors.length > 0
				? `partial source failures: ${errors.join(" | ")}`
				: candidates.length === 0
					? "candidate budget exhausted"
					: undefined,
		candidates,
	};
}

export async function runHardSignalAdapters(
	budget?: GeopoliticalIngestionBudget,
): Promise<HardSignalAdapterResult[]> {
	const tasks: Array<Promise<HardSignalAdapterResult>> = [
		ingestRatesSignals(budget),
		ingestSanctionsSignals(budget),
	];
	return Promise.all(tasks);
}
