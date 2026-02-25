import { expect, test } from "@playwright/test";

/**
 * MASTER AUDIT TOTALITY TEST (Phasen 0-4) — Rev. 3
 * Fixed selectors: testid-based sidebars, flexible title match,
 * button-based timeframe check, correct zoom/timeline testids.
 */
test.describe("TradeView Fusion – Master Audit Totality", () => {
	test("Full System Walkthrough: Dashboard → Map → Architecture", async ({ page }) => {
		const auditLog: string[] = [];
		const record = (msg: string) => {
			console.log(`[AUDIT] ${msg}`);
			auditLog.push(msg);
		};

		// 1. Dashboard load
		record("Testing Dashboard Init...");
		await page.goto("/");
		const title = await page.title();
		expect(title).toMatch(/tradeview|fusion|trading/i);
		record(`Dashboard: Page loaded (title="${title}").`);

		// 2. 3-Column Layout
		record("Testing 3-Column Layout...");
		const leftSidebar = page.getByTestId("watchlist-sidebar");
		await expect(leftSidebar).toBeVisible({ timeout: 15000 });

		const rightSidebar = page.getByTestId("sidebar-right");
		await expect(rightSidebar).toBeVisible();
		record("Layout: Dual sidebars detected.");

		// 3. Header Controls
		record("Testing Header Controls...");
		// Replay button
		await expect(page.getByRole("button", { name: /Replay/i })).toBeVisible();
		// Timeframe selector renders buttons (not radio) – look for "1H" button
		const timeframe1H = page.getByRole("button").filter({ hasText: /^1H$/i }).first();
		await expect(timeframe1H).toBeVisible();
		record("Header: Replay and 1H timeframe present.");

		// 4. GeoMap navigation
		record("Testing Geopolitical Map...");
		await page.getByTestId("link-geomap").click();
		await page.waitForURL("**/geopolitical-map", { timeout: 60000 });

		const container = page.getByTestId("geopolitical-map-container");
		await expect(container).toBeVisible({ timeout: 15000 });
		record("GeoMap: Container visible.");

		const canvas = page.locator("svg[aria-label='Geopolitical map canvas']");
		await expect(canvas).toBeAttached();
		record("GeoMap: SVG canvas attached.");

		// Zoom controls
		await expect(page.getByTitle("Zoom In")).toBeVisible();
		await expect(page.getByTitle("Reset View")).toBeVisible();
		record("GeoMap: Zoom controls visible.");

		// 5. Ingest buttons
		const softBtn = page.getByRole("button").filter({ hasText: /Ingest Soft/i }).first();
		const hardBtn = page.getByRole("button").filter({ hasText: /Ingest Hard/i }).first();
		await expect(softBtn).toBeVisible({ timeout: 15000 });
		await expect(hardBtn).toBeVisible({ timeout: 15000 });
		record("GeoMap: Ingest controls active.");

		// 6. Timeline strip
		const timeline = page.getByTestId("timeline-strip");
		// Timeline may be empty on fresh start – just check it's in the DOM
		await expect(timeline).toBeAttached();
		record("GeoMap: Timeline strip attached.");

		record("Master Totality Audit completed.");
		expect(auditLog.length).toBeGreaterThan(5);
	});
});
