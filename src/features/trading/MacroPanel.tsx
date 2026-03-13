"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isMacroSymbol } from "@/lib/macro-symbols";

interface MacroPanelProps {
	symbol: string;
}

interface MacroQuoteResponse {
	success: boolean;
	data?: {
		symbol: string;
		exchange: string;
		last: number;
		timestamp: number;
		source: string;
	};
	error?: string;
}

export function MacroPanel({ symbol }: MacroPanelProps) {
	const [inputSymbol, setInputSymbol] = useState(symbol);

	const effectiveSymbol = symbol && isMacroSymbol(symbol) ? symbol : inputSymbol;
	const enabled = Boolean(effectiveSymbol && isMacroSymbol(effectiveSymbol));

	const {
		data,
		isLoading: loading,
		error: queryError,
		refetch,
	} = useQuery({
		queryKey: ["market", "macro-quote", effectiveSymbol],
		queryFn: async () => {
			const res = await fetch(
				`/api/geopolitical/macro-quote?symbol=${encodeURIComponent(effectiveSymbol)}`,
				{ cache: "no-store", signal: AbortSignal.timeout(8000) },
			);
			const payload = (await res.json()) as MacroQuoteResponse;
			if (!res.ok || !payload.success || !payload.data) {
				throw new Error(payload.error ?? `Quote failed (${res.status})`);
			}
			return payload.data;
		},
		enabled,
		staleTime: 60_000,
	});

	const value = data ? Number(data.last) : null;
	const source = data ? data.source || data.exchange : null;
	const error = queryError instanceof Error ? queryError.message : null;

	const handleRefresh = () => {
		void refetch();
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setInputSymbol((prev) => prev.trim() || prev);
	};

	const showInput = !symbol || !isMacroSymbol(symbol);

	return (
		<div className="flex flex-col h-full p-3 gap-3">
			<div className="text-sm font-semibold text-foreground">Macro</div>
			{showInput && (
				<form onSubmit={handleSubmit} className="flex gap-2">
					<Input
						placeholder="e.g. POLICY_RATE, IMF_IFS_M_111_FITB"
						value={inputSymbol}
						onChange={(e) => setInputSymbol(e.target.value)}
						className="text-sm"
					/>
					<Button type="submit" size="sm" variant="secondary">
						Load
					</Button>
				</form>
			)}
			{effectiveSymbol && isMacroSymbol(effectiveSymbol) && (
				<>
					{error && (
						<Alert variant="destructive">
							<AlertTriangle className="h-4 w-4" />
							<AlertTitle>Error</AlertTitle>
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}
					{loading && <p className="text-xs text-muted-foreground">Loading macro data...</p>}
					{!loading && value !== null && (
						<div className="rounded-lg border border-border bg-card p-3 space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-xs font-medium text-muted-foreground">{effectiveSymbol}</span>
								{source && <span className="text-[10px] text-muted-foreground">{source}</span>}
							</div>
							<div className="text-2xl font-bold tabular-nums">{value?.toFixed(2)}%</div>
							<Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleRefresh}>
								<RefreshCw className="mr-1 h-3 w-3" />
								Refresh
							</Button>
						</div>
					)}
					<div className="mt-2 text-[10px] text-muted-foreground">
						Macro data from Go Gateway. Policy rate, IMF IFS, FRED, and other sources.
					</div>
				</>
			)}
			{(!effectiveSymbol || !isMacroSymbol(effectiveSymbol)) && !showInput && (
				<p className="text-xs text-muted-foreground">
					Select a macro symbol (e.g. POLICY_RATE, IMF_IFS_M_111_FITB) to view.
				</p>
			)}
		</div>
	);
}
