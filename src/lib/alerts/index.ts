// Price Alert Types and Storage

export type AlertCondition = 'above' | 'below' | 'crosses_up' | 'crosses_down' | 'rsi_overbought' | 'rsi_oversold';

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

export interface AlertNotification {
  id: string;
  alertId: string;
  symbol: string;
  message: string;
  timestamp: number;
  read: boolean;
}

const STORAGE_KEY = 'tradeview_alerts';
const NOTIFICATIONS_KEY = 'tradeview_notifications';

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Get all alerts from localStorage
export function getAlerts(): PriceAlert[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save alerts to localStorage
export function saveAlerts(alerts: PriceAlert[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
  } catch (error) {
    console.error('Failed to save alerts:', error);
  }
}

// Create a new alert
export function createAlert(
  symbol: string,
  condition: AlertCondition,
  targetValue: number,
  message?: string
): PriceAlert {
  const alert: PriceAlert = {
    id: generateId(),
    symbol,
    condition,
    targetValue,
    enabled: true,
    triggered: false,
    createdAt: Date.now(),
    message,
  };
  
  const alerts = getAlerts();
  alerts.push(alert);
  saveAlerts(alerts);
  
  return alert;
}

// Update an alert
export function updateAlert(id: string, updates: Partial<PriceAlert>): PriceAlert | null {
  const alerts = getAlerts();
  const index = alerts.findIndex(a => a.id === id);
  
  if (index === -1) return null;
  
  alerts[index] = { ...alerts[index], ...updates };
  saveAlerts(alerts);
  
  return alerts[index];
}

// Delete an alert
export function deleteAlert(id: string): boolean {
  const alerts = getAlerts();
  const filtered = alerts.filter(a => a.id !== id);
  
  if (filtered.length === alerts.length) return false;
  
  saveAlerts(filtered);
  return true;
}

// Get notifications
export function getNotifications(): AlertNotification[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save notifications
export function saveNotifications(notifications: AlertNotification[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Keep only last 100 notifications
    const trimmed = notifications.slice(-100);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to save notifications:', error);
  }
}

// Create notification
export function createNotification(
  alertId: string,
  symbol: string,
  message: string
): AlertNotification {
  const notification: AlertNotification = {
    id: generateId(),
    alertId,
    symbol,
    message,
    timestamp: Date.now(),
    read: false,
  };
  
  const notifications = getNotifications();
  notifications.push(notification);
  saveNotifications(notifications);
  
  return notification;
}

// Mark notification as read
export function markNotificationRead(id: string): void {
  const notifications = getNotifications();
  const notification = notifications.find(n => n.id === id);
  if (notification) {
    notification.read = true;
    saveNotifications(notifications);
  }
}

// Mark all notifications as read
export function markAllNotificationsRead(): void {
  const notifications = getNotifications();
  notifications.forEach(n => n.read = true);
  saveNotifications(notifications);
}

// Clear all notifications
export function clearAllNotifications(): void {
  saveNotifications([]);
}

// Check alerts against current price
export function checkAlerts(
  symbol: string,
  currentPrice: number,
  previousPrice: number,
  rsi?: number
): AlertNotification[] {
  const alerts = getAlerts();
  const notifications: AlertNotification[] = [];
  
  for (const alert of alerts) {
    if (alert.symbol !== symbol || !alert.enabled || alert.triggered) continue;
    
    let triggered = false;
    let message = '';
    
    switch (alert.condition) {
      case 'above':
        if (currentPrice >= alert.targetValue) {
          triggered = true;
          message = `${symbol} is now above ${alert.targetValue} (current: ${currentPrice.toFixed(2)})`;
        }
        break;
        
      case 'below':
        if (currentPrice <= alert.targetValue) {
          triggered = true;
          message = `${symbol} is now below ${alert.targetValue} (current: ${currentPrice.toFixed(2)})`;
        }
        break;
        
      case 'crosses_up':
        if (previousPrice < alert.targetValue && currentPrice >= alert.targetValue) {
          triggered = true;
          message = `${symbol} crossed above ${alert.targetValue}`;
        }
        break;
        
      case 'crosses_down':
        if (previousPrice > alert.targetValue && currentPrice <= alert.targetValue) {
          triggered = true;
          message = `${symbol} crossed below ${alert.targetValue}`;
        }
        break;
        
      case 'rsi_overbought':
        if (rsi !== undefined && rsi >= alert.targetValue) {
          triggered = true;
          message = `${symbol} RSI is overbought (${rsi.toFixed(1)})`;
        }
        break;
        
      case 'rsi_oversold':
        if (rsi !== undefined && rsi <= alert.targetValue) {
          triggered = true;
          message = `${symbol} RSI is oversold (${rsi.toFixed(1)})`;
        }
        break;
    }
    
    if (triggered) {
      alert.triggered = true;
      alert.triggeredAt = Date.now();
      
      const notification = createNotification(alert.id, symbol, message);
      notifications.push(notification);
    }
  }
  
  saveAlerts(alerts);
  return notifications;
}

// Get unread notification count
export function getUnreadCount(): number {
  const notifications = getNotifications();
  return notifications.filter(n => !n.read).length;
}

// Reset triggered alerts (for re-triggering)
export function resetTriggeredAlerts(): void {
  const alerts = getAlerts();
  alerts.forEach(a => {
    a.triggered = false;
    a.triggeredAt = undefined;
  });
  saveAlerts(alerts);
}
