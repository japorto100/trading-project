"use client";

import { ExternalLink, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AgentChatHeader() {
	return (
		<div className="flex items-center justify-between border-b border-border px-3 py-2 shrink-0">
			<span className="text-xs font-semibold text-foreground">Agent Chat</span>
			<div className="flex items-center gap-1">
				<Link href="/control" tabIndex={-1}>
					<Button
						variant="ghost"
						size="sm"
						className="h-7 gap-1 px-2 text-[10px] text-muted-foreground hover:text-foreground"
						title="Open Control surface (AC.V10)"
					>
						<ExternalLink className="h-3 w-3" />
						Control
					</Button>
				</Link>
				<Link href="/control/security" tabIndex={-1}>
					<Button
						variant="ghost"
						size="icon"
						className="h-7 w-7 text-muted-foreground hover:text-foreground"
						title="Security / agent settings"
					>
						<Settings className="h-3.5 w-3.5" />
					</Button>
				</Link>
			</div>
		</div>
	);
}
