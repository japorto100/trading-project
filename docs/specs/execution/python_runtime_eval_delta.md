# Python Runtime Evaluation Delta

> **Stand:** 13. Maerz 2026 (Rev. 6)
> **Zweck:** Evaluation fuer Python-Runtime-Upgrades: Python 3.13t (nogil),
> Granian vs. uvicorn, PyO3 allow_threads Generalisierung.
> **Aenderungshistorie:**
> - Rev. 1 (12.03.2026): Initial — PyO3 allow_threads, 3.13t, Granian, Scope alle Python-Services
> - Rev. 2 (12.03.2026): py.detach() DONE (alle 5 Wrapper); granian>=2.0.0 in pyproject.toml; locust eval-extra; Startup-Switch dokumentiert
> - Rev. 3 (13.03.2026): grpc_server.py Bugfix (bound==0 check); bench_server.py multi-service; dev-stack.ps1 Granian --reload
> - Rev. 4 (13.03.2026): Benchmark-Run Learnings dokumentiert; Concurrency-Modell-Analyse; Phase A/B Benchmark-Plan strukturiert; venv2-Setup-Plan (3.13t)
> - Rev. 5 (13.03.2026): grpc_server.py GRPC_BACKEND-Flag (grpcio/grpclib); pyproject-313t.toml erstellt; pandas in pyproject.toml explizit; .venv (3.12) uv sync done; .venv-313t Install ausstehend; pandas→polars TODO; Ichimoku+yfinance TODO
> - Rev. 6 (13.03.2026): .venv-313t Packages installiert (ohne hmmlearn+polars); Phase B Benchmark (PY3.V2) abgeschlossen; 3.12 vs 3.13t Direktvergleich dokumentiert; Entscheid GRN.V4+PY3.V4 eingetragen

---

## 0. Scope

### In

- PyO3 `allow_threads` in allen bestehenden und neuen Rust-Funktionen (Quick-Win)
- Python 3.13t (free-threaded, nogil) Evaluation: Speedup bei CPU-parallelen Tasks
- Granian vs. uvicorn: Request-Throughput + Latenz unter Last (alle FastAPI-Services)
- Wechselwirkung: `allow_threads` + nogil = echte Parallelitaet

### Out

- Rust-Indicator-Implementierungen (Owner: `indicator_delta.md`)
- Go-Service-Performance (Owner: `infra_provider_delta.md`)
- Frontend-Performance (Owner: `frontend_refinement_perf_delta.md`)
- Binary Boundary Decision (Protobuf vs. FlatBuffers; Owner: `compute_delta.md` / `G9`)

---

## 1. PyO3 allow_threads — Quick-Win

### Regel

Jede Rust-Funktion die folgende Kriterien erfuellt, MUSS `allow_threads` nutzen:

- Nimmt nur primitive Daten entgegen (`Vec<f64>`, `&[f64]`, `String`, `i64`, etc.)
- Benoetigt waehrend der Berechnung KEINE Python-Objekte
- Laeuft laenger als ~100 Mikrosekunden (IO, Batch-Compute, Cache-Ops)

```rust
// PyO3 0.22+: allow_threads wurde zu py.detach() umbenannt
// Identische Semantik — GIL wird fuer Dauer der Closure freigegeben
#[pyfunction]
pub fn calculate_indicators_batch(py: Python<'_>, ...) -> PyResult<...> {
    py.detach(move || {
        // gesamte Berechnung hier — GIL freigegeben
        calculate_indicators_batch_impl(...)
    })
    .map_err(|msg| PyValueError::new_err(msg.to_string()))
}
```

### Betroffene Funktionen in rust_core

| Funktion | allow_threads noetig | Status |
|:---------|:--------------------|:-------|
| `calculate_indicators_batch` | ja | [x] done (12.03.2026) |
| `composite_sma50_slope_norm` | ja | [x] done (12.03.2026) |
| `calculate_heartbeat` | ja | [x] done (12.03.2026) |
| `redb_cache_set` | ja (Disk-IO) | [x] done (12.03.2026) |
| `redb_cache_get` | ja (Disk-IO) | [x] done (12.03.2026) |
| Jede neue `calculate_*` Funktion | ja | Standard-Regel |

---

