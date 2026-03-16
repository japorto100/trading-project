# Crucix Reference Review

> **Stand:** 16. Maerz 2026  
> **Zweck:** Detailliertes Referenzreview des Open-Source-Projekts `Crucix` fuer GeoMap-/Workspace-Verbesserungen in TradeView Fusion.  
> **Quelle:** https://github.com/calesthio/Crucix  
> **Lokaler Review-Pfad:** `D:/tradingview-clones/_tmp_ref_review/geo/Crucix`  
> **Scope:** UI-/Panel-/Informationsarchitektur, Delta-Logik, Signalaufbereitung, Integrations-Basis fuer unsere GeoMap.  
> **Nicht-Scope:** Direkter Codeimport.

---

## 1. Warum dieses Dokument existiert

`Crucix` zeigt einen sehr dichten, analysten-orientierten "Intelligence Terminal"-Ansatz, der fuer unsere GeoMap besonders relevant ist, weil:

- die Panel-Hierarchie bereits auf "entscheidungsfaehige" Nutzung optimiert ist
- Macro/Markets visuell und inhaltlich first-class eingebettet sind
- Delta/Signalisierung ("was hat sich geaendert?") zentral und nicht nur als Rohdaten dargestellt wird

Dieses Dokument ist ein Umsetzungs-Blueprint fuer TradeView Fusion, nicht nur ein oberflaechliches UI-Feedback.

---

## 2. Repository- und Lizenzlage

## 2.1 Review-Basis

- Lokal geklonter Stand: `2026-03-16`
- Review auf den produktiv relevanten Dateien (`apis/`, `dashboard/`, `lib/`, `server.mjs`, Konfig/README)
- UI-Bildmaterial einbezogen: `docs/boot.png`, `docs/map.png`, `docs/globe.png`, `docs/dashboard.png`

## 2.2 Lizenz

`Crucix` ist laut `package.json` unter **AGPL-3.0-only** veroeffentlicht.

Konsequenz fuer uns:

- Design-/Informationsarchitektur als Referenz: **ja**
- Direkter Copy/Paste oder modulweiser Codeimport: **nein** (ohne bewusste Lizenzentscheidung)
- Sprache JavaScript vs. TypeScript ist **nicht** das eigentliche Risiko; Lizenz und Architektur-Fit sind die Hauptthemen

---

## 3. Verifizierter Ist-Zustand von Crucix

## 3.1 Technischer Kern

- Minimaler Runtime-Stack (Express + modulare `mjs`-Dateien)
- Orchestrator `apis/briefing.mjs` faehrt 27 Quellen parallel
- `dashboard/inject.mjs` verdichtet heterogene Quellen in ein einheitliches UI-Modell
- `lib/delta/engine.mjs` berechnet strukturierte Aenderungen (new/escalated/deescalated)
- `lib/delta/memory.mjs` verwaltet Hot/Cold-Historie + Alert-Cooldown-Logik

## 3.2 UI-Struktur

Monolithische, aber klar segmentierte Dashboard-Struktur in `dashboard/public/jarvis.html`:

- Topbar (Regime/Region/Status)
- Left Rail (Sensor Grid, Nuclear Watch, Risk Gauges, Space Watch)
- Center (Map/Globe + Legend + Controls)
- Lower Grid (Ticker, Sweep Delta, Macro + Markets, Ideas)
- Right Rail (Cross-Source Signals, OSINT Stream, Signal Core)

## 3.3 Bildbasierte Einschatzung

Aus den PNGs:

- **Staerken:** sehr klare visuelle Hierarchie, konsistente Terminal-Aesthetik, starke Karteninszenierung
- **Kritikpunkt:** in voller Breite hohe Informationsdichte, bei laengerer Session moegliche kognitive Ueberladung
- **Wert fuer uns:** das Pattern "Map + entscheidungsorientierte Rail-Panels" passt sehr gut zu GeoMap

---

## 4. Was als Blueprint nutzbar ist

## 4.1 Panel-Informationsarchitektur (hoechster Hebel)

Besonders uebernehmbar als Pattern:

