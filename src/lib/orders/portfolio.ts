import type { PaperOrder } from "@/lib/orders/types";

export interface PortfolioPosition {
	symbol: string;
	quantity: number;
	side: "long" | "short" | "flat";
	averagePrice: number;
	currentPrice?: number;
	marketValue?: number;
	realizedPnl: number;
	unrealizedPnl: number;
	totalPnl: number;
}

export interface PortfolioMetrics {
	initialBalance: number;
	filledOrders: number;
	openPositions: number;
	realizedPnl: number;
	unrealizedPnl: number;
	totalPnl: number;
	openExposure: number;
	winRate: number | null;
	maxDrawdown: number;
}

export interface EquityPoint {
	time: string;
	equity: number;
	drawdown: number;
}

export interface PortfolioSnapshot {
	generatedAt: string;
	positions: PortfolioPosition[];
	metrics: PortfolioMetrics;
	equityCurve: EquityPoint[];
}

interface SymbolState {
	qty: number;
	avgPrice: number;
	realizedPnl: number;
}

function round4(value: number): number {
	return Math.round(value * 10000) / 10000;
}

function clampNonNegative(value: number): number {
	return Number.isFinite(value) && value > 0 ? value : 0;
}

function orderTimestamp(order: PaperOrder): number {
	const value = order.executedAt || order.updatedAt || order.createdAt;
	const parsed = Date.parse(value);
	return Number.isFinite(parsed) ? parsed : 0;
}

function orderFillPrice(order: PaperOrder): number {
	const filled = Number(order.filledPrice);
	if (Number.isFinite(filled) && filled > 0) return filled;
	return clampNonNegative(Number(order.entryPrice));
}

function updateStateForBuy(
	state: SymbolState,
	quantity: number,
	price: number,
	closedPnls: number[],
): void {
	if (state.qty >= 0) {
		const nextQty = state.qty + quantity;
		state.avgPrice = nextQty > 0 ? (state.avgPrice * state.qty + price * quantity) / nextQty : 0;
		state.qty = nextQty;
		return;
	}

	const closeQty = Math.min(quantity, Math.abs(state.qty));
	if (closeQty > 0) {
		const pnl = (state.avgPrice - price) * closeQty;
		state.realizedPnl += pnl;
		closedPnls.push(pnl);
		state.qty += closeQty;
	}

	const remainingQty = quantity - closeQty;
	if (state.qty === 0) {
		state.avgPrice = 0;
	}
	if (remainingQty > 0) {
		state.qty += remainingQty;
		state.avgPrice = price;
	}
}

function updateStateForSell(
	state: SymbolState,
	quantity: number,
	price: number,
	closedPnls: number[],
): void {
	if (state.qty <= 0) {
		const shortQty = Math.abs(state.qty);
		const nextShortQty = shortQty + quantity;
		state.avgPrice =
			nextShortQty > 0 ? (state.avgPrice * shortQty + price * quantity) / nextShortQty : 0;
		state.qty = -nextShortQty;
		return;
	}

	const closeQty = Math.min(quantity, state.qty);
	if (closeQty > 0) {
		const pnl = (price - state.avgPrice) * closeQty;
		state.realizedPnl += pnl;
		closedPnls.push(pnl);
		state.qty -= closeQty;
	}

	const remainingQty = quantity - closeQty;
	if (state.qty === 0) {
		state.avgPrice = 0;
	}
	if (remainingQty > 0) {
		state.qty -= remainingQty;
		state.avgPrice = price;
	}
}

function computeMaxDrawdown(points: EquityPoint[]): number {
	let peak = Number.NEGATIVE_INFINITY;
	let maxDrawdown = 0;
	for (const point of points) {
		if (point.equity > peak) peak = point.equity;
		const drawdown = peak > 0 ? (peak - point.equity) / peak : 0;
		if (drawdown > maxDrawdown) maxDrawdown = drawdown;
	}
	return maxDrawdown;
}

