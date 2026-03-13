"use client";

import { useCallback, useEffect, useState } from "react";
import { isMacroSymbol } from "@/lib/macro-symbols";
import type { SidebarPanel } from "../types";

interface UseWorkspaceLayoutReturn {
	sidebarOpen: boolean;
	rightSidebarOpen: boolean;
	activeSidebarPanel: SidebarPanel;
	setSidebarOpen: (open: boolean) => void;
	setRightSidebarOpen: (open: boolean) => void;
	setActiveSidebarPanel: (panel: SidebarPanel) => void;
	toggleLeft: () => void;
	toggleRight: () => void;
}

export function useWorkspaceLayout(currentSymbolId: string): UseWorkspaceLayoutReturn {
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
	const [activeSidebarPanel, setActiveSidebarPanel] = useState<SidebarPanel>("indicators");

	// Auto-route to macro panel when a macro symbol is selected.
	// useEffect is justified: reacts to symbol changes to drive sidebar routing.
	useEffect(() => {
		if (isMacroSymbol(currentSymbolId)) {
			setActiveSidebarPanel("macro");
		}
	}, [currentSymbolId]);

	const toggleLeft = useCallback(() => setSidebarOpen((p) => !p), []);
	const toggleRight = useCallback(() => setRightSidebarOpen((p) => !p), []);

	return {
		sidebarOpen,
		rightSidebarOpen,
		activeSidebarPanel,
		setSidebarOpen,
		setRightSidebarOpen,
		setActiveSidebarPanel,
		toggleLeft,
		toggleRight,
	};
}
