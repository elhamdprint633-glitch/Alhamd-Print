/* 1.4.9 operations use the original ledger and one transactional invoice commit. */
(()=>{'use strict';const $=id=>document.getElementById(id),M=Operations149,E=v=>escapeHtml(String(v??'')),uid=p=>p+'_'+crypto.randomUUID(),clone=x=>JSON.parse(JSON.stringify(x));
let pane='jobs',query='',page=0,splitDraft=null,editSource=null;
const arrays=['shifts149','reservations149','waste149','costs149','pricing149'];
function initData(){for(const k of arrays)if(!Array.isArray(appState[k]))appState[k]=[];}
const allowed=k=>!appState.isLocked&&can(k),guard=k=>allowed(k)||permDeny();
function commit(action,fn){initData();const previous=JSON.stringify(appState);try{fn();(appState.auditLog||=[]).push({at:new Date().toISOString(),user:getCurrentUser()?.name||'',action});saveState();}catch(e){appState=JSON.parse(previous);throw e;}}
function button(label,fn,primary=false){const b=document.createElement('button');b.type='button';b.textContent=label;if(primary)b.className='primary149';b.onclick=()=>{try{const r=fn();if(r?.catch)r.catch(error);}catch(e){error(e);}};return b;}
function iconBtn(label,iconCls,colorCls,fn,disabled=false){const b=document.createElement('button');b.type='button';b.className='act-icon-btn '+colorCls+(disabled?' act-slot-disabled':'');b.title=label;b.setAttribute('aria-label',label);b.dataset.actTip=label;b.innerHTML='<i class="'+iconCls+'"></i>';if(disabled){b.disabled=true;}else{b.onclick=ev=>{ev.stopPropagation();try{const r=fn();if(r?.catch)r.catch(error);}catch(e){error(e);}};}return b;}
function cellNode(text,cls=''){const s=document.createElement('span');if(cls)s.className=cls;s.textContent=String(text??'');return s;}
function stageBadge149(stage){const st=String(stage||'قيد التنفيذ');const s=document.createElement('span');let cls='bg-amber-100 text-amber-800 border-amber-200',ic='fa-spinner';if(st==='تم التسليم'){cls='bg-emerald-100 text-emerald-800 border-emerald-200';ic='fa-check-double';}else if(st==='جاهز للتسليم'){cls='bg-blue-100 text-blue-800 border-blue-200';ic='fa-box-open';}else if(st==='التشطيب'){cls='bg-indigo-100 text-indigo-800 border-indigo-200';ic='fa-wand-magic-sparkles';}else if(st==='الطباعة'){cls='bg-sky-100 text-sky-800 border-sky-200';ic='fa-print';}s.className='px-2.5 py-1 text-[11px] font-bold rounded-full border inline-flex items-center justify-center gap-1 '+cls;s.innerHTML='<i class="fa-solid '+ic+' text-[10px]"></i><span>'+E(st)+'</span>';return s;}
function error(e){const msg=e?.message||String(e);const box=$('opsError149');if(box)box.textContent=msg;if(typeof showToast==='function')showToast(msg,'danger');}
function field(host,label,type='text',value='',opts=[]){const l=document.createElement('label');l.textContent=label;const x=document.createElement(type==='select'?'select':type==='textarea'?'textarea':'input');if(x.tagName==='INPUT')x.type=type;for(const o of opts){const a=document.createElement('option');a.value=typeof o==='object'?o.value:o;a.textContent=typeof o==='object'?o.label:o;x.append(a);}x.value=value??'';if(type==='number'){x.min='0';x.step='any';}if(type==='textarea')x.rows=3;l.append(x);host.append(l);return x;}
function choice(host,label,value=false){const l=document.createElement('label');l.className='ops-choice149';const i=document.createElement('input');i.type='checkbox';i.checked=value;l.append(i,document.createTextNode(label));host.append(l);return i;}
function box(cls='ops-grid149'){const n=document.createElement('div');n.className=cls;return n;}
function modal(title){$('operationsModal149')?.remove();const o=document.createElement('div');o.id='operationsModal149';o.className='ops-modal149 ops149';o.dataset.noWindowTools150='1';const d=document.createElement('section');d.className='ops-dialog149 dialog-card144';d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.setAttribute('aria-label',title);const head=document.createElement('header');head.className='dialog-head144';const h=document.createElement('h3');h.textContent=title;const close=()=>o.remove();const navGroup=document.createElement('div');navGroup.className='floating-win-nav162 no-print inline-flex items-center gap-1.5 shrink-0';const backBtn=button('رجوع ↩',()=>{if(typeof window.goBackFloatingWindow162==='function')window.goBackFloatingWindow162(o);else close();});backBtn.dataset.winBack='1';backBtn.className='win-back-btn162 px-2.5 py-1 rounded-lg border text-xs font-bold inline-flex items-center gap-1';backBtn.title='الرجوع إلى النافذة السابقة أو القسم السابق';const closeBtn=button('إغلاق ✕',close);closeBtn.dataset.winClose='1';closeBtn.className='win-close-btn162 px-2.5 py-1 rounded-lg border text-xs font-bold inline-flex items-center gap-1';closeBtn.title='قفل وإغلاق النافذة';navGroup.append(backBtn,closeBtn);head.append(h,navGroup);const body=box('ops-body149');const err=document.createElement('div');err.id='opsError149';err.className='ops-error149';err.setAttribute('role','alert');d.append(head,body,err);o.append(d);document.body.append(o);o.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();close();}});closeBtn.focus();return {o,body,close};}
window.confirmModal=function(title,message,run){const m=modal(title),p=document.createElement('p');p.textContent=message;m.body.append(p,actions(button('متابعة',()=>{m.close();run();},true),button('إلغاء',m.close)));};
const methods=()=>[...new Set(['نقدي',...(ss().paymentMethods||[]),'بطاقة بنكية','تحويل بنكي','محفظة إلكترونية','إنستا باي','شيك','أخرى'])];
const records=()=>[...appState.items.map(i=>({value:'stock:'+i.id,label:i.name,record:i})),...(appState.serviceCatalog||[]).map(i=>({value:'service:'+i.id,label:i.name,record:i}))];
const order=id=>appState.orders.find(o=>o.id===id),spec=row=>{try{return JSON.parse(row.dataset.spec149||'{}');}catch{return{};}};
function setup(){initData();if(!$('view-operations')){const v=document.createElement('section');v.id='view-operations';v.className='tab-view hidden ops149 space-y-4';v.innerHTML='<div class="ops-main-card161 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-3"><div class="flex flex-wrap items-center justify-between gap-3"><div><h2 class="text-base font-black text-slate-900">التشغيل والتطوير</h2><p class="text-xs text-slate-500">متابعة الطلبات، الخامات، الكاشير وحماية الملفات — بنفس حسابات الحمد برنت.</p></div></div><div id="opsTopRow149" class="ops-top-row149 flex items-center justify-between gap-2 flex-nowrap"><div id="opsTabs149" class="ops-tabs149"></div><div id="opsTopSearchGroup149" class="ops-top-search149 flex items-center gap-1.5 shrink-0"><input id="opsSearch149" type="search" placeholder="ابحث في القسم الحالي…"><button id="opsRefresh149" type="button">تحديث</button></div></div><div id="opsMainToolbar149" class="ops-toolbar149"><div id="opsPaneActions149" class="ops-pane-actions149"></div></div><div id="opsContent149" class="space-y-3"></div></div>';$('view-orders').before(v);const source=document.querySelector('.nav-btn[data-tab="orders"]'),nav=source.cloneNode(true);nav.id='opsNav149';nav.dataset.tab='operations';nav.setAttribute('onclick',"switchTab('operations')");nav.setAttribute('aria-label','التشغيل والتطوير');nav.querySelector('.sb-label').textContent='التشغيل والتطوير';nav.querySelector('i').className='fa-solid fa-diagram-project w-4';nav.querySelectorAll('.sb-badge').forEach(x=>x.remove());source.after(nav);$('opsSearch149').oninput=()=>{query=$('opsSearch149').value;page=0;render();};$('opsRefresh149').onclick=render;}
 $('opsNav149').classList.toggle('hidden',!can('tab_operations'));ensureInvoice();decorate();}
