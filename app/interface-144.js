/* Viewport-safe desktop dialogs and calculator navigation, 1.4.4. */
(()=>{'use strict';
 const $=id=>document.getElementById(id);
 const style=document.createElement('style');style.textContent=`
 @media screen {
 .app-dialog144{position:fixed!important;inset:0!important;width:100%!important;height:100dvh!important;max-height:100dvh!important;box-sizing:border-box!important;padding:12px!important;overflow:hidden!important;align-items:center!important;justify-content:center!important;isolation:isolate}
 .app-dialog144:not(.hidden){display:flex!important}
 .app-dialog144>.dialog-card144{box-sizing:border-box!important;min-width:0!important;min-height:0!important;max-height:min(82dvh,calc(100dvh - 48px))!important;margin:0!important;overflow:auto!important;overscroll-behavior:contain;scrollbar-gutter:stable;transform:none!important}
 .dialog-card144>.dialog-head144{position:sticky!important;top:0!important;z-index:20!important;background:inherit;flex-wrap:wrap;gap:8px;min-height:42px}
 .dialog-head144>div{flex-wrap:wrap}
 #modalPrintInvoice>.dialog-card144{display:flex!important;flex-direction:column!important;height:min(960px,calc(100dvh - 24px))!important;overflow:hidden!important;background:#fff!important;color:#0f172a!important}
 #modalPrintInvoice .dialog-head144{position:relative!important;flex-shrink:0!important;background:#fff!important;color:#0f172a!important}
 #modalPrintInvoice #printArea{flex:1 1 auto!important;min-height:0!important;max-width:100%!important;overflow:auto!important;overscroll-behavior:contain;overflow-wrap:anywhere}
 #modalSecurityPin{z-index:100100!important}
 #sidebar{height:100dvh!important;max-height:100dvh!important;min-height:0!important;overflow-y:auto!important;overflow-x:hidden!important;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-gutter:stable;flex-shrink:0}
 #sidebar[data-pin-mode="both"]{overflow:hidden!important;display:flex!important;flex-direction:column!important}#sidebar[data-pin-mode="both"]>#sidebarTopPart,#sidebar[data-pin-mode="both"]>#sidebarBottomPart{flex:0 0 auto!important}#sidebar[data-pin-mode="both"]>#sidebarNavScroll{flex:1 1 0%!important;min-height:0!important;overflow-y:auto!important;overflow-x:hidden!important}
 .ss-preset.ss-selected{outline:2px solid #f97316;outline-offset:2px}
 }

 `;document.head.append(style);
 let level=50000;
 function bound(el){
  if(el?.dataset?.layer701==='true')return;
  if(!(el instanceof HTMLElement)||!el.isConnected||!el.classList.contains('fixed')||!el.classList.contains('inset-0')||el.id==='sidebarOverlay'||el.id==='sidebar')return;
  const card=el.firstElementChild;if(!card||!el.className.match(/bg-black|backdrop|bg-slate-950/))return;
  if(!el.classList.contains('app-dialog144')){
   if(el.parentElement!==document.body&&!el.closest('#lockScreenOverlay'))document.body.append(el);
   el.classList.add('app-dialog144');card.classList.add('dialog-card144');
   const widths={'max-w-sm':340,'max-w-md':390,'max-w-lg':440,'max-w-xl':490,'max-w-2xl':560,'max-w-3xl':640,'max-w-4xl':720,'max-w-5xl':800,'max-w-6xl':880};
   const width=Object.entries(widths).find(([k])=>card.classList.contains(k))?.[1]||560;
   card.style.setProperty('width','100%','important');card.style.setProperty('max-width',`min(${width}px, calc(100vw - 32px))`,'important');
   const head=card.querySelector(':scope > :not(.window-tools150)')||card.firstElementChild;
   if(head&&!head.classList.contains('window-tools150')&&(head.matches('header,.win-head,.no-print')||head.querySelector('button')))head.classList.add('dialog-head144');
  }
  if(!el.classList.contains('hidden')&&!el.dataset.active144){el.dataset.active144='1';el.style.zIndex=String(++level);}
  if(el.classList.contains('hidden'))delete el.dataset.active144;
 }
 document.querySelectorAll('.fixed.inset-0').forEach(bound);
 const observer=new MutationObserver(records=>{for(const rec of records){if(rec.type==='attributes')bound(rec.target);else for(const node of rec.addedNodes)if(node instanceof HTMLElement){bound(node);node.querySelectorAll('.fixed.inset-0').forEach(bound);}}});
 observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});

 window.addBannerToInvoice=function(){const w=Number($('bcWidth')?.value),h=Number($('bcHeight')?.value),qty=Number($('bcQty')?.value),p=Number($('bcPrice')?.value),f=Number($('bcFinish')?.value||0);
 if(![w,h,qty,p,f].every(Number.isFinite)||w<=0||h<=0||!Number.isInteger(qty)||qty<=0||p<0||f<0)return showToast('راجع مقاس البانر والكمية والسعر.','warning');
 return window.chooseCalculatorInvoice142({qty,unit:w*h*(p+f),desc:`بانر / فلكس / فينيل ${w} × ${h} م — تشطيب ${f} ج.م/م²`},'البانر والفلكس والفينيل');};
 function labels(){const nav=document.querySelector('.nav-btn[data-tab="digitalcalc"]')||document.querySelector('[onclick*="switchTab(\'digitalcalc\')"]');if(nav){const label=nav.querySelector('.sb-label');if(label)label.textContent='حاسبة المطبوعات';nav.dataset.tip='حاسبة المطبوعات';}const b=$('bannerCalculator')?.querySelector('button[onclick*="addBannerToInvoice"]');if(b){b.innerHTML='<i class="fa-solid fa-file-circle-plus ml-2"></i>إدراج في الفاتورة';b.className=$('dcAddInvoiceBtn144')?.className||'w-full mt-2 rounded-xl py-3 bg-teal-600 text-white font-black';}}
 window.addEventListener('DOMContentLoaded',labels);labels();const old=window.switchTab;window.switchTab=function(...args){const result=old.apply(this,args);if(args[0]==='digitalcalc')labels();return result;};
})();
