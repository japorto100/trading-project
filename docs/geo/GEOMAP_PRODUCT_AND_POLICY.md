# GeoMap Product and Policy

> **Stand:** 09. Maerz 2026
> **Zweck:** Produktziele, Governance, Risiko- und Policy-Leitplanken fuer GeoMap.
> **Source-of-Truth-Rolle:** Owner fuer Product-Scope, Governance, Security-/Legal-Rahmen und operative Leitlinien.
> **Quelle:** migriert aus `docs/GEOMAP_OVERVIEW.md` (Pre-Split-Archiv in `docs/archive/`).

---

## Scope und Abgrenzung

- Normative GeoMap-Spec unter `docs/specs/geo/`
- Root-GeoMap-Dateien sind nach Split archiviert und aus aktivem Root entfernt

---

## 0. Purpose

Master blueprint fuer GeoMap: product spec, engineering spec, roadmap v1→v3.  
Kernprinzip: system proposes, human confirms, map persists only confirmed intelligence.

---


## 1. Red-thread guiding questions

1. Main goal: visualization only, or direct trading signal control?
2. Static/manual or live/API-driven?
3. Granularity: countries only, or regions/hotspots?
4. Which categories must be represented?
5. Which timeline behavior is needed?
6. Which UI interactions are mandatory?
7. Standalone fullscreen or embedded mode?
8. Which sources are mandatory first?
9. How to suppress noise and keep only signal?
10. How to map geopolitical events to concrete assets?

---


## 2. Scope (v2/v3 noch offen)

- **v2:** better projection/geometry, anti-noise alerting controls
- **v3:** ML-assisted ranking, scenario/regime-state, probabilistic impact hints
- **Out-of-scope v1:** autonomous execution, zero-touch persistence, model-only approval

---


## 4. Signal vs noise policy

- Maximize precision, accept lower recall, enforce manual review gate.
- Confidence ladder: C0 (unverified) … C4 (official + market-impact). Nur C3/C4 → high-priority alerts.
- Policy: No direct persistence from unverified text; hard-signal adapters create priority candidates; source conflict lowers confidence.

---


## 5. UX — offene Punkte

### 9.3 Keyboard Shortcuts — [ ] offen

- `M` marker, `L` line, `P` polygon, `T` text
- `Delete` remove selected, `Ctrl+Z` undo, `Ctrl+Shift+Z` redo
- `C` open candidates, `R` toggle region layer  
**Ist:** Nur `c` implementiert.

### 9.4 Accessibility — [ ] offen

- keyboard reachable controls, strong dark-mode contrast, non-color-only severity encoding, **aria labels on all actions**  
**Ist:** Keine aria-Labels im Code.

### 9.2 Multi-Select — [ ] offen

- multi-select markers → bulk updates  
**Ist:** Nicht implementiert.

*(Event taxonomy, Regions, Reuse, Layout: erledigt — siehe Archiv.)*

---


## 19. Asset mapping framework

### 19.1 Relation types

- beneficiary
- exposed
- hedge
- uncertain

### 19.2 Example

Strait escalation:
- exposed: shipping-dependent importers
- beneficiary: selected energy producers / freight proxies
- hedge: relevant commodity or volatility instruments

### 19.3 Rule

Asset link confidence is independent from event confidence.
High-impact asset links must include analyst rationale.

---


## 20. Alerting framework

Alert classes:
- candidate priority alert,
- severity escalation alert,
- status transition alert,
- asset exposure alert.

Anti-noise controls:
- cooldown by region/category,
- duplicate suppression windows,
- confidence thresholds per class,
- user mute profiles.

Defaults:
- high alert: C3+ and S4+
- medium alert: C2+ and S3+
- low alerts: off by default.

---


## 21. Governance and audit

Every change records:
- actor,
- old/new fields,
- timestamp,
- reason note.

Every candidate/event displays:
- why it exists,
- source set,
- confidence and severity explanation,
- latest change history.

Conflict policy:
- preserve conflict notes,
- reduce confidence until resolved.

---


## 22. Legal and usage constraints

- avoid storing full article bodies unless terms permit.
- store metadata-first: headline, snippet, URL, timestamps.
- unofficial wrappers (Yahoo/yfinance) are fallback only.
- market-data redistribution requires licensing review.

---


## 23. Security and reliability

Security:
- server-side secrets only,
- strict URL/input sanitization,
- output escaping in labels/tooltips.

Reliability:
- per-provider rate budget,
- circuit breaker,
- cache-first pulls for repeated region requests.

---


## 24. Test strategy

Unit:
- scoring logic,
- dedup logic,
- state transitions,
- schema validation.

Integration:
- ingestion -> candidate -> review -> persistence,
- timeline append on every mutation,
- provider outage fallback.

E2E:
- draw + marker workflow,
- candidate review lifecycle,
- region click -> filtered feed,
- timeline interactions.

---


## 26. Suggested env extensions

```env
# Feature flags
NEXT_PUBLIC_ENABLE_GEOPOLITICAL_MAP=true
GEOPOLITICAL_CANDIDATE_MODE=true
GEOPOLITICAL_HARD_SIGNAL_MODE=true

# Polling and limits
GEOPOLITICAL_POLL_INTERVAL_MS=600000
GEOPOLITICAL_CANDIDATE_TTL_HOURS=72
GEOPOLITICAL_MAX_CANDIDATES_PER_RUN=100

# News providers
NEWSDATA_API_KEY=
NEWSAPIAI_API_KEY=
GNEWS_API_KEY=
WEBZ_API_KEY=
NEWSAPI_ORG_API_KEY=

# Optional geopolitics datasets
RELIEFWEB_APPNAME=
ACLED_API_KEY=

# Official source toggles
ENABLE_OFAC_INGEST=true
ENABLE_UK_SANCTIONS_INGEST=true
ENABLE_UN_SANCTIONS_INGEST=true
ENABLE_CENTRAL_BANK_CALENDAR_INGEST=true
```

