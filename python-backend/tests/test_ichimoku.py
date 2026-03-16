"""Tests for Ichimoku Kinko Hyo implementation."""
import math
import pytest
from ml_ai.indicator_engine.pipeline import (
    IchimokuRequest,
    IchimokuResponse,
    OHLCVPoint,
    calculate_ichimoku,
)


def _ohlcv(n: int, start_close: float = 100.0, step: float = 1.0) -> list[OHLCVPoint]:
    """Generate synthetic OHLCV — trending up by `step` per bar."""
    pts = []
    for i in range(n):
        c = start_close + i * step
        pts.append(OHLCVPoint(
            time=1_700_000_000 + i * 60,
            open=c - 0.5,
            high=c + 1.0,
            low=c - 1.0,
            close=c,
            volume=1000.0,
        ))
    return pts


def _flat_ohlcv(n: int, price: float = 100.0) -> list[OHLCVPoint]:
    """Flat price series — all lines should converge."""
    pts = []
    for i in range(n):
        pts.append(OHLCVPoint(
            time=1_700_000_000 + i * 60,
            open=price, high=price, low=price, close=price, volume=1000.0,
        ))
    return pts


# ---------------------------------------------------------------------------
# Basic structure
# ---------------------------------------------------------------------------

def test_returns_ichimoku_response():
    req = IchimokuRequest(ohlcv=_ohlcv(100))
    result = calculate_ichimoku(req)
    assert isinstance(result, IchimokuResponse)


def test_output_lengths_match_input():
    n = 100
    req = IchimokuRequest(ohlcv=_ohlcv(n), include_future=False)
    r = calculate_ichimoku(req)
    assert len(r.tenkan) == n
    assert len(r.kijun) == n
    assert len(r.span_a) == n
    assert len(r.span_b) == n
    assert len(r.chikou) == n


def test_future_cloud_extends_by_displacement():
    n = 100
    d = 26
    req = IchimokuRequest(ohlcv=_ohlcv(n), displacement=d, include_future=True)
    r = calculate_ichimoku(req)
    # span_a and span_b get d extra future points
    assert len(r.span_a) == n + d
    assert len(r.span_b) == n + d
    # tenkan, kijun, chikou stay at n
    assert len(r.tenkan) == n
    assert len(r.chikou) == n


def test_empty_input_rejected_by_validation():
    """Base IndicatorServiceRequest requires at least 2 OHLCV points."""
    from pydantic import ValidationError
    with pytest.raises(ValidationError):
        IchimokuRequest(ohlcv=[])


def test_single_bar_rejected_by_validation():
    from pydantic import ValidationError
    with pytest.raises(ValidationError):
        IchimokuRequest(ohlcv=_ohlcv(1))


# ---------------------------------------------------------------------------
# Warm-up NaN period
# ---------------------------------------------------------------------------

def test_tenkan_nan_for_warmup_bars():
    req = IchimokuRequest(ohlcv=_ohlcv(50), tenkan_period=9, include_future=False)
    r = calculate_ichimoku(req)
    # First 8 bars (index 0..7) should be nan
    for i in range(8):
        assert math.isnan(r.tenkan[i].value), f"bar {i} should be nan"
    assert not math.isnan(r.tenkan[8].value), "bar 8 should be valid"


def test_span_a_nan_for_displacement_bars():
    req = IchimokuRequest(ohlcv=_ohlcv(100), displacement=26, include_future=False)
    r = calculate_ichimoku(req)
    # First 26 bars of span_a should be nan (forward-displacement shifts them out)
    for i in range(26):
        assert math.isnan(r.span_a[i].value), f"span_a[{i}] should be nan"


# ---------------------------------------------------------------------------
# Flat series: all lines must equal price
# ---------------------------------------------------------------------------

def test_flat_series_tenkan_equals_price():
    price = 100.0
    req = IchimokuRequest(ohlcv=_flat_ohlcv(100, price), tenkan_period=9, include_future=False)
    r = calculate_ichimoku(req)
    for pt in r.tenkan[8:]:   # skip warm-up
        assert abs(pt.value - price) < 1e-9


def test_flat_series_kijun_equals_price():
    price = 50.0
    req = IchimokuRequest(ohlcv=_flat_ohlcv(100, price), kijun_period=26, include_future=False)
    r = calculate_ichimoku(req)
    for pt in r.kijun[25:]:
        assert abs(pt.value - price) < 1e-9


def test_flat_series_span_a_equals_price():
    price = 75.0
    req = IchimokuRequest(ohlcv=_flat_ohlcv(100, price), include_future=False)
    r = calculate_ichimoku(req)
    # span_a warm-up = max(tenkan_warmup=8, kijun_warmup=25) + displacement=26 = 51
    for pt in r.span_a[51:]:
        assert abs(pt.value - price) < 1e-9


def test_flat_series_span_b_equals_price():
    price = 200.0
    req = IchimokuRequest(ohlcv=_flat_ohlcv(200, price), senkou_b_period=52, displacement=26, include_future=False)
    r = calculate_ichimoku(req)
    # span_b warm-up = 51 + 26 = 77
    for pt in r.span_b[77:]:
        assert abs(pt.value - price) < 1e-9


