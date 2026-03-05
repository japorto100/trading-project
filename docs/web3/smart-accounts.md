# Smart Accounts in Tradeview Fusion

> Status: 2026-02-26  
> Ziel: Smart Accounts vorbereiten, aber nur bei klarem On-Chain-Mehrwert aktivieren.

## Warum dieses Dokument

Smart Accounts (Account Abstraction) sind kein Selbstzweck.
Fuer Tradeview Fusion sind sie nur dann sinnvoll, wenn Nutzer in der App tatsaechlich On-Chain-Aktionen ausfuehren.

## Produkt-These

- Heute: Kernprodukt ist CEX + Analytics + Geopolitical Map (Web2-first).
- Morgen (optional): On-Chain-Flows fuer Power-User.
- Konsequenz: Smart Accounts als modulare Erweiterung, nicht als Pflicht fuer alle Nutzer.

## Potenzielle Use Cases (nur bei On-Chain-Features)

1. Gasless onboarding fuer neue Nutzer (gesponserte Transaktionen)
2. Session Keys fuer aktive Trading-UI-Flows
3. Policy Guards (z. B. max Betrag, erlaubte Contracts, Zeitfenster)
4. Recovery-Mechanismen fuer Nutzerkonten
5. Team-/Vault-Faelle mit Multi-Owner-Freigaben

## Nicht-Ziele

- Keine erzwungene Wallet-Pflicht im Kernprodukt
- Kein Umbau der gesamten Authentifizierung auf Web3
- Keine Smart-Contracts fuer normale Daten- und Analyse-Features

## Architektur-Integration (target)

```text
Frontend (TS/React)
  -> Auth (bestehend)
  -> Optional Wallet Mode Toggle

Execution Layer
  -> CEX Adapter (bestehend)
  -> Optional On-Chain Adapter (neu)

Wallet Service (optional)
  -> Smart Account Provider Adapter (z. B. Safe/4337 stack)
  -> Policy/Guard Engine
  -> Session Key Manager
```

## Rollout-Plan

### Phase SA-0 (jetzt)

- Nur Readiness: Schnittstellen und Datenmodell festlegen
- Kein Enduser-Rollout

### Phase SA-1 (Pilot)

- Interner Pilot mit kleinem Nutzerkreis
- Nur ein klarer Flow (z. B. gasless execution fuer einen Test-Case)
- Messung: Completion-Rate, Fehlerquote, Support-Aufwand

### Phase SA-2 (optional produktiv)

- Aktivierung fuer Power-User
- Klare Opt-in-UX
- Monitoring + Limits + Incident-Runbook

## Go/No-Go Kriterien

Smart Accounts sind **Go**, wenn alle Punkte zutreffen:

- Es gibt mindestens einen konkreten On-Chain-User-Flow mit Nachfrage.
- UX verbessert sich messbar gegenueber klassischem Wallet-Flow.
- Security/Compliance-Review ist abgeschlossen.
- Betrieb kann Monitoring, Recovery und Key-Risiken tragen.

Smart Accounts sind **No-Go**, wenn:

- Kein klarer Produktnutzen ausser "Web3 haben"
- Unklare Haftungs-/Compliance-Fragen
- Kein Team-Setup fuer Wallet/Key-Operations

## Risiken und Guardrails

- Key-Management-Risiko -> klare Custody-Grenzen + Notfallprozess
- Vendor-Lock-in -> Provider-Adapter statt harter Abhaengigkeit
- UX-Komplexitaet -> Feature-Flag + stufenweiser Rollout
- Compliance-Risiko -> fruehes Legal-Review vor produktiver Aktivierung

## Referenzen

- [Ethereum Account Abstraction](https://ethereum.org/roadmap/account-abstraction/)
- [Safe Smart Accounts](https://docs.safe.global/)
- [`docs/web3/overview.md`](./overview.md)
- [`docs/REFERENCE_PROJECTS.md`](../REFERENCE_PROJECTS.md)
