/* 1.3.8: reliable invoice chooser, privacy panels, calendar, and image framing. */
(function(){
 'use strict';
 const $=id=>document.getElementById(id);

 // Keep the two floating controls above scrolling containers and reliably
 // clickable; their old absolute position was clipped by several page shells.
 function dockPanel(id,buttonId){
  const panel=$(id),button=$(buttonId);if(!panel||!button)return;
  if(panel.parentElement!==document.body)document.body.appendChild(panel);
  panel.style.position='fixed';panel.style.zIndex='30000';panel.style.top='';panel.style.bottom='';
  const r=button.getBoundingClientRect(),w=panel.offsetWidth||300,h=panel.offsetHeight||260;
  panel.style.top=Math.max(8,Math.min(innerHeight-h-8,r.bottom+8))+'px';
  panel.style.left=Math.max(8,Math.min(innerWidth-w-8,r.left))+'px';panel.style.right='auto';
  if(!panel.dataset.stopClick){panel.addEventListener('click',e=>e.stopPropagation());panel.addEventListener('mousedown',e=>e.stopPropagation());panel.dataset.stopClick='1';}
 }
 const colsToggleBefore=window.toggleColsPanel;
 window.toggleColsPanel=function(ev){ev?.preventDefault?.();ev?.stopPropagation?.();const p=$('colsPanel');if(!p)return;if(!p.classList.contains('hidden')){p.classList.add('hidden');return;}const tables=activeTabTables();if(!tables.length){showToast('لا توجد جداول في هذه الصفحة لتخصيص أعمدتها','info');return;}renderColsPanel(tKey(tables[0]));p.classList.remove('hidden');dockPanel('colsPanel','btnColsGear');};
 const privToggleBefore=window.togglePrivPanel;
 window.togglePrivPanel=function(ev){ev?.preventDefault?.();ev?.stopPropagation?.();const p=$('privPanel');if(!p)return;if(!p.classList.contains('hidden')){p.classList.add('hidden');return;}$('colsPanel')?.classList.add('hidden');renderPrivPanel();p.classList.remove('hidden');dockPanel('privPanel','btnPrivList');};
 window.addEventListener('resize',()=>{if(!$('colsPanel')?.classList.contains('hidden'))dockPanel('colsPanel','btnColsGear');if(!$('privPanel')?.classList.contains('hidden'))dockPanel('privPanel','btnPrivList');});
 window.addEventListener('scroll',()=>{if(!$('colsPanel')?.classList.contains('hidden'))dockPanel('colsPanel','btnColsGear');if(!$('privPanel')?.classList.contains('hidden'))dockPanel('privPanel','btnPrivList');},true);

 // The clock date is rebuilt every second. A delegated handler survives that
 // rebuild and opens the same calendar control from its icon.
 function placeCalendar(){const p=$('miniCalendarPanel'),b=document.querySelector('.clock-calendar-trigger');if(!p||!b)return;document.body.appendChild(p);p.style.position='fixed';p.style.zIndex='30005';p.style.top='';p.style.right='';p.style.left='';const r=b.getBoundingClientRect(),w=p.offsetWidth||300,h=p.offsetHeight||340;p.style.top=Math.max(8,Math.min(innerHeight-h-8,r.bottom+6))+'px';p.style.left=Math.max(8,Math.min(innerWidth-w-8,r.right-w))+'px';}
 const toggleCalendarBefore=window.toggleMiniCalendar;
 if(toggleCalendarBefore)window.toggleMiniCalendar=function(ev){toggleCalendarBefore(ev);requestAnimationFrame(placeCalendar);};
 document.addEventListener('click',e=>{const b=e.target.closest('.clock-calendar-trigger');if(b){e.preventDefault();window.toggleMiniCalendar?.(e);return;}const p=$('miniCalendarPanel');if(p&&!p.contains(e.target))p.remove();},true);
 window.addEventListener('resize',placeCalendar);window.addEventListener('scroll',placeCalendar,true);

 // Reposition the invoice product list relative to the actual input on every
 // open, including when the arrow is used instead of typing.
 window.toggleInvoiceItemList=window.toggleInvoiceItemList||function(btn){const input=btn?.closest('.sl-desc-wrap')?.querySelector('.sl-desc');if(!input)return;input.focus();};

 // Allow free-typed service units while retaining convenient common values.
 // The HTML template is updated in 1.3.8; this guard preserves old settings.
 document.addEventListener('input',e=>{if(e.target.matches('.sl-desc')){const input=e.target;input.setAttribute('aria-expanded',String(!$('saleSuggestionPopup136')?.classList.contains('hidden')));}},true);

 window.addDigitalPrintToInvoice=function(){
  if(!can('inv_create'))return permDeny();
  const w=Number($('dcWidth')?.value),h=Number($('dcHeight')?.value),qty=Math.floor(Number($('dcQty')?.value)),price=Number($('dcQuarterPrice')?.value),gap=Number($('dcGap')?.value||0),finish=Number($('dcFinish')?.value||0),setup=Number($('dcSetup')?.value||0);
  if(!(w>0&&h>0&&qty>0&&price>0&&gap>=0&&finish>=0&&setup>=0))return showToast('أدخل المقاس والكمية وسعر الربع أولاً حتى يمكن إدراج الحساب.','warning');
  const fit=(a,b)=>Math.floor((32+gap+1e-9)/(a+gap))*Math.floor((48+gap+1e-9)/(b+gap)),per=Math.max(fit(w,h),fit(h,w));if(!per)return showToast('المقاس أكبر من مساحة الربع حتى بعد تدويره.','warning');const total=Math.ceil(qty/per)*price+qty*finish+setup;
  newSale();setTimeout(()=>{const row=$('saleLines')?.querySelector('.sale-line')||addSaleLine(false),d=row.querySelector('.sl-desc'),k=row.querySelector('.sl-kind');d.value=`طباعة ديجيتال ${w} × ${h} سم`;k.value='service';delete row.dataset.itemId;delete row.dataset.serviceCatalogId;delete row.dataset.selectedName;onSaleKind(k);d.value=`طباعة ديجيتال ${w} × ${h} سم`;row.querySelector('.sl-qty').value=qty;row.querySelector('.sl-price').value=(total/qty).toFixed(2);row.dataset.autoPrice='0';calcSale();showToast('تم إدراج نتيجة حاسبة الديجيتال في فاتورة جديدة.','success');},60);
 };
 function addDigitalButton(){const view=$('view-digitalcalc');if(!view||$('dcAddInvoiceBtn'))return;const anchor=$('dcMessage')?.parentElement||view;const button=document.createElement('button');button.type='button';button.id='dcAddInvoiceBtn';button.className='w-full mt-3 rounded-xl py-3 bg-teal-600 hover:bg-teal-700 text-white font-black shadow';button.innerHTML='<i class="fa-solid fa-file-circle-plus ml-2"></i>إضافة النتيجة إلى فاتورة جديدة';button.onclick=window.addDigitalPrintToInvoice;anchor.append(button);}

 function refreshLogoFrame(){const box=$('logoPreviewBox');if(!box)return;const u=uiCfg(),img=box.querySelector('img');box.style.borderRadius=u.logoShape==='round'?'50%':'.75rem';if(!img)return;img.style.width=(Number(u.logoFrameScale)||100)+'%';img.style.height=(Number(u.logoFrameScale)||100)+'%';img.style.maxWidth='none';img.style.maxHeight='none';img.style.objectFit=u.logoFrameFit==='cover'?'cover':'contain';img.style.transition='width .12s ease,height .12s ease,object-fit .12s ease';}
 const renderLogoBefore=window.renderLogoCard;
 window.renderLogoCard=function(...args){const r=renderLogoBefore?.apply(this,args);refreshLogoFrame();return r;};
 const renderBgBefore=window.renderBgPanel;
 window.renderBgPanel=function(...args){const r=renderBgBefore?.apply(this,args);return r;};
 const applyUiBefore=window.applyUi;
 window.applyUi=function(...args){const r=applyUiBefore?.apply(this,args);refreshLogoFrame();return r;};
 const shopRefreshBefore=window.applyShopBrandingAndLogo;
 if(shopRefreshBefore)window.applyShopBrandingAndLogo=function(...args){const r=shopRefreshBefore.apply(this,args);refreshLogoFrame();return r;};

 function install(){
  // Apply a clear select-like shell to each item/service combobox.
  if(!$('invoicePicker138Style')){const st=document.createElement('style');st.id='invoicePicker138Style';st.textContent=`.sl-desc-wrap{z-index:2}.sl-desc-wrap:focus-within{z-index:20}.sl-picker-toggle{border-inline-start:0!important;border-start-start-radius:0!important;border-end-start-radius:0!important;border-start-end-radius:.75rem!important;border-end-end-radius:.75rem!important}.sl-desc{border-start-start-radius:.75rem!important;border-end-start-radius:.75rem!important;border-start-end-radius:0!important;border-end-end-radius:0!important}.sl-line-label{color:#334155}.dark .sl-line-label{color:#e2e8f0}#saleSuggestionPopup136{z-index:30001!important;border-radius:0 0 14px 14px!important;box-shadow:0 14px 35px #0f172a30!important}.dark #saleSuggestionPopup136{background:#172337!important;color:#e2e8f0!important;border-color:#475569!important}#colsPanel,#privPanel{max-height:calc(100vh - 24px);overflow:auto}.clock-calendar-trigger{position:relative;z-index:30003;pointer-events:auto}`;document.head.append(st);}
  document.querySelectorAll('.sl-desc').forEach(x=>{x.setAttribute('role','combobox');x.setAttribute('aria-autocomplete','list');x.setAttribute('aria-expanded','false');});
  addDigitalButton();
  refreshLogoFrame();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
