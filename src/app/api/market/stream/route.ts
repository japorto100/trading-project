import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import type { PriceAlert } from "@/lib/alerts";
import { canonicalizeFusionSymbol, resolveFusionSymbol } from "@/lib/fusion-symbols";
import type { OHLCVData, TimeframeValue } from "@/lib/providers/types";
import { evaluateTriggeredOrdersForSymbol } from "@/lib/server/orders-store";
import { listPriceAlerts, updatePriceAlert } from "@/lib/server/price-alerts-store";
import { isLegacyCandleStreamFallbackEnabled } from "@/lib/server/stream-runtime-flags";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ENCODER = new TextEncoder();
const DECODER = new TextDecoder();
const DEFAULT_GATEWAY_BASE_URL = "http://127.0.0.1:9060";
const SUPPORTED_SERVER_ALERT_CONDITIONS = new Set(["above", "below", "crosses_up", "crosses_down"]);

const TIMEFRAME_SECONDS: Record<TimeframeValue, number> = {
	"1m": 60,
	"3m": 180,
	"5m": 300,
	"15m": 900,
	"30m": 1800,
	"1H": 3600,
	"2H": 7200,
	"4H": 14400,
	"1D": 86400,
	"1W": 604800,
	"1M": 2592000,
};

interface GoStreamRoute {
	symbol: string;
	exchange: string;
	assetType: string;
}

interface CandleStreamEventPayload {
	symbol?: string;
	timeframe?: string;
	provider?: string;
	candle?: OHLCVData;
	executionsCount?: number;
}

interface GoMarketAlertEvent {
	id?: string;
	ruleId?: string;
	symbol?: string;
	condition?: string;
	target?: number;
	price?: number;
	previous?: number;
	triggeredAt?: string;
	message?: string;
}

interface ParsedSSEFrame {
	event: string;
	data: string;
}

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
		case "3m":
			return 7000;
		case "15m":
		case "30m":
			return 12000;
		case "1H":
		case "2H":
		case "4H":
			return 15000;
		default:
			return 20000;
	}
}

function sseEvent(name: string, data: unknown): Uint8Array {
	return ENCODER.encode(`event: ${name}\ndata: ${JSON.stringify(data)}\n\n`);
}

