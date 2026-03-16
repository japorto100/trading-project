// Agent Chat BFF — Phase 22a
// SSE proxy: Next.js → Go Gateway /api/v1/agent/chat → Python memory-service → Anthropic
// Security: no browser-direct tool path; Gateway enforces RBAC + audit.

import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { getErrorMessage } from "@/lib/utils";

const ENCODER = new TextEncoder();
const DECODER = new TextDecoder();
const DEFAULT_GATEWAY_BASE_URL = "http://127.0.0.1:9060";

function sseEvent(name: string, data: unknown): Uint8Array {
	return ENCODER.encode(`event: ${name}\ndata: ${JSON.stringify(data)}\n\n`);
}

function buildGatewayURL(): string {
	return (process.env.GO_GATEWAY_BASE_URL || DEFAULT_GATEWAY_BASE_URL).trim();
}

interface ChatRequestBody {
	message?: string;
	threadId?: string;
	agentId?: string;
}

export async function POST(request: NextRequest) {
	const requestId = request.headers.get("x-request-id")?.trim() || randomUUID();
	const userRole = request.headers.get("x-user-role")?.trim() || "";

	let body: ChatRequestBody;
	try {
		body = (await request.json()) as ChatRequestBody;
	} catch {
		return new Response(JSON.stringify({ error: "Invalid request body" }), {
			status: 400,
			headers: { "Content-Type": "application/json", "X-Request-ID": requestId },
		});
	}

	const message = body.message?.trim();
	if (!message) {
		return new Response(JSON.stringify({ error: "message is required" }), {
			status: 400,
			headers: { "Content-Type": "application/json", "X-Request-ID": requestId },
		});
	}

	const gatewayURL = new URL("/api/v1/agent/chat", buildGatewayURL());
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		Accept: "text/event-stream",
		"X-Request-ID": requestId,
	};
	if (userRole) headers["X-User-Role"] = userRole;

	let upstream: Response;
	try {
		upstream = await fetch(gatewayURL.toString(), {
			method: "POST",
			headers,
			body: JSON.stringify({
				message,
				threadId: body.threadId,
				agentId: body.agentId,
			}),
			cache: "no-store",
			signal: request.signal,
		});
	} catch (err) {
		// Gateway unreachable — return degraded SSE stream
		const stream = new ReadableStream<Uint8Array>({
			start(controller) {
				controller.enqueue(
					sseEvent("error", {
						message: `Agent gateway unreachable: ${getErrorMessage(err)}`,
						code: "GATEWAY_UNAVAILABLE",
						requestId,
					}),
				);
				controller.close();
			},
		});
		return new Response(stream, {
			headers: {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache, no-transform",
				"X-Request-ID": requestId,
				"X-Stream-Backend": "unavailable",
			},
		});
	}

	if (!upstream.ok || !upstream.body) {
		const stream = new ReadableStream<Uint8Array>({
			start(controller) {
				controller.enqueue(
					sseEvent("error", {
						message: `Agent gateway error: HTTP ${upstream.status}`,
						code: "GATEWAY_ERROR",
						requestId,
					}),
				);
				controller.close();
			},
		});
		return new Response(stream, {
			headers: {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache, no-transform",
				"X-Request-ID": requestId,
			},
		});
	}

	// Proxy upstream SSE stream to client
	let cancelled = false;
	const proxyStream = new ReadableStream<Uint8Array>({
		start(controller) {
			const reader = upstream.body!.getReader();
			let buffer = "";

			const close = async () => {
				if (cancelled) return;
				cancelled = true;
				try {
					await reader.cancel();
				} catch {
					// ignore
				}
				controller.close();
			};

			request.signal.addEventListener("abort", () => {
				void close();
			});

			void (async () => {
				try {
					while (!cancelled) {
						const { done, value } = await reader.read();
						if (done) break;
						buffer += DECODER.decode(value, { stream: true });
						let boundary = buffer.indexOf("\n\n");
						while (boundary >= 0) {
							const rawFrame = buffer.slice(0, boundary);
							buffer = buffer.slice(boundary + 2);
							if (rawFrame.trim()) {
								controller.enqueue(ENCODER.encode(`${rawFrame}\n\n`));
							}
							boundary = buffer.indexOf("\n\n");
						}
					}
					// flush trailing
					if (!cancelled && buffer.trim()) {
						controller.enqueue(ENCODER.encode(`${buffer}\n\n`));
					}
				} catch (err) {
					if (!cancelled) {
						controller.enqueue(
							sseEvent("error", {
								message: `Stream interrupted: ${getErrorMessage(err)}`,
								code: "STREAM_INTERRUPTED",
								requestId,
							}),
						);
					}
				} finally {
					if (!cancelled) {
						controller.close();
					}
				}
			})();
		},
		cancel() {
			cancelled = true;
		},
	});

	return new Response(proxyStream, {
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache, no-transform",
			Connection: "keep-alive",
			"X-Accel-Buffering": "no",
			"X-Request-ID": requestId,
			"X-Stream-Backend": "go-agent",
		},
	});
}