- dediziertes `Macro + Markets` Decision-Panel
- dediziertes `Sweep Delta`-Panel mit Richtung/Schweregrad
- `Cross-Source Signals` als kondensierte Lage-Zusammenfassung
- kleine, scanbare Metric-Cards statt nur langer Textbloecke

## 4.2 Delta-Denke statt Snapshot-Denke

`Crucix` ist stark in:

- "neu vs. eskaliert vs. de-eskaliert"
- signalbasierte Priorisierung
- dedup/cooldown, damit Alerts/Signalpanels nicht rauschen

Das ist fuer GeoMap als Analyst-Workspace relevant, weil Entscheidungen zeitbezogen sind.

## 4.3 Multi-Domain-Korrelation

`Crucix` verknuepft Conflict/OSINT/Macro/Market-Signale.
Fuer uns direkt nutzbar als Blueprint:

- Geo-Events nicht isoliert anzeigen
- immer daneben "Market Transmission" und "Risk Regime" sichtbar halten

---

## 5. Was wir **nicht** uebernehmen sollen

- keine 1:1 Portierung von `jarvis.html`
- keine direkte Uebernahme der `apis/sources/*`-Implementierungen
- keine direkte Uebernahme des Alert-Bot-Layers (`lib/alerts/*`) in der ersten GeoMap-Ausbaustufe
- keine gehaeufte Hardcode-Geotagging-Logik (in Crucix fuer Demo/Utility ok, fuer uns produktiv zu fragil)

---

## 6. Konkretes Mapping auf unsere bestehende GeoMap

Die folgenden bestehenden Files sind primaere Integrationspunkte:

## 6.1 Shell/Layout

- `src/features/geopolitical/GeopoliticalMapShell.tsx`  
  Haupt-Orchestrator; hier werden neue Panel-Komponenten in den bestehenden Ablauf gehaengt.

- `src/features/geopolitical/shell/MapRightSidebar.tsx`  
  Kernziel fuer neue Panels (`GeoMacroMarketsPanel`, `GeoSweepDeltaPanel`).

- `src/features/geopolitical/shell/MapShellHeader.tsx`  
  Optional fuer "Risk Regime" Badge.

## 6.2 State/Contracts

- `src/features/geopolitical/store.ts`  
  Zusatzzustaende fuer Snapshot/Delta/Refresh/Panelzustand.

- `src/features/geopolitical/shell/types.ts`  
  Neue API-Response-Contracts fuer Geo-Dashboard-Snapshot und Delta.

## 6.3 Datenorchestrierung

- `src/features/geopolitical/shell/hooks/useGeopoliticalWorkspaceData.ts`  
  Bestehender Fetch-Knoten fuer Events/Candidates/Timeline/News/Context/GameTheory; hier neue Snapshot/Delta-Fetches integrieren.

- `src/features/geopolitical/hooks/useMacroOverlayData.ts`  
  Bereits vorhandener Macro-Einstieg; kann fuer Panel-Verknuepfung mitgenutzt werden.

- `src/features/geopolitical/MapCanvas.tsx`  
  Optionales Cross-Linking (Panel-Klick -> Map-Fokus / Region-Fokus).

## 6.4 Bereits vorhandene API-Bausteine, die helfen

- `src/app/api/geopolitical/macro-overlay/route.ts`
- `src/app/api/geopolitical/macro-quote/route.ts`
- `src/app/api/market/quote/route.ts`

Damit haben wir schon den Grundstock fuer ein robustes `Macro + Markets`-Panel.

---

## 7. Neue Files, die sinnvoll dazukommen sollten

## 7.1 Frontend Panels

- `src/features/geopolitical/GeoMacroMarketsPanel.tsx`  
  Macro+Markets-Karten (Indexes, Commodities, Rates, Volatilitaet, Regime).

- `src/features/geopolitical/GeoSweepDeltaPanel.tsx`  
  New/Escalated/De-escalated inkl. Severity-Badges und Richtung.

## 7.2 Hooks

- `src/features/geopolitical/hooks/useGeoMacroMarketsSnapshot.ts`  
  Aggregiert Macro + Market + optional Risk-Regime in ein einheitliches Panelmodell.

