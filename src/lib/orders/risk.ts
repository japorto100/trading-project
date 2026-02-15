export interface PositionSizingInput {
	balance: number;
	riskPercent: number;
	entryPrice: number;
	stopPrice: number;
	feePercent?: number;
	slippagePercent?: number;
	atr?: number;
	atrMultiplier?: number;
}

export interface PositionSizingResult {
	riskAmount: number;
	effectiveStopDistance: number;
	effectiveStopDistancePercent: number;
	costPerUnit: number;
	recommendedQuantity: number;
	recommendedNotional: number;
}

function round(value: number): number {
	return Math.round(value * 1000000) / 1000000;
}

export function calculatePositionSize(input: PositionSizingInput): PositionSizingResult {
	const feePercent = Number.isFinite(input.feePercent) ? Math.max(0, Number(input.feePercent)) : 0;
	const slippagePercent = Number.isFinite(input.slippagePercent)
		? Math.max(0, Number(input.slippagePercent))
		: 0;
	const rawStopDistance = Math.abs(Number(input.entryPrice) - Number(input.stopPrice));
	const atr = Number.isFinite(input.atr) ? Math.max(0, Number(input.atr)) : 0;
	const atrMultiplier = Number.isFinite(input.atrMultiplier)
		? Math.max(0, Number(input.atrMultiplier))
		: 0;
	const atrStopDistance = atr > 0 && atrMultiplier > 0 ? atr * atrMultiplier : 0;
	const effectiveStopDistance = Math.max(rawStopDistance, atrStopDistance);

	const entryPrice = Math.max(0, Number(input.entryPrice));
	const balance = Math.max(0, Number(input.balance));
	const riskPercent = Math.max(0, Number(input.riskPercent));
	const riskAmount = balance * (riskPercent / 100);

	const transactionCostPerUnit = entryPrice * ((feePercent + slippagePercent) / 100);
	const costPerUnit = effectiveStopDistance + transactionCostPerUnit;
	const quantity = costPerUnit > 0 ? riskAmount / costPerUnit : 0;
	const notional = quantity * entryPrice;
	const stopDistancePercent = entryPrice > 0 ? (effectiveStopDistance / entryPrice) * 100 : 0;

	return {
		riskAmount: round(riskAmount),
		effectiveStopDistance: round(effectiveStopDistance),
		effectiveStopDistancePercent: round(stopDistancePercent),
		costPerUnit: round(costPerUnit),
		recommendedQuantity: round(quantity),
		recommendedNotional: round(notional),
	};
}
