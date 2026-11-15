# Green Control · DESIGN.md

The design system behind AI GC · Green Control, an AI that watches a building's energy systems with the people who run them.
Written for designers, engineers and AI agents. Tokens live in `tokens.json` (W3C DTCG format). Version 1.11.

## The one idea

**Evidence first. People decide.**
The AI may look, compare and suggest. Anything that changes a machine waits for a person, shows why, and can be undone.

## Where the rules come from

Every rule below comes from one or more of three places, tagged in brackets:

- **[Industry]** what operators already expect from control-room screens. Green Control follows ISA-101 (high-performance HMI: grey by default, colour only for the abnormal, values shown against their normal range), ISA-18.2 (alarm management: every alarm asks for a defined response, no alarm floods) and WCAG (contrast, focus).
- **[Product]** what Green Control cares about most: evidence first, people decide.
- **[Task]** what the person on shift is doing at that moment: detect, diagnose, respond or review (see "What the person is doing").

Where Green Control deliberately differs from the industry habit, the rule says so and why. A difference that is not written down gets lost: the next screen, or the next agent, falls back to the default.

## Look

Every rule says why. If a case seems to need an exception, read the reason first: it tells you whether the case is really different, or only looks different.

- **Two themes, one set of names.** Night (default): black, greys, one orange. Day: paper white, greys, one blue.
  - Why: plants are watched around the clock. Night is easy on the eyes in a dark control room; day reads in a bright office. One set of names means a screen is built once and works in both.
  - Source: [Industry] [Task]
  - Differs from the industry habit: ISA-101 recommends a light-grey background to cut glare; the day theme follows it. Night is the default because watching continues through night shifts in dimmed rooms, where a bright screen glares. To confirm with operators.
- **One accent per theme. It marks the problem and the step in progress. It is never decoration.**
  - Why: the person on shift should find what is wrong within a second. Every decorative use of the accent is one more place the eye goes first.
  - Breaks if ignored: an orange chart line or icon competes with the real fault.
  - Source: [Industry] ISA-101 keeps alarm colours for the abnormal only. [Product]
  - Differs from the industry habit: ISA-101 plants use several alarm colours, one per priority. Green Control has one accent and no priority levels yet (see Open questions).
- **Calm by default: the screen is greys and the drawing.**
  - Why: most of the time nothing is wrong. A screen that is always busy teaches people to stop looking (alarm fatigue); a calm one makes the one problem stand out.
  - Source: [Industry] ISA-101: grey by default, colour only where attention is needed.
- **Square corners everywhere. Round shapes are only status dots and spinners.**
  - Why: when everything else is square, a round shape means "live state". Square also matches the straight lines of the isometric drawings.
  - Breaks if ignored: a pill-shaped Apply button reads like a status badge, and round stops meaning anything.
  - Source: [Product]
- **Floating panels are frosted glass (`surface.glass` + 24px blur). Blocks inside them are flat.**
  - Why: the AI is a layer over the machine, not a separate page, so the machine stays visible behind it. Blocks inside stay flat so their text stays sharp.
  - Source: [Product]
- **Sans (Hanken Grotesk) for sentences. Mono (DM Mono, uppercase, 11px) for labels, data and time.**
  - Why: numbers line up in mono. And measured data looks different from the AI's sentences, so people can tell a reading from an interpretation at a glance: the same idea as evidence first.
  - Source: [Product]
- **Motion is picked by what the movement does, from one list: hover and press `feedback` 120 ms; a label or chip `small-in` 240 / `small-out` 160 ms; a panel or sheet `in` 420 / `out` 280 ms; the layout `move` 520 ms; the drawing `camera` 900 ms; in progress `loop` 1200 ms; live `ambient` 2400 ms. Curves: `ease` for entering and moving, `exit` for leaving, `spring` only for arrivals, `wave` for loops, `linear` for things that spin. No other numbers. Respect reduced motion.**
  - Why: one list makes every screen move at the same rhythm, and a machine can check it (before 1.9 the prototype had 38 different durations). Leaving is one step shorter than arriving: what arrives needs to be seen, what leaves does not. A spring says "this is new", so it is kept for arrivals; used everywhere, nothing would feel new.
  - Exception: one-off sequences (the figure assembling, the scan) are written inside their component and marked as exceptions.
  - Each component says which of these it uses (see the component pages); a component never brings its own numbers.
  - Source: [Product]; reduced motion from [Industry] WCAG.
