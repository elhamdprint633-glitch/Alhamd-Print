/* 1.3.12: compact invoice rows, durable service catalog visibility, settings recovery. */
(function(){
 'use strict';
 const $=id=>document.getElementById(id);

 function installInvoiceLayout(){
  if($('invoiceLayout141'))return;
  const style=document.createElement('style');style.id='invoiceLayout141';style.textContent=`
   #saleLines .sale-line{align-items:end!important;row-gap:.45rem!important}
   #saleLines .sale-line>div{min-width:0}
   #saleLines .sl-picker,#saleLines .sl-desc-manual,#saleLines input[type=number],#saleLines .sl-dtype,#saleLines .sl-amount{height:36px!important;min-height:36px!important;box-sizing:border-box!important}
   #saleLines .sl-picker,#saleLines .sl-desc-manual,#saleLines input[type=number]{padding-top:.35rem!important;padding-bottom:.35rem!important}
   #saleLines .sl-amount{display:flex;align-items:center;justify-content:center;padding-top:0!important;padding-bottom:0!important;font-size:.82rem!important}
   #saleLines .sl-dtype{flex:0 0 42px!important;padding-inline:.2rem!important;font-size:10px!important}
   #saleLines .sl-line-label{min-height:16px;line-height:16px;margin-bottom:4px!important;font-size:11px!important}
   #saleLines .sl-desc-wrap{min-width:0}
   #saleLines .sl-hint{display:none!important}
   #saleLines .sale-line>div:last-child{align-self:end!important;padding-bottom:2px}
   .dark #saleLines .sl-amount{background:#162032!important;border-color:#475569!important;color:#e2e8f0!important}
   @media(min-width:768px){#saleLines .sale-line{grid-template-columns:repeat(12,minmax(0,1fr))!important;column-gap:.45rem!important}}
  `;document.head.append(style);
 }


 // Hide every chosen financial class in private mode, then reapply the table
 // column view after each change so toggles work immediately in every table.
 const privBefore=window.applyCostMask;
 if(privBefore&&!privBefore._privacy141){const wrapped=function(...args){const result=privBefore.apply(this,args);document.querySelectorAll('table').forEach(t=>{try{if(typeof applyTableView==='function')applyTableView(t);}catch(_){}});return result;};wrapped._privacy141=true;window.applyCostMask=wrapped;}

 const switchBefore=window.switchTab;
 if(switchBefore&&!switchBefore._settings141){const wrapped=function(id,...args){const result=switchBefore.call(this,id,...args);if(id==='services')requestAnimationFrame(()=>{window.renderServiceCatalogTable?.();window.refreshInvoiceItemPickers?.();});return result;};wrapped._settings141=true;window.switchTab=wrapped;}

 function install(){installInvoiceLayout();window.renderServiceCatalogTable?.();}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
