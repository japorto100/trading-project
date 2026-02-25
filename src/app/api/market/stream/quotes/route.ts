import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { resolveFusionSymbol } from "@/lib/fusion-symbols";
import type { QuoteData } from "@/lib/providers/types";
import { isLegacyQuotesStreamFallbackEnabled } from "@/lib/server/stream-runtime-flags";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ENCODER = new TextEncoder();
const DECODER = new TextDecoder();
const DEFAULT_GATEWAY_BASE_URL = "http://127.0.0.1:9060";

interface GoStreamRoute {
	requestedSymbol: string;
	upstreamSymbol: string;
	exchange: string;
	assetType: string;
}

interface ParsedSSEFrame {
	event: string;
	data: string;
}

interface GoQuoteEventPayload {
	symbol?: string;
	exchange?: string;
	assetType?: string;
	last?: number;
	high?: number;
	low?: number;
	volume?: number;
	timestamp?: number;
}

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

function parseSSEFrame(rawFrame: string): ParsedSSEFrame | null {
	const frame = rawFrame.replace(/\r/g, "").trim();
	if (!frame) return null;
	let event = "message";
	const dataLines: string[] = [];
	for (const line of frame.split("\n")) {
		if (!line || line.startsWith(":")) continue;
		if (line.startsWith("event:")) {
			event = line.slice(6).trim() || "message";
			continue;
		}
		if (line.startsWith("data:")) {
			dataLines.push(line.slice(5).trimStart());
		}
	}
	if (dataLines.length === 0) return null;
	return { event, data: dataLines.join("\n") };
}

function buildGatewayBaseURL(): string {
	return (process.env.GO_GATEWAY_BASE_URL || DEFAULT_GATEWAY_BASE_URL).trim();
}

function inferGoStreamRoute(symbol: string): GoStreamRoute | null {
	const resolved = resolveFusionSymbol(symbol);
	if (!resolved) return null;

	switch (resolved.type) {
		case "crypto": {
			const upstreamSymbol = resolved.symbol.endsWith("/USD")
				? `${resolved.symbol.slice(0, -4)}/USDT`
				: resolved.symbol;
			return {
				requestedSymbol: resolved.symbol,
				upstreamSymbol,
				exchange: "binance",
				assetType: "spot",
			};
		}
		case "stock":
			return {
				requestedSymbol: resolved.symbol,
				upstreamSymbol: resolved.symbol,
				exchange: "finnhub",
				assetType: "equity",
			};
		default:
			return null;
	}
}

function toQuoteData(route: GoStreamRoute, payload: GoQuoteEventPayload): QuoteData | null {
	const price = Number(payload.last);
	if (!Number.isFinite(price) || price <= 0) {
		return null;
	}
	const timestamp = Number(payload.timestamp);
	const high = Number(payload.high);
	const low = Number(payload.low);
	const volume = Number(payload.volume);
	return {
		symbol: route.requestedSymbol,
		price,
		change: 0,
		changePercent: 0,
		high: Number.isFinite(high) ? high : price,
		low: Number.isFinite(low) ? low : price,
		open: price,
		volume: Number.isFinite(volume) ? volume : 0,
		timestamp:
			Number.isFinite(timestamp) && timestamp > 0 ? timestamp : Math.floor(Date.now() / 1000),
	};
}

