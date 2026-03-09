# Internal Plugin Pilot — Phase 24.1

> **Stand:** 09. Maerz 2026
> **Zweck:** Spec fuer einen internen Plugin-Runtime-Pilot: Allowlist,
> Kill-Switch, Manifeste und Sandbox-Grenzen.
> **Source-of-Truth-Rolle:** Zielbild und aktuelle Scaffold-Grenze fuer den
> internen Pilot, nicht Beleg einer vollstaendigen Runtime-Implementierung.

---

## Scope

- Internal-only plugin runtime
- Allowlist: Nur genehmigte Plugins duerfen geladen werden
- Signed manifests: Plugin-Manifest muss kryptographisch signiert sein
- Kill switch: Zentrale Deaktivierung aller oder einzelner Plugins

Nicht Teil dieser Spec:

- externe Partner-/Marketplace-Oeffnung
- Behauptung, dass jede hier beschriebene Runtime-API bereits produktiv existiert
- generelle Capability-/Risk-Tier-Taxonomie ausserhalb des Plugin-Kontexts

---

## Status

- interner Pilot / Scaffold
- Code-Rueckhalt vorhanden fuer Registry, Allowlist, Disable und Kill-Switch
- Signaturpruefung, Sandbox-Haertung und Runtime-Admin-API bleiben Target-State,
  bis sie explizit implementiert sind

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
- Signatur: Ed25519 oder ECDSA P-256 als Zielbild
- Verifikation bei Load-Zeit ist **noch Zielzustand**, nicht bereits als
  vollstaendige Produktionsgarantie dokumentiert

---

## Kill Switch

- Global: `PLUGIN_KILL_SWITCH=true` deaktiviert alle Plugins
- Per-Plugin: `PLUGIN_DISABLED=<plugin_id>` in Config
- Runtime: API `POST /api/v1/plugins/{id}/disable` ist Zielbild; aktuell ist die
  Registry-Primitive wichtiger als eine bestaetigte externe Admin-Flaeche

---

## Sandbox-Grenzen

- Kein Dateisystem-Zugriff ausser explizit gemountete Volumes
- Kein Netzwerk-Zugriff ausser allowlistierte Domains
- Memory/CPU-Limits pro Plugin

---

## Querverweise

- `EXECUTION_PLAN.md`
- `CAPABILITY_REGISTRY.md`
- `PARTNER_BOUNDARY.md`
