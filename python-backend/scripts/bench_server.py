"""
Benchmark: uvicorn vs. Granian — Phase A (3.12/GIL) + Phase B (3.13t/nogil).

Both servers always start fresh on isolated bench ports. No devstack required.
Run from the python-backend directory.

PHASE A (default — Python 3.12):
    uv run python scripts/bench_server.py --group health   # HTTP overhead
    uv run python scripts/bench_server.py --group rust     # py.detach GIL-release
    uv run python scripts/bench_server.py --group python   # GIL control group
    uv run python scripts/bench_server.py --group all      # all 3 sequentially

PHASE B (Python 3.13t/nogil):
    uv run python scripts/bench_server.py --group all --venv .venv-313t

Flags:
    --group         health|rust|python|all    (default: all)
    --workers N     server processes/threads  (default: 1, fair baseline)
    --venv PATH     venv dir (default: .venv) — use .venv-313t for Phase B
    --skip-uv       skip uvicorn
    --skip-gr       skip Granian
    --service       indicator|memory|agent    (default: indicator, only indicator
                    has all 3 endpoint groups; others health-only)

Bench ports (never conflict with devstack):
    indicator  uvicorn :12092  granian :12192
    memory     uvicorn :12093  granian :12193
    agent      uvicorn :12094  granian :12194

Concurrency per group (tuned to avoid pure queueing noise):
    health  → concurrency=50  (fast endpoint, test raw connection throughput)
    rust    → concurrency=2   (py.detach releases GIL; 2 in-flight per worker)
    python  → concurrency=1   (GIL-bound; serial baseline, control group)
"""
from __future__ import annotations

import argparse
import asyncio
import os
import statistics
import subprocess
import sys
import time
from dataclasses import dataclass, field
from pathlib import Path

import httpx

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

PYTHON_BACKEND = Path(__file__).resolve().parents[1]

def _resolve_python(venv_dir: str) -> Path:
    base = PYTHON_BACKEND / venv_dir
    for candidate in (base / "Scripts" / "python.exe", base / "bin" / "python"):
        if candidate.exists():
            return candidate
    sys.exit(f"Python not found in venv '{venv_dir}'. Run: uv venv {venv_dir}")

# ---------------------------------------------------------------------------
# Payloads
# ---------------------------------------------------------------------------

def _ohlcv(n: int = 60) -> list[dict]:
    pts = []
    for i in range(n):
        c = 100.0 + i * 0.5
        pts.append({"time": i * 60, "open": c - 0.1, "high": c + 0.5,
                    "low": c - 0.5, "close": c, "volume": 1000.0 + i * 10})
    return pts

_OHLCV  = _ohlcv(60)
_CLOSES = [p["close"] for p in _OHLCV]

BATCH_PAYLOAD = {
    "timestamps": list(range(60)),
    "opens":   _CLOSES, "highs":   [c + 0.5 for c in _CLOSES],
    "lows":    [c - 0.5 for c in _CLOSES], "closes":  _CLOSES,
    "volumes": [1000.0 + i * 10 for i in range(60)],
    "indicators": ["ema_12", "ema_26", "macd_12_26_9", "rsi_14",
                   "adx_14", "stoch_14_3", "bb_bw_20", "wma_10", "hma_9"],
}
MACD_PAYLOAD = {"ohlcv": _OHLCV, "fast": 12, "slow": 26, "signal": 9}

# ---------------------------------------------------------------------------
# Endpoint groups
# ---------------------------------------------------------------------------

@dataclass
class Group:
    name: str
    label: str          # display name
    endpoints: list[tuple[str, str, dict]]
    concurrency: int    # tuned default per group
    requests: int       # tuned default per group
    note: str           # what this group measures

