export type OrderSide = "buy" | "sell";
export type OrderType = "market" | "limit" | "stop" | "stop_limit";
export type OrderStatus = "open" | "filled" | "cancelled";

export interface PaperOrder {
	id: string;
	profileKey: string;
	symbol: string;
	side: OrderSide;
	type: OrderType;
	quantity: number;
	entryPrice: number;
	stopLoss?: number;
	takeProfit?: number;
	status: OrderStatus;
	filledPrice?: number;
	executedAt?: string;
	createdAt: string;
	updatedAt: string;
}

export interface CreatePaperOrderInput {
	profileKey: string;
	symbol: string;
	side: OrderSide;
	type: OrderType;
	quantity: number;
	entryPrice: number;
	stopLoss?: number;
	takeProfit?: number;
}
