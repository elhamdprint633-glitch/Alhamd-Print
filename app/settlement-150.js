/* Derived settlements: source invoice deposit and each receipt remain recorded once. */
(()=>{'use strict';
let settlement=null;
const refresh=()=>settlement=Settlement150.reconcile(appState);
const build=window.buildLedgerIndex;window.buildLedgerIndex=function(...a){refresh();return build.apply(this,a);};
window.orderPaid=o=>(settlement||refresh()).paid.get(o.id)??Number(o.paid||0);
window.orderRemaining=o=>Math.max(0,r2(Number(o.total||0)-orderPaid(o)));
const save=window.saveState;window.saveState=function(...a){refresh();try{return save.apply(this,a);}catch(e){settlement=null;throw e;}};
const update=window.updateAllUI;window.updateAllUI=function(...a){refresh();const r=update.apply(this,a);paint();return r;};
function paint(){const host=gid('salePaid')?.parentElement;if(host&&!gid('settlementInfo150')){const p=document.createElement('p');p.id='settlementInfo150';p.className='text-xs mt-2';host.append(p);}const o=appState.orders.find(o=>o.id===EDIT.order),p=gid('settlementInfo150');if(p){p.textContent=o?'العربون الأصلي: '+formatCurrency(o.paid)+' • دفعات لاحقة وتسويات: '+formatCurrency(r2(orderPaid(o)-Number(o.paid||0)))+' • إجمالي المحصّل: '+formatCurrency(orderPaid(o))+' • المتبقي: '+formatCurrency(orderRemaining(o)):'';p.classList.toggle('hidden',!o);}}
const calc=window.calcSale;window.calcSale=function(...a){const r=calc.apply(this,a),o=appState.orders.find(x=>x.id===EDIT.order);if(o){const n=Math.max(0,r2(readSale().remaining-(orderPaid(o)-Number(o.paid||0))));if(gid('saleRemaining'))gid('saleRemaining').textContent=formatCurrency(n);if(gid('cashierRemaining148'))gid('cashierRemaining148').textContent=formatCurrency(n);}return r;};
const edit=window.editSale;window.editSale=function(...a){const r=edit.apply(this,a);refresh();paint();return r;};
const prevOpen=window.openModal;window.openModal=function(id,...a){const r=prevOpen.call(this,id,...a);if(id==='modalTransaction')setTimeout(transactionUI,0);return r;};

function updatePartyDueAmountField(triggeredBySelect=false){
 const type=gid('transType')?.value;
 const amtInput=gid('transAmount');
 const notesInput=gid('transNotes');
 const isEditing=Boolean(window.EDIT?.trans);
 let badge=gid('transPartyDueBadge31');
 if(!badge&&amtInput?.parentElement){
  badge=document.createElement('div');
  badge.id='transPartyDueBadge31';
  badge.className='text-xs font-bold mt-1.5 px-2.5 py-1.5 rounded-lg hidden';
  amtInput.parentElement.appendChild(badge);
 }
 if(type==='collection'){
  const clientId=gid('transClientSelect')?.value;
  const invSel=gid('transInvoice150')?.value||'';
  if(!clientId){
   if(badge)badge.classList.add('hidden');
   return;
  }
  const clientBal=typeof getClientBalance==='function'?r2(getClientBalance(clientId)):0;
  let targetDue=Math.max(0,clientBal);
  if(invSel&&!['__installment__','__opening_balance__'].includes(invSel)){
   const ord=(appState.orders||[]).find(o=>o.id===invSel);
   if(ord){
    const current=Settlement150.plan(appState,isEditing?EDIT.trans:undefined);
    targetDue=Math.max(0,r2(Number(ord.total)-(current.paid.get(ord.id)||0)));
   }
  }
  if(badge){
   badge.className='text-xs font-bold mt-1.5 px-2.5 py-1.5 rounded-lg '+(clientBal>0?'bg-teal-50 text-teal-800 border border-teal-200':'bg-slate-100 text-slate-600');
   badge.textContent=`إجمالي المستحق على العميل: ${typeof formatCurrency==='function'?formatCurrency(Math.max(0,clientBal)):Math.max(0,clientBal)}`;
   badge.classList.remove('hidden');
  }
  if(!isEditing&&(triggeredBySelect||!amtInput.value||Number(amtInput.value)===0)){
   if(invSel!=='__installment__'&&targetDue>0){
    amtInput.value=targetDue;
   }else if(invSel==='__installment__'&&triggeredBySelect&&targetDue>0&&(!amtInput.value||Number(amtInput.value)===0)){
    amtInput.value=targetDue;
   }
  }
  if(invSel==='__installment__'&&notesInput){
   notesInput.value='تنزيل دفعة';
  }
 }else if(type==='supplier_payment'){
  const supId=gid('transSupplierSelect')?.value;
  if(!supId){
   if(badge)badge.classList.add('hidden');
   return;
  }
  const supBal=typeof getSupplierBalance==='function'?r2(getSupplierBalance(supId)):0;
  const targetDue=Math.max(0,supBal);
  if(badge){
   badge.className='text-xs font-bold mt-1.5 px-2.5 py-1.5 rounded-lg '+(supBal>0?'bg-orange-50 text-orange-800 border border-orange-200':'bg-slate-100 text-slate-600');
   badge.textContent=`إجمالي المستحق للمورد: ${typeof formatCurrency==='function'?formatCurrency(targetDue):targetDue}`;
   badge.classList.remove('hidden');
  }
  if(!isEditing&&(triggeredBySelect||!amtInput.value||Number(amtInput.value)===0)&&targetDue>0){
   amtInput.value=targetDue;
  }
 }else{
  if(badge)badge.classList.add('hidden');
 }
}
window.updatePartyDueAmountField=updatePartyDueAmountField;

function transactionUI(){
 const form=gid('formTransaction');if(!form)return;
 if(!gid('allocationControl150')){
  const box=document.createElement('label');box.id='allocationControl150';box.className='block text-xs mt-2 font-bold text-slate-700';box.textContent='توجيه تحصيل العميل';
  const sel=document.createElement('select');sel.id='transInvoice150';sel.className='w-full border rounded-xl p-2 mt-1 font-bold';
  const info=document.createElement('p');info.id='allocationInfo150';info.className='text-[11px] text-slate-500 mt-1.5 font-normal';
  box.append(sel,info);gid('transClientDiv').append(box);

  sel.addEventListener('change',()=>{
   const v=sel.value;
   const notesInput=gid('transNotes');
   if(v==='__installment__'){
    if(notesInput)notesInput.value='تنزيل دفعة';
    const amtInput=gid('transAmount');
    if(amtInput){amtInput.focus();amtInput.select?.();}
   }else if(v){
    const ord=(appState.orders||[]).find(o=>o.id===v);
    if(ord&&notesInput&&(!notesInput.value||notesInput.value==='تنزيل دفعة')){
     notesInput.value=`سداد حساب فاتورة #${ord.orderNo}`;
    }
    updatePartyDueAmountField(true);
   }else{
    updatePartyDueAmountField(true);
   }
  });
  gid('transClientSelect')?.addEventListener('change',()=>{fill();updatePartyDueAmountField(true);});
  gid('transSupplierSelect')?.addEventListener('change',()=>updatePartyDueAmountField(true));
  gid('transType')?.addEventListener('change',()=>setTimeout(()=>updatePartyDueAmountField(true),0));
  new MutationObserver(()=>{fill();updatePartyDueAmountField(false);}).observe(gid('modalTransaction'),{attributes:true,attributeFilter:['class']});
 }
 function fill(){
  const sel=gid('transInvoice150'),info=gid('allocationInfo150');
  if(!sel)return;
  const id=gid('transClientSelect')?.value,old=appState.treasury.find(t=>t.id===EDIT.trans);
  const prevVal=sel.value;
  const selected=old?.orderId||pendingPayOrderId||(prevVal==='__installment__'?'__installment__':'');
  const orders=appState.orders.filter(o=>o.clientId===id);
  const current=Settlement150.plan(appState,old?.id);
  const opts=[
   {id:'',title:'تلقائي: أقدم مديونية أولاً، ثم الفواتير بالأقدم'},
   {id:'__installment__',title:'تنزيل دفعة'}
  ];
  for(const o of orders){
   const rem=Math.max(0,r2(Number(o.total)-(current.paid.get(o.id)||0)));
   opts.push({id:o.id,title:'#'+o.orderNo+' — المتبقي '+formatCurrency(rem)});
  }
  sel.replaceChildren(...opts.map(x=>{const o=document.createElement('option');o.value=x.id;o.textContent=x.title;return o;}));
  sel.value=opts.some(x=>x.id===selected)?selected:'';
  if(info)info.textContent='يمكنك اختيار «تنزيل دفعة» لتسجيل أي مبلغ يدفعه العميل (حتى لو كان أقل من الإجمالي أو أقدم فاتورة) وسيتم ملء البيان تلقائياً.';
 }
 fill();
 updatePartyDueAmountField(true);
}
const prevTransaction=window.handleSaveTransaction;window.handleSaveTransaction=function(e,...a){
 const sel=gid('transInvoice150');
 if(gid('transType').value==='collection'&&sel){
  const selected=sel.value,old=appState.treasury.find(t=>t.id===EDIT.trans),amount=Number(gid('transAmount').value);
  if(['__installment__','__opening_balance__'].includes(selected)){
   const notesEl=gid('transNotes');
   if(notesEl&&!notesEl.value.trim())notesEl.value='تنزيل دفعة';
   pendingPayOrderId=null;
  }else if(selected){
   if(amount>Settlement150.available(appState,selected,old?.id)+.001){
    e.preventDefault();
    return showToast('الدفعة أكبر من المتبقي على هذه الفاتورة. اختر «تنزيل دفعة» أو «تلقائي» لتوزيع المبلغ على الحساب.','warning');
   }
   pendingPayOrderId=selected;
  }else{
   pendingPayOrderId=null;
  }
 }
 const r=prevTransaction.call(this,e,...a);refresh();paint();return r;
};
const preview=window.previewInvoice;window.previewInvoice=function(...a){refresh();const r=preview.apply(this,a),o=appState.orders.find(x=>x.id===a[0]);if(o){const methods=new Map(),add=(m,n)=>methods.set(m,r2((methods.get(m)||0)+Number(n||0)));if(o.paymentParts149?.length)o.paymentParts149.forEach(p=>add(p.method,p.amount));else if(Number(o.paid)>0)add(o.paymentMethod||'غير محدد — حركات سابقة',o.paid);for(const t of appState.treasury){const n=settlement.allocations.get(t.id)?.parts.filter(x=>x.type==='invoice'&&x.targetId===o.id).reduce((s,x)=>s+x.amount,0)||0;if(n)add(t.paymentMethod||'غير محدد — حركات سابقة',n);}const known=[...methods.values()].reduce((a,b)=>a+b,0),adjustment=r2(orderPaid(o)-known);if(adjustment>0)add('تسويات أو رصيد سابق',adjustment);const text=gid('invPaymentMethod144'),row=gid('invPaymentMethodRow144');if(text&&row){text.textContent=[...methods].map(([m,n])=>m+': '+formatCurrency(n)).join(' • ');row.classList.toggle('hidden',!methods.size);row.classList.toggle('flex',!!methods.size);}}return r;};
window.Settlement150UI={refresh,paint,transactionUI,updatePartyDueAmountField,paid:o=>(settlement||refresh()).paid.get(o.id)??Number(o.paid||0)};refresh();transactionUI();paint();
})();
