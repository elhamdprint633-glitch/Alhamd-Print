/* Alhamd Print 3.0 — unified search (mouse-drag resizable) and advanced notification workspace. */
(()=>{'use strict';
const $=id=>document.getElementById(id),READ_KEY='alhamd-notifications-read-152',HISTORY_KEY='alhamd-notifications-history-153';
const NOTICE_TYPES=[
 ['stock','تنبيهات المخزون ونواقص الخامات'],
 ['orders','التسليم وأوامر الشغل'],
 ['quotes','عروض الأسعار والمسودات'],
 ['finance','الأرصدة والحسابات ومديونيات الأطراف'],
 ['purchases','فواتير الوارد ومستحقات التوريد'],
 ['services','الخدمات الخارجية ومواعيدها'],
 ['treasury','حركات الخزينة والمصروفات اليومية'],
 ['shifts','الورديات وتسويات الكاشير'],
 ['stocktake','فروقات الجرد وتسويات المخزون'],
 ['audit','فحص سلامة الحسابات والمراجعة'],
 ['security','الأمان وتسجيل الدخول'],
 ['backup','النسخ الاحتياطي وتأمين البيانات'],
 ['activity','رسائل وتنبيهات البرنامج المباشرة']
];
const NOTICE_DEFAULT={
 enabled:{stock:true,orders:true,quotes:true,finance:true,purchases:true,services:true,treasury:true,shifts:true,stocktake:true,audit:true,security:true,backup:true,activity:true},
 colors:{panel:'#ffffff',title:'#1e293b',body:'#64748b',border:'#e2e8f0',row:'#ffffff',read:'#f8fafc',accent:'#0d9488',buttonBg:'#f0fdfa',buttonText:'#0f766e',time:'#64748b'},
 alertOptions:{
  soonDays:3,
  clientDebtLimit:0,
  supplierDebtLimit:0,
  backupStaleHours:24,
  expenseAlertThreshold:5000,
  alertZeroStock:true,
  alertReservedStock:true,
  alertLateOrders:true,
  alertTodayOrders:true,
  alertUnpaidDelivered:true,
  alertPurchaseDue:true,
  alertServiceDue:true,
  alertHighExpenses:true,
  alertOpenShift:true,
  alertStocktakeDiff:true,
  showUnreadBadgeCount:true,
  playSoundOnNewNotice:true,
  maxHistoryItems:400
 },
 dateTimeConfig:{
  showDateTime:true,
  timeDisplayMode:'datetime_12h', // 'datetime_12h' | 'datetime_24h' | 'date_only' | 'time_only' | 'relative' | 'hidden'
  clarityDuration:'always', // 'always' | '1h' | '6h' | '24h' | '3d' | '7d' | '30d'
  clarityFromDate:'',
  clarityFromTime:'',
  timeFontSize:'11px'
 }
};
const NOTICE_DARK={panel:'#111c2e',title:'#f1f5f9',body:'#cbd5e1',border:'#334155',row:'#1e293b',read:'#172337',accent:'#5eead4',buttonBg:'#123a3a',buttonText:'#99f6e4',time:'#94a3b8'};
let read=new Set(),toastHistory=[];try{const v=JSON.parse(localStorage.getItem(READ_KEY)||'[]');if(Array.isArray(v))read=new Set(v.slice(-1500).filter(x=>typeof x==='string'));}catch{}try{const v=JSON.parse(localStorage.getItem(HISTORY_KEY)||'[]');if(Array.isArray(v))toastHistory=v.filter(x=>x&&typeof x.body==='string').slice(-400);}catch{}
let current=[],searchTimer=0,searchItems=[],toastSeq=0;
const norm=v=>String(v??'').toLocaleLowerCase('ar-EG').normalize('NFKD').replace(/[\u064B-\u065F\u0670]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/ـ/g,'').replace(/[٠-٩]/g,d=>'0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)]).replace(/[۰-۹]/g,d=>'0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)]).replace(/(^|\s)ال(?=[\u0600-\u06ff])/g,'$1').trim();
const txt=v=>String(v??'').trim();
const safeRead=()=>{try{localStorage.setItem(READ_KEY,JSON.stringify([...read].slice(-1500)));}catch{}};
const hex=(v,f)=>/^#[0-9a-f]{6}$/i.test(String(v||''))?String(v):f;

function noticeConfig(){
 const store=typeof ss==='function'?ss():((appState.shopSettings||={}));
 const raw=store.notifications153&&typeof store.notifications153==='object'?store.notifications153:{};
 const base=document.body.classList.contains('dark')?NOTICE_DARK:NOTICE_DEFAULT.colors;
 const cfg={
  enabled:{...NOTICE_DEFAULT.enabled,...(raw.enabled||{})},
  colors:{...base},
  alertOptions:{...NOTICE_DEFAULT.alertOptions,...(raw.alertOptions||{})},
  dateTimeConfig:{...NOTICE_DEFAULT.dateTimeConfig,...(raw.dateTimeConfig||{})}
 };
 for(const k of Object.keys(cfg.enabled))cfg.enabled[k]=cfg.enabled[k]!==false;
 for(const k of Object.keys(cfg.colors)){
  const saved=hex(raw.colors?.[k],NOTICE_DEFAULT.colors[k]);
  if(saved&&(!document.body.classList.contains('dark')||saved!==NOTICE_DEFAULT.colors[k]))cfg.colors[k]=saved;
 }
 cfg.alertOptions.soonDays=Math.max(1,Math.min(30,Number(cfg.alertOptions.soonDays)||3));
 cfg.alertOptions.clientDebtLimit=Math.max(0,Number(cfg.alertOptions.clientDebtLimit)||0);
 cfg.alertOptions.supplierDebtLimit=Math.max(0,Number(cfg.alertOptions.supplierDebtLimit)||0);
 cfg.alertOptions.backupStaleHours=Math.max(1,Number(cfg.alertOptions.backupStaleHours)||24);
 cfg.alertOptions.expenseAlertThreshold=Math.max(0,Number(cfg.alertOptions.expenseAlertThreshold)||5000);
 cfg.alertOptions.maxHistoryItems=Math.max(50,Math.min(2000,Number(cfg.alertOptions.maxHistoryItems)||400));
 for(const bKey of ['alertZeroStock','alertReservedStock','alertLateOrders','alertTodayOrders','alertUnpaidDelivered','alertPurchaseDue','alertServiceDue','alertHighExpenses','alertOpenShift','alertStocktakeDiff','showUnreadBadgeCount','playSoundOnNewNotice']){
  cfg.alertOptions[bKey]=cfg.alertOptions[bKey]!==false;
 }
 cfg.dateTimeConfig.showDateTime=cfg.dateTimeConfig.showDateTime!==false&&cfg.dateTimeConfig.timeDisplayMode!=='hidden';
 if(!['datetime_12h','datetime_24h','date_only','time_only','relative','hidden'].includes(cfg.dateTimeConfig.timeDisplayMode)){
  cfg.dateTimeConfig.timeDisplayMode='datetime_12h';
 }
 if(!['always','1h','6h','24h','3d','7d','30d'].includes(cfg.dateTimeConfig.clarityDuration)){
  cfg.dateTimeConfig.clarityDuration='always';
 }
 if(!['10px','11px','12px','13px'].includes(cfg.dateTimeConfig.timeFontSize)){
  cfg.dateTimeConfig.timeFontSize='11px';
 }
 store.notifications153=cfg;
 return cfg;
}

