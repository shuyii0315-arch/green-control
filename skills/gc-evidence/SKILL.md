---
name: gc-evidence
description: Use after gc-confidence, to choose which evidence cards a Green Control screen shows, in what order, and what each card's tag asks, so people can see why before they decide.
---

# Choose the evidence

Step 2 of 7 in the Green Control flow (index: `green-control`). The one idea: **evidence first, people decide.**
Read `DESIGN.md` and `tokens.json` first: https://shuyii0315-arch.github.io/green-control/system/files/DESIGN.md · https://shuyii0315-arch.github.io/green-control/system/files/tokens.json

People decide only if they can see why. Evidence comes before any plan, and it follows the question a person would ask next, not a template.

### Rules

- One card per source the AI actually checked: 1 to 4. Never pad to three; never drop a real check to fit.
- Number cards in the order the AI checked them. The same number appears on the evidence chip, the card, and the mark on the drawing; hovering one highlights all three.
- Each card's tag is the next question about this topic, in plain words.
- A single reading is one card, no row.

### Question patterns

| Situation | Card tags, in order |
|---|---|
| Fault | What's wrong → Where → Why |
| Opportunity (a saving) | What's coming → What we have → Does it fit (→ What else needs it, if checked) |
| Unsure (below 50%) | What we see → What it could be |

Skip a step when no separate check answered it (for example, no Where if nothing located the fault).

### Each card holds

Number and source · the value with its unit · a bar against the normal range with the 30-day baseline tick · one caption line (when, compared with what). Old readings (over 15 min) are marked stale, never hidden.

### Example

"Why does the AI think Chiller 2 is the problem?" →
1 What's wrong: power +14% vs 30-day · 2 Where: Chiller 2, compressor · 3 Why: tubes 41 days past cleaning.

## Next

`gc-build-screen`.
