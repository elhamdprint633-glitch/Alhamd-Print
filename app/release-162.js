/* Alhamd Print 3.6.0 — Comprehensive Upgrade Release 162 (6 Core Enhancements) */
(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const r2 = n => Math.round((Number(n) || 0) * 100) / 100;
  const getSS = () => (typeof ss === 'function' ? ss() : (window.appState ? (window.appState.shopSettings ||= {}) : {}));
  const getUI = () => (typeof uiCfg === 'function' ? uiCfg() : (getSS().ui ||= {}));
  const fmtMoney = n => (typeof formatCurrency === 'function' ? formatCurrency(n) : `${r2(n).toFixed(2)} ج.م`);
  const getToday = () => (typeof todayStr === 'function' ? todayStr() : new Date().toISOString().slice(0, 10));

  // ============================================================================
  // 1. أولاً: التحكم اليدوي الدقيق في الحجم (حواف وزوايا بسهم مزدوج الرأس كنظام ويندوز)
  //    مع إمكانية التحريك للنقل والتنظيم للنوافذ وأزرار شريط أدوات الجداول وأزرار عرض البيانات فوق الجداول
  // ============================================================================
  const WIN_SIZE_STORAGE_KEY = 'alhamd_win_sizes_162';
  const WIN_POS_STORAGE_KEY = 'alhamd_win_pos_162';
  const ITEM_ORDER_STORAGE_KEY = 'alhamd_item_order_162';

  const WINDOW_SELECTORS_162 = [
    '.app-dialog144 > :not(.window-tools150)',
    '.studio-overlay150 > :not(.window-tools150)',
    '#operationsModal149 > *',
    '#statementDocumentPreview > *',
    '#purchaseRequestPreview147 > *',
    '#purchaseRequestEditor147 > *',
    '#whatsappChoiceModal153 > *',
    '#reviewCenter > *',
    '#statementOriginalModal > *',
    '#tableFilterModal > *',
    '#tableExcelImportModal > *',
    '#contactImportModal > *',
    '#recordDetailModal > *',
    '#serviceCatalogModal144 > *',
    '#serviceCatalogModal143 > *',
    '#imageFitModal139 > *',
    '#digitalDestinationModal142 > *',
    '#dailyTreasuryClosingModal162 > *',
    '#catMgr > *',
    '#fontPicker > *',
    '#salesComposer',
    '#colsPanel',
    '#privPanel',
    '.mini-calendar-139'
  ].join(',');

  const TOOLBAR_ITEM_SELECTORS_162 = [
    '[id$="Tools"] > *',
    '[id$="Tools"] button',
    '[id$="Tools"] select',
    '[id$="Tools"] .row-combo160',
    '.ops-toolbar149 > *',
    '.ops-toolbar149 button',
    '.ops-toolbar149 select',
    '.ops-toolbar149 input',
    '#salesRangeChips > button',
    '#svcFilterChips > button',
    '#clientTransferTools > *',
    '#supplierTransferTools > *',
    '[id$="Pager"] button',
    '.tab-view > .bg-white > .p-4.border-b button',
    '.tab-view > .bg-white > .p-4.border-b select',
    '.tab-view .flex.flex-wrap.gap-2 > button',
    '.tab-view .flex.items-center.gap-2 > button'
  ].join(',');

  const DATA_CARD_SELECTORS_162 = [
    '[data-drill151]',
    '.kpi-link151',
    '.wallet147',
    '.stmt-kpi',
    '#view-dashboard .grid > div',
    '#view-orders .grid > div',
    '#view-quotes .grid > div',
    '#view-stocktake .grid > div',
    '#view-treasury .grid > div',
    '#view-services .grid > div',
    '#view-purchases .grid > div',
    '#view-clients .grid > div',
    '#view-suppliers .grid > div',
    '.ops-kpis149 > *',
    '#opsDailyKpiGrid162 > *'
  ].join(',');

  function loadJsonMap162(key) {
    try { return JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch { return {}; }
  }
  function saveJsonMap162(key, map) {
    try { localStorage.setItem(key, JSON.stringify(map || {})); } catch {}
  }

  function cursorForDirection162(dir) {
    switch (dir) {
      case 'e':
      case 'w':
        return 'ew-resize';
      case 'n':
      case 's':
        return 'ns-resize';
      case 'nw':
      case 'se':
        return 'nwse-resize';
      case 'ne':
      case 'sw':
        return 'nesw-resize';
      default:
        return '';
    }
  }

  function detectEdgeOrCorner162(el, clientX, clientY, isCompact = false) {
    if (!el || typeof el.getBoundingClientRect !== 'function') return '';
    const r = el.getBoundingClientRect();
    if (r.width < 24 || r.height < 18) return '';
    const edgeZone = isCompact ? 6 : 8;
    const cornerZone = isCompact ? 9 : 12;

    const nearLeft = clientX >= r.left - 2 && clientX <= r.left + edgeZone;
    const nearRight = clientX >= r.right - edgeZone && clientX <= r.right + 2;
    const nearTop = clientY >= r.top - 2 && clientY <= r.top + edgeZone;
    const nearBottom = clientY >= r.bottom - edgeZone && clientY <= r.bottom + 2;

    const cornerLeft = clientX >= r.left - 2 && clientX <= r.left + cornerZone;
    const cornerRight = clientX >= r.right - cornerZone && clientX <= r.right + 2;
    const cornerTop = clientY >= r.top - 2 && clientY <= r.top + cornerZone;
    const cornerBottom = clientY >= r.bottom - cornerZone && clientY <= r.bottom + 2;

    if (cornerTop && cornerLeft) return 'nw';
    if (cornerTop && cornerRight) return 'ne';
    if (cornerBottom && cornerLeft) return 'sw';
    if (cornerBottom && cornerRight) return 'se';
    if (nearLeft) return 'w';
    if (nearRight) return 'e';
    if (nearTop) return 'n';
    if (nearBottom) return 's';
    return '';
  }

  function getElementResizeKey162(el) {
    if (!el || el.nodeType !== 1) return '';
    if (el.dataset.resizeKey162) return el.dataset.resizeKey162;
    if (el.id) {
      el.dataset.resizeKey162 = 'id:' + el.id;
      return el.dataset.resizeKey162;
    }
    const parentWithId = el.closest('[id]');
    const pId = parentWithId ? parentWithId.id : 'root';
    const tag = el.tagName.toLowerCase();
    const drill = el.getAttribute('data-drill151') || '';
    const txt = String(el.getAttribute('title') || el.getAttribute('aria-label') || el.textContent || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 28);
    const siblings = el.parentElement ? [...el.parentElement.children] : [];
    const idx = siblings.indexOf(el);
    const key = `${pId}::${tag}::${drill || idx}::${txt}`;
    el.dataset.resizeKey162 = key;
    return key;
  }

  function isButtonOrControlElement162(el) {
    if (!el || el.nodeType !== 1) return false;
    const tag = String(el.tagName || '').toUpperCase();
    if (tag === 'BUTTON' || tag === 'A' || tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return true;
    if (el.getAttribute?.('role') === 'button' || el.classList?.contains?.('act-icon-btn') || el.classList?.contains?.('nav-btn')) return true;
    if (typeof el.closest === 'function' && el.closest('button, [role="button"], .act-icon-btn, .nav-btn, a')) return true;
    if (typeof el.matches === 'function' && (el.matches(TOOLBAR_ITEM_SELECTORS_162) || el.matches(DATA_CARD_SELECTORS_162))) return true;
    return false;
  }

  function resolveResizableTarget162(target, clientX, clientY) {
    void target; void clientX; void clientY;
    // Moving, enlarging, and shrinking (resizing) are strictly disabled across all floating windows and all program sections
    return null;
  }

  function resolveDraggableTarget162(target, e) {
    void target; void e;
    // Moving/dragging is strictly disabled across all floating windows and all program sections
    return null;
  }

  function ensureParentFlexibleForResize162(el, kind) {
    const parent = el?.parentElement;
    if (!parent) return;
    if (kind === 'datacard' && getComputedStyle(parent).display === 'grid') {
      if (!parent.dataset.flexConverted162) {
        const children = [...parent.children];
        const rects = children.map(c => c.getBoundingClientRect());
        parent.dataset.flexConverted162 = '1';
        parent.style.display = 'flex';
        parent.style.flexWrap = 'wrap';
        parent.style.alignItems = 'stretch';
        children.forEach((c, i) => {
          if (rects[i] && rects[i].width > 40 && !c.style.width) {
            c.style.width = `${Math.round(rects[i].width)}px`;
            c.style.flex = '1 1 auto';
          }
        });
      }
    }
  }

  function applyElementSize162(el, kind, width, height) {
    void el; void kind; void width; void height;
    // Enlarging and shrinking are disabled across all floating windows and all sections
    return false;
  }

  function applyWindowTranslate162(el, tx, ty) {
    void el; void tx; void ty;
    // Moving/dragging is disabled across all floating windows and all sections
    return false;
  }

  function saveContainerOrder162(container) {
    if (!container) return;
    const cKey = getElementResizeKey162(container);
    if (!cKey) return;
    const orderMap = loadJsonMap162(ITEM_ORDER_STORAGE_KEY);
    orderMap[cKey] = [...container.children].map(ch => getElementResizeKey162(ch));
    saveJsonMap162(ITEM_ORDER_STORAGE_KEY, orderMap);
  }

  function clearButtonResizeAndMoveArtifacts162() {
    try {
      localStorage.removeItem(WIN_SIZE_STORAGE_KEY);
      localStorage.removeItem(WIN_POS_STORAGE_KEY);
      localStorage.removeItem(ITEM_ORDER_STORAGE_KEY);
      localStorage.removeItem('alhamd-layout-145');
    } catch {}
    if (typeof document.querySelectorAll !== 'function') return;
    document.querySelectorAll(`[data-resized162], [data-tx162], [data-ty162], [data-win-edge162], [data-resize-surface145], button, [role="button"], ${WINDOW_SELECTORS_162}, ${TOOLBAR_ITEM_SELECTORS_162}, ${DATA_CARD_SELECTORS_162}`).forEach(el => {
      if (!el) return;
      if (el.dataset?.resized162 || el.dataset?.tx162 || el.dataset?.ty162 || el.hasAttribute?.('data-win-edge162') || el.dataset?.resizeSurface145) {
        ['width', 'min-width', 'max-width', 'height', 'min-height', 'max-height', 'flex', 'transform', 'cursor'].forEach(p => el.style?.removeProperty?.(p));
        delete el.dataset.resized162;
        delete el.dataset.tx162;
        delete el.dataset.ty162;
        el.removeAttribute?.('data-win-edge162');
        el.classList?.remove?.('dragging-item162');
      }
    });
  }

  function restoreSavedSizesAndOrders162() {
    clearButtonResizeAndMoveArtifacts162();
  }

  function resetElementSizeAndPos162(el) {
    if (!el) return;
    const k = getElementResizeKey162(el);
    ['width', 'min-width', 'max-width', 'height', 'min-height', 'max-height', 'flex', 'transform'].forEach(p => el.style.removeProperty(p));
    delete el.dataset.resized162;
    delete el.dataset.tx162;
    delete el.dataset.ty162;
    const sizeMap = loadJsonMap162(WIN_SIZE_STORAGE_KEY);
    const posMap = loadJsonMap162(WIN_POS_STORAGE_KEY);
    delete sizeMap[k];
    delete posMap[k];
    saveJsonMap162(WIN_SIZE_STORAGE_KEY, sizeMap);
    saveJsonMap162(WIN_POS_STORAGE_KEY, posMap);
  }

  window.resetAllCustomSizesAndPositions162 = function() {
    try {
      localStorage.removeItem(WIN_SIZE_STORAGE_KEY);
      localStorage.removeItem(WIN_POS_STORAGE_KEY);
      localStorage.removeItem(ITEM_ORDER_STORAGE_KEY);
    } catch {}
    document.querySelectorAll('[data-resized162], [data-tx162], [data-ty162]').forEach(el => {
      ['width', 'min-width', 'max-width', 'height', 'min-height', 'max-height', 'flex', 'transform'].forEach(p => el.style.removeProperty(p));
      delete el.dataset.resized162;
      delete el.dataset.tx162;
      delete el.dataset.ty162;
    });
    document.querySelectorAll('[data-flex-converted162]').forEach(parent => {
      ['display', 'flex-wrap', 'align-items'].forEach(p => parent.style.removeProperty(p));
      delete parent.dataset.flexConverted162;
      [...parent.children].forEach(c => {
        c.style.removeProperty('width');
        c.style.removeProperty('flex');
      });
    });
    if (typeof updateAllUI === 'function') updateAllUI();
    if (typeof showToast === 'function') showToast('تمت استعادة الأحجام والمواضع والترتيب الافتراضي لجميع النوافذ والأزرار.', 'info');
  };

  let activeInteraction162 = null;
  let hoveredEdgeEl162 = null;
  let suppressClickUntil162 = 0;

  function installWindowsPrecisionResizeAndDrag162() {
    if (document.documentElement.dataset.winResize162 === '1') return;
    document.documentElement.dataset.winResize162 = '1';

    let style = $('winResizeStyle162');
    if (!style) {
      style = document.createElement('style');
      style.id = 'winResizeStyle162';
      style.textContent = `
        [data-win-edge162] {
          outline: 2px solid rgba(13, 148, 136, 0.55) !important;
          outline-offset: -1px !important;
          transition: outline-color 0.08s ease;
        }
        .dragging-item162 {
          opacity: 0.88 !important;
          outline: 2px dashed #0d9488 !important;
          z-index: 999 !important;
          box-shadow: 0 12px 28px -6px rgba(15, 23, 42, 0.28) !important;
        }
        .win-head, .dialog-head144, .modal-header, .dialog-header, .notification-head152, .window-tools150 {
          cursor: default !important;
          user-select: none;
        }
        .app-dialog144 > *, .studio-overlay150 > *, #operationsModal149 > *, #salesComposer, #colsPanel, #privPanel, .mini-calendar-139 {
          transform: none !important;
          resize: none !important;
        }
        #sidebarResizeRail145 {
          display: none !important;
          pointer-events: none !important;
        }
      `;
      document.head.appendChild(style);
    }

    document.addEventListener('pointermove', e => {
      if (activeInteraction162) {
        onActivePointerMove162(e);
        return;
      }
      const hit = resolveResizableTarget162(e.target, e.clientX, e.clientY);
      if (hit) {
        const cur = cursorForDirection162(hit.dir);
        if (hoveredEdgeEl162 && hoveredEdgeEl162 !== hit.el) {
          hoveredEdgeEl162.removeAttribute('data-win-edge162');
          hoveredEdgeEl162.style.removeProperty('cursor');
        }
        hoveredEdgeEl162 = hit.el;
        hit.el.setAttribute('data-win-edge162', hit.dir);
        hit.el.style.setProperty('cursor', cur, 'important');
        document.body.style.setProperty('cursor', cur, 'important');
      } else if (hoveredEdgeEl162) {
        hoveredEdgeEl162.removeAttribute('data-win-edge162');
        hoveredEdgeEl162.style.removeProperty('cursor');
        hoveredEdgeEl162 = null;
        document.body.style.removeProperty('cursor');
      }
    }, { passive: true, capture: true });

    document.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;

      // 1) Check Edge/Corner Resize
      const hit = resolveResizableTarget162(e.target, e.clientX, e.clientY);
      if (hit) {
        const rect = hit.el.getBoundingClientRect();
        activeInteraction162 = {
          mode: 'resize',
          el: hit.el,
          kind: hit.kind,
          dir: hit.dir,
          startX: e.clientX,
          startY: e.clientY,
          startW: rect.width,
          startH: rect.height,
          startTx: Number(hit.el.dataset.tx162 || 0),
          startTy: Number(hit.el.dataset.ty162 || 0),
          moved: false
        };
        document.body.style.setProperty('user-select', 'none', 'important');
        document.body.style.setProperty('cursor', cursorForDirection162(hit.dir), 'important');
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // 2) Check Move / Drag-to-Organize
      const dragHit = resolveDraggableTarget162(e.target, e);
      if (dragHit) {
        const rect = dragHit.el.getBoundingClientRect();
        activeInteraction162 = {
          mode: dragHit.kind === 'window' || e.ctrlKey ? 'move-free' : 'reorder',
          el: dragHit.el,
          kind: dragHit.kind,
          startX: e.clientX,
          startY: e.clientY,
          startRect: rect,
          startTx: Number(dragHit.el.dataset.tx162 || 0),
          startTy: Number(dragHit.el.dataset.ty162 || 0),
          moved: false
        };
      }
    }, true);

    function onActivePointerMove162(e) {
      if (!activeInteraction162) return;
      const st = activeInteraction162;
      const dx = e.clientX - st.startX;
      const dy = e.clientY - st.startY;

      if (st.mode === 'resize') {
        st.moved = true;
        let newW = st.startW;
        let newH = st.startH;
        let newTx = st.startTx;
        let newTy = st.startTy;

        if (st.dir.includes('e')) newW = st.startW + dx;
        if (st.dir.includes('w')) {
          newW = st.startW - dx;
          if (st.kind === 'window') newTx = st.startTx + dx / 2;
        }
        if (st.dir.includes('s')) newH = st.startH + dy;
        if (st.dir.includes('n')) {
          newH = st.startH - dy;
          if (st.kind === 'window') newTy = st.startTy + dy / 2;
        }

        const changeW = st.dir.includes('e') || st.dir.includes('w');
        const changeH = st.dir.includes('n') || st.dir.includes('s');
        applyElementSize162(st.el, st.kind, changeW ? newW : NaN, changeH ? newH : NaN);
        if (st.kind === 'window' && (newTx !== st.startTx || newTy !== st.startTy)) {
          applyWindowTranslate162(st.el, newTx, newTy);
        }
        return;
      }

      if (!st.moved && Math.hypot(dx, dy) < 7) return;
      if (!st.moved) {
        st.moved = true;
        st.el.classList.add('dragging-item162');
        document.body.style.setProperty('user-select', 'none', 'important');
      }

      if (st.mode === 'move-free') {
        applyWindowTranslate162(st.el, st.startTx + dx, st.startTy + dy);
        return;
      }

      if (st.mode === 'reorder') {
        const container = st.el.parentElement;
        if (!container) return;
        const siblings = [...container.children].filter(c => c !== st.el && c.offsetParent !== null);
        let targetSibling = null;
        let insertBefore = false;
        for (const sib of siblings) {
          const r = sib.getBoundingClientRect();
          if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
            targetSibling = sib;
            const isRtl = getComputedStyle(container).direction === 'rtl';
            const centerX = r.left + r.width / 2;
            insertBefore = isRtl ? (e.clientX > centerX) : (e.clientX < centerX);
            break;
          }
        }
        if (targetSibling) {
          if (insertBefore) container.insertBefore(st.el, targetSibling);
          else container.insertBefore(st.el, targetSibling.nextSibling);
        }
      }
    }

    const endInteraction162 = () => {
      if (!activeInteraction162) return;
      const st = activeInteraction162;
      activeInteraction162 = null;
      st.el.classList.remove('dragging-item162');
      document.body.style.removeProperty('user-select');
      document.body.style.removeProperty('cursor');

      if (st.moved) {
        suppressClickUntil162 = Date.now() + 260;
        const k = getElementResizeKey162(st.el);
        if (st.mode === 'resize' && k) {
          const rect = st.el.getBoundingClientRect();
          const sizeMap = loadJsonMap162(WIN_SIZE_STORAGE_KEY);
          sizeMap[k] = {
            w: Math.round(rect.width),
            h: (st.dir.includes('n') || st.dir.includes('s')) ? Math.round(rect.height) : (sizeMap[k]?.h || null)
          };
          saveJsonMap162(WIN_SIZE_STORAGE_KEY, sizeMap);
        }
        if ((st.mode === 'move-free' || st.mode === 'resize') && k && (st.el.dataset.tx162 || st.el.dataset.ty162)) {
          const posMap = loadJsonMap162(WIN_POS_STORAGE_KEY);
          posMap[k] = { tx: Number(st.el.dataset.tx162 || 0), ty: Number(st.el.dataset.ty162 || 0) };
          saveJsonMap162(WIN_POS_STORAGE_KEY, posMap);
        }
        if (st.mode === 'reorder' && st.el.parentElement) {
          saveContainerOrder162(st.el.parentElement);
        }
      }
    };

    window.addEventListener?.('pointerup', endInteraction162, true);
    window.addEventListener?.('pointercancel', endInteraction162, true);

    document.addEventListener('click', e => {
      if (Date.now() < suppressClickUntil162) {
        e.preventDefault();
        e.stopPropagation();
        suppressClickUntil162 = 0;
      }
    }, true);

    document.addEventListener('dblclick', e => {
      const hit = resolveResizableTarget162(e.target, e.clientX, e.clientY);
      if (hit) {
        e.preventDefault();
        e.stopPropagation();
        resetElementSizeAndPos162(hit.el);
        if (typeof showToast === 'function') showToast('تمت استعادة الحجم والموضع الافتراضي للعنصر.', 'info');
      }
    }, true);
  }

  // ============================================================================
  // 2. ثانياً: إعداد وتبديل زر رصيد الخزينة الحي (رصيد اليوم / رصيد الخزنة العام)
  //    بما يشمل كل ما تم تداوله على جميع طرق الدفع + تفعيل نظام التقفيل اليومي
  // ============================================================================
  const ALL_PAYMENT_WALLETS_162 = [
    { id: 'cash', label: 'نقدي بالخزينة', short: 'نقدي', icon: 'fa-money-bill-wave' },
    { id: 'wallet', label: 'فودافون كاش / محفظة إلكترونية', short: 'محفظة', icon: 'fa-mobile-screen-button' },
    { id: 'instapay', label: 'إنستا باي (InstaPay)', short: 'إنستا باي', icon: 'fa-bolt' },
    { id: 'bank', label: 'تحويل بنكي', short: 'بنكي', icon: 'fa-building-columns' },
    { id: 'card', label: 'ماكينة فيزا / بطاقة بنكية', short: 'بطاقة', icon: 'fa-credit-card' },
    { id: 'cheque', label: 'شيك بنكي', short: 'شيك', icon: 'fa-money-check-dollar' }
  ];

  function normalizePaymentMethodId162(raw) {
    if (window.Features147?.normalizeMethod) return window.Features147.normalizeMethod(raw);
    const v = String(raw || '').trim().toLowerCase();
    if (!v || /نقد|كاشير|خزينة|cash/.test(v)) return 'cash';
    if (/فودافون|محفظ|اتصالات|اورنج|وي باي|wallet/.test(v)) return 'wallet';
    if (/انستا|إنستا|instapay|insta/.test(v)) return 'instapay';
    if (/بنك|تحويل|bank|iban/.test(v)) return 'bank';
    if (/بطاق|فيزا|ماستر|ماكين|pos|card|visa/.test(v)) return 'card';
    if (/شيك|cheque|check/.test(v)) return 'cheque';
    return 'cash';
  }

  function getLiveSafeBalanceMode162() {
    const s = getSS();
    if (s.liveSafeBalanceMode162 === 'today' || s.liveSafeBalanceMode162 === 'general') {
      return s.liveSafeBalanceMode162;
    }
    try {
      const local = localStorage.getItem('alhamd_live_safe_mode_162');
      if (local === 'today' || local === 'general') {
        s.liveSafeBalanceMode162 = local;
        return local;
      }
    } catch {}
    s.liveSafeBalanceMode162 = 'general';
    return 'general';
  }

  function setLiveSafeBalanceMode162(mode, notify = true) {
    const clean = mode === 'today' ? 'today' : 'general';
    const s = getSS();
    s.liveSafeBalanceMode162 = clean;
    try { localStorage.setItem('alhamd_live_safe_mode_162', clean); } catch {}
    if (typeof saveState === 'function') saveState(false);
    renderSidebarLiveTreasuryWidget162();
    renderTreasuryDailyClosingBanner162();
    if (notify && typeof showToast === 'function') {
      showToast(
        clean === 'today'
          ? 'تم ضبط رصيد الخزينة الحي ليعرض «رصيد اليوم» شاملاً جميع طرق الدفع.'
          : 'تم ضبط رصيد الخزينة الحي ليعرض «رصيد الخزنة العام» من البداية حتى اليوم شاملاً جميع طرق الدفع.',
        'info'
      );
    }
    return clean;
  }

  function computeLiveTreasuryStats162(targetDateStr) {
    const date = String(targetDateStr || getToday()).slice(0, 10);
    const mode = getLiveSafeBalanceMode162();
    const list = Array.isArray(window.appState?.treasury) ? window.appState.treasury : [];

    const makeBucket = () => {
      const byMethod = {};
      ALL_PAYMENT_WALLETS_162.forEach(w => {
        byMethod[w.id] = { id: w.id, label: w.label, short: w.short, icon: w.icon, in: 0, out: 0, net: 0, count: 0 };
      });
      return { in: 0, out: 0, net: 0, count: 0, byMethod };
    };

    const today = makeBucket();
    const general = makeBucket();
    const openingBeforeToday = makeBucket();

    for (const t of list) {
      if (!t || typeof t !== 'object') continue;
      const inAmt = Math.max(0, Number(t.inAmount) || 0);
      const outAmt = Math.max(0, Number(t.outAmount) || 0);
      const d = String(t.date || '').slice(0, 10);
      const mId = normalizePaymentMethodId162(t.paymentMethod || t.method || 'cash');

      const addInto = bucket => {
        bucket.in = r2(bucket.in + inAmt);
        bucket.out = r2(bucket.out + outAmt);
        bucket.net = r2(bucket.in - bucket.out);
        bucket.count += 1;
        const m = bucket.byMethod[mId] || (bucket.byMethod[mId] = { id: mId, label: mId, short: mId, icon: 'fa-wallet', in: 0, out: 0, net: 0, count: 0 });
        m.in = r2(m.in + inAmt);
        m.out = r2(m.out + outAmt);
        m.net = r2(m.in - m.out);
        m.count += 1;
      };

      if (!d || d <= date) {
        addInto(general);
      }
      if (d === date) {
        addInto(today);
      } else if (d && d < date) {
        addInto(openingBeforeToday);
      }
    }

    const closings = Array.isArray(window.appState?.dailyClosings162) ? window.appState.dailyClosings162 : [];
    const todayClosing = closings.find(c => c && c.date === date && c.status !== 'reopened') || null;
    const active = mode === 'today' ? today : general;

    return {
      date,
      mode,
      today,
      general,
      openingBeforeToday,
      active,
      todayClosed: !!todayClosing,
      todayClosing,
      closings
    };
  }

  function renderSidebarLiveTreasuryWidget162() {
    const balEl = $('sideSafeBalance');
    if (!balEl) return;
    const card = balEl.closest('div.p-3, #sideSafeBalanceCard162') || balEl.parentElement;
    if (!card) return;
    card.id = 'sideSafeBalanceCard162';
    card.className = 'p-3 m-3 bg-slate-800/90 rounded-xl border border-slate-700/90 text-xs space-y-2 shadow-sm';

    const stats = computeLiveTreasuryStats162(getToday());
    const showMethods = getSS().showSidebarSafeMethods162 !== false;
    const isPrivHidden = typeof privHidden === 'function' && privHidden('treasury');

    balEl.textContent = isPrivHidden ? '•••••' : fmtMoney(stats.active.net);
    balEl.className = `text-lg font-black font-mono tracking-tight ${stats.active.net < 0 ? 'text-rose-400' : 'text-emerald-400'}`;

    let header = $('sideSafeHeader162');
    if (!header) {
      const origHeader = card.querySelector('.flex.justify-between.items-center.text-slate-400');
      if (origHeader) {
        origHeader.id = 'sideSafeHeader162';
        header = origHeader;
      } else {
        header = document.createElement('div');
        header.id = 'sideSafeHeader162';
        card.prepend(header);
      }
    }
    header.className = 'flex flex-wrap items-center justify-between gap-1 text-slate-300';
    header.innerHTML = `
      <span class="font-bold flex items-center gap-1.5 text-[11px]">
        <i class="fa-solid fa-vault text-teal-400"></i>
        <span>رصيد الخزينة الحي</span>
      </span>
      <div class="inline-flex rounded-lg bg-slate-900/90 p-0.5 border border-slate-700 text-[10px] font-bold" role="group" aria-label="تبديل عرض رصيد الخزينة">
        <button type="button" id="btnSafeModeToday162" onclick="window.setLiveSafeBalanceMode162('today')" class="px-2 py-0.5 rounded-md transition ${stats.mode === 'today' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-white'}" title="عرض رصيد وصافي حركات اليوم بجميع طرق الدفع">رصيد اليوم</button>
        <button type="button" id="btnSafeModeGeneral162" onclick="window.setLiveSafeBalanceMode162('general')" class="px-2 py-0.5 rounded-md transition ${stats.mode === 'general' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-white'}" title="عرض رصيد الخزنة العام من البداية حتى اليوم بجميع طرق الدفع">الرصيد العام</button>
      </div>
    `;

    let extraBox = $('sideSafeExtra162');
    if (!extraBox) {
      extraBox = document.createElement('div');
      extraBox.id = 'sideSafeExtra162';
      card.appendChild(extraBox);
    }

    const activeMethods = ALL_PAYMENT_WALLETS_162.map(w => stats.active.byMethod[w.id]).filter(m => m && (m.in !== 0 || m.out !== 0 || m.id === 'cash'));
    const otherNet = stats.mode === 'today' ? stats.general.net : stats.today.net;
    const otherLabel = stats.mode === 'today' ? 'الرصيد العام التراكمي' : 'صافي حركة اليوم';

    extraBox.className = 'space-y-1.5 pt-1 border-t border-slate-700/70';
    extraBox.innerHTML = `
      <div class="flex items-center justify-between text-[10px] text-slate-300 font-mono">
        <span class="text-emerald-400" title="إجمالي المقبوضات والوارد بجميع طرق الدفع">وارد: ${isPrivHidden ? '•••' : fmtMoney(stats.active.in)}</span>
        <span class="text-rose-400" title="إجمالي المدفوعات والصادر بجميع طرق الدفع">صادر: ${isPrivHidden ? '•••' : fmtMoney(stats.active.out)}</span>
      </div>
      <div class="flex items-center justify-between text-[10px] text-slate-400">
        <span>${otherLabel}:</span>
        <strong class="font-mono text-slate-200">${isPrivHidden ? '•••' : fmtMoney(otherNet)}</strong>
      </div>
      ${showMethods ? `
        <div id="sideSafeMethods162" class="space-y-1 pt-1 border-t border-slate-700/50 max-h-28 overflow-y-auto">
          <div class="text-[9px] text-slate-400 font-bold">شامل جميع طرق الدفع (${stats.mode === 'today' ? 'اليوم' : 'العام'}):</div>
          ${activeMethods.map(m => `
            <div class="flex items-center justify-between text-[10px] text-slate-300">
              <span class="truncate"><i class="fa-solid ${m.icon} text-teal-400 ml-1 text-[9px]"></i>${esc(m.short)}</span>
              <span class="font-mono font-bold ${m.net < 0 ? 'text-rose-300' : 'text-emerald-300'}">${isPrivHidden ? '•••' : fmtMoney(m.net)}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
      <div class="pt-1 flex items-center gap-1.5">
        <button type="button" id="btnSideDailyClosing162" onclick="window.openDailyTreasuryClosingModal162()" class="flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition shadow-sm ${stats.todayClosed ? 'bg-emerald-700/90 hover:bg-emerald-600 text-white' : 'bg-teal-600 hover:bg-teal-500 text-white'}">
          <i class="fa-solid ${stats.todayClosed ? 'fa-circle-check' : 'fa-calendar-check'}"></i>
          <span>${stats.todayClosed ? 'تم تقفيل اليوم (مراجعة)' : 'تقفيل اليومية'}</span>
        </button>
      </div>
    `;
  }

  function renderTreasuryDailyClosingBanner162() {
    const view = $('view-treasury');
    if (!view) return;
    const stats = computeLiveTreasuryStats162(getToday());
    let banner = $('treasuryDailyClosingBar162');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'treasuryDailyClosingBar162';
      const firstGrid = view.querySelector('.grid');
      if (firstGrid) firstGrid.after(banner);
      else view.prepend(banner);
    }
    banner.className = 'p-4 rounded-2xl border border-teal-200 dark:border-slate-700 bg-gradient-to-l from-teal-50/80 via-white to-slate-50 dark:from-slate-800 dark:to-slate-900 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs';
    banner.innerHTML = `
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center gap-2.5">
          <span class="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center text-base shadow-sm">
            <i class="fa-solid fa-calendar-check"></i>
          </span>
          <div>
            <div class="flex items-center gap-2">
              <h4 class="font-black text-sm text-slate-900 dark:text-white">نظام التقفيل اليومي للخزينة وأرصدة طرق الدفع</h4>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${stats.todayClosed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                ${stats.todayClosed ? 'تم تقفيل وردية اليوم ✓' : 'وردية اليوم مفتوحة'}
              </span>
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              رصيد اليوم (كل طرق الدفع): <strong class="font-mono text-emerald-700 dark:text-emerald-400">${fmtMoney(stats.today.net)}</strong>
              &nbsp;•&nbsp;
              رصيد الخزنة العام التراكمي: <strong class="font-mono text-teal-700 dark:text-teal-300">${fmtMoney(stats.general.net)}</strong>
            </p>
          </div>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <div class="inline-flex rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 p-0.5">
          <button type="button" onclick="window.setLiveSafeBalanceMode162('today')" class="px-3 py-1.5 rounded-lg text-xs font-bold transition ${stats.mode === 'today' ? 'bg-teal-600 text-white' : 'text-slate-600 dark:text-slate-300'}">عرض رصيد اليوم بالجانبية</button>
          <button type="button" onclick="window.setLiveSafeBalanceMode162('general')" class="px-3 py-1.5 rounded-lg text-xs font-bold transition ${stats.mode === 'general' ? 'bg-teal-600 text-white' : 'text-slate-600 dark:text-slate-300'}">عرض الرصيد العام بالجانبية</button>
        </div>
        <button type="button" id="btnOpenDailyClosingTreasury162" onclick="window.openDailyTreasuryClosingModal162()" class="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center gap-2 shadow-sm transition">
          <i class="fa-solid fa-cash-register"></i>
          <span>فتح نظام التقفيل اليومي</span>
        </button>
      </div>
    `;
  }

  window.openDailyTreasuryClosingModal162 = function(dateOverride) {
    const targetDate = String(dateOverride || getToday()).slice(0, 10);
    const stats = computeLiveTreasuryStats162(targetDate);
    window.appState.dailyClosings162 ||= [];
    const existingClosing = window.appState.dailyClosings162.find(c => c && c.date === targetDate && c.status !== 'reopened') || null;

    $('dailyTreasuryClosingModal162')?.remove();
    const overlay = document.createElement('div');
    overlay.id = 'dailyTreasuryClosingModal162';
    overlay.dir = 'rtl';
    overlay.className = 'fixed inset-0 z-[10050] bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4';

    const methodsRowsHtml = ALL_PAYMENT_WALLETS_162.map(w => {
      const openM = stats.openingBeforeToday.byMethod[w.id] || { net: 0 };
      const todayM = stats.today.byMethod[w.id] || { in: 0, out: 0, net: 0, count: 0 };
      const genM = stats.general.byMethod[w.id] || { in: 0, out: 0, net: 0, count: 0 };
      const expected = stats.mode === 'today' ? todayM.net : genM.net;
      const savedActual = existingClosing?.actualByMethod?.[w.id];
      const actualVal = savedActual !== undefined ? Number(savedActual) : expected;
      const diffVal = r2(actualVal - expected);
      return `
        <tr class="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60" data-closing-method-row="${w.id}">
          <td class="p-2.5 font-bold text-slate-800 dark:text-slate-100">
            <i class="fa-solid ${w.icon} text-teal-600 ml-1.5"></i>${esc(w.label)}
          </td>
          <td class="p-2.5 font-mono text-slate-600 dark:text-slate-300">${fmtMoney(openM.net)}</td>
          <td class="p-2.5 font-mono font-bold text-emerald-600">+${fmtMoney(todayM.in)}</td>
          <td class="p-2.5 font-mono font-bold text-rose-600">-${fmtMoney(todayM.out)}</td>
          <td class="p-2.5 font-mono font-black ${todayM.net < 0 ? 'text-rose-600' : 'text-teal-700 dark:text-teal-300'}">${fmtMoney(todayM.net)}</td>
          <td class="p-2.5 font-mono font-black ${genM.net < 0 ? 'text-rose-600' : 'text-indigo-700 dark:text-indigo-300'}">${fmtMoney(genM.net)}</td>
          <td class="p-2.5">
            <input type="number" step="0.01" data-closing-actual="${w.id}" data-expected-today="${todayM.net}" data-expected-general="${genM.net}"
              value="${actualVal}" oninput="window.recalcDailyClosingModal162()"
              class="w-28 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded-lg text-center font-mono font-bold bg-white dark:bg-slate-900">
          </td>
          <td class="p-2.5 font-mono font-bold" data-closing-diff="${w.id}">
            ${diffVal === 0 ? '<span class="text-emerald-600">مطابق (0.00)</span>' : (diffVal > 0 ? `<span class="text-sky-600">+${fmtMoney(diffVal)} (زيادة)</span>` : `<span class="text-rose-600">${fmtMoney(diffVal)} (عجز)</span>`)}
          </td>
        </tr>
      `;
    }).join('');

    const historyRowsHtml = (window.appState.dailyClosings162 || []).slice().reverse().slice(0, 15).map(c => `
      <tr class="border-b border-slate-100 dark:border-slate-700">
        <td class="p-2 font-mono font-bold">${esc(c.date)}</td>
        <td class="p-2 font-mono text-slate-500">${esc(c.closedAt || '')}</td>
        <td class="p-2 font-bold">${esc(c.scope === 'today' ? 'رصيد اليوم' : 'الرصيد العام')}</td>
        <td class="p-2 font-mono text-emerald-600 font-bold">${fmtMoney(c.todayNet || 0)}</td>
        <td class="p-2 font-mono text-teal-700 dark:text-teal-300 font-bold">${fmtMoney(c.generalNet || 0)}</td>
        <td class="p-2 font-mono font-bold">${fmtMoney(c.actualTotal || 0)}</td>
        <td class="p-2 font-mono ${Number(c.diffTotal) < 0 ? 'text-rose-600 font-bold' : Number(c.diffTotal) > 0 ? 'text-sky-600 font-bold' : 'text-emerald-600'}">${fmtMoney(c.diffTotal || 0)}</td>
        <td class="p-2">${esc(c.user || 'المدير')}</td>
        <td class="p-2 text-center whitespace-nowrap">
          <button type="button" onclick="window.printDailyClosingReport162('${esc(c.id)}')" class="px-2.5 py-1 rounded-lg bg-slate-800 text-white text-[11px] font-bold hover:bg-slate-700">
            <i class="fa-solid fa-print ml-1"></i>طباعة
          </button>
        </td>
      </tr>
    `).join('');

    overlay.innerHTML = `
      <section class="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto p-6 space-y-5">
        <div class="win-head flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-4">
          <div class="flex items-center gap-3">
            <span class="w-11 h-11 rounded-2xl bg-teal-600 text-white flex items-center justify-center text-xl shadow">
              <i class="fa-solid fa-vault"></i>
            </span>
            <div>
              <h2 class="text-lg font-black">نظام التقفيل اليومي للخزينة وجرد جميع طرق الدفع</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">مطابقة شاملة لرصيد اليوم ورصيد الخزنة العام عبر النقدي والمحافظ وإنستا باي والتحويلات والبطاقات والشيكات</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <input type="date" id="dailyClosingDate162" value="${esc(targetDate)}" onchange="window.openDailyTreasuryClosingModal162(this.value)"
              class="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-mono font-bold bg-white dark:bg-slate-800">
            <button type="button" onclick="document.getElementById('dailyTreasuryClosingModal162')?.remove()" class="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-bold hover:bg-rose-50 hover:text-rose-600">✕ إغلاق</button>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div class="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
            <span class="text-slate-500 block font-bold">رصيد أول اليوم (ما قبل التاريخ)</span>
            <strong class="text-base font-black font-mono mt-1 block">${fmtMoney(stats.openingBeforeToday.net)}</strong>
          </div>
          <div class="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 dark:bg-emerald-950/20">
            <span class="text-emerald-800 dark:text-emerald-300 block font-bold">إجمالي وارد اليوم (بكل الطرق)</span>
            <strong class="text-base font-black font-mono text-emerald-700 dark:text-emerald-400 mt-1 block">+${fmtMoney(stats.today.in)}</strong>
          </div>
          <div class="p-3.5 rounded-xl border border-rose-200 bg-rose-50/70 dark:bg-rose-950/20">
            <span class="text-rose-800 dark:text-rose-300 block font-bold">إجمالي صادر اليوم (بكل الطرق)</span>
            <strong class="text-base font-black font-mono text-rose-700 dark:text-rose-400 mt-1 block">-${fmtMoney(stats.today.out)}</strong>
          </div>
          <div class="p-3.5 rounded-xl border border-teal-300 bg-teal-50/80 dark:bg-teal-950/30">
            <span class="text-teal-900 dark:text-teal-200 block font-bold">صافي رصيد اليوم (${stats.today.count} حركة)</span>
            <strong class="text-base font-black font-mono text-teal-700 dark:text-teal-300 mt-1 block">${fmtMoney(stats.today.net)}</strong>
          </div>
          <div class="p-3.5 rounded-xl border border-indigo-300 bg-indigo-50/80 dark:bg-indigo-950/30">
            <span class="text-indigo-900 dark:text-indigo-200 block font-bold">رصيد الخزنة العام حتى اليوم</span>
            <strong class="text-base font-black font-mono text-indigo-700 dark:text-indigo-300 mt-1 block">${fmtMoney(stats.general.net)}</strong>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-100/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-sliders text-teal-600"></i>
            <span class="font-bold">أساس المطابقة وعرض زر رصيد الخزينة الحي في القائمة الجانبية:</span>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <button type="button" id="closingScopeTodayBtn162" onclick="window.setDailyClosingScope162('today')" class="px-3.5 py-1.5 rounded-xl font-bold transition ${stats.mode === 'today' ? 'bg-teal-600 text-white shadow' : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600'}">
              رصيد اليوم فقط (${fmtMoney(stats.today.net)})
            </button>
            <button type="button" id="closingScopeGeneralBtn162" onclick="window.setDailyClosingScope162('general')" class="px-3.5 py-1.5 rounded-xl font-bold transition ${stats.mode === 'general' ? 'bg-teal-600 text-white shadow' : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600'}">
              رصيد الخزنة العام من البداية حتى اليوم (${fmtMoney(stats.general.net)})
            </button>
          </div>
        </div>

        <div class="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table class="w-full text-xs text-right border-collapse">
            <thead class="bg-slate-100 dark:bg-slate-800 font-black">
              <tr>
                <th class="p-2.5">طريقة الدفع / المحفظة</th>
                <th class="p-2.5">رصيد ما قبل اليوم</th>
                <th class="p-2.5 text-emerald-700">وارد اليوم</th>
                <th class="p-2.5 text-rose-700">صادر اليوم</th>
                <th class="p-2.5 text-teal-700">صافي رصيد اليوم</th>
                <th class="p-2.5 text-indigo-700">الرصيد العام الكلي</th>
                <th class="p-2.5">الرصيد الفعلي المجرود</th>
                <th class="p-2.5">الفرق (المطابقة)</th>
              </tr>
            </thead>
            <tbody>
              ${methodsRowsHtml}
            </tbody>
            <tfoot class="bg-slate-900 text-white font-black">
              <tr>
                <td class="p-2.5">الإجمالي الشامل لجميع طرق الدفع</td>
                <td class="p-2.5 font-mono">${fmtMoney(stats.openingBeforeToday.net)}</td>
                <td class="p-2.5 font-mono text-emerald-300">+${fmtMoney(stats.today.in)}</td>
                <td class="p-2.5 font-mono text-rose-300">-${fmtMoney(stats.today.out)}</td>
                <td class="p-2.5 font-mono text-teal-300">${fmtMoney(stats.today.net)}</td>
                <td class="p-2.5 font-mono text-indigo-300">${fmtMoney(stats.general.net)}</td>
                <td class="p-2.5 font-mono" id="dailyClosingActualTotal162">${fmtMoney(stats.active.net)}</td>
                <td class="p-2.5 font-mono" id="dailyClosingDiffTotal162">مطابق (0.00)</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 text-xs">
          <label class="space-y-1">
            <span class="font-bold text-slate-700 dark:text-slate-200">تسليم / توريد مبلغ من الخزينة عند التقفيل (اختياري):</span>
            <input type="number" id="dailyClosingHandoverAmt162" min="0" step="0.01" value="${existingClosing?.handoverAmount || ''}" placeholder="0.00 (اتركه فارغاً بدون تسليم)"
              class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl font-mono font-bold bg-white dark:bg-slate-900">
          </label>
          <label class="space-y-1">
            <span class="font-bold text-slate-700 dark:text-slate-200">طريقة الدفع المسلمة / المرحلة:</span>
            <select id="dailyClosingHandoverMethod162" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl font-bold bg-white dark:bg-slate-900">
              ${ALL_PAYMENT_WALLETS_162.map(w => `<option value="${esc(w.label)}">${esc(w.label)}</option>`).join('')}
            </select>
          </label>
          <label class="space-y-1">
            <span class="font-bold text-slate-700 dark:text-slate-200">ملاحظات التقفيل اليومي / المستلم:</span>
            <input type="text" id="dailyClosingNotes162" value="${esc(existingClosing?.notes || '')}" placeholder="مثال: تم جرد الخزينة والمحافظ بالكامل..."
              class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900">
          </label>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
          <div class="text-xs text-slate-500">
            ${existingClosing ? `<span class="text-emerald-600 font-bold"><i class="fa-solid fa-circle-check ml-1"></i>تم تقفيل هذا اليوم مسبقاً في ${esc(existingClosing.closedAt)} بواسطة ${esc(existingClosing.user)}</span>` : 'عند الاعتماد يُحفظ سجل التقفيل اليومي ويمكنك طباعة التقرير المعتمد فوراً.'}
          </div>
          <div class="flex flex-wrap items-center gap-2">
            ${existingClosing ? `
              <button type="button" onclick="window.printDailyClosingReport162('${esc(existingClosing.id)}')" class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-2">
                <i class="fa-solid fa-print"></i><span>طباعة تقرير التقفيل</span>
              </button>
            ` : ''}
            <button type="button" id="btnConfirmDailyClosing162" onclick="window.saveDailyTreasuryClosing162()" class="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black flex items-center gap-2 shadow">
              <i class="fa-solid fa-check-double"></i>
              <span>${existingClosing ? 'تحديث واعتماد التقفيل اليومي' : 'اعتماد وحفظ التقفيل اليومي'}</span>
            </button>
          </div>
        </div>

        <div class="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-700">
          <h3 class="text-sm font-black flex items-center gap-2">
            <i class="fa-solid fa-clock-rotate-left text-teal-600"></i>
            <span>سجل التقفيلات اليومية السابقة (${(window.appState.dailyClosings162 || []).length})</span>
          </h3>
          <div class="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 max-h-52">
            <table class="w-full text-xs text-right">
              <thead class="bg-slate-100 dark:bg-slate-800 font-bold">
                <tr>
                  <th class="p-2">التاريخ</th>
                  <th class="p-2">وقت التقفيل</th>
                  <th class="p-2">نطاق الجرد</th>
                  <th class="p-2">صافي اليوم</th>
                  <th class="p-2">الرصيد العام</th>
                  <th class="p-2">الفعلي المجرود</th>
                  <th class="p-2">الفرق</th>
                  <th class="p-2">المسؤول</th>
                  <th class="p-2 text-center">التقرير</th>
                </tr>
              </thead>
              <tbody>
                ${historyRowsHtml || '<tr><td colspan="9" class="p-4 text-center text-slate-400">لا توجد تقفيلات يومية محفوظة بعد.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    `;

    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    window.recalcDailyClosingModal162();
  };

  window.setDailyClosingScope162 = function(scope) {
    const clean = scope === 'today' ? 'today' : 'general';
    setLiveSafeBalanceMode162(clean, false);
    const modal = $('dailyTreasuryClosingModal162');
    if (!modal) return;
    modal.querySelectorAll('input[data-closing-actual]').forEach(inp => {
      const exp = clean === 'today' ? Number(inp.dataset.expectedToday || 0) : Number(inp.dataset.expectedGeneral || 0);
      inp.value = exp;
    });
    const bToday = $('closingScopeTodayBtn162');
    const bGen = $('closingScopeGeneralBtn162');
    if (bToday && bGen) {
      bToday.className = `px-3.5 py-1.5 rounded-xl font-bold transition ${clean === 'today' ? 'bg-teal-600 text-white shadow' : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600'}`;
      bGen.className = `px-3.5 py-1.5 rounded-xl font-bold transition ${clean === 'general' ? 'bg-teal-600 text-white shadow' : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600'}`;
    }
    window.recalcDailyClosingModal162();
  };

  window.recalcDailyClosingModal162 = function() {
    const modal = $('dailyTreasuryClosingModal162');
    if (!modal) return;
    const mode = getLiveSafeBalanceMode162();
    let actualSum = 0;
    let expectedSum = 0;
    modal.querySelectorAll('input[data-closing-actual]').forEach(inp => {
      const mId = inp.dataset.closingActual;
      const exp = mode === 'today' ? Number(inp.dataset.expectedToday || 0) : Number(inp.dataset.expectedGeneral || 0);
      const act = Number(inp.value) || 0;
      const diff = r2(act - exp);
      actualSum = r2(actualSum + act);
      expectedSum = r2(expectedSum + exp);
      const cell = modal.querySelector(`[data-closing-diff="${mId}"]`);
      if (cell) {
        cell.innerHTML = diff === 0
          ? '<span class="text-emerald-600">مطابق (0.00)</span>'
          : (diff > 0 ? `<span class="text-sky-600">+${fmtMoney(diff)} (زيادة)</span>` : `<span class="text-rose-600">${fmtMoney(diff)} (عجز)</span>`);
      }
    });
    const totalDiff = r2(actualSum - expectedSum);
    const actEl = $('dailyClosingActualTotal162');
    const diffEl = $('dailyClosingDiffTotal162');
    if (actEl) actEl.textContent = fmtMoney(actualSum);
    if (diffEl) {
      diffEl.textContent = totalDiff === 0
        ? 'مطابق (0.00)'
        : (totalDiff > 0 ? `+${fmtMoney(totalDiff)} (زيادة)` : `${fmtMoney(totalDiff)} (عجز)`);
    }
  };

  window.saveDailyTreasuryClosing162 = function() {
    if (window.appState?.isLocked) return typeof permDeny === 'function' ? permDeny() : null;
    const date = $('dailyClosingDate162')?.value || getToday();
    const stats = computeLiveTreasuryStats162(date);
    const mode = getLiveSafeBalanceMode162();
    const actualByMethod = {};
    let actualTotal = 0;
    const expectedTotal = mode === 'today' ? stats.today.net : stats.general.net;

    document.querySelectorAll('#dailyTreasuryClosingModal162 input[data-closing-actual]').forEach(inp => {
      const mId = inp.dataset.closingActual;
      const v = r2(Number(inp.value) || 0);
      actualByMethod[mId] = v;
      actualTotal = r2(actualTotal + v);
    });
    if (!Object.keys(actualByMethod).length) {
      ALL_PAYMENT_WALLETS_162.forEach(w => {
        const v = mode === 'today' ? stats.today.byMethod[w.id].net : stats.general.byMethod[w.id].net;
        actualByMethod[w.id] = v;
        actualTotal = r2(actualTotal + v);
      });
    }

    const handoverAmount = Math.max(0, r2(Number($('dailyClosingHandoverAmt162')?.value) || 0));
    const handoverMethod = $('dailyClosingHandoverMethod162')?.value || 'نقدي بالخزينة';
    const notes = String($('dailyClosingNotes162')?.value || '').trim();
    const userObj = typeof getCurrentUser === 'function' ? getCurrentUser() : { name: 'المدير العام' };
    const userName = userObj?.name || userObj?.username || 'المدير العام';

    if (handoverAmount > 0) {
      window.appState.treasury.push({
        id: 't_close_' + Date.now(),
        date: typeof getFormattedNow === 'function' ? getFormattedNow() : `${date} 23:59`,
        type: 'expense',
        kind: 'daily_closing_handover',
        desc: `توريد / تسليم عهدة تقفيل يومية (${date})${notes ? ' — ' + notes : ''}`,
        notes,
        paymentMethod: handoverMethod,
        inAmount: 0,
        outAmount: handoverAmount,
        user: userName
      });
    }

    const updatedStats = computeLiveTreasuryStats162(date);
    const record = {
      id: 'dc_' + Date.now(),
      date,
      closedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true }),
      scope: mode,
      openingNet: updatedStats.openingBeforeToday.net,
      todayIn: updatedStats.today.in,
      todayOut: updatedStats.today.out,
      todayNet: updatedStats.today.net,
      generalIn: updatedStats.general.in,
      generalOut: updatedStats.general.out,
      generalNet: updatedStats.general.net,
      byMethodToday: updatedStats.today.byMethod,
      byMethodGeneral: updatedStats.general.byMethod,
      actualByMethod,
      actualTotal,
      diffTotal: r2(actualTotal - expectedTotal),
      handoverAmount,
      handoverMethod,
      notes,
      user: userName,
      status: 'closed'
    };

    window.appState.dailyClosings162 ||= [];
    const existingIdx = window.appState.dailyClosings162.findIndex(c => c && c.date === date);
    if (existingIdx >= 0) {
      record.id = window.appState.dailyClosings162[existingIdx].id || record.id;
      window.appState.dailyClosings162[existingIdx] = record;
    } else {
      window.appState.dailyClosings162.push(record);
    }

    if (typeof saveState === 'function') saveState(false);
    if (typeof updateAllUI === 'function') updateAllUI();
    renderSidebarLiveTreasuryWidget162();
    renderTreasuryDailyClosingBanner162();
    window.openDailyTreasuryClosingModal162(date);
    if (typeof showToast === 'function') {
      showToast(`تم اعتماد وحفظ التقفيل اليومي للخزينة ليوم ${date} بنجاح!`, 'success');
    }
    return record;
  };

  window.printDailyClosingReport162 = function(closingId) {
    const closings = window.appState?.dailyClosings162 || [];
    const c = closings.find(x => String(x.id) === String(closingId)) || closings[closings.length - 1];
    if (!c) return;
    const shop = window.appState?.shopSettings || {};
    const rowsHtml = ALL_PAYMENT_WALLETS_162.map(w => {
      const tm = c.byMethodToday?.[w.id] || { in: 0, out: 0, net: 0 };
      const gm = c.byMethodGeneral?.[w.id] || { net: 0 };
      const act = c.actualByMethod?.[w.id] ?? (c.scope === 'today' ? tm.net : gm.net);
      const exp = c.scope === 'today' ? tm.net : gm.net;
      const diff = r2(Number(act) - Number(exp));
      return `<tr>
        <td><strong>${esc(w.label)}</strong></td>
        <td>${fmtMoney(tm.in)}</td>
        <td>${fmtMoney(tm.out)}</td>
        <td><strong>${fmtMoney(tm.net)}</strong></td>
        <td><strong>${fmtMoney(gm.net)}</strong></td>
        <td><strong>${fmtMoney(act)}</strong></td>
        <td>${diff === 0 ? 'مطابق (0.00)' : fmtMoney(diff)}</td>
      </tr>`;
    }).join('');

    let frame = $('dailyClosingPrintFrame162');
    if (frame) frame.remove();
    frame = document.createElement('iframe');
    frame.id = 'dailyClosingPrintFrame162';
    frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
    document.body.appendChild(frame);
    const doc = frame.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(`<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>تقرير التقفيل اليومي للخزينة - ${esc(c.date)}</title>
      <style>
        @page { size: A4; margin: 12mm; }
        * { box-sizing: border-box; font-family: Cairo, Tahoma, Arial, sans-serif; color: #000 !important; }
        body { margin: 0; padding: 16px; background: #fff !important; direction: rtl; }
        .head { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
        .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px; }
        .kpi { border: 1.5px solid #334155; border-radius: 10px; padding: 10px; text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1.5px solid #334155; padding: 8px; text-align: right; font-size: 12px; }
        th { background: #e2e8f0 !important; font-weight: 900; }
      </style></head><body>
      <div class="head">
        <div>
          <h2 style="margin:0;font-size:20px;">${esc(shop.name || 'الحمد برنت')} — تقرير التقفيل اليومي للخزينة</h2>
          <p style="margin:4px 0 0;font-size:12px;">تاريخ اليومية: <strong>${esc(c.date)}</strong> | وقت الإقفال: ${esc(c.closedAt || '')} | المسؤول: ${esc(c.user || '')}</p>
        </div>
        <div style="font-weight:900;font-size:14px;">#${esc(c.id.slice(-6))}</div>
      </div>
      <div class="kpis">
        <div class="kpi"><small>رصيد أول اليوم</small><div style="font-weight:900;font-size:15px;">${fmtMoney(c.openingNet || 0)}</div></div>
        <div class="kpi"><small>صافي رصيد اليوم (كل الطرق)</small><div style="font-weight:900;font-size:15px;">${fmtMoney(c.todayNet || 0)}</div></div>
        <div class="kpi"><small>رصيد الخزنة العام التراكمي</small><div style="font-weight:900;font-size:15px;">${fmtMoney(c.generalNet || 0)}</div></div>
        <div class="kpi"><small>الرصيد الفعلي المجرود</small><div style="font-weight:900;font-size:15px;">${fmtMoney(c.actualTotal || 0)}</div></div>
      </div>
      <table>
        <thead>
          <tr><th>طريقة الدفع</th><th>وارد اليوم</th><th>صادر اليوم</th><th>صافي اليوم</th><th>الرصيد العام</th><th>الفعلي المجرود</th><th>الفرق</th></tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      ${c.notes ? `<p style="margin-top:12px;font-size:12px;"><strong>ملاحظات التقفيل:</strong> ${esc(c.notes)}</p>` : ''}
      <div style="display:flex;justify-content:space-between;margin-top:36px;font-size:12px;">
        <div>توقيع أمين الخزينة / المحاسب: ........................</div>
        <div>اعتماد الإدارة: ........................</div>
      </div>
    </body></html>`);
    doc.close();
    setTimeout(() => { try { frame.contentWindow?.focus(); frame.contentWindow?.print(); } catch {} }, 160);
  };

  // ============================================================================
  // 3. ثالثاً: مراجعة وإصلاح قسم الإعدادات بالكامل ليعمل كل إعداد بشكل فوري وفعلي
  // ============================================================================
  function syncAllSettingsStyles162() {
    const u = getUI();
    const s = getSS();
    const dark = document.body.classList.contains('dark');
    const mode = dark ? 'dark' : 'light';
    const mc = (u.modeColors && u.modeColors[mode]) || {};
    const sf = Object.assign({
      cardBg: '', cardText: '', cardBorder: '', borderWidth: 1,
      inputBg: '', inputText: '', inputBorder: '',
      btnBg: '', btnText: '', shadowStrength: 'normal',
      hoverHighlight: true, zebraRows: false
    }, u.surfaceStyles147 || {});
    const X = ':not(#printArea *):not(#printArea):not(#statementInvoiceSheet *):not(#statementInvoiceSheet)';

    let master = $('settingsMasterOverride162');
    if (!master) {
      master = document.createElement('style');
      master.id = 'settingsMasterOverride162';
      document.head.appendChild(master);
    } else if (document.head.lastElementChild !== master) {
      document.head.appendChild(master);
    }

    const rules = [];
    const scale = Math.max(75, Math.min(150, Number(u.fontScale) || 100)) / 100;
    const thBg = u.thBg || mc.thBg || '';
    const thText = u.thText || mc.thText || '';
    const mhBg = u.mhBg || '';
    const mhText = u.mhText || '';
    const canvasBg = (u.bgMode === 'color' && u.bgColor) ? u.bgColor : (mc.canvas || u.presetCanvas || '');
    const panelBg = sf.cardBg || mc.panel || u.presetPanel || '';

    rules.push(`:root, body, body.dark {
      --app-font-scale: ${scale};
      ${thBg ? `--table-head-bg: ${thBg} !important;` : ''}
      ${thText ? `--table-head-text: ${thText} !important;` : ''}
      ${panelBg ? `--surface-card: ${panelBg} !important;` : ''}
    }`);

    if (scale !== 1) {
      rules.push(`
        body .tab-view table th${X},
        body .tab-view table td${X},
        body #modalStatement table th${X},
        body #modalStatement table td${X},
        body #view-operations .ops-table149 th${X},
        body #view-operations .ops-table149 td${X} {
          font-size: ${Math.round(12 * scale * 10) / 10}px !important;
        }
      `);
    }

    if (u.density === 'compact') {
      rules.push(`
        body.compact .tab-view table thead th${X},
        body.compact .tab-view table tbody td${X},
        body.compact .tab-view table tfoot td${X} {
          padding: 5px 7px !important;
        }
      `);
    }

    if (u.radius === 'sharp') {
      rules.push(`
        body .tab-view > .bg-white${X},
        body .tab-view .table-scroll-wrap134${X},
        body .rounded-lg${X}, body .rounded-xl${X}, body .rounded-2xl${X}, body .rounded-3xl${X},
        body button:not(.rounded-full)${X}, body input${X}, body select${X} {
          border-radius: 3px !important;
        }
      `);
    } else if (u.radius === 'round') {
      rules.push(`
        body .tab-view > .bg-white${X},
        body .tab-view .table-scroll-wrap134${X},
        body .rounded-xl${X}, body .rounded-2xl${X} {
          border-radius: 20px !important;
        }
        body button:not(.rounded-full)${X}, body input${X}, body select${X} {
          border-radius: 12px !important;
        }
      `);
    }

    if (thBg || thText) {
      rules.push(`
        body .tab-view table thead tr${X},
        body .tab-view table thead th${X},
        body table thead tr${X},
        body table thead th${X},
        body.dark .tab-view table thead tr${X},
        body.dark .tab-view table thead th${X},
        body.dark table thead th${X} {
          ${thBg ? `background: ${thBg} !important; background-color: ${thBg} !important;` : ''}
          ${thText ? `color: ${thText} !important;` : ''}
        }
        ${thText ? `body .tab-view table thead th *${X}, body table thead th *${X} { color: ${thText} !important; }` : ''}
      `);
    }

    if (mhBg || mhText) {
      rules.push(`
        body .win-head${X},
        body .dialog-head144${X},
        body .modal-header${X},
        body .dialog-header${X},
        body [id^="modal"] > div > .border-b:first-child${X},
        body .tab-view > .bg-white > .p-4.border-b:first-child${X},
        body #salesComposer > .border-b:first-child${X} {
          ${mhBg ? `background: ${mhBg} !important; background-color: ${mhBg} !important; background-image: none !important;` : ''}
          ${mhText ? `color: ${mhText} !important;` : ''}
        }
        ${mhText ? `
        body .win-head h2${X}, body .win-head h3${X}, body .win-head span:not([class*="badge"])${X},
        body .tab-view > .bg-white > .p-4.border-b:first-child h2${X},
        body .tab-view > .bg-white > .p-4.border-b:first-child h3${X} {
          color: ${mhText} !important;
        }` : ''}
      `);
    }

    if (u.bgMode === 'image' && u.bgImage) {
      const ov = (Number(u.bgDim) || 0) / 100;
      const oc = dark ? '2,6,23' : '255,255,255';
      const rp = u.bgFit === 'repeat';
      const zoom = Math.max(20, Number(u.bgZoom) || 100);
      const size = u.bgFit === 'cover' && zoom === 100 ? 'auto, cover' : u.bgFit === 'contain' && zoom === 100 ? 'auto, contain' : `auto, ${zoom}% auto`;
      rules.push(`
        body main#appMainScroll153${X},
        body.dark main#appMainScroll153${X},
        body main${X} {
          background-image: linear-gradient(rgba(${oc},${ov}), rgba(${oc},${ov})), url("${u.bgImage}") !important;
          background-size: ${size} !important;
          background-position: center !important;
          background-repeat: ${rp ? 'repeat' : 'no-repeat'} !important;
        }
      `);
    } else if (canvasBg) {
      rules.push(`
        body main#appMainScroll153${X},
        body.dark main#appMainScroll153${X},
        body main${X} {
          background: ${canvasBg} !important;
          background-color: ${canvasBg} !important;
        }
      `);
    }

    if (panelBg || sf.cardText || sf.cardBorder || Number(sf.borderWidth) > 1) {
      const bw = Math.max(0, Math.min(4, Number(sf.borderWidth) || 1));
      rules.push(`
        body main .bg-white:not(input):not(select):not(textarea):not(button)${X},
        body.dark main .bg-white:not(input):not(select):not(textarea):not(button)${X},
        body .tab-view > .bg-white${X},
        body .ops-card149${X},
        body .wallet147${X} {
          ${panelBg ? `background-color: ${panelBg} !important;` : ''}
          ${sf.cardText ? `color: ${sf.cardText} !important;` : ''}
          ${sf.cardBorder ? `border-color: ${sf.cardBorder} !important;` : ''}
          ${Number(sf.borderWidth) !== 1 ? `border-width: ${bw}px !important; border-style: ${bw ? 'solid' : 'none'} !important;` : ''}
        }
      `);
    }
    if (sf.inputBg || sf.inputText || sf.inputBorder) {
      rules.push(`
        body main input:not([type="checkbox"]):not([type="radio"]):not([type="color"]):not([type="range"])${X},
        body main select${X},
        body main textarea${X},
        body [id^="modal"] input:not([type="checkbox"]):not([type="radio"]):not([type="color"]):not([type="range"])${X},
        body [id^="modal"] select${X},
        body [id^="modal"] textarea${X} {
          ${sf.inputBg ? `background-color: ${sf.inputBg} !important;` : ''}
          ${sf.inputText ? `color: ${sf.inputText} !important;` : ''}
          ${sf.inputBorder ? `border-color: ${sf.inputBorder} !important;` : ''}
        }
      `);
    }
    if (sf.btnBg || sf.btnText) {
      rules.push(`
        body .bg-teal-600${X}, body .bg-teal-700${X}, body .bg-emerald-600${X} {
          ${sf.btnBg ? `background-color: ${sf.btnBg} !important; border-color: ${sf.btnBg} !important;` : ''}
          ${sf.btnText ? `color: ${sf.btnText} !important;` : ''}
        }
      `);
    }
    if (sf.zebraRows) {
      rules.push(`
        body .tab-view table tbody tr:nth-child(even):not(.low-stock-highlight) td${X} {
          background-color: ${dark ? 'rgba(30, 41, 59, 0.65)' : '#f8fafc'} !important;
        }
      `);
    }
    if (sf.hoverHighlight === false) {
      rules.push(`
        body .tab-view table tbody tr:hover td${X} {
          background-color: inherit !important;
        }
      `);
    }

    if (u.iconColor) {
      rules.push(`
        body i[class*="fa-"]${X},
        body svg.nav-icon-svg${X} {
          color: ${u.iconColor} !important;
        }
      `);
    }
    if (Number(u.iconScale) && Number(u.iconScale) !== 100) {
      const iScale = Number(u.iconScale) / 100;
      rules.push(`
        body svg.nav-icon-svg${X} {
          transform: scale(${iScale});
        }
      `);
    }

    const fitMode = u.logoFrameFit === 'cover' ? 'cover' : 'contain';
    const scaleLogo = Math.max(40, Number(u.logoFrameScale) || 100);
    rules.push(`
      #logoPreviewBox img,
      #sideLogoContainer img,
      #mobileLogoContainer img,
      #topHeaderLogoMini img {
        object-fit: ${fitMode} !important;
        width: ${scaleLogo}% !important;
        height: ${scaleLogo}% !important;
      }
    `);

    const lowStockColor = s.lowStockColor || '#fee2e2';
    rules.push(`
      body .tab-view table tbody tr.low-stock-highlight${X},
      body .tab-view table tbody tr.low-stock-highlight td${X} {
        background-color: ${lowStockColor} !important;
        color: #7f1d1d !important;
      }
    `);

    const bd = u.bold || {};
    if (bd.all) {
      rules.push(`body${X}, body *:not(i)${X} { font-weight: 700 !important; }`);
    }
    if (bd.thead) {
      rules.push(`body .tab-view table thead th${X}, body table thead th${X} { font-weight: 900 !important; }`);
    }
    if (bd.numbers) {
      const nw = Number(u.numW) || 700;
      const nf = (u.numFont || 'app') === 'mono'
        ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
        : "var(--app-font, 'Cairo Variable', 'Cairo', sans-serif)";
      rules.push(`
        body .font-mono${X}, body .font-mono *:not(i)${X},
        body .is-num${X}, body input[type="number"]${X},
        body .tab-view table td.font-mono${X} {
          font-weight: ${nw} !important;
          font-family: ${nf} !important;
        }
      `);
    }

    if (typeof CLR_GROUPS !== 'undefined' && Array.isArray(CLR_GROUPS)) {
      const mKey = dark ? 'd' : 'l';
      const cl = u.clr || {};
      CLR_GROUPS.forEach(g => (g[2] || []).forEach(([k, , kind, sels]) => {
        const v = cl[k] && cl[k][mKey];
        if (!v || !/^#[0-9a-f]{3,8}$/i.test(v)) return;
        const highSels = sels.map(q => `html body ${q}${X}`).join(', ');
        if (kind === 'bg') {
          rules.push(`${highSels} { background: ${v} !important; background-color: ${v} !important; background-image: none !important; }`);
          if (k === 'cardBg') {
            rules.push(`html body .tab-view > .bg-white${X}, html body .tab-view table tbody td${X} { background-color: ${v} !important; }`);
          }
        } else if (kind === 'border') {
          rules.push(`${highSels} { border-color: ${v} !important; }`);
        } else {
          rules.push(`${highSels} { color: ${v} !important; }`);
        }
      }));
    }

    rules.push(`
      [id$="Tools"].no-print:not(.hidden),
      .table-tools-bar162:not(.hidden),
      #clientTransferTools:not(.hidden),
      #supplierTransferTools:not(.hidden),
      #view-operations .ops-tabs149:not(.hidden),
      #view-operations .ops-toolbar149:not([data-ops-pager]):not(.hidden),
      #invoiceTools149.ops-invoice-tools149:not(.hidden) {
        display: flex !important;
        flex-direction: row !important;
        flex-wrap: nowrap !important;
        align-items: center !important;
        justify-content: flex-start !important;
        gap: 5px !important;
        padding: 6px 8px !important;
        overflow: hidden !important;
        overflow-x: hidden !important;
        overflow-y: hidden !important;
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
        white-space: nowrap !important;
        box-sizing: border-box !important;
      }
      [id$="Tools"].no-print::-webkit-scrollbar,
      .table-tools-bar162::-webkit-scrollbar,
      #clientTransferTools::-webkit-scrollbar,
      #supplierTransferTools::-webkit-scrollbar,
      #view-operations .ops-toolbar149::-webkit-scrollbar,
      #view-operations .ops-tabs149::-webkit-scrollbar,
      #invoiceTools149::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }
      [id$="Tools"].no-print > div:not(.hidden),
      .table-tools-bar162 > div:not(.hidden),
      .table-tools-group162:not(.hidden),
      #view-operations .ops-pane-actions149:not(.hidden) {
        display: inline-flex !important;
        flex-direction: row !important;
        flex-wrap: nowrap !important;
        align-items: center !important;
        justify-content: flex-start !important;
        gap: 4px !important;
        margin: 0 !important;
        padding: 0 !important;
        flex: 0 1 auto !important;
        flex-shrink: 1 !important;
        white-space: nowrap !important;
        min-width: 0 !important;
        max-width: 100% !important;
      }
      [id$="Tools"].no-print button:not(.hidden),
      [id$="Tools"].no-print select:not(.hidden),
      .table-tools-bar162 button:not(.hidden),
      .table-tools-bar162 select:not(.hidden),
      #clientTransferTools button:not(.hidden),
      #supplierTransferTools button:not(.hidden),
      #view-operations .ops-tabs149 > button:not(.hidden),
      #view-operations .ops-toolbar149:not([data-ops-pager]) > button:not(.hidden),
      #view-operations .ops-toolbar149:not([data-ops-pager]) > select:not(.hidden),
      #view-operations .ops-pane-actions149 > button:not(.hidden),
      #invoiceTools149.ops-invoice-tools149 > button:not(.hidden) {
        height: 32px !important;
        min-height: 32px !important;
        max-height: 32px !important;
        padding: 0 7px !important;
        margin: 0 !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 3.5px !important;
        font-size: 10.5px !important;
        font-weight: 700 !important;
        line-height: 1 !important;
        border-radius: 8px !important;
        white-space: nowrap !important;
        flex: 0 1 auto !important;
        flex-shrink: 1 !important;
        min-width: 0 !important;
        max-width: 100% !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        box-sizing: border-box !important;
        vertical-align: middle !important;
      }
      [id$="Tools"].no-print select:not(.hidden),
      .table-tools-bar162 select:not(.hidden) {
        width: 110px !important;
        min-width: 82px !important;
        max-width: 118px !important;
        flex: 0 1 110px !important;
        padding: 0 6px !important;
        text-overflow: ellipsis !important;
        overflow: hidden !important;
      }
      #view-operations #opsSearch149:not(.hidden) {
        height: 32px !important;
        min-height: 32px !important;
        max-height: 32px !important;
        width: 155px !important;
        min-width: 100px !important;
        max-width: 175px !important;
        flex: 0 1 155px !important;
        padding: 0 10px !important;
        margin: 0 !important;
        font-size: 11px !important;
        font-weight: 700 !important;
        line-height: 1 !important;
        border-radius: 8px !important;
        box-sizing: border-box !important;
        vertical-align: middle !important;
      }
      [id$="Tools"] span[data-table-status],
      .table-tools-bar162 span[data-table-status] {
        display: none !important;
      }
      table td[colspan] > .flex:not(.hidden),
      table td[colspan] .flex:not(.hidden) {
        display: flex !important;
        flex-direction: row !important;
        flex-wrap: wrap !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 8px !important;
        width: auto !important;
      }
      table td[colspan] button:not(.act-icon-btn):not(.hidden) {
        width: auto !important;
        min-width: max-content !important;
        max-width: none !important;
        height: 36px !important;
        min-height: 36px !important;
        max-height: none !important;
        padding: 0 16px !important;
        flex: 0 0 auto !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 6px !important;
        font-size: 12px !important;
        font-weight: 700 !important;
        line-height: 1 !important;
        border-radius: 10px !important;
        white-space: nowrap !important;
      }
      body main > header {
        display: flex !important;
        flex-direction: row !important;
        flex-wrap: wrap !important;
        align-items: center !important;
        justify-content: space-between !important;
        row-gap: 6px !important;
        column-gap: 8px !important;
        box-sizing: border-box !important;
      }
      body main > header > #hdrClock {
        order: -10 !important;
        flex: 0 0 100% !important;
        width: 100% !important;
        max-width: 100% !important;
        min-height: 26px !important;
        max-height: 28px !important;
        padding: 2px 12px !important;
        margin: 0 !important;
        display: flex !important;
        flex-direction: row !important;
        flex-wrap: nowrap !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 14px !important;
        border-radius: 9px !important;
        white-space: nowrap !important;
        box-sizing: border-box !important;
      }
      body main > header > #hdrClock[style*="display: none"],
      body main > header > #hdrClock[style*="display:none"] {
        display: none !important;
      }
      body main > header > div:last-child,
      body main > header #topHeaderActions163,
      body main > header .header-actions-bar161,
      #view-operations #opsTopRow149:not(.hidden),
      #view-operations #opsTopSearchGroup149:not(.hidden) {
        display: flex !important;
        flex-direction: row !important;
        flex-wrap: nowrap !important;
        align-items: center !important;
        box-sizing: border-box !important;
      }
      :has(.floating-win-nav162) > .window-tools150:not(.floating-win-nav162),
      .window-tools150:has(~ * .floating-win-nav162),
      .window-tools150:has(~ .floating-win-nav162),
      .floating-win-nav162 ~ .floating-win-nav162 {
        display: none !important;
      }
      body main > header #globalSearchWrap152:not(.hidden),
      body main > header .global-search-wrap152:not(.hidden) {
        width: clamp(115px, 12.5vw, 150px) !important;
        min-width: 110px !important;
        max-width: 155px !important;
        height: 34px !important;
        padding: 0 8px !important;
        flex: 0 1 145px !important;
      }
      body main > header #notificationsButton152:not(.hidden),
      body main > header .notifications-button152:not(.hidden) {
        width: 34px !important;
        height: 34px !important;
        min-width: 34px !important;
        max-width: 34px !important;
        background: #1e293b !important;
        background-color: #1e293b !important;
        color: #fbbf24 !important;
        border: 1.5px solid #475569 !important;
      }
      body main > header #notificationsButton152 > i,
      body main > header .notifications-button152 > i {
        color: #fbbf24 !important;
        font-size: 15px !important;
        font-weight: 900 !important;
      }
      @media (min-width: 900px) {
        #view-dashboard #dashKpiGrid163:not(.hidden),
        #view-dashboard .dash-kpi-grid163:not(.hidden) {
          display: grid !important;
          grid-template-columns: repeat(7, minmax(0, 1fr)) !important;
          gap: 8px !important;
          align-items: stretch !important;
        }
      }
      #salesComposer #saleSummaryBox163,
      #salesComposer #salePaidRow163,
      #salesComposer #salePaidControls163 {
        min-width: 0 !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
      }
      #salesComposer #salePaid {
        width: clamp(64px, 42%, 104px) !important;
        min-width: 60px !important;
        max-width: 104px !important;
        flex: 0 1 104px !important;
        box-sizing: border-box !important;
      }
    `);

    const cssText = rules.join('\n');
    if (master.textContent !== cssText) {
      master.textContent = cssText;
    }
  }

  function injectLiveTreasuryAndSortingSettingsCard162() {
    const dtBox = $('dtBox');
    if (dtBox && !$('treasuryAndSortSettingsCard162')) {
      const mode = getLiveSafeBalanceMode162();
      const showMethods = getSS().showSidebarSafeMethods162 !== false;
      const alphaDef = getSS().alphaSortDefault162 !== false;
      const card = document.createElement('div');
      card.id = 'treasuryAndSortSettingsCard162';
      card.className = 'mt-5 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-4 text-xs';
      card.innerHTML = `
        <div class="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2.5">
          <span class="flex items-center gap-2"><i class="fa-solid fa-vault text-teal-600"></i><span>إعدادات رصيد الخزينة الحي ونظام التقفيل اليومي والترتيب الأبجدي</span></span>
          <button type="button" onclick="window.openDailyTreasuryClosingModal162()" class="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5">
            <i class="fa-solid fa-calendar-check"></i><span>فتح نظام التقفيل اليومي</span>
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <span class="font-bold text-slate-700 dark:text-slate-200 block">وضع عرض زر «رصيد الخزينة الحي» في القائمة الجانبية (شامل كل طرق الدفع):</span>
            <div class="flex flex-wrap gap-2">
              <button type="button" onclick="window.setLiveSafeBalanceMode162('today');window.refreshSettingsExtraCards162()" class="px-3 py-1.5 rounded-xl border font-bold transition ${mode === 'today' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200'}">رصيد اليوم (شامل كل طرق الدفع)</button>
              <button type="button" onclick="window.setLiveSafeBalanceMode162('general');window.refreshSettingsExtraCards162()" class="px-3 py-1.5 rounded-xl border font-bold transition ${mode === 'general' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200'}">رصيد الخزنة العام (من البداية حتى اليوم)</button>
            </div>
            <label class="flex items-center gap-2 pt-1 cursor-pointer font-bold text-slate-700 dark:text-slate-200">
              <input type="checkbox" class="accent-teal-600" ${showMethods ? 'checked' : ''} onchange="window.toggleSidebarSafeMethods162(this.checked)">
              <span>إظهار تفصيل جميع طرق الدفع أسفل رصيد الخزينة الحي في القائمة الجانبية</span>
            </label>
          </div>
          <div class="space-y-2">
            <span class="font-bold text-slate-700 dark:text-slate-200 block">الترتيب الأبجدي الافتراضي للأقسام والقوائم:</span>
            <label class="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-200">
              <input type="checkbox" class="accent-teal-600" ${alphaDef ? 'checked' : ''} onchange="window.toggleAlphaSortDefault162(this.checked)">
              <span>تفعيل الترتيب الأبجدي الافتراضي (أ ← ي) لأسماء العملاء والموردين والأصناف في القوائم</span>
            </label>
            <div class="flex flex-wrap gap-2 pt-1">
              <button type="button" onclick="window.sortAllEntitiesAlphabetically162('asc')" class="px-3 py-1.5 rounded-xl border border-teal-300 bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 font-bold hover:bg-teal-50">
                <i class="fa-solid fa-arrow-down-a-z ml-1"></i>ترتيب كل الأقسام أبجدياً (أ ← ي)
              </button>

            </div>
          </div>
        </div>
      `;
      dtBox.appendChild(card);
    }
  }

  window.refreshSettingsExtraCards162 = function() {
    $('treasuryAndSortSettingsCard162')?.remove();
    injectLiveTreasuryAndSortingSettingsCard162();
  };

  window.toggleSidebarSafeMethods162 = function(checked) {
    getSS().showSidebarSafeMethods162 = !!checked;
    if (typeof saveState === 'function') saveState(false);
    renderSidebarLiveTreasuryWidget162();
  };

  // ============================================================================
  // 4. رابعاً: الترتيب الأبجدي لأسماء العملاء والموردين والأصناف في كل الأقسام
  // ============================================================================
  const arabicCollator162 = new Intl.Collator('ar', { sensitivity: 'base', numeric: true, ignorePunctuation: true });

  function normalizeArabicSortText162(val) {
    return String(val ?? '')
      .trim()
      .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
      .replace(/[أإآٱ]/g, 'ا')
      .replace(/ؤ/g, 'و')
      .replace(/ئ/g, 'ي')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه');
  }

  function compareArabicAlpha162(a, b, dir = 'asc') {
    const na = normalizeArabicSortText162(a);
    const nb = normalizeArabicSortText162(b);
    if (!na && !nb) return 0;
    if (!na) return 1;
    if (!nb) return -1;
    const cmp = arabicCollator162.compare(na, nb);
    return dir === 'desc' ? -cmp : cmp;
  }
  window.compareArabicAlpha162 = compareArabicAlpha162;

  function getAlphaSortedCopy162(list, nameField = 'name', dir = 'asc') {
    if (!Array.isArray(list)) return [];
    const shouldSort = getSS().alphaSortDefault162 !== false;
    if (!shouldSort && !dir) return [...list];
    return [...list].sort((x, y) => compareArabicAlpha162(x?.[nameField] || x?.title || '', y?.[nameField] || y?.title || '', dir || 'asc'));
  }

  window.toggleAlphaSortDefault162 = function(enabled) {
    getSS().alphaSortDefault162 = !!enabled;
    if (typeof saveState === 'function') saveState(false);
    if (enabled) window.sortAllEntitiesAlphabetically162('asc', false);
    if (typeof populateDropdowns === 'function') populateDropdowns();
    if (typeof updateAllUI === 'function') updateAllUI();
    if (typeof showToast === 'function') {
      showToast(enabled ? 'تم تفعيل الترتيب الأبجدي الافتراضي في جميع الأقسام والقوائم.' : 'تم إيقاف الترتيب الأبجدي التلقائي.', 'info');
    }
  };

  const TABLE_ALPHA_COL_MAP_162 = {
    clientsTableBody: 'name',
    suppliersTableBody: 'name',
    inventoryTableBody: 'name',
    stockTakeTableBody: 'name',
    ordersTableBody: 'client',
    quotesTableBody: 'client',
    purchasesTableBody: 'supplier',
    treasuryTableBody: 'desc',
    servicesTableBody: 'party',
    serviceCatalogTableBody: 'name',
    usersTableBody: 'name',
    dashRecentOrdersTable: 'client',
    statementMovements: 'desc',
    opsTable149_jobs: 'client',
    opsTable149_pricing: 'item',
    opsTable149_shifts: 'user',
    opsTable149_reservations: 'client',
    opsTable149_waste: 'desc'
  };

  window.sortSectionAlphabetically162 = function(tableKey, dirOverride) {
    const s = getSS();
    s.tableViews ||= {};
    const v = (s.tableViews[tableKey] ||= { rules: [], sort: '', dir: 'asc' });
    const colId = TABLE_ALPHA_COL_MAP_162[tableKey] || 'name';
    const nextDir = dirOverride || (v.sort === colId && v.dir === 'asc' ? 'desc' : 'asc');
    v.sort = colId;
    v.dir = nextDir;

    if (tableKey === 'clientsTableBody' && Array.isArray(window.appState?.clients)) {
      window.appState.clients.sort((a, b) => compareArabicAlpha162(a?.name, b?.name, nextDir));
    } else if (tableKey === 'suppliersTableBody' && Array.isArray(window.appState?.suppliers)) {
      window.appState.suppliers.sort((a, b) => compareArabicAlpha162(a?.name, b?.name, nextDir));
    } else if ((tableKey === 'inventoryTableBody' || tableKey === 'stockTakeTableBody') && Array.isArray(window.appState?.items)) {
      window.appState.items.sort((a, b) => compareArabicAlpha162(a?.name, b?.name, nextDir));
    } else if (tableKey === 'serviceCatalogTableBody' && Array.isArray(window.appState?.serviceCatalog)) {
      window.appState.serviceCatalog.sort((a, b) => compareArabicAlpha162(a?.name, b?.name, nextDir));
    }

    if (window.PAGE_STATE?.[tableKey]) window.PAGE_STATE[tableKey].page = 0;
    if (typeof saveState === 'function') saveState(false);
    if (typeof populateDropdowns === 'function') populateDropdowns();

    const renderFnMap = {
      clientsTableBody: window.renderClientsTable,
      suppliersTableBody: window.renderSuppliersTable,
      inventoryTableBody: window.renderInventoryTable,
      stockTakeTableBody: window.renderStockTakeTable,
      ordersTableBody: window.renderOrdersTable,
      quotesTableBody: window.renderQuotes,
      purchasesTableBody: window.renderPurchasesTable,
      treasuryTableBody: window.renderTreasuryTable,
      servicesTableBody: window.renderServicesTable,
      serviceCatalogTableBody: window.renderServiceCatalogTable
    };
    if (String(tableKey || '').startsWith('opsTable149_') && typeof window.Operations149UI?.render === 'function') { window.Operations149UI.render(); } else { renderFnMap[tableKey]?.(); }
    decorateAlphaSortButtonsInToolbars162();
    if (typeof showToast === 'function') {
      showToast(`تم الترتيب الأبجدي (${nextDir === 'asc' ? 'أ ← ي' : 'ي ← أ'}) بنجاح.`, 'info');
    }
    return nextDir;
  };

  window.sortAllEntitiesAlphabetically162 = function(dir = 'asc', notify = true) {
    const d = dir === 'desc' ? 'desc' : 'asc';
    if (Array.isArray(window.appState?.clients)) {
      window.appState.clients.sort((a, b) => compareArabicAlpha162(a?.name, b?.name, d));
    }
    if (Array.isArray(window.appState?.suppliers)) {
      window.appState.suppliers.sort((a, b) => compareArabicAlpha162(a?.name, b?.name, d));
    }
    if (Array.isArray(window.appState?.items)) {
      window.appState.items.sort((a, b) => compareArabicAlpha162(a?.name, b?.name, d));
    }
    if (Array.isArray(window.appState?.serviceCatalog)) {
      window.appState.serviceCatalog.sort((a, b) => compareArabicAlpha162(a?.name, b?.name, d));
    }
    const s = getSS();
    s.tableViews ||= {};
    Object.entries(TABLE_ALPHA_COL_MAP_162).forEach(([tKey, colId]) => {
      s.tableViews[tKey] ||= { rules: [], sort: '', dir: 'asc' };
      s.tableViews[tKey].sort = colId;
      s.tableViews[tKey].dir = d;
    });
    if (typeof saveState === 'function') saveState(false);
    if (typeof populateDropdowns === 'function') populateDropdowns();
    if (typeof updateAllUI === 'function') updateAllUI();
    decorateAlphaSortButtonsInToolbars162();
    if (notify && typeof showToast === 'function') {
      showToast(`تم ترتيب جميع العملاء والموردين والأصناف والخدمات ترتيباً أبجدياً (${d === 'asc' ? 'أ ← ي' : 'ي ← أ'}) في كافة الأقسام!`, 'success');
    }
  };

  function normalizeSingleTableToolbar162(bar) {
    if (!bar || !bar.style) return;
    bar.querySelectorAll?.('span[data-table-status]')?.forEach(el => el.remove?.());
    bar.classList?.remove?.('flex-wrap', 'justify-between', 'overflow-x-auto');
    bar.classList?.add?.('table-tools-bar162', 'flex-nowrap', 'justify-start', 'overflow-hidden');
    bar.style.setProperty('display', 'flex', 'important');
    bar.style.setProperty('flex-direction', 'row', 'important');
    bar.style.setProperty('flex-wrap', 'nowrap', 'important');
    bar.style.setProperty('align-items', 'center', 'important');
    bar.style.setProperty('justify-content', 'flex-start', 'important');
    bar.style.setProperty('gap', '4px', 'important');
    bar.style.setProperty('padding', '5px 6px', 'important');
    bar.style.setProperty('width', '100%', 'important');
    bar.style.setProperty('max-width', '100%', 'important');
    bar.style.setProperty('min-width', '0', 'important');
    bar.style.setProperty('overflow', 'hidden', 'important');
    bar.style.setProperty('overflow-x', 'hidden', 'important');
    bar.style.setProperty('overflow-y', 'hidden', 'important');
    bar.style.setProperty('scrollbar-width', 'none', 'important');
    bar.style.setProperty('white-space', 'nowrap', 'important');
    bar.style.setProperty('box-sizing', 'border-box', 'important');

    bar.querySelectorAll?.(':scope > div')?.forEach(grp => {
      grp.classList?.remove?.('flex-wrap', 'shrink-0');
      grp.classList?.add?.('table-tools-group162', 'flex-nowrap', 'min-w-0');
      grp.style?.setProperty?.('display', 'inline-flex', 'important');
      grp.style?.setProperty?.('flex-direction', 'row', 'important');
      grp.style?.setProperty?.('flex-wrap', 'nowrap', 'important');
      grp.style?.setProperty?.('align-items', 'center', 'important');
      grp.style?.setProperty?.('justify-content', 'flex-start', 'important');
      grp.style?.setProperty?.('gap', '4px', 'important');
      grp.style?.setProperty?.('flex', '0 1 auto', 'important');
      grp.style?.setProperty?.('flex-shrink', '1', 'important');
      grp.style?.setProperty?.('min-width', '0', 'important');
      grp.style?.setProperty?.('max-width', '100%', 'important');
      grp.style?.setProperty?.('white-space', 'nowrap', 'important');
    });

    bar.querySelectorAll?.('button, select, input[type="search"], input[type="text"]')?.forEach(ctrl => {
      const tag = String(ctrl.tagName || '').toLowerCase();
      ctrl.classList?.remove?.('shrink-0');
      ctrl.style?.setProperty?.('height', '32px', 'important');
      ctrl.style?.setProperty?.('min-height', '32px', 'important');
      ctrl.style?.setProperty?.('max-height', '32px', 'important');
      ctrl.style?.setProperty?.('display', 'inline-flex', 'important');
      ctrl.style?.setProperty?.('align-items', 'center', 'important');
      ctrl.style?.setProperty?.('justify-content', 'center', 'important');
      ctrl.style?.setProperty?.('white-space', 'nowrap', 'important');
      ctrl.style?.setProperty?.('flex', tag === 'select' ? '0 1 110px' : '0 1 auto', 'important');
      ctrl.style?.setProperty?.('flex-shrink', '1', 'important');
      ctrl.style?.setProperty?.('min-width', tag === 'select' ? '82px' : '0', 'important');
      ctrl.style?.setProperty?.('max-width', tag === 'select' ? '118px' : '100%', 'important');
      if (tag === 'select') {
        ctrl.style?.setProperty?.('width', '110px', 'important');
        ctrl.style?.setProperty?.('padding', '0 6px', 'important');
      } else if (tag === 'button') {
        ctrl.style?.setProperty?.('padding', '0 7px', 'important');
      }
      ctrl.style?.setProperty?.('font-size', '10.5px', 'important');
      ctrl.style?.setProperty?.('overflow', 'hidden', 'important');
      ctrl.style?.setProperty?.('text-overflow', 'ellipsis', 'important');
      ctrl.style?.setProperty?.('vertical-align', 'middle', 'important');
      ctrl.style?.setProperty?.('box-sizing', 'border-box', 'important');
      ctrl.style?.setProperty?.('margin', '0', 'important');
    });
  }

  function cleanOrdersTableEmptyState162() {
    const tbody = $('ordersTableBody');
    if (!tbody) return;
    tbody.querySelectorAll?.('td[colspan] button[onclick*="newSale"], button[onclick*="newSale()"]')?.forEach(btn => {
      btn.remove?.();
    });
    tbody.querySelectorAll?.('td[colspan] button[onclick*="setSalesRange"]')?.forEach(btn => {
      btn.style?.setProperty?.('width', 'auto', 'important');
      btn.style?.setProperty?.('min-width', 'max-content', 'important');
      btn.style?.setProperty?.('height', '36px', 'important');
      btn.style?.setProperty?.('padding', '0 16px', 'important');
      btn.style?.setProperty?.('display', 'inline-flex', 'important');
      btn.style?.setProperty?.('align-items', 'center', 'important');
      btn.style?.setProperty?.('justify-content', 'center', 'important');
      btn.style?.setProperty?.('white-space', 'nowrap', 'important');
    });
  }

  function decorateAlphaSortButtonsInToolbars162(onlyKey) {
    const keys = (typeof onlyKey === 'string' && TABLE_ALPHA_COL_MAP_162[onlyKey])
      ? [onlyKey]
      : Object.keys(TABLE_ALPHA_COL_MAP_162);
    keys.forEach(tableKey => {
      const tools = $(tableKey + 'Tools');
      if (!tools) return;
      const v = getSS().tableViews?.[tableKey] || {};
      const colId = TABLE_ALPHA_COL_MAP_162[tableKey];
      const isAlphaActive = v.sort === colId;
      const dir = isAlphaActive ? (v.dir || 'asc') : 'asc';
      let btn = $('alphaSortBtn162_' + tableKey);
      const firstGroup = tools.querySelector?.('.table-tools-group162, :scope > div:first-child, .flex') || tools;
      if (!btn) {
        btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'alphaSortBtn162_' + tableKey;
        const statusSpan = firstGroup.querySelector?.('span[data-table-status], span.text-slate-500');
        if (statusSpan && statusSpan.parentElement === firstGroup && typeof firstGroup.insertBefore === 'function') {
          firstGroup.insertBefore(btn, statusSpan);
        } else {
          firstGroup.appendChild(btn);
        }
      }
      btn.className = `px-2.5 py-1.5 rounded-lg border text-xs font-bold inline-flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap transition ${isAlphaActive ? 'bg-teal-600 text-white border-teal-600 shadow-sm' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-100 border-slate-300 dark:border-slate-600 hover:border-teal-500'}`;
      btn.title = 'ترتيب الأسماء ترتيباً أبجدياً (أ ← ي / ي ← أ)';
      btn.innerHTML = `<i class="fa-solid ${dir === 'desc' ? 'fa-arrow-up-z-a' : 'fa-arrow-down-a-z'} ml-1"></i>ترتيب أبجدي ${isAlphaActive ? (dir === 'desc' ? '(ي ← أ)' : '(أ ← ي)') : '(أ-ي)'}`;
      btn.onclick = () => window.sortSectionAlphabetically162(tableKey);
      normalizeSingleTableToolbar162(tools);
    });

    document.querySelectorAll?.('[id$="Tools"].no-print, #clientTransferTools, #supplierTransferTools')?.forEach(bar => {
      normalizeSingleTableToolbar162(bar);
    });

    // Also add alphabetical sort in #view-operations and align all Operations & Development button bars on a single row
    const opsToolbar = $('opsMainToolbar149') || document.querySelector('#view-operations .ops-toolbar149:not([data-ops-pager])');
    if (opsToolbar && !$('alphaSortBtn162_operations')) {
      const b = document.createElement('button');
      b.type = 'button';
      b.id = 'alphaSortBtn162_operations';
      b.innerHTML = '<i class="fa-solid fa-arrow-down-a-z ml-1"></i>ترتيب أبجدي (أ-ي)';
      b.onclick = () => {
        const dir = b.dataset.dir === 'asc' ? 'desc' : 'asc';
        b.dataset.dir = dir;
        if (Array.isArray(window.appState?.orders)) {
          window.appState.orders.sort((x, y) => compareArabicAlpha162(x?.clientName, y?.clientName, dir === 'asc' ? 'desc' : 'asc'));
        }
        $('opsRefresh149')?.click();
        if (typeof showToast === 'function') showToast(`تم ترتيب أوامر التشغيل أبجدياً حسب اسم العميل (${dir === 'asc' ? 'أ ← ي' : 'ي ← أ'}).`, 'info');
      };
      const paneAct = $('opsPaneActions149');
      if (paneAct && paneAct.parentElement === opsToolbar && typeof opsToolbar.insertBefore === 'function') {
        opsToolbar.insertBefore(b, paneAct);
      } else {
        opsToolbar.appendChild(b);
      }
    }
    const opsTopRow = $('opsTopRow149');
    if (opsTopRow) normalizeSingleTableToolbar162(opsTopRow);
    const opsTabs = $('opsTabs149');
    if (opsTabs) normalizeSingleTableToolbar162(opsTabs);
    document.querySelectorAll?.('#view-operations .ops-toolbar149:not([data-ops-pager]), #invoiceTools149')?.forEach(bar => {
      normalizeSingleTableToolbar162(bar);
    });
    cleanOrdersTableEmptyState162();
  }
  window.decorateAlphaSortButtonsInToolbars162 = decorateAlphaSortButtonsInToolbars162;
  window.normalizeSingleTableToolbar162 = normalizeSingleTableToolbar162;
  window.cleanOrdersTableEmptyState162 = cleanOrdersTableEmptyState162;

  // ============================================================================
  // 5. خامساً: البحث عن العميل أو المورد في نافذة حركة الخزينة + إظهار أي مبلغ على
  //    العميل أو المورد شاملاً رصيد بداية فترة التعامل (الرصيد الافتتاحي)
  // ============================================================================
  function getPartyFullBalanceBreakdown162(partyType, partyId) {
    const isClient = partyType === 'client';
    const list = isClient ? (window.appState?.clients || []) : (window.appState?.suppliers || []);
    const party = list.find(p => String(p.id) === String(partyId));
    if (!party) return null;

    const openingBalance = r2(Number(isClient ? party.initialBalance : party.balance) || 0);
    const totalBalance = r2(
      isClient
        ? (typeof getClientBalance === 'function' ? getClientBalance(party.id) : openingBalance)
        : (typeof getSupplierBalance === 'function' ? getSupplierBalance(party.id) : openingBalance)
    );

    if (isClient) {
      const orders = (window.appState?.orders || []).filter(o => String(o.clientId) === String(party.id) && o.status !== 'ملغي');
      const invoicesRemaining = r2(orders.reduce((s, o) => s + (typeof orderRemaining === 'function' ? orderRemaining(o) : Math.max(0, (Number(o.total) || 0) - (Number(o.paid) || 0))), 0));
      const unlinkedReceipts = r2(
        (window.appState?.treasury || [])
          .filter(t => String(t.clientId) === String(party.id) && t.type === 'collection' && !t.orderId && !t.serviceId && !(typeof isOrderDepositEntry === 'function' && isOrderDepositEntry(t)))
          .reduce((s, t) => s + (Number(t.inAmount) || 0), 0)
      );
      const openingRemaining = Math.max(0, r2(openingBalance - unlinkedReceipts));
      return {
        partyType: 'client',
        party,
        openingBalance,
        openingRemaining,
        invoicesRemaining,
        unlinkedMovements: unlinkedReceipts,
        totalBalance
      };
    } else {
      const purchases = (window.appState?.purchases || []).filter(p => String(p.supplierId) === String(party.id));
      const purchasesRemaining = r2(purchases.reduce((s, p) => s + Math.max(0, Number(p.due ?? ((Number(p.total) || 0) - (Number(p.paid) || 0)))), 0));
      const unlinkedPayments = r2(
        (window.appState?.treasury || [])
          .filter(t => String(t.supplierId) === String(party.id) && t.type === 'supplier_payment' && !t.purchaseId && !t.serviceId && !(typeof isPurchasePaymentEntry === 'function' && isPurchasePaymentEntry(t)))
          .reduce((s, t) => s + (Number(t.outAmount) || 0), 0)
      );
      const openingRemaining = Math.max(0, r2(openingBalance - unlinkedPayments));
      return {
        partyType: 'supplier',
        party,
        openingBalance,
        openingRemaining,
        invoicesRemaining: purchasesRemaining,
        unlinkedMovements: unlinkedPayments,
        totalBalance
      };
    }
  }
  window.getPartyFullBalanceBreakdown162 = getPartyFullBalanceBreakdown162;

  function formatPartyOptionLabel162(partyType, party) {
    if (!party) return '';
    const info = getPartyFullBalanceBreakdown162(partyType, party.id);
    const phonePart = party.phone ? ` (${party.phone})` : '';
    const total = info ? info.totalBalance : 0;
    const open = info ? info.openingBalance : 0;
    let balTag = '';
    if (Math.abs(total) >= 0.005) {
      balTag = partyType === 'client'
        ? (total > 0 ? ` — عليه: ${fmtMoney(total)}` : ` — دائن: ${fmtMoney(Math.abs(total))}`)
        : (total > 0 ? ` — مستحق له: ${fmtMoney(total)}` : ` — رصيد لنا: ${fmtMoney(Math.abs(total))}`);
    } else {
      balTag = ' — خالص (0.00)';
    }
    const openTag = Math.abs(open) >= 0.005 ? ` [بداية التعامل: ${fmtMoney(open)}]` : '';
    return `${party.name}${phonePart}${balTag}${openTag}`;
  }

  function populateSortedDropdownsAndPickers162() {
    const clientsSorted = getAlphaSortedCopy162(window.appState?.clients || [], 'name', 'asc');
    const suppliersSorted = getAlphaSortedCopy162(window.appState?.suppliers || [], 'name', 'asc');
    const itemsSorted = getAlphaSortedCopy162(window.appState?.items || [], 'name', 'asc');
    const servicesSorted = getAlphaSortedCopy162(window.appState?.serviceCatalog || [], 'name', 'asc');

    const orderClientSelect = $('orderClientSelect');
    if (orderClientSelect) {
      const prev = orderClientSelect.value;
      const opts = clientsSorted.map(c => `<option value="${esc(c.id)}">${esc(c.name)}${c.phone ? ' (' + esc(c.phone) + ')' : ''}</option>`).join('');
      orderClientSelect.innerHTML = '<option value="">-- اختر العميل --</option><option value="__cash__">عميل نقدي (بدون حساب)</option>' + opts;
      if (prev && [...orderClientSelect.options].some(o => o.value === prev)) orderClientSelect.value = prev;
    }

    renderTreasuryPartySelectOptions162('client', $('transClientSearch162')?.value || '');

    const purSupSelect = $('purchaseSupplierSelect');
    if (purSupSelect) {
      const prev = purSupSelect.value;
      const opts = suppliersSorted.map(s => `<option value="${esc(s.id)}">${esc(s.name)}${s.phone ? ' (' + esc(s.phone) + ')' : ''}</option>`).join('');
      purSupSelect.innerHTML = opts ? '<option value="">-- اختر المورد --</option>' + opts : '<option value="">لا يوجد موردين (اضغط + مورد جديد)</option>';
      if (prev && [...purSupSelect.options].some(o => o.value === prev)) purSupSelect.value = prev;
    }

    renderTreasuryPartySelectOptions162('supplier', $('transSupplierSearch162')?.value || '');

    const itemOpts = itemsSorted.map(i => `<option value="${esc(i.id)}">${esc(i.name)} [رصيد: ${esc(i.qty)} ${esc(i.unit || '')}]</option>`).join('');
    const purItemSelect = $('purchaseItemSelect');
    if (purItemSelect) {
      const prev = purItemSelect.value;
      purItemSelect.innerHTML = itemOpts ? '<option value="">-- اختر الخامة --</option>' + itemOpts : '<option value="">لا توجد خامات بالمخزن</option>';
      if (prev && [...purItemSelect.options].some(o => o.value === prev)) purItemSelect.value = prev;
    }
    const deductItemSelect = $('orderDeductItemSelect');
    if (deductItemSelect) {
      const prev = deductItemSelect.value;
      deductItemSelect.innerHTML = '<option value="">-- بدون خصم من المخزن --</option>' + itemOpts;
      if (prev && [...deductItemSelect.options].some(o => o.value === prev)) deductItemSelect.value = prev;
    }

    const saleList = $('saleItemsList');
    if (saleList) {
      saleList.innerHTML = itemsSorted.map(i => `<option value="${esc(i.name)}" label="من المخزن - رصيد ${esc(i.qty)} ${esc(i.unit || '')}"></option>`).join('')
        + servicesSorted.map(s => `<option value="${esc(s.name)}" label="خدمة - ${esc(s.unit || 'خدمة')} - ${fmtMoney(s.price || 0)}"></option>`).join('');
    }
    document.querySelectorAll('#saleLines .sl-picker').forEach(sel => {
      const keep = sel.value;
      sel.replaceChildren();
      const first = document.createElement('option');
      first.value = '';
      first.textContent = '-- اختر الصنف / الخدمة --';
      sel.appendChild(first);
      if (itemsSorted.length) {
        const gStock = document.createElement('optgroup');
        gStock.label = 'الأصناف المخزنية (مرتبة أبجدياً)';
        itemsSorted.forEach(x => {
          const o = document.createElement('option');
          o.value = 'stock:' + String(x.id);
          o.textContent = String(x.name || '');
          gStock.appendChild(o);
        });
        sel.appendChild(gStock);
      }
      if (servicesSorted.length) {
        const gSvc = document.createElement('optgroup');
        gSvc.label = 'الخدمات (مرتبة أبجدياً)';
        servicesSorted.forEach(x => {
          const o = document.createElement('option');
          o.value = 'service:' + String(x.id);
          o.textContent = String(x.name || '');
          gSvc.appendChild(o);
        });
        sel.appendChild(gSvc);
      }
      const manual = document.createElement('option');
      manual.value = '__manual__';
      manual.textContent = 'كتابة بيان يدوي';
      sel.insertBefore(manual, sel.firstChild);
      if ([...sel.options].some(o => o.value === keep)) sel.value = keep;
    });
  }

  function renderTreasuryPartySelectOptions162(partyType, query = '') {
    const isClient = partyType === 'client';
    const sel = $(isClient ? 'transClientSelect' : 'transSupplierSelect');
    if (!sel) return;
    const prev = sel.value;
    const rawList = isClient ? (window.appState?.clients || []) : (window.appState?.suppliers || []);
    const sorted = getAlphaSortedCopy162(rawList, 'name', 'asc');
    const q = String(query || '').trim();
    const filtered = sorted.filter(p => {
      if (!q) return true;
      const hay = `${p.name || ''} ${p.phone || ''} ${p.address || ''} ${p.items || ''} ${p.id || ''}`;
      return typeof smartMatch === 'function' ? smartMatch(hay, q) : normalizeArabicSortText162(hay).includes(normalizeArabicSortText162(q));
    });

    if (prev && !filtered.some(p => String(p.id) === String(prev))) {
      const selectedParty = sorted.find(p => String(p.id) === String(prev));
      if (selectedParty) filtered.unshift(selectedParty);
    }

    const placeholder = isClient
      ? (rawList.length ? `-- اختر العميل (${filtered.length} من ${rawList.length}) --` : 'لا يوجد عملاء مسجلين')
      : (rawList.length ? `-- اختر المورد (${filtered.length} من ${rawList.length}) --` : 'لا يوجد موردين مسجلين');

    sel.innerHTML = `<option value="">${esc(placeholder)}</option>` + filtered.map(p => {
      const label = formatPartyOptionLabel162(partyType, p);
      return `<option value="${esc(p.id)}">${esc(label)}</option>`;
    }).join('');

    if (prev && [...sel.options].some(o => o.value === prev)) {
      sel.value = prev;
    } else if (q && filtered.length === 1) {
      sel.value = filtered[0].id;
    }

    const resultsBox = $(isClient ? 'transClientSearchResults162' : 'transSupplierSearchResults162');
    if (resultsBox) {
      if (!q) {
        resultsBox.classList.add('hidden');
        resultsBox.innerHTML = '';
      } else {
        resultsBox.classList.remove('hidden');
        if (!filtered.length) {
          resultsBox.innerHTML = `<div class="p-2.5 text-center text-slate-400 text-xs">لا يوجد ${isClient ? 'عميل' : 'مورد'} مطابق للبحث «${esc(q)}»</div>`;
        } else {
          resultsBox.innerHTML = filtered.slice(0, 12).map(p => {
            const info = getPartyFullBalanceBreakdown162(partyType, p.id);
            const total = info ? info.totalBalance : 0;
            const open = info ? info.openingBalance : 0;
            return `
              <button type="button" data-pick-party162="${esc(p.id)}" data-party-type162="${partyType}"
                class="w-full text-right px-3 py-2 border-b border-slate-100 dark:border-slate-700 hover:bg-teal-50 dark:hover:bg-slate-800 flex items-center justify-between gap-2 text-xs transition">
                <div>
                  <div class="font-black text-slate-800 dark:text-slate-100">${esc(p.name)} ${p.phone ? `<span class="font-mono text-[11px] text-slate-500">(${esc(p.phone)})</span>` : ''}</div>
                  ${Math.abs(open) >= 0.005 ? `<div class="text-[10px] text-amber-700 dark:text-amber-300 font-bold">رصيد بداية فترة التعامل: ${fmtMoney(open)} (المتبقي منه: ${fmtMoney(info.openingRemaining)})</div>` : ''}
                </div>
                <div class="text-left shrink-0">
                  <span class="px-2 py-0.5 rounded-lg font-mono font-black text-[11px] ${total > 0 ? 'bg-rose-100 text-rose-700' : total < 0 ? 'bg-sky-100 text-sky-700' : 'bg-emerald-100 text-emerald-700'}">
                    ${total > 0 ? (isClient ? `عليه ${fmtMoney(total)}` : `له ${fmtMoney(total)}`) : total < 0 ? `دائن ${fmtMoney(Math.abs(total))}` : 'خالص 0.00'}
                  </span>
                </div>
              </button>
            `;
          }).join('');
          resultsBox.querySelectorAll('button[data-pick-party162]').forEach(btn => {
            btn.onclick = () => {
              sel.value = btn.dataset.pickParty162;
              resultsBox.classList.add('hidden');
              sel.dispatchEvent(new Event('change', { bubbles: true }));
              updateTreasuryPartyBalanceAndAllocationUI162(true);
            };
          });
        }
      }
    }
  }

  function installTreasuryModalSearchAndOpeningBalanceUI162() {
    const cDiv = $('transClientDiv');
    const sDiv = $('transSupplierDiv');
    const cSel = $('transClientSelect');
    const sSel = $('transSupplierSelect');

    if (cSel && !cSel.dataset.bound162) {
      cSel.dataset.bound162 = '1';
      cSel.addEventListener('change', () => updateTreasuryPartyBalanceAndAllocationUI162(true));
    }
    if (sSel && !sSel.dataset.bound162) {
      sSel.dataset.bound162 = '1';
      sSel.addEventListener('change', () => updateTreasuryPartyBalanceAndAllocationUI162(true));
    }
  }

  function updateTreasuryPartyBalanceAndAllocationUI162(triggeredBySelect = false) {
    const type = $('transType')?.value;
    const isClient = type === 'collection';
    const isSupplier = type === 'supplier_payment';
    const partyId = isClient ? $('transClientSelect')?.value : (isSupplier ? $('transSupplierSelect')?.value : '');

    const invSel = $('transInvoice150');
    if (isClient && invSel && partyId) {
      const info = getPartyFullBalanceBreakdown162('client', partyId);
      if (info && Math.abs(info.openingBalance) >= 0.005 && ![...invSel.options].some(o => o.value === '__opening_balance__')) {
        const opt = document.createElement('option');
        opt.value = '__opening_balance__';
        opt.textContent = `رصيد بداية فترة التعامل (أول المدة) — متبقي: ${fmtMoney(info.openingRemaining)} (من أصل ${fmtMoney(info.openingBalance)})`;
        if (invSel.options.length > 0) invSel.insertBefore(opt, invSel.options[1] || null);
        else invSel.appendChild(opt);
      }
      if (!invSel.dataset.bound162) {
        invSel.dataset.bound162 = '1';
        invSel.addEventListener('change', () => {
          if (invSel.value === '__opening_balance__') {
            const bInfo = getPartyFullBalanceBreakdown162('client', $('transClientSelect')?.value);
            if (bInfo && bInfo.openingRemaining > 0) {
              const amtEl = $('transAmount');
              const notesEl = $('transNotes');
              if (amtEl) amtEl.value = bInfo.openingRemaining;
              if (notesEl && !notesEl.value.trim()) notesEl.value = 'سداد من رصيد بداية فترة التعامل (أول المدة)';
            }
          }
        });
      }
    }

    let badge = $('transPartyDueBadge31');
    const amountInput = $('transAmount');
    if (!badge && amountInput?.parentElement) {
      badge = document.createElement('div');
      badge.id = 'transPartyDueBadge31';
      amountInput.parentElement.insertBefore(badge, amountInput);
    }
    if (!badge) return;

    if (!partyId || (!isClient && !isSupplier)) {
      badge.className = 'hidden';
      badge.innerHTML = '';
      return;
    }

    const info = getPartyFullBalanceBreakdown162(isClient ? 'client' : 'supplier', partyId);
    if (!info) {
      badge.className = 'hidden';
      badge.innerHTML = '';
      return;
    }

    const { party, openingBalance, openingRemaining, invoicesRemaining, totalBalance } = info;
    const isEditing = !!(window.EDIT && window.EDIT.trans);

    if (triggeredBySelect && !isEditing && amountInput) {
      const invId = isClient ? $('transInvoice150')?.value : '';
      if (!invId) {
        amountInput.value = totalBalance > 0 ? totalBalance : '';
      }
    }

    badge.className = `mb-2.5 p-3 rounded-xl border text-xs space-y-2 ${totalBalance > 0 ? (isClient ? 'bg-amber-50/90 border-amber-300 text-amber-950 dark:bg-amber-950/30 dark:border-amber-700 dark:text-amber-200' : 'bg-indigo-50/90 border-indigo-300 text-indigo-950 dark:bg-indigo-950/30 dark:border-indigo-700 dark:text-indigo-200') : 'bg-emerald-50/90 border-emerald-300 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-700 dark:text-emerald-200'}`;
    badge.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-black/10 dark:border-white/10 pb-1.5">
        <span class="font-black flex items-center gap-1.5">
          <i class="fa-solid ${totalBalance > 0 ? 'fa-coins text-amber-600' : 'fa-circle-check text-emerald-600'}"></i>
          <span>ملخص مديونية ${isClient ? 'العميل' : 'المورد'}: ${esc(party.name)}</span>
        </span>
        <strong class="font-mono text-sm font-black ${totalBalance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-300'}">
          ${totalBalance > 0 ? `إجمالي المستحق: ${fmtMoney(totalBalance)}` : totalBalance < 0 ? `رصيد دائن: ${fmtMoney(Math.abs(totalBalance))}` : 'خالص (0.00)'}
        </strong>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
        <div class="p-2 rounded-lg bg-white/80 dark:bg-slate-900/70 border border-black/5">
          <span class="text-slate-500 block">رصيد بداية فترة التعامل (أول مرة):</span>
          <strong class="font-mono font-black text-slate-800 dark:text-slate-100">${fmtMoney(openingBalance)}</strong>
          ${openingBalance > 0 ? `<span class="block text-[10px] text-amber-700 dark:text-amber-300 font-bold">المتبقي منه: ${fmtMoney(openingRemaining)}</span>` : ''}
        </div>
        <div class="p-2 rounded-lg bg-white/80 dark:bg-slate-900/70 border border-black/5">
          <span class="text-slate-500 block">${isClient ? 'متبقي الفواتير المسجلة:' : 'متبقي فواتير التوريد:'}</span>
          <strong class="font-mono font-black text-slate-800 dark:text-slate-100">${fmtMoney(invoicesRemaining)}</strong>
        </div>
        <div class="p-2 rounded-lg bg-white/80 dark:bg-slate-900/70 border border-black/5">
          <span class="text-slate-500 block">إجمالي المبلغ على ${isClient ? 'العميل' : 'المورد'}:</span>
          <strong class="font-mono font-black ${totalBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}">${fmtMoney(totalBalance)}</strong>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-1.5 pt-0.5">
        ${totalBalance > 0 ? `
          <button type="button" onclick="window.fillTreasuryDueAmount162(${totalBalance}, 'full')" class="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] transition">
            تعبئة إجمالي المستحق (${fmtMoney(totalBalance)})
          </button>
        ` : ''}
        ${openingRemaining > 0 ? `
          <button type="button" onclick="window.fillTreasuryDueAmount162(${openingRemaining}, 'opening')" class="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] transition">
            سداد رصيد بداية التعامل (${fmtMoney(openingRemaining)})
          </button>
        ` : ''}
      </div>
    `;
  }

  window.fillTreasuryDueAmount162 = function(amount, kind) {
    const amtEl = $('transAmount');
    const notesEl = $('transNotes');
    if (amtEl) {
      amtEl.value = r2(amount);
      amtEl.focus();
    }
    if (kind === 'opening') {
      const invSel = $('transInvoice150');
      if (invSel && [...invSel.options].some(o => o.value === '__opening_balance__')) {
        invSel.value = '__opening_balance__';
      }
      if (notesEl && !notesEl.value.trim()) {
        notesEl.value = 'سداد من رصيد بداية فترة التعامل (أول المدة)';
      }
    }
  };

  // ============================================================================
  // 6. سادساً: خاصية فتح الأصل المرتبط بالفاتورة أو التقرير أو المستند عند الضغط عليه
  //    في البرنامج ككل وبالأخص في كشف الحساب (فتح الفاتورة الأصلية المسجلة بدلاً من معاينة الطباعة)
  // ============================================================================
  function closeOverlayModalsBeforeJump162(keepStatement = false) {
    const ids = [
      'statementOriginalModal',
      'statementDocumentPreview',
      'recordDetailModal',
      'reviewCenter',
      'operationsModal149',
      'modalPrintInvoice'
    ];
    if (!keepStatement) ids.push('modalStatement');
    ids.forEach(id => {
      const el = $(id);
      if (!el) return;
      if (id === 'modalStatement' || id === 'modalPrintInvoice') {
        if (typeof closeModal === 'function') closeModal(id);
        else el.classList.add('hidden');
      } else {
        el.remove();
      }
    });
  }

  function highlightAndScrollTableRow162(tbodyId, recordId, fallbackNeedle = '') {
    const locate = () => {
      const body = $(tbodyId);
      if (!body) return false;
      const rows = [...body.querySelectorAll('tr')];
      let row = rows.find(tr => String(tr.dataset.recordId || '') === String(recordId));
      if (!row && fallbackNeedle) {
        row = rows.find(tr => tr.innerText.includes(String(fallbackNeedle)));
      }
      if (row) {
        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        row.classList.add('row-flash');
        setTimeout(() => row.classList.remove('row-flash'), 3500);
        return true;
      }
      return false;
    };
    if (!locate()) {
      setTimeout(locate, 90);
      setTimeout(locate, 220);
    }
  }

  function resetSectionFiltersAndPageForRecord162(tab, tbodyId, recordId, renderFn, searchInputIds = []) {
    if (typeof switchTab === 'function') switchTab(tab);
    if (tab === 'orders') {
      if (typeof setSalesRange === 'function') setSalesRange('all');
    }
    searchInputIds.forEach(id => {
      const inp = $(id);
      if (inp) inp.value = '';
    });
    try {
      const s = getSS();
      s.tableViews ||= {};
      s.tableViews[tbodyId] = { rules: [], sort: '', dir: 'asc' };
    } catch {}
    const st = typeof PAGE_STATE!=='undefined'?PAGE_STATE[tbodyId]:window.PAGE_STATE?.[tbodyId];
    if (st) st.page = 0;
    renderFn?.();
    if (st && recordId) {
      const ix = (st.all || []).findIndex(x => String(x?.id) === String(recordId));
      if (ix >= 0 && st.pageSize > 0) {
        st.page = Math.floor(ix / st.pageSize);
        st.render?.();
      }
    }
  }

  window.openOriginalDocument162 = function(kind, id, options = {}) {
    if (window.appState?.isLocked) return typeof permDeny === 'function' ? permDeny() : false;
    const k = String(kind || '').toLowerCase();
    const rawId = String(id ?? '').trim();
    const state = (typeof appState!=='undefined'?appState:window.appState) || {};

    // 1. Sales Invoice / Order (الفاتورة الأصلية التي سُجلت على العميل)
    if (k === 'order' || k === 'sale' || k === 'invoice' || k === 'orders') {
      const cleanNo = rawId.replace(/^#/, '');
      const o = (state.orders || []).find(x => String(x.id) === rawId)
        || (state.orders || []).find(x => String(x.orderNo || x.no) === cleanNo);
      if (!o) {
        const q = (state.quotes || []).find(x => String(x.id) === rawId || String(x.no) === cleanNo.replace(/^Q/i, ''));
        if (q) return window.openOriginalDocument162('quote', q.id, options);
        if (typeof showToast === 'function') showToast('لم يتم العثور على الفاتورة الأصلية المطلوبة.', 'warning');
        return false;
      }
      closeOverlayModalsBeforeJump162(options.keepStatement);
      resetSectionFiltersAndPageForRecord162('orders', 'ordersTableBody', o.id, window.renderOrdersTable, ['searchOrdersInput', 'filterOrderStatus']);
      if (typeof window.editSale === 'function' && (typeof can !== 'function' || can('inv_edit'))) {
        window.editSale(o.id);
      } else if (typeof window.openRecordDetails === 'function') {
        window.openRecordDetails('order', o.id);
      }
      highlightAndScrollTableRow162('ordersTableBody', o.id, o.orderNo);
      if (typeof showToast === 'function') {
        showToast(`تم فتح الفاتورة الأصلية المسجلة #${o.orderNo} للعميل (${o.clientName || 'نقدي'}).`, 'info');
      }
      return true;
    }

    // 2. Quote / Draft (عرض سعر أو مسودة أصلية)
    if (k === 'quote' || k === 'quotes') {
      const cleanNo = rawId.replace(/^#?Q?/i, '');
      const q = (state.quotes || []).find(x => String(x.id) === rawId || String(x.no) === cleanNo);
      if (!q) return false;
      closeOverlayModalsBeforeJump162(options.keepStatement);
      resetSectionFiltersAndPageForRecord162('quotes', 'quotesTableBody', q.id, window.renderQuotes, ['searchQuotes', 'filterQuoteStatus']);
      if (typeof window.editQuote === 'function' && q.status !== 'تم التحويل') {
        window.editQuote(q.id);
      }
      highlightAndScrollTableRow162('quotesTableBody', q.id, q.no);
      return true;
    }

    // 3. Purchase Invoice (فاتورة وارد خامات أصلية)
    if (k === 'pur' || k === 'purchase' || k === 'purchases') {
      const cleanId = rawId.replace(/^#/, '');
      const p = (state.purchases || []).find(x => String(x.id) === rawId || String(x.id) === cleanId);
      if (!p) {
        if (typeof showToast === 'function') showToast('لم يتم العثور على فاتورة الوارد الأصلية.', 'warning');
        return false;
      }
      closeOverlayModalsBeforeJump162(options.keepStatement);
      resetSectionFiltersAndPageForRecord162('purchases', 'purchasesTableBody', p.id, window.renderPurchasesTable, ['searchPurchasesInput', 'purchaseSearch152']);
      if (typeof window.openEditPurchase === 'function' && (typeof can !== 'function' || can('pur_edit'))) {
        window.openEditPurchase(p.id);
      }
      highlightAndScrollTableRow162('purchasesTableBody', p.id, p.id);
      if (typeof showToast === 'function') {
        showToast(`تم فتح فاتورة الوارد الأصلية #${p.id} للمورد (${p.supplierName || ''}).`, 'info');
      }
      return true;
    }

    // 4. Treasury Movement (سند / حركة خزينة أو المستند الأصلي المرتبط بها)
    if (k === 'tre' || k === 'treasury' || k === 'transaction') {
      const t = (state.treasury || []).find(x => String(x.id) === rawId);
      if (!t) return false;
      if (options.followLinkedSource) {
        const d = String(t.desc || '');
        const num = (d.match(/#\s*([\w-]+)/) || [])[1];
        if (t.orderId || /فاتورة #|أمر شغل #/.test(d)) {
          const o = (state.orders || []).find(x => String(x.id) === String(t.orderId))
            || (state.orders || []).find(x => String(x.orderNo || x.no) === String(num));
          if (o) return window.openOriginalDocument162('order', o.id, options);
        }
        if (t.purchaseId) {
          const p = (state.purchases || []).find(x => String(x.id) === String(t.purchaseId));
          if (p) return window.openOriginalDocument162('pur', p.id, options);
        }
        if (t.serviceId) {
          const s = (state.services || []).find(x => String(x.id) === String(t.serviceId));
          if (s) return window.openOriginalDocument162('service', s.id, options);
        }
      }
      closeOverlayModalsBeforeJump162(options.keepStatement);
      resetSectionFiltersAndPageForRecord162('treasury', 'treasuryTableBody', t.id, window.renderTreasuryTable, ['treasurySearch152']);
      if (typeof window.isTransEditable === 'function' && window.isTransEditable(t) && typeof window.openEditTransaction === 'function' && (typeof can !== 'function' || can('tre_edit'))) {
        window.openEditTransaction(t.id);
      }
      highlightAndScrollTableRow162('treasuryTableBody', t.id, t.desc);
      if (typeof showToast === 'function') {
        showToast('تم فتح حركة الخزينة الأصلية وتحديدها في جدول الخزينة.', 'info');
      }
      return true;
    }

    // 5. Service Record (عملية خدمة أصلية)
    if (k === 'service' || k === 'services') {
      const cleanId = rawId.replace(/^#/, '');
      const s = (state.services || []).find(x => String(x.id) === rawId || String(x.id) === cleanId);
      if (!s) {
        // Check serviceCatalog
        const sc = (state.serviceCatalog || []).find(x => String(x.id) === rawId);
        if (sc && typeof window.openServiceCatalogModal144 === 'function') {
          closeOverlayModalsBeforeJump162(options.keepStatement);
          if (typeof switchTab === 'function') switchTab('services');
          window.openServiceCatalogModal144(sc.id);
          return true;
        }
        return false;
      }
      closeOverlayModalsBeforeJump162(options.keepStatement);
      if (typeof window.showServiceSection === 'function') window.showServiceSection('movements');
      $('serviceMovementsPane')?.classList.remove('hidden');
      resetSectionFiltersAndPageForRecord162('services', 'servicesTableBody', s.id, window.renderServicesTable, ['searchServicesInput']);
      if (typeof window.openEditService === 'function' && (typeof can !== 'function' || can('svc_edit'))) {
        window.openEditService(s.id);
      }
      highlightAndScrollTableRow162('servicesTableBody', s.id, s.id);
      return true;
    }

    // 6. Account Adjustment (قيد تسوية حساب)
    if (k === 'adj' || k === 'adjustment') {
      const a = (state.adjustments || []).find(x => String(x.id) === rawId);
      if (!a) return false;
      if ($('modalStatement')?.classList.contains('hidden') && typeof window.viewStatement === 'function') {
        window.viewStatement(a.party || 'client', a.partyId);
      }
      if (typeof window.stmtEditAdj === 'function') {
        window.stmtEditAdj(a.id);
        const inp = $('stmtAdjAmt') || $('stmtAdjDesc');
        inp?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        inp?.focus();
      }
      return true;
    }

    // 7. Opening Balance Row in Statement (رصيد افتتاحي / بداية فترة التعامل)
    if (k === 'init' || k === 'opening') {
      const pType = options.partyType || window.STMT?.type || 'client';
      const pId = rawId || window.STMT?.id;
      closeOverlayModalsBeforeJump162(false);
      if (pType === 'client' && typeof window.openEditClient === 'function') {
        resetSectionFiltersAndPageForRecord162('clients', 'clientsTableBody', pId, window.renderClientsTable, ['searchClientInput']);
        window.openEditClient(pId);
        setTimeout(() => $('clientInitialBalance')?.focus(), 120);
        return true;
      }
      if (pType === 'supplier' && typeof window.openEditSupplier === 'function') {
        resetSectionFiltersAndPageForRecord162('suppliers', 'suppliersTableBody', pId, window.renderSuppliersTable, ['searchSupplierInput']);
        window.openEditSupplier(pId);
        setTimeout(() => $('supplierInitialBalance')?.focus(), 120);
        return true;
      }
    }

    // 8. Inventory Item (صنف مخزني)
    if (k === 'item' || k === 'items' || k === 'inventory') {
      const it = (state.items || []).find(x => String(x.id) === rawId || String(x.code) === rawId);
      if (!it) return false;
      closeOverlayModalsBeforeJump162(options.keepStatement);
      resetSectionFiltersAndPageForRecord162('stocktake', 'inventoryTableBody', it.id, window.renderInventoryTable, ['searchInventoryInput']);
      if (typeof window.openEditItem === 'function' && (typeof can !== 'function' || can('stock_edit'))) {
        window.openEditItem(it.id);
      }
      highlightAndScrollTableRow162('inventoryTableBody', it.id, it.name);
      return true;
    }

    // 9. Client / Supplier profile
    if (k === 'client' || k === 'clients') {
      const c = (state.clients || []).find(x => String(x.id) === rawId);
      if (!c) return false;
      closeOverlayModalsBeforeJump162(options.keepStatement);
      resetSectionFiltersAndPageForRecord162('clients', 'clientsTableBody', c.id, window.renderClientsTable, ['searchClientInput']);
      if (options.openStatement && typeof window.viewStatement === 'function') window.viewStatement('client', c.id);
      else if (typeof window.openEditClient === 'function') window.openEditClient(c.id);
      highlightAndScrollTableRow162('clientsTableBody', c.id, c.name);
      return true;
    }
    if (k === 'supplier' || k === 'suppliers') {
      const s = (state.suppliers || []).find(x => String(x.id) === rawId);
      if (!s) return false;
      closeOverlayModalsBeforeJump162(options.keepStatement);
      resetSectionFiltersAndPageForRecord162('suppliers', 'suppliersTableBody', s.id, window.renderSuppliersTable, ['searchSupplierInput']);
      if (options.openStatement && typeof window.viewStatement === 'function') window.viewStatement('supplier', s.id);
      else if (typeof window.openEditSupplier === 'function') window.openEditSupplier(s.id);
      highlightAndScrollTableRow162('suppliersTableBody', s.id, s.name);
      return true;
    }

    // 10. Operations Job
    if (k === 'job' || k === 'operation') {
      return window.openOriginalDocument162('order', rawId, options);
    }

    return false;
  };

  function installStatementAndAppWideOriginalOpener162() {
    window.stmtOpenSrc = function(kind, id) {
      return window.openOriginalDocument162(kind, id);
    };

    window.statementOpenEntry = function(seq) {
      if (typeof window.stmtBuild === 'function') {
        const d = window.stmtBuild();
        const r = d?.rows?.find(x => x.seq === Number(seq));
        if (r) {
          if (r.kind === 'init') {
            return window.openOriginalDocument162('init', window.STMT?.id, { partyType: window.STMT?.type });
          }
          const targetKind = r.kind === 'pay' ? (r.sourceKind || 'order') : r.kind;
          return window.openOriginalDocument162(targetKind, r.id || r.src);
        }
      }
      if (typeof window.stmtCompute === 'function') {
        const c = window.stmtCompute();
        const r = c?.rows?.find(x => x.seq === Number(seq));
        if (r) {
          const targetKind = r.kind === 'pay' ? (r.sourceKind || 'order') : r.kind;
          return window.openOriginalDocument162(targetKind, r.src || r.id);
        }
      }
      return false;
    };

    const origRenderStatement = window.renderStatement;
    if (typeof origRenderStatement === 'function' && !origRenderStatement._origDoc162) {
      const wrappedRenderStatement = function(...args) {
        const res = origRenderStatement.apply(this, args);
        try {
          const d = typeof window.stmtBuild === 'function' ? window.stmtBuild() : null;
          const rowsBySeq = new Map((d?.rows || []).map(r => [Number(r.seq), r]));
          document.querySelectorAll('#stmtBody tr[data-seq]').forEach(tr => {
            const seq = Number(tr.dataset.seq);
            const r = rowsBySeq.get(seq);
            if (!r) return;
            const targetKind = r.kind === 'pay' ? (r.sourceKind || 'order') : r.kind;
            const targetId = r.id || r.src || '';

            const openBtn = tr.querySelector('button[onclick*="statementOpenEntry"]');
            if (openBtn) {
              openBtn.title = targetKind === 'order'
                ? 'فتح الفاتورة الأصلية المسجلة على العميل'
                : 'فتح المستند الأصلي المسجل';
              if (targetKind === 'order' && targetId && !tr.querySelector('.stmt-print-preview-btn162')) {
                const pBtn = document.createElement('button');
                pBtn.type = 'button';
                pBtn.className = 'stmt-print-preview-btn162 act-icon-btn act-btn-teal mr-1';
                pBtn.title = 'معاينة طباعة الفاتورة';
                pBtn.setAttribute('aria-label', 'معاينة طباعة الفاتورة');
                pBtn.dataset.actTip = 'معاينة طباعة';
                pBtn.innerHTML = '<i class="fa-solid fa-print"></i>';
                pBtn.onclick = e => {
                  e.stopPropagation();
                  if (typeof window.previewInvoice === 'function') window.previewInvoice(targetId);
                };
                openBtn.after(pBtn);
              }
            }

            const refCell = tr.cells?.[1];
            if (refCell && !refCell.dataset.linked162) {
              refCell.dataset.linked162 = '1';
              refCell.classList.add('cursor-pointer', 'hover:underline');
              refCell.title = 'اضغط لفتح المستند الأصلي المسجل';
              refCell.addEventListener('click', e => {
                if (e.target.closest('button')) return;
                e.stopPropagation();
                window.statementOpenEntry(seq);
              });
            }
          });
        } catch {}
        return res;
      };
      wrappedRenderStatement._origDoc162 = true;
      window.renderStatement = wrappedRenderStatement;
    }

    const prevOpenTreasurySource = window.openTreasurySource;
    window.openTreasurySource = function(id) {
      const state = (typeof appState!=='undefined'?appState:window.appState) || {};
      const t = (state.treasury || []).find(x => String(x.id) === String(id));
      if (!t) return prevOpenTreasurySource?.call(this, id);
      const d = String(t.desc || '');
      const num = (d.match(/#\s*([\w-]+)/) || [])[1];

      if (t.orderId || /فاتورة #|أمر شغل #/.test(d)) {
        const o = (state.orders || []).find(x => String(x.id) === String(t.orderId))
          || (state.orders || []).find(x => String(x.orderNo || x.no) === String(num));
        if (o) return window.openOriginalDocument162('order', o.id);
      }
      if (t.purchaseId || /لوارد \[/.test(d)) {
        const p = (state.purchases || []).find(x => String(x.id) === String(t.purchaseId))
          || (num && (state.purchases || []).find(x => String(x.id) === String(num)));
        if (p) return window.openOriginalDocument162('pur', p.id);
      }
      if (t.serviceId || /خدمة #/.test(d)) {
        const s = (state.services || []).find(x => String(x.id) === String(t.serviceId))
          || (num && (state.services || []).find(x => String(x.id) === String(num)));
        if (s) return window.openOriginalDocument162('service', s.id);
      }
      if (t.clientId) return window.viewStatement?.('client', t.clientId);
      if (t.supplierId) return window.viewStatement?.('supplier', t.supplierId);
      return window.openOriginalDocument162('tre', t.id);
    };

    const origOpenRecordDetails = window.openRecordDetails;
    if (typeof origOpenRecordDetails === 'function' && !origOpenRecordDetails._origDoc162) {
      const wrappedDetails = function(type, id, ...rest) {
        const res = origOpenRecordDetails.call(this, type, id, ...rest);
        const modal = $('recordDetailModal');
        if (modal && !modal.querySelector('#btnOpenOriginalFromDetails162')) {
          const footer = modal.querySelector('.flex.flex-wrap.gap-2.justify-end');
          if (footer) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.id = 'btnOpenOriginalFromDetails162';
            btn.className = 'px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm flex items-center gap-1.5 shadow-sm';
            btn.innerHTML = '<i class="fa-solid fa-up-right-from-square"></i><span>فتح المستند الأصلي</span>';
            btn.onclick = () => {
              modal.remove();
              window.openOriginalDocument162(type, id);
            };
            footer.prepend(btn);
          }
        }
        return res;
      };
      wrappedDetails._origDoc162 = true;
      window.openRecordDetails = wrappedDetails;
    }

    // Hook Global Search openResult in Alhamd152 so clicking a search result opens the original document
    if (window.Alhamd152 && typeof window.Alhamd152.openResult === 'function' && !window.Alhamd152.openResult._origDoc162) {
      const origOpenResult = window.Alhamd152.openResult;
      const wrappedOpenResult = function(r) {
        if (!r || window.appState?.isLocked) return;
        $('globalSearchResults152')?.classList.add('hidden');
        $('globalSearch152')?.blur();
        if (r.key && r.id) {
          const opened = window.openOriginalDocument162(r.key, r.id);
          if (opened) return;
        }
        return origOpenResult.call(this, r);
      };
      wrappedOpenResult._origDoc162 = true;
      window.Alhamd152.openResult = wrappedOpenResult;
    }

    // Also add "فتح الفاتورة الأصلية" inside #modalPrintInvoice header so if user is viewing a print preview, they can jump to the original registered invoice in 1 click
    const origPreviewInv = window.previewInvoice;
    if (typeof origPreviewInv === 'function' && !origPreviewInv._openOrig162) {
      const wrappedPrev = function(id, ...rest) {
        const r = origPreviewInv.call(this, id, ...rest);
        const bar = $('invQuickExportBar160') || $('modalPrintInvoice')?.querySelector('.no-print .flex');
        if (bar && !$('btnJumpToOriginalInvoice162')) {
          const b = document.createElement('button');
          b.type = 'button';
          b.id = 'btnJumpToOriginalInvoice162';
          b.className = 'bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition';
          b.title = 'فتح الفاتورة الأصلية المسجلة على العميل للتعديل والمراجعة';
          b.innerHTML = '<i class="fa-solid fa-pen-to-square"></i><span>فتح الفاتورة الأصلية</span>';
          b.onclick = () => {
            const ordId = window.currentPreviewOrderId160?.() || id;
            window.openOriginalDocument162('order', ordId);
          };
          bar.prepend(b);
        }
        return r;
      };
      wrappedPrev._openOrig162 = true;
      window.previewInvoice = wrappedPrev;
    }

    // Enhance #statementDocumentPreview so clicking any row with #orderNo or #PUR opens the original document
    document.addEventListener('click', e => {
      const preview = e.target.closest('#statementDocumentPreview');
      if (!preview || e.target.closest('button')) return;
      const tr = e.target.closest('tbody tr');
      if (!tr) return;
      const text = tr.innerText || '';
      const orderMatch = text.match(/#\s*(\d+)/);
      if (orderMatch) {
        const o = (window.appState?.orders || []).find(x => String(x.orderNo) === orderMatch[1]);
        if (o) {
          window.openOriginalDocument162('order', o.id);
          return;
        }
      }
      const purMatch = text.match(/#(PUR-\d+)/i);
      if (purMatch) {
        window.openOriginalDocument162('pur', purMatch[1]);
      }
    });
  }

  // ============================================================================
  // Hooks for Settings, Low Stock, Toast Duration, Calculator & Dropdowns
  // ============================================================================
  function installLifecycleHooks162() {
    if (typeof window.applyUi === 'function' && !window.applyUi._hook162) {
      const origApplyUi = window.applyUi;
      const wrapped = function(...args) {
        const r = origApplyUi.apply(this, args);
        syncAllSettingsStyles162();
        return r;
      };
      wrapped._hook162 = true;
      window.applyUi = wrapped;
    }

    if (typeof window.settingsSetModeColor === 'function' && !window.settingsSetModeColor._hook162) {
      const origSetMC = window.settingsSetModeColor;
      const wrapped = function(key, value, ...rest) {
        const u = getUI();
        if (key === 'thBg') u.thBg = value;
        if (key === 'thText') u.thText = value;
        if (key === 'canvas') u.presetCanvas = value;
        if (key === 'panel') u.presetPanel = value;
        const r = origSetMC.call(this, key, value, ...rest);
        syncAllSettingsStyles162();
        return r;
      };
      wrapped._hook162 = true;
      window.settingsSetModeColor = wrapped;
    }

    if (typeof window.surface147Set === 'function' && !window.surface147Set._hook162) {
      const origSurf = window.surface147Set;
      const wrapped = function(...args) {
        const r = origSurf.apply(this, args);
        syncAllSettingsStyles162();
        return r;
      };
      wrapped._hook162 = true;
      window.surface147Set = wrapped;
    }

    if (typeof window.renderClrPanel === 'function' && !window.renderClrPanel._hook162) {
      const origRenderClr = window.renderClrPanel;
      const wrapped = function(...args) {
        const r = origRenderClr.apply(this, args);
        try {
          const box = $('uiClrBox');
          if (box) {
            box.querySelectorAll('.cp-row').forEach(row => {
              const tag = row.querySelector('.cp-tag.set');
              const pick = row.querySelector('input.cp-pick');
              if (tag && pick && !row.querySelector('.cp-auto-btn162')) {
                const m = (pick.getAttribute('oninput') || '').match(/clrSet\('([^']+)'/);
                if (m) {
                  const key = m[1];
                  const btn = document.createElement('button');
                  btn.type = 'button';
                  btn.className = 'cp-auto-btn162 px-1.5 py-0.5 text-[10px] rounded border border-slate-300 hover:bg-rose-50 hover:text-rose-600 font-bold';
                  btn.textContent = 'تلقائي';
                  btn.title = 'إرجاع هذا العنصر للون التلقائي';
                  btn.onclick = () => { if (typeof clrSet === 'function') clrSet(key, '', true); syncAllSettingsStyles162(); };
                  tag.after(btn);
                }
              }
            });
          }
        } catch {}
        syncAllSettingsStyles162();
        return r;
      };
      wrapped._hook162 = true;
      window.renderClrPanel = wrapped;
    }

    if (typeof window.renderDatePanel === 'function' && !window.renderDatePanel._hook162) {
      const origDate = window.renderDatePanel;
      const wrapped = function(...args) {
        const r = origDate.apply(this, args);
        injectLiveTreasuryAndSortingSettingsCard162();
        return r;
      };
      wrapped._hook162 = true;
      window.renderDatePanel = wrapped;
    }

    if (typeof window.commitCalc === 'function' && !window.commitCalc._hook162) {
      const origCommitCalc = window.commitCalc;
      const wrapped = function(el, ...rest) {
        if (getSS().calcOff) {
          if (typeof hideChip === 'function') hideChip();
          return false;
        }
        return origCommitCalc.call(this, el, ...rest);
      };
      wrapped._hook162 = true;
      window.commitCalc = wrapped;
    }

    if (typeof window.calcChip === 'function' && !window.calcChip._hook162) {
      const origCalcChip = window.calcChip;
      const wrapped = function(el, ...rest) {
        if (getSS().calcOff) {
          if (typeof hideChip === 'function') hideChip();
          return;
        }
        return origCalcChip.call(this, el, ...rest);
      };
      wrapped._hook162 = true;
      window.calcChip = wrapped;
    }

    if (typeof window.populateDropdowns === 'function' && !window.populateDropdowns._hook162) {
      const origPop = window.populateDropdowns;
      const wrapped = function(...args) {
        const r = origPop.apply(this, args);
        populateSortedDropdownsAndPickers162();
        return r;
      };
      wrapped._hook162 = true;
      window.populateDropdowns = wrapped;
    }

    if (typeof window.refreshInvoiceItemPickers === 'function' && !window.refreshInvoiceItemPickers._hook162) {
      const origPickers = window.refreshInvoiceItemPickers;
      const wrapped = function(...args) {
        const r = origPickers.apply(this, args);
        populateSortedDropdownsAndPickers162();
        return r;
      };
      wrapped._hook162 = true;
      window.refreshInvoiceItemPickers = wrapped;
    }

    if (typeof window.fillServiceParties === 'function' && !window.fillServiceParties._hook162) {
      const origFillSvc = window.fillServiceParties;
      const wrapped = function(...args) {
        if (getSS().alphaSortDefault162 !== false) {
          window.appState?.clients?.sort((a, b) => compareArabicAlpha162(a?.name, b?.name, 'asc'));
          window.appState?.suppliers?.sort((a, b) => compareArabicAlpha162(a?.name, b?.name, 'asc'));
        }
        return origFillSvc.apply(this, args);
      };
      wrapped._hook162 = true;
      window.fillServiceParties = wrapped;
    }

    // Hook handleSaveTransaction to record opening-balance allocation metadata & refresh Live Treasury
    if (typeof window.handleSaveTransaction === 'function' && !window.handleSaveTransaction._hook162) {
      const origSaveTrans = window.handleSaveTransaction;
      const wrapped = function(e, ...rest) {
        const allocChoice = $('transInvoice150')?.value;
        const notesEl = $('transNotes');
        if (allocChoice === '__opening_balance__' && notesEl && !notesEl.value.trim()) {
          notesEl.value = 'سداد من رصيد بداية فترة التعامل (أول المدة)';
        }
        const entry = origSaveTrans.call(this, e, ...rest);
        if (entry && allocChoice === '__opening_balance__') {
          entry.allocTarget162 = 'opening_balance';
          if (typeof saveState === 'function') saveState(false);
        }
        renderSidebarLiveTreasuryWidget162();
        renderTreasuryDailyClosingBanner162();
        return entry;
      };
      wrapped._hook162 = true;
      window.handleSaveTransaction = wrapped;
    }

    const origUpdateDue = window.updatePartyDueAmountField;
    window.updatePartyDueAmountField = function(triggeredBySelect = false) {
      if (typeof origUpdateDue === 'function') {
        try { origUpdateDue(triggeredBySelect); } catch {}
      }
      installTreasuryModalSearchAndOpeningBalanceUI162();
      updateTreasuryPartyBalanceAndAllocationUI162(triggeredBySelect);
    };

    if (typeof window.toggleTransactionParty === 'function' && !window.toggleTransactionParty._hook162) {
      const origToggleParty = window.toggleTransactionParty;
      const wrapped = function(...args) {
        const r = origToggleParty.apply(this, args);
        installTreasuryModalSearchAndOpeningBalanceUI162();
        renderTreasuryPartySelectOptions162('client', $('transClientSearch162')?.value || '');
        renderTreasuryPartySelectOptions162('supplier', $('transSupplierSearch162')?.value || '');
        updateTreasuryPartyBalanceAndAllocationUI162(true);
        return r;
      };
      wrapped._hook162 = true;
      window.toggleTransactionParty = wrapped;
    }

    if (typeof window.renderDashboard === 'function' && !window.renderDashboard._hook162) {
      const origDash = window.renderDashboard;
      const wrapped = function(...args) {
        const r = origDash.apply(this, args);
        renderSidebarLiveTreasuryWidget162();
        return r;
      };
      wrapped._hook162 = true;
      window.renderDashboard = wrapped;
    }

    if (typeof window.renderTreasuryTable === 'function' && !window.renderTreasuryTable._hook162) {
      const origTre = window.renderTreasuryTable;
      const wrapped = function(...args) {
        const r = origTre.apply(this, args);
        renderSidebarLiveTreasuryWidget162();
        renderTreasuryDailyClosingBanner162();
        return r;
      };
      wrapped._hook162 = true;
      window.renderTreasuryTable = wrapped;
    }

    if (typeof window.updateAllUI === 'function' && !window.updateAllUI._hook162) {
      const origUpdateAll = window.updateAllUI;
      const wrapped = function(...args) {
        if (getSS().alphaSortDefault162 !== false) {
          window.appState?.clients?.sort((a, b) => compareArabicAlpha162(a?.name, b?.name, 'asc'));
          window.appState?.suppliers?.sort((a, b) => compareArabicAlpha162(a?.name, b?.name, 'asc'));
          window.appState?.items?.sort((a, b) => compareArabicAlpha162(a?.name, b?.name, 'asc'));
          window.appState?.serviceCatalog?.sort((a, b) => compareArabicAlpha162(a?.name, b?.name, 'asc'));
        }
        const r = origUpdateAll.apply(this, args);
        populateSortedDropdownsAndPickers162();
        renderSidebarLiveTreasuryWidget162();
        renderTreasuryDailyClosingBanner162();
        decorateAlphaSortButtonsInToolbars162();
        syncAllSettingsStyles162();
        restoreSavedSizesAndOrders162();
        return r;
      };
      wrapped._hook162 = true;
      window.updateAllUI = wrapped;
    }
  }

  // Export public API on window
  window.setLiveSafeBalanceMode162 = setLiveSafeBalanceMode162;
  window.getLiveSafeBalanceMode162 = getLiveSafeBalanceMode162;
  window.computeLiveTreasuryStats162 = computeLiveTreasuryStats162;
  window.renderSidebarLiveTreasuryWidget162 = renderSidebarLiveTreasuryWidget162;
  window.syncAllSettingsStyles162 = syncAllSettingsStyles162;
  window.detectEdgeOrCorner162 = detectEdgeOrCorner162;
  window.cursorForDirection162 = cursorForDirection162;

  // ============================================================================
  // 7. أولاً (التحديث الجديد): إزالة ملء الجداول من الفواتير عند التصدير أو الطباعة أو المعاينة
  //    لظهور العلامة المائية خلفها بالكامل دون أي اختفاء
  // ============================================================================
  function enforceInvoiceTransparentTables162(rootEl) {
    let st = $('invoiceTransparentTablesStyle162');
    if (!st && document.head) {
      st = document.createElement('style');
      st.id = 'invoiceTransparentTablesStyle162';
      document.head.appendChild(st);
    }
    if (st) {
      const cssText = `
        #printArea table, #printArea thead, #printArea tbody, #printArea tfoot, #printArea tr, #printArea th, #printArea td,
        #printArea [data-invoice-part="lines"], #printArea [data-invoice-part="client"], #printArea [data-invoice-part="summary"], #printArea [data-invoice-part="header"], #printArea #invNotesBox,
        #statementInvoiceSheet table, #statementInvoiceSheet thead, #statementInvoiceSheet tbody, #statementInvoiceSheet tfoot, #statementInvoiceSheet tr, #statementInvoiceSheet th, #statementInvoiceSheet td,
        #statementInvoiceSheet [data-invoice-part="lines"], #statementInvoiceSheet [data-invoice-part="client"], #statementInvoiceSheet [data-invoice-part="summary"], #statementInvoiceSheet [data-invoice-part="header"], #statementInvoiceSheet [data-preview-id="invNotesBox"],
        #stmtPrintClone table, #stmtPrintClone thead, #stmtPrintClone tbody, #stmtPrintClone tfoot, #stmtPrintClone tr, #stmtPrintClone th, #stmtPrintClone td {
          background: transparent !important;
          background-color: transparent !important;
          background-image: none !important;
        }
        @media print {
          #printArea table, #printArea thead, #printArea tbody, #printArea tfoot, #printArea tr, #printArea th, #printArea td,
          #printArea [data-invoice-part="lines"], #printArea [data-invoice-part="client"], #printArea [data-invoice-part="summary"], #printArea [data-invoice-part="header"], #printArea #invNotesBox,
          #statementInvoiceSheet table, #statementInvoiceSheet thead, #statementInvoiceSheet tbody, #statementInvoiceSheet tfoot, #statementInvoiceSheet tr, #statementInvoiceSheet th, #statementInvoiceSheet td {
            background: transparent !important;
            background-color: transparent !important;
            background-image: none !important;
          }
        }
      `;
      if (st.textContent !== cssText) st.textContent = cssText;
    }

    const targets = [];
    if (rootEl && rootEl.nodeType === 1) targets.push(rootEl);
    const pa = $('printArea');
    if (pa && !targets.includes(pa)) targets.push(pa);
    const sis = $('statementInvoiceSheet');
    if (sis && !targets.includes(sis)) targets.push(sis);

    targets.forEach(container => {
      if (!container || typeof container.querySelectorAll !== 'function') return;
      const sel = 'table, thead, tbody, tfoot, tr, th, td, [data-invoice-part="lines"], [data-invoice-part="client"], [data-invoice-part="summary"], [data-invoice-part="header"], #invNotesBox, [data-preview-id="invNotesBox"]';
      container.querySelectorAll(sel).forEach(el => {
        if (!el || !el.style) return;
        el.classList?.remove?.('bg-slate-200', 'bg-slate-100', 'bg-slate-50', 'bg-white');
        el.style.setProperty?.('background', 'transparent', 'important');
        el.style.setProperty?.('background-color', 'transparent', 'important');
        el.style.setProperty?.('background-image', 'none', 'important');
        el.style.background = 'transparent';
        el.style.backgroundColor = 'transparent';
        el.style.backgroundImage = 'none';
      });
      const linesBody = $('invLinesBody');
      if (linesBody && linesBody.children) {
        Array.from(linesBody.children).forEach(tr => {
          if (tr?.style) {
            tr.style.setProperty?.('background', 'transparent', 'important');
            tr.style.setProperty?.('background-color', 'transparent', 'important');
            tr.style.background = 'transparent';
            tr.style.backgroundColor = 'transparent';
          }
          Array.from(tr?.children || []).forEach(td => {
            if (td?.style) {
              td.style.setProperty?.('background', 'transparent', 'important');
              td.style.setProperty?.('background-color', 'transparent', 'important');
              td.style.background = 'transparent';
              td.style.backgroundColor = 'transparent';
            }
          });
        });
      }
    });
    return true;
  }

  // ============================================================================
  // 8. ثانياً (التحديث الجديد): إعدادات الفاتورة لتغيير شكل وخلفية لوجو المطبعة أعلى يمين الفاتورة
  //    وتخصيص اسم الفاتورة وتغيير اسم المطبعة أو النشاط وبياناتها
  // ============================================================================
  const INV_LOGO_DEFAULTS_162 = {
    logoShape: 'rounded',       // 'rounded' | 'circle' | 'square' | 'pill' | 'hexagon' | 'frameless'
    logoBgMode: 'color',        // 'color' | 'transparent' | 'gradient'
    logoBgColor: '#ffffff',
    logoBgColor2: '#f0fdfa',
    logoBorderShow: true,
    logoBorderColor: '#cbd5e1',
    logoBorderWidth: 1,
    logoSize: 64,
    logoFit: 'contain',         // 'contain' | 'cover'
    logoPadding: 4,
    customLogo: '',
    title: 'فاتورة مبيعات',
    quoteTitle: 'عرض سعر',
    draftTitle: 'مسودة فاتورة',
    titleTextColor: '#ffffff',
    titleShape: 'rounded',      // 'rounded' | 'pill' | 'square' | 'outline'
    customShopName: '',
    customShopSubTitle: '',
    customShopPhone1: '',
    customShopPhone2: '',
    customShopAddress: '',
    customShopTerms: '',
    extraShopInfo: ''
  };

  function getInvoiceCustomCfg162() {
    const s = getSS();
    const base = typeof window.invCfg === 'function' ? window.invCfg() : (s.inv ||= {});
    Object.keys(INV_LOGO_DEFAULTS_162).forEach(k => {
      if (base[k] === undefined) base[k] = INV_LOGO_DEFAULTS_162[k];
    });
    return base;
  }

  function applyInvoiceLogoStyle162(logoContainerEl, rawCfg) {
    const v = rawCfg || getInvoiceCustomCfg162();
    const s = getSS();
    const boxes = [];
    if (logoContainerEl) boxes.push(logoContainerEl);
    else {
      const mainLogo = $('invLogoContainer');
      if (mainLogo) boxes.push(mainLogo);
      const livePrev = $('invLogoLivePreview162');
      if (livePrev) boxes.push(livePrev);
      const stmtLogo = $('statementInvoiceSheet')?.querySelector?.('[data-preview-id="invLogoContainer"], #invLogoContainer');
      if (stmtLogo && !boxes.includes(stmtLogo)) boxes.push(stmtLogo);
    }

    const shape = ['rounded', 'circle', 'square', 'pill', 'hexagon', 'frameless'].includes(v.logoShape) ? v.logoShape : 'rounded';
    const bgMode = ['color', 'transparent', 'gradient'].includes(v.logoBgMode) ? v.logoBgMode : 'color';
    const bgColor = /^#[0-9a-f]{3,8}$/i.test(String(v.logoBgColor || '')) ? v.logoBgColor : '#ffffff';
    const bgColor2 = /^#[0-9a-f]{3,8}$/i.test(String(v.logoBgColor2 || '')) ? v.logoBgColor2 : '#f0fdfa';
    const borderShow = shape !== 'frameless' && v.logoBorderShow !== false;
    const borderColor = /^#[0-9a-f]{3,8}$/i.test(String(v.logoBorderColor || '')) ? v.logoBorderColor : '#cbd5e1';
    const borderWidth = Math.max(0, Math.min(8, Number(v.logoBorderWidth ?? 1)));
    const size = Math.max(36, Math.min(140, Number(v.logoSize) || 64));
    const fit = v.logoFit === 'cover' ? 'cover' : 'contain';
    const pad = Math.max(0, Math.min(18, Number(v.logoPadding ?? 4)));
    const logoSrc = v.customLogo || s.logo || '';
    const shopInitial = String(v.customShopName || s.name || 'ح').trim().charAt(0) || 'ح';

    let radiusCss = '16px';
    let clipPathCss = 'none';
    if (shape === 'circle') radiusCss = '50%';
    else if (shape === 'square' || shape === 'frameless') radiusCss = '0px';
    else if (shape === 'pill') radiusCss = '9999px';
    else if (shape === 'hexagon') {
      radiusCss = '8px';
      clipPathCss = 'polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%)';
    }

    let bgCss = bgColor;
    if (bgMode === 'transparent') bgCss = 'transparent';
    else if (bgMode === 'gradient') bgCss = `linear-gradient(135deg, ${bgColor}, ${bgColor2})`;

    boxes.forEach(box => {
      if (!box || !box.style) return;
      if (logoSrc) {
        const safeSrc = window.AlhamdSafeImage151?.safe ? window.AlhamdSafeImage151.safe(logoSrc, 30 * 1024 * 1024) : logoSrc;
        box.innerHTML = `<img src="${esc(safeSrc)}" alt="Logo" style="width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;object-fit:${fit}!important;display:block!important;">`;
      } else {
        box.innerHTML = `<span style="font-weight:900;font-size:${Math.round(size * 0.42)}px;line-height:1;">${esc(shopInitial)}</span>`;
      }

      box.classList?.remove?.('bg-teal-50', 'bg-white', 'rounded-2xl', 'rounded-full', 'rounded-none');
      box.style.setProperty?.('width', `${size}px`, 'important');
      box.style.setProperty?.('height', `${size}px`, 'important');
      box.style.setProperty?.('min-width', `${size}px`, 'important');
      box.style.setProperty?.('min-height', `${size}px`, 'important');
      box.style.setProperty?.('border-radius', radiusCss, 'important');
      box.style.setProperty?.('clip-path', clipPathCss, 'important');
      box.style.setProperty?.('padding', `${pad}px`, 'important');
      box.style.setProperty?.('overflow', 'hidden', 'important');
      box.style.setProperty?.('display', 'flex', 'important');
      box.style.setProperty?.('align-items', 'center', 'important');
      box.style.setProperty?.('justify-content', 'center', 'important');

      if (bgMode === 'transparent') {
        box.style.setProperty?.('background', 'transparent', 'important');
        box.style.setProperty?.('background-color', 'transparent', 'important');
        box.style.setProperty?.('background-image', 'none', 'important');
        box.style.background = 'transparent';
        box.style.backgroundColor = 'transparent';
      } else if (bgMode === 'gradient') {
        box.style.setProperty?.('background', bgCss, 'important');
        box.style.setProperty?.('background-image', bgCss, 'important');
        box.style.background = bgCss;
      } else {
        box.style.setProperty?.('background', bgColor, 'important');
        box.style.setProperty?.('background-color', bgColor, 'important');
        box.style.setProperty?.('background-image', 'none', 'important');
        box.style.background = bgColor;
        box.style.backgroundColor = bgColor;
      }

      if (borderShow && borderWidth > 0) {
        box.style.setProperty?.('border', `${borderWidth}px solid ${borderColor}`, 'important');
        box.style.setProperty?.('border-color', borderColor, 'important');
        box.style.border = `${borderWidth}px solid ${borderColor}`;
      } else {
        box.style.setProperty?.('border', 'none', 'important');
        box.style.border = 'none';
      }

      box.style.width = `${size}px`;
      box.style.height = `${size}px`;
      box.style.borderRadius = radiusCss;
      box.style.clipPath = clipPathCss;
      box.style.padding = `${pad}px`;
      box.dataset.logoShape162 = shape;
      box.dataset.logoBgMode162 = bgMode;
      box.dataset.logoBgColor162 = bgMode === 'transparent' ? 'transparent' : bgColor;
      box.dataset.logoFit162 = fit;
    });
  }

  function applyInvoiceIdentityAndTitle162() {
    const v = getInvoiceCustomCfg162();
    const s = getSS();
    const shopName = (v.customShopName || s.name || 'الحمد برنت').trim();
    const subTitle = (v.customShopSubTitle || s.subTitle || 'للطباعة والدعاية والإعلان').trim();
    const p1 = (v.customShopPhone1 || s.phone1 || '').trim();
    const p2 = (v.customShopPhone2 || s.phone2 || '').trim();
    const address = (v.customShopAddress || s.address || '').trim();
    const extraInfo = (v.extraShopInfo || s.extraInfo || '').trim();
    const terms = (v.customShopTerms || s.terms || '').trim();

    const nameEl = $('invHeaderShopName');
    if (nameEl) nameEl.textContent = shopName;
    const subEl = $('invHeaderSubTitle');
    if (subEl) subEl.textContent = subTitle;
    const phonesEl = $('invHeaderPhones');
    if (phonesEl) {
      phonesEl.innerHTML = `<i class="fa-solid fa-phone text-[10px]"></i> خدمة العملاء: ${esc(p1)}${p2 ? ' | ' + esc(p2) : ''}`;
    }
    const addrEl = $('invHeaderAddress');
    if (addrEl) addrEl.textContent = address ? `المقر: ${address}` : '';
    const extraEl = $('invHeaderExtraInfo');
    if (extraEl) {
      extraEl.textContent = extraInfo;
      extraEl.classList?.toggle?.('hidden', !extraInfo);
    }
    const termsEl = $('invTermsText');
    if (termsEl && terms) termsEl.textContent = terms;

    // Title badge customization
    const tb = $('invTitleBadge');
    if (tb) {
      const currentOrdId = typeof window.currentPreviewOrderId160 === 'function' ? window.currentPreviewOrderId160() : null;
      const ord = (window.appState?.orders || []).find(o => String(o.id) === String(currentOrdId))
        || (window.appState?.quotes || []).find(q => String(q.id) === String(currentOrdId));
      if (ord?.isQuote) {
        tb.textContent = ord.status === 'مسودة'
          ? ((v.draftTitle || '').trim() || 'مسودة فاتورة')
          : ((v.quoteTitle || '').trim() || 'عرض سعر');
      } else {
        tb.textContent = (v.title || '').trim() || 'فاتورة مبيعات';
      }

      const accent = v.accent || '#0f172a';
      const textCol = v.titleTextColor || '#ffffff';
      const tShape = v.titleShape || 'rounded';
      const tRadius = tShape === 'pill' ? '9999px' : tShape === 'square' ? '0px' : '8px';
      tb.style.setProperty?.('border-radius', tRadius, 'important');
      tb.style.borderRadius = tRadius;
      if (tShape === 'outline') {
        tb.style.setProperty?.('background', 'transparent', 'important');
        tb.style.setProperty?.('background-color', 'transparent', 'important');
        tb.style.setProperty?.('color', accent, 'important');
        tb.style.setProperty?.('border', `2px solid ${accent}`, 'important');
        tb.style.backgroundColor = 'transparent';
        tb.style.color = accent;
      } else {
        tb.style.setProperty?.('background', accent, 'important');
        tb.style.setProperty?.('background-color', accent, 'important');
        tb.style.setProperty?.('color', textCol, 'important');
        tb.style.setProperty?.('border', `1px solid ${accent}`, 'important');
        tb.style.backgroundColor = accent;
        tb.style.color = textCol;
      }
    }

    applyInvoiceLogoStyle162(null, v);
    enforceInvoiceTransparentTables162();
  }

  window.updateInvoiceLogoSetting162 = function(key, value) {
    const v = getInvoiceCustomCfg162();
    v[key] = value;
    if (key === 'title' && $('invTitle') && $('invTitle').value !== String(value ?? '')) {
      $('invTitle').value = String(value ?? '');
    }
    if (key === 'title' && $('invCustomTitleInput162') && $('invCustomTitleInput162').value !== String(value ?? '')) {
      $('invCustomTitleInput162').value = String(value ?? '');
    }
    syncInvoiceSettingsInputs162();
    if (typeof window.applyInvoiceSettings === 'function') {
      try { window.applyInvoiceSettings(); } catch {}
    }
    applyInvoiceIdentityAndTitle162();
    if (typeof saveState === 'function') saveState(false);
    return v;
  };

  window.setInvoiceCustomTitle162 = function(titleText, quoteTitleText, draftTitleText) {
    const v = getInvoiceCustomCfg162();
    if (titleText !== undefined) v.title = String(titleText);
    if (quoteTitleText !== undefined) v.quoteTitle = String(quoteTitleText);
    if (draftTitleText !== undefined) v.draftTitle = String(draftTitleText);
    if ($('invTitle') && document.activeElement !== $('invTitle')) $('invTitle').value = v.title;
    if ($('invCustomTitleInput162') && document.activeElement !== $('invCustomTitleInput162')) $('invCustomTitleInput162').value = v.title;
    if ($('invQuoteTitle162') && document.activeElement !== $('invQuoteTitle162')) $('invQuoteTitle162').value = v.quoteTitle;
    if (typeof window.applyInvoiceSettings === 'function') {
      try { window.applyInvoiceSettings(); } catch {}
    }
    applyInvoiceIdentityAndTitle162();
    if (typeof saveState === 'function') saveState(false);
    return v;
  };

  window.updateInvoiceShopIdentity162 = function(field, value) {
    const s = getSS();
    const v = getInvoiceCustomCfg162();
    const val = String(value ?? '');
    if (field === 'name') {
      s.name = val;
      v.customShopName = val;
      if ($('settingShopName') && document.activeElement !== $('settingShopName')) $('settingShopName').value = val;
      if ($('invShopName162') && document.activeElement !== $('invShopName162')) $('invShopName162').value = val;
    } else if (field === 'subTitle') {
      s.subTitle = val;
      v.customShopSubTitle = val;
      if ($('settingShopSubTitle') && document.activeElement !== $('settingShopSubTitle')) $('settingShopSubTitle').value = val;
      if ($('invShopSubTitle162') && document.activeElement !== $('invShopSubTitle162')) $('invShopSubTitle162').value = val;
    } else if (field === 'phone1') {
      s.phone1 = val;
      v.customShopPhone1 = val;
      if ($('settingShopPhone1') && document.activeElement !== $('settingShopPhone1')) $('settingShopPhone1').value = val;
      if ($('invShopPhone1_162') && document.activeElement !== $('invShopPhone1_162')) $('invShopPhone1_162').value = val;
    } else if (field === 'phone2') {
      s.phone2 = val;
      v.customShopPhone2 = val;
      if ($('settingShopPhone2') && document.activeElement !== $('settingShopPhone2')) $('settingShopPhone2').value = val;
      if ($('invShopPhone2_162') && document.activeElement !== $('invShopPhone2_162')) $('invShopPhone2_162').value = val;
    } else if (field === 'address') {
      s.address = val;
      v.customShopAddress = val;
      if ($('settingShopAddress') && document.activeElement !== $('settingShopAddress')) $('settingShopAddress').value = val;
      if ($('invShopAddress162') && document.activeElement !== $('invShopAddress162')) $('invShopAddress162').value = val;
    } else if (field === 'extraInfo') {
      s.extraInfo = val;
      v.extraShopInfo = val;
      if ($('invShopExtraInfo162') && document.activeElement !== $('invShopExtraInfo162')) $('invShopExtraInfo162').value = val;
    } else if (field === 'terms') {
      s.terms = val;
      v.customShopTerms = val;
      if ($('settingShopTerms') && document.activeElement !== $('settingShopTerms')) $('settingShopTerms').value = val;
      if ($('invShopTerms162') && document.activeElement !== $('invShopTerms162')) $('invShopTerms162').value = val;
    }
    if (typeof window.applyShopBrandingAndLogo === 'function') {
      try { window.applyShopBrandingAndLogo(); } catch {}
    }
    applyInvoiceIdentityAndTitle162();
    if (typeof saveState === 'function') saveState(false);
    return { shop: s, inv: v };
  };

  window.handleInvoiceLogoUpload162 = function(ev) {
    const file = ev?.target?.files?.[0];
    if (ev?.target) ev.target.value = '';
    if (!file) return;
    if (!/^image\//.test(file.type)) {
      if (typeof showToast === 'function') showToast('اختر ملف صورة صالح للشعار', 'danger');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      const s = getSS();
      const v = getInvoiceCustomCfg162();
      s.logo = dataUrl;
      v.customLogo = dataUrl;
      if (typeof window.applyShopBrandingAndLogo === 'function') {
        try { window.applyShopBrandingAndLogo(); } catch {}
      }
      applyInvoiceIdentityAndTitle162();
      if (typeof saveState === 'function') saveState(false);
      if (typeof showToast === 'function') showToast('تم تحديث شعار الفاتورة والمطبعة بنجاح', 'success');
    };
    reader.readAsDataURL(file);
  };

  window.resetInvoiceCustomLogo162 = function() {
    const v = getInvoiceCustomCfg162();
    v.customLogo = '';
    v.logoShape = 'rounded';
    v.logoBgMode = 'color';
    v.logoBgColor = '#ffffff';
    v.logoBorderShow = true;
    v.logoBorderColor = '#cbd5e1';
    v.logoSize = 64;
    v.logoFit = 'contain';
    v.logoPadding = 4;
    syncInvoiceSettingsInputs162();
    applyInvoiceIdentityAndTitle162();
    if (typeof saveState === 'function') saveState(false);
    if (typeof showToast === 'function') showToast('تمت استعادة الإعدادات الافتراضية لشعار الفاتورة', 'info');
  };

  window.syncInvoiceSettingsInputs162 = function() {
    const v = getInvoiceCustomCfg162();
    const s = getSS();
    const setVal = (id, val) => {
      const el = $(id);
      if (el && document.activeElement !== el) el.value = val;
    };
    setVal('invLogoShape162', v.logoShape || 'rounded');
    setVal('invLogoBgMode162', v.logoBgMode || 'color');
    setVal('invLogoBgColor162', v.logoBgColor || '#ffffff');
    setVal('invLogoBgColor2_162', v.logoBgColor2 || '#f0fdfa');
    setVal('invLogoBorderColor162', v.logoBorderColor || '#cbd5e1');
    setVal('invLogoFit162', v.logoFit || 'contain');
    setVal('invLogoSize162', v.logoSize || 64);
    setVal('invLogoPadding162', v.logoPadding ?? 4);
    if ($('invLogoBorderShow162')) $('invLogoBorderShow162').checked = v.logoBorderShow !== false;
    if ($('invLogoSizeVal162')) $('invLogoSizeVal162').textContent = `${v.logoSize || 64}px`;
    if ($('invLogoPaddingVal162')) $('invLogoPaddingVal162').textContent = `${v.logoPadding ?? 4}px`;

    const shapeBtns = $('invLogoShapeBtns162');
    if (shapeBtns && typeof shapeBtns.querySelectorAll === 'function') {
      shapeBtns.querySelectorAll('[data-inv-logo-shape]').forEach(btn => {
        const active = btn.dataset.invLogoShape === (v.logoShape || 'rounded');
        btn.className = `px-2 py-1.5 rounded-lg border text-[11px] font-bold ${active ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-700 border-slate-300'}`;
      });
    }

    setVal('invCustomTitleInput162', v.title || 'فاتورة مبيعات');
    setVal('invTitle', v.title || 'فاتورة مبيعات');
    setVal('invQuoteTitle162', v.quoteTitle || 'عرض سعر');
    setVal('invTitleBgColor162', v.accent || '#0f172a');
    setVal('invAccent', v.accent || '#0f172a');
    setVal('invTitleTextColor162', v.titleTextColor || '#ffffff');
    setVal('invTitleBadgeStyle162', v.titleShape || 'rounded');

    setVal('invShopName162', v.customShopName || s.name || 'الحمد برنت');
    setVal('invShopSubTitle162', v.customShopSubTitle || s.subTitle || '');
    setVal('invShopPhone1_162', v.customShopPhone1 || s.phone1 || '');
    setVal('invShopPhone2_162', v.customShopPhone2 || s.phone2 || '');
    setVal('invShopAddress162', v.customShopAddress || s.address || '');
    setVal('invShopExtraInfo162', v.extraShopInfo || s.extraInfo || '');
    setVal('invShopTerms162', v.customShopTerms || s.terms || '');

    applyInvoiceLogoStyle162($('invLogoLivePreview162'), v);
  };

  // ============================================================================
  // 9. ثالثاً (التحديث الجديد): إضافة أزرار القفل (الإغلاق) والرجوع إلى النافذة السابقة
  //    أو إلى القسم السابق في كافة نوافذ البرنامج العائمة
  // ============================================================================
  const SECTION_LABELS_162 = {
    dashboard: 'لوحة التحكم الرئيسية',
    orders: 'المبيعات اليومية',
    operations: 'التشغيل والتطوير',
    cashier: 'الكاشير',
    inventory: 'المخزن والخامات',
    stocktake: 'جرد المخزن الفعلي',
    purchases: 'الوارد والمشتريات',
    clients: 'حسابات العملاء',
    suppliers: 'حسابات الموردين',
    quotes: 'عروض الأسعار',
    services: 'الخدمات',
    treasury: 'الخزينة والمصروفات',
    settings: 'الإعدادات',
    about: 'حول البرنامج'
  };

  const sectionHistoryStack162 = ['dashboard'];
  const floatingWindowHistoryStack162 = [];
  let lastOpenedInvoicePreviewId162 = null;
  let invoiceSettingsReturnTarget162 = null;

  function getActiveSectionId162() {
    if (typeof document.querySelector === 'function') {
      const visibleSec = [...(document.querySelectorAll('.tab-view') || [])].find(s => !s.classList?.contains?.('hidden'));
      if (visibleSec?.id?.startsWith('view-')) return visibleSec.id.slice(5);
    }
    return sectionHistoryStack162[sectionHistoryStack162.length - 1] || 'dashboard';
  }

  function recordSectionVisit162(tabId) {
    const clean = String(tabId || '').replace(/^view-/, '').trim();
    if (!clean) return;
    if (sectionHistoryStack162[sectionHistoryStack162.length - 1] !== clean) {
      sectionHistoryStack162.push(clean);
      if (sectionHistoryStack162.length > 30) sectionHistoryStack162.shift();
    }
  }

  function getPreviousSectionId162() {
    const cur = getActiveSectionId162();
    for (let i = sectionHistoryStack162.length - 1; i >= 0; i--) {
      if (sectionHistoryStack162[i] && sectionHistoryStack162[i] !== cur) {
        return sectionHistoryStack162[i];
      }
    }
    return '';
  }

  function isFloatingWindowVisible162(el) {
    if (!el || el.nodeType !== 1) return false;
    if (el.id === 'lockScreenOverlay' || el.id === 'sidebarOverlay' || el.id === 'toastContainer') return false;
    if (el.classList?.contains?.('hidden')) return false;
    if (el.isConnected === false) return false;
    if(el.closest?.('[inert]') || (typeof getComputedStyle==='function' && (getComputedStyle(el).visibility==='hidden'||getComputedStyle(el).display==='none')))return false;
    return true;
  }

  function getAllFloatingWindowNodes162() {
    const list = [];
    const add = el => {
      if (el && el.nodeType === 1 && !list.includes(el) && el.id !== 'lockScreenOverlay' && el.id !== 'sidebarOverlay' && el.id !== 'toastContainer') {
        list.push(el);
      }
    };
    const knownIds = [
      'modalAddItem', 'modalPurchase', 'modalClient', 'modalSupplier', 'modalTransaction',
      'modalService', 'modalServicePay', 'modalUserPerms', 'modalUserAdd', 'modalStatement',
      'modalPrintInvoice', 'modalSecurityPin', 'salesComposer', 'colsPanel', 'privPanel',
      'operationsModal149', 'statementDocumentPreview', 'statementOriginalModal',
      'purchaseRequestPreview147', 'purchaseRequestEditor147', 'whatsappChoiceModal153',
      'lanSyncModal', 'notificationCenter152', 'shortcutGuide150', 'shortcutSettings150',
      'discardWindow150', 'openingDetails151', 'reviewCenter', 'tableFilterModal',
      'tableExcelImportModal', 'contactImportModal', 'contactImportModal134', 'recordDetailModal',
      'serviceCatalogModal', 'serviceCatalogModal143', 'serviceCatalogModal144',
      'imageFitModal139', 'digitalDestinationModal142', 'dailyTreasuryClosingModal162',
      'cashierConfigModal148', 'catMgr', 'fontPicker', 'textEntryModal146', 'pdfOptionsModal',
      'miniCalendarPanel', 'miniCalendarPanel139'
    ];
    knownIds.forEach(id => add($(id)));
    if (typeof document.querySelectorAll === 'function') {
      document.querySelectorAll('.app-dialog144, .studio-overlay150, [role="dialog"], .fixed.inset-0').forEach(add);
    }
    return list;
  }

  function recordFloatingWindowOpen162(winIdOrEl, restoreFn) {
    const el = typeof winIdOrEl === 'string' ? $(winIdOrEl) : winIdOrEl;
    const id = (typeof winIdOrEl === 'string' ? winIdOrEl : el?.id) || '';
    if (!id || id === 'lockScreenOverlay' || id === 'sidebarOverlay' || id === 'toastContainer') return;
    const existingIdx = floatingWindowHistoryStack162.findIndex(w => w.id === id);
    if (existingIdx >= 0) floatingWindowHistoryStack162.splice(existingIdx, 1);
    floatingWindowHistoryStack162.push({
      id,
      section: getActiveSectionId162(),
      restore: typeof restoreFn === 'function' ? restoreFn : () => {
        const node = $(id);
        if (node) {
          node.classList?.remove?.('hidden');
          return true;
        }
        if (id === 'modalPrintInvoice' && lastOpenedInvoicePreviewId162 && typeof window.previewInvoice === 'function') {
          window.previewInvoice(lastOpenedInvoicePreviewId162);
          return true;
        }
        if (id === 'statementDocumentPreview' && typeof window.previewStatementDocument === 'function') {
          window.previewStatementDocument();
          return true;
        }
        return false;
      }
    });
    if (floatingWindowHistoryStack162.length > 25) floatingWindowHistoryStack162.shift();
  }

  const STATIC_MODAL_IDS_162 = new Set([
    'modalAddItem', 'modalPurchase', 'modalClient', 'modalSupplier', 'modalTransaction',
    'modalService', 'modalServicePay', 'modalUserPerms', 'modalUserAdd', 'modalStatement',
    'modalPrintInvoice', 'modalSecurityPin'
  ]);

  window.closeFloatingWindow162 = function(winIdOrEl) {
    const el = typeof winIdOrEl === 'string' ? $(winIdOrEl) : winIdOrEl;
    const id = (typeof winIdOrEl === 'string' ? winIdOrEl : el?.id) || '';
    if (!el && !id) return false;

    if (id === 'salesComposer' || el?.id === 'salesComposer') {
      if (typeof window.closeComposer === 'function') window.closeComposer();
      else (el || $('salesComposer'))?.classList?.add?.('hidden');
      return true;
    }
    if (id === 'colsPanel' || id === 'privPanel') {
      (el || $(id))?.classList?.add?.('hidden');
      return true;
    }
    if (STATIC_MODAL_IDS_162.has(id)) {
      if (el && window.Layout150?.windows?.has?.(el)) {
        const w = window.Layout150.windows.get(el);
        if (w) w.dirty = false;
      }
      if (typeof window.closeModal === 'function') window.closeModal(id);
      (el || $(id))?.classList?.add?.('hidden');
      return true;
    }
    const targetNode = el || $(id);
    if (targetNode) {
      if (window.Layout150?.windows?.has?.(targetNode)) {
        window.Layout150.windows.delete(targetNode);
      }
      if (typeof targetNode.remove === 'function') {
        targetNode.remove();
        return true;
      }
      targetNode.classList?.add?.('hidden');
      return true;
    }
    return false;
  };

  window.closeTopFloatingWindowOnEsc162 = function() {
    if(window.SearchChoices404?.dismissActive())return true;
    if ($('colHeaderFilterPopover163')) {
      window.closeColumnHeaderFilterPopover163();
      return true;
    }
    const gRes = $('globalSearchResults152');
    if (gRes && !gRes.classList?.contains?.('hidden')) {
      gRes.classList.add('hidden');
      $('globalSearch152')?.blur?.();
      return true;
    }
    if (typeof document.querySelectorAll === 'function') {
      const openCombos = [...document.querySelectorAll('.row-combo-menu160:not(.hidden)')];
      if (openCombos.length) {
        openCombos.forEach(m => m.classList?.add?.('hidden'));
        return true;
      }
    }
    if ($('miniCalendarPanel')) {
      $('miniCalendarPanel')?.remove?.();
      return true;
    }
    if ($('miniCalendarPanel139')) {
      $('miniCalendarPanel139')?.remove?.();
      return true;
    }
    if ($('colsPanel') && !$('colsPanel').classList?.contains?.('hidden')) {
      $('colsPanel').classList.add('hidden');
      return true;
    }
    if ($('privPanel') && !$('privPanel').classList?.contains?.('hidden')) {
      $('privPanel').classList.add('hidden');
      return true;
    }
    const te = $('textEntryModal146');
    if (te && isFloatingWindowVisible162(te)) {
      te.querySelector?.('button')?.click?.();
      te.remove?.();
      return true;
    }
    const dw = $('discardWindow150');
    if (dw && isFloatingWindowVisible162(dw)) {
      dw.remove?.();
      return true;
    }

    const candidates = getAllFloatingWindowNodes162().filter(n =>
      n && n.id !== 'salesComposer' && n.id !== 'colsPanel' && n.id !== 'privPanel' &&
      n.id !== 'miniCalendarPanel' && n.id !== 'miniCalendarPanel139' &&
      isFloatingWindowVisible162(n)
    );

    if (candidates.length > 0) {
      candidates.sort((a, b) => {
        const za = Number(typeof getComputedStyle === 'function' ? getComputedStyle(a).zIndex : a.style?.zIndex) || (a.id === 'operationsModal149' ? 50050 : 0);
        const zb = Number(typeof getComputedStyle === 'function' ? getComputedStyle(b).zIndex : b.style?.zIndex) || (b.id === 'operationsModal149' ? 50050 : 0);
        return za - zb;
      });
      const topWin = candidates[candidates.length - 1];
      if (topWin?.id === 'testWindow150' && window.Layout150?.windows?.get?.(topWin)?.dirty) {
        window.Layout150.close(window.Layout150.windows.get(topWin));
        return true;
      }
      return window.closeFloatingWindow162(topWin);
    }

    const composer = $('salesComposer');
    if (composer && isFloatingWindowVisible162(composer)) {
      return window.closeFloatingWindow162(composer);
    }
    return false;
  };

  window.goBackFloatingWindow162 = function(winIdOrEl) {
    const el = typeof winIdOrEl === 'string' ? $(winIdOrEl) : winIdOrEl;
    const id = (typeof winIdOrEl === 'string' ? winIdOrEl : el?.id) || '';

    // Close the current floating window first
    window.closeFloatingWindow162(el || id);

    // Remove current window from top of stack if present
    const curIdx = floatingWindowHistoryStack162.map(x => x.id).lastIndexOf(id);
    if (curIdx >= 0) floatingWindowHistoryStack162.splice(curIdx, 1);

    // 1. Check if another floating window is currently visible underneath or was in the history stack
    while (floatingWindowHistoryStack162.length > 0) {
      const prevWin = floatingWindowHistoryStack162.pop();
      if (!prevWin || prevWin.id === id) continue;
      const existingNode = $(prevWin.id);
      if (existingNode && isFloatingWindowVisible162(existingNode)) {
        floatingWindowHistoryStack162.push(prevWin);
        return { action: 'window', target: prevWin.id };
      }
      if (typeof prevWin.restore === 'function') {
        const ok = prevWin.restore();
        if (ok) {
          floatingWindowHistoryStack162.push(prevWin);
          return { action: 'window', target: prevWin.id };
        }
      }
    }

    // 2. Otherwise return to the previous section (القسم السابق) if available
    const prevSec = getPreviousSectionId162();
    if (prevSec) {
      if (typeof window.switchTab === 'function') window.switchTab(prevSec);
      return { action: 'section', target: prevSec };
    }

    return { action: 'closed', target: getActiveSectionId162() };
  };

  window.goBackFromInvoiceSettings162 = function() {
    if (invoiceSettingsReturnTarget162) {
      const target = invoiceSettingsReturnTarget162;
      invoiceSettingsReturnTarget162 = null;
      if (target.section && typeof window.switchTab === 'function') {
        window.switchTab(target.section);
      }
      if (target.windowId === 'modalPrintInvoice' && target.orderId && typeof window.previewInvoice === 'function') {
        window.previewInvoice(target.orderId);
        return { action: 'window', target: 'modalPrintInvoice' };
      }
      if (target.windowId === 'statementDocumentPreview' && typeof window.previewStatementDocument === 'function') {
        if ($('modalStatement')) $('modalStatement').classList?.remove?.('hidden');
        window.previewStatementDocument();
        return { action: 'window', target: 'statementDocumentPreview' };
      }
    }
    return window.goBackFloatingWindow162('subtab-invoiceTab');
  };

  function getBackButtonTooltip162(currentWinId) {
    for (let i = floatingWindowHistoryStack162.length - 1; i >= 0; i--) {
      const w = floatingWindowHistoryStack162[i];
      if (w && w.id !== currentWinId) {
        return 'الرجوع إلى النافذة السابقة';
      }
    }
    const prevSec = getPreviousSectionId162();
    if (prevSec && SECTION_LABELS_162[prevSec]) {
      return `الرجوع إلى القسم السابق (${SECTION_LABELS_162[prevSec]})`;
    }
    return 'الرجوع إلى النافذة السابقة أو القسم السابق';
  }

  window.ensureFloatingWindowButtons162 = function(winEl) {
    const root = typeof winEl === 'string' ? $(winEl) : winEl;
    if (!root || root.nodeType !== 1) return false;
    if (root.id === 'lockScreenOverlay' || root.id === 'sidebarOverlay' || root.id === 'toastContainer') return false;

    const winId = root.id || '';
    const backTip = getBackButtonTooltip162(winId);

    const isPanel = root.id === 'salesComposer' || root.id === 'colsPanel' || root.id === 'privPanel' || root.id === 'miniCalendarPanel' || root.id === 'miniCalendarPanel139';
    const card = isPanel ? root : (root.querySelector?.(':scope > section, :scope > .dialog-card144, :scope > div') || root.children?.[0] || root);
    if (!card) return true;
    window.compactFloatingWindowSize163?.(root);

    let head = card.querySelector?.(':scope > header:not(.window-tools150), :scope > .dialog-head144:not(.window-tools150), :scope > .win-head:not(.window-tools150), :scope > .notification-head152:not(.window-tools150), :scope > .no-print:not(.window-tools150), :scope > .flex.items-center.justify-between:not(.window-tools150), :scope > .flex.justify-between:not(.window-tools150), :scope > .cal139-head:not(.window-tools150), :scope > .pos-top148:not(.window-tools150)');
    if (!head && card.children?.length) {
      const candidate = [...card.children].find(c => c && !c.classList?.contains?.('window-tools150') && c.tagName !== 'FORM' && c.tagName !== 'TABLE');
      if (candidate) {
        head = candidate;
      }
    }

    // Remove ALL duplicate .window-tools150 bars whenever a real header exists
    if (head && !head.classList?.contains?.('window-tools150')) {
      root.querySelectorAll?.('.window-tools150')?.forEach(tb => {
        if (tb !== head) tb.remove?.();
      });
    }

    let toolsBar = root.querySelector?.('.window-tools150');

    if (head && !head.classList?.contains?.('window-tools150')) {
      // Remove any extra duplicate .floating-win-nav162 groups across the entire modal root
      if (typeof root.querySelectorAll === 'function') {
        const navGroups = [...root.querySelectorAll('.floating-win-nav162')];
        navGroups.slice(1).forEach(g => g.remove?.());
      }
      let navGroup = head.querySelector?.('.floating-win-nav162') || root.querySelector?.('.floating-win-nav162');
      if (!navGroup) {
        navGroup = document.createElement('div');
        navGroup.className = 'floating-win-nav162 no-print inline-flex items-center gap-1.5 shrink-0';

        const backBtn = document.createElement('button');
        backBtn.type = 'button';
        backBtn.dataset.winBack = '1';
        backBtn.className = 'win-back-btn162 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 text-xs font-bold inline-flex items-center gap-1 transition';
        backBtn.title = backTip;
        backBtn.setAttribute('aria-label', 'رجوع');
        backBtn.innerHTML = '<i class="fa-solid fa-arrow-right"></i><span>رجوع</span>';
        backBtn.onclick = e => {
          e?.stopPropagation?.();
          window.goBackFloatingWindow162(root);
        };

        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.dataset.winClose = '1';
        closeBtn.className = 'win-close-btn162 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/70 text-rose-700 dark:text-rose-200 border border-rose-200 dark:border-rose-800 text-xs font-bold inline-flex items-center gap-1 transition';
        closeBtn.title = 'قفل وإغلاق النافذة';
        closeBtn.setAttribute('aria-label', 'إغلاق');
        closeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i><span>إغلاق ✕</span>';
        closeBtn.onclick = e => {
          e?.stopPropagation?.();
          window.closeFloatingWindow162(root);
        };

        navGroup.appendChild(backBtn);
        navGroup.appendChild(closeBtn);
        head.appendChild(navGroup);
      } else {
        const backBtn = navGroup.querySelector?.('[data-win-back="1"]');
        if (backBtn) backBtn.title = backTip;
      }

      // Remove any stray [data-win-back] or [data-win-close] outside the single navGroup
      if (typeof head.querySelectorAll === 'function') {
        head.querySelectorAll('[data-win-back], [data-win-close], .win-back-btn162, .win-close-btn162').forEach(b => {
          if (!navGroup.contains?.(b) && b.parentElement !== navGroup) {
            b.remove?.();
          }
        });
        // Remove or hide any old standalone close/back buttons in the same header so there is zero duplication
        head.querySelectorAll('button:not([data-win-back]):not([data-win-close])').forEach(b => {
          if (navGroup.contains?.(b) || b.parentElement === navGroup) return;
          const t = (b.textContent || '').trim();
          const oc = b.getAttribute?.('onclick') || '';
          const hasCloseIconOnly = !t && Boolean(b.querySelector?.('.fa-xmark, .fa-times'));
          if (
            hasCloseIconOnly ||
            /^(إغلاق|إغلاق ✕|✕ إغلاق|رجوع|رجوع ↩|×|✕|✖)$/.test(t) ||
            b.getAttribute?.('aria-label') === 'إغلاق' ||
            b.getAttribute?.('aria-label') === 'رجوع' ||
            b.hasAttribute?.('data-close') ||
            b.hasAttribute?.('data-dismiss') ||
            b.hasAttribute?.('data-cancel') ||
            /closeModal|closeComposer|remove\(\)|classList\.add\(['"]hidden['"]\)/.test(oc)
          ) {
            b.style.display = 'none';
          }
        });
      }
    } else if (toolsBar) {
      let backBtn = toolsBar.querySelector?.('[data-win-back="1"], .win-back-btn162');
      let closeBtn = toolsBar.querySelector?.('[data-win-close="1"], .win-close-btn162');
      if (!closeBtn && typeof toolsBar.querySelectorAll === 'function') {
        closeBtn = [...toolsBar.querySelectorAll('button')].find(b => (b.textContent || '').includes('إغلاق'));
        if (closeBtn) {
          closeBtn.dataset.winClose = '1';
          closeBtn.classList?.add?.('win-close-btn162');
        }
      }
      if (!backBtn) {
        backBtn = document.createElement('button');
        backBtn.type = 'button';
        backBtn.className = 'win-back-btn162';
        backBtn.dataset.winBack = '1';
        backBtn.textContent = 'رجوع ↩';
        backBtn.onclick = e => {
          e?.stopPropagation?.();
          window.goBackFloatingWindow162(root);
        };
        if (closeBtn && toolsBar.insertBefore) toolsBar.insertBefore(backBtn, closeBtn);
        else toolsBar.appendChild(backBtn);
      }
      backBtn.title = backTip;
    } else {
      // Fallback if window has neither .window-tools150 nor a header element: prepend a control bar
      const bar = document.createElement('div');
      bar.className = 'floating-win-nav162 window-tools150 no-print flex items-center justify-between gap-2 border-b pb-2 mb-2';
      const titleSpan = document.createElement('span');
      titleSpan.className = 'font-bold text-xs';
      titleSpan.textContent = card.querySelector?.('h1,h2,h3,b')?.textContent?.trim() || 'نافذة عائمة';
      const btnWrap = document.createElement('div');
      btnWrap.className = 'inline-flex items-center gap-1.5';

      const backBtn = document.createElement('button');
      backBtn.type = 'button';
      backBtn.dataset.winBack = '1';
      backBtn.className = 'win-back-btn162 px-2.5 py-1 rounded-lg border text-xs font-bold';
      backBtn.title = backTip;
      backBtn.innerHTML = '<i class="fa-solid fa-arrow-right"></i><span>رجوع</span>';
      backBtn.onclick = e => { e?.stopPropagation?.(); window.goBackFloatingWindow162(root); };

      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.dataset.winClose = '1';
      closeBtn.className = 'win-close-btn162 px-2.5 py-1 rounded-lg border text-xs font-bold text-rose-700';
      closeBtn.title = 'قفل وإغلاق النافذة';
      closeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i><span>إغلاق ✕</span>';
      closeBtn.onclick = e => { e?.stopPropagation?.(); window.closeFloatingWindow162(root); };

      btnWrap.appendChild(backBtn);
      btnWrap.appendChild(closeBtn);
      bar.appendChild(titleSpan);
      bar.appendChild(btnWrap);
      if (card.prepend) card.prepend(bar);
      else card.appendChild(bar);
    }

    root.dataset.floatingControls162 = '1';
    return true;
  };

  window.decorateAllFloatingWindows162 = function() {
    const nodes = getAllFloatingWindowNodes162();
    nodes.forEach(node => {
      window.ensureFloatingWindowButtons162(node);
    });
    return nodes.length;
  };

  function installFloatingWindowsAndInvoiceEnhancements162() {
    enforceInvoiceTransparentTables162();
    applyInvoiceIdentityAndTitle162();
    window.syncInvoiceSettingsInputs162();
    window.decorateAllFloatingWindows162();

    // Hook switchTab to track section history
    if (typeof window.switchTab === 'function' && !window.switchTab._hist162) {
      const origSwitchTab = window.switchTab;
      const wrappedSwitchTab = function(tabId, ...rest) {
        recordSectionVisit162(tabId);
        const r = origSwitchTab.call(this, tabId, ...rest);
        if (tabId === 'settings') {
          window.syncInvoiceSettingsInputs162();
        }
        return r;
      };
      wrappedSwitchTab._hist162 = true;
      window.switchTab = wrappedSwitchTab;
    }

    // Hook openModal to track floating window history and decorate buttons
    if (typeof window.openModal === 'function' && !window.openModal._hist162) {
      const origOpenModal = window.openModal;
      const wrappedOpenModal = function(id, ...rest) {
        const r = origOpenModal.call(this, id, ...rest);
        recordFloatingWindowOpen162(id);
        const el = $(id);
        if (el) window.ensureFloatingWindowButtons162(el);
        return r;
      };
      wrappedOpenModal._hist162 = true;
      window.openModal = wrappedOpenModal;
    }

    // Hook previewInvoice to apply transparent tables, custom logo & identity, and track window history
    if (typeof window.previewInvoice === 'function' && !window.previewInvoice._invEnh162) {
      const origPreviewInvoice = window.previewInvoice;
      const wrappedPreviewInvoice = function(orderId, ...rest) {
        lastOpenedInvoicePreviewId162 = orderId;
        const r = origPreviewInvoice.call(this, orderId, ...rest);
        applyInvoiceIdentityAndTitle162();
        enforceInvoiceTransparentTables162($('printArea'));
        recordFloatingWindowOpen162('modalPrintInvoice', () => {
          if (typeof window.previewInvoice === 'function' && lastOpenedInvoicePreviewId162) {
            window.previewInvoice(lastOpenedInvoicePreviewId162);
            return true;
          }
          return false;
        });
        if ($('modalPrintInvoice')) window.ensureFloatingWindowButtons162($('modalPrintInvoice'));
        return r;
      };
      wrappedPreviewInvoice._invEnh162 = true;
      window.previewInvoice = wrappedPreviewInvoice;
    }

    // Hook applyInvoiceSettings to always enforce transparent tables and apply logo & shop identity
    if (typeof window.applyInvoiceSettings === 'function' && !window.applyInvoiceSettings._invEnh162) {
      const origApplyInv = window.applyInvoiceSettings;
      const wrappedApplyInv = function(...rest) {
        const r = origApplyInv.apply(this, rest);
        applyInvoiceIdentityAndTitle162();
        enforceInvoiceTransparentTables162($('printArea'));
        return r;
      };
      wrappedApplyInv._invEnh162 = true;
      window.applyInvoiceSettings = wrappedApplyInv;
    }

    // Hook fillInvoiceSettingsUI so our new controls stay in sync
    if (typeof window.fillInvoiceSettingsUI === 'function' && !window.fillInvoiceSettingsUI._invEnh162) {
      const origFillInv = window.fillInvoiceSettingsUI;
      const wrappedFillInv = function(...rest) {
        const r = origFillInv.apply(this, rest);
        window.syncInvoiceSettingsInputs162();
        return r;
      };
      wrappedFillInv._invEnh162 = true;
      window.fillInvoiceSettingsUI = wrappedFillInv;
    }

    // Hook openInvoiceSettings so clicking "إعدادات الفاتورة" from #modalPrintInvoice or #statementDocumentPreview remembers the return target
    if (typeof window.openInvoiceSettings === 'function' && !window.openInvoiceSettings._invEnh162) {
      const origOpenInvSets = window.openInvoiceSettings;
      const wrappedOpenInvSets = function(...rest) {
        const fromPrintModal = $('modalPrintInvoice') && !$('modalPrintInvoice').classList?.contains?.('hidden');
        const fromStmtPreview = Boolean($('statementDocumentPreview'));
        invoiceSettingsReturnTarget162 = {
          section: getActiveSectionId162(),
          windowId: fromStmtPreview ? 'statementDocumentPreview' : (fromPrintModal ? 'modalPrintInvoice' : ''),
          orderId: lastOpenedInvoicePreviewId162 || (typeof window.currentPreviewOrderId160 === 'function' ? window.currentPreviewOrderId160() : null)
        };
        const r = origOpenInvSets.apply(this, rest);
        window.syncInvoiceSettingsInputs162();
        return r;
      };
      wrappedOpenInvSets._invEnh162 = true;
      window.openInvoiceSettings = wrappedOpenInvSets;
    }

    // Hook previewStatementDocument to record history and ensure transparent tables & buttons
    if (typeof window.previewStatementDocument === 'function' && !window.previewStatementDocument._invEnh162) {
      const origPrevStmt = window.previewStatementDocument;
      const wrappedPrevStmt = function(...rest) {
        if ($('modalStatement') && !$('modalStatement').classList?.contains?.('hidden')) {
          recordFloatingWindowOpen162('modalStatement');
        }
        const r = origPrevStmt.apply(this, rest);
        enforceInvoiceTransparentTables162($('statementInvoiceSheet'));
        recordFloatingWindowOpen162('statementDocumentPreview', () => {
          if (typeof window.previewStatementDocument === 'function') {
            window.previewStatementDocument();
            return true;
          }
          return false;
        });
        if ($('statementDocumentPreview')) window.ensureFloatingWindowButtons162($('statementDocumentPreview'));
        return r;
      };
      wrappedPrevStmt._invEnh162 = true;
      window.previewStatementDocument = wrappedPrevStmt;
    }

    // Hook newSale & editSale so #salesComposer is tracked as a floating window
    ['newSale', 'editSale', 'newQuote', 'editQuote'].forEach(fnName => {
      if (typeof window[fnName] === 'function' && !window[fnName]._hist162) {
        const origFn = window[fnName];
        const wrappedFn = function(...rest) {
          const r = origFn.apply(this, rest);
          recordFloatingWindowOpen162('salesComposer');
          if ($('salesComposer')) window.ensureFloatingWindowButtons162($('salesComposer'));
          return r;
        };
        wrappedFn._hist162 = true;
        window[fnName] = wrappedFn;
      }
    });

    // Ensure #modalStatement always gets clean single Back/Close buttons after renderStatement replaces #stmtCard.innerHTML
    if (typeof window.renderStatement === 'function' && !window.renderStatement._winBtns163) {
      const prevRenderStmt = window.renderStatement;
      const wrappedRenderStmt = function(...rest) {
        const r = prevRenderStmt.apply(this, rest);
        if ($('modalStatement')) window.ensureFloatingWindowButtons162($('modalStatement'));
        return r;
      };
      wrappedRenderStmt._winBtns163 = true;
      window.renderStatement = wrappedRenderStmt;
    }

    // Observe DOM additions so any dynamically created modal immediately gets Back & Close buttons without duplicates
    if (typeof MutationObserver === 'function' && document.body) {
      const obs = new MutationObserver(mutations => {
        for (const m of mutations) {
          for (const node of (m.addedNodes || [])) {
            if (node && node.nodeType === 1) {
              if (node.id === 'hdrClock' || node.parentElement?.tagName === 'HEADER') {
                window.normalizeHeaderClockPosition163?.();
              }
              if (
                node.classList?.contains?.('app-dialog144') ||
                node.classList?.contains?.('studio-overlay150') ||
                node.classList?.contains?.('fixed') ||
                node.getAttribute?.('role') === 'dialog' ||
                node.id?.includes('Modal') ||
                node.id?.includes('Preview') ||
                node.id?.includes('Panel')
              ) {
                recordFloatingWindowOpen162(node);
                window.ensureFloatingWindowButtons162(node);
              } else if (node.classList?.contains?.('window-tools150')) {
                const winRoot = node.closest?.('.app-dialog144, .studio-overlay150, [role="dialog"], .fixed.inset-0, #operationsModal149');
                if (winRoot) window.ensureFloatingWindowButtons162(winRoot);
              }
            }
          }
        }
      });
      obs.observe(document.body, { childList: true, subtree: true });
    }

    // Global Escape key listener as backup if Layout150 is not active
    window.addEventListener?.('keydown', e => {
      if (e.key !== 'Escape' && e.key !== 'Esc') return;
      if (e.defaultPrevented) return;
      if (document.activeElement?.closest?.('#shortcutSettings150') && document.activeElement?.matches?.('[data-shortcut-capture151]')) return;
      if (window.closeTopFloatingWindowOnEsc162()) {
        e.preventDefault?.();
        e.stopImmediatePropagation?.();
      }
    }, true);
  }

  window.normalizeHeaderClockPosition163 = function() {
    const clock = $('hdrClock');
    const hdr = clock?.closest?.('header') || (typeof document.querySelector === 'function' ? document.querySelector('main > header, header') : null);
    if (!hdr || !clock) return false;
    if (hdr.firstElementChild !== clock && typeof hdr.prepend === 'function') {
      hdr.prepend(clock);
    }
    let brk = $('hdrClockRowBreak163');
    if (!brk && typeof document.createElement === 'function') {
      brk = document.createElement('div');
      brk.id = 'hdrClockRowBreak163';
      brk.setAttribute?.('aria-hidden', 'true');
      clock.after?.(brk);
    }
    if (brk?.style) {
      brk.style.setProperty?.('order', '-9', 'important');
      brk.style.setProperty?.('flex', '0 0 100%', 'important');
      brk.style.setProperty?.('width', '100%', 'important');
      brk.style.setProperty?.('height', '0px', 'important');
    }
    clock.classList?.remove?.('flex-col', 'w-full');
    clock.classList?.add?.('flex-row', 'items-center', 'justify-center', 'w-fit', 'mr-auto', 'ml-0');
    if (clock.style) {
      clock.style.setProperty?.('order', '-10', 'important');
      clock.style.setProperty?.('flex', '0 0 auto', 'important');
      clock.style.setProperty?.('width', 'fit-content', 'important');
      clock.style.setProperty?.('max-width', 'max-content', 'important');
      clock.style.setProperty?.('margin-right', 'auto', 'important');
      clock.style.setProperty?.('margin-left', '0px', 'important');
      clock.style.setProperty?.('flex-direction', 'row', 'important');
      clock.style.setProperty?.('align-items', 'center', 'important');
      clock.style.setProperty?.('justify-content', 'center', 'important');
      clock.style.setProperty?.('gap', '8px', 'important');
      clock.style.setProperty?.('padding', '2px 10px', 'important');
      clock.style.setProperty?.('min-height', '24px', 'important');
      clock.style.setProperty?.('max-height', '26px', 'important');
      clock.style.setProperty?.('white-space', 'nowrap', 'important');
    }
    return true;
  };

  window.compactFloatingWindowSize163 = function(win) {
    if(win?.dataset?.layer701 === 'true' || win?.closest?.('[data-layer701]')) return false;
    if (!win || !win.style) return false;
    if (win.id === 'modalPrintInvoice' || win.id === 'statementDocumentPreview' || win.closest?.('#modalPrintInvoice, #statementDocumentPreview')) return false;
    const card = (win.classList?.contains?.('dialog-card144') || win.classList?.contains?.('ops-dialog149') || win.classList?.contains?.('studio-card150'))
      ? win
      : (win.querySelector?.('.dialog-card144, .ops-dialog149, .studio-card150') || win.firstElementChild || win);
    if (!card || !card.style) return false;
    const widths = {
      'max-w-sm': 340,
      'max-w-md': 390,
      'max-w-lg': 440,
      'max-w-xl': 490,
      'max-w-2xl': 560,
      'max-w-3xl': 640,
      'max-w-4xl': 720,
      'max-w-5xl': 800,
      'max-w-6xl': 880
    };
    let targetW = card.classList?.contains?.('ops-dialog149') ? 700 : (card.classList?.contains?.('studio-card150') ? 620 : 560);
    for (const [cls, w] of Object.entries(widths)) {
      if (card.classList?.contains?.(cls)) {
        targetW = w;
        break;
      }
    }
    card.style.setProperty?.('max-width', `min(${targetW}px, calc(100vw - 32px))`, 'important');
    card.style.setProperty?.('max-height', 'min(82dvh, calc(100dvh - 48px))', 'important');
    return true;
  };

  window.normalizeSaleLinesLayout163 = function() {
    const host = $('saleLines');
    if (!host) return false;
    host.style?.removeProperty?.('--sale-columns148');
    host.style?.removeProperty?.('--sale-minimum148');
    host.style?.setProperty?.('overflow-x', 'hidden', 'important');
    host.style?.setProperty?.('width', '100%', 'important');
    host.style?.setProperty?.('max-width', '100%', 'important');
    host.style?.setProperty?.('min-width', '0', 'important');
    const rows = host.querySelectorAll ? [...host.querySelectorAll('.sale-line')] : [...(host.children || [])];
    for (const row of rows) {
      if (!row) continue;
      row.style?.setProperty?.('min-width', '0', 'important');
      row.style?.setProperty?.('width', '100%', 'important');
      row.style?.setProperty?.('max-width', '100%', 'important');
      const firstCell = row.firstElementChild;
      const headRow = firstCell?.querySelector?.('div:first-child, .sl-head-row163');
      if (headRow) {
        headRow.classList?.add?.('sl-head-row163');
        const actionsSpan = headRow.querySelector?.('span, .sl-head-actions163');
        const specBtn = headRow.querySelector?.('.spec-button149') || firstCell?.querySelector?.('.spec-button149');
        if (actionsSpan) {
          actionsSpan.classList?.add?.('sl-head-actions163');
          if (specBtn && specBtn.parentElement !== actionsSpan) {
            actionsSpan.appendChild(specBtn);
          }
        }
      }
    }
    return true;
  };

  window.enforceInvoiceTransparentTables162 = enforceInvoiceTransparentTables162;
  window.applyInvoiceLogoStyle162 = applyInvoiceLogoStyle162;
  window.applyInvoiceIdentityAndTitle162 = applyInvoiceIdentityAndTitle162;
  window.getInvoiceCustomCfg162 = getInvoiceCustomCfg162;

  window.Alhamd162 = {
    detectEdgeOrCorner: detectEdgeOrCorner162,
    cursorForDirection: cursorForDirection162,
    applyElementSize: applyElementSize162,
    isButtonOrControlElement: isButtonOrControlElement162,
    resolveResizableTarget: resolveResizableTarget162,
    resolveDraggableTarget: resolveDraggableTarget162,
    resetAllCustomSizesAndPositions: window.resetAllCustomSizesAndPositions162,
    computeLiveTreasuryStats: computeLiveTreasuryStats162,
    setLiveSafeBalanceMode: setLiveSafeBalanceMode162,
    getLiveSafeBalanceMode: getLiveSafeBalanceMode162,
    openDailyTreasuryClosingModal: window.openDailyTreasuryClosingModal162,
    saveDailyTreasuryClosing: window.saveDailyTreasuryClosing162,
    printDailyClosingReport: window.printDailyClosingReport162,
    syncAllSettingsStyles: syncAllSettingsStyles162,
    compareArabicAlpha: compareArabicAlpha162,
    sortSectionAlphabetically: window.sortSectionAlphabetically162,
    sortAllEntitiesAlphabetically: window.sortAllEntitiesAlphabetically162,
    getPartyFullBalanceBreakdown: getPartyFullBalanceBreakdown162,
    renderTreasuryPartySelectOptions: renderTreasuryPartySelectOptions162,
    openOriginalDocument: window.openOriginalDocument162,
    enforceInvoiceTransparentTables: enforceInvoiceTransparentTables162,
    getInvoiceCustomCfg: getInvoiceCustomCfg162,
    applyInvoiceLogoStyle: applyInvoiceLogoStyle162,
    applyInvoiceIdentityAndTitle: applyInvoiceIdentityAndTitle162,
    updateInvoiceLogoSetting: window.updateInvoiceLogoSetting162,
    setInvoiceCustomTitle: window.setInvoiceCustomTitle162,
    updateInvoiceShopIdentity: window.updateInvoiceShopIdentity162,
    ensureFloatingWindowButtons: window.ensureFloatingWindowButtons162,
    filterTableByColumnValue: window.filterTableByColumnValue163,
    filterTableByColumnSearch: window.filterTableByColumnSearch163,
    openColumnHeaderFilterPopover: window.openColumnHeaderFilterPopover163,
    decorateAllFloatingWindows: window.decorateAllFloatingWindows162,
    goBackFloatingWindow: window.goBackFloatingWindow162,
    closeFloatingWindow: window.closeFloatingWindow162,
    normalizeSingleTableToolbar: normalizeSingleTableToolbar162,
    cleanOrdersTableEmptyState: cleanOrdersTableEmptyState162,
    decorateAlphaSortButtonsInToolbars: decorateAlphaSortButtonsInToolbars162
  };


  // ============================================================================
  // 10. رابعاً (التحديث الجديد): إمكانية الفلترة والترتيب من خلال الضغط على العمود في الجداول
  //     (بما يشمل جدول التشغيل والتطوير وباقي جداول البرنامج)
  // ============================================================================
  window.filterTableByColumnValue163 = function(key, colId, val) {
    if (typeof TABLE_DEFS === 'undefined' || !TABLE_DEFS[key]) return false;
    const s = getSS();
    s.tableViews ||= {};
    const v = (s.tableViews[key] ||= { rules: [], sort: '', dir: 'asc', quick: '' });
    if (!Array.isArray(v.rules)) v.rules = [];
    v.rules = v.rules.filter(r => !(r.col === colId && r._colQuick163));
    if (val === '' || val === null || val === undefined || val === '__all__') {
      if (String(v.quick || '').startsWith('col:' + colId + ':')) {
        v.quick = '';
      }
    } else {
      v.quick = 'col:' + colId + ':' + String(val).trim();
    }
    if (typeof saveState === 'function') saveState(false);
    if (typeof refreshTableView === 'function') refreshTableView(key);
    else if (String(key || '').startsWith('opsTable149_') && typeof window.Operations149UI?.render === 'function') window.Operations149UI.render();
    if (typeof window.updateHeaderSortIndicators163 === 'function') window.updateHeaderSortIndicators163();
    return true;
  };

  window.filterTableByColumnSearch163 = function(key, colId, searchText) {
    if (typeof TABLE_DEFS === 'undefined' || !TABLE_DEFS[key]) return false;
    const s = getSS();
    s.tableViews ||= {};
    const v = (s.tableViews[key] ||= { rules: [], sort: '', dir: 'asc', quick: '' });
    if (!Array.isArray(v.rules)) v.rules = [];
    v.rules = v.rules.filter(r => !(r.col === colId && r._colQuick163));
    const q = String(searchText || '').trim();
    if (q) {
      const col = TABLE_DEFS[key].cols.find(c => c.id === colId);
      const op = col && col.type === 'text' ? 'contains' : 'eq';
      v.rules.push({ col: colId, op, value: q, to: '', _colQuick163: true });
    }
    if (typeof saveState === 'function') saveState(false);
    if (typeof refreshTableView === 'function') refreshTableView(key);
    else if (String(key || '').startsWith('opsTable149_') && typeof window.Operations149UI?.render === 'function') window.Operations149UI.render();
    if (typeof window.updateHeaderSortIndicators163 === 'function') window.updateHeaderSortIndicators163();
    return true;
  };

  window.closeColumnHeaderFilterPopover163 = function() {
    $('colHeaderFilterPopover163')?.remove?.();
  };

  window.openColumnHeaderFilterPopover163 = function(key, colIndex, anchorRect) {
    void key; void colIndex; void anchorRect;
    window.closeColumnHeaderFilterPopover163();
    return null;
    const col = TABLE_DEFS[key].cols[colIndex];
    if (!col) return null;
    if (col.type === 'cost' && typeof can === 'function' && !can('stock_cost')) return null;

    window.closeColumnHeaderFilterPopover163();
    const s = getSS();
    const v = s.tableViews?.[key] || { rules: [], sort: '', dir: 'asc', quick: '' };
    const rawRows = (typeof _sourceRowsForTable163 === 'function' ? _sourceRowsForTable163(key) : (window.PAGE_STATE?.[key]?.raw || []));
    const counts = new Map();
    for (const r of rawRows) {
      if (!r || typeof r !== 'object') continue;
      let val = '';
      try { val = String(col.get(r) ?? '').trim(); } catch { val = ''; }
      if (!val || val === '—') continue;
      counts.set(val, (counts.get(val) || 0) + 1);
    }
    const distinctEntries = [...counts.entries()].slice(0, 60);
    const activeColPrefix = 'col:' + col.id + ':';
    const currentQuickVal = String(v.quick || '').startsWith(activeColPrefix) ? String(v.quick).slice(activeColPrefix.length) : '';
    const existingRule = (v.rules || []).find(r => r.col === col.id && r._colQuick163);

    const pop = document.createElement('div');
    pop.id = 'colHeaderFilterPopover163';
    pop.setAttribute('dir', 'rtl');
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-label', 'فلترة عمود ' + col.label);

    const top = Math.min(Math.max(8, (anchorRect?.bottom || 120) + 4), (window.innerHeight || 800) - 370);
    const left = Math.min(Math.max(8, (anchorRect?.left || 200)), (window.innerWidth || 1200) - 270);
    pop.style.top = top + 'px';
    pop.style.left = left + 'px';

    pop.innerHTML = `
      <div class="flex items-center justify-between border-b pb-1.5 dark:border-slate-700">
        <strong class="text-xs font-black text-teal-700 dark:text-teal-400"><i class="fa-solid fa-filter ml-1"></i>فلترة عمود: ${esc(col.label)}</strong>
        <button type="button" id="closeColPopBtn163" class="px-1.5 py-0.5 rounded text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700">✕</button>
      </div>
      <div class="grid grid-cols-2 gap-1.5">
        <button type="button" id="colSortAscBtn163" class="px-2 py-1 rounded-lg border text-[11px] font-bold ${v.sort === col.id && v.dir === 'asc' ? 'bg-teal-600 text-white border-teal-600' : 'bg-slate-50 dark:bg-slate-800'}">ترتيب تصاعدي ↑</button>
        <button type="button" id="colSortDescBtn163" class="px-2 py-1 rounded-lg border text-[11px] font-bold ${v.sort === col.id && v.dir === 'desc' ? 'bg-teal-600 text-white border-teal-600' : 'bg-slate-50 dark:bg-slate-800'}">ترتيب تنازلي ↓</button>
      </div>
      <div class="flex items-center gap-1">
        <input id="colSearchInput163" type="search" placeholder="ابحث في ${esc(col.label)}..." value="${esc(existingRule?.value || '')}" class="w-full px-2 py-1 border rounded-lg text-xs">
        <button type="button" id="colApplySearchBtn163" class="px-2 py-1 rounded-lg bg-teal-600 text-white text-xs font-bold shrink-0">تطبيق</button>
      </div>
      <div id="colValuesList163" class="overflow-y-auto max-h-44 border rounded-lg divide-y dark:border-slate-700 dark:divide-slate-700">
        <button type="button" data-col-val="__all__" class="w-full text-right px-2.5 py-1.5 text-xs font-bold hover:bg-teal-50 dark:hover:bg-slate-700 flex items-center justify-between ${!currentQuickVal && !existingRule ? 'bg-teal-50/80 dark:bg-slate-700 text-teal-700 dark:text-teal-300' : ''}">
          <span>كل القيم (عرض الكل)</span>
          <span class="font-mono text-[10px] opacity-75">${rawRows.length}</span>
        </button>
        ${distinctEntries.map(([val, cnt]) => `
          <button type="button" data-col-val="${esc(val)}" class="w-full text-right px-2.5 py-1.5 text-xs hover:bg-teal-50 dark:hover:bg-slate-700 flex items-center justify-between ${currentQuickVal === val ? 'bg-teal-50 dark:bg-slate-700 font-black text-teal-700 dark:text-teal-300' : ''}">
            <span class="truncate">${esc(val)}</span>
            <span class="font-mono text-[10px] opacity-75 mr-2">${cnt}</span>
          </button>
        `).join('')}
      </div>
    `;

    document.body.appendChild(pop);

    const closeBtn = pop.querySelector?.('#closeColPopBtn163');
    if (closeBtn) closeBtn.onclick = () => window.closeColumnHeaderFilterPopover163();

    const ascBtn = pop.querySelector?.('#colSortAscBtn163');
    if (ascBtn) ascBtn.onclick = () => {
      const tv = (getSS().tableViews[key] ||= { rules: [], sort: '', dir: 'asc', quick: '' });
      tv.sort = col.id; tv.dir = 'asc';
      if (typeof saveState === 'function') saveState(false);
      if (typeof refreshTableView === 'function') refreshTableView(key);
      window.closeColumnHeaderFilterPopover163();
    };

    const descBtn = pop.querySelector?.('#colSortDescBtn163');
    if (descBtn) descBtn.onclick = () => {
      const tv = (getSS().tableViews[key] ||= { rules: [], sort: '', dir: 'asc', quick: '' });
      tv.sort = col.id; tv.dir = 'desc';
      if (typeof saveState === 'function') saveState(false);
      if (typeof refreshTableView === 'function') refreshTableView(key);
      window.closeColumnHeaderFilterPopover163();
    };

    const searchInp = pop.querySelector?.('#colSearchInput163');
    const applySearchBtn = pop.querySelector?.('#colApplySearchBtn163');
    const runSearch = () => {
      window.filterTableByColumnSearch163(key, col.id, searchInp?.value || '');
      window.closeColumnHeaderFilterPopover163();
    };
    if (applySearchBtn) applySearchBtn.onclick = runSearch;
    if (searchInp) {
      searchInp.onkeydown = ev => {
        if (ev.key === 'Enter') { ev.preventDefault(); runSearch(); }
        if (ev.key === 'Escape') { ev.preventDefault(); window.closeColumnHeaderFilterPopover163(); }
      };
      searchInp.oninput = () => {
        const q = (searchInp.value || '').trim().toLowerCase();
        pop.querySelectorAll?.('#colValuesList163 button[data-col-val]')?.forEach(btn => {
          const v = btn.getAttribute('data-col-val') || '';
          if (v === '__all__') return;
          btn.style.display = (!q || v.toLowerCase().includes(q)) ? '' : 'none';
        });
      };
    }

    pop.querySelectorAll?.('#colValuesList163 button[data-col-val]')?.forEach(btn => {
      btn.onclick = () => {
        const chosen = btn.getAttribute('data-col-val');
        window.filterTableByColumnValue163(key, col.id, chosen);
        window.closeColumnHeaderFilterPopover163();
      };
    });

    return pop;
  };

  window.decorateSortableFilterableTableHeaders163 = function(key, tableEl) {
    if (typeof TABLE_DEFS === 'undefined' || !TABLE_DEFS[key]) return;
    const table = tableEl || $(key)?.closest?.('table');
    if (!table) return;
    const cols = TABLE_DEFS[key].cols;
    const v = getSS().tableViews?.[key] || {};
    [...(table.querySelectorAll?.('thead th') || [])].forEach((th, i) => {
      const origin = th.hasAttribute?.('data-origin-column157') ? Number(th.dataset.originColumn157) : i;
      const c = cols[origin];
      if (!c) return;
      th.classList?.add?.('cursor-pointer', 'select-none');
      th.title = `ترتيب حسب ${c.label} — اضغط للترتيب تصاعدياً أو تنازلياً`;
      th.dataset.colFiltered163 = '';
      th.dataset.sortIndicator = v.sort === c.id ? (v.dir === 'desc' ? '↓' : '↑') : '';
    });
  };

  document.addEventListener('pointerdown', e => {
    const pop = $('colHeaderFilterPopover163');
    if (pop && !e.target?.closest?.('#colHeaderFilterPopover163, thead th')) {
      window.closeColumnHeaderFilterPopover163();
    }
  });

  if (window.Alhamd162) {
    Object.assign(window.Alhamd162, {
      filterTableByColumnValue: window.filterTableByColumnValue163,
      filterTableByColumnSearch: window.filterTableByColumnSearch163,
      openColumnHeaderFilterPopover: window.openColumnHeaderFilterPopover163,
      closeTopFloatingWindowOnEsc: window.closeTopFloatingWindowOnEsc162,
      normalizeHeaderClockPosition: window.normalizeHeaderClockPosition163,
      compactFloatingWindowSize: window.compactFloatingWindowSize163,
      normalizeSaleLinesLayout: window.normalizeSaleLinesLayout163
    });
  }

  function initRelease162() {
    installWindowsPrecisionResizeAndDrag162();
    installStatementAndAppWideOriginalOpener162();
    installLifecycleHooks162();
    installTreasuryModalSearchAndOpeningBalanceUI162();
    injectLiveTreasuryAndSortingSettingsCard162();
    installFloatingWindowsAndInvoiceEnhancements162();

    if (getSS().alphaSortDefault162 === undefined) {
      getSS().alphaSortDefault162 = true;
    }
    if (getSS().alphaSortDefault162 !== false) {
      window.appState?.clients?.sort((a, b) => compareArabicAlpha162(a?.name, b?.name, 'asc'));
      window.appState?.suppliers?.sort((a, b) => compareArabicAlpha162(a?.name, b?.name, 'asc'));
      window.appState?.items?.sort((a, b) => compareArabicAlpha162(a?.name, b?.name, 'asc'));
      window.appState?.serviceCatalog?.sort((a, b) => compareArabicAlpha162(a?.name, b?.name, 'asc'));
    }

    if (typeof window.renderOrdersTable === 'function' && !window.renderOrdersTable._emptyClean162) {
      const origRenderOrders = window.renderOrdersTable;
      const wrappedRenderOrders = function(...args) {
        const r = origRenderOrders.apply(this, args);
        cleanOrdersTableEmptyState162();
        decorateAlphaSortButtonsInToolbars162('ordersTableBody');
        return r;
      };
      wrappedRenderOrders._emptyClean162 = true;
      window.renderOrdersTable = wrappedRenderOrders;
    }

    if (typeof window.tableTools === 'function' && !window.tableTools._toolbarAlign162) {
      const origTableTools = window.tableTools;
      const wrappedTableTools = function(key, container) {
        const r = origTableTools.call(this, key, container);
        decorateAlphaSortButtonsInToolbars162(key);
        return r;
      };
      wrappedTableTools._toolbarAlign162 = true;
      window.tableTools = wrappedTableTools;
    }

    if (typeof window.addSaleLine === 'function' && !window.addSaleLine._saleLineNormalized163) {
      const origAddSaleLine = window.addSaleLine;
      const wrappedAddSaleLine = function(...args) {
        const row = origAddSaleLine.apply(this, args);
        window.normalizeSaleLinesLayout163?.();
        return row;
      };
      wrappedAddSaleLine._saleLineNormalized163 = true;
      window.addSaleLine = wrappedAddSaleLine;
    }
    window.normalizeHeaderClockPosition163();
    window.normalizeSaleLinesLayout163();
    populateSortedDropdownsAndPickers162();
    renderSidebarLiveTreasuryWidget162();
    renderTreasuryDailyClosingBanner162();
    decorateAlphaSortButtonsInToolbars162();
    cleanOrdersTableEmptyState162();
    syncAllSettingsStyles162();
    restoreSavedSizesAndOrders162();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRelease162, { once: true });
  } else {
    initRelease162();
  }
  window.addEventListener?.('load', initRelease162);
})();
