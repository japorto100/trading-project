import { expect, test } from "@playwright/test";

const GO_URL = "http://localhost:9060";
const NEXT_URL = "http://localhost:3000";

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

test.describe("Mini Plan Gate Pack", () => {
	test("Phase 6: memory health via Go is available", async ({ request }) => {
		test.skip(!(await waitUntilUp(GO_URL)), "Go gateway not running");

		const res = await request.get(`${GO_URL}/api/v1/memory/health`);
		expect(res.status()).toBe(200);
		const body = await res.json();
		expect(body.ok).toBeTruthy();
		expect(["memory", "redis"]).toContain(body.cache);
	});

	test("Phase 6: vector search contract is live via Go", async ({ request }) => {
		test.skip(!(await waitUntilUp(GO_URL)), "Go gateway not running");

		const res = await request.post(`${GO_URL}/api/v1/memory/search`, {
			data: { query: "strategy", n_results: 3 },
		});
		expect(res.status()).toBe(200);
		const body = await res.json();
		expect(body.ok).toBeTruthy();
		expect(Array.isArray(body.results)).toBeTruthy();
	});

	test("Phase 1: auth security page is reachable", async ({ page }) => {
		test.skip(!(await waitUntilUp(NEXT_URL)), "Next.js not running");

		await page.goto("/auth/security");
		await expect(page).toHaveURL(/auth\/security/, { timeout: 10000 });
	});

	test("Phase 4: geopolitical map shell is reachable", async ({ page }) => {
		test.skip(!(await waitUntilUp(NEXT_URL)), "Next.js not running");

		await page.goto("/geopolitical-map");
		await expect(page.getByTestId("geopolitical-map-container")).toBeVisible({
			timeout: 20000,
		});
	});
});
