'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {Store}=require('../app/store.cjs');
const {install}=require('../app/operations-native-149.cjs');
const app=path.join(__dirname,'..','app');
const read=name=>fs.readFileSync(path.join(app,name),'utf8');

test('invoice evidence picker validates image signature, stores outside SQLite and never deletes a referenced file',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'alhamd157-evidence-'));const store=new Store(path.join(dir,'data.sqlite'));
 try{
  const original=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),Buffer.alloc(32,7)]),source=path.join(dir,'evidence.png');fs.writeFileSync(source,original);
  const state={users:[{id:'admin',role:'admin'}],currentUser:'admin',isLocked:false,orders:[{id:'order-1',attachments149:[]}],items:[],treasury:[]};store.save(JSON.stringify(state));
  const handlers={};let chosen=[source],opened='';
  install({ipcMain:{handle:(key,fn)=>handlers[key]=fn},dialog:{showOpenDialog:async()=>({canceled:false,filePaths:chosen})},shell:{openPath:async p=>{opened=p;return'';},showItemInFolder(){}},allowed(){},store,dataDir:dir,getWin:()=>null,backupDir:()=>path.join(dir,'backups'),snapshot(){}});
  const files=await handlers['ops-evidence-pick157']({}, {editing:false});assert.equal(files.length,1);assert.equal(fs.existsSync(path.join(dir,'OrderAttachments',files[0].file)),true);assert.deepEqual(fs.readFileSync(path.join(dir,'OrderAttachments',files[0].file)),original);
  await handlers['ops-evidence-open157']({}, {file:files[0].file});assert.ok(opened.endsWith(files[0].file));
  state.orders[0].attachments149=files;store.save(JSON.stringify(state));
  const kept=await handlers['ops-evidence-prune157']({}, {files:[files[0].file]});assert.equal(kept.removed,0);assert.equal(fs.existsSync(path.join(dir,'OrderAttachments',files[0].file)),true);
  state.orders[0].attachments149=[];store.save(JSON.stringify(state));
  const removed=await handlers['ops-evidence-prune157']({}, {files:[files[0].file]});assert.equal(removed.removed,1);assert.equal(fs.existsSync(path.join(dir,'OrderAttachments',files[0].file)),false);
 }finally{store.close();fs.rmSync(dir,{recursive:true,force:true});}
});

test('invoice evidence rejects extension/signature mismatches and users without invoice permission',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'alhamd157-deny-'));const store=new Store(path.join(dir,'data.sqlite'));
 try{
  const png=path.join(dir,'wrong.jpg');fs.writeFileSync(png,Buffer.from([137,80,78,71,13,10,26,10,1,2,3]));
  const state={users:[{id:'cashier',role:'cashier',perms:{inv_create:false,inv_edit:false}}],currentUser:'cashier',isLocked:false,orders:[],items:[],treasury:[]};store.save(JSON.stringify(state));
  const handlers={};let calls=0;install({ipcMain:{handle:(key,fn)=>handlers[key]=fn},dialog:{showOpenDialog:async()=>{calls++;return{canceled:false,filePaths:[png]};}},shell:{openPath:async()=>''},allowed(){},store,dataDir:dir,getWin:()=>null,backupDir:()=>path.join(dir,'backups'),snapshot(){}});
  await assert.rejects(()=>handlers['ops-evidence-pick157']({}, {editing:false}),/صلاحية/);assert.equal(calls,0);
  state.users[0].perms.inv_create=true;store.save(JSON.stringify(state));
  await assert.rejects(()=>handlers['ops-evidence-pick157']({}, {editing:false}),/امتداد الصورة/);
 }finally{store.close();fs.rmSync(dir,{recursive:true,force:true});}
});

