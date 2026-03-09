# Frontend Wallet Stack – Wann und Wie (SOTA 2026)

> **Stand:** März 2026  
> **Status:** Nur bei klarem On-Chain-User-Flow aktivieren.  
> **Prinzip:** Kein Wallet-Zwang im Kernprodukt.  
> **Kontext:** [README.md](./README.md) + [smart-accounts.md](./smart-accounts.md) für Web3-Kontext; externer Referenzindex unter [references/README.md](../references/README.md).

---

## 1. Wann Wallet-Integration?

| Szenario | Wallet nötig? | Alternative |
|----------|---------------|-------------|
| Daten lesen (Preise, TVL, Flows) | Nein | Backend-Connectors (Go) |
| Paper Trading | Nein | Bestehend (Prisma, orders-store) |
| CEX-Trading (Alpaca, IBKR) | Nein | Broker-API + Auth |
| On-Chain Trading (DEX, DeFi) | Ja | – |
| Prediction Market Positionen | Evtl. | Polymarket/Kalshi API |
| Smart Account / Gasless UX | Ja | ERC-4337 Stack |
| Signatur/Attestation | Evtl. | WebAuthn, SIWE |

**Go-Kriterium:** Wallet-Integration nur, wenn mindestens ein konkreter On-Chain-User-Flow mit Nachfrage existiert.

---

## 2. Library-Empfehlung 2026: Viem + Wagmi

| Library | Bundle Size | Performance | Status 2026 |
|---------|-------------|--------------|-------------|
| **Viem** | ~27 KB | 2–3x schneller | Aktiv, Wagmi-Team |
| **Ethers.js v6** | ~130 KB | Stabil | Mature, starke Docs |
| **Web3.js** | – | – | **Deprecated März 2025** |

**Empfehlung:** **Viem** für neue Projekte – leichter, schneller, moderne API. Wagmi v2 nutzt Viem intern und reduziert RPC-Calls durch Caching um bis zu 70%.

---

## 3. Viem vs. Ethers.js (Kurz)

| Aspekt | Viem | Ethers.js |
|--------|------|-----------|
| Architektur | Actions (public/wallet) | Provider-basiert |
| Wallet Client | `createWalletClient`, JSON-RPC + Local Accounts | Traditionelle Provider |
| Bundle | 27 KB | 130 KB |
| React | Wagmi v2 (Viem) | ethers + eigene Hooks |
| Use Case | Performance, moderne Apps | Bestehende Projekte, Stabilität |

---

## 4. Wallet-Provider-Integration

**SOTA 2026:** Multi-Wallet-Support erhöht Adoption um 40–60%.

| Tool | Zweck |
|------|-------|
| **RainbowKit** | Multi-Wallet UI, WalletConnect, Injected |
| **Web3Modal** | Alternative zu RainbowKit |
| **ConnectKit** | Lightweight-Option |

**Standards:** EIP-1193 (Provider), EIP-6963 (Multi-Injected), EIP-5792 (Wallet Capabilities).

---

## 5. Account Abstraction (ERC-4337) – 2026 Update

**Native AA (Hegota, H2 2026):** EIP-8141 vereinheitlicht EOA und Smart Accounts.

| Feature | Beschreibung |
|---------|--------------|
| **Paymasters** | Gas-Sponsoring – 87% der UserOps 2026 gas-gesponsert |
| **Session Keys** | Temporäre Signatur-Berechtigung für UI-Flows |
| **Batch Transactions** | Mehrere Aktionen in einer Transaktion |
| **EIP-7702** | EOAs können temporär Smart-Contract-Fähigkeiten erhalten |

**Safe (Gnosis):** Branchenstandard für Enterprise, Multi-Sig, Spending Limits, Social Recovery.

---

## 6. Sicherheits-Checkliste

- [ ] **Nie Private Keys** in Client-Code
- [ ] **Gas-Estimation** vor Bestätigung anzeigen
- [ ] **Token Approvals** auf exakte Beträge begrenzen
- [ ] **Testnets** (Sepolia) vor Mainnet
- [ ] **Klare Fehlermeldungen** bei Rejection/Timeout
- [ ] **Withdrawal Whitelist** (GCT-Pattern) bei Custody

---

## 7. Architektur (Target)

```
Frontend (Next.js/React)
  ├── Auth (next-auth, bestehend)
  ├── Optional: Wallet Mode Toggle
  │     ├── RainbowKit / Web3Modal
  │     ├── Wagmi v2 (Viem)
  │     └── Session Keys (bei Smart Accounts)
  └── Execution
        ├── CEX Adapter (bestehend)
        └── Optional: On-Chain Adapter
              └── Safe / ERC-4337 Stack
```

---

## 8. Rollout-Phasen

| Phase | Inhalt |
|-------|--------|
| **W-0** | Nur Readiness: Schnittstellen dokumentieren, keine Implementierung |
| **W-1** | Feature-Flag: Wallet-Connect optional, ein Flow (z.B. Balance-Anzeige) |
| **W-2** | Pilot mit kleinem Nutzerkreis, Messung: Completion-Rate, Fehlerquote |
| **W-3** | Produktiv nur bei Go-Kriterien (siehe smart-accounts.md) |

---

## 9. Referenzen

- [README.md](./README.md) – Web3-Index
- [references/README.md](../references/README.md) – externer Referenzindex
- [smart-accounts.md](./smart-accounts.md) – ERC-4337, Safe
- [specs/AUTH_SECURITY.md](../specs/AUTH_SECURITY.md) – Security-Normen
- [Viem Docs](https://viem.sh)
- [Wagmi v2](https://wagmi.sh)
- [RainbowKit](https://rainbowkit.com)
