# API Shared Invariants

> **Stand:** 09. Maerz 2026
> **Zweck:** Oberste Regeln, Cross-Cutting Headers und Fehlervertrag, die fuer
> alle API-Grenzen gelten.
> **Index:** [`../API_CONTRACTS.md`](../API_CONTRACTS.md)

---

## 1. Oberste Regeln

1. **Browser spricht nur Next.js.**
2. **Next.js spricht fuer Domainpfade nur kontrolliert mit dem Go Gateway.**
3. **Go besitzt Policy, Routing, Audit und Downstream-Auswahl.**
4. **Python und GCT sind interne Downstreams, keine Browser-Frontdoors.**
5. **Rust ist Compute-Layer, kein direkter Browser- oder Policy-Endpunkt.**
6. **Mutationen, Security und Secrets duerfen nicht in stillen Client-Fallbacks enden.**
7. **Provider werden hinter stabilen Route-Familien integriert, nicht ueber neue Public-Pfade pro Quelle.**

---

## 2. Cross-Cutting Headers und Fehler

### Pflicht-Header

| Header | Richtung | Bedeutung |
|:-------|:---------|:----------|
| `X-Request-ID` | Next.js -> Go -> interne Downstreams | Request-Korrelation ueber Sprachgrenzen |
| `X-User-Role` | Next.js -> Go | Rollen-/Policy-Kontext fuer Gateway-Pfade |
| `X-Auth-User` | Next.js -> Go | User-Kontext fuer Audit/Scaffolds |
| `X-Auth-JTI` | Next.js -> Go | Session-/revocation-nahe Bruecke |
| `X-Tradeview-Provider-Credentials` | Next.js -> Go | request-scoped Provider-Credentials fuer read-only Market-Pfade |

### Provider-Credential-Regel

- Browserseitig gespeicherte Market-Provider-Keys duerfen **nicht** direkt gegen
  Provider verwendet werden.
- Next.js rekonstruiert fuer Market-Pfade kontrolliert den
  `X-Tradeview-Provider-Credentials` Header aus dem serverlesbaren Cookie
  `tradeview_provider_credentials`.
- Der Cookie ist fuer diese Bruecke verschluesselt, `HttpOnly`,
  `SameSite=Strict`, auf `/api/market` begrenzt und darf nicht als Plain-JSON
  in `localStorage` gespiegelt werden.
- Go dekodiert den Header in einen request-scoped `CredentialStore`.
- Connectoren duerfen diesen Store selektiv nutzen, muessen aber saubere Error-
  Pfade statt stiller Fallbacks liefern.

### Routing- und Strukturregel

- Die Public-API wird entlang fachlicher Faehigkeiten geschnitten
  (`quote`, `ohlcv`, `orderbook`, `stream`, `providers`, `macro history`),
  nicht entlang einzelner Provider.
- Request-scoped Credentials, Providerwahl und Capability-Mapping sind interne
  Gateway-Verantwortung.
- Next.js darf dafuer wenige stabile BFF-Routen besitzen, soll aber nicht pro
  neuem Provider neue Route-Dateien oder neue oeffentliche Pfadfamilien
  einfuehren.

### Fehlervertrag

Minimum fuer API-Fehler:

```json
{
  "error": "human readable message",
  "requestId": "uuid-or-correlation-id"
}
```

Downstreams duerfen intern reichhaltigere Fehler haben, aber Browser-/BFF-Pfade
muessen immer mindestens einen korrelierbaren Fehler und `requestId` liefern.
