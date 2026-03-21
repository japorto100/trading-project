"""Tests for indicator_engine.patterns — candlestick, harmonic, timing, price, elliott, transforms."""

from __future__ import annotations

from indicator_engine.models import OHLCVPoint
from indicator_engine.patterns import (
    apply_chart_transform,
    build_candlestick_patterns,
    build_elliott_wave_patterns,
    build_fibonacci_confluence,
    build_fibonacci_levels,
    build_harmonic_patterns,
    build_price_patterns,
    build_strategy_metrics,
    build_td_timing_patterns,
    calculate_swing_points,
    fibonacci_levels,
)


# ---------------------------------------------------------------------------
# Fibonacci
# ---------------------------------------------------------------------------


class TestFibonacci:
    def test_levels_count(self, ohlcv_points_1000: list[OHLCVPoint]) -> None:
        resp = fibonacci_levels(ohlcv_points_1000)
        assert len(resp.levels) == 13  # 13 standard ratios

    def test_swing_keys(self, ohlcv_points_1000: list[OHLCVPoint]) -> None:
        resp = fibonacci_levels(ohlcv_points_1000)
        assert "start_time" in resp.swing
        assert "end_time" in resp.swing

    def test_endpoint(self, ohlcv_points_1000: list[OHLCVPoint]) -> None:
        from indicator_engine.models import PatternRequest
        req = PatternRequest(ohlcv=ohlcv_points_1000, lookback=250)
        resp = build_fibonacci_levels(req)
        assert len(resp.levels) == 13


class TestFibConfluence:
    def test_response(self, ohlcv_points_1000: list[OHLCVPoint]) -> None:
        from indicator_engine.models import FibonacciConfluenceRequest
        req = FibonacciConfluenceRequest(ohlcv=ohlcv_points_1000)
        resp = build_fibonacci_confluence(req)
        # May have 0 zones if data doesn't cluster
        assert isinstance(resp.zones, list)
        assert "totalLevels" in resp.metadata


# ---------------------------------------------------------------------------
# Candlestick Patterns
# ---------------------------------------------------------------------------


class TestCandlestickPatterns:
    def test_returns_patterns(self, ohlcv_points_1000: list[OHLCVPoint]) -> None:
        from indicator_engine.models import PatternRequest
        req = PatternRequest(ohlcv=ohlcv_points_1000, lookback=250)
        resp = build_candlestick_patterns(req)
        assert isinstance(resp.patterns, list)
        assert resp.metadata["scanned_bars"] == 250

    def test_pattern_fields(self, ohlcv_points_1000: list[OHLCVPoint]) -> None:
        from indicator_engine.models import PatternRequest
        req = PatternRequest(ohlcv=ohlcv_points_1000, lookback=250)
        resp = build_candlestick_patterns(req)
        for p in resp.patterns:
            assert p.direction in ("bullish", "bearish", "neutral")
            assert 0.0 <= p.confidence <= 1.0
            assert p.start_time <= p.end_time

    def test_max_50_patterns(self, ohlcv_points_1000: list[OHLCVPoint]) -> None:
        from indicator_engine.models import PatternRequest
        req = PatternRequest(ohlcv=ohlcv_points_1000, lookback=1000)
        resp = build_candlestick_patterns(req)
        assert len(resp.patterns) <= 50


# ---------------------------------------------------------------------------
# Harmonic Patterns
# ---------------------------------------------------------------------------


class TestHarmonicPatterns:
    def test_returns_list(self, ohlcv_points_1000: list[OHLCVPoint]) -> None:
        from indicator_engine.models import PatternRequest
        req = PatternRequest(ohlcv=ohlcv_points_1000, lookback=250)
        resp = build_harmonic_patterns(req)
        assert isinstance(resp.patterns, list)

    def test_valid_types(self, ohlcv_points_1000: list[OHLCVPoint]) -> None:
        from indicator_engine.models import PatternRequest
        req = PatternRequest(ohlcv=ohlcv_points_1000, lookback=500)
        resp = build_harmonic_patterns(req)
        valid_types = {
            "gartley", "bat", "butterfly", "crab", "abcd",
            "feiw_failed_breakout", "feiw_failed_breakdown",
        }
        for p in resp.patterns:
            assert p.type in valid_types, f"Unknown type: {p.type}"


# ---------------------------------------------------------------------------
# TD Timing Patterns
# ---------------------------------------------------------------------------


class TestTDTiming:
    def test_returns_patterns(self, ohlcv_points_1000: list[OHLCVPoint]) -> None:
        from indicator_engine.models import PatternRequest
        req = PatternRequest(ohlcv=ohlcv_points_1000, lookback=500)
        resp = build_td_timing_patterns(req)
        assert isinstance(resp.patterns, list)

    def test_valid_types(self, ohlcv_points_1000: list[OHLCVPoint]) -> None:
        from indicator_engine.models import PatternRequest
        req = PatternRequest(ohlcv=ohlcv_points_1000, lookback=500)
        resp = build_td_timing_patterns(req)
        valid_prefixes = {"td_setup_9", "tdst_level", "td_countdown_13", "fibonacci_timing"}
        for p in resp.patterns:
            assert any(p.type.startswith(prefix) for prefix in valid_prefixes), f"Unknown: {p.type}"


