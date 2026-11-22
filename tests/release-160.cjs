const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');

test('6.0.0 project metadata and installer configuration are updated consistently', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.version, '7.0.2');
  assert.equal(pkg.build.directories.output, 'dist-v7.0.2');
  assert.equal(pkg.build.nsis.artifactName, 'Alhamd-Print-Setup-7.0.2.exe');
  assert.ok(read('app/index.html').includes('release-160.js'));
});

test('unified page size control provides single joined field with datalist and quick selection', () => {
  const s = read('app/desktop-ui.js');
  assert.match(s, /PageSizeManual/);
  assert.match(s, /PageSizeList/);
  assert.match(s, /PageSize/);
  assert.match(s, /inline-flex items-center rounded-xl/);
  assert.match(s, /saved>=1&&saved<=10000/);
  assert.match(s, /size<1\|\|size>10000/);
  for (const n of [25, 50, 100, 200, 500]) {
    assert.ok(s.includes(String(n)));
  }
});

test('item line discount selector is embedded seamlessly inside discount input field', () => {
  const html = read('app/index.html');
  assert.match(html, /sl-disc[^>]*border-0/);
  assert.match(html, /sl-dtype[^>]*border-r/);
  assert.match(html, /id="saleDiscount"[^>]*border-0/);
  assert.match(html, /id="saleDiscType"[^>]*border-r/);
});

