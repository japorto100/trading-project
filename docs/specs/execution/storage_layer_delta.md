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

- [ ] **SL1** SeaweedFS lokal starten (`weed server -dir=./data -s3`) und Baseline dokumentieren
- [ ] **SL2** Garage lokal starten (Config + `garage server`) und Baseline dokumentieren
- [ ] **SL3** Smoke-Test je Kandidat (`aws s3 ls`, bucket create/list/delete)

### B. API- und Boundary-Verifikation

- [ ] **SL4** Signed upload/download flow ueber Go-Policy-Layer skizzieren und testen
- [ ] **SL5** Kein direkter browserseitiger Root-Credential-Pfad
- [ ] **SL6** Metadatenmodell fuer Objektindex (owner, hash, type, retention, created_at)

### C. Artefakt- und Fehlerpfade

- [ ] **SL7** Upload/Download testen: PDF, Audio, Video, Parquet
- [ ] **SL8** Fehlerpfade pruefen: unterbrochener Upload, Timeout, doppelter Upload
- [ ] **SL9** Audit-/Trace-Ereignisse fuer Success + Failure in Go erfassen

### D. Entscheidungsabschluss

- [ ] **SL10** Kandidatenvergleich dokumentieren (Betrieb, Komplexitaet, Entwicklungsfluss)
- [ ] **SL11** "Default local stack" festlegen (voraussichtlich SeaweedFS)
- [ ] **SL12** Follow-up fuer produktionsnahe HA-/Replication-Anforderungen in `infra_provider_delta.md` verankern

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
