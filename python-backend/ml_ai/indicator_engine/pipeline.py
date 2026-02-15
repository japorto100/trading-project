from __future__ import annotations

from dataclasses import dataclass
from math import exp
from statistics import mean, pstdev
from typing import Any, Literal

from pydantic import BaseModel, Field


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


@dataclass(frozen=True)
class Pivot:
    index: int
    time: int
    price: float
    kind: Literal["high", "low"]


def clamp(value: float, lower: float, upper: float) -> float:
    return max(lower, min(upper, value))


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
    for g, l in zip(avg_gain, avg_loss):
        if l == 0:
            output.append(100.0)
        else:
            rs = g / l
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
        local_high = max(highs_data[i - window : i + window + 1])
        local_low = min(lows_data[i - window : i + window + 1])
        if highs_data[i] == local_high:
            output.append(Pivot(index=i, time=points[i].time, price=points[i].high, kind="high"))
        elif lows_data[i] == local_low:
            output.append(Pivot(index=i, time=points[i].time, price=points[i].low, kind="low"))

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
    ratios = [0.236, 0.382, 0.5, 0.618, 0.786, 1.0, 1.272, 1.618]
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
    pivots = detect_swings(points, window=2)
    if len(pivots) < 6:
        return 0.0, {"swings": len(pivots), "cycleBars": 0, "amplitudeStability": 0.0, "periodStability": 0.0}
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
        values = ema(series, payload.period)
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
    for i in range(1, len(points)):
        current = points[i]
        previous = points[i - 1]
        body = abs(current.close - current.open)
        range_size = max(1e-9, current.high - current.low)
        upper_wick = current.high - max(current.open, current.close)
        lower_wick = min(current.open, current.close) - current.low
        if body / range_size <= 0.15:
            patterns.append(
                PatternData(
                    type="doji",
                    direction="neutral",
                    start_time=current.time,
                    end_time=current.time,
                    confidence=0.64,
                    details={"body_ratio": round(body / range_size, 4)},
                )
            )
        if current.close > current.open and previous.close < previous.open:
            if current.close >= previous.open and current.open <= previous.close:
                patterns.append(
                    PatternData(
                        type="bullish_engulfing",
                        direction="bullish",
                        start_time=previous.time,
                        end_time=current.time,
                        confidence=0.69,
                    )
                )
        if current.close < current.open and previous.close > previous.open:
            if current.open >= previous.close and current.close <= previous.open:
                patterns.append(
                    PatternData(
                        type="bearish_engulfing",
                        direction="bearish",
                        start_time=previous.time,
                        end_time=current.time,
                        confidence=0.69,
                    )
                )
        if lower_wick > body * 2.0 and current.close > current.open:
            patterns.append(
                PatternData(
                    type="hammer",
                    direction="bullish",
                    start_time=current.time,
                    end_time=current.time,
                    confidence=0.62,
                )
            )
        if upper_wick > body * 2.0 and current.close < current.open:
            patterns.append(
                PatternData(
                    type="shooting_star",
                    direction="bearish",
                    start_time=current.time,
                    end_time=current.time,
                    confidence=0.62,
                )
            )
    return PatternResponse(
        patterns=patterns[:30],
        metadata={"scanned_bars": len(points), "patterns_found": len(patterns)},
    )


def build_harmonic_patterns(payload: PatternRequest) -> PatternResponse:
    points = payload.ohlcv[-payload.lookback :]
    pivots = detect_swings(points, window=3)
    patterns: list[PatternData] = []
    if len(pivots) >= 4:
        a, b, c, d = pivots[-4], pivots[-3], pivots[-2], pivots[-1]
        ab = abs(b.price - a.price)
        bc = abs(c.price - b.price)
        cd = abs(d.price - c.price)
        if ab > 0 and bc > 0:
            ratio_bc_ab = bc / ab
            ratio_cd_bc = cd / bc
            if 0.55 <= ratio_bc_ab <= 0.78 and 1.13 <= ratio_cd_bc <= 1.9:
                patterns.append(
                    PatternData(
                        type="abcd",
                        direction="bullish" if d.kind == "low" else "bearish",
                        start_time=a.time,
                        end_time=d.time,
                        confidence=0.74,
                        details={
                            "bc_ab": round(ratio_bc_ab, 4),
                            "cd_bc": round(ratio_cd_bc, 4),
                            "fibonacci_valid": True,
                        },
                    )
                )
            if 0.6 <= ratio_bc_ab <= 0.7 and 1.5 <= ratio_cd_bc <= 2.2:
                patterns.append(
                    PatternData(
                        type="gartley_like",
                        direction="bullish" if d.kind == "low" else "bearish",
                        start_time=a.time,
                        end_time=d.time,
                        confidence=0.67,
                        details={"bc_ab": round(ratio_bc_ab, 4), "cd_bc": round(ratio_cd_bc, 4)},
                    )
                )
    return PatternResponse(
        patterns=patterns,
        metadata={"scanned_bars": len(points), "patterns_found": len(patterns)},
    )


