/* Alhamd Print 1.5.7: invoice evidence, guidance visibility and final UI integration. */
(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 let evidence=[],removedEvidence=[];
 const clone=x=>JSON.parse(JSON.stringify(x||[]));
 const editing=()=>typeof EDIT!=='undefined'&&!!EDIT.order;
 const invoicePerm=()=>editing()?'inv_edit':'inv_create';
 function safePrune(files){const names=(files||[]).map(x=>typeof x==='string'?x:x?.file).filter(Boolean).filter(name=>!window.InvoiceDraft640?.protectsFile(name));if(!names.length||!window.api?.opsPruneInvoiceEvidence157)return;return window.api.opsPruneInvoiceEvidence157({files:names}).catch(e=>console.warn('Evidence cleanup deferred:',e));}
 function evidenceRender(){const host=$('saleEvidenceList157'),status=$('saleEvidenceStatus157');if(!host||!status)return;host.replaceChildren();status.textContent=evidence.length?`عدد صور الإثبات: ${evidence.length} من 12 — تُحفظ مع الفاتورة عند اعتمادها.`:'لا توجد صور إثبات مرفقة.';const add=$('saleEvidenceAdd157');if(add){add.disabled=evidence.length>=12||!can(invoicePerm());add.classList.toggle('opacity-50',add.disabled);}
  evidence.forEach((a,index)=>{const row=document.createElement('div');row.className='flex items-center justify-between gap-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 p-2 min-w-0';const meta=document.createElement('div');meta.className='min-w-0';const name=document.createElement('b');name.className='block truncate text-xs text-slate-800 dark:text-slate-100';name.textContent=a.name||`صورة ${index+1}`;const size=document.createElement('small');size.className='block text-[10px] text-slate-500 dark:text-slate-400';size.textContent=`${Math.max(1,Math.round((Number(a.size)||0)/1024))} كيلوبايت`;meta.append(name,size);const actions=document.createElement('div');actions.className='flex gap-1 shrink-0';const open=document.createElement('button');open.type='button';open.className='border rounded-md px-2 py-1 text-[10px]';open.textContent='فتح';open.onclick=()=>openInvoiceEvidence157(index);const remove=document.createElement('button');remove.type='button';remove.className='border border-rose-300 text-rose-700 rounded-md px-2 py-1 text-[10px]';remove.textContent='حذف';remove.disabled=!can(invoicePerm());remove.onclick=()=>removeInvoiceEvidence157(index);actions.append(open,remove);row.append(meta,actions);host.append(row);});
 }
 window.renderInvoiceEvidence157=evidenceRender;window.EvidenceDraft640={get:()=>clone(evidence),set:rows=>{evidence=clone(rows);removedEvidence=[];evidenceRender();}};
 window.pickInvoiceEvidence157=async function(){if(appState.isLocked||!can(invoicePerm()))return permDeny();if(evidence.length>=12)return showToast('وصلت إلى الحد الأقصى: 12 صورة للفاتورة الواحدة.','warning');if(!window.api?.opsPickInvoiceEvidence157)return showToast('رفع الصور متاح في نسخة Windows المثبتة فقط.','warning');const b=$('saleEvidenceAdd157');if(b)b.disabled=true;try{const picked=await window.api.opsPickInvoiceEvidence157({editing:editing()});const keep=(Array.isArray(picked)?picked:[]),room=Math.max(0,12-evidence.length),accepted=keep.slice(0,room),extra=keep.slice(room);evidence.push(...accepted);if(extra.length)await safePrune(extra);evidenceRender();if(accepted.length)showToast('تم إرفاق '+accepted.length+' صورة بالفاتورة.','success');}catch(e){showToast(e.message||'تعذر إرفاق الصور.','danger');}finally{evidenceRender();}};
 window.openInvoiceEvidence157=async function(index){const a=evidence[index];if(!a)return;if(!can('record_view')&&!can('inv_print')&&!can(invoicePerm()))return permDeny();try{await window.api?.opsOpenInvoiceEvidence157({file:a.file});}catch(e){showToast(e.message||'تعذر فتح الصورة.','danger');}};
 window.removeInvoiceEvidence157=async function(index){if(appState.isLocked||!can(invoicePerm()))return permDeny();const [removed]=evidence.splice(index,1);if(removed)removedEvidence.push(removed);evidenceRender();if(removed)await safePrune([removed]);showToast('تم حذف الصورة من مسودة الفاتورة.','success');};
 window.clearInvoiceEvidence157=async function(){if(appState.isLocked||!can(invoicePerm()))return permDeny();const old=[...evidence,...removedEvidence];evidence=[];removedEvidence=[];evidenceRender();await safePrune(old);showToast('تم حذف صور الإثبات من المسودة.','success');};
 const ui=window.Operations149UI;
 if(ui&&typeof ui.beforeSaleCommit==='function'){
  const before=ui.beforeSaleCommit;
  ui.beforeSaleCommit=function(order,old){const result=before.call(this,order,old);order.attachments149=clone(evidence);return result;};
 }
 if(typeof window.editSale==='function'){
  const original=window.editSale;
  window.editSale=function(id,...args){const result=original.call(this,id,...args);const order=(appState.orders||[]).find(x=>String(x.id)===String(id));evidence=clone(order?.attachments149||[]);evidenceRender();return result;};
 }
 function resetEvidenceAfterComposer(fn){if(typeof fn!=='function')return fn;return function(...args){const pending=[...evidence,...removedEvidence];const result=fn.apply(this,args);evidence=[];removedEvidence=[];evidenceRender();safePrune(pending);return result;};}
 if(typeof window.resetComposer==='function')window.resetComposer=resetEvidenceAfterComposer(window.resetComposer);
 if(typeof window.closeComposer==='function')window.closeComposer=resetEvidenceAfterComposer(window.closeComposer);
 if(typeof window.saveSale==='function'){
  const original=window.saveSale;
  window.saveSale=function(...args){const removed=removedEvidence.slice();const result=original.apply(this,args);if(result&&result.id){evidence=[];removedEvidence=[];evidenceRender();if(removed.length)safePrune(removed);}return result;};
 }

 // Instructional notes are visible to the original admin by default. Other users
 // see them only when the explicit guidance_view permission is granted.
 function markGuidance(root=document){const selectors='[data-guidance],.guidance-text,.instructional-note,.helper-text,[role=note],.pos-note148,.sale-layout-note148,#settlementInfo150,#saleDiscHint';root.querySelectorAll?.(selectors).forEach(el=>{el.dataset.guidance='1';});const exact=/المدفوع هنا يُسجل مرة واحدة بالخزينة|الدفعات اللاحقة من كشف العميل|تُطبّق كل الشروط معًا على نتائج البحث|مثال:\s*(مقاس|اكتب|أدخل)|^ملاحظة[:：]|^تلميح[:：]|^يمكنك (استخدام|تغيير|اختيار|سحب|الضغط)|^استخدم هذا|^اضغط (على|لـ|لإ)|^يُرجى (إدخال|اختيار)|^قم باختيار/;root.querySelectorAll?.('p,small,.text-xs').forEach(el=>{if(el.children.length>2)return;const t=(el.textContent||'').trim();if(t.length<25||t.length>420)return;if(exact.test(t))el.dataset.guidance='1';});}
 function applyGuidance(){markGuidance();const allowed=!!(typeof can==='function'&&can('guidance_view'));document.querySelectorAll('[data-guidance="1"]').forEach(el=>{el.hidden=!allowed;el.setAttribute('aria-hidden',String(!allowed));el.classList.toggle('guidance-hidden157',!allowed);});}
 window.applyGuidanceVisibility157=applyGuidance;
 const gstyle=document.createElement('style');gstyle.textContent='.guidance-hidden157{display:none!important}';document.head.append(gstyle);
 const guideObserver=new MutationObserver(()=>{markGuidance();applyGuidance();});
 document.addEventListener('DOMContentLoaded',()=>{applyGuidance();guideObserver.observe(document.body,{childList:true,subtree:true});evidenceRender();});
 const updateBefore=window.updateAllUI; if(typeof updateBefore==='function')window.updateAllUI=function(...args){const result=updateBefore.apply(this,args);applyGuidance();evidenceRender();return result;};
})();
