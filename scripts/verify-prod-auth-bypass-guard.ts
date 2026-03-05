import assert from "node:assert/strict";
import { isAuthStackBypassEnabled } from "../src/lib/auth/runtime-flags";

const env = process.env as Record<string, string | undefined>;

const ENV_KEYS = [
	"NODE_ENV",
	"AUTH_STACK_BYPASS",
	"NEXT_PUBLIC_AUTH_STACK_BYPASS",
	"ALLOW_PROD_AUTH_STACK_BYPASS",
] as const;

function setEnv(name: (typeof ENV_KEYS)[number], value: string | undefined) {
	if (value === undefined) {
		delete env[name];
		return;
	}
	env[name] = value;
}

function withEnv(
	next: Partial<Record<(typeof ENV_KEYS)[number], string>>,
	fn: () => void,
) {
	const previous: Record<string, string | undefined> = {};
	for (const k of ENV_KEYS) {
		previous[k] = process.env[k];
	}
	for (const k of ENV_KEYS) {
		setEnv(k, next[k]);
	}
	try {
		fn();
	} finally {
		for (const k of ENV_KEYS) {
			setEnv(k, previous[k]);
		}
	}
}

withEnv(
	{
		NODE_ENV: "production",
		AUTH_STACK_BYPASS: "true",
		NEXT_PUBLIC_AUTH_STACK_BYPASS: undefined,
		ALLOW_PROD_AUTH_STACK_BYPASS: "false",
	},
	() => {
		assert.throws(
			() => isAuthStackBypassEnabled(),
			/must remain disabled in production/i,
			"bypass must fail-closed in production without explicit allow flag",
		);
	},
);

withEnv(
	{
		NODE_ENV: "production",
		AUTH_STACK_BYPASS: "true",
		NEXT_PUBLIC_AUTH_STACK_BYPASS: undefined,
		ALLOW_PROD_AUTH_STACK_BYPASS: "true",
	},
	() => {
		assert.equal(
			isAuthStackBypassEnabled(),
			true,
			"bypass can only be enabled in production with ALLOW_PROD_AUTH_STACK_BYPASS=true",
		);
	},
);

withEnv(
	{
		NODE_ENV: "development",
		AUTH_STACK_BYPASS: "false",
		NEXT_PUBLIC_AUTH_STACK_BYPASS: "false",
		ALLOW_PROD_AUTH_STACK_BYPASS: undefined,
	},
	() => {
		assert.equal(isAuthStackBypassEnabled(), false, "development baseline should keep bypass off");
	},
);

console.log("verify-prod-auth-bypass-guard: PASS");

