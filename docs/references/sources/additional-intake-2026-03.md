# Additional Source Intake (March 2026)

> **Status:** Working notes from current evaluation pass.
>  
> **Regel:** Das ist ein Entscheidungs- und Monitoring-Overlay, nicht der
> produktive Runtime-Status (`../status.md` bleibt die kanonische Statusquelle).

---

## 1) Sofort sinnvoll -- Haben wir das schon?

| Quelle | In Repo vorhanden? | Aktueller Stand | API / Kosten-Kontext |
|---|---|---|---|
| World Bank (`data.worldbank.org`) | Ja | `Implementiert` in `../status.md` | World Bank API ist frei nutzbar (keyless, public endpoints) |
| UN Data (`data.un.org`) | Ja | `Implementiert` in `../status.md` | UNdata REST/SOAP Schnittstellen sind frei verfuegbar |
| SEC (EDGAR / Company Facts) | Teilweise | `SEC Company Facts / Filings` als Source dokumentiert; `SEC Enforcement RSS` in `../status.md` als `Geplant` | `data.sec.gov` APIs keyless/frei; Nutzungsregeln/Rate-Verhalten beachten |
| OpenCorporates | Nein | Noch nicht integriert | API i.d.R. kostenpflichtig; Free-at-scale nur fuer qualifizierte Public-Benefit Projekte |
| Wayback / Internet Archive | Nein | Noch nicht integriert | CDX/Wayback gilt als oeffentlich nutzbar; Fair-Use und Rate-Limits beachten |
| blockchain.com explorer API | Referenzweise ja | In `web3-and-oracles.md` als Referenzquelle genannt | Basis-Explorer-Endpunkte sind frei nutzbar, endpoint-spezifische Limits beachten |

**Explizit spaeter vertiefen (laut Entscheidung):**
- Wayback
- OpenCorporates

---

## 2) Entscheidungen aus dem aktuellen Thread

- **OpenSecrets API:** aktuell **ignorieren** (offizielles API-Angebot wurde eingestellt).
- **Google Earth Engine:** spaeter gesondert besprechen (nicht in diesem Pass finalisieren).
- **Flowsint:** spaeter gesondert besprechen.
- **Cytoscape + Gephi Lite:** spaeter gesondert besprechen.

---

## 3) Klaerung zu HudsonRock API

- Es gibt einen Free-API-Key Request-Pfad fuer Dev/Test.
- Der aktuelle Request-Flow verlangt laut Formular **Corporate Email**.
- Daher: mit normaler Freemail-Domain voraussichtlich nicht im Standard-Onboarding.

---

## 4) Start.me GEOINT URL

- Aktuell referenzierte URL: `https://start.me/p/W1kDAj/geoint`
- Einordnung: Discovery-/Kurations-Board, keine stabile Primaer-API-Quelle.

---

## 5) Verweis auf Monitoring

Monitoring-/Beobachtungspunkte wurden in `../monitor.md` ausgelagert:
- DarkOwl API
- breach.house
- blockpath.com