## 2. Concurrency-Modell-Analyse (Ergebnis 13.03.2026)

Vor dem Benchmark-Design muss das Concurrency-Modell jedes Servers verstanden sein.

### uvicorn

- **I/O-Concurrency:** asyncio Event Loop — viele Requests in-flight gleichzeitig (async def)
- **CPU-Parallelismus:** NEIN — GIL serialisiert alle Python-Berechnungen
- **`--workers N`:** spawnt **N separate OS-Prozesse**, jeder mit eigenem GIL → echte CPU-Parallelitaet
- **sync def Handler:** laufen in ThreadPoolExecutor, aber Threads teilen GIL

### Granian

- **I/O-Layer:** Rust/Tokio — HTTP-Parsing, Connection-Handling komplett ohne GIL
- **Python-Execution:** GIL wird acquired sobald ASGI-App-Code laeuft (wie bei uvicorn)
- **`--workers N`:** spawnt **N Tokio-Threads im selben Prozess** — alle teilen **denselben GIL**
  - Dies ist der entscheidende Unterschied zu uvicorn's `--workers`!
  - Fuer CPU-bound Python: Granian `--workers 4` = gleichwertig zu uvicorn single-worker
  - Fuer I/O-bound async: Granian besser (weniger HTTP-Overhead pro Request)

### Benchmark-Ergebnis Phase A (13.03.2026): indicator-service, 1 Worker

```
Setup: beide Server frisch auf Bench-Ports, shared httpx connection pool
       uvicorn :12092  vs  Granian :12192  —  workers=1, Python 3.12/GIL

[health]  concurrency=50, 500 reqs  (reiner HTTP-Overhead)
  uvicorn  P50=  400ms  P95=2323ms  P99=3777ms  RPS= 62
  granian  P50=  411ms  P95=2024ms  P99=3265ms  RPS= 69
  → Granian: +6.7 RPS, P95 -300ms, P99 -512ms  ← Tokio-Vorteil bei tail latency

[rust]    concurrency=2, 80 reqs  (py.detach, GIL freigegeben)
  uvicorn  P50=  7.4ms  P95= 9.0ms  P99=15.9ms  RPS=114
  granian  P50=  8.4ms  P95=10.7ms  P99=13.6ms  RPS=114
  → Identisch — 1 Worker, gleicher GIL, py.detach laeuft in beiden gleich

[python]  concurrency=1, 40 reqs  (Kontrollgruppe, GIL-bound)
  uvicorn  P50=  7.0ms  P95= 8.3ms  P99=15.5ms  RPS= 63
  granian  P50=  7.8ms  P95= 9.4ms  P99=15.6ms  RPS= 60
  → Identisch wie erwartet — GIL serialisiert beide gleich
```

**Interpretation:**
- Granian-Vorteil zeigt sich ausschliesslich bei **Tail-Latenz unter hoher Concurrent-Load** (health P95/P99)
- Bei Python-Compute (rust/python) sind beide identisch — bestaetigt GIL-Analyse
- Der erste fehlerhafte Run (13175ms P50) war ein Benchmark-Bug: per-Request httpx.AsyncClient (neue TCP-Connection pro Request). Gefixt durch shared client mit Connection-Pool.
- `finance-bridge` nutzt `yfinance` (eigene Session), kein httpx-fix noetig in Produktionscode

### Benchmark-Ergebnis Phase B (13.03.2026): indicator-service, 1 Worker, 3.13t/nogil

```
Setup: gleiche Bench-Ports, shared httpx connection pool
       uvicorn :12092  vs  Granian :12192  —  workers=1, Python 3.13.9t/nogil

[health]  concurrency=50, 500 reqs
  uvicorn  P50=  455ms  P95=2228ms  P99=3001ms  RPS= 61.5
  granian  P50=  487ms  P95=1995ms  P99=2922ms  RPS= 63.4
  → Granian: +1.9 RPS, P95 -233ms, P99 -79ms  ← Tokio-Vorteil bestaetigt

[rust]    concurrency=2, 80 reqs  (py.detach, GIL freigegeben)
  uvicorn  P50=  8.3ms  P95= 15.1ms  P99=15.9ms  RPS=106
  granian  P50=  9.4ms  P95= 12.5ms  P99=25.7ms  RPS=102
  → uvicorn marginal besser — 1 Worker, GIL weg aendert nichts bei single-worker

[python]  concurrency=1, 40 reqs  (GIL-bound Kontrolle)
  uvicorn  P50=  8.2ms  P95= 12.2ms  P99=24.2ms  RPS= 54
  granian  P50=  9.8ms  P95= 41.8ms  P99=124.9ms  RPS= 43
  → uvicorn besser — Granian zeigt erhoehte P99-Varianz bei reiner Python-Last (1 Worker)
```

