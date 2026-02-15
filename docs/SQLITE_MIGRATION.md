# SQLite Migration

## Was wurde geaendert?

Das Projekt wurde von **PostgreSQL** auf **SQLite** umgestellt, um ohne externen Datenbankserver entwickeln und builden zu koennen.

## Aenderungen in `prisma/schema.prisma`

### 1. Provider gewechselt

```diff
- provider = "postgresql"
+ provider = "sqlite"
```

### 2. Enums auskommentiert

SQLite unterstuetzt keine nativen `enum`-Typen. Alle Enum-Definitionen wurden **auskommentiert** (nicht geloescht), damit sie als Referenz erhalten bleiben:

| Enum                      | Erlaubte Werte                                                        |
|---------------------------|-----------------------------------------------------------------------|
| `AlertCondition`          | above, below, crosses_up, crosses_down, rsi_overbought, rsi_oversold |
| `LayoutMode`              | single, two_horizontal, two_vertical, four                            |
| `OrderSide`               | buy, sell                                                             |
| `OrderType`               | market, limit, stop, stop_limit                                       |
| `OrderStatus`             | open, filled, cancelled                                               |
| `GeoEventStatus`          | candidate, confirmed, persistent, archived                            |
| `GeoCandidateState`       | open, accepted, rejected, snoozed, expired                            |
| `GeoCandidateTriggerType` | hard_signal, news_cluster, manual_import                              |
| `GeoDrawingType`          | line, polygon, text                                                   |

### 3. Model-Felder auf String umgestellt

In den Models wurde jeweils die originale Enum-Zeile auskommentiert und durch eine `String`-Zeile ersetzt:

```prisma
// condition   AlertCondition
condition   String
```

Defaults mit Enum-Werten wurden in String-Defaults geaendert:

```prisma
// status      OrderStatus @default(open)
status      String      @default("open")
```

## Aenderungen in `.env`

```
DATABASE_URL="file:./dev.db"
```

Die SQLite-Datenbankdatei `dev.db` wird im Projektroot unter `prisma/dev.db` erstellt.

## Zurueck zu PostgreSQL

Um wieder auf PostgreSQL zu wechseln:

1. In `schema.prisma`: `provider = "sqlite"` zurueck auf `provider = "postgresql"` setzen
2. Alle auskommentierten Enum-Bloecke wieder einkommentieren
3. In den Models die `String`-Zeilen entfernen und die auskommentierten Enum-Zeilen wieder aktivieren
4. `DATABASE_URL` in `.env` auf eine PostgreSQL-Connection-URL setzen
5. `bun run db:push` und `bun run db:generate` ausfuehren

## Wichtig

- Die Enum-Werte werden bei SQLite **nicht** auf Datenbankebene validiert. Die Validierung muss im Anwendungscode (z.B. Zod-Schemas) erfolgen.
- `Json`-Felder werden von SQLite als Text gespeichert. Prisma kuemmert sich um die Serialisierung.