- `src/features/geopolitical/hooks/useGeoDeltaSnapshot.ts`  
  Liefert Delta-Zustand fuer die Sidebar (nicht nur rohe Timeline).

## 7.3 Contracts

- `src/features/geopolitical/geo-dashboard-contract.ts`  
  Einheitliches TS-Contract-Modell fuer Panel-Daten.

## 7.4 API (optional, aber sauber)

- `src/app/api/geopolitical/market-snapshot/route.ts`  
  serverseitig gebuendelter Snapshot aus bestehender Market/Macro-Lage.

- `src/app/api/geopolitical/delta/route.ts`  
  konsistenter Delta-View fuer UI (statt rein clientseitiger Ableitung).

## 7.5 Tests

- `src/features/geopolitical/GeoMacroMarketsPanel.test.tsx`
- `src/features/geopolitical/GeoSweepDeltaPanel.test.tsx`
- `src/features/geopolitical/geo-dashboard-contract.test.ts`

---

## 8. Empfohlene Umsetzungsreihenfolge

## Phase 1 - Quick Win (UI-Wert sofort sichtbar)

1. `GeoMacroMarketsPanel` in `MapRightSidebar` integrieren
2. `GeoSweepDeltaPanel` mit einfachem Delta-Modell integrieren
3. Basis-Badges fuer `LIVE/DELAYED`, `RISK_ON/RISK_OFF`

## Phase 2 - Datenkonsolidierung

1. Snapshot-Hook/API stabilisieren
2. Delta-Hook/API konsolidieren
3. Cross-Linking: Panel-Interaktion setzt Geo-Filter/Region/Event-Fokus

## Phase 3 - Analyst-Finish

1. Header-Regime-Chip
2. Korrelation-Cards (Conflict + Energy + Vol)
3. Polishing fuer Dichte/Lesbarkeit/Responsive

---

## 9. Risiko- und Qualitaetsnotizen

- **Lizenzrisiko:** AGPL bleibt relevant, auch wenn wir TS statt JS verwenden
- **UX-Risiko:** zu hohe Informationsdichte ohne Priorisierung
- **Technisches Risiko:** mehrere Datenquellen koennen asynchron inkonsistent sein -> Snapshot-Contract klar definieren
- **Produkt-Risiko:** "viel anzeigen" ist nicht automatisch "entscheidungsstark"; Delta- und Regime-Ebene muessen priorisiert werden

---

## 10. Entscheidungsempfehlung fuer TradeView Fusion

Empfohlen ist ein **Blueprint-Transfer ohne Codeimport**:

- Crucix als Referenz fuer Panel-Hierarchie und Delta-Denke
- Umsetzung komplett in unserem React/TypeScript-Stack
- Fokus zuerst auf `Macro + Markets` und `Sweep Delta` im GeoMap-Workspace

Das passt sowohl zu unserer bestehenden GeoMap-Architektur als auch zu unserem Produktziel (trading-relevante geopolitische Entscheidungsoberflaeche).

---

## 11. Review-Abdeckung (Appendix A)

Dieses Kapitel dokumentiert explizit, was im Crucix-Clone einbezogen wurde, damit die Abdeckung nachvollziehbar bleibt.

## 11.1 In Scope und geprueft

- `package.json`, `README.md`, `.env.example`, `crucix.config.mjs`, `server.mjs`, `diag.mjs`
- `dashboard/public/jarvis.html`, `dashboard/public/loading.html`, `dashboard/inject.mjs`
- `lib/delta/*`, `lib/alerts/*`, `lib/llm/*`
- `apis/briefing.mjs`, `apis/utils/*`, `apis/sources/*`, `apis/BRIEFING_PROMPT.md`, `apis/BRIEFING_TEMPLATE.md`
- Bildmaterial: `docs/boot.png`, `docs/map.png`, `docs/globe.png`, `docs/dashboard.png`

## 11.2 Teilweise geprueft (struktur-/output-orientiert)

- Alle `apis/sources/*.mjs` wurden auf Signatur, Rueckgabeform, Fehlerpfade und Signalstruktur geprueft.
- Nicht jede Source wurde zeilenweise forensisch auditiert; fuer Blueprint-Zwecke wurde die Datenvertrags-/Pattern-Ebene verifiziert.

