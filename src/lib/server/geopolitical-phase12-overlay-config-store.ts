import { promises as fs } from "node:fs";
import path from "node:path";
import type { GeoCentralBankOverlayConfig } from "@/lib/geopolitical/phase12-types";

const DATA_DIR = path.join(process.cwd(), "data", "geopolitical");
const STORE_PATH = path.join(DATA_DIR, "phase12-central-bank-overlays.json");

const DEFAULT_OVERLAY_CONFIG: GeoCentralBankOverlayConfig = {
	rateDecisionsEnabled: true,
	cbdcStatusEnabled: false,
	dedollarizationEnabled: false,
	financialOpennessEnabled: false,
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

export async function getGeoCentralBankOverlayConfig(): Promise<GeoCentralBankOverlayConfig> {
	try {
		const raw = await fs.readFile(STORE_PATH, "utf-8");
		const parsed = JSON.parse(raw) as Partial<GeoCentralBankOverlayConfig>;
		return {
			...DEFAULT_OVERLAY_CONFIG,
			...parsed,
			rateDecisionsEnabled:
				typeof parsed.rateDecisionsEnabled === "boolean"
					? parsed.rateDecisionsEnabled
					: DEFAULT_OVERLAY_CONFIG.rateDecisionsEnabled,
			cbdcStatusEnabled:
				typeof parsed.cbdcStatusEnabled === "boolean"
					? parsed.cbdcStatusEnabled
					: DEFAULT_OVERLAY_CONFIG.cbdcStatusEnabled,
			dedollarizationEnabled:
				typeof parsed.dedollarizationEnabled === "boolean"
					? parsed.dedollarizationEnabled
					: DEFAULT_OVERLAY_CONFIG.dedollarizationEnabled,
			financialOpennessEnabled:
				typeof parsed.financialOpennessEnabled === "boolean"
					? parsed.financialOpennessEnabled
					: DEFAULT_OVERLAY_CONFIG.financialOpennessEnabled,
			updatedAt:
				typeof parsed.updatedAt === "string" ? parsed.updatedAt : DEFAULT_OVERLAY_CONFIG.updatedAt,
			updatedBy:
				typeof parsed.updatedBy === "string" ? parsed.updatedBy : DEFAULT_OVERLAY_CONFIG.updatedBy,
		};
	} catch (error) {
		if (isNodeErrorWithCode(error, "ENOENT")) return DEFAULT_OVERLAY_CONFIG;
		throw error;
	}
}

export async function updateGeoCentralBankOverlayConfig(input: {
	rateDecisionsEnabled?: boolean;
	cbdcStatusEnabled?: boolean;
	dedollarizationEnabled?: boolean;
	financialOpennessEnabled?: boolean;
	actor: string;
}): Promise<GeoCentralBankOverlayConfig> {
	return withWriteLock(async () => {
		const current = await getGeoCentralBankOverlayConfig();
		const next: GeoCentralBankOverlayConfig = {
			...current,
			rateDecisionsEnabled: input.rateDecisionsEnabled ?? current.rateDecisionsEnabled,
			cbdcStatusEnabled: input.cbdcStatusEnabled ?? current.cbdcStatusEnabled,
			dedollarizationEnabled: input.dedollarizationEnabled ?? current.dedollarizationEnabled,
			financialOpennessEnabled: input.financialOpennessEnabled ?? current.financialOpennessEnabled,
			updatedAt: new Date().toISOString(),
			updatedBy: input.actor.trim().slice(0, 64) || "unknown",
		};
		await ensureStoreDir();
		await fs.writeFile(STORE_PATH, JSON.stringify(next, null, 2), "utf-8");
		return next;
	});
}
