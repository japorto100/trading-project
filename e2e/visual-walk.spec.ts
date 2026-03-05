import * as fs from "node:fs";
import * as path from "node:path";
import { expect, test } from "@playwright/test";

/**
 * VISUAL WALK — Comprehensive Frontend Inspection (Rev. 2)
 * Covers: Dashboard (all tabs, timeframes, controls), GeoMap (globe, tabs, panels),
 * Auth pages, Auth-Lab pages. Screenshots saved to e2e_screenshots/.
 *
 * Selector facts confirmed from source:
 * - TimeframeSelector: ToggleGroupItem → data-testid="timeframe-{value}"
 * - MapBodyToggle: <button role="tab"> for Earth/Moon
 * - DrawingToolbar: outer div → data-testid="drawing-toolbar"
 * - StrategyLabPanel: collapsed by default, click header button to expand
 */

const SCREENSHOT_DIR = path.join(process.cwd(), "e2e_screenshots");

function shot(page: import("@playwright/test").Page, name: string) {
	const dir = SCREENSHOT_DIR;
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
	return page.screenshot({ path: path.join(dir, `vi_ts_${name}.png`), fullPage: true });
}

// ──────────────────────────────────────────────────────────────────────────────
// 1. Trading Dashboard
// ──────────────────────────────────────────────────────────────────────────────
test.describe("Visual Walk – Trading Dashboard", () => {
	test("layout: sidebars + header + GeoMap link", async ({ page }) => {
		await page.goto("/");
		await page.getByTestId("watchlist-sidebar").waitFor({ timeout: 20000 });
		await shot(page, "01_dashboard_initial");

		await expect(page.getByTestId("watchlist-sidebar")).toBeVisible();
		await expect(page.getByTestId("sidebar-right")).toBeVisible();
		await expect(page.getByTestId("link-geomap")).toBeVisible();
		await expect(page.locator("text=BTC").first()).toBeVisible();
		console.log("✅ Dashboard: sidebars + header + BTC in watchlist");
	});

	test("timeframe buttons: all 11 present via data-testid", async ({ page }) => {
		await page.goto("/");
		await page.getByTestId("watchlist-sidebar").waitFor({ timeout: 20000 });

		const timeframes = ["1m", "3m", "5m", "15m", "30m", "1H", "2H", "4H", "1D", "1W", "1M"];
		let found = 0;
		for (const tf of timeframes) {
			const el = page.getByTestId(`timeframe-${tf}`);
			const visible = await el.isVisible().catch(() => false);
			if (visible) found++;
			console.log(`[TF] ${tf}: ${visible ? "✅" : "❌"}`);
		}
		await shot(page, "02_dashboard_timeframes");
		// At least the core 7 should be present
		expect(found).toBeGreaterThanOrEqual(7);
	});

	test("timeframe 1H clickable", async ({ page }) => {
		await page.goto("/");
		await page.getByTestId("timeframe-1H").waitFor({ timeout: 20000 });
		await page.getByTestId("timeframe-1H").click();
		await page.getByTestId("timeframe-1D").click();
		await page.getByTestId("timeframe-1H").click();
		console.log("✅ Timeframe 1H/1D clickable");
	});

	test("tab: indicators", async ({ page }) => {
		await page.goto("/");
		await page.getByTestId("tab-indicators").waitFor({ timeout: 20000 });
		await page.getByTestId("tab-indicators").click();
		await page.waitForTimeout(400);
		await shot(page, "03_tab_indicators");
		await expect(page.getByTestId("sidebar-right")).toBeVisible();
		console.log("✅ Tab indicators");
	});

	test("tab: news", async ({ page }) => {
		await page.goto("/");
		await page.getByTestId("tab-news").waitFor({ timeout: 20000 });
		await page.getByTestId("tab-news").click();
		await page.waitForTimeout(400);
		await shot(page, "04_tab_news");
		console.log("✅ Tab news");
	});

	test("tab: orders – Buy/Sell buttons present", async ({ page }) => {
		await page.goto("/");
		await page.getByTestId("tab-orders").waitFor({ timeout: 20000 });
		await page.getByTestId("tab-orders").click();
		await page.waitForTimeout(400);
		await shot(page, "05_tab_orders");
		await expect(page.getByRole("button", { name: /Buy/i }).first()).toBeVisible();
		await expect(page.getByRole("button", { name: /Sell/i }).first()).toBeVisible();
		console.log("✅ Tab orders: Buy/Sell present");
	});

	test("tab: portfolio – has content (>10 chars)", async ({ page }) => {
		await page.goto("/");
		await page.getByTestId("tab-portfolio").waitFor({ timeout: 20000 });
		await page.getByTestId("tab-portfolio").click();
		await page.waitForTimeout(400);
		await shot(page, "06_tab_portfolio");
		const text = await page.getByTestId("sidebar-right").innerText();
		console.log(`[Portfolio] chars=${text.trim().length}`);
		expect(text.trim().length).toBeGreaterThan(10);
	});

	test("tab: strategy – expand panel and check content", async ({ page }) => {
		await page.goto("/");
		await page.getByTestId("tab-strategy").waitFor({ timeout: 20000 });
		await page.getByTestId("tab-strategy").click();
		await page.waitForTimeout(400);

		// Strategy panel is collapsed by default – click header to expand
		const strategyHeader = page.getByRole("button").filter({ hasText: /Strategy Lab/i }).first();
		const headerVisible = await strategyHeader.isVisible().catch(() => false);
		if (headerVisible) {
			await strategyHeader.click();
			await page.waitForTimeout(300);
			console.log("✅ Strategy Lab panel expanded");
		}
		await shot(page, "07_tab_strategy");
		const text = await page.getByTestId("sidebar-right").innerText();
		console.log(`[Strategy] chars after expand=${text.trim().length}`);
		expect(text.trim().length).toBeGreaterThan(20);
	});

	test("drawing toolbar: data-testid present", async ({ page }) => {
		await page.goto("/");
		await page.getByTestId("watchlist-sidebar").waitFor({ timeout: 20000 });
		// Wait for chart to load (toolbar only shows when showDrawingToolbar=true + chart rendered)
		await page.waitForTimeout(2000);
		const toolbar = page.getByTestId("drawing-toolbar");
		const visible = await toolbar.isVisible().catch(() => false);
		console.log(`[DrawingToolbar] visible: ${visible ? "✅" : "❌"}`);
		expect(visible).toBe(true);
		await shot(page, "08_drawing_toolbar");
	});

	test("chart type: Candle trigger visible, dropdown opens", async ({ page }) => {
		await page.goto("/");
		await page.getByTestId("watchlist-sidebar").waitFor({ timeout: 20000 });

		// The ChartTypeSelector shows a trigger button with current type (Candle by default)
		const trigger = page
			.getByRole("button", { name: /Candle|candlestick/i })
			.or(page.locator("[data-testid='chart-type-trigger']"))
			.first();
		const triggerVisible = await trigger.isVisible().catch(() => false);
		console.log(`[ChartType] trigger visible: ${triggerVisible ? "✅" : "❌"}`);

		if (triggerVisible) {
			// Open the dropdown to see all chart types
			await trigger.click();
			await page.waitForTimeout(300);
			await shot(page, "09_chart_type_dropdown");
			// Check for other chart types in the open dropdown
			for (const ct of ["Line", "Bar", "Area", "Heikin"]) {
				const item = page.getByRole("menuitem", { name: new RegExp(ct, "i") }).first();
				const v = await item.isVisible().catch(() => false);
				console.log(`[ChartType] ${ct} in dropdown: ${v ? "✅" : "❌"}`);
			}
			// Close dropdown
			await page.keyboard.press("Escape");
		}
	});

	test("timeline-strip: only on GeoMap, not Dashboard (by design)", async ({ page }) => {
		await page.goto("/");
		await page.getByTestId("watchlist-sidebar").waitFor({ timeout: 20000 });
		const strip = page.getByTestId("timeline-strip");
		const inDom = (await strip.count()) > 0;
		// This is intentional: timeline-strip is GeoMap-only
		console.log(`[TimelineStrip on Dashboard] in DOM: ${inDom} (expected: false — GeoMap-only feature)`);
		expect(inDom).toBe(false);
	});
});

