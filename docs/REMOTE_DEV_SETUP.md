# REMOTE DEVELOPMENT SETUP

> **Stand:** 20. Februar 2026  
> **Zweck:** Evaluierung und Setup-Anleitung für Remote-Entwicklung mit Cursor IDE. Alle schwere Arbeit (Go, Python, Rust, Next.js) läuft auf einem Server, dein PC rendert nur die Editor-UI.  
> **Status:** Evaluierung. Noch keine Entscheidung getroffen.

---

## 1. Warum Remote Development?

| Problem | Auswirkung |
|:---|:---|
| Schwacher lokaler PC | Rust-Kompilierung (`maturin develop`) dauert Minuten, Go + Python + Next.js gleichzeitig = RAM-Limit |
| Docker nicht möglich | Kein Docker Desktop auf dem lokalen PC (Hardware-Limit) |
| Multi-Service Stack | 4 Prozesse gleichzeitig: Next.js (3000), Go (9060), Python (8090+8091), GCT (9052+9053) |
| Rust Builds | `cargo build` + `maturin develop` = CPU-intensiv und RAM-hungrig |

**Lösung:** Code und alle Prozesse auf einem Remote-Server. Cursor IDE verbindet sich per SSH. Dein PC braucht nur Internet + Cursor-UI (~500 MB RAM).

---

## 2. Was Cursor kann (und was nicht)

### Cursor KANN: Remote SSH Development

Cursor ist ein VS Code Fork und unterstützt **Remote SSH** nativ:

- Cursor-UI läuft lokal (leichtgewichtig)
- Ein Server-seitiger Agent wird automatisch installiert
- Alle Extensions, Terminal, File Explorer arbeiten auf dem Server
- Du arbeitest als wärst du lokal, aber alles läuft remote

