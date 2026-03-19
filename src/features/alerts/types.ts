export type AlertCondition =
	| "above"
	| "below"
	| "crosses_up"
	| "crosses_down"
	| "rsi_overbought"
	| "rsi_oversold";

export interface PriceAlert {
	id: string;
	symbol: string;
	condition: AlertCondition;
	targetValue: number;
	enabled: boolean;
	triggered: boolean;
	triggeredAt?: number;
	createdAt: number;
	message?: string;
}

export type AlertNotificationKind =
	| "price_alert"
	| "event"
	| "execution"
	| "portfolio"
	| "system"
	| "geopolitical";

export interface AlertNotification {
	id: string;
	alertId: string;
	symbol: string;
	message: string;
	timestamp: number;
	read: boolean;
	kind: AlertNotificationKind;
	targetHref: string;
}

export interface AlertVerificationResult {
	passed: boolean;
	aboveTriggers: number;
	belowTriggers: number;
	duplicateTriggers: number;
	notes: string[];
}