- **Colours come in three layers:** `primitive.color.*` (raw values) → `color.*` semantic (what it means) → component (`cta-*`, `sel-*`, `badge-bg`). UI code only uses semantic or component tokens. A theme only re-points semantic tokens.
  - Why: a theme or brand change then edits one layer, not every screen.
  - Source: [Product]
- **Text reaches 4.5:1 on every background it sits on, in both themes. Graphics (meters, dots) reach 3:1.**
  - Why: WCAG AA, and plant screens are often read from a step away.
  - Source: [Industry]
- **Everything clickable shows a focus ring: 1.5px in the text colour, 2px out.**
  - Why: people using a keyboard must always see where they are.
  - Source: [Industry] WCAG

## Logo

A 5×5 dot "G" with one dot in the accent, where the letter turns inward. It sits top-left and nowhere else. Markup is in `green-control-components.css`. Do not draw a new logo, a coloured tile, or a letter in a rounded square.

## Every equipment screen is built around a drawing

Green Control does not show equipment as a table or an icon. It shows the machine. Start every screen from `shell.html`:

- **Rail** (64px) on the left: logo, icon nav, theme, avatar.
  - Why: icons only, because people spend a shift on one equipment screen and rarely switch sections. 64px fits a 44px tap target with 10px either side and leaves the most room for the drawing.
- **Stage** in the middle: title + state tag, mono crumbs (`B1 / PLANT / CH-02`), then the **figure**, then the **evidence row** (one card per check, tagged with the questions of this topic, joined by dashed lines).
- **Panel** (400px) on the right, frosted: the AI thread, an issue band in the accent, the ask box.
  - Why: on a 1440px screen it leaves 976px for the drawing, so the machine stays the largest thing. At 16px text, 400px less padding gives about 45 characters a line, short enough to take in a headline at a glance. Below 1100px the panel becomes a bottom sheet and the drawing stays on top; below 700px the menu becomes a tab bar at the bottom, and an open sheet covers it.

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

## What the person is doing

Sort screens by the person's task, not by how they look. Each task asks something different of the screen. Operator response is commonly described as detect → diagnose → respond; Green Control adds review, because every step can be undone.

| Task | The person is… | The screen must | Green Control parts |
|---|---|---|---|
| **Detect** | scanning many machines, mostly normal | stay grey; make the one abnormal thing obvious at a glance; every alert asks for one action | dot field and drawing; alert card with one action (Investigate); accent only on the problem |
| **Diagnose** | working out why | show each reading against its normal range, in the order it was checked; say how sure | evidence chips and cards (bar against the normal range, 30-day baseline tick); confidence meter; competing causes |
| **Respond** | deciding what to do | offer one next step, sized to the confidence; change nothing without a tap | plan rail; Apply or Assign; owner row |
| **Review** | checking what happened, or taking it back | show what changed, when and by whom; offer Undo | toast with Undo; Actions timeline |

Source: [Industry] ISA-101 shows values against their normal range and ISA-18.2 asks every alarm for a defined response; [Task].

## Same everywhere, varies by rule

A screen should never differ by accident, and never be forced to look the same when the situation is different. This table says which is which.

| Same on every screen | Varies, and what decides it |
|---|---|
| Rail · stage with the drawing · AI panel | **How many evidence cards:** how many sources the AI actually checked (1 to 4) |
| Square corners; round only for live state | **The card tags:** the kind of situation (fault, opportunity, unsure) |
| The accent marks only the problem or the one action | **What the AI may do, and which buttons appear:** the confidence band (80+ plan, 50–79 draft, below 50 check) |
| The spark appears only where the AI speaks or acts | **How the AI words it:** the same confidence band |
| Every applied step can be undone; every machine name is a link | **The drawing and the lit part:** which machine, which part is at fault |
| Only token colours, sizes and radii | **The theme:** night or day re-points the colour meanings, never the structure |

Why this table exists: in 1.2 the evidence row was fixed at three cards. On a saving with nothing broken, agents had to invent a third tag to fill the row: forced sameness. 1.3 moved the card count from the left column to the right, decided by the real checks. When a new case does not fit, change this table first, then build.

## Rules

1. **Evidence before advice.** No plan appears before at least one evidence chip. [Product]
2. **People apply.** The AI never changes equipment on its own, except to switch back to a safe state; when it does, it says so. [Product] [Industry]
3. **Everything is undoable.** Every applied step offers Undo in the toast and on the timeline. [Product] [Task: review]
4. **Say less when unsure.** Below the review threshold the AI suggests a check, not a fix. [Product]
5. **Name the object.** Equipment, teams and work orders are links (glyph + underline), so people can open what the AI refers to. [Task: diagnose]

