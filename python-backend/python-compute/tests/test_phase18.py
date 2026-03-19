from __future__ import annotations

from indicator_engine.pipeline import (
    DarkPoolSignalRequest,
    DeFiStressRequest,
    ExpectedMoveRequest,
    GEXProfileRequest,
    OptionLeg,
    OptionsCalculatorRequest,
    OracleCrossCheckRequest,
    calculate_dark_pool_signal,
    calculate_defi_stress,
    calculate_expected_move,
    calculate_gex_profile,
    calculate_options_payoff,
    calculate_oracle_crosscheck,
)


def test_darkpool_signal_ratio_and_label() -> None:
    resp = calculate_dark_pool_signal(DarkPoolSignalRequest(lit_volume=1000, dark_pool_volume=1200))
    assert 0.0 <= resp.dark_pool_ratio <= 1.0
    assert resp.signal in ("accumulation", "distribution", "neutral")


def test_gex_profile_walls() -> None:
    req = GEXProfileRequest(
        strikes=[95, 100, 105, 110],
        call_gamma=[10, 40, 20, 15],
        put_gamma=[25, 10, 45, 5],
    )
    resp = calculate_gex_profile(req)
    assert len(resp.net_gex) == 4
    assert resp.call_wall in req.strikes
    assert resp.put_wall in req.strikes


def test_expected_move_bounds() -> None:
    resp = calculate_expected_move(ExpectedMoveRequest(spot=100.0, iv_annual=0.25, days=7))
    assert resp.move_abs > 0
    assert resp.upper > resp.lower


def test_options_calculator_outputs() -> None:
    req = OptionsCalculatorRequest(
        spot=100,
        legs=[
            OptionLeg(kind="call", strike=100, premium=4.0, quantity=1),
            OptionLeg(kind="call", strike=110, premium=1.0, quantity=-1),
        ],
    )
    resp = calculate_options_payoff(req)
    assert resp.max_profit >= resp.max_loss
    assert isinstance(resp.breakevens, list)


def test_defi_stress_levels() -> None:
    low = calculate_defi_stress(DeFiStressRequest(tvl_change_pct=1, funding_rate=0.0005, open_interest_change_pct=1))
    high = calculate_defi_stress(DeFiStressRequest(tvl_change_pct=-20, funding_rate=0.03, open_interest_change_pct=30))
    assert low.level in ("low", "medium", "high")
    assert high.level in ("low", "medium", "high")
    assert high.stress_score >= low.stress_score


def test_oracle_crosscheck_disagreement() -> None:
    resp = calculate_oracle_crosscheck(
        OracleCrossCheckRequest(web2_price=105.0, oracle_price=100.0, threshold_pct=0.01)
    )
    assert resp.divergence_pct > 0
    assert resp.disagreement is True
    assert resp.severity in ("low", "medium", "high")
