"use client";

import { Clock, Moon, Sun, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopMenuBarProps {
	dataMode: "api" | "fallback";
	isDarkMode: boolean;
	sidebarOpen: boolean;
	onToggleDrawingToolbar: () => void;
	onOpenIndicators: () => void;
	onOpenWatchlist: () => void;
	onOpenNews: () => void;
	onOpenOrders: () => void;
	onToggleSidebar: () => void;
	onRefresh: () => void;
	onThemeToggle: () => void;
}

export function TopMenuBar({
	dataMode,
	isDarkMode,
	sidebarOpen,
	onToggleDrawingToolbar,
	onOpenIndicators,
	onOpenWatchlist,
	onOpenNews,
	onOpenOrders,
	onToggleSidebar,
	onRefresh,
	onThemeToggle,
}: TopMenuBarProps) {
	const [clockTime, setClockTime] = useState(() => new Date().toLocaleTimeString());

	useEffect(() => {
		const timer = window.setInterval(() => {
			setClockTime(new Date().toLocaleTimeString());
		}, 1000);
		return () => window.clearInterval(timer);
	}, []);

	return (
		<div className="h-8 border-b border-border bg-card/70 backdrop-blur-sm flex items-center px-2 text-xs">
			<div className="flex items-center gap-1">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className="h-6 px-2 text-xs"
							onClick={onOpenWatchlist}
						>
							File
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start" className="min-w-40">
						<DropdownMenuItem onClick={onOpenWatchlist}>Open Watchlist</DropdownMenuItem>
						<DropdownMenuItem onClick={onOpenNews}>Open News</DropdownMenuItem>
						<DropdownMenuItem onClick={onOpenOrders}>Open Orders</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={onRefresh}>Refresh Data</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className="h-6 px-2 text-xs"
							onClick={onToggleSidebar}
						>
							View
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start" className="min-w-40">
						<DropdownMenuItem onClick={onToggleSidebar}>
							{sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
						</DropdownMenuItem>
						<DropdownMenuItem onClick={onOpenIndicators}>Indicators Panel</DropdownMenuItem>
						<DropdownMenuItem onClick={onToggleDrawingToolbar}>Drawing Toolbar</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>

				<Button
					variant="ghost"
					size="sm"
					className="h-6 px-2 text-xs"
					onClick={onToggleDrawingToolbar}
				>
					Draw
				</Button>
				<Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={onOpenIndicators}>
					Indicators
				</Button>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={onThemeToggle}>
							Settings
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start" className="min-w-40">
						<DropdownMenuItem onClick={onThemeToggle}>
							{isDarkMode ? (
								<>
									<Sun className="mr-2 h-3.5 w-3.5" />
									Light Mode
								</>
							) : (
								<>
									<Moon className="mr-2 h-3.5 w-3.5" />
									Dark Mode
								</>
							)}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<div className="flex-1" />

			<div className="flex items-center gap-2">
				<Badge variant="outline" className="text-xs">
					<Clock className="h-3 w-3 mr-1" />
					{clockTime}
				</Badge>
				<Badge
					variant="outline"
					className={`text-xs ${dataMode === "api" ? "text-emerald-500 border-emerald-500/40" : "text-amber-500 border-amber-500/40"}`}
				>
					<Zap className="h-3 w-3 mr-1" />
					{dataMode === "api" ? "Live" : "Fallback"}
				</Badge>
			</div>
		</div>
	);
}

export default TopMenuBar;
