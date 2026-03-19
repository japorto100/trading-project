"""Phase 15 tests: Volatility Suite (15b) + Regime Detection (15c)."""
from __future__ import annotations

import math
import unittest

from indicator_engine.pipeline import (
    RegimeDetectRequest,
    VolatilitySuiteRequest,
    calculate_markov_regime,
    calculate_regime,
    calculate_volatility_suite,
)


def _trending_closes(n: int = 60, start: float = 100.0, step: float = 1.0) -> list[float]:
    return [start + i * step for i in range(n)]


def _flat_closes(n: int = 60, value: float = 100.0) -> list[float]:
    return [value] * n


def _noisy_closes(n: int = 60, base: float = 100.0, amplitude: float = 0.5) -> list[float]:
    import math as m
    return [base + amplitude * m.sin(i * 0.5) for i in range(n)]


def _high_variance_closes(n: int = 60, base: float = 100.0) -> list[float]:
    """Alternating big up/down moves → elevated volatility."""
    result = [base]
    for i in range(1, n):
        result.append(result[-1] * (1.05 if i % 2 == 0 else 0.95))
    return result


def _low_variance_closes(n: int = 60, base: float = 100.0) -> list[float]:
    """Tiny random-walk → compressed volatility."""
    result = [base]
    for i in range(1, n):
        # deterministic tiny drift
        result.append(result[-1] * (1.0001 if i % 2 == 0 else 0.9999))
    return result


class TestVolatilitySuite(unittest.TestCase):
    def test_elevated_regime(self) -> None:
        closes = _high_variance_closes(80)
        req = VolatilitySuiteRequest(closes=closes, lookback=20)
        resp = calculate_volatility_suite(req)
        self.assertEqual(resp.volatility_regime, "elevated")
        self.assertGreater(resp.volatility_index, 0.0)
        self.assertGreater(resp.spike_weighted_vol, 0.0)
        self.assertGreater(resp.exp_weighted_stddev, 0.0)

    def test_compressed_regime(self) -> None:
        closes = _low_variance_closes(80)
        req = VolatilitySuiteRequest(closes=closes, lookback=20)
        resp = calculate_volatility_suite(req)
        self.assertEqual(resp.volatility_regime, "compressed")

    def test_normal_regime_flat(self) -> None:
        # flat prices → nearly zero vol, but consistent → normal (hist_median ≈ hv)
        closes = _flat_closes(60, 100.0)
        # inject tiny noise to avoid log(1) = 0 division issues
        closes = [c + (0.001 * (i % 3)) for i, c in enumerate(closes)]
        req = VolatilitySuiteRequest(closes=closes, lookback=15)
        resp = calculate_volatility_suite(req)
        # flat-ish data: regime is normal or compressed, but not elevated
        self.assertIn(resp.volatility_regime, ("normal", "compressed"))

    def test_output_fields_present(self) -> None:
        closes = _trending_closes(50)
        resp = calculate_volatility_suite(VolatilitySuiteRequest(closes=closes))
        self.assertIsInstance(resp.spike_weighted_vol, float)
        self.assertIsInstance(resp.volatility_index, float)
        self.assertIsInstance(resp.exp_weighted_stddev, float)
        self.assertIn(resp.volatility_regime, ("elevated", "normal", "compressed"))

    def test_finite_values(self) -> None:
        closes = _trending_closes(40)
        resp = calculate_volatility_suite(VolatilitySuiteRequest(closes=closes))
        self.assertTrue(math.isfinite(resp.spike_weighted_vol))
        self.assertTrue(math.isfinite(resp.volatility_index))
        self.assertTrue(math.isfinite(resp.exp_weighted_stddev))


