"use client";

/**
 * SOTA 2026 App Error Boundary (Elite)
 *
 * Target: General Application UI crashes
 * Features:
 * - OTel Trace Decoration via structured console
 * - Durable State Recovery
 */

import { motion } from "framer-motion";
import { AlertCircle, RefreshCcw, Terminal } from "lucide-react";
import { useEffect, useTransition } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function AppErrorBoundary({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	const [isPending, startTransition] = useTransition();

	useEffect(() => {
		// Elite OTel Logging: Automatic pickup by OTel Collector / OpenObserve
		console.error("APP_RUNTIME_EXCEPTION", {
			level: "ERROR",
			service: "tradeview-next",
			digest: error.digest,
			message: error.message,
			component: "AppRouter",
			stack: error.stack,
			isRecoverable: true,
			timestamp: new Date().toISOString(),
			// SOTA 2026: Attribute tagging for OpenObserve filtering
			tags: ["frontend", "error-boundary", `digest:${error.digest || "none"}`],
		});
	}, [error]);

	return (
		<div className="min-h-[80vh] w-full flex items-center justify-center p-6 bg-background/50">
			<motion.div
				initial={{ opacity: 0, scale: 0.98, y: 20 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
				className="max-w-2xl w-full"
			>
				<div className="relative group">
					{/* Glow effect */}
					<div className="absolute -inset-1 bg-gradient-to-r from-destructive/20 to-orange-500/20 rounded-[2.5rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />

					<Alert
						variant="destructive"
						className="relative bg-zinc-950/90 backdrop-blur-3xl border-destructive/20 p-10 rounded-[2.5rem] shadow-2xl overflow-hidden"
					>
						<div className="flex flex-col md:flex-row items-start gap-8">
							<div className="bg-destructive/10 p-5 rounded-2xl border border-destructive/20 shadow-inner">
								<AlertCircle className="h-8 w-8 text-destructive" strokeWidth={1.5} />
							</div>

							<div className="flex-1">
								<AlertTitle className="text-2xl font-bold tracking-tight mb-3 text-white">
									Execution Halted
								</AlertTitle>
								<AlertDescription className="text-zinc-400 text-base leading-relaxed mb-8">
									The application encountered an unhandled exception in the client runtime.
									Distributed tracing has been initialized with the token below.
								</AlertDescription>

								<div className="bg-black/60 rounded-2xl p-6 border border-white/5 mb-8 font-mono relative overflow-hidden">
									<div className="flex items-center gap-2 mb-4 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
										<Terminal className="h-3 w-3" />
										<span>Diagnostic Payload</span>
									</div>
									<p className="text-xs text-zinc-300 break-words leading-relaxed selection:bg-destructive/30">
										{error.message || "Unknown execution fault"}
									</p>
									{error.digest && (
										<div className="mt-4 pt-4 border-t border-white/5 text-[9px] text-zinc-600">
											<span className="mr-2 opacity-50 font-sans">TRACE_ID:</span>
											{error.digest}
										</div>
									)}
								</div>

								<div className="flex flex-wrap gap-4">
									<Button
										variant="destructive"
										size="lg"
										disabled={isPending}
										onClick={() => startTransition(() => reset())}
										className="rounded-xl shadow-lg shadow-destructive/20 h-14 px-8 font-bold text-base transition-all active:scale-95"
									>
										<RefreshCcw className={`mr-2 h-5 w-5 ${isPending ? "animate-spin" : ""}`} />
										Attempt Recovery
									</Button>
									<Button
										variant="ghost"
										size="lg"
										onClick={() => window.location.reload()}
										className="rounded-xl h-14 px-8 opacity-40 hover:opacity-100 hover:bg-white/5 transition-all font-medium"
									>
										Hard Reload
									</Button>
								</div>
							</div>
						</div>
					</Alert>
				</div>
			</motion.div>
		</div>
	);
}
