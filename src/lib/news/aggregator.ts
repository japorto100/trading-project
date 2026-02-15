import { resolveFusionSymbol } from "@/lib/fusion-symbols";
import type {
	FetchMarketNewsOptions,
	MarketNewsArticle,
	MarketNewsProviderStatus,
	MarketNewsResponse,
	NewsProviderId,
} from "@/lib/news/types";

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 60;
const DEFAULT_TIMEOUT_MS = 7000;
const DEFAULT_CACHE_TTL_MS = 120_000;

const memoryCache = new Map<string, { expiresAt: number; value: MarketNewsResponse }>();

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

function getTimeoutMs(): number {
	const parsed = Number(process.env.NEWS_FETCH_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIMEOUT_MS;
}

function getCacheTtlMs(): number {
	const parsed = Number(process.env.NEWS_CACHE_TTL_MS || DEFAULT_CACHE_TTL_MS);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_CACHE_TTL_MS;
}

function sanitizeText(value: unknown): string | undefined {
	if (typeof value !== "string") return undefined;
	const text = value.replace(/\s+/g, " ").trim();
	return text.length > 0 ? text : undefined;
}

function asRecord(value: unknown): Record<string, unknown> | null {
	return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

function asArray(value: unknown): unknown[] {
	return Array.isArray(value) ? value : [];
}

function getQuery(symbol?: string, q?: string): string {
	const direct = sanitizeText(q);
	if (direct) return direct;

	const rawSymbol = sanitizeText(symbol);
	if (!rawSymbol) return "stock market OR equities OR crypto";

	const resolved = resolveFusionSymbol(rawSymbol);
	if (!resolved) return rawSymbol.replace("/", " ");

	return `${resolved.symbol.replace("/", " ")} ${resolved.name}`;
}

function articleKey(article: MarketNewsArticle): string {
	return `${article.url}|${article.title}`.toLowerCase();
}

async function fetchJsonWithTimeout(
	url: string,
	init: RequestInit = {},
	timeoutMs: number = getTimeoutMs(),
): Promise<unknown> {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);
	try {
		const response = await fetch(url, {
			...init,
			signal: controller.signal,
			headers: {
				Accept: "application/json",
				...(init.headers || {}),
			},
			cache: "no-store",
		});
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}
		return await response.json();
	} finally {
		clearTimeout(timer);
	}
}

async function fetchNewsData(
	query: string,
	limit: number,
	lang: string,
): Promise<{ status: MarketNewsProviderStatus; articles: MarketNewsArticle[] }> {
	const apiKey = process.env.NEWSDATA_API_KEY;
	if (!apiKey) {
		return {
			status: {
				provider: "newsdata",
				ok: false,
				count: 0,
				message: "missing NEWSDATA_API_KEY",
			},
			articles: [],
		};
	}

	try {
		const url = new URL("https://newsdata.io/api/1/latest");
		url.searchParams.set("apikey", apiKey);
		url.searchParams.set("q", query);
		url.searchParams.set("language", lang);
		url.searchParams.set("size", String(limit));

		const data = await fetchJsonWithTimeout(url.toString());
		const rows = asArray(asRecord(data)?.results);
		const articles: MarketNewsArticle[] = rows
			.map((row, index: number): MarketNewsArticle | null => {
				const rowRecord = asRecord(row);
				const title = sanitizeText(rowRecord?.title);
				const articleUrl = sanitizeText(rowRecord?.link);
				if (!title || !articleUrl) return null;
				return {
					id: sanitizeText(rowRecord?.article_id) || `newsdata-${index}-${articleUrl}`,
					provider: "newsdata" as const,
					source: sanitizeText(rowRecord?.source_id) || "NewsData.io",
					title,
					url: articleUrl,
					publishedAt: sanitizeText(rowRecord?.pubDate) || new Date().toISOString(),
					summary: sanitizeText(rowRecord?.description),
					content: sanitizeText(rowRecord?.content),
					imageUrl: sanitizeText(rowRecord?.image_url),
					sentiment: sanitizeText(rowRecord?.sentiment),
				};
			})
			.filter((item: MarketNewsArticle | null): item is MarketNewsArticle => Boolean(item));

		return {
			status: { provider: "newsdata", ok: true, count: articles.length },
			articles,
		};
	} catch (error) {
		return {
			status: {
				provider: "newsdata",
				ok: false,
				count: 0,
				message: error instanceof Error ? error.message : "unknown error",
			},
			articles: [],
		};
	}
}

