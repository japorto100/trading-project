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
| `Finanzmarktwelt (YouTube)` | Deutscher Macro-/Marktkommentar als sekundaire Discovery-Quelle (nie primaerer Truth-Layer) |
| `Reddit` | Community / retail / social signal input |
| `Bluesky Public Feeds` | Social-discourse Monitoring fuer Narrative-Shift-Detektion |
| `Telegram Public Channels` | Fast-moving Channel-Signale (immer mit Compliance-/Provenance-Guardrails) |
| `KiwiSDR Directories` | RF-/Radio-Context Discovery (nicht als primaerer Faktenfeed) |
| `Community signals / chat exports` | Unkonventionelle Discovery-Inputs mit Human-in-the-loop |

---

## Tiering-Schnitt (SS7)

### Default-Einstufung

| Kategorie | Regel |
|-----------|-------|
| `NBS China`, `PBoC`, `lokale Behoerden / ministry sites` | nur dann aktivieren, wenn Baseline-/Tier-1-Quellen eine dokumentierte Luecke lassen und die Translation-Bridge echten Mehrwert bringt |
| `Yahoo (unofficial)`, `NSE India`, `investing.com` | inoffizielle Fallbacks, nie Primaerquelle |
| `YouTube transcripts`, `Reddit`, `Bluesky`, `Telegram`, `KiwiSDR directories`, `Community signals / chat exports` | Discovery-/OSINT-Layer, nicht strukturierter Truth-Layer |

### Fazit

- Diese Datei ist fast komplett `long-tail deferred`.
- Re-Open nur mit klarer Provenance, Human-in-the-loop und dokumentiertem Produktbedarf.

---

## Arbeitsregel

- Diese Quellen sind keine primaeren Truth-Layer.
- Source-Onboarding startet hier nicht direkt aus Kataloginteresse, sondern erst nach Tiering in `../../specs/execution/source_selection_delta.md`.
- Nutzung nur mit klarer Provenance, Confidence und Produktbedarf.
- UIL- und Kontextregeln bleiben in `../../UNIFIED_INGESTION_LAYER.md` und den
  Owner-Docs.

---

## Querverweise

- `../../UNIFIED_INGESTION_LAYER.md`
- `../../specs/execution/source_selection_delta.md`
- `../../POLITICAL_ECONOMY_KNOWLEDGE.md`
- `../../CONTEXT_ENGINEERING.md`
