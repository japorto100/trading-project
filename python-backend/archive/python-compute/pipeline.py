from __future__ import annotations

import types
from dataclasses import dataclass
from math import exp
from statistics import mean, pstdev, stdev
from typing import Any, Literal, TypedDict

pl: types.ModuleType | None
try:
    import polars as pl
except Exception:  # noqa: BLE001
    pl = None

from pydantic import BaseModel, Field
from indicator_engine.rust_bridge import (
    calculate_heartbeat as rust_calculate_heartbeat,
    calculate_indicators_batch as rust_calculate_indicators_batch,
)
from indicator_engine.rust_bridge import composite_sma50_slope_norm as rust_composite_sma50_slope_norm


SignalDirection = Literal["buy", "sell", "neutral"]
PatternDirection = Literal["bullish", "bearish", "neutral"]
ExoticMAType = Literal["kama", "alma", "iwma", "ols", "sma", "ema", "smma"]
ChartTransformType = Literal["heikin_ashi", "k_candles", "volume_candles", "carsi"]


class OHLCVPoint(BaseModel):
    time: int
    open: float
    high: float
    low: float
    close: float
    volume: float = Field(default=0.0, ge=0.0)


class IndicatorServiceRequest(BaseModel):
    ohlcv: list[OHLCVPoint] = Field(default_factory=list, min_length=2)
    params: dict[str, Any] = Field(default_factory=dict)


class ExoticMARequest(IndicatorServiceRequest):
    maType: ExoticMAType = "kama"
    period: int = Field(default=20, ge=2, le=500)


class KsCollectionRequest(IndicatorServiceRequest):
    period: int = Field(default=14, ge=2, le=200)


class RainbowRequest(IndicatorServiceRequest):
    """Request for the full 7-indicator Rainbow Collection (Kaabar 2026)."""

    pass


class RainbowSignalSeries(BaseModel):
    data: list[IndicatorPoint]  # value: 1.0 bullish | -1.0 bearish | 0.0 neutral
    metadata: dict[str, Any]


class RainbowResponse(BaseModel):
    red: RainbowSignalSeries
    orange: RainbowSignalSeries
    yellow: RainbowSignalSeries
    green: RainbowSignalSeries
    blue: RainbowSignalSeries
    indigo: RainbowSignalSeries
    violet: RainbowSignalSeries


class RPatternRequest(IndicatorServiceRequest):
    """Request for the R-Pattern reversal detector (Kaabar 2026, Ch. 7)."""

    rsi_period: int = Field(default=14, ge=2, le=100)


class RPatternResponse(BaseModel):
    data: list[IndicatorPoint]  # 1.0 bullish | -1.0 bearish | 0.0 neutral
    metadata: dict[str, Any]


class GapPatternRequest(IndicatorServiceRequest):
    """Request for the Gap-Pattern detector (Kaabar 2026, Ch. 10).

    min_size: ATR multiplier — only gaps larger than ATR * min_size are tradeable.
    atr_period: lookback for ATR-based volatility filter.
    """

    atr_period: int = Field(default=14, ge=2, le=100)
    min_size: float = Field(default=1.0, ge=0.1, le=10.0)


class GapPatternResponse(BaseModel):
    data: list[IndicatorPoint]  # 1.0 bullish gap-fill | -1.0 bearish gap-fill | 0.0 none
    metadata: dict[str, Any]


class PatternRequest(IndicatorServiceRequest):
    lookback: int = Field(default=250, ge=20, le=5000)
    threshold: float = Field(default=0.015, ge=0.001, le=0.2)


class CompositeSignalRequest(IndicatorServiceRequest):
    heartbeatThreshold: float = Field(default=0.7, ge=0.0, le=1.0)
    volumeSpikeThreshold: float = Field(default=1.5, ge=0.5, le=10.0)


class TradeInput(BaseModel):
    entry: float = Field(gt=0)
    exit: float = Field(gt=0)
    quantity: float = Field(default=1.0, gt=0)
    side: Literal["long", "short"] = "long"
    fee: float = Field(default=0.0, ge=0.0)


class EvaluateStrategyRequest(BaseModel):
    trades: list[TradeInput] = Field(default_factory=list)
    riskFreeRate: float = 0.0


class IndicatorPoint(BaseModel):
    time: int
    value: float


class IndicatorResponse(BaseModel):
    data: list[IndicatorPoint]
    metadata: dict[str, Any]


class PatternData(BaseModel):
    type: str
    direction: PatternDirection
    start_time: int
    end_time: int
    confidence: float = Field(ge=0.0, le=1.0)
    details: dict[str, Any] = Field(default_factory=dict)


class PatternResponse(BaseModel):
    patterns: list[PatternData]
    metadata: dict[str, Any]


class FibonacciLevel(BaseModel):
    ratio: float
    price: float


class FibonacciResponse(BaseModel):
    swing: dict[str, Any]
    levels: list[FibonacciLevel]


class CompositeComponent(BaseModel):
    score: float = Field(ge=0.0, le=1.0)
    details: dict[str, Any] = Field(default_factory=dict)


class CompositeSignalResponse(BaseModel):
    signal: SignalDirection
    confidence: float = Field(ge=0.0, le=1.0)
    components: dict[str, CompositeComponent]
    timestamp: int


class ChartTransformRequest(IndicatorServiceRequest):
    transformType: ChartTransformType = "heikin_ashi"


class ChartTransformResponse(BaseModel):
    data: list[OHLCVPoint]
    metadata: dict[str, Any]


class StrategyMetrics(BaseModel):
    net_return: float
    hit_ratio: float
    risk_reward_ratio: float
    expectancy: float
    profit_factor: float
    sharpe: float
    sortino: float
    average_win: float
    average_loss: float


class StrategyEvaluationResponse(BaseModel):
    metrics: StrategyMetrics
    tradeCount: int


class SwingDetectRequest(IndicatorServiceRequest):
    window: int = Field(default=3, ge=1, le=20)


class SwingPoint(BaseModel):
    index: int
    time: int
    price: float
    kind: Literal["high", "low"]


class SwingDetectResponse(BaseModel):
    swings: list[SwingPoint]
    metadata: dict[str, Any]


class BollingerVariantRequest(IndicatorServiceRequest):
    period: int = Field(default=20, ge=2, le=500)
    numStd: float = Field(default=2.0, ge=0.5, le=5.0)


class BollingerSqueezeRequest(IndicatorServiceRequest):
    bbPeriod: int = Field(default=20, ge=2, le=200)
    kcPeriod: int = Field(default=20, ge=2, le=200)
    kcMult: float = Field(default=1.5, ge=0.5, le=4.0)
    numStd: float = Field(default=2.0, ge=0.5, le=5.0)


class BollingerSqueezeResponse(BaseModel):
    squeeze: list[bool]
    histogram: list[IndicatorPoint]
    metadata: dict[str, Any]


class RSIVariantRequest(IndicatorServiceRequest):
    rsiPeriod: int = Field(default=14, ge=2, le=200)
    atrPeriod: int = Field(default=14, ge=2, le=200)


class BollingerOnRSIResponse(BaseModel):
    upper: list[IndicatorPoint]
    mid: list[IndicatorPoint]
    lower: list[IndicatorPoint]
    metadata: dict[str, Any]


class FibonacciConfluenceRequest(IndicatorServiceRequest):
    thresholdPct: float = Field(default=0.005, ge=0.001, le=0.05)
    numSwings: int = Field(default=3, ge=2, le=10)


class ConfluenceZone(BaseModel):
    priceCenter: float
    priceRange: tuple[float, float]
    levels: list[FibonacciLevel]
    strength: int


class FibonacciConfluenceResponse(BaseModel):
    zones: list[ConfluenceZone]
    metadata: dict[str, Any]


class MACDRequest(IndicatorServiceRequest):
    fast: int = Field(default=12, ge=2, le=100)
    slow: int = Field(default=26, ge=2, le=200)
    signal: int = Field(default=9, ge=2, le=50)


class MACDResponse(BaseModel):
    macd_line: list[IndicatorPoint]
    signal_line: list[IndicatorPoint]
    histogram: list[IndicatorPoint]
    metadata: dict[str, Any]


class StochasticRequest(IndicatorServiceRequest):
    k_period: int = Field(default=14, ge=2, le=200)
    d_period: int = Field(default=3, ge=2, le=50)


class StochasticResponse(BaseModel):
    k: list[IndicatorPoint]
    d: list[IndicatorPoint]
    metadata: dict[str, Any]


class ADXRequest(IndicatorServiceRequest):
    period: int = Field(default=14, ge=2, le=200)


class ADXResponse(BaseModel):
    adx: list[IndicatorPoint]
    di_plus: list[IndicatorPoint]
    di_minus: list[IndicatorPoint]
    metadata: dict[str, Any]


class HMARequest(IndicatorServiceRequest):
    period: int = Field(default=9, ge=2, le=500)


class VWAPRequest(IndicatorServiceRequest):
    pass


class KeltnerRequest(IndicatorServiceRequest):
    ema_period: int = Field(default=20, ge=2, le=200)
    atr_period: int = Field(default=10, ge=2, le=200)
    multiplier: float = Field(default=2.0, ge=0.5, le=5.0)


class KeltnerResponse(BaseModel):
    upper: list[IndicatorPoint]
    middle: list[IndicatorPoint]
    lower: list[IndicatorPoint]
    metadata: dict[str, Any]


class IchimokuRequest(IndicatorServiceRequest):
    tenkan_period: int = Field(default=9, ge=2, le=100)
    kijun_period: int = Field(default=26, ge=2, le=200)
    senkou_b_period: int = Field(default=52, ge=2, le=500)
    displacement: int = Field(default=26, ge=1, le=200)
    include_future: bool = Field(default=True)


class IchimokuSignals(BaseModel):
    above_cloud: list[bool]
    below_cloud: list[bool]
    in_cloud: list[bool]
    bullish_cloud: list[bool]
    tk_bull: list[bool]
    tk_bear: list[bool]
    chikou_bull: list[bool]
    chikou_bear: list[bool]
    chikou_above_cloud: list[bool]   # chikou (closes[i]) > cloud from 26 bars ago
    chikou_below_cloud: list[bool]   # chikou (closes[i]) < cloud from 26 bars ago
    kijun_cross_bull: list[bool]
    kijun_cross_bear: list[bool]
    strength: list[str]   # strong_bull / weak_bull / neutral / weak_bear / strong_bear


class IchimokuResponse(BaseModel):
    tenkan: list[IndicatorPoint]
    kijun: list[IndicatorPoint]
    span_a: list[IndicatorPoint]
    span_b: list[IndicatorPoint]
    chikou: list[IndicatorPoint]
    signals: IchimokuSignals
    metadata: dict[str, Any]


@dataclass(frozen=True)
class Pivot:
    index: int
    time: int
    price: float
    kind: Literal["high", "low"]


class TDCountdownState(TypedDict):
    kind: Literal["bullish", "bearish"]
    start_idx: int
    tdst: float
    count: int


def clamp(value: float, lower: float, upper: float) -> float:
    return max(lower, min(upper, value))


def indicator_dataframe_status() -> dict[str, Any]:
    if pl is None:
        return {"available": False, "engine": None, "version": None, "error": "polars import failed"}
    return {
        "available": True,
        "engine": "polars",
        "version": getattr(pl, "__version__", None),
        "error": None,
    }


def ohlcv_polars_frame(points: list[OHLCVPoint]):
    if pl is None:
        return None
    return pl.DataFrame(
        {
            "time": [point.time for point in points],
            "open": [point.open for point in points],
            "high": [point.high for point in points],
            "low": [point.low for point in points],
            "close": [point.close for point in points],
            "volume": [point.volume for point in points],
        }
    )


def closes(points: list[OHLCVPoint]) -> list[float]:
    return [point.close for point in points]


def highs(points: list[OHLCVPoint]) -> list[float]:
    return [point.high for point in points]


def lows(points: list[OHLCVPoint]) -> list[float]:
    return [point.low for point in points]


def volumes(points: list[OHLCVPoint]) -> list[float]:
    return [point.volume for point in points]


def slope(values: list[float], period: int) -> list[float]:
    """Linear slope over `period` bars: (values[i] - values[i-period]) / period.

    Warm-up indices (i < period) emit 0.0.
    Used by Yellow, Green, and Blue Rainbow indicators (Kaabar 2026).
    """
    out: list[float] = []
    for i in range(len(values)):
        if i < period:
            out.append(0.0)
        else:
            out.append((values[i] - values[i - period]) / period)
    return out


def sma(values: list[float], period: int) -> list[float]:
    if period <= 1:
        return values[:]
    output: list[float] = []
    running = 0.0
    for i, value in enumerate(values):
        running += value
        if i >= period:
            running -= values[i - period]
        window_size = min(period, i + 1)
        output.append(running / window_size)
    return output


def ema(values: list[float], period: int) -> list[float]:
    if not values:
        return []
    alpha = 2.0 / (period + 1.0)
    output = [values[0]]
    for value in values[1:]:
        output.append(alpha * value + (1.0 - alpha) * output[-1])
    return output


def smma(values: list[float], period: int) -> list[float]:
    if not values:
        return []
    output = [values[0]]
    for value in values[1:]:
        output.append((output[-1] * (period - 1) + value) / period)
    return output


def ols_ma(values: list[float], period: int) -> list[float]:
    if period <= 1:
        return values[:]
    result: list[float] = []
    x_vals = list(range(period))
    x_mean = mean(x_vals)
    denominator = sum((x - x_mean) ** 2 for x in x_vals) or 1.0
    for i in range(len(values)):
        start = max(0, i - period + 1)
        window = values[start : i + 1]
        if len(window) < period:
            result.append(mean(window))
            continue
        y_mean = mean(window)
        numerator = sum((x_vals[j] - x_mean) * (window[j] - y_mean) for j in range(period))
        slope = numerator / denominator
        intercept = y_mean - slope * x_mean
        result.append(intercept + slope * (period - 1))
    return result


def iwma(values: list[float], period: int) -> list[float]:
    if period <= 1:
        return values[:]
    result: list[float] = []
    weights = [1.0 / (i + 1) for i in range(period)]
    denominator = sum(weights)
    for i in range(len(values)):
        start = max(0, i - period + 1)
        window = values[start : i + 1]
        if len(window) < period:
            result.append(mean(window))
            continue
        weighted = 0.0
        for j, value in enumerate(window):
            weighted += value * weights[period - 1 - j]
        result.append(weighted / denominator)
    return result


def alma(values: list[float], period: int, offset: float = 0.85, sigma: float = 6.0) -> list[float]:
    if period <= 1:
        return values[:]
    result: list[float] = []
    m = offset * (period - 1)
    s = period / sigma
    raw_weights = [exp(-((i - m) ** 2) / (2 * s * s)) for i in range(period)]
    norm = sum(raw_weights) or 1.0
    weights = [weight / norm for weight in raw_weights]
    for i in range(len(values)):
        start = max(0, i - period + 1)
        window = values[start : i + 1]
        if len(window) < period:
            result.append(mean(window))
            continue
        value = 0.0
        for j, close in enumerate(window):
            value += close * weights[j]
        result.append(value)
    return result


def kama(values: list[float], period: int, fast: int = 2, slow: int = 30) -> list[float]:
    if not values:
        return []
    result = [values[0]]
    fast_sc = 2.0 / (fast + 1.0)
    slow_sc = 2.0 / (slow + 1.0)
    for i in range(1, len(values)):
        if i < period:
            result.append(values[i])
            continue
        change = abs(values[i] - values[i - period])
        volatility = sum(abs(values[j] - values[j - 1]) for j in range(i - period + 1, i + 1)) or 1e-9
        er = change / volatility
        sc = (er * (fast_sc - slow_sc) + slow_sc) ** 2
        result.append(result[-1] + sc * (values[i] - result[-1]))
    return result


def wma(values: list[float], period: int) -> list[float]:
    """Weighted Moving Average — linearly weighted, most recent bar has highest weight."""
    if not values:
        return []
    out: list[float] = []
    for i in range(len(values)):
        start = max(0, i + 1 - period)
        window = values[start : i + 1]
        w = list(range(1, len(window) + 1))
        w_sum = sum(w)
        out.append(sum(v * wt for v, wt in zip(window, w)) / w_sum)
    return out


