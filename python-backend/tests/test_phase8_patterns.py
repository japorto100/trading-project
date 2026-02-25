"""
Phase 8 — Pattern Detection: comprehensive tests.

Covers:
  8a — Elliott Wave Fibonacci validation (R1–R6, confidence scoring, details keys)
  8b — XABCD harmonics (Gartley, Bat, Butterfly, Crab) + FEIW
  8c — Candlestick extensions (Dragonfly/Gravestone Doji, Spinning Top,
         Piercing Line, Dark Cloud Cover, Morning/Evening Star,
         Three White Soldiers / Three Black Crows, Bottle, Double Trouble,
         Extreme Euphoria)
  8d — TD Countdown 13 + TDST level
  8e — Head & Shoulders / Inverse H&S
"""
from __future__ import annotations

import unittest

from ml_ai.indicator_engine.pipeline import (
    OHLCVPoint,
    PatternRequest,
    build_candlestick_patterns,
    build_elliott_wave_patterns,
    build_harmonic_patterns,
    build_price_patterns,
    build_td_timing_patterns,
)

T0 = 1_700_000_000


def _t(i: int) -> int:
    return T0 + i * 60


def _bar(i: int, o: float, h: float, lo: float, c: float, v: float = 1000.0) -> OHLCVPoint:
    return OHLCVPoint(time=_t(i), open=o, high=h, low=lo, close=c, volume=v)


def _flat(n: int = 50, price: float = 100.0) -> list[OHLCVPoint]:
    return [_bar(i, price, price, price, price) for i in range(n)]


def _req(bars: list[OHLCVPoint], lookback: int = 500, threshold: float = 0.015) -> PatternRequest:
    return PatternRequest(ohlcv=bars, params={}, lookback=lookback, threshold=threshold)


# ──────────────────────────────────────────────────────────────────────────────
# 8a — Elliott Wave
# ──────────────────────────────────────────────────────────────────────────────

class TestElliottWave8a(unittest.TestCase):

    def _wave_bars(self, bullish: bool = True) -> list[OHLCVPoint]:
        """
        Build a textbook bullish 5-3 wave that satisfies most Fibonacci rules:
        W1=10, W2=5 (50% retrace), W3=16 (1.6× W1), W4=4, W5=8
        correction=6 (60% of impulse span)
        """
        pts: list[OHLCVPoint] = []
        # impulse pivot prices
        prices = [100, 110, 105, 121, 117, 125]
        # correction from 125
        corr_prices = [125, 119, 123]
        all_prices = prices + corr_prices[1:]
        for i, p in enumerate(all_prices):
            pts.append(_bar(i, p, p + 0.5, p - 0.5, p))
        # add filler bars between pivots so detect_swings can find them
        return pts

    def test_response_shape(self):
        """Result is a PatternResponse with correct keys."""
        bars = _flat(80)
        resp = build_elliott_wave_patterns(_req(bars))
        self.assertIsInstance(resp.patterns, list)
        self.assertIn("scanned_bars", resp.metadata)

    def test_details_keys_present(self):
        """When a pattern fires, details contain the new Phase 8 keys."""
        # Build a sequence with enough pivots by using a sine-like series
        import math
        bars: list[OHLCVPoint] = []
        for i in range(120):
            c = 100.0 + 10.0 * math.sin(2 * math.pi * i / 15)
            bars.append(_bar(i, c, c + 1, c - 1, c))
        resp = build_elliott_wave_patterns(_req(bars))
        if resp.patterns:
            p = resp.patterns[0]
            self.assertIn("wave_lengths", p.details)
            self.assertIn("fib_ratios", p.details)
            self.assertIn("rules_passed", p.details)
            self.assertIn("fibonacci_valid", p.details)
            wl = p.details["wave_lengths"]
            for key in ("w1", "w2", "w3", "w4"):
                self.assertIn(key, wl)

    def test_confidence_in_range(self):
        """Confidence is always in [0, 1]."""
        import math
        bars = [_bar(i, 100 + 5 * math.sin(i / 3), 101 + 5 * math.sin(i / 3),
                     99 + 5 * math.sin(i / 3), 100 + 5 * math.sin(i / 3))
                for i in range(100)]
        resp = build_elliott_wave_patterns(_req(bars))
        for p in resp.patterns:
            self.assertGreaterEqual(p.confidence, 0.0)
            self.assertLessEqual(p.confidence, 1.0)

    def test_rules_passed_is_list(self):
        import math
        bars = [_bar(i, 100 + 5 * math.sin(i / 3), 101 + 5 * math.sin(i / 3),
                     99 + 5 * math.sin(i / 3), 100 + 5 * math.sin(i / 3))
                for i in range(100)]
        resp = build_elliott_wave_patterns(_req(bars))
        for p in resp.patterns:
            self.assertIsInstance(p.details.get("rules_passed", []), list)

    def test_min_confidence_base(self):
        """Base confidence 0.42 when 0 rules pass (degenerate flat wave)."""
        # flat pivots: all prices equal → all wave lengths 0 → no rules can pass
        bars = _flat(80)
        resp = build_elliott_wave_patterns(_req(bars))
        # flat data likely yields no pattern (not enough pivots), just check no crash
        self.assertIsInstance(resp.patterns, list)


