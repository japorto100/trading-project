"""Phase 13: Tests for HRP, Kelly, Regime-Sizing, Monte Carlo VaR, and VPIN.

All network calls are patched so no running Go gateway is needed.
"""
from __future__ import annotations

import asyncio
import os
from unittest.mock import patch

import numpy as np
import pytest

# Ensure env is set before module import (in case modules read it at import time)
os.environ.setdefault("MOCK_OHLCV", "true")

from ml_ai.indicator_engine.portfolio_analytics import (  # noqa: E402
    AssetFullOHLCV,
    AssetOHLCV,
    KellyRequest,
    MonteCarloRequest,
    OptimizeRequest,
    RegimeSizingRequest,
    VPINRequest,
    compute_kelly_allocation,
    compute_monte_carlo_var,
    compute_portfolio_optimization,
    compute_regime_sizing,
    compute_vpin,
)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_RNG = np.random.default_rng(42)


def _make_asset(symbol: str, n: int = 120, trend: float = 0.001) -> AssetOHLCV:
    r = _RNG.normal(trend, 0.02, n)
    prices = np.cumprod(1.0 + r) * 100.0
    return AssetOHLCV(symbol=symbol, close=prices.tolist())


def _make_full_asset(symbol: str, n: int = 60) -> AssetFullOHLCV:
    r = _RNG.normal(0.001, 0.02, n)
    closes = np.cumprod(1.0 + r) * 100.0
    highs = closes * (1.0 + _RNG.uniform(0.001, 0.01, n))
    lows = closes * (1.0 - _RNG.uniform(0.001, 0.01, n))
    vols = _RNG.uniform(500.0, 5000.0, n)
    return AssetFullOHLCV(
        symbol=symbol,
        close=closes.tolist(),
        high=highs.tolist(),
        low=lows.tolist(),
        volume=vols.tolist(),
    )


MOCK_DB: dict[str, AssetOHLCV] = {
    "AAPL": _make_asset("AAPL", trend=0.002),
    "MSFT": _make_asset("MSFT", trend=0.001),
    "GOOG": _make_asset("GOOG", trend=-0.001),
    "TSLA": _make_asset("TSLA", trend=0.003),
}


async def _mock_fetch(symbol: str, timeframe: str, limit: int) -> AssetOHLCV | None:
    return MOCK_DB.get(symbol)


async def _mock_full_fetch(symbol: str, timeframe: str, limit: int) -> AssetFullOHLCV | None:
    return _make_full_asset(symbol)


def run(coro):
    """Run an async coroutine synchronously."""
    return asyncio.run(coro)


# ---------------------------------------------------------------------------
# HRP Tests (13a)
# ---------------------------------------------------------------------------


def test_hrp_weights_sum_to_one():
    async def inner():
        with patch(
            "ml_ai.indicator_engine.portfolio_analytics.fetch_ohlcv_from_go",
            side_effect=_mock_fetch,
        ):
            return await compute_portfolio_optimization(
                OptimizeRequest(symbols=["AAPL", "MSFT", "GOOG"], method="hrp")
            )

    resp = run(inner())
    assert resp.method == "hrp"
    total = sum(resp.weights.values())
    assert abs(total - 1.0) < 1e-6
    assert all(w >= 0.0 for w in resp.weights.values())


def test_hrp_dendrogram_order_returned():
    async def inner():
        with patch(
            "ml_ai.indicator_engine.portfolio_analytics.fetch_ohlcv_from_go",
            side_effect=_mock_fetch,
        ):
            return await compute_portfolio_optimization(
                OptimizeRequest(symbols=["AAPL", "MSFT", "GOOG", "TSLA"], method="hrp")
            )

    resp = run(inner())
    assert resp.dendrogram_order is not None
    assert len(resp.dendrogram_order) == 4
    assert set(resp.dendrogram_order) == {"AAPL", "MSFT", "GOOG", "TSLA"}


def test_hrp_single_symbol_fallback():
    async def inner():
        with patch(
            "ml_ai.indicator_engine.portfolio_analytics.fetch_ohlcv_from_go",
            side_effect=_mock_fetch,
        ):
            return await compute_portfolio_optimization(
                OptimizeRequest(symbols=["AAPL"], method="hrp")
            )

    resp = run(inner())
    assert resp.weights.get("AAPL", 0.0) == pytest.approx(1.0, abs=1e-6)


