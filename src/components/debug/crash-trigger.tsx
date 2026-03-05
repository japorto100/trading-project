"use client";

import { ShieldAlert } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CrashTrigger() {
	const [shouldCrash, setShouldCrash] = useState(false);

	if (shouldCrash) {
		throw new Error("SIMULATED_ELITE_CRASH (SOTA 2026 Test)");
	}

	return (
		<div className="flex gap-2">
			<Button
				variant="outline"
				size="sm"
				className="text-[10px] text-destructive hover:bg-destructive/10 border-destructive/20"
				onClick={() => setShouldCrash(true)}
			>
				<ShieldAlert className="mr-2 h-3 w-3" />
				Simulate Map Crash
			</Button>
		</div>
	);
}
