"""Portfolio analytics: correlations, rolling metrics, drawdown analysis.

Phase 5b — called via Go proxy → /api/v1/portfolio/*.
All computation uses numpy/scipy/pandas; no external API calls.
"""
from __future__ import annotations

from typing import Literal, cast
import numpy as np
import pandas as pd
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------

class AssetOHLCV(BaseModel):
    symbol: str
    close: list[float]
    timestamps: list[str] = Field(default_factory=list)


class CorrelationRequest(BaseModel):
    assets: list[AssetOHLCV]
    method: Literal["pearson", "spearman", "kendall"] = "pearson"


class CorrelationResponse(BaseModel):
    correlation_matrix: dict[str, dict[str, float]]
    diversification_score: float
    cluster_groups: list[list[str]]


class EquityPoint(BaseModel):
    time: str
    equity: float


class RollingMetricsRequest(BaseModel):
    equity_curve: list[EquityPoint]
    window_days: int = 20
    risk_free_rate: float = 0.04  # annualised


class RollingMetricsPoint(BaseModel):
    time: str
    sharpe: float | None
    sortino: float | None
    calmar: float | None


class RollingMetricsResponse(BaseModel):
    points: list[RollingMetricsPoint]
    summary: dict[str, float]


class DrawdownRequest(BaseModel):
    equity_curve: list[EquityPoint]


class DrawdownPeriod(BaseModel):
    start: str
    trough: str
    end: str | None
    depth: float        # negative fraction, e.g. -0.12 = -12 %
    duration_days: int
    recovery_days: int | None


class DrawdownResponse(BaseModel):
    max_drawdown: float
    avg_drawdown: float
    periods: list[DrawdownPeriod]
    underwater_curve: list[dict[str, float]]  # [{time, drawdown}]


# ---------------------------------------------------------------------------
# Correlation
# ---------------------------------------------------------------------------

def _group_by_cluster(symbols: list[str], labels: list[int]) -> list[list[str]]:
    groups: dict[int, list[str]] = {}
    for sym, lab in zip(symbols, labels):
        groups.setdefault(lab, []).append(sym)
    return list(groups.values())


def compute_correlations(req: CorrelationRequest) -> CorrelationResponse:
    if len(req.assets) < 2:
        # Return trivial identity matrix for single asset
        sym = req.assets[0].symbol if req.assets else "unknown"
        return CorrelationResponse(
            correlation_matrix={sym: {sym: 1.0}},
            diversification_score=0.0,
            cluster_groups=[[sym]],
        )

    # Build log-returns DataFrame
    min_len = min(len(a.close) for a in req.assets)
    data = {
        a.symbol: np.log(
            np.array(a.close[-min_len:]) / np.roll(np.array(a.close[-min_len:]), 1)
        )[1:]
        for a in req.assets
    }
    returns = pd.DataFrame(data)
    corr = returns.corr(method=req.method)  # type: ignore[arg-type]

    # Diversification score = 1 - mean |off-diagonal correlation|
    n = len(corr)
    if n > 1:
        upper = corr.values[np.triu_indices(n, k=1)]
        div_score = float(1.0 - np.mean(np.abs(upper)))
    else:
        div_score = 0.0

    # Hierarchical clustering for grouping
    try:
        from scipy.cluster.hierarchy import fcluster, linkage
        from scipy.spatial.distance import squareform

        dist = squareform(np.clip(0.5 * (1 - corr.values), 0, None))
        link = linkage(dist, method="single")
        labels = fcluster(link, t=0.5, criterion="distance").tolist()
        groups = _group_by_cluster(list(corr.columns), labels)
    except Exception:  # noqa: BLE001
        groups = [list(corr.columns)]

    correlation_matrix = cast(dict[str, dict[str, float]], corr.round(4).to_dict())
    return CorrelationResponse(
        correlation_matrix=correlation_matrix,
        diversification_score=round(div_score, 4),
        cluster_groups=groups,
    )


# ---------------------------------------------------------------------------
# Rolling metrics
# ---------------------------------------------------------------------------

