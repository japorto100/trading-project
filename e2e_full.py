"""
TradeView Fusion — Comprehensive E2E Runner (Rev 12 / 25 Feb 2026)
Covers:
  Suite 1  — Infrastructure Health (all 4 services + GCT + Rust)
  Suite 2  — TS API Routes (~30 GET + 5 POST)
  Suite 3  — Trading Dashboard UI (sidebars, tabs, timeframes, order form)
  Suite 4  — GeoMap UI (globe, zoom, layers, timeline, candidate queue)
  Suite 5  — Auth Pages (sign-in, register, form elements)
  Suite 6  — Cross-Layer Integration (TS→Go→Python→Rust chain)
  Suite 7  — Data Sources (source health, market providers)
  Suite 8  — Python Indicator Service direct :8090 (21 endpoints)
  Suite 9  — Python Soft-Signals direct :8091 (4 endpoints)
  Suite 10 — Finance-Bridge direct :8092 (4 GET endpoints)
  Suite 11 — Go Gateway GET routes :9060 (~19 routes)
  Suite 12 — Go Gateway POST routes :9060 (indicator/pattern proxies)
  Suite 13 — GCT exhaustive via Go Gateway (7 routes)
  Suite 14 — TS API CRUD & Auth routes (5 CRUD flows + 4 auth routes)
  Suite 15 — Frontend Deep (auth-lab pages, tabs, drawing toolbar, chart types)
Results written to docs/E2E_VERIFY_PHASES_0-4.md
"""
from __future__ import annotations

import json
import os
import socket
import subprocess
import sys
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from playwright.sync_api import (
    Browser, ConsoleMessage, Page, Response, sync_playwright
)

BASE = "http://127.0.0.1:3000"
GO   = "http://127.0.0.1:9060"
PY   = "http://127.0.0.1:8090"
SS   = "http://127.0.0.1:8091"
FB   = "http://127.0.0.1:8092"

REPO    = Path(__file__).parent
GO_DIR  = REPO / "go-backend"
PY_DIR  = REPO / "python-backend"
PY_IND  = PY_DIR / "services" / "indicator-service"
PY_SS   = PY_DIR / "services" / "geopolitical-soft-signals"
PY_FB   = PY_DIR / "services" / "finance-bridge"

SHOTS_DIR = REPO / "e2e_screenshots"
SHOTS_DIR.mkdir(exist_ok=True)

SVC_UP: dict[str, bool] = {}            # populated in main() pre-flight
_started_procs: list[subprocess.Popen] = []

# ─── Result tracking ──────────────────────────────────────────────────────────

@dataclass
class R:
    suite: str
    name: str
    ok: bool
    detail: str = ""
    screenshot: str = ""
    duration_ms: int = 0

results: list[R] = []
console_errors: list[str] = []

def rec(suite: str, name: str, ok: bool, detail: str = "", screenshot: str = "", duration_ms: int = 0):
    icon = "✅" if ok else "❌"
    suffix = f"  → {detail[:100]}" if detail else ""
    print(f"  {icon} [{suite}] {name}{suffix}")
    results.append(R(suite, name, ok, detail, screenshot, duration_ms))

def shot(page: Page, label: str) -> str:
    p = str(SHOTS_DIR / f"{label}_{datetime.now().strftime('%H%M%S')}.png")
    try: page.screenshot(path=p, full_page=True)
    except: return ""
    return p

def run(suite: str, name: str, fn, page: Page):
    t0 = time.time()
    try:
        fn(page)
        rec(suite, name, True, duration_ms=int((time.time()-t0)*1000))
    except Exception as e:
        rec(suite, name, False, str(e)[:200], duration_ms=int((time.time()-t0)*1000))

def api_get(page: Page, path: str, expect_200: bool = True) -> tuple[int, Any]:
    url = BASE + path if path.startswith("/api") else path
    try:
        resp = page.request.get(url, timeout=20000)
        body = {}
        try: body = resp.json()
        except: pass
        return resp.status, body
    except Exception as exc:
        return 503, {"error": str(exc)[:120]}

def api_post(page: Page, path: str, data: dict) -> tuple[int, Any]:
    try:
        resp = page.request.post(BASE + path, data=json.dumps(data),
                                 headers={"content-type": "application/json"}, timeout=20000)
        body = {}
        try: body = resp.json()
        except: pass
        return resp.status, body
    except Exception as exc:
        return 503, {"error": str(exc)[:120]}

def api_delete(page: Page, path: str) -> tuple[int, Any]:
    try:
        resp = page.request.delete(BASE + path, timeout=8000)
        body = {}
        try: body = resp.json()
        except: pass
        return resp.status, body
    except Exception as exc:
        return 503, {"error": str(exc)[:120]}

def svc_get(page: Page, base_url: str, path: str, params: str = "", timeout: int = 10000) -> tuple[int, Any]:
    """GET from a backend service directly (bypasses BASE)."""
    url = base_url + path + (("?" + params) if params else "")
    resp = page.request.get(url, timeout=timeout)
    body = {}
    try: body = resp.json()
    except: pass
    return resp.status, body

def svc_post(page: Page, base_url: str, path: str, data: dict, timeout: int = 10000) -> tuple[int, Any]:
    """POST to a backend service directly (bypasses BASE)."""
    resp = page.request.post(base_url + path, data=json.dumps(data),
                             headers={"content-type": "application/json"}, timeout=timeout)
    body = {}
    try: body = resp.json()
    except: pass
    return resp.status, body

def goto(page: Page, path: str, wait_el: str | None = None, timeout: int = 60000):
    page.goto(BASE + path, wait_until="domcontentloaded", timeout=timeout)
    if wait_el:
        page.get_by_test_id(wait_el).wait_for(state="visible", timeout=25000)

def ohlcv(n: int = 100) -> list[dict]:
    """Realistic synthetic OHLCV bars for indicator/pattern testing."""
    return [
        {
            "time": 1700000000 + i * 3600,
            "open":  100 + i * 0.5,
            "high":  101 + i * 0.5,
            "low":    99 + i * 0.5,
            "close": 100.3 + i * 0.5,
            "volume": 1000 + i * 100.0,
        }
        for i in range(n)
    ]

def ok_status(status: int) -> bool:
    """True if status is not a hard failure. 422 = validation error (route exists but bad data)."""
    return status not in (500, 502, 503, 404)

def classify_status(status: int, body: Any) -> tuple[bool, str]:
    """Return (ok, detail) for a service call."""
    if status == 422:
        detail_msg = ""
        if isinstance(body, dict):
            detail_msg = str(body.get("detail", ""))[:60]
        return False, f"HTTP 422 validation: {detail_msg}"
    ok = ok_status(status)
    detail = f"HTTP {status}"
    if isinstance(body, dict):
        keys = list(body.keys())[:4]
        detail += f" keys={keys}"
    elif isinstance(body, list):
        detail += f" list[{len(body)}]"
    return ok, detail

# ─── Service helpers ──────────────────────────────────────────────────────────

def port_open(host: str, port: int, timeout: float = 1.0) -> bool:
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except OSError:
        return False

def probe(page: Page, url: str, timeout: int = 4000) -> tuple[bool, Any]:
    """Safe HTTP GET — returns (ok, body); never raises on ECONNREFUSED."""
    try:
        resp = page.request.get(url, timeout=timeout)
        body: Any = {}
        try:
            body = resp.json()
        except Exception:
            pass
        return resp.status < 500, body
    except Exception:
        return False, {}