function inferGoStreamRoute(symbol: string): GoStreamRoute | null {
	const resolved = resolveFusionSymbol(symbol);
	if (!resolved) return null;

	switch (resolved.type) {
		case "crypto": {
			const upstreamSymbol = resolved.symbol.endsWith("/USD")
				? `${resolved.symbol.slice(0, -4)}/USDT`
				: resolved.symbol;
			return { symbol: upstreamSymbol, exchange: "binance", assetType: "spot" };
		}
		case "stock":
			return { symbol: resolved.symbol, exchange: "finnhub", assetType: "equity" };
		default:
			return null;
	}
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

async function loadServerAlertRules(profileKey: string | null, symbol: string) {
	if (!profileKey)
		return [] as Array<{
			id: string;
			symbol: string;
			condition: string;
			target: number;
			message: string;
			enabled: boolean;
		}>;
	const alerts = await listPriceAlerts(profileKey, symbol);
	return alerts
		.filter(
			(alert: PriceAlert) =>
				alert.enabled && !alert.triggered && SUPPORTED_SERVER_ALERT_CONDITIONS.has(alert.condition),
		)
		.map((alert: PriceAlert) => ({
			id: alert.id,
			symbol: canonicalizeFusionSymbol(alert.symbol),
			condition: alert.condition,
			target: alert.targetValue,
			message: alert.message ?? "",
			enabled: alert.enabled,
		}));
}

async function markAlertTriggered(
	profileKey: string | null,
	event: GoMarketAlertEvent,
): Promise<void> {
	if (!profileKey || !event.ruleId) return;
	const ts = event.triggeredAt ? Date.parse(event.triggeredAt) : Date.now();
	await updatePriceAlert(profileKey, event.ruleId, {
		triggered: true,
		triggeredAt: Number.isFinite(ts) ? ts : Date.now(),
	});
}

function buildGatewayBaseURL(): string {
	return (process.env.GO_GATEWAY_BASE_URL || DEFAULT_GATEWAY_BASE_URL).trim();
}

async function createGoBackedMarketStreamResponse(
	request: NextRequest,
	requestId: string,
	userRole: string,
	symbol: string,
	timeframe: TimeframeValue,
	streamRoute: GoStreamRoute,
	profileKey: string | null,
): Promise<Response | null> {
	const gatewayURL = new URL("/api/v1/stream/market", buildGatewayBaseURL());
	gatewayURL.searchParams.set("symbol", streamRoute.symbol);
	gatewayURL.searchParams.set("exchange", streamRoute.exchange);
	gatewayURL.searchParams.set("assetType", streamRoute.assetType);
	gatewayURL.searchParams.set("timeframe", timeframe);

	const alertRules = await loadServerAlertRules(profileKey, symbol);
	if (alertRules.length > 0) {
		gatewayURL.searchParams.set("alertRules", JSON.stringify(alertRules));
	}

	const headers: Record<string, string> = {
		Accept: "text/event-stream",
		"X-Request-ID": requestId,
	};
	if (userRole) {
		headers["X-User-Role"] = userRole;
	}

	let upstream: Response;
	try {
		upstream = await fetch(gatewayURL.toString(), {
			method: "GET",
			headers,
			cache: "no-store",
			signal: request.signal,
		});
	} catch {
		return null;
	}
	if (!upstream.ok || !upstream.body) {
		return null;
	}

	let cancel = false;
	const stream = new ReadableStream<Uint8Array>({
		start(controller) {
			const reader = upstream.body!.getReader();
			let buffer = "";

			const close = async () => {
				if (cancel) return;
				cancel = true;
				try {
					await reader.cancel();
				} catch {
					// ignore cancel errors
				}
				controller.close();
			};
			request.signal.addEventListener("abort", () => {
				void close();
			});

			const forwardFrame = async (frame: ParsedSSEFrame) => {
				if (cancel) return;
				if (frame.event === "candle") {
					try {
						const payload = JSON.parse(frame.data) as CandleStreamEventPayload;
						const candle = payload.candle;
						if (candle && typeof candle.close === "number") {
							const executed = await evaluateTriggeredOrdersForSymbol(symbol, candle.close);
							const nextPayload: CandleStreamEventPayload = {
								...payload,
								provider: payload.provider || "go-gateway",
								executionsCount: executed.length,
							};
							controller.enqueue(sseEvent("candle", nextPayload));
							return;
						}
					} catch {
						// fall through to raw forward
					}
				}
				if (frame.event === "alert") {
					try {
						const payload = JSON.parse(frame.data) as GoMarketAlertEvent;
						await markAlertTriggered(profileKey, payload);
						controller.enqueue(sseEvent("alert", payload));
						return;
					} catch {
						// fall through to raw forward
					}
				}
				controller.enqueue(sseEvent(frame.event, JSON.parse(frame.data)));
			};

			void (async () => {
				try {
					while (!cancel) {
						const { done, value } = await reader.read();
						if (done) break;
						buffer += DECODER.decode(value, { stream: true });
						let boundary = buffer.indexOf("\n\n");
						while (boundary >= 0) {
							const rawFrame = buffer.slice(0, boundary);
							buffer = buffer.slice(boundary + 2);
							const frame = parseSSEFrame(rawFrame);
							if (frame) {
								await forwardFrame(frame);
							}
							boundary = buffer.indexOf("\n\n");
						}
					}
					if (!cancel) {
						const trailing = buffer.trim();
						if (trailing) {
							const frame = parseSSEFrame(trailing);
							if (frame) {
								await forwardFrame(frame);
							}
						}
					}
				} catch {
					if (!cancel) {
						controller.enqueue(
							sseEvent("stream_status", {
								state: "degraded",
								message: "Go stream proxy interrupted",
								ts: new Date().toISOString(),
							}),
						);
					}
				} finally {
					if (!cancel) {
						controller.close();
					}
				}
			})();
		},
		cancel() {
			cancel = true;
		},
	});

	return new Response(stream, {
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache, no-transform",
			Connection: "keep-alive",
			"X-Accel-Buffering": "no",
			"X-Request-ID": requestId,
			"X-Stream-Backend": "go-sse",
		},
	});
}

