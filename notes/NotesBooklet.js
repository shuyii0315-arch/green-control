// NotesBooklet.tsx
import * as React from "react";
import { createPortal } from "react-dom";
import { addPropertyControls, ControlType } from "framer";
import { jsx, jsxs } from "react/jsx-runtime";
var BASE = "https://shuyii0315-arch.github.io/green-control/notes/", ART_URL = BASE + "cover-art.svg", SHOT = BASE + "guide-sheet.jpg", FONTS = "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono&family=Nothing+You+Could+Do&family=Reenie+Beanie&display=swap", E = "cubic-bezier(.32,.72,0,1)", CSS = `
.nb-book{all:unset;position:absolute;left:0;top:0;width:420px;height:594px;transform-origin:0 0;cursor:pointer}
.nb-book:focus-visible .nb-cover{outline:3px solid #2f55e4;outline-offset:8px}
.nb-cover{position:absolute;inset:0;background:#f6f4ef;overflow:hidden;box-shadow:inset 0 0 0 1px #e4e0d7,0 2px 4px rgba(0,0,0,.05),0 22px 36px -22px rgba(0,0,0,.4);transition:transform .5s cubic-bezier(.34,1.36,.64,1)}
.nb-fold{position:absolute;left:24px;top:0;bottom:0;width:1px;background:#e4e0d7}.nb-staple{position:absolute;left:12px;width:3px;height:20px;background:#c3c0b8}
.nb-top,.nb-foot{position:absolute;left:52px;right:34px;display:flex;justify-content:space-between;align-items:baseline;font-family:'IBM Plex Mono',monospace;font-size:12px;color:#7d7a72}
.nb-top{top:36px}.nb-foot{bottom:34px}
svg.nb-art{position:absolute;left:30px;top:84px;width:366px!important;height:310px!important;max-width:none}
.nb-cover h1{position:absolute;left:52px;right:30px;bottom:84px;margin:0;font-family:'Nothing You Could Do',cursive;font-weight:400;font-size:34px;line-height:1.35;color:#1c1b19;text-align:left}
.nb-sig{font-family:'Reenie Beanie',cursive;font-size:34px;color:#2f55e4;line-height:.6}
.nb-paper{position:absolute;inset:0;background:#fff url(${SHOT}) 0 0/100% auto no-repeat;box-shadow:0 0 0 1px rgba(0,0,0,.06),0 10px 24px -14px rgba(0,0,0,.3);transform:translate(6px,4px) rotate(1deg);transition:transform .5s cubic-bezier(.34,1.36,.64,1),opacity .15s}
.nb-book.nb-hot .nb-paper{transform:translate(118px,-26px) rotate(5deg)}
.nb-book.nb-hot .nb-cover{transform:translate(-14px,6px) rotate(-1.5deg)}
.nb-book.nb-out .nb-paper{opacity:0}
.nb-ov{position:fixed;inset:0;z-index:9999}
.nb-scrim{position:absolute;inset:0;background:rgba(236,235,230,.74);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
.nb-sheet{position:fixed;background:#fff;overflow:hidden;border-radius:6px;transform-origin:50% 50%;box-shadow:0 0 0 1px rgba(0,0,0,.06),0 40px 80px -30px rgba(0,0,0,.4)}
.nb-sheet img{position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover;object-position:top center}
.nb-sheet iframe{position:absolute;inset:0;width:100%;height:100%;border:0;opacity:0;transition:opacity .35s;background:#f6f4ef}
.nb-sheet.nb-landed iframe.nb-ready{opacity:1}
.nb-tools{position:fixed;display:flex;gap:8px;opacity:0;z-index:2}.nb-tools.nb-col{flex-direction:column}
.nb-ib{all:unset;width:36px;height:36px;display:grid;place-items:center;border-radius:50%;color:#3a3833;cursor:pointer;background:rgba(246,244,239,.88);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);box-shadow:0 0 0 1px rgba(0,0,0,.07),0 4px 12px -4px rgba(0,0,0,.18);transition:background .15s,transform .1s}
.nb-ib:hover{background:#fff}.nb-ib:active{transform:scale(.94)}.nb-ib:focus-visible{outline:2px solid #2f55e4}
.nb-ib svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
@media (prefers-reduced-motion: reduce){.nb-paper,.nb-cover{transition:none!important}}
`, AC = null, reduced = () => typeof window < "u" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function ac() {
  try {
    return AC = AC || new (window.AudioContext || window.webkitAudioContext)(), AC.state === "suspended" && AC.resume(), AC;
  } catch {
    return null;
  }
}
function noise(c, dur) {
  let n = Math.floor(c.sampleRate * dur), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  let s = c.createBufferSource();
  return s.buffer = b, s;
}
function swish(on, vol = 0.16, dur = 0.42, f0 = 700, f1 = 2600) {
  if (!on || reduced()) return;
  let c = ac();
  if (!c) return;
  let t = c.currentTime, s = noise(c, dur), f = c.createBiquadFilter(), g = c.createGain();
  f.type = "bandpass", f.Q.value = 0.9, f.frequency.setValueAtTime(f0, t), f.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.7), g.gain.setValueAtTime(1e-4, t), g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.25), g.gain.exponentialRampToValueAtTime(1e-4, t + dur), s.connect(f).connect(g).connect(c.destination), s.start(t), s.stop(t + dur);
}
function tap(on, vol = 0.1) {
  if (!on || reduced()) return;
  let c = ac();
  if (!c) return;
  let t = c.currentTime, s = noise(c, 0.07), f = c.createBiquadFilter(), g = c.createGain();
  f.type = "lowpass", f.frequency.value = 1400, g.gain.setValueAtTime(vol, t), g.gain.exponentialRampToValueAtTime(1e-4, t + 0.07), s.connect(f).connect(g).connect(c.destination), s.start(t), s.stop(t + 0.07);
}
var kf = (p) => ({ left: p.cx - p.w / 2 + "px", top: p.cy - p.h / 2 + "px", width: p.w + "px", height: p.h + "px", transform: `rotate(${p.ang}deg)`, borderRadius: (p.rad ?? 2) + "px" });
function NotesBooklet(props) {
  let { title, number, minutes, signature, url, sound, tilt, style } = props, box = React.useRef(null), book = React.useRef(null), paper = React.useRef(null), sheet = React.useRef(null), scrim = React.useRef(null), tools = React.useRef(null), frame = React.useRef(null), closeBtn = React.useRef(null), state = React.useRef("closed"), full = React.useRef(!1), [open, setOpen] = React.useState(!1), [isFull, setIsFull] = React.useState(!1), [scale, setScale] = React.useState(0.6), [mounted, setMounted] = React.useState(!1), [art, setArt] = React.useState("");
  React.useEffect(() => {
    if (setMounted(!0), fetch(ART_URL).then((r) => r.text()).then(setArt).catch(() => {
    }), !document.getElementById("nb-fonts")) {
      let l = document.createElement("link");
      l.id = "nb-fonts", l.rel = "stylesheet", l.href = FONTS, document.head.appendChild(l);
    }
    let el = box.current;
    if (!el) return;
    let ro = new ResizeObserver(() => setScale(el.clientWidth / 420));
    return ro.observe(el), () => ro.disconnect();
  }, []);
  let T = (ms) => reduced() ? 1 : ms, go = (el, frames, ms, ease = E, delay = 0) => el.animate(frames, { duration: T(ms), easing: ease, delay: reduced() ? 0 : delay, fill: "forwards" }).finished, paperPose = () => {
    let r = paper.current.getBoundingClientRect();
    return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, w: 420 * scale, h: 594 * scale, ang: book.current.classList.contains("nb-hot") ? 3 + tilt : tilt };
  }, readerBox = () => full.current ? { cx: innerWidth / 2, cy: innerHeight / 2, w: innerWidth, h: innerHeight, ang: 0, rad: 0 } : { cx: innerWidth / 2, cy: innerHeight / 2, w: Math.min(900, innerWidth * 0.92), h: innerHeight * 0.88, ang: 0, rad: 6 }, place = (p) => {
    Object.assign(sheet.current.style, kf(p));
    let right = p.cx + p.w / 2, roomy = !full.current && innerWidth - right >= 64, t = tools.current;
    t.classList.toggle("nb-col", roomy), Object.assign(t.style, roomy ? { left: right + 14 + "px", top: p.cy - p.h / 2 + "px", right: "auto", bottom: "auto" } : { left: "auto", top: "auto", right: "18px", bottom: "18px" });
  }, clear = (...els) => els.forEach((el) => el?.getAnimations().forEach((a) => a.cancel())), nextFrame = () => new Promise((r) => requestAnimationFrame(() => r(null))), hot = (on) => {
    let b = book.current;
    !b || state.current !== "closed" || (b.classList.remove("nb-hot"), on && (b.offsetWidth, b.classList.add("nb-hot"), swish(sound, 0.05, 0.3, 1200, 3e3)));
  };
  async function openIt() {
    if (state.current !== "closed") return;
    state.current = "busy";
    let a = paperPose();
    setOpen(!0), await nextFrame();
    let b = readerBox();
    place(b), book.current.classList.add("nb-out"), document.documentElement.style.overflow = "hidden", swish(sound, 0.18, 0.55, 600, 2800), go(scrim.current, [{ opacity: 0 }, { opacity: 1 }], 420, "ease-out");
    let mid = { cx: a.cx + (b.cx - a.cx) * 0.35, cy: a.cy + (b.cy - a.cy) * 0.35 - 50, w: a.w * 1.35, h: a.h * 1.35, ang: -3, rad: 3 };
    await go(sheet.current, [kf(a), { ...kf(mid), offset: 0.38 }, kf(b)], 820), clear(sheet.current, scrim.current), scrim.current.style.opacity = "1", place(b), sheet.current.classList.add("nb-landed"), tap(sound, 0.1), go(tools.current, [{ opacity: 0, transform: "scale(.9)" }, { opacity: 1, transform: "none" }], 240, "ease-out"), closeBtn.current?.focus({ preventScroll: !0 }), state.current = "open";
  }
  async function closeIt() {
    if (state.current !== "open") return;
    state.current = "busy", full.current && await toggleFull();
    let b = readerBox();
    book.current.classList.remove("nb-hot"), await nextFrame();
    let a = paperPose();
    sheet.current.classList.remove("nb-landed"), go(tools.current, [{ opacity: 1 }, { opacity: 0 }], 140), go(scrim.current, [{ opacity: 1 }, { opacity: 0 }], 520, "ease-in", 160), swish(sound, 0.12, 0.45, 2400, 700), await go(sheet.current, [kf(b), kf(a)], 620), tap(sound, 0.07), book.current.classList.remove("nb-out"), document.documentElement.style.overflow = "", setOpen(!1), book.current.focus({ preventScroll: !0 }), state.current = "closed";
  }
  async function toggleFull() {
    let a = readerBox();
    full.current = !full.current, setIsFull(full.current);
    let b = readerBox();
    await go(sheet.current, [kf(a), kf(b)], 460), clear(sheet.current), place(b);
  }
  React.useEffect(() => {
    if (!open) return;
    let key = (e) => {
      e.key !== "Escape" || state.current !== "open" || (e.preventDefault(), full.current ? toggleFull() : closeIt());
    }, resize = () => {
      state.current === "open" && place(readerBox());
    };
    return addEventListener("keydown", key), addEventListener("resize", resize), () => {
      removeEventListener("keydown", key), removeEventListener("resize", resize);
    };
  }, [open]);
  let lines = String(title).split(`
`), cover = /* @__PURE__ */ jsxs("div", { className: "nb-cover", children: [
    /* @__PURE__ */ jsx("div", { className: "nb-fold" }),
    /* @__PURE__ */ jsx("div", { className: "nb-staple", style: { top: 148 } }),
    /* @__PURE__ */ jsx("div", { className: "nb-staple", style: { top: 426 } }),
    /* @__PURE__ */ jsxs("div", { className: "nb-top", children: [
      /* @__PURE__ */ jsx("span", { children: "notes" }),
      /* @__PURE__ */ jsxs("span", { children: [
        "no. ",
        number
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { dangerouslySetInnerHTML: { __html: art } }),
    /* @__PURE__ */ jsx("h1", { children: lines.map((l, i) => /* @__PURE__ */ jsxs(React.Fragment, { children: [
      i > 0 && /* @__PURE__ */ jsx("br", {}),
      l
    ] }, i)) }),
    /* @__PURE__ */ jsxs("div", { className: "nb-foot", children: [
      /* @__PURE__ */ jsx("span", { className: "nb-sig", children: signature }),
      /* @__PURE__ */ jsx("span", { children: minutes })
    ] })
  ] });
  return /* @__PURE__ */ jsxs("div", { ref: box, style: { ...style, position: "relative", width: "100%", aspectRatio: "420 / 594" }, children: [
    /* @__PURE__ */ jsx("style", { children: CSS }),
    /* @__PURE__ */ jsxs(
      "button",
      {
        ref: book,
        className: "nb-book",
        "aria-label": "Open note: " + lines.join(" "),
        style: { transform: `scale(${scale}) rotate(${tilt}deg)` },
        onMouseEnter: () => hot(!0),
        onMouseLeave: () => hot(!1),
        onFocus: () => hot(!0),
        onBlur: () => hot(!1),
        onClick: openIt,
        children: [
          /* @__PURE__ */ jsx("div", { ref: paper, className: "nb-paper" }),
          cover
        ]
      }
    ),
    mounted && open && createPortal(
      /* @__PURE__ */ jsxs("div", { className: "nb-ov", children: [
        /* @__PURE__ */ jsx("style", { children: CSS }),
        /* @__PURE__ */ jsx("div", { ref: scrim, className: "nb-scrim", style: { opacity: 0 }, onClick: closeIt }),
        /* @__PURE__ */ jsxs("article", { ref: sheet, className: "nb-sheet", role: "dialog", "aria-modal": "true", "aria-label": lines.join(" "), children: [
          /* @__PURE__ */ jsx("img", { src: SHOT, alt: "" }),
          /* @__PURE__ */ jsx("iframe", { ref: frame, src: url, title: lines.join(" "), onLoad: (e) => e.currentTarget.classList.add("nb-ready") })
        ] }),
        /* @__PURE__ */ jsxs("div", { ref: tools, className: "nb-tools", children: [
          /* @__PURE__ */ jsx("button", { className: "nb-ib", "aria-label": isFull ? "Exit full screen" : "Full screen", onClick: () => state.current === "open" && toggleFull(), children: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { d: isFull ? "M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" : "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" }) }) }),
          /* @__PURE__ */ jsx("button", { ref: closeBtn, className: "nb-ib", "aria-label": "Close", onClick: closeIt, children: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { d: "M6 6l12 12M18 6 6 18" }) }) })
        ] })
      ] }),
      document.body
    )
  ] });
}
NotesBooklet.defaultProps = {
  title: `Teaching AI
my design system`,
  number: "01",
  minutes: "18 min read",
  signature: "Shuyi",
  url: "https://shuyii0315-arch.github.io/green-control/guide/",
  sound: !0,
  tilt: -2
};
addPropertyControls(NotesBooklet, {
  title: { type: ControlType.String, title: "Title", displayTextArea: !0 },
  number: { type: ControlType.String, title: "No." },
  minutes: { type: ControlType.String, title: "Read time" },
  signature: { type: ControlType.String, title: "Signature" },
  url: { type: ControlType.String, title: "Page URL" },
  sound: { type: ControlType.Boolean, title: "Sound" },
  tilt: { type: ControlType.Number, title: "Tilt", min: -8, max: 8, step: 0.5, unit: "\xB0" }
});
export {
  NotesBooklet as default
};