---


## 28. Open questions (to finalize before implementation)

> **Status-Update 2026-02-18:** Fragen die durch den Code bereits beantwortet sind, markiert.

1. ~~single-user now vs multi-user from day one?~~ **Beantwortet:** Single-User implementiert (kein Auth-Layer fuer Geo)
2. ~~keep simple states only vs add approval states?~~ **Beantwortet:** Simple Lifecycle (active/archived/resolved + candidate confirm/reject/snooze)
3. ~~top 3 categories for first release?~~ **Beantwortet:** Symbol-Katalog hat 9 Kategorien (sanction, conflict, trade, energy, cyber, health, climate, political, financial)
4. ~~first default regions?~~ **Beantwortet:** regions.json hat 11 Regionen (Europe, MENA, East Asia, South Asia, Southeast Asia, Central Asia, Sub-Saharan Africa, North Africa, North America, South America, Oceania)
5. candidate sort order: confidence-first or severity-first? **Offen** (kein Sort-Code sichtbar, wird in der Shell per Array-Reihenfolge angezeigt)
6. asset link edit rights: owner-only or shared? **Offen** (kein Rights-System implementiert)
7. exports in v1 (JSON only) or PNG/PDF too? **Offen** (keine Export-Funktion implementiert)
8. timeline playback in v1 or v2? **Offen** (nicht implementiert)
9. include Reddit in v1 or postpone to v2? **Offen** (nicht implementiert)
10. ~~include macro event markers directly on timeline from day one?~~ **Beantwortet:** Timeline existiert mit Event-Types (created, updated, archived, statusChange, candidateAccepted, candidateRejected)

---


## 29. Proposed defaults if we proceed immediately

> **Status-Update 2026-02-18:** Was tatsaechlich implementiert wurde vs. was noch offen ist.

- ~~single-profile first~~ **Implementiert**
- ~~simple lifecycle states only~~ **Implementiert** (active/archived/resolved + candidate workflow)
- ~~first categories: sanctions, rates, conflict~~ **Erweitert:** 9 Kategorien implementiert (sanction, conflict, trade, energy, cyber, health, climate, political, financial)
- ~~first regions: Europe, MENA, East Asia, South America~~ **Erweitert:** 11 Regionen implementiert
- sort: confidence desc then severity desc -- **Noch offen** (kein Sort-Algorithmus in UI)
- asset edits: owner-only first -- **Noch offen** (kein Rights-System)
- export: JSON in v1, visual exports in v2 -- **Noch offen** (keine Exports)
- timeline playback: v2 -- **Noch offen**
- Reddit: v2 -- **Noch offen**
- ~~macro timeline markers: yes in v1~~ **Implementiert** (6 Event-Types im Timeline-System)

---


## 32. Final recommendation

Build Geopolitical Map as:
- standalone fullscreen module,
- manual-first intelligence surface,
- candidate-based automation with strict review gate,
- phased geospatial stack,
- official-source-first hard signal ingestion,
- explicit asset mapping with analyst rationale.

This matches your requirement: strong control, low noise, scalable toward advanced automation.

---


## 33. Risk register and mitigations

### 33.1 Product risks

- Risk: over-automation introduces false confidence.
  - Mitigation: candidate-only automation, manual confirmation required.
- Risk: UI overload from too many controls.
  - Mitigation: progressive disclosure, simple default mode.
- Risk: inconsistent taxonomy across analysts.
  - Mitigation: strict symbol catalog and category governance.

### 33.2 Technical risks

- Risk: map performance degradation with large annotation volume.
  - Mitigation: clustering, virtualization, layered rendering strategy.
- Risk: source outages or rate-limit failures.
  - Mitigation: circuit breakers, fallback chain, health dashboard.
- Risk: schema drift in third-party APIs.
  - Mitigation: adapter contracts + payload validation + alerting.

### 33.3 Data quality risks

- Risk: duplicate events from multiple feeds.
  - Mitigation: URL/title/time-window dedup and event merge tooling.
- Risk: stale events remain active too long.
  - Mitigation: lifecycle TTL checks and archive reviews.
- Risk: conflicting sources confuse confidence.
  - Mitigation: conflict-aware scoring and explicit analyst notes.

### 33.4 Compliance risks

- Risk: non-compliant content storage from paid news sources.
  - Mitigation: metadata-first storage and provider-term reviews.
- Risk: redistribution constraints on market data.
  - Mitigation: internal analysis mode until licensing approval.
- Risk: public exposure of keys or sensitive configs.
  - Mitigation: server-only env usage + rotation policy.

---


## 34. Operability runbook notes

### 34.1 Daily checks

- Source health endpoint green status.
- Candidate queue volume within normal band.
- No unresolved high-priority candidate older than SLA.
- Timeline integrity check (no missing diffs).

### 34.2 Weekly checks

- Review reject ratio and top noise contributors.
- Tune thresholds for over/under-triggering categories.
- Validate provider quotas against real usage.
- Rotate and verify optional source keys where required.

### 34.3 Incident response quick flow

1. Detect provider or ingestion failure.
2. Disable affected adapter by feature flag.
3. Keep manual workflow active.
4. Backfill missed window after adapter recovery.
5. Record incident and threshold adjustments in changelog.

---


---

## Querverweise

- `GEOMAP_OVERVIEW.md`
- `GEOMAP_FOUNDATION.md`
- `GEOMAP_MODULE_CATALOG.md`
- `GEOMAP_VERIFY_GATES.md`
