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
- `SECO Sanctions` besitzt offiziell eine XML-Linie, der aktuelle Go-Watcher nutzt aber vorerst einen normalisierten JSON-Feed.
- `EU Sanctions` ist im aktuellen Go-Watcher ebenfalls ueber einen normalisierten JSON-Feed eingebunden; die offizielle EU-Maschinen-Schnittstelle ist in der aktuellen Delivery noch nicht als primaerer Runtime-Fetch verdrahtet.

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
- Bereits gescaffoldete Sanctions-/Diff-Quellen werden in `../status.md`
  verfolgt.
- Geo-/Compliance-/Claim-Verknuepfungen bleiben in den jeweiligen Owner-Docs.

---

## Querverweise

- `../status.md`
- `../../specs/geo/GEOMAP_OVERVIEW.md`
- `../../CLAIM_VERIFICATION_ARCHITECTURE.md`
