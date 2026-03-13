# Legal and Regulatory Sources

> **Scope:** Legal-/Regulatory-Quellen, Sanktionslisten, Gerichte, regulatorische
> Feeds und rechtsnahe Datenquellen.

---

## Typische Cluster

| Cluster | Beispiele |
|---------|-----------|
| Sanctions / Diff | OFAC, UN, SECO, EU |
| Courts / Laws | Fedlex, EUR-Lex, CourtListener, CanLII, BAILII |
| Regional Legal Search | AsianLII, AfricanLII / SAFLII, Indian Kanoon, DIFC / ADGM |
| Regulatory / Reports | FINMA Enforcement, FATF, IOSCO, FSB |

---

## Tiering-Schnitt (SS3)

### Global baseline

| Quelle | Warum Baseline |
|--------|----------------|
| `UN Sanctions` | kanonische multilaterale Sanktionsbasis |
| `OFAC SDN` | global relevanter US-Sanktionsanker |
| `EUR-Lex` | EU-Rechts- und Regulierungsbasis |
| `FATF`, `IOSCO`, `FSB` | globale regulatorische und policy-nahe Baseline |

### Tier-1 official

| Quelle | Warum Tier-1 |
|--------|--------------|
| `SECO Sanctions` | Schweiz-relevanter offizieller Sonderfall mit hoher Geo-/Compliance-Relevanz |
| `EU Sanctions` | EU-Restriktionsmassnahmen als produktnaher offizieller Sonderfall |
| `FINMA Enforcement` | Schweizer Regulierungs- und Enforcement-Mehrwert |
| `SEC Enforcement RSS` | US-Enforcement-Feed mit hoher Markt-/Narrativ-Relevanz |

### Tier-1-Mehrwert gegenueber der Baseline

| Quelle | Baseline-Vergleich | Konkreter Mehrwert |
|--------|--------------------|--------------------|
| `SECO Sanctions` | `UN Sanctions` / `OFAC SDN` | Schweiz-spezifische Rechtswirkung, feinere regionale Relevanz und bessere Compliance-Passung fuer CH-bezogene Slices |
| `EU Sanctions` | `UN Sanctions` / `EUR-Lex` | unmittelbarer produktnaher Restriktionslayer mit besserer Sanktionsspezifik und regionaler Durchsetzbarkeit |
| `FINMA Enforcement` | `FSB` / `IOSCO` / `FATF` | konkrete Schweizer Enforcement-Faelle statt nur globaler Policy-Guidance; hoehere Narrative- und Claim-Relevanz |
| `SEC Enforcement RSS` | `SEC Company Facts / Filings` / globale Policy-Baselines | schnellere Durchsetzungs- und Narrativsignale, die allgemeine Filing- oder Policy-Layer nicht abdecken |

### Long-tail deferred

| Quelle | Warum deferred |
|--------|----------------|
| `Fedlex`, `CourtListener`, `CanLII`, `BAILII`, `AsianLII`, `AfricanLII / SAFLII`, `Indian Kanoon`, `DIFC Courts`, `ADGM`, `Global Legal Monitor`, `FINMA RSS / News` | wertvoll fuer spaetere Compliance-/Research-Slices, aber aktuell kein Kern-Onboarding |

---

## Expliziter Quellenkatalog

### Sanctions / Restricted Party / Diff Feeds

| Quelle | Rolle |
|--------|-------|
| `OFAC SDN` | US sanctions list / diff-watcher source |
| `UN Sanctions` | UN sanctions list / canonical multilateral basis |
| `SECO Sanctions` | Swiss sanctions implementation lists |
| `EU Sanctions` | EU consolidated sanctions / restrictive measures |

### Aktuelle Runtime-Notiz

- `OFAC SDN` und `UN Sanctions` koennen im aktuellen Go-Runtime-Pfad direkt auf offiziellen XML-Feeds laufen.
- `SECO Sanctions` besitzt offiziell eine XML-Linie; die SECO-Seite verweist auf die neue XML-Gesamtliste und XSD-Spezifikation seit Dezember 2023. Der aktuelle Go-Watcher bevorzugt jetzt den offiziellen XML-Download als Primaerpfad und faellt bei transienten Problemen auf den normalisierten OpenSanctions-Feed zurueck.
- `EU Sanctions` ist im aktuellen Go-Watcher ebenfalls ueber einen normalisierten JSON-Feed eingebunden. Die offizielle FSF-Dokumentation bestaetigt XML/CSV/PDF plus RSS, aber der durable Robot-/Crawler-Zugang ist in der aktuellen Doku nicht als einfacher anonymer Runtime-Endpoint abgesichert; deshalb ist die primaere EU-Migration noch offen.

### Courts / Laws / Legal Search

| Quelle | Rolle |
|--------|-------|
| `Fedlex` | Swiss federal law / official publications |
| `EUR-Lex` | EU law / directives / regulations / case-law |
| `CourtListener` | US legal opinions / dockets / RECAP ecosystem |
| `CanLII` | Canada legal information institute |
| `BAILII` | British and Irish legal information institute |
| `AsianLII` | Asian regional legal access |
| `AfricanLII / SAFLII` | African legal information access |
| `Indian Kanoon` | Indian court / statutory search |
| `DIFC Courts` | Dubai International Financial Centre legal materials |
| `ADGM` | Abu Dhabi Global Market regulatory/legal sources |

### Regulatory / Enforcement / Policy

| Quelle | Rolle |
|--------|-------|
| `FINMA Enforcement` | Swiss enforcement / supervisory actions |
| `FATF` | AML/CFT standards / lists / evaluations |
| `IOSCO` | Securities-regulation guidance / reports |
| `FSB` | Financial Stability Board reports / policy tracking |
| `Global Legal Monitor` | Legal developments / monitoring feed |
| `SEC Enforcement RSS` | US SEC enforcement updates |
| `FINMA RSS / News` | Regulator feed for Switzerland |

---

## Arbeitsregel

- Diese Datei beschreibt moegliche Quellen, nicht deren Implementierungsstand.
- Source-Onboarding startet hier nicht direkt aus Kataloginteresse, sondern erst nach Tiering in `../../specs/execution/source_selection_delta.md`.
- Bereits gescaffoldete Sanctions-/Diff-Quellen werden in `../status.md`
  verfolgt.
- Persistenzstandard fuer Sanctions-/Diff-Quellen:
  - offizielle XML/CSV-Downloads sind `file-snapshot`
  - raw blobs gehen object-first in Storage
  - normalized sanctions records entstehen danach
  - `EU Sanctions` bleibt bis zum offiziellen Runtime-Switch noch ein
    `api-snapshot`-Sonderfall
- Geo-/Compliance-/Claim-Verknuepfungen bleiben in den jeweiligen Owner-Docs.

---

## Querverweise

- `../status.md`
- `../../specs/execution/source_selection_delta.md`
- `../../specs/execution/source_persistence_snapshot_delta.md`
- `../../specs/geo/GEOMAP_OVERVIEW.md`
- `../../CLAIM_VERIFICATION_ARCHITECTURE.md`
