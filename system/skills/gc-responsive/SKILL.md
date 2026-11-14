---
name: gc-responsive
description: Use when a Green Control component or screen must work from a 375px phone to a 1440px control-room display, to decide what wraps, what truncates, what stacks and what hides.
---

# Fit every width

The same alert is read on a control-room wall and on a technician's phone. Decide how each part behaves, don't leave it to the browser.

## Widths to check

375 (phone) · 768 (tablet) · 1180 (laptop) · 1440 (desk).

## Rules

- **Names truncate, numbers never do.** A machine name gets an ellipsis; a value, unit or confidence always shows in full.
- **Tags stay on one line.** State tags and statuses don't wrap; shorten the word instead ("60%" not "Running · 60%").
- **Rows stack below 720px.** Label above value; actions drop to their own line, left-aligned.
- **Touch targets 44px** on phone widths, even if the button looks smaller.
- **The AI panel** (400px) becomes a bottom sheet below 1024px; the drawing stays on top.
- **Evidence row** goes from a row of cards to a vertical list below 720px; numbers stay.
- **Never hide** the one action (Apply, Assign) or the confidence. Hide decoration first: dot field, captions.

## Check

Open each width. Nothing overflows, nothing important is cut, the accent still marks only one thing.
