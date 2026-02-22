# Fusion Docs Index

> **Stand:** 22. Februar 2026
> Vollstaendiger Index aller Dokumentations-Dateien. Fuer Agenten: Lies zuerst `AGENTS.md` im Root.

## Specs (docs/specs/) — Verbindliche Definitionen

| Datei | Inhalt |
|:---|:---|
| `EXECUTION_PLAN.md` | Master-Roadmap: 22+1 Phasen, Sub-Phasen, Dependencies, Current Progress |
| `SYSTEM_STATE.md` | IST/SOLL pro Architektur-Bereich (17 Sektionen) |
| `API_CONTRACTS.md` | Endpoint-Definitionen, Schemas (13 Sektionen inkl. Memory, Agent, State Observation) |
| `AUTH_SECURITY.md` | 3-Schichten Auth, RBAC, WebMCP Security, WebAuthn |
| `FRONTEND_ARCHITECTURE.md` | Komponentenstruktur, State Management, Dependencies, Phase-Mapping |

## Architektur-Dokumente (docs/)

| Datei | Inhalt | Phase(n) |
|:---|:---|:---|
| `GEOPOLITICAL_MAP_MASTERPLAN.md` | GeoMap Vision, 35+ Sektionen, Rendering-Pfad | 4, 12, 19 |
| `GEOPOLITICAL_OPTIONS.md` | D3-Module-Katalog, Feature→Module Matrix, Install-Plan | 4, 12, 19 |
| `go-research-financial-data-aggregation-2025-2026.md` | Go Data Router, BaseConnector, 40+ Provider | 0, 7 |
| `GO_GATEWAY.md` | Gateway-Architektur, Routing, Middleware | 0 |
| `INDICATOR_ARCHITECTURE.md` | Indikator-Blueprint, Rust/Python Split, ML Pipeline | 8, 11, 14, 15 |
| `RUST_LANGUAGE_IMPLEMENTATION.md` | Polars, redb Cache, WASM, Backtesting Engine | 2, 15 |
| `Portfolio-architecture.md` | Portfolio Management, HRP, Kelly, Rebalancing | 5, 13 |
| `UNIFIED_INGESTION_LAYER.md` | Candidate Pipeline, Review UI, Dedup | 9 |
| `MEMORY_ARCHITECTURE.md` | 3-Tier Memory, Knowledge Graph, Vector Store | 6 |
| `AGENT_ARCHITECTURE.md` | Agent Roles, Guards, Workflow Patterns | 10, 16 |
| `AGENT_TOOLS.md` | MCP, WebMCP, Browser Control, Agentic Search, A2A | 10, 16, 21 |
| `CONTEXT_ENGINEERING.md` | Context Strategy, Token Budget, Dynamic Pruning | 10, 16 |
| `GAME_THEORY.md` | Nash→EGT→MFG, 36 Strategeme KG, Simulation | 17 |
| `ENTROPY_NOVELTY.md` | Entropy Monitor, Market Entropy Index, Early Warning | 18 |
| `POLITICAL_ECONOMY_KNOWLEDGE.md` | Keen/Minsky, Heterodox Economics, Crisis Modeling | Referenz |
| `FRONTEND_DESIGN_TOOLING.md` | Design Tokens, Component Library, Tooling | 21 |
| `ADR-001-streaming-architecture.md` | SSE Streaming Architecture Decision | 3 |
| `PROVIDER_LIMITS.md` | Provider Rate Limits, Quotas, Fallback Chain | 0, 7 |
| `webapp.md` | Frontend Bugs/Fixes Arbeitsdokument | — |

## Referenz (nur bei Bedarf)

| Datei | Inhalt |
|:---|:---|
| `Advanced-architecture-for-the-future.md` | Langfrist-Architekturvisionen |
| `CHERI-relevant-2027-2030.md` | CHERI Hardware Capability Notes |
| `Future-Quant-trading.md` | Quantitative Trading Ideen |
| `ENV_VARS.md` | Environment Variables Referenz |
| `REMOTE_DEV_SETUP.md` | Remote Development Setup |
| `REFERENCE_PROJECTS.md` | Externe Referenz-Projekte |

## Archive

- `docs/archive/` — historisches Material, nicht modifizieren.

## Buecher und Notizen

- `docs/books/` — Buchnotizen, Paper-Zusammenfassungen.
