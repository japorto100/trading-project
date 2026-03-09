# Go Data Router & Base Connector Blueprint

> **Stand:** 09. Maerz 2026
> **Zweck:** Schlanke Root-Leitlinie fuer den Go-Layer, der strukturierte
> Markt-, Macro-, Legal- und Quellen-Daten beschafft, routet und haertet.
> Die volle historische Recherche und die alten Detailtabellen liegen jetzt in
> `docs/archive/go-research-financial-data-aggregation-2025-2026.md`.
> **Nicht dieses Dokuments:** keine GCT-Migrationschronik, kein vollstaendiges
> Provider-Lexikon, keine Options-/Dark-Pool-Feature-Spezifikation.

---

## 1. Rolle dieses Dokuments

Dieses Dokument beantwortet nur noch die aktive Architekturfrage:

- Wie soll der **Go Data Router** fuer strukturierte Daten aufgebaut sein?
- Welche **BaseConnector-Muster** bleiben normative Default-Richtung?
- Welche Quellengruppen brauchen eigene Fetch-/Retry-/Fallback-Semantik?

Alles andere wird bewusst in spezialisierte Dokumente ausgelagert:

- GCT-/Gateway-Absorption: `gct-gateway-connections.md`
- allgemeine Gateway-Grenzen: `GO_GATEWAY.md`
- unstrukturierte Quellen / LLM-Pfade: `UNIFIED_INGESTION_LAYER.md`
- Indicator-/Options-/Dark-Pool-Fachseite: `INDICATOR_ARCHITECTURE.md`
- breite Quelleninventare: `REFERENCE_PROJECTS.md`, `REFERENCE_SOURCE_STATUS.md`,
  `PROVIDER_LIMITS.md` im Archiv

---

## 2. Problem, das bleiben wird

Mit wachsender Quellenzahl reicht eine statische "Provider A, sonst Provider B"-
Logik nicht mehr aus. Der Go-Layer braucht dauerhaft:

1. **Asset-Class- und Gruppen-Routing**
2. **Health-/Error-/Rate-Limit-Bewertung pro Provider**
3. **kontrollierten Fallback statt stiller Zufallswahl**
4. **wiederverwendbare Connector-Basis statt Copy/Paste pro Quelle**

Der Go-Router bleibt damit die Heimat fuer **strukturierte API- und Feed-Daten**.
Er ist nicht die Heimat fuer LLM-Parsing unstrukturierter Texte.

---

## 3. Kernentscheidungen

### 3.1 Go owns structured data routing

Der Go-Layer bleibt Owner fuer:

- Quote-/OHLCV-/Macro-Routing
- Provider-Metadaten und Capabilities
- Retry-/Fallback-/Quota-Entscheidungen
- spaetere Symbol-/Prefix-Kataloge
- gruppenspezifische Fetch-Mechaniken

### 3.2 Contract-first, group-first

Neue Quellen werden nicht als isolierte Einzeladapter erfunden, sondern zuerst
einer **Quellen-Gruppe** zugeordnet. Daraus folgen Default-Bausteine,
Fehlersemantik und Rollout-Reihenfolge.

### 3.3 BaseConnector statt Boilerplate

Die Default-Richtung fuer neue strukturierte Quellen ist:

- gemeinsamer HTTP-/Retry-/Rate-Limit-Basislayer
- gemeinsame Error-Klassifikation
- gruppenspezifische Clients fuer SDMX, Time Series, Bulk, Diff, RSS,
  Translation-Bridge und spaetere Oracle-/Cross-Checks

### 3.4 Fallback ist nicht fuer alle Gruppen gleich

Nicht jede Quelle braucht dieselbe Semantik:

- REST-/WS-Quellen: echte Fallback-/Health-Logik
- Zentralbank-Zeitreihen: oft autoritativ, eher Alert als Fallback
- Bulk-/Diff-/RSS-Quellen: eher Scheduler-/Dedup-/Alert-Logik

---

## 4. Aktive Architekturbausteine

### Adaptive Router

Der Router bewertet Provider nicht nur statisch, sondern mit Metriken wie:

- Error Rate
- Latenz
- Freshness
- Rate-Limit-Headroom
- optionaler Recovery-/Momentum-Faktor

Pattern-Referenzen bleiben dabei nuetzlich, aber nicht bindend:

- `failsafe-go`
- OpenBB ODP
- Bifrost Adaptive Weighting

### Base Connector Layer

Die heute lebendigen Bausteine sind:

- `base/http_client`
- `base/retry`
- `base/ratelimit`
- `base/error_classification`
- `base/capabilities`
- `base/sdmx_client`
- `base/timeseries`
- `base/bulk_fetcher`
- `base/rss_client`
- `base/diff_watcher`
- `base/translation`
- `base/oracle_client`

