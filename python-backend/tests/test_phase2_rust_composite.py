from __future__ import annotations

import importlib.util
import json
import tempfile
import time
import unittest
from pathlib import Path

from ml_ai.indicator_engine.pipeline import (
    CompositeSignalRequest,
    OHLCVPoint,
    build_composite_signal,
    indicator_dataframe_status,
)
from ml_ai.indicator_engine.rust_bridge import (
    calculate_heartbeat as rust_calculate_heartbeat,
    calculate_indicators_batch as rust_calculate_indicators_batch,
)
from ml_ai.indicator_engine.rust_bridge import rust_core_status


def _sample_ohlcv(count: int = 120) -> list[OHLCVPoint]:
    points: list[OHLCVPoint] = []
    for i in range(count):
        base = 100.0 + (i * 0.45)
        points.append(
            OHLCVPoint(
                time=1_700_000_000 + i * 60,
                open=base,
                high=base + 0.25,
                low=base - 0.2,
                close=base + 0.1,
                volume=1_000 + i * 5,
            )
        )
    return points


class Phase2RustCompositeTests(unittest.TestCase):
    def test_rust_bridge_status_shape(self) -> None:
        status = rust_core_status()
        self.assertIn("available", status)
        self.assertIn("module", status)
        self.assertIn("version", status)
        self.assertIn("error", status)

    def test_composite_signal_reports_engine_when_rust_available(self) -> None:
        status = rust_core_status()
        if not status.get("available"):
            self.skipTest("Rust core extension not installed in this environment")

        response = build_composite_signal(CompositeSignalRequest(ohlcv=_sample_ohlcv()))
        engine = response.components["sma50_slope"].details.get("engine")
        self.assertEqual(engine, "rust")
        self.assertIn(
            response.components["sma50_slope"].details.get("dataframeEngine"),
            {"polars", "python"},
        )
        self.assertIn(
            response.components["volume_power"].details.get("dataframeEngine"),
            {"polars", "python"},
        )
        self.assertIn(
            response.components["volume_power"].details.get("rvolEngine"),
            {"rust", "python"},
        )
        self.assertIn(
            response.components["heartbeat"].details.get("engine"),
            {"rust", "python"},
        )

    def test_dataframe_status_shape(self) -> None:
        status = indicator_dataframe_status()
        self.assertIn("available", status)
        self.assertIn("engine", status)
        self.assertIn("version", status)
        self.assertIn("error", status)

    def test_indicator_service_health_includes_rust_core_status(self) -> None:
        app_path = Path(__file__).resolve().parents[1] / "services" / "indicator-service" / "app.py"
        spec = importlib.util.spec_from_file_location("indicator_service_app", app_path)
        self.assertIsNotNone(spec)
        self.assertIsNotNone(spec.loader)
        module = importlib.util.module_from_spec(spec)
        assert spec and spec.loader
        spec.loader.exec_module(module)

        payload = module.health()
        self.assertIsInstance(payload, dict)
        self.assertEqual(payload.get("ok"), True)
        self.assertIn("rustCore", payload)
        self.assertIsInstance(payload["rustCore"], dict)
        self.assertIn("dataframe", payload)
        self.assertIsInstance(payload["dataframe"], dict)

    def test_redb_cache_roundtrip_via_pyo3(self) -> None:
        status = rust_core_status()
        if not status.get("available"):
            self.skipTest("Rust core extension not installed in this environment")

        import tradeviewfusion_rust_core as rust_core

        with tempfile.TemporaryDirectory() as temp_dir:
            db_path = str(Path(temp_dir) / "ohlcv-cache.redb")
            rust_core.redb_cache_set(db_path, "AAPL:1D:50", '{"candles":[1,2,3]}', 60_000)
            hit = rust_core.redb_cache_get(db_path, "AAPL:1D:50", None)
            miss = rust_core.redb_cache_get(db_path, "MSFT:1D:50", None)

        self.assertEqual(hit, '{"candles":[1,2,3]}')
        self.assertIsNone(miss)

    def test_redb_cache_warm_get_under_1ms_p50(self) -> None:
        status = rust_core_status()
        if not status.get("available"):
            self.skipTest("Rust core extension not installed in this environment")

        import tradeviewfusion_rust_core as rust_core

        with tempfile.TemporaryDirectory() as temp_dir:
            db_path = str(Path(temp_dir) / "ohlcv-bench.redb")
            rust_core.redb_cache_set(db_path, "bench-key", json.dumps({"candles": [1]}), 60_000)
            rust_core.redb_cache_get(db_path, "bench-key", None)  # warm-up

            samples_ms: list[float] = []
            for _ in range(100):
                started = time.perf_counter_ns()
                rust_core.redb_cache_get(db_path, "bench-key", None)
                samples_ms.append((time.perf_counter_ns() - started) / 1_000_000)

        samples_ms.sort()
        p50_ms = samples_ms[len(samples_ms) // 2]
        # Phase-2c verify target: warm second hit should be sub-millisecond.
        self.assertLess(p50_ms, 1.0, f"warm redb cache p50 too slow: {p50_ms:.4f}ms")

    def test_rust_heartbeat_wrapper_shape(self) -> None:
        status = rust_core_status()
        if not status.get("available"):
            self.skipTest("Rust core extension not installed in this environment")
        points = _sample_ohlcv(120)
        score = rust_calculate_heartbeat(
            [point.close for point in points],
            [point.high for point in points],
            [point.low for point in points],
            0.02,
        )
        self.assertIsNotNone(score)
        assert score is not None
        self.assertGreaterEqual(score, 0.0)
        self.assertLessEqual(score, 1.0)

    def test_rust_indicators_batch_wrapper_shape(self) -> None:
        status = rust_core_status()
        if not status.get("available"):
            self.skipTest("Rust core extension not installed in this environment")
        points = _sample_ohlcv(40)
        result = rust_calculate_indicators_batch(
            [point.time for point in points],
            [point.open for point in points],
            [point.high for point in points],
            [point.low for point in points],
            [point.close for point in points],
            [point.volume for point in points],
            ["sma_5", "rvol_5", "close"],
        )
        self.assertIsNotNone(result)
        assert result is not None
        self.assertIn("sma_5", result)
        self.assertIn("rvol_5", result)
        self.assertIn("close", result)
        self.assertEqual(len(result["sma_5"]), len(points))


if __name__ == "__main__":
    unittest.main()
