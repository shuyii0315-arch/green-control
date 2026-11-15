---
name: gc-chart
description: Use whenever a Green Control screen, report or slide needs a chart. Turns data into an SVG that follows the chart rules (grey first, accent only out of range, every value against normal, the title is the answer) with make_chart.py, and says what it checked.
---

# Make a chart

A chart in Green Control answers one question a person on shift has. It is grey, quiet, and shows every value against what is normal, so the one thing out of range is the only thing that stands out.

## 1 · Decide whether it should be a chart

Write the question first ("Did we pass the limit today?"). If one number answers it ("2,940 kW, 95% of the limit"), show the number, not a chart.

## 2 · Write the spec

```json
{
  "label": "Power today · B1",
  "title": "Over the limit at 14:00 and 15:00",
  "summary": "Peak 3,350 kW at 15:00, 250 kW over. Now 2,940 kW.",
  "unit": "kW",
  "x": ["00", "01", "…", "23"],
  "values": [2380, 2320, "…"],
  "limit": 3100,
  "normal": null,
  "now": 18
}
```

- `title` is the answer, with its number or time. Never the topic ("Power by hour").
- Give a `limit` (contract, target) or a `normal` range [low, high]. Without one, a reader can't tell whether a value is a problem.
- `now` is the index of the current time or period, if any.
- `type`: `"bar"` (default) for amounts that start at zero, such as power or savings; `"line"` for a reading against its normal range, such as a temperature, where the axis should fit the data.

## 3 · Make it

`python3 make_chart.py spec.json chart.svg` (add `--theme day` for the day fallbacks). Colours come from the Green Control tokens (`--gc-accent`, `--gc-bg-raised`, …) with fallbacks, so the SVG follows the theme it is placed in.

What the script does for you:
- Grey bars (or a muted line with square points); the accent only on values above the limit or outside the normal range.
- The largest out-of-range value labelled next to it ("+250 KW"), so colour is never the only cue.
- The limit as a dashed line with a mono label; the normal range as a band.
- "Now" in the text colour, not the accent.
- One baseline, a few mono axis labels, no grid.

It prints what it checked and warns when the title has no number, when there is no limit or normal range, or when there are too many axis labels. Fix every warning before using the chart.

## 4 · Place it

Put `label`, `title` and `summary` above the SVG: mono label, 22px title, one muted line. Never pie charts, 3D, gradients, or a colour per series.

## Done when

The script prints no warnings, the title can be read on its own as the answer, and the accent marks only what is out of range.