# ---------------------------------------------------------------------------
# Price Patterns
# ---------------------------------------------------------------------------


class TestPricePatterns:
    def test_returns_list(self, ohlcv_points_1000: list[OHLCVPoint]) -> None:
        from indicator_engine.models import PatternRequest
        req = PatternRequest(ohlcv=ohlcv_points_1000, lookback=250)
        resp = build_price_patterns(req)
        assert isinstance(resp.patterns, list)

    def test_valid_types(self, ohlcv_points_1000: list[OHLCVPoint]) -> None:
        from indicator_engine.models import PatternRequest
        req = PatternRequest(ohlcv=ohlcv_points_1000, lookback=500)
        resp = build_price_patterns(req)
        valid_types = {
            "double_top", "double_bottom", "head_and_shoulders",
            "inverse_head_and_shoulders", "gap_up", "gap_down",
            "fib_reintegration_236", "fib_reactionary_618",
        }
        for p in resp.patterns:
            assert p.type in valid_types, f"Unknown: {p.type}"


# ---------------------------------------------------------------------------
# Elliott Wave
# ---------------------------------------------------------------------------


class TestElliottWave:
    def test_returns_list(self, ohlcv_points_1000: list[OHLCVPoint]) -> None:
        from indicator_engine.models import PatternRequest
        req = PatternRequest(ohlcv=ohlcv_points_1000, lookback=500)
        resp = build_elliott_wave_patterns(req)
        assert isinstance(resp.patterns, list)

    def test_confidence_weighted(self, ohlcv_points_1000: list[OHLCVPoint]) -> None:
        from indicator_engine.models import PatternRequest
        req = PatternRequest(ohlcv=ohlcv_points_1000, lookback=500)
        resp = build_elliott_wave_patterns(req)
        for p in resp.patterns:
            assert 0.0 <= p.confidence <= 1.0
            if p.details.get("rules_passed"):
                assert "R4_w4_no_overlap" in p.details["rules_passed"]


# ---------------------------------------------------------------------------
# Swing Points
# ---------------------------------------------------------------------------


class TestSwingPoints:
    def test_response(self, ohlcv_points_1000: list[OHLCVPoint]) -> None:
        from indicator_engine.models import SwingDetectRequest
        req = SwingDetectRequest(ohlcv=ohlcv_points_1000, window=3)
        resp = calculate_swing_points(req)
        assert len(resp.swings) > 0
        for s in resp.swings:
            assert s.kind in ("high", "low")


# ---------------------------------------------------------------------------
# Chart Transforms
# ---------------------------------------------------------------------------


class TestChartTransforms:
    def test_heikin_ashi(self, ohlcv_points_100: list[OHLCVPoint]) -> None:
        from indicator_engine.models import ChartTransformRequest
        req = ChartTransformRequest(ohlcv=ohlcv_points_100, transformType="heikin_ashi")
        resp = apply_chart_transform(req)
        assert len(resp.data) == 100
        # HA high >= HA low
        for pt in resp.data:
            assert pt.high >= pt.low

    def test_k_candles(self, ohlcv_points_100: list[OHLCVPoint]) -> None:
        from indicator_engine.models import ChartTransformRequest
        req = ChartTransformRequest(ohlcv=ohlcv_points_100, transformType="k_candles")
        resp = apply_chart_transform(req)
        assert len(resp.data) == 100

    def test_carsi(self, ohlcv_points_100: list[OHLCVPoint]) -> None:
        from indicator_engine.models import ChartTransformRequest
        req = ChartTransformRequest(ohlcv=ohlcv_points_100, transformType="carsi")
        resp = apply_chart_transform(req)
        assert len(resp.data) == 100
        # CARSI values are RSI-based (0-100 range)
        for pt in resp.data:
            assert 0.0 <= pt.close <= 100.0


# ---------------------------------------------------------------------------
# Strategy Metrics
# ---------------------------------------------------------------------------


class TestStrategyMetrics:
    def test_basic_trades(self) -> None:
        from indicator_engine.models import EvaluateStrategyRequest, TradeInput
        trades = [
            TradeInput(entry=100, exit=110, quantity=1, side="long"),
            TradeInput(entry=100, exit=95, quantity=1, side="long"),
            TradeInput(entry=100, exit=120, quantity=1, side="long"),
        ]
        req = EvaluateStrategyRequest(trades=trades)
        resp = build_strategy_metrics(req)
        assert resp.tradeCount == 3
        assert resp.metrics.hit_ratio == 2 / 3
        assert resp.metrics.net_return == 10 + (-5) + 20  # = 25
        assert resp.metrics.profit_factor > 0

    def test_empty_trades(self) -> None:
        from indicator_engine.models import EvaluateStrategyRequest
        req = EvaluateStrategyRequest(trades=[])
        resp = build_strategy_metrics(req)
        assert resp.tradeCount == 0
        assert resp.metrics.net_return == 0
