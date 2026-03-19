"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { createNotification } from "@/features/alerts/storage";
import type { OHLCVData } from "@/lib/providers/types";
import { getClientProfileKey } from "@/lib/storage/profile-key";

type StreamState = "connecting" | "live" | "degraded" | "reconnecting";

interface UseMarketStreamReturn {
	streamState: StreamState;
	streamReconnects: number;
	streamLastTickAt: number | null;
	lastQuoteRef: React.RefObject<Record<string, number>>;
	setDataStatusMessage: (msg: string | null) => void;
}

interface UseMarketStreamOptions {
	symbol: string;
	timeframe: string;
	requestLimit: number;
	enabled: boolean;
	onStatusMessage: (msg: string | null) => void;
	onSetDataProvider: (provider: string) => void;
	onSetDataMode: () => void;
	ohlcvQueryKey: unknown[];
}

export function useMarketStream({
	symbol,
	timeframe,
	requestLimit,
	enabled,
	onStatusMessage,
	onSetDataProvider,
	onSetDataMode,
	ohlcvQueryKey,
}: UseMarketStreamOptions): Omit<UseMarketStreamReturn, "setDataStatusMessage"> {
	const queryClient = useQueryClient();
	const [streamState, setStreamState] = useState<StreamState>("connecting");
	const [streamReconnects, setStreamReconnects] = useState(0);
	const [streamLastTickAt, setStreamLastTickAt] = useState<number | null>(null);
	const lastQuoteRef = useRef<Record<string, number>>({});
	const degradedRef = useRef(false);

	// SSE stream lifecycle — useEffect is justified: manages an EventSource (browser API side-effect)
	// that must be torn down on symbol/timeframe change. No React primitive replaces this.
	useEffect(() => {
		if (!enabled) return;
		if (typeof window === "undefined" || typeof window.EventSource === "undefined") return;

		const params = new URLSearchParams({
			symbol,
			timeframe,
			profileKey: getClientProfileKey(),
		});
		setStreamState("connecting");
		setStreamLastTickAt(null);
		const source = new window.EventSource(`/api/market/stream?${params.toString()}`);

		const onReady = () => {
			degradedRef.current = false;
			setStreamState("live");
		};

		const onCandle = (event: MessageEvent<string>) => {
			try {
				const payload = JSON.parse(event.data) as {
					provider?: string;
					candle?: OHLCVData;
					executionsCount?: number;
				};
				const candle = payload.candle;
				if (
					!candle ||
					!Number.isFinite(candle.time) ||
					!Number.isFinite(candle.open) ||
					!Number.isFinite(candle.high) ||
					!Number.isFinite(candle.low) ||
					!Number.isFinite(candle.close)
				)
					return;

				// Update TanStack Query cache directly — per FRONTEND_ARCHITECTURE.md §8
				queryClient.setQueryData(
					ohlcvQueryKey,
					(prev: { rows: OHLCVData[]; provider: string; isCapped: boolean } | undefined) => {
						if (!prev) return prev;
						const next = [...prev.rows];
						const existingIndex = next.findIndex((row) => row.time === candle.time);
						if (existingIndex >= 0) {
							next[existingIndex] = candle;
						} else {
							const last = next[next.length - 1];
							if (!last || candle.time < last.time) return prev;
							next.push(candle);
						}
						const trimmed =
							next.length > requestLimit ? next.slice(next.length - requestLimit) : next;
						return { ...prev, rows: trimmed };
					},
				);

				if (payload.provider) onSetDataProvider(payload.provider);
				onSetDataMode();

				if (typeof payload.executionsCount === "number" && payload.executionsCount > 0) {
					onStatusMessage(
						`${payload.executionsCount} paper order${payload.executionsCount > 1 ? "s" : ""} auto-filled at live price.`,
					);
				}

				if (degradedRef.current) {
					degradedRef.current = false;
					setStreamState("live");
					onStatusMessage("Realtime stream reconnected.");
				}
				setStreamLastTickAt(Date.now());
			} catch {
				/* ignore malformed payloads */
			}
		};

		const onSnapshot = (event: MessageEvent<string>) => {
			try {
				const payload = JSON.parse(event.data) as {
					quote?: { last?: number; timestamp?: number };
					candles?: OHLCVData[];
					candle?: OHLCVData;
				};
				if (Array.isArray(payload.candles) && payload.candles.length > 0) {
					const sorted = [...payload.candles]
						.filter(
							(row) =>
								Number.isFinite(row.time) &&
								Number.isFinite(row.open) &&
								Number.isFinite(row.high) &&
								Number.isFinite(row.low) &&
								Number.isFinite(row.close),
						)
						.sort((a, b) => a.time - b.time);
					if (sorted.length > 0) {
						queryClient.setQueryData(
							ohlcvQueryKey,
							(prev: { rows: OHLCVData[]; provider: string; isCapped: boolean } | undefined) => {
								if (prev && prev.rows.length > 0) return prev;
								return prev ? { ...prev, rows: sorted.slice(-requestLimit) } : prev;
							},
						);
					}
				} else if (payload.candle) {
					queryClient.setQueryData(
						ohlcvQueryKey,
						(prev: { rows: OHLCVData[]; provider: string; isCapped: boolean } | undefined) => {
							if (prev && prev.rows.length > 0) return prev;
							return prev ? { ...prev, rows: [payload.candle as OHLCVData] } : prev;
						},
					);
				}
				if (typeof payload.quote?.last === "number") {
					lastQuoteRef.current[symbol] = payload.quote.last;
					setStreamLastTickAt(Date.now());
				}
			} catch {
				/* ignore */
			}
		};

		const onQuote = (event: MessageEvent<string>) => {
			try {
				const payload = JSON.parse(event.data) as { last?: number };
				if (typeof payload.last === "number") {
					lastQuoteRef.current[symbol] = payload.last;
					setStreamLastTickAt(Date.now());
				}
			} catch {
				/* ignore */
			}
		};

		const onAlert = (event: MessageEvent<string>) => {
			try {
				const payload = JSON.parse(event.data) as {
					ruleId?: string;
					symbol?: string;
					message?: string;
				};
				const alertSymbol = typeof payload.symbol === "string" ? payload.symbol : symbol;
				const message =
					typeof payload.message === "string" && payload.message.trim().length > 0
						? payload.message
						: `${alertSymbol} alert triggered`;
				if (typeof payload.ruleId === "string" && payload.ruleId.trim().length > 0) {
					createNotification(payload.ruleId, alertSymbol, message);
				}
				onStatusMessage(message);
			} catch {
				/* ignore */
			}
		};

		const onError = () => {
			if (!degradedRef.current) {
				degradedRef.current = true;
				setStreamState("degraded");
				onStatusMessage("Realtime stream interrupted, retrying...");
			} else {
				setStreamState("reconnecting");
			}
			setStreamReconnects((prev) => prev + 1);
		};

		const onStreamStatus = (event: MessageEvent<string>) => {
			try {
				const payload = JSON.parse(event.data) as {
					state?: string;
					reconnectAttempts?: number;
					lastQuoteAt?: string;
				};
				if (
					typeof payload.reconnectAttempts === "number" &&
					Number.isFinite(payload.reconnectAttempts)
				) {
					setStreamReconnects(payload.reconnectAttempts);
				}
				if (typeof payload.lastQuoteAt === "string" && payload.lastQuoteAt.trim().length > 0) {
					const parsed = Date.parse(payload.lastQuoteAt);
					if (Number.isFinite(parsed)) setStreamLastTickAt(parsed);
				}
				switch (payload.state) {
					case "live":
						setStreamState("live");
						break;
					case "polling_fallback":
						setStreamState("degraded");
						break;
					case "reconnecting":
						setStreamState("reconnecting");
						break;
				}
			} catch {
				/* ignore */
			}
		};

		source.addEventListener("ready", onReady as EventListener);
		source.addEventListener("snapshot", onSnapshot as EventListener);
		source.addEventListener("quote", onQuote as EventListener);
		source.addEventListener("candle", onCandle as EventListener);
		source.addEventListener("alert", onAlert as EventListener);
		source.addEventListener("stream_status", onStreamStatus as EventListener);
		source.addEventListener("error", onError as EventListener);
		source.onerror = onError;

		return () => {
			source.removeEventListener("ready", onReady as EventListener);
			source.removeEventListener("snapshot", onSnapshot as EventListener);
			source.removeEventListener("quote", onQuote as EventListener);
			source.removeEventListener("candle", onCandle as EventListener);
			source.removeEventListener("alert", onAlert as EventListener);
			source.removeEventListener("stream_status", onStreamStatus as EventListener);
			source.removeEventListener("error", onError as EventListener);
			source.close();
		};
	}, [
		symbol,
		timeframe,
		requestLimit,
		enabled,
		ohlcvQueryKey,
		queryClient,
		onStatusMessage,
		onSetDataProvider,
		onSetDataMode,
	]);

	return { streamState, streamReconnects, streamLastTickAt, lastQuoteRef };
}
