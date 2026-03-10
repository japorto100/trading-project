# Storage Layer Delta (SeaweedFS / Garage)

> **Stand:** 09. Maerz 2026
> **Zweck:** Aktiver Ausfuehrungsplan fuer Auswahl, lokalen Test und Architektur-Integration der Object-Storage-Schicht.

---

## 0. Execution Contract (verbindlich fuer CLI-Agents)

### Scope In

- objektiver Kandidatenvergleich SeaweedFS vs. Garage
- signed-upload/download Integrationspfad ueber Go-Boundary
- Artefakt- und Fehlerpfad-Validierung fuer produktnahe Dateitypen

### Scope Out

- finaler produktiver HA-Rollout
- cloud-spezifische Vendor-Optimierung
- fachfremde Provider-Rollouts

### Mandatory Upstream Sources (vor Abarbeitung lesen)

- `docs/storage_layer.md`
- `docs/specs/ARCHITECTURE.md`
- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/execution/infra_provider_delta.md`
- `docs/GO_GATEWAY.md`

### Arbeitsprinzip

- Entscheidungen werden ueber reproduzierbare lokale Nachweise getroffen, nicht ueber Theorie.
- Jede Storage-Entscheidung braucht Folgeeintrag in Runtime-/Plan-Dokumente.

---

## 1. Leitentscheidung

- Wir evaluieren SeaweedFS und Garage host-nativ (ohne Docker) als S3-kompatiblen Object Layer.
- Fokus zuerst auf verifizierbare Produktpfade (Upload, Retrieval, signed URLs, audit), nicht auf Perfektion der Cluster-Topologie.
- Die aktuelle Gateway-Baseline ist bereits geliefert: Go-owned signed artifact flows + relationaler Metadaten-Store + filesystem-backed lokaler Blob-Provider als Vorstufe zur S3-kompatiblen Provider-Evaluation.

---

## 2. Scope fuer diese Delta-Spec

| In Scope | Out of Scope |
|:---------|:-------------|
| lokaler Binary-Betrieb, Single-Node, API-Schnitt, Integrationspfade | vollstaendige Multi-Region-HA-Architektur |
| Artefaktklassen PDF/Audio/Video/Parquet | exotische Object-Lock/S3-Edge-Features |
| retention-/metadata-Modell und Go-boundary | finaler produktiver Infra-Rollout |

---

## 3. Arbeits-Checkliste

### A. Candidate Bring-up

- [x] **SL1** SeaweedFS lokal starten (`weed server -dir=./data -s3`) und Baseline dokumentieren
- [~] **SL2** Garage lokal starten (Config + `garage server`) und Baseline dokumentieren
- [~] **SL3** Smoke-Test je Kandidat (`aws s3 ls`, bucket create/list/delete)

### B. API- und Boundary-Verifikation

- [x] **SL4** Signed upload/download flow ueber Go-Policy-Layer skizzieren und testen
- [x] **SL5** Kein direkter browserseitiger Root-Credential-Pfad
- [x] **SL6** Metadatenmodell fuer Objektindex (owner, hash, type, retention, created_at)

### C. Artefakt- und Fehlerpfade

- [x] **SL7** Upload/Download testen: PDF, Audio, Video, Parquet
- [x] **SL8** Fehlerpfade pruefen: unterbrochener Upload, Timeout, doppelter Upload
- [x] **SL9** Audit-/Trace-Ereignisse fuer Success + Failure in Go erfassen

### D. Entscheidungsabschluss

- [x] **SL10** Kandidatenvergleich dokumentieren (Betrieb, Komplexitaet, Entwicklungsfluss)
- [x] **SL11** "Default local stack" festlegen (voraussichtlich SeaweedFS)
- [x] **SL12** Follow-up fuer produktionsnahe HA-/Replication-Anforderungen in `infra_provider_delta.md` verankern

### Aktueller Baseline-Status

- Gateway-Routen aktiv: `POST /api/v1/storage/artifacts/upload-url`, `PUT /api/v1/storage/artifacts/upload/{id}`, `GET /api/v1/storage/artifacts/{id}`, `GET /api/v1/storage/artifacts/{id}/download`
- Signed URL Tokens: HMAC-basiert, kurzlebig, action-scoped (`upload` / `download`)
- Metadaten: SQLite (`artifact_metadata`) mit object key, filename, content type, retention class, status, size, sha256, timestamps
- Lokaler Blob-Provider: SeaweedFS host-nativ ist jetzt der aktuelle Dev-Default; filesystem-backed bleibt als fallback-faehige Boundary-Vorstufe erhalten
- Verifizierte Nachweise im Code: Go-Tests fuer Signer, Metadaten-Store, S3-Provider, HTTP Artifact Flow und Gateway-Wiring
- Tooling-Pfade angelegt: `tools/seaweedfs/weed.exe`, `tools/seaweedfs/s3.json`, `scripts/start-seaweedfs.sh`, `docker-compose.seaweedfs.yml`, `tools/seaweedfs/Dockerfile`

### SeaweedFS Evidence (2026-03-09)

- Binary erfolgreich bereitgestellt und verifiziert: `tools/seaweedfs/weed.exe version` -> `4.15`
- Host-native Start erfolgreich mit lokalem Tool-Pfad und angepasstem Volume-Port `18080`:
  - Master UI `http://127.0.0.1:9333`
  - Filer `http://127.0.0.1:8888`
  - S3 `http://127.0.0.1:8333`