**Cursor-eigene Extension:** `anysphere.remote-ssh` (besser als die standard VS Code Remote-SSH Extension -- stabiler und optimiert für Cursor's AI Features).

### Cursor KANN NICHT: Cloud Execution ohne eigenen Server

Cursor hat **kein eingebautes "Run in Cloud"**. Du brauchst entweder:
- Einen eigenen Server (VPS) mit SSH-Zugang, oder
- Einen Managed-Service (GitHub Codespaces, Gitpod) der dir einen Server gibt

---

## 3. Optionen-Vergleich

### Option A: Hetzner VPS (Empfehlung)

| Eigenschaft | CX22 | CX32 | CX42 |
|:---|:---|:---|:---|
| **vCPU** | 2 (Intel) | 4 (Intel) | 8 (Intel) |
| **RAM** | 4 GB | 8 GB | 16 GB |
| **SSD** | 40 GB | 80 GB | 160 GB |
| **Preis** | ~4.50 EUR/Monat | ~8.50 EUR/Monat | ~17 EUR/Monat |
| **Traffic** | 20 TB | 20 TB | 20 TB |
| **Standort** | Falkenstein/Nürnberg (DE) | Falkenstein/Nürnberg (DE) | Falkenstein/Nürnberg (DE) |
| **Taugt für uns?** | Knapp. Go+Python OK, Rust-Builds eng. | **Gut.** Alles gleichzeitig. | Komfortabel, Zukunftssicher. |

**Vorteile:**
- 24/7 verfügbar, kein Zeitlimit
- Volle Kontrolle (root)
- Deutsche Server = niedrige Latenz aus DACH
- Stabile Preise, keine Überraschungen
- Kann jederzeit hoch-/runterskaliert werden

**Nachteile:**
- Kostet Geld (ab ~4.50 EUR/Monat)
- Initialer Setup-Aufwand (~30 Minuten)

**Empfehlung: CX32 (8 EUR/Monat).** 4 vCPU + 8 GB RAM reicht für Go + Python + Rust + Next.js gleichzeitig.

---

### Option B: Oracle Cloud Free Tier

| Eigenschaft | Details |
|:---|:---|
| **vCPU** | 4 ARM (Ampere A1) |
| **RAM** | 24 GB (!) |
| **SSD** | 200 GB |
| **Preis** | 0 EUR/Monat (dauerhaft Free Tier) |
| **Standort** | Frankfurt (DE) verfügbar |

**Vorteile:**
- Gratis, dauerhaft (kein Trial)
- 24 GB RAM = extrem viel Headroom
- 24/7 verfügbar

**Nachteile:**
- ARM-Architektur: Go/Rust/Python funktionieren, aber manche Packages haben keine ARM-Builds. Testen nötig.
- Instanzen manchmal nicht sofort verfügbar (Capacity-Limits). Man muss ggf. mehrfach versuchen oder ein Script laufen lassen.
- Oracle Cloud UI ist unübersichtlich
- Wenn Account als "idle" eingestuft wird, kann die Instanz recycled werden (selten, aber möglich)

**Empfehlung:** Guter Backup-Plan. Versuchen kostet nichts. Wenn's klappt: 24 GB RAM gratis.

---

### Option C: GitHub Codespaces

| Eigenschaft | Free Tier | Paid |
|:---|:---|:---|
| **Stunden/Monat** | 60h (2-Core) / 30h (4-Core) | Pay-as-you-go |
| **RAM** | 8 GB (2-Core) / 16 GB (4-Core) | bis 64 GB |
| **SSD** | 32 GB | bis 64 GB |
| **Preis** | 0 EUR | ~0.18 EUR/h (2-Core) |

**Vorteile:**
- Zero Setup: Direkt aus GitHub Repo starten
- `devcontainer.json` definiert das Environment (reproduzierbar)
- Funktioniert mit Cursor (über SSH oder Browser)
- Ideal zum Testen ob Remote Dev für dich funktioniert

**Nachteile:**
- **Zeitlimit:** 60h/Monat = ~2h/Tag. Für intensives Development zu wenig.
- Maschine wird gestoppt wenn inaktiv (30 min Default)
- Daten bleiben, aber Prozesse (Go, Python) müssen neu gestartet werden
- Nicht 24/7 -- GCT oder Streaming-Tests laufen nicht dauerhaft

**Empfehlung:** Zum Ausprobieren ideal (0 EUR). Für dauerhaftes Development zu limitiert.

---

### Option D: Gitpod

| Eigenschaft | Free Tier | Paid |
|:---|:---|:---|
| **Stunden/Monat** | 50h | Unlimited |
| **RAM** | 8 GB | bis 16 GB |
| **Preis** | 0 EUR | ~9 EUR/Monat |

**Vorteile:**
- Multi-Repo Support (GitHub, GitLab, Bitbucket)
- Prebuilds: Environment ist sofort ready
- `.gitpod.yml` für Reproduzierbarkeit

**Nachteile:**
- 50h/Monat Free Tier (noch weniger als Codespaces)
- Weniger stabil mit Cursor als Codespaces
- Paid Tier für Unlimited immer noch timeout-basiert

**Empfehlung:** Zweit-Wahl hinter Codespaces. Lohnt sich nur wenn du nicht auf GitHub bist.

---

## 4. Entscheidungsmatrix

| Kriterium | Hetzner CX32 | Oracle Free | Codespaces | Gitpod |
|:---|:---|:---|:---|:---|
| **Kosten** | ~8 EUR/Monat | 0 EUR | 0-15 EUR | 0-9 EUR |
| **Verfügbarkeit** | 24/7 | 24/7 (wenn provisioniert) | 60h/Monat | 50h/Monat |
| **RAM** | 8 GB | 24 GB | 8-16 GB | 8-16 GB |
| **Setup-Aufwand** | Mittel (30 min) | Hoch (60 min) | Niedrig (5 min) | Niedrig (10 min) |
| **Cursor-Kompatibilität** | Sehr gut (SSH) | Sehr gut (SSH) | Gut (SSH) | Mittel |
| **Skalierbar** | Ja (Plan wechseln) | Nein (Fixed) | Ja (größere VM) | Ja |
| **Persistenz** | Voll | Voll | Voll (Daten) | Voll (Daten) |
| **GCT dauerhaft laufen** | Ja | Ja | Nein | Nein |
| **Rust Builds** | OK (4 vCPU) | Gut (4 ARM) | OK (2-4 Core) | OK (4 Core) |

---

## 5. Setup-Anleitung: Hetzner CX32 + Cursor SSH

Falls Hetzner gewählt wird, hier der vollständige Setup:

### 5.1 Server erstellen

1. Account auf [hetzner.com](https://www.hetzner.com/cloud) erstellen
2. Cloud Console → "Server erstellen"
3. Konfiguration:
   - **Standort:** Falkenstein (DE)
   - **Image:** Ubuntu 24.04
   - **Typ:** CX32 (4 vCPU, 8 GB RAM, 80 GB SSD)
   - **SSH Key:** Eigenen Public Key hochladen (siehe 5.2)
   - **Networking:** Public IPv4 (Standard)
4. Server starten → IP-Adresse notieren

### 5.2 SSH Key generieren (lokal auf deinem PC)

```powershell
# PowerShell auf deinem Windows PC
ssh-keygen -t ed25519 -C "tradeview-fusion-dev"
# Speichert in: C:\Users\<dein-user>\.ssh\id_ed25519
# Public Key: C:\Users\<dein-user>\.ssh\id_ed25519.pub

# Public Key anzeigen (für Hetzner Upload):
Get-Content ~\.ssh\id_ed25519.pub
```

### 5.3 Server einrichten (einmalig)

```bash
# Per SSH auf den Server verbinden
ssh root@<SERVER-IP>

# System updaten
apt update && apt upgrade -y

# Nicht-Root User erstellen (Best Practice)
adduser dev
usermod -aG sudo dev
mkdir -p /home/dev/.ssh
cp ~/.ssh/authorized_keys /home/dev/.ssh/
chown -R dev:dev /home/dev/.ssh

# Ab jetzt als dev-User arbeiten
su - dev
```

### 5.4 Development Tools installieren

```bash
# Node.js 22 (LTS)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Go 1.23+
wget https://go.dev/dl/go1.23.6.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.23.6.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin:$HOME/go/bin' >> ~/.bashrc
source ~/.bashrc

# Python 3.12+ mit venv
sudo apt install -y python3.12 python3.12-venv python3.12-dev python3-pip

# Rust + Cargo
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"

# Maturin (für PyO3 Rust-Python Bridge)
pip install maturin

# Build-Tools
sudo apt install -y build-essential pkg-config libssl-dev git

# pnpm (schneller als npm für Next.js)
npm install -g pnpm
```

### 5.5 Repo klonen und Environment aufsetzen

```bash
cd ~
git clone <DEIN-REPO-URL> tradeview-fusion
cd tradeview-fusion

# Frontend
pnpm install

# Python
cd python-backend
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
cd ..

# Go
cd go-backend
go mod download
cd ..

# .env Dateien anlegen (Secrets manuell eintragen)
cp .env.example .env          # Root
cp go-backend/.env.example go-backend/.env
```

### 5.6 Cursor verbinden

1. Cursor öffnen (lokal auf deinem PC)
2. `Ctrl+Shift+P` → "Remote-SSH: Connect to Host"
3. Eingabe: `dev@<SERVER-IP>`
4. Cursor installiert automatisch den Server-Agent
5. "Open Folder" → `/home/dev/tradeview-fusion`
6. Terminal in Cursor → läuft auf dem Server
7. `dev-stack.ps1` oder manuell Services starten

### 5.7 SSH Config (für schnelleres Verbinden)

Auf deinem lokalen PC in `C:\Users\<user>\.ssh\config`:

```
Host tradeview-dev
    HostName <SERVER-IP>
    User dev
    IdentityFile ~/.ssh/id_ed25519
    ServerAliveInterval 60
    ServerAliveCountMax 10
```

Danach in Cursor: `Remote-SSH: Connect to Host` → `tradeview-dev` auswählen.

### 5.8 Bekannte Cursor-SSH Tipps

| Tipp | Details |
|:---|:---|
| **Cursor Extension nutzen** | `anysphere.remote-ssh` statt `ms-vscode-remote.remote-ssh`. Cursor's eigene ist stabiler. |
| **SSH Multiplexing deaktivieren** | In `~/.ssh/config`: Kein `ControlPath`, `ControlMaster`, `ControlPersist`. Kann Cursor-Verbindung instabil machen. |
| **Timeout erhöhen** | `ConnectTimeout 30` in SSH Config. Default 3 min kann bei langsamer Verbindung knapp sein. |
| **AI Streaming** | War in älteren Versionen langsam über SSH (~1-2 kB/s). In Cursor 2.4+ behoben. Aktuelle Version nutzen. |

---

## 6. Setup-Anleitung: GitHub Codespaces (zum Testen)

Falls du erst testen willst ob Remote Dev funktioniert:

### 6.1 devcontainer.json erstellen

```json
{
  "name": "tradeview-fusion",
  "image": "mcr.microsoft.com/devcontainers/base:ubuntu-24.04",
  "features": {
    "ghcr.io/devcontainers/features/node:1": { "version": "22" },
    "ghcr.io/devcontainers/features/go:1": { "version": "1.23" },
    "ghcr.io/devcontainers/features/python:1": { "version": "3.12" },
    "ghcr.io/devcontainers/features/rust:1": { "version": "latest" }
  },
  "postCreateCommand": "pnpm install && cd python-backend && pip install -e '.[dev]' && cd ../go-backend && go mod download",
  "forwardPorts": [3000, 8090, 8091, 9060],
  "customizations": {
    "vscode": {
      "extensions": [
        "golang.go",
        "ms-python.python",
        "rust-lang.rust-analyzer",
        "prisma.prisma"
      ]
    }
  }
}
```

### 6.2 Starten

1. Repo auf GitHub pushen
2. GitHub → Repo → "Code" → "Codespaces" → "Create codespace"
3. Warten bis Environment ready ist (~5 min)
4. In Cursor: `Remote-SSH: Connect to Host` → Codespace-SSH verwenden (oder direkt im Browser arbeiten)

---

## 7. Kosten-Schätzung (12 Monate)

| Option | Monatlich | Jährlich | Einschätzung |
|:---|:---|:---|:---|
| Hetzner CX22 | 4.50 EUR | 54 EUR | Budget-Option, knapp aber möglich |
| **Hetzner CX32** | **8.50 EUR** | **102 EUR** | **Best Value für unseren Stack** |
| Hetzner CX42 | 17 EUR | 204 EUR | Komfort-Option, viel Headroom |
| Oracle Free | 0 EUR | 0 EUR | Wenn verfügbar, unschlagbar |
| Codespaces (Free) | 0 EUR | 0 EUR | 60h/Monat, zum Testen |
| Codespaces (Paid) | ~15-30 EUR | ~180-360 EUR | Teurer als Hetzner für gleiche Leistung |

---

## 8. Empfehlung

**Sofort (0 EUR):** GitHub Codespaces Free Tier ausprobieren. Repo pushen, Codespace starten, Cursor verbinden. Testen ob Remote Dev für deinen Workflow funktioniert.

**Danach (wenn es taugt):** Hetzner CX32 für 8.50 EUR/Monat aufsetzen. 24/7 verfügbar, kein Zeitlimit, GCT kann dauerhaft laufen, Rust-Builds in akzeptabler Zeit.

**Parallel versuchen:** Oracle Cloud Free Tier. Wenn du eine Instanz bekommst, hast du 24 GB RAM gratis.

---

## 9. Offene Fragen (vor Entscheidung klären)

- [ ] Git-Repo schon auf GitHub? (Codespaces braucht das)
- [ ] Internet-Verbindung stabil genug für SSH? (>10 Mbit, <50ms Latenz ideal)
- [ ] Budget: 8.50 EUR/Monat OK für Hetzner?
- [ ] GCT soll 24/7 laufen? (Dann kein Codespaces)
- [ ] ARM-Architektur akzeptabel? (Oracle Free Tier)
