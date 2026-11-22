'use strict';
// Verify mutations at the Electron main process: hiding buttons is not a security boundary.
const diff=(a,b)=>JSON.stringify(a??null)!==JSON.stringify(b??null);
const map=rows=>new Map((rows||[]).map(r=>[String(r.id),r]));
const can=(user,key)=>require('./permissions-650.js').can(user,key);
function assertChanges(prior,next,user){
 if(user.role==='admin')return true;
 if(diff(prior.corrections650,next.corrections650))throw Error('اعتماد تصحيح مالي يحتاج صلاحية المدير');
 if(diff(prior.externalAllocations650,next.externalAllocations650)&&(!can(user,'profit_view')||!can(user,'ops_cost')))throw Error('لا توجد صلاحية توزيع تكلفة خارجية');
 if(diff(prior.salesReturns640,next.salesReturns640))throw Error('اعتماد مرتجع المبيعات يحتاج صلاحية المدير');
 const allowed=(key,label)=>{if(!can(user,key))throw Error('غير مصرح بتغيير '+label+' بدون صلاحية '+key);};
 if(diff(prior.users,next.users))throw Error('تعديل حسابات المستخدمين يحتاج صلاحية المدير.');
 for(const key of ['shopSettings','invoiceSettings','globalSettings','appConfig','settings'])if(diff(prior[key],next[key])){
  const k=key==='shopSettings'?'sets_shop':'sets_invoice';const onlySaferPrivacy=key==='shopSettings'&&next[key]?.hideCosts===true&&!diff({...prior[key],hideCosts:true},next[key]);if(!onlySaferPrivacy)allowed(k,'إعدادات البرنامج');
 }
 const entries=(key)=>{
  const before=map(prior[key]),after=map(next[key]);
  return [...new Set([...before.keys(),...after.keys()])].filter(id=>diff(before.get(id),after.get(id))).map(id=>({id,before:before.get(id),after:after.get(id),op:!before.has(id)?'add':!after.has(id)?'delete':'edit'}));
 };
 function simple(key,perms){for(const x of entries(key))allowed(perms[x.op],key);}
 simple('serviceCatalog',{add:'svc_add',edit:'svc_edit',delete:'svc_delete'});
 simple('clients',{add:'cli_add',edit:'cli_edit',delete:'cli_delete'});
 simple('suppliers',{add:'sup_add',edit:'sup_edit',delete:'sup_delete'});
 for(const key of ['purchases','services'])for(const x of entries(key))if(x.after?.discountSchema408&&Number(x.after.discount408)>0)allowed('inv_discount','الخصومات');
 simple('purchases',{add:'pur_add',edit:'pur_edit',delete:'pur_delete'});
 const serviceEdits=entries('services');
 for(const x of serviceEdits){
  const keys=Object.keys({...x.before,...x.after}).filter(k=>diff(x.before?.[k],x.after?.[k]));
  allowed(x.op==='edit'&&keys.every(k=>k==='paid')?'svc_pay':{add:'svc_add',edit:'svc_edit',delete:'svc_delete'}[x.op],'الخدمات');
 }
 simple('quotes',{add:'quote_create',edit:'quote_convert',delete:'quote_delete'});
 for(const x of entries('orders')){
  if(x.after&&(Number(x.after.discount||0)>0||x.after.lines?.some(l=>Number(l.discount)>0))&&(x.op==='add'||diff(x.before?.discount,x.after.discount)||diff((x.before?.lines||[]).map(l=>[l.discount,l.discountType,l.discountValue]),(x.after.lines||[]).map(l=>[l.discount,l.discountType,l.discountValue]))))allowed('inv_discount','خصومات المبيعات');
  if(x.op==='add')allowed('inv_create','الفواتير');
  else if(x.op==='delete')allowed('inv_delete','الفواتير');
  else{
   const from=x.before||{},to=x.after||{};
   const nonstatus=Object.keys({...from,...to}).filter(k=>k!=='status'&&diff(from[k],to[k]));
   if(nonstatus.every(k=>['ops149'].includes(k))&&can(user,'ops_manage'))continue;
   if(nonstatus.every(k=>['ops149'].includes(k))&&JSON.stringify({...from.ops149,stage:to.ops149?.stage,history:to.ops149?.history})===JSON.stringify(to.ops149)&&can(user,'inv_status'))continue;
   if(!nonstatus.length||require('./order-status-409.js').isTransition(from,to,user.name||user.username))allowed('inv_status','حالة الفاتورة');
   else if(nonstatus.every(k=>['remaining','settledPaid150'].includes(k))){const expected=require('./settlement-150-model.js').plan(next).paid.get(to.id)||0;if(Math.abs(Number(to.settledPaid150||0)-expected)>.001||Math.abs(Number(to.remaining||0)-Math.max(0,Number(to.total)-expected))>.001)throw Error('توزيع سداد مشتق غير صحيح');}
   else allowed('inv_edit','الفواتير');
  }
 }
 const orderEdits=entries('orders'),purchaseEdits=entries('purchases');
 const invoiceTouched=orderEdits.length>0,purchaseTouched=purchaseEdits.length>0;
 // When invoice and purchase permissions also update stock, verify the exact inventory delta
 // against the changed source records rather than trusting arbitrary quantity edits.
 const expectedStock=new Map();const addStock=(id,delta)=>{if(!id)return;id=String(id);expectedStock.set(id,(expectedStock.get(id)||0)+Number(delta||0));};
 for(const change of orderEdits){
  for(const line of change.before?.stockUsed||[])addStock(line.itemId,Number(line.qty||0));
  for(const line of change.after?.stockUsed||[])addStock(line.itemId,-Number(line.qty||0));
 }
 for(const change of purchaseEdits){
  if(change.before)addStock(change.before.itemId,-Number(change.before.qty||0));
  if(change.after)addStock(change.after.itemId,Number(change.after.qty||0));
 }
 for(const [id,delta]of expectedStock){
  const before=(prior.items||[]).find(i=>String(i.id)===id),after=(next.items||[]).find(i=>String(i.id)===id);
  if(!before||!after||Math.abs(Number(after.qty)-Number(before.qty)-delta)>0.00011)throw Error('حركة المخزون لا تطابق مستندها: '+id);
 }

 for(const x of entries('items')){
  if(x.op==='add'){allowed('stock_add','الخامات');continue;}
  if(x.op==='delete'){allowed('stock_delete','الخامات');continue;}
  const keys=Object.keys({...x.before,...x.after}).filter(k=>diff(x.before?.[k],x.after?.[k]));
  const moved=Number(x.after?.qty||0)-Number(x.before?.qty||0);
  const sourceDelta=expectedStock.get(String(x.id))||0;
  const stockMatches=Math.abs(moved-sourceDelta)<=0.00011;
  if(keys.every(k=>['qty','lastActualCount'].includes(k))&&can(user,'stock_adjust'))continue;
  if(keys.every(k=>['qty','lastActualCount'].includes(k))&&(invoiceTouched||purchaseTouched)&&stockMatches)continue;
  if(keys.every(k=>['qty','lastActualCount','buyPrice','avgCost166'].includes(k))&&purchaseTouched&&stockMatches){
   let expectedValue=Number(x.before.qty)*Number(x.before.avgCost166??x.before.buyPrice??0);
   for(const change of purchaseEdits){
    if(String(change.before?.itemId)===String(x.id))expectedValue-=(change.before.discountSchema408?Number(change.before.total):Number(change.before.qty)*Number(change.before.unitPrice));
    if(String(change.after?.itemId)===String(x.id))expectedValue+=(change.after.discountSchema408?Number(change.after.total):Number(change.after.qty)*Number(change.after.unitPrice));
   }
   const actualValue=Number(x.after.qty)*Number(x.after.avgCost166??x.after.buyPrice??0);
   if(Math.abs(actualValue-expectedValue)>Math.max(.01,(Number(x.after.qty)+Number(x.before.qty))*.00011))throw Error('قيمة المخزون لا تطابق تكلفة الوارد');
   if(keys.includes('buyPrice')&&!purchaseEdits.some(p=>String(p.after?.itemId)===String(x.id)&&Number(p.after.discountSchema408?Math.round(Number(p.after.total)/Number(p.after.qty)*10000)/10000:p.after.unitPrice)===Number(x.after.buyPrice)))throw Error('سعر الشراء لا يطابق الوارد');
   continue;
  }
  if(keys.every(k=>['qty','lastActualCount','avgCost166'].includes(k))&&invoiceTouched&&stockMatches){
   let expectedValue=Number(x.before.qty)*Number(x.before.avgCost166??x.before.buyPrice??0);
   for(const change of orderEdits){
    for(const [doc,sign]of [[change.before,1],[change.after,-1]])for(const line of doc?.stockUsed||[])if(String(line.itemId)===String(x.id)){
     const cost=(doc.costSnapshot149||[]).find(c=>String(c.itemId)===String(x.id))?.unitCost??x.before.avgCost166??x.before.buyPrice??0;
     expectedValue+=sign*Number(line.qty)*Number(cost);
    }
   }
   const actualValue=Number(x.after.qty)*Number(x.after.avgCost166??x.after.buyPrice??0);
   if(Math.abs(actualValue-expectedValue)>Math.max(.01,Number(x.after.qty)*.00011))throw Error('قيمة المخزون لا تطابق تكلفة الفاتورة');
   continue;
  }
  allowed('stock_edit','الخامات');
 }
 for(const x of entries('treasury')){
  if(x.op==='add'&&x.after?.kind==='service_payment'&&serviceEdits.some(s=>String(s.id)===String(x.after.serviceId)))continue;
  if(x.op==='delete'&&x.before?.kind==='service_payment'&&serviceEdits.some(s=>s.op==='delete'&&String(s.id)===String(x.before.serviceId)))continue;
  if(x.op==='add'&&x.after?.kind==='deposit'&&invoiceTouched&&orderEdits.some(o=>String(o.id)===String(x.after.orderId)))continue;
  if(x.op==='add'&&x.after?.kind==='purchase_payment'&&purchaseTouched&&purchaseEdits.some(p=>String(p.id)===String(x.after.purchaseId)))continue;
  if(x.op==='delete'&&x.before?.kind==='deposit'&&invoiceTouched&&orderEdits.some(o=>String(o.id)===String(x.before.orderId)))continue;
  if(x.op==='delete'&&x.before?.kind==='purchase_payment'&&purchaseTouched&&purchaseEdits.some(p=>String(p.id)===String(x.before.purchaseId)))continue;
  allowed({add:'tre_add',edit:'tre_edit',delete:'tre_delete'}[x.op],'الخزينة');
 }
 for(const x of entries('stockAdjustments153'))allowed(x.op==='add'?'stock_adjust':'stock_edit','الجرد');
 for(const x of entries('costs149'))allowed('ops_cost','تكاليف التشغيل');
 for(const x of entries('waste149'))allowed('ops_waste','الهالك');
 for(const x of entries('shifts149'))allowed('ops_shift','الورديات');
 for(const x of entries('reservations149'))allowed('ops_reserve','حجز الخامات');
 for(const x of entries('adjustments'))throw Error('التسويات المحاسبية تتطلب صلاحية المدير.');
 return true;
}
module.exports={can,assertChanges};
