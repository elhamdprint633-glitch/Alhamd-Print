/* 1.3.11: render the service price catalog from saved records without blank-table failures. */
(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 const safeText=v=>String(v??'').trim();
 const money=v=>{try{return formatCurrency(Number(v)||0);}catch(_){return (Number(v)||0).toFixed(2);}};
 const appendCell=(tr,value,classes='')=>{const td=document.createElement('td');td.className='p-3 '+classes;td.textContent=safeText(value)||'—';tr.append(td);return td;};

 // The former catalog renderer could leave the body empty if one legacy row
 // contained an unexpected value or a render helper failed. Build cells with
 // textContent, preserve filtering/paging when available, and show a useful row
 // if an individual saved service is malformed.
 window.renderServiceCatalogTable=function(){
  const body=$('serviceCatalogTableBody');if(!body)return;
  const catalog=Array.isArray(appState?.serviceCatalog)?appState.serviceCatalog:[];
  const normalized=catalog.filter(x=>x&&typeof x==='object');
  let visible=normalized;
  try{if(typeof tableApply==='function')visible=tableApply('serviceCatalogTableBody',normalized);}catch(err){console.error('Service catalog filtering failed; showing saved services without filters.',err);}
  const draw=rows=>{
   body.replaceChildren();
   if(!rows.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=8;td.className='p-5 text-center text-slate-500';td.textContent=normalized.length?'لا توجد خدمات تطابق الفلترة الحالية. امسح الفلترة لعرض الخدمات.':'لا توجد خدمات في قائمة الأسعار بعد. أضف خدمة لتظهر هنا وفي قائمة الفاتورة.';tr.append(td);body.append(tr);return;}
   const fragment=document.createDocumentFragment();
   rows.forEach((s,index)=>{
    try{
     const tr=document.createElement('tr');tr.className='border-t hover:bg-slate-50 dark:hover:bg-slate-700';
     appendCell(tr,s.code||'—','font-mono');appendCell(tr,s.category||'عام');appendCell(tr,s.name||'خدمة بدون اسم','font-bold');appendCell(tr,s.unit||'خدمة');
     appendCell(tr,can('stock_cost')&&!ss().hideCosts?money(s.cost):'—');appendCell(tr,money(s.price),'font-bold');appendCell(tr,s.notes||'—');
     const actions=document.createElement('td');actions.className='p-3 whitespace-nowrap';
     const edit=document.createElement('button');edit.type='button';edit.className='border rounded-lg px-2 py-1';edit.textContent='تعديل';edit.addEventListener('click',()=>window.openServiceCatalogModal?.(String(s.id??'')));actions.append(edit);
     if(can('svc_delete')){const del=document.createElement('button');del.type='button';del.className='border border-rose-300 text-rose-700 rounded-lg px-2 py-1 mr-1';del.textContent='حذف';del.addEventListener('click',()=>window.deleteServiceCatalog?.(String(s.id??'')));actions.append(del);}
     tr.append(actions);fragment.append(tr);
    }catch(err){
     console.error('Could not render saved service row',index,err);
     const tr=document.createElement('tr');tr.className='border-t';const td=document.createElement('td');td.colSpan=8;td.className='p-3 text-amber-700 dark:text-amber-300';td.textContent=`تعذر عرض سجل خدمة رقم ${index+1}؛ باقي الخدمات تظل متاحة.`;tr.append(td);fragment.append(tr);
    }
   });
   body.append(fragment);
  };
  let st;
  if(typeof pageRows==='function'){
   pageRows('serviceCatalogTableBody',visible,draw);
   st=typeof PAGE_STATE!=='undefined'?PAGE_STATE.serviceCatalogTableBody:null;
   if(st)st.render=window.renderServiceCatalogTable;
  }else draw(visible);
  if(typeof tableTools==='function')tableTools('serviceCatalogTableBody');
 };

 // Refresh the invoice selector from the same persisted catalog whenever the
 // services view is opened, including after restoring a backup.
 const switchBefore=window.switchTab;
 if(switchBefore&&!switchBefore._catalog140){const wrapped=function(id,...args){const out=switchBefore.call(this,id,...args);if(id==='services')requestAnimationFrame(()=>{window.showServiceSection?.('catalog');window.renderServiceCatalogTable();window.refreshInvoiceItemPickers?.();});return out;};wrapped._catalog140=true;window.switchTab=wrapped;}
 const populateBefore=window.populateDropdowns;
 if(populateBefore&&!populateBefore._catalog140){const wrapped=function(...args){const out=populateBefore.apply(this,args);window.refreshInvoiceItemPickers?.();return out;};wrapped._catalog140=true;window.populateDropdowns=wrapped;}
})();
