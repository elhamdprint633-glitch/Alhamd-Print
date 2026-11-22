'use strict';
const {app,BrowserWindow,ipcMain,dialog,Menu,nativeImage,clipboard,ClipboardItem,shell,protocol,safeStorage}=require('electron');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{pathToFileURL}=require('node:url');
const {SCHEME,APP_URL,assetURL,serve}=require('./app-protocol.cjs');
protocol.registerSchemesAsPrivileged([{scheme:SCHEME,privileges:{standard:true,secure:true,supportFetchAPI:true,corsEnabled:true}}]);
const {Store}=require('./store.cjs');
const {AdminRecovery}=require('./admin-recovery.cjs');
const Backup166=require('./backup-crypto-166.cjs');
const Permissions166=require('./server-permissions-166.cjs');
const {pinHash,verifyPin,isPinHash,migrateLegacyPins,PersistentPinLimiter}=require('./security-152.cjs');
const {safeTitle}=require('./document-names.js');
app.disableHardwareAcceleration();
const {Resources}=require('./resource-manager.cjs');
const {LanSyncServer}=require('./lan-sync-server.cjs');
const {renderPDF}=require('./pdf-service.cjs');
const {Worker}=require('node:worker_threads');
if (!(process.env.ALHAMD_QA_DATA && !app.isPackaged)) app.enableSandbox();
function createExcel(payload){return new Promise((resolve,reject)=>{const worker=new Worker(path.join(__dirname,'xlsx-worker.cjs'),{workerData:payload});worker.once('message',bytes=>resolve(Buffer.from(bytes)));worker.once('error',reject);worker.once('exit',code=>{if(code!==0)reject(Error('تعذر تجهيز Excel'));});});}
let excelBusy=false;
let win,store,resources,lanServer,config={},dataDir,configPath,pinLimiter,adminRecovery;let pdfBusy=false;
let authenticatedUserId=null,sessionExpiresAt=0,deviceBackupKey=null,startupBackupWarning="";
function sessionOk(userId){
 if(!authenticatedUserId||Date.now()>sessionExpiresAt){authenticatedUserId=null;sessionExpiresAt=0;return false;}
 if(userId&&String(userId)!==String(authenticatedUserId))return false;
 sessionExpiresAt=Date.now()+12*60*60*1000;return true;
}
function requireAdminSession(){
 if(!sessionOk())throw Error('سجّل الدخول أولاً باستخدام PIN المدير.');
 const state=JSON.parse(store.load()||'{}');
 if(!(state.users||[]).some(u=>String(u.id)===String(authenticatedUserId)&&u.role==='admin'))throw Error('هذه العملية متاحة للمدير فقط.');
 return state;
}
function protectDatabaseKey(){
 const file=path.join(dataDir,'database-key.dpapi');
 if(!safeStorage?.isEncryptionAvailable?.()){if(app.isPackaged&&process.platform==='win32')throw Error('تعذر تفعيل حماية Windows DPAPI لمفتاح قاعدة البيانات. لم يتم فتح قاعدة البيانات لحماية بياناتك.');return null;}
 if(fs.existsSync(file)){const packed=Buffer.from(fs.readFileSync(file,'utf8').trim(),'base64');const hex=safeStorage.decryptString(packed);const key=Buffer.from(hex,'hex');if(key.length!==32)throw Error('ملف مفتاح قاعدة البيانات غير صالح. لا تحذفه حتى لا تفقد إمكانية فتح بياناتك.');return key;}
 const key=crypto.randomBytes(32),packed=safeStorage.encryptString(key.toString('hex'));atomic(file,packed.toString('base64'));return key;
}
if (process.env.ALHAMD_QA_DATA && !app.isPackaged) app.setPath('userData', process.env.ALHAMD_QA_DATA);
const single=(process.env.ALHAMD_QA_DATA && !app.isPackaged) ? true : app.requestSingleInstanceLock();if(!single){app.quit();}else{app.on('second-instance',()=>{if(win){if(win.isMinimized())win.restore();win.focus();}});app.whenReady().then(start).catch(e=>{dialog.showErrorBox('الحمد برنت — تعذر بدء التشغيل',e.message+'\nلم يتم تصفير بياناتك. احتفظ بمجلد البيانات وتواصل للدعم.');app.quit();});}
function atomic(file,text){const temp=file+'.'+process.pid+'.'+Date.now()+'.tmp';const fd=fs.openSync(temp,'wx',0o600);try{fs.writeFileSync(fd,text,'utf8');fs.fsyncSync(fd);}catch(e){try{fs.unlinkSync(temp);}catch{}throw e;}finally{fs.closeSync(fd);}try{fs.renameSync(temp,file);}catch(e){try{fs.unlinkSync(temp);}catch{}throw e;}try{const dir=fs.openSync(path.dirname(file),'r');try{fs.fsyncSync(dir);}finally{fs.closeSync(dir);}}catch{}}
function trimBackups(dir,prefix,keep){const files=fs.readdirSync(dir).filter(f=>f.startsWith(prefix)&&(f.endsWith('.json')||f.endsWith('.alhbak'))).sort().reverse();for(const name of files.slice(keep))fs.unlinkSync(path.join(dir,name));}
function formatStamp12h(d=new Date()){const yyyy=d.getFullYear(),mm=String(d.getMonth()+1).padStart(2,'0'),dd=String(d.getDate()).padStart(2,'0');let h=d.getHours();const period=h>=12?'م':'ص';h=h%12||12;return `${yyyy}-${mm}-${dd}_${String(h).padStart(2,'0')}-${String(d.getMinutes()).padStart(2,'0')}-${String(d.getSeconds()).padStart(2,'0')}_${period}`;}
function snapshot(text,reason='manual'){text=store?.backupState650()||text;JSON.parse(text);const dir=config.backupFolder||path.join(dataDir,'Backups');fs.mkdirSync(dir,{recursive:true});const cleanReason=String(reason).replace(/[^a-z-]/gi,'')||'manual';const prefix=reason==='daily'?'Alhamd-daily-':'الحمد_برنت_نسخة_'+cleanReason+'_';const file=path.join(dir,prefix+formatStamp12h(new Date())+'.alhbak');atomic(file,require('./backup-stream-650.cjs').encrypt(text,{secret:deviceBackupKey}));if(reason==='daily')trimBackups(dir,'Alhamd-daily-',14);return {ok:true,path:file};}
function verifyStoredPin(userId,pin,adminOnly=false,desktopSession=false){
 const cleanPin=String(pin??'').replace(/[٠-٩]/g,d=>String(d.charCodeAt(0)-1632)).replace(/[۰-۹]/g,d=>String(d.charCodeAt(0)-1776)).trim();
 const lockKey=adminOnly?'admin-security':'user:'+String(userId||'');
 const state=JSON.parse(store.load()||'{}');
 const allUsers=Array.isArray(state.users)?state.users:[];
 let candidates=adminOnly?allUsers.filter(u=>u.role==='admin'):allUsers.filter(u=>!userId||u.id===userId);
 if(!candidates.length&&adminOnly)return {ok:false,error:'لا يوجد مدير مسجل',revision:store.revision};
 const locked=pinLimiter.status(lockKey);if(locked.locked)return {ok:false,lockedMs:locked.lockedMs,revision:store.revision};
 let matched=candidates.find(u=>verifyPin(cleanPin,u.pin));
 if(!matched&&allUsers.length===0&&cleanPin==='1234'){
  matched={id:userId||'u_admin',name:'المدير العام',role:'admin',pin:'1234'};
 }
 if(!matched){
  const status=pinLimiter.fail(lockKey);return {ok:false,lockedMs:status.lockedMs,failures:status.failures,revision:store.revision};
 }
 pinLimiter.success(lockKey);
 const migration=migrateLegacyPins(state.users||[]);
 if(migration.changed){
  store.save(JSON.stringify(state),store.revision,{restore:true});
  const day=new Date().toISOString().slice(0,10),remaining=(state.users||[]).some(u=>u.pin!==null&&u.pin!==undefined&&u.pin!==''&&!isPinHash(u.pin));
  if(!remaining&&config.lastDaily!==day){try{snapshot(store.load(),'daily');config.lastDaily=day;atomic(configPath,JSON.stringify(config));}catch(error){console.warn('Daily backup deferred after PIN migration:',error.message);}}
 }
 if(desktopSession&&!adminOnly){authenticatedUserId=matched.id;sessionExpiresAt=Date.now()+12*60*60*1000;}
 return {ok:true,userId:matched.id,revision:store.revision,migrated:migration.changed,resetPinCount:migration.reset};
}
function allowed(event){const mainUrl=APP_URL;if(!win||event.sender!==win.webContents||event.senderFrame!==win.webContents.mainFrame||event.senderFrame.url!==mainUrl)throw Error('غير مصرح');}
function sync(name,fn){ipcMain.on(name,(event,...args)=>{try{allowed(event);event.returnValue={ok:true,value:fn(...args)};}catch(e){event.returnValue={ok:false,error:e.message};}});}

