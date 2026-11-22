const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const app=path.join(__dirname,'..','app');
const read=name=>fs.readFileSync(path.join(app,name),'utf8');

test('all regular sections use one vertical page viewport; table wrappers are horizontal only',()=>{
  const css=read('scroll-153.css');
  const js=read('scroll-153.js');
  assert.match(css,/body > main#appMainScroll153[\s\S]*?overflow-y:scroll/);
  assert.match(css,/body > aside#sidebar[\s\S]*?overflow-y:auto/);
  assert.match(css,/overflow-x:auto !important; overflow-y:clip !important/);
  assert.match(css,/overflow-y:clip !important; max-height:none !important/);
  assert.doesNotMatch(css,/overflow-y:visible\s*!important/);
  assert.match(js,/main\.id='appMainScroll153'/);
  assert.match(js,/if\(e\.shiftKey\|\|Math\.abs\(e\.deltaX\)>Math\.abs\(e\.deltaY\)\)/);
  assert.match(js,/table\.scrollLeft\+=delta;if\(table\.scrollLeft!==0\)e\.preventDefault\(\)/);
  assert.match(js,/target\?\.closest\?\.\('#sidebar'\)/);
  assert.match(js,/main\.scrollTop\+=e\.deltaY;e\.preventDefault\(\)/);
  assert.match(js,/const canScrollY=/);
});

test('floating workspace and layout-lock controls are removed without removing ordinary modal lifecycle',()=>{
  const layout=read('layout-150.js');
  const css=read('studio-150.css');
  assert.match(layout,/Stable modal lifecycle only/);
  assert.match(layout,/window\.Layout150=api/);
  assert.doesNotMatch(layout,/window-dock150|data-minimized150|window-grip150|data-layout-lock|قفل التخطيط|سحب النافذة|تصغير النافذة/);
  assert.doesNotMatch(css,/window-dock150|window-grip150|data-minimized150|layout-lock/);
});

test('dark mode defines contrast for both application sections and dynamic dialogs',()=>{
  const css=read('dark-contrast-153.js');
  assert.match(css,/body\.dark main \.tab-view \.text-slate-700/);
  assert.match(css,/body\.dark \.fixed\.inset-0 \.text-slate-800/);
  assert.match(css,/body\.dark \[role="dialog"\] input/);
  assert.match(css,/body\.dark #notificationCenter152 \.notification-copy152 p/);
});

test('notification settings cover every configured event category and editable text/background colors',()=>{
  const js=read('productivity-152.js');
  for(const key of ['stock','orders','quotes','finance','security','backup','activity','purchases','services','treasury','shifts','stocktake','audit']) assert.ok(js.includes(`['${key}',`),`missing category ${key}`);
  for(const key of ['panel','title','body','border','row','read','accent','buttonBg','buttonText','time']) assert.ok(js.includes(`['${key}',`),`missing color ${key}`);
  assert.match(js,/data-notice-type/);
  assert.match(js,/data-notice-color/);
  assert.match(js,/تعليم كمقروء/);
});

test('customization no longer exports old reset controls or reset buttons',()=>{
  const html=fs.readFileSync(path.join(app,'index.html'),'utf8');
  const settings=read('settings-studio.js');
  const studio=read('studio-150.css');
  assert.doesNotMatch(html,/function clrReset(?:Cur|All)?\s*\(/);
  assert.doesNotMatch(settings,/ss-reset|settingsResetModeColors/);
  assert.doesNotMatch(studio,/reset-layout|layout-reset/);
});

test('release metadata and installer artifact name stay consistent',()=>{
  const pkg=JSON.parse(fs.readFileSync(path.join(__dirname,'..','package.json'),'utf8'));
  assert.match(pkg.version, /^\d+\.\d+\.\d+$/);
  assert.equal(pkg.build.nsis.artifactName, `Alhamd-Print-Setup-${pkg.version}.exe`);
});
