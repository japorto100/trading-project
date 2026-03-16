"use client";

// AC74: GlobalKeyboardProvider — globale Shell-Shortcuts + globale CommandPalette (⌘K überall)
// ⌘K           → CommandPalette global (Navigation + Agent + Theme; Symbols/TF nur auf /trading)
// ⌘L / Ctrl+L  → Chat overlay öffnen/schließen
// ⌘T / Ctrl+T  → /trading navigieren (AC76)
// ⌘⇧M          → /geopolitical-map
// ⌘⇧C          → /control/overview

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CommandPalette } from "@/components/CommandPalette";
import { useGlobalChat } from "@/features/agent-chat/context/GlobalChatContext";

export function GlobalKeyboardProvider() {
	const { toggleChat } = useGlobalChat();
	const router = useRouter();

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			const meta = e.metaKey || e.ctrlKey;
			if (!meta) return;

			// Guard: ignore when typing in inputs (except Shift combos)
			const target = e.target as HTMLElement;
			const isTextInput =
				!e.shiftKey &&
				(target instanceof HTMLInputElement ||
					target instanceof HTMLTextAreaElement ||
					target.isContentEditable);
			if (isTextInput) return;

			// ⌘L → toggle chat
			if (e.key === "l" && !e.shiftKey) {
				e.preventDefault();
				toggleChat();
				return;
			}

			// ⌘T → /trading (AC76)
			if (e.key === "t" && !e.shiftKey) {
				e.preventDefault();
				router.push("/trading");
				return;
			}

			// ⌘⇧M → /geopolitical-map
			if (e.key === "M" && e.shiftKey) {
				e.preventDefault();
				router.push("/geopolitical-map");
				return;
			}

			// ⌘⇧C → /control/overview
			if (e.key === "C" && e.shiftKey) {
				e.preventDefault();
				router.push("/control/overview");
				return;
			}
		};

		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [toggleChat, router]);

	// CommandPalette ohne Trading-Props → zeigt Navigation + Agent + Theme
	// ⌘K intern in CommandPalette registriert
	return <CommandPalette />;
}
