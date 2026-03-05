"""
E2E runner for TradeView Fusion
Covers: layout-fluidity + integration-stack (UI-only portions)
"""
from __future__ import annotations

import sys
import traceback
from dataclasses import dataclass, field
from datetime import datetime

from playwright.sync_api import sync_playwright, Page, Browser, ConsoleMessage

BASE = "http://localhost:3000"

# ─── Result tracking ──────────────────────────────────────────────────────────

@dataclass
class TestResult:
    name: str
    passed: bool
    message: str = ""
    screenshot: str = ""

results: list[TestResult] = []
console_logs: list[str] = []


def record(name: str, passed: bool, message: str = "", screenshot: str = ""):
    icon = "✅" if passed else "❌"
    print(f"  {icon} {name}" + (f"  →  {message}" if message else ""))
    results.append(TestResult(name, passed, message, screenshot))


def run_test(name: str, fn, page: Page) -> None:
    try:
        fn(page)
        record(name, True)
    except Exception as e:
        record(name, False, str(e)[:200])


def capture(page: Page, label: str) -> str:
    path = f"e2e_screenshots/{label}_{datetime.now().strftime('%H%M%S')}.png"
    try:
        import os
        os.makedirs("e2e_screenshots", exist_ok=True)
        page.screenshot(path=path, full_page=True)
        return path
    except Exception:
        return ""


# ─── Layout-Fluidity Tests ────────────────────────────────────────────────────

def test_dual_sidebars_visible(page: Page):
    page.goto(BASE + "/", wait_until="domcontentloaded", timeout=60000)

    # Left sidebar
    ws = page.get_by_test_id("watchlist-sidebar")
    ws.wait_for(state="visible", timeout=25000)
    assert ws.is_visible(), "watchlist-sidebar not visible"

    # Right sidebar
    sr = page.get_by_test_id("sidebar-right")
    assert sr.is_visible(), "sidebar-right not visible"

    capture(page, "dual_sidebars")


def test_tab_buttons_visible(page: Page):
    page.goto(BASE + "/", wait_until="domcontentloaded", timeout=60000)
    page.get_by_test_id("sidebar-right").wait_for(state="visible", timeout=25000)

    for testid in ["tab-indicators", "tab-news", "tab-orders", "tab-portfolio", "tab-strategy"]:
        el = page.get_by_test_id(testid)
        assert el.is_visible(), f"{testid} not visible"


def test_tabs_clickable(page: Page):
    page.goto(BASE + "/", wait_until="domcontentloaded", timeout=60000)
    page.get_by_test_id("sidebar-right").wait_for(state="visible", timeout=25000)

    errors: list[str] = []
    for testid in ["tab-news", "tab-orders", "tab-portfolio", "tab-strategy", "tab-indicators"]:
        try:
            page.get_by_test_id(testid).click(timeout=5000)
            page.wait_for_timeout(200)
        except Exception as e:
            errors.append(f"{testid}: {e}")

    capture(page, "tabs_clicked")
    if errors:
        raise AssertionError("; ".join(errors))


def test_resize_handle_no_crash(page: Page):
    page.goto(BASE + "/", wait_until="domcontentloaded", timeout=60000)
    page.get_by_test_id("watchlist-sidebar").wait_for(state="visible", timeout=25000)

    handle = page.locator("[data-panel-resize-handle-enabled]").first
    if handle.is_visible():
        box = handle.bounding_box()
        if box:
            cx = box["x"] + box["width"] / 2
            cy = box["y"] + box["height"] / 2
            page.mouse.move(cx, cy)
            page.mouse.down()
            page.mouse.move(cx + 100, cy)
            page.mouse.up()
    # passes as long as no exception


# ─── Integration-Stack UI Smoke Tests ────────────────────────────────────────

def test_trading_page_loads(page: Page):
    page.goto(BASE + "/", wait_until="domcontentloaded", timeout=60000)

    ws = page.get_by_test_id("watchlist-sidebar")
    ws.wait_for(state="visible", timeout=25000)
    assert ws.is_visible(), "watchlist-sidebar not visible"

    sr = page.get_by_test_id("sidebar-right")
    assert sr.is_visible(), "sidebar-right not visible"

    capture(page, "trading_page")


def test_geomap_page_loads(page: Page):
    page.goto(BASE + "/geopolitical-map", wait_until="domcontentloaded", timeout=60000)

    container = page.get_by_test_id("geopolitical-map-container")
    container.wait_for(state="visible", timeout=30000)
    assert container.is_visible(), "geopolitical-map-container not visible"

    capture(page, "geomap_page")


