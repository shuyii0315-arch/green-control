---
name: gc-states
description: Use when building or reviewing a Green Control component, to list and draw every state it can be in, so nothing is left for the AI or the engineer to guess.
---

# Draw every state

A state you don't draw gets drawn differently every time. List them all, then draw them all.

## Step 1 · List the states in three groups

1. **Things a person does:** default, hover, focus (keyboard), pressed, disabled.
2. **Things the system does:** loading or sending, success, error (says why and how to recover), empty, stale (old data).
3. **Things the AI decides:** the three confidence bands (check below 50, draft 50–79, plan 80+), checking vs landed, linked (hovered elsewhere).

Not every component has all of them. Cross out the ones that can't happen and say why.

## Step 2 · Draw each one

- Same size and content in every state, so only the state changes.
- Night and day.
- Long content too: the longest machine name, two-line titles (see `gc-break-ui`).

## Step 3 · Write each state down

For every state: its name, one line on when it happens, and how it is set in code (a prop like `status="failed"`, or "happens by itself" for hover, focus and pressed).

## Green Control examples

| Component | States |
|---|---|
| Button | default · hover · focus · pressed · loading · disabled |
| Action row | planned · running · done · undone · failed (always with a reason) |
| Owner row | suggested · assigning · assigned (with Undo) |
| Causes & check | below 50 (all "possible") · draft (first "likely") |

## Done when

Every state in the list is drawn in both themes, and each has one line saying when it happens.