GROUPS: dict[str, Group] = {
    "health": Group(
        name="health",
        label="HTTP overhead (no Python compute)",
        endpoints=[("GET", "/health", {})],
        concurrency=50,
        requests=500,
        note="Tokio vs asyncio: raw connection + parsing overhead",
    ),
    "rust": Group(
        name="rust",
        label="Rust via py.detach (GIL released)",
        endpoints=[("POST", "/api/v1/indicators/batch", BATCH_PAYLOAD)],
        concurrency=2,
        requests=80,
        note="GIL freed during Rust compute — Granian can service other reqs",
    ),
    "python": Group(
        name="python",
        label="Pure Python MACD (GIL-bound, control)",
        endpoints=[("POST", "/api/v1/indicators/macd", MACD_PAYLOAD)],
        concurrency=1,
        requests=40,
        note="GIL serialises both servers identically — should be equal",
    ),
}

# ---------------------------------------------------------------------------
# Service definitions
# ---------------------------------------------------------------------------

UV_PORT_BASE   = 12000   # uvicorn bench port = UV_PORT_BASE + (devstack_port - 8000)
GR_PORT_OFFSET = 100     # granian bench port = uv_bench_port + GR_PORT_OFFSET

@dataclass
class ServiceDef:
    name: str
    svc_dir: str
    devstack_port: int

    @property
    def uv_bench_port(self) -> int:
        return UV_PORT_BASE + (self.devstack_port - 8000)

    @property
    def gr_bench_port(self) -> int:
        return self.uv_bench_port + GR_PORT_OFFSET


SERVICES: dict[str, ServiceDef] = {
    "indicator": ServiceDef("indicator_engine", "indicator_engine", 8092),
    "memory":    ServiceDef("memory-service",    "memory-service",    8093),
    "agent":     ServiceDef("agent-service",     "agent-service",     8094),
}

# memory/agent only have health endpoints for a meaningful isolated test
MEMORY_AGENT_ENDPOINTS = [("GET", "/health", {})]

# ---------------------------------------------------------------------------
# Server lifecycle
# ---------------------------------------------------------------------------

def _bench_env() -> dict:
    return {**os.environ, "GRPC_ENABLED": "0", "OTEL_ENABLED": "false"}


def _start_server(kind: str, python: Path, svc: ServiceDef,
                  port: int, workers: int) -> subprocess.Popen:
    svc_path = PYTHON_BACKEND / "services" / svc.svc_dir
    if kind == "granian":
        cmd = [str(python), "-m", "granian",
               "--interface", "asgi",
               "--host", "127.0.0.1",
               "--port", str(port),
               "--workers", str(workers),
               "app:app"]
    else:
        cmd = [str(python), "-m", "uvicorn", "app:app",
               "--host", "127.0.0.1",
               "--port", str(port),
               "--workers", str(workers)]
    return subprocess.Popen(
        cmd, cwd=svc_path,
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        env=_bench_env(),
    )


async def _wait_ready(port: int, timeout: float = 75.0) -> bool:
    url = f"http://127.0.0.1:{port}/health"
    deadline = time.monotonic() + timeout
    async with httpx.AsyncClient(timeout=2.0) as client:
        while time.monotonic() < deadline:
            try:
                r = await client.get(url)
                if r.status_code < 500:
                    return True
            except Exception:
                pass
            await asyncio.sleep(0.5)
    return False

# ---------------------------------------------------------------------------
# Load runner
# ---------------------------------------------------------------------------

