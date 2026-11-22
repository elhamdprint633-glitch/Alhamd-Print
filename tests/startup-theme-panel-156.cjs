const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'app', 'index.html'), 'utf8');

test('startup declares the theme panel before wrapping it', () => {
  const declaration = html.indexOf('function renderThemePanel()');
  const wrapper = html.indexOf('const _rtp = renderThemePanel');
  assert.notEqual(declaration, -1, 'renderThemePanel must be defined in the main page');
  assert.notEqual(wrapper, -1, 'theme wrapper must remain installed');
  assert.ok(declaration < wrapper, 'theme function must exist before the wrapper reads it');
  for (const helper of ['const _card =', 'const _seg =', 'const _rng =', 'const _col =', 'const _chk =']) {
    assert.ok(html.includes(helper), `missing settings helper: ${helper}`);
  }
});

test('theme panel renders with its dependencies and without reset controls', () => {
  const start = html.indexOf('// ---------- Theme panel helpers');
  const end = html.indexOf('function renderDatePanel()', start);
  assert.ok(start >= 0 && end > start, 'theme panel source block must be present');
  const source = html.slice(start, end);
  const host = { innerHTML: '' };
  const sampleUi = {
    theme: 'light', accent: '#0d9488', sidebar: '#0f172a', iconScale: 100,
    iconColor: '', fontScale: 100, density: 'normal', radius: 'normal',
    thBg: '', thText: '', mhBg: '', mhText: ''
  };
  const context = {
    gid: id => id === 'uiThemeBox' ? host : null,
    uiCfg: () => sampleUi
  };
  vm.runInNewContext(source, context, { timeout: 1000 });
  assert.equal(typeof context.renderThemePanel, 'function');
  context.renderThemePanel();
  assert.match(host.innerHTML, /المظهر والواجهة/);
  assert.match(host.innerHTML, /ترويسة النوافذ والأقسام/);
  assert.match(host.innerHTML, /رأس الجداول/);
  assert.doesNotMatch(host.innerHTML, /استعادة الافتراضي|الألوان الأصلية|إعادة ضبط|استعادة اللون/);
});
