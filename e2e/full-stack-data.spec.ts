import { expect, test } from "@playwright/test";

async function isServiceUp(url: string): Promise<boolean> {
	try {
		const r = await fetch(url, { signal: AbortSignal.timeout(2000) });
		return r.ok;
	} catch {
		return false;
	}
}

test.describe("TradeView Fusion – Full Stack Data Flow", () => {
	test("smoke: trading page loads", async ({ page }) => {
		await page.goto("/");
		await expect(page.getByTestId("watchlist-sidebar")).toBeVisible({ timeout: 15000 });
		await expect(page.getByTestId("sidebar-right")).toBeVisible();
	});

	test("market data: BTC price row visible (requires Go gateway)", async ({ page }) => {
		test.skip(
			!(await isServiceUp("http://localhost:9060/health")),
			"Go gateway not running – skip market data test",
		);

		await page.goto("/");

		// Watchlist row uses button role with BTC/USD text
		const btcRow = page.getByRole("button").filter({ hasText: /BTC\/USD/i }).first();
		await expect(btcRow).toBeVisible({ timeout: 15000 });

		// Wait for a non-zero price (e.g. "67,500.00" – at least one digit, comma, digits)
		const priceEl = btcRow.locator(".font-mono").first();
		await expect(priceEl).not.toHaveText(/^0\.00$/, { timeout: 45000 });
		const price = await priceEl.innerText();
		console.log(`✅ [DATA] BTC price active: ${price}`);
	});

	test("ingest soft trigger (requires Go gateway)", async ({ page }) => {
		test.skip(
			!(await isServiceUp("http://localhost:9060/health")),
			"Go gateway not running – skip ingest test",
		);

		await page.goto("/geopolitical-map");
		await page.getByTestId("geopolitical-map-container").waitFor({ timeout: 20000 });

		const softBtn = page.getByRole("button").filter({ hasText: /Ingest Soft/i }).first();
		await expect(softBtn).toBeVisible({ timeout: 15000 });
		await softBtn.click();
		console.log("✅ [DATA] Ingest Soft triggered.");
	});

	test("strategy lab panel accessible (requires Python indicator service)", async ({ page }) => {
		test.skip(
			!(await isServiceUp("http://localhost:8090/health")),
			"Python indicator service not running – skip strategy test",
		);

		await page.goto("/");
		await page.getByTestId("tab-strategy").click();
		await expect(page.getByText(/Strategy/i).first()).toBeVisible({ timeout: 10000 });

		const runBtn = page.getByRole("button").filter({ hasText: /Run|Eval/i }).first();
		if (await runBtn.isVisible()) {
			await runBtn.click();
			const resultValue = page.locator(".text-2xl.font-bold").first();
			await expect(resultValue).not.toHaveText(/^0\.00$/, { timeout: 45000 });
			const res = await resultValue.innerText();
			console.log(`✅ [DATA] Strategy Lab result: ${res}`);
		} else {
			console.log("⏭️ [DATA] Run/Eval button not found, skipping calc check.");
		}
	});
});
