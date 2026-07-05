import { test, expect, type Page } from "@playwright/test";

// The date field renders as a placeholder-bearing text input (not type="date"),
// so locate it by placeholder. Counting these is equivalent to counting rows.
const DATE_INPUT = 'input[placeholder="June 01, 2025"]';

// The course-name field is the only <input type="text"> inside a row (the date
// field renders with no explicit type attribute), so this selector yields exactly
// one value per row, top-to-bottom in DOM/visual order.
const COURSE_INPUT = 'div.rounded-md input[type="text"]';

// Reads the visible course-name value of every row, top-to-bottom.
async function readCourseOrder(page: Page): Promise<string[]> {
	return page
		.locator(COURSE_INPUT)
		.evaluateAll((els) => els.map((el) => (el as HTMLInputElement).value));
}

// Operate a Radix Select: open the named combobox trigger, wait for the portal
// option to render, then click it. Awaiting visibility (not a fixed sleep) keeps
// this stable against portal mount timing.
async function chooseSortOption(page: Page, comboName: string, optionName: string) {
	await page.getByRole("combobox", { name: comboName, exact: true }).click();
	const option = page.getByRole("option", { name: optionName, exact: true });
	await option.waitFor({ state: "visible" });
	await option.click();
}

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

	test.describe("sorting controls (issue #28)", () => {
		// Course names as they appear in mockData/mockScores.ts, sorted:
		//   ascending  (A -> Z): Augusta, Pebble Beach, St Andrews
		//   descending (Z -> A): St Andrews, Pebble Beach, Augusta
		const COURSE_ASC = [
			"Augusta National Golf Club",
			"Pebble Beach Golf Links",
			"St Andrews Old Course",
		];
		const COURSE_DESC = [...COURSE_ASC].reverse();

		test("comboboxes exist with accessible names and show the defaults", async ({ page }) => {
			const sortBy = page.getByRole("combobox", { name: "Sort by", exact: true });
			const order = page.getByRole("combobox", { name: "Order", exact: true });

			await expect(sortBy).toBeVisible();
			await expect(order).toBeVisible();

			// Default on load: Date, Descending (newest first).
			await expect(sortBy).toContainText("Date");
			await expect(order).toContainText("Descending");
		});

		test("default order is Date descending (newest first)", async ({ page }) => {
			// mockScores newest -> oldest: Augusta (03-10), St Andrews (02-15), Pebble Beach (01-01)
			await expect.poll(() => readCourseOrder(page)).toEqual([
				"Augusta National Golf Club",
				"St Andrews Old Course",
				"Pebble Beach Golf Links",
			]);
		});

		test("sorting by Course reorders rows, and toggling Order reverses them", async ({ page }) => {
			const dateInputs = page.locator(DATE_INPUT);
			const calcButton = page.getByRole("button", { name: "Calculate Handicap" });

			// Baseline invariants: 3 rows preloaded and Calculate enabled.
			await expect(dateInputs).toHaveCount(3);
			await expect(calcButton).toBeEnabled();

			// Sort by Course. Order is still the default (Descending), so rows land
			// in reverse-alphabetical order.
			await chooseSortOption(page, "Sort by", "Course");
			await expect(page.getByRole("combobox", { name: "Sort by", exact: true })).toContainText(
				"Course"
			);
			await expect.poll(() => readCourseOrder(page)).toEqual(COURSE_DESC);

			// Flip Order to Ascending -> the same rows in alphabetical order, i.e. the
			// exact reverse of the previous ordering.
			await chooseSortOption(page, "Order", "Ascending");
			await expect(page.getByRole("combobox", { name: "Order", exact: true })).toContainText(
				"Ascending"
			);
			await expect.poll(() => readCourseOrder(page)).toEqual(COURSE_ASC);

			// Row-count invariant: sorting reorders, it never adds/removes rows, and
			// the ability to Calculate is untouched.
			await expect(dateInputs).toHaveCount(3);
			await expect(calcButton).toBeEnabled();
		});
	});

	test("visual snapshot of app", async ({ page }) => {
		await expect(page).toHaveScreenshot("app-initial.png", { fullPage: true });
	});
});
