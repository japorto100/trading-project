"""
Gap-Pattern detector (Kaabar 2026, Ch. 10).

Tests cover:
  - Output shape, value range {-1.0, 0.0, 1.0}
  - No signal on bar 0 (no previous close)
  - Bullish gap-down: open < prev_close AND gap > ATR * min_size → 1.0
  - Bearish gap-up:  open > prev_close AND gap > ATR * min_size → -1.0
  - Gap below min_size threshold → no signal
  - Flat open == prev_close → no signal
  - ATR period and min_size configurability
"""
from __future__ import annotations

import unittest

from indicator_engine.pipeline import (
    GapPatternRequest,
    GapPatternResponse,
    OHLCVPoint,
    calculate_gap_pattern,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _pt(t: int, o: float, h: float, lo: float, c: float, v: float = 1000.0) -> OHLCVPoint:
    return OHLCVPoint(time=t, open=o, high=h, low=lo, close=c, volume=v)


def _flat(n: int, price: float = 100.0) -> list[OHLCVPoint]:
    return [_pt(i, price, price + 0.5, price - 0.5, price) for i in range(n)]


def _req(pts: list[OHLCVPoint], atr_period: int = 14, min_size: float = 1.0) -> GapPatternRequest:
    return GapPatternRequest(ohlcv=pts, atr_period=atr_period, min_size=min_size)


def _stable_base(n: int, price: float = 100.0) -> list[OHLCVPoint]:
    """Stable series to seed ATR (small true range → ATR stays small)."""
    return [_pt(i, price, price + 0.2, price - 0.2, price) for i in range(n)]


# ---------------------------------------------------------------------------
# Shape + basic invariants
# ---------------------------------------------------------------------------

class TestGapPatternShape(unittest.TestCase):
    def test_output_length(self):
        self.assertEqual(len(calculate_gap_pattern(_req(_flat(60))).data), 60)

    def test_returns_gap_pattern_response(self):
        self.assertIsInstance(calculate_gap_pattern(_req(_flat(60))), GapPatternResponse)

    def test_values_in_valid_set(self):
        for pt in calculate_gap_pattern(_req(_flat(60))).data:
            self.assertIn(pt.value, {-1.0, 0.0, 1.0})

    def test_bar_0_never_signals(self):
        result = calculate_gap_pattern(_req(_flat(60)))
        self.assertEqual(result.data[0].value, 0.0)

    def test_flat_open_no_signal(self):
        """open == prev_close → gap_size == 0 → no signal regardless of min_size."""
        result = calculate_gap_pattern(_req(_flat(60), min_size=0.1))
        self.assertTrue(all(p.value == 0.0 for p in result.data))

    def test_metadata_present(self):
        result = calculate_gap_pattern(_req(_flat(60)))
        self.assertEqual(result.metadata["indicator"], "GAP_PATTERN")
        self.assertIn("atrPeriod", result.metadata)
        self.assertIn("minSize", result.metadata)

    def test_time_alignment(self):
        pts = _flat(40)
        result = calculate_gap_pattern(_req(pts))
        for i, pt in enumerate(result.data):
            self.assertEqual(pt.time, i)


# ---------------------------------------------------------------------------
# Bullish gap-down signal
# ---------------------------------------------------------------------------

class TestGapPatternBullish(unittest.TestCase):
    def _make_gap_down(self, gap: float = 5.0, base_price: float = 100.0, n_base: int = 20) -> list[OHLCVPoint]:
        """Stable base to seed ATR, then one bar with open well below prev close."""
        pts = _stable_base(n_base, base_price)
        # gap-down bar: open significantly below prev close
        prev_close = pts[-1].close  # = base_price
        open_ = prev_close - gap
        pts.append(_pt(n_base, open_, open_ + 0.2, open_ - 0.2, open_ + 0.1))
        # padding
        last = pts[-1].close
        for k in range(10):
            pts.append(_pt(n_base + 1 + k, last, last + 0.2, last - 0.2, last))
        return pts

    def test_bullish_signal_on_large_gap_down(self):
        pts = self._make_gap_down(gap=5.0)
        result = calculate_gap_pattern(_req(pts, atr_period=14, min_size=1.0))
        gap_bar_idx = 20
        self.assertEqual(result.data[gap_bar_idx].value, 1.0,
                         "Expected bullish signal on gap-down bar")

    def test_no_signal_if_gap_too_small(self):
        """Gap smaller than ATR * min_size → no signal."""
        pts = self._make_gap_down(gap=0.01)  # tiny gap, ATR ~0.4 for stable base
        result = calculate_gap_pattern(_req(pts, atr_period=14, min_size=2.0))
        gap_bar_idx = 20
        self.assertEqual(result.data[gap_bar_idx].value, 0.0,
                         "Tiny gap should not signal")


# ---------------------------------------------------------------------------
# Bearish gap-up signal
# ---------------------------------------------------------------------------

class TestGapPatternBearish(unittest.TestCase):
    def _make_gap_up(self, gap: float = 5.0, base_price: float = 100.0, n_base: int = 20) -> list[OHLCVPoint]:
        pts = _stable_base(n_base, base_price)
        prev_close = pts[-1].close
        open_ = prev_close + gap
        pts.append(_pt(n_base, open_, open_ + 0.2, open_ - 0.2, open_ - 0.1))
        last = pts[-1].close
        for k in range(10):
            pts.append(_pt(n_base + 1 + k, last, last + 0.2, last - 0.2, last))
        return pts

    def test_bearish_signal_on_large_gap_up(self):
        pts = self._make_gap_up(gap=5.0)
        result = calculate_gap_pattern(_req(pts, atr_period=14, min_size=1.0))
        self.assertEqual(result.data[20].value, -1.0,
                         "Expected bearish signal on gap-up bar")

    def test_no_signal_if_gap_too_small(self):
        pts = self._make_gap_up(gap=0.01)
        result = calculate_gap_pattern(_req(pts, atr_period=14, min_size=2.0))
        self.assertEqual(result.data[20].value, 0.0)


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

class TestGapPatternConfig(unittest.TestCase):
    def test_custom_atr_period(self):
        pts = _flat(60)
        r5 = calculate_gap_pattern(_req(pts, atr_period=5))
        r20 = calculate_gap_pattern(_req(pts, atr_period=20))
        self.assertEqual(len(r5.data), len(r20.data))

    def test_high_min_size_suppresses_signals(self):
        """Very large min_size → virtually no gap passes the filter."""
        pts = _stable_base(20, 100.0)
        prev_close = pts[-1].close
        # gap of 2.0
        open_ = prev_close - 2.0
        pts.append(_pt(20, open_, open_ + 0.2, open_ - 0.2, open_))
        # max allowed min_size=10.0; gap=2.0, ATR~0.4 → required=4.0 > gap=2.0 → no signal
        result = calculate_gap_pattern(_req(pts, min_size=10.0))
        self.assertEqual(result.data[20].value, 0.0,
                         "Large min_size should suppress the signal")


if __name__ == "__main__":
    unittest.main()
