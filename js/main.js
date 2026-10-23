import { createScene } from "./scene.js";
import { ontology, ranges, script } from "./data.js";
import { TURN } from "./turn-data.js";
import { createActions } from "./actions.js";

const $ = (s, r = document) => r.querySelector(s);
const app = $("#app");
const view = { z: 1, x: 0, y: 0 };   // stage zoom: scale and offset of #tilt
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const T = (ms) => (reduce ? 0 : ms);

/* ---------- fit the 1440×900 artboard to the window ---------- */
// centre the artboard and scale it to the window (grid centring lets an oversized box spill off the bottom)
function fit() { const s = Math.min(innerWidth / 1440, innerHeight / 900); app.style.transform = `translate(-50%, -50%) scale(${s})`; }
addEventListener("resize", fit); fit();
// the artboard already fits the window, so a trackpad pinch would only strand the view zoomed in with nowhere to scroll:
// keep pinch / ctrl+wheel inside the prototype from zooming the page (the 3D view still zooms with its own wheel)
addEventListener("wheel", (e) => { if (e.ctrlKey) e.preventDefault(); }, { passive: false });
["gesturestart", "gesturechange"].forEach((t) => addEventListener(t, (e) => e.preventDefault(), { passive: false }));
visualViewport?.addEventListener("resize", fit);

/* ---------- logo: a 5×5 dot "G" with one orange dot ---------- */
{
  const G = [".XXX.", "X....", "X.OXX", "X...X", ".XXX."]; let s = "";
  G.forEach((row, r) => [...row].forEach((c, k) => { s += `<circle cx="${5.2 + k * 4.4}" cy="${5.2 + r * 4.4}" r="1.7" class="${c === "X" ? "" : c === "O" ? "o" : "off"}"/>`; }));
  $("#logo").innerHTML = s;
}

/* ---------- small builders ---------- */
const drawBox = (w, h) => `<svg class="draw" viewBox="0 0 ${w + 8} ${h + 8}" width="${w + 8}" height="${h + 8}" aria-hidden="true"><rect pathLength="100" x="1" y="1" width="${w + 6}" height="${h + 6}"/></svg>`;
const link = (name, sq = false) => `<a class="link"><i class="g${sq ? " sq" : ""}"></i>${name}</a>`;
const issueTag = '<span class="state issue t-small"><i></i>Issue</span>';
const arrow = '<svg viewBox="0 0 14 14"><path d="M2.5 7h9M8 3.5 11.5 7 8 10.5"/></svg>';
const chev = '<svg class="chev" viewBox="0 0 14 14"><path d="M5.5 3.5 9 7l-3.5 3.5"/></svg>';
const sparkSvg = '<svg class="spark" viewBox="0 0 14 14"><circle cx="7" cy="2.3" r="1.5"/><circle cx="2.3" cy="7" r="1.5"/><circle class="o" cx="7" cy="7" r="1.5"/><circle cx="11.7" cy="7" r="1.5"/><circle cx="7" cy="11.7" r="1.5"/></svg>';