- Reale Gateway-E2E erfolgreich:
  - Upload-URL erzeugt
  - Artefakt via signiertem Go-Pfad hochgeladen
  - Metadatenstatus `ready`
  - Download ueber signierten Go-Pfad erfolgreich
- OSS-S3-CLI-Smoke erfolgreich ueber den laufenden SeaweedFS-Endpunkt:
  - `aws --endpoint-url http://127.0.0.1:8333 s3 ls`
  - `aws --endpoint-url http://127.0.0.1:8333 s3 mb s3://tradeview-artifacts-cli-smoke`
  - `aws --endpoint-url http://127.0.0.1:8333 s3 rb s3://tradeview-artifacts-cli-smoke`
- Re-Verify auf dem aktuellen Host erfolgreich ueber den DevCache-AWS-CLI-Pfad:
  - `AWS_ACCESS_KEY_ID=seaweedfs AWS_SECRET_ACCESS_KEY=seaweedfs-secret /d/DevCache/bin/aws --endpoint-url http://127.0.0.1:8333 s3 ls`
  - `AWS_ACCESS_KEY_ID=seaweedfs AWS_SECRET_ACCESS_KEY=seaweedfs-secret /d/DevCache/bin/aws --endpoint-url http://127.0.0.1:8333 s3 mb s3://tradeview-artifacts-cli-smoke-2`
  - `AWS_ACCESS_KEY_ID=seaweedfs AWS_SECRET_ACCESS_KEY=seaweedfs-secret /d/DevCache/bin/aws --endpoint-url http://127.0.0.1:8333 s3 rb s3://tradeview-artifacts-cli-smoke-2`
- Dev-Env auf SeaweedFS umgeschaltet: `go-backend/.env.development` nutzt `ARTIFACT_STORAGE_PROVIDER=seaweedfs`
- `scripts/dev-stack.ps1` startet SeaweedFS jetzt als lokalen Infra-Dienst neben NATS/OpenObserve

### Garage Candidate Staging (2026-03-09)

- Tooling-Pfade vorbereitet:
  - `tools/garage/garage.toml` fuer host-native Windows-Konfiguration
  - `tools/garage/garage.docker.toml` fuer Container-Pfad
  - `tools/garage/Dockerfile`
  - `docker-compose.garage.yml`
  - `scripts/start-garage.sh`
- Source-Kandidat lokal bereitgestellt: `tools/garage/src-v2.2.0`
- Rust/Cargo-Home fuer den User dauerhaft auf `D:\DevCache` verankert:
  - `CARGO_HOME=D:\DevCache\cargo\.cargo`
  - `RUSTUP_HOME=D:\DevCache\rustup`
- Host-native Windows-Build aktuell **upstream-blockiert**:
  - `cargo build --release` scheitert in `src/rpc/system.rs`, `src/api/common/generic_server.rs` und `src/web/web_server.rs`
  - Ursache: unguarded Unix-spezifische Imports/Listener/Permissions (`std::os::unix::*`, `nix::sys::statvfs`, `UnixListener`)
- Der aktuelle Arbeitsauftrag zieht deshalb **kein weiteres Garage-Debugging** mehr:
  - auf diesem Windows-Host wird Garage vorerst bewusst uebersprungen
  - Docker/Compose ist in der aktiven Git-Bash-Umgebung ebenfalls nicht verfuegbar, daher gibt es keinen belastbaren Container-Gegenbeweis in diesem Slice
- Konsequenz fuer diese Delta-Spec:
  - `SL2` ist auf diesem Host **deferred/blockiert**, bis entweder ein kleiner tragfaehiger Windows-Fork belegt ist oder Garage spaeter ueber einen verfuegbaren Containerpfad gegengeprueft wird
  - `SL3` ist fuer SeaweedFS verifiziert; der Garage-Teil bleibt deferred

### Kandidatenvergleich (2026-03-10)