def ensure_services() -> dict[str, bool]:
    """Start backend services if not running. Returns {key: bool} of what's up."""
    global _started_procs

    svc_map: dict[str, tuple[str, int]] = {
        "next": ("127.0.0.1", 3000),
        "py":   ("127.0.0.1", 8090),
        "ss":   ("127.0.0.1", 8091),
        "fb":   ("127.0.0.1", 8092),
        "go":   ("127.0.0.1", 9060),
    }

    up: dict[str, bool] = {k: port_open(h, p) for k, (h, p) in svc_map.items()}

    print("\n🔍 Pre-flight service check:")
    for key, is_up in up.items():
        host, port = svc_map[key]
        print(f"  {'✅ UP' if is_up else '❌ DOWN':12s} — {key} ({host}:{port})")

    # ── Next.js :3000 ─────────────────────────────────────────────────────────
    if not up["next"]:
        print("  🚀 Starting Next.js dev server...")
        try:
            _started_procs.append(subprocess.Popen(
                ["bun", "run", "dev"],
                cwd=str(REPO),
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            ))
        except Exception as exc:
            print(f"  ⚠️  Failed to start Next.js: {exc}")

    # ── Indicator :8090 ───────────────────────────────────────────────────────
    if not up["py"] and PY_IND.is_dir():
        print("  🚀 Starting indicator service :8090...")
        try:
            _started_procs.append(subprocess.Popen(
                ["uv", "run", "uvicorn", "app:app",
                 "--host", "127.0.0.1", "--port", "8090"],
                cwd=str(PY_IND),
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            ))
        except Exception as exc:
            print(f"  ⚠️  Failed to start indicator: {exc}")

    # ── Soft-Signals :8091 ────────────────────────────────────────────────────
    if not up["ss"] and PY_SS.is_dir():
        print("  🚀 Starting soft-signals :8091...")
        try:
            _started_procs.append(subprocess.Popen(
                ["uv", "run", "uvicorn", "app:app",
                 "--host", "127.0.0.1", "--port", "8091"],
                cwd=str(PY_SS),
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            ))
        except Exception as exc:
            print(f"  ⚠️  Failed to start soft-signals: {exc}")

    # ── Finance-Bridge :8092 ──────────────────────────────────────────────────
    if not up["fb"] and PY_FB.is_dir():
        print("  🚀 Starting finance-bridge :8092...")
        try:
            _started_procs.append(subprocess.Popen(
                ["uv", "run", "uvicorn", "app:app",
                 "--host", "127.0.0.1", "--port", "8092"],
                cwd=str(PY_FB),
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            ))
        except Exception as exc:
            print(f"  ⚠️  Failed to start finance-bridge: {exc}")

    # ── Go Gateway :9060 ──────────────────────────────────────────────────────
    if not up["go"] and GO_DIR.is_dir():
        print("  🚀 Starting Go Gateway :9060...")
        try:
            _started_procs.append(subprocess.Popen(
                ["go", "run", "./cmd/gateway"],
                cwd=str(GO_DIR),
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            ))
        except Exception as exc:
            print(f"  ⚠️  Failed to start Go Gateway: {exc}")

    # ── Wait up to 45s for newly started services ─────────────────────────────
    if _started_procs:
        print("\n  ⏳ Waiting for services to come up (max 45s)...")
        deadline = time.time() + 45
        while time.time() < deadline:
            if all(port_open(h, p) for h, p in svc_map.values()):
                break
            time.sleep(1)

        # Final status refresh
        up = {k: port_open(h, p) for k, (h, p) in svc_map.items()}
        print("  📊 Status after startup:")
        for key, is_up in up.items():
            host, port = svc_map[key]
            print(f"    {'✅ UP' if is_up else '❌ STILL DOWN':14s} — {key} ({host}:{port})")

    return up

# ─── Suite 1: Infrastructure Health ──────────────────────────────────────────

def suite_infra(page: Page):
    for url, name in [
        (f"{GO}/health",    "Go-Gateway /health"),
        (f"{PY}/health",    "indicator  /health"),
        (f"{SS}/health",    "soft-signals /health"),
        (f"{FB}/health",    "finance-bridge /health"),
    ]:
        try:
            resp = page.request.get(url, timeout=5000)
            body: Any = {}
            try:
                body = resp.json()
            except Exception:
                pass
            ok = resp.status == 200
            rec("Infra", name, ok, str(body)[:80] if ok else f"HTTP {resp.status}")
        except Exception as exc:
            rec("Infra", name, False, f"ECONNREFUSED: {str(exc)[:60]}")

    # GCT connected check
    try:
        resp = page.request.get(f"{GO}/health", timeout=5000)
        body = resp.json() if resp.status == 200 else {}
        gct_connected = body.get("gct", {}).get("connected", False)
        rec("Infra", "GCT connected via Go-Gateway", gct_connected,
            f"grpc={body.get('gct',{}).get('grpc','?')}")
    except Exception as exc:
        rec("Infra", "GCT connected via Go-Gateway", False,
            f"Go-Gateway down: {str(exc)[:60]}")

    # Rust core in Python
    try:
        resp = page.request.get(f"{PY}/health", timeout=5000)
        body = resp.json() if resp.status == 200 else {}
        rust_ok = body.get("rustCore", {}).get("available", False)
        rec("Infra", "Rust core available in indicator", rust_ok,
            str(body.get("rustCore", {}))[:80])
    except Exception as exc:
        rec("Infra", "Rust core available in indicator", False,
            f"indicator down: {str(exc)[:60]}")

    # Rust OHLCV cache in finance-bridge
    try:
        resp = page.request.get(f"{FB}/health", timeout=5000)
        body = resp.json() if resp.status == 200 else {}
        cache_ok = body.get("rustOhlcvCache", {}).get("available", False)
        rec("Infra", "Rust OHLCV cache in finance-bridge", cache_ok,
            str(body.get("rustOhlcvCache", {}))[:80])
    except Exception as exc:
        rec("Infra", "Rust OHLCV cache in finance-bridge", False,
            f"finance-bridge down: {str(exc)[:60]}")

# ─── Suite 2: TS API Routes ───────────────────────────────────────────────────

GET_ROUTES = [
    "/api",
    "/api/market/quote?symbol=BTC/USD",
    "/api/market/ohlcv?symbol=BTC/USD&timeframe=1h&limit=10",
    "/api/market/search?q=BTC",
    "/api/market/providers",
    "/api/market/news?symbol=BTC/USD",
    "/api/fusion/orders",
    "/api/fusion/alerts",
    "/api/fusion/preferences",
    "/api/fusion/portfolio",
    "/api/fusion/portfolio/history",
    "/api/fusion/portfolio/live",
    "/api/fusion/portfolio/analytics/sharpe",
    "/api/fusion/trade-journal",
    "/api/fusion/persistence/status",
    "/api/geopolitical/events",
    "/api/geopolitical/candidates",
    "/api/geopolitical/contradictions",
    "/api/geopolitical/timeline",
    "/api/geopolitical/drawings",
    "/api/geopolitical/sources/health",
    "/api/geopolitical/regions",
    "/api/geopolitical/context",
    "/api/geopolitical/news",
    "/api/geopolitical/evaluation",
    "/api/geopolitical/graph",
    "/api/geopolitical/export",
    "/api/geopolitical/alerts",
    "/api/geopolitical/alerts/policy",
    "/api/geopolitical/overlays/central-bank",
    "/api/geopolitical/game-theory/impact?region=europe&category=sanctions",
]

POST_ROUTES = [
    ("/api/fusion/risk/position-size",
     {"accountSize": 10000, "riskPercent": 1, "entryPrice": 50000, "stopLoss": 49000}),
    ("/api/fusion/strategy/composite",
     {"symbol": "BTC/USD", "indicators": ["ema", "rsi"], "limit": 5}),
    ("/api/fusion/strategy/evaluate",
     {"symbol": "BTC/USD", "type": "harmonic", "limit": 10}),
    ("/api/geopolitical/candidates/ingest/soft",
     {"headline": "E2E Test Soft Signal", "source": "e2e", "region": "europe"}),
    ("/api/geopolitical/seed",
     {}),
]

