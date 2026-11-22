'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto');
const {Store}=require('../app/store.cjs'),{install}=require('../app/operations-native-149.cjs'),Crypt=require('../app/backup-crypto-166.cjs');
const key=crypto.createHash('sha256').update('tests-device-key').digest();
const config=(dir,store,pick)=>{
 const handlers={};
 const api=install({ipcMain:{handle:(k,v)=>handlers[k]=v},dialog:{showOpenDialog:async()=>({canceled:false,filePaths:pick.files})},shell:{showItemInFolder(){},openPath:async()=>''},allowed(){},store,dataDir:dir,getWin:()=>null,backupDir:()=>path.join(dir,'backups'),snapshot(){},getDeviceBackupKey:()=>key,isSessionAuthenticated:()=>true});
 return {handlers,api};
};
test('encrypted full backups validate committed data in isolated SQLite, do not expose plaintext',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'alhamd149-test-')),store=new Store(path.join(dir,'data.sqlite'));
 try{
  const state={users:[{id:'admin',role:'admin'}],currentUser:'admin',orders:[],items:[],treasury:[],isLocked:false};
  store.save(JSON.stringify(state));const {api}=config(dir,store,{files:[]}),before=store.load(),r=api.full();
  assert.equal(r.ok,true);assert.equal(store.load(),before);
  assert.equal(fs.existsSync(path.join(r.path,'state.json')),false);
  const packed=fs.readFileSync(r.stateFile);assert.doesNotMatch(packed.toString(),/"currentUser"\s*:\s*"admin"/);
  assert.equal(api.test(Crypt.decrypt(packed,{deviceKey:key}).toString(),path.join(r.path,'attachments')).orders,0);
  assert.throws(()=>Crypt.decrypt(packed,{deviceKey:crypto.randomBytes(32)}));
  assert.throws(()=>api.test('{"users":[]}'));assert.equal(store.load(),before);
 }finally{store.close();fs.rmSync(dir,{recursive:true,force:true});}
});
test('encrypted attachment full backup detects tampering and restores correct bytes',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'alhamd149-files-')),store=new Store(path.join(dir,'data.sqlite'));
 try{
  const pick={files:[]},source=path.join(dir,'approved.pdf');fs.writeFileSync(source,'%PDF-1.4\napproved');
  const s={users:[{id:'admin',role:'admin'}],currentUser:'admin',orders:[{id:'o',total:10,paid:0}],items:[],treasury:[],isLocked:false};store.save(JSON.stringify(s));
  const {api,handlers}=config(dir,store,pick);pick.files=[source];
  const records=await handlers['ops-attachments-add149']({},'o');assert.equal(records.length,1);
  s.orders[0].attachments149=records;store.save(JSON.stringify(s));
  const original=store.load(),full=api.full(),f=path.join(full.path,'attachments',records[0].file+'.alhbak'),stateFile=full.stateFile;
  assert.deepEqual(Crypt.decrypt(fs.readFileSync(f),{deviceKey:key}),fs.readFileSync(source));
  const valid=fs.readFileSync(f),tampered=Buffer.from(valid);tampered[tampered.length-17]^=1;fs.writeFileSync(f,tampered);
  assert.throws(()=>Crypt.decrypt(fs.readFileSync(f),{deviceKey:key}));assert.equal(store.load(),original);
  fs.writeFileSync(f,valid);
  s.orders[0].total=20;store.save(JSON.stringify(s));pick.files=[stateFile];
  const r=await handlers['ops-backup-restore149']({});assert.equal(r.ok,true);
  assert.equal(JSON.parse(store.load()).orders[0].total,10);
  assert.deepEqual(fs.readFileSync(path.join(dir,'OrderAttachments',records[0].file)),fs.readFileSync(source));
 }finally{store.close();fs.rmSync(dir,{recursive:true,force:true});}
});
test('older clients cannot erase modern invoice metadata while a supported edit can clear structured specs',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'alhamd149-guard-')),store=new Store(path.join(dir,'data.sqlite'));
 try{const s={users:[{id:'admin',role:'admin'}],orders:[{id:'o',total:10,paid:0,ops149:{stage:'الطباعة'},costSnapshot149:[],paymentParts149:[],lines:[{desc:'a',qty:1,spec149:{color:'blue'}}]}],items:[],treasury:[]};store.save(JSON.stringify(s));const old=JSON.parse(JSON.stringify(s));delete old.orders[0].ops149;assert.throws(()=>store.save(JSON.stringify(old)));const supported=JSON.parse(JSON.stringify(s));supported.orders[0].lines[0].spec149={};store.save(JSON.stringify(supported));assert.deepEqual(JSON.parse(store.load()).orders[0].lines[0].spec149,{});}finally{store.close();fs.rmSync(dir,{recursive:true,force:true});}
});
test('portable backup verifies and restores with the supplied passphrase; wrong passphrase preserves database',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'alhamd-portable-401-')),store=new Store(path.join(dir,'data.sqlite'));
 try{
  const pick={files:[]},s={users:[{id:'admin',role:'admin'}],currentUser:'admin',orders:[{id:'o',total:10,paid:0}],items:[],treasury:[],isLocked:false};store.save(JSON.stringify(s));
  const {api,handlers}=config(dir,store,pick),passphrase='portable-restore-401-password';
  const backup=api.full('portable',passphrase);pick.files=[backup.stateFile];
  assert.equal((await handlers['ops-backup-verify149']({},passphrase)).orders,1);
  const original=store.load();await assert.rejects(()=>handlers['ops-backup-restore149']({},'wrong-password-401'));assert.equal(store.load(),original);
  s.orders[0].total=20;store.save(JSON.stringify(s));assert.equal((await handlers['ops-backup-restore149']({},passphrase)).ok,true);
  assert.equal(JSON.parse(store.load()).orders[0].total,10);
 }finally{store.close();fs.rmSync(dir,{recursive:true,force:true});}
});
