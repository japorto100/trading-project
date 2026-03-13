# Go Clients and Adapters

> **Owner-nahe Doku:** Operative Regeln fuer Router, Connector-Patterns und
> Rollout bleiben in `../../go-research-financial-data-aggregation-2025-2026.md`,
> `../../GO_GATEWAY.md` und `../status.md`.

---

## Baseline / zentral

| Referenz | Typ | Rolle fuer uns |
|----------|-----|----------------|
| `GoCryptoTrader` | GitHub-Projekt | CEX-Crypto-Upstream, Read-/Execution-nahe Baseline |
| `finnhub-go` | GitHub-Projekt | API-Coverage-/Pattern-Referenz; eigener Connector bleibt primaer, Re-Open nur bei klarer Coverage-Luecke oder Wartungsvorteil |

---

## Sekundaer / selektiv

| Referenz | Typ | Rolle fuer uns |
|----------|-----|----------------|
| `CCXT Go` | GitHub-Projekt / Subsystem | Beobachten nur bei echtem Go-Multi-Exchange-Bedarf |
| `go-alpha-vantage` | GitHub-Projekt | Kleine API-Referenz, derzeit kein Kernkandidat |

---

## Arbeitsregel

- Externe Go-Repos sind **Pattern-Quellen**, nicht automatisch produktive
  Dependencies.
- Implementierte und gescaffoldete Quellen werden im aktiven Status ueber
  `../status.md` verfolgt.
- Provider-/Connector-Ausbau bleibt `contract-first`.

---

## Querverweise

- `../../GO_GATEWAY.md`
- `../../gct-gateway-connections.md`
- `../../go-research-financial-data-aggregation-2025-2026.md`
- `../status.md`
