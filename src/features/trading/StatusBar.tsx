"use client";

import type { DataMode } from "./types";

interface StatusBarProps {
	dataMode: DataMode;
	dataProvider: string;
	streamState: "connecting" | "live" | "degraded" | "reconnecting";
	streamAgeLabel: string;
	streamReconnects: number;
	replayMode: boolean;
	replayPlaying: boolean;
}

export function StatusBar({
	dataMode,
	dataProvider,
	streamState,
	streamAgeLabel,
	streamReconnects,
	replayMode,
	replayPlaying,
}: StatusBarProps) {
	return (
		<div className="flex flex-wrap items-center gap-4 border-b border-border/30 bg-background/50 backdrop-blur-md px-4 py-1.5 text-[11px] uppercase font-bold tracking-wider">
			<div
				className="flex items-center gap-1.5"
				title={dataMode === "api" ? "Market ready" : "Loading market data"}
			>
				<div
					className={`h-1.5 w-1.5 rounded-full ${dataMode === "api" ? "bg-success shadow-chromatic" : "bg-status-warning animate-pulse"}`}
				/>
				<span className="text-muted-foreground">
					{dataMode} • {dataProvider}
				</span>
			</div>

			<div className="flex items-center gap-1.5">
				<div
					className={`h-1.5 w-1.5 rounded-full ${
						streamState === "live"
							? "bg-success shadow-chromatic"
							: streamState === "degraded"
								? "bg-status-warning"
								: "bg-muted-foreground"
					}`}
				/>
				<span className={streamState === "live" ? "text-status-success" : "text-muted-foreground"}>
					{streamState === "live" ? "Stream Active" : `Stream: ${streamState}`}
				</span>
				<span className="text-muted-foreground ml-1">({streamAgeLabel})</span>
			</div>

			{streamReconnects > 0 && <span className="text-status-warning">Re: {streamReconnects}</span>}

			{replayMode && (
				<div className="flex items-center gap-1.5 text-status-info">
					<div
						className={`h-1.5 w-1.5 rounded-full bg-status-info ${replayPlaying ? "animate-pulse shadow-[0_0_10px_var(--primary)]" : ""}`}
					/>
					Replay
				</div>
			)}
		</div>
	);
}