function formatNoticeTimestamp161(ts,dtCfg){
 if(!dtCfg||!dtCfg.showDateTime||dtCfg.timeDisplayMode==='hidden'||!ts)return '';
 const d=new Date(typeof ts==='number'?ts:(Date.parse(String(ts))||Date.now()));
 if(Number.isNaN(d.getTime()))return String(ts||'');
 const mode=dtCfg.timeDisplayMode||'datetime_12h';
 if(mode==='relative'){
  const diffSec=Math.max(0,Math.floor((Date.now()-d.getTime())/1000));
  if(diffSec<60)return 'الآن';
  if(diffSec<3600)return `منذ ${Math.floor(diffSec/60)} دقيقة`;
  if(diffSec<86400)return `منذ ${Math.floor(diffSec/3600)} ساعة`;
  return `منذ ${Math.floor(diffSec/86400)} يوم (${d.toLocaleDateString('ar-EG')})`;
 }
 if(mode==='date_only'){
  return d.toLocaleDateString('ar-EG',{year:'numeric',month:'2-digit',day:'2-digit'});
 }
 if(mode==='time_only'){
  return d.toLocaleTimeString('ar-EG',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true});
 }
 if(mode==='datetime_24h'){
  return d.toLocaleString('ar-EG',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false});
 }
 return d.toLocaleString('ar-EG',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:true});
}

function isNoticeWithinClarityWindow161(ts,dtCfg){
 if(!dtCfg)return true;
 const itemMs=typeof ts==='number'?ts:(Date.parse(String(ts||''))||Date.now());
 if(dtCfg.clarityDuration&&dtCfg.clarityDuration!=='always'){
  const hoursMap={'1h':1,'6h':6,'24h':24,'3d':72,'7d':168,'30d':720};
  const maxAgeMs=(hoursMap[dtCfg.clarityDuration]||0)*3600*1000;
  if(maxAgeMs>0&&(Date.now()-itemMs)>maxAgeMs)return false;
 }
 if(dtCfg.clarityFromDate){
  const timeStr=dtCfg.clarityFromTime||'00:00';
  const cutoffMs=Date.parse(`${dtCfg.clarityFromDate}T${timeStr}:00`);
  if(Number.isFinite(cutoffMs)&&itemMs<cutoffMs)return false;
 }
 return true;
}

function persistHistory(){
 const maxItems=noticeConfig().alertOptions?.maxHistoryItems||400;
 try{localStorage.setItem(HISTORY_KEY,JSON.stringify(toastHistory.slice(-maxItems)));}catch{}
}
function applyNotificationColors(root){
 if(!root)return;
 const cfg=noticeConfig(),c=cfg.colors;
 for(const[k,v]of Object.entries(c))root.style.setProperty('--notice-'+k.replace(/[A-Z]/g,m=>'-'+m.toLowerCase()),v);
 root.style.setProperty('--notice-time-size',cfg.dateTimeConfig?.timeFontSize||'11px');
}
function saveNoticeSettings(){
 if(appState?.isLocked||typeof can==='function'&&!can('sets_ui'))return permDeny();
 const cfg=noticeConfig();
 saveState(false);
 applyNotificationColors($('notificationCenter152'));
 renderNotificationSettings();
 refreshNotifications();
}