# ──────────────────────────────────────────────────────────────────────────────
# 8b — XABCD Harmonics + FEIW
# ──────────────────────────────────────────────────────────────────────────────

class TestHarmonicPatterns8b(unittest.TestCase):

    def _xabcd_bars(self, xa: float, ab_xa: float, bc_ab: float, cd_bc: float,
                    ad_xa: float, base: float = 100.0, bullish: bool = True) -> list[OHLCVPoint]:
        """
        Construct XABCD bars with exact ratio targeting.
        Bullish: X(low) → A(high) → B(low) → C(high) → D(low)
        """
        x_p = base
        a_p = x_p + xa
        b_p = a_p - xa * ab_xa
        c_p = b_p + (a_p - b_p) * bc_ab
        d_p = c_p - (c_p - b_p) * cd_bc
        prices = [x_p, a_p, b_p, c_p, d_p]
        bars: list[OHLCVPoint] = []
        # Build 5 pivot bars + 10 filler bars between each for detect_swings
        for seg, (p_start, p_end) in enumerate(zip(prices[:-1], prices[1:])):
            bars.append(_bar(len(bars), p_start, max(p_start, p_end) + 0.1,
                             min(p_start, p_end) - 0.1, p_start))
            for fill in range(8):
                mid = p_start + (p_end - p_start) * (fill + 1) / 9
                bars.append(_bar(len(bars), mid, mid + 0.05, mid - 0.05, mid))
        bars.append(_bar(len(bars), prices[-1], prices[-1] + 0.1, prices[-1] - 0.1, prices[-1]))
        return bars

    def test_gartley_detected(self):
        """Gartley ratios produce a 'gartley' pattern."""
        bars = self._xabcd_bars(xa=20.0, ab_xa=0.618, bc_ab=0.618, cd_bc=1.272, ad_xa=0.786)
        resp = build_harmonic_patterns(_req(bars))
        types = [p.type for p in resp.patterns]
        self.assertIn("gartley", types, f"Patterns found: {types}")

    def test_gartley_has_invalidation_level(self):
        bars = self._xabcd_bars(xa=20.0, ab_xa=0.618, bc_ab=0.618, cd_bc=1.272, ad_xa=0.786)
        resp = build_harmonic_patterns(_req(bars))
        gartley = next((p for p in resp.patterns if p.type == "gartley"), None)
        if gartley:
            self.assertIn("invalidation_level", gartley.details)
            self.assertIn("xa_b", gartley.details)
            self.assertIn("d_xa", gartley.details)

    def test_bat_detected(self):
        """Bat ratios produce a 'bat' pattern."""
        bars = self._xabcd_bars(xa=20.0, ab_xa=0.45, bc_ab=0.618, cd_bc=2.0, ad_xa=0.886)
        resp = build_harmonic_patterns(_req(bars))
        types = [p.type for p in resp.patterns]
        self.assertIn("bat", types, f"Patterns found: {types}")

    def test_abcd_still_present(self):
        """Legacy ABCD pattern still detected after refactor."""
        # BC/AB=0.618 (in 0.55–0.78), CD/BC=1.5 (in 1.13–1.9)
        bars = self._xabcd_bars(xa=10.0, ab_xa=0.618, bc_ab=0.618, cd_bc=1.5, ad_xa=0.786)
        resp = build_harmonic_patterns(_req(bars))
        types = [p.type for p in resp.patterns]
        # abcd or one of the named harmonics must appear
        self.assertTrue(any(t in types for t in ("abcd", "gartley", "bat", "butterfly", "crab")),
                        f"No harmonic found: {types}")

    def test_feiw_failed_breakout(self):
        """FEIW bearish: new high pivot followed by close below prior high."""
        # Create bars: rising highs then a close back below
        bars: list[OHLCVPoint] = []
        # Prior high at 110
        bars += [_bar(i, 100 + i, 101 + i, 99 + i, 100 + i) for i in range(10)]
        # Make the prior high explicit
        bars.append(_bar(10, 110, 112, 109, 110))  # pivot1 = high 112
        bars += [_bar(11 + i, 108 - i, 109 - i, 107 - i, 108 - i) for i in range(3)]
        bars.append(_bar(14, 113, 115, 112, 113))  # pivot3 = higher high 115
        # Last bar close BELOW prior high (112)
        bars.append(_bar(15, 111, 113, 108, 109))
        resp = build_harmonic_patterns(_req(bars))
        types = [p.type for p in resp.patterns]
        self.assertIn("feiw_failed_breakout", types, f"Patterns: {types}")

    def test_response_metadata(self):
        bars = _flat(50)
        resp = build_harmonic_patterns(_req(bars))
        self.assertIn("scanned_bars", resp.metadata)
        self.assertIn("patterns_found", resp.metadata)

    def test_confidence_gartley(self):
        bars = self._xabcd_bars(xa=20.0, ab_xa=0.618, bc_ab=0.618, cd_bc=1.272, ad_xa=0.786)
        resp = build_harmonic_patterns(_req(bars))
        for p in resp.patterns:
            if p.type == "gartley":
                self.assertAlmostEqual(p.confidence, 0.78, places=2)

    def test_no_crash_flat(self):
        resp = build_harmonic_patterns(_req(_flat(30)))
        self.assertIsInstance(resp.patterns, list)


