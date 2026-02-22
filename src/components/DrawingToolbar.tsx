"use client";

import {
	ArrowRight,
	Circle,
	Eye,
	EyeOff,
	Hexagon,
	Lock,
	Magnet,
	Minus,
	MousePointer2,
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type MagnetMode = "normal" | "weak" | "strong";

interface DrawingToolbarProps {
	activeTool?: DrawingType;
	onToolChange?: (tool: DrawingType | null) => void;
	locked?: boolean;
	onLockChange?: (locked: boolean) => void;
	visible?: boolean;
	onVisibleChange?: (visible: boolean) => void;
	magnetMode?: MagnetMode;
	onMagnetModeChange?: (mode: MagnetMode) => void;
	canUndo?: boolean;
	canRedo?: boolean;
	onUndo?: () => void;
	onRedo?: () => void;
	onDeleteAll?: () => void;
	persistKey?: string;
}

const QUICK_TOOLS: DrawingType[] = ["trendline", "horizontalline", "rectangle", "fibonacci"];
const EXTRA_TOOLS: DrawingType[] = ["verticalline", "arrow", "circle", "measure", "text"];

const TOOL_INFO: Record<DrawingType, { label: string; shortcut: string }> = {
	trendline: { label: "Trend Line", shortcut: "T" },
	horizontalline: { label: "Horizontal Line", shortcut: "H" },
	verticalline: { label: "Vertical Line", shortcut: "V" },
	rectangle: { label: "Rectangle", shortcut: "R" },
	fibonacci: { label: "Fibonacci", shortcut: "F" },
	fibextension: { label: "Fib Extension", shortcut: "-" },
	pitchfork: { label: "Pitchfork", shortcut: "-" },
	text: { label: "Text", shortcut: "X" },
	measure: { label: "Measure", shortcut: "M" },
	arrow: { label: "Arrow", shortcut: "A" },
	circle: { label: "Circle", shortcut: "C" },
};

const TOOL_SHORTCUTS: Partial<Record<string, DrawingType>> = {
	t: "trendline",
	h: "horizontalline",
	v: "verticalline",
	r: "rectangle",
	f: "fibonacci",
	x: "text",
	m: "measure",
	a: "arrow",
	c: "circle",
};

const DEFAULT_PERSIST_KEY = "fusion:drawing-toolbar:v1";

function renderToolIcon(type: DrawingType) {
	switch (type) {
		case "trendline":
			return <TrendingUp className="h-4 w-4" />;
		case "horizontalline":
			return <Minus className="h-4 w-4" />;
		case "verticalline":
			return <Minus className="h-4 w-4 rotate-90" />;
		case "rectangle":
			return <Square className="h-4 w-4" />;
		case "fibonacci":
			return <Hexagon className="h-4 w-4" />;
		case "text":
			return <Type className="h-4 w-4" />;
		case "measure":
			return <Ruler className="h-4 w-4" />;
		case "arrow":
			return <ArrowRight className="h-4 w-4" />;
		case "circle":
			return <Circle className="h-4 w-4" />;
		default:
			return <PenLine className="h-4 w-4" />;
	}
}

export function DrawingToolbar({
	activeTool,
	onToolChange,
	locked,
	onLockChange,
	visible,
	onVisibleChange,
	magnetMode,
	onMagnetModeChange,
	canUndo = false,
	canRedo = false,
	onUndo,
	onRedo,
	onDeleteAll,
	persistKey = DEFAULT_PERSIST_KEY,
}: DrawingToolbarProps) {
	const [tool, setTool] = useState<DrawingType | null>(activeTool ?? null);
	const [isLocked, setIsLocked] = useState(locked ?? false);
	const [isVisible, setIsVisible] = useState(visible ?? true);
	const [mode, setMode] = useState<MagnetMode>(magnetMode ?? "normal");

	useEffect(() => {
		if (activeTool !== undefined) {
			setTool(activeTool);
		}
	}, [activeTool]);

	useEffect(() => {
		if (locked !== undefined) {
			setIsLocked(locked);
		}
	}, [locked]);

	useEffect(() => {
		if (visible !== undefined) {
			setIsVisible(visible);
		}
	}, [visible]);

	useEffect(() => {
		if (magnetMode !== undefined) {
			setMode(magnetMode);
		}
	}, [magnetMode]);

	useEffect(() => {
		if (typeof window === "undefined") return;
		try {
			const raw = window.localStorage.getItem(persistKey);
			if (!raw) return;
			const parsed = JSON.parse(raw) as {
				tool?: DrawingType | null;
				locked?: boolean;
				visible?: boolean;
				magnetMode?: MagnetMode;
			};
			if (parsed.tool !== undefined) {
				setTool(parsed.tool);
				onToolChange?.(parsed.tool);
			}
			if (typeof parsed.locked === "boolean") {
				setIsLocked(parsed.locked);
				onLockChange?.(parsed.locked);
			}
			if (typeof parsed.visible === "boolean") {
				setIsVisible(parsed.visible);
				onVisibleChange?.(parsed.visible);
			}
			if (
				parsed.magnetMode === "normal" ||
				parsed.magnetMode === "weak" ||
				parsed.magnetMode === "strong"
			) {
				setMode(parsed.magnetMode);
				onMagnetModeChange?.(parsed.magnetMode);
			}
		} catch {
			// keep defaults when persisted state is invalid
		}
	}, [onLockChange, onMagnetModeChange, onToolChange, onVisibleChange, persistKey]);

	useEffect(() => {
		if (typeof window === "undefined") return;
		const payload = JSON.stringify({
			tool,
			locked: isLocked,
			visible: isVisible,
			magnetMode: mode,
		});
		window.localStorage.setItem(persistKey, payload);
	}, [isLocked, isVisible, mode, persistKey, tool]);

	const handleToolSelect = useCallback(
		(next: DrawingType | null) => {
			setTool(next);
			onToolChange?.(next);
		},
		[onToolChange],
	);

	const handleUndo = useCallback(() => {
		if (!canUndo) return;
		onUndo?.();
	}, [canUndo, onUndo]);

	const handleRedo = useCallback(() => {
		if (!canRedo) return;
		onRedo?.();
	}, [canRedo, onRedo]);

	const toggleLock = useCallback(() => {
		const next = !isLocked;
		setIsLocked(next);
		onLockChange?.(next);
	}, [isLocked, onLockChange]);

	const toggleVisible = useCallback(() => {
		const next = !isVisible;
		setIsVisible(next);
		onVisibleChange?.(next);
	}, [isVisible, onVisibleChange]);

	const cycleMagnetMode = useCallback(() => {
		const next: MagnetMode = mode === "normal" ? "weak" : mode === "weak" ? "strong" : "normal";
		setMode(next);
		onMagnetModeChange?.(next);
	}, [mode, onMagnetModeChange]);

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
				return;
			}
			if (event.ctrlKey || event.metaKey || event.altKey) {
				return;
			}
			if (key === "escape") {
				handleToolSelect(null);
				return;
			}
			const shortcutTool = TOOL_SHORTCUTS[key];
			if (!shortcutTool) return;
			event.preventDefault();
			handleToolSelect(tool === shortcutTool ? null : shortcutTool);
		};

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [handleRedo, handleToolSelect, handleUndo, tool]);

	return (
		<TooltipProvider>
			<div className="flex flex-col items-center gap-2 p-1.5 border-r border-border bg-card/40 backdrop-blur-md h-full w-[42px] py-4">
				<div className="flex flex-col items-center gap-1.5 w-full">
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant={tool === null ? "secondary" : "ghost"}
								size="icon"
								className="h-8 w-8 rounded-md transition-all hover:bg-accent/80"
								onClick={() => handleToolSelect(null)}
							>
								<MousePointer2 className="h-4 w-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent side="right">
							<p>Cursor (Esc)</p>
						</TooltipContent>
					</Tooltip>

					<Separator className="w-6 my-1" />

					{QUICK_TOOLS.map((drawingTool) => (
						<Tooltip key={drawingTool}>
							<TooltipTrigger asChild>
								<Button
									variant={tool === drawingTool ? "default" : "ghost"}
									size="icon"
									className={`h-8 w-8 rounded-md transition-all ${
										tool === drawingTool ? "shadow-md scale-105" : "hover:bg-accent/80"
									}`}
									onClick={() => handleToolSelect(tool === drawingTool ? null : drawingTool)}
								>
									{renderToolIcon(drawingTool)}
								</Button>
							</TooltipTrigger>
							<TooltipContent side="right">
								<p>
									{TOOL_INFO[drawingTool].label} ({TOOL_INFO[drawingTool].shortcut})
								</p>
							</TooltipContent>
						</Tooltip>
					))}

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-accent/80">
								<PenLine className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent side="right" align="start" className="min-w-44 ml-1">
							<DropdownMenuLabel>Drawing Tools</DropdownMenuLabel>
							<DropdownMenuSeparator />
							{EXTRA_TOOLS.map((drawingTool) => (
								<DropdownMenuItem
									key={drawingTool}
									onClick={() => handleToolSelect(tool === drawingTool ? null : drawingTool)}
								>
									<span className="mr-2">{renderToolIcon(drawingTool)}</span>
									<span className="flex-1">{TOOL_INFO[drawingTool].label}</span>
									<Badge variant="outline" className="text-[10px] px-1.5 py-0">
										{TOOL_INFO[drawingTool].shortcut}
									</Badge>
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				<Separator className="w-6 my-1" />

				<div className="flex flex-col items-center gap-1.5 w-full">
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 rounded-md hover:bg-accent/80"
								onClick={handleUndo}
								disabled={!canUndo}
							>
								<Undo2 className="h-4 w-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent side="right">
							<p>Undo (Ctrl+Z)</p>
						</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 rounded-md hover:bg-accent/80"
								onClick={handleRedo}
								disabled={!canRedo}
							>
								<Redo2 className="h-4 w-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent side="right">
							<p>Redo (Ctrl+Y)</p>
						</TooltipContent>
					</Tooltip>
				</div>

				<Separator className="w-6 my-1" />

				<div className="flex flex-col items-center gap-1.5 w-full">
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant={mode === "normal" ? "ghost" : "secondary"}
								size="icon"
								className={`h-8 w-8 rounded-md transition-all ${
									mode !== "normal" ? "text-primary" : "hover:bg-accent/80"
								}`}
								onClick={cycleMagnetMode}
							>
								<Magnet className="h-4 w-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent side="right">
							<p>
								Magnet: {mode} (
								{mode === "normal" ? "off" : mode === "weak" ? "soft snap" : "strong snap"})
							</p>
						</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant={isVisible ? "ghost" : "secondary"}
								size="icon"
								className="h-8 w-8 rounded-md hover:bg-accent/80"
								onClick={toggleVisible}
							>
								{isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
							</Button>
						</TooltipTrigger>
						<TooltipContent side="right">
							<p>{isVisible ? "Hide drawings" : "Show drawings"}</p>
						</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant={isLocked ? "secondary" : "ghost"}
								size="icon"
								className="h-8 w-8 rounded-md hover:bg-accent/80"
								onClick={toggleLock}
							>
								{isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
							</Button>
						</TooltipTrigger>
						<TooltipContent side="right">
							<p>{isLocked ? "Unlock drawings" : "Lock drawings"}</p>
						</TooltipContent>
					</Tooltip>
				</div>

				<div className="mt-auto flex flex-col items-center gap-1.5 w-full">
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 rounded-md text-red-400/80 hover:text-red-500 hover:bg-red-500/10 transition-colors"
								onClick={() => onDeleteAll?.()}
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent side="right">
							<p>Delete all drawings</p>
						</TooltipContent>
					</Tooltip>
				</div>
			</div>
		</TooltipProvider>
	);
}

export default DrawingToolbar;
