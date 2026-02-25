import type { WatchlistStreamState } from "./types";

interface WatchlistStreamStatusProps {
	loadingQuotes: boolean;
	streamState: WatchlistStreamState;
	streamAgeLabel: string;
	streamReconnects: number;
}

export function WatchlistStreamStatus({
	loadingQuotes,
	streamState,
	streamAgeLabel,
	streamReconnects,
}: WatchlistStreamStatusProps) {
	return (
		<>
			{loadingQuotes ? (
				<div className="px-2 pt-2 text-[11px] text-muted-foreground">Refreshing quotes...</div>
			) : null}
			<div className="px-2 pt-1 text-[11px] text-muted-foreground">
				Stream: {streamState} | last update {streamAgeLabel} | reconnects {streamReconnects}
			</div>
		</>
	);
}
