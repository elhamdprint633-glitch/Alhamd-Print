/* Detailed statements keep period accounting distinct from text search matches. */
window.isStatementEntryExpanded164 = function(e) {
 if (!e) return false;
 if (typeof STMT !== 'undefined' && STMT) {
  if (STMT.expandedIds && e.src && Object.prototype.hasOwnProperty.call(STMT.expandedIds, e.src)) {
   return Boolean(STMT.expandedIds[e.src]);
  }
  if (STMT.expanded && e.seq !== undefined && Object.prototype.hasOwnProperty.call(STMT.expanded, e.seq)) {
   return Boolean(STMT.expanded[e.seq]);
  }
  return Boolean(STMT.details === true);
 }
 return false;
};
window.toggleStatementEntryDetails164 = function(seq, srcId, isOpen) {
 if (typeof STMT === 'undefined' || !STMT || STMT.exportAll) return;
 STMT.expanded ||= {};
 STMT.expandedIds ||= {};
 const openVal = Boolean(isOpen);
 if (seq !== undefined && seq !== null && !Number.isNaN(Number(seq))) STMT.expanded[Number(seq)] = openVal;
 if (srcId) STMT.expandedIds[String(srcId)] = openVal;
};
window.setAllStatementDetails164 = function(checked) {
 if (typeof STMT === 'undefined' || !STMT) return;
 STMT.details = Boolean(checked);
 STMT.expanded = {};
 STMT.expandedIds = {};
 renderStatement();
};
function statementLineTable(order,purchase){
 const cfg=invCfg(),lines=purchase?[{desc:order.itemName,qty:order.qty,price:order.unitPrice,amount:order.total,discount:0}]:(order.lines?.length?order.lines:[{desc:order.jobType,qty:order.quantity,price:order.quantity?r2(order.total/order.quantity):order.total,amount:order.total}]);
 const general=cfg.showInvoiceDiscountPercent&&order.discountType==='pct'&&Number(order.discountValue)>0?`<span>نسبة الخصم العام: <b>${fmtQty(order.discountValue)}%</b></span>`:'';
 return `<table data-sec="itemsTable" data-invoice-part="lines" class="statement-lines stmt-detail-table w-full text-xs text-right border-collapse border border-slate-300 bg-transparent mt-1.5"><thead class="bg-transparent font-bold text-slate-800"><tr><th data-col="idx" class="p-2 border border-slate-300 w-10 text-center bg-transparent">#</th><th data-col="desc" class="p-2 border border-slate-300 bg-transparent">الصنف / الخدمة</th><th data-col="notes" class="p-2 border border-slate-300 bg-transparent">ملاحظات البند</th><th data-col="qty" class="p-2 border border-slate-300 text-center bg-transparent">الكمية</th><th data-col="price" class="p-2 border border-slate-300 text-left bg-transparent">سعر الوحدة</th><th data-col="disc" class="p-2 border border-slate-300 text-center bg-transparent">الخصم</th><th data-col="amount" class="p-2 border border-slate-300 text-left bg-transparent">الإجمالي</th>${InvoiceColumns406.extra.filter(([id])=>id!=='notes').map(([id,label])=>'<th data-col="'+id+'" class="p-2 border border-slate-300">'+label+'</th>').join('')}</tr></thead><tbody>${lines.map((l,i)=>`<tr class="bg-transparent"><td data-col="idx" class="p-2 border border-slate-300 text-center font-mono text-slate-500 bg-transparent">${i+1}</td><td data-col="desc" class="p-2 border border-slate-300 font-bold whitespace-pre-line break-words leading-relaxed text-right bg-transparent">${escapeHtml(l.desc||'')}</td>${InvoiceColumns406.cell('notes',l,i)}<td data-col="qty" class="p-2 border border-slate-300 text-center font-bold font-mono money bg-transparent">${fmtQty(l.qty)}</td><td data-col="price" class="p-2 border border-slate-300 text-left font-mono money bg-transparent">${formatCurrency(l.price)}</td><td data-col="disc" class="p-2 border border-slate-300 text-center font-mono text-amber-700 money bg-transparent">${Number(l.discount)>0?((cfg.showLineDiscountPercent&&l.discountType==='pct'&&Number(l.discountValue)>0?fmtQty(l.discountValue)+'% ':'')+'('+formatCurrency(l.discount)+')'):'-'}</td><td data-col="amount" class="p-2 border border-slate-300 text-left font-black font-mono money bg-transparent">${formatCurrency(l.amount)}</td>${InvoiceColumns406.extraCells(l,i)}</tr>`).join('')}</tbody></table>${order.specs?'<p class="text-xs mt-1.5"><b>مواصفات / ملاحظات:</b> '+escapeHtml(order.specs)+'</p>':''}<div class="text-xs flex flex-wrap gap-4 mt-1.5 pt-1 border-t border-slate-200"><span>قبل الخصم: <b>${formatCurrency(order.subtotal??(Number(order.total)+Number(order.discount||0)))}</b></span>${general}<span>إجمالي الخصم: <b>${formatCurrency(order.discount||0)}</b></span><span>صافي الفاتورة: <b>${formatCurrency(order.total)}</b></span><span>${purchase?'المدفوع بالفاتورة':'المدفوع حتى الآن'}: <b>${formatCurrency(purchase?order.paid:orderPaid(order))}</b></span><span>المتبقي: <b>${formatCurrency(purchase?order.due:orderRemaining(order))}</b></span></div>`;
}
function statementCompactDiscount(order){
 const amount=Number(order?.discount)||0;if(amount<=0)return '';
 const cfg=invCfg(),parts=[];
 if(cfg.showInvoiceDiscountPercent&&order.discountType==='pct'&&Number(order.discountValue)>0)parts.push(`خصم عام ${fmtQty(order.discountValue)}%`);
 if(cfg.showLineDiscountPercent){const rates=[...new Set((order.lines||[]).filter(l=>l.discountType==='pct'&&Number(l.discountValue)>0).map(l=>fmtQty(l.discountValue)))];if(rates.length)parts.push(`خصم سطر ${rates.join('، ')}%`);}
 return `<span class="stmt-discount-summary inline-flex flex-wrap items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 text-[10px] font-bold">خصم ${formatCurrency(amount)}${parts.length?' — '+escapeHtml(parts.join('، ')):''}</span>`;
}
function stmtMove(delta){const list=STMT.type==='client'?appState.clients:appState.suppliers,idx=list.findIndex(x=>x.id===STMT.id),next=list[idx+delta];if(!next)return;STMT.id=next.id;STMT.expanded={};STMT.expandedIds={};STMT.editAdj=null;STMT.page=0;renderStatement();}
function stmtSearchInput(el){STMT.query=el.value;STMT.page=0;renderStatement();const i=gid('stmtSearch');i?.focus();i?.setSelectionRange(i.value.length,i.value.length);}
function statementEntries(c){const q=STMT.query||'',orders=new Map(appState.orders.map(o=>[o.id,o])),purchases=new Map(appState.purchases.map(p=>[p.id,p]));return c.rows.filter(e=>{const source=e.kind==='order'?orders.get(e.src):e.kind==='pur'?purchases.get(e.src):null;return smartMatch([e.date,e.ref,e.desc,source?.specs,...(source?.lines||[]).map(l=>l.desc)].join(' '),q);});}
function stmtPage(delta){STMT.page=(STMT.page||0)+delta;renderStatement();}
function setStatementPageSize(value){const raw=String(value??'').replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).trim();const n=Number(raw);if(!Number.isInteger(n)||n<1||n>10000){showToast('عدد الصفوف يجب أن يكون رقماً صحيحاً من 1 إلى 10000.','warning');return;}STMT.pageSize=n;ss().tablePageSizes||={};ss().tablePageSizes.statementMovements=n;STMT.page=0;saveState(false);renderStatement();}
const renderStatementV11=renderStatement;
renderStatement=function(){renderStatementV11();const c=stmtCompute();if(!c)return;const card=gid('stmtCard'),sheet=gid('stmtSheet'),isC=c.d.isC,list=isC?appState.clients:appState.suppliers,at=list.findIndex(p=>p.id===STMT.id),top=card.firstElementChild;
 let controls=gid('statementNavV12');if(!controls){controls=document.createElement('div');controls.id='statementNavV12';controls.className='no-print px-5 py-3 border-b flex flex-wrap gap-3 items-center';top.after(controls);}
 controls.innerHTML=`<button type="button" onclick="stmtMove(-1)" ${at<=0?'disabled':''} class="border px-3 py-2 rounded-lg disabled:opacity-40">→ السابق</button><span class="text-slate-500">${at+1} / ${list.length}</span><button type="button" onclick="stmtMove(1)" ${at>=list.length-1?'disabled':''} class="border px-3 py-2 rounded-lg disabled:opacity-40">التالي ←</button><input id="stmtSearch" value="${escapeHtml(STMT.query||'')}" oninput="stmtSearchInput(this)" class="border rounded-lg px-3 py-2 flex-1" placeholder="ابحث برقم الفاتورة أو الصنف أو البيان…"><label class="flex gap-2"><input type="checkbox" ${STMT.details===true?'checked':''} onchange="window.setAllStatementDetails164(this.checked)">فتح تفاصيل كل الفواتير</label>`;
 const actions=top.querySelector('div');if(actions){const b=document.createElement('button');b.type='button';b.className='bg-sky-700 text-white px-3 py-2 rounded-lg font-bold';b.textContent='حفظ كشف الحساب PDF';b.onclick=()=>openDocumentPDF('statement');const wa=document.createElement('button');wa.type='button';wa.className='bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg font-bold flex items-center gap-1.5';wa.innerHTML='<i class="fa-brands fa-whatsapp"></i><span>إرسال عبر واتساب</span>';wa.onclick=()=>window.sendPartyStatementWhatsApp?.(STMT.type,STMT.id);actions.prepend(wa,b);}
 const matches=statementEntries(c),docs=new Map(appState.orders.map(o=>[o.id,o])),purchases=new Map(appState.purchases.map(p=>[p.id,p])),selected=new Set(matches.map(e=>e.seq));
 const frame=sheet.querySelector('table')?.parentElement;if(!frame)return;
 const pageSize=Number(STMT.pageSize||((ss().tablePageSizes||{}).statementMovements)||50);const pages=Math.max(1,Math.ceil(matches.length/pageSize));STMT.page=Math.max(0,Math.min(STMT.page||0,pages-1));
 const shown=STMT.exportAll?matches:matches.slice(STMT.page*pageSize,(STMT.page+1)*pageSize);
 const rows=shown.map(e=>{const source=e.kind==='order'?docs.get(e.src):e.kind==='pur'?purchases.get(e.src):null;const label=e.kind==='order'?'فاتورة مبيعات':e.kind==='pur'?'فاتورة وارد':e.kind==='pay'?'دفعة على المستند':e.kind==='tre'?'سند خزينة':e.kind==='service'?'خدمة':'قيد تسوية';const key=escapeHtml(String(e.seq));return `<article class="stmt-entry ${source?'order-entry'+((source.lines?.length||1)>8?' long-order':''):''} border rounded-xl mb-3 overflow-hidden"><div class="stmt-main701"><div class="stmt-row"><span><b>${escapeHtml(label)} ${escapeHtml(e.ref||'')}</b></span><span>${escapeHtml(e.date||'')} ${escapeHtml(e.time||'')}</span><span class="stmt-desc" title="${escapeHtml(e.desc||'')}">${escapeHtml(e.desc||'')}</span>${e.kind==='order'?statementCompactDiscount(source):''}<span>${isC?'مدين':'مستحق'}: <b>${formatCurrency(e.debit)}</b></span><span>سداد: <b>${formatCurrency(e.credit)}</b></span><span>الرصيد: <b>${stmtBal(e.bal,isC)}</b></span></div><div class="stmt-side701 no-print"><button type="button" class="no-print stmt-open stmt-source701 act-btn-sky" title="فتح المستند الأصلي" aria-label="فتح المستند الأصلي" data-act-tip="فتح المستند" data-statement-seq="${key}" onclick="statementOpenEntry(Number(this.dataset.statementSeq))"><i class="fa-solid fa-up-right-from-square"></i><span>فتح المستند الأصلي</span></button>${source?`<button type="button" class="stmt-detail-toggle701" aria-expanded="${window.isStatementEntryExpanded164(e)}" aria-controls="stmt-lines701-${key}" onclick="window.toggleStmtDetails701(this)">تفاصيل أصناف الفاتورة</button>`:''}</div></div>${source?`<details id="stmt-lines701-${key}" class="stmt-fold" data-stmt-seq="${key}" data-stmt-src="${escapeHtml(String(e.src||''))}" ${window.isStatementEntryExpanded164(e)?'open':''} ontoggle="window.toggleStatementEntryDetails164(${Number(e.seq)},'${escapeHtml(String(e.src||''))}',this.open)"><summary class="no-print">تفاصيل أصناف الفاتورة</summary><div class="p-3">${statementLineTable(source,e.kind==='pur')}</div></details>`:''}${e.kind==='adj'&&isAdm()?`<div class="no-print flex items-center gap-2 p-2.5"><button type="button" onclick="stmtEditAdj('${e.src}')" title="تعديل القيد / التسوية" aria-label="تعديل التسوية" data-act-tip="تعديل التسوية" class="act-icon-btn act-btn-amber"><i class="fa-solid fa-pen-to-square"></i></button><button type="button" onclick="stmtDelAdj('${e.src}')" title="حذف القيد / التسوية" aria-label="حذف التسوية" data-act-tip="حذف التسوية" class="act-icon-btn act-btn-rose"><i class="fa-solid fa-trash-can"></i></button></div>`:''}</article>`;}).join('');
 const summary=`<div class="grid grid-cols-2 gap-4 p-3 rounded-xl border border-slate-300"><div>رصيد بداية الفترة: <b>${stmtBal(c.open,isC)}</b></div><div>رصيد نهاية الفترة كاملة: <b>${stmtBal(c.close,isC)}</b></div></div>`;
 const comboHtml=buildRowSizeCombo160('statementMovements',pageSize,'setStatementPageSize');
 frame.className='statement-detail-area';frame.innerHTML=`<div class="no-print flex flex-wrap items-center justify-between gap-3 p-2"><button onclick="stmtPage(-1)" ${STMT.page===0?'disabled':''}>السابق في الحركات</button><div class="flex items-center gap-2"><label for="statementMovementsPageSize" class="font-bold">عدد الصفوف:</label>${comboHtml}</div><span>صفحة ${STMT.page+1} / ${pages} — ${matches.length} حركة. PDF يشمل كل النتائج.</span><button onclick="stmtPage(1)" ${STMT.page===pages-1?'disabled':''}>التالي في الحركات</button></div>`+summary+(STMT.query?`<p class="p-3 bg-amber-50 text-amber-900 border rounded-lg text-xs">نتائج البحث: ${matches.length} من ${c.rows.length} حركة. الأرصدة التراكمية تخص الحساب الأصلي؛ بطاقات الملخص والرصيد الختامي تخص الفترة كاملة وليست نتائج البحث فقط.</p>`:'')+(rows||'<p class="p-5 text-center text-slate-500">لا توجد حركات مطابقة.</p>')+`<div class="grid grid-cols-3 gap-3 p-3 border-2 border-slate-500 rounded-xl font-bold"><div>إجمالي مدين للفترة<br>${formatCurrency(c.tD)}</div><div>إجمالي دائن للفترة<br>${formatCurrency(c.tC)}</div><div>الرصيد الختامي للفترة<br>${stmtBal(c.close,isC)}</div></div>`;
 if(!isC){sheet.querySelectorAll('.stmt-kpi').forEach(e=>{if(e.textContent.includes('إجمالي مدين'))e.firstElementChild.textContent='فواتير ومستحقات المورد';if(e.textContent.includes('إجمالي دائن'))e.firstElementChild.textContent='دفعات وتسويات للمورد';});}
};
function statementPreviewDoc(kind,id){if(kind==='order')previewInvoice(id);else if(can('pur_edit'))openEditPurchase(id);else showToast('تفاصيل الوارد ظاهرة في الكشف؛ ليست لديك صلاحية التعديل','info');}
const oldViewStatement=viewStatement;viewStatement=function(type,id){const r=oldViewStatement(type,id);STMT.query='';STMT.details=false;STMT.expanded={};STMT.expandedIds={};renderStatement();return r;};
// Physical printing, like PDF, includes all matching movements instead of only the screen page.
const printStatementV11=printStatement;
printStatement=function(){if(appState.isLocked||!can(STMT.type==='client'?'cli_statement':'sup_statement'))return permDeny();STMT.exportAll=true;try{renderStatement();return printStatementV11();}finally{STMT.exportAll=false;renderStatement();}};

