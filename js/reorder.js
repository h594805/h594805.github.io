// ============================================================
// PL-Tipping – Dra-og-slepp for tabellrekkjefølgje
//
// Attach(container, onReorder) gjer alle .pt-row inne i container
// flyttbare via handtaket [data-grip]. onReorder får den nye
// rekkjefølgja som ei liste med data-id-verdiar.
// ============================================================

const Reorder = (() => {

  function attach(container, onReorder, isEnabled) {
    if (container._reorderCleanup) container._reorderCleanup();

    let st = null;
    let raf = 0;

    const rowsOf = () => Array.from(container.querySelectorAll('.pt-row'));

    // Kvar hamnar rad i om raden som blir dregen flyttar seg frå → til?
    function visualIndex(i, from, to) {
      if (i === from) return to;
      if (from < to && i > from && i <= to) return i - 1;
      if (from > to && i >= to && i <  from) return i + 1;
      return i;
    }

    function paint() {
      if (!st) return;
      const { rows, from, cur, step, dy } = st;
      rows.forEach((row, i) => {
        const vi = visualIndex(i, from, cur);
        row.style.transform = i === from
          ? `translateY(${dy}px)`
          : (vi === i ? '' : `translateY(${(vi - i) * step}px)`);
        const posEl = row.querySelector('.pt-pos');
        if (posEl) posEl.textContent = vi + 1;
        row.classList.remove('zone-ucl', 'zone-uel', 'zone-uec', 'zone-rel');
        const z = zoneFor(vi + 1);
        if (z) row.classList.add(z);
      });
    }

    function tick() {
      if (!st) return;
      // Auto-scroll når fingeren er nær kanten av skjermen
      const margin = 96;
      let d = 0;
      if (st.clientY < margin)                    d = -Math.ceil((margin - st.clientY) / 6);
      else if (st.clientY > innerHeight - margin) d =  Math.ceil((st.clientY - (innerHeight - margin)) / 6);
      if (d) scrollBy(0, d);

      st.dy  = (st.clientY + scrollY) - st.startY;
      st.cur = Math.max(0, Math.min(st.rows.length - 1, st.from + Math.round(st.dy / st.step)));
      paint();
      raf = requestAnimationFrame(tick);
    }

    function onDown(e) {
      if (st) return;
      if (e.button != null && e.button !== 0) return;
      if (isEnabled && !isEnabled()) return;
      const grip = e.target.closest('[data-grip]');
      if (!grip || !container.contains(grip)) return;
      const row = grip.closest('.pt-row');
      if (!row) return;

      const rows = rowsOf();
      if (rows.length < 2) return;
      const r0 = rows[0].getBoundingClientRect();
      const r1 = rows[1].getBoundingClientRect();
      const step = (r1.top - r0.top) || r0.height;

      e.preventDefault();
      const from = rows.indexOf(row);
      st = { rows, from, cur: from, step, dy: 0, clientY: e.clientY, startY: e.clientY + scrollY };

      row.classList.add('pt-dragging');
      container.classList.add('pt-list-dragging');
      document.body.classList.add('pt-noselect');
      try { row.setPointerCapture(e.pointerId); } catch {}

      addEventListener('pointermove',   onMove, { passive: false });
      addEventListener('pointerup',     onUp);
      addEventListener('pointercancel', onUp);
      raf = requestAnimationFrame(tick);
    }

    function onMove(e) {
      if (!st) return;
      e.preventDefault();
      st.clientY = e.clientY;
    }

    function onUp() {
      if (!st) return;
      cancelAnimationFrame(raf);
      removeEventListener('pointermove',   onMove);
      removeEventListener('pointerup',     onUp);
      removeEventListener('pointercancel', onUp);

      const { rows, from, cur } = st;
      st = null;

      rows.forEach(r => { r.style.transform = ''; r.classList.remove('pt-dragging'); });
      container.classList.remove('pt-list-dragging');
      document.body.classList.remove('pt-noselect');

      const ids = rows.map(r => r.dataset.id);
      if (cur !== from) {
        const [moved] = ids.splice(from, 1);
        ids.splice(cur, 0, moved);
        onReorder(ids);
      } else {
        onReorder(ids);   // bygg opp att visinga (nullstiller etikettane)
      }
    }

    container.addEventListener('pointerdown', onDown);
    container._reorderCleanup = () => {
      container.removeEventListener('pointerdown', onDown);
      cancelAnimationFrame(raf);
      st = null;
    };
  }

  return { attach };
})();
