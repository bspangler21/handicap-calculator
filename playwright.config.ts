import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./tests",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	reporter: "html",
	use: {
		baseURL: "http://localhost:5173",
		trace: "on-first-retry",
	},
	projects: [
		{
			name: "chromium",
			use: {
				...devices["Desktop Chrome"],
				// Use Playwright's managed browser by default. Set PLAYWRIGHT_CHROMIUM_PATH
				// to override (e.g. a sandbox/CI image with a pre-installed binary).
				...(process.env.PLAYWRIGHT_CHROMIUM_PATH
					? { launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } }
					: {}),
			},
		},
	],
	webServer: {
		command: "npm run dev",
		url: "http://localhost:5173",
		reuseExistingServer: !process.env.CI,
		timeout: 30000,
	},
});
