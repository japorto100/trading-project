# Frontend Design Tooling — Bewertung & Roadmap

> **Stand:** 22. Februar 2026  
> **Zweck:** Bewertung von Design-to-Code-Tools (Pencil.dev, Figma MCP, Tambo) für das Projekt. Dokumentiert den Gedankenpfad, damit Entscheidungen nachvollziehbar bleiben.  
> **Kontext:** Entstanden aus kritischer Analyse während der AUTH_SECURITY Rev. 2 Überarbeitung. Projekt befindet sich in Phase 0 (Foundation).

---

## 1. Tool-Übersicht

| Tool | Kategorie | Kosten (Feb 2026) | Kern-Funktion |
|:---|:---|:---|:---|
| **Pencil.dev** | Design Canvas + Code-Export | Kostenlos (Pricing-Änderung angekündigt) | Infinite Design Canvas mit MCP-Integration zu Coding Agents. Design-System-Auswahl (shadcn, Lunarus, etc.), Figma-Import, Frame-basierte Annotation. |
| **Figma MCP** | Design-to-Code Bridge | Figma Free/Pro + kostenlose MCP Integration | Figma-Designs direkt als Kontext an Claude Code übergeben. Layouts, Spacing, Styles werden als strukturierte Daten (nicht Screenshots) übertragen. |
| **Tambo** | AI-Interactive React UI Framework | Open Source (MIT) | AI als UI-Orchestrator: AI entscheidet welche React-Komponenten gerendert werden, kann UI-State manipulieren, Tools aufrufen, dynamische Interfaces generieren. |

---

## 2. Pencil.dev + Figma MCP — Design-to-Code Workflow

### 2.1 Was funktioniert

- **MCP-Kette:** Pencil Canvas → Claude Code MCP → generierter Code. Der Agent "sieht" das Design als strukturierte Daten, nicht als Bild. Ergebnis ist deutlich besser als Prompt-basiertes UI-Design.
- **Design-System-Injection:** shadcn/ui als Style-Guide an den Agent übergeben reduziert Token-Waste und verbessert Konsistenz. Relevant für uns: Unser Stack nutzt shadcn + Radix + Tailwind.
- **Figma-Import in Pencil:** Layouts, Spacing und Styles werden aus Figma übernommen. Kein manuelles Nachbauen für die Code-Generierung nötig.
- **Frame-basierte Annotation:** Einzelne Blöcke/Layer selektieren und dem Agent als Kontext geben. Granulare Kontrolle statt "generier mal die ganze Seite".

### 2.2 Kritische Einschränkungen

**"Pixel Perfect" ist übertrieben.**
Kein AI-Tool generiert heute pixel-perfekten Code aus einem Design-Canvas. Was realistisch ist: Abstände stimmen ungefähr, Farben und Typografie stimmen, die Struktur stimmt. Responsive Verhalten, Edge Cases (leere States, Fehler-States, Loading), und interaktive Logik müssen manuell nachgearbeitet werden.

**Unser Frontend-Problem ist nicht Design, sondern Architektur.**
Aus `SYSTEM_STATE.md` (Feb 2026): 44 API-Routes, viele rufen Provider direkt auf statt über Go Gateway. Kein konsistenter Datenfluss. Schöne Komponenten aus Pencil in eine kaputte Architektur zu integrieren bringt nichts. Erst Phase 0 (Data Router Realignment) abschließen, dann Design-Tools einsetzen.

**Komplexe Komponenten sind nicht Canvas-tauglich.**
`lightweight-charts` (Trading-Charts), `d3-geo` (GeoMap Globe), `recharts` (Analytics) — das sind hochinteraktive, datengetriebene Komponenten. Die werden programmatisch gebaut, nicht in einem Design-Canvas. Pencil ist geeignet für die "drumherum"-UI: Sidebars, Settings, Order-Formulare, Alert-Listen, Auth-Screens.

**Vendor-Lock-in-Risiko.**
Pencil ist "aktuell kostenlos" mit angekündigter Pricing-Änderung. Einen Kernworkflow um ein Tool zu bauen, das morgen kostenpflichtig wird, ist riskant. Figma allein (mit MCP) ist die stabilere Langzeit-Investition. Pencil als Bonus-Tool nutzen, nicht als Dependency.