def compute_rolling_metrics(req: RollingMetricsRequest) -> RollingMetricsResponse:
    if len(req.equity_curve) < 2:
        return RollingMetricsResponse(points=[], summary={})

    times = [p.time for p in req.equity_curve]
    equity = pd.Series(
        [p.equity for p in req.equity_curve],
        index=pd.to_datetime(times),
    )
    returns = equity.pct_change().dropna()
    window = max(req.window_days, 2)
    rf_daily = req.risk_free_rate / 252.0

    rolling = returns.rolling(window, min_periods=max(window // 2, 2))
    mean_ret = rolling.mean()
    std_ret = rolling.std()

    downside = returns.clip(upper=0.0)
    down_std = downside.rolling(window, min_periods=max(window // 2, 2)).std()

    rolling_sharpe = (mean_ret - rf_daily) / std_ret * np.sqrt(252)
    rolling_sortino = (mean_ret - rf_daily) / down_std.replace(0, np.nan) * np.sqrt(252)

    # Calmar: annualised return / |max rolling drawdown|
    cumulative = (1 + returns).cumprod()
    rolling_max = cumulative.rolling(window, min_periods=1).max()
    drawdown = (cumulative - rolling_max) / rolling_max.replace(0, np.nan)
    rolling_max_dd = drawdown.rolling(window, min_periods=1).min().abs()
    ann_return = mean_ret * 252
    rolling_calmar = ann_return / rolling_max_dd.replace(0, np.nan)

    points: list[RollingMetricsPoint] = []
    for ts in returns.index:
        ts_value = pd.Timestamp(ts)
        s = rolling_sharpe.get(ts)
        so = rolling_sortino.get(ts)
        ca = rolling_calmar.get(ts)
        points.append(RollingMetricsPoint(
            time=ts_value.isoformat(),
            sharpe=None if (s is None or not np.isfinite(s)) else round(float(s), 4),
            sortino=None if (so is None or not np.isfinite(so)) else round(float(so), 4),
            calmar=None if (ca is None or not np.isfinite(ca)) else round(float(ca), 4),
        ))

    valid_sharpe = [p.sharpe for p in points if p.sharpe is not None]
    valid_sortino = [p.sortino for p in points if p.sortino is not None]
    summary = {
        "avg_sharpe": round(float(np.mean(valid_sharpe)), 4) if valid_sharpe else 0.0,
        "avg_sortino": round(float(np.mean(valid_sortino)), 4) if valid_sortino else 0.0,
    }

    return RollingMetricsResponse(points=points, summary=summary)


# ---------------------------------------------------------------------------
# Drawdown analysis
# ---------------------------------------------------------------------------

def compute_drawdown_analysis(req: DrawdownRequest) -> DrawdownResponse:
    if len(req.equity_curve) < 2:
        return DrawdownResponse(
            max_drawdown=0.0,
            avg_drawdown=0.0,
            periods=[],
            underwater_curve=[],
        )

    times = [p.time for p in req.equity_curve]
    equity = pd.Series(
        [p.equity for p in req.equity_curve],
        index=pd.to_datetime(times),
    )

    peak = equity.cummax()
    underwater = (equity - peak) / peak.replace(0, np.nan)
    max_dd = float(underwater.min())
    avg_dd = float(underwater[underwater < 0].mean()) if (underwater < 0).any() else 0.0

    underwater_curve = [{"time": str(t), "drawdown": round(float(v), 6)} for t, v in underwater.items()]

    # Identify distinct drawdown periods
    periods: list[DrawdownPeriod] = []
    in_dd = False
    start_idx = 0
    trough_idx = 0
    trough_val = 0.0
    ts_list = equity.index.tolist()

    for i, val in enumerate(underwater):
        if val < 0:
            if not in_dd:
                in_dd = True
                start_idx = i
                trough_idx = i
                trough_val = val
            elif val < trough_val:
                trough_idx = i
                trough_val = val
        else:
            if in_dd:
                start_ts = pd.Timestamp(ts_list[start_idx])
                trough_ts = pd.Timestamp(ts_list[trough_idx])
                end_ts = pd.Timestamp(ts_list[i])
                duration = (end_ts - start_ts).days
                recovery = (end_ts - trough_ts).days
                periods.append(DrawdownPeriod(
                    start=start_ts.isoformat(),
                    trough=trough_ts.isoformat(),
                    end=end_ts.isoformat(),
                    depth=round(float(trough_val), 6),
                    duration_days=int(max(duration, 0)),
                    recovery_days=int(max(recovery, 0)),
                ))
                in_dd = False

    # Open drawdown at end of series
    if in_dd:
        start_ts = pd.Timestamp(ts_list[start_idx])
        trough_ts = pd.Timestamp(ts_list[trough_idx])
        end_ts = pd.Timestamp(ts_list[-1])
        duration = (end_ts - start_ts).days
        periods.append(DrawdownPeriod(
            start=start_ts.isoformat(),
            trough=trough_ts.isoformat(),
            end=None,
            depth=round(float(trough_val), 6),
            duration_days=int(max(duration, 0)),
            recovery_days=None,
        ))

    # Sort by depth (worst first)
    periods.sort(key=lambda p: p.depth)

    return DrawdownResponse(
        max_drawdown=round(max_dd, 6),
        avg_drawdown=round(avg_dd, 6),
        periods=periods,
        underwater_curve=underwater_curve,
    )
