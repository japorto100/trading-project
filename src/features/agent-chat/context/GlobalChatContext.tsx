"use client";

// AC75/AC77: Global Chat Context — provides open state + context injection
// Consumed by: GlobalChatOverlay, GlobalKeyboardProvider, GlobalTopBar, "Ask AI" triggers

import { createContext, useCallback, useContext, useMemo, useState } from "react";

interface GlobalChatContextValue {
	open: boolean;
	/** Injected context string shown as chip in chat header (AC87/AC94) */
	chatContext: string | null;
	openChat: (ctx?: string) => void;
	closeChat: () => void;
	toggleChat: () => void;
	/** Inject context without changing open state (AC87 — page-level injection on open) */
	setChatContext: (ctx: string | null) => void;
	clearChatContext: () => void;
}

const GlobalChatContext = createContext<GlobalChatContextValue | null>(null);

export function GlobalChatProvider({ children }: { children: React.ReactNode }) {
	const [open, setOpen] = useState(false);
	const [chatContext, setChatContext] = useState<string | null>(null);

	const openChat = useCallback((ctx?: string) => {
		if (ctx) setChatContext(ctx);
		setOpen(true);
	}, []);

	const closeChat = useCallback(() => {
		setOpen(false);
	}, []);

	const toggleChat = useCallback(() => {
		setOpen((v) => !v);
	}, []);

	const clearChatContext = useCallback(() => {
		setChatContext(null);
	}, []);

	const value = useMemo(
		() => ({
			open,
			chatContext,
			openChat,
			closeChat,
			toggleChat,
			setChatContext,
			clearChatContext,
		}),
		[open, chatContext, openChat, closeChat, toggleChat, clearChatContext],
	);

	return <GlobalChatContext.Provider value={value}>{children}</GlobalChatContext.Provider>;
}

export function useGlobalChat() {
	const ctx = useContext(GlobalChatContext);
	if (!ctx) throw new Error("useGlobalChat must be used within GlobalChatProvider");
	return ctx;
}
