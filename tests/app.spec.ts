import { test, expect } from "@playwright/test";

test.describe("Golf Handicap Calculator", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
	});

	test("page loads with correct title", async ({ page }) => {
		await expect(page).toHaveTitle("Golf Handicap Calculator");
		await expect(page.getByRole("heading", { name: "Golf Handicap Calculator" })).toBeVisible();
	});

	test("shows 3 initial entry rows", async ({ page }) => {
		const dateInputs = page.locator('input[type="date"]');
		await expect(dateInputs).toHaveCount(3);
	});

	test("Calculate Handicap button is disabled with empty entries", async ({ page }) => {
		const calcButton = page.getByRole("button", { name: "Calculate Handicap" });
		await expect(calcButton).toBeDisabled();
	});

	test("fill 3 entries and calculate handicap", async ({ page }) => {
		const rows = page.locator("div.rounded-md");

		// Fill first row
		await rows.nth(0).locator('input[type="date"]').fill("2024-01-15");
		await rows.nth(0).locator('input[type="text"]').fill("Augusta National");
		const inputs0 = rows.nth(0).locator('input[type="number"]');
		await inputs0.nth(0).fill("74.0");
		await inputs0.nth(0).blur();
		await inputs0.nth(1).fill("140");
		await inputs0.nth(1).blur();
		await inputs0.nth(2).fill("82");
		await inputs0.nth(2).blur();

		// Fill second row
		await rows.nth(1).locator('input[type="date"]').fill("2024-02-20");
		await rows.nth(1).locator('input[type="text"]').fill("Pebble Beach");
		const inputs1 = rows.nth(1).locator('input[type="number"]');
		await inputs1.nth(0).fill("75.5");
		await inputs1.nth(0).blur();
		await inputs1.nth(1).fill("145");
		await inputs1.nth(1).blur();
		await inputs1.nth(2).fill("85");
		await inputs1.nth(2).blur();

		// Fill third row
		await rows.nth(2).locator('input[type="date"]').fill("2024-03-10");
		await rows.nth(2).locator('input[type="text"]').fill("St Andrews");
		const inputs2 = rows.nth(2).locator('input[type="number"]');
		await inputs2.nth(0).fill("72.0");
		await inputs2.nth(0).blur();
		await inputs2.nth(1).fill("130");
		await inputs2.nth(1).blur();
		await inputs2.nth(2).fill("78");
		await inputs2.nth(2).blur();

		const calcButton = page.getByRole("button", { name: "Calculate Handicap" });
		await expect(calcButton).toBeEnabled();
		await calcButton.click();
		await expect(page.getByText(/Your Handicap:/)).toBeVisible();
	});

	test("Add Entry button creates a 4th row", async ({ page }) => {
		await page.getByRole("button", { name: "Add Entry" }).click();
		await expect(page.locator('input[type="date"]')).toHaveCount(4);
	});

	test("Delete button removes an entry row", async ({ page }) => {
		// Add a 4th entry so we have something to delete
		await page.getByRole("button", { name: "Add Entry" }).click();
		await expect(page.locator('input[type="date"]')).toHaveCount(4);

		// On desktop viewport, delete buttons are in the hidden sm:flex div
		// Use aria-label matching
		const deleteButtons = page.getByRole("button", { name: /Delete entry/i });
		await deleteButtons.first().click();
		await expect(page.locator('input[type="date"]')).toHaveCount(3);
	});

	test("visual snapshot of app", async ({ page }) => {
		await expect(page).toHaveScreenshot("app-initial.png", { fullPage: true });
	});
});