async function fetchGnews(
	query: string,
	limit: number,
	lang: string,
): Promise<{ status: MarketNewsProviderStatus; articles: MarketNewsArticle[] }> {
	const apiKey = process.env.GNEWS_API_KEY;
	if (!apiKey) {
		return {
			status: {
				provider: "gnews",
				ok: false,
				count: 0,
				message: "missing GNEWS_API_KEY",
			},
			articles: [],
		};
	}

	try {
		const url = new URL("https://gnews.io/api/v4/search");
		url.searchParams.set("q", query);
		url.searchParams.set("lang", lang);
		url.searchParams.set("max", String(limit));
		url.searchParams.set("token", apiKey);

		const data = await fetchJsonWithTimeout(url.toString());
		const rows = asArray(asRecord(data)?.articles);
		const articles: MarketNewsArticle[] = rows
			.map((row, index: number): MarketNewsArticle | null => {
				const rowRecord = asRecord(row);
				const title = sanitizeText(rowRecord?.title);
				const articleUrl = sanitizeText(rowRecord?.url);
				if (!title || !articleUrl) return null;
				const sourceRecord = asRecord(rowRecord?.source);
				return {
					id: `gnews-${index}-${articleUrl}`,
					provider: "gnews" as const,
					source: sanitizeText(sourceRecord?.name) || "GNews",
					title,
					url: articleUrl,
					publishedAt: sanitizeText(rowRecord?.publishedAt) || new Date().toISOString(),
					summary: sanitizeText(rowRecord?.description),
					content: sanitizeText(rowRecord?.content),
					imageUrl: sanitizeText(rowRecord?.image),
				};
			})
			.filter((item: MarketNewsArticle | null): item is MarketNewsArticle => Boolean(item));

		return {
			status: { provider: "gnews", ok: true, count: articles.length },
			articles,
		};
	} catch (error) {
		return {
			status: {
				provider: "gnews",
				ok: false,
				count: 0,
				message: error instanceof Error ? error.message : "unknown error",
			},
			articles: [],
		};
	}
}

async function fetchNewsApiAi(
	query: string,
	limit: number,
): Promise<{ status: MarketNewsProviderStatus; articles: MarketNewsArticle[] }> {
	const apiKey = process.env.NEWSAPIAI_API_KEY;
	if (!apiKey) {
		return {
			status: {
				provider: "newsapi_ai",
				ok: false,
				count: 0,
				message: "missing NEWSAPIAI_API_KEY",
			},
			articles: [],
		};
	}

	try {
		const payload = {
			apiKey,
			keyword: query,
			keywordOper: "or",
			lang: "eng",
			articlesSortBy: "date",
			articlesCount: limit,
			resultType: "articles",
			includeArticleImage: true,
		};

		const data = await fetchJsonWithTimeout(
			"https://eventregistry.org/api/v1/article/getArticles",
			{
				method: "POST",
				body: JSON.stringify(payload),
				headers: {
					"Content-Type": "application/json",
				},
			},
		);

		const rows = asArray(asRecord(asRecord(data)?.articles)?.results);
		const articles: MarketNewsArticle[] = rows
			.map((row, index: number): MarketNewsArticle | null => {
				const rowRecord = asRecord(row);
				const title = sanitizeText(rowRecord?.title);
				const articleUrl = sanitizeText(rowRecord?.url);
				if (!title || !articleUrl) return null;
				const sourceRecord = asRecord(rowRecord?.source);
				return {
					id: sanitizeText(rowRecord?.uri) || `newsapi-ai-${index}-${articleUrl}`,
					provider: "newsapi_ai" as const,
					source: sanitizeText(sourceRecord?.title) || "NewsAPI.ai",
					title,
					url: articleUrl,
					publishedAt: sanitizeText(rowRecord?.dateTimePub) || new Date().toISOString(),
					summary: sanitizeText(rowRecord?.body),
					imageUrl: sanitizeText(rowRecord?.image),
				};
			})
			.filter((item: MarketNewsArticle | null): item is MarketNewsArticle => Boolean(item));

		return {
			status: { provider: "newsapi_ai", ok: true, count: articles.length },
			articles,
		};
	} catch (error) {
		return {
			status: {
				provider: "newsapi_ai",
				ok: false,
				count: 0,
				message: error instanceof Error ? error.message : "unknown error",
			},
			articles: [],
		};
	}
}