# ---------------------------------------------------------------------------
# Tenkan formula: (max_high + min_low) / 2 over period
# ---------------------------------------------------------------------------

def test_tenkan_formula_spot_check():
    """Verify Tenkan = (max_high_9 + min_low_9) / 2 at bar 8 (index 8)."""
    pts = _ohlcv(20)
    req = IchimokuRequest(ohlcv=pts, tenkan_period=9, include_future=False)
    r = calculate_ichimoku(req)
    window = pts[:9]
    expected = (max(p.high for p in window) + min(p.low for p in window)) / 2
    assert abs(r.tenkan[8].value - expected) < 1e-9


def test_kijun_formula_spot_check():
    pts = _ohlcv(50)
    req = IchimokuRequest(ohlcv=pts, kijun_period=26, include_future=False)
    r = calculate_ichimoku(req)
    window = pts[:26]
    expected = (max(p.high for p in window) + min(p.low for p in window)) / 2
    assert abs(r.kijun[25].value - expected) < 1e-9


# ---------------------------------------------------------------------------
# Crypto-adjusted periods (10/30/60)
# ---------------------------------------------------------------------------

def test_crypto_periods_accepted():
    req = IchimokuRequest(
        ohlcv=_ohlcv(200),
        tenkan_period=10, kijun_period=30, senkou_b_period=60, displacement=30,
    )
    r = calculate_ichimoku(req)
    assert len(r.tenkan) == 200
    # Tenkan warm-up = 9 bars (period-1)
    assert math.isnan(r.tenkan[0].value)
    assert not math.isnan(r.tenkan[9].value)


# ---------------------------------------------------------------------------
# Signals
# ---------------------------------------------------------------------------

def test_signals_length_matches_n():
    n = 100
    req = IchimokuRequest(ohlcv=_ohlcv(n), include_future=False)
    r = calculate_ichimoku(req)
    assert len(r.signals.strength) == n
    assert len(r.signals.above_cloud) == n
    assert len(r.signals.tk_bull) == n


def test_strong_uptrend_signal():
    """Strong uptrend: price well above cloud → expect strong_bull at tail."""
    # 200 bars trending strongly up — price far above cloud
    pts = _ohlcv(200, start_close=100.0, step=2.0)
    req = IchimokuRequest(ohlcv=pts)
    r = calculate_ichimoku(req)
    # Last few bars should be above cloud and show bullish strength
    tail = r.signals.strength[-10:]
    assert any(s in ("strong_bull", "weak_bull") for s in tail), f"Expected bullish tail, got: {tail}"


def test_above_cloud_consistent_with_span():
    """above_cloud[i] must be True iff close[i] > max(span_a[i], span_b[i])."""
    pts = _ohlcv(100, step=1.0)
    req = IchimokuRequest(ohlcv=pts, include_future=False)
    r = calculate_ichimoku(req)
    for i in range(len(pts)):
        sa = r.span_a[i].value
        sb = r.span_b[i].value
        c  = pts[i].close
        if math.isnan(sa) or math.isnan(sb):
            continue
        expected_above = c > max(sa, sb)
        assert r.signals.above_cloud[i] == expected_above, f"above_cloud mismatch at bar {i}"


def test_strength_values_are_valid():
    req = IchimokuRequest(ohlcv=_ohlcv(100))
    r = calculate_ichimoku(req)
    valid = {"strong_bull", "weak_bull", "neutral", "weak_bear", "strong_bear"}
    for s in r.signals.strength:
        assert s in valid, f"Invalid strength value: {s}"


def test_mutually_exclusive_above_below():
    """above_cloud and below_cloud cannot both be True at the same bar."""
    req = IchimokuRequest(ohlcv=_ohlcv(100), include_future=False)
    r = calculate_ichimoku(req)
    for i in range(len(r.signals.above_cloud)):
        assert not (r.signals.above_cloud[i] and r.signals.below_cloud[i]), \
            f"Bar {i}: both above_cloud and below_cloud are True"


# ---------------------------------------------------------------------------
# Metadata
# ---------------------------------------------------------------------------

def test_metadata_contains_periods():
    req = IchimokuRequest(ohlcv=_ohlcv(100), tenkan_period=9, kijun_period=26, senkou_b_period=52)
    r = calculate_ichimoku(req)
    assert r.metadata["tenkan_period"] == 9
    assert r.metadata["kijun_period"] == 26
    assert r.metadata["senkou_b_period"] == 52
    assert r.metadata["indicator"] == "Ichimoku"


# ---------------------------------------------------------------------------
# Time ordering
# ---------------------------------------------------------------------------

def test_output_times_match_input():
    pts = _ohlcv(50)
    req = IchimokuRequest(ohlcv=pts, include_future=False)
    r = calculate_ichimoku(req)
    for i, pt in enumerate(r.tenkan):
        assert pt.time == pts[i].time


def test_future_points_have_increasing_times():
    pts = _ohlcv(60)
    req = IchimokuRequest(ohlcv=pts, displacement=26, include_future=True)
    r = calculate_ichimoku(req)
    future = r.span_a[60:]
    for i in range(1, len(future)):
        assert future[i].time > future[i - 1].time, f"Future time not increasing at index {i}"