## How we would test the rules

The rules have been tested with AI agents (see Changelog): can an agent that has never seen the prototype build a new screen that follows them? They have not been tested with operators yet. The plan:

| Rule | Test with operators | Measure |
|---|---|---|
| Calm by default, one accent | One fault on a plant screen: the grey version against a colourful one | Time to find the fault; how often the wrong machine is picked |
| Every alert asks for one action | Replay a busy shift | Alerts per 10 minutes (ISA-18.2 treats more than 10 in 10 minutes as a flood); alerts closed with no action |
| Say less when unsure | Plans at 41%, 58% and 88% confidence | How often a plan is applied and then undone |
| Evidence before advice | The same plan with and without evidence cards | Whether the operator can say why the AI suggested it |

## Open questions

- **Priority.** ISA-18.2 asks for three or four alarm priorities. Green Control separates issue from opportunity but has no priority levels: when two faults arrive at once, which one gets the accent?
- **Night as the default.** It differs from ISA-101's light-grey background (see Look). Needs operators on night shifts to confirm.


## Icons

One set of 16 outline icons on an 18 px grid (`overview`, `equipment`, `actions`, `reports`, `menu`, `theme`, `expand`, `close`, `back`, `next`, `send`, `check`, `undo`, `person`, `filter`, `export`). [Product]

- **Two sizes: 18 px in the menu and page tools, 14 px inside buttons and fields.** 14 px sits level with 13–14 px text; 18 px is for icons that stand alone as targets.
- **One stroke, 1.5 px, at both sizes** (`vector-effect: non-scaling-stroke`). The same weight as focus rings and outlines; 14 px icons are not fainter.
- **Square corners, square line ends.** Every surface, button and chip is square; a rounded icon would be the only round thing.
- **Outline in the text colour, never the accent.** The accent means abnormal (ISA-101); an orange icon reads as an alarm. The AI mark's centre dot and the state glyphs are not icons.
- **An icon always has a word next to it**, except Close and Send, which carry an aria-label.
- Before 1.11 the prototype had icons at 12, 14 and 18 px, strokes from 1.3 to 1.6, and rounded corners.

## Containers

Four kinds. A feature puts its content into one of them; it never invents a fifth. [Product]

| Container | When | From | Close | Covers the drawing |
|---|---|---|---|---|
| **Panel** | a task with several steps: read, decide, act | desktop: the right edge, 400px; tablet and phone: the bottom | close button or Esc; a grabber only if its height can change | depends on the task |
| **Popover** | one or two lines about one point on the drawing | next to that point | click anywhere else | never |
| **Toast** | a receipt for something just done | the top of the work area | leaves after 6 s, waits while hovered | never |
| **Card** | things listed on the page; does not float | in place | not closed; it changes state | — |

- **One panel at a time.** Opening something from inside a panel opens it one level down in the same panel, with Back at the top left.
  - Why: two panels side by side squeeze the drawing out, and the drawing is what the person is watching.
- **On tablet and phone the panel is a bottom sheet with three heights.** *Fit*: as tall as its content, up to half (assign someone, filters). *Medium*, 50%: read while looking at the drawing (AI investigation, shift handover, equipment details). *Large*, 90%: dragged up from medium to read everything; the page stays visible above.
  - Why: the height follows what the person does next. Pick-and-go tasks need no more room than their content; reading tasks need the drawing in view.
- **Grabber or close, never both.** A sheet that can be resized has a grabber, closes by dragging down, and dims nothing behind it, so the drawing stays usable. A fit sheet dims what is behind it and has a close button: finish this first.
- **The alerts floating on the overview are cards, not a panel**, so there is one panel at one width.

## Page frame

Every page is built from four regions: menu, header, main, panel. A page only decides which are open. [Product]

| Page | The person is | Menu | Header tools | Main | Panel |
|---|---|---|---|---|---|
| Overview | detecting | open (232px) | time range, Ask AI | building cutaway, alert cards on it | closed |
| Equipment | diagnosing, responding | folded (64px) | state, path | the machine and its evidence row | AI panel open |
| Actions | reviewing | open | filters | a list | opens when a row is picked |
| Reports | reviewing | open | time range, export | charts | closed |

- **The menu folds only on the equipment page.**
  - Why: only that page keeps a panel open, so it needs the width for the drawing and the panel. Elsewhere an open menu tells people where they are.
