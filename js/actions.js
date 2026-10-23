/* ---------- Actions ----------
   Everything the AI and people did, are doing and will do: one action per row, on a time axis.
   Top: the whole stretch (Sep 21 → Nov 15) with a window; the table shows what is inside the window.
   Drag the window to move through time, drag its edges (or Day / Week / Month) to zoom.
   Hover a row for a short card, click it to open it in place. */

const $ = (s, r = document) => r.querySelector(s);
const H = 24, SPAN_ALL = 56 * H;                // hours from Mon Sep 21 00:00
const DAY0 = Date.UTC(2026, 8, 21);
const LW = 260, W = 1140 - LW, RH = 60, OPEN = 36;
const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const pad = (n) => String(n).padStart(2, "0");
const date = (h) => new Date(DAY0 + h * 3600e3);
const hhmm = (h) => { const d = date(h); return pad(d.getUTCHours()) + ":" + pad(d.getUTCMinutes()); };
const when = (h) => DOW[Math.floor(h / H) % 7] + " " + hhmm(h);
const dayLabel = (h) => (DOW[Math.floor(h / H) % 7] + " " + date(h).getUTCDate()).toUpperCase();
const monLabel = (h) => (MON[date(h).getUTCMonth()] + " " + date(h).getUTCDate()).toUpperCase();
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

/* ---------- data ---------- */
const RUN = { start: 30 * H + 15 + 58 / 60, end: 33 * H + 8 };
const CLEAN = { start: 33 * H + 8, end: 33 * H + 12 };
const WEEK = [
  [28 * H + 7.5, "Started the chillers 20 min later", 96, "as planned"],
  [28 * H + 18, "Set cooling tower fans to night mode", 144, "−9% vs plan"],
  [29 * H + 2, "Charged the battery off-peak", 88, "as planned"],
  [29 * H + 17.75, "Pre-cooled floors 13–27", 206, "as planned"],
  [30 * H + 9 + 40 / 60, "Raised chilled water to 7.5 °C", 118, "+18% vs plan"],
  [30 * H + 13 + 10 / 60, "Moved car charging to after 18:30", 144, "as planned"],
];
const POOL = [["Started the chillers 20 min later", 96], ["Set cooling tower fans to night mode", 144], ["Charged the battery off-peak", 88], ["Pre-cooled floors 13–27", 206], ["Raised chilled water to 7.5 °C", 118], ["Moved car charging to after 18:30", 144], ["Dimmed corridor lights after 20:00", 42], ["Lowered supply air on L2–11", 64], ["Paused AHU-3 for the weekend", 120]];
const RESULTS = ["as planned", "as planned", "+12% vs plan", "as planned", "−6% vs plan"];
let seed = 11; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
const EARLIER = [];
for (let d = 0; d < 28; d++) { const n = rnd() < 0.35 ? 2 : 1; for (let k = 0; k < n; k++) { const p = POOL[Math.floor(rnd() * POOL.length)]; EARLIER.push([d * H + 1 + Math.floor(rnd() * 21) + (rnd() < 0.5 ? 0.5 : 0), p[0], p[1], RESULTS[Math.floor(rnd() * RESULTS.length)]]); } }
const DONE = [...EARLIER, ...WEEK].map(([t, title, save, result], i) => ({ id: "d" + i, code: "A-" + String(380 + i).padStart(4, "0"), kind: "done", t, end: t, title, save, result }));

const NEXT = "A-" + String(380 + DONE.length).padStart(4, "0"), NEXT2 = "A-" + String(381 + DONE.length).padStart(4, "0");