function printCSS(){return ['assets/tailwind.css','assets/fonts.css','assets/fontawesome/css/all.min.css','assets/upgrade-v12.css','operations-149.css'].map(file=>{const base=path.dirname(path.join(__dirname,file));return fs.readFileSync(path.join(__dirname,file),'utf8').replace(/url\((['"]?)([^)'"\s]+)\1\)/g,(all,q,url)=>url.startsWith('data:')?all:`url("${assetURL(path.relative(__dirname,path.resolve(base,url)))}")`);}).join('\n');}
function backupHistory(){const dir=config.backupFolder||path.join(dataDir,'Backups');if(!fs.existsSync(dir))return [];return fs.readdirSync(dir).filter(n=>(n.endsWith('.json')||n.endsWith('.alhbak')||n.endsWith('.zip'))&&(n.startsWith('Alhamd-')||n.startsWith('الحمد_برنت'))).map(name=>({filename:name,timestamp:fs.statSync(path.join(dir,name)).mtime.toISOString(),reason:name.includes('before-cleanup')?'قبل التنظيف':name.includes('before-restore')?'قبل الاسترجاع':name.includes('daily')?'يومي':'تلقائي'})).sort((a,b)=>b.timestamp.localeCompare(a.timestamp)).slice(0,20);}

function start(){
 for(const file of ['index.html','preload.cjs','assets/tailwind.css','assets/fonts.css'])if(!fs.existsSync(path.join(__dirname,file)))throw Error('ملف مفقود من حزمة البرنامج: '+file);
 protocol.handle(SCHEME,request=>serve(request,__dirname));
 app.setName('Alhamd Print');dataDir=app.getPath('userData');fs.mkdirSync(dataDir,{recursive:true});configPath=path.join(dataDir,'desktop-config.json');if(fs.existsSync(configPath))config=JSON.parse(fs.readFileSync(configPath,'utf8'));
 const databaseKey=protectDatabaseKey();deviceBackupKey=databaseKey;
 store=new Store(path.join(dataDir,'alhamd.sqlite'),{encryptionKey:databaseKey});
 const migration650=JSON.parse(store.load()||'null');if(migration650&&require('./permissions-650.js').migrate(migration650))store.save(JSON.stringify(migration650),store.revision,{restore:true});
 pinLimiter=new PersistentPinLimiter(path.join(dataDir,'pin-attempts.json'));
 adminRecovery=new AdminRecovery(dataDir);
 require('./operations-native-149.cjs').install({ipcMain,dialog,shell,allowed,store,dataDir,getWin:()=>win,getResources:()=>resources,backupDir:()=>config.backupFolder||path.join(dataDir,'Backups'),snapshot,getDeviceBackupKey:()=>deviceBackupKey,isSessionAuthenticated:(id)=>sessionOk(id)});
 resources=new Resources(app,dataDir);
 lanServer=new LanSyncServer({appDir:__dirname,dataDir,store,verifyPin:(userId,pin,adminOnly)=>verifyStoredPin(userId,pin,adminOnly,false),onCommit:snapshot=>{if(win&&!win.isDestroyed())win.webContents.send('lan-state-updated',{...snapshot,state:require('./renderer-state-650.cjs').project(snapshot.state,sessionOk())});}});
 const Tailscale413=require('./tailscale-mobile413.cjs');
 const directMobile412=new (require('./direct-mobile412.cjs').DirectMobile412)({dataDir,lan:lanServer,safeStorage});
 if(!directMobile412.config.migratedTailscale413){if(directMobile412.config.mode!=='tailscale')directMobile412.config.autoStart=false;directMobile412.config.migratedTailscale413=true;directMobile412.persist();}
 ipcMain.handle('direct-mobile-info412',event=>{allowed(event);requireAdminSession();return directMobile412.info(true);});
 ipcMain.handle('tailscale-info413',async event=>{allowed(event);requireAdminSession();return Tailscale413.status();});
 ipcMain.handle('tailscale-help413',async(event,target)=>{allowed(event);requireAdminSession();const url=Tailscale413.HELP[target];if(!url)throw Error('رابط غير مسموح');await shell.openExternal(url);return true;});
 ipcMain.handle('direct-mobile-start412',async(event,payload)=>{allowed(event);requireAdminSession();if(payload?.mode==='tailscale'){const status=await Tailscale413.status();if(!status.running||!status.ip)throw Error('افتح Tailscale وسجل الدخول وشغّل الاتصال أولًا');const endpoint='https://'+status.ip+':47822';if(directMobile412.server?.listening&&directMobile412.config.endpoint!==endpoint)directMobile412.close(false);if(lanServer.tls660){await new Promise(resolve=>lanServer.tls660.close(resolve));lanServer.tls660=null;}return directMobile412.start(endpoint,payload.autoStart,'tailscale');}if(lanServer.tls660){await new Promise(resolve=>lanServer.tls660.close(resolve));lanServer.tls660=null;}return directMobile412.start(payload.endpoint,payload.autoStart);});
 ipcMain.handle('direct-mobile-stop412',event=>{allowed(event);requireAdminSession();return directMobile412.close();});
 if(!directMobile412.config.keepPaired610){if(directMobile412.config.mode==='tailscale'&&directMobile412.config.endpoint&&lanServer.devices.length)directMobile412.config.autoStart=true;directMobile412.config.keepPaired610=true;directMobile412.persist();}
 const ensureLocalTLS660=async()=>{if(directMobile412.server?.listening)return;if(directMobile412.config.autoStart&&directMobile412.config.endpoint){if(lanServer.tls660){await new Promise(resolve=>lanServer.tls660.close(resolve));lanServer.tls660=null;}return directMobile412.start(directMobile412.config.endpoint,true,directMobile412.config.mode||'direct');}if(!lanServer.tls660?.listening)await lanServer.startLocalTLS660(safeStorage);};
 if(lanServer.settings610.autoStart)lanServer.start().then(ensureLocalTLS660).catch(e=>console.warn('Saved local link not started:',e.message));
 ipcMain.handle('pairing-copy702',async(event,payload)=>{allowed(event);requireAdminSession();const result=require('./pairing-copy-702.cjs').prepare(lanServer.info(true),directMobile412.info(true),payload);await clipboard.writeText(result.text);return result;});
 ipcMain.handle('link-status610',event=>{allowed(event);requireAdminSession();const local=lanServer.info(false),remote=directMobile412.info(false);return {local:local.enabled,remote:remote.enabled,storeError:!!lanServer.deviceReadError610,paired:local.paired,connected:(local.enabled||remote.enabled)?local.paired.filter(p=>p.connected610).length:0};});
 let reconnecting610=false;const reconnect610=setInterval(async()=>{if(reconnecting610)return;reconnecting610=true;try{if(lanServer.settings610.autoStart&&!lanServer.server?.listening)await lanServer.start();if(lanServer.settings610.autoStart&&!directMobile412.server?.listening&&!lanServer.tls660?.listening)await ensureLocalTLS660();if(directMobile412.config.autoStart&&directMobile412.config.endpoint&&!directMobile412.server?.listening)await directMobile412.start(directMobile412.config.endpoint,true,directMobile412.config.mode||'direct');}catch(error){console.warn('Saved phone connection waiting:',error.message);}finally{reconnecting610=false;}},20000);reconnect610.unref();
 app.on('before-quit',()=>{clearInterval(reconnect610);directMobile412.close(false);lanServer.close(false);});
 if(!lanServer.settings610.autoStart&&directMobile412.config.autoStart&&directMobile412.config.endpoint)directMobile412.start(directMobile412.config.endpoint,true,directMobile412.config.mode||'direct').catch(e=>console.warn('Direct mobile connection not started:',e.message));
 const old=store.load();if(old){const day=new Date().toISOString().slice(0,10),state=JSON.parse(old),hasLegacyPins=(state.users||[]).some(u=>u.pin!==null&&u.pin!==undefined&&u.pin!==''&&!isPinHash(u.pin));if(config.lastDaily!==day&&!hasLegacyPins){try{snapshot(old,'daily');config.lastDaily=day;atomic(configPath,JSON.stringify(config));}catch(error){startupBackupWarning=error.message;console.warn('Daily backup unavailable:',error.message);}}}
 const drafts640=new (require('./invoice-draft-640.cjs').InvoiceDraft640)({dir:dataDir,store,atomic});
 const draftOwner640=()=>{if(!sessionOk())throw Error('سجّل الدخول لاستعادة المسودة');const u=store.readRecord('users',authenticatedUserId);if(!u||!Permissions166.can(u,'inv_create')&&!Permissions166.can(u,'inv_edit'))throw Error('لا توجد صلاحية فاتورة');return String(u.id);};
 sync('invoice-draft640-get',()=>drafts640.get(draftOwner640()));
 sync('invoice-draft640-save',data=>drafts640.save(draftOwner640(),data));
 sync('invoice-draft640-clear',id=>drafts640.clear(draftOwner640(),id));
 sync('db-load',()=>{const snapshot=store.loadSnapshot();return {...snapshot,state:require('./renderer-state-650.cjs').project(snapshot.state,sessionOk())};});
 sync('pin-hash',(pin)=>pinHash(pin));
 sync('pin-verify',(userId,pin,adminOnly=false)=>verifyStoredPin(userId,pin,adminOnly,true));
 sync('recovery-status',()=>{const s=JSON.parse(store.load()||'{}'),u=(s.users||[]).find(u=>String(u.id)===String(adminRecovery.targetUserId()));return {configured:adminRecovery.configured(),needsReissue:adminRecovery.configured()&&!adminRecovery.matchesVerifier650(u?.pin,u?.id)};});
 sync('recovery-issue',(currentPin)=>{
  const check=verifyStoredPin(null,currentPin,true,false);
  if(!check.ok)throw Error(check.lockedMs?'حساب المدير مجمد مؤقتاً':'PIN المدير الحالي غير صحيح.');
  const state=JSON.parse(store.load()||'{}');
  const admin=(state.users||[]).find(u=>String(u.id)===String(check.userId)&&u.role==='admin');
  if(!admin)throw Error('حساب المدير غير موجود');
  const code=adminRecovery.issue(admin.pin,admin.id);
  return {code,warning:'احتفظ بالمفتاح خارج الكمبيوتر. لن يظهر هذا المفتاح مرة أخرى. إصدار مفتاح جديد يُبطل القديم.'};
 });
 sync('recovery-use',(code,newPin)=>{
  const status=pinLimiter.status('admin-recovery');
  if(status.locked)throw Error('تم إيقاف محاولات الاستعادة مؤقتاً.');
  const state=JSON.parse(store.load()||'{}');
  const admin=(state.users||[]).find(u=>String(u.id)===String(adminRecovery.targetUserId())&&u.role==='admin');
  if(!adminRecovery.verify(code,admin?.pin,admin?.id)){
   const next=pinLimiter.fail('admin-recovery');
   throw Error(next.lockedMs?'محاولات خاطئة كثيرة. جرب لاحقاً.':'مفتاح الاستعادة غير صحيح.');
  }
  if(!admin)throw Error('لا يوجد حساب مدير مسجل؛ لا يمكن إنشاء مدير بواسطة الاستعادة.');
  const normalized=require('./security-152.cjs').normalizePin(newPin);
  if(normalized==='1234')throw Error('اختر PIN جديداً غير 1234.');
  admin.pin=pinHash(normalized);admin.pinDefault=false;admin.pinNeedsReset=false;
  // Recovery consumes the existing secret; a fresh key must be issued after login.
  const revision=store.save(JSON.stringify(state),store.revision,{restore:true});
  try{fs.unlinkSync(adminRecovery.file);}catch(error){console.warn('Recovery key file cleanup deferred; it is already invalidated by the PIN verifier binding.',error.message);}
  pinLimiter.success('admin-recovery');pinLimiter.success('admin-security');pinLimiter.success('user:'+admin.id);
  authenticatedUserId=null;sessionExpiresAt=0;
  return {ok:true,revision};
 });
 sync('audit650-page',options=>{const s=JSON.parse(store.load()||'{}'),u=(s.users||[]).find(x=>x.id===authenticatedUserId);if(!sessionOk()||!Permissions166.can(u,'audit_view'))throw Error('لا توجد صلاحية مراجعة السجل');return store.audit650(options);});
 sync('app-info',()=>({name:'الحمد برنت',version:app.getVersion(),backupWarning:startupBackupWarning}));
 sync('db-save',(text,revision)=>{
  const state=JSON.parse(text),existingRaw=store.load();if(state._public650)throw Error('سجّل الدخول لتحميل قاعدة البيانات قبل الحفظ');
  const bootstrap=!existingRaw||store.revision===0;
  if(!bootstrap){
   if(!sessionOk())throw Error('الجلسة غير معتمدة. أدخل PIN المستخدم أولاً ثم أعد العملية.');
   const prior=JSON.parse(existingRaw),user=(prior.users||[]).find(u=>String(u.id)===String(authenticatedUserId));
   require('./commit-660.cjs').validate(prior,state,user,{dataDir});
  }
  // Do not silently retry with the current revision: that used to erase concurrent changes.
  if(bootstrap)require('./permissions-650.js').migrate(state);
  const next=store.save(JSON.stringify(state),revision,{auditDeletion:!bootstrap,priorState:existingRaw});
  if(state.shopSettings?.logo){try{const icon=nativeImage.createFromDataURL(state.shopSettings.logo);if(!icon.isEmpty())win.setIcon(icon);}catch{}}
  if(state.isLocked&&!bootstrap){authenticatedUserId=null;sessionExpiresAt=0;}
  return {revision:next};
 });
 sync('pair-scope650',scope=>{requireAdminSession();if(!['viewer-full','clients-only'].includes(scope))throw Error('نطاق ربط غير صالح');lanServer.settings610.pairScope650=scope;lanServer.persist610();return true;});
 sync('lan-status',()=>lanServer.info(false));
 sync('backup-folder',()=>config.backupFolder||path.join(dataDir,'Backups'));
 sync('snapshot',(text,reason)=>{requireAdminSession();return snapshot(store.load(),reason);});
 sync('print-css',printCSS);
 require('./image-service.cjs').install({ipcMain,app,BrowserWindow,dialog,allowed,store,getWin:()=>win,printCSS,safeTitle,isSessionAuthenticated:(id)=>sessionOk(id)});
 require('./document-clipboard-407.cjs').install({ipcMain,BrowserWindow,clipboard,nativeImage,ClipboardItem,allowed,store,printCSS,isSessionAuthenticated:(id)=>sessionOk(id)});
 sync('resources-list',()=>resources.list());
 sync('resources-config',c=>{requireAdminSession();return resources.saveConfig(c);});
 sync('resources-open',()=>{shell.openPath(resources.base);return resources.base;});
 sync('backup-history',()=>backupHistory());
 sync('compact-db',()=>{requireAdminSession();store.compact();return true;});
 ipcMain.handle('pick-backup',async event=>{allowed(event);requireAdminSession();const r=await dialog.showOpenDialog(win,{title:'اختر مجلد النسخ الاحتياطي',defaultPath:config.backupFolder||app.getPath('documents'),properties:['openDirectory','createDirectory']});if(r.canceled||!r.filePaths?.[0])return null;config.backupFolder=r.filePaths[0];atomic(configPath,JSON.stringify(config));return config.backupFolder;});
 ipcMain.handle('lan-start',async event=>{allowed(event);requireAdminSession();await lanServer.start();await ensureLocalTLS660();return lanServer.info(true);});
 ipcMain.handle('lan-stop',async event=>{allowed(event);requireAdminSession();lanServer.close();return lanServer.info(false);});
 ipcMain.handle('lan-revoke',async event=>{allowed(event);requireAdminSession();lanServer.revokeAll();directMobile412.rotate();return lanServer.info(false);});
 ipcMain.handle('write-backup',async(event,filename,text)=>{
  try{
   allowed(event);if(!sessionOk())throw Error('يجب تسجيل الدخول لإنشاء نسخة احتياطية.');
   // Never trust the renderer's supplied state; save exactly the last committed database snapshot.
   const committed=store.backupState650();if(!committed)throw Error('لا توجد بيانات محفوظة بعد.');
   const dir=config.backupFolder||path.join(dataDir,'Backups');fs.mkdirSync(dir,{recursive:true});
   const safeName='Alhamd-Auto-'+formatStamp12h(new Date())+'-'+crypto.randomBytes(3).toString('hex')+'.alhbak';
   atomic(path.join(dir,safeName),require('./backup-stream-650.cjs').encrypt(committed,{secret:deviceBackupKey}));trimBackups(dir,'Alhamd-Auto-',50);
   startupBackupWarning="";return {ok:true,filename:safeName};
  }catch(e){return {ok:false,err:e.message};}
 });
 function normalizeWhatsAppPhone(raw){
  const ascii=String(raw||'').replace(/[٠-٩]/g,c=>'٠١٢٣٤٥٦٧٨٩'.indexOf(c)).replace(/[۰-۹]/g,c=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(c));
  const egMatch=ascii.match(/(?:0020|\+?20|200|0)?(1[0125]\d{8})/);
  if(egMatch)return '20'+egMatch[1];
  const firstSeg=ascii.split(/[/|,؛;\n]+/)[0]||ascii;
  let d=firstSeg.replace(/\D+/g,'');
  if(!d)return '';
  while(d.startsWith('00'))d=d.slice(2);
  if(d.startsWith('2001')&&d.length===13)d='20'+d.slice(3);
  if(d.startsWith('01')&&d.length===11)d='20'+d.slice(1);
  else if(d.length===10&&/^1[0125]\d{8}$/.test(d))d='20'+d;
  else if(d.startsWith('0')&&(d.length===9||d.length===10))d='20'+d.slice(1);
  return /^\d{10,15}$/.test(d)?d:'';
 }
 ipcMain.handle('open-whatsapp',async(event,payload)=>{try{allowed(event);if(!sessionOk())throw Error('افتح البرنامج أولًا');return await require('./whatsapp-407.cjs').open(shell,normalizeWhatsAppPhone,payload);}catch(e){return {ok:false,error:e.message};}});
 ipcMain.handle('save-excel',async(event,payload)=>{if(excelBusy)return {ok:false,error:'انتظر انتهاء حفظ Excel الحالي'};try{allowed(event);const state=JSON.parse(store.load()||'{}'),user=(state.users||[]).find(u=>u.id===state.currentUser);if(state.isLocked||!user||!sessionOk(user.id)||user.role!=='admin'&&user.perms?.export===false)throw Error('ليست لديك صلاحية التصدير أو انتهت جلسة الدخول');excelBusy=true;const name=String(payload.title||'تقرير').replace(/[<>:"/\\|?*\x00-\x1f]/g,'_').slice(0,100)+'.xlsx';let target;if(process.env.ALHAMD_QA_XLSX&&!app.isPackaged){target=path.join(process.env.ALHAMD_QA_XLSX,name);}else{const pick=await dialog.showSaveDialog(win,{title:'حفظ ملف Excel',defaultPath:path.join(app.getPath('documents'),name),filters:[{name:'ملف Excel',extensions:['xlsx']}]});if(pick.canceled||!pick.filePath)return {ok:false,canceled:true};target=pick.filePath;}if(!target.toLowerCase().endsWith('.xlsx'))target+='.xlsx';const bytes=await createExcel(payload),tmp=target+'.tmp';fs.writeFileSync(tmp,bytes);fs.renameSync(tmp,target);return {ok:true,path:target};}catch(e){return {ok:false,error:e.message};}finally{excelBusy=false;}});
 ipcMain.handle('save-pdf',async(event,payload)=>{
  let target;if(pdfBusy)return {ok:false,error:'انتظر انتهاء حفظ الملف الحالي'};
  try{allowed(event);const state=JSON.parse(store.load()||'{}'),user=(state.users||[]).find(u=>u.id===state.currentUser);if(state.isLocked||!user||!sessionOk(user.id))throw Error('افتح قفل البرنامج وتحقق من PIN أولاً');
   const kind=payload?.kind;if(!['invoice','purchase-request','work-sheet','ops_paper','statement-client','statement-supplier','report','shortcut-guide'].includes(kind))throw Error('نوع مستند غير صالح');
   const key=(kind==='invoice'||kind==='purchase-request'||kind==='work-sheet'||kind==='ops_paper')?'inv_print':kind==='statement-client'?'cli_statement':kind==='statement-supplier'?'sup_statement':'export';
   if(user.role!=='admin'&&user.perms?.[key]===false)throw Error('ليست لديك صلاحية حفظ هذا المستند');
   pdfBusy=true;
   const name=safeTitle(payload.title,'تقرير')+'.pdf';
   // QA redirects only in an unpackaged build; packaged releases always show a save dialog.
   if(process.env.ALHAMD_QA_PDF && !app.isPackaged){target=path.join(process.env.ALHAMD_QA_PDF,name);}else{const pick=await dialog.showSaveDialog(win,{title:'حفظ ملف PDF',defaultPath:path.join(app.getPath('documents'),name),filters:[{name:'ملف PDF',extensions:['pdf']}]});if(pick.canceled||!pick.filePath)return {ok:false,canceled:true};target=pick.filePath;}
   if(!target.toLowerCase().endsWith('.pdf'))target+='.pdf';
   const bytes=await renderPDF(BrowserWindow,payload,printCSS());const tmp=target+'.tmp';fs.writeFileSync(tmp,bytes);fs.renameSync(tmp,target);return {ok:true,path:target,bytes:bytes.length};
  }catch(e){return {ok:false,error:e.message};}finally{pdfBusy=false;}
 });
 win=new BrowserWindow({width:1400,height:920,minWidth:800,minHeight:500,show:false,title:'الحمد برنت',icon:path.join(__dirname,'assets/icon.png'),backgroundColor:'#0f172a',webPreferences:{preload:path.join(__dirname,'preload.cjs'),nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true,allowRunningInsecureContent:false,webviewTag:false,devTools:!app.isPackaged,spellcheck:false}});
 win.webContents.session.setPermissionRequestHandler((_webContents,_permission,callback)=>callback(false));
 win.webContents.session.setPermissionCheckHandler(()=>false);
 win.webContents.on('will-navigate',(event,url)=>{if(url!==APP_URL)event.preventDefault();});
 win.webContents.on('will-redirect',(event,url)=>{if(url!==APP_URL)event.preventDefault();});
 win.webContents.on('will-attach-webview',event=>event.preventDefault());
 win.webContents.session.webRequest.onBeforeRequest((details,callback)=>callback({cancel:/^https?:/i.test(details.url)}));
 win.webContents.session.webRequest.onHeadersReceived((details,callback)=>{const headers={...(details.responseHeaders||{})};if(details.url===APP_URL){headers['Content-Security-Policy']=["default-src 'self' data: blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-src 'none'"];headers['X-Content-Type-Options']=['nosniff'];headers['Referrer-Policy']=['no-referrer'];headers['X-Frame-Options']=['DENY'];}callback({responseHeaders:headers});});
 win.webContents.setWindowOpenHandler(({url})=>url==='about:blank'||url===''?{action:'allow',overrideBrowserWindowOptions:{width:1000,height:800,webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true,devTools:!app.isPackaged,webviewTag:false,preload:undefined}}}:{action:'deny'});
 win.webContents.on('did-create-window',child=>{child.webContents.on('will-navigate',(event,url)=>{if(url!=='about:blank')event.preventDefault();});});
 win.webContents.on('render-process-gone',()=>dialog.showErrorBox('توقف عرض البرنامج','البيانات المحفوظة موجودة. أغلق البرنامج وافتحه مجدداً.'));
 const dispatch150=action=>win.webContents.executeJavaScript('window.App150?.dispatch('+JSON.stringify(action)+')');
 let lastZoom150=0;
 const zoom150=action=>{if(action==='fullscreen')return win.setFullScreen(!win.isFullScreen());if(action==='reset'){win.webContents.setZoomFactor(1);return;}if(Date.now()-lastZoom150<60)return;lastZoom150=Date.now();win.webContents.setZoomFactor(Math.max(.5,Math.min(2.5,Math.round((win.webContents.getZoomFactor()+(action==='in'?.1:-.1))*100)/100)));};
 ipcMain.on('zoom150',(event,action)=>{allowed(event);zoom150(action);});
 require('./shortcuts-151.cjs').install({ipcMain,allowed,store,getWin:()=>win});
 Menu.setApplicationMenu(Menu.buildFromTemplate([
 {label:'ملف',submenu:[{label:'فاتورة جديدة',click:()=>dispatch150('newInvoice')},{label:'حفظ',click:()=>dispatch150('save')},{label:'حفظ PDF',click:()=>dispatch150('pdf')},{label:'تصدير صورة PNG / JPG',click:()=>dispatch150('image')},{label:'طباعة',click:()=>dispatch150('print')},{label:'فتح مجلد الخطوط والشعار',click:()=>shell.openPath(resources.base)},{label:'فتح مجلد البيانات',click:()=>shell.openPath(dataDir)},{role:'quit',label:'خروج'}]},
 {label:'تحرير',submenu:[{role:'undo',label:'تراجع'},{role:'redo',label:'إعادة'},{role:'cut',label:'قص'},{role:'copy',label:'نسخ'},{role:'paste',label:'لصق'},{role:'selectAll',label:'تحديد الكل'}]},
 {label:'عرض',submenu:[{label:'تكبير',click:()=>zoom150('in')},{label:'تصغير',click:()=>zoom150('out')},{label:'الحجم الطبيعي',click:()=>zoom150('reset')},{label:'ملء الشاشة',click:()=>zoom150('fullscreen')}]},
 {label:'مساعدة',submenu:[{label:'دليل اختصارات لوحة المفاتيح',click:()=>dispatch150('guide')},{label:'تخصيص الاختصارات',click:()=>win.webContents.executeJavaScript('window.App150?.shortcutSettings()')},{label:'حول البرنامج',click:()=>win.webContents.executeJavaScript('window.openAboutProgram?.()')},{label:'سلامة البيانات وسجل العمليات',click:()=>win.webContents.executeJavaScript('window.showReviewCenter?.()')}]}]));
 win.webContents.on('zoom-changed',(event,direction)=>{event.preventDefault();zoom150(direction==='in'?'in':'out');});
 const logFailure=(kind,detail)=>{try{fs.appendFileSync(path.join(dataDir,'startup.log'),new Date().toISOString()+' '+kind+' '+String(detail)+'\n');}catch{}};
 win.webContents.on('preload-error',(_e,_p,error)=>logFailure('preload',error.stack||error.message));
 win.webContents.on('did-fail-load',(_e,code,desc,url,isMain)=>{if(isMain){logFailure('load',code+' '+desc);dialog.showErrorBox('تعذر تحميل واجهة البرنامج',desc+'\nبياناتك محفوظة. أغلق البرنامج وأعد تشغيله.');}});
 if(process.env.ALHAMD_QA_DATA&&!app.isPackaged){win.webContents.on('console-message',(_e,...args)=>logFailure('console',JSON.stringify(args)));win.webContents.on('did-finish-load',()=>setTimeout(async()=>{try{if(process.env.ALHAMD_QA_SCENARIO){const result=await win.webContents.executeJavaScript(fs.readFileSync(process.env.ALHAMD_QA_SCENARIO_FILE||path.join(__dirname,'../tests/ui-scenario.js'),'utf8'));fs.writeFileSync(path.join(dataDir,'qa-scenario.json'),JSON.stringify(result));}const report=await win.webContents.executeJavaScript(`JSON.stringify({api:typeof window.api,update:typeof updateAllUI,state:typeof appState==='object',body:document.body.innerText.slice(0,250),error:window.__startupError||null})`);fs.writeFileSync(path.join(dataDir,'qa-ui.json'),report);const image=await win.webContents.capturePage();fs.writeFileSync(path.join(dataDir,'qa-ui.png'),image.toPNG());}catch(e){logFailure('qa',e.stack);}finally{if(process.env.ALHAMD_QA_EXIT)app.quit();}},2500));}
 win.once('ready-to-show' ,()=>{win.show();if(process.env.ALHAMD_QA_DATA&&!app.isPackaged&&process.env.ALHAMD_QA_WIDTH){win.setMinimumSize(320,240);win.setSize(Math.max(320,Number(process.env.ALHAMD_QA_WIDTH)||1000),Math.max(240,Number(process.env.ALHAMD_QA_HEIGHT)||680));win.webContents.setZoomFactor(Number(process.env.ALHAMD_QA_ZOOM)||1);}else win.maximize();});win.loadURL(APP_URL).catch(e=>{try{fs.appendFileSync(path.join(dataDir,'startup.log'),new Date().toISOString()+' '+e.stack+'\n');}catch{}});
}
app.on('window-all-closed',()=>app.quit());app.on('will-quit',()=>{if(lanServer)lanServer.close(false);if(store)store.close();app.exit(0);});
