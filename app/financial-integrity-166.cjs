'use strict';
// Validation is applied at the trusted persistence boundary, not only within UI forms.
const M=require('./operations-149-model.js');
const Decimal=require('./accounting-math-401.js');
const isFilled=v=>v!==undefined&&v!==null&&v!=='';
function number(v,label,{positive=false,allowNegative=false}={}){
 if(!isFilled(v))return null;const n=Number(v);
 if(!['number','string'].includes(typeof v)||String(v).trim()===''||!Number.isFinite(n)||Math.abs(n)>1e12||!allowNegative&&n<0||positive&&n<=0)throw Error('بيانات محاسبية غير صحيحة: '+label);
 return n;
}
const cents=(v)=>Number(Decimal.scaled(v,2));
function qty(v,label,{positive=false}={}){
 const n=number(v,label,{positive});
 if(n!==null&&Math.abs(n-M.money(n*100)/100)>1e-8)throw Error('كمية غير صالحة (بحد أقصى 4 منازل): '+label);
 return n;
}
function validate(state){
 const s=state||{};
 for(const name of ['users','clients','suppliers','items','orders','purchases','treasury','adjustments','services','quotes','costs149','waste149','stockAdjustments153','reservations149','shifts149']){
  if(s[name]!==undefined&&!Array.isArray(s[name]))throw Error('قائمة بيانات غير صالحة: '+name);
  const seen=new Set();
  for(const row of s[name]||[]){
   if(!row||typeof row!=='object'||typeof row.id!=='string'||!row.id||/['"<>\\\r\n\0]/.test(row.id)||seen.has(row.id))throw Error('رقم سجل غير صالح أو مكرر: '+name);
   seen.add(row.id);
   for(const field of ['total','paid','remaining','settledPaid150','inAmount','outAmount','amount','due','debit','credit','initialBalance','balance','subtotal','discount','invDiscount','lineDiscount','valueDelta']){
    if(isFilled(row[field])){
     const value=number(row[field],name+' / '+field,{allowNegative:['initialBalance','balance','valueDelta'].includes(field)});
     if(Math.abs(value-Decimal.round(value,2))>1e-8)throw Error('المبلغ يقبل منزلتين عشريتين فقط: '+name+' / '+field);
    }
   }
  }
 }
 for(const c of s.clients||[])number(c.initialBalance,'رصيد افتتاحي للعميل',{allowNegative:true});
 for(const v of s.suppliers||[])number(v.balance,'رصيد افتتاحي للمورد',{allowNegative:true});
 const ids=name=>new Set((s[name]||[]).map(o=>String(o.id)));
 const clients=ids('clients'),suppliers=ids('suppliers'),items=ids('items'),orders=ids('orders'),purchases=ids('purchases'),quotes=ids('quotes'),services=ids('services');
 const linked=(obj,key,refs,label)=>{if(isFilled(obj[key])&&!refs.has(String(obj[key])))throw Error('مرجع غير موجود في '+label+': '+String(obj[key]));};
 const n=(obj,key,label,opts)=>number(obj[key],label+' / '+key,opts);
 for(const item of s.items||[]){qty(item.qty,'رصيد المخزن '+(item.name||item.id));for(const k of ['buyPrice','sellPrice','avgCost166','minQty'])n(item,k,'المخزن '+item.id);}
 for(const o of s.orders||[]){
  const label='فاتورة '+(o.orderNo||o.id),total=n(o,'total',label),paid=n(o,'paid',label);
  if(total!==null&&paid!==null&&paid>total+0.011)throw Error('المدفوع أكبر من إجمالي '+label);
  linked(o,'clientId',clients,label);
  if(isFilled(o.remaining))n(o,'remaining',label);
  if(isFilled(o.settledPaid150)){n(o,'settledPaid150',label);if(total!==null&&Number(o.settledPaid150)>total+0.011)throw Error('تحصيلات الفاتورة تتجاوز إجماليها: '+label);}
  for(const line of [...(o.lines||[]),...(o.stockUsed||[]),...(o.costSnapshot149||[])]){
   linked(line,'itemId',items,label);if(isFilled(line.qty))qty(line.qty,label+' / كمية',{positive:true});
   for(const field of ['price','unitCost','total','amount'])n(line,field,label);
  }
  for(const part of o.paymentParts149||[])n(part,'amount',label);
  if((o.paymentParts149||[]).length)M.split(o.paymentParts149,Number(o.paid||0));
  // Fully itemized documents must agree with the source lines and discounts.
  if(isFilled(o.subtotal)&&isFilled(o.discount)){
   const subtotal=n(o,'subtotal',label),discount=n(o,'discount',label);
   if(total!==null&&(discount>subtotal||cents(total)!==cents(subtotal-discount)))throw Error('إجمالي وخصم الفاتورة غير متطابقين: '+label);
   if((o.lines||[]).length&&o.lines.every(l=>isFilled(l.price)&&isFilled(l.qty))){
    const gross=o.lines.reduce((sum,l)=>sum+cents(Decimal.lineTotal(l.qty,l.price)),0);
    if(cents(subtotal)!==gross)throw Error('مجموع بنود الفاتورة لا يساوي الإجمالي قبل الخصم: '+label);
    let discounts=0;
    for(const l of o.lines){const g=Decimal.lineTotal(l.qty,l.price),d=number(l.discount,'خصم البند')||0;discounts+=cents(d);if(d>g||isFilled(l.amount)&&cents(l.amount)!==cents(g-d))throw Error('صافي بند الفاتورة غير صحيح: '+label);}
    if(isFilled(o.invDiscount)&&cents(discount)!==discounts+cents(o.invDiscount))throw Error('مجموع الخصومات غير صحيح: '+label);
   }
  }
  if(isFilled(o.extraDeduct?.itemId))linked(o.extraDeduct,'itemId',items,label);
 }
 for(const p of s.purchases||[]){
  const label='وارد '+p.id,q=qty(p.qty,label+' / كمية',{positive:true}),price=n(p,'unitPrice',label),total=n(p,'total',label),paid=n(p,'paid',label),due=n(p,'due',label);
  linked(p,'itemId',items,label);linked(p,'supplierId',suppliers,label);
  if(total!==null&&paid!==null&&paid>total+0.011)throw Error('المدفوع يتجاوز إجمالي '+label);
  if(q!==null&&price!==null&&total!==null&&cents(Decimal.lineTotal(q,price))-cents(p.discountSchema408?(n(p,'lineDiscount408',label)||0)+(n(p,'invoiceDiscount408',label)||0):0)!==cents(total))throw Error('إجمالي الوارد لا يساوي الكمية × سعر الوحدة: '+label);
  if(p.discountSchema408){const D=require('./discounts-408.js');if(cents(D.discount(Decimal.lineTotal(q,price),p.discountType,p.discountValue))!==cents(p.lineDiscount408)||cents(p.gross408)!==cents(Decimal.lineTotal(q,price)))throw Error('تفاصيل خصم الوارد غير متطابقة');}
  if(due!==null&&total!==null&&paid!==null&&cents(due)!==cents(total-paid))throw Error('المتبقي على الوارد غير صحيح: '+label);
 }
 for(const t of s.treasury||[]){
  const label='حركة خزينة '+t.id,a=n(t,'inAmount',label)??0,b=n(t,'outAmount',label)??0;
  if(a>0&&b>0||a===0&&b===0)throw Error('حركة الخزينة يلزم أن تكون في اتجاه مالي واحد: '+label);
  linked(t,'clientId',clients,label);linked(t,'supplierId',suppliers,label);linked(t,'orderId',orders,label);linked(t,'purchaseId',purchases,label);
  if(t.orderId&&t.clientId){const o=(s.orders||[]).find(o=>String(o.id)===String(t.orderId));if(o&&String(o.clientId)!==String(t.clientId))throw Error('عميل سند الخزينة مختلف عن الفاتورة: '+label);}
  linked(t,'serviceId',services,label);
  if(['collection','manual_deposit','service_in'].includes(t.type)&&b>0||['supplier_payment','expense','service_out'].includes(t.type)&&a>0)throw Error('اتجاه سند الخزينة لا يطابق نوعه: '+label);
  if(t.purchaseId&&t.supplierId){const p=(s.purchases||[]).find(p=>p.id===t.purchaseId);if(p&&p.supplierId!==t.supplierId)throw Error('مورد سند السداد لا يطابق الوارد: '+label);}
 }
 for(const a of s.adjustments||[]){
  const label='تسوية '+a.id;if(a.party==='client')linked(a,'partyId',clients,label);else if(a.party==='supplier')linked(a,'partyId',suppliers,label);
  const debit=n(a,'debit',label)??0,credit=n(a,'credit',label)??0;
  if(debit>0&&credit>0)throw Error('التسوية بها مدين ودائن في وقت واحد: '+label);
 }
 for(const v of s.services||[]){
  if(v.discountSchema408&&!v.external407){const D=require('./discounts-408.js');if(cents(v.amount)!==cents(v.gross408)-cents(v.discount408)||cents(D.discount(v.gross408,v.invoiceDiscountType408,v.invoiceDiscountValue408))!==cents(v.discount408))throw Error('خصم الخدمة غير متطابق');}
  const label='خدمة '+v.id;if(v.partyType==='client')linked(v,'partyId',clients,label);else if(v.partyType==='supplier')linked(v,'partyId',suppliers,label);
  const amount=n(v,'amount',label),paid=n(v,'paid',label);if(amount!==null&&paid!==null&&paid>amount+0.011)throw Error('المدفوع يزيد على قيمة '+label);
 }
 // Verify linked cash once, grouped in linear time for large databases.
 const totals={deposit:new Map(),purchase:new Map(),service:new Map()};
 for(const t of s.treasury||[]){
  let group,id,value;
  if(t.kind==='deposit'){group='deposit';id=t.orderId;value=t.inAmount;if(!id||t.type!=='collection'||Number(t.outAmount||0)>0)throw Error('قيد عربون غير صحيح');}
  else if(t.kind==='purchase_payment'){group='purchase';id=t.purchaseId;value=t.outAmount;if(!id||t.type!=='supplier_payment'||Number(t.inAmount||0)>0)throw Error('قيد سداد وارد غير صحيح');}
  else if(t.kind==='service_payment'){group='service';id=t.serviceId;value=Number(t.inAmount||0)+Number(t.outAmount||0);if(!id)throw Error('قيد خدمة بلا مرجع');const service=(s.services||[]).find(v=>v.id===id);if(service&&((service.kind==='provided')!==(Number(t.inAmount||0)>0)))throw Error('اتجاه دفعة الخدمة غير صحيح');}
  if(group)totals[group].set(id,(totals[group].get(id)||0)+cents(value||0));
 }
 for(const [name,key,group]of [['orders','paid','deposit'],['purchases','paid','purchase'],['services','paid','service']])for(const record of s[name]||[]){
  const linked=totals[group].get(record.id);
  if(linked!==undefined&&linked!==cents(record[key]||0))throw Error('سندات الخزينة لا تساوي المدفوع في '+name+': '+record.id);
  if(name==='services'&&record.inTreasury&&Number(record.paid)>0&&linked===undefined)throw Error('دفعة الخدمة لم تُسجل بالخزينة');
  if(name==='purchases'&&record.receiptBatch400&&Number(record.paid)>0&&linked===undefined)throw Error('دفعة الوارد لم تُسجل بالخزينة');
  if(name==='orders'&&Array.isArray(record.costSnapshot149)&&Number(record.paid)>0&&linked===undefined)throw Error('عربون الفاتورة لم يُسجل بالخزينة');
 }
 for(const x of s.stockAdjustments153||[]){
  linked(x,'itemId',items,'الجرد');
  const b=qty(x.bookQty,'الجرد: قبل'),a=qty(x.actualQty,'الجرد: بعد'),d=number(x.deltaQty,'الجرد: فرق',{allowNegative:true}),cost=n(x,'unitCost','الجرد'),value=number(x.valueDelta,'الجرد: قيمة الفرق',{allowNegative:true});
  if(a!==null&&b!==null&&d!==null&&Math.abs(a-b-d)>0.00011)throw Error('فرق كمية الجرد غير متطابق');
  if(cost!==null&&d!==null&&value!==null&&Math.abs(cents(cost*d)-cents(value))>2)throw Error('قيمة فرق الجرد غير صحيحة');
 }
 for(const c of s.costs149||[]){n(c,'amount','تكلفة تشغيل '+c.id,{positive:!c.voidAt});if(!c.voidAt)linked(c,'orderId',orders,'تكلفة التشغيل');}
 for(const w of s.waste149||[]){if(!w.voidAt){qty(w.qty,'هالك '+w.id,{positive:true});n(w,'unitCost','هالك '+w.id);linked(w,'itemId',items,'الهالك');linked(w,'orderId',orders,'الهالك');}}
 for(const r of s.reservations149||[]){if(r.status==='active'){linked(r,'quoteId',quotes,'الحجز');for(const l of r.lines||[]){linked(l,'itemId',items,'الحجز');qty(l.qty,'كمية الحجز',{positive:true});}}}
 return true;
}
const AUDIT_COLLECTIONS=['orders','purchases','treasury','adjustments','services','stockAdjustments153','costs149','waste149'];
function preserveDeletionLog(state,previous){
 const history=Array.isArray(previous?.auditTrail166)?previous.auditTrail166:[];
 const additions=[];
 for(const collection of AUDIT_COLLECTIONS){
  const remaining=new Map((state[collection]||[]).map(r=>[String(r.id),r]));
  for(const record of previous?.[collection]||[]){
   if(!remaining.has(String(record.id)))additions.push({id:require('node:crypto').randomUUID(),at:new Date().toISOString(),action:'delete',collection,recordId:String(record.id),actor:String(state.currentUser||previous.currentUser||''),before:record});
   else {
    const after=remaining.get(String(record.id));
    const clean=r=>Object.fromEntries(Object.entries(r).filter(([k])=>!['remaining','settledPaid150'].includes(k)));
    if(JSON.stringify(clean(record))!==JSON.stringify(clean(after)))additions.push({id:require('node:crypto').randomUUID(),at:new Date().toISOString(),action:'edit',collection,recordId:String(record.id),actor:String(state.currentUser||previous.currentUser||''),before:record,after});
   }
  }
 }
 state.auditTrail166=[...history,...additions];
 return additions.length;
}
module.exports={validate,preserveDeletionLog};