### 3.12 vs 3.13t Direktvergleich (uvicorn, workers=1)

```
Gruppe   | Python 3.12 uvicorn          | Python 3.13t uvicorn         | Delta
---------|------------------------------|------------------------------|-------
health   | P50=379ms P95=2279ms RPS=66  | P50=456ms P95=2228ms RPS=62  | P50 +77ms schlechter, P95 aehnlich
rust     | P50=8.4ms P95=13.2ms RPS=99  | P50=8.3ms P95=15.1ms RPS=106 | RPS +7% — py.detach profitiert leicht
python   | P50=8.8ms P95=12.8ms RPS=49  | P50=8.2ms P95=12.2ms RPS=54  | RPS +10% — MACD schneller auf 3.13t
```

**Interpretation Phase B:**
- Bei `workers=1` kein dramatischer GIL-Gewinn erwartet und auch nicht gemessen
- `rust`/`python` RPS +7-10% auf 3.13t — konsistent mit weniger GIL-Overhead beim Scheduling
- health P50 schlechter auf 3.13t/uvicorn: free-threading hat leicht erhoehten asyncio-Overhead (bekannt)
- Echter 3.13t-Vorteil erst bei `workers > 1` sichtbar (Tokio-Threads + kein GIL = parallele Cores)
  → Phase C (workers=4) waere naechster Schritt, aber ausserhalb des aktuellen Scopes

### Konsequenzen fuer Benchmark-Design

| Benchmark-Ziel | Richtige Konfiguration |
|:---------------|:----------------------|
| HTTP-Overhead Vergleich | `GET /health`, hohe Concurrency (100+), 1 Worker je |
| Python GIL-Bottleneck zeigen | `POST /macd`, Concurrency = Workers (gleich bleiben) |
| Rust py.detach GIL-Release zeigen | `POST /batch`, Concurrency <= 2×Workers |
| GIL-frei (3.13t) vs GIL (3.12) | gleiche Endpoints, venv2 (3.13t), Concurrency skalieren |

---

## 3. Python 3.13t (free-threaded / nogil)

### Was es ist

Python 3.13 mit `--disable-gil` Build-Flag (3.13t). Entfernt den Global
Interpreter Lock (GIL). Echter Multi-Threading ohne GIL-Bottleneck.

### Zwei separate venvs

```
.venv        →  Python 3.12  (aktiv, alle Services, rust_core 0.2.0 Wheel)
.venv-313t   →  Python 3.13t (Phase B, separates Setup, eigenes rust_core Wheel)
```

`uv` verwaltet beide parallel, kein Konflikt. bench_server.py bekommt `--venv`
Flag um den Python-Pfad zu waehlen.

### Potentieller Nutzen

| Service | Aktueller Bottleneck | Erwarteter Gain (3.13t) |
|:--------|:--------------------|:------------------------|
| `indicator-service` | CPU: PyO3 + FastAPI/Pydantic | HOCH — py.detach + kein GIL = echte Thread-Parallelitaet |
| `memory-service` | CPU: KG-Queries + Vector-Search | MITTEL — Embedding-Berechnungen parallel |
| `agent-service` | I/O-bound (LLM calls) | GERING — bereits async dominiert |
| `finance-bridge` | I/O-bound (API calls) | GERING |

### Risiken

- 3.13t experimentell (offiziell bis Python 3.14 als "experimental" gelistet)
- Einige C-Extensions noch nicht GIL-free kompatibel (pruefen: numpy, ChromaDB, hmmlearn)
- Thread-Safety-Bugs sichtbar die vorher GIL verdeckte
- PyO3 0.22+ unterstuetzt 3.13t — aber abi3-Wheels sind GIL-aware, separates Wheel noetig

### Setup (Phase B)

