# GeoMap Sources and Provider Policy

> **Stand:** 09. Maerz 2026
> **Zweck:** Source-Tiering, Provider-Matrix und Quellenqualitaetsregeln.
> **Source-of-Truth-Rolle:** Owner fuer Source-Auswahl, Hard-/Soft-Signal-Abgrenzung und Provider-Referenzlage.
> **Quelle:** migriert aus `docs/GEOMAP_OVERVIEW.md` (Pre-Split-Archiv in `docs/archive/`).

---

## Scope und Abgrenzung

- Normative GeoMap-Spec unter `docs/specs/geo/`
- Root-GeoMap-Dateien sind nach Split archiviert und aus aktivem Root entfernt

---

## 6. Source strategy: tiers and trust

### 11.1 Source tiers

Tier A (official/high trust):
- central banks,
- sanctions authorities,
- official legal/public notices.

Tier B (structured commercial APIs):
- market/news providers with stable contracts.

Tier C (open/community/unofficial):
- wrappers,
- social feeds,
- forum streams.

### 11.2 Hard-signal first adapters

- Fed/ECB/BoE/BoJ rate schedule and decision pages,
- OFAC sanctions service updates,
- UK sanctions list updates,
- UN sanctions list updates.

### 11.3 Soft-signal candidates

- News APIs,
- selected finance media feeds,
- optional Reddit streams.

Rule: soft signals can only produce candidates, never auto-persistent map events.

### 11.4 Source Bias Awareness

> **Buch-Referenz (Emotion AI):** "Emotion and Facial Recognition in AI" (Slimani et al., Springer 2026), Kapitel "Challenges, Opportunities, and the Road Ahead" -- Geographic Bias, Language Bias, Confirmation Bias in Trainings-Daten und Annotationen. Kapitel "Navigating the Future" -- Cross-Cultural Calibration, Display Rules (kulturell bedingte Ausdruecke die Erkennung verfaelschen).

**Problem:** Unsere Source-Tiers (Sek. 11.1-11.3) definieren Vertrauen, aber nicht **systematische Verzerrungen** der Quellen. Jede Quelle hat inhärente Biases die sich auf Candidate-Qualität auswirken:

| Source-Klasse | Inhärenter Bias | Auswirkung auf GeoMap | Mitigation |
|---|---|---|---|
| **Tier A (Offiziell)** | Verzögerung (legale/politische Abstimmung) + politischer Framing-Bias | Events erscheinen spät, aber zuverlässig. Formulierungen folgen politischer Agenda, nicht Markt-Realität | Zeitstempel-Vergleich mit Tier-B/C. Offizielle Quellen als Bestätigung nutzen, nicht als Erstindikator |
| **Tier B (News APIs)** | Clickbait-Bias + Western Media Overrepresentation | Übertreibung von Severity. Afrikanische/asiatische Events unterrepräsentiert | Severity-Kalibrierung pro Source (Bloomberg schätzt anders als RT). Geographic Coverage Dashboard |
| **Tier C (Social/Reddit)** | Retail-Sentiment-Bias + Manipulation (Bots, Pump-Gruppen) | False Positives bei Crypto-Events. Echo-Chamber-Effekt | Nie als alleinige Quelle für auto-route. Mandatory Cross-Source für `signal`-Klassifikation |
| **Sentiment-Modell (FinBERT / Alternativen, Sek. 18.2)** | Language Bias (EN >> DE/FR/CN) + Training-Data Cutoff | Nicht-englische Events werden mit niedrigerer Confidence scored | Language-Tag als explizites Feld. Confidence-Abschlag für nicht-englischen Input (UIL Sek. 4.5.1). Langfristig: sprachspezifische Modelle (Sek. 18.2 Ensemble-Strategie) |

**Cross-Cultural Calibration (aus dem Emotion-AI-Buch übertragen):**

Das Buch beschreibt "Display Rules" -- kulturelle Normen die bestimmen wie Emotionen ausgedrückt werden (z.B. japanische Kultur unterdrückt negative Ausdrücke öffentlich). Analog haben Nachrichtenquellen kulturelle "Display Rules":

- **Westliche Medien:** Tendenz zur Dramatisierung, explizite Severity-Sprache ("crisis", "collapse")
- **Chinesische Staatsmedien:** Understatement bei eigenen Problemen, Overstatement bei westlichen
- **Golf-Staatsmedien:** OPEC-freundlicher Framing bei Öl-Themen

**Operationalisierung (v2):**
1. `source_bias_profile` als Metadaten-Feld pro Provider (manuell kuratiert)
2. Wenn 2+ Quellen aus derselben Bias-Klasse dasselbe Event reporten: **zählt als 1 Bestätigung**, nicht als 2
3. Cross-Bias-Bestätigung (Tier A + Tier C stimmen überein) erhöht Confidence stärker als Same-Tier-Bestätigung

