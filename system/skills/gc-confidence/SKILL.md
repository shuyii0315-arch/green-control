---
name: gc-confidence
description: Use before designing any Green Control AI result, to decide from the AI's confidence what it may show and do (check, draft or plan), and whether competing causes must be listed.
---

# Decide what the AI may do

Green Control's first rule is *evidence first, people decide*. How far the AI may go depends on how sure it is. Make this call before any layout or wording.

## The bands

| Confidence | Band | The AI may | The screen shows |
|---|---|---|---|
| 80 and up | plan | propose a plan | plan rail + Apply |
| 50–79 | draft | draft a plan | "Draft" label, evidence open, Review before Apply |
| below 50 | check | only suggest a check | no plan; competing causes + one suggested check + Assign |

Thresholds live in `tokens.json` as `ai.confidence.act` (80) and `ai.confidence.review` (50). Read them; never hard-code.

## How to decide

1. Find the number. If the brief gives none, ask for it. Never pick one to make a screen look better.
2. Map it to a band with the table.
3. List competing causes whenever more than one is still possible, in the draft band as well as below 50. The leading cause carries the confidence; the others read "maybe" (draft) or all read "possible" (below 50).
4. Below 50, write the one check that would tell the causes apart. It is the suggestion, not an evidence card.
5. In every band: Apply needs a person's tap, and every applied step can be undone.

## Output

Write down the band, the reason, and what the screen must and must not show, before building:

```
Band: check (41%)
Why: the data fits three causes equally
Show: causes list (all "possible"), suggested check, Assign
Do not show: any fix, Apply, a plan rail
```

## Examples

- "The AI is 41% sure the door is slow because of debris. What do we show?" → check band, three causes, suggest one site visit.
- "88% sure charging BT-01 tonight avoids the peak." → plan band, plan + Apply + Undo.

## Pairs with

`gc-evidence` (what to show as proof) · `gc-ai-voice` (how to say it) · `gc-build-screen`.
