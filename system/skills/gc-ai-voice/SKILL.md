---
name: gc-ai-voice
description: Use to write or fix any words the Green Control AI says: seen, means, do; bolder or more careful with the confidence band; numbers and names, not adjectives.
---

# Write what the AI says

Step 5 of 7 in the Green Control flow (index: `green-control`). The one idea: **evidence first, people decide.**
Read `DESIGN.md` and `tokens.json` first: https://shuyii0315-arch.github.io/green-control/system/files/DESIGN.md · https://shuyii0315-arch.github.io/green-control/system/files/tokens.json

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

## Next

`gc-review`.
