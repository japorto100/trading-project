# MRKTEDGE.AI Deep-Dive: Produkt, Tech-Stack, AI/ML und Architektur

## Executive Summary

entity["company","MRKT","market intelligence platform"] positioniert sich als „AI-powered financial terminal“/Market-Intelligence-Plattform für Trader:innen mit Fokus auf **Makro-/Fundamental-Kontext in Echtzeit** (Headlines, Sentiment, Bias, Projektionen, Kalender-Playbooks). Die öffentliche Kommunikation betont, dass Nutzer:innen damit „in Sekunden“ verstehen sollen, **warum** Märkte sich bewegen, statt nur **dass** sie sich bewegen. citeturn1view0turn0search28turn0search1

Ein klarer, öffentlich verifizierbarer Teil des Stacks ist **Payment und Analytics**: Die Privacy Policy nennt explizit **Stripe** als Zahlungsdienst und **Google Analytics** als Analytics-Dienst. citeturn4view0

Für das eigentliche Applikations-Frontend und UI-Framework gibt es **sekundäre** Indizien (BuiltWith) für **Next.js/React** sowie Komponentenbibliotheken wie **Radix UI** und Produkt-Analytics wie **PostHog**; diese Hinweise sind nützlich, aber bleiben ohne Direktinspektion von JS-Bundles/Headers **mittlere Konfidenz**. citeturn36search2

Infrastruktur-Indizien sind **gemischt**: Ein technischer Drittcheck (ScamAdviser) verweist für **app.mrktedge.ai** auf entity["company","Cloudflare","cdn and security company"] und ein Target auf entity["company","DigitalOcean","cloud hosting provider"] (ondigitalocean.app). Das stützt die Vermutung „CDN/WAF vorne, App-Plattform dahinter“. citeturn39search2

AI/ML-Funktionalität ist **substanziell belegt**, aber **Modellnamen, MLOps-Details, Trainings-Setup und Datenpipeline** sind öffentlich nur grob beschrieben. Explizit genannt werden AI-generierte Summaries/Analysen auf Basis öffentlich verfügbarer Informationen (Headlines, Econ Data, Central Bank Events, Earnings). citeturn4view1turn0search1

## Produkt- und Business-Mapping

MRKT kommuniziert als Kernnutzen, Markt-Fundamentals in **strukturierte, handlungsnahe** Information zu transformieren („Interpretive Layer“), inkl. Bias-/Sentiment-Workflows, Live-Headlines und einem Economic Calendar, der „zeigt, wie man Releases traded“. citeturn0search5turn4view3turn0search28

Die Website nennt als „Data powered by“ u.a. entity["company","Reuters","news and market data"], entity["company","London Stock Exchange Group","market data provider"], entity["company","Nasdaq","exchange and market data"] und entity["company","CME Group","derivatives exchange"]. Das ist ein wichtiger Hinweis auf Datenpartnerschaften/Feeds, allerdings ohne Offenlegung der konkreten Produkte/Lizenzformen. citeturn1view0

Das Preisbild ist auf der öffentlichen Landing Page sichtbar (Premium-Plan, monatlich vs. jährlich mit ~17% Ersparnis, USD-Preise). citeturn1view0turn10search1

Ein Business-/Go-to-Market-Baustein ist ein Affiliate-Programm (externer Dienst „tolt.io“ verlinkt). citeturn1view0turn34view0turn36search2

Eine klar deklarierte Partnerschaft ist „MRKT × entity["company","Dominion Markets","cfd broker mauritius"]“, als **brand-only partnership**; MRKT betont dabei explizit, **kein Broker** zu sein und keine Trades auszuführen. citeturn30view0

**Functional Mapping: Welche Features sind AI-getrieben?** (aus öffentlichen Beschreibungen zusammengeführt)

- **AI-getrieben (direkt belegt):** AI-Summaries/Analysen zu Headlines, Econ Data, Central Bank Events, Earnings; „AI-driven summaries and analyses“ werden im Disclaimer explizit erwähnt. citeturn4view1  
- **AI-unterstützt (stark nahegelegt):** Sentiment-Analyse (LinkedIn beschreibt „sentiment analysis“ und AI-getriebene Insights), „MRKT AI Sentiment Index“ und AI-Breakdowns in Modulen (Updates/Changelog). citeturn0search1turn6view0  
- **Hybrid (AI + quantitative Modelle/Regeln, nahegelegt):** Bias/„Price projections“/Targets/„What moved it“ Candle-Attribution; MRKT beschreibt einen Workflow aus Bias-Positioning, Projections, Fundamentals und Live-Headlines. citeturn0search13turn1view0turn8search12  
- **Mehrsprachigkeit & Audio (AI/ML oder spezialisierte Services, belegt als Feature; Technik offen):** Plattformweite Übersetzungen (8 Sprachen) und „Multilingual News Squawk“ (Text-to-Speech). citeturn0search10turn6view0  

