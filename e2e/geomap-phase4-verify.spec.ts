/**
 * Phase 4 GeoMap Closeout (execution_mini_plan 4.1, 4.2, 4.7)
 *
 * 4.1 Draw-Workflow: Marker/Line/Polygon/Text, Undo/Redo
 * 4.2 E2E: POST seed → /geopolitical-map → Earth↔Moon, Choropleth, Layer-Toggles, Cluster-Zoom
 * 4.7 200+ Events bei 60 FPS (manual)
 *
 * Ref: GEOMAP_VERIFY.md
 */
import { expect, test } from "@playwright/test";

test.describe("Phase 4: GeoMap Closeout", () => {
	test("4.1 Draw-Workflow: Drawing controls are present", async ({ page }) => {
		await page.setViewportSize({ width: 1920, height: 1080 });
		await page.goto("/geopolitical-map");

		const container = page.getByTestId("geopolitical-map-container");
		await expect(container).toBeVisible({ timeout: 20000 });

		// Draw controls live in the left "Draw mode" panel (not a toolbar role).
		await expect(page.getByRole("heading", { name: /Draw mode/i })).toBeVisible();
		await expect(page.getByRole("button", { name: /Set Marker \(M\)|Set Marker Active \(M\)/i })).toBeVisible();
		await expect(page.getByRole("button", { name: /Switch draw mode to line/i })).toBeVisible();
		await expect(page.getByRole("button", { name: /Switch draw mode to polygon/i })).toBeVisible();
		await expect(page.getByRole("button", { name: /Switch draw mode to text/i })).toBeVisible();
		await expect(page.getByRole("button", { name: /Undo/i })).toBeVisible();
		await expect(page.getByRole("button", { name: /Redo/i })).toBeVisible();
		await expect(page.getByText(/Keyboard shortcuts/i)).toBeVisible();
		await expect(page.getByText(/Ctrl\+Shift\+Z \/ Ctrl\+Y/i)).toBeVisible();
	});

	test("4.2 GeoMap E2E: Earth↔Moon toggle and Choropleth", async ({ page }) => {
		await page.setViewportSize({ width: 1920, height: 1080 });

		// Seed before the visual checks per mini-plan.
		await page.request.post("/api/geopolitical/seed", { data: {} });
		await page.goto("/geopolitical-map");

		await expect(page.getByTestId("geopolitical-map-container")).toBeVisible({
			timeout: 20000,
		});

		// Earth/Moon is a tablist in the filter toolbar.
		const mapBodyTablist = page.getByRole("tablist", { name: /Map body/i });
		await expect(mapBodyTablist).toBeVisible();
		const earthTab = page.getByRole("tab", { name: /^Earth$/i });
		const moonTab = page.getByRole("tab", { name: /^Moon$/i });
		await moonTab.click();
		await expect(moonTab).toHaveAttribute("aria-selected", "true");
		await earthTab.click();
		await expect(earthTab).toHaveAttribute("aria-selected", "true");
		console.log("✅ 4.2: Earth↔Moon toggle clicked");

		// Choropleth controls are inside map overlay and appear on hover.
		const mapContainer = page.getByTestId("geopolitical-map-container");
		await mapContainer.hover();
		await expect(page.getByText(/^Layer$/)).toBeVisible();
		await expect(page.getByRole("button", { name: /^Severity$/i })).toBeVisible();
		await expect(page.getByRole("button", { name: /^Regime$/i })).toBeVisible();
		await expect(page.getByRole("button", { name: /^Macro$/i })).toBeVisible();
		console.log("✅ 4.2: Choropleth/Layer controls visible");
	});

	test("4.2 GeoMap: Zoom controls and cluster", async ({ page }) => {
		await page.setViewportSize({ width: 1920, height: 1080 });
		await page.goto("/geopolitical-map");

		await expect(page.getByTestId("geopolitical-map-container")).toBeVisible({
			timeout: 20000,
		});

		await page.getByTestId("geopolitical-map-container").hover();
		await page.getByTitle("Zoom In").click();
		await page.getByTitle("Zoom Out").click();
		await page.getByTitle("Reset View").click();
		console.log("✅ 4.2: Zoom controls functional");
	});
});
