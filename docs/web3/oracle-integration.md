# Oracle Networks – Verifikations-Layer (SOTA 2026)

> **Stand:** März 2026  
> **Rolle:** Layer 2 – Preis-Cross-Check gegen Web2-Provider, **nicht** Primärquelle.  
> **Source of Truth:** Dieses Dokument ist jetzt der Owner fuer den G10-Oracle-Layer. Der externe Referenzindex lebt in [references/README.md](../references/README.md).

---

## 0. G10 Oracle Networks (vollständig)

Wir nutzen **nicht nur Chainlink**. Die Gruppe G10 umfasst 10 Oracle-Netzwerke:

| Oracle | Besonderheit | Priorität |
|--------|--------------|-----------|
| **Chainlink** | De-facto Standard, 17+ Operators, FX/Commodities/Crypto | O1 |
| **Pyth** | Sub-Sekunde Latenz, 120+ Publisher (Jane Street, Jump) | O2 |
| **Band Protocol** | Cosmos-basiert, REST-freundlich, 200+ Feeds | – |
| **Redstone Finance** | LST/LRT-Pricing, günstig für Custom Feeds | – |
| **API3** | First-Party (kein Mittelsmann), dAPIs | – |
| **Stork** | Sehr niedrige Latenz, Fast-Reference | O4 |
| **Chronicle Protocol** | DeFi-/RWA-nahe | O5 |
| **SEDA** | Programmierbare Custom Requests | O6 |
| **Switchboard** | Custom Feeds, VRF, Oracle Jobs | O7 |
| **DIA** | Open-data, multi-chain | O8 |

**Adapter-Priorität (phasenbasiert):** O1/O2 zuerst (Chainlink, Pyth), O3 = Disagreement Detector, O4–O8 als Scaffold. Externe Kataloge: [references/README.md](../references/README.md).

---

## 1. Design-Entscheidung

**Oracles = Verifikations-Layer, NICHT Primär-Datenquelle.**

| Layer | Rolle | Quellen | Liefert |
|-------|-------|---------|---------|
| **Layer 1** | Primäre Daten | Web2 (Finnhub, Polygon, FRED, 40+ Connectors) | OHLCV, Volume, Orderbuch, Fundamentals, Macro, News |
| **Layer 2** | Preis-Verifikation | G10: Chainlink, Pyth, Band, Redstone, API3, Stork, Chronicle, SEDA, Switchboard, DIA | Spot-Preise aus unabhängig aggregierten Quellen |
| **Layer 3** | Enrichment | DefiLlama, Coinglass, mempool.space | DeFi-Leverage, Whale Flows, Netzwerk-Metriken |

**Warum Oracles nicht Layer 1 sind:**
- **Coverage:** Chainlink ~1000 Feeds, Pyth ~295. Wir brauchen zehntausende Instrumente (8000+ China A-Shares, 10k+ US Equities, 50k+ FRED-Serien).
- **Daten-Tiefe:** Oracles liefern einen Spot-Preis – kein OHLCV, kein Volume, keine Candle-History, keine Fundamentals.
- **Latenz:** Chainlink Heartbeat 1–60 Min (Update nur bei Deviation > Threshold). Finnhub WS liefert Ticks in Echtzeit.
- **Kein Macro/Legal/Sentiment:** FRED hat 800k+ Zeitreihen, Oracles haben null davon.

**Warum Oracles trotzdem essentiell sind (Layer 2):**
- **Unabhängige Verifikation:** 17+ Oracle Operators (Chainlink CHF/USD) vs. 1 Provider (Finnhub). Median aus vielen Quellen ist manipulationsresistenter.
- **Oracle Disagreement = eigenes Signal:** Divergenz Web2 vs. Oracle > 1% → Data Quality Alert → Provider-Health-Score runter.
- **Für Crypto besonders wertvoll:** CEX-Preise können manipuliert werden (Wash Trading). Oracle-Preis aus 17+ unabhängigen Quellen ist robuster.

---

## 2. Marktlage 2026 (SOTA)

| Oracle | Marktanteil | Stärken | Schwächen |
|--------|-------------|---------|-----------|
| **Chainlink** | ~70% TVS, 18 Mrd. Messages | Push-Modell, institutionelle Integration (JPMorgan, UBS, Coinbase), 83% oracle-abhängiger Wert auf Ethereum | Latenz, begrenzte Feed-Anzahl |
| **Pyth** | Wachsende Konkurrenz | Pull-Modell, Sub-400ms Updates, Lazer (Q1 2025) bis 400x schneller, 1400+ Assets, 50+ Chains, Hong Kong Stocks/ETFs | Weniger etabliert als Chainlink |
| **Redstone** | Nische | Flexible Daten-Typen, günstig | Kleineres Ökosystem |

**Trading-Plattform-Pattern (APX Finance V2):** Pyth als Anchor, 1% Deviation Circuit Breaker gegen Chainlink – Redundanz und Manipulationsschutz.

---

## 3. Technische Integration

### 3.1 OracleClient (Go)