function renderNotificationSettings(){
 const host=$('subtab-notificationsTab');if(!host)return;
 let box=$('notificationSettings153');
 if(!box){box=document.createElement('section');box.id='notificationSettings153';box.className='rounded-2xl border p-5 space-y-6 mt-6';host.append(box);}
 const cfg=noticeConfig(),ao=cfg.alertOptions,dt=cfg.dateTimeConfig;
 const snd=typeof window.getSoundConfig160==='function'?window.getSoundConfig160():null;
 box.style.backgroundColor=cfg.colors.panel;box.style.color=cfg.colors.title;box.style.borderColor=cfg.colors.border;

 const previewStamp=formatNoticeTimestamp161(Date.now(),dt);

 box.innerHTML=`
 <div class="flex flex-wrap items-center justify-between gap-3 border-b pb-3" style="border-color:${cfg.colors.border}">
  <div>
   <h3 class="font-black text-lg flex items-center gap-2"><i class="fa-solid fa-bell text-teal-600"></i><span>إعدادات مركز الإشعارات والتنبيهات</span></h3>
   <p class="text-xs text-slate-500 mt-1">تخصيص شامل لأقسام التنبيهات، قواعد وشروط التنبيه الذكية، التحكم في تاريخ الوضوح ووقت الإشعارات أو إخفائه، وألوان المركز.</p>
  </div>
  <div class="flex flex-wrap items-center gap-2">
   <button type="button" id="noticeEnableAllTypes161" class="px-3 py-1.5 rounded-xl border text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700">تفعيل كل التنبيهات</button>
   <button type="button" id="noticeClearHistoryBtn161" class="px-3 py-1.5 rounded-xl border border-rose-300 text-rose-600 text-xs font-bold hover:bg-rose-50">مسح سجل الإشعارات</button>
   <button type="button" id="noticeTestSoundBtn161" class="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black"><i class="fa-solid fa-volume-high ml-1"></i>اختبار نغمة الإشعار</button>
  </div>
 </div>

 <!-- 1. أقسام وتصنيفات الإشعارات -->
 <div class="space-y-2.5">
  <h4 class="font-black text-sm flex items-center gap-2"><i class="fa-solid fa-layer-group text-teal-600"></i><span>أقسام وتصنيفات التنبيهات النشطة في البرنامج (${NOTICE_TYPES.length} قسماً)</span></h4>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
   ${NOTICE_TYPES.map(([key,label])=>`<label class="flex items-center gap-2.5 rounded-xl border p-2.5 text-xs font-bold cursor-pointer hover:border-teal-400 transition" style="border-color:${cfg.colors.border}"><input type="checkbox" class="w-4 h-4 accent-teal-600" data-notice-type="${key}" ${cfg.enabled[key]?'checked':''}><span>${label}</span></label>`).join('')}
  </div>
 </div>

 <!-- 2. خيارات وقواعد التنبيهات الإضافية في البرنامج -->
 <div class="space-y-3 pt-3 border-t" style="border-color:${cfg.colors.border}">
  <h4 class="font-black text-sm flex items-center gap-2"><i class="fa-solid fa-sliders text-teal-600"></i><span>خيارات وشروط التنبيهات الذكية في البرنامج</span></h4>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
   <label class="block rounded-xl border p-3 space-y-1" style="border-color:${cfg.colors.border}">
    <span class="font-bold block">التنبيه قبل موعد تسليم الطلب بـ:</span>
    <select data-alert-num="soonDays" class="w-full px-2.5 py-1.5 border rounded-lg font-bold bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100">
     ${[[1,'يوم واحد'],[2,'يومين'],[3,'3 أيام (افتراضي)'],[5,'5 أيام'],[7,'7 أيام (أسبوع)'],[14,'14 يوماً']].map(([v,l])=>`<option value="${v}" ${Number(ao.soonDays)===v?'selected':''}>${l}</option>`).join('')}
    </select>
   </label>
   <label class="block rounded-xl border p-3 space-y-1" style="border-color:${cfg.colors.border}">
    <span class="font-bold block">الحد الأدنى للتنبيه بمديونية العميل:</span>
    <select data-alert-num="clientDebtLimit" class="w-full px-2.5 py-1.5 border rounded-lg font-bold bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100">
     ${[[0,'أي مديونية (أكبر من 0 ج.م)'],[250,'250 ج.م فأكثر'],[500,'500 ج.م فأكثر'],[1000,'1,000 ج.م فأكثر'],[3000,'3,000 ج.م فأكثر'],[5000,'5,000 ج.م فأكثر']].map(([v,l])=>`<option value="${v}" ${Number(ao.clientDebtLimit)===v?'selected':''}>${l}</option>`).join('')}
    </select>
   </label>
   <label class="block rounded-xl border p-3 space-y-1" style="border-color:${cfg.colors.border}">
    <span class="font-bold block">الحد الأدنى للتنبيه بمستحقات المورد:</span>
    <select data-alert-num="supplierDebtLimit" class="w-full px-2.5 py-1.5 border rounded-lg font-bold bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100">
     ${[[0,'أي مستحقات (أكبر من 0 ج.م)'],[250,'250 ج.م فأكثر'],[500,'500 ج.م فأكثر'],[1000,'1,000 ج.م فأكثر'],[3000,'3,000 ج.م فأكثر'],[5000,'5,000 ج.م فأكثر']].map(([v,l])=>`<option value="${v}" ${Number(ao.supplierDebtLimit)===v?'selected':''}>${l}</option>`).join('')}
    </select>
   </label>
   <label class="block rounded-xl border p-3 space-y-1" style="border-color:${cfg.colors.border}">
    <span class="font-bold block">التنبيه بتأخر النسخ الاحتياطي بعد:</span>
    <select data-alert-num="backupStaleHours" class="w-full px-2.5 py-1.5 border rounded-lg font-bold bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100">
     ${[[6,'6 ساعات'],[12,'12 ساعة'],[24,'24 ساعة (يوم كامل)'],[48,'48 ساعة (يومين)'],[72,'72 ساعة (3 أيام)']].map(([v,l])=>`<option value="${v}" ${Number(ao.backupStaleHours)===v?'selected':''}>${l}</option>`).join('')}
    </select>
   </label>
   <label class="block rounded-xl border p-3 space-y-1" style="border-color:${cfg.colors.border}">
    <span class="font-bold block">حد التنبيه للمصروفات اليومية بالخزينة:</span>
    <select data-alert-num="expenseAlertThreshold" class="w-full px-2.5 py-1.5 border rounded-lg font-bold bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100">
     ${[[1000,'1,000 ج.م'],[2500,'2,500 ج.م'],[5000,'5,000 ج.م (افتراضي)'],[10000,'10,000 ج.م'],[25000,'25,000 ج.م']].map(([v,l])=>`<option value="${v}" ${Number(ao.expenseAlertThreshold)===v?'selected':''}>${l}</option>`).join('')}
    </select>
   </label>
   <label class="block rounded-xl border p-3 space-y-1" style="border-color:${cfg.colors.border}">
    <span class="font-bold block">الحد الأقصى لحفظ سجل إشعارات البرنامج:</span>
    <select data-alert-num="maxHistoryItems" class="w-full px-2.5 py-1.5 border rounded-lg font-bold bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100">
     ${[[100,'100 إشعار'],[200,'200 إشعار'],[400,'400 إشعار (افتراضي)'],[800,'800 إشعار'],[1500,'1,500 إشعار']].map(([v,l])=>`<option value="${v}" ${Number(ao.maxHistoryItems)===v?'selected':''}>${l}</option>`).join('')}
    </select>
   </label>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
   ${[
     ['alertZeroStock','تنبيه عاجل عند نفاد الصنف تماماً (رصيد صفر)'],
     ['alertReservedStock','تنبيه عند وصول المتاح بعد الحجوزات لحد الطلب'],
     ['alertLateOrders','تنبيه أوامر الشغل المتأخرة عن موعد التسليم'],
     ['alertTodayOrders','تنبيه أوامر الشغل المستحقة للتسليم اليوم'],
     ['alertUnpaidDelivered','تنبيه الفواتير التي تم تسليمها وعليها مبالغ متبقية'],
     ['alertPurchaseDue','تنبيه فواتير الوارد التي عليها متبقي للموردين'],
     ['alertServiceDue','تنبيه الخدمات الخارجية غير المسددة بالكامل'],
     ['alertHighExpenses','تنبيه تجاوز المصروفات اليومية للحد المسموح'],
     ['alertOpenShift','تنبيه الورديات المفتوحة التي تحتاج مراجعة أو إغلاق'],
     ['alertStocktakeDiff','تنبيه وجود فروقات كمية أو قيمة في جرد المخزن'],
     ['showUnreadBadgeCount','إظهار شارة عدد الإشعارات غير المقروءة أعلى الشاشة'],
     ['playSoundOnNewNotice','تشغيل نغمة صوتية تلقائية مع التنبيهات الجديدة']
   ].map(([k,l])=>`<label class="flex items-center gap-2 rounded-xl border p-2.5 text-xs font-bold cursor-pointer hover:border-teal-400 transition" style="border-color:${cfg.colors.border}"><input type="checkbox" class="w-4 h-4 accent-teal-600" data-alert-bool="${k}" ${ao[k]!==false?'checked':''}><span>${l}</span></label>`).join('')}
  </div>
 </div>

 <!-- 3. التحكم في تاريخ الوضوح ووقت الإشعارات أو إخفاؤه -->
 <div class="space-y-3 pt-3 border-t" style="border-color:${cfg.colors.border}">
  <div class="flex flex-wrap items-center justify-between gap-2">
   <h4 class="font-black text-sm flex items-center gap-2"><i class="fa-solid fa-calendar-check text-teal-600"></i><span>إعداد التحكم في تاريخ الوضوح ووقت الإشعارات أو إخفائه</span></h4>
   <label class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-black cursor-pointer" style="border-color:${cfg.colors.border}">
    <input type="checkbox" id="noticeShowDateTimeToggle161" class="w-4 h-4 accent-teal-600" ${dt.showDateTime&&dt.timeDisplayMode!=='hidden'?'checked':''}>
    <span>إظهار التاريخ والوقت في الإشعارات</span>
   </label>
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
   <label class="block rounded-xl border p-3 space-y-1" style="border-color:${cfg.colors.border}">
    <span class="font-bold block">صيغة عرض التاريخ والوقت أو إخفاؤه:</span>
    <select id="noticeTimeModeSelect161" class="w-full px-2.5 py-1.5 border rounded-lg font-bold bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100">
     ${[
       ['datetime_12h','إظهار التاريخ والوقت (نظام 12 ساعة ص/م)'],
       ['datetime_24h','إظهار التاريخ والوقت (نظام 24 ساعة)'],
       ['date_only','إظهار التاريخ فقط (إخفاء الوقت)'],
       ['time_only','إظهار الوقت فقط (إخفاء التاريخ)'],
       ['relative','توقيت نسبي ذكي (منذ دقائق / اليوم)'],
       ['hidden','إخفاء التاريخ والوقت نهائياً']
     ].map(([v,l])=>`<option value="${v}" ${dt.timeDisplayMode===v?'selected':''}>${l}</option>`).join('')}
    </select>
   </label>

   <label class="block rounded-xl border p-3 space-y-1" style="border-color:${cfg.colors.border}">
    <span class="font-bold block">مدة وضوح وبقاء الإشعارات في المركز:</span>
    <select id="noticeClarityDuration161" class="w-full px-2.5 py-1.5 border rounded-lg font-bold bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100">
     ${[
       ['always','دائماً (عرض كل الإشعارات بدون إخفاء تلقائي)'],
       ['1h','ساعة واحدة فقط ثم تُخفى تلقائياً'],
       ['6h','6 ساعات'],
       ['24h','24 ساعة (إشعارات اليوم فقط)'],
       ['3d','3 أيام'],
       ['7d','7 أيام (أسبوع)'],
       ['30d','30 يوماً (شهر)']
     ].map(([v,l])=>`<option value="${v}" ${dt.clarityDuration===v?'selected':''}>${l}</option>`).join('')}
    </select>
   </label>

   <div class="rounded-xl border p-3 space-y-1" style="border-color:${cfg.colors.border}">
    <div class="flex items-center justify-between">
     <span class="font-bold">تاريخ ووقت بداية وضوح الإشعارات:</span>
     <button type="button" id="noticeClearCutoffBtn161" class="text-[10px] text-teal-600 font-bold hover:underline">مسح التاريخ</button>
    </div>
    <div class="grid grid-cols-2 gap-1.5">
     <input type="date" id="noticeClarityFromDate161" value="${dt.clarityFromDate||''}" class="px-2 py-1 border rounded-lg font-mono text-xs bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100" title="تاريخ بداية ظهور الإشعارات">
     <input type="time" id="noticeClarityFromTime161" value="${dt.clarityFromTime||''}" class="px-2 py-1 border rounded-lg font-mono text-xs bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100" title="وقت بداية ظهور الإشعارات">
    </div>
   </div>

   <label class="block rounded-xl border p-3 space-y-1" style="border-color:${cfg.colors.border}">
    <span class="font-bold block">حجم خط التاريخ والوقت (درجة الوضوح):</span>
    <select id="noticeTimeFontSize161" class="w-full px-2.5 py-1.5 border rounded-lg font-bold bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100">
     ${[
       ['10px','صغير (10px)'],
       ['11px','متوسط قياسي (11px)'],
       ['12px','واضح وكبير (12px)'],
       ['13px','عالي الوضوح (13px)']
     ].map(([v,l])=>`<option value="${v}" ${dt.timeFontSize===v?'selected':''}>${l}</option>`).join('')}
    </select>
   </label>
  </div>
 </div>

 <!-- 4. ألوان المركز -->
 <div class="pt-3 border-t" style="border-color:${cfg.colors.border}">
  <h4 class="font-black mb-3 text-sm flex items-center gap-2"><i class="fa-solid fa-palette text-teal-600"></i><span>ألوان مركز الإشعارات والتاريخ</span></h4>
  <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
   ${[['panel','خلفية النافذة'],['title','لون العناوين'],['body','لون النص والتفاصيل'],['time','لون التاريخ والوقت'],['border','لون الحدود والفواصل'],['row','خلفية الإشعار'],['read','خلفية المقروء'],['accent','لون نقطة التنبيه والتمييز'],['buttonBg','خلفية زر فتح السجل'],['buttonText','لون كتابة زر فتح السجل']].map(([k,l])=>`<label class="flex items-center justify-between gap-2 rounded-lg border p-2 text-xs" style="border-color:${cfg.colors.border}"><span>${l}</span><input type="color" data-notice-color="${k}" value="${cfg.colors[k]}" aria-label="${l}"></label>`).join('')}
  </div>
 </div>

 <!-- 5. معاينة مباشرة -->
 <div id="noticeSettingsPreview153" class="rounded-xl border p-3 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-3" style="background:${cfg.colors.panel};border-color:${cfg.colors.border}">
  <div>
   <span>معاينة مباشرة:</span>
   <span id="noticePreviewRow153" class="inline-block rounded-lg px-3 py-2 mr-2" style="background:${cfg.colors.row};color:${cfg.colors.title};border:1px solid ${cfg.colors.border}">
    إشعار تجريبي — <span style="color:${cfg.colors.body}">النص واضح (${snd&&snd.enabled===false?'الصوت صامت':'الصوت مفعّل '+Math.round((snd?.volume||0.75))+'%'})</span>
    ${previewStamp?`<small id="noticePreviewTime161" class="block mt-1 font-mono" style="color:${cfg.colors.time};font-size:${dt.timeFontSize}"><i class="fa-regular fa-clock ml-1"></i>${previewStamp}</small>`:''}
   </span>
  </div>
  <span id="noticePreviewButton153" class="inline-block rounded-lg px-3 py-2 font-bold" style="background:${cfg.colors.buttonBg};color:${cfg.colors.buttonText}">فتح السجل</span>
 </div>`;

 box.querySelector('#noticeTestSoundBtn161')?.addEventListener('click',()=>window.sound160TestAll?window.sound160TestAll():window.playSystemSound160?.('toastInfo',true));
 box.querySelector('#noticeEnableAllTypes161')?.addEventListener('click',()=>{
  const c=noticeConfig();
  for(const [k] of NOTICE_TYPES)c.enabled[k]=true;
  saveNoticeSettings();
  if(typeof showToast==='function')showToast('تم تفعيل جميع أقسام التنبيهات بنجاح','success');
 });
 box.querySelector('#noticeClearHistoryBtn161')?.addEventListener('click',()=>{
  toastHistory=[];persistHistory();saveNoticeSettings();
  if(typeof showToast==='function')showToast('تم مسح سجل رسائل الإشعارات المؤقتة','info');
 });
 box.querySelectorAll('[data-notice-type]').forEach(el=>el.addEventListener('change',()=>{noticeConfig().enabled[el.dataset.noticeType]=el.checked;saveNoticeSettings();}));
 box.querySelectorAll('[data-alert-num]').forEach(el=>el.addEventListener('change',()=>{noticeConfig().alertOptions[el.dataset.alertNum]=Number(el.value);saveNoticeSettings();}));
 box.querySelectorAll('[data-alert-bool]').forEach(el=>el.addEventListener('change',()=>{noticeConfig().alertOptions[el.dataset.alertBool]=el.checked;saveNoticeSettings();}));

 box.querySelector('#noticeShowDateTimeToggle161')?.addEventListener('change',e=>{
  const d=noticeConfig().dateTimeConfig;
  d.showDateTime=e.target.checked;
  if(!e.target.checked)d.timeDisplayMode='hidden';
  else if(d.timeDisplayMode==='hidden')d.timeDisplayMode='datetime_12h';
  saveNoticeSettings();
 });
 box.querySelector('#noticeTimeModeSelect161')?.addEventListener('change',e=>{
  const d=noticeConfig().dateTimeConfig;
  d.timeDisplayMode=e.target.value;
  d.showDateTime=e.target.value!=='hidden';
  saveNoticeSettings();
 });
 box.querySelector('#noticeClarityDuration161')?.addEventListener('change',e=>{
  noticeConfig().dateTimeConfig.clarityDuration=e.target.value;
  saveNoticeSettings();
 });
 box.querySelector('#noticeClarityFromDate161')?.addEventListener('change',e=>{
  noticeConfig().dateTimeConfig.clarityFromDate=e.target.value;
  saveNoticeSettings();
 });
 box.querySelector('#noticeClarityFromTime161')?.addEventListener('change',e=>{
  noticeConfig().dateTimeConfig.clarityFromTime=e.target.value;
  saveNoticeSettings();
 });
 box.querySelector('#noticeClearCutoffBtn161')?.addEventListener('click',()=>{
  const d=noticeConfig().dateTimeConfig;
  d.clarityFromDate='';d.clarityFromTime='';
  saveNoticeSettings();
 });
 box.querySelector('#noticeTimeFontSize161')?.addEventListener('change',e=>{
  noticeConfig().dateTimeConfig.timeFontSize=e.target.value;
  saveNoticeSettings();
 });

 box.querySelectorAll('[data-notice-color]').forEach(el=>el.addEventListener('input',()=>{
  const c=noticeConfig().colors;
  c[el.dataset.noticeColor]=hex(el.value,'#ffffff');
  applyNotificationColors($('notificationCenter152'));
  const p=$('noticePreviewRow153'),b=$('noticePreviewButton153'),panel=$('noticeSettingsPreview153'),tm=$('noticePreviewTime161');
  if(panel){panel.style.background=c.panel;panel.style.borderColor=c.border;}
  if(p){p.style.background=c.row;p.style.color=c.title;p.style.borderColor=c.border;p.querySelector('span').style.color=c.body;}
  if(tm){tm.style.color=c.time;}
  if(b){b.style.background=c.buttonBg;b.style.color=c.buttonText;}
  box.style.setProperty('--notice-panel',c.panel);
  box.style.backgroundColor=c.panel;box.style.color=c.title;box.style.borderColor=c.border;
 }));
 box.querySelectorAll('[data-notice-color]').forEach(el=>el.addEventListener('change',saveNoticeSettings));
 applyNotificationColors($('notificationCenter152'));
 applyNotificationColors(box);
 if(typeof window.renderSoundSettings==='function')window.renderSoundSettings();
}

