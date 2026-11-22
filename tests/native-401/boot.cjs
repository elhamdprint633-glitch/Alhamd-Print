'use strict';
if(!process.env.ALHAMD_QA_DATA)throw Error('Set ALHAMD_QA_DATA to a fresh isolated test folder');
const {app,BrowserWindow}=require('electron'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),resultFile=process.env.ALHAMD401_RESULT;
if(!resultFile)throw Error('Set ALHAMD401_RESULT');
app.getVersion=()=>require(path.join(root,'package.json')).version;
const errors=[];
app.on('browser-window-created',(_,w)=>w.webContents.on('console-message',(...args)=>{
 const detail=args.find(x=>typeof x?.message==='string');
 if(detail?.level==='error'){errors.push(detail.message);console.error('RENDER_ERROR',detail.message);}
}));
require(path.join(root,'app/main.cjs'));
let busy=false;
const timer=setInterval(async()=>{
 if(busy)return;
 const w=BrowserWindow.getAllWindows().find(x=>x.webContents.getURL()==='alhamd-print://app/index.html');
 if(!w||w.webContents.isLoading())return;
 busy=true;clearInterval(timer);
 try{
  await new Promise(resolve=>setTimeout(resolve,400));
  const scenario=fs.readFileSync(process.env.ALHAMD401_SCENARIO||path.join(__dirname,'scenario.js'),'utf8');
  const result=await w.webContents.executeJavaScript(scenario);
  await new Promise(resolve=>setTimeout(resolve,300));
  if(errors.length)throw Error(errors.join('\n'));
  fs.writeFileSync(resultFile,JSON.stringify({...result,rendererErrors:errors},null,2));
  fs.writeFileSync(resultFile+'.png',(await w.webContents.capturePage()).toPNG());
  console.log('QA_PASS',JSON.stringify(result));app.exit(0);
 }catch(error){console.error('QA_FAIL',error.stack);app.exit(1);}
},100);
setTimeout(()=>{console.error('QA_TIMEOUT');app.exit(2);},120000).unref();
