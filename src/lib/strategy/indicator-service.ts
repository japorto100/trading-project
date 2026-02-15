import { getErrorMessage } from "@/lib/utils";

const DEFAULT_INDICATOR_SERVICE_URL = "http://127.0.0.1:8092";
const DEFAULT_INDICATOR_SERVICE_TIMEOUT_MS = 8000;

function isEnabled(): boolean {
	const raw = process.env.INDICATOR_SERVICE_ENABLED;
	if (!raw) return false;
	const normalized = raw.trim().toLowerCase();
	return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}

function baseUrl(): string {
	const raw = process.env.INDICATOR_SERVICE_URL?.trim();
	if (!raw) return DEFAULT_INDICATOR_SERVICE_URL;
	return raw.replace(/\/$/, "");
}

function timeoutMs(): number {
	const parsed = Number(process.env.INDICATOR_SERVICE_TIMEOUT_MS);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_INDICATOR_SERVICE_TIMEOUT_MS;
}

export interface IndicatorServiceResult<T> {
	ok: boolean;
	status: number;
	data?: T;
	error?: string;
}

export async function callIndicatorService<T>(
	path: string,
	payload: unknown,
): Promise<IndicatorServiceResult<T>> {
	if (!isEnabled()) {
		return {
			ok: false,
			status: 503,
			error: "indicator service disabled",
		};
	}

	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs());
	try {
		const response = await fetch(`${baseUrl()}${path}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify(payload),
			signal: controller.signal,
			cache: "no-store",
		});
		if (!response.ok) {
			return {
				ok: false,
				status: response.status,
				error: `indicator service returned ${response.status}`,
			};
		}
		const data = (await response.json()) as T;
		return { ok: true, status: response.status, data };
	} catch (error: unknown) {
		return {
			ok: false,
			status: 502,
			error: getErrorMessage(error),
		};
	} finally {
		clearTimeout(timer);
	}
}
