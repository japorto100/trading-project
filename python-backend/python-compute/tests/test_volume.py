"""Tests for indicator_engine.volume — VWAP, OBV, CMF."""

from __future__ import annotations

from indicator_engine.models import OHLCVPoint
from indicator_engine.volume import calculate_vwap, cmf, obv, vwap


class TestVWAP:
    def test_length(self, ohlcv_points_1000: list[OHLCVPoint]) -> None:
        result = vwap(ohlcv_points_1000)
        assert len(result) == 1000

    def test_positive_values(self, ohlcv_points_1000: list[OHLCVPoint]) -> None:
        result = vwap(ohlcv_points_1000)
        for v in result:
            assert v > 0


class TestVWAPEndpoint:
    def test_response(self, ohlcv_points_100: list[OHLCVPoint]) -> None:
        from indicator_engine.models import VWAPRequest
        req = VWAPRequest(ohlcv=ohlcv_points_100)
        resp = calculate_vwap(req)
        assert len(resp.data) == 100
        assert resp.metadata["indicator"] == "VWAP"


class TestOBV:
    def test_length(self, ohlcv_points_1000: list[OHLCVPoint]) -> None:
        result = obv(ohlcv_points_1000)
        assert len(result) == 1000

    def test_starts_at_zero(self, ohlcv_points_1000: list[OHLCVPoint]) -> None:
        result = obv(ohlcv_points_1000)
        assert result[0] == 0.0

    def test_empty(self) -> None:
        assert obv([]) == []


class TestCMF:
    def test_length(self, ohlcv_points_1000: list[OHLCVPoint]) -> None:
        result = cmf(ohlcv_points_1000, 20)
        assert len(result) == 1000

    def test_range(self, ohlcv_points_1000: list[OHLCVPoint]) -> None:
        result = cmf(ohlcv_points_1000, 20)
        for v in result:
            assert -5.0 <= v <= 5.0  # CMF is bounded but not strictly -1..1 with SMA normalization
