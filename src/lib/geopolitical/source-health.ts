import { SOFT_SIGNAL_ADAPTERS } from "@/lib/geopolitical/adapters/soft-signals";

export interface GeoSourceHealthEntry {
	id: string;
	label: string;
	tier: "A" | "B" | "C";
	type: "hard_signal" | "soft_signal" | "news";
	ok: boolean;
	enabled: boolean;
	message?: string;
}

function hasKey(key: string): boolean {
	return Boolean(process.env[key] && process.env[key]!.trim().length > 0);
}

export function getGeopoliticalSourceHealth(): GeoSourceHealthEntry[] {
	const entries: GeoSourceHealthEntry[] = [
		{
			id: "ofac",
			label: "OFAC Sanctions List Service",
			tier: "A",
			type: "hard_signal",
			ok: true,
			enabled: process.env.ENABLE_OFAC_INGEST !== "false",
			message: "Official US sanctions source configured",
		},
		{
			id: "uk_sanctions",
			label: "UK Sanctions List",
			tier: "A",
			type: "hard_signal",
			ok: true,
			enabled: process.env.ENABLE_UK_SANCTIONS_INGEST !== "false",
			message: "Official UK sanctions source configured",
		},
		{
			id: "un_sanctions",
			label: "UN Consolidated Sanctions List",
			tier: "A",
			type: "hard_signal",
			ok: true,
			enabled: process.env.ENABLE_UN_SANCTIONS_INGEST !== "false",
			message: "Official UN sanctions source configured",
		},
		{
			id: "central_bank_calendars",
			label: "Central Bank Calendars (Fed/BoE/BoJ)",
			tier: "A",
			type: "hard_signal",
			ok: true,
			enabled: process.env.ENABLE_CENTRAL_BANK_CALENDAR_INGEST !== "false",
			message: "Calendar ingestion enabled",
		},
		{
			id: "newsdata",
			label: "NewsData.io",
			tier: "B",
			type: "news",
			ok: hasKey("NEWSDATA_API_KEY"),
			enabled: true,
			message: hasKey("NEWSDATA_API_KEY") ? "API key set" : "Missing NEWSDATA_API_KEY",
		},
		{
			id: "newsapi_ai",
			label: "NewsAPI.ai",
			tier: "B",
			type: "news",
			ok: hasKey("NEWSAPIAI_API_KEY"),
			enabled: true,
			message: hasKey("NEWSAPIAI_API_KEY") ? "API key set" : "Missing NEWSAPIAI_API_KEY",
		},
		{
			id: "gnews",
			label: "GNews",
			tier: "B",
			type: "news",
			ok: hasKey("GNEWS_API_KEY"),
			enabled: true,
			message: hasKey("GNEWS_API_KEY") ? "API key set" : "Missing GNEWS_API_KEY",
		},
		{
			id: "webz",
			label: "Webz.io",
			tier: "B",
			type: "news",
			ok: hasKey("WEBZ_API_KEY"),
			enabled: true,
			message: hasKey("WEBZ_API_KEY") ? "API key set" : "Missing WEBZ_API_KEY",
		},
	];

	for (const adapter of SOFT_SIGNAL_ADAPTERS) {
		entries.push({
			id: adapter.id,
			label: `Soft Adapter: ${adapter.id}`,
			tier: "C",
			type: "soft_signal",
			ok: true,
			enabled: adapter.enabledByDefault,
			message: adapter.description,
		});
	}

	return entries;
}
