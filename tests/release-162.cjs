'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');

function createRelease162Sandbox() {
  const elements = new Map();
  const makeEl = (id = '', tag = 'div') => {
    const el = {
      id,
      tagName: String(tag || 'DIV').toUpperCase(),
      nodeType: 1,
      className: '',
      innerHTML: '',
      textContent: '',
      innerText: '',
      value: '',
      title: '',
      dataset: {},
      children: [],
      options: [],
      parentElement: null,
      offsetParent: {},
      style: {
        _props: {},
        setProperty(k, v) { this._props[k] = v; this[k] = v; },
        removeProperty(k) { delete this._props[k]; delete this[k]; },
        getPropertyValue(k) { return this._props[k] || ''; }
      },
      classList: {
        _set: new Set(),
        add(...cls) { cls.forEach(c => this._set.add(c)); },
        remove(...cls) { cls.forEach(c => this._set.delete(c)); },
        toggle(c, force) {
          const on = force === undefined ? !this._set.has(c) : !!force;
          if (on) this._set.add(c); else this._set.delete(c);
          return on;
        },
        contains(c) { return this._set.has(c); }
      },
      setAttribute(k, v) { this[k] = v; if (k.startsWith('data-')) this.dataset[k.slice(5)] = v; },
      removeAttribute(k) { delete this[k]; },
      getAttribute(k) { return this[k] || null; },
      hasAttribute(k) { return k in this; },
      appendChild(ch) {
        if (ch) {
          ch.parentElement = el;
          this.children.push(ch);
          if (ch.tagName === 'OPTION') this.options.push(ch);
          if (ch.id) elements.set(ch.id, ch);
        }
        return ch;
      },
      prepend(ch) {
        if (ch) {
          ch.parentElement = el;
          this.children.unshift(ch);
          if (ch.id) elements.set(ch.id, ch);
        }
      },
      insertBefore(ch, ref) {
        if (!ch) return ch;
        ch.parentElement = el;
        const ix = this.children.indexOf(ref);
        if (ix >= 0) this.children.splice(ix, 0, ch);
        else this.children.push(ch);
        if (ch.id) elements.set(ch.id, ch);
        return ch;
      },
      after(ch) {
        if (ch && ch.id) elements.set(ch.id, ch);
      },
      replaceChildren() {
        this.children = [];
        this.options = [];
      },
      remove() {
        if (this.id) elements.delete(this.id);
      },
      focus() {},
      blur() {},
      scrollIntoView() {},
      dispatchEvent() {},
      addEventListener() {},
      closest(sel) {
        if (sel.includes('#sideSafeBalanceCard162') || sel.includes('div.p-3')) return this.parentElement;
        return null;
      },
      matches() { return false; },
      querySelector(sel) {
        if (sel.startsWith('#')) return elements.get(sel.slice(1)) || null;
        return null;
      },
      querySelectorAll() { return []; },
      getBoundingClientRect() { return { left: 100, top: 100, right: 500, bottom: 400, width: 400, height: 300 }; }
    };
    if (id) elements.set(id, el);
    return el;
  };

  // Pre-populate essential DOM nodes
  const sideCard = makeEl('sideSafeBalanceCard162', 'div');
  const sideBal = makeEl('sideSafeBalance', 'div');
  sideCard.appendChild(sideBal);

  const transClientDiv = makeEl('transClientDiv', 'div');
  const transClientSelect = makeEl('transClientSelect', 'select');
  transClientDiv.appendChild(transClientSelect);

  const transSupplierDiv = makeEl('transSupplierDiv', 'div');
  const transSupplierSelect = makeEl('transSupplierSelect', 'select');
  transSupplierDiv.appendChild(transSupplierSelect);

  const transAmountWrap = makeEl('transAmountWrap', 'div');
  const transAmount = makeEl('transAmount', 'input');
  transAmountWrap.appendChild(transAmount);

  makeEl('transType', 'select').value = 'collection';
  makeEl('transNotes', 'input');
  makeEl('transInvoice150', 'select');
  makeEl('orderClientSelect', 'select');
  makeEl('purchaseSupplierSelect', 'select');
  makeEl('purchaseItemSelect', 'select');
  makeEl('orderDeductItemSelect', 'select');
  makeEl('saleItemsList', 'datalist');
  makeEl('view-treasury', 'section');
  makeEl('dtBox', 'div');
  makeEl('clientsTableBodyTools', 'div');
  makeEl('suppliersTableBodyTools', 'div');
  makeEl('inventoryTableBodyTools', 'div');
  makeEl('ordersTableBodyTools', 'div');

  // Invoice preview & settings DOM nodes for testing Requirements 7, 8, 9
  const printArea = makeEl('printArea', 'div');
  const invLogoContainer = makeEl('invLogoContainer', 'div');
  const invHeaderShopName = makeEl('invHeaderShopName', 'h2');
  const invHeaderSubTitle = makeEl('invHeaderSubTitle', 'p');
  const invHeaderPhones = makeEl('invHeaderPhones', 'p');
  const invHeaderAddress = makeEl('invHeaderAddress', 'p');
  const invHeaderExtraInfo = makeEl('invHeaderExtraInfo', 'p');
  const invTitleBadge = makeEl('invTitleBadge', 'div');
  const invTermsText = makeEl('invTermsText', 'div');
  const invLinesBody = makeEl('invLinesBody', 'tbody');
  const trSample = makeEl('', 'tr');
  trSample.style.backgroundColor = '#ffffff';
  const tdSample = makeEl('', 'td');
  tdSample.style.backgroundColor = '#ffffff';
  trSample.appendChild(tdSample);
  invLinesBody.appendChild(trSample);
  printArea.appendChild(invLogoContainer);
  printArea.appendChild(invHeaderShopName);
  printArea.appendChild(invHeaderSubTitle);
  printArea.appendChild(invHeaderPhones);
  printArea.appendChild(invHeaderAddress);
  printArea.appendChild(invHeaderExtraInfo);
  printArea.appendChild(invTitleBadge);
  printArea.appendChild(invTermsText);
  printArea.appendChild(invLinesBody);

  makeEl('invLogoLivePreview162', 'div');
  makeEl('invTitle', 'input');
  makeEl('invCustomTitleInput162', 'input');
  makeEl('invQuoteTitle162', 'input');
  makeEl('invShopName162', 'input');
  makeEl('invShopSubTitle162', 'input');
  makeEl('invShopPhone1_162', 'input');
  makeEl('invShopPhone2_162', 'input');
  makeEl('invShopAddress162', 'input');
  makeEl('invShopExtraInfo162', 'input');
  makeEl('invShopTerms162', 'textarea');
  makeEl('settingShopName', 'input');
  makeEl('settingShopSubTitle', 'input');
  makeEl('settingShopPhone1', 'input');
  makeEl('settingShopPhone2', 'input');
  makeEl('settingShopAddress', 'input');
  makeEl('settingShopTerms', 'textarea');

  const modalClient = makeEl('modalClient', 'div');
  modalClient.classList.add('app-dialog144', 'hidden');
  const modalClientCard = makeEl('', 'div');
  const modalClientHead = makeEl('', 'div');
  modalClientCard.appendChild(modalClientHead);
  modalClient.appendChild(modalClientCard);

  const modalPurchase = makeEl('modalPurchase', 'div');
  modalPurchase.classList.add('app-dialog144', 'hidden');
  const modalPurchaseCard = makeEl('', 'div');
  const modalPurchaseHead = makeEl('', 'div');
  modalPurchaseCard.appendChild(modalPurchaseHead);
  modalPurchase.appendChild(modalPurchaseCard);

  const modalSupplier = makeEl('modalSupplier', 'div');
  modalSupplier.classList.add('app-dialog144', 'hidden');
  const modalSupplierCard = makeEl('', 'div');
  const modalSupplierHead = makeEl('', 'div');
  modalSupplierCard.appendChild(modalSupplierHead);
  modalSupplier.appendChild(modalSupplierCard);

  const storage = new Map();
  const appState = {
    isLocked: false,
    shopSettings: {
      ui: {
        theme: 'light',
        fontScale: 110,
        density: 'compact',
        radius: 'round',
        thBg: '#0d9488',
        thText: '#ffffff',
        mhBg: '#1e293b',
        mhText: '#f8fafc',
        logoFrameFit: 'cover',
        logoFrameScale: 120,
        surfaceStyles147: {
          cardBg: '#ffffff',
          inputBg: '#f8fafc',
          zebraRows: true
        }
      }
    },
    clients: [
      { id: 'c_1', name: 'ياسر محمود', phone: '01011111111', initialBalance: 1500 },
      { id: 'c_2', name: 'أحمد عبد الرحمن', phone: '01022222222', initialBalance: 600 },
      { id: 'c_3', name: 'باسم سعيد', phone: '01033333333', initialBalance: 0 }
    ],
    suppliers: [
      { id: 's_1', name: 'مؤسسة النور للورق', phone: '01111111111', balance: 2400 },
      { id: 's_2', name: 'أبناء الدلتا للأحبار', phone: '01122222222', balance: 800 }
    ],
    items: [
      { id: 'i_1', name: 'ورق كوشيه 300 جرام', qty: 50, unit: 'رزمة', sellPrice: 900 },
      { id: 'i_2', name: 'أحبار سبلميشن أصلي', qty: 20, unit: 'لتر', sellPrice: 450 },
      { id: 'i_3', name: 'بنر خارجي ثقيل', qty: 100, unit: 'متر', sellPrice: 85 }
    ],
    serviceCatalog: [
      { id: 'sc_1', name: 'ورنيش UV', unit: 'فرخ', price: 15 },
      { id: 'sc_2', name: 'أعمال تصميم شعارات', unit: 'تصميم', price: 350 }
    ],
    orders: [
      { id: 'o_101', orderNo: '1001', clientId: 'c_1', clientName: 'ياسر محمود', date: '2026-11-04', total: 1000, paid: 300, status: 'قيد التنفيذ' }
    ],
    purchases: [
      { id: 'PUR-1001', supplierId: 's_1', supplierName: 'مؤسسة النور للورق', itemId: 'i_1', itemName: 'ورق كوشيه 300 جرام', date: '2026-11-04', qty: 10, unitPrice: 500, total: 5000, paid: 2000, due: 3000 }
    ],
    treasury: [
      { id: 't_old', date: '2026-11-01 10:00', type: 'manual_deposit', paymentMethod: 'نقدي', inAmount: 5000, outAmount: 0, desc: 'رصيد سابق' },
      { id: 't_today_cash', date: '2026-11-04 11:00', type: 'collection', clientId: 'c_1', orderId: 'o_101', paymentMethod: 'نقدي', inAmount: 400, outAmount: 0, desc: 'تحصيل فاتورة #1001' },
      { id: 't_today_insta', date: '2026-11-04 12:30', type: 'collection', clientId: 'c_2', paymentMethod: 'إنستا باي', inAmount: 250, outAmount: 0, desc: 'تحصيل إنستا باي من أحمد' },
      { id: 't_today_wallet', date: '2026-11-04 13:15', type: 'expense', paymentMethod: 'فودافون كاش', inAmount: 0, outAmount: 150, desc: 'مصروف شحن' }
    ],
    services: [
      { id: 'SRV-1001', date: '2026-11-04', kind: 'provided', partyType: 'client', partyId: 'c_1', partyName: 'ياسر محمود', title: 'تصميم خاص', amount: 300, paid: 100 }
    ],
    adjustments: []
  };

  let lastEditedOrderId = null;
  let lastEditedPurchaseId = null;
  let lastEditedServiceId = null;
  let lastPreviewedInvoiceId = null;
  let currentTab = 'dashboard';

  const docHead = makeEl('head', 'head');
  const docBody = makeEl('body', 'body');

  const sandbox = {
    window: null,
    document: {
      readyState: 'complete',
      documentElement: { dataset: {}, style: makeEl().style },
      head: docHead,
      body: docBody,
      getElementById: id => elements.get(id) || null,
      createElement: tag => makeEl('', tag),
      querySelector: sel => {
        if (sel.startsWith('#')) return elements.get(sel.slice(1)) || null;
        return null;
      },
      querySelectorAll: () => [],
      addEventListener() {}
    },
    localStorage: {
      getItem: k => storage.get(k) || null,
      setItem: (k, v) => storage.set(k, String(v)),
      removeItem: k => storage.delete(k)
    },
    Intl,
    Math,
    Number,
    String,
    Object,
    Array,
    Set,
    Map,
    JSON,
    Date,
    RegExp,
    Event: class { constructor(type) { this.type = type; } },
    getComputedStyle: () => ({ display: 'block', direction: 'rtl' }),
    setTimeout: fn => { try { fn(); } catch {} return 1; },
    clearTimeout: () => {},
    appState,
    ss: () => appState.shopSettings,
    uiCfg: () => appState.shopSettings.ui,
    todayStr: () => '2026-11-04',
    formatCurrency: n => `${(Math.round((Number(n) || 0) * 100) / 100).toFixed(2)} ج.م`,
    saveState: () => {},
    showToast: () => {},
    can: () => true,
    switchTab: tab => { currentTab = tab; },
    setSalesRange: () => {},
    openModal: id => { elements.get(id)?.classList.remove('hidden'); },
    closeModal: id => { elements.get(id)?.classList.add('hidden'); },
    orderRemaining: o => Math.max(0, (Number(o.total) || 0) - (Number(o.paid) || 0) - 400),
    getClientBalance: id => {
      const c = appState.clients.find(x => x.id === id);
      if (!c) return 0;
      if (id === 'c_1') return 1500 + (1000 - 300 - 400) + (300 - 100); // 1500 opening + 300 order rem + 200 service rem = 2000
      if (id === 'c_2') return 600 - 250; // 600 opening - 250 unlinked receipt = 350
      return Number(c.initialBalance) || 0;
    },
    getSupplierBalance: id => {
      const s = appState.suppliers.find(x => x.id === id);
      if (!s) return 0;
      if (id === 's_1') return 2400 + 3000; // 2400 opening + 3000 purchase due = 5400
      return Number(s.balance) || 0;
    },
    editSale: id => { lastEditedOrderId = id; },
    openEditPurchase: id => { lastEditedPurchaseId = id; },
    openEditService: id => { lastEditedServiceId = id; },
    previewInvoice: id => { lastPreviewedInvoiceId = id; },
    renderOrdersTable: () => {},
    renderPurchasesTable: () => {},
    renderServicesTable: () => {},
    renderTreasuryTable: () => {},
    renderClientsTable: () => {},
    renderSuppliersTable: () => {},
    renderInventoryTable: () => {},
    renderDashboard: () => {},
    populateDropdowns: () => {},
    refreshInvoiceItemPickers: () => {},
    fillServiceParties: () => {},
    applyUi: () => {},
    stmtBuild: () => ({
      rows: [
        { seq: 0, kind: 'init', desc: 'رصيد افتتاحي' },
        { seq: 1, kind: 'order', id: 'o_101', ref: '#1001', desc: 'فاتورة مبيعات' },
        { seq: 2, kind: 'pur', id: 'PUR-1001', ref: '#PUR-1001', desc: 'فاتورة وارد' },
        { seq: 3, kind: 'service', id: 'SRV-1001', ref: '#SRV-1001', desc: 'خدمة' }
      ]
    }),
    STMT: { type: 'client', id: 'c_1' },
    getStateTrackers: () => ({
      lastEditedOrderId,
      lastEditedPurchaseId,
      lastEditedServiceId,
      lastPreviewedInvoiceId,
      currentTab
    })
  };
  sandbox.addEventListener = () => {}; sandbox.removeEventListener = () => {}; sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(read('app/release-162.js'), sandbox);
  return { sandbox, elements, appState };
}

