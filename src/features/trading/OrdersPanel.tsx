"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import type { OrderSide, OrderStatus, OrderType, PaperOrder } from "@/lib/orders/types";
import { getClientProfileKey } from "@/lib/storage/profile-key";

interface OrdersPanelProps {
	symbol: string;
	markPrice: number;
}

function num(value: string): number {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : 0;
}

export function OrdersPanel({ symbol, markPrice }: OrdersPanelProps) {
	const [side, setSide] = useState<OrderSide>("buy");
	const [orderType, setOrderType] = useState<OrderType>("market");
	const [quantity, setQuantity] = useState("1");
	const [limitPrice, setLimitPrice] = useState("");
	const [stopPrice, setStopPrice] = useState("");
	const [stopLoss, setStopLoss] = useState("");
	const [takeProfit, setTakeProfit] = useState("");
	const profileKey = useMemo(() => getClientProfileKey(), []);
	const queryClient = useQueryClient();

	const {
		data: ordersData,
		isFetching: loadingOrders,
		error: ordersQueryError,
		dataUpdatedAt,
		refetch: refetchOrders,
	} = useQuery({
		queryKey: ["portfolio", "orders", profileKey, symbol],
		queryFn: async () => {
			const params = new URLSearchParams({ profileKey, symbol });
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 5000);
			try {
				const response = await fetch(`/api/fusion/orders?${params.toString()}`, {
					cache: "no-store",
					signal: controller.signal,
				});
				if (!response.ok) throw new Error(`Orders fetch failed (${response.status})`);
				const payload = (await response.json()) as { orders?: PaperOrder[] };
				return Array.isArray(payload.orders) ? payload.orders : [];
			} finally {
				clearTimeout(timeoutId);
			}
		},
		refetchInterval: 12_000,
		staleTime: 10_000,
	});

	const orders = ordersData ?? [];
	const ordersError = ordersQueryError instanceof Error ? ordersQueryError.message : null;
	const lastOrdersLoadAt = dataUpdatedAt ? new Date(dataUpdatedAt).toISOString() : null;

	const entryPrice = useMemo(() => {
		if (orderType === "market") return markPrice;
		if (orderType === "limit") return num(limitPrice);
		if (orderType === "stop") return num(stopPrice);
		return num(limitPrice);
	}, [limitPrice, markPrice, orderType, stopPrice]);

	const quantityValue = num(quantity);
	const notional = entryPrice > 0 ? entryPrice * quantityValue : 0;
	const stopLossValue = num(stopLoss);
	const takeProfitValue = num(takeProfit);

	const riskEstimate = useMemo(() => {
		if (!entryPrice || !quantityValue || !stopLossValue) return null;
		const perUnit = side === "buy" ? entryPrice - stopLossValue : stopLossValue - entryPrice;
		return perUnit > 0 ? perUnit * quantityValue : null;
	}, [entryPrice, quantityValue, stopLossValue, side]);

	const rewardEstimate = useMemo(() => {
		if (!entryPrice || !quantityValue || !takeProfitValue) return null;
		const perUnit = side === "buy" ? takeProfitValue - entryPrice : entryPrice - takeProfitValue;
		return perUnit > 0 ? perUnit * quantityValue : null;
	}, [entryPrice, quantityValue, takeProfitValue, side]);
	const rewardRiskRatio =
		riskEstimate && rewardEstimate && riskEstimate > 0 ? rewardEstimate / riskEstimate : null;

	const openOrders = orders.filter((order) => order.status === "open");
	const closedOrders = orders.filter((order) => order.status !== "open").slice(0, 6);

	const placeOrder = async () => {
		if (quantityValue <= 0) {
			toast({
				title: "Invalid quantity",
				description: "Quantity must be greater than 0.",
			});
			return;
		}

		if (entryPrice <= 0) {
			toast({
				title: "Invalid price",
				description: "Entry price must be greater than 0.",
			});
			return;
		}

		try {
			const response = await fetch("/api/fusion/orders", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					profileKey,
					symbol,
					side,
					type: orderType,
					quantity: quantityValue,
					entryPrice,
					stopLoss: stopLossValue > 0 ? stopLossValue : undefined,
					takeProfit: takeProfitValue > 0 ? takeProfitValue : undefined,
				}),
			});

			if (!response.ok) {
				throw new Error(`Create order failed (${response.status})`);
			}

			const payload = (await response.json()) as { order?: PaperOrder };
			if (payload.order) {
				queryClient.setQueryData<PaperOrder[]>(
					["portfolio", "orders", profileKey, symbol],
					(prev) => [payload.order as PaperOrder, ...(prev ?? [])],
				);
			}

			toast({
				title: "Paper order placed",
				description: `${side.toUpperCase()} ${quantityValue} ${symbol} @ ${entryPrice.toFixed(4)}`,
			});
		} catch (error) {
			toast({
				title: "Order failed",
				description: error instanceof Error ? error.message : "Could not place paper order.",
			});
		}
	};

	const updateOrderStatus = async (id: string, status: OrderStatus) => {
		try {
			const response = await fetch(`/api/fusion/orders/${encodeURIComponent(id)}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					profileKey,
					status,
				}),
			});

			if (!response.ok) {
				throw new Error(`Update order failed (${response.status})`);
			}

			queryClient.setQueryData<PaperOrder[]>(["portfolio", "orders", profileKey, symbol], (prev) =>
				(prev ?? []).map((order) => (order.id === id ? { ...order, status } : order)),
			);
		} catch (error) {
			toast({
				title: "Order update failed",
				description: error instanceof Error ? error.message : "Could not update order status.",
			});
		}
	};

	return (
		<div className="flex h-full flex-col">
			<div className="border-b border-border p-3 space-y-3">
				<div className="flex items-center justify-between gap-2">
					<div>
						<p className="text-sm font-medium">Paper Order Ticket</p>
						<p className="text-xs text-muted-foreground">
							Orders{" "}
							{lastOrdersLoadAt
								? `updated ${new Date(lastOrdersLoadAt).toLocaleTimeString()}`
								: "not loaded yet"}
						</p>
					</div>
					<div className="flex items-center gap-2">
						<Badge variant="outline">Mark {markPrice.toFixed(4)}</Badge>
						<Button
							type="button"
							size="sm"
							variant="outline"
							className="h-8"
							onClick={() => void refetchOrders()}
							disabled={loadingOrders}
						>
							{loadingOrders ? "Refreshing..." : "Refresh"}
						</Button>
					</div>
				</div>
				{ordersError ? (
					<Alert>
						<AlertTitle>Order sync unavailable</AlertTitle>
						<AlertDescription>
							<p>{ordersError}</p>
							<p>
								Existing order data remains visible. Manual actions still show toasts on failure.
							</p>
						</AlertDescription>
					</Alert>
				) : null}

				<div className="grid grid-cols-2 gap-2 p-1 bg-accent/20 rounded-md border border-border/50">
					<Button
						size="sm"
						variant="ghost"
						className={`transition-all duration-300 ${side === "buy" ? "bg-success/20 text-success hover:bg-success/30 hover:text-success shadow-chromatic border border-success/30" : "text-muted-foreground hover:bg-accent/50"}`}
						onClick={() => setSide("buy")}
					>
						Buy
					</Button>
					<Button
						size="sm"
						variant="ghost"
						className={`transition-all duration-300 ${side === "sell" ? "bg-error/20 text-error hover:bg-error/30 hover:text-error shadow-chromatic-error border border-error/30" : "text-muted-foreground hover:bg-accent/50"}`}
						onClick={() => setSide("sell")}
					>
						Sell
					</Button>
				</div>

				<div className="grid grid-cols-2 gap-2">
					<div className="space-y-1">
						<label htmlFor="order-type" className="text-[11px] text-muted-foreground">
							Order Type
						</label>
						<Select value={orderType} onValueChange={(value) => setOrderType(value as OrderType)}>
							<SelectTrigger id="order-type" className="w-full h-8 text-xs">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="market">Market</SelectItem>
								<SelectItem value="limit">Limit</SelectItem>
								<SelectItem value="stop">Stop Market</SelectItem>
								<SelectItem value="stop_limit">Stop Limit</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-1">
						<label htmlFor="order-quantity" className="text-[11px] text-muted-foreground">
							Quantity
						</label>
						<Input
							id="order-quantity"
							name="order-quantity"
							value={quantity}
							onChange={(event) => setQuantity(event.target.value)}
							className="h-8"
							inputMode="decimal"
							placeholder="0"
						/>
						<div className="mt-1 flex flex-wrap gap-1">
							{["0.25", "0.5", "1", "2", "5"].map((preset) => (
								<Button
									key={preset}
									type="button"
									size="sm"
									variant={quantity === preset ? "secondary" : "outline"}
									className="h-6 px-2 text-[10px]"
									onClick={() => setQuantity(preset)}
								>
									{preset}
								</Button>
							))}
						</div>
					</div>
				</div>

				{(orderType === "limit" || orderType === "stop_limit") && (
					<div className="space-y-1">
						<label htmlFor="order-limit-price" className="text-[11px] text-muted-foreground">
							Limit Price
						</label>
						<Input
							id="order-limit-price"
							name="order-limit-price"
							value={limitPrice}
							onChange={(event) => setLimitPrice(event.target.value)}
							className="h-8"
							inputMode="decimal"
							placeholder={markPrice.toFixed(4)}
						/>
					</div>
				)}

				{(orderType === "stop" || orderType === "stop_limit") && (
					<div className="space-y-1">
						<label htmlFor="order-stop-price" className="text-[11px] text-muted-foreground">
							Stop Trigger
						</label>
						<Input
							id="order-stop-price"
							name="order-stop-price"
							value={stopPrice}
							onChange={(event) => setStopPrice(event.target.value)}
							className="h-8"
							inputMode="decimal"
							placeholder={markPrice.toFixed(4)}
						/>
					</div>
				)}

				<div className="grid grid-cols-2 gap-2">
					<div className="space-y-1">
						<label htmlFor="order-stop-loss" className="text-[11px] text-muted-foreground">
							Stop Loss (optional)
						</label>
						<Input
							id="order-stop-loss"
							name="order-stop-loss"
							value={stopLoss}
							onChange={(event) => setStopLoss(event.target.value)}
							className="h-8"
							inputMode="decimal"
							placeholder="e.g. 242.50"
						/>
					</div>
					<div className="space-y-1">
						<label htmlFor="order-take-profit" className="text-[11px] text-muted-foreground">
							Take Profit (optional)
						</label>
						<Input
							id="order-take-profit"
							name="order-take-profit"
							value={takeProfit}
							onChange={(event) => setTakeProfit(event.target.value)}
							className="h-8"
							inputMode="decimal"
							placeholder="e.g. 262.00"
						/>
					</div>
				</div>

				<div className="rounded-xl border border-border/50 bg-background/50 backdrop-blur p-3 text-xs space-y-3 shadow-sm">
					<div className="flex items-center justify-between font-mono">
						<span className="text-muted-foreground">Entry / Notional</span>
						<span>
							{entryPrice > 0 ? entryPrice.toFixed(4) : "-"}{" "}
							<span className="text-muted-foreground/50">|</span>{" "}
							{notional > 0 ? notional.toFixed(2) : "-"}
						</span>
					</div>

					{/* Risk/Reward Gauge */}
					{riskEstimate !== null && rewardEstimate !== null ? (
						<div className="space-y-1.5">
							<div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider">
								<span className="text-error">Risk: {riskEstimate.toFixed(2)}</span>
								<span className="text-muted-foreground">R:R {rewardRiskRatio?.toFixed(2)}</span>
								<span className="text-success">Reward: {rewardEstimate.toFixed(2)}</span>
							</div>
							<div className="h-1.5 w-full rounded-full bg-accent/50 flex overflow-hidden">
								<div
									className="h-full bg-error transition-all duration-500"
									style={{
										width: `${Math.min(100, (riskEstimate / (riskEstimate + rewardEstimate)) * 100)}%`,
									}}
								/>
								<div
									className="h-full bg-success transition-all duration-500"
									style={{
										width: `${Math.min(100, (rewardEstimate / (riskEstimate + rewardEstimate)) * 100)}%`,
									}}
								/>
							</div>
						</div>
					) : (
						<div className="flex items-center justify-between text-muted-foreground">
							<span>Set SL/TP for R:R</span>
						</div>
					)}
				</div>

				<Button
					className={`w-full font-bold uppercase tracking-widest transition-all duration-300 ${
						side === "buy"
							? "bg-success hover:bg-success/90 text-success-foreground shadow-chromatic"
							: "bg-error hover:bg-error/90 text-error-foreground shadow-chromatic-error"
					}`}
					onClick={placeOrder}
				>
					Place {side} Order
				</Button>
			</div>

			<ScrollArea className="flex-1">
				<div className="p-3 space-y-3">
					<div>
						<p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
							Open Orders
						</p>
						{loadingOrders && <p className="text-xs text-muted-foreground">Loading...</p>}
						{!loadingOrders && openOrders.length === 0 && (
							<p className="text-xs text-muted-foreground">No open orders for {symbol}.</p>
						)}
						<div className="space-y-2">
							{openOrders.map((order) => (
								<div
									key={order.id}
									className="rounded-md border border-border bg-card/30 p-2 text-xs"
								>
									<div className="mb-1 flex items-center justify-between">
										<span className="font-medium">
											{order.side.toUpperCase()} {order.quantity} {order.symbol}
										</span>
										<Badge variant="outline">{order.type}</Badge>
									</div>
									<p className="text-muted-foreground">Entry {order.entryPrice.toFixed(4)}</p>
									{(order.stopLoss || order.takeProfit) && (
										<p className="text-muted-foreground">
											SL {order.stopLoss?.toFixed(4) || "-"} / TP{" "}
											{order.takeProfit?.toFixed(4) || "-"}
										</p>
									)}
									<div className="mt-2 flex gap-2">
										<Button
											size="sm"
											variant="outline"
											className="h-7 text-xs"
											onClick={() => updateOrderStatus(order.id, "filled")}
										>
											Mark Filled
										</Button>
										<Button
											size="sm"
											variant="outline"
											className="h-7 text-xs"
											onClick={() => updateOrderStatus(order.id, "cancelled")}
										>
											Cancel
										</Button>
									</div>
								</div>
							))}
						</div>
					</div>

					<div>
						<p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
							Recent Closed
						</p>
						{!loadingOrders && closedOrders.length === 0 && (
							<p className="text-xs text-muted-foreground">No closed orders yet.</p>
						)}
						<div className="space-y-2">
							{closedOrders.map((order) => (
								<div key={order.id} className="rounded-md border border-border p-2 text-xs">
									<div className="flex items-center justify-between">
										<span>
											{order.side.toUpperCase()} {order.quantity} {order.symbol}
										</span>
										<Badge variant="outline">{order.status}</Badge>
									</div>
									<p className="text-muted-foreground">
										{order.type} @ {order.entryPrice.toFixed(4)}
									</p>
									{typeof order.filledPrice === "number" && (
										<p className="text-muted-foreground">Filled @ {order.filledPrice.toFixed(4)}</p>
									)}
								</div>
							))}
						</div>
					</div>
				</div>
			</ScrollArea>
		</div>
	);
}

export default OrdersPanel;
