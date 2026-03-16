"use client";

// AC75: GlobalChatOverlay — AgentChatPanel als shadcn Sheet (side=right, modal=false)
// modal=false: Sheet bleibt offen, Chart bleibt vollständig interaktiv (AC89/AC92 SOTA)
// AC77: open-State via GlobalChatContext, kein prop-drilling

import { useCallback, useRef } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { AgentChatPanel } from "@/features/agent-chat/AgentChatPanel";
import { useGlobalChat } from "@/features/agent-chat/context/GlobalChatContext";

export function GlobalChatOverlay() {
	const { open, closeChat } = useGlobalChat();
	const focusFnRef = useRef<(() => void) | null>(null);

	// AC68: focus composer when sheet opens
	const handleOpenChange = useCallback(
		(next: boolean) => {
			if (!next) closeChat();
		},
		[closeChat],
	);

	const handleMounted = useCallback(
		(focusFn: () => void) => {
			focusFnRef.current = focusFn;
			if (open) focusFn();
		},
		[open],
	);

	return (
		<Sheet open={open} onOpenChange={handleOpenChange} modal={false}>
			<SheetContent
				side="right"
				className="w-[420px] sm:w-[480px] p-0 flex flex-col border-l border-border"
				// suppress default close button — AgentChatHeader has its own
				onPointerDownOutside={(e) => e.preventDefault()}
				onInteractOutside={(e) => e.preventDefault()}
			>
				<AgentChatPanel onMounted={handleMounted} />
			</SheetContent>
		</Sheet>
	);
}