def hma(values: list[float], period: int) -> list[float]:
    """Hull Moving Average = WMA(2*WMA(n/2) - WMA(n), sqrt(n)).
    Reduces lag vs SMA/EMA while staying smooth."""
    if len(values) < period:
        return values[:]
    half = max(1, period // 2)
    sqrt_p = max(1, int(period**0.5))
    wma_half = wma(values, half)
    wma_full = wma(values, period)
    diff = [2.0 * h - f for h, f in zip(wma_half, wma_full)]
    return wma(diff, sqrt_p)


def rsi(values: list[float], period: int = 14) -> list[float]:
    # F2: Wilder RSI warmup — SMA for first `period` changes, then Wilder smoothing
    if len(values) < 2:
        return [50.0 for _ in values]
    gains: list[float] = [0.0]
    losses: list[float] = [0.0]
    for i in range(1, len(values)):
        delta = values[i] - values[i - 1]
        gains.append(max(0.0, delta))
        losses.append(abs(min(0.0, delta)))

    n = len(gains)
    output = [50.0] * n
    if n <= period:
        return output

    # SMA warmup for first `period` changes
    avg_gain = sum(gains[1 : period + 1]) / period
    avg_loss = sum(losses[1 : period + 1]) / period
    output[period] = 100.0 if avg_loss == 0.0 else 100.0 - 100.0 / (1.0 + avg_gain / avg_loss)

    # Wilder smoothing for the rest
    for i in range(period + 1, n):
        avg_gain = (avg_gain * (period - 1) + gains[i]) / period
        avg_loss = (avg_loss * (period - 1) + losses[i]) / period
        output[i] = 100.0 if avg_loss == 0.0 else 100.0 - 100.0 / (1.0 + avg_gain / avg_loss)

    return output


def macd(
    values: list[float],
    fast: int = 12,
    slow: int = 26,
    signal: int = 9,
) -> tuple[list[float], list[float], list[float]]:
    """MACD = EMA(fast) - EMA(slow); signal = EMA(macd, signal); histogram = macd - signal.
    Book ref: mastering-finance-python.md L5264-5298."""
    ema_fast = ema(values, fast)
    ema_slow = ema(values, slow)
    macd_line = [f - s for f, s in zip(ema_fast, ema_slow)]
    signal_line = ema(macd_line, signal)
    histogram = [m - s for m, s in zip(macd_line, signal_line)]
    return macd_line, signal_line, histogram


def stochastic(
    points: list[OHLCVPoint],
    k_period: int = 14,
    d_period: int = 3,
) -> tuple[list[float], list[float]]:
    """Stochastic Oscillator: %K = (C - LowestLow) / (HighestHigh - LowestLow) * 100.
    %D = SMA(%K, d_period)."""
    h = highs(points)
    lo = lows(points)
    c = closes(points)
    k_values: list[float] = []
    for i in range(len(c)):
        start = max(0, i + 1 - k_period)
        period_h = max(h[start : i + 1])
        period_l = min(lo[start : i + 1])
        denom = period_h - period_l
        k_values.append(100.0 * (c[i] - period_l) / denom if denom != 0.0 else 50.0)
    d_values = sma(k_values, d_period)
    return k_values, d_values


def adx_series(
    points: list[OHLCVPoint],
    period: int = 14,
) -> tuple[list[float], list[float], list[float]]:
    """Full ADX + DI+ + DI- series using true OHLCV.
    Uses Wilder smoothing (alpha = 1/period).
    Returns (adx, di_plus, di_minus) — all same length as input."""
    h = highs(points)
    lo = lows(points)
    c = closes(points)
    n = len(c)
    if n < 2:
        return [0.0] * n, [0.0] * n, [0.0] * n

    tr_list: list[float] = [0.0]
    pdm_list: list[float] = [0.0]
    mdm_list: list[float] = [0.0]
    for i in range(1, n):
        tr = max(h[i] - lo[i], abs(h[i] - c[i - 1]), abs(lo[i] - c[i - 1]))
        up = h[i] - h[i - 1]
        down = lo[i - 1] - lo[i]
        pdm = up if (up > down and up > 0.0) else 0.0
        mdm = down if (down > up and down > 0.0) else 0.0
        tr_list.append(tr)
        pdm_list.append(pdm)
        mdm_list.append(mdm)

    def _wilder_sum(vals: list[float], p: int) -> list[float]:
        """Wilder smoothing with sum-based init (for ATR and DM)."""
        if len(vals) < p:
            return [0.0] * len(vals)
        first = sum(vals[:p])
        result = [0.0] * (p - 1) + [first]
        for v in vals[p:]:
            result.append(result[-1] - result[-1] / p + v)
        return result

    def _wilder_avg(vals: list[float], p: int) -> list[float]:
        """Wilder smoothing with average-based init (for ADX)."""
        if len(vals) < p:
            return [0.0] * len(vals)
        first = sum(vals[:p]) / p
        result = [0.0] * (p - 1) + [first]
        for v in vals[p:]:
            result.append(result[-1] - result[-1] / p + v / p)
        return result

    atr_s = _wilder_sum(tr_list, period)
    pdi_s = _wilder_sum(pdm_list, period)
    mdi_s = _wilder_sum(mdm_list, period)

    dx_list: list[float] = []
    di_plus: list[float] = []
    di_minus: list[float] = []
    for a, p, m in zip(atr_s, pdi_s, mdi_s):
        dip = 100.0 * p / a if a else 0.0
        dim = 100.0 * m / a if a else 0.0
        denom = dip + dim
        dx_list.append(100.0 * abs(dip - dim) / denom if denom else 0.0)
        di_plus.append(dip)
        di_minus.append(dim)

    adx_out = _wilder_avg(dx_list, period)
    return adx_out, di_plus, di_minus


def vwap(points: list[OHLCVPoint]) -> list[float]:
    """VWAP = cumulative(typical_price * volume) / cumulative(volume).
    Typical price = (high + low + close) / 3. No daily reset."""
    result: list[float] = []
    cum_tpv = 0.0
    cum_vol = 0.0
    for p in points:
        tp = (p.high + p.low + p.close) / 3.0
        cum_tpv += tp * p.volume
        cum_vol += p.volume
        result.append(cum_tpv / cum_vol if cum_vol > 0.0 else p.close)
    return result


def keltner_channels(
    points: list[OHLCVPoint],
    ema_period: int = 20,
    atr_period: int = 10,
    multiplier: float = 2.0,
) -> tuple[list[float], list[float], list[float]]:
    """Keltner Channels: middle = EMA(close), upper/lower = middle ± multiplier * ATR.
    Returns (upper, middle, lower)."""
    mid = ema(closes(points), ema_period)
    atr_vals = calculate_atr(points, atr_period)
    upper = [m + multiplier * a for m, a in zip(mid, atr_vals)]
    lower = [m - multiplier * a for m, a in zip(mid, atr_vals)]
    return upper, mid, lower


def obv(points: list[OHLCVPoint]) -> list[float]:
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
    mfv: list[float] = []
    vols = volumes(points)
    for point in points:
        hl_range = point.high - point.low
        multiplier = ((point.close - point.low) - (point.high - point.close)) / hl_range if hl_range > 0 else 0.0
        mfv.append(multiplier * point.volume)
    sum_mfv = sma(mfv, period)
    sum_vol = sma(vols, period)
    return [sum_mfv[i] / sum_vol[i] if sum_vol[i] else 0.0 for i in range(len(points))]


def detect_swings(points: list[OHLCVPoint], window: int = 3) -> list[Pivot]:
    if len(points) < window * 2 + 1:
        return []
    output: list[Pivot] = []
    highs_data = highs(points)
    lows_data = lows(points)
    for i in range(window, len(points) - window):
        high_slice = highs_data[i - window : i + window + 1]
        low_slice = lows_data[i - window : i + window + 1]
        center_high = highs_data[i]
        center_low = lows_data[i]

        # Require strict local extrema to avoid flat/filler bars producing ambiguous pivots.
        surrounding_highs = high_slice[:window] + high_slice[window + 1 :]
        surrounding_lows = low_slice[:window] + low_slice[window + 1 :]
        is_local_high = center_high == max(high_slice) and center_high > max(surrounding_highs)
        is_local_low = center_low == min(low_slice) and center_low < min(surrounding_lows)

        if is_local_high:
            output.append(Pivot(index=i, time=points[i].time, price=points[i].high, kind="high"))
        elif is_local_low:
            output.append(Pivot(index=i, time=points[i].time, price=points[i].low, kind="low"))

    # Consider boundary pivots as well (important for terminal-leg harmonic and top/bottom patterns).
    for i in (0, len(points) - 1):
        edge_start = max(0, i - window)
        edge_end = min(len(points), i + window + 1)
        high_slice = highs_data[edge_start:edge_end]
        low_slice = lows_data[edge_start:edge_end]
        center_high = highs_data[i]
        center_low = lows_data[i]
        center_pos = i - edge_start
        surrounding_highs = high_slice[:center_pos] + high_slice[center_pos + 1 :]
        surrounding_lows = low_slice[:center_pos] + low_slice[center_pos + 1 :]
        if not surrounding_highs or not surrounding_lows:
            continue

        is_edge_high = center_high == max(high_slice) and center_high > max(surrounding_highs)
        is_edge_low = center_low == min(low_slice) and center_low < min(surrounding_lows)
        if is_edge_high:
            output.append(Pivot(index=i, time=points[i].time, price=points[i].high, kind="high"))
        elif is_edge_low:
            output.append(Pivot(index=i, time=points[i].time, price=points[i].low, kind="low"))

    output.sort(key=lambda pivot: pivot.index)

    deduped: list[Pivot] = []
    for pivot in output:
        if not deduped:
            deduped.append(pivot)
            continue
        previous = deduped[-1]
        if previous.kind == pivot.kind:
            if (pivot.kind == "high" and pivot.price >= previous.price) or (
                pivot.kind == "low" and pivot.price <= previous.price
            ):
                deduped[-1] = pivot
            continue
        deduped.append(pivot)
    return deduped


def detect_close_turning_pivots(points: list[OHLCVPoint]) -> list[Pivot]:
    if len(points) < 3:
        return []

    output: list[Pivot] = []

    def _kind_at(i: int) -> Literal["high", "low"] | None:
        if i <= 0 or i >= len(points) - 1:
            return None
        prev_close = points[i - 1].close
        cur_close = points[i].close
        next_close = points[i + 1].close
        if (cur_close >= prev_close and cur_close > next_close) or (
            cur_close > prev_close and cur_close >= next_close
        ):
            return "high"
        if (cur_close <= prev_close and cur_close < next_close) or (
            cur_close < prev_close and cur_close <= next_close
        ):
            return "low"
        return None

    for i in range(1, len(points) - 1):
        kind = _kind_at(i)
        if kind is None:
            continue
        price = points[i].high if kind == "high" else points[i].low
        output.append(Pivot(index=i, time=points[i].time, price=price, kind=kind))

    if len(points) >= 2:
        first_kind = "low" if points[0].close <= points[1].close else "high"
        first_price = points[0].low if first_kind == "low" else points[0].high
        output.insert(0, Pivot(index=0, time=points[0].time, price=first_price, kind=first_kind))

        last_kind = "high" if points[-1].close >= points[-2].close else "low"
        last_price = points[-1].high if last_kind == "high" else points[-1].low
        output.append(
            Pivot(index=len(points) - 1, time=points[-1].time, price=last_price, kind=last_kind)
        )

    deduped: list[Pivot] = []
    for pivot in output:
        if not deduped:
            deduped.append(pivot)
            continue
        previous = deduped[-1]
        if previous.kind == pivot.kind:
            if (pivot.kind == "high" and pivot.price >= previous.price) or (
                pivot.kind == "low" and pivot.price <= previous.price
            ):
                deduped[-1] = pivot
            continue
        deduped.append(pivot)
    return deduped


def fibonacci_levels(points: list[OHLCVPoint]) -> FibonacciResponse:
    pivots = detect_swings(points, window=4)
    if len(pivots) < 2:
        low = min(points, key=lambda item: item.low)
        high = max(points, key=lambda item: item.high)
        start = Pivot(0, low.time, low.low, "low")
        end = Pivot(len(points) - 1, high.time, high.high, "high")
    else:
        start = pivots[-2]
        end = pivots[-1]

    anchor_low = min(start.price, end.price)
    anchor_high = max(start.price, end.price)
    span = anchor_high - anchor_low
    ratios = [0.236, 0.382, 0.5, 0.618, 0.786, 1.0, 1.272, 1.618, 2.618]
    levels = [FibonacciLevel(ratio=ratio, price=anchor_high - span * ratio) for ratio in ratios]
    return FibonacciResponse(
        swing={
            "start_time": start.time,
            "end_time": end.time,
            "start_price": start.price,
            "end_price": end.price,
        },
        levels=levels,
    )


def heartbeat_score(points: list[OHLCVPoint]) -> tuple[float, dict[str, Any]]:
    rust_score = rust_calculate_heartbeat(closes(points), highs(points), lows(points), 0.02)
    if rust_score is not None:
        rust_score = clamp(rust_score, 0.0, 1.0)
        pivots = detect_swings(points, window=2)
        period_hint = 0.0
        if len(pivots) >= 2:
            periods = [pivots[i].index - pivots[i - 1].index for i in range(1, len(pivots))]
            period_hint = round(mean(periods), 2) if periods else 0.0
        return rust_score, {
            "swings": len(pivots),
            "cycleBars": period_hint,
            "amplitudeStability": None,
            "periodStability": None,
            "engine": "rust",
        }

    pivots = detect_swings(points, window=2)
    if len(pivots) < 6:
        return 0.0, {
            "swings": len(pivots),
            "cycleBars": 0,
            "amplitudeStability": 0.0,
            "periodStability": 0.0,
            "engine": "python",
        }
    periods = [pivots[i].index - pivots[i - 1].index for i in range(1, len(pivots))]
    amplitudes = [abs(pivots[i].price - pivots[i - 1].price) for i in range(1, len(pivots))]
    period_mean = mean(periods) if periods else 0.0
    amp_mean = mean(amplitudes) if amplitudes else 0.0
    period_cv = (pstdev(periods) / period_mean) if period_mean else 1.0
    amp_cv = (pstdev(amplitudes) / amp_mean) if amp_mean else 1.0
    period_stability = clamp(1.0 - period_cv, 0.0, 1.0)
    amp_stability = clamp(1.0 - amp_cv, 0.0, 1.0)
    score = clamp((period_stability + amp_stability) / 2.0, 0.0, 1.0)
    return score, {
        "swings": len(pivots),
        "cycleBars": round(period_mean, 2),
        "amplitudeStability": round(amp_stability, 4),
        "periodStability": round(period_stability, 4),
        "engine": "python",
    }


def calculate_exotic_ma(payload: ExoticMARequest) -> IndicatorResponse:
    series = closes(payload.ohlcv)
    ma_type = payload.maType.lower()
    if ma_type == "kama":
        values = kama(series, payload.period)
    elif ma_type == "alma":
        values = alma(series, payload.period)
    elif ma_type == "iwma":
        values = iwma(series, payload.period)
    elif ma_type == "ols":
        values = ols_ma(series, payload.period)
    elif ma_type == "ema":
        # Rust-first for EMA
        rust_batch = rust_calculate_indicators_batch(
            [p.time for p in payload.ohlcv],
            [p.open for p in payload.ohlcv],
            [p.high for p in payload.ohlcv],
            [p.low for p in payload.ohlcv],
            series,
            volumes(payload.ohlcv),
            [f"ema_{payload.period}"],
        )
        key = f"ema_{payload.period}"
        if rust_batch and key in rust_batch and len(rust_batch[key]) == len(series):
            values = [float(v) for v in rust_batch[key]]
        else:
            values = ema(series, payload.period)
    elif ma_type == "sma":
        # Rust-first for SMA
        rust_batch = rust_calculate_indicators_batch(
            [p.time for p in payload.ohlcv],
            [p.open for p in payload.ohlcv],
            [p.high for p in payload.ohlcv],
            [p.low for p in payload.ohlcv],
            series,
            volumes(payload.ohlcv),
            [f"sma_{payload.period}"],
        )
        key = f"sma_{payload.period}"
        if rust_batch and key in rust_batch and len(rust_batch[key]) == len(series):
            values = [float(v) for v in rust_batch[key]]
        else:
            values = sma(series, payload.period)
    elif ma_type == "smma":
        values = smma(series, payload.period)
    else:
        values = sma(series, payload.period)

    return IndicatorResponse(
        data=[IndicatorPoint(time=point.time, value=values[i]) for i, point in enumerate(payload.ohlcv)],
        metadata={"indicator": ma_type.upper(), "period": payload.period, "points": len(values)},
    )


_FIB_MA_PERIODS = (2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597)


def _atr_wilder(points: list[OHLCVPoint], period: int) -> list[float]:
    """ATR using Wilder's smoothing (EWM span=2*period-1), matching book formula.
    Book ref: mastering-finance-python.md §ATR — vol_lookback=(vol_lookback*2)-1."""
    h = highs(points)
    lo = lows(points)
    c = closes(points)
    tr: list[float] = [0.0]
    for i in range(1, len(c)):
        tr.append(max(h[i] - lo[i], abs(h[i] - c[i - 1]), abs(lo[i] - c[i - 1])))
    return ema(tr, period * 2 - 1)


def calculate_ks_collection(payload: KsCollectionRequest) -> dict[str, IndicatorResponse]:
    """K's Collection — 6 indicators (Kaabar 2026, Ch. 11).

    Reversal I/II and MARSI return discrete signals {-1.0, 0.0, 1.0}.
    ATR-RSI and RSI² return continuous 0-100 oscillator values.
    FMA returns price-level band values (high/low/mid).
    """
    pts = payload.ohlcv
    series = closes(pts)
    h = highs(pts)
    lo = lows(pts)
    n = len(series)

    # ------------------------------------------------------------------
    # K's Reversal I (Ch. 11): BB(100, SMA) + MACD(12/26/9) crossover
    # Bullish  → low[i]  < lower_band[i]  AND high[i]  < mid_band[i]
    #             AND macd_line crosses above signal → signal at i+1
    # Bearish  → high[i] > upper_band[i] AND low[i]  > mid_band[i]
    #             AND macd_line crosses below signal → signal at i+1
    # ------------------------------------------------------------------
    bb_upper, bb_mid, bb_lower = bollinger_bands_raw(series, 100, 2.0)
    macd_l, macd_sig, _ = macd(series, 12, 26, 9)
    rev_i: list[float] = [0.0] * n
    for i in range(1, n - 1):
        if (lo[i] < bb_lower[i] and h[i] < bb_mid[i]
                and macd_l[i] > macd_sig[i] and macd_l[i - 1] < macd_sig[i - 1]):
            rev_i[i + 1] = 1.0
        elif (h[i] > bb_upper[i] and lo[i] > bb_mid[i]
              and macd_l[i] < macd_sig[i] and macd_l[i - 1] > macd_sig[i - 1]):
            rev_i[i + 1] = -1.0

    # ------------------------------------------------------------------
    # K's Reversal II (Ch. 11): SMA(13) + rolling 21-bar above-count
    # Bullish  → count == 0  (all 21 bars below SMA)
    # Bearish  → count == 21 (all 21 bars above SMA)
    # ------------------------------------------------------------------
    sma_13 = sma(series, 13)
    rev_ii: list[float] = [0.0] * n
    for i in range(20, n):
        count = sum(1 for j in range(i - 20, i + 1) if series[j] > sma_13[j])
        if count == 0:
            rev_ii[i] = 1.0
        elif count == 21:
            rev_ii[i] = -1.0

    # ------------------------------------------------------------------
    # K's ATR-Adjusted RSI (Ch. 11): RSI(13)*ATR(5) → RSI(13)
    # ------------------------------------------------------------------
    rsi_13 = rsi(series, 13)
    atr_5 = _atr_wilder(pts, 5)
    rsi_x_atr = [r * a for r, a in zip(rsi_13, atr_5)]
    atr_rsi = rsi(rsi_x_atr, 13)

    # ------------------------------------------------------------------
    # K's RSI² (Ch. 11): RSI(14, close) → RSI(5, rsi14)
    # ------------------------------------------------------------------
    rsi_14 = rsi(series, 14)
    rsi_sq = rsi(rsi_14, 5)

    # ------------------------------------------------------------------
    # K's MARSI (Ch. 11): SMA(200, close) → RSI(20)
    # Returns continuous 0-100 oscillator value.
    # Signals: bullish when crossing above 2 from below (3 bars < 2),
    #          bearish when crossing below 98 from above (3 bars > 98).
    # ------------------------------------------------------------------
    sma_200 = sma(series, 200)
    marsi_vals = rsi(sma_200, 20)

    # ------------------------------------------------------------------
    # K's Fibonacci MA (Ch. 11): avg of 15 Fib EMAs on highs + lows
    # Periods: {2,3,5,8,13,21,34,55,89,144,233,377,610,987,1597}
    # ------------------------------------------------------------------
    ema_h_list = [ema(h, p) for p in _FIB_MA_PERIODS]
    ema_l_list = [ema(lo, p) for p in _FIB_MA_PERIODS]
    k = len(_FIB_MA_PERIODS)
    fma_h = [sum(ema_h_list[j][i] for j in range(k)) / k for i in range(n)]
    fma_l = [sum(ema_l_list[j][i] for j in range(k)) / k for i in range(n)]
    fma_mid = [(fh + fl) / 2.0 for fh, fl in zip(fma_h, fma_l)]

    def to_response(name: str, values: list[float], extra: dict[str, Any] | None = None) -> IndicatorResponse:
        meta: dict[str, Any] = {"indicator": name, "points": len(values)}
        if extra:
            meta.update(extra)
        return IndicatorResponse(
            data=[IndicatorPoint(time=point.time, value=values[i]) for i, point in enumerate(pts)],
            metadata=meta,
        )

    return {
        "reversalI": to_response("K_REVERSAL_I", rev_i, {"bbPeriod": 100, "macdFast": 12, "macdSlow": 26, "macdSignal": 9}),
        "reversalII": to_response("K_REVERSAL_II", rev_ii, {"smaPeriod": 13, "countWindow": 21}),
        "atrAdjustedRSI": to_response("K_ATR_RSI", atr_rsi, {"rsiPeriod": 13, "atrPeriod": 5}),
        "rsiSquared": to_response("K_RSI_SQUARED", rsi_sq, {"rsiInner": 14, "rsiOuter": 5}),
        "marsi": to_response("K_MARSI", marsi_vals, {"smaPeriod": 200, "rsiPeriod": 20}),
        "fibonacciMA": to_response("K_FIB_MA", fma_mid, {"fibPeriods": 15}),
        "fibonacciMAHigh": to_response("K_FIB_MA_HIGH", fma_h, {"fibPeriods": 15}),
        "fibonacciMALow": to_response("K_FIB_MA_LOW", fma_l, {"fibPeriods": 15}),
    }


# ---------------------------------------------------------------------------
# Rainbow Collection — 7 indicators (Kaabar 2026, Ch. 3)
# Each function returns a list[float]: 1.0 bullish, -1.0 bearish, 0.0 neutral.
# Signals are emitted at i+1 (next bar), matching the book convention.
# ---------------------------------------------------------------------------

_FIB_LAGS = (1, 2, 3, 5, 8, 13, 21)  # used by Indigo + Violet


def _rainbow_series(
    name: str, signals: list[float], points: list[OHLCVPoint]
) -> RainbowSignalSeries:
    return RainbowSignalSeries(
        data=[IndicatorPoint(time=p.time, value=signals[i]) for i, p in enumerate(points)],
        metadata={"indicator": name, "points": len(signals)},
    )


def _red(closes_: list[float], period: int = 20, num_std: float = 2.0) -> list[float]:
    """EMA-Bollinger extreme-duration reversal (min 3 periods outside band)."""
    upper, middle, lower = e_bollinger_bands(closes_, period, num_std)
    n = len(closes_)
    out = [0.0] * n
    for i in range(3, n - 1):
        c, c1, c2, c3 = closes_[i], closes_[i - 1], closes_[i - 2], closes_[i - 3]
        # bullish: reintegrate from below after ≥3 bars below lower band
        if c > lower[i] and c < middle[i] and c1 < lower[i - 1] and c2 < lower[i - 2] and c3 < lower[i - 3]:
            out[i + 1] = 1.0
        # bearish: reintegrate from above after ≥3 bars above upper band
        elif c < upper[i] and c > middle[i] and c1 > upper[i - 1] and c2 > upper[i - 2] and c3 > upper[i - 3]:
            out[i + 1] = -1.0
    return out


def _orange(
    closes_: list[float],
    rsi_period: int = 8,
    lower: float = 35.0,
    upper: float = 65.0,
) -> list[float]:
    """RSI extreme-duration reversal (min 5 bars in oversold/overbought zone)."""
    rs = rsi(closes_, rsi_period)
    n = len(closes_)
    out = [0.0] * n
    for i in range(5, n - 1):
        r = rs[i]
        # bullish: RSI crosses above lower barrier from ≥5 bars below it
        if r > lower and r < 50 and all(rs[i - k] < lower for k in range(1, 6)):
            out[i + 1] = 1.0
        # bearish: RSI crosses below upper barrier from ≥5 bars above it
        elif r < upper and r > 50 and all(rs[i - k] > upper for k in range(1, 6)):
            out[i + 1] = -1.0
    return out


def _yellow(
    closes_: list[float],
    rsi_period: int = 14,
    slope_period: int = 14,
    lower: float = 35.0,
    upper: float = 65.0,
) -> list[float]:
    """RSI-slope vs price-slope divergence while RSI is in extreme zone."""
    rs = rsi(closes_, rsi_period)
    sl_rsi = slope(rs, slope_period)
    sl_close = slope(closes_, slope_period)
    n = len(closes_)
    out = [0.0] * n
    for i in range(slope_period + 1, n - 1):
        # bullish: RSI slope turns up while price slope still down AND RSI oversold
        if sl_rsi[i] > 0 and sl_rsi[i - 1] < 0 and sl_close[i] < 0 and sl_close[i - 1] < 0 and rs[i] < lower:
            out[i + 1] = 1.0
        # bearish: RSI slope turns down while price slope still up AND RSI overbought
        elif sl_rsi[i] < 0 and sl_rsi[i - 1] > 0 and sl_close[i] > 0 and sl_close[i - 1] > 0 and rs[i] > upper:
            out[i + 1] = -1.0
    return out


def _green(
    closes_: list[float],
    rsi_period: int = 14,
    slope_period: int = 14,
    lower: float = 35.0,
    upper: float = 65.0,
) -> list[float]:
    """RSI-slope zero-cross while RSI is in extreme zone (slope of RSI flattening)."""
    rs = rsi(closes_, rsi_period)
    sl_rsi = slope(rs, slope_period)
    n = len(closes_)
    out = [0.0] * n
    for i in range(slope_period + 1, n - 1):
        if sl_rsi[i] > 0 and sl_rsi[i - 1] < 0 and rs[i] < lower:
            out[i + 1] = 1.0
        elif sl_rsi[i] < 0 and sl_rsi[i - 1] > 0 and rs[i] > upper:
            out[i + 1] = -1.0
    return out


def _blue(
    closes_: list[float],
    highs_: list[float],
    lows_: list[float],
    rsi_period: int = 5,
    slope_period: int = 5,
    lower: float = 30.0,
    upper: float = 70.0,
    margin: float = 5.0,
) -> list[float]:
    """RSI applied to price-slope: crosses into 30–35 / 65–70 with confirming H/L."""
    sl_close = slope(closes_, slope_period)
    rs_slope = rsi(sl_close, rsi_period)
    n = len(closes_)
    out = [0.0] * n
    for i in range(slope_period + rsi_period + 1, n - 1):
        r, r1 = rs_slope[i], rs_slope[i - 1]
        if r > lower and r < lower + margin and r1 < lower and lows_[i] < lows_[i - 1]:
            out[i + 1] = 1.0
        elif r < upper and r > upper - margin and r1 > upper and highs_[i] > highs_[i - 1]:
            out[i + 1] = -1.0
    return out


def _indigo(closes_: list[float]) -> list[float]:
    """Fibonacci-indexed consecutive comparison: close[fib_k] < close[fib_{k+1}] for all k."""
    fib_ext = _FIB_LAGS + (34,)  # need 34 for the last comparison
    min_i = fib_ext[-1] + 1  # need at least 35 bars
    n = len(closes_)
    out = [0.0] * n
    for i in range(min_i, n - 1):
        # bullish: current close up AND closes descending through fib lookbacks
        if (
            closes_[i] > closes_[i - 1]
            and all(closes_[i - _FIB_LAGS[k]] < closes_[i - fib_ext[k + 1]] for k in range(len(_FIB_LAGS)))
        ):
            out[i + 1] = 1.0
        # bearish: current close down AND closes ascending through fib lookbacks
        elif (
            closes_[i] < closes_[i - 1]
            and all(closes_[i - _FIB_LAGS[k]] > closes_[i - fib_ext[k + 1]] for k in range(len(_FIB_LAGS)))
        ):
            out[i + 1] = -1.0
    return out


def _violet(closes_: list[float], hma_period: int = 20) -> list[float]:
    """HMA cross with Fibonacci-indexed confirmation bars."""
    hma_vals = hma(closes_, hma_period)
    min_i = _FIB_LAGS[-1] + 1  # need at least 22 bars past warmup
    n = len(closes_)
    out = [0.0] * n
    for i in range(hma_period + min_i, n - 1):
        # bullish: close crosses above HMA and all fib-lagged closes were below their HMAs
        if closes_[i] > hma_vals[i] and all(closes_[i - lag] < hma_vals[i - lag] for lag in _FIB_LAGS):
            out[i + 1] = 1.0
        # bearish: close crosses below HMA and all fib-lagged closes were above their HMAs
        elif closes_[i] < hma_vals[i] and all(closes_[i - lag] > hma_vals[i - lag] for lag in _FIB_LAGS):
            out[i + 1] = -1.0
    return out


def calculate_rainbow_collection(payload: RainbowRequest) -> RainbowResponse:
    """Compute all 7 Rainbow indicators (Kaabar 2026, Ch. 3).

    Returns signal series per indicator: 1.0 bullish | -1.0 bearish | 0.0 neutral.
    Signals at index i represent the signal generated on bar i (book: emitted for bar i+1).
    """
    pts = payload.ohlcv
    c = closes(pts)
    h = highs(pts)
    lo = lows(pts)
    return RainbowResponse(
        red=_rainbow_series("RAINBOW_RED", _red(c), pts),
        orange=_rainbow_series("RAINBOW_ORANGE", _orange(c), pts),
        yellow=_rainbow_series("RAINBOW_YELLOW", _yellow(c), pts),
        green=_rainbow_series("RAINBOW_GREEN", _green(c), pts),
        blue=_rainbow_series("RAINBOW_BLUE", _blue(c, h, lo), pts),
        indigo=_rainbow_series("RAINBOW_INDIGO", _indigo(c), pts),
        violet=_rainbow_series("RAINBOW_VIOLET", _violet(c), pts),
    )


# ---------------------------------------------------------------------------
# R-Pattern (Kaabar 2026, Ch. 7)
# ---------------------------------------------------------------------------

def calculate_r_pattern(payload: RPatternRequest) -> RPatternResponse:
    """Detect R-Pattern reversal signals (Kaabar 2026, Ch. 7).

    Bullish R: 4-bar low sequence low[i]>low[i-1]>low[i-2]<low[i-3],
               close rising over 4 bars, RSI < 50.
    Bearish R: 4-bar high sequence high[i]<high[i-1]<high[i-2]>high[i-3],
               close falling over 4 bars, RSI > 50.
    Signal emitted at i+1 (next bar), matching book convention.
    """
    pts = payload.ohlcv
    c = closes(pts)
    h = highs(pts)
    lo = lows(pts)
    rs = rsi(c, payload.rsi_period)
    n = len(pts)
    signals = [0.0] * n

    for i in range(3, n - 1):
        # bullish: lows form V-reversal + closes rising + RSI oversold side
        if (
            lo[i] > lo[i - 1]
            and lo[i - 1] > lo[i - 2]
            and lo[i - 2] < lo[i - 3]
            and c[i] > c[i - 1]
            and c[i - 1] > c[i - 2]
            and c[i - 2] > c[i - 3]
            and rs[i] < 50.0
        ):
            signals[i + 1] = 1.0
        # bearish: highs form inverted-V + closes falling + RSI overbought side
        elif (
            h[i] < h[i - 1]
            and h[i - 1] < h[i - 2]
            and h[i - 2] > h[i - 3]
            and c[i] < c[i - 1]
            and c[i - 1] < c[i - 2]
            and c[i - 2] < c[i - 3]
            and rs[i] > 50.0
        ):
            signals[i + 1] = -1.0

    return RPatternResponse(
        data=[IndicatorPoint(time=p.time, value=signals[i]) for i, p in enumerate(pts)],
        metadata={"indicator": "R_PATTERN", "rsiPeriod": payload.rsi_period, "points": n},
    )


# ---------------------------------------------------------------------------
# Gap-Pattern (Kaabar 2026, Ch. 10)
# ---------------------------------------------------------------------------

def calculate_gap_pattern(payload: GapPatternRequest) -> GapPatternResponse:
    """Detect tradeable gap patterns with ATR-based size filter (Kaabar 2026, Ch. 10).

    Contrarian / gap-fill signals:
      Bullish: open[i] < close[i-1]  AND  gap_size > ATR[i-1] * min_size  → buy (gap fills up)
      Bearish: open[i] > close[i-1]  AND  gap_size > ATR[i-1] * min_size  → sell (gap fills down)

    Target: previous close price (gap fill).
    """
    pts = payload.ohlcv
    n = len(pts)
    atr_vals = calculate_atr(pts, payload.atr_period)
    signals = [0.0] * n

    for i in range(1, n):
        prev_close = pts[i - 1].close
        cur_open = pts[i].open
        gap_size = abs(cur_open - prev_close)
        min_gap = atr_vals[i - 1] * payload.min_size

        if gap_size <= min_gap:
            continue  # gap too small — not tradeable

        if cur_open < prev_close:
            # gap down → contrarian bullish (price expected to fill gap upward)
            signals[i] = 1.0
        elif cur_open > prev_close:
            # gap up → contrarian bearish (price expected to fill gap downward)
            signals[i] = -1.0

    return GapPatternResponse(
        data=[IndicatorPoint(time=p.time, value=signals[i]) for i, p in enumerate(pts)],
        metadata={
            "indicator": "GAP_PATTERN",
            "atrPeriod": payload.atr_period,
            "minSize": payload.min_size,
            "points": n,
        },
    )


def build_candlestick_patterns(payload: PatternRequest) -> PatternResponse:
    points = payload.ohlcv[-payload.lookback :]
    patterns: list[PatternData] = []

    # ── Single- and two-bar patterns ─────────────────────────────────────
    for i in range(1, len(points)):
        current = points[i]
        previous = points[i - 1]
        body = abs(current.close - current.open)
        range_size = max(1e-9, current.high - current.low)
        upper_wick = current.high - max(current.open, current.close)
        lower_wick = min(current.open, current.close) - current.low
        body_ratio = body / range_size

        # ── existing: Doji ──────────────────────────────────────────────
        if body_ratio <= 0.15:
            # Dragonfly Doji: long lower wick, tiny upper wick
            if lower_wick > 2 * body and upper_wick < 0.1 * range_size:
                patterns.append(PatternData(
                    type="dragonfly_doji", direction="bullish",
                    start_time=current.time, end_time=current.time, confidence=0.65,
                    details={"body_ratio": round(body_ratio, 4)},
                ))
            # Gravestone Doji: long upper wick, tiny lower wick
            elif upper_wick > 2 * body and lower_wick < 0.1 * range_size:
                patterns.append(PatternData(
                    type="gravestone_doji", direction="bearish",
                    start_time=current.time, end_time=current.time, confidence=0.65,
                    details={"body_ratio": round(body_ratio, 4)},
                ))
            else:
                patterns.append(PatternData(
                    type="doji", direction="neutral",
                    start_time=current.time, end_time=current.time, confidence=0.64,
                    details={"body_ratio": round(body_ratio, 4)},
                ))

        # ── Spinning Top: medium body, both wicks significant ───────────
        if 0.15 < body_ratio <= 0.40 and lower_wick > 0.2 * range_size and upper_wick > 0.2 * range_size:
            patterns.append(PatternData(
                type="spinning_top", direction="neutral",
                start_time=current.time, end_time=current.time, confidence=0.50,
                details={"body_ratio": round(body_ratio, 4)},
            ))

        # ── existing: Bullish/Bearish Engulfing ─────────────────────────
        if current.close > current.open and previous.close < previous.open:
            if current.close >= previous.open and current.open <= previous.close:
                patterns.append(PatternData(
                    type="bullish_engulfing", direction="bullish",
                    start_time=previous.time, end_time=current.time, confidence=0.69,
                ))
        if current.close < current.open and previous.close > previous.open:
            if current.open >= previous.close and current.close <= previous.open:
                patterns.append(PatternData(
                    type="bearish_engulfing", direction="bearish",
                    start_time=previous.time, end_time=current.time, confidence=0.69,
                ))

        # ── existing: Hammer / Shooting Star ────────────────────────────
        if lower_wick > body * 2.0 and current.close > current.open:
            patterns.append(PatternData(
                type="hammer", direction="bullish",
                start_time=current.time, end_time=current.time, confidence=0.62,
            ))
        if upper_wick > body * 2.0 and current.close < current.open:
            patterns.append(PatternData(
                type="shooting_star", direction="bearish",
                start_time=current.time, end_time=current.time, confidence=0.62,
            ))

        # ── Piercing Line ───────────────────────────────────────────────
        prev_bearish = previous.close < previous.open
        cur_bullish = current.close > current.open
        if prev_bearish and cur_bullish:
            prev_mid = (previous.open + previous.close) / 2.0
            if current.open < previous.low and current.close > prev_mid:
                patterns.append(PatternData(
                    type="piercing_line", direction="bullish",
                    start_time=previous.time, end_time=current.time, confidence=0.67,
                ))

        # ── Dark Cloud Cover ────────────────────────────────────────────
        prev_bullish = previous.close > previous.open
        cur_bearish = current.close < current.open
        if prev_bullish and cur_bearish:
            prev_mid = (previous.open + previous.close) / 2.0
            if current.open > previous.high and current.close < prev_mid:
                patterns.append(PatternData(
                    type="dark_cloud_cover", direction="bearish",
                    start_time=previous.time, end_time=current.time, confidence=0.67,
                ))

    # ── Three-bar patterns ────────────────────────────────────────────────
    for i in range(2, len(points)):
        b0, b1, b2 = points[i - 2], points[i - 1], points[i]

        # body helper
        def _body(bar: OHLCVPoint) -> float:
            return abs(bar.close - bar.open)

        def _range(bar: OHLCVPoint) -> float:
            return max(1e-9, bar.high - bar.low)

        b0_bear = b0.close < b0.open
        b2_bull = b2.close > b2.open
        b0_bull = b0.close > b0.open
        b2_bear = b2.close < b2.open

        # ── Morning Star ────────────────────────────────────────────────
        b1_small = _body(b1) <= 0.3 * _range(b1)
        b0_mid = (b0.open + b0.close) / 2.0
        if (b0_bear and _body(b0) >= 0.5 * _range(b0)
                and b1_small and b2_bull
                and b2.close > b0_mid):
            patterns.append(PatternData(
                type="morning_star", direction="bullish",
                start_time=b0.time, end_time=b2.time, confidence=0.75,
            ))

        # ── Evening Star ────────────────────────────────────────────────
        if (b0_bull and _body(b0) >= 0.5 * _range(b0)
                and b1_small and b2_bear
                and b2.close < b0_mid):
            patterns.append(PatternData(
                type="evening_star", direction="bearish",
                start_time=b0.time, end_time=b2.time, confidence=0.75,
            ))

        # ── Three White Soldiers ─────────────────────────────────────────
        if (b0_bull and b1.close > b1.open and b2_bull
                and b1.close > b0.close and b2.close > b1.close
                and b1.open > b0.open and b2.open > b1.open
                and b2.close >= b2.open + 0.7 * _body(b2)):  # close near high
            patterns.append(PatternData(
                type="three_white_soldiers", direction="bullish",
                start_time=b0.time, end_time=b2.time, confidence=0.72,
            ))

        # ── Three Black Crows ────────────────────────────────────────────
        if (b0_bear and b1.close < b1.open and b2_bear
                and b1.close < b0.close and b2.close < b1.close
                and b1.open < b0.open and b2.open < b1.open
                and b2.close <= b2.open - 0.7 * _body(b2)):  # close near low
            patterns.append(PatternData(
                type="three_black_crows", direction="bearish",
                start_time=b0.time, end_time=b2.time, confidence=0.72,
            ))

        # ── Bottle: bearish continuation (2–3 bars, body<40%, close<open) ─
        if (b1_bear := b1.close < b1.open) and b2_bear:  # noqa: F841 (walrus for clarity)
            b1r, b2r = _range(b1), _range(b2)
            if (_body(b1) < 0.4 * b1r and _body(b2) < 0.4 * b2r):
                patterns.append(PatternData(
                    type="bottle", direction="bearish",
                    start_time=b1.time, end_time=b2.time, confidence=0.60,
                ))

        # ── Double Trouble: same pattern type on consecutive bars ─────────
        b1_doji = _body(b1) / _range(b1) <= 0.15
        b2_doji = _body(b2) / _range(b2) <= 0.15
        if b1_doji and b2_doji:
            patterns.append(PatternData(
                type="double_trouble", direction="neutral",
                start_time=b1.time, end_time=b2.time, confidence=0.55,
            ))

    # ── Extreme Euphoria: single big bullish bar after 5+ consecutive up-closes ─
    if len(points) >= 7:
        for i in range(6, len(points)):
            bar = points[i]
            body = abs(bar.close - bar.open)
            rng = max(1e-9, bar.high - bar.low)
            if bar.close > bar.open and body / rng > 0.70:
                # check 5 prior closes were all rising
                all_up = all(points[j].close > points[j - 1].close for j in range(i - 4, i))
                if all_up:
                    patterns.append(PatternData(
                        type="extreme_euphoria", direction="bearish",
                        start_time=bar.time, end_time=bar.time, confidence=0.63,
                        details={"body_ratio": round(body / rng, 4)},
                    ))

    return PatternResponse(
        patterns=patterns[:50],
        metadata={"scanned_bars": len(points), "patterns_found": len(patterns)},
    )


def build_harmonic_patterns(payload: PatternRequest) -> PatternResponse:
    points = payload.ohlcv[-payload.lookback :]
    pivots = detect_swings(points, window=2)
    if len(pivots) < 5:
        pivots = detect_close_turning_pivots(points)
    patterns: list[PatternData] = []
    tol = 0.05

    def _in_range(v: float, lo: float, hi: float) -> bool:
        return lo - tol <= v <= hi + tol

    # ── XABCD patterns (5 pivots) ──────────────────────────────────────────
    if len(pivots) >= 5:
        for idx in range(len(pivots) - 4):
            x, a, b, c, d = pivots[idx], pivots[idx + 1], pivots[idx + 2], pivots[idx + 3], pivots[idx + 4]
            xa = abs(a.price - x.price)
            ab = abs(b.price - a.price)
            bc = abs(c.price - b.price)
            cd = abs(d.price - c.price)
            if xa < 1e-9 or ab < 1e-9 or bc < 1e-9:
                continue
            ab_xa = ab / xa
            bc_ab = bc / ab
            cd_bc = cd / bc
            ad_xa = abs(d.price - a.price) / xa
            bearish_d = d.kind == "high"
            direction: PatternDirection = "bearish" if bearish_d else "bullish"
            inv_factor = 1.01 if bearish_d else 0.99

            # Gartley: XA→B=0.618, BC=0.382–0.886, CD/BC=1.272–1.618
            # NOTE: D/XA retracement can vary materially on sampled OHLC pivots, so we keep it informational.
            if (
                _in_range(ab_xa, 0.618, 0.618)
                and _in_range(bc_ab, 0.382, 0.886)
                and _in_range(cd_bc, 1.272, 1.618)
            ):
                patterns.append(PatternData(
                    type="gartley", direction=direction, start_time=x.time, end_time=d.time,
                    confidence=0.78,
                    details={"xa_b": round(ab_xa, 4), "bc": round(bc_ab, 4),
                             "cd_bc": round(cd_bc, 4), "d_xa": round(ad_xa, 4),
                             "invalidation_level": round(d.price * inv_factor, 4)},
                ))

            # Bat: XA→B=0.382–0.50, BC=0.382–0.886, CD/BC=1.618–2.618
            if (
                _in_range(ab_xa, 0.382, 0.50)
                and _in_range(bc_ab, 0.382, 0.886)
                and _in_range(cd_bc, 1.618, 2.618)
            ):
                patterns.append(PatternData(
                    type="bat", direction=direction, start_time=x.time, end_time=d.time,
                    confidence=0.76,
                    details={"xa_b": round(ab_xa, 4), "bc": round(bc_ab, 4),
                             "cd_bc": round(cd_bc, 4), "d_xa": round(ad_xa, 4),
                             "invalidation_level": round(d.price * inv_factor, 4)},
                ))

            # Butterfly: XA→B=0.786, BC=0.382–0.886, CD/BC=1.618–2.618, XA→D=1.272–1.618
            if (_in_range(ab_xa, 0.786, 0.786) and _in_range(bc_ab, 0.382, 0.886)
                    and _in_range(cd_bc, 1.618, 2.618) and _in_range(ad_xa, 1.272, 1.618)):
                patterns.append(PatternData(
                    type="butterfly", direction=direction, start_time=x.time, end_time=d.time,
                    confidence=0.74,
                    details={"xa_b": round(ab_xa, 4), "bc": round(bc_ab, 4),
                             "cd_bc": round(cd_bc, 4), "d_xa": round(ad_xa, 4),
                             "invalidation_level": round(d.price * inv_factor, 4)},
                ))

            # Crab: XA→B=0.382–0.618, BC=0.382–0.886, CD/BC=2.244–3.618, XA→D=1.618
            if (_in_range(ab_xa, 0.382, 0.618) and _in_range(bc_ab, 0.382, 0.886)
                    and _in_range(cd_bc, 2.244, 3.618) and _in_range(ad_xa, 1.618, 1.618)):
                patterns.append(PatternData(
                    type="crab", direction=direction, start_time=x.time, end_time=d.time,
                    confidence=0.72,
                    details={"xa_b": round(ab_xa, 4), "bc": round(bc_ab, 4),
                             "cd_bc": round(cd_bc, 4), "d_xa": round(ad_xa, 4),
                             "invalidation_level": round(d.price * inv_factor, 4)},
                ))

    # ── FEIW: failed breakout/breakdown (3 pivots) ────────────────────────
    if len(pivots) >= 3 and len(points) >= 2:
        last_close = points[-1].close
        for idx in range(len(pivots) - 2):
            p1, _p2, p3 = pivots[idx], pivots[idx + 1], pivots[idx + 2]
            if p1.kind == "high" and p3.kind == "high" and p3.price > p1.price and last_close < p1.price:
                patterns.append(
                    PatternData(
                        type="feiw_failed_breakout",
                        direction="bearish",
                        start_time=p1.time,
                        end_time=p3.time,
                        confidence=0.60,
                        details={"prior_extreme": round(p1.price, 4), "breakout_level": round(p3.price, 4)},
                    )
                )
                break
            if p1.kind == "low" and p3.kind == "low" and p3.price < p1.price and last_close > p1.price:
                patterns.append(
                    PatternData(
                        type="feiw_failed_breakdown",
                        direction="bullish",
                        start_time=p1.time,
                        end_time=p3.time,
                        confidence=0.60,
                        details={"prior_extreme": round(p1.price, 4), "breakdown_level": round(p3.price, 4)},
                    )
                )
                break

    # ── Legacy ABCD (4-pivot, backwards compat) ───────────────────────────
    if len(pivots) >= 4:
        a, b, c, d = pivots[-4], pivots[-3], pivots[-2], pivots[-1]
        ab = abs(b.price - a.price)
        bc = abs(c.price - b.price)
        cd = abs(d.price - c.price)
        if ab > 0 and bc > 0:
            ratio_bc_ab = bc / ab
            ratio_cd_bc = cd / bc
            if 0.55 <= ratio_bc_ab <= 0.78 and 1.13 <= ratio_cd_bc <= 1.9:
                patterns.append(PatternData(
                    type="abcd",
                    direction="bullish" if d.kind == "low" else "bearish",
                    start_time=a.time, end_time=d.time, confidence=0.74,
                    details={"bc_ab": round(ratio_bc_ab, 4), "cd_bc": round(ratio_cd_bc, 4),
                             "fibonacci_valid": True},
                ))

    return PatternResponse(
        patterns=patterns[:30],
        metadata={"scanned_bars": len(points), "patterns_found": len(patterns)},
    )


def build_td_timing_patterns(payload: PatternRequest) -> PatternResponse:
    points = payload.ohlcv[-payload.lookback :]
    closes_data = closes(points)
    lows_data = lows(points)
    highs_data = highs(points)
    bullish_count = 0
    bearish_count = 0
    patterns: list[PatternData] = []

    # Countdown state: list of (kind, setup_end_idx, tdst_level, countdown_count)
    active_countdowns: list[TDCountdownState] = []

    for i in range(4, len(points)):
        if closes_data[i] > closes_data[i - 4]:
            bullish_count += 1
            bearish_count = 0
        elif closes_data[i] < closes_data[i - 4]:
            bearish_count += 1
            bullish_count = 0
        else:
            bullish_count = 0
            bearish_count = 0

        # ── TD Setup 9 + TDST ────────────────────────────────────────────
        if bullish_count == 9:
            setup_start = i - 8
            # TDST: lowest close of the bullish setup bars
            tdst_level = min(closes_data[setup_start : i + 1])
            patterns.append(PatternData(
                type="td_setup_9_bullish",
                direction="bullish",
                start_time=points[setup_start].time,
                end_time=points[i].time,
                confidence=0.73,
            ))
            patterns.append(PatternData(
                type="tdst_level",
                direction="bullish",
                start_time=points[setup_start].time,
                end_time=points[i].time,
                confidence=0.70,
                details={"level": round(tdst_level, 4), "kind": "support"},
            ))
            # Begin countdown after this setup
            active_countdowns.append({
                "kind": "bullish",
                "start_idx": i,
                "tdst": tdst_level,
                "count": 0,
            })
            bullish_count = 0

        if bearish_count == 9:
            setup_start = i - 8
            # TDST: highest close of the bearish setup bars
            tdst_level = max(closes_data[setup_start : i + 1])
            patterns.append(PatternData(
                type="td_setup_9_bearish",
                direction="bearish",
                start_time=points[setup_start].time,
                end_time=points[i].time,
                confidence=0.73,
            ))
            patterns.append(PatternData(
                type="tdst_level",
                direction="bearish",
                start_time=points[setup_start].time,
                end_time=points[i].time,
                confidence=0.70,
                details={"level": round(tdst_level, 4), "kind": "resistance"},
            ))
            active_countdowns.append({
                "kind": "bearish",
                "start_idx": i,
                "tdst": tdst_level,
                "count": 0,
            })
            bearish_count = 0

        # ── TD Countdown 13 ──────────────────────────────────────────────
        if i >= 2:
            completed: list[TDCountdownState] = []
            for cd in active_countdowns:
                if i <= cd["start_idx"]:
                    continue
                if cd["kind"] == "bearish":
                    # bearish countdown: close ≤ low[i-2]
                    if closes_data[i] <= lows_data[i - 2]:
                        cd["count"] += 1
                else:
                    # bullish countdown: close ≥ high[i-2]
                    if closes_data[i] >= highs_data[i - 2]:
                        cd["count"] += 1
                if cd["count"] >= 13:
                    ptype = f"td_countdown_13_{cd['kind']}"
                    direction_cd: PatternDirection = "bearish" if cd["kind"] == "bearish" else "bullish"
                    patterns.append(PatternData(
                        type=ptype,
                        direction=direction_cd,
                        start_time=points[cd["start_idx"]].time,
                        end_time=points[i].time,
                        confidence=0.76,
                    ))
                    completed.append(cd)
            for cd in completed:
                active_countdowns.remove(cd)

    return PatternResponse(
        patterns=patterns,
        metadata={"scanned_bars": len(points), "patterns_found": len(patterns)},
    )


def build_price_patterns(payload: PatternRequest) -> PatternResponse:
    points = payload.ohlcv[-payload.lookback :]
    patterns: list[PatternData] = []
    pivots = detect_swings(points, window=2)
    if len(pivots) < 3:
        pivots = detect_close_turning_pivots(points)
    thr = payload.threshold

    # Quick 3-bar fallback for terminal double-top/double-bottom where swing detection is ambiguous.
    if len(points) >= 3:
        p1, p2, p3 = points[-3], points[-2], points[-1]
        highs_diff = abs(p3.high - p1.high) / max(1e-9, p1.high)
        lows_diff = abs(p3.low - p1.low) / max(1e-9, p1.low)
        if highs_diff <= thr and p2.low < min(p1.low, p3.low):
            patterns.append(
                PatternData(
                    type="double_top",
                    direction="bearish",
                    start_time=p1.time,
                    end_time=p3.time,
                    confidence=0.71,
                    details={"height_diff": round(highs_diff, 4)},
                )
            )
        if lows_diff <= thr and p2.high > max(p1.high, p3.high):
            patterns.append(
                PatternData(
                    type="double_bottom",
                    direction="bullish",
                    start_time=p1.time,
                    end_time=p3.time,
                    confidence=0.71,
                    details={"depth_diff": round(lows_diff, 4)},
                )
            )

    # ── Double Top / Double Bottom ────────────────────────────────────────
    if len(pivots) >= 3:
        p1, _p2, p3 = pivots[-3], pivots[-2], pivots[-1]
        price_diff = abs(p3.price - p1.price) / max(1e-9, p1.price)
        if p1.kind == "high" and p3.kind == "high" and price_diff <= thr:
            patterns.append(PatternData(
                type="double_top", direction="bearish",
                start_time=p1.time, end_time=p3.time, confidence=0.71,
                details={"height_diff": round(price_diff, 4)},
            ))
        if p1.kind == "low" and p3.kind == "low" and price_diff <= thr:
            patterns.append(PatternData(
                type="double_bottom", direction="bullish",
                start_time=p1.time, end_time=p3.time, confidence=0.71,
                details={"depth_diff": round(price_diff, 4)},
            ))

    # ── Head & Shoulders / Inverse H&S (5-pivot) ─────────────────────────
    if len(pivots) >= 5:
        for idx in range(len(pivots) - 4):
            ls, lv, h, rv, rs = pivots[idx], pivots[idx + 1], pivots[idx + 2], pivots[idx + 3], pivots[idx + 4]

            # H&S: LS(high), LV(low), H(high>LS), RV(low≈LV), RS(high<H, ≈LS)
            if (ls.kind == "high" and lv.kind == "low" and h.kind == "high"
                    and rv.kind == "low" and rs.kind == "high"):
                shoulder_diff = abs(rs.price - ls.price) / max(1e-9, ls.price)
                neckline_diff = abs(rv.price - lv.price) / max(1e-9, lv.price)
                if (h.price > ls.price and h.price > rs.price
                        and shoulder_diff <= thr * 2
                        and neckline_diff <= thr * 2):
                    neckline = (lv.price + rv.price) / 2.0
                    head_height = h.price - neckline
                    target = neckline - head_height
                    patterns.append(PatternData(
                        type="head_and_shoulders", direction="bearish",
                        start_time=ls.time, end_time=rs.time, confidence=0.72,
                        details={
                            "neckline_level": round(neckline, 4),
                            "target_price": round(target, 4),
                            "shoulder_diff": round(shoulder_diff, 4),
                        },
                    ))

            # Inverse H&S: LS(low), LV(high), H(low<LS), RV(high≈LV), RS(low>H, ≈LS)
            if (ls.kind == "low" and lv.kind == "high" and h.kind == "low"
                    and rv.kind == "high" and rs.kind == "low"):
                shoulder_diff = abs(rs.price - ls.price) / max(1e-9, ls.price)
                neckline_diff = abs(rv.price - lv.price) / max(1e-9, lv.price)
                if (h.price < ls.price and h.price < rs.price
                        and shoulder_diff <= thr * 2
                        and neckline_diff <= thr * 2):
                    neckline = (lv.price + rv.price) / 2.0
                    head_depth = neckline - h.price
                    target = neckline + head_depth
                    patterns.append(PatternData(
                        type="inverse_head_and_shoulders", direction="bullish",
                        start_time=ls.time, end_time=rs.time, confidence=0.72,
                        details={
                            "neckline_level": round(neckline, 4),
                            "target_price": round(target, 4),
                            "shoulder_diff": round(shoulder_diff, 4),
                        },
                    ))

    # ── Gap Up / Gap Down ────────────────────────────────────────────────
    for i in range(1, len(points)):
        prev = points[i - 1]
        cur = points[i]
        if cur.low > prev.high * (1.0 + thr):
            patterns.append(PatternData(
                type="gap_up", direction="bullish",
                start_time=prev.time, end_time=cur.time, confidence=0.58,
            ))
        if cur.high < prev.low * (1.0 - thr):
            patterns.append(PatternData(
                type="gap_down", direction="bearish",
                start_time=prev.time, end_time=cur.time, confidence=0.58,
            ))

    return PatternResponse(
        patterns=patterns[:30],
        metadata={"scanned_bars": len(points), "patterns_found": len(patterns)},
    )


def build_elliott_wave_patterns(payload: PatternRequest) -> PatternResponse:
    points = payload.ohlcv[-payload.lookback :]
    pivots = detect_swings(points, window=2)
    patterns: list[PatternData] = []
    if len(pivots) >= 8:
        wave = pivots[-8:]
        impulse = wave[:5]
        correction = wave[5:]

        # Wave segment lengths
        w1 = abs(impulse[1].price - impulse[0].price)
        w2 = abs(impulse[2].price - impulse[1].price)
        w3 = abs(impulse[3].price - impulse[2].price)
        w4 = abs(impulse[4].price - impulse[3].price)
        impulse_span = abs(impulse[-1].price - impulse[0].price)
        correction_span = abs(correction[-1].price - correction[0].price)
        bullish = impulse[-1].price > impulse[0].price

        rules_passed: list[str] = []
        # R1: W2 retracement ≤ 100% of W1
        if w1 > 0 and w2 <= w1:
            rules_passed.append("R1_w2_retrace_valid")
        # R2: W3 > W1
        if w3 > w1:
            rules_passed.append("R2_w3_gt_w1")
        # R3: W3 > W4 (proxy: W3 longest of visible waves)
        if w3 > w4:
            rules_passed.append("R3_w3_longest")
        # R4: W4 no W1 overlap
        if bullish:
            if impulse[3].kind == "low" and impulse[3].price > impulse[0].price:
                rules_passed.append("R4_w4_no_overlap")
        else:
            if impulse[3].kind == "high" and impulse[3].price < impulse[0].price:
                rules_passed.append("R4_w4_no_overlap")
        # R5: W3 ≥ 1.272× W1
        if w1 > 0 and w3 >= 1.272 * w1:
            rules_passed.append("R5_w3_fib_ext")
        # R6: Correction retraces 38.2–78.6% of full impulse
        if impulse_span > 0 and 0.382 <= correction_span / impulse_span <= 0.786:
            rules_passed.append("R6_correction_fib")

        direction: PatternDirection = "bullish" if bullish else "bearish"
        confidence = clamp(0.42 + len(rules_passed) * 0.07, 0.0, 1.0)

        fib_ratios: dict[str, float] = {}
        if w1 > 0:
            fib_ratios["w2_w1"] = round(w2 / w1, 4)
            fib_ratios["w3_w1"] = round(w3 / w1, 4)
        if impulse_span > 0:
            fib_ratios["correction_retrace"] = round(correction_span / impulse_span, 4)

        patterns.append(
            PatternData(
                type="elliott_5_3",
                direction=direction,
                start_time=wave[0].time,
                end_time=wave[-1].time,
                confidence=confidence,
                details={
                    "impulse_points": [pivot.time for pivot in impulse],
                    "correction_points": [pivot.time for pivot in correction],
                    "fibonacci_valid": len(rules_passed) >= 3,
                    "wave_lengths": {
                        "w1": round(w1, 4),
                        "w2": round(w2, 4),
                        "w3": round(w3, 4),
                        "w4": round(w4, 4),
                    },
                    "fib_ratios": fib_ratios,
                    "rules_passed": rules_passed,
                },
            )
        )
    return PatternResponse(
        patterns=patterns,
        metadata={"scanned_bars": len(points), "patterns_found": len(patterns)},
    )


def build_composite_signal(payload: CompositeSignalRequest) -> CompositeSignalResponse:
    points = payload.ohlcv
    frame = ohlcv_polars_frame(points)
    if frame is not None:
        dataframe_engine = "polars"
        close_series = [float(value) for value in frame.get_column("close").to_list()]
        volume_series = [float(value) for value in frame.get_column("volume").to_list()]
    else:
        dataframe_engine = "python"
        close_series = closes(points)
        volume_series = volumes(points)

    rust_slope = rust_composite_sma50_slope_norm(close_series)
    if rust_slope is not None:
        slope_value, slope_norm, _last_sma = rust_slope
        sma_engine = "rust"
    else:
        sma50 = sma(close_series, 50)
        slope_period = min(5, len(sma50) - 1)
        if slope_period <= 0:
            slope_value = 0.0
        else:
            slope_value = sma50[-1] - sma50[-1 - slope_period]
        slope_norm = slope_value / max(1e-9, abs(sma50[-1]))
        sma_engine = "python"
    sma_score = clamp(abs(slope_norm) * 180.0, 0.0, 1.0)
    sma_direction = "rising" if slope_value > 0 else "falling" if slope_value < 0 else "flat"

    heartbeat, heartbeat_details = heartbeat_score(points)
    heartbeat_details = {**heartbeat_details, "dataframeEngine": dataframe_engine}
    vol_period = min(20, len(volume_series))
    latest_vol = volume_series[-1] if volume_series else 0.0
    rust_batch = rust_calculate_indicators_batch(
        [point.time for point in points],
        [point.open for point in points],
        [point.high for point in points],
        [point.low for point in points],
        close_series,
        volume_series,
        ["rvol_20"],
    )
    rust_rvol_series = rust_batch.get("rvol_20") if rust_batch else None
    if rust_rvol_series and len(rust_rvol_series) == len(volume_series):
        latest_rvol = float(rust_rvol_series[-1])
        rvol_engine = "rust"
    else:
        avg_vol = mean(volume_series[-vol_period:]) if vol_period else 0.0
        latest_rvol = latest_vol / avg_vol if avg_vol else 1.0
        rvol_engine = "python"

    obv_values = obv(points)
    obv_slope = obv_values[-1] - obv_values[-min(5, len(obv_values))]
    obv_trend = "up" if obv_slope > 0 else "down" if obv_slope < 0 else "flat"
    cmf_values = cmf(points, period=min(20, len(points)))
    latest_cmf = cmf_values[-1] if cmf_values else 0.0

    volume_score = 0.0
    if latest_rvol >= payload.volumeSpikeThreshold:
        volume_score += 0.45
    if obv_slope > 0:
        volume_score += 0.3
    if latest_cmf > 0:
        volume_score += 0.25
    volume_score = clamp(volume_score, 0.0, 1.0)

    bullish = slope_value > 0 and heartbeat >= payload.heartbeatThreshold and volume_score >= 0.55
    bearish = slope_value < 0 and heartbeat >= payload.heartbeatThreshold and volume_score >= 0.55
    if bullish:
        signal: SignalDirection = "buy"
    elif bearish:
        signal = "sell"
    else:
        signal = "neutral"

    confidence = clamp((sma_score + heartbeat + volume_score) / 3.0, 0.0, 1.0)
    components = {
        "sma50_slope": CompositeComponent(
            score=sma_score,
            details={
                "value": round(slope_norm, 6),
                "direction": sma_direction,
                "raw": round(slope_value, 6),
                "engine": sma_engine,
                "dataframeEngine": dataframe_engine,
            },
        ),
        "heartbeat": CompositeComponent(score=heartbeat, details=heartbeat_details),
        "volume_power": CompositeComponent(
            score=volume_score,
            details={
                "rvol": round(latest_rvol, 4),
                "rvolEngine": rvol_engine,
                "obv_trend": obv_trend,
                "cmf": round(latest_cmf, 6),
                "dataframeEngine": dataframe_engine,
            },
        ),
    }

    return CompositeSignalResponse(
        signal=signal,
        confidence=confidence,
        components=components,
        timestamp=points[-1].time,
    )


def build_fibonacci_levels(payload: PatternRequest) -> FibonacciResponse:
    return fibonacci_levels(payload.ohlcv[-payload.lookback :])


def apply_chart_transform(payload: ChartTransformRequest) -> ChartTransformResponse:
    points = payload.ohlcv
    transformed: list[OHLCVPoint] = []
    if payload.transformType == "heikin_ashi":
        previous_open = points[0].open
        previous_close = points[0].close
        for point in points:
            ha_close = (point.open + point.high + point.low + point.close) / 4.0
            ha_open = (previous_open + previous_close) / 2.0
            ha_high = max(point.high, ha_open, ha_close)
            ha_low = min(point.low, ha_open, ha_close)
            transformed.append(
                OHLCVPoint(
                    time=point.time,
                    open=ha_open,
                    high=ha_high,
                    low=ha_low,
                    close=ha_close,
                    volume=point.volume,
                )
            )
            previous_open = ha_open
            previous_close = ha_close
    elif payload.transformType == "volume_candles":
        avg_volume = mean(volumes(points)) if points else 1.0
        for point in points:
            factor = point.volume / max(1e-9, avg_volume)
            spread = (point.high - point.low) * clamp(0.5 + factor, 0.5, 2.0)
            center = (point.high + point.low) / 2.0
            transformed.append(
                OHLCVPoint(
                    time=point.time,
                    open=center - spread * 0.25,
                    high=center + spread * 0.5,
                    low=center - spread * 0.5,
                    close=center + spread * 0.25,
                    volume=point.volume,
                )
            )
    elif payload.transformType == "carsi":
        close_series = closes(points)
        rsi_values = rsi(close_series, 14)
        for i, point in enumerate(points):
            value = rsi_values[i] / 100.0
            transformed.append(
                OHLCVPoint(
                    time=point.time,
                    open=value,
                    high=value,
                    low=value,
                    close=value,
                    volume=point.volume,
                )
            )
    else:
        transformed = points

    return ChartTransformResponse(
        data=transformed,
        metadata={"transform": payload.transformType, "points": len(transformed)},
    )


def build_strategy_metrics(payload: EvaluateStrategyRequest) -> StrategyEvaluationResponse:
    pnl_values: list[float] = []
    returns: list[float] = []
    wins: list[float] = []
    losses: list[float] = []
    for trade in payload.trades:
        gross = (trade.exit - trade.entry) * trade.quantity
        if trade.side == "short":
            gross = -gross
        pnl = gross - trade.fee
        pnl_values.append(pnl)
        base = trade.entry * trade.quantity
        returns.append(pnl / base if base else 0.0)
        if pnl >= 0:
            wins.append(pnl)
        else:
            losses.append(pnl)

    total = sum(pnl_values)
    count = len(payload.trades)
    hit_ratio = (len(wins) / count) if count else 0.0
    average_win = mean(wins) if wins else 0.0
    average_loss_abs = abs(mean(losses)) if losses else 0.0
    rr_ratio = (average_win / average_loss_abs) if average_loss_abs else 0.0
    expectancy = (hit_ratio * average_win) - ((1.0 - hit_ratio) * average_loss_abs)
    gross_profit = sum(wins)
    gross_loss = abs(sum(losses))
    profit_factor = (gross_profit / gross_loss) if gross_loss else (gross_profit if gross_profit > 0 else 0.0)

    if returns:
        avg_return = mean(returns)
        std_dev = pstdev(returns) if len(returns) > 1 else 0.0
        downside_values = [r for r in returns if r < 0]
        downside_std = pstdev(downside_values) if len(downside_values) > 1 else 0.0
        sharpe = ((avg_return - payload.riskFreeRate) / std_dev) if std_dev > 0 else 0.0
        sortino = ((avg_return - payload.riskFreeRate) / downside_std) if downside_std > 0 else 0.0
    else:
        sharpe = 0.0
        sortino = 0.0

    metrics = StrategyMetrics(
        net_return=total,
        hit_ratio=hit_ratio,
        risk_reward_ratio=rr_ratio,
        expectancy=expectancy,
        profit_factor=profit_factor,
        sharpe=sharpe,
        sortino=sortino,
        average_win=average_win,
        average_loss=-average_loss_abs,
    )
    return StrategyEvaluationResponse(metrics=metrics, tradeCount=count)


# ---------------------------------------------------------------------------
# Phase 7: Indicator Catalog Core
# ---------------------------------------------------------------------------


def bollinger_bands_raw(
    values: list[float], period: int, num_std: float = 2.0
) -> tuple[list[float], list[float], list[float]]:
    """Compute (upper, middle, lower) Bollinger Band series (sample std-dev, F3)."""
    upper: list[float] = []
    middle: list[float] = []
    lower: list[float] = []
    for i in range(len(values)):
        start = max(0, i - period + 1)
        window = values[start : i + 1]
        mid = mean(window)
        std = stdev(window) if len(window) > 1 else 0.0
        upper.append(mid + num_std * std)
        middle.append(mid)
        lower.append(mid - num_std * std)
    return upper, middle, lower


def e_bollinger_bands(
    values: list[float], period: int = 20, num_std: float = 2.0
) -> tuple[list[float], list[float], list[float]]:
    """EMA-based Bollinger Bands (upper, middle, lower).

    Uses EMA as the middle band instead of SMA to reduce lag.
    Required by the Red Rainbow indicator (Kaabar 2026).
    Std-dev is computed over a rolling `period` window (sample, F3).
    """
    mid = ema(values, period)
    upper: list[float] = []
    lower: list[float] = []
    for i in range(len(values)):
        start = max(0, i - period + 1)
        window = values[start : i + 1]
        std = stdev(window) if len(window) > 1 else 0.0
        upper.append(mid[i] + num_std * std)
        lower.append(mid[i] - num_std * std)
    return upper, mid, lower


def bollinger_bandwidth(values: list[float], period: int, num_std: float = 2.0) -> list[float]:
    """(upper - lower) / middle — normalised BB width."""
    upper, middle, lower = bollinger_bands_raw(values, period, num_std)
    return [
        (upper[i] - lower[i]) / middle[i] if middle[i] != 0.0 else 0.0
        for i in range(len(values))
    ]


def bollinger_percent_b(values: list[float], period: int, num_std: float = 2.0) -> list[float]:
    """(close - lower) / (upper - lower) — position within the BB."""
    upper, _, lower = bollinger_bands_raw(values, period, num_std)
    result: list[float] = []
    for i in range(len(values)):
        band_width = upper[i] - lower[i]
        result.append((values[i] - lower[i]) / band_width if band_width != 0.0 else 0.5)
    return result


def calculate_atr(points: list[OHLCVPoint], period: int = 14) -> list[float]:
    """Average True Range — max(H-L, |H-prevC|, |L-prevC|) smoothed via SMA. Rust-first."""
    rust_batch = rust_calculate_indicators_batch(
        [p.time for p in points],
        [p.open for p in points],
        [p.high for p in points],
        [p.low for p in points],
        closes(points),
        volumes(points),
        [f"atr_{period}"],
    )
    key = f"atr_{period}"
    if rust_batch and key in rust_batch and len(rust_batch[key]) == len(points):
        return [float(v) for v in rust_batch[key]]
    # Python fallback
    if len(points) < 2:
        return [0.0] * len(points)
    tr_values: list[float] = [0.0]
    for i in range(1, len(points)):
        h = points[i].high
        low_value = points[i].low
        prev_c = points[i - 1].close
        tr_values.append(max(h - low_value, abs(h - prev_c), abs(low_value - prev_c)))
    return sma(tr_values, period)


def calculate_swing_points(payload: SwingDetectRequest) -> SwingDetectResponse:
    pivots = detect_swings(payload.ohlcv, window=payload.window)
    swings = [
        SwingPoint(index=p.index, time=p.time, price=p.price, kind=p.kind)
        for p in pivots
    ]
    return SwingDetectResponse(
        swings=swings,
        metadata={"count": len(swings), "window": payload.window},
    )


def calculate_bb_bandwidth(payload: BollingerVariantRequest) -> IndicatorResponse:
    """Bollinger Bandwidth = (upper - lower) / middle. Rust-first when numStd==2.0."""
    series = closes(payload.ohlcv)
    bw: list[float] | None = None
    if payload.numStd == 2.0:
        rust_batch = rust_calculate_indicators_batch(
            [p.time for p in payload.ohlcv],
            [p.open for p in payload.ohlcv],
            [p.high for p in payload.ohlcv],
            [p.low for p in payload.ohlcv],
            series,
            volumes(payload.ohlcv),
            [f"bb_bw_{payload.period}"],
        )
        key = f"bb_bw_{payload.period}"
        if rust_batch and key in rust_batch and len(rust_batch[key]) == len(series):
            bw = [float(v) for v in rust_batch[key]]
    if bw is None:
        upper, middle, lower = bollinger_bands_raw(series, payload.period, payload.numStd)
        bw = [
            (upper[i] - lower[i]) / middle[i] if middle[i] != 0.0 else 0.0
            for i in range(len(series))
        ]
    return IndicatorResponse(
        data=[IndicatorPoint(time=point.time, value=bw[i]) for i, point in enumerate(payload.ohlcv)],
        metadata={"indicator": "BB_BANDWIDTH", "period": payload.period, "numStd": payload.numStd},
    )


def calculate_bb_percent_b(payload: BollingerVariantRequest) -> IndicatorResponse:
    """Bollinger %B = (close - lower) / (upper - lower). Rust-first when numStd==2.0."""
    series = closes(payload.ohlcv)
    result: list[float] | None = None
    if payload.numStd == 2.0:
        rust_batch = rust_calculate_indicators_batch(
            [p.time for p in payload.ohlcv],
            [p.open for p in payload.ohlcv],
            [p.high for p in payload.ohlcv],
            [p.low for p in payload.ohlcv],
            series,
            volumes(payload.ohlcv),
            [f"bb_pctb_{payload.period}"],
        )
        key = f"bb_pctb_{payload.period}"
        if rust_batch and key in rust_batch and len(rust_batch[key]) == len(series):
            result = [float(v) for v in rust_batch[key]]
    if result is None:
        upper, _, lower = bollinger_bands_raw(series, payload.period, payload.numStd)
        result = []
        for i in range(len(series)):
            band_width = upper[i] - lower[i]
            result.append((series[i] - lower[i]) / band_width if band_width != 0.0 else 0.5)
    return IndicatorResponse(
        data=[IndicatorPoint(time=point.time, value=result[i]) for i, point in enumerate(payload.ohlcv)],
        metadata={"indicator": "BB_PERCENT_B", "period": payload.period, "numStd": payload.numStd},
    )


def calculate_bollinger_keltner_squeeze(payload: BollingerSqueezeRequest) -> BollingerSqueezeResponse:
    """TTM Squeeze core: BB inside Keltner Channel = squeeze on; momentum histogram."""
    series = closes(payload.ohlcv)
    bb_upper, bb_mid, bb_lower = bollinger_bands_raw(series, payload.bbPeriod, payload.numStd)
    kc_mid = ema(series, payload.kcPeriod)
    atr_values = calculate_atr(payload.ohlcv, payload.kcPeriod)
    squeeze_list: list[bool] = []
    histogram: list[IndicatorPoint] = []
    for i, point in enumerate(payload.ohlcv):
        kc_upper = kc_mid[i] + payload.kcMult * atr_values[i]
        kc_lower = kc_mid[i] - payload.kcMult * atr_values[i]
        squeeze_list.append(bb_upper[i] <= kc_upper and bb_lower[i] >= kc_lower)
        momentum = series[i] - (bb_mid[i] + kc_mid[i]) / 2.0
        histogram.append(IndicatorPoint(time=point.time, value=momentum))
    return BollingerSqueezeResponse(
        squeeze=squeeze_list,
        histogram=histogram,
        metadata={
            "bbPeriod": payload.bbPeriod,
            "kcPeriod": payload.kcPeriod,
            "kcMult": payload.kcMult,
            "numStd": payload.numStd,
        },
    )


def calculate_atr_rsi(payload: RSIVariantRequest) -> IndicatorResponse:
    """ATR-adjusted RSI: gains/losses normalised by ATR for smoother volatile-market signal."""
    series = closes(payload.ohlcv)
    atr_values = calculate_atr(payload.ohlcv, payload.atrPeriod)
    if len(series) < 2:
        return IndicatorResponse(
            data=[IndicatorPoint(time=point.time, value=50.0) for point in payload.ohlcv],
            metadata={"indicator": "ATR_RSI", "rsiPeriod": payload.rsiPeriod, "atrPeriod": payload.atrPeriod},
        )
    gains: list[float] = [0.0]
    losses: list[float] = [0.0]
    for i in range(1, len(series)):
        delta = series[i] - series[i - 1]
        atr_norm = max(atr_values[i], 1e-9)
        gains.append(max(0.0, delta / atr_norm))
        losses.append(abs(min(0.0, delta / atr_norm)))
    avg_gain = sma(gains, payload.rsiPeriod)
    avg_loss = sma(losses, payload.rsiPeriod)
    result: list[IndicatorPoint] = []
    for i, point in enumerate(payload.ohlcv):
        g = avg_gain[i]
        lo = avg_loss[i]
        value = 100.0 if lo == 0.0 else 100.0 - (100.0 / (1.0 + g / lo))
        result.append(IndicatorPoint(time=point.time, value=clamp(value, 0.0, 100.0)))
    return IndicatorResponse(
        data=result,
        metadata={"indicator": "ATR_RSI", "rsiPeriod": payload.rsiPeriod, "atrPeriod": payload.atrPeriod},
    )


def calculate_bollinger_on_rsi(payload: BollingerVariantRequest) -> BollingerOnRSIResponse:
    """Apply Bollinger Bands to the RSI series (not to close prices)."""
    series = closes(payload.ohlcv)
    rsi_values = rsi(series, payload.period)
    bb_upper, bb_mid, bb_lower = bollinger_bands_raw(rsi_values, payload.period, payload.numStd)
    upper = [IndicatorPoint(time=point.time, value=bb_upper[i]) for i, point in enumerate(payload.ohlcv)]
    mid = [IndicatorPoint(time=point.time, value=bb_mid[i]) for i, point in enumerate(payload.ohlcv)]
    lower_out = [IndicatorPoint(time=point.time, value=bb_lower[i]) for i, point in enumerate(payload.ohlcv)]
    return BollingerOnRSIResponse(
        upper=upper,
        mid=mid,
        lower=lower_out,
        metadata={"indicator": "BB_RSI", "period": payload.period, "numStd": payload.numStd},
    )


def calculate_macd(payload: MACDRequest) -> MACDResponse:
    """MACD endpoint: line, signal, histogram. Book ref: mastering-finance-python.md L5264."""
    series = closes(payload.ohlcv)
    macd_line, signal_line, histogram = macd(series, payload.fast, payload.slow, payload.signal)
    pts = payload.ohlcv
    return MACDResponse(
        macd_line=[IndicatorPoint(time=pts[i].time, value=macd_line[i]) for i in range(len(pts))],
        signal_line=[IndicatorPoint(time=pts[i].time, value=signal_line[i]) for i in range(len(pts))],
        histogram=[IndicatorPoint(time=pts[i].time, value=histogram[i]) for i in range(len(pts))],
        metadata={"fast": payload.fast, "slow": payload.slow, "signal": payload.signal},
    )


def calculate_stochastic(payload: StochasticRequest) -> StochasticResponse:
    """Stochastic %K/%D endpoint."""
    k_vals, d_vals = stochastic(payload.ohlcv, payload.k_period, payload.d_period)
    pts = payload.ohlcv
    return StochasticResponse(
        k=[IndicatorPoint(time=pts[i].time, value=k_vals[i]) for i in range(len(pts))],
        d=[IndicatorPoint(time=pts[i].time, value=d_vals[i]) for i in range(len(pts))],
        metadata={"k_period": payload.k_period, "d_period": payload.d_period},
    )


def calculate_adx(payload: ADXRequest) -> ADXResponse:
    """ADX + DI+ + DI- endpoint."""
    adx_vals, dip_vals, dim_vals = adx_series(payload.ohlcv, payload.period)
    pts = payload.ohlcv
    return ADXResponse(
        adx=[IndicatorPoint(time=pts[i].time, value=adx_vals[i]) for i in range(len(pts))],
        di_plus=[IndicatorPoint(time=pts[i].time, value=dip_vals[i]) for i in range(len(pts))],
        di_minus=[IndicatorPoint(time=pts[i].time, value=dim_vals[i]) for i in range(len(pts))],
        metadata={"period": payload.period},
    )


def calculate_hma(payload: HMARequest) -> IndicatorResponse:
    """Hull MA endpoint."""
    series = closes(payload.ohlcv)
    hma_vals = hma(series, payload.period)
    return IndicatorResponse(
        data=[IndicatorPoint(time=payload.ohlcv[i].time, value=hma_vals[i]) for i in range(len(payload.ohlcv))],
        metadata={"indicator": "HMA", "period": payload.period},
    )


def calculate_vwap(payload: VWAPRequest) -> IndicatorResponse:
    """VWAP endpoint — cumulative, no daily reset."""
    vwap_vals = vwap(payload.ohlcv)
    return IndicatorResponse(
        data=[IndicatorPoint(time=payload.ohlcv[i].time, value=vwap_vals[i]) for i in range(len(payload.ohlcv))],
        metadata={"indicator": "VWAP"},
    )


def calculate_keltner(payload: KeltnerRequest) -> KeltnerResponse:
    """Keltner Channels endpoint."""
    upper, mid, lower = keltner_channels(payload.ohlcv, payload.ema_period, payload.atr_period, payload.multiplier)
    pts = payload.ohlcv
    return KeltnerResponse(
        upper=[IndicatorPoint(time=pts[i].time, value=upper[i]) for i in range(len(pts))],
        middle=[IndicatorPoint(time=pts[i].time, value=mid[i]) for i in range(len(pts))],
        lower=[IndicatorPoint(time=pts[i].time, value=lower[i]) for i in range(len(pts))],
        metadata={"ema_period": payload.ema_period, "atr_period": payload.atr_period, "multiplier": payload.multiplier},
    )


def _ichi_midpoint(highs: list[float], lows: list[float], period: int) -> list[float]:
    """Rolling (max+min)/2 — core Ichimoku primitive. Returns nan for warm-up bars."""
    n = len(highs)
    out: list[float] = []
    for i in range(n):
        if i < period - 1:
            out.append(float("nan"))
        else:
            h = max(highs[i - period + 1 : i + 1])
            lo = min(lows[i - period + 1 : i + 1])
            out.append((h + lo) / 2.0)
    return out


def calculate_ichimoku(payload: IchimokuRequest) -> IchimokuResponse:
    """Ichimoku Kinko Hyo — 5 lines + signal quality flags.

    Standard periods 9/26/52 (equities). Crypto-adjusted: pass tenkan=10, kijun=30, senkou_b=60.
    displacement must equal kijun_period for standard Ichimoku (default behaviour).

    Future cloud: the last `displacement` values of span_a/B are repeated into synthetic
    future IndicatorPoints (time extrapolated from the last known bar interval).
    Set include_future=False to omit those extra points.
    """
    pts = payload.ohlcv
    n = len(pts)
    if n < 2:
        empty: list[IndicatorPoint] = []
        return IchimokuResponse(
            tenkan=empty, kijun=empty, span_a=empty, span_b=empty, chikou=empty,
            signals=IchimokuSignals(
                above_cloud=[], below_cloud=[], in_cloud=[], bullish_cloud=[],
                tk_bull=[], tk_bear=[], chikou_bull=[], chikou_bear=[],
                chikou_above_cloud=[], chikou_below_cloud=[],
                kijun_cross_bull=[], kijun_cross_bear=[], strength=[],
            ),
            metadata={"indicator": "Ichimoku", "n": 0},
        )

    highs  = [p.high for p in pts]
    lows   = [p.low  for p in pts]
    closes = [p.close for p in pts]
    times  = [p.time  for p in pts]
    d = payload.displacement

    tenkan_raw = _ichi_midpoint(highs, lows, payload.tenkan_period)
    kijun_raw  = _ichi_midpoint(highs, lows, payload.kijun_period)
    span_b_raw = _ichi_midpoint(highs, lows, payload.senkou_b_period)

    # span_a_raw[i] = (tenkan[i] + kijun[i]) / 2  (before forward-displacement)
    span_a_raw: list[float] = []
    for i in range(n):
        tk = tenkan_raw[i]
        kj = kijun_raw[i]
        if tk != tk or kj != kj:  # nan check
            span_a_raw.append(float("nan"))
        else:
            span_a_raw.append((tk + kj) / 2.0)

    # Cloud lines are displaced forward by `d` bars:
    # span_a[i]  = span_a_raw[i - d]  (historical portion, nan for first d bars)
    # chikou[i]  = close[i + d]        (plotted d bars in the past → shift array back)
    span_a_hist: list[float] = [float("nan")] * d + span_a_raw[: n - d]
    span_b_hist: list[float] = [float("nan")] * d + span_b_raw[: n - d]
    chikou_vals: list[float] = closes[d:] + [float("nan")] * d

    # Future cloud: append d synthetic points extrapolating time from last known interval
    future_span_a: list[IndicatorPoint] = []
    future_span_b: list[IndicatorPoint] = []
    if payload.include_future and n >= 2:
        dt = times[-1] - times[-2]  # seconds per bar (or tick gap)
        for j in range(1, d + 1):
            future_t = times[-1] + dt * j
            sa = span_a_raw[n - d + j - 1] if (n - d + j - 1) >= 0 else float("nan")
            sb = span_b_raw[n - d + j - 1] if (n - d + j - 1) >= 0 else float("nan")
            future_span_a.append(IndicatorPoint(time=future_t, value=sa))
            future_span_b.append(IndicatorPoint(time=future_t, value=sb))

    def _pts(vals: list[float], ts: list[int]) -> list[IndicatorPoint]:
        return [IndicatorPoint(time=ts[i], value=vals[i]) for i in range(len(ts))]

    tenkan_pts = _pts(tenkan_raw, times)
    kijun_pts  = _pts(kijun_raw,  times)
    span_a_pts = _pts(span_a_hist, times) + future_span_a
    span_b_pts = _pts(span_b_hist, times) + future_span_b
    chikou_pts = _pts(chikou_vals, times)

    # Signals (historical bars only — no future rows)
    nan = float("nan")
    above_cloud:  list[bool] = []
    below_cloud:  list[bool] = []
    in_cloud_:    list[bool] = []
    bull_cloud:   list[bool] = []
    tk_bull_:     list[bool] = []
    tk_bear_:     list[bool] = []
    chikou_bull_: list[bool] = []
    chikou_bear_: list[bool] = []
    chikou_above_cloud_: list[bool] = []
    chikou_below_cloud_: list[bool] = []
    kj_cross_bull: list[bool] = []
    kj_cross_bear: list[bool] = []
    strength:     list[str]  = []

    for i in range(n):
        c    = closes[i]
        sa   = span_a_hist[i]
        sb   = span_b_hist[i]
        tk   = tenkan_raw[i]
        kj   = kijun_raw[i]

        cloud_valid = sa == sa and sb == sb  # not nan
        cloud_top    = max(sa, sb) if cloud_valid else nan
        cloud_bottom = min(sa, sb) if cloud_valid else nan

        _above = cloud_valid and c > cloud_top
        _below = cloud_valid and c < cloud_bottom
        _in    = cloud_valid and not _above and not _below

        _bull_cld = cloud_valid and sa > sb
        _bear_cld = cloud_valid and sa < sb

        # TK cross
        prev_tk = tenkan_raw[i - 1] if i > 0 else nan
        prev_kj = kijun_raw[i - 1]  if i > 0 else nan
        lines_valid = tk == tk and kj == kj and prev_tk == prev_tk and prev_kj == prev_kj
        _tk_bull = lines_valid and tk > kj and prev_tk <= prev_kj
        _tk_bear = lines_valid and tk < kj and prev_tk >= prev_kj

        # Chikou price cross: is close > close from d bars ago
        _chi_bull = i >= d and closes[i] > closes[i - d]
        _chi_bear = i >= d and closes[i] < closes[i - d]

        # Chikou vs cloud 26 bars ago: closes[i] compared to cloud at position i-d
        # (no look-ahead — chikou value IS closes[i], its chart position is i-d)
        if i >= d:
            sa_d = span_a_hist[i - d]
            sb_d = span_b_hist[i - d]
            cloud_d_valid = sa_d == sa_d and sb_d == sb_d
            cloud_top_d    = max(sa_d, sb_d) if cloud_d_valid else nan
            cloud_bottom_d = min(sa_d, sb_d) if cloud_d_valid else nan
            _chi_above_cloud = cloud_d_valid and c > cloud_top_d
            _chi_below_cloud = cloud_d_valid and c < cloud_bottom_d
        else:
            _chi_above_cloud = False
            _chi_below_cloud = False

        # Kijun cross
        prev_c = closes[i - 1] if i > 0 else nan
        kj_valid = kj == kj and prev_kj == prev_kj and prev_c == prev_c
        _kj_cbull = kj_valid and c > kj and prev_c <= prev_kj
        _kj_cbear = kj_valid and c < kj and prev_c >= prev_kj

        # Signal strength score
        bull_score = int(_above) + int(_bull_cld) + int(_tk_bull) + int(_chi_bull)
        bear_score = int(_below) + int(_bear_cld) + int(_tk_bear) + int(_chi_bear)
        if bull_score == 4:
            q = "strong_bull"
        elif bull_score == 3:
            q = "weak_bull"
        elif bear_score == 4:
            q = "strong_bear"
        elif bear_score == 3:
            q = "weak_bear"
        else:
            q = "neutral"

        above_cloud.append(_above)
        below_cloud.append(_below)
        in_cloud_.append(_in)
        bull_cloud.append(_bull_cld)
        tk_bull_.append(_tk_bull)
        tk_bear_.append(_tk_bear)
        chikou_bull_.append(_chi_bull)
        chikou_bear_.append(_chi_bear)
        chikou_above_cloud_.append(_chi_above_cloud)
        chikou_below_cloud_.append(_chi_below_cloud)
        kj_cross_bull.append(_kj_cbull)
        kj_cross_bear.append(_kj_cbear)
        strength.append(q)

    return IchimokuResponse(
        tenkan=tenkan_pts,
        kijun=kijun_pts,
        span_a=span_a_pts,
        span_b=span_b_pts,
        chikou=chikou_pts,
        signals=IchimokuSignals(
            above_cloud=above_cloud,
            below_cloud=below_cloud,
            in_cloud=in_cloud_,
            bullish_cloud=bull_cloud,
            tk_bull=tk_bull_,
            tk_bear=tk_bear_,
            chikou_bull=chikou_bull_,
            chikou_bear=chikou_bear_,
            chikou_above_cloud=chikou_above_cloud_,
            chikou_below_cloud=chikou_below_cloud_,
            kijun_cross_bull=kj_cross_bull,
            kijun_cross_bear=kj_cross_bear,
            strength=strength,
        ),
        metadata={
            "indicator": "Ichimoku",
            "tenkan_period": payload.tenkan_period,
            "kijun_period": payload.kijun_period,
            "senkou_b_period": payload.senkou_b_period,
            "displacement": d,
            "n": n,
        },
    )


def build_fibonacci_confluence(payload: FibonacciConfluenceRequest) -> FibonacciConfluenceResponse:
    """Detect Fibonacci level clusters across multiple swing pairs."""
    pivots = detect_swings(payload.ohlcv, window=4)
    ratios = [0.236, 0.382, 0.5, 0.618, 0.786, 1.0, 1.272, 1.618, 2.618]
    all_levels: list[FibonacciLevel] = []
    num_pairs = min(payload.numSwings, max(0, len(pivots) - 1))
    start_idx = max(0, len(pivots) - 1 - num_pairs)
    for i in range(start_idx, len(pivots) - 1):
        anchor_low = min(pivots[i].price, pivots[i + 1].price)
        anchor_high = max(pivots[i].price, pivots[i + 1].price)
        span = anchor_high - anchor_low
        for ratio in ratios:
            all_levels.append(FibonacciLevel(ratio=ratio, price=anchor_high - span * ratio))
    if not all_levels:
        return FibonacciConfluenceResponse(
            zones=[],
            metadata={"numSwings": payload.numSwings, "thresholdPct": payload.thresholdPct, "totalLevels": 0},
        )
    sorted_levels = sorted(all_levels, key=lambda lv: lv.price)
    zones: list[ConfluenceZone] = []
    i = 0
    while i < len(sorted_levels):
        cluster = [sorted_levels[i]]
        ref_price = sorted_levels[i].price
        j = i + 1
        while j < len(sorted_levels):
            price_diff = abs(sorted_levels[j].price - ref_price)
            if price_diff / max(abs(ref_price), 1e-9) <= payload.thresholdPct:
                cluster.append(sorted_levels[j])
                j += 1
            else:
                break
        if len(cluster) >= 2:
            center = mean([lv.price for lv in cluster])
            low_price = min(lv.price for lv in cluster)
            high_price = max(lv.price for lv in cluster)
            zones.append(
                ConfluenceZone(
                    priceCenter=center,
                    priceRange=(low_price, high_price),
                    levels=cluster,
                    strength=len(cluster),
                )
            )
        i = j if j > i + 1 else i + 1
    zones.sort(key=lambda z: z.strength, reverse=True)
    return FibonacciConfluenceResponse(
        zones=zones,
        metadata={
            "numSwings": payload.numSwings,
            "thresholdPct": payload.thresholdPct,
            "totalLevels": len(all_levels),
        },
    )


# ---------------------------------------------------------------------------
# Phase 15b: Volatility Suite
# ---------------------------------------------------------------------------
import math as _math  # noqa: E402


class VolatilitySuiteRequest(BaseModel):
    closes: list[float] = Field(min_length=10)
    lookback: int = Field(default=20, ge=5, le=500)


class VolatilitySuiteResponse(BaseModel):
    spike_weighted_vol: float
    volatility_index: float
    exp_weighted_stddev: float
    volatility_regime: str  # "elevated" | "normal" | "compressed"


def calculate_volatility_suite(req: VolatilitySuiteRequest) -> VolatilitySuiteResponse:
    """Compute spike-weighted vol, historical vol, EW stddev, and regime label."""
    c = req.closes
    returns = [
        _math.log(c[i] / c[i - 1])
        for i in range(1, len(c))
        if c[i - 1] > 0 and c[i] > 0
    ]
    if not returns:
        return VolatilitySuiteResponse(
            spike_weighted_vol=0.0,
            volatility_index=0.0,
            exp_weighted_stddev=0.0,
            volatility_regime="normal",
        )

    lb = min(req.lookback, len(returns))
    recent = returns[-lb:]

    # Historical volatility (annualised)
    mean_r = sum(recent) / len(recent)
    variance = sum((r - mean_r) ** 2 for r in recent) / max(len(recent) - 1, 1)
    hv = _math.sqrt(variance) * _math.sqrt(252)

    # EWMA stddev
    alpha = 2.0 / (req.lookback + 1)
    ewm_var = returns[0] ** 2
    for r in returns[1:]:
        ewm_var = alpha * r ** 2 + (1 - alpha) * ewm_var
    ewm_std = _math.sqrt(max(ewm_var, 0.0))

    # Spike-weighted vol (spikes counted double)
    overall_rms = _math.sqrt(sum(r ** 2 for r in returns) / len(returns))
    weights = [2.0 if abs(r) > 2 * overall_rms else 1.0 for r in recent]
    total_w = sum(weights)
    spike_vol = (
        _math.sqrt(sum(w * r ** 2 for w, r in zip(weights, recent)) / total_w) * _math.sqrt(252)
        if total_w > 0
        else 0.0
    )

    # Historical median of rolling HV for regime classification
    roll_hvs: list[float] = []
    for i in range(lb, len(returns) + 1):
        window = returns[max(0, i - lb): i]
        if len(window) < 2:
            continue
        m = sum(window) / len(window)
        v = sum((r - m) ** 2 for r in window) / max(len(window) - 1, 1)
        roll_hvs.append(_math.sqrt(v) * _math.sqrt(252))

    # Absolute thresholds (primary): catches uniformly high/low-vol series
    # Relative comparison (fallback): catches intra-series regime changes
    ELEVATED_ABS = 0.40   # > 40 % annualised HV → clearly elevated
    COMPRESSED_ABS = 0.05  # < 5 % annualised HV → clearly compressed
    hist_median = sorted(roll_hvs)[len(roll_hvs) // 2] if roll_hvs else hv
    if hv > ELEVATED_ABS:
        regime = "elevated"
    elif hv < COMPRESSED_ABS:
        regime = "compressed"
    elif hv > hist_median * 1.3:
        regime = "elevated"
    elif hv < hist_median * 0.7:
        regime = "compressed"
    else:
        regime = "normal"

    return VolatilitySuiteResponse(
        spike_weighted_vol=round(spike_vol, 6),
        volatility_index=round(hv, 6),
        exp_weighted_stddev=round(ewm_std, 6),
        volatility_regime=regime,
    )


# ---------------------------------------------------------------------------
# Phase 15c: Regime Detection — 3-tier (Rule-Based / Markov / HMM)
# ---------------------------------------------------------------------------


class RegimeDetectRequest(BaseModel):
    closes: list[float] = Field(min_length=20)
    lookback: int = Field(default=100, ge=20, le=1000)
    n_components: int = Field(default=3, ge=2, le=6)


class RegimeDetectResponse(BaseModel):
    current_regime: str  # "bullish" | "bearish" | "ranging"
    sma_slope: float
    adx: float
    confidence: float


class MarkovRegimeResponse(BaseModel):
    current_regime: str
    transition_probs: dict[str, float]
    expected_duration: float
    shift_probability: float
    stationary_distribution: dict[str, float]
    warning: str | None


class HMMRegimeResponse(BaseModel):
    n_components: int
    hidden_state: int
    state_labels: list[str]
    means: list[float]
    bic_score: float


def _compute_sma_simple(values: list[float], period: int) -> list[float]:
    out: list[float] = []
    running = 0.0
    for i, v in enumerate(values):
        running += v
        if i >= period:
            running -= values[i - period]
        out.append(running / min(period, i + 1))
    return out


def _compute_adx_from_closes(closes: list[float], period: int = 14) -> float:
    """ADX proxy using close prices as both high and low."""
    if len(closes) < period * 2 + 2:
        return 0.0

    tr_values: list[float] = []
    plus_dm: list[float] = []
    minus_dm: list[float] = []
    for i in range(1, len(closes)):
        tr = abs(closes[i] - closes[i - 1])
        pdm = max(closes[i] - closes[i - 1], 0.0)
        mdm = max(closes[i - 1] - closes[i], 0.0)
        if pdm > mdm:
            mdm = 0.0
        elif mdm > pdm:
            pdm = 0.0
        else:
            pdm = mdm = 0.0
        tr_values.append(tr)
        plus_dm.append(pdm)
        minus_dm.append(mdm)

    def _smooth(vals: list[float], p: int) -> list[float]:
        if not vals:
            return []
        result = [sum(vals[:p]) / p]
        for v in vals[p:]:
            result.append(result[-1] - result[-1] / p + v)
        return result

    atr_s = _smooth(tr_values, period)
    pdi_s = _smooth(plus_dm, period)
    mdi_s = _smooth(minus_dm, period)

    dx_vals: list[float] = []
    for a, p, m in zip(atr_s, pdi_s, mdi_s):
        if a == 0:
            dx_vals.append(0.0)
            continue
        pdi = 100 * p / a
        mdi = 100 * m / a
        denom = pdi + mdi
        dx_vals.append(100 * abs(pdi - mdi) / denom if denom else 0.0)

    adx_s = _smooth(dx_vals, period)
    return adx_s[-1] if adx_s else 0.0


def calculate_regime(req: RegimeDetectRequest) -> RegimeDetectResponse:
    """Tier-1: Rule-based regime using SMA slope + ADX proxy."""
    closes = req.closes
    n = len(closes)
    period = min(50, n - 1)
    sma_vals = _compute_sma_simple(closes, period)

    slope = 0.0
    if len(sma_vals) >= 6:
        ref = sma_vals[-6]
        if ref != 0:
            slope = (sma_vals[-1] - ref) / abs(ref)

    adx_val = _compute_adx_from_closes(closes[-min(200, n):], 14)

    if slope > 0.001 and adx_val > 25:
        regime = "bullish"
        confidence = min(1.0, 0.5 + slope * 50 + (adx_val - 25) / 100)
    elif slope < -0.001 and adx_val > 25:
        regime = "bearish"
        confidence = min(1.0, 0.5 + abs(slope) * 50 + (adx_val - 25) / 100)
    else:
        regime = "ranging"
        confidence = max(0.3, 1.0 - adx_val / 100)

    return RegimeDetectResponse(
        current_regime=regime,
        sma_slope=round(slope, 6),
        adx=round(adx_val, 4),
        confidence=round(clamp(confidence, 0.0, 1.0), 4),
    )


def calculate_markov_regime(req: RegimeDetectRequest) -> MarkovRegimeResponse:
    """Tier-2: Markov transition matrix from rolling rule-based regimes."""
    closes = req.closes
    step = max(1, len(closes) // req.lookback)
    segments = [closes[i: i + step + 1] for i in range(0, len(closes) - step, step)]

    labels: list[str] = []
    for seg in segments:
        if len(seg) < 20:
            continue
        mini = RegimeDetectRequest(closes=seg, lookback=max(20, len(seg)), n_components=req.n_components)
        labels.append(calculate_regime(mini).current_regime)

    states = ["bullish", "bearish", "ranging"]

    if not labels:
        uniform = {s: round(1.0 / 3, 4) for s in states}
        return MarkovRegimeResponse(
            current_regime="ranging",
            transition_probs=uniform,
            expected_duration=1.0,
            shift_probability=0.5,
            stationary_distribution=uniform,
            warning="insufficient data for Markov estimation",
        )

    counts: dict[str, dict[str, int]] = {s: {t: 0 for t in states} for s in states}
    for i in range(len(labels) - 1):
        from_s, to_s = labels[i], labels[i + 1]
        if from_s in counts and to_s in counts[from_s]:
            counts[from_s][to_s] += 1

    trans: dict[str, dict[str, float]] = {}
    for s in states:
        total = sum(counts[s].values())
        trans[s] = {t: counts[s][t] / total if total else 1.0 / 3 for t in states}

    current = labels[-1]
    p_same = trans[current].get(current, 1.0 / 3)
    expected_dur = 1.0 / (1.0 - p_same) if p_same < 1.0 else 999.0
    shift_prob = 1.0 - p_same

    # Stationary distribution via power iteration
    dist: dict[str, float] = {s: 1.0 / 3 for s in states}
    for _ in range(200):
        new_dist: dict[str, float] = {s: 0.0 for s in states}
        for s in states:
            for t in states:
                new_dist[t] += dist[s] * trans[s].get(t, 0.0)
        dist = new_dist

    return MarkovRegimeResponse(
        current_regime=current,
        transition_probs={t: round(trans[current].get(t, 0.0), 4) for t in states},
        expected_duration=round(expected_dur, 2),
        shift_probability=round(shift_prob, 4),
        stationary_distribution={s: round(dist[s], 4) for s in states},
        warning=None,
    )


def calculate_hmm_regime(req: RegimeDetectRequest) -> HMMRegimeResponse:
    """Tier-3: Gaussian HMM with BIC-optimal n_components."""
    try:
        from hmmlearn import hmm as _hmm  # noqa: PLC0415
    except ImportError:
        return HMMRegimeResponse(
            n_components=0,
            hidden_state=-1,
            state_labels=[],
            means=[],
            bic_score=float("inf"),
        )

    closes = req.closes
    returns_raw = [
        _math.log(closes[i] / closes[i - 1])
        for i in range(1, len(closes))
        if closes[i - 1] > 0
    ]
    if len(returns_raw) < 20:
        return HMMRegimeResponse(
            n_components=0,
            hidden_state=-1,
            state_labels=[],
            means=[],
            bic_score=float("inf"),
        )

    obs = [[r] for r in returns_raw]
    best_bic = float("inf")
    best_model = None
    best_n = 2
    max_n = min(req.n_components, max(2, len(returns_raw) // 20))

    for n in range(2, max_n + 1):
        try:
            model = _hmm.GaussianHMM(
                n_components=n, covariance_type="full", n_iter=100, random_state=42
            )
            model.fit(obs)
            log_lik = model.score(obs)
            n_params = n * n + n + n
            bic = -2 * log_lik + n_params * _math.log(len(returns_raw))
            if bic < best_bic:
                best_bic, best_model, best_n = bic, model, n
        except Exception:  # noqa: BLE001
            continue

    if best_model is None:
        return HMMRegimeResponse(
            n_components=0,
            hidden_state=-1,
            state_labels=[],
            means=[],
            bic_score=float("inf"),
        )

    current_state = int(best_model.predict(obs)[-1])
    raw_means = [float(best_model.means_[i][0]) for i in range(best_n)]
    label_pool = ["low_vol", "medium_vol", "high_vol", "very_high_vol", "extreme_vol", "ultra_vol"]
    state_labels = label_pool[:best_n]

    return HMMRegimeResponse(
        n_components=best_n,
        hidden_state=current_state,
        state_labels=state_labels,
        means=[round(m, 6) for m in raw_means],
        bic_score=round(best_bic, 4),
    )


# ---------------------------------------------------------------------------
# Phase 15d-15h + Phase 16 + Phase 20
# ---------------------------------------------------------------------------


class AlternativeBarsRequest(IndicatorServiceRequest):
    bucketSize: int = Field(default=20, ge=2, le=500)


class AlternativeBarsResponse(BaseModel):
    volume_bar_closes: list[float]
    dollar_bar_closes: list[float]
    tick_bar_closes: list[float]
    metadata: dict[str, Any]


class CUSUMRequest(BaseModel):
    closes: list[float] = Field(min_length=10)
    threshold: float = Field(default=0.02, ge=0.001, le=1.0)


class CUSUMResponse(BaseModel):
    break_indices: list[int]
    break_signals: list[str]
    cumulative_pos: float
    cumulative_neg: float


class MeanRevMomentumRequest(BaseModel):
    closes: list[float] = Field(min_length=30)


class MeanRevMomentumResponse(BaseModel):
    hurst: float
    adf_proxy_stat: float
    half_life: float
    classification: Literal["mean_reverting", "momentum", "random_walk"]


class PerformanceMetricsRequest(BaseModel):
    returns: list[float] = Field(min_length=2)
    riskFreeRate: float = 0.0


class PerformanceMetricsResponse(BaseModel):
    net_return: float
    hit_ratio: float
    profit_factor: float
    sharpe: float
    sortino: float
    max_drawdown: float


class SignalQualityChainRequest(BaseModel):
    labels: list[Literal["strong", "weak", "invalid"]] = Field(min_length=2)


class SignalQualityChainResponse(BaseModel):
    transition: dict[str, dict[str, float]]
    quality_score: float


class OrderFlowStateRequest(BaseModel):
    buy_volumes: list[float] = Field(min_length=3)
    sell_volumes: list[float] = Field(min_length=3)
    squeeze_threshold: float = Field(default=0.1, ge=0.01, le=1.0)


class OrderFlowStateResponse(BaseModel):
    states: list[Literal["accumulation", "distribution", "squeeze"]]
    dominant_state: Literal["accumulation", "distribution", "squeeze"]


class EvalBaselineRequest(BaseModel):
    closes: list[float] = Field(min_length=40)
    horizon: int = Field(default=10, ge=2, le=100)
    take_profit: float = Field(default=0.03, ge=0.005, le=0.5)
    stop_loss: float = Field(default=0.02, ge=0.005, le=0.5)


class EvalBaselineResponse(BaseModel):
    labels: list[Literal["tp", "sl", "timeout"]]
    hit_ratio: float
    expectancy: float
    regime: str
    precision_proxy: float
    recall_proxy: float
    f1_proxy: float


class BacktestRequest(BaseModel):
    closes: list[float] = Field(min_length=10)
    lookback: int = Field(default=10, ge=2, le=200)
    slippage_bps: float = Field(default=0.0, ge=0.0, le=500.0)
    commission_bps: float = Field(default=0.0, ge=0.0, le=500.0)


class BacktestResponse(BaseModel):
    strategy_returns: list[float]
    cumulative_return: float
    trade_count: int


class TripleBarrierRequest(BaseModel):
    closes: list[float] = Field(min_length=20)
    horizon: int = Field(default=10, ge=2, le=100)
    take_profit: float = Field(default=0.03, ge=0.005, le=0.5)
    stop_loss: float = Field(default=0.02, ge=0.005, le=0.5)


class TripleBarrierResponse(BaseModel):
    labels: list[Literal["tp", "sl", "timeout"]]
    tp_count: int
    sl_count: int
    timeout_count: int


class ParameterSensitivityRequest(BaseModel):
    closes: list[float] = Field(min_length=40)
    lookbacks: list[int] = Field(min_length=2)


class ParameterSensitivityResponse(BaseModel):
    by_lookback: dict[str, float]
    stability_score: float


class WalkForwardRequest(BaseModel):
    closes: list[float] = Field(min_length=60)
    train_window: int = Field(default=40, ge=20, le=1000)
    test_window: int = Field(default=10, ge=5, le=200)


class WalkForwardResponse(BaseModel):
    oos_scores: list[float]
    mean_oos_score: float
    stability_score: float


class DeflatedSharpeRequest(BaseModel):
    sharpe: float
    trials: int = Field(default=10, ge=1, le=10000)
    sample_length: int = Field(default=252, ge=20, le=100000)


class DeflatedSharpeResponse(BaseModel):
    deflated_sharpe: float
    pass_gate: bool


class EvalIndicatorRequest(BaseModel):
    closes: list[float] = Field(min_length=80)


class EvalIndicatorResponse(BaseModel):
    walk_forward: WalkForwardResponse
    baseline: EvalBaselineResponse
    deflated_sharpe: DeflatedSharpeResponse
    execution_realism_pass: bool
    gate_pass: bool


class FeatureEngineeringRequest(IndicatorServiceRequest):
    period: int = Field(default=14, ge=2, le=200)


class FeatureEngineeringResponse(BaseModel):
    features: list[dict[str, float]]
    feature_names: list[str]


class MLClassifySignalRequest(BaseModel):
    features: dict[str, float]


class MLClassifySignalResponse(BaseModel):
    label: Literal["buy", "sell", "hold"]
    score: float


class HybridFusionRequest(BaseModel):
    ml_score: float = Field(ge=0.0, le=1.0)
    rule_score: float = Field(ge=0.0, le=1.0)
    ml_weight: float = Field(default=0.6, ge=0.0, le=1.0)


class HybridFusionResponse(BaseModel):
    fused_score: float
    action: Literal["buy", "sell", "hold"]


class BiasMonitoringRequest(BaseModel):
    geographic_distribution: dict[str, int]
    regime_distribution: dict[str, int]
    agreement_rate: float = Field(ge=0.0, le=1.0)


class BiasMonitoringResponse(BaseModel):
    geographic_imbalance: float
    regime_imbalance: float
    agreement_rate: float
    alert: bool


class DarkPoolSignalRequest(BaseModel):
    lit_volume: float = Field(gt=0)
    dark_pool_volume: float = Field(ge=0)


class DarkPoolSignalResponse(BaseModel):
    dark_pool_ratio: float
    signal: Literal["accumulation", "distribution", "neutral"]
    confidence: float


class GEXProfileRequest(BaseModel):
    strikes: list[float] = Field(min_length=1)
    call_gamma: list[float] = Field(min_length=1)
    put_gamma: list[float] = Field(min_length=1)


class GEXProfileResponse(BaseModel):
    net_gex: list[float]
    call_wall: float
    put_wall: float


class ExpectedMoveRequest(BaseModel):
    spot: float = Field(gt=0)
    iv_annual: float = Field(ge=0.0, le=5.0)
    days: int = Field(default=7, ge=1, le=365)


class ExpectedMoveResponse(BaseModel):
    move_abs: float
    upper: float
    lower: float


class OptionLeg(BaseModel):
    kind: Literal["call", "put"]
    strike: float = Field(gt=0)
    premium: float = Field(ge=0)
    quantity: int = Field(default=1)


class OptionsCalculatorRequest(BaseModel):
    spot: float = Field(gt=0)
    legs: list[OptionLeg] = Field(min_length=1)
    underlying_qty: int = 100


class OptionsCalculatorResponse(BaseModel):
    max_profit: float
    max_loss: float
    breakevens: list[float]


class DeFiStressRequest(BaseModel):
    tvl_change_pct: float
    funding_rate: float
    open_interest_change_pct: float


class DeFiStressResponse(BaseModel):
    stress_score: float
    level: Literal["low", "medium", "high"]


class OracleCrossCheckRequest(BaseModel):
    web2_price: float = Field(gt=0)
    oracle_price: float = Field(gt=0)
    threshold_pct: float = Field(default=0.01, ge=0.001, le=0.2)


class OracleCrossCheckResponse(BaseModel):
    divergence_pct: float
    disagreement: bool
    severity: Literal["low", "medium", "high"]


def calculate_alternative_bars(req: AlternativeBarsRequest) -> AlternativeBarsResponse:
    bs = req.bucketSize
    pts = req.ohlcv
    if not pts:
        return AlternativeBarsResponse(volume_bar_closes=[], dollar_bar_closes=[], tick_bar_closes=[], metadata={"bucketSize": bs})

    vol_bars: list[float] = []
    dol_bars: list[float] = []
    tick_bars: list[float] = []

    vol_acc = 0.0
    dol_acc = 0.0
    vol_target = sum(p.volume for p in pts) / max(len(pts) / bs, 1.0)
    dol_target = sum(p.close * p.volume for p in pts) / max(len(pts) / bs, 1.0)

    for i, p in enumerate(pts):
        vol_acc += p.volume
        dol_acc += p.close * p.volume
        if vol_acc >= vol_target:
            vol_bars.append(p.close)
            vol_acc = 0.0
        if dol_acc >= dol_target:
            dol_bars.append(p.close)
            dol_acc = 0.0
        if (i + 1) % bs == 0:
            tick_bars.append(p.close)

    return AlternativeBarsResponse(
        volume_bar_closes=vol_bars,
        dollar_bar_closes=dol_bars,
        tick_bar_closes=tick_bars,
        metadata={"bucketSize": bs, "points": len(pts)},
    )


def calculate_cusum(req: CUSUMRequest) -> CUSUMResponse:
    closes = req.closes
    rets = [(closes[i] - closes[i - 1]) / closes[i - 1] for i in range(1, len(closes)) if closes[i - 1] != 0]
    if not rets:
        return CUSUMResponse(break_indices=[], break_signals=[], cumulative_pos=0.0, cumulative_neg=0.0)
    mean_r = sum(rets) / len(rets)
    s_pos = 0.0
    s_neg = 0.0
    idx: list[int] = []
    sig: list[str] = []
    for i, r in enumerate(rets, start=1):
        d = r - mean_r
        s_pos = max(0.0, s_pos + d)
        s_neg = min(0.0, s_neg + d)
        if s_pos > req.threshold:
            idx.append(i)
            sig.append("up_break")
            s_pos = 0.0
        if abs(s_neg) > req.threshold:
            idx.append(i)
            sig.append("down_break")
            s_neg = 0.0
    return CUSUMResponse(
        break_indices=idx,
        break_signals=sig,
        cumulative_pos=round(s_pos, 6),
        cumulative_neg=round(s_neg, 6),
    )


def _hurst_exponent(values: list[float]) -> float:
    if len(values) < 40:
        return 0.5
    lags = [2, 4, 8, 16]
    tau: list[float] = []
    x_log: list[float] = []
    for lag in lags:
        if lag >= len(values):
            continue
        diffs = [values[i] - values[i - lag] for i in range(lag, len(values))]
        sd = pstdev(diffs) if len(diffs) > 1 else 0.0
        if sd > 0:
            tau.append(sd)
            x_log.append(_math.log(lag))
    if len(tau) < 2:
        return 0.5
    y_log = [_math.log(t) for t in tau]
    x_mean = sum(x_log) / len(x_log)
    y_mean = sum(y_log) / len(y_log)
    denom = sum((x - x_mean) ** 2 for x in x_log)
    if denom == 0:
        return 0.5
    slope = sum((x - x_mean) * (y - y_mean) for x, y in zip(x_log, y_log)) / denom
    return float(clamp(slope, 0.0, 1.0))


def calculate_meanrev_momentum(req: MeanRevMomentumRequest) -> MeanRevMomentumResponse:
    c = req.closes
    x = c[:-1]
    y = c[1:]
    n = len(x)
    x_mean = sum(x) / n
    y_mean = sum(y) / n
    denom = sum((xi - x_mean) ** 2 for xi in x)
    phi = (sum((xi - x_mean) * (yi - y_mean) for xi, yi in zip(x, y)) / denom) if denom else 1.0
    adf_proxy = (phi - 1.0) * 100.0
    half_life = float(-_math.log(2) / _math.log(phi)) if 0 < phi < 1 else float("inf")
    hurst = _hurst_exponent(c)
    if hurst < 0.45 and phi < 0.99:
        cls: Literal["mean_reverting", "momentum", "random_walk"] = "mean_reverting"
    elif hurst > 0.55 and phi >= 0.99:
        cls = "momentum"
    else:
        cls = "random_walk"
    return MeanRevMomentumResponse(
        hurst=round(hurst, 6),
        adf_proxy_stat=round(adf_proxy, 6),
        half_life=round(half_life, 6) if _math.isfinite(half_life) else float("inf"),
        classification=cls,
    )


def calculate_performance_metrics(req: PerformanceMetricsRequest) -> PerformanceMetricsResponse:
    r = req.returns
    if not r:
        return PerformanceMetricsResponse(
            net_return=0.0,
            hit_ratio=0.0,
            profit_factor=0.0,
            sharpe=0.0,
            sortino=0.0,
            max_drawdown=0.0,
        )
    net = _math.prod(1.0 + x for x in r) - 1.0
    wins = [x for x in r if x > 0]
    losses = [x for x in r if x < 0]
    hit = len(wins) / len(r)
    gain = sum(wins) if wins else 0.0
    loss = abs(sum(losses)) if losses else 0.0
    pf = (gain / loss) if loss > 0 else float("inf")
    mean_r = sum(r) / len(r)
    stdev = pstdev(r) if len(r) > 1 else 0.0
    down = [x for x in r if x < 0]
    down_std = pstdev(down) if len(down) > 1 else 0.0
    rf_daily = req.riskFreeRate / 252.0
    sharpe = ((mean_r - rf_daily) / stdev * _math.sqrt(252.0)) if stdev > 0 else 0.0
    sortino = ((mean_r - rf_daily) / down_std * _math.sqrt(252.0)) if down_std > 0 else 0.0
    eq = 1.0
    peak = 1.0
    max_dd = 0.0
    for x in r:
        eq *= 1.0 + x
        peak = max(peak, eq)
        dd = (eq - peak) / peak if peak > 0 else 0.0
        max_dd = min(max_dd, dd)
    return PerformanceMetricsResponse(
        net_return=round(net, 6),
        hit_ratio=round(hit, 6),
        profit_factor=round(pf, 6) if _math.isfinite(pf) else float("inf"),
        sharpe=round(sharpe, 6),
        sortino=round(sortino, 6),
        max_drawdown=round(max_dd, 6),
    )


def calculate_signal_quality_chain(req: SignalQualityChainRequest) -> SignalQualityChainResponse:
    states = ["strong", "weak", "invalid"]
    counts: dict[str, dict[str, int]] = {s: {t: 0 for t in states} for s in states}
    for i in range(len(req.labels) - 1):
        counts[req.labels[i]][req.labels[i + 1]] += 1
    trans: dict[str, dict[str, float]] = {}
    for s in states:
        total = sum(counts[s].values())
        trans[s] = {t: (counts[s][t] / total if total else 1.0 / 3.0) for t in states}
    quality = trans["strong"]["strong"] - trans["strong"]["invalid"]
    return SignalQualityChainResponse(transition=trans, quality_score=round(quality, 6))


def calculate_order_flow_state(req: OrderFlowStateRequest) -> OrderFlowStateResponse:
    n = min(len(req.buy_volumes), len(req.sell_volumes))
    states: list[Literal["accumulation", "distribution", "squeeze"]] = []
    for i in range(n):
        buy = req.buy_volumes[i]
        sell = req.sell_volumes[i]
        total = buy + sell
        if total <= 0:
            states.append("squeeze")
            continue
        imbalance = (buy - sell) / total
        if abs(imbalance) < req.squeeze_threshold:
            states.append("squeeze")
        elif imbalance > 0:
            states.append("accumulation")
        else:
            states.append("distribution")
    dominant = max(("accumulation", "distribution", "squeeze"), key=states.count) if states else "squeeze"
    return OrderFlowStateResponse(states=states, dominant_state=dominant)


def _triple_barrier_labels(closes: list[float], horizon: int, tp: float, sl: float) -> list[Literal["tp", "sl", "timeout"]]:
    labels: list[Literal["tp", "sl", "timeout"]] = []
    for i in range(0, len(closes) - horizon):
        entry = closes[i]
        up = entry * (1.0 + tp)
        dn = entry * (1.0 - sl)
        label: Literal["tp", "sl", "timeout"] = "timeout"
        for j in range(i + 1, i + horizon + 1):
            px = closes[j]
            if px >= up:
                label = "tp"
                break
            if px <= dn:
                label = "sl"
                break
        labels.append(label)
    return labels


def calculate_eval_baseline(req: EvalBaselineRequest) -> EvalBaselineResponse:
    labels = _triple_barrier_labels(req.closes, req.horizon, req.take_profit, req.stop_loss)
    if not labels:
        return EvalBaselineResponse(
            labels=[],
            hit_ratio=0.0,
            expectancy=0.0,
            regime="ranging",
            precision_proxy=0.0,
            recall_proxy=0.0,
            f1_proxy=0.0,
        )
    tp = sum(1 for x in labels if x == "tp")
    sl = sum(1 for x in labels if x == "sl")
    timeout = len(labels) - tp - sl
    hit = tp / len(labels)
    expectancy = (tp * req.take_profit - sl * req.stop_loss) / len(labels)
    precision = tp / max(tp + sl, 1)
    recall = tp / max(tp + timeout, 1)
    f1 = (2 * precision * recall / (precision + recall)) if (precision + recall) > 0 else 0.0
    regime = calculate_regime(RegimeDetectRequest(closes=req.closes, lookback=min(100, len(req.closes)))).current_regime
    return EvalBaselineResponse(
        labels=labels,
        hit_ratio=round(hit, 6),
        expectancy=round(expectancy, 6),
        regime=regime,
        precision_proxy=round(precision, 6),
        recall_proxy=round(recall, 6),
        f1_proxy=round(f1, 6),
    )


def run_backtest(req: BacktestRequest) -> BacktestResponse:
    c = req.closes
    ma = sma(c, req.lookback)
    rets: list[float] = []
    in_pos = False
    cost = (req.slippage_bps + req.commission_bps) / 10_000.0
    for i in range(1, len(c)):
        if c[i - 1] > ma[i - 1]:
            in_pos = True
        elif c[i - 1] < ma[i - 1]:
            in_pos = False
        if in_pos and c[i - 1] != 0:
            gross = (c[i] - c[i - 1]) / c[i - 1]
            rets.append(gross - cost)
        else:
            rets.append(0.0)
    cum = _math.prod(1.0 + r for r in rets) - 1.0 if rets else 0.0
    trades = sum(1 for i in range(1, len(c)) if (c[i - 1] > ma[i - 1]) != (c[i - 2] > ma[i - 2])) if len(c) > 2 else 0
    return BacktestResponse(strategy_returns=rets, cumulative_return=round(cum, 6), trade_count=trades)


def calculate_triple_barrier(req: TripleBarrierRequest) -> TripleBarrierResponse:
    labels = _triple_barrier_labels(req.closes, req.horizon, req.take_profit, req.stop_loss)
    tp = sum(1 for x in labels if x == "tp")
    sl = sum(1 for x in labels if x == "sl")
    timeout = len(labels) - tp - sl
    return TripleBarrierResponse(labels=labels, tp_count=tp, sl_count=sl, timeout_count=timeout)


def run_parameter_sensitivity(req: ParameterSensitivityRequest) -> ParameterSensitivityResponse:
    results: dict[str, float] = {}
    vals: list[float] = []
    for lb in req.lookbacks:
        if lb < 2:
            continue
        bt = run_backtest(BacktestRequest(closes=req.closes, lookback=lb))
        results[str(lb)] = bt.cumulative_return
        vals.append(bt.cumulative_return)
    if not vals:
        return ParameterSensitivityResponse(by_lookback={}, stability_score=0.0)
    st = pstdev(vals) if len(vals) > 1 else 0.0
    stability = 1.0 / (1.0 + st)
    return ParameterSensitivityResponse(
        by_lookback={k: round(v, 6) for k, v in results.items()},
        stability_score=round(stability, 6),
    )


def run_walk_forward(req: WalkForwardRequest) -> WalkForwardResponse:
    c = req.closes
    tw = req.train_window
    vw = req.test_window
    scores: list[float] = []
    i = 0
    while i + tw + vw <= len(c):
        train = c[i : i + tw]
        test = c[i + tw : i + tw + vw]
        train_bt = run_backtest(BacktestRequest(closes=train, lookback=min(10, max(2, tw // 4))))
        test_bt = run_backtest(BacktestRequest(closes=test, lookback=min(10, max(2, vw // 3))))
        base = abs(train_bt.cumulative_return) + 1e-9
        scores.append(test_bt.cumulative_return / base)
        i += vw
    if not scores:
        return WalkForwardResponse(oos_scores=[], mean_oos_score=0.0, stability_score=0.0)
    mean_score = sum(scores) / len(scores)
    st = pstdev(scores) if len(scores) > 1 else 0.0
    stability = 1.0 / (1.0 + st)
    return WalkForwardResponse(
        oos_scores=[round(s, 6) for s in scores],
        mean_oos_score=round(mean_score, 6),
        stability_score=round(stability, 6),
    )


def calculate_deflated_sharpe(req: DeflatedSharpeRequest) -> DeflatedSharpeResponse:
    penalty = _math.sqrt(2.0 * _math.log(max(req.trials, 1)) / max(req.sample_length, 1))
    ds = req.sharpe - penalty
    return DeflatedSharpeResponse(deflated_sharpe=round(ds, 6), pass_gate=ds > 0.0)


def evaluate_indicator(req: EvalIndicatorRequest) -> EvalIndicatorResponse:
    wf = run_walk_forward(
        WalkForwardRequest(
            closes=req.closes,
            train_window=min(60, max(20, len(req.closes) // 2)),
            test_window=min(20, max(5, len(req.closes) // 6)),
        )
    )
    baseline = calculate_eval_baseline(EvalBaselineRequest(closes=req.closes))
    bt = run_backtest(BacktestRequest(closes=req.closes, lookback=10))
    pm = calculate_performance_metrics(PerformanceMetricsRequest(returns=bt.strategy_returns))
    ds = calculate_deflated_sharpe(DeflatedSharpeRequest(sharpe=pm.sharpe, trials=20, sample_length=len(bt.strategy_returns)))
    execution_realism_pass = pm.max_drawdown > -0.6 and pm.profit_factor >= 0.8
    gate_pass = ds.pass_gate and execution_realism_pass and wf.stability_score > 0.3
    return EvalIndicatorResponse(
        walk_forward=wf,
        baseline=baseline,
        deflated_sharpe=ds,
        execution_realism_pass=execution_realism_pass,
        gate_pass=gate_pass,
    )


def build_features(req: FeatureEngineeringRequest) -> FeatureEngineeringResponse:
    cs = closes(req.ohlcv)
    vs = volumes(req.ohlcv)
    if not cs:
        return FeatureEngineeringResponse(features=[], feature_names=["ret", "sma_dev", "rsi", "vol_ratio"])
    sma_vals = sma(cs, req.period)
    rsi_vals = rsi(cs, req.period)
    vol_sma = sma(vs, req.period) if vs else [1.0 for _ in cs]
    feats: list[dict[str, float]] = []
    for i in range(1, len(cs)):
        prev = cs[i - 1]
        ret = (cs[i] - prev) / prev if prev != 0 else 0.0
        sma_dev = (cs[i] - sma_vals[i]) / sma_vals[i] if sma_vals[i] != 0 else 0.0
        vol_ratio = (vs[i] / vol_sma[i]) if vol_sma[i] != 0 else 1.0
        feats.append(
            {
                "ret": round(ret, 8),
                "sma_dev": round(sma_dev, 8),
                "rsi": round(rsi_vals[i], 8),
                "vol_ratio": round(vol_ratio, 8),
            }
        )
    return FeatureEngineeringResponse(features=feats, feature_names=["ret", "sma_dev", "rsi", "vol_ratio"])


def classify_signal(req: MLClassifySignalRequest) -> MLClassifySignalResponse:
    x = req.features
    score = (
        0.35 * x.get("ret", 0.0)
        + 0.25 * x.get("sma_dev", 0.0)
        + 0.20 * ((x.get("rsi", 50.0) - 50.0) / 50.0)
        + 0.20 * (x.get("vol_ratio", 1.0) - 1.0)
    )
    prob = 1.0 / (1.0 + _math.exp(-5.0 * score))
    if prob > 0.58:
        label: Literal["buy", "sell", "hold"] = "buy"
    elif prob < 0.42:
        label = "sell"
    else:
        label = "hold"
    return MLClassifySignalResponse(label=label, score=round(prob, 6))


def fuse_hybrid(req: HybridFusionRequest) -> HybridFusionResponse:
    fused = req.ml_weight * req.ml_score + (1.0 - req.ml_weight) * req.rule_score
    if fused > 0.58:
        action: Literal["buy", "sell", "hold"] = "buy"
    elif fused < 0.42:
        action = "sell"
    else:
        action = "hold"
    return HybridFusionResponse(fused_score=round(fused, 6), action=action)


def monitor_bias(req: BiasMonitoringRequest) -> BiasMonitoringResponse:
    def _imbalance(d: dict[str, int]) -> float:
        vals = [v for v in d.values() if v >= 0]
        if not vals:
            return 0.0
        total = sum(vals)
        if total == 0:
            return 0.0
        shares = [v / total for v in vals]
        return max(shares) - min(shares) if len(shares) > 1 else shares[0]

    geo = _imbalance(req.geographic_distribution)
    reg = _imbalance(req.regime_distribution)
    alert = geo > 0.45 or reg > 0.45 or req.agreement_rate < 0.35
    return BiasMonitoringResponse(
        geographic_imbalance=round(geo, 6),
        regime_imbalance=round(reg, 6),
        agreement_rate=round(req.agreement_rate, 6),
        alert=alert,
    )


def calculate_dark_pool_signal(req: DarkPoolSignalRequest) -> DarkPoolSignalResponse:
    total = req.lit_volume + req.dark_pool_volume
    ratio = req.dark_pool_volume / total if total > 0 else 0.0
    if ratio > 0.45:
        signal: Literal["accumulation", "distribution", "neutral"] = "accumulation"
    elif ratio < 0.15:
        signal = "distribution"
    else:
        signal = "neutral"
    conf = min(1.0, abs(ratio - 0.30) / 0.30)
    return DarkPoolSignalResponse(dark_pool_ratio=round(ratio, 6), signal=signal, confidence=round(conf, 6))


def calculate_gex_profile(req: GEXProfileRequest) -> GEXProfileResponse:
    n = min(len(req.strikes), len(req.call_gamma), len(req.put_gamma))
    strikes = req.strikes[:n]
    net = [req.call_gamma[i] - req.put_gamma[i] for i in range(n)]
    call_idx = max(range(n), key=lambda i: req.call_gamma[i])
    put_idx = max(range(n), key=lambda i: req.put_gamma[i])
    return GEXProfileResponse(
        net_gex=[round(x, 6) for x in net],
        call_wall=round(strikes[call_idx], 6),
        put_wall=round(strikes[put_idx], 6),
    )


def calculate_expected_move(req: ExpectedMoveRequest) -> ExpectedMoveResponse:
    t = req.days / 365.0
    move = req.spot * req.iv_annual * _math.sqrt(t)
    return ExpectedMoveResponse(
        move_abs=round(move, 6),
        upper=round(req.spot + move, 6),
        lower=round(max(0.0, req.spot - move), 6),
    )


def calculate_options_payoff(req: OptionsCalculatorRequest) -> OptionsCalculatorResponse:
    # Evaluate payoff on coarse grid to estimate max profit/loss and breakevens.
    min_s = min(leg.strike for leg in req.legs) * 0.2
    max_s = max(leg.strike for leg in req.legs) * 2.0
    grid = [min_s + i * (max_s - min_s) / 200 for i in range(201)]
    payoffs: list[float] = []
    for s in grid:
        total = 0.0
        for leg in req.legs:
            if leg.kind == "call":
                intrinsic = max(0.0, s - leg.strike)
            else:
                intrinsic = max(0.0, leg.strike - s)
            total += (intrinsic - leg.premium) * leg.quantity * req.underlying_qty
        payoffs.append(total)
    max_profit = max(payoffs)
    max_loss = min(payoffs)
    breakevens: list[float] = []
    for i in range(1, len(grid)):
        if payoffs[i - 1] == 0:
            breakevens.append(grid[i - 1])
        elif payoffs[i] == 0 or (payoffs[i - 1] < 0 < payoffs[i]) or (payoffs[i - 1] > 0 > payoffs[i]):
            breakevens.append(grid[i])
    return OptionsCalculatorResponse(
        max_profit=round(max_profit, 6),
        max_loss=round(max_loss, 6),
        breakevens=[round(x, 6) for x in breakevens[:4]],
    )


def calculate_defi_stress(req: DeFiStressRequest) -> DeFiStressResponse:
    score = (
        0.4 * abs(req.tvl_change_pct)
        + 0.3 * abs(req.funding_rate) * 100.0
        + 0.3 * abs(req.open_interest_change_pct)
    )
    if score > 25:
        level: Literal["low", "medium", "high"] = "high"
    elif score > 10:
        level = "medium"
    else:
        level = "low"
    return DeFiStressResponse(stress_score=round(score, 6), level=level)


def calculate_oracle_crosscheck(req: OracleCrossCheckRequest) -> OracleCrossCheckResponse:
    div = abs(req.web2_price - req.oracle_price) / req.oracle_price
    disagreement = div > req.threshold_pct
    if div > req.threshold_pct * 3:
        sev: Literal["low", "medium", "high"] = "high"
    elif div > req.threshold_pct * 1.5:
        sev = "medium"
    else:
        sev = "low"
    return OracleCrossCheckResponse(
        divergence_pct=round(div, 6),
        disagreement=disagreement,
        severity=sev,
    )
