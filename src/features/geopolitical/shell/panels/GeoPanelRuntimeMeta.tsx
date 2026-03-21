"use client";

interface GeoPanelRuntimeMetaProps {
	items: string[];
}

export function GeoPanelRuntimeMeta({ items }: GeoPanelRuntimeMetaProps) {
	if (items.length === 0) return null;

	return (
		<div className="mt-2 flex flex-wrap gap-1.5">
			{items.map((item) => (
				<span
					key={item}
					className="rounded border border-border/70 bg-background px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground"
				>
					{item}
				</span>
			))}
		</div>
	);
}