## 11.3 Out of Scope

- `.git/*` und sonstige VCS-Interna
- Runtime-dynamische Daten unter `runs/` (falls lokal vorhanden)
- Operative Bot-Betriebsaspekte ausser Architektur-/Pattern-Ebene

## 11.4 Belastbare Kernaussagen aus dem Review

- Crucix ist als **Panel- und Delta-Blueprint** sehr brauchbar.
- Crucix ist **nicht** als direkter Implementierungsquelltext fuer uns gedacht.
- Hauptnutzen fuer TradeView Fusion liegt in:
  - `Macro + Markets` als first-class Workspace-Panel
  - `Sweep Delta` als priorisierte Aenderungsdarstellung
  - Cross-domain Signalverdichtung statt isolierter Einzelansichten

---

## 12. GeoMap Touchpoint Matrix (Appendix B)

Dieses Mapping verknuepft Crucix-Blueprint-Ideen direkt mit unserer bestehenden GeoMap-Runtime.

| Bestehende Datei | Rolle in GeoMap | Geplanter Eingriff | Risiko | Verify |
| --- | --- | --- | --- | --- |
| `src/features/geopolitical/GeopoliticalMapShell.tsx` | Shell-Orchestrierung | Neue Panels in rechte Workspace-Saeule integrieren; Datenfluss und Toggle-Handling anschliessen | mittel | Layout + Interaction Smoke |
| `src/features/geopolitical/shell/MapRightSidebar.tsx` | Inspector-/Timeline-Container | `GeoMacroMarketsPanel` und `GeoSweepDeltaPanel` als neue Section-Module einhaengen | mittel | Sidebar Render + Tab-Verhalten |
| `src/features/geopolitical/shell/MapLeftSidebar.tsx` | Overlay-Chrome Steuerung | Optional neue Toggles fuer Macro/Delta-Panel-Visibility | niedrig | Keyboard + Toggle A11y |
| `src/features/geopolitical/shell/MapFiltersToolbar.tsx` | Filterbar | Optional Cross-Link von Macro/Delta-Card auf bestehende Filterzustande | mittel | Filter-Regression |
| `src/features/geopolitical/shell/MapViewportPanel.tsx` | Map + Overlays | Keine harte Pflichtaenderung; optional Fokus-Sync aus Panels | niedrig | Viewport/Fokus Verhalten |
| `src/features/geopolitical/MapCanvas.tsx` | Globe/Flat Rendering | Optionales Event-/Region-Focus bei Panel-Aktionen | mittel | Selection/Fokus Smoke |
| `src/features/geopolitical/store.ts` | zentraler Zustand | Panel-Snapshot-/Delta-State und evtl. Visibility Flags | mittel | Store Unit Tests |
| `src/features/geopolitical/shell/types.ts` | Runtime Contracts | Neue Snapshot-/Delta-Response-Types | niedrig | Typecheck/Contract Tests |
| `src/features/geopolitical/shell/hooks/useGeopoliticalWorkspaceData.ts` | Datenorchestrierung | Fetch/Refresh fuer Market-Snapshot + Delta-Snapshot | hoch | Netzwerk-/Errorpath Tests |
| `src/features/geopolitical/hooks/useMacroOverlayData.ts` | bestehender Macro-Feed | Wiederverwendung fuer Panel oder klarer Cut zu neuem Snapshot-Hook | niedrig | Data Fallback Test |
| `src/features/geopolitical/shell/MapShellHeader.tsx` | Headline-/Statuszeile | Optional Regime-Badge (`risk_on`/`risk_off`) | niedrig | Header Snapshot Test |
| `src/app/api/geopolitical/macro-overlay/route.ts` | Macro Overlay API | als Input fuer gebuendelten Snapshot nutzen | niedrig | API contract |
| `src/app/api/geopolitical/macro-quote/route.ts` | Macro Quote API | als Input fuer Panel-Karten nutzen | niedrig | API contract |
| `src/app/api/market/quote/route.ts` | Market Quote API | Quotes fuer Index/Commodity/Vol-Karten nutzen | niedrig | API contract |

