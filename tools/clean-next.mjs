import { rm } from "node:fs/promises";
import path from "node:path";

const NEXT_DIR = path.join(process.cwd(), ".next");
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 350;

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function cleanWithRetry() {
	for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
		try {
			await rm(NEXT_DIR, { recursive: true, force: true });
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

await cleanWithRetry();
