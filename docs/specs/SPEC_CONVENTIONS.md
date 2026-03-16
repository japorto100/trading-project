# SPEC CONVENTIONS

> **Stand:** 16. Maerz 2026
> **Zweck:** Template-, Lifecycle- und Naming-Regeln fuer neue Specs.
> **Referenz:** [`DOCUMENTATION_ARCHITECTURE.md`](./DOCUMENTATION_ARCHITECTURE.md) fuer Ebenen und Read Order.

---

## 1. Pflichtbereiche (alle Specs)

Jede Spec enthaelt mindestens:

- **Zweck** — Was ist der Geltungsbereich? (Blockquote am Anfang)
- **Stand** — Datum der letzten Aktualisierung
- **Scope** — Was deckt diese Spec ab?
- **Source-of-Truth-Rolle** — Welche Fragen beantwortet sie autoritativ?
- **Abgrenzung** — Was gehoert nicht hierher?
- **Querverweise** — Links zu fuehrenden oder abhaengigen Dokumenten

---

## 2. Feature-Specs (zusätzlich)

Fuer neue Features oder groessere Aenderungen:

- **Problem** — Was loesen wir? Warum?
- **Solution** — Was bauen wir? Design-Entscheidungen?
- **Success Criteria** — Messbar, testbar (Checkboxen)
- **Out of Scope** — Explizit nicht enthalten

---

## 3. Execution-Specs (zusätzlich)

Fuer `docs/specs/execution/*.md`:

- **Owner** — Wer ist verantwortlich?
- **Status** — Aktueller Fortschritt
- **Input-Dokumente** — EXECUTION_PLAN, ggf. Domain-Root-Docs
- **Verify Gates** — Konkrete Abnahme-Checklisten
- **Offene Punkte** — Restlage, Priorisierung

---

## 4. Namensregeln

| Typ | Konvention | Beispiel |
|:----|:-----------|:---------|
| Core Specs | `UPPERCASE_WITH_UNDERSCORES.md` | `API_CONTRACTS.md`, `SYSTEM_STATE.md` |
| Sub-Specs (API) | `API_*.md` in `api/` | `API_BROWSER_TO_NEXT.md` |
| Sub-Specs (Security) | `*_*.md` in `security/` | `AUTH_MODEL.md`, `SECRETS_BOUNDARY.md` |
| Sub-Specs (Architecture) | `UPPERCASE_WITH_UNDERSCORES.md` in `architecture/` | `ARCHITECTURE_BASELINE.md` |
| Execution-Specs | `lowercase_snake_case.md` in `execution/` | `geomap_closeout.md`, `cross_cutting_verify.md` |

---

## 5. Single-File vs. Ordner-Split

**Single-File** genuegt wenn:

- Ein klares Thema, eine Verantwortlichkeit
- Unter ~3.500 Tokens (~2.500 Woerter)
- Keine mehrere Boundary-Grenzen

**Ordner-Split** wenn:

- Mehrere Verantwortlichkeiten (z.B. API nach Browser/Next/Go/Internal oder Architecture nach Baseline/Orchestrierung)
- Datei waechst ueber 3.500 Tokens
- Klar getrennte Sub-Themen (z.B. Auth vs. Policy vs. Secrets)

---

## 6. Verify-Gate-Konventionen

- Checkboxen: `- [ ]` offen, `- [x]` erledigt, `- [~]` teilweise
- Gate-IDs: z.B. `1.v17`, `MC1`, `PV.1` fuer Nachverfolgbarkeit
- Verweis auf EXECUTION_PLAN-Phase wo sinnvoll
