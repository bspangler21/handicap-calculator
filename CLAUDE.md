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

## Tech Stack

| Layer | Library | Version |
|---|---|---|
| UI | React | 19.x |
| Build | Vite + `@vitejs/plugin-react-swc` | 7.x / 3.x |
| Language | TypeScript | 5.x |
| Routing | React Router | 7.x |
| Styling | Tailwind CSS (via `@tailwindcss/vite`) | 4.x |
| Components | shadcn/ui (Radix UI + Tailwind) | latest |
| Server state | TanStack Query | 5.x |
| Client state | Zustand | 5.x |
| Icons | Lucide React | latest |
| Dates | date-fns | 4.x |
| Toasts | Sonner | 2.x |
| Package manager | npm | — |

---

## Folder Structure

```
src/
├── components/       # Shared UI components
│   └── ui/           # shadcn/ui primitives (do not edit manually)
├── pages/            # Route-level components
├── hooks/            # Custom hooks (feature subdirs when growing)
├── lib/              # Utilities (cn, formatters, helpers)
├── types/            # TypeScript interfaces and types
├── providers/        # React context providers
└── generated/        # Auto-generated code (do not edit manually)
```

---

## File Naming

| What | Convention | Example |
|---|---|---|
| Components | PascalCase `.tsx` | `StatusBadge.tsx` |
| Pages | PascalCase `.tsx` | `AccountDetail.tsx` |
| Hooks | camelCase `.ts` | `useAccountAdjustments.ts` |
| Utilities | camelCase `.ts` | `dateUtils.ts`, `utils.ts`, `formatDate.ts` |
| Types | PascalCase `.ts` | `Department.ts` |
| Providers | PascalCase `.tsx` | `AuthProvider.tsx` |
| Styles | Root `index.css` only | — |

---

## Component Conventions

- **Functional components only** — no class components
- **Named exports** — `export function StatusBadge(...)`, never `export default`
- **Props interface above the function**, not inline or in a separate file:

```tsx
interface StatusBadgeProps {
  status: GrantStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  // ...
}
```

- **No barrel files** — import components by direct path
- **React.memo** only when profiling confirms a re-render problem
- Refactor files that exceed **250 lines**

---

## Hook Conventions

- Prefix: `use` (camelCase, e.g., `useIsMobile`, `usePlanningRows`)
- Store in `/src/hooks/` — use feature subdirs when there are multiple related hooks
- Wrap TanStack Query with a named hook; never call `useQuery` directly in a component:

```ts
// src/hooks/useAccountAdjustments.ts
const QUERY_KEY = (accountNumber: string, year: number) =>
  ["account-adjustments", accountNumber, year] as const;

export function useAccountAdjustments(accountNumber: string, year: number) {
  return useQuery({
    queryKey: QUERY_KEY(accountNumber, year),
    queryFn: async () => { /* ... */ },
    staleTime: 30_000,
  });
}
```

---

## TypeScript

- **Strict mode on**: `"strict": true`, `noUnusedLocals`, `noUnusedParameters`
- **No `any`** — use `unknown` + type guards when shape is truly unknown
- **`import type`** for type-only imports (required by `verbatimModuleSyntax`):

  ```ts
  import type { GrantApplication } from "@/types/Grants";
  ```

- **Path alias** `@/*` → `src/*` — use everywhere, no relative `../../` chains
- **Enums as const objects** with extracted type:

  ```ts
  export const Status = { Draft: 0, Submitted: 1 } as const;
  export type Status = (typeof Status)[keyof typeof Status];
  ```

---

## Styling

- **Tailwind v4** via Vite plugin — no `tailwind.config.js`, config lives in `index.css`
- Import in `index.css`: `@import "tailwindcss"`
- **shadcn/ui** components live in `/src/components/ui/` — do not edit these directly; extend them by wrapping
- **`cn()` utility** in `/src/lib/utils.ts` for conditional class merging:

  ```ts
  import { clsx } from "clsx";
  import { twMerge } from "tailwind-merge";
  export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
  }
  ```

- **Dark mode** via `ThemeProvider` context + localStorage; CSS custom properties for theme tokens
- **Lucide React** for all icons — tree-shakeable, import only what you need

---

## State Management

| Scope | Tool |
|---|---|
| Server / async data | TanStack Query (`useQuery` / `useMutation`) |
| Global UI (theme, filters, user prefs) | Zustand store |
| Local component state | `useState` |
| Auth | React Context + `useAuth()` hook |

Zustand stores live in `/src/stores/` when used.

---

## Exports & Imports

```ts
// ✅ Named export
export function MyComponent() { ... }

// ✅ Path alias import
import { MyComponent } from "@/components/MyComponent";
import type { MyType } from "@/types/my-types";

// ❌ Default export
export default function MyComponent() { ... }

// ❌ Barrel re-export index files
export * from "./MyComponent";
```

---

## Formatting (Prettier)

```json
{
  "printWidth": 100,
  "useTabs": true,
  "semi": true,
  "singleQuote": false,
  "trailingComma": "es5",
  "arrowParens": "always"
}
```

---

## Linting (ESLint)

Flat config (`eslint.config.js`), plugins:

- `@eslint/js` recommended
- `typescript-eslint` recommended
- `eslint-plugin-react-hooks` recommended
- `eslint-plugin-react-refresh` vite preset

Build script runs typechecking before bundling: `"build": "tsc -b && vite build"`

---

## Code Quality Rules

- **No comments** unless explaining a non-obvious constraint or workaround — not what the code does
  - Comments start with `//--` so they can easily be searched when learning/reviewing a codebase
- **No `any`** — TypeScript strict mode enforces this at the compiler
- **No unused variables or parameters** — `noUnusedLocals` + `noUnusedParameters` catch these
- **No premature abstraction** — three similar lines is fine; extract only when there's a fourth
- **No error handling for impossible cases** — trust TypeScript's type guarantees
- **Accessibility**: `aria-label` on interactive elements, keyboard navigation, sufficient contrast

---

## Provider Hierarchy

```tsx
<ThemeProvider>
  <QueryProvider>        {/* TanStack Query client */}
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </QueryProvider>
</ThemeProvider>
```

---
