const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('action columns are eligible in visible-columns panel and not privacy list',()=>{
 const html=read('app/index.html');
 assert.match(html,/const heads = \[\.\.\.t\.querySelectorAll\('thead th'\)\]\.map\(x => x\.textContent\.trim\(\)\)\.filter\(x => x\)/);
 assert.match(html,/cell\.classList\.toggle\('hidden',hid\.has\(label\)\)/);
 for(const k of ['colOrderActions','colInventoryActions','colPartyActions','colRecentOrderActions','treasuryTableActions']) assert.doesNotMatch(html,new RegExp("k: '"+k+"'"));
});

test('page totals toggle is inserted after table container and retains per-table setting',()=>{
 const js=read('app/upgrade-v12.js');
 assert.match(js,/table\.parentElement\.after\(bar\)/);
 assert.match(js,/ss\(\)\.tableTotals\?\.\[key\]/);
 assert.match(js,/toggleTableTotals/);
});

test('invoice watermark scales with invoice settings, centers and supports hide/opacity zero',()=>{
 const html=read('app/index.html'),css=read('app/studio-150.css');
 assert.match(html,/const scale = Math\.min\(1\.5, Math\.max\(0\.6, \(Number\(v\.scale\)/);
 assert.match(html,/v\.secs\?\.watermark === false \|\| v\.cols\?\.watermark === false/);
 assert.match(html,/Number\.isFinite\(Number\(w\.opacity\)\)/);
 assert.match(css,/#invWatermark\{position:absolute;inset:0;z-index:1/);
 assert.match(css,/#printArea > \*:not\(#invWatermark\):not\(#invTemplateLayer157\)\{position:relative;z-index:2\}/);
});

test('operations export helpers accept preview element and propagate failures',()=>{
 const js=read('app/release-160.js'),ops=read('app/operations-149.js');
 assert.match(js,/exportOpsPaperImage153 = async function\(sourceOrTitle/);
 assert.match(js,/copyOpsPaperImage153 = async function\(sourceOrTitle/);
 assert.match(js,/exportOpsPaperPDF153 = async function\(sourceOrTitle/);
 assert.match(js,/تعذر حفظ صورة مستند التشغيل/);
 assert.match(js,/تعذر حفظ PDF لمستند التشغيل/);
 assert.match(ops,/sheetEl\.id='opsPaper149'/);
});

test('operations tables receive responsive/dark styling, Daily Sales palette, center alignment, and unified 24x24 action icons',()=>{
 const css=read('app/operations-161.css'),html=read('app/index.html'),ops=read('app/operations-149.js');
 assert.match(html,/operations-161\.css/);
 assert.match(css,/position:\s*sticky\s*!important;\s*top:\s*0/);
 assert.match(css,/body\.dark #view-operations/);
 assert.match(css,/td:last-child button/);
 assert.match(css,/overflow:\s*auto\s*!important/);
 assert.doesNotMatch(css,/#2f2427|#35282c|#302528/);
 assert.match(css,/grid-auto-flow:\s*column\s*!important/);
 assert.match(css,/grid-auto-columns:\s*24px\s*!important/);
 assert.match(css,/width:\s*24px\s*!important/);
 assert.match(ops,/function iconBtn\(/);
 assert.match(ops,/stageBadge149/);
});

test('all table headers have dual-sided column resize grips (start and end) anchored without drift',()=>{
 const wsJs=read('app/workspace-148.js'),wsCss=read('app/workspace-148.css'),opsCss=read('app/operations-161.css');
 assert.match(wsJs,/column-grip-end148/);
 assert.match(wsJs,/column-grip-start148/);
 assert.match(wsJs,/function dragSign\(d\)/);
 assert.match(wsJs,/>thead>tr>th:nth-child\(/);
 assert.match(wsCss,/\.column-grip-end148\{inset-inline-end:0/);
 assert.match(wsCss,/\.column-grip-start148\{inset-inline-start:0/);
 assert.match(wsCss,/\.column-head148\{position:relative!important/);
 assert.match(opsCss,/thead th\.column-head148 > \.column-grip-start148/);
});

test('WhatsApp direct client chat opener supports whatsapp://send deep link without Explorer side effects, with phone normalization on Copy Image and Save PDF',()=>{
 const mainCjs=read('app/main.cjs'),r160=read('app/release-160.js');
 assert.match(mainCjs,/whatsapp-407/);
 assert.match(mainCjs,/function normalizeWhatsAppPhone\(raw\)/);
 assert.match(r160,/whatsapp:\/\/send\?phone=/);
 assert.match(r160,/waChoicePhoneInput153/);
 assert.match(r160,/quickExportInvoice160\('copy'\)/);
});

test('release metadata is consistently 6.0.0 and NSIS target remains Windows setup',()=>{
 const pkg=JSON.parse(read('package.json'));
 assert.equal(pkg.version,'7.0.2');assert.equal(pkg.build.directories.output,'dist-v7.0.2');
 assert.equal(pkg.build.nsis.artifactName,'Alhamd-Print-Setup-7.0.2.exe');
 assert.deepEqual(pkg.build.win.target.map(x=>x.target),['nsis']);
 assert.match(read('app/index.html'),/version: '4\.0\.8'/);
});

test('v3.6.0 fixes: unclipped daily report & operations table, Excel-style column grips, and 500% watermark scaling', () => {
  const html = read('app/index.html');
  assert.match(html, /id="invWmSize"[^>]*max="500"/);

  assert.match(html, /Math\.min\(500,\s*Math\.max\(50,\s*Number\(v\.wm\.size\)/);

  const r160 = read('app/release-160.js');
  assert.match(r160, /dstNode\.style\.width\s*=\s*'100%'/);
  assert.match(r160, /dstNode\.style\.maxWidth\s*=\s*'100%'/);

  const css161 = read('app/operations-161.css');
  assert.match(css161, /#view-operations\.hidden[\s\S]*?display:\s*none\s*!important/);
  assert.match(css161, /#view-operations:not\(\.hidden\)/);
  assert.doesNotMatch(css161, /#view-operations,\s*#view-operations\.ops149\s*\{/);
  assert.match(css161, /\.column-grip-end148::after/);
  assert.match(css161, /\.column-grip-start148::after/);

  const ws148 = read('app/workspace-148.js');
  assert.match(ws148, /alhamd-columns-v350/);
});

test('statement invoice preview and export keep watermark as absolute background overlay and protect light sheet in dark mode', () => {
  const sd = read('app/statement-document.js');
  assert.match(sd, /inv-watermark-layer/);
  assert.match(sd, /setProperty\('background-color'/);

  const dc = read('app/dark-contrast-153.js');
  assert.match(dc, /:not\(#statementDocumentPreview\)/);
  assert.match(dc, /:not\(#statementInvoiceSheet\)/);

  const ps = read('app/pdf-service.cjs');
  assert.match(ps, /#statementInvoiceSheet/);
  assert.match(ps, /\[data-preview-id=invWatermark\]/);

  const r160 = read('app/release-160.js');
  assert.match(r160, /enrichPrintPayload160/);
  assert.match(r160, /const html = doc\?\.html \|\| sheet\?\.outerHTML/);
});

test('universal operations-style table grid, header colors, cell borders, and centered alignment apply to all program tables', () => {
  const css161 = read('app/operations-161.css');
  assert.match(css161, /body main \.tab-view \.overflow-x-auto:has\(> table\):not\(\.hidden\)/);
  assert.match(css161, /body main \.tab-view table:not\(#printArea \*\):not\(#statementInvoiceSheet \*\):not\(\.ops-paper149 \*\):not\(\.supplier-request-paper147 \*\) th/);
  assert.match(css161, /body\.dark main \.tab-view table:not\(#printArea \*\):not\(#statementInvoiceSheet \*\):not\(\.ops-paper149 \*\):not\(\.supplier-request-paper147 \*\) tbody tr:nth-child\(even\) td/);

  const dc = read('app/dark-contrast-153.js');
  assert.match(dc, /var\(--table-head-bg,#1e293b\)!important/);
});
