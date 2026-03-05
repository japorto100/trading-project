# UIL Route Matrix (Next -> Go -> Python)

> Stand: 27 Feb 2026  
> Zweck: Kompaktes Audit-Artefakt fuer UIL-Ownership und Datenfluss.

## Core Principle

- Browser spricht nur Next API.
- Next ist Thin-Proxy fuer UIL-Pfade.
- Go Gateway ist Write-/Domain-Owner fuer UIL.
- Python wird nur intern ueber Go fuer Klassifikation aufgerufen.

## Route Matrix

| Use case | Next route | Go route | Python route | Ownership |
|---|---|---|---|---|
| Classify raw import | `/api/geopolitical/ingest/classify` | `/api/v1/ingest/classify` | `/api/v1/ingest/classify` (`geopolitical-soft-signals`) | Go orchestrates, Python classifies |
| List candidate queue | `/api/geopolitical/candidates` (GET) | `/api/v1/geopolitical/candidates` (GET) | - | Go |
| Create candidate | `/api/geopolitical/candidates` (POST) | `/api/v1/geopolitical/candidates` (POST) | - | Go |
| Candidate accept | `/api/geopolitical/candidates/[candidateId]/accept` | `/api/v1/geopolitical/candidates/{id}/accept` | - | Go |
| Candidate reject | `/api/geopolitical/candidates/[candidateId]/reject` | `/api/v1/geopolitical/candidates/{id}/reject` | - | Go |
| Candidate snooze | `/api/geopolitical/candidates/[candidateId]/snooze` | `/api/v1/geopolitical/candidates/{id}/snooze` | - | Go |
| Candidate reclassify | `/api/geopolitical/candidates/[candidateId]/reclassify` | `/api/v1/geopolitical/candidates/{id}/reclassify` | - | Go |
| Contradictions list/create | `/api/geopolitical/contradictions` | `/api/v1/geopolitical/contradictions` | - | Go |
| Contradiction detail/update | `/api/geopolitical/contradictions/[contradictionId]` | `/api/v1/geopolitical/contradictions/{id}` | - | Go |
| Timeline list | `/api/geopolitical/timeline` | `/api/v1/geopolitical/timeline` | - | Go |
| Soft ingest trigger | `/api/geopolitical/candidates/ingest/soft` | `/api/v1/geopolitical/ingest/soft` | `/api/v1/cluster-headlines`, `/api/v1/social-surge`, `/api/v1/narrative-shift`, `/api/v1/ingest/classify` | Go orchestrates, Python assists |
| Hard ingest trigger | `/api/geopolitical/candidates/ingest/hard` | `/api/v1/geopolitical/ingest/hard` | - | Go |
| Admin seed | `/api/geopolitical/seed` | `/api/v1/geopolitical/admin/seed` | - | Go |
| Ingest runs status | - | `/api/v1/geopolitical/ingest/runs` | - | Go |
| Migration status | - | `/api/v1/geopolitical/migration/status` | - | Go |

## Policy Metadata Contract (UIL)

Diese Felder muessen im Candidate-Fluss durchgaengig bleiben:

- `routeTarget` (`geo|macro|trading|research`)
- `reviewAction` (`auto_route|human_review|auto_reject`)
- `dedupHash` (sha256)

## Notes

- Next alias routes fuer ingest/seed sind gate-geschuetzt und fail-closed, falls Go-owned-Modi nicht aktiv sind.
- Request tracing laeuft ueber `X-Request-ID` von Next -> Go -> interne Downstreams.
