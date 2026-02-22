import type { NextRequest } from "next/server";
import { canonicalizeFusionSymbol } from "@/lib/fusion-symbols";
import { getProviderManager } from "@/lib/providers";
import type { OHLCVData, TimeframeValue } from "@/lib/providers/types";
import { evaluateTriggeredOrdersForSymbol } from "@/lib/server/orders-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ENCODER = new TextEncoder();

const TIMEFRAME_SECONDS: Record<TimeframeValue, number> = {
	"1m": 60,
	"5m": 300,
	"15m": 900,
	"30m": 1800,
	"1H": 3600,
	"4H": 14400,
	"1D": 86400,
	"1W": 604800,
	"1M": 2592000,
};

function safeTimeframe(raw: string | null): TimeframeValue {
	const value = raw || "1H";
	if (value in TIMEFRAME_SECONDS) {
		return value as TimeframeValue;
	}
	return "1H";
}

function intervalForTimeframe(timeframe: TimeframeValue): number {
	switch (timeframe) {
		case "1m":
			return 5000;
		case "5m":
			return 8000;
		case "15m":
		case "30m":
			return 12000;
		case "1H":
		case "4H":
			return 15000;
		default:
			return 20000;
	}
}

function sseEvent(name: string, data: unknown): Uint8Array {
	return ENCODER.encode(`event: ${name}\ndata: ${JSON.stringify(data)}\n\n`);
}

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const rawSymbol = searchParams.get("symbol");

	if (!rawSymbol) {
		return new Response("Missing symbol", { status: 400 });
	}

	const symbol = canonicalizeFusionSymbol(rawSymbol);
	const timeframe = safeTimeframe(searchParams.get("timeframe"));
	const manager = getProviderManager();
	const pollMs = intervalForTimeframe(timeframe);

	let closeStream: (() => void) | null = null;

	const stream = new ReadableStream<Uint8Array>({
		start(controller) {
			let closed = false;
			let pollingTimer: ReturnType<typeof setInterval> | null = null;
			let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
			let degraded = false;

			const close = () => {
				if (closed) return;
				closed = true;
				if (pollingTimer) clearInterval(pollingTimer);
				if (heartbeatTimer) clearInterval(heartbeatTimer);
				controller.close();
			};
			closeStream = close;

			const publishLatestCandle = async () => {
				if (closed) return;
				try {
					const nowSec = Math.floor(Date.now() / 1000);
					const tfSec = TIMEFRAME_SECONDS[timeframe];
					const start = nowSec - tfSec * 8;
					const { data, provider } = await manager.fetchOHLCV(symbol, timeframe, 2, {
						start,
						end: nowSec,
					});

					const sorted = [...data].sort((a, b) => a.time - b.time);
					const candle = sorted[sorted.length - 1];
					if (!candle) return;
					const executed = await evaluateTriggeredOrdersForSymbol(symbol, candle.close);

					controller.enqueue(
						sseEvent("candle", {
							symbol,
							timeframe,
							provider,
							candle: candle as OHLCVData,
							executionsCount: executed.length,
							emittedAt: nowSec,
						}),
					);
					if (degraded) {
						degraded = false;
						controller.enqueue(
							sseEvent("stream_status", {
								state: "live",
								message: "candle stream recovered",
								ts: new Date().toISOString(),
							}),
						);
					}
				} catch (error) {
					const message = error instanceof Error ? error.message : "stream fetch failed";
					degraded = true;
					controller.enqueue(
						sseEvent("stream_status", {
							state: "degraded",
							message,
							ts: new Date().toISOString(),
						}),
					);
					controller.enqueue(sseEvent("error", { symbol, timeframe, message }));
				}
			};

			request.signal.addEventListener("abort", close);

			controller.enqueue(
				sseEvent("ready", {
					symbol,
					timeframe,
					pollMs,
				}),
			);
			controller.enqueue(
				sseEvent("stream_status", {
					state: "live",
					message: "candle stream connected",
					ts: new Date().toISOString(),
				}),
			);

			void publishLatestCandle();
			pollingTimer = setInterval(() => {
				void publishLatestCandle();
			}, pollMs);

			heartbeatTimer = setInterval(() => {
				if (closed) return;
				controller.enqueue(ENCODER.encode(`: heartbeat ${Date.now()}\n\n`));
			}, 15000);
		},
		cancel() {
			if (closeStream) {
				closeStream();
			}
		},
	});

	return new Response(stream, {
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache, no-transform",
			Connection: "keep-alive",
			"X-Accel-Buffering": "no",
		},
	});
}
