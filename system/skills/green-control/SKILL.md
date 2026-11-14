---
name: green-control
description: Use whenever you create or change a Green Control (AI GC) screen or AI flow. One skill for the whole loop: decide what the AI may do, choose the evidence, build the screen, draw the machine, write the AI's words, review, and turn feedback into rules.
---

# Green Control

The one idea: **evidence first, people decide.** The AI may look, compare and suggest. Anything that changes a machine waits for a person, shows why, and can be undone.

Read `DESIGN.md` and `tokens.json` first: https://shuyii0315-arch.github.io/green-control/system/files/

Work through the steps in order. Steps 1, 2, 5, 6 and 7 are judgement calls; write down what you decided before you build.

For component details (motion, states, edge cases, accessibility, widths) use the component skills: `gc-motion`, `gc-states`, `gc-break-ui`, `gc-a11y`, `gc-responsive`.


## 1 · Decide what the AI may do

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


## 2 · Choose the evidence

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


## 3 · Build the screen

Read `DESIGN.md` and `tokens.json` first: https://shuyii0315-arch.github.io/green-control/system/files/DESIGN.md · https://shuyii0315-arch.github.io/green-control/system/files/tokens.json

### Start

1. Decide the band with `gc-confidence` and the evidence with `gc-evidence`. Layout comes after.
2. Copy `shell.html` (https://shuyii0315-arch.github.io/green-control/system/files/shell.html) and keep its frame: rail (64px) · stage with the figure and the evidence row · frosted AI panel (400px) on the right.
3. Use the components. In React: `npx shadcn@latest add https://shuyii0315-arch.github.io/green-control/system/r/<name>.json` (registry: https://shuyii0315-arch.github.io/green-control/system/r/registry.json). In plain HTML: `green-control-components.css`.

### Always

- Only tokens, through CSS variables. No new colours, sizes, radii or shadows.
- Both themes: set `data-gc="night"` or `"day"` on the root and check both.
- Calm by default: the screen is greys and the drawing. One accent per screen, only for the problem or the one action to take.
- Square corners. Round only for status dots and spinners.
- Sans for sentences; mono 11px uppercase for labels, data and time.
- Reuse a component before making one. If none fits, stop and ask the designer.
- Each look rule in DESIGN.md says why. Before you break one, read its reason; and check the "Same everywhere, varies by rule" table to see whether what you want to change is allowed to vary. If the case is really new, change that table first, then build.
- The spark appears only where the AI speaks or acts.
- Every applied step: a toast with Undo, and a row on the Actions timeline.


## 4 · Draw the machine

Green Control never shows a machine as a table or an icon. Every equipment screen is built around a drawing of the real machine.

### The drawing

- Isometric line art, made with the **anatomy-figure** skill. Night render: dark, transparent background. Also a day render.
- Research the real machine first and draw it as it is (where the motor, door, cells or pipes really sit).
- View: 62° azimuth, standard isometric elevation. One batch of drawings shares one scale.
- **Exactly one part is lit, in the accent: the part with the problem.** Everything else stays grey. The lit part needs enough detail to be recognised on its own.
- Outlines bright enough to read at small sizes.

### On the drawing

- `.alab` glass labels (key + value, mono); `.hot` only on the problem.
- Numbered `.amark`s where each piece of evidence was read; numbers match the evidence chips and cards (see `gc-evidence`).
- Caption bottom-right in mono: `Fig. 02 — Chiller plant, iso 62°`.

### Around it

- Dot field behind the figure (0.55px dots, 4.2px pitch), fading before the edges; never behind text.
- A soft pool of light under the object in focus.
- When a screen opens on a new figure, it assembles once from its own points (`gc-assemble.js`). Never on every update; off under reduced motion.

### Check before using

Real structure? One part lit? Same scale as the rest of the batch? Readable small? If unsure, put it on the review desk (`gc-learn-rule`).


## 5 · Write what the AI says

The AI talks like a colleague reporting to the person on shift: not a chatbot, not a salesperson.

### Shape

**Seen → means → do.** What was measured, what it probably means, the one next step. In that order.
Headline 12 words or fewer. Body two sentences or fewer. Everything else belongs in the evidence.

### Words follow the band (see gc-confidence)

| Band | Sounds like | Example |
|---|---|---|
| plan (80+) | Plain and direct: evidence, saving or risk, the plan. | "Tomorrow 14:00–17:00 will pass the 3,100 kW limit by 250 kW. Charging BT-01 tonight covers it and saves ¥21,500." |
| draft (50–79) | Likely cause and its number first, then what is not ruled out. | "Most likely the CT-2 fan (58%): it draws 9% more power. Fouled fill isn't ruled out yet. Review the steps before applying." |
| check (<50) | Says it can't tell, why, and the one check. Never sounds like a fix. | "The data fits three causes equally, so I'm not suggesting a fix. One visit to the door covers all three." |

### Always

- Numbers and names, not adjectives: "Door motor draws 18% more current since 06:10", not "abnormal behaviour".
- Equipment, teams and work orders are links.
- "I" only for what the AI did ("I compared door current with its 30-day baseline").

### Never

"I think / I feel / I believe" · exclamation marks · "Don't worry" · "Great news" · "smart" · "AI-powered" · a hedge with no next step ("might be worth looking into").

### Undo and mistakes

One line, own it, say the state now: "Undid the BT-01 schedule. The battery is back to a 60% reserve."


## 6 · Review: pass or block

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


## 7 · Turn feedback into rules

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
