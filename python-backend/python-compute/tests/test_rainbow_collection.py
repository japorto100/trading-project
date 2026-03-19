"""
Rainbow Collection — 7 indicators (Kaabar 2026, Ch. 3).

Tests cover:
  - Helper functions: slope(), e_bollinger_bands()
  - All 7 indicators: red, orange, yellow, green, blue, indigo, violet
  - calculate_rainbow_collection() endpoint wrapper
  - Output shape, value range {-1.0, 0.0, 1.0}, no warmup signals in early bars
  - Directional sanity: sustained trend triggers expected signal polarity
"""
from __future__ import annotations

import unittest

from indicator_engine.pipeline import (
    OHLCVPoint,
    RainbowRequest,
    RainbowResponse,
    _blue,
    _green,
    _indigo,
    _orange,
    _red,
    _violet,
    _yellow,
    calculate_rainbow_collection,
    e_bollinger_bands,
    slope,
)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _flat_ohlcv(n: int, price: float = 100.0) -> list[OHLCVPoint]:
    return [
        OHLCVPoint(time=i, open=price, high=price + 0.5, low=price - 0.5, close=price, volume=1000.0)
        for i in range(n)
    ]


def _trend_ohlcv(n: int, start: float = 100.0, step: float = 1.0) -> list[OHLCVPoint]:
    """Monotonically trending OHLCV."""
    pts = []
    for i in range(n):
        p = start + i * step
        pts.append(OHLCVPoint(time=i, open=p, high=p + 0.5, low=p - 0.5, close=p, volume=1000.0))
    return pts


def _closes(pts: list[OHLCVPoint]) -> list[float]:
    return [p.close for p in pts]


# ---------------------------------------------------------------------------
# slope() helper
# ---------------------------------------------------------------------------

class TestSlope(unittest.TestCase):
    def test_warmup_is_zero(self):
        vals = list(range(1, 21))  # 1..20
        out = slope(vals, period=5)
        for i in range(5):
            self.assertEqual(out[i], 0.0, f"warmup index {i} should be 0.0")

    def test_positive_slope(self):
        vals = list(range(1, 21))  # linear rise
        out = slope(vals, period=5)
        for i in range(5, len(vals)):
            self.assertGreater(out[i], 0.0, f"rising series slope[{i}] should be positive")

    def test_negative_slope(self):
        vals = list(range(20, 0, -1))  # linear fall
        out = slope(vals, period=5)
        for i in range(5, len(vals)):
            self.assertLess(out[i], 0.0, f"falling series slope[{i}] should be negative")

    def test_flat_slope_is_zero(self):
        vals = [5.0] * 20
        out = slope(vals, period=5)
        for i in range(5, len(vals)):
            self.assertEqual(out[i], 0.0)

    def test_output_length(self):
        vals = [1.0] * 30
        self.assertEqual(len(slope(vals, period=10)), 30)


# ---------------------------------------------------------------------------
# e_bollinger_bands() helper
# ---------------------------------------------------------------------------

class TestEBollingerBands(unittest.TestCase):
    def test_output_lengths(self):
        vals = [100.0 + i * 0.1 for i in range(50)]
        upper, mid, lower = e_bollinger_bands(vals, period=20)
        self.assertEqual(len(upper), 50)
        self.assertEqual(len(mid), 50)
        self.assertEqual(len(lower), 50)

    def test_ordering(self):
        vals = [100.0 + i * 0.1 for i in range(50)]
        upper, mid, lower = e_bollinger_bands(vals, period=20)
        for i in range(20, 50):
            self.assertGreaterEqual(upper[i], mid[i])
            self.assertLessEqual(lower[i], mid[i])

    def test_flat_bands_near_zero_width(self):
        vals = [100.0] * 50
        upper, mid, lower = e_bollinger_bands(vals, period=20)
        for i in range(20, 50):
            self.assertAlmostEqual(upper[i], mid[i], places=8)
            self.assertAlmostEqual(lower[i], mid[i], places=8)


# ---------------------------------------------------------------------------
# Individual Rainbow indicators — shape + value range
# ---------------------------------------------------------------------------

class TestRedIndicator(unittest.TestCase):
    def test_output_length(self):
        c = _closes(_flat_ohlcv(100))
        out = _red(c)
        self.assertEqual(len(out), 100)

    def test_values_in_valid_set(self):
        c = _closes(_flat_ohlcv(100))
        out = _red(c)
        for v in out:
            self.assertIn(v, {-1.0, 0.0, 1.0})

    def test_no_signal_in_early_bars(self):
        c = _closes(_flat_ohlcv(100))
        out = _red(c)
        # first 3 bars cannot produce a signal (need i-3 lookback)
        for i in range(4):
            self.assertEqual(out[i], 0.0)


class TestOrangeIndicator(unittest.TestCase):
    def test_output_length(self):
        c = _closes(_flat_ohlcv(100))
        self.assertEqual(len(_orange(c)), 100)

    def test_values_in_valid_set(self):
        c = _closes(_flat_ohlcv(100))
        for v in _orange(c):
            self.assertIn(v, {-1.0, 0.0, 1.0})

    def test_no_signal_in_early_bars(self):
        c = _closes(_flat_ohlcv(100))
        out = _orange(c)
        for i in range(6):
            self.assertEqual(out[i], 0.0)


class TestYellowIndicator(unittest.TestCase):
    def test_output_length(self):
        c = _closes(_flat_ohlcv(100))
        self.assertEqual(len(_yellow(c)), 100)

    def test_values_in_valid_set(self):
        c = _closes(_flat_ohlcv(100))
        for v in _yellow(c):
            self.assertIn(v, {-1.0, 0.0, 1.0})


