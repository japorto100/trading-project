"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

// Returns a timestamp (ms) that updates every second — used to compute stream age.
// useEffect here is legitimate: it manages a recurring side-effect (setInterval)
// that is not driven by external data and has no server equivalent.
export function useStreamClock(): number {
	const mounted = useSyncExternalStore(
		() => () => {},
		() => true,
		() => false,
	);

	const [clockMs, setClockMs] = useState<number>(0);

	useEffect(() => {
		if (!mounted) return;
		const timer = setInterval(() => setClockMs(Date.now()), 1000);
		return () => clearInterval(timer);
	}, [mounted]);

	return clockMs;
}
