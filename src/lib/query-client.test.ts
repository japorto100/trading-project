import { describe, expect, it } from "bun:test";
import { queryClient } from "./query-client";

describe("queryClient defaults", () => {
	it("keeps trading-safe query defaults stable", () => {
		const defaults = queryClient.getDefaultOptions().queries;
		expect(defaults?.staleTime).toBe(30_000);
		expect(defaults?.gcTime).toBe(5 * 60_000);
		expect(defaults?.retry).toBe(2);
		expect(defaults?.refetchOnWindowFocus).toBe(false);
	});
});
