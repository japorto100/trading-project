from __future__ import annotations

import importlib.util
import tempfile
import unittest
from pathlib import Path


def _load_finance_bridge_module():
    app_path = Path(__file__).resolve().parents[1] / "services" / "finance-bridge" / "app.py"
    spec = importlib.util.spec_from_file_location("finance_bridge_app", app_path)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class Phase2FinanceBridgeCacheTests(unittest.TestCase):
    def test_health_exposes_rust_cache_status(self) -> None:
        module = _load_finance_bridge_module()
        payload = module.health()
        self.assertEqual(payload.get("ok"), True)
        self.assertIn("rustOhlcvCache", payload)
        self.assertIsInstance(payload["rustOhlcvCache"], dict)
        self.assertIn("available", payload["rustOhlcvCache"])
        self.assertIn("enabled", payload["rustOhlcvCache"])
        self.assertIn("dataframe", payload)
        self.assertIsInstance(payload["dataframe"], dict)

    def test_normalize_ohlcv_rows_uses_polars_when_available(self) -> None:
        module = _load_finance_bridge_module()
        rows = [
            {"time": 2, "open": 2, "high": 3, "low": 1, "close": 2.5, "volume": 20},
            {"time": 1, "open": 1, "high": 2, "low": 0.5, "close": 1.5, "volume": 10},
        ]
        normalized, engine = module.normalize_ohlcv_rows(rows)
        self.assertEqual([item["time"] for item in normalized], [1, 2])
        self.assertIn(engine, {"polars", "python"})

    def test_rust_readthrough_cache_helpers_roundtrip(self) -> None:
        module = _load_finance_bridge_module()
        if not module.rust_ohlcv_cache_status().get("available"):
            self.skipTest("Rust cache functions not available in this environment")

        with tempfile.TemporaryDirectory() as temp_dir:
            module.RUST_OHLCV_CACHE_PATH = str(Path(temp_dir) / "ohlcv-cache.redb")
            key = module.ohlcv_cache_key("AAPL", "1D", 10, None, None)
            rows = [{"time": 1, "open": 1, "high": 1, "low": 1, "close": 1, "volume": 1}]
            module.rust_cache_set_json(key, rows, 60_000)
            hit = module.rust_cache_get_json(key)
            miss = module.rust_cache_get_json("missing-key")

        self.assertEqual(hit, rows)
        self.assertIsNone(miss)

    def test_cache_hit_response_shape_contains_cache_and_dataframe_metadata(self) -> None:
        module = _load_finance_bridge_module()
        if not module.rust_ohlcv_cache_status().get("available"):
            self.skipTest("Rust cache functions not available in this environment")

        with tempfile.TemporaryDirectory() as temp_dir:
            module.RUST_OHLCV_CACHE_PATH = str(Path(temp_dir) / "ohlcv-cache.redb")
            key = module.ohlcv_cache_key("AAPL", "1D", 10, None, None)
            rows = [{"time": 1, "open": 1, "high": 1, "low": 1, "close": 1, "volume": 1}]
            module.rust_cache_set_json(key, rows, 60_000)
            response = module.ohlcv(symbol="AAPL", timeframe="1D", limit=10, start=None, end=None)

        self.assertIn("data", response)
        self.assertIn("cache", response)
        self.assertEqual(response["cache"].get("hit"), True)
        self.assertIn("lookupMs", response["cache"])
        self.assertIn("dataframe", response)
        self.assertIn(response["dataframe"].get("engine"), {"polars", "python"})


if __name__ == "__main__":
    unittest.main()
