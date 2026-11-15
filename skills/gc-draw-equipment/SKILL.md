---
name: gc-draw-equipment
description: Use when a Green Control screen needs a drawing of a machine: the rules the drawing must meet (real structure, 62° isometric, one faulty part lit, one scale per batch). The drawing itself is made with the anatomy-figure skill.
---

# Draw the machine

Step 4 of 7 in the Green Control flow (index: `green-control`). The one idea: **evidence first, people decide.**
Read `DESIGN.md` and `tokens.json` first: https://shuyii0315-arch.github.io/green-control/system/files/DESIGN.md · https://shuyii0315-arch.github.io/green-control/system/files/tokens.json

Green Control never shows a machine as a table or an icon. Every equipment screen is built around a drawing of the real machine.

### The drawing

- Isometric line art, made with the **anatomy-figure** skill (a third-party skill; this one sets the rules it must meet). Night render: dark, transparent background. Also a day render.
- Research the real machine first and draw it as it is (where the motor, door, cells or pipes really sit).
- View: 62° azimuth, standard isometric elevation. One batch of drawings shares one scale.
- **Exactly one part is lit, in the accent: the part with the problem.** Everything else stays grey. The lit part needs enough detail to be recognised on its own.
- Outlines bright enough to read at small sizes.

### On the drawing

- `.alab` glass labels (key + value, mono); `.hot` only on the problem.
- Numbered `.amark`s where each piece of evidence was read; numbers match the evidence chips and cards (see `gc-evidence`).
- Caption bottom-right in mono: `Fig. 02 — Chiller plant, iso 62°`.

### Around it

- Dot field behind the figure (0.55px dots, 4.2px pitch), fading before the edges; never behind text.
- A soft pool of light under the object in focus.
- When a screen opens on a new figure, it assembles once from its own points (`gc-assemble.js`). Never on every update; off under reduced motion.

### Check before using

Real structure? One part lit? Same scale as the rest of the batch? Readable small? If unsure, put it on the review desk (`gc-learn-rule`).

## Next

`gc-build-screen`.
