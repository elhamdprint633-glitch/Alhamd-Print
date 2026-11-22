'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto');
const Zip=require('../app/assets/vendor/jszip/jszip.min.js'),Archive=require('../app/backup-archive-402.cjs'),{Store}=require('../app/store.cjs'),{install}=require('../app/operations-native-149.cjs');
const passphrase='backup portable password 402';
function fixture(){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'alh-402-')),store=new Store(path.join(dir,'data.sqlite'));
 const state={users:[{id:'admin',role:'admin'}],currentUser:'admin',isLocked:false,orders:[{id:'o',total:100,paid:0}],items:[],treasury:[],clients:[],suppliers:[]};store.save(JSON.stringify(state));
 const chosen={save:path.join(dir,'copy.zip'),open:[],cancelSave:false,key:crypto.randomBytes(32)},handlers={},assets=path.join(dir,'UserAssets');fs.mkdirSync(assets);
 fs.writeFileSync(path.join(assets,'settings.json'),'ORIGINAL_ASSET');
 const api=install({ipcMain:{handle:(key,fn)=>handlers[key]=fn},dialog:{showSaveDialog:async()=>chosen.cancelSave?{canceled:true}:{canceled:false,filePath:chosen.save},showOpenDialog:async()=>({canceled:false,filePaths:chosen.open})},shell:{showItemInFolder(){if(chosen.throwReveal)throw Error('Explorer unavailable');},openPath:async()=>''},allowed(){},store,dataDir:dir,getWin:()=>null,backupDir:()=>path.join(dir,'backups'),snapshot(){},getResources:()=>({base:assets}),getDeviceBackupKey:()=>chosen.key,isSessionAuthenticated:()=>true});
 return {dir,store,state,chosen,handlers,api,assets,dispose(){store.close();fs.rmSync(dir,{recursive:true,force:true});}};
}
test('manual ZIP is one portable encrypted file, containing data, attachments and assets; restore survives device key replacement',async()=>{
 const f=fixture();try{
  const input=path.join(f.dir,'design.pdf');fs.writeFileSync(input,'%PDF-1.4 confidential design');f.chosen.open=[input];
  const records=await f.handlers['ops-attachments-add149']({},'o');
  f.state.orders[0].attachments149=records;f.store.save(JSON.stringify(f.state));
  const result=await f.handlers['backup-export-zip402']({},passphrase);assert.equal(result.ok,true);assert.equal(result.format,'zip');assert.ok(fs.existsSync(result.path));
  const zip=await Zip.loadAsync(fs.readFileSync(result.path));assert.ok(zip.file('state.alhbak'));assert.ok(zip.file('attachments/'+records[0].file+'.alhbak'));assert.ok(zip.file('UserAssets/settings.json.alhbak'));assert.equal(zip.file('state.json'),null);
  assert.doesNotMatch(await zip.file('state.alhbak').async('string'),/"currentUser"/);assert.doesNotMatch(fs.readFileSync(result.path).toString(),/confidential design/);
  f.state.orders[0].total=200;f.store.save(JSON.stringify(f.state));fs.writeFileSync(path.join(f.assets,'settings.json'),'CHANGED');fs.unlinkSync(path.join(f.dir,'OrderAttachments',records[0].file));
  f.chosen.key=crypto.randomBytes(32);f.chosen.open=[result.path];
  const before=f.store.load();assert.equal((await f.handlers['ops-backup-verify149']({},passphrase)).attachments,1);assert.equal(f.store.load(),before);
  const restored=await f.handlers['ops-backup-restore149']({},passphrase);assert.equal(restored.ok,true);assert.equal(restored.beforeMissingAttachments,1);assert.equal(JSON.parse(f.store.load()).orders[0].total,100);
  assert.equal(fs.readFileSync(path.join(f.assets,'settings.json'),'utf8'),'ORIGINAL_ASSET');assert.equal(fs.readFileSync(path.join(f.dir,'OrderAttachments',records[0].file),'utf8'),'%PDF-1.4 confidential design');
 }finally{f.dispose();}
});
test('ZIP restoration rejects wrong passwords and preserves committed state and assets',async()=>{
 const f=fixture();try{const result=await f.handlers['backup-export-zip402']({},passphrase);f.chosen.open=[result.path];const before=f.store.load();await assert.rejects(()=>f.handlers['ops-backup-restore149']({},'incorrect password 402'));assert.equal(f.store.load(),before);assert.equal(fs.readFileSync(path.join(f.assets,'settings.json'),'utf8'),'ORIGINAL_ASSET');assert.ok(!fs.readdirSync(f.dir).some(n=>n.startsWith('backup-read-')));}finally{f.dispose();}
});
test('damaged asset inside otherwise valid ZIP is detected before any live data or files are replaced',async()=>{
 const f=fixture();try{const result=await f.handlers['backup-export-zip402']({},passphrase),zip=await Zip.loadAsync(fs.readFileSync(result.path));const asset=await zip.file('UserAssets/settings.json.alhbak').async('nodebuffer');asset[asset.length-17]^=1;zip.file('UserAssets/settings.json.alhbak',asset);fs.writeFileSync(result.path,await zip.generateAsync({type:'nodebuffer'}));f.state.orders[0].total=200;f.store.save(JSON.stringify(f.state));fs.writeFileSync(path.join(f.assets,'settings.json'),'CURRENT_LIVE_ASSET');f.chosen.open=[result.path];const before=f.store.load();await assert.rejects(()=>f.handlers['ops-backup-verify149']({},passphrase));await assert.rejects(()=>f.handlers['ops-backup-restore149']({},passphrase));assert.equal(f.store.load(),before);assert.equal(fs.readFileSync(path.join(f.assets,'settings.json'),'utf8'),'CURRENT_LIVE_ASSET');}finally{f.dispose();}
});
test('embedded attachment data and shared alert attachments are backed up without missing-file errors or duplicate entries',async()=>{
 const f=fixture();try{
  const input=path.join(f.dir,'design.pdf');fs.writeFileSync(input,'%PDF alert');f.chosen.open=[input];const [record]=await f.handlers['ops-attachments-add149']({},'o');
  f.state.orders[0].attachments149=[record,{id:'embedded',file:'inline.png',name:'inline',size:3,dataUrl:'data:image/png;base64,YWJj'}];f.state.alertAttachments149={general:[record]};f.store.save(JSON.stringify(f.state));
  const result=await f.handlers['backup-export-zip402']({},passphrase);f.chosen.open=[result.path];const verification=await f.handlers['ops-backup-verify149']({},passphrase);assert.equal(verification.attachments,1);
  const zip=await Zip.loadAsync(fs.readFileSync(result.path));assert.equal(Object.keys(zip.files).filter(k=>k.startsWith('attachments/')&&!zip.files[k].dir).length,1);
 }finally{f.dispose();}
});
test('cancelled export and failed destination write do not report success or leave export staging folders',async()=>{
 const f=fixture();try{f.chosen.cancelSave=true;const before=f.store.load(),result=await f.handlers['backup-export-zip402']({},passphrase);assert.equal(result.canceled,true);assert.equal(fs.existsSync(f.chosen.save),false);f.chosen.cancelSave=false;f.chosen.save=path.join(f.dir,'missing-parent','file.zip');await assert.rejects(()=>f.handlers['backup-export-zip402']({},passphrase));assert.equal(f.store.load(),before);assert.ok(!fs.readdirSync(f.dir).some(n=>n.startsWith('backup-export-')));}finally{f.dispose();}
});
test('legacy local ALHBAK and plaintext JSON remain supported after UI and archive changes',async()=>{
 const f=fixture();try{const legacy=f.api.full();f.chosen.open=[legacy.stateFile];assert.equal((await f.handlers['ops-backup-verify149']({})).orders,1);const json=path.join(f.dir,'old.json');fs.writeFileSync(json,'\uFEFF'+JSON.stringify({state:JSON.stringify(f.state)}));f.chosen.open=[json];assert.equal((await f.handlers['ops-backup-restore149']({})).ok,true);}finally{f.dispose();}
});
test('ZIP rejects traversal paths, unrelated archives and excessive declared expanded sizes',async()=>{
 const f=fixture();try{
  for(const name of ['../state.alhbak','UserAssets/../../outside.alhbak','/state.alhbak','UserAssets/C:/outside.alhbak']){
   const zip=new Zip();zip.file('state.alhbak','state');zip.file(name,'unsafe');const file=path.join(f.dir,'unsafe.zip');fs.writeFileSync(file,await zip.generateAsync({type:'nodebuffer'}));await assert.rejects(()=>Archive.unpack(file,f.dir));
  }
  const zip=new Zip();zip.file('unrelated.txt','no backup');const file=path.join(f.dir,'not-backup.zip');fs.writeFileSync(file,await zip.generateAsync({type:'nodebuffer'}));await assert.rejects(()=>Archive.unpack(file,f.dir));
  const bomb=new Zip();bomb.file('state.alhbak','small');const bytes=await bomb.generateAsync({type:'nodebuffer'});const central=bytes.indexOf(Buffer.from([0x50,0x4b,0x01,0x02]));bytes.writeUInt32LE(513*1024*1024,central+24);const huge=path.join(f.dir,'huge.zip');fs.writeFileSync(huge,bytes);await assert.rejects(()=>Archive.unpack(huge,f.dir));
  assert.ok(!fs.readdirSync(f.dir).some(n=>n.startsWith('backup-read-')));
 }finally{f.dispose();}
});
test('backup interfaces use app dialogs and a single file chooser; operations retain audit but remove duplicate backup pane',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../app/index.html'),'utf8'),ui=fs.readFileSync(path.join(__dirname,'../app/backup-ui-402.js'),'utf8'),ops=fs.readFileSync(path.join(__dirname,'../app/operations-149.js'),'utf8');
 const restore=html.slice(html.indexOf('function triggerRestoreBackup'),html.indexOf('function triggerRestoreBackup')+500);
 assert.doesNotMatch(restore,/\bprompt\(/);assert.doesNotMatch(ui,/\bprompt\(/);assert.doesNotMatch(ops,/\bprompt\(/);assert.doesNotMatch(html,/id="restoreFileInput"/);assert.match(html,/backup-ui-402\.js/);assert.match(ops,/function renderAudit\(/);assert.doesNotMatch(ops,/\brenderBackup\b/);assert.match(ui,/type="password"/);
 const {Script}=require('node:vm');
 for(const [,script]of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi))if(script.trim())assert.doesNotThrow(()=>new Script(script));
});
test('ZIP flush uses a writable file handle as required by Windows; successful backup survives Explorer reveal failure',async()=>{
 const f=fixture(),open=fs.openSync,sync=fs.fsyncSync,writable=new Set();try{
  f.chosen.throwReveal=true;fs.openSync=function(file,flags,...args){const fd=open.call(this,file,flags,...args);if(String(flags).includes('+')||String(flags).includes('w'))writable.add(fd);return fd;};
  fs.fsyncSync=function(fd){assert.ok(writable.has(fd),'Windows FlushFileBuffers requires a writable handle');return sync.call(this,fd);};
  const result=await f.handlers['backup-export-zip402']({},passphrase);assert.equal(result.ok,true);f.chosen.open=[result.path];assert.equal((await f.handlers['ops-backup-verify149']({},passphrase)).orders,1);
 }finally{fs.openSync=open;fs.fsyncSync=sync;f.dispose();}
});