### 2.3 Empfohlener Einsatz

| Use Case | Tool | Wann |
|:---|:---|:---|
| Auth UI (Login, Register, Recovery, MFA-Setup) | Pencil + Claude Code | Sprint 6.1 |
| Settings-Seite (Consent-Toggles, Device Management) | Pencil + Claude Code | Sprint 6.1 / 6.5 |
| Admin-Dashboard (`/admin/security`) | Pencil + Claude Code | Sprint 6.4 |
| Statische Layouts (Sidebars, Navigation, Footer) | Figma MCP + Claude Code | Phase 9 (Frontend Refinement) |
| Trading-Charts, GeoMap, Analytics-Visualisierungen | Programmatisch (kein Design-Tool). D3-Module-Roadmap: [`GEOPOLITICAL_OPTIONS.md`](./GEOPOLITICAL_OPTIONS.md) | Phase 0-5 |

---

## 3. Tambo — AI-Interactive React UI Framework

> Repository: https://github.com/tambo-ai/tambo  
> Lizenz: MIT (Open Source)

### 3.1 Was Tambo ist

Tambo ist kein Design-Tool, sondern ein **Runtime-Framework** das AI als UI-Orchestrator einsetzt:

```
Normales LLM-Frontend:
  User → Prompt → LLM → Text zurück

Tambo:
  User → AI → AI entscheidet → rendert React-Komponente
                             → ruft Tools auf
                             → manipuliert UI-State
                             → streamt strukturierte Responses
```

AI antwortet nicht nur mit Text, sondern kann Buttons generieren, Formulare triggern, React-Komponenten dynamisch rendern, UI-State verändern, und Tool Calls auslösen. Komponenten werden als deklarative Tools registriert, die die AI auswählen und mit Daten befüllen kann (JSON → React Component Mapping).

### 3.2 Relevanz für unser Projekt

**Geplanter Einsatz: Dynamische User-Facing Pages + Chat-Interface.**

Tambo wäre nicht für die Kern-Trading-UI gedacht, sondern für:

| Use Case | Wie Tambo hilft | Risiko-Stufe |
|:---|:---|:---|
| **Chat-Interface für Trading-Queries** | "Zeig mir alle BTC-Trades letzte Woche" → AI wählt und rendert passende Chart-Komponente aus registrierten Tambo-Components | Niedrig (read-only) |
| **Dynamische Analyse-Pages** | "Vergleich mein Portfolio mit S&P 500" → AI rendert Vergleichs-Chart mit passenden Parametern | Niedrig (read-only) |
| **AI-gestütztes Alert-Dashboard** | AI gruppiert, priorisiert und visualisiert Alerts dynamisch basierend auf User-Kontext | Niedrig (read-only) |
| **Dynamische Hilfe/Onboarding** | AI rendert kontextabhängige Tutorials, Tooltips, Erklärungen als interaktive Komponenten | Niedrig (read-only) |

### 3.3 Sicherheits-Grenzen (harte Regel)

**Tambo darf NICHT in die Nähe von Order-Execution oder Portfolio-Mutation kommen.**

| Erlaubt (read-only, analytisch) | VERBOTEN (schreibend, finanziell) |
|:---|:---|
| Charts rendern | Order-Formulare generieren |
| Portfolio-Übersicht anzeigen | Buy/Sell-Buttons rendern |
| Historische Trades visualisieren | Wallet-Adressen anzeigen |
| Indikatoren vergleichen | GCT-Endpoints aufrufen |
| News/Alerts aggregieren | Account-Settings ändern |

**Begründung:** In einem Trading-System mit echtem Geld muss jede schreibende Aktion durch deterministische, getestete UI-Komponenten laufen — nicht durch AI-generierte dynamische Interfaces. Ein AI-generierter "Buy"-Button der eine unerwartete Order auslöst ist ein Security-Incident.

Diese Grenze muss im Code durchgesetzt werden (nicht nur als Konvention):
- Tambo-registrierte Komponenten bekommen nur `viewer`-Level Daten (via RBAC, siehe `AUTH_SECURITY.md` Sek. 2.3)
- Tool Calls aus Tambo laufen durch den Go Gateway mit `viewer`-Rolle — kein Zugriff auf Order-Endpoints
- Tambo-Kontext bekommt KEIN JWT mit `trader`-Rolle

