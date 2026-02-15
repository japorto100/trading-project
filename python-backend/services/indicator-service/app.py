from __future__ import annotations

from pathlib import Path
from typing import Any
import sys

PYTHON_BACKEND_ROOT = Path(__file__).resolve().parents[2]
if str(PYTHON_BACKEND_ROOT) not in sys.path:
    sys.path.append(str(PYTHON_BACKEND_ROOT))

from services._shared import create_service_app  # noqa: E402
from ml_ai.indicator_engine.pipeline import (  # noqa: E402
    ChartTransformRequest,
    ChartTransformResponse,
    CompositeSignalRequest,
    CompositeSignalResponse,
    EvaluateStrategyRequest,
    ExoticMARequest,
    FibonacciResponse,
    KsCollectionRequest,
    PatternRequest,
    PatternResponse,
    StrategyEvaluationResponse,
    apply_chart_transform,
    build_composite_signal,
    build_elliott_wave_patterns,
    build_fibonacci_levels,
    build_harmonic_patterns,
    build_price_patterns,
    build_strategy_metrics,
    build_td_timing_patterns,
    build_candlestick_patterns,
    calculate_exotic_ma,
    calculate_ks_collection,
)


app = create_service_app("indicator-service")


@app.get("/health")
def health() -> dict[str, Any]:
    return {"ok": True}


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
