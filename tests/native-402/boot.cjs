'use strict';
const {app,BrowserWindow,dialog,safeStorage,shell}=require('electron'),fs=require('node:fs'),path=require('node:path');
if(!process.env.ALHAMD_QA_DATA||!process.env.ALHAMD402_RESULT)throw Error('Use isolated ALHAMD_QA_DATA and ALHAMD402_RESULT paths');
const root=path.resolve(__dirname,'../..'),resultFile=process.env.ALHAMD402_RESULT,dir=process.env.ALHAMD_QA_DATA;
fs.mkdirSync(dir,{recursive:true});
// Only the test bootstrap supplies this key-store shim; it is never loaded by the application.
// It verifies backup IPC/UI on Linux. Windows DPAPI itself still requires Windows acceptance testing.
safeStorage.isEncryptionAvailable=()=>true;
safeStorage.encryptString=value=>Buffer.from(value,'utf8');
safeStorage.decryptString=value=>value.toString('utf8');
app.getVersion=()=>require(path.join(root,'package.json')).version;
const zipFile=path.join(dir,'native-backup.zip'),design=path.join(dir,'design.pdf');fs.writeFileSync(design,'%PDF native backup fixture');
dialog.showSaveDialog=async()=>({canceled:false,filePath:zipFile});
dialog.showOpenDialog=async(_window,options)=>({canceled:false,filePaths:options.title.includes('التصميم')?[design]:[zipFile]});
shell.showItemInFolder=()=>{};
const errors=[];let reloaded=false,phase=process.env.ALHAMD402_REOPEN?'reopen':'initial',working=false,initial;
if(process.env.ALHAMD402_REOPEN){const blocked=path.join(dir,'not-a-directory');fs.writeFileSync(blocked,'test blocked backup location');fs.writeFileSync(path.join(dir,'desktop-config.json'),JSON.stringify({backupFolder:blocked,lastDaily:'2000-01-01'}));}
app.on('browser-window-created',(_,w)=>{
 w.webContents.on('console-message',(...args)=>{const d=args.find(x=>typeof x?.message==='string');if(d?.level==='error'){errors.push(d.message);console.error('RENDER_ERROR',d.message);}});
 w.webContents.on('did-finish-load',()=>{if(phase==='await-restore')reloaded=true;});
});
require(path.join(root,'app/main.cjs'));
const timer=setInterval(async()=>{
 if(working)return;
 const w=BrowserWindow.getAllWindows().find(w=>w.webContents.getURL()==='alhamd-print://app/index.html');
 if(!w||w.webContents.isLoading())return;
 if(phase==='await-restore'&&!reloaded)return;
 working=true;
 try{
  await new Promise(resolve=>setTimeout(resolve,350));
  if(phase==='initial'){
   initial=await w.webContents.executeJavaScript(fs.readFileSync(path.join(__dirname,'scenario.js'),'utf8'));
   phase='await-restore';
   // Trigger the real PIN modal. The successful restore reloads the renderer.
   await w.webContents.executeJavaScript("gid('secPinInput').value='1234';confirmSecurityPinModal();true");
  }else{
   const restored=await w.webContents.executeJavaScript(`(async()=>{if(!window.__stateReady||window.__startupError||!appState.isLocked)throw Error('restored startup invalid');if(appState.orders[0]?.total!==100)throw Error('restored invoice incorrect');if(appState.orders[0].attachments149.length!==2)throw Error('restored attachments missing');if(getClientBalance('c')!==100)throw Error('restored balance incorrect');return {locked:appState.isLocked,invoiceTotal:appState.orders[0].total,attachments:appState.orders[0].attachments149.length};})()`);
   if(errors.length)throw Error(errors.join('\n'));
   let warningCheck;
   if(process.env.ALHAMD402_REOPEN)warningCheck=await w.webContents.executeJavaScript(`(async()=>{const warning=api.appInfo().backupWarning;if(!warning||!gid('backupStartupWarning402'))throw Error('missing backup startup warning');gid('lockPinInput').value='1234';await unlockSystem();if(appState.isLocked)throw Error('backup directory failure prevented login');return {loginSucceeded:true,backupWarningVisible:true};})()`);
   const result={result:'passed',version:app.getVersion(),...warningCheck,...initial,restored,rendererErrors:errors,zipBytes:fs.statSync(zipFile).size,windowsDPAPITested:false};
   fs.writeFileSync(resultFile,JSON.stringify(result,null,2));
   console.log('QA_PASS',JSON.stringify(result));clearInterval(timer);app.exit(0);
  }
 }catch(error){console.error('QA_FAIL',error.stack);clearInterval(timer);app.exit(1);}
 finally{working=false;}
},150);
setTimeout(()=>{console.error('QA_TIMEOUT',phase);app.exit(2);},120000).unref();
