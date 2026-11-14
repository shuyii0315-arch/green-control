---
name: gc-break-ui
description: Use to stress-test a Green Control component or screen with the worst real data (long names, many evidence cards, missing readings, confidence right at 49/50/79/80) before it ships.
---

# Try to break it

Building data is messy. Feed the component the worst real cases and fix what breaks.

## Test cases

**Names and text**
- The longest machine name: "Centrifugal chiller CH-02 (north plant, condenser loop B)".
- Chinese and English side by side; a Chinese title one character over the line.
- A person name with 4 words; a work order like WO-2026-118204.

**Numbers**
- 0, negative, and very large values (−3.2%, 12,480 kW, ¥1,250,000).
- Confidence exactly at the lines: 49, 50, 79, 80. Each must land in the right band (`gc-confidence`).

**Amounts**
- 1 evidence card and 4 evidence cards. 0 causes, 1 cause, 5 causes.
- A plan with 1 step and with 7 steps.

**Missing or slow**
- A reading that never arrived; a reading 3 hours old (stale).
- Sending that takes 10 s; sending that fails.

**Settings**
- Night and day. Reduced motion on. 200% text size. A 375 px wide screen.

## What counts as broken

Text overflows or is cut without an ellipsis · the layout jumps between states · a value lands in the wrong band · the one accent appears twice · something can't be read at 4.5:1 · a state has no way back.

## Output

```
Alert card · 4 breaks
1. 80-character machine name pushes the delta tag off the card → truncate the name, keep the tag.
2. Confidence 50 shows "check" → band boundary uses > instead of >=.
```
