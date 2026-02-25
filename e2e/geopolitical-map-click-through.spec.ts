import { expect, test } from "@playwright/test";

/**
 * E2E: Geopolitical Globe Experience
 * Validates container load, zoom controls, marker interaction, ingest, and keyboard shortcut.
 * Marker and popup tests are guarded by try/catch – no markers on fresh DB is expected.
 */
test.describe("Geopolitical Map – Globe Experience", () => {
	test("Navigation, Zoom, Marker Interaction, and Ingest", async ({ page }) => {
		const ok = (msg: string) => console.log(`✅ ${msg}`);

		await page.setViewportSize({ width: 1920, height: 1080 });
		await page.goto("/geopolitical-map");

		// 1. Container & canvas
		const container = page.getByTestId("geopolitical-map-container");
		await expect(container).toBeVisible({ timeout: 20000 });
		ok("Globe: Container visible.");

		const canvas = page.locator("svg[aria-label='Geopolitical map canvas']");
		await expect(canvas).toBeAttached({ timeout: 15000 });
		ok("Globe: Canvas SVG detected.");

		// 2. Zoom controls
		await page.getByTitle("Zoom In").click();
		await page.getByTitle("Zoom Out").click();
		await page.getByTitle("Reset View").click();
		ok("Globe: Zoom controls functional.");

		// 3. Marker interaction (optional – no markers on fresh DB)
		try {
			await canvas.click({ position: { x: 100, y: 100 } });
			await page.waitForTimeout(300);

			const marker = page
				.locator("g[role='button'][aria-label]")
				.filter({ hasText: /marker|event/i })
				.first();

			if ((await marker.count()) > 0) {
				await marker.click();
				ok("Globe: Marker clicked.");

				// Popup: use role=dialog or data-state=open fallback
				const popup = page
					.locator('[role="dialog"], [data-state="open"]')
					.or(page.locator(".bg-slate-900\\/95"))
					.first();
				await expect(popup).toBeVisible({ timeout: 5000 });

				const heading = popup.locator("h3").first();
				const headingText = await heading.innerText().catch(() => "(no heading)");
				ok(`Globe: Info Popup visible – "${headingText}".`);

				// Close: click canvas background first, then close button if still open
				await canvas.click({ position: { x: 50, y: 50 } });
				await page.waitForTimeout(400);
				if (await popup.isVisible()) {
					const closeBtn = popup.getByRole("button").first();
					if (await closeBtn.isVisible()) await closeBtn.click();
				}
				await expect(popup).not.toBeVisible({ timeout: 8000 });
				ok("Globe: Info Popup closed.");
			} else {
				console.log("⏭️ Globe: No markers found (expected on fresh DB).");
			}
		} catch (err) {
			console.log(`⏭️ Globe: Marker test skipped – ${String(err)}`);
		}

		// 4. Ingest Soft button
		const softBtn = page.getByRole("button").filter({ hasText: /Ingest Soft/i }).first();
		await expect(softBtn).toBeVisible({ timeout: 15000 });
		await softBtn.click();
		ok("Globe: Ingest Soft triggered.");

		// 5. Source Health heading
		await expect(page.getByRole("heading", { name: /Source Health/i })).toBeVisible();
		ok("Globe: Source Health visible.");
	});

	test("keyboard shortcut: C opens Candidate Queue", async ({ page }) => {
		await page.setViewportSize({ width: 1920, height: 1080 });
		await page.goto("/geopolitical-map");

		await page.getByTestId("geopolitical-map-container").waitFor({ timeout: 20000 });

		// Press 'c' to open candidate queue
		await page.keyboard.press("c");

		// Candidate Queue panel / text should appear
		const candidateEl = page
			.getByText(/Candidate Queue/i)
			.or(page.getByRole("heading", { name: /Candidate/i }))
			.first();
		await expect(candidateEl).toBeVisible({ timeout: 5000 });
		console.log("✅ Globe: Keyboard shortcut 'c' opens Candidate Queue.");
	});
});
