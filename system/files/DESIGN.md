# Green Control · DESIGN.md

The design system behind AI GC · Green Control, an AI that watches a building's energy systems with the people who run them.
Written for designers, engineers and AI agents. Tokens live in `tokens.json` (W3C DTCG format). Version 1.5.

## The one idea

**Evidence first. People decide.**
The AI may look, compare and suggest. Anything that changes a machine waits for a person, shows why, and can be undone.

## Look

- Two themes, one set of names. Night (default): black, greys, one orange. Day: paper white, greys, one blue.
- One accent per theme. It marks the problem and the step in progress. It is never decoration.
- Square corners everywhere. Round shapes are only status dots and spinners.
- Floating panels are frosted glass (`surface.glass` + 24px blur). Blocks inside them are flat.
- Sans (Hanken Grotesk) for sentences. Mono (DM Mono, uppercase, 11px) for labels, data and time.
- Motion uses one curve (`motion.ease`). Spring only for things that arrive. Respect reduced motion.
- Colours come in three layers: `primitive.color.*` (raw values) → `color.*` semantic (what it means) → component (`cta-*`, `sel-*`, `badge-bg`). UI code only uses semantic or component tokens. A theme only re-points semantic tokens.
- Text reaches 4.5:1 on every background it sits on, in both themes. Graphics (meters, dots) reach 3:1.
- Everything clickable shows a focus ring: 1.5px in the text colour, 2px out.

## Logo

A 5×5 dot "G" with one dot in the accent, where the letter turns inward. It sits top-left and nowhere else. Markup is in `green-control-components.css`. Do not draw a new logo, a coloured tile, or a letter in a rounded square.

## Every equipment screen is built around a drawing

Green Control does not show equipment as a table or an icon. It shows the machine. Start every screen from `shell.html`:

- **Rail** (64px) on the left: logo, icon nav, theme, avatar.
- **Stage** in the middle: title + state tag, mono crumbs (`B1 / PLANT / CH-02`), then the **figure**, then the **evidence row** (one card per check, tagged with the questions of this topic, joined by dashed lines).
- **Panel** (400px) on the right, frosted: the AI thread, an issue band in the accent, the ask box.

### The figure (建模)

- An isometric line drawing of the real equipment, made with the **anatomy-figure** skill: dark theme, transparent background, outlines bright enough to read small, viewed from 62° azimuth (the camera turns 62° around the vertical axis), standard isometric elevation.
- Research the real object first and draw it as it is (where the motor, door, cells or pipes really sit).
- Exactly one part is lit, in the accent: the part with the problem. Everything else stays grey.
- On the drawing: `.alab` glass chips (key + value, mono; `.hot` only on the problem), `.afloor` labels on a building's left edge, numbered `.amark`s where each piece of evidence was read. The numbers match the evidence chips and cards; hovering one highlights all three.
- **The evidence row follows the question, not a template.** One card per source the AI actually checked (1 to 4), numbered in the order it checked them; never pad to three, never drop a check to fit. Each card's tag is the question a person would ask next about *this* topic, in plain words. Patterns:
  - Fault: What's wrong → Where → Why
  - Opportunity (a saving): What's coming → What we have → Does it fit (→ What else needs it, if that was checked)
  - Unsure (below 50%): What we see → What it could be (the competing causes). The check that would tell them apart is the suggestion, not a card.
  - A step is optional: skip Where when no separate check located the problem.
- **Competing causes** are listed whenever more than one is still possible, in the draft band (50–79) as well as below 50: the leading cause carries the confidence, the others read 'not ruled out'.
- **The person's next tap stays in reach.** When the thread is longer than the panel, it scrolls and the current Apply / Assign sits in a sticky bar at its bottom (`.gc-sticky`).
  - A single reading: one card, no row.
- Caption bottom-right in mono: `Fig. 02 — Chiller plant, iso 62°`.
- Night and day each have their own render of the figure.

### Particles (粒子)

- **Dot field** behind the figure: 0.55px dots on a 4.2px pitch (`surface.dot`), masked so it fades out before the edges and guides. It is the "ground" the drawing stands on; never put dots behind text.
- **Pool**: a soft radial glow (`surface.pool`) under the object in focus.
- **Assemble**: when a screen opens on a new figure, the drawing builds itself from its own points, falling top to bottom into place, then the line drawing resolves and the labels arrive (`gc-assemble.js`). Once per figure, never on every update. Off under reduced motion.

## The AI signal

The **spark** (five dots, centre dot in the accent) marks where the AI speaks or acts. Nothing else uses it: not empty states, not marketing, not upsells. If the spark is everywhere it stops meaning anything.

## AI states

| State | What the person sees |
|---|---|
| Watching | Readings only. No spark. |
| Detected | An alert card: what is wrong, where, how much it costs. One action: Investigate. Tag: Issue. |
| Opportunity | The same card for a saving the AI found, not a fault. Tag: Opportunity. |
| Investigating | The AI checks sources one at a time (what → where → why). Each check lands as a numbered evidence chip. |
| Proposed | A plan, one step at a time, on a rail. Behaviour depends on confidence (below). |
| Applied | A toast: what changed, with Undo. The action lands on the Actions timeline. |
| Undone | The AI says what it reversed, in one line. |