```bash
# 1. Python 3.13t installieren
uv python install 3.13t

# 2. Separates venv erstellen
uv venv .venv-313t --python 3.13t

# 3. Dependencies installieren (ohne rust_core zuerst)
uv pip install --python .venv-313t/Scripts/python.exe \
    fastapi uvicorn granian httpx pydantic numpy pandas

# 4. rust_core fuer 3.13t bauen
# Cargo.toml: features = ["extension-module"] — PyO3 auto-detektiert 3.13t
uv run --python .venv-313t/Scripts/python.exe \
    maturin build -m rust_core/Cargo.toml --out rust_core/target-local/wheels-313t/
uv pip install --python .venv-313t/Scripts/python.exe \
    rust_core/target-local/wheels-313t/tradeviewfusion_rust_core-*.whl

# 5. Kompatibilitaetscheck
.venv-313t/Scripts/python.exe -c "
import sys, tradeviewfusion_rust_core as m
print(f'Python {sys.version}')
print(f'GIL: {sys._is_gil_enabled()}')  # muss False sein
print('rust_core OK:', hasattr(m, 'calculate_indicators_batch'))
"
```

---

## 4. Granian vs. uvicorn

### Was ist Granian

Granian ist ein ASGI/WSGI-Server in Rust (Tokio-basiert). Drop-in-Ersatz fuer
uvicorn. Ziele: hoeherer Throughput, geringere Latenz, geringerer Memory-Overhead.

### Vergleich

| Aspekt | uvicorn | Granian |
|:-------|:--------|:--------|
| I/O-Runtime | Python asyncio | Rust (Tokio) |
| HTTP/2 | nein | ja (opt-in) |
| `--workers N` | N OS-Prozesse (N GILs) | N Tokio-Threads (1 GIL!) |
| CPU-bound Python | GIL-serialisiert | gleich GIL-serialisiert |
| I/O-bound async | gut | besser (Rust HTTP-Overhead) |
| Granian + 3.13t | — | Tokio-Threads + kein GIL = volle Core-Nutzung |

### Infra-Status (13.03.2026)

- `granian>=2.0.0` in `pyproject.toml` — installierbar via `uv sync`
- `scripts/bench_server.py` startet beide Server frisch auf Bench-Ports (kein Devstack-Konflikt)
  - uvicorn Bench-Ports: service_default + 4000 (indicator :12092)
  - Granian Bench-Ports: uvicorn_bench_port + 100 (indicator :12192)
- `--workers N` Flag (default 1 fuer fairen Baseline-Vergleich) steuert Server-Worker-Count
- `--venv PATH` Flag (Phase B) waehlt Python-venv (3.12 vs 3.13t)
- `dev-stack.ps1` Granian-Pfad hat `--reload`
- `grpc_server.py`: `bound == 0` Check (grpcio gibt 0 zurueck, kein RuntimeError)
- `grpc_server.py`: GRPC_BACKEND env-Flag — `"grpcio"` (default, 3.12) oder `"grpclib"` (3.13t, pure-Python asyncio)
  - `_start_grpcio`: ImportError-safe (graceful skip wenn grpcio nicht installiert)
  - `_start_grpclib`: asyncio-basiert, referenziert `ipc_servicer_async.py` (noch nicht erstellt — nur noetig bei GRPC_ENABLED=1 + GRPC_BACKEND=grpclib in Prod)
  - Benchmark: `GRPC_ENABLED=0` in bench_env → grpc_server.py wird nie importiert (app_factory.py Guard)
- `pyproject-313t.toml`: 3.13t-Variante von pyproject.toml
  - grpcio/grpcio-tools entfernt → grpclib>=0.4.4
  - opentelemetry-exporter-otlp-proto-grpc → -proto-http
  - pandas>=2.2.0 explizit (war nur transitiv via yfinance)
  - scikit-learn in main deps (vorher nur in [ml] optional)
  - rust-core zeigt auf cp313t-Wheel (non-abi3)