| Kriterium | SeaweedFS | Garage |
|:----------|:----------|:-------|
| Host-nativer Windows-Start | verifiziert (`weed.exe`, lokaler S3/Filer/Master-Stack laeuft) | auf diesem Host upstream-blockiert durch Unix-only Code |
| S3-CLI-Smoke | verifiziert (`ls`, `mb`, `rb`) | nicht verifiziert auf diesem Host |
| Go-Integrationspfad | verifiziert ueber signed upload/download + S3-Provider-Tests | keine belastbare lokale Gegenprobe |
| Developer UX lokal | schnellster Weg zum laufenden Single-Node-Stack | aktuell hoher Reibungsgrad, weil Windows-Build nicht tragfaehig |
| Operative Klarheit im Dev-Setup | hoch, da Start-/Port-Modell bereits in `dev-stack.ps1` integriert | mittel bis niedrig, solange nur vorbereitete Configs/Docker-Artefakte existieren |

**Entscheidung:** SeaweedFS bleibt der begruendete `default local stack`.

**Warum:** SeaweedFS liefert auf dem aktuellen Windows-Host den einzigen voll verifizierten End-to-End-Pfad fuer lokalen Objekt-Storage. Garage bleibt ein optionaler Folgekandidat fuer spaetere Gegenpruefung, aber nicht mehr Gate fuer den laufenden Delivery-Plan.

### Storage Verify Evidence (2026-03-09, Go Tests)

- Fokus-Testlauf gruen: `go test ./internal/handlers/http ./internal/storage ./internal/app`
- `SL7` ueber HTTP-Artifact-Tests verifiziert:
  - Upload/Metadata fuer `application/pdf`
  - Upload/Metadata fuer `audio/mpeg`
  - Upload/Metadata fuer `video/mp4`
  - Upload/Metadata fuer `application/vnd.apache.parquet`
- `SL8` ueber gezielte Handler-Fehlerpfade verifiziert:
  - unterbrochener Upload -> `502` + Artefakt bleibt `pending_upload`
  - Timeout (`context.DeadlineExceeded`) -> `504` + Fehlerklasse `timeout`
  - doppelter Upload -> `409`
- `SL9` ueber strukturierte Audit-Logs verifiziert:
  - `artifact_action` fuer Upload/Download
  - `outcome=success` und `outcome=failure`
  - `requestId` wird in den Audit-Log geschrieben
  - Fehlerklassen fuer `invalid_token`, `not_ready`, `timeout`, `storage_error`

### Noch offen trotz Baseline

- `SL3`: SeaweedFS-Teil ist verifiziert; der Garage-Teil bleibt deferred, bis ein spaeterer Container- oder Windows-Fork-Pfad real verfuegbar ist
- `SL2`: Garage host-nativ ist auf diesem Windows-Host aktuell durch Upstream-Unix-Code blockiert; Vergleichspfad braucht entweder kompakten Windows-Patch oder Container-Gegenprobe

---

## 4. Entscheidungskriterien

1. **Developer UX:** setup time bis erster erfolgreicher Upload/Download
2. **Go-Integration:** sauberer signed-url und metadata-flow
3. **Operational clarity:** Logs, Fehlerbilder, einfache Recovery im lokalen Setup
4. **S3-Kompatibilitaet im praktischen Pfad:** keine blocker bei typischen SDK-Aufrufen
5. **Skalierungspfad:** glaubwuerdiger Weg von lokal -> staging -> prod

---

## 5. Querverweise

| Frage | Dokument |
|:------|:---------|
| Normative Architektur inkl. Storage-Knoten | [`../ARCHITECTURE.md`](../ARCHITECTURE.md) |
| Root-Entscheidung und Heuristik | [`../../../storage_layer.md`](../../../storage_layer.md) |
| Infra-/Provider-Rollout | [`infra_provider_delta.md`](./infra_provider_delta.md) |
| Master-Roadmap | [`../EXECUTION_PLAN.md`](../EXECUTION_PLAN.md) |

---

## 6. Evidence Requirements

Fuer jede geschlossene SL-Aufgabe (`SL1-SL12`) mindestens:

- Umgebung und Startkommando
- erfolgreicher Smoke-Nachweis (bucket/list/upload/download)
- Fehlerpfad-Nachweis (timeout/broken upload/duplicate)
- signed URL und audit-pfad dokumentiert
- begruendeter Kandidatenvergleich (UX, Integration, Ops, Skalierung)

---

## 7. Propagation Targets

- `docs/storage_layer.md`
- `docs/specs/ARCHITECTURE.md`
- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/execution/infra_provider_delta.md` (HA/Replication-Follow-up)

---

## 8. Exit Criteria

- `SL1-SL12` entschieden oder deferred mit Owner/Datum
- ein klarer Default-Local-Stack festgelegt
- objektiver Evidence-Satz fuer beide Kandidaten liegt vor