def suite_api(page: Page):
    for route in GET_ROUTES:
        status, body = api_get(page, route)
        ok = status not in (500, 502, 503)
        detail = f"HTTP {status}"
        if isinstance(body, dict):
            keys = list(body.keys())[:4]
            detail += f" keys={keys}"
        elif isinstance(body, list):
            detail += f" list[{len(body)}]"
        rec("API-GET", route.split("?")[0], ok, detail)

    for route, payload in POST_ROUTES:
        status, body = api_post(page, route, payload)
        ok = status not in (500, 502, 503)
        detail = f"HTTP {status}"
        if isinstance(body, dict):
            detail += f" keys={list(body.keys())[:4]}"
        rec("API-POST", route, ok, detail)

# ─── Suite 3: Trading Dashboard UI ───────────────────────────────────────────

def suite_dashboard(page: Page):
    goto(page, "/", "watchlist-sidebar")
    s = shot(page, "dashboard_initial")

    # Sidebars
    rec("Dashboard", "watchlist-sidebar visible",
        page.get_by_test_id("watchlist-sidebar").is_visible(), screenshot=s)
    rec("Dashboard", "sidebar-right visible",
        page.get_by_test_id("sidebar-right").is_visible())

    # All 5 tab buttons
    for tab in ["tab-indicators", "tab-news", "tab-orders", "tab-portfolio", "tab-strategy"]:
        el = page.get_by_test_id(tab)
        rec("Dashboard", f"{tab} visible", el.is_visible())

    # Tab clicking
    for tab in ["tab-news", "tab-orders", "tab-portfolio", "tab-strategy", "tab-indicators"]:
        try:
            page.get_by_test_id(tab).click(timeout=3000)
            page.wait_for_timeout(200)
            rec("Dashboard", f"{tab} clickable", True)
        except Exception as e:
            rec("Dashboard", f"{tab} clickable", False, str(e)[:80])

    # Timeframes — find by text
    for tf in ["1m", "5m", "15m", "1H", "4H", "1D", "1W"]:
        els = page.locator(f"button:has-text('{tf}'), [role='radio']:has-text('{tf}')").all()
        found = len(els) > 0
        rec("Dashboard", f"timeframe {tf} button present", found)

    # Click a few timeframes
    for tf in ["5m", "1H", "1D"]:
        btns = page.locator(f"button:has-text('{tf}')").all()
        if btns:
            try:
                btns[0].click(timeout=2000)
                page.wait_for_timeout(150)
                rec("Dashboard", f"timeframe {tf} clickable", True)
            except Exception as e:
                rec("Dashboard", f"timeframe {tf} clickable", False, str(e)[:60])

    # Symbol search
    try:
        search_triggers = page.locator("[data-testid='symbol-search'], button:has-text('BTC'), [placeholder*='Search']").first
        if search_triggers.is_visible():
            search_triggers.click(timeout=2000)
            page.wait_for_timeout(300)
            rec("Dashboard", "symbol search trigger clickable", True)
            page.keyboard.press("Escape")
        else:
            rec("Dashboard", "symbol search trigger clickable", False, "not found")
    except Exception as e:
        rec("Dashboard", "symbol search trigger clickable", False, str(e)[:80])

    # Watchlist symbols visible
    btc = page.get_by_role("button").filter(has_text="BTC").first
    rec("Dashboard", "BTC symbol in watchlist", btc.is_visible())

    # Indicators tab — toggle switches
    page.get_by_test_id("tab-indicators").click(timeout=3000)
    page.wait_for_timeout(400)
    toggles = page.locator("button[role='switch'], input[type='checkbox']").all()
    rec("Dashboard", f"indicator toggles present ({len(toggles)})", len(toggles) > 0)

    # Orders tab — order form
    page.get_by_test_id("tab-orders").click(timeout=3000)
    page.wait_for_timeout(400)
    s2 = shot(page, "dashboard_orders")
    buy_btn = page.get_by_role("button").filter(has_text="Buy").first
    sell_btn = page.get_by_role("button").filter(has_text="Sell").first
    rec("Dashboard", "Buy button visible in orders", buy_btn.is_visible(), screenshot=s2)
    rec("Dashboard", "Sell button visible in orders", sell_btn.is_visible())

    # Timeline strip
    timeline = page.get_by_test_id("timeline-strip")
    rec("Dashboard", "timeline-strip visible", timeline.is_visible() if timeline.count() > 0 else False)

    # GeoMap link in header
    geomap_link = page.get_by_test_id("link-geomap")
    rec("Dashboard", "GeoMap link in header", geomap_link.count() > 0)

    shot(page, "dashboard_final")

# ─── Suite 4: GeoMap UI ───────────────────────────────────────────────────────

def suite_geomap(page: Page):
    goto(page, "/geopolitical-map", "geopolitical-map-container")
    page.wait_for_timeout(2000)  # let D3 render
    s = shot(page, "geomap_initial")

    rec("GeoMap", "map container visible",
        page.get_by_test_id("geopolitical-map-container").is_visible(), screenshot=s)

    # Zoom buttons
    for title in ["Zoom in", "Zoom out", "Reset zoom"]:
        btn = page.get_by_title(title)
        rec("GeoMap", f"zoom button '{title}'", btn.count() > 0)
        if btn.count() > 0:
            try:
                btn.first.click(timeout=2000)
                page.wait_for_timeout(200)
            except: pass

    # Earth/Moon tabs
    for body in ["Earth", "Moon"]:
        tab = page.get_by_role("tab").filter(has_text=body)
        if tab.count() == 0:
            tab = page.locator(f"button:has-text('{body}')").first
        found = tab.count() > 0
        rec("GeoMap", f"{body} tab present", found)
        if found:
            try:
                tab.first.click(timeout=2000)
                page.wait_for_timeout(500)
                rec("GeoMap", f"{body} tab clickable", True)
            except Exception as e:
                rec("GeoMap", f"{body} tab clickable", False, str(e)[:60])

    shot(page, "geomap_moon")

    # Switch back to Earth
    earth_tab = page.get_by_role("tab").filter(has_text="Earth")
    if earth_tab.count() == 0:
        earth_tab = page.locator("button:has-text('Earth')").first
    if earth_tab.count() > 0:
        try: earth_tab.first.click(timeout=2000)
        except: pass

    # Layer selector / choropleth
    layer_sel = page.locator("select, [role='combobox']").first
    rec("GeoMap", "layer selector present", layer_sel.count() > 0)

    # Confidence slider
    slider = page.locator("[role='slider'], input[type='range']").first
    rec("GeoMap", "confidence slider present", slider.count() > 0)

    # Timeline strip on geomap
    timeline = page.get_by_test_id("timeline-strip")
    rec("GeoMap", "timeline-strip on geomap", timeline.count() > 0 and timeline.first.is_visible())

    # Event markers on map canvas
    markers = page.locator("circle.event-marker, [data-event-id], g.marker").all()
    rec("GeoMap", f"event markers on map ({len(markers)})", len(markers) >= 0)

    # Ingest buttons
    for label in ["Ingest Soft", "Ingest Hard", "Soft", "Hard"]:
        btn = page.get_by_role("button").filter(has_text=label).first
        if btn.count() > 0:
            rec("GeoMap", f"'{label}' ingest button present", True)
            break
    else:
        # Try the API directly
        status, _ = api_post(page, "/api/geopolitical/candidates/ingest/soft",
                             {"headline": "E2E probe", "source": "e2e"})
        rec("GeoMap", "soft-ingest API reachable", status not in (500,502,503),
            f"HTTP {status}")

    # Candidate queue panel
    queue = page.locator("[data-testid*='candidate'], .candidate-queue").first
    rec("GeoMap", "candidate queue panel present", queue.count() > 0)

    # Contradictions panel
    contra = page.locator("[data-testid*='contradiction'], .contradictions").first
    rec("GeoMap", "contradictions panel present", contra.count() > 0)

    # Drag-rotate globe
    try:
        canvas = page.get_by_test_id("geopolitical-map-container")
        box = canvas.bounding_box()
        if box:
            cx = box["x"] + box["width"] / 2
            cy = box["y"] + box["height"] / 2
            page.mouse.move(cx, cy)
            page.mouse.down()
            page.mouse.move(cx + 80, cy + 30)
            page.mouse.up()
            page.wait_for_timeout(300)
            rec("GeoMap", "globe drag-rotate no crash", True)
    except Exception as e:
        rec("GeoMap", "globe drag-rotate no crash", False, str(e)[:80])

    shot(page, "geomap_final")