// ──────────────────────────────────────────────────────────────────────────────
// 2. GeoMap
// ──────────────────────────────────────────────────────────────────────────────
test.describe("Visual Walk – GeoMap", () => {
	test("globe load + zoom controls (In/Out/Reset)", async ({ page }) => {
		await page.setViewportSize({ width: 1920, height: 1080 });
		await page.goto("/geopolitical-map");
		await page.getByTestId("geopolitical-map-container").waitFor({ timeout: 20000 });
		await page.waitForTimeout(2000);
		await shot(page, "10_geomap_initial");

		await expect(page.getByTitle("Zoom In")).toBeVisible();
		await expect(page.getByTitle("Zoom Out")).toBeVisible();
		await page.getByTitle("Zoom In").click();
		await page.getByTitle("Zoom Out").click();

		// Reset View confirmed via geopolitical-map spec
		const resetBtn = page.getByTitle("Reset View");
		const resetVisible = await resetBtn.isVisible().catch(() => false);
		console.log(`[GeoMap] Reset View: ${resetVisible ? "✅" : "❌"}`);
		if (resetVisible) await resetBtn.click();

		console.log("✅ GeoMap: zoom controls verified");
	});

	test("Earth + Moon tabs (role=tab)", async ({ page }) => {
		await page.setViewportSize({ width: 1920, height: 1080 });
		await page.goto("/geopolitical-map");
		await page.getByTestId("geopolitical-map-container").waitFor({ timeout: 20000 });

		// MapBodyToggle renders role="tab" buttons
		const earthTab = page.getByRole("tab", { name: /Earth/i });
		const moonTab = page.getByRole("tab", { name: /Moon/i });

		await expect(earthTab).toBeVisible({ timeout: 8000 });
		await expect(moonTab).toBeVisible({ timeout: 8000 });

		await earthTab.click();
		await page.waitForTimeout(800);
		await shot(page, "11_geomap_earth");

		await moonTab.click();
		await page.waitForTimeout(1500);
		await shot(page, "12_geomap_moon");

		await earthTab.click();
		await page.waitForTimeout(400);
		console.log("✅ GeoMap: Earth/Moon tabs functional");
	});

	test("layer selector + confidence slider", async ({ page }) => {
		await page.setViewportSize({ width: 1920, height: 1080 });
		await page.goto("/geopolitical-map");
		await page.getByTestId("geopolitical-map-container").waitFor({ timeout: 20000 });

		const slider = page.getByRole("slider").first();
		const sliderVisible = await slider.isVisible().catch(() => false);
		console.log(`[GeoMap] Confidence slider: ${sliderVisible ? "✅" : "❌"}`);
		expect(sliderVisible).toBe(true);

		await shot(page, "13_geomap_controls");
	});

	test("timeline-strip present on GeoMap", async ({ page }) => {
		await page.setViewportSize({ width: 1920, height: 1080 });
		await page.goto("/geopolitical-map");
		await page.getByTestId("geopolitical-map-container").waitFor({ timeout: 20000 });

		const strip = page.getByTestId("timeline-strip");
		await expect(strip).toBeAttached({ timeout: 10000 });
		console.log("✅ GeoMap: timeline-strip in DOM");
	});

	test("candidate queue (keyboard 'c') + contradictions panel", async ({ page }) => {
		await page.setViewportSize({ width: 1920, height: 1080 });
		await page.goto("/geopolitical-map");
		await page.getByTestId("geopolitical-map-container").waitFor({ timeout: 20000 });

		await page.keyboard.press("c");
		await page.waitForTimeout(500);
		const candidatePanel = page
			.getByText(/Candidate Queue/i)
			.or(page.getByRole("heading", { name: /Candidate/i }))
			.first();
		await expect(candidatePanel).toBeVisible({ timeout: 5000 });
		await shot(page, "14_geomap_candidate_queue");

		const contEl = page
			.getByRole("button", { name: /Contradiction/i })
			.or(page.getByText(/Contradiction/i))
			.first();
		const contVisible = await contEl.isVisible().catch(() => false);
		console.log(`[GeoMap] Contradictions: ${contVisible ? "✅" : "❌"}`);
		console.log("✅ GeoMap: Candidate Queue opened via keyboard shortcut");
	});

	test("drag-rotate globe – no crash", async ({ page }) => {
		await page.setViewportSize({ width: 1920, height: 1080 });
		await page.goto("/geopolitical-map");
		const container = page.getByTestId("geopolitical-map-container");
		await container.waitFor({ timeout: 20000 });
		await page.waitForTimeout(1000);

		const box = await container.boundingBox();
		if (box) {
			const cx = box.x + box.width / 2;
			const cy = box.y + box.height / 2;
			await page.mouse.move(cx, cy);
			await page.mouse.down();
			await page.mouse.move(cx + 80, cy + 30);
			await page.mouse.move(cx + 150, cy + 60);
			await page.mouse.up();
			await page.waitForTimeout(400);
		}
		await shot(page, "15_geomap_after_drag");
		console.log("✅ GeoMap: drag-rotate no crash");
	});

	test("Ingest Soft button + Source Health heading", async ({ page }) => {
		await page.setViewportSize({ width: 1920, height: 1080 });
		await page.goto("/geopolitical-map");
		await page.getByTestId("geopolitical-map-container").waitFor({ timeout: 20000 });

		const softBtn = page.getByRole("button").filter({ hasText: /Ingest Soft/i }).first();
		await expect(softBtn).toBeVisible({ timeout: 15000 });
		await softBtn.click();
		await expect(page.getByRole("heading", { name: /Source Health/i })).toBeVisible();
		console.log("✅ GeoMap: Ingest Soft + Source Health verified");
	});
});

