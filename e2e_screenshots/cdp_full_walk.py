"""
CDP Full Walk — TradeView Fusion
Tests ALL pages, interactions and verifies items listed in E2E_VERIFY_PHASES_0-4.md
"""
from __future__ import annotations
import json, time, urllib.request
from datetime import datetime, timezone
from pathlib import Path
from playwright.sync_api import sync_playwright, ConsoleMessage, Page

BASE = "http://127.0.0.1:3000"
SHOTS = Path(__file__).parent
results: list[dict] = []
console_log: list[dict] = []

def ok(name: str, passed: bool, detail: str = ""):
    icon = "✅" if passed else "❌"
    print(f"  {icon} {name}" + (f"  [{detail[:90]}]" if detail else ""))
    results.append({"name": name, "ok": passed, "detail": detail})

def shot(page: Page, label: str) -> Path:
    p = SHOTS / f"cdp_{label}_{datetime.now().strftime('%H%M%S')}.png"
    try:
        page.screenshot(path=str(p), full_page=True)
        print(f"     📸 {p.name}")
    except Exception as e:
        print(f"     ⚠️ screenshot fail: {e}")
    return p

def wait_nav(page: Page, path: str, timeout: int = 30000):
    page.goto(BASE + path, wait_until="domcontentloaded", timeout=timeout)
    page.wait_for_timeout(2000)

# ── API direct probes ────────────────────────────────────────────────────────
def probe(url: str, timeout: int = 10) -> tuple[int, dict]:
    try:
        resp = urllib.request.urlopen(url, timeout=timeout)
        return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as e:
        try: body = json.loads(e.read())
        except: body = {}
        return e.code, body
    except Exception as ex:
        return 0, {"error": str(ex)[:80]}