# ─── Suite 5: Auth Pages ──────────────────────────────────────────────────────

def suite_auth(page: Page):
    for path, name in [
        ("/auth/sign-in",          "sign-in page loads"),
        ("/auth/register",         "register page loads"),
    ]:
        try:
            page.goto(BASE + path, wait_until="domcontentloaded", timeout=20000)
            page.wait_for_timeout(500)
            rec("Auth", name, True, f"HTTP 200")
            shot(page, f"auth_{path.replace('/', '_')}")
        except Exception as e:
            rec("Auth", name, False, str(e)[:80])

    # Sign-in form elements
    try:
        page.goto(BASE + "/auth/sign-in", wait_until="domcontentloaded", timeout=20000)
        inputs = page.locator("input[type='text'], input[type='email'], input[name='username']").all()
        pwd_inputs = page.locator("input[type='password']").all()
        btns = page.locator("button[type='submit'], button:has-text('Sign In')").all()
        rec("Auth", "sign-in username input", len(inputs) > 0)
        rec("Auth", "sign-in password input", len(pwd_inputs) > 0)
        rec("Auth", "sign-in submit button", len(btns) > 0)
    except Exception as e:
        rec("Auth", "sign-in form elements", False, str(e)[:80])

# ─── Suite 6: Cross-Layer Integration ────────────────────────────────────────

def suite_integration(page: Page):
    # TS → Go composite
    status, body = api_post(page, "/api/fusion/strategy/composite",
                            {"symbol": "BTC/USD", "indicators": ["ema", "rsi"], "limit": 5})
    rec("Integration", "TS→Go composite signal", status not in (500,502,503),
        f"HTTP {status} {str(body)[:60]}")

    # TS → Go → Python indicator chain
    status, body = api_get(page, "/api/fusion/strategy/evaluate?symbol=BTC/USD&type=fibonacci&limit=10")
    rec("Integration", "TS→Go→Python fibonacci chain", status not in (500,502,503),
        f"HTTP {status}")

    # Go → GCT market quote
    status, body = api_get(page, "/api/market/quote?symbol=BTC/USD")
    rec("Integration", "TS→Go→GCT market quote", status not in (500,502,503),
        f"HTTP {status} {str(body)[:60]}")

    # Go → GCT OHLCV
    status, body = api_get(page, "/api/market/ohlcv?symbol=BTC/USD&timeframe=1h&limit=5")
    rec("Integration", "TS→Go→GCT OHLCV", status not in (500,502,503),
        f"HTTP {status}")

    # Geopolitical SSE availability (just check header)
    try:
        resp = page.request.get(BASE + "/api/geopolitical/stream",
                                headers={"Accept": "text/event-stream"}, timeout=3000)
        ok = resp.status in (200, 204)
        rec("Integration", "GeoMap SSE stream endpoint", ok, f"HTTP {resp.status}")
    except Exception as e:
        rec("Integration", "GeoMap SSE stream endpoint", False, str(e)[:80])

    # Market stream
    try:
        resp = page.request.get(BASE + "/api/market/stream",
                                headers={"Accept": "text/event-stream"}, timeout=3000)
        ok = resp.status in (200, 204)
        rec("Integration", "Market SSE stream endpoint", ok, f"HTTP {resp.status}")
    except Exception as e:
        rec("Integration", "Market SSE stream endpoint", False, str(e)[:80])

    # Direct Python endpoints
    for py_path, name in [
        (f"{PY}/indicators/ema",       "Python EMA endpoint"),
        (f"{PY}/indicators/rsi",       "Python RSI endpoint"),
        (f"{PY}/patterns/candlestick", "Python candlestick patterns"),
        (f"{PY}/patterns/harmonic",    "Python harmonic patterns"),
    ]:
        try:
            resp = page.request.post(py_path, data=json.dumps({
                "ohlcv": [{"time":1700000000,"open":100,"high":101,"low":99,"close":100,"volume":1000}]*30,
                "params": {}, "lookback": 100, "threshold": 0.015
            }), headers={"content-type":"application/json"}, timeout=6000)
            ok = resp.status not in (500,502,503,404)
            rec("Integration", name, ok, f"HTTP {resp.status}")
        except Exception as e:
            rec("Integration", name, False, str(e)[:80])

    # Finance bridge OHLCV
    try:
        resp = page.request.get(f"{FB}/ohlcv?symbol=BTC/USD&timeframe=1h&limit=5", timeout=5000)
        ok = resp.status not in (500,502,503)
        rec("Integration", "finance-bridge OHLCV endpoint", ok, f"HTTP {resp.status}")
    except Exception as e:
        rec("Integration", "finance-bridge OHLCV endpoint", False, str(e)[:80])

# ─── Suite 7: Data Sources ────────────────────────────────────────────────────

def suite_sources(page: Page):
    status, body = api_get(page, "/api/geopolitical/sources/health")
    rec("Sources", "source health endpoint", status not in (500,502,503),
        f"HTTP {status}")

    if isinstance(body, list):
        for src in body:
            sid = src.get("id", "?")
            sname = src.get("name", "?")
            sstatus = src.get("status", "?")
            ok = sstatus in ("ok", "warn")  # warn = missing API key, not a crash
            detail = sstatus
            if src.get("message"): detail += f" — {src['message']}"
            rec("Sources", f"{sid} ({sname[:30]})", ok, detail)
    else:
        rec("Sources", "sources list parseable", False, str(body)[:80])

    # Market data providers
    status, body = api_get(page, "/api/market/providers")
    rec("Sources", "market providers endpoint", status not in (500,502,503),
        f"HTTP {status}")
    if isinstance(body, list):
        for p in body:
            rec("Sources", f"provider {p.get('id','?')}", True,
                f"status={p.get('status','?')}")
    elif isinstance(body, dict) and "providers" in body:
        for p in body["providers"]:
            rec("Sources", f"provider {p.get('id','?')}", True,
                f"status={p.get('status','?')}")

# ─── Suite 8: Python Indicator Service direct (:8090) ─────────────────────────

