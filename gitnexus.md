# GitNexus — Wie, Was, Wo für CLI-Agenten

> **Stand:** 5. März 2026  
> **Zweck:** Übersicht, wie GitNexus mit den CLI-Agenten (Gemini, Claude, Codex) zusammenarbeitet — welche Dateien wo liegen, was gelesen wird, und wie die Integration funktioniert.

---

## 1. GitNexus kurz

| Aspekt | Beschreibung |
|--------|--------------|
| **Was** | Code-Knowledge-Graph (Tree-sitter + KuzuDB). Indexiert Abhängigkeiten, Call-Chains, Communities, Execution Flows. |
| **Wo** | Index in `.gitnexus/` (gitignored). Registry global in `~/.gitnexus/registry.json`. |
| **Wie** | `npx gitnexus analyze` baut Index, erzeugt/aktualisiert `AGENTS.md`/`CLAUDE.md`, installiert Skills in `.claude/skills/gitnexus/`. |

**Wichtig:** GitNexus **überschreibt** `AGENTS.md`/`CLAUDE.md` nicht komplett. Es fügt nur einen Block zwischen Markern ein oder ersetzt diesen Block. Eigenes Projekt-Content bleibt erhalten.

---

## 2. Dateien-Übersicht (Wo liegt was?)

| Datei/Ordner | Zweck | Von wem gelesen |
|--------------|-------|------------------|
| `AGENTS.md` | Projekt-Router, Lesereihenfolge, Spec-Tabelle | **Alle** (Gemini, Claude, Codex, Cursor, Windsurf, OpenCode) |
| `CLAUDE.md` | Claude-spezifische Hinweise | Claude Code |
| `GEMINI.md` | Gemini-spezifische Hinweise | Gemini CLI |
| `CODEX.md` | Codex-spezifische Hinweise (falls vorhanden) | Codex CLI |
| `.claude/skills/gitnexus/` | GitNexus-Skills (exploring, debugging, impact-analysis, refactoring, guide, cli) | Claude Code, Cursor |
| `.gemini/skills/` | Gemini-Skills (projektspezifisch) | Gemini CLI |
| `.cursor/rules/` | Cursor-Regeln (project.mdc, etc.) | Cursor |
| `~/.cursor/mcp.json` | MCP-Server (global) | Cursor |
| `~/.gemini/settings.json` oder `.gemini/settings.json` | MCP-Server (global oder pro Projekt) | Gemini CLI |
| `~/.codex/` | Codex global config | Codex CLI |

---

## 3. Pro Agent: Wie, Was, Wo

### 3.1 Gemini CLI

| Aspekt | Details |
|--------|---------|
| **Wie** | `gemini` oder `npx @google/gemini-cli` startet Agent. Liest `AGENTS.md` → `GEMINI.md` → Specs. |
| **Was** | MCP-Server in `.gemini/settings.json` (projekt) oder `~/.gemini/settings.json` (global). Skills in `.gemini/skills/`. |
| **Wo** | Projekt: `.gemini/settings.json`, `.gemini/skills/*/SKILL.md`. Memory: `/memory refresh` nach Änderungen an `GEMINI.md`/`AGENTS.md`. |

**GitNexus:** Kein direkter GitNexus-Support. Wenn GitNexus MCP in `~/.cursor/mcp.json` läuft, nutzt Gemini das nicht automatisch. Manuell GitNexus MCP in `.gemini/settings.json` eintragen:

```json
{
  "mcpServers": {
    "gitnexus": {
      "command": "npx",
      "args": ["-y", "gitnexus@latest", "mcp"]
    }
  }
}
```

---

### 3.2 Claude Code

| Aspekt | Details |
|--------|---------|
| **Wie** | `claude` startet Agent. Liest `CLAUDE.md` (prioritär) oder `AGENTS.md` als Fallback. PreToolUse-Hooks reichern grep/glob/bash mit KG-Kontext an. |
| **Was** | MCP via `claude mcp add gitnexus -- npx -y gitnexus@latest mcp`. Skills in `.claude/skills/` (GitNexus installiert automatisch nach `gitnexus analyze`). |
| **Wo** | Projekt: `CLAUDE.md`, `AGENTS.md`, `.claude/skills/gitnexus/`. Global: `~/.claude/` (MCP, Skills). |

