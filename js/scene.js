// Building B1 and its chiller plant, as a live 3D line-art model.
// Look follows the Anatomy rules: base and structure in low and mid tones,
// the subject in the high tone, exactly one accent (Chiller 2's condenser loop).
import * as THREE from "three";
import { OrbitControls } from "./vendor/OrbitControls.js";

const PALETTE = {
  night: {
    face: "#202226", faceLo: "#18191c", glass: "#9fb0c2", ground: "#141517",
    hi: "#e4e6ea", mid: "#7a7f88", lo: "#3c3f45", faint: "#2a2c30",
    accent: "#ff6b1a", hotFace: "#2a1408", flow: "#f2f3f5", light: "#ededed",
    hemiSky: "#ffffff", hemiGround: "#3a3c40", hemi: 0.55, dir: 1.15,
  },
  day: {
    face: "#ffffff", faceLo: "#efefed", glass: "#5d6b78", ground: "#f1f1ef",
    hi: "#1c1e22", mid: "#8e939b", lo: "#c9cdd3", faint: "#e2e5e9",
    accent: "#1f4fff", hotFace: "#dfe6ff", flow: "#22252b", light: "#0e0f11",
    hemiSky: "#ffffff", hemiGround: "#d9dce0", hemi: 1.9, dir: 0.85,
  },
};

const LEVELS = [
  { id: "B2", label: "B2", y0: 0, h: 4 },
  { id: "B1", label: "B1", y0: 4, h: 5.2 },
  { id: "L1", label: "L1", y0: 9.2, h: 4 },
  { id: "L2", label: "L2–11", y0: 13.2, h: 9 },
  { id: "L12", label: "L12", y0: 22.2, h: 4 },
  { id: "L13", label: "L13–27", y0: 26.2, h: 9 },
  { id: "Roof", label: "Roof", y0: 35.2, h: 4 },
];
const W = 24, D = 14, X0 = -W / 2, Z0 = -D / 2;

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a, b, t) => a + (b - a) * t;