async function fetchWebz(
	query: string,
	limit: number,
): Promise<{ status: MarketNewsProviderStatus; articles: MarketNewsArticle[] }> {
	const apiKey = process.env.WEBZ_API_KEY;
	if (!apiKey) {
		return {
			status: {
				provider: "webz",
				ok: false,
				count: 0,
				message: "missing WEBZ_API_KEY",
			},
			articles: [],
		};
	}

	try {
		const baseUrl = process.env.WEBZ_API_BASE_URL || "https://api.webz.io/newsApiLite";
		const url = new URL(baseUrl);
		url.searchParams.set("token", apiKey);
		url.searchParams.set("q", query);
		url.searchParams.set("size", String(limit));
		url.searchParams.set("sort", "relevancy");
		url.searchParams.set("format", "json");

		const data = await fetchJsonWithTimeout(url.toString());
		const rows = asArray(asRecord(data)?.posts);
		const articles: MarketNewsArticle[] = rows
			.map((row, index: number): MarketNewsArticle | null => {
				const rowRecord = asRecord(row);
				const title = sanitizeText(rowRecord?.title);
				const articleUrl = sanitizeText(rowRecord?.url);
				if (!title || !articleUrl) return null;
				const threadRecord = asRecord(rowRecord?.thread);
				return {
					id: sanitizeText(rowRecord?.uuid) || `webz-${index}-${articleUrl}`,
					provider: "webz" as const,
					source:
						sanitizeText(threadRecord?.site_full) || sanitizeText(threadRecord?.site) || "Webz.io",
					title,
					url: articleUrl,
					publishedAt: sanitizeText(rowRecord?.published) || new Date().toISOString(),
					summary: sanitizeText(rowRecord?.text) || sanitizeText(rowRecord?.highlightText),
					content: sanitizeText(rowRecord?.text),
					imageUrl: sanitizeText(threadRecord?.main_image),
				};
			})
			.filter((item: MarketNewsArticle | null): item is MarketNewsArticle => Boolean(item));

		return {
			status: { provider: "webz", ok: true, count: articles.length },
			articles,
		};
	} catch (error) {
		return {
			status: {
				provider: "webz",
				ok: false,
				count: 0,
				message: error instanceof Error ? error.message : "unknown error",
			},
			articles: [],
		};
	}
}

async function fetchReddit(
	limit: number,
): Promise<{ status: MarketNewsProviderStatus; articles: MarketNewsArticle[] }> {
	try {
		const perSub = Math.max(5, Math.floor(limit / 2));
		const endpoints = [
			"https://www.reddit.com/r/StockMarket/new.json",
			"https://www.reddit.com/r/investing/new.json",
		];

		const responses = await Promise.all(
			endpoints.map((endpoint) =>
				fetchJsonWithTimeout(`${endpoint}?limit=${perSub}`, {
					headers: {
						"User-Agent": "tradeview-fusion/0.2",
					},
				}),
			),
		);

		const articles: MarketNewsArticle[] = responses.flatMap((payload) => {
			const payloadRecord = asRecord(payload);
			const children = asArray(asRecord(payloadRecord?.data)?.children);
			return children
				.map((child): MarketNewsArticle | null => {
					const row = asRecord(asRecord(child)?.data);
					const title = sanitizeText(row?.title);
					const permalink = sanitizeText(row?.permalink);
					if (!title || !permalink) return null;
					const articleUrl = permalink.startsWith("http")
						? permalink
						: `https://www.reddit.com${permalink}`;
					const publishedAt =
						typeof row?.created_utc === "number"
							? new Date(row.created_utc * 1000).toISOString()
							: new Date().toISOString();
					return {
						id: `reddit-${row?.id || articleUrl}`,
						provider: "reddit" as const,
						source: sanitizeText(row?.subreddit_name_prefixed) || "Reddit",
						title,
						url: articleUrl,
						publishedAt,
						summary: sanitizeText(row?.selftext),
						content: sanitizeText(row?.selftext),
					};
				})
				.filter((item: MarketNewsArticle | null): item is MarketNewsArticle => Boolean(item));
		});

		return {
			status: { provider: "reddit", ok: true, count: articles.length },
			articles,
		};
	} catch (error) {
		return {
			status: {
				provider: "reddit",
				ok: false,
				count: 0,
				message: error instanceof Error ? error.message : "unknown error",
			},
			articles: [],
		};
	}
}

