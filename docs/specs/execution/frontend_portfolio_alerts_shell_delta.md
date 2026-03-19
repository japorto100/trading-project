# Frontend Portfolio And Alerts Entry Delta

> **Stand:** 16. Maerz 2026  
> **Zweck:** Folge-Slice fuer globale Notifications/Alerts-Entry-Patterns und
> Portfolio-Entry-Patterns im Frontend. Dieser Slice ersetzt die zu enge Annahme,
> dass Portfolio und Alerts automatisch eigene Shell-Pages brauchen.

> **Status Summary**
> - **Nicht-live abgearbeitet:** globale Alerts als Feature, globale Header-Ownership fuer Notifications/Profile/Settings, Notification-Typisierung + Target-Routing, Trading-Portfolio-Entry via `focus=portfolio`, dokumentierter Mobile/Desktop-Baseline-Entscheid fuer die Inbox, Spec-Sync
> - **Bewusst offen:** Browser-/Live-Verify-Gates, endgueltige Rueckwege ueber echte Nutzerfluesse, spaetere Feinschnitte fuer Settings-Split
> - **Spaetere Produktoptionen:** eigene `/alerts`-Page, eigener Portfolio-Workspace oder `/portfolio`-Route, split-pane Promotion ueber bestehende Trading-Portfolio-Bausteine

---

## 0. Execution Contract

### Scope In

- globale Alerts-/Notifications-Einstiege im Shell-Rahmen
- Bell-/Inbox-/Sheet-/Popover-Patterns fuer Notification-Triage
- Deep-Link-Contracts von Notifications nach Calendar, Trading, GeoMap und spaeter Portfolio
- klare Frontend-Entscheidung, ob Alerts Inbox, Sheet oder Page brauchen
- klare Frontend-Entscheidung, ob Portfolio Panel, Workspace-Entry, Modal oder eigene Page braucht
- Trennung von globalen vs. trading-lokalen Settings-/Profile-/Entry-Elementen
- Return-Context fuer `Notification -> Calendar/Event/Trading/Geo -> back`
- offene Produktfragen und Folge-Gates fuer spaetere Promotion

### Scope Out

- Alert-Engine, providerseitige Delivery, push/email/sms infrastructure
- Portfolio-Analytics-Backend, position valuation logic oder reconciliation engine
- Gateway-/providerseitige Notification-Enrichment-Arbeit

### Mandatory Upstream Sources

- `docs/specs/execution/frontend_intelligence_calendar_delta.md`
- `docs/specs/architecture/FRONTEND_ARCHITECTURE.md`
- `src/components/GlobalTopBar.tsx`
- `src/features/alerts/AlertPanel.tsx`
- `src/features/alerts/storage.ts`
- `src/features/alerts/types.ts`
- `src/features/trading/TradingHeader.tsx`
- `src/features/trading/PortfolioPanel.tsx`
- `src/features/trading/hooks/useMarketStream.ts`

### Architecture Decision Snapshot

- `Alerts / Notifications` sind primaer **global** und gehoeren nicht exklusiv in den Trading-Header.
- `Portfolio` ist primaer **Trading-Workspace-Kontext** und wird nicht automatisch als eigene Shell-Page erzwungen.
- `Settings` muessen in **global** vs. **trading-lokal** getrennt werden, statt pauschal verschoben zu werden.
- Eigene `/alerts`- oder `/portfolio`-Pages bleiben spaetere Optionen, aber nicht Baseline-Pflicht fuer diesen Slice.

---

## 1. Current State

- [x] **FPAE0.1** `AlertPanel` existiert bereits als globaler Header-Einstieg in `GlobalTopBar`
- [x] **FPAE0.2** Account-/Profile-/Auth-Menue ist bereits global in `GlobalTopBar`
- [x] **FPAE0.3** `TradingHeader` ist heute chart-/workspace-orientiert, nicht global-nav-orientiert
- [x] **FPAE0.4** `SettingsPanel` ist jetzt global im `GlobalTopBar` verortet; ein spaeterer Feinschnitt in globale vs. trading-lokale Settings bleibt Folgearbeit
- [x] **FPAE0.5** Portfolio existiert bereits als Trading-Unterflaeche (`PortfolioPanel` und verwandte Panels)
- [x] **FPAE0.6** Trading-Alert-Erzeugung existiert bereits ueber `useMarketStream -> createNotification(...)`
- [x] **FPAE0.7** Calendar-Notification-Deep-Link ist frontend-seitig vorbereitet (`/calendar?origin=notification&focusEvent=...`)

