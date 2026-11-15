---
name: gc-learn-rule
description: Use after a review round or a designer's corrections, to turn grades and edits into rules in DESIGN.md, each with its reason, its source and a changelog line.
---

# Turn feedback into rules

Step 7 of 7 in the Green Control flow (index: `green-control`). The one idea: **evidence first, people decide.**
Read `DESIGN.md` and `tokens.json` first: https://shuyii0315-arch.github.io/green-control/system/files/DESIGN.md · https://shuyii0315-arch.github.io/green-control/system/files/tokens.json

Rules grow from real feedback, not from one person's guess. Sources: the review desk (results page → "Copy all data", JSON) and the corrections the designer made in the session.

### Steps

1. Collect every correction: grades marked okay or redo, the problems ticked, graders' notes, and edits the designer made by hand.
2. Group them. The same problem on several drawings or screens is one rule.
3. Tag where it comes from: [Industry] (ISA-101, ISA-18.2, WCAG), [Product] or [Task]. If it differs from the industry habit, say so and why.
4. Write each rule as an instruction a future agent can follow, generalised to every similar case ("Light one part only, never a whole assembly", not "fix the charger").
5. **Attach the reason.** Use the graders' or designer's own words. Never invent one: if nobody said why, propose a reason and mark it *to confirm*.
6. Add where it came from: batch, how many people, which roles, which drawings.
7. If a machine could catch it, propose a check for `gc_check.py` instead of a sentence.
8. Write it into DESIGN.md and add a Changelog line. Remove rules that are now covered by a newer one.

### Format

```
### Give the lit part enough detail to be recognised on its own.
- Why: "Part unclear" ticked 5 times, on the EV fast charger (design 2, engineering 2, product 1).
- In their words: "The whole charger is orange; I can't tell which cable is broken."
- Source: review desk · batch-1
```

### Then

Redraw or rebuild what was graded redo, using the new rule, and send it back to the desk for the next round.