## UI/UX und Client-Erlebnis

### Öffentliche Informationsarchitektur und UX-Pattern

Die Marketing-Site ist klar auf „Single CTA + Feature Story“ gebaut: Hero („Understand why markets move in seconds“), Social Proof, dann Problem/Solution-Module („red folder news“, „instant alerts“, „what happened tool“) und Pricing/FAQ. citeturn1view0

Das „Economic Calendar“-Messaging ist UX-seitig konsequent: nicht nur Termine/Forecast, sondern Range (Bank forecast, Min/Max) plus „Playbook“ und „shock detection“ werden als Differenzierungsmerkmale hervorgehoben. citeturn4view3turn5search8

### App-UI, Dashboard-Interaktion, Workflow-Design

Die zentralen UI-Workflows, die MRKT öffentlich beschreibt, sind bemerkenswert „prozessorientiert“ (Bias in Steps, nicht als einzelnes Signal): Dashboard → Bias-Positioning → Projections → Fundamentals → Live-Headlines. Das ist ein gutes Indiz für ein UI, das **sequenziell** (mindset/decision flow) statt rein „datenzentriert“ gestaltet ist. citeturn0search13turn8search12

Für UI-Eindrücke aus der Community sind Reddit-Threads und Reviews nützlich: In einem Reddit-Thread wird MRKT als personalisierbarer Home-Dashboard beschrieben (pro Assetklasse; HTF- und Intraday-Bias; Projections; Key Factors; Live-News-Feed mit Analyse). Das ist nicht „Primary“ im Sinne einer technischen Spezifikation, aber ein konsistenter Außenblick auf die UI-Struktur. citeturn28reddit28

Auch Trustpilot-Reviews betonen wiederkehrend „clean/intuitive dashboard“, Visualisierungen und „AI feedback on charts“ sowie Alerts/Notifications. Solche Aussagen sind subjektiv, stützen aber die These, dass starke UX (Informationsverdichtung) ein Kernbaustein ist. citeturn19search1

### Responsives Verhalten, PWA und Internationalisierung

Die „Updates“-Seite ist hier besonders ergiebig: Push Notifications werden explizit als **Desktop/Android/iOS via PWA** beschrieben, inkl. iOS-Installationsanleitung „Add to Home Screen“. Das ist ein starkes Indiz, dass MRKT als **Progressive Web App** betrieben wird (oder zumindest PWA-Features nutzt). citeturn6view0

Internationalisierung ist ebenfalls direkt belegt: Eine LinkedIn-Ankündigung nennt „platform-wide translations across MRKT in 8 languages“, darunter auch Deutsch. Das spricht für i18n auf UI- und Datenebene (real-time Headlines/Marktdaten), ohne aber die verwendeten Libraries offenzulegen. citeturn0search10

### Accessibility (A11y)

Direkte A11y-Audits (WCAG-Statements, VPAT, Lighthouse, ARIA-Patterns) sind öffentlich **nicht** dokumentiert. Es gibt jedoch **sekundäre** Indizien: BuiltWith detektiert „Radix UI“ (eine React-Komponentenbibliothek, die Accessibility als Designziel kommuniziert). Ohne Bundle-/DOM-Analyse bleibt das **mittlere Konfidenz**. citeturn36search2

image_group{"layout":"carousel","aspect_ratio":"16:9","query":["MRKT AI dashboard screenshot","MRKT edge economic calendar dashboard screenshot","MRKT Trump Tracker dashboard screenshot","MRKT AI terminal live headlines interface"],"num_per_query":1}

## Tech-Stack und Infrastruktur

### Direkt belegte Komponenten (hohe Konfidenz)

- **Payments:** entity["company","Stripe","payments platform"] ist in der Privacy Policy als Drittanbieter genannt. citeturn4view0  
- **Web-Analytics:** entity["company","Google","technology company"] Analytics wird in der Privacy Policy genannt. citeturn4view0  
- **Datenquellen/Provider (Marketing Claim):** Reuters/LSE Group/Nasdaq/CME Group werden auf der Website als Datenbasis genannt. citeturn1view0  
- **Partner-/Affiliate-System:** Tolt ist als Affiliate-Link-Domain sichtbar; BuiltWith detektiert Tolt ebenfalls. citeturn1view0turn36search2  