function dedupeAndSort(items: MarketNewsArticle[], limit: number): MarketNewsArticle[] {
	const seen = new Set<string>();
	const unique: MarketNewsArticle[] = [];

	for (const item of items) {
		const key = articleKey(item);
		if (seen.has(key)) continue;
		seen.add(key);
		unique.push(item);
	}

	unique.sort((a, b) => {
		const at = new Date(a.publishedAt).getTime();
		const bt = new Date(b.publishedAt).getTime();
		return bt - at;
	});

	return unique.slice(0, limit);
}

function getProviderPriority(): NewsProviderId[] {
	const fallback: NewsProviderId[] = ["newsdata", "gnews", "newsapi_ai", "webz", "reddit"];
	const env = process.env.NEWS_PROVIDER_PRIORITY;
	if (!env) return fallback;
	const allowed = new Set<NewsProviderId>(fallback);
	const parsed = env
		.split(",")
		.map((entry) => entry.trim().toLowerCase())
		.filter((entry): entry is NewsProviderId => allowed.has(entry as NewsProviderId));
	return parsed.length > 0 ? parsed : fallback;
}

export async function fetchMarketNews(
	options: FetchMarketNewsOptions = {},
): Promise<MarketNewsResponse> {
	const rawLimit = Number(options.limit ?? process.env.NEWS_DEFAULT_LIMIT ?? DEFAULT_LIMIT);
	const limit = clamp(Number.isFinite(rawLimit) ? rawLimit : DEFAULT_LIMIT, 1, MAX_LIMIT);
	const lang = sanitizeText(options.lang) || process.env.NEWS_DEFAULT_LANGUAGE || "en";
	const query = getQuery(options.symbol, options.q);

	const cacheKey = JSON.stringify({
		query,
		symbol: sanitizeText(options.symbol) || "",
		limit,
		lang,
	});
	const now = Date.now();
	const ttl = getCacheTtlMs();

	if (!options.forceRefresh) {
		const cached = memoryCache.get(cacheKey);
		if (cached && cached.expiresAt > now) {
			return cached.value;
		}
	}

	const providerPriority = getProviderPriority();
	const providerResults = await Promise.all(
		providerPriority.map(async (provider) => {
			if (provider === "newsdata") return fetchNewsData(query, limit, lang);
			if (provider === "gnews") return fetchGnews(query, limit, lang);
			if (provider === "newsapi_ai") return fetchNewsApiAi(query, limit);
			if (provider === "webz") return fetchWebz(query, limit);
			return fetchReddit(limit);
		}),
	);

	const providers = providerResults.map((item) => item.status);
	const merged = dedupeAndSort(
		providerResults.flatMap((item) => item.articles),
		limit,
	);

	const response: MarketNewsResponse = {
		success: true,
		query,
		symbol: sanitizeText(options.symbol),
		fetchedAt: new Date().toISOString(),
		total: merged.length,
		providers,
		articles: merged,
	};

	memoryCache.set(cacheKey, {
		expiresAt: now + ttl,
		value: response,
	});

	return response;
}
