# Changelog

All notable changes are documented in this file.

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
