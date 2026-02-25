"use client";

import { AlertTriangle, ExternalLink, Newspaper, RefreshCw, Search } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { NewsSource } from "@/lib/news/sources";
import type { MarketNewsArticle, MarketNewsProviderStatus } from "@/lib/news/types";

interface NewsPanelProps {
	symbol: string;
}

interface NewsApiResponse {
	success: boolean;
	articles?: MarketNewsArticle[];
	providers?: MarketNewsProviderStatus[];
	sources?: NewsSource[];
	fetchedAt?: string;
	error?: string;
}

type NewsProviderFilter = "all" | MarketNewsProviderStatus["provider"];
type NewsSentimentFilter = "all" | "positive" | "negative" | "neutral" | "unknown";

type NewsSortMode = "newest" | "source";

function formatDate(value: string): string {
	const ts = new Date(value);
	if (Number.isNaN(ts.getTime())) {
		return value;
	}
	return ts.toLocaleString();
}

function formatRelativeAge(value: string): string {
	const ts = new Date(value);
	if (Number.isNaN(ts.getTime())) return "n/a";
	const diffMs = Date.now() - ts.getTime();
	const diffMin = Math.max(0, Math.floor(diffMs / 60000));
	if (diffMin < 1) return "now";
	if (diffMin < 60) return `${diffMin}m`;
	const diffH = Math.floor(diffMin / 60);
	if (diffH < 24) return `${diffH}h`;
	const diffD = Math.floor(diffH / 24);
	return `${diffD}d`;
}

function truncateText(value: string | undefined, maxLen: number): string | undefined {
	if (!value) return undefined;
	if (value.length <= maxLen) return value;
	return `${value.slice(0, maxLen - 3)}...`;
}

function normalizeSentiment(sentiment: string | undefined): NewsSentimentFilter {
	const normalized = sentiment?.trim().toLowerCase();
	if (!normalized) return "unknown";
	if (normalized.includes("pos") || normalized.includes("bull") || normalized === "up")
		return "positive";
	if (normalized.includes("neg") || normalized.includes("bear") || normalized === "down")
		return "negative";
	if (normalized.includes("neu") || normalized.includes("mixed")) return "neutral";
	return "unknown";
}

function sentimentBadgeClass(sentiment: NewsSentimentFilter): string {
	switch (sentiment) {
		case "positive":
			return "border-emerald-500/40 text-emerald-500";
		case "negative":
			return "border-red-500/40 text-red-500";
		case "neutral":
			return "border-amber-500/40 text-amber-500";
		default:
			return "border-border text-muted-foreground";
	}
}

function providerBadgeClass(ok: boolean): string {
	return ok ? "border-emerald-500/40 text-emerald-500" : "border-amber-500/40 text-amber-500";
}

