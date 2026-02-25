from __future__ import annotations

import json
import os
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any
import sys

from fastapi import HTTPException, Query
import yfinance as yf

try:
    import polars as pl
except Exception:  # noqa: BLE001
    pl = None

PYTHON_BACKEND_ROOT = Path(__file__).resolve().parents[2]
if str(PYTHON_BACKEND_ROOT) not in sys.path:
    sys.path.append(str(PYTHON_BACKEND_ROOT))

from services._shared import create_service_app  # noqa: E402

try:
    import tradeviewfusion_rust_core as _rust_core
except Exception as error:  # noqa: BLE001
    _rust_core = None
    _rust_core_import_error = error
else:
    _rust_core_import_error = None


app = create_service_app("finance-bridge")


RUST_OHLCV_CACHE_ENABLED = os.getenv("RUST_OHLCV_CACHE_ENABLED", "true").strip().lower() in {
    "1",
    "true",
    "yes",
    "on",
}
RUST_OHLCV_CACHE_PATH = str(
    (PYTHON_BACKEND_ROOT / ".cache" / "rust-ohlcv-cache.redb")
    if not os.getenv("RUST_OHLCV_CACHE_PATH")
    else Path(os.environ["RUST_OHLCV_CACHE_PATH"])
)


INDEX_SYMBOL_MAP = {
    "SPX": "^GSPC",
    "NDX": "^NDX",
    "DJI": "^DJI",
    "IXIC": "^IXIC",
    "DAX": "^GDAXI",
    "FTSE": "^FTSE",
    "N225": "^N225",
    "HSI": "^HSI",
}


def to_yahoo_symbol(symbol: str) -> str:
    value = symbol.strip().upper()
    if not value:
        return value

    if value in INDEX_SYMBOL_MAP:
        return INDEX_SYMBOL_MAP[value]

    if "/" in value:
        base, quote = value.split("/", 1)
        if len(base) == 3 and len(quote) == 3:
            return f"{base}{quote}=X"
        return f"{base}-{quote}"

    return value


def map_timeframe(timeframe: str) -> tuple[str, str]:
    interval_map = {
        "1m": "1m",
        "5m": "5m",
        "15m": "15m",
        "30m": "30m",
        "1H": "60m",
        "4H": "1h",
        "1D": "1d",
        "1W": "1wk",
        "1M": "1mo",
    }
    period_map = {
        "1m": "7d",
        "5m": "30d",
        "15m": "60d",
        "30m": "60d",
        "1H": "730d",
        "4H": "730d",
        "1D": "10y",
        "1W": "max",
        "1M": "max",
    }
    interval = interval_map.get(timeframe, "1d")
    period = period_map.get(timeframe, "1y")
    return interval, period


def period_for_limit(timeframe: str, limit: int) -> str:
    if timeframe in {"1W", "1M"}:
        return "max"
    if timeframe == "1D":
        if limit > 2520:
            return "max"
        if limit > 1260:
            return "10y"
        if limit > 756:
            return "5y"
        return "3y"
    interval, period = map_timeframe(timeframe)
    _ = interval
    return period


def as_float(value: Any, default: float = 0.0) -> float:
    try:
        if value is None:
            return default
        return float(value)
    except Exception:
        return default


def as_unix_timestamp(value: Any) -> int:
    if value is None:
        return 0
    if isinstance(value, (int, float)):
        return int(value)
    if hasattr(value, "timestamp"):
        try:
            return int(value.timestamp())
        except Exception:
            return 0
    return 0


def rust_ohlcv_cache_status() -> dict[str, Any]:
    has_cache_fns = bool(
        _rust_core is not None
        and hasattr(_rust_core, "redb_cache_set")
        and hasattr(_rust_core, "redb_cache_get")
    )
    return {
        "enabled": RUST_OHLCV_CACHE_ENABLED,
        "available": has_cache_fns,
        "path": RUST_OHLCV_CACHE_PATH,
        "error": None if _rust_core_import_error is None else str(_rust_core_import_error),
    }


def dataframe_status() -> dict[str, Any]:
    if pl is None:
        return {"available": False, "engine": None, "version": None, "error": "polars import failed"}
    return {
        "available": True,
        "engine": "polars",
        "version": getattr(pl, "__version__", None),
        "error": None,
    }


def ohlcv_cache_key(symbol: str, timeframe: str, limit: int, start: int | None, end: int | None) -> str:
    return f"{symbol.upper()}|{timeframe}|{limit}|{start or 0}|{end or 0}"


def ohlcv_cache_ttl_ms(timeframe: str) -> int:
    if timeframe in {"1m", "5m", "15m", "30m"}:
        return 15_000
    if timeframe in {"1H", "4H"}:
        return 60_000
    if timeframe == "1D":
        return 300_000
    return 900_000


def rust_cache_get_json(key: str) -> list[dict[str, Any]] | None:
    if not RUST_OHLCV_CACHE_ENABLED or _rust_core is None:
        return None
    if not hasattr(_rust_core, "redb_cache_get"):
        return None
    try:
        cached = _rust_core.redb_cache_get(RUST_OHLCV_CACHE_PATH, key, None)
    except Exception:  # noqa: BLE001
        return None
    if not cached:
        return None
    try:
        decoded = json.loads(cached)
    except Exception:  # noqa: BLE001
        return None
    return decoded if isinstance(decoded, list) else None


def rust_cache_set_json(key: str, rows: list[dict[str, Any]], ttl_ms: int) -> None:
    if not RUST_OHLCV_CACHE_ENABLED or _rust_core is None:
        return
    if not hasattr(_rust_core, "redb_cache_set"):
        return
    try:
        Path(RUST_OHLCV_CACHE_PATH).parent.mkdir(parents=True, exist_ok=True)
        _rust_core.redb_cache_set(
            RUST_OHLCV_CACHE_PATH,
            key,
            json.dumps(rows, separators=(",", ":"), ensure_ascii=True),
            int(ttl_ms),
        )
    except Exception:  # noqa: BLE001
        return