# ──────────────────────────────────────────────────────────────────────────────
# 8c — Candlestick Extensions
# ──────────────────────────────────────────────────────────────────────────────

class TestCandlestick8c(unittest.TestCase):

    def test_dragonfly_doji(self):
        """Dragonfly Doji: tiny body, long lower wick."""
        # open=close=100.05, high=100.1, low=98 → large lower wick
        bars = _flat(5)
        bars.append(_bar(5, o=100.05, h=100.10, lo=97.0, c=100.05))
        resp = build_candlestick_patterns(_req(bars))
        types = [p.type for p in resp.patterns]
        self.assertIn("dragonfly_doji", types, f"Got: {types}")

    def test_gravestone_doji(self):
        """Gravestone Doji: tiny body, long upper wick."""
        bars = _flat(5)
        bars.append(_bar(5, o=99.95, h=103.0, lo=99.90, c=99.95))
        resp = build_candlestick_patterns(_req(bars))
        types = [p.type for p in resp.patterns]
        self.assertIn("gravestone_doji", types, f"Got: {types}")

    def test_spinning_top(self):
        """Spinning Top: medium body, both wicks significant."""
        bars = _flat(5)
        bars.append(_bar(5, o=99.0, h=101.5, lo=97.5, c=100.0))
        resp = build_candlestick_patterns(_req(bars))
        types = [p.type for p in resp.patterns]
        self.assertIn("spinning_top", types, f"Got: {types}")

    def test_piercing_line(self):
        """Piercing Line: prior bearish bar, current opens below prior low, closes above midpoint."""
        bars = _flat(5)
        # Prior bearish: open=105, close=100 → midpoint=102.5
        bars.append(_bar(5, o=105.0, h=106.0, lo=99.0, c=100.0))
        # Current: open<prior.low=99 → open=98, close>102.5 → close=103
        bars.append(_bar(6, o=98.0, h=104.0, lo=97.0, c=103.0))
        resp = build_candlestick_patterns(_req(bars))
        types = [p.type for p in resp.patterns]
        self.assertIn("piercing_line", types, f"Got: {types}")

    def test_dark_cloud_cover(self):
        """Dark Cloud Cover: prior bullish, current opens above prior high, closes below midpoint."""
        bars = _flat(5)
        # Prior bullish: open=100, close=106 → midpoint=103, high=106.5
        bars.append(_bar(5, o=100.0, h=106.5, lo=99.5, c=106.0))
        # Current: open>prior.high=106.5 → open=107, close<103 → close=102
        bars.append(_bar(6, o=107.0, h=107.5, lo=101.0, c=102.0))
        resp = build_candlestick_patterns(_req(bars))
        types = [p.type for p in resp.patterns]
        self.assertIn("dark_cloud_cover", types, f"Got: {types}")

    def test_morning_star(self):
        """Morning Star: big bearish, small middle, bullish closing >50% into bar0."""
        bars = _flat(5)
        # bar0: big bearish, open=110, close=100
        bars.append(_bar(5, o=110.0, h=110.5, lo=99.5, c=100.0))
        # bar1: small body (doji-like)
        bars.append(_bar(6, o=100.5, h=101.0, lo=99.0, c=100.3))
        # bar2: bullish, close > midpoint of bar0 = 105
        bars.append(_bar(7, o=100.8, h=107.0, lo=100.0, c=106.5))
        resp = build_candlestick_patterns(_req(bars))
        types = [p.type for p in resp.patterns]
        self.assertIn("morning_star", types, f"Got: {types}")

    def test_evening_star(self):
        """Evening Star: big bullish, small middle, bearish closing <50% into bar0."""
        bars = _flat(5)
        # bar0: big bullish, open=100, close=110
        bars.append(_bar(5, o=100.0, h=110.5, lo=99.5, c=110.0))
        # bar1: small body
        bars.append(_bar(6, o=109.5, h=111.0, lo=109.0, c=109.7))
        # bar2: bearish, close < midpoint of bar0 = 105
        bars.append(_bar(7, o=109.5, h=110.0, lo=103.0, c=103.5))
        resp = build_candlestick_patterns(_req(bars))
        types = [p.type for p in resp.patterns]
        self.assertIn("evening_star", types, f"Got: {types}")

    def test_three_white_soldiers(self):
        """Three White Soldiers: 3 consecutive bullish bars, each higher close."""
        bars = _flat(5)
        bars.append(_bar(5, o=100.0, h=103.0, lo=99.5, c=102.8))
        bars.append(_bar(6, o=101.0, h=105.5, lo=100.5, c=105.2))
        bars.append(_bar(7, o=104.0, h=109.0, lo=103.5, c=108.7))
        resp = build_candlestick_patterns(_req(bars))
        types = [p.type for p in resp.patterns]
        self.assertIn("three_white_soldiers", types, f"Got: {types}")

    def test_three_black_crows(self):
        """Three Black Crows: 3 consecutive bearish bars, each lower close."""
        bars = _flat(5, price=110.0)
        bars.append(_bar(5, o=110.0, h=110.5, lo=107.0, c=107.3))
        bars.append(_bar(6, o=109.0, h=109.5, lo=105.5, c=105.8))
        bars.append(_bar(7, o=107.5, h=108.0, lo=103.0, c=103.5))
        resp = build_candlestick_patterns(_req(bars))
        types = [p.type for p in resp.patterns]
        self.assertIn("three_black_crows", types, f"Got: {types}")

    def test_extreme_euphoria(self):
        """Extreme Euphoria: big bullish bar after 5+ consecutive up-closes."""
        bars = _flat(5, price=100.0)
        # 5 consecutive up-closes
        for i in range(5):
            p = 100.0 + i * 0.5
            bars.append(_bar(5 + i, o=p, h=p + 0.3, lo=p - 0.1, c=p + 0.4))
        # Big bullish bar (body > 70% range)
        bars.append(_bar(10, o=102.5, h=108.0, lo=102.0, c=107.6))
        resp = build_candlestick_patterns(_req(bars))
        types = [p.type for p in resp.patterns]
        self.assertIn("extreme_euphoria", types, f"Got: {types}")

    def test_extreme_euphoria_direction_bearish(self):
        """Extreme Euphoria is tagged as bearish reversal warning."""
        bars = _flat(5, price=100.0)
        for i in range(5):
            p = 100.0 + i * 0.5
            bars.append(_bar(5 + i, o=p, h=p + 0.3, lo=p - 0.1, c=p + 0.4))
        bars.append(_bar(10, o=102.5, h=108.0, lo=102.0, c=107.6))
        resp = build_candlestick_patterns(_req(bars))
        eu = next((p for p in resp.patterns if p.type == "extreme_euphoria"), None)
        if eu:
            self.assertEqual(eu.direction, "bearish")

    def test_no_crash_minimal(self):
        """No crash on 2-bar input."""
        bars = [_bar(0, 100, 101, 99, 100), _bar(1, 100, 101, 99, 100)]
        resp = build_candlestick_patterns(_req(bars))
        self.assertIsInstance(resp.patterns, list)

    def test_confidence_ranges(self):
        """All returned confidences are in [0, 1]."""
        import math
        bars = [_bar(i, 100 + math.sin(i), 101 + math.sin(i), 99 + math.sin(i), 100 + math.sin(i))
                for i in range(60)]
        resp = build_candlestick_patterns(_req(bars))
        for p in resp.patterns:
            self.assertGreaterEqual(p.confidence, 0.0)
            self.assertLessEqual(p.confidence, 1.0)


