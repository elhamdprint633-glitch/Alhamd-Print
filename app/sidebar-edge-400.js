/* Alhamd Print 4.0.0 — invisible Windows-style edge resize, including collapsed mode. */
(() => {
    'use strict';
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    const widthKey = 'ALHAMD_SB_WIDTH_400';
    const collapsedKey = 'ALHAMD_SB_COLLAPSED';
    const style = document.createElement('style');
    style.textContent = `@media (min-width:768px) and (pointer:fine) {
        body:not(.sb-collapsed) #sidebar { width: var(--sidebar-user-width145,16rem)!important; }
        body.sb-edge-hover400,body.sb-edge-hover400 * { cursor: ew-resize!important; }
        body.sb-edge-drag400,body.sb-edge-drag400 * { cursor: ew-resize!important; user-select:none!important; }
        body.sb-edge-drag400 #sidebar { transition:none!important; }
    }`;
    document.head.appendChild(style);
    const clamp = (x) => Math.max(176, Math.min(Math.min(480, innerWidth * .48), x));
    const desktop = () => innerWidth >= 768 && window.matchMedia('(pointer:fine)').matches;
    const locked = () => !!document.querySelector('#lockScreenOverlay:not(.hidden)');
    let savedWidth = 256;
    try { const v = Number(localStorage.getItem(widthKey)); if (v >= 176 && v <= 480) savedWidth = v; } catch (_) {}
    function setWidth(w, persist = false) {
        savedWidth = clamp(w);
        document.body.style.setProperty('--sidebar-user-width145', savedWidth + 'px');
        if (persist) try { localStorage.setItem(widthKey, String(Math.round(savedWidth))); } catch (_) {}
    }
    function setCollapsed(collapsed) {
        if (document.body.classList.contains('sb-collapsed') === collapsed) return;
        // Preserve the application's existing button, keyboard shortcut and saved toggle state.
        if (typeof toggleSidebar === 'function') toggleSidebar();
        else { document.body.classList.toggle('sb-collapsed', collapsed); try { localStorage.setItem(collapsedKey, collapsed ? '1' : '0'); } catch (_) {} }
    }
    setWidth(savedWidth);
    let drag = null;
    const onEdge = e => {
        if (!desktop() || locked() || (e.pointerType && e.pointerType !== 'mouse') || e.clientY < 6 || e.clientY > innerHeight-6) return false;
        const r = sidebar.getBoundingClientRect();
        return r.width > 0 && e.clientY >= r.top && e.clientY <= r.bottom && Math.abs(e.clientX - r.left) <= 7;
    };
    const hover = enabled => document.body.classList.toggle('sb-edge-hover400', !!enabled);
    document.addEventListener('pointermove', e => {
        if (drag) {
            if (e.pointerId !== drag.id) return;
            const desired = drag.startWidth + drag.startX - e.clientX;
            if (desired < 132) setCollapsed(true);
            else { setCollapsed(false); setWidth(desired); }
            e.preventDefault();
            return;
        }
        hover(onEdge(e));
    }, true);
    document.addEventListener('pointerdown', e => {
        if (e.button !== 0 || drag || !onEdge(e)) return;
        drag = { id: e.pointerId, startX: e.clientX,
            startWidth: sidebar.getBoundingClientRect().width,
            originallyCollapsed: document.body.classList.contains('sb-collapsed'),
            widthBefore: savedWidth };
        hover(true);
        document.body.classList.add('sb-edge-drag400');
        try { document.documentElement.setPointerCapture(e.pointerId); } catch (_) {}
        e.preventDefault(); e.stopImmediatePropagation();
    }, true);
    function finish(cancel) {
        if (!drag) return;
        const d = drag; drag = null;
        try { document.documentElement.releasePointerCapture(d.id); } catch (_) {}
        if (cancel) { setCollapsed(d.originallyCollapsed); setWidth(d.widthBefore); }
        else if (!document.body.classList.contains('sb-collapsed')) setWidth(savedWidth, true);
        document.body.classList.remove('sb-edge-drag400'); hover(false);
    }
    document.addEventListener('pointerup', e => { if (drag && drag.id === e.pointerId) { finish(false); e.preventDefault(); e.stopImmediatePropagation(); } }, true);
    document.addEventListener('pointercancel', () => finish(true), true);
    window.addEventListener('blur', () => finish(true));
    window.addEventListener('resize', () => { if (drag) finish(true); setWidth(savedWidth); hover(false); });
    document.addEventListener('keydown', e => { if (drag && e.key === 'Escape') { finish(true); e.preventDefault(); } }, true);
})();
