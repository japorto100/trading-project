import type { LayoutMode } from "@/features/trading/types";

export interface RemoteFusionPreferences {
	profileKey: string;
	favorites: string[];
	layout: LayoutMode;
	sidebarOpen: boolean;
	showDrawingTool: boolean;
	darkMode: boolean;
}

let remotePersistenceAvailable: boolean | null = null;

function isRemotePersistenceEnabled(): boolean {
	const flag = process.env.NEXT_PUBLIC_ENABLE_REMOTE_PERSISTENCE;
	if (typeof flag === "string") {
		return flag === "1" || flag.toLowerCase() === "true";
	}
	return true;
}

async function checkRemotePersistenceAvailability(): Promise<boolean> {
	if (!isRemotePersistenceEnabled()) {
		remotePersistenceAvailable = false;
		return false;
	}

	if (remotePersistenceAvailable !== null) {
		return remotePersistenceAvailable;
	}

	try {
		const response = await fetch("/api/fusion/persistence/status", { cache: "no-store" });
		if (!response.ok) {
			remotePersistenceAvailable = false;
			return false;
		}
		const payload = (await response.json()) as { success?: boolean; dbConfigured?: boolean };
		remotePersistenceAvailable = Boolean(payload?.success && payload?.dbConfigured);
		return remotePersistenceAvailable;
	} catch {
		remotePersistenceAvailable = false;
		return false;
	}
}

export async function fetchRemoteFusionPreferences(
	profileKey: string,
): Promise<RemoteFusionPreferences | null> {
	const available = await checkRemotePersistenceAvailability();
	if (!available) {
		return null;
	}

	const response = await fetch(
		`/api/fusion/preferences?profileKey=${encodeURIComponent(profileKey)}`,
		{ cache: "no-store" },
	);

	if (!response.ok) {
		if (response.status >= 500) {
			remotePersistenceAvailable = false;
		}
		return null;
	}

	const payload = (await response.json()) as {
		preferences?: RemoteFusionPreferences;
	};
	return payload.preferences ?? null;
}

export async function pushRemoteFusionPreferences(
	input: RemoteFusionPreferences,
): Promise<boolean> {
	const available = await checkRemotePersistenceAvailability();
	if (!available) {
		return false;
	}

	const response = await fetch("/api/fusion/preferences", {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	});

	if (!response.ok && response.status >= 500) {
		remotePersistenceAvailable = false;
	}

	return response.ok;
}