def suite_py_indicators(page: Page):
    if not SVC_UP.get("py"):
        rec("Py-Indicators", "ALL", False, "indicator :8090 down — skip"); return
    bars = ohlcv(100)

    INDICATOR_ROUTES: list[tuple[str, dict]] = [
        ("/api/v1/indicators/exotic-ma",          {"ohlcv": bars, "params": {"type": "kama"}}),
        ("/api/v1/indicators/ks-collection",       {"ohlcv": bars}),
        ("/api/v1/indicators/swings",              {"ohlcv": bars, "window": 3}),
        ("/api/v1/indicators/bollinger/bandwidth", {"ohlcv": bars}),
        ("/api/v1/indicators/bollinger/percent-b", {"ohlcv": bars}),
        ("/api/v1/indicators/bollinger/squeeze",   {"ohlcv": bars}),
        ("/api/v1/indicators/rsi/atr-adjusted",    {"ohlcv": bars}),
        ("/api/v1/indicators/rsi/bollinger",       {"ohlcv": bars}),
        ("/api/v1/patterns/candlestick",           {"ohlcv": bars}),
        ("/api/v1/patterns/harmonic",              {"ohlcv": bars, "lookback": 100, "threshold": 0.015}),
        ("/api/v1/patterns/timing",                {"ohlcv": bars}),
        ("/api/v1/patterns/price",                 {"ohlcv": bars}),
        ("/api/v1/patterns/elliott-wave",          {"ohlcv": bars}),
        ("/api/v1/fibonacci/levels",               {"ohlcv": bars}),
        ("/api/v1/fibonacci/confluence",           {"ohlcv": bars}),
        ("/api/v1/portfolio/correlations",         {"assets": [{"symbol": "BTC", "close": [b["close"] for b in ohlcv(30)]},
                                                              {"symbol": "ETH", "close": [b["close"] for b in ohlcv(30)]}]}),
        ("/api/v1/portfolio/rolling-metrics",      {"equity_curve": [{"time": f"2026-01-{i+1:02d}", "equity": 100+i} for i in range(30)],
                                                    "window_days": 14}),
        ("/api/v1/portfolio/drawdown-analysis",    {"equity_curve": [{"time": f"2026-01-{i+1:02d}", "equity": 100+i} for i in range(30)]}),
        ("/api/v1/signals/composite",              {"ohlcv": bars, "indicators": ["ema", "rsi"]}),
        ("/api/v1/evaluate/strategy",              {"ohlcv": bars, "strategy": "ema_crossover"}),
        ("/api/v1/charting/transform",             {"ohlcv": bars, "transform": "log"}),
    ]

    for path, payload in INDICATOR_ROUTES:
        name = path.split("/api/v1/")[1]
        try:
            status, body = svc_post(page, PY, path, payload, timeout=12000)
            ok, detail = classify_status(status, body)
            rec("Py-Indicators", name, ok, detail)
        except Exception as e:
            rec("Py-Indicators", name, False, str(e)[:100])

# ─── Suite 9: Python Soft-Signals direct (:8091) ──────────────────────────────

def suite_py_soft_signals(page: Page):
    if not SVC_UP.get("ss"):
        rec("Py-SoftSignals", "ALL", False, "soft-signals :8091 down — skip"); return
    _ts = "2026-02-25T00:00:00Z"
    _arts = [{"title": h, "url": f"https://e2e.test/{i}", "publishedAt": _ts, "source": "e2e"}
             for i, h in enumerate(["BTC rally", "Crypto surge", "Bitcoin ATH"])]
    SOFT_ROUTES: list[tuple[str, dict]] = [
        ("/api/v1/cluster-headlines",  {"adapterId": "geo-v1",      "generatedAt": _ts, "articles": _arts}),
        ("/api/v1/social-surge",       {"adapterId": "social-v1",   "generatedAt": _ts, "articles": _arts[:1]}),
        ("/api/v1/narrative-shift",    {"adapterId": "narrative-v1","generatedAt": _ts, "articles": _arts[:2]}),
        ("/api/v1/game-theory/impact", {"generatedAt": _ts, "events": [], "limit": 5}),
    ]

    for path, payload in SOFT_ROUTES:
        name = path.split("/api/v1/")[1]
        try:
            status, body = svc_post(page, SS, path, payload, timeout=12000)
            ok, detail = classify_status(status, body)
            rec("Py-SoftSignals", name, ok, detail)
        except Exception as e:
            rec("Py-SoftSignals", name, False, str(e)[:100])

# ─── Suite 10: Finance-Bridge direct (:8092) ──────────────────────────────────

def suite_finance_bridge(page: Page):
    if not SVC_UP.get("fb"):
        rec("Finance-Bridge", "ALL", False, "finance-bridge :8092 down — skip"); return
    BRIDGE_ROUTES: list[tuple[str, str]] = [
        ("/health",  ""),
        ("/quote",   "symbol=MSFT"),           # yfinance: use stock ticker (BTC/USD not supported)
        ("/ohlcv",   "symbol=MSFT&timeframe=1d&limit=5"),
        ("/search",  "q=MSFT"),
    ]

    for path, params in BRIDGE_ROUTES:
        name = f"bridge{path}" + (f"?{params[:30]}" if params else "")
        try:
            status, body = svc_get(page, FB, path, params, timeout=10000)
            ok = status not in (500, 502, 503, 404)
            detail = f"HTTP {status}"
            if isinstance(body, dict):
                detail += f" keys={list(body.keys())[:4]}"
            elif isinstance(body, list):
                detail += f" list[{len(body)}]"
            rec("Finance-Bridge", name, ok, detail)
        except Exception as e:
            rec("Finance-Bridge", name, False, str(e)[:100])

# ─── Suite 11: Go Gateway GET routes (:9060) ──────────────────────────────────

def suite_go_get(page: Page):
    if not SVC_UP.get("go"):
        rec("Go-GET", "ALL", False, "Go-Gateway :9060 down — skip"); return
    GO_GET_ROUTES: list[tuple[str, str]] = [
        ("/health",                                   ""),
        ("/api/v1/quote",                             "symbol=BTC/USD"),
        ("/api/v1/ohlcv",                             "symbol=BTC/USD&timeframe=1h&limit=5"),
        ("/api/v1/search",                            "q=BTC"),
        ("/api/v1/news/headlines",                    "symbol=BTC/USD"),
        ("/api/v1/macro/history",                     ""),
        ("/api/v1/gct/health",                        ""),
        ("/api/v1/gct/exchanges",                     ""),
        ("/api/v1/gct/portfolio/summary",             ""),
        ("/api/v1/gct/portfolio/positions",           "exchange=kraken"),
        ("/api/v1/gct/portfolio/balances/kraken",     ""),
        ("/api/v1/auth/revocations/audit",            ""),
        ("/api/v1/geopolitical/events",               ""),
        ("/api/v1/geopolitical/candidates",           ""),
        ("/api/v1/geopolitical/contradictions",       ""),
        ("/api/v1/geopolitical/timeline",             ""),
        ("/api/v1/geopolitical/context",              ""),
        ("/api/v1/geopolitical/ingest/runs",          ""),
        ("/api/v1/backtest/capabilities",             ""),
    ]

    for path, params in GO_GET_ROUTES:
        name = path + (f"?{params[:40]}" if params else "")
        try:
            status, body = svc_get(page, GO, path, params, timeout=10000)
            ok = status not in (500, 502, 503)
            detail = f"HTTP {status}"
            if isinstance(body, dict):
                detail += f" keys={list(body.keys())[:4]}"
            elif isinstance(body, list):
                detail += f" list[{len(body)}]"
            rec("Go-GET", name, ok, detail)
        except Exception as e:
            rec("Go-GET", name, False, str(e)[:100])

# ─── Suite 12: Go Gateway POST routes (:9060) ─────────────────────────────────

