"use client";

import { Bot, Calendar, Globe, Moon, Search, Sun, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { ALL_FUSION_SYMBOLS, type FusionSymbol } from "@/lib/fusion-symbols";
import type { TimeframeValue } from "@/lib/providers/types";

interface CommandPaletteProps {
	onSymbolChange: (symbol: FusionSymbol) => void;
	onTimeframeChange: (tf: TimeframeValue) => void;
	onThemeToggle: () => void;
	isDarkMode: boolean;
	/** Öffnet das Agent-Chat-Panel. Wird verdrahtet sobald Chat-UI existiert. */
	onOpenChat?: () => void;
}

export function CommandPalette({
	onSymbolChange,
	onTimeframeChange,
	onThemeToggle,
	isDarkMode,
	onOpenChat,
}: CommandPaletteProps) {
	const [open, setOpen] = React.useState(false);
	const router = useRouter();

	React.useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((o) => !o);
			}
			if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				// ⌘J: direkt Chat öffnen (sobald onOpenChat verdrahtet)
				setOpen(false);
				onOpenChat?.();
			}
			if (e.key === "A" && (e.metaKey || e.ctrlKey) && e.shiftKey) {
				e.preventDefault();
				setOpen(true);
			}
		};

		document.addEventListener("keydown", down);
		return () => document.removeEventListener("keydown", down);
	}, [onOpenChat]);

	const runCommand = React.useCallback((command: () => void) => {
		setOpen(false);
		command();
	}, []);

	return (
		<CommandDialog open={open} onOpenChange={setOpen}>
			<CommandInput placeholder="Type a command or search symbols..." />
			<CommandList>
				<CommandEmpty>No results found.</CommandEmpty>
				<CommandGroup heading="Suggestions">
					<CommandItem
						onSelect={() => {
							runCommand(() => router.push("/geopolitical-map"));
						}}
					>
						<Globe className="mr-2 h-4 w-4" />
						<span>Geopolitical Map</span>
					</CommandItem>
					<CommandItem
						onSelect={() => {
							runCommand(() => onOpenChat?.());
						}}
					>
						<Bot className="mr-2 h-4 w-4" />
						<span>Ask AI (Chat)</span>
						<CommandShortcut>⌘J</CommandShortcut>
					</CommandItem>
					<CommandItem
						onSelect={() => {
							runCommand(() => void 0);
						}}
					>
						<Search className="mr-2 h-4 w-4" />
						<span>Voice Command</span>
						<CommandShortcut>⌘⇧A</CommandShortcut>
					</CommandItem>
					<CommandItem
						onSelect={() => {
							runCommand(() => onThemeToggle());
						}}
					>
						{isDarkMode ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
						<span>Toggle Theme</span>
						<CommandShortcut>⌘T</CommandShortcut>
					</CommandItem>
				</CommandGroup>
				<CommandSeparator />
				<CommandGroup heading="Symbols">
					{ALL_FUSION_SYMBOLS.slice(0, 10).map((symbol) => (
						<CommandItem
							key={symbol.symbol}
							onSelect={() => {
								runCommand(() => onSymbolChange(symbol));
							}}
						>
							<TrendingUp className="mr-2 h-4 w-4" />
							<span>{symbol.symbol}</span>
							<span className="ml-2 text-xs text-muted-foreground">{symbol.name}</span>
						</CommandItem>
					))}
				</CommandGroup>
				<CommandSeparator />
				<CommandGroup heading="Timeframes">
					{["1m", "5m", "15m", "1H", "4H", "1D"].map((tf) => (
						<CommandItem
							key={tf}
							onSelect={() => {
								runCommand(() => onTimeframeChange(tf as TimeframeValue));
							}}
						>
							<Calendar className="mr-2 h-4 w-4" />
							<span>Switch to {tf}</span>
						</CommandItem>
					))}
				</CommandGroup>
			</CommandList>
		</CommandDialog>
	);
}
