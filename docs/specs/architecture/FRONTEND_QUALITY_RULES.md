# FRONTEND QUALITY RULES

> **Stand:** 17. Maerz 2026
> **Zweck:** Normative Companion-Spec zu `FRONTEND_ARCHITECTURE.md` fuer
> frontendweite Qualitaets-, Boundary- und Contract-Regeln.
> **Abgrenzung:** `FRONTEND_ARCHITECTURE.md` bleibt Owner fuer Shell, Routen,
> State-Schichten und BFF-Ownership. Dieses Dokument besitzt die
> wiederverwendbaren Frontend-Regeln, die bei neuen Surfaces standardmaessig
> gelten sollen.

---

## 1. Geltungsbereich

Diese Regeln gelten fuer:

- neue Shell-Surfaces
- neue BFF-/Route-Handler an der Frontend-Grenze
- refaktorierte Shared Components
- bestehende Flows, sobald sie substanziell angefasst werden

Diese Regeln gelten **nicht** als Pflicht, historische Altbereiche ohne Anlass
vollstaendig umzuschreiben.

---

## 2. Boundary Rules

### 2.1 Geschlossene Fehler- und Degradation-Modelle

- Frontend-nahe BFF-Routen und Adapter verwenden fuer erwartbare Fehler
  geschlossene `reason`- oder `degradation`-Mengen.
- Freie Error-Strings sind nur fuer Logging oder interne Debug-Ausgaben erlaubt,
  nicht als primarer UI-Vertrag.
- Fallback-/degraded-Pfade geben strukturierte Reasons zurueck, keine
  zusammengesetzten Strings mit eingebetteten Details.

### 2.2 Adapter trennt Bedeutung von Darstellung

- Service-/Adapter-Pfade liefern Fehlerbedeutung und Status.
- UI entscheidet ueber Darstellung: Banner, Inline-Hinweis, Disabled State,
  Redirect oder Retry-Hinweis.
- Kein stilles Vermischen von Domainfehler, HTTP-Mapping und Toast-/Redirect-Logik.

### 2.3 Keine API-only oder toten Ziele

- Frontend-Entry-Elemente duerfen nur auf reale Frontend-Surfaces verlinken.
- Wenn ein Ziel noch nicht existiert, muss es als `pending`, `planned` oder
  deaktivierter Zustand sichtbar bleiben.
- Keine Navigation auf reine API-Routen als Nutzerziel.

---

## 3. A11y Rules

### 3.1 Priorisierte Surface-Baseline

Fuer globale und entscheidungsnahe Surfaces gilt mindestens:

- klare `aria-label` oder sichtbare Labels fuer primaere Entry-Controls
- keyboard-bedienbare Hauptaktionen
- fokussierbare Listen- und Karten-Interaktionen nur mit sichtbarem Fokuszustand
- `aria-current` fuer primaere Surface-Navigation, wenn zutreffend

### 3.2 Screenreader-Hinweise fuer globale Entry-Elemente

- globale Header-Entries (z. B. Bell, Account, Theme, Command/Chat) benoetigen
  eindeutige sr-only oder aria-basierte Benennung
- Status-Badges mit rein visueller Bedeutung brauchen zusaetzliche textuelle
  Vermittlung, wenn sonst Information verloren geht

---

## 4. Design Token Rules

### 4.1 Semantische Statusfarben vor direkten Tailwind-Farben

- neue oder refaktorierte Status-/degraded-/availability-Zustaende nutzen
  semantische Tokens
- direkte `amber`-/`emerald`-/`red`-/`blue`-Klassen sind nur zulaessig, wenn
  kein semantischer Status gemeint ist

### 4.2 Fallback-, Error- und Availability-States sind Theme-faehig

- Skeletons, degraded banners, connected/configured/error badges und kritische
  Inline-Hinweise sollen ueber Theme-/Status-Tokens laufen
- neue kritische States werden nicht auf ad hoc Farbwerte gebaut

---

## 5. Typography And Contrast Rules

- Kritische Microcopy in Headern, Statusleisten, Alert-Inboxen und
  Entscheidungsoberflaechen soll nicht auf schwer lesbare `9px`-Texte oder
  stark gedimmte Varianten zurueckfallen.
- Sehr kleine Typografie ist nur fuer wirklich sekundaeres Rauschen zulaessig,
  nicht fuer Status, Zeit, Severity, Route-Kontext oder Error-Hinweise.

---

## 6. Execution Policy Rules

- Search-/Filter-Inputs nutzen Debounce.
- kontinuierliche UI-Signale wie Drag/Resize/Scroll nutzen Throttle, wenn
  Ereignisdichte relevant wird.
- chattige Mutation-Pfade sollen Queue-/Batch-/Serialisierungsregeln explizit
  dokumentieren.
- Policy-sensitive Flows bleiben ohne Live-Evidence im Execution-Slice offen und
  werden nicht per Annahme geschlossen.

---

## 7. Entry And Ownership Rules

- globale Notifications/Alerts leben im Shell-Rahmen, nicht surface-exklusiv
- Profile/Auth gehoeren in globale Header-/Account-Bereiche
- Settings werden in global vs. workspace-lokal getrennt, statt doppelt
  angeboten zu werden
- Portfolio ist standardmaessig trading-workspace-first, nicht modal-first und
  nicht automatisch eigene Shell-Route

---

## 8. Evidence Rule

Eine Regel gilt erst dann als praktisch uebernommen, wenn mindestens eines gilt:

- sie ist in einem aktiven Frontend-Slice mit konkreter Evidence verankert
- sie ist in einem betroffenen Surface bereits im Code sichtbar
- sie wurde bewusst als deferred mit Owner dokumentiert

Execution-Slices bleiben also der Ort fuer:

- konkrete Checklisten
- offene Gates
- Evidence
- Live-/Browser-Verifikation

---

## 9. Companion Documents

- `docs/specs/architecture/FRONTEND_ARCHITECTURE.md`
- `docs/specs/execution/frontend_refinement_perf_delta.md`
- `docs/specs/execution/frontend_enhancement_delta.md`

