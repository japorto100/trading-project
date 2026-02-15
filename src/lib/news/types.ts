export type NewsProviderId = "newsdata" | "newsapi_ai" | "gnews" | "webz" | "reddit";

export interface MarketNewsArticle {
	id: string;
	provider: NewsProviderId;
	source: string;
	title: string;
	url: string;
	publishedAt: string;
	summary?: string;
	content?: string;
	imageUrl?: string;
	sentiment?: string;
}

export interface MarketNewsProviderStatus {
	provider: NewsProviderId;
	ok: boolean;
	count: number;
	message?: string;
}

export interface MarketNewsResponse {
	success: boolean;
	query: string;
	symbol?: string;
	fetchedAt: string;
	total: number;
	providers: MarketNewsProviderStatus[];
	articles: MarketNewsArticle[];
}

export interface FetchMarketNewsOptions {
	symbol?: string;
	q?: string;
	limit?: number;
	lang?: string;
	forceRefresh?: boolean;
}
