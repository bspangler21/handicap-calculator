# Theme System

This document describes how light/dark mode works in the handicap calculator app.

## Overview

Fluent UI is the **single source of truth** for all colors. Tailwind is used only for layout and spacing. There is no parallel CSS dark-mode system — no `dark:` variant, no `.dark` class toggled on `<html>`.

## Files Involved

| File | Role |
|------|------|
| `src/providers/theme-provider.tsx` | Stores `"light" \| "dark" \| "system"` in state, persists to `localStorage`, exposes `setTheme` via context |
| `src/hooks/use-theme.ts` | Thin hook to consume `ThemeProviderContext` |
| `src/providers/fluent-theme-provider.tsx` | Reads theme context; renders `<FluentProvider>` with the matching custom theme; owns the `theMasters` brand palette and both theme objects |
| `src/components/ModeToggle.tsx` | Fluent `Menu` button that calls `setTheme("light" \| "dark" \| "system")` |
| `src/index.css` | Defines static brand CSS variables and bridges Fluent tokens into Tailwind via `@theme inline` |

## How It Works

When the user toggles the theme, `ThemeProvider` persists the choice to `localStorage`. `FluentThemeProvider` reads that choice and re-renders `<FluentProvider>` with either `lightTheme` or `darkTheme` (both built from the `theMasters` brand palette). Fluent then injects its CSS custom properties — `--colorNeutralForeground1`, `--colorNeutralBackground1`, etc. — onto the provider element.

`index.css` maps two of those tokens into Tailwind color names:

```css
@theme inline {
  --color-app-foreground: var(--colorNeutralForeground1);
  --color-app-background: var(--colorNeutralBackground1);
}
```

This means `text-app-foreground` and `bg-app-background` are ordinary Tailwind classes whose resolved values are controlled entirely by whichever Fluent theme is active.

## Data Flow

```
User clicks ModeToggle
  → setTheme("dark")
  → localStorage.setItem("app-theme", "dark")
  → FluentThemeProvider re-renders with darkTheme
      → Fluent injects --colorNeutralForeground1, --colorNeutralBackground1, etc.
          → text-app-foreground and bg-app-background update automatically
          → All Fluent components (Input, Button, DatePicker, etc.) update automatically
```

## Color Classes in Use

| Class | Resolves To | Used For |
|-------|-------------|----------|
| `bg-app-background` | `var(--colorNeutralBackground1)` | Page background |
| `text-app-foreground` | `var(--colorNeutralForeground1)` | Body text, labels, icons |
| `bg-primary` | `#4E705C` (static) | Header and footer background |
| `text-primary-foreground` | `#ffffff` (static) | Text on header/footer |

`--primary` and `--primary-foreground` are static CSS variables — the brand green does not change between light and dark modes.

## The `theMasters` Brand Palette

The custom "The Masters" green brand ramp lives in `src/providers/fluent-theme-provider.tsx`. It drives both `lightTheme` and `darkTheme` via Fluent's `createLightTheme` / `createDarkTheme` helpers, so Fluent components use the brand green for focus rings, primary buttons, etc. The dark theme gets two foreground overrides so brand text remains readable on dark backgrounds:

```ts
darkTheme.colorBrandForeground1 = theMasters[110];
darkTheme.colorBrandForeground2 = theMasters[120];
```

## Adding New Color Needs

For a color that should adapt to light/dark: find the appropriate Fluent token (`--colorNeutral*`, `--colorBrand*`, etc.) and either use it as an arbitrary Tailwind value (`text-[var(--colorNeutralForeground2)]`) or add a named mapping to the `@theme inline` block in `index.css`.

For a static brand color: add a CSS variable to `:root` in `index.css` and map it in `@theme inline`.
