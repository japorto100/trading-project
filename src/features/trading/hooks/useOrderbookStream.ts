"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import type { OrderbookSnapshot } from "@/features/trading/types";

export function orderbookQueryKey(symbol: string) {
	return ["market", "orderbook", symbol.toUpperCase()];
}

interface UseOrderbookStreamOptions {
	symbol: string;
	exchange?: string;
	enabled: boolean;
}

export function useOrderbookStream({
	symbol,
	exchange = "binance",
	enabled,
}: UseOrderbookStreamOptions) {
	const queryClient = useQueryClient();
	const esRef = useRef<EventSource | null>(null);

	useEffect(() => {
		if (!enabled) return;

		const params = new URLSearchParams({
			symbol: symbol.toUpperCase(),
			exchange,
			assetType: "spot",
		});

		const es = new EventSource(`/api/v1/stream/orderbook?${params.toString()}`);
		esRef.current = es;

		es.addEventListener("orderbook", (event) => {
			try {
				const snapshot = JSON.parse(event.data) as OrderbookSnapshot;
				queryClient.setQueryData(orderbookQueryKey(symbol), snapshot);
			} catch {
				// malformed event — ignore
			}
		});

		return () => {
			es.close();
			esRef.current = null;
		};
	}, [symbol, exchange, enabled, queryClient]);
}