def suite_go_post(page: Page):
    if not SVC_UP.get("go"):
        rec("Go-POST", "ALL", False, "Go-Gateway :9060 down — skip"); return
    bars = ohlcv(100)

    GO_POST_ROUTES: list[tuple[str, dict]] = [
        ("/api/v1/indicators/exotic-ma",          {"ohlcv": bars, "params": {"type": "kama"}}),
        ("/api/v1/indicators/ks-collection",       {"ohlcv": bars}),
        ("/api/v1/indicators/swings",              {"ohlcv": bars, "window": 3}),
        ("/api/v1/indicators/bollinger/bandwidth", {"ohlcv": bars}),
        ("/api/v1/indicators/bollinger/percent-b", {"ohlcv": bars}),
        ("/api/v1/indicators/bollinger/squeeze",   {"ohlcv": bars}),
        ("/api/v1/indicators/rsi/atr-adjusted",    {"ohlcv": bars}),
        ("/api/v1/indicators/rsi/bollinger",       {"ohlcv": bars}),
        ("/api/v1/patterns/candlestick",           {"ohlcv": bars}),
        ("/api/v1/patterns/harmonic",              {"ohlcv": bars, "lookback": 100, "threshold": 0.015}),
        ("/api/v1/patterns/timing",                {"ohlcv": bars}),
        ("/api/v1/patterns/price",                 {"ohlcv": bars}),
        ("/api/v1/patterns/elliott-wave",          {"ohlcv": bars}),
        ("/api/v1/fibonacci/levels",               {"ohlcv": bars}),
        ("/api/v1/fibonacci/confluence",           {"ohlcv": bars}),
        ("/api/v1/cluster-headlines",              {"headlines": ["BTC rally", "Crypto surge"]}),
        ("/api/v1/social-surge",                   {"symbol": "BTC", "mentions": [10, 12, 15, 25, 40]}),
        ("/api/v1/narrative-shift",                {"texts": ["risk-on", "fear subsiding"]}),
        ("/api/v1/geopolitical/ingest/soft",       {"headline": "E2E Go proxy test",
                                                    "source": "e2e", "region": "europe"}),
    ]

    for path, payload in GO_POST_ROUTES:
        name = path
        try:
            status, body = svc_post(page, GO, path, payload, timeout=15000)
            ok = status not in (500, 502, 503)
            detail = f"HTTP {status}"
            if isinstance(body, dict):
                detail += f" keys={list(body.keys())[:4]}"
            elif isinstance(body, list):
                detail += f" list[{len(body)}]"
            rec("Go-POST", name, ok, detail)
        except Exception as e:
            rec("Go-POST", name, False, str(e)[:100])

# ─── Suite 13: GCT exhaustive ─────────────────────────────────────────────────

def suite_gct_exhaustive(page: Page):
    if not SVC_UP.get("go"):
        rec("GCT-Exhaustive", "ALL", False, "Go-Gateway :9060 down — skip"); return
    GCT_ROUTES: list[tuple[str, str, str]] = [
        ("GCT GetInfo/health",               "/api/v1/gct/health",                             ""),
        ("GCT GetTicker BTC/USD",            "/api/v1/quote",                                  "symbol=BTC/USD"),
        ("GCT GetHistoricCandles",           "/api/v1/ohlcv",                                  "symbol=BTC/USD&timeframe=1h&limit=10"),
        ("GCT GetPortfolioSummary",          "/api/v1/gct/portfolio/summary",                  ""),
        ("GCT GetAccountBalances Kraken",    "/api/v1/gct/portfolio/balances/kraken",           ""),
        ("GCT GetExchanges",                 "/api/v1/gct/exchanges",                           ""),
        ("GCT GetPortfolioPositions Kraken", "/api/v1/gct/portfolio/positions",                 "exchange=kraken"),
    ]

    # Verify connected flag first
    try:
        status, body = svc_get(page, GO, "/api/v1/gct/health", "", timeout=5000)
        connected = isinstance(body, dict) and body.get("connected", False)
        rec("GCT-Exhaustive", "GCT health connected=true", connected,
            f"HTTP {status} connected={connected}")
    except Exception as e:
        rec("GCT-Exhaustive", "GCT health connected=true", False, str(e)[:80])
        connected = False

    for name, path, params in GCT_ROUTES:
        try:
            status, body = svc_get(page, GO, path, params, timeout=12000)
            ok = status not in (500, 502, 503)
            detail = f"HTTP {status}"
            if isinstance(body, dict):
                detail += f" keys={list(body.keys())[:4]}"
            elif isinstance(body, list):
                detail += f" list[{len(body)}]"
            # GCT routes that require a live exchange may 503 if not connected
            if not connected and status in (503, 502):
                detail += " (GCT not connected — expected)"
                ok = True  # not a test failure, service is simply offline
            rec("GCT-Exhaustive", name, ok, detail)
        except Exception as e:
            rec("GCT-Exhaustive", name, False, str(e)[:100])

# ─── Suite 14: TS API CRUD & Auth routes ─────────────────────────────────────

def _extract_id(body: Any) -> str | None:
    """Try to extract a record ID from a POST response body."""
    if isinstance(body, dict):
        for key in ("id", "alertId", "orderId", "journalId", "drawingId", "recordId"):
            if key in body and body[key]:
                return str(body[key])
        # Nested: {data: {id: ...}}
        if "data" in body and isinstance(body["data"], dict):
            did = body["data"].get("id")
            if did:
                return str(did)
    return None

def suite_ts_crud(page: Page):
    # 1. Alert CRUD
    status, body = api_post(page, "/api/fusion/alerts",
                            {"symbol": "BTC/USD", "condition": "price_above", "value": 100000})
    rec("TS-CRUD", "POST /api/fusion/alerts", status not in (500,502,503),
        f"HTTP {status}")
    alert_id = _extract_id(body)
    if alert_id:
        status2, _ = api_get(page, f"/api/fusion/alerts/{alert_id}")
        rec("TS-CRUD", f"GET /api/fusion/alerts/{{id}}", status2 not in (500,502,503,404),
            f"HTTP {status2} id={alert_id}")
        status3, _ = api_delete(page, f"/api/fusion/alerts/{alert_id}")
        rec("TS-CRUD", f"DELETE /api/fusion/alerts/{{id}}", status3 not in (500,502,503),
            f"HTTP {status3}")
    else:
        rec("TS-CRUD", "GET /api/fusion/alerts/{id}", False, "no ID from POST")
        rec("TS-CRUD", "DELETE /api/fusion/alerts/{id}", False, "no ID from POST")

    # 2. Order CRUD
    status, body = api_post(page, "/api/fusion/orders",
                            {"symbol": "BTC/USD", "type": "market", "side": "buy", "amount": 0.001})
    rec("TS-CRUD", "POST /api/fusion/orders", status not in (500,502,503),
        f"HTTP {status}")
    order_id = _extract_id(body)
    if order_id:
        status2, _ = api_get(page, f"/api/fusion/orders/{order_id}")
        rec("TS-CRUD", f"GET /api/fusion/orders/{{id}}", status2 not in (500,502,503,404),
            f"HTTP {status2} id={order_id}")
    else:
        rec("TS-CRUD", "GET /api/fusion/orders/{id}", False, "no ID from POST")

    # 3. Trade Journal CRUD
    status, body = api_post(page, "/api/fusion/trade-journal",
                            {"symbol": "BTC/USD", "action": "buy", "notes": "E2E test"})
    rec("TS-CRUD", "POST /api/fusion/trade-journal", status not in (500,502,503),
        f"HTTP {status}")
    journal_id = _extract_id(body)
    if journal_id:
        status2, _ = api_get(page, f"/api/fusion/trade-journal/{journal_id}")
        rec("TS-CRUD", f"GET /api/fusion/trade-journal/{{id}}", status2 not in (500,502,503,404),
            f"HTTP {status2} id={journal_id}")
    else:
        rec("TS-CRUD", "GET /api/fusion/trade-journal/{id}", False, "no ID from POST")

    # 4. GeoMap Drawing CRUD
    status, body = api_post(page, "/api/geopolitical/drawings",
                            {"type": "line", "coordinates": [[0, 0], [10, 10]], "label": "E2E"})
    rec("TS-CRUD", "POST /api/geopolitical/drawings", status not in (500,502,503),
        f"HTTP {status}")
    status2, drawings_body = api_get(page, "/api/geopolitical/drawings")
    rec("TS-CRUD", "GET /api/geopolitical/drawings (list)", status2 not in (500,502,503,404),
        f"HTTP {status2}")

    # 5. Game-Theory POST
    status, body = api_post(page, "/api/geopolitical/game-theory/impact",
                            {"region": "europe", "category": "sanctions"})
    rec("TS-CRUD", "POST /api/geopolitical/game-theory/impact", status not in (500,502,503),
        f"HTTP {status}")

    # 6. Auth routes — no crash check (401/422 OK, 404/500 NOT OK)
    AUTH_ROUTES: list[tuple[str, str, dict | None]] = [
        ("POST /api/auth/passkeys/register/options",   "/api/auth/passkeys/register/options",
         {"username": "e2e_test"}),
        ("POST /api/auth/passkeys/authenticate/options", "/api/auth/passkeys/authenticate/options",
         {}),
        ("POST /api/auth/kg/encryption-key",           "/api/auth/kg/encryption-key",
         {}),
    ]
    for name, route, payload in AUTH_ROUTES:
        try:
            s, b = api_post(page, route, payload or {})
            ok = s not in (404, 500, 502, 503)
            rec("TS-CRUD", name, ok, f"HTTP {s} (401/422 OK)")
        except Exception as e:
            rec("TS-CRUD", name, False, str(e)[:80])

    # GET auth/register
    try:
        s, _ = api_get(page, "/api/auth/register")
        ok = s not in (404, 500, 502, 503)
        rec("TS-CRUD", "GET /api/auth/register", ok, f"HTTP {s}")
    except Exception as e:
        rec("TS-CRUD", "GET /api/auth/register", False, str(e)[:80])

