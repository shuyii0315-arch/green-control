---
name: gc-motion
description: Use when adding or fixing motion on any Green Control component (buttons, segmented control, alert card, toast, meters, plan rail, panels), so every movement picks its curve and duration from what it does, feels like one product and respects reduced motion.
---

# Animate a Green Control component

Motion here has one job: show what changed, so a person on shift never misses it. It is never decoration.

## Pick by what the movement does

First say what the thing is doing, then take the token. Never pick a number by feel.

| What moves | Duration | Curve |
|---|---|---|
| Hover, press | `feedback` 120 ms | `ease` |
| A label, chip or popover arriving / leaving | `small-in` 240 ms / `small-out` 160 ms | `ease` / `exit` |
| A panel or sheet arriving / leaving | `in` 420 ms / `out` 280 ms | `ease` / `exit` |
| The layout changes (rail folds, overview to equipment) | `move` 520 ms | `ease` |
| The drawing turns or zooms | `camera` 900 ms | `ease` |
| Something new lands (toast, badge, a check) | `in` 420 ms or `move` 520 ms | `spring` |
| Something in progress (thinking, spinner, scan) | `loop` 1200 ms | `wave`, or `linear` if it spins |
| Something live (live dot, hot-spot pulse) | `ambient` 2400 ms | `wave` |

Curves: `ease` = `cubic-bezier(0.2, 0, 0, 1)` · `exit` = `cubic-bezier(0.4, 0, 1, 1)` · `spring` = `cubic-bezier(0.34, 1.56, 0.64, 1)` · `wave` = `cubic-bezier(0.45, 0, 0.55, 1)` · `linear`.

Why: one list means every screen moves at the same rhythm, and a machine can check it. Leaving is one step shorter than arriving, because what arrives needs to be seen and what leaves does not.

## Recipes

| Component | Motion |
|---|---|
| Button | Scale 0.97 on press (`feedback`). Release springs back over `small-in`. Loading keeps its width. |
| Segmented control | The selection slides to the new option (`small-in`). It never jumps. |
| Object link | The dot grows to 1.4× with the spring on hover; the underline thickens (`feedback`). |
| Evidence chip | The number pops in with the spring when a check lands. |
| Confidence meter | Segments fill left to right, 16 ms apart. |
| Alert card | New: the accent edge shows until it is opened. The card itself does not move on hover; only its button and link do. |
| Toast | Arrives with the spring (`move`), leaves with `exit` (`small-out`). A 1 px line counts down 6 s and pauses on hover. |
| Action row | Running: the bar's sheen flows (`loop`, `linear`); width changes over `small-in`. |
| Ask input | Error: one short shake (`small-in`), then still. |
| AI spark | Thinking: dots pulse in turn (`loop`, `wave`). |

## Never

- A duration or curve that is not in the list above. One-off sequences (the figure assembling, the scan) live inside their component and are marked as exceptions.
- Animate layout properties (top, left, height). Use transform and opacity.
- Animate on every data update; the figure assembles once per figure.
- Bounce something the person didn't throw.

## Reduced motion

Under `prefers-reduced-motion: reduce`: no movement, no springs, no loops. Keep colour and opacity changes that explain state.

## Done when

Every state change on the component is visible, takes its duration and curve from the list above, and works with reduced motion on.
