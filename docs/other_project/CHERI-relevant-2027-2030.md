# CHERI -- Capability Hardware Enhanced RISC Instructions

> **Stand:** 19. Februar 2026
> **Status: NICHT RELEVANT fuer TradeView Fusion (Stand 2026).** Keine Production-Hardware verfuegbar, kein Cloud-Provider bietet CHERI-Instanzen an. Dieses Dokument dient ausschliesslich als Erinnerung und Wissensspeicher fuer 2027-2030.
> **Unsere Loesung JETZT:** Rust (`rust-core` via PyO3) deckt 90% der Memory-Safety-Probleme ab die CHERI per Hardware loest. Siehe [`RUST_LANGUAGE_IMPLEMENTATION.md`](./RUST_LANGUAGE_IMPLEMENTATION.md) Sek. 8 (AI-Safety-Layer).
> **Naechster Check-Termin:** Q2 2027 (nach erwartetem RISC-V CHERI Ratification)

---

## 1. Was ist CHERI (in einem Absatz)

CHERI ist eine **CPU-Architektur-Erweiterung** (fuer ARM/AArch64, RISC-V, MIPS), die Memory Safety auf Hardware-Ebene erzwingt. Jeder Pointer wird zu einer "Capability" -- er traegt neben der 64-bit Adresse auch **Bounds** (wie weit darf ich lesen/schreiben?), **Permissions** (darf ich ausfuehren? nur lesen?) und einen **Tag-Bit** (wurde die Capability manipuliert?). Die CPU prueft das bei **jedem** Speicherzugriff. Buffer Overflow → Hardware-Trap. Use-After-Free → Hardware-Trap. Pointer-Manipulation → Tag-Bit geloescht → Hardware-Trap. Code muss nur **neu kompiliert** werden (nicht umgeschrieben). 6 Millionen Zeilen C/C++ brauchten nur 0.026% Source-Aenderungen (Cambridge-Studie 2021).

