// @ts-nocheck
import { describe, expect, it } from "bun:test";
import { shouldPromoteCandidate, shouldTriggerEventAlert } from "@/lib/geopolitical/anti-noise";
import { confidenceToLadder, scoreCandidateConfidence } from "@/lib/geopolitical/confidence";
import { findDuplicateCandidate } from "@/lib/geopolitical/dedup";
import type { GeoCandidate, GeoEvent } from "@/lib/geopolitical/types";

describe("geopolitical quality engines", () => {
	it("scores high confidence for corroborated hard-signal candidates", () => {
		const candidate: Pick<GeoCandidate, "sourceRefs" | "triggerType"> = {
			triggerType: "hard_signal",
			sourceRefs: [
				{
					id: "s1",
					provider: "OFAC",
					url: "https://ofac.treasury.gov/sanctions-list-service",
					fetchedAt: new Date().toISOString(),
					publishedAt: new Date().toISOString(),
					sourceTier: "A",
					reliability: 0.97,
				},
				{
					id: "s2",
					provider: "UN",
					url: "https://main.un.org/securitycouncil/en/content/un-sc-consolidated-list",
					fetchedAt: new Date().toISOString(),
					publishedAt: new Date().toISOString(),
					sourceTier: "A",
					reliability: 0.95,
				},
			],
		};

		const score = scoreCandidateConfidence(candidate);
		expect(score).toBeGreaterThan(0.7);
		expect(confidenceToLadder(score)).toBeGreaterThanOrEqual(3);
	});

	it("detects candidate duplicates by normalized title/source fingerprints", () => {
		const existing: GeoCandidate[] = [
			{
				id: "c1",
				generatedAt: new Date().toISOString(),
				triggerType: "news_cluster",
				confidence: 0.64,
				severityHint: 3,
				headline: "EU announces new sanctions package",
				sourceRefs: [
					{
						id: "src1",
						provider: "Reuters",
						url: "https://example.com/eu-sanctions?ref=abc",
						fetchedAt: new Date().toISOString(),
						sourceTier: "B",
						reliability: 0.75,
					},
				],
				state: "open",
			},
		];

		const duplicate = findDuplicateCandidate(
			{
				headline: "EU announces new sanctions package!",
				generatedAt: new Date().toISOString(),
				sourceRefs: [
					{
						id: "src2",
						provider: "Reuters",
						url: "https://example.com/eu-sanctions",
						fetchedAt: new Date().toISOString(),
						sourceTier: "B",
						reliability: 0.75,
					},
				],
			},
			existing,
		);

		expect(duplicate?.id).toBe("c1");
	});

	it("detects near-duplicate candidates by title similarity fallback", () => {
		const existing: GeoCandidate[] = [
			{
				id: "c_similar",
				generatedAt: new Date().toISOString(),
				triggerType: "news_cluster",
				confidence: 0.61,
				severityHint: 3,
				headline: "ECB signals emergency rate review after inflation surprise in euro area",
				sourceRefs: [],
				state: "open",
			},
		];

		const duplicate = findDuplicateCandidate(
			{
				headline: "ECB signals emergency rate review after euro area inflation surprise",
				generatedAt: new Date().toISOString(),
				sourceRefs: [],
			},
			existing,
		);

		expect(duplicate?.id).toBe("c_similar");
	});

	it("suppresses repeated alerts within cooldown for same region/category", () => {
		const now = new Date();
		const current: Pick<
			GeoEvent,
			"severity" | "confidence" | "regionIds" | "category" | "updatedAt"
		> = {
			severity: 4,
			confidence: 3,
			regionIds: ["europe"],
			category: "sanctions_export_controls",
			updatedAt: now.toISOString(),
		};

		const recent: Array<
			Pick<GeoEvent, "severity" | "confidence" | "regionIds" | "category" | "updatedAt">
		> = [
			{
				severity: 5,
				confidence: 4,
				regionIds: ["europe"],
				category: "sanctions_export_controls",
				updatedAt: new Date(now.getTime() - 10 * 60_000).toISOString(),
			},
		];

		expect(
			shouldPromoteCandidate({
				id: "x",
				generatedAt: now.toISOString(),
				triggerType: "hard_signal",
				confidence: 0.8,
				severityHint: 4,
				headline: "test",
				sourceRefs: [],
				state: "open",
			}),
		).toBe(true);

		expect(shouldTriggerEventAlert(current, recent, 45)).toBe(false);
	});
});
