import { describe, expect, it } from "bun:test";

import { resolvePrismaDatabaseUrl } from "@/lib/server/prisma";

describe("resolvePrismaDatabaseUrl", () => {
	it("uses frontend sqlite by default", () => {
		const resolved = resolvePrismaDatabaseUrl({
			DATABASE_URL: "file:./prisma/dev.db",
		});

		expect(resolved.mode).toBe("frontend-sqlite");
		expect(resolved.url).toBe("file:./prisma/dev.db");
	});

	it("supports backend sqlite transitional mode", () => {
		const resolved = resolvePrismaDatabaseUrl({
			APP_DB_MODE: "backend-sqlite",
			DATABASE_URL_BACKEND_SQLITE: "file:./go-backend/data/app.db",
		});

		expect(resolved.mode).toBe("backend-sqlite");
		expect(resolved.url).toBe("file:./go-backend/data/app.db");
	});

	it("supports backend postgres transitional mode", () => {
		const resolved = resolvePrismaDatabaseUrl({
			APP_DB_MODE: "backend-postgres",
			DATABASE_URL_POSTGRES: "postgresql://tradeview:tradeview-dev@127.0.0.1:5432/tradeviewfusion",
		});

		expect(resolved.mode).toBe("backend-postgres");
		expect(resolved.url).toBe(
			"postgresql://tradeview:tradeview-dev@127.0.0.1:5432/tradeviewfusion",
		);
	});
});
