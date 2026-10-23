(() => {
/**
 * Stack: a chimney on a plinth breathing out three puffs. The pointer near the
 * top lifts the puffs higher, on a spring.
 */
const { Cam, fit, proj, facing, rings, prism, circ, poly, open, ringAt, run, solid, put, mk, pointer, register, disposer, spring, stepS, clamp } = HL;
const at = (ring, x, y) => ring.map((q) => ({ ...q, u: q.u + x, v: q.v + y }));
function mount({ stage, svg, read }, value) {
  const bag = disposer();
  const C = Cam(45, 0.5, 1.7);
  fit(C, [[-22, -16, 0], [22, 16, 0], [0, 0, 64], [24, -30, 96]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const [b0, b0i] = rings(-22, -16, 22, 16, 5, 1.6); put(solid(g), prism(P, front, b0, b0i, 0, 4));
  put(solid(g), prism(P, front, circ(8, 48), circ(6.4, 48), 4, 60));
  mk("path", { d: poly(ringAt(P, circ(6.4, 48), 60)), class: "nf lo" }, g);
  const puffs = [[4, -6, 70, 6.5], [11, -15, 79, 9], [20, -25, 85, 6]].map(([x, y, z, r], i) => ({ x, y, z, r, el: mk("ellipse", { class: i === 1 ? "hi" : "sil" }, g) }));
  const lift = spring(0);
  let last = -1;
  const draw = () => { if (Math.abs(lift.x - last) < 1e-3) return; last = lift.x; puffs.forEach((p, i) => { const [cx, cy] = P(p.x, p.y, p.z + lift.x * (i + 1)); p.el.setAttribute("cx", cx); p.el.setAttribute("cy", cy); p.el.setAttribute("rx", p.r * 1.7); p.el.setAttribute("ry", p.r * 1.55); }); };
  draw();
  const { wake, unregister } = register(stage, (dt) => { const m = stepS(lift, dt); draw(); return m; });
  bag.add(unregister);
  bag.add(pointer(stage, { move([x, y]) { lift.t = clamp((170 - y) / 20, 0, value); read.textContent = "puff " + Math.round(lift.t); wake(); }, leave() { lift.t = 0; read.textContent = "rest"; wake(); } }));
  read.textContent = "rest";
  return { set(v) { value = v; }, destroy: bag.dispose };
}
hairline({ name: "stack", means: "A chimney breathing out puffs: the carbon the building put into the air today.", rules: [3, 4, 9], range: [2, 4, 6], tour: [[200, 120], [200, 220], null], mount });
})();
