# GeoMap Performance Baseline

**Stand:** 26. Feb 2026
**Scope:** FPS-Targets und Messverfahren für GeoMap v2 (d3-geo, Canvas/SVG)

---

## Messmethodik

- **Tool:** Chrome DevTools → Performance Tab (Record 10 Sekunden, Interaktion: Globe-Rotation)
- **Build:** `bun run build` Production Bundle (`next build`, NODE_ENV=production)
- **Hardware:** Intel Core i7-10th Gen, 16 GB RAM, NVIDIA GTX 1660 (oder besser)
- **Browser:** Chrome 121+ (kein throttling, kein DevTools-Overhead während Messung)
- **Isolation:** Keine anderen JS-intensiven Tabs

---

## FPS-Targets

| Szenario | Events | Erwarteter FPS | Gate-Trigger |
|:---------|:-------|:---------------|:-------------|
| **A** — Leicht | 50 gleichzeitige GeoEvents auf Globe | ≥ 60 FPS | — |
| **B** — Mittel | 200 gleichzeitige GeoEvents + Heatmap-Layer | ≥ 45 FPS | Gate A: < 45 FPS → deck.gl |
| **C** — Schwer | 1000 GeoEvents + Heatmap + 10 Transmission Channels | ≥ 30 FPS | — |

**Wichtig:** FPS gemessen als Median über 10 Sekunden Rotation. Einzelne Frames < Target sind
akzeptabel; der Median muss das Ziel erreichen.

---

## Messprotokoll

```
1. bun run build
2. next start (Port 3000)
3. Chrome öffnen: localhost:3000/geopolitical-map
4. DevTools Performance öffnen (Shortcut: F12 → Performance)
5. Test-Dataset laden:
   Szenario A: POST /api/geopolitical/seed mit 50 Events
   Szenario B: POST /api/geopolitical/seed mit 200 Events
   Szenario C: POST /api/geopolitical/seed mit 1000 Events
6. Record 10 Sekunden starten
7. Globe per Maus rotieren (konstante Bewegung)
8. Record stoppen → FPS aus "Frames" Chart ablesen
9. Median-FPS notieren
```

---

## Aktuelle Baseline (Phase 4 Closeout)

| Szenario | Gemessener FPS | Status | Gemessen am |
|:---------|:---------------|:-------|:------------|
| A (50 Events) | Ausstehend | ◎ Target: ≥ 60 | — |
| B (200 Events) | Ausstehend | ◎ Target: ≥ 45 | — |
| C (1000 Events) | Ausstehend | ◎ Target: ≥ 30 | — |

*Messung erfolgt bei erstem vollständigen Phase-4-Stack-Start (Phase 4 E2E-Verifikation).*

---

## Optimierungsmaßnahmen (falls unter Target)

### Szenario A < 60 FPS
- Canvas-Rendering prüfen: Events als Canvas-Punkte statt SVG-Kreise
- `requestAnimationFrame` Throttling auf 60 FPS cap

### Szenario B < 45 FPS → Gate A ausgelöst
- Migration auf `deck.gl` ScatterplotLayer (ADR-002 Gate A)
- Canvas-Offscreen-Rendering via OffscreenCanvas

### Szenario C < 30 FPS
- Event-Clustering bei Zoom-Ebene < 3 (D3 force-cluster)
- Level-of-Detail: Bei C nur Top-100 nach severity anzeigen, Rest aggregiert

---

## Bundle-Größen-Tracking

| Modul | Phase 4 | Phase 6 | Phase 12 |
|:------|:--------|:--------|:---------|
| `d3-geo` + `world-atlas` | ~120 KB gz | ~120 KB gz | ~120 KB gz |
| Total GeoMap chunk | Ausstehend | — | — |
| Memory KG WASM | — | ~6 MB gz (lazy) | ~6 MB gz (lazy) |

---

## Änderungshistorie

| Datum | Änderung |
|:------|:---------|
| 26. Feb 2026 | Initial — Phase 4 Closeout |
