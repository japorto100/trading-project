import { getErrorMessage } from "@/lib/utils";

const DEFAULT_GO_GATEWAY_BASE_URL = "http://127.0.0.1:9060";
const DEFAULT_INDICATOR_SERVICE_TIMEOUT_MS = 8000;

function isEnabled(): boolean {
	const raw = process.env.INDICATOR_SERVICE_ENABLED;
	if (!raw) return true;
	const normalized = raw.trim().toLowerCase();
	return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}

function baseUrl(): string {
	const gatewayBaseUrl = process.env.GO_GATEWAY_BASE_URL?.trim();
	if (gatewayBaseUrl) return gatewayBaseUrl.replace(/\/$/, "");
	return DEFAULT_GO_GATEWAY_BASE_URL;
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
	options?: { requestId?: string; userRole?: string },
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
		const headers: Record<string, string> = {
			"Content-Type": "application/json",
			Accept: "application/json",
		};
		if (options?.requestId) {
			headers["X-Request-ID"] = options.requestId;
		}
		if (options?.userRole) {
			headers["X-User-Role"] = options.userRole;
		}

		const response = await fetch(`${baseUrl()}${path}`, {
			method: "POST",
			headers,
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
