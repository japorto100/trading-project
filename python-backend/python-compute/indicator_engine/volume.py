"""volume.py — Volume-based indicators.

Extracted from pipeline.py (Phase A, 20.03.2026).

Primitives: vwap, obv, cmf
Endpoints:  calculate_vwap
"""

from __future__ import annotations

from indicator_engine.helpers import closes, volumes
from indicator_engine.models import (
    IndicatorPoint,
    IndicatorResponse,
    OHLCVPoint,
    VWAPRequest,
)
from indicator_engine.trend import sma


# ---------------------------------------------------------------------------
# Volume primitives
# ---------------------------------------------------------------------------


def vwap(points: list[OHLCVPoint]) -> list[float]:
    """VWAP = cumulative(typical_price * volume) / cumulative(volume).

    Typical price = (high + low + close) / 3. No daily reset.
    """
    result: list[float] = []
    cum_tpv = 0.0
    cum_vol = 0.0
    for p in points:
        tp = (p.high + p.low + p.close) / 3.0
        cum_tpv += tp * p.volume
        cum_vol += p.volume
        result.append(cum_tpv / cum_vol if cum_vol > 0.0 else p.close)
    return result


def obv(points: list[OHLCVPoint]) -> list[float]:
    """On-Balance Volume — cumulative volume direction indicator."""
    if not points:
        return []
    values = [0.0]
    for i in range(1, len(points)):
        if points[i].close > points[i - 1].close:
            values.append(values[-1] + points[i].volume)
        elif points[i].close < points[i - 1].close:
            values.append(values[-1] - points[i].volume)
        else:
            values.append(values[-1])
    return values


def cmf(points: list[OHLCVPoint], period: int = 20) -> list[float]:
    """Chaikin Money Flow — measures buying/selling pressure over a rolling period."""
    mfv: list[float] = []
    vols = volumes(points)
    for point in points:
        hl_range = point.high - point.low
        multiplier = ((point.close - point.low) - (point.high - point.close)) / hl_range if hl_range > 0 else 0.0
        mfv.append(multiplier * point.volume)
    sum_mfv = sma(mfv, period)
    sum_vol = sma(vols, period)
    return [sum_mfv[i] / sum_vol[i] if sum_vol[i] else 0.0 for i in range(len(points))]


# ---------------------------------------------------------------------------
# Endpoint handlers
# ---------------------------------------------------------------------------


def calculate_vwap(payload: VWAPRequest) -> IndicatorResponse:
    """VWAP endpoint — cumulative, no daily reset."""
    vwap_vals = vwap(payload.ohlcv)
    return IndicatorResponse(
        data=[IndicatorPoint(time=payload.ohlcv[i].time, value=vwap_vals[i]) for i in range(len(payload.ohlcv))],
        metadata={"indicator": "VWAP"},
    )
