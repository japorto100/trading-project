import { ArrowLeft, RefreshCw, WandSparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface MapShellHeaderProps {
	eventsCount: number;
	loading: boolean;
	busy: boolean;
	onRefresh: () => void;
	onRunHardIngest: () => void;
}

export function MapShellHeader({
	eventsCount,
	loading,
	busy,
	onRefresh,
	onRunHardIngest,
}: MapShellHeaderProps) {
	return (
		<header className="flex h-14 items-center justify-between border-b border-border px-4">
			<div className="flex items-center gap-3">
				<Link
					href="/"
					className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
				>
					<ArrowLeft className="h-4 w-4" />
					Trading Workspace
				</Link>
				<div className="h-5 w-px bg-border" />
				<h1 className="text-sm font-semibold">Geopolitical Map</h1>
				<span className="text-xs text-muted-foreground">Milestone A-E integrated</span>
			</div>
			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					onClick={onRefresh}
					disabled={loading || busy}
					aria-label="Refresh geopolitical data"
				>
					<RefreshCw className="mr-2 h-4 w-4" />
					Refresh
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={onRunHardIngest}
					disabled={busy}
					aria-label="Run hard signal ingestion"
				>
					<WandSparkles className="mr-2 h-4 w-4" />
					Ingest hard signals
				</Button>
				<div className="rounded-md border border-border bg-card px-2 py-1 text-xs text-muted-foreground">
					Events: {eventsCount}
				</div>
			</div>
		</header>
	);
}