**Verbindung:** [`UNIFIED_INGESTION_LAYER.md`](./UNIFIED_INGESTION_LAYER.md) Sek. 4.5 (Bias-Awareness generell), [`Advanced-architecture-for-the-future.md`](./Advanced-architecture-for-the-future.md) Sek. 4.8 (Adversarial Robustness), Sek. 8a (Privacy).

---


## 12. Provider matrix — Referenz

Market/News/Sanctions/Behavioral-Analysis-Quellen, Non-Western Sources, Integrations-Reihenfolge:  
**Vollständige Tabellen und Links:** [`../../archive/GEOPOLITICAL_MAP_MASTERPLAN_2026-03-09_pre-split.md`](./archive/GEOMAP_OVERVIEW.md) Sek. 12.1–12.4.


---


## 31. Source appendix (internet-validated)

### 31.1 Map/geospatial stack

- https://github.com/VictorCazanave/react-svg-map
- https://github.com/yanivam/react-svg-worldmap
- https://github.com/StephanWagner/svgMap
- https://github.com/StephanWagner/worldMapSvg
- https://github.com/flekschas/simple-world-map
- https://github.com/benhodgson/markedup-svg-worldmap
- https://d3js.org/d3-geo
- https://github.com/topojson/world-atlas

### 31.2 Market providers and limits/pricing

- https://twelvedata.com/pricing
- https://www.alphavantage.co/support/
- https://www.alphavantage.co/premium/
- https://finnhub.io/docs/api
- https://site.financialmodelingprep.com/pricing-plans
- https://eodhd.com/welcome-special-30
- https://eodhd.com/financial-apis/api-limits
- https://marketstack.com/pricing
- https://marketstack.com/documentation
- https://polygon.io/knowledge-base/article/what-is-the-request-limit-for-polygons-restful-apis
- https://polygon.io/docs/rest/quickstart
- https://coinmarketcap.com/api/pricing/
- https://coinmarketcap.com/api/documentation/v4/
- https://finage.co.uk/product/stocks
- https://fred.stlouisfed.org/docs/api/fred/
- https://github.com/ranaroussi/yfinance
- https://insightsentry.com/

### 31.3 News providers

- https://newsapi.ai/plans
- https://gnews.io/pricing
- https://webz.io/products/news-api/
- https://newsdata.io/blog/pricing-plan-in-newsdata-io/
- https://newsdata.io/blog/newsdata-rate-limit/
- https://newsapi.org/pricing

### 31.4 Official geopolitics and sanctions

- https://ofac.treasury.gov/sanctions-list-service
- https://ofac.treasury.gov/recent-actions/20240506_33
- https://www.gov.uk/government/publications/the-uk-sanctions-list
- https://www.gov.uk/government/publications/uk-sanctions-list-change-in-format
- https://main.un.org/securitycouncil/en/content/un-sc-consolidated-list
- https://scsanctions.un.org/consolidated/
- https://data.europa.eu/en/news-events/news/find-out-about-eu-restrictive-measures-across-globe-through-eu-sanctions-map

### 31.5 Central bank schedules (Kalender)

- https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm
- https://www.ecb.europa.eu/press/accounts/html/index.en.html
- https://www.bankofengland.co.uk/monetary-policy/upcoming-mpc-dates
- https://www.boj.or.jp/en/mopo/mpmsche_minu/

### 31.6 Zentralbank Balance Sheets, On-Chain, Symbol-Universum, weitere Datenquellen

> **Vollstaendige Quellen-Referenz:** Alle Details (APIs, Portale, Wrapper, Frequenz, Formate) sind jetzt verteilt ueber:
> [`docs/references/sources/macro-and-central-banks.md`](./references/sources/macro-and-central-banks.md),
> [`docs/references/sources/market-data.md`](./references/sources/market-data.md)
> und den Web3-Owner unter [`docs/web3/README.md`](./web3/README.md)
>
> **Kurzuebersicht (fuer Geo-Map relevant):**
> - **Zentralbanken:** Fed (FRED/DDP), EZB, BoE (IADB), BoJ, SNB, BIS-Aggregat -- fuer Sek. 35.13 Zentralbank-Filter-Layer
> - **On-Chain:** Arkham Intelligence (Entity Labels, Wallet Flows) -- Kontext-Layer
> - **US-Macro-APIs:** NY Fed, BLS, BEA, Treasury, FDIC, SEC EDGAR
> - **Community-Wrapper:** Rust `iadb-api` (BoE), Python `bojpy` (BoJ), R `SNBdata`/`BOJ`/`pdfetch`

### 31.7 Optional datasets and policy references

- https://acleddata.com/acled-api-documentation
- https://apidoc.reliefweb.int/
- https://www.gdeltproject.org/
- https://support.reddithelp.com/hc/en-us/articles/16160319875092-Reddit-Data-API-Wiki
- https://redditinc.com/policies/data-api-terms

---


---

## Querverweise

- `GEOMAP_OVERVIEW.md`
- `GEOMAP_FOUNDATION.md`
- `GEOMAP_MODULE_CATALOG.md`
- `GEOMAP_VERIFY_GATES.md`
