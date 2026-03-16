"use client";

// GlobalTopBar — persistent surface-level navigation (SOTA 2026, 40px)
// Visible on all shell surfaces: /trading, /geopolitical-map, /control, /files
// Replaces the logo + nav links that were previously embedded in TradingHeader.

import {
	BarChart3,
	Bot,
	Check,
	Clock,
	FolderOpen,
	Globe,
	LogOut,
	Moon,
	Palette,
	SlidersHorizontal,
	Sun,
	TrendingUp,
	User,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { AlertPanel } from "@/components/AlertPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useGlobalChat } from "@/features/agent-chat/context/GlobalChatContext";
import { isAuthEnabled, isAuthStackBypassEnabled } from "@/lib/auth/runtime-flags";
import { cn } from "@/lib/utils";

interface SurfaceLink {
	href: string;
	label: string;
	icon: React.ReactNode;
	match: (pathname: string) => boolean;
}

const SURFACES: SurfaceLink[] = [
	{
		href: "/trading",
		label: "Trading",
		icon: <TrendingUp className="h-3.5 w-3.5" />,
		match: (p) => p === "/trading" || p === "/",
	},
	{
		href: "/geopolitical-map",
		label: "Map",
		icon: <Globe className="h-3.5 w-3.5" />,
		match: (p) => p.startsWith("/geopolitical-map"),
	},
	{
		href: "/control",
		label: "Control",
		icon: <SlidersHorizontal className="h-3.5 w-3.5" />,
		match: (p) => p.startsWith("/control"),
	},
	{
		href: "/files",
		label: "Files",
		icon: <FolderOpen className="h-3.5 w-3.5" />,
		match: (p) => p.startsWith("/files"),
	},
];

export function GlobalTopBar() {
	const pathname = usePathname();
	const { resolvedTheme, setTheme } = useTheme();
	const { data: session } = useSession();
	const { open: chatOpen, toggleChat } = useGlobalChat();
	const [clockTime, setClockTime] = useState("");
	const [isSigningOut, setIsSigningOut] = useState(false);
	const authEnabled = isAuthEnabled();
	const authBypassed = isAuthStackBypassEnabled();
	const canShowAuthControls = authEnabled && !authBypassed;

	useEffect(() => {
		setClockTime(new Date().toLocaleTimeString());
		const timer = window.setInterval(() => {
			setClockTime(new Date().toLocaleTimeString());
		}, 1000);
		return () => window.clearInterval(timer);
	}, []);

	return (
		<header className="flex h-10 shrink-0 items-center justify-between border-b border-border bg-card px-3 gap-4">
			{/* Left: logo + surface switcher */}
			<div className="flex items-center gap-1">
				<Link
					href="/trading"
					className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-md px-2 py-1 hover:opacity-90 transition-opacity mr-2"
				>
					<BarChart3 className="h-4 w-4 text-white" />
					<span className="font-bold text-white text-sm hidden sm:inline">TradeView</span>
				</Link>

				{SURFACES.map((surface) => {
					const isActive = surface.match(pathname);
					return (
						<Link
							key={surface.href}
							href={surface.href}
							data-testid={`link-${surface.label.toLowerCase()}`}
						>
							<Button
								variant="ghost"
								size="sm"
								className={cn(
									"h-7 gap-1.5 px-2.5 text-xs font-medium",
									isActive
										? "bg-accent text-foreground"
										: "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
								)}
							>
								{surface.icon}
								<span>{surface.label}</span>
							</Button>
						</Link>
					);
				})}
			</div>

			{/* Right: clock + alerts + AI chat + auth + theme */}
			<div className="flex items-center gap-1">
				<Badge
					variant="outline"
					className="h-6 gap-1 font-mono text-[10px] bg-background/50 hidden md:flex"
				>
					<Clock className="h-3 w-3" />
					{clockTime}
				</Badge>

				<Separator orientation="vertical" className="h-5 mx-1" />

				<AlertPanel />

				{/* AC75/AC77: AI Chat toggle — ⌘L */}
				<Button
					variant="ghost"
					size="icon"
					className={cn(
						"h-7 w-7 transition-colors",
						chatOpen
							? "text-emerald-500 bg-emerald-500/10 hover:text-emerald-400"
							: "text-muted-foreground hover:text-foreground",
					)}
					onClick={toggleChat}
					title="AI Agent Chat (⌘L)"
					aria-label="Toggle AI chat"
				>
					<Bot className="h-3.5 w-3.5" />
				</Button>

				{canShowAuthControls ? (
					session?.user ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="h-7 w-7"
									aria-label="Account menu"
									data-testid="header-account-menu"
								>
									<User className="h-3.5 w-3.5" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-56">
								<div className="flex items-center justify-start gap-2 p-2">
									<div className="flex flex-col space-y-0.5 leading-none">
										{session.user.name && (
											<p className="font-medium text-xs">{session.user.name}</p>
										)}
										{session.user.email && (
											<p className="w-[200px] truncate text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
												{session.user.email}
											</p>
										)}
									</div>
								</div>
								<Separator className="my-1 opacity-50" />
								<DropdownMenuItem asChild>
									<Link href="/auth/security" className="cursor-pointer">
										<User className="mr-2 h-4 w-4" />
										<span>Auth & Security</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link href="/auth/passkeys" className="cursor-pointer">
										<Zap className="mr-2 h-4 w-4 text-amber-500" />
										<span>Manage Passkeys</span>
									</Link>
								</DropdownMenuItem>
								<Separator className="my-1 opacity-50" />
								<DropdownMenuItem
									data-testid="header-signout"
									disabled={isSigningOut}
									className="text-destructive focus:text-destructive cursor-pointer"
									onSelect={async (event) => {
										event.preventDefault();
										setIsSigningOut(true);
										try {
											await signOut({ callbackUrl: "/auth/sign-in" });
										} finally {
											setIsSigningOut(false);
										}
									}}
								>
									<LogOut className="mr-2 h-4 w-4" />
									<span>{isSigningOut ? "Signing out..." : "Sign Out"}</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<Button
							variant="outline"
							size="sm"
							className="h-7 text-[10px] uppercase font-black tracking-widest gap-1.5"
							asChild
						>
							<Link href="/auth/sign-in">
								<User className="h-3 w-3" />
								Sign In
							</Link>
						</Button>
					)
				) : null}

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon" className="h-7 w-7">
							{resolvedTheme === "light" ? (
								<Sun className="h-3.5 w-3.5" />
							) : resolvedTheme === "dark" ? (
								<Moon className="h-3.5 w-3.5" />
							) : (
								<Palette className="h-3.5 w-3.5" />
							)}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={() => setTheme("light")}>
							<Sun className="mr-2 h-4 w-4" />
							Light
							{resolvedTheme === "light" && <Check className="ml-auto h-3 w-3" />}
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => setTheme("dark")}>
							<Moon className="mr-2 h-4 w-4" />
							Dark
							{resolvedTheme === "dark" && <Check className="ml-auto h-3 w-3" />}
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => setTheme("blue-dark")}>
							<Palette className="mr-2 h-4 w-4 text-blue-400" />
							Blue Dark
							{resolvedTheme === "blue-dark" && <Check className="ml-auto h-3 w-3" />}
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => setTheme("green-dark")}>
							<Palette className="mr-2 h-4 w-4 text-emerald-400" />
							Green Dark
							{resolvedTheme === "green-dark" && <Check className="ml-auto h-3 w-3" />}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	);
}