function recordToast(message,kind='info'){
 const body=txt(message);if(!body||body.length<2)return;
 const now=Date.now(),last=toastHistory.at(-1);
 if(last&&last.body===body&&last.kind===kind&&now-Number(last.time)<30000){
  last.time=now;last.count=(last.count||1)+1;persistHistory();refreshNotifications();return;
 }
 const level=kind==='danger'?'high':kind==='warning'?'warning':'info';
 const maxItems=noticeConfig().alertOptions?.maxHistoryItems||400;
 toastHistory.push({id:'toast:'+now+':'+(++toastSeq),body,kind,level,time:now,count:1});
 toastHistory=toastHistory.slice(-maxItems);
 persistHistory();refreshNotifications();
}
function visiblePermission(tab){if(typeof can!=='function')return false;try{return can('tab_'+tab)===true;}catch{return false;}}
function push(out,n){
 if(!n.id)return;
 const ts=n.time||(n.date?Date.parse(String(n.date)+'T12:00:00'):Date.now())||Date.now();
 out.push({...n,time:ts,read:read.has(n.id)});
}
function buildNotifications(){
 const s=appState||{},out=[],today=typeof todayStr==='function'?todayStr():new Date().toISOString().slice(0,10);
 const cfg=noticeConfig(),ao=cfg.alertOptions,dt=cfg.dateTimeConfig;
 const admin=(s.users||[]).find(u=>u.role==='admin'&&(u.pinDefault===true||u.pin==='1234'));
 if(admin&&s.currentUser==admin.id)push(out,{id:'security:default-pin',type:'security',level:'high',title:'الرقم السري الافتراضي ما زال مستخدماً',body:'غيّر PIN المدير إلى رقم قوي من إدارة المستخدمين قبل متابعة العمل.',tab:'settings',actionLabel:'إعدادات المستخدمين'});
 if(s.currentUser==admin?.id){const resetUsers=(s.users||[]).filter(u=>u.pinNeedsReset);if(resetUsers.length)push(out,{id:'security:reset-pins:'+resetUsers.map(u=>u.id).sort().join(','),type:'security',level:'warning',title:'بعض المستخدمين يحتاجون إعادة تعيين PIN',body:`عدد الحسابات التي تحتاج إلى رقم سري جديد: ${resetUsers.length}`,tab:'settings',actionLabel:'إدارة المستخدمين'});}
 if(visiblePermission('inventory'))for(const i of s.items||[]){
  const qty=Number(i.qty)||0,min=Number(i.minQty)||0;
  if(qty<=0&&ao.alertZeroStock!==false)push(out,{id:'stock:'+i.id,type:'stock',level:'high',title:'خامة نفدت من المخزن',body:`${txt(i.name)} — الرصيد ${qty} ${txt(i.unit)}، حد الطلب ${min}`,tab:'inventory',term:txt(i.name),actionLabel:'فتح الخامة'});
  else if(qty>0&&qty<=min)push(out,{id:'stock:'+i.id,type:'stock',level:'warning',title:'خامة وصلت إلى حد الطلب',body:`${txt(i.name)} — الرصيد ${qty} ${txt(i.unit)}، حد الطلب ${min}`,tab:'inventory',term:txt(i.name),actionLabel:'فتح الخامة'});
  else if(ao.alertReservedStock!==false&&window.Operations149?.reserved){const reserved=Number(window.Operations149.reserved(s,i.id))||0,available=qty-reserved;if(reserved>0&&available<=min)push(out,{id:'stock-reserved:'+i.id,type:'stock',level:available<=0?'high':'warning',title:available<=0?'الرصيد المتاح محجوز بالكامل':'المتاح بعد الحجوزات عند حد الطلب',body:`${txt(i.name)} — فعلي ${qty}، محجوز ${reserved}، متاح ${available} ${txt(i.unit)}`,tab:'inventory',term:txt(i.name),actionLabel:'فتح الخامة'});}
  if(ao.alertStocktakeDiff!==false&&i.lastActualCount!==undefined&&Math.abs(Number(i.lastActualCount)-qty)>0.001){
   push(out,{id:'stocktake-diff:'+i.id,type:'stocktake',level:'warning',title:`فرق جرد في الصنف: ${txt(i.name)}`,body:`الرصيد الدفتري ${qty} مقابل الفعلي ${i.lastActualCount} ${txt(i.unit)}`,tab:'stocktake',term:txt(i.name),actionLabel:'مراجعة الجرد'});
  }
 }
 if(visiblePermission('orders'))for(const o of s.orders||[]){
  const due=txt(o.deliveryDate);
  if(due&&due<today&&o.status!=='تم التسليم'&&o.status!=='ملغي'&&ao.alertLateOrders!==false)push(out,{id:'late:'+o.id,type:'orders',level:'high',title:`أمر شغل متأخر #${txt(o.orderNo)}`,body:`${txt(o.clientName)} — موعد التسليم ${due}`,date:due,tab:'orders',term:txt(o.orderNo),actionLabel:'فتح أمر الشغل'});
  else if(due===today&&o.status!=='تم التسليم'&&o.status!=='ملغي'&&ao.alertTodayOrders!==false)push(out,{id:'today:'+o.id,type:'orders',level:'warning',title:`موعد تسليم اليوم #${txt(o.orderNo)}`,body:`${txt(o.clientName)} — ${txt(o.jobType)}`,date:due,tab:'orders',term:txt(o.orderNo),actionLabel:'متابعة الأمر'});
  else if(due&&o.status!=='تم التسليم'&&o.status!=='ملغي'){const days=Math.ceil((Date.parse(due+'T00:00:00')-Date.parse(today+'T00:00:00'))/86400000);if(days>0&&days<=(ao.soonDays||3))push(out,{id:'soon:'+o.id,type:'orders',level:'info',title:`موعد تسليم قريب #${txt(o.orderNo)}`,body:`${txt(o.clientName)} — متبقي ${days} يوم على التسليم`,date:due,tab:'orders',term:txt(o.orderNo),actionLabel:'متابعة الأمر'});}
  if(ao.alertUnpaidDelivered!==false&&o.status==='تم التسليم'){
   const rem=typeof orderRemaining==='function'?orderRemaining(o):Math.max(0,Number(o.total||0)-Number(o.paid||0));
   if(rem>0.01)push(out,{id:'unpaid-delivered:'+o.id,type:'orders',level:'warning',title:`طلب مُسلّم وعليه متبقي #${txt(o.orderNo)}`,body:`${txt(o.clientName)} — المتبقي ${typeof formatCurrency==='function'?formatCurrency(rem):rem}`,date:o.date,tab:'orders',term:txt(o.orderNo),actionLabel:'مراجعة الفاتورة'});
  }
 }
 if(visiblePermission('quotes'))for(const q of s.quotes||[]){const until=txt(q.validUntil);if(until&&until<today&&q.status!=='تم التحويل'&&q.status!=='مرفوض')push(out,{id:'quote-expired:'+q.id,type:'quotes',level:'warning',title:`عرض سعر انتهت صلاحيته #${txt(q.no)}`,body:`${txt(q.clientName)} — انتهت الصلاحية ${until}`,date:until,tab:'quotes',term:txt(q.no),actionLabel:'فتح العرض'});}
 if(visiblePermission('purchases')&&ao.alertPurchaseDue!==false)for(const p of s.purchases||[]){
  const due=Number(p.due)||Math.max(0,Number(p.total||0)-Number(p.paid||0));
  if(due>0.01)push(out,{id:'purchase-due:'+p.id,type:'purchases',level:'info',title:`فاتورة وارد عليها متبقي #${txt(p.id)}`,body:`${txt(p.supplierName)} — ${txt(p.itemName)} — المتبقي ${typeof formatCurrency==='function'?formatCurrency(due):due}`,date:p.date,tab:'purchases',term:txt(p.itemName),actionLabel:'فتح الوارد'});
 }
 if(visiblePermission('services')&&ao.alertServiceDue!==false)for(const sv of s.services||[]){
  const due=Math.max(0,Number(sv.amount||0)-Number(sv.paid||0));
  if(due>0.01)push(out,{id:'service-due:'+sv.id,type:'services',level:'info',title:`خدمة عليها مبلغ متبقي: ${txt(sv.title)}`,body:`${txt(sv.partyName||'خدمة عامة')} — المتبقي ${typeof formatCurrency==='function'?formatCurrency(due):due}`,date:sv.date,tab:'services',term:txt(sv.title),actionLabel:'فتح الخدمات'});
 }
 if(visiblePermission('treasury')&&ao.alertHighExpenses!==false){
  const todayExp=(s.treasury||[]).filter(t=>t.date===today&&Number(t.outAmount)>0).reduce((sum,t)=>sum+Number(t.outAmount||0),0);
  if(todayExp>=(ao.expenseAlertThreshold||5000)){
   push(out,{id:'treasury:high-expense:'+today,type:'treasury',level:'warning',title:'تنبيه تجاوز المصروفات اليومية للحد المحدد',body:`إجمالي الصادر اليوم: ${typeof formatCurrency==='function'?formatCurrency(todayExp):todayExp}`,date:today,tab:'treasury',actionLabel:'مراجعة الخزينة'});
  }
 }
 if(ao.alertOpenShift!==false&&Array.isArray(s.shifts149)){
  const openShifts=s.shifts149.filter(sh=>!sh.closedAt);
  if(openShifts.length)push(out,{id:'shifts:open:'+openShifts[0].id,type:'shifts',level:'info',title:'يوجد وردية عمل مفتوحة حالياً',body:`الوردية باسم ${txt(openShifts[0].user||'الكاشير')} منذ ${txt(openShifts[0].openedAt||today)}`,tab:'treasury',actionLabel:'مراجعة الوردية'});
 }
 if(s.autoBackupConfig?.enabled){
  const stamp=txt(s.autoBackupConfig.lastSavedAt).replace(' ','T');
  const last=Date.parse(stamp);
  const staleMs=(ao.backupStaleHours||24)*60*60*1000;
  if(!Number.isFinite(last)||Date.now()-last>staleMs)push(out,{id:'backup:stale',type:'backup',level:'warning',title:'راجع حالة النسخ الاحتياطي',body:`لم يتم تسجيل نسخة احتياطية حديثة خلال آخر ${ao.backupStaleHours||24} ساعة. افتح إعدادات النسخ الاحتياطي وتأكد من المجلد.`,tab:'settings',actionLabel:'إعدادات النسخ الاحتياطي'});
 }
 if(visiblePermission('clients')&&typeof getClientBalance==='function')for(const c of s.clients||[]){
  let due=0;try{due=Number(getClientBalance(c.id))||0;}catch{}
  if(Math.abs(due)>Math.max(0.009,Number(ao.clientDebtLimit)||0))push(out,{id:'client:'+c.id,type:'finance',level:'info',title:due>0?'مستحقات لدى عميل':'رصيد دائن للعميل',body:`${txt(c.name)} — ${typeof formatCurrency==='function'?formatCurrency(Math.abs(due)):Math.abs(due)}`,tab:'clients',term:txt(c.name),actionLabel:'كشف الحساب'});
 }
 if(visiblePermission('suppliers')&&typeof getSupplierBalance==='function')for(const c of s.suppliers||[]){
  let due=0;try{due=Number(getSupplierBalance(c.id))||0;}catch{}
  if(Math.abs(due)>Math.max(0.009,Number(ao.supplierDebtLimit)||0))push(out,{id:'supplier:'+c.id,type:'finance',level:'info',title:due>0?'مستحقات لمورد':'رصيد دائن لنا لدى المورد',body:`${txt(c.name)} — ${typeof formatCurrency==='function'?formatCurrency(Math.abs(due)):Math.abs(due)}`,tab:'suppliers',term:txt(c.name),actionLabel:'كشف المورد'});
 }
 if(window.AccountingAudit153?.inspect&&cfg.enabled.audit!==false){
  try{
   const audit=window.AccountingAudit153.inspect(s);
   for(const issue of (audit.issues||[]).slice(0,10)){
    push(out,{id:'audit:'+issue.code+':'+(issue.id||'0'),type:'audit',level:issue.severity==='warning'?'warning':'high',title:'ملاحظة مراجعة محاسبية',body:txt(issue.message),tab:'dashboard',actionLabel:'مراجعة البيانات'});
   }
  }catch{}
 }
 for(const h of toastHistory){push(out,{id:h.id,type:'activity',level:h.level||'info',title:h.kind==='danger'?'تنبيه خطأ في البرنامج':h.kind==='warning'?'تنبيه من البرنامج':h.kind==='success'?'إشعار نجاح':'إشعار من البرنامج',body:h.body+(h.count>1?` (تكرر ${h.count} مرات)`:''),time:h.time,actionLabel:'تمت المراجعة'});}
 out.sort((a,b)=>({high:0,warning:1,info:2}[a.level]-({high:0,warning:1,info:2}[b.level]))||Number(a.read)-Number(b.read));
 const enabled=cfg.enabled;
 return out.filter(n=>enabled[n.type]!==false&&isNoticeWithinClarityWindow161(n.time,dt));
}

