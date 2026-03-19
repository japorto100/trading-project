# Detaillierte Rangliste (Empfehlungsstand)

> **WICHTIGER HINWEIS**
>
> Diese Rangliste ist ein **Empfehlungsstand** auf Basis der aktuellen Sichtung.
> Sie ist **keine finale Entscheidungsvorlage**.
> Vor Uebernahme in Produktivplanung muss eine **weitere Evaluation** stattfinden
> (Technik, Lizenz, Sicherheit, Datenqualitaet, Wartbarkeit, Betriebsaufwand).

---

## 1) Shadowbroker (Empfehlung: Primäre Feature-Referenz)

### Warum hoch priorisiert
- Sehr breite, praxisnahe Feature-Abdeckung (Air, Maritime, Satelliten, Events, weitere Layer).
- Gute Blaupause fuer Multi-Layer-UX und "Single Pane of Glass"-Ansatz.
- Klare Selbsthosting-Story und starke Community-Signale.

### Was eher uebernehmen
- Layer-Strategie und Informationsdichte im Karten-UI.
- Strukturierung von Datenquellen inkl. Update-Frequenzen.
- Performance-Muster fuer grosse Echtzeit-Layer.

### Was vorsichtig behandeln
- Scope ist sehr gross, Gefahr von Feature-Overload.
- Teilweise OSINT-spezifische Features passen ggf. nicht zu eurem Kernprodukt.
- Rechtliche/API-TOS-Pruefung pro Datenquelle ist zwingend.

---

## 2) worldwideview (Empfehlung: Architektur-Referenz)

### Warum hoch priorisiert
- Starker modularer Ansatz (Plugin-Denken, klare Erweiterbarkeit).
- Sehr geeignet fuer langfristige Skalierung von Datenquellen.
- Gute technische Richtung fuer "Engine first" statt "Feature-Wildwuchs".

### Was eher uebernehmen
- Plugin-System und Trennung Core vs. Data-Layer.
- Erweiterungsmechanismen fuer neue Source-Integrationen.
- Architekturmuster fuer performantes Rendering.

### Was vorsichtig behandeln
- Eher Framework-/Engine-Charakter, evtl. mehr Initialaufwand.
- Reifegrad einzelner Endnutzer-Features separat pruefen.

---

## 3) Sovereign_Watch (Empfehlung: Backend/Infra-Referenz)

### Warum relevant
- Sehr sauberer Architekturansatz fuer Ingestion + Verarbeitung + Darstellung.
- Geeignet als Referenz fuer robuste Pipeline- und Service-Struktur.

### Was eher uebernehmen
- Trennung der Poller/Ingestion-Komponenten.
- Dokumentationsstruktur fuer Betrieb und Konfiguration.
- Gedankenmodell fuer event-getriebene Datenfluesse.

### Was vorsichtig behandeln
- Relativ hoher Betriebs- und Infrastrukturaufwand.
- Lizenz (AGPL) muss vor jeder tieferen Ableitung juristisch geklaert werden.

---

## 4) conflict-globe.gl (Empfehlung: Lean-Start-Referenz)

### Warum relevant
- Schlankere Basis mit verstaendlichem Stack.
- Gut geeignet fuer schnelle Prototypen mit klarer 3D-Globe-Fokussierung.

### Was eher uebernehmen
- Einfacher End-to-End-Flow (Backend zu Globe-Frontend).
- Schneller Bootstrap fuer MVP-nahe Demos.

### Was vorsichtig behandeln
- Kleinere Community-/Reifeindikatoren.
- Fuer grosse Produktanforderungen evtl. zu wenig tief ohne Umbau.

---

## 5) GeoSentinel (Empfehlung: Selektive Ideen-Quelle)

### Warum nur selektiv
- Viele interessante Features und starke visuelle Ideen.
- Aber Qualitaet/Konsistenz der Doku und Struktur wirkt uneinheitlich.

### Was eher uebernehmen
- Einzelne UI/Feature-Ideen als Inspirationsquelle.
- Denkansaetze fuer Search/Monitoring-Workflows.

### Was vorsichtig behandeln
- Keine 1:1 Basis fuer Kernarchitektur ohne tiefes Hardening.
- Lizenz- und Nutzungsbedingungen vor Uebernahme sauber klaeren.

---

## Entscheidung nur nach weiterer Evaluation

Vor finaler Priorisierung oder Umsetzung sollten mindestens diese Punkte geprueft werden:
- **Lizenz-Check**: Kommerzielle Nutzbarkeit, Copyleft-Risiken, API-TOS.
- **Security-Check**: Secret-Handling, Dependency-Risiken, Supply-Chain.
- **Data-Check**: Quellqualitaet, Rate Limits, Ausfallverhalten, Kosten.
- **Tech-Check**: Build-Stabilitaet, Testbarkeit, Observability, Performance.
- **Ops-Check**: Deployment-Komplexitaet, Ressourcenbedarf, Wartungsaufwand.

---

## Arbeitsvorschlag (naechster Schritt)

1. Pro Top-3 Repo eine 60-90 Minuten Deep-Dive-Session.
2. Einheitliche Bewertungsmatrix mit Scores (0-5) je Kategorie.
3. Danach finale Build-vs-Borrow Entscheidung pro Modul.

> **Nochmal klar:** Die obige Reihenfolge sind **Empfehlungen**, keine finalen Entscheidungen.
