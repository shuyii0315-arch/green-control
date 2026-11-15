#!/usr/bin/env python3
"""Green Control chart maker. Reads a JSON spec, writes an SVG that follows the chart rules,
and prints what it checked. Usage: python3 make_chart.py spec.json out.svg [--theme night|day]"""
import json, sys, re

FALLBACK = {
    "night": {"bar": "#2b2d30", "accent": "#ff6b1a", "text": "#ededed", "muted": "#8c9199", "line": "#33363b", "band": "#3a3d42"},
    "day":   {"bar": "#e4e4e1", "accent": "#1f4fff", "text": "#111111", "muted": "#6e6e69", "line": "#dcdcd8", "band": "#d6d6d2"},
}

def col(name, theme):
    var = {"bar": "bg-raised", "accent": "accent", "text": "text", "muted": "muted", "line": "line", "band": "line"}[name]
    return f"var(--gc-{var}, var(--{var}, {FALLBACK[theme][name]}))"

def fmt(v):
    return f"{v:,.0f}" if abs(v) >= 100 else f"{v:g}"

def make(spec, theme="night"):
    notes, warn = [], []
    vals = spec["values"]; n = len(vals); xs = spec.get("x") or [str(i) for i in range(n)]
    unit = spec.get("unit", ""); limit = spec.get("limit"); normal = spec.get("normal"); now = spec.get("now")
    title = spec.get("title", "")
    # rule: the title is the answer, not the topic
    if not re.search(r"\d", title):
        warn.append("Title has no number or time. Write the answer (\"Over the limit at 14:00\"), not the topic (\"Power by hour\").")
    W, H, L, R, T, B = 780, 290, 40, 20, 30, 40
    kind = spec.get("type", "bar")
    pw = W - L - R; ph = H - T - B; step = pw / n; bw = step * 0.72
    X = lambda i: L + i * step + (step - bw) / 2
    if kind == "line":
        # a reading against its normal range: the axis fits the data, it does not start at zero
        lo_v = min(vals + ([normal[0]] if normal else []) + ([limit] if limit else [])); hi_v = max(vals + ([normal[1]] if normal else []) + ([limit] if limit else []))
        pad = (hi_v - lo_v) * 0.25 or 1; bot = lo_v - pad; top = hi_v + pad
        Y = lambda v: T + ph - ((v - bot) / (top - bot)) * ph
    else:
        top = spec.get("max") or max(vals + ([limit] if limit else [])) * 1.08
        Y = lambda v: T + ph - (v / top) * ph
    over = [i for i, v in enumerate(vals) if limit is not None and v > limit]
    out_n = [i for i, v in enumerate(vals) if normal and not (normal[0] <= v <= normal[1])]
    hot = set(over or out_n)
    g = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" role="img" aria-label="{title}">']
    # normal range band, behind everything
    if normal:
        g.append(f'<rect x="{L - 6}" y="{Y(normal[1]):.1f}" width="{pw + 6}" height="{Y(normal[0]) - Y(normal[1]):.1f}" style="fill:{col("band", theme)};opacity:.6"/>')
        notes.append(f"Normal range {fmt(normal[0])}–{fmt(normal[1])} {unit} drawn as a band.")
        band_label = f"NORMAL {fmt(normal[0])}–{fmt(normal[1])} {unit.upper()}"
    g.append(f'<line x1="{L - 6}" x2="{W - R}" y1="{T + ph}" y2="{T + ph}" style="stroke:{col("line", theme)};stroke-width:1"/>')
    if kind == "line":
        pts = " ".join(f"{X(i) + bw / 2:.1f},{Y(v):.1f}" for i, v in enumerate(vals))
        g.append(f'<polyline points="{pts}" style="fill:none;stroke:{col("muted", theme)};stroke-width:1.5"/>')
        for i, v in enumerate(vals):
            c = "accent" if i in hot else ("text" if i == now else "muted")
            g.append(f'<rect x="{X(i) + bw / 2 - 4:.1f}" y="{Y(v) - 4:.1f}" width="8" height="8" style="fill:{col(c, theme)}"/>')
        notes.append("Line with square points: a reading against its range, so the axis fits the data instead of starting at zero.")
    else:
        for i, v in enumerate(vals):
            c = "accent" if i in hot else ("text" if i == now else "bar")
            g.append(f'<rect x="{X(i):.1f}" y="{Y(v):.1f}" width="{bw:.1f}" height="{T + ph - Y(v):.1f}" style="fill:{col(c, theme)}"/>')
    lab = lambda x, y, t, c="muted", a="middle": f'<text x="{x:.1f}" y="{y:.1f}" text-anchor="{a}" style="font:11px \'DM Mono\', ui-monospace, monospace;letter-spacing:.05em;fill:{col(c, theme)}">{t}</text>'
    if normal:
        g.append(lab(L, Y(normal[1]) - 8, band_label, "muted", "start"))
    if limit is not None:
        g.append(f'<line x1="{L - 6}" x2="{W - R}" y1="{Y(limit):.1f}" y2="{Y(limit):.1f}" style="stroke:{col("muted", theme)};stroke-width:1.5;stroke-dasharray:5 5"/>')
        g.append(lab(W - R, Y(limit) - 8, f"{spec.get('limit_label', 'Limit').upper()} {fmt(limit)} {unit.upper()}", "muted", "end"))
        notes.append(f"Limit {fmt(limit)} {unit} drawn as a dashed line with a label.")
    if hot:
        peak = max(hot, key=lambda i: vals[i])
        ref = limit if limit is not None else (normal[1] if vals[peak] > normal[1] else normal[0])
        d = vals[peak] - ref
        g.append(lab(X(peak) + bw / 2, Y(vals[peak]) - 12, f"{'+' if d > 0 else ''}{fmt(d)} {unit.upper()}", "accent"))
        notes.append(f"Accent on {len(hot)} value(s) out of range only; the largest is labelled ({'+' if d > 0 else ''}{fmt(d)} {unit}).")
    else:
        notes.append("Nothing out of range, so no accent.")
    ticks = spec.get("ticks") or sorted(set([0, n // 4, n // 2, 3 * n // 4, n - 1]))
    if len(ticks) > 6: warn.append(f"{len(ticks)} axis labels; keep it to a few.")
    for i in ticks:
        if i != now: g.append(lab(X(i) + bw / 2, H - 14, xs[i]))
    if now is not None:
        g.append(lab(X(now) + bw / 2, H - 14, "NOW", "text"))
        notes.append("“Now” marked in the text colour, not the accent.")
    g.append("</svg>")
    if limit is None and not normal:
        warn.append("No limit and no normal range: a reader can't tell whether these values are a problem. Add one, or use a number instead of a chart.")
    return "\n".join(g), notes, warn

if __name__ == "__main__":
    spec = json.load(open(sys.argv[1])); theme = "day" if "--theme" in sys.argv and sys.argv[sys.argv.index("--theme") + 1] == "day" else "night"
    svg, notes, warn = make(spec, theme)
    open(sys.argv[2], "w").write(svg)
    print("Wrote", sys.argv[2])
    for x in notes: print("  ok  ", x)
    for x in warn: print("  warn", x)