function updateBadge(){
 const b=$('notificationsBadge152');if(!b)return;
 const cfg=noticeConfig();
 const n=current.filter(x=>!x.read).length;
 b.textContent=n>99?'99+':String(n);
 b.classList.toggle('hidden',n===0||cfg.alertOptions?.showUnreadBadgeCount===false);
 const button=$('notificationsButton152');if(button)button.setAttribute('aria-label',`مركز الإشعارات، ${n} غير مقروء`);
}
function refreshNotifications(){current=buildNotifications();updateBadge();const modal=$('notificationCenter152');if(modal)renderNotificationList(modal);}
function actionFor(n){
 if(n.id==='security:default-pin'||n.id.startsWith('security:reset-pins:')||n.id==='backup:stale'){
  switchTab('settings');setTimeout(()=>{const id=n.id==='backup:stale'?'backupTab':'usersTab';if(typeof switchSettingsTab==='function')switchSettingsTab(id);else document.querySelector(`[data-subtab="${id}"]`)?.click();},80);return;
 }
 if(n.type==='audit'&&typeof window.showReviewCenter==='function'){window.showReviewCenter();return;}
 if(n.type==='activity')return;
 switchTab(n.tab);
 const inputs={orders:'searchOrdersInput',inventory:'searchInventoryInput',clients:'searchClientInput',suppliers:'searchSupplierInput',quotes:'searchQuotes',purchases:'purchaseSearch152',services:'searchServicesInput',treasury:'treasurySearch152'};
 const input=$(inputs[n.tab]);if(input&&n.term){input.value=n.term;input.dispatchEvent(new Event('input',{bubbles:true}));}
 const target=n.tab==='orders'?'ordersTableBody':n.tab==='inventory'?'inventoryTableBody':n.tab==='clients'?'clientsTableBody':n.tab==='suppliers'?'suppliersTableBody':n.tab==='quotes'?'quotesTableBody':n.tab==='purchases'?'purchasesTableBody':n.tab==='services'?'servicesTableBody':n.tab==='treasury'?'treasuryTableBody':null;
 $(target)?.scrollIntoView({behavior:'smooth',block:'center'});
}
function markRead(n){read.add(n.id);safeRead();n.read=true;updateBadge();}
function renderNotificationList(root){
 const list=$('notificationList152');if(!list)return;
 const cfg=noticeConfig(),dt=cfg.dateTimeConfig;
 const filter=$('notificationFilter152')?.value||'all';
 list.replaceChildren();
 const rows=current.filter(n=>filter==='all'||(filter==='unread'&&!n.read)||(filter==='read'&&n.read)||(filter===n.type));
 if(!rows.length){
  const empty=document.createElement('div');empty.className='notification-empty152';
  empty.textContent=filter==='unread'?'لا توجد إشعارات جديدة.':'لا توجد إشعارات في هذا التصنيف حالياً.';
  list.append(empty);return;
 }
 for(const n of rows){
  const row=document.createElement('article');row.className=`notification-row152 ${n.read?'is-read':''} level-${n.level}`;
  const mark=document.createElement('span');mark.className='notification-dot152';
  const content=document.createElement('div');content.className='notification-copy152';
  const title=document.createElement('strong');title.textContent=n.title;
  const body=document.createElement('p');body.textContent=n.body;
  content.append(title,body);
  const formattedTime=formatNoticeTimestamp161(n.time,dt);
  if(formattedTime){
   const stamp=document.createElement('small');
   stamp.className='notification-time152';
   stamp.style.color=cfg.colors.time||'#64748b';
   stamp.style.fontSize=dt.timeFontSize||'11px';
   stamp.textContent=formattedTime;
   content.append(stamp);
  }
  const actions=document.createElement('div');actions.className='notification-actions153';
  const readBtn=document.createElement('button');readBtn.type='button';readBtn.className='notification-mark153';readBtn.textContent=n.read?'مقروء':'تعليم كمقروء';readBtn.disabled=n.read;
  readBtn.addEventListener('click',()=>{markRead(n);refreshNotifications();});
  const open=document.createElement('button');open.type='button';open.className='notification-open152';open.textContent=n.actionLabel||'فتح';
  open.addEventListener('click',()=>{markRead(n);closeNotifications();actionFor(n);});
  actions.append(readBtn,open);row.append(mark,content,actions);list.append(row);
 }
}
function closeNotifications(){const root=$('notificationCenter152');if(!root)return;const w=window.Layout150?.windows.get(root);if(w){w.dirty=false;window.Layout150.close(w);}else root.remove();}
function openNotifications(){
 if(appState?.isLocked)return;refreshNotifications();if($('notificationCenter152'))return;/* one close control is supplied by Layout150 */
 const root=document.createElement('div');root.id='notificationCenter152';root.className='studio-overlay150 notification-overlay152';
 const card=document.createElement('section');card.className='studio-card150 notification-card152';applyNotificationColors(card);
 const top=document.createElement('div');top.className='notification-head152';
 const title=document.createElement('div');title.innerHTML='<strong>مركز الإشعارات</strong><small>تنبيهات المخزن والطلبات والوارد والأمان والحسابات</small>';top.append(title);
 const tools=document.createElement('div');tools.className='notification-tools152';
 const select=document.createElement('select');select.id='notificationFilter152';
 [['all','كل الإشعارات'],['unread','غير المقروءة'],['read','المقروءة'],['stock','المخزن'],['orders','أوامر الشغل'],['quotes','عروض الأسعار'],['finance','الحسابات'],['purchases','الوارد'],['services','الخدمات'],['treasury','الخزينة'],['shifts','الورديات'],['stocktake','الجرد'],['audit','المراجعة'],['security','الأمان'],['backup','النسخ الاحتياطي'],['activity','سجل تنبيهات البرنامج']].forEach(([v,l])=>{const o=document.createElement('option');o.value=v;o.textContent=l;select.append(o);});
 select.addEventListener('change',()=>renderNotificationList(root));
 const toggleTimeBtn=document.createElement('button');toggleTimeBtn.type='button';
 const updateToggleTimeText=()=>{const d=noticeConfig().dateTimeConfig;toggleTimeBtn.textContent=(d.showDateTime&&d.timeDisplayMode!=='hidden')?'إخفاء التاريخ والوقت':'إظهار التاريخ والوقت';};
 updateToggleTimeText();
 toggleTimeBtn.addEventListener('click',()=>{
  const d=noticeConfig().dateTimeConfig;
  if(d.showDateTime&&d.timeDisplayMode!=='hidden'){d.showDateTime=false;d.timeDisplayMode='hidden';}
  else{d.showDateTime=true;if(d.timeDisplayMode==='hidden')d.timeDisplayMode='datetime_12h';}
  updateToggleTimeText();saveNoticeSettings();renderNotificationList(root);
 });
 const allRead=document.createElement('button');allRead.type='button';allRead.textContent='تعليم الكل كمقروء';
 allRead.addEventListener('click',()=>{current.forEach(n=>{read.add(n.id);n.read=true;});safeRead();renderNotificationList(root);updateBadge();});
 tools.append(select,toggleTimeBtn,allRead);
 const list=document.createElement('div');list.id='notificationList152';list.className='notification-list152';
 card.append(top,tools,list);root.append(card);document.body.append(root);
 renderNotificationList(root);window.Layout150?.addWindow(root);applyNotificationColors(card);
}