export function createActions({ phase, undo, investigate }) {
  const root = $("#actions"), mini = $("#ac-mini"), head = $("#ac-head"), body = $("#ac-body"), tip = $("#ac-tip");
  const S = { ws: 28 * H, span: 7 * H, open: null };
  const now = () => { const m = ($("#clock")?.textContent || "16:40").match(/(\d+):(\d+)/); return 30 * H + +m[1] + +m[2] / 60; };

  function items() {
    const N = now(), list = [...DONE];
    if (phase() === "issue") list.push({ id: "suggest", code: NEXT, kind: "suggest", t: N, end: RUN.end, title: "Chiller 2 hands 20% to Chiller 1" });
    else list.push({ id: "run", code: NEXT, kind: "run", t: RUN.start, end: RUN.end, title: "Chiller 2 hands 20% to Chiller 1" }, { id: "plan", code: NEXT2, kind: "plan", t: CLEAN.start, end: CLEAN.end, title: "Clean Chiller 2's tubes" });
    return list;
  }
  const meta = (a) => a.code + "  ·  " + metaOnly(a);
  const metaOnly = (a) => a.kind === "done" ? `Done · ${when(a.t)}` : a.kind === "run" ? "Running · until Sat 08:00" : a.kind === "plan" ? "Scheduled · Sat 08:00" : "Suggested · waiting for you";
  const tone = (a) => (a.kind === "run" ? "accent" : a.kind === "plan" ? "" : "muted");

  /* ---------- the whole stretch, with the window ---------- */
  const PD = 1140 / SPAN_ALL;
  function drawMini() {
    const N = now(); let h = "";
    h += `<i class="m-base"></i>`;
    for (let d = 0; d < 56; d += 7) h += `<i class="m-tick" style="left:${d * H * PD}px"></i><span class="m-lab" style="left:${d * H * PD + 4}px">${monLabel(d * H)}</span>`;
    for (const a of DONE) h += `<i class="m-done" style="left:${a.t * PD}px;height:${Math.min(22, 6 + a.save / 12)}px"></i>`;
    if (phase() !== "issue") h += `<i class="m-run" style="left:${RUN.start * PD}px;width:${(RUN.end - RUN.start) * PD}px"></i><i class="m-plan" style="left:${CLEAN.start * PD}px"></i>`;
    h += `<i class="m-now" style="left:${N * PD}px"></i>`;
    h += `<div class="m-win" style="left:${S.ws * PD}px;width:${S.span * PD}px"><span class="m-win-lab">${monLabel(S.ws)}–${S.span > H ? date(S.ws + S.span - 1).getUTCDate() : ""}</span><b class="m-h l"></b><b class="m-h r"></b></div>`;
    mini.innerHTML = h;
    const e = S.ws + S.span - 1, same = date(S.ws).getUTCMonth() === date(e).getUTCMonth();
    mini.querySelector(".m-win-lab").textContent = S.span <= H ? monLabel(S.ws) : `${monLabel(S.ws)}–${same ? date(e).getUTCDate() : monLabel(e)}`;
  }
  // drag the window to move; drag an edge to zoom
  mini.addEventListener("pointerdown", (e) => {
    const win = e.target.closest(".m-win"); if (!win) return;
    e.preventDefault(); const k = mini.getBoundingClientRect().width / 1140, x0 = e.clientX, ws0 = S.ws, span0 = S.span;
    const mode = e.target.classList.contains("l") ? "l" : e.target.classList.contains("r") ? "r" : "move";
    mini.setPointerCapture(e.pointerId); mini.classList.add("dragging");
    const move = (ev) => {
      const dh = Math.round((ev.clientX - x0) / k / PD / H) * H;
      if (mode === "move") S.ws = Math.max(0, Math.min(SPAN_ALL - S.span, ws0 + dh));
      else if (mode === "l") { const ws = Math.max(0, Math.min(ws0 + span0 - H, ws0 + dh)); S.span = Math.min(28 * H, ws0 + span0 - ws); S.ws = ws0 + span0 - S.span; }
      else S.span = Math.max(H, Math.min(28 * H, SPAN_ALL - S.ws, span0 + dh));
      S.open = null; render();
    };
    const up = () => { mini.removeEventListener("pointermove", move); mini.classList.remove("dragging"); };
    mini.addEventListener("pointermove", move); mini.addEventListener("pointerup", up, { once: true }); mini.addEventListener("pointercancel", up, { once: true });
  });
  // Day / Week / Month set the window around now
  const zoom = $("#zoom");
  zoom.addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; const N = now();
    if (b.dataset.z === "day") { S.span = H; S.ws = Math.floor(N / H) * H; } else if (b.dataset.z === "week") { S.span = 7 * H; S.ws = 28 * H; } else { S.span = 28 * H; S.ws = 14 * H; }
    S.open = null; render(); });
  function syncZoom() { const z = S.span === H ? "day" : S.span === 7 * H ? "week" : S.span === 28 * H ? "month" : ""; zoom.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.z === z)); const on = zoom.querySelector("button.on"), ind = zoom.querySelector(".ind"); if (ind) { ind.style.opacity = on ? 1 : 0; if (on) { ind.style.left = on.offsetLeft + "px"; ind.style.width = on.offsetWidth + "px"; } } }

  /* ---------- the table ---------- */
  const X = (h) => LW + ((h - S.ws) / S.span) * W;
  function columns() {
    const step = S.span <= H ? 4 : S.span <= 10 * H ? H : 7 * H, out = [];
    for (let h = S.ws; h < S.ws + S.span - 0.01; h += step) out.push([h, step === 4 ? hhmm(h) : step === H ? dayLabel(h) : monLabel(h), step === H && Math.floor(h / H) === Math.floor(now() / H)]);
    return out;
  }
  function facts(a) {
    const N = now();
    if (a.kind === "run") { const so = Math.round(((N - RUN.start) / H) * 250); return [["Chiller 2 load", "100% → 80%"], ["Saved so far", so >= 1 ? "¥" + so : "just started"], ["Ends", "Sat 08:00"]]; }
    if (a.kind === "plan") return [["Team", "Maintenance B, confirmed"], ["Fixes", "Chiller 2 running hot"]];
    if (a.kind === "suggest") return [["Chiller 2 load", "100% → 80%"], ["Would save", "¥250 / day"]];
    return [["Result", a.result], ["By", "AI, approved by you"]];
  }
  function render() {
    const N = now(), we = S.ws + S.span, cols = columns(), nx = X(N), nowIn = N >= S.ws && N < we;
    drawMini(); syncZoom();
    head.innerHTML = cols.filter(([h]) => !nowIn || Math.abs(X(h) + 24 - nx) > 44).map(([h, l, today]) => `<span class="c-lab${today ? " today" : ""}" style="left:${X(h) + 8}px">${l}</span>`).join("") + (nowIn ? `<span class="c-now" style="left:${nx}px">${hhmm(N)}</span>` : "");
    const list = items().filter((a) => a.t < we && a.end >= S.ws).sort((a, b) => a.t - b.t);
    let y = 8, rows = "";
    for (const a of list) {
      const open = S.open === a.id, x1 = Math.max(LW, X(a.t)), x2 = Math.min(1140, X(a.end)), cy = RH / 2;
      let m = "";
      if (a.kind === "done") { const lab = "saved ¥" + a.save, lw = lab.length * 6.6, x = X(a.t); const left = (x < nx && x + 10 + lw > nx - 8) || x + 10 + lw > 1136; m += `<i class="k-dot" style="left:${x}px;top:${cy}px"></i><span class="k-val" style="${left ? `right:${1140 - x + 10}px` : `left:${x + 10}px`};top:${cy - 7}px">${lab}</span>`; }
      if (a.kind === "run") { m += `<i class="k-run" style="left:${x1}px;width:${x2 - x1}px;top:${cy}px"></i>`; if (X(a.t) >= LW) m += `<i class="k-start" style="left:${X(a.t)}px;top:${cy}px"></i>`; m += `<span class="k-lab accent" style="left:${x1 + 10}px;top:${cy - 24}px">saves ¥250 / day</span>`; }
      if (a.kind === "plan") { m += `<i class="k-plan" style="left:${x1}px;width:${Math.max(6, x2 - x1)}px;top:${cy}px"></i><span class="k-lab" style="left:${x1}px;top:${cy - 24}px">${hhmm(a.t)}–${hhmm(a.end)}</span>`; }
      if (a.kind === "suggest") { m += `<i class="k-sug" style="left:${x1}px;width:${x2 - x1}px;top:${cy}px"></i><span class="k-lab muted" style="left:${x1 + 10}px;top:${cy - 24}px">would save ¥250 / day</span>`; }
      let more = "", extra = 0;
      if (open) {
        // each fact sits under the moment it is about; what you can do sits under the action's name
        const btn = a.kind === "run" ? `<button class="ac-act" data-act="undo">Undo</button>` : a.kind === "suggest" ? `<button class="ac-act" data-act="review">Review</button>` : "";
        const notes = [];
        if (a.kind === "run") { const so = Math.round(((N - RUN.start) / H) * 250);
          notes.push([x1 + 10, "l", "Chiller 2 load", "100% → 80%"]);
          if (x2 - x1 > 460) notes.push([x1 + 10 + 230, "l", "saved so far", so >= 1 ? "¥" + so : "just started"]); }
        if (a.kind === "plan") notes.push([x1, "l", "by", "Maintenance B, confirmed"]);
        if (a.kind === "suggest") notes.push([x1 + 10, "l", "Chiller 2 load", "100% → 80%"]);
        // finished: line up with the "saved ¥…" text above, on whichever side of the dot it sits
        if (a.kind === "done") { const x = X(a.t), lw = ("saved ¥" + a.save).length * 6.6, left = (x < nx && x + 10 + lw > nx - 8) || x + 10 + lw > 1136; notes.push(left ? [x - 10, "r", "result", a.result] : [x + 10, "l", "result", a.result]); }
        const pos = (x, al) => al === "l" ? `left:${x - 4}px` : al === "c" ? `left:${x}px;transform:translateX(-50%)` : al === "r2" ? `right:${1140 - x - (x2 - x1)}px` : `right:${1140 - x - 4}px`;
        // keep only notes that fit without touching each other
        const w = (k, v) => (k.length + v.length + 1) * 6.6 + 8; let last = -1e9;
        for (let i = 0; i < notes.length; i++) { const [x, al, k, v] = notes[i], ww = w(k, v), L = al === "l" ? x - 4 : al === "c" ? x - ww / 2 : x + 4 - ww; if (L < last + 16) { notes.splice(i--, 1); continue; } last = L + ww; }
        extra = btn ? OPEN : 8;
        more = btn + notes.map(([x, al, k, v]) => `<span class="k-note" style="${pos(x, al)};top:${a.kind === "done" ? cy + 7 : cy + 6}px"><span class="muted">${k}</span> ${esc(v)}</span>`).join("");
      }
      rows += `<div class="ac-row${open ? " open" : ""}" data-id="${a.id}" style="top:${y}px;height:${RH + extra}px">
        <div class="ac-name"><span class="t">${esc(a.title)}</span><span class="m ${tone(a)}">${meta(a)}</span><svg class="chev" viewBox="0 0 12 12"><path d="${open ? "M3 4.5l3 3 3-3" : "M4.5 3l3 3-3 3"}"/></svg></div>${m}${more}</div>`;
      y += RH + extra;
    }
    if (!list.length) rows = `<div class="ac-empty t-small muted">No actions in this window</div>`;
    const lines = cols.map(([h]) => `<i class="c-line" style="left:${X(h)}px"></i>`).join("");
    body.innerHTML = `<div class="ac-inner" style="height:${Math.max(y + 8, body.clientHeight)}px">${lines}${rows}${nowIn ? `<i class="c-nowline" style="left:${nx}px"></i>` : ""}</div>`;
    const oct = DONE.filter((a) => a.t >= 10 * H && a.t < 41 * H);
    $("#ac-count").textContent = "¥" + oct.reduce((n, a) => n + a.save, 0).toLocaleString("en-US"); $("#ac-saved").textContent = "Saved in Oct";
  }

  /* hover: the row lights up and a short card follows the pointer; click opens it in place */
  const byId = (id) => items().find((a) => a.id === id);
  body.addEventListener("pointermove", (e) => {
    const row = e.target.closest(".ac-row"); if (!row || row.classList.contains("open") || e.target.closest(".ac-name")) { tip.classList.remove("show"); return; }
    const a = byId(row.dataset.id); if (!a) return;
    const status = a.kind === "run" ? `Running · ${Math.round((RUN.end - now()) / H * 10) / 10} days left` : a.kind === "plan" ? "Scheduled · Sat 08:00–12:00" : a.kind === "suggest" ? "Suggested · not applied" : `Done · ${when(a.t)}`;
    const kv = a.kind === "done" ? [["Saved", "¥" + a.save], ["Result", a.result]] : a.kind === "plan" ? [["Team", "Maintenance B"]] : [["Chiller 2 load", "100% → 80%"], ["Saves", "¥250 / day"]];
    tip.innerHTML = `<span class="t-small ${a.kind === "done" ? "muted" : "accent"}">${status}</span><span class="t-body">${esc(a.title)}</span>${kv.map(([k, v]) => `<span class="kv"><span class="t-small muted">${k}</span><span class="t-data">${v}</span></span>`).join("")}`;
    const r = root.getBoundingClientRect(), k = r.width / root.offsetWidth;
    let x = (e.clientX - r.left) / k + 16, y = (e.clientY - r.top) / k + 18; if (x + 260 > 1140) x -= 290; if (y + tip.offsetHeight > root.offsetHeight) y -= tip.offsetHeight + 36;
    tip.style.transform = `translate(${x}px, ${y}px)`; tip.classList.add("show");
  });
  body.addEventListener("pointerleave", () => tip.classList.remove("show"));
  body.addEventListener("click", (e) => {
    const act = e.target.closest(".ac-act"); if (act) { e.stopPropagation(); tip.classList.remove("show"); if (act.dataset.act === "undo") { undo(); S.open = null; render(); } else investigate(); return; }
    const row = e.target.closest(".ac-row"); if (!row) return; tip.classList.remove("show");
    S.open = S.open === row.dataset.id ? null : row.dataset.id; render();
  });

  return {
    show() { S.open = null; render(); root.querySelectorAll(".ac-row").forEach((r, i) => { r.style.setProperty("--d", i * 35 + "ms"); r.classList.add("in"); }); },
    render,
  };
}
