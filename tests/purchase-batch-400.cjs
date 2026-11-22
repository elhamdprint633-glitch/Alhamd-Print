const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { plan, apply } = require('../app/purchase-batch-400.js');
const state = () => ({
  suppliers:[{id:'s1',name:'مورد 1'}],
  items:[{id:'a',name:'ورق',qty:10,avgCost166:8,buyPrice:9,unit:'فرخ'}, {id:'b',name:'فلكس',qty:3,avgCost166:10,buyPrice:10,unit:'متر'}],
  purchases:[{id:'PUR-1010',qty:1}],treasury:[{id:'t_1000_0',type:'expense',inAmount:0,outAmount:1}]
});
const req = (overrides={}) => ({supplierId:'s1', lines:[{itemId:'a',qty:2.125,unitPrice:12.50},{itemId:'b',qty:3,unitPrice:20}],paid:60,date:'2026-11-06',method:'نقدي',user:'Admin',now:1000,...overrides});
test('a single multi-item batch plans stock, supplier dues, payments without mutating records before commit',()=>{
 const s=state(), original=JSON.stringify(s);const p=plan(s,req());
 assert.equal(JSON.stringify(s),original);assert.equal(p.groupId,'IN-1011');
 assert.equal(p.purchases.length,2);assert.equal(p.purchases[0].receiptBatch400,p.groupId);
 assert.equal(p.purchases[1].receiptBatch400,p.groupId);assert.notEqual(p.purchases[0].id,p.purchases[1].id);
 assert.equal(p.total,86.56);assert.equal(p.paid,60);assert.equal(p.due,26.56);
 assert.deepEqual(p.purchases.map(x=>x.paid),[26.56,33.44]);
 assert.deepEqual(p.purchases.map(x=>x.due),[0,26.56]);
 assert.equal(p.treasury.length,2);assert.equal(p.treasury.reduce((x,t)=>x+t.outAmount,0),60);
 assert.ok(p.treasury.every(t=>t.purchaseId && t.purchaseId.startsWith('PUR-')));
 apply(s,p);assert.equal(s.purchases.length,3);assert.equal(s.treasury.length,3);
 assert.equal(s.items[0].qty,12.125);assert.equal(s.items[1].qty,6);
 assert.equal(s.items[0].avgCost166,8.7887);assert.equal(s.items[1].avgCost166,15);
});
test('multiple lines for same material add correctly with moving weighted average and distinct line IDs',()=>{
 const s=state();const p=plan(s,req({paid:'0',lines:[{itemId:'a',qty:'1.0001',unitPrice:'10.00'},{itemId:'a',qty:'2',unitPrice:'20.00'}]}));
 assert.equal(p.purchases.length,2);assert.equal(p.stock.length,1);
 assert.equal(p.stock[0].qty,13.0001);assert.equal(p.treasury.length,0);
 assert.equal(p.purchases[0].due,p.purchases[0].total);
});
test('invalid price, quantity, supplier, paid or references reject entire plan without mutation',()=>{
 const options = [
  {lines:[{itemId:'missing',qty:1,unitPrice:1}]},
  {lines:[{itemId:'a',qty:0,unitPrice:1}]},
  {lines:[{itemId:'a',qty:1.00001,unitPrice:1}]},
  {lines:[{itemId:'a',qty:'Infinity',unitPrice:1}]},
  {lines:[{itemId:'a',qty:1,unitPrice:-1}]},
  {lines:[{itemId:'a',qty:1,unitPrice:1.0001}]},
  {lines:[{itemId:'a',qty:1,unitPrice:'NaN'}]},
  {lines:[]}, {supplierId:'no-such-supplier'}, {paid:-1}, {paid:'1000'}, {paid:'abc'},
  {lines:[{itemId:'a',qty:1,unitPrice:1},{itemId:'wrong',qty:1,unitPrice:1}]}
 ];
 const s=state(),serialized=JSON.stringify(s);
 for(const x of options){assert.throws(()=>plan(s,req(x)),undefined,JSON.stringify(x));assert.equal(JSON.stringify(s),serialized);}
});
test('purchase numbers and treasury IDs avoid collisions with existing records',()=>{
 const s=state();s.purchases.push({id:'PUR-1012'});
 const p=plan(s,req());assert.deepEqual(p.purchases.map(x=>x.id),['PUR-1013','PUR-1014']);
 assert.ok(!p.treasury.some(x=>x.id==='t_1000_0'));
});
test('v6.0.0 login hint is removed, invisible-edge resizing is wired, receipt cart and version align',()=>{
 const root=path.join(__dirname,'..');const html=fs.readFileSync(path.join(root,'app','index.html'),'utf8');
 const edge=fs.readFileSync(path.join(root,'app','sidebar-edge-400.js'),'utf8');
 const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
 assert.ok(!html.includes('(الافتراضي: 1234 — أرقام فقط)'));
 assert.match(html,/purchase-batch-400\.js/);assert.match(html,/sidebar-edge-400\.js/);
 assert.match(edge,/Math\.abs\(e\.clientX - r\.left\) <= 7/);
 assert.match(edge,/sb-collapsed/);assert.doesNotMatch(edge,/createElement\(['"]div['"]\).*rail/);
 assert.equal(pkg.version,'7.0.2');assert.equal(pkg.build.nsis.artifactName,'Alhamd-Print-Setup-7.0.2.exe');
});

test('real purchase form integration saves both materials in ONE transaction and rolls back failed storage', () => {
 const vm = require('node:vm');
 const html=fs.readFileSync(path.join(__dirname,'../app/index.html'),'utf8');
 const start=html.indexOf('        function handleSavePurchase(e) {');
 const end=html.indexOf('        function autoFillItemBuyPrice()',start);
 assert.ok(start>0&&end>start);
 const source=html.slice(start,end);
 function run(failStorage,invalid=false) {
  const elements={
   purchaseSupplierSelect:{value:'s1'}, purchasePaid:{value:'60'},
   purchaseItemSelect:{value:invalid?'missing':''}, purchaseQty:{value:invalid?'2':''},
   purchaseUnitPrice:{value:invalid?'10':''}, purchaseBatchSave400:{disabled:false},
   purchasePaymentMethod147:{value:'نقدي'}
  };
  const status={saves:0,closes:0,toasts:[]};
  const context={
    appState:state(),EDIT:{purchase:null},
    window:{__purchaseCart164:[{itemId:'a',qty:2.125,unitPrice:12.5},{itemId:'b',qty:3,unitPrice:20}],PurchaseBatch400:require('../app/purchase-batch-400.js')},
    document:{getElementById:id=>elements[id]||null},
    gid:id=>elements[id]||null,
    r2:x=>Math.round(Number(x)*100)/100,
    can:()=>true,permDeny:()=>{},getCurrentUser:()=>({name:'مدير'}),
    todayStr:()=> '2026-11-06',formatCurrency:v=>Number(v).toFixed(2),
    closeModal:()=>{status.closes++;},showToast:(msg,type)=>status.toasts.push({msg,type}),
    ledgerIndex:null,
    saveState:()=>{status.saves++;if(failStorage)throw new Error('حفظ مرفوض');},
    console,Date,JSON,Number,String,Math
  };
  vm.createContext(context);vm.runInContext(source,context);
  const before=JSON.stringify(context.appState);
  vm.runInContext('handleSavePurchase({preventDefault(){}})',context);
  return {context,before,status};
 }
 const ok=run(false);assert.equal(ok.status.saves,1);assert.equal(ok.status.closes,1);
 assert.equal(ok.context.appState.purchases.length,3);
 assert.equal(ok.context.appState.items[0].qty,12.125);
 assert.equal(ok.context.appState.items[1].qty,6);
 assert.equal(ok.context.appState.treasury.length,3);
 const fail=run(true);assert.equal(fail.status.saves,1);assert.equal(fail.status.closes,0);
 assert.equal(JSON.stringify(fail.context.appState),fail.before);
 assert.ok(fail.status.toasts.some(x=>x.type==='danger'));
 const invalidPending=run(false,true);assert.equal(invalidPending.status.saves,0);
 assert.equal(JSON.stringify(invalidPending.context.appState),invalidPending.before);
});

test('batch posted records satisfy trusted accounting integrity and restricted storekeeper permissions',()=>{
 const Integrity=require('../app/financial-integrity-166.cjs');
 const Perms=require('../app/server-permissions-166.cjs');
 const s=state();s.users=[{id:'admin',role:'admin'}];s.currentUser='admin';
 const prior=JSON.parse(JSON.stringify(s));
 const prepared=plan(s,req());apply(s,prepared);
 assert.equal(Integrity.validate(s),true);
 const storekeeper={role:'storekeeper',perms:{pur_add:true,stock_edit:false,tre_add:false}};
 assert.equal(Perms.assertChanges(prior,s,storekeeper),true);
});
