---
name: gc-learn-rule
description: Use after a review round or a session where the designer corrected the AI, to turn graders' marks and corrections into new Green Control rules, each with its reason, written into DESIGN.md.
---

# Turn feedback into rules

Rules grow from real feedback, not from one person's guess. Sources: the review desk (results page → "Copy all data", JSON) and the corrections the designer made in the session.

## Steps

1. Collect every correction: grades marked okay or redo, the problems ticked, graders' notes, and edits the designer made by hand.
2. Group them. The same problem on several drawings or screens is one rule.
3. Write each rule as an instruction a future agent can follow, generalised to every similar case ("Light one part only, never a whole assembly", not "fix the charger").
4. **Attach the reason.** Use the graders' or designer's own words. Never invent one: if nobody said why, propose a reason and mark it *to confirm*.
5. Add where it came from: batch, how many people, which roles, which drawings.
6. If a machine could catch it, propose a check for `gc_check.py` instead of a sentence.
7. Write it into DESIGN.md and add a Changelog line. Remove rules that are now covered by a newer one.

## Format

```
### Give the lit part enough detail to be recognised on its own.
- Why: "Part unclear" ticked 5 times, on the EV fast charger (design 2, engineering 2, product 1).
- In their words: "The whole charger is orange; I can't tell which cable is broken."
- Source: review desk · batch-1
```

## Then

Redraw or rebuild what was graded redo, using the new rule, and send it back to the desk for the next round.
