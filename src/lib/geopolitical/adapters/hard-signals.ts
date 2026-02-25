import { randomUUID } from "node:crypto";
import { scoreCandidateConfidence } from "@/lib/geopolitical/confidence";
import {
	computeHardSignalContentHash,
	evaluateAndPersistHardSignalSourceDeltas,
	getHardSignalSourceDeltaKey,
	type HardSignalSourceSnapshot,
} from "@/lib/geopolitical/hard-signal-delta";
import type { GeopoliticalIngestionBudget } from "@/lib/geopolitical/ingestion-budget";
import { formatGeoAutoReviewNote } from "@/lib/geopolitical/ingestion-contracts";
import type { GeoCandidate, GeoSourceRef } from "@/lib/geopolitical/types";
import { fetchAcledEventsViaGateway } from "@/lib/server/geopolitical-acled-bridge";

export interface HardSignalAdapterResult {
	provider: string;
	ok: boolean;
	message?: string;
	candidates: GeoCandidate[];
}

export interface HardSignalAdapterContext {
	requestId?: string;
	userRole?: string;
}

interface FetchedSource {
	provider: string;
	url: string;
	title: string;
	sourceTier: "A" | "B" | "C";
	reliability: number;
	enabled: boolean;
}

interface FetchedOfficialSourceSuccess {
	sourceRef: GeoSourceRef;
	snapshot: HardSignalSourceSnapshot;
	keywordTags: string[];
	keywordHitCount: number;
	semanticHints: HardSignalSemanticHints;
}

interface HardSignalSemanticHints {
	documentType?: string;
	rateAction?: "hike" | "cut" | "hold";
	basisPoints?: number;
	sanctionsAction?: "designations" | "delistings" | "general_license" | "amendment" | "list_update";
	targetTags: string[];
}

const DEFAULT_REQUEST_TIMEOUT_MS = 12000;

function daysAgoIsoDate(days: number): string {
	const clamped = Number.isFinite(days) ? Math.max(0, Math.floor(days)) : 3;
	const date = new Date(Date.now() - clamped * 24 * 60 * 60 * 1000);
	return date.toISOString().slice(0, 10);
}

function clampInt(value: number, min: number, max: number, fallback: number): number {
	if (!Number.isFinite(value)) return fallback;
	return Math.max(min, Math.min(max, Math.floor(value)));
}

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
	reviewExtra?: Record<string, string | number | boolean | undefined | null>;
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
	const confidence = scoreCandidateConfidence(base);
	return {
		...base,
		confidence,
		reviewNote: formatGeoAutoReviewNote({
			pipeline: "hard",
			adapterId: input.category ?? "hard_signal",
			triggerType: base.triggerType,
			confidence,
			sourceRefs: base.sourceRefs,
			category: base.category,
			extra: input.reviewExtra,
		}),
	};
}

function extractKeywordHints(
	text: string,
	keywords: string[],
): { tags: string[]; hitCount: number } {
	const haystack = text.toLowerCase();
	const tags: string[] = [];
	let hitCount = 0;
	for (const keyword of keywords) {
		if (haystack.includes(keyword)) {
			hitCount += 1;
			tags.push(keyword);
		}
	}
	return { tags: tags.slice(0, 6), hitCount };
}

