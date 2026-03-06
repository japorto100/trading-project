"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import { queryClient } from "@/lib/query-client";

// ssr:false prevents react-idle-timer's Date.now() from running during prerender
const InactivityMonitor = dynamic(
	() =>
		import("./InactivityMonitor").then((m) => ({
			default: m.InactivityMonitor,
		})),
	{ ssr: false },
);

export function Providers({ children }: { children: ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>
			<SessionProvider>
				<InactivityMonitor>{children}</InactivityMonitor>
			</SessionProvider>
		</QueryClientProvider>
	);
}
