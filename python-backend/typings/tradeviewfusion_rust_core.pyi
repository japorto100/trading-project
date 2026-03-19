"""Minimal type stubs for tradeviewfusion_rust_core (PyO3 extension module).

Only the functions called via rust_bridge.py are stubbed.
The actual implementation lives in python-compute/src/ (Rust).
"""

def composite_sma50_slope_norm(
    closes: list[float],
) -> tuple[float, float, float]: ...

def calculate_heartbeat(
    closes: list[float],
    highs: list[float],
    lows: list[float],
    sensitivity: float,
) -> float: ...

def calculate_indicators_batch(
    timestamps: list[int],
    opens: list[float],
    highs: list[float],
    lows: list[float],
    closes: list[float],
    volumes: list[float],
    indicators: list[str],
) -> dict[str, list[float]]: ...

def redb_cache_set(
    path: str,
    key: str,
    payload_json: str,
    ttl_ms: int,
) -> None: ...

def redb_cache_get(
    path: str,
    key: str,
    now_ms: int | None = None,
) -> str | None: ...

# Agent hotpath functions (Phase 22g)
def extract_entities_from_text(text: str) -> str:
    """Return JSON array of {type, value} entity dicts extracted from text.
    Types: ticker, country, metric, asset_class.
    """
    ...

def dedup_context_fragments(fragments_json: str, threshold: float) -> str:
    """Deduplicate context fragments (hash-based, first 64 normalised chars).
    Input/output: JSON array of {source, content_str, relevance_f64}.
    Sorted by relevance descending.
    """
    ...

def score_tools_for_query(
    query: str,
    tool_names: list[str],
    tool_descriptions: list[str],
) -> list[float]:
    """Score tools for a query using token overlap + name boost.
    Returns a float per tool clamped to [0.0, 1.0].
    """
    ...