async def _run(base_url: str, endpoints: list[tuple[str, str, dict]],
               n: int, concurrency: int) -> list[float]:
    cycle = (endpoints * (n // len(endpoints) + 1))[:n]
    sem   = asyncio.Semaphore(concurrency)
    results: list[float] = []

    # Single shared client with connection pool — avoids per-request TCP setup overhead.
    # max_connections slightly above concurrency so the pool never blocks on checkout.
    limits = httpx.Limits(max_connections=concurrency + 4, max_keepalive_connections=concurrency)
    async with httpx.AsyncClient(timeout=30.0, limits=limits) as client:
        async def one(method: str, path: str, payload: dict) -> None:
            async with sem:
                t0 = time.perf_counter()
                try:
                    if method == "GET":
                        await client.get(base_url + path)
                    else:
                        await client.post(base_url + path, json=payload)
                except Exception:
                    pass
                results.append((time.perf_counter() - t0) * 1000)

        await asyncio.gather(*[one(m, p, pl) for m, p, pl in cycle])
    return results

# ---------------------------------------------------------------------------
# Stats + display
# ---------------------------------------------------------------------------

def _stats(times: list[float], wall: float) -> dict:
    if not times:
        return {}
    s = sorted(times)
    n = len(s)
    return {
        "n": n, "wall_s": wall,
        "p50": statistics.median(s),
        "p95": s[int(n * 0.95)],
        "p99": s[int(n * 0.99)],
        "mean": statistics.mean(s),
        "rps": n / wall,
    }


def _row(label: str, st: dict) -> None:
    if not st:
        return
    print(f"  {label:<12}  "
          f"p50={st['p50']:8.2f}ms  "
          f"p95={st['p95']:8.2f}ms  "
          f"p99={st['p99']:8.2f}ms  "
          f"RPS={st['rps']:6.1f}  "
          f"({st['n']} reqs / {st['wall_s']:.1f}s)")


def _verdict(uv: dict, gr: dict) -> None:
    if not uv or not gr:
        return
    dp50 = uv["p50"] - gr["p50"]
    dp95 = uv["p95"] - gr["p95"]
    dp99 = uv["p99"] - gr["p99"]
    drps = gr["rps"] - uv["rps"]
    # Score: P50 is primary, but P95+P99+RPS break ties
    gr_score = (1 if gr["p50"] < uv["p50"] else 0) + \
               (1 if gr["p95"] < uv["p95"] else 0) + \
               (1 if gr["p99"] < uv["p99"] else 0) + \
               (1 if gr["rps"] > uv["rps"] else 0)
    winner = "granian" if gr_score >= 3 else "uvicorn"
    print(f"  → Winner: {winner}  "
          f"Δp50={dp50:+.2f}ms  Δp95={dp95:+.2f}ms  Δp99={dp99:+.2f}ms  ΔRPS={drps:+.1f}")
    if abs(dp50) < 0.5 and abs(drps) < 5:
        print("  → Negligible difference — no migration benefit.")
    elif winner == "granian" and (dp50 > 3.0 or drps > 10):
        print("  → Granian clearly wins. Proceed with GRN.V4 rollout.")
    elif winner == "granian":
        print("  → Granian better tail latency / throughput. Marginal win — validate Phase B.")
    else:
        print("  → uvicorn holds — Granian offers no benefit here.")

# ---------------------------------------------------------------------------
# Single group benchmark
# ---------------------------------------------------------------------------

async def bench_group(
    group: Group,
    svc: ServiceDef,
    uv_port: int,
    gr_port: int,
    python: Path,
    args: argparse.Namespace,
    procs: list[subprocess.Popen],
) -> tuple[dict, dict]:
    endpoints = group.endpoints
    C = group.concurrency
    N = group.requests

    print(f"\n  ┌─ [{group.name}] {group.label}")
    print(f"  │  concurrency={C}  requests={N}  note: {group.note}")

    uv_st = gr_st = {}

    if not args.skip_uv:
        print(f"  │  [uvicorn]  running …", end="", flush=True)
        t0 = time.perf_counter()
        times = await _run(f"http://127.0.0.1:{uv_port}", endpoints, N, C)
        uv_st = _stats(times, time.perf_counter() - t0)
        print(f" done")
        _row("uvicorn", uv_st)

    if not args.skip_gr:
        print(f"  │  [granian]  running …", end="", flush=True)
        t0 = time.perf_counter()
        times = await _run(f"http://127.0.0.1:{gr_port}", endpoints, N, C)
        gr_st = _stats(times, time.perf_counter() - t0)
        print(f" done")
        _row("granian", gr_st)

    _verdict(uv_st, gr_st)
    print(f"  └{'─' * 67}")
    return uv_st, gr_st

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

async def main(args: argparse.Namespace) -> None:
    python = _resolve_python(args.venv)
    svc    = SERVICES[args.service]

    uv_port = svc.uv_bench_port
    gr_port = svc.gr_bench_port

    # Which groups to run
    if args.group == "all":
        # indicator-service has all 3; others only health makes sense
        if args.service == "indicator":
            run_groups = list(GROUPS.values())
        else:
            run_groups = [GROUPS["health"]]
    else:
        if args.group not in GROUPS:
            sys.exit(f"Unknown group '{args.group}'. Choose: {', '.join(GROUPS)}, all")
        run_groups = [GROUPS[args.group]]

    py_label = "3.13t/nogil" if "313t" in args.venv else "3.12/GIL"
    print(f"\n╔══ uvicorn vs Granian — {svc.name} ({py_label}) ══╗")
    print(f"  workers={args.workers}  venv={args.venv}  python={python.name}")
    print(f"  uvicorn bench :{uv_port}   granian bench :{gr_port}")
    print(f"  groups: {[g.name for g in run_groups]}")

    procs: list[subprocess.Popen] = []

    try:
        # ── Start both servers ────────────────────────────────────────────
        uv_ready = gr_ready = False

        if not args.skip_uv:
            print(f"\n  Starting uvicorn :{uv_port} (workers={args.workers}) …", end="", flush=True)
            procs.append(_start_server("uvicorn", python, svc, uv_port, args.workers))
            uv_ready = await _wait_ready(uv_port)
            print(f" {'ready ✓' if uv_ready else 'TIMEOUT ✗'}")

        if not args.skip_gr:
            print(f"  Starting granian :{gr_port} (workers={args.workers}) …", end="", flush=True)
            procs.append(_start_server("granian", python, svc, gr_port, args.workers))
            gr_ready = await _wait_ready(gr_port)
            print(f" {'ready ✓' if gr_ready else 'TIMEOUT ✗'}")

        if not uv_ready and not gr_ready:
            sys.exit("Both servers failed to start.")

        # ── Warm-up (health endpoint, both servers) ───────────────────────
        WARMUP = 20
        print(f"\n  Warm-up ({WARMUP} reqs, concurrency=5) …", end="", flush=True)
        health_ep = [("GET", "/health", {})]
        if uv_ready:
            await _run(f"http://127.0.0.1:{uv_port}", health_ep, WARMUP, 5)
        if gr_ready:
            await _run(f"http://127.0.0.1:{gr_port}", health_ep, WARMUP, 5)
        print(" done\n")

        # ── Run groups ────────────────────────────────────────────────────
        group_results: list[tuple[str, dict, dict]] = []
        for group in run_groups:
            # Skip rust/python groups for non-indicator services
            if args.service != "indicator" and group.name != "health":
                continue
            uv_st, gr_st = await bench_group(
                group, svc, uv_port, gr_port, python, args, procs
            )
            group_results.append((group.name, uv_st, gr_st))

        # ── Summary ───────────────────────────────────────────────────────
        if len(group_results) > 1:
            print(f"\n{'═' * 70}")
            print(f"  SUMMARY  {svc.name}  ({py_label}  workers={args.workers})")
            print(f"{'═' * 70}")
            for gname, uv_st, gr_st in group_results:
                g = GROUPS[gname]
                print(f"\n  [{gname}] {g.label}")
                _row("uvicorn", uv_st)
                _row("granian", gr_st)
                _verdict(uv_st, gr_st)
            print(f"{'═' * 70}\n")

    finally:
        for p in procs:
            try:
                p.terminate(); p.wait(timeout=5)
            except Exception:
                try: p.kill()
                except Exception: pass


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="uvicorn vs. Granian — Phase A/B benchmark",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("--group",   default="all",
                        choices=[*GROUPS, "all"],
                        help="Endpoint group to benchmark (default: all)")
    parser.add_argument("--service", default="indicator",
                        choices=list(SERVICES),
                        help="Service to benchmark (default: indicator)")
    parser.add_argument("--workers", type=int, default=1,
                        help="Server worker count for both servers (default: 1)")
    parser.add_argument("--venv",    default=".venv",
                        help="venv directory (default: .venv). Use .venv-313t for Phase B")
    parser.add_argument("--skip-uv", action="store_true", help="Skip uvicorn")
    parser.add_argument("--skip-gr", action="store_true", help="Skip Granian")
    asyncio.run(main(parser.parse_args()))
