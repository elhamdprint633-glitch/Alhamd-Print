/* Business tools: range filters, WhatsApp-ready PDFs, and digital print estimator. */
(function () {
    const oldCan = can;
    can = function (key) {
        if (key === 'tab_digitalcalc') return !!getCurrentUser();
        return oldCan(key);
    };

    const oldTableApply = tableApply;
    const oldTableTools = tableTools;
    const oldResetTableView = resetTableView;
    const oldOpenTableFilter = openTableFilter;
    const oldCommitTableFilter = commitTableFilter;

    const validISODate = value => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || '')); if (!m) return false; const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])); return d.getFullYear() === Number(m[1]) && d.getMonth() === Number(m[2]) - 1 && d.getDate() === Number(m[3]); };
    const dateValue = value => String(value || '').slice(0, 10);
    const hasDate = range => !!(range && (range.from || range.to));
    const hasAmount = range => !!(range && (range.min !== '' && range.min != null || range.max !== '' && range.max != null));

    tableApply = function (key, rows) {
        const view = tableView(key), cols = tableCols(key);
        const dateRange = view.dateRange, amountRange = view.amountRange;
        if (!hasDate(dateRange) && !hasAmount(amountRange)) return oldTableApply(key, rows);
        const dateCol = cols.find(c => c.id === dateRange?.col && c.type === 'date');
        const amountCol = cols.find(c => c.id === amountRange?.col && ['number', 'cost'].includes(c.type));
        const selected = rows.filter(row => {
            if (dateCol) {
                const value = dateValue(dateCol.get(row));
                if (dateRange.from && (!value || value < dateRange.from)) return false;
                if (dateRange.to && (!value || value > dateRange.to)) return false;
            }
            if (amountCol) {
                const value = Number(amountCol.get(row) || 0);
                if (amountRange.min !== '' && amountRange.min != null && value < tableNumber(amountRange.min)) return false;
                if (amountRange.max !== '' && amountRange.max != null && value > tableNumber(amountRange.max)) return false;
            }
            return true;
        });
        return oldTableApply(key, selected);
    };

    tableTools = function (key, container) {
        oldTableTools(key, container);
        const bar = gid(key + 'Tools');
        bar?.querySelectorAll?.('[data-table-status]')?.forEach(el => el.remove());
    };

    resetTableView = function (key) {
        ss().tableViews[key] = { rules: [], sort: '', dir: 'asc', dateRange: null, amountRange: null };
        saveState(false);
        refreshTableView(key);
    };

    function rangeFields(key) {
        const cols = tableCols(key), dates = cols.filter(c => c.type === 'date'), amounts = cols.filter(c => ['number', 'cost'].includes(c.type));
        const view = tableView(key), dr = view.dateRange || {}, ar = view.amountRange || {};
        const optionList = list => list.map(c => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.label)}</option>`).join('');
        return `
          <div id="tableQuickRanges" class="border rounded-xl p-4 mb-4 bg-slate-50 dark:bg-slate-800 dark:border-slate-600 space-y-4">
            <h3 class="font-black">فلترة سريعة بالنطاق</h3>
            ${dates.length ? `<div class="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
              <label class="text-xs font-bold">عمود التاريخ<select id="quickDateColumn" class="border rounded-lg p-2 w-full mt-1 dark:bg-slate-700 dark:border-slate-600"><option value="">اختر العمود</option>${optionList(dates)}</select></label>
              <label class="text-xs font-bold">من تاريخ<input id="quickDateFrom" type="date" class="border rounded-lg p-2 w-full mt-1 dark:bg-slate-700 dark:border-slate-600" value="${escapeHtml(dr.from || '')}"></label>
              <label class="text-xs font-bold">إلى تاريخ<input id="quickDateTo" type="date" class="border rounded-lg p-2 w-full mt-1 dark:bg-slate-700 dark:border-slate-600" value="${escapeHtml(dr.to || '')}"></label>
              <label class="text-xs font-bold">اختيار سريع<select id="quickDatePreset" class="border rounded-lg p-2 w-full mt-1 dark:bg-slate-700 dark:border-slate-600"><option value="custom">فترة مخصصة</option><option value="today">اليوم</option><option value="yesterday">أمس</option><option value="last7">آخر 7 أيام</option><option value="month">هذا الشهر</option><option value="lastmonth">الشهر السابق</option><option value="all">كل التواريخ</option></select></label>
            </div>` : '<p class="text-xs text-slate-500">لا يوجد عمود تاريخ في هذا الجدول.</p>'}
            ${amounts.length ? `<div class="grid grid-cols-1 md:grid-cols-3 gap-2 items-end pt-3 border-t">
              <label class="text-xs font-bold">عمود المبلغ / الرقم<select id="quickAmountColumn" class="border rounded-lg p-2 w-full mt-1 dark:bg-slate-700 dark:border-slate-600"><option value="">بدون تحديد</option>${optionList(amounts)}</select></label>
              <label class="text-xs font-bold">من قيمة<input id="quickAmountMin" inputmode="decimal" class="border rounded-lg p-2 w-full mt-1 dark:bg-slate-700 dark:border-slate-600" placeholder="مثال: 500" value="${escapeHtml(ar.min ?? '')}"></label>
              <label class="text-xs font-bold">إلى قيمة<input id="quickAmountMax" inputmode="decimal" class="border rounded-lg p-2 w-full mt-1 dark:bg-slate-700 dark:border-slate-600" placeholder="مثال: 2000" value="${escapeHtml(ar.max ?? '')}"></label>
            </div>` : '<p class="text-xs text-slate-500">لا يوجد عمود رقمي في هذا الجدول.</p>'}
            <p class="text-[11px] text-slate-500">النطاق السريع يعمل مع البحث والشروط الأخرى، ويشمل كل الصفحات والتصدير والتقرير.</p>
          </div>`;
    }

    function fillRangeControls(key) {
        const dates = tableCols(key).filter(c => c.type === 'date'), amounts = tableCols(key).filter(c => ['number', 'cost'].includes(c.type));
        const view = tableView(key), dr = view.dateRange || {}, ar = view.amountRange || {};
        const dc = gid('quickDateColumn'), ac = gid('quickAmountColumn');
        if (dc) dc.value = dr.col || dates[0]?.id || '';
        if (ac) ac.value = ar.col || '';
        const preset = gid('quickDatePreset');
        if (preset) preset.value = 'custom';
        if (!dr.from && !dr.to && preset) preset.value = 'all';
    }

    function localDate(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    function applyDatePreset(value) {
        const from = gid('quickDateFrom'), to = gid('quickDateTo'), now = new Date();
        let a = '', b = '';
        if (value === 'today') a = b = localDate(now);
        else if (value === 'yesterday') { const d = new Date(now); d.setDate(d.getDate() - 1); a = b = localDate(d); }
        else if (value === 'last7') { const d = new Date(now); d.setDate(d.getDate() - 6); a = localDate(d); b = localDate(now); }
        else if (value === 'month') { a = localDate(new Date(now.getFullYear(), now.getMonth(), 1)); b = localDate(now); }
        else if (value === 'lastmonth') { a = localDate(new Date(now.getFullYear(), now.getMonth() - 1, 1)); b = localDate(new Date(now.getFullYear(), now.getMonth(), 0)); }
        if (from) from.value = a;
        if (to) to.value = b;
    }

    const originalOpenFilterWithRanges = oldOpenTableFilter;
    openTableFilter = function (key) {
        originalOpenFilterWithRanges(key);
        const modal = gid('tableFilterModal');
        if (!modal) return;
        modal.querySelector('#tableSortControls')?.insertAdjacentHTML('beforebegin', rangeFields(key));
        fillRangeControls(key);
        gid('quickDatePreset')?.addEventListener('change', e => { if (e.target.value === 'all') { gid('quickDateFrom').value = ''; gid('quickDateTo').value = ''; } else if (e.target.value !== 'custom') applyDatePreset(e.target.value); });
        [gid('quickDateFrom'), gid('quickDateTo')].filter(Boolean).forEach(el => el.addEventListener('input', () => { if (gid('quickDatePreset')) gid('quickDatePreset').value = 'custom'; }));
    };

    commitTableFilter = function () {
        const d = FILTER_DRAFT, cols = tableCols(d.key);
        for (const r of d.rules || []) {
            const c = cols.find(x => x.id === r.col);
            if (!c || ['empty', 'notempty'].includes(r.op)) continue;
            const numeric = ['number', 'cost'].includes(c.type), a = numeric ? tableNumber(r.value) : r.value, b = numeric ? tableNumber(r.to) : r.to;
            if (!r.value || numeric && !Number.isFinite(a) || r.op === 'between' && (!r.to || numeric && !Number.isFinite(b) || a > b)) {
                gid('filterError').textContent = 'راجع قيم الشروط وحدود النطاق؛ البداية يجب ألا تزيد عن النهاية.'; return;
            }
            if (c.type === 'date' && !validISODate(r.value) || c.type === 'date' && r.op === 'between' && !validISODate(r.to)) {
                gid('filterError').textContent = 'أدخل تاريخاً صحيحاً لكل حدود الفترة.'; return;
            }
        }
        const dateColumn = gid('quickDateColumn')?.value || '', from = gid('quickDateFrom')?.value || '', to = gid('quickDateTo')?.value || '';
        if ((from || to) && (!dateColumn || from && !validISODate(from) || to && !validISODate(to) || from && to && from > to)) {
            gid('filterError').textContent = 'راجع الفترة: اختر عمود تاريخ صحيحاً وتأكد أن تاريخ البداية لا يتجاوز النهاية.'; return;
        }
        const amountColumn = gid('quickAmountColumn')?.value || '', minText = gid('quickAmountMin')?.value.trim() || '', maxText = gid('quickAmountMax')?.value.trim() || '';
        const min = minText ? tableNumber(minText) : '', max = maxText ? tableNumber(maxText) : '';
        if ((minText || maxText) && (!amountColumn || minText && !Number.isFinite(min) || maxText && !Number.isFinite(max) || minText && maxText && min > max)) {
            gid('filterError').textContent = 'راجع حدّي المبلغ؛ أدخل أرقاماً صحيحة واجعل قيمة «من» أقل من أو تساوي «إلى».'; return;
        }
        ss().tableViews[d.key] = { rules: d.rules || [], sort: d.sort || '', dir: d.dir || 'asc', dateRange: (from || to) ? { col: dateColumn, from, to } : null, amountRange: (minText || maxText) ? { col: amountColumn, min, max } : null };
        saveState(false);
        gid('tableFilterModal')?.remove();
        refreshTableView(d.key);
    };

    // Prevent the previous implementation from dropping the quick range on a reset.
    window.resetTableView = resetTableView;

    function normalizePhone(value) {
        let n = String(value || '').replace(/[^\d]/g, '');
        if (n.startsWith('00')) n = n.slice(2);
        if (n.startsWith('0')) n = '20' + n.slice(1);
        if (n.length < 10 || n.length > 15) return '';
        return n;
    }

    let pendingWhatsAppPDF = null;
    function startWhatsAppPDF(phone, text, openPdf) {
        if (appState.isLocked) return permDeny();
        const normalized = normalizePhone(phone);
        if (!normalized) return showToast('أضف رقم هاتف صحيحاً بصيغة دولية في بيانات العميل أو المورد أولاً.', 'warning');
        pendingWhatsAppPDF = { phone: normalized, text };
        openPdf();
        const cancel = gid('pdfOptionsModal')?.querySelector('button');
        if (cancel) cancel.onclick = () => { pendingWhatsAppPDF = null; gid('pdfOptionsModal')?.remove(); };
    }

    window.sendInvoiceWhatsApp = function (orderId) {
        if (!can('inv_print')) return permDeny();
        const order = appState.orders.find(o => o.id === orderId), client = appState.clients.find(c => c.id === order?.clientId);
        if (!order || !client) return showToast('الفاتورة غير مرتبطة بعميل مسجل؛ أضف العميل ورقم هاتفه لإرسالها.', 'warning');
        startWhatsAppPDF(client.phone, `السلام عليكم ${client.name}، مرفق فاتورة رقم ${order.orderNo || ''} من ${ss().name || 'الحمد برنت'}. إجمالي الفاتورة ${formatCurrency(order.total)}، والمتبقي ${formatCurrency(orderRemaining(order))}.`, () => { previewInvoice(orderId); openDocumentPDF('invoice'); });
    };

    window.sendPartyStatementWhatsApp = function (type, id) {
        const isClient = type === 'client', permission = isClient ? 'cli_statement' : 'sup_statement';
        if (!can(permission)) return permDeny();
        const party = (isClient ? appState.clients : appState.suppliers).find(x => x.id === id);
        if (!party) return showToast('تعذر العثور على الحساب المحدد.', 'warning');
        const balance = isClient ? getClientBalance(id) : getSupplierBalance(id);
        const text = `السلام عليكم ${party.name}، مرفق كشف حسابك من ${ss().name || 'الحمد برنت'}، الرصيد الحالي ${formatCurrency(balance)}.`;
        startWhatsAppPDF(party.phone, text, () => { viewStatement(type, id); openDocumentPDF('statement'); });
    };

    const originalOpenDocumentPDF = openDocumentPDF;
    openDocumentPDF = function (...args) {
        const result = originalOpenDocumentPDF(...args);
        const modal = gid('pdfOptionsModal');
        if (modal && pendingWhatsAppPDF) {
            const cancel = modal.querySelector('section > div.flex.justify-end button');
            if (cancel) cancel.onclick = () => { pendingWhatsAppPDF = null; modal.remove(); };
        }
        return result;
    };

    const originalCommitDocumentPDF = commitDocumentPDF;
    commitDocumentPDF = async function (...args) {
        const result = await originalCommitDocumentPDF(...args);
        if (!pendingWhatsAppPDF) return result;
        if (result?.canceled) { pendingWhatsAppPDF = null; return result; }
        if (!result?.ok) return result;
        const pending = pendingWhatsAppPDF; pendingWhatsAppPDF = null;
        try {
            const opened = await window.api.openWhatsApp({ phone: pending.phone, text: pending.text, filePath: result.path });
            if (!opened?.ok) throw new Error(opened?.error || 'تعذر فتح واتساب');
            showToast('تم فتح محادثة واتساب وإظهار ملف PDF؛ أرفق الملف الظاهر في المحادثة ثم أرسله.', 'success');
        } catch (error) {
            showToast('تم حفظ PDF، لكن تعذر فتح واتساب: ' + error.message, 'warning');
        }
        return result;
    };

    function calculatorMarkup() {
        return `<section id="view-digitalcalc" class="tab-view hidden space-y-5">
          <div class="rounded-2xl p-6 text-white shadow-lg" style="background:linear-gradient(135deg,#0f172a,#164e63)">
            <div class="flex items-center gap-3"><span class="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl"><i class="fa-solid fa-calculator"></i></span><div><h2 class="text-xl font-black">حاسبة المطبوعات</h2><p class="text-sm text-slate-300 mt-1">احسب استغلال ربع 32 × 48 سم والتكلفة على كمية الطلب.</p></div></div>
          </div>
          <div class="grid xl:grid-cols-5 gap-5">
            <div class="xl:col-span-3 rounded-2xl border p-5 space-y-4 bg-white dark:bg-slate-800 dark:border-slate-700">
              <div class="grid sm:grid-cols-2 gap-3">
                <label class="text-sm font-bold">عرض القطعة (سم)<input id="dcWidth" type="number" min="0.1" step="0.1" value="10" class="mt-1 w-full border rounded-xl p-3" oninput="calculateDigitalPrint()"></label>
                <label class="text-sm font-bold">طول القطعة (سم)<input id="dcHeight" type="number" min="0.1" step="0.1" value="15" class="mt-1 w-full border rounded-xl p-3" oninput="calculateDigitalPrint()"></label>
                <label class="text-sm font-bold">الكمية المطلوبة<input id="dcQty" type="number" min="1" step="1" value="100" class="mt-1 w-full border rounded-xl p-3" oninput="calculateDigitalPrint()"></label>
                <label class="text-sm font-bold">سعر الربع 32 × 48 سم (ج.م)<input id="dcQuarterPrice" type="number" min="0" step="0.01" class="mt-1 w-full border rounded-xl p-3" oninput="calculateDigitalPrint()" onchange="saveDigitalPrintPrice()"></label>
                <label class="text-sm font-bold">المسافة بين القطع (سم)<input id="dcGap" type="number" min="0" step="0.1" value="0" class="mt-1 w-full border rounded-xl p-3" oninput="calculateDigitalPrint()"></label>
                <label class="text-sm font-bold">تكلفة تشطيب للقطعة (ج.م)<input id="dcFinish" type="number" min="0" step="0.01" value="0" class="mt-1 w-full border rounded-xl p-3" oninput="calculateDigitalPrint()"></label>
                <label class="text-sm font-bold sm:col-span-2">تكلفة تجهيز ثابتة للطلب (ج.م)<input id="dcSetup" type="number" min="0" step="0.01" value="0" class="mt-1 w-full border rounded-xl p-3" oninput="calculateDigitalPrint()"></label>
              </div>
              <div class="flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-xs text-slate-500"><span>البرنامج يجرب الاتجاهين ويختار الأكثر استغلالاً. أدخل فاصل القطع إن كان مطلوباً في شغلك.</span></div>
            </div>
            <div class="xl:col-span-2 rounded-2xl border p-5 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 space-y-3">
              <h3 class="font-black text-lg">نتيجة الحساب</h3>
              <div class="grid grid-cols-2 gap-3"><div class="rounded-xl border bg-white dark:bg-slate-700 dark:border-slate-600 p-3"><small class="text-slate-500">عدد القطع في الربع</small><div id="dcFit" class="font-black text-2xl mt-1">—</div></div><div class="rounded-xl border bg-white dark:bg-slate-700 dark:border-slate-600 p-3"><small class="text-slate-500">عدد الأرباع المطلوبة</small><div id="dcSheets" class="font-black text-2xl mt-1">—</div></div></div>
              <div class="rounded-xl border bg-white dark:bg-slate-700 dark:border-slate-600 p-3"><small class="text-slate-500">أفضل اتجاه للرص</small><div id="dcLayout" class="font-bold mt-1">—</div></div>
              <div class="rounded-xl border p-4 space-y-2" style="background:#1e293b;color:#fff"><div class="flex justify-between gap-2"><span>تكلفة الطباعة</span><b id="dcPrintCost">—</b></div><div class="flex justify-between gap-2"><span>التشطيب والتجهيز</span><b id="dcExtraCost">—</b></div><div class="flex justify-between gap-2 border-t border-slate-500 pt-2 text-amber-300"><span>الإجمالي التقديري</span><b id="dcTotal" class="text-xl">—</b></div><div class="flex justify-between gap-2 text-slate-300"><span>تكلفة القطعة</span><b id="dcUnitCost">—</b></div></div>
              <p id="dcMessage" class="text-xs text-rose-700"></p>
            </div>
          </div>
          <p class="text-xs text-slate-500 p-3 border rounded-xl">الحساب تقديري على أرباع كاملة بسعر ثابت لكل ربع، ولا يشمل هالك الطباعة أو هوامش ماكينة غير مدخلة. راجع البروفة والمقاس الفعلي قبل اعتماد عرض السعر.</p>
        </section>`;
    }

    window.calculateDigitalPrint = function () {
        const width = Number(gid('dcWidth')?.value), height = Number(gid('dcHeight')?.value), qty = Math.floor(Number(gid('dcQty')?.value)), price = Number(gid('dcQuarterPrice')?.value), gap = Number(gid('dcGap')?.value || 0), finish = Number(gid('dcFinish')?.value || 0), setup = Number(gid('dcSetup')?.value || 0);
        const out = id => gid(id);
        const fmt = n => Number.isFinite(n) ? formatCurrency(n) : '—';
        if (!(width > 0 && height > 0 && qty > 0 && price > 0) || [width, height, qty, price, gap, finish, setup].some(n => !Number.isFinite(n) || n < 0)) {
            ['dcFit','dcSheets','dcLayout','dcPrintCost','dcExtraCost','dcTotal','dcUnitCost'].forEach(id => { if (out(id)) out(id).textContent = '—'; });
            if (out('dcMessage')) out('dcMessage').textContent = 'أدخل المقاس والكمية وسعر الربع بقيم أكبر من صفر.';
            return;
        }
        const fit = (w, h) => Math.floor((32 + gap + 1e-9) / (w + gap)) * Math.floor((48 + gap + 1e-9) / (h + gap));
        const normal = fit(width, height), rotated = fit(height, width), perQuarter = Math.max(normal, rotated);
        if (!perQuarter) {
            ['dcFit','dcSheets','dcLayout','dcPrintCost','dcExtraCost','dcTotal','dcUnitCost'].forEach(id => { if (out(id)) out(id).textContent = '—'; });
            if (out('dcMessage')) out('dcMessage').textContent = 'مقاس القطعة أكبر من مساحة الربع حتى بعد تدويرها.';
            return;
        }
        const quarters = Math.ceil(qty / perQuarter), printCost = quarters * price, extra = qty * finish + setup, total = printCost + extra;
        out('dcFit').textContent = perQuarter.toLocaleString('ar-EG');
        out('dcSheets').textContent = quarters.toLocaleString('ar-EG');
        out('dcLayout').textContent = rotated > normal ? 'بعد تدوير القطعة 90°' : normal > rotated ? 'بالمقاس الأصلي' : 'المقاسان يعطيان نفس العدد';
        out('dcPrintCost').textContent = fmt(printCost);
        out('dcExtraCost').textContent = fmt(extra);
        out('dcTotal').textContent = fmt(total);
        out('dcUnitCost').textContent = fmt(total / qty);
        if (out('dcMessage')) out('dcMessage').textContent = '';
    };

    window.saveDigitalPrintPrice = function () {
        const price = Number(gid('dcQuarterPrice')?.value);
        if (!Number.isFinite(price) || price < 0) return showToast('أدخل سعراً صحيحاً للربع.', 'warning');
        ss().digitalQuarterPrice = price;
        saveState(false);
        showToast('تم حفظ سعر الربع للاستخدام القادم.', 'success');
    };

    window.resetDigitalPrintCalculator = function () {
        gid('dcWidth').value = '10'; gid('dcHeight').value = '15'; gid('dcQty').value = '100'; gid('dcGap').value = '0'; gid('dcFinish').value = '0'; gid('dcSetup').value = '0';
        calculateDigitalPrint();
    };

    function installDigitalCalculator() {
        if (gid('view-digitalcalc')) return;
        const settingsButton = document.querySelector('.nav-btn[data-tab="settings"]');
        if (settingsButton) {
            const nav = document.createElement('button'); nav.type = 'button'; nav.className = settingsButton.className; nav.classList.remove('hidden'); nav.dataset.tab = 'digitalcalc'; nav.dataset.tip = 'حاسبة المطبوعات'; nav.setAttribute('aria-label', 'حاسبة المطبوعات'); nav.onclick = () => switchTab('digitalcalc');
            nav.innerHTML = '<i class="fa-solid fa-calculator w-5 text-center text-amber-400"></i><span class="sb-label">حاسبة المطبوعات</span>';
            settingsButton.before(nav);
        }
        const settingsView = gid('view-settings');
        if (settingsView) settingsView.insertAdjacentHTML('beforebegin', calculatorMarkup());
        const titleBefore = document.getElementById('pageTitle')?.textContent || '';
        const subBefore = document.getElementById('pageSubtitle')?.textContent || '';
        const originalSwitch = switchTab;
        switchTab = function (tabId) {
            const result = originalSwitch(tabId);
            if (tabId === 'digitalcalc') {
                gid('pageTitle').textContent = 'حاسبة المطبوعات';
                gid('pageSubtitle').textContent = 'استغلال مساحة الربع 32 × 48 سم وتقدير التكلفة';
                if (gid('dcQuarterPrice')) {
                    const saved = ss().digitalQuarterPrice;
                    if (saved != null && gid('dcQuarterPrice').dataset.initialized !== '1') gid('dcQuarterPrice').value = saved;
                    gid('dcQuarterPrice').dataset.initialized = '1';
                    calculateDigitalPrint();
                }
            } else if (tabId !== 'settings' && titleBefore && !document.getElementById('view-' + tabId)?.classList.contains('hidden')) {
                // The core switchTab has already set the right title for regular sections.
                void subBefore;
            }
            return result;
        };
        if (gid('dcQuarterPrice')) {
            const saved = ss().digitalQuarterPrice;
            gid('dcQuarterPrice').value = saved == null ? '' : saved;
            calculateDigitalPrint();
        }
    }

    function installWhenReady() {
        installDigitalCalculator();
        // All WhatsApp controls are rendered from their stable record IDs in index.html.
    }
    window.addEventListener('DOMContentLoaded', installWhenReady);
})();