## Confidence decides what the AI may do

| Confidence | The AI may | The UI shows |
|---|---|---|
| 80% and up | Propose a plan | Plan + Apply button |
| 50% to 79% | Draft a plan | Draft label, evidence open, "Review" before Apply |
| Below 50% | Only suggest a check | No plan. "Ask a technician to check …" + Assign |

## How the AI speaks

The AI talks like a colleague reporting to the person on shift: not a chatbot, not a salesperson.

- **Seen → means → do.** Say what was measured, what it probably means, and the one next step. In that order.
- **Numbers and names, not adjectives.** "Door motor draws 18% more current since 06:10", not "abnormal behaviour detected". Equipment, teams and people are links.
- **The words follow the confidence band.**

| Band | Sounds like | Example |
|---|---|---|
| Plan (80% and up) | Plain and direct. Names the evidence, the saving or risk, and the plan. | "Tomorrow 14:00–17:00 will pass the 3,100 kW limit by 250 kW. Charging BT-01 tonight covers it and saves ¥21,500." |
| Draft (50–79%) | Leads with the likely cause and its number, then names what is not ruled out. | "Most likely the CT-2 fan (58%): it draws 9% more power and the water leaves 1.4 °C warmer. Fouled fill isn't ruled out yet. Review the steps before applying." |
| Check (below 50%) | Says plainly that it can't tell, why, and the one check that would tell. Never sounds like a fix. | "The data fits three causes equally, so I'm not suggesting a fix. A technician checking the sill track, door motor and light curtain covers all three in one visit." |

- **"I" only for what the AI did** ("I compared door current with its 30-day baseline"). Never "I think", "I feel", "I believe".
- **Never:** exclamation marks, "Don't worry", "Great news", "smart", "AI-powered", or a hedge with no next step ("might be worth looking into").
- **Undo and mistakes:** one line, own it, say the state now. "Undid the BT-01 schedule. The battery is back to a 60% reserve."
- **Length:** headline 12 words or fewer; body two sentences or fewer. Everything else belongs in the evidence.

## Rules

1. **Evidence before advice.** No plan appears before at least one evidence chip.
2. **People apply.** The AI never changes equipment on its own, except to switch back to a safe state; when it does, it says so.
3. **Everything is undoable.** Every applied step offers Undo in the toast and on the timeline.
4. **Say less when unsure.** Below the review threshold the AI suggests a check, not a fix.
5. **Name the object.** Equipment, teams and work orders are links (glyph + underline), so people can open what the AI refers to.

## Components

Alert card · Evidence chip · Evidence card · Plan rail (check / step) · Confidence meter · Toast with Undo · Action row · Owner row (team + person on shift + Assign) · Causes list + Suggested check (below 50%) · Art box (keeps labels on the drawing) · Segmented control · Buttons (primary `.cta`, secondary `.pbtn`; square, no pill) · Logo.

## Machine check

`tools/gc_check.py` checks what a machine can: typed-in colours, contrast of every text/background pair in both themes, focus rings, buttons without a label, and drift between `tokens.json` and every file that copies its values. `tools/build_tokens.py` writes `tokens.json` into those files. Run both before handing work back.

## Changelog

- **1.5** Added "How the AI speaks": wording per confidence band, words the AI never uses, and how it reports Undo. The first machine check, `gc-check`, found what four rounds of reviewing screens had missed: secondary text (`muted`) fell short of 4.5:1 on raised and chip backgrounds in both themes (now #666662 day, #8f949c night); the component CSS had no keyboard focus ring; the Ask input's send button had none either; two near-identical blacks (#111214, #121214); and `registry.json`'s copy of the theme had been missing the badge colour since 1.1. Colours now have a primitive layer, and one script keeps every copy in sync.
- **1.4** From the 1.3 test (cooling tower 58%, EV charging 83%): motion token names now match the components; the evidence row tightens its gaps for 3 and 4 cards; the art box keeps any image's proportions; the assemble lines up inside the art box; a sticky action bar; an Opportunity tag; done plan steps; action rows positioned by variables; competing causes in the draft band; the 62° view defined.
- **1.3** From the 1.2 test (both agents): `gc-tokens.css` now exports space, type, radius, motion and the AI thresholds; evidence badges use one colour everywhere; an art box so labels stay pinned to the drawing at any size; components for the below-50% case (competing causes, suggested check) and an Owner row; the evidence badge is scoped so plan steps keep their hollow 'not yet' state; the evidence row follows the topic's questions instead of a fixed What → Where → Why.
- **1.2** The 1.1 screens followed the rules but looked like generic dark dashboards: no drawing, no particles. Added the screen shell, the stage CSS (dot field, pool, labels, marks, evidence row), the particle assemble script, the figure assets, and the rule that every equipment screen is built around an isometric drawing made with the anatomy-figure skill.
- **1.1** Two agents built new screens with this package and hit the same gaps: role colours (link, primary button, selection) and surface effects were missing from `tokens.json`, there was no button or segmented-control markup, the logo was undefined, and "pill" contradicted the square rule. All fixed.
- **1.0** First version, from the Green Control prototype.
