import { mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { Database } from "bun:sqlite";

function stripSqlitePrefix(value: string): string {
	return value.replace(/^file:/, "");
}

function resolveDbPath(value: string, fallback: string): string {
	const raw = (value || fallback).trim();
	return resolve(stripSqlitePrefix(raw));
}

const sourcePath = resolveDbPath(
	process.env.DATABASE_URL || "",
	"./prisma/dev.db",
);
const targetPath = resolveDbPath(
	process.env.DATABASE_URL_BACKEND_SQLITE || "",
	"./go-backend/data/backend.db",
);

mkdirSync(dirname(targetPath), { recursive: true });

if (!existsSync(sourcePath)) {
	console.error(`[sqlite-merge] source database not found: ${sourcePath}`);
	process.exit(1);
}

const db = new Database(targetPath);

try {
	db.exec("PRAGMA journal_mode = WAL;");
	db.exec("PRAGMA foreign_keys = OFF;");
	db.exec(`ATTACH DATABASE '${sourcePath.replace(/'/g, "''")}' AS frontend;`);

	const tables = db
		.query(
			`
			SELECT name, sql
			FROM frontend.sqlite_master
			WHERE type = 'table'
			  AND name NOT LIKE 'sqlite_%'
			  AND sql IS NOT NULL
			ORDER BY name
		`,
		)
		.all() as Array<{ name: string; sql: string }>;

	let copiedRows = 0;
	for (const table of tables) {
		const createSql = table.sql.replace(/^CREATE TABLE/i, "CREATE TABLE IF NOT EXISTS");
		db.exec(createSql);

		const columns = db
			.query(`PRAGMA frontend.table_info("${table.name}")`)
			.all() as Array<{ name: string }>;
		const columnList = columns.map((col) => `"${col.name}"`).join(", ");
		if (!columnList) continue;

		db.exec(
			`INSERT OR IGNORE INTO "${table.name}" (${columnList}) SELECT ${columnList} FROM frontend."${table.name}";`,
		);

		const count = db
			.query(`SELECT COUNT(*) as count FROM "${table.name}"`)
			.get() as { count: number };
		copiedRows += count.count;
	}

	const indexes = db
		.query(
			`
			SELECT sql
			FROM frontend.sqlite_master
			WHERE type = 'index'
			  AND name NOT LIKE 'sqlite_%'
			  AND sql IS NOT NULL
		`,
		)
		.all() as Array<{ sql: string }>;

	for (const index of indexes) {
		db.exec(index.sql.replace(/^CREATE( UNIQUE)? INDEX/i, "CREATE$1 INDEX IF NOT EXISTS"));
	}

	db.exec("DETACH DATABASE frontend;");
	console.log(
		JSON.stringify(
			{
				sourcePath,
				targetPath,
				tablesCopied: tables.map((table) => table.name),
				totalRowsAfterMerge: copiedRows,
			},
			null,
			2,
		),
	);
} finally {
	db.close();
}
