# Changelog

All notable changes are documented in this file.

## [2026-07-12]

### Summary

Adds a per-entry "9-hole" checkbox to each score row. When an entry is marked as a 9-hole round, its score is doubled inside the handicap calculation only; the raw score stays displayed and stored unchanged. CSV export gains a sixth "9 Hole" column, and CSV import stays backward compatible with existing five-column files (the flag defaults to false when the column is absent).

### Added

- **`src/components/ui/checkbox.tsx`**: New Base UI (`@base-ui/react/checkbox`) checkbox wrapper in the shadcn-on-Base-UI style, matching the existing `separator.tsx` pattern.
- **`src/types/IEntry.ts`**: `IEntry` gains an `isNineHole: boolean` field.
- **`src/lib/constants.ts`**: New `CSV_HEADERS = [...COLUMN_HEADERS, "9 Hole"]` so the exported file carries a sixth column; the on-screen table header stays five columns.
- **`tests/app.spec.ts`**: Five new Playwright tests covering the checkbox, the doubling behavior, and CSV round-trips; the `-win32` visual snapshot was regenerated.

### Changed

- **`src/components/EntryRow.tsx`**: The Score cell now renders the Score input plus a "9-hole" checkbox to its right, both inside the same `flex-1` Score cell, so the centered "Score" header and the five-column layout stay unchanged. One unified layout serves mobile and desktop (the checkbox is never conditionally rendered by screen size). The control has the accessible name "9-hole score", a `min-h-6` target, an `aria-describedby` pointing at an sr-only "Score is doubled in the handicap calculation", and an aria-hidden "9" glyph. `onUpdate` is now generic: `<K extends keyof IEntry>(id, field: K, value: IEntry[K])`.
- **`src/lib/utils.ts`**: Added a module-private `effectiveScore(entry)` helper that doubles the score for 9-hole entries; the doubling is applied consistently in both the high/low outlier sorts and the differential.
- **`src/App.tsx`**: `EMPTY_ENTRY` sets `isNineHole: false`, `exportData` writes the sixth CSV column ("true"/"false"), and `updateEntry` is now generic.
- **`src/hooks/useFileImport.ts`**: `parseFile` accepts 5 or 6 columns. Legacy five-column files still import with the flag defaulting to false; the sixth header ("9 Hole") is validated when present; and a row is skipped with a reason when the sixth value is present but unrecognized.
- **`src/mockData/mockScores.ts`**: All mock entries set `isNineHole: false`.

## [2026-04-30]

### Summary

Completed the Tailwind v4 / lucide-react migration by restoring import/export functionality that was dropped in the FluentUI removal commit, fixing dark mode across all UI surfaces, and resolving two bugs (date-clear crash, duplicate `createInitialEntries`). Semantic CSS tokens (`--surface`, `--input-bg`, `--button-bg`, etc.) now drive all color switching so that dark mode requires no `dark:` prefixes in component markup. The `Documentation/` directory was also renamed to `docs/`.

### Added

- **`src/hooks/useFileImport.ts`** — Restored CSV import hook (`useFileImport`, `parseFile`) that was deleted during the FluentUI migration; no FluentUI dependencies, pure FileReader + validation logic.
- **`src/components/ImportResultMessageBar.tsx`** — New Tailwind-only replacement for the deleted FluentUI `ImportResultMessageBar`; shows green/yellow pill badges for imported/skipped counts and a scrollable per-row error list.
- **`src/types/IFileImportResult.ts`** — Restored type deleted during migration.
- **`src/types/ISkippedRow.ts`** — Restored type deleted during migration.
- **`src/lib/constants.ts`** — Restored `COLUMN_HEADERS` constant shared between import validation and export CSV header row.
- **`src/App.tsx`** — Re-added Import CSV button (header, icon-only on mobile) wired to hidden `<input type="file">`.
- **`src/App.tsx`** — Re-added Export Data button, shown below the handicap result after Calculate is clicked.
- **`src/lib/utils.ts`** — Added `calculateHandicap` (moved from `util.ts`); takes the 6 most recent eligible entries, removes highest and lowest scores, averages handicap differentials.

### Changed

- **`src/index.css`** — Added semantic CSS custom properties (`--surface`, `--surface-border`, `--input-bg`, `--input-border`, `--input-text`, `--button-bg`, `--button-text`, `--button-border`, `--alternate-button-bg`) with `:root` (light) and `.dark` overrides, bridged into Tailwind via `@theme inline`. Dark mode now requires no `dark:` prefixes in component markup.
- **`src/App.tsx`** — Entry row cards changed from hardcoded `bg-white` to `bg-surface` semantic token, enabling dark mode card backgrounds.
- **`src/App.tsx`** — All `<input>` elements updated to use `bg-input-bg border-input-border text-input-text` semantic tokens.
- **`src/App.tsx`** — Header buttons updated to use `bg-button-bg border-button-border text-button-text` semantic tokens; text labels hidden on mobile (`hidden sm:inline`) to prevent header wrapping on small screens.
- **`src/App.tsx`** — `createInitialEntries` moved to module scope; on `localhost` loads mock scores, otherwise starts with three blank entries.
- **`docs/`** — Directory renamed from `Documentation/` (`CHANGELOG.md`, `theme-system.md` moved accordingly).

### Fixed

- **`src/App.tsx`** — Clearing the native date picker previously passed an empty string to `parseDateInputValue`, producing an `Invalid Date` that caused `toISOString()` to throw on the next render, blanking the screen. Guard added: empty string now resets to today's date.
- **`src/App.tsx`** — Removed duplicate inner `createInitialEntries` declaration inside `App()` that shadowed the module-level version and caused a TypeScript `TS6133` error.

## [2026-04-08]

### Summary

Migrated Tailwind CSS important-modifier usage from per-class `!` suffixes to a single `@import "tailwindcss" important` directive in `index.css`. This consolidation reduces class-level noise across the component tree. Additionally, the handicap result is now automatically hidden whenever any score-related input changes or a new entry is added, preventing stale results from being displayed.

### Changed

- **`src/index.css`** — Replaced `@import "tailwindcss"` with `@import "tailwindcss" important` to apply Tailwind's important flag at the import level rather than on individual class names.
- **`src/App.tsx`** — Removed per-class `!` important suffixes from all Tailwind class names throughout the component (e.g., `text-base!` → `text-base`, `sm:flex-row!` → `sm:flex-row`, `min-w-[200px]!` → `min-w-[200px]`, etc.), now that importance is handled globally by the CSS import.
- **`src/App.tsx`** — "Add Entry" button `onClick` handler now calls `setHandicapVisible(false)` in addition to `newEntry()`, hiding any displayed handicap result when a new entry row is added.
- **`src/App.tsx`** — Course Rating `onChange` handler now calls `setHandicapVisible(false)` so the cached handicap result clears when the course rating is edited.
- **`src/App.tsx`** — Slope Rating `onChange` handler now calls `setHandicapVisible(false)` alongside `updateEntry`, resetting the handicap display on slope rating edits.
- **`src/App.tsx`** — Score `onChange` handler now calls `setHandicapVisible(false)` alongside `updateEntry`, resetting the handicap display on score edits.
