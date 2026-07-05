# Changelog

All notable changes are documented in this file.

## [2026-07-05]

### Summary

Added on-screen sorting for score entries (issue #28). Two Radix Select controls let the user reorder the entered rounds by Date, Course, or Score in ascending or descending order, defaulting to Date/Descending (newest first). Sorting is presentational only: it reorders the rows on screen without affecting the handicap calculation or CSV import/export.

### Added

- **`src/types/sort.ts`**: `SortBy` (`"date" | "course" | "score"`) and `SortOrder` (`"asc" | "desc"`) string-union types.
- **`src/components/ui/select.tsx`**: shadcn/Radix Select primitive wrappers (`Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`).
- **`src/components/SortControls.tsx`**: Two labeled Select controls ("Sort by", "Order") wired to `aria-labelledby` for accessible names.
- **`src/lib/utils.ts`**: `sortEntries(entries, sortBy, order)`, a pure function returning a new array. Empty or whitespace-only course names always sink to the bottom regardless of direction, and an exhaustiveness guard turns an unhandled `SortBy` into a compile error.

### Changed

- **`src/App.tsx`**: Added `sortBy`/`order` state (default Date/Descending), change handlers that re-sort on selection, initial entries sorted on mount, imported CSV rows sorted on import, and mounted `SortControls` above the entry list.
- **`tests/app.spec.ts`**: Added a "sorting controls" suite covering the default Date/Descending order, sorting by Course, and reversing via the Order control. The win32 visual snapshot was regenerated; the Linux Playwright baseline still needs regeneration in CI.

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
