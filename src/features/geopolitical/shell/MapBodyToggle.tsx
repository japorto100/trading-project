import type { GeoMapBody } from "@/features/geopolitical/store";

interface MapBodyToggleProps {
	value: GeoMapBody;
	onChange: (body: GeoMapBody) => void;
}

export function MapBodyToggle({ value, onChange }: MapBodyToggleProps) {
	return (
		<div
			className="inline-flex h-9 items-center rounded-md border border-input bg-background p-0.5"
			role="tablist"
			aria-label="Map body"
		>
			<button
				type="button"
				role="tab"
				aria-selected={value === "earth"}
				className={`rounded px-2 py-1 text-xs font-medium ${
					value === "earth"
						? "bg-primary text-primary-foreground"
						: "text-muted-foreground hover:text-foreground"
				}`}
				onClick={() => onChange("earth")}
			>
				Earth
			</button>
			<button
				type="button"
				role="tab"
				aria-selected={value === "moon"}
				className={`rounded px-2 py-1 text-xs font-medium ${
					value === "moon"
						? "bg-primary text-primary-foreground"
						: "text-muted-foreground hover:text-foreground"
				}`}
				onClick={() => onChange("moon")}
			>
				Moon
			</button>
		</div>
	);
}
