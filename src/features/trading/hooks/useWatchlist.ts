"use client";

import { useDebouncedValue } from "@tanstack/react-pacer";
import { useCallback, useMemo, useState } from "react";
import {
	ALL_FUSION_SYMBOLS,
	type FusionSymbol,
	searchFusionSymbols,
	WATCHLIST_CATEGORIES,
} from "@/lib/fusion-symbols";
import type { WatchlistTab } from "../types";

interface UseWatchlistReturn {
	searchQuery: string;
	showSearch: boolean;
	activeTab: WatchlistTab;
	debouncedSearchQuery: string;
	searchPending: boolean;
	filteredSymbols: FusionSymbol[];
	popularSymbols: FusionSymbol[];
	watchlistSymbols: FusionSymbol[];
	allSymbols: FusionSymbol[];
	setSearchQuery: (q: string) => void;
	setShowSearch: (open: boolean) => void;
	setActiveTab: (tab: WatchlistTab) => void;
	clearSearch: () => void;
}

const POPULAR = ["AAPL", "BTC/USD", "EUR/USD", "NVDA"];

export function useWatchlist(favorites: string[]): UseWatchlistReturn {
	const [searchQuery, setSearchQuery] = useState("");
	const [showSearch, setShowSearch] = useState(false);
	const [activeTab, setActiveTab] = useState<WatchlistTab>("all");

	const [debouncedSearchQuery] = useDebouncedValue(searchQuery, { wait: 180 });
	const searchPending = searchQuery.trim() !== debouncedSearchQuery.trim();

	const allSymbols = useMemo(() => ALL_FUSION_SYMBOLS, []);

	const filteredSymbols = useMemo(
		() => searchFusionSymbols(debouncedSearchQuery, 10),
		[debouncedSearchQuery],
	);

	const popularSymbols = useMemo(
		() =>
			POPULAR.map((s) => allSymbols.find((item) => item.symbol === s)).filter(
				(item): item is FusionSymbol => Boolean(item),
			),
		[allSymbols],
	);

	const watchlistSymbols = useMemo(() => {
		if (activeTab === "favorites") return allSymbols.filter((s) => favorites.includes(s.symbol));
		if (activeTab === "all") return allSymbols;
		return WATCHLIST_CATEGORIES[activeTab as keyof typeof WATCHLIST_CATEGORIES] ?? [];
	}, [activeTab, favorites, allSymbols]);

	const clearSearch = useCallback(() => {
		setSearchQuery("");
		setShowSearch(false);
	}, []);

	return {
		searchQuery,
		showSearch,
		activeTab,
		debouncedSearchQuery,
		searchPending,
		filteredSymbols,
		popularSymbols,
		watchlistSymbols,
		allSymbols,
		setSearchQuery,
		setShowSearch,
		setActiveTab,
		clearSearch,
	};
}