### Infrastruktur-Indizien (gemischt, teilweise sekundär)

Ein „Website risk check“-Profil für **app.mrktedge.ai** nennt Cloudflare als ISP und ein Target „…ondigitalocean.app“, was stark auf „Cloudflare vorne / DigitalOcean App Platform dahinter“ hindeutet. Dennoch bleibt das ein Drittquellen-Indiz (keine Header-/DNS-Dumps im öffentlichen MRKT-Material), also **mittlere Konfidenz**. citeturn39search2

BuiltWith meldet hingegen Hosting auf „Amazon AWS EC2 Infrastructure“ und mehrere Tracking-/Automation-Tools. Das steht **nicht zwingend** im Widerspruch (z.B. Multi-Cloud oder historische Erkennung), aber ohne Live-Header und DNS ist das **niedrige bis mittlere Konfidenz**. citeturn36search2

### Frontend-Frameworks & UI Libraries (sekundäre Evidenz)

BuiltWith detektiert:
- **Next.js** und **React** als App-Framework/Basis,
- **Radix UI** als Component Library,
- diverse Tracking-/Lifecycle-Tools (z.B. PostHog, Klaviyo),
- TLS/Security-Signale (HSTS, Let’s Encrypt etc.). citeturn36search2

Diese Angaben sind nützlich als Hypothesenbasis, gelten aber ohne direkte Bundle-/Header-Inspektion als **sekundär**.

### Backend, Datenbanken, CI/CD, Observability (nicht öffentlich verifiziert)

Zu Backend-Languages/Frameworks (z.B. Node/Go/Python), Datenbanken (Postgres/ClickHouse/Redis/Timeseries), Message-Broker (Kafka/NATS), CI/CD (GitHub Actions/CircleCI), Observability (Grafana/Prometheus/Sentry/OpenTelemetry) gibt es in den primären MRKT-Quellen **keine** harten Nennungen. Das muss als „nicht verfügbar“ dokumentiert werden.

## AI/ML-Nutzung und Datenpipeline

### Was MRKT explizit sagt (und was nicht)

Der Disclaimer benennt AI-Nutzung konkret: MRKT generiert „AI-driven summaries“ und Analysen zu öffentlich verfügbaren Informationen inkl. Market Headlines, Economic Data, Central Bank Events und Earnings Reports; zugleich wird die Möglichkeit von Ungenauigkeiten erwähnt. citeturn4view1

Das LinkedIn-Unternehmensprofil spricht von „advanced AI trained on industry-leading models“ und nennt Use-Cases (real-time headlines, sentiment analysis, central banking events, economic calendar data releases). Konkrete Modellnamen (z.B. GPT/Claude/Mistral), Fine-Tuning vs. Prompting, RAG, Embeddings etc. werden dort nicht offengelegt. citeturn0search1

### Inference vs. Training (Inference klarer als Training)

Öffentliche Texte zeigen sehr klar einen **Inference-lastigen** Betrieb: Live-Headlines → Parsing → Zusammenfassung/Impact-Interpretation → UI/Alerts. citeturn6view0turn4view1turn0search13

„Training“ wird indirekt angesprochen („trained on industry-leading models“), aber ohne Beschreibung, ob MRKT:
- eigene Modelle trainiert,
- Fine-Tuning/Instruction-Tuning macht,
- nur Prompting + RAG nutzt,
- oder eine Mischung fährt. citeturn0search1  
Daher: **Training-Details = nicht verfügbar** (öffentlich).

### Datenquellen, Feature Engineering und Pipeline-Hypothese (inferred)

Aus den beschriebenen Features lässt sich eine plausible Pipeline ableiten:

1) **Ingestion**: Lizenzierte Market-News/Market-Data-Feeds (Branding nennt Reuters/LSEG/Nasdaq/CME) plus öffentlich verfügbare Quellen für Events/Statements. citeturn1view0turn4view1  
2) **Normalisierung**: „smart parsing“ und Noise-Reduktion („Cleaner, Smarter Headlines“ in Updates) → deutet auf Regel-/ML-Filter (Dedup, entity linking, event taxonomy) hin. citeturn6view0  
3) **Model Layer**:  
   - LLM-ähnliche Summaries/Erklärungen (Disclaimer),  
   - Sentiment/Impact Scoring (Updates erwähnen „Sentiment Index (0–100)“ und „weights on each driver“),  
   - Übersetzung und TTS. citeturn4view1turn6view0turn0search10  
