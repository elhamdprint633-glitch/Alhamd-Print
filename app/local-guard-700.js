/* Generated from the same desktop validation sources; run build/bundle-mobile-guard.py to regenerate. */
(function(root){'use strict';const modules=Object.create(null),cache=Object.create(null);function require(name){if(name==='node:crypto')return{randomUUID:()=>crypto.randomUUID()};name=name.replace(/^\.\//,'');if(cache[name])return cache[name].exports;if(!modules[name])throw Error('Unsupported guard module: '+name);const m={exports:{}};cache[name]=m;modules[name](m,m.exports,require);return m.exports;}
modules['financial-integrity-166.cjs']=function(module,exports,require){
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

};
modules['operations-149-model.js']=function(module,exports,require){
(function(root){'use strict';
const Decimal=typeof module!=='undefined'&&module.exports?require('./accounting-math-401.js'):root.AccountingMath401;
const money=v=>Decimal.round(Number(v)||0,2),quantity=v=>Decimal.round(Number(v)||0,4),positive=(v,name,zero=true)=>{const n=Number(v);if(!Number.isFinite(n)||n<0||(!zero&&n===0))throw Error('قيمة غير صالحة: '+name);return money(n);};
const stages=['انتظار التصميم','اعتماد العميل','الطباعة','التشطيب','جاهز للتسليم','تم التسليم'];
const specFields=[['color','لون الخامة'],['size','المقاس'],['ink','ألوان الطباعة'],['sides','الوش / الظهر'],['finish','التشطيب'],['material','نوع الخامة']];
const text=(x,n=500)=>String(x??'').trim().slice(0,n);
function rule(r){const tiers=(r.tiers||[]).map(t=>({min:positive(t.min,'بداية الشريحة',false),max:t.max===''||t.max==null?null:positive(t.max,'نهاية الشريحة',false),price:positive(t.price,'السعر')})).sort((a,b)=>a.min-b.min);for(let i=0;i<tiers.length;i++){const t=tiers[i];if(t.max!==null&&t.max<t.min||i&&((tiers[i-1].max===null)||t.min<=tiers[i-1].max))throw Error('شرائح الكمية متداخلة أو غير صحيحة');}return {...r,ref:text(r.ref,160),tiers,extraColor:positive(r.extraColor||0,'اللون الإضافي'),back:positive(r.back||0,'الظهر'),setup:positive(r.setup||0,'التجهيز'),minimum:positive(r.minimum||0,'الحد الأدنى')};}
function price(r,qty,colors=1,sides=1){r=rule(r);const t=r.tiers.find(t=>qty>=t.min&&(t.max===null||qty<=t.max));return t?money(t.price+Math.max(0,colors-1)*r.extraColor+(sides===2?r.back:0)):null;}
function split(rows,paid){const map=new Map();for(const r of rows||[]){const n=positive(r.amount,'الدفعة');if(!n)continue;const method=text(r.method,80);if(!method)throw Error('اختر طريقة الدفع لكل جزء');map.set(method,money((map.get(method)||0)+n));}const out=[...map].map(([method,amount])=>({method,amount}));if(money(out.reduce((s,r)=>s+r.amount,0))!==money(paid))throw Error('مجموع طرق الدفع يجب أن يساوي المدفوع في الفاتورة');return out;}
function reserved(state,itemId,exclude){return quantity((state.reservations149||[]).filter(r=>r.status==='active'&&r.quoteId!==exclude&&state.quotes?.some(q=>q.id===r.quoteId&&q.status!=='تم التحويل'&&q.status!=='مرفوض')).reduce((s,r)=>s+(r.lines||[]).filter(l=>l.itemId===itemId).reduce((a,l)=>a+Number(l.qty||0),0),0));}
function demand(lines,extra){const out=new Map();for(const l of [...(lines||[]),...(extra?[extra]:[])])if(l.itemId&&l.kind!=='service')out.set(l.itemId,quantity((out.get(l.itemId)||0)+quantity(l.qty)));return [...out].map(([itemId,qty])=>({itemId,qty}));}
function reserve(state,quote,id){if(!quote||['تم التحويل','مرفوض'].includes(quote.status))throw Error('هذا العرض لا يقبل الحجز');const lines=demand(quote.lines);if(!lines.length)throw Error('لا توجد أصناف مخزن مرتبطة بهذا العرض');for(const l of lines){const item=state.items.find(i=>i.id===l.itemId);if(!item||l.qty>Number(item.qty)-reserved(state,l.itemId,quote.id))throw Error('الرصيد المتاح للحجز غير كافٍ: '+(item?.name||l.itemId));}return{id,quoteId:quote.id,status:'active',at:new Date().toISOString(),lines};}
function wallet(state){const map={};for(const t of state.treasury||[]){const m=root.Features147?.methodOf(t,state.orders,state.purchases)||text(t.paymentMethod)||'غير محدد — حركات سابقة';map[m]=money((map[m]||0)+Number(t.inAmount||0)-Number(t.outAmount||0));}return map;}
function shiftExpected(shift,state){const now=wallet(state),out={};for(const m of new Set([...Object.keys(shift.baseline||{}),...Object.keys(now),...Object.keys(shift.opening||{})]))out[m]=money((shift.opening?.[m]||0)+(now[m]||0)-(shift.baseline?.[m]||0));return out;}
function profit(state,order){
 if((state.externalAllocations650||[]).length||(state.corrections650||[]).length||(state.adjustments||[]).some(a=>a.discount408)){
  const B=typeof module==='object'?require('./workspace-650.js'):root.Workspace650;
  if(B){const s={...state,orders:[...(state.orders||[]).filter(o=>o.id!==order.id),order]},r=B.profit(s,{orderId:order.id}).rows[0];if(!r||r.profit===null)return null;const out={stock:r.stock,extra:money(r.extra+r.external),waste:r.waste,cost:r.cost,profit:r.profit};if(r.returns){out.returns640=r.returns;out.returnedStock640=money((order.costSnapshot149||[]).reduce((n,l)=>n+Number(l.qty)*Number(l.unitCost),0)-r.stock);}return out;}
 }
 const base=order.costSnapshot149;if(!base)return null;const stock=money(base.reduce((s,x)=>s+Number(x.qty||0)*Number(x.unitCost||0),0)),extra=money((state.costs149||[]).filter(c=>!c.voidAt&&!(state.corrections650||[]).some(n=>n.collection==='costs149'&&n.recordId===c.id)&&c.orderId===order.id).reduce((s,c)=>s+Number(c.amount||0),0)),waste=money((state.waste149||[]).filter(w=>!w.voidAt&&!(state.corrections650||[]).some(n=>n.collection==='waste149'&&n.recordId===w.id)&&w.orderId===order.id&&w.chargedTo==='shop').reduce((s,w)=>s+Number(w.qty)*Number(w.unitCost),0));const returns=(state.salesReturns640||[]).filter(n=>n.orderId===order.id);if(!returns.length)return {stock,extra,waste,cost:money(stock+extra+waste),profit:money(order.total-stock-extra-waste)};const returnedStock640=money(returns.flatMap(n=>n.stock||[]).reduce((n,l)=>n+Number(l.qty)*Number(l.unitCost),0)),returns640=money(returns.reduce((n,r)=>n+Number(r.total),0)),netStock=money(stock-returnedStock640);return {stock:netStock,extra,waste,cost:money(netStock+extra+waste),profit:money(order.total-returns640-netStock-extra-waste),returns640,returnedStock640};}
function validate(s){if(!s||!Array.isArray(s.users)||!s.users.length||!Array.isArray(s.orders)||!Array.isArray(s.items)||!Array.isArray(s.treasury))throw Error('نسخة غير صالحة');for(const k of ['orders','items','treasury','quotes','shifts149','reservations149','waste149','costs149']){const seen=new Set();for(const r of s[k]||[]){if(!r||typeof r.id!=='string'||seen.has(r.id))throw Error('سجل غير صالح أو مكرر في '+k);seen.add(r.id);}}for(const t of s.treasury)if(!Number.isFinite(Number(t.inAmount||0))||!Number.isFinite(Number(t.outAmount||0))||Number(t.inAmount||0)<0||Number(t.outAmount||0)<0)throw Error('حركة مالية غير صالحة');return true;}
function validateOperations(s){for(const i of s.items||[])if(Number(i.qty)+0.00001<reserved(s,i.id))throw Error('الرصيد أقل من الخامات المحجوزة. حرر الحجز أو حدّث التطبيق أولاً.');if((s.shifts149||[]).filter(x=>!x.closedAt).length>1)throw Error('يوجد أكثر من وردية مفتوحة');for(const o of s.orders||[])if(o.paymentParts149?.length)split(o.paymentParts149,o.paid);return true;}
const api={money,quantity,positive,text,stages,specFields,rule,price,split,reserved,demand,reserve,wallet,shiftExpected,profit,validate,validateOperations};root.Operations149=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);

};
modules['accounting-math-401.js']=function(module,exports,require){
(function(root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) root.AccountingMath401 = api;
})(typeof window !== 'undefined' ? window : null, function() {
    'use strict';
    // Decimal rounding, half away from zero. Avoid binary-float half-cent errors.
    function scaled(value, places) {
        if (typeof value === 'boolean' || value === null || String(value).trim() === '' || !Number.isFinite(Number(value))) throw Error('قيمة رقمية غير صالحة');
        const match = String(value).trim().match(/^([+-]?)(\d*)(?:\.(\d*))?(?:e([+-]?\d+))?$/i);
        if (!match || !(match[2] || match[3]) || !Number.isInteger(places) || places < 0 || places > 8) throw Error('قيمة عشرية غير صالحة');
        const sign = match[1] === '-' ? -1n : 1n;
        const digits = BigInt((match[2] || '') + (match[3] || ''));
        const shift = places + Number(match[4] || 0) - (match[3] || '').length;
        if (Math.abs(shift) > 400) throw Error('قيمة خارج الحدود المسموحة');
        if (shift >= 0) return sign * digits * 10n ** BigInt(shift);
        const divisor = 10n ** BigInt(-shift);
        return sign * ((digits + divisor / 2n) / divisor);
    }
    const round = (value, places = 2) => Number(scaled(value, places)) / 10 ** places;
    function lineTotal(qty, price) {
        const product = scaled(qty, 4) * scaled(price, 4);
        const absolute = product < 0n ? -product : product;
        return Number((product < 0n ? -1n : 1n) * ((absolute + 500000n) / 1000000n)) / 100;
    }
    function reversePurchase(item, purchase) {
        const qty = round(Number(item.qty) - Number(purchase.qty), 4);
        if (qty < 0) throw Error('لا يمكن عكس وارد تم استهلاك كميته؛ سجّل تسوية موثقة بدلاً من حذف الوارد');
        const value = Number(item.qty) * Number(item.avgCost166 ?? item.buyPrice ?? 0) - (purchase.discountSchema408?Number(purchase.total):Number(purchase.qty) * Number(purchase.unitPrice));
        // Never conceal a negative residual value by replacing it with zero.
        // A consumed receipt needs a cost adjustment, not retroactive cancellation.
        const tolerance = Math.max(0.005, Math.abs(Number(item.qty)) * 0.000051);
        if (value < -tolerance || qty === 0 && Math.abs(value) > tolerance) throw Error('عكس الوارد سيشوّه قيمة المخزون بعد الاستهلاك؛ سجّل تسوية موثقة');
        return {qty, average: qty > 0 ? round(Math.max(0, value) / qty, 4) : 0};
    }
    function returnedAverage(item, qty, unitCost) {
        const totalQty = round(Number(item.qty) + Number(qty), 4);
        return totalQty > 0 ? round((Number(item.qty) * Number(item.avgCost166 ?? item.buyPrice ?? 0) + Number(qty) * Number(unitCost)) / totalQty, 4) : 0;
    }
    function replacementCost(qty, oldQty, oldCost, currentCost) {
        if (!(Number(qty) > 0)) throw Error('كمية غير صالحة');
        const retained = Math.min(Number(qty), Number(oldQty) || 0);
        return round((retained * Number(oldCost) + (Number(qty) - retained) * Number(currentCost)) / Number(qty), 4);
    }
    function consumedAverage(item, qty, unitCost) {
        const left = round(Number(item.qty) - Number(qty), 4);
        if (left < 0) throw Error('المخزون غير كافٍ');
        const value = Number(item.qty) * Number(item.avgCost166 ?? item.buyPrice ?? 0) - Number(qty) * Number(unitCost);
        if (value < -Math.max(.01,Number(item.qty)*.00011)) throw Error('تكلفة الخصم تتجاوز قيمة المخزون');
        return left > 0 ? round(Math.max(0,value)/left,4) : 0;
    }
    const treasuryBalance = rows => Number(rows.reduce((sum,t)=>sum+scaled(t.inAmount||0,2)-scaled(t.outAmount||0,2),0n))/100;
    return Object.freeze({treasuryBalance, scaled, round, lineTotal, reversePurchase, returnedAverage, replacementCost, consumedAverage});
});

};
modules['workspace-650.js']=function(module,exports,require){
(function(root,factory){const api=factory(typeof module==='object'?require('./accounting-math-401.js'):root.AccountingMath401,typeof module==='object'?require('./party-ledger-411.js'):root.PartyLedger411,typeof module==='object'?require('./sales-returns-640.js'):root.SalesReturns640,typeof module==='object'?require('./corrections-650.js'):root.Corrections650,typeof module==='object'?require('./workflow-650.js'):root.Workflow650);if(typeof module==='object')module.exports=api;else root.Workspace650=api;})(globalThis,function(M,P,R,C,W){'use strict';
const rows=(s,k)=>s[k]||[],clone=x=>JSON.parse(JSON.stringify(x)),c=x=>M.scaled(x||0,2),cash=x=>Number(x)/100,sum=a=>cash(a.reduce((n,v)=>n+c(v),0n)),need=(ok,msg)=>{if(!ok)throw Error(msg);},same=(a,b)=>JSON.stringify(a??null)===JSON.stringify(b??null);
const costSum=ls=>{const total=ls.reduce((n,l)=>n+M.scaled(l.qty||0,4)*M.scaled(l.unitCost||0,4),0n);return cash((total+500000n)/1000000n);};
const widgets=['due', 'late', 'proof', 'receivables', 'ready', 'printing', 'approval', 'active', 'lowStock', 'supplierDue', 'salesToday', 'purchasesToday', 'quotesToday', 'cashToday'],commands=['new','cashier','clients','purchases','services','treasury','kanban','today','profit','journal','search'];
function recent(s,clientId,limit=24){if(!clientId)return[];const map=new Map();for(const o of rows(s,'orders').filter(o=>o.clientId===clientId&&!['ملغي','ملغاة'].includes(o.status)).slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))||Number(b.orderNo)-Number(a.orderNo))){for(const l of o.lines||[]){const key=l.itemId?'item:'+l.itemId:l.serviceCatalogId?'service:'+l.serviceCatalogId:'text:'+l.desc;if(map.has(key))continue;const i=l.itemId?rows(s,'items').find(i=>i.id===l.itemId):null;if(l.itemId&&!i)continue;map.set(key,{key,orderId:o.id,orderNo:o.orderNo,date:o.date,desc:l.desc,qty:l.qty,price:l.price,line:clone(l)});}}return [...map.values()].slice(0,limit);}
function today(s,date){const active=rows(s,'orders').filter(W.active),balances=P.balances(s),onDate=x=>String(x.date||'').slice(0,10)===date,stage=o=>o.ops149?.stage||o.status;return {due:active.filter(o=>String(o.ops149?.due||o.deliveryDate||'').slice(0,10)===date),late:active.filter(o=>{const d=String(o.ops149?.due||o.deliveryDate||'').slice(0,10);return d&&d<date;}),proof:active.filter(o=>W.gated(o)&&!W.approval(s,o)),receivables:rows(s,'clients').map(x=>({...x,due650:balances.clients.get(x.id)||0})).filter(x=>x.due650>0).sort((a,b)=>b.due650-a.due650),ready:active.filter(o=>stage(o)==='جاهز للتسليم'),printing:active.filter(o=>stage(o)==='الطباعة'),approval:active.filter(o=>stage(o)==='اعتماد العميل'),active,lowStock:rows(s,'items').filter(x=>Number(x.minQty)>0&&Number(x.qty)<=Number(x.minQty)),supplierDue:rows(s,'suppliers').map(x=>({...x,due650:balances.suppliers.get(x.id)||0})).filter(x=>x.due650>0).sort((a,b)=>b.due650-a.due650),salesToday:rows(s,'orders').filter(o=>onDate(o)&&!['ملغي','ملغاة'].includes(o.status)),purchasesToday:rows(s,'purchases').filter(onDate),quotesToday:rows(s,'quotes').filter(onDate),cashToday:rows(s,'treasury').filter(onDate)};}

function allocations(s){const seen=new Set(),totals=new Map();for(const a of rows(s,'externalAllocations650')){need(a.id&&!seen.has(a.id),'رقم ربط تكلفة مكرر');seen.add(a.id);const service=rows(s,'services').find(v=>v.id===a.serviceId),order=rows(s,'orders').find(o=>o.id===a.orderId);need(service&&order&&service.kind==='received','حدد خدمة خارجية واردة وأمر تشغيل صالح');need(Number(a.amount)>0&&c(a.amount)<=c(service.amount),'قيمة ربط الخدمة غير صالحة');need(!rows(s,'costs149').some(x=>!x.voidAt&&(x.serviceId===service.id||x.sourceServiceId===service.id||rows(s,'treasury').some(t=>t.id===x.treasuryId&&t.serviceId===service.id))),'الخدمة مربوطة بالفعل في تكاليف التشغيل');const n=(totals.get(service.id)||0n)+c(a.amount);need(n<=c(service.amount),'مجموع توزيع الخدمة يتجاوز صافي قيمتها');totals.set(service.id,n);}return totals;}
function profit(s,{from='',to='',orderId=''}={}){allocations(s);const discounts=R.discountIndex(s),out=[];
 for(const o of rows(s,'orders').filter(o=>(!orderId||o.id===orderId)&&(!from||String(o.date).slice(0,10)>=from)&&(!to||String(o.date).slice(0,10)<=to)&&!['ملغي','ملغاة'].includes(o.status))){const returns=rows(s,'salesReturns640').filter(n=>n.orderId===o.id),returned=sum(returns.map(n=>n.total)),settlement=cash(discounts.get(o.id)||0n),revenue=sum([o.total,-returned,-settlement]),known=Array.isArray(o.costSnapshot149),stock=known?sum([costSum(o.costSnapshot149),-costSum(returns.flatMap(n=>n.stock||[]))]):null,extra=sum(rows(s,'costs149').filter(x=>x.orderId===o.id&&!x.voidAt&&!C.reversed(s,'costs149',x.id)).map(x=>x.amount)),waste=sum(rows(s,'waste149').filter(x=>x.orderId===o.id&&!x.voidAt&&x.chargedTo==='shop'&&!C.reversed(s,'waste149',x.id)).map(x=>M.lineTotal(x.qty,x.unitCost))),external=sum(rows(s,'externalAllocations650').filter(x=>x.orderId===o.id&&!C.reversed(s,'services',x.serviceId)).map(x=>x.amount)),cost=known?sum([stock,extra,waste,external]):null;out.push({id:o.id,orderNo:o.orderNo,date:o.date,clientName:o.clientName,gross:o.total,returns:returned,settlement,revenue,stock,extra,waste,external,cost,profit:known?sum([revenue,-cost]):null});}
 const assigned=allocations(s),unallocated=rows(s,'services').filter(v=>v.kind==='received'&&!C.reversed(s,'services',v.id)&&(!from||String(v.date)>=from)&&(!to||String(v.date).slice(0,10)<=to)).map(v=>({id:v.id,title:v.title||v.description||v.id,partyId:v.partyId,amount:cash(c(v.amount)-(assigned.get(v.id)||0n))})).filter(v=>v.amount>0);return {rows:out,unknown:out.filter(r=>r.profit===null).length,totals:Object.fromEntries(['gross','returns','settlement','revenue','stock','extra','waste','external','cost','profit'].map(k=>[k,sum(out.filter(r=>r[k]!==null).map(r=>r[k]))])),unallocated};}
function assertPrefs(prior,next,user){const before=new Map(rows(prior,'userPrefs650').map(x=>[x.id,x]));const seen=new Set();for(const x of rows(next,'userPrefs650')){need(typeof x.id==='string'&&!seen.has(x.id)&&rows(next,'users').some(u=>String(u.id)===x.id),'مستخدم تفضيلات غير صالح');seen.add(x.id);need(Object.keys(x).every(k=>['id','widgets','quick','layout','favorites','quickStyle651','quickOverrides700'].includes(k)),'خيار تخصيص غير معروف');const QA=typeof module==='object'?require('./quick-access-651.js'):globalThis.QuickAccess651;for(const [key,allowed]of [['widgets',widgets],['quick',commands]])if(x[key])need(Array.isArray(x[key])&&x[key].length<=(key==='quick'?80:allowed.length)&&new Set(x[key]).size===x[key].length&&x[key].every(k=>key==='quick'?QA.validId(k):allowed.includes(k)),'قائمة تخصيص غير صالحة');QA.validateStyle(x.quickStyle651);QA.validateOverrides700(x.quickOverrides700);if(x.layout)need(['basic','details'].includes(x.layout),'وضع فاتورة غير صالح');if(x.favorites)need(Array.isArray(x.favorites)&&x.favorites.length<=30&&x.favorites.every(v=>typeof v==='string'&&v.length<100),'مفضلات إعدادات غير صالحة');if(String(user.id)!==x.id)need(same(before.get(x.id),x),'لا يجوز تغيير تفضيلات مستخدم آخر');}for(const x of before.values())if(x.id!==String(user.id)&&rows(next,'users').some(u=>String(u.id)===x.id))need(seen.has(x.id),'لا يجوز حذف تفضيلات مستخدم آخر');}
return {widgets,commands,recent,today,profit,allocations,assertPrefs};});

};
modules['party-ledger-411.js']=function(module,exports,require){
(function(root,factory){const api=factory(typeof module==='object'?require('./accounting-math-401.js'):root.AccountingMath401);if(typeof module==='object')module.exports=api;else root.PartyLedger411=api;})(globalThis,function(M){
'use strict';const C=v=>M.scaled(v||0,2),cash=v=>Number(v)/100,add=(map,id,v)=>{if(id)map.set(id,(map.get(id)||0n)+v);};
const deposit=t=>t.kind==='deposit'||/^عربون أمر شغل #/.test(t.desc||'');
const purchasePay=t=>t.kind==='purchase_payment'||/^سداد نقدي لوارد/.test(t.desc||'');
function raw(s){const clients=new Map((s.clients||[]).map(c=>[c.id,C(c.initialBalance)])),suppliers=new Map((s.suppliers||[]).map(c=>[c.id,C(c.balance)]));
 for(const o of s.orders||[])add(clients,o.clientId,C(o.total)-C(o.paid));
 for(const p of s.purchases||[])add(suppliers,p.supplierId,p.due!==undefined?C(p.due):C(p.total)-C(p.paid));
 for(const t of s.treasury||[]){if(t.type==='collection'&&!deposit(t))add(clients,t.clientId,-C(t.inAmount));if(t.type==='supplier_payment'&&!purchasePay(t))add(suppliers,t.supplierId,-C(t.outAmount));}
 for(const a of s.adjustments||[])add(a.party==='client'?clients:suppliers,a.partyId,C(a.debit)-C(a.credit));
 for(const v of s.services||[])add(v.partyType==='client'?clients:suppliers,v.partyId,BigInt((v.partyType==='client')===(v.kind==='provided')?1:-1)*(C(v.amount)-C(v.paid)));
 return {clients,suppliers};
}
function balances(s){const r=raw(s),clients=new Map(),suppliers=new Map();for(const c of s.clients||[])clients.set(c.id,cash((r.clients.get(c.id)||0n)-(r.suppliers.get(c.supplierId411)||0n)));for(const p of s.suppliers||[])suppliers.set(p.id,cash((r.suppliers.get(p.id)||0n)-(r.clients.get(p.clientId411)||0n)));return {clients,suppliers,raw:r};}
function validate(s){const clients=new Map((s.clients||[]).map(c=>[c.id,c])),suppliers=new Map((s.suppliers||[]).map(c=>[c.id,c]));for(const c of clients.values())if(c.supplierId411&&suppliers.get(c.supplierId411)?.clientId411!==c.id)throw Error('ربط العميل والمورد غير متطابق');for(const p of suppliers.values())if(p.clientId411&&clients.get(p.clientId411)?.supplierId411!==p.id)throw Error('ربط المورد والعميل غير متطابق');}
function link(s,clientId,supplierId){const c=s.clients.find(c=>c.id===clientId),p=s.suppliers.find(p=>p.id===supplierId);if(!c||!p)throw Error('اختر العميل والمورد الصحيحين');if(c.supplierId411&&c.supplierId411!==p.id||p.clientId411&&p.clientId411!==c.id)throw Error('الجهة مرتبطة بحساب آخر؛ راجع الربط قبل التغيير');c.supplierId411=p.id;p.clientId411=c.id;return {client:c,supplier:p};}
function resolve(s,target,value){if(target==='client'&&value.startsWith('supplier411:')){const p=s.suppliers.find(p=>p.id===value.slice(12));if(!p)throw Error('المورد غير موجود');let c=s.clients.find(c=>c.id===p.clientId411);if(!c){c={id:'cli411:'+p.id,name:p.name,phone:p.phone||'',address:p.address||'',initialBalance:0};if(s.clients.some(x=>x.id===c.id))throw Error('تعارض معرّف جهة');s.clients.push(c);}return link(s,c.id,p.id).client.id;}
 if(target==='supplier'&&value.startsWith('client411:')){const c=s.clients.find(c=>c.id===value.slice(10));if(!c)throw Error('العميل غير موجود');let p=s.suppliers.find(p=>p.id===c.supplierId411);if(!p){p={id:'sup411:'+c.id,name:c.name,phone:c.phone||'',address:c.address||'',balance:0};if(s.suppliers.some(x=>x.id===p.id))throw Error('تعارض معرّف جهة');s.suppliers.push(p);}return link(s,c.id,p.id).supplier.id;}
 return value;
}
// Derived FIFO allocation. Original cash rows and their dates are never rewritten.
function supplierPlan(s,omitId){const reversals650=(s.corrections650||[]).filter(n=>n.collection==='treasury'&&n.source?.type==='supplier_payment');if(reversals650.length){const ids650=new Set(reversals650.map(n=>n.recordId)),adj650=new Set(reversals650.flatMap(n=>n.postings.adjustments.map(a=>a.id)));s={...s,treasury:(s.treasury||[]).filter(t=>!ids650.has(t.id)),adjustments:(s.adjustments||[]).filter(a=>!adj650.has(a.id)&&!ids650.has(a.treasuryId))};}const debt=new Map(),credits=new Map(),paid=new Map(),allocations=new Map(),cursors=new Map(),r=raw({...s,treasury:(s.treasury||[]).filter(t=>t.id!==omitId)});
 const push=(id,key,amount,date,kind)=>{if(!id||amount===0n)return;const map=amount>0n?debt:credits;if(!map.has(id))map.set(id,[]);map.get(id).push({key,left:amount>0n?amount:-amount,date:String(date||''),kind});};
 for(const p of s.suppliers||[])push(p.id,'opening:'+p.id,C(p.balance),'','opening');
 for(const p of s.purchases||[]){paid.set('purchase:'+p.id,C(p.paid));push(p.supplierId,p.id,p.due!==undefined?C(p.due):C(p.total)-C(p.paid),p.date,'purchase');}
 for(const v of s.services||[])if(v.partyType==='supplier'){paid.set('service:'+v.id,C(v.paid));push(v.partyId,v.id,BigInt(v.kind==='received'?1:-1)*(C(v.amount)-C(v.paid)),v.date,'service');}
 for(const a of s.adjustments||[])if(a.party==='supplier')push(a.partyId,'adjustment:'+a.id,C(a.debit)-C(a.credit),a.date,'adjustment');
 for(const rows of debt.values())rows.sort((a,b)=>a.date.localeCompare(b.date)||String(a.key).localeCompare(String(b.key)));
 function apply(id,supplierId,value,kind){if(value<=0n){allocations.set(id,{parts:[],unallocated:0});return 0n;}let left=value,index=cursors.get(supplierId)||0;const parts=[],rows=debt.get(supplierId)||[];for(;index<rows.length;index++){const d=rows[index],n=left<d.left?left:d.left;if(n<=0n)continue;left-=n;d.left-=n;parts.push({targetId:d.key,type:d.kind,amount:cash(n),source:kind});const pk=d.kind+':'+d.key;if(paid.has(pk))paid.set(pk,paid.get(pk)+n);if(!left)break;}while(index<rows.length&&rows[index].left===0n)index++;cursors.set(supplierId,index);allocations.set(id,{parts,unallocated:cash(left)});return value-left;}
 const payments=(s.treasury||[]).filter(t=>t.id!==omitId&&t.supplierId&&t.type==='supplier_payment'&&!purchasePay(t)).slice().sort((a,b)=>String(a.date||'').localeCompare(String(b.date||''))||String(a.id).localeCompare(String(b.id)));
 for(const t of payments)apply(t.id,t.supplierId,C(t.outAmount),'cash');
 for(const [id,rows]of credits)for(const c of rows){const used=apply(c.key,id,c.left,'credit');if(c.kind==='service'&&paid.has('service:'+c.key))paid.set('service:'+c.key,paid.get('service:'+c.key)+used);}
 for(const p of s.suppliers||[])if(p.clientId411){const v=r.clients.get(p.clientId411)||0n;if(v>0n)apply('contra411:'+p.id,p.id,v,'contra');}
 const purchases=new Map(),services=new Map();for(const [key,n]of paid)(key.startsWith('purchase:')?purchases:services).set(key.slice(key.indexOf(':')+1),cash(n));return {paid:new Map([...purchases,...services]),purchases,services,allocations};
}
return {raw,balances,validate,link,resolve,supplierPlan,deposit,purchasePay};
});

};
modules['sales-returns-640.js']=function(module,exports,require){
(function(root,factory){const api=factory(typeof module==='object'?require('./accounting-math-401.js'):root.AccountingMath401,typeof module==='object'?require('./party-ledger-411.js'):root.PartyLedger411,typeof module==='object'?require('./settlement-150-model.js'):root.Settlement150);if(typeof module==='object')module.exports=api;else root.SalesReturns640=api;})(globalThis,function(M,P,S){
'use strict';
const clone=o=>JSON.parse(JSON.stringify(o)),C=v=>M.scaled(v||0,2),Q=v=>M.scaled(v||0,4),cash=n=>Number(n)/100,qty=n=>Number(n)/10000,rows=(s,k)=>s[k]||[],equal=(a,b)=>JSON.stringify(a??null)===JSON.stringify(b??null);
function need(ok,msg){if(!ok)throw Error(msg);}
function shares(total,weights){const sum=weights.reduce((a,b)=>a+b,0n);if(!sum)return weights.map(()=>0n);let before=0n,allocated=0n;return weights.map(w=>{before+=w;const target=(total*before+sum/2n)/sum,result=target-allocated;allocated=target;return result;});}
function source(o){return clone(Object.fromEntries(['id','orderNo','date','clientId','lines','quantity','jobType','subtotal','discount','invDiscount','total','paid','stockUsed','costSnapshot149','extraDeduct','paymentMethod','paymentParts149'].filter(k=>o[k]!==undefined).map(k=>[k,o[k]])));}
function sourceLines(o){return o.lines?.length?o.lines:[{desc:o.jobType||'فاتورة سابقة',qty:o.quantity||1,price:Number(o.total)/Number(o.quantity||1),amount:o.total}];}
function discountIndex(s){const canceled650=new Set(rows(s,'corrections650').filter(n=>n.collection==='treasury').map(n=>n.recordId));const clean={...s,adjustments:rows(s,'adjustments').filter(a=>!a.salesReturnId640&&!canceled650.has(a.treasuryId))},plan=S.plan(clean),index=new Map();for(const a of clean.adjustments)if(a.party==='client'&&a.discount408)for(const part of plan.allocations.get('adjustment:'+a.id)?.parts||[])if(part.type==='invoice')index.set(part.targetId,(index.get(part.targetId)||0n)+C(part.amount));return index;}
function discountTotal(s,o,index){return (index||discountIndex(s)).get(o.id)||0n;}
function budgets(s,o,index){const ls=sourceLines(o),base=ls.map(l=>C(l.amount??M.lineTotal(l.qty,l.price)));const sum=base.reduce((n,v)=>n+v,0n),global=sum-C(o.total),eligible=ls.map((l,i)=>C(l.discount)>0n?0n:base[i]),eligibleSum=eligible.reduce((n,v)=>n+v,0n),discounts=global>=0n&&global<=eligibleSum?shares(global,eligible):null,invoice=discounts?base.map((v,i)=>v-discounts[i]):shares(C(o.total),base),d=discountTotal(s,o,index);need(d<=C(o.total),'خصومات التسوية تتجاوز قيمة الفاتورة');return shares(C(o.total)-d,invoice);}
function prior(s,id){return rows(s,'salesReturns640').filter(r=>r.orderId===id);}
function availability(s,id){const o=rows(s,'orders').find(o=>o.id===id);need(o,'الفاتورة الأصلية غير موجودة');const notes=prior(s,id),ls=sourceLines(o),budget=budgets(s,o);return {order:o,lines:ls.map((l,index)=>{const old=notes.flatMap(r=>r.lines).filter(l=>l.index===index);return {...l,index,remainingQty:qty(Q(l.qty)-old.reduce((n,l)=>n+Q(l.qty),0n)),credited:cash(old.reduce((n,l)=>n+C(l.amount),0n)),budget:cash(budget[index])};}),stock:(o.stockUsed||[]).map(l=>{const returned=notes.flatMap(n=>n.stock).filter(x=>x.itemId===l.itemId).reduce((n,x)=>n+Q(x.qty),0n);const cost=(o.costSnapshot149||[]).find(x=>x.itemId===l.itemId)?.unitCost;return {...l,remainingQty:qty(Q(l.qty)-returned),unitCost:cost??null};})};}
function plan(s,input){
 const av=availability(s,input.orderId),o=av.order;need(!['ملغي','ملغاة'].includes(o.status),'لا يمكن تسجيل مرتجع لفاتورة ملغاة');need(typeof input.id==='string'&&input.id&&!prior(s,o.id).some(n=>n.id===input.id),'رقم المرتجع غير صالح أو مكرر');need(!rows(s,'salesReturns640').some(n=>n.id===input.id),'رقم المرتجع مكرر');need(/^\d{4}-\d{2}-\d{2}$/.test(input.date)&&input.date>=String(o.date).slice(0,10),'تاريخ المرتجع يجب ألا يسبق الفاتورة');
 const old=prior(s,o.id),seen=new Set(),lines=[];
 for(const requested of input.lines||[]){const i=requested.index,l=av.lines[i];need(Number.isInteger(i)&&l&&!seen.has(i),'بند المرتجع غير صالح أو مكرر');seen.add(i);need(Number.isFinite(Number(requested.qty))&&Math.abs(Number(requested.qty)-M.round(requested.qty,4))<1e-10,'الكمية تقبل أربع منازل عشرية كحد أقصى');const q=Q(requested.qty);need(q>0n&&q<=Q(l.remainingQty),'الكمية المرتجعة أكبر من المتبقي من البند');const prevQ=Q(l.qty)-Q(l.remainingQty),budget=C(l.budget),target=(budget*(prevQ+q)+Q(l.qty)/2n)/Q(l.qty),amount=target-C(l.credited);need(amount>=0n,'خصم التسوية اللاحق يحتاج مراجعة قيمة المرتجع قبل الاعتماد');lines.push({index:i,basis640:l.budget,previousQty640:qty(prevQ),previousCredit640:l.credited,desc:String(l.desc||o.jobType||'بند'),qty:qty(q),amount:cash(amount),price:M.round(cash(amount)/qty(q),4),itemId:l.itemId||'',unit:l.unit||'',notes:l.notes||''});}
 need(lines.length,'حدد كمية مرتجعة لبند واحد على الأقل');const total=lines.reduce((n,l)=>n+C(l.amount),0n);need(total>=0n,'قيمة المرتجع غير صالحة');
 const stock=[],stockSeen=new Set();for(const requested of input.stock||[]){const l=av.stock.find(l=>l.itemId===requested.itemId),item=rows(s,'items').find(i=>i.id===requested.itemId);need(l&&item&&!stockSeen.has(item.id),'خامة المرتجع غير موجودة أو مكررة');stockSeen.add(item.id);need(Number.isFinite(Number(requested.qty))&&Math.abs(Number(requested.qty)-M.round(requested.qty,4))<1e-10,'الكمية تقبل أربع منازل عشرية كحد أقصى');const q=Q(requested.qty);need(q>0n&&q<=Q(l.remainingQty),'كمية الخامة تتجاوز ما استُهلك أصلًا أو أُعيد سابقًا');need(l.unitCost!==null&&Number.isFinite(Number(l.unitCost))&&Number(l.unitCost)>=0,'التكلفة التاريخية لهذه الخامة غير مسجلة؛ يمكن إصدار الإشعار دون إعادة مخزون');const selectedForItem=lines.filter(x=>x.itemId===item.id).reduce((n,x)=>n+Q(x.qty),0n),hasDirect=sourceLines(o).some(x=>x.itemId===item.id&&x.kind!=='service');if(hasDirect)need(q<=selectedForItem,'كمية الصنف المعاد للمخزن تتجاوز كميته المرتجعة في الإشعار');stock.push({itemId:item.id,itemName:item.name,qty:qty(q),unitCost:Number(l.unitCost),unit:item.unit||''});}
 const client=rows(s,'clients').find(c=>c.id===o.clientId),id=input.id,no='RT-'+String(rows(s,'salesReturns640').length+1).padStart(6,'0'),date=input.date,refund=input.refund==='all'?total:C(input.refund||0);need(refund>=0n&&refund<=total,'الرد النقدي يجب ألا يتجاوز صافي المرتجع');need(client||!o.clientId,'العميل الأصلي غير موجود');
 const current=client?C(P.balances(s).clients.get(client.id)||0):0n,limit=client?(total-current>0n?total-current:0n):total;need(refund<=limit,'الرد النقدي يتجاوز الرصيد الدائن المتاح بعد المرتجع؛ استخدم الخصم من الحساب للمبلغ الباقي');if(!client)need(refund===total,'مرتجع البيع النقدي يُرد نقدًا بالكامل');need(!refund||String(input.method||'').trim(),'اختر طريقة رد المبلغ');
 const note={id,no,date,createdAt:input.createdAt||new Date().toISOString(),orderId:o.id,orderNo:o.orderNo,clientId:o.clientId||'',clientName:o.clientName||'عميل نقدي',source640:source(o),lines,stock,total:cash(total),refund:cash(refund),credit:cash(total-refund),method:refund?String(input.method).slice(0,80):'',reason:String(input.reason||'').trim().slice(0,1000),user:String(input.user||'').slice(0,160)};need(note.reason,'اكتب سبب المرتجع');
 return {note,...postings(note)};
}
function postings(n){const adjustments=[];if(n.clientId){const common={date:n.date,party:'client',partyId:n.clientId,salesReturnId640:n.id,user:n.user};adjustments.push({...common,id:n.id+':credit',debit:0,credit:n.total,desc:'إشعار دائن مرتجع مبيعات '+n.no+' — فاتورة #'+n.orderNo});if(n.refund)adjustments.push({...common,id:n.id+':refund',debit:n.refund,credit:0,desc:'رد نقدي للعميل مقابل المرتجع '+n.no});}const treasury=n.refund?[{id:n.id+':cash',date:n.date,type:'sales_return_refund',kind:'sales_return_refund',salesReturnId640:n.id,clientId:n.clientId||'',desc:'رد مرتجع مبيعات '+n.no+' — فاتورة #'+n.orderNo,inAmount:0,outAmount:n.refund,paymentMethod:n.method,user:n.user}]:[];return {adjustments,treasury};}
function apply(s,p){const before=clone(s);try{s.salesReturns640||=[];s.adjustments||=[];for(const l of p.note.stock){const i=s.items.find(i=>i.id===l.itemId);i.avgCost166=M.returnedAverage(i,l.qty,l.unitCost);i.qty=M.round(Number(i.qty)+l.qty,4);delete i.lastActualCount;}s.salesReturns640.push(clone(p.note));s.adjustments.push(...clone(p.adjustments));s.treasury.push(...clone(p.treasury));validate(s);return p.note;}catch(e){for(const k of Object.keys(s))delete s[k];Object.assign(s,before);throw e;}}
function validate(s){const ids=new Set(),byOrder=new Map(),orderIndex=new Map(rows(s,'orders').map(o=>[o.id,o])),discountMap=rows(s,'salesReturns640').length?discountIndex(s):new Map(),postIndex={adjustments:new Map(),treasury:new Map()};for(const k of ['adjustments','treasury'])for(const x of rows(s,k))if(x.salesReturnId640){const group=postIndex[k].get(x.salesReturnId640)||[];group.push(x);postIndex[k].set(x.salesReturnId640,group);}for(const n of rows(s,'salesReturns640')){need(n&&typeof n.id==='string'&&n.id&&!ids.has(n.id),'رقم مرتجع مكرر أو غير صالح');ids.add(n.id);const o=orderIndex.get(n.orderId);need(o&&equal(source(o),n.source640),'لا يمكن تعديل أو حذف أصل فاتورة لها مرتجع معتمد');need(n.clientId===(o.clientId||'')&&n.orderNo===o.orderNo,'مرجع عميل أو فاتورة المرتجع غير متطابق');need(Array.isArray(n.lines)&&n.lines.length&&Array.isArray(n.stock),'تفاصيل المرتجع غير صالحة');for(const key of ['total','refund','credit'])need(Number.isFinite(Number(n[key]))&&Number(n[key])===M.round(n[key],2),'مبلغ المرتجع يقبل منزلتين عشريتين');let sum=0n;const li=new Set();for(const l of n.lines){need(Number(l.qty)===M.round(l.qty,4)&&Number(l.amount)===M.round(l.amount,2),'كمية أو قيمة بند المرتجع غير صالحة');need(Number.isInteger(l.index)&&sourceLines(o)[l.index]&&!li.has(l.index)&&Q(l.qty)>0n&&C(l.amount)>=0n,'بند مرتجع غير صالح');li.add(l.index);sum+=C(l.amount);}need(sum===C(n.total)&&C(n.total)>=0n&&C(n.refund)>=0n&&C(n.refund)+C(n.credit)===sum,'قيمة المرتجع أو تسويته غير متطابقة');const expected=postings(n);for(const k of ['adjustments','treasury'])need(equal(postIndex[k].get(n.id)||[],expected[k]),'قيود المرتجع أو رد الخزينة غير متطابقة');if(!byOrder.has(o.id))byOrder.set(o.id,[]);byOrder.get(o.id).push(n);}
 for(const k of ['adjustments','treasury'])for(const x of rows(s,k))if(x.salesReturnId640)need(ids.has(x.salesReturnId640),'قيد مرتبط بمرتجع غير موجود');
 for(const [id,notes]of byOrder){const o=orderIndex.get(id),ls=sourceLines(o),budget=budgets(s,o,discountMap),originalBudget=budgets(s,o,new Map()),cumulativeQty=new Map(),cumulativeCredit=new Map();for(const note of notes)for(const line of note.lines){const beforeQ=cumulativeQty.get(line.index)||0n,beforeC=cumulativeCredit.get(line.index)||0n,basis=C(line.basis640);need(line.basis640!==undefined&&basis>=0n&&basis<=originalBudget[line.index]&&Q(line.previousQty640)===beforeQ&&C(line.previousCredit640)===beforeC,'أساس قيمة المرتجع أو تسلسله لا يطابق الفاتورة');const expected=(basis*(beforeQ+Q(line.qty))+Q(ls[line.index].qty)/2n)/Q(ls[line.index].qty)-beforeC;need(C(line.amount)===expected,'قيمة البند المرتجع لا تطابق كميته وصافيه التاريخي');cumulativeQty.set(line.index,beforeQ+Q(line.qty));cumulativeCredit.set(line.index,beforeC+C(line.amount));}for(let i=0;i<ls.length;i++){const all=notes.flatMap(n=>n.lines).filter(l=>l.index===i);need(all.reduce((n,l)=>n+Q(l.qty),0n)<=Q(ls[i].qty),'إجمالي الكمية المرتجعة يتجاوز المبيع');need(all.reduce((n,l)=>n+C(l.amount),0n)<=budget[i],'قيمة المرتجعات تتجاوز صافي البند بعد خصومات التسوية');}const stocks=notes.flatMap(n=>n.stock),seen=new Set();for(const n of notes){seen.clear();for(const st of n.stock){need(Number(st.qty)===M.round(st.qty,4),'كمية الخامة تقبل أربع منازل عشرية');need(!seen.has(st.itemId),'خامة مكررة في المرتجع');seen.add(st.itemId);const hist=(o.costSnapshot149||[]).find(x=>x.itemId===st.itemId);need(hist&&Number(hist.unitCost)===Number(st.unitCost)&&Q(st.qty)>0n,'التكلفة أو الكمية التاريخية للخامة غير صحيحة');}}for(const st of stocks){const original=(o.stockUsed||[]).filter(x=>x.itemId===st.itemId).reduce((n,x)=>n+Q(x.qty),0n);need(stocks.filter(x=>x.itemId===st.itemId).reduce((n,x)=>n+Q(x.qty),0n)<=original,'الخامات المرتجعة تتجاوز استهلاك الفاتورة');}}
 return true;}
function assertTransition(before,after){const afterIndex=new Map(rows(after,'salesReturns640').map(n=>[n.id,n]));for(const n of rows(before,'salesReturns640'))need(equal(n,afterIndex.get(n.id)),'المرتجع المعتمد مستند ثابت؛ لا يمكن حذفه أو تعديل قيوده');const oldIds=new Set(rows(before,'salesReturns640').map(n=>n.id));const added=rows(after,'salesReturns640').filter(n=>!oldIds.has(n.id));if(!added.length)return true;const work=clone(before);for(const n of added){const p=plan(work,{...n,lines:n.lines.map(l=>({index:l.index,qty:l.qty})),stock:n.stock.map(l=>({itemId:l.itemId,qty:l.qty}))});need(equal(p.note,n),'تفاصيل المرتجع لا تطابق الفاتورة الأصلية');apply(work,p);}for(const item of work.items||[]){const actual=rows(after,'items').find(i=>i.id===item.id);need(actual&&Q(item.qty)===Q(actual.qty)&&M.scaled(item.avgCost166??item.buyPrice??0,4)===M.scaled(actual.avgCost166??actual.buyPrice??0,4),'حركة مخزون المرتجع أو متوسط التكلفة غير متطابق');}return true;}
return {plan,apply,validate,assertTransition,availability,source,sourceLines,discountTotal,discountIndex};
});

};
modules['settlement-150-model.js']=function(module,exports,require){
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.Settlement150=api;})(typeof window==='object'?window:globalThis,function(){
'use strict';
const Decimal640=typeof module==='object'?require('./accounting-math-401.js'):globalThis.AccountingMath401;const cents=v=>{const n=Number(v);return Number.isFinite(n)?Number(Decimal640.scaled(n,2)):0;},money=v=>v/100;
function deposit(t){return t.kind==='deposit'||/^عربون أمر شغل #/.test(t.desc||'');}
function plan(s,omitId){
 const reverse650=(s.corrections650||[]).filter(n=>n.collection==='treasury'&&n.source?.type==='collection');
 if(reverse650.length){const receipts650=new Set(reverse650.map(n=>n.recordId)),adjustments650=new Set(reverse650.flatMap(n=>n.postings.adjustments.map(a=>a.id)));s={...s,treasury:(s.treasury||[]).filter(t=>!receipts650.has(t.id)),adjustments:(s.adjustments||[]).filter(a=>!adjustments650.has(a.id)&&!receipts650.has(a.treasuryId))};}

 const servicePaid=new Map((s.services||[]).filter(v=>v.partyType==='client').map(v=>[v.id,cents(v.paid)])),paid=new Map(),allocations=new Map(),credit=new Map(),debts=new Map(),receipts=new Map(),cursors=new Map(),invoiceDebts=new Map();
 const addDebt=(clientId,id,value,date,type)=>{if(!clientId||!value)return;const map=value>0?debts:receipts;if(!map.has(clientId))map.set(clientId,[]);const record={id,left:Math.abs(value),date:String(date||''),type};map.get(clientId).push(record);if(value>0&&type==='invoice')invoiceDebts.set(id,{clientId,record});};
 for(const c of s.clients||[])addDebt(c.id,'opening:'+c.id,cents(c.initialBalance),'','opening');
 for(const o of s.orders||[]){paid.set(o.id,Math.min(cents(o.total),Math.max(0,cents(o.paid))));addDebt(o.clientId,o.id,cents(o.total)-cents(o.paid),o.date,'invoice');}
 for(const a of s.adjustments||[])if(a.party==='client'&&!(a.discount408&&a.orderId)&&!(omitId&&a.treasuryId===omitId))addDebt(a.partyId,'adjustment:'+a.id,cents(a.debit)-cents(a.credit),a.date,'adjustment');
 for(const a of s.services||[])if(a.partyType==='client'){const sign=a.kind==='received'?-1:1;addDebt(a.partyId,'service:'+a.id,sign*(cents(a.amount)-cents(a.paid)),a.date,'service');}
 const special=(s.adjustments||[]).filter(a=>a.party==='client'&&a.discount408&&a.orderId&&!(omitId&&a.treasuryId===omitId)).map(a=>({id:'adjustment:'+a.id,type:'collection',clientId:a.partyId,orderId:a.orderId,inAmount:Number(a.credit||0),date:a.date}));
 const payments=[...(s.treasury||[]),...special].filter(t=>t.id!==omitId&&t.type==='collection'&&t.clientId&&!deposit(t)&&cents(t.inAmount)>0).slice().sort((a,b)=>String(a.date||'').localeCompare(String(b.date||''))||String(a.id).localeCompare(String(b.id)));
 for(const rows of debts.values())rows.sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id));
 function apply(t,targets,automatic=false){let left=cents(t.inAmount);const parts=[];let index=automatic?(cursors.get(t.clientId)||0):0;for(;index<targets.length;index++){const d=targets[index];const n=Math.min(left,d.left);if(n<=0)continue;d.left-=n;left-=n;parts.push({targetId:d.id,type:d.type,amount:money(n)});if(d.type==='invoice')paid.set(d.id,(paid.get(d.id)||0)+n);if(d.type==='service'&&servicePaid.has(d.id.slice(8)))servicePaid.set(d.id.slice(8),servicePaid.get(d.id.slice(8))+n);if(!left)break;}if(automatic){while(index<targets.length&&targets[index].left===0)index++;cursors.set(t.clientId,index);}allocations.set(t.id,{parts,unallocated:money(left)});credit.set(t.clientId,(credit.get(t.clientId)||0)+left);}
 // Earmarked invoice receipts are honored before automatic FIFO receipts.
 for(const t of payments.filter(t=>t.orderId)){const entry=invoiceDebts.get(t.orderId),targets=entry?.clientId===t.clientId?[entry.record]:[];apply(t,targets);}
 for(const [clientId,rows]of receipts)for(const r of rows){apply({id:r.id,clientId,inAmount:money(r.left)},debts.get(clientId)||[],true);if(r.type==='service'&&servicePaid.has(r.id.slice(8)))servicePaid.set(r.id.slice(8),servicePaid.get(r.id.slice(8))+r.left-cents(allocations.get(r.id).unallocated));}
 for(const t of payments.filter(t=>!t.orderId))apply(t,debts.get(t.clientId)||[],true);
 const P=typeof module==='object'?require('./party-ledger-411.js'):globalThis.PartyLedger411;
 if(P){const raw=P.raw({...s,treasury:(s.treasury||[]).filter(t=>t.id!==omitId)});for(const c of s.clients||[])if(c.supplierId411){const v=raw.suppliers.get(c.supplierId411)||0n;if(v>0n)apply({id:'contra411:'+c.id,clientId:c.id,inAmount:Number(v)/100},debts.get(c.id)||[],true);}}
 return {servicePaid:new Map([...servicePaid].map(([id,n])=>[id,money(n)])),paid:new Map([...paid].map(([id,n])=>[id,money(n)])),allocations,credit:new Map([...credit].map(([id,n])=>[id,money(n)]))};
}
function reconcile(s){const p=plan(s);for(const o of s.orders||[]){o.settledPaid150=p.paid.get(o.id)||0;o.remaining=Math.max(0,money(cents(o.total)-cents(o.settledPaid150)));}return p;}
function available(s,orderId,omitId){const o=(s.orders||[]).find(x=>x.id===orderId);return o?Math.max(0,money(cents(o.total)-cents(plan(s,omitId).paid.get(o.id)))):0;}
return {plan,reconcile,available,deposit,cents};
});

};
modules['corrections-650.js']=function(module,exports,require){
(function(root,factory){const api=factory(typeof module==='object'?require('./accounting-math-401.js'):root.AccountingMath401,typeof module==='object'?require('./party-ledger-411.js'):root.PartyLedger411);if(typeof module==='object')module.exports=api;else root.Corrections650=api;})(globalThis,function(M,P){'use strict';
const clone=x=>JSON.parse(JSON.stringify(x)),C=x=>M.scaled(x||0,2),cash=x=>Number(x)/100,rows=(s,k)=>s[k]||[],same=(a,b)=>JSON.stringify(a??null)===JSON.stringify(b??null),need=(ok,msg)=>{if(!ok)throw Error(msg);};
const collections=['treasury','adjustments','purchases','services','costs149','waste149'];
function postings(n){return clone(n.postings);}
function plan(s,input){const k=input.collection,id=String(input.recordId||''),source=rows(s,k).find(x=>x.id===id);need(collections.includes(k)&&source,'اختر مصدرًا صالحًا للتصحيح');need(!rows(s,'corrections650').some(n=>n.collection===k&&n.recordId===id),'تم عكس هذا المستند سابقًا');need(typeof input.id==='string'&&input.id&&!rows(s,'corrections650').some(n=>n.id===input.id),'رقم التصحيح مكرر');need(!source.correctionId650&&!source.salesReturnId640,'افتح المستند الأصلي؛ لا يجوز عكس قيد آلي منفرد');const reason=String(input.reason||'').trim().slice(0,1000);need(reason,'اكتب سبب التصحيح');need(/^\d{4}-\d{2}-\d{2}$/.test(input.date)&&input.date>=String(source.date||source.at||'').slice(0,10),'تاريخ التصحيح يجب ألا يسبق المصدر');
 const n={id:input.id,no:'CR-'+String(rows(s,'corrections650').length+1).padStart(6,'0'),date:input.date,createdAt:input.createdAt||new Date().toISOString(),collection:k,recordId:id,source:clone(source),reason,user:String(input.user||''),userId:String(input.userId||''),refund:cash(C(input.refund)),method:String(input.method||'نقدي').slice(0,80),postings:{adjustments:[],treasury:[],stock:[]}},p=n.postings;
 function adjust(party,partyId,value,label){if(!partyId||!value)return;p.adjustments.push({id:n.id+':a'+p.adjustments.length,date:n.date,party,partyId,debit:value>0n?cash(value):0,credit:value<0n?cash(-value):0,desc:label+' — '+n.no,correctionId650:n.id,user:n.user});}
 function money(value,label){if(!value)return;p.treasury.push({id:n.id+':cash',date:n.date,type:'correction650',kind:'correction650',inAmount:value>0n?cash(value):0,outAmount:value<0n?cash(-value):0,desc:label+' — '+n.no,paymentMethod:n.method,correctionId650:n.id,user:n.user});}
 let max=0n;
 if(k==='treasury'){
  need(!source.orderId||source.kind==='payment','عربون الفاتورة يُصحح من مرتجع المبيعات');need(!source.purchaseId&&!source.serviceId&&!['deposit','purchase_payment','service_payment'].includes(source.kind),'القيد مرتبط بوارد أو خدمة؛ اعكس المستند الأصلي');need(!rows(s,'costs149').some(c=>!c.voidAt&&c.treasuryId===id),'المصروف مرتبط بتكلفة تشغيل؛ صححه من سجل التكلفة');
  const value=C(source.inAmount)-C(source.outAmount);money(-value,'عكس حركة خزينة');if(source.type==='collection')adjust('client',source.clientId,C(source.inAmount)+C(source.discount408),'عكس تحصيل وخصمه');if(source.type==='supplier_payment')adjust('supplier',source.supplierId,C(source.outAmount)+C(source.discount408),'عكس سداد وخصمه');need(!C(input.refund),'حركة الخزينة تُعكس بقيمتها الفعلية دون مبلغ رد إضافي');
 }else if(k==='adjustments'){
  need(!source.discount408&&!source.salesReturnId640,'التسوية مرتبطة بمستند؛ افتح حركة السداد أو المرتجع');adjust(source.party,source.partyId,C(source.credit)-C(source.debit),'عكس تسوية يدوية');need(!C(input.refund),'التسوية اليدوية لا تنشئ ردًا نقديًا');
 }else if(k==='purchases'){
  const item=rows(s,'items').find(i=>i.id===source.itemId);need(item,'صنف الوارد غير موجود');const rev=M.reversePurchase(item,source);p.stock.push({itemId:item.id,beforeQty:item.qty,beforeCost:item.avgCost166??item.buyPrice??0,qty:rev.qty,average:rev.average});adjust('supplier',source.supplierId,-C(source.total),'إلغاء مديونية الوارد');
  const after=clone(s);after.adjustments=[...rows(after,'adjustments'),...p.adjustments];const b=C(P.balances(after).suppliers.get(source.supplierId)||0);max=b<0n?-b:0n;if(max>C(source.total))max=C(source.total);
  need(C(input.refund)>=0n&&C(input.refund)<=max,'رد المورد يتجاوز الرصيد الدائن المتاح بعد عكس الوارد');money(C(input.refund),'رد من المورد مقابل إلغاء الوارد');adjust('supplier',source.supplierId,C(input.refund),'إثبات الرد من المورد');
 }else if(k==='services'){
  const sign=(source.partyType==='client')===(source.kind==='provided')?1n:-1n,amount=C(source.amount);adjust(source.partyType,source.partyId,-sign*amount,'عكس خدمة أو مسحوبات');const after=clone(s);after.adjustments=[...rows(after,'adjustments'),...p.adjustments];const b=C(P.balances(after)[source.partyType==='client'?'clients':'suppliers'].get(source.partyId)||0);max=-sign*b;if(max<0n)max=0n;if(max>amount)max=amount;need(C(input.refund)>=0n&&C(input.refund)<=max,'الرد النقدي يتجاوز رصيد الطرف المتاح بعد العكس');money((source.kind==='provided'?-1n:1n)*C(input.refund),'رد مقابل عكس خدمة');adjust(source.partyType,source.partyId,sign*C(input.refund),'إثبات الرد النقدي للخدمة');
 }else if(k==='costs149'){
  need(!source.voidAt,'التكلفة ملغاة بالفعل');if(source.treasuryId&&source.mode==='pay'){const t=rows(s,'treasury').find(t=>t.id===source.treasuryId);need(t&&C(t.outAmount)===C(source.amount),'مصروف التكلفة غير متطابق');money(C(t.outAmount),'استرداد مصروف تكلفة تشغيل');n.linkedTreasury=clone(t);}need(!C(input.refund),'يُعكس مصروف التكلفة بقيمته المسجلة');
 }else if(k==='waste149'){
  need(!source.voidAt,'الهالك ملغى بالفعل');const item=rows(s,'items').find(i=>i.id===source.itemId);need(item,'خامة الهالك غير موجودة');need(Number.isFinite(Number(source.unitCost)),'تكلفة الهالك التاريخية غير معروفة');p.stock.push({itemId:item.id,beforeQty:item.qty,beforeCost:item.avgCost166??item.buyPrice??0,qty:M.round(Number(item.qty)+Number(source.qty),4),average:M.returnedAverage(item,source.qty,source.unitCost)});need(!C(input.refund),'عكس الهالك يُعيد المخزون دون قيد نقدي');
 }
 if(p.treasury.length)need(n.method.trim(),'اختر طريقة الحركة النقدية');
 return n;
}
function apply(s,n){s.corrections650||=[];s.adjustments||=[];s.treasury||=[];s.corrections650.push(clone(n));s.adjustments.push(...clone(n.postings.adjustments));s.treasury.push(...clone(n.postings.treasury));for(const x of n.postings.stock){const i=s.items.find(i=>i.id===x.itemId);i.qty=x.qty;i.avgCost166=x.average;delete i.lastActualCount;}return n;}
function assertTransition(prior,next){const old=new Map(rows(prior,'corrections650').map(n=>[n.id,n])),fresh=rows(next,'corrections650').filter(n=>!old.has(n.id));for(const n of rows(prior,'corrections650'))need(same(n,rows(next,'corrections650').find(x=>x.id===n.id)),'مستندات التصحيح نهائية؛ لا تُعدل ولا تُحذف');
 const work=clone(prior);for(const n of fresh){const expected=plan(work,n);need(same(expected,n),'مستند التصحيح لا يطابق أثره المحاسبي');apply(work,n);}
 for(const n of rows(next,'corrections650')){need(same(n.source,rows(next,n.collection).find(x=>x.id===n.recordId)),'لا يجوز تعديل أو حذف مصدر تم عكسه');for(const k of ['adjustments','treasury'])for(const p of n.postings[k])need(same(p,rows(next,k).find(x=>x.id===p.id)),'قيد التصحيح غير متطابق أو محذوف');if(n.linkedTreasury)need(same(n.linkedTreasury,rows(next,'treasury').find(t=>t.id===n.linkedTreasury.id)),'لا يجوز تعديل مصروف تكلفة معكوسة');}
 for(const id of new Set(fresh.flatMap(n=>n.postings.stock.map(x=>x.itemId)))){const a=work.items.find(x=>x.id===id),b=next.items.find(x=>x.id===id);need(b&&Number(a.qty)===Number(b.qty)&&Number(a.avgCost166)===Number(b.avgCost166),'رصيد وقيمة المخزون لا يطابقان التصحيح');}
 const known=new Set(rows(next,'corrections650').map(n=>n.id));for(const k of ['treasury','adjustments'])for(const r of rows(next,k))if(r.correctionId650)need(known.has(r.correctionId650)&&rows(next,'corrections650').find(n=>n.id===r.correctionId650).postings[k].some(p=>same(p,r)),'قيد تصحيح بلا مستند معتمد');return true;}
function reversed(s,k,id){return rows(s,'corrections650').some(n=>n.collection===k&&n.recordId===id);}
return {plan,apply,assertTransition,postings,reversed,collections};});

};
modules['workflow-650.js']=function(module,exports,require){
(function(root,factory){const api=factory(typeof module==='object'?require('./operations-149-model.js'):root.Operations149,typeof module==='object'?require('./permissions-650.js'):root.Permissions650);if(typeof module==='object')module.exports=api;else root.Workflow650=api;})(globalThis,function(M,P){'use strict';
const clone=x=>JSON.parse(JSON.stringify(x)),same=(a,b)=>JSON.stringify(a??null)===JSON.stringify(b??null),rows=(s,k)=>s[k]||[],need=(ok,msg)=>{if(!ok)throw Error(msg);};
function fingerprint(o){return JSON.stringify({jobType:o.jobType||'',specs:o.specs||'',quantity:o.quantity||0,lines:(o.lines||[]).map(l=>({desc:l.desc||'',qty:l.qty,itemId:l.itemId||'',serviceId:l.serviceId||l.serviceCatalogId||'',notes:l.notes||'',spec:l.spec149||{}})),files:(o.attachments149||[]).map(a=>[a.file,a.sha256])});}
function approval(s,o){const events=rows(s,'proofApprovals650').filter(a=>a.orderId===o.id),last=events.at(-1);return last?.action==='approve'&&last.fingerprint===fingerprint(o)?last:null;}
function active(o){return !['تم التسليم','ملغي','ملغاة'].includes(o.status);}
function gated(o){return !!o.ops149?.proofRequired650;}
function needApproval(o,stage){return gated(o)&&M.stages.indexOf(stage)>=2;}
function move(s,o,stage,user,note='نقل من لوحة التشغيل',at=new Date().toISOString()){need(M.stages.includes(stage),'مرحلة غير صالحة');need(P.can(user,'ops_manage')||P.can(user,'inv_status'),'ليست لديك صلاحية تغيير المرحلة');need(!needApproval(o,stage)||approval(s,o)||rows(s,'workflowOverrides650').some(x=>x.orderId===o.id&&x.fingerprint===fingerprint(o)&&x.stage===stage),'اعتمد البروفة أولًا أو استخدم تجاوزًا مسببًا بصلاحية المدير');const n=clone(o);n.ops149||={};n.ops149.stage=stage;n.ops149.history=[...(n.ops149.history||[]),{at,stage,user:user.name||user.username||'',note}];n.status=M.stages.indexOf(stage)>=4?stage:'قيد التنفيذ';return n;}
function assertTransition(prior,next,user){for(const k of ['proofApprovals650','workflowOverrides650']){const old=new Map(rows(prior,k).map(x=>[x.id,x]));for(const x of old.values())need(same(x,rows(next,k).find(a=>a.id===x.id)),'سجل اعتماد البروفات والتجاوزات لا يُعدل ولا يُحذف');for(const x of rows(next,k).filter(x=>!old.has(x.id))){need(P.can(user,k==='proofApprovals650'?'proof_approve':'proof_override'),'لا توجد صلاحية اعتماد أو تجاوز البروفة');need(x.userId===String(user.id),'مستخدم اعتماد البروفة غير صحيح');need(/^\d{4}-\d{2}-\d{2}T/.test(x.createdAt||''),'تاريخ اعتماد غير صالح');const o=rows(next,'orders').find(o=>o.id===x.orderId);need(o&&x.fingerprint===fingerprint(o),'اعتماد البروفة لا يطابق التصميم الحالي');if(k==='proofApprovals650'){need(['approve','revoke'].includes(x.action),'إجراء اعتماد غير صالح');if(x.action==='approve'){need(/^\d{4}-\d{2}-\d{2}$/.test(x.customerDate||'')&&String(x.channel||'').trim(),'حدد تاريخ ووسيلة اعتماد العميل');need(x.attachment?.file&&x.attachment.sha256,'أرفق صورة أو ملف إثبات الاعتماد');}}else need(M.stages.includes(x.stage)&&String(x.reason||'').trim(),'اكتب سبب التجاوز والمرحلة');}}
 for(const o of rows(next,'orders')){const old=rows(prior,'orders').find(x=>x.id===o.id);if(old?.ops149?.proofRequired650&&!gated(o))need(P.can(user,'proof_override'),'إلغاء طلب اعتماد البروفة يحتاج صلاحية المدير');const stage=o.ops149?.stage||o.status,changed=!old||stage!==(old.ops149?.stage||old.status)||fingerprint(o)!==fingerprint(old);if(changed&&needApproval(o,stage))need(approval(next,o)||rows(next,'workflowOverrides650').some(x=>x.orderId===o.id&&x.fingerprint===fingerprint(o)&&x.stage===stage),'لا يمكن بدء الطباعة قبل اعتماد تصميم البروفة الحالي');}
 return true;}
return{fingerprint,approval,move,assertTransition,active,gated,needApproval};});

};
modules['permissions-650.js']=function(module,exports,require){
(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.Permissions650=api;})(globalThis,function(){'use strict';
const legacy=["cli_add", "cli_delete", "cli_edit", "cli_statement", "export", "guidance_view", "inv_create", "inv_credit", "inv_delete", "inv_discount", "inv_edit", "inv_pay", "inv_print", "inv_status", "ops_cost", "ops_manage", "ops_paper", "ops_pricing", "ops_reserve", "ops_shift", "ops_waste", "pur_add", "pur_delete", "pur_edit", "quote_convert", "quote_create", "quote_delete", "record_view", "sets_backup", "sets_invoice", "sets_numbers", "sets_shop", "sets_ui", "stock_add", "stock_adjust", "stock_cost", "stock_delete", "stock_edit", "sup_add", "sup_delete", "sup_edit", "sup_statement", "svc_add", "svc_delete", "svc_edit", "svc_pay", "tab_cashier", "tab_clients", "tab_dashboard", "tab_inventory", "tab_operations", "tab_orders", "tab_purchases", "tab_quotes", "tab_services", "tab_settings", "tab_stocktake", "tab_suppliers", "tab_treasury", "tre_add", "tre_delete", "tre_edit"];
const extra=['workday_view','quickbar_use','invoice_suggest','invoice_layout','settings_search','kanban_view','proof_approve','proof_override','profit_view','finance_reverse','audit_view'];const known=new Set([...legacy,...extra]);
const oldAlias={inv_discount:'discount',inv_print:'print'};for(const k of legacy)if(/_(edit|delete)$/.test(k))oldAlias[k]='editDelete';
function legacyValue(u,key){if(u.role==='admin')return true;const p=u.perms||{};if(Object.prototype.hasOwnProperty.call(p,key))return p[key]===true;if(oldAlias[key]&&Object.prototype.hasOwnProperty.call(p,oldAlias[key]))return p[oldAlias[key]]===true;if(key==='tab_cashier'||key==='tab_operations')return legacyValue(u,'tab_orders');if(key.startsWith('ops_')||key==='guidance_view')return false;if(/_(edit|delete)$/.test(key)||key.startsWith('sets_')||key==='tab_settings')return false;if(u.role==='storekeeper'&&(key==='tab_services'||key==='tab_treasury'||key.startsWith('svc_')||key.startsWith('tre_')))return false;return legacy.includes(key);}
function migrate(s){let changed=false;for(const u of s.users||[]){if(u.permissionSchema650)continue;const p={...(u.perms||{})};for(const k of legacy)if(!Object.prototype.hasOwnProperty.call(p,k))p[k]=legacyValue(u,k);for(const k of extra)p[k]=u.role==='admin'||['quickbar_use','invoice_suggest','invoice_layout','settings_search'].includes(k)||(k==='workday_view'&&legacyValue(u,'tab_dashboard'))||(k==='kanban_view'&&legacyValue(u,'tab_operations'));u.perms=p;u.permissionSchema650=1;changed=true;}return changed;}
function can(u,key){if(!u||!known.has(key))return false;if(u.role==='admin')return true;if(Object.prototype.hasOwnProperty.call(u.perms||{},key))return u.perms[key]===true;return legacy.includes(key)?legacyValue(u,key):false;}
return {can,migrate,legacy,extra,known:[...known]};});

};
modules['quick-access-651.js']=function(module,exports,require){
(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.QuickAccess651=api;})(globalThis,function(){'use strict';
const sections=[['dashboard','لوحة التحكم'],['orders','المبيعات والفواتير'],['cashier','الكاشير'],['clients','حسابات العملاء'],['suppliers','حسابات الموردين'],['inventory','المخزن والخامات'],['stocktake','جرد المخزن'],['purchases','الوارد والمشتريات'],['services','الخدمات وقائمة الأسعار'],['external407','المسحوبات الخارجية'],['digitalcalc','حاسبة الطباعة والمقاسات'],['quotes','عروض الأسعار والمسودات'],['treasury','الخزينة'],['operations','التشغيل والتطوير'],['settings','الإعدادات']];
const panes=[['jobs','طلبات التشغيل','tab_operations'],['pricing','التسعير والباركود','ops_pricing'],['shifts','ورديات الكاشير','ops_shift'],['reservations','حجز الخامات','ops_reserve'],['waste','الهالك والتكاليف','ops_waste'],['alerts','تنبيهات التشغيل','tab_operations'],['audit','مراجعة التشغيل','audit_view']];
const windows=[
 ['externalNew','تسجيل مسحوبات خارجية','svc_add','externalNew702'],['serviceMovements','حركات الخدمات والحسابات','tab_services','serviceMovements702'],['purchaseRequest','طلب شراء جديد','pur_add','openPurchaseRequest147'],
 ['new','فاتورة جديدة','inv_create','newSale'],['purchases','تسجيل وارد خامات','pur_add','openModal','modalPurchase'],['treasury','تسجيل حركة خزينة','tre_add','openModal','modalTransaction'],['client','إضافة عميل','cli_add','openModal','modalClient'],['supplier','إضافة مورد','sup_add','openModal','modalSupplier'],['item','إضافة صنف','stock_add','openAddItem'],['service','تسجيل خدمة / مسحوبات','svc_add','openModal','modalService'],['quote','عرض سعر جديد','quote_create','newQuote'],['catalog','إضافة خدمة إلى الدليل','tab_services','openServiceCatalogModal'],['categories','تصنيفات المخزن','stock_edit','manageCategories'],['invoiceSettings','إعدادات الفاتورة','sets_invoice','openInvoiceSettings'],['lastInvoice','معاينة آخر فاتورة','inv_print','invPreviewLast'],['dailyClosing','إقفال الخزينة اليومي','tab_treasury','openDailyTreasuryClosingModal162'],['return','مرتجع مبيعات رسمي','finance_reverse','return650'],['correction','تصحيح مالي','finance_reverse','correction650'],['quickSettings','ألوان وإعدادات الوصول السريع','quickbar_use','quickSettings651'],['connection','ربط الهاتف وحالة الاتصال',null,'openLanSyncModal'],['review','مركز مراجعة البيانات',null,'showReviewCenter'],['about','حول البرنامج',null,'openAboutProgram'],['shortcuts','اختصارات لوحة المفاتيح','quickbar_use','keyboard651'],['guide','دليل اختصارات لوحة المفاتيح','quickbar_use','guide651'],['notifications','مركز الإشعارات والتنبيهات','quickbar_use','notifications651'],['calendar','التقويم','quickbar_use','toggleMiniCalendar'],['cashierConfig','إعداد أزرار الكاشير',null,'cashierConfig651'],['dailyOperations','تقرير أوامر التشغيل','inv_print','opsReport651'],['cost','تسجيل تكلفة طلب','ops_cost','opsCost651'],['waste','تسجيل هالك','ops_waste','opsWaste651'],['shift','فتح وردية','ops_shift','opsShift651'],['reserve','حجز خامات لعرض سعر','ops_reserve','opsReserve651']
];
const legacy={new:['فاتورة جديدة','inv_create'],cashier:['الكاشير','tab_cashier'],clients:['حسابات العملاء','tab_clients'],purchases:['وارد خامات','pur_add'],services:['المسحوبات والخدمات','tab_services'],treasury:['حركة خزينة','tre_add'],kanban:['لوحة التشغيل','kanban_view'],today:['شغل اليوم','workday_view'],profit:['ربحية الطلبات','profit_view'],journal:['السجل والتصحيحات','audit_view'],search:['البحث الشامل','settings_search']};
const actions=[...Object.entries(legacy).map(([id,[label,permission]])=>({id,label,permission,group:'المفضلة الأساسية',kind:'legacy'})),...sections.map(([tab,label])=>({id:'tab:'+tab,label,tab,permission:'tab_'+tab,kind:'tab',group:'الأقسام'})),...panes.map(([pane,label,permission])=>({id:'ops:'+pane,label,pane,permission,kind:'ops',group:'تبويبات التشغيل'})),...windows.map(([key,label,permission,fn,arg])=>({id:'window:'+key,label,permission,fn,arg,kind:'window',admin:['connection','review','return','correction','cashierConfig'].includes(key),requires:({new:['tab_orders'],externalNew:['tab_services'],purchaseRequest:['tab_purchases'],cost:['stock_cost'],waste:['stock_adjust'],shift:['tab_treasury']})[key]||[],group:'النوافذ والأدوات'}))];
const byId=new Map(actions.map(x=>[x.id,x])),recordTypes={order:['معاينة فاتورة مبيعات','orders','inv_print'],pur:['فاتورة وارد','purchases','tab_purchases'],tre:['سند خزينة','treasury','tab_treasury'],service:['خدمة / مسحوبات','services','tab_services'],client:['كشف حساب عميل','clients','cli_statement'],supplier:['كشف حساب مورد','suppliers','sup_statement'],item:['صنف مخزن','items','tab_inventory'],quote:['عرض سعر','quotes','tab_quotes'],'sales-return':['إشعار مرتجع','salesReturns640','inv_print'],correction:['إشعار تصحيح','corrections650','audit_view']};
function recordId(kind,id){if(!recordTypes[kind]||!String(id)||String(id).length>180)throw Error('مصدر الاختصار غير صالح');return 'record:'+kind+':'+encodeURIComponent(String(id));}
function resolve(id){if(byId.has(id))return byId.get(id);if(/^settings:[a-z][a-z0-9_-]{0,99}$/i.test(id))return {id,kind:'settings',tab:id.slice(9),permission:'tab_settings',group:'تبويبات الإعدادات'};const match=String(id).match(/^record:([a-z-]+):(.{1,540})$/);if(!match||!recordTypes[match[1]])return null;try{const value=decodeURIComponent(match[2]);if(!value||value.length>180||encodeURIComponent(value)!==match[2]||/[\x00-\x1f]/.test(value))return null;const [label,collection,permission]=recordTypes[match[1]];return {id,kind:'record',recordKind:match[1],recordId:value,collection,permission,label,group:'نوافذ من السجلات'};}catch{return null;}}
const aliases702={new:'window:new',cashier:'tab:cashier',clients:'tab:clients',purchases:'window:purchases',services:'tab:services',treasury:'window:treasury','window:invoiceSettings':'settings:invoiceTab'};
function targetKey702(value){const id=typeof value==='string'?value:value?.id;return aliases702[id]||id;}
function uniqueActions702(input,preferred=[]){const index=new Map(input.map(a=>[a.id,a])),seen=new Set();return [...preferred.map(id=>index.get(id)).filter(Boolean),...input].filter(a=>{const key=targetKey702(a);if(!key||seen.has(key))return false;seen.add(key);return true;});}
function uniqueIds702(ids){return uniqueActions702(ids.map(resolve).filter(Boolean)).map(a=>a.id);}
const palettes={light:{background:'#edf4fa',text:'#183247',buttonBackground:'#ffffff',buttonText:'#183247',border:'#b3c6d6',hoverBackground:'#d9eaf5',hoverText:'#143247',activeBackground:'#0f766e',activeText:'#ffffff'},dark:{background:'#102033',text:'#edf4ff',buttonBackground:'#1c3049',buttonText:'#f1f6ff',border:'#4a6481',hoverBackground:'#2b4564',hoverText:'#ffffff',activeBackground:'#0f766e',activeText:'#ffffff'}};
const widgetIds700=['due', 'late', 'proof', 'receivables', 'ready', 'printing', 'approval', 'active', 'lowStock', 'supplierDue', 'salesToday', 'purchasesToday', 'quotesToday', 'cashToday'];
const defaults={mode:'auto',density:'comfortable',fontSize:13,height:38,radius:9,gap:7,wrap:'scroll',align:'start',sticky:true,showIcons:true,enabled:true};
function luminance(hex){const c=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;}
function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
function normalizeStyle(input={}){const v={...defaults,...input};for(const theme of ['light','dark'])v[theme]={...palettes[theme],...(input[theme]||{})};return v;}
function validateStyle(input){if(input===undefined)return true;if(!input||typeof input!=='object'||Array.isArray(input))throw Error('إعدادات الوصول السريع غير صالحة');const allowed=[...Object.keys(defaults),'light','dark'];if(Object.keys(input).some(k=>!allowed.includes(k)))throw Error('إعداد وصول سريع غير معروف');const v=normalizeStyle(input);for(const [key,min,max]of [['fontSize',11,18],['height',30,64],['radius',0,20],['gap',2,18]])if(!Number.isInteger(v[key])||v[key]<min||v[key]>max)throw Error('مقاس الوصول السريع خارج الحدود');for(const [key,options]of [['mode',['auto','custom']],['density',['compact','comfortable']],['wrap',['scroll','wrap']],['align',['start','center','end']]])if(!options.includes(v[key]))throw Error('اختيار وصول سريع غير صالح');for(const key of ['sticky','showIcons','enabled'])if(typeof v[key]!=='boolean')throw Error('خيار وصول سريع غير صالح');for(const theme of ['light','dark']){const p=v[theme];if(Object.keys(p).some(k=>!Object.keys(palettes.light).includes(k))||Object.values(p).some(c=>typeof c!=='string'||!/^#[0-9a-f]{6}$/i.test(c)))throw Error('لون الوصول السريع غير صالح');}return true;}
function validatePreferences(state){const all=state.userPrefs650;if(all===undefined)return true;if(!Array.isArray(all))throw Error('قائمة تفضيلات المستخدمين غير صالحة');const users=new Set((state.users||[]).map(u=>String(u.id))),seen=new Set();for(const p of all){if(!p||typeof p.id!=='string'||!users.has(p.id)||seen.has(p.id))throw Error('تفضيلات مستخدم غير موجود أو مكرر');seen.add(p.id);if(Object.keys(p).some(k=>!['id','widgets','quick','layout','favorites','quickStyle651','quickOverrides700'].includes(k)))throw Error('إصدار تفضيلات غير مدعوم');validateStyle(p.quickStyle651);validateOverrides700(p.quickOverrides700);if(p.quick!==undefined&&(!Array.isArray(p.quick)||p.quick.length>80||new Set(p.quick).size!==p.quick.length||p.quick.some(k=>!resolve(k))))throw Error('قائمة اختصارات غير صالحة');if(p.widgets!==undefined&&(!Array.isArray(p.widgets)||p.widgets.some(k=>!widgetIds700.includes(k))))throw Error('قائمة بطاقات غير صالحة');if(p.layout!==undefined&&!['basic','details'].includes(p.layout))throw Error('وضع فاتورة غير صالح');if(p.favorites!==undefined&&(!Array.isArray(p.favorites)||p.favorites.length>30||p.favorites.some(k=>typeof k!=='string'||k.length>100)))throw Error('مفضلة إعدادات غير صالحة');}return true;}
function validateOverrides700(input){if(input===undefined)return true;if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).length>80)throw Error('ألوان الاختصارات غير صالحة');for(const [id,p]of Object.entries(input)){if(!resolve(id)||!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).some(k=>!['background','text'].includes(k))||!/^#[0-9a-f]{6}$/i.test(p.background)||!/^#[0-9a-f]{6}$/i.test(p.text))throw Error('لون اختصار غير صالح');}return true;}
function autoText(background){return contrast(background,'#ffffff')>=contrast(background,'#132a40')?'#ffffff':'#132a40';}
return {targetKey702,uniqueActions702,uniqueIds702,widgetIds700,validateOverrides700,actions,sections,panes,recordTypes,resolve,recordId,validId:id=>typeof id==='string'&&!!resolve(id),palettes,defaults,normalizeStyle,validateStyle,validatePreferences,contrast,autoText};});

};
modules['discounts-408.js']=function(module,exports,require){
(function(root,factory){const api=factory(typeof module==='object'?require('./accounting-math-401.js'):root.AccountingMath401);if(typeof module==='object')module.exports=api;else root.Discounts408=api;})(globalThis,function(M){
'use strict';const cents=v=>M.scaled(v,2),cash=v=>Number(v)/100;
function discount(base,type='amt',value=0){const b=cents(base),v=Number(value??0);if(b<0n||b>100000000000000n)throw Error('قيمة المستند خارج الحدود');if(!Number.isFinite(v)||v<0||!['amt','pct'].includes(type)||type==='pct'&&v>100)throw Error('الخصم يجب أن يكون مبلغًا غير سالب أو نسبة من 0 إلى 100');if(M.round(v,type==='pct'?4:2)!==v)throw Error('الخصم: مبلغ حتى منزلتين أو نسبة حتى أربع منازل');const d=type==='pct'?(b*M.scaled(v,4)+500000n)/1000000n:cents(v);if(d>b)throw Error('الخصم أكبر من القيمة المستحقة');return cash(d);}
function bill(raw,{type='amt',value=0}={}){if(!Array.isArray(raw)||!raw.length)throw Error('أضف بندًا واحدًا على الأقل');const lines=raw.map(l=>{const qty=Number(l.qty),price=Number(l.price??l.unitPrice);if(!Number.isFinite(qty)||qty<=0||!Number.isFinite(price)||price<0)throw Error('كمية أو سعر غير صالح');const gross=M.lineTotal(qty,price),dt=l.discountType||'amt',dv=Number(l.discountValue??0),ld=discount(gross,dt,dv);return {...l,qty,price,gross408:gross,discountType:dt,discountValue:dv,discount:ld,amount:cash(cents(gross)-cents(ld))};});const base=lines.reduce((n,l)=>n+cents(l.amount),0n),inv=cents(discount(cash(base),type,value));let allocated=0n;const parts=lines.map((l,i)=>{const product=cents(l.amount)*inv,n=base?product/base:0n;allocated+=n;return {i,n,remainder:base?product%base:0n};});let left=inv-allocated;for(const p of [...parts].sort((a,b)=>a.remainder===b.remainder?a.i-b.i:a.remainder>b.remainder?-1:1)){if(!left)break;p.n++;left--;}
for(const p of parts){const l=lines[p.i];l.invoiceDiscount408=cash(p.n);l.net408=cash(cents(l.amount)-p.n);}
const gross=lines.reduce((n,l)=>n+cents(l.gross408),0n),lineDiscount=lines.reduce((n,l)=>n+cents(l.discount),0n);return {lines,gross408:cash(gross),lineDiscount408:cash(lineDiscount),invoiceDiscount408:cash(inv),discount:cash(lineDiscount+inv),subtotal:cash(base),total:cash(base-inv),discountType:type,discountValue:Number(value??0)};}
function validateReceipt(r,lines){const b=bill(lines,{type:r.invoiceDiscountType408||'amt',value:r.invoiceDiscountValue408||0});if(cents(b.total)!==cents(r.amount??r.total)||cents(b.gross408)!==cents(r.gross408)||cents(b.discount)!==cents(r.discount408))throw Error('خصومات المستند لا تطابق صافي قيمته');return b;}
return{discount,bill,validateReceipt,cents,cash};});

};
modules['server-permissions-166.cjs']=function(module,exports,require){
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

};
modules['order-status-409.js']=function(module,exports,require){
(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.OrderStatus409=api;})(globalThis,function(){
 'use strict';const statuses=['قيد التنفيذ','جاهز للتسليم','تم التسليم'];
 function plan(record,status,user,at=new Date().toISOString()){
  if(!statuses.includes(status))throw Error('حالة غير صالحة');
  if(record.status===status)return JSON.parse(JSON.stringify(record));
  const next=JSON.parse(JSON.stringify(record));next.status=status;next.ops149||={};
  next.ops149.stage=status==='قيد التنفيذ'?'انتظار التصميم':status;
  next.ops149.history=[...(next.ops149.history||[]),{at,stage:next.ops149.stage,user:String(user||''),note:'تغيير الحالة من قائمة الإجراءات'}];return next;
 }
 function isTransition(before,after,user){
  if(!statuses.includes(after.status)||before.status===after.status)return false;
  const last=after.ops149?.history?.at(-1);if(!last||!/^\d{4}-\d{2}-\d{2}T/.test(last.at||''))return false;
  return JSON.stringify(plan(before,after.status,user,last.at))===JSON.stringify(after);
 }
 return {statuses,plan,isTransition};
});

};
modules['renderer-state-650.cjs']=function(module,exports,require){
'use strict';
const MARKER='$native650$';
const clone=v=>JSON.parse(JSON.stringify(v));
function users650(users){return (users||[]).map(u=>({...u,pin:MARKER}));}
function public650(s){if(!s)return null;const shop=s.shopSettings||{};return {_public650:true,isLocked:true,currentUser:s.currentUser,users:(s.users||[]).map(u=>({id:u.id,name:u.name,username:u.username,role:u.role,pin:MARKER,pinLength:u.pinLength||4,pinDefault:!!u.pinDefault})),shopSettings:Object.fromEntries(['name','subTitle','logo','ui'].filter(k=>shop[k]!==undefined).map(k=>[k,clone(shop[k])])),orders:[],items:[],clients:[],suppliers:[],purchases:[],treasury:[],services:[],quotes:[],adjustments:[]};}
function project(s,authenticated){if(!s)return null;const value=typeof s==='string'?JSON.parse(s):s;if(!authenticated)return JSON.stringify(public650(value));const out=clone(value);out.users=users650(out.users);delete out._public650;delete out.auditTrail166;return JSON.stringify(out);}
function mergePins(prior,next){const old=new Map((prior.users||[]).map(u=>[String(u.id),u]));for(const u of next.users||[])if(u.pin===MARKER||u.pin===undefined){const p=old.get(String(u.id));if(!p)throw Error('اختر PIN صالحًا للحساب الجديد');u.pin=p.pin;}return next;}
module.exports={MARKER,project,mergePins,public650};

};
modules['external-services-407.js']=function(module,exports,require){
(function(root,factory){const api=factory(typeof module==='object'?require('./accounting-math-401.js'):root.AccountingMath401,typeof module==='object'?require('./service-payments-401.js'):root.ServicePayments401);if(typeof module==='object')module.exports=api;else root.ExternalServices407=api;})(globalThis,function(M,Payments){
 'use strict';
 const Ref=typeof module==='object'?require('./document-reference-409.js'):globalThis.DocumentReference409;
 const D=typeof module==='object'?require('./discounts-408.js'):globalThis.Discounts408;
 const external=s=>s.external407===true&&s.kind==='received'&&s.partyType==='supplier';
 const cents=v=>Number(M.scaled(v,2));
 function date(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||new Date(value+'T12:00:00Z').toISOString().slice(0,10)!==value)throw Error('تاريخ غير صالح');return value;}
 function lines(raw){if(!Array.isArray(raw)||!raw.length||raw.length>100)throw Error('أضف من 1 إلى 100 بند');return raw.map(l=>{const title=String(l.title||'').trim().slice(0,300),qty=M.round(l.qty,4),price=M.round(l.price,4);if(!title||!(qty>0)||qty>1e9||price<0||price>1e9)throw Error('راجع بيان البند والكمية والسعر');const amount=M.lineTotal(qty,price);if(amount>1e12)throw Error('قيمة البند أكبر من الحد المسموح');const dt=l.discountType||'amt',dv=Number(l.discountValue||0),disc=D.discount(amount,dt,dv);return {title,qty,price,amount:M.round(amount-disc),gross408:amount,discount:disc,discountType:dt,discountValue:dv,notes:String(l.notes||'').slice(0,1500),unit:String(l.unit||'').slice(0,40),catalogId:String(l.catalogId||'').slice(0,100)};});}
 function post(state,input){
  const supplier=(state.suppliers||[]).find(s=>s.id===input.supplierId);if(!supplier)throw Error('اختر موردًا مسجلًا');
  if(!input.id)throw Error('رقم مستند غير صالح');
  const old=(state.services||[]).find(s=>s.id===input.id);
  if(old&&!external(old))throw Error('نوع المستند غير قابل للتعديل هنا');
  const cashRows=(state.treasury||[]).filter(t=>t.serviceId===input.id),hasPayment=Number(old?.paid)>0||cashRows.length>0;
  if(old&&hasPayment&&old.partyId!==supplier.id)throw Error('لا يمكن نقل مستند له دفعات إلى مورد آخر؛ احتفظ بالمورد واراجع سندات السداد من مصدرها');
  const paid=M.round(input.paid??old?.paid??0);
  if(old&&paid!==Number(old.paid||0))throw Error('احتفظ بالمدفوع السابق؛ سجّل الدفعات الجديدة من التسوية');
  const detail=lines(input.lines),bill=D.bill(detail,{type:input.discountType||'amt',value:input.discountValue||0}),amount=bill.total;
  if(amount<0||bill.gross408<=0||amount>1e12)throw Error('إجمالي المسحوبات يجب أن يكون أكبر من صفر');
  if(paid<0||paid>amount)throw Error('صافي المسحوبات لا يمكن أن يقل عن المدفوع السابق');
  const documentNo409=Ref.validate(input.documentNo409||old?.documentNo409||(old?Ref.reference(old):Ref.next(state.services||[])),state.services||[],input.id);
  const rec={...old,id:input.id,documentNo409,date:date(input.date),kind:'received',partyType:'supplier',partyId:supplier.id,partyName:supplier.name,title:detail.map(l=>l.title+' × '+l.qty).join(' | '),amount,paid,inTreasury:true,notes:String(input.notes||'').slice(0,3000),external407:true,lines407:detail,discountSchema408:true,gross408:bill.gross408,discount408:bill.discount,lineDiscount408:bill.lineDiscount408,invoiceDiscount408:bill.invoiceDiscount408,invoiceDiscountType408:input.discountType||'amt',invoiceDiscountValue408:Number(input.discountValue||0),paymentMethod:input.method||old?.paymentMethod||'نقدي'};
  let cash=state.treasury;
  if(!old&&paid>0){const temp={treasury:[...(state.treasury||[])]};const t=Payments.reconcile(temp,rec,{date:rec.date,paymentDate:rec.date,user:input.user||''});if(t)t.paymentMethod=rec.paymentMethod;cash=temp.treasury;}
  const next=[...(state.services||[])];if(old)next[next.indexOf(old)]=rec;else next.push(rec);
  state.treasury=cash;state.services=next;return rec;
 }
 function settle(state,input){date(input.date);if(!(state.suppliers||[]).some(s=>s.id===input.supplierId))throw Error('اختر المورد');if(!input.id||(state.treasury||[]).some(t=>t.settlement407===input.id))throw Error('تم تسجيل هذه التسوية بالفعل؛ حدّث كشف الحساب');const amount=cents(input.amount);if(amount<=0||amount>1e14)throw Error('أدخل مبلغ سداد موجبًا');const ids=new Set(input.ids||[]);if(!ids.size)throw Error('لا توجد مسحوبات للتسوية');const rows=(state.services||[]).filter(s=>ids.has(s.id));if(rows.length!==ids.size||rows.some(s=>!external(s)||s.partyId!==input.supplierId))throw Error('التسوية تشمل مستندًا غير صالح أو موردًا آخر');const P=typeof module==='object'?require('./party-ledger-411.js'):globalThis.PartyLedger411,allocation=P.supplierPlan(state);const due=rows.reduce((n,s)=>n+cents(s.amount)-cents(allocation.services.get(s.id)??s.paid),0);if(amount>due)throw Error('المبلغ يتجاوز متبقي المسحوبات المختارة');let left=amount;const next={services:(state.services||[]).map(s=>({...s})),treasury:[...(state.treasury||[])]};const allocations=[];for(const row of rows.sort((a,b)=>a.date.localeCompare(b.date)||String(a.id).localeCompare(String(b.id)))){const pay=Math.min(left,cents(row.amount)-cents(allocation.services.get(row.id)??row.paid));if(pay<=0)continue;const service=next.services.find(s=>s.id===row.id);service.paid=(cents(service.paid)+pay)/100;const t=Payments.reconcile(next,service,{date:input.date,paymentDate:input.date,user:input.user||'',id:input.id+'_'+allocations.length});if(t){t.settlement407=input.id;t.paymentMethod=input.method||'نقدي';}allocations.push({id:row.id,amount:pay/100});left-=pay;if(!left)break;}if(left)throw Error('تعذر توزيع مبلغ التسوية');state.services=next.services;state.treasury=next.treasury;return allocations;}
 function validate(state){const seen=new Map();for(const s of state.services||[]){const no=Ref.reference(s);if(seen.has(no)&&(s.documentNo409||seen.get(no)))throw Error('رقم مستند مكرر');seen.set(no,Boolean(s.documentNo409));}for(const s of state.services||[])if(s.external407===true){if(!external(s)||s.inTreasury!==true)throw Error('نوع مسحوب خارجي غير صالح');const normalized=lines(s.lines407);if(normalized.some((l,i)=>cents(l.amount)!==cents(s.lines407[i].amount)||l.qty!==Number(s.lines407[i].qty)||l.price!==Number(s.lines407[i].price)))throw Error('بيانات بند المسحوبات غير متطابقة');const total=normalized.reduce((n,l)=>n+cents(l.amount),0);if(s.discountSchema408){D.validateReceipt(s,s.lines407);if(cents(s.discount408)<0)throw Error('خصم غير صالح');}else if(total!==cents(s.amount))throw Error('بنود المسحوبات لا تطابق إجمالي المستند');if(s.documentNo409)Ref.validate(s.documentNo409,[],s.id);date(s.date);}}
 return{external,lines,post,settle,validate};
});

};
modules['service-payments-401.js']=function(module,exports,require){
(function(root, factory) {
    const math = typeof module === 'object' && module.exports ? require('./accounting-math-401.js') : root.AccountingMath401;
    const api = factory(math);
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) root.ServicePayments401 = api;
})(typeof window !== 'undefined' ? window : null, function(math) {
    'use strict';
    function reconcile(state, service, {date, paymentDate, user = '', id} = {}) {
        const rows = (state.treasury || []).filter(t => t.serviceId === service.id);
        const incoming = service.kind === 'provided';
        const desired = service.inTreasury ? math.round(service.paid || 0) : 0;
        const current = math.round(rows.reduce((sum, t) => sum + Number(incoming ? t.inAmount || 0 : t.outAmount || 0), 0));
        if (!Number.isFinite(desired) || desired < 0 || desired > Number(service.amount)) throw Error('مدفوع الخدمة غير صالح');
        if (rows.some(t => Number(incoming ? t.outAmount || 0 : t.inAmount || 0) > 0)) throw Error('لا يمكن تبديل اتجاه خدمة لها دفعات؛ اعكس الدفعات أولاً');
        // Reducing paid cash requires an explicit reversal, never rewriting old dates.
        if (desired < current) throw Error('لا يمكن إنقاص مدفوع الخدمة أو إلغاء قيد الخزينة بعد السداد؛ راجع الدفعات من مصدرها');
        const delta = math.round(desired - current);
        if (!delta) return null;
        const record = {id: id || 't_s_' + (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now() + '_' + Math.random().toString(36).slice(2)),
            date: paymentDate || (rows.length ? date : service.date || date), type: incoming ? 'service_in' : 'service_out',
            desc: `${incoming ? 'تحصيل' : 'سداد'} خدمة #${service.id} - ${service.title} (${service.partyName})`,
            inAmount: incoming ? delta : 0, outAmount: incoming ? 0 : delta,
            clientId: null, supplierId: null, serviceId: service.id, kind: 'service_payment', paymentMethod:service.paymentMethod||'نقدي', user};
        if (state.treasury.some(t => t.id === record.id)) throw Error('رقم سند خدمة مكرر');
        state.treasury.push(record);
        return record;
    }
    function entries(service, treasury) {
        const rows=(treasury||[]).filter(t=>t.serviceId===service.id).map(t=>({id:t.id,date:String(t.date||service.date||''),amount:math.round(Number(t.inAmount||0)+Number(t.outAmount||0))})).filter(t=>t.amount>0);
        const allocated=rows.reduce((n,t)=>n+math.scaled(t.amount,2),0n),unlinked=math.scaled(service.paid||0,2)-allocated;
        if(unlinked>0n)rows.push({id:'legacy:'+service.id,date:String(service.date||''),amount:Number(unlinked)/100});
        return rows;
    }
    return Object.freeze({reconcile, entries});
});

};
modules['document-reference-409.js']=function(module,exports,require){
(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.DocumentReference409=api;})(globalThis,function(){
 'use strict';
 function reference(record,prefix='EXT'){
  if(record.documentNo409)return String(record.documentNo409);
  if(record.orderNo||record.no||record.receiptBatch400)return String(record.orderNo||record.no||record.receiptBatch400);
  const id=String(record.id||'');if(/^(?:EXT|SVC|IN|PUR)-\d+$/i.test(id))return id;
  // A deterministic display-only reference for historical UUID records. Never changes their ledger key.
  let hash=2166136261;for(const ch of id){hash^=ch.charCodeAt(0);hash=Math.imul(hash,16777619);}
  return prefix+'-'+String(hash>>>0).padStart(10,'0');
 }
 function next(records,prefix='EXT'){
  let n=1000;const used=new Set(records.map(r=>reference(r,prefix)));
  for(const r of records){const m=new RegExp('^'+prefix+'-(\\d{4,7})$').exec(String(r.documentNo409||''));if(m)n=Math.max(n,Number(m[1]));}
  do{n++;}while(used.has(prefix+'-'+n));return prefix+'-'+n;
 }
 function validate(value,records,id){const no=String(value||'').trim();if(!no||no.length>40||/[\u0000-\u001f<>]/.test(no))throw Error('أدخل رقم مستند واضحًا من 1 إلى 40 حرفًا');if(records.some(r=>r.id!==id&&reference(r)===no))throw Error('رقم المستند مستخدم بالفعل');return no;}
 return {reference,next,validate};
});

};
modules['treasury-discounts-408.js']=function(module,exports,require){
(function(root,factory){const api=factory(typeof module==='object'?require('./discounts-408.js'):root.Discounts408);if(typeof module==='object')module.exports=api;else root.TreasuryDiscounts408=api;})(globalThis,function(D){'use strict';
function plan(input){if(!['collection','supplier_payment','expense','manual_deposit'].includes(input.type))throw Error('نوع حركة غير صالح');const gross=Number(input.amount),disc=D.discount(gross,input.discountType||'amt',input.discountValue||0);if(!Number.isFinite(gross)||gross<=0)throw Error('أدخل القيمة المستحقة قبل الخصم');const net=D.cash(D.cents(gross)-D.cents(disc)),client=input.type==='collection',supplier=input.type==='supplier_payment';if((client||supplier)&&!input.partyId)throw Error('اختر الطرف');const adjustment=disc>0&&(client||supplier)?{id:'discount:'+input.id,date:String(input.date).slice(0,10),party:client?'client':'supplier',partyId:input.partyId,orderId:client?input.orderId||null:null,debit:0,credit:disc,desc:'خصم تسوية — '+String(input.notes||''),discount408:true,treasuryId:net>0?input.id:null,settlementId408:input.id,grossAmount408:gross,discountType:input.discountType||'amt',discountValue:Number(input.discountValue||0)}:null;const entry=net>0?{id:input.id,date:input.date,type:input.type,desc:input.notes||'تسوية بخصم',notes:input.notes||'',inAmount:client||input.type==='manual_deposit'?net:0,outAmount:supplier||input.type==='expense'?net:0,clientId:client?input.partyId:null,supplierId:supplier?input.partyId:null,...(client&&input.orderId?{orderId:input.orderId,kind:'payment'}:{}),paymentMethod:input.method||'نقدي',user:input.user||'',discountSchema408:true,grossAmount408:gross,discount408:disc,discountType:input.discountType||'amt',discountValue:Number(input.discountValue||0),settlementAdjustment408:adjustment?.id||null}:null;return{entry,adjustment,gross,discount:disc,net};}
function balance(state,party,id){const client=party==='client',master=(client?state.clients:state.suppliers)?.find(r=>r.id===id);if(!master)return 0;let sum=D.cents(client?master.initialBalance||0:master.balance||0);for(const o of client?state.orders||[]:state.purchases||[])if((client?o.clientId:o.supplierId)===id)sum+=client?D.cents(o.total||0)-D.cents(o.paid||0):D.cents(o.due||0);for(const t of state.treasury||[]){if(client&&t.clientId===id&&t.type==='collection'&&t.kind!=='deposit'&&!/^عربون أمر شغل #/.test(t.desc||''))sum-=D.cents(t.inAmount||0);if(!client&&t.supplierId===id&&t.type==='supplier_payment'&&t.kind!=='purchase_payment'&&!/^سداد نقدي لوارد/.test(t.desc||''))sum-=D.cents(t.outAmount||0);}for(const a of state.adjustments||[])if(a.party===party&&a.partyId===id)sum+=D.cents(a.debit||0)-D.cents(a.credit||0);for(const s of state.services||[])if(s.partyType===party&&s.partyId===id)sum+=BigInt(client===(s.kind==='provided')?1:-1)*(D.cents(s.amount||0)-D.cents(s.paid||0));return D.cash(sum);}
function validate(state){for(const t of state.treasury||[])if(t.discountSchema408){const d=D.discount(t.grossAmount408,t.discountType,t.discountValue);if(D.cents(d)!==D.cents(t.discount408)||D.cents(t.inAmount||t.outAmount)!==D.cents(t.grossAmount408)-D.cents(d))throw Error('خصم حركة الخزينة لا يطابق النقد الفعلي');if(['collection','supplier_payment'].includes(t.type)&&d>0){const a=(state.adjustments||[]).find(a=>a.id===t.settlementAdjustment408);if(!a||a.treasuryId!==t.id||a.party!==(t.type==='collection'?'client':'supplier')||a.partyId!==(t.clientId||t.supplierId)||(a.orderId||null)!==(t.orderId||null)||D.cents(a.credit)!==D.cents(d)||Number(a.debit||0)!==0)throw Error('خصم السداد غير مرتبط بتسوية الحساب الصحيحة');}}
for(const a of state.adjustments||[])if(a.discount408&&!a.treasuryId&&(D.cents(a.credit)!==D.cents(a.grossAmount408)||D.cents(D.discount(a.grossAmount408,a.discountType,a.discountValue))!==D.cents(a.credit)))throw Error('تسوية كاملة غير متطابقة');
for(const a of state.adjustments||[])if(a.discount408&&a.treasuryId&&!state.treasury?.some(t=>t.id===a.treasuryId&&t.settlementAdjustment408===a.id))throw Error('تسوية الخصم فقدت حركة الخزينة؛ عدّلها من الحركة الأصلية');}
const rawBalance=balance;function netBalance(s,party,id){const P=typeof module==='object'?require('./party-ledger-411.js'):globalThis.PartyLedger411;return P?(P.balances(s)[party==='client'?'clients':'suppliers'].get(id)||0):rawBalance(s,party,id);}
return{plan,validate,balance:netBalance};});

};

function validate(prior,next,user,restoring=false){if(!next||!Array.isArray(next.users)||!Array.isArray(next.orders))throw Error('بيانات محاسبية غير صالحة');const R=require('./renderer-state-650.cjs');if(prior)R.mergePins(prior,next);require('./permissions-650.js').migrate(next);if(!restoring&&prior&&user){if(String(next.currentUser)!==String(user.id))throw Error('تبديل المستخدم يحتاج PIN');require('./server-permissions-166.cjs').assertChanges(prior,next,user);require('./workspace-650.js').assertPrefs(prior,next,user);require('./workflow-650.js').assertTransition(prior,next,user);}require('./quick-access-651.js').validatePreferences(next);require('./financial-integrity-166.cjs').validate(next);require('./workspace-650.js').allocations(next);require('./corrections-650.js').assertTransition(restoring?next:prior||{},next);require('./sales-returns-640.js').validate(next);if(prior&&!restoring)require('./sales-returns-640.js').assertTransition(prior,next);require('./party-ledger-411.js').validate(next);require('./external-services-407.js').validate(next);require('./treasury-discounts-408.js').validate(next);require('./operations-149-model.js').validateOperations(next);if(prior&&!restoring){const ids=new Set((next.orders||[]).map(o=>o.id));if((next.adjustments||[]).some(a=>a.orderId&&!ids.has(a.orderId)&&(prior.orders||[]).some(o=>o.id===a.orderId)))throw Error('لا يمكن حذف فاتورة لها تسوية');for(const old of prior.orders||[]){const current=next.orders.find(o=>o.id===old.id);if(!current)continue;for(const k of ['ops149','costSnapshot149','paymentParts149','attachments149'])if(old[k]!==undefined&&current[k]===undefined)throw Error('التعديل يفقد بيانات الفاتورة');}for(const o of next.orders)if(o.draftId640&&next.orders.some(v=>v.id!==o.id&&v.draftId640===o.draftId640))throw Error('المسودة سبق حفظها');}if(prior&&!restoring)require('./financial-integrity-166.cjs').preserveDeletionLog(next,prior);return next;}
root.LocalGuard700={validate};if(typeof module==='object')module.exports=root.LocalGuard700;
})(globalThis);
