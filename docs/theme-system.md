# Theme System

This document describes how light/dark mode works in the handicap calculator app.

## Overview

Theming is driven entirely by **semantic CSS custom properties** defined in `src/index.css`. Tailwind v4 bridges those variables into utility classes via `@theme inline`, so markup uses plain class names like `bg-app-background` and `text-input-text` with no `dark:` prefixes. Dark mode is a single `.dark` class toggled on `<html>`; every token is redeclared under `.dark`, so the same utility class resolves to a different value automatically.

Fluent UI is no longer used — it was removed during the Tailwind v4 migration.

## Files Involved

| File | Role |
|------|------|
| `src/providers/theme-provider.tsx` | Stores `"light" \| "dark" \| "system"` in state, persists to `localStorage` (`storageKey`, default `"app-theme"`), and toggles the `.dark` class on `document.documentElement` |
| `src/hooks/use-theme.ts` | Thin hook to consume `ThemeProviderContext` |
| `src/components/ModeToggle.tsx` | Base UI `Menu` (via `src/components/ui/dropdown-menu.tsx`) that calls `setTheme("light" \| "dark" \| "system")` |
| `src/index.css` | Defines all theme tokens in `:root` and `.dark`, and maps them to Tailwind color names via `@theme inline` |

## How It Works

When the user picks a theme, `ThemeProvider` persists the choice to `localStorage` and a `useEffect` adds or removes the `.dark` class on `<html>`:

- `"light"` → removes `.dark`
- `"dark"` → adds `.dark`
- `"system"` → follows `prefers-color-scheme` and subscribes to changes

`index.css` declares each semantic token twice — once in `:root` (light) and once in `.dark` — then maps them into Tailwind color names in the `@theme inline` block:

```css
@theme inline {
  --color-app-foreground: var(--app-foreground);
  --color-app-background: var(--app-background);
  --color-input-bg: var(--input-bg);
  /* ...etc */
}
```

This makes `text-app-foreground`, `bg-app-background`, `bg-input-bg`, and friends ordinary Tailwind classes whose resolved values flip with the `.dark` class. The `@custom-variant dark (&:is(.dark, .dark *))` line wires Tailwind's `dark:` variant to the same `.dark` class for the rare cases markup needs it (e.g. `dark:hover:bg-white/10`).

## Data Flow

```
User selects a theme in ModeToggle
  → setTheme("dark")
  → localStorage.setItem("app-theme", "dark")
  → ThemeProvider effect adds `.dark` to <html>
      → every --token under .dark takes effect
          → bg-app-background, text-input-text, bg-surface, etc. update automatically
```

## Color Classes in Use

| Class | Resolves To (token) | Used For |
|-------|---------------------|----------|
| `bg-app-background` | `var(--app-background)` | Page background |
| `text-app-foreground` | `var(--app-foreground)` | Body text, labels, icons |
| `bg-surface` | `var(--surface)` | Entry row cards |
| `bg-input-bg` / `text-input-text` / `border-input-border` | input tokens | Form fields |
| `bg-button-bg` / `text-button-text` | button tokens | Buttons |
| `bg-primary` / `text-primary-foreground` | brand green `#4E705C` / white | Header and footer |

`--primary` and `--primary-foreground` are declared in both `:root` and `.dark` with the same value — the brand green does not change between modes.

## Adding New Color Needs

For a color that should adapt to light/dark:

1. Add the token to **both** `:root` and `.dark` in `index.css` (e.g. `--my-token`).
2. Map it in the `@theme inline` block: `--color-my-token: var(--my-token);`.
3. Use it as a normal Tailwind class: `bg-my-token`.

Skipping step 1 (declaring it only in `:root`) means the color won't change in dark mode. Skipping step 2 means the class won't exist as a Tailwind utility — see the project note on Tailwind v4 CSS-variable bridging.
