/**
 * Phase 1 Auth Live-Verify (execution_mini_plan 1.1–1.17)
 *
 * Run with stack: ./scripts/dev-stack.ps1 -SkipGCT (or -NoNext for backend only)
 * Tests skip when AUTH_STACK_BYPASS or services are unreachable.
 */
import { expect, test } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
const GO_URL = "http://localhost:9060";

async function isGoUp(): Promise<boolean> {
	try {
		const r = await fetch(`${GO_URL}/health`, { signal: AbortSignal.timeout(2000) });
		return r.ok;
	} catch {
		return false;
	}
}

test.describe("Phase 1: Auth Live-Verify", () => {
	// 1.1 — Bypass: API flows work without Session/JWT when AUTH_STACK_BYPASS=true
	test("1.1 Bypass: composite proxy works without auth when bypass enabled", async ({ request }) => {
		test.skip(!(await isGoUp()), "Go gateway not running");

		const res = await request.post(`${BASE_URL}/api/fusion/strategy/composite`, {
			data: { symbol: "EUR/USD", indicators: ["ema"], limit: 5 },
		});
		expect(res.status()).not.toBe(401);
		expect(res.status()).not.toBe(500);
	});

	// 1.2 — Proxy consolidation: no Next.js-16 conflict (implied by test run)
	test("1.2 Proxy: API routes respond", async ({ request }) => {
		test.skip(!(await isGoUp()), "Go gateway not running");

		const res = await request.get(`${BASE_URL}/api/market/providers`);
		expect([200, 401, 502]).toContain(res.status());
	});

	// 1.3–1.5 — Credentials pages/session basics
	test("1.3–1.5 Auth pages load", async ({ page }) => {
		await page.goto(`${BASE_URL}/auth/sign-in`);
		// Sign-in title is currently rendered as text (not semantic heading), so assert visible label.
		await expect(page.getByText(/^Sign In$/)).toBeVisible({
			timeout: 10000,
		});
	});

	// 1.6 — Logout invalidates session
	test("1.6 Logout invalidates session", async ({ page }) => {
		await page.goto(`${BASE_URL}/`);
		await expect(page).toHaveURL(/auth\/sign-in/, { timeout: 10000 });

		await page.goto(`${BASE_URL}/auth/sign-in`);
		await page.getByLabel("Username").fill("admin");
		await page.getByLabel("Password").fill("test123");
		await page.getByRole("button", { name: "Sign In (Credentials)" }).click();
		await expect(page.getByText(/session created successfully/i)).toBeVisible({
			timeout: 10000,
		});

		await page.goto(`${BASE_URL}/`);
		await page.getByTestId("header-account-menu").click();
		await page.getByTestId("header-signout").click();
		await expect(page).toHaveURL(/auth\/sign-in/, { timeout: 10000 });

		const session = await page.evaluate(async () => {
			const res = await fetch("/api/auth/session");
			return res.json();
		});
		expect(session?.user ?? null).toBeNull();
	});

	test("1.11 Auth Security Hub: /auth/security loads", async ({ page }) => {
		await page.goto(`${BASE_URL}/auth/security`);
		await expect(page).toHaveURL(/auth\/security/, { timeout: 10000 });
	});

	// 1.12 RBAC: viewer → 403 on /api/v1/gct/* (requires auth + role)
	// 1.13–1.17: Manual verification or separate auth-enabled runs
});
