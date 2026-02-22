"use client";

import { ExternalLink, RefreshCw } from "lucide-react";
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

function formatDate(value: string): string {
	const ts = new Date(value);
	if (Number.isNaN(ts.getTime())) {
		return value;
	}
	return ts.toLocaleString();
}

function truncateText(value: string | undefined, maxLen: number): string | undefined {
	if (!value) return undefined;
	if (value.length <= maxLen) return value;
	return `${value.slice(0, maxLen - 3)}...`;
}

export function NewsPanel({ symbol }: NewsPanelProps) {
	const [articles, setArticles] = useState<MarketNewsArticle[]>([]);
	const [providers, setProviders] = useState<MarketNewsProviderStatus[]>([]);
	const [sources, setSources] = useState<NewsSource[]>([]);
	const [selectedArticle, setSelectedArticle] = useState<MarketNewsArticle | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const loadNews = useCallback(
		async (forceRefresh: boolean = false) => {
			setLoading(true);
			setError(null);
			try {
				const params = new URLSearchParams({
					symbol,
					limit: "24",
				});
				if (forceRefresh) {
					params.set("refresh", "1");
				}
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), 8000);
				const response = await fetch(`/api/market/news?${params.toString()}`, {
					cache: "no-store",
					signal: controller.signal,
				});
				clearTimeout(timeoutId);
				const payload = (await response.json()) as NewsApiResponse;
				if (!response.ok || !payload.success) {
					throw new Error(payload.error || `News request failed (${response.status})`);
				}

				setArticles(Array.isArray(payload.articles) ? payload.articles : []);
				setProviders(Array.isArray(payload.providers) ? payload.providers : []);
				setSources(Array.isArray(payload.sources) ? payload.sources : []);
			} catch (requestError) {
				if (requestError instanceof DOMException && requestError.name === "AbortError") {
					setError("News request timed out. Try Refresh.");
				} else {
					setError(requestError instanceof Error ? requestError.message : "Unknown news error");
				}
			} finally {
				setLoading(false);
			}
		},
		[symbol],
	);

	useEffect(() => {
		void loadNews(false);
	}, [loadNews]);

	const providerSummary = useMemo(
		() =>
			providers.map((provider) => (
				<Badge
					key={provider.provider}
					variant="outline"
					className={
						provider.ok
							? "border-emerald-500/40 text-emerald-500"
							: "border-amber-500/40 text-amber-500"
					}
				>
					{provider.provider}: {provider.count}
				</Badge>
			)),
		[providers],
	);

	return (
		<div className="flex h-full flex-col">
			<div className="border-b border-border p-3">
				<div className="mb-2 flex items-center justify-between gap-2">
					<div>
						<p className="text-sm font-medium">Live Market News</p>
						<p className="text-xs text-muted-foreground">Aggregated headlines for {symbol}.</p>
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void loadNews(true)}
						disabled={loading}
						className="h-8"
					>
						<RefreshCw className={`mr-1 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
						Refresh
					</Button>
				</div>
				<div className="flex flex-wrap gap-1">{providerSummary}</div>
			</div>

			<div className="flex-1 overflow-y-auto p-3 space-y-2">
				{loading && (
					<div className="flex items-center gap-2 rounded-md border border-border p-3">
						<RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
						<p className="text-xs text-muted-foreground">Loading news...</p>
					</div>
				)}
				{error && (
					<div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-xs text-amber-500">
						{error}
					</div>
				)}

				{articles.map((article) => (
					<button
						key={article.id}
						type="button"
						className="w-full rounded-md border border-border bg-card/30 p-3 text-left transition-colors hover:bg-accent/30"
						onClick={() => setSelectedArticle(article)}
					>
						<div className="mb-1 flex items-center justify-between gap-2">
							<span className="truncate text-xs uppercase text-muted-foreground">
								{article.source}
							</span>
							<span className="shrink-0 text-[11px] text-muted-foreground">
								{formatDate(article.publishedAt)}
							</span>
						</div>
						<p className="text-sm font-medium">{truncateText(article.title, 120)}</p>
						{article.summary && (
							<p className="mt-1 text-xs text-muted-foreground">
								{truncateText(article.summary, 180)}
							</p>
						)}
					</button>
				))}

				{!loading && articles.length === 0 && (
					<div className="space-y-2">
						<p className="text-xs text-muted-foreground">
							No fetched articles available. Fallback links:
						</p>
						{sources.map((source) => (
							<a
								key={source.id}
								href={source.url}
								target="_blank"
								rel="noreferrer"
								className="block rounded-md border border-border p-2 text-xs hover:bg-accent/30"
							>
								<span className="font-medium">{source.name}</span>
								<p className="truncate text-muted-foreground">{source.url}</p>
							</a>
						))}
					</div>
				)}
			</div>

			<Dialog
				open={Boolean(selectedArticle)}
				onOpenChange={(open) => !open && setSelectedArticle(null)}
			>
				<DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden">
					{selectedArticle && (
						<div className="flex h-full max-h-[78vh] flex-col">
							<DialogHeader>
								<DialogTitle className="pr-8">{selectedArticle.title}</DialogTitle>
								<DialogDescription>
									{selectedArticle.source} - {formatDate(selectedArticle.publishedAt)}
								</DialogDescription>
							</DialogHeader>
							<div className="mt-3 flex-1 space-y-3 overflow-y-auto">
								{selectedArticle.imageUrl && (
									<Image
										src={selectedArticle.imageUrl}
										alt={selectedArticle.title}
										width={1200}
										height={560}
										unoptimized
										className="h-56 w-full rounded-md border border-border object-cover"
									/>
								)}
								{selectedArticle.summary && (
									<p className="text-sm text-muted-foreground">{selectedArticle.summary}</p>
								)}
								{selectedArticle.content && selectedArticle.content !== selectedArticle.summary && (
									<p className="whitespace-pre-wrap text-sm leading-6">{selectedArticle.content}</p>
								)}
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
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}

export default NewsPanel;
