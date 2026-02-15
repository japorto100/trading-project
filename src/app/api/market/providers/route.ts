import { NextResponse } from "next/server";
import { getProviderManager, PROVIDER_REGISTRY } from "@/lib/providers";
import type { ProviderInfo } from "@/lib/providers/types";

export async function GET() {
	try {
		const manager = getProviderManager();
		const providers = manager.getProviderInfo();

		// Check availability for each provider
		const statusPromises = Object.entries(providers).map(async ([name, info]) => {
			const provider = manager.getProvider(name);
			let available = false;
			const providerInfo = info.info as ProviderInfo;

			if (provider) {
				try {
					available = await provider.isAvailable();
				} catch {
					available = false;
				}
			}

			return {
				name,
				displayName: providerInfo.displayName,
				available,
				requiresAuth: providerInfo.requiresAuth,
				supportedAssets: providerInfo.supportedAssets,
				rateLimit: providerInfo.rateLimit,
				freePlan: providerInfo.freePlan,
				documentation: providerInfo.documentation,
			};
		});

		const providerStatus = await Promise.all(statusPromises);

		return NextResponse.json({
			success: true,
			providers: providerStatus,
			registry: PROVIDER_REGISTRY,
		});
	} catch (error: unknown) {
		console.error("Providers API Error:", error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Failed to get provider status" },
			{ status: 500 },
		);
	}
}