class TestGreenIndicator(unittest.TestCase):
    def test_output_length(self):
        c = _closes(_flat_ohlcv(100))
        self.assertEqual(len(_green(c)), 100)

    def test_values_in_valid_set(self):
        c = _closes(_flat_ohlcv(100))
        for v in _green(c):
            self.assertIn(v, {-1.0, 0.0, 1.0})


class TestBlueIndicator(unittest.TestCase):
    def test_output_length(self):
        pts = _flat_ohlcv(100)
        c = _closes(pts)
        h = [p.high for p in pts]
        lo = [p.low for p in pts]
        self.assertEqual(len(_blue(c, h, lo)), 100)

    def test_values_in_valid_set(self):
        pts = _flat_ohlcv(100)
        c = _closes(pts)
        h = [p.high for p in pts]
        lo = [p.low for p in pts]
        for v in _blue(c, h, lo):
            self.assertIn(v, {-1.0, 0.0, 1.0})


class TestIndigoIndicator(unittest.TestCase):
    def test_output_length(self):
        c = _closes(_flat_ohlcv(100))
        self.assertEqual(len(_indigo(c)), 100)

    def test_values_in_valid_set(self):
        c = _closes(_flat_ohlcv(100))
        for v in _indigo(c):
            self.assertIn(v, {-1.0, 0.0, 1.0})

    def test_no_signal_before_fib_warmup(self):
        # Indigo needs at least 35 bars before it can signal
        c = _closes(_flat_ohlcv(100))
        out = _indigo(c)
        for i in range(35):
            self.assertEqual(out[i], 0.0, f"index {i} too early for Indigo signal")

    def test_bullish_signal_on_downtrend_reversal(self):
        """Indigo is a reversal indicator: fires when price turns UP after Fibonacci
        lookbacks were all declining. Build 40 bars of downtrend then flip up."""
        # 40 bars down (200→161), then 40 bars up — bullish signal fires at bar 41
        down = [OHLCVPoint(time=i, open=200.0 - i, high=201.0 - i, low=199.5 - i,
                           close=200.0 - i, volume=1000.0) for i in range(40)]
        base = 200.0 - 39  # = 161.0
        up = [OHLCVPoint(time=40 + j, open=base + j + 1, high=base + j + 1.5,
                         low=base + j + 0.5, close=base + j + 1, volume=1000.0)
              for j in range(40)]
        out = _indigo(_closes(down + up))
        self.assertTrue(any(v == 1.0 for v in out), "Expected bullish Indigo signal after downtrend reversal")

    def test_bearish_signal_on_uptrend_reversal(self):
        """Indigo bearish: fires when price turns DOWN after all Fibonacci lookbacks
        were ascending."""
        up = [OHLCVPoint(time=i, open=100.0 + i, high=100.5 + i, low=99.5 + i,
                         close=100.0 + i, volume=1000.0) for i in range(40)]
        base = 100.0 + 39  # = 139.0
        down = [OHLCVPoint(time=40 + j, open=base - j - 1, high=base - j - 0.5,
                           low=base - j - 1.5, close=base - j - 1, volume=1000.0)
                for j in range(40)]
        out = _indigo(_closes(up + down))
        self.assertTrue(any(v == -1.0 for v in out), "Expected bearish Indigo signal after uptrend reversal")


class TestVioletIndicator(unittest.TestCase):
    def test_output_length(self):
        c = _closes(_flat_ohlcv(100))
        self.assertEqual(len(_violet(c)), 100)

    def test_values_in_valid_set(self):
        c = _closes(_flat_ohlcv(100))
        for v in _violet(c):
            self.assertIn(v, {-1.0, 0.0, 1.0})

    def test_no_signal_before_warmup(self):
        # Violet needs hma_period(20) + max_fib_lag(21) before signalling
        c = _closes(_flat_ohlcv(100))
        out = _violet(c)
        for i in range(41):
            self.assertEqual(out[i], 0.0)


# ---------------------------------------------------------------------------
# calculate_rainbow_collection() endpoint wrapper
# ---------------------------------------------------------------------------

class TestCalculateRainbowCollection(unittest.TestCase):
    def _make_request(self, n: int = 100) -> RainbowRequest:
        return RainbowRequest(ohlcv=_flat_ohlcv(n))

    def test_returns_rainbow_response(self):
        result = calculate_rainbow_collection(self._make_request())
        self.assertIsInstance(result, RainbowResponse)

    def test_all_seven_series_present(self):
        result = calculate_rainbow_collection(self._make_request())
        for attr in ("red", "orange", "yellow", "green", "blue", "indigo", "violet"):
            series = getattr(result, attr)
            self.assertIsNotNone(series)
            self.assertEqual(len(series.data), 100)

    def test_metadata_contains_indicator_name(self):
        result = calculate_rainbow_collection(self._make_request())
        self.assertIn("RAINBOW_RED", result.red.metadata["indicator"])
        self.assertIn("RAINBOW_VIOLET", result.violet.metadata["indicator"])

    def test_signal_values_valid(self):
        result = calculate_rainbow_collection(self._make_request())
        for attr in ("red", "orange", "yellow", "green", "blue", "indigo", "violet"):
            for pt in getattr(result, attr).data:
                self.assertIn(pt.value, {-1.0, 0.0, 1.0}, f"{attr} has invalid value {pt.value}")

    def test_time_alignment(self):
        pts = _flat_ohlcv(50)
        result = calculate_rainbow_collection(RainbowRequest(ohlcv=pts))
        for i, pt in enumerate(result.red.data):
            self.assertEqual(pt.time, i)


if __name__ == "__main__":
    unittest.main()