test('item line net is editable and recalculates unit price backwards with catalog autofill preserved', () => {
  const html = read('app/index.html');
  const js = read('app/release-160.js');
  assert.match(html, /<input type="number" min="0" step="any" placeholder="0.00" class="sl-amount/);
  assert.match(html, /oninput="window\.onSaleLineNetInput\?\.\(this\)"/);
  assert.match(js, /window\.onSaleLineNetInput/);
  assert.match(js, /priceInput\.value/);
  assert.match(js, /targetNet/);
});

test('action columns are controlled from visible columns, not privacy mode', () => {
  const html = read('app/index.html');
  const f147 = read('app/features-147.js');
  for (const k of [
    'treasury', 'treasuryIn', 'treasuryOut', 'treasuryWallets', 'treasuryBtn',
    'treasuryTableAmounts', 'colOrderTotal', 'colOrderPaid',
    'colOrderRemaining', 'colOrderDiscount', 'colOrderQty', 'colClientPhone',
    'colClientAddress', 'colItemSellPrice', 'colItemQty', 'colPurchaseAmounts',
    'colServiceAmounts', 'colQuoteTotal'
  ]) {
    assert.ok(html.includes(`k: '${k}'`), `Privacy key ${k} must be present`);
  }
  assert.match(html, /id="btnNewTreasuryTransaction"/);
  assert.doesNotMatch(html, /k: 'colOrderActions'|k: 'colInventoryActions'|k: 'colPartyActions'|k: 'treasuryTableActions'/);
  assert.match(html, /filter\(x => x\)/);
  assert.match(html, /hid\.has\(label\)/);
  assert.match(f147, /privHidden\('treasuryBtn'\)/);
  assert.match(f147, /privHidden\('treasuryWallets'\)/);
});

test('notifications and sounds tab provides master controls, live KPIs, 16 events, 12 tones, and date/time clarity controls without $ ReferenceError', () => {
  const js = read('app/release-160.js');
  const prod = read('app/productivity-152.js');
  const events = [
    'login', 'lock', 'invoice', 'delivery', 'statusChange', 'quote',
    'cashIn', 'cashOut', 'purchase', 'inventory', 'lowStock', 'contactAdd',
    'backup', 'notify', 'delete', 'error'
  ];
  events.forEach(ev => {
    assert.ok(js.includes(`'${ev}'`), `Event ${ev} must be configured`);
  });

  const tones = [
    'classic_chime', 'success_chord', 'cash_register', 'delivery_uplift',
    'crystal_bell', 'marimba_pluck', 'modern_pulse', 'ambient_gong',
    'subtle_pop', 'caution_pulse', 'confirm_deep', 'metallic_chime'
  ];
  tones.forEach(t => {
    assert.ok(js.includes(`'${t}'`), `Tone ${t} must be implemented`);
  });

  // 1. No inline $('...') in oninput/onchange and clean title without "المتقدم (الإصدار 3.0)"
  assert.doesNotMatch(js, /oninput="\$\(/);
  assert.match(js, /<span>مركز الإشعارات والأصوات<\/span>/);
  assert.doesNotMatch(js, /مركز الإشعارات والأصوات المتقدم/);
  assert.doesNotMatch(prod, /إعدادات مركز الإشعارات والتنبيهات المتقدمة/);

  assert.match(js, /sound160SetMaster/);
  assert.match(js, /sound160SetVolume/);
  assert.match(js, /sound160SetProfile/);
  assert.match(js, /sound160SetToastPosition/);
  assert.match(js, /sound160SetToastDuration/);

  assert.match(prod, /noticeShowDateTimeToggle161/);
  assert.match(prod, /noticeTimeModeSelect161/);
  assert.match(prod, /noticeClarityDuration161/);
  assert.match(prod, /noticeClarityFromDate161/);
  assert.match(prod, /formatNoticeTimestamp161/);
  assert.match(prod, /isNoticeWithinClarityWindow161/);
});

test('3.6.0 requirements: full image export, deduplicated invoice modal buttons, Light DOM statement preview, IP-only LAN URL, treasury party due auto-fill & تنزيل دفعة, no auto-opening LAN modal, and clean backup restore', () => {
  const html = read('app/index.html');
  const s150 = read('app/settlement-150.js');
  const r160 = read('app/release-160.js');
  const lanUi = read('app/lan-sync-ui.js');
  const stmtDoc = read('app/statement-document.js');
  const studio150 = read('app/studio-150.js');
  const mainCjs = read('app/main.cjs');

  // 3. Full-height image rasterization without clipping
  assert.match(r160, /dstNode\.style\.maxHeight = 'none'/);
  assert.match(r160, /dstNode\.style\.overflow = 'visible'/);

  // 4. Deduplicated buttons in #modalPrintInvoice
  assert.match(studio150, /#modalPrintInvoice,#statementDocumentPreview,#invQuickExportBar160/);

  // 5. v3.2.0: Direct save is cancelled; OS file/folder save dialogs are used
  assert.match(mainCjs, /dialog\.showSaveDialog/);
  assert.match(mainCjs, /dialog\.showOpenDialog/);
  assert.match(r160, /window\.saveFileWithDialog32/);
  // v3.2.0: Action buttons are clear icons (.act-icon-btn), recent orders has التاريخ & إجراءات + privacy mode, and sidebar pinning is configurable in logo tab
  assert.match(html, /\.act-icon-btn/);
  assert.match(html, /function renderOrderActionButtons32/);
  assert.doesNotMatch(html, /\{ k: 'colOrderDate'/);
  assert.match(html, /filter\(x => x\)/);
  assert.match(html, /sidebarPinMode/);
  assert.match(html, /sidebarPinModeControl32/);

  // 6. Statement preview in Light DOM matching main invoice styling (no attachShadow)
  assert.doesNotMatch(studio150, /attachShadow/);
  assert.match(stmtDoc, /id="statementInvoiceSheet"/);

  // 7 & 10. LAN UI generates IP URL (never file://) and never re-opens closed modal on timer
  assert.match(lanUi, /getLanIpUrl/);
  assert.doesNotMatch(lanUi, /location\.pathname/);
  assert.doesNotMatch(lanUi, /if\(rem<=0\)\{open\(true\);return;\}/);

  // 8 & 9. Treasury due amount auto-fill and "تنزيل دفعة" option
  assert.match(s150, /updatePartyDueAmountField/);
  assert.match(s150, /__installment__/);
  assert.match(s150, /تنزيل دفعة/);

  // 11. Backup restore normalization and safe snapshot handling
  assert.match(r160, /normalizeAndPrepareBackupPayload31/);
  assert.match(html, /normalizeAndPrepareBackupPayload31/);
});

test("1.5.3 business-tools-143.js guards rgba and paintLowStock against non-string MutationObserver arguments", () => {
  const b143 = read("app/business-tools-143.js");
  assert.match(b143, /typeof hex==="string"/);
  assert.match(b143, /requestAnimationFrame\(\(\)=>paintLowStock\(\)\)/);
  assert.match(b143, /new MutationObserver\(\(\)=>paintLowStock\(\)\)/);
});
