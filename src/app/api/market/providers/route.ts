import { NextResponse } from 'next/server';
import { getProviderManager, PROVIDER_REGISTRY } from '@/lib/providers';

export async function GET() {
  try {
    const manager = getProviderManager();
    const providers = manager.getProviderInfo();

    // Check availability for each provider
    const statusPromises = Object.entries(providers).map(async ([name, info]) => {
      const provider = manager.getProvider(name);
      let available = false;
      
      if (provider) {
        try {
          available = await provider.isAvailable();
        } catch {
          available = false;
        }
      }

      return {
        name,
        displayName: info.info.displayName,
        available,
        requiresAuth: info.info.requiresAuth,
        supportedAssets: info.info.supportedAssets,
        rateLimit: info.info.rateLimit,
        freePlan: info.info.freePlan,
        documentation: info.info.documentation,
      };
    });

    const providerStatus = await Promise.all(statusPromises);

    return NextResponse.json({
      success: true,
      providers: providerStatus,
      registry: PROVIDER_REGISTRY,
    });
  } catch (error: any) {
    console.error('Providers API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get provider status' },
      { status: 500 }
    );
  }
}
