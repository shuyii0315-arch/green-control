---
name: gc-a11y
description: Use when building or reviewing any Green Control component, so it works by keyboard, reads clearly in both themes, and makes sense to a screen reader.
---

# Make a component accessible

People run plants at night, on shared screens, sometimes by keyboard only. Every component must work for them.

## Keyboard

- Everything clickable is reachable with Tab, in reading order, and works with Enter or Space.
- Focus ring on every focusable element: 1.5px in the text colour, 2px outside. Never remove it.
- Segmented control and tabs: arrow keys move between options.
- Esc closes anything that opened (peek, toast, sheet).

## Contrast (both themes)

- Text 4.5:1 against what it sits on, including muted text on raised and chip backgrounds.
- Meters, dots and glyphs 3:1.
- Never colour alone: an issue has a triangle and a word, not just orange.

## Screen readers

- Buttons have a label, even icon-only ones (`aria-label="Send"`).
- Segmented options use `aria-pressed`; the group has `aria-label`.
- The confidence meter is `role="meter"` with `aria-valuenow`.
- Loading sets `aria-busy`; the toast is `role="status"` so its message is read.
- Object links say what they open ("Chiller 2"), not "click here".

## Motion

Respect `prefers-reduced-motion` (see `gc-motion`).

## Check

Run `python3 tools/gc_check.py` (contrast, focus rings, unlabeled buttons). Then tab through the component once with the mouse unplugged.