function createLegacyPollingQuotesStreamResponse(
	request: NextRequest,
	requestId: string,
	userRole: string,
	symbols: string[],
	pollMs: number,
	fallbackReason: string,
): Response {
	const quoteURL = new URL("/api/market/quote", request.nextUrl.origin);
	quoteURL.searchParams.set("symbols", symbols.join(","));

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
					const headers: Record<string, string> = {
						Accept: "application/json",
						"X-Request-ID": requestId,
					};
					if (userRole) {
						headers["X-User-Role"] = userRole;
					}
					const response = await fetch(quoteURL.toString(), {
						headers,
						cache: "no-store",
						signal: AbortSignal.timeout(10000),
					});
					if (!response.ok) {
						throw new Error(`quote route returned ${response.status}`);
					}
					const payload = (await response.json()) as {
						success?: boolean;
						quotes?: Record<string, QuoteData>;
					};
					if (!payload.success || !payload.quotes) {
						throw new Error("invalid quote route payload");
					}
					const changed: Record<string, QuoteData> = {};

					for (const symbol of symbols) {
						const quote = payload.quotes[symbol];
						if (!quote) continue;
						const signature = quoteSignature(quote);
						const previous = lastBySymbol.get(symbol);
						if (signature === previous) continue;
						lastBySymbol.set(symbol, signature);
						changed[symbol] = quote;
					}

					if (Object.keys(changed).length > 0) {
						if (!closed) {
							controller.enqueue(
								sseEvent("quote_batch", {
									symbols: Object.keys(changed),
									quotes: changed,
									emittedAt: Date.now(),
								}),
							);
						}
					}

					if (degraded) {
						degraded = false;
						if (!closed) {
							controller.enqueue(
								sseEvent("stream_status", {
									state: "live",
									message: "Quote batch stream recovered (legacy polling)",
									fallbackReason,
									ts: new Date().toISOString(),
								}),
							);
						}
					}
				} catch (error: unknown) {
					degraded = true;
					if (!closed) {
						try {
							controller.enqueue(
								sseEvent("stream_status", {
									state: "degraded",
									message: error instanceof Error ? error.message : "quote batch fetch failed",
									fallbackReason,
									ts: new Date().toISOString(),
								}),
							);
						} catch {
							// Already closed
						}
					}
				}
			};

			request.signal.addEventListener("abort", close);
			if (!closed) {
				controller.enqueue(
					sseEvent("ready", {
						symbols,
						pollMs,
						backend: "legacy-polling",
						fallbackReason,
						emittedAt: Date.now(),
					}),
				);
			}
			void publishBatch();
			timer = setInterval(() => {
				void publishBatch();
			}, pollMs);
			heartbeatTimer = setInterval(() => {
				if (closed) return;
				try {
					controller.enqueue(ENCODER.encode(`: heartbeat ${Date.now()}\n\n`));
				} catch {
					// Closed
				}
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
			"X-Request-ID": requestId,
			"X-Stream-Backend": "next-legacy-polling",
			"X-Stream-Fallback": "legacy-polling",
			"X-Stream-Fallback-Reason": fallbackReason,
		},
	});
}