function statementOpenEntry(seq){
 if(appState.isLocked||!can(STMT.type==='client'?'cli_statement':'sup_statement'))return permDeny();
 const entry=stmtCompute()?.rows.find(e=>e.seq===seq);if(!entry)return;
 const kind=entry.sourceKind||entry.kind,id=entry.src;
 if(kind==='order'){if(can('inv_print'))return previewInvoice(id);}
 const collection=kind==='order'?appState.orders:kind==='pur'?appState.purchases:kind==='service'?appState.services:kind==='tre'?appState.treasury:appState.adjustments;
 const source=collection?.find(x=>x.id===id);if(!source)return showToast('المستند الأصلي غير موجود','warning');
 gid('statementOriginalModal')?.remove();const modal=document.createElement('div');modal.id='statementOriginalModal';modal.className='fixed inset-0 bg-black/60 flex items-center justify-center p-4';modal.style.zIndex='9999';
 const field=(title,value)=>`<div class="border rounded-lg p-3"><b>${escapeHtml(title)}</b><p>${escapeHtml(String(value??'—'))}</p></div>`;
 const amount=kind==='tre'?Number(source.inAmount||source.outAmount):kind==='service'?source.amount:source.total;
 modal.innerHTML=`<section role="dialog" aria-modal="true" aria-label="المستند الأصلي" class="bg-white text-slate-800 rounded-2xl p-5 w-full max-w-4xl max-h-[90vh] overflow-auto"><div class="flex justify-between items-center mb-4"><h2 class="font-bold text-xl">المستند الأصلي — ${escapeHtml(entry.ref||'')}</h2><button type="button" class="border rounded-lg p-2" onclick="gid('statementOriginalModal').remove()">إغلاق ✕</button></div><p class="mb-3">${escapeHtml(entry.desc)}</p><div class="grid grid-cols-2 gap-3">${field('الطرف',stmtCompute().d.party.name)}${field('التاريخ',source.date)}${field('رقم المستند',source.orderNo||source.id)}${field('الإجمالي / مبلغ السند',formatCurrency(amount||0))}${kind==='adj'?field('مدين',formatCurrency(source.debit||0))+field('دائن',formatCurrency(source.credit||0)):''}${source.paid!=null?field('المدفوع',formatCurrency(source.paid)):''}${field('البيان / الملاحظات',source.desc||source.notes||source.title||source.specs||entry.desc)}${source.user?field('المستخدم',source.user):''}</div>${kind==='pur'||kind==='order'?statementLineTable(source,kind==='pur'):''}${entry.kind==='pay'?'<p class="mt-3">هذه الدفعة مسجلة ضمن المستند الأصلي المعروض.</p>':''}</section>`;
 document.body.append(modal);modal.querySelector('button').focus();modal.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();modal.remove();}});
}
// Extend the existing per-mode color settings; custom colors remain separate from print styling.
CLR_GROUPS.push(['مجلد الخطوط والشعار وتنظيف السجلات','fa-palette',[
 ['resourceBg','خلفية قسم مجلد الخطوط والشعار','bg',['#resourcePanel']],
 ['resourceTx','لون كتابة قسم مجلد الخطوط والشعار','color',['#resourcePanel','#resourcePanel h3','#resourcePanel p','#resourcePanel label']],
 ['cleanupBg','خلفية قسم تنظيف السجلات','bg',['#cleanupSettingsCard']],
 ['cleanupTx','لون كتابة قسم تنظيف السجلات','color',['#cleanupSettingsCard','#cleanupSettingsCard h3','#cleanupSettingsCard p','#cleanupSettingsCard label']]
]]);
const statementColors=CLR_GROUPS.find(g=>g[2].some(r=>r[0]==='stmtAdjBg'));
if(statementColors)statementColors[2].push(['stmtEntryBg','خلفية حركات وفواتير الكشف','bg',['#stmtCard .stmt-entry']],['stmtEntryTx','كتابة حركات وفواتير الكشف','color',['#stmtCard .stmt-entry','#stmtCard .stmt-entry b','#stmtCard .stmt-entry span','#stmtCard .stmt-entry td','#stmtCard .stmt-entry th']]);
applyUi();
