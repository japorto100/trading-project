# AGENT TAMOBO (Working Note)

> Stand: 17. Marz 2026
> Zweck: Praktische Entscheidungsnotiz fuer Tambo + MCP Apps im Kontext von tradeview-fusion.
> Scope: UI/Tool-Integration, Security-Gates, Rollout-Empfehlung, konkrete Usecases.

---

## 1) Kurzfazit

- Tambo ist gut fuer generative React-UI in unserer eigenen Webapp.
- MCP Apps ist ein offener Standard, um UI aus MCP-Servern in Hosts zu rendern.
- Fuer Start: klassische MCP-Tools + interne Tambo-UI zuerst; MCP Apps danach evaluate-first.
- Externe MCP-Server (z. B. Mail) nur kuratiert, mit Consent/Audit/Allowlist.

---

## 2) MCP Apps vs klassische MCP Tools

### Klassische MCP Tools

- Tool gibt Text/JSON zurueck.
- Host rendert selbst (oder nur Text im Chat).
- Heute breit verfuegbar bei vielen Servern.

### MCP Apps

- Tool referenziert UI-Resource (`ui://...`) in Metadata.
- Host rendert UI in sandboxed iframe.
- UI <-> Host Kommunikation via JSON-RPC over `postMessage`.
- Offiziell als Extension standardisiert und produktiv gestartet.

