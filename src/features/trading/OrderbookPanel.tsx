"use client";

import { useQuery } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";
import { orderbookQueryKey, useOrderbookStream } from "@/features/trading/hooks/useOrderbookStream";
import type { OrderbookLevel, OrderbookSnapshot } from "@/features/trading/types";

interface OrderbookPanelProps {
	symbol: string;
}

const LEVELS = 15;

async function fetchOrderbookSnapshot(symbol: string): Promise<OrderbookSnapshot> {
	const params = new URLSearchParams({
		symbol: symbol.toUpperCase(),
		exchange: "binance",
		assetType: "spot",
	});
	const res = await fetch(`/api/v1/orderbook?${params.toString()}`);
	if (!res.ok) throw new Error("orderbook fetch failed");
	const json = (await res.json()) as { success: boolean; data?: OrderbookSnapshot };
	if (!json.success || !json.data) throw new Error("no orderbook data");
	return json.data;
}

function DepthBar({
	amount,
	maxAmount,
	side,
}: {
	amount: number;
	maxAmount: number;
	side: "bid" | "ask";
}) {
	const pct = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
	return (
		<div
			className="absolute inset-y-0 right-0 opacity-20 rounded-sm"
			style={{
				width: `${pct}%`,
				backgroundColor: side === "bid" ? "oklch(0.696 0.17 162.48)" : "oklch(0.627 0.257 29.23)",
			}}
		/>
	);
}

function LevelRow({
	level,
	maxAmount,
	side,
}: {
	level: OrderbookLevel;
	maxAmount: number;
	side: "bid" | "ask";
}) {
	return (
		<div className="relative grid grid-cols-2 px-3 py-[2px] text-[11px] font-mono hover:bg-accent/20">
			<DepthBar amount={level.amount} maxAmount={maxAmount} side={side} />
			<span className={side === "bid" ? "text-success z-10" : "text-error z-10"}>
				{level.price.toLocaleString(undefined, {
					minimumFractionDigits: 2,
					maximumFractionDigits: 6,
				})}
			</span>
			<span className="text-right text-muted-foreground z-10">
				{level.amount.toLocaleString(undefined, {
					minimumFractionDigits: 4,
					maximumFractionDigits: 6,
				})}
			</span>
		</div>
	);
}

export function OrderbookPanel({ symbol }: OrderbookPanelProps) {
	const mounted = useSyncExternalStore(
		() => () => {},
		() => true,
		() => false,
	);

	const { data, isLoading, isError } = useQuery<OrderbookSnapshot>({
		queryKey: orderbookQueryKey(symbol),
		queryFn: () => fetchOrderbookSnapshot(symbol),
		staleTime: 5_000,
		enabled: mounted,
	});

	useOrderbookStream({ symbol, enabled: mounted });

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-full text-xs text-muted-foreground">
				Loading orderbook…
			</div>
		);
	}

	if (isError || !data) {
		return (
			<div className="flex items-center justify-center h-full text-xs text-muted-foreground">
				Orderbook unavailable — backend not running
			</div>
		);
	}

	const asks = [...data.asks]
		.sort((a, b) => a.price - b.price)
		.slice(0, LEVELS)
		.reverse();
	const bids = [...data.bids].sort((a, b) => b.price - a.price).slice(0, LEVELS);

	const bestAsk = data.asks.length > 0 ? Math.min(...data.asks.map((l) => l.price)) : null;
	const bestBid = data.bids.length > 0 ? Math.max(...data.bids.map((l) => l.price)) : null;
	const spread = bestAsk !== null && bestBid !== null ? bestAsk - bestBid : null;
	const spreadPct =
		spread !== null && bestBid !== null && bestBid > 0 ? (spread / bestBid) * 100 : null;

	const maxAskAmount = asks.reduce((m, l) => Math.max(m, l.amount), 0);
	const maxBidAmount = bids.reduce((m, l) => Math.max(m, l.amount), 0);

	return (
		<div className="flex flex-col h-full overflow-hidden text-[11px]">
			{/* Header */}
			<div className="grid grid-cols-2 px-3 py-1.5 border-b border-border bg-accent/10 text-[9px] uppercase font-bold tracking-wider text-muted-foreground">
				<span>Price</span>
				<span className="text-right">Amount</span>
			</div>

			{/* Asks (sell side) — displayed top to bottom, lowest ask at bottom */}
			<div className="flex-1 flex flex-col justify-end overflow-hidden border-b border-border/50">
				{asks.map((level) => (
					<LevelRow key={`ask-${level.price}`} level={level} maxAmount={maxAskAmount} side="ask" />
				))}
			</div>

			{/* Spread */}
			<div className="px-3 py-1 flex items-center justify-between bg-accent/5 border-b border-border/50 text-[10px] font-mono">
				<span className="text-muted-foreground uppercase font-bold tracking-wider text-[9px]">
					Spread
				</span>
				<span className="text-foreground">
					{spread !== null ? `${spread.toFixed(4)}  (${spreadPct?.toFixed(3)}%)` : "—"}
				</span>
			</div>

			{/* Bids (buy side) */}
			<div className="flex-1 overflow-hidden">
				{bids.map((level) => (
					<LevelRow key={`bid-${level.price}`} level={level} maxAmount={maxBidAmount} side="bid" />
				))}
			</div>
		</div>
	);
}

export default OrderbookPanel;
