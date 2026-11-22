/* Statement output uses the same invoice template, settings and brand assets. */
function statementInvoiceDocument(){
 const c=stmtCompute();if(!c)return null;applyInvoiceSettings();const node=gid('printArea').cloneNode(true),find=id=>node.querySelector('#'+id),set=(id,value)=>{const e=find(id);if(e)e.textContent=value;},shop=ss(),v=invCfg(),isC=c.d.isC,rows=statementEntries(c),orders=new Map(appState.orders.map(o=>[o.id,o])),purchases=new Map(appState.purchases.map(o=>[o.id,o]));
 set('invHeaderShopName',v.customShopName||shop.name||'الحمد برنت');set('invHeaderSubTitle',v.customShopSubTitle||shop.subTitle||'للطباعة والدعاية والإعلان');set('invHeaderPhones','خدمة العملاء: '+[v.customShopPhone1||shop.phone1,v.customShopPhone2||shop.phone2].filter(Boolean).join(' | '));set('invHeaderAddress',(v.customShopAddress||shop.address)?'المقر: '+(v.customShopAddress||shop.address):'');set('invTitleBadge',isC?'كشف حساب عميل':'كشف حساب مورد');set('invOrderNo','الفترة: '+(STMT.from||'البداية')+' — '+(STMT.to||'حتى الآن'));set('invDate','تاريخ الإصدار: '+new Date().toLocaleString('ar-EG',{hour12:true}));
 const logo=find('invLogoContainer');if(logo){logo.replaceChildren();const logoSrc=v.customLogo||shop.logo;if(logoSrc){const img=document.createElement('img');img.src=logoSrc;img.className='max-h-full max-w-full object-contain p-1';logo.append(img);}else logo.textContent=((v.customShopName||shop.name||'ح').trim().charAt(0)||'ح');if(typeof window.applyInvoiceLogoStyle162==='function')window.applyInvoiceLogoStyle162(logo,v);}
 set('invClientName',c.d.party.name);set('invClientPhone',c.d.party.phone||'—');set('invDeliveryDate',rows.length+' حركة مطابقة من '+c.rows.length);set('invStatus','رصيد نهاية الفترة: '+formatCurrency(c.close));
 const meta=find('invClientName').parentElement;meta.firstElementChild.textContent=isC?'اسم العميل / الشركة:':'اسم المورد / الشركة:';
 const dl=node.querySelector('[data-sec="delivery"]');if(dl)dl.textContent='عدد الحركات:';node.classList.remove('no-ld');
 const table=find('invLinesBody').closest('table');
 table.className='w-full text-xs text-right border-collapse border border-slate-300 bg-transparent';
 table.innerHTML=`<thead class="bg-transparent font-bold text-slate-800"><tr>${['التاريخ','المستند','البيان','مدين / مستحق','دائن / سداد','الرصيد'].map(t=>'<th class="p-2 border border-slate-300 bg-transparent">'+t+'</th>').join('')}</tr></thead><tbody>${rows.map(e=>{const source=e.kind==='order'?orders.get(e.src):e.kind==='pur'?purchases.get(e.src):null;const showItemDetails=Boolean(source&&(typeof window.isStatementEntryExpanded164==='function'?window.isStatementEntryExpanded164(e):STMT.details===true));return `<tr class="border-b border-slate-200 bg-transparent"><td class="p-2 border border-slate-300 bg-transparent font-mono whitespace-nowrap">${escapeHtml(e.date)}</td><td class="p-2 border border-slate-300 bg-transparent font-bold whitespace-nowrap">${escapeHtml(e.ref)}</td><td class="p-2 border border-slate-300 bg-transparent">${escapeHtml(e.desc)}${e.kind==='order'&&source?'<br>'+statementCompactDiscount(source):''}</td><td class="p-2 border border-slate-300 bg-transparent font-mono">${formatCurrency(e.debit)}</td><td class="p-2 border border-slate-300 bg-transparent font-mono">${formatCurrency(e.credit)}</td><td class="p-2 border border-slate-300 bg-transparent font-mono font-bold">${stmtBal(e.bal,isC)}</td></tr>${showItemDetails?'<tr class="bg-transparent stmt-expanded-lines-row164" data-expanded-invoice-id="'+escapeHtml(String(e.src||''))+'"><td colspan="6" class="p-2.5 border border-slate-300 bg-transparent"><div class="text-[11px] font-black text-teal-800 mb-1">تفاصيل بنود الفاتورة '+escapeHtml(e.ref||'')+' ('+escapeHtml(e.date||'')+')</div>'+statementLineTable(source,e.kind==='pur')+'</td></tr>':''}`;}).join('')||'<tr class="bg-transparent"><td colspan="6" class="p-3 border text-center text-slate-500 bg-transparent">لا توجد حركات مطابقة</td></tr>'}</tbody>`;
 node.querySelectorAll('.statement-lines tr').forEach(tr=>{tr.style.background='transparent';Array.from(tr.cells).forEach((cell,i)=>{cell.dataset.col=cell.dataset.col||['idx','desc','qty','price','disc','amount'][i];cell.classList.add('text-xs');cell.style.background='transparent';});});
 // Map invoice summary sections to the equivalent statement amounts.
 const sw=find('invSubtotalWrap'),dw=find('invDiscountWrap');sw.classList.remove('hidden');sw.classList.add('flex');sw.firstElementChild.textContent='رصيد بداية الفترة:';set('invSubtotal',formatCurrency(c.open));dw.classList.add('hidden');dw.classList.remove('flex');set('invTotal',formatCurrency(c.tD));find('invTotal').previousElementSibling.textContent='إجمالي مدين للفترة:';set('invPaid',formatCurrency(c.tC));find('invPaid').previousElementSibling.textContent='إجمالي دائن / سداد للفترة:';set('invRemaining',formatCurrency(c.close));find('invRemaining').previousElementSibling.textContent='رصيد نهاية الفترة:';const words=find('invAmountWords'),cfg=invCfg();if(words){words.textContent='رصيد نهاية الفترة كتابةً: '+amountInArabicWords(Math.abs(c.close))+(c.close<0?' دائن':' مدين');words.classList.toggle('hidden',!cfg.showAmountWords);}
 set('invTermsText',v.customShopTerms||shop.terms||'');set('invNotes',(STMT.query||tableView('statementMovements').rules.length||tableView('statementMovements').sort)?'الكشف يعرض الحركات المطابقة للبحث والفلترة. الأرصدة التراكمية محسوبة وفق التاريخ الأصلي للحركات، والملخص يخص الفترة كاملة، وليست مجموع النتائج المطابقة فقط.':'الأرصدة الموجبة '+(isC?'مستحقة على العميل':'مستحقة للمورد')+'، والأرصدة السالبة '+(isC?'رصيد دائن للعميل':'رصيد لنا لدى المورد')+'.');find('invNotesBox').classList.remove('hidden');
 node.style.position='relative';node.style.overflow='hidden';
 const wm=find('invWatermark');if(wm){wm.classList.add('inv-watermark-layer');if(wm.innerHTML.trim()){wm.style.cssText='position:absolute!important;inset:0!important;top:0!important;right:0!important;bottom:0!important;left:0!important;width:100%!important;height:100%!important;display:flex!important;align-items:center!important;justify-content:center!important;pointer-events:none!important;overflow:hidden!important;z-index:1!important;';}else{wm.style.cssText='display:none!important;';}}
 Array.from(node.children).forEach(ch=>{if(ch.id!=='invWatermark'&&ch.id!=='invTemplateLayer157'){ch.style.position='relative';ch.style.zIndex='2';}});
 return {kind:isC?'statement-client':'statement-supplier',title:'كشف_حساب_'+c.d.party.name,html:cleanDocument(node).outerHTML};
}
const documentBeforeStatementTemplate=currentDocument;currentDocument=function(target){if(target==='statement'||(!target&&!gid('modalStatement').classList.contains('hidden')&&gid('modalPrintInvoice').classList.contains('hidden'))){if(appState.isLocked||!can(STMT.type==='client'?'cli_statement':'sup_statement'))return permDeny();return statementInvoiceDocument();}return documentBeforeStatementTemplate(target);};
printStatement=function(){if(appState.isLocked||!can(STMT.type==='client'?'cli_statement':'sup_statement'))return permDeny();const doc=statementInvoiceDocument();if(!doc)return;gid('stmtPrintClone')?.remove();const clone=document.createElement('div');clone.id='stmtPrintClone';clone.innerHTML='<div id="stmtSheet">'+doc.html+'</div>';document.body.append(clone);document.body.classList.add('printing-stmt');const cleanup=()=>{clone.remove();document.body.classList.remove('printing-stmt');window.removeEventListener('afterprint',cleanup);};window.addEventListener('afterprint',cleanup);setTimeout(()=>{try{window.print();}catch(e){cleanup();throw e;}},60);};
function previewStatementDocument(){
 if(appState.isLocked||!can(STMT.type==='client'?'cli_statement':'sup_statement'))return permDeny();
 const doc=statementInvoiceDocument();if(!doc)return;
 gid('statementDocumentPreview')?.remove();
 const modal=document.createElement('div');
 modal.id='statementDocumentPreview';
 modal.className='fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto';
 modal.style.zIndex='10020';
 const ic=invCfg().colors||{};
 const sheetHtml=doc.html.replace(/id="printArea"/,'id="statementInvoiceSheet" data-preview-id="printArea"').replace(/id="([^"]+)"/g,(m,id)=>id==='statementInvoiceSheet'?m:`data-preview-id="${id}"`);
 modal.innerHTML=`
  <div class="bg-white rounded-2xl max-w-3xl w-full p-6 space-y-4 shadow-2xl my-6 max-h-[92vh] flex flex-col">
   <div class="flex flex-wrap items-center justify-between gap-2 border-b pb-3 no-print shrink-0">
    <h3 class="text-base font-bold text-slate-900">معاينة كشف الحساب بتنسيق الفاتورة</h3>
    <div class="flex flex-wrap items-center gap-1.5">
     <button type="button" onclick="window.sendPartyStatementWhatsApp?.(STMT.type, STMT.id)" class="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition"><i class="fa-brands fa-whatsapp text-sm"></i><span>إرسال واتساب</span></button>
     <button type="button" onclick="window.quickExportStatementInvoice31?.('copy')" class="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition"><i class="fa-solid fa-copy"></i><span>نسخ الصورة</span></button>
     <button type="button" onclick="window.quickExportStatementInvoice31?.('pdf')" class="bg-sky-600 hover:bg-sky-700 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition"><i class="fa-solid fa-file-pdf"></i><span>حفظ PDF</span></button>
     <button type="button" onclick="window.quickExportStatementInvoice31?.('png')" class="bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition"><i class="fa-solid fa-image"></i><span>حفظ صورة</span></button>
     ${can('sets_invoice')?`<button type="button" onclick="gid('statementDocumentPreview')?.remove();openInvoiceSettings()" class="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5"><i class="fa-solid fa-sliders"></i><span>إعدادات الفاتورة</span></button>`:''}
     <button type="button" onclick="printStatement()" class="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"><i class="fa-solid fa-print"></i><span>طباعة الآن</span></button>
     <div class="floating-win-nav162 no-print inline-flex items-center gap-1.5 shrink-0">
      <button type="button" data-win-back="1" onclick="window.goBackFloatingWindow162?.(gid('statementDocumentPreview'))" class="win-back-btn162 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold inline-flex items-center gap-1" title="الرجوع إلى النافذة السابقة أو القسم السابق"><i class="fa-solid fa-arrow-right"></i><span>رجوع</span></button>
      <button type="button" data-win-close="1" onclick="window.closeFloatingWindow162?window.closeFloatingWindow162(gid('statementDocumentPreview')):gid('statementDocumentPreview')?.remove()" class="win-close-btn162 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold inline-flex items-center gap-1" aria-label="إغلاق" title="إغلاق النافذة"><i class="fa-solid fa-xmark"></i><span>إغلاق ✕</span></button>
     </div>
    </div>
   </div>
   <div class="overflow-y-auto flex-1 min-h-0">
    ${sheetHtml}
   </div>
  </div>`;
 document.body.append(modal);
 const preview=modal.querySelector('#statementInvoiceSheet');
 if(preview){
  preview.style.position='relative';
  preview.style.overflow='hidden';
  preview.style.fontFamily="var(--invoice-font,var(--app-font))";
  preview.style.setProperty('background-color', ic.pageBg||'#ffffff', 'important');
  preview.style.setProperty('color', ic.pageText||'#172337', 'important');
  const wmPrev=preview.querySelector('[data-preview-id="invWatermark"], #invWatermark, .inv-watermark-layer');
  if(wmPrev){
   wmPrev.classList.add('inv-watermark-layer');
   if(wmPrev.innerHTML.trim()){
    wmPrev.style.cssText='position:absolute!important;inset:0!important;top:0!important;right:0!important;bottom:0!important;left:0!important;width:100%!important;height:100%!important;display:flex!important;align-items:center!important;justify-content:center!important;pointer-events:none!important;overflow:hidden!important;z-index:1!important;';
   }else{
    wmPrev.style.cssText='display:none!important;';
   }
  }
  Array.from(preview.children).forEach(ch=>{
   if(ch!==wmPrev&&ch.dataset?.previewId!=='invTemplateLayer157'&&ch.id!=='invTemplateLayer157'){
    ch.style.position='relative';
    ch.style.zIndex='2';
   }
  });
  const hdr=preview.querySelector('[data-invoice-part="header"]');
  if(hdr){
   hdr.style.setProperty('background-color', 'transparent', 'important');
   hdr.style.setProperty('color', ic.headerText||'#172337', 'important');
   hdr.style.borderColor=ic.accent||'#0f172a';
   hdr.querySelectorAll('*:not([data-preview-id="invTitleBadge"]):not([data-preview-id="invLogoContainer"]):not([data-preview-id="invLogoContainer"] *)').forEach(el=>{el.style.setProperty('color', ic.headerText||'#172337', 'important');});
  }
  const logoPrev=preview.querySelector('[data-preview-id="invLogoContainer"]');
  if(logoPrev&&typeof window.applyInvoiceLogoStyle162==='function'){
   window.applyInvoiceLogoStyle162(logoPrev, invCfg());
  }
  const badge=preview.querySelector('[data-preview-id="invTitleBadge"]');
  if(badge){badge.style.setProperty('background-color', ic.accent||'#0f172a', 'important');badge.style.setProperty('color', invCfg().titleTextColor||'#ffffff', 'important');}
  const cli=preview.querySelector('[data-invoice-part="client"]');
  if(cli){
   cli.style.setProperty('background-color', 'transparent', 'important');
   cli.style.setProperty('color', ic.clientText||'#172337', 'important');
   cli.querySelectorAll('*').forEach(el=>{el.style.setProperty('color', ic.clientText||'#172337', 'important');});
  }
  preview.querySelectorAll('table, thead, tbody, tfoot, tr').forEach(el=>{el.style.setProperty('background-color', 'transparent', 'important');el.style.setProperty('background', 'transparent', 'important');});
  preview.querySelectorAll('[data-invoice-part="lines"] th, table th').forEach(th=>{th.style.setProperty('background-color', 'transparent', 'important');th.style.setProperty('background', 'transparent', 'important');th.style.setProperty('color', ic.tableHeadText||'#1e293b', 'important');});
  preview.querySelectorAll('[data-invoice-part="lines"] td, table td').forEach(td=>{td.style.setProperty('background-color', 'transparent', 'important');td.style.setProperty('background', 'transparent', 'important');td.style.setProperty('color', ic.tableBodyText||'#172337', 'important');});
  const sum=preview.querySelector('[data-invoice-part="summary"]');
  if(sum){
   sum.style.setProperty('background-color', 'transparent', 'important');
   sum.style.setProperty('color', ic.summaryText||'#172337', 'important');
   sum.style.padding='12px';sum.style.borderRadius='12px';
   sum.querySelectorAll('*').forEach(el=>{el.style.setProperty('color', ic.summaryText||'#172337', 'important');});
  }
 }
 const dyn=gid('invoiceDynStyle')?.textContent||'';
 const st=document.createElement('style');
 st.textContent=dyn.replace(/#printArea/g,'#statementDocumentPreview #statementInvoiceSheet').replace(/@page\s*\{[^}]*\}/g,'');
 modal.append(st);
}
window.previewStatementDocument=previewStatementDocument;
const renderStatementTemplate=renderStatement;renderStatement=function(){const r=renderStatementTemplate();const nav=gid('statementNavV12'),view=tableView('statementMovements');gid('statementFilterAccountingNote')?.remove();if(view.sort||view.rules.length){const note=document.createElement('p');note.id='statementFilterAccountingNote';note.className='p-3 border rounded-lg text-xs';note.textContent='الفلترة والترتيب يغيران الحركات المعروضة فقط. الرصيد التراكمي محسوب بترتيب التاريخ الأصلي، وإجماليات الحساب تخص الفترة كاملة.';gid('stmtSheet')?.prepend(note);}if(nav&&!gid('statementTemplatePreviewButton')){const b=document.createElement('button');b.id='statementTemplatePreviewButton';b.type='button';b.className='border px-3 py-2 rounded-lg font-bold bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100';b.textContent='معاينة تنسيق الطباعة';b.onclick=()=>window.previewStatementDocument();nav.append(b);}return r;};


