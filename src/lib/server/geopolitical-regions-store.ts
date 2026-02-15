import { promises as fs } from "node:fs";
import path from "node:path";
import { DEFAULT_GEO_REGIONS } from "@/lib/geopolitical/regions";
import type { GeoRegion, GeoRegionsStoreFile } from "@/lib/geopolitical/types";

const STORE_PATH = path.join(process.cwd(), "data", "geopolitical", "regions.json");

async function ensureFileExists(): Promise<void> {
	try {
		await fs.access(STORE_PATH);
	} catch {
		await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
		const defaultPayload: GeoRegionsStoreFile = { regions: DEFAULT_GEO_REGIONS };
		await fs.writeFile(STORE_PATH, JSON.stringify(defaultPayload, null, 2), "utf-8");
	}
}

export async function listGeoRegions(): Promise<GeoRegion[]> {
	await ensureFileExists();
	try {
		const raw = await fs.readFile(STORE_PATH, "utf-8");
		const parsed = JSON.parse(raw) as GeoRegionsStoreFile;
		if (!parsed || !Array.isArray(parsed.regions) || parsed.regions.length === 0) {
			return DEFAULT_GEO_REGIONS;
		}
		return parsed.regions;
	} catch {
		return DEFAULT_GEO_REGIONS;
	}
}
