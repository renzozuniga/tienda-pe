---
name: money-pen
description: Use whenever code handles prices, totals, discounts, shipping costs, IGV or any amount in soles (cart, order, checkout, admin price editing, reports). Keeps money as integer céntimos with IGV included and formats only for display.
---

# Money in soles (PEN)

Rules from ADR-0002 and `docs/glossary.md`:

1. **Integers in céntimos.** Every amount is an integer named `*Cents` (`priceCents`, `shippingCents`,
   `totalCents`) with `currency = "PEN"`. No `number` with decimals, no `Decimal`, no `toFixed` in logic.
2. **IGV is included.** Stored and displayed prices already include IGV (18 %). Never add IGV on top.
3. **Breaking down IGV** (only if a screen or document needs it): `valueCents = Math.round(totalCents / 1.18)`
   and `igvCents = totalCents - valueCents`, computed once on the order total, never per line and summed.
4. **Order totals.** `subtotalCents = Σ(unitPriceCents × quantity)`; `totalCents = subtotalCents + shippingCents`.
   Copy `unitPriceCents` into each order line at purchase time; never recompute an old order from current
   product prices.
5. **Input from humans** (admin price field): parse soles text to céntimos once at the edge, accepting
   `38.9`, `38.90` and `38,90`, and reject more than 2 decimals. Validate with Zod as an integer ≥ 0 after
   parsing.
6. **Display.** Only `formatPEN` / `<Price>` turn céntimos into text (`S/ 38.90`, with a non-breaking space).
7. **Tests.** Assert integers, cover rounding at .5 céntimo, quantities > 1 and a zero-price edge case.
