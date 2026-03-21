"use client";

import { useEffect, useRef } from "react";
import type { GeoWorkspaceTab } from "@/features/geopolitical/store";
import { createDbReadyJsonStorageAdapter } from "@/lib/storage/adapter";

const GEO_WORKSPACE_SHELL_STORAGE_KEY = "geo-shell.workspace-state";
const storage = createDbReadyJsonStorageAdapter();

interface GeoWorkspaceShellPersistencePayload {
	leftPanelWidth: number;
	rightPanelWidth: number;
	leftCollapsed: boolean;
	rightCollapsed: boolean;
	showCandidateQueue: boolean;
	showFiltersToolbar: boolean;
	showBodyLayerLegend: boolean;
	showTimelinePanel: boolean;
	workspaceTab: GeoWorkspaceTab;
}

interface UseGeopoliticalShellPersistenceParams extends GeoWorkspaceShellPersistencePayload {
	isMobile: boolean;
	setLeftPanelWidth: (next: number) => void;
	setRightPanelWidth: (next: number) => void;
	setLeftCollapsed: (next: boolean) => void;
	setRightCollapsed: (next: boolean) => void;
	setShowCandidateQueue: (next: boolean) => void;
	setShowFiltersToolbar: (next: boolean) => void;
	setShowBodyLayerLegend: (next: boolean) => void;
	setShowTimelinePanel: (next: boolean) => void;
	setWorkspaceTab: (next: GeoWorkspaceTab) => void;
}

export function useGeopoliticalShellPersistence({
	isMobile,
	leftPanelWidth,
	rightPanelWidth,
	leftCollapsed,
	rightCollapsed,
	showCandidateQueue,
	showFiltersToolbar,
	showBodyLayerLegend,
	showTimelinePanel,
	workspaceTab,
	setLeftPanelWidth,
	setRightPanelWidth,
	setLeftCollapsed,
	setRightCollapsed,
	setShowCandidateQueue,
	setShowFiltersToolbar,
	setShowBodyLayerLegend,
	setShowTimelinePanel,
	setWorkspaceTab,
}: UseGeopoliticalShellPersistenceParams) {
	const hydratedRef = useRef(false);

	useEffect(() => {
		const persisted = storage.getJSON<GeoWorkspaceShellPersistencePayload | null>(
			GEO_WORKSPACE_SHELL_STORAGE_KEY,
			null,
		);
		if (persisted) {
			setLeftPanelWidth(persisted.leftPanelWidth);
			setRightPanelWidth(persisted.rightPanelWidth);
			setLeftCollapsed(isMobile ? true : persisted.leftCollapsed);
			setRightCollapsed(isMobile ? true : persisted.rightCollapsed);
			setShowCandidateQueue(persisted.showCandidateQueue);
			setShowFiltersToolbar(persisted.showFiltersToolbar);
			setShowBodyLayerLegend(persisted.showBodyLayerLegend);
			setShowTimelinePanel(persisted.showTimelinePanel);
			setWorkspaceTab(persisted.workspaceTab);
		}
		hydratedRef.current = true;
	}, [
		setLeftPanelWidth,
		setRightPanelWidth,
		setLeftCollapsed,
		setRightCollapsed,
		setShowCandidateQueue,
		setShowFiltersToolbar,
		setShowBodyLayerLegend,
		setShowTimelinePanel,
		setWorkspaceTab,
		isMobile,
	]);

	useEffect(() => {
		if (!hydratedRef.current) return;
		storage.setJSON<GeoWorkspaceShellPersistencePayload>(GEO_WORKSPACE_SHELL_STORAGE_KEY, {
			leftPanelWidth,
			rightPanelWidth,
			leftCollapsed,
			rightCollapsed,
			showCandidateQueue,
			showFiltersToolbar,
			showBodyLayerLegend,
			showTimelinePanel,
			workspaceTab,
		});
	}, [
		leftPanelWidth,
		rightPanelWidth,
		leftCollapsed,
		rightCollapsed,
		showCandidateQueue,
		showFiltersToolbar,
		showBodyLayerLegend,
		showTimelinePanel,
		workspaceTab,
	]);
}
