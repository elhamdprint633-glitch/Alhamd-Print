/* Settings studio: searchable settings, accessible theme presets and safe UI profiles. */
(() => {
    'use strict';

    const SETTINGS_COLOR_DEFAULTS = {
        l: { thBg: '#f1f5f9', thText: '#334155', mhBg: '#f0fdfa', mhText: '#0f172a' },
        d: { thBg: '#243247', thText: '#e2e8f0', mhBg: '#1a2638', mhText: '#f1f5f9' }
    };
    const SETTINGS_PRESETS = {
        alhamd: { name: 'الحمد — فاتح', theme: 'light', accent: '#0d9488', sidebar: '#0f172a', l: ['#f1f5f9', '#334155', '#f0fdfa', '#0f172a'] },
        blue: { name: 'أزرق هادئ — فاتح', theme: 'light', accent: '#2563eb', sidebar: '#172554', l: ['#eff6ff', '#1e3a8a', '#eff6ff', '#172554'] },
        darkTeal: { name: 'أخضر واضح — داكن', theme: 'dark', accent: '#2dd4bf', sidebar: '#082f2f', d: ['#1e293b', '#f1f5f9', '#13282b', '#e2e8f0'] },
        darkBlue: { name: 'أزرق هادئ — داكن', theme: 'dark', accent: '#60a5fa', sidebar: '#0b1220', d: ['#1e293b', '#e2e8f0', '#172033', '#f8fafc'] },
        orangeTeal: { name: 'أورانج آند تيل — داكن', theme: 'dark', accent: '#f97316', sidebar: '#123b3b', canvas: '#0c2025', panel: '#18343b', d: ['#18343b', '#f1f5f9', '#123b3b', '#f1f5f9'] },
        violetNight: { name: 'بنفسجي ليلي — داكن', theme: 'dark', accent: '#a78bfa', sidebar: '#211638', canvas: '#141021', panel: '#29203c', d: ['#29203c', '#f1f5f9', '#211638', '#f1f5f9'] },
        roseGraphite: { name: 'وردي وجرافيت — داكن', theme: 'dark', accent: '#fb7185', sidebar: '#27212c', canvas: '#16151d', panel: '#2a2633', d: ['#2a2633', '#f1f5f9', '#27212c', '#f1f5f9'] },
        oceanGold: { name: 'محيطي وذهبي — داكن', theme: 'dark', accent: '#fbbf24', sidebar: '#102c42', canvas: '#0a192b', panel: '#193249', d: ['#193249', '#f1f5f9', '#102c42', '#f1f5f9'] },
        emeraldNight: { name: 'زمردي ليلي — داكن', theme: 'dark', accent: '#34d399', sidebar: '#10362f', canvas: '#0b201c', panel: '#193a33', d: ['#193a33', '#f1f5f9', '#10362f', '#f1f5f9'] }
    };
    const COLOR_KEYS = ['accent', 'sidebar', 'iconColor', 'logoFrameBg', 'thBg', 'thText', 'mhBg', 'mhText', 'bgColor', 'lockColor'];
    const HEX = /^#[0-9a-f]{6}$/i;
    let searchText = '';
    let editMode = null;

    const modeKey = () => editMode || (document.body.classList.contains('dark') ? 'd' : 'l');
    const modeLabel = key => key === 'd' ? 'الوضع الداكن' : 'الوضع الفاتح';
    const validColor = value => typeof value === 'string' && HEX.test(value);
    const safeText = value => String(value || '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
    const safeHexOrEmpty = value => value === '' || validColor(value);

    function modeValue(u, key, mode) {
        const map = u.modeColors && u.modeColors[mode];
        if (map && Object.prototype.hasOwnProperty.call(map, key)) return map[key] || SETTINGS_COLOR_DEFAULTS[mode][key];
        return u[key] || SETTINGS_COLOR_DEFAULTS[mode][key];
    }

    function contrastRatio(foreground, background) {
        const lum = hex => {
            const rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
            return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
        };
        const a = lum(foreground), b = lum(background);
        return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    }

    function contrastBadge(text, bg, label) {
        const score = contrastRatio(text, bg);
        const good = score >= 4.5;
        return `<div class="ss-contrast ${good ? 'good' : 'warn'}"><span class="ss-preview-chip" style="background:${bg};color:${text}">نص واضح</span><span>${safeText(label)}: تباين ${score.toFixed(1)}:1 — ${good ? 'مناسب للقراءة' : 'يفضل زيادة الفرق بين اللونين'}</span></div>`;
    }

    function setModeColor(key, value, mode, commit) {
        if (!validColor(value)) return;
        const u = uiCfg();
        u.modeColors ||= {};
        u.modeColors[mode] ||= {};
        u.modeColors[mode][key] = value;
        applyUi();
        if (commit) {
            renderThemePanel();
            saveState(false);
        } else {
            refreshStudioPreview();
        }
    }


    const PRESET_KEYS = ['loginCard148','theme','accent','sidebar','modeColors','clr','presetCanvas','presetPanel','bgMode','bgColor','surfaceStyles147'];
    function snapshotPreset(u) { const out={}; for(const k of PRESET_KEYS) if(u[k]!==undefined) out[k]=JSON.parse(JSON.stringify(u[k])); return out; }
    function applyPreset(id) {
        const preset=SETTINGS_PRESETS[id]; if(!preset)return;
        const u=uiCfg(); u.presetProfiles ||= {};
        if(SETTINGS_PRESETS[u.activePreset]) u.presetProfiles[u.activePreset]=snapshotPreset(u);
        const saved=u.presetProfiles[id];
        for(const k of PRESET_KEYS) delete u[k];
        if(saved) Object.assign(u,JSON.parse(JSON.stringify(saved)));
        else {
            u.theme=preset.theme;u.accent=preset.accent;u.sidebar=preset.sidebar;
            u.presetCanvas=preset.canvas || (preset.theme==='dark'?'#0f172a':'#f8fafc');
            u.bgMode='color';u.bgColor=u.presetCanvas;
            u.presetPanel=preset.panel || (preset.theme==='dark'?'#1e293b':'#ffffff');
            const [thBg,thText,mhBg,mhText]=preset[preset.theme==='dark'?'d':'l'];
            u.modeColors={ [preset.theme==='dark'?'d':'l']:{thBg,thText,mhBg,mhText} };u.clr={};
        }
        u.activePreset=id;editMode=null;applyUi();renderThemePanel();saveState(false);
        showToast('تم تطبيق '+preset.name+'؛ تخصيص كل مظهر محفوظ بشكل مستقل','success');
    }
    window.settingsSetPresetColor=function(key,value){
        if(!['accent','sidebar','presetCanvas','presetPanel'].includes(key)||!validColor(value))return;
        const u=uiCfg();u[key]=value;if(key==='presetCanvas'){u.bgMode='color';u.bgColor=value;}applyUi();saveState(false);
    };

    const originalUiCss = window.uiCss;
    if (typeof originalUiCss === 'function') {
        window.uiCss = function (u, dark) {
            let css = originalUiCss(u, dark);
            const X0=':not(#printArea):not(#printArea *):not(#statementInvoiceSheet):not(#statementInvoiceSheet *):not(.no-print):not(.no-print *)';
            if(validColor(u.accent)&&contrastRatio('#ffffff',u.accent)<4.5)css+=`body button.bg-teal-600${X0},body button.bg-teal-500${X0}{color:#0f172a!important}`;
            if(validColor(u.presetCanvas)&&u.bgMode!=='image')css+=`body main[class]:not(#printArea):not(#printArea *):not(#statementInvoiceSheet):not(#statementInvoiceSheet *),body.dark main[class]:not(#printArea):not(#printArea *):not(#statementInvoiceSheet):not(#statementInvoiceSheet *){background-color:${u.bgMode==='color'?u.bgColor:u.presetCanvas}!important}`;
            if(validColor(u.presetPanel))css+=`body .bg-white${X0},body .dark\\:bg-slate-800${X0}{background-color:${u.presetPanel}!important}`;
            const mode = dark ? 'd' : 'l';
            const pair = u.modeColors && u.modeColors[mode];
            if (!pair) return css;
            const thBg = Object.prototype.hasOwnProperty.call(pair, 'thBg') ? (pair.thBg || SETTINGS_COLOR_DEFAULTS[mode].thBg) : (u.thBg || '');
            const thText = Object.prototype.hasOwnProperty.call(pair, 'thText') ? (pair.thText || SETTINGS_COLOR_DEFAULTS[mode].thText) : (u.thText || '');
            const mhBg = Object.prototype.hasOwnProperty.call(pair, 'mhBg') ? (pair.mhBg || SETTINGS_COLOR_DEFAULTS[mode].mhBg) : (u.mhBg || '');
            const mhText = Object.prototype.hasOwnProperty.call(pair, 'mhText') ? (pair.mhText || SETTINGS_COLOR_DEFAULTS[mode].mhText) : (u.mhText || '');
            const X = ':not(#printArea *):not(#printArea):not(#statementInvoiceSheet *):not(#statementInvoiceSheet)';
            if (validColor(thBg)) {
                const selectors = ['thead[class]', 'thead', 'thead tr', 'thead tr[class]', 'thead th', 'thead th[class]', 'thead td', 'thead td[class]'].map(s => `body table ${s}${X}`).join(',');
                css += `${selectors}{background-color:${thBg}!important}`;
            }
            if (validColor(thText)) {
                const selectors = ['thead th', 'thead th *', 'thead td', 'thead td *', '.sale-head', '.sale-head *'].map(s => `body ${s}${X}`).join(',');
                css += `${selectors}{color:${thText}!important}`;
            }
            if (validColor(mhBg)) css += `body .win-head[class]${X}{background:${mhBg}!important;background-image:none!important}`;
            if (validColor(mhText)) css += `body .win-head[class]${X},body .win-head[class]${X} *:not(button):not(button *):not(input):not(select):not(textarea){color:${mhText}!important}`;
            return css;
        };
    }

    const originalRenderTheme = window.renderThemePanel;
    if (typeof originalRenderTheme === 'function') {
        window.renderThemePanel = function (...args) {
            const result = originalRenderTheme.apply(this, args);
            const host = gid('uiThemeBox');
            if (!host) return result;
            const u = uiCfg(), mode = modeKey();
            const thBg = modeValue(u, 'thBg', mode), thText = modeValue(u, 'thText', mode);
            const mhBg = modeValue(u, 'mhBg', mode), mhText = modeValue(u, 'mhText', mode);
            const palettes = Object.entries(SETTINGS_PRESETS).map(([id, preset]) => {
                const dark = preset.theme === 'dark', swatches = preset[dark ? 'd' : 'l'];
                return `<button type="button" class="ss-preset ${u.activePreset===id?'ss-selected':''}" aria-pressed="${u.activePreset===id}" onclick="settingsApplyPreset('${id}')"><strong>${safeText(preset.name)}</strong><span class="ss-swatches"><i style="background:${preset.accent}"></i><i style="background:${preset.sidebar}"></i><i style="background:${swatches[0]}"></i><i style="background:${swatches[1]}"></i></span></button>`;
            }).join('');
            const modeButtons = `<button type="button" class="ss-mode ${mode === 'l' ? 'active' : ''}" onclick="settingsEditColorMode('l')">☀️ فاتح</button><button type="button" class="ss-mode ${mode === 'd' ? 'active' : ''}" onclick="settingsEditColorMode('d')">🌙 داكن</button>`;
            const studio = `<section class="ss-studio" aria-label="استوديو المظهر">
<div class="ss-studio-head"><div><h4><i class="fa-solid fa-wand-magic-sparkles"></i> استوديو المظهر والوضوح</h4><p>جرّب مظهراً جاهزاً أو اضبط ترويسات الجداول والنوافذ لكل وضع على حدة. معاينة الطباعة تظل بيضاء.</p></div><div class="ss-profile-actions"><button type="button" class="ss-action" onclick="exportUiProfile()"><i class="fa-solid fa-file-arrow-down"></i> تصدير مظهر</button><label class="ss-action ss-file"><i class="fa-solid fa-file-arrow-up"></i> استيراد مظهر<input type="file" accept="application/json,.json" onchange="importUiProfile(event)" hidden></label></div></div>
<div class="ss-presets">${palettes}</div>
<p class="ss-note">المظهر المحدد: ${safeText(SETTINGS_PRESETS[u.activePreset]?.name||'تخصيص حالي')}. عدّل الألوان هنا أو من باقي إعدادات المظهر؛ عند الانتقال لمظهر آخر تُحفظ تعديلات هذا المظهر وتعود عند اختياره.</p>
<div class="ss-color-grid">${[['accent','اللون الرئيسي'],['sidebar','القائمة الجانبية'],['presetCanvas','خلفية مساحة العمل'],['presetPanel','خلفية الكروت والنوافذ']].map(([key,label])=>`<label><span>${label}</span><input type="color" value="${validColor(key==='presetCanvas'&&u.bgMode==='color'?u.bgColor:u[key])?(key==='presetCanvas'&&u.bgMode==='color'?u.bgColor:u[key]):'#1e293b'}" oninput="settingsSetPresetColor('${key}',this.value)"></label>`).join('')}</div>
<div class="ss-mode-row"><span>تخصيص ألوان الوضع:</span>${modeButtons}<span class="ss-mode-note">تعديل الوضع ${modeLabel(mode)} فقط، مع حفظ الوضع الآخر منفصلاً.</span></div>
<div class="ss-color-grid"><label><span>خلفية رؤوس الجداول</span><input type="color" value="${thBg}" oninput="settingsSetModeColor('thBg',this.value,'${mode}',false)" onchange="settingsSetModeColor('thBg',this.value,'${mode}',true)"></label><label><span>لون نص رؤوس الجداول</span><input type="color" value="${thText}" oninput="settingsSetModeColor('thText',this.value,'${mode}',false)" onchange="settingsSetModeColor('thText',this.value,'${mode}',true)"></label><label><span>خلفية عناوين النوافذ</span><input type="color" value="${mhBg}" oninput="settingsSetModeColor('mhBg',this.value,'${mode}',false)" onchange="settingsSetModeColor('mhBg',this.value,'${mode}',true)"></label><label><span>لون نص عناوين النوافذ</span><input type="color" value="${mhText}" oninput="settingsSetModeColor('mhText',this.value,'${mode}',false)" onchange="settingsSetModeColor('mhText',this.value,'${mode}',true)"></label></div>
<div id="settingsContrastPreview" class="ss-contrast-grid">${contrastBadge(thText, thBg, 'رؤوس الجداول')}${contrastBadge(mhText, mhBg, 'عناوين النوافذ')}</div>
<p class="ss-note">ألوان الترويسات القديمة تُحفظ كما هي عند الترقية. من الآن تقدر تخصيص الفاتح والداكن كلٌّ على حدة؛ وألوان النصوص والخلفيات المتقدمة تظل مستقلة لكل وضع.</p>
</section>`;
            host.insertAdjacentHTML('afterbegin', studio);
            const oldCards = [...host.querySelectorAll('.grid > .p-4')];
            oldCards.forEach(card => {
                const heading = card.children[0]?.textContent || '';
                if (heading.includes('رأس الجداول') || heading.includes('ترويسة النوافذ')) card.classList.add('ss-legacy-colors');
            });
            return result;
        };
    }

    function refreshStudioPreview() {
        const u = uiCfg(), mode = modeKey(), box = gid('settingsContrastPreview');
        if (!box) return;
        box.innerHTML = contrastBadge(modeValue(u, 'thText', mode), modeValue(u, 'thBg', mode), 'رؤوس الجداول') + contrastBadge(modeValue(u, 'mhText', mode), modeValue(u, 'mhBg', mode), 'عناوين النوافذ');
    }

    function normalizeArabic(value) {
        return String(value || '').toLocaleLowerCase('ar').normalize('NFD')
            .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
            .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').trim();
    }

    function applySettingsSearch() {
        const query = normalizeArabic(searchText), buttons = [...document.querySelectorAll('.settings-nav-btn')];
        let firstMatch = null, matches = 0;
        for (const button of buttons) {
            const id = button.dataset.subtab, panel = gid(`subtab-${id}`);
            const content = normalizeArabic(`${button.textContent} ${panel?.textContent || ''}`);
            const allowed = typeof settingsTabAllowed !== 'function' || settingsTabAllowed(id);
            const match = allowed && (!query || content.includes(query));
            button.classList.toggle('hidden', !match);
            if (match) { matches++; firstMatch ||= button; }
        }
        const empty = gid('settingsSearchEmpty');
        if (empty) empty.classList.toggle('hidden', !query || matches > 0);
        const active = document.querySelector('.settings-nav-btn.bg-teal-600');
        if (query && firstMatch && (!active || active.classList.contains('hidden'))) switchSettingsTab(firstMatch.dataset.subtab);
        if (!query && active?.classList.contains('hidden') && firstMatch) switchSettingsTab(firstMatch.dataset.subtab);
        for (const button of buttons) {
            const id = button.dataset.subtab, panel = gid(`subtab-${id}`);
            const allowed = typeof settingsTabAllowed !== 'function' || settingsTabAllowed(id);
            const match = allowed && (!query || normalizeArabic(`${button.textContent} ${panel?.textContent || ''}`).includes(query));
            button.classList.toggle('hidden', !match);
        }
    }

    function injectSearchToolbar() {
        const view = gid('view-settings');
        if (!view || gid('settingsStudioToolbar')) return;
        view.insertAdjacentHTML('afterbegin', `<div id="settingsStudioToolbar" class="ss-toolbar"><div><div class="ss-toolbar-title"><i class="fa-solid fa-sliders"></i><span>مركز إعدادات المطبعة</span></div><p>كل الخيارات مجمّعة حسب وظيفتها، وتُحفظ مع بيانات البرنامج.</p></div><label class="ss-search"><i class="fa-solid fa-magnifying-glass"></i><input id="settingsQuickSearch" type="search" placeholder="ابحث عن إعداد: لون، خط، شعار، نسخة احتياطية…" autocomplete="off"><button type="button" onclick="settingsClearSearch()" title="مسح البحث" aria-label="مسح البحث">×</button></label><div id="settingsSearchEmpty" class="ss-empty hidden">لا توجد إعدادات مطابقة في الأقسام المتاحة لحسابك.</div></div>`);
        gid('settingsQuickSearch').addEventListener('input', event => { searchText = event.target.value; applySettingsSearch(); });
    }

    const UI_PROFILE_KEYS = ['loginCard148','surfaceStyles147','activePreset','presetProfiles','presetCanvas','presetPanel','theme', 'accent', 'sidebar', 'iconScale', 'iconColor', 'fontScale', 'density', 'radius', 'logoSize', 'logoShape', 'miniLogo', 'logoFrameFit', 'logoFrameScale', 'logoFrameBg', 'bold', 'clr', 'numW', 'numFont', 'thBg', 'thText', 'mhBg', 'mhText', 'modeColors', 'bgMode', 'bgColor', 'bgImage', 'bgFit', 'bgZoom', 'bgDim', 'lockMode', 'lockColor', 'lockImage', 'lockFit', 'lockZoom', 'lockDim'];
    function profileUiSource() {
        const u = uiCfg(), out = {};
        for (const key of UI_PROFILE_KEYS) if (Object.prototype.hasOwnProperty.call(u, key)) out[key] = u[key];
        return out;
    }
    function sanitizeProfileUi(input) {
        if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('قسم المظهر غير صالح');
        const out = JSON.parse(JSON.stringify(UI_DEF));
        for (const key of ['theme', 'density', 'radius', 'logoShape', 'numFont', 'bgMode', 'bgFit', 'lockMode']) {
            if (input[key] !== undefined) out[key] = input[key];
        }
        const enums = { theme: ['light', 'dark', 'auto'], density: ['normal', 'compact'], radius: ['sharp', 'normal', 'round'], logoShape: ['square', 'round'], numFont: ['app', 'mono'], bgMode: ['default', 'color', 'image'], bgFit: ['cover', 'contain', 'repeat'], lockMode: ['default', 'color', 'image'] };
        for (const [key, values] of Object.entries(enums)) if (!values.includes(out[key])) throw new Error('قيمة غير مسموحة في إعداد ' + key);
        for (const key of ['iconScale', 'fontScale', 'logoSize', 'logoFrameScale', 'bgZoom', 'lockZoom', 'numW', 'bgDim', 'lockDim']) if (input[key] !== undefined) {
            const n = Number(input[key]);
            const bounds = { iconScale: [70, 160], fontScale: [80, 140], logoSize: [32, 96], logoFrameScale: [40, 160], bgZoom: [40, 220], lockZoom: [40, 220], numW: [400, 900], bgDim: [0, 85], lockDim: [0, 85] }[key];
            if (!Number.isFinite(n) || n < bounds[0] || n > bounds[1]) throw new Error('قيمة رقمية خارج النطاق في ' + key);
            out[key] = n;
        }
        for (const key of COLOR_KEYS) if (input[key] !== undefined) {
            if (!safeHexOrEmpty(input[key])) throw new Error('لون غير صالح في ' + key);
            out[key] = input[key];
        }
        for (const key of ['miniLogo']) if (input[key] !== undefined) {
            if (typeof input[key] !== 'boolean') throw new Error('قيمة غير صالحة في ' + key);
            out[key] = input[key];
        }
        for (const key of ['bgImage', 'lockImage']) if (input[key] !== undefined) {
            const value = input[key];
            if (typeof value !== 'string' || value.length > 7_500_000 || (value && !/^data:image\/(jpeg|png|webp);base64,[a-z0-9+/]+=*$/i.test(value))) throw new Error('ملف خلفية غير صالح أو أكبر من الحد المسموح');
            out[key] = value;
        }
        if (input.bold !== undefined) {
            if (!input.bold || typeof input.bold !== 'object' || Array.isArray(input.bold)) throw new Error('إعدادات سماكة الخط غير صالحة');
            out.bold = {};
            for (const [key, value] of Object.entries(input.bold)) {
                if (!['all', 'numbers', 'clock', 'headings', 'thead', 'sidebar', 'buttons', 'inputs', 'inv'].includes(key) || typeof value !== 'boolean') throw new Error('إعدادات سماكة الخط غير صالحة');
                out.bold[key] = value;
            }
        }
        if (input.modeColors !== undefined) {
            if (!input.modeColors || typeof input.modeColors !== 'object' || Array.isArray(input.modeColors)) throw new Error('ألوان الأوضاع غير صالحة');
            out.modeColors = { l: {}, d: {} };
            for (const mode of ['l', 'd']) for (const key of ['thBg', 'thText', 'mhBg', 'mhText']) {
                const value = input.modeColors[mode]?.[key];
                if (value === undefined) continue;
                if (!safeHexOrEmpty(value)) throw new Error('لون غير صالح في الوضع ' + mode);
                out.modeColors[mode][key] = value;
            }
        }
        if (input.clr !== undefined) {
            if (!input.clr || typeof input.clr !== 'object' || Array.isArray(input.clr)) throw new Error('إعدادات الألوان المتقدمة غير صالحة');
            const colorKeys = new Set(CLR_GROUPS.flatMap(group => group[2].map(row => row[0])));
            out.clr = {};
            for (const [key, modes] of Object.entries(input.clr)) {
                if (!colorKeys.has(key) || !modes || typeof modes !== 'object' || Array.isArray(modes)) continue;
                const pair = {};
                for (const mode of ['l', 'd']) if (modes[mode] !== undefined) {
                    if (!validColor(modes[mode])) throw new Error('لون غير صالح في تخصيصات الوضع');
                    pair[mode] = modes[mode];
                }
                if (pair.l || pair.d) out.clr[key] = pair;
            }
        }
        if(input.loginCard148 && window.Alhamd148) out.loginCard148=window.Alhamd148.login(input.loginCard148);
        if(input.surfaceStyles147&&typeof input.surfaceStyles147==='object'){
            out.surfaceStyles147={};const allowed=['cards','dialogs','dialogHead','tableRows','tableAlternate','tableHead','tableFooter','tableTools','inputs','topBar','sidebar','borders'];
            for(const mode of ['l','d']){out.surfaceStyles147[mode]={};for(const key of allowed){const v=input.surfaceStyles147[mode]?.[key];if(!v)continue;if(!validColor(v.color)||!Number.isFinite(Number(v.alpha))||Number(v.alpha)<0||Number(v.alpha)>100)throw Error('لون أو شفافية غير صالحة');out.surfaceStyles147[mode][key]={enabled:!!v.enabled,color:v.color,alpha:Number(v.alpha)};}}
        }
        for(const key of ['presetCanvas','presetPanel']) if(validColor(input[key]))out[key]=input[key];
        if(SETTINGS_PRESETS[input.activePreset])out.activePreset=input.activePreset;
        if(input.presetProfiles && typeof input.presetProfiles==='object'){
            out.presetProfiles={};
            for(const id of Object.keys(SETTINGS_PRESETS))if(input.presetProfiles[id]){
                const clean=sanitizeProfileUi({...input.presetProfiles[id],presetProfiles:undefined});
                out.presetProfiles[id]=snapshotPreset(clean);
            }
        }
        return out;
    }

    function exportUiProfile() {
        if (typeof can === 'function' && !can('sets_ui')) return permDeny();
        const payload = { format: 'alhamd-print-ui-profile', version: 1, createdAt: new Date().toISOString(), ui: profileUiSource() };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob), a = document.createElement('a');
        a.href = url; a.download = `Alhamd-UI-Profile-${new Date().toISOString().slice(0, 10)}.json`; a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        showToast('تم تصدير تخصيصات المظهر فقط، بدون بيانات العملاء أو المستخدمين', 'success');
    }

    async function importUiProfile(event) {
        const file = event.target.files?.[0]; event.target.value = '';
        if (!file) return;
        if (typeof can === 'function' && !can('sets_ui')) return permDeny();
        if (file.size > 8_000_000) return showToast('ملف المظهر أكبر من الحد المسموح (8 ميجابايت)', 'warning');
        try {
            const data = JSON.parse(await file.text());
            if (data.format !== 'alhamd-print-ui-profile' || data.version !== 1) throw new Error('هذا الملف ليس ملف مظهر متوافقاً مع البرنامج');
            const clean = sanitizeProfileUi(data.ui);
            if (!confirm('سيتم استبدال تخصيصات المظهر الحالية فقط. بيانات العملاء والفواتير والمستخدمين لن تتغير. هل تريد المتابعة؟')) return;
            appState.ui = clean;
            applyUi(); renderThemePanel(); renderBgPanel(); renderLogoCard(); renderBoldBox(); renderClrPanel();
            saveState(false);
            showToast('تم استيراد إعدادات المظهر بنجاح', 'success');
        } catch (error) {
            showToast(error.message || 'تعذر قراءة ملف المظهر', 'danger');
        }
    }

    window.settingsApplyPreset = applyPreset;
    window.settingsSetModeColor = setModeColor;
    window.settingsEditColorMode = mode => { editMode = mode === 'd' ? 'd' : 'l'; renderThemePanel(); };
    window.settingsClearSearch = () => { const input = gid('settingsQuickSearch'); if (input) { input.value = ''; searchText = ''; applySettingsSearch(); input.focus(); } };
    window.exportUiProfile = exportUiProfile;
    window.importUiProfile = importUiProfile;

    const style = document.createElement('style');
    style.textContent = `
.ss-toolbar{display:grid;grid-template-columns:minmax(220px,1fr) minmax(260px,520px);gap:12px;align-items:center;padding:16px 18px;border:1px solid #dbe4ee;border-radius:18px;background:#fff;box-shadow:0 2px 8px rgba(15,23,42,.04)}
.ss-toolbar-title{display:flex;align-items:center;gap:9px;font-size:15px;font-weight:900;color:#0f172a}.ss-toolbar-title i{color:#0d9488}.ss-toolbar p,.ss-studio-head p{margin:4px 0 0;color:#64748b;font-size:11px;line-height:1.7}
.ss-search{display:flex;align-items:center;gap:8px;min-height:42px;padding:0 10px;border:1px solid #cbd5e1;border-radius:12px;background:#f8fafc;color:#64748b}.ss-search input{width:100%;min-width:0;border:0!important;outline:0!important;background:transparent!important;color:#0f172a!important;font-size:12px}.ss-search button{border:0;background:transparent;color:#64748b;font-size:22px;line-height:1;cursor:pointer}.ss-empty{grid-column:1/-1;color:#be123c;background:#fff1f2;border:1px solid #fecdd3;border-radius:10px;padding:8px 10px;font-size:11px}
.ss-studio{margin:14px 0 20px;padding:16px;border:1px solid #dbe4ee;border-radius:16px;background:linear-gradient(145deg,#f8fafc,#fff)}.ss-studio-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}.ss-studio-head h4{margin:0;display:flex;align-items:center;gap:8px;font-size:14px;font-weight:900;color:#0f172a}.ss-studio-head h4 i{color:#0d9488}.ss-profile-actions{display:flex;gap:7px;flex-wrap:wrap}.ss-action{display:inline-flex;align-items:center;gap:7px;padding:8px 11px;border:1px solid #cbd5e1;border-radius:10px;background:#fff;color:#334155;font-size:11px;font-weight:800;cursor:pointer}.ss-action:hover{border-color:#0d9488;color:#0f766e}.ss-file{position:relative}.ss-presets{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:14px 0}.ss-preset{display:flex;align-items:center;justify-content:space-between;gap:7px;text-align:right;padding:10px;border:1px solid #dbe4ee;border-radius:12px;background:#fff;color:#334155;cursor:pointer}.ss-preset:hover{border-color:#0d9488;box-shadow:0 3px 12px rgba(13,148,136,.12)}.ss-preset strong{font-size:11px}.ss-swatches{display:flex;gap:3px;flex-shrink:0}.ss-swatches i{width:15px;height:15px;border-radius:50%;border:1px solid rgba(100,116,139,.35)}
.ss-mode-row{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin:10px 0;color:#334155;font-size:11px;font-weight:800}.ss-mode{padding:6px 10px;border:1px solid #cbd5e1;border-radius:9px;background:#fff;color:#475569;font-weight:800;cursor:pointer}.ss-mode.active{border-color:#0d9488;background:#0d9488;color:#fff}.ss-mode-note{color:#64748b;font-weight:500}.ss-color-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.ss-color-grid label{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;border:1px solid #e2e8f0;border-radius:10px;background:#fff;color:#475569;font-size:11px;font-weight:800}.ss-color-grid input{width:36px;height:28px;padding:2px;border:1px solid #cbd5e1;border-radius:7px;background:#fff;cursor:pointer}.ss-contrast-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:9px}.ss-contrast{display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid #dbe4ee;border-radius:10px;color:#475569;font-size:10px}.ss-contrast.good{background:#f0fdf4;border-color:#bbf7d0}.ss-contrast.warn{background:#fff7ed;border-color:#fed7aa;color:#9a3412}.ss-preview-chip{padding:5px 9px;border-radius:7px;font-weight:900;font-size:11px;white-space:nowrap}.ss-note{margin:10px 0 0;color:#64748b;font-size:10px;line-height:1.7}.ss-legacy-colors{display:none!important}
body.dark .ss-toolbar,body.dark .ss-studio{background:#111c2d;border-color:#334155;color:#e2e8f0}.dark .ss-toolbar-title,.dark .ss-studio-head h4{color:#f1f5f9}.dark .ss-toolbar p,.dark .ss-studio-head p,.dark .ss-note,.dark .ss-mode-note{color:#a8b5c7}.dark .ss-search{background:#0b1220;border-color:#475569;color:#cbd5e1}.dark .ss-search input{color:#f1f5f9!important}.dark .ss-preset,.dark .ss-action,.dark .ss-mode,.dark .ss-color-grid label{background:#1e293b;border-color:#475569;color:#e2e8f0}.dark .ss-mode.active{background:#0f766e;border-color:#2dd4bf;color:#fff}.dark .ss-contrast{border-color:#475569;background:#162032;color:#dbe4ee}.dark .ss-contrast.good{background:#10261f;border-color:#166534;color:#bbf7d0}.dark .ss-contrast.warn{background:#302113;border-color:#92400e;color:#fed7aa}.dark .ss-empty{background:#301823;border-color:#9f1239;color:#fecdd3}
@media(max-width:900px){.ss-presets{grid-template-columns:repeat(2,minmax(0,1fr))}.ss-color-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:640px){.ss-toolbar{grid-template-columns:1fr}.ss-contrast-grid{grid-template-columns:1fr}.ss-mode-note{width:100%}}
`;
    document.head.appendChild(style);

    document.addEventListener('DOMContentLoaded', () => {
        injectSearchToolbar();
        applySettingsSearch();
    });
    const originalApplyPerms = window.applyPerms;
    if (typeof originalApplyPerms === 'function') {
        window.applyPerms = function (...args) { const result = originalApplyPerms.apply(this, args); applySettingsSearch(); return result; };
    }
    const originalSwitchSettingsTab = window.switchSettingsTab;
    if (typeof originalSwitchSettingsTab === 'function') {
        window.switchSettingsTab = function (...args) { const result = originalSwitchSettingsTab.apply(this, args); applySettingsSearch(); return result; };
    }
})();
