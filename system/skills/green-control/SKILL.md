---
name: green-control
description: Use whenever you create or change a Green Control (AI GC) screen, AI answer, chart or rule. An index: it says which of the Green Control skills to use for each step, in what order.
---

# Green Control

The one idea: **evidence first, people decide.** The AI may look, compare and suggest. Anything that changes a machine waits for a person, shows why, and can be undone.

Read `DESIGN.md` and `tokens.json` first: https://shuyii0315-arch.github.io/green-control/system/files/

Each skill does one job. Load only the one you need; they hand over to each other in this order.

## The flow: from "how sure am I" to "what rule should change"

| Step | Skill | Job | Kind |
|---|---|---|---|
| 1 | `gc-confidence` | Decide what the AI may do from its confidence | Judgement |
| 2 | `gc-evidence` | Choose the evidence cards and their order | Judgement |
| 3 | `gc-build-screen` | Build the screen from the shell, components and tokens | Rules |
| 4 | `gc-draw-equipment` | The rules a machine drawing must meet | Rules |
| 5 | `gc-ai-voice` | Write what the AI says | Judgement |
| 6 | `gc-review` | Pass or block, with reasons | Judgement |
| 7 | `gc-learn-rule` | Turn grades and corrections into rules | Judgement |

Steps 1, 2, 5, 6 and 7 are judgement calls: write down what you decided before you build.

## Making assets

| Skill | Makes |
|---|---|
| `gc-chart` | A chart from data, following the chart rules: grey first, accent only out of range, against normal, the title is the answer. Comes with `make_chart.py`. |

## Component details

`gc-motion` · `gc-states` · `gc-break-ui` · `gc-a11y` · `gc-responsive`: motion, every state, edge cases, accessibility and widths for any component.

## Always

- Tokens only, through CSS variables. Square corners. One accent per screen, only for the problem or the one action. Night and day.
- Apply needs a person's tap; every applied step can be undone.
- Each look rule in DESIGN.md says why. Before you break one, read its reason; check the "Same everywhere, varies by rule" table. If the case is really new, change that table first, then build.