window.styleStatementInvoiceSheetElement164 = function(preview) {
 if(!preview)return null;
 const ic=(typeof invCfg==='function'?invCfg().colors:null)||{};
 preview.style.position='relative';
 preview.style.overflow='hidden';
 preview.style.fontFamily="var(--invoice-font,var(--app-font))";
 preview.style.setProperty('background-color', ic.pageBg||'#ffffff', 'important');
 preview.style.setProperty('color', ic.pageText||'#172337', 'important');
 const wmPrev=preview.querySelector('[data-preview-id="invWatermark"], #invWatermark, .inv-watermark-layer');
 if(wmPrev){
  wmPrev.classList.add('inv-watermark-layer');
  if(wmPrev.innerHTML.trim()){
   wmPrev.style.cssText='position:absolute!important;inset:0!important;top:0!important;right:0!important;bottom:0!important;left:0!important;width:100%!important;height:100%!important;display:flex!important;align-items:center!important;justify-content:center!important;pointer-events:none!important;overflow:hidden!important;z-index:1!important;';
  }else{
   wmPrev.style.cssText='display:none!important;';
  }
 }
 Array.from(preview.children).forEach(ch=>{
  if(ch!==wmPrev&&ch.dataset?.previewId!=='invTemplateLayer157'&&ch.id!=='invTemplateLayer157'){
   ch.style.position='relative';
   ch.style.zIndex='2';
  }
 });
 const hdr=preview.querySelector('[data-invoice-part="header"]');
 if(hdr){
  hdr.style.setProperty('background-color', 'transparent', 'important');
  hdr.style.setProperty('color', ic.headerText||'#172337', 'important');
  hdr.style.borderColor=ic.accent||'#0f172a';
  hdr.querySelectorAll('*:not([data-preview-id="invTitleBadge"]):not(#invTitleBadge):not([data-preview-id="invLogoContainer"]):not(#invLogoContainer):not([data-preview-id="invLogoContainer"] *):not(#invLogoContainer *)').forEach(el=>{el.style.setProperty('color', ic.headerText||'#172337', 'important');});
 }
 const logoPrev=preview.querySelector('[data-preview-id="invLogoContainer"], #invLogoContainer');
 if(logoPrev&&typeof window.applyInvoiceLogoStyle162==='function'){
  window.applyInvoiceLogoStyle162(logoPrev, invCfg());
 }
 const badge=preview.querySelector('[data-preview-id="invTitleBadge"], #invTitleBadge');
 if(badge){badge.style.setProperty('background-color', ic.accent||'#0f172a', 'important');badge.style.setProperty('color', invCfg().titleTextColor||'#ffffff', 'important');}
 const cli=preview.querySelector('[data-invoice-part="client"]');
 if(cli){
  cli.style.setProperty('background-color', 'transparent', 'important');
  cli.style.setProperty('color', ic.clientText||'#172337', 'important');
  cli.querySelectorAll('*').forEach(el=>{el.style.setProperty('color', ic.clientText||'#172337', 'important');});
 }
 preview.querySelectorAll('table, thead, tbody, tfoot, tr').forEach(el=>{el.style.setProperty('background-color', 'transparent', 'important');el.style.setProperty('background', 'transparent', 'important');});
 preview.querySelectorAll('[data-invoice-part="lines"] th, table th').forEach(th=>{th.style.setProperty('background-color', 'transparent', 'important');th.style.setProperty('background', 'transparent', 'important');th.style.setProperty('color', ic.tableHeadText||'#1e293b', 'important');});
 preview.querySelectorAll('[data-invoice-part="lines"] td, table td').forEach(td=>{td.style.setProperty('background-color', 'transparent', 'important');td.style.setProperty('background', 'transparent', 'important');td.style.setProperty('color', ic.tableBodyText||'#172337', 'important');});
 const sum=preview.querySelector('[data-invoice-part="summary"]');
 if(sum){
  sum.style.setProperty('background-color', 'transparent', 'important');
  sum.style.setProperty('color', ic.summaryText||'#172337', 'important');
  sum.style.padding='12px';sum.style.borderRadius='12px';
  sum.querySelectorAll('*').forEach(el=>{el.style.setProperty('color', ic.summaryText||'#172337', 'important');});
 }
 return preview;
};
