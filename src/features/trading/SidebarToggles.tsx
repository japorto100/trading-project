"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarTogglesProps {
	sidebarOpen: boolean;
	rightSidebarOpen: boolean;
	onToggleLeft: () => void;
	onToggleRight: () => void;
}

export function SidebarToggles({
	sidebarOpen,
	rightSidebarOpen,
	onToggleLeft,
	onToggleRight,
}: SidebarTogglesProps) {
	return (
		<>
			{sidebarOpen ? (
				<Button
					variant="ghost"
					size="icon"
					className="absolute left-2 top-4 z-40 h-8 w-8 border border-border bg-card/90 shadow-sm"
					onClick={onToggleLeft}
				>
					<ChevronLeft className="h-4 w-4" />
				</Button>
			) : (
				<Button
					variant="ghost"
					size="icon"
					className="absolute left-0 top-4 z-40 h-8 w-6 border-y border-r border-border bg-card/90 shadow-sm rounded-l-none"
					onClick={onToggleLeft}
				>
					<ChevronRight className="h-4 w-4" />
				</Button>
			)}

			{!rightSidebarOpen && (
				<Button
					variant="ghost"
					size="icon"
					className="absolute right-0 top-4 z-40 h-8 w-6 border-y border-l border-border bg-card/90 shadow-sm rounded-r-none"
					onClick={onToggleRight}
				>
					<ChevronLeft className="h-4 w-4" />
				</Button>
			)}
		</>
	);
}
