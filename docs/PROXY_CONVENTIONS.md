# Proxy- und API-Routen-Konventionen

> Stand: 28 Feb 2026  
> Zweck: Verbindliche Regeln fuer Next.js API-Routen und Proxy-Verhalten. Referenz: `API_CONTRACTS.md`, `ARCHITECTURE.md`

---

## 1. Next.js als Thin Proxy

Next.js API-Routen (`/api/*`) fungieren als **Thin Proxy**:

- Keine Domain-Truth-Logik in Route-Handlern
- Keine direkten Provider-/Datenbank-Calls fuer mutierende oder datenliefernde Pfade
- Weiterleitung an Go Gateway (`GO_GATEWAY_BASE_URL`, Port 9060) mit Request-Kontext

**Ausnahme:** Reine Metadaten-Routen (z. B. `GET /api/market/providers` mit `PROVIDER_REGISTRY`) duerfen lokal antworten, wenn keine Backend-Daten noetig sind.

---

## 2. Correlation-ID-Propagation (Pflicht)

Alle API-Routen, die Requests an Go oder Python weiterleiten, muessen:

1. **`X-Request-ID`** aus dem eingehenden Request uebernehmen oder neu generieren
2. Den Header an alle Downstream-Requests (Go, Python) weiterreichen
3. In Fehler-Responses und Logs den `requestId` enthalten

**Implementierung:** `src/proxy.ts` setzt `X-Request-ID` zentral fuer alle `/api/*`-Pfade. Route-Handler, die manuell an Go/Python proxen, muessen den Header aus `request.headers` uebernehmen.

**Checkliste fuer neue Routen:**

- [ ] `X-Request-ID` wird an Downstream weitergegeben
- [ ] Keine Domainlogik in der Route (nur Proxy + ggf. Response-Normalisierung)

---

## 3. Keine direkten Provider-Bypaesse

- OHLCV-, Quote- und Market-Stream-Daten kommen ausschliesslich ueber Go Gateway
- Keine `getProviderManager()`-Aufrufe in `src/app/api/market/*`
- Provider-Metadaten (`PROVIDER_REGISTRY`) fuer `GET /api/market/providers` sind erlaubt (statische Metadaten)

---

## 4. Referenzen

- [`docs/specs/API_CONTRACTS.md`](specs/API_CONTRACTS.md) — API-Contracts
- [`docs/specs/ARCHITECTURE.md`](specs/ARCHITECTURE.md) — Zielarchitektur
- [`src/proxy.ts`](../src/proxy.ts) — Zentraler Proxy + Auth-Header
