import type { ReactNode } from "react";
import { GlobalChatOverlay } from "@/components/GlobalChatOverlay";
import { GlobalKeyboardProvider } from "@/components/GlobalKeyboardProvider";
import { GlobalTopBar } from "@/components/GlobalTopBar";
import { GlobalChatProvider } from "@/features/agent-chat/context/GlobalChatContext";
import { SplitChatShell } from "@/features/agent-chat/SplitChatShell";

export default function ShellLayout({ children }: { children: ReactNode }) {
	return (
		<GlobalChatProvider>
			<div className="flex h-screen flex-col overflow-hidden">
				<GlobalTopBar />
				<GlobalKeyboardProvider />
				{/* Sheet overlay — renders on top, doesn't affect layout */}
				<GlobalChatOverlay />
				{/* AC89: Split-View — chat panel beside content */}
				<SplitChatShell>{children}</SplitChatShell>
			</div>
		</GlobalChatProvider>
	);
}
