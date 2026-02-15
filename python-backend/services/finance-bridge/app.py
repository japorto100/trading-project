from __future__ import annotations

from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any
import sys

from fastapi import HTTPException, Query
import yfinance as yf

PYTHON_BACKEND_ROOT = Path(__file__).resolve().parents[2]
if str(PYTHON_BACKEND_ROOT) not in sys.path:
    sys.path.append(str(PYTHON_BACKEND_ROOT))

from services._shared import create_service_app  # noqa: E402


app = create_service_app("finance-bridge")


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


@app.get("/health")
def health() -> dict[str, Any]:
    return {"ok": True}


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
        unix_time = int(ts.timestamp())
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

    return {"data": rows}


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
