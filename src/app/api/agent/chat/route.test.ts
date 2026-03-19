import { afterEach, describe, expect, it } from "bun:test";
import { NextRequest } from "next/server";
import { POST } from "./route";

const originalFetch = globalThis.fetch;

afterEach(() => {
	globalThis.fetch = originalFetch;
});

describe("POST /api/agent/chat", () => {
	it("rejects invalid JSON bodies with an explicit reason", async () => {
		const request = new NextRequest("http://localhost:3000/api/agent/chat", {
			method: "POST",
			headers: {
				"content-type": "application/json",
				"x-request-id": "req-agent-chat-invalid-json",
			},
			body: "{",
		});

		const response = await POST(request);
		expect(response.status).toBe(400);
		expect(response.headers.get("x-request-id")).toBe("req-agent-chat-invalid-json");

		const payload = (await response.json()) as { error: string; reason: string };
		expect(payload.error).toBe("Invalid request body");
		expect(payload.reason).toBe("INVALID_JSON_BODY");
	});

	it("rejects unexpected high-risk payload fields with an explicit reason", async () => {
		const request = new NextRequest("http://localhost:3000/api/agent/chat", {
			method: "POST",
			headers: {
				"content-type": "application/json",
				"x-request-id": "req-agent-chat-invalid-payload",
			},
			body: JSON.stringify({
				message: "hello",
				allowed_tools: ["filesystem.write"],
				required_scope: "approval-write",
			}),
		});

		const response = await POST(request);
		expect(response.status).toBe(400);
		expect(response.headers.get("x-request-id")).toBe("req-agent-chat-invalid-payload");

		const payload = (await response.json()) as { error: string; reason: string };
		expect(payload.error).toBe("Invalid chat payload");
		expect(payload.reason).toBe("INVALID_CHAT_PAYLOAD");
	});

	it("forwards only bounded chat fields to the gateway", async () => {
		let forwardedBody: Record<string, unknown> | null = null;
		let forwardedRole: string | null = null;
		globalThis.fetch = (async (_input, init) => {
			forwardedBody = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
			forwardedRole = (init?.headers as Record<string, string>)["X-User-Role"] ?? null;
			return new Response("event: done\ndata: {}\n\n", {
				status: 200,
				headers: { "Content-Type": "text/event-stream" },
			});
		}) as typeof fetch;

		const request = new NextRequest("http://localhost:3000/api/agent/chat", {
			method: "POST",
			headers: {
				"content-type": "application/json",
				"x-request-id": "req-agent-chat-forward",
				"x-user-role": "analyst",
			},
			body: JSON.stringify({
				message: "summarize this",
				threadId: "thread-1",
				agentId: "agent-1",
			}),
		});

		const response = await POST(request);
		expect(response.status).toBe(200);
		expect(response.headers.get("x-request-id")).toBe("req-agent-chat-forward");
		expect(forwardedRole).toBe("analyst");
		expect(forwardedBody).toEqual({
			message: "summarize this",
			threadId: "thread-1",
			agentId: "agent-1",
		});
	});
});