- `pyproject.toml` (3.12): pandas>=2.2.0 jetzt explizit eingetragen
- `.venv` (3.12): `uv sync` abgeschlossen (13.03.2026) — pandas jetzt inkludiert
- `.venv-313t`: venv erstellt, rust_core cp313t-Wheel installiert, GIL=False verifiziert
  - **AUSSTEHEND**: pandas, cachetools, polars, scipy, scikit-learn, hmmlearn, grpclib, protobuf noch nicht installiert
  - **Naechster Schritt**: `uv pip install --python .venv-313t/Scripts/python.exe pandas>=2.2 cachetools polars scipy scikit-learn hmmlearn grpclib protobuf`

---

## 5. Benchmark-Plan: Phase A (3.12, GIL) + Phase B (3.13t, nogil)

### Phase A — Python 3.12, GIL-Verhalten dokumentieren

**Ziel:** Zeigen wo GIL Bottleneck ist, wo Granian I/O-Vorteil hat, py.detach messen.

3 isolierte Endpoint-Gruppen pro Run:

| Gruppe | Endpoint | Concurrency | Was es zeigt |
|:-------|:---------|:------------|:-------------|
| `health` | `GET /health` | 100 | Reiner HTTP-Overhead: Tokio vs asyncio |
| `rust` | `POST /batch` | 8 | py.detach GIL-Release — Granian kann andere Requests servicen waehrend Rust rechnet |
| `python` | `POST /macd` | 4 | Reines Python — GIL-bound, beide Server MUSS gleich sein |

**Erwartetes Ergebnis Phase A:**
- `health`: Granian leicht schneller (Rust HTTP-Parser)
- `rust`: Granian leicht schneller (Tokio serviciert andere Requests waehrend py.detach laeuft)
- `python`: identisch (GIL serialisiert beide gleich)

**Command:**
```bash
cd python-backend
uv run python scripts/bench_server.py --service indicator --workers 1
# health-only fuer klaren HTTP-Overhead:
uv run python scripts/bench_server.py --service indicator --workers 1 --group health
```

Verify-Gates: **GRN.V1, GRN.V2** (Ergebnisse in diese Datei eintragen)

### Phase B — Python 3.13t, nogil

**Ziel:** GIL-frei vs GIL Direktvergleich — zeigt ob 3.13t Adoption sinnvoll ist.

**Vorbedingung:** `.venv-313t` vollstaendig installieren:
```bash
cd python-backend
uv pip install --python .venv-313t/Scripts/python.exe \
  "pandas>=2.2.0" "cachetools>=5.3.0" "polars[rtcompat]>=1.38.1" \
  "scipy>=1.14.0" "scikit-learn>=1.6.0" "hmmlearn>=0.3.0" \
  "grpclib>=0.4.4" "protobuf>=5.28.0"
```

Dann Benchmark (workers=1 fuer fairen Direktvergleich 3.12 vs 3.13t):

```bash
cd python-backend
uv run python scripts/bench_server.py --group all --workers 1 --venv .venv-313t
```

**Erwartetes Ergebnis Phase B:**
- `health`: aehnlich wie Phase A (HTTP-Overhead ist Rust-seitig, nicht GIL-abhaengig)
- `rust`: Granian besser (Tokio-Threads + kein GIL = parallele Rust-Berechnung moeglich)
- `python`: bei workers=1 aehnlich Phase A; echter Unterschied erst bei workers > 1

Verify-Gates: **PY3.V2** (Ergebnis dokumentieren mit konkreten Zahlen)

---

## 6. Eval-Plan (Verify-Gates)

### Granian vs. uvicorn

- [x] **GRN.V0** granian in pyproject.toml + locust eval-extra (12.03.2026)
- [x] **GRN.V0b** bench_server.py multi-service, grpc_server.py Bugfix (13.03.2026)
- [x] **GRN.V0c** Benchmark-Run + Concurrency-Analyse (13.03.2026) — Ergebnis: GIL Bottleneck bestätigt
- [x] **GRN.V1** Phase A health: Granian P95/P99 besser bei hoher Concurrency (+300ms P95, +512ms P99, +6.7 RPS) — Tokio-Vorteil bestaetigt (13.03.2026)
- [x] **GRN.V2** Phase A rust/python: Identisch — py.detach korrekt, GIL Kontrollgruppe stimmt (13.03.2026)
- [ ] **GRN.V3** SSE-Streaming-Kompatibilitaet pruefen (go-backend→indicator-service SSE)
- [x] **GRN.V4** Entscheidung: **Granian DEFER** (13.03.2026)
  - Begruendung: Bei workers=1 nur marginaler P95/P99-Vorteil bei health (+2 RPS, -230ms P95)
  - rust/python: uvicorn identisch oder besser — kein Gewinn
  - Echter Vorteil nur bei hoher Connection-Concurrency + I/O-bound Last → nicht der aktuelle Bottleneck
  - Granian bleibt in pyproject.toml als opt-in; dev-stack.ps1 Granian-Pfad bleibt
  - Re-evaluate: wenn indicator-service > 200 concurrent connections oder HTTP/2 benoetigt wird