test('Requirement 1: Moving, dragging, enlarging, and shrinking are completely disabled across all floating windows and all program sections', () => {
  const { sandbox, elements } = createRelease162Sandbox();
  const fakeWin = {
    nodeType: 1,
    tagName: 'DIV',
    dataset: {},
    classList: { contains: () => false },
    style: { setProperty(k, v) { this[k] = v; }, removeProperty(k) { delete this[k]; } },
    getBoundingClientRect: () => ({ left: 100, top: 100, right: 500, bottom: 400, width: 400, height: 300 })
  };

  // Resizing and dragging targets always resolve to null across all floating windows and program sections
  assert.equal(sandbox.Alhamd162.resolveResizableTarget(fakeWin, 103, 250), null);
  assert.equal(sandbox.Alhamd162.resolveResizableTarget(fakeWin, 497, 250), null);
  assert.equal(sandbox.Alhamd162.resolveResizableTarget(fakeWin, 104, 104), null);
  assert.equal(sandbox.Alhamd162.resolveDraggableTarget(fakeWin, { altKey: false, ctrlKey: false }), null);
  assert.equal(sandbox.Alhamd162.resolveDraggableTarget(fakeWin, { altKey: true, ctrlKey: true }), null);

  // Applying manual size or translation is rejected and keeps windows/elements at their natural layout
  assert.equal(sandbox.Alhamd162.applyElementSize(fakeWin, 'window', 650, 480), false);
  assert.equal(sandbox.Alhamd162.applyElementSize(fakeWin, 'toolbar', 220, 44), false);
  assert.equal(fakeWin.style.width, undefined);
  assert.equal(fakeWin.style.height, undefined);

  // Verify resize-145.js and productivity-152.js also disable window/sidebar/search resizing
  const r145 = read('app/resize-145.js');
  const p152 = read('app/productivity-152.js');
  assert.ok(r145.includes('function hit(e){return null;'));
  assert.ok(p152.includes('#globalSearchResizeHandle161,#headerResizePopover161'));
});

