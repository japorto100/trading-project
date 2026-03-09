# Web3 Overview fuer Tradeview Fusion

> **Status:** März 2026  
> **Prinzip:** Web2-first, Web3 nur bei klarem Produktnutzen.  
> **SOTA:** Best Practices 2026 integriert.

---

## Zielbild

Tradeview Fusion bleibt im Kern eine datengetriebene Trading- und Geopolitical-Analytics-Plattform.
Web3 wird als **optionale Erweiterung** betrachtet, nicht als Pflicht-Stack.

---

## Layer-Modell (3 Schichten)

| Layer | Rolle | Dokument |
|-------|-------|----------|
| **Layer 1** | Primäre Daten (Web2) | Finnhub, Polygon, FRED, 40+ Connectors |
| **Layer 2** | Preis-Verifikation (G10 Oracles) | [oracle-integration.md](./oracle-integration.md) |
| **Layer 3** | On-Chain Enrichment | [defi-onchain-data.md](./defi-onchain-data.md) |

---

## Was wir jetzt nutzen (Phase 1)

- **Prediction Markets** als zusaetzlicher Probability-Signal-Layer
  - Baseline: Polymarket, Kalshi
  - Sekundaer: Metaculus, Manifold
  - [prediction-markets.md](./prediction-markets.md)
- **Oracle-Feeds (G10)** nur als Verifikations-Layer
  - Chainlink, Pyth, Band, Redstone, API3, Stork, Chronicle, SEDA, Switchboard, DIA
  - Web2 Preis bleibt primaere Quelle; Oracle-Disagreement = eigenes Qualitaetssignal
  - [oracle-integration.md](./oracle-integration.md), [README.md](./README.md) (Owner-Index)
- **DeFi/On-Chain** als Enrichment (geplant)
  - DefiLlama TVL, Coinglass OI/Funding, mempool.space
  - [defi-onchain-data.md](./defi-onchain-data.md)

---

## Was wir bewusst noch nicht forcieren

- Kein "alles on-chain"
- Kein eigener Rollup/Chain-Stack
- Kein Smart-Contract-Zwang fuer normale App-Logik
- Keine Smart-Account-Aktivierung ohne konkrete On-Chain-User-Flows
- Kein Frontend-Wallet-Zwang im Kernprodukt

---

## Entscheidungsregel (kurz)

- **Web2 reicht**, wenn Feature nur Daten/Analyse/Visualisierung ist.
- **Attestation/Signatur** reicht, wenn Nachvollziehbarkeit wichtig ist.
- **Smart Account** ist sinnvoll, wenn UX fuer On-Chain-Flows relevant wird.
- **Smart Contract** ist noetig, wenn Regeln trust-minimized zwischen Parteien durchgesetzt werden muessen.

---

## Prioritaeten (naechste Schritte)

1. **Oracle-Integration** – G10 Cross-Check (O1/O2: Chainlink, Pyth; O4–O8: Stork, Chronicle, SEDA, Switchboard, DIA)
2. **DeFi/On-Chain Connectors** – DefiLlama, mempool.space (Layer 3)
3. **Prediction-Market-Connectoren** – kanonisches Event-Mapping
4. **Divergence-Scoring** – Prediction vs News vs Price
5. **Smart-Account-Readiness** – dokumentieren (ohne Produkt-Rollout)

---

## Dokumenten-Index

| Dokument | Inhalt |
|----------|--------|
| [README.md](./README.md) | Index, Layer-Übersicht |
| [oracle-integration.md](./oracle-integration.md) | G10 Oracles – Verifikation (Chainlink, Pyth, Band, Redstone, API3, Stork, Chronicle, SEDA, Switchboard, DIA) |
| [defi-onchain-data.md](./defi-onchain-data.md) | DeFi TVL, Funding, Mempool |
| [prediction-markets.md](./prediction-markets.md) | Polymarket, Kalshi |
| [smart-accounts.md](./smart-accounts.md) | ERC-4337, Safe – optional |
| [frontend-wallet-stack.md](./frontend-wallet-stack.md) | viem, Wagmi – wenn nötig |
| [api-design.md](./api-design.md) | Read/Write-Trennung, Finality |

---

## Verwandte Dokumente

- [README.md](./README.md)
- [references/README.md](../references/README.md)
- [go-research-financial-data-aggregation-2025-2026.md](../go-research-financial-data-aggregation-2025-2026.md)
- [Portfolio-architecture.md](../Portfolio-architecture.md)
- [specs/AUTH_SECURITY.md](../specs/AUTH_SECURITY.md)
