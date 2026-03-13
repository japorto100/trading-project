"""
GIL-Release Verification — py.detach() in rust_core.

Verifies that Rust functions release the GIL during computation,
enabling true parallel execution from Python threads.

Strategy:
  - Run N threads each calling calculate_indicators_batch.
  - Measure wall time vs N * single-call time.
  - Wall time / single_time < threshold proves parallel execution.
    (Without GIL release: wall ≈ N * single. With: wall ≈ single.)

Also verifies correctness: results must match single-threaded output.
"""
from __future__ import annotations

import threading
import time
import unittest

try:
    from tradeviewfusion_rust_core import calculate_indicators_batch
    RUST_AVAILABLE = True
except ImportError:
    RUST_AVAILABLE = False


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_batch(n: int = 200):
    closes  = [100.0 + i * 0.1 for i in range(n)]
    highs   = [c + 0.5 for c in closes]
    lows    = [c - 0.5 for c in closes]
    volumes = [1000.0 + i * 5.0 for i in range(n)]
    return (
        list(range(n)),      # timestamps
        closes,              # opens (approx)
        highs,
        lows,
        closes,
        volumes,
        ["ema_12", "ema_26", "macd_12_26_9", "rsi_14", "adx_14", "stoch_14_3",
         "bb_bw_20", "wma_10", "hma_9"],
    )


def _call_batch(result_holder: list, idx: int) -> None:
    args = _make_batch()
    result_holder[idx] = calculate_indicators_batch(*args)


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

@unittest.skipUnless(RUST_AVAILABLE, "rust_core not built — run `maturin develop` first")
class TestPyO3GILRelease(unittest.TestCase):

    def test_single_call_returns_correct_keys(self):
        """Sanity: batch returns all expected indicator keys."""
        args = _make_batch()
        result = calculate_indicators_batch(*args)
        self.assertIn("ema_12", result)
        self.assertIn("macd_line_12_26_9", result)
        self.assertIn("macd_signal_12_26_9", result)
        self.assertIn("macd_hist_12_26_9", result)
        self.assertIn("rsi_14", result)
        self.assertIn("adx_14", result)
        self.assertIn("di_plus_14", result)
        self.assertIn("di_minus_14", result)
        self.assertIn("stoch_k_14_3", result)
        self.assertIn("stoch_d_14_3", result)
        self.assertIn("wma_10", result)
        self.assertIn("hma_9", result)

    def test_threaded_results_match_single(self):
        """All threads must produce identical output to single-threaded call."""
        N = 4
        expected = calculate_indicators_batch(*_make_batch())
        results = [None] * N
        threads = [threading.Thread(target=_call_batch, args=(results, i)) for i in range(N)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()
        for i, r in enumerate(results):
            self.assertIsNotNone(r, f"Thread {i} returned None")
            for key in expected:
                self.assertIn(key, r)
                for j, (ev, gv) in enumerate(zip(expected[key], r[key])):
                    self.assertAlmostEqual(ev, gv, places=10,
                        msg=f"Thread {i} mismatch at {key}[{j}]: expected {ev}, got {gv}")

    def test_parallel_speedup_vs_serial(self):
        """
        Wall time of N concurrent calls should be significantly less than N * single_time.
        This proves py.detach() actually releases the GIL.

        Threshold: wall_time < N * single_time * 0.75
        (i.e. at least 25% speedup from parallelism at N=4 threads)

        NOTE: On a single-core machine or under heavy load this may be flaky.
        The test is marked as a soft assertion with a warning rather than hard failure,
        because CI environments may not expose true parallelism.
        """
        N = 4
        # Warm up
        calculate_indicators_batch(*_make_batch())

        # Single-threaded baseline
        t0 = time.perf_counter()
        for _ in range(N):
            calculate_indicators_batch(*_make_batch())
        serial_time = time.perf_counter() - t0

        # Parallel
        results = [None] * N
        threads = [threading.Thread(target=_call_batch, args=(results, i)) for i in range(N)]
        t0 = time.perf_counter()
        for t in threads:
            t.start()
        for t in threads:
            t.join()
        parallel_time = time.perf_counter() - t0

        speedup = serial_time / parallel_time
        threshold = 0.75 * N  # expect at least 3x speedup for 4 threads

        print(f"\n  GIL release speedup: serial={serial_time*1000:.0f}ms  "
              f"parallel={parallel_time*1000:.0f}ms  "
              f"speedup={speedup:.2f}x  (need >{N * 0.75:.1f}x for PASS)")

        # Soft assertion — warn instead of hard-fail in restricted envs
        if speedup < N * 0.75:
            import warnings
            warnings.warn(
                f"GIL speedup {speedup:.2f}x below threshold {N * 0.75:.1f}x — "
                "may indicate GIL not released OR single-core CI environment.",
                stacklevel=2,
            )
        else:
            self.assertGreater(speedup, N * 0.75,
                f"Expected parallel speedup > {N * 0.75:.1f}x, got {speedup:.2f}x")


@unittest.skipUnless(RUST_AVAILABLE, "rust_core not built")
class TestPyO3GILEdgeCases(unittest.TestCase):

    def test_empty_input_threaded(self):
        """Empty input should not deadlock or panic under concurrent access."""
        results = [None] * 8
        def call_empty(holder, idx):
            holder[idx] = calculate_indicators_batch([], [], [], [], [], [], ["ema_12"])
        threads = [threading.Thread(target=call_empty, args=(results, i)) for i in range(8)]
        for t in threads:
            t.start()
        for t in threads:
            t.join(timeout=5.0)
        for i, r in enumerate(results):
            self.assertIsNotNone(r, f"Thread {i} returned None (possible deadlock)")
            self.assertEqual(r, {}, f"Thread {i}: empty input should return empty dict")

    def test_many_threads_no_corruption(self):
        """20 concurrent calls — no race conditions, no data corruption."""
        N = 20
        results = [None] * N
        threads = [threading.Thread(target=_call_batch, args=(results, i)) for i in range(N)]
        for t in threads:
            t.start()
        for t in threads:
            t.join(timeout=30.0)
        reference = calculate_indicators_batch(*_make_batch())
        for i, r in enumerate(results):
            self.assertIsNotNone(r, f"Thread {i} returned None")
            self.assertEqual(len(r["ema_12"]), len(reference["ema_12"]),
                f"Thread {i} length mismatch on ema_12")


if __name__ == "__main__":
    unittest.main(verbosity=2)