test('Requirement 2: Live Treasury Balance switches between Today and General across all payment methods and supports Daily Closing', () => {
  const { sandbox, elements, appState } = createRelease162Sandbox();

  // Today's movements: +400 cash, +250 instapay, -150 wallet => net +500
  // Previous movements: +5000 cash => General net = 5500
  const stats = sandbox.computeLiveTreasuryStats162('2026-11-04');
  assert.equal(stats.today.in, 650);
  assert.equal(stats.today.out, 150);
  assert.equal(stats.today.net, 500);
  assert.equal(stats.today.byMethod.cash.net, 400);
  assert.equal(stats.today.byMethod.instapay.net, 250);
  assert.equal(stats.today.byMethod.wallet.net, -150);

  assert.equal(stats.general.in, 5650);
  assert.equal(stats.general.out, 150);
  assert.equal(stats.general.net, 5500);

  // Switch sidebar to Today's balance
  sandbox.setLiveSafeBalanceMode162('today', false);
  assert.equal(elements.get('sideSafeBalance').textContent, '500.00 ج.م');

  // Switch sidebar to General balance
  sandbox.setLiveSafeBalanceMode162('general', false);
  assert.equal(elements.get('sideSafeBalance').textContent, '5500.00 ج.م');

  // Execute Daily Closing
  const closingRecord = sandbox.Alhamd162.saveDailyTreasuryClosing();
  assert.ok(closingRecord && closingRecord.id.startsWith('dc_'));
  assert.equal(closingRecord.todayNet, 500);
  assert.equal(closingRecord.generalNet, 5500);
  assert.equal(appState.dailyClosings162.length, 1);
  assert.equal(sandbox.computeLiveTreasuryStats162('2026-11-04').todayClosed, true);
});

