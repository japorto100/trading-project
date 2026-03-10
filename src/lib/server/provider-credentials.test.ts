import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import {
	encodeProviderCredentialsHeader,
	PROVIDER_CREDENTIALS_COOKIE,
	parseProviderCredentialsCookie,
	resolveGatewayProviderCredentialsHeader,
	serializeProviderCredentialsCookie,
} from "@/lib/server/provider-credentials";

const originalCookieSecret = process.env.PROVIDER_CREDENTIALS_COOKIE_SECRET;

describe("provider credentials helper", () => {
	beforeEach(() => {
		process.env.PROVIDER_CREDENTIALS_COOKIE_SECRET = "provider-cookie-secret-for-tests";
	});

	afterEach(() => {
		if (originalCookieSecret === undefined) {
			delete process.env.PROVIDER_CREDENTIALS_COOKIE_SECRET;
			return;
		}
		process.env.PROVIDER_CREDENTIALS_COOKIE_SECRET = originalCookieSecret;
	});

	it("parses and normalizes stored provider keys", () => {
		const parsed = parseProviderCredentialsCookie(
			serializeProviderCredentialsCookie({
				FINNHUB: " demo-key ",
				alphavantage: "",
				fred: "fred-key",
			}),
		);

		expect(parsed).toEqual({
			finnhub: "demo-key",
			fred: "fred-key",
		});
	});

	it("supports legacy plain-json cookies during migration", () => {
		const parsed = parseProviderCredentialsCookie(
			JSON.stringify({
				FINNHUB: " demo-key ",
				banxico: " token-123 ",
			}),
		);

		expect(parsed).toEqual({
			finnhub: "demo-key",
			banxico: "token-123",
		});
	});

	it("encodes gateway provider credential store as base64 json", () => {
		const encoded = encodeProviderCredentialsHeader({
			finnhub: "demo-key",
			fred: "fred-key",
		});

		expect(encoded).toBeString();
		const decoded = JSON.parse(Buffer.from(encoded!, "base64").toString("utf8"));
		expect(decoded).toEqual({
			finnhub: { key: "demo-key" },
			fred: { key: "fred-key" },
		});
	});

	it("prefers explicit incoming header over cookie reconstruction", () => {
		const encoded = encodeProviderCredentialsHeader({ finnhub: "demo-key" });
		const resolved = resolveGatewayProviderCredentialsHeader({
			incomingHeader: "custom-header",
			cookieValue: serializeProviderCredentialsCookie({ finnhub: "demo-key" }),
		});

		expect(encoded).toBeString();
		expect(resolved).toBe("custom-header");
	});

	it("does not expose plaintext provider secrets in the stored cookie payload", () => {
		const serialized = serializeProviderCredentialsCookie({
			finnhub: "demo-key",
			fred: "fred-key",
		});

		expect(serialized).toStartWith("enc-v1.");
		expect(serialized).not.toContain("demo-key");
		expect(serialized).not.toContain("fred-key");
	});

	it("exports a stable cookie name", () => {
		expect(PROVIDER_CREDENTIALS_COOKIE).toBe("tradeview_provider_credentials");
	});
});