const panes=[['jobs','التشغيل والملفات'],['pricing','التسعير والباركود'],['shifts','ورديات الكاشير'],['reservations','حجز الخامات'],['waste','الهالك والتكاليف'],['alerts','التنبيهات'],['audit','سجل المراجعة']];
function render(){setup();if(!allowed('tab_operations'))return;$('opsTabs149').replaceChildren(...panes.map(([k,t])=>{const b=button(t,()=>{pane=k;page=0;render();});b.setAttribute('aria-selected',String(k===pane));return b;}));const host=$('opsContent149');host.replaceChildren();$('opsPaneActions149')?.replaceChildren();if(appState.isLocked)return;({jobs:renderJobs,pricing:renderPricing,shifts:renderShifts,reservations:renderReservations,waste:renderWaste,alerts:renderAlerts,audit:renderAudit}[pane])(host);if(typeof window.decorateAlphaSortButtonsInToolbars162==='function')window.decorateAlphaSortButtonsInToolbars162();}
window.__setOpsPageSize153=function(tableKey,val){
 const raw=String(val||'').trim();
 const n=raw==='all'?999999:Math.max(1,Math.min(5000,parseInt(raw,10)||40));
 try{if(!appState.shopSettings)appState.shopSettings={};if(!appState.shopSettings.ui)appState.shopSettings.ui={};if(!appState.shopSettings.ui.tablePageSizes)appState.shopSettings.ui.tablePageSizes={};appState.shopSettings.ui.tablePageSizes[tableKey]=n;saveState(false);}catch(_){}
 page=0;render();
};
function getOpsPageSize153(tableKey){
 const saved=Number(appState?.shopSettings?.ui?.tablePageSizes?.[tableKey]);
 if(Number.isFinite(saved)&&saved>=1)return saved;
 if(typeof getDataPageSize==='function'){const s=Number(getDataPageSize(tableKey));if(Number.isFinite(s)&&s>=1)return s;}
 return 25;
}
function list(host,headers,rows,draw){const sizeKey='opsTable149_'+pane,ps=getOpsPageSize153(sizeKey);let filtered=rows.filter(x=>!query||smartMatch(JSON.stringify(x),query));if(typeof PAGE_STATE!=='undefined'){const st0=PAGE_STATE[sizeKey]||={page:0};st0.raw=rows;}if(typeof tableApply==='function'&&typeof TABLE_DEFS!=='undefined'&&TABLE_DEFS[sizeKey]){try{filtered=tableApply(sizeKey,filtered);}catch{}}if(typeof PAGE_STATE!=='undefined'){const st=PAGE_STATE[sizeKey]||={page:0};st.raw=rows;st.all=filtered;st.pageSize=ps;st.render=render;}const toolsHost=document.createElement('div');toolsHost.id=sizeKey+'ToolsHost';toolsHost.className='ops-table-tools-host163';const wrap=box('ops-tablewrap149 overflow-x-auto rounded-xl border border-slate-200'),table=document.createElement('table');table.className='ops-table149 w-full text-xs text-center';table.id=sizeKey+'_table';table.innerHTML='<thead class="bg-slate-100 text-slate-600 font-bold uppercase"><tr>'+headers.map(h=>'<th class="p-3 text-center">'+E(h)+'</th>').join('')+'</tr></thead><tbody id="'+sizeKey+'" class="divide-y divide-slate-100"></tbody>';table.dataset.export150='1';table.exportRows150=()=>'<table><thead><tr>'+headers.filter(h=>!/^إجراء/.test(h)).map(h=>'<th>'+E(h)+'</th>').join('')+'</tr></thead><tbody>'+filtered.map(r=>'<tr>'+draw(r).map((v,i)=>({v,i})).filter(({i})=>!/^إجراء/.test(headers[i]||'')).map(({v})=>'<td>'+E(v instanceof Node?v.textContent:v)+'</td>').join('')+'</tr>').join('')+'</tbody></table>';const body=table.tBodies[0];const totalPages=Math.max(1,Math.ceil(filtered.length/ps));page=Math.max(0,Math.min(page,totalPages-1));for(const r of filtered.slice(page*ps,page*ps+ps)){const tr=document.createElement('tr');tr.className='hover:bg-slate-50 transition border-b border-slate-100';if(pane==='jobs'&&r?.id){tr.dataset.openable='1';tr.tabIndex=0;tr.setAttribute('aria-label','فتح تفاصيل أمر التشغيل والفاتورة المصدر');const openRow=()=>job(r.id);tr.addEventListener('click',ev=>{if(ev.target.closest('button,a,input,select,textarea'))return;openRow();});tr.addEventListener('keydown',ev=>{if((ev.key==='Enter'||ev.key===' ')&&!ev.target.closest('button,a,input,select,textarea')){ev.preventDefault();openRow();}});}for(const value of draw(r)){const td=document.createElement('td');td.className='py-2.5 px-3 text-center align-middle';if(value instanceof Node)td.append(value);else td.textContent=value??'';tr.append(td);}body.append(tr);}if(!filtered.length)body.innerHTML='<tr><td colspan="'+headers.length+'" class="p-8 text-center text-slate-400">لا توجد سجلات مطابقة.</td></tr>';wrap.append(table);const pages=box('ops-toolbar149');pages.dataset.opsPager='1';const sizeWrap=document.createElement('div');sizeWrap.className='inline-flex items-center gap-2';if(typeof window.buildRowSizeCombo160==='function'){sizeWrap.innerHTML='<span class="text-xs font-bold">عدد الصفوف:</span>'+window.buildRowSizeCombo160(sizeKey,ps,'window.__setOpsPageSize153');}else{sizeWrap.innerHTML='<span class="text-xs font-bold">عدد الصفوف:</span><input type="text" inputmode="numeric" value="'+(ps>=999999?'الكل':ps)+'" class="w-20 px-2 py-1 rounded border text-center font-bold text-xs" onchange="window.__setOpsPageSize153(\''+sizeKey+'\',this.value)">';}pages.append(button('السابق',()=>{page=Math.max(0,page-1);render();}),document.createTextNode((page+1)+' / '+totalPages+' — '+filtered.length+' سجل'),button('التالي',()=>{if((page+1)*ps<filtered.length){page++;render();}}),sizeWrap);host.append(toolsHost,wrap,pages);if(typeof tableTools==='function'&&typeof TABLE_DEFS!=='undefined'&&TABLE_DEFS[sizeKey]){tableTools(sizeKey,toolsHost);}if(typeof window.decorateSortableFilterableTableHeaders163==='function'){window.decorateSortableFilterableTableHeaders163(sizeKey,table);}window.Alhamd148UI?.scanTables();}
function actions(...items){const d=box('ops-toolbar149');d.append(...items);return d;}
function rowActions(...items){const d=box('act-icon-grid ops-row-actions149');d.append(...items);return d;}
function paneActions(host,...items){const p=$('opsPaneActions149');if(p){p.replaceChildren(...items);return p;}const d=box('ops-toolbar149');d.append(...items);host.append(d);return d;}
function renderJobs(h){
 const today=typeof todayStr==='function'?todayStr():new Date().toISOString().slice(0,10);
 paneActions(h,
  button('تقرير أوامر التشغيل لليوم (صورة / PDF)',()=>dailyOpsReportModal153(),true),
  button('استخراج تقرير اليوم صورة PNG مباشرة',()=>openDailyOpsReportPaper153({mode:'today_or_active',date:today,autoAction:'image'})),
  button('استخراج تقرير اليوم PDF مباشرة',()=>openDailyOpsReportPaper153({mode:'today_or_active',date:today,autoAction:'pdf'})),
  button('إعدادات ورقة التشغيل',()=>sheetOptions())
 );
 list(h,['الفاتورة','العميل','الشغل','موعد التسليم','مرحلة التشغيل','المسؤول','إجراءات'],appState.orders.slice().reverse(),o=>[
  cellNode('#'+o.orderNo,'font-bold text-teal-700 font-mono'),
  cellNode(o.clientName,'font-bold text-slate-900'),
  cellNode(o.jobType,'font-semibold text-slate-800'),
  cellNode(o.deliveryDate||'—','font-mono font-semibold text-slate-600'),
  stageBadge149(o.ops149?.stage||o.status),
  cellNode(o.ops149?.assignee||'—','font-semibold text-slate-600'),
  rowActions(
   iconBtn('تفاصيل التشغيل','fa-solid fa-sliders','act-btn-indigo',()=>job(o.id)),
   iconBtn('إعادة الطلب','fa-solid fa-rotate-right','act-btn-amber',()=>repeat(o.id)),
   iconBtn('ورقة تشغيل','fa-solid fa-clipboard-list','act-btn-sky',()=>sheet(o.id)),
   iconBtn('الفاتورة','fa-solid fa-print','act-btn-teal',()=>previewInvoice(o.id))
  )
 ]);
}
function job(id){if(!guard('record_view'))return;const o=order(id);if(!o)throw Error('الفاتورة غير موجودة');const m=modal('تشغيل الفاتورة #'+o.orderNo),meta=box(),stage=field(meta,'المرحلة','select',o.ops149?.stage||(o.status==='تم التسليم'?'تم التسليم':'انتظار التصميم'),M.stages),person=field(meta,'المسؤول','text',o.ops149?.assignee),date=field(meta,'موعد التسليم','date',o.deliveryDate),note=field(m.body,'ملاحظة مرحلة التشغيل','textarea','');m.body.prepend(meta);m.body.append(button('حفظ المرحلة والمسؤول',()=>{if(!guard('ops_manage')||!guard('inv_status'))return;if(!M.stages.includes(stage.value))throw Error('مرحلة غير صالحة');commit('تحديث تشغيل #'+o.orderNo,()=>{o.ops149||={history:[]};o.ops149.stage=stage.value;o.ops149.assignee=M.text(person.value,100);o.ops149.history||=[];o.ops149.history.push({at:new Date().toISOString(),stage:stage.value,user:getCurrentUser().name,note:M.text(note.value,1000)});o.deliveryDate=date.value;o.status=stage.value==='تم التسليم'?'تم التسليم':stage.value==='جاهز للتسليم'?'جاهز للتسليم':'قيد التنفيذ';});m.close();job(id);},true));const history=box('ops-timeline149');for(const e of (o.ops149?.history||[]).slice().reverse()){const p=document.createElement('p');p.textContent=e.at.slice(0,16).replace('T',' ')+' • '+e.stage+' • '+e.user+' • '+e.note;history.append(p);}m.body.append(history);
 const files=box('ops-card149');files.innerHTML='<h3>ملفات التصميم والاعتماد والتنفيذ</h3><p>تُنسخ الملفات إلى مجلد مرفقات البرنامج. النسخة الكاملة من مركز النسخ تشملها؛ النسخة الكاملة المشفرة تضم الملفات، أما ملفات JSON القديمة فكانت للبيانات فقط.</p>';for(const a of o.attachments149||[])files.append(actions(document.createTextNode(a.name+' • '+Math.max(1,Math.ceil((a.size||0)/1024))+' ك.ب'),button('فتح الملف',async()=>{if(!guard('ops_manage'))return;await openOpsAttachment163(id,a);}),button('فصل المرفق',()=>{if(!guard('ops_manage'))return;requireAdminPin('فصل المرفق من الطلب؛ تبقى نسخته في مجلد الملفات للأمان',()=>{commit('فصل مرفق',()=>o.attachments149=o.attachments149.filter(x=>x.id!==a.id));m.close();job(id);});})));files.append(button('إضافة ملفات',async()=>{if(!guard('ops_manage'))return;const result=await pickOpsAttachments163(id);if(result?.length){const fresh=order(id);commit('إرفاق ملفات #'+o.orderNo,()=>{fresh.attachments149||=[];fresh.attachments149.push(...result);});if(typeof showToast==='function')showToast('تم إرفاق '+result.length+' ملف بنجاح','success');m.close();job(id);}}));m.body.append(files);
 if(allowed('ops_cost')&&allowed('stock_cost')&&!ss().hideCosts&&!privHidden('costs')){const p=M.profit(appState,o),c=box('ops-card149');c.innerHTML='<h3>تكلفة الطلب وربحه</h3><p>'+(p?'خامات وخدمات مسجلة '+E(formatCurrency(p.stock))+' • تكاليف إضافية '+E(formatCurrency(p.extra))+' • هالك المطبعة '+E(formatCurrency(p.waste))+'<br>الربح التشغيلي '+E(formatCurrency(p.profit)):'الفاتورة قديمة: لم تُحفظ تكلفة خاماتها وقت البيع، لذلك لا يُعرض ربح تقديري على أنه فعلي.')+'</p><p>الربح التشغيلي قبل المصروفات العامة. سجّل تكاليف الخدمات الخارجية هنا مرة واحدة، ولا تضفها ثانية من المصروفات إذا اخترت قيد خزينة من هنا.</p>';m.body.append(c);}m.body.append(actions(button('ورقة التشغيل',()=>sheet(id)),button('الفاتورة',()=>{m.close();previewInvoice(id);}),button('إعادة طلب بنفس المواصفات',()=>{m.close();repeat(id);})));
}
function repeat(id){if(!guard('inv_create'))return;const o=order(id);if(!o)return;confirmModal('إعادة طلب سابق','سيُفتح طلب جديد بنفس المواصفات وبأسعار السجلات الحالية. راجع الكميات والأسعار؛ لن يتم الحفظ أو الخصم الآن.',()=>{const d=clone(o);for(const l of d.lines||[]){const r=l.itemId?appState.items.find(x=>x.id===l.itemId):(appState.serviceCatalog||[]).find(x=>x.id===l.serviceCatalogId);if((l.itemId||l.serviceCatalogId)&&!r){l.kind='service';delete l.itemId;delete l.serviceCatalogId;}if(r)l.price=Number(l.itemId?r.sellPrice:r.price)||0;l.discount=0;l.discountValue=0;}
 d.invDiscount=0;d.discountValue=0;d.deliveryDate='';loadDocToComposer(d,{src:null,title:'إعادة طلب من #'+o.orderNo,badge:'#'+nextOrderNo(),status:'قيد التنفيذ',keepDate:false});editSource=null;splitDraft=null;ensureInvoice();for(const row of $('saleLines').children){row.dataset.autoPrice='1';applyTier(row,true);}calcSale();showToast('طلب جديد غير محفوظ — راجع الأسعار، والتجهيز والحد الأدنى من أداة التسعير','info');});}
