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
