"use client";

// AC74: CommandPalette global — onOpenChat via useGlobalChat() intern (kein prop-drilling)
// Symbols/Timeframe optional — werden nur gezeigt wenn Props vorhanden (Trading-Page)
// ⌘K global via GlobalKeyboardProvider (dieses File registriert nur noch seinen eigenen open-State)

import {
	Bot,
	Calendar,
	Check,
	Globe,
	Moon,
	Palette,
	Search,
	SlidersHorizontal,
	Sun,
	TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import * as React from "react";
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
	CommandShortcut,
} from "@/components/ui/command";
import { useGlobalChat } from "@/features/agent-chat/context/GlobalChatContext";
import { ALL_FUSION_SYMBOLS, type FusionSymbol } from "@/lib/fusion-symbols";
import type { TimeframeValue } from "@/lib/providers/types";

interface CommandPaletteProps {
	/** Trading-only: wenn vorhanden werden Symbol- und Timeframe-Gruppen gezeigt */
	onSymbolChange?: (symbol: FusionSymbol) => void;
	onTimeframeChange?: (tf: TimeframeValue) => void;
}

export function CommandPalette({ onSymbolChange, onTimeframeChange }: CommandPaletteProps) {
	const { resolvedTheme, setTheme } = useTheme();
	const [open, setOpen] = React.useState(false);
	const router = useRouter();
	const { openChat } = useGlobalChat();

	React.useEffect(() => {
		const down = (e: KeyboardEvent) => {
			const meta = e.metaKey || e.ctrlKey;
			if (!meta) return;

			// Guard: nicht feuern wenn Cursor in Input/Textarea ohne Shift-Combo
			const target = e.target as HTMLElement;
			if (
				!e.shiftKey &&
				(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)
			)
				return;

			// ⌘K: Command Palette öffnen/schliessen
			if (e.key === "k" && !e.shiftKey) {
				e.preventDefault();
				setOpen((o) => !o);
			}
		};

		document.addEventListener("keydown", down);
		return () => document.removeEventListener("keydown", down);
	}, []);

	const runCommand = React.useCallback((command: () => void) => {
		setOpen(false);
		command();
	}, []);

	return (
		<CommandDialog open={open} onOpenChange={setOpen}>
			<CommandInput placeholder="Type a command or search symbols..." />
			<CommandList>
				<CommandEmpty>No results found.</CommandEmpty>

				<CommandGroup heading="Navigation">
					<CommandItem onSelect={() => runCommand(() => router.push("/trading"))}>
						<TrendingUp className="mr-2 h-4 w-4" />
						<span>Trading</span>
						<CommandShortcut>⌘T</CommandShortcut>
					</CommandItem>
					<CommandItem onSelect={() => runCommand(() => router.push("/geopolitical-map"))}>
						<Globe className="mr-2 h-4 w-4" />
						<span>Geopolitical Map</span>
						<CommandShortcut>⌘⇧M</CommandShortcut>
					</CommandItem>
					<CommandItem onSelect={() => runCommand(() => router.push("/control/overview"))}>
						<SlidersHorizontal className="mr-2 h-4 w-4" />
						<span>Control Surface</span>
						<CommandShortcut>⌘⇧C</CommandShortcut>
					</CommandItem>
				</CommandGroup>

				<CommandSeparator />

				<CommandGroup heading="Agent">
					<CommandItem onSelect={() => runCommand(() => openChat())}>
						<Bot className="mr-2 h-4 w-4" />
						<span>Ask AI (Chat)</span>
						<CommandShortcut>⌘L</CommandShortcut>
					</CommandItem>
					<CommandItem onSelect={() => runCommand(() => openChat())}>
						<Search className="mr-2 h-4 w-4" />
						<span>Voice Input</span>
						<CommandShortcut>⌘⇧A</CommandShortcut>
					</CommandItem>
				</CommandGroup>

				<CommandSeparator />

				<CommandGroup heading="Theme">
					<CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
						<Sun className="mr-2 h-4 w-4" />
						<span>Theme: Light</span>
						{resolvedTheme === "light" && <Check className="ml-auto h-3 w-3" />}
					</CommandItem>
					<CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
						<Moon className="mr-2 h-4 w-4" />
						<span>Theme: Dark</span>
						{resolvedTheme === "dark" && <Check className="ml-auto h-3 w-3" />}
					</CommandItem>
					<CommandItem onSelect={() => runCommand(() => setTheme("blue-dark"))}>
						<Palette className="mr-2 h-4 w-4 text-blue-400" />
						<span>Theme: Blue Dark</span>
						{resolvedTheme === "blue-dark" && <Check className="ml-auto h-3 w-3" />}
					</CommandItem>
					<CommandItem onSelect={() => runCommand(() => setTheme("green-dark"))}>
						<Palette className="mr-2 h-4 w-4 text-emerald-400" />
						<span>Theme: Green Dark</span>
						{resolvedTheme === "green-dark" && <Check className="ml-auto h-3 w-3" />}
					</CommandItem>
				</CommandGroup>

				{onSymbolChange && (
					<>
						<CommandSeparator />
						<CommandGroup heading="Symbols">
							{ALL_FUSION_SYMBOLS.map((symbol) => (
								<CommandItem
									key={symbol.symbol}
									onSelect={() => runCommand(() => onSymbolChange(symbol))}
								>
									<TrendingUp className="mr-2 h-4 w-4" />
									<span>{symbol.symbol}</span>
									<span className="ml-2 text-xs text-muted-foreground">{symbol.name}</span>
								</CommandItem>
							))}
						</CommandGroup>
					</>
				)}

				{onTimeframeChange && (
					<>
						<CommandSeparator />
						<CommandGroup heading="Timeframes">
							{["1m", "5m", "15m", "1H", "4H", "1D"].map((tf) => (
								<CommandItem
									key={tf}
									onSelect={() => runCommand(() => onTimeframeChange(tf as TimeframeValue))}
								>
									<Calendar className="mr-2 h-4 w-4" />
									<span>Switch to {tf}</span>
								</CommandItem>
							))}
						</CommandGroup>
					</>
				)}
			</CommandList>
		</CommandDialog>
	);
}
