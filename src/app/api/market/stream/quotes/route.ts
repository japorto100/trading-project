import type { NextRequest } from "next/server";
import { getProviderManager } from "@/lib/providers";
import type { QuoteData } from "@/lib/providers/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ENCODER = new TextEncoder();

function sseEvent(name: string, data: unknown): Uint8Array {
	return ENCODER.encode(`event: ${name}\ndata: ${JSON.stringify(data)}\n\n`);
}

function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

function parseSymbols(raw: string | null): string[] {
	if (!raw) return [];
	const items = raw
		.split(",")
		.map((entry) => entry.trim().toUpperCase())
		.filter(Boolean);
	return [...new Set(items)].slice(0, 80);
}

function quoteSignature(quote: QuoteData): string {
	return `${quote.price}:${quote.changePercent}:${quote.timestamp}`;
}

export async function GET(request: NextRequest) {
	const symbols = parseSymbols(request.nextUrl.searchParams.get("symbols"));
	if (symbols.length === 0) {
		return new Response("Missing symbols", { status: 400 });
	}

	const rawPollMs = Number(request.nextUrl.searchParams.get("pollMs") ?? "4000");
	const pollMs = Number.isFinite(rawPollMs) ? clamp(Math.floor(rawPollMs), 1000, 30000) : 4000;

	const manager = getProviderManager();

	let closeStream: (() => void) | null = null;
	const stream = new ReadableStream<Uint8Array>({
		start(controller) {
			let closed = false;
			let degraded = false;
			let timer: ReturnType<typeof setInterval> | null = null;
			let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
			const lastBySymbol = new Map<string, string>();

			const close = () => {
				if (closed) return;
				closed = true;
				if (timer) clearInterval(timer);
				if (heartbeatTimer) clearInterval(heartbeatTimer);
				controller.close();
			};
			closeStream = close;

			const publishBatch = async () => {
				if (closed) return;
				try {
					const quotes = await manager.getQuotes(symbols);
					const changed: Record<string, QuoteData> = {};

					for (const symbol of symbols) {
						const quote = quotes.get(symbol);
						if (!quote) continue;
						const signature = quoteSignature(quote);
						const previous = lastBySymbol.get(symbol);
						if (signature === previous) continue;
						lastBySymbol.set(symbol, signature);
						changed[symbol] = quote;
					}

					if (Object.keys(changed).length > 0) {
						controller.enqueue(
							sseEvent("quote_batch", {
								symbols: Object.keys(changed),
								quotes: changed,
								emittedAt: Date.now(),
							}),
						);
					}

					if (degraded) {
						degraded = false;
						controller.enqueue(
							sseEvent("stream_status", {
								state: "live",
								message: "Quote batch stream recovered",
								ts: new Date().toISOString(),
							}),
						);
					}
				} catch (error: unknown) {
					degraded = true;
					controller.enqueue(
						sseEvent("stream_status", {
							state: "degraded",
							message: error instanceof Error ? error.message : "quote batch fetch failed",
							ts: new Date().toISOString(),
						}),
					);
				}
			};

			request.signal.addEventListener("abort", close);

			controller.enqueue(
				sseEvent("ready", {
					symbols,
					pollMs,
					emittedAt: Date.now(),
				}),
			);

			void publishBatch();
			timer = setInterval(() => {
				void publishBatch();
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
