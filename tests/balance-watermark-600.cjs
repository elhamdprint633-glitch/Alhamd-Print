'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const B=require('../app/balance-preview-600.js'),P=require('../app/party-ledger-411.js'),D=require('../app/document-design-408.js');
test('live preview adds the net invoice and subtracts current cash without changing inputs',()=>{
 const args={balance:470,total:300,paid:200},before=JSON.stringify(args);assert.deepEqual(B.calculate(args),{previous:470,forecast:570});assert.equal(JSON.stringify(args),before);
 assert.equal(B.calculate({...args,paid:500}).forecast,270);assert.equal(B.calculate({...args,paid:900}).forecast,-130);
 assert.equal(B.calculate({balance:.1,total:.2,paid:.1}).forecast,.2);assert.throws(()=>B.calculate({balance:NaN}));
});
test('linked supplier/customer offset is used exactly once and forecasts preserve credit signs',()=>{
 const s={clients:[{id:'c',initialBalance:300,supplierId411:'s'}],suppliers:[{id:'s',balance:500,clientId411:'c'}],orders:[],purchases:[],treasury:[],services:[]},before=JSON.stringify(s),net=P.balances(s);
 assert.equal(B.calculate({balance:net.clients.get('c'),total:300,paid:50}).forecast,50);
 assert.equal(B.calculate({balance:net.suppliers.get('s'),total:300,paid:100}).forecast,400);
 assert.equal(B.direction('client',-200),'له عندنا');assert.equal(B.direction('client',50),'عليه لنا');assert.equal(B.direction('supplier',400),'له عندنا');assert.equal(B.direction('supplier',-1),'عليه لنا');assert.equal(B.direction('client',0),'الحساب خالص');assert.equal(JSON.stringify(s),before);
});
test('editing replaces the saved invoice contribution and keeps later payments in the balance',()=>{
 assert.equal(B.calculate({balance:720,total:600,paid:200,previousDue:300}).forecast,820);
 assert.equal(B.calculate({balance:720,total:500,paid:200,previousDue:300}).forecast,720);
 assert.equal(B.calculate({balance:500,total:400,paid:100,previousDue:200}).forecast,600);
});
const record={no:'INV-1',party:'عميل',lines:[{desc:'طباعة',qty:2,price:50,amount:100}],gross:100,total:100,paid:30,remaining:70};
const context=wm=>({cfg:{wm,fillMode409:'full'},logo:'assets/icon.png',money:v=>Number(v).toFixed(2)});
test('image and text watermark controls apply angle, size, opacity and text color, including zero',()=>{
 let h=D.invoice(record,context({type:'text',text:'اختبار',rotate:25,size:150,opacity:20,color:'#123456'}));assert(h.includes('rotate(25deg)'));assert(h.includes('font-size:135px'));assert(h.includes('opacity:0.2'));assert(h.includes('color:#123456'));
 h=D.invoice(record,context({type:'logo',rotate:0,size:200,opacity:0}));assert(h.includes('rotate(0deg)'));assert(h.includes('width:480px'));assert(h.includes('opacity:0;'));
 h=D.invoice(record,context({type:'image',imageData:'data:image/png;base64,AAAA',rotate:-40,size:100,opacity:12}));assert(h.includes('data:image/png;base64,AAAA'));assert(h.includes('rotate(-40deg)'));
 assert(!D.invoice(record,context({type:'none'})).includes('class="d600-watermark-layer"'));
});
test('standard renderer ignores withdrawn templates and retains financial values and watermark overlay',()=>{
 const c=context({type:'text',text:'<script>bad</script>',rotate:10,size:100,opacity:10});c.cfg.designer412={activeId:'old',templates:[{id:'old',name:'withdrawn'}]};c.cfg.watermarkLayer409='behind';const before=JSON.stringify({record,c});const h=D.invoice(record,c);
 assert(!h.includes('designer412'));assert(!h.includes('<script>'));assert(h.includes('&lt;script&gt;'));assert(h.includes('watermark409-above'));assert(h.includes('.d600-watermark-layer{position:absolute;inset:0;z-index:20;pointer-events:none;overflow:hidden}'));
 for(const v of ['100.00','30.00','70.00'])assert(h.includes(v));assert.equal((h.match(/data-sec="summary"/g)||[]).length,1);assert.equal(JSON.stringify({record,c}),before);
});
test('invoice and account statement use the same watermark settings and native columns',()=>{
 const c=context({type:'logo',rotate:-15,size:50,opacity:8});c.cfg.cols={notes:false};c.cfg.columnOrder408=['amount','desc','price'];const invoice=D.invoice(record,c),statement=D.statement({...record,open:10,debit:100,credit:30,close:80,entries:[{src:'a',label:'فاتورة',ref:'INV-1',date:'2026-11-13',debit:100,credit:0,expanded:true,document:record}]},c);
 for(const h of [invoice,statement]){assert(h.includes('rotate(-15deg)'));assert(h.includes('width:120px'));assert(h.includes('opacity:0.08'));assert(!h.includes('data-col="notes"'));assert.equal((h.match(/data-sec="summary"/g)||[]).length,1);}
});
test('release 6 preserves application identity and dependency versions match their pinned archives',()=>{
 const pkg=require('../package.json'),lock=require('../package-lock.json');assert.equal(pkg.version,'7.0.2');assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);assert.equal(pkg.build.appId,'eg.alhamd.print.desktop');assert.equal(pkg.build.nsis.deleteAppDataOnUninstall,false);
 for(const [name,p]of Object.entries(lock.packages)){if(!p.resolved?.startsWith('https://registry.npmjs.org/')||!p.version)continue;const base=name.split('node_modules/').at(-1).split('/').at(-1),file=new URL(p.resolved).pathname.split('/').at(-1);if(file.startsWith(base+'-'))assert.equal(p.version,file.slice(base.length+1,-4),name);}
});
