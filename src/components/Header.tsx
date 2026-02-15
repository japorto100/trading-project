"use client";

import { ChevronDown, Moon, Search, Settings, Sun, TrendingUp, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SYMBOLS, type SymbolInfo } from "@/lib/chartData";

interface HeaderProps {
	currentSymbol: SymbolInfo;
	onSymbolChange: (symbol: SymbolInfo) => void;
	isDarkMode: boolean;
	onThemeToggle: () => void;
}

export function Header({ currentSymbol, onSymbolChange, isDarkMode, onThemeToggle }: HeaderProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [isSearchFocused, setIsSearchFocused] = useState(false);

	const filteredSymbols = SYMBOLS.filter(
		(s) =>
			s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
			s.name.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	return (
		<header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 z-50">
			{/* Logo */}
			<div className="flex items-center gap-2">
				<div className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg px-3 py-1.5">
					<TrendingUp className="h-5 w-5 text-white" />
					<span className="font-bold text-white text-lg">TradeView Pro</span>
				</div>
			</div>

			{/* Search Bar */}
			<div className="relative flex-1 max-w-md mx-4">
				<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				<Input
					type="text"
					placeholder="Search symbols..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					onFocus={() => setIsSearchFocused(true)}
					onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
					className="pl-10 bg-background/50 border-border"
				/>

				{/* Search Results Dropdown */}
				{isSearchFocused && searchQuery && (
					<div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
						{filteredSymbols.slice(0, 6).map((symbol) => (
							<button
								key={symbol.symbol}
								onClick={() => {
									onSymbolChange(symbol);
									setSearchQuery("");
								}}
								className="w-full px-4 py-2 flex items-center justify-between hover:bg-accent transition-colors"
							>
								<div className="flex items-center gap-3">
									<span className="font-medium">{symbol.symbol}</span>
									<span className="text-sm text-muted-foreground">{symbol.name}</span>
								</div>
								<span
									className={`text-xs px-2 py-0.5 rounded ${
										symbol.type === "crypto"
											? "bg-amber-500/20 text-amber-500"
											: "bg-blue-500/20 text-blue-500"
									}`}
								>
									{symbol.type.toUpperCase()}
								</span>
							</button>
						))}
					</div>
				)}
			</div>

			{/* Right Side */}
			<div className="flex items-center gap-2">
				{/* Current Symbol Display */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" className="gap-2 min-w-[140px]">
							<span className="font-medium">{currentSymbol.symbol}</span>
							<ChevronDown className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-[200px]">
						<DropdownMenuItem disabled className="text-xs text-muted-foreground">
							Crypto
						</DropdownMenuItem>
						{SYMBOLS.filter((s) => s.type === "crypto").map((symbol) => (
							<DropdownMenuItem
								key={symbol.symbol}
								onClick={() => onSymbolChange(symbol)}
								className={currentSymbol.symbol === symbol.symbol ? "bg-accent" : ""}
							>
								<span className="font-medium">{symbol.symbol}</span>
								<span className="ml-2 text-muted-foreground text-sm">{symbol.name}</span>
							</DropdownMenuItem>
						))}
						<DropdownMenuSeparator />
						<DropdownMenuItem disabled className="text-xs text-muted-foreground">
							Stocks
						</DropdownMenuItem>
						{SYMBOLS.filter((s) => s.type === "stock").map((symbol) => (
							<DropdownMenuItem
								key={symbol.symbol}
								onClick={() => onSymbolChange(symbol)}
								className={currentSymbol.symbol === symbol.symbol ? "bg-accent" : ""}
							>
								<span className="font-medium">{symbol.symbol}</span>
								<span className="ml-2 text-muted-foreground text-sm">{symbol.name}</span>
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>

				{/* Theme Toggle */}
				<Button variant="ghost" size="icon" onClick={onThemeToggle} className="h-9 w-9">
					{isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
				</Button>

				{/* Settings */}
				<Button variant="ghost" size="icon" className="h-9 w-9">
					<Settings className="h-4 w-4" />
				</Button>

				{/* Account */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
							<User className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-[180px]">
						<DropdownMenuItem>Profile</DropdownMenuItem>
						<DropdownMenuItem>Account Settings</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem>Sign Out</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	);
}
