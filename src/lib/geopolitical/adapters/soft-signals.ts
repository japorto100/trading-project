import { randomUUID } from "node:crypto";
import { scoreCandidateConfidence } from "@/lib/geopolitical/confidence";
import type { GeoCandidate, GeoSourceRef } from "@/lib/geopolitical/types";
import { fetchMarketNews } from "@/lib/news/aggregator";

export interface SoftSignalAdapter {
	id: string;
	description: string;
	enabledByDefault: boolean;
	run: () => Promise<GeoCandidate[]>;
}

interface SoftSignalArticle {
	title: string;
	url: string;
	publishedAt: string;
	source: string;
	summary?: string;
}

interface SoftSignalCandidatePayload {
	headline?: string;
	confidence?: number;
	severityHint?: number;
	regionHint?: string;
	countryHints?: string[];
	sourceRefs?: Array<{
		provider?: string;
		url?: string;
		title?: string;
		publishedAt?: string;
		sourceTier?: "A" | "B" | "C";
		reliability?: number;
	}>;
	symbol?: string;
	category?: string;
	hotspotIds?: string[];
}

interface SoftSignalResponse {
	candidates?: SoftSignalCandidatePayload[];
}

const DEFAULT_SOFT_SIGNAL_BASE_URL = "http://127.0.0.1:8091";
const DEFAULT_SOFT_SIGNAL_TIMEOUT_MS = 8000;

function isSoftSignalEnabled(): boolean {
	const raw = process.env.GEOPOLITICAL_SOFT_SIGNAL_ENABLED;
	if (!raw) return false;
	const normalized = raw.trim().toLowerCase();
	return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}

function getSoftSignalBaseUrl(): string {
	const raw = process.env.GEOPOLITICAL_SOFT_SIGNAL_URL?.trim();
	if (!raw) return DEFAULT_SOFT_SIGNAL_BASE_URL;
	return raw.replace(/\/$/, "");
}

function getSoftSignalTimeoutMs(): number {
	const parsed = Number(process.env.GEOPOLITICAL_SOFT_SIGNAL_TIMEOUT_MS);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_SOFT_SIGNAL_TIMEOUT_MS;
}

function sanitizeTier(value: unknown): "A" | "B" | "C" {
	return value === "A" || value === "B" || value === "C" ? value : "C";
}

function sanitizeReliability(value: unknown, fallback = 0.68): number {
	const parsed = Number(value);
	if (!Number.isFinite(parsed)) return fallback;
	return Math.min(1, Math.max(0, parsed));
}

function normalizeSourceRef(input: {
	provider?: string;
	url?: string;
	title?: string;
	publishedAt?: string;
	sourceTier?: "A" | "B" | "C";
	reliability?: number;
}): GeoSourceRef | null {
	if (!input.provider || !input.url) return null;
	try {
		const url = new URL(input.url);
		if (url.protocol !== "http:" && url.protocol !== "https:") {
			return null;
		}
		return {
			id: `gs_${randomUUID()}`,
			provider: input.provider,
			url: url.toString(),
			title: input.title,
			publishedAt: input.publishedAt,
			fetchedAt: new Date().toISOString(),
			sourceTier: sanitizeTier(input.sourceTier),
			reliability: sanitizeReliability(input.reliability),
		};
	} catch {
		return null;
	}
}

function buildFallbackSourceRef(adapterId: string, article: SoftSignalArticle): GeoSourceRef {
	return {
		id: `gs_${randomUUID()}`,
		provider: `${adapterId}:${article.source}`,
		url: article.url,
		title: article.title,
		publishedAt: article.publishedAt,
		fetchedAt: new Date().toISOString(),
		sourceTier: "C",
		reliability: 0.55,
	};
}