export function createScene(canvas, { onHover, onPick } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 2000);
  const HALF = Math.tan((7 * Math.PI) / 180); // view size = radius × this, as with a 14° lens
  let viewR = 236, cw = 0, ch = 0;
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.dampingFactor = 0.08;
  controls.enablePan = false; controls.rotateSpeed = 0.55; controls.zoomSpeed = 0.6;
  controls.minPolarAngle = Math.PI * 0.18; controls.maxPolarAngle = Math.PI * 0.47;
  controls.autoRotate = true; controls.autoRotateSpeed = 0.35;

  let theme = "night";
  let P = PALETTE[theme];
  const hemi = new THREE.HemisphereLight(P.hemiSky, P.hemiGround, P.hemi);
  const sun = new THREE.DirectionalLight(0xffffff, P.dir); sun.position.set(-30, 60, 40);
  const fill = new THREE.DirectionalLight(0xffffff, 0.25); fill.position.set(40, 20, -30);
  scene.add(hemi, sun, fill);

  // ---------- materials, cached by layer × category × kind so they can fade and dim ----------
  const mats = new Map();
  let fixedState = false;
  const layerFade = {}; const catDim = {}; LEVELS.forEach((l) => (layerFade[l.id] = 1)); layerFade.ground = 1; layerFade.plant = 1;
  function mat(layer, cat, kind) {
    const key = `${layer}|${cat}|${kind}`;
    let m = mats.get(key);
    if (m) return m;
    if (kind.startsWith("edge")) m = new THREE.LineBasicMaterial({ transparent: true });
    else if (kind === "flow" || kind === "flowHot" || kind === "light") m = new THREE.MeshBasicMaterial({ transparent: true });
    else m = new THREE.MeshLambertMaterial({ transparent: true, flatShading: true, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
    m.userData = { layer, cat, kind, base: 1 };
    if (kind === "glass") m.userData.base = 0.05, (m.depthWrite = false), (m.side = THREE.DoubleSide);
    if (kind === "edgeFaint") m.userData.base = 0.9;
    mats.set(key, m); paint(m); return m;
  }
  function paint(m) {
    let { kind } = m.userData; P = PALETTE[theme];
    if (fixedState) kind = { hot: "face", edgeHot: "edgeHi", flowHot: "flow" }[kind] || kind;
    const c = { face: P.face, faceLo: P.faceLo, glass: P.glass, ground: P.ground, hot: P.hotFace,
      edgeHi: P.hi, edgeMid: P.mid, edgeLo: P.lo, edgeFaint: P.faint, edgeHot: P.accent, flow: P.flow, flowHot: P.accent, light: P.light }[kind];
    m.color.set(c);
    if (m.userData.kind === "hot") { m.emissive = new THREE.Color(fixedState ? "#000000" : P.accent); m.emissiveIntensity = fixedState ? 0 : (theme === "night" ? 0.12 : 0.05); }
  }
  function applyOpacity() {
    for (const m of mats.values()) {
      const { layer, cat, base } = m.userData;
      const o = base * (layerFade[layer] ?? 1) * (catDim[cat] ?? 1);
      m.opacity = o; m.visible = o > 0.01;
      if (m.isMeshLambertMaterial) m.depthWrite = o > 0.97 && m.userData.kind !== "glass";
    }
  }

  const pickables = []; // meshes that answer the pointer
  const byId = {};      // object id → group
  const hotParts = [];  // Chiller 2's condenser loop
  function part(geom, { layer, cat = "structure", fill = "face", edge = "edgeMid", hot = false, at, rot, parent = scene, id, edgesOnly = false, threshold = 28 }) {
    const g = new THREE.Group();
    if (!edgesOnly) { const mesh = new THREE.Mesh(geom, mat(layer, cat, hot ? "hot" : fill)); g.add(mesh); if (id) { mesh.userData.id = id; pickables.push(mesh); } }
    const lines = new THREE.LineSegments(new THREE.EdgesGeometry(geom, threshold), mat(layer, cat, hot ? "edgeHot" : edge));
    g.add(lines);
    if (at) g.position.set(...at);
    if (rot) g.rotation.set(...rot);
    parent.add(g);
    if (hot) hotParts.push(g);
    return g;
  }
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const cylX = (r, len, seg = 28) => new THREE.CylinderGeometry(r, r, len, seg, 1).rotateZ(Math.PI / 2);
  const cylY = (r, h, seg = 28) => new THREE.CylinderGeometry(r, r, h, seg, 1);

  // ---------- ground ----------
  const G = 9.2;
  if (false) {
    const ring = [[-40, -12, 80, 5], [-40, 7, 80, 22], [-40, -7, 28, 14], [12, -7, 28, 14]];
    for (const [x, z, w, d] of ring) part(box(w, 0.2, d), { layer: "ground", fill: "ground", edge: "edgeFaint", at: [x + w / 2, G - 0.1, z + d / 2] });
    const grid = []; for (let x = -38; x <= 38; x += 4) { if (x > X0 - 0.2 && x < X0 + W + 0.2) { grid.push(x, G, -30, x, G, Z0, x, G, Z0 + D, x, G, 30); } else grid.push(x, G, -30, x, G, 30); }
    for (let z = -28; z <= 28; z += 4) { if (z > Z0 && z < Z0 + D) grid.push(-40, G, z, X0, G, z, X0 + W, G, z, 40, G, z); else grid.push(-40, G, z, 40, G, z); }
    const gg = new THREE.BufferGeometry(); gg.setAttribute("position", new THREE.Float32BufferAttribute(grid, 3));
    scene.add(new THREE.LineSegments(gg, mat("ground", "structure", "edgeFaint")));
  }

  // ---------- structure: slabs, columns, back and side walls (front is cut away) ----------
  for (const L of LEVELS) {
    const layer = L.id;
    part(box(W + 0.6, 0.45, D + 0.6), { layer, fill: "faceLo", edge: "edgeMid", at: [0, L.y0 - 0.22, 0] });
    if (L.id === "Roof") continue;
    for (const [x, z] of [[X0, Z0], [X0 + W, Z0], [X0, Z0 + D], [X0 + W, Z0 + D], [0, Z0], [0, Z0 + D]]) part(box(0.5, L.h, 0.5), { layer: z > 0 && L.id === "B1" ? "B1front" : layer, fill: "face", edge: "edgeMid", at: [x, L.y0 + L.h / 2, z] });
    // back and left walls: faint glass with mullions above ground, concrete below
    const below = L.y0 < G;
    part(new THREE.PlaneGeometry(W, L.h), { layer, fill: below ? "faceLo" : "glass", edge: "edgeLo", at: [0, L.y0 + L.h / 2, Z0 + 0.02] });
    part(new THREE.PlaneGeometry(D, L.h), { layer, fill: below ? "faceLo" : "glass", edge: "edgeLo", at: [X0 + 0.02, L.y0 + L.h / 2, 0], rot: [0, Math.PI / 2, 0] });
    if (!below) {
      const m = []; for (let x = X0 + 2; x < X0 + W; x += 2) m.push(x, L.y0, Z0 + 0.03, x, L.y0 + L.h, Z0 + 0.03);
      for (let z = Z0 + 2; z < Z0 + D; z += 2) m.push(X0 + 0.03, L.y0, z, X0 + 0.03, L.y0 + L.h, z);
      const mg = new THREE.BufferGeometry(); mg.setAttribute("position", new THREE.Float32BufferAttribute(m, 3));
      scene.add(new THREE.LineSegments(mg, mat(layer, "structure", "edgeFaint")));
    }
    // grouped floors read as several thin slabs
    if (L.h > 6) for (let k = 1; k < 3; k++) part(box(W, 0.18, D), { layer, fill: "faceLo", edge: "edgeLo", at: [0, L.y0 + k * (L.h / 3), 0] });
  }
  // a cut line along the front edges, like a drawing section
  {
    const s = []; for (const L of LEVELS) s.push(X0 - 0.3, L.y0, Z0 + D + 0.3, X0 + W + 0.3, L.y0, Z0 + D + 0.3, X0 + W + 0.3, L.y0, Z0 + D + 0.3, X0 + W + 0.3, L.y0, Z0 - 0.3);
    const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.Float32BufferAttribute(s, 3));
    scene.add(new THREE.LineSegments(sg, mat("ground", "structure", "edgeMid")));
  }

  // ---------- B2 · car charging ----------
  const evLights = [];
  for (let i = 0; i < 6; i++) {
    const x = -8 + i * 3.2, z = 4.6;
    part(box(0.45, 1.5, 0.3), { layer: "B2", cat: "ev", fill: "face", edge: "edgeHi", at: [x, 0.75, z], id: "ev" });
    const lm = new THREE.MeshBasicMaterial({ transparent: true, color: PALETTE[theme].accent });
    lm.userData = { layer: "B2", cat: "ev", kind: "evlight", base: 1 };
    mats.set("evlight" + i, lm);
    const led = new THREE.Mesh(box(0.08, 0.5, 0.32), lm); led.position.set(x + 0.24, 0.95, z); scene.add(led); evLights.push(lm);
    if (i % 2 === 0) part(box(2.1, 0.9, 4.2), { layer: "B2", cat: "ev", fill: "faceLo", edge: "edgeLo", at: [x + 0.6, 0.55, z - 3.2] });
  }

  // ---------- B1 · chiller plant ----------
  const plant = new THREE.Group(); scene.add(plant);
  const chillers = {};
  function chiller(id, x, z, hot) {
    const y = 4;
    const grp = new THREE.Group(); grp.position.set(x, y, z); plant.add(grp);
    byId[id] = grp;
    const o = { layer: "B1", cat: "cooling", parent: grp, id };
    part(box(7.6, 0.32, 2.9), { ...o, fill: "faceLo", edge: "edgeMid", at: [0, 0.16, 0] });
    for (const sx of [-2.8, 2.8]) part(box(0.5, 0.9, 2.4), { ...o, fill: "face", edge: "edgeMid", at: [sx, 0.77, 0] });
    // evaporator (back) and condenser (front)
    part(cylX(0.62, 6.6), { ...o, fill: "face", edge: "edgeHi", at: [0, 1.5, -0.7] });
    part(cylX(0.62, 6.6), { ...o, fill: "face", edge: "edgeHi", at: [0, 1.5, 0.7], hot, id: hot ? "condenser" : id });
    for (const ex of [-3.4, 3.4]) for (const ez of [-0.7, 0.7]) part(cylX(0.7, 0.22), { ...o, fill: "faceLo", edge: "edgeMid", at: [ex, 1.5, ez], hot: hot && ez > 0 });
    for (let k = -2; k <= 2; k++) part(cylX(0.64, 0.06, 28), { ...o, edgesOnly: true, edge: "edgeLo", at: [k * 1.25, 1.5, -0.7] });
    // compressor, volute and motor on top
    part(cylX(0.48, 2.4), { ...o, fill: "face", edge: "edgeHi", at: [-0.6, 2.75, 0] });
    part(new THREE.TorusGeometry(0.52, 0.22, 10, 26).rotateY(Math.PI / 2), { ...o, fill: "face", edge: "edgeMid", at: [-2.0, 2.75, 0] });
    part(cylX(0.4, 1.6), { ...o, fill: "faceLo", edge: "edgeMid", at: [1.5, 2.75, 0] });
    for (let k = 0; k < 7; k++) part(cylX(0.43, 0.04, 20), { ...o, edgesOnly: true, edge: "edgeLo", at: [0.95 + k * 0.18, 2.75, 0] });
    part(box(0.5, 0.5, 0.5), { ...o, fill: "face", edge: "edgeMid", at: [2.6, 2.75, 0] });
    part(cylY(0.16, 0.9, 12), { ...o, fill: "face", edge: "edgeMid", at: [-0.2, 2.15, 0.35] });
    // control panel
    part(box(0.25, 1.6, 1.2), { ...o, fill: "faceLo", edge: "edgeMid", at: [3.85, 1.15, -0.3] });
    chillers[id] = { grp, x, z };
  }
  chiller("chiller1", -4.6, -3.0, false);
  chiller("chiller2", -4.6, 1.6, true);
  // condenser water pumps and the switchboard
  for (const [i, z] of [[0, 3.6], [1, -1.2]]) {
    const pid = i === 0 ? "pump2" : "pump1";
    part(box(1.8, 0.3, 1.0), { layer: "B1", cat: "cooling", fill: "faceLo", edge: "edgeMid", at: [2.2, 4.15, z], id: pid });
    part(cylX(0.32, 0.9), { layer: "B1", cat: "cooling", fill: "face", edge: "edgeHi", at: [2.6, 4.65, z], id: pid });
    part(new THREE.CylinderGeometry(0.42, 0.42, 0.5, 20), { layer: "B1", cat: "cooling", fill: "face", edge: "edgeMid", at: [1.7, 4.7, z], id: pid });
  }
  for (let i = 0; i < 4; i++) part(box(1.1, 2.6, 0.8), { layer: "B1", cat: "power", fill: "face", edge: "edgeMid", at: [6 + i * 1.2, 5.3, -5.8], id: "switchboard" });

  // ---------- L1 · lobby and the outdoor battery yard ----------
  part(box(4, 1.1, 1.2), { layer: "L1", fill: "face", edge: "edgeMid", at: [-2, 9.75, 1.5] });
  part(box(8, 0.3, 9), { layer: "L1", cat: "storage", fill: "faceLo", edge: "edgeMid", at: [17.5, 9.35, 0] });
  for (let i = 0; i < 3; i++) {
    const g = part(box(1.8, 2.6, 1.4), { layer: "L1", cat: "storage", fill: "face", edge: "edgeHi", at: [15.2 + i * 2.3, 10.8, -1.5], id: "battery" });
    for (let k = 0; k < 4; k++) part(box(1.2, 0.02, 0.02), { layer: "L1", cat: "storage", edgesOnly: true, edge: "edgeLo", at: [15.2 + i * 2.3, 10.1 + k * 0.35, -0.79] });
  }
  part(box(2.4, 1.6, 1.6), { layer: "L1", cat: "storage", fill: "faceLo", edge: "edgeMid", at: [16.5, 10.3, 2.6], id: "battery" });

  // ---------- typical floors: air handlers ----------
  for (const L of [LEVELS[3], LEVELS[5]]) for (let k = 0; k < 3; k++) {
    const y = L.y0 + k * (L.h / 3);
    part(box(3, 1.2, 1.6), { layer: L.id, cat: "cooling", fill: "face", edge: "edgeMid", at: [-7 + (k % 2) * 3, y + 0.75, -4.8] });
    part(box(1.4, 1.0, 1.4), { layer: L.id, fill: "faceLo", edge: "edgeLo", at: [5 - k * 2, y + 0.6, 1] });
  }
  // ---------- L12 · IT room and backup power ----------
  for (let i = 0; i < 7; i++) {
    part(box(0.8, 2.6, 1.1), { layer: "L12", cat: "power", fill: "face", edge: "edgeMid", at: [-8 + i * 1.0, 23.6, -3.2] });
    for (let k = 0; k < 5; k++) part(box(0.6, 0.02, 0.02), { layer: "L12", cat: "power", edgesOnly: true, edge: "edgeLo", at: [-8 + i * 1.0, 22.8 + k * 0.38, -2.64] });
  }
  for (let i = 0; i < 3; i++) part(box(1.3, 2.3, 1.0), { layer: "L12", cat: "power", fill: "face", edge: "edgeHi", at: [4.5 + i * 1.5, 23.4, -3.4], id: "ups" });

  // ---------- roof · cooling towers and solar ----------
  const fans = [];
  for (const [i, x] of [[1, -7.5], [2, -3.0]]) {
    const tid = "tower" + i;
    part(box(3.8, 2.6, 3.8), { layer: "Roof", cat: "cooling", fill: "face", edge: "edgeHi", at: [x, 36.5, -2.5], id: tid });
    for (let k = 0; k < 6; k++) part(box(3.82, 0.02, 3.82), { layer: "Roof", cat: "cooling", edgesOnly: true, edge: "edgeLo", at: [x, 35.6 + k * 0.22, -2.5] });
    part(cylY(1.45, 0.9, 32), { layer: "Roof", cat: "cooling", fill: "face", edge: "edgeHi", at: [x, 38.25, -2.5], id: tid });
    const fan = new THREE.Group(); fan.position.set(x, 38.65, -2.5);
    for (let b = 0; b < 5; b++) { const bl = part(box(1.25, 0.05, 0.3), { layer: "Roof", cat: "cooling", fill: "faceLo", edge: "edgeMid", parent: fan, at: [0.62, 0, 0] }); const piv = new THREE.Group(); piv.rotation.y = (b / 5) * Math.PI * 2; piv.add(bl); fan.add(piv); }
    scene.add(fan); fans.push(fan);
  }
  for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) part(box(3.6, 0.08, 1.6), { layer: "Roof", cat: "power", fill: "faceLo", edge: "edgeMid", at: [4.5 + c * 4, 36.1, -4.5 + r * 2.6], rot: [-0.32, 0, 0], id: "pv" });

  // ---------- pipes with flow ----------
  const flows = [];
  function pipe(points, { layer, cat = "cooling", hot = false, r = 0.2, speed = 3, count = 26, id }) {
    // straight runs joined by small rounded bends, so the tube never pinches at a corner
    const P3 = points.map((p) => new THREE.Vector3(...p));
    const path = new THREE.CurvePath(); const R = 0.45;
    let start = P3[0].clone();
    for (let i = 1; i < P3.length - 1; i++) {
      const a = P3[i - 1], b = P3[i], c = P3[i + 1];
      const r1 = Math.min(R, a.distanceTo(b) / 2), r2 = Math.min(R, b.distanceTo(c) / 2);
      const p1 = b.clone().add(a.clone().sub(b).setLength(r1)), p2 = b.clone().add(c.clone().sub(b).setLength(r2));
      if (start.distanceTo(p1) > 1e-3) path.add(new THREE.LineCurve3(start, p1));
      path.add(new THREE.QuadraticBezierCurve3(p1, b.clone(), p2)); start = p2;
    }
    path.add(new THREE.LineCurve3(start, P3[P3.length - 1]));
    const segs = Math.max(80, Math.round(path.getLength() * 6));
    const tube = new THREE.TubeGeometry(path, segs, r, 12, false);
    part(tube, { layer, cat, fill: "face", edge: "edgeLo", hot, threshold: 70, id });
    // flow shows only on the loop that matters: small bright beads riding on the pipe
    const n = hot ? Math.round(path.getLength() / 1.6) : 0;
    const pm = mat(layer, cat, "flowHot");
    const dots = new THREE.InstancedMesh(new THREE.SphereGeometry(r * 1.08, 12, 8), pm, Math.max(1, n));
    dots.frustumCulled = false; dots.visible = n > 0; scene.add(dots);
    const f = { path, dots, count: n, len: path.getLength(), speed, rate: 1, phase: Math.random() };
    flows.push(f); return f;
  }
  const c2 = chillers.chiller2, c1 = chillers.chiller1;
  // Chiller 2's condenser loop: up the riser to the towers (the accent)
  const loop2 = pipe([[c2.x + 3.5, 5.5, c2.z + 0.7], [c2.x + 4.6, 5.5, c2.z + 0.7], [c2.x + 4.6, 8.7, c2.z + 0.7], [-10.6, 8.7, c2.z + 0.7], [-10.6, 8.7, -5.6], [-10.6, 37.6, -5.6], [-7.5, 37.6, -5.6], [-7.5, 37.6, -4.4]], { layer: "B1", hot: true, r: 0.2, speed: 4.2, count: 80, id: "condenser" });
  const ret2 = pipe([[-6.6, 35.4, -4.4], [-6.6, 35.0, -6.2], [-9.8, 35.0, -6.2], [-9.8, 8.0, -6.2], [-9.8, 8.0, c2.z + 1.3], [c2.x - 3.6, 8.0, c2.z + 1.3], [c2.x - 3.6, 5.5, c2.z + 0.7]], { layer: "B1", r: 0.13, speed: 4.2, count: 56 });
  // Chiller 1's loop, quieter
  const loop1 = pipe([[c1.x + 3.5, 5.5, c1.z + 0.7], [c1.x + 4.6, 5.5, c1.z + 0.7], [c1.x + 4.6, 7.9, c1.z + 0.7], [-10.2, 7.9, c1.z + 0.7], [-10.2, 7.9, -5.2], [-10.2, 37.0, -5.2], [-3.0, 37.0, -5.2], [-3.0, 37.0, -4.4]], { layer: "B1", r: 0.13, speed: 4.2, count: 56 });
  // chilled water up to the floors
  pipe([[c1.x - 3.5, 5.2, c1.z - 0.7], [-11.2, 5.2, c1.z - 0.7], [-11.2, 5.2, -6.4], [-11.2, 34.6, -6.4]], { layer: "B1", r: 0.12, speed: 2.6, count: 44 });

  // ---------- anchors for the labels the page draws ----------
  const anchors = {
    chiller2: new THREE.Vector3(c2.x + 1.2, 6.1, c2.z + 1.1),
    ups: new THREE.Vector3(6, 24.9, -3.2),
    battery: new THREE.Vector3(16.3, 12.3, -1.5),
    ev: new THREE.Vector3(2.2, 1.9, 4.6),
    m1: new THREE.Vector3(c1.x - 0.6, 7.25, c1.z),
    m2: new THREE.Vector3(c2.x + 3.5, 5.5, c2.z + 1.45),
    m3: new THREE.Vector3(c2.x - 1.2, 6.1, c2.z + 1.3),
  };
  for (const L of LEVELS) anchors["floor:" + L.label] = new THREE.Vector3(X0 - 0.4, L.y0 + (L.id === "Roof" ? 0.6 : Math.min(L.h, 4) / 2), Z0 + D + 0.3);

  // ---------- views ----------
  const VIEWS = {
    s1: { target: new THREE.Vector3(2, 18, 0), radius: 236, theta: 0.49, phi: Math.PI / 3, offset: 0.06, min: 150, max: 320 },
    s2: { target: new THREE.Vector3(-3.6, 5.2, -0.4), radius: 92, theta: 0.49, phi: Math.PI / 3, offset: 0, min: 56, max: 140 },
  };
  let view = { ...VIEWS.s1, target: VIEWS.s1.target.clone() };
  let offsetFrac = VIEWS.s1.offset;
  function placeCamera(v) {
    const { target, radius, theta, phi } = v;
    const D = 600; viewR = radius;
    camera.position.set(target.x + D * Math.sin(phi) * Math.sin(theta), target.y + D * Math.cos(phi), target.z + D * Math.sin(phi) * Math.cos(theta));
    controls.target.copy(target); camera.lookAt(target); frustum();
  }
  placeCamera(view);
  controls.minZoom = 0.6; controls.maxZoom = 2.4;

  let flight = null;
  function fly(to, dur = 1500) {
    const sph = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
    flight = { t0: performance.now(), dur, from: { target: controls.target.clone(), radius: viewR / camera.zoom, theta: sph.theta, phi: sph.phi, offset: offsetFrac }, to };
    camera.zoom = 1;
    controls.enabled = false;
  }
  const fades = [];
  function fadeLayer(layer, to, dur = 900, delay = 0) { fades.push({ layer, from: layerFade[layer] ?? 1, to, t0: performance.now() + delay, dur }); }

  let state = "s1";
  function setState(s) {
    if (s === state) return; state = s;
    const v = s === "s2" ? VIEWS.s2 : VIEWS.s1;
    let to = { ...v };
    if (s !== "s2") { const sph = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target)); to.theta = VIEWS.s1.theta; }
    fly(to, s === "s2" ? 1600 : 1400);
    pendingLimits = null;
    const inside = s === "s2";
    for (const L of LEVELS) if (L.id !== "B1") fadeLayer(L.id, inside ? (L.id === "B2" ? 0.12 : 0) : 1, inside ? 700 : 900, inside ? 0 : 500);
    fadeLayer("ground", inside ? 0.25 : 1, 800);
    fadeLayer("B1front", inside ? 0.06 : 1, 700);
    controls.autoRotate = !inside;
  }
  let pendingLimits = null;

  // ---------- plan applied: Chiller 1 takes 20% more, Chiller 2 eases ----------
  let applied = false, fixed = false;
  function setApplied(on) { applied = on; loop2.rate = on ? 0.55 : 1; ret2.rate = loop2.rate; loop1.rate = on ? 1.45 : 1; }
  function setFixed(on) { fixed = on; fixedState = on; flows.forEach((f) => (f.dots.visible = !on && f.count > 0)); for (const m of mats.values()) { if (m.userData.kind === "evlight") continue; paint(m); if (m.userData.kind === "hot" && on) m.emissiveIntensity = 0; } }

  // ---------- filter by system ----------
  function setFilter(f) {
    for (const c of ["structure", "cooling", "power", "storage", "ev"]) catDim[c] = f === "all" || c === f ? 1 : c === "structure" ? 0.55 : 0.12;
  }

  // ---------- theme ----------
  function setTheme(t) {
    theme = t; P = PALETTE[t];
    hemi.color.set(P.hemiSky); hemi.groundColor.set(P.hemiGround); hemi.intensity = P.hemi; sun.intensity = P.dir; hoverMat.color.set(t === "night" ? "#ffffff" : "#000000");
    for (const m of mats.values()) { if (m.userData.kind === "evlight") m.color.set(P.accent); else paint(m); }
  }

  // ---------- pointer: hover and pick ----------
  const ray = new THREE.Raycaster(); const ndc = new THREE.Vector2(); let hoverId = null, lastMove = 0, down = null;
  canvas.addEventListener("pointermove", (e) => {
    const now = performance.now(); if (now - lastMove < 40) return; lastMove = now;
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects(pickables, false).filter((h) => h.object.material.visible && h.object.material.opacity > 0.3);
    const id = hits.length ? hits[0].object.userData.id : null;
    if (id !== hoverId) { hoverId = id; highlight(id); }
    onHover && onHover(id, (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
  });
  canvas.addEventListener("pointerleave", () => { hoverId = null; highlight(null); onHover && onHover(null); });
  canvas.addEventListener("pointerdown", (e) => { down = [e.clientX, e.clientY]; idleUntil = performance.now() + 6000; });
  canvas.addEventListener("pointerup", (e) => { if (down && Math.hypot(e.clientX - down[0], e.clientY - down[1]) < 4 && hoverId) onPick && onPick(hoverId); down = null; });
  controls.addEventListener("start", () => { idleUntil = performance.now() + 6000; });
  let idleUntil = 0;
  const glow = new Map();
  function highlight(id) {
    for (const [ln, m] of glow) ln.material = m; glow.clear();
    if (!id) return;
    for (const mesh of pickables) if (mesh.userData.id === id) {
      const ln = mesh.parent.children.find((c) => c.isLineSegments);
      if (ln && !glow.has(ln)) { glow.set(ln, ln.material); ln.material = hoverMat; }
    }
  }
  const hoverMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true });

  // ---------- size ----------

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h || (w === cw && h === ch)) return;
    cw = w; ch = h; renderer.setSize(w, h, false); applyOffset();
  }
  function frustum() { if (!cw) return; const hh = viewR * HALF, hw = hh * (cw / ch); camera.left = -hw; camera.right = hw; camera.top = hh; camera.bottom = -hh; camera.updateProjectionMatrix(); }
  function applyOffset() { frustum(); if (offsetFrac > 0.001) camera.setViewOffset(cw, ch, cw * offsetFrac, 0, cw, ch); else camera.clearViewOffset(); camera.updateProjectionMatrix(); }

  // ---------- projection for HTML labels ----------
  const tmp = new THREE.Vector3();
  function project(name) {
    const a = anchors[name]; if (!a) return null;
    tmp.copy(a).project(camera);
    return { x: (tmp.x + 1) / 2 * cw, y: (1 - tmp.y) / 2 * ch, front: tmp.z < 1 };
  }

  // ---------- loop ----------
  const m4 = new THREE.Matrix4(), pt = new THREE.Vector3();
  // the 3D view is optional: when it is hidden nothing renders (it used to draw every frame underneath the illustration)
  let last = performance.now(), running = false, active = false, onFrame = null;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  function frame(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    resize();
    if (flight) {
      const t = Math.min(1, (now - flight.t0) / flight.dur), k = ease(t), f = flight.from, to = flight.to;
      let dTheta = to.theta - f.theta; dTheta = ((dTheta + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
      const v = { target: f.target.clone().lerp(to.target, k), radius: lerp(f.radius, to.radius, k), theta: f.theta + dTheta * k, phi: lerp(f.phi, to.phi, k) };
      offsetFrac = lerp(f.offset, to.offset, k); applyOffset();
      placeCamera(v);
      if (t >= 1) { flight = null; controls.enabled = true;  }
    }
    for (let i = fades.length - 1; i >= 0; i--) {
      const f = fades[i]; const t = (now - f.t0) / f.dur; if (t < 0) continue;
      layerFade[f.layer] = lerp(f.from, f.to, ease(Math.min(1, t))); if (t >= 1) fades.splice(i, 1);
    }
    applyOpacity();
    controls.autoRotate = false;
    if (!flight) controls.update();
    if (!reduce.matches) {
      for (const f of flows) {
        f.phase = (f.phase + (dt * f.speed * f.rate) / f.len) % 1;
        for (let i = 0; i < f.count; i++) { const u = (f.phase + i / f.count) % 1; f.path.getPointAt(u, pt); m4.makeTranslation(pt.x, pt.y, pt.z); f.dots.setMatrixAt(i, m4); }
        f.dots.instanceMatrix.needsUpdate = true;
      }
      fans.forEach((fn, i) => (fn.rotation.y += dt * (i === 0 ? (applied ? 2.2 : 3.6) : (applied ? 4.6 : 3.4))));
      evLights.forEach((m, i) => (m.opacity = (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(now / 700 + i * 1.1))) * (layerFade.B2 ?? 1) * (catDim.ev ?? 1)));
      const pulse = fixed ? 0 : 0.5 + 0.5 * Math.sin(now / 420);
      for (const m of mats.values()) if (m.userData.kind === "hot") m.emissiveIntensity = (theme === "night" ? 0.04 : 0.0) + pulse * (theme === "night" ? 0.12 : 0.05);
    }
    renderer.render(scene, camera);
    onFrame && onFrame(now);
    requestAnimationFrame(frame);
  }
  // pause when the tab is hidden
  const wake = () => { const go = active && !document.hidden; if (go && !running) { running = true; last = performance.now(); requestAnimationFrame(frame); } else if (!go) running = false; };
  document.addEventListener("visibilitychange", wake);
  function setActive(on) { active = on; wake(); }   // a camera move or fade queued while hidden simply completes on the first frame
  setFilter("all");

  return {
    setState, setTheme, setFilter, setApplied, setFixed, project, setActive,
    levels: LEVELS,
    set onFrame(fn) { onFrame = fn; },
    get state() { return state; },
  };
}
