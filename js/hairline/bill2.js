(() => {
/**
 * Bill: an electricity bill standing on its edge, its total line bright, with
 * two coins in front of it. The pointer over the bill lifts it a little.
 */
const { Cam, fit, proj, facing, circ, rrect, poly, ringAt, seg, solid, put, prism, mk, pointer, register, disposer, tween, tset, tval, tdone, rad } = HL;
const at = (ring, x, y) => ring.map((q) => ({ ...q, u: q.u + x, v: q.v + y }));
function mount({ stage, svg, read }, value) {
  const bag = disposer();
  const C = Cam(45, 0.5, 1.9);
  fit(C, [[-30, -16, 0], [24, 16, 0], [-30, -24, 62], [26, -24, 62]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const BW = 52, BH = 64, lean = rad(-10);
  const sheet = rrect(0, 0, BW, BH, 3, 4);
  const back = mk("path", { class: "lo" }, g), face = mk("path", { class: "sil" }, g), rules = mk("path", { class: "nf lo" }, g), total = mk("path", { class: "nf hi" }, g), meter = mk("path", { class: "nf" }, g);
  const lift = tween(0);
  // coins, in front of the sheet
  const R = 12, coins = [0, 4.2, 8.4].map((z, i) => ({ z, s: solid(g), x: 10 + [0, -1.5, 1][i], y: 2 + [0, 1.2, -1][i] }));
  coins.forEach((c) => put(c.s, prism(P, front, at(circ(R, 48), c.x, c.y), at(circ(R - 2, 48), c.x, c.y), c.z, c.z + 3.6)));
  let last = -1;
  function draw(now) {
    const l = tval(lift, now); if (Math.abs(l - last) < 1e-3) return !tdone(lift, now); last = l;
    const s = Math.sin(lean), c = Math.cos(lean), x0 = -BW / 2 - 4, y0 = -14;
    const w = (u, v) => P(x0 + u, y0 + v * s, v * c + l), wb = (u, v) => P(x0 + u, y0 + v * s - 1.4 * c, v * c + 1.4 * s + l);
    back.setAttribute("d", poly(sheet.map((q) => wb(q.u, q.v))));
    face.setAttribute("d", poly(sheet.map((q) => w(q.u, q.v))));
    rules.setAttribute("d", [50, 44, 38, 32].map((v) => seg(w(8, v), w(v === 50 ? 30 : BW - 8, v))).join(""));
    total.setAttribute("d", seg(w(BW - 26, 18), w(BW - 8, 18)));
    meter.setAttribute("d", seg(w(8, 18), w(16, 18)) + seg(w(8, 24), w(BW - 8, 24)));
    return !tdone(lift, now);
  }
  draw(0);
  const { wake, unregister } = register(stage, (dt, now) => draw(now));
  bag.add(unregister);
  bag.add(pointer(stage, { move([x, y]) { const on = x < 210 && y < 200; tset(lift, on ? value : 0, performance.now(), 0); read.textContent = on ? "bill" : "rest"; wake(); }, leave() { tset(lift, 0, performance.now(), 0); read.textContent = "rest"; wake(); } }));
  read.textContent = "rest";
  return { set(v) { value = v; }, destroy: bag.dispose };
}
hairline({ name: "bill", means: "An electricity bill with coins in front: what the building's power costs today.", rules: [4, 5, 9], range: [3, 6, 9], tour: [[170, 140], [250, 200], null], mount });
})();
