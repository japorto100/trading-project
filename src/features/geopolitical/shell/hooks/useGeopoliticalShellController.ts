import {
	type MouseEvent as ReactMouseEvent,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import {
	getGeoWorkspaceFloatingPanelBottomOffset,
	getGeoWorkspacePanelInitialWidth,
	getGeoWorkspacePanelResizeBounds,
	resolveGeoWorkspacePanelStyleWidth,
} from "@/features/geopolitical/shell/layout/geo-workspace-layout-contract";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

interface UseGeopoliticalShellControllerParams {
	isMobile: boolean;
	pendingPointActive: boolean;
	selectedEventActive: boolean;
}

export function useGeopoliticalShellController({
	isMobile,
	pendingPointActive,
	selectedEventActive,
}: UseGeopoliticalShellControllerParams) {
	const workspaceRef = useRef<HTMLDivElement | null>(null);
	const [leftPanelWidth, setLeftPanelWidth] = useState(
		getGeoWorkspacePanelInitialWidth("left-controls"),
	);
	const [rightPanelWidth, setRightPanelWidth] = useState(
		getGeoWorkspacePanelInitialWidth("right-intelligence"),
	);
	const [leftCollapsed, setLeftCollapsed] = useState(false);
	const [rightCollapsed, setRightCollapsed] = useState(false);
	const [drawToolsOpen, setDrawToolsOpen] = useState(false);
	const [markerPlacementArmed, setMarkerPlacementArmed] = useState(false);
	const [markerModalOpen, setMarkerModalOpen] = useState(false);
	const [markerListModalOpen, setMarkerListModalOpen] = useState(false);
	const [viewportResetNonce, setViewportResetNonce] = useState(0);

	useEffect(() => {
		if (!selectedEventActive && !pendingPointActive) {
			setMarkerModalOpen(false);
			return;
		}
		setMarkerModalOpen(true);
	}, [pendingPointActive, selectedEventActive]);

	useEffect(() => {
		if (!isMobile) return;
		setLeftCollapsed(true);
		setRightCollapsed(true);
	}, [isMobile]);

	const effectiveRightWidth = rightCollapsed ? 44 : rightPanelWidth;
	const leftPanelStyleWidth = resolveGeoWorkspacePanelStyleWidth({
		slot: "left-controls",
		isMobile,
		collapsed: leftCollapsed,
		width: leftPanelWidth,
	});
	const rightPanelStyleWidth = resolveGeoWorkspacePanelStyleWidth({
		slot: "right-intelligence",
		isMobile,
		collapsed: rightCollapsed,
		width: rightPanelWidth,
	});
	const floatingPanelBottomOffset = getGeoWorkspaceFloatingPanelBottomOffset(isMobile);
	const drawToolsRightOffset = isMobile ? 12 : effectiveRightWidth + 18;

	const handleToggleDrawTools = useCallback(() => {
		setMarkerPlacementArmed(false);
		setDrawToolsOpen((previous) => !previous);
	}, []);

	const handleToggleLeftPanel = useCallback(() => {
		setLeftCollapsed((previous) => {
			const nextCollapsed = !previous;
			if (isMobile && !nextCollapsed) {
				setRightCollapsed(true);
			}
			return nextCollapsed;
		});
	}, [isMobile]);

	const handleToggleRightPanel = useCallback(() => {
		setRightCollapsed((previous) => {
			const nextCollapsed = !previous;
			if (isMobile && !nextCollapsed) {
				setLeftCollapsed(true);
			}
			return nextCollapsed;
		});
	}, [isMobile]);

	const beginResize = useCallback(
		(panel: "left" | "right") => (event: ReactMouseEvent<HTMLDivElement>) => {
			event.preventDefault();
			const workspace = workspaceRef.current;
			if (!workspace) return;
			const gap = 12;
			const previousUserSelect = document.body.style.userSelect;
			const previousCursor = document.body.style.cursor;
			document.body.style.userSelect = "none";
			document.body.style.cursor = "ew-resize";

			const onMove = (moveEvent: MouseEvent) => {
				const currentRect = workspace.getBoundingClientRect();
				if (panel === "left") {
					const bounds = getGeoWorkspacePanelResizeBounds({
						slot: "left-controls",
						workspaceWidth: currentRect.width,
					});
					const next = moveEvent.clientX - currentRect.left - gap;
					setLeftPanelWidth(clamp(next, bounds.minWidth, bounds.maxWidth));
					return;
				}
				const bounds = getGeoWorkspacePanelResizeBounds({
					slot: "right-intelligence",
					workspaceWidth: currentRect.width,
				});
				const next = currentRect.right - moveEvent.clientX - gap;
				setRightPanelWidth(clamp(next, bounds.minWidth, bounds.maxWidth));
			};

			const onUp = () => {
				window.removeEventListener("mousemove", onMove);
				window.removeEventListener("mouseup", onUp);
				document.body.style.userSelect = previousUserSelect;
				document.body.style.cursor = previousCursor;
			};

			window.addEventListener("mousemove", onMove);
			window.addEventListener("mouseup", onUp);
		},
		[],
	);

	const bumpViewportResetNonce = useCallback(() => {
		setViewportResetNonce((previous) => previous + 1);
	}, []);

	return {
		workspaceRef,
		leftCollapsed,
		rightCollapsed,
		drawToolsOpen,
		markerPlacementArmed,
		markerModalOpen,
		markerListModalOpen,
		viewportResetNonce,
		leftPanelStyleWidth,
		rightPanelStyleWidth,
		floatingPanelBottomOffset,
		drawToolsRightOffset,
		setDrawToolsOpen,
		setMarkerPlacementArmed,
		setMarkerModalOpen,
		setMarkerListModalOpen,
		setLeftPanelWidth,
		setRightPanelWidth,
		setLeftCollapsed,
		setRightCollapsed,
		handleToggleDrawTools,
		handleToggleLeftPanel,
		handleToggleRightPanel,
		beginResize,
		bumpViewportResetNonce,
	};
}
