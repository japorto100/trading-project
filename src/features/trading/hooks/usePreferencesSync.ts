"use client";

import { useEffect, useState } from "react";
import { writeFusionPreferences } from "@/lib/storage/preferences";
import {
	fetchRemoteFusionPreferences,
	pushRemoteFusionPreferences,
} from "@/lib/storage/preferences-remote";
import { getClientProfileKey } from "@/lib/storage/profile-key";
import type { LayoutMode } from "../types";

interface UsePreferencesSyncReturn {
	remoteHydrated: boolean;
}

interface UsePreferencesSyncOptions {
	mounted: boolean;
	favorites: string[];
	layout: LayoutMode;
	sidebarOpen: boolean;
	showDrawingToolbar: boolean;
	onHydrated: (favorites: string[], layout: LayoutMode) => void;
}

export function usePreferencesSync({
	mounted,
	favorites,
	layout,
	sidebarOpen,
	showDrawingToolbar,
	onHydrated,
}: UsePreferencesSyncOptions): UsePreferencesSyncReturn {
	const [remoteHydrated, setRemoteHydrated] = useState(false);

	// Hydrate from remote on mount — useEffect is justified: one-time async side-effect on mount
	// biome-ignore lint/correctness/useExhaustiveDependencies: intentional one-time mount hydration; favorites/layout/onHydrated are initial fallbacks only
	useEffect(() => {
		if (!mounted) return;
		let active = true;

		const hydrate = async () => {
			try {
				const profileKey = getClientProfileKey();
				const remote = await fetchRemoteFusionPreferences(profileKey);
				if (!active || !remote) return;

				const newFavorites = Array.isArray(remote.favorites) ? remote.favorites : favorites;
				const newLayout = remote.layout ?? layout;

				if (Array.isArray(remote.favorites)) writeFusionPreferences({ favorites: newFavorites });
				if (remote.layout) writeFusionPreferences({ layout: newLayout });

				onHydrated(newFavorites, newLayout);
			} finally {
				if (active) setRemoteHydrated(true);
			}
		};

		void hydrate();
		return () => {
			active = false;
		};
	}, [mounted]);

	// Push preferences when they change — useEffect is justified: synchronizes local state to remote storage
	useEffect(() => {
		if (!mounted || !remoteHydrated) return;
		const profileKey = getClientProfileKey();
		void pushRemoteFusionPreferences({
			profileKey,
			favorites,
			layout,
			sidebarOpen,
			showDrawingTool: showDrawingToolbar,
		});
	}, [favorites, layout, mounted, remoteHydrated, sidebarOpen, showDrawingToolbar]);

	return { remoteHydrated };
}
