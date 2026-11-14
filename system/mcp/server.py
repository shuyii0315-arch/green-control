"""Green Control MCP server: lets any AI tool ask the design system questions while it works.

Five tools, one per kind of question a new designer asks while building a screen:
  get_rule         what should happen in this situation?
  list_components  which ready-made parts exist?
  get_component    how does this part work?
  get_tokens       which colour / space / type value?
  check_code       is what I built right?

Everything is read live from the system's own files (DESIGN.md, tokens.json, registry, React components),
so the answers change the moment the files do. Run: python3 server.py  (stdio)
"""
import json, re, sys, tempfile, pathlib

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path.insert(0, str(ROOT / "tools"))
import tokens as tk  # noqa: E402
import gc_check  # noqa: E402
from mcp.server import MCPServer  # noqa: E402

DESIGN = ROOT / "files/DESIGN.md"
REGISTRY = ROOT / "r/registry.json"
REACT = ROOT.parent / "gc-react/src/components/ui"

server = MCPServer(
    name="green-control",
    title="Green Control design system",
    instructions="Ask before you build a Green Control screen: rules first (get_rule), then parts (list_components, get_component), then values (get_tokens). Run check_code on what you made before handing it back.",
)


def sections():
    text = DESIGN.read_text()
    parts = re.split(r"\n(?=##+ )", text)
    out = []
    for p in parts:
        head = p.strip().split("\n", 1)[0].lstrip("# ").strip()
        out.append((head, p.strip()))
    return out


def words(s):
    return {w for w in re.findall(r"[a-z0-9%]+", s.lower()) if len(w) > 2}


@server.tool(description="Look up Green Control's rules for a situation. Give the situation in plain words (e.g. 'elevator door fault, should I show a fix button?'). If the AI's confidence is known, pass it as a number 0-100: the answer then says exactly what the screen may offer.")
def get_rule(situation: str, confidence: int | None = None) -> str:
    d = tk.load()
    act, review = d["ai"]["confidence-act"]["$value"], d["ai"]["confidence-review"]["$value"]
    out = []
    if confidence is not None:
        if confidence >= act:
            band = f"PLAN band ({confidence}% ≥ {act}): show the plan with an Apply button. Evidence still comes first. Undo for {d['ai']['undo-window']['$value']}."
        elif confidence >= review:
            band = f"DRAFT band ({review}–{act - 1}%, here {confidence}%): show the plan as a draft; evidence opens by default; the person reviews before Apply. List competing causes."
        else:
            band = f"CHECK band (below {review}%, here {confidence}%): do NOT offer a fix or Apply. Show the competing causes and one suggested check, with an Assign action to send a person."
        out.append(band)
    secs = sections()
    if confidence is not None:
        conf = next(((h, b) for h, b in secs if h.startswith("Confidence")), None)
        if conf:
            out.append(f"--- DESIGN.md · {conf[0]}\n{conf[1]}")
            secs = [s for s in secs if s is not conf]
    q = words(situation)
    ranked = sorted(secs, key=lambda s: -(3 * len(q & words(s[0])) + len(q & words(s[1])) / (1 + len(words(s[1])) ** 0.5)))
    for head, body in ranked[:1 if confidence is not None else 2]:
        if q & words(body):
            out.append(f"--- DESIGN.md · {head}\n{body[:1800]}")
    rules = next((b for h, b in sections() if h == "Rules"), "")
    if not any("Rules" in o for o in out):
        out.append(f"--- DESIGN.md · Rules (always apply)\n{rules}")
    return "\n\n".join(out)


@server.tool(description="List every ready-made Green Control part: the React components you can install with shadcn, and the CSS components named in DESIGN.md.")
def list_components() -> str:
    reg = json.loads(REGISTRY.read_text())
    lines = ["React components (install: npx shadcn add <url>):"]
    for it in reg["items"]:
        if it.get("type") == "registry:ui":
            lines.append(f"- {it['name']}: {it.get('description', '')}")
    css = next((b for h, b in sections() if h == "Components"), "")
    lines += ["", "CSS components (green-control-components.css):", css.split("\n", 1)[-1].strip()]
    return "\n".join(lines)


@server.tool(description="Get how one Green Control component works: what it is for, its options (props), its states, what it depends on, and its source. Name can be 'button', 'gc-button', 'confidence meter', etc.")
def get_component(name: str) -> str:
    reg = json.loads(REGISTRY.read_text())
    key = re.sub(r"[^a-z]", "", name.lower().replace("gc-", ""))
    for it in reg["items"]:
        if it.get("type") != "registry:ui":
            continue
        if key == re.sub(r"[^a-z]", "", it["name"].replace("gc-", "")):
            src_name = it["files"][0]["path"].split("/")[-1] if it.get("files") else ""
            src = (REACT / src_name).read_text() if (REACT / src_name).exists() else "(source not found)"
            deps = ", ".join(u.split("/")[-1] for u in it.get("registryDependencies", []))
            return f"{it['title']}\n{it.get('description', '')}\nNeeds: {deps or 'nothing'}\n\nSource ({src_name}):\n{src}"
    names = [it["name"] for it in reg["items"] if it.get("type") == "registry:ui"]
    return f"No component called '{name}'. Available: {', '.join(names)}. CSS-only parts are described in list_components."


@server.tool(description="Get Green Control token values for one theme ('night' is the default, 'day' the other). Optional group: 'color', 'surface', 'space', 'type', 'radius', 'motion', 'ai'. Always use these as var(--gc-<name>) in code, never the raw value.")
def get_tokens(theme: str = "night", group: str | None = None) -> str:
    d = tk.load()
    T = tk.themes(d)
    theme = "day" if theme.lower().startswith("d") else "night"
    out = []
    for g in ([group] if group else ["color", "surface", "space", "radius", "type", "motion", "ai"]):
        if g not in d:
            continue
        out.append(f"[{g}]")
        for name, t in d[g].items():
            if name.startswith("$"):
                continue
            val = T[theme].get(name) if g in ("color", "surface") else t.get("$value")
            desc = t.get("$description", "")
            layer = t.get("$extensions", {}).get("layer", "")
            out.append(f"--gc-{name}: {val}" + (f"  ({layer})" if layer else "") + (f"  — {desc}" if desc else ""))
    return "\n".join(out)


@server.tool(description="Check code you wrote against Green Control's machine rules: no typed-in colours, a visible focus ring on clickable things, and labels on icon-only buttons. Pass the code and its kind ('html', 'css' or 'tsx'). Returns each problem with its line, or 'passed'.")
def check_code(code: str, kind: str = "html") -> str:
    suffix = {"html": ".html", "css": ".css", "tsx": ".tsx", "jsx": ".jsx"}.get(kind.lower(), ".html")
    with tempfile.TemporaryDirectory() as tmp:
        f = pathlib.Path(tmp) / f"snippet{suffix}"
        f.write_text(code)
        found = gc_check.run([f], rules=list(gc_check.FILE_RULES), system=False)
    if not found:
        return "passed: 0 problems"
    return f"{len(found)} problem(s):\n" + "\n".join(f"line {x['line']}: [{x['rule']}] {x['msg']}" for x in found)


if __name__ == "__main__":
    server.run()
