# Theme System

This document describes how light/dark mode works in the handicap calculator app.

## Overview

The app runs **two parallel theme systems simultaneously** — a Tailwind/CSS system for native HTML elements and a Fluent UI system for Fluent components. Both are driven by the same React context, but they apply styling in different ways.

## Files Involved

| File | Role |
|------|------|
| `src/providers/theme-provider.tsx` | Stores theme state, persists to `localStorage`, toggles `.dark` class on `<html>` |
| `src/hooks/use-theme.ts` | Thin hook to consume `ThemeProviderContext` |
| `src/providers/fluent-theme-provider.tsx` | Reads theme context; renders inner `<FluentProvider>` with `webLightTheme` or `webDarkTheme` |
| `src/components/mode-toggle.tsx` | Fluent `Menu` button that calls `setTheme("light" \| "dark" \| "system")` |
| `src/index.css` | Defines `@custom-variant dark`, CSS custom properties, and `.dark` overrides |
| `src/main.tsx` | Renders outer `<FluentProvider theme={lightTheme}>` (always light) wrapping `<App>` |

## System 1 — Tailwind / CSS Dark Mode

`ThemeProvider` manages a `theme: "light" | "dark" | "system"` value.

On every theme change it:
1. Removes `light` and `dark` classes from `document.documentElement`.
2. Adds the resolved class (`system` resolves via `window.matchMedia`).

`index.css` defines the Tailwind dark variant:

```css
@custom-variant dark (&:is(.dark *));
```

This means any element inside an ancestor with the `dark` class responds to `dark:` Tailwind utilities.

Two custom CSS properties bridge Tailwind and the theme:

```css
:root {
  --dark-foreground: #000000;   /* black in light mode */
}

.dark {
  --dark-foreground: #ffffff;   /* white in dark mode */
}
```

These are exposed as Tailwind color tokens via:

```css
@theme inline {
  --color-dark-foreground: var(--dark-foreground);
}
```

`App.tsx` uses these tokens on native elements:
- `bg-white dark:bg-black` — page background
- `text-dark-foreground` — paragraph text, column header labels, inline mobile labels, delete icon, handicap result text

## System 2 — Fluent UI Theme Provider

`FluentThemeProvider` reads the same `useTheme()` context and re-renders the inner `<FluentProvider>` with the matching Fluent theme:

```tsx
const isDark =
  theme === "dark" ||
  (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

<FluentProvider theme={isDark ? webDarkTheme : webLightTheme} style={{ background: "transparent" }}>
```

This controls the appearance of all Fluent UI components: `Input`, `Button`, `Label`, `DatePicker`, `Menu`, etc. Fluent injects its own CSS custom properties (e.g. `--colorNeutralForeground1`, `--colorNeutralBackground1`) scoped to its provider element.

## Nested FluentProviders (Dead Outer Provider)

`main.tsx` wraps `<App>` in an outer `<FluentProvider theme={lightTheme}>` using the custom "The Masters" green brand palette. This provider is **always light** and is effectively overridden by the inner `FluentThemeProvider` for all Fluent component styling. The only active effect of the outer provider is that the `theMasters` brand palette is available for the `bg-primary` button overrides via Tailwind CSS variables — the inner provider uses `webLightTheme` / `webDarkTheme` without the custom brand palette.

## Data Flow Summary

```
User clicks ModeToggle
  → setTheme("dark")
  → localStorage.setItem("app-theme", "dark")
  → ThemeProvider adds .dark to <html>
      → Tailwind dark: utilities activate (bg-black, text-white via --dark-foreground)
  → FluentThemeProvider re-renders with webDarkTheme
      → Fluent components use dark token values
```

## Can Tailwind Dark Mode Be Eliminated?

Yes, it is possible to remove the Tailwind dark layer and rely solely on Fluent UI. Fluent's `webDarkTheme` and `webLightTheme` expose CSS custom properties (e.g. `var(--colorNeutralForeground1)`, `var(--colorNeutralBackground1)`) that already cover foreground and background colors.

To do this you would:
1. Replace `bg-white dark:bg-black` on the main container with an inline style or a class referencing `var(--colorNeutralBackground1)`.
2. Replace all `text-dark-foreground` usages with `var(--colorNeutralForeground1)` (inline style or a small `makeStyles` call).
3. Remove the `--dark-foreground` CSS variable, the `.dark` override block, and the `@custom-variant dark` line from `index.css`.
4. Remove `ThemeProvider` from `App.tsx` and keep only `FluentThemeProvider` (which still reads the persisted preference via `useTheme`, so `ThemeProvider` would need to be kept or its localStorage/`setTheme` logic folded into `FluentThemeProvider`).
5. Remove the always-light outer `<FluentProvider>` from `main.tsx` and pass the `theMasters` brand into the inner provider instead.

The tradeoff: Fluent tokens are not natively available as Tailwind utilities, so you would either use inline styles, CSS variable references in Tailwind's arbitrary value syntax (`text-[var(--colorNeutralForeground1)]`), or adopt Fluent's `makeStyles` for those elements. The current dual-system approach avoids that friction at the cost of maintaining two parallel theme mechanisms.
