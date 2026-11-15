---
name: gc-build-screen
description: Use to build or change a Green Control screen from the shell, the components and the tokens only, in night and day, after the band and the evidence are decided.
---

# Build the screen

Step 3 of 7 in the Green Control flow (index: `green-control`). The one idea: **evidence first, people decide.**
Read `DESIGN.md` and `tokens.json` first: https://shuyii0315-arch.github.io/green-control/system/files/DESIGN.md · https://shuyii0315-arch.github.io/green-control/system/files/tokens.json

Read `DESIGN.md` and `tokens.json` first: https://shuyii0315-arch.github.io/green-control/system/files/DESIGN.md · https://shuyii0315-arch.github.io/green-control/system/files/tokens.json

### Start

1. Decide the band with `gc-confidence` and the evidence with `gc-evidence`. Layout comes after.
2. Copy `shell.html` (https://shuyii0315-arch.github.io/green-control/system/files/shell.html) and keep its frame: rail (64px) · stage with the figure and the evidence row · frosted AI panel (400px) on the right.
3. Use the components. In React: `npx shadcn@latest add https://shuyii0315-arch.github.io/green-control/system/r/<name>.json` (registry: https://shuyii0315-arch.github.io/green-control/system/r/registry.json). In plain HTML: `green-control-components.css`.

### Always

- Only tokens, through CSS variables. No new colours, sizes, radii or shadows.
- Both themes: set `data-gc="night"` or `"day"` on the root and check both.
- Calm by default: the screen is greys and the drawing. One accent per screen, only for the problem or the one action to take.
- Square corners. Round only for status dots and spinners.
- Sans for sentences; mono 11px uppercase for labels, data and time.
- Reuse a component before making one. If none fits, stop and ask the designer.
- Each look rule in DESIGN.md says why. Before you break one, read its reason; and check the "Same everywhere, varies by rule" table to see whether what you want to change is allowed to vary. If the case is really new, change that table first, then build.
- The spark appears only where the AI speaks or acts.
- Every applied step: a toast with Undo, and a row on the Actions timeline.

## Next

`gc-review`.
