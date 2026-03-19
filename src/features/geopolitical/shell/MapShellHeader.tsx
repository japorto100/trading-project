import { ArrowLeft, Layers3, RefreshCw, WandSparkles } from "lucide-react";
import Link from "next/link";
import { CrashTrigger } from "@/components/debug/crash-trigger";
import { Button } from "@/components/ui/button";
import type { GeoMapViewMode } from "@/features/geopolitical/store";

interface MapShellHeaderProps {
	eventsCount: number;
	loading: boolean;
	busy: boolean;
	mapViewMode: GeoMapViewMode;
	canOpenFlatView: boolean;
	onRefresh: () => void;
	onRunHardIngest: () => void;
	onRunSoftIngest: () => void;
	onOpenFlatView: () => void;
	onBackToGlobe: () => void;
}

export function MapShellHeader({
	eventsCount,
	loading,
	busy,
	mapViewMode,
	canOpenFlatView,
	onRefresh,
	onRunHardIngest,
	onRunSoftIngest,
	onOpenFlatView,
	onBackToGlobe,
}: MapShellHeaderProps) {
	return (
		<header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-background/50 px-4 shadow-sm backdrop-blur-md">
			<div className="flex items-center gap-4">
				<Link
					href="/"
					className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:text-status-success"
				>
					<ArrowLeft className="h-3.5 w-3.5" />
					Workspace
				</Link>
				<div className="h-4 w-px bg-border/50" />
				<div className="flex flex-col">
					<h1 className="text-xs font-black uppercase tracking-widest text-foreground">
						Geopolitical Map
					</h1>
					<span className="text-[11px] font-bold uppercase tracking-tight text-muted-foreground">
						Milestone A-E System
					</span>
				</div>
			</div>
			<div className="flex items-center gap-2">
				<CrashTrigger />
				<div className="mx-1 h-4 w-px bg-border/50" />
				<Button
					variant={mapViewMode === "flat" ? "default" : "outline"}
					size="sm"
					className="h-8 px-3 text-[10px] font-bold uppercase tracking-wider"
					onClick={mapViewMode === "flat" ? onBackToGlobe : onOpenFlatView}
					disabled={mapViewMode !== "flat" && !canOpenFlatView}
				>
					<Layers3 className="mr-2 h-3 w-3" />
					{mapViewMode === "flat" ? "Globe View" : "Open Flat"}
				</Button>
				<Button
					variant="ghost"
					size="sm"
					className="h-8 px-3 text-[10px] font-bold uppercase tracking-wider hover:bg-accent/50"
					onClick={onRefresh}
					disabled={loading || busy}
				>
					<RefreshCw className={`mr-2 h-3 w-3 ${loading || busy ? "animate-spin" : ""}`} />
					Sync
				</Button>

				<div className="mx-1 h-4 w-px bg-border/50" />

				<Button
					variant="secondary"
					size="sm"
					className="h-8 border-none bg-status-info/10 px-3 text-[11px] font-bold uppercase tracking-wider text-status-info shadow-none hover:bg-status-info/20"
					onClick={onRunSoftIngest}
					disabled={busy}
				>
					<WandSparkles className="mr-2 h-3 w-3" />
					Soft Ingest
				</Button>
				<Button
					variant="secondary"
					size="sm"
					className="h-8 border-none bg-status-warning/10 px-3 text-[11px] font-bold uppercase tracking-wider text-status-warning shadow-none hover:bg-status-warning/20"
					onClick={onRunHardIngest}
					disabled={busy}
				>
					<WandSparkles className="mr-2 h-3 w-3" />
					Hard Ingest
				</Button>

				<div className="ml-2 rounded-md border border-border/50 bg-accent/20 px-2 py-1 text-[11px] font-bold uppercase text-muted-foreground">
					{eventsCount} Events
				</div>
			</div>
		</header>
	);
}