export function buildPortfolioSnapshot(
	orders: PaperOrder[],
	currentPrices: Record<string, number>,
	initialBalance = 100000,
): PortfolioSnapshot {
	const filledOrders = orders
		.filter((order) => order.status === "filled")
		.sort((a, b) => orderTimestamp(a) - orderTimestamp(b));

	const states = new Map<string, SymbolState>();
	const closedPnls: number[] = [];
	const equityCurve: EquityPoint[] = [];
	let cumulativeRealized = 0;

	for (const order of filledOrders) {
		const qty = clampNonNegative(Number(order.quantity));
		const price = orderFillPrice(order);
		if (qty <= 0 || price <= 0) continue;

		const symbol = order.symbol;
		const state = states.get(symbol) ?? { qty: 0, avgPrice: 0, realizedPnl: 0 };
		const realizedBefore = state.realizedPnl;

		if (order.side === "buy") {
			updateStateForBuy(state, qty, price, closedPnls);
		} else {
			updateStateForSell(state, qty, price, closedPnls);
		}

		states.set(symbol, state);
		const realizedDelta = state.realizedPnl - realizedBefore;
		cumulativeRealized += realizedDelta;

		equityCurve.push({
			time: order.executedAt || order.updatedAt || order.createdAt,
			equity: round4(initialBalance + cumulativeRealized),
			drawdown: 0,
		});
	}

	let realizedTotal = 0;
	let unrealizedTotal = 0;
	let openExposure = 0;
	const positions: PortfolioPosition[] = [];

	for (const [symbol, state] of states.entries()) {
		const currentPriceRaw = Number(currentPrices[symbol]);
		const currentPrice =
			Number.isFinite(currentPriceRaw) && currentPriceRaw > 0 ? currentPriceRaw : undefined;
		const quantity = state.qty;
		let unrealized = 0;

		if (currentPrice !== undefined) {
			if (quantity > 0) {
				unrealized = (currentPrice - state.avgPrice) * quantity;
			} else if (quantity < 0) {
				unrealized = (state.avgPrice - currentPrice) * Math.abs(quantity);
			}
		}

		const marketValue = currentPrice !== undefined ? Math.abs(quantity) * currentPrice : undefined;
		if (marketValue) {
			openExposure += marketValue;
		}

		realizedTotal += state.realizedPnl;
		unrealizedTotal += unrealized;

		positions.push({
			symbol,
			quantity: round4(quantity),
			side: quantity > 0 ? "long" : quantity < 0 ? "short" : "flat",
			averagePrice: round4(state.avgPrice),
			currentPrice: currentPrice ? round4(currentPrice) : undefined,
			marketValue: marketValue ? round4(marketValue) : undefined,
			realizedPnl: round4(state.realizedPnl),
			unrealizedPnl: round4(unrealized),
			totalPnl: round4(state.realizedPnl + unrealized),
		});
	}

	positions.sort((a, b) => (b.marketValue ?? 0) - (a.marketValue ?? 0));

	const totalPnl = realizedTotal + unrealizedTotal;
	const finalEquity = initialBalance + totalPnl;
	equityCurve.push({
		time: new Date().toISOString(),
		equity: round4(finalEquity),
		drawdown: 0,
	});

	let peak = Number.NEGATIVE_INFINITY;
	for (const point of equityCurve) {
		if (point.equity > peak) peak = point.equity;
		point.drawdown = peak > 0 ? round4((peak - point.equity) / peak) : 0;
	}

	const maxDrawdown = computeMaxDrawdown(equityCurve);
	const winningClosed = closedPnls.filter((pnl) => pnl > 0).length;
	const winRate = closedPnls.length > 0 ? winningClosed / closedPnls.length : null;

	return {
		generatedAt: new Date().toISOString(),
		positions,
		metrics: {
			initialBalance: round4(initialBalance),
			filledOrders: filledOrders.length,
			openPositions: positions.filter((position) => position.quantity !== 0).length,
			realizedPnl: round4(realizedTotal),
			unrealizedPnl: round4(unrealizedTotal),
			totalPnl: round4(totalPnl),
			openExposure: round4(openExposure),
			winRate: winRate === null ? null : round4(winRate),
			maxDrawdown: round4(maxDrawdown),
		},
		equityCurve,
	};
}
