from __future__ import annotations

from pathlib import Path
from typing import Any
import sys

PYTHON_BACKEND_ROOT = Path(__file__).resolve().parents[2]
if str(PYTHON_BACKEND_ROOT) not in sys.path:
    sys.path.append(str(PYTHON_BACKEND_ROOT))

from services._shared import create_service_app  # noqa: E402
from ml_ai.geopolitical_soft_signals.game_theory import (  # noqa: E402
    GameTheoryImpactRequest,
    GameTheoryImpactResponse,
    build_game_theory_impact,
)
from ml_ai.geopolitical_soft_signals.pipeline import (  # noqa: E402
    SignalRequest,
    SignalResponse,
    build_narrative_shift,
    build_news_cluster,
    build_social_surge,
)


app = create_service_app("geopolitical-soft-signals")


@app.get("/health")
def health() -> dict[str, Any]:
    return {"ok": True}


@app.post("/api/v1/cluster-headlines", response_model=SignalResponse)
def cluster_headlines(payload: SignalRequest) -> SignalResponse:
    return build_news_cluster(payload)


@app.post("/api/v1/social-surge", response_model=SignalResponse)
def social_surge(payload: SignalRequest) -> SignalResponse:
    return build_social_surge(payload)


@app.post("/api/v1/narrative-shift", response_model=SignalResponse)
def narrative_shift(payload: SignalRequest) -> SignalResponse:
    return build_narrative_shift(payload)


@app.post("/api/v1/game-theory/impact", response_model=GameTheoryImpactResponse)
def game_theory_impact(payload: GameTheoryImpactRequest) -> GameTheoryImpactResponse:
    return build_game_theory_impact(payload)