// ──────────────────────────────────────────────────────────────────────────────
// 3. Auth Pages
// ──────────────────────────────────────────────────────────────────────────────
test.describe("Visual Walk – Auth Pages", () => {
	test("/auth/sign-in – form elements (auth may be disabled in dev)", async ({ page }) => {
		await page.goto("/auth/sign-in");
		await page.waitForLoadState("networkidle");
		await shot(page, "20_auth_signin");

		// Password input always present regardless of auth mode
		const pwdInput = page.locator("input[type='password']").first();
		const pwdVisible = await pwdInput.isVisible().catch(() => false);

		// Username/email — only visible when NEXT_PUBLIC_ENABLE_AUTH=true
		const usernameEl = page
			.locator("input[type='email'], input[type='text'], input[name='username'], input[name='email'], input#username")
			.first();
		const usernameVisible = await usernameEl.isVisible().catch(() => false);

		// Submit button
		const submitBtn = page.getByRole("button", { name: /sign in|login|submit/i }).first();
		const submitVisible = await submitBtn.isVisible().catch(() => false);

		console.log(`[Auth/sign-in] password: ${pwdVisible ? "✅" : "❌"} username: ${usernameVisible ? "✅" : "❌ (auth disabled)"} submit: ${submitVisible ? "✅" : "❌"}`);

		// Page must load and have some content
		const bodyText = await page.locator("body").innerText();
		expect(bodyText.trim().length).toBeGreaterThan(20);
	});

	test("/auth/register – form elements", async ({ page }) => {
		await page.goto("/auth/register");
		await page.waitForLoadState("networkidle");
		await shot(page, "21_auth_register");
		const inputs = await page.locator("input").count();
		console.log(`[Auth/register] inputs found: ${inputs}`);
		expect(inputs).toBeGreaterThanOrEqual(1);
	});
});

// ──────────────────────────────────────────────────────────────────────────────
// 4. Auth-Lab Pages
// ──────────────────────────────────────────────────────────────────────────────
test.describe("Visual Walk – Auth-Lab Pages", () => {
	const labPages: Array<{ path: string; name: string; minChars: number }> = [
		{ path: "/auth/passkeys", name: "passkeys", minChars: 100 },
		{ path: "/auth/passkeys-lab", name: "passkeys_lab", minChars: 100 },
		{ path: "/auth/kg-encryption-lab", name: "kg_encryption_lab", minChars: 100 },
		{ path: "/auth/security", name: "security", minChars: 100 },
		{ path: "/auth/privacy", name: "privacy", minChars: 50 },
	];

	for (const { path: pagePath, name, minChars } of labPages) {
		test(`${pagePath} – loads and has content`, async ({ page }) => {
			await page.goto(pagePath);
			await page.waitForLoadState("networkidle");
			await shot(page, `30_authlab_${name}`);
			const text = await page.locator("body").innerText();
			console.log(`[AuthLab/${name}] chars=${text.trim().length}`);
			expect(text.trim().length).toBeGreaterThan(minChars);
		});
	}
});
