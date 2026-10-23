/* Hosts several Hairline figures on one page: each figure file calls
   hairline({...}) once; this mounts it into the matching KPI card. */
(() => {
  const slot = { bill: "bill2", dial: "dial", meter: "meter", stack: "stack" };
  HL.inject(document);
  window.hairline = (figure) => {
    const stage = document.querySelector(`[data-fig="${slot[figure.name] || figure.name}"]`);
    if (!stage) return;
    stage.setAttribute("data-hairline", figure.name);
    stage.setAttribute("role", "img");
    stage.setAttribute("aria-label", figure.means);
    const svg = HL.mk("svg", { viewBox: "0 0 400 320", "aria-hidden": "true" }, stage);
    const read = { textContent: "" };
    const mid = figure.range[1];
    try { figure.mount({ stage, svg, read }, mid); } catch (e) { console.warn("hairline", figure.name, e); }
    // the pointer that wakes the figure is the whole KPI card, not just the drawing
    const card = stage.closest(".kpi");
    if (card) {
      const fwd = (type) => (e) => {
        const r = stage.getBoundingClientRect();
        stage.dispatchEvent(new PointerEvent(type, { pointerType: "mouse", pointerId: 1, bubbles: false, clientX: Math.min(Math.max(e.clientX, r.left + 1), r.right - 1), clientY: Math.min(Math.max(e.clientY, r.top + 1), r.bottom - 1) }));
      };
      card.addEventListener("pointermove", (e) => { if (!stage.contains(e.target)) fwd("pointermove")(e); });
      card.addEventListener("pointerleave", () => stage.dispatchEvent(new PointerEvent("pointerleave", { pointerType: "mouse", pointerId: 1 })));
    }
  };
})();
