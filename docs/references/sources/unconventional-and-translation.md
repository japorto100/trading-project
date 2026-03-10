# Unconventional and Translation Sources

> **Scope:** Non-English Quellen, Translation-/Extraction-Pfade, inoffizielle
> Quellen und unkonventionelle Discovery-Inputs.

---

## Typische Bereiche

| Bereich | Beispiele |
|---------|-----------|
| Non-English / lokale Daten | NBS China, PBoC-nahe Quellen, lokale Behoerden |
| Translation Bridge | Rohdaten in Go, Uebersetzung/Extraktion in Python |
| Inoffiziell / Scraping | Yahoo unofficial, NSE, investing.com |
| Unkonventionell | YouTube Transcripts, Reddit, Community-Signale |

---

## Expliziter Quellenkatalog

| Quelle | Rolle |
|--------|-------|
| `NBS China` | Nicht-englische offizielle China-Statistik |
| `PBoC` | Chinesische Zentralbank-/Policy-Quellen |
| `lokale Behoerden / ministry sites` | Regionale Primaerquellen ausserhalb englischer APIs |
| `Yahoo (unofficial)` | Inoffizieller fallback feed mit klarer provenance caveat |
| `NSE India` | Inoffizieller / semi-offizieller access path je nach endpoint |
| `investing.com` | Sekundaere / scraping-nahe Referenz, nie Primaerquelle |
| `YouTube transcripts` | OSINT / narrative / speech extraction |
| `Reddit` | Community / retail / social signal input |
| `Community signals / chat exports` | Unkonventionelle Discovery-Inputs mit Human-in-the-loop |

---

## Arbeitsregel

- Diese Quellen sind keine primaeren Truth-Layer.
- Nutzung nur mit klarer Provenance, Confidence und Produktbedarf.
- UIL- und Kontextregeln bleiben in `../../UNIFIED_INGESTION_LAYER.md` und den
  Owner-Docs.

---

## Querverweise

- `../../UNIFIED_INGESTION_LAYER.md`
- `../../POLITICAL_ECONOMY_KNOWLEDGE.md`
- `../../CONTEXT_ENGINEERING.md`
