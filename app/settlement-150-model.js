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
