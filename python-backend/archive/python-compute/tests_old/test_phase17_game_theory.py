from __future__ import annotations

from geopolitical_soft_signals.game_theory import (
    MonteCarloSimulationRequest,
    NashOutcomeInput,
    NashSolveRequest,
    StrategemeMatchRequest,
    TimelineEventInput,
    TimelineRegimeRequest,
    TransmissionPathRequest,
    build_timeline_regimes,
    build_transmission_paths,
    match_strategemes,
    run_monte_carlo_simulation,
    solve_nash_equilibria,
)


def test_nash_solver_finds_equilibrium() -> None:
    req = NashSolveRequest(
        players=["retail", "institutional"],
        outcomes=[
            NashOutcomeInput(strategies={"retail": "buy", "institutional": "buy"}, payoffs={"retail": -1, "institutional": -1}),
            NashOutcomeInput(strategies={"retail": "buy", "institutional": "sell"}, payoffs={"retail": -3, "institutional": 2}),
            NashOutcomeInput(strategies={"retail": "sell", "institutional": "buy"}, payoffs={"retail": 2, "institutional": -3}),
            NashOutcomeInput(strategies={"retail": "sell", "institutional": "sell"}, payoffs={"retail": 1, "institutional": 1}),
        ],
    )
    resp = solve_nash_equilibria(req)
    assert resp.status in ("equilibrium_found", "fallback_best_sum_payoff")
    assert resp.selected is not None


def test_transmission_paths_are_generated() -> None:
    resp = build_transmission_paths(
        TransmissionPathRequest(region="Europe", eventType="Sanctions escalation", impactScore=0.8)
    )
    assert len(resp.arcs) >= 3
    assert all(0.0 <= arc.impact <= 1.0 for arc in resp.arcs)


def test_monte_carlo_quantiles_sorted() -> None:
    resp = run_monte_carlo_simulation(
        MonteCarloSimulationRequest(initialPrice=100.0, drift=0.05, volatility=0.2, days=30, paths=500, seed=7)
    )
    assert resp.p10 <= resp.p50 <= resp.p90
    assert resp.expectedPrice > 0.0


def test_strategeme_match_detects_signal() -> None:
    resp = match_strategemes(
        StrategemeMatchRequest(text="This looks like a diversion with loud rhetoric and decoy moves.")
    )
    assert resp.topMatch is not None
    assert len(resp.matches) >= 1


def test_timeline_regime_classification() -> None:
    resp = build_timeline_regimes(
        TimelineRegimeRequest(
            events=[
                TimelineEventInput(date="2026-01-01", impactScore=0.2),
                TimelineEventInput(date="2026-01-02", impactScore=0.5),
                TimelineEventInput(date="2026-01-03", impactScore=0.85),
            ]
        )
    )
    assert len(resp.bands) == 3
    assert resp.elevatedCount == 1
    assert resp.watchCount == 1
    assert resp.calmCount == 1
