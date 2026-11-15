---
name: gc-confidence
description: Use before building any Green Control screen or AI answer, to decide from the AI's confidence whether it may only suggest a check (below 50), draft a plan (50–79) or propose a plan (80+), and write the decision down.
---

# Decide what the AI may do

Step 1 of 7 in the Green Control flow (index: `green-control`). The one idea: **evidence first, people decide.**
Read `DESIGN.md` and `tokens.json` first: https://shuyii0315-arch.github.io/green-control/system/files/DESIGN.md · https://shuyii0315-arch.github.io/green-control/system/files/tokens.json

Green Control's first rule is *evidence first, people decide*. How far the AI may go depends on how sure it is. Make this call before any layout or wording.

### The bands

| Confidence | Band | The AI may | The screen shows |
|---|---|---|---|
| 80 and up | plan | propose a plan | plan rail + Apply |
| 50–79 | draft | draft a plan | "Draft" label, evidence open, Review before Apply |
| below 50 | check | only suggest a check | no plan; competing causes + one suggested check + Assign |

Thresholds live in `tokens.json` as `ai.confidence.act` (80) and `ai.confidence.review` (50). Read them; never hard-code.

### How to decide

1. Find the number. If the brief gives none, ask for it. Never pick one to make a screen look better.
2. Map it to a band with the table.
3. List competing causes whenever more than one is still possible, in the draft band as well as below 50. The leading cause carries the confidence; the others read "maybe" (draft) or all read "possible" (below 50).
4. Below 50, write the one check that would tell the causes apart. It is the suggestion, not an evidence card.
5. In every band: Apply needs a person's tap, and every applied step can be undone.

### Output

Write down the band, the reason, and what the screen must and must not show, before building:

```
Band: check (41%)
Why: the data fits three causes equally
Show: causes list (all "possible"), suggested check, Assign
Do not show: any fix, Apply, a plan rail
```

### Examples

- "The AI is 41% sure the door is slow because of debris. What do we show?" → check band, three causes, suggest one site visit.
- "88% sure charging BT-01 tonight avoids the peak." → plan band, plan + Apply + Undo.

## Next

`gc-evidence`.