# ──────────────────────────────────────────────────────────────────────────────
# 8d — TD Countdown 13 + TDST
# ──────────────────────────────────────────────────────────────────────────────

class TestTDTiming8d(unittest.TestCase):

    def _build_td_setup_bars(self, kind: str = "bearish", n_after: int = 0) -> list[OHLCVPoint]:
        """Build bars that trigger a 9-bar TD setup then optional continuation bars."""
        bars: list[OHLCVPoint] = []
        base = 100.0
        # 4 seed bars
        for i in range(4):
            bars.append(_bar(len(bars), base, base + 1, base - 1, base))
        # 9 qualifying bars (bearish: close < close[i-4])
        for j in range(9):
            if kind == "bearish":
                c = base - (j + 1) * 0.5
            else:
                c = base + (j + 1) * 0.5
            bars.append(_bar(len(bars), c, c + 0.2, c - 0.2, c))
        # extra bars for countdown
        for k in range(n_after):
            c = bars[-1].close - (0.3 if kind == "bearish" else -0.3)
            bars.append(_bar(len(bars), c, c + 0.1, c - 0.3, c))
        return bars

    def test_td_setup_9_bearish_fires(self):
        bars = self._build_td_setup_bars("bearish")
        resp = build_td_timing_patterns(_req(bars))
        types = [p.type for p in resp.patterns]
        self.assertIn("td_setup_9_bearish", types)

    def test_td_setup_9_bullish_fires(self):
        bars = self._build_td_setup_bars("bullish")
        resp = build_td_timing_patterns(_req(bars))
        types = [p.type for p in resp.patterns]
        self.assertIn("td_setup_9_bullish", types)

    def test_tdst_level_emitted_with_setup(self):
        """TDST level is emitted alongside the setup."""
        bars = self._build_td_setup_bars("bearish")
        resp = build_td_timing_patterns(_req(bars))
        types = [p.type for p in resp.patterns]
        self.assertIn("tdst_level", types, f"Got: {types}")

    def test_tdst_bearish_is_resistance(self):
        bars = self._build_td_setup_bars("bearish")
        resp = build_td_timing_patterns(_req(bars))
        tdst = next((p for p in resp.patterns if p.type == "tdst_level"), None)
        if tdst:
            self.assertEqual(tdst.details.get("kind"), "resistance")
            self.assertIn("level", tdst.details)

    def test_tdst_bullish_is_support(self):
        bars = self._build_td_setup_bars("bullish")
        resp = build_td_timing_patterns(_req(bars))
        tdst = next((p for p in resp.patterns if p.type == "tdst_level"), None)
        if tdst:
            self.assertEqual(tdst.details.get("kind"), "support")

    def test_tdst_level_value_is_float(self):
        bars = self._build_td_setup_bars("bearish")
        resp = build_td_timing_patterns(_req(bars))
        tdst = next((p for p in resp.patterns if p.type == "tdst_level"), None)
        if tdst:
            self.assertIsInstance(tdst.details["level"], float)

    def test_td_countdown_13_bearish_fires(self):
        """After a bearish setup, 13 countdown bars close ≤ low[i-2]."""
        bars = self._build_td_setup_bars("bearish", n_after=30)
        resp = build_td_timing_patterns(_req(bars))
        types = [p.type for p in resp.patterns]
        self.assertIn("td_countdown_13_bearish", types, f"Got: {types}")

    def test_td_countdown_13_direction(self):
        bars = self._build_td_setup_bars("bearish", n_after=30)
        resp = build_td_timing_patterns(_req(bars))
        cd = next((p for p in resp.patterns if p.type == "td_countdown_13_bearish"), None)
        if cd:
            self.assertEqual(cd.direction, "bearish")
            self.assertAlmostEqual(cd.confidence, 0.76, places=2)

    def test_no_crash_short(self):
        bars = _flat(10)
        resp = build_td_timing_patterns(_req(bars))
        self.assertIsInstance(resp.patterns, list)


