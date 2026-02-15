"use client";

import { GEO_SYMBOL_CATALOG } from "@/lib/geopolitical/catalog";
import { cn } from "@/lib/utils";

interface SymbolToolbarProps {
	selectedSymbol: string;
	onSelectSymbol: (symbol: string) => void;
}

export function SymbolToolbar({ selectedSymbol, onSelectSymbol }: SymbolToolbarProps) {
	return (
		<div className="flex flex-col gap-2">
			<h2 className="text-sm font-semibold text-foreground">Symbol Toolbar</h2>
			<p className="text-xs text-muted-foreground">
				Select a symbol, then click on the map to place a marker.
			</p>

			<div className="grid grid-cols-1 gap-2" role="listbox" aria-label="Geopolitical symbols">
				{GEO_SYMBOL_CATALOG.map((entry) => {
					const active = selectedSymbol === entry.symbol;
					return (
						<button
							key={entry.symbol}
							type="button"
							className={cn(
								"rounded-md border px-3 py-2 text-left transition-colors",
								active
									? "border-primary bg-primary/10 text-primary"
									: "border-border bg-card hover:bg-accent",
							)}
							onClick={() => onSelectSymbol(entry.symbol)}
							aria-pressed={active}
							aria-label={`Select symbol ${entry.label}`}
							title={entry.description}
						>
							<div className="flex items-center justify-between gap-2">
								<span className="text-xs font-medium uppercase tracking-wide">
									{entry.shortCode}
								</span>
								<span className="text-[11px] text-muted-foreground">{entry.category}</span>
							</div>
							<p className="mt-1 text-sm font-medium">{entry.label}</p>
						</button>
					);
				})}
			</div>
		</div>
	);
}