---

## 2. Alerts / Notifications

### A. Global Entry Pattern

- [x] **FPAE1** bestaetigen, dass der primaere Notification-Einstieg global im `GlobalTopBar` bleibt
- [x] **FPAE2** `AlertPanel` als globale Inbox/Sheet/Popover-Owner-Surface definieren
- [x] **FPAE3** entscheiden, ob `AlertPanel` dauerhaft Sheet, Popover oder hybrid sein soll
- [x] **FPAE4** Entry-Regeln zwischen `GlobalTopBar` und `TradingHeader` explizit dokumentieren
- [x] **FPAE5** verhindern, dass ein zweiter konkurrierender Notification-Entry im `TradingHeader` entsteht

### B. Notification Taxonomy

- [x] **FPAE6** Notification-Typen im Frontend modellieren (`event`, `price_alert`, `execution`, `portfolio`, `system`)
- [x] **FPAE7** Ziel-Surface pro Notification-Typ definieren
- [x] **FPAE8** Event-bezogene Notifications nach `calendar` bzw. Shared Event Detail routen
- [x] **FPAE9** markt-/price-alert-bezogene Notifications nach `trading` routen
- [x] **FPAE10** geo-bezogene Notifications nach `geopolitical-map` routen
- [x] **FPAE11** portfolio-bezogene Notifications vorerst nach Trading-Portfolio-Kontext routen
- [x] **FPAE12** systembezogene Notifications in Inbox-only oder Control route einordnen

### C. Inbox Behavior

- [x] **FPAE13** read/unread state im globalen Entry konsistent darstellen
- [x] **FPAE14** mark-read / mark-all-read Verhalten festziehen
- [x] **FPAE15** unread-count / badge behavior im Header definieren
- [x] **FPAE16** leeren Inbox-State gestalten
- [x] **FPAE17** degraded/unavailable Inbox-State gestalten
- [x] **FPAE18** keyboard-/focus-Verhalten fuer Bell + Inbox + Entry-Liste definieren
- [x] **FPAE19** mobile und desktop Verhalten fuer Inbox unterscheiden, falls noetig
  - 17.03.2026: Baseline-Entscheid bleibt vorerst identisch fuer beide Breakpoints (`Sheet` als globaler Inbox-Container); ein Split in Popover/Sheet/Page wird erst bei echter History-/Triage-Last neu geoeffnet

### D. Deep-Linking And Return Context

- [x] **FPAE20** `origin=notification` als allgemeines Frontend-Pattern dokumentieren
- [x] **FPAE21** `focusEvent` / spaetere Focus-Parameter fuer andere Typen definieren
- [x] **FPAE22** Rueckweg `Notification -> Surface -> Event -> back` stabil machen
  - 17.03.2026: `origin=notification`, `focusEvent` und `returnTo` sind als Frontend-Vertrag gesetzt; Shared Event Detail nutzt `returnTo`, waehrend Trading-/Portfolio-Entries aktuell kontrolliert ueber Browser-History zurueckfallen
- [x] **FPAE23** Bell/Inboxes duerfen keine toten oder API-only Ziele oeffnen
- [x] **FPAE24** Legacy-/fallback Notifications ohne Deep-Link sauber behandeln

### E. Optional Future Page

- [x] **FPAE25** Kriterien fuer eine spaetere `/alerts`-Page dokumentieren
Page erst bei Bedarf fuer History, Triage, bulk actions, rules management, acknowledgement, filtering.

---

## 3. Portfolio Entry Model

### A. Baseline Decision

- [x] **FPAE26** bestaetigen, dass Portfolio zunaechst Trading-Workspace-Kontext bleibt
- [x] **FPAE27** explizit festhalten, dass Portfolio **nicht** modal-first geplant wird
- [x] **FPAE28** begruenden, ob Portfolio als Panel, tab, sidebar-state oder dedicated workspace-entry behandelt wird
- [x] **FPAE29** Kriterien fuer spaetere Promotion zu einer eigenen Portfolio-Surface dokumentieren