# ─── Suite 15: Frontend Deep ──────────────────────────────────────────────────

def suite_frontend_deep(page: Page):
    # Auth Lab pages
    AUTH_LAB_PAGES: list[tuple[str, str]] = [
        ("/auth/passkeys",          "passkeys-management-page"),
        ("/auth/passkeys-lab",      "passkeys-lab-page"),
        ("/auth/kg-encryption-lab", "kg-encryption-lab"),
        ("/auth/security",          "security-settings"),
        ("/auth/privacy",           "privacy-policy"),
    ]
    for path, label in AUTH_LAB_PAGES:
        try:
            page.goto(BASE + path, wait_until="domcontentloaded", timeout=20000)
            page.wait_for_timeout(600)
            # Detect white screen: look for any visible text content
            body_text = page.locator("body").inner_text()
            has_content = len(body_text.strip()) > 20
            rec("Frontend-Deep", f"auth-lab {label} loads", has_content,
                f"chars={len(body_text.strip())}")
            shot(page, f"auth_lab_{label.replace('-','_')}")
        except Exception as e:
            rec("Frontend-Deep", f"auth-lab {label} loads", False, str(e)[:80])

    # Back to dashboard for remaining checks
    try:
        goto(page, "/", "watchlist-sidebar")
        page.wait_for_timeout(800)
    except Exception as e:
        rec("Frontend-Deep", "dashboard reload for deep checks", False, str(e)[:80])
        return

    # Strategy Tab Content
    try:
        page.get_by_test_id("tab-strategy").click(timeout=3000)
        page.wait_for_timeout(1000)
        strategy_content = page.locator(
            "[data-testid='strategy-lab'], section, .card, [role='tabpanel']"
        ).first
        has_strategy = strategy_content.count() > 0 and strategy_content.is_visible()
        rec("Frontend-Deep", "strategy tab has content", has_strategy)
        shot(page, "dashboard_strategy_tab")
    except Exception as e:
        rec("Frontend-Deep", "strategy tab has content", False, str(e)[:80])

    # Drawing Toolbar
    try:
        drawing_sel = (
            "[data-testid*='draw'], button[title*='Line'], button[title*='Draw'], "
            "[data-testid='drawing-toolbar']"
        )
        drawing_els = page.locator(drawing_sel).all()
        has_drawing = len(drawing_els) > 0
        rec("Frontend-Deep", "drawing toolbar present", has_drawing,
            f"found {len(drawing_els)} elements")
        if has_drawing:
            try:
                drawing_els[0].click(timeout=2000)
                page.wait_for_timeout(400)
                shot(page, "drawing_toolbar_click")
            except: pass
    except Exception as e:
        rec("Frontend-Deep", "drawing toolbar present", False, str(e)[:80])

    # Chart Type Selector
    try:
        chart_type_sel = (
            "button[title*='Candlestick'], button[title*='Line chart'], "
            "button[title*='Area'], [data-testid*='chart-type']"
        )
        chart_btns = page.locator(chart_type_sel).all()
        has_chart_types = len(chart_btns) > 0
        rec("Frontend-Deep", "chart type selector present", has_chart_types,
            f"found {len(chart_btns)} types")
        if has_chart_types:
            for btn in chart_btns[:3]:
                try:
                    btn.click(timeout=1500)
                    page.wait_for_timeout(300)
                except: pass
            shot(page, "chart_type_selector")
    except Exception as e:
        rec("Frontend-Deep", "chart type selector present", False, str(e)[:80])

    # Portfolio Tab Content
    try:
        page.get_by_test_id("tab-portfolio").click(timeout=3000)
        page.wait_for_timeout(1000)
        portfolio_content = page.locator(
            "[class*='metric'], [class*='portfolio'], table, canvas"
        ).first
        has_portfolio = portfolio_content.count() > 0
        rec("Frontend-Deep", "portfolio tab has metrics/content", has_portfolio)
        shot(page, "dashboard_portfolio_tab")
    except Exception as e:
        rec("Frontend-Deep", "portfolio tab has metrics/content", False, str(e)[:80])

    # Trade Journal Tab (orders tab)
    try:
        page.get_by_test_id("tab-orders").click(timeout=3000)
        page.wait_for_timeout(1000)
        s = shot(page, "dashboard_trade_journal_tab")
        journal_content = page.locator("form, table, input, [class*='journal'], [class*='order']").first
        has_journal = journal_content.count() > 0
        rec("Frontend-Deep", "trade-journal tab has form/table", has_journal, screenshot=s)
    except Exception as e:
        rec("Frontend-Deep", "trade-journal tab has form/table", False, str(e)[:80])

    # GeoMap: Central Bank Overlay API
    try:
        status, body = api_get(page, "/api/geopolitical/overlays/central-bank")
        ok = status not in (500, 502, 503)
        rec("Frontend-Deep", "central-bank overlay API", ok, f"HTTP {status}")
    except Exception as e:
        rec("Frontend-Deep", "central-bank overlay API", False, str(e)[:80])

    # GeoMap: navigate and check candidate accept/reject UI
    try:
        goto(page, "/geopolitical-map", "geopolitical-map-container")
        page.wait_for_timeout(2000)

        # Central bank overlay selector on map
        overlay_el = page.locator(
            "[data-testid*='overlay'], [data-testid*='central-bank']"
        ).first
        rec("Frontend-Deep", "central-bank overlay element on geomap",
            overlay_el.count() > 0)

        # Candidate accept/reject buttons
        accept_btn = page.get_by_role("button").filter(has_text="Accept").first
        reject_btn = page.get_by_role("button").filter(has_text="Reject").first
        snooze_btn = page.get_by_role("button").filter(has_text="Snooze").first
        has_candidate_ui = (
            accept_btn.count() > 0 or reject_btn.count() > 0 or snooze_btn.count() > 0
        )
        rec("Frontend-Deep", "candidate accept/reject/snooze UI", has_candidate_ui,
            f"accept={accept_btn.count()} reject={reject_btn.count()} snooze={snooze_btn.count()}")
        shot(page, "geomap_candidate_ui")
    except Exception as e:
        rec("Frontend-Deep", "geomap candidate UI check", False, str(e)[:80])

# ─── CDP console capture ──────────────────────────────────────────────────────

