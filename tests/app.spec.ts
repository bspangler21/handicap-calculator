import { test, expect } from "@playwright/test";

// The date field renders as a placeholder-bearing text input (not type="date"),
// so locate it by placeholder. Counting these is equivalent to counting rows.
const DATE_INPUT = 'input[placeholder="June 01, 2025"]';

test.describe("Golf Handicap Calculator", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
	});

	test("page loads with correct title", async ({ page }) => {
		await expect(page).toHaveTitle("Golf Handicap Calculator");
		await expect(page.getByRole("heading", { name: "Golf Handicap Calculator" })).toBeVisible();
	});

	test("shows 3 initial entry rows", async ({ page }) => {
		const dateInputs = page.locator(DATE_INPUT);
		await expect(dateInputs).toHaveCount(3);
	});

	test("Calculate Handicap button is disabled without enough eligible entries", async ({ page }) => {
		// On localhost the app preloads 3 eligible mock rounds, so the button starts
		// enabled. Remove every row to exercise the disabled (insufficient entries) state.
		const dateInputs = page.locator(DATE_INPUT);
		const deleteButtons = page.getByRole("button", { name: /Delete entry/i });
		while ((await dateInputs.count()) > 0) {
			await deleteButtons.first().click();
		}

		const calcButton = page.getByRole("button", { name: "Calculate Handicap" });
		await expect(calcButton).toBeDisabled();
	});

	test("fill 3 entries and calculate handicap", async ({ page }) => {
		const rows = page.locator("div.rounded-md");

		// Fill first row
		await rows.nth(0).locator(DATE_INPUT).fill("01/15/2024");
		await rows.nth(0).locator(DATE_INPUT).blur();
		await rows.nth(0).locator('input[type="text"]').fill("Augusta National");
		const inputs0 = rows.nth(0).locator('input[type="number"]');
		await inputs0.nth(0).fill("74.0");
		await inputs0.nth(0).blur();
		await inputs0.nth(1).fill("140");
		await inputs0.nth(1).blur();
		await inputs0.nth(2).fill("82");
		await inputs0.nth(2).blur();

		// Fill second row
		await rows.nth(1).locator(DATE_INPUT).fill("02/20/2024");
		await rows.nth(1).locator(DATE_INPUT).blur();
		await rows.nth(1).locator('input[type="text"]').fill("Pebble Beach");
		const inputs1 = rows.nth(1).locator('input[type="number"]');
		await inputs1.nth(0).fill("75.5");
		await inputs1.nth(0).blur();
		await inputs1.nth(1).fill("145");
		await inputs1.nth(1).blur();
		await inputs1.nth(2).fill("85");
		await inputs1.nth(2).blur();

		// Fill third row
		await rows.nth(2).locator(DATE_INPUT).fill("03/10/2024");
		await rows.nth(2).locator(DATE_INPUT).blur();
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
		await expect(page.locator(DATE_INPUT)).toHaveCount(4);
	});

	test("Delete button removes an entry row", async ({ page }) => {
		// Add a 4th entry so we have something to delete
		await page.getByRole("button", { name: "Add Entry" }).click();
		await expect(page.locator(DATE_INPUT)).toHaveCount(4);

		// On desktop viewport, delete buttons are in the hidden sm:flex div
		// Use aria-label matching
		const deleteButtons = page.getByRole("button", { name: /Delete entry/i });
		await deleteButtons.first().click();
		await expect(page.locator(DATE_INPUT)).toHaveCount(3);
	});

	test("visual snapshot of app", async ({ page }) => {
		await expect(page).toHaveScreenshot("app-initial.png", { fullPage: true });
	});
});