function toSoftCandidate(
	adapterId: string,
	payload: SoftSignalCandidatePayload,
	fallbackArticle: SoftSignalArticle,
): GeoCandidate | null {
	const headline = payload.headline?.trim() || fallbackArticle.title?.trim();
	if (!headline) {
		return null;
	}

	const sourceRefsFromPayload = Array.isArray(payload.sourceRefs)
		? payload.sourceRefs
				.map((entry) =>
					normalizeSourceRef({
						provider: entry.provider,
						url: entry.url,
						title: entry.title,
						publishedAt: entry.publishedAt,
						sourceTier: entry.sourceTier,
						reliability: entry.reliability,
					}),
				)
				.filter((entry): entry is GeoSourceRef => Boolean(entry))
		: [];

	const sourceRefs =
		sourceRefsFromPayload.length > 0
			? sourceRefsFromPayload
			: [buildFallbackSourceRef(adapterId, fallbackArticle)];

	const severityHint = Number(payload.severityHint);
	const boundedSeverity =
		Number.isInteger(severityHint) && severityHint >= 1 && severityHint <= 5
			? (severityHint as GeoCandidate["severityHint"])
			: 2;

	const candidateBase: GeoCandidate = {
		id: `gc_${randomUUID()}`,
		generatedAt: new Date().toISOString(),
		triggerType: "news_cluster",
		confidence: Number(payload.confidence) || 0,
		severityHint: boundedSeverity,
		headline,
		regionHint: payload.regionHint ?? "global",
		countryHints: Array.isArray(payload.countryHints)
			? payload.countryHints.filter((entry): entry is string => typeof entry === "string")
			: undefined,
		sourceRefs,
		state: "open",
		symbol: payload.symbol,
		category: payload.category,
		hotspotIds: Array.isArray(payload.hotspotIds)
			? payload.hotspotIds.filter((entry): entry is string => typeof entry === "string")
			: undefined,
	};

	const hintedConfidence = Number(payload.confidence);
	const boundedHint = Number.isFinite(hintedConfidence)
		? Math.min(1, Math.max(0, hintedConfidence))
		: undefined;

	return {
		...candidateBase,
		confidence:
			boundedHint !== undefined
				? Math.max(boundedHint, scoreCandidateConfidence(candidateBase))
				: scoreCandidateConfidence(candidateBase),
	};
}

async function fetchSoftSignalArticles(query: string, limit: number): Promise<SoftSignalArticle[]> {
	const news = await fetchMarketNews({
		q: query,
		limit,
		forceRefresh: true,
	});

	return news.articles.map((article) => ({
		title: article.title,
		url: article.url,
		publishedAt: article.publishedAt,
		source: article.source,
		summary: article.summary,
	}));
}

async function callSoftSignalService(
	path: string,
	articles: SoftSignalArticle[],
	adapterId: string,
): Promise<GeoCandidate[]> {
	if (articles.length === 0) {
		return [];
	}

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), getSoftSignalTimeoutMs());

	try {
		const response = await fetch(`${getSoftSignalBaseUrl()}${path}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify({
				adapterId,
				generatedAt: new Date().toISOString(),
				articles,
				maxCandidates: Number(process.env.GEOPOLITICAL_SOFT_SIGNAL_MAX_CANDIDATES) || 6,
			}),
			signal: controller.signal,
			cache: "no-store",
		});

		if (!response.ok) {
			return [];
		}

		const payload = (await response.json()) as SoftSignalResponse;
		const rawCandidates = Array.isArray(payload.candidates) ? payload.candidates : [];
		const result: GeoCandidate[] = [];
		for (let i = 0; i < rawCandidates.length; i++) {
			const candidate = toSoftCandidate(
				adapterId,
				rawCandidates[i],
				articles[Math.min(i, articles.length - 1)],
			);
			if (candidate) {
				result.push(candidate);
			}
		}
		return result;
	} catch {
		return [];
	} finally {
		clearTimeout(timeout);
	}
}

async function runNewsClusterAdapter(): Promise<GeoCandidate[]> {
	if (!isSoftSignalEnabled()) return [];
	const articles = await fetchSoftSignalArticles(
		"geopolitics sanctions central bank conflict ceasefire election",
		30,
	);
	return callSoftSignalService("/api/v1/cluster-headlines", articles, "news_cluster");
}

async function runSocialSurgeAdapter(): Promise<GeoCandidate[]> {
	if (!isSoftSignalEnabled()) return [];
	const articles = await fetchSoftSignalArticles(
		"reddit OR social media OR x.com geopolitics sanctions narrative",
		30,
	);
	return callSoftSignalService("/api/v1/social-surge", articles, "social_surge");
}

async function runNarrativeShiftAdapter(): Promise<GeoCandidate[]> {
	if (!isSoftSignalEnabled()) return [];
	const articles = await fetchSoftSignalArticles(
		"narrative shift policy escalation sanctions rhetoric central bank messaging",
		36,
	);
	return callSoftSignalService("/api/v1/narrative-shift", articles, "narrative_shift");
}

export const SOFT_SIGNAL_ADAPTERS: SoftSignalAdapter[] = [
	{
		id: "news_cluster",
		description: "Cluster cross-provider headlines into candidate events",
		enabledByDefault: false,
		run: runNewsClusterAdapter,
	},
	{
		id: "social_surge",
		description: "Detect social chatter surges for monitored regions/categories",
		enabledByDefault: false,
		run: runSocialSurgeAdapter,
	},
	{
		id: "narrative_shift",
		description: "Identify multi-day narrative drift around geopolitical themes",
		enabledByDefault: false,
		run: runNarrativeShiftAdapter,
	},
];
