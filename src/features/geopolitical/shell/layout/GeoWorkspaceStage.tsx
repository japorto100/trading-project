"use client";

import type { ComponentProps, RefObject } from "react";
import { FlatViewScaffold } from "@/features/geopolitical/flat-view/FlatViewScaffold";
import type { GeoFlatViewState } from "@/features/geopolitical/flat-view/flat-view-state";
import { GeoShellFloatingPanel } from "@/features/geopolitical/shell/layout/GeoShellFloatingPanel";
import { GeoViewportChrome } from "@/features/geopolitical/shell/layout/GeoViewportChrome";
import { getGeoWorkspacePanelLayoutDefinition } from "@/features/geopolitical/shell/layout/geo-workspace-layout-contract";
import { MapLeftSidebar } from "@/features/geopolitical/shell/MapLeftSidebar";
import { MapRightSidebar } from "@/features/geopolitical/shell/MapRightSidebar";
import { MapViewportPanel } from "@/features/geopolitical/shell/MapViewportPanel";
import type { GeoMapViewMode } from "@/features/geopolitical/store";

type FloatingPanelBaseProps = Omit<
	ComponentProps<typeof GeoShellFloatingPanel>,
	"panelId" | "persistKey" | "side" | "title" | "resizable" | "children"
>;

interface GeoWorkspaceStageProps {
	workspaceRef: RefObject<HTMLDivElement | null>;
	mapViewMode: GeoMapViewMode;
	flatViewState: GeoFlatViewState | null;
	flatViewProps: Omit<ComponentProps<typeof FlatViewScaffold>, "state">;
	viewportProps: ComponentProps<typeof MapViewportPanel>;
	viewportChromeProps: ComponentProps<typeof GeoViewportChrome>;
	leftPanelProps: FloatingPanelBaseProps;
	leftSidebarProps: ComponentProps<typeof MapLeftSidebar>;
	rightPanelProps: FloatingPanelBaseProps;
	rightSidebarProps: ComponentProps<typeof MapRightSidebar>;
}

export function GeoWorkspaceStage({
	workspaceRef,
	mapViewMode,
	flatViewState,
	flatViewProps,
	viewportProps,
	viewportChromeProps,
	leftPanelProps,
	leftSidebarProps,
	rightPanelProps,
	rightSidebarProps,
}: GeoWorkspaceStageProps) {
	const leftPanelLayout = getGeoWorkspacePanelLayoutDefinition("left-controls");
	const rightPanelLayout = getGeoWorkspacePanelLayoutDefinition("right-intelligence");
	return (
		<main ref={workspaceRef} className="relative min-h-0 flex-1 overflow-hidden">
			{mapViewMode === "flat" && flatViewState ? (
				<FlatViewScaffold state={flatViewState} {...flatViewProps} />
			) : (
				<MapViewportPanel {...viewportProps} />
			)}

			<GeoViewportChrome {...viewportChromeProps} />

			<GeoShellFloatingPanel
				panelId={leftPanelLayout.slot}
				persistKey={leftPanelLayout.persistKey}
				side="left"
				title={leftPanelLayout.title}
				resizable={leftPanelLayout.resizableOnDesktop}
				{...leftPanelProps}
			>
				<MapLeftSidebar {...leftSidebarProps} />
			</GeoShellFloatingPanel>

			<GeoShellFloatingPanel
				panelId={rightPanelLayout.slot}
				persistKey={rightPanelLayout.persistKey}
				side="right"
				title={rightPanelLayout.title}
				resizable={rightPanelLayout.resizableOnDesktop}
				{...rightPanelProps}
			>
				<MapRightSidebar {...rightSidebarProps} />
			</GeoShellFloatingPanel>
		</main>
	);
}
