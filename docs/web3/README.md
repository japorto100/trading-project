# Web3 Dokumentation – Tradeview Fusion

> **Stand:** März 2026  
> **Prinzip:** Web2-first, Web3 als optionale Erweiterung bei klarem Produktnutzen.  
> **SOTA:** Best Practices 2026 aus Industrie und Open-Source-Ökosystem.

---

## Übersicht

Tradeview Fusion ist primär eine datengetriebene Trading- und Geopolitical-Analytics-Plattform. Web3 wird als **optionale Schicht** betrachtet – nicht als Pflicht-Stack. Die Architektur folgt einem klaren Layer-Modell:

| Layer | Rolle | Dokument |
|-------|-------|----------|
| **Layer 1** | Primäre Daten (Web2) | Finnhub, Polygon, FRED, 40+ Connectors |
| **Layer 2** | Preis-Verifikation (G10 Oracles) | [oracle-integration.md](./oracle-integration.md) |
| **Layer 3** | On-Chain Enrichment | [defi-onchain-data.md](./defi-onchain-data.md) |

---

## Dokumenten-Index

| Dokument | Inhalt | Priorität |
|----------|--------|-----------|
| [overview.md](./overview.md) | Zielbild, Entscheidungsregeln, Prioritäten | Kern |
| [oracle-integration.md](./oracle-integration.md) | G10 Oracles (Chainlink, Pyth, Band, Redstone, API3, Stork, Chronicle, SEDA, Switchboard, DIA) – Verifikation, Oracle Disagreement | Hoch |
| [defi-onchain-data.md](./defi-onchain-data.md) | DeFi TVL, Funding Rates, Whale Flows, Mempool | Hoch |
| [prediction-markets.md](./prediction-markets.md) | Polymarket, Kalshi – Probability-Signal-Layer | Mittel |
| [smart-accounts.md](./smart-accounts.md) | ERC-4337, Safe – nur bei On-Chain-Flows | Optional |
| [frontend-wallet-stack.md](./frontend-wallet-stack.md) | viem, Wagmi – wenn Wallet-Integration nötig | Optional |
| [api-design.md](./api-design.md) | Read/Write-Trennung, Finality-aware Reads | Referenz |

---

## Entscheidungsregel (kurz)

- **Web2 reicht**, wenn Feature nur Daten/Analyse/Visualisierung ist.
- **Attestation/Signatur** reicht, wenn Nachvollziehbarkeit wichtig ist.
- **Smart Account** ist sinnvoll, wenn UX für On-Chain-Flows relevant wird.
- **Smart Contract** ist nötig, wenn Regeln trust-minimized zwischen Parteien durchgesetzt werden müssen.

---

## Source of Truth

Der Web3-Layer ist jetzt **owner-owned**:
- **G10 Oracle Networks** – [`oracle-integration.md`](./oracle-integration.md)
- **DeFi/On-Chain** – [`defi-onchain-data.md`](./defi-onchain-data.md)
- **Prediction / Smart Accounts / Wallet-Stack** – die jeweiligen Unterdokumente in diesem Ordner
- **Externer Referenzindex** – [`../references/README.md`](../references/README.md)

---

## Verwandte Dokumente

| Thema | Dokument |
|-------|----------|
| GCT, Portfolio, Exchange | [Portfolio-architecture.md](../Portfolio-architecture.md) |
| Data Router, Connectors | [go-research-financial-data-aggregation-2025-2026.md](../go-research-financial-data-aggregation-2025-2026.md) |
| Auth, Security | [specs/AUTH_SECURITY.md](../specs/AUTH_SECURITY.md) |
| **Externer Referenzindex** | [references/README.md](../references/README.md) |
| Aladdin-Gap-Analyse | [ALADDIN-INSIGHTS-FROM-GEMINI-RESEARCH.md](../ALADDIN-INSIGHTS-FROM-GEMINI-RESEARCH.md) |
