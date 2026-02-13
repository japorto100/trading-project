'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Bell, 
  BellRing, 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Check,
  X
} from 'lucide-react';
import {
  PriceAlert,
  AlertNotification,
  AlertCondition,
  getAlerts,
  saveAlerts,
  createAlert,
  deleteAlert,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  clearAllNotifications,
  getUnreadCount,
} from '@/lib/alerts';

const CONDITION_LABELS: Record<AlertCondition, string> = {
  above: 'Price goes above',
  below: 'Price goes below',
  crosses_up: 'Price crosses up',
  crosses_down: 'Price crosses down',
  rsi_overbought: 'RSI above',
  rsi_oversold: 'RSI below',
};

// Helper to safely get initial data
function getInitialAlerts(): PriceAlert[] {
  if (typeof window === 'undefined') return [];
  return getAlerts();
}

function getInitialNotifications(): AlertNotification[] {
  if (typeof window === 'undefined') return [];
  return getNotifications();
}

function getInitialUnreadCount(): number {
  if (typeof window === 'undefined') return 0;
  return getUnreadCount();
}

export function AlertPanel() {
  const [alerts, setAlerts] = useState<PriceAlert[]>(getInitialAlerts);
  const [notifications, setNotifications] = useState<AlertNotification[]>(getInitialNotifications);
  const [unreadCount, setUnreadCount] = useState(getInitialUnreadCount);
  const [showCreate, setShowCreate] = useState(false);
  const [newAlert, setNewAlert] = useState({
    symbol: 'BTC/USD',
    condition: 'above' as AlertCondition,
    targetValue: '',
    message: '',
  });

  const handleCreateAlert = () => {
    const targetValue = parseFloat(newAlert.targetValue);
    if (isNaN(targetValue)) return;

    createAlert(
      newAlert.symbol,
      newAlert.condition,
      targetValue,
      newAlert.message || undefined
    );

    setAlerts(getAlerts());
    setShowCreate(false);
    setNewAlert({
      symbol: 'BTC/USD',
      condition: 'above',
      targetValue: '',
      message: '',
    });
  };

  const handleDeleteAlert = (id: string) => {
    deleteAlert(id);
    setAlerts(getAlerts());
  };

  const handleToggleAlert = (id: string, enabled: boolean) => {
    const updatedAlerts = alerts.map(a => 
      a.id === id ? { ...a, enabled } : a
    );
    saveAlerts(updatedAlerts);
    setAlerts(updatedAlerts);
  };

  const handleMarkRead = (id: string) => {
    markNotificationRead(id);
    setNotifications(getNotifications());
    setUnreadCount(getUnreadCount());
  };

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
    setNotifications(getNotifications());
    setUnreadCount(0);
  };

  const handleClearNotifications = () => {
    clearAllNotifications();
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 relative">
          {unreadCount > 0 ? (
            <BellRing className="h-4 w-4" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:max-w-[400px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alerts & Notifications
          </SheetTitle>
          <SheetDescription>
            Manage price alerts and view notifications
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Notifications Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Notifications</h3>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleMarkAllRead}
                  disabled={unreadCount === 0}
                >
                  <Check className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClearNotifications}
                  disabled={notifications.length === 0}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              </div>
            </div>
            
            <ScrollArea className="h-[200px]">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No notifications
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.slice().reverse().map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border border-border ${
                        notification.read ? 'bg-card/30' : 'bg-card/70'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-sm">{notification.symbol}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {notification.message}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(notification.timestamp).toLocaleString()}
                          </div>
                        </div>
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkRead(notification.id)}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          <Separator />

          {/* Alerts Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Price Alerts</h3>
              <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-3 w-3 mr-1" />
                    New Alert
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Price Alert</DialogTitle>
                    <DialogDescription>
                      Get notified when price reaches your target
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Symbol</Label>
                      <Input
                        placeholder="BTC/USD"
                        value={newAlert.symbol}
                        onChange={(e) => setNewAlert({ ...newAlert, symbol: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Condition</Label>
                      <Select
                        value={newAlert.condition}
                        onValueChange={(value) => setNewAlert({ ...newAlert, condition: value as AlertCondition })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(CONDITION_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Target Value</Label>
                      <Input
                        type="number"
                        placeholder="70000"
                        value={newAlert.targetValue}
                        onChange={(e) => setNewAlert({ ...newAlert, targetValue: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Message (optional)</Label>
                      <Input
                        placeholder="Custom alert message"
                        value={newAlert.message}
                        onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
                      />
                    </div>
                    <Button onClick={handleCreateAlert} className="w-full">
                      Create Alert
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <ScrollArea className="h-[250px]">
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No alerts configured
                </div>
              ) : (
                <div className="space-y-2">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-lg border border-border ${
                        alert.triggered ? 'bg-amber-500/10 border-amber-500/50' : 'bg-card/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{alert.symbol}</span>
                            {alert.triggered && (
                              <Badge variant="outline" className="text-xs border-amber-500 text-amber-500">
                                Triggered
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            {alert.condition.includes('above') || alert.condition === 'crosses_up' ? (
                              <TrendingUp className="h-3 w-3 text-emerald-500" />
                            ) : alert.condition.includes('below') || alert.condition === 'crosses_down' ? (
                              <TrendingDown className="h-3 w-3 text-red-500" />
                            ) : (
                              <Activity className="h-3 w-3 text-purple-500" />
                            )}
                            {CONDITION_LABELS[alert.condition]} {alert.targetValue}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleAlert(alert.id, !alert.enabled)}
                          >
                            {alert.enabled ? (
                              <Bell className="h-3 w-3" />
                            ) : (
                              <BellOff className="h-3 w-3 text-muted-foreground" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAlert(alert.id)}
                          >
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// BellOff icon component
function BellOff({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M10.268 21a2 2 0 0 0 3.464 0" />
      <path d="M3.262 15.326A1 1 0 0 0 4.26 17h14.016a1 1 0 0 0 .998-1.674L13.49 5.083a1 1 0 0 0-1.98 0L3.262 15.326z" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

export default AlertPanel;