---

## 13. Acceptance Criteria pro neuem Modul

Diese Kriterien definieren "done" fuer die empfohlenen neuen Dateien.

## 13.1 `GeoMacroMarketsPanel.tsx`

- Zeigt mindestens 3 Blcke: `Indexes`, `Energy/Commodities`, `Macro/Rates`.
- Jeder Block hat klare Lade-/Error-/Degraded-State-Anzeige.
- Daten sind mit Zeitstempel und `LIVE/DELAYED`-Badge versehen.
- Keine Blockierung des restlichen Sidebars bei Teilfehlern.
- Klick auf Card kann optional bestehenden Filter/Fokus setzen (ohne Hard-Abhaengigkeit).

## 13.2 `GeoSweepDeltaPanel.tsx`

- Trennt explizit in `new`, `escalated`, `de-escalated`.
- Zeigt Richtung und Schweregrad (mindestens low/medium/high oder aehnlich).
- Wenn keine Delta-Daten da sind: klare "No changes"-Darstellung.
- Panel bleibt bei leerer/inkonsistenter Payload stabil.

## 13.3 `useGeoMacroMarketsSnapshot.ts`

- Liefert ein einheitliches, typisiertes Modell fuer das Panel.
- Kapselt Fehler und degradierte Quellen ohne UI-Crash.
- Hat deterministische Fallback-Werte fuer fehlende Teilquellen.

## 13.4 `useGeoDeltaSnapshot.ts`

- Liefert ein UI-faehiges Delta-Modell (nicht nur Rohlisten).
- Unterstuetzt Empty-State und Timestamp.
- Keine seiteneffektreiche Mutation globaler GeoMap-Stores beim Lesen.

## 13.5 `geo-dashboard-contract.ts`

- Enthaelt stabile TS-Contracts fuer:
  - Macro/Markets Snapshot
  - Delta Snapshot
  - Panel-Status (`loading`, `degraded`, `error`)
- Contract ist als zentrale Referenz fuer Hook + UI + API genutzt.

## 13.6 API-Routen (`market-snapshot`, `delta`)

- Geben konsistente `success/error`-Struktur zurueck.
- Enthalten `requestId` und erkennbaren Degraded-Status.
- Leiten Upstream-Fehler als kontrollierte 4xx/5xx Antworten weiter.

---

## 14. Verify-Gate Mapping auf GeoMap-Dokumente

Damit die Crucix-Ableitung owner-konsistent bleibt, wird sie auf bestehende GeoMap-Gates gespiegelt.

## 14.1 Pflicht-Referenzen

- `docs/geo/GEOMAP_VERIFY_GATES.md`
- `docs/geo/GEOMAP_SOURCES_AND_PROVIDER_POLICY.md`
- `docs/geo/GEOMAP_DATA_CONTRACTS_AND_FEEDBACK.md`
- `docs/specs/execution/geomap_closeout.md`

## 14.2 Gate-Mapping fuer die Crucix-Ableitung

- **Contract Gate:** Neue Snapshot-/Delta-Vertraege muessen in `GEOMAP_DATA_CONTRACTS_AND_FEEDBACK.md` gespiegelt sein.
- **Source/Policy Gate:** Macro/Market-Datenverwendung und Degraded-Verhalten muessen in `GEOMAP_SOURCES_AND_PROVIDER_POLICY.md` konsistent dokumentiert sein.
- **UI/UX Gate:** Panel-Visibility, A11y, Responsive und Keyboard-Pfade gegen `GEOMAP_VERIFY_GATES.md` pruefen.
- **Execution Gate:** Umsetzungsschritte und offene Punkte in `geomap_closeout.md` nachfuehren.

## 14.3 Minimaler Verify-Check fuer Phase 1

- Right Sidebar rendert stabil mit und ohne Snapshot-Daten.
- Keine Regressions in Timeline/Inspector-Wechsel.
- Macro/Delta Panels verhalten sich auf Mobile/Tablet kollisionsfrei.
- Fehler in Market-/Macro-API fuehren nur zu lokalem Panel-Degrade, nicht zu Shell-Failure.