def test_hrp_expected_volatility_positive():
    async def inner():
        with patch(
            "ml_ai.indicator_engine.portfolio_analytics.fetch_ohlcv_from_go",
            side_effect=_mock_fetch,
        ):
            return await compute_portfolio_optimization(
                OptimizeRequest(symbols=["AAPL", "MSFT", "GOOG"], method="hrp")
            )

    resp = run(inner())
    assert resp.expected_volatility is not None
    assert resp.expected_volatility > 0.0


# ---------------------------------------------------------------------------
# Kelly Multi-Asset Tests (13b)
# ---------------------------------------------------------------------------


def test_kelly_allocations_bounded_by_risk_fraction():
    async def inner():
        with patch(
            "ml_ai.indicator_engine.portfolio_analytics.fetch_ohlcv_from_go",
            side_effect=_mock_fetch,
        ):
            return await compute_kelly_allocation(
                KellyRequest(symbols=["AAPL", "MSFT", "GOOG"], risk_fraction=0.25)
            )

    resp = run(inner())
    total = sum(resp.allocations.values())
    assert total <= 0.25 + 1e-6
    assert all(v >= 0.0 for v in resp.allocations.values())


def test_kelly_long_only_no_negative_weights():
    async def inner():
        with patch(
            "ml_ai.indicator_engine.portfolio_analytics.fetch_ohlcv_from_go",
            side_effect=_mock_fetch,
        ):
            return await compute_kelly_allocation(
                KellyRequest(symbols=["AAPL", "MSFT", "GOOG", "TSLA"], risk_fraction=0.5)
            )

    resp = run(inner())
    assert all(v >= 0.0 for v in resp.allocations.values())


def test_kelly_single_symbol():
    async def inner():
        with patch(
            "ml_ai.indicator_engine.portfolio_analytics.fetch_ohlcv_from_go",
            side_effect=_mock_fetch,
        ):
            return await compute_kelly_allocation(
                KellyRequest(symbols=["AAPL"], risk_fraction=0.25)
            )

    resp = run(inner())
    assert "AAPL" in resp.allocations
    assert resp.allocations["AAPL"] == pytest.approx(0.25, abs=1e-6)


def test_kelly_empty_symbols():
    async def inner():
        with patch(
            "ml_ai.indicator_engine.portfolio_analytics.fetch_ohlcv_from_go",
            side_effect=_mock_fetch,
        ):
            return await compute_kelly_allocation(KellyRequest(symbols=[], risk_fraction=0.25))

    resp = run(inner())
    assert resp.allocations == {}
    assert resp.kelly_fractions == {}


# ---------------------------------------------------------------------------
# Regime-Based Sizing Tests (13c)
# ---------------------------------------------------------------------------


def test_regime_sizing_signal_count_matches_symbols():
    async def inner():
        with patch(
            "ml_ai.indicator_engine.portfolio_analytics.fetch_ohlcv_from_go",
            side_effect=_mock_fetch,
        ):
            return await compute_regime_sizing(
                RegimeSizingRequest(symbols=["AAPL", "MSFT", "GOOG"])
            )

    resp = run(inner())
    assert len(resp.signals) == 3
    assert resp.portfolio_regime in ("risk_on", "neutral", "risk_off")


def test_regime_sizing_traffic_lights_valid():
    async def inner():
        with patch(
            "ml_ai.indicator_engine.portfolio_analytics.fetch_ohlcv_from_go",
            side_effect=_mock_fetch,
        ):
            return await compute_regime_sizing(
                RegimeSizingRequest(symbols=["AAPL", "MSFT"])
            )

    resp = run(inner())
    for sig in resp.signals:
        assert sig.traffic_light in ("green", "yellow", "red")
        assert sig.regime in ("bullish", "bearish", "ranging")
        assert sig.recommended_size_pct >= 0.0
        assert 0.0 <= sig.confidence <= 1.0


def test_regime_sizing_no_data_graceful():
    async def mock_none(symbol: str, timeframe: str, limit: int):
        return None

    async def inner():
        with patch(
            "ml_ai.indicator_engine.portfolio_analytics.fetch_ohlcv_from_go",
            side_effect=mock_none,
        ):
            return await compute_regime_sizing(RegimeSizingRequest(symbols=["UNKNOWN"]))

    resp = run(inner())
    assert len(resp.signals) == 1
    assert resp.signals[0].traffic_light == "yellow"
    assert resp.signals[0].regime == "ranging"


