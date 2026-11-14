/* Green Control particle assemble.
   The drawing builds itself from its own pixels: every opaque pixel (step 3) becomes a point that falls
   from above into place, top rows first. Then the line drawing resolves over the points and the labels arrive.
   Use once, when a screen opens on a new figure. Skipped under reduced motion.

   Markup:  <div class="gc-figure assembling"> … <img class="gc-art" src="figure.png"> … </div>
   Call:    gcAssemble(document.querySelector(".gc-art"));                                        */
window.gcAssemble = async function gcAssemble(img) {
  const fig = img.closest(".gc-figure");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) { fig.classList.remove("assembling"); fig.classList.add("built"); return; }
  try { await img.decode(); } catch (e) { fig.classList.remove("assembling"); fig.classList.add("built"); return; }
  const W = img.naturalWidth, H = img.naturalHeight;
  const off = document.createElement("canvas"); off.width = W; off.height = H;
  const oc = off.getContext("2d", { willReadFrequently: true });
  oc.drawImage(img, 0, 0);
  let src;
  try { src = oc.getImageData(0, 0, W, H).data; } catch (e) { fig.classList.remove("assembling"); fig.classList.add("built"); return; } // file:// or cross-origin
  const step = 3, P = [];
  for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) {
    const k = (y * W + x) * 4, a = src[k + 3]; if (a < 70) continue;
    const r = Math.random();
    P.push({ x, y, sx: x + (r - 0.5) * 80, sy: y - 260 - Math.random() * 520, d: (y / H) * 760 + Math.random() * 260, c: (a << 24) | (src[k + 2] << 16) | (src[k + 1] << 8) | src[k] });
  }
  // the canvas sits exactly over the image
  const cv = document.createElement("canvas"); cv.className = "gc-assemble"; cv.width = W; cv.height = H;
  // same parent and same layout box as the image (works inside .gc-artbox and when the app is scaled)
  Object.assign(cv.style, { left: img.offsetLeft + "px", top: img.offsetTop + "px", width: img.offsetWidth + "px", height: img.offsetHeight + "px" });
  img.after(cv);
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
  fig.classList.remove("assembling"); fig.classList.add("built");
  setTimeout(() => cv.remove(), 700);
};
