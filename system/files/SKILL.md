---
name: green-control-design
description: Use whenever you create or change any Green Control (AI GC) screen, component or AI flow, so new work keeps its look and its rule that the AI shows evidence and people decide.
---

# Green Control design

This is the overview. For one job at a time, use the task skills (install all: `npx skills add shuyii0315-arch/green-control`):
`gc-confidence` decide what the AI may do · `gc-evidence` choose the evidence · `gc-ai-voice` write what the AI says · `gc-build-screen` build the screen · `gc-draw-equipment` draw the machine · `gc-review` pass or block · `gc-learn-rule` turn feedback into rules.
For components: `gc-motion` animate a component · `gc-states` draw every state · `gc-break-ui` try to break it with the worst data.

Before you write any UI for Green Control, read `DESIGN.md` and `tokens.json` in this folder, and take buttons, the segmented control, the spark and the logo from `green-control-components.css`.

## Start here

1. Copy `shell.html` and keep its frame: rail, stage with the figure and the evidence row, AI panel on the right. Link or inline `gc-tokens.css`, `green-control-components.css`, `gc-stage.css` and `gc-assemble.js` from this folder.
2. Draw the equipment the screen is about with the **anatomy-figure** skill (isometric line art, dark, transparent PNG, only the problem part lit in the accent; also a day render). Research the real machine first. If a figure in `img/` already shows it, reuse it.
3. Put the figure in `.gc-figure` with the dot field and pool, add `.alab` labels and numbered `.amark`s, and call `gcAssemble()` once when the screen opens.

## Always

- Use only the tokens in `tokens.json`, through CSS variables (`var(--accent)`, `var(--line)` …). No new colours, sizes, radii or shadows.
- Build both themes. Set `data-gc="night"` or `data-gc="day"` on the root and check both.
- Square corners. Round only for status dots and spinners.
- One accent per screen, for the problem or the step in progress.
- Sans for sentences; mono uppercase 11px for labels, data and time.
- Reuse an existing component before making a new one. If none fits, stop and ask the designer.

## AI behaviour (these come before looks)

1. Show at least one evidence chip before any plan.
2. Pick the plan's form from the confidence:
   - 80 and up: plan + Apply.
   - 50 to 79: draft label, evidence open, Review before Apply.
   - below 50: no plan; suggest a check and offer Assign.
3. Never apply a change to equipment without a person's tap. If the AI must switch back to a safe state on its own, it says so in the thread.
4. Every applied step shows a toast with Undo and adds a row to the Actions timeline.
5. Use the spark only where the AI speaks or acts.
6. Write equipment, teams and work orders as links.
7. Write every AI sentence the way "How the AI speaks" in DESIGN.md says: seen → means → do, wording that matches the confidence band, no "I think", no exclamation marks.

## When you finish, check

- [ ] The screen is built around an isometric drawing of the equipment, with the dot field, labels, numbered marks and the assemble on open.
- [ ] The logo is the dot G, top-left; the spark is not used as a logo.
- [ ] No hard-coded colour, size or radius.
- [ ] Night and day both read clearly.
- [ ] Evidence appears before the plan.
- [ ] One evidence card per check the AI really made; the tags are this topic's questions (DESIGN.md patterns), not a fixed What/Where/Why.
- [ ] The plan matches the confidence band, and so do the AI's words.
- [ ] Apply needs a tap, and Undo exists.
- [ ] The spark appears only on AI content.
- [ ] Reduced motion turns animation off.
- [ ] `python3 tools/gc_check.py <your folder>` reports 0 errors. If it flags something you think is right, say so instead of hiding it.
