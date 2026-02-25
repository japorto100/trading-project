from __future__ import annotations

from pathlib import Path
from typing import Any
import sys

PYTHON_BACKEND_ROOT = Path(__file__).resolve().parents[2]
if str(PYTHON_BACKEND_ROOT) not in sys.path:
    sys.path.append(str(PYTHON_BACKEND_ROOT))

from services._shared import create_service_app  # noqa: E402
from ml_ai.indicator_engine.pipeline import (  # noqa: E402
    BollingerOnRSIResponse,
    BollingerSqueezeRequest,
    BollingerSqueezeResponse,
    BollingerVariantRequest,
    ChartTransformRequest,
    ChartTransformResponse,
    CompositeSignalRequest,
    CompositeSignalResponse,
    ConfluenceZone,  # noqa: F401 — re-exported for schema inference
    EvaluateStrategyRequest,
    ExoticMARequest,
    FibonacciConfluenceRequest,
    FibonacciConfluenceResponse,
    FibonacciResponse,
    KsCollectionRequest,
    PatternRequest,
    PatternResponse,
    RSIVariantRequest,
    StrategyEvaluationResponse,
    SwingDetectRequest,
    SwingDetectResponse,
    apply_chart_transform,
    build_composite_signal,
    build_elliott_wave_patterns,
    build_fibonacci_confluence,
    build_fibonacci_levels,
    build_harmonic_patterns,
    build_price_patterns,
    build_strategy_metrics,
    build_td_timing_patterns,
    build_candlestick_patterns,
    calculate_atr_rsi,
    calculate_bb_bandwidth,
    calculate_bb_percent_b,
    calculate_bollinger_keltner_squeeze,
    calculate_bollinger_on_rsi,
    calculate_exotic_ma,
    calculate_ks_collection,
    calculate_swing_points,
    indicator_dataframe_status,
)
from ml_ai.indicator_engine.rust_bridge import rust_core_status  # noqa: E402
from ml_ai.indicator_engine.portfolio_analytics import (  # noqa: E402
    CorrelationRequest,
    DrawdownRequest,
    RollingMetricsRequest,
    compute_correlations,
    compute_drawdown_analysis,
    compute_rolling_metrics,
)


app = create_service_app("indicator-service")


@app.get("/health")
def health() -> dict[str, Any]:
    return {"ok": True, "rustCore": rust_core_status(), "dataframe": indicator_dataframe_status()}


@app.post("/api/v1/indicators/exotic-ma")
def indicators_exotic_ma(payload: ExoticMARequest):
    return calculate_exotic_ma(payload)


@app.post("/api/v1/indicators/ks-collection")
def indicators_ks_collection(payload: KsCollectionRequest):
    return calculate_ks_collection(payload)


@app.post("/api/v1/patterns/candlestick", response_model=PatternResponse)
def patterns_candlestick(payload: PatternRequest) -> PatternResponse:
    return build_candlestick_patterns(payload)


@app.post("/api/v1/patterns/harmonic", response_model=PatternResponse)
def patterns_harmonic(payload: PatternRequest) -> PatternResponse:
    return build_harmonic_patterns(payload)


@app.post("/api/v1/patterns/timing", response_model=PatternResponse)
def patterns_timing(payload: PatternRequest) -> PatternResponse:
    return build_td_timing_patterns(payload)


@app.post("/api/v1/patterns/price", response_model=PatternResponse)
def patterns_price(payload: PatternRequest) -> PatternResponse:
    return build_price_patterns(payload)


@app.post("/api/v1/patterns/elliott-wave", response_model=PatternResponse)
def patterns_elliott_wave(payload: PatternRequest) -> PatternResponse:
    return build_elliott_wave_patterns(payload)


@app.post("/api/v1/signals/composite", response_model=CompositeSignalResponse)
def signals_composite(payload: CompositeSignalRequest) -> CompositeSignalResponse:
    return build_composite_signal(payload)


@app.post("/api/v1/evaluate/strategy", response_model=StrategyEvaluationResponse)
def evaluate_strategy(payload: EvaluateStrategyRequest) -> StrategyEvaluationResponse:
    return build_strategy_metrics(payload)


@app.post("/api/v1/fibonacci/levels", response_model=FibonacciResponse)
def fibonacci_levels(payload: PatternRequest) -> FibonacciResponse:
    return build_fibonacci_levels(payload)


@app.post("/api/v1/charting/transform", response_model=ChartTransformResponse)
def charting_transform(payload: ChartTransformRequest) -> ChartTransformResponse:
    return apply_chart_transform(payload)


# Phase 5b: Portfolio Analytics
@app.post("/api/v1/portfolio/correlations")
def portfolio_correlations(payload: CorrelationRequest):
    return compute_correlations(payload)


@app.post("/api/v1/portfolio/rolling-metrics")
def portfolio_rolling_metrics(payload: RollingMetricsRequest):
    return compute_rolling_metrics(payload)


@app.post("/api/v1/portfolio/drawdown-analysis")
def portfolio_drawdown_analysis(payload: DrawdownRequest):
    return compute_drawdown_analysis(payload)


# Phase 7a: Swing detect public API
@app.post("/api/v1/indicators/swings", response_model=SwingDetectResponse)
def indicators_swings(payload: SwingDetectRequest) -> SwingDetectResponse:
    return calculate_swing_points(payload)


# Phase 7c: Enhanced Bollinger variants
@app.post("/api/v1/indicators/bollinger/bandwidth")
def indic_bb_bandwidth(payload: BollingerVariantRequest):
    return calculate_bb_bandwidth(payload)


@app.post("/api/v1/indicators/bollinger/percent-b")
def indic_bb_percent_b(payload: BollingerVariantRequest):
    return calculate_bb_percent_b(payload)


@app.post("/api/v1/indicators/bollinger/squeeze", response_model=BollingerSqueezeResponse)
def indic_bb_squeeze(payload: BollingerSqueezeRequest) -> BollingerSqueezeResponse:
    return calculate_bollinger_keltner_squeeze(payload)


@app.post("/api/v1/indicators/rsi/atr-adjusted")
def indic_rsi_atr(payload: RSIVariantRequest):
    return calculate_atr_rsi(payload)


@app.post("/api/v1/indicators/rsi/bollinger", response_model=BollingerOnRSIResponse)
def indic_rsi_bollinger(payload: BollingerVariantRequest) -> BollingerOnRSIResponse:
    return calculate_bollinger_on_rsi(payload)


# Phase 7d: Fibonacci confluence
@app.post("/api/v1/fibonacci/confluence", response_model=FibonacciConfluenceResponse)
def fibonacci_confluence(payload: FibonacciConfluenceRequest) -> FibonacciConfluenceResponse:
    return build_fibonacci_confluence(payload)