- **The header has a fixed height and the title is always in the same place**; the right side holds only that page's tools. So the eye never hunts for the title.
- **Main takes the width that is left; no fixed pixel positions.** Control-room monitors, tablets and phones all differ.
- Going from the overview to an equipment page: the menu folds (`move` 520 ms) while the panel slides in (`in` 420 ms).

## Components

AI panel (the frame stays the same; what goes inside changes with the situation) · Alert card · Evidence chip · Evidence card · Plan rail (check / step) · Confidence meter · Toast with Undo · Action row · Owner row (team + person on shift + Assign) · Causes list + Suggested check (below 50%) · Art box (keeps labels on the drawing) · Segmented control · Buttons (primary `.cta`, secondary `.pbtn`; square, no pill) · Logo.

## Machine check

`tools/gc_check.py` checks what a machine can: typed-in colours, contrast of every text/background pair in both themes, focus rings, buttons without a label, and drift between `tokens.json` and every file that copies its values. `tools/build_tokens.py` writes `tokens.json` into those files. Run both before handing work back.

## Changelog

- **1.11** New: Icons (one set, two sizes, one stroke, square). Bottom sheets get three heights (fit, medium, large) and one rule: grabber or close, never both. Page frame shows all four pages on one shell. Every motion example names its tokens and can be replayed; the AI mark's thinking animation matches the prototype.
- **1.10** New: Containers (panel, popover, toast, card; one panel at a time; the panel in five situations) and Page frame (four regions; which are open on the overview, equipment, actions and reports pages). Fixed the motion examples: a press returns to rest, the toast and the meter replay, loops use `wave` and the `loop` duration.
- **1.9** Motion is picked by what moves, from one list of curves and durations (`tokens.json` › motion). New: an `exit` curve for anything leaving, `wave` for loops, `linear` for spinners. Every transition in the prototype, the site and the component code now uses these values; `gc-motion` skill rewritten to match.
- **1.8** Each component is shown in the situations it meets, with one line on what changes, instead of do/don't lists. New: AI panel, one frame for every AI answer (fault, saving, draft, low confidence), on desktop, tablet and phone.
- **1.7** Rules now say where they come from: [Industry] (ISA-101, ISA-18.2, WCAG), [Product] (evidence first, people decide) or [Task]. Two places where Green Control differs from the industry habit are written down with their reasons. New: screens sorted by what the person is doing (detect, diagnose, respond, review); a plan for testing the rules with operators; open questions.
- **1.6** Every look and layout rule now says why, and what breaks if it is ignored, so a person or an agent can tell a real exception from a mistake. New table: what stays the same on every screen, and what varies and by which rule.
- **1.5** Added "How the AI speaks": wording per confidence band, words the AI never uses, and how it reports Undo. The first machine check, `gc-check`, found what four rounds of reviewing screens had missed: secondary text (`muted`) fell short of 4.5:1 on raised and chip backgrounds in both themes (now #666662 day, #8f949c night); the component CSS had no keyboard focus ring; the Ask input's send button had none either; two near-identical blacks (#111214, #121214); and `registry.json`'s copy of the theme had been missing the badge colour since 1.1. Colours now have a primitive layer, and one script keeps every copy in sync.
- **1.4** From the 1.3 test (cooling tower 58%, EV charging 83%): motion token names now match the components; the evidence row tightens its gaps for 3 and 4 cards; the art box keeps any image's proportions; the assemble lines up inside the art box; a sticky action bar; an Opportunity tag; done plan steps; action rows positioned by variables; competing causes in the draft band; the 62° view defined.
- **1.3** From the 1.2 test (both agents): `gc-tokens.css` now exports space, type, radius, motion and the AI thresholds; evidence badges use one colour everywhere; an art box so labels stay pinned to the drawing at any size; components for the below-50% case (competing causes, suggested check) and an Owner row; the evidence badge is scoped so plan steps keep their hollow 'not yet' state; the evidence row follows the topic's questions instead of a fixed What → Where → Why.
- **1.2** The 1.1 screens followed the rules but looked like generic dark dashboards: no drawing, no particles. Added the screen shell, the stage CSS (dot field, pool, labels, marks, evidence row), the particle assemble script, the figure assets, and the rule that every equipment screen is built around an isometric drawing made with the anatomy-figure skill.
- **1.1** Two agents built new screens with this package and hit the same gaps: role colours (link, primary button, selection) and surface effects were missing from `tokens.json`, there was no button or segmented-control markup, the logo was undefined, and "pill" contradicted the square rule. All fixed.
- **1.0** First version, from the Green Control prototype.
