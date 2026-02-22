---
name: frontend-refinement
description: Optimiert und poliert bestehende Frontend-Komponenten. Vereint Visual Audits, Design-System-Validierung, Accessibility-Verbesserungen und Performance-Optimierung. Nutze diesen Skill, um bestehenden Code zu verfeinern, Konsistenz zu prüfen oder UI-Schulden abzubauen.
---

# Frontend Refinement Expert

## Overview
Dieser Skill dient der systematischen Verbesserung bestehender UIs. Er kombiniert vier Kern-Disziplinen, um Code von "funktional" zu "production-grade" zu heben.

## 1. Visual & Aesthetic Audit
- **Check:** Entspricht die Komponente den BOLD-Design-Prinzipien (kein AI-Slop)?
- **Action:** Ersetze generische Paddings/Gaps durch rhythmische Abstände. Optimiere Typografie-Hierarchien. Füge visuelle Tiefe hinzu (Glassmorphism, Layered Shadows).

## 2. Design System Validation
- **Check:** Werden Hardcoded Colors oder Magic Numbers verwendet?
- **Action:** Ersetze Hex-Codes durch Tailwind-Klassen aus der `tailwind.config.ts`. Stelle sicher, dass Shadcn/UI Komponenten (aus `components.json`) korrekt erweitert und nicht überschrieben werden.

## 3. Accessibility (A11y) & Semantics
- **Check:** Ist die Komponente für Screenreader bedienbar? Stimmen die Kontraste?
- **Action:** 
  - Füge fehlende `aria-labels` und `roles` hinzu.
  - Nutze semantisches HTML (`main`, `section`, `article`, `nav`) statt div-Wüsten.
  - Prüfe `tabindex` und Focus-States für Keyboard-Navigation.

## 4. Performance & Code Quality
- **Check:** Gibt es unnötige Re-Renders oder zu große Asset-Imports?
- **Action:**
  - Optimiere React-Hooks (`useMemo`, `useCallback` nur wo nötig).
  - Implementiere Lazy Loading für schwere Komponenten (z.B. Charts).
  - Nutze Next.js Image-Optimierung.

## Refinement Workflow
1. **Analyze:** Scanne die Datei nach "Quick Wins" in allen 4 Kategorien.
2. **Plan:** Erstelle eine kurze Liste der geplanten Änderungen.
3. **Execute:** Führe die Änderungen iterativ durch (zuerst Struktur/A11y, dann Visuals).
4. **Verify:** Prüfe gegen das bestehende Design-System.

**WICHTIG:** Verändere niemals die Geschäftslogik, es sei denn, es ist für die Performance zwingend erforderlich. Der Fokus liegt auf der UI/UX-Exzellenz.
