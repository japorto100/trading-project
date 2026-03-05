import { ArrowLeft, RefreshCw, WandSparkles } from "lucide-react";
import Link from "next/link";
import { CrashTrigger } from "@/components/debug/crash-trigger";
import { Button } from "@/components/ui/button";

interface MapShellHeaderProps {
	eventsCount: number;
	loading: boolean;
	busy: boolean;
	onRefresh: () => void;
	onRunHardIngest: () => void;
	onRunSoftIngest: () => void;
}

export function MapShellHeader({
	eventsCount,
	loading,
	busy,
	onRefresh,
	onRunHardIngest,
	onRunSoftIngest,
}: MapShellHeaderProps) {
	return (
		<header className="flex h-12 items-center justify-between border-b border-border bg-background/50 backdrop-blur-md px-4 shrink-0 shadow-sm">
			<div className="flex items-center gap-4">
				<Link
					href="/"
					className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-success transition-colors"
				>
					<ArrowLeft className="h-3.5 w-3.5" />
					Workspace
				</Link>
				<div className="h-4 w-px bg-border/50" />
				<div className="flex flex-col">
					<h1 className="text-xs font-black uppercase tracking-widest text-foreground">
						Geopolitical Map
					</h1>
					<span className="text-[9px] uppercase font-bold text-muted-foreground/50 tracking-tight">
						Milestone A-E System
					</span>
				</div>
			</div>
			<div className="flex items-center gap-2">
				<CrashTrigger />
				<div className="h-4 w-px bg-border/50 mx-1" />
				<Button
					variant="ghost"
					size="sm"
					className="h-8 px-3 text-[10px] uppercase font-bold tracking-wider hover:bg-accent/50"
					onClick={onRefresh}
					disabled={loading || busy}
				>
					<RefreshCw className={`mr-2 h-3 w-3 ${loading || busy ? "animate-spin" : ""}`} />
					Sync
				</Button>

				<div className="h-4 w-px bg-border/50 mx-1" />

				<Button
					variant="secondary"
					size="sm"
					className="h-8 px-3 text-[10px] uppercase font-bold tracking-wider bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 border-none shadow-none"
					onClick={onRunSoftIngest}
					disabled={busy}
				>
					<WandSparkles className="mr-2 h-3 w-3" />
					Soft Ingest
				</Button>
				<Button
					variant="secondary"
					size="sm"
					className="h-8 px-3 text-[10px] uppercase font-bold tracking-wider bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-none shadow-none"
					onClick={onRunHardIngest}
					disabled={busy}
				>
					<WandSparkles className="mr-2 h-3 w-3" />
					Hard Ingest
				</Button>

				<div className="ml-2 rounded-md border border-border/50 bg-accent/20 px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase">
					{eventsCount} Events
				</div>
			</div>
		</header>
	);
}
