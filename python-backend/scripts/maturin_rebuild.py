#!/usr/bin/env python3
"""
Rebuild rust_core and install it into the active venv.

Clears the stale uv package cache first (--force because uv run holds the lock)
to prevent Windows from reinstalling an old cached .pyd instead of the fresh one.

Modes:
  default (build)  — maturin build → wheel → uv pip install --force-reinstall
                     Persistent: uv sync won't overwrite it.
  --develop        — maturin develop (editable, faster, no wheel file)
                     Warning: uv run may re-sync and overwrite with cached version.

Usage:
    uv run scripts/maturin_rebuild.py               # build (persistent)
    uv run scripts/maturin_rebuild.py --release     # release build
    uv run scripts/maturin_rebuild.py --smoke       # + smoke test
    uv run scripts/maturin_rebuild.py --develop     # maturin develop (fast, less stable)

On Windows the PowerShell wrapper is equivalent:
    .\\scripts\\rebuild-rust-core.ps1 [-Release] [-SmokeTest]
"""
import argparse
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent  # python-backend/
RUST_CORE = ROOT / "rust_core"
WHEELHOUSE = RUST_CORE / "target-local" / "wheels"


def run(cmd: list[str], check: bool = True, **kwargs) -> int:
    print(f"  $ {' '.join(str(c) for c in cmd)}", flush=True)
    result = subprocess.run(cmd, **kwargs)
    if check and result.returncode != 0:
        sys.exit(f"Command failed (exit {result.returncode}): {' '.join(str(c) for c in cmd)}")
    return result.returncode


def main() -> None:
    parser = argparse.ArgumentParser(description="Rebuild tradeviewfusion_rust_core wheel")
    parser.add_argument("--release", action="store_true", help="Build in release mode (slower, optimised)")
    parser.add_argument("--smoke", action="store_true", help="Run smoke test after install")
    parser.add_argument(
        "--develop",
        action="store_true",
        help=(
            "Use maturin develop (editable, faster) instead of build+install. "
            "Warning: uv run may overwrite the editable install from cache on next sync."
        ),
    )
    args = parser.parse_args()

    # Clear stale uv cache — use --force because the parent `uv run` holds the cache lock.
    # Exit code 1 = "nothing to clean" is not an error.
    run(["uv", "cache", "clean", "--force", "tradeviewfusion-rust-core"], check=False)

    if args.develop:
        # Fast path: maturin develop (editable install directly from build output)
        dev_cmd = [
            "uv", "run", "maturin", "develop",
            "--manifest-path", str(RUST_CORE / "Cargo.toml"),
        ]
        if args.release:
            dev_cmd.append("--release")
        run(dev_cmd)
    else:
        # Stable path: build wheel → force-reinstall (survives uv sync)
        WHEELHOUSE.mkdir(parents=True, exist_ok=True)
        for whl in WHEELHOUSE.glob("tradeviewfusion_rust_core-*.whl"):
            whl.unlink()

        build_cmd = [
            "uv", "run", "maturin", "build",
            "-m", str(RUST_CORE / "Cargo.toml"),
            "--out", str(WHEELHOUSE),
        ]
        if args.release:
            build_cmd.append("--release")
        run(build_cmd)

        wheels = sorted(WHEELHOUSE.glob("tradeviewfusion_rust_core-*.whl"), key=lambda p: p.stat().st_mtime)
        if not wheels:
            sys.exit("No wheel produced in wheelhouse.")

        run(["uv", "pip", "install", "--force-reinstall", str(wheels[-1])])

    if args.smoke:
        smoke = "\n".join([
            "import sys, tradeviewfusion_rust_core as m",
            "required = (",
            "    'composite_sma50_slope_norm','calculate_heartbeat','calculate_indicators_batch',",
            "    'redb_cache_set','redb_cache_get',",
            "    'extract_entities_from_text','dedup_context_fragments','score_tools_for_query',",
            ")",
            "missing = [n for n in required if not hasattr(m, n)]",
            "if missing: sys.exit(f'rust_core_missing: {missing}')",
            "print('rust_core smoke OK')",
        ])
        run([sys.executable, "-c", smoke])

    print("[maturin_rebuild] Done.")


if __name__ == "__main__":
    main()
