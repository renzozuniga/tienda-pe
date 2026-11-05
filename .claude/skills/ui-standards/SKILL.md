---
name: ui-standards
description: Use when creating or changing any screen, component or style in apps/web (pages, forms, product cards, cart, checkout, admin panel). Enforces the MAO Systems tokens, the base components, mobile-first layout, loading/empty/error states and es-PE copy.
---

# UI standards for apps/web

The design system is MAO Systems: tokens in `apps/web/src/styles/tokens.css`, base components in
`apps/web/src/components/`, living catalog at `/design` (`pages/DesignPage.tsx`).

## Steps

1. **Reuse before you build.** Compose screens from `Button`, `Input`, `Select`, `Card`, `Badge`,
   `StockBadge`, `Price`, `EmptyState` and `Skeleton` (import from `../components`). If a new base component
   is truly needed, add it to `components/`, export it from `components/index.ts` and show it on `/design`
   in the same change.
2. **Style only with semantic tokens.** In CSS Modules use `var(--color-*)`, `var(--space-*)`,
   `var(--text-*)`, `var(--radius-*)`, `var(--font-*)`. No hex, `rgb()`/`hsl()`, raw `--mao-*` tokens, inline
   colors or magic pixel sizes. A new token goes in `tokens.css` with light and dark values.
3. **Money.** Prices arrive in céntimos with IGV included; render them with `<Price cents={…} />` (or
   `formatPEN`). Never divide by 100 in a component.
4. **States.** Every screen that loads data renders loading (`Skeleton` sized like the content, container with
   `aria-busy`), empty (`EmptyState`) and error (`EmptyState tone="danger"` with a retry action).
5. **Mobile-first.** Write the base styles for a 400 px wide screen, then add `min-width` media queries. Touch
   targets keep `--control-height` (44 px). No horizontal scroll.
6. **Accessibility.** Real `<button>`/`<a>`, labels on every field (`Input`/`Select` do it), visible focus,
   state never conveyed by color alone (`Badge dot`), headings in order.
7. **Copy.** Latin American Spanish, address the buyer as "tú", say what happened and what to do next.
   Product and district names come from data, not from code.
8. **Verify.**
   - `pnpm --filter @tienda/web test` (includes `design-system.test.ts`, which fails on literal colors).
   - `pnpm --filter @tienda/web typecheck`.
   - Open the screen in the browser at 400 px and at 1280 px, in light and dark, and check the console.