function specText(s){return M.specFields.filter(([k])=>s.visible?.[k]&&M.text(s[k])).map(([k,label])=>label+': '+M.text(s[k])).join(' • ');}
function decorate(){for(const row of document.querySelectorAll('#saleLines .sale-line')){if(!row.querySelector('.spec-button149')){const b=button('المواصفات',()=>editSpecs(row));b.className='spec-button149 sl-quick-btn163';const actHost=row.firstElementChild?.querySelector('div:first-child > span, .sl-head-actions163')||row.firstElementChild?.querySelector('div:first-child');actHost?.append(b);}row.dataset.spec149||='{}';}}
function editSpecs(row){if(!guard(EDIT.order?'inv_edit':'inv_create'))return;const m=modal('مواصفات بند الطباعة'),s=spec(row),grid=box();const values={},toggles={};for(const[k,label]of M.specFields){const cell=box('ops-card149');toggles[k]=choice(cell,'إظهار '+label+' بالفاتورة',s.visible?.[k]??false);values[k]=field(cell,label,'text',s[k]);grid.append(cell);}const other=box(),colors=field(other,'عدد ألوان الطباعة للتسعير','number',s.colors||1),sides=field(other,'عدد الأوجه للتسعير','select',s.sidesCount||1,['1','2']);m.body.append(grid,other,button('تطبيق المواصفات',()=>{const v={visible:{},colors:Math.max(1,Math.min(20,Number(colors.value)||1)),sidesCount:Number(sides.value)};for(const[k]of M.specFields){v[k]=M.text(values[k].value);v.visible[k]=toggles[k].checked;}row.dataset.spec149=JSON.stringify(v);applyTier(row,true);calcSale();m.close();},true));}
function applyTier(row,force=false){const key=row.querySelector('.sl-picker')?.value,r=(appState.pricing149||[]).find(x=>x.ref===key&&x.enabled!==false);if(!r||(!force&&row.dataset.autoPrice!=='1'&&row.dataset.tier149!=='1'))return;const s=spec(row),p=M.price(r,Number(row.querySelector('.sl-qty').value),Number(s.colors)||1,Number(s.sidesCount)||1);if(p!==null){row.querySelector('.sl-price').value=p;row.dataset.autoPrice='1';row.dataset.tier149='1';}}
function ensureInvoice(){if(!$('invoiceTools149')){const tools=box('ops-invoice-tools149');tools.id='invoiceTools149';tools.append(button('تطبيق التسعير والتجهيز',applyPricing),button('توزيع المدفوع',paymentEditor),button('إعداد ورقة التشغيل',()=>sheetOptions()));$('saleLines').before(tools);const split=box('ops-split149');split.id='paymentSummary149';split.hidden=true;($('salePaid')?.closest('#salePaidRow163')||$('salePaid')?.parentElement?.parentElement||$('salePaid')?.closest('div'))?.after(split);}paintPayments();}
function paymentEditor(){if(!guard(EDIT.order?'inv_edit':'inv_create'))return;const m=modal('توزيع المبلغ المدفوع على طرق الدفع'),rows=box('ops149'),hint=document.createElement('p');hint.textContent='المجموع يُكتب في خانة المدفوع ويُسجل كل جزء في خزينته. لا توجد حركة خزينة قبل حفظ الفاتورة.';const draft=clone(splitDraft||[{method:$('salePaymentMethod144')?.value||'نقدي',amount:readSale().paid}]);const controls=[];function add(v={}){const r=box('ops-toolbar149'),method=field(r,'طريقة الدفع','select',v.method||methods()[0],methods()),amount=field(r,'المبلغ','number',v.amount||'');const entry={r,method,amount};controls.push(entry);r.append(button('إزالة',()=>{controls.splice(controls.indexOf(entry),1);r.remove();}));rows.append(r);}draft.forEach(add);m.body.append(hint,rows,button('+ طريقة أخرى',()=>add()),button('اعتماد التوزيع',()=>{const v=controls.map(x=>({method:x.method.value,amount:x.amount.value}));const total=M.money(v.reduce((s,x)=>s+M.positive(x.amount,'المبلغ'),0));splitDraft=M.split(v,total);$('salePaid').value=total;calcSale();paintPayments();m.close();},true),button('إلغاء التقسيم واستخدام طريقة واحدة',()=>{splitDraft=null;paintPayments();m.close();}));}
function paintPayments(){const h=$('paymentSummary149');if(!h)return;h.hidden=!splitDraft?.length;h.textContent=splitDraft?.map(x=>x.method+': '+formatCurrency(x.amount)).join(' • ')||'';}
function readPayments(paid){return splitDraft?M.split(splitDraft,paid):[];}
function applyPricing(){if(!guard(EDIT.order?'inv_edit':'inv_create'))return;initData();let setup=0,minimum=0;for(const row of document.querySelectorAll('#saleLines .sale-line')){const r=appState.pricing149.find(x=>x.ref===row.querySelector('.sl-picker')?.value&&x.enabled!==false);if(!r)continue;applyTier(row,true);setup=M.money(setup+r.setup);minimum=Math.max(minimum,r.minimum);}for(const row of [...$('saleLines').children])if(row.dataset.fee149||spec(row).fee149)row.remove();if(setup>0)addFee('تكلفة تجهيز / شبلونة',setup);let c=calcSale();if(minimum>c.total){addFee('فرق الحد الأدنى لقيمة الطلب',M.money(minimum-c.total));const fee=$('saleLines').lastElementChild.querySelector('.sl-price');let low=0,high=Math.max(1,minimum*101);fee.value=high;if(calcSale().total<minimum){fee.value=0;calcSale();throw Error('الخصم العام يمنع الوصول للحد الأدنى؛ راجع نسبة الخصم ثم أعد تطبيق التسعير');}for(let i=0;i<32;i++){const mid=(low+high)/2;fee.value=mid;if(calcSale().total<minimum)low=mid;else high=mid;}fee.value=Math.ceil(high*100)/100;}calcSale();showToast('تم تطبيق الشرائح والتجهيز والحد الأدنى. راجع السعر النهائي قبل الحفظ.','success');}
function addFee(desc,value){const row=addSaleLine(false);row.dataset.fee149='1';row.dataset.spec149=JSON.stringify({fee149:true});row.querySelector('.sl-picker').value='__manual__';onInvoiceItemSelect(row.querySelector('.sl-picker'));row.querySelector('.sl-desc-manual').value=desc;onInvoiceManualDesc(row.querySelector('.sl-desc-manual'));row.querySelector('.sl-qty').value=1;row.querySelector('.sl-price').value=value;row.querySelector('.sl-kind').value='service';}
function renderPricing(h){paneActions(h,button('+ قاعدة تسعير',()=>pricingForm()),button('ربط باركود بصنف',barcodeForm),button('طباعة ملصقات الأكواد',labels));const p=document.createElement('p');p.textContent='الشرائح تعطي سعر الوحدة حسب الكمية وألوان الطباعة والأوجه. التجهيز والحد الأدنى يُضافان كبنود خدمة واضحة بأداة التسعير داخل الفاتورة.';h.append(p);list(h,['الصنف / الخدمة','شرائح الكمية','تجهيز','حد أدنى','الحالة','إجراءات'],appState.pricing149,r=>[cellNode(records().find(x=>x.value===r.ref)?.label||'منتج محذوف','font-bold text-slate-900'),cellNode(r.tiers.map(t=>t.min+'–'+(t.max??'∞')+': '+t.price).join(' | '),'font-mono text-slate-600'),cellNode(r.setup,'font-mono font-bold'),cellNode(r.minimum,'font-mono font-bold'),cellNode(r.enabled===false?'متوقف':'مفعّل',r.enabled===false?'px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800':'px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800'),rowActions(iconBtn('تعديل','fa-solid fa-pen-to-square','act-btn-amber',()=>pricingForm(r.id)),iconBtn(r.enabled===false?'تشغيل':'إيقاف',r.enabled===false?'fa-solid fa-play':'fa-solid fa-pause',r.enabled===false?'act-btn-emerald':'act-btn-rose',()=>{if(!guard('sets_invoice'))return;commit('تغيير قاعدة تسعير',()=>r.enabled=r.enabled===false);render();}))]);}
function pricingForm(id){if(!guard('sets_invoice'))return;const old=appState.pricing149.find(x=>x.id===id),m=modal('شرائح التسعير وتكلفة تجهيز الطلب'),g=box(),ref=field(g,'الصنف أو الخدمة','select',old?.ref||'', [{value:'',label:'اختر المنتج'},...records()]),extra=field(g,'زيادة سعر القطعة لكل لون بعد الأول','number',old?.extraColor||0),back=field(g,'زيادة سعر القطعة للطباعة على الظهر','number',old?.back||0),setup=field(g,'تجهيز / شبلونة مرة لكل بند','number',old?.setup||0),minimum=field(g,'الحد الأدنى لقيمة الطلب','number',old?.minimum||0);const tiers=box(),controls=[];function add(t={min:1,max:'',price:0}){const row=box(),min=field(row,'من كمية','number',t.min),max=field(row,'إلى كمية — فارغ بلا حد','number',t.max??''),price=field(row,'سعر الوحدة','number',t.price);const c={row,min,max,price};controls.push(c);row.append(button('حذف الشريحة',()=>{controls.splice(controls.indexOf(c),1);row.remove();}));tiers.append(row);}(old?.tiers||[{min:1,max:null,price:0}]).forEach(add);m.body.append(g,tiers,button('+ شريحة',()=>add()),button('حفظ قاعدة التسعير',()=>{if(!guard('sets_invoice'))return;if(!records().some(r=>r.value===ref.value))throw Error('اختر منتجاً موجوداً');const normalized=M.rule({id:old?.id||uid('price'),ref:ref.value,tiers:controls.map(x=>({min:x.min.value,max:x.max.value,price:x.price.value})),extraColor:extra.value,back:back.value,setup:setup.value,minimum:minimum.value,enabled:old?.enabled??true});if(!normalized.tiers.length)throw Error('أضف شريحة واحدة على الأقل');if(appState.pricing149.some(x=>x.ref===ref.value&&x.id!==old?.id))throw Error('للمنتج قاعدة بالفعل؛ عدّلها من الجدول');commit('حفظ قاعدة تسعير',()=>{if(old)Object.assign(old,normalized);else appState.pricing149.push(normalized);});m.close();render();},true));}
function barcodeForm(){if(!guard('stock_edit'))return;const m=modal('ربط كود المسح بالصنف'),g=box(),item=field(g,'الصنف','select','', [{value:'',label:'اختر الصنف'},...appState.items.map(i=>({value:i.id,label:i.name}))]),code=field(g,'الباركود — أو استخدم كود الصنف الحالي','text','');item.onchange=()=>code.value=appState.items.find(i=>i.id===item.value)?.barcode149||'';m.body.append(g,button('حفظ',()=>{if(!guard('stock_edit'))return;const i=appState.items.find(i=>i.id===item.value),v=M.text(code.value,80);if(!i||!v)throw Error('اختر الصنف واكتب الكود');if(!/^[\x20-\x7e]{1,80}$/.test(v))throw Error('استخدم أرقاماً وحروفاً إنجليزية للكود');if(appState.items.some(x=>x.id!==i.id&&(x.barcode149===v||x.code===v)))throw Error('الكود مستخدم لصنف آخر');commit('حفظ باركود',()=>i.barcode149=v);m.close();},true));}
function labels(){if(!guard('inv_print'))return;const m=modal('ملصقات الأصناف'),g=box(),item=field(g,'الصنف','select',appState.items[0]?.id||'',appState.items.map(i=>({value:i.id,label:i.name}))),qty=field(g,'عدد الملصقات','number',12);m.body.append(g,button('معاينة الملصقات',()=>{const i=appState.items.find(i=>i.id===item.value);if(!i)throw Error('اختر صنفاً');const code=M.text(i.barcode149||i.code,80);if(!/^[\x20-\x7e]{1,80}$/.test(code))throw Error('عيّن باركود إنجليزي أو رقمي أولاً');const n=Math.min(120,Math.floor(M.positive(qty.value,'عدد الملصقات',false)));const html='<h1>ملصقات '+E(i.name)+'</h1><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">'+Array.from({length:n},()=>'<div style="border:1px solid #94a3b8;text-align:center;padding:10px;break-inside:avoid"><b>'+E(i.name)+'</b><div>'+barcodeSVG(code)+'</div><small dir="ltr">'+E(code)+'</small></div>').join('')+'</div>';paper('ملصقات '+i.name,html);},true));}
// Code 128 B: complete ASCII printable alphabet, checksum and quiet zones.
const widths128=['212222','222122','222221','121223','121322','131222','122213','122312','132212','221213','221312','231212','112232','122132','122231','113222','123122','123221','223211','221132','221231','213212','223112','312131','311222','321122','321221','312212','322112','322211','212123','212321','232121','111323','131123','131321','112313','132113','132311','211313','231113','231311','112133','112331','132131','113123','113321','133121','313121','211331','231131','213113','213311','213131','311123','311321','331121','312113','312311','332111','314111','221411','431111','111224','111422','121124','121421','141122','141221','112214','112412','122114','122411','142112','142211','241211','221114','413111','241112','134111','111242','121142','121241','114212','124112','124211','411212','421112','421211','212141','214121','412121','111143','111341','131141','114113','114311','411113','411311','113141','114131','311141','411131','211412','211214','211232','2331112'];
function barcodeSVG(code){const data=[104,...Array.from(code,c=>c.charCodeAt(0)-32)];let sum=104;for(let i=1;i<data.length;i++)sum+=data[i]*i;data.push(sum%103,106);let x=10,bars='';for(const v of data){let black=true;for(const w of widths128[v]){const n=Number(w);if(black)bars+='<rect x="'+x+'" y="0" width="'+n+'" height="45"/>';x+=n;black=!black;}}return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+(x+10)+' 45" style="width:100%;height:45px;background:white" role="img" aria-label="باركود"><g fill="black">'+bars+'</g></svg>';}
function renderReservations(h){paneActions(h,button('+ حجز خامات لعرض سعر',reserveForm));const p=document.createElement('p');p.textContent='الحجز متاح لعروض الأسعار المؤكدة، ويقلل المتاح للبيع فقط. عند تحويل العرض إلى فاتورة يتحول الحجز تلقائياً إلى صرف المخزن المعتاد، دون خصم مزدوج.';h.append(p);list(h,['عرض السعر','العميل','الحالة','الخامات المحجوزة','إجراءات'],appState.reservations149.slice().reverse(),r=>{const q=(appState.quotes||[]).find(x=>x.id===r.quoteId);const isActive=r.status==='active'&&q&&!['تم التحويل','مرفوض'].includes(q.status);const stText=isActive?'محجوز':r.status==='consumed'?'تم الصرف':'محرر / ملغي';return[cellNode(q?'#Q'+q.no:'عرض محذوف','font-bold text-teal-700 font-mono'),cellNode(q?.clientName||'','font-bold text-slate-900'),cellNode(stText,isActive?'px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800':r.status==='consumed'?'px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800':'px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600'),cellNode((r.lines||[]).map(l=>(appState.items.find(i=>i.id===l.itemId)?.name||l.itemId)+': '+l.qty).join(' | '),'font-semibold text-slate-700'),rowActions(iconBtn('تحرير الحجز','fa-solid fa-unlock','act-btn-amber',()=>{if(!guard('ops_reserve'))return;confirmModal('تحرير الخامات','إلغاء الحجز فقط، دون تغيير الرصيد الفعلي؟',()=>{commit('تحرير حجز خامات',()=>r.status='released');render();});},!isActive))];});const cards=box('ops-cards149');for(const i of appState.items.filter(i=>M.reserved(appState,i.id)>0)){const c=box('ops-card149');c.textContent=i.name+' • فعلي '+i.qty+' • محجوز '+M.reserved(appState,i.id)+' • متاح '+M.money(i.qty-M.reserved(appState,i.id));cards.append(c);}h.append(cards);}
function reserveForm(){if(!guard('ops_reserve'))return;const m=modal('حجز خامات لطلب مؤكد'),quotes=(appState.quotes||[]).filter(q=>!['تم التحويل','مرفوض'].includes(q.status)),select=field(m.body,'عرض السعر المؤكد','select','',[{value:'',label:'اختر عرضاً'},...quotes.map(q=>({value:q.id,label:'#'+q.no+' '+q.clientName+' — '+q.jobType}))]);m.body.append(button('تأكيد الحجز',()=>{if(!guard('ops_reserve'))return;const q=quotes.find(x=>x.id===select.value),r=M.reserve(appState,q,uid('reservation'));commit('حجز خامات عرض سعر',()=>{appState.reservations149.filter(x=>x.quoteId===q.id&&x.status==='active').forEach(x=>x.status='released');appState.reservations149.push(r);});m.close();render();},true));}
function renderShifts(h){if(!allowed('ops_shift')){h.textContent='إدارة الورديات تحتاج صلاحية ورديات الكاشير.';return;}const active=appState.shifts149.find(s=>!s.closedAt);paneActions(h,button(active?'عرض وإقفال الوردية الحالية':'+ فتح وردية جديدة',()=>active?closeShift(active):openShift(),true));const p=document.createElement('p');p.textContent='رصيد البداية يُستخدم للمطابقة فقط ولا ينشئ إيراداً. المتوقع = البداية + صافي الحركات منذ الفتح، ويشمل أثر تعديل الحركات السابقة أثناء الوردية. يسمح البرنامج بوردية واحدة مفتوحة لكل قاعدة بيانات.';h.append(p);list(h,['المسؤول','الفتح','الإقفال','الفروق','إجراءات'],appState.shifts149.slice().reverse(),s=>[cellNode(s.user,'font-bold text-slate-900'),cellNode(s.openedAt.slice(0,16).replace('T',' '),'font-mono text-slate-600'),cellNode(s.closedAt?.slice(0,16).replace('T',' ')||'مفتوحة',s.closedAt?'font-mono text-slate-600':'px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800'),cellNode(s.closedAt?Object.entries(s.difference||{}).map(([k,v])=>k+': '+v).join(' | '):'—','font-mono font-semibold'),rowActions(iconBtn('تقرير الوردية','fa-solid fa-file-lines','act-btn-teal',()=>shiftReport(s)))]);}
function openShift(){if(!guard('ops_shift')||!guard('tab_treasury'))return;if(appState.shifts149.some(s=>!s.closedAt))throw Error('يوجد بالفعل وردية مفتوحة');const m=modal('فتح وردية الكاشير'),g=box(),inputs={};for(const name of new Set([...methods(),...Object.keys(M.wallet(appState))]))inputs[name]=field(g,'رصيد بداية '+name,'number',0);m.body.append(g,button('فتح الوردية',()=>{if(!guard('ops_shift')||!guard('tab_treasury'))return;if(appState.shifts149.some(s=>!s.closedAt))throw Error('تم فتح وردية بالفعل');const opening={};for(const[k,v]of Object.entries(inputs))opening[k]=M.positive(v.value,'رصيد البداية');commit('فتح وردية كاشير',()=>appState.shifts149.push({id:uid('shift'),user:getCurrentUser().name,userId:getCurrentUser().id,openedAt:new Date().toISOString(),opening,baseline:M.wallet(appState)}));m.close();render();},true));}
function closeShift(s){if(!guard('ops_shift')||!guard('tab_treasury'))return;const m=modal('مطابقة وإقفال الوردية'),expected=M.shiftExpected(s,appState),g=box(),actual={};for(const[k,v]of Object.entries(expected)){const c=box('ops-card149');const p=document.createElement('p');p.textContent=k+' — المتوقع '+formatCurrency(v);c.append(p);actual[k]=field(c,'الموجود فعلياً','number','');g.append(c);}const note=field(m.body,'ملاحظات الإقفال','textarea','');m.body.prepend(g);m.body.append(button('اعتماد الإقفال',()=>{if(!guard('ops_shift')||!guard('tab_treasury'))return;if(s.closedAt)throw Error('الوردية مقفولة بالفعل');const fresh=M.shiftExpected(s,appState);if(JSON.stringify(fresh)!==JSON.stringify(expected))throw Error('حدثت حركة مالية أثناء المطابقة؛ أغلق النافذة وأعد فتح المطابقة');const counted={},difference={};for(const k of Object.keys(expected)){if(actual[k].value==='')throw Error('أدخل الرصيد الفعلي لكل طريقة، حتى لو صفر');counted[k]=M.positive(actual[k].value,'الرصيد الفعلي');difference[k]=M.money(counted[k]-expected[k]);}commit('إقفال وردية كاشير',()=>Object.assign(s,{closedAt:new Date().toISOString(),closedBy:getCurrentUser().name,expected,counted,difference,note:M.text(note.value,1000)}));m.close();render();},true));}
function shiftReport(s){if(!guard('ops_shift')||!guard('tab_treasury'))return;const expected=s.closedAt?s.expected:M.shiftExpected(s,appState);paper('وردية '+s.user,'<h1>تقرير وردية الكاشير</h1><p>'+E(s.user)+' • '+E(s.openedAt)+'<br>'+E(s.closedAt||'مفتوحة')+'</p><table><thead><tr><th>طريقة الدفع</th><th>البداية</th><th>المتوقع</th><th>الفعلي</th><th>الفرق</th></tr></thead><tbody>'+Object.entries(expected).map(([k,v])=>'<tr><td>'+E(k)+'</td><td>'+E(s.opening[k]||0)+'</td><td>'+E(v)+'</td><td>'+E(s.counted?.[k]??'—')+'</td><td>'+E(s.difference?.[k]??'—')+'</td></tr>').join('')+'</tbody></table><p>'+E(s.note)+'</p><p>تقرير الإقفال لقطة وقت الاعتماد؛ تعديل الحركات لاحقاً لا يعيد كتابة هذه المطابقة. الفروق لا تُسجل كمصروف أو إيراد تلقائياً.</p>');}
function renderWaste(h){if(!allowed('ops_cost')&&!allowed('ops_waste')){h.textContent='تحتاج صلاحية التكاليف أو الهالك.';return;}paneActions(h,button('+ تسجيل هالك',wasteForm),button('+ تكلفة خارجية للطلب',costForm));list(h,['النوع','الفاتورة','البيان','الكمية / القيمة','على حساب','التاريخ','تصحيح'],[...appState.waste149.map(x=>({...x,type149:'هالك'})),...appState.costs149.map(x=>({...x,type149:'تكلفة'}))].reverse(),x=>[cellNode(x.type149,x.type149==='هالك'?'px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800':'px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800'),cellNode(order(x.orderId)?'#'+order(x.orderId).orderNo:'عام','font-bold text-teal-700 font-mono'),cellNode(x.reason||x.desc,'font-semibold text-slate-800'),cellNode(x.type149==='هالك'?x.qty:allowed('ops_cost')&&allowed('stock_cost')&&!ss().hideCosts?formatCurrency(x.amount):'••••','font-mono font-bold'),cellNode(x.chargedTo==='client'?'العميل — راجع تحصيلها':'المطبعة','text-slate-600'),cellNode(x.date,'font-mono text-slate-500'),rowActions(iconBtn(x.voidAt?'ملغى':'إلغاء بتسوية','fa-solid fa-rotate-left',x.voidAt?'act-btn-slate':'act-btn-rose',()=>voidRecord(x.type149,x.id),!!x.voidAt))]);}
function wasteForm(){if(!guard('ops_waste')||!guard('stock_adjust'))return;const m=modal('تسجيل هالك أو إعادة طباعة'),g=box(),job=field(g,'الفاتورة','select','',[{value:'',label:'هالك عام'},...appState.orders.slice().reverse().map(o=>({value:o.id,label:'#'+o.orderNo+' '+o.clientName}))]),item=field(g,'الخامة','select','',[{value:'',label:'اختر الخامة'},...appState.items.map(i=>({value:i.id,label:i.name+' — متاح '+M.money(i.qty-M.reserved(appState,i.id))}))]),qty=field(g,'كمية الخامة التالفة','number',''),charged=field(g,'من يتحمل التكلفة؟','select','shop',[{value:'shop',label:'المطبعة'},{value:'client',label:'العميل — لا يُضاف دين تلقائياً'}]),reason=field(m.body,'السبب / تفاصيل إعادة التنفيذ','textarea','');const p=document.createElement('p');p.textContent='الكمية ستُخصم من المخزن الآن. سجّل التالف الفعلي فقط؛ خامة إعادة الطباعة تُسجل مرة واحدة أيضاً عند استهلاكها. تحميل العميل يحتاج فاتورة مستقلة للخدمة حتى يظهر الدين.';m.body.prepend(g,p);m.body.append(button('اعتماد خصم الهالك',()=>{if(!guard('ops_waste')||!guard('stock_adjust'))return;const i=appState.items.find(i=>i.id===item.value),q=M.quantity(Number(qty.value));if(!Number.isFinite(Number(qty.value))||!(q>0)||Math.abs(q-Number(qty.value))>1e-8||!i||q>i.qty-M.reserved(appState,i.id))throw Error('الخامة غير موجودة أو الكمية أكبر من المتاح');if(!reason.value.trim())throw Error('اكتب سبب الهالك');commit('خصم هالك مخزون',()=>{i.qty=M.quantity(i.qty-q);delete i.lastActualCount;appState.waste149.push({id:uid('waste'),orderId:job.value,itemId:i.id,qty:q,unitCost:Number(i.avgCost166 ?? i.buyPrice)||0,chargedTo:charged.value,reason:M.text(reason.value,1000),date:todayStr(),user:getCurrentUser().name});});m.close();render();},true));}
function costForm(){if(!guard('ops_cost')||!guard('stock_cost'))return;const m=modal('تكلفة خدمة خارجية أو مصروف خاص بطلب'),g=box(),job=field(g,'الفاتورة','select','',[{value:'',label:'اختر الفاتورة'},...appState.orders.slice().reverse().map(o=>({value:o.id,label:'#'+o.orderNo+' '+o.clientName}))]),desc=field(g,'بيان التكلفة','text',''),amount=field(g,'قيمة التكلفة','number',''),mode=field(g,'التسجيل المالي','select','record',[{value:'record',label:'تكلفة تحليلية فقط — لا حركة خزينة'},{value:'link',label:'ربط بمصروف موجود — دون تكراره'},{value:'pay',label:'دفع الآن وإنشاء مصروف بالخزينة'}]),method=field(g,'طريقة الدفع عند الدفع الآن','select',methods()[0],methods()),existing=field(g,'مصروف سابق عند الربط','select','',[{value:'',label:'اختر المصروف'},...appState.treasury.filter(t=>Number(t.outAmount)>0).map(t=>({value:t.id,label:t.date+' '+t.desc+' '+t.outAmount}))]);m.body.append(g,button('حفظ التكلفة',()=>{if(!guard('ops_cost')||!guard('stock_cost'))return;const o=order(job.value);if(!o||!desc.value.trim())throw Error('اختر الفاتورة واكتب بيان التكلفة');let n=M.positive(amount.value,'التكلفة',false),treasuryId=null;if(mode.value==='link'){const t=appState.treasury.find(x=>x.id===existing.value&&x.outAmount>0);if(!t)throw Error('اختر مصروفاً موجوداً');if(appState.costs149.some(c=>!c.voidAt&&c.treasuryId===t.id))throw Error('هذا المصروف مرتبط بتكلفة بالفعل');n=M.money(t.outAmount);treasuryId=t.id;}if(mode.value==='pay'&&!guard('tre_add'))return;commit('تسجيل تكلفة طلب',()=>{if(mode.value==='pay'){treasuryId=uid('expense');appState.treasury.push({id:treasuryId,date:todayStr(),type:'expense',desc:'تكلفة طلب #'+o.orderNo+' — '+M.text(desc.value),inAmount:0,outAmount:n,paymentMethod:method.value,user:getCurrentUser().name});}appState.costs149.push({id:uid('cost'),orderId:o.id,desc:M.text(desc.value),amount:n,treasuryId,mode:mode.value,date:todayStr(),user:getCurrentUser().name});});m.close();render();},true));}
function voidRecord(type,id){const waste=type==='هالك',record=(waste?appState.waste149:appState.costs149).find(x=>x.id===id);if(!record||record.voidAt)return;if(!guard(waste?'ops_waste':'ops_cost')||!guard(waste?'stock_adjust':'stock_cost'))return;if(!waste&&record.mode==='pay'&&!guard('tre_delete'))return;requireAdminPin(waste?'إلغاء الهالك وإعادة كميته للمخزن؟ سيظل سجل الإلغاء محفوظاً.':record.mode==='pay'?'إلغاء التكلفة وعكس المصروف الذي أنشأته في الخزينة؟':'إلغاء التكلفة التحليلية وفصلها عن المصروف السابق دون حذفه؟',()=>{commit('إلغاء '+type+' بتسوية',()=>{if(waste){const item=appState.items.find(i=>i.id===record.itemId);if(!item)throw Error('الخامة غير موجودة');item.avgCost166=AccountingMath401.returnedAverage(item,record.qty,record.unitCost);item.qty=M.quantity(Number(item.qty)+Number(record.qty));delete item.lastActualCount;}else if(record.mode==='pay')appState.treasury=appState.treasury.filter(t=>t.id!==record.treasuryId);record.voidAt=new Date().toISOString();record.voidBy=getCurrentUser().name;});render();});}
function pickFilesViaBrowserInput163(){
 return new Promise(resolve=>{
  const inp=document.createElement('input');
  inp.type='file';
  inp.multiple=true;
  inp.accept='.pdf,.png,.jpg,.jpeg,.webp,.tif,.tiff,.bmp,.ai,.eps,.psd,.cdr,.svg,.zip,.doc,.docx,.xls,.xlsx,.csv,.txt,.rar,.7z,.gif,*/*';
  inp.style.display='none';
  document.body.appendChild(inp);
  let settled=false;
  const finish=val=>{if(settled)return;settled=true;try{inp.remove();}catch{}resolve(val);};
  inp.onchange=async()=>{
   const files=[...(inp.files||[])].slice(0,20);
   if(!files.length)return finish([]);
   const out=[];
   for(const f of files){
    const dataUrl=await new Promise(res=>{
     if(f.size>15*1024*1024)return res('');
     const r=new FileReader();
     r.onload=()=>res(String(r.result||''));
     r.onerror=()=>res('');
     r.readAsDataURL(f);
    });
    const attId=typeof crypto?.randomUUID==='function'?crypto.randomUUID():('att_'+Date.now()+'_'+Math.random().toString(36).slice(2,8));
    const ext=(f.name.includes('.')?'.'+f.name.split('.').pop():'.pdf').toLowerCase();
    out.push({id:attId,name:f.name,file:attId+ext,size:f.size||0,addedAt:new Date().toISOString(),dataUrl});
   }
   finish(out);
  };
  window.addEventListener('focus',()=>setTimeout(()=>{if(!settled&&(!inp.files||!inp.files.length))finish([]);},600),{once:true});
  inp.click();
 });
}
async function pickOpsAttachments163(targetId){
 if(typeof window.api?.opsAddAttachments==='function'){
  try{
   const res=await window.api.opsAddAttachments(targetId);
   if(Array.isArray(res))return res;
  }catch(err){
   console.warn('Native opsAddAttachments fallback to browser input:',err);
  }
 }
 return await pickFilesViaBrowserInput163();
}
async function openOpsAttachment163(orderId,att){
 if(!att)return;
 if(typeof window.api?.opsOpenAttachment==='function'&&att.file&&!att.dataUrl){
  await window.api.opsOpenAttachment({orderId,id:att.id,file:att.file});
  return;
 }
 if(att.dataUrl){
  const a=document.createElement('a');
  a.href=att.dataUrl;
  a.download=att.name||'attachment';
  document.body.appendChild(a);
  a.click();
  a.remove();
  return;
 }
 if(typeof window.api?.opsOpenAttachment==='function'){
  await window.api.opsOpenAttachment({orderId,id:att.id,file:att.file});
 }
}
window.pickOpsAttachments163=pickOpsAttachments163;
window.openOpsAttachment163=openOpsAttachment163;
function renderAlerts(h){
 const cards=box('ops-cards149');
 if(!appState.alertAttachments149||typeof appState.alertAttachments149!=='object')appState.alertAttachments149={};
 function card(title,text,fn,alertKey,orderRef=null){
  const c=box('ops-card149');
  const a=document.createElement('strong'),p=document.createElement('p');
  a.textContent=title;p.textContent=text;
  const attList=orderRef?(orderRef.attachments149||[]):(appState.alertAttachments149[alertKey]||[]);
  const attBox=document.createElement('div');
  attBox.className='space-y-1 text-xs';
  for(const att of attList){
   const row=actions(
    document.createTextNode(att.name+' • '+Math.max(1,Math.ceil((att.size||0)/1024))+' ك.ب'),
    button('فتح الملف',async()=>{if(!guard('ops_manage'))return;await openOpsAttachment163(orderRef?orderRef.id:alertKey,att);})
   );
   attBox.append(row);
  }
  const btnBar=actions(
   button('فتح',fn,true),
   button('إضافة ملفات',async()=>{
    if(!guard('ops_manage'))return;
    const picked=await pickOpsAttachments163(orderRef?orderRef.id:alertKey);
    if(picked?.length){
     commit('إرفاق ملفات للتنبيه '+title,()=>{
      if(orderRef){
       const fresh=order(orderRef.id);
       if(fresh){fresh.attachments149||=[];fresh.attachments149.push(...picked);}
      }else{
       appState.alertAttachments149||={};
       appState.alertAttachments149[alertKey]||=[];
       appState.alertAttachments149[alertKey].push(...picked);
      }
     });
     if(typeof showToast==='function')showToast('تم إرفاق '+picked.length+' ملف للتنبيه بنجاح','success');
     render();
    }
   })
  );
  c.append(a,p);
  if(attList.length)c.append(attBox);
  c.append(btnBar);
  cards.append(c);
 }
 if(can('tab_orders'))for(const o of appState.orders.filter(o=>o.deliveryDate&&o.deliveryDate<todayStr()&&o.status!=='تم التسليم'))card('متأخر #'+o.orderNo,o.clientName+' • موعد '+o.deliveryDate,()=>job(o.id),'order_'+o.id,o);
 if(can('tab_inventory'))for(const i of appState.items.filter(i=>Number(i.qty)-M.reserved(appState,i.id)<=Number(i.minQty||0)))card('خامة تحتاج توريد',i.name+' • المتاح '+M.money(i.qty-M.reserved(appState,i.id)),()=>{switchTab('inventory');$('searchInventoryInput').value=i.name;renderInventoryTable();},'item_'+i.id,null);
 if(can('tab_clients')&&!privHidden('clientsDue'))for(const c of appState.clients.filter(c=>getClientBalance(c.id)>0))card('مستحق على العميل',c.name+' • '+formatCurrency(getClientBalance(c.id)),()=>{switchTab('clients');viewStatement('client',c.id);},'client_'+c.id,null);
 if(!cards.children.length)cards.textContent='لا توجد تنبيهات مطابقة لصلاحياتك الحالية.';
 h.append(cards);
}
function renderAudit(h){if(!isAdmin()){h.textContent='سجل المراجعة متاح للمدير فقط.';return;}const c=box('ops-card149');
 if(typeof isAdmin==='function'&&isAdmin()){
  try{const current=JSON.parse(window.api?.load?.()||'null');if(Array.isArray(current?.auditTrail166))appState.auditTrail166=current.auditTrail166;}catch(_){/* read last committed audit locally */}
  const trail=Array.isArray(appState.auditTrail166)?appState.auditTrail166:[];
  const audit=box('ops-card149');
  const titles={orders:'فواتير العملاء',purchases:'فواتير الوارد',treasury:'الخزينة',adjustments:'تسويات',services:'الخدمات',stockAdjustments153:'الجرد',costs149:'تكاليف التشغيل',waste149:'الهالك'};
  audit.innerHTML='<h3>سجل إلغاء العمليات المالية (للمدير فقط)</h3><p>عدد القيود المؤرشفة: '+trail.length+' — هذا السجل يحتفظ بالعملية الأصلية قبل الحذف ولا يُحتسب ضمن الأرصدة الحالية.</p>';
  if(trail.length){const table=document.createElement('div');table.className='overflow-x-auto';table.innerHTML='<table class="w-full text-xs text-right"><thead><tr><th class="p-2">وقت الإلغاء</th><th class="p-2">القسم</th><th class="p-2">رقم السجل</th><th class="p-2">المستخدم</th><th class="p-2">العميل/الصنف</th></tr></thead><tbody>'+trail.slice(-50).reverse().map(x=>'<tr><td class="p-2">'+E(x.at||'')+'</td><td class="p-2">'+E(titles[x.collection]||x.collection)+'</td><td class="p-2">'+E(x.recordId||'')+'</td><td class="p-2">'+E(x.actor||'')+'</td><td class="p-2">'+E(x.before?.clientName||x.before?.supplierName||x.before?.itemName||x.before?.desc||'')+'</td></tr>').join('')+'</tbody></table>';audit.append(table);}
  c.append(audit);
 }
 h.append(c);}