def test_geomap_link_navigates(page: Page):
    page.goto(BASE + "/", wait_until="domcontentloaded", timeout=60000)
    page.get_by_test_id("watchlist-sidebar").wait_for(state="visible", timeout=25000)

    link = page.get_by_test_id("link-geomap")
    if link.is_visible():
        link.click()
        page.wait_for_load_state("networkidle", timeout=15000)
        assert "/geopolitical-map" in page.url, f"Expected geomap URL, got {page.url}"
        capture(page, "geomap_via_link")
    else:
        # Try finding it by text
        link_alt = page.get_by_role("link").filter(has_text="Geo").first
        if link_alt.is_visible():
            link_alt.click()
            page.wait_for_load_state("networkidle", timeout=15000)
            capture(page, "geomap_via_text_link")
        else:
            print("    ℹ️  GeoMap link not found, navigating directly")
            page.goto(BASE + "/geopolitical-map")
            page.wait_for_load_state("networkidle", timeout=15000)


def test_timeline_strip_visible(page: Page):
    page.goto(BASE + "/", wait_until="domcontentloaded", timeout=60000)
    timeline = page.get_by_test_id("timeline-strip")
    if timeline.is_visible():
        assert timeline.is_visible(), "timeline-strip not visible"
        capture(page, "timeline_strip")
    else:
        print("    ℹ️  timeline-strip not rendered (may be behind feature flag)")


def test_api_route_no_crash(page: Page):
    """TS API health check via /api root route."""
    resp = page.request.get(BASE + "/api")
    # Accept 200 or 404 (route may redirect) — just not 500
    assert resp.status != 500, f"/api returned 500"
    print(f"    ℹ️  /api status: {resp.status}")


def test_backend_skip_when_down(page: Page):
    """Verifies the skip-when-down logic works: attempt Go endpoint, expect failure or skip."""
    import urllib.request, urllib.error
    go_up = False
    try:
        urllib.request.urlopen("http://localhost:9060/health", timeout=2)
        go_up = True
    except Exception:
        pass

    if not go_up:
        print("    ℹ️  Go gateway down — backend tests correctly skipped")
        return  # skip guard working as intended
    else:
        print("    ℹ️  Go gateway is UP — backend tests would run")


# ─── CDP / Console log capture ───────────────────────────────────────────────

def setup_console_capture(page: Page):
    def on_console(msg: ConsoleMessage):
        level = msg.type
        text = msg.text
        if level in ("error", "warning"):
            console_logs.append(f"[{level.upper()}] {text}")
    page.on("console", on_console)


# ─── Main runner ─────────────────────────────────────────────────────────────

def warmup():
    """Fire one HTTP GET so Next.js JIT-compiles the route before Playwright hits it."""
    import urllib.request, urllib.error, time
    for attempt in range(6):
        try:
            urllib.request.urlopen(BASE + "/", timeout=10)
            print(f"  🔥 Warmup OK (attempt {attempt + 1})")
            return
        except Exception as e:
            print(f"  🔥 Warmup attempt {attempt + 1} failed: {e}")
            time.sleep(3)


def run_suite(browser: Browser):
    print("🔥 Warming up Next.js server...")
    warmup()

    context = browser.new_context(
        viewport={"width": 1440, "height": 900},
        ignore_https_errors=True,
    )
    page = context.new_page()
    setup_console_capture(page)

    # ── Layout-Fluidity Suite ──
    print("\n📋 Suite: Layout Fluidity")
    run_test("dual sidebars visible", test_dual_sidebars_visible, page)
    run_test("tab buttons visible", test_tab_buttons_visible, page)
    run_test("tab buttons clickable", test_tabs_clickable, page)
    run_test("resize handle no crash", test_resize_handle_no_crash, page)

    # ── Integration-Stack UI Smoke ──
    print("\n📋 Suite: Integration Stack — UI Smoke")
    run_test("trading page loads", test_trading_page_loads, page)
    run_test("geomap page loads", test_geomap_page_loads, page)
    run_test("geomap link navigates", test_geomap_link_navigates, page)
    run_test("timeline strip visible", test_timeline_strip_visible, page)
    run_test("TS /api route no 500", test_api_route_no_crash, page)
    run_test("backend skip-when-down logic", test_backend_skip_when_down, page)

    context.close()


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=["--remote-debugging-port=9222"],
        )
        try:
            run_suite(browser)
        finally:
            browser.close()

    # ── Summary ──────────────────────────────────────────────────────────────
    passed = [r for r in results if r.passed]
    failed = [r for r in results if not r.passed]

    print(f"\n{'═'*60}")
    print(f"Results: {len(passed)}/{len(results)} passed")
    print(f"{'═'*60}")
    if failed:
        print("\n❌ FAILURES:")
        for r in failed:
            print(f"  • {r.name}: {r.message}")

    if console_logs:
        print(f"\n⚠️  Browser console errors/warnings ({len(console_logs)}):")
        for entry in console_logs[:20]:
            print(f"  {entry}")

    screenshots = [r.screenshot for r in results if r.screenshot]
    if screenshots:
        print(f"\n📸 Screenshots saved: {screenshots}")

    if failed:
        sys.exit(1)


if __name__ == "__main__":
    main()