4) **Serving**: Real-time UI + Push Notifications (PWA) + Search/Jump-to-Headline (LinkedIn Post). citeturn6view0turn25search5  

Das ist *inferred architecture*: strukturell plausibel, aber ohne Code/Headers nicht verifizierbar auf Komponentenebene.

### Privacy/PII und Compliance

Die Privacy Policy nennt als erhobene Daten u.a. E-Mail-Adresse, Vor-/Nachname sowie Cookies/Usage Data; sie erwähnt Datenübertragung in andere Jurisdiktionen sowie GDPR-Rechte. Drittanbieter sind u.a. Google Analytics und Stripe. citeturn4view0

Was öffentlich **nicht** beschrieben ist: konkrete PII-Minimierung im ML-Kontext, redaction, data retention policy für ML-Logs, Prompt-Logging/Tracing, und konkrete technische/organisatorische Massnahmen (TOMs).

## Architektur, Deployment und Security-Posture

Die folgende Skizze ist eine **inferenzbasierte** Architektur, zusammengesetzt aus öffentlich belegten Features (PWA/Alerts, AI-Summaries, Data Providers, Stripe/GA) sowie sekundären Infrastruktur-Indizien (Cloudflare/DigitalOcean, Next.js). citeturn6view0turn4view0turn4view1turn39search2turn36search2

```mermaid
flowchart LR
  U[User (Browser / PWA)] -->|HTTPS| CDN[CDN/WAF (edge)]
  CDN --> FE[Web App Frontend (SPA/PWA)]
  FE --> AUTH[Auth / Session Service]
  FE --> API[Backend API]
  API --> PAY[Billing (Stripe)]
  FE --> ANALYTICS[Web Analytics (GA / Product Analytics)]
  
  subgraph DataLayer[Market Data Layer]
    VP[Vendor Feeds / Market Data Providers] --> ING[Ingestion & Normalization]
    ING --> STORE[(Event Store / DB)]
  end
  
  STORE --> ML[AI/ML Inference Services]
  ML --> API
  API --> PUSH[Notifications Service]
  PUSH --> U

  %% Notes:
  %% - Exact cloud/provider boundaries unknown (some evidence suggests CDN + DO target for app subdomain).
```

**Scalability/Fault Tolerance (nur begrenzt ableitbar):**  
- Das Produktversprechen „real-time alerts“ und „always within reach“ impliziert eine Architektur mit Streaming/Queueing und resilientem Delivery (Push). citeturn6view0  
- Multi-Tenant-Design ist als SaaS-Subscription sehr wahrscheinlich (Personalization/Onboarding, user-specific dashboards), aber öffentlich nicht als Tenant-Architektur beschrieben. citeturn6view0turn0search13  

**Security/Deployment Praktiken:**  
- Privacy Policy bestätigt Drittanbieter-Processing und beschreibt generelle Sicherheitsmassnahmen, aber ohne konkrete Controls (CSP, WAF-Regeln, Secrets Handling). citeturn4view0  
- ScamAdviser weist auf DV-SSL und Cloudflare als ISP für die App-Domain hin; das ist ein *indikatives* Signal, aber kein Audit. citeturn39search2  
- BuiltWith listet HSTS/Let’s Encrypt etc.; ebenfalls sekundär. citeturn36search2  

## Evidenz- und Konfidenz-Matrix und Verifikationsplan

### Evidenzmatrix

| Untersuchungsbereich | Beobachtung/Claim | Evidenzquelle(n) | Evidenztyp | Konfidenz |
|---|---|---|---|---|
| Produktpositionierung | AI-Terminal/Market-Intelligence für Trader:innen | MRKT Blog („What is MRKT?“), LinkedIn-Profil | Primär (eigene Texte) | Hoch citeturn0search28turn0search1 |
| Datenbasis | „Data powered by“ Reuters/LSEG/Nasdaq/CME | Landing Page | Primär (Site Claim) | Mittel (Claim ohne Vertragsdetails) citeturn1view0 |
| AI-Funktion | AI-generierte Summaries/Analysen (Headlines, Econ Data, CB Events, Earnings) | Disclaimer | Primär | Hoch citeturn4view1 |
| PWA/Push | Desktop/Android/iOS via PWA, Anleitung iOS | Updates/Changelog | Primär | Hoch citeturn6view0 |
| Internationalisierung | 8 Sprachen (inkl. Deutsch) | LinkedIn-Post | Primär (Vendor-Kommunikation) | Mittel–hoch citeturn0search10 |
| Payments/Analytics | Stripe + Google Analytics als Drittanbieter | Privacy Policy | Primär | Hoch citeturn4view0 |
| Hosting (App) | Cloudflare + Target ondigitalocean.app | ScamAdviser | Sekundär | Mittel citeturn39search2 |
| Frontend Tech | Next.js/React/Radix UI/PostHog/Klaviyo/Tolt | BuiltWith | Sekundär | Mittel citeturn36search2 |
| Community UI-Beschreibung | personalisierbares Dashboard, Live-News-Feed, Bias/Projections | Reddit Thread / Reviews | Dritt-/Community | Niedrig–mittel citeturn28reddit28turn19search1 |
| Partnerschaften | brand-only Partnership mit Dominion; MRKT nicht Broker | Partnerships Page | Primär | Hoch citeturn30view0 |