### 3.4 Technische Bedenken

| Bedenken | Einschätzung | Mitigation |
|:---|:---|:---|
| **6. State-Layer** (Zustand, TanStack Query, Next.js RSC, Prisma, Go Gateway, + Tambo) | Erhöhte Komplexität. Tambo's AI-State muss mit den bestehenden 5 Layern koexistieren. | Tambo nur in isolierten Pages/Routen verwenden. Kein Cross-Contamination mit Kern-Trading-UI State. |
| **Early-Stage Framework** | Tambo ist jung, API kann sich ändern. Für ein System mit echtem Geld will man battle-tested Dependencies. | Tambo nur für read-only, nicht-kritische Features. Kern-UI bleibt Tambo-frei. |
| **Auth-Integration** | Tambo's Tool-Invocation muss durch JWT/RBAC/Rate Limiting. | Tambo-Tools registrieren sich als `viewer`-Level Endpoints im Go Gateway. Kein Bypass möglich. |
| **Token-Kosten** | AI-gesteuertes UI-Rendering kostet LLM-Tokens bei jedem Render-Zyklus. | Caching von AI-Responses. Nur bei expliziter User-Interaktion triggern, nicht bei Page-Load. |

### 3.5 Verbindung zu Pencil.dev

Tambo und Pencil ergänzen sich:

```
Design-Phase:  Pencil.dev → Design der Tambo-Komponenten-Bibliothek
               (Wie sieht ein AI-gerenderter Chart-Block aus?
                Wie sieht eine AI-generierte Analyse-Karte aus?)
                         │
                         ▼
Build-Phase:   Claude Code → Implementiert Tambo-Komponenten als React
               (Registriert sie als Tambo-Tools mit Props-Schema)
                         │
                         ▼
Runtime:       Tambo AI → Wählt und rendert Komponenten dynamisch
               (User fragt im Chat → AI wählt passende Komponente
                → rendert mit echten Daten aus Go Gateway)
```

Pencil designt die Bausteine. Claude Code baut sie. Tambo orchestriert sie zur Laufzeit.

---

## 4. Timeline & Priorisierung

| Phase | Was | Tools |
|:---|:---|:---|
| **Phase 0 (jetzt)** | Keine Design-Tools. Focus: Go Data Router, Security Sofort-Maßnahmen. | Keine |
| **Phase 6 Sprint 6.1** | Auth UI bauen (Login, Register, Recovery, MFA). | Pencil + Claude Code |
| **Phase 6 Sprint 6.5** | Settings, Consent, Admin-Dashboard. | Pencil + Claude Code |
| **Phase 9** | Frontend Refinement: Design-System konsolidieren, statische Layouts. | Figma MCP + Claude Code |
| **Post-MVP (Evaluierung)** | Tambo-Prototyp: Chat-Interface für read-only Trading-Queries testen. | Tambo + Claude Code |
| **Post-MVP (Produktion)** | Wenn Prototyp überzeugt: Tambo für dynamische Analyse-Pages, Alert-Dashboard. | Tambo + Pencil (für Component Design) |

---

## 5. Entscheidungs-Log

| Datum | Entscheidung | Begründung |
|:---|:---|:---|
| 22. Feb 2026 | Pencil + Figma MCP installiert, aber nicht im aktiven Workflow | Phase 0 erfordert Architektur-Arbeit, nicht Design-Arbeit |
| 22. Feb 2026 | Tambo evaluiert, nicht integriert | Zu früh (kein Auth, kein stabiler Datenfluss). Harte Regel: Tambo nur read-only. |
| 22. Feb 2026 | Tambo-Einsatz auf Chat-Interface + dynamische Analyse-Pages beschränkt | Security: AI-generierte UI darf keine schreibenden Aktionen auslösen (AUTH_SECURITY.md) |
| 22. Feb 2026 | Pencil als Component-Design-Tool für Tambo-Bibliothek vorgesehen | Pencil designt Bausteine → Claude Code baut → Tambo orchestriert zur Runtime |
