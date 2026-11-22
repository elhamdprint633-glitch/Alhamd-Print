'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');const M=require('./operations-149-model.js');const {Store}=require('./store.cjs');const Backup166=require('./backup-crypto-166.cjs');const Backup650=require('./backup-stream-650.cjs');const Archive402=require('./backup-archive-402.cjs');
const extensions=new Set(['.pdf','.png','.jpg','.jpeg','.webp','.tif','.tiff','.bmp','.ai','.eps','.psd','.cdr','.svg','.zip','.doc','.docx','.xls','.xlsx','.csv','.txt','.rar','.7z','.gif','.indd']);
function install({ipcMain,dialog,shell,allowed,store,dataDir,getWin,backupDir,snapshot,getResources,getDeviceBackupKey=()=>null,isSessionAuthenticated=()=>true}){
 const vault=path.join(dataDir,'OrderAttachments');fs.mkdirSync(vault,{recursive:true});
 function auth(key,admin=false){const s=JSON.parse(store.load()||'{}'),u=(s.users||[]).find(x=>x.id===s.currentUser)||(s.users||[])[0];if(s.isLocked||!u||!isSessionAuthenticated(u.id)||u.role!=='admin'&&(admin||!permission(s,key)))throw Error('يجب تسجيل الدخول والتحقق من PIN، مع توفر الصلاحية المطلوبة.');return s;}
 function file(id){if(!/^[a-f0-9-]{36}\.[a-z0-9]{1,8}$/.test(id)||!extensions.has(path.extname(id)))throw Error('معرّف مرفق غير صالح');return path.join(vault,id);}
 function attachments(s){
  const all=[...(s.orders||[]).flatMap(o=>(o.attachments149||[]).map(a=>({...a,orderId:o.id}))),...(s.proofApprovals650||[]).flatMap(p=>p.attachment?[p.attachment]:[]),...Object.values(s.alertAttachments149||{}).flatMap(a=>Array.isArray(a)?a:[])],unique=new Map();
  for(const a of all){if(!a?.file||a.dataUrl)continue;const prior=unique.get(a.file);if(prior&&(prior.sha256!==a.sha256||prior.size!==a.size))throw Error('بيانات متعارضة للمرفق: '+a.name);unique.set(a.file,a);}
  return [...unique.values()];
 }
 function permission(s,key){return require('./permissions-650.js').can((s.users||[]).find(x=>x.id===s.currentUser),key);}
 function authAny(keys){const s=JSON.parse(store.load()||'{}'),u=(s.users||[]).find(x=>x.id===s.currentUser);if(s.isLocked||!u||!isSessionAuthenticated(u.id)||!keys.some(k=>permission(s,k)))throw Error('لا تملك صلاحية إدارة صور إثبات الفاتورة أو انتهت جلسة الدخول.');return s;}
 function imageType(bytes,ext){const e=ext.toLowerCase();if(e==='.png')return bytes.length>8&&bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));if(e==='.jpg'||e==='.jpeg')return bytes.length>3&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255;if(e==='.webp')return bytes.length>12&&bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP';if(e==='.bmp')return bytes.length>2&&bytes.toString('ascii',0,2)==='BM';return false;}
 function test(text,folder,attachmentReader=p=>fs.readFileSync(p)){const s=JSON.parse(text);s.auditTrail166||=[];M.validate(s);const dir=fs.mkdtempSync(path.join(os.tmpdir(),'alhamd-restore-test-'));let temp;try{temp=new Store(path.join(dir,'check.sqlite'));temp.save(text,null,{restore:true});const restored=JSON.parse(temp.backupState650());restored.auditTrail166||=[];if(JSON.stringify(restored)!==JSON.stringify(s)){for(const k of Object.keys(s))if(JSON.stringify(restored[k])!==JSON.stringify(s[k]))throw Error('اختلاف بيانات بعد الاستعادة التجريبية: '+k);}let count=0;for(const a of attachments(s)){const p=path.join(folder||vault,a.file);file(a.file);if(!fs.existsSync(p)&&!fs.existsSync(p+'.alhbak'))throw Error('مرفق مفقود: '+a.name);const bytes=attachmentReader(p);if(bytes.length!==a.size||crypto.createHash('sha256').update(bytes).digest('hex')!==a.sha256)throw Error('مرفق تالف: '+a.name);count++;}return{ok:true,orders:s.orders.length,items:s.items.length,treasury:s.treasury.length,attachments:count};}finally{temp?.close();fs.rmSync(dir,{recursive:true,force:true});}}
 function stamp12h(d=new Date()){const yyyy=d.getFullYear(),mm=String(d.getMonth()+1).padStart(2,'0'),dd=String(d.getDate()).padStart(2,'0');let h=d.getHours();const period=h>=12?'م':'ص';h=h%12||12;return `${yyyy}-${mm}-${dd}_${String(h).padStart(2,'0')}-${String(d.getMinutes()).padStart(2,'0')}-${String(d.getSeconds()).padStart(2,'0')}_${period}`;}
 function secrets(mode,passphrase){return {mode,secret:mode==='portable'?passphrase:getDeviceBackupKey()};}
 function packedFile(p,passphrase){
  const raw=fs.readFileSync(p);
  if(path.extname(p).toLowerCase()==='.alhbak')return Backup166.decrypt(raw,{deviceKey:getDeviceBackupKey(),passphrase});
  if(path.extname(p).toLowerCase()!=='.json')throw Error('صيغة ملف النسخة غير مدعومة');
  let state=JSON.parse(raw.toString('utf8').replace(/^\uFEFF/,''));
  if(state&&typeof state==='object'&&!Array.isArray(state.orders)){
   for(const key of ['state','data']){
    const candidate=typeof state[key]==='string'?JSON.parse(state[key]):state[key];
    if(candidate&&Array.isArray(candidate.orders)&&Array.isArray(candidate.users)){state=candidate;break;}
   }
  }
  return Buffer.from(JSON.stringify(state),'utf8'); // Unwrap legacy formats without altering financial fields.
 }
 function walk(root){
  if(!root||!fs.existsSync(root))return [];
  const out=[];function visit(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){
   const p=path.join(dir,item.name);
   if(item.isSymbolicLink())continue;
   if(item.isDirectory())visit(p);else if(item.isFile())out.push(p);
  }}visit(root);return out;
 }
 function full(mode='device',passphrase=null,destination=backupDir(),{allowIncomplete=false}={}){
  const s=auth('sets_backup',true);const history650=JSON.parse(store.backupState650()).auditTrail166;if(history650)s.auditTrail166=history650;const text=JSON.stringify(s,null,2),sec=secrets(mode,passphrase);
  if(!allowIncomplete)test(text,vault);
  const incomplete=[];
  let stamp=stamp12h(new Date()),dir=path.join(destination,'الحمد_برنت_نسخة_كاملة_'+stamp);
  if(fs.existsSync(dir)){stamp+='_'+crypto.randomBytes(2).toString('hex');dir=path.join(destination,'الحمد_برنت_نسخة_كاملة_'+stamp);}
  const stage=dir+'.building-'+process.pid;
  fs.mkdirSync(path.join(stage,'attachments'),{recursive:true});
  try{
   const stateFile=path.join(stage,'state.alhbak');
   fs.writeFileSync(stateFile,Backup650.encrypt(text,sec),{mode:0o600,flag:'wx'});
   for(const a of attachments(s)){
    const input=file(a.file),dest=path.join(stage,'attachments',a.file+'.alhbak');
    if(allowIncomplete&&!fs.existsSync(input)){incomplete.push(a.file);continue;}
    if(allowIncomplete&&fs.statSync(input).size!==a.size)incomplete.push(a.file);
    Backup650.encryptFile(input,dest,sec);
   }
   const assetBase=getResources?.()?.base;
   for(const input of walk(assetBase)){
    const rel=path.relative(assetBase,input),dest=path.join(stage,'UserAssets',rel+'.alhbak');
    fs.mkdirSync(path.dirname(dest),{recursive:true});
    Backup650.encryptFile(input,dest,sec);
   }
   const attachmentReader=p=>Backup166.decrypt(fs.readFileSync(p+'.alhbak'),{deviceKey:getDeviceBackupKey(),passphrase});
   const readable=Backup166.decrypt(fs.readFileSync(stateFile),{deviceKey:getDeviceBackupKey(),passphrase}).toString('utf8');
   const result=allowIncomplete?{ok:true,guardOnly:true,missingAttachments:incomplete.length,incompleteFiles:incomplete}:test(readable,path.join(stage,'attachments'),attachmentReader);
   fs.writeFileSync(path.join(stage,'verification.alhbak'),Backup650.encrypt(JSON.stringify({...result,at:new Date().toISOString(),sha256:crypto.createHash('sha256').update(text).digest('hex')}),sec),{mode:0o600});
   fs.renameSync(stage,dir);
   return {...result,name:path.basename(dir),path:dir,stateFile:path.join(dir,'state.alhbak'),mode};
  }catch(e){fs.rmSync(stage,{recursive:true,force:true});throw e;}
 }
 ipcMain.handle('ops-attachments-add149',async(e,id)=>{allowed(e);authAny(['ops_manage','proof_approve']);const pick=await dialog.showOpenDialog(getWin(),{title:'اختر ملفات التصميم أو التنبيه أو اعتماد العميل',properties:['openFile','multiSelections'],filters:[{name:'ملفات التصميم والمستندات والصور',extensions:[...extensions].map(x=>x.slice(1))},{name:'كل الملفات',extensions:['*']}]});if(pick.canceled||!pick.filePaths?.length)return[];authAny(['ops_manage','proof_approve']);const result=[];for(const p of pick.filePaths.slice(0,20)){const rawExt=path.extname(p).toLowerCase(),ext=extensions.has(rawExt)?rawExt:'.pdf',st=fs.statSync(p);if(!extensions.has(rawExt)||!st.isFile()||st.size>50*1024*1024)throw Error('نوع الملف غير مدعوم أو حجمه أكبر من 50 ميجابايت');const bytes=fs.readFileSync(p),attId=crypto.randomUUID(),name=attId+ext;fs.writeFileSync(file(name),bytes,{flag:'wx'});result.push({id:attId,name:path.basename(p),file:name,size:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),addedAt:new Date().toISOString()});}return result;});
 ipcMain.handle('ops-attachment-open149',async(e,payload)=>{allowed(e);const s=auth('ops_manage');let a=s.orders?.find(o=>String(o.id)===String(payload?.orderId))?.attachments149?.find(x=>x.id===payload?.id);if(!a&&payload?.file)a={file:payload.file};if(!a&&s.alertAttachments149){for(const list of Object.values(s.alertAttachments149)){const found=(list||[]).find(x=>x.id===payload?.id);if(found){a=found;break;}}}if(!a)throw Error('المرفق غير موجود');const p=file(a.file);if(!fs.existsSync(p))throw Error('ملف المرفق غير موجود؛ استرجع النسخة الكاملة بالمرفقات');const r=await shell.openPath(p);if(r)throw Error(r);return true;});
 ipcMain.handle('ops-evidence-pick157',async(e,payload={})=>{allowed(e);const editing=!!payload.editing;authAny([editing?'inv_edit':'inv_create']);const pick=await dialog.showOpenDialog(getWin(),{title:'اختر صور إثبات طلب العميل',properties:['openFile','multiSelections'],filters:[{name:'صور PNG / JPG / WEBP / BMP',extensions:['png','jpg','jpeg','webp','bmp']}]});if(pick.canceled)return[];authAny([editing?'inv_edit':'inv_create']);const result=[];for(const p of pick.filePaths.slice(0,12)){const ext=path.extname(p).toLowerCase(),st=fs.statSync(p);if(!['.png','.jpg','.jpeg','.webp','.bmp'].includes(ext)||!st.isFile()||st.size<=0||st.size>12*1024*1024)throw Error('كل صورة يجب أن تكون PNG أو JPG أو WEBP أو BMP وبحجم لا يتجاوز 12 ميجابايت.');const bytes=fs.readFileSync(p);if(!imageType(bytes,ext))throw Error('امتداد الصورة لا يطابق محتواها الفعلي: '+path.basename(p));const id=crypto.randomUUID(),name=id+ext;fs.writeFileSync(file(name),bytes,{flag:'wx'});result.push({id,name:path.basename(p).slice(0,180),file:name,size:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),addedAt:new Date().toISOString(),kind:'invoice-evidence'});}return result;});
 ipcMain.handle('ops-evidence-open157',async(e,payload={})=>{allowed(e);authAny(['record_view','inv_print','inv_edit']);const name=String(payload.file||'');const p=file(name);if(!fs.existsSync(p))throw Error('ملف الصورة غير موجود؛ تحقق من مجلد المرفقات أو النسخة الاحتياطية.');const r=await shell.openPath(p);if(r)throw Error(r);return true;});
 ipcMain.handle('ops-evidence-prune157',async(e,payload={})=>{allowed(e);authAny(['inv_create','inv_edit']);const s=JSON.parse(store.load()||'{}'),refs=new Set(attachments(s).map(a=>a.file)),removed=[];for(const name of Array.isArray(payload.files)?payload.files.slice(0,30):[]){try{const p=file(String(name));if(!refs.has(String(name))&&fs.existsSync(p)){fs.unlinkSync(p);removed.push(String(name));}}catch(_){}}return{removed:removed.length};});
 ipcMain.handle('ops-backup-full149',async e=>{allowed(e);const r=full();shell.showItemInFolder(r.stateFile);return r;});
 ipcMain.handle('ops-backup-portable166',async(e,passphrase)=>{allowed(e);const r=full('portable',passphrase);shell.showItemInFolder(r.stateFile);return r;});
 ipcMain.handle('ops-backup-verify149',async(e,passphrase)=>{
  allowed(e);auth('sets_backup');
  const pick=await dialog.showOpenDialog(getWin(),{title:'اختر نسخة ZIP أو ALHBAK أو JSON قديم',properties:['openFile'],filters:[{name:'نسخة البرنامج',extensions:['zip','alhbak','json']}]});
  if(pick.canceled)return null;auth('sets_backup');
  let p=pick.filePaths[0];
  const opened=path.extname(p).toLowerCase()==='.zip'?await Archive402.unpack(p,dataDir):null;
  try{
  if(opened)p=opened.stateFile;
  auth('sets_backup');
  const folder=path.join(path.dirname(p),'attachments');
  const text=packedFile(p,passphrase).toString('utf8');
  const encrypted=path.extname(p).toLowerCase()==='.alhbak';
  const reader=encrypted?(f)=>fs.existsSync(f+'.alhbak')?Backup166.decrypt(fs.readFileSync(f+'.alhbak'),{deviceKey:getDeviceBackupKey(),passphrase}):fs.readFileSync(f):(f)=>fs.readFileSync(f);
  const result=test(text,fs.existsSync(folder)?folder:vault,reader);
  const assets=walk(path.join(path.dirname(p),'UserAssets'));
  for(const asset of assets){if(encrypted)Backup166.decrypt(fs.readFileSync(asset),{deviceKey:getDeviceBackupKey(),passphrase});}
  return {...result,assets:assets.length};
  }finally{opened?.dispose();}
 });
 ipcMain.handle('ops-backup-restore149',async(e,passphrase)=>{
  allowed(e);auth('sets_backup',true);
  const pick=await dialog.showOpenDialog(getWin(),{title:'اختر نسخة ZIP أو ALHBAK أو JSON لاسترجاعها',properties:['openFile'],filters:[{name:'نسخة البرنامج',extensions:['zip','alhbak','json']}]});
  if(pick.canceled)return null;auth('sets_backup',true);
  let p=pick.filePaths[0];
  const opened=path.extname(p).toLowerCase()==='.zip'?await Archive402.unpack(p,dataDir):null;
  try{
  if(opened)p=opened.stateFile;
  auth('sets_backup',true);
  const folder=path.join(path.dirname(p),'attachments'),text=packedFile(p,passphrase).toString('utf8');
  const encrypted=path.extname(p).toLowerCase()==='.alhbak';
  const reader=encrypted?(f)=>fs.existsSync(f+'.alhbak')?Backup166.decrypt(fs.readFileSync(f+'.alhbak'),{deviceKey:getDeviceBackupKey(),passphrase}):fs.readFileSync(f):(f)=>fs.readFileSync(f);
  test(text,fs.existsSync(folder)?folder:vault,reader);
  const before=full('device',null,backupDir(),{allowIncomplete:true}),s=JSON.parse(text);
  // Stage authenticated plaintext on disk before changing any live file; rollback also lives on disk.
  const staging=fs.mkdtempSync(path.join(dataDir,'restore650-')),transfers=[],rollback=[];
  const opts={deviceKey:getDeviceBackupKey(),passphrase};
  function stage650(input,dest,isEncrypted){const prepared=path.join(staging,'new-'+transfers.length);if(isEncrypted)Backup650.decryptFile(input,prepared,opts);else fs.copyFileSync(input,prepared,fs.constants.COPYFILE_EXCL);transfers.push({path:dest,prepared});}
  try{
   for(const a of attachments(s)){const input=path.join(fs.existsSync(folder)?folder:vault,a.file);stage650(fs.existsSync(input+'.alhbak')?input+'.alhbak':input,file(a.file),encrypted&&fs.existsSync(input+'.alhbak'));}
   const savedAssets=path.join(path.dirname(p),'UserAssets'),assetBase=getResources?.()?.base;
   if(assetBase&&fs.existsSync(savedAssets))for(const asset of walk(savedAssets)){if(!encrypted&&asset.endsWith('.alhbak'))continue;const rel=path.relative(savedAssets,asset).replace(/\.alhbak$/,''),dest=path.resolve(assetBase,rel);if(!dest.startsWith(path.resolve(assetBase)+path.sep))throw Error('اسم ملف غير آمن');stage650(asset,dest,encrypted);}
   try{
    for(const t of transfers){const original=fs.existsSync(t.path)?path.join(staging,'old-'+rollback.length):null;if(original)fs.copyFileSync(t.path,original,fs.constants.COPYFILE_EXCL);rollback.push({path:t.path,original});fs.mkdirSync(path.dirname(t.path),{recursive:true});const tmp=t.path+'.restore-'+crypto.randomUUID();try{fs.copyFileSync(t.prepared,tmp,fs.constants.COPYFILE_EXCL);fs.renameSync(tmp,t.path);}finally{fs.rmSync(tmp,{force:true});}}
    store.save(text,store.revision,{restore:true});
   }catch(error){for(const t of rollback.reverse()){if(t.original)fs.copyFileSync(t.original,t.path);else fs.rmSync(t.path,{force:true});}throw error;}
  }finally{fs.rmSync(staging,{recursive:true,force:true});}
  return{ok:true,before:before.name,beforeMissingAttachments:before.missingAttachments||0};
  }finally{opened?.dispose();}
 });

 ipcMain.handle('backup-export-zip402',async(e,passphrase)=>{
  allowed(e);auth('sets_backup',true);
  if(typeof passphrase!=='string'||passphrase.length<12||passphrase.length>200)throw Error('كلمة مرور النسخة يجب أن تكون بين 12 و200 رمز');
  const name='Alhamd-Backup-'+stamp12h(new Date())+'.zip';
  const pick=await dialog.showSaveDialog(getWin(),{title:'حفظ نسخة احتياطية كاملة بكلمة مرور',defaultPath:path.join(backupDir(),name),filters:[{name:'نسخة احتياطية كاملة ZIP',extensions:['zip']}]});
  if(pick.canceled||!pick.filePath)return{ok:false,canceled:true};
  auth('sets_backup',true);
  const target=pick.filePath.toLowerCase().endsWith('.zip')?pick.filePath:pick.filePath+'.zip';
  // Stage a portable, self-contained snapshot. No device key is needed to open this export.
  const stage=fs.mkdtempSync(path.join(dataDir,'backup-export-'));
  try{
   const copy=full('portable',passphrase,stage);
   fs.writeFileSync(path.join(copy.path,'README.txt'),'نسخة الحمد برنت الكاملة. لا تفك الضغط للاسترجاع. اختر ملف ZIP من إعدادات البرنامج وأدخل كلمة المرور التي حددتها عند الحفظ. تحفظ هذه النسخة البيانات والمرفقات وأصول المستخدم. بدون كلمة المرور لا يمكن فتحها.','utf8');
   const result=await Archive402.write(copy.path,target);
   // Revealing a successfully saved ZIP is optional and must not turn success into a backup failure.
   try{shell.showItemInFolder(target);}catch(_){}
   return {...copy,...result,path:target,name:path.basename(target),stateFile:undefined,format:'zip',mode:'portable'};
  }finally{fs.rmSync(stage,{recursive:true,force:true});}
 });
 return{test,full};
}
module.exports={install};
