import { afterEach, describe, expect, it, mock } from "bun:test";
import { writeControlAudit } from "./control-audit";
import { writeFileAudit } from "./file-audit";

const originalFetch = globalThis.fetch;

afterEach(() => {
	globalThis.fetch = originalFetch;
	mock.restore();
});

describe("audit helpers", () => {
	it("writes file audit events to the go-owned endpoint", async () => {
		globalThis.fetch = mock(async (input, init) => {
			const url = typeof input === "string" ? input : input.toString();
			expect(url).toContain("/api/v1/files/audit");
			expect(init?.method).toBe("POST");
			return new Response(JSON.stringify({ success: true }), {
				status: 201,
				headers: { "Content-Type": "application/json" },
			});
		}) as typeof fetch;

		await writeFileAudit({
			action: "upload",
			actionClass: "bounded-write",
			requestId: "req-file-1",
			target: "report.pdf",
		});
	});

	it("writes control audit events to the go-owned endpoint", async () => {
		globalThis.fetch = mock(async (input, init) => {
			const url = typeof input === "string" ? input : input.toString();
			expect(url).toContain("/api/v1/control/audit");
			expect(init?.method).toBe("POST");
			return new Response(JSON.stringify({ success: true }), {
				status: 201,
				headers: { "Content-Type": "application/json" },
			});
		}) as typeof fetch;

		await writeControlAudit({
			action: "kill-session",
			actionClass: "approval-write",
			requestId: "req-control-1",
			target: "session-1",
		});
	});
});