function fieldsOf(type,x){switch(type){case'أوامر الشغل':return [x.orderNo,x.clientName,x.jobType,x.specs,x.status,x.date,x.deliveryDate,x.total,x.paid,x.remaining,...(x.lines||[]).map(v=>v.desc)];case'العملاء':return[x.name,x.phone,x.address];case'الخامات':return[x.name,x.code,x.barcode149,x.category,x.unit,x.qty,x.minQty];case'الموردون':return[x.name,x.phone,x.items];case'الوارد':return[x.id,x.date,x.supplierName,x.itemName,x.notes,x.qty,x.unitPrice,x.total,x.paid,x.due];case'عروض الأسعار':return[x.no,x.clientName,x.jobType,x.specs,x.status,x.date,x.validUntil,x.total];case'الخدمات':return[x.name,x.category,x.description,x.price];case'الخزينة':return[x.id,x.date,x.type,x.desc,x.notes,x.party,x.reference,x.inAmount,x.outAmount,x.paymentMethod,x.user];default:return[];}}
const sources=[['orders','أوامر الشغل','orders'],['clients','العملاء','clients'],['items','الخامات','inventory'],['suppliers','الموردون','suppliers'],['purchases','الوارد','purchases'],['quotes','عروض الأسعار','quotes'],['services','الخدمات','services'],['treasury','الخزينة','treasury']];
function search(query){if(appState?.isLocked)return[];const q=norm(query);if(q.length<2)return[];const out=[];for(const[key,label,tab]of sources){const arr=Array.isArray(appState?.[key])?appState[key]:[];if(!visiblePermission(tab==='purchases'?'purchases':tab==='quotes'?'quotes':tab==='treasury'?'treasury':tab))continue;for(const x of arr){const fields=fieldsOf(label,x).map(txt),hay=norm(fields.join(' '));if(!hay.includes(q))continue;const title=label==='أوامر الشغل'?`أمر شغل #${txt(x.orderNo)}`:label==='الوارد'?`فاتورة وارد #${txt(x.id)}`:label==='عروض الأسعار'?`عرض سعر #${txt(x.no)}`:txt(x.name||x.itemName||x.clientName||x.supplierName||x.desc||x.id)||label;const sub=label==='أوامر الشغل'?`${txt(x.clientName)} • ${txt(x.jobType)}`:label==='الخامات'?`${txt(x.code)} • رصيد ${txt(x.qty)}`:label==='الوارد'?`${txt(x.supplierName)} • ${txt(x.itemName)}`:fields.slice(1,3).filter(Boolean).join(' • ');out.push({key,label,tab,id:x.id,title,sub,rank:norm(title).startsWith(q)?0:1,record:x});}}
 out.sort((a,b)=>a.rank-b.rank);return out.slice(0,24);}