/* hourly columns: hatched = normal for that hour, solid = actual so far. Hover a column to read it. */
let chartId = 0; const charts = {};
function columns({ normal, actual, now, hot, forecast = [], limit = null, label = null }) {
  const W = 334, H = 96, N = normal.length, gap = 6, cw = (W - gap * (N - 1)) / N, k = 0.9, id = "h" + (++chartId);
  charts[id] = { normal, actual, now, forecast, label, N, W, H, k, top: normal.map((n, i) => Math.max(n, i <= now ? actual[i] : forecast[i - now - 1] || 0)) };
  let s = `<svg class="chart" data-id="${id}" viewBox="0 0 ${W} ${H + 22}" aria-hidden="true"><defs><pattern id="${id}" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="5" style="stroke:var(--text)" stroke-width="1"/></pattern><linearGradient id="${id}g" x1="0" x2="0" y1="0" y2="1"><stop offset="0" style="stop-color:var(--accent)"/><stop offset="1" style="stop-color:var(--accent)" stop-opacity=".3"/></linearGradient></defs>`;
  for (let i = 0; i < N; i++) {
    const x = i * (cw + gap), nh = normal[i] * k;
    s += `<g class="col" data-c="${i}"><rect class="grow" style="--d:${i * 40}ms" x="${x}" y="${H - nh}" width="${cw}" height="${nh}" fill="url(#${id})" opacity=".22"/>`;
    if (i <= now) {
      const a = actual[i] * k;
      const style = i === now ? (hot ? `fill:url(#${id}g)` : "fill:var(--text)") : "fill:var(--text);opacity:.35";
      s += `<rect class="grow act" x="${x}" y="${H - a}" width="${cw}" height="${a}" style="${style};--d:${200 + i * 50}ms"/>`;
      if (i === now && label) s += `<text class="pop" x="${x + cw / 2}" y="${H - a - 6}" text-anchor="middle" style="fill:var(--text);font-family:'Hanken Grotesk';font-size:13px">${label}</text>`;
    } else if (forecast[i - now - 1]) {
      const f = forecast[i - now - 1] * k;
      s += `<rect class="grow fc" style="--d:${700 + i * 60}ms" x="${x}" y="${H - f}" width="${cw}" height="${f}" fill="url(#${id})" opacity=".55"/>`;
    }
    s += "</g>";
  }
  if (limit != null) { const y = H - limit * k; s += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" style="stroke:var(--accent)" stroke-dasharray="3 3"/><text x="${W}" y="${y - 6}" text-anchor="end" style="fill:var(--accent);font-family:'Hanken Grotesk';font-size:13px">Limit</text>`; }
  ["00", "04", "08", "12", "16", "20"].forEach((h, j) => { const x = j * 2 * (cw + gap) + cw / 2; s += `<text x="${x}" y="${H + 18}" text-anchor="middle">${h}</text>`; });
  return s + "</svg>";
}
const kW = (v) => Math.round(v * 4.2);
function bindChart(svg) {
  const d = charts[svg.dataset.id], card = svg.closest(".card"); if (!d || !card) return;
  const tip = document.createElement("div"); tip.className = "ctip glass"; card.appendChild(tip);
  let cur = -1;
  svg.addEventListener("pointermove", (e) => {
    const r = svg.getBoundingClientRect(), i = Math.max(0, Math.min(d.N - 1, Math.floor(((e.clientX - r.left) / r.width) * d.N)));
    if (i === cur) return; cur = i;
    svg.classList.add("hovering"); svg.querySelectorAll(".col").forEach((g) => g.classList.toggle("on", +g.dataset.c === i));
    const hh = String(i * 2).padStart(2, "0") + ":00", f = d.forecast[i - d.now - 1];
    const val = i <= d.now ? d.actual[i] : f;
    const over = val ? Math.round((val / d.normal[i] - 1) * 100) : 0;
    tip.innerHTML = `<span class="t-data muted">${hh}${i === d.now ? " · now" : i > d.now ? " · forecast" : ""}</span><span class="tv"><span class="t-strong">${val ? kW(val) + " kW" : "–"}</span>${val ? `<span class="t-data ${over > 9 ? "accent" : "muted"}">${over > 0 ? "+" : ""}${over}%</span>` : ""}</span><span class="t-small muted">usual ${kW(d.normal[i])} kW</span>`;
    // place it over the column, in the card's own (unscaled) pixels
    const cr = card.getBoundingClientRect(), sc = cr.width / card.offsetWidth, vk = Math.min(svg.clientWidth / d.W, svg.clientHeight / (d.H + 22)), ox = (svg.clientWidth - d.W * vk) / 2, oy = (svg.clientHeight - (d.H + 22) * vk) / 2;
    const cw = (d.W - 6 * (d.N - 1)) / d.N, cx = (i * (cw + 6) + cw / 2) * vk + ox, ty = (d.H - d.top[i] * d.k) * vk + oy;
    tip.style.left = (r.left - cr.left) / sc + cx + "px"; tip.style.top = (r.top - cr.top) / sc + ty - (i === d.now && d.label ? 30 : 10) + "px";
    tip.classList.add("show");
  });
  svg.addEventListener("pointerleave", () => { cur = -1; svg.classList.remove("hovering"); svg.querySelectorAll(".col").forEach((g) => g.classList.remove("on")); tip.classList.remove("show"); });
}
const NORMAL = [52, 50, 50, 54, 60, 66, 70, 72, 72, 70, 68, 66];

/* ---------- AI insights (S1 / S3) ---------- */
function insightsHTML(phase) {
  const head = (n) => `<div class="ins-head">${sparkSvg}<span class="t-strong">Insights</span><span class="count">${n}</span></div>`;
  const brief = (handled) => `<div class="brief t-small muted">Since 18:10 <b>1 new · ${handled} handled · ¥262 saved</b></div>`;
  const peakRow = `<div class="row block"><div class="row-top"><span class="t-body">Near power limit at 18:30</span><span class="end"><span class="t-data">50 kW left</span>${chev}</span></div><div class="rbar"><i class="tr"></i><i class="so" style="width:92%"></i><i class="tk hot" style="left:calc(100% - 2px)"></i></div><div class="legend t-data"><span class="muted">now 92%</span><span class="accent">limit</span></div></div>`;
  const upsRow = `<div class="row block"><div class="row-top"><span class="t-body">Backup power busier than usual</span><span class="end">${chev}</span></div><div class="rbar"><i class="tr"></i><i class="so" style="width:82%"></i><i class="tk" style="left:74%"></i></div><div class="legend t-data muted"><span>82%</span><span>usual 74%</span></div></div>`;
  if (phase === "issue") return head(3) + brief(2) + `
    <div class="card block" id="issue-card">
      <div class="band"><b>Issue 01</b>CH-02 · Chiller plant · B1</div>
      <h3 class="t-headline">Chiller 2 is wasting 14% power</h3>
      <div class="sub t-small muted">Cooling machine in B1 · ¥312 wasted today</div>
      ${columns({ normal: NORMAL, actual: [50, 49, 51, 55, 61, 68, 76, 80, 82], now: 8, hot: true, label: "+14%" })}
      <div class="card-foot"><button class="cta" id="investigate">Investigate ${arrow}</button></div>
    </div>` + peakRow + upsRow;
  // after the decision: the solved issue leaves, the forecast moves up
  return head(2) + brief(3) + `
    <div class="card block">
      <div class="band"><b>Forecast 01</b>B1 · Limit at 18:30</div>
      <h3 class="t-headline">Near the power limit at 18:30</h3>
      <div class="sub t-small muted">50 kW left · I suggest pre-cooling at 17:45</div>
      ${columns({ normal: NORMAL, actual: [50, 49, 51, 55, 62, 66, 70, 72, 76], now: 8, hot: false, forecast: [82, 90, 96], limit: 100 })}
      <div class="card-foot"><button class="cta">Investigate ${arrow}</button></div>
    </div>` + upsRow;
}
function renderInsights(phase) { const box = $("#insights"); box.innerHTML = insightsHTML(phase); box.querySelectorAll(".chart").forEach(bindChart); const b = $("#investigate"); if (b) b.addEventListener("click", investigate); requestAnimationFrame(() => { const h = [...box.children].reduce((a, c) => a + c.offsetHeight, 0) + 8 * (box.children.length - 1) + 16; app.style.setProperty("--ai-h", h + "px"); }); }

/* ---------- the cost reading's segmented bar ---------- */
function costBar(hot) { const N = 22, v = 0.75, t = 0.72; let s = ""; for (let i = 0; i < N; i++) { const p = (i + 0.5) / N; s += `<i class="${p <= v ? (hot && p > t ? "hot" : "on") : ""}" style="--i:${i}"></i>`; } $("#cost-bar").innerHTML = s; }

/* ---------- 3D scene and its labels ---------- */
const overlay = $("#overlay");
const pins = [
  { key: "chiller2", k: "Chiller 2", v: "+14% power", hot: true },
  { key: "ups", k: "Backup power", v: "82% in use" },
  { key: "battery", k: "Battery", v: "64% · ready" },
  { key: "ev", k: "Car charging", v: "18 / 24 in use" },
];
pins.forEach((p) => { p.el = document.createElement("div"); p.el.className = "pin" + (p.hot ? " hot" : ""); p.el.innerHTML = `<span class="ring"></span><span class="core"></span><span class="stem"></span><span class="lab"><span class="k">${p.k}</span><span class="v">${p.v}</span></span>`; overlay.appendChild(p.el); });
const floors = ["Roof", "L13–27", "L12", "L2–11", "L1", "B1", "B2"].map((label) => { const el = document.createElement("div"); el.className = "floor" + (label === "B1" ? " on" : ""); el.textContent = label; overlay.appendChild(el); return { label, el }; });
const marks = script.evidence.map((e) => { const el = document.createElement("div"); el.className = "mark"; el.innerHTML = `<span class="num">${e.n}</span>`; overlay.appendChild(el); return { key: e.mark, el }; });
const tip = $("#tip");
const describe = (id) => { const o = ontology.objects[id]; if (!o) return null; return `<span class="t-label muted">${o.type}</span> ${link(o.name)}`; };
tip.classList.add("glass");

const scene = createScene($("#gl"), {
  onHover(id, fx, fy) {
    if (!id) { tip.classList.remove("show"); return; }
    const html = describe(id); if (!html) return;
    tip.innerHTML = html; const st = $("#stage");
    tip.style.transform = `translate(${fx * st.clientWidth + 14}px, ${fy * st.clientHeight + 14}px)`;
    tip.classList.add("show");
  },
  onPick(id) { if ((id === "chiller2" || id === "condenser") && !app.classList.contains("s2") && phase === "issue") investigate(); },
});
scene.onFrame = () => {
  const inS2 = app.classList.contains("s2");
  for (const p of pins) { const q = scene.project(p.key); if (!q) continue; p.el.style.transform = `translate(${q.x}px, ${q.y}px)`; p.el.style.opacity = inS2 || !q.front ? 0 : 1; }
  for (const f of floors) { const q = scene.project("floor:" + f.label); if (!q) continue; f.el.style.transform = `translate(calc(${q.x - 8}px - 100%), ${q.y - 7}px)`; f.el.style.opacity = inS2 ? 0 : 1; }
  for (const m of marks) { const q = scene.project(m.key); if (!q) continue; m.el.style.transform = `translate(${q.x - 9}px, ${q.y - 9}px)`; }
};

/* ---------- the illustration turns ----------
   It is the same Anatomy figure, pre-rendered every 2° around its own axis (scripts in turn/).
   Dragging picks the frame; every label, flow and mark is a world point projected for that frame,
   so they stay pinned to the machine while it turns. */
const AL = $("#art-labels"), LD = $("#leaders"), SVGNS = "http://www.w3.org/2000/svg";
const artPins = [
  { cat: "cooling", dot: [347, 540], at: [497, 562], k: "CH-02", v: "+14% power", hot: true },
  { cat: "storage", dot: [656, 518], at: [468, 444], k: "BT-01", v: "64% · ready" },
  { cat: "ev", dot: [499, 626], at: [523, 639], k: "EV-B2", v: "18 / 24 in use" },
  { cat: "power", dot: [493, 364], at: [533, 310], k: "UPS-2", v: "82% in use" },
];
for (const p of artPins) {
  p.off = [p.at[0] - p.dot[0], p.at[1] - p.dot[1]];
  p.ln = document.createElementNS(SVGNS, "line"); LD.appendChild(p.ln);
  p.d = document.createElement("span"); p.d.className = "adot" + (p.hot ? " hot" : ""); AL.appendChild(p.d);
  p.l = document.createElement("span"); p.l.className = "alab" + (p.hot ? " hot" : ""); p.l.innerHTML = `<span class="k">${p.k}</span><span class="v">${p.v}</span>`; AL.appendChild(p.l);
  if (p.hot) {
    p.l.style.cursor = "pointer"; p.l.addEventListener("click", () => { if (phase === "issue") investigate(); });
    // the hot dot brings the camera down to B1, where Chiller 2 sits
    p.d.addEventListener("click", (e) => { e.stopPropagation(); if (view.z > 1.6) resetZoom(true); else zoomTo(p.d, 2.3, 760); });
  }
}
const afloors = [["Roof", 183], ["L13–27", 249], ["L12", 316], ["L2–11", 384], ["L1", 453], ["B1", 521], ["B2", 589]].map(([t, y]) => { const f = document.createElement("span"); f.className = "afloor" + (t === "B1" ? " on" : ""); f.textContent = t; AL.appendChild(f); return { el: f, at: [296, y] }; });
const amarks = [[430, 202], [501, 432], [303, 343]].map(([x, y], i) => { const m = document.createElement("span"); m.className = "num amark"; m.textContent = i + 1; m.insertAdjacentHTML("beforeend", drawBox(18, 18)); AL.appendChild(m); m.at = [x, y]; return m; });
const [bRiser, bCond] = $("#flow").querySelectorAll(".fl"), glowEl = $("#flow2 .glow"), pRiser = $("#flow2 .fl");
const poly = (pts) => "M" + pts.map((q) => q.join(" ")).join(" L");
const theme = () => document.documentElement.dataset.gc;
const turn = {
  bldg: { img: $("#art-bldg"), data: TURN.bldg, az: 62, i: -1 },
  plant: { img: $("#art-plant"), data: TURN.plant, az: 62, i: -1 },
};
for (const T of Object.values(turn)) { T.step = T.data.step; T.N = T.data.frames.length; T.base = T.data.frames[(62 - T.data.az[0]) / T.step]; }
// at the design angle every label sits exactly where the Figma frame puts it
const delta = (design, base) => [design[0] - base[0], design[1] - base[1]];
afloors.forEach((f, j) => (f.dd = delta(f.at, turn.bldg.base.floors[j])));
amarks.forEach((m, j) => (m.dd = delta(m.at, turn.plant.base.marks[j])));
const frameAz = (T, i) => T.data.az[0] + i * T.step;
const wrap = (i, N) => ((i % N) + N) % N;
const idxOf = (T, az) => wrap(Math.round((az - T.data.az[0]) / T.step), T.N);
const frameUrl = (fig, i, t = theme()) => `img/turn/${fig}-${t}-${frameAz(turn[fig], i)}.webp`;
const cache = {};
// nearest angles first, so the frames you are about to need arrive first. Frames are only fetched here
// (into the browser cache, as blobs for the turning bitmaps); no full-size decoded copies are kept in memory
function nearest(T) { const c = idxOf(T, T.az); return [...Array(T.N).keys()].sort((a, b) => Math.min(wrap(a - c, T.N), wrap(c - a, T.N)) - Math.min(wrap(b - c, T.N), wrap(c - b, T.N))); }
function preload(fig, t = theme()) {
  const T = turn[fig], jobs = [];
  for (const i of nearest(T)) { const u = frameUrl(fig, i, t); if (!cache[u]) { const p = fetch(u).then((r) => (r.ok ? r.blob() : null)).then((b) => { p.blob = b; p.ok = !!b; }).catch(() => {}); cache[u] = p; } jobs.push(cache[u]); }
  return Promise.all(jobs);
}
// while turning, frames come from small pre-decoded bitmaps drawn to a canvas (swapping a big <img> each
// frame makes the browser decode it again, which stutters); at rest the crisp image takes over again
for (const [fig, T] of Object.entries(turn)) {
  T.cv = document.createElement("canvas"); T.cv.className = (fig === "bldg" ? "art-bldg" : "art-plant") + " turncv";
  T.cv.width = fig === "bldg" ? 480 : 560; T.cv.height = fig === "bldg" ? 531 : 394; T.img.after(T.cv); T.ctx = T.cv.getContext("2d"); T.bm = {};
}
async function bitmaps(fig, t = theme()) {
  const T = turn[fig]; for (const k of Object.keys(T.bm)) if (!k.startsWith(t + ":")) { T.bm[k].close?.(); delete T.bm[k]; }
  if (!window.createImageBitmap || T.building === t) return; T.building = t;
  for (const i of nearest(T)) {
    if (theme() !== t) break; const key = t + ":" + i; if (T.bm[key]) continue;
    const u = frameUrl(fig, i, t); if (!cache[u]) preload(fig, t); await cache[u]; if (!cache[u].ok) continue; if (!cache[u].blob) { try { cache[u].blob = await (await fetch(u)).blob(); } catch (e) { continue; } }
    try { T.bm[key] = await createImageBitmap(cache[u].blob, { resizeWidth: T.cv.width, resizeHeight: T.cv.height, resizeQuality: "medium" }); } catch (e) { break; }
    cache[u].blob = null;   // the bitmap is all we need from it now
  }
  T.building = null;
}
const bmOf = (T, i) => T.bm[theme() + ":" + i];
function live(fig, on) {
  const T = turn[fig], art = $("#art");
  if (on) { if (T.live) return true; const b = bmOf(T, T.i); if (!b) return false; T.ctx.clearRect(0, 0, T.cv.width, T.cv.height); T.ctx.drawImage(b, 0, 0); T.live = true; T.tok = (T.tok || 0) + 1; art.classList.add("live-" + fig); return true; }
  if (!T.live) return; const tok = ++T.tok; T.live = false;
  T.img.src = frameUrl(fig, T.i); T.img.decode().catch(() => {}).then(() => { if (T.tok === tok) art.classList.remove("live-" + fig); });
}
function show(fig, force) {
  const T = turn[fig], want = idxOf(T, T.az);
  // show the wanted frame, or the nearest one ready (the overlay always matches what is shown)
  const ready = (k) => (T.live ? !!bmOf(T, k) : !!cache[frameUrl(fig, k)]?.ok);
  let i = want;
  if (!force) for (let d = 0; d <= T.N / 2; d++) { const a = wrap(want + d, T.N), b = wrap(want - d, T.N); if (ready(a)) { i = a; break; } if (ready(b)) { i = b; break; } }
  if (i === T.i && !force) return;
  T.i = i;
  if (T.live) { T.ctx.clearRect(0, 0, T.cv.width, T.cv.height); T.ctx.drawImage(bmOf(T, i), 0, 0); } else T.img.src = frameUrl(fig, i);
  place(fig, T.data.frames[i]);
}
function place(fig, fr) {
  place.last = [fig, fr];
  if (fig === "bldg") {
    // near the design angle the tags sit where the Figma frame puts them; turned further, each tag moves
    // outward from the building on its side and tags on one side are spaced so they never stack
    const off = Math.abs(((((turn.bldg.az - 62) % 360) + 540) % 360) - 180), design = off < 16, cx = fr.piv[0][0], fx = Math.min(...fr.floors.map((f) => f[0]));   // left-side tags clear the floor-name column
    const L = artPins.map((p, j) => { const [x, y] = fr.pins[j], w = p.w || (p.w = p.l.offsetWidth) || 120; if (design) return { p, x, y, w, lx: x + p.off[0], ly: y + p.off[1] }; const side = x >= cx ? 1 : -1; return { p, x, y, w, side, lx: side > 0 ? x + 32 : Math.min(x - 32, fx - 84) - w, ly: y - 13 }; });
    if (!design) for (const side of [1, -1]) { const g = L.filter((q) => q.side === side).sort((a, b) => a.ly - b.ly); for (let k = 1; k < g.length; k++) g[k].ly = Math.max(g[k].ly, g[k - 1].ly + 32); }
    for (const q of L) {
      q.lx = Math.max(160, Math.min(790 - q.w, q.lx));
      // zoomed in, tags keep their screen distance from the dot instead of flying off with the drawing
      if (view.z > 1.01) { const c = q.y + (q.ly + 13 - q.y) / view.z; q.lx = q.x + (q.lx - q.x) / view.z; q.ly = c - 13; q.w /= view.z; }
      const { p, x, y, w, lx, ly } = q, ex = x < lx ? lx : x > lx + w ? lx + w : x;
      p.d.style.left = x + "px"; p.d.style.top = y + "px";
      p.l.style.left = lx + "px"; p.l.style.top = ly + 1 + "px";
      p.ln.setAttribute("x1", x); p.ln.setAttribute("y1", y); p.ln.setAttribute("x2", ex); p.ln.setAttribute("y2", ly + 13);
    }
    afloors.forEach((f, j) => { f.el.style.left = fr.floors[j][0] + f.dd[0] + "px"; f.el.style.top = fr.floors[j][1] + f.dd[1] + "px"; });
    bRiser.setAttribute("d", poly(fr.riser)); bCond.setAttribute("d", poly(fr.cond));
  } else {
    amarks.forEach((m, j) => { m.style.left = fr.marks[j][0] + m.dd[0] + "px"; m.style.top = fr.marks[j][1] + m.dd[1] + "px"; });
    pRiser.setAttribute("d", poly(fr.riser));
    const [a, b] = fr.glow, cx = (a[0] + b[0]) / 2, cy = (a[1] + b[1]) / 2, ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
    glowEl.setAttribute("cx", cx); glowEl.setAttribute("cy", cy); glowEl.setAttribute("rx", Math.hypot(b[0] - a[0], b[1] - a[1]) * 0.66); glowEl.setAttribute("transform", `rotate(${ang} ${cx} ${cy})`);
  }
}
for (const [fig, T] of Object.entries(turn)) { T.i = idxOf(T, 62); place(fig, T.base); }
let spinRaf = 0;
function spinTo(fig, to, dur = 1200, from) {
  cancelAnimationFrame(spinRaf); const T = turn[fig]; const a0 = from ?? T.az; const t0 = performance.now();
  if (reduce) { T.az = to; show(fig); return; }
  live(fig, true);
  const step = (now) => { const t = Math.min(1, (now - t0) / dur), e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; T.az = a0 + (to - a0) * e; show(fig); if (t < 1) spinRaf = requestAnimationFrame(step); else live(fig, false); };
  spinRaf = requestAnimationFrame(step);
}
function artTheme(t) {
  // swap to the same angle in the other theme; resolves once those two frames are decoded
  const now = ["bldg", "plant"].map((fig) => { const im = turn[fig].img; im.src = frameUrl(fig, turn[fig].i, t); return im.decode().catch(() => {}); });
  for (const fig of ["bldg", "plant"]) { preload(fig, t); live(fig, false); }
  bitmaps(app.classList.contains("s2") ? "plant" : "bldg", t);
  return Promise.all(now);
}
function pinValue(text) { const v = artPins[0].l.querySelector(".v"); v.classList.remove("swap"); void v.offsetWidth; v.textContent = text; v.classList.add("swap"); }
/* drag left / right to turn it; let go and it coasts to a stop */
{
  const art = $("#art"); let d = null, vel = 0, coast = 0;
  const fig = () => (app.classList.contains("s2") ? "plant" : "bldg");
  art.addEventListener("pointerdown", (e) => { if (e.target.closest(".alab, .adot.hot")) return; e.preventDefault();
    // zoomed in: dragging moves the view (hold Shift to keep turning)
    if (view.z > 1.01 && !e.shiftKey) { d = { pan: true, x: e.clientX, y: e.clientY, vx: view.x, vy: view.y }; art.setPointerCapture(e.pointerId); app.classList.add("panning"); return; } cancelAnimationFrame(spinRaf); cancelAnimationFrame(coast); d = { x: e.clientX, lx: e.clientX, t: performance.now(), az: turn[fig()].az }; vel = 0; art.setPointerCapture(e.pointerId); art.classList.add("turning"); live(fig(), true); });
  art.addEventListener("pointermove", (e) => {
    if (!d) return;
    if (d.pan) { const k = $("#stage").getBoundingClientRect().width / $("#stage").offsetWidth; view.x = d.vx + (e.clientX - d.x) / k; view.y = d.vy + (e.clientY - d.y) / k; applyZoom(); return; }
    const T = turn[fig()], now = performance.now();
    T.az = d.az + (e.clientX - d.x) * 0.3; show(fig());
    vel = 0.7 * vel + 0.3 * (((e.clientX - d.lx) * 0.3) / Math.max(8, now - d.t)) * 16; d.lx = e.clientX; d.t = now;
  });
  const up = () => { if (!d) return; if (d.pan) { d = null; app.classList.remove("panning"); return; } d = null; art.classList.remove("turning"); const f = fig(), T = turn[f]; const go = () => { vel *= 0.94; T.az += vel; show(f); if (Math.abs(vel) > 0.04) coast = requestAnimationFrame(go); else live(f, false); }; coast = requestAnimationFrame(go); };
  art.addEventListener("pointerup", up); art.addEventListener("pointercancel", up);
  art.addEventListener("dblclick", () => { resetZoom(); const T = turn[fig()]; T.az = 62 + ((((T.az - 62) % 360) + 540) % 360) - 180; spinTo(fig(), 62, 900); });
  /* pinch (or ctrl + wheel) zooms the drawing around the pointer; two-finger scroll pans it while zoomed.
     While the drawing is closer, the readings step back so the two layers never fight. */
  art.addEventListener("wheel", (e) => {
    const st = $("#stage"), r = st.getBoundingClientRect(), k = r.width / st.offsetWidth;
    if (e.ctrlKey) {
      e.preventDefault();
      const px = (e.clientX - r.left) / k, py = (e.clientY - r.top) / k, z2 = Math.max(1, Math.min(3, view.z * Math.exp(-e.deltaY * 0.012)));
      view.x = px - (px - view.x) * (z2 / view.z); view.y = py - (py - view.y) * (z2 / view.z); view.z = z2;
    } else if (view.z > 1.01) { e.preventDefault(); view.x -= e.deltaX / k; view.y -= e.deltaY / k; }
    else return;
    applyZoom();
  }, { passive: false });
}
function applyZoom() {
  const st = $("#stage"), W = st.offsetWidth, H = st.offsetHeight;
  if (view.z <= 1.01) { view.z = 1; view.x = 0; view.y = 0; }
  view.x = Math.min(0, Math.max(W * (1 - view.z), view.x)); view.y = Math.min(0, Math.max(H * (1 - view.z), view.y));
  $("#tilt").style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.z})`;
  $("#tilt").style.setProperty("--z", view.z);
  app.classList.toggle("zoomed", view.z > 1.01);
  $("#zoom-pct").textContent = Math.round(view.z * 100) + "%";
  if (place.last) place(...place.last);
}
function resetZoom(slow) { if (slow) return camTo(1, 0, 0, 700); if (camRaf) { cancelAnimationFrame(camRaf); camRaf = 0; const tl = $("#tilt"); tl.style.transition = "none"; view.z = 1; applyZoom(); void tl.offsetWidth; tl.style.transition = ""; return; } view.z = 1; applyZoom(); }
/* camera moves the app makes on purpose are tweened in JS, so tags, scale and offset stay in step every frame */
let camRaf = 0;
function camTo(z, x, y, ms) {
  cancelAnimationFrame(camRaf); const tl = $("#tilt"), a = { ...view }, t0 = performance.now(); tl.style.transition = "none";
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const step = (now) => { const t = Math.min(1, (now - t0) / ms), k = ease(t); view.z = a.z + (z - a.z) * k; view.x = a.x + (x - a.x) * k; view.y = a.y + (y - a.y) * k; applyZoom(); if (t < 1) camRaf = requestAnimationFrame(step); else { camRaf = 0; tl.style.transition = ""; } };
  camRaf = requestAnimationFrame(step);
}
// the element's centre, in the stage's own (unzoomed) coordinates
function stagePoint(el) { const t = $("#tilt"), tr = t.getBoundingClientRect(), K = tr.width / t.offsetWidth, r = el.getBoundingClientRect(); return [(r.left + r.width / 2 - tr.left) / K, (r.top + r.height / 2 - tr.top) / K]; }
function zoomTo(el, z, ms) {
  const st = $("#stage"), W = st.offsetWidth, H = st.offsetHeight, [px, py] = stagePoint(el);
  const x = Math.min(0, Math.max(W * (1 - z), W * 0.36 - px * z)), y = Math.min(0, Math.max(H * (1 - z), H * 0.5 - py * z));
  camTo(z, x, y, ms);
}

/* ---------- motion helpers ---------- */
function countUp(el, target, dur = 1100) {
  const m = String(target).match(/^([^\d]*)([\d,.]+)(.*)$/); if (!m || reduce) { el.textContent = target; return; }
  const [, pre, num, post] = m; const dec = (num.split(".")[1] || "").length; const to = parseFloat(num.replace(/,/g, "")); const t0 = performance.now();
  const fmt = (v) => pre + v.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + post;
  const step = (now) => { const t = Math.min(1, (now - t0) / dur), k = 1 - Math.pow(1 - t, 4); el.textContent = fmt(to * k); if (t < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
/* numbers roll digit by digit, like a payment counter: each digit is a 0–9 strip that slides */
function roll(el, target, delay = 0) {
  const txt = String(target); el.setAttribute("aria-label", txt);
  if (reduce) { el.textContent = txt; el._roll = txt; return; }
  if (el._roll === undefined || el._roll.length !== txt.length) {
    el.classList.add("roll");
    el.innerHTML = [...txt].map((c) => (/\d/.test(c) ? `<span class="dg" aria-hidden="true"><span class="st">${[..."0123456789"].map((n) => `<span>${n}</span>`).join("")}</span></span>` : `<span class="sy" aria-hidden="true">${c}</span>`)).join("");
    void el.offsetWidth;
  }
  void el.offsetWidth;
  const st = [...el.querySelectorAll(".st")], dg = [...txt].filter((c) => /\d/.test(c));
  st.forEach((s, i) => { s.style.transitionDelay = delay + (st.length - 1 - i) * 55 + "ms"; s.style.transform = `translateY(${-dg[i] * 10}%)`; });
  el._roll = txt;
}
function slider(seg) {
  const ind = document.createElement("span"); ind.className = "ind"; seg.prepend(ind);
  const move = (b, instant) => { if (instant) ind.style.transition = "none"; ind.style.left = b.offsetLeft + "px"; ind.style.width = b.offsetWidth + "px"; if (instant) requestAnimationFrame(() => (ind.style.transition = "")); };
  seg.classList.add("sliding"); requestAnimationFrame(() => move(seg.querySelector("button.on"), true));
  seg.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) move(b); });
}
function enter(els, base = 0, gap = 70) { els.forEach((el, i) => { el.style.setProperty("--d", base + i * gap + "ms"); el.classList.remove("rise"); void el.offsetWidth; el.classList.add("rise"); }); }

/* ---------- state ---------- */
let phase = "issue";
const setObj = (issue) => { const t = $("#obj-tag"); t.className = "state t-small" + (issue ? " issue" : ""); t.innerHTML = `<i></i><span>${issue ? "Issue" : "Fixing"}</span>`; };   // issue → (applied) → after
let busy = false;
/* every scripted sequence can be dropped mid-way (the logo, Esc, close): a newer run makes the old one's naps throw */
let run = 0; const STOP = Symbol("stop");
function guard(fn) { const ep = run; const w = async (ms) => { await sleep(T(ms)); if (ep !== run) throw STOP; }; return fn(w).catch((e) => { if (e !== STOP) throw e; }); }
function cancelRun() { run++; busy = false; thinking(false); }
const thread = $("#thread");
const add = (html, cls = "") => { const d = document.createElement("div"); if (cls) d.className = cls; d.innerHTML = html; thread.appendChild(d); thread.scrollTop = thread.scrollHeight; return d; };
const typing = () => add("<i></i><i></i><i></i>", "typing");
async function type(el, text, cps = 70) { if (reduce) { el.textContent = text; return; } el.textContent = ""; for (let i = 0; i < text.length; i++) { el.textContent = text.slice(0, i + 1); if (i % 2 === 0) await sleep(1000 / cps * 2); } }

/* ---------- evidence graph at the bottom of the hero ---------- */
const evBox = $("#evidence");
const CW = 232, GAP = 100;
function buildEvidence() {
  evBox.innerHTML = "";
  script.evidence.forEach((e, i) => {
    const x = i * (CW + GAP);
    const pill = document.createElement("div"); pill.className = "pill"; pill.style.left = x + "px"; pill.innerHTML = `<span class="t-label muted">${e.tab}</span>`; evBox.appendChild(pill);
    const c = document.createElement("article"); c.className = "ev glass"; c.style.left = x + "px";
    const span = (a, b) => `left:${a * 100}%;width:${(b - a) * 100}%`;
    c.innerHTML = `<div class="h"><span class="num">${e.n}</span><span class="t-body">${e.title}</span></div>
      <div class="val"><span class="t-num">${e.value}</span><span class="unit">${e.unit}</span></div>
      <div class="bar"><i class="tr"></i><i class="nm" style="${span(0, e.bar.normal)}"></i><i class="ex" style="${span(e.bar.normal, e.bar.now)}"></i><i class="tk" style="left:calc(${e.bar.now * 100}% - 1px)"></i></div>
      <div class="cap t-small muted">${e.cap}</div>`;
    c.insertAdjacentHTML("beforeend", drawBox(232, 150));
    c.insertAdjacentHTML("beforeend", '<i class="scanl"></i>');
    evBox.appendChild(c);
    c.addEventListener("mouseenter", () => amarks[i].classList.add("hl")); c.addEventListener("mouseleave", () => amarks[i].classList.remove("hl"));
    if (i < 2) { const ed = document.createElement("div"); ed.className = "edge"; ed.style.left = x + CW + "px"; ed.style.width = GAP + "px"; ed.innerHTML = '<span class="p a"></span><span class="ln"></span><span class="p b"></span>'; evBox.appendChild(ed); }
  });
}
function showEvidence(i) {
  const pills = evBox.querySelectorAll(".pill"), cards = evBox.querySelectorAll(".ev"), edges = evBox.querySelectorAll(".edge");
  if (i > 0) edges[i - 1].classList.add("on");
  setTimeout(() => { pills[i].classList.add("show"); cards[i].classList.add("show"); }, i > 0 ? T(380) : 0);
  marks[i].el.classList.add("show"); amarks[i].classList.add("show");
}

/* ---------- S1 → S2: investigate ---------- */
function investigate() { return guard(investigateRun); }
async function investigateRun(w) {
  if (busy) return; busy = true;
  const b = $("#investigate"); if (b) { b.style.transform = "scale(0.96)"; await w(120); }
  // building → B1 → the plant: the camera dives to Chiller 2 first, then the plant takes over
  if (!app.classList.contains("s2") && !reduce) {
    app.classList.add("diving"); zoomTo(artPins[0].d, 2.6, 820); await w(760);
    app.classList.add("s2"); app.classList.remove("s1"); await w(240);
    resetZoom(); app.classList.add("arrive"); app.classList.remove("diving"); setTimeout(() => app.classList.remove("arrive"), 1200);
  } else resetZoom();
  app.classList.add("s2"); app.classList.remove("s1");
  bitmaps("plant");
  turn.plant.az = 46; show("plant", true); setTimeout(() => spinTo("plant", 62, 1700), T(200));
  scene.setState("s2"); $("#live-label").textContent = "Chiller plant · live"; $("#zl2").innerHTML = "01&nbsp;&nbsp;CH-02 · Anatomy"; $("#fig").textContent = "Fig. 02 — Chiller plant, iso 62°";
  thread.innerHTML = ""; buildEvidence(); marks.forEach((m) => m.el.classList.remove("show")); amarks.forEach((m) => m.classList.remove("show", "scan"));
  setObj(true);
  await w(1000);   // let the plant arrive before the chat starts talking
  add(`<b>Issue 01</b>CH-02 · ¥312 wasted today`, "band");
  await w(300);
  add(script.ask, "me");
  await w(450);
  thinking(true);
  // the reasoning trace: each step lights its spot on the machine, then lands as a card
  const trace = add(`<div class="trace-head t-small muted">${sparkSvg.replace('class="spark"', 'class="spark thinking"')}<span>Looking into Chiller 2…</span></div><ol class="trace-list"></ol>`, "trace");
  const list = $(".trace-list", trace); const t0 = performance.now();
  for (let i = 0; i < 3; i++) {
    const e = script.evidence[i];
    const li = document.createElement("li"); li.className = "t-small"; li.innerHTML = `<span class="st"><i class="ring"></i></span><span class="tx">${e.trace}</span>`; list.appendChild(li);
    requestAnimationFrame(() => li.classList.add("in"));
    amarks[i].classList.add("show", "scan");
    await w(1100);
    li.classList.add("done"); li.querySelector(".st").innerHTML = '<svg viewBox="0 0 12 12"><path d="M2.5 6.3l2.2 2.2L9.5 3.6"/></svg>';
    amarks[i].classList.remove("scan");
    showEvidence(i);
    await w(380);
  }
  const secs = ((performance.now() - t0) / 1000).toFixed(1);
  $(".trace-head", trace).innerHTML = `<svg class="chk" viewBox="0 0 12 12"><path d="M2.5 6.3l2.2 2.2L9.5 3.6"/></svg><span>Checked 3 sources · ${secs} s</span>`;
  trace.querySelector(".trace-head").addEventListener("click", () => trace.classList.toggle("closed"));
  // the eye is on the third card now: give it time to read, keep the AI "thinking", then answer on the right
  await w(1400);
  trace.classList.add("closed");
  await w(450);
  thinking(false);
  const say = add("", "say t-body"); words(say, script.answer);
  await w(script.answer.split(" ").length * 55 + 700);
  const chips = add("", "chips");
  script.evidence.forEach((e, i) => { chips.insertAdjacentHTML("beforeend", `<span class="echip" style="--i:${i}"><span class="num">${e.n}</span>${e.chip}</span>`); });
  requestAnimationFrame(() => chips.querySelectorAll(".echip").forEach((c) => c.classList.add("show")));
  chips.querySelectorAll(".echip").forEach((c, i) => { c.addEventListener("mouseenter", () => { evBox.querySelectorAll(".ev")[i].classList.add("hl"); amarks[i].classList.add("hl"); }); c.addEventListener("mouseleave", () => { evBox.querySelectorAll(".ev")[i].classList.remove("hl"); amarks[i].classList.remove("hl"); }); });
  await w(900);
  await planStep1(w);
  busy = false;
}
function thinking(on) { document.querySelectorAll(".chat-head .spark").forEach((s) => s.classList.toggle("thinking", on)); }
function words(el, text) { el.innerHTML = text.split(" ").map((w, i) => `<span class="w" style="--i:${i}">${w}</span>`).join(" "); }
/* ---------- the plan, one step at a time on a timeline ----------
   The AI checks before it proposes, proposes one step, waits for a yes, shows what changed,
   then goes looking for the next step. Everything lands on one rail on the left. */
const CHK = '<svg viewBox="0 0 12 12"><path d="M2.5 6.3l2.2 2.2L9.5 3.6"/></svg>';
const XMK = '<svg viewBox="0 0 12 12"><path d="M3.5 3.5l5 5M8.5 3.5l-5 5"/></svg>';
let rail = null;
const down = () => (thread.scrollTop = thread.scrollHeight);
function railItem(cls, html) { const d = document.createElement("div"); d.className = "pl-item " + cls; d.innerHTML = html; rail.appendChild(d); down(); return d; }
// a check the AI runs: a spinning dot, then the question resolves into what it found
async function check(w, doing, found, ok = true) {
  const r = railItem("proc", `<span class="pl-dot"><i class="ring"></i></span><span class="t-small tx">${doing}</span>`);
  await w(1000);
  r.classList.add("done", ok ? "ok" : "no"); r.querySelector(".pl-dot").innerHTML = ok ? CHK : XMK; r.querySelector(".tx").innerHTML = found;
  await w(260);
}
function stepNode(n, when, title, meta, act) {
  const r = railItem("pl-step", `<span class="pl-dot"><span class="num o">${n}</span></span>
    <div class="pl-body"><span class="t-label pl-when">${when}</span><span class="t-strong">${title}</span><span class="t-small muted">${meta}</span>
    <div class="pl-act"><button class="pbtn primary">${act}</button><span class="t-small muted">undo anytime</span></div></div>`);
  return r;
}
async function settle(w, r, label) {
  const act = r.querySelector(".pl-act"); act.innerHTML = `<span class="t-small muted pl-busy"><i class="ring"></i>Writing to BMS…</span>`; down();
  await w(700);
  r.classList.add("on"); act.innerHTML = `<span class="tick t-data">${CHK.replace("<svg", '<svg class="chk"')}${label}</span>`;
}
async function planStep1(w) {
  rail = add(`<span class="t-small muted">Plan</span>`, "pl");
  await check(w, "Checking Chiller 1 has room", "Chiller 1 has 38% to spare");
  const r = stepNode(1, "Now", "Shift 20% of the work to Chiller 1", "saves ¥250/day", "Apply");
  r.querySelector("button").addEventListener("click", () => guard((w2) => step1Run(w2, r)));
}
async function step1Run(w, r) {
  if (busy) return; busy = true;
  await settle(w, r, "Applied · 15:58");
  scene.setApplied(true); app.classList.add("applied"); setObj(false); phase = "applied";
  await w(500);
  railItem("fb", `<span class="pl-dot">${CHK}</span><span class="t-small">Chiller 2 down to 80% load</span>`);
  await w(800);
  await check(w, "Finding a team to clean the tubes", "Maintenance A · busy until Mon", false);
  await check(w, "Checking Maintenance B", "Maintenance B · free Sat 08:00–12:00");
  const r2 = stepNode(2, "Sat 08:00", "Clean the tubes", `${link("Maintenance B")} · 4 h · fixes the cause`, "Book");
  r2.querySelector("button").addEventListener("click", () => guard((w2) => step2Run(w2, r2)));
  busy = false;
}
async function step2Run(w, r) {
  if (busy) return; busy = true;
  await settle(w, r, "Booked");
  await w(400);
  thinking(true); await w(500); thinking(false); const say = add("", "say t-body"); words(say, script.done); await w(script.done.split(" ").length * 55 + 400);
  const pills = add('<button class="pbtn primary" id="back">Back to overview</button><button class="pbtn" id="undo-chat">Undo</button>', "pills");
  $("#back", pills).addEventListener("click", backToOverview);
  $("#undo-chat", pills).addEventListener("click", undoInChat);
  busy = false;
}
// for ?state=s3: walk both steps
async function apply() { for (const n of [1, 2]) { const b = rail?.querySelectorAll(".pl-item.pl-step")[n - 1]?.querySelector("button"); if (!b) return; b.click(); await sleep(T(n === 1 ? 5200 : 3200)); } }
function undoInChat() {
  cancelRun();
  scene.setApplied(false); phase = "issue"; app.classList.remove("applied");
  setObj(true);
  $(".pills")?.remove();
  add("Undone. Chiller 2 is back to 50%. The booking is cancelled.", "say t-body");
  guard(async (w) => { busy = true; await w(600); await planStep1(w); busy = false; });
}

/* ---------- S2 → S3: back to the overview, which changed ---------- */
let toastTimer = 0;
async function backToOverview() {
  resetZoom();
  app.classList.remove("s2"); app.classList.add("s1");
  marks.forEach((m) => m.el.classList.remove("show")); amarks.forEach((m) => m.classList.remove("show"));
  scene.setState("s1"); $("#live-label").textContent = "Building B1 · live"; $("#zl2").innerHTML = "02&nbsp;&nbsp;B1 · Live"; $("#fig").textContent = "Fig. 01 — B1 cutaway, iso 62°";
  if (phase === "applied") {
    phase = "after"; scene.setFixed(true); app.classList.add("fixed"); pinValue("fixing");
    renderInsights("after"); enter([...document.querySelectorAll("#insights > *")], 200, 80);
    $("#badge").classList.add("show");
    const cap = $("#cost-cap"); cap.classList.remove("accent"); cap.classList.add("muted"); costBar(false); $("#limit-v").classList.remove("accent");
    
    pins[0].v = "fixing"; pins[0].el.classList.remove("hot"); pins[0].el.querySelector(".v").textContent = "fixing";
    $("#clock").textContent = "15:58";
    await sleep(T(700));
    toast("Plan applied", true);
  }
}
function toast(text, undo) {
  $("#toast-text").textContent = text; $("#toast-undo").style.display = undo ? "" : "none"; $("#toast .div").style.display = undo ? "" : "none";
  $("#toast").classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => $("#toast").classList.remove("show"), 5000);
}
function undoPlan() {
  phase = "issue"; scene.setApplied(false); scene.setFixed(false); app.classList.remove("fixed", "applied"); pinValue("+14% power");
  renderInsights("issue"); $("#badge").classList.remove("show");
  const cap = $("#cost-cap"); cap.classList.add("accent"); cap.classList.remove("muted"); costBar(true); $("#limit-v").classList.add("accent");
  pins[0].el.classList.add("hot"); pins[0].el.querySelector(".v").textContent = "+14% power";
  $("#clock").textContent = "15:59";
}
$("#toast-undo").addEventListener("click", () => { undoPlan(); toast("Plan undone", false); if (app.classList.contains("view-actions")) actions.render(); });

/* ---------- other controls ---------- */
$("#close").addEventListener("click", () => { cancelRun(); backToOverview(); });
// the logo and Overview both lead home
$("#rail").addEventListener("click", () => { const on = !app.classList.contains("nav-open"); app.classList.toggle("nav-open", on); $("#rail").setAttribute("aria-label", on ? "Collapse menu" : "Expand menu"); });
/* Actions: the stage and insights step aside for the action table; Overview, the logo or Esc bring them back */
const actions = createActions({ phase: () => phase, undo: () => { undoPlan(); toast("Plan undone", false); }, investigate: () => { closeActions(); investigate(); } });
function setNav(ic) { document.querySelectorAll(".nav-item").forEach((b) => b.classList.toggle("on", b.dataset.ic === ic)); }
async function openActions() {
  if (app.classList.contains("focus")) focusMode(false);
  if (app.classList.contains("s2")) { cancelRun(); await backToOverview(); }
  resetZoom(); app.classList.add("view-actions"); setNav("list"); $("#head1 h1").textContent = "Actions"; $("#badge").classList.remove("show");
  actions.show();
}
function closeActions() { if (!app.classList.contains("view-actions")) return false; app.classList.remove("view-actions"); setNav("grid"); $("#head1 h1").textContent = "Overview"; return true; }
$('.nav-item[data-ic="list"]').addEventListener("click", openActions);
const home = () => {
  if (closeActions()) return;
  if (app.classList.contains("focus")) focusMode(false);
  if (app.classList.contains("s2") || app.classList.contains("diving")) { cancelRun(); app.classList.remove("diving"); backToOverview(); }
  else { resetZoom(true); const T = turn.bldg; T.az = 62 + ((((T.az - 62) % 360) + 540) % 360) - 180; if (Math.abs(T.az - 62) > 1) spinTo("bldg", 62, 900); }
};
$(".brand").addEventListener("click", home); $("#crumb-b1").addEventListener("click", home);
$("#crumb-plant").addEventListener("click", () => { const T = turn.plant; T.az = 62 + ((((T.az - 62) % 360) + 540) % 360) - 180; spinTo("plant", 62, 900); }); $('.nav-item[data-ic="grid"]').addEventListener("click", home);
$("#ask").addEventListener("click", () => { closeActions(); if (phase === "issue") investigate(); else { app.classList.add("s2"); app.classList.remove("s1"); scene.setState("s2"); } });
// day / night: the new theme spreads out from the switch you pressed
$("#theme").addEventListener("click", (e) => {
  const t = theme() === "night" ? "day" : "night";
  const go = async () => { document.documentElement.dataset.gc = t; scene.setTheme(t); await Promise.race([artTheme(t), sleep(700)]); try { localStorage.setItem("aigc-theme", t); } catch (err) {} };
  if (!document.startViewTransition || reduce) { go(); return; }
  const r = e.currentTarget.getBoundingClientRect(); const root = document.documentElement.style;
  root.setProperty("--vx", r.left + r.width / 2 + "px"); root.setProperty("--vy", r.top + r.height / 2 + "px");
  document.startViewTransition(go);
});
try { const t = localStorage.getItem("aigc-theme"); if (t && t !== "night") { document.documentElement.dataset.gc = t; scene.setTheme(t); artTheme(t); } } catch (e) {}
$("#filter").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; $("#filter").querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b)); scene.setFilter(b.dataset.f); for (const p of artPins) { const off = b.dataset.f !== "all" && p.cat !== b.dataset.f; p.d.classList.toggle("dimmed", off); p.l.classList.toggle("dimmed", off); p.ln.classList.toggle("dimmed", off); } });
$("#mode3d").addEventListener("click", (e) => { const on = !app.classList.contains("mode3d"); app.classList.toggle("mode3d", on); scene.setActive(on); e.currentTarget.setAttribute("aria-pressed", String(on)); });
$("#range").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; $("#range").querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b)); const r = ranges[b.textContent]; Object.entries(r).forEach(([k, v], j) => roll($(`[data-v="${k}"]`), v, j * 60)); });
/* full view: the stage takes the whole artboard at a larger scale, the panels step aside; Esc or the button returns */
function focusMode(on) {
  app.classList.toggle("focus", on); $("#full").setAttribute("aria-label", on ? "Exit full view" : "Full view");
  try { if (on && !document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {}); if (!on && document.fullscreenElement) document.exitFullscreen(); } catch (e) {}
}
$("#full").addEventListener("click", () => focusMode(!app.classList.contains("focus")));
$("#zoom-reset").addEventListener("click", resetZoom);
document.addEventListener("fullscreenchange", () => { if (!document.fullscreenElement && app.classList.contains("focus")) focusMode(false); });
$("#composer").addEventListener("submit", async (e) => {
  e.preventDefault(); const q = $("#q").value.trim(); if (!q) return; $("#q").value = "";
  add(q.replace(/[<>&]/g, ""), "me"); thinking(true); const d = add(`${sparkSvg.replace('class="spark"', 'class="spark thinking"')}<span class="t-small muted">Thinking…</span>`, "pending"); await sleep(T(1100)); d.remove(); thinking(false);
  const hit = script.replies.find(([re]) => re.test(q)); const say = add("", "say t-body"); words(say, hit ? hit[1] : script.fallback);
});
document.addEventListener("keydown", (e) => { if (e.key !== "Escape") return; if (closeActions()) return; if (app.classList.contains("focus")) focusMode(false); else if (app.classList.contains("s2")) { cancelRun(); backToOverview(); } });

renderInsights("issue"); costBar(true);
slider($("#range")); slider($("#filter")); slider($("#zoom"));
enter([...document.querySelectorAll(".reading, .spec .sr")], 150, 60); document.querySelectorAll("[data-v]").forEach((el, j) => { const v = el.textContent; roll(el, v.replace(/\d/g, "0")); requestAnimationFrame(() => roll(el, v, 300 + j * 90)); });
enter([...document.querySelectorAll("#insights > *")], 350, 80);
/* opening: the building assembles from its data points, falling top to bottom into place;
   then the drawing resolves, the labels arrive, and it turns a little to say "you can turn me" */
async function assemble() {
  const art = $("#art"), img = turn.bldg.img;
  if (reduce || want) { art.classList.remove("assembling"); return; }
  try { await img.decode(); } catch (e) { art.classList.remove("assembling"); return; }
  const W = img.naturalWidth, H = img.naturalHeight, off = document.createElement("canvas"); off.width = W; off.height = H;
  const oc = off.getContext("2d", { willReadFrequently: true }); oc.drawImage(img, 0, 0); const src = oc.getImageData(0, 0, W, H).data;
  const step = 3, P = [];
  for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) {
    const k = (y * W + x) * 4, a = src[k + 3]; if (a < 70) continue;
    const r = Math.random();
    P.push({ x, y, sx: x + (r - 0.5) * 80, sy: y - 260 - Math.random() * 520, d: (y / H) * 760 + Math.random() * 260, c: (a << 24) | (src[k + 2] << 16) | (src[k + 1] << 8) | src[k] });
  }
  const cv = document.createElement("canvas"); cv.className = "assemble"; cv.width = W; cv.height = H; $("#tilt").insertBefore(cv, img.nextSibling);
  const ctx = cv.getContext("2d"), out = ctx.createImageData(W, H), buf = new Uint32Array(out.data.buffer);
  const DUR = 950, END = 760 + 260 + DUR, t0 = performance.now();
  await new Promise((done) => {
    const frame = (now) => {
      const t = now - t0; buf.fill(0);
      for (const p of P) {
        let u = (t - p.d) / DUR; if (u <= 0) continue; if (u > 1) u = 1;
        const e = 1 - Math.pow(1 - u, 4), x = (p.sx + (p.x - p.sx) * e) | 0, y = (p.sy + (p.y - p.sy) * e) | 0;
        if (y < 0 || y >= H - 1 || x < 0 || x >= W - 1) continue;
        const c = u < 0.25 ? ((((p.c >>> 24) * u * 4) & 255) << 24) | (p.c & 0xffffff) : p.c, i = y * W + x;
        buf[i] = c; buf[i + 1] = c; buf[i + W] = c; buf[i + W + 1] = c;
      }
      ctx.putImageData(out, 0, 0);
      if (t < END) requestAnimationFrame(frame); else done();
    };
    requestAnimationFrame(frame);
  });
  art.classList.remove("assembling"); art.classList.add("built");   // the drawing resolves over the points
  setTimeout(() => cv.remove(), 700);
}
const want0 = new URLSearchParams(location.search).get("state");
const want = want0 === "s2" || want0 === "s3";
assemble().then(() => preload("bldg")).then(() => bitmaps("bldg")).then(async () => { await sleep(T(900)); if (app.classList.contains("s1") && turn.bldg.az === 62) { spinTo("bldg", 72, 900); await sleep(T(950)); spinTo("bldg", 62, 1100); } preload("plant"); });
// ?state=s2 or ?state=s3 opens a state directly (for reviews and screenshots)
if (want) (async () => { await sleep(400); await investigate(); if (want0 === "s3") { await sleep(300); await apply(); await sleep(300); await backToOverview(); } })();
