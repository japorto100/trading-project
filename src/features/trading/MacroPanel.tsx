"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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
	const [value, setValue] = useState<number | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [source, setSource] = useState<string | null>(null);

	const effectiveSymbol = symbol && isMacroSymbol(symbol) ? symbol : inputSymbol;

	const fetchQuote = useCallback(async (sym: string) => {
		if (!sym.trim()) return;
		setLoading(true);
		setError(null);
		const url = `/api/geopolitical/macro-quote?symbol=${encodeURIComponent(sym)}`;
		try {
			const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000) });
			const payload = (await res.json()) as MacroQuoteResponse;
			if (!res.ok || !payload.success || !payload.data) {
				throw new Error(payload.error ?? `Quote failed (${res.status})`);
			}
			setValue(Number(payload.data.last));
			setSource(payload.data.source || payload.data.exchange);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Macro quote fetch failed");
			setValue(null);
			setSource(null);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (effectiveSymbol && isMacroSymbol(effectiveSymbol)) {
			void fetchQuote(effectiveSymbol);
		} else {
			setValue(null);
			setSource(null);
			setError(null);
		}
	}, [effectiveSymbol, fetchQuote]);

	const handleRefresh = () => {
		void fetchQuote(effectiveSymbol);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setInputSymbol((prev) => prev.trim() || prev);
		if (inputSymbol.trim() && isMacroSymbol(inputSymbol.trim())) {
			void fetchQuote(inputSymbol.trim());
		}
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
