import { rm } from "node:fs/promises";
import path from "node:path";

const NEXT_DIR = path.join(process.cwd(), ".next");
const NEXT_CACHE_DIR = path.join(NEXT_DIR, "cache");
const NEXT_TRACE_FILE = path.join(NEXT_DIR, "trace");
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 350;

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function cleanWithRetry(target) {
	for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
		try {
			await rm(target, { recursive: true, force: true });
			return;
		} catch (error) {
			const code =
				typeof error === "object" && error !== null && "code" in error
					? error.code
					: undefined;
			if ((code === "EPERM" || code === "EBUSY" || code === "ENOTEMPTY") && attempt < MAX_RETRIES) {
				await sleep(RETRY_DELAY_MS * attempt);
				continue;
			}
			throw error;
		}
	}
}

const cleanMode = (process.env.CLEAN_NEXT ?? "soft").toLowerCase();
const hardClean = cleanMode === "1" || cleanMode === "hard" || cleanMode === "full";
const softClean = cleanMode === "soft";

if (hardClean) {
	await cleanWithRetry(NEXT_DIR);
} else if (softClean) {
	await cleanWithRetry(NEXT_CACHE_DIR);
	await cleanWithRetry(NEXT_TRACE_FILE);
}
