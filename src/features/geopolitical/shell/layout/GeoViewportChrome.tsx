"use client";

import { PencilRuler } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface GeoViewportChromeProps {
	showFiltersToolbar: boolean;
	filtersToolbar: ReactNode;
	bulkSelectionBar: ReactNode | null;
	onOpenMarkerList: () => void;
	drawToolsRightOffset: number;
	drawToolsOpen: boolean;
	onToggleDrawTools: () => void;
	drawToolsPanel: ReactNode | null;
}

export function GeoViewportChrome({
	showFiltersToolbar,
	filtersToolbar,
	bulkSelectionBar,
	onOpenMarkerList,
	drawToolsRightOffset,
	drawToolsOpen,
	onToggleDrawTools,
	drawToolsPanel,
}: GeoViewportChromeProps) {
	return (
		<div className="pointer-events-none absolute inset-0 z-20">
			{showFiltersToolbar ? (
				<div className="pointer-events-auto absolute left-3 right-3 top-3">{filtersToolbar}</div>
			) : null}
			{bulkSelectionBar ? (
				<div className="pointer-events-auto absolute left-3 top-[6.75rem]">{bulkSelectionBar}</div>
			) : null}
			<div className="pointer-events-auto absolute right-3 top-3 z-40">
				<Button
					type="button"
					size="sm"
					variant="secondary"
					className="h-9 border border-border/70 bg-card/90 shadow-lg backdrop-blur"
					onClick={onOpenMarkerList}
					aria-label="Open marker list"
				>
					Marker List
				</Button>
			</div>
			<div
				className="pointer-events-auto absolute top-[6.75rem] z-40"
				style={{ right: drawToolsRightOffset }}
			>
				<Button
					type="button"
					size="sm"
					variant="secondary"
					className="h-9 border border-border/70 bg-card/90 shadow-lg backdrop-blur"
					onClick={onToggleDrawTools}
					aria-expanded={drawToolsOpen}
					aria-label="Toggle drawing tools"
					title={drawToolsOpen ? "Hide drawing tools" : "Show drawing tools"}
				>
					<PencilRuler className="h-4 w-4" />
				</Button>
				{drawToolsOpen && drawToolsPanel ? (
					<div className="mt-2 max-w-[19rem] rounded-lg border border-border/70 bg-card/95 p-2 shadow-xl backdrop-blur">
						{drawToolsPanel}
					</div>
				) : null}
			</div>
		</div>
	);
}
