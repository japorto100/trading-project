# Web3 Overview fuer Tradeview Fusion

> Status: 2026-02-26  
> Prinzip: Web2-first, Web3 nur bei klarem Produktnutzen.

## Zielbild

Tradeview Fusion bleibt im Kern eine datengetriebene Trading- und Geopolitical-Analytics-Plattform.
Web3 wird als optionale Erweiterung betrachtet, nicht als Pflicht-Stack.

## Was wir jetzt nutzen (Phase 1)

- Prediction Markets als zusaetzlicher Probability-Signal-Layer
  - Baseline: Polymarket, Kalshi
  - Sekundaer: Metaculus, Manifold
- Oracle-Feeds nur als Verifikations-Layer
  - Web2 Preis bleibt primaere Quelle
  - Oracle-Disagreement wird als eigenes Qualitaetssignal erfasst

## Was wir bewusst noch nicht forcieren

- Kein "alles on-chain"
- Kein eigener Rollup/Chain-Stack
- Kein Smart-Contract-Zwang fuer normale App-Logik
- Keine Smart-Account-Aktivierung ohne konkrete On-Chain-User-Flows

## Entscheidungsregel (kurz)

- Web2 reicht, wenn Feature nur Daten/Analyse/Visualisierung ist.
- Attestation/Signatur reicht, wenn Nachvollziehbarkeit wichtig ist.
- Smart Account ist sinnvoll, wenn UX fuer On-Chain-Flows relevant wird.
- Smart Contract ist noetig, wenn Regeln trust-minimized zwischen Parteien durchgesetzt werden muessen.

## Prioritaeten (naechste Schritte)

1. Prediction-Market-Connectoren + kanonisches Event-Mapping
2. Divergence-Scoring (Prediction vs News vs Price)
3. Smart-Account-Readiness dokumentieren (ohne Produkt-Rollout)

## Verwandte Dokumente

- [`docs/REFERENCE_PROJECTS.md`](../REFERENCE_PROJECTS.md)
- [`docs/web3/smart-accounts.md`](./smart-accounts.md)
