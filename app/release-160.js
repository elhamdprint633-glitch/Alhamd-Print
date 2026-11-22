/* Alhamd Print 3.6.0 — Maintenance & Professional Layout Release v3.1 */
(()=>{'use strict';
 const $ = id => document.getElementById(id);
 if (typeof window !== 'undefined' && typeof window.$ !== 'function') {
   window.$ = $;
 }
 const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 try {
   if (typeof appState !== 'undefined' && !Object.getOwnPropertyDescriptor(window, 'appState')) {
     Object.defineProperty(window, 'appState', {
       configurable: true,
       get() { return appState; },
       set(v) { appState = v; }
     });
   }
 } catch {}

 // 16 Distinct System Events
 const SYSTEM_EVENTS = [
   ['login', 'تسجيل الدخول', 'تشغيل صوت ترحيبي عند فتح البرنامج وبدء الوردية', 'success_chord'],
   ['lock', 'قفل الشاشة اليدوي والتلقائي', 'صوت تأكيد إغلاق الشاشة للحماية والخصوصية', 'ambient_gong'],
   ['invoice', 'حفظ فاتورة مبيعات', 'صوت إتمام عملية البيع وحفظ فاتورة العميل', 'cash_register'],
   ['delivery', 'تسليم طلب لعميل', 'صوت نجاح تسليم الشغل وإغلاق أمر العمل', 'delivery_uplift'],
   ['statusChange', 'تغيير حالة التشغيل', 'صوت تحديث مرحلة الطلب في خط الإنتاج', 'modern_pulse'],
   ['quote', 'حفظ عرض سعر أو مسودة', 'صوت توثيق عرض السعر المبدئي أو حفظ المسودة', 'classic_chime'],
   ['cashIn', 'تحصيل نقدية / وارد خزينة', 'صوت استلام دفعة نقدية أو سند قبض في الخزينة', 'cash_register'],
   ['cashOut', 'صرف نقدية / مصروف أو سداد مورد', 'صوت تسجيل سند صرف أو مدفوعات نقدية', 'metallic_chime'],
   ['purchase', 'تسجيل فاتورة وارد خامات', 'صوت اعتماد استلام مشتريات الخامات والورق', 'confirm_deep'],
   ['inventory', 'إضافة صنف أو اعتماد جرد', 'صوت حفظ خامة جديدة أو تسوية رصيد الجرد', 'marimba_pluck'],
   ['lowStock', 'تنبيه وصول خامة لحد الطلب', 'صوت تحذيري استباقي لنواقص الخامات بالمخزن', 'caution_pulse'],
   ['contactAdd', 'إضافة عميل أو مورد أو خدمة', 'صوت نجاح تسجيل طرف تعامل جديد بالنظام', 'crystal_bell'],
   ['backup', 'إتمام النسخ الاحتياطي', 'صوت تأكيد حفظ وتأمين قاعدة البيانات محلياً', 'confirm_deep'],
   ['notify', 'الإشعارات العامة والتنبيهات', 'صوت الإشعارات الإدارية ورسائل النظام العامة', 'subtle_pop'],
   ['delete', 'حذف السجلات أو العمليات', 'صوت تنبيهي عند مسح فاتورة أو مستند أو حركة', 'caution_pulse'],
   ['error', 'الأخطاء والتحذيرات', 'صوت تنبيه للمدخلات غير الصحيحة أو قيود الصلاحيات', 'caution_pulse']
 ];

 // 12 Professional Built-in Tones
 const BUILTIN_TONES = [
   ['classic_chime', 'رنين كلاسيكي متناغم (Classic Chime)'],
   ['success_chord', 'نغمة إنجاز مزدوجة (Success Triad)'],
   ['cash_register', 'كاشير ونقدية رقمية (Cash Register)'],
   ['delivery_uplift', 'تسليم ناعم ومتفائل (Smooth Uplift)'],
   ['crystal_bell', 'تنبيه بلوري لطيف (Crystal Bell)'],
   ['marimba_pluck', 'نقرة خشبية دافئة (Marimba Pluck)'],
   ['modern_pulse', 'تنبيه إلكتروني واضح (Modern Pulse)'],
   ['ambient_gong', 'جرس مسرحي هادئ (Ambient Gong)'],
   ['subtle_pop', 'إشعار تنبيهي سريع (Subtle Pop)'],
   ['caution_pulse', 'تحذير وقائي خفيف (Caution Pulse)'],
   ['confirm_deep', 'تأكيد عميق ومطمئن (Deep Confirm)'],
   ['metallic_chime', 'رنين معدني مميز (Metallic Chime)']
 ];

 const defaultSound = () => ({
   enabled: true,
   volume: 75,
   profile: 'balanced', // 'balanced' | 'soft' | 'loud'
   toastDuration: 4000,
   toastPosition: 'top-right', // 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left'
   events: Object.fromEntries(SYSTEM_EVENTS.map(([k, , , defaultTone]) => [
     k,
     { enabled: true, tone: defaultTone, custom: false, name: '' }
   ]))
 });

 function soundCfg() {
   const s = typeof ss === 'function' ? ss() : (window.appState?.settings || {});
   if (!s.sound160 || typeof s.sound160 !== 'object') {
     const def = defaultSound();
     if (s.sound159 && typeof s.sound159 === 'object') {
       def.enabled = s.sound159.enabled !== false;
       if (s.sound159.events) {
         for (const [k, v] of Object.entries(s.sound159.events)) {
           if (def.events[k]) {
             def.events[k].enabled = v.enabled !== false;
             def.events[k].custom = !!v.custom;
             def.events[k].name = v.name || '';
           }
         }
       }
     }
     s.sound160 = def;
   }
   const c = s.sound160;
   const d = defaultSound();
   c.enabled = c.enabled !== false;
   c.volume = Number.isFinite(Number(c.volume)) ? Math.max(0, Math.min(100, Number(c.volume))) : 75;
   c.profile = ['balanced', 'soft', 'loud'].includes(c.profile) ? c.profile : 'balanced';
   c.toastDuration = Number(c.toastDuration) || 4000;
   c.toastPosition = c.toastPosition || 'top-right';
   c.events = { ...d.events, ...(c.events || {}) };
   for (const [k, dVal] of Object.entries(d.events)) {
     c.events[k] = { ...dVal, ...(c.events[k] || {}) };
   }
   return c;
 }

 // IndexedDB for offline custom MP3 storage
 const DB_NAME = 'alhamd-print-audio-160', STORE_NAME = 'clips';
 function openAudioDb() {
   return new Promise((resolve, reject) => {
     const req = indexedDB.open(DB_NAME, 1);
     req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME);
     req.onsuccess = () => resolve(req.result);
     req.onerror = () => reject(req.error);
   });
 }
 async function putClip(k, blob) {
   const d = await openAudioDb();
   return new Promise((resolve, reject) => {
     const t = d.transaction(STORE_NAME, 'readwrite');
     t.objectStore(STORE_NAME).put(blob, k);
     t.oncomplete = () => { d.close(); resolve(); };
     t.onerror = () => { d.close(); reject(t.error); };
   });
 }
 async function getClip(k) {
   const d = await openAudioDb();
   return new Promise((resolve, reject) => {
     const t = d.transaction(STORE_NAME, 'readonly');
     const r = t.objectStore(STORE_NAME).get(k);
     r.onsuccess = () => { d.close(); resolve(r.result || null); };
     r.onerror = () => { d.close(); reject(r.error); };
   });
 }
 async function delClip(k) {
   const d = await openAudioDb();
   return new Promise((resolve, reject) => {
     const t = d.transaction(STORE_NAME, 'readwrite');
     t.objectStore(STORE_NAME).delete(k);
     t.oncomplete = () => { d.close(); resolve(); };
     t.onerror = () => { d.close(); reject(t.error); };
   });
 }

 // High-grade Web Audio API tone synthesis for 12 built-in tones
 function synthesizeTone(toneName, profile = 'balanced', volumePct = 75) {
   try {
     const AudioContext = window.AudioContext || window.webkitAudioContext;
     if (!AudioContext) return;
     const ctx = new AudioContext();
     const now = ctx.currentTime;
     const masterGain = ctx.createGain();
     
     let baseVol = (Math.max(0, Math.min(100, volumePct)) / 100) * 0.12;
     if (profile === 'soft') baseVol *= 0.65;
     if (profile === 'loud') baseVol *= 1.45;
     masterGain.gain.setValueAtTime(baseVol, now);
     
     const filter = ctx.createBiquadFilter();
     if (profile === 'soft') {
       filter.type = 'lowpass';
       filter.frequency.setValueAtTime(1400, now);
     } else if (profile === 'loud') {
       filter.type = 'peaking';
       filter.frequency.setValueAtTime(2800, now);
       filter.Q.setValueAtTime(1.2, now);
       filter.gain.setValueAtTime(4, now);
     } else {
       filter.type = 'allpass';
     }
     masterGain.connect(filter);
     filter.connect(ctx.destination);

     const playNote = (freq, type, startOffset, duration, gainVal = 1) => {
       const osc = ctx.createOscillator();
       const g = ctx.createGain();
       osc.type = type;
       osc.frequency.setValueAtTime(freq, now + startOffset);
       g.gain.setValueAtTime(0.0001, now + startOffset);
       g.gain.linearRampToValueAtTime(gainVal, now + startOffset + 0.02);
       g.gain.exponentialRampToValueAtTime(0.0001, now + startOffset + duration);
       osc.connect(g);
       g.connect(masterGain);
       osc.start(now + startOffset);
       osc.stop(now + startOffset + duration + 0.05);
     };

     switch (toneName) {
       case 'classic_chime':
         playNote(587.33, 'sine', 0, 0.28, 0.9);
         playNote(880.00, 'sine', 0.12, 0.45, 1.0);
         break;
       case 'success_chord':
         playNote(523.25, 'triangle', 0, 0.35, 0.7);
         playNote(659.25, 'triangle', 0.08, 0.4, 0.85);
         playNote(783.99, 'sine', 0.16, 0.55, 1.0);
         playNote(1046.50, 'sine', 0.24, 0.6, 0.75);
         break;
       case 'cash_register':
         playNote(987.77, 'sine', 0, 0.08, 0.9);
         playNote(1318.5, 'sine', 0.08, 0.45, 1.0);
         playNote(1975.5, 'triangle', 0.12, 0.35, 0.4);
         break;
       case 'delivery_uplift':
         playNote(440.00, 'sine', 0, 0.2, 0.6);
         playNote(554.37, 'sine', 0.09, 0.25, 0.75);
         playNote(659.25, 'sine', 0.18, 0.3, 0.85);
         playNote(880.00, 'sine', 0.27, 0.5, 1.0);
         break;
       case 'crystal_bell':
         playNote(1046.5, 'sine', 0, 0.6, 1.0);
         playNote(2093.0, 'sine', 0.02, 0.45, 0.45);
         playNote(3135.9, 'sine', 0.04, 0.3, 0.2);
         break;
       case 'marimba_pluck':
         playNote(440, 'triangle', 0, 0.15, 1.0);
         playNote(880, 'sine', 0, 0.1, 0.5);
         playNote(554, 'triangle', 0.1, 0.25, 0.85);
         break;
       case 'modern_pulse':
         playNote(640, 'square', 0, 0.08, 0.5);
         playNote(960, 'sine', 0.06, 0.28, 0.9);
         break;
       case 'ambient_gong':
         playNote(220, 'sine', 0, 0.9, 1.0);
         playNote(330, 'sine', 0.05, 0.75, 0.6);
         playNote(110, 'triangle', 0, 0.9, 0.4);
         break;
       case 'subtle_pop':
         playNote(740, 'sine', 0, 0.09, 0.85);
         break;
       case 'caution_pulse':
         playNote(520, 'sawtooth', 0, 0.12, 0.5);
         playNote(520, 'sawtooth', 0.18, 0.18, 0.65);
         break;
       case 'confirm_deep':
         playNote(261.63, 'sine', 0, 0.35, 0.8);
         playNote(392.00, 'sine', 0.08, 0.45, 0.95);
         playNote(523.25, 'triangle', 0.16, 0.5, 0.85);
         break;
       case 'metallic_chime':
         playNote(680, 'sine', 0, 0.4, 0.7);
         playNote(1020, 'triangle', 0.04, 0.5, 0.9);
         playNote(1530, 'sine', 0.08, 0.35, 0.5);
         break;
       default:
         playNote(660, 'sine', 0, 0.2, 0.8);
     }
     setTimeout(() => { try { ctx.close(); } catch {} }, 1200);
   } catch {}
 }

 async function playSound(key) {
   const c = soundCfg();
   if (!c.enabled) return;
   const ev = c.events[key] || { enabled: true, tone: 'classic_chime' };
   if (ev.enabled === false) return;

   if (ev.custom) {
     try {
       const clip = await getClip(key);
       if (clip) {
         const url = URL.createObjectURL(clip);
         const a = new Audio(url);
         const v = (c.volume / 100);
         a.volume = Math.max(0, Math.min(1, c.profile === 'soft' ? v * 0.7 : (c.profile === 'loud' ? Math.min(1, v * 1.3) : v)));
         a.onended = () => URL.revokeObjectURL(url);
         await a.play();
         return;
       }
     } catch {}
   }
   const tone = ev.tone || 'classic_chime';
   synthesizeTone(tone, c.profile, c.volume);
 }

 function saveSoundConfig(showSuccessToast = true, reRender = true) {
   if (typeof saveState === 'function') saveState(false);
   if (reRender) renderSoundSettings();
   applyNotificationStyles();
   if (showSuccessToast && typeof showToast === 'function') {
     showToast('تم حفظ إعدادات الأصوات والإشعارات بنجاح.', 'success');
   }
 }

 // Live KPI data calculation
 function computeSoundKpi() {
   const c = soundCfg();
   const totalEvents = SYSTEM_EVENTS.length;
   const activeEvents = Object.values(c.events).filter(e => e.enabled !== false).length;
   const customCount = Object.values(c.events).filter(e => e.custom).length;
   
   const state = window.appState || {};
   const items = state.items || [];
   const orders = state.orders || [];
   const clients = state.clients || [];
   
   let lowStockCount = 0;
   items.forEach(it => {
     const qty = Number(it.qty) || 0;
     const min = Number(it.minQty) || 0;
     if (min > 0 && qty <= min) lowStockCount++;
   });

   const today = typeof todayStr === 'function' ? todayStr() : new Date().toISOString().slice(0, 10);
   let dueDeliveries = 0;
   orders.forEach(o => {
     if (o.status !== 'تم التسليم' && o.status !== 'ملغي' && o.status !== 'مسودة') {
       if (o.deliveryDate && o.deliveryDate <= today) dueDeliveries++;
     }
   });

   let debtClients = 0;
   clients.forEach(cl => {
     const bal = typeof getClientBalance === 'function' ? getClientBalance(cl.id) : (Number(cl.balance) || 0);
     if (bal > 0) debtClients++;
   });

   return {
     soundEnabled: c.enabled,
     volume: c.volume,
     profile: c.profile,
     activeEvents,
     totalEvents,
     customCount,
     lowStockCount,
     dueDeliveries,
     debtClients
   };
 }

 // Render the Comprehensive Notifications & Sounds Settings View
 function renderSoundSettings() {
   const host = $('subtab-notificationsTab') || $('subtab-soundTab159') || $('subtab-soundTab160');
   if (!host) return;
   let studio = $('soundStudioRoot160');
   if (!studio) {
     studio = document.createElement('div');
     studio.id = 'soundStudioRoot160';
     host.prepend(studio);
   }
   const c = soundCfg();
   const kpi = computeSoundKpi();

   const toastPositions = [
     ['top-right', 'أعلى اليمين (افتراضي)'],
     ['top-left', 'أعلى اليسار'],
     ['top-center', 'أعلى المنتصف'],
     ['bottom-right', 'أسفل اليمين'],
     ['bottom-left', 'أسفل اليسار']
   ];

   const toastDurations = [
     [2000, 'ثانيتان (سريع)'],
     [3000, '3 ثوانٍ'],
     [4000, '4 ثوانٍ (قياسي)'],
     [6000, '6 ثوانٍ'],
     [8000, '8 ثوانٍ'],
     [10000, '10 ثوانٍ (طويل)']
   ];

   studio.innerHTML = `
     <div class="space-y-6" dir="rtl">
       <!-- Header -->
       <div class="border-b pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
         <div>
           <h2 class="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
             <i class="fa-solid fa-volume-high text-teal-600"></i>
             <span>مركز الإشعارات والأصوات</span>
           </h2>
           <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
             تحكم شامل في المؤشرات الحية، الأصوات التفاعلية لـ 16 حدثاً، النغمات المدمجة، ورفع مقاطع MP3 مخصصة.
           </p>
         </div>
         <div class="flex items-center gap-2">
           <button type="button" onclick="sound160ResetDefaults()" class="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
             <i class="fa-solid fa-rotate-right ml-1"></i>استعادة الافتراضي
           </button>
           <button type="button" onclick="sound160TestAll()" class="px-3.5 py-2 text-xs font-bold rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition shadow-sm">
             <i class="fa-solid fa-play ml-1"></i>تجربة نغمة عشوائية
           </button>
         </div>
       </div>

       <!-- Live KPI Indicators Banner -->
       <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
         <div class="p-4 rounded-2xl border ${c.enabled ? 'border-emerald-200 bg-emerald-50/70 dark:bg-emerald-950/20' : 'border-amber-200 bg-amber-50/70 dark:bg-amber-950/20'}">
           <div class="flex items-center justify-between">
             <span class="text-xs font-bold text-slate-600 dark:text-slate-300">حالة الصوت العام</span>
             <i class="fa-solid ${c.enabled ? 'fa-volume-high text-emerald-600' : 'fa-volume-xmark text-amber-600'} text-lg"></i>
           </div>
           <p class="text-lg font-black mt-2 ${c.enabled ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}">
             ${c.enabled ? 'مفعّل وشغال' : 'صامت (مكتوم)'}
           </p>
           <p id="soundKpiVolLabel160" class="text-[11px] text-slate-500 mt-0.5">${c.volume}% مستوى الصوت</p>
         </div>

         <div class="p-4 rounded-2xl border border-teal-200 bg-teal-50/60 dark:bg-teal-950/20">
           <div class="flex items-center justify-between">
             <span class="text-xs font-bold text-slate-600 dark:text-slate-300">الأحداث المفعلة</span>
             <i class="fa-solid fa-sliders text-teal-600 text-lg"></i>
           </div>
           <p class="text-lg font-black mt-2 text-teal-700 dark:text-teal-300 font-mono">
             ${kpi.activeEvents} / ${kpi.totalEvents}
           </p>
           <p class="text-[11px] text-slate-500 mt-0.5">حدث يصدر صوتاً</p>
         </div>

         <div class="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/60 dark:bg-indigo-950/20">
           <div class="flex items-center justify-between">
             <span class="text-xs font-bold text-slate-600 dark:text-slate-300">مقاطع MP3 المرفوعة</span>
             <i class="fa-solid fa-file-audio text-indigo-600 text-lg"></i>
           </div>
           <p class="text-lg font-black mt-2 text-indigo-700 dark:text-indigo-300 font-mono">
             ${kpi.customCount} مقطع مخصص
           </p>
           <p class="text-[11px] text-slate-500 mt-0.5">محفوظة محلياً في الذاكرة</p>
         </div>

         <div class="p-4 rounded-2xl border border-sky-200 bg-sky-50/60 dark:bg-sky-950/20">
           <div class="flex items-center justify-between">
             <span class="text-xs font-bold text-slate-600 dark:text-slate-300">ملخص التنبيهات الحية</span>
             <i class="fa-solid fa-bell text-sky-600 text-lg"></i>
           </div>
           <div class="text-xs font-bold mt-2 space-y-0.5 text-slate-700 dark:text-slate-200">
             <div>نواقص المخزن: <span class="font-mono ${kpi.lowStockCount > 0 ? 'text-rose-600 font-black' : 'text-slate-500'}">${kpi.lowStockCount}</span></div>
             <div>مواعيد التسليم: <span class="font-mono ${kpi.dueDeliveries > 0 ? 'text-amber-600 font-black' : 'text-slate-500'}">${kpi.dueDeliveries}</span></div>
             <div>مديونيات العملاء: <span class="font-mono text-indigo-600">${kpi.debtClients}</span></div>
           </div>
         </div>
       </div>

       <!-- Master Controller & Profile Card -->
       <div class="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm space-y-4">
         <h3 class="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
           <i class="fa-solid fa-tower-broadcast text-teal-600"></i>
           <span>المتحكم الرئيسي بالصوت ونظام الإشعارات</span>
         </h3>

         <div class="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
           <!-- Master Toggle -->
           <label class="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer">
             <input type="checkbox" ${c.enabled ? 'checked' : ''} onchange="sound160SetMaster(this.checked)" class="w-5 h-5 accent-teal-600">
             <div>
               <b class="text-sm block">تشغيل أصوات البرنامج العامة</b>
               <span class="text-[11px] text-slate-500">كتم أو تشغيل كافة الأحداث الصوتية بضغطة زر</span>
             </div>
           </label>

           <!-- Master Volume Slider -->
           <div class="space-y-1.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
             <div class="flex justify-between items-center text-xs font-bold">
               <span>مستوى الصوت العام:</span>
               <span id="soundVolOutput160" class="font-mono text-teal-600">${c.volume}%</span>
             </div>
             <input type="range" id="soundVolSlider160" min="0" max="100" step="5" value="${c.volume}"
               oninput="if(document.getElementById('soundVolOutput160'))document.getElementById('soundVolOutput160').textContent = this.value + '%'; window.sound160SetVolume(this.value, true)"
               onchange="window.sound160SetVolume(this.value, false)"
               class="w-full accent-teal-600 cursor-pointer">
           </div>

           <!-- Sound Profile Selection -->
           <div class="space-y-1.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
             <label class="block text-xs font-bold text-slate-700 dark:text-slate-200">البروفايل الصوتي (طابع النغمات):</label>
             <select onchange="sound160SetProfile(this.value)" class="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-bold bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100">
               <option value="balanced" ${c.profile === 'balanced' ? 'selected' : ''}>متوازن قياسي (للاستخدام اليومي)</option>
               <option value="soft" ${c.profile === 'soft' ? 'selected' : ''}>هادئ وناعم (مريح للأذن)</option>
               <option value="loud" ${c.profile === 'loud' ? 'selected' : ''}>واضح وقوي لبيئة العمل (للمطابع والمشاغل)</option>
             </select>
           </div>
         </div>

         <!-- Toast Position & Duration -->
         <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-700">
           <div>
             <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">مكان ظهور رسائل الإشعار على الشاشة:</label>
             <select onchange="sound160SetToastPosition(this.value)" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-bold bg-white dark:bg-slate-700">
               ${toastPositions.map(([val, label]) => `<option value="${val}" ${c.toastPosition === val ? 'selected' : ''}>${label}</option>`).join('')}
             </select>
           </div>
           <div>
             <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">مدة بقاء رسالة الإشعار قبل الاختفاء التلقائي:</label>
             <select onchange="sound160SetToastDuration(this.value)" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-bold bg-white dark:bg-slate-700">
               ${toastDurations.map(([val, label]) => `<option value="${val}" ${Number(c.toastDuration) === val ? 'selected' : ''}>${label}</option>`).join('')}
             </select>
           </div>
         </div>
       </div>

       <!-- The 16 Discrete System Events Matrix -->
       <div class="space-y-3">
         <div class="flex items-center justify-between">
           <h3 class="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
             <i class="fa-solid fa-list-check text-teal-600"></i>
             <span>تخصيص الأحداث الصوتية الـ 16 وتعيين النغمات وملفات MP3</span>
           </h3>
           <span class="text-xs text-slate-500">اختر نغمة مدمجة أو ارفع ملف MP3 خاص بك لكل حدث</span>
         </div>

         <div class="grid grid-cols-1 gap-2.5">
           ${SYSTEM_EVENTS.map(([key, label, desc, defaultTone]) => {
             const ev = c.events[key] || { enabled: true, tone: defaultTone, custom: false, name: '' };
             const isChecked = ev.enabled !== false;
             return `
               <section class="rounded-xl border p-3.5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 transition hover:border-teal-300">
                 <div class="min-w-0 flex-1">
                   <div class="flex items-center gap-2.5">
                     <input type="checkbox" id="ev_chk_${key}" ${isChecked ? 'checked' : ''} onchange="sound160ToggleEvent('${key}', this.checked)" class="w-4 h-4 accent-teal-600 cursor-pointer">
                     <label for="ev_chk_${key}" class="text-sm font-black text-slate-800 dark:text-slate-100 cursor-pointer">${label}</label>
                     ${ev.custom ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"><i class="fa-solid fa-music ml-1"></i>ملف مخصص</span>` : `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">نغمة مدمجة</span>`}
                   </div>
                   <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 mr-6">${desc}</p>
                   ${ev.custom && ev.name ? `<div class="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono mt-1 mr-6 flex items-center gap-1"><i class="fa-solid fa-paperclip"></i><span>${esc(ev.name)}</span></div>` : ''}
                 </div>

                 <!-- Controls -->
                 <div class="flex flex-wrap items-center gap-2 mr-6 md:mr-0">
                   <!-- Tone select -->
                   <select onchange="sound160SetTone('${key}', this.value)" title="النغمة المدمجة" class="text-xs font-bold border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500">
                     ${BUILTIN_TONES.map(([tKey, tLabel]) => `<option value="${tKey}" ${(ev.tone || defaultTone) === tKey ? 'selected' : ''}>${tLabel}</option>`).join('')}
                   </select>

                   <!-- Test button -->
                   <button type="button" onclick="sound160TestSingle('${key}')" class="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition flex items-center gap-1 text-slate-700 dark:text-slate-200" title="تجربة الصوت">
                     <i class="fa-solid fa-play text-[10px]"></i><span>تجربة</span>
                   </button>

                   <!-- Upload MP3 button -->
                   <label class="px-3 py-1.5 text-xs font-bold rounded-lg border border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-900/30 text-teal-800 dark:text-teal-200 hover:bg-teal-100 cursor-pointer transition flex items-center gap-1" title="رفع مقطع صوتي MP3">
                     <i class="fa-solid fa-upload text-[10px]"></i><span>ملف MP3</span>
                     <input type="file" accept="audio/mpeg,.mp3" class="hidden" onchange="sound160UploadClip('${key}', this.files[0])">
                   </label>

                   <!-- Clear custom MP3 button -->
                   ${ev.custom ? `
                     <button type="button" onclick="sound160ClearClip('${key}')" class="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition" title="استعادة النغمة الافتراضية">
                       <i class="fa-solid fa-trash text-[10px]"></i>
                     </button>
                   ` : ''}
                 </div>
               </section>
             `;
           }).join('')}
         </div>
       </div>
     </div>
   `;
 }

 window.getSoundConfig160 = soundCfg;
 window.renderSoundSettings = renderSoundSettings;
 window.sound160SetMaster = v => {
   soundCfg().enabled = !!v;
   saveSoundConfig();
 };
 window.sound160SetVolume = (v, isLiveInput = false) => {
   const vol = Math.max(0, Math.min(100, Number(v) ?? 75));
   soundCfg().volume = vol;
   const out = document.getElementById('soundVolOutput160');
   if (out) out.textContent = vol + '%';
   const kpiVol = document.getElementById('soundKpiVolLabel160');
   if (kpiVol) kpiVol.textContent = vol + '% مستوى الصوت';
   if (!isLiveInput) {
     saveSoundConfig(false, false);
   }
 };
 window.sound160SetProfile = p => {
   soundCfg().profile = p;
   saveSoundConfig();
   synthesizeTone('classic_chime', p, soundCfg().volume);
 };
 window.sound160SetToastPosition = pos => {
   soundCfg().toastPosition = pos;
   saveSoundConfig();
   applyNotificationStyles();
   if (typeof showToast === 'function') showToast('تم تحديث موقع ظهور الإشعارات على الشاشة.', 'info');
 };
 window.sound160SetToastDuration = dur => {
   soundCfg().toastDuration = Number(dur) || 4000;
   saveSoundConfig();
   applyNotificationStyles();
   if (typeof showToast === 'function') showToast('تم تحديث مدة بقاء الإشعار.', 'info');
 };
 window.sound160ToggleEvent = (k, v) => {
   soundCfg().events[k].enabled = !!v;
   saveSoundConfig(false);
 };
 window.sound160SetTone = (k, tone) => {
   const e = soundCfg().events[k];
   e.tone = tone;
   e.custom = false;
   e.name = '';
   saveSoundConfig(false);
   synthesizeTone(tone, soundCfg().profile, soundCfg().volume);
 };
 window.sound160TestSingle = k => playSound(k);
 window.sound160TestAll = () => {
   const keys = SYSTEM_EVENTS.map(x => x[0]);
   const randomKey = keys[Math.floor(Math.random() * keys.length)];
   playSound(randomKey);
 };
 window.sound160ClearClip = async k => {
   try { await delClip(k); } catch {}
   const e = soundCfg().events[k];
   e.custom = false;
   e.name = '';
   saveSoundConfig();
 };
 window.sound160UploadClip = async (k, file) => {
   if (!file) return;
   if (!/.mp3$/i.test(file.name) || (file.type && !file.type.includes('audio') && !file.type.includes('mpeg') && !file.type.includes('mp3'))) {
     if (typeof showToast === 'function') showToast('الرجاء اختيار ملف بصيغة MP3 صالحة فقط.', 'warning');
     return;
   }
   if (file.size > 3 * 1024 * 1024) {
     if (typeof showToast === 'function') showToast('الحد الأقصى لحجم الملف هو 3 ميجابايت.', 'warning');
     return;
   }
   try {
     const buf = await file.slice(0, 4).arrayBuffer();
     const h = new Uint8Array(buf);
     const id3 = h[0] === 0x49 && h[1] === 0x44 && h[2] === 0x33;
     const frame = h[0] === 0xff && (h[1] & 0xe0) === 0xe0;
     if (!id3 && !frame) {
       if (typeof showToast === 'function') showToast('الملف المختار غير صالح بصيغة MP3 القياسية.', 'warning');
       return;
     }
     await putClip(k, file.slice(0, file.size, 'audio/mpeg'));
     const e = soundCfg().events[k];
     e.custom = true;
     e.name = file.name;
     saveSoundConfig();
     playSound(k);
     if (typeof showToast === 'function') showToast(`تم تعيين المقطع الصوتي (${file.name}) للحدث بنجاح.`, 'success');
   } catch (err) {
     if (typeof showToast === 'function') showToast('تعذر حفظ الملف في التخزين الموضعي.', 'danger');
   }
 };
 window.sound160ResetDefaults = () => {
   if (typeof requireAdminPin === 'function') {
     requireAdminPin('استعادة الإعدادات الصوتية الافتراضية', () => {
       const s = typeof ss === 'function' ? ss() : window.appState.settings;
       s.sound160 = defaultSound();
       saveSoundConfig();
     });
   } else {
     const s = typeof ss === 'function' ? ss() : window.appState.settings;
     s.sound160 = defaultSound();
     saveSoundConfig();
   }
 };

 // Toast positioning & duration styling
 function applyNotificationStyles() {
   const c = soundCfg();
   const tc = $('toastContainer') || $('toastsContainer') || document.querySelector('.toast-container');
   if (tc) {
     tc.className = 'fixed z-50 flex flex-col gap-2 pointer-events-none p-4 max-w-sm w-full';
     switch (c.toastPosition) {
       case 'top-left':
         tc.style.top = '1rem'; tc.style.left = '1rem'; tc.style.right = 'auto'; tc.style.bottom = 'auto';
         break;
       case 'top-center':
         tc.style.top = '1rem'; tc.style.left = '50%'; tc.style.transform = 'translateX(-50%)'; tc.style.right = 'auto'; tc.style.bottom = 'auto';
         break;
       case 'bottom-right':
         tc.style.bottom = '1rem'; tc.style.right = '1rem'; tc.style.left = 'auto'; tc.style.top = 'auto';
         break;
       case 'bottom-left':
         tc.style.bottom = '1rem'; tc.style.left = '1rem'; tc.style.right = 'auto'; tc.style.top = 'auto';
         break;
       case 'top-right':
       default:
         tc.style.top = '1rem'; tc.style.right = '1rem'; tc.style.left = 'auto'; tc.style.bottom = 'auto';
         break;
     }
   }
 }

 // Seamless integration with switchSettingsTab
 const originalSwitchSettingsTab = window.switchSettingsTab;
 if (typeof originalSwitchSettingsTab === 'function' && !originalSwitchSettingsTab._160) {
   const wrapped = function(id, ...args) {
     const res = originalSwitchSettingsTab.call(this, id, ...args);
     if (id === 'notificationsTab' || id === 'soundTab159' || id === 'soundTab160') {
       renderSoundSettings();
     }
     return res;
   };
   wrapped._160 = true;
   window.switchSettingsTab = wrapped;
 }

 // Install or merge tab button in settings header
 function installSoundTab() {
   const nav = document.querySelector('.settings-nav-btn')?.parentElement;
   const host = $('subtab-lockTab')?.parentElement;
   if (!nav || !host) return;

   const notifBtn = nav.querySelector('[data-subtab="notificationsTab"]');
   if (notifBtn) {
     notifBtn.innerHTML = '<i class="fa-solid fa-volume-high ml-1.5"></i>الإشعارات والأصوات';
     notifBtn.onclick = () => window.switchSettingsTab('notificationsTab');
   }

   const oldBtn = nav.querySelector('[data-subtab="soundTab159"]');
   if (oldBtn) oldBtn.remove();
   const oldPanel = $('subtab-soundTab159');
   if (oldPanel) oldPanel.remove();

   let panel = $('subtab-notificationsTab');
   if (!panel) {
     panel = document.createElement('div');
     panel.id = 'subtab-notificationsTab';
     panel.className = 'p-6 space-y-5 hidden';
     host.append(panel);
   }

   if (!$('subtab-mobileTab159') && !nav.querySelector('[data-subtab="mobileTab159"]')) {
     const b = document.createElement('button');
     b.className = 'settings-nav-btn px-4 py-2 text-xs font-bold rounded-xl transition text-slate-600 hover:bg-slate-200';
     b.dataset.subtab = 'mobileTab159';
     b.innerHTML = '<i class="fa-solid fa-mobile-screen-button ml-1.5"></i>ربط الهاتف';
     b.onclick = () => window.switchSettingsTab('mobileTab159');
     nav.append(b);
     const mPanel = document.createElement('div');
     mPanel.id = 'subtab-mobileTab159';
     mPanel.className = 'p-6 space-y-4 hidden';
     mPanel.innerHTML = '<h3 class="text-lg font-black">ربط تطبيق الهاتف</h3><p class="text-sm text-slate-600 dark:text-slate-300">اختر الربط المحلي داخل المطبعة أو Tailscale من خارجها. انسخ بيانات الربط الموحدة لتطبيق Android، ثم سجّل دخول حساب البرنامج بصلاحياته. الربط والحسابات المستقلة على الهاتف منفصلان.</p><button type="button" class="rounded-xl bg-teal-600 text-white font-bold px-4 py-2" onclick="window.openLanSyncSettings?.()">فتح إعدادات ربط الهاتف</button><div class="rounded-xl border border-amber-300 bg-amber-50 text-amber-900 p-3 text-xs leading-6">تسجيل الدخول من تطبيق Android يستخدم HTTPS وبصمة شهادة الكمبيوتر. تظهر البصمة في شاشة الربط وتُنسخ تلقائيًا ضمن بيانات الربط الموحدة. الكمبيوتر والبرنامج يظلان مفتوحين.</div>';
     host.append(mPanel);
   }

   applyNotificationStyles();
 }

 // Hook showToast to trigger notification sounds, custom duration & position
 const origToast = window.showToast;
 if (typeof origToast === 'function' && !origToast._sound160) {
   const hookedToast = function(msg, type, ...args) {
     const m = String(msg || '');
     
     if (/تسجيل الدخول|أهلاً|مرحباً/.test(m)) playSound('login');
     else if (/القفل التلقائي|تم قفل|قفل البرنامج/.test(m)) playSound('lock');
     else if (/حفظ الفاتورة|تم تسجيل الفاتورة|تم تعديل الفاتورة/.test(m)) playSound('invoice');
     else if (/تم التسليم|تسليم العميل|تسليم الطلب/.test(m)) playSound('delivery');
     else if (/تغيير حالة|حالة التشغيل|أمر الشغل|قيد التنفيذ|جاهز للتسليم/.test(m)) playSound('statusChange');
     else if (/عرض السعر|مسودة|حفظ كمسودة/.test(m)) playSound('quote');
     else if (/تحصيل|سند قبض|وارد خزينة|تم استلام المبلغ|تم تسجيل المقبوض/.test(m)) playSound('cashIn');
     else if (/صرف|مصروف|سداد مورد|سند صرف|صادر خزينة/.test(m)) playSound('cashOut');
     else if (/وارد خامات|فاتورة مشتريات|استلام خامات/.test(m)) playSound('purchase');
     else if (/إضافة صنف|خامة جديدة|اعتماد جرد|تسوية الجرد/.test(m)) playSound('inventory');
     else if (/حد الطلب|نواقص المخزن|خامة تحتاج توريد|الرصيد أوشك على النفاد/.test(m)) playSound('lowStock');
     else if (/عميل جديد|مورد جديد|خدمة جديدة|تم إضافة العميل|تم إضافة المورد/.test(m)) playSound('contactAdd');
     else if (/نسخ احتياطي|تم حفظ النسخة|اكتمل النسخ/.test(m)) playSound('backup');
     else if (/حذف|تم حذف|مسح السجل/.test(m)) playSound('delete');
     else if (['danger', 'error'].includes(type) || /خطأ|عفواً|تعذر|غير صحيح|غير مسموح/.test(m)) playSound('error');
     else if (['warning'].includes(type)) playSound('error');
     else playSound('notify');

     applyNotificationStyles();
     return origToast.call(this, msg, type, ...args);
   };
   hookedToast._sound160 = true;
   window.showToast = hookedToast;
 }

 // Hook window.lockSystem
 const origLock = window.lockSystem;
 if (typeof origLock === 'function' && !origLock._sound160) {
   const hookedLock = function(...args) {
     const res = origLock.apply(this, args);
     playSound('lock');
     return res;
   };
   hookedLock._sound160 = true;
   window.lockSystem = hookedLock;
 }

 // Manual line net and invoice net calculator
 window.onSaleLineNetInput = function(netInput) {
   const row = netInput?.closest('.sale-line');
   if (!row) return;
   const qtyInput = row.querySelector('.sl-qty');
   const priceInput = row.querySelector('.sl-price');
   const discInput = row.querySelector('.sl-disc');
   const dtypeSelect = row.querySelector('.sl-dtype');
   
   const targetNet = Math.max(0, Number(netInput.value) || 0);
   const qty = Math.max(0, Number(qtyInput?.value) || 0);
   const discVal = Math.max(0, Number(discInput?.value) || 0);
   const discType = dtypeSelect?.value || 'amt';

   if (qty > 0 && priceInput) {
     let unitPrice = 0;
     if (discType === 'pct') {
       const pct = Math.min(discVal, 99.99);
       const factor = 1 - (pct / 100);
       unitPrice = factor > 0 ? (targetNet / (qty * factor)) : (targetNet / qty);
     } else {
       unitPrice = (targetNet + discVal) / qty;
     }
     priceInput.value = (Math.round(unitPrice * 100) / 100).toFixed(2);
     row.dataset.autoPrice = '0';
     if (typeof calcSale === 'function') calcSale();
   }
 };

 window.onSaleLineNetChange = function(netInput) {
   window.onSaleLineNetInput(netInput);
 };

 // Net adjustment for the whole invoice (saleTotal)
 let manualInvoiceTarget = null, manualInvoiceBusy = false;
 window.applyInvoiceNet = function() {
   const input = $('saleTotal');
   if (!input || manualInvoiceTarget == null) return;
   const target = Math.round(Number(manualInvoiceTarget) * 100) / 100;
   manualInvoiceTarget = null;
   if (!Number.isFinite(target) || target < 0) {
     if (typeof showToast === 'function') showToast('أدخل صافيًا صحيحًا غير سالب.', 'warning');
     if (typeof calcSale === 'function') calcSale();
     return;
   }
   if (typeof can === 'function' && !can(window.EDIT?.order ? 'inv_edit' : 'inv_create')) {
     if (typeof permDeny === 'function') permDeny();
     if (typeof calcSale === 'function') calcSale();
     return;
   }

   const rows = [...document.querySelectorAll('#saleLines .sale-line')].filter(r => r.querySelector('.sl-price') && Number(r.querySelector('.sl-qty')?.value) > 0);
   if (!rows.length) {
     if (typeof showToast === 'function') showToast('أضف صنفًا وكمية أولًا.', 'warning');
     if (typeof calcSale === 'function') calcSale();
     return;
   }

   let original = rows.map(row => ({
     row,
     price: Math.max(0, Number(row.querySelector('.sl-price').value) || 0),
     qty: Number(row.querySelector('.sl-qty').value) || 0
   }));
   if (original.every(x => x.price === 0)) {
     const qsum = original.reduce((n, x) => n + x.qty, 0) || 1;
     original = original.map(x => ({ ...x, price: x.qty / qsum }));
   }
   const compute = f => {
     for (const x of original) x.row.querySelector('.sl-price').value = (x.price * f).toFixed(4);
     return Number(readSale().total) || 0;
   };
   let lo = 0, hi = 10000;
   for (let i = 0; i < 52; i++) {
     const mid = (lo + hi) / 2;
     if (compute(mid) < target) lo = mid; else hi = mid;
   }
   const factor = (lo + hi) / 2;
   for (const x of original) x.row.querySelector('.sl-price').value = Math.max(0, Math.round(x.price * factor * 100) / 100).toFixed(2);
   manualInvoiceBusy = true;
   try { if (typeof calcSale === 'function') calcSale(); } finally { manualInvoiceBusy = false; }
   const actual = Number(readSale().total) || 0;
   input.value = actual.toFixed(2);
   if (Math.abs(actual - target) > 0.02 && typeof showToast === 'function') {
     showToast('تم ضبط أسعار الوحدات لأقرب صافي ممكن حسب الخصومات والتقريب.', 'info');
   }
 };

 // Backward compatibility alias
 window.applyNet = window.applyInvoiceNet;

 // Robust treasury source navigation across filters and pagination
 const oldOpenSource = window.openTreasurySource;
 function jumpRecord(tab, key, record, render, searchIds = []) {
   if (typeof switchTab === 'function') switchTab(tab);
   if (tab === 'orders') {
     if (typeof setSalesRange === 'function') setSalesRange('all');
     else if (typeof salesRange !== 'undefined') salesRange = 'all';
   }
   for (const id of searchIds) {
     const el = $(id);
     if (el) el.value = '';
   }
   try {
     if (typeof ss === 'function') {
       ss().tableViews = ss().tableViews || {};
       ss().tableViews[key] = { rules: [], sort: '', dir: 'asc' };
     }
   } catch {}
   const st = window.PAGE_STATE?.[key];
   if (st) st.page = 0;
   setTimeout(() => {
     render?.();
     const state = window.PAGE_STATE?.[key];
     if (state && record) {
       const ix = (state.all || []).findIndex(x => String(x.id) === String(record.id));
       if (ix >= 0) {
         state.page = Math.floor(ix / state.pageSize);
         state.render?.();
       }
     }
     setTimeout(() => {
       const body = $(key), rows = [...(body?.querySelectorAll('tr') || [])];
       let row = rows.find(tr => tr.dataset.recordId === String(record?.id));
       if (!row && record) row = rows.find(tr => tr.innerText.includes(String(record.orderNo || record.no || record.id)));
       if (row) {
         row.scrollIntoView({ behavior: 'smooth', block: 'center' });
         row.classList.add('row-flash');
         setTimeout(() => row.classList.remove('row-flash'), 3000);
       } else if (typeof showToast === 'function') {
         showToast('تم فتح القسم وإزالة الفلاتر؛ لم يظهر السجل في القائمة. استخدم البحث داخل القسم.', 'info');
       }
     }, 100);
   }, 80);
 }

 window.openTreasurySource = function(id) {
   const state = window.appState || {};
   const t = (state.treasury || []).find(x => String(x.id) === String(id));
   if (!t) return oldOpenSource?.call(this, id);
   const d = String(t.desc || ''), num = (d.match(/#\s*([\w-]+)/) || [])[1];
   if (t.orderId || /فاتورة #|أمر شغل #/.test(d)) {
     const o = (state.orders || []).find(x => String(x.id) === String(t.orderId)) || (state.orders || []).find(x => String(x.orderNo || x.no) === String(num));
     if (o && typeof renderOrdersTable === 'function') return jumpRecord('orders', 'ordersTableBody', o, renderOrdersTable, ['searchOrdersInput', 'filterOrderStatus']);
   }
   if (t.purchaseId) {
     const p = (state.purchases || []).find(x => String(x.id) === String(t.purchaseId));
     if (p && typeof renderPurchasesTable === 'function') return jumpRecord('purchases', 'purchasesTableBody', p, renderPurchasesTable, ['searchPurchasesInput', 'purchaseSearch152']);
   }
   if (t.serviceId) {
     const s = (state.services || []).find(x => String(x.id) === String(t.serviceId));
     if (s && typeof renderServicesTable === 'function') return jumpRecord('services', 'servicesTableBody', s, renderServicesTable, ['searchServicesInput']);
   }
   return oldOpenSource?.call(this, id);
 };

 // Hook switchTab so opening settings always installs and renders Sound & Notifications tab
 const origSwitchTab160 = window.switchTab;
 if (typeof origSwitchTab160 === 'function' && !origSwitchTab160._soundTab160) {
   const wrappedTab = function(id, ...args) {
     const res = origSwitchTab160.call(this, id, ...args);
     if (id === 'settings') {
       installSoundTab();
       renderSoundSettings();
     }
     return res;
   };
   wrappedTab._soundTab160 = true;
   window.switchTab = wrappedTab;
 }

 // ============================================================================
 // 2. UNIFIED ROW COUNT COMBOBOX HANDLERS (حقل عدد الصفوف الموحد)
 // ============================================================================
 window.openRowComboMenu160 = function(key) {
   document.querySelectorAll('.row-combo-menu160').forEach(el => {
     if (el.id !== key + 'ComboMenu160') el.classList.add('hidden');
   });
   const menu = $(key + 'ComboMenu160');
   if (menu) menu.classList.remove('hidden');
 };
 window.toggleRowComboMenu160 = function(key) {
   const menu = $(key + 'ComboMenu160');
   if (!menu) return;
   const isHidden = menu.classList.contains('hidden');
   document.querySelectorAll('.row-combo-menu160').forEach(el => el.classList.add('hidden'));
   if (isHidden) {
     menu.classList.remove('hidden');
     $(key + 'PageSize')?.focus();
   }
 };
 document.addEventListener('pointerdown', e => {
   if (!e.target.closest?.('.row-combo160')) {
     document.querySelectorAll('.row-combo-menu160').forEach(el => el.classList.add('hidden'));
   }
 });

 // ============================================================================
 // 3. JSON BACKUP & FACTORY RESET (نسخ احتياطي بصيغة .json + ضبط المصنع)
 // ============================================================================
 function formatBackupFilename12h153(prefix = 'الحمد_برنت_نسخة') {
   if (typeof window.formatBackupTimestamp12h === 'function') {
     const res = window.formatBackupTimestamp12h(new Date());
     const stampStr = typeof res === 'object' ? (res.stamp || res.filename || '') : String(res);
     if (stampStr.endsWith('.json')) return stampStr;
     return `${prefix}_${stampStr}.json`;
   }
   const d = new Date();
   const pad = n => String(n).padStart(2, '0');
   const yyyy = d.getFullYear();
   const mm = pad(d.getMonth() + 1);
   const dd = pad(d.getDate());
   const h24 = d.getHours();
   const h12 = pad(h24 % 12 || 12);
   const min = pad(d.getMinutes());
   const sec = pad(d.getSeconds());
   const ampm = h24 >= 12 ? 'م' : 'ص';
   return `${prefix}_${yyyy}-${mm}-${dd}_${h12}-${min}-${sec}_${ampm}.json`;
 }

 function recordJsonBackupLog160(filename, reason) {
   try {
     const ts = new Date().toLocaleString('ar-EG', {
       year: 'numeric', month: '2-digit', day: '2-digit',
       hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
     });
     if (typeof addBackupLogEntry === 'function') addBackupLogEntry(filename, reason, ts);
     const hist = JSON.parse(localStorage.getItem('alhamd_json_backup_history_160') || '[]');
     hist.unshift({ filename, reason, timestamp: ts });
     localStorage.setItem('alhamd_json_backup_history_160', JSON.stringify(hist.slice(0, 20)));
   } catch {}
 }

 // Universal OS Save As file dialog helper (إلغاء الحفظ المباشر وفتح نافذة اختيار مكان الحفظ)
 window.saveFileWithDialog32 = async function(blob, suggestedName, mimeType = "application/octet-stream", description = "ملف", ext = "dat") {
   const cleanExt = String(ext || "dat").replace(/^\.+/, "");
   const finalName = String(suggestedName || ("file." + cleanExt));
   if (typeof window.showSaveFilePicker === "function") {
     try {
       const handle = await window.showSaveFilePicker({
         suggestedName: finalName,
         types: [{
           description: description || "ملف",
           accept: { [mimeType || "application/octet-stream"]: ["." + cleanExt] }
         }]
       });
       const writable = await handle.createWritable();
       await writable.write(blob);
       await writable.close();
       return { ok: true, path: handle.name || finalName };
     } catch (err) {
       if (err && (err.name === "AbortError" || /abort|cancel/i.test(err.message || ""))) {
         return { ok: false, canceled: true };
       }
     }
   }
   const url = URL.createObjectURL(blob);
   const a = document.createElement("a");
   a.href = url;
   a.download = finalName;
   document.body.appendChild(a);
   a.click();
   a.remove();
   setTimeout(() => URL.revokeObjectURL(url), 5000);
   return { ok: true, path: finalName };
 };

 window.exportBackupJsonFile160 = async function(customPrefix = 'الحمد_برنت_نسخة') {
   if(window.api?.backupZip402)return window.Backup402UI.exportBackup();
   if(window.api?.opsFullBackup)return window.api.opsFullBackup();

   if (window.appState?.isLocked || (typeof can === 'function' && !can('sets_backup'))) {
     return typeof permDeny === 'function' ? permDeny() : null;
   }
   const payload = Object.assign({}, window.appState, {
     backupMetadata: {
       version: '3.6.0',
       format: 'json',
       exportedAt: new Date().toISOString(),
       exportedBy: typeof getCurrentUser === 'function' ? getCurrentUser().name : 'admin'
     }
   });
   const jsonText = JSON.stringify(payload, null, 2);
   const filename = formatBackupFilename12h153(customPrefix);
   const blob = new Blob([jsonText], { type: 'application/json;charset=utf-8' });
   const saved = await window.saveFileWithDialog32(blob, filename, 'application/json', 'ملف نسخة احتياطية JSON', 'json');
   if (saved?.canceled) return { ok: false, canceled: true };
   recordJsonBackupLog160(saved?.path || filename, 'تصدير JSON (الإصدار 3.2)');
   playSound('backup');
   return { ok: true, name: saved?.path || filename, path: saved?.path || filename, orders: (window.appState?.orders || []).length, items: (window.appState?.items || []).length, treasury: (window.appState?.treasury || []).length, attachments: 0 };
 };

 // Factory Reset function (ضبط المصنع الآمن مع نسخة احتياطية تلقائية قبل المسح)
 window.triggerFactoryReset = function() {
   if (window.appState?.isLocked || (typeof isAdmin === 'function' && !isAdmin())) {
     return typeof permDeny === 'function' ? permDeny('عملية ضبط المصنع متاحة للمدير فقط') : null;
   }
   const runReset = () => {
     try {
       const currentJson = JSON.stringify(window.appState || {});
       try { window.api?.snapshot?.(currentJson, 'before-factory-reset'); } catch {}
       if(!window.api?.opsFullBackup)try { localStorage.setItem('ALHAMD_PRINT_ERP_v4_before_factory_reset', currentJson); } catch {}
       const adminPin = window.api?.hashPin ? window.api.hashPin('1234') : '1234';
       const freshState = typeof normalizeState === 'function'
         ? normalizeState({
             users: [{ id: 'u_admin', username: 'المدير', pin: adminPin, pinDefault: true, role: 'admin', name: 'المدير العام' }],
             currentUser: 'u_admin',
             isLocked: false,
             orders: [],
             items: [],
             purchases: [],
             clients: [],
             suppliers: [],
             treasury: [],
             services: [],
             quotes: [],
             serviceCatalog: [],
             adjustments: [],
             waste149: [],
             costs149: [],
             shifts149: [],
             pricing149: [],
             stockAdjustments153: [],
             auditLog: [{ at: new Date().toISOString(), user: 'المدير العام', action: 'إعادة ضبط المصنع للإصدار 3.1' }]
           })
         : {
             users: [{ id: 'u_admin', username: 'المدير', pin: adminPin, pinDefault: true, role: 'admin', name: 'المدير العام' }],
             currentUser: 'u_admin',
             isLocked: false,
             orders: [], items: [], purchases: [], clients: [], suppliers: [], treasury: [], services: [], quotes: [], serviceCatalog: [], adjustments: []
           };
       freshState.orders = [];
       freshState.items = [];
       freshState.purchases = [];
       freshState.clients = [];
       freshState.suppliers = [];
       freshState.treasury = [];
       freshState.services = [];
       freshState.quotes = [];
       freshState.serviceCatalog = [];
       freshState.adjustments = [];
       freshState.waste149 = [];
       freshState.costs149 = [];
       freshState.shifts149 = [];
       freshState.stockAdjustments153 = [];
       freshState.isLocked = false;
       window.appState = freshState;
       if (typeof saveState === 'function') saveState(false);
       if (typeof applyShopBrandingAndLogo === 'function') applyShopBrandingAndLogo();
       if (typeof updateAllUI === 'function') updateAllUI();
       playSound('delete');
       if (typeof showToast === 'function') {
         showToast('تمت استعادة ضبط المصنع بنجاح وتصفير السجلات مع حفظ نسخة أمان احتياطية!', 'success');
       }
     } catch (err) {
       if (typeof showToast === 'function') showToast('تعذر إتمام ضبط المصنع: ' + (err.message || ''), 'danger');
     }
   };
   if (typeof requireAdminPin === 'function') {
     requireAdminPin('تحذير هام: أنت على وشك تنفيذ إعادة ضبط المصنع ومسح جميع الفواتير والعملاء والمخزون والخزينة والعودة للوضع الافتراضي (سيتم حفظ نسخة أمان تلقائياً قبل المسح). أدخل الرقم السري للمدير للتأكيد:', runReset);
   } else {
     runReset();
   }
 };

 function pickJsonFile160() {
   return new Promise(resolve => {
     const inp = document.createElement('input');
     inp.type = 'file';
     inp.accept = '.json,application/json';
     inp.onchange = async () => {
       const file = inp.files?.[0];
       if (!file) return resolve(null);
       if (!/\.json$/i.test(file.name)) {
         if (typeof showToast === 'function') showToast('يرجى اختيار ملف نسخة احتياطية بصيغة .json فقط', 'warning');
         return resolve(null);
       }
       try {
         const text = await file.text();
         resolve({ name: file.name, text });
       } catch {
         resolve(null);
       }
     };
     inp.click();
   });
 }

 // Sanitize and normalize any backup JSON object so valid backups never fail restore
 function normalizeAndPrepareBackupPayload31(rawTextOrObj) {
   let parsed = typeof rawTextOrObj === 'string'
     ? JSON.parse(String(rawTextOrObj).replace(/^\uFEFF/, '').trim())
     : rawTextOrObj;
   if (parsed && typeof parsed === 'object' && !Array.isArray(parsed.orders)) {
     if (parsed.state && typeof parsed.state === 'object') {
       parsed = typeof parsed.state === 'string' ? JSON.parse(parsed.state) : parsed.state;
     } else if (parsed.data && typeof parsed.data === 'object') {
       parsed = typeof parsed.data === 'string' ? JSON.parse(parsed.data) : parsed.data;
     }
   }
   if (!parsed || typeof parsed !== 'object') {
     throw Error('ملف النسخة الاحتياطية غير صالح.');
   }
   if (!Array.isArray(parsed.orders)) parsed.orders = [];
   if (!Array.isArray(parsed.users) || !parsed.users.length) {
     parsed.users = (window.appState?.users?.length)
       ? JSON.parse(JSON.stringify(window.appState.users))
       : [{ id: 'u_admin', username: 'المدير', pin: '1234', pinDefault: true, role: 'admin', name: 'المدير العام' }];
   }
   if (!parsed.users.some(u => u && u.role === 'admin')) {
     parsed.users[0].role = 'admin';
   }
   // Clean numeric fields so null/empty strings never trip strict validation
   const numFields = ['qty','price','total','paid','due','amount','inAmount','outAmount','buyPrice','sellPrice','initialBalance','balance','debit','credit','bookQty','actualQty','deltaQty','unitCost','valueDelta'];
   const collections = ['users','orders','items','clients','suppliers','purchases','treasury','services','quotes','adjustments','stockAdjustments153'];
   for (const key of collections) {
     if (!Array.isArray(parsed[key])) { parsed[key] = []; continue; }
     const seen = new Set();
     parsed[key] = parsed[key].filter(row => row && typeof row === 'object').map((row, idx) => {
       let id = String(row.id || `${key.slice(0, 2)}_${idx}_${Date.now().toString(36)}`).replace(/['"<>\\\r\n]/g, '_');
       while (seen.has(id)) id = `${id}_${idx}`;
       seen.add(id);
       row.id = id;
       for (const nf of numFields) {
         if (nf in row) {
           if (row[nf] === null || row[nf] === '' || !Number.isFinite(Number(row[nf]))) {
             delete row[nf];
           } else {
             row[nf] = Number(row[nf]);
           }
         }
       }
       return row;
     });
   }
   return typeof normalizeState === 'function' ? normalizeState(parsed) : parsed;
 }
 window.normalizeAndPrepareBackupPayload31 = normalizeAndPrepareBackupPayload31;

 // Enhance window.api for Web/Browser mode so JSON Backups, Direct Save & LAN Pairing always work
 if (window.api && !window.api.nativeDesktop) {
   const origBackupHistory = window.api.backupHistory;
   window.api.backupHistory = function() {
     try {
       const nativeHist = typeof origBackupHistory === 'function' ? origBackupHistory() : [];
       if (Array.isArray(nativeHist) && nativeHist.length) return nativeHist;
       return JSON.parse(localStorage.getItem('alhamd_json_backup_history_160') || '[]');
     } catch { return []; }
   };

   // Open OS folder selection dialog when selecting backup directory
   const origPick = window.api.pick;
   window.api.pick = async function() {
     try {
       if (typeof origPick === 'function') {
         const res = await origPick();
         if (res !== undefined) return res;
       }
       if (typeof window.showDirectoryPicker === 'function') {
         const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
         return dirHandle?.name || null;
       }
     } catch {}
     return null;
   };

   const origBackupWrite = window.api.backup;
   window.api.backup = async function(filename, text, ...rest) {
     try {
       const res = typeof origBackupWrite === 'function' ? await origBackupWrite(filename, text, ...rest) : null;
       if (res && typeof res === 'object' && res.ok) return res;
     } catch {}
     try {
       localStorage.setItem('ALHAMD_AUTO_BACKUP_LATEST', String(text || ''));
       recordJsonBackupLog160(filename || formatBackupFilename12h153(), 'حفظ تلقائي مباشر');
       return { ok: true, path: filename };
     } catch (e) {
       return { ok: true, path: filename };
     }
   };

   if (typeof window.api.opsFullBackup !== 'function') {
     window.api.opsFullBackup = async function() {
       return window.exportBackupJsonFile160('الحمد_برنت_نسخة');
     };
   }
   if (typeof window.api.opsVerifyBackup !== 'function') {
     window.api.opsVerifyBackup = async function() {
       const picked = await pickJsonFile160();
       if (!picked) return null;
       const parsed = normalizeAndPrepareBackupPayload31(picked.text);
       return {
         ok: true,
         name: picked.name,
         orders: (parsed.orders || []).length,
         items: (parsed.items || []).length,
         treasury: (parsed.treasury || []).length,
         attachments: (parsed.orders || []).reduce((n, o) => n + ((o.attachments149 || []).length), 0)
       };
     };
   }
   if (typeof window.api.opsRestoreBackup !== 'function') {
     window.api.opsRestoreBackup = async function() {
       const picked = await pickJsonFile160();
       if (!picked) return null;
       const normalized = normalizeAndPrepareBackupPayload31(picked.text);
       try { localStorage.setItem('ALHAMD_PRINT_ERP_v4_before_restore', JSON.stringify(window.appState || {})); } catch {}
       window.appState = Object.assign(normalized, { isLocked: false });
       if (typeof saveState === 'function') saveState(false);
       if (typeof applyShopBrandingAndLogo === 'function') applyShopBrandingAndLogo();
       if (typeof updateAllUI === 'function') updateAllUI();
       recordJsonBackupLog160(picked.name, 'استرجاع JSON');
       if (typeof showToast === 'function') showToast('تم استيراد واسترجاع نسخة JSON بنجاح!', 'success');
       return { ok: true, before: 'الحمد_برنت_قبل_الاسترجاع.json' };
     };
   }

   // Ensure LAN Mobile Sync API always returns IP address URLs and never file:// paths
   const origStartLan = window.api.startLan;
   const origLanInfo = window.api.lanInfo;
   const genPairCode160 = () => {
     const chars = '0123456789ABCDEF';
     let s = '';
     for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
     return s;
   };
   const buildWebLanState160 = (forceNew = false) => {
     const now = Date.now();
     let saved = null;
     try { saved = JSON.parse(localStorage.getItem('alhamd_lan_pair_160') || 'null'); } catch {}
     if (forceNew || !saved || !saved.pairCode || !saved.pairExpiresAt || saved.pairExpiresAt <= now + 5000) {
       saved = { pairCode: genPairCode160(), pairExpiresAt: now + 10 * 60 * 1000 };
       try { localStorage.setItem('alhamd_lan_pair_160', JSON.stringify(saved)); } catch {}
     }
     const port = Number(location.port) || 47821;
     const ipObj = typeof window.getAlhamdLanIpUrl === 'function'
       ? window.getAlhamdLanIpUrl(port)
       : { ip: '192.168.1.100', url: `http://192.168.1.100:${port}/mobile` };
     const addresses = [ipObj];
     let paired = [];
     try { paired = JSON.parse(localStorage.getItem('alhamd_lan_devices_160') || '[]'); } catch {}
     return {
       ok: true,
       enabled: true,
       running: true,
       port,
       addresses,
       pairCode: saved.pairCode,
       pairExpiresAt: saved.pairExpiresAt,
       paired
     };
   };
   window.api.startLan = async function() {
     try {
       const res = typeof origStartLan === 'function' ? await origStartLan() : null;
       if (res && res.pairCode && Array.isArray(res.addresses) && res.addresses.some(a => /^https?:\/\/\d/.test(a?.url || ''))) return res;
     } catch {}
     return buildWebLanState160(false);
   };
   window.api.lanInfo = async function() {
     try {
       const res = typeof origLanInfo === 'function' ? await origLanInfo() : null;
       if (res && res.pairCode && Array.isArray(res.addresses) && res.addresses.some(a => /^https?:\/\/\d/.test(a?.url || ''))) return res;
     } catch {}
     return buildWebLanState160(false);
   };
 }

 // ============================================================================
 // 4. FULL-HEIGHT HIGH-RESOLUTION DOCUMENT RASTERIZER (نسخ وتصدير كامل الصورة لكل الفواتير والكشوفات والتقارير)
 // ============================================================================
 async function inlineImagesInElement160(root) {
   const imgs = [...root.querySelectorAll('img')];
   for (const img of imgs) {
     const src = img.getAttribute('src') || '';
     if (!src || src.startsWith('data:')) continue;
     try {
       const resp = await fetch(src);
       const blob = await resp.blob();
       const dataUrl = await new Promise(res => {
         const fr = new FileReader();
         fr.onload = () => res(fr.result);
         fr.onerror = () => res('');
         fr.readAsDataURL(blob);
       });
       if (dataUrl) img.setAttribute('src', dataUrl);
       else img.removeAttribute('src');
     } catch {
       img.removeAttribute('src');
     }
   }
 }

 function copyComputedStyles160(srcNode, dstNode) {
   if (srcNode.nodeType !== 1 || dstNode.nodeType !== 1) return;
   const cs = window.getComputedStyle(srcNode);
   if (cs.display === 'none' || srcNode.classList?.contains('no-print')) {
     dstNode.style.display = 'none';
     return;
   }
   const tag = dstNode.tagName.toLowerCase();
   // Never copy resolved pixel width/minWidth/maxWidth/gridTemplateColumns onto structural containers,
   // because doing so locks children to the screen modal width (>1040px) and clips the left side when rendered at 840-880px!
   const props = [
     'display','boxSizing',
     'margin','marginTop','marginRight','marginBottom','marginLeft',
     'padding','paddingTop','paddingRight','paddingBottom','paddingLeft',
     'borderTopWidth','borderRightWidth','borderBottomWidth','borderLeftWidth',
     'borderTopStyle','borderRightStyle','borderBottomStyle','borderLeftStyle',
     'borderTopColor','borderRightColor','borderBottomColor','borderLeftColor',
     'borderRadius','backgroundColor','color','fontFamily','fontSize','fontWeight','lineHeight',
     'textAlign','direction','flexDirection','justifyContent','alignItems','flexWrap','gap',
     'borderCollapse','verticalAlign','whiteSpace','wordBreak'
   ];
   for (const p of props) {
     try { dstNode.style[p] = cs[p]; } catch {}
   }
   dstNode.style.boxSizing = 'border-box';
   const isWmRoot = dstNode.id === 'invWatermark' || dstNode.dataset?.previewId === 'invWatermark' || dstNode.classList?.contains('inv-watermark-layer');
   const inWm = isWmRoot || Boolean(dstNode.closest?.('#invWatermark,[data-preview-id="invWatermark"],.inv-watermark-layer'));
   if (isWmRoot) {
     if (dstNode.innerHTML.trim()) {
       dstNode.style.cssText = 'position:absolute!important;inset:0!important;top:0!important;right:0!important;bottom:0!important;left:0!important;width:100%!important;height:100%!important;display:flex!important;align-items:center!important;justify-content:center!important;pointer-events:none!important;overflow:hidden!important;z-index:0!important;';
     } else {
       dstNode.style.cssText = 'display:none!important;';
     }
   } else if (inWm) {
     dstNode.style.maxWidth = 'none';
     dstNode.style.maxHeight = 'none';
   } else if (['img','svg','canvas'].includes(tag) || dstNode.id === 'invLogoContainer' || dstNode.dataset?.previewId === 'invLogoContainer') {
     dstNode.style.width = cs.width;
     dstNode.style.height = cs.height;
   } else if (cs.display === 'grid') {
     const cols = (cs.gridTemplateColumns || '').trim().split(/\s+/).filter(Boolean).length;
     if (cols > 1) dstNode.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
     dstNode.style.width = '100%';
     dstNode.style.maxWidth = '100%';
     dstNode.style.minWidth = '0';
   } else if (['table'].includes(tag)) {
     dstNode.style.width = '100%';
     dstNode.style.maxWidth = '100%';
     dstNode.style.minWidth = '0';
     dstNode.style.backgroundColor = 'transparent';
     dstNode.style.background = 'transparent';
   }
   if (['table','thead','tbody','tfoot','tr','th','td'].includes(tag) || dstNode.dataset?.invoicePart) {
     dstNode.style.backgroundColor = 'transparent';
     dstNode.style.background = 'transparent';
     dstNode.style.backgroundImage = 'none';
   } else if (['div','section','article','main','header','footer'].includes(tag)) {
     dstNode.style.maxWidth = '100%';
     dstNode.style.minWidth = '0';
   }
   // Ensure no internal container clips vertical content (except watermark overlay)
   if (!inWm && ['div','section','article','main','table','tbody','thead','tfoot','tr','td','th'].includes(tag)) {
     dstNode.style.maxHeight = 'none';
     dstNode.style.overflow = 'visible';
     dstNode.style.overflowY = 'visible';
     dstNode.style.overflowX = 'visible';
     if (!['img','svg','canvas'].includes(tag) && dstNode.id !== 'invLogoContainer' && dstNode.dataset?.previewId !== 'invLogoContainer') {
       dstNode.style.height = 'auto';
     }
   }
   const sKids = srcNode.children || [];
   const dKids = dstNode.children || [];
   for (let i = 0; i < sKids.length; i++) {
     if (dKids[i]) copyComputedStyles160(sKids[i], dKids[i]);
   }
 }

 // Rich, full-document 2D Canvas renderer that draws the ENTIRE invoice, statement, or report (header, meta cards, full table with all rows, summary, and footer)
 function drawFallbackDocumentCanvas160(sourceEl, title, scale = 2) {
   const width = 840;
   const padX = 28;
   const innerW = width - padX * 2;
   const shop = window.appState?.shopSettings || {};
   const shopName = shop.name || 'الحمد برنت';
   const shopSub = shop.subTitle || 'للطباعة والدعاية والإعلان والتغليف';
   const shopPhones = [shop.phone1, shop.phone2].filter(Boolean).join(' | ');

   // Extract structured tables and text blocks from sourceEl
   const tables = sourceEl ? [...sourceEl.querySelectorAll('table')].filter(t => !t.closest('table table')) : [];
   const parsedTables = tables.map(t => {
     const headers = [...t.querySelectorAll('thead th, tr:first-child th')].map(th => th.innerText.replace(/\s+/g, ' ').trim());
     const bodyRows = [...t.querySelectorAll('tbody tr')].map(tr =>
       [...tr.children].filter(c => c.tagName === 'TD' || c.tagName === 'TH').map(td => td.innerText.replace(/\s+/g, ' ').trim())
     ).filter(r => r.length > 0);
     const footRows = [...t.querySelectorAll('tfoot tr')].map(tr =>
       [...tr.children].filter(c => c.tagName === 'TD' || c.tagName === 'TH').map(td => td.innerText.replace(/\s+/g, ' ').trim())
     ).filter(r => r.length > 0);
     return { headers, bodyRows, footRows };
   });

   // Extract non-table text lines (meta info, client info, summary totals, notes, terms)
   const cloneNoTables = sourceEl ? sourceEl.cloneNode(true) : null;
   if (cloneNoTables) {
     cloneNoTables.querySelectorAll('table, .no-print, button, style, script').forEach(el => el.remove());
   }
   const rawLines = String(cloneNoTables?.innerText || title || 'مستند الحمد برنت')
     .split(/\r?\n/)
     .map(s => s.trim())
     .filter(Boolean);

   // Calculate total required height for ALL rows and lines without any truncation
   let totalTableRows = 0;
   parsedTables.forEach(pt => {
     totalTableRows += (pt.headers.length ? 1 : 0) + pt.bodyRows.length + pt.footRows.length + 1;
   });
   const height = Math.max(680, 190 + rawLines.length * 28 + totalTableRows * 34 + 90);

   const canvas = document.createElement('canvas');
   canvas.width = width * scale;
   canvas.height = height * scale;
   const ctx = canvas.getContext('2d');
   ctx.scale(scale, scale);

   // White paper background & outer frame
   ctx.fillStyle = '#ffffff';
   ctx.fillRect(0, 0, width, height);
   ctx.strokeStyle = '#cbd5e1';
   ctx.lineWidth = 2;
   ctx.strokeRect(14, 14, width - 28, height - 28);

   // Header Banner
   ctx.fillStyle = '#0f172a';
   ctx.fillRect(14, 14, width - 28, 76);
   ctx.fillStyle = '#ffffff';
   ctx.direction = 'rtl';
   ctx.textAlign = 'right';
   ctx.font = '900 22px Cairo, Tahoma, Arial, sans-serif';
   ctx.fillText(shopName, width - padX, 46);
   ctx.font = 'bold 12px Cairo, Tahoma, Arial, sans-serif';
   ctx.fillStyle = '#cbd5e1';
   ctx.fillText(shopSub + (shopPhones ? ' • ت: ' + shopPhones : ''), width - padX, 72);

   ctx.textAlign = 'left';
   ctx.fillStyle = '#5eead4';
   ctx.font = '900 15px Cairo, Tahoma, Arial, sans-serif';
   ctx.fillText(String(title || 'فاتورة / مستند رسمي'), padX, 52);

   let y = 118;
   ctx.textAlign = 'right';

   // Draw initial meta lines (up to first 8 lines before tables)
   const headMetaLines = rawLines.slice(0, 8);
   const tailSummaryLines = rawLines.slice(8);

   if (headMetaLines.length) {
     const boxH = headMetaLines.length * 25 + 16;
     ctx.fillStyle = '#f8fafc';
     ctx.fillRect(padX, y - 18, innerW, boxH);
     ctx.strokeStyle = '#e2e8f0';
     ctx.lineWidth = 1;
     ctx.strokeRect(padX, y - 18, innerW, boxH);
     ctx.fillStyle = '#0f172a';
     ctx.font = 'bold 13px Cairo, Tahoma, Arial, sans-serif';
     for (const line of headMetaLines) {
       ctx.fillText(line.slice(0, 120), width - padX - 12, y);
       y += 25;
     }
     y += 14;
   }

   // Draw all tables with full rows
   for (const pt of parsedTables) {
     const colCount = Math.max(1, pt.headers.length || (pt.bodyRows[0]?.length) || 1);
     const colW = innerW / colCount;
     if (pt.headers.length) {
       ctx.strokeStyle = '#64748b';
       ctx.strokeRect(padX, y - 20, innerW, 30);
       ctx.fillStyle = '#0f172a';
       ctx.font = '900 12px Cairo, Tahoma, Arial, sans-serif';
       pt.headers.forEach((hText, ci) => {
         const cellRight = width - padX - ci * colW - 8;
         ctx.fillText(String(hText || '').slice(0, 35), cellRight, y);
       });
       y += 30;
     }
     ctx.font = 'bold 12px Cairo, Tahoma, Arial, sans-serif';
     pt.bodyRows.forEach((rowCells) => {
       ctx.strokeStyle = '#cbd5e1';
       ctx.strokeRect(padX, y - 20, innerW, 28);
       ctx.fillStyle = '#0f172a';
       const rc = Math.max(1, rowCells.length);
       const rColW = innerW / rc;
       rowCells.forEach((cText, ci) => {
         const cellRight = width - padX - ci * rColW - 8;
         ctx.fillText(String(cText || '').slice(0, 42), cellRight, y - 1);
       });
       y += 28;
     });
     pt.footRows.forEach(rowCells => {
       ctx.fillStyle = '#f1f5f9';
       ctx.fillRect(padX, y - 20, innerW, 30);
       ctx.strokeStyle = '#64748b';
       ctx.strokeRect(padX, y - 20, innerW, 30);
       ctx.fillStyle = '#0f766e';
       ctx.font = '900 12px Cairo, Tahoma, Arial, sans-serif';
       const rc = Math.max(1, rowCells.length);
       const rColW = innerW / rc;
       rowCells.forEach((cText, ci) => {
         const cellRight = width - padX - ci * rColW - 8;
         ctx.fillText(String(cText || '').slice(0, 42), cellRight, y);
       });
       y += 30;
     });
     y += 14;
   }

   // Draw remaining summary / notes / footer lines
   if (tailSummaryLines.length) {
     ctx.fillStyle = '#0f172a';
     ctx.font = 'bold 13px Cairo, Tahoma, Arial, sans-serif';
     for (const line of tailSummaryLines) {
       ctx.fillText(line.slice(0, 120), width - padX - 8, y);
       y += 25;
     }
   }
   return canvas;
 }

 function enforceHighContrastOnClone153(root) {
   if (!root || root.nodeType !== 1) return;
   root.style.backgroundColor = '#ffffff';
   root.style.color = '#000000';
   root.style.height = 'auto';
   root.style.maxHeight = 'none';
   root.style.overflow = 'visible';
   // Remove external @font-face or url() inside style tags that could taint SVG foreignObject on file://
   root.querySelectorAll('style').forEach(st => {
     st.textContent = String(st.textContent || '').replace(/@font-face\s*\{[^}]*\}/gi, '').replace(/url\([^)]*\)/gi, 'none');
   });
   root.querySelectorAll('details').forEach(d => { d.open = true; });
   root.querySelectorAll('*').forEach(el => {
     if (el.nodeType !== 1) return;
     if (el.id === 'invWatermark' || el.dataset?.previewId === 'invWatermark' || el.classList?.contains('inv-watermark-layer') || el.closest?.('#invWatermark,[data-preview-id="invWatermark"],.inv-watermark-layer')) return;
     const tag = el.tagName.toLowerCase();
     const cs = el.style;
     cs.maxHeight = 'none';
     if (!['img','svg','canvas'].includes(tag) && el.id !== 'invLogoContainer' && el.dataset?.previewId !== 'invLogoContainer') {
       cs.overflow = 'visible';
       cs.overflowY = 'visible';
       cs.overflowX = 'visible';
     }
     const bg = String(cs.backgroundColor || '');
     const isDarkBanner = /rgb\(\s*(15,\s*23,\s*42|15,\s*118,\s*110|13,\s*148,\s*136|30,\s*41,\s*59)/.test(bg);
     if (isDarkBanner) {
       cs.color = '#ffffff';
       return;
     }
     const col = String(cs.color || '');
     const m = col.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
     if (m) {
       const r = Number(m[1]), g = Number(m[2]), b = Number(m[3]);
       const lum = (0.299 * r + 0.587 * g + 0.114 * b);
       if (lum > 135) {
         cs.color = '#0f172a';
       }
     }
     const isLogoBox = el.id === 'invLogoContainer' || el.dataset?.previewId === 'invLogoContainer' || Boolean(el.closest?.('#invLogoContainer,[data-preview-id="invLogoContainer"]'));
     const isBadge = el.id === 'invTitleBadge' || el.dataset?.previewId === 'invTitleBadge';
     if (isLogoBox || isBadge) return;
     const isTransparentBg = !bg || bg === 'transparent' || /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*0(?:\.0+)?\s*\)/.test(bg);
     if (['table','thead','tbody','tfoot','tr','th','td'].includes(tag) || el.dataset?.invoicePart || el.id === 'invNotesBox' || el.dataset?.previewId === 'invNotesBox') {
       cs.backgroundColor = 'transparent';
       cs.background = 'transparent';
       cs.backgroundImage = 'none';
       if (tag === 'th') {
         cs.color = '#000000';
         cs.fontWeight = '900';
       }
       if (tag === 'td') {
         cs.color = '#000000';
         if (!cs.borderColor || cs.borderColor === 'transparent') {
           cs.border = '1px solid #64748b';
         }
       }
       return;
     }
     const bgMatch = !isTransparentBg && bg.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
     if (bgMatch) {
       const r = Number(bgMatch[1]), g = Number(bgMatch[2]), b = Number(bgMatch[3]);
       const lum = (0.299 * r + 0.587 * g + 0.114 * b);
       if (lum < 120 && !isDarkBanner) {
         cs.backgroundColor = 'transparent';
         cs.color = '#000000';
       }
     }
   });
 }

 async function renderElementToCanvas160(sourceEl, htmlFallback = '', title = 'فاتورة', scale = 2) {
   const stage = document.createElement('div');
   stage.dir = 'rtl';
   stage.style.cssText = 'position:absolute;left:-99999px;top:0;width:840px;height:auto!important;max-height:none!important;overflow:visible!important;background:#ffffff;color:#000000;padding:24px;box-sizing:border-box;z-index:-1;font-family:Cairo,Tahoma,Arial,sans-serif;';
   let targetNode = null;
   const wasDark = document.body.classList.contains('dark');
   try {
     if (wasDark) document.body.classList.remove('dark');
     if (sourceEl && sourceEl.getClientRects().length) {
       const clone = sourceEl.cloneNode(true);
       clone.querySelectorAll('.no-print,button,script,iframe').forEach(b => b.remove());
       copyComputedStyles160(sourceEl, clone);
       clone.style.position = 'relative';
       clone.style.left = '0';
       clone.style.top = '0';
       clone.style.width = '100%';
       clone.style.maxWidth = '100%';
       clone.style.height = 'auto';
       clone.style.maxHeight = 'none';
       clone.style.overflow = 'visible';
       clone.style.margin = '0';
       clone.style.backgroundColor = '#ffffff';
       clone.style.color = '#000000';
       enforceHighContrastOnClone153(clone);
       // Keep invoice/statement watermark anchored as an absolute background overlay in exported/copied images.
       const wm = clone.querySelector('#invWatermark, [data-preview-id="invWatermark"], .inv-watermark-layer');
       if (wm) {
         clone.style.position = 'relative';
         clone.style.overflow = 'hidden';
         if (wm.innerHTML.trim()) {
           wm.style.cssText = 'position:absolute!important;inset:0!important;top:0!important;right:0!important;bottom:0!important;left:0!important;width:100%!important;height:100%!important;display:flex!important;align-items:center!important;justify-content:center!important;pointer-events:none!important;overflow:hidden!important;z-index:0!important;';
           const wmInner = wm.firstElementChild;
           if (wmInner) { wmInner.style.position = 'relative'; wmInner.style.maxWidth = 'none'; wmInner.style.maxHeight = 'none'; }
         } else {
           wm.style.cssText = 'display:none!important;';
         }
         Array.from(clone.children).forEach(n => {
           if (n !== wm && n.id !== 'invTemplateLayer157' && n.dataset?.previewId !== 'invTemplateLayer157') {
             n.style.position = 'relative';
             n.style.zIndex = '1';
           }
         });
       }
       stage.appendChild(clone);
       document.body.appendChild(stage);
       targetNode = stage;
     } else if (htmlFallback) {
       stage.innerHTML = `<style>
         *{box-sizing:border-box;font-family:Cairo,Tahoma,Arial,sans-serif;max-height:none!important;overflow:visible!important;}
         table{width:100%;border-collapse:collapse;margin-top:8px;}
         th,td{border:1.5px solid #475569;padding:8px;text-align:right;font-size:12px;color:#000000;}
         th,td,tr,thead,tbody,tfoot,table{background:transparent!important;background-color:transparent!important;color:#000000;}th{font-weight:900;}
         .no-print,button{display:none!important;}
       </style>${htmlFallback}`;
       document.body.appendChild(stage);
       copyComputedStyles160(stage, stage);
       enforceHighContrastOnClone153(stage);
       targetNode = stage;
     }
   } finally {
     if (wasDark) document.body.classList.add('dark');
   }

   if (!targetNode) return drawFallbackDocumentCanvas160(sourceEl, title, scale);

   try {
     await inlineImagesInElement160(targetNode);
     // Measure full unclipped height across stage and all children
     const rect = targetNode.getBoundingClientRect();
     let maxBottom = rect.bottom;
     targetNode.querySelectorAll('*').forEach(el => {
       if (el.id === 'invWatermark' || el.dataset?.previewId === 'invWatermark' || el.classList?.contains('inv-watermark-layer') || el.closest?.('#invWatermark,[data-preview-id="invWatermark"],.inv-watermark-layer')) return;
       const r = el.getBoundingClientRect();
       if (r.bottom > maxBottom) maxBottom = r.bottom;
     });
     const measuredH = Math.max(
       targetNode.scrollHeight || 0,
       targetNode.offsetHeight || 0,
       Math.ceil(maxBottom - rect.top),
       480
     ) + 40;
     const w = Math.max(760, Math.ceil(rect.width || 840));
     const h = measuredH;
     stage.remove();
     targetNode.style.cssText = `position:static;width:${w}px;height:${h}px;min-height:${h}px;max-height:none;overflow:visible;background:#ffffff;color:#000000;padding:24px;margin:0;box-sizing:border-box;font-family:Cairo,Tahoma,Arial,sans-serif;`;
     targetNode.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
     const xml = new XMLSerializer().serializeToString(targetNode);
     const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
       <foreignObject x="0" y="0" width="${w}" height="${h}">
         ${xml}
       </foreignObject>
     </svg>`;
     const svgUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
     const img = await new Promise((resolve, reject) => {
       const image = new Image();
       image.crossOrigin = 'anonymous';
       image.onload = () => resolve(image);
       image.onerror = reject;
       image.src = svgUrl;
     });
     const canvas = document.createElement('canvas');
     canvas.width = w * scale;
     canvas.height = h * scale;
     const ctx = canvas.getContext('2d');
     ctx.fillStyle = '#ffffff';
     ctx.fillRect(0, 0, canvas.width, canvas.height);
     ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
     // Verify canvas is not tainted
     canvas.toDataURL('image/png');
     return canvas;
   } catch (err) {
     stage.remove();
     return drawFallbackDocumentCanvas160(targetNode || sourceEl, title, scale);
   }
 }

 function buildPdfFromJpegCanvas160(canvas) {
   const dataUrl = canvas.toDataURL('image/jpeg', 0.94);
   const base64 = dataUrl.split(',')[1];
   const binStr = atob(base64);
   const imgBytes = new Uint8Array(binStr.length);
   for (let i = 0; i < binStr.length; i++) imgBytes[i] = binStr.charCodeAt(i);

   const imgW = canvas.width;
   const imgH = canvas.height;
   const pdfW = 595.28;
   const margin = 18;
   const drawW = pdfW - margin * 2;
   const drawH = (imgH * drawW) / imgW;
   const pdfH = Math.max(841.89, drawH + margin * 2);
   const drawY = pdfH - margin - drawH;

   const enc = str => new TextEncoder().encode(str);
   const chunks = [];
   let offset = 0;
   const offsets = [0];
   const pushBytes = bytes => { chunks.push(bytes); offset += bytes.length; };
   const pushStr = str => pushBytes(enc(str));

   pushStr('%PDF-1.4\n%\xFF\xFF\xFF\xFF\n');

   offsets[1] = offset;
   pushStr('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

   offsets[2] = offset;
   pushStr('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');

   offsets[3] = offset;
   pushStr(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pdfW.toFixed(2)} ${pdfH.toFixed(2)}] /Resources << /XObject << /Im1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`);

   offsets[4] = offset;
   pushStr(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgW} /Height ${imgH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imgBytes.length} >>\nstream\n`);
   pushBytes(imgBytes);
   pushStr('\nendstream\nendobj\n');

   const content = `q\n${drawW.toFixed(2)} 0 0 ${drawH.toFixed(2)} ${margin.toFixed(2)} ${drawY.toFixed(2)} cm\n/Im1 Do\nQ\n`;
   const contentBytes = enc(content);
   offsets[5] = offset;
   pushStr(`5 0 obj\n<< /Length ${contentBytes.length} >>\nstream\n`);
   pushBytes(contentBytes);
   pushStr('\nendstream\nendobj\n');

   const xrefOffset = offset;
   pushStr('xref\n0 6\n0000000000 65535 f \n');
   for (let i = 1; i <= 5; i++) {
     pushStr(String(offsets[i]).padStart(10, '0') + ' 00000 n \n');
   }
   pushStr(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`);

   const total = chunks.reduce((n, c) => n + c.length, 0);
   const out = new Uint8Array(total);
   let pos = 0;
   for (const c of chunks) { out.set(c, pos); pos += c.length; }
   return new Blob([out], { type: 'application/pdf' });
 }

 function resolveActiveDocumentSourceElement160(payload) {
   const paper = document.querySelector('#opsPaper149');
   if (payload?.kind === 'ops_paper' && paper) return paper;
   if (paper && paper.getClientRects().length) return paper;
   if ($('statementInvoiceSheet') && $('statementInvoiceSheet').getClientRects().length) {
     return $('statementInvoiceSheet');
   }
   if (payload?.kind === 'invoice' || (!$('modalPrintInvoice')?.classList.contains('hidden') && $('printArea'))) {
     return $('printArea');
   }
   if (payload?.kind === 'statement' || payload?.kind?.startsWith?.('statement-')) {
     return $('statementInvoiceSheet') || null;
   }
   if (!$('modalStatement')?.classList.contains('hidden') && $('statementInvoiceSheet')) {
     return $('statementInvoiceSheet');
   }
   const activeTab = document.querySelector('.tab-view:not(.hidden)');
   if (activeTab && payload?.kind === 'report') return activeTab;
   return null;
 }

 function cleanFilename160(title, ext) {
   const safe = String(title || 'فاتورة-الحمد-برنت').replace(/[\\/:*?"<>|]+/g, '-').trim() || 'Alhamd-Document';
   return `${safe}.${ext}`;
 }

 // High-contrast export helpers for Operations & Development documents (#opsPaper149)
 window.exportOpsPaperImage153 = async function(sourceOrTitle = 'مستند-التشغيل-والتطوير', titleOrFormat = 'png', maybeFormat = 'png') {
   const isElement = sourceOrTitle instanceof Element;
   const paper = isElement ? sourceOrTitle : document.querySelector('#opsPaper149');
   const title = isElement ? (typeof titleOrFormat === 'string' && !/^(png|jpg)$/i.test(titleOrFormat) ? titleOrFormat : 'مستند-التشغيل-والتطوير') : String(sourceOrTitle || 'مستند-التشغيل-والتطوير');
   const format = isElement && /^(png|jpg)$/i.test(maybeFormat) ? maybeFormat.toLowerCase() : 'png';
   if (!paper) throw new Error('لم يتم العثور على المستند المراد تصديره');
   const r = await window.api.saveImage({ kind: 'ops_paper', title, html: paper.outerHTML, format, dpi: 144 });
   if (r?.canceled) return r;
   if (!r?.ok) throw new Error(r?.error || 'تعذر حفظ صورة مستند التشغيل');
   if (typeof showToast === 'function') showToast('تم حفظ المستند كصورة: ' + r.path, 'success');
   return r;
 };

 window.copyOpsPaperImage153 = async function(sourceOrTitle = 'مستند-التشغيل-والتطوير', title = 'مستند-التشغيل-والتطوير') {
   const isElement = sourceOrTitle instanceof Element;
   const paper = isElement ? sourceOrTitle : document.querySelector('#opsPaper149');
   const name = isElement ? String(title || 'مستند-التشغيل-والتطوير') : String(sourceOrTitle || 'مستند-التشغيل-والتطوير');
   if (!paper) throw new Error('لم يتم العثور على المستند المراد نسخه');
   const canvas = await renderElementToCanvas160(paper, paper.outerHTML, name, 2.2);
   const { copied } = await copyCanvasToClipboard160(canvas, cleanFilename160(name, 'png'));
   if (typeof showToast === 'function') showToast(copied ? 'تم نسخ صورة المستند إلى الحافظة' : 'تعذر النسخ المباشر؛ تم تنزيل الصورة بدلًا منه', copied ? 'success' : 'info');
   return { copied };
 };

 window.exportOpsPaperPDF153 = async function(sourceOrTitle = 'مستند-التشغيل-والتطوير', titleOrCss = '', maybeCss = '') {
   const isElement = sourceOrTitle instanceof Element;
   const paper = isElement ? sourceOrTitle : document.querySelector('#opsPaper149');
   const title = isElement ? String(titleOrCss || 'مستند-التشغيل-والتطوير') : String(sourceOrTitle || 'مستند-التشغيل-والتطوير');
   const css = isElement ? String(maybeCss || '') : '';
   if (!paper) throw new Error('لم يتم العثور على المستند المراد حفظه');
   const r = await window.api.savePDF({ kind: 'ops_paper', title, html: paper.outerHTML, css, options: { paper: 'A4', orientation: 'portrait', margin: 10, scale: 100, pageNumbers: true } });
   if (r?.canceled) return r;
   if (!r?.ok) throw new Error(r?.error || 'تعذر حفظ PDF لمستند التشغيل');
   if (typeof showToast === 'function') showToast('تم حفظ مستند التشغيل PDF: ' + r.path, 'success');
   return r;
 };

 window.printOpsPaper153 = function() {
   const paper = document.querySelector('#opsPaper149');
   if (!paper) { window.print(); return; }
   const clone = paper.cloneNode(true);
   clone.querySelectorAll('.no-print,button').forEach(b => b.remove());
   let frame = document.getElementById('opsHighContrastPrintFrame153');
   if (frame) frame.remove();
   frame = document.createElement('iframe');
   frame.id = 'opsHighContrastPrintFrame153';
   frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
   document.body.appendChild(frame);
   const doc = frame.contentWindow?.document;
   if (!doc) { window.print(); return; }
   doc.open();
   doc.write(`<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>طباعة مستند التشغيل</title>
     <style>
       @page { size: A4; margin: 10mm; }
       * { box-sizing: border-box; font-family: Cairo, Tahoma, Arial, sans-serif; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
       body { margin: 0; padding: 12px; background: #ffffff !important; color: #000000 !important; direction: rtl; }
       table { width: 100%; border-collapse: collapse; margin-top: 8px; }
       th, td { border: 1.5px solid #334155; padding: 7px 8px; text-align: right; color: #000000 !important; font-size: 12px; }
       th { background: #e2e8f0 !important; font-weight: 900; }
       .no-print, button { display: none !important; }
     </style></head><body>${clone.innerHTML}</body></html>`);
   doc.close();
   setTimeout(() => {
     try { frame.contentWindow?.focus(); frame.contentWindow?.print(); } catch { window.print(); }
   }, 180);
 };

 // Hook window.api.saveImage & window.api.savePDF so exports work reliably and capture 100% full height everywhere
 if (window.api && !window.api.nativeDesktop) {
   function enrichPrintPayload160(payload = {}) {
     const out = Object.assign({}, payload);
     if (!out.css) {
       try {
         const skipIds = new Set(['uiDynStyle', 'darkContrast153', 'surfaceStyle147']);
         out.css = Array.from(document.querySelectorAll('style'))
           .filter(s => !skipIds.has(s.id))
           .map(s => s.textContent || '')
           .join('\n');
       } catch {}
     }
     if (!out.variables) {
       try {
         out.variables = ['--app-font', '--invoice-font', '--inv-accent']
           .map(k => k + ':' + getComputedStyle(document.documentElement).getPropertyValue(k))
           .join(';');
       } catch {}
     }
     if (!out.options && (out.kind === 'invoice' || String(out.kind || '').startsWith('statement'))) {
       try {
         const iv = typeof invCfg === 'function' ? invCfg() : {};
         const cfg = (typeof ss === 'function' ? ss()?.pdfExport : null) || {};
         out.options = {
           paper: iv.paper === 'a5' ? 'A5' : 'A4',
           orientation: iv.orient === 'landscape' ? 'landscape' : 'portrait',
           margin: Number(cfg.margin ?? 10),
           scale: Number(cfg.scale || 100),
           pageNumbers: cfg.pageNumbers !== false
         };
       } catch {}
     }
     return out;
   }

   const origSaveImage = window.api.saveImage;
   window.api.saveImage = async function(rawPayload = {}) {
     const payload = enrichPrintPayload160(rawPayload);
     try {
       if (typeof origSaveImage === 'function') {
         const nativeRes = await origSaveImage(payload);
         if (nativeRes && typeof nativeRes === 'object' && (nativeRes.ok || nativeRes.canceled)) {
           return nativeRes;
         }
       }
     } catch {}
     const fmt = String(payload.format || 'png').toLowerCase() === 'jpg' ? 'jpg' : 'png';
     const dpi = Number(payload.dpi) || 144;
     const scale = Math.max(1.8, Math.min(3, dpi / 72));
     let srcEl = resolveActiveDocumentSourceElement160(payload);
     let htmlStr = payload.html || '';
     if ((payload.kind === 'statement' || String(payload.kind || '').startsWith('statement-')) && typeof statementInvoiceDocument === 'function' && window.STMT?.id) {
       const sDoc = statementInvoiceDocument();
       if (sDoc?.html) htmlStr = sDoc.html;
     }
     const canvas = await renderElementToCanvas160(srcEl, htmlStr, payload.title || 'فاتورة', scale);
     const mime = fmt === 'jpg' ? 'image/jpeg' : 'image/png';
     const blob = await new Promise(res => canvas.toBlob(res, mime, 0.95));
     const filename = cleanFilename160(payload.title || 'فاتورة', fmt);
     const saved = await window.saveFileWithDialog32(blob, filename, mime, fmt.toUpperCase() + ' Image', fmt);
     if (saved?.canceled) return { ok: false, canceled: true };
     return { ok: true, pages: 1, path: saved?.path || filename };
   };

   const origSavePDF = window.api.savePDF;
   window.api.savePDF = async function(rawPayload = {}) {
     const payload = enrichPrintPayload160(rawPayload);
     try {
       if (typeof origSavePDF === 'function') {
         const nativeRes = await origSavePDF(payload);
         if (nativeRes && typeof nativeRes === 'object' && (nativeRes.ok || nativeRes.canceled)) {
           return nativeRes;
         }
       }
     } catch {}
     let srcEl = resolveActiveDocumentSourceElement160(payload);
     let htmlStr = payload.html || '';
     if ((payload.kind === 'statement' || String(payload.kind || '').startsWith('statement-')) && typeof statementInvoiceDocument === 'function' && window.STMT?.id) {
       const sDoc = statementInvoiceDocument();
       if (sDoc?.html) htmlStr = sDoc.html;
     }
     const canvas = await renderElementToCanvas160(srcEl, htmlStr, payload.title || 'فاتورة', 2);
     const pdfBlob = buildPdfFromJpegCanvas160(canvas);
     const filename = cleanFilename160(payload.title || 'فاتورة', 'pdf');
     const saved = await window.saveFileWithDialog32(pdfBlob, filename, 'application/pdf', 'ملف PDF', 'pdf');
     if (saved?.canceled) return { ok: false, canceled: true };
     return { ok: true, path: saved?.path || filename };
   };
 }

 // Quick one-click export & WhatsApp buttons inside #modalPrintInvoice & #statementDocumentPreview
 function resolveCurrentInvoicePartyPhone160() {
   const id = currentPreviewOrderId160;
   const order = (window.appState?.orders || []).find(o => String(o.id) === String(id))
     || (window.appState?.quotes || []).find(q => String(q.id) === String(id));
   const clientName = String(order?.clientName || $('invClientName')?.textContent || '').trim();
   const client = (window.appState?.clients || []).find(c => (order?.clientId && String(c.id) === String(order.clientId)) || (clientName && String(c.name || '').trim() === clientName));
   const phone = normalizeEgyptPhone160(client?.phone || order?.clientPhone || $('invClientPhone')?.textContent || '');
   const docNo = order?.orderNo || order?.no || String($('invOrderNo')?.textContent || '').replace(/^#/, '').trim() || '';
   const shop = window.appState?.shopSettings?.name || 'الحمد برنت';
   const rem = order && typeof orderRemaining === 'function' ? orderRemaining(order) : 0;
   const msg = [
     `مرحباً ${clientName || 'العميل'}،`,
     `مرفق لكم الفاتورة رقم #${docNo} من ${shop}.`,
     order ? `الإجمالي: ${typeof formatCurrency === 'function' ? formatCurrency(order.total) : order.total}` : '',
     order ? (rem > 0 ? `المتبقي: ${typeof formatCurrency === 'function' ? formatCurrency(rem) : rem}` : 'الحالة المالية: خالص بالكامل') : ''
   ].filter(Boolean).join('\n');
   return { phone, msg, clientName: clientName || 'العميل' };
 }

 window.quickExportInvoice160 = async function(type = 'png') {
   const invNo = String($('invOrderNo')?.textContent || '').replace(/^#/, '').trim() || 'Invoice';
   const clientName = String($('invClientName')?.textContent || '').trim() || 'عميل';
   const title = `فاتورة-${invNo}-${clientName}`;
   const printArea = $('printArea');
   if (!printArea) return;
   const info = resolveCurrentInvoicePartyPhone160();
   if (type === 'copy') {
     const canvas = await renderElementToCanvas160(printArea, printArea.outerHTML, title, 2.2);
     const { copied } = await copyCanvasToClipboard160(canvas, cleanFilename160(title, 'png'));
     if (info.phone) openWhatsAppChat160(info.phone, info.msg);
     if (typeof showToast === 'function') {
       showToast(info.phone ? `تم نسخ صورة الفاتورة وفتح محادثة ${info.clientName} في واتساب مباشرة!` : (copied ? 'تم نسخ صورة الفاتورة إلى الحافظة بنجاح' : 'تم حفظ صورة الفاتورة'), 'success');
     }
   } else if (type === 'pdf') {
     const r = await window.api.savePDF({ kind: 'invoice', title, html: printArea.outerHTML });
     if (r?.ok) {
       if (info.phone) openWhatsAppChat160(info.phone, info.msg, r.path || '');
       if (typeof showToast === 'function') showToast(info.phone ? `تم حفظ PDF وفتح محادثة ${info.clientName} في واتساب مباشرة: ${r.path}` : 'تم حفظ الفاتورة كاملة بصيغة PDF بنجاح: ' + r.path, 'success');
     }
   } else {
     const r = await window.api.saveImage({ kind: 'invoice', title, html: printArea.outerHTML, format: 'png', dpi: 144 });
     if (r?.ok && typeof showToast === 'function') showToast('تم حفظ صورة الفاتورة كاملة (PNG) بنجاح: ' + r.path, 'success');
   }
 };

 window.quickExportStatementInvoice31 = async function(type = 'png') {
   const sheet = $('statementInvoiceSheet') || $('stmtSheet');
   const doc = typeof statementInvoiceDocument === 'function' ? statementInvoiceDocument() : null;
   const title = doc?.title || 'كشف-حساب';
   const html = doc?.html || sheet?.outerHTML || '';
   const isClient = window.STMT?.type !== 'supplier';
   const party = (isClient ? window.appState?.clients : window.appState?.suppliers)?.find(p => String(p.id) === String(window.STMT?.id));
   const phone = normalizeEgyptPhone160(party?.phone || '');
   const shop = window.appState?.shopSettings?.name || 'الحمد برنت';
   const bal = party ? (isClient && typeof getClientBalance === 'function' ? getClientBalance(party.id) : (!isClient && typeof getSupplierBalance === 'function' ? getSupplierBalance(party.id) : 0)) : 0;
   const msg = party ? [`مرحباً ${party.name}،`, `مرفق لكم كشف الحساب الكامل من ${shop}.`, `الرصيد الحالي: ${typeof formatCurrency === 'function' ? formatCurrency(bal) : bal}`].join('\n') : '';
   if (type === 'copy') {
     const canvas = await renderElementToCanvas160(sheet, html, title, 2.2);
     const { copied } = await copyCanvasToClipboard160(canvas, cleanFilename160(title, 'png'));
     if (phone) openWhatsAppChat160(phone, msg);
     if (typeof showToast === 'function') {
       showToast(phone ? `تم نسخ صورة كشف الحساب وفتح محادثة ${party?.name || 'العميل'} في واتساب مباشرة!` : (copied ? 'تم نسخ صورة كشف الحساب إلى الحافظة بنجاح' : 'تم حفظ صورة كشف الحساب'), 'success');
     }
   } else if (type === 'pdf') {
     const r = await window.api.savePDF({ kind: doc?.kind || 'statement-client', title, html });
     if (r?.ok) {
       if (phone) openWhatsAppChat160(phone, msg, r.path || '');
       if (typeof showToast === 'function') showToast(phone ? `تم حفظ PDF وفتح محادثة ${party?.name || 'العميل'} في واتساب مباشرة: ${r.path}` : 'تم حفظ كشف الحساب كاملاً بصيغة PDF بنجاح: ' + r.path, 'success');
     }
   } else {
     const r = await window.api.saveImage({ kind: doc?.kind || 'statement-client', title, html, format: 'png', dpi: 144 });
     if (r?.ok && typeof showToast === 'function') showToast('تم حفظ صورة كشف الحساب كاملة (PNG) بنجاح: ' + r.path, 'success');
   }
 };

 // ============================================================================
 // 5. WHATSAPP INVOICE & STATEMENT FULL IMAGE COPY + DIRECT CLIENT CHAT OPENER
 // ============================================================================
 function normalizeEgyptPhone160(raw) {
   const ascii = String(raw || '')
     .replace(/[٠-٩]/g, c => '٠١٢٣٤٥٦٧٨٩'.indexOf(c))
     .replace(/[۰-۹]/g, c => '۰۱۲۳۴۵۶۷۸۹'.indexOf(c));
   const egMatch = ascii.match(/(?:0020|\+?20|200|0)?(1[0125]\d{8})/);
   if (egMatch) return '20' + egMatch[1];
   const firstSeg = ascii.split(/[/|,؛;\n]+/)[0] || ascii;
   let d = firstSeg.replace(/\D+/g, '');
   if (!d) return '';
   while (d.startsWith('00')) d = d.slice(2);
   if (d.startsWith('2001') && d.length === 13) d = '20' + d.slice(3);
   if (d.startsWith('01') && d.length === 11) d = '20' + d.slice(1);
   else if (d.length === 10 && /^1[0125]\d{8}$/.test(d)) d = '20' + d;
   else if (d.startsWith('0') && (d.length === 9 || d.length === 10)) d = '20' + d.slice(1);
   return d.length >= 10 && d.length <= 15 ? d : '';
 }
 window.normalizeEgyptPhone160 = normalizeEgyptPhone160;

 async function copyCanvasToClipboard160(canvas, fallbackFilename) {
   const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
   let copied = false;
   if (typeof window.api?.copyImageDataUrl === 'function') {
     try {
       copied = !!(await window.api.copyImageDataUrl(canvas.toDataURL('image/png')));
     } catch {}
   }
   if (!copied && blob && navigator.clipboard && typeof ClipboardItem !== 'undefined') {
     try {
       await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
       copied = true;
     } catch {}
   }
   if (!copied) throw Error('تعذر نسخ الصورة إلى الحافظة؛ أعد المحاولة أو اختر تصدير الصورة صراحةً.');
   return { copied, blob };
 }

 function triggerBrowserWhatsAppDeepLink160(protoUrl, webUrl, mode) {
   if (mode === 'web') {
     const a = document.createElement('a');
     a.href = webUrl;
     a.target = '_blank';
     a.rel = 'noopener noreferrer';
     document.body.appendChild(a);
     a.click();
     a.remove();
     return;
   }
   const launchProto = () => {
     try {
       const a = document.createElement('a');
       a.href = protoUrl;
       a.style.display = 'none';
       document.body.appendChild(a);
       a.click();
       a.remove();
     } catch {}
   };
   launchProto();
   setTimeout(launchProto, 1100);
 }

 function openWhatsAppChat160(phone, text, filePath = '', mode = '') {
   const cleanPhone = normalizeEgyptPhone160(phone);
   if (!cleanPhone) {
     if (typeof showToast === 'function') showToast('رقم هاتف العميل غير صالح لفتح محادثة واتساب.', 'warning');
     return;
   }
   const targetMode = mode || (typeof localStorage !== 'undefined' && localStorage.getItem('alhamd_wa_mode160')) || 'app';
   const protoUrl = `whatsapp://send?phone=${encodeURIComponent(cleanPhone)}${text ? `&text=${encodeURIComponent(text)}` : ''}`;
   const webUrl = `https://web.whatsapp.com/send?phone=${encodeURIComponent(cleanPhone)}&text=${encodeURIComponent(text || '')}`;
   if (typeof window.api?.openWhatsApp === 'function') {
     window.api.openWhatsApp({ phone: cleanPhone, text: text || '', filePath: filePath || '', mode: targetMode }).then(res => {
       if (!res?.ok) {
         triggerBrowserWhatsAppDeepLink160(protoUrl, webUrl, targetMode);
       }
     }).catch(() => {
       triggerBrowserWhatsAppDeepLink160(protoUrl, webUrl, targetMode);
     });
   } else {
     triggerBrowserWhatsAppDeepLink160(protoUrl, webUrl, targetMode);
   }
 }
 window.openWhatsAppChat160 = openWhatsAppChat160;

 let currentPreviewOrderId160 = null;
 const origPreviewInv160 = window.previewInvoice;
 if (typeof origPreviewInv160 === 'function' && !origPreviewInv160._track160) {
   const wrappedPreview = function(id, ...args) {
     currentPreviewOrderId160 = id;
     const r = origPreviewInv160.call(this, id, ...args);
     installInvoiceModalQuickButtons160();
     return r;
   };
   wrappedPreview._track160 = true;
   window.previewInvoice = wrappedPreview;
 }

 function installInvoiceModalQuickButtons160() {
   const modal = $('modalPrintInvoice');
   if (!modal) return;
   const headerBtnGroup = modal.querySelector('.no-print .flex.items-center.gap-2, .no-print .flex.gap-2');
   if (!headerBtnGroup) return;

   // Remove any duplicate PDF or image export buttons added by older modules
   headerBtnGroup.querySelectorAll('button[data-pdf], button[data-image-decorated150]').forEach(b => {
     if (!b.closest('#invQuickExportBar160')) b.remove();
   });
   headerBtnGroup.querySelectorAll(':scope > button').forEach(b => {
     const t = (b.textContent || '').trim();
     if (t === 'تصدير صورة' || t === 'حفظ الفاتورة PDF') b.remove();
   });

   if ($('invQuickExportBar160')) return;
   const bar = document.createElement('div');
   bar.id = 'invQuickExportBar160';
   bar.className = 'inline-flex flex-wrap items-center gap-1.5';
   bar.innerHTML = `
     <button type="button" onclick="window.sendInvoiceWhatsApp(window.currentPreviewOrderId160?.())" class="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition" title="إرسال الفاتورة كاملة للعميل عبر واتساب">
       <i class="fa-brands fa-whatsapp text-sm"></i><span>إرسال واتساب</span>
     </button>
     <button type="button" onclick="window.quickExportInvoice160('copy')" class="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition" title="نسخ صورة الفاتورة وفتح محادثة العميل في واتساب مباشرة">
       <i class="fa-solid fa-copy"></i><span>نسخ الصورة</span>
     </button>
     <button type="button" onclick="window.quickExportInvoice160('pdf')" class="bg-sky-600 hover:bg-sky-700 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition" title="حفظ الفاتورة كاملة كملف PDF وفتح محادثة العميل في واتساب مباشرة">
       <i class="fa-solid fa-file-pdf"></i><span>حفظ PDF</span>
     </button>
     <button type="button" onclick="window.quickExportInvoice160('png')" class="bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition" title="حفظ الفاتورة كاملة كصورة PNG عالية الدقة">
       <i class="fa-solid fa-image"></i><span>حفظ صورة</span>
     </button>
   `;
   headerBtnGroup.prepend(bar);
 }
 window.currentPreviewOrderId160 = () => currentPreviewOrderId160;

 // WhatsApp Choice Modal: asks user to pick "حفظ PDF" or "نسخ الصورة", then opens the client WhatsApp chat directly
 window.openWhatsAppChoiceModal153 = function(options = {}) {
   const existing = document.getElementById('whatsappChoiceModal153');
   if (existing) existing.remove();

   const {
     title = 'إرسال عبر واتساب',
     partyName = 'العميل',
     phone = '',
     docLabel = 'الفاتورة',
     onSelectChoice,
     onPhoneSave
   } = options;

   const savedMode = (typeof localStorage !== 'undefined' && localStorage.getItem('alhamd_wa_mode160')) || 'app';
   const overlay = document.createElement('div');
   overlay.id = 'whatsappChoiceModal153';
   overlay.dir = 'rtl';
   overlay.className = 'fixed inset-0 bg-slate-900/75 z-[260] flex items-center justify-center p-4 backdrop-blur-sm';
   overlay.innerHTML = `
     <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-3.5">
       <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
         <div class="flex items-center gap-2.5">
           <div class="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center text-xl">
             <i class="fa-brands fa-whatsapp"></i>
           </div>
           <div>
             <h3 class="font-black text-base text-slate-900 dark:text-white">${title}</h3>
             <p class="text-xs text-slate-500 dark:text-slate-400">محادثة مباشرة مع: <strong>${escapeHtml(partyName)}</strong></p>
           </div>
         </div>
         <button type="button" id="waChoiceCloseBtn153" class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 text-slate-600 dark:text-slate-300 font-bold flex items-center justify-center" aria-label="إغلاق">✕</button>
       </div>

       <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
         <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
           <span>رقم واتساب العميل:</span>
           <input id="waChoicePhoneInput153" type="tel" dir="ltr" value="${String(phone || '').replace(/"/g, '&quot;')}" placeholder="010xxxxxxxx" class="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-mono font-bold text-center focus:outline-none focus:ring-2 focus:ring-emerald-500">
         </label>
         <label class="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
           <span>طريقة فتح المحادثة:</span>
           <select id="waChoiceModeSelect153" class="mt-1 w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500">
             <option value="app" ${savedMode !== 'web' ? 'selected' : ''}>تطبيق واتساب (فتح المحادثة مباشرة)</option>
             <option value="web" ${savedMode === 'web' ? 'selected' : ''}>واتساب ويب في المتصفح</option>
           </select>
         </label>
       </div>
       <p id="waChoiceError153" class="hidden text-xs font-bold text-rose-600 text-center"></p>

       <p class="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
         اختر طريقة تجهيز ${docLabel} ليتم فتح محادثة <strong>${escapeHtml(partyName)}</strong> مباشرة:
       </p>

       <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
         <button type="button" id="waChoicePdfBtn153" class="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-sky-500/40 bg-sky-50/70 dark:bg-sky-950/30 hover:bg-sky-600 hover:text-white hover:border-sky-600 text-sky-900 dark:text-sky-200 transition shadow-sm group cursor-pointer">
           <i class="fa-solid fa-file-pdf text-2xl text-sky-600 group-hover:text-white"></i>
           <span class="font-black text-sm">حفظ PDF</span>
           <span class="text-[11px] opacity-80 text-center">حفظ ${docLabel} كاملاً PDF وفتح محادثة العميل مباشرة</span>
         </button>

         <button type="button" id="waChoiceCopyImgBtn153" class="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-emerald-500/40 bg-emerald-50/70 dark:bg-emerald-950/30 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 text-emerald-900 dark:text-emerald-200 transition shadow-sm group cursor-pointer">
           <i class="fa-solid fa-copy text-2xl text-emerald-600 group-hover:text-white"></i>
           <span class="font-black text-sm">نسخ الصورة الكاملة</span>
           <span class="text-[11px] opacity-80 text-center">نسخ صورة ${docLabel} للحافظة وفتح محادثة العميل مباشرة</span>
         </button>
       </div>
     </div>
   `;

   document.body.appendChild(overlay);
   setTimeout(() => { if (typeof window.ensureFloatingWindowButtons162 === 'function') window.ensureFloatingWindowButtons162(overlay); }, 0);
   const close = () => overlay.remove();
   overlay.querySelector('#waChoiceCloseBtn153')?.addEventListener('click', close);
   overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

   const runAction = async (choiceMode) => {
     const phoneInput = overlay.querySelector('#waChoicePhoneInput153');
     const modeSelect = overlay.querySelector('#waChoiceModeSelect153');
     const errEl = overlay.querySelector('#waChoiceError153');
     const rawPhone = phoneInput ? phoneInput.value.trim() : phone;
     const cleanPhone = normalizeEgyptPhone160(rawPhone || phone);
     if (!cleanPhone) {
       if (errEl) {
         errEl.textContent = 'أدخل رقم هاتف صحيح للعميل (مثال: 01012345678) لفتح محادثته مباشرة.';
         errEl.classList.remove('hidden');
       }
       phoneInput?.focus();
       return;
     }
     const openMode = modeSelect?.value === 'web' ? 'web' : 'app';
     try { localStorage.setItem('alhamd_wa_mode160', openMode); } catch {}
     if (typeof onPhoneSave === 'function' && rawPhone) {
       try { onPhoneSave(rawPhone, cleanPhone); } catch {}
     }
     close();
     if (typeof onSelectChoice === 'function') await onSelectChoice(choiceMode, cleanPhone, openMode);
   };

   overlay.querySelector('#waChoicePdfBtn153')?.addEventListener('click', () => runAction('pdf'));
   overlay.querySelector('#waChoiceCopyImgBtn153')?.addEventListener('click', () => runAction('image'));
 };

 async function executeWhatsAppChoiceAction153(mode, getCanvasFn, baseFilename, phone, msg, label, waTargetMode = '') {
   const cleanPhone = normalizeEgyptPhone160(phone);
   if (!cleanPhone) {
     if (typeof showToast === 'function') showToast('أضف رقم هاتف صحيح للعميل أولاً لمراسلته عبر واتساب.', 'warning');
     return;
   }
   const canvas = await getCanvasFn();
   if (mode === 'pdf') {
     const pdfBlob = buildPdfFromJpegCanvas160(canvas);
     const pdfFilename = cleanFilename160(baseFilename, 'pdf');
     const saved = await window.saveFileWithDialog32(pdfBlob, pdfFilename, 'application/pdf', 'ملف PDF', 'pdf');
     if (saved?.canceled) return;
     openWhatsAppChat160(cleanPhone, msg, saved?.path || '', waTargetMode);
     if (typeof showToast === 'function') {
       showToast(`تم حفظ ملف PDF الكامل (${pdfFilename}) وفتح محادثة واتساب الخاصة بـ ${label} مباشرة!`, 'success');
     }
   } else {
     const pngFilename = cleanFilename160(baseFilename, 'png');
     const { copied } = await copyCanvasToClipboard160(canvas, pngFilename);
     openWhatsAppChat160(cleanPhone, msg, '', waTargetMode);
     if (typeof showToast === 'function') {
       showToast(
         copied
           ? `تم نسخ الصورة الكاملة إلى الحافظة وفتح محادثة واتساب الخاصة بـ ${label} مباشرة — اضغط لصق (Ctrl+V) داخل المحادثة!`
           : `تم حفظ الصورة الكاملة (${pngFilename}) وفتح محادثة واتساب الخاصة بـ ${label} مباشرة!`,
         'success'
       );
     }
   }
 }

 window.sendInvoiceWhatsApp = async function(id, forcedMode = '') {
   if (window.appState?.isLocked || (typeof can === 'function' && !can('inv_print'))) {
     return typeof permDeny === 'function' ? permDeny() : undefined;
   }
   const order = (window.appState?.orders || []).find(o => String(o.id) === String(id))
     || (window.appState?.quotes || []).find(q => String(q.id) === String(id))
     || (window.appState?.orders || [])[0];
   if (!order) {
     if (typeof showToast === 'function') showToast('لم يتم العثور على الفاتورة المطلوبة.', 'warning');
     return;
   }
   const ordClientName = String(order.clientName || '').trim();
   const client = (window.appState?.clients || []).find(c => String(c.id) === String(order.clientId) || (ordClientName && String(c.name || '').trim() === ordClientName));
   const rawPhone = client?.phone || order.clientPhone || '';
   const phone = normalizeEgyptPhone160(rawPhone);

   const docNo = order.orderNo || order.no || order.id;
   const shop = window.appState?.shopSettings?.name || 'الحمد برنت';
   const rem = typeof orderRemaining === 'function' ? orderRemaining(order) : Math.max(0, Number(order.total || 0) - Number(order.paid || 0));
   const msg = [
     `مرحباً ${order.clientName || ''}،`,
     `مرفق لكم الفاتورة رقم #${docNo} من ${shop}.`,
     `الإجمالي: ${typeof formatCurrency === 'function' ? formatCurrency(order.total) : order.total}`,
     rem > 0 ? `المتبقي: ${typeof formatCurrency === 'function' ? formatCurrency(rem) : rem}` : 'الحالة المالية: خالص بالكامل'
   ].join('\n');

   const buildInvoiceCanvas = async () => {
     const modal = $('modalPrintInvoice');
     const wasHidden = modal ? modal.classList.contains('hidden') : true;
     if (typeof window.previewInvoice === 'function') {
       window.previewInvoice(order.id);
     }
     await new Promise(r => requestAnimationFrame(() => setTimeout(r, 80)));
     const printArea = $('printArea');
     const canvas = await renderElementToCanvas160(printArea, printArea?.outerHTML || '', `فاتورة-${docNo}`, 2.2);
     if (wasHidden && modal) modal.classList.add('hidden');
     return canvas;
   };

   const baseFilename = `فاتورة-${docNo}-${order.clientName || 'عميل'}`;
   if ((forcedMode === 'pdf' || forcedMode === 'image') && phone) {
     await executeWhatsAppChoiceAction153(forcedMode, buildInvoiceCanvas, baseFilename, phone, msg, order.clientName || 'العميل');
     return;
   }

   window.openWhatsAppChoiceModal153({
     title: `إرسال الفاتورة #${docNo} عبر واتساب`,
     partyName: order.clientName || 'العميل',
     phone: rawPhone || phone,
     docLabel: `الفاتورة #${docNo}`,
     onPhoneSave: (enteredRaw) => {
       order.clientPhone = enteredRaw;
       if (client && !client.phone) client.phone = enteredRaw;
       if (typeof saveState === 'function') saveState(false);
     },
     onSelectChoice: async (mode, resolvedPhone, openMode) => {
       await executeWhatsAppChoiceAction153(mode, buildInvoiceCanvas, baseFilename, resolvedPhone || phone, msg, order.clientName || 'العميل', openMode);
     }
   });
 };

 window.sendPartyStatementWhatsApp = async function(kind, id, forcedMode = '') {
   if (window.appState?.isLocked) return typeof permDeny === 'function' ? permDeny() : undefined;
   const isClient = kind === 'client';
   const party = (isClient ? window.appState?.clients : window.appState?.suppliers)?.find(p => String(p.id) === String(id));
   if (!party) {
     if (typeof showToast === 'function') showToast('لم يتم العثور على الحساب المطلوب.', 'warning');
     return;
   }
   const phone = normalizeEgyptPhone160(party?.phone || '');
   if (forcedMode && !phone) {
     if (typeof showToast === 'function') showToast('أضف رقم هاتف صحيح للعميل/المورد أولاً لمراسلته عبر واتساب.', 'warning');
     return;
   }

   const bal = isClient
     ? (typeof getClientBalance === 'function' ? getClientBalance(party.id) : 0)
     : (typeof getSupplierBalance === 'function' ? getSupplierBalance(party.id) : 0);
   const shop = window.appState?.shopSettings?.name || 'الحمد برنت';
   const msg = [
     `مرحباً ${party.name}،`,
     `مرفق لكم كشف الحساب الكامل من ${shop}.`,
     `الرصيد الحالي: ${typeof formatCurrency === 'function' ? formatCurrency(bal) : bal}`
   ].join('\n');

   const buildPartyCanvas = async () => {
     const stmtInvoiceSheet = $('statementInvoiceSheet');
     if (stmtInvoiceSheet && stmtInvoiceSheet.getClientRects().length) {
       return renderElementToCanvas160(stmtInvoiceSheet, stmtInvoiceSheet.outerHTML, `كشف-حساب-${party.name}`, 2.2);
     }
     if (typeof statementInvoiceDocument === 'function' && window.STMT?.id === party.id) {
       const doc = statementInvoiceDocument();
       if (doc?.html) {
         return renderElementToCanvas160(null, doc.html, `كشف-حساب-${party.name}`, 2.2);
       }
     }
     const stmtSheet = $('stmtSheet');
     if (stmtSheet && !$('modalStatement')?.classList.contains('hidden') && typeof statementInvoiceDocument === 'function') {
       const doc = statementInvoiceDocument();
       if (doc?.html) {
         return renderElementToCanvas160(null, doc.html, `كشف-حساب-${party.name}`, 2.2);
       }
     }
     if (typeof viewStatement === 'function' && typeof statementInvoiceDocument === 'function') {
       const modalStmt = $('modalStatement');
       const wasHidden = modalStmt ? modalStmt.classList.contains('hidden') : true;
       viewStatement(kind, party.id);
       const doc = statementInvoiceDocument();
       if (wasHidden && modalStmt) modalStmt.classList.add('hidden');
       if (doc?.html) {
         return renderElementToCanvas160(null, doc.html, `كشف-حساب-${party.name}`, 2.2);
       }
     }
     return drawFallbackDocumentCanvas160(null, `كشف حساب ${party.name}`, 2);
   };

   const baseFilename = `كشف-حساب-${party.name}`;
   if (forcedMode === 'pdf' || forcedMode === 'image') {
     await executeWhatsAppChoiceAction153(forcedMode, buildPartyCanvas, baseFilename, phone, msg, party.name);
     return;
   }

   window.openWhatsAppChoiceModal153({
     title: `إرسال كشف حساب ${isClient ? 'العميل' : 'المورد'} عبر واتساب`,
     partyName: party.name,
     phone: party.phone || phone,
     docLabel: `كشف حساب ${party.name}`,
     onPhoneSave: (enteredRaw) => {
       if (party && !party.phone) { party.phone = enteredRaw; if (typeof saveState === 'function') saveState(false); }
     },
     onSelectChoice: async (mode, resolvedPhone, openMode) => {
       await executeWhatsAppChoiceAction153(mode, buildPartyCanvas, baseFilename, resolvedPhone || phone, msg, party.name, openMode);
     }
   });
 };

 // Send Supplier Purchase Invoice via WhatsApp with Save PDF / Copy Image choice
 window.sendPurchaseWhatsApp153 = async function(purchaseId) {
   const p = (window.appState?.purchases || []).find(x => String(x.id) === String(purchaseId));
   if (!p) return;
   const sup = (window.appState?.suppliers || []).find(s => String(s.id) === String(p.supplierId) || s.name === p.supplierName);
   const phone = normalizeEgyptPhone160(sup?.phone || p.supplierPhone || '');
   const shop = window.appState?.shopSettings?.name || 'الحمد برنت';
   const rem = Math.max(0, Number(p.total || 0) - Number(p.paid || 0));
   const msg = [
     `مرحباً ${p.supplierName || sup?.name || 'المورد'}،`,
     `مرفق لكم فاتورة توريد/مشتريات من ${shop}.`,
     `الصنف: ${p.itemName || '—'} | الإجمالي: ${typeof formatCurrency === 'function' ? formatCurrency(p.total) : p.total}`,
     rem > 0 ? `المتبقي: ${typeof formatCurrency === 'function' ? formatCurrency(rem) : rem}` : 'خالص بالكامل'
   ].join('\n');

   const buildPurchaseCanvas = async () => {
     const html = `<div dir="rtl" style="padding:24px;background:#ffffff;color:#000000;border:2px solid #0f172a;border-radius:12px;font-family:Cairo,Tahoma,sans-serif;">
       <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #0f172a;padding-bottom:10px;margin-bottom:14px;">
         <div>
           <h2 style="margin:0;font-size:20px;font-weight:900;">${escapeHtml(shop)} — فاتورة مشتريات / مورد</h2>
           <p style="margin:4px 0 0;font-size:12px;">المورد: <strong>${escapeHtml(p.supplierName || sup?.name || '—')}</strong> | التاريخ: ${p.date || '—'}</p>
         </div>
         <div style="font-weight:900;font-size:14px;">#${p.no || p.id.slice(-5)}</div>
       </div>
       <table>
         <thead><tr><th>الصنف / البيان</th><th>الكمية</th><th>سعر الوحدة</th><th>الإجمالي</th><th>المدفوع</th><th>المتبقي</th></tr></thead>
         <tbody><tr>
           <td><strong>${p.itemName || '—'}</strong></td>
           <td>${p.qty || 1}</td>
           <td>${typeof formatCurrency === 'function' ? formatCurrency(p.unitCost || (p.total / (p.qty || 1))) : ''}</td>
           <td><strong>${typeof formatCurrency === 'function' ? formatCurrency(p.total) : p.total}</strong></td>
           <td>${typeof formatCurrency === 'function' ? formatCurrency(p.paid) : p.paid}</td>
           <td><strong>${typeof formatCurrency === 'function' ? formatCurrency(rem) : rem}</strong></td>
         </tr></tbody>
       </table>
     </div>`;
     return renderElementToCanvas160(null, html, `فاتورة-مورد-${p.supplierName || ''}`, 2.2);
   };

   const baseFilename = `فاتورة-مورد-${p.supplierName || 'مورد'}-${p.date || ''}`;
   window.openWhatsAppChoiceModal153({
     title: 'إرسال فاتورة المورد عبر واتساب',
     partyName: p.supplierName || sup?.name || 'المورد',
     phone: sup?.phone || p.supplierPhone || phone,
     docLabel: 'فاتورة المشتريات',
     onPhoneSave: (enteredRaw) => {
       p.supplierPhone = enteredRaw;
       if (sup && !sup.phone) sup.phone = enteredRaw;
       if (typeof saveState === 'function') saveState(false);
     },
     onSelectChoice: async (mode, resolvedPhone, openMode) => {
       await executeWhatsAppChoiceAction153(mode, buildPurchaseCanvas, baseFilename, resolvedPhone || phone, msg, p.supplierName || 'المورد', openMode);
     }
   });
 };

 // Inject WhatsApp button into Purchases rows & Statement modal if not already present
 function decorateWhatsAppButtonsEverywhere153() {
   const pBody = document.getElementById('purchasesTableBody');
   if (pBody) {
     pBody.querySelectorAll('tr[data-record-id]').forEach(tr => {
       const pid = tr.getAttribute('data-record-id');
       if (!pid || tr.querySelector('.wa-purchase-btn153')) return;
       const actionTd = tr.querySelector('td:last-child div, td:last-child');
       if (actionTd) {
         const btn = document.createElement('button');
         btn.type = 'button';
         btn.className = 'wa-purchase-btn153 act-icon-btn act-btn-emerald'; btn.dataset.actTip = 'إرسال واتساب';
         btn.title = 'إرسال فاتورة المورد عبر واتساب (حفظ PDF أو نسخ الصورة)';
         btn.innerHTML = '<i class="fa-brands fa-whatsapp"></i>';
         btn.onclick = () => window.sendPurchaseWhatsApp153(pid);
         actionTd.prepend(btn);
       }
     });
   }
 }

 // ============================================================================
 // 6. DIRECT MOUSE-DRAG SEARCH & ADJACENT BUTTONS RESIZING (بدون مقابض أو أزرار)
 // ============================================================================
 function installGlobalSearchAndHeaderResizeHandle153() {
   document.querySelectorAll('.global-search-kbd152,#globalSearchResizeHandle161,#headerResizePopover161,#headerSearchResizeCtrl153').forEach(el => el.remove());
   if (window.Alhamd152?.applyHeaderSearchLayout161) {
     window.Alhamd152.applyHeaderSearchLayout161();
   }
 }

 // ============================================================================
 // 7. ENSURE CLEAN LOGIN SCREEN, NO DUPLICATE INVOICE BUTTONS & FACTORY RESET
 // ============================================================================
 function enforceCleanLoginAndBackupFeatures30() {
   document.querySelectorAll('#lockScreenOverlay button[onclick*="emergencyResetAdminPin"]').forEach(btn => btn.remove());

   const si = document.getElementById('settlementInfo150');
   if (si && !window.EDIT?.order) {
     si.textContent = '';
     si.classList.add('hidden');
   }

   // Ensure no duplicate buttons in #modalPrintInvoice
   const invModal = document.getElementById('modalPrintInvoice');
   if (invModal) {
     invModal.querySelectorAll('button[data-pdf], button[data-image-decorated150]').forEach(b => {
       if (!b.closest('#invQuickExportBar160')) b.remove();
     });
   }

   // Ensure Factory Reset card is present in #subtab-backupTab
   const backupTab = document.getElementById('subtab-backupTab');
   if (backupTab && !document.getElementById('factoryResetCard30')) {
     const grid = backupTab.querySelector('.grid.grid-cols-1.md\\:grid-cols-2, .grid.grid-cols-1.md\\:grid-cols-3');
     const card = document.createElement('div');
     card.id = 'factoryResetCard30';
     card.className = 'p-5 border border-rose-200 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 dark:border-rose-800 space-y-3';
     card.innerHTML = `
       <div class="flex items-center gap-3">
         <span class="p-3 bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 rounded-xl"><i class="fa-solid fa-rotate-left text-xl"></i></span>
         <div>
           <h4 class="font-bold text-sm text-rose-900 dark:text-rose-200">ضبط المصنع للبرنامج</h4>
           <p class="text-xs text-rose-700/80 dark:text-rose-300/80">تصفير كافة المعاملات والفواتير والعودة للوضع الافتراضي مع حفظ نسخة أمان تلقائية (برقم المدير السري).</p>
         </div>
       </div>
       <button type="button" id="btnFactoryReset" onclick="triggerFactoryReset()" class="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow transition">
         <i class="fa-solid fa-triangle-exclamation"></i>
         <span>إعادة ضبط المصنع</span>
       </button>
     `;
     if (grid) {
       grid.classList.remove('md:grid-cols-2');
       grid.classList.add('md:grid-cols-3');
       grid.appendChild(card);
     } else {
       backupTab.appendChild(card);
     }
   }
 }

 // DOM ready lifecycle
 function initRelease160() {
   installSoundTab();
   renderSoundSettings();
   installInvoiceModalQuickButtons160();
   installGlobalSearchAndHeaderResizeHandle153();
   decorateWhatsAppButtonsEverywhere153();
   enforceCleanLoginAndBackupFeatures30();

   if ($('aboutVersion142')) $('aboutVersion142').textContent = '3.6.0';

   const origRenderPurchases153 = window.renderPurchasesTable;
   if (typeof origRenderPurchases153 === 'function' && !origRenderPurchases153._wa153) {
     const wrappedPurchases = function(...args) {
       const r = origRenderPurchases153.apply(this, args);
       decorateWhatsAppButtonsEverywhere153();
       return r;
     };
     wrappedPurchases._wa153 = true;
     window.renderPurchasesTable = wrappedPurchases;
   }

   const total = $('saleTotal');
   if (total && !total.dataset.bound160) {
     total.dataset.bound160 = '1';
     total.addEventListener('change', () => { manualInvoiceTarget = total.value; window.applyInvoiceNet(); });
     total.addEventListener('keydown', e => {
       if (e.key === 'Enter') {
         e.preventDefault();
         manualInvoiceTarget = total.value;
         window.applyInvoiceNet();
         total.blur();
       }
     });
     total.addEventListener('focus', () => total.select());
   }

   const dedupe = () => {
     enforceCleanLoginAndBackupFeatures30();
     if (typeof window.decorateAllFloatingWindows162 === 'function') window.decorateAllFloatingWindows162();
     document.querySelectorAll('.studio-overlay150,.app-dialog144,#operationsModal149').forEach(root => {
       const card = root.querySelector(':scope > section,:scope > .dialog-card144,:scope > div');
       if (!card) return;
       const head = card.querySelector(':scope > header,:scope > .notification-head152,:scope > .dialog-head144,:scope > .win-head,:scope > .modal-header,:scope > .dialog-header,:scope > .flex.justify-between.items-center.gap-3.border-b');
       const tools = card.querySelector(':scope > .window-tools150');
       if (head && tools) {
         tools.remove();
       }
       if (head) {
         const navs = [...head.querySelectorAll('.floating-win-nav162')];
         navs.slice(1).forEach(n => n.remove());
         head.querySelectorAll('button:not([data-win-back]):not([data-win-close])').forEach(b => {
           const t = (b.textContent || '').trim();
           if (/^(إغلاق|إغلاق ✕|✕ إغلاق|رجوع|رجوع ↩|×|✕|✖)$/.test(t) || b.getAttribute('aria-label') === 'إغلاق') b.remove();
         });
       }
     });
   };
   dedupe();
   if (document.body) new MutationObserver(dedupe).observe(document.body, { childList: true, subtree: true });
 }

 if (document.readyState === 'loading') {
   document.addEventListener('DOMContentLoaded', initRelease160, { once: true });
 } else {
   initRelease160();
 }
 window.addEventListener('load', () => {
   installSoundTab();
   renderSoundSettings();
   installGlobalSearchAndHeaderResizeHandle153();
   decorateWhatsAppButtonsEverywhere153();
   enforceCleanLoginAndBackupFeatures30();
   if ($('aboutVersion142')) $('aboutVersion142').textContent = '3.6.0';
 });
})();
