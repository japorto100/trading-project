# Alert Verification (P0.2 DoD)

Goal:
- verify one `above` and one `below` trigger reproducibly
- verify no duplicate trigger in the same price state

## In-App Self-Check

1. Open alerts panel (`Bell` icon).
2. Click `Self-check`.
3. Expected status:
   - `Self-check passed: above=1, below=1, duplicate=0`

Implementation:
- `src/lib/alerts/index.ts` -> `runAlertVerificationScenario(...)`
- `src/components/AlertPanel.tsx` -> `Self-check` button

Notes:
- The scenario temporarily swaps alert storage during verification and restores previous alerts/notifications afterward.
- It runs deterministic price transitions against the existing alert engine.
