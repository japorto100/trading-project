export type LayoutMode = "single" | "2h" | "2v" | "4";

export function toDbLayoutMode(
	layout: LayoutMode,
): "single" | "two_horizontal" | "two_vertical" | "four" {
	if (layout === "2h") return "two_horizontal";
	if (layout === "2v") return "two_vertical";
	if (layout === "4") return "four";
	return "single";
}

export function fromDbLayoutMode(
	layoutMode: "single" | "two_horizontal" | "two_vertical" | "four" | null | undefined,
): LayoutMode {
	if (layoutMode === "two_horizontal") return "2h";
	if (layoutMode === "two_vertical") return "2v";
	if (layoutMode === "four") return "4";
	return "single";
}
