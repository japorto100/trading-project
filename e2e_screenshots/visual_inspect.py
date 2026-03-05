"""
Visual inspection script — TradeView Fusion Rev-12
Covers: Dashboard, GeoMap, Auth pages, Auth-Lab, Strategy Lab
"""
from __future__ import annotations
import json, time
from pathlib import Path
from playwright.sync_api import sync_playwright, ConsoleMessage

BASE = "http://127.0.0.1:3000"
SHOTS = Path(__file__).parent
SHOTS.mkdir(exist_ok=True)

console_errors: list[dict] = []
results: list[dict] = []

def check(name: str, ok: bool, detail: str = ""):
    icon = "✅" if ok else "❌"
    print(f"  {icon} {name}" + (f"  → {detail[:100]}" if detail else ""))
    results.append({"name": name, "ok": ok, "detail": detail})

def shot(page, label: str) -> str:
    p = str(SHOTS / f"vi_{label}.png")
    try:
        page.screenshot(path=p, full_page=True)
        print(f"     📸 {p}")
        return p
    except Exception as e:
        print(f"     ⚠️  screenshot failed: {e}")
        return ""

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1400, "height": 900})

    # Capture console errors
    def on_console(msg: ConsoleMessage):
        if msg.type in ("error", "warning"):
            console_errors.append({"type": msg.type, "text": msg.text[:200]})

    page.on("console", on_console)

    # ── 4a. Trading Dashboard ────────────────────────────────────────────────
    print("\n🖥️  4a. Trading Dashboard")
    try:
        page.goto(BASE + "/", wait_until="domcontentloaded", timeout=30000)
        page.wait_for_timeout(3000)
        shot(page, "dashboard_full")

        # Sidebars
        ws = page.get_by_test_id("watchlist-sidebar")
        check("watchlist-sidebar visible", ws.is_visible() if ws.count() > 0 else False)
        rs = page.get_by_test_id("sidebar-right")
        check("sidebar-right visible", rs.is_visible() if rs.count() > 0 else False)

        # Tabs
        for tab in ["tab-indicators", "tab-news", "tab-orders", "tab-portfolio", "tab-strategy"]:
            el = page.get_by_test_id(tab)
            vis = el.is_visible() if el.count() > 0 else False
            check(f"{tab} visible", vis)
            if vis:
                try:
                    el.click(timeout=2000)
                    page.wait_for_timeout(300)
                    shot(page, f"dashboard_{tab}")
                    check(f"{tab} clickable+screenshot", True)
                except Exception as e:
                    check(f"{tab} clickable", False, str(e)[:60])

        # Timeline strip
        tl = page.get_by_test_id("timeline-strip")
        check("timeline-strip visible", tl.is_visible() if tl.count() > 0 else False)

    except Exception as e:
        check("Dashboard navigation", False, str(e)[:120])
        shot(page, "dashboard_error")

    # ── 4b. GeoMap ──────────────────────────────────────────────────────────
    print("\n🗺️  4b. GeoMap")
    try:
        page.goto(BASE + "/geopolitical-map", wait_until="domcontentloaded", timeout=30000)
        page.wait_for_timeout(3000)
        shot(page, "geomap_initial")

        # Zoom controls
        for btn_label in ["Zoom In", "Zoom Out", "Reset"]:
            btns = page.get_by_title(btn_label).all()
            if not btns:
                btns = page.get_by_role("button").filter(has_text=btn_label).all()
            if btns:
                try:
                    btns[0].click(timeout=2000)
                    page.wait_for_timeout(400)
                    check(f"GeoMap {btn_label} button clickable", True)
                except Exception as e:
                    check(f"GeoMap {btn_label} button", False, str(e)[:60])
            else:
                check(f"GeoMap {btn_label} button present", False, "not found")

        shot(page, "geomap_after_zoom")

        # Earth/Moon tabs
        for body_label in ["Earth", "Moon"]:
            btns = page.get_by_role("button").filter(has_text=body_label).all()
            if not btns:
                btns = page.locator(f"button:has-text('{body_label}'), [role='tab']:has-text('{body_label}')").all()
            if btns:
                try:
                    btns[0].click(timeout=2000)
                    page.wait_for_timeout(800)
                    shot(page, f"geomap_{body_label.lower()}")
                    check(f"GeoMap {body_label} tab clickable", True)
                except Exception as e:
                    check(f"GeoMap {body_label} tab", False, str(e)[:60])
            else:
                check(f"GeoMap {body_label} tab present", False, "not found")

        # Candidate queue and contradictions panel
        cq = page.locator("[data-testid='candidate-queue'], [class*='candidate'], [class*='CandidateQueue']").first
        check("CandidateQueue present", cq.count() > 0)
        cp = page.locator("[data-testid='contradictions-panel'], [class*='contradiction'], [class*='Contradiction']").first
        check("ContradictionsPanel present", cp.count() > 0)

    except Exception as e:
        check("GeoMap navigation", False, str(e)[:120])
        shot(page, "geomap_error")

    # ── 4c. Auth Pages ───────────────────────────────────────────────────────
    print("\n🔐 4c. Auth Pages")
    for path, label in [("/auth/sign-in", "sign_in"), ("/auth/register", "register")]:
        try:
            page.goto(BASE + path, wait_until="domcontentloaded", timeout=20000)
            page.wait_for_timeout(1500)
            shot(page, f"auth_{label}")
            body_text = page.locator("body").inner_text()
            check(f"{path} loaded (body text > 20)", len(body_text.strip()) > 20, body_text[:60])
            # Check form elements
            inputs = page.locator("input").all()
            check(f"{path} has input fields ({len(inputs)})", len(inputs) > 0)
        except Exception as e:
            check(f"{path} navigation", False, str(e)[:100])

    # ── 4d. Auth-Lab Pages ────────────────────────────────────────────────
    print("\n🧪 4d. Auth-Lab Pages")
    lab_pages = [
        "/auth/passkeys",
        "/auth/passkeys-lab",
        "/auth/kg-encryption-lab",
        "/auth/security",
        "/auth/privacy",
    ]
    for path in lab_pages:
        try:
            page.goto(BASE + path, wait_until="domcontentloaded", timeout=20000)
            page.wait_for_timeout(1000)
            body_text = page.locator("body").inner_text()
            not_blank = len(body_text.strip()) > 20
            check(f"{path} not blank", not_blank, body_text.strip()[:60] if not_blank else "BLANK/WHITE SCREEN")
            if not_blank:
                shot(page, f"auth_lab_{path.replace('/', '_')}")
        except Exception as e:
            check(f"{path} navigation", False, str(e)[:100])

    # ── 4e. Strategy Lab ──────────────────────────────────────────────────
    print("\n📊 4e. Strategy Lab")
    try:
        page.goto(BASE + "/", wait_until="domcontentloaded", timeout=30000)
        page.wait_for_timeout(2000)
        strat_tab = page.get_by_test_id("tab-strategy")
        if strat_tab.count() > 0 and strat_tab.is_visible():
            strat_tab.click(timeout=3000)
            page.wait_for_timeout(500)
            shot(page, "strategy_lab")
            check("Strategy Lab tab screenshot", True)
        else:
            check("tab-strategy visible", False, "not found")
    except Exception as e:
        check("Strategy Lab", False, str(e)[:100])

    browser.close()

# ── Console error summary ────────────────────────────────────────────────────
print(f"\n📋 Console Errors: {len(console_errors)} total")
by_type: dict[str, list] = {}
for e in console_errors:
    by_type.setdefault(e["type"], []).append(e["text"])
for t, msgs in by_type.items():
    print(f"  {t}: {len(msgs)}")
    for m in msgs[:3]:
        print(f"    - {m[:100]}")

# ── Summary ──────────────────────────────────────────────────────────────────
passed = sum(1 for r in results if r["ok"])
failed = sum(1 for r in results if not r["ok"])
print(f"\n{'='*60}")
print(f"Visual Inspection: {passed} passed, {failed} failed")
print(f"Console Errors:    {len(console_errors)} ({sum(len(v) for v in by_type.values() if k == 'error' for k in [t])})")
print(f"{'='*60}")

# Write JSON summary
summary_path = str(SHOTS / "visual_inspect_summary.json")
with open(summary_path, "w") as f:
    json.dump({
        "results": results,
        "console_errors": console_errors,
        "passed": passed,
        "failed": failed,
    }, f, indent=2)
print(f"Summary → {summary_path}")