**Quelle:** [Wikipedia: CHERI](https://en.wikipedia.org/wiki/Capability_Hardware_Enhanced_RISC_Instructions), [CHERI Alliance](https://cheri-alliance.org/)

---

## 2. Warum es uns langfristig interessiert

### 2.1 Unsere FFI-Grenzen sind die verwundbarsten Stellen

Rust schuetzt unseren `rust-core` per Compile-Time. Aber an den **FFI-Uebergaengen** endet Rust's Kontrolle:

| FFI-Grenze | Was passiert | Rust-Schutz | CHERI-Schutz |
|---|---|---|---|
| **PyO3** (Rust ↔ Python/C) | Rust ruft Python's C-API auf, Python ruft Rust-Funktionen auf | Nur `unsafe`-Block, Compiler sieht C-Seite nicht | **Hardware prueft jeden Pointer** auf C-Seite |
| **tch-rs** (Rust ↔ PyTorch C++) | Tensor-Operationen via libtorch C++ Backend | `unsafe` FFI-Bindings, keine Rust-Garantien auf C++-Seite | **Hardware-Bounds** auf Tensor-Speicher |
| **wasm-bindgen** (Rust ↔ JS) | WASM↔JS Grenze, JS ist GC-managed | Typensicher durch wasm-bindgen, aber JS-Seite unkontrolliert | Nicht relevant (Browser-Sandbox existiert) |
| **Go ↔ Python** (gRPC/HTTP) | Netzwerk-Grenze, kein shared Memory | Prozess-Isolation (OK) | Nicht relevant (verschiedene Prozesse) |

**Reales Beispiel (2025):** [RUSTSEC-2025-0020](https://rustsec.org/advisories/RUSTSEC-2025-0020.html) -- Buffer Overflow in PyO3's `PyString::from_object`. Rust-String (nicht null-terminiert) wurde an Python's C-API weitergegeben → Python las ueber den Buffer hinaus → Memory Leak. **CHERI haette das per Hardware abgefangen** (Bounds-Check auf den Pointer). Fix war ein manuelles `CString`-Allokieren -- genau die Art von Bug die Rust eigentlich verhindern soll, aber an der FFI-Grenze nicht kann.

### 2.2 Supply-Chain-Angriffe auf Dependencies

CHERI's Compartmentalization kann Third-Party-Dependencies isolieren, sodass selbst eine kompromittierte Library nur auf die Daten zugreifen kann die ihr explizit uebergeben werden. Beispiel: Der [liblzma/xz-Backdoor (2024)](https://cheriot.org/rtos/supply-chain/auditing/2024/04/04/cheriot-supply-chain.html) haette mit CHERI-Compartments keinen Zugriff auf System-Daten ausserhalb seines Sandbox gehabt.

Fuer uns relevant weil:
- `indicator-service` hat Python-Dependencies (numpy, scipy, etc.)
- `rust-core` wird Dependencies wie `kand`, `ndarray`, `tch-rs` haben
- Go Data Router hat externe HTTP-Client-Libraries

### 2.3 AI-generierter Code + Hardware-Safety-Net

Unser Argument in [`RUST_LANGUAGE_IMPLEMENTATION.md`](./RUST_LANGUAGE_IMPLEMENTATION.md) Sek. 8: Rust's Compiler faengt Bugs in AI-generiertem Code ab. CHERI waere die **zusaetzliche Hardware-Schicht** darauf -- falls der Compiler doch etwas durchlaesst (z.B. in `unsafe` Bloecken die AI schreibt).

---

## 3. CHERI vs. Rust -- Komplementaer, nicht Konkurrenz

> "Neither CHERI nor Rust alone is sufficient." -- [CHERIoT Rust FAQ](https://rust.cheriot.org/faq.html)

| Aspekt | Rust allein | CHERI allein | Rust + CHERI |
|---|---|---|---|
| **Compile-Time Safety** | Ownership, Borrowing, Send/Sync | -- | Beides |
| **`unsafe` Bloecke** | **Ungeschuetzt** (Entwickler-Verantwortung) | Hardware-geschuetzt | Beide Schutzschichten |
| **Type Confusion** | Compile-Error (starkes Typsystem) | Nicht abgedeckt | Rust deckt es ab |
| **Concurrency (Data Races)** | Compile-Error (Send + Sync Traits) | Nicht direkt abgedeckt | Rust deckt es ab |
| **Buffer Overflow** | Compile-Error (Bounds Check) | **Hardware-Trap** | Doppelt abgesichert |
| **Use-After-Free** | Compile-Error (Ownership) | **Hardware-Trap** (Temporal Safety) | Doppelt abgesichert |
| **Dependency Supply-Chain** | Vertraut blind auf crates.io | Hardware-Compartmentalization | Isolation boesartiger Dependencies |
| **C/C++ FFI** | **Ungeschuetzt** auf C-Seite | Hardware-geschuetzt | Sicherste Kombination |
| **Performance-Overhead** | Zero-Cost Abstractions | 0-65% (je nach Workload) | Gleicher CHERI-Overhead |

**Zusammenfassung:** Rust loest das Problem per Software (Compile-Time). CHERI loest es per Hardware (Runtime). Zusammen decken sie die Luecken des jeweils anderen ab. Die wichtigste Luecke: Rust's `unsafe` und FFI-Grenzen.

---

## 4. Aktueller Stand (19. Februar 2026)

### 4.1 Hardware

| Plattform | Status | Wer | Fuer wen |
|---|---|---|---|
| **Arm Morello** | Forschungs-Prototyp (7nm Neoverse N1, seit Jan 2022) | ARM + Cambridge | Universitaeten, Forschungslabore. **Kein Produktions-Chip** |
| **CHERIoT** (RISC-V) | Funktionsfaehig auf FPGA (Sonata Board) | Microsoft + lowRISC + diverse | Embedded/IoT Entwickler. FPGA, kein ASIC |
| **Codasip 700-Serie** | Kommerzielles CHERI RISC-V IP (seit Okt 2023) | Codasip | Chip-Designer die CHERI in eigene Chips einbauen wollen. **Kein fertiger Chip, sondern IP-Lizenz** |
| **ICENI** | Angekuendigt (Okt 2024) | SCI Semiconductor | CHERIoT-kompatibler Microcontroller fuer Embedded |
| **WARP** | Angekuendigt (Jul 2025) | Wyvern Global | Erster kommerziell erhaeltlicher CHERI-BSD-nativer RISC-V Chipset |

**Fazit:** Kein Server-/Desktop-Chip mit CHERI kaufbar. Kein Cloud-Provider bietet CHERI-VMs an. Morello-Boards sind Forschungsgeraete (~Tausende verteilt).

### 4.2 Software

| Software | Status | Relevanz fuer uns |
|---|---|---|
| **CheriBSD** (FreeBSD-Fork) | v25.03, >10.000 Pakete memory-safe kompiliert | Koennte theoretisch unseren Stack hosten -- wenn wir FreeBSD statt Linux nutzen wuerden (tun wir nicht) |
| **CHERI Linux** | In Entwicklung (Codasip, Kernel-Port) | Relevanter fuer uns, aber noch nicht nutzbar |
| **CHERIoT Rust** | Preview Release erwartet Ende 2025 / Anfang 2026 | Relevant fuer Embedded, nicht fuer unseren Server-Stack |
| **CapsLock** (Forschung) | QEMU-Prototyp (2025) | Validiert Rust-Invarianten per Hardware. Fand 8 unbekannte Bugs in 100 beliebtesten Crates. 99.7% Kompatibilitaet. Sehr vielversprechend fuer die Zukunft |
| **CHERI-RISC-V Spec** | v0.9.7-draft (stabil, wenige Aenderungen erwartet) | Basis fuer zukuenftige Produktions-Chips |

### 4.3 Standardisierung (RISC-V)

Aus dem [CHERI Ratification Plan](https://lf-riscv.atlassian.net/wiki/pages/viewpage.action?pageId=47022116):

| Phase | Zeitraum |
|---|---|
| Development abgeschlossen | Juli 2026 |
| Stabilization | Aug-Sep 2026 |
| Freeze | Okt-Dez 2026 |
| Public Review | Dez 2026 - Jan 2027 |
| TSC Approval | Feb 2027 |
| Board Approval | Feb-Mar 2027 |
| **Publikation (ratifiziert)** | **Maerz 2027** |

Nach Ratification: Chip-Designer koennen offiziell CHERI-RISC-V-Chips entwickeln. Von Ratification bis kaeuflischem Server-Chip: erfahrungsgemaess **1-3 Jahre** (also fruehestens 2028-2030).

### 4.4 CHERI Alliance (gegruendet Nov 2024)

Mitglieder (Auswahl): **Google**, **ARM**, **Codasip**, **FreeBSD Foundation**, **lowRISC**, **SCI Semiconductor**, University of Cambridge, University of Birmingham, UK NCSC, UK Dstl.

Fokus: Standardisierung, Ecosystem-Aufbau, Konferenzen (CHERITech'25 Nov 2025, CHERI Blossoms Apr 2025).

**Quelle:** [CHERI Alliance Launch](https://cheri-alliance.org/cheri-alliance-officially-launches-adds-major-partners-including-google-to-tackle-cybersecurity-threats-at-the-hardware-level/)

---

## 5. Performance-Overhead (Morello Benchmarks 2025)

Aus "Sweet or Sour CHERI" (IISWC 2025, [Paper](https://eprints.whiterose.ac.uk/id/eprint/231424/)):

| Workload-Typ | Overhead | Grund |
|---|---|---|
| Compute-intensive (wenige Pointer-Ops) | **Negligible (~0%)** | Kaum Pointer-Zugriffe, CHERI hat nichts zu pruefen |
| Typischer C/C++ Code | **10-30%** | Moderat Pointer-intensiv |
| Pointer-intensive (viele Indirections, z.B. Tree-Traversal) | **Bis 65%** | 128-bit Capabilities verdoppeln Pointer-Groesse → Cache-Pressure |

**Wichtig:** Morello ist ein *Prototyp*. Die Studie zeigt dass **moderate Mikroarchitektur-Verbesserungen** den Overhead signifikant senken koennten. Produktions-Chips (2028+) werden deutlich besser optimiert sein.

**Fuer unsere Workloads (hypothetisch):**
- Rust Indicator Core (numerisch, Arrays von f64): **Niedrig** (wenige Pointer-Indirections)
- redb OHLCV-Cache (B-Tree Key-Value Store): **Mittel** (B-Tree = Pointer-intensiv)
- Python-Seite (CPython = extrem Pointer-intensiv): **Hoch** (jedes Python-Object ist ein Heap-Pointer)
- Go Gateway (HTTP/JSON, GC-managed): **Mittel**

---

## 6. CapsLock -- Das spannendste fuer Rust-Projekte

[CapsLock](https://arxiv.org/abs/2507.03344) (2025, National University of Singapore) ist ein Forschungs-Prototyp der CHERI-Capabilities nutzt um Rust's Invarianten **zur Runtime** zu validieren:

| Was es prueft | Wie |
|---|---|
| Ownership (nur ein Owner) | Capability wird bei Move invalidiert |
| Borrowing (eine mutable XOR mehrere immutable Refs) | "Revoke-on-use": Zugriff ueber eine Capability invalidiert automatisch alle anderen auf dasselbe Objekt |
| Spatial Safety (Bounds) | CHERI-Bounds auf jeder Capability |
| Temporal Safety (Use-After-Free) | Capability wird nach Deallocation ungueltig |

**Ergebnis:** 99.7% Kompatibilitaet mit den 100 beliebtesten Crates. **8 bisher unbekannte Bugs** gefunden in real-world Rust-Projekten (in `unsafe` Bloecken).

**Warum das relevant ist:** Wenn CHERI-Hardware verfuegbar wird, koennte unser `rust-core` mit CapsLock-artiger Runtime-Validierung laufen -- und Bugs in `unsafe` Code (z.B. PyO3-Bindings, tch-rs FFI) automatisch per Hardware abfangen.

---

## 7. Konkrete Szenarien fuer TradeView Fusion (2028+)

### Szenario A: Server mit CHERI-RISC-V oder CHERI-ARM

```
Gleicher Code wie heute, nur auf CHERI-Hardware kompiliert:

rust-core (indicators, patterns, cache)
  → CHERI prueft ZUSAETZLICH zu Rust's Compiler
  → unsafe Bloecke haben Hardware-Safety-Net
  → PyO3 FFI-Grenze: Pointer aus Python's C-API haben Bounds
  → tch-rs: Tensor-Buffer in libtorch haben Bounds

Python indicator-service
  → CPython mit CHERI kompiliert
  → Jede C-Extension (numpy, scipy) hat Hardware-Bounds
  → Supply-Chain-Angriff via boesartige PyPI-Pakete: Compartmentalized

Go Data Router
  → Go mit CHERI kompiliert
  → HTTP-Client-Libraries haben Bounds auf Netzwerk-Buffer
```

### Szenario B: Nur fuer kritische Services (Hybrid)

```
Normaler Server (x86/ARM, kein CHERI):
  → React/Next.js Frontend (keine Memory-Safety-Probleme, JS ist GC)
  → Go Gateway (Go ist GC, Memory-Safety ausreichend)

CHERI-Server (RISC-V oder ARM):
  → rust-core + indicator-service (Performance-kritisch, FFI-Grenzen)
  → Backtester (finanzielle Korrektheit kritisch)
  → Geo-Query-Service (wenn >10k Events, Spatial Queries)
```

### Szenario C: Desktop (Tauri + CHERI)

Falls Tauri v2 Desktop-App realisiert wird (Sek. 7, RUST_LANGUAGE_IMPL) und CHERI-Laptops existieren: Der Rust-Backend der Tauri-App laeuft nativ mit CHERI-Protection. Indicator Core + lokaler Backtester + lokaler Cache -- alles Hardware-geschuetzt.

---

## 8. Was wir JETZT tun (nichts, ausser beobachten)

- [x] Dieses Dokument erstellt als Erinnerung
- [ ] **Q2 2027:** RISC-V CHERI Ratification pruefen (erwartet Maerz 2027)
- [ ] **Q4 2027:** Pruefen ob Codasip/andere CHERI RISC-V Chips angekuendigt haben
- [ ] **2028:** Pruefen ob Cloud-Provider CHERI-Instanzen anbieten (AWS Graviton mit CHERI? Google Cloud RISC-V?)
- [ ] **2028+:** Wenn Hardware verfuegbar: `rust-core` auf CHERI kompilieren und testen (sollte ohne Code-Aenderungen funktionieren)
- [ ] **2028+:** CapsLock-artige Runtime-Validierung fuer `unsafe` Bloecke evaluieren

**Was wir NICHT tun:**
- Keinen Code fuer CHERI anpassen
- Keine CHERI-spezifischen Abstractions einbauen
- Keine Morello-Boards kaufen (Forschung, nicht Produktion)

---

## 9. Quellen und Links

### Primaere Quellen
- [Wikipedia: CHERI](https://en.wikipedia.org/wiki/Capability_Hardware_Enhanced_RISC_Instructions)
- [CHERI Alliance](https://cheri-alliance.org/)
- [CHERIoT Platform](https://cheriot.org/)
- [CHERIoT Rust](https://rust.cheriot.org/) -- Rust + CHERI Integration
- [CHERIoT Rust FAQ](https://rust.cheriot.org/faq.html) -- "Neither CHERI nor Rust alone is sufficient"
- [CheriBSD Getting Started](https://ctsrd-cheri.github.io/cheribsd-getting-started/)
- [RISC-V CHERI Spec (v0.9.7-draft)](https://riscv.github.io/riscv-cheri/)
- [CHERI Ratification Plan](https://lf-riscv.atlassian.net/wiki/pages/viewpage.action?pageId=47022116)

### Forschung
- [CapsLock: Runtime Rust Validation via CHERI (2025)](https://arxiv.org/abs/2507.03344) -- 8 neue Bugs in 100 Top Crates gefunden
- [CHERI Myths: Safe Languages (Blog)](https://cheriot.org/cheri/myths/2024/08/28/cheri-myths-safe-languages.html) -- Warum CHERI auch fuer Rust relevant ist
- [Rust for Morello (ECOOP 2023)](https://drops.dagstuhl.de/entities/document/10.4230/LIPIcs.ECOOP.2023.39) -- Always-on Memory Safety, auch in unsafe Code
- [Sweet or Sour CHERI: Morello Performance (IISWC 2025)](https://eprints.whiterose.ac.uk/id/eprint/231424/) -- 0-65% Overhead Benchmarks
- [CHERI: Hardware-Enabled C/C++ Memory Protection at Scale (IEEE S&P 2024)](https://www.computer.org/csdl/magazine/sp/2024/04/10568212/1XXis8UKgUw)

### Supply-Chain Security
- [CHERIoT and the Supply Chain](https://cheriot.org/rtos/supply-chain/auditing/2024/04/04/cheriot-supply-chain.html)
- [RUSTSEC-2025-0020: PyO3 Buffer Overflow](https://rustsec.org/advisories/RUSTSEC-2025-0020.html) -- Reales Beispiel eines Bugs den CHERI abgefangen haette

### Adoption / Policy
- [UK CHERI Adoption Research (Gov.uk)](https://www.gov.uk/government/publications/cheri-adoption-and-diffusion-research)
- [Economic Factors in CHERI Adoption (Warwick University)](https://wrap.warwick.ac.uk/id/eprint/189379/)
- [CHERI Alliance Launch (Nov 2024)](https://cheri-alliance.org/cheri-alliance-officially-launches-adds-major-partners-including-google-to-tackle-cybersecurity-threats-at-the-hardware-level/)

### Verwandte Projekt-Dokumente
- [`RUST_LANGUAGE_IMPLEMENTATION.md`](./RUST_LANGUAGE_IMPLEMENTATION.md) Sek. 8 -- AI-Safety-Layer (Rust Compiler als Software-Equivalent zu CHERI)
- [`Advanced-architecture-for-the-future.md`](./Advanced-architecture-for-the-future.md) -- Guardrails und AI-Safety Patterns
