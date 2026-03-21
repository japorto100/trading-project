export type GeoWorkspacePanelSlot = "left-controls" | "right-intelligence";
export type GeoWorkspaceShellMode = "desktop" | "mobile";

export interface GeoWorkspacePanelLayoutDefinition {
	slot: GeoWorkspacePanelSlot;
	side: "left" | "right";
	title: string;
	persistKey: string;
	resizableOnDesktop: boolean;
	defaultDesktopWidth: number;
	minDesktopWidth: number;
	maxDesktopWidthRatio: number;
	collapsedWidth: number;
	mobileWidth: string;
}

const GEO_WORKSPACE_PANEL_LAYOUT: Record<GeoWorkspacePanelSlot, GeoWorkspacePanelLayoutDefinition> =
	{
		"left-controls": {
			slot: "left-controls",
			side: "left",
			title: "Map Controls",
			persistKey: "geo-shell.left-controls",
			resizableOnDesktop: true,
			defaultDesktopWidth: 340,
			minDesktopWidth: 280,
			maxDesktopWidthRatio: 0.45,
			collapsedWidth: 44,
			mobileWidth: "min(24rem, calc(100vw - 24px))",
		},
		"right-intelligence": {
			slot: "right-intelligence",
			side: "right",
			title: "Intelligence Workspace",
			persistKey: "geo-shell.right-intelligence",
			resizableOnDesktop: true,
			defaultDesktopWidth: 460,
			minDesktopWidth: 320,
			maxDesktopWidthRatio: 0.45,
			collapsedWidth: 44,
			mobileWidth: "min(24rem, calc(100vw - 24px))",
		},
	};

export function getGeoWorkspaceShellMode(isMobile: boolean): GeoWorkspaceShellMode {
	return isMobile ? "mobile" : "desktop";
}

export function getGeoWorkspacePanelLayoutDefinition(
	slot: GeoWorkspacePanelSlot,
): GeoWorkspacePanelLayoutDefinition {
	return GEO_WORKSPACE_PANEL_LAYOUT[slot];
}

export function getGeoWorkspacePanelInitialWidth(slot: GeoWorkspacePanelSlot): number {
	return GEO_WORKSPACE_PANEL_LAYOUT[slot].defaultDesktopWidth;
}

export function resolveGeoWorkspacePanelStyleWidth(params: {
	slot: GeoWorkspacePanelSlot;
	isMobile: boolean;
	collapsed: boolean;
	width: number;
}): number | string {
	const definition = getGeoWorkspacePanelLayoutDefinition(params.slot);
	if (params.collapsed) return definition.collapsedWidth;
	return params.isMobile ? definition.mobileWidth : params.width;
}

export function getGeoWorkspacePanelResizeBounds(params: {
	slot: GeoWorkspacePanelSlot;
	workspaceWidth: number;
}) {
	const definition = getGeoWorkspacePanelLayoutDefinition(params.slot);
	return {
		minWidth: definition.minDesktopWidth,
		maxWidth: Math.max(
			definition.defaultDesktopWidth,
			params.workspaceWidth * definition.maxDesktopWidthRatio,
		),
	};
}

export function getGeoWorkspaceFloatingPanelBottomOffset(isMobile: boolean): number {
	return isMobile ? 56 : 12;
}
