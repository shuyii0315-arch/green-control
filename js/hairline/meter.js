(() => {
/**
 * Meter: an electricity meter on a plinth. Its dial needle sits at today's use;
 * the pointer over the meter swings the needle toward where it points, on a spring.
 */
const { Cam, fit, proj, facing, rings, prism, rrect, poly, open, seg, solid, put, mk, place, pointer, register, disposer, spring, stepS, clamp, unproj } = HL;
function mount({ stage, svg, read }, value) {
  const bag = disposer();
  const C = Cam(45, 0.5, 1.9);
  fit(C, [[-26, -18, 0], [26, 18, 0], [-18, -12, 66], [18, 12, 66]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const [b0, b0i] = rings(-26, -18, 26, 18, 5, 1.6); put(solid(g), prism(P, front, b0, b0i, 0, 4));
  const [b1, b1i] = rings(-18, -12, 18, 12, 6, 1.6); put(solid(g), prism(P, front, b1, b1i, 4, 66));
  const onF = (u, v) => P(u, 12, v);
  mk("path", { d: poly(rrect(-12, 34, 12, 56, 5, 5).map((q) => onF(q.u, q.v))), class: "nf" }, g);
  mk("path", { d: poly(rrect(-8, 14, 8, 22, 2, 4).map((q) => onF(q.u, q.v))), class: "nf lo" }, g);
  const ticks = []; for (let k = 0; k <= 6; k++) { const a = Math.PI * (0.15 + 0.7 * k / 6); ticks.push(seg(onF(-9 * Math.cos(a), 38 + 9 * Math.sin(a)), onF(-7 * Math.cos(a), 38 + 7 * Math.sin(a)))); }
  mk("path", { d: ticks.join(""), class: "nf lo" }, g);
  const needle = mk("path", { class: "nf hi" }, g);
  const hub = mk("circle", { r: 1.6, class: "dot" }, g); place(hub, onF(0, 38));
  const ang = spring(value);
  let last = -1;
  const draw = () => { const v = ang.x; if (Math.abs(v - last) < 1e-4) return; last = v; const a = Math.PI * (0.15 + 0.7 * v); needle.setAttribute("d", seg(onF(0, 38), onF(-10 * Math.cos(a), 38 + 10 * Math.sin(a)))); };
  draw();
  const { wake, unregister } = register(stage, (dt) => { const m = stepS(ang, dt); draw(); return m; });
  bag.add(unregister);
  bag.add(pointer(stage, {
    move([x]) { ang.t = clamp((x - 150) / 100, 0.05, 0.95); read.textContent = "use " + Math.round(ang.t * 100); wake(); },
    leave() { ang.t = value; read.textContent = "rest"; wake(); },
  }));
  read.textContent = "rest";
  return { set(v) { value = v; ang.t = v; wake(); }, destroy: bag.dispose };
}
hairline({ name: "meter", means: "An electricity meter: the needle shows how much power the building has used today.", rules: [4, 5, 9], range: [0.3, 0.62, 0.9], tour: [[150, 160], [250, 160], null], mount });
})();
