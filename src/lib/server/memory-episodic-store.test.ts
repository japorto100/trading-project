import { afterEach, describe, expect, it, mock } from "bun:test";
import {
	createAgentEpisode,
	listAgentEpisodes,
	pruneExpiredEpisodes,
} from "./memory-episodic-store";

const originalFetch = globalThis.fetch;

afterEach(() => {
	globalThis.fetch = originalFetch;
	mock.restore();
});

describe("memory-episodic-store", () => {
	it("creates episodes through the gateway-backed memory endpoint", async () => {
		globalThis.fetch = mock(async (input, init) => {
			const url = typeof input === "string" ? input : input.toString();
			expect(url).toContain("/api/v1/memory/episode");
			expect(init?.method).toBe("POST");
			const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
			expect(body.session_id).toBe("sess-1");
			expect(body.agent_role).toBe("planner");
			expect(body.retain_days).toBeGreaterThanOrEqual(1);
			return new Response(
				JSON.stringify({
					ok: true,
					id: "ep_123",
					created_at: "2026-03-19T10:00:00.000Z",
				}),
				{ status: 201, headers: { "Content-Type": "application/json" } },
			);
		}) as typeof fetch;

		const episode = await createAgentEpisode({
			sessionId: "sess-1",
			agentRole: "planner",
			inputJson: '{"task":"x"}',
			outputJson: '{"result":"y"}',
			durationMs: 120,
			retainUntil: "2026-04-19T10:00:00.000Z",
		});

		expect(episode.id).toBe("ep_123");
		expect(episode.sessionId).toBe("sess-1");
		expect(episode.agentRole).toBe("planner");
	});

	it("lists episodes through the gateway-backed memory endpoint", async () => {
		globalThis.fetch = mock(async (input) => {
			const url = typeof input === "string" ? input : input.toString();
			expect(url).toContain("/api/v1/memory/episodes");
			expect(url).toContain("agentRole=analyst");
			expect(url).toContain("limit=5");
			return new Response(
				JSON.stringify({
					ok: true,
					total: 1,
					episodes: [
						{
							id: "ep_1",
							session_id: "sess-1",
							agent_role: "analyst",
							input_json: "{}",
							output_json: "{}",
							tools_used: ["search"],
							duration_ms: 42,
							token_count: 12,
							confidence: 0.7,
							tags: ["macro"],
							metadata: { source: "test" },
							retain_until: "2026-04-19T10:00:00.000Z",
							created_at: "2026-03-19T10:00:00.000Z",
						},
					],
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } },
			);
		}) as typeof fetch;

		const episodes = await listAgentEpisodes("analyst", 5);
		expect(episodes).toHaveLength(1);
		expect(episodes[0]?.agentRole).toBe("analyst");
		expect(episodes[0]?.toolsUsed).toEqual(["search"]);
	});

	it("treats prune as a no-op compatibility call", async () => {
		expect(await pruneExpiredEpisodes()).toBe(0);
	});
});
