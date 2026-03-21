import type { KnipConfig } from "knip";

const config: KnipConfig = {
	next: true,
	ignoreDependencies: [
		"@types/*",
		"prisma",
		"@playwright/test",
		"tailwindcss",
		"postcss",
		// Loaded by Next.js build pipeline, not imported directly
		"babel-plugin-react-compiler",
		"tw-animate-css",
	],
	ignore: [
		// Generated / build output
		".next/**",
		"src/lib/generated/**",
		"prisma/generated/**",
		// Standalone scripts (not part of app graph)
		"scripts/**",
		// E2E tests
		"e2e/**",
		// Reference repos — read-only, not part of build
		"_tmp_ref_review/**",
	],
	// Only analyze src — skip go-backend, python-backend, tools etc.
	include: ["files", "exports", "types", "duplicates", "unlisted"],
	workspaces: {
		".": {
			entry: [
				"src/app/**/page.{ts,tsx}",
				"src/app/**/layout.{ts,tsx}",
				"src/app/**/route.{ts,tsx}",
				"src/app/**/loading.{ts,tsx}",
				"src/app/**/error.{ts,tsx}",
				"src/app/**/not-found.{ts,tsx}",
				"src/middleware.ts",
				"src/instrumentation.ts",
				"next.config.ts",
				"knip.config.ts",
			],
		},
	},
};

export default config;