```go
// base/oracle_client.go – Gruppe G10

type OracleProvider string

const (
    OracleChainlink OracleProvider = "chainlink"
    OraclePyth      OracleProvider = "pyth"
    OracleBand      OracleProvider = "band"
    OracleRedstone  OracleProvider = "redstone"
    OracleAPI3      OracleProvider = "api3"
    OracleStork     OracleProvider = "stork"
    OracleChronicle OracleProvider = "chronicle"
    OracleSEDA      OracleProvider = "seda"
    OracleSwitchboard OracleProvider = "switchboard"
    OracleDIA       OracleProvider = "dia"
)

type OracleConfig struct {
    Provider   OracleProvider
    GatewayURL string            // Chainlink: data.chain.link; Pyth: Hermes API
    Timeout    time.Duration     // Default: 5s
    FeedIDs    map[string]string // "CHF/USD" → Feed Address / Price ID
}

type OraclePrice struct {
    Pair      string
    Price     float64
    Source    OracleProvider
    Timestamp time.Time
    Operators int     // Chainlink: Anzahl Operators
    Deviation float64 // Chainlink: aktuelle Deviation vom Threshold
}

// GetPrice holt aggregierten Preis für ein Pair.
func (c *OracleClient) GetPrice(ctx context.Context, pair string) (*OraclePrice, error)

// CrossCheck vergleicht Oracle-Preis mit Web2-Provider-Preis.
func (c *OracleClient) CrossCheck(ctx context.Context, pair string, web2Price float64) (divergencePct float64, err error)
```

### 3.2 Oracle Disagreement Detector

```go
type OracleDisagreement struct {
    Pair          string
    Web2Provider  string
    Web2Price     float64
    OraclePrice   float64
    OracleSource  OracleProvider
    DivergencePct float64
    Timestamp     time.Time
    IsAlert       bool  // > AlertThreshold
}

// Config:
//   oracle_cross_check:
//     enabled: true
//     alert_threshold_pct: 1.0
//     pairs: [BTC/USD, ETH/USD, XAU/USD, CHF/USD, EUR/USD]
//     check_interval: 5m
```

### 3.3 Pyth Chainlink-Migration

Pyth bietet `PythAggregatorV3` – Chainlink-kompatible Schnittstelle. Migration ohne kompletten Redesign möglich.

---

## 4. Provider-Limits (aus go-research)

| Provider | RPM | Daily | Notes |
|----------|-----|-------|-------|
| Chainlink | null | null | On-Chain Read oder data.chain.link REST. Kostenlos |
| Pyth | null | null | Hermes REST API. Kostenlos, kein Key |
| Band | null | null | REST-Gateway, Cosmos-basiert |
| Redstone | null | null | REST oder On-Chain, flexible Abfragen |
| API3 | null | null | dAPIs, First-Party |
| Stork | – | – | Produktabhängig |
| Chronicle | – | – | Produktabhängig |
| SEDA | – | – | Produktabhängig |
| Switchboard | – | – | Produktabhängig |
| DIA | – | – | Produktabhängig |

---

## 5. Empfohlene Pairs für Cross-Check

| Pair | Chainlink | Pyth | Use Case |
|------|-----------|------|----------|
| BTC/USD | ✓ | ✓ | Crypto-Anker |
| ETH/USD | ✓ | ✓ | Crypto-Anker |
| XAU/USD | ✓ | ✓ | Commodities, UVD-Basket |
| CHF/USD | ✓ | ✓ | FX, UVD-Basket (17 Ops) |
| EUR/USD | ✓ | ✓ | FX |
| SGD/USD | ✓ | ✓ | UVD-Basket, Multi-Chain |

---

## 6. Router-Integration

Nach jedem Web2-Fetch optionaler Oracle Cross-Check:

1. Web2-Preis von Finnhub/Polygon/etc. holen
2. Oracle-Preis von einem oder mehreren G10-Providern holen (O1/O2: Chainlink, Pyth; O4+: Stork, Chronicle, etc.)
3. Divergenz berechnen: `abs((web2 - oracle) / oracle * 100)`
4. Bei Divergenz > 1%: Alert, Provider-Score reduzieren
5. Persistente Divergenz → Data Quality Dashboard

**Multi-Oracle-Cross-Check:** Bei aktivierten O4–O8 kann Divergenz zwischen mehreren Oracles (z.B. Chainlink vs. Pyth vs. Stork) als zusätzliches E_o-Signal genutzt werden.

---

## 7. Referenzen

- [README.md](./README.md) – Web3-Layer-Index
- [references/README.md](../references/README.md) – externer Referenzindex
- [go-research-financial-data-aggregation-2025-2026.md](../go-research-financial-data-aggregation-2025-2026.md) Sek. 14
- [UVD Whitepaper](https://o.day) Sek. 3.3 (Oracle Mechanism), Sek. 8.1 (Oracle Risk)
- [Pyth Chainlink Migration](https://docs.pyth.network/price-feeds/migrate-an-app-to-pyth/chainlink)
- [defi-onchain-data.md](./defi-onchain-data.md) – Layer 3
