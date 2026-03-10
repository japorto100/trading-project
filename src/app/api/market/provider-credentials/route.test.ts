import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { NextRequest } from "next/server";
import {
	parseProviderCredentialsCookie,
	serializeProviderCredentialsCookie,
} from "@/lib/server/provider-credentials";
import { POST } from "./route";

const originalCookieSecret = process.env.PROVIDER_CREDENTIALS_COOKIE_SECRET;

describe("POST /api/market/provider-credentials", () => {
	beforeEach(() => {
		process.env.PROVIDER_CREDENTIALS_COOKIE_SECRET = "provider-cookie-secret-for-route-tests";
	});

	afterEach(() => {
		if (originalCookieSecret === undefined) {
			delete process.env.PROVIDER_CREDENTIALS_COOKIE_SECRET;
			return;
		}
		process.env.PROVIDER_CREDENTIALS_COOKIE_SECRET = originalCookieSecret;
	});

	it("stores normalized provider credentials in an encrypted httpOnly cookie", async () => {
		const request = new NextRequest("http://localhost:3000/api/market/provider-credentials", {
			method: "POST",
			headers: {
				"content-type": "application/json",
				"x-request-id": "req-provider-credentials-store",
			},
			body: JSON.stringify({
				finnhub: " request-token ",
				alphavantage: "",
			}),
		});

		const response = await POST(request);
		expect(response.status).toBe(200);
		expect(response.headers.get("x-request-id")).toBe("req-provider-credentials-store");
		expect(response.headers.get("set-cookie")).toContain("tradeview_provider_credentials=");
		expect(response.headers.get("set-cookie")).toContain("HttpOnly");
		expect(response.headers.get("set-cookie")).toContain("SameSite=strict");
		expect(response.headers.get("cache-control")).toBe("no-store");

		const payload = (await response.json()) as { success: boolean; storedProviders: string[] };
		expect(payload.success).toBe(true);
		expect(payload.storedProviders).toEqual(["finnhub"]);
	});

	it("merges new credentials with the existing encrypted cookie state", async () => {
		const request = new NextRequest("http://localhost:3000/api/market/provider-credentials", {
			method: "POST",
			headers: {
				"content-type": "application/json",
				cookie: `tradeview_provider_credentials=${serializeProviderCredentialsCookie({
					finnhub: "request-token",
				})}`,
			},
			body: JSON.stringify({
				credentials: {
					fred: "fred-token",
				},
			}),
		});

		const response = await POST(request);
		expect(response.status).toBe(200);

		const setCookie = response.headers.get("set-cookie");
		expect(setCookie).toBeString();
		const cookieValue = setCookie?.split(";")[0].replace("tradeview_provider_credentials=", "");
		expect(parseProviderCredentialsCookie(cookieValue)).toEqual({
			finnhub: "request-token",
			fred: "fred-token",
		});
	});

	it("removes only explicitly requested providers from the stored cookie state", async () => {
		const request = new NextRequest("http://localhost:3000/api/market/provider-credentials", {
			method: "POST",
			headers: {
				"content-type": "application/json",
				cookie: `tradeview_provider_credentials=${serializeProviderCredentialsCookie({
					finnhub: "request-token",
					fred: "fred-token",
				})}`,
			},
			body: JSON.stringify({
				removeProviders: ["finnhub"],
			}),
		});

		const response = await POST(request);
		expect(response.status).toBe(200);

		const setCookie = response.headers.get("set-cookie");
		expect(setCookie).toBeString();
		const cookieValue = setCookie?.split(";")[0].replace("tradeview_provider_credentials=", "");
		expect(parseProviderCredentialsCookie(cookieValue)).toEqual({
			fred: "fred-token",
		});
	});
});
