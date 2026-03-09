# DeFi & On-Chain Data – Enrichment-Layer (SOTA 2026)

> **Stand:** März 2026  
> **Rolle:** Layer 3 – Zusatz-Kontext für GeoMap, Entropy-Signale, Stress-Indikatoren.  
> **Prinzip:** Open Source first, keine proprietären Dienste.  
> **Source of Truth:** Dieses Dokument ist jetzt der Owner fuer On-Chain- und DeFi-Enrichment. Externe Kataloge liegen unter [references/README.md](../references/README.md).

---

## 1. Übersicht

| Kategorie | Provider | Daten | Use Case |
|-----------|----------|-------|----------|
| **DeFi TVL** | DefiLlama | TVL, Fees, Yields, DEX Volumes, Stablecoin Supply | Leverage-Proxy (E_l), NBFI-Parallel |
| **Derivatives** | Coinglass | OI, Funding Rates, Liquidations, Long/Short Ratio | Crypto-Leverage, Stress |
| **On-Chain Flows** | Whale Alert, Glassnode, CryptoQuant | Wallet-Transfers, Exchange Flows, Miner Flows | GeoMap On-Chain Events |
| **On-Chain Analytics** | IntoTheBlock | Holder Composition, In/Out of Money, Whale Concentration | ML-basierte Metriken, Unrealized P&L |
| **Bitcoin Network** | mempool.space, blockchain.com | Mempool, Fee Pressure, Hash Rate, Block Timing | Netzwerk-Stress |

---

## 2. DefiLlama API

**Quelle:** [api-docs.defillama.com](https://api-docs.defillama.com)

| Endpoint | Daten | Notes |
|----------|-------|------|
| `/overview` | TVL pro Chain | Kein Key, kein Rate-Limit |
| `/protocols` | TVL pro Protokoll | |
| `/fees` | Fees & Revenue | |
| `/yields` | APY, Source | |
| `/volumes` | DEX, Perpetuals | |
| `/stablecoins` | Supply pro Chain | Macro-Signal |
| `/bridges` | Bridge Flows | Chain-Liquidity-Migration |

**Integration:** Go-Connector `internal/connectors/defillama`, REST-Client auf `base.HTTPClient`.

---

## 3. Coinglass API

**Quelle:** [coinglass.com/learn/CoinGlass-API](https://www.coinglass.com/learn/CoinGlass-API-Full-Guide-en)

| Modul | Daten | Abo |
|-------|-------|-----|
| Derivatives | OI, Funding Rates, Liquidations, Long/Short Ratio, Taker Buy/Sell | ab $35/Mo |
| Spot | Prices, Order Book History, Large Trades | |
| Options | OI, Volume History | |
| ETF | BTC, ETH, SOL, XRP ETF Flows | |

**Features:** WebSocket Streaming, L2/L3 Order Book, V4 API.

**Für Tradeview Fusion:** Free Tier für erste Tests; bei Bedarf Paid für Production.

---

## 4. On-Chain Flow Provider

| Provider | Daten | Rate | Notes |
|----------|-------|------|-------|
| **Whale Alert** | Große Transfers (>$500k), Exchange Flows | 10 req/min (Free) | GeoMap Events |
| **Glassnode** | SOPR, MVRV, Exchange Flows, Miner Revenue, Realized Cap | Free eingeschränkt, Pro ab $39/Mo | Gold-Standard Bitcoin On-Chain |
| **CryptoQuant** | Exchange Reserve, Miner Flow, Fund Flow, Stablecoin Supply Ratio | Free eingeschränkt | Komplementär zu Glassnode |
| **IntoTheBlock** | Holder Composition, In/Out of Money, Large TX Volume, Whale Concentration | Free Tier | ML-basierte Metriken |

---

## 5. Bitcoin Network (mempool.space)

**Quelle:** [mempool.space](https://mempool.space) – **Open Source, self-hostbar, kein Key**

| Endpoint | Daten |
|----------|-------|
| `/api/v1/fees/recommended` | Fee-Empfehlungen |
| `/api/v1/mining/pool/hashrate/1w` | Mining Pool Stats |
| `/api/v1/blocks` | Block Timing |
| `/api/v1/mempool` | Mempool State |

**Use Case:** Fee Pressure, Hash Rate, Mining Pool Stats – Entropy-Input für Stress-Signale.

---

## 6. Datenmodell (Entropy-Extension)

```go
// E_l (Leverage Proxy) – geplant
type LeverageProxy struct {
    DefiTVL       float64   // DefiLlama TVL
    FundingRate  float64   // Coinglass aggregate
    OpenInterest float64   // Coinglass OI
    Timestamp    time.Time
}

// E_o (Oracle Divergence) – siehe oracle-integration.md
// E_n (Network Stress) – mempool.space + blockchain.com
type NetworkStress struct {
    MempoolSize   int64
    FeePressure   float64
    HashRate      float64
    BlockInterval float64
}
```

---

## 7. GeoMap Integration

- **On-Chain Events:** Whale Alert → große Transfers als GeoMap-Marker (optional)
- **Arkham Intelligence:** Entity Labels, Wallet Flows – Kontext-Layer (v2)
- **Exposure Templates:** Asset-Buckets pro Event-Typ (z.B. "Red Sea Escalation" → Shipping ETFs, Oil)

---

## 8. Provider-Limits (Konsolidiert)

| Provider | RPM | Daily | Notes |
|----------|-----|-------|-------|
| DefiLlama | null | null | Kein Key, Open Source |
| Coinglass | 10 | null | Free Tier |
| Whale Alert | 10 | null | Free Tier |
| mempool.space | null | null | Kein Key, Open Source |
| blockchain.com | null | null | Kein Key |

---

## 9. Implementierungs-Reihenfolge

1. **DefiLlama** – TVL, Stablecoins (1 Tag, saubere REST-API)
2. **mempool.space** – Mempool, Fees (0.5 Tag, kein Key)
3. **Coinglass** – OI, Funding (Free Tier zuerst)
4. **Whale Alert** – nur bei GeoMap On-Chain Events

---

## 10. Referenzen

- [README.md](./README.md) – Web3-Layer-Index
- [references/README.md](../references/README.md) – externer Referenzindex
- [references/sources/sovereign-and-corridors.md](../references/sources/sovereign-and-corridors.md) – CBDC / De-Dollarization
- [go-research-financial-data-aggregation-2025-2026.md](../go-research-financial-data-aggregation-2025-2026.md) Sek. 13–14
- [oracle-integration.md](./oracle-integration.md) – Layer 2 (E_o Oracle Disagreement)
- [ENTROPY_NOVELTY.md](../ENTROPY_NOVELTY.md) – Entropy-Signale (E_v, E_c, E_m, E_l, E_o)
- [GEOMAP_DATA_CONTRACTS_AND_FEEDBACK.md](../specs/geo/GEOMAP_DATA_CONTRACTS_AND_FEEDBACK.md) – On-Chain Layer
