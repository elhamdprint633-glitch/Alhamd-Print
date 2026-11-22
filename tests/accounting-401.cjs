'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const Math401=require('../app/accounting-math-401.js'),Services=require('../app/service-payments-401.js'),Finance=require('../app/financial-integrity-166.cjs'),Perms=require('../app/server-permissions-166.cjs'),Batch=require('../app/purchase-batch-400.js'),{Store}=require('../app/store.cjs');
const base=()=>({users:[{id:'u',role:'admin'}],currentUser:'u',clients:[{id:'c',initialBalance:0}],suppliers:[{id:'s',balance:0}],items:[{id:'i',name:'ورق',qty:20,buyPrice:20,avgCost166:15}],orders:[],purchases:[],treasury:[],services:[]});
const clone=x=>JSON.parse(JSON.stringify(x));
test('decimal half-cents and signed rounding agree with exact decimal arithmetic',()=>{
 for(const [v,expected]of [[1.005,1.01],[2.675,2.68],[-1.005,-1.01],['1.005e2',100.5],['0.005',.01]])assert.equal(Math401.round(v),expected);
 assert.equal(Math401.lineTotal(.3,3.35),1.01);assert.equal(Math401.lineTotal(.0001,100),.01);
 for(let q=1;q<=100;q++)for(let p=1;p<=100;p++)assert.equal(Math401.lineTotal(q/100,p/100),Math.floor((q*p+50)/100)/100);
});
test('purchase half-cent is posted identically to supplier due, cash and persistence validator',()=>{
 const s=base(),p=Batch.plan(s,{supplierId:'s',lines:[{itemId:'i',qty:.3,unitPrice:3.35}],paid:1.01,date:'2026-11-07'});
 Batch.apply(s,p);assert.equal(p.total,1.01);assert.equal(p.due,0);assert.equal(s.treasury[0].outAmount,1.01);assert.equal(Finance.validate(s),true);
});
test('invalid calendar date rejects entire purchase before stock is changed',()=>{
 const s=base(),before=clone(s);assert.throws(()=>Batch.plan(s,{supplierId:'s',lines:[{itemId:'i',qty:1,unitPrice:1}],paid:0,date:'2026-02-30'}));assert.deepEqual(s,before);
});
test('reversing consumed purchases cannot conceal negative inventory values or zero quantity with residual value',()=>{
 assert.throws(()=>Math401.reversePurchase({qty:12,avgCost166:15},{qty:10,unitPrice:20}));
 assert.throws(()=>Math401.reversePurchase({qty:10,avgCost166:15},{qty:10,unitPrice:20}));
 assert.deepEqual(Math401.reversePurchase({qty:20,avgCost166:15},{qty:10,unitPrice:20}),{qty:10,average:10});
});
test('invoice cancellation restores historical material cost to current weighted valuation',()=>{
 assert.equal(Math401.returnedAverage({qty:8,avgCost166:20},2,10),18);
 const value=8*20+2*10;assert.equal(10*Math401.returnedAverage({qty:8,avgCost166:20},2,10),value);
});
test('invoice edits preserve cost of retained materials and cost only additional units at the current average',()=>{
 const current={qty:8,avgCost166:20};
 const restored={qty:10,avgCost166:Math401.returnedAverage(current,2,10)};
 assert.equal(Math401.replacementCost(2,2,10,20),10);
 assert.equal(Math401.consumedAverage(restored,2,10),20);
 assert.equal(Math401.replacementCost(4,2,10,20),15);
 assert.equal(Math401.consumedAverage(restored,4,15),20);
 assert.equal(Math401.replacementCost(1,2,10,20),10);
 assert.equal(Math401.consumedAverage(restored,1,10),18.8889);
});
test('fractional waste preserves four decimal quantities and original average cost',()=>{
 const model=require('../app/operations-149-model.js');assert.equal(model.quantity(2.1234-.0001),2.1233);
 const profit=model.profit({costs149:[],waste149:[{orderId:'o',qty:.1234,unitCost:15,chargedTo:'shop'}]},{id:'o',total:10,costSnapshot149:[]});assert.equal(profit.waste,1.85);
});
test('later service installments retain original dates, amounts and cash direction',()=>{
 const s=base(),service={id:'v',date:'2026-11-01',kind:'received',partyType:'supplier',partyId:'s',amount:100,paid:30,inTreasury:true};s.services.push(service);
 Services.reconcile(s,service,{date:'2026-11-01 09:00',id:'r1'});service.paid=50;Services.reconcile(s,service,{date:'2026-11-07 10:00',id:'r2'});
 assert.deepEqual(s.treasury.map(t=>[t.date,t.outAmount,t.inAmount]),[['2026-11-01',30,0],['2026-11-07 10:00',20,0]]);
 assert.equal(Finance.validate(s),true);assert.equal(Services.reconcile(s,service),null);
 const before=clone(s);assert.throws(()=>Services.reconcile(s,{...service,paid:20}));assert.deepEqual(s,before);
});
test('cash links reject fabricated deposits, missing service, wrong supplier and reversed directions',()=>{
 const s=base();s.orders.push({id:'o',clientId:'c',total:10,paid:5});s.purchases.push({id:'p',supplierId:'s',itemId:'i',qty:1,unitPrice:10,total:10,paid:5,due:5});
 for(const t of [
  {id:'t',kind:'deposit',orderId:'o',type:'collection',inAmount:9,outAmount:0},
  {id:'t',kind:'deposit',type:'collection',inAmount:5,outAmount:0},
  {id:'t',serviceId:'missing',inAmount:1,outAmount:0},
  {id:'t',type:'expense',inAmount:1,outAmount:0},
  {id:'t',type:'supplier_payment',kind:'purchase_payment',purchaseId:'p',inAmount:0,outAmount:4},
  {id:'t',type:'collection',inAmount:0,outAmount:0}
 ]){const next=clone(s);next.treasury=[t];assert.throws(()=>Finance.validate(next));}
});
test('itemized invoice and purchase totals cannot differ by a cent from source math',()=>{
 const s=base();s.orders=[{id:'o',clientId:'c',total:9,paid:0,subtotal:10,discount:1,invDiscount:1,lines:[{qty:1,price:10,amount:10}]}];assert.equal(Finance.validate(s),true);
 for(const change of [o=>o.total=9.01,o=>o.lines[0].amount=9.99,o=>o.subtotal=11,o=>o.invDiscount=.99]){const next=clone(s);change(next.orders[0]);assert.throws(()=>Finance.validate(next));}
 const p=base();p.purchases=[{id:'p',qty:1,unitPrice:10,total:10.01,paid:0,due:10.01}];assert.throws(()=>Finance.validate(p));
});
test('bad scalar types, duplicate IDs, malformed collections and opening balances fail closed',()=>{
 for(const change of [s=>s.clients[0].initialBalance='NaN',s=>s.suppliers[0].balance=true,s=>s.orders={},s=>s.items.push({...s.items[0]}),s=>s.orders.push({id:'o',total:.001}),s=>s.items[0].qty=[]]){const s=base();change(s);assert.throws(()=>Finance.validate(s));}
 const s=base();s.clients[0].initialBalance=-20;assert.equal(Finance.validate(s),true);
});
test('service payment permission allows a linked installment without granting service edit or general treasury creation',()=>{
 const before=base();before.services=[{id:'v',kind:'provided',partyType:'client',partyId:'c',date:'2026-11-01',amount:100,paid:0,inTreasury:true}];
 const next=clone(before);next.services[0].paid=10;Services.reconcile(next,next.services[0],{date:'2026-11-07',id:'t'});
 const user={role:'staff',perms:{svc_pay:true,svc_edit:false,tre_add:false}};assert.equal(Perms.assertChanges(before,next,user),true);
 next.services[0].amount=110;assert.throws(()=>Perms.assertChanges(before,next,user));
});
test('invoice permission requires actual stock movement and rejects hidden stock valuation changes',()=>{
 const before=base(),user={role:'staff',perms:{inv_create:true,stock_edit:false,stock_adjust:false}};
 const next=clone(before);next.orders=[{id:'o',total:20,paid:0,stockUsed:[{itemId:'i',qty:2}],costSnapshot149:[{itemId:'i',qty:2,unitCost:15}]}];assert.throws(()=>Perms.assertChanges(before,next,user));
 next.items[0].qty=18;assert.equal(Perms.assertChanges(before,next,user),true);
 next.items[0].avgCost166=100;assert.throws(()=>Perms.assertChanges(before,next,user));
});
test('purchase permission cannot be used to fabricate average costs or catalogue purchase prices',()=>{
 const before=base(),next=clone(before),user={role:'storekeeper',perms:{pur_add:true,stock_edit:false,tre_add:false}};
 Batch.apply(next,Batch.plan(next,{supplierId:'s',lines:[{itemId:'i',qty:10,unitPrice:30}],paid:0,date:'2026-11-07'}));
 assert.equal(Perms.assertChanges(before,next,user),true);
 const cheating=clone(next);cheating.items[0].avgCost166=90;assert.throws(()=>Perms.assertChanges(before,cheating,user));
 const price=clone(next);price.items[0].buyPrice=100;assert.throws(()=>Perms.assertChanges(before,price,user));
});
test('edits and deletions survive renderer audit replacement, while derived settlement refreshes produce no financial edit',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'alh-401-')),store=new Store(path.join(dir,'test.sqlite'));
 try{const s=base();s.orders=[{id:'o',total:10,paid:0}];store.save(JSON.stringify(s));s.orders[0].total=20;store.save(JSON.stringify(s),store.revision,{auditDeletion:true});let saved=JSON.parse(store.load());assert.equal(saved.auditTrail166[0].action,'edit');assert.equal(saved.auditTrail166[0].before.total,10);saved.auditTrail166=[];saved.orders[0].remaining=20;store.save(JSON.stringify(saved),store.revision,{auditDeletion:true});saved=JSON.parse(store.load());assert.equal(saved.auditTrail166.length,1);saved.orders=[];saved.auditTrail166=[];store.save(JSON.stringify(saved),store.revision,{auditDeletion:true});assert.deepEqual(JSON.parse(store.load()).auditTrail166.map(x=>x.action),['edit','delete']);}
 finally{store.close();fs.rmSync(dir,{recursive:true,force:true});}
});
test('stale independent SQLite writer cannot delete another connection changes by omitting revision',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'alh-stale-')),file=path.join(dir,'test.sqlite'),one=new Store(file),s=base();one.save(JSON.stringify(s));const two=new Store(file);
 try{const stale=JSON.parse(two.load());s.clients.push({id:'new'});one.save(JSON.stringify(s));assert.throws(()=>two.save(JSON.stringify(stale)),e=>e.code==='SYNC_CONFLICT');two.load();assert.equal(JSON.parse(two.load()).clients.length,2);}
 finally{one.close();two.close();fs.rmSync(dir,{recursive:true,force:true});}
});
test('malformed database never opens as an empty replacement',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'alh-bad-')),file=path.join(dir,'test.sqlite');fs.writeFileSync(file,'not a sqlite database');
 try{assert.throws(()=>new Store(file));assert.equal(fs.readFileSync(file,'utf8'),'not a sqlite database');}finally{fs.rmSync(dir,{recursive:true,force:true});}
});
