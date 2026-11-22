const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('release keeps semantic version and matching Windows installer name',()=>{
  const pkg=JSON.parse(read('package.json'));
  assert.match(pkg.version, /^\d+\.\d+\.\d+$/);
  assert.equal(pkg.build.nsis.artifactName, `Alhamd-Print-Setup-${pkg.version}.exe`);
  assert.ok(!read('app/index.html').includes('release-158.js'));
});
test('manual page size input accepts custom bounded integer while quick presets remain',()=>{const s=read('app/desktop-ui.js');assert.match(s,/saved>=1&&saved<=10000/);assert.match(s,/size<1\|\|size>10000/);assert.match(s,/PageSizeManual/);for(const n of [25,50,100,200,500])assert.ok(s.includes(String(n)));});
test('invoice net is editable and recomputes unit prices through native calculator',()=>{const html=read('app/index.html'),js=read('app/release-159.js');assert.match(html,/<input id="saleTotal" type="number"/);assert.match(html,/saleTotalField\.value = Number\(c\.total/);assert.match(js,/applyNet\(\)/);assert.match(js,/readSale\(\)\.total/);assert.match(js,/\.sl-price/);});
test('mobile settings points to pinned HTTPS pairing and keeps the paired LAN service',()=>{const js=read('app/release-159.js'),pre=read('app/preload.cjs');assert.match(js,/openLanSyncSettings/);assert.match(js,/HTTPS وبصمة/);assert.match(pre,/startLan/);assert.match(pre,/revokeLanDevices/);});
test('audio settings use per-event controls, bounded MP3 validation and IndexedDB rather than localStorage payloads',()=>{const js=read('app/release-159.js');assert.match(js,/soundEvents/);assert.match(js,/indexedDB\.open/);assert.match(js,/3\*1024\*1024/);assert.ok(js.includes('mpeg|mp3'));assert.match(js,/sound159Upload/);assert.doesNotMatch(js,/readAsDataURL/);});
test('treasury source navigation clears filters and pages to the record',()=>{const js=read('app/release-159.js');assert.match(js,/jumpRecord/);assert.match(js,/state\.page=Math\.floor\(ix\/state\.pageSize\)/);assert.match(js,/setSalesRange==='function'\)setSalesRange\('all'\)/);assert.match(js,/searchOrdersInput/);assert.match(js,/searchPurchasesInput/);});
test('notification center has one close control when managed window toolbar is enabled',()=>{const js=read('app/productivity-152.js');assert.match(js,/one close control is supplied by Layout150/);assert.doesNotMatch(js,/textContent='إغلاق ✕'/);});

test('treasury wallet cards are explicitly covered by the privacy hide/show control',()=>{const html=read('app/index.html'),features=read('app/features-147.js');assert.match(html,/أرصدة الخزينة وطرق الدفع/);assert.match(features,/privHidden\('treasury'\)/);});

test('discount amount and percent are styled as one joined control and remain calculator-driven',()=>{const html=read('app/index.html');assert.match(html,/inline-flex items-stretch gap-0 rounded-xl border[^"]*overflow-hidden/);assert.match(html,/id="saleDiscount"[^>]*oninput="calcSale\(\)"/);assert.match(html,/id="saleDiscType"[^>]*onchange="calcSale\(\)"/);assert.match(html,/option value="amt">ج\.م/);assert.match(html,/option value="pct">%/);});
