"""
New Indicators — MACD, Stochastic, ADX, HMA, WMA, VWAP, Keltner Channels.

Covers:
  - Primitive functions: wma, hma, macd, stochastic, adx_series, vwap, keltner_channels
  - Endpoint wrappers: calculate_macd, calculate_stochastic, calculate_adx,
    calculate_hma, calculate_vwap, calculate_keltner
  - Edge cases: empty input, flat price, short series
  - Directional sanity checks: uptrend / downtrend assertions
"""
from __future__ import annotations

import math
import unittest

from ml_ai.indicator_engine.pipeline import (
    ADXRequest,
    HMARequest,
    KeltnerRequest,
    MACDRequest,
    OHLCVPoint,
    StochasticRequest,
    VWAPRequest,
    adx_series,
    calculate_adx,
    calculate_hma,
    calculate_keltner,
    calculate_macd,
    calculate_stochastic,
    calculate_vwap,
    hma,
    keltner_channels,
    macd,
    stochastic,
    vwap,
    wma,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _flat(n: int = 50, price: float = 100.0, volume: float = 1000.0) -> list[OHLCVPoint]:
    return [
        OHLCVPoint(time=i * 60, open=price, high=price + 0.5, low=price - 0.5, close=price, volume=volume)
        for i in range(n)
    ]


def _rising(n: int = 60, start: float = 100.0, step: float = 0.5) -> list[OHLCVPoint]:
    pts = []
    for i in range(n):
        c = start + i * step
        pts.append(OHLCVPoint(time=i * 60, open=c - 0.1, high=c + 0.5, low=c - 0.5, close=c, volume=1000.0 + i * 10))
    return pts


def _falling(n: int = 60, start: float = 160.0, step: float = 0.5) -> list[OHLCVPoint]:
    pts = []
    for i in range(n):
        c = start - i * step
        pts.append(OHLCVPoint(time=i * 60, open=c + 0.1, high=c + 0.5, low=c - 0.5, close=c, volume=1000.0))
    return pts


def _closes(pts: list[OHLCVPoint]) -> list[float]:
    return [p.close for p in pts]


# ---------------------------------------------------------------------------
# WMA
# ---------------------------------------------------------------------------

class TestWMA(unittest.TestCase):
    def test_length_preserved(self):
        values = [float(i) for i in range(1, 21)]
        result = wma(values, 5)
        self.assertEqual(len(result), 20)

    def test_empty(self):
        self.assertEqual(wma([], 5), [])

    def test_single(self):
        self.assertEqual(wma([42.0], 5), [42.0])

    def test_period_1_identity(self):
        values = [1.0, 2.0, 3.0]
        self.assertEqual(wma(values, 1), values)

    def test_weights_give_higher_value_when_rising(self):
        # WMA of rising series should be above SMA (more weight on recent)
        values = [float(i) for i in range(1, 11)]
        result = wma(values, 10)
        sma_val = sum(values) / len(values)
        self.assertGreater(result[-1], sma_val)

    def test_manual_period2(self):
        # WMA(2) of [1,2,3]: weights [1,2], normalized by 3
        # index 1: (1*1 + 2*2)/3 = 5/3 ≈ 1.667
        # index 2: (1*2 + 2*3)/3 = 8/3 ≈ 2.667
        values = [1.0, 2.0, 3.0]
        result = wma(values, 2)
        self.assertAlmostEqual(result[1], 5.0 / 3.0, places=10)
        self.assertAlmostEqual(result[2], 8.0 / 3.0, places=10)


# ---------------------------------------------------------------------------
# HMA
# ---------------------------------------------------------------------------

class TestHMA(unittest.TestCase):
    def test_length_preserved(self):
        values = _closes(_rising())
        result = hma(values, 9)
        self.assertEqual(len(result), len(values))

    def test_short_series_returns_copy(self):
        values = [1.0, 2.0, 3.0]
        result = hma(values, 9)
        self.assertEqual(result, values)

    def test_hma_closer_to_price_than_sma(self):
        # HMA reduces lag — should track close more tightly than SMA of same period
        from ml_ai.indicator_engine.pipeline import sma
        values = _closes(_rising(n=80))
        period = 20
        hma_vals = hma(values, period)
        sma_vals = sma(values, period)
        last_close = values[-1]
        self.assertLess(abs(hma_vals[-1] - last_close), abs(sma_vals[-1] - last_close))

    def test_uptrend_hma_rising(self):
        values = _closes(_rising(n=80))
        result = hma(values, 9)
        # Last 10 values should be rising
        tail = result[-10:]
        self.assertTrue(all(tail[i] < tail[i + 1] for i in range(len(tail) - 1)))


# ---------------------------------------------------------------------------
# MACD
# ---------------------------------------------------------------------------

class TestMACD(unittest.TestCase):
    def test_lengths_equal(self):
        values = _closes(_rising())
        ml, sl, hist = macd(values)
        self.assertEqual(len(ml), len(values))
        self.assertEqual(len(sl), len(values))
        self.assertEqual(len(hist), len(values))

    def test_histogram_is_line_minus_signal(self):
        values = _closes(_rising())
        ml, sl, hist = macd(values)
        for i in range(len(values)):
            self.assertAlmostEqual(hist[i], ml[i] - sl[i], places=12)

    def test_uptrend_macd_line_positive(self):
        # In a strong uptrend EMA(12) > EMA(26) → MACD line positive
        values = _closes(_rising(n=60))
        ml, _, _ = macd(values)
        self.assertGreater(ml[-1], 0.0)

    def test_downtrend_macd_line_negative(self):
        values = _closes(_falling(n=60))
        ml, _, _ = macd(values)
        self.assertLess(ml[-1], 0.0)

    def test_custom_params(self):
        values = _closes(_rising(n=50))
        ml, sl, hist = macd(values, fast=5, slow=10, signal=3)
        self.assertEqual(len(ml), 50)
        self.assertAlmostEqual(hist[-1], ml[-1] - sl[-1], places=12)


class TestCalculateMACDEndpoint(unittest.TestCase):
    def test_response_structure(self):
        pts = _rising()
        req = MACDRequest(ohlcv=pts, fast=12, slow=26, signal=9)
        resp = calculate_macd(req)
        self.assertEqual(len(resp.macd_line), len(pts))
        self.assertEqual(len(resp.signal_line), len(pts))
        self.assertEqual(len(resp.histogram), len(pts))
        self.assertEqual(resp.metadata["fast"], 12)

    def test_timestamps_preserved(self):
        pts = _rising()
        resp = calculate_macd(MACDRequest(ohlcv=pts))
        for i, pt in enumerate(pts):
            self.assertEqual(resp.macd_line[i].time, pt.time)


# ---------------------------------------------------------------------------
# Stochastic
# ---------------------------------------------------------------------------

class TestStochastic(unittest.TestCase):
    def test_lengths_equal(self):
        pts = _rising()
        k, d = stochastic(pts)
        self.assertEqual(len(k), len(pts))
        self.assertEqual(len(d), len(pts))

    def test_values_bounded_0_100(self):
        pts = _rising()
        k, d = stochastic(pts)
        for v in k:
            self.assertGreaterEqual(v, 0.0)
            self.assertLessEqual(v, 100.0)

    def test_uptrend_k_near_100(self):
        # In a pure uptrend close is near the high → %K near 100
        pts = _rising(n=60)
        k, _ = stochastic(pts)
        self.assertGreater(k[-1], 80.0)

    def test_downtrend_k_near_0(self):
        pts = _falling(n=60)
        k, _ = stochastic(pts)
        self.assertLess(k[-1], 20.0)

    def test_flat_k_is_50(self):
        # Flat series: high == low → denom == 0 → fallback 50
        pts = [OHLCVPoint(time=i, open=100.0, high=100.0, low=100.0, close=100.0, volume=1000.0) for i in range(20)]
        k, _ = stochastic(pts)
        self.assertAlmostEqual(k[-1], 50.0)


class TestCalculateStochasticEndpoint(unittest.TestCase):
    def test_response_structure(self):
        pts = _rising()
        resp = calculate_stochastic(StochasticRequest(ohlcv=pts))
        self.assertEqual(len(resp.k), len(pts))
        self.assertEqual(len(resp.d), len(pts))
        self.assertEqual(resp.metadata["k_period"], 14)


# ---------------------------------------------------------------------------
# ADX
# ---------------------------------------------------------------------------

class TestADXSeries(unittest.TestCase):
    def test_lengths_equal(self):
        pts = _rising()
        adx_v, dip, dim = adx_series(pts)
        self.assertEqual(len(adx_v), len(pts))
        self.assertEqual(len(dip), len(pts))
        self.assertEqual(len(dim), len(pts))

    def test_adx_bounded_0_100(self):
        pts = _rising()
        adx_v, _, _ = adx_series(pts)
        for v in adx_v:
            self.assertGreaterEqual(v, 0.0)
            self.assertLessEqual(v, 100.0 + 1e-9)  # small float tolerance

    def test_uptrend_di_plus_dominates(self):
        pts = _rising(n=60)
        _, dip, dim = adx_series(pts)
        # In an uptrend DI+ should be greater than DI-
        self.assertGreater(dip[-1], dim[-1])

    def test_downtrend_di_minus_dominates(self):
        pts = _falling(n=60)
        _, dip, dim = adx_series(pts)
        self.assertGreater(dim[-1], dip[-1])

    def test_strong_trend_high_adx(self):
        # A long clean uptrend should produce ADX > 20
        pts = _rising(n=80)
        adx_v, _, _ = adx_series(pts)
        self.assertGreater(adx_v[-1], 20.0)

    def test_short_series_returns_zeros(self):
        pts = _flat(n=1)
        adx_v, dip, dim = adx_series(pts)
        self.assertEqual(adx_v, [0.0])
        self.assertEqual(dip, [0.0])
        self.assertEqual(dim, [0.0])


class TestCalculateADXEndpoint(unittest.TestCase):
    def test_response_structure(self):
        pts = _rising()
        resp = calculate_adx(ADXRequest(ohlcv=pts))
        self.assertEqual(len(resp.adx), len(pts))
        self.assertEqual(len(resp.di_plus), len(pts))
        self.assertEqual(len(resp.di_minus), len(pts))
        self.assertEqual(resp.metadata["period"], 14)


# ---------------------------------------------------------------------------
# VWAP
# ---------------------------------------------------------------------------

class TestVWAP(unittest.TestCase):
    def test_length_preserved(self):
        pts = _rising()
        result = vwap(pts)
        self.assertEqual(len(result), len(pts))

    def test_zero_volume_fallback_to_close(self):
        pts = [OHLCVPoint(time=i, open=100.0, high=100.0, low=100.0, close=100.0, volume=0.0) for i in range(5)]
        result = vwap(pts)
        for v in result:
            self.assertAlmostEqual(v, 100.0)

    def test_flat_price_vwap_equals_price(self):
        pts = _flat(price=150.0)
        result = vwap(pts)
        for v in result:
            self.assertAlmostEqual(v, 150.0, places=10)

    def test_vwap_within_cumulative_range(self):
        # Cumulative VWAP averages all bars 0..i — not bounded by bar i's local high/low.
        # It must stay within the cumulative [min_low, max_high] seen so far.
        pts = _rising()
        result = vwap(pts)
        cum_min_low = pts[0].low
        cum_max_high = pts[0].high
        for i, v in enumerate(result):
            cum_min_low = min(cum_min_low, pts[i].low)
            cum_max_high = max(cum_max_high, pts[i].high)
            self.assertGreaterEqual(v, cum_min_low - 1e-9)
            self.assertLessEqual(v, cum_max_high + 1e-9)

    def test_cumulative_nature(self):
        # VWAP at bar N considers all bars 0..N — not just a window
        pts = _rising(n=10)
        result = vwap(pts)
        # First bar VWAP = typical price of bar 0
        tp0 = (pts[0].high + pts[0].low + pts[0].close) / 3.0
        self.assertAlmostEqual(result[0], tp0, places=10)


class TestCalculateVWAPEndpoint(unittest.TestCase):
    def test_response_structure(self):
        pts = _rising()
        resp = calculate_vwap(VWAPRequest(ohlcv=pts))
        self.assertEqual(len(resp.data), len(pts))
        self.assertEqual(resp.metadata["indicator"], "VWAP")


# ---------------------------------------------------------------------------
# HMA endpoint
# ---------------------------------------------------------------------------

class TestCalculateHMAEndpoint(unittest.TestCase):
    def test_response_length(self):
        pts = _rising(n=40)
        resp = calculate_hma(HMARequest(ohlcv=pts, period=9))
        self.assertEqual(len(resp.data), len(pts))
        self.assertEqual(resp.metadata["period"], 9)

    def test_timestamps_preserved(self):
        pts = _rising(n=30)
        resp = calculate_hma(HMARequest(ohlcv=pts, period=5))
        for i, pt in enumerate(pts):
            self.assertEqual(resp.data[i].time, pt.time)


# ---------------------------------------------------------------------------
# Keltner Channels
# ---------------------------------------------------------------------------

class TestKeltnerChannels(unittest.TestCase):
    def test_lengths_equal(self):
        pts = _rising()
        upper, mid, lower = keltner_channels(pts)
        self.assertEqual(len(upper), len(pts))
        self.assertEqual(len(mid), len(pts))
        self.assertEqual(len(lower), len(pts))

    def test_upper_above_mid_above_lower(self):
        # Skip early bars where ATR=0 (first atr_period=10 bars have no separation)
        pts = _rising(n=40)
        upper, mid, lower = keltner_channels(pts)
        for i in range(10, len(pts)):
            self.assertGreater(upper[i], mid[i])
            self.assertGreater(mid[i], lower[i])

    def test_mid_is_ema(self):
        from ml_ai.indicator_engine.pipeline import ema, closes
        pts = _rising(n=40)
        _, mid, _ = keltner_channels(pts, ema_period=20)
        expected = ema(closes(pts), 20)
        for i in range(len(pts)):
            self.assertAlmostEqual(mid[i], expected[i], places=10)

    def test_larger_multiplier_wider_bands(self):
        pts = _rising(n=40)
        _, _, lower1 = keltner_channels(pts, multiplier=1.0)
        _, _, lower2 = keltner_channels(pts, multiplier=3.0)
        # Larger multiplier → lower band is further below mid
        self.assertLess(lower2[-1], lower1[-1])


class TestCalculateKeltnerEndpoint(unittest.TestCase):
    def test_response_structure(self):
        pts = _rising()
        resp = calculate_keltner(KeltnerRequest(ohlcv=pts, ema_period=20, atr_period=10, multiplier=2.0))
        self.assertEqual(len(resp.upper), len(pts))
        self.assertEqual(len(resp.middle), len(pts))
        self.assertEqual(len(resp.lower), len(pts))
        self.assertEqual(resp.metadata["multiplier"], 2.0)

    def test_upper_gt_middle_gt_lower(self):
        # Skip early bars where ATR=0 (default atr_period=10)
        pts = _rising(n=40)
        resp = calculate_keltner(KeltnerRequest(ohlcv=pts))
        for i in range(10, len(pts)):
            self.assertGreater(resp.upper[i].value, resp.middle[i].value)
            self.assertGreater(resp.middle[i].value, resp.lower[i].value)


if __name__ == "__main__":
    unittest.main()