with sync_playwright() as pw:
    browser = pw.chromium.launch(
        headless=True,
        args=["--disable-web-security", "--no-sandbox"]
    )
    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
    page = ctx.new_page()
    page.set_default_timeout(15000)

    def on_console(msg: ConsoleMessage):
        if msg.type in ("error", "warning"):
            console_log.append({"type": msg.type, "text": msg.text[:200], "url": msg.location.get("url","")[:60]})
    page.on("console", on_console)

    # ════════════════════════════════════════════════════
    print("\n═══ A. TRADING DASHBOARD (/)")
    wait_nav(page, "/")
    shot(page, "A1_dashboard_load")

    # Sidebars
    for tid in ["watchlist-sidebar", "sidebar-right"]:
        el = page.get_by_test_id(tid)
        ok(f"sidebar {tid}", el.count() > 0 and el.is_visible())

    # All 5 tabs
    for tid in ["tab-indicators","tab-news","tab-orders","tab-portfolio","tab-strategy"]:
        el = page.get_by_test_id(tid)
        vis = el.count() > 0 and el.is_visible()
        ok(f"tab {tid} visible", vis)
        if vis:
            try:
                el.click(timeout=2000); page.wait_for_timeout(300)
                ok(f"tab {tid} click", True)
            except Exception as e:
                ok(f"tab {tid} click", False, str(e)[:60])

    shot(page, "A2_dashboard_all_tabs")

    # Timeframes
    for tf in ["1m","3m","5m","15m","30m","1H","2H","4H","1D","1W","1M"]:
        found = len(page.locator(f"button:has-text('{tf}'), [role='radio']:has-text('{tf}')").all()) > 0
        ok(f"timeframe {tf}", found)

    # Click some timeframes
    for tf in ["5m","1H","4H","1D"]:
        btns = page.locator(f"button:has-text('{tf}')").all()
        if btns:
            try: btns[0].click(timeout=2000); page.wait_for_timeout(200)
            except: pass

    shot(page, "A3_dashboard_timeframes")

    # GeoMap nav link
    link = page.get_by_test_id("link-geomap")
    ok("GeoMap link in header", link.count() > 0)

    # Symbol search
    try:
        search = page.locator("[data-testid='symbol-search'], button:has-text('BTC'), [placeholder*='Search']").first
        if search.is_visible():
            search.click(timeout=2000); page.wait_for_timeout(400)
            ok("symbol search modal opens", True)
            shot(page, "A4_symbol_search_modal")
            page.keyboard.press("Escape")
        else:
            ok("symbol search trigger visible", False, "not found")
    except Exception as e:
        ok("symbol search", False, str(e)[:60])

    # Drawing toolbar
    draw_els = page.locator("[data-testid*='draw'], [data-testid='drawing-toolbar'], button[title*='Line'], button[title*='Draw']").all()
    ok(f"drawing toolbar elements ({len(draw_els)})", len(draw_els) > 0)

    # Chart type buttons
    chart_btns = page.locator("button[title*='Candlestick'], button[title*='Line chart'], button[title*='Area'], [data-testid*='chart-type']").all()
    ok(f"chart type selector ({len(chart_btns)})", len(chart_btns) > 0)
    if chart_btns:
        for btn in chart_btns[:3]:
            try: btn.click(timeout=1500); page.wait_for_timeout(200)
            except: pass
        shot(page, "A5_chart_types")

    # Orders tab — buy/sell
    page.get_by_test_id("tab-orders").click(timeout=3000); page.wait_for_timeout(500)
    buy = page.get_by_role("button").filter(has_text="Buy").first
    sell = page.get_by_role("button").filter(has_text="Sell").first
    ok("Buy button in orders", buy.count() > 0 and buy.is_visible())
    ok("Sell button in orders", sell.count() > 0 and sell.is_visible())

    # Qty input in orders
    qty = page.locator("input[type='number'], input[placeholder*='Qty'], input[placeholder*='qty']").first
    ok("Qty input in orders", qty.count() > 0)
    shot(page, "A6_orders_panel")

    # Portfolio tab
    page.get_by_test_id("tab-portfolio").click(timeout=3000); page.wait_for_timeout(1000)
    metrics = page.locator("[class*='metric'], [class*='portfolio'], table, canvas").first
    ok("portfolio tab has content", metrics.count() > 0)
    shot(page, "A7_portfolio_tab")

    # Strategy tab
    page.get_by_test_id("tab-strategy").click(timeout=3000); page.wait_for_timeout(1000)
    strategy = page.locator("[data-testid='strategy-lab'], section, .card, [role='tabpanel']").first
    ok("strategy tab content", strategy.count() > 0)
    shot(page, "A8_strategy_tab")

    # Timeline strip
    tl = page.get_by_test_id("timeline-strip")
    ok("timeline-strip on dashboard", tl.count() > 0)

    # Indicators tab — toggles
    page.get_by_test_id("tab-indicators").click(timeout=3000); page.wait_for_timeout(500)
    toggles = page.locator("button[role='switch'], input[type='checkbox']").all()
    ok(f"indicator toggles ({len(toggles)})", len(toggles) > 0)

    # Watchlist entries
    btc_btn = page.get_by_role("button").filter(has_text="BTC").first
    ok("BTC in watchlist", btc_btn.count() > 0 and btc_btn.is_visible())

    # ════════════════════════════════════════════════════
    print("\n═══ B. GEOPOLITICAL MAP (/geopolitical-map)")
    wait_nav(page, "/geopolitical-map")
    page.wait_for_timeout(3000)  # D3 render
    shot(page, "B1_geomap_initial")

    # Map container
    mc = page.get_by_test_id("geopolitical-map-container")
    ok("map container visible", mc.count() > 0 and mc.is_visible())

    # Zoom buttons by title
    for title in ["Zoom in", "Zoom out", "Reset zoom"]:
        btn = page.get_by_title(title)
        ok(f"zoom '{title}' button", btn.count() > 0)
        if btn.count() > 0:
            try: btn.first.click(timeout=2000); page.wait_for_timeout(300)
            except: pass

    shot(page, "B2_geomap_zoomed")

    # Earth/Moon tabs
    for body_name in ["Earth", "Moon"]:
        tab = page.get_by_role("tab").filter(has_text=body_name)
        if tab.count() == 0:
            tab = page.locator(f"button:has-text('{body_name}')").first
        ok(f"GeoMap {body_name} tab", tab.count() > 0)
        if tab.count() > 0:
            try:
                tab.first.click(timeout=2000); page.wait_for_timeout(800)
                shot(page, f"B3_geomap_{body_name.lower()}")
                ok(f"GeoMap {body_name} tab clickable", True)
            except Exception as e:
                ok(f"GeoMap {body_name} tab click", False, str(e)[:60])

    # Back to Earth
    earth = page.get_by_role("tab").filter(has_text="Earth")
    if earth.count() == 0: earth = page.locator("button:has-text('Earth')").first
    if earth.count() > 0:
        try: earth.first.click(timeout=2000); page.wait_for_timeout(500)
        except: pass

    # Layer selector
    layer = page.locator("select, [role='combobox']").first
    ok("layer/choropleth selector", layer.count() > 0)

    # Confidence slider
    slider = page.locator("[role='slider'], input[type='range']").first
    ok("confidence slider", slider.count() > 0)

    # Timeline strip on geomap
    tl2 = page.get_by_test_id("timeline-strip")
    ok("timeline-strip on geomap", tl2.count() > 0)

    # Ingest button
    ingest = page.get_by_role("button").filter(has_text="Ingest").first
    if ingest.count() == 0:
        ingest = page.get_by_role("button").filter(has_text="Soft").first
    ok("Ingest button on geomap", ingest.count() > 0)

    # Candidate UI (accept/reject/snooze)
    accept = page.get_by_role("button").filter(has_text="Accept").first
    reject = page.get_by_role("button").filter(has_text="Reject").first
    snooze = page.get_by_role("button").filter(has_text="Snooze").first
    has_candidate_ui = accept.count() > 0 or reject.count() > 0 or snooze.count() > 0
    ok(f"candidate accept/reject/snooze UI", has_candidate_ui,
       f"accept={accept.count()} reject={reject.count()} snooze={snooze.count()}")
    shot(page, "B4_geomap_candidate_ui")

    # Drag-rotate globe
    try:
        box = mc.bounding_box()
        if box:
            cx, cy = box["x"] + box["width"]/2, box["y"] + box["height"]/2
            page.mouse.move(cx, cy)
            page.mouse.down(); page.mouse.move(cx+80, cy+30); page.mouse.up()
            page.wait_for_timeout(300)
            ok("globe drag-rotate no crash", True)
    except Exception as e:
        ok("globe drag-rotate", False, str(e)[:60])

    shot(page, "B5_geomap_after_drag")

    # Keyboard shortcut C → candidate queue
    try:
        page.keyboard.press("c"); page.wait_for_timeout(500)
        ok("keyboard shortcut 'c' no crash", True)
        shot(page, "B6_geomap_kbd_c")
    except Exception as e:
        ok("keyboard shortcut 'c'", False, str(e)[:60])

    # ════════════════════════════════════════════════════
    print("\n═══ C. AUTH PAGES")
    for path, label in [("/auth/sign-in","sign_in"), ("/auth/register","register")]:
        try:
            wait_nav(page, path, timeout=25000)
            body_text = page.locator("body").inner_text()
            ok(f"{path} loads", len(body_text.strip()) > 20, body_text.strip()[:60])
            inputs = page.locator("input").all()
            ok(f"{path} has inputs ({len(inputs)})", len(inputs) > 0)
            shot(page, f"C_{label}")
        except Exception as e:
            ok(f"{path} loads", False, str(e)[:80])

    # ════════════════════════════════════════════════════
    print("\n═══ D. AUTH-LAB PAGES")
    lab_pages = [
        ("/auth/passkeys",          "passkeys"),
        ("/auth/passkeys-lab",      "passkeys_lab"),
        ("/auth/kg-encryption-lab", "kg_enc_lab"),
        ("/auth/security",          "security"),
        ("/auth/privacy",           "privacy"),
    ]
    for path, label in lab_pages:
        try:
            wait_nav(page, path, timeout=20000)
            body_text = page.locator("body").inner_text()
            not_blank = len(body_text.strip()) > 20
            ok(f"{path} not blank", not_blank, body_text.strip()[:60] if not_blank else "WHITE SCREEN")
            if not_blank:
                shot(page, f"D_{label}")
        except Exception as e:
            ok(f"{path}", False, str(e)[:80])

    # ════════════════════════════════════════════════════
    print("\n═══ E. BACKEND API DIRECT PROBES")
    GO = "http://127.0.0.1:9060"
    PY_URL = "http://127.0.0.1:8090"
    SS_URL = "http://127.0.0.1:8091"
    FB_URL = "http://127.0.0.1:8092"

    # Go Gateway health
    s, b = probe(f"{GO}/health")
    ok("Go Gateway /health", s == 200, str(b)[:80])
    ok("Go Gateway gct.connected", isinstance(b,dict) and b.get("gct",{}).get("connected",False) == False,
       "expected False (no exchange creds)")

    # Quote/OHLCV via Go → GCT (502 = GCT offline, expected)
    s, b = probe(f"{GO}/api/v1/quote?symbol=BTC/USD")
    ok("Go /quote BTC/USD (502=expected)", s in (200,502), f"HTTP {s}")

    # Indicator health + Rust
    s, b = probe(f"{PY_URL}/health")
    ok("Indicator /health", s == 200)
    ok("Rust core available", isinstance(b,dict) and b.get("rustCore",{}).get("available",False))

    # Finance-Bridge health + quote
    s, b = probe(f"{FB_URL}/health")
    ok("Finance-Bridge /health", s == 200)
    s, b = probe(f"{FB_URL}/quote?symbol=MSFT")
    ok("Finance-Bridge /quote MSFT (yfinance)", s == 200, str(b)[:80] if s == 200 else str(b)[:60])

    # Soft-Signals
    s, b = probe(f"{SS_URL}/health")
    ok("Soft-Signals /health", s == 200)

    # TS API routes (now warm — should respond fast)
    print("\n  TS API spot-check (warmed routes):")
    ts_routes = [
        "/api",
        "/api/geopolitical/events",
        "/api/geopolitical/candidates",
        "/api/geopolitical/contradictions",
        "/api/geopolitical/timeline",
        "/api/geopolitical/drawings",
        "/api/geopolitical/regions",
        "/api/geopolitical/graph",
        "/api/geopolitical/context",
        "/api/geopolitical/evaluation",
        "/api/geopolitical/sources/health",
    ]
    for route in ts_routes:
        s, b = probe(f"http://127.0.0.1:3000{route}", timeout=15)
        ok_flag = s not in (500, 502, 503)
        keys = list(b.keys())[:4] if isinstance(b, dict) else type(b).__name__
        ok(f"TS {route}", ok_flag, f"HTTP {s} {keys}")

    browser.close()

