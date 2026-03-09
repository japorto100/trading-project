# Python and Rust References

> **Owner-nahe Doku:** Quant-/Indicator-Entscheidungen bleiben in
> `../../INDICATOR_ARCHITECTURE.md`; Rust-Placement bleibt in
> `../../RUST_LANGUAGE_IMPLEMENTATION.md`.

---

## Python-Libraries

| Referenz | Typ | Rolle fuer uns |
|----------|-----|----------------|
| `pandas-ta` | Library | Algorithmen-Referenz, nicht langfristige Kernbasis |
| `TA-Lib` | Library | Korrektheits- und Referenz-Benchmark |
| `TA (technical-analysis)` | Library | Offen, geringere Prioritaet |

---

## Rust / Compute

| Referenz | Typ | Rolle fuer uns |
|----------|-----|----------------|
| `PyO3` | Library / Runtime-Baustein | Kern-Technologie fuer Rust-Python-Bridge |
| `Kand` | GitHub-Projekt / Library | Kandidat fuer `rust-core/` |
| `VectorTA` | Library / Projekt | Fallback bei groesserer Indicator-Tiefe |
| `ChartGPU` | GitHub-Projekt | Alternativer Chart-Performance-Pfad |
| `Tauri v2` | Plattform | Nur spaeter bei echtem Desktop-Druck |

---

## Arbeitsregel

- Buch- und Quant-Referenzen werden **nicht** hier ausformuliert, sondern in
  `../../INDICATOR_ARCHITECTURE.md` und `../../docs/books/`.
- Rust-Projekte werden hier nur als kurze Kandidatenliste gehalten; die echte
  Bewertung liegt in `../../RUST_LANGUAGE_IMPLEMENTATION.md`.

---

## Querverweise

- `../../INDICATOR_ARCHITECTURE.md`
- `../../RUST_LANGUAGE_IMPLEMENTATION.md`
