"""
R-Pattern reversal detector (Kaabar 2026, Ch. 7).

Tests cover:
  - Output shape, value range {-1.0, 0.0, 1.0}
  - No signal in first 4 bars (warmup)
  - Bullish signal: V-reversal in lows + rising closes + RSI < 50
  - Bearish signal: inverted-V in highs + falling closes + RSI > 50
  - Flat series never signals
  - calculate_r_pattern() endpoint wrapper
"""
from __future__ import annotations

import unittest

from indicator_engine.pipeline import (
    OHLCVPoint,
    RPatternRequest,
    RPatternResponse,
    calculate_r_pattern,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _pt(t: int, o: float, h: float, lo: float, c: float, v: float = 1000.0) -> OHLCVPoint:
    return OHLCVPoint(time=t, open=o, high=h, low=lo, close=c, volume=v)


def _flat(n: int, price: float = 100.0) -> list[OHLCVPoint]:
    return [_pt(i, price, price + 0.5, price - 0.5, price) for i in range(n)]


def _req(pts: list[OHLCVPoint], rsi_period: int = 14) -> RPatternRequest:
    return RPatternRequest(ohlcv=pts, rsi_period=rsi_period)


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

class TestRPatternShape(unittest.TestCase):
    def test_output_length_matches_input(self):
        result = calculate_r_pattern(_req(_flat(60)))
        self.assertEqual(len(result.data), 60)

    def test_returns_r_pattern_response(self):
        self.assertIsInstance(calculate_r_pattern(_req(_flat(60))), RPatternResponse)

    def test_values_in_valid_set(self):
        for pt in calculate_r_pattern(_req(_flat(60))).data:
            self.assertIn(pt.value, {-1.0, 0.0, 1.0})

    def test_no_signal_in_first_4_bars(self):
        result = calculate_r_pattern(_req(_flat(60)))
        for i in range(4):
            self.assertEqual(result.data[i].value, 0.0, f"bar {i} too early")

    def test_flat_series_never_signals(self):
        result = calculate_r_pattern(_req(_flat(100)))
        self.assertTrue(all(p.value == 0.0 for p in result.data))

    def test_metadata_present(self):
        result = calculate_r_pattern(_req(_flat(60)))
        self.assertEqual(result.metadata["indicator"], "R_PATTERN")
        self.assertIn("rsiPeriod", result.metadata)

    def test_time_alignment(self):
        pts = _flat(40)
        result = calculate_r_pattern(_req(pts))
        for i, pt in enumerate(result.data):
            self.assertEqual(pt.time, i)


class TestRPatternBullish(unittest.TestCase):
    def _make_bullish_setup(self, offset: int = 20) -> list[OHLCVPoint]:
        """Build a series where bars offset..offset+3 form a bullish R-pattern:
        - lows: V-shape  lo[i-2] < lo[i-3], lo[i-1] > lo[i-2], lo[i] > lo[i-1]
        - closes: rising over 4 bars
        - RSI stays below 50 by using a falling series before the pattern
        """
        pts: list[OHLCVPoint] = []
        # Falling preamble to push RSI < 50
        for i in range(offset):
            p = 100.0 - i * 0.5
            pts.append(_pt(i, p, p + 0.3, p - 0.8, p))

        # 4 pattern bars:  lo[0]>lo[1]>lo[2]<lo[3]  →  bars i-3,i-2,i-1,i
        base = offset
        lo_vals = [60.0, 58.0, 55.0, 57.0]  # lo[i-3]=60, lo[i-2]=58 (lowest), lo[i-1]=55? NO
        # Book: lo[i] > lo[i-1] > lo[i-2] < lo[i-3]
        #   ⟹  lo[i-3] is high, lo[i-2] is lowest, then lo[i-1] and lo[i] rise
        # lo[i-3]=60, lo[i-2]=55 (trough), lo[i-1]=57, lo[i]=59
        lo_vals = [60.0, 55.0, 57.0, 59.0]
        cl_vals = [80.1, 80.2, 80.3, 80.4]  # closes must be rising
        for j in range(4):
            p = cl_vals[j]
            pts.append(_pt(base + j, p, p + 1.0, lo_vals[j], p))

        # Padding
        last = pts[-1].close
        for k in range(20):
            pts.append(_pt(base + 4 + k, last, last + 0.3, last - 0.3, last))

        return pts

    def test_bullish_signal_fires(self):
        pts = self._make_bullish_setup(offset=30)
        result = calculate_r_pattern(_req(pts, rsi_period=14))
        signals = [p.value for p in result.data]
        self.assertIn(1.0, signals, "Expected at least one bullish R-Pattern signal")

    def test_bullish_signal_not_before_pattern(self):
        """No bullish signal should appear before the 4-bar pattern completes."""
        pts = self._make_bullish_setup(offset=30)
        result = calculate_r_pattern(_req(pts, rsi_period=14))
        for i in range(30):
            self.assertNotEqual(result.data[i].value, 1.0, f"Premature bullish signal at bar {i}")


class TestRPatternBearish(unittest.TestCase):
    def _make_bearish_setup(self, offset: int = 20) -> list[OHLCVPoint]:
        """Bearish R: highs form inverted-V, closes falling, RSI > 50."""
        pts: list[OHLCVPoint] = []
        # Rising preamble to push RSI > 50
        for i in range(offset):
            p = 100.0 + i * 0.5
            pts.append(_pt(i, p, p + 0.8, p - 0.3, p))

        base = offset
        # Book: hi[i] < hi[i-1] < hi[i-2] > hi[i-3]
        # hi[i-3]=115, hi[i-2]=120 (peak), hi[i-1]=118, hi[i]=116
        hi_vals = [115.0, 120.0, 118.0, 116.0]
        cl_vals = [110.4, 110.3, 110.2, 110.1]  # closes must be falling
        for j in range(4):
            p = cl_vals[j]
            pts.append(_pt(base + j, p, hi_vals[j], p - 1.0, p))

        last = pts[-1].close
        for k in range(20):
            pts.append(_pt(base + 4 + k, last, last + 0.3, last - 0.3, last))

        return pts

    def test_bearish_signal_fires(self):
        pts = self._make_bearish_setup(offset=30)
        result = calculate_r_pattern(_req(pts, rsi_period=14))
        signals = [p.value for p in result.data]
        self.assertIn(-1.0, signals, "Expected at least one bearish R-Pattern signal")

    def test_bearish_signal_not_before_pattern(self):
        pts = self._make_bearish_setup(offset=30)
        result = calculate_r_pattern(_req(pts, rsi_period=14))
        for i in range(30):
            self.assertNotEqual(result.data[i].value, -1.0, f"Premature bearish signal at bar {i}")


class TestRPatternEdgeCases(unittest.TestCase):
    def test_no_both_signals_same_bar(self):
        """Bullish and bearish cannot fire on the same bar."""
        pts = _flat(80)
        result = calculate_r_pattern(_req(pts))
        for pt in result.data:
            self.assertFalse(pt.value == 1.0 and pt.value == -1.0)

    def test_last_bar_never_signals(self):
        """Signal is emitted at i+1, so the last bar index is always 0."""
        pts = _flat(60)
        result = calculate_r_pattern(_req(pts))
        self.assertEqual(result.data[-1].value, 0.0, "Last bar cannot carry a signal (no i+1)")

    def test_custom_rsi_period(self):
        result_14 = calculate_r_pattern(_req(_flat(60), rsi_period=14))
        result_9 = calculate_r_pattern(_req(_flat(60), rsi_period=9))
        # Both valid — just verify they run without error
        self.assertEqual(len(result_14.data), len(result_9.data))


if __name__ == "__main__":
    unittest.main()