test('invoice composer exposes multi-image evidence and binds attachments before invoice persistence',()=>{
 const html=fs.readFileSync(path.join(app,'index.html'),'utf8'),js=read('professional-157.js'),native=read('operations-native-149.cjs'),preload=read('preload.cjs');
 assert.match(html,/id="saleEvidencePanel157"/);assert.match(html,/onclick="pickInvoiceEvidence157\(\)"/);
 assert.match(js,/order\.attachments149=clone\(evidence\)/);assert.match(js,/12 صورة/);
 assert.match(native,/ops-evidence-pick157/);assert.match(native,/ops-evidence-prune157/);assert.match(preload,/opsPickInvoiceEvidence157/);
});

test('quick filters cover customer debts, supplier balances, inventory categories and order states',()=>{
 const code=read('table-tools.js');
 for(const text of ['عملاء عليهم مديونية','مبالغ مستحقة للمورد','تصنيف: ','أقل من حد الطلب','فواتير عليها متبقي','حركات واردة'])assert.ok(code.includes(text),`missing quick-filter action ${text}`);
 assert.match(code,/tableQuickMatch\(key,row,view\.quick\)/);
});

test('safe column dragging is opt-in and explicitly rejects merged or inconsistent table cells',()=>{
 const code=read('table-layout-157.js');
 assert.match(code,/const SAFE_KEYS=new Set/);assert.match(code,/Number\(cell\.colSpan\|\|1\)!==1/);assert.match(code,/Number\(cell\.rowSpan\|\|1\)!==1/);assert.match(code,/toggleColumnReorder157/);assert.match(code,/tableColumnOrders157/);
});

test('guidance permission is an explicit opt-in for non-admin users and the settlement instruction is hidden by default',()=>{
 const html=fs.readFileSync(path.join(app,'index.html'),'utf8'),js=read('professional-157.js');
 assert.match(html,/\['guidance_view', 'العبارات الإرشادية/);assert.match(html,/if \(k === 'guidance_view'\) v = false/);assert.match(js,/#settlementInfo150/);assert.match(js,/can\('guidance_view'\)/);
});

test('money numeral setting refreshes visible UI independently of date settings, and login preview enforces contrast',()=>{
 const studio=read('studio-150.js'),login=read('workspace-148.js'),model=read('studio-150-model.js');
 assert.match(studio,/numerals150\|\|'latin'/);assert.match(studio,/window\.updateAllUI\?\./);assert.match(studio,/invoice-paper-bg/);assert.match(login,/const readable=/);assert.match(login,/contrast\(fg,bgColor\)>=4\.5/);assert.match(model,/numerals==='arabic'\?'ar-EG':'en-US'/);
});

test('release invoice settings include per-part colors, template replacement and show/hide controls',()=>{
 const html=fs.readFileSync(path.join(app,'index.html'),'utf8');
 for(const t of ['invoiceColorControls157','invoiceTemplateFile157','restoreInvoiceTemplate157','data-invoice-part="header"','data-invoice-part="client"','data-invoice-part="lines"','data-invoice-part="summary"'])assert.ok(html.includes(t));
});

test('removing saved invoice evidence defers physical deletion until invoice save succeeds',()=>{
 const js=read('professional-157.js');
 assert.match(js,/let evidence=\[\],removedEvidence=\[\]/);
 assert.match(js,/removedEvidence\.push\(removed\)/);
 assert.match(js,/const removed=removedEvidence\.slice\(\);const result=original\.apply\(this,args\);if\(result&&result\.id\).*safePrune\(removed\)/);
 assert.match(js,/const pending=\[\.\.\.evidence,\.\.\.removedEvidence\]/);
});

test('reordered table headers keep sorting bound to their original data column',()=>{
 const js=read('business-tools-134.js'),layout=read('table-layout-157.js');
 assert.match(layout,/c\.dataset\.originColumn157=String\(i\)/);
 assert.match(js,/th\.hasAttribute\('data-origin-column157'\)\?Number\(th\.dataset\.originColumn157\):displayedIndex/);
 assert.match(js,/const origin=th\.hasAttribute\('data-origin-column157'\)\?Number\(th\.dataset\.originColumn157\):i/);
});
