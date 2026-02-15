"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
	const [orders, setOrders] = useState<PaperOrder[]>([]);
	const [loadingOrders, setLoadingOrders] = useState(false);
	const [side, setSide] = useState<OrderSide>("buy");
	const [orderType, setOrderType] = useState<OrderType>("market");
	const [quantity, setQuantity] = useState("1");
	const [limitPrice, setLimitPrice] = useState("");
	const [stopPrice, setStopPrice] = useState("");
	const [stopLoss, setStopLoss] = useState("");
	const [takeProfit, setTakeProfit] = useState("");
	const profileKey = useMemo(() => getClientProfileKey(), []);

	const loadOrders = useCallback(async () => {
		setLoadingOrders(true);
		try {
			const params = new URLSearchParams({
				profileKey,
				symbol,
			});
			const response = await fetch(`/api/fusion/orders?${params.toString()}`, {
				cache: "no-store",
			});

			if (!response.ok) {
				throw new Error(`Orders fetch failed (${response.status})`);
			}

			const payload = (await response.json()) as { orders?: PaperOrder[] };
			setOrders(Array.isArray(payload.orders) ? payload.orders : []);
		} catch (error) {
			toast({
				title: "Orders unavailable",
				description: error instanceof Error ? error.message : "Could not load paper orders.",
			});
		} finally {
			setLoadingOrders(false);
		}
	}, [profileKey, symbol]);

	useEffect(() => {
		void loadOrders();
	}, [loadOrders]);

	useEffect(() => {
		const timer = window.setInterval(() => {
			void loadOrders();
		}, 12000);
		return () => {
			window.clearInterval(timer);
		};
	}, [loadOrders]);

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
				setOrders((prev) => [payload.order as PaperOrder, ...prev]);
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

			setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, status } : order)));
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
					<p className="text-sm font-medium">Paper Order Ticket</p>
					<Badge variant="outline">Mark {markPrice.toFixed(4)}</Badge>
				</div>

				<div className="grid grid-cols-2 gap-2">
					<Button
						size="sm"
						variant={side === "buy" ? "default" : "outline"}
						className={side === "buy" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
						onClick={() => setSide("buy")}
					>
						Buy
					</Button>
					<Button
						size="sm"
						variant={side === "sell" ? "default" : "outline"}
						className={side === "sell" ? "bg-red-600 hover:bg-red-700 text-white" : ""}
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

				<div className="rounded-md border border-border bg-card/30 p-2 text-xs space-y-1">
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground">Entry</span>
						<span>{entryPrice > 0 ? entryPrice.toFixed(4) : "-"}</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground">Notional</span>
						<span>{notional > 0 ? notional.toFixed(2) : "-"}</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground">Est. Risk</span>
						<span>{riskEstimate !== null ? riskEstimate.toFixed(2) : "-"}</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground">Est. Reward</span>
						<span>{rewardEstimate !== null ? rewardEstimate.toFixed(2) : "-"}</span>
					</div>
				</div>

				<Button className="w-full" onClick={placeOrder}>
					Place Paper Order
				</Button>
			</div>

			<div className="flex-1 overflow-y-auto p-3 space-y-3">
				<div>
					<p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Open Orders</p>
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
		</div>
	);
}

export default OrdersPanel;
