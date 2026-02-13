'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import {
  TrendingUp,
  Minus,
  Square,
  Hexagon,
  Type,
  Ruler,
  ArrowRight,
  Circle,
  Undo2,
  Redo2,
  Trash2,
  Lock,
  Unlock,
  PenLine,
} from 'lucide-react';
import { DrawingType } from '@/chart/types';

interface DrawingToolbarProps {
  activeTool?: DrawingType;
  onToolChange?: (tool: DrawingType | null) => void;
}

const TOOLS: Array<{ type: DrawingType; icon: React.ReactNode; label: string; shortcut: string }> = [
  { type: 'trendline', icon: <TrendingUp className="h-4 w-4" />, label: 'Trend Line', shortcut: 'T' },
  { type: 'horizontalline', icon: <Minus className="h-4 w-4" />, label: 'Horizontal Line', shortcut: 'H' },
  { type: 'verticalline', icon: <Minus className="h-4 w-4 rotate-90" />, label: 'Vertical Line', shortcut: 'V' },
  { type: 'rectangle', icon: <Square className="h-4 w-4" />, label: 'Rectangle', shortcut: 'R' },
  { type: 'fibonacci', icon: <Hexagon className="h-4 w-4" />, label: 'Fibonacci', shortcut: 'F' },
  { type: 'text', icon: <Type className="h-4 w-4" />, label: 'Text', shortcut: 'X' },
  { type: 'measure', icon: <Ruler className="h-4 w-4" />, label: 'Measure', shortcut: 'M' },
  { type: 'arrow', icon: <ArrowRight className="h-4 w-4" />, label: 'Arrow', shortcut: 'A' },
  { type: 'circle', icon: <Circle className="h-4 w-4" />, label: 'Circle', shortcut: 'C' },
];

export function DrawingToolbar({ activeTool, onToolChange }: DrawingToolbarProps) {
  const [tool, setTool] = useState<DrawingType | null>(activeTool || null);
  const [locked, setLocked] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const handleToolSelect = (type: DrawingType | null) => {
    setTool(type);
    onToolChange?.(type);
  };

  const handleUndo = () => {
    // Implement undo
    console.log('Undo');
  };

  const handleRedo = () => {
    // Implement redo
    console.log('Redo');
  };

  const handleDeleteAll = () => {
    // Implement delete all
    console.log('Delete all');
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 p-2 border-b border-border bg-card/50">
        {/* Drawing Tools */}
        <div className="flex items-center gap-0.5">
          {TOOLS.map((t) => (
            <Tooltip key={t.type}>
              <TooltipTrigger asChild>
                <Button
                  variant={tool === t.type ? 'default' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleToolSelect(tool === t.type ? null : t.type)}
                >
                  {t.icon}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{t.label} ({t.shortcut})</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        <Separator orientation="vertical" className="h-6 mx-2" />

        {/* Undo/Redo */}
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleUndo}
                disabled={!canUndo}
              >
                <Undo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Undo (Ctrl+Z)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleRedo}
                disabled={!canRedo}
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Redo (Ctrl+Y)</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 mx-2" />

        {/* Lock/Unlock */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setLocked(!locked)}
            >
              {locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{locked ? 'Unlock Drawings' : 'Lock Drawings'}</p>
          </TooltipContent>
        </Tooltip>

        {/* Delete All */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-600"
              onClick={handleDeleteAll}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Delete All Drawings</p>
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-6 mx-2" />

        {/* Active Tool Info */}
        {tool && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <PenLine className="h-4 w-4" />
            <span className="capitalize">{tool.replace(/([A-Z])/g, ' $1')}</span>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

export default DrawingToolbar;
