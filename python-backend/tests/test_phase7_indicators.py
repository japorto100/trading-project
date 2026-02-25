"""
Phase 7 — Indicator Catalog Core: comprehensive tests.

Covers:
  - Pure Python implementations (always run)
  - Rust batch implementations (skipped if extension not built)
  - Python vs Rust numerical agreement (parity tests)
  - All new public pipeline functions
"""
from __future__ import annotations

import math
import unittest

from ml_ai.indicator_engine.pipeline import (
    BollingerSqueezeRequest,
    BollingerVariantRequest,
    FibonacciConfluenceRequest,
    OHLCVPoint,
    PatternRequest,
    RSIVariantRequest,
    SwingDetectRequest,
    bollinger_bands_raw,
    bollinger_bandwidth,
    bollinger_percent_b,
    build_fibonacci_confluence,
    build_fibonacci_levels,
    calculate_atr,
    calculate_atr_rsi,
    calculate_bb_bandwidth,
    calculate_bb_percent_b,
    calculate_bollinger_keltner_squeeze,
    calculate_bollinger_on_rsi,
    calculate_swing_points,
    closes,
    ema,
    rsi,
    sma,
)
from ml_ai.indicator_engine.rust_bridge import (
    calculate_indicators_batch as rust_batch,
    rust_core_status,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _flat_ohlcv(n: int = 50, price: float = 100.0, volume: float = 1000.0) -> list[OHLCVPoint]:
    return [
        OHLCVPoint(time=1_700_000_000 + i * 60, open=price, high=price, low=price, close=price, volume=volume)
        for i in range(n)
    ]


def _rising_ohlcv(n: int = 60, start: float = 100.0, step: float = 0.5) -> list[OHLCVPoint]:
    pts = []
    for i in range(n):
        c = start + i * step
        pts.append(OHLCVPoint(time=1_700_000_000 + i * 60, open=c, high=c + 1.0, low=c - 1.0, close=c, volume=1000.0 + i * 5))
    return pts


def _sine_ohlcv(n: int = 120, amplitude: float = 5.0, base: float = 100.0) -> list[OHLCVPoint]:
    pts = []
    for i in range(n):
        c = base + amplitude * math.sin(2 * math.pi * i / 20)
        pts.append(OHLCVPoint(time=1_700_000_000 + i * 60, open=c, high=c + 0.5, low=c - 0.5, close=c, volume=1000.0))
    return pts


def _rust_available() -> bool:
    return rust_core_status().get("available", False)


# ---------------------------------------------------------------------------
# 7a — Swing Detect
# ---------------------------------------------------------------------------

class TestSwingDetect(unittest.TestCase):

    def test_returns_swing_detect_response(self) -> None:
        pts = _sine_ohlcv(80)
        resp = calculate_swing_points(SwingDetectRequest(ohlcv=pts, window=3))
        self.assertIsInstance(resp.swings, list)
        self.assertIn("count", resp.metadata)
        self.assertEqual(resp.metadata["count"], len(resp.swings))

    def test_flat_series_no_meaningful_swings(self) -> None:
        # Flat H=L=C: detect_swings may produce at most one degenerate edge pivot.
        pts = _flat_ohlcv(30)
        resp = calculate_swing_points(SwingDetectRequest(ohlcv=pts, window=3))
        self.assertLessEqual(len(resp.swings), 1)

    def test_sine_produces_alternating_highs_lows(self) -> None:
        pts = _sine_ohlcv(120)
        resp = calculate_swing_points(SwingDetectRequest(ohlcv=pts, window=3))
        self.assertGreater(len(resp.swings), 2)
        for swing in resp.swings:
            self.assertIn(swing.kind, {"high", "low"})
        # Alternating kinds
        kinds = [s.kind for s in resp.swings]
        for i in range(1, len(kinds)):
            self.assertNotEqual(kinds[i], kinds[i - 1], "consecutive swing kinds must alternate")

    def test_window_parameter_respected(self) -> None:
        pts = _sine_ohlcv(120)
        resp_narrow = calculate_swing_points(SwingDetectRequest(ohlcv=pts, window=1))
        resp_wide = calculate_swing_points(SwingDetectRequest(ohlcv=pts, window=10))
        # Wider window → fewer swings (more selective)
        self.assertGreaterEqual(len(resp_narrow.swings), len(resp_wide.swings))

    def test_swing_prices_are_actual_highs_or_lows(self) -> None:
        pts = _sine_ohlcv(80)
        resp = calculate_swing_points(SwingDetectRequest(ohlcv=pts, window=3))
        for swing in resp.swings:
            point = pts[swing.index]
            if swing.kind == "high":
                self.assertAlmostEqual(swing.price, point.high, places=9)
            else:
                self.assertAlmostEqual(swing.price, point.low, places=9)


# ---------------------------------------------------------------------------
# 7c — ATR (Python + Rust parity)
# ---------------------------------------------------------------------------

class TestATR(unittest.TestCase):

    def test_flat_series_atr_is_zero(self) -> None:
        pts = _flat_ohlcv(30)
        result = calculate_atr(pts, period=14)
        self.assertEqual(len(result), 30)
        for v in result:
            self.assertAlmostEqual(v, 0.0, places=9)

    def test_atr_known_three_bar_case(self) -> None:
        # Bar0: no prev → TR=0
        # Bar1: H=108 L=97 C=105, prevC=100 → TR=max(11,8,3)=11
        # Bar2: H=110 L=100 C=108, prevC=105 → TR=max(10,5,5)=10
        # sma([0,11,10], period=2): [0, 5.5, 10.5]
        pts = [
            OHLCVPoint(time=1, open=100, high=105, low=95, close=100, volume=1),
            OHLCVPoint(time=2, open=100, high=108, low=97, close=105, volume=1),
            OHLCVPoint(time=3, open=105, high=110, low=100, close=108, volume=1),
        ]
        result = calculate_atr(pts, period=2)
        self.assertEqual(len(result), 3)
        self.assertAlmostEqual(result[0], 0.0, places=9)
        self.assertAlmostEqual(result[1], 5.5, places=9)
        self.assertAlmostEqual(result[2], 10.5, places=9)

    def test_atr_positive_for_volatile_series(self) -> None:
        pts = _rising_ohlcv(50)  # spread H+1/L-1 always
        result = calculate_atr(pts, period=14)
        self.assertTrue(all(v >= 0.0 for v in result))
        # After warmup, ATR should be around 2.0 (H-L = 2)
        for v in result[14:]:
            self.assertAlmostEqual(v, 2.0, delta=0.5)

    @unittest.skipUnless(_rust_available(), "Rust core not built")
    def test_atr_rust_python_parity(self) -> None:
        pts = _rising_ohlcv(50)
        period = 14

        # Force Python path by bypassing Rust
        tr_values: list[float] = [0.0]
        for i in range(1, len(pts)):
            h, low_value, pc = pts[i].high, pts[i].low, pts[i - 1].close
            tr_values.append(max(h - low_value, abs(h - pc), abs(low_value - pc)))
        python_result = sma(tr_values, period)

        # Rust path via batch
        r = rust_batch(
            [p.time for p in pts], [p.open for p in pts],
            [p.high for p in pts], [p.low for p in pts],
            closes(pts), [p.volume for p in pts],
            [f"atr_{period}"],
        )
        self.assertIsNotNone(r)
        rust_result = r[f"atr_{period}"]
        self.assertEqual(len(python_result), len(rust_result))
        for i, (py, ru) in enumerate(zip(python_result, rust_result)):
            self.assertAlmostEqual(py, ru, places=9, msg=f"ATR mismatch at index {i}")


# ---------------------------------------------------------------------------
# 7c — Bollinger helpers (Python + Rust parity)
# ---------------------------------------------------------------------------

class TestBollingerBands(unittest.TestCase):

    def test_bollinger_bands_raw_constant_series(self) -> None:
        values = [50.0] * 30
        upper, middle, lower = bollinger_bands_raw(values, period=20, num_std=2.0)
        for u, m, lo in zip(upper, middle, lower):
            self.assertAlmostEqual(m, 50.0, places=9)
            self.assertAlmostEqual(u, 50.0, places=9)  # std=0
            self.assertAlmostEqual(lo, 50.0, places=9)

    def test_bollinger_bandwidth_constant_is_zero(self) -> None:
        values = [50.0] * 30
        bw = bollinger_bandwidth(values, period=20, num_std=2.0)
        self.assertEqual(len(bw), 30)
        for v in bw:
            self.assertAlmostEqual(v, 0.0, places=9)

    def test_bollinger_bandwidth_volatile_is_positive(self) -> None:
        values = [100.0 + (i % 5) * 2.0 for i in range(40)]
        bw = bollinger_bandwidth(values, period=10, num_std=2.0)
        # After initial warmup, bandwidth should be positive
        self.assertTrue(all(v >= 0.0 for v in bw))
        self.assertTrue(any(v > 0.0 for v in bw[10:]))

    def test_bollinger_percent_b_flat_returns_half(self) -> None:
        values = [100.0] * 30
        pct_b = bollinger_percent_b(values, period=20, num_std=2.0)
        for v in pct_b:
            self.assertAlmostEqual(v, 0.5, places=9)

    def test_bollinger_percent_b_bounds(self) -> None:
        # %B is not strictly bounded [0,1] but should be near 0 at lows and near 1 at highs
        # within a normal distribution. Just check it's finite.
        pts = _rising_ohlcv(50)
        values = closes(pts)
        pct_b = bollinger_percent_b(values, period=20, num_std=2.0)
        self.assertTrue(all(math.isfinite(v) for v in pct_b))

    @unittest.skipUnless(_rust_available(), "Rust core not built")
    def test_bb_bandwidth_rust_python_parity(self) -> None:
        pts = _rising_ohlcv(50)
        series = closes(pts)
        period = 20

        python_bw = bollinger_bandwidth(series, period=period, num_std=2.0)

        r = rust_batch(
            [p.time for p in pts], [p.open for p in pts],
            [p.high for p in pts], [p.low for p in pts],
            series, [p.volume for p in pts],
            [f"bb_bw_{period}"],
        )
        self.assertIsNotNone(r)
        rust_bw = r[f"bb_bw_{period}"]
        self.assertEqual(len(python_bw), len(rust_bw))
        for i, (py, ru) in enumerate(zip(python_bw, rust_bw)):
            self.assertAlmostEqual(py, ru, places=9, msg=f"BB bandwidth mismatch at index {i}")

    @unittest.skipUnless(_rust_available(), "Rust core not built")
    def test_bb_percent_b_rust_python_parity(self) -> None:
        pts = _rising_ohlcv(50)
        series = closes(pts)
        period = 20

        python_pctb = bollinger_percent_b(series, period=period, num_std=2.0)

        r = rust_batch(
            [p.time for p in pts], [p.open for p in pts],
            [p.high for p in pts], [p.low for p in pts],
            series, [p.volume for p in pts],
            [f"bb_pctb_{period}"],
        )
        self.assertIsNotNone(r)
        rust_pctb = r[f"bb_pctb_{period}"]
        self.assertEqual(len(python_pctb), len(rust_pctb))
        for i, (py, ru) in enumerate(zip(python_pctb, rust_pctb)):
            self.assertAlmostEqual(py, ru, places=9, msg=f"BB %B mismatch at index {i}")


# ---------------------------------------------------------------------------
# 7c — EMA Rust parity
# ---------------------------------------------------------------------------

class TestEMARustParity(unittest.TestCase):

    @unittest.skipUnless(_rust_available(), "Rust core not built")
    def test_ema_rust_python_parity(self) -> None:
        pts = _rising_ohlcv(60)
        series = closes(pts)
        period = 10

        python_ema = ema(series, period)

        r = rust_batch(
            [p.time for p in pts], [p.open for p in pts],
            [p.high for p in pts], [p.low for p in pts],
            series, [p.volume for p in pts],
            [f"ema_{period}"],
        )
        self.assertIsNotNone(r)
        rust_ema = r[f"ema_{period}"]
        self.assertEqual(len(python_ema), len(rust_ema))
        for i, (py, ru) in enumerate(zip(python_ema, rust_ema)):
            self.assertAlmostEqual(py, ru, places=9, msg=f"EMA mismatch at index {i}")

    @unittest.skipUnless(_rust_available(), "Rust core not built")
    def test_rsi_rust_python_parity(self) -> None:
        pts = _sine_ohlcv(80)
        series = closes(pts)
        period = 14

        python_rsi = rsi(series, period)

        r = rust_batch(
            [p.time for p in pts], [p.open for p in pts],
            [p.high for p in pts], [p.low for p in pts],
            series, [p.volume for p in pts],
            [f"rsi_{period}"],
        )
        self.assertIsNotNone(r)
        rust_rsi = r[f"rsi_{period}"]
        self.assertEqual(len(python_rsi), len(rust_rsi))
        for i, (py, ru) in enumerate(zip(python_rsi, rust_rsi)):
            self.assertAlmostEqual(py, ru, places=9, msg=f"RSI mismatch at index {i}")


# ---------------------------------------------------------------------------
# 7c — BB bandwidth / percent-B endpoint wrapper
# ---------------------------------------------------------------------------

class TestBollingerEndpoints(unittest.TestCase):

    def test_bb_bandwidth_response_shape(self) -> None:
        pts = _rising_ohlcv(50)
        resp = calculate_bb_bandwidth(BollingerVariantRequest(ohlcv=pts, period=20, numStd=2.0))
        self.assertEqual(len(resp.data), len(pts))
        self.assertEqual(resp.metadata["indicator"], "BB_BANDWIDTH")
        self.assertTrue(all(math.isfinite(p.value) for p in resp.data))

    def test_bb_percent_b_response_shape(self) -> None:
        pts = _rising_ohlcv(50)
        resp = calculate_bb_percent_b(BollingerVariantRequest(ohlcv=pts, period=20, numStd=2.0))
        self.assertEqual(len(resp.data), len(pts))
        self.assertEqual(resp.metadata["indicator"], "BB_PERCENT_B")
        self.assertTrue(all(math.isfinite(p.value) for p in resp.data))

    def test_bb_bandwidth_custom_num_std_still_works(self) -> None:
        # numStd != 2.0 forces Python fallback — should still produce correct shape
        pts = _rising_ohlcv(40)
        resp = calculate_bb_bandwidth(BollingerVariantRequest(ohlcv=pts, period=20, numStd=1.5))
        self.assertEqual(len(resp.data), len(pts))

    def test_bb_bandwidth_wider_std_means_larger_bandwidth(self) -> None:
        pts = _rising_ohlcv(50)
        resp2 = calculate_bb_bandwidth(BollingerVariantRequest(ohlcv=pts, period=20, numStd=2.0))
        resp3 = calculate_bb_bandwidth(BollingerVariantRequest(ohlcv=pts, period=20, numStd=3.0))
        for v2, v3 in zip(resp2.data[20:], resp3.data[20:]):
            self.assertLessEqual(v2.value, v3.value + 1e-9)


# ---------------------------------------------------------------------------
# 7c — Bollinger Keltner Squeeze
# ---------------------------------------------------------------------------

class TestBollingerKeltnerSqueeze(unittest.TestCase):

    def test_response_shape(self) -> None:
        pts = _rising_ohlcv(60)
        resp = calculate_bollinger_keltner_squeeze(BollingerSqueezeRequest(ohlcv=pts))
        self.assertEqual(len(resp.squeeze), len(pts))
        self.assertEqual(len(resp.histogram), len(pts))
        self.assertIn("bbPeriod", resp.metadata)

    def test_squeeze_values_are_bool(self) -> None:
        pts = _sine_ohlcv(60)
        resp = calculate_bollinger_keltner_squeeze(BollingerSqueezeRequest(ohlcv=pts))
        for v in resp.squeeze:
            self.assertIsInstance(v, bool)

    def test_flat_series_squeeze_is_on(self) -> None:
        # Flat price → BB width=0 → BB is inside any KC → squeeze=True
        pts = _flat_ohlcv(40)
        resp = calculate_bollinger_keltner_squeeze(BollingerSqueezeRequest(ohlcv=pts))
        # After warmup, all squeeze should be True (BB=0 < KC)
        self.assertTrue(all(resp.squeeze[20:]))

    def test_histogram_is_finite(self) -> None:
        pts = _rising_ohlcv(50)
        resp = calculate_bollinger_keltner_squeeze(BollingerSqueezeRequest(ohlcv=pts))
        for point in resp.histogram:
            self.assertTrue(math.isfinite(point.value))


# ---------------------------------------------------------------------------
# 7c — ATR-adjusted RSI
# ---------------------------------------------------------------------------

class TestATRRSI(unittest.TestCase):

    def test_response_shape_and_bounds(self) -> None:
        pts = _sine_ohlcv(80)
        resp = calculate_atr_rsi(RSIVariantRequest(ohlcv=pts, rsiPeriod=14, atrPeriod=14))
        self.assertEqual(len(resp.data), len(pts))
        for point in resp.data:
            self.assertGreaterEqual(point.value, 0.0)
            self.assertLessEqual(point.value, 100.0)

    def test_rising_market_rsi_above_50(self) -> None:
        pts = _rising_ohlcv(60)
        resp = calculate_atr_rsi(RSIVariantRequest(ohlcv=pts, rsiPeriod=14, atrPeriod=14))
        # After warmup, ATR-RSI should trend above 50
        late_values = [p.value for p in resp.data[30:]]
        self.assertGreater(sum(v > 50.0 for v in late_values), len(late_values) // 2)

    def test_metadata_contains_periods(self) -> None:
        pts = _rising_ohlcv(40)
        resp = calculate_atr_rsi(RSIVariantRequest(ohlcv=pts, rsiPeriod=7, atrPeriod=7))
        self.assertEqual(resp.metadata["rsiPeriod"], 7)
        self.assertEqual(resp.metadata["atrPeriod"], 7)


# ---------------------------------------------------------------------------
# 7c — Bollinger on RSI
# ---------------------------------------------------------------------------

class TestBollingerOnRSI(unittest.TestCase):

    def test_response_shape(self) -> None:
        pts = _sine_ohlcv(80)
        resp = calculate_bollinger_on_rsi(BollingerVariantRequest(ohlcv=pts, period=14, numStd=2.0))
        self.assertEqual(len(resp.upper), len(pts))
        self.assertEqual(len(resp.mid), len(pts))
        self.assertEqual(len(resp.lower), len(pts))

    def test_upper_above_mid_above_lower(self) -> None:
        pts = _sine_ohlcv(80)
        resp = calculate_bollinger_on_rsi(BollingerVariantRequest(ohlcv=pts, period=14, numStd=2.0))
        for u, m, lo in zip(resp.upper[14:], resp.mid[14:], resp.lower[14:]):
            self.assertGreaterEqual(u.value, m.value - 1e-9)
            self.assertGreaterEqual(m.value, lo.value - 1e-9)

    def test_rsi_values_within_0_100(self) -> None:
        pts = _sine_ohlcv(80)
        resp = calculate_bollinger_on_rsi(BollingerVariantRequest(ohlcv=pts, period=14, numStd=2.0))
        # Mid band is SMA of RSI — should stay within [0, 100]
        for point in resp.mid:
            self.assertGreaterEqual(point.value, 0.0 - 1e-9)
            self.assertLessEqual(point.value, 100.0 + 1e-9)


# ---------------------------------------------------------------------------
# 7d — Fibonacci levels (extended to 2.618)
# ---------------------------------------------------------------------------

class TestFibonacciLevels(unittest.TestCase):

    def test_now_has_nine_ratios_including_2618(self) -> None:
        pts = _rising_ohlcv(60)
        resp = build_fibonacci_levels(PatternRequest(ohlcv=pts))
        ratios = [level.ratio for level in resp.levels]
        self.assertIn(2.618, ratios)
        self.assertEqual(len(ratios), 9)

    def test_levels_are_finite(self) -> None:
        pts = _sine_ohlcv(80)
        resp = build_fibonacci_levels(PatternRequest(ohlcv=pts))
        for level in resp.levels:
            self.assertTrue(math.isfinite(level.price))
            self.assertTrue(math.isfinite(level.ratio))

    def test_swing_metadata_present(self) -> None:
        pts = _rising_ohlcv(60)
        resp = build_fibonacci_levels(PatternRequest(ohlcv=pts))
        self.assertIn("start_time", resp.swing)
        self.assertIn("end_time", resp.swing)


# ---------------------------------------------------------------------------
# 7d — Fibonacci Confluence
# ---------------------------------------------------------------------------

class TestFibonacciConfluence(unittest.TestCase):

    def test_response_shape(self) -> None:
        pts = _sine_ohlcv(120)
        resp = build_fibonacci_confluence(
            FibonacciConfluenceRequest(ohlcv=pts, thresholdPct=0.005, numSwings=3)
        )
        self.assertIsInstance(resp.zones, list)
        self.assertIn("totalLevels", resp.metadata)

    def test_insufficient_swings_returns_empty_zones(self) -> None:
        pts = _flat_ohlcv(30)  # no swings
        resp = build_fibonacci_confluence(
            FibonacciConfluenceRequest(ohlcv=pts, thresholdPct=0.005, numSwings=3)
        )
        self.assertEqual(len(resp.zones), 0)
        self.assertEqual(resp.metadata["totalLevels"], 0)

    def test_zones_sorted_by_strength_descending(self) -> None:
        pts = _sine_ohlcv(120)
        resp = build_fibonacci_confluence(
            FibonacciConfluenceRequest(ohlcv=pts, thresholdPct=0.01, numSwings=5)
        )
        if len(resp.zones) >= 2:
            for i in range(1, len(resp.zones)):
                self.assertGreaterEqual(
                    resp.zones[i - 1].strength, resp.zones[i].strength,
                    "zones should be sorted by strength descending"
                )

    def test_zone_strength_equals_level_count(self) -> None:
        pts = _sine_ohlcv(120)
        resp = build_fibonacci_confluence(
            FibonacciConfluenceRequest(ohlcv=pts, thresholdPct=0.01, numSwings=4)
        )
        for zone in resp.zones:
            self.assertEqual(zone.strength, len(zone.levels))
            self.assertGreaterEqual(zone.strength, 2)

    def test_price_range_contains_center(self) -> None:
        pts = _sine_ohlcv(120)
        resp = build_fibonacci_confluence(
            FibonacciConfluenceRequest(ohlcv=pts, thresholdPct=0.01, numSwings=3)
        )
        for zone in resp.zones:
            low, high = zone.priceRange
            self.assertLessEqual(low, zone.priceCenter + 1e-9)
            self.assertGreaterEqual(high, zone.priceCenter - 1e-9)

    def test_wider_threshold_produces_zones_with_higher_or_equal_max_strength(self) -> None:
        # A wider cluster window merges more Fibonacci levels per zone → higher strength,
        # but fewer total zones (small clusters merge into bigger ones).
        pts = _sine_ohlcv(120)
        resp_tight = build_fibonacci_confluence(
            FibonacciConfluenceRequest(ohlcv=pts, thresholdPct=0.002, numSwings=3)
        )
        resp_wide = build_fibonacci_confluence(
            FibonacciConfluenceRequest(ohlcv=pts, thresholdPct=0.02, numSwings=3)
        )
        # If either has no zones the property is vacuously satisfied.
        if resp_tight.zones and resp_wide.zones:
            max_strength_tight = max(z.strength for z in resp_tight.zones)
            max_strength_wide = max(z.strength for z in resp_wide.zones)
            self.assertGreaterEqual(max_strength_wide, max_strength_tight)


# ---------------------------------------------------------------------------
# Rust batch — full coverage of new keys
# ---------------------------------------------------------------------------

class TestRustBatchNewIndicators(unittest.TestCase):

    @unittest.skipUnless(_rust_available(), "Rust core not built")
    def test_all_new_indicators_in_single_batch_call(self) -> None:
        pts = _rising_ohlcv(60)
        r = rust_batch(
            [p.time for p in pts], [p.open for p in pts],
            [p.high for p in pts], [p.low for p in pts],
            closes(pts), [p.volume for p in pts],
            ["ema_10", "rsi_14", "atr_14", "bb_bw_20", "bb_pctb_20"],
        )
        self.assertIsNotNone(r)
        for key in ("ema_10", "rsi_14", "atr_14", "bb_bw_20", "bb_pctb_20"):
            self.assertIn(key, r, f"key {key!r} missing from batch result")
            self.assertEqual(len(r[key]), len(pts), f"length mismatch for {key!r}")

    @unittest.skipUnless(_rust_available(), "Rust core not built")
    def test_atr_rust_value_matches_known_calculation(self) -> None:
        # rising_ohlcv has H=c+1, L=c-1, so TR[i>0] = max(2, |H-prevC|, |L-prevC|)
        # With step=0.5: H=c+1, prevC=c-0.5, TR[i]=max(2, |c+1-(c-0.5)|, |c-1-(c-0.5)|)
        #                                              = max(2, 1.5, 0.5) = 2
        pts = _rising_ohlcv(50)
        r = rust_batch(
            [p.time for p in pts], [p.open for p in pts],
            [p.high for p in pts], [p.low for p in pts],
            closes(pts), [p.volume for p in pts],
            ["atr_14"],
        )
        self.assertIsNotNone(r)
        for v in r["atr_14"][14:]:
            self.assertAlmostEqual(v, 2.0, delta=0.01)

    @unittest.skipUnless(_rust_available(), "Rust core not built")
    def test_rsi_rust_bounded(self) -> None:
        pts = _sine_ohlcv(80)
        r = rust_batch(
            [p.time for p in pts], [p.open for p in pts],
            [p.high for p in pts], [p.low for p in pts],
            closes(pts), [p.volume for p in pts],
            ["rsi_14"],
        )
        self.assertIsNotNone(r)
        for v in r["rsi_14"]:
            self.assertGreaterEqual(v, 0.0)
            self.assertLessEqual(v, 100.0)

    @unittest.skipUnless(_rust_available(), "Rust core not built")
    def test_ema_rust_monotone_for_rising_input(self) -> None:
        pts = _rising_ohlcv(50)
        r = rust_batch(
            [p.time for p in pts], [p.open for p in pts],
            [p.high for p in pts], [p.low for p in pts],
            closes(pts), [p.volume for p in pts],
            ["ema_10"],
        )
        self.assertIsNotNone(r)
        values = r["ema_10"]
        for i in range(1, len(values)):
            self.assertGreaterEqual(values[i], values[i - 1] - 1e-9)

    @unittest.skipUnless(_rust_available(), "Rust core not built")
    def test_bb_bandwidth_rust_zero_for_flat(self) -> None:
        pts = _flat_ohlcv(40)
        r = rust_batch(
            [p.time for p in pts], [p.open for p in pts],
            [p.high for p in pts], [p.low for p in pts],
            closes(pts), [p.volume for p in pts],
            ["bb_bw_20"],
        )
        self.assertIsNotNone(r)
        for v in r["bb_bw_20"]:
            self.assertAlmostEqual(v, 0.0, places=9)

    @unittest.skipUnless(_rust_available(), "Rust core not built")
    def test_bb_pctb_rust_flat_is_half(self) -> None:
        pts = _flat_ohlcv(40)
        r = rust_batch(
            [p.time for p in pts], [p.open for p in pts],
            [p.high for p in pts], [p.low for p in pts],
            closes(pts), [p.volume for p in pts],
            ["bb_pctb_20"],
        )
        self.assertIsNotNone(r)
        for v in r["bb_pctb_20"]:
            self.assertAlmostEqual(v, 0.5, places=9)


if __name__ == "__main__":
    unittest.main(verbosity=2)