function sheetOptions(){if(!guard('sets_invoice'))return;const m=modal('إعداد ورقة التشغيل الداخلية'),cfg=ss().workSheet149||{},price=choice(m.body,'إظهار الأسعار',!!cfg.prices),client=choice(m.body,'إظهار اسم العميل',cfg.client!==false),phone=choice(m.body,'إظهار هاتف العميل',!!cfg.phone);m.body.append(button('حفظ إعدادات الورقة',()=>{if(!guard('sets_invoice'))return;commit('إعداد ورقة تشغيل',()=>ss().workSheet149={prices:price.checked,client:client.checked,phone:phone.checked});m.close();},true));}
function formatTime12hOps153(d=new Date()){
 let h=d.getHours();const p=h>=12?'م':'ص';h=h%12||12;
 return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} • ${String(h).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')} ${p}`;
}
function buildDailyOpsReportHtml153({mode='today_or_active',date='',stage='',assignee='',includePrices=false}={}){
 const targetDate=date||(typeof todayStr==='function'?todayStr():new Date().toISOString().slice(0,10));
 const allOrders=(appState.orders||[]).slice().reverse();
 const matched=allOrders.filter(o=>{
  const st=o.ops149?.stage||o.status||'قيد التنفيذ';
  if(stage&&st!==stage)return false;
  if(assignee&&!smartMatch(o.ops149?.assignee||'',assignee))return false;
  if(mode==='exact_date')return o.date===targetDate||o.deliveryDate===targetDate;
  if(mode==='today_only')return o.date===targetDate;
  if(mode==='delivery_today')return o.deliveryDate===targetDate;
  if(mode==='active_only')return st!=='تم التسليم'&&o.status!=='تم التسليم';
  if(mode==='today_or_active')return o.date===targetDate||o.deliveryDate===targetDate||(st!=='تم التسليم'&&o.status!=='تم التسليم');
  return true;
 });
 const ordersList=matched.length?matched:allOrders.slice(0,25);
 const shop=appState.shopSettings||{};
 const stageCounts={};
 for(const o of ordersList){const s=o.ops149?.stage||o.status||'قيد التنفيذ';stageCounts[s]=(stageCounts[s]||0)+1;}
 const summaryBadges=Object.entries(stageCounts).map(([k,v])=>`<span style="display:inline-block;padding:4px 10px;border:1.5px solid #1e293b;border-radius:6px;background:#f1f5f9;color:#0f172a;font-weight:800;font-size:11px;margin-left:6px;margin-bottom:4px">${E(k)}: ${E(v)}</span>`).join('');
 const cardsHtml=ordersList.map((o,idx)=>{
  const cl=(appState.clients||[]).find(c=>c.id===o.clientId);
  const st=o.ops149?.stage||o.status||'قيد التنفيذ';
  const lines=Array.isArray(o.lines)&&o.lines.length?o.lines:[{desc:o.jobType||'بند تشغيل',qty:o.qty||1,price:o.price||0,notes:o.specs||''}];
  const linesRows=lines.map((l,li)=>{
   const specStr=M.specFields.filter(([k])=>l.spec149?.[k]).map(([k,label])=>label+': '+l.spec149[k]).join(' | ');
   const fullNotes=[specStr,l.notes].filter(Boolean).join('\n')||'—';
   return `<tr>
    <td style="border:1px solid #1e293b;padding:6px;text-align:center;font-weight:800;color:#000000;background:#ffffff">${li+1}</td>
    <td style="border:1px solid #1e293b;padding:6px;font-weight:800;color:#000000;background:#ffffff">${E(l.desc||'—')}</td>
    <td style="border:1px solid #1e293b;padding:6px;text-align:center;font-weight:900;color:#000000;background:#ffffff">${E(l.qty??1)}</td>
    <td style="border:1px solid #1e293b;padding:6px;color:#0f172a;background:#ffffff;white-space:pre-line">${E(fullNotes)}</td>
    ${includePrices?`<td style="border:1px solid #1e293b;padding:6px;font-weight:800;color:#000000;background:#ffffff">${E(formatCurrency((Number(l.qty)||1)*(Number(l.price)||0)))}</td>`:''}
   </tr>`;
  }).join('');
  return `<div style="width:100%;max-width:100%;box-sizing:border-box;border:2px solid #0f172a;border-radius:10px;padding:12px;margin-bottom:14px;background:#ffffff;color:#000000;break-inside:avoid">
   <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;border-bottom:1.5px solid #334155;padding-bottom:8px;margin-bottom:8px;background:#f8fafc;padding:8px;border-radius:6px">
    <div><strong style="font-size:14px;color:#000000">أمر تشغيل #${E(o.orderNo)} (${idx+1})</strong> — <span style="font-weight:800;color:#0f172a">${E(o.jobType||'طلب طباعة')}</span></div>
    <div style="font-size:12px;font-weight:800;color:#000000">المرحلة: <span style="padding:2px 8px;border:1px solid #0f172a;border-radius:4px;background:#e2e8f0;color:#000000">${E(st)}</span> • المسؤول: ${E(o.ops149?.assignee||'غير محدد')}</div>
   </div>
   <div style="width:100%;max-width:100%;box-sizing:border-box;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;font-size:12px;margin-bottom:8px;color:#000000">
    <div><b>العميل:</b> ${E(o.clientName||'عميل نقدي')}${cl?.phone?' ('+E(cl.phone)+')':''}</div>
    <div><b>تاريخ الطلب:</b> ${E(o.date||'—')}</div>
    <div><b>موعد التسليم:</b> ${E(o.deliveryDate||'غير محدد')}</div>
   </div>
   <table style="width:100%;max-width:100%;table-layout:fixed;box-sizing:border-box;border-collapse:collapse;font-size:12px;margin-bottom:8px;color:#000000;background:#ffffff">
    <thead>
     <tr style="background:#e2e8f0;color:#000000">
      <th style="border:1.5px solid #0f172a;padding:6px;width:36px;text-align:center;color:#000000">#</th>
      <th style="border:1.5px solid #0f172a;padding:6px;color:#000000">البند / الصنف / الخدمة</th>
      <th style="border:1.5px solid #0f172a;padding:6px;width:70px;text-align:center;color:#000000">الكمية</th>
      <th style="border:1.5px solid #0f172a;padding:6px;color:#000000">مواصفات التنفيذ والتشطيب والملاحظات</th>
      ${includePrices?'<th style="border:1.5px solid #0f172a;padding:6px;width:100px;color:#000000">الإجمالي</th>':''}
     </tr>
    </thead>
    <tbody>${linesRows}</tbody>
   </table>
   ${o.specs?`<div style="font-size:12px;padding:6px 8px;background:#f8fafc;border:1px solid #475569;border-radius:6px;color:#000000;white-space:pre-line"><b>تعليمات عامة للطلب:</b> ${E(o.specs)}</div>`:''}
   <div style="display:flex;justify-content:space-between;font-size:11px;margin-top:8px;padding-top:6px;border-top:1px dashed #64748b;color:#0f172a">
    <span>استلام قسم التشغيل: ....................</span>
    <span>فحص الجودة: ....................</span>
    <span>تأكيد التسليم: ....................</span>
   </div>
  </div>`;
 }).join('');
 return `<div dir="rtl" style="width:100%;max-width:100%;box-sizing:border-box;background:#ffffff;color:#000000;font-family:Cairo,Arial,sans-serif">
  <header style="display:flex;justify-content:space-between;align-items:flex-start;background:#ffffff!important;border-bottom:2.5px solid #0f172a;padding-bottom:12px;margin-bottom:12px;color:#000000!important">
   <div style="background:#ffffff!important;color:#000000!important">
    <h1 style="margin:0;font-size:20px;font-weight:900;color:#000000!important">${E(shop.name||'الحمد برنت')}</h1>
    <h2 style="margin:4px 0 0;font-size:16px;font-weight:800;color:#0f172a!important">تقرير أوامر التشغيل اليومي — نسخة مسئول التشغيل</h2>
    <p style="margin:4px 0 0;font-size:12px;font-weight:700;color:#1e293b!important">تاريخ التقرير: ${E(targetDate)} • وقت الاستخراج: ${E(formatTime12hOps153(new Date()))} • إجمالي الأوامر: ${E(ordersList.length)}</p>
   </div>
   ${shop.logo?`<img src="${E(shop.logo)}" style="width:76px;height:76px;object-fit:contain">`:''}
  </header>
  <div style="margin-bottom:12px">${summaryBadges}</div>
  ${cardsHtml||'<p style="padding:20px;text-align:center;font-weight:800;color:#000000">لا توجد أوامر تشغيل مسجلة لهذا الفلتر.</p>'}
  <footer style="margin-top:18px;padding-top:12px;border-top:2px solid #0f172a;display:flex;justify-content:space-between;font-size:12px;font-weight:800;color:#000000">
   <span>توقيع مسئول التشغيل: ..............................</span>
   <span>توقيع المدير المسؤول: ..............................</span>
  </footer>
 </div>`;
}
function openDailyOpsReportPaper153(opts={}){
 if(!guard('inv_print'))return;
 const targetDate=opts.date||(typeof todayStr==='function'?todayStr():new Date().toISOString().slice(0,10));
 const html=buildDailyOpsReportHtml153(opts);
 const title='تقرير_أوامر_التشغيل_'+targetDate;
 const pModal=paper(title,html);
 if(opts.autoAction==='image'&&pModal?.sheet){setTimeout(()=>window.exportOpsPaperImage153?.(pModal.sheet,title,'png'),120);}
 if(opts.autoAction==='pdf'&&pModal?.savePdfBtn){setTimeout(()=>pModal.savePdfBtn.click(),120);}
 return pModal;
}
function dailyOpsReportModal153(){
 if(!guard('inv_print'))return;
 const today=typeof todayStr==='function'?todayStr():new Date().toISOString().slice(0,10);
 const m=modal('إعداد واستخراج تقرير أوامر التشغيل اليومي (صورة / PDF)');
 const g=box();
 const modeSel=field(g,'نطاق أوامر التشغيل','select','today_or_active',[
  {value:'today_or_active',label:'أوامر اليوم + جميع الأوامر قيد التشغيل الحالية (موصى به)'},
  {value:'exact_date',label:'أوامر تاريخ محدد (طلب أو تسليم)'},
  {value:'today_only',label:'الأوامر المسجلة في هذا التاريخ فقط'},
  {value:'delivery_today',label:'الأوامر المطلوب تسليمها في هذا التاريخ'},
  {value:'active_only',label:'جميع الأوامر قيد التنفيذ (غير المسلمة)'},
  {value:'all',label:'جميع أوامر التشغيل المسجلة'}
 ]);
 const dateIn=field(g,'تاريخ التقرير','date',today);
 const stageSel=field(g,'تصفية حسب المرحلة','select','',[{value:'',label:'كل المراحل'},...M.stages.map(s=>({value:s,label:s}))]);
 const personIn=field(g,'تصفية حسب مسئول التشغيل','text','');
 const pricesChk=choice(m.body,'إظهار الأسعار والقيم المالية في التقرير',false);
 m.body.prepend(g);
 const getOpts=()=>({mode:modeSel.value,date:dateIn.value||today,stage:stageSel.value,assignee:personIn.value.trim(),includePrices:pricesChk.checked});
 m.body.append(actions(
  button('معاينة التقرير الكامل',()=>{m.close();openDailyOpsReportPaper153(getOpts());},true),
  button('استخراج صورة PNG عالية الدقة',()=>{m.close();openDailyOpsReportPaper153({...getOpts(),autoAction:'image'});}),
  button('استخراج ملف PDF للطباعة',()=>{m.close();openDailyOpsReportPaper153({...getOpts(),autoAction:'pdf'});})
 ));
}
function sheet(id){if(!guard('inv_print')||!guard('record_view'))return;const o=order(id);if(!o)return;const c=ss().workSheet149||{},client=appState.clients.find(x=>x.id===o.clientId),html='<header style="border-bottom:2px solid #0f172a;padding-bottom:10px;margin-bottom:10px;color:#000000"><div><h1 style="color:#000000;font-weight:900;margin:0">'+E(appState.shopSettings?.name||'الحمد برنت')+'</h1><h2 style="color:#0f172a;font-weight:800;margin:4px 0 0">ورقة تشغيل #'+E(o.orderNo)+'</h2></div>'+(appState.shopSettings?.logo?'<img src="'+E(appState.shopSettings.logo)+'">':'')+'</header><p style="color:#000000;font-weight:700">'+E(c.client===false?'':o.clientName)+(c.phone?' • '+E(client?.phone):'')+'<br>التسليم: '+E(o.deliveryDate||'—')+' • المرحلة: '+E(o.ops149?.stage||o.status)+' • المسؤول: '+E(o.ops149?.assignee||'—')+'</p><table style="color:#000000;background:#ffffff"><thead><tr style="background:#e2e8f0;color:#000000"><th style="border:1.5px solid #0f172a;color:#000000">الصنف / الخدمة</th><th style="border:1.5px solid #0f172a;color:#000000">الكمية</th><th style="border:1.5px solid #0f172a;color:#000000">مواصفات التنفيذ</th>'+(c.prices?'<th style="border:1.5px solid #0f172a;color:#000000">سعر الوحدة</th>':'')+'</tr></thead><tbody>'+(o.lines||[]).map(l=>'<tr><td style="border:1px solid #1e293b;color:#000000;font-weight:800">'+E(l.desc)+'</td><td style="border:1px solid #1e293b;color:#000000;font-weight:800;text-align:center">'+E(l.qty)+'</td><td style="border:1px solid #1e293b;color:#0f172a">'+E(M.specFields.filter(([k])=>l.spec149?.[k]).map(([k,label])=>label+': '+l.spec149[k]).join('\n'))+'\n'+E(l.notes)+'</td>'+(c.prices?'<td style="border:1px solid #1e293b;color:#000000;font-weight:800">'+E(formatCurrency(l.price))+'</td>':'')+'</tr>').join('')+'</tbody></table><p style="white-space:pre-line;color:#000000;font-weight:700">تعليمات الطلب: '+E(o.specs||'—')+'</p><p style="color:#000000;font-weight:800;margin-top:16px">اسم المنفذ: ...................... توقيع المراجعة: ......................</p>';paper('ورقة تشغيل '+o.clientName+' '+o.orderNo,html);}
function paper(title,html){if(!guard('inv_print'))return;const m=modal(title),p=box('ops-print-scroll149'),sheetEl=box('ops-paper149');sheetEl.id='opsPaper149';sheetEl.dir='rtl';sheetEl.style.cssText='background:#ffffff!important;color:#000000!important;padding:24px;border:1px solid #334155;border-radius:10px;font-family:Cairo,Arial,sans-serif;line-height:1.75;';sheetEl.innerHTML=html;p.append(sheetEl);
 const styles='.ops-paper149,.ops-paper149 *{color-scheme:light!important}.ops-paper149{background:#ffffff!important;color:#000000!important;padding:22px;font-family:Cairo,Arial,sans-serif;font-size:12px;line-height:1.8}.ops-paper149 h1,.ops-paper149 h2,.ops-paper149 h3,.ops-paper149 p,.ops-paper149 b,.ops-paper149 strong,.ops-paper149 span{color:#000000!important}.ops-paper149 table{width:100%;border-collapse:collapse;background:#ffffff!important;color:#000000!important}.ops-paper149 th{border:1.5px solid #0f172a!important;background:#e2e8f0!important;color:#000000!important;padding:8px;text-align:right;font-weight:900}.ops-paper149 td{border:1px solid #1e293b!important;background:#ffffff!important;color:#000000!important;padding:8px;text-align:right;white-space:pre-line;font-weight:700}.ops-paper149 img{width:80px;height:80px;object-fit:contain}.ops-paper149 header{display:flex;justify-content:space-between}';
 const savePdfBtn=button('حفظ PDF',async()=>{if(!guard('inv_print'))return;if(typeof window.exportOpsPaperPDF153==='function'){await window.exportOpsPaperPDF153(sheetEl,title,styles);return;}const r=await api.savePDF({kind:'work-sheet',title,html:sheetEl.outerHTML,css:styles,options:{paper:'A4',orientation:'portrait',margin:10,scale:100,pageNumbers:true}});if(!r.ok&&!r.canceled)throw Error(r.error);},true);
 const savePngBtn=button('حفظ صورة PNG',async()=>{if(!guard('inv_print'))return;if(typeof window.exportOpsPaperImage153==='function'){await window.exportOpsPaperImage153(sheetEl,title,'png');}else if(typeof window.openDocumentImage==='function'){window.openDocumentImage(null,{kind:'work-sheet',title,html:sheetEl.outerHTML});}});
 const copyImgBtn=button('نسخ الصورة',async()=>{if(!guard('inv_print'))return;if(typeof window.copyOpsPaperImage153==='function'){await window.copyOpsPaperImage153(sheetEl,title);}});
 const printBtn=button('طباعة',()=>{if(typeof window.printOpsPaper153==='function'){window.printOpsPaper153(sheetEl,title,styles);return;}const w=window.open('','_blank');if(!w)throw Error('تعذر فتح الطباعة');w.document.write('<html dir="rtl"><meta charset="utf-8"><title>'+E(title)+'</title><style>'+styles+'</style><body>'+sheetEl.outerHTML+'</body></html>');w.document.close();setTimeout(()=>{if(!w.closed){w.focus();w.print();}},400);});
 m.body.append(p,actions(savePdfBtn,savePngBtn,copyImgBtn,printBtn));
 return {modal:m,sheet:sheetEl,savePdfBtn};
}
function beforeSaleCommit(o,old){if(old){o.attachments149=old.attachments149||[];o.ops149=old.ops149||o.ops149;if(!Array.isArray(old.costSnapshot149))o.costSnapshot149=null;if(old.status!==o.status){o.ops149.stage=o.status==='تم التسليم'?'تم التسليم':o.status==='جاهز للتسليم'?'جاهز للتسليم':'انتظار التصميم';o.ops149.history||=[];o.ops149.history.push({at:new Date().toISOString(),stage:o.ops149.stage,user:getCurrentUser().name,note:'تحديث حالة الفاتورة'});}}for(const r of appState.reservations149||[])if(r.quoteId===QUOTE_SRC&&r.status==='active'){r.status='consumed';r.orderId=o.id;r.consumedAt=new Date().toISOString();}}
function install(){setup();const search=$('cashierSearch148');if(search)search.addEventListener('keydown',e=>{if(e.key!=='Enter')return;const v=search.value.trim(),items=appState.items.filter(i=>i.barcode149===v||i.code===v);if(items.length===1){e.preventDefault();e.stopImmediatePropagation();Alhamd148UI.addProduct('stock:'+items[0].id);search.value='';Alhamd148UI.renderSearch();search.focus({preventScroll:true});}else if(items.length>1){e.preventDefault();e.stopImmediatePropagation();showToast('الكود مكرر؛ راجع أكواد المخزن','warning');}},true);}
const priorTab=window.switchTab;window.switchTab=function(id,...a){const r=priorTab.call(this,id,...a);if(id==='operations'&&allowed('tab_operations')){$('pageTitle').textContent='التشغيل والتطوير';$('pageSubtitle').textContent='الطلبات والورديات والتكاليف والخامات';render();}return r;};
const prevLock=window.showLockScreen;window.showLockScreen=function(...a){$('operationsModal149')?.remove();return prevLock.apply(this,a);};
const prevUpdate=window.updateAllUI;window.updateAllUI=function(...a){const r=prevUpdate.apply(this,a);if(appState.isLocked)$('operationsModal149')?.remove();initData();$('opsNav149')?.classList.toggle('hidden',!can('tab_operations'));if($('view-operations')&&!$('view-operations').classList.contains('hidden'))render();return r;};
const prevRemove=window.removeSaleLine;window.removeSaleLine=function(btn,...a){const row=btn.closest('.sale-line');if($('saleLines').children.length===1){row.dataset.spec149='{}';delete row.dataset.tier149;delete row.dataset.fee149;delete row.dataset.serviceCatalogId;row.querySelector('.sl-notes').value='';}return prevRemove.call(this,btn,...a);};
const prevCalc=window.calcSale;let calculating=false;window.calcSale=function(...a){if(!calculating){calculating=true;try{for(const row of document.querySelectorAll('#saleLines .sale-line'))applyTier(row);}finally{calculating=false;}}return prevCalc.apply(this,a);};
const prevPrice=window.onSalePriceInput;window.onSalePriceInput=function(el,...a){delete el.closest('.sale-line').dataset.tier149;return prevPrice.call(this,el,...a);};
const prevReset=window.resetComposer;window.resetComposer=function(...a){splitDraft=null;editSource=null;const r=prevReset.apply(this,a);ensureInvoice();decorate();return r;};
const prevStatus=window.toggleOrderStatus;window.toggleOrderStatus=function(id,...a){const r=prevStatus.call(this,id,...a),o=order(id);if(o&&allowed('inv_status')){o.ops149||={history:[]};o.ops149.stage=o.status==='تم التسليم'?'تم التسليم':o.status==='جاهز للتسليم'?'جاهز للتسليم':'انتظار التصميم';saveState(false);}return r;};
const prevEdit=window.editSale;window.editSale=function(id,...a){const r=prevEdit.call(this,id,...a);const o=order(id);editSource=id;splitDraft=o?.paymentParts149?.length?clone(o.paymentParts149):null;paintPayments();decorate();return r;};
const prevLoad=window.loadDocToComposer;window.loadDocToComposer=function(...a){const r=prevLoad.apply(this,a);decorate();return r;};
const prevSave=window.saveSale;window.saveSale=function(...a){const snapshot640=JSON.stringify(appState),commit640=lastCommittedState;try{initData();const calc=readSale();if(!['مسودة','عرض سعر'].includes($('saleStatus').value))readPayments(calc.paid);for(const row of $('saleLines').children){const s=spec(row),desc=specText(s);if(desc){const notes=row.querySelector('.sl-notes');const old=s.renderedNote||'';let manual=notes.value;if(old&&manual.endsWith(old))manual=manual.slice(0,-old.length).trimEnd();notes.value=(manual?manual+'\n':'')+desc;s.renderedNote=desc;row.dataset.spec149=JSON.stringify(s);}}return prevSave.apply(this,a);}catch(e){appState=JSON.parse(lastCommittedState!==commit640?lastCommittedState:snapshot640);ledgerIndex=null;error(e);return null;}};
const prevState=window.saveState;window.saveState=function(...a){try{for(const r of appState.reservations149||[]){if(r.status!=='active')continue;const q=(appState.quotes||[]).find(q=>q.id===r.quoteId);if(!q||['مرفوض','تم التحويل'].includes(q.status)){r.status='released';continue;}const lines=M.demand(q.lines);if(JSON.stringify(lines)!==JSON.stringify(r.lines))r.lines=M.reserve(appState,q,r.id).lines;}for(const i of appState.items||[])if(Number(i.qty)+0.00001<M.reserved(appState,i.id))throw Error('هذا التعديل يجعل رصيد '+i.name+' أقل من المحجوز. حرر الحجز أولاً.');for(const c of appState.costs149||[]){if(!c.voidAt&&c.treasuryId){const t=appState.treasury.find(t=>t.id===c.treasuryId);if(!t||M.money(t.outAmount)!==M.money(c.amount))throw Error('يوجد مصروف مرتبط بتكلفة طلب؛ صحح الربط من سجل التكلفة أولاً.');}}return prevState.apply(this,a);}catch(e){if(lastCommittedState)appState=JSON.parse(lastCommittedState);throw e;}};
// Reject deleting transactions or invoices that anchor costs/waste; users resolve related records first.
for(const[name,check,message]of [['requestDeleteJobOrder',id=>(appState.costs149||[]).some(c=>!c.voidAt&&c.orderId===id)||(appState.waste149||[]).some(c=>!c.voidAt&&c.orderId===id),'الفاتورة مرتبطة بتكاليف أو هالك؛ استخدم تعديل الفاتورة للحفاظ على سجل التشغيل.'],['requestDeleteTransaction',id=>(appState.costs149||[]).some(c=>!c.voidAt&&c.treasuryId===id),'الحركة مرتبطة بتكلفة طلب.']]){const prev=window[name];if(prev)window[name]=function(id,...a){if(check(id))return showToast(message,'warning');return prev.call(this,id,...a);};}
new MutationObserver(rs=>{if(rs.some(r=>r.target.closest?.('#saleLines')&&[...r.addedNodes].some(n=>n.nodeType===1&&n.classList?.contains('sale-line'))))decorate();}).observe(document.body,{childList:true,subtree:true});
window.openDailyOpsReport153=openDailyOpsReportPaper153;window.dailyOpsReportModal153=dailyOpsReportModal153;
window.Operations149UI={openPane651:key=>{if(!panes.some(([k])=>k===key))throw Error('تبويب تشغيل غير صالح');if(!guard('tab_operations'))return;pane=key;page=0;window.switchTab('operations');render();},render,job,repeat,sheet,applyPricing,editSpecs,pricingForm,paymentEditor,readPayments,draftPayments640:()=>clone(splitDraft),restorePayments640:r=>{splitDraft=r?clone(r):null;paintPayments();},beforeSaleCommit,sourceQuote:()=>QUOTE_SRC,openShift,closeShift,reserveForm,costForm,wasteForm,barcodeSVG,renderAudit,dailyOpsReportModal153,openDailyOpsReportPaper153,buildDailyOpsReportHtml153};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
