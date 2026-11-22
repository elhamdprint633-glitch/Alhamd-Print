'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),https=require('node:https');
const Tail=require('../app/tailscale-mobile413.cjs');
test('Tailscale uses exactly its IPv4 range and never accepts arbitrary public peers',()=>{
 for(const ip of ['100.64.0.1','100.100.100.100','100.127.255.254'])assert(Tail.isTailscaleIP(ip));
 for(const ip of ['100.63.255.255','100.128.0.1','100.064.1.1','8.8.8.8','127.0.0.1','100.100.100.999'])assert(!Tail.isTailscaleIP(ip));
 for(const ip of ['::ffff:100.100.100.100','192.168.1.5','10.0.0.5','127.0.0.1'])assert(Tail.allowsPeer(ip));
 for(const ip of ['8.8.8.8','203.0.113.1','100.128.1.1'])assert(!Tail.allowsPeer(ip));
});
test('Tailscale status invokes only the installed CLI and returns no account or peer secrets',async()=>{
 let invoked;const info=await Tail.status({platform:'win32',env:{ProgramFiles:'C:\\Program Files'},exists:()=>true,execute:async(...args)=>{invoked=args;return {stdout:JSON.stringify({BackendState:'Running',TailscaleIPs:['100.101.102.103','fd7a::1'],Self:{Online:true},User:{private:'SECRET_ACCOUNT'},Peer:{secret:'SECRET_PEER'}})};}});
 assert(info.running);assert.equal(info.ip,'100.101.102.103');assert.deepEqual(invoked[1],['status','--json']);assert.equal(invoked[2].windowsHide,true);assert(!JSON.stringify(info).includes('SECRET'));
 const none=await Tail.status({exists:()=>false});assert.equal(none.installed,false);
 const failed=await Tail.status({exists:()=>true,execute:async()=>{throw Error('daemon unavailable');}});assert.equal(failed.running,false);assert.equal(failed.state,'Unavailable');
});
test('Tailscale HTTPS pairs and reads only; mode persists and ordinary Internet addresses are rejected',async()=>{
 const {DirectMobile412}=require('../app/direct-mobile412.cjs'),{LanSyncServer}=require('../app/lan-sync-server.cjs');const dir=fs.mkdtempSync(path.join(os.tmpdir(),'tailscale413-'));
 const raw=JSON.stringify({clients:[],suppliers:[],items:[],orders:[],treasury:[],users:[{id:'a',pin:'SECRET',role:'admin'}]}),store={revision:3,load:()=>raw};const lan=new LanSyncServer({dataDir:dir,store,appDir:path.resolve(__dirname,'../app'),port:0}),safeStorage={isEncryptionAvailable:()=>true,encryptString:s=>Buffer.from(s),decryptString:b=>b.toString()},server=new DirectMobile412({dataDir:dir,lan,safeStorage,port:0});
 try{
  await assert.rejects(()=>server.start('https://203.0.113.1:47822',true,'tailscale'));
  lan.settings610.pairScope650='viewer-full';const info=await server.start('https://100.100.100.100:47822',true,'tailscale');assert.equal(info.requiresPublicIP,false);assert.equal(info.mode,'tailscale');
  function req(p,method='GET',body,cookie){return new Promise((resolve,reject)=>{const data=body?Buffer.from(JSON.stringify(body)):null;const r=https.request({host:'127.0.0.1',port:server.port,path:p,method,ca:server.identity.cert,checkServerIdentity:()=>undefined,headers:{Host:'100.100.100.100:47822',Origin:'https://100.100.100.100:47822',Connection:'close',...(cookie?{Cookie:cookie}:{}),...(data?{'Content-Length':data.length,'Content-Type':'application/json'}:{})}},res=>{const b=[];res.on('data',x=>b.push(x));res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body:JSON.parse(Buffer.concat(b))}));});r.on('error',reject);r.end(data);});}
  const p=await req('/api/pair','POST',{code:info.pairCode,scope:'viewer-full'});assert.equal(p.status,200);const cookie=p.headers['set-cookie'][0].split(';')[0];const data=await req('/api/viewer-state?since=-1','GET',null,cookie);assert.equal(data.body.readOnly,true);assert.equal(data.body.serverId,lan.serverId);assert(!JSON.stringify(data.body).includes('SECRET'));
  assert.equal((await req('/api/state','GET',null,cookie)).status,403);assert.equal((await req('/api/viewer-state','POST',{total:0},cookie)).status,403);assert.equal(store.load(),raw);
  server.close(false);const reopened=new DirectMobile412({dataDir:dir,lan,safeStorage,port:0});assert.equal(reopened.config.mode,'tailscale');assert.equal(reopened.config.autoStart,true);reopened.close(false);
 }finally{server.close(false);lan.close();fs.rmSync(dir,{recursive:true,force:true});}
});
