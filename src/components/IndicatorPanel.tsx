'use client';

import { LineChart, Activity, Gauge, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export interface IndicatorSettings {
  sma: { enabled: boolean; period: number };
  ema: { enabled: boolean; period: number };
  rsi: { enabled: boolean; period: number };
  macd?: { enabled: boolean };
  bollinger?: { enabled: boolean; period: number; stdDev: number };
}

interface IndicatorPanelProps {
  indicators: IndicatorSettings;
  onIndicatorsChange: (indicators: IndicatorSettings) => void;
}

const PERIOD_OPTIONS = [5, 10, 20, 50, 100, 200];

export function IndicatorPanel({ indicators, onIndicatorsChange }: IndicatorPanelProps) {
  const updateIndicator = (
    indicator: keyof IndicatorSettings,
    field: string,
    value: boolean | number
  ) => {
    onIndicatorsChange({
      ...indicators,
      [indicator]: {
        ...indicators[indicator],
        [field]: value,
      },
    });
  };

  const activeIndicatorsCount = 
    (indicators.sma.enabled ? 1 : 0) + 
    (indicators.ema.enabled ? 1 : 0) + 
    (indicators.rsi.enabled ? 1 : 0) +
    (indicators.macd?.enabled ? 1 : 0) +
    (indicators.bollinger?.enabled ? 1 : 0);

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 h-8"
          >
            <LineChart className="h-4 w-4" />
            Indicators
            {activeIndicatorsCount > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                {activeIndicatorsCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Technical Indicators</h4>
            <Separator />
            
            {/* SMA */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <Label className="font-medium">SMA</Label>
                  <span className="text-xs text-muted-foreground">Simple Moving Average</span>
                </div>
                <Switch
                  checked={indicators.sma.enabled}
                  onCheckedChange={(checked) => updateIndicator('sma', 'enabled', checked)}
                />
              </div>
              {indicators.sma.enabled && (
                <div className="flex items-center gap-2 pl-5">
                  <span className="text-xs text-muted-foreground">Period:</span>
                  <Select
                    value={indicators.sma.period.toString()}
                    onValueChange={(value) => updateIndicator('sma', 'period', parseInt(value))}
                  >
                    <SelectTrigger className="w-20 h-7">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PERIOD_OPTIONS.map((period) => (
                        <SelectItem key={period} value={period.toString()}>
                          {period}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <Separator />

            {/* EMA */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <Label className="font-medium">EMA</Label>
                  <span className="text-xs text-muted-foreground">Exponential Moving Average</span>
                </div>
                <Switch
                  checked={indicators.ema.enabled}
                  onCheckedChange={(checked) => updateIndicator('ema', 'enabled', checked)}
                />
              </div>
              {indicators.ema.enabled && (
                <div className="flex items-center gap-2 pl-5">
                  <span className="text-xs text-muted-foreground">Period:</span>
                  <Select
                    value={indicators.ema.period.toString()}
                    onValueChange={(value) => updateIndicator('ema', 'period', parseInt(value))}
                  >
                    <SelectTrigger className="w-20 h-7">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PERIOD_OPTIONS.map((period) => (
                        <SelectItem key={period} value={period.toString()}>
                          {period}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <Separator />

            {/* RSI */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <Label className="font-medium">RSI</Label>
                  <span className="text-xs text-muted-foreground">Relative Strength Index</span>
                </div>
                <Switch
                  checked={indicators.rsi.enabled}
                  onCheckedChange={(checked) => updateIndicator('rsi', 'enabled', checked)}
                />
              </div>
              {indicators.rsi.enabled && (
                <div className="flex items-center gap-2 pl-5">
                  <span className="text-xs text-muted-foreground">Period:</span>
                  <Select
                    value={indicators.rsi.period.toString()}
                    onValueChange={(value) => updateIndicator('rsi', 'period', parseInt(value))}
                  >
                    <SelectTrigger className="w-20 h-7">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[7, 14, 21, 28].map((period) => (
                        <SelectItem key={period} value={period.toString()}>
                          {period}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <Separator />

            {/* MACD */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-500" />
                  <Label className="font-medium">MACD</Label>
                  <span className="text-xs text-muted-foreground">Moving Avg Convergence Divergence</span>
                </div>
                <Switch
                  checked={indicators.macd?.enabled || false}
                  onCheckedChange={(checked) => updateIndicator('macd', 'enabled', checked)}
                />
              </div>
            </div>

            <Separator />

            {/* Bollinger Bands */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <Label className="font-medium">BB</Label>
                  <span className="text-xs text-muted-foreground">Bollinger Bands</span>
                </div>
                <Switch
                  checked={indicators.bollinger?.enabled || false}
                  onCheckedChange={(checked) => updateIndicator('bollinger', 'enabled', checked)}
                />
              </div>
              {indicators.bollinger?.enabled && (
                <div className="flex items-center gap-4 pl-5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Period:</span>
                    <Select
                      value={(indicators.bollinger.period || 20).toString()}
                      onValueChange={(value) => updateIndicator('bollinger', 'period', parseInt(value))}
                    >
                      <SelectTrigger className="w-16 h-7">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[10, 20, 30, 50].map((period) => (
                          <SelectItem key={period} value={period.toString()}>
                            {period}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">StdDev:</span>
                    <Select
                      value={(indicators.bollinger.stdDev || 2).toString()}
                      onValueChange={(value) => updateIndicator('bollinger', 'stdDev', parseFloat(value))}
                    >
                      <SelectTrigger className="w-16 h-7">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 1.5, 2, 2.5, 3].map((std) => (
                          <SelectItem key={std} value={std.toString()}>
                            {std}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Indicators Badges */}
      <div className="flex items-center gap-1">
        {indicators.sma.enabled && (
          <Badge 
            variant="outline" 
            className="gap-1 text-xs border-blue-500/50 text-blue-500"
          >
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            SMA {indicators.sma.period}
          </Badge>
        )}
        {indicators.ema.enabled && (
          <Badge 
            variant="outline" 
            className="gap-1 text-xs border-amber-500/50 text-amber-500"
          >
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            EMA {indicators.ema.period}
          </Badge>
        )}
        {indicators.rsi.enabled && (
          <Badge 
            variant="outline" 
            className="gap-1 text-xs border-purple-500/50 text-purple-500"
          >
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            RSI {indicators.rsi.period}
          </Badge>
        )}
        {indicators.macd?.enabled && (
          <Badge 
            variant="outline" 
            className="gap-1 text-xs border-cyan-500/50 text-cyan-500"
          >
            <div className="w-2 h-2 rounded-full bg-cyan-500" />
            MACD
          </Badge>
        )}
        {indicators.bollinger?.enabled && (
          <Badge 
            variant="outline" 
            className="gap-1 text-xs border-rose-500/50 text-rose-500"
          >
            <div className="w-2 h-2 rounded-full bg-rose-500" />
            BB
          </Badge>
        )}
      </div>
    </div>
  );
}
