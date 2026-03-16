# GO GATEWAY BOUNDARY

> **Stand:** 16. Maerz 2026  
> **Zweck:** Owner-Spec fuer die Architekturgrenze des Go Gateways: Control Plane,
> Provider-Expansion, Streaming-Defaults, Agent-Tool-Policy.
> **Source-of-Truth-Rolle:** Autoritativ fuer Gateway-Boundary-Regeln und
> Kommunikationsprinzipien; vollstaendiger Integrationsleitfaden in `docs/GO_GATEWAY.md`.

---

## 1. Rolle des Go Gateways

- Go Gateway ist der **einzige Public Entry Point** fuer Kern-Domainpfade.
- Erzwingt zentralisiert: AuthN/AuthZ, RBAC, Rate-Limits, CORS, Audit, Request-ID, Security-Headers.
- Streaming (SSE/WebSocket) bleibt Gateway-owned, nicht BFF-owned.
- Interne Services (Python, GCT, Rust) sind **nicht** direkt aus dem Browser erreichbar.

---

## 2. Provider-Expansion-Prinzipien

- **BaseConnector statt Copy/Paste:** HTTP/Retry/Rate-Limit/Error-Class bleiben gemeinsame Basis.
- **Capability-Matrix pro Provider** statt monolithischer Interfaces.
- **Fehlerklassen** steuern Retry/Circuit/Fallback.
- **Contract-first + gruppenweise Rollouts:** keine ad-hoc Connector-Expansion.
- GCT nur als Robustheits-Referenz und Crypto-Backend, kein universelles Domain-Modell.
- Neue Provider benoetigen keine neue oeffentliche Route-Familie, solange dieselbe fachliche Faehigkeit geliefert wird.

### Provider-Gruppen

| Gruppe | Beschreibung |
|:-------|:-------------|
| `api-hot` | REST-Reads, Quotes, leichte Macro-Reads |
| `api-snapshot` | Serien mit Diff-/Replay-Wert |
| `file-snapshot` | XML/CSV/ZIP/PDF Downloads |
| `stream-only` | SSE/WebSocket/Ticks |

---

## 3. Streaming-Defaults (Browser-Pfade)

- **SSE/stream-first** als Browser-Default fuer Live-Marktdaten.
- **REST** als Recovery-, Snapshot- und Fallback-Pfad.
- Keine gleichberechtigten zwei Wahrheiten: Streams fuer Aktualitaet, REST fuer Bootstrap/Degradation.
- Interne Bus-/Queue-Erweiterungen (NATS) erweitern die Processing-Strecke, sind aber kein Frontend-Protokoll.
- WebTransport und gRPC-Web bleiben beobachtet, sind nicht primaerer Standard.
- GraphQL: nicht geplant (Contract-first REST ist ausreichend).

### Streaming-Haertungsregeln

- Out-of-order / verspaetete Events duerfen Candle- und Orderbook-Grenzen nicht korrumpieren.
- Reconnect/Replay braucht Dedupe- und Checkpoint-Semantik.
- Provider-Limits und Disconnect-Verhalten klar klassifiziert.
- SSE-Fehlerpfade duerfen nicht in stilles Frontend-Polling umkippen.

---

## 4. Agent-Tool-Policy (via Go Gateway)

- MCP/WebMCP-Toolpfade sind policy-/capability-gated und laufen ueber Go.
- Mindestanforderungen verpflichtend:
  - JWT/Session-validierte Aufrufe, rollenbasiert
  - Capability-Checks pro Tool
  - Harte Rate-Limits pro Session/User/Toolklasse
  - Audit-Trail (wer, wann, welches Tool, welcher Kontext)
  - Mutationen nur mit expliziter Governance (Policy + Confirm-Flow)
- **Keine direkte Trading-Execution als offenes Agent-Tool.**

| Tool-Typ | Sensibilitaet |
|:---------|:-------------|
| Read-Only (Quote, OHLCV, News, Geo) | Niedrig bis mittel |
| Portfolio/Account-nah | Hoch |
| Mutierende Agenten-Aktionen | Hoch (nur mit Policy + Confirm) |
| Execution/Orders | Kritisch — kein frei aufrufbares Tool |

---

## 5. Go↔Python IPC

- Proto liegt unter `go-backend/internal/proto/ipc/ipc.proto`.
- gRPC-first moeglich (`GRPC_ENABLED=1`), HTTP-Fallback vorhanden.
- Port-Konvention: HTTP+1000 fuer gRPC pro Python-Service.
- Python ist **nie** direkte Browser-Frontdoor.

---

## 6. Querverweise

- `docs/GO_GATEWAY.md` (vollstaendiger Integrationsleitfaden, RSC, Streaming Details)
- `docs/specs/architecture/ARCHITECTURE_BASELINE.md`
- `docs/specs/API_CONTRACTS.md`
- `docs/specs/security/POLICY_GUARDRAILS.md`
- `docs/specs/AUTH_SECURITY.md`
