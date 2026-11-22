(function(){
 'use strict';
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let countdownTimer=null;
 let detectedLanIp='';

 // Attempt to detect local LAN IPv4 address via WebRTC (works in Chromium/Electron without internet)
 function detectLocalIpViaWebRTC(){
  try{
   const RTCPeer=window.RTCPeerConnection||window.webkitRTCPeerConnection;
   if(!RTCPeer)return;
   const pc=new RTCPeer({iceServers:[]});
   pc.createDataChannel('');
   pc.onicecandidate=e=>{
    if(!e||!e.candidate||!e.candidate.candidate)return;
    const m=e.candidate.candidate.match(/\b((?:192\.168|10\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01]))\.\d{1,3}\.\d{1,3})\b/);
    if(m&&m[1]){
     detectedLanIp=m[1];
     try{localStorage.setItem('alhamd_detected_lan_ip',detectedLanIp);}catch{}
     try{pc.close();}catch{}
    }
   };
   pc.createOffer().then(o=>pc.setLocalDescription(o)).catch(()=>{});
   setTimeout(()=>{try{pc.close();}catch{}},3000);
  }catch{}
 }
 try{detectedLanIp=localStorage.getItem('alhamd_detected_lan_ip')||'';}catch{}
 detectLocalIpViaWebRTC();

 function getLanIpUrl(port=47821){
  const p=Number(port)||47821;
  const host=String(location.hostname||'').trim();
  const isValidIpv4=/^\d{1,3}(\.\d{1,3}){3}$/.test(host)&&host!=='127.0.0.1'&&host!=='0.0.0.0';
  const ip=isValidIpv4?host:(detectedLanIp||'192.168.1.100');
  return {ip,url:`http://${ip}:${p}/mobile`};
 }

 function ensureValidLanInfo(raw){
  const info=Object.assign({},raw||{});
  if(!info.running||!info.enabled||!info.pairCode||!info.pairExpiresAt||Number(info.pairExpiresAt)<=Date.now())
   throw Error('تعذر الحصول على رمز ربط فعلي من خادم الكمبيوتر. أعد فتح نافذة الربط.');
  const addresses=(Array.isArray(info.addresses)?info.addresses:[]).filter(a=>{
   const u=String(a?.url||'');return /^http:\/\/(?:\d{1,3}\.){3}\d{1,3}:\d+\/mobile$/i.test(u)&&!u.includes('127.0.0.1');
  });
  if(!addresses.length)throw Error('لم يتم العثور على عنوان شبكة محلية صالح للكمبيوتر. تأكد من اتصال الواي فاي.');
  info.addresses=addresses;
  if(!Array.isArray(info.paired))info.paired=[];
  return info;
 }

 function stopTimerAndCleanModal(){
  if(countdownTimer){clearInterval(countdownTimer);countdownTimer=null;}
  const existing=document.getElementById('lanSyncModal');
  if(existing)existing.remove();
 }

 function button(){
  let b=document.getElementById('lanSyncButton');
  if(!b){
   const group=document.querySelector('header > div.flex.items-center.gap-2.flex-wrap');
   if(group){
    b=document.createElement('button');
    b.id='lanSyncButton';
    b.type='button';
    b.className='px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition';
    b.innerHTML='<i class="fa-solid fa-mobile-screen-button"></i><span>ربط الموبايل</span>';
    b.onclick=()=>window.openLanSyncModal?.();
    group.prepend(b);
   }
  }
  if(b)b.classList.toggle('hidden',Boolean(appState?.isLocked));
  const sb=document.getElementById('sidebarMobileSyncBtn');
  if(sb)sb.classList.toggle('hidden',Boolean(appState?.isLocked));
 }

 function modal(rawInfo){
  stopTimerAndCleanModal();
  let info=ensureValidLanInfo(rawInfo);
  const m=document.createElement('div');
  m.id='lanSyncModal';
  m.className='fixed inset-0 z-[40000] bg-slate-950/75 flex items-center justify-center p-4';
  const urls=(info.addresses||[]).map(x=>`<div class="flex items-center justify-between gap-2 rounded-xl bg-slate-900 border border-slate-700 px-3 py-2"><a href="${esc(x.url)}" target="_blank" rel="noopener" class="font-mono text-xs sm:text-sm text-cyan-300 hover:underline break-all" dir="ltr">${esc(x.url)}</a><button type="button" data-copy-url="${esc(x.url)}" class="shrink-0 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 px-2.5 py-1 text-xs font-bold text-slate-200">نسخ الرابط</button></div>`).join('');
  const phones=(info.paired||[]).map(d=>`<li class="flex justify-between gap-3 border-b border-slate-700 py-2"><span>${esc(d.name)}</span><small class="text-slate-400">${esc(d.pairedAt||'')}</small></li>`).join('')||'<li class="text-slate-400">لا توجد هواتف مرتبطة حتى الآن</li>';
  m.innerHTML=`<section dir="rtl" class="w-full max-w-xl max-h-[92vh] overflow-auto rounded-2xl border border-slate-600 bg-slate-800 p-5 text-white shadow-2xl"><header class="flex items-center justify-between border-b border-slate-600 pb-3"><div class="flex items-center gap-2"><span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span><h2 class="font-black text-lg">ربط الهاتف — عرض ومساحة عمل</h2></div><button type="button" data-close class="rounded-lg border border-slate-600 px-3 py-1 hover:bg-slate-700">إغلاق</button></header><div class="mt-4 space-y-3"><p class="text-sm text-slate-200">في تطبيق Android أدخل عنوان الكمبيوتر الظاهر أدناه ورمز الربط، والهاتف والكمبيوتر على نفس الشبكة. التطبيق يعرض الأقسام المالية والمخزنية ويتحدث تلقائياً أثناء فتحه. المتصفح القديم يظل مخصصاً للعملاء والفواتير.</p><div class="space-y-2">${urls}</div><div class="rounded-xl border border-amber-500/40 bg-amber-900/20 p-3.5"><div class="flex items-center justify-between text-xs text-amber-200"><span>رمز ربط مؤقت صالح لمدة 10 دقائق</span><span id="lanPairTimer160" class="font-mono font-bold text-emerald-300">10:00</span></div><div id="lanPairCodeDisplay160" class="my-2 text-center font-mono text-3xl font-black tracking-[.28em] text-amber-300 select-all">${esc(info.pairCode)}</div><div class="flex items-center justify-between gap-2 mt-2"><p class="text-xs text-slate-300">لا تشارك الرمز مع أي شخص. يتجدد الرمز تلقائياً عند انتهاء الوقت.</p><button type="button" id="lanCopyCode160" class="shrink-0 rounded-lg border border-amber-400/50 bg-amber-500/20 hover:bg-amber-500/30 px-2.5 py-1 text-xs font-bold text-amber-200">نسخ الرمز</button></div></div><div><h3 class="font-bold">الهواتف المرتبطة</h3><ul class="mt-1 max-h-28 overflow-auto text-sm">${phones}</ul></div><div class="rounded-lg bg-slate-900 p-3 text-xs leading-6 text-slate-300">التطبيق المرتبط يستطيع عرض الموردين والمشتريات والمخزون والخزينة والعملاء والفواتير، دون حسابات المستخدمين أو PIN أو ملفات النسخ الاحتياطي. لا تشارك الرمز إلا مع من تسمح له برؤية هذه البيانات. المتصفح القديم وملف HTML المستقل يظلان محدودين ببيانات العملاء والفواتير. الاتصال عبر HTTP بدون HTTPS؛ استخدم شبكة خاصة وموثوقة فقط ولا تفتح منفذ الربط المحلي 47821 على الإنترنت.</div><div class="flex flex-wrap justify-between gap-2 border-t border-slate-600 pt-3"><button type="button" id="lanRefresh" class="rounded-lg border border-slate-500 hover:bg-slate-700 px-3 py-2 text-xs font-bold">تجديد الرمز</button><button type="button" id="lanRevoke" class="rounded-lg border border-rose-500 hover:bg-rose-950/50 px-3 py-2 text-xs font-bold text-rose-200">إلغاء ربط كل الهواتف</button><button type="button" id="lanStop" class="rounded-lg bg-slate-600 hover:bg-slate-500 px-3 py-2 text-xs font-bold">إيقاف الربط المحلي</button></div></div></section>`;
  document.body.append(m);
  const secure=info.secure660;if(secure?.running){const box=document.createElement('section');box.className='rounded-xl border border-cyan-500 p-3 space-y-2';const title=document.createElement('h3');title.textContent='الربط المحلي المشفر — تسجيل من Android';box.append(title);for(const [label,value]of [['العنوان',secure.addresses?.[0]||''],['بصمة الكمبيوتر SHA-256',secure.fingerprint],['رمز ربط HTTPS جديد (للهاتف الجديد فقط)',secure.pairCode]]){const row=document.createElement('p'),code=document.createElement('code');row.textContent=label+': ';code.textContent=value||'—';code.dir='ltr';code.style.cssText='display:block;overflow-wrap:anywhere;user-select:all';row.append(code);box.append(row);}const note=document.createElement('p');note.textContent='الهاتف المرتبط محليًا يمكنه اعتماد البصمة مرة واحدة دون تغيير الربط. التسجيل يحتاج PIN المستخدم ونفس صلاحيات الكمبيوتر. الربط الحالي ونسخة العرض مستمران.';box.append(note);m.querySelector('section>div')?.prepend(box);}

  if(window.api?.pairScope650){const scope=document.createElement('label');scope.className='block rounded-xl border border-cyan-500/50 p-3 text-sm';scope.textContent='الصلاحية التي تمنحها للرمز الجديد: ';const select=document.createElement('select');select.className='bg-slate-800 border rounded p-2';for(const [v,label]of [['clients-only','عملاء وفواتير — المتصفح'],['viewer-full','كل الأقسام — تطبيق Android وحساب المستخدم']]){const o=document.createElement('option');o.value=v;o.textContent=label;select.append(o);}select.value=info.pairScope650||'clients-only';select.onchange=()=>{try{window.api.pairScope650(select.value);showToast('تم تحديد نطاق الرمز الجديد من الكمبيوتر','success');}catch(e){showToast(e.message,'danger');}};scope.append(select);m.querySelector('section>div')?.prepend(scope);}
  // Remove any auto-injected window-tools150 bar so there is no duplicate header or close button
  setTimeout(()=>{if(typeof window.ensureFloatingWindowButtons162==='function')window.ensureFloatingWindowButtons162(m);},0);

  const close=()=>stopTimerAndCleanModal();
  m.querySelectorAll('[data-close]').forEach(b=>b.onclick=close);
  m.addEventListener('click',e=>{if(e.target===m)close();});
  // If Layout150 or closeModal ever hides m via .hidden class, immediately clean up timer and remove m
  new MutationObserver(()=>{if(m.classList.contains('hidden'))stopTimerAndCleanModal();}).observe(m,{attributes:true,attributeFilter:['class']});

  m.querySelectorAll('[data-copy-url]').forEach(btn=>{btn.onclick=async()=>{try{await navigator.clipboard.writeText(btn.dataset.copyUrl);showToast('تم نسخ رابط الموبايل إلى الحافظة','success');}catch{}};});
  const copyCodeBtn=m.querySelector('#lanCopyCode160');
  if(copyCodeBtn)copyCodeBtn.onclick=async()=>{try{await navigator.clipboard.writeText(info.pairCode);showToast('تم نسخ رمز الربط: '+info.pairCode,'success');}catch{}};
  const timerEl=m.querySelector('#lanPairTimer160');
  const codeEl=m.querySelector('#lanPairCodeDisplay160');
  let refreshing=false;
  const tick=async()=>{
   if(!document.body.contains(m)||m.classList.contains('hidden')||!m.getClientRects().length){stopTimerAndCleanModal();return;}
   let rem=Math.max(0,Math.ceil((info.pairExpiresAt-Date.now())/1000));
   if(rem<=0&&!refreshing){
    refreshing=true;
    try{const fresh=ensureValidLanInfo(await window.api.startLan());info.pairCode=fresh.pairCode;info.pairExpiresAt=fresh.pairExpiresAt;if(codeEl)codeEl.textContent=info.pairCode;rem=Math.max(0,Math.ceil((info.pairExpiresAt-Date.now())/1000));}
    catch(e){if(codeEl)codeEl.textContent='انتهت صلاحية الرمز — اضغط تجديد';}
    finally{refreshing=false;}
   }
   const mm=String(Math.floor(rem/60)).padStart(2,'0'),ss=String(rem%60).padStart(2,'0');
   if(timerEl)timerEl.textContent=`متبقي ${mm}:${ss}`;
  };
  tick();
  countdownTimer=setInterval(tick,1000);
  m.querySelector('#lanRefresh').onclick=()=>open(true);
  m.querySelector('#lanRevoke').onclick=async()=>{if(!confirm('سيتم قطع اتصال كل الهواتف. هل تريد المتابعة؟'))return;try{localStorage.removeItem('alhamd_lan_devices_160');await window.api?.revokeLanDevices?.();open(true);showToast('تم إلغاء ربط جميع الهواتف وتوليد رمز جديد','success');}catch(e){showToast(e.message||'تعذر إلغاء الربط','danger');}};
  m.querySelector('#lanStop').onclick=async()=>{try{localStorage.removeItem('alhamd_lan_pair_160');await window.api?.stopLan?.();close();showToast('تم إيقاف ربط الموبايل','success');}catch(e){showToast(e.message||'تعذر إيقاف الربط','danger');}};
 }
 async function open(forceRotate=false){
  if(window.Pairing701UI?.open)return window.Pairing701UI.open();
  try{
   if(!window.api?.startLan)throw Error('هذه الميزة متاحة في تطبيق ويندوز فقط.');
   const raw=await window.api.startLan();
   modal(raw);
  }catch(e){if(typeof showToast==='function')showToast(e.message||'تعذر تشغيل خدمة ربط الهاتف','danger');else alert(e.message||'تعذر تشغيل خدمة ربط الهاتف');}
 }
 window.openLanSyncSettings=open;
 window.openLanSyncModal=open;
 window.closeLanSyncModal=stopTimerAndCleanModal;
 window.getAlhamdLanIpUrl=getLanIpUrl;
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',button,{once:true});else button();
 const oldUpdate=window.updateAllUI;if(typeof oldUpdate==='function'&&!oldUpdate._lanButton){const wrapped=function(...args){const result=oldUpdate.apply(this,args);button();return result;};wrapped._lanButton=true;window.updateAllUI=wrapped;}
 setInterval(button,1500);
})();