function getProviderKeywordHints(
	provider: string,
	text: string,
): { tags: string[]; hitCount: number } {
	const normalized = provider.toLowerCase();
	if (normalized.includes("federal_reserve")) {
		return extractKeywordHints(text, [
			"fomc",
			"statement",
			"meeting",
			"minutes",
			"federal funds",
			"press release",
		]);
	}
	if (normalized.includes("ecb")) {
		return extractKeywordHints(text, [
			"governing council",
			"monetary policy",
			"interest rate",
			"deposit facility",
			"main refinancing",
			"press release",
		]);
	}
	if (normalized.includes("ofac")) {
		return extractKeywordHints(text, [
			"sanctions",
			"sdn",
			"general license",
			"ukraine",
			"iran",
			"russia",
		]);
	}
	if (normalized.includes("un")) {
		return extractKeywordHints(text, [
			"security council",
			"consolidated list",
			"committee",
			"sanctions",
			"resolution",
		]);
	}
	if (normalized.includes("uk_sanctions")) {
		return extractKeywordHints(text, [
			"uk sanctions list",
			"financial sanctions",
			"designated",
			"ofsi",
			"asset freeze",
		]);
	}
	return extractKeywordHints(text, ["sanctions", "rate", "policy", "official"]);
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

function parseBasisPoints(text: string, action: "hike" | "cut"): number | undefined {
	const patterns =
		action === "hike"
			? [
					/(?:raise[sd]?|increas(?:e|ed)|hike[sd]?)[\s\S]{0,120}?(\d{1,3})\s*(?:basis points?|bp)\b/i,
					/(\d{1,3})\s*(?:basis points?|bp)\b[\s\S]{0,80}?(?:increase|hike|raise)/i,
				]
			: [
					/(?:cut|reduce[sd]?|decreas(?:e|ed)|lower(?:ed)?)[\s\S]{0,120}?(\d{1,3})\s*(?:basis points?|bp)\b/i,
					/(\d{1,3})\s*(?:basis points?|bp)\b[\s\S]{0,80}?(?:cut|reduction|lower)/i,
				];
	for (const pattern of patterns) {
		const match = text.match(pattern);
		if (!match) continue;
		const value = Number(match[1]);
		if (Number.isFinite(value) && value > 0 && value <= 500) return value;
	}
	return undefined;
}

function inferRateSemanticHints(provider: string, text: string): HardSignalSemanticHints {
	const lower = text.toLowerCase();
	const targetTags: string[] = [];
	let documentType: string | undefined;
	if (lower.includes("minutes")) documentType = "minutes";
	else if (lower.includes("statement")) documentType = "statement";
	else if (lower.includes("press release")) documentType = "press_release";
	else if (lower.includes("calendar")) documentType = "calendar";
	else if (provider.includes("ecb") && lower.includes("governing council"))
		documentType = "governing_council";

	if (provider.includes("federal_reserve")) targetTags.push("usd", "us");
	if (provider.includes("ecb")) targetTags.push("eur", "eurozone");

	const hasHoldSignal =
		/\b(unchanged|held steady|remain(?:ed)? unchanged|maintain(?:ed)?(?: the)? target range)\b/i.test(
			text,
		) || /\bleft\b[\s\S]{0,50}?\bunchanged\b/i.test(text);
	if (hasHoldSignal) {
		return { documentType, rateAction: "hold", targetTags };
	}

	const hikeBp = parseBasisPoints(text, "hike");
	if (hikeBp) {
		return { documentType, rateAction: "hike", basisPoints: hikeBp, targetTags };
	}
	const cutBp = parseBasisPoints(text, "cut");
	if (cutBp) {
		return { documentType, rateAction: "cut", basisPoints: cutBp, targetTags };
	}
	return { documentType, targetTags };
}

function inferSanctionsSemanticHints(provider: string, text: string): HardSignalSemanticHints {
	const lower = text.toLowerCase();
	const targetTags = [
		"russia",
		"iran",
		"north korea",
		"dprk",
		"syria",
		"belarus",
		"china",
		"myanmar",
		"sudan",
	].filter((tag) => lower.includes(tag));

	let documentType: string | undefined;
	if (lower.includes("general license")) documentType = "general_license";
	else if (lower.includes("consolidated list")) documentType = "consolidated_list";
	else if (lower.includes("sanctions list")) documentType = "sanctions_list";
	else if (lower.includes("notice")) documentType = "notice";

	let sanctionsAction: HardSignalSemanticHints["sanctionsAction"];
	if (lower.includes("general license")) sanctionsAction = "general_license";
	else if (/\b(remove[sd]?|delist(?:ed|ing)?|de-list(?:ed|ing)?)\b/i.test(text)) {
		sanctionsAction = "delistings";
	} else if (
		/\b(designated|designation|newly designated|added to (?:the )?(?:sdn|sanctions) list)\b/i.test(
			text,
		)
	) {
		sanctionsAction = "designations";
	} else if (/\b(amend(?:ed|ment)|updated?|correction)\b/i.test(text)) {
		sanctionsAction = "amendment";
	} else {
		sanctionsAction = "list_update";
	}

	if (provider.includes("ofac") && !targetTags.includes("us")) targetTags.push("us");
	if (provider.includes("uk_sanctions") && !targetTags.includes("uk")) targetTags.push("uk");
	if (provider.includes("un") && !targetTags.includes("un")) targetTags.push("un");

	return { documentType, sanctionsAction, targetTags };
}

function inferOfficialSourceSemanticHints(provider: string, text: string): HardSignalSemanticHints {
	const normalized = provider.toLowerCase();
	if (normalized.includes("federal_reserve") || normalized.includes("ecb")) {
		return inferRateSemanticHints(normalized, text);
	}
	if (
		normalized.includes("ofac") ||
		normalized.includes("uk_sanctions") ||
		normalized.includes("un")
	) {
		return inferSanctionsSemanticHints(normalized, text);
	}
	return { targetTags: [] };
}

function buildRatesDeltaHeadline(
	providerName: string,
	isFed: boolean,
	isEcb: boolean,
	hints: HardSignalSemanticHints,
): string {
	const providerLabel = isFed ? "FOMC" : isEcb ? "ECB" : `Central bank (${providerName})`;
	if (hints.rateAction === "hold")
		return `${providerLabel} policy signal delta detected (hold/unchanged)`;
	if (hints.rateAction && hints.basisPoints) {
		return `${providerLabel} policy signal delta detected (${hints.rateAction} ${hints.basisPoints}bp)`;
	}
	if (hints.documentType)
		return `${providerLabel} ${hints.documentType.replaceAll("_", " ")} delta detected`;
	return `${providerLabel} official source delta detected`;
}

function buildSanctionsDeltaHeadline(
	providerName: string,
	isOfac: boolean,
	isUn: boolean,
	isUk: boolean,
	hints: HardSignalSemanticHints,
): string {
	const providerLabel = isOfac ? "OFAC" : isUn ? "UN" : isUk ? "UK sanctions" : providerName;
	const actionLabel =
		hints.sanctionsAction === "general_license"
			? "general license"
			: hints.sanctionsAction === "designations"
				? "designations"
				: hints.sanctionsAction === "delistings"
					? "delistings"
					: hints.sanctionsAction === "amendment"
						? "amendment"
						: "list update";
	const targets = hints.targetTags.length > 0 ? ` · ${hints.targetTags.slice(0, 2).join("/")}` : "";
	return `${providerLabel} sanctions delta detected (${actionLabel})${targets}`;
}

async function fetchOfficialSource(
	source: FetchedSource,
): Promise<{ success?: FetchedOfficialSourceSuccess; error?: string }> {
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
		const etag = response.headers.get("etag") ?? undefined;
		const lastModified = response.headers.get("last-modified") ?? undefined;
		const keywordHints = getProviderKeywordHints(source.provider, text);
		const semanticHints = inferOfficialSourceSemanticHints(source.provider, text);

		return {
			success: {
				sourceRef: buildSourceRef({
					provider: source.provider,
					url: source.url,
					title: source.title,
					sourceTier: source.sourceTier,
					reliability: source.reliability,
					publishedAt,
				}),
				snapshot: {
					provider: source.provider,
					url: source.url,
					contentHash: computeHardSignalContentHash(text),
					etag,
					lastModified,
					publishedAt,
				},
				keywordTags: keywordHints.tags,
				keywordHitCount: keywordHints.hitCount,
				semanticHints,
			},
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
	const fetchedSuccesses = fetched
		.map((entry) => entry.success)
		.filter((entry): entry is FetchedOfficialSourceSuccess => Boolean(entry));
	const sourceRefs = fetchedSuccesses.map((entry) => entry.sourceRef);
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

	const deltaDecisions = await evaluateAndPersistHardSignalSourceDeltas(
		fetchedSuccesses.map((entry) => entry.snapshot),
	);
	const changedSources = fetchedSuccesses.filter((entry) => {
		const decision = deltaDecisions.get(getHardSignalSourceDeltaKey(entry.snapshot));
		return decision?.changed;
	});
	if (changedSources.length === 0) {
		return {
			provider: "rates",
			ok: true,
			message:
				errors.length > 0
					? `no delta detected (partial source failures: ${errors.join(" | ")})`
					: "no delta detected for official central-bank sources",
			candidates: [],
		};
	}

	const candidates: GeoCandidate[] = [];
	for (const entry of changedSources) {
		if (budget && !budget.reserveCandidate()) break;
		const deltaReason =
			deltaDecisions.get(getHardSignalSourceDeltaKey(entry.snapshot))?.reason ??
			"content_hash_changed";
		const provider = entry.sourceRef.provider.toLowerCase();
		const isFed = provider.includes("federal_reserve");
		const isEcb = provider.includes("ecb");
		candidates.push(
			createCandidate({
				triggerType: "hard_signal",
				headline: buildRatesDeltaHeadline(
					entry.sourceRef.provider,
					isFed,
					isEcb,
					entry.semanticHints,
				),
				severityHint:
					entry.semanticHints.rateAction === "hike" || entry.semanticHints.rateAction === "cut"
						? (entry.semanticHints.basisPoints ?? 0) >= 50
							? 3
							: 2
						: 2,
				regionHint:
					isEcb || entry.semanticHints.targetTags.includes("eurozone") ? "europe" : "global",
				sourceRefs: [entry.sourceRef],
				symbol: "percent",
				category: isFed
					? "monetary_policy_fomc_delta"
					: isEcb
						? "monetary_policy_ecb_delta"
						: "monetary_policy_rates",
				reviewExtra: {
					delta: deltaReason,
					keywordHits: entry.keywordHitCount,
					keywords: entry.keywordTags.join(","),
					docType: entry.semanticHints.documentType,
					rateAction: entry.semanticHints.rateAction,
					bps: entry.semanticHints.basisPoints,
					targets: entry.semanticHints.targetTags.join(","),
				},
			}),
		);
	}

	return {
		provider: "rates",
		ok: true,
		message:
			errors.length > 0
				? `delta detected in ${changedSources.length}/${sourceRefs.length} source(s); partial source failures: ${errors.join(" | ")}`
				: candidates.length === 0
					? "candidate budget exhausted"
					: `delta detected in ${changedSources.length}/${sourceRefs.length} source(s)`,
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
	const fetchedSuccesses = fetched
		.map((entry) => entry.success)
		.filter((entry): entry is FetchedOfficialSourceSuccess => Boolean(entry));
	const sourceRefs = fetchedSuccesses.map((entry) => entry.sourceRef);
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

	const deltaDecisions = await evaluateAndPersistHardSignalSourceDeltas(
		fetchedSuccesses.map((entry) => entry.snapshot),
	);
	const changedSources = fetchedSuccesses.filter((entry) => {
		const decision = deltaDecisions.get(getHardSignalSourceDeltaKey(entry.snapshot));
		return decision?.changed;
	});
	if (changedSources.length === 0) {
		return {
			provider: "sanctions",
			ok: true,
			message:
				errors.length > 0
					? `no delta detected (partial source failures: ${errors.join(" | ")})`
					: "no delta detected for official sanctions sources",
			candidates: [],
		};
	}

	const candidates: GeoCandidate[] = [];
	for (const entry of changedSources) {
		if (budget && !budget.reserveCandidate()) break;
		const deltaReason =
			deltaDecisions.get(getHardSignalSourceDeltaKey(entry.snapshot))?.reason ??
			"content_hash_changed";
		const provider = entry.sourceRef.provider.toLowerCase();
		const isOfac = provider.includes("ofac");
		const isUn = provider.includes("un");
		const isUk = provider.includes("uk");
		candidates.push(
			createCandidate({
				triggerType: "hard_signal",
				headline: buildSanctionsDeltaHeadline(
					entry.sourceRef.provider,
					isOfac,
					isUn,
					isUk,
					entry.semanticHints,
				),
				severityHint:
					entry.semanticHints.sanctionsAction === "designations" ||
					entry.semanticHints.sanctionsAction === "general_license"
						? 3
						: isOfac || isUn
							? 3
							: 2,
				regionHint: "global",
				sourceRefs: [entry.sourceRef],
				symbol: "gavel",
				category: isOfac
					? "sanctions_ofac_delta"
					: isUn
						? "sanctions_un_delta"
						: isUk
							? "sanctions_uk_delta"
							: "sanctions_export_controls",
				reviewExtra: {
					delta: deltaReason,
					keywordHits: entry.keywordHitCount,
					keywords: entry.keywordTags.join(","),
					docType: entry.semanticHints.documentType,
					sanctionsAction: entry.semanticHints.sanctionsAction,
					targets: entry.semanticHints.targetTags.join(","),
				},
			}),
		);
	}

	return {
		provider: "sanctions",
		ok: true,
		message:
			errors.length > 0
				? `delta detected in ${changedSources.length}/${sourceRefs.length} source(s); partial source failures: ${errors.join(" | ")}`
				: candidates.length === 0
					? "candidate budget exhausted"
					: `delta detected in ${changedSources.length}/${sourceRefs.length} source(s)`,
		candidates,
	};
}

async function ingestAcledThresholdSignals(
	budget?: GeopoliticalIngestionBudget,
	context?: HardSignalAdapterContext,
): Promise<HardSignalAdapterResult> {
	if (process.env.ENABLE_ACLED_THRESHOLD_INGEST === "false") {
		return {
			provider: "acled_threshold",
			ok: false,
			message: "ingest disabled for acled_threshold",
			candidates: [],
		};
	}

	if (budget && !budget.reserveProviderCall("acled_threshold")) {
		return {
			provider: "acled_threshold",
			ok: false,
			message: "provider-call budget exhausted",
			candidates: [],
		};
	}

	try {
		const lookbackDays = clampInt(Number(process.env.ACLED_THRESHOLD_LOOKBACK_DAYS), 1, 30, 3);
		const pageSize = clampInt(Number(process.env.ACLED_THRESHOLD_PAGE_SIZE), 20, 200, 120);
		const severityThreshold = clampInt(Number(process.env.ACLED_THRESHOLD_MIN_SEVERITY), 3, 5, 4);
		const eventCountThreshold = clampInt(
			Number(process.env.ACLED_THRESHOLD_EVENT_COUNT),
			1,
			500,
			3,
		);
		const fatalityThreshold = clampInt(
			Number(process.env.ACLED_THRESHOLD_FATALITIES),
			0,
			100_000,
			25,
		);

		const result = await fetchAcledEventsViaGateway({
			from: daysAgoIsoDate(lookbackDays),
			page: 1,
			pageSize,
			requestId: context?.requestId,
			userRole: context?.userRole,
		});

		const severeEvents = result.events.filter(
			(event) => Number(event.severity) >= severityThreshold,
		);
		const totalFatalities = severeEvents.reduce(
			(sum, event) => sum + Number(event.externalFatalities || 0),
			0,
		);

		if (severeEvents.length < eventCountThreshold && totalFatalities < fatalityThreshold) {
			return {
				provider: "acled_threshold",
				ok: true,
				message: `threshold not met (events=${severeEvents.length}/${eventCountThreshold}, fatalities=${totalFatalities}/${fatalityThreshold})`,
				candidates: [],
			};
		}

		const sortedBySeverity = [...severeEvents].sort(
			(a, b) =>
				Number(b.severity) - Number(a.severity) ||
				Number(b.externalFatalities || 0) - Number(a.externalFatalities || 0),
		);
		const topEvents = sortedBySeverity.slice(0, 5);
		const sourceRefs = topEvents
			.flatMap((event) => event.sources ?? [])
			.filter((source, index, arr) => arr.findIndex((item) => item.url === source.url) === index)
			.slice(0, 6);

		if (sourceRefs.length === 0) {
			sourceRefs.push(
				buildSourceRef({
					provider: "acled",
					url: "https://acleddata.com/dashboard/#/dashboard",
					title: "ACLED Dashboard",
					sourceTier: "A",
					reliability: 0.8,
				}),
			);
		}

		const regionCounts = new Map<string, number>();
		for (const event of severeEvents) {
			for (const regionId of event.regionIds ?? []) {
				regionCounts.set(regionId, (regionCounts.get(regionId) ?? 0) + 1);
			}
		}
		const primaryRegion =
			[...regionCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "global";

		const candidates: GeoCandidate[] = [];
		if (!budget || budget.reserveCandidate()) {
			candidates.push(
				createCandidate({
					triggerType: "hard_signal",
					headline: `ACLED escalation threshold met (${severeEvents.length} events, ${totalFatalities} fatalities, ${lookbackDays}d)`,
					severityHint: totalFatalities >= fatalityThreshold * 2 ? 5 : 4,
					regionHint: primaryRegion,
					countryHints: topEvents.flatMap((event) => event.countryCodes ?? []).slice(0, 8),
					sourceRefs,
					symbol: "shield-alert",
					category: "conflict_escalation_acled_threshold",
				}),
			);
		}

		return {
			provider: "acled_threshold",
			ok: true,
			message:
				candidates.length === 0
					? "candidate budget exhausted"
					: `threshold met (events=${severeEvents.length}, fatalities=${totalFatalities}, lookback=${lookbackDays}d)`,
			candidates,
		};
	} catch (error) {
		return {
			provider: "acled_threshold",
			ok: false,
			message: error instanceof Error ? error.message : "acled threshold ingest failed",
			candidates: [],
		};
	}
}

export async function runHardSignalAdapters(
	budget?: GeopoliticalIngestionBudget,
	context?: HardSignalAdapterContext,
): Promise<HardSignalAdapterResult[]> {
	const tasks: Array<Promise<HardSignalAdapterResult>> = [
		ingestRatesSignals(budget),
		ingestSanctionsSignals(budget),
		ingestAcledThresholdSignals(budget, context),
	];
	return Promise.all(tasks);
}