def normalize_ohlcv_rows(rows: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], str]:
    if not rows:
        return rows, "python"
    if pl is None:
        return rows, "python"
    try:
        frame = pl.DataFrame(rows).sort("time")
        normalized = frame.select(
            [
                pl.col("time").cast(pl.Int64),
                pl.col("open").cast(pl.Float64),
                pl.col("high").cast(pl.Float64),
                pl.col("low").cast(pl.Float64),
                pl.col("close").cast(pl.Float64),
                pl.col("volume").cast(pl.Float64),
            ]
        )
        return [dict(row) for row in normalized.iter_rows(named=True)], "polars"
    except Exception:  # noqa: BLE001
        return rows, "python"


@app.get("/health")
def health() -> dict[str, Any]:
    return {"ok": True, "rustOhlcvCache": rust_ohlcv_cache_status(), "dataframe": dataframe_status()}


@app.get("/quote")
def quote(symbol: str = Query(..., min_length=1)) -> dict[str, Any]:
    yahoo_symbol = to_yahoo_symbol(symbol)
    ticker = yf.Ticker(yahoo_symbol)
    info = ticker.fast_info or {}

    price = as_float(info.get("last_price"), 0.0)
    if price <= 0:
        hist = ticker.history(period="1d", interval="1m")
        if hist.empty:
            raise HTTPException(status_code=404, detail="No quote data available")
        price = as_float(hist["Close"].iloc[-1], 0.0)

    previous_close = as_float(info.get("previous_close"), price)
    change = price - previous_close
    change_percent = (change / previous_close * 100.0) if previous_close else 0.0

    payload = {
        "symbol": symbol,
        "price": price,
        "change": change,
        "changePercent": change_percent,
        "high": as_float(info.get("day_high"), price),
        "low": as_float(info.get("day_low"), price),
        "open": as_float(info.get("open"), price),
        "volume": as_float(info.get("last_volume"), 0.0),
        "timestamp": as_unix_timestamp(info.get("last_time")),
    }
    return {"data": payload}


@app.get("/ohlcv")
def ohlcv(
    symbol: str = Query(..., min_length=1),
    timeframe: str = Query("1D"),
    limit: int = Query(300, ge=10, le=200000),
    start: int | None = Query(default=None),
    end: int | None = Query(default=None),
) -> dict[str, Any]:
    cache_key = ohlcv_cache_key(symbol, timeframe, limit, start, end)
    cache_lookup_started = time.perf_counter()
    cached_rows = rust_cache_get_json(cache_key)
    cache_lookup_ms = round((time.perf_counter() - cache_lookup_started) * 1000.0, 3)
    if cached_rows is not None:
        normalized_rows, dataframe_engine = normalize_ohlcv_rows(cached_rows)
        return {
            "data": normalized_rows,
            "cache": {"hit": True, "engine": "redb", "lookupMs": cache_lookup_ms},
            "dataframe": {"engine": dataframe_engine},
        }

    yahoo_symbol = to_yahoo_symbol(symbol)
    interval, period = map_timeframe(timeframe)
    ticker = yf.Ticker(yahoo_symbol)
    hist = None

    if start is not None:
        start_dt = datetime.fromtimestamp(start, tz=timezone.utc)
        end_dt = datetime.fromtimestamp(end, tz=timezone.utc) if end is not None else datetime.now(tz=timezone.utc)
        if end_dt <= start_dt:
            raise HTTPException(status_code=400, detail="Invalid time range: start must be less than end")

        # Add one day to keep end-date inclusive for daily/weekly/monthly bars.
        hist = ticker.history(
            start=start_dt,
            end=end_dt + timedelta(days=1),
            interval=interval,
            auto_adjust=False,
        )

    if hist is None or hist.empty:
        hist = ticker.history(period=period_for_limit(timeframe, limit), interval=interval, auto_adjust=False)

    if hist.empty:
        raise HTTPException(status_code=404, detail="No OHLCV data available")

    rows: list[dict[str, Any]] = []
    for ts, row in hist.tail(limit).iterrows():
        unix_time = as_unix_timestamp(ts)
        rows.append(
            {
                "time": unix_time,
                "open": as_float(row.get("Open")),
                "high": as_float(row.get("High")),
                "low": as_float(row.get("Low")),
                "close": as_float(row.get("Close")),
                "volume": as_float(row.get("Volume"), 0.0),
            }
        )

    rows, dataframe_engine = normalize_ohlcv_rows(rows)
    cache_store_started = time.perf_counter()
    rust_cache_set_json(cache_key, rows, ohlcv_cache_ttl_ms(timeframe))
    cache_store_ms = round((time.perf_counter() - cache_store_started) * 1000.0, 3)
    return {
        "data": rows,
        "cache": {
            "hit": False,
            "engine": "redb" if rust_ohlcv_cache_status()["available"] else None,
            "lookupMs": cache_lookup_ms,
            "storeMs": cache_store_ms,
        },
        "dataframe": {"engine": dataframe_engine},
    }


@app.get("/search")
def search(q: str = Query(..., min_length=1)) -> dict[str, Any]:
    value = q.strip().upper()
    if not value:
        return {"data": []}

    # yfinance has no stable dedicated search API; return minimal typed seed result.
    candidates = [value]
    if "/" in value:
        candidates.append(to_yahoo_symbol(value))

    result = [
        {
            "symbol": candidates[0],
            "name": candidates[0],
            "type": "stock",
        }
    ]
    return {"data": result}