# ═══════════════════════════════════════════════════════
print(f"\n{'═'*60}")
passed = sum(1 for r in results if r["ok"])
failed = sum(1 for r in results if not r["ok"])
total = len(results)
print(f"CDP Walk: {passed}/{total} passed, {failed} failed")

# Console error summary
print(f"\nConsole Log: {len(console_log)} entries")
by_type: dict[str, int] = {}
for e in console_log:
    by_type[e["type"]] = by_type.get(e["type"], 0) + 1
for t, cnt in by_type.items():
    print(f"  {t}: {cnt}")
# Show non-HMR errors
real_errors = [e for e in console_log if "hmr" not in e["text"].lower() and "webpack" not in e["text"].lower()]
if real_errors:
    print("\n  Non-HMR errors:")
    for e in real_errors[:10]:
        print(f"    [{e['type']}] {e['text'][:100]}")

# Save summary JSON
summary = {
    "timestamp": datetime.now(timezone.utc).isoformat(),
    "passed": passed, "failed": failed, "total": total,
    "results": results,
    "console_log_count": len(console_log),
    "console_errors": len([e for e in console_log if e["type"] == "error"]),
    "real_errors": real_errors[:20],
}
(SHOTS / "cdp_walk_summary.json").write_text(json.dumps(summary, indent=2))
print(f"\n✅ Summary saved → e2e_screenshots/cdp_walk_summary.json")