function createLegacyPollingStreamResponse(
	request: NextRequest,
	requestId: string,
	userRole: string,
	symbol: string,
	timeframe: TimeframeValue,
	fallbackReason: string,
): Response {
	const pollMs = intervalForTimeframe(timeframe);
	const ohlcvURL = new URL("/api/market/ohlcv", request.nextUrl.origin);
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
					const url = new URL(ohlcvURL.toString());
					url.searchParams.set("symbol", symbol);
					url.searchParams.set("timeframe", timeframe);
					url.searchParams.set("limit", "2");
					url.searchParams.set("start", String(start));
					url.searchParams.set("end", String(nowSec));
					const headers: Record<string, string> = {
						Accept: "application/json",
						"X-Request-ID": requestId,
					};
					if (userRole) headers["X-User-Role"] = userRole;
					const response = await fetch(url.toString(), {
						headers,
						cache: "no-store",
						signal: AbortSignal.timeout(10000),
					});
					if (!response.ok) throw new Error(`ohlcv route returned ${response.status}`);
					const payload = (await response.json()) as {
						success?: boolean;
						provider?: string;
						data?: OHLCVData[];
					};
					if (!payload.success || !Array.isArray(payload.data)) {
						throw new Error("invalid ohlcv route payload");
					}
					const candle = [...payload.data].sort((a, b) => a.time - b.time).at(-1);
					if (!candle) return;
					const executed = await evaluateTriggeredOrdersForSymbol(symbol, candle.close);

					if (closed) return;
					controller.enqueue(
						sseEvent("candle", {
							symbol,
							timeframe,
							provider: payload.provider || "nextjs",
							candle,
							executionsCount: executed.length,
							emittedAt: nowSec,
						}),
					);
					if (degraded) {
						degraded = false;
						if (!closed) {
							controller.enqueue(
								sseEvent("stream_status", {
									state: "live",
									message: "candle stream recovered",
									ts: new Date().toISOString(),
								}),
							);
						}
					}
				} catch (error) {
					degraded = true;
					if (!closed) {
						try {
							controller.enqueue(
								sseEvent("stream_status", {
									state: "degraded",
									message: error instanceof Error ? error.message : "stream fetch failed",
									ts: new Date().toISOString(),
								}),
							);
							controller.enqueue(sseEvent("error", { symbol, timeframe }));
						} catch {
							// Ignore if already closed during catch
						}
					}
				}
			};

			request.signal.addEventListener("abort", close);
			if (!closed) {
				controller.enqueue(
					sseEvent("ready", {
						symbol,
						timeframe,
						pollMs,
						backend: "legacy-polling",
						fallbackReason,
					}),
				);
				controller.enqueue(
					sseEvent("stream_status", {
						state: "live",
						message: "candle stream connected (legacy polling fallback)",
						fallbackReason,
						ts: new Date().toISOString(),
					}),
				);
			}

			void publishLatestCandle();
			pollingTimer = setInterval(() => {
				void publishLatestCandle();
			}, pollMs);
			heartbeatTimer = setInterval(() => {
				if (closed) return;
				try {
					controller.enqueue(ENCODER.encode(`: heartbeat ${Date.now()}\n\n`));
				} catch {
					// Ignore if closed
				}
			}, 15000);
		},
		cancel() {
			if (closeStream) closeStream();
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

export async function GET(request: NextRequest) {
	const requestId = request.headers.get("x-request-id")?.trim() || randomUUID();
	const userRole = request.headers.get("x-user-role")?.trim() || "";
	const searchParams = request.nextUrl.searchParams;
	const rawSymbol = searchParams.get("symbol");

	if (!rawSymbol) {
		return new Response("Missing symbol", { status: 400 });
	}

	const symbol = canonicalizeFusionSymbol(rawSymbol);
	const timeframe = safeTimeframe(searchParams.get("timeframe"));
	const profileKey = searchParams.get("profileKey")?.trim() || null;
	const goRoute = inferGoStreamRoute(symbol);
	if (goRoute) {
		const goResponse = await createGoBackedMarketStreamResponse(
			request,
			requestId,
			userRole,
			symbol,
			timeframe,
			goRoute,
			profileKey,
		);
		if (goResponse) {
			return goResponse;
		}
		if (!isLegacyCandleStreamFallbackEnabled()) {
			return new Response(
				JSON.stringify({
					success: false,
					error: "Go stream unavailable and legacy fallback disabled",
					code: "stream_fallback_disabled",
				}),
				{
					status: 502,
					headers: {
						"Content-Type": "application/json",
						"X-Request-ID": requestId,
						"X-Stream-Backend": "unavailable",
					},
				},
			);
		}
		return createLegacyPollingStreamResponse(
			request,
			requestId,
			userRole,
			symbol,
			timeframe,
			"go_stream_unavailable",
		);
	}

	if (!isLegacyCandleStreamFallbackEnabled()) {
		return new Response(
			JSON.stringify({
				success: false,
				error: "Symbol not streamable via Go and legacy fallback disabled",
				code: "unsupported_stream_symbol",
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

	return createLegacyPollingStreamResponse(
		request,
		requestId,
		userRole,
		symbol,
		timeframe,
		"unsupported_symbol_type",
	);
}
