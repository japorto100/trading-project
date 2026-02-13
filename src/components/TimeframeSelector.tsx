'use client';

import { TIMEFRAMES, TimeframeValue } from '@/lib/chartData';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface TimeframeSelectorProps {
  currentTimeframe: TimeframeValue;
  onTimeframeChange: (timeframe: TimeframeValue) => void;
}

export function TimeframeSelector({ currentTimeframe, onTimeframeChange }: TimeframeSelectorProps) {
  return (
    <ToggleGroup
      type="single"
      value={currentTimeframe}
      onValueChange={(value) => {
        if (value) onTimeframeChange(value as TimeframeValue);
      }}
      className="bg-background/50 border border-border rounded-lg p-1 gap-0.5"
    >
      {TIMEFRAMES.map((tf) => (
        <ToggleGroupItem
          key={tf.value}
          value={tf.value}
          aria-label={tf.label}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
            currentTimeframe === tf.value
              ? 'bg-emerald-500 text-white hover:bg-emerald-600'
              : 'hover:bg-accent'
          }`}
        >
          {tf.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
