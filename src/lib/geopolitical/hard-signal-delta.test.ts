// @ts-nocheck
import { describe, expect, it } from "bun:test";
import {
	computeHardSignalContentHash,
	evaluateHardSignalSourceDelta,
} from "@/lib/geopolitical/hard-signal-delta";

describe("hard signal delta detection", () => {
	it("marks first-seen snapshots as changed", () => {
		const reason = evaluateHardSignalSourceDelta(undefined, {
			provider: "ofac",
			url: "https://ofac.example",
			contentHash: computeHardSignalContentHash("a"),
		});
		expect(reason).toBe("first_seen");
	});

	it("prefers etag or last-modified deltas over content hash equality", () => {
		const previous = {
			provider: "ecb",
			url: "https://ecb.example",
			contentHash: computeHardSignalContentHash("same"),
			etag: "v1",
			lastModified: "Mon, 01 Jan 2026 00:00:00 GMT",
			updatedAt: new Date().toISOString(),
		};
		const reason = evaluateHardSignalSourceDelta(previous, {
			provider: "ecb",
			url: "https://ecb.example",
			contentHash: computeHardSignalContentHash("same"),
			etag: "v2",
			lastModified: "Mon, 01 Jan 2026 00:00:00 GMT",
		});
		expect(reason).toBe("etag_changed");
	});

	it("falls back to content hash delta when metadata is unchanged", () => {
		const previous = {
			provider: "federal_reserve",
			url: "https://fed.example",
			contentHash: computeHardSignalContentHash("old"),
			etag: "same",
			lastModified: "Mon, 01 Jan 2026 00:00:00 GMT",
			publishedAt: "2026-01-01T00:00:00.000Z",
			updatedAt: new Date().toISOString(),
		};
		const reason = evaluateHardSignalSourceDelta(previous, {
			provider: "federal_reserve",
			url: "https://fed.example",
			contentHash: computeHardSignalContentHash("new"),
			etag: "same",
			lastModified: "Mon, 01 Jan 2026 00:00:00 GMT",
			publishedAt: "2026-01-01T00:00:00.000Z",
		});
		expect(reason).toBe("content_hash_changed");
	});

	it("returns no_change when metadata and content match", () => {
		const hash = computeHardSignalContentHash("stable");
		const previous = {
			provider: "un_sanctions",
			url: "https://un.example",
			contentHash: hash,
			etag: "stable",
			lastModified: "Mon, 01 Jan 2026 00:00:00 GMT",
			publishedAt: "2026-01-01T00:00:00.000Z",
			updatedAt: new Date().toISOString(),
		};
		const reason = evaluateHardSignalSourceDelta(previous, {
			provider: "un_sanctions",
			url: "https://un.example",
			contentHash: hash,
			etag: "stable",
			lastModified: "Mon, 01 Jan 2026 00:00:00 GMT",
			publishedAt: "2026-01-01T00:00:00.000Z",
		});
		expect(reason).toBe("no_change");
	});
});
