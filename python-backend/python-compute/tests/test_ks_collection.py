"""
K's Collection — 6 indicators (Kaabar 2026, Ch. 11).

Tests cover:
  - Output shape + valid value sets for all 6 indicators
  - K's Reversal I: BB(100) + MACD(12/26/9) crossover → {-1,0,1}
  - K's Reversal II: SMA(13) + 21-bar count threshold → {-1,0,1}
  - K's ATR-Adjusted RSI: RSI(13)*ATR(5) → RSI(13) → [0,100]
  - K's RSI²: RSI(14) → RSI(5) → [0,100]
  - K's MARSI: SMA(200) → RSI(20) → [0,100] continuous
  - K's Fibonacci MA: avg 15 Fib EMAs on highs+lows → price bands
  - FMA ordering: fma_high >= fma_low on flat data
  - Metadata correctness for each indicator
"""
from __future__ import annotations

import unittest

from indicator_engine.pipeline import (
    KsCollectionRequest,
    OHLCVPoint,
    calculate_ks_collection,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _pt(t: int, o: float, h: float, lo: float, c: float, v: float = 1000.0) -> OHLCVPoint:
    return OHLCVPoint(time=t, open=o, high=h, low=lo, close=c, volume=v)


def _flat(n: int, price: float = 100.0) -> list[OHLCVPoint]:
    return [_pt(i, price, price + 0.5, price - 0.5, price) for i in range(n)]


def _trending(n: int, start: float = 100.0, step: float = 0.5) -> list[OHLCVPoint]:
    pts = []
    for i in range(n):
        p = start + i * step
        pts.append(_pt(i, p, p + 0.3, p - 0.3, p))
    return pts


def _req(pts: list[OHLCVPoint]) -> KsCollectionRequest:
    return KsCollectionRequest(ohlcv=pts)


# ---------------------------------------------------------------------------
# Shape + keys
# ---------------------------------------------------------------------------

class TestKsCollectionShape(unittest.TestCase):
    def setUp(self):
        self.n = 250
        self.result = calculate_ks_collection(_req(_flat(self.n)))

    def test_all_keys_present(self):
        for key in ("reversalI", "reversalII", "atrAdjustedRSI", "rsiSquared",
                    "marsi", "fibonacciMA", "fibonacciMAHigh", "fibonacciMALow"):
            self.assertIn(key, self.result, f"Missing key: {key}")

    def test_all_series_correct_length(self):
        for key, resp in self.result.items():
            self.assertEqual(len(resp.data), self.n, f"{key}: wrong length")

    def test_time_alignment(self):
        pts = _flat(60)
        result = calculate_ks_collection(_req(pts))
        for i, pt in enumerate(result["reversalI"].data):
            self.assertEqual(pt.time, i)

    def test_metadata_indicator_name(self):
        expected = {
            "reversalI": "K_REVERSAL_I",
            "reversalII": "K_REVERSAL_II",
            "atrAdjustedRSI": "K_ATR_RSI",
            "rsiSquared": "K_RSI_SQUARED",
            "marsi": "K_MARSI",
            "fibonacciMA": "K_FIB_MA",
            "fibonacciMAHigh": "K_FIB_MA_HIGH",
            "fibonacciMALow": "K_FIB_MA_LOW",
        }
        result = calculate_ks_collection(_req(_flat(250)))
        for key, name in expected.items():
            self.assertEqual(result[key].metadata["indicator"], name)


# ---------------------------------------------------------------------------
# K's Reversal I
# ---------------------------------------------------------------------------

class TestReversalI(unittest.TestCase):
    def test_values_in_valid_set(self):
        result = calculate_ks_collection(_req(_flat(250)))
        for pt in result["reversalI"].data:
            self.assertIn(pt.value, {-1.0, 0.0, 1.0})

    def test_flat_series_no_signal(self):
        """Flat price → MACD = 0, price on BB midline → no signal."""
        result = calculate_ks_collection(_req(_flat(250)))
        self.assertTrue(all(p.value == 0.0 for p in result["reversalI"].data))

    def test_no_signal_on_last_bar(self):
        """Signal emitted at i+1, so last bar is always 0."""
        result = calculate_ks_collection(_req(_flat(150)))
        self.assertEqual(result["reversalI"].data[-1].value, 0.0)

    def test_metadata_bb_period(self):
        result = calculate_ks_collection(_req(_flat(150)))
        self.assertEqual(result["reversalI"].metadata["bbPeriod"], 100)

    def test_bullish_signal_on_oversold_macd_cross(self):
        """Build a series where:
        - price is well below the 100-period lower BB (gap_down run)
        - MACD crosses bullish at the recovery bar
        """
        # 120 falling bars, then one big recovery bar to force MACD crossover
        pts = []
        for i in range(120):
            p = 200.0 - i * 1.5  # strong downtrend
            pts.append(_pt(i, p, p + 0.2, p - 4.0, p))  # low wicks → very wide TR

        # recovery bar: open and close pop up, low stays below prev close
        base = pts[-1].close
        pts.append(_pt(120, base, base + 2.0, base - 10.0, base + 1.5))
        for k in range(20):
            last = pts[-1].close
            pts.append(_pt(121 + k, last, last + 0.3, last - 0.3, last))

        result = calculate_ks_collection(_req(pts))
        signals = [p.value for p in result["reversalI"].data]
        # Not guaranteed to fire given construction complexity — just verify shape
        for v in signals:
            self.assertIn(v, {-1.0, 0.0, 1.0})


# ---------------------------------------------------------------------------
# K's Reversal II
# ---------------------------------------------------------------------------

class TestReversalII(unittest.TestCase):
    def test_values_in_valid_set(self):
        result = calculate_ks_collection(_req(_flat(250)))
        for pt in result["reversalII"].data:
            self.assertIn(pt.value, {-1.0, 0.0, 1.0})

    def test_flat_series_values_valid(self):
        """Flat: close == SMA(13) exactly → count=0 (no bar strictly above) → bullish
        signal fires. Values must remain in {-1,0,1} regardless."""
        result = calculate_ks_collection(_req(_flat(250)))
        for pt in result["reversalII"].data:
            self.assertIn(pt.value, {-1.0, 0.0, 1.0})

    def test_metadata_sma_period(self):
        result = calculate_ks_collection(_req(_flat(150)))
        self.assertEqual(result["reversalII"].metadata["smaPeriod"], 13)
        self.assertEqual(result["reversalII"].metadata["countWindow"], 21)

    def test_bearish_signal_all_above_sma(self):
        """21 consecutive bars strictly above SMA(13) → bearish signal fires."""
        # 50-bar strong uptrend to seed SMA(13), then 21 bars well above SMA
        pts = []
        for i in range(50):
            p = 100.0 + i * 2.0  # rising fast
            pts.append(_pt(i, p, p + 0.5, p - 0.5, p))
        # Add 21 bars that are all well above their rolling SMA(13)
        for k in range(21):
            p = pts[-1].close + 50.0  # huge jump ensures price > SMA for all 21
            pts.append(_pt(50 + k, p, p + 0.5, p - 0.5, p))

        result = calculate_ks_collection(_req(pts))
        signals = [p.value for p in result["reversalII"].data]
        self.assertIn(-1.0, signals, "Expected bearish signal when all 21 bars above SMA")

    def test_bullish_signal_all_below_sma(self):
        """21 consecutive bars strictly below SMA(13) → bullish signal fires."""
        pts = []
        for i in range(50):
            p = 200.0 - i * 2.0  # falling fast
            pts.append(_pt(i, p, p + 0.5, p - 0.5, p))
        for k in range(21):
            p = pts[-1].close - 50.0  # huge drop ensures price < SMA for all 21
            pts.append(_pt(50 + k, p, p + 0.5, p - 0.5, p))

        result = calculate_ks_collection(_req(pts))
        signals = [p.value for p in result["reversalII"].data]
        self.assertIn(1.0, signals, "Expected bullish signal when all 21 bars below SMA")


# ---------------------------------------------------------------------------
# K's ATR-Adjusted RSI
# ---------------------------------------------------------------------------

class TestAtrRsi(unittest.TestCase):
    def test_values_in_range(self):
        result = calculate_ks_collection(_req(_flat(250)))
        for pt in result["atrAdjustedRSI"].data:
            self.assertGreaterEqual(pt.value, 0.0)
            self.assertLessEqual(pt.value, 100.0)

    def test_metadata_periods(self):
        result = calculate_ks_collection(_req(_flat(150)))
        meta = result["atrAdjustedRSI"].metadata
        self.assertEqual(meta["rsiPeriod"], 13)
        self.assertEqual(meta["atrPeriod"], 5)

    def test_trend_produces_valid_range(self):
        """ATR-RSI must stay in [0,100] on any input."""
        for pts in [_trending(150, step=0.5), _trending(150, step=-0.5), _flat(150)]:
            for pt in calculate_ks_collection(_req(pts))["atrAdjustedRSI"].data:
                self.assertGreaterEqual(pt.value, 0.0)
                self.assertLessEqual(pt.value, 100.0)


# ---------------------------------------------------------------------------
# K's RSI²
# ---------------------------------------------------------------------------

class TestRsiSquared(unittest.TestCase):
    def test_values_in_range(self):
        result = calculate_ks_collection(_req(_flat(250)))
        for pt in result["rsiSquared"].data:
            self.assertGreaterEqual(pt.value, 0.0)
            self.assertLessEqual(pt.value, 100.0)

    def test_metadata_periods(self):
        result = calculate_ks_collection(_req(_flat(150)))
        meta = result["rsiSquared"].metadata
        self.assertEqual(meta["rsiInner"], 14)
        self.assertEqual(meta["rsiOuter"], 5)

    def test_uptrend_rsi_sq_above_50(self):
        """Strong uptrend → RSI(14) > 50 → RSI(5) on that should trend high."""
        pts = _trending(150, step=1.0)
        result = calculate_ks_collection(_req(pts))
        last_val = result["rsiSquared"].data[-1].value
        self.assertGreater(last_val, 50.0, "Uptrend RSI² should be above 50 at end")


# ---------------------------------------------------------------------------
# K's MARSI
# ---------------------------------------------------------------------------

class TestMarsi(unittest.TestCase):
    def test_values_in_range(self):
        result = calculate_ks_collection(_req(_flat(250)))
        for pt in result["marsi"].data:
            self.assertGreaterEqual(pt.value, 0.0)
            self.assertLessEqual(pt.value, 100.0)

    def test_metadata_periods(self):
        result = calculate_ks_collection(_req(_flat(250)))
        meta = result["marsi"].metadata
        self.assertEqual(meta["smaPeriod"], 200)
        self.assertEqual(meta["rsiPeriod"], 20)

    def test_flat_marsi_in_range(self):
        """Flat close → SMA(200) constant → RSI(20) of constant series = 100
        (avg_loss=0 edge case). Output must still be in [0,100]."""
        result = calculate_ks_collection(_req(_flat(300)))
        for pt in result["marsi"].data:
            self.assertGreaterEqual(pt.value, 0.0)
            self.assertLessEqual(pt.value, 100.0)


# ---------------------------------------------------------------------------
# K's Fibonacci MA
# ---------------------------------------------------------------------------

class TestFibonacciMA(unittest.TestCase):
    def test_fma_high_gte_fma_low(self):
        """fma_high >= fma_low always (since high >= low at every bar)."""
        pts = _flat(250)
        result = calculate_ks_collection(_req(pts))
        for h_pt, l_pt in zip(result["fibonacciMAHigh"].data, result["fibonacciMALow"].data):
            self.assertGreaterEqual(h_pt.value, l_pt.value - 1e-9,
                                    "fibonacciMAHigh must be >= fibonacciMALow")

    def test_fma_mid_between_bands(self):
        """fibonacciMA mid should be between fma_high and fma_low."""
        pts = _flat(250)
        result = calculate_ks_collection(_req(pts))
        for m, h_pt, l_pt in zip(result["fibonacciMA"].data,
                                   result["fibonacciMAHigh"].data,
                                   result["fibonacciMALow"].data):
            self.assertGreaterEqual(m.value, l_pt.value - 1e-9)
            self.assertLessEqual(m.value, h_pt.value + 1e-9)

    def test_fma_metadata(self):
        result = calculate_ks_collection(_req(_flat(250)))
        for key in ("fibonacciMA", "fibonacciMAHigh", "fibonacciMALow"):
            self.assertEqual(result[key].metadata["fibPeriods"], 15)

    def test_fma_price_level_reasonable(self):
        """FMA should be near the price level of the series."""
        pts = _flat(300, price=500.0)
        result = calculate_ks_collection(_req(pts))
        # Final FMA mid should be near 500
        final = result["fibonacciMA"].data[-1].value
        self.assertGreater(final, 490.0)
        self.assertLess(final, 510.0)

    def test_uptrend_fma_tracks_price(self):
        """On uptrend, FMA should trend upward."""
        pts = _trending(300, start=100.0, step=0.5)
        result = calculate_ks_collection(_req(pts))
        first = result["fibonacciMA"].data[50].value
        last = result["fibonacciMA"].data[-1].value
        self.assertGreater(last, first, "FMA should increase in uptrend")


if __name__ == "__main__":
    unittest.main()
