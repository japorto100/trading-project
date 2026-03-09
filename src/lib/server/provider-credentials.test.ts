import { describe, expect, it } from "bun:test";
import {
	PROVIDER_CREDENTIALS_COOKIE,
	encodeProviderCredentialsHeader,
	parseProviderCredentialsCookie,
	resolveGatewayProviderCredentialsHeader,
} from "@/lib/server/provider-credentials";

describe("provider credentials helper", () => {
	it("parses and normalizes stored provider keys", () => {
		const parsed = parseProviderCredentialsCookie(
			JSON.stringify({
				FINNHUB: " demo-key ",
				alphavantage: "",
				twelvedata: "td-key",
			}),
		);

		expect(parsed).toEqual({
			finnhub: "demo-key",
			twelvedata: "td-key",
		});
	});

	it("encodes gateway provider credential store as base64 json", () => {
		const encoded = encodeProviderCredentialsHeader({
			finnhub: "demo-key",
			twelvedata: "td-key",
		});

		expect(encoded).toBeString();
		const decoded = JSON.parse(Buffer.from(encoded!, "base64").toString("utf8"));
		expect(decoded).toEqual({
			finnhub: { key: "demo-key" },
			twelvedata: { key: "td-key" },
		});
	});

	it("prefers explicit incoming header over cookie reconstruction", () => {
		const encoded = encodeProviderCredentialsHeader({ finnhub: "demo-key" });
		const resolved = resolveGatewayProviderCredentialsHeader({
			incomingHeader: "custom-header",
			cookieValue: JSON.stringify({ finnhub: "demo-key" }),
		});

		expect(encoded).toBeString();
		expect(resolved).toBe("custom-header");
	});

	it("exports a stable cookie name", () => {
		expect(PROVIDER_CREDENTIALS_COOKIE).toBe("tradeview_provider_credentials");
	});
});
