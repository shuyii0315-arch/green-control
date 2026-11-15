---
name: gc-review
description: Use to review a Green Control screen before it ships: check the five rules and the look, run the machine check, and pass or block with a reason for each finding.
---

# Pass or block

Step 6 of 7 in the Green Control flow (index: `green-control`). The one idea: **evidence first, people decide.**
Read `DESIGN.md` and `tokens.json` first: https://shuyii0315-arch.github.io/green-control/system/files/DESIGN.md · https://shuyii0315-arch.github.io/green-control/system/files/tokens.json

Strict. A screen passes only when every check below holds. Report each finding with where it is and why it matters.

### 1. The five rules (block if any fails)

1. **Evidence before advice:** at least one evidence chip appears before any plan.
2. **People apply:** nothing changes a machine without a person's tap.
3. **Everything is undoable:** each applied step has Undo in a toast and on the timeline.
4. **Say less when unsure:** the plan's form and the words match the band (`gc-confidence`, `gc-ai-voice`). Below 50% there is no fix and no Apply.
5. **Name the object:** equipment, teams and work orders are links.

### 2. The look

- Built around the drawing (`gc-draw-equipment`); one part lit.
- Only tokens: no typed-in colour, size or radius.
- One accent per screen, only for the problem or the one action.
- Night and day both readable; text 4.5:1, graphics 3:1.
- Focus ring on everything clickable; reduced motion turns animation off.
- The spark only on AI content; the logo only top-left.

### 3. The machine check

Run `python3 tools/gc_check.py <folder>` (colours, contrast in both themes, focus rings, unlabeled buttons, token drift). 0 errors to pass. If it flags something you believe is right, say so; never hide it.

### Output

```
Verdict: BLOCK
1. Rule 4 · Elevator panel shows "Apply fix" at 41%. Below 50% only a check is allowed. → Replace with suggested check + Assign.
2. Look · #ff7a00 typed in .badge. → Use var(--accent).
```

## Next

`gc-learn-rule`.