Die normative Aussage ist nicht "alle existieren perfekt", sondern:
**neue strukturierte Quellen sollen bevorzugt auf diesen Pfaden landen statt
neue Spezialstapel zu erzeugen.**

### Symbol- und Prefix-Mapping

Symbolnormalisierung bleibt eine Go-nahe Daueraufgabe:

- Provider-spezifische Symbole und Prefixe
- spaeterer Symbol-Katalog-Service
- CEX/DEX-/Macro-/Cross-Asset-Mappings

Das gehoert an dieselbe Schicht wie Router- und Capability-Logik.

---

## 5. Quellen-Gruppen, die bleiben sollen

Diese Gruppierung ist weiterhin sinnvoll und soll die Expansion leiten:

| Gruppe | Rolle |
|---|---|
| **REST API** | Standardfall fuer viele strukturierte Provider |
| **WebSocket Streams** | Realtime-Feeds mit Reconnect-/Heartbeat-Logik |
| **SDMX** | standardisierte Statistikquellen ueber gemeinsamen Client |
| **Time Series** | Zentralbank-/Makro-Zeitreihen mit aehnlichem Format |
| **Bulk / Periodic** | periodische Downloads, Cron, Dedup, Idempotenz |
| **RSS / Atom** | Feed-Polling und Source-Dedup |
| **Diff / Watcher** | Listen-/Sanktions-/Policy-Deltas |
| **Translation Bridge** | nicht-englische strukturierte Quellen ueber Go->Python |
| **Oracle / Cross-Check** | Verifikationsschicht, nicht primaerer Feed |
| **Python IPC** | Go-native Weitergabe an Python-Services, wenn noetig |

---

## 6. Priorisierte Rollout-Richtung

Die sinnvolle Reihenfolge bleibt:

1. **Base-Layer stabil halten**
2. **Adaptive Router-/Capability-Metadaten an echte Provider binden**
3. **SDMX + TimeSeries weiter ausbauen**
4. **Bulk/RSS/Diff fuer Geo/Legal/Policy sauber gruppiert erweitern**
5. **nur danach** weitere Spezialquellen wie Oracle-/On-Chain-/Nischenfeeds

Dabei gilt:

- nicht 40 Quellen als 40 Sonderfaelle dokumentieren
- lieber wenige stabile Gruppen + duenne Provider-spezifische Rander

---

## 7. Was bewusst nicht mehr hier lebt

Folgende Inhalte wurden aus dieser Root-Fassung herausgezogen oder sollen dort
nicht mehr weiterwachsen:

- **GCT-Fork-/Vendor-/Rebind-Fragen**
  Diese gehoeren nach `gct-gateway-connections.md`.
- **Gateway-Browser-/SSE-/Boundary-Leitlinien**
  Diese gehoeren nach `GO_GATEWAY.md`.
- **Options-, Dark-Pool- und spezielle Indicator-Feature-Quellen**
  Diese gehoeren primaer nach `INDICATOR_ARCHITECTURE.md`.
- **vollstaendige Provider-, Kosten- und Quellenlisten**
  Diese gehoeren nach `REFERENCE_PROJECTS.md`, `REFERENCE_SOURCE_STATUS.md` und
  `PROVIDER_LIMITS.md`.

---

## 8. Offene Architekturfragen

Noch bewusst offen oder nur teilkonsolidiert:

- wie weit der adaptive Router produktiv echte Health-Gewichtung nutzt
- wie fein die Capability-Matrix im Runtime-Router verankert wird
- wann ein Symbol-Katalog-Service eigener Owner wird
- welche Oracle-/Cross-Check-Signale spaeter produktiv relevant bleiben
- welche Bulk-/Diff-Quellen GeoMap-/Policy-Truth werden

Diese Datei ist dafuer die **kompakte Leitlinie**, nicht mehr das komplette
Arbeitsjournal.

---

## 9. Querverweise

| Frage | Dokument |
|---|---|
| Gateway-Leitlinie / Browser / SSE / Tooling | `GO_GATEWAY.md` |
| GCT-Sonderpfad / Rebind / Absorption | `gct-gateway-connections.md` |
| strukturierte vs. unstrukturierte Ingestion | `UNIFIED_INGESTION_LAYER.md` |
| Indicator-/Options-/Dark-Pool-Fachseite | `INDICATOR_ARCHITECTURE.md` |
| Quelleninventar / tiefe Recherche | `REFERENCE_PROJECTS.md` |
| Provider-Status / Limits | `REFERENCE_SOURCE_STATUS.md` |
| Vollstaendige historische Langfassung | `archive/go-research-financial-data-aggregation-2025-2026.md` |