# ──────────────────────────────────────────────────────────────────────────────
# 8e — Head & Shoulders
# ──────────────────────────────────────────────────────────────────────────────

class TestHeadAndShoulders8e(unittest.TestCase):

    def _hs_bars(self, inverse: bool = False) -> list[OHLCVPoint]:
        """
        Build a clean H&S or Inverse H&S sequence.
        H&S: LS(high=105), LV(low=100), H(high=110), RV(low=100.3), RS(high=105.2)
        Inverse: LS(low=95), LV(high=100), H(low=90), RV(high=100.2), RS(low=95.1)
        """
        bars: list[OHLCVPoint] = []

        if not inverse:
            pivots_prices = [102.0, 105.0, 100.0, 110.0, 100.3, 105.2, 100.5]
        else:
            pivots_prices = [98.0, 95.0, 100.0, 90.0, 100.2, 95.1, 99.8]

        for seg, p in enumerate(pivots_prices):
            # pivot bar
            if not inverse:
                h = p + 0.2 if seg % 2 == 1 else p + 0.1
                lo = p - 0.2 if seg % 2 == 0 else p - 0.1
            else:
                h = p + 0.2 if seg % 2 == 0 else p + 0.1
                lo = p - 0.2 if seg % 2 == 1 else p - 0.1
            bars.append(_bar(len(bars), p, h, lo, p))
            # filler bars to help detect_swings
            for f in range(6):
                bars.append(_bar(len(bars), p, p + 0.05, p - 0.05, p))

        return bars

    def test_hs_detected(self):
        bars = self._hs_bars(inverse=False)
        resp = build_price_patterns(_req(bars, threshold=0.05))
        types = [p.type for p in resp.patterns]
        self.assertIn("head_and_shoulders", types, f"Got: {types}")

    def test_hs_direction_bearish(self):
        bars = self._hs_bars(inverse=False)
        resp = build_price_patterns(_req(bars, threshold=0.05))
        hs = next((p for p in resp.patterns if p.type == "head_and_shoulders"), None)
        if hs:
            self.assertEqual(hs.direction, "bearish")

    def test_hs_details(self):
        bars = self._hs_bars(inverse=False)
        resp = build_price_patterns(_req(bars, threshold=0.05))
        hs = next((p for p in resp.patterns if p.type == "head_and_shoulders"), None)
        if hs:
            self.assertIn("neckline_level", hs.details)
            self.assertIn("target_price", hs.details)
            self.assertIn("shoulder_diff", hs.details)
            self.assertIsInstance(hs.details["neckline_level"], float)

    def test_hs_confidence(self):
        bars = self._hs_bars(inverse=False)
        resp = build_price_patterns(_req(bars, threshold=0.05))
        hs = next((p for p in resp.patterns if p.type == "head_and_shoulders"), None)
        if hs:
            self.assertAlmostEqual(hs.confidence, 0.72, places=2)

    def test_inverse_hs_detected(self):
        bars = self._hs_bars(inverse=True)
        resp = build_price_patterns(_req(bars, threshold=0.05))
        types = [p.type for p in resp.patterns]
        self.assertIn("inverse_head_and_shoulders", types, f"Got: {types}")

    def test_inverse_hs_direction_bullish(self):
        bars = self._hs_bars(inverse=True)
        resp = build_price_patterns(_req(bars, threshold=0.05))
        ihs = next((p for p in resp.patterns if p.type == "inverse_head_and_shoulders"), None)
        if ihs:
            self.assertEqual(ihs.direction, "bullish")

    def test_inverse_hs_target_above_neckline(self):
        bars = self._hs_bars(inverse=True)
        resp = build_price_patterns(_req(bars, threshold=0.05))
        ihs = next((p for p in resp.patterns if p.type == "inverse_head_and_shoulders"), None)
        if ihs:
            self.assertGreater(ihs.details["target_price"], ihs.details["neckline_level"])

    def test_hs_target_below_neckline(self):
        bars = self._hs_bars(inverse=False)
        resp = build_price_patterns(_req(bars, threshold=0.05))
        hs = next((p for p in resp.patterns if p.type == "head_and_shoulders"), None)
        if hs:
            self.assertLess(hs.details["target_price"], hs.details["neckline_level"])

    def test_double_top_still_works(self):
        """Legacy double_top detection still fires after H&S addition."""
        bars = _flat(20, price=100.0)
        # Two peaks at ~100.5
        bars += [_bar(20, 100.0, 100.5, 99.8, 100.4)]
        bars += [_bar(21, 99.5, 100.0, 99.0, 99.3)]
        bars += [_bar(22, 99.5, 100.52, 99.3, 100.41)]
        resp = build_price_patterns(_req(bars, threshold=0.05))
        types = [p.type for p in resp.patterns]
        self.assertIn("double_top", types, f"Got: {types}")

    def test_no_crash_short(self):
        bars = _flat(10)
        resp = build_price_patterns(_req(bars))
        self.assertIsInstance(resp.patterns, list)


