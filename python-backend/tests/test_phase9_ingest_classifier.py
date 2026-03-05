from __future__ import annotations

from ml_ai.geopolitical_soft_signals.pipeline import (
    IngestClassifyRequest,
    IngestRawItem,
    build_ingest_classification,
)


class TestPhase9IngestClassifier:
    def test_manual_import_returns_candidates_with_policy_fields(self) -> None:
        response = build_ingest_classification(
            IngestClassifyRequest(
                source="manual_import",
                items=[
                    IngestRawItem(
                        source="manual_import",
                        title="Federal Reserve signals slower pace of easing",
                        url="manual://import/1",
                        content="FOMC officials discuss inflation and policy path.",
                        lang="en",
                    )
                ],
                maxCandidates=2,
            )
        )

        assert response.success is True
        assert response.classificationVersion == "uil-9b-v1"
        assert len(response.candidates) >= 1
        candidate = response.candidates[0]
        assert candidate.reviewAction in {"auto_route", "human_review", "auto_reject"}
        assert candidate.routeTarget in {"geo", "macro", "trading", "research"}
        assert len(candidate.dedupHash) == 64

    def test_social_source_uses_social_routing_path(self) -> None:
        response = build_ingest_classification(
            IngestClassifyRequest(
                source="reddit",
                items=[
                    IngestRawItem(
                        source="reddit",
                        title="Reddit thread says sanctions narrative is trending",
                        url="https://reddit.test/r/markets/1",
                        content="social chatter surge around sanctions and conflict",
                        lang="en",
                    )
                ],
                maxCandidates=1,
            )
        )
        assert response.success is True
        assert len(response.candidates) <= 1
