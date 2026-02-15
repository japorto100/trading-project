"use client";

import {
	ArrowRight,
	Circle,
	Hexagon,
	Lock,
	Minus,
	PenLine,
	Redo2,
	Ruler,
	Square,
	Trash2,
	TrendingUp,
	Type,
	Undo2,
	Unlock,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { DrawingType } from "@/chart/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DrawingToolbarProps {
	activeTool?: DrawingType;
	onToolChange?: (tool: DrawingType | null) => void;
	canUndo?: boolean;
	canRedo?: boolean;
	onUndo?: () => void;
	onRedo?: () => void;
	onDeleteAll?: () => void;
}

const TOOLS: Array<{ type: DrawingType; icon: React.ReactNode; label: string; shortcut: string }> =
	[
		{
			type: "trendline",
			icon: <TrendingUp className="h-4 w-4" />,
			label: "Trend Line",
			shortcut: "T",
		},
		{
			type: "horizontalline",
			icon: <Minus className="h-4 w-4" />,
			label: "Horizontal Line",
			shortcut: "H",
		},
		{
			type: "verticalline",
			icon: <Minus className="h-4 w-4 rotate-90" />,
			label: "Vertical Line",
			shortcut: "V",
		},
		{ type: "rectangle", icon: <Square className="h-4 w-4" />, label: "Rectangle", shortcut: "R" },
		{ type: "fibonacci", icon: <Hexagon className="h-4 w-4" />, label: "Fibonacci", shortcut: "F" },
		{ type: "text", icon: <Type className="h-4 w-4" />, label: "Text", shortcut: "X" },
		{ type: "measure", icon: <Ruler className="h-4 w-4" />, label: "Measure", shortcut: "M" },
		{ type: "arrow", icon: <ArrowRight className="h-4 w-4" />, label: "Arrow", shortcut: "A" },
		{ type: "circle", icon: <Circle className="h-4 w-4" />, label: "Circle", shortcut: "C" },
	];

export function DrawingToolbar({
	activeTool,
	onToolChange,
	canUndo = false,
	canRedo = false,
	onUndo,
	onRedo,
	onDeleteAll,
}: DrawingToolbarProps) {
	const [tool, setTool] = useState<DrawingType | null>(activeTool || null);
	const [locked, setLocked] = useState(false);

	const handleToolSelect = (type: DrawingType | null) => {
		setTool(type);
		onToolChange?.(type);
	};

	const handleUndo = useCallback(() => {
		if (!canUndo) return;
		onUndo?.();
	}, [canUndo, onUndo]);

	const handleRedo = useCallback(() => {
		if (!canRedo) return;
		onRedo?.();
	}, [canRedo, onRedo]);

	const handleDeleteAll = () => {
		onDeleteAll?.();
	};

	useEffect(() => {
		if (typeof window === "undefined") return;
		const onKeyDown = (event: KeyboardEvent) => {
			const target = event.target as HTMLElement | null;
			const tagName = target?.tagName?.toLowerCase();
			const isEditable =
				target?.isContentEditable ||
				tagName === "input" ||
				tagName === "textarea" ||
				tagName === "select";
			if (isEditable) return;

			const key = event.key.toLowerCase();
			if ((event.ctrlKey || event.metaKey) && key === "z") {
				event.preventDefault();
				if (event.shiftKey) {
					handleRedo();
				} else {
					handleUndo();
				}
				return;
			}
			if ((event.ctrlKey || event.metaKey) && key === "y") {
				event.preventDefault();
				handleRedo();
			}
		};

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [handleRedo, handleUndo]);

	return (
		<TooltipProvider>
			<div className="flex items-center gap-1 p-2 border-b border-border bg-card/50">
				{/* Drawing Tools */}
				<div className="flex items-center gap-0.5">
					{TOOLS.map((t) => (
						<Tooltip key={t.type}>
							<TooltipTrigger asChild>
								<Button
									variant={tool === t.type ? "default" : "ghost"}
									size="icon"
									className="h-8 w-8"
									onClick={() => handleToolSelect(tool === t.type ? null : t.type)}
								>
									{t.icon}
								</Button>
							</TooltipTrigger>
							<TooltipContent side="bottom">
								<p>
									{t.label} ({t.shortcut})
								</p>
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
						<p>{locked ? "Unlock Drawings" : "Lock Drawings"}</p>
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
						<span className="capitalize">{tool.replace(/([A-Z])/g, " $1")}</span>
					</div>
				)}
			</div>
		</TooltipProvider>
	);
}

export default DrawingToolbar;
