import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// 30s default — overridden per-surface where needed (e.g. orderbook 5s, daily 5min)
			staleTime: 30_000,
			// 5min gcTime (TanStack Query 5 default) — explicit for clarity
			gcTime: 5 * 60_000,
			// retry: 2 global — hooks with demo-fallback (useChartData, useDailySignalData) override to false
			retry: 2,
			// Disable window-focus refetch — trading app; user switching tabs must not trigger
			// unexpected market data re-fetches mid-session. SSE streams keep live data current.
			refetchOnWindowFocus: false,
		},
	},
});
