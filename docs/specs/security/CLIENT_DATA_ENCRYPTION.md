# Client Data Encryption

> **Stand:** 09. Maerz 2026
> **Zweck:** Spec fuer client-seitige Verschluesselung von Frontend User-KG- und
> aehnlichen Browserdaten.
> **Rolle:** Fokussierte Teil-Spec unter dem Umbrella-Dokument
> [`../AUTH_SECURITY.md`](../AUTH_SECURITY.md).

---

## 1. Scope

Dieses Dokument deckt nur die Browser-/Frontend-Seite der Datenverschluesselung
ab:

- Bedrohungsmodell fuer lokale User-Daten im Browser
- Hybrid-Strategie aus WebAuthn PRF und Server-Fallback
- Key Recovery, Rotation und Implementierungsgrenzen

Nicht Teil dieses Dokuments:

- Exchange-Key- oder Service-Secret-Management
- Consent-/Policy-Governance
- allgemeine Session-/JWT-Logik

---

## 2. Bedrohungsmodell

Zu schuetzende Daten:

- lokale KG-/Memory-Records im Browser
- gespeicherte, sensible User-Kontexte
- Daten, die auch ohne aktive Session nicht im Klartext auf Disk liegen sollen

Explizit adressierte Risiken:

- lokaler Disk-Zugriff auf Browser-Storage
- forensische Wiederherstellung lokaler IndexedDB-Daten
- ungeschuetzte Backups/Snapshots von Browserprofilen

Nicht geloest durch diese Schicht:

- aktive XSS im laufenden Browserkontext
- kompromittierte Server mit Zugriff auf Fallback-Key-Material
- unkontrollierte Weitergabe sensitiver Daten an externe LLM-/Tool-Pfade

---

## 3. Hybrid-Strategie

### 3.1 Primaer: WebAuthn PRF

Wenn verfuegbar, soll ein WebAuthn-PRF-basierter Ableitungspfad den
Verschluesselungsschluessel liefern. Das ist 2026 die bevorzugte Richtung, weil
der Schlüssel an den Authenticator gebunden bleibt und nicht direkt extrahierbar
sein muss.

| Plattform | Erwartung |
|:---|:---|
| moderne Chrome/Edge-/Safari-Pfade | PRF bevorzugen |
| Firefox / Windows-Hello / aeltere Browser | Fallback wahrscheinlicher |

### 3.2 Fallback: Server-Derived Key

Falls PRF nicht verfuegbar ist:

- Server liefert oder vermittelt Fallback-Key-Material
- Nutzung bleibt an authentifizierte Session und klare Consent-/Security-Regeln
  gebunden
- Fallback ist funktional noetig, aber sicherheitlich schwächer als PRF

### 3.3 Zusaetzlicher Disk-Schutz

- bevorzugt mit non-extractable `CryptoKey`
- AES-GCM fuer lokale Daten
- Key-Material nicht unnötig serialisieren oder loggen

### 3.4 Architektur-Skizze

1. Login / Re-Auth erfolgreich
2. PRF-Key ableiten oder serverseitigen Fallback-Key holen
3. lokale KG-/Memory-Daten transparent ver- und entschluesseln
4. Key bei Logout / Tab-Close aus dem aktiven Memory entfernen

---

## 4. Architektur-Regeln

| Thema | Vorgabe |
|:---|:---|
| Algorithmus | AES-GCM |
| Storage | verschluesselte Records in IndexedDB |
| Key Owner | Browser-Session / Authenticator / serverseitiger Fallback-Pfad |
| Logging | niemals Schluessel oder Klartext-Payloads loggen |
| Recovery | definierter Re-Key-/Re-Encrypt-Pfad statt stiller Datenverluste |

---

## 5. Recovery und Rotation

- bei Auth-Methoden-Wechsel muss klar sein, ob Daten neu verschluesselt werden
  muessen
- Fallback-Key-Wechsel braucht Re-Encrypt-Strategie oder kontrollierten Reset
- verlorene/inkonsistente Schluessel duerfen nicht zu still korruptem Zustand
  fuehren

Pragmatische Regel:

- lieber expliziter Re-Key-/Reset-Flow als unsichtbare "best effort"-Magie

---

## 6. Implementierungs-Slice

Die Spec stuetzt die bereits dokumentierte Baseline:

- `/auth/kg-encryption-lab`
- `src/lib/kg/encrypted-indexeddb.ts`
- WebAuthn-PRF als bevorzugter Zukunftspfad
- Server-Fallback fuer Browser/Geraete ohne PRF-Support

Folgearbeit:

1. PRF-Detection und UX fuer Capability-Unterschiede stabilisieren.
2. Re-Key-/Rotation-Pfade definieren und verifizieren.
3. Verbindung zu Consent- und Memory-Flows sauber dokumentieren.

---

## 7. Querverweise

| Thema | Dokument |
|:------|:---------|
| Umbrella Security Spec | [`../AUTH_SECURITY.md`](../AUTH_SECURITY.md) |
| Auth-/Sessionmodell | [`AUTH_MODEL.md`](./AUTH_MODEL.md) |
| Consent-/Policy-Governance | [`POLICY_GUARDRAILS.md`](./POLICY_GUARDRAILS.md) |
| Secrets-/Key-Management ausserhalb des Browsers | [`SECRETS_BOUNDARY.md`](./SECRETS_BOUNDARY.md) |
