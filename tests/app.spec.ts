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

	// --- Issue #21: 9-hole score checkbox ---
	//
	// Locator note: the Base UI Checkbox renders a <span role="checkbox"> (the
	// element that carries aria-label="9-hole score" and aria-checked) PLUS a
	// separate hidden native <input type="checkbox">. Only the span is exposed
	// with the accessible name, so getByRole("checkbox", { name: "9-hole score" })
	// resolves to exactly ONE element per row (verified) — no strict-mode
	// ambiguity, and toBeChecked() reads its aria-checked. getByLabel does NOT
	// match here (the aria-label is on a span, not a labelable control).

	test("9-hole checkbox toggles from unchecked to checked", async ({ page }) => {
		const row = page.locator("div.rounded-md").first();
		const checkbox = row.getByRole("checkbox", { name: "9-hole score" });

		await expect(checkbox).not.toBeChecked();
		await checkbox.click();
		await expect(checkbox).toBeChecked();
	});

	test("checking 9-hole doubles the score and changes the calculated handicap", async ({ page }) => {
		const calcButton = page.getByRole("button", { name: "Calculate Handicap" });

		// Mock rounds preload on localhost, so the button starts enabled.
		await expect(calcButton).toBeEnabled();
		await calcButton.click();
		const handicap = page.getByText(/Your Handicap:/);
		await expect(handicap).toBeVisible();
		const before = (await handicap.textContent())?.trim();

		// Toggle 9-hole on the round that currently survives outlier removal (the
		// median-scoring preloaded round, rendered 3rd) so doubling it provably
		// pushes it out and changes which differential is averaged.
		const rows = page.locator("div.rounded-md");
		const targetRow = rows.nth(2);
		const targetScore = targetRow.locator('input[type="number"]').nth(2);
		const scoreBefore = await targetScore.inputValue();

		await targetRow.getByRole("checkbox", { name: "9-hole score" }).click();

		// The raw score stays displayed in the input; only the calculation doubles it.
		await expect(targetScore).toHaveValue(scoreBefore);

		// Toggling resets the handicap; recompute and confirm it changed.
		await expect(calcButton).toBeEnabled();
		await calcButton.click();
		await expect(handicap).toBeVisible();
		const after = (await handicap.textContent())?.trim();

		expect(after).not.toBe(before);
	});

	test("each entry row still exposes exactly 3 number inputs", async ({ page }) => {
		const rows = page.locator("div.rounded-md");
		const count = await rows.count();
		expect(count).toBe(3);
		for (let i = 0; i < count; i++) {
			await expect(rows.nth(i).locator('input[type="number"]')).toHaveCount(3);
		}
	});

	test("imports a 6-column CSV and reflects the 9 Hole flags per row", async ({ page }) => {
		const csv = [
			"Date,Course Name,Course Rating,Slope Rating,Score,9 Hole",
			"1/15/2024,Augusta National,74.0,140,82,true",
			"2/20/2024,Pebble Beach,75.5,145,85,false",
		].join("\n");

		await page.locator('input[type="file"]').setInputFiles({
			name: "scores.csv",
			mimeType: "text/csv",
			buffer: Buffer.from(csv),
		});

		// Checkboxes only exist on entry rows, so counting them counts imported rows.
		const checkboxes = page.getByRole("checkbox", { name: "9-hole score" });
		await expect(checkboxes).toHaveCount(2);
		await expect(checkboxes.nth(0)).toBeChecked(); // 9 Hole = true
		await expect(checkboxes.nth(1)).not.toBeChecked(); // 9 Hole = false
	});

	test("imports a legacy 5-column CSV with all 9-hole flags defaulting to unchecked", async ({ page }) => {
		const csv = [
			"Date,Course Name,Course Rating,Slope Rating,Score",
			"1/15/2024,Augusta National,74.0,140,82",
			"2/20/2024,Pebble Beach,75.5,145,85",
		].join("\n");

		await page.locator('input[type="file"]').setInputFiles({
			name: "legacy-scores.csv",
			mimeType: "text/csv",
			buffer: Buffer.from(csv),
		});

		const checkboxes = page.getByRole("checkbox", { name: "9-hole score" });
		await expect(checkboxes).toHaveCount(2);
		await expect(checkboxes.nth(0)).not.toBeChecked();
		await expect(checkboxes.nth(1)).not.toBeChecked();
	});
});