function createGoMultiplexQuotesStreamResponse(
	request: NextRequest,
	requestId: string,
	userRole: string,
	symbols: string[],
	routes: GoStreamRoute[],
	pollMs: number,
): Response {
	let closeStream: (() => void) | null = null;
	const stream = new ReadableStream<Uint8Array>({
		start(controller) {
			let closed = false;
			let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
			const lastBySymbol = new Map<string, string>();
			let liveConnections = 0;
			let reconnectCount = 0;
			const abortController = new AbortController();

			const close = () => {
				if (closed) return;
				closed = true;
				abortController.abort();
				if (heartbeatTimer) clearInterval(heartbeatTimer);
				controller.close();
			};
			closeStream = close;

			const emitStatus = (state: "live" | "degraded" | "reconnecting", message: string) => {
				if (closed) return;
				try {
					controller.enqueue(
						sseEvent("stream_status", {
							state,
							message,
							liveConnections,
							reconnectAttempts: reconnectCount,
							ts: new Date().toISOString(),
						}),
					);
				} catch {
					// Closed
				}
			};

			const forwardQuote = (route: GoStreamRoute, quote: QuoteData) => {
				const signature = quoteSignature(quote);
				const previous = lastBySymbol.get(route.requestedSymbol);
				if (signature === previous) return;
				lastBySymbol.set(route.requestedSymbol, signature);
				if (!closed) {
					try {
						controller.enqueue(
							sseEvent("quote_batch", {
								symbols: [route.requestedSymbol],
								quotes: { [route.requestedSymbol]: quote },
								emittedAt: Date.now(),
							}),
						);
					} catch {
						// Closed
					}
				}
			};

			const startUpstream = async (route: GoStreamRoute) => {
				const upstreamURL = new URL("/api/v1/stream/market", buildGatewayBaseURL());
				upstreamURL.searchParams.set("symbol", route.upstreamSymbol);
				upstreamURL.searchParams.set("exchange", route.exchange);
				upstreamURL.searchParams.set("assetType", route.assetType);
				const headers: Record<string, string> = {
					Accept: "text/event-stream",
					"X-Request-ID": requestId,
				};
				if (userRole) {
					headers["X-User-Role"] = userRole;
				}

				while (!closed) {
					let response: Response;
					try {
						response = await fetch(upstreamURL.toString(), {
							method: "GET",
							headers,
							cache: "no-store",
							signal: abortController.signal,
						});
					} catch {
						if (closed) return;
						reconnectCount += 1;
						emitStatus("reconnecting", `quote stream connect failed for ${route.requestedSymbol}`);
						await new Promise((resolve) => setTimeout(resolve, Math.min(pollMs, 5000)));
						continue;
					}
					if (!response.ok || !response.body) {
						reconnectCount += 1;
						emitStatus("degraded", `quote stream unavailable for ${route.requestedSymbol}`);
						await new Promise((resolve) => setTimeout(resolve, Math.min(pollMs, 5000)));
						continue;
					}

					liveConnections += 1;
					emitStatus("live", `quote stream connected for ${route.requestedSymbol}`);
					const reader = response.body.getReader();
					let buffer = "";
					try {
						while (!closed) {
							const { done, value } = await reader.read();
							if (done) break;
							buffer += DECODER.decode(value, { stream: true });
							let boundary = buffer.indexOf("\n\n");
							while (boundary >= 0) {
								const rawFrame = buffer.slice(0, boundary);
								buffer = buffer.slice(boundary + 2);
								const frame = parseSSEFrame(rawFrame);
								if (frame && frame.event === "quote") {
									try {
										const payload = JSON.parse(frame.data) as GoQuoteEventPayload;
										const quote = toQuoteData(route, payload);
										if (quote) {
											forwardQuote(route, quote);
										}
									} catch {
										// ignore malformed quote payloads
									}
								}
								boundary = buffer.indexOf("\n\n");
							}
						}
					} catch {
						if (!closed) {
							reconnectCount += 1;
							emitStatus("reconnecting", `quote stream interrupted for ${route.requestedSymbol}`);
						}
					} finally {
						try {
							await reader.cancel();
						} catch {
							// ignore cancel errors
						}
						liveConnections = Math.max(0, liveConnections - 1);
					}
					if (closed) return;
					await new Promise((resolve) => setTimeout(resolve, Math.min(pollMs, 5000)));
				}
			};

			request.signal.addEventListener("abort", close);
			if (!closed) {
				controller.enqueue(
					sseEvent("ready", {
						symbols,
						pollMs,
						backend: "go-sse-multiplex",
						streamableSymbols: routes.map((route) => route.requestedSymbol),
						emittedAt: Date.now(),
					}),
				);
			}
			heartbeatTimer = setInterval(() => {
				if (closed) return;
				try {
					controller.enqueue(ENCODER.encode(`: heartbeat ${Date.now()}\n\n`));
				} catch {
					// Closed
				}
			}, 15000);

			for (const route of routes) {
				void startUpstream(route);
			}
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
			"X-Request-ID": requestId,
			"X-Stream-Backend": "go-sse-multiplex",
		},
	});
}

export async function GET(request: NextRequest) {
	const requestId = request.headers.get("x-request-id")?.trim() || randomUUID();
	const userRole = request.headers.get("x-user-role")?.trim() || "";
	const symbols = parseSymbols(request.nextUrl.searchParams.get("symbols"));
	if (symbols.length === 0) {
		return new Response("Missing symbols", { status: 400 });
	}

	const rawPollMs = Number(request.nextUrl.searchParams.get("pollMs") ?? "4000");
	const pollMs = Number.isFinite(rawPollMs) ? clamp(Math.floor(rawPollMs), 1000, 30000) : 4000;
	const streamRoutes = symbols.map(inferGoStreamRoute);
	const allStreamable = streamRoutes.every((route): route is GoStreamRoute => route !== null);

	if (allStreamable) {
		return createGoMultiplexQuotesStreamResponse(
			request,
			requestId,
			userRole,
			symbols,
			streamRoutes,
			pollMs,
		);
	}

	if (!isLegacyQuotesStreamFallbackEnabled()) {
		return new Response(
			JSON.stringify({
				success: false,
				error: "Legacy quotes stream fallback disabled for mixed/unsupported symbol set",
				code: "stream_quotes_fallback_disabled",
			}),
			{
				status: 400,
				headers: {
					"Content-Type": "application/json",
					"X-Request-ID": requestId,
					"X-Stream-Backend": "unsupported",
				},
			},
		);
	}

	return createLegacyPollingQuotesStreamResponse(
		request,
		requestId,
		userRole,
		symbols,
		pollMs,
		"mixed_or_unsupported_symbols",
	);
}
