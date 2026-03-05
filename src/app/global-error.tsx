"use client";

/**
 * SOTA 2026 Global Error Boundary
 * Next.js 16 / React 19 Implementation
 *
 * Features:
 * - Distributed Telemetry Correlation (OTel Attribute Decoration)
 * - Durable State Recovery (Safe reset attempt)
 * - Tailwind v4 Hardware-accel background
 */

import { motion } from "framer-motion";
import { RefreshCcw, ShieldAlert, Zap } from "lucide-react";
import { useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	const [isPending, startTransition] = useTransition();

	useEffect(() => {
		// SOTA 2026 OTel Decoration
		// This log is picked up by @vercel/otel instrumentation.ts
		// By logging a structured object, OpenObserve can extract metadata.
		console.error("CRITICAL_RECOVERY_PHASE_GLOBAL", {
			severity: "CRITICAL",
			digest: error.digest,
			message: error.message,
			component: "RootLayout",
			timestamp: new Date().toISOString(),
			isRecoverable: true,
		});

		// In 2026, we also send a custom OTLP Metric if possible (via instrumentation logic)
		if (typeof window !== "undefined" && "performance" in window) {
			// biome-ignore lint/suspicious/noExplicitAny: SOTA 2026 Custom Metrics Bridge
			(window as any).nextMetrics?.capture?.("error_boundary_trigger", {
				level: "global",
				digest: error.digest || "none",
			});
		}
	}, [error]);

	const handleHardReset = () => {
		// Durable State Recovery: Clear temporary session markers that might cause loop
		if (typeof sessionStorage !== "undefined") {
			sessionStorage.removeItem("TVP_LAST_CRASH_MARKER");
		}
		startTransition(() => {
			reset();
		});
	};

	return (
		<html lang="en" className="dark">
			<body className="antialiased bg-zinc-950 text-zinc-100 flex items-center justify-center h-screen w-screen overflow-hidden font-sans">
				{/* Tailwind v4 Animated Hardware-accel Mesh */}
				<div className="absolute inset-0 z-0 opacity-20">
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(220,38,38,0.15),_transparent_60%)] animate-pulse" />
					<div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
				</div>

				<motion.div
					initial={{ opacity: 0, y: 20, scale: 0.98 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
					className="relative z-10 max-w-lg w-full p-12 bg-zinc-900/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] shadow-2xl flex flex-col items-center text-center mx-4"
				>
					<div className="mb-10 relative">
						<div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full scale-150" />
						<div className="relative h-20 w-20 bg-gradient-to-tr from-red-600 to-red-400 rounded-3xl flex items-center justify-center shadow-lg shadow-red-900/50">
							<ShieldAlert className="h-10 w-10 text-white" strokeWidth={1.5} />
						</div>
					</div>

					<h1 className="text-3xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
						System Breach Detected
					</h1>

					<p className="text-zinc-400 text-base mb-10 leading-relaxed font-light">
						A fatal execution fault occurred in the Root Interface. Telemetry has been dispatched to
						OpenObserve.
					</p>

					{error.digest && (
						<div className="w-full mb-10 p-4 bg-black/40 rounded-2xl border border-white/5 group relative overflow-hidden">
							<div className="absolute top-0 left-0 w-1 h-full bg-red-500/40" />
							<div className="flex items-center justify-between mb-2">
								<span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-medium">
									Trace Token
								</span>
								<Zap className="h-3 w-3 text-red-500/50" />
							</div>
							<code className="block text-[11px] font-mono text-zinc-300 break-all select-all text-left opacity-80 group-hover:opacity-100 transition-opacity">
								{error.digest}
							</code>
						</div>
					)}

					<div className="flex flex-col w-full gap-4">
						<Button
							variant="default"
							size="lg"
							disabled={isPending}
							onClick={handleHardReset}
							className="bg-white text-black hover:bg-zinc-200 h-14 rounded-2xl font-semibold text-base transition-all active:scale-95 disabled:opacity-50"
						>
							<RefreshCcw className={`mr-3 h-5 w-5 ${isPending ? "animate-spin" : ""}`} />
							{isPending ? "Re-Syncing Core..." : "Attempt Full Recovery"}
						</Button>

						<button
							onClick={() => window.location.reload()}
							className="text-zinc-500 hover:text-white text-xs font-medium uppercase tracking-widest transition-all py-3"
						>
							Bypass Proxy & Reload
						</button>
					</div>
				</motion.div>
			</body>
		</html>
	);
}