function renderSearch(){const input=$('globalSearch152'),box=$('globalSearchResults152');if(!input||!box)return;const q=input.value.trim();searchItems=window.SearchExtension650?window.SearchExtension650.search(q):search(q);box.replaceChildren();if(norm(q).length<2){box.classList.add('hidden');return;}if(!searchItems.length){const e=document.createElement('div');e.className='global-search-empty152';e.textContent='لا توجد نتائج مطابقة في السجلات المتاحة.';box.append(e);box.classList.remove('hidden');return;}
 searchItems.forEach((r)=>{const b=document.createElement('button');b.type='button';b.className='global-search-result152';b.setAttribute('role','option');const a=document.createElement('span');a.className='global-search-result-type152';a.textContent=r.label;const wrap=document.createElement('span');wrap.className='global-search-result-copy152';const t=document.createElement('strong');t.textContent=r.title;const sub=document.createElement('small');sub.textContent=r.sub;wrap.append(t,sub);b.append(a,wrap);b.addEventListener('click',()=>openResult(r));box.append(b);});box.classList.remove('hidden');}
function openResult(r){if(appState?.isLocked)return;if(['setting650','command650'].includes(r.key))return window.SearchExtension650?.open(r);$('globalSearchResults152')?.classList.add('hidden');const input=$('globalSearch152');if(input)input.blur();switchTab(r.tab);const map={orders:'searchOrdersInput',clients:'searchClientInput',items:'searchInventoryInput',suppliers:'searchSupplierInput',quotes:'searchQuotes',services:'searchServicesInput'};if(r.tab==='orders'&&typeof setSalesRange==='function')setSalesRange('all');const target=$(map[r.key]);if(target){target.value=r.key==='orders'?txt(r.record.orderNo):r.key==='items'?txt(r.record.name):r.key==='quotes'?txt(r.record.no):r.key==='services'?txt(r.record.name):txt(r.record.name||r.record.clientName||r.record.supplierName);target.dispatchEvent(new Event('input',{bubbles:true}));}
 if(r.key==='purchases'){const f=$('purchaseSearch152');if(f)f.value=r.title.includes('#')?txt(r.record.id):txt(r.record.itemName);renderPurchasesTable();}
 if(r.key==='treasury'){const f=$('treasurySearch152');if(f)f.value=txt(r.record.desc||r.record.type||r.record.id);renderTreasuryTable();}
 const view=$(`view-${r.tab}`);view?.scrollIntoView({behavior:'smooth',block:'start'});setTimeout(()=>{const row=[...document.querySelectorAll(`[data-record-type][data-record-id]`)].find(x=>x.dataset.recordId===String(r.id));(row||view)?.scrollIntoView({behavior:'smooth',block:row?'center':'start'});},160);}
