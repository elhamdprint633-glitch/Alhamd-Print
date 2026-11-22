/* 1.3.10 reliability pass: native invoice select, working calendar/panels, and service catalog refresh. */
(function(){
 'use strict';
 const $=id=>document.getElementById(id),esc=s=>escapeHtml(String(s??''));
 const clearLineLink=row=>{delete row.dataset.itemId;delete row.dataset.serviceCatalogId;delete row.dataset.selectedName;};

 // Build real native select options. This intentionally matches the customer
 // selector's dimensions, border, radius, focus ring, and native arrow.
 window.refreshInvoiceItemPickers=function(){
  const stock=appState.items||[],services=appState.serviceCatalog||[];
  // A stable signature prevents an identical option list from causing a DOM
  // mutation. Reassigning innerHTML on each table refresh fed the old subtree
  // observer and could lock the renderer in a MutationObserver loop.
  const signature=JSON.stringify([stock.map(x=>[x.id,x.name,x.code,x.qty,x.unit,x.sellPrice]),services.map(x=>[x.id,x.name,x.unit,x.price])]);
  document.querySelectorAll('#saleLines .sl-picker').forEach(sel=>{
   if(sel.dataset.optionsSignature===signature)return;
   const keep=sel.value;let html='<option value="">-- اختر الصنف / الخدمة --</option>';
   if(stock.length)html+='<optgroup label="الأصناف المخزنية">'+stock.map(x=>`<option value="stock:${esc(x.id)}">${esc(x.name)}${x.code?' — '+esc(x.code):''} (${esc(x.qty)} ${esc(x.unit||'')})</option>`).join('')+'</optgroup>';
   if(services.length)html+='<optgroup label="الخدمات">'+services.map(x=>`<option value="service:${esc(x.id)}">${esc(x.name)} — ${esc(x.unit||'خدمة')} — ${escapeHtml(formatCurrency(x.price||0))}</option>`).join('')+'</optgroup>';
   html='<option value="__manual__">كتابة بيان يدوي</option>'+html;sel.innerHTML=html;sel.dataset.optionsSignature=signature;
   if([...sel.options].some(o=>o.value===keep))sel.value=keep;
  });
 };
 window.onInvoiceItemSelect=function(sel){
  const row=sel.closest('.sale-line'),desc=row?.querySelector('.sl-desc'),manual=row?.querySelector('.sl-desc-manual'),kind=row?.querySelector('.sl-kind'),price=row?.querySelector('.sl-price');if(!row||!desc||!manual||!kind)return;
  const wasAuto=row.dataset.autoPrice==='1';clearLineLink(row);desc.value='';manual.value='';manual.classList.add('hidden');
  if(sel.value==='__manual__'){kind.value='service';if(wasAuto&&price)price.value='';delete row.dataset.autoPrice;manual.classList.remove('hidden');manual.focus();calcSale();return;}
  if(!sel.value){kind.value='service';if(wasAuto&&price)price.value='';delete row.dataset.autoPrice;calcSale();return;}
  const [type,...rest]=sel.value.split(':'),id=rest.join(':'),record=type==='stock'?(appState.items||[]).find(x=>String(x.id)===id):(appState.serviceCatalog||[]).find(x=>String(x.id)===id);if(!record){sel.value='';return;}
  desc.value=record.name||'';kind.value=type==='stock'?'stock':'service';if(type==='stock'){row.dataset.itemId=record.id;row.dataset.selectedName=record.name||'';}else row.dataset.serviceCatalogId=record.id;
  const newPrice=type==='stock'?Number(record.sellPrice)||0:Number(record.price)||0;
  if(price&&(!price.value||wasAuto)&&newPrice>0){price.value=newPrice;row.dataset.autoPrice='1';}else if(!wasAuto)row.dataset.autoPrice='0';
  onSaleKind(kind);desc.value=record.name||'';if(type==='stock'){row.dataset.itemId=record.id;row.dataset.selectedName=record.name||'';}else row.dataset.serviceCatalogId=record.id;
  calcSale();
 };
 window.onInvoiceManualDesc=function(input){const row=input.closest('.sale-line'),desc=row?.querySelector('.sl-desc'),kind=row?.querySelector('.sl-kind');if(!row||!desc||!kind)return;clearLineLink(row);kind.value='service';desc.value=input.value;row.dataset.autoPrice='0';calcSale();};
 const populateBefore=window.populateDropdowns;
 if(populateBefore)window.populateDropdowns=function(...args){const r=populateBefore.apply(this,args);window.refreshInvoiceItemPickers();return r;};

 // Ensure saved and edited invoices restore the exact chosen stock/service row.
 function syncInvoicePickers(){document.querySelectorAll('#saleLines .sale-line').forEach(row=>{const sel=row.querySelector('.sl-picker'),desc=row.querySelector('.sl-desc'),manual=row.querySelector('.sl-desc-manual');if(!sel||!desc||!manual)return;if(row.dataset.itemId&&appState.items.some(x=>String(x.id)===String(row.dataset.itemId))){sel.value='stock:'+row.dataset.itemId;manual.classList.add('hidden');}else if(row.dataset.serviceCatalogId&&(appState.serviceCatalog||[]).some(x=>String(x.id)===String(row.dataset.serviceCatalogId))){sel.value='service:'+row.dataset.serviceCatalogId;manual.classList.add('hidden');}else if(desc.value){sel.value='__manual__';manual.value=desc.value;manual.classList.remove('hidden');}});}
 const editBefore=window.editSale;if(editBefore)window.editSale=function(...args){const r=editBefore.apply(this,args);requestAnimationFrame(syncInvoicePickers);return r;};
 const loadDocBefore=window.loadDocToComposer;if(loadDocBefore)window.loadDocToComposer=function(...args){const r=loadDocBefore.apply(this,args);requestAnimationFrame(syncInvoicePickers);return r;};

 // Rebuild catalog controls after a save, clear any stale table filters, and
 // always return to the editable service price list.
 function revealServiceCatalog(){
  const view=$('view-services');if(view&&!view.classList.contains('hidden'))window.showServiceSection?.('catalog');
  const tv=ss().tableViews||(ss().tableViews={});tv.serviceCatalogTableBody={rules:[],sort:'',dir:'asc'};
  if(window.PAGE_STATE?.serviceCatalogTableBody){PAGE_STATE.serviceCatalogTableBody.page=0;PAGE_STATE.serviceCatalogTableBody.all=[];}
  window.renderServiceCatalogTable?.();window.renderServicesTable?.();window.populateDropdowns?.();
 }
 const catalogOpenBefore=window.openServiceCatalogModal;
 if(catalogOpenBefore)window.openServiceCatalogModal=function(...args){const r=catalogOpenBefore.apply(this,args);const form=$('serviceCatalogForm');if(form&&!form.dataset.refresh139){form.dataset.refresh139='1';form.addEventListener('submit',()=>setTimeout(revealServiceCatalog,80),true);}return r;};
 const showSvcBefore=window.showServiceSection;
 if(showSvcBefore)window.showServiceSection=function(which='catalog'){const r=showSvcBefore.call(this,which);if(which==='catalog')window.renderServiceCatalogTable?.();return r;};

 // One obvious button opens a live preview and size controls for each image.
 window.openImageFitSettings=function(target){
  const map={bg:{title:'خلفية البرنامج',img:uiCfg().bgImage,fit:'bgFit',zoom:'bgZoom',initial:uiCfg().bgZoom||100},lock:{title:'خلفية شاشة الدخول',img:uiCfg().lockImage,fit:'lockFit',zoom:'lockZoom',initial:uiCfg().lockZoom||100},logo:{title:'شعار المطبعة',img:ss().logo,fit:'logoFrameFit',zoom:'logoFrameScale',initial:uiCfg().logoFrameScale||100}}[target];if(!map?.img)return showToast('اختَر صورة أولاً ثم اضبط حجمها.','info');
  $('imageFitModal139')?.remove();const modal=document.createElement('div');modal.id='imageFitModal139';modal.className='fixed inset-0 z-[30040] bg-black/60 flex items-center justify-center p-4';const logo=target==='logo',min=logo?40:40,max=logo?160:220,fit=uiCfg()[map.fit]||'contain';
  modal.innerHTML=`<section dir="rtl" class="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-800 dark:text-slate-100 p-5 shadow-2xl"><header class="flex justify-between items-center border-b pb-3"><h3 class="font-black">ضبط حجم ${esc(map.title)} داخل الإطار</h3><button type="button" data-close class="px-3 py-1 rounded-lg border">إغلاق</button></header><div class="my-4 h-44 rounded-xl border-2 border-dashed border-slate-300 bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden" id="fitPreview139">${logo?`<img src="${esc(map.img)}" class="max-w-full max-h-full object-contain" id="fitPreviewImg139">`:''}</div><label class="block text-sm font-bold mb-3">تكبير / تصغير: <output id="fitOutput139" class="text-teal-700">${map.initial}%</output><input id="fitRange139" type="range" min="${min}" max="${max}" step="5" value="${map.initial}" class="w-full mt-2 accent-teal-600"></label>${!logo?`<label class="block text-sm font-bold">طريقة الملاءمة<select id="fitMode139" class="w-full mt-2 p-2.5 border rounded-xl bg-white dark:bg-slate-700"><option value="cover" ${fit==='cover'?'selected':''}>ملء الإطار</option><option value="contain" ${fit==='contain'?'selected':''}>احتواء الصورة</option><option value="repeat" ${fit==='repeat'?'selected':''}>تكرار الصورة</option></select></label>`:`<label class="block text-sm font-bold">طريقة الملاءمة<select id="fitMode139" class="w-full mt-2 p-2.5 border rounded-xl bg-white dark:bg-slate-700"><option value="contain" ${fit==='contain'?'selected':''}>احتواء كامل</option><option value="cover" ${fit==='cover'?'selected':''}>ملء الإطار وقص الزائد</option></select></label>`}<div class="flex justify-end gap-2 mt-5"><button type="button" data-close class="px-4 py-2 border rounded-xl">تم</button></div></section>`;
  document.body.append(modal);const preview=$('fitPreview139'),range=$('fitRange139'),out=$('fitOutput139'),mode=$('fitMode139');if(!logo){preview.style.backgroundImage=`url("${esc(map.img)}")`;preview.style.backgroundRepeat=mode.value==='repeat'?'repeat':'no-repeat';preview.style.backgroundPosition='center';}function update(){const n=Number(range.value);out.textContent=n+'%';if(logo){const im=$('fitPreviewImg139');im.style.width=n+'%';im.style.height=n+'%';im.style.maxWidth='none';im.style.maxHeight='none';im.style.objectFit=mode.value;}else{preview.style.backgroundSize=mode.value==='cover'&&n===100?'cover':`${n}% auto`;preview.style.backgroundRepeat=mode.value==='repeat'?'repeat':'no-repeat';}uiSet(map.zoom,n,false);uiSet(map.fit,mode.value,false);}
  range.oninput=update;mode.onchange=update;modal.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>modal.remove());modal.addEventListener('click',e=>{if(e.target===modal)modal.remove();});update();
 };

 // A standalone, rendered calendar avoids the empty popover failure and does
 // not depend on the clock's one-second DOM refresh or on parent overflow.
 let calMode='gregory',calCursor=new Date(),calSelected=new Date();
 const parts=(date,mode)=>{const locale=mode==='hijri'?'en-u-ca-islamic-umalqura-nu-latn':'en-CA-u-ca-gregory-nu-latn',o={};new Intl.DateTimeFormat(locale,{day:'numeric',month:'numeric',year:'numeric'}).formatToParts(date).forEach(x=>{if(['day','month','year'].includes(x.type))o[x.type]=Number(x.value);});return o;};
 const key=(date,mode)=>{const p=parts(date,mode);return p.year+'-'+p.month;};
 function monthStart(date,mode){if(mode==='gregory')return new Date(date.getFullYear(),date.getMonth(),1);const d=new Date(date);for(let i=0;i<31;i++){const prev=new Date(d);prev.setDate(prev.getDate()-1);if(key(prev,mode)!==key(d,mode))break;d.setDate(d.getDate()-1);}return d;}
 const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 function drawCalendar(){const p=$('miniCalendarPanel139');if(!p)return;const start=monthStart(calCursor,calMode),monthKey=key(start,calMode),head=new Intl.DateTimeFormat('ar-EG',{month:'long',year:'numeric',calendar:calMode==='hijri'?'islamic-umalqura':'gregory'}).format(start),week=Array.from({length:7},(_,i)=>new Intl.DateTimeFormat('ar-EG',{weekday:'short'}).format(new Date(2024,0,7+i)));let days='';for(let i=0;i<start.getDay();i++)days+='<span class="cal139-blank"></span>';const d=new Date(start);for(let i=0;i<42&&key(d,calMode)===monthKey;i++){const selected=iso(d)===iso(calSelected),today=iso(d)===iso(new Date()),num=parts(d,calMode).day;days+=`<button type="button" data-cal139-day="${iso(d)}" class="cal139-day ${today?'today':''} ${selected?'selected':''}">${num}</button>`;d.setDate(d.getDate()+1);}const selectedText=new Intl.DateTimeFormat('ar-EG',{dateStyle:'full',calendar:calMode==='hijri'?'islamic-umalqura':'gregory'}).format(calSelected);p.innerHTML=`<div class="cal139-head"><button type="button" data-cal139-step="-1" aria-label="الشهر السابق">›</button><b>${esc(head)}</b><button type="button" data-cal139-step="1" aria-label="الشهر التالي">‹</button></div><div class="cal139-modes"><button type="button" data-cal139-mode="gregory" class="${calMode==='gregory'?'active':''}">ميلادي</button><button type="button" data-cal139-mode="hijri" class="${calMode==='hijri'?'active':''}">هجري</button></div><div class="cal139-week">${week.map(x=>`<span>${esc(x)}</span>`).join('')}</div><div class="cal139-grid">${days}</div><div class="cal139-foot">${esc(selectedText)}</div>`;}
 function placeCalendar(){const p=$('miniCalendarPanel139'),b=document.querySelector('.clock-calendar-trigger');if(!p||!b)return;const r=b.getBoundingClientRect(),w=300,h=p.offsetHeight||360;p.style.left=Math.max(8,Math.min(innerWidth-w-8,r.right-w))+'px';p.style.top=Math.max(8,Math.min(innerHeight-h-8,r.bottom+6))+'px';}
 function toggleCalendar(){let p=$('miniCalendarPanel139');if(p){p.remove();return;}document.getElementById('miniCalendarPanel')?.remove();calMode=dtCfg().cal==='hijri'?'hijri':'gregory';calCursor=new Date();calSelected=new Date();p=document.createElement('div');p.id='miniCalendarPanel139';p.className='mini-calendar-139';document.body.append(p);drawCalendar();placeCalendar();}

 // The overview and column controls are handled at capture phase so the
 // click cannot be swallowed by the header's outside-click closers.
 function dock(id,trigger){const p=$(id),b=$(trigger);if(!p||!b)return;document.body.append(p);p.style.position='fixed';p.style.zIndex='30020';const r=b.getBoundingClientRect(),w=p.offsetWidth||300,h=p.offsetHeight||260;p.style.top=Math.max(8,Math.min(innerHeight-h-8,r.bottom+6))+'px';p.style.left=Math.max(8,Math.min(innerWidth-w-8,r.left))+'px';p.style.right='auto';if(!p.dataset.stopBubble){p.addEventListener('click',e=>e.stopPropagation());p.addEventListener('mousedown',e=>e.stopPropagation());p.dataset.stopBubble='1';}}
 function openCols(){const p=$('colsPanel');if(!p)return;if(!p.classList.contains('hidden')){p.classList.add('hidden');return;}const tables=activeTabTables();if(!tables.length){showToast('لا يوجد جدول في الصفحة الحالية لتعديل أعمدته','info');return;}renderColsPanel(tKey(tables[0]));p.classList.remove('hidden');dock('colsPanel','btnColsGear');}
 function openPrivacy(){const p=$('privPanel');if(!p)return;if(!p.classList.contains('hidden')){p.classList.add('hidden');return;}$('colsPanel')?.classList.add('hidden');renderPrivPanel();p.classList.remove('hidden');dock('privPanel','btnPrivList');}
 function outsideClose(e){if(!e.target.closest('#colsPanel')&&!e.target.closest('#btnColsGear'))$('colsPanel')?.classList.add('hidden');if(!e.target.closest('#privPanel')&&!e.target.closest('#btnPrivList'))$('privPanel')?.classList.add('hidden');if(!e.target.closest('#miniCalendarPanel139')&&!e.target.closest('.clock-calendar-trigger'))$('miniCalendarPanel139')?.remove();}

 // Insert the calculator action beneath its calculator section, not inside a
 // potentially collapsed result card.
 window.addDigitalPrintToInvoice139=function(){
  if(!can('inv_create'))return permDeny();const w=Number($('dcWidth')?.value),h=Number($('dcHeight')?.value),qty=Math.floor(Number($('dcQty')?.value)),price=Number($('dcQuarterPrice')?.value),gap=Number($('dcGap')?.value||0),finish=Number($('dcFinish')?.value||0),setup=Number($('dcSetup')?.value||0);if(!(w>0&&h>0&&qty>0&&price>0))return showToast('أدخل المقاس والكمية وسعر الربع أولاً.','warning');let best=0;for(const [sw,sh] of [[32,48],[48,32]])for(const [rw,rh] of [[w,h],[h,w]]){const across=Math.floor((sw+gap+1e-9)/(rw+gap));if(across<1)continue;const acrossOther=Math.floor((sw+gap+1e-9)/(rh+gap)),maxRows=Math.floor((sh+gap+1e-9)/(rh+gap));for(let rows=0;rows<=maxRows;rows++){const remaining=sh+gap-rows*(rh+gap),other=Math.max(0,Math.floor((remaining+1e-9)/(rw+gap)));best=Math.max(best,rows*across+other*acrossOther);}}if(!best)return showToast('المقاس أكبر من مساحة الربع حتى بعد تدويره.','warning');const unit=(Math.ceil(qty/best)*price+qty*finish+setup)/qty;newSale();setTimeout(()=>{const row=$('saleLines')?.querySelector('.sale-line')||addSaleLine(false),sel=row.querySelector('.sl-picker'),manual=row.querySelector('.sl-desc-manual'),d=row.querySelector('.sl-desc'),k=row.querySelector('.sl-kind');clearLineLink(row);sel.value='__manual__';manual.classList.remove('hidden');manual.value=`طباعة ديجيتال ${w} × ${h} سم`;d.value=manual.value;k.value='service';row.querySelector('.sl-qty').value=qty;row.querySelector('.sl-price').value=unit.toFixed(2);row.dataset.autoPrice='0';calcSale();showToast('تم إدراج نتيجة الحاسبة في فاتورة جديدة.','success');},80);
 };
 function addDigitalButton(){const view=$('view-digitalcalc');if(!view||$('dcAddInvoiceBtn139'))return;const b=document.createElement('button');b.type='button';b.id='dcAddInvoiceBtn139';b.className='w-full my-3 rounded-xl py-3 bg-teal-600 hover:bg-teal-700 text-white font-black shadow';b.innerHTML='<i class="fa-solid fa-file-circle-plus ml-2"></i>إدراج في فاتورة جديدة';b.onclick=window.addDigitalPrintToInvoice139;view.insertBefore(b,$('bannerCalculator')||null);}

 function install(){
  window.toggleColsPanel=openCols;window.togglePrivPanel=openPrivacy;window.toggleMiniCalendar=function(e){e?.preventDefault?.();e?.stopPropagation?.();toggleCalendar();};
  document.addEventListener('click',e=>{
   const trigger=e.target.closest('.clock-calendar-trigger');if(trigger){e.preventDefault();e.stopImmediatePropagation();return;}
   const cols=e.target.closest('#btnColsGear');if(cols){e.preventDefault();e.stopImmediatePropagation();openCols();return;}
   const priv=e.target.closest('#btnPrivList');if(priv){e.preventDefault();e.stopImmediatePropagation();openPrivacy();return;}
   const cost=e.target.closest('.btnCostToggle');if(cost){e.preventDefault();e.stopImmediatePropagation();window.toggleCosts?.();return;}
   if(e.target.closest('[data-cal139-mode]')){const m=e.target.closest('[data-cal139-mode]').dataset.cal139Mode;calMode=m;dtSet('cal',m==='hijri'?'hijri':'gregory');drawCalendar();placeCalendar();return;}
   if(e.target.closest('[data-cal139-step]')){const dir=Number(e.target.closest('[data-cal139-step]').dataset.cal139Step);let d=new Date(calCursor);if(calMode==='gregory')d.setMonth(d.getMonth()+dir);else{const oldKey=key(d,calMode),step=dir<0?-1:1;for(let i=0;i<35&&key(d,calMode)===oldKey;i++)d.setDate(d.getDate()+step);}calCursor=monthStart(d,calMode);drawCalendar();placeCalendar();return;}
   if(e.target.closest('[data-cal139-day]')){const [y,m,d]=e.target.closest('[data-cal139-day]').dataset.cal139Day.split('-').map(Number);calSelected=new Date(y,m-1,d);drawCalendar();placeCalendar();return;}
   outsideClose(e);
  },true);
  window.addEventListener('resize',placeCalendar);window.addEventListener('scroll',placeCalendar,true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('miniCalendarPanel139')?.remove();$('colsPanel')?.classList.add('hidden');$('privPanel')?.classList.add('hidden');}});
  if(!$('reliability139Style')){const s=document.createElement('style');s.id='reliability139Style';s.textContent=`.sl-picker{appearance:auto!important;background-color:#fff!important;color:#0f172a!important;min-height:42px}.dark .sl-picker{background-color:#0f172a!important;color:#e2e8f0!important;border-color:#475569!important}.mini-calendar-139{position:fixed;z-index:30030;width:300px;max-width:calc(100vw - 16px);padding:12px;border:1px solid #cbd5e1;border-radius:16px;background:#fff;color:#0f172a;box-shadow:0 18px 48px #0f172a40;direction:rtl}.dark .mini-calendar-139{background:#172337;color:#e2e8f0;border-color:#475569}.cal139-head,.cal139-modes{display:flex;align-items:center;justify-content:space-between;gap:8px}.cal139-head{margin-bottom:10px}.cal139-head button{width:34px;height:32px;border:1px solid #dbe4ee;border-radius:9px;background:#f8fafc;font-size:18px}.cal139-modes{padding:3px;background:#f1f5f9;border-radius:10px;margin-bottom:9px}.dark .cal139-modes{background:#0f172a}.cal139-modes button{flex:1;padding:7px;border-radius:8px;font-size:11px;font-weight:800;color:#64748b}.cal139-modes button.active{background:#0d9488;color:#fff}.cal139-week,.cal139-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:3px;text-align:center}.cal139-week{font-size:10px;font-weight:700;color:#64748b;margin-bottom:4px}.cal139-week span{padding:5px 0}.cal139-day{height:34px;border-radius:9px;font-size:11px}.cal139-day:hover{background:#ccfbf1;color:#0f766e}.cal139-day.today{border:1px solid #0d9488;font-weight:900}.cal139-day.selected{background:#0d9488!important;color:#fff!important}.cal139-blank{height:34px}.cal139-foot{margin-top:9px;padding-top:7px;border-top:1px solid #e2e8f0;color:#64748b;font-size:10px}#colsPanel,#privPanel{max-height:calc(100vh - 20px);overflow:auto}`;document.head.append(s);}
  document.querySelectorAll('#saleLines .sl-picker').forEach(x=>x.classList.add('sl-picker'));
  window.refreshInvoiceItemPickers();$('dcAddInvoiceBtn')?.remove();addDigitalButton();
  const active=$('view-services');if(active&&!active.classList.contains('hidden'))revealServiceCatalog();
  const oldSwitch=window.switchTab;if(oldSwitch&&!oldSwitch._serviceCatalog139){const f=function(id,...a){const r=oldSwitch.call(this,id,...a);if(id==='services'){requestAnimationFrame(()=>{window.showServiceSection?.('catalog');window.renderServiceCatalogTable?.();window.renderServicesTable?.();});}return r;};f._serviceCatalog139=true;window.switchTab=f;}
  const modalOpen=window.openServiceCatalogModal;if(modalOpen&&!modalOpen._catalog139){const f=function(...a){const r=modalOpen.apply(this,a);const form=$('serviceCatalogForm');if(form&&!form.dataset.forceVisible139){form.dataset.forceVisible139='1';form.addEventListener('submit',()=>setTimeout(revealServiceCatalog,100),true);}return r;};f._catalog139=true;window.openServiceCatalogModal=f;}
  const lines=$('saleLines');if(lines)new MutationObserver(()=>window.refreshInvoiceItemPickers()).observe(lines,{childList:true});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
