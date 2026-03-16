"use client";

// AC71: Agent toolbar — model selector (static list) + context reset + thread options
// Static model list (no backend required); dynamic list needs /api/agent/models endpoint.

import { ChevronDown, PlusCircle, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const MODELS = [
	{ id: "claude-sonnet-4-6", label: "Sonnet 4.6" },
	{ id: "claude-opus-4-6", label: "Opus 4.6" },
	{ id: "claude-haiku-4-5", label: "Haiku 4.5" },
] as const;

type ModelId = (typeof MODELS)[number]["id"];

interface AgentChatToolbarProps {
	onNewThread?: () => void;
	onContextReset?: () => void;
}

export function AgentChatToolbar({ onNewThread, onContextReset }: AgentChatToolbarProps) {
	const [selectedModel, setSelectedModel] = useState<ModelId>("claude-sonnet-4-6");
	const [pickerOpen, setPickerOpen] = useState(false);

	const currentLabel = MODELS.find((m) => m.id === selectedModel)?.label ?? selectedModel;

	return (
		<div className="relative flex items-center gap-1 px-2 py-1 border-b border-border/40 bg-background shrink-0">
			{/* Model selector */}
			<div className="relative">
				<button
					type="button"
					onClick={() => setPickerOpen((v) => !v)}
					className="flex items-center gap-1 rounded px-2 py-0.5 text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
				>
					<span className="font-mono">{currentLabel}</span>
					<ChevronDown className="h-2.5 w-2.5" />
				</button>
				{pickerOpen && (
					<div className="absolute top-full left-0 z-50 mt-1 min-w-[140px] rounded-md border border-border bg-popover shadow-md">
						{MODELS.map((m) => (
							<button
								key={m.id}
								type="button"
								onClick={() => {
									setSelectedModel(m.id);
									setPickerOpen(false);
								}}
								className={`flex w-full items-center px-3 py-1.5 text-[11px] hover:bg-muted/60 transition-colors ${
									m.id === selectedModel ? "text-foreground font-medium" : "text-muted-foreground"
								}`}
							>
								{m.label}
							</button>
						))}
					</div>
				)}
			</div>

			<div className="ml-auto flex items-center gap-0.5">
				{onContextReset && (
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6 text-muted-foreground/60 hover:text-muted-foreground"
						onClick={onContextReset}
						title="Reset context"
					>
						<RotateCcw className="h-3 w-3" />
					</Button>
				)}
				{onNewThread && (
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6 text-muted-foreground/60 hover:text-muted-foreground"
						onClick={onNewThread}
						title="New thread"
					>
						<PlusCircle className="h-3 w-3" />
					</Button>
				)}
			</div>
		</div>
	);
}
