# Web3 and Oracle Sources

> **Scope:** Oracle-Netzwerke, DeFi-Leverage-, On-Chain- und Crypto-Stress-
> Quellen als Verifikations- oder Enrichment-Layer.

---

## Expliziter Quellenkatalog

### Oracle / Verification Layer

| Quelle | Rolle |
|--------|-------|
| `Chainlink` | Preis-Verifikation / decentralized oracle benchmark |
| `Pyth Network` | Low-latency oracle / cross-check source |
| `Stork` | Zusaetzlicher oracle candidate |
| `Chronicle` | Zusaetzlicher oracle candidate |
| `SEDA` | Oracle / data-delivery candidate |
| `Switchboard` | Oracle network candidate |
| `DIA` | Oracle / market data oracle candidate |

### DeFi / Leverage / Crypto-System Stress

| Quelle | Rolle |
|--------|-------|
| `DefiLlama` | TVL / DeFi ecosystem / yield reference |
| `Coinglass` | Open interest, liquidations, leverage context |
| `Whale Alert` | Large-transfer / wallet flow monitoring |
| `Glassnode` | On-chain analytics / entity-adjusted context |
| `CryptoQuant` | Exchange flows / miner / reserve metrics |

### Bitcoin / On-Chain Network Health

| Quelle | Rolle |
|--------|-------|
| `mempool.space` | Fees, mempool pressure, block timing |
| `blockchain.com` | Bitcoin network metrics / reference series |

---

## Arbeitsregel

- Diese Quellen sind Layer-2/Layer-3 Inputs, nicht der primaere Multi-Asset
  Truth-Layer.
- Vor aktivem Onboarding gilt auch hier die Intake-Reihenfolge aus
  `../../specs/execution/source_selection_delta.md`:
  erst fachliche Auswahl und Tiering, dann Onboarding/Rollout.
- Produktiver Ausbaugrad und providerseitige Umsetzung bleiben in den
  Execution-MDs und den Go-/Web3-Owner-Dokumenten.

---

## Querverweise

- `../status.md`
- `../../specs/execution/source_selection_delta.md`
- `../../web3/README.md`
- `../../web3/oracle-integration.md`
- `../../go-research-financial-data-aggregation-2025-2026.md`
