from __future__ import annotations

import math

from indicator_engine.pipeline import (
    AlternativeBarsRequest,
    BacktestRequest,
    CUSUMRequest,
    DeflatedSharpeRequest,
    EvalBaselineRequest,
    EvalIndicatorRequest,
    FeatureEngineeringRequest,
    HybridFusionRequest,
    MeanRevMomentumRequest,
    MLClassifySignalRequest,
    OHLCVPoint,
    OrderFlowStateRequest,
    PerformanceMetricsRequest,
    SignalQualityChainRequest,
    WalkForwardRequest,
    ParameterSensitivityRequest,
    TripleBarrierRequest,
    build_features,
    calculate_alternative_bars,
    calculate_cusum,
    calculate_deflated_sharpe,
    calculate_eval_baseline,
    calculate_meanrev_momentum,
    calculate_order_flow_state,
    calculate_performance_metrics,
    calculate_signal_quality_chain,
    classify_signal,
    evaluate_indicator,
    fuse_hybrid,
    monitor_bias,
    run_backtest,
    run_walk_forward,
    run_parameter_sensitivity,
    calculate_triple_barrier,
    BiasMonitoringRequest,
)


def _ohlcv(n: int = 120, base: float = 100.0, step: float = 0.2) -> list[OHLCVPoint]:
    out: list[OHLCVPoint] = []
    p = base
    for i in range(n):
        p = p + step + (0.2 if i % 3 == 0 else -0.1)
        out.append(
            OHLCVPoint(
                time=1_700_000_000 + i * 60,
                open=p - 0.3,
                high=p + 0.7,
                low=p - 0.8,
                close=p,
                volume=1_000 + (i % 20) * 50,
            )
        )
    return out


def test_phase15d_alternative_bars_non_empty() -> None:
    resp = calculate_alternative_bars(AlternativeBarsRequest(ohlcv=_ohlcv(100), bucketSize=10))
    assert len(resp.tick_bar_closes) > 0
    assert len(resp.volume_bar_closes) > 0
    assert len(resp.dollar_bar_closes) > 0


def test_phase15d_cusum_detects_breaks() -> None:
    closes = [100 + i * 0.5 for i in range(40)] + [120 - i * 0.9 for i in range(40)]
    resp = calculate_cusum(CUSUMRequest(closes=closes, threshold=0.01))
    assert len(resp.break_indices) > 0
    assert all(sig in ("up_break", "down_break") for sig in resp.break_signals)


def test_phase15e_meanrev_momentum_bounds() -> None:
    closes = [100 + math.sin(i / 3) for i in range(120)]
    resp = calculate_meanrev_momentum(MeanRevMomentumRequest(closes=closes))
    assert 0.0 <= resp.hurst <= 1.0
    assert resp.classification in ("mean_reverting", "momentum", "random_walk")


def test_phase15f_performance_metrics_fields() -> None:
    returns = [0.01, -0.02, 0.015, -0.005, 0.02, -0.01, 0.008]
    resp = calculate_performance_metrics(PerformanceMetricsRequest(returns=returns))
    assert -1.0 < resp.net_return < 1.0
    assert 0.0 <= resp.hit_ratio <= 1.0
    assert resp.max_drawdown <= 0.0


def test_phase15g_signal_chain_and_orderflow() -> None:
    sq = calculate_signal_quality_chain(
        SignalQualityChainRequest(labels=["strong", "strong", "weak", "invalid", "weak"])
    )
    assert "strong" in sq.transition
    of = calculate_order_flow_state(
        OrderFlowStateRequest(
            buy_volumes=[100, 50, 20, 200, 100],
            sell_volumes=[40, 80, 25, 30, 120],
            squeeze_threshold=0.12,
        )
    )
    assert len(of.states) == 5
    assert of.dominant_state in ("accumulation", "distribution", "squeeze")


def test_phase15h_eval_baseline_core_metrics() -> None:
    closes = [100 + i * 0.2 + (0.8 if i % 5 == 0 else -0.3) for i in range(150)]
    resp = calculate_eval_baseline(EvalBaselineRequest(closes=closes))
    assert len(resp.labels) > 0
    assert 0.0 <= resp.hit_ratio <= 1.0
    assert 0.0 <= resp.f1_proxy <= 1.0


def test_phase16_backtest_walkforward_deflated() -> None:
    closes = [100 + i * 0.15 + (0.5 if i % 7 == 0 else -0.2) for i in range(160)]
    bt = run_backtest(BacktestRequest(closes=closes, lookback=12))
    assert len(bt.strategy_returns) == len(closes) - 1
    wf = run_walk_forward(WalkForwardRequest(closes=closes, train_window=60, test_window=15))
    assert wf.mean_oos_score == wf.mean_oos_score
    ds = calculate_deflated_sharpe(DeflatedSharpeRequest(sharpe=1.2, trials=20, sample_length=252))
    assert isinstance(ds.pass_gate, bool)


def test_phase16_eval_indicator_gate_fields() -> None:
    closes = [100 + i * 0.1 + (0.4 if i % 6 == 0 else -0.15) for i in range(200)]
    resp = evaluate_indicator(EvalIndicatorRequest(closes=closes))
    assert isinstance(resp.gate_pass, bool)
    assert isinstance(resp.execution_realism_pass, bool)


def test_phase16_triple_barrier_and_sensitivity() -> None:
    closes = [100 + i * 0.12 + (0.3 if i % 4 == 0 else -0.1) for i in range(180)]
    tb = calculate_triple_barrier(
        TripleBarrierRequest(closes=closes, horizon=12, take_profit=0.03, stop_loss=0.02)
    )
    assert len(tb.labels) > 0
    assert tb.tp_count + tb.sl_count + tb.timeout_count == len(tb.labels)

    sens = run_parameter_sensitivity(
        ParameterSensitivityRequest(closes=closes, lookbacks=[5, 10, 15, 20])
    )
    assert len(sens.by_lookback) >= 2
    assert 0.0 <= sens.stability_score <= 1.0


def test_phase20_feature_ml_hybrid_bias() -> None:
    feats = build_features(FeatureEngineeringRequest(ohlcv=_ohlcv(80), period=14))
    assert len(feats.features) > 10
    pred = classify_signal(MLClassifySignalRequest(features=feats.features[-1]))
    assert pred.label in ("buy", "sell", "hold")
    fused = fuse_hybrid(HybridFusionRequest(ml_score=0.7, rule_score=0.4, ml_weight=0.6))
    assert 0.0 <= fused.fused_score <= 1.0
    bias = monitor_bias(
        BiasMonitoringRequest(
            geographic_distribution={"NA": 70, "EU": 20, "APAC": 10},
            regime_distribution={"bull": 80, "bear": 10, "range": 10},
            agreement_rate=0.3,
        )
    )
    assert isinstance(bias.alert, bool)
