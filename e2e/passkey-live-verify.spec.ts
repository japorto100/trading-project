import { expect, test, type Page } from "@playwright/test";

async function attachVirtualAuthenticator(page: Page) {
	const cdp = await page.context().newCDPSession(page);
	await cdp.send("WebAuthn.enable");
	const { authenticatorId } = await cdp.send("WebAuthn.addVirtualAuthenticator", {
		options: {
			protocol: "ctap2",
			transport: "internal",
			hasResidentKey: true,
			hasUserVerification: true,
			isUserVerified: true,
			automaticPresenceSimulation: true,
		},
	});
	return {
		cdp,
		authenticatorId,
		dispose: async () => {
			await cdp.send("WebAuthn.removeVirtualAuthenticator", { authenticatorId });
			await cdp.send("WebAuthn.disable");
		},
	};
}

test.describe("Phase 1 Passkey Live-Verify", () => {
	test("1.7-1.9 provider/register/session flow", async ({ page }) => {
		const webauthn = await attachVirtualAuthenticator(page);
		try {
			const email = `passkey-e2e-${Date.now()}@local.test`;
			const password = "PasskeyE2E!234";

			await page.goto("/auth/register");
			await page.getByLabel("Email").fill(email);
			await page.getByLabel("Display name (optional)").fill("Passkey E2E");
			await page.getByLabel("Password", { exact: true }).fill(password);
			await page.getByLabel("Confirm password").fill(password);
			await page.getByRole("button", { name: "Create Account" }).click();
			await expect(page.getByRole("button", { name: "Create Account" })).toBeVisible({
				timeout: 30_000,
			});

			await page.goto("/auth/sign-in");
			await expect(page.getByText("Auth.js Provider")).toBeVisible({ timeout: 10_000 });
			await page.getByLabel("Username").fill(email);
			await page.getByLabel("Password").fill(password);
			await page.getByRole("button", { name: "Sign In (Credentials)" }).click();
			await expect(page.getByText(/credentials session created successfully/i)).toBeVisible({
				timeout: 10_000,
			});

			await page.goto("/auth/passkeys");
			await expect(page.getByText(/Auth\.js Provider/i)).toBeVisible({ timeout: 10_000 });
			await page.getByRole("button", { name: "Register Passkey" }).click();
			await expect(page.getByText(/device(s)? registered/i)).toBeVisible({ timeout: 20_000 });

			await page.goto("/");
			await page.getByTestId("header-account-menu").click();
			await page.getByTestId("header-signout").click();
			await expect(page).toHaveURL(/auth\/sign-in/, { timeout: 10_000 });

			await page.getByRole("button", { name: "Sign In With Passkey" }).click();
			await expect(
				page.getByText(/passkey session created via auth\.js passkey provider/i),
			).toBeVisible({ timeout: 20_000 });

			await page.goto("/auth/security");
			await expect(page.getByText(/^active$/)).toBeVisible({ timeout: 10_000 });

			await page.reload();
			const session = await page.evaluate(async () => {
				const res = await fetch("/api/auth/session");
				return res.json();
			});
			expect(session?.user ?? null).not.toBeNull();
		} finally {
			await webauthn.dispose();
		}
	});
});
