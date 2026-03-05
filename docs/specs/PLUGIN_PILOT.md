# Internal Plugin Pilot — Phase 24.1

> Stand: 27 Feb 2026  
> Zweck: Internal-only Plugin Runtime Pilot (allowlist, signed manifests, kill switch).

---

## Scope

- Internal-only plugin runtime
- Allowlist: Nur genehmigte Plugins duerfen geladen werden
- Signed manifests: Plugin-Manifest muss kryptographisch signiert sein
- Kill switch: Zentrale Deaktivierung aller oder einzelner Plugins

---

## Allowlist

| Feld | Beschreibung |
|------|--------------|
| `plugin_id` | Eindeutige ID (z.B. UUID oder reverse-DNS) |
| `version` | SemVer-konform |
| `allowed_until` | Optionales Ablaufdatum |
| `capabilities` | Liste erlaubter Capabilities (read-only, bounded-write, etc.) |

---

## Signed Manifests

- Manifest: JSON mit plugin_id, version, entry_point, capabilities, dependencies
- Signatur: Ed25519 oder ECDSA P-256
- Verifikation bei Load-Zeit

---

## Kill Switch

- Global: `PLUGIN_KILL_SWITCH=true` deaktiviert alle Plugins
- Per-Plugin: `PLUGIN_DISABLED=<plugin_id>` in Config
- Runtime: API `POST /api/v1/plugins/{id}/disable`

---

## Sandbox-Grenzen

- Kein Dateisystem-Zugriff ausser explizit gemountete Volumes
- Kein Netzwerk-Zugriff ausser allowlistierte Domains
- Memory/CPU-Limits pro Plugin

---

## Referenzen

- EXECUTION_PLAN.md Phase 24a
- CAPABILITY_REGISTRY.md