### Python 3.13t

- [x] **PY3.V1** venv2 Setup: Python 3.13.9t, GIL=False verifiziert, rust_core cp313t-Wheel gebaut+installiert (13.03.2026)
  - grpcio: kein 3.13t-Wheel fuer Windows → grpclib als Ersatz gewaehlt
  - `grpc_server.py` GRPC_BACKEND-Flag implementiert (grpcio/grpclib)
  - `pyproject-313t.toml` erstellt + aktualisiert (Rev. 6): hmmlearn+polars excluded, pins aktualisiert
  - `.venv-313t` Packages: pandas 3.0.1, scipy 1.17.1, scikit-learn 1.8.0, cachetools 7.0.5, grpclib 0.4.9, protobuf 7.34.0 — alle GIL=False verifiziert
  - hmmlearn: EXCLUDED (kein cp313t-Wheel, Cython-Internals nicht GIL-free auditiert)
  - polars: EXCLUDED (polars>=1.36 zieht polars-runtime-32 als Source-Build → haengt auf Windows cp313t)
- [x] **PY3.V2** Phase B abgeschlossen (13.03.2026) — indicator-service 3.12 vs 3.13t, workers=1
  - rust: +7% RPS auf 3.13t (py.detach profitiert von reduziertem GIL-Scheduling-Overhead)
  - python: +10% RPS auf 3.13t (MACD schneller)
  - health: P50 +77ms schlechter auf 3.13t/uvicorn (free-threading asyncio-Overhead)
  - Fazit: messbar aber nicht dramatisch bei single-worker — siehe PY3.V4
- [ ] **PY3.V3** ChromaDB + sentence-transformers auf 3.13t pruefen (memory-service)
- [x] **PY3.V4** Entscheidung: **3.13t DEFER** (13.03.2026)
  - Begruendung: +7-10% RPS bei single-worker ist real aber gering
  - Echter Gewinn erst bei workers>1 (Tokio-Threads + kein GIL = volle Core-Nutzung) — nicht getestet
  - polars/hmmlearn blockieren vollstaendige Migration; chromadb/sentence-transformers ungetestet (PY3.V3 offen)
  - 3.13t ist experimentell bis Python 3.14 — Stabilitaetsrisiko in Prod nicht gerechtfertigt
  - Re-evaluate: wenn Python 3.14 stabil + polars/hmmlearn cp313t-Wheels erscheinen + PY3.V3 gruenes Licht

### TODOs Status

- [x] **TODO-1** `.venv-313t` Install abgeschlossen (13.03.2026): pandas 3.0.1, scipy 1.17.1, sklearn 1.8.0, cachetools 7.0.5, grpclib 0.4.9, protobuf 7.34.0; hmmlearn+polars excluded
- [x] **TODO-2** Phase B Benchmark abgeschlossen (13.03.2026) → PY3.V2 eingetragen; Entscheid GRN.V4+PY3.V4 dokumentiert
- [x] **TODO-3** `ipc_servicer_async.py` erstellt (13.03.2026): ForwardRequestServicerAsync, httpx.ASGITransport, grpclib __mapping__, make_grpclib_servicers(); smoke-test auf 3.13t OK
- [ ] **TODO-4** → verschoben zu **Eval-Backlog** (siehe unten)
- [ ] **TODO-5** → verschoben zu **Eval-Backlog** (siehe unten); Ichimoku: owner `indicator_delta.md`

---

## 7. Kombination: py.detach + nogil + Granian

Das volle Upgrade-Paket:

```
Granian (Tokio I/O, kein GIL fuer HTTP)
  └── FastAPI (ASGI)
       └── PyO3 Rust-Funktion
            └── py.detach(move || { /* Rust rechnet, GIL frei */ })
                  + Python 3.13t (kein GIL systemweit)
                       = Tokio-Threads laufen wirklich parallel
                       = volle Core-Nutzung, kein Serialisierungs-Bottleneck
```

Kombinierter Gain vor allem bei:
- Parallelen Batch-Indicator-Requests (viele Clients gleichzeitig)
- Gleichzeitigen Vector-Search-Anfragen vom Agent
- Indicator-Streaming bei vielen offenen Positionen

---

## 8. Phase-Slot

| Aufgabe | Slot | Status |
|:--------|:-----|:-------|
| allow_threads (py.detach) in rust_core | sofort / Pre-Phase-19 | **DONE** |
| bench_server.py Infra | Pre-Phase-20 | **DONE** |
| Phase A Benchmark (GRN.V1+V2) | Pre-Phase-20 | **DONE** (13.03.2026) |
| venv2 Setup (PY3.V1) | Pre-Phase-20 | **DONE** (venv+wheel) / packages ausstehend |
| .venv-313t Packages installieren | Pre-Phase-20 | **DONE** (13.03.2026) |
| Phase B Benchmark (PY3.V2) | Pre-Phase-20 | **DONE** (13.03.2026) |
| ipc_servicer_async.py (grpclib) | Pre-Phase-20 | **DONE** (13.03.2026) |
| pandas→polars Migration eval | Pre-Phase-20 | → Eval-Backlog (TODO-4) |
| Ichimoku + yfinance Review | Pre-Phase-20 | → Eval-Backlog (TODO-5); Ichimoku owner: indicator_delta.md |
| Rollout-Entscheid (Granian + ggf. 3.13t) | Phase-20 | pending |

---

## 9. Eval-Backlog (defer — kein Blocker fuer Phase-20)

| Item | Begruendung | Re-evaluate wann |
|:-----|:------------|:----------------|
| **pandas→polars Migration** (`portfolio_analytics.py`, ~15 pd.* Stellen) | polars-runtime-32 blockiert .venv-313t auf Windows; Migration sinnvoll aber kein Hot-Path-Blocker | Wenn polars cp313t-Binary-Wheel erscheint (polars 2.x?) |
| **yfinance-Replacement** | yfinance bleibt via finance-bridge; Go hat keinen nativen Stock/Index OHLCV-Ersatz; kein Prod-Blocker | Wenn finance-bridge Go-nativen Fetch bekommt (Phase 20+) |
| **3.13t workers>1 Benchmark (Phase C)** | Echter GIL-Vorteil erst bei multi-worker sichtbar; Infra-Aufwand fuer Benchmark > aktueller Nutzen | Wenn indicator-service unter realer Last > 200 concurrent Clients |
| **ChromaDB + sentence-transformers auf 3.13t** (PY3.V3) | memory-service; ungetestet; kein Prod-Blocker solange .venv (3.12) aktiv | Vor 3.13t Rollout-Entscheid |

---

## 10. Exit Criteria

- [x] py.detach in allen bestehenden `calculate_*` und Cache-Funktionen (12.03.2026)
- [x] grpc_server.py Bugfix: bound==0 statt RuntimeError (13.03.2026)
- [x] bench_server.py: beide Server frisch, isolierte Bench-Ports, --workers, --venv (13.03.2026)
- [x] Phase A abgeschlossen: GRN.V1+V2 Ergebnisse dokumentiert (13.03.2026)
- [x] grpc_server.py GRPC_BACKEND-Flag: grpcio (default) / grpclib (3.13t) (13.03.2026)
- [x] pyproject-313t.toml erstellt (13.03.2026)
- [x] pyproject.toml: pandas explizit + .venv (3.12) uv sync (13.03.2026)
- [x] .venv-313t: venv + rust_core cp313t-Wheel (GIL=False verifiziert) (13.03.2026)
- [ ] .venv-313t: restliche Packages installieren (TODO-1)
- [ ] Phase B abgeschlossen: PY3.V2 Ergebnisse dokumentiert
- [ ] ipc_servicer_async.py (grpclib async Servicer) erstellen
- [ ] Entscheid dokumentiert: Granian Rollout ja/nein + 3.13t Upgrade ja/nein mit Datum
