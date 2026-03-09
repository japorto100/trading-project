# Storage Layer (SeaweedFS / Garage)

> Stand: 09 Maerz 2026  
> Zweck: Root-Entscheidungsdokument fuer die Object-Storage-Schicht in `tradeview-fusion`.

---

## 1) Zielbild

`tradeview-fusion` nutzt einen object-first Storage-Layer fuer grosse Artefakte:

- PDF
- Audio
- Video
- Parquet
- weitere grosse Batch-/Ingestion-Dateien

Kernprinzip:

- Binaerdaten liegen im Object Store (S3-kompatibel).
- Domain-/Policy-/Retention-Metadaten liegen in der Datenbank.
- Zugriffspfade werden ueber Go signiert und auditiert.

---

## 2) Kandidaten fuer lokale und produktive Pfade

| System | Rolle in unserem Kontext | Reife fuer schnellen Host-Test |
|:------|:--------------------------|:-------------------------------|
| SeaweedFS | primarer Kandidat fuer schnellen Start (single binary, S3 gateway) | sehr hoch |
| Garage | Alternative mit staerkerem Cluster-/Config-Fokus | mittel |

---

## 3) Host-Only Test (ohne Docker)

Beide Systeme sind fuer host-native Binary-Betrieb geeignet.

### 3.1 SeaweedFS Schnellstart

```bash
./weed server -dir=./data -s3
```

Standard-Ports:

- master: `9333`
- volume: `8080`
- filer: `8888`
- s3: `8333`

Smoke-Test:

```bash
aws --endpoint-url http://localhost:8333 s3 ls
```

### 3.2 Garage Schnellstart

Garage braucht vor Start eine Config (z. B. `metadata_dir`, `data_dir`, `replication_factor`).

```bash
garage server
```

Standard-S3-Endpoint:

- `http://localhost:3900`

---

## 4) Architekturregeln (verbindlich)

1. **No direct browser root access:** Browser bekommt nur kurzlebige signierte Upload-/Download-Pfade.
2. **Go-owned policy boundary:** ACL, retention, quota, tenancy und audit laufen ueber Go.
3. **Object-first for large artifacts:** grosse Dateien nie als DB-Blob normalisieren.
4. **Metadata split:** Objektinhalt im Store, Index/Lifecycle/Ownership in relationalen Tabellen.
5. **Integrity by default:** checksum/etag bei Upload und optional bei asynchronen Verarbeitungen verifizieren.
6. **Replay-safe ingestion:** asynchrone Importpfade mit idempotency key und dedup hash.

---

## 5) Entscheidungsheuristik SeaweedFS vs Garage

- **SeaweedFS bevorzugen**, wenn:
  - wir in 30-60 Minuten einen lokalen End-to-End-Test fahren wollen
  - ein einfacher Single-Node Start fuer Developer wichtig ist
  - S3 + Filesystem/Filer-Szenarien kurzfristig zusammen gedacht werden

- **Garage bevorzugen**, wenn:
  - Cluster-/Replikationsmodell frueh explizit im Mittelpunkt steht
  - wir bewusst mehr initiale Konfigurationsdisziplin akzeptieren

---

## 6) Minimales Acceptance Set

Ein Kandidat gilt als "baseline usable", wenn alle Punkte gruen sind:

- Bucket erstellen, listen, loeschen
- Upload/Download fuer PDF, Audio, Video, Parquet
- Signed URL / short-lived access flow ueber Go
- Metadatenpersistenz (owner, content_type, size, hash, retention_class)
- Fehlerpfade (timeout, broken upload, duplicate upload) sauber auditiert

---

## 7) Verknuepfte Spezifikationen

- Architektur: `docs/specs/ARCHITECTURE.md`
- Aktiver Umsetzungsplan: `docs/specs/execution/storage_layer_delta.md`
- Gesamtplan: `docs/specs/EXECUTION_PLAN.md`