# ---------------------------------------------------------------------------
# Monte Carlo VaR Tests (13d)
# ---------------------------------------------------------------------------


def test_monte_carlo_var_present_for_all_confidence_levels():
    async def inner():
        with patch(
            "ml_ai.indicator_engine.portfolio_analytics.fetch_ohlcv_from_go",
            side_effect=_mock_fetch,
        ):
            return await compute_monte_carlo_var(
                MonteCarloRequest(
                    weights={"AAPL": 0.5, "MSFT": 0.5},
                    symbols=["AAPL", "MSFT"],
                    simulations=1000,
                    horizon_days=5,
                    confidence_levels=[0.95, 0.99],
                )
            )

    resp = run(inner())
    assert "0.95" in resp.var
    assert "0.99" in resp.var
    assert resp.simulation_count == 1000


def test_monte_carlo_cvar_lte_var():
    async def inner():
        with patch(
            "ml_ai.indicator_engine.portfolio_analytics.fetch_ohlcv_from_go",
            side_effect=_mock_fetch,
        ):
            return await compute_monte_carlo_var(
                MonteCarloRequest(
                    weights={"AAPL": 0.6, "MSFT": 0.4},
                    symbols=["AAPL", "MSFT"],
                    simulations=2000,
                    horizon_days=10,
                    confidence_levels=[0.95],
                )
            )

    resp = run(inner())
    # CVaR (Expected Shortfall) must be <= VaR (deeper into the tail)
    assert resp.cvar["0.95"] <= resp.var["0.95"] + 1e-6


def test_monte_carlo_simulations_capped_at_100k():
    async def inner():
        with patch(
            "ml_ai.indicator_engine.portfolio_analytics.fetch_ohlcv_from_go",
            side_effect=_mock_fetch,
        ):
            return await compute_monte_carlo_var(
                MonteCarloRequest(
                    weights={"AAPL": 1.0},
                    symbols=["AAPL"],
                    simulations=200_000,
                    horizon_days=3,
                    confidence_levels=[0.95],
                )
            )

    resp = run(inner())
    assert resp.simulation_count <= 100_000


# ---------------------------------------------------------------------------
# VPIN Tests (13e)
# ---------------------------------------------------------------------------


def test_vpin_value_in_unit_range():
    async def inner():
        with patch(
            "ml_ai.indicator_engine.portfolio_analytics.fetch_full_ohlcv_from_go",
            side_effect=_mock_full_fetch,
        ):
            return await compute_vpin(VPINRequest(symbol="AAPL", timeframe="1D", limit=60, bucket_size=5))

    resp = run(inner())
    assert 0.0 <= resp.vpin <= 1.0
    assert resp.toxicity_level in ("low", "medium", "high")
    assert isinstance(resp.alert, bool)


def test_vpin_high_one_sided_flow():
    """With close == high (all-buy), every bucket should have max VPIN."""

    async def all_buy_fetch(symbol: str, timeframe: str, limit: int) -> AssetFullOHLCV:
        n = 60
        closes = np.linspace(100.0, 160.0, n)
        highs = closes  # close = high → buy_frac = 1.0
        lows = closes * 0.999
        volumes = np.full(n, 1000.0)
        return AssetFullOHLCV(
            symbol=symbol,
            close=closes.tolist(),
            high=highs.tolist(),
            low=lows.tolist(),
            volume=volumes.tolist(),
        )

    async def inner():
        with patch(
            "ml_ai.indicator_engine.portfolio_analytics.fetch_full_ohlcv_from_go",
            side_effect=all_buy_fetch,
        ):
            return await compute_vpin(VPINRequest(symbol="AAPL", bucket_size=5))

    resp = run(inner())
    # All-buy flow means buy_vol == total → |buy - sell| / total = 1.0
    assert resp.vpin > 0.5


def test_vpin_no_data_graceful():
    async def mock_none(symbol: str, timeframe: str, limit: int):
        return None

    async def inner():
        with patch(
            "ml_ai.indicator_engine.portfolio_analytics.fetch_full_ohlcv_from_go",
            side_effect=mock_none,
        ):
            return await compute_vpin(VPINRequest(symbol="UNKNOWN"))

    resp = run(inner())
    assert resp.vpin == 0.0
    assert resp.alert is False
    assert resp.toxicity_level == "low"
    assert resp.vpin_series == []
