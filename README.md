# Golf Handicap Calculator

A browser-based tool for calculating a golf handicap index from manually entered round scores. Users enter one or more rounds with course details, and the app computes a handicap differential for each round, then derives the overall handicap index.

## How the calculation works

Given the entered round(s), it:

1. Sorts all rounds by date and takes the most recent six.
2. Removes the single lowest and single highest score from that set (if there 3 or more rounds).
3. Calculates the **handicap differential** for each remaining round using the USGA formula:

$$\text{Differential} = \frac{(\text{Score} - \text{Course Rating}) \times 113}{\text{Slope Rating}}$$

1. Averages the differentials and rounds the result to one decimal place — that is the reported **handicap index**.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Language | TypeScript 5.9 |
| Build tool | Vite 8 |
| UI components | shadcn/ui v4 |
| Styling | Tailwind CSS v4 |
| Linting | ESLint 9 with `typescript-eslint` |

## Project structure

```
src/
  App.tsx              # Root component — all UI and state live here
  main.tsx             # React entry point
  index.css            # Global styles
  types/
    IEntry.ts          # IEntry interface (id, date, courseName, courseRating, slopeRating, score)
  lib/
    util.ts            # calculateHandicap() — pure calculation logic
  mockData/
    mockScores.ts      # Sample IEntry data for local development/testing
```

## Getting started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173` by default.

## Available scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Vite dev server with hot module replacement |
| `npm run build` | Type-check with `tsc` and produce a production build in `dist/` |
| `npm run preview` | Serve the production build locally for verification |
| `npm run lint` | Run ESLint across the entire project |

## Key implementation notes

- **All state is client-side.** There is no backend or persistence layer. Data is lost on page refresh.
- **`IEntry` is the central data type.** Every round is represented as an `IEntry` object. The `id` field is a `crypto.randomUUID()` value used as the React list key and for targeted state updates.
- **`calculateHandicap` is a pure function** in `src/lib/util.ts`. It receives the full `IEntry[]` array and returns the computed handicap index as a `number`. Logic changes to the formula belong there.
- **Course rating input uses a local string buffer** (`courseRatingInput` state) to support decimal typing without React interfering mid-keystroke. The parsed `number` is committed to the entry on `onBlur`.
