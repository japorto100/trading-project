"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { MouseEvent as ReactMouseEvent, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface GeoShellFloatingPanelProps {
	panelId: string;
	persistKey: string;
	side: "left" | "right";
	title: string;
	collapsed: boolean;
	width: number | string;
	bottomOffset: number;
	isMobile: boolean;
	resizable: boolean;
	onToggleCollapsed: () => void;
	onResizeStart: (event: ReactMouseEvent<HTMLDivElement>) => void;
	children: ReactNode;
}

export function GeoShellFloatingPanel({
	panelId,
	persistKey,
	side,
	title,
	collapsed,
	width,
	bottomOffset,
	isMobile,
	resizable,
	onToggleCollapsed,
	onResizeStart,
	children,
}: GeoShellFloatingPanelProps) {
	const isLeft = side === "left";
	const wrapperPositionClass = isLeft ? "left-3" : "right-3";
	const resizeHandleClass = isLeft
		? "absolute bottom-0 right-0 top-0"
		: "absolute bottom-0 left-0 top-0";
	const collapseLabel = collapsed
		? `Expand ${title.toLowerCase()}`
		: `Collapse ${title.toLowerCase()}`;
	const resizeLabel = `Resize ${title.toLowerCase()}`;
	const collapseIcon = collapsed ? (
		isLeft ? (
			<ChevronRight className="h-4 w-4" />
		) : (
			<ChevronLeft className="h-4 w-4" />
		)
	) : isLeft ? (
		<ChevronLeft className="h-4 w-4" />
	) : (
		<ChevronRight className="h-4 w-4" />
	);

	return (
		<div
			className={`pointer-events-auto absolute top-[7.75rem] overflow-hidden rounded-lg border border-border/70 bg-card/85 shadow-xl backdrop-blur ${wrapperPositionClass}`}
			style={{ width, bottom: bottomOffset }}
			data-geo-panel-id={panelId}
			data-geo-panel-persist-key={persistKey}
			data-geo-panel-side={side}
		>
			<div className="flex h-10 items-center justify-between border-b border-border px-2">
				{isLeft ? (
					<>
						<span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
							{title}
						</span>
						<Button
							type="button"
							size="icon"
							variant="ghost"
							className="h-7 w-7"
							onClick={onToggleCollapsed}
							aria-label={collapseLabel}
						>
							{collapseIcon}
						</Button>
					</>
				) : (
					<>
						<Button
							type="button"
							size="icon"
							variant="ghost"
							className="h-7 w-7"
							onClick={onToggleCollapsed}
							aria-label={collapseLabel}
						>
							{collapseIcon}
						</Button>
						<span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
							{title}
						</span>
					</>
				)}
			</div>
			{collapsed ? null : (
				<>
					<div className="h-[calc(100%-2.5rem)] overflow-y-auto">{children}</div>
					{isMobile || !resizable ? null : (
						<div
							className={`${resizeHandleClass} z-30 w-2 cursor-ew-resize`}
							onMouseDown={onResizeStart}
							role="separator"
							aria-label={resizeLabel}
						/>
					)}
				</>
			)}
		</div>
	);
}
