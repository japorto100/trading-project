import { promises as fs } from "node:fs";
import path from "node:path";
import type { GeoAlertPolicyConfig } from "@/lib/geopolitical/phase12-types";

const DATA_DIR = path.join(process.cwd(), "data", "geopolitical");
const STORE_PATH = path.join(DATA_DIR, "phase12-alert-policy.json");

const DEFAULT_ALERT_POLICY: GeoAlertPolicyConfig = {
	minSeverity: "high",
	minConfidence: 0.72,
	cooldownMinutes: 60,
	muteProfileEnabled: false,
	usePlaybackWindowPreview: true,
	updatedAt: new Date(0).toISOString(),
	updatedBy: "system",
};

let writeChain: Promise<void> = Promise.resolve();

function isNodeErrorWithCode(error: unknown, code: string): boolean {
	return (
		typeof error === "object" &&
		error !== null &&
		"code" in error &&
		(error as { code?: unknown }).code === code
	);
}

function withWriteLock<T>(task: () => Promise<T>): Promise<T> {
	const chained = writeChain.then(task, task);
	writeChain = chained.then(
		() => undefined,
		() => undefined,
	);
	return chained;
}

async function ensureStoreDir(): Promise<void> {
	await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function getGeoAlertPolicyConfig(): Promise<GeoAlertPolicyConfig> {
	try {
		const raw = await fs.readFile(STORE_PATH, "utf-8");
		const parsed = JSON.parse(raw) as Partial<GeoAlertPolicyConfig>;
		return {
			...DEFAULT_ALERT_POLICY,
			...parsed,
			minConfidence: Number.isFinite(parsed.minConfidence)
				? Math.max(0, Math.min(1, Number(parsed.minConfidence)))
				: DEFAULT_ALERT_POLICY.minConfidence,
			cooldownMinutes: Number.isFinite(parsed.cooldownMinutes)
				? Math.max(5, Math.min(360, Number(parsed.cooldownMinutes)))
				: DEFAULT_ALERT_POLICY.cooldownMinutes,
			minSeverity: ["low", "medium", "high", "critical"].includes(String(parsed.minSeverity))
				? (parsed.minSeverity as GeoAlertPolicyConfig["minSeverity"])
				: DEFAULT_ALERT_POLICY.minSeverity,
			updatedAt:
				typeof parsed.updatedAt === "string" ? parsed.updatedAt : DEFAULT_ALERT_POLICY.updatedAt,
			updatedBy:
				typeof parsed.updatedBy === "string" ? parsed.updatedBy : DEFAULT_ALERT_POLICY.updatedBy,
		};
	} catch (error) {
		if (isNodeErrorWithCode(error, "ENOENT")) return DEFAULT_ALERT_POLICY;
		throw error;
	}
}

export async function updateGeoAlertPolicyConfig(input: {
	minSeverity?: GeoAlertPolicyConfig["minSeverity"];
	minConfidence?: number;
	cooldownMinutes?: number;
	muteProfileEnabled?: boolean;
	usePlaybackWindowPreview?: boolean;
	actor: string;
}): Promise<GeoAlertPolicyConfig> {
	return withWriteLock(async () => {
		const current = await getGeoAlertPolicyConfig();
		const next: GeoAlertPolicyConfig = {
			...current,
			minSeverity: input.minSeverity ?? current.minSeverity,
			minConfidence:
				input.minConfidence !== undefined
					? Math.max(0, Math.min(1, input.minConfidence))
					: current.minConfidence,
			cooldownMinutes:
				input.cooldownMinutes !== undefined
					? Math.max(5, Math.min(360, Math.round(input.cooldownMinutes)))
					: current.cooldownMinutes,
			muteProfileEnabled: input.muteProfileEnabled ?? current.muteProfileEnabled,
			usePlaybackWindowPreview: input.usePlaybackWindowPreview ?? current.usePlaybackWindowPreview,
			updatedAt: new Date().toISOString(),
			updatedBy: input.actor.trim().slice(0, 64) || "unknown",
		};
		await ensureStoreDir();
		await fs.writeFile(STORE_PATH, JSON.stringify(next, null, 2), "utf-8");
		return next;
	});
}
