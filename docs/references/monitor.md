# Reference Monitor

> **Zweck:** Beobachtungsliste fuer Quellen/Tools mit offenem API-/Pricing- oder
> Compliance-Status.  
> **Hinweis:** Kein Implementierungsauftrag. Nur Monitoring + Re-Evaluation Trigger.

---

## Active Monitor Items

| Item | Typ | Aktueller Eindruck | API-/Free-Tier-Status | Naechster Trigger |
|---|---|---|---|---|
| DarkOwl (`darkowl.com/api-resources`) | Darkweb Intel API | Enterprise-geeignet, aber schwergewichtig | Kein klarer Free-Tier sichtbar; vermutlich paid/quote-led | Nur bei konkretem Budget + Compliance-Need wieder aufnehmen |
| breach.house | Leak/Ransom Aggregator | Inhaltlich heikel fuer seriues Produktumfeld | Keine klare oeffentliche API-Doku gefunden | Nur fuer Research-Diskussion; keine direkte Integration |
| blockpath.com | Blockchain Tooling | Produkt wirkt eher als Explorer/App-Suite | Keine klare API-Dokumentation fuer produktive Nutzung gefunden | Recheck nur bei offizieller API-Doku |
| start.me GEOINT (`https://start.me/p/W1kDAj/geoint`) | Curated GEOINT Hub | Nützlich fuer Discovery neuer Quellen/Tools, aber kein Primaerfeed | Keine produktive API-Basis fuer stabile Ingestion | Nur als Research-/Discovery-Board pflegen |

---

## Secondary Watch Notes

- **OpenCorporates:** aktuell in spaeterem Deep-Dive (Pricing/API-Contract ist vorhanden, aber i.d.R. paid).
- **Wayback (Internet Archive):** spaeterer Deep-Dive fuer produktive ingestion/polling-Strategie.
- **Google Earth Engine:** spaeterer Deep-Dive (Quota-/Tier-Entscheid vor Integrationsplan).
- **Flowsint:** spaeteres Architekturgespraech (Tooling/Workflow statt klassischer Feed).

---

## Decision Hygiene

- Monitoring-Eintrag bedeutet **nicht** "in Umsetzung".
- Vor Aktivierung braucht jeder Kandidat:
  - Legal/ToS Check
  - Security/Abuse Check
  - API Contract Stabilitaet
  - Kosten- und Betriebsklarheit