Referenzen:
- [MCP Apps Proposal (Nov 2025)](https://blog.modelcontextprotocol.io/posts/2025-11-21-mcp-apps/)
- [MCP Apps Live (Jan 2026)](https://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/)
- [MCP Apps Quickstart](https://apps.extensions.modelcontextprotocol.io/api/documents/Quickstart.html)
- [MCP Apps Docs](https://modelcontextprotocol.io/docs/extensions/apps)

---

## 3) Gmail/Outlook: brauchen wir MCP App oder MCP Tool?

Kurzantwort:

- Meist liefern Gmail/Outlook MCP-Server heute primaer klassische Tools (read/send/search/reply).
- MCP Apps-UI ist optional zusaetzlich. Die kann vom Server kommen, muss aber nicht.
- Du kannst auch selbst UI bei dir bauen (z. B. mit Tambo), und im Hintergrund nur MCP-Tools nutzen.

Pragmatisches Muster fuer uns:

1. Externe Mail-Server nur als Tool-Backends nutzen.
2. UI bei uns kontrollieren (Tambo/React), damit Security/UX bei uns bleibt.
3. MCP Apps von extern nur bei hohem Trust-Level und strikter Review.

Beispiele:
- [email-mcp](https://github.com/marlinjai/email-mcp)
- [mcp-outlook](https://github.com/mcp-z/mcp-outlook)

---

## 4) Wer bietet MCP Apps/Tools an?

### Realistische Lage (Stand heute)

- Viele Anbieter/Server sind aktuell Tool-first.
- MCP Apps Adoption steigt, aber ist noch nicht flaechendeckend je Server.
- Fuer uns wichtiger als "wer bietet es an" ist: ob Security-/Governance-Anforderungen passen.

Nutzbare Quellen zur Discovery:

- [MCPList](https://www.mcplist.ai/)
- [MCP.so](https://mcp.so/en/servers?tag=latest)
- [FindMCP](https://findmcp.dev/)
- [awesome-mcp-servers](https://github.com/mctrinh/awesome-mcp-servers)

SDK/Implementierung:

- [ext-apps SDK](https://github.com/modelcontextprotocol/ext-apps)
- [@modelcontextprotocol/ext-apps](https://www.npmjs.com/package/@modelcontextprotocol/ext-apps)
- [MCP-UI](https://mcpui.dev/)

---

## 5) Schweiz: Provider-Realitaet

- "Swiss MCP Anbieter" sind oft Integrations-/Beratungsfirmen statt fertige Standardprodukte.
- Realistisch fuer uns: self-hosted in CH/EU Infrastruktur + eigene Governance.

CH Infra Beispiel:

- [Exoscale](https://www.exoscale.com/)
- [Exoscale Datacenters (CH)](https://www.exoscale.com/datacenters/)

Hinweis:

- Fokus sollte auf Trust, Audit, Data Residency und operativen Controls liegen, nicht nur auf "MCP-Label".

---

## 6) Tambo: gibt es Community UIs / fertige Pages?

Ja, es gibt:

- Component-Library / Showcase: [ui.tambo.co](https://ui.tambo.co/)
- Offizielle Components Doku: [Tambo Components](https://docs.tambo.co/getting-started/components)
- Starter-Template/App:
  - [Quickstart](https://docs.tambo.co/getting-started/quickstart)
  - [Chat Starter App](https://docs.tambo.co/examples-and-templates/chat-starter-app)
  - [Template Repo](https://github.com/tambo-ai/tambo-template)

Praxis:

- "Community pages" im Sinn eines App-Stores sind nicht der Kern.
- Normalerweise nutzt man Templates/Komponenten als Basis und baut eigene domain-spezifische UIs.

---

## 6.1) Wichtige Tambo Findings (Trend-Scan)

Verifiziert aus offiziellen Quellen (GitHub Releases, Docs, Issues/PRs):

- Hohe Release-Frequenz ueber mehrere Pakete (`react`, `web`, `api`, `docs`, `create-tambo-app`), also aktives Produkttempo.
- Starker MCP-Fokus (Tools/Resources/Prompts/Elicitations + klare Integrationsguides).
- Interactable-Pattern wird aktiv gehaertet (Tool-Lifecycle, Unmount-Cleanup, Ownership-Refactors), was fuer produktive UIs wichtig ist.
- Per-tool Begrenzungen (`maxCalls`) wurden eingefuehrt, relevant fuer Kosten- und Sicherheitskontrolle.
- Sampling-/Sub-Thread-UX ist ein klarer Produktpfad fuer komplexere Tool-Flows.

Primaere Nachweise:

- [Releases](https://github.com/tambo-ai/tambo/releases)
- [Connect MCP Servers](https://docs.tambo.co/guides/connect-mcp-servers)
- [Customize MCP Display](https://docs.tambo.co/guides/build-interfaces/customize-mcp-display)
- [MCP Sampling Support](https://tambo.co/blog/posts/mcp-sampling-support)
- [Issue #843 (per-tool maxCalls)](https://github.com/tambo-ai/tambo/issues/843)
- [Issue #2610 (interactable tool cleanup)](https://github.com/tambo-ai/tambo/issues/2610)
- [PR #2620 (tool ownership refactor)](https://github.com/tambo-ai/tambo/pull/2620)

---

## 7) NVIDIA-Chart via Tambo (konkreter Usecase)

Ja, stark fuer tradeview-fusion.

### Minimalfluss

1. User: "Zeig NVDA 1D mit RSI/MACD und Key Levels."
2. Tool-Call holt OHLCV + Indicators.
3. Tambo rendert:
   - `PriceChartCard`
   - `SignalSummaryCard`
   - `RiskNotesCard`
4. Follow-up im Chat passt Params an (timeframe, indicators, overlays).

### Warum gut

- Gute explainability (chart + text + risk).
- Iterativ im Chat, aber mit visueller Oberflaeche.
- Passt zu Review-/Artifact-Flow (intent -> preview -> approve/reject).

---

## 8) Weitere Usecases fuer unsere Fullstack-App

- Event-to-Asset Impact Panel (GeoMap Event -> betroffene Assets).
- Scenario Branch UI (Escalation/Base/De-escalation mit Wahrscheinlichkeiten).
- Portfolio Exposure Lens (welche Positionen sind bei Event X verwundbar).
- Explainable Alerts (warum Alarm, welche Evidenz, welche Gegenargumente).
- Intent Review Surface (`intent_id`, diff summary, verification report, decision log).

---

## 9) Tambo vs Claude Artifacts

Gemeinsam:

- Beide koennen AI-generierte visuelle Artefakte darstellen.

Unterschied:

- Tambo: Framework in unserer eigenen App (wir kontrollieren UI, Daten, Policies, Persistenz).
- Artifacts: Host-Feature innerhalb eines AI-Produkts.

Fazit:

- Fuer produktionsnahe, integrierte Workflows ist Tambo in eigener App die bessere Kontrolle.

---

## 10) Security-Guardrails (Pflicht fuer externes UI)

1. Default: externe Server tool-only.
2. MCP Apps nur evaluate-first mit Feature-Flag.
3. Nur predeclared UI-Templates, keine ungeprueften dynamischen Injects.
4. User consent fuer UI-initiierte Tool-Calls.
5. Voller Audit-Trail (tool call, args hash, actor, decision id).
6. Kein trading-kritischer write path ohne Human Approval.
7. Text-only fallback fuer jeden UI-Flow.

---

## 11) Empfohlene Reihenfolge (naechste Schritte)

1. Internen NVDA-Chart-Flow mit Tambo bauen (ohne externe MCP Apps).
2. Mail/Outlook nur als klassische MCP-Tools anbinden.
3. Security/Eval Gate fuer MCP Apps definieren (pilot scope + success metrics).
4. Danach genau eine kuratierte externe App-Klasse pilotieren.

---

## 12) MCP Apps in Tooling: konkrete Link-Sammlung

Offizieller Standard / SDK:

- [MCP Apps (Docs)](https://modelcontextprotocol.io/docs/extensions/apps)
- [MCP Apps Quickstart](https://apps.extensions.modelcontextprotocol.io/api/documents/Quickstart.html)
- [ext-apps Repository](https://github.com/modelcontextprotocol/ext-apps)
- [@modelcontextprotocol/ext-apps (npm)](https://www.npmjs.com/package/@modelcontextprotocol/ext-apps)

Discovery / Verzeichnisse:

- [MCPList](https://www.mcplist.ai/)
- [MCP.so](https://mcp.so/en/servers?tag=latest)
- [FindMCP](https://findmcp.dev/)

"Awesome" Sammlungen (community-kuratiert):

- [awesome-mcp-servers](https://github.com/mctrinh/awesome-mcp-servers)
- [awesome-mcp-list](https://github.com/MobinX/awesome-mcp-list)
- [Awesome-MCP](https://github.com/alexmili/awesome-mcp)
- [aimcp/awesome-mcp](https://github.com/aimcp/awesome-mcp)
- [awesome-mcp-apps discussion/reference](https://www.reddit.com/r/mcp/comments/1p55eoa/mcp_apps_announcement_created_awesomemcpapps.json)

Hinweis zur Qualitaet:

- "Awesome"-Listen sind hilfreich fuer Discovery, aber kein Security-Siegel.
- Vor Produktiveinsatz immer: Trust-Tier, Schema-Review, Allowlist, Audit, Human-Gate.

---

## 13) Reddit-Checks (kompakt)

- Direkt zu Tambo ist Reddit-Signal eher duenn; die substanzielle Aktivitaet liegt eher in GitHub/Docs.
- MCP Apps selbst hat sichtbare Community-Dynamik (eigene Subreddit-Aktivitaet, App-Listen, Hackathons).
- Groesster Reddit-Trend rund um MCP bleibt Security-Risiko bei Servern/Tool-Schemas.

Referenzen:

- [r/MCP_Apps](https://www.reddit.com/r/MCP_Apps/)
- [MCP Apps community announcement](https://www.reddit.com/r/mcp/comments/1p55eoa/mcp_apps_announcement_created_awesomemcpapps.json)
- [MCP Apps Hackathon post](https://www.reddit.com/r/ClaudeAI/comments/1r4t4w5/mcp_apps_for_claude_hackathon_at_y_combinator_san/)
- [MCP attack surface thread](https://www.reddit.com/r/Pentesting/comments/1rqegnr/mcp_servers_are_the_new_attack_surface_so_i.json)
- [700 MCP servers security thread](https://www.reddit.com/r/LLM/comments/1rshcew/we_scanned_700_mcp_servers_heres_what_we_actually.json)

