// Alert System Types

export type AlertCondition = 'above' | 'below' | 'crosses_up' | 'crosses_down';

export type AlertStatus = 'active' | 'triggered' | 'disabled';

export interface PriceAlert {
  id: string;
  symbol: string;
  condition: AlertCondition;
  targetPrice: number;
  currentPrice?: number;
  enabled: boolean;
  status: AlertStatus;
  triggered: boolean;
  triggeredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  message?: string;
}

export interface AlertNotification {
  id: string;
  alertId: string;
  symbol: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface CreateAlertInput {
  symbol: string;
  condition: AlertCondition;
  targetPrice: number;
}

export interface AlertsState {
  alerts: PriceAlert[];
  notifications: AlertNotification[];
}

// Helper functions
export function generateAlertId(): string {
  return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function checkAlertCondition(
  currentPrice: number,
  previousPrice: number,
  alert: PriceAlert
): boolean {
  switch (alert.condition) {
    case 'above':
      return currentPrice > alert.targetPrice && previousPrice <= alert.targetPrice;
    case 'below':
      return currentPrice < alert.targetPrice && previousPrice >= alert.targetPrice;
    case 'crosses_up':
      return currentPrice > alert.targetPrice;
    case 'crosses_down':
      return currentPrice < alert.targetPrice;
    default:
      return false;
  }
}

export function getAlertMessage(alert: PriceAlert, currentPrice: number): string {
  const direction = alert.condition === 'above' || alert.condition === 'crosses_up' ? 'above' : 'below';
  return `${alert.symbol} is now ${direction} $${alert.targetPrice.toFixed(2)} (Current: $${currentPrice.toFixed(2)})`;
}

export function formatAlertCondition(condition: AlertCondition): string {
  const labels: Record<AlertCondition, string> = {
    above: 'Price Above',
    below: 'Price Below',
    crosses_up: 'Crosses Up',
    crosses_down: 'Crosses Down',
  };
  return labels[condition];
}
