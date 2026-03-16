import type { ReactNode } from "react";
import { GlobalChatOverlay } from "@/components/GlobalChatOverlay";
import { GlobalKeyboardProvider } from "@/components/GlobalKeyboardProvider";
import { GlobalTopBar } from "@/components/GlobalTopBar";
import { GlobalChatProvider } from "@/features/agent-chat/context/GlobalChatContext";

export default function ShellLayout({ children }: { children: ReactNode }) {
	return (
		<GlobalChatProvider>
			<div className="flex h-screen flex-col overflow-hidden">
				<GlobalTopBar />
				<GlobalKeyboardProvider />
				<GlobalChatOverlay />
				<div className="flex flex-1 flex-col overflow-hidden">{children}</div>
			</div>
		</GlobalChatProvider>
	);
}
