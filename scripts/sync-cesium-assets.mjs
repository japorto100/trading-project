import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const cesiumBuildRoot = path.join(repoRoot, "node_modules", "cesium", "Build", "Cesium");
const publicRoot = path.join(repoRoot, "public", "cesium");

const folders = ["Workers", "ThirdParty", "Assets", "Widgets"];

if (!existsSync(cesiumBuildRoot)) {
	console.warn("[cesium:sync] Cesium build directory not found. Skipping asset sync.");
	process.exit(0);
}

mkdirSync(publicRoot, { recursive: true });

for (const folder of folders) {
	const source = path.join(cesiumBuildRoot, folder);
	const destination = path.join(publicRoot, folder);

	if (!existsSync(source)) {
		console.warn(`[cesium:sync] Missing Cesium asset folder: ${folder}`);
		continue;
	}

	rmSync(destination, { recursive: true, force: true });
	cpSync(source, destination, { recursive: true });
}

console.log(`[cesium:sync] Synced Cesium assets into ${publicRoot}`);
