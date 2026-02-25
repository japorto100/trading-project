"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { FusionSymbol } from "@/lib/fusion-symbols";
import type { QuoteData } from "@/lib/providers/types";
import type { WatchlistSortMode, WatchlistStreamState } from "./watchlist/types";
import { WatchlistFilterBar } from "./watchlist/WatchlistFilterBar";
import { WatchlistRow } from "./watchlist/WatchlistRow";
import { WatchlistStreamStatus } from "./watchlist/WatchlistStreamStatus";

interface WatchlistPanelProps {
	symbols: FusionSymbol[];
	currentSymbol: string;
	favorites: string[];
	onSelectSymbol: (symbol: FusionSymbol) => void;
	onToggleFavorite: (symbol: string) => void;
}

interface QuotesResponse {
	success: boolean;
	quotes: Record<string, QuoteData>;
}

export function WatchlistPanel({
	symbols,
	currentSymbol,
	favorites,
	onSelectSymbol,
	onToggleFavorite,
}: WatchlistPanelProps) {
	const [quotes, setQuotes] = useState<Record<string, QuoteData>>({});
	const [loadingQuotes, setLoadingQuotes] = useState(false);
	const [query, setQuery] = useState("");
	const [sortMode, setSortMode] = useState<WatchlistSortMode>("default");
	const [streamState, setStreamState] = useState<WatchlistStreamState>("connecting");
	const [streamReconnects, setStreamReconnects] = useState(0);
	const [streamLastUpdateAt, setStreamLastUpdateAt] = useState<number | null>(null);
	const [clockMs, setClockMs] = useState<number>(Date.now());

	const symbolsKey = useMemo(() => symbols.map((s) => s.symbol).join(","), [symbols]);

	useEffect(() => {
		const timer = setInterval(() => {
			setClockMs(Date.now());
		}, 1000);
		return () => clearInterval(timer);
	}, []);

	useEffect(() => {
		if (!symbolsKey) {
			setQuotes({});
			return;
		}

		let alive = true;
		let fallbackTimer: ReturnType<typeof setInterval> | null = null;

		const fetchQuotes = async () => {
			try {
				setLoadingQuotes(true);
				const response = await fetch(`/api/market/quote?symbols=${encodeURIComponent(symbolsKey)}`);
				if (!response.ok) return;
				const data = (await response.json()) as QuotesResponse;
				if (alive && data.success && data.quotes) {
					setQuotes(data.quotes);
					setStreamLastUpdateAt(Date.now());
				}
			} catch {
				// keep UI usable with base prices when quote API fails
			} finally {
				if (alive) setLoadingQuotes(false);
			}
		};

		const stopFallbackPolling = () => {
			if (fallbackTimer) {
				clearInterval(fallbackTimer);
				fallbackTimer = null;
			}
		};

		const startFallbackPolling = () => {
			if (fallbackTimer) return;
			fallbackTimer = setInterval(() => {
				void fetchQuotes();
			}, 30000);
		};

		setStreamState("connecting");
		setStreamReconnects(0);
		setStreamLastUpdateAt(null);
		fetchQuotes();

		if (typeof window !== "undefined" && typeof window.EventSource !== "undefined") {
			const source = new window.EventSource(
				`/api/market/stream/quotes?symbols=${encodeURIComponent(symbolsKey)}&pollMs=4000`,
			);

			const onReady = () => {
				setStreamState("live");
				stopFallbackPolling();
			};

			const onQuoteBatch = (event: MessageEvent<string>) => {
				try {
					const payload = JSON.parse(event.data) as { quotes?: Record<string, QuoteData> };
					const rows = payload.quotes && typeof payload.quotes === "object" ? payload.quotes : null;
					if (!rows || Object.keys(rows).length === 0) return;
					setQuotes((prev) => ({ ...prev, ...rows }));
					setStreamState("live");
					setStreamLastUpdateAt(Date.now());
					stopFallbackPolling();
				} catch {
					// ignore malformed payload
				}
			};

			const onStreamStatus = (event: MessageEvent<string>) => {
				try {
					const payload = JSON.parse(event.data) as { state?: string };
					if (payload.state === "degraded") {
						setStreamState("degraded");
						startFallbackPolling();
						return;
					}
					if (payload.state === "live") {
						setStreamState("live");
						stopFallbackPolling();
					}
				} catch {
					// ignore malformed status payload
				}
			};

			const onError = () => {
				setStreamState("reconnecting");
				setStreamReconnects((prev) => prev + 1);
				startFallbackPolling();
			};

			source.addEventListener("ready", onReady as EventListener);
			source.addEventListener("quote_batch", onQuoteBatch as EventListener);
			source.addEventListener("stream_status", onStreamStatus as EventListener);
			source.onerror = onError;

			return () => {
				alive = false;
				stopFallbackPolling();
				source.removeEventListener("ready", onReady as EventListener);
				source.removeEventListener("quote_batch", onQuoteBatch as EventListener);
				source.removeEventListener("stream_status", onStreamStatus as EventListener);
				source.close();
			};
		}

		startFallbackPolling();

		return () => {
			alive = false;
			stopFallbackPolling();
		};
	}, [symbolsKey]);

	const streamAgeLabel = useMemo(() => {
		if (!streamLastUpdateAt) return "n/a";
		const seconds = Math.max(0, Math.floor((clockMs - streamLastUpdateAt) / 1000));
		return `${seconds}s`;
	}, [clockMs, streamLastUpdateAt]);

	const visibleSymbols = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();
		const filtered =
			normalizedQuery.length === 0
				? symbols
				: symbols.filter((symbol) => {
						return (
							symbol.symbol.toLowerCase().includes(normalizedQuery) ||
							symbol.name.toLowerCase().includes(normalizedQuery)
						);
					});

		const list = [...filtered];
		if (sortMode === "movers") {
			list.sort((left, right) => {
				const leftMove = Math.abs(quotes[left.symbol]?.changePercent ?? 0);
				const rightMove = Math.abs(quotes[right.symbol]?.changePercent ?? 0);
				return rightMove - leftMove;
			});
			return list;
		}

		if (sortMode === "favorites") {
			list.sort((left, right) => {
				const leftFav = favorites.includes(left.symbol) ? 1 : 0;
				const rightFav = favorites.includes(right.symbol) ? 1 : 0;
				if (leftFav !== rightFav) return rightFav - leftFav;
				return left.symbol.localeCompare(right.symbol);
			});
			return list;
		}

		return list;
	}, [favorites, query, quotes, sortMode, symbols]);

	const topMovers = useMemo(() => {
		return [...symbols]
			.sort((left, right) => {
				const leftMove = Math.abs(quotes[left.symbol]?.changePercent ?? 0);
				const rightMove = Math.abs(quotes[right.symbol]?.changePercent ?? 0);
				return rightMove - leftMove;
			})
			.slice(0, 3);
	}, [quotes, symbols]);

	return (
		<ScrollArea className="flex-1 min-h-0 p-2">
			<WatchlistFilterBar
				query={query}
				sortMode={sortMode}
				visibleCount={visibleSymbols.length}
				favoriteCount={favorites.length}
				topMovers={topMovers}
				onQueryChange={setQuery}
				onCycleSortMode={() => {
					setSortMode((prev) => {
						if (prev === "default") return "movers";
						if (prev === "movers") return "favorites";
						return "default";
					});
				}}
			/>
			<div className="space-y-1">
				{visibleSymbols.length === 0 ? (
					<div className="px-2 py-6 text-sm text-muted-foreground">No symbols in this list.</div>
				) : (
					visibleSymbols.map((symbol) => {
						const quote = quotes[symbol.symbol];
						const isSelected = currentSymbol === symbol.symbol;
						const isFavorite = favorites.includes(symbol.symbol);

						return (
							<WatchlistRow
								key={symbol.symbol}
								symbol={symbol}
								quote={quote}
								isSelected={isSelected}
								isFavorite={isFavorite}
								onSelectSymbol={onSelectSymbol}
								onToggleFavorite={onToggleFavorite}
							/>
						);
					})
				)}
			</div>
			<WatchlistStreamStatus
				loadingQuotes={loadingQuotes}
				streamState={streamState}
				streamAgeLabel={streamAgeLabel}
				streamReconnects={streamReconnects}
			/>
		</ScrollArea>
	);
}

export const MemoizedWatchlistPanel = memo(WatchlistPanel);
