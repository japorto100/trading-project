export interface GeopoliticalIngestionBudgetConfig {
	maxCandidatesPerRun: number;
	maxProviderCallsPerRun: number;
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
	const parsed = Number(value);
	if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
	return Math.floor(parsed);
}

export function getGeopoliticalIngestionBudgetConfig(): GeopoliticalIngestionBudgetConfig {
	return {
		maxCandidatesPerRun: parsePositiveInt(process.env.GEOPOLITICAL_MAX_CANDIDATES_PER_RUN, 100),
		maxProviderCallsPerRun: parsePositiveInt(
			process.env.GEOPOLITICAL_MAX_PROVIDER_CALLS_PER_RUN,
			12,
		),
	};
}

export class GeopoliticalIngestionBudget {
	private remainingCandidates: number;
	private remainingProviderCalls: number;
	private readonly providerCallsById = new Map<string, number>();

	constructor(config: GeopoliticalIngestionBudgetConfig) {
		this.remainingCandidates = config.maxCandidatesPerRun;
		this.remainingProviderCalls = config.maxProviderCallsPerRun;
	}

	reserveProviderCall(providerId: string): boolean {
		if (this.remainingProviderCalls <= 0) return false;
		this.remainingProviderCalls -= 1;
		this.providerCallsById.set(providerId, (this.providerCallsById.get(providerId) ?? 0) + 1);
		return true;
	}

	reserveCandidate(): boolean {
		if (this.remainingCandidates <= 0) return false;
		this.remainingCandidates -= 1;
		return true;
	}

	reserveCandidates(count: number): number {
		const allowed = Math.max(0, Math.min(count, this.remainingCandidates));
		this.remainingCandidates -= allowed;
		return allowed;
	}

	snapshot() {
		return {
			remainingCandidates: this.remainingCandidates,
			remainingProviderCalls: this.remainingProviderCalls,
			providerCallsById: Object.fromEntries(this.providerCallsById),
		};
	}
}
