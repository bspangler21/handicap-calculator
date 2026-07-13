# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite HMR)
npm run build     # Type-check + production build (tsc -b && vite build)
npm run lint      # ESLint
npm run preview   # Preview production build locally
```

No test runner is configured in this project.

## Architecture

Single-page React app with no routing. All UI lives in `src/App.tsx` — one component managing the full page. Business logic lives in `src/lib/util.ts`.

**Data flow:**

- `IEntry` (`src/types/IEntry.ts`) is the core data type: `{ id, date, courseName, courseRating, slopeRating, score }`
- `App.tsx` holds `entries: IEntry[]` in state; each row in the UI maps to one entry
- Course Rating uses a separate `courseRatingInput` state (keyed by entry ID) to buffer the raw string while the user types decimals, flushed to the entry on blur
- `calculateHandicap` in `src/lib/util.ts` takes the 6 most recent entries, drops the lowest and highest scores, then averages `(Score - Course Rating) * 113 / Slope Rating` across the remaining entries

**UI stack:**

- Fluent UI v9 (`@fluentui/react-components`) for all form controls and typography; theme defined in `src/main.tsx` using a custom "The Masters" green brand palette
- Tailwind CSS v4 (via `@tailwindcss/vite` plugin) for layout; CSS custom property `--background` holds the header/footer green (`#4E705C`)
- Responsive layout: column headers and row direction switch at Tailwind's `sm` breakpoint (≥640px); mobile shows stacked fields with inline labels

**No backend, no persistence** — all state is in-memory and resets on page reload. `src/mockData/mockScores.ts` exists but is not imported anywhere.