### B. Trading Integration

- [x] **FPAE30** kanonischen Frontend-Entry fuer `Trading -> Portfolio context` definieren
- [x] **FPAE31** URL-/search-param-/store-Strategie fuer `focus=portfolio` oder aehnliches festlegen
- [x] **FPAE32** Deep-Link-Ziel fuer portfolio-bezogene Notifications definieren
- [x] **FPAE33** Deep-Link-Ziel fuer Calendar/Event-Drilldown in den Portfolio-Kontext definieren
- [x] **FPAE34** Return-Context `Portfolio -> Event -> back` oder `Notification -> Portfolio -> back` dokumentieren
  - 17.03.2026: kanonischer Portfolio-Entry bleibt `/trading?focus=portfolio`; eventbezogene Rueckspruenge sind ueber Shared Event Detail mit `returnTo` vorbereitet, waehrend der Trading-Workspace fuer diesen Slice kontrolliert auf History-basierte Ruecknavigation setzt
- [x] **FPAE35** leere/degradierte Portfolio-Entry-States sichtbar machen

### C. Promotion Criteria

- [x] **FPAE36** Kriterien fuer einen spaeteren eigenen Portfolio-Workspace auflisten
- [x] **FPAE37** Kriterien fuer eine eigene `/portfolio`-Route auflisten
- [x] **FPAE38** Kriterien fuer split-pane oder dual-surface (`Trading` + `Portfolio workspace`) dokumentieren
- [x] **FPAE39** pruefen, ob bestehende Trading-Portfolio-Panels fuer Promotion wiederverwendet werden koennen

---

## 4. Settings / Profile / Header Ownership

- [x] **FPAE40** bestaetigen, dass Profile/Auth global im `GlobalTopBar` bleiben
- [x] **FPAE41** `SettingsPanel` in globale Settings vs. trading-lokale Settings fachlich zerlegen
- [x] **FPAE42** globale Preferences im Header-/Account-Bereich verorten
- [x] **FPAE43** chart-/workspace-nahe Settings im `TradingHeader` oder Trading-Workspace belassen
- [x] **FPAE44** vermeiden, dass identische Settings an zwei Stellen auftauchen
- [x] **FPAE45** Navigation-/header-ownership in Doku klar abgrenzen

---

## 5. Verify-Gates

- [ ] **FPAE.V1** Bell-/Alert-Entry ist global konsistent und nicht trading-exklusiv
- [ ] **FPAE.V2** Notification-Deep-Links oeffnen nur echte Frontend-Ziele
- [ ] **FPAE.V3** Event-Notifications springen korrekt nach Calendar/Event-Kontext
- [ ] **FPAE.V4** Trading-/price-alert Notifications springen korrekt nach Trading
- [ ] **FPAE.V5** Portfolio-bezogene Notifications springen in den Trading-Portfolio-Kontext
- [ ] **FPAE.V6** Settings/Profile sind global vs. trading-lokal sauber getrennt
- [ ] **FPAE.V7** Keine doppelte oder widerspruechliche Header-Entry-Logik bleibt bestehen

---

## 6. Dependency Notes

- Primaere Upstream-Referenz: `execution/frontend_intelligence_calendar_delta.md`
- Dieser Slice ist expliziter Follow-up-Owner fuer `FIC8` und `FIC.V5`
- `Alerts` und `Portfolio` werden absichtlich unterschiedlich behandelt:
  - Alerts = global entry/inbox first
  - Portfolio = trading workspace entry first
- Notification target map:
  - `event` -> `/calendar?origin=notification&focusEvent=...`
  - `price_alert` / `execution` -> `/trading?origin=notification`
  - `portfolio` -> `/trading?origin=notification&focus=portfolio`
  - `geopolitical` -> `/geopolitical-map?origin=notification`
  - `system` -> `/control/overview?origin=notification`
- Promotion criteria:
  - `/alerts` erst wenn History/Triage/bulk actions/rules management noetig sind
  - eigener Portfolio-Workspace erst wenn Analyseumfang das Trading-Panel klar uebersteigt
  - bestehende `PortfolioPanel`-/Analytics-/Optimize-/Kelly-/VaR-Bausteine bleiben Reuse-Basis fuer spaetere Promotion