test('Requirement 3: Settings master style override synchronizes table headers, font scale, density, radius, logo fit, and surface styles', () => {
  const { sandbox, elements } = createRelease162Sandbox();
  sandbox.syncAllSettingsStyles162();
  const masterStyle = elements.get('settingsMasterOverride162');
  assert.ok(masterStyle, 'settingsMasterOverride162 style tag must be injected');
  assert.match(masterStyle.textContent, /--table-head-bg:\s*#0d9488\s*!important/);
  assert.match(masterStyle.textContent, /--table-head-text:\s*#ffffff\s*!important/);
  assert.match(masterStyle.textContent, /object-fit:\s*cover\s*!important/);
  assert.match(masterStyle.textContent, /border-radius:\s*20px\s*!important/);
  assert.match(masterStyle.textContent, /padding:\s*5px 7px\s*!important/);
});

test('Requirement 4: Alphabetical sorting orders Arabic names (Clients, Suppliers, Items, Services) across all sections and dropdowns', () => {
  const { sandbox, appState } = createRelease162Sandbox();
  sandbox.Alhamd162.sortAllEntitiesAlphabetically('asc', false);

  assert.deepEqual(
    appState.clients.map(c => c.name),
    ['أحمد عبد الرحمن', 'باسم سعيد', 'ياسر محمود']
  );
  assert.deepEqual(
    appState.suppliers.map(s => s.name),
    ['أبناء الدلتا للأحبار', 'مؤسسة النور للورق']
  );
  assert.deepEqual(
    appState.items.map(i => i.name),
    ['أحبار سبلميشن أصلي', 'بنر خارجي ثقيل', 'ورق كوشيه 300 جرام']
  );
  assert.deepEqual(
    appState.serviceCatalog.map(s => s.name),
    ['أعمال تصميم شعارات', 'ورنيش UV']
  );
});

test('Requirement 5: Treasury modal searches customers/suppliers and displays owed balance including opening balance', () => {
  const { sandbox, elements } = createRelease162Sandbox();

  // Customer c_2 ('أحمد عبد الرحمن') has 600 opening balance and 250 receipt -> 350 remaining opening balance, 0 invoices
  const c2Breakdown = sandbox.getPartyFullBalanceBreakdown162('client', 'c_2');
  assert.equal(c2Breakdown.openingBalance, 600);
  assert.equal(c2Breakdown.openingRemaining, 350);
  assert.equal(c2Breakdown.invoicesRemaining, 0);
  assert.equal(c2Breakdown.totalBalance, 350);

  // Customer c_1 ('ياسر محمود') has 1500 opening balance + 300 order remaining + 200 service remaining = 2000
  const c1Breakdown = sandbox.getPartyFullBalanceBreakdown162('client', 'c_1');
  assert.equal(c1Breakdown.openingBalance, 1500);
  assert.equal(c1Breakdown.totalBalance, 2000);

  // Supplier s_1 ('مؤسسة النور للورق') has 2400 opening balance + 3000 purchase due = 5400
  const s1Breakdown = sandbox.getPartyFullBalanceBreakdown162('supplier', 's_1');
  assert.equal(s1Breakdown.openingBalance, 2400);
  assert.equal(s1Breakdown.invoicesRemaining, 3000);
  assert.equal(s1Breakdown.totalBalance, 5400);

  // Search filter in Treasury Client Select narrows options and shows opening balance in option text
  sandbox.Alhamd162.renderTreasuryPartySelectOptions('client', 'أحمد');
  const clientSelect = elements.get('transClientSelect');
  assert.match(clientSelect.innerHTML, /أحمد عبد الرحمن/);
  assert.match(clientSelect.innerHTML, /بداية التعامل: 600\.00 ج\.م/);
  assert.match(clientSelect.innerHTML, /عليه: 350\.00 ج\.م/);
});

test('Requirement 6: Clicking Open Original Document in Account Statement and across the app opens the original registered invoice/record instead of print preview', () => {
  const { sandbox, elements } = createRelease162Sandbox();

  // Opening order entry (seq = 1) in Statement must call editSale('o_101') in #view-orders and NOT previewInvoice
  sandbox.statementOpenEntry(1);
  let trackers = sandbox.getStateTrackers();
  assert.equal(trackers.currentTab, 'orders');
  assert.equal(trackers.lastEditedOrderId, 'o_101');
  assert.equal(trackers.lastPreviewedInvoiceId, null);

  // Opening purchase entry (seq = 2) in Statement must call openEditPurchase('PUR-1001') in #view-purchases
  sandbox.statementOpenEntry(2);
  trackers = sandbox.getStateTrackers();
  assert.equal(trackers.currentTab, 'purchases');
  assert.equal(trackers.lastEditedPurchaseId, 'PUR-1001');

  // Opening service entry (seq = 3) in Statement must call openEditService('SRV-1001') in #view-services
  sandbox.statementOpenEntry(3);
  trackers = sandbox.getStateTrackers();
  assert.equal(trackers.currentTab, 'services');
  assert.equal(trackers.lastEditedServiceId, 'SRV-1001');
});


test('New Requirement 1: Invoice table fills and inner section backgrounds are removed across preview, print, PDF, and image export so watermark is never obscured', () => {
  const { sandbox, elements } = createRelease162Sandbox();
  sandbox.Alhamd162.enforceInvoiceTransparentTables();

  const styleEl = elements.get('invoiceTransparentTablesStyle162');
  assert.ok(styleEl, 'invoiceTransparentTablesStyle162 style tag must be injected');
  assert.match(styleEl.textContent, /#printArea table[\s\S]*?background:\s*transparent\s*!important/);
  assert.match(styleEl.textContent, /#statementInvoiceSheet table[\s\S]*?background:\s*transparent\s*!important/);

  const invLinesBody = elements.get('invLinesBody');
  const tr = invLinesBody.children[0];
  const td = tr.children[0];
  assert.equal(tr.style.backgroundColor, 'transparent');
  assert.equal(td.style.backgroundColor, 'transparent');

  // Verify static files also enforce transparent invoice tables
  const html = read('app/index.html');
  const css150 = read('app/studio-150.css');
  const pdfSvc = read('app/pdf-service.cjs');
  const stmtDoc = read('app/statement-document.js');
  const r160 = read('app/release-160.js');

  assert.match(html, /#printArea \[data-invoice-part="lines"\],#printArea table[\s\S]*?background:transparent!important/);
  assert.match(css150, /#printArea table,#printArea thead,#printArea tbody,#printArea tfoot,#printArea tr,#printArea th,#printArea td/);
  assert.match(pdfSvc, /#printArea table,#printArea thead,#printArea tbody/);
  assert.match(stmtDoc, /preview\.querySelectorAll\('table, thead, tbody, tfoot, tr'\)/);
  assert.match(r160, /cs\.backgroundColor = 'transparent'/);
});

test('New Requirement 2: Invoice settings allow changing print shop logo shape & background (top-right of invoice), customizing invoice title, and editing print shop/business name and details', () => {
  const { sandbox, elements, appState } = createRelease162Sandbox();

  // 1. Change logo shape, background mode/color, border, size, and fit
  sandbox.Alhamd162.updateInvoiceLogoSetting('logoShape', 'circle');
  sandbox.Alhamd162.updateInvoiceLogoSetting('logoBgMode', 'color');
  sandbox.Alhamd162.updateInvoiceLogoSetting('logoBgColor', '#f0fdfa');
  sandbox.Alhamd162.updateInvoiceLogoSetting('logoSize', 84);
  sandbox.Alhamd162.updateInvoiceLogoSetting('logoFit', 'cover');

  const logoBox = elements.get('invLogoContainer');
  assert.equal(logoBox.style.borderRadius, '50%');
  assert.equal(logoBox.style.backgroundColor, '#f0fdfa');
  assert.equal(logoBox.style.width, '84px');
  assert.equal(logoBox.style.height, '84px');
  assert.equal(logoBox.dataset.logoShape162, 'circle');
  assert.equal(logoBox.dataset.logoFit162, 'cover');

  // Switch logo background to transparent
  sandbox.Alhamd162.updateInvoiceLogoSetting('logoBgMode', 'transparent');
  assert.equal(logoBox.style.backgroundColor, 'transparent');

  // 2. Customize invoice title and badge colors
  sandbox.Alhamd162.setInvoiceCustomTitle('فاتورة ضريبية مبسطة', 'عرض سعر رسمي');
  sandbox.Alhamd162.updateInvoiceLogoSetting('titleTextColor', '#fef08a');
  const titleBadge = elements.get('invTitleBadge');
  assert.equal(titleBadge.textContent, 'فاتورة ضريبية مبسطة');
  assert.equal(titleBadge.style.color, '#fef08a');

  // 3. Customize print shop / business name and details from Invoice Settings
  sandbox.Alhamd162.updateInvoiceShopIdentity('name', 'مطبعة الحمد الحديثة');
  sandbox.Alhamd162.updateInvoiceShopIdentity('subTitle', 'للطباعة الرقمية والتغليف المتطور');
  sandbox.Alhamd162.updateInvoiceShopIdentity('phone1', '01099998888');
  sandbox.Alhamd162.updateInvoiceShopIdentity('phone2', '01277776666');
  sandbox.Alhamd162.updateInvoiceShopIdentity('address', 'دمنهور - شارع الجمهورية');
  sandbox.Alhamd162.updateInvoiceShopIdentity('extraInfo', 'س.ت: 44556 - ب.ض: 99887');
  sandbox.Alhamd162.updateInvoiceShopIdentity('terms', 'التسليم بعد سداد كامل القيمة.');

  assert.equal(appState.shopSettings.name, 'مطبعة الحمد الحديثة');
  assert.equal(elements.get('invHeaderShopName').textContent, 'مطبعة الحمد الحديثة');
  assert.equal(elements.get('invHeaderSubTitle').textContent, 'للطباعة الرقمية والتغليف المتطور');
  assert.match(elements.get('invHeaderPhones').innerHTML, /01099998888/);
  assert.match(elements.get('invHeaderPhones').innerHTML, /01277776666/);
  assert.equal(elements.get('invHeaderAddress').textContent, 'المقر: دمنهور - شارع الجمهورية');
  assert.equal(elements.get('invHeaderExtraInfo').textContent, 'س.ت: 44556 - ب.ض: 99887');
  assert.equal(elements.get('invTermsText').textContent, 'التسليم بعد سداد كامل القيمة.');

  // Verify HTML markup in app/index.html includes the new cards and inputs
  const html = read('app/index.html');
  for (const id of ['invLogoSettingsCard162', 'invIdentityAndTitleCard162', 'invLogoLivePreview162', 'invLogoBgMode162', 'invLogoBgColor162', 'invCustomTitleInput162', 'invShopName162', 'invShopSubTitle162', 'invShopPhone1_162', 'invShopAddress162']) {
    assert.ok(html.includes(`id="${id}"`), `Missing ${id} in app/index.html`);
  }
});

test('New Requirement 3: All floating windows include Close (القفل/الإغلاق) and Back (الرجوع للنافذة السابقة أو القسم السابق) buttons with full history navigation', () => {
  const { sandbox, elements } = createRelease162Sandbox();

  // Decorate floating windows
  const modalClient = elements.get('modalClient');
  const modalPurchase = elements.get('modalPurchase');
  const modalSupplier = elements.get('modalSupplier');

  sandbox.Alhamd162.ensureFloatingWindowButtons(modalClient);
  sandbox.Alhamd162.ensureFloatingWindowButtons(modalPurchase);
  sandbox.Alhamd162.ensureFloatingWindowButtons(modalSupplier);

  assert.equal(modalClient.dataset.floatingControls162, '1');
  assert.equal(modalPurchase.dataset.floatingControls162, '1');
  assert.equal(modalSupplier.dataset.floatingControls162, '1');

  // Case 1: Stacked/Sequential Floating Windows (Window A -> Window B -> Back returns to Window A)
  sandbox.switchTab('purchases');
  sandbox.openModal('modalPurchase');
  assert.equal(modalPurchase.classList.contains('hidden'), false);

  // Open modalSupplier from inside modalPurchase
  sandbox.openModal('modalSupplier');
  assert.equal(modalSupplier.classList.contains('hidden'), false);

  const navRes1 = sandbox.Alhamd162.goBackFloatingWindow(modalSupplier);
  assert.equal(modalSupplier.classList.contains('hidden'), true);
  assert.equal(navRes1.action, 'window');
  assert.equal(navRes1.target, 'modalPurchase');
  assert.equal(modalPurchase.classList.contains('hidden'), false);

  // Case 2: No previous floating window -> Back closes window and returns to previous section (القسم السابق)
  const navRes2 = sandbox.Alhamd162.goBackFloatingWindow(modalPurchase);
  assert.equal(modalPurchase.classList.contains('hidden'), true);
  assert.equal(navRes2.action, 'section');
  assert.equal(navRes2.target, 'dashboard');
  assert.equal(sandbox.getStateTrackers().currentTab, 'dashboard');

  // Case 3: Close button closes floating window directly
  sandbox.openModal('modalClient');
  assert.equal(modalClient.classList.contains('hidden'), false);
  sandbox.Alhamd162.closeFloatingWindow(modalClient);
  assert.equal(modalClient.classList.contains('hidden'), true);
});


test('New Requirement 4: Moving, shrinking, and enlarging (dragging and resizing) are completely disabled for all buttons across the entire program', () => {
  const { sandbox, elements } = createRelease162Sandbox();

  const fakeBtn = {
    nodeType: 1,
    tagName: 'BUTTON',
    dataset: {},
    classList: { contains: () => false },
    style: { setProperty(k, v) { this[k] = v; }, removeProperty(k) { delete this[k]; } },
    getAttribute: () => null,
    closest: sel => (sel.includes('button') ? fakeBtn : null),
    matches: sel => sel.includes('button'),
    getBoundingClientRect: () => ({ left: 100, top: 100, right: 220, bottom: 140, width: 120, height: 40 })
  };

  // 1. Buttons must be identified as non-resizable/non-draggable controls
  assert.equal(sandbox.Alhamd162.isButtonOrControlElement(fakeBtn), true);

  // 2. Hitting any edge or corner of a button must return null (no resize cursor or resize action)
  assert.equal(sandbox.Alhamd162.resolveResizableTarget(fakeBtn, 101, 120), null);
  assert.equal(sandbox.Alhamd162.resolveResizableTarget(fakeBtn, 219, 120), null);
  assert.equal(sandbox.Alhamd162.resolveResizableTarget(fakeBtn, 101, 101), null);

  // 3. Attempting to drag/move a button (even with Alt/Ctrl) must return null
  assert.equal(sandbox.Alhamd162.resolveDraggableTarget(fakeBtn, { altKey: false, ctrlKey: false }), null);
  assert.equal(sandbox.Alhamd162.resolveDraggableTarget(fakeBtn, { altKey: true, ctrlKey: true }), null);

  // 4. Attempting to call applyElementSize on a button must be rejected and leave button dimensions untouched
  const applied = sandbox.Alhamd162.applyElementSize(fakeBtn, 'toolbar', 300, 80);
  assert.equal(applied, false);
  assert.equal(fakeBtn.style.width, undefined);
  assert.equal(fakeBtn.style.height, undefined);
});


test('New Requirement 5: All table tools buttons ([id$="Tools"]) remove (شروط .. نتيجة), bring buttons close together on a single line in one row without a bottom scrollbar, and Operations & Development buttons align on one row', () => {
  const { sandbox, elements } = createRelease162Sandbox();

  // Check static table-tools.js, business-tools.js, operations-149.js, operations-149.css, and operations-161.css
  const ttJs = read('app/table-tools.js');
  const btJs = read('app/business-tools.js');
  const opsJs = read('app/operations-149.js');
  const opsCss149 = read('app/operations-149.css');
  const opsCss = read('app/operations-161.css');

  // 1. (شروط .. نتيجة) status span is removed from all table toolbars
  assert.doesNotMatch(ttJs, /<span data-table-status/);
  assert.doesNotMatch(ttJs, /شروط.*نتيجة/);
  assert.ok(btJs.includes("[data-table-status]')?.forEach(el => el.remove())"));

  // 2. Buttons are grouped closely together on the same horizontal line in a single row without a scrollbar underneath
  assert.ok(ttJs.includes('table-tools-bar162 flex flex-nowrap justify-start'));
  assert.ok(ttJs.includes('table-tools-group162 flex flex-nowrap gap-1.5 items-center'));
  assert.doesNotMatch(ttJs, /bar\.className='no-print[^']*justify-between/);
  assert.match(opsCss, /\[id\$="Tools"\]\.no-print:not\(\.hidden\)[\s\S]*?flex-wrap:\s*nowrap\s*!important/);
  assert.match(opsCss, /\[id\$="Tools"\]\.no-print:not\(\.hidden\)[\s\S]*?justify-content:\s*flex-start\s*!important/);
  assert.match(opsCss, /\[id\$="Tools"\]\.no-print:not\(\.hidden\)[\s\S]*?overflow-x:\s*hidden\s*!important/);
  assert.match(opsCss, /\[id\$="Tools"\]\.no-print button:not\(\.hidden\)[\s\S]*?height:\s*32px\s*!important/);

  // 3. Verify runtime normalization on all table toolbars
  const ordersTools = elements.get('ordersTableBodyTools');
  sandbox.Alhamd162.normalizeSingleTableToolbar(ordersTools);
  assert.equal(ordersTools.style['flex-wrap'], 'nowrap');
  assert.equal(ordersTools.style['justify-content'], 'flex-start');
  assert.equal(ordersTools.style['overflow-x'], 'hidden');
  assert.equal(ordersTools.style['align-items'], 'center');
  assert.equal(ordersTools.style['display'], 'flex');

  // 4. Verify Operations & Development (#view-operations) buttons are aligned on a single horizontal line in one row
  assert.match(opsJs, /id="opsMainToolbar149"/);
  assert.match(opsJs, /id="opsPaneActions149" class="ops-pane-actions149"/);
  assert.match(opsJs, /function paneActions\(/);
  assert.match(opsJs, /function rowActions\(/);
  assert.ok(opsCss149.includes('.ops-tabs149{display:flex;gap:6px;align-items:center;flex-wrap:nowrap;overflow:hidden'));
  assert.ok(opsCss149.includes('.ops-toolbar149{display:flex;gap:5px;align-items:center;flex-wrap:nowrap;overflow:hidden}'));
  assert.match(opsCss, /#view-operations \.ops-tabs149:not\(\.hidden\)[\s\S]*?flex-wrap:\s*nowrap\s*!important/);
  assert.match(opsCss, /#view-operations \.ops-toolbar149:not\(\.hidden\)[\s\S]*?flex-wrap:\s*nowrap\s*!important/);
  assert.match(opsCss, /#view-operations \.ops-pane-actions149:not\(\.hidden\)[\s\S]*?flex-wrap:\s*nowrap\s*!important/);

  // Verify settingsMasterOverride162 also enforces single-row toolbar alignment without scrollbars
  const masterStyle = elements.get('settingsMasterOverride162');
  assert.match(masterStyle.textContent, /\[id\$="Tools"\]\.no-print:not\(\.hidden\)[\s\S]*?flex-wrap:\s*nowrap\s*!important/);
  assert.match(masterStyle.textContent, /overflow-x:\s*hidden\s*!important/);
});

test('New Requirement 6: The "+ فاتورة جديدة" button inside the invoices table empty state (#ordersTableBody) is removed while keeping the "عرض كل الفترات" button intact and properly styled', () => {
  const html = read('app/index.html');
  const opsCss = read('app/operations-161.css');

  // Extract renderOrdersTable empty state block from app/index.html
  const emptyBlockMatch = html.match(/if \(filtered\.length === 0\) \{[\s\S]*?return;\s*\}/);
  assert.ok(emptyBlockMatch, 'renderOrdersTable empty state block must exist');
  const emptyBlock = emptyBlockMatch[0];

  // Must NOT contain onclick="newSale()" or "+ فاتورة جديدة" inside #ordersTableBody empty state
  assert.doesNotMatch(emptyBlock, /onclick="newSale\(\)"/);
  assert.doesNotMatch(emptyBlock, /\+ فاتورة جديدة/);

  // Must KEEP onclick="setSalesRange('all')" ("عرض كل الفترات")
  assert.match(emptyBlock, /onclick="setSalesRange\('all'\)"/);
  assert.match(emptyBlock, /عرض كل الفترات/);

  // And operations-161.css must exclude [colspan] cells from the 24px action-icon grid
  assert.match(opsCss, /table td:last-child:not\(\[colspan\]\) > \.flex:not\(\.hidden\)/);
  assert.match(opsCss, /table td\[colspan\] button:not\(\.act-icon-btn\):not\(\.hidden\)/);
});


test('Precision Update 1: Header buttons on one row with smaller search & high-contrast bell (Image 1), and all 7 Dashboard KPI cards on one row (Image 2)', () => {
  const html = read('app/index.html');
  const p152Css = read('app/productivity-152.css');
  const opsCss = read('app/operations-161.css');
  const dcJs = read('app/dark-contrast-153.js');

  // 1. Header action bar and high-contrast solid bell icon
  assert.match(html, /id="topHeaderActions163"/);
  assert.match(html, /id="notificationsButton152"[\s\S]*?<i class="fa-solid fa-bell"><\/i>/);
  assert.match(p152Css, /\.global-search-wrap152\{width:clamp\(115px,13vw,150px\)!important/);
  assert.match(p152Css, /\.notifications-button152\{[\s\S]*?background:#1e293b!important;color:#fbbf24!important/);
  assert.match(opsCss, /body main > header > div:last-child[\s\S]*?flex-wrap:\s*nowrap\s*!important/);
  assert.match(opsCss, /body main > header #notificationsButton152:not\(\.hidden\)[\s\S]*?color:\s*#fbbf24\s*!important/);
  assert.match(dcJs, /body\.dark #notificationsButton152/);

  // 2. All 7 KPI cards in #dashKpiGrid163 on a single 7-column row
  assert.match(html, /id="dashKpiGrid163" class="dash-kpi-grid163 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 items-stretch"/);
  for (const id of ['dashTotalSales', 'dashClientsDue', 'dashSuppliersDue', 'dashTreasuryBalance', 'dashActiveJobs', 'dashStockBook', 'dashStockActual']) {
    assert.ok(html.includes(`id="${id}"`), `Missing KPI card ${id}`);
  }
  assert.match(opsCss, /grid-template-columns:\s*repeat\(7,\s*minmax\(0,\s*1fr\)\)\s*!important/);
});

test('Precision Update 2 & 4: Comprehensive "كل السجلات" quick filter options for every table, integrated toolbar for Operations & Development tables, and column-click filtering', () => {
  const ttJs = read('app/table-tools.js');
  const opsJs = read('app/operations-149.js');
  const bt134 = read('app/business-tools-134.js');
  const { sandbox, elements } = createRelease162Sandbox();

  // Verify all 5 Operations tables are registered in TABLE_DEFS
  for (const k of ['opsTable149_jobs', 'opsTable149_pricing', 'opsTable149_shifts', 'opsTable149_reservations', 'opsTable149_waste']) {
    assert.ok(ttJs.includes(`${k}:{title:`), `Missing ${k} in TABLE_DEFS`);
  }

  // Verify dynamic column options and rich per-table options in table-tools.js
  assert.match(ttJs, /function _appendDynamicColumnQuickOptions163/);
  assert.match(ttJs, /value\.startsWith\('col:'\)/);
  assert.match(opsJs, /tableTools\(sizeKey,toolsHost\)/);
  assert.match(opsJs, /tableApply\(sizeKey,filtered\)/);
  assert.match(bt134, /sortTableByHeader\(key,index\);updateHeaderSortIndicators\(\);/);

  // Verify column-click filter helper functions in release-162.js
  assert.equal(typeof sandbox.Alhamd162.filterTableByColumnValue, 'function');
  assert.equal(typeof sandbox.Alhamd162.filterTableByColumnSearch, 'function');
  assert.equal(typeof sandbox.Alhamd162.openColumnHeaderFilterPopover, 'function');
});

test('Precision Update 3, 5 & 6: Operations search/refresh moved to top row (Image 3), Alerts file browser & deduplicated Close/Back buttons, and New Invoice paid field containment (Image 4)', () => {
  const html = read('app/index.html');
  const opsJs = read('app/operations-149.js');
  const opsCss = read('app/operations-161.css');
  const mainCjs = read('app/main.cjs');
  const native149 = read('app/operations-native-149.cjs');
  const layout150 = read('app/layout-150.js');

  // 1. Operations top row contains #opsTabs149 + #opsTopSearchGroup149 (#opsSearch149 + #opsRefresh149)
  assert.match(opsJs, /id="opsTopRow149"[\s\S]*?id="opsTabs149"[\s\S]*?id="opsTopSearchGroup149"[\s\S]*?id="opsSearch149"[\s\S]*?id="opsRefresh149"/);
  assert.match(opsCss, /#view-operations #opsTopRow149:not\(\.hidden\)/);

  // 2. Alerts tab file attachment opens Windows file picker (native + browser fallback) and modals have no duplicate Close/Back buttons
  assert.doesNotMatch(mainCjs, /if\(!s\.isLocked&&s\.currentUser\)\{\s*authenticatedUserId=s\.currentUser/);
  assert.match(mainCjs, /if\(!sessionOk\(\)\)throw Error/);
  assert.match(native149, /!permission\(s,key\)/);
  assert.match(opsJs, /function pickOpsAttachments163/);
  assert.match(opsJs, /function pickFilesViaBrowserInput163/);
  assert.match(opsJs, /button\('إضافة ملفات',async\(\)=>\{/);
  assert.match(layout150, /const hasNativeHead=/);

  // 3. New Invoice #salePaid row and global input/button containment (Image 4)
  assert.match(html, /id="saleSummaryBox163"/);
  assert.match(html, /id="salePaidRow163"/);
  assert.match(html, /id="salePaidControls163"/);
  assert.match(opsCss, /#salesComposer #salePaid\s*\{[\s\S]*?max-width:\s*104px\s*!important/);
});

test('Precision Round 2 (1-4): Clock raised above main interface row, table toolbar buttons/selects contained inside borders, zero duplicate Back/Close buttons, and Esc key exits windows', () => {
  const html = read('app/index.html');
  const opsCss = read('app/operations-161.css');
  const layout150 = read('app/layout-150.js');
  const ttJs = read('app/table-tools.js');
  const sdJs = read('app/statement-document.js');
  const { sandbox, elements } = createRelease162Sandbox();

  // 1. Clock (#hdrClock) is raised above the main header row (order: -10, flex: 0 0 100%, horizontal layout)
  assert.match(html, /<header[\s\S]*?<div id="hdrClock"[\s\S]*?<div id="headerTitleGroup163"[\s\S]*?<div id="topHeaderActions163"/);
  assert.match(opsCss, /body main > header > #hdrClock\s*\{[\s\S]*?order:\s*-10\s*!important[\s\S]*?width:\s*fit-content\s*!important[\s\S]*?margin-right:\s*auto\s*!important/);
  assert.equal(typeof sandbox.Alhamd162.normalizeHeaderClockPosition, 'function');

  // 2. Table toolbar select & buttons are compact and flex-shrinkable so no button (including تصدير صورة) overflows the table border
  assert.match(opsCss, /\[id\$="Tools"\]\.no-print select:not\(\.hidden\)[\s\S]*?max-width:\s*118px\s*!important/);
  assert.match(opsCss, /\[id\$="Tools"\]\.no-print button:not\(\.hidden\)[\s\S]*?flex-shrink:\s*1\s*!important/);
  assert.doesNotMatch(ttJs, /فلترة متقدمة ⚙/);

  // 3. No duplicate (رجوع - إغلاق) bars in modals
  assert.match(opsCss, /:has\(\.floating-win-nav162\) > \.window-tools150:not\(\.floating-win-nav162\)/);
  assert.match(sdJs, /class="floating-win-nav162 no-print inline-flex items-center gap-1\.5 shrink-0"/);
  assert.match(layout150, /typeof window\.ensureFloatingWindowButtons162==='function'/);

  // Test ensureFloatingWindowButtons162 and Esc closing
  const modalClient = elements.get('modalClient');
  sandbox.Alhamd162.ensureFloatingWindowButtons(modalClient);
  assert.equal(modalClient.dataset.floatingControls162, '1');

  // 4. Pressing Esc (closeTopFloatingWindowOnEsc162) closes open windows/modals
  assert.equal(typeof sandbox.Alhamd162.closeTopFloatingWindowOnEsc, 'function');
  sandbox.openModal('modalClient');
  assert.equal(modalClient.classList.contains('hidden'), false);
  const closed = sandbox.Alhamd162.closeTopFloatingWindowOnEsc();
  assert.equal(closed, true);
  assert.equal(modalClient.classList.contains('hidden'), true);
});



test('Precision Round 3 (1-3): Clock rectangle compacted and moved left, floating/popup windows scaled down, and New Invoice .sale-line contained with aligned buttons', () => {
  const html = read('app/index.html');
  const opsCss = read('app/operations-161.css');
  const wsCss = read('app/workspace-148.css');
  const wsJs = read('app/workspace-148.js');
  const if144 = read('app/interface-144.js');
  const ops149Js = read('app/operations-149.js');
  const { sandbox } = createRelease162Sandbox();

  // 1. Clock (#hdrClock) has compact fit-content width and is moved to the left (mr-auto ml-0) above the main interface row
  assert.match(html, /id="hdrClock"[^>]*w-fit mr-auto ml-0/);
  assert.match(opsCss, /body main > header::before[\s\S]*?order:\s*-9\s*!important[\s\S]*?flex:\s*0 0 100%\s*!important/);
  assert.match(opsCss, /body main > header > #hdrClock\s*\{[\s\S]*?width:\s*fit-content\s*!important[\s\S]*?margin-right:\s*auto\s*!important[\s\S]*?margin-left:\s*0\s*!important/);

  // 2. Floating and popup windows have reduced compact dimensions across interface-144, operations-149, studio-150, and operations-161.css
  assert.match(if144, /'max-w-sm':340,'max-w-md':390,'max-w-lg':440,'max-w-xl':490,'max-w-2xl':560,'max-w-3xl':640/);
  assert.match(opsCss, /body \.ops-dialog149\s*\{\s*max-width:\s*min\(700px,\s*calc\(100vw - 32px\)\)\s*!important/);
  assert.equal(typeof sandbox.Alhamd162.compactFloatingWindowSize, 'function');

  // 3. New Invoice .sale-line is strictly contained inside #saleLines with zero horizontal overflow and aligned header buttons
  assert.match(wsCss, /body #saleLines\{overflow-x:hidden!important/);
  assert.match(wsCss, /html body #saleLines \.sale-line\{grid-template-columns:minmax\(0,2\.45fr\)[\s\S]*?min-width:0!important;width:100%!important;max-width:100%!important/);
  assert.match(wsJs, /function applyFieldWidths\(\)\{delete layouts\.fields;/);
  assert.match(html, /class="sl-head-row163 flex flex-nowrap items-center justify-between gap-1 mb-1 overflow-hidden"/);
  assert.match(html, /class="sl-head-actions163 inline-flex items-center gap-1 shrink-0"/);
  assert.match(ops149Js, /b\.className='spec-button149 sl-quick-btn163';const actHost=row\.firstElementChild\?\.querySelector\('div:first-child > span, \.sl-head-actions163'\)/);
  assert.equal(typeof sandbox.Alhamd162.normalizeSaleLinesLayout, 'function');
});


test('Precision Round 4 (1-4): Streamlined "كل السجلات" essential quick filters, multi-item purchase list in modalPurchase, per-invoice item expansion in Statement & Final Invoice, and column-click sort only without floating popover', () => {
  const html = read('app/index.html');
  const ttJs = read('app/table-tools.js');
  const bt134 = read('app/business-tools-134.js');
  const sv12 = read('app/statement-v12.js');
  const sdJs = read('app/statement-document.js');
  const r160 = read('app/release-160.js');
  const { sandbox } = createRelease162Sandbox();

  // 1. Streamlined "كل السجلات" quick filter options: only essential real filters, not dynamic cell dumps
  assert.doesNotMatch(ttJs, /return _appendDynamicColumnQuickOptions163\(key,opts\)/);
  assert.match(ttJs, /if\(key==='ordersTableBody'\|\|key==='dashRecentOrdersTable'\)\{\s*return \[\.\.\.common,\['due','فواتير عليها متبقي'\]/);
  assert.match(ttJs, /if\(key==='clientsTableBody'\)\{\s*return \[\.\.\.common,\['owed','عملاء عليهم مديونية'\]/);

  // 2. Multi-item purchase cart in modalPurchase (قائمة الشراء)
  assert.match(html, /id="btnAddPurchaseLine164"/);
  assert.match(html, /id="purchaseItemsListWrap164"/);
  assert.match(html, /id="purchaseItemsListBody164"/);
  assert.match(html, /window\.addPurchaseItemToList164\s*=\s*function/);
  assert.match(html, /window\.renderPurchaseItemsList164\s*=\s*function/);
  assert.match(html, /window\.updatePurchaseCartRow164\s*=\s*function/);
  assert.match(html, /window\.removePurchaseCartRow164\s*=\s*function/);
  assert.match(html, /linesToSave\.forEach\(\(line, idx\) =>/);

  // 3. Per-invoice item details in Customer Statement & Final Statement Invoice matching main invoice format
  assert.match(sv12, /window\.isStatementEntryExpanded164\s*=\s*function\(e\)/);
  assert.match(sv12, /window\.toggleStatementEntryDetails164\s*=\s*function\(seq, srcId, isOpen\)/);
  assert.match(sv12, /data-sec="itemsTable" data-invoice-part="lines" class="statement-lines stmt-detail-table/);
  assert.match(sdJs, /const showItemDetails=Boolean\(source&&\(typeof window\.isStatementEntryExpanded164==='function'\?window\.isStatementEntryExpanded164\(e\):STMT\.details===true\)\)/);
  assert.match(sdJs, /stmt-expanded-lines-row164/);
  assert.match(r160, /if \(payload\?\.kind === 'statement' \|\| payload\?\.kind\?\.startsWith\?\.\('statement-'\)\) \{\s*return \$\('statementInvoiceSheet'\) \|\| null;\s*\}/);

  // 4. Column click in any table only sorts ascending/descending without opening any floating popover
  assert.doesNotMatch(bt134, /openColumnHeaderFilterPopover163/);
  assert.match(bt134, /اضغط للترتيب تصاعدياً أو تنازلياً/);
  assert.equal(sandbox.Alhamd162.openColumnHeaderFilterPopover('ordersTableBody', 0, {}), null);
});