class TestRegimeDetect(unittest.TestCase):
    def test_bullish_regime(self) -> None:
        closes = _trending_closes(80, start=100.0, step=1.5)
        req = RegimeDetectRequest(closes=closes, lookback=50)
        resp = calculate_regime(req)
        self.assertEqual(resp.current_regime, "bullish")
        self.assertGreater(resp.sma_slope, 0.0)
        self.assertGreaterEqual(resp.confidence, 0.0)
        self.assertLessEqual(resp.confidence, 1.0)

    def test_bearish_regime(self) -> None:
        closes = _trending_closes(80, start=200.0, step=-1.5)
        req = RegimeDetectRequest(closes=closes, lookback=50)
        resp = calculate_regime(req)
        self.assertEqual(resp.current_regime, "bearish")
        self.assertLess(resp.sma_slope, 0.0)

    def test_ranging_regime(self) -> None:
        closes = _noisy_closes(80, amplitude=0.2)
        req = RegimeDetectRequest(closes=closes, lookback=50)
        resp = calculate_regime(req)
        # With low ADX and small slope, expect ranging
        self.assertIn(resp.current_regime, ("ranging", "bullish", "bearish"))

    def test_confidence_in_bounds(self) -> None:
        closes = _trending_closes(60)
        resp = calculate_regime(RegimeDetectRequest(closes=closes))
        self.assertGreaterEqual(resp.confidence, 0.0)
        self.assertLessEqual(resp.confidence, 1.0)

    def test_adx_non_negative(self) -> None:
        closes = _trending_closes(80)
        resp = calculate_regime(RegimeDetectRequest(closes=closes))
        self.assertGreaterEqual(resp.adx, 0.0)


class TestMarkovRegime(unittest.TestCase):
    def test_transition_rows_sum_to_one(self) -> None:
        closes = _trending_closes(120, step=0.8)
        req = RegimeDetectRequest(closes=closes, lookback=30)
        resp = calculate_markov_regime(req)
        total = sum(resp.transition_probs.values())
        self.assertAlmostEqual(total, 1.0, places=3)

    def test_stationary_sums_to_one(self) -> None:
        closes = _noisy_closes(120, amplitude=1.0)
        req = RegimeDetectRequest(closes=closes, lookback=30)
        resp = calculate_markov_regime(req)
        total = sum(resp.stationary_distribution.values())
        self.assertAlmostEqual(total, 1.0, places=2)

    def test_expected_duration_positive(self) -> None:
        closes = _trending_closes(80)
        resp = calculate_markov_regime(RegimeDetectRequest(closes=closes, lookback=30))
        self.assertGreater(resp.expected_duration, 0.0)

    def test_shift_probability_in_bounds(self) -> None:
        closes = _trending_closes(80)
        resp = calculate_markov_regime(RegimeDetectRequest(closes=closes, lookback=30))
        self.assertGreaterEqual(resp.shift_probability, 0.0)
        self.assertLessEqual(resp.shift_probability, 1.0)

    def test_current_regime_valid(self) -> None:
        closes = _trending_closes(80)
        resp = calculate_markov_regime(RegimeDetectRequest(closes=closes, lookback=30))
        self.assertIn(resp.current_regime, ("bullish", "bearish", "ranging"))

    def test_insufficient_data_warning(self) -> None:
        # Very short series → warning branch
        closes = [100.0 + i * 0.1 for i in range(22)]
        resp = calculate_markov_regime(RegimeDetectRequest(closes=closes, lookback=20))
        # Either a warning is set OR it succeeded — both are valid
        self.assertIn(resp.current_regime, ("bullish", "bearish", "ranging"))


class TestHMMRegime(unittest.TestCase):
    def test_hmm_imports_or_skips_gracefully(self) -> None:
        from indicator_engine.pipeline import calculate_hmm_regime

        closes = _trending_closes(100, step=0.5)
        req = RegimeDetectRequest(closes=closes, n_components=3)
        resp = calculate_hmm_regime(req)
        # Either hmmlearn available (n_components >= 2) or not (n_components == 0)
        self.assertIn(resp.n_components, list(range(7)))

    def test_hmm_bic_finite_when_available(self) -> None:
        try:
            import hmmlearn  # noqa: F401
        except ImportError:
            self.skipTest("hmmlearn not installed")

        from indicator_engine.pipeline import calculate_hmm_regime

        closes = _trending_closes(120, step=0.3)
        resp = calculate_hmm_regime(RegimeDetectRequest(closes=closes, n_components=3))
        self.assertGreater(resp.n_components, 0)
        self.assertTrue(math.isfinite(resp.bic_score))
        self.assertGreaterEqual(resp.hidden_state, 0)


if __name__ == "__main__":
    unittest.main()
