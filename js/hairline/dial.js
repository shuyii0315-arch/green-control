(() => {
/**
 * Dial: a panel gauge standing on a plinth. The needle rests near the red
 * line, at the share of the contract limit drawn right now; the pointer moves it.
 */
const { Cam, fit, proj, facing, rings, prism, rrect, poly, seg, solid, put, mk, place, pointer, register, disposer, spring, stepS, clamp } = HL;
function mount({ stage, svg, read }, value) {
  const bag = disposer();
  const C = Cam(45, 0.5, 1.75);
  fit(C, [[-30, -10, 0], [30, 10, 0], [-26, -6, 58], [26, 6, 58]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const [b0, b0i] = rings(-30, -10, 30, 10, 5, 1.6); put(solid(g), prism(P, front, b0, b0i, 0, 4));
  const [b1, b1i] = rings(-26, -5, 26, 5, 5, 1.4); put(solid(g), prism(P, front, b1, b1i, 4, 58));
  const onF = (u, v) => P(u, 5, v);
  mk("path", { d: poly(rrect(-21, 10, 21, 52, 6, 5).map((q) => onF(q.u, q.v))), class: "nf lo" }, g);
  const cx = 0, cz = 20, R = 16, A0 = 200, A1 = -20;
  const pt = (t, r) => { const a = (A0 + (A1 - A0) * t) * Math.PI / 180; return onF(cx + r * Math.cos(a), cz + r * Math.sin(a)); };
  const tk = []; for (let k = 0; k <= 10; k++) tk.push(seg(pt(k / 10, R), pt(k / 10, R - (k % 5 ? 2 : 4))));
  mk("path", { d: tk.join(""), class: "nf" }, g);
  const lim = mk("circle", { r: 1.8, class: "dot m" }, g); place(lim, pt(0.97, R + 3));
  const needle = mk("path", { class: "nf hi" }, g);
  const hub = mk("circle", { r: 2, class: "dot" }, g); place(hub, onF(cx, cz));
  const v = spring(value); let last = -1;
  const draw = () => { if (Math.abs(v.x - last) < 1e-4) return; last = v.x; needle.setAttribute("d", seg(onF(cx, cz), pt(v.x, R - 3))); };
  draw();
  const { wake, unregister } = register(stage, (dt) => { const m = stepS(v, dt); draw(); return m; });
  bag.add(unregister);
  bag.add(pointer(stage, { move([x]) { v.t = clamp((x - 140) / 120, 0, 1); read.textContent = Math.round(v.t * 100) + "%"; wake(); }, leave() { v.t = value; read.textContent = "rest"; wake(); } }));
  read.textContent = "rest";
  return { set(n) { value = n; v.t = n; wake(); }, destroy: bag.dispose };
}
hairline({ name: "dial", means: "A panel gauge: how close the building's power draw is to its contract limit right now.", rules: [3, 4, 9], range: [0.5, 0.92, 1], tour: [[160, 170], [240, 170], null], mount });
})();