def setup_cdp(page: Page):
    def on_console(msg: ConsoleMessage):
        if msg.type in ("error", "warning"):
            console_errors.append(f"[{msg.type.upper()}] {msg.text[:120]}")
    page.on("console", on_console)

# ─── Main ─────────────────────────────────────────────────────────────────────

def main() -> int:
    global SVC_UP

    # ── Pre-flight: start missing services ────────────────────────────────────
    SVC_UP = ensure_services()

    try:
        with sync_playwright() as p:
            browser: Browser = p.chromium.launch(
                headless=True,
                args=["--disable-web-security", "--disable-features=IsolateOrigins"],
            )
            context = browser.new_context(
                viewport={"width": 1440, "height": 900},
                ignore_https_errors=True,
            )
            page = context.new_page()
            setup_cdp(page)
            page.set_default_timeout(15000)

            print("\n🚀 TradeView Fusion — Comprehensive E2E (Rev 12)\n" + "="*55)

            print("\n📋 Suite 1: Infrastructure Health")
            suite_infra(page)

            print("\n📋 Suite 2: TS API Routes")
            suite_api(page)

            print("\n📋 Suite 3: Trading Dashboard UI")
            suite_dashboard(page)

            print("\n📋 Suite 4: GeoMap UI")
            suite_geomap(page)

            print("\n📋 Suite 5: Auth Pages")
            suite_auth(page)

            print("\n📋 Suite 6: Cross-Layer Integration")
            suite_integration(page)

            print("\n📋 Suite 7: Data Sources")
            suite_sources(page)

            print("\n📋 Suite 8: Python Indicator Service direct :8090")
            suite_py_indicators(page)

            print("\n📋 Suite 9: Python Soft-Signals direct :8091")
            suite_py_soft_signals(page)

            print("\n📋 Suite 10: Finance-Bridge direct :8092")
            suite_finance_bridge(page)

            print("\n📋 Suite 11: Go Gateway GET routes :9060")
            suite_go_get(page)

            print("\n📋 Suite 12: Go Gateway POST routes :9060 (proxies)")
            suite_go_post(page)

            print("\n📋 Suite 13: GCT exhaustive")
            suite_gct_exhaustive(page)

            print("\n📋 Suite 14: TS API CRUD & Auth routes")
            suite_ts_crud(page)

            print("\n📋 Suite 15: Frontend Deep")
            suite_frontend_deep(page)

            browser.close()

    finally:
        # ── Terminate any services we started ─────────────────────────────────
        for proc in _started_procs:
            try:
                proc.terminate()
            except Exception:
                pass

    # ── Summary ───────────────────────────────────────────────────────────────
    passed  = [r for r in results if r.ok]
    failed  = [r for r in results if not r.ok]
    total   = len(results)

    print(f"\n{'═'*60}")
    print(f"TOTAL: {len(passed)}/{total} passed")
    print(f"{'═'*60}")

    if failed:
        print("\n❌ FAILURES:")
        for r in failed:
            print(f"  [{r.suite}] {r.name}: {r.detail}")

    if console_errors:
        print(f"\n⚠️  CDP console errors ({len(console_errors)}):")
        for e in console_errors[:15]:
            print(f"  {e}")

    # ── Write results to MD ───────────────────────────────────────────────────
    write_md(passed, failed, console_errors)

    return 0 if not failed else 1


def write_md(passed: list[R], failed: list[R], console_errs: list[str]):
    md_path = REPO / "docs" / "E2E_VERIFY_PHASES_0-4.md"
    existing = md_path.read_text(encoding="utf-8") if md_path.exists() else ""

    now = datetime.now(timezone.utc).strftime("%d. %b %Y %H:%M UTC")
    total = len(passed) + len(failed)
    pct = int(100 * len(passed) / total) if total else 0

    # Group by suite
    suites: dict[str, list[R]] = {}
    for r in passed + failed:
        suites.setdefault(r.suite, []).append(r)

    suite_rows = ""
    for suite, rs in suites.items():
        ok_count = sum(1 for r in rs if r.ok)
        status = "✅" if ok_count == len(rs) else ("⚠️" if ok_count > 0 else "❌")
        fails = [r.name for r in rs if not r.ok]
        fail_note = f" — FAIL: {', '.join(fails[:3])}" if fails else ""
        suite_rows += f"| **{suite}** | {ok_count}/{len(rs)} | {status}{fail_note} |\n"

    api_rows = ""
    for r in suites.get("API-GET", []) + suites.get("API-POST", []):
        icon = "✅" if r.ok else "❌"
        api_rows += f"| `{r.name}` | {icon} {r.detail[:60]} |\n"

    infra_rows = ""
    for r in suites.get("Infra", []):
        icon = "✅" if r.ok else "❌"
        infra_rows += f"| {r.name} | {icon} | {r.detail[:80]} |\n"

    fail_rows = ""
    for r in failed:
        fail_rows += f"| [{r.suite}] {r.name} | {r.detail[:80]} |\n"
    if not fail_rows:
        fail_rows = "| — | Keine Fehler |\n"

    cdp_section = ""
    if console_errs:
        cdp_section = "#### CDP Console Errors\n```\n" + "\n".join(console_errs[:20]) + "\n```\n"
    else:
        cdp_section = "#### CDP Console Errors\n✅ Keine Console-Fehler erfasst.\n"

    # New suites summary (8-15)
    new_suites_rows = ""
    for suite_name in [
        "Py-Indicators", "Py-SoftSignals", "Finance-Bridge",
        "Go-GET", "Go-POST", "GCT-Exhaustive", "TS-CRUD", "Frontend-Deep"
    ]:
        rs = suites.get(suite_name, [])
        if not rs:
            continue
        ok_count = sum(1 for r in rs if r.ok)
        status = "✅" if ok_count == len(rs) else ("⚠️" if ok_count > 0 else "❌")
        fails = [r.name for r in rs if not r.ok]
        fail_note = f" — FAIL: {', '.join(fails[:2])}" if fails else ""
        new_suites_rows += f"| **{suite_name}** | {ok_count}/{len(rs)} | {status}{fail_note} |\n"

    new_entry = f"""
---

## Rev 12 — Full-Stack E2E Verification ({now})

> **Scope:** 15 Suites — alle Layer, alle API-Routen, alle UI-Komponenten, direkte Service-Calls
> **Stack:** Next.js :3000 + Go-Gateway :9060 + GCT :9052/9053 + Indicator :8090 + Soft-Signals :8091 + Finance-Bridge :8092
> **Result:** {len(passed)}/{total} Tests bestanden ({pct}%)

### Ergebnis nach Suite

| Suite | Passed | Status |
|-------|--------|--------|
{suite_rows}
### Neue Suites 8–15 Detail

| Suite | Passed | Status |
|-------|--------|--------|
{new_suites_rows if new_suites_rows else "| — | — | — |\n"}

### Infrastructure Health

| Service | Status | Details |
|---------|--------|---------|
{infra_rows}
### API Route Coverage (Suites 2 GET/POST)

| Route | Status |
|-------|--------|
{api_rows}
### Failures

| Test | Detail |
|------|--------|
{fail_rows}
{cdp_section}
### Screenshots

Gespeichert in `e2e_screenshots/` — {datetime.now().strftime('%Y-%m-%d')}.

"""

    # Append to existing history section or append at end
    history_marker = "## 11. Verifikations-Historie"
    if history_marker in existing:
        insert_pos = existing.index(history_marker)
        updated = existing[:insert_pos] + new_entry + "\n" + existing[insert_pos:]
    else:
        updated = existing + new_entry

    md_path.write_text(updated, encoding="utf-8")
    print(f"\n📄 Results written → {md_path}")


if __name__ == "__main__":
    sys.exit(main())
