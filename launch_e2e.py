"""
Full-stack E2E launcher for TradeView Fusion.
Starts: Go Gateway (:9060) + Python indicator (:8090) + soft-signals (:8091)
        + finance-bridge (:8092) + Next.js (:3000)
Then runs e2e_runner.py.
"""
from __future__ import annotations

import os
import re
import signal
import socket
import subprocess
import sys
import time
from pathlib import Path

REPO = Path(__file__).parent
GO_DIR = REPO / "go-backend"
PY_DIR = REPO / "python-backend"
VENV_PY = PY_DIR / ".venv" / "Scripts" / "python.exe"

# ─── Env loader ──────────────────────────────────────────────────────────────

def load_env(path: Path) -> dict[str, str]:
    """Parse a .env file (skip comments + blanks, strip quotes)."""
    env: dict[str, str] = {}
    if not path.exists():
        return env
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        m = re.match(r'^([^#=\s]+)\s*=\s*(.*)', line)
        if not m:
            continue
        key, val = m.group(1), m.group(2).strip()
        val = re.sub(r'^["\']|["\']$', '', val)
        if val:
            env[key] = val
    print(f"  [env] loaded {path.name} ({len(env)} vars)")
    return env


# ─── Port waiter ─────────────────────────────────────────────────────────────

def wait_for_port(port: int, name: str, timeout: int = 45) -> bool:
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with socket.create_connection(("127.0.0.1", port), timeout=1):
                print(f"  ✅ {name} ready on :{port}")
                return True
        except OSError:
            time.sleep(0.5)
    print(f"  ⚠️  {name} NOT ready after {timeout}s on :{port} — continuing anyway")
    return False


# ─── Service definitions ─────────────────────────────────────────────────────

def make_env(extra: dict[str, str]) -> dict[str, str]:
    """Merge os.environ + loaded .env files + extra overrides."""
    env = {**os.environ}
    env.update(load_env(REPO / ".env.development"))
    env.update(load_env(GO_DIR / ".env.development"))
    env.update(extra)
    return env


def start_go_gateway(env: dict[str, str]) -> subprocess.Popen:
    print("[go-gateway] starting on :9060 ...")
    return subprocess.Popen(
        ["go", "run", "./cmd/gateway"],
        cwd=GO_DIR,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )


def start_python_service(name: str, service_dir: Path, port: int,
                         env: dict[str, str]) -> subprocess.Popen:
    print(f"[{name}] starting on :{port} ...")
    return subprocess.Popen(
        [str(VENV_PY), "-m", "uvicorn", "app:app",
         "--host", "127.0.0.1", "--port", str(port)],
        cwd=service_dir,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )


def start_nextjs(env: dict[str, str]) -> subprocess.Popen:
    print("[nextjs] starting on :3000 ...")
    return subprocess.Popen(
        ["bun", "run", "dev"],
        cwd=REPO,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )


# ─── Log drain (non-blocking) ────────────────────────────────────────────────

import threading

def drain(proc: subprocess.Popen, prefix: str):
    def _drain():
        assert proc.stdout
        for line in proc.stdout:
            line = line.rstrip()
            if line:
                print(f"  [{prefix}] {line}")
    t = threading.Thread(target=_drain, daemon=True)
    t.start()


# ─── Main ────────────────────────────────────────────────────────────────────

def main() -> int:
    procs: list[subprocess.Popen] = []

    def cleanup():
        print("\n🛑 Stopping all services...")
        for p in procs:
            if p.poll() is None:
                p.terminate()
        for p in procs:
            try:
                p.wait(timeout=5)
            except subprocess.TimeoutExpired:
                p.kill()

    # Windows doesn't support SIGTERM handler in same way but let's try
    def on_signal(sig, frame):
        cleanup()
        sys.exit(1)
    signal.signal(signal.SIGINT, on_signal)
    signal.signal(signal.SIGTERM, on_signal)

    try:
        print("\n🚀 TradeView Fusion — Full Stack E2E Launcher")
        print("=" * 55)

        env = make_env({})

        # ── Start services in dependency order ──────────────────────────────
        print("\n📡 Starting backend services...")

        # 1. Go Gateway
        go_proc = start_go_gateway(env)
        procs.append(go_proc)
        drain(go_proc, "go")

        # 2. Python indicator service (:8090)
        ind_proc = start_python_service(
            "indicator", PY_DIR / "services" / "indicator-service", 8090, env)
        procs.append(ind_proc)
        drain(ind_proc, "indicator")

        # 3. Soft-signals (:8091)
        ss_proc = start_python_service(
            "soft-signals", PY_DIR / "services" / "geopolitical-soft-signals", 8091, env)
        procs.append(ss_proc)
        drain(ss_proc, "soft-signals")

        # 4. Finance bridge (:8092)
        fb_proc = start_python_service(
            "finance-bridge", PY_DIR / "services" / "finance-bridge", 8092, env)
        procs.append(fb_proc)
        drain(fb_proc, "finance-bridge")

        # 5. Next.js (:3000)
        next_proc = start_nextjs(env)
        procs.append(next_proc)
        drain(next_proc, "nextjs")

        # ── Wait for all ports ───────────────────────────────────────────────
        print("\n⏳ Waiting for services to be ready...")
        wait_for_port(9060, "go-gateway", timeout=60)
        wait_for_port(8090, "indicator",  timeout=60)
        wait_for_port(8091, "soft-signals", timeout=60)
        wait_for_port(8092, "finance-bridge", timeout=60)
        wait_for_port(3000, "nextjs", timeout=90)

        # Extra settle time for Next.js JIT compilation
        print("\n⏳ Waiting 5s for Next.js to JIT-compile initial routes...")
        time.sleep(5)

        # ── Run E2E tests ────────────────────────────────────────────────────
        print("\n🧪 Running E2E tests...\n")
        result = subprocess.run(
            ["uv", "run", "--with", "playwright", "e2e_runner.py"],
            cwd=REPO,
        )
        return result.returncode

    finally:
        cleanup()


if __name__ == "__main__":
    sys.exit(main())
