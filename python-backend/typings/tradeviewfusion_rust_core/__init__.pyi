from typing import Sequence

__version__: str

def composite_sma50_slope_norm(closes: Sequence[float]) -> tuple[float, float, float]: ...
def calculate_heartbeat(
    closes: Sequence[float],
    highs: Sequence[float],
    lows: Sequence[float],
    sensitivity: float,
) -> float: ...
def calculate_indicators_batch(
    timestamps: Sequence[int],
    opens: Sequence[float],
    highs: Sequence[float],
    lows: Sequence[float],
    closes: Sequence[float],
    volumes: Sequence[float],
    indicators: Sequence[str],
) -> dict[str, list[float]]: ...
def redb_cache_set(path: str, key: str, payload: str, ttl_ms: int) -> None: ...
def redb_cache_get(path: str, key: str, now_ms: int | None = None) -> str | None: ...