export function NewsPanel({ symbol }: NewsPanelProps) {
	const [articles, setArticles] = useState<MarketNewsArticle[]>([]);
	const [providers, setProviders] = useState<MarketNewsProviderStatus[]>([]);
	const [sources, setSources] = useState<NewsSource[]>([]);
	const [selectedArticle, setSelectedArticle] = useState<MarketNewsArticle | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [fetchedAt, setFetchedAt] = useState<string | null>(null);
	const [query, setQuery] = useState("");
	const [providerFilter, setProviderFilter] = useState<NewsProviderFilter>("all");
	const [sentimentFilter, setSentimentFilter] = useState<NewsSentimentFilter>("all");
	const [sortMode, setSortMode] = useState<NewsSortMode>("newest");

	const loadNews = useCallback(
		async (forceRefresh: boolean = false) => {
			setLoading(true);
			setError(null);
			let timeoutId: ReturnType<typeof setTimeout> | null = null;
			try {
				const params = new URLSearchParams({
					symbol,
					limit: "24",
				});
				if (forceRefresh) {
					params.set("refresh", "1");
				}
				const controller = new AbortController();
				timeoutId = setTimeout(() => controller.abort(), 8000);
				const response = await fetch(`/api/market/news?${params.toString()}`, {
					cache: "no-store",
					signal: controller.signal,
				});
				const payload = (await response.json()) as NewsApiResponse;
				if (!response.ok || !payload.success) {
					throw new Error(payload.error || `News request failed (${response.status})`);
				}

				setArticles(Array.isArray(payload.articles) ? payload.articles : []);
				setProviders(Array.isArray(payload.providers) ? payload.providers : []);
				setSources(Array.isArray(payload.sources) ? payload.sources : []);
				setFetchedAt(payload.fetchedAt ?? new Date().toISOString());
			} catch (requestError) {
				if (requestError instanceof DOMException && requestError.name === "AbortError") {
					setError("News request timed out. Try Refresh.");
				} else {
					setError(requestError instanceof Error ? requestError.message : "Unknown news error");
				}
			} finally {
				if (timeoutId) clearTimeout(timeoutId);
				setLoading(false);
			}
		},
		[symbol],
	);

	useEffect(() => {
		setSelectedArticle(null);
		setQuery("");
		setProviderFilter("all");
		setSentimentFilter("all");
		setSortMode("newest");
		void loadNews(false);
	}, [loadNews]);

	const providerSummary = useMemo(
		() =>
			providers.map((provider) => {
				const selected = providerFilter === provider.provider;
				return (
					<button
						key={provider.provider}
						type="button"
						onClick={() =>
							setProviderFilter((prev) => (prev === provider.provider ? "all" : provider.provider))
						}
						className={`rounded-full border px-2 py-1 text-[10px] transition-colors ${providerBadgeClass(provider.ok)} ${
							selected ? "bg-accent/30 ring-1 ring-border" : "bg-transparent hover:bg-accent/20"
						}`}
						title={provider.message || `${provider.provider}: ${provider.count}`}
					>
						{provider.provider}: {provider.count}
					</button>
				);
			}),
		[providerFilter, providers],
	);

	const articleStats = useMemo(() => {
		const sentimentCounts: Record<NewsSentimentFilter, number> = {
			all: 0,
			positive: 0,
			negative: 0,
			neutral: 0,
			unknown: 0,
		};
		for (const article of articles) {
			sentimentCounts[normalizeSentiment(article.sentiment)] += 1;
		}
		const healthyProviders = providers.filter((provider) => provider.ok).length;
		return {
			total: articles.length,
			healthyProviders,
			totalProviders: providers.length,
			sentimentCounts,
		};
	}, [articles, providers]);

	const filteredArticles = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();
		const rows = articles.filter((article) => {
			if (providerFilter !== "all" && article.provider !== providerFilter) return false;
			const normalizedSentiment = normalizeSentiment(article.sentiment);
			if (sentimentFilter !== "all" && normalizedSentiment !== sentimentFilter) return false;
			if (!normalizedQuery) return true;
			const haystack = [article.title, article.summary, article.source, article.provider]
				.filter(Boolean)
				.join(" ")
				.toLowerCase();
			return haystack.includes(normalizedQuery);
		});

		const sorted = [...rows];
		if (sortMode === "source") {
			sorted.sort((a, b) => {
				const sourceCmp = a.source.localeCompare(b.source);
				if (sourceCmp !== 0) return sourceCmp;
				return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
			});
			return sorted;
		}

		sorted.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
		return sorted;
	}, [articles, providerFilter, query, sentimentFilter, sortMode]);

	const hasSourceFallbacks = !loading && articles.length === 0 && sources.length > 0;
	const noMatches = !loading && articles.length > 0 && filteredArticles.length === 0;

	return (
		<div className="flex h-full flex-col bg-card/10">
			<div className="border-b border-border p-3">
				<div className="mb-2 flex items-start justify-between gap-2">
					<div>
						<p className="flex items-center gap-1.5 text-sm font-semibold">
							<Newspaper className="h-4 w-4 text-muted-foreground" />
							Live Market News
						</p>
						<p className="text-xs text-muted-foreground">
							Aggregated headlines and source health for {symbol}.
						</p>
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void loadNews(true)}
						disabled={loading}
						className="h-8 shrink-0"
					>
						<RefreshCw className={`mr-1 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
						Refresh
					</Button>
				</div>

				<div className="mb-2 grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4">
					<div className="rounded-md border border-border bg-card/30 px-2 py-1.5">
						<div className="text-muted-foreground">Articles</div>
						<div className="font-medium">{articleStats.total}</div>
					</div>
					<div className="rounded-md border border-border bg-card/30 px-2 py-1.5">
						<div className="text-muted-foreground">Visible</div>
						<div className="font-medium">{filteredArticles.length}</div>
					</div>
					<div className="rounded-md border border-border bg-card/30 px-2 py-1.5">
						<div className="text-muted-foreground">Providers</div>
						<div className="font-medium">
							{articleStats.healthyProviders}/{articleStats.totalProviders}
						</div>
					</div>
					<div className="rounded-md border border-border bg-card/30 px-2 py-1.5">
						<div className="text-muted-foreground">Fetched</div>
						<div className="font-medium">{fetchedAt ? formatRelativeAge(fetchedAt) : "n/a"}</div>
					</div>
				</div>

				<div className="mb-2 flex items-center gap-2">
					<div className="relative flex-1">
						<Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
						<Input
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							placeholder="Filter headlines, sources..."
							className="h-8 pl-7"
						/>
					</div>
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="h-8 shrink-0"
						onClick={() => setSortMode((prev) => (prev === "newest" ? "source" : "newest"))}
					>
						Sort: {sortMode === "newest" ? "Newest" : "Source"}
					</Button>
				</div>

				<div className="mb-2 flex flex-wrap gap-1">{providerSummary}</div>

				<div className="flex flex-wrap items-center gap-1 text-[10px]">
					{(
						[
							["all", articleStats.total],
							["positive", articleStats.sentimentCounts.positive],
							["negative", articleStats.sentimentCounts.negative],
							["neutral", articleStats.sentimentCounts.neutral],
							["unknown", articleStats.sentimentCounts.unknown],
						] as const
					).map(([value, count]) => {
						const selected = sentimentFilter === value;
						return (
							<button
								key={value}
								type="button"
								onClick={() => setSentimentFilter(value)}
								className={`rounded-full border px-2 py-1 transition-colors ${
									value === "all"
										? "border-border text-muted-foreground"
										: sentimentBadgeClass(value)
								} ${selected ? "bg-accent/30 ring-1 ring-border" : "hover:bg-accent/20"}`}
							>
								{value} ({count})
							</button>
						);
					})}
				</div>
			</div>

			<ScrollArea className="flex-1 p-3">
				<div className="space-y-2">
					{loading && articles.length === 0
						? ["alpha", "beta", "gamma", "delta"].map((skeletonId) => (
								<div
									key={`skeleton-${skeletonId}`}
									className="animate-pulse rounded-md border border-border p-3"
								>
									<div className="mb-2 h-3 w-1/3 rounded bg-accent/30" />
									<div className="mb-1 h-4 w-[92%] rounded bg-accent/30" />
									<div className="h-3 w-[70%] rounded bg-accent/20" />
								</div>
							))
						: null}

					{loading && articles.length > 0 ? (
						<div className="flex items-center gap-2 rounded-md border border-border bg-card/20 px-3 py-2 text-xs text-muted-foreground">
							<RefreshCw className="h-3.5 w-3.5 animate-spin" />
							Refreshing news feed...
						</div>
					) : null}

					{error ? (
						<div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-xs text-amber-500">
							<div className="mb-1 flex items-center gap-1 font-medium">
								<AlertTriangle className="h-3.5 w-3.5" />
								News fetch issue
							</div>
							<div>{error}</div>
						</div>
					) : null}

					{filteredArticles.map((article) => {
						const sentiment = normalizeSentiment(article.sentiment);
						return (
							<button
								key={article.id}
								type="button"
								className="w-full rounded-md border border-border bg-card/30 p-3 text-left transition-colors hover:bg-accent/30"
								onClick={() => setSelectedArticle(article)}
							>
								<div className="mb-2 flex items-start justify-between gap-2">
									<div className="min-w-0 space-y-1">
										<div className="flex flex-wrap items-center gap-1">
											<Badge variant="outline" className="text-[10px] uppercase">
												{article.provider}
											</Badge>
											<Badge variant="outline" className="text-[10px]">
												{article.source}
											</Badge>
											<Badge
												variant="outline"
												className={`text-[10px] ${sentimentBadgeClass(sentiment)}`}
											>
												{sentiment}
											</Badge>
										</div>
										<p className="text-sm font-medium leading-snug">
											{truncateText(article.title, 150)}
										</p>
									</div>
									<span
										className="shrink-0 text-[11px] text-muted-foreground"
										title={formatDate(article.publishedAt)}
									>
										{formatRelativeAge(article.publishedAt)}
									</span>
								</div>

								<div className="flex items-start gap-3">
									{article.imageUrl ? (
										<div className="relative hidden h-16 w-24 shrink-0 overflow-hidden rounded border border-border bg-card md:block">
											<Image
												src={article.imageUrl}
												alt={article.title}
												fill
												unoptimized
												className="object-cover"
											/>
										</div>
									) : null}
									<div className="min-w-0 flex-1">
										{article.summary ? (
											<p className="text-xs leading-5 text-muted-foreground">
												{truncateText(article.summary, 220)}
											</p>
										) : (
											<p className="text-xs italic text-muted-foreground">No summary available.</p>
										)}
										<div className="mt-2 flex items-center justify-between gap-2">
											<span className="text-[11px] text-muted-foreground">
												Published {formatDate(article.publishedAt)}
											</span>
											<span className="inline-flex items-center text-[11px] text-muted-foreground">
												Open details
												<ExternalLink className="ml-1 h-3 w-3" />
											</span>
										</div>
									</div>
								</div>
							</button>
						);
					})}

					{noMatches ? (
						<div className="rounded-md border border-border bg-card/20 p-3 text-xs text-muted-foreground">
							<p className="font-medium text-foreground">No articles match current filters.</p>
							<p className="mt-1">Try clearing source/sentiment filters or search query.</p>
							<div className="mt-2 flex gap-2">
								<Button
									size="sm"
									variant="outline"
									className="h-7 text-xs"
									onClick={() => {
										setQuery("");
										setProviderFilter("all");
										setSentimentFilter("all");
									}}
								>
									Reset Filters
								</Button>
							</div>
						</div>
					) : null}

					{hasSourceFallbacks ? (
						<div className="space-y-2 rounded-md border border-dashed border-border bg-card/20 p-3">
							<div>
								<p className="text-xs font-medium">No fetched articles available</p>
								<p className="text-[11px] text-muted-foreground">
									Provider fetch returned no rows. Open source links below as fallback.
								</p>
							</div>
							{sources.map((source) => (
								<a
									key={source.id}
									href={source.url}
									target="_blank"
									rel="noreferrer"
									className="block rounded-md border border-border p-2 text-xs transition-colors hover:bg-accent/30"
								>
									<div className="flex items-center justify-between gap-2">
										<span className="font-medium">{source.name}</span>
										<ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
									</div>
									<p className="mt-1 truncate text-muted-foreground">{source.url}</p>
								</a>
							))}
						</div>
					) : null}
				</div>
			</ScrollArea>

			<Dialog
				open={Boolean(selectedArticle)}
				onOpenChange={(open) => !open && setSelectedArticle(null)}
			>
				<DialogContent className="max-h-[85vh] max-w-3xl overflow-hidden">
					{selectedArticle ? (
						<div className="flex h-full max-h-[78vh] flex-col">
							<DialogHeader>
								<DialogTitle className="pr-8">{selectedArticle.title}</DialogTitle>
								<DialogDescription>
									{selectedArticle.source} · {selectedArticle.provider} ·{" "}
									{formatDate(selectedArticle.publishedAt)}
								</DialogDescription>
							</DialogHeader>
							<div className="mt-3 flex-1 space-y-3 overflow-y-auto">
								{selectedArticle.imageUrl ? (
									<Image
										src={selectedArticle.imageUrl}
										alt={selectedArticle.title}
										width={1200}
										height={560}
										unoptimized
										className="h-56 w-full rounded-md border border-border object-cover"
									/>
								) : null}

								<div className="flex flex-wrap gap-1">
									<Badge variant="outline" className="text-[10px] uppercase">
										{selectedArticle.provider}
									</Badge>
									<Badge variant="outline" className="text-[10px]">
										{selectedArticle.source}
									</Badge>
									<Badge
										variant="outline"
										className={`text-[10px] ${sentimentBadgeClass(normalizeSentiment(selectedArticle.sentiment))}`}
									>
										{normalizeSentiment(selectedArticle.sentiment)}
									</Badge>
								</div>

								{selectedArticle.summary ? (
									<p className="text-sm text-muted-foreground">{selectedArticle.summary}</p>
								) : null}
								{selectedArticle.content && selectedArticle.content !== selectedArticle.summary ? (
									<p className="whitespace-pre-wrap text-sm leading-6">{selectedArticle.content}</p>
								) : null}
							</div>
							<div className="mt-4 flex justify-end">
								<Button variant="outline" size="sm" asChild>
									<a href={selectedArticle.url} target="_blank" rel="noreferrer">
										Open Original
										<ExternalLink className="ml-1 h-3.5 w-3.5" />
									</a>
								</Button>
							</div>
						</div>
					) : null}
				</DialogContent>
			</Dialog>
		</div>
	);
}

export default NewsPanel;
