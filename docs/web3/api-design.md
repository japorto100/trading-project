# Web3 API Design – Best Practices (SOTA 2026)

> **Stand:** März 2026  
> **Zweck:** Architektur-Prinzipien für Web3-Integration in Tradeview Fusion.  
> **Gilt für:** Go Gateway, Python Services, zukünftige On-Chain-Adapter.  
> **Kontext:** [README.md](./README.md) für den Web3-Layer; externer Referenzindex unter [references/README.md](../references/README.md).

---

## 1. Read/Write-Trennung

**Prinzip:** Read- und Write-Pfade architektonisch trennen.

| Pfad | Charakteristik | Beispiel |
|------|----------------|----------|
| **Read** | Keine Signatur, keine Gas-Kosten, aus indexierten DBs | Preise, Balances, TVL, Oracle-Cross-Check |
| **Write** | Signatur, Gas, Finality | Order-Submission, Token-Transfer, Contract-Interaktion |

**Implikation:** Read-Endpoints sollen nicht von RPC-Latenz oder Gas-Volatilität abhängen. Writes als eigene, abgegrenzte Schicht.

---

## 2. Finality-Aware Reads

**Ethereum PoS:** Blocks finalisieren nach ~12–15 Minuten.

| Read-Level | Bedeutung | Use Case |
|-------------|-----------|----------|
| **latest** | Schnellster, aber nicht final | Live-Dashboard, UX |
| **safe** | 1–2 Blocks zurück, nahe-final | Normale Reads |
| **finalized** | Settlement-grade | Reconciliation, Reporting |

**API-Design:** Read-Level als Query-Parameter oder Header exponieren:

```
GET /api/v1/balance?block=finalized
X-Block-Level: safe
```

**JSON-RPC:** `blockTag` (EIP-1898): `"latest"`, `"safe"`, `"finalized"`.

---

## 3. Interface Contracts

| Protokoll | Standard | Use Case |
|------------|----------|----------|
| REST | OpenAPI 3.x | BFF, Gateway |
| WebSocket | AsyncAPI | Streaming, Subscriptions |
| JSON-RPC | OpenRPC | Ethereum-Kompatibilität |

**Prinzip:** Eine maschinenlesbare Quelle der Wahrheit für Entwickler und Ops.

---

## 4. Transaktions- und Gas-UX

| Element | Best Practice |
|---------|---------------|
| **Gas-Estimation** | Vor Bestätigung anzeigen |
| **Fee-Tiers** | Slow / Standard / Fast (oder EIP-1559) |
| **Error Messages** | User-freundlich, nicht nur `"reverted"` |
| **Timeout** | Konfigurierbar, Retry-Strategie |

---

## 5. EIP-Relevanz 2026

| EIP | Inhalt |
|-----|--------|
| **EIP-4844** | Blob-Transaktionen (Danksharding) |
| **EIP-1898** | Block-Identifier (number, hash, tag) |
| **EIP-1193** | Provider-Interface (Wallet) |
| **EIP-6963** | Multi-Wallet Discovery |
| **ERC-4337** | Account Abstraction |
| **EIP-7702** | EOAs → temporär Smart-Contract-fähig |

---

## 6. Gateway-Integration (Tradeview Fusion)

**Bestehende Patterns:**
- Go Gateway als zentrale Frontdoor
- Read-only Slices für GCT (Quote, Orderbook, Portfolio)
- Kein Wildcard-Proxy, Whitelist für Endpoints

**Web3-Erweiterung:**
- Oracle-Reads: Go-Connector, kein Frontend-RPC
- On-Chain-Balances: über GCT oder dedizierten Connector
- Writes: nur über definierte Execution-Pfade, AuthZ-Enforcement

---

## 7. Referenzen

- [README.md](./README.md) – Web3-Index
- [references/README.md](../references/README.md) – externer Referenzindex
- [7BlockLabs Web3 API Design](https://www.7blocklabs.com/blog/web3-api-design-creating-api-for-web3)
- [go-gct-gateway-connections.md](../go-gct-gateway-connections.md)
- [specs/API_CONTRACTS.md](../specs/API_CONTRACTS.md)
