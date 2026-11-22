if(!process.env.ALHAMD_QA_DATA)throw Error('Set ALHAMD_QA_DATA to an isolated test directory');
const {app,BrowserWindow}=require('electron');const fs=require('fs');
const root=process.env.ALHAMD148_SOURCE||require('node:path').resolve(__dirname,'../..');
app.getVersion=()=> '1.5.0';
app.on('browser-window-created',(_,w)=>{w.webContents.on('console-message',(...a)=>{const d=a.find(x=>typeof x?.message==='string');if(d?.level==='error')console.log('RENDER_ERROR',d.message);});});
require(root+'/app/main.cjs');
let busy=false;const timer=setInterval(async()=>{if(busy)return;const w=BrowserWindow.getAllWindows().find(x=>x.webContents.getURL()==='alhamd-print://app/index.html');if(!w||w.webContents.isLoading())return;busy=true;clearInterval(timer);try{await new Promise(r=>setTimeout(r,250));const result=await w.webContents.executeJavaScript(fs.readFileSync(process.env.ALHAMD148_SCENARIO,'utf8'));fs.writeFileSync(process.env.ALHAMD148_RESULT,JSON.stringify(result,null,2));console.log('QA_PASS',JSON.stringify(result));await new Promise(r=>setTimeout(r,500));const shot=await w.webContents.capturePage();fs.writeFileSync(process.env.ALHAMD148_RESULT+'.png',shot.toPNG());app.exit(0);}catch(e){console.log('QA_FAIL',e.stack);app.exit(1)}},100);
setTimeout(()=>{console.log('TIMEOUT',BrowserWindow.getAllWindows().map(w=>w.webContents.getURL()));app.exit(2)},120000).unref();