function ensureExtendedSearch(){const p=$('purchasesTableBody')?.closest('.overflow-x-auto')?.parentElement;if(p&&!$('purchaseSearch152')){const i=document.createElement('input');i.id='purchaseSearch152';i.type='search';i.placeholder='بحث شامل في الوارد…';i.className='global-extra-filter152';i.addEventListener('input',()=>renderPurchasesTable());p.prepend(i);}const t=$('treasuryTableBody')?.closest('.overflow-x-auto')?.parentElement;if(t&&!$('treasurySearch152')){const i=document.createElement('input');i.id='treasurySearch152';i.type='search';i.placeholder='بحث في حركات الخزينة…';i.className='global-extra-filter152';i.addEventListener('input',()=>renderTreasuryTable());t.prepend(i);}}

// ============================================================================
// DIRECT MOUSE-DRAG RESIZING FOR SEARCH BAR & ADJACENT HEADER BUTTONS (بدون مقابض أو أزرار)
// ============================================================================
function headerSearchCfg161(){
 const store=typeof ss==='function'?ss():((appState.shopSettings||={}));
 const cfg={searchWidth:290,btnScale:100,compactLabels:false};
 store.headerSearchLayout161=cfg;
 return cfg;
}

function applyHeaderSearchLayout161(){
 const wrap=$('globalSearchWrap152'),input=$('globalSearch152');
 if(!wrap)return;
 wrap.querySelectorAll('.global-search-kbd152,kbd,#globalSearchResizeHandle161,#headerResizePopover161').forEach(el=>el.remove());
 $('headerSearchResizeCtrl153')?.remove();
 wrap.classList.remove('search-dragging161','search-edge-hover161');
 wrap.removeAttribute('title');
 wrap.style.removeProperty('width');
 wrap.style.removeProperty('height');
 if(input)input.style.removeProperty('font-size');
 const bar=wrap.parentElement;
 if(bar){
  bar.classList.remove('search-dragging161','hdr-compact-labels161');
  bar.style.removeProperty('--hdr-btn-scale161');
  [...bar.children].forEach(ch=>{
   ch.style?.removeProperty?.('transform');
  });
 }
}

function setupHeaderSearchResizeHandle161(){
 applyHeaderSearchLayout161();
}

function toggleHeaderResizePopover161(){
 // Removed popover per user request; drag-to-resize handles resizing directly.
 applyHeaderSearchLayout161();
}

function init(){
 const input=$('globalSearch152');
 if(input){
  input.addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(renderSearch,100);});
  input.addEventListener('keydown',e=>{if(e.key==='Escape'){$('globalSearchResults152').classList.add('hidden');input.blur();}else if(e.key==='Enter'&&searchItems[0]){e.preventDefault();openResult(searchItems[0]);}});
  document.addEventListener('pointerdown',e=>{if(!e.target.closest('#globalSearchWrap152'))$('globalSearchResults152')?.classList.add('hidden');});
 }
 document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();input?.focus();input?.select();}});
 setupHeaderSearchResizeHandle161();
 ensureExtendedSearch();
 renderNotificationSettings();
 refreshNotifications();
}
const originalToast=window.showToast;if(typeof originalToast==='function')window.showToast=function(message,kind,...args){const result=originalToast.call(this,message,kind,...args);recordToast(message,kind);return result;};
const originalSave=window.saveState;if(typeof originalSave==='function')window.saveState=function(...args){const r=originalSave.apply(this,args);refreshNotifications();return r;};
const originalUpdate=window.updateAllUI;if(typeof originalUpdate==='function')window.updateAllUI=function(...args){const r=originalUpdate.apply(this,args);applyHeaderSearchLayout161();refreshNotifications();return r;};
const oldSwitchSettings=window.switchSettingsTab;if(typeof oldSwitchSettings==='function'&&!oldSwitchSettings.__notice153){const wrappedSwitch=function(id,...args){const out=oldSwitchSettings.call(this,id,...args);if(id==='notificationsTab')renderNotificationSettings();return out;};wrappedSwitch.__notice153=true;window.switchSettingsTab=wrappedSwitch;}
window.Alhamd152={openNotifications,refreshNotifications,search,openResult,renderNotificationSettings,applyHeaderSearchLayout161,toggleHeaderResizePopover161,formatNoticeTimestamp161};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
