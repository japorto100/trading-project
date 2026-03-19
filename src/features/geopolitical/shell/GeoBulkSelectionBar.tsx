import { Button } from "@/components/ui/button";

interface GeoBulkSelectionBarProps {
	count: number;
	onClear: () => void;
	onKeepPrimary: () => void;
	onOpenFlatView: () => void;
}

export function GeoBulkSelectionBar({
	count,
	onClear,
	onKeepPrimary,
	onOpenFlatView,
}: GeoBulkSelectionBarProps) {
	return (
		<div className="flex items-center gap-2 rounded-lg border border-border/70 bg-card/95 px-3 py-2 shadow-lg backdrop-blur">
			<span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
				Multi-select
			</span>
			<span className="text-sm font-medium">{count} events</span>
			<Button type="button" size="sm" variant="outline" onClick={onKeepPrimary}>
				Keep primary
			</Button>
			<Button type="button" size="sm" variant="outline" onClick={onOpenFlatView}>
				Open in flat view
			</Button>
			<Button type="button" size="sm" variant="ghost" onClick={onClear}>
				Clear
			</Button>
		</div>
	);
}