def build_td_timing_patterns(payload: PatternRequest) -> PatternResponse:
    points = payload.ohlcv[-payload.lookback :]
    closes_data = closes(points)
    bullish_count = 0
    bearish_count = 0
    patterns: list[PatternData] = []
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

        if bullish_count == 9:
            patterns.append(
                PatternData(
                    type="td_setup_9_bullish",
                    direction="bullish",
                    start_time=points[i - 8].time,
                    end_time=points[i].time,
                    confidence=0.73,
                )
            )
            bullish_count = 0
        if bearish_count == 9:
            patterns.append(
                PatternData(
                    type="td_setup_9_bearish",
                    direction="bearish",
                    start_time=points[i - 8].time,
                    end_time=points[i].time,
                    confidence=0.73,
                )
            )
            bearish_count = 0
    return PatternResponse(
        patterns=patterns,
        metadata={"scanned_bars": len(points), "patterns_found": len(patterns)},
    )


def build_price_patterns(payload: PatternRequest) -> PatternResponse:
    points = payload.ohlcv[-payload.lookback :]
    patterns: list[PatternData] = []
    pivots = detect_swings(points, window=3)
    if len(pivots) >= 3:
        p1, p2, p3 = pivots[-3], pivots[-2], pivots[-1]
        price_diff = abs(p3.price - p1.price) / max(1e-9, p1.price)
        if p1.kind == "high" and p3.kind == "high" and price_diff <= payload.threshold:
            patterns.append(
                PatternData(
                    type="double_top",
                    direction="bearish",
                    start_time=p1.time,
                    end_time=p3.time,
                    confidence=0.71,
                    details={"height_diff": round(price_diff, 4)},
                )
            )
        if p1.kind == "low" and p3.kind == "low" and price_diff <= payload.threshold:
            patterns.append(
                PatternData(
                    type="double_bottom",
                    direction="bullish",
                    start_time=p1.time,
                    end_time=p3.time,
                    confidence=0.71,
                    details={"depth_diff": round(price_diff, 4)},
                )
            )

    for i in range(1, len(points)):
        prev = points[i - 1]
        cur = points[i]
        if cur.low > prev.high * (1.0 + payload.threshold):
            patterns.append(
                PatternData(
                    type="gap_up",
                    direction="bullish",
                    start_time=prev.time,
                    end_time=cur.time,
                    confidence=0.58,
                )
            )
        if cur.high < prev.low * (1.0 - payload.threshold):
            patterns.append(
                PatternData(
                    type="gap_down",
                    direction="bearish",
                    start_time=prev.time,
                    end_time=cur.time,
                    confidence=0.58,
                )
            )

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
        impulse_span = abs(impulse[-1].price - impulse[0].price)
        correction_span = abs(correction[-1].price - correction[0].price)
        fib_valid = correction_span <= impulse_span * 0.786 if impulse_span > 0 else False
        direction: PatternDirection = "bullish" if impulse[-1].price > impulse[0].price else "bearish"
        confidence = 0.55 + (0.15 if fib_valid else 0.0)
        patterns.append(
            PatternData(
                type="elliott_5_3",
                direction=direction,
                start_time=wave[0].time,
                end_time=wave[-1].time,
                confidence=clamp(confidence, 0.0, 1.0),
                details={
                    "impulse_points": [pivot.time for pivot in impulse],
                    "correction_points": [pivot.time for pivot in correction],
                    "fibonacci_valid": fib_valid,
                },
            )
        )
    return PatternResponse(
        patterns=patterns,
        metadata={"scanned_bars": len(points), "patterns_found": len(patterns)},
    )


def build_composite_signal(payload: CompositeSignalRequest) -> CompositeSignalResponse:
    points = payload.ohlcv
    close_series = closes(points)
    sma50 = sma(close_series, 50)
    slope_period = min(5, len(sma50) - 1)
    if slope_period <= 0:
        slope_value = 0.0
    else:
        slope_value = sma50[-1] - sma50[-1 - slope_period]
    slope_norm = slope_value / max(1e-9, abs(sma50[-1]))
    sma_score = clamp(abs(slope_norm) * 180.0, 0.0, 1.0)
    sma_direction = "rising" if slope_value > 0 else "falling" if slope_value < 0 else "flat"

    heartbeat, heartbeat_details = heartbeat_score(points)
    volume_series = volumes(points)
    vol_period = min(20, len(volume_series))
    avg_vol = mean(volume_series[-vol_period:]) if vol_period else 0.0
    latest_vol = volume_series[-1] if volume_series else 0.0
    latest_rvol = latest_vol / avg_vol if avg_vol else 1.0

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
            details={"value": round(slope_norm, 6), "direction": sma_direction, "raw": round(slope_value, 6)},
        ),
        "heartbeat": CompositeComponent(score=heartbeat, details=heartbeat_details),
        "volume_power": CompositeComponent(
            score=volume_score,
            details={
                "rvol": round(latest_rvol, 4),
                "obv_trend": obv_trend,
                "cmf": round(latest_cmf, 6),
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
