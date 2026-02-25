import { expect, test } from "@playwright/test";

test.describe("TradeView Fusion – Layout Fluidity", () => {
	test("dual sidebars and tab buttons visible", async ({ page }) => {
		await page.goto("/");

		// Left sidebar
		const watchlist = page.getByTestId("watchlist-sidebar");
		await expect(watchlist).toBeVisible({ timeout: 15000 });

		// Right sidebar
		const sidebarRight = page.getByTestId("sidebar-right");
		await expect(sidebarRight).toBeVisible();

		// Tab buttons
		for (const testid of [
			"tab-indicators",
			"tab-news",
			"tab-orders",
			"tab-portfolio",
			"tab-strategy",
		]) {
			await expect(page.getByTestId(testid)).toBeVisible();
		}
	});

	test("tab buttons are clickable", async ({ page }) => {
		await page.goto("/");
		await page.getByTestId("sidebar-right").waitFor({ timeout: 15000 });

		// Click through each tab – should not throw
		for (const testid of [
			"tab-news",
			"tab-orders",
			"tab-portfolio",
			"tab-strategy",
			"tab-indicators",
		]) {
			await page.getByTestId(testid).click();
		}
	});

	test("resize handles optional – no errors if absent", async ({ page }) => {
		await page.goto("/");
		await page.getByTestId("watchlist-sidebar").waitFor({ timeout: 15000 });

		const resizeHandle = page.locator("[data-panel-resize-handle-enabled]").first();
		if (await resizeHandle.isVisible()) {
			const handleBox = await resizeHandle.boundingBox();
			if (handleBox) {
				await page.mouse.move(
					handleBox.x + handleBox.width / 2,
					handleBox.y + handleBox.height / 2,
				);
				await page.mouse.down();
				await page.mouse.move(handleBox.x + 100, handleBox.y + handleBox.height / 2);
				await page.mouse.up();
			}
		}
		// No assertion needed – test passes if no exception
	});
});
