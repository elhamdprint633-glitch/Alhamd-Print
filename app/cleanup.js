/* Pure, testable historical cleanup. Physical stock is deliberately unchanged. */
(function(root){
'use strict';
const money=n=>Math.round((Number(n)||0)*100)/100;
const collections=['orders','purchases','services','treasury','quotes','adjustments'];
function clientBalance(s,id){let v=Number(s.clients.find(c=>c.id===id)?.initialBalance)||0;for(const o of s.orders)if(o.clientId===id)v+=Number(o.total||0)-Number(o.paid||0);for(const t of s.treasury)if(t.clientId===id&&t.type==='collection'&&t.kind!=='deposit'&&!/^عربون أمر شغل #/.test(t.desc||''))v-=Number(t.inAmount)||0;for(const a of s.adjustments||[])if(a.party==='client'&&a.partyId===id)v+=Number(a.debit||0)-Number(a.credit||0);for(const a of s.services||[])if(a.partyType==='client'&&a.partyId===id)v+=(a.kind==='provided'?1:-1)*(Number(a.amount||0)-Number(a.paid||0));return money(v)}
function supplierBalance(s,id){let v=Number(s.suppliers.find(c=>c.id===id)?.balance)||0;for(const p of s.purchases)if(p.supplierId===id)v+=Number(p.due)||0;for(const t of s.treasury)if(t.supplierId===id&&t.type==='supplier_payment'&&t.kind!=='purchase_payment'&&!/^سداد نقدي لوارد/.test(t.desc||''))v-=Number(t.outAmount)||0;for(const a of s.adjustments||[])if(a.party==='supplier'&&a.partyId===id)v+=Number(a.debit||0)-Number(a.credit||0);for(const a of s.services||[])if(a.partyType==='supplier'&&a.partyId===id)v+=(a.kind==='received'?1:-1)*(Number(a.amount||0)-Number(a.paid||0));return money(v)}
function cash(s){return money(s.treasury.reduce((v,t)=>v+Number(t.inAmount||0)-Number(t.outAmount||0),0))}
function candidates(s,kind,before){if(!collections.includes(kind))return [];return (s[kind]||[]).filter(x=>String(x.date||'').slice(0,10)&&String(x.date).slice(0,10)<before&&(kind!=='treasury'||!x.orderId&&!x.purchaseId&&!x.serviceId&&!['deposit','purchase_payment','service_payment','cleanup_opening'].includes(x.kind)))}

function balances(s){
 const clients=new Map(s.clients.map(c=>[c.id,Number(c.initialBalance)||0])),suppliers=new Map(s.suppliers.map(c=>[c.id,Number(c.balance)||0]));const add=(m,id,n)=>m.set(id,(m.get(id)||0)+n);
 for(const o of s.orders)if(o.clientId)add(clients,o.clientId,Number(o.total||0)-Number(o.paid||0));
 for(const p of s.purchases)if(p.supplierId)add(suppliers,p.supplierId,Number(p.due||0));
 for(const t of s.treasury){if(t.clientId&&t.type==='collection'&&t.kind!=='deposit'&&!/^عربون أمر شغل #/.test(t.desc||''))add(clients,t.clientId,-Number(t.inAmount||0));if(t.supplierId&&t.type==='supplier_payment'&&t.kind!=='purchase_payment'&&!/^سداد نقدي لوارد/.test(t.desc||''))add(suppliers,t.supplierId,-Number(t.outAmount||0));}
 for(const a of s.adjustments||[])add(a.party==='client'?clients:suppliers,a.partyId,Number(a.debit||0)-Number(a.credit||0));
 for(const a of s.services||[])if(a.partyType==='client'||a.partyType==='supplier')add(a.partyType==='client'?clients:suppliers,a.partyId,((a.partyType==='client')===(a.kind==='provided')?1:-1)*(Number(a.amount||0)-Number(a.paid||0)));
 for(const [k,v] of clients)clients.set(k,money(v));for(const [k,v] of suppliers)suppliers.set(k,money(v));return {clients,suppliers};
}
function plan(s,selection,now=new Date().toISOString()){
 const next=JSON.parse(JSON.stringify(s)), ids={};for(const k of collections)ids[k]=new Set(selection[k]||[]);
 // A selected dependent payment may only be removed with its source document.
 for(const t of s.treasury)if(ids.treasury.has(t.id)&&((t.orderId&&!ids.orders.has(t.orderId))||(t.purchaseId&&!ids.purchases.has(t.purchaseId))||(t.serviceId&&!ids.services.has(t.serviceId))||t.kind==='cleanup_opening'))throw Error('السند مرتبط بمستند باقٍ. اختر المستند من فواتير المبيعات أو الوارد أو الخدمات');
 const oldNumbers=new Set(s.orders.filter(o=>ids.orders.has(o.id)).map(o=>String(o.orderNo)));
 for(const t of s.treasury){const legacy=(t.desc||'').match(/^عربون أمر شغل #(\S+) /), legacyDeposit=legacy&&oldNumbers.has(legacy[1]);if(ids.orders.has(t.orderId)||ids.purchases.has(t.purchaseId)||ids.services.has(t.serviceId)||legacyDeposit)ids.treasury.add(t.id)}
 const original=balances(s),cb=original.clients,sb=original.suppliers,oldCash=cash(s),counts={};
 for(const k of collections){const all=next[k]||[];next[k]=all.filter(x=>!ids[k].has(x.id));counts[k]=all.length-next[k].length}
 if(!Object.values(counts).some(Boolean))throw Error('لم يتم اختيار بيانات للحذف');
 const after=balances(next);
 for(const c of next.clients)c.initialBalance=money(Number(c.initialBalance||0)+cb.get(c.id)-after.clients.get(c.id));
 for(const c of next.suppliers)c.balance=money(Number(c.balance||0)+sb.get(c.id)-after.suppliers.get(c.id));
 const delta=money(oldCash-cash(next));
 if(delta)next.treasury.push({id:'archive_cash_'+now.replace(/[^0-9]/g,''),date:now.slice(0,10)+' '+now.slice(11,16),type:'opening_balance',kind:'cleanup_opening',desc:'رصيد خزينة مرحّل من تنظيف السجلات القديمة',inAmount:Math.max(0,delta),outAmount:Math.max(0,-delta),user:'النظام'});
 // Keep converted quotes converted; reference number still records their origin.
 for(const q of next.quotes||[])if(ids.orders.has(q.convertedId)){q.archivedInvoice=true;delete q.convertedId}
 (next.cleanupHistory||=[]).push({at:now,counts,cashBefore:oldCash,cashAfter:cash(next)});next.cleanupHistory=next.cleanupHistory.slice(-100);
 const verified=balances(next);
 for(const c of next.clients)if(verified.clients.get(c.id)!==cb.get(c.id))throw Error('فشل مطابقة حساب العميل');
 for(const c of next.suppliers)if(verified.suppliers.get(c.id)!==sb.get(c.id))throw Error('فشل مطابقة حساب المورد');
 if(cash(next)!==oldCash)throw Error('فشل مطابقة الخزينة');
 return {state:next,counts,removed:Object.values(counts).reduce((a,b)=>a+b,0),beforeBytes:JSON.stringify(s).length,afterBytes:JSON.stringify(next).length};
}
const api={plan,candidates,clientBalance,supplierBalance,cash};if(typeof module==='object'&&module.exports)module.exports=api;else root.HistoryCleanup=api;
})(typeof window==='undefined'?globalThis:window);
