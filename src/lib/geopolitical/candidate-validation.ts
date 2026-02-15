import type { GeoCandidate, GeoSourceRef } from "@/lib/geopolitical/types";

type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

function sanitizeString(value: unknown, maxLength = 300): string | undefined {
	if (typeof value !== "string") return undefined;
	const cleaned = value.trim();
	if (!cleaned) return undefined;
	return cleaned.slice(0, maxLength);
}

function sanitizeUrl(value: unknown): string | undefined {
	const raw = sanitizeString(value, 2048);
	if (!raw) return undefined;
	try {
		const url = new URL(raw);
		if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
		return url.toString();
	} catch {
		return undefined;
	}
}

function parseSourceRefs(value: unknown): GeoSourceRef[] {
	if (!Array.isArray(value)) return [];
	return value.reduce<GeoSourceRef[]>((accumulator, entry) => {
		const record = entry as Record<string, unknown>;
		const provider = sanitizeString(record.provider, 120);
		const url = sanitizeUrl(record.url);
		if (!provider || !url) return accumulator;
		const tierRaw = sanitizeString(record.sourceTier, 1);
		const sourceTier = tierRaw === "A" || tierRaw === "B" || tierRaw === "C" ? tierRaw : "C";
		const reliabilityRaw = Number(record.reliability);
		const reliability = Number.isFinite(reliabilityRaw)
			? Math.min(1, Math.max(0, reliabilityRaw))
			: 0.5;
		accumulator.push({
			id: sanitizeString(record.id, 100) ?? `gs_${Math.random().toString(36).slice(2)}`,
			provider,
			url,
			title: sanitizeString(record.title, 220),
			publishedAt: sanitizeString(record.publishedAt, 40),
			fetchedAt: sanitizeString(record.fetchedAt, 40) ?? new Date().toISOString(),
			sourceTier,
			reliability,
		});
		return accumulator;
	}, []);
}

export function parseCreateGeoCandidateInput(
	payload: unknown,
): ParseResult<Omit<GeoCandidate, "id" | "generatedAt" | "state">> {
	if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
		return { ok: false, error: "invalid request body" };
	}
	const body = payload as Record<string, unknown>;

	const triggerType = sanitizeString(body.triggerType, 40) as
		| GeoCandidate["triggerType"]
		| undefined;
	if (
		triggerType !== "hard_signal" &&
		triggerType !== "news_cluster" &&
		triggerType !== "manual_import"
	) {
		return { ok: false, error: "triggerType is invalid" };
	}

	const headline = sanitizeString(body.headline, 300);
	if (!headline || headline.length < 6) {
		return { ok: false, error: "headline is required and must be at least 6 characters" };
	}

	const severityHintRaw = Number(body.severityHint);
	const severityHint =
		Number.isInteger(severityHintRaw) && severityHintRaw >= 1 && severityHintRaw <= 5
			? (severityHintRaw as GeoCandidate["severityHint"])
			: 2;

	const confidenceRaw = Number(body.confidence);
	const confidence = Number.isFinite(confidenceRaw) ? Math.min(1, Math.max(0, confidenceRaw)) : 0.5;

	return {
		ok: true,
		value: {
			triggerType,
			confidence,
			severityHint,
			headline,
			regionHint: sanitizeString(body.regionHint, 120),
			countryHints: Array.isArray(body.countryHints)
				? body.countryHints
						.filter((entry): entry is string => typeof entry === "string")
						.map((entry) => entry.trim())
						.filter(Boolean)
				: undefined,
			sourceRefs: parseSourceRefs(body.sourceRefs),
			mergedIntoEventId: sanitizeString(body.mergedIntoEventId, 100),
			reviewNote: sanitizeString(body.reviewNote, 1000),
			symbol: sanitizeString(body.symbol, 50),
			category: sanitizeString(body.category, 80),
			hotspotIds: Array.isArray(body.hotspotIds)
				? body.hotspotIds
						.filter((entry): entry is string => typeof entry === "string")
						.map((entry) => entry.trim())
						.filter(Boolean)
				: undefined,
		},
	};
}
