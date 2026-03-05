"use client";

import { useCallback, useEffect, useState } from "react";

export interface MacroOverlayEntry {
	value: number;
	label?: string;
}

export function useMacroOverlayData(enabled: boolean): {
	data: Record<string, MacroOverlayEntry> | null;
	loading: boolean;
	error: string | null;
	refetch: () => void;
} {
	const [data, setData] = useState<Record<string, MacroOverlayEntry> | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchData = useCallback(async () => {
		if (!enabled) {
			setData(null);
			return;
		}
		setLoading(true);
		setError(null);
		try {
			const res = await fetch("/api/geopolitical/macro-overlay?indicator=policy_rate", {
				cache: "no-store",
				signal: AbortSignal.timeout(10000),
			});
			const payload = (await res.json()) as {
				success: boolean;
				data?: Record<string, MacroOverlayEntry>;
				error?: string;
			};
			if (!res.ok || !payload.success) {
				throw new Error(payload.error ?? `Macro overlay failed (${res.status})`);
			}
			setData(payload.data ?? {});
		} catch (err) {
			setError(err instanceof Error ? err.message : "Macro overlay fetch failed");
			setData(null);
		} finally {
			setLoading(false);
		}
	}, [enabled]);

	useEffect(() => {
		void fetchData();
	}, [fetchData]);

	return { data, loading, error, refetch: fetchData };
}
