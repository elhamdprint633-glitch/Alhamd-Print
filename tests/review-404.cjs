'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const Batch=require('../app/purchase-batch-400.js'),{projectViewer}=require('../app/viewer-projection-403.cjs'),Integrity=require('../app/financial-integrity-166.cjs');
const cents=n=>Math.round(n*100);
test('120-line randomized incoming receipts conserve stock quantity, cash and supplier liability without double-posting cash payments',()=>{
 const s={users:[{id:'admin',role:'admin'}],currentUser:'admin',suppliers:[{id:'s',name:'المورد',balance:5}],items:[{id:'a',name:'ورق',qty:10,avgCost166:8,buyPrice:8},{id:'b',name:'حبر',qty:10,avgCost166:8,buyPrice:8}],purchases:[],treasury:[],orders:[],clients:[]};
 let seed=404,paid=0,due=500,qty={a:100000,b:100000};const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed;};
 for(let batch=0;batch<40;batch++){
  const lines=Array.from({length:3},()=>({itemId:rnd()%2?'a':'b',qty:((rnd()%100000)+1)/10000,unitPrice:(rnd()%10000)/100}));
  // Independent integer reference for quantity (4dp) x price (cents), half away from zero.
  const totals=lines.map(l=>Number((BigInt(Math.round(l.qty*10000))*BigInt(Math.round(l.unitPrice*100))+5000n)/10000n));
  const pay=Math.floor(totals.reduce((a,b)=>a+b,0)/2),before=JSON.stringify(s);
  const p=Batch.plan(s,{supplierId:'s',lines,paid:pay/100,date:'2026-11-07',now:batch});assert.equal(JSON.stringify(s),before);
  assert.deepEqual(p.purchases.map(p=>cents(p.total)),totals);Batch.apply(s,p);paid+=pay;due+=totals.reduce((a,b)=>a+b,0)-pay;
  for(const l of lines)qty[l.itemId]+=Math.round(l.qty*10000);
  const view=projectViewer(s,batch);assert.equal(cents(view.suppliers[0].currentBalance),due);assert.equal(cents(view.summary.treasuryBalance),-paid);
  for(const item of s.items)assert.equal(Math.round(item.qty*10000),qty[item.id]);assert.equal(Integrity.validate(s),true);
 }
 assert.equal(s.purchases.length,120);assert.equal(new Set(s.purchases.map(p=>p.id)).size,120);
 const before=JSON.stringify(s);assert.throws(()=>Batch.plan(s,{supplierId:'s',lines:[{itemId:'a',qty:2,unitPrice:3},{itemId:'missing',qty:1,unitPrice:4}],paid:0,date:'2026-11-07'}));assert.equal(JSON.stringify(s),before);
});
test('full mobile view sends operational stage/assignee and whitelisted line specs without exposing arbitrary operations metadata',()=>{
 const p=projectViewer({orders:[{id:'o',total:0,paid:0,ops149:{stage:'الطباعة',assignee:'الفني',privateKey:'PRIVATE'},lines:[{qty:1,price:0,amount:0,spec149:{size:'A4',color:'أبيض',privateKey:'PRIVATE'}}]}]},1);
 assert.equal(p.orders[0].opsStage404,'الطباعة');assert.equal(p.orders[0].opsAssignee404,'الفني');assert.match(p.orders[0].lines[0].specText404,/A4/);assert.doesNotMatch(JSON.stringify(p),/PRIVATE/);
});