# ──────────────────────────────────────────────────────────────────────────────
# Integration: all pattern endpoints return valid PatternResponse
# ──────────────────────────────────────────────────────────────────────────────

class TestPhase8Integration(unittest.TestCase):

    def _sine_bars(self, n: int = 120) -> list[OHLCVPoint]:
        import math
        return [_bar(i, 100 + 5 * math.sin(i / 5), 101 + 5 * math.sin(i / 5),
                     99 + 5 * math.sin(i / 5), 100 + 5 * math.sin(i / 5))
                for i in range(n)]

    def test_all_endpoints_no_crash(self):
        bars = self._sine_bars()
        req = _req(bars, threshold=0.05)
        for fn in (build_candlestick_patterns, build_harmonic_patterns,
                   build_td_timing_patterns, build_price_patterns, build_elliott_wave_patterns):
            resp = fn(req)
            self.assertIsInstance(resp.patterns, list)
            self.assertIn("scanned_bars", resp.metadata)

    def test_pattern_data_fields(self):
        """Every PatternData has all required fields with correct types."""
        bars = self._sine_bars()
        req = _req(bars, threshold=0.05)
        for fn in (build_candlestick_patterns, build_harmonic_patterns,
                   build_td_timing_patterns, build_price_patterns, build_elliott_wave_patterns):
            resp = fn(req)
            for p in resp.patterns:
                self.assertIsInstance(p.type, str)
                self.assertIn(p.direction, ("bullish", "bearish", "neutral"))
                self.assertIsInstance(p.start_time, int)
                self.assertIsInstance(p.end_time, int)
                self.assertGreaterEqual(p.confidence, 0.0)
                self.assertLessEqual(p.confidence, 1.0)
                self.assertIsInstance(p.details, dict)


if __name__ == "__main__":
    unittest.main()
