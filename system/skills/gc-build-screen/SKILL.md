---
name: gc-build-screen
description: Use when building or changing a Green Control screen or component, so it uses only the system's tokens and components, works in night and day, and keeps one accent for what needs a person.
---

# Build a Green Control screen

Read `DESIGN.md` and `tokens.json` first: https://shuyii0315-arch.github.io/green-control/system/files/DESIGN.md · https://shuyii0315-arch.github.io/green-control/system/files/tokens.json

## Start

1. Decide the band with `gc-confidence` and the evidence with `gc-evidence`. Layout comes after.
2. Copy `shell.html` (https://shuyii0315-arch.github.io/green-control/system/files/shell.html) and keep its frame: rail (64px) · stage with the figure and the evidence row · frosted AI panel (400px) on the right.
3. Use the components. In React: `npx shadcn@latest add https://shuyii0315-arch.github.io/green-control/system/r/<name>.json` (registry: https://shuyii0315-arch.github.io/green-control/system/r/registry.json). In plain HTML: `green-control-components.css`.

## Always

- Only tokens, through CSS variables. No new colours, sizes, radii or shadows.
- Both themes: set `data-gc="night"` or `"day"` on the root and check both.
- Calm by default: the screen is greys and the drawing. One accent per screen, only for the problem or the one action to take.
- Square corners. Round only for status dots and spinners.
- Sans for sentences; mono 11px uppercase for labels, data and time.
- Reuse a component before making one. If none fits, stop and ask the designer.
- The spark appears only where the AI speaks or acts.
- Every applied step: a toast with Undo, and a row on the Actions timeline.

## Pairs with

`gc-draw-equipment` (the figure) · `gc-ai-voice` (the words) · `gc-review` (before handing back).