### Historische Timeline (aus öffentlichen Updates)

Die „Updates“-Seite liefert eine klare Feature-Timeline (mindestens März–Juli 2025) und ergänzt die jüngeren LinkedIn-Ankündigungen (Februar 2026). citeturn6view0turn0search10

| Datum | Version/Event | Öffentliche Änderung (Kurz) | Quelle |
|---|---|---|---|
| 13. März 2025 | v1.1.0 | Onboarding + personalisierte Dashboards + Custom Reports | citeturn6view0 |
| 18. April 2025 | v1.2.0 | Einführung „MRKT VIEW“ (Dashboard mit Sentiment/Flows/Headlines) | citeturn6view0 |
| 27. April 2025 | v1.3.0 | „Trump Tracker“ | citeturn6view0 |
| 11. Mai 2025 | v1.4.0 | FX Dashboard Upgrade + „AI-powered breakdowns“ in Modulen | citeturn6view0 |
| 10. Juli 2025 | v1.6.0 | Push Notifications/Alerts (PWA inkl. iOS Setup) | citeturn6view0 |
| 31. Juli 2025 | v1.7.0 | Multilingual News Squawk (Text-to-Speech) | citeturn6view0 |
| ca. Mitte Feb 2026 | (Post) | Plattformweite Übersetzungen in 8 Sprachen | citeturn0search10 |

### Empfohlene Follow-up-Actions (um Lücken zu schliessen)

1) **HTTP-Header & Security-Header verifizieren**: `curl -I https://www.mrktedge.ai` und `curl -I https://app.mrktedge.ai/auth` (CSP, HSTS, cache-control, server, cf-ray etc.).  
2) **JS-Bundles & Dependency Graph extrahieren**: Seite lokal speichern, `_next/static/...` prüfen (falls Next.js), `sourceMappingURL` und Chunk-Namen auslesen; daraus Frameworks/Bibliotheken verifizieren (Radix, i18n libs, chart libs).  
3) **Tracking/Analytics konkretisieren**: Im Browser DevTools „Network“ nach `posthog`, `gtag`, `klaviyo`, `facebook`/„pixel“ suchen; Consent-Management prüfen.  
4) **AI/ML-Stack belegen**: In öffentlichen Docs/FAQ nach Modell-/Provider-Nennung suchen (OpenAI/Anthropic etc.), oder direkt beim Anbieter nach einem technischen Whitepaper fragen (RAG? Fine-Tuning? Monitoring?).  
5) **Data Governance klären**: Welche Daten gehen in Prompts? Gibt es PII-Redaction? Retention/Deletion? Incident Response?  
6) **Observability/MLOps**: Prüfen, ob es Sentry/OTel/Prometheus/Grafana etc. gibt; Logs/Tracing-Policy (insb. für AI Outputs) evaluieren.  
7) **Accessibility Audit**: Lighthouse/axe-core über zentrale Flows (Auth, Dashboard, Kalender) laufen lassen; Keyboard-Navigation, ARIA, Contrast, Reduced Motion testen.

### Quellenhinweis (Linkliste)

Die im Bericht verwendeten Quellen sind jeweils direkt verlinkt über die Zitate (klickbar). Besonders zentral: Landing Page citeturn1view0, Privacy Policy citeturn4view0, Disclaimer citeturn4view1, Updates/Changelog citeturn6view0, Economic Calendar citeturn4view3, About citeturn13view0, Partnerships citeturn30view0, LinkedIn Company/Profile/Posts citeturn0search1turn0search10turn25search5, BuiltWith Tech-Profil citeturn36search2, ScamAdviser App-Infrastruktur-Hinweis citeturn39search2, Trustpilot Reviews citeturn19search1, Reddit Community Snippet citeturn28reddit28.