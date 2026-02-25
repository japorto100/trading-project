from __future__ import annotations

from typing import Any
import pandas as pd


class Ticker:
    fast_info: dict[str, Any] | None

    def __init__(self, ticker: str) -> None: ...

    def history(
        self,
        *,
        period: str | None = ...,
        interval: str | None = ...,
        start: Any = ...,
        end: Any = ...,
        auto_adjust: bool = ...,
    ) -> pd.DataFrame: ...
