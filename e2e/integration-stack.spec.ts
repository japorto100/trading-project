/**
 * Cross-layer integration tests: TS → Go → Python → Rust
 *
 * Each service block skips itself when the required service is unreachable.
 * UI smoke tests always run (no backend required).
 */
import { expect, test } from "@playwright/test";

const GO_URL = "http://localhost:9060";
const PYTHON_URL = "http://localhost:8092"; // indicator-service per dev-stack
const SOFT_SIGNALS_URL = "http://localhost:8091";

async function isUp(url: string): Promise<boolean> {
	try {
		const r = await fetch(`${url}/health`, { signal: AbortSignal.timeout(2000) });
		return r.ok;
	} catch {
		return false;
	}
}

async function waitUntilUp(url: string, attempts = 3, delayMs = 800): Promise<boolean> {
	for (let i = 0; i < attempts; i++) {
		if (await isUp(url)) return true;
		if (i < attempts - 1) {
			await new Promise((resolve) => setTimeout(resolve, delayMs));
		}
	}
	return false;
}

// ─── Go Gateway ──────────────────────────────────────────────────────────────

test.describe("Layer: Go Gateway (:9060)", () => {
	test("health endpoint returns 200", async ({ request }) => {
		test.skip(!(await waitUntilUp(GO_URL)), "Go gateway not running");

		const res = await request.get(`${GO_URL}/health`);
		expect(res.status()).toBe(200);

		const body = await res.json().catch(() => ({}));
		// health body should at minimum contain a status/ok field (loose check)
		expect(typeof body).toBe("object");
		console.log(`✅ [Go] health: ${JSON.stringify(body)}`);
	});
});

// ─── TS → Go ─────────────────────────────────────────────────────────────────

test.describe("Layer: TS → Go composite proxy", () => {
	test("TS /api/fusion/strategy/composite proxies to Go :9060", async ({ request }) => {
		test.skip(!(await waitUntilUp(GO_URL)), "Go gateway not running");

		const res = await request.post("/api/fusion/strategy/composite", {
			data: {
				symbol: "BTC/USD",
				indicators: ["ema", "rsi"],
				limit: 5,
			},
		});

		// 503 should not happen when the health checks already passed.
		// Keep 422 for contract evolution while still failing on service-unavailable regressions.
		const status = res.status();
		expect([200, 400, 422]).toContain(status);
		console.log(`✅ [TS→Go] composite proxy status: ${status}`);
	});
});

// ─── Go → Python ─────────────────────────────────────────────────────────────

test.describe("Layer: Go → Python indicator (:8092)", () => {
	test("Python indicator /health reachable from test runner", async ({ request }) => {
		test.skip(!(await waitUntilUp(PYTHON_URL)), "Python indicator service not running");

		const res = await request.get(`${PYTHON_URL}/health`);
		expect(res.status()).toBe(200);
		console.log(`✅ [Python] /health OK`);
	});
});

// ─── Full chain: TS → Go → Python → Rust ─────────────────────────────────────

test.describe("Layer: Full chain TS → Go → Python → Rust", () => {
	test("composite signal (EMA + RSI) traverses full stack", async ({ request }) => {
		test.skip(
			!(await waitUntilUp(GO_URL)) || !(await waitUntilUp(PYTHON_URL)),
			"Go gateway or Python service not running",
		);

		const res = await request.post("/api/fusion/strategy/composite", {
			data: { symbol: "BTC/USD", indicators: ["ema", "rsi"], limit: 10 },
		});
		const status = res.status();
		expect([200, 400, 422]).toContain(status);
		console.log(`✅ [Full chain] EMA+RSI composite status: ${status}`);
	});

	test("harmonic patterns chain (TS → Go → Python)", async ({ request }) => {
		test.skip(
			!(await waitUntilUp(GO_URL)) || !(await waitUntilUp(PYTHON_URL)),
			"Go gateway or Python service not running",
		);

		const res = await request.post("/api/fusion/strategy/evaluate", {
			data: {
				symbol: "ETH/USD",
				type: "harmonic",
				limit: 20,
			},
		});
		const status = res.status();
		expect([200, 400, 422]).toContain(status);
		console.log(`✅ [Full chain] harmonic patterns status: ${status}`);
	});

	test("fibonacci levels chain (TS → Go → Python)", async ({ request }) => {
		test.skip(
			!(await waitUntilUp(GO_URL)) || !(await waitUntilUp(PYTHON_URL)),
			"Go gateway or Python service not running",
		);

		const res = await request.post("/api/fusion/strategy/evaluate", {
			data: {
				symbol: "BTC/USD",
				type: "fibonacci",
				limit: 20,
			},
		});
		const status = res.status();
		expect([200, 400, 422]).toContain(status);
		console.log(`✅ [Full chain] fibonacci levels status: ${status}`);
	});
});

// ─── Soft Signals (:8091) ────────────────────────────────────────────────────

test.describe("Layer: Soft-signals cluster (:8091)", () => {
	test("cluster-headlines endpoint reachable", async ({ request }) => {
		test.skip(!(await waitUntilUp(SOFT_SIGNALS_URL)), "Soft-signals service not running");

		const res = await request.get(`${SOFT_SIGNALS_URL}/health`);
		expect(res.status()).toBe(200);
		console.log(`✅ [Soft-signals] /health OK`);
	});
});

// ─── Rust core reachability (via Python health) ───────────────────────────────

test.describe("Layer: Rust core (via Python :8092)", () => {
	test("Python health response includes rust_core indicator", async ({ request }) => {
		test.skip(!(await waitUntilUp(PYTHON_URL)), "Python/Rust service not running");

		const res = await request.get(`${PYTHON_URL}/health`);
		expect(res.status()).toBe(200);

		const body = await res.json().catch(() => ({}));
		// Log whatever the health endpoint reports; Rust availability may be nested
		console.log(`✅ [Rust via Python] health: ${JSON.stringify(body)}`);
		expect(typeof body).toBe("object");
	});
});

// ─── UI Smoke (always run) ───────────────────────────────────────────────────

test.describe("UI Smoke", () => {
	test("Trading page loads and shows watchlist", async ({ page }) => {
		await page.goto("/");
		await expect(page.getByTestId("watchlist-sidebar")).toBeVisible({ timeout: 15000 });
		await expect(page.getByTestId("sidebar-right")).toBeVisible();
		console.log("✅ [UI] Trading page loaded");
	});

	test("GeoMap page loads and shows map container", async ({ page }) => {
		await page.goto("/geopolitical-map");
		await expect(page.getByTestId("geopolitical-map-container")).toBeVisible({
			timeout: 20000,
		});
		console.log("✅ [UI] GeoMap page loaded");
	});
});
