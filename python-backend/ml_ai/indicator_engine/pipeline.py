from __future__ import annotations

from dataclasses import dataclass
from math import exp
from statistics import mean, pstdev
from typing import Any, Literal, TypedDict

try:
    import polars as pl
except Exception:  # noqa: BLE001
    pl = None

from pydantic import BaseModel, Field
from ml_ai.indicator_engine.rust_bridge import (
    calculate_heartbeat as rust_calculate_heartbeat,
    calculate_indicators_batch as rust_calculate_indicators_batch,
)
from ml_ai.indicator_engine.rust_bridge import composite_sma50_slope_norm as rust_composite_sma50_slope_norm


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


def rsi(values: list[float], period: int = 14) -> list[float]:
    if len(values) < 2:
        return [50.0 for _ in values]
    gains: list[float] = [0.0]
    losses: list[float] = [0.0]
    for i in range(1, len(values)):
        delta = values[i] - values[i - 1]
        gains.append(max(0.0, delta))
        losses.append(abs(min(0.0, delta)))

    avg_gain = sma(gains, period)
    avg_loss = sma(losses, period)
    output: list[float] = []
    for gain_value, loss_value in zip(avg_gain, avg_loss):
        if loss_value == 0:
            output.append(100.0)
        else:
            rs = gain_value / loss_value
            output.append(100.0 - (100.0 / (1.0 + rs)))
    return output


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


def calculate_ks_collection(payload: KsCollectionRequest) -> dict[str, IndicatorResponse]:
    series = closes(payload.ohlcv)
    ema_fast = ema(series, max(2, payload.period // 2))
    ema_slow = ema(series, max(3, payload.period))
    rs = rsi(series, payload.period)
    rs2 = [min(100.0, max(0.0, (value * value) / 100.0)) for value in rs]
    atr_like = [abs(payload.ohlcv[i].high - payload.ohlcv[i].low) for i in range(len(payload.ohlcv))]
    atr_smoothed = sma(atr_like, payload.period)
    marsi = [clamp((rs[i] + rs2[i]) / 2.0, 0.0, 100.0) for i in range(len(rs))]
    fib_base = fibonacci_levels(payload.ohlcv)
    fib_anchor = fib_base.levels[3].price if fib_base.levels else series[-1]
    fib_ma = [((close + fib_anchor) / 2.0) for close in series]
    reversal_i = [ema_fast[i] - ema_slow[i] for i in range(len(series))]
    reversal_ii = [reversal_i[i] - (atr_smoothed[i] * 0.1) for i in range(len(series))]
    atr_adjusted_rsi = [clamp(rs[i] - atr_smoothed[i] * 0.05, 0.0, 100.0) for i in range(len(series))]

    def to_response(name: str, values: list[float]) -> IndicatorResponse:
        return IndicatorResponse(
            data=[IndicatorPoint(time=point.time, value=values[i]) for i, point in enumerate(payload.ohlcv)],
            metadata={"indicator": name, "period": payload.period, "points": len(values)},
        )

    return {
        "reversalI": to_response("K_REVERSAL_I", reversal_i),
        "reversalII": to_response("K_REVERSAL_II", reversal_ii),
        "atrAdjustedRSI": to_response("K_ATR_RSI", atr_adjusted_rsi),
        "rsiSquared": to_response("K_RSI_SQUARED", rs2),
        "marsi": to_response("K_MARSI", marsi),
        "fibonacciMA": to_response("K_FIB_MA", fib_ma),
    }


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
    """Compute (upper, middle, lower) Bollinger Band series (population std-dev)."""
    upper: list[float] = []
    middle: list[float] = []
    lower: list[float] = []
    for i in range(len(values)):
        start = max(0, i - period + 1)
        window = values[start : i + 1]
        mid = mean(window)
        std = pstdev(window) if len(window) > 1 else 0.0
        upper.append(mid + num_std * std)
        middle.append(mid)
        lower.append(mid - num_std * std)
    return upper, middle, lower


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
