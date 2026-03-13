"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { OHLCVData } from "@/lib/providers/types";

interface UseReplayModeReturn {
	replayMode: boolean;
	replayPlaying: boolean;
	replayIndex: number;
	viewCandleData: OHLCVData[];
	toggleReplayMode: () => void;
	toggleReplayPlaying: () => void;
	resetReplay: () => void;
	seekReplay: (index: number) => void;
}

export function useReplayMode(candleData: OHLCVData[]): UseReplayModeReturn {
	const [replayMode, setReplayMode] = useState(false);
	const [replayPlaying, setReplayPlaying] = useState(false);
	const [replayIndex, setReplayIndex] = useState(1);

	// Clamp index when candleData length changes or replay mode toggles.
	// useEffect is justified: responds to external data arriving (candleData) to maintain invariant.
	useEffect(() => {
		if (!replayMode) {
			setReplayPlaying(false);
			return;
		}
		const maxIndex = Math.max(candleData.length, 1);
		setReplayIndex((prev) => Math.min(Math.max(prev, 1), maxIndex));
	}, [replayMode, candleData.length]);

	// Advance replay index every 450ms when playing.
	// useEffect is justified: drives a timer-based side effect that advances replay state.
	useEffect(() => {
		if (!replayMode || !replayPlaying) return;
		if (replayIndex >= candleData.length) {
			setReplayPlaying(false);
			return;
		}
		const timer = window.setInterval(() => {
			setReplayIndex((prev) => {
				const next = prev + 1;
				return next > candleData.length ? candleData.length : next;
			});
		}, 450);
		return () => clearInterval(timer);
	}, [replayMode, replayPlaying, replayIndex, candleData.length]);

	const viewCandleData = useMemo(() => {
		if (!replayMode || candleData.length === 0) return candleData;
		const clamped = Math.min(Math.max(replayIndex, 1), candleData.length);
		return candleData.slice(0, clamped);
	}, [replayMode, replayIndex, candleData]);

	const toggleReplayMode = useCallback(() => setReplayMode((p) => !p), []);
	const toggleReplayPlaying = useCallback(() => setReplayPlaying((p) => !p), []);
	const resetReplay = useCallback(() => {
		setReplayPlaying(false);
		setReplayIndex(1);
	}, []);
	const seekReplay = useCallback((index: number) => setReplayIndex(Math.max(1, index)), []);

	return {
		replayMode,
		replayPlaying,
		replayIndex,
		viewCandleData,
		toggleReplayMode,
		toggleReplayPlaying,
		resetReplay,
		seekReplay,
	};
}