**GitNexus:** Volle Integration. `gitnexus setup` konfiguriert MCP. `gitnexus analyze` erzeugt `AGENTS.md`/`CLAUDE.md` und Skills.

---

### 3.3 Codex CLI (OpenAI)

| Aspekt | Details |
|--------|---------|
| **Wie** | `codex` startet Agent. Liest `AGENTS.md` (Discovery: global → repo root → nested). Skills via `$skill-name` oder `.agents/skills/`. |
| **Was** | `AGENTS.md` als Haupt-Instruktion. Skills in `.agents/skills/` (repo), `~/.agents/skills/` (user), `/etc/codex/skills/` (admin). |
| **Wo** | Projekt: `AGENTS.md`, `CODEX.md` (optional), `.agents/skills/`. Global: `~/.codex/AGENTS.md`, `~/.codex/AGENTS.override.md`. |

**GitNexus:** GitNexus schreibt in `.claude/skills/gitnexus/`, nicht in `.agents/skills/`. Codex nutzt `.agents/skills/` — GitNexus-Skills müssten manuell nach `.agents/skills/` kopiert oder verlinkt werden, falls gewünscht. MCP: Codex unterstützt MCP; Konfiguration analog zu Cursor prüfen.

---

### 3.4 Cursor (IDE, kein reiner CLI)

| Aspekt | Details |
|--------|---------|
| **Wie** | Cursor liest `AGENTS.md` und `.cursor/rules/*.mdc`. MCP-Server global in `~/.cursor/mcp.json`. |
| **Was** | Skills aus `.claude/skills/` (GitNexus-kompatibel). Keine PreToolUse-Hooks wie Claude Code. |
| **Wo** | Projekt: `AGENTS.md`, `.cursor/rules/`. Global: `~/.cursor/mcp.json`. |

**GitNexus:** `gitnexus setup` schreibt in `~/.cursor/mcp.json`. `gitnexus analyze` aktualisiert `AGENTS.md`. Skills in `.claude/skills/gitnexus/` werden von Cursor genutzt.

---

## 4. Lesereihenfolge (konsolidiert)

```
1. AGENTS.md          ← Pflicht, alle Agenten
2. CLAUDE.md          ← Claude Code (prioritär)
   GEMINI.md          ← Gemini CLI
   CODEX.md           ← Codex CLI (falls vorhanden)
3. docs/specs/EXECUTION_PLAN.md
4. Spec-Dokument für den Arbeitsbereich (Tabelle in AGENTS.md)
```

---

## 5. GitNexus-Befehle (Referenz)

| Befehl | Wirkung |
|--------|---------|
| `npx gitnexus analyze` | Index bauen, AGENTS.md/CLAUDE.md aktualisieren, Skills installieren |
| `npx gitnexus analyze --force` | Vollständiger Re-Index |
| `npx gitnexus analyze --skip-embeddings` | Ohne Embeddings (schneller) |
| `npx gitnexus setup` | MCP für Cursor/Claude Code/OpenCode konfigurieren (einmalig) |
| `npx gitnexus mcp` | MCP-Server starten (stdio) |
| `npx gitnexus status` | Index-Status prüfen |
| `npx gitnexus clean` | Index löschen |

**Hinweis:** Es gibt keine Option, um das Erzeugen von `AGENTS.md`/`CLAUDE.md` zu deaktivieren. GitNexus fügt nur seinen Block hinzu; eigener Inhalt bleibt erhalten.

---

## 6. Querverweise


- [`AGENTS.md`](AGENTS.md) — Projekt-Router, Spec-Tabelle
- [GitNexus README](https://github.com/abhigyanpatwari/GitNexus) — Offizielle Doku
