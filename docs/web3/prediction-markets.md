# Prediction Markets fuer Geopolitical Signals

> Status: 2026-02-26  
> Rolle im System: zusaetzlicher Probability-Signal-Layer fuer Events, nicht primaere Preisquelle.

## Warum relevant

Prediction Markets liefern laufend aktualisierte Wahrscheinlichkeiten zu realen Ereignissen.
Fuer Tradeview Fusion sind sie vor allem als Geopolitical-/Macro-Signal wertvoll.

## Baseline-Quellen

- Polymarket
- Kalshi

## Sekundaere Quellen

- Metaculus
- Manifold

## Datenmodell (MVP)

```text
prediction_event
  id
  canonical_event_key
  platform
  question
  category
  region_tags[]
  asset_tags[]
  resolution_date
  last_updated_at

prediction_quote
  event_id
  ts
  probability_yes
  volume_24h
  liquidity
  spread
```

## Integrationsprinzip

1. Go-Connector pro Plattform
2. Normalisierung auf kanonisches Event-Schema
3. Event-Matching (duplikat-/near-duplicate-Erkennung)
4. Confidence-Scoring
5. Divergence-Signal gegen News und Marktpreise
6. **Oracle Cross-Check:** Bei aktiviertem G10-Layer: Prediction-Shift + Preisbewegung + Oracle-Spread → "Signal conflict" markieren statt blindes Follow-Signal (siehe [oracle-integration.md](./oracle-integration.md))

## Confidence-Scoring (einfacher Start)

- Liquiditaet hoch = hoeheres Gewicht
- Aktualitaet hoch = hoeheres Gewicht
- Sehr weite Spreads = niedrigeres Gewicht
- Unklare/mehrdeutige Resolution-Texte = niedrigeres Gewicht

## Was wir vermeiden

- Keine direkte Gleichsetzung von Marktquote mit Wahrheit
- Keine automatische Trading-Execution nur auf einer Quelle
- Kein hartes Produkt-Dependency auf eine einzelne Plattform

## Konkrete Produktfeatures

- Probability-Overlay auf der Geopolitical Map
- 24h-Delta und Volumen im Event-Tooltip
- Divergence Alerts (Prediction vs News vs Price)
- Historische Kalibrierungsansicht pro Plattform/Kategorie

## Verweise

- [README.md](./README.md) – Web3-Index
- [references/README.md](../references/README.md) – externer Referenzindex
- [overview.md](./overview.md)
- [smart-accounts.md](./smart-accounts.md)
- [oracle-integration.md](./oracle-integration.md) – Layer 2, G10 Oracles
