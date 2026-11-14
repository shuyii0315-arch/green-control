---
name: gc-motion
description: Use when adding or fixing motion on any Green Control component (buttons, segmented control, alert card, toast, meters, plan rail), so every movement uses the system's one curve, feels physical and respects reduced motion.
---

# Animate a Green Control component

Motion here has one job: show what changed, so a person on shift never misses it. It is never decoration.

## The tokens

- One curve for everything that moves: `--ease` = `cubic-bezier(0.2, 0, 0, 1)`.
- One spring, only for things that arrive or come back from a press: `--spring` = `cubic-bezier(0.34, 1.56, 0.64, 1)`.
- Durations: press 80 ms · colour 160 ms · move and resize 300 ms · arrive 420–520 ms. Nothing longer except live progress.

## Recipes

| Component | Motion |
|---|---|
| Button | Scale 0.97 on pointer-down, 80 ms ease-out. Release springs back over 260 ms. Loading keeps its width. |
| Segmented control | The selection slides to the new option (transform + width, 300 ms). It never jumps. |
| Object link | The dot grows to 1.4× with the spring on hover; the underline thickens. |
| Evidence chip | The number pops in (scale 0.4 → 1, spring) when a check lands. Hover lifts 1 px. |
| Confidence meter | Segments fill left to right, 16 ms apart. |
| Alert card | New: the accent edge grows top to bottom once. Hover lifts 2 px with a deeper shadow. |
| Toast | Rises 10 px, scale 0.97 → 1, blur 4 → 0 px. A 1 px line counts down 6 s and pauses on hover. |
| Action row | Running: the bar's sheen flows; width changes ease over 500 ms. |
| Ask input | Error: one short shake (360 ms), then still. |
| AI spark | Thinking: dots pulse in turn. |

## Never

- Animate layout properties (top, left, height). Use transform and opacity.
- Loop slower than 1 s, except live progress.
- Animate on every data update; the figure assembles once per figure.
- Bounce something the person didn't throw.

## Reduced motion

Under `prefers-reduced-motion: reduce`: no movement, no springs, no loops. Keep colour and opacity changes that explain state.

## Done when

Every state change on the component is visible, uses the tokens above, and works with reduced motion on.
