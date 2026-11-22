const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {merge}=require('../app/lan-state-merge.js');
const {Store}=require('../app/store.cjs');

test('three-way sync merges independent records and settings without dropping either device',()=>{
 const base={users:[{id:'u1',name:'المدير'}],orders:[{id:'o1',total:100}],clients:[{id:'c1',name:'عميل',phone:'010'}],serviceCategories:['عام']};
 const local=structuredClone(base);local.orders.push({id:'o2',total:40});local.clients[0].phone='011';local.serviceCategories.push('تصميم');
 const remote=structuredClone(base);remote.orders.push({id:'o3',total:60});remote.clients.push({id:'c2',name:'عميل جديد',phone:'012'});remote.serviceCategories.push('طباعة');
 const result=merge(base,local,remote);assert.deepEqual(result.conflicts,[]);assert.deepEqual(result.state.orders.map(x=>x.id),['o1','o3','o2']);assert.equal(result.state.clients[0].phone,'011');assert.equal(result.state.clients[1].id,'c2');assert.deepEqual(new Set(result.state.serviceCategories),new Set(['عام','تصميم','طباعة']));
});

test('three-way sync reports overlapping edits instead of overwriting financial data',()=>{
 const base={orders:[{id:'o1',total:100,paid:20}],items:[{id:'i1',qty:10}]};const local=structuredClone(base),remote=structuredClone(base);local.orders[0].total=90;remote.orders[0].total=80;local.items[0].qty=8;remote.items[0].qty=7;const result=merge(base,local,remote);assert.equal(result.conflicts.length,2);assert.equal(result.state.orders[0].total,90);
});

test('database revision rejects a stale device write and preserves the committed version',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'alhamd-sync-'));const db=new Store(path.join(dir,'data.sqlite'));const initial={users:[{id:'u1'}],orders:[{id:'o1',total:100}]};assert.equal(db.save(JSON.stringify(initial),0),1);const changed={...initial,orders:[{id:'o1',total:80}]};assert.equal(db.save(JSON.stringify(changed),1),2);assert.throws(()=>db.save(JSON.stringify(initial),1),e=>e.code==='SYNC_CONFLICT'&&e.revision===2);assert.equal(db.revision,2);assert.deepEqual(JSON.parse(db.load()),changed);db.close();fs.rmSync(dir,{recursive:true});
});


test('LAN write origin rejects DNS-rebinding hostnames even when Origin matches Host',()=>{
 const {LanSyncServer}=require('../app/lan-sync-server.cjs');
 const server=new LanSyncServer({appDir:process.cwd(),dataDir:os.tmpdir(),store:{}});
 server.port=47821;
 assert.equal(server.sameOriginWrite({headers:{origin:'http://evil.example:47821',host:'evil.example:47821'}}),false);
 assert.equal(server.sameOriginWrite({headers:{origin:'http://127.0.0.1:47821',host:'127.0.0.1:47821'}}),true);
});

test('paired phone sees only whitelisted customer information; every financial write endpoint is forbidden',async()=>{
 const {LanSyncServer}=require('../app/lan-sync-server.cjs');
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'alhamd-lan-readonly-')),appDir=path.resolve(__dirname,'../app'),store=new Store(path.join(dir,'data.sqlite'));
 const initial={users:[{id:'u1',role:'admin',pin:'HIDDEN_SECRET'}],orders:[{id:'o1',clientId:'c1',total:125,paid:20,costSnapshot149:[{unitCost:3}],lines:[{desc:'printing',qty:4,price:10,internalNotes:'TOP_SECRET_NOTES'}]}],clients:[{id:'c1',name:'Client A',phone:'010',initialBalance:0}],items:[],treasury:[{id:'deposit-o1',orderId:'o1',kind:'deposit',type:'collection',inAmount:20,outAmount:0}],purchases:[],suppliers:[{id:'s1',name:'Supplier Sensitive'}],currentUser:'u1',isLocked:true};
 store.save(JSON.stringify(initial));
 const server=new LanSyncServer({appDir,dataDir:dir,store,port:0});
 try{
  const info=await server.start(),base=`http://127.0.0.1:${info.port}`;
  let r=await fetch(base+'/api/state');assert.equal(r.status,401);
  r=await fetch(base+'/api/pair',{method:'POST',headers:{'Content-Type':'application/json','Origin':base},body:JSON.stringify({code:info.pairCode,name:'mobile test'})});assert.equal(r.status,200);
  const cookie=String(r.headers.get('set-cookie')).split(';')[0],headers={Cookie:cookie},writer={...headers,Origin:base,'Content-Type':'application/json'};
  r=await fetch(base+'/api/state',{headers});assert.equal(r.status,200);let safe=await r.json();
  assert.equal(safe.orders.length,1);assert.equal(safe.clients[0].name,'Client A');assert.equal(safe.users,undefined);assert.equal(safe.suppliers,undefined);assert.equal(safe.orders[0].costSnapshot149,undefined);assert.equal(safe.orders[0].lines[0].internalNotes,undefined);
  assert.doesNotMatch(JSON.stringify(safe),/HIDDEN_SECRET|Supplier Sensitive|TOP_SECRET_NOTES/);
  for(const [method,url] of [['PUT','/api/state'],['POST','/api/pin-verify'],['POST','/api/pin-hash'],['GET','/api/backup'],['POST','/api/backup']]){
   const response=await fetch(base+url,{method,headers:method==='GET'?headers:writer,...(method==='GET'?{}:{body:'{}'})});assert.equal(response.status,403,method+' '+url);
  }
  r=await fetch(base+'/app/index.html?lan=1',{headers});assert.equal(r.status,200);const page=await r.text();assert.match(page,/للعرض فقط/);assert.doesNotMatch(page,/window\.__LAN_BOOT_STATE=/);
  assert.equal(store.revision,1);assert.deepEqual(JSON.parse(store.load()),initial);
 }finally{server.close();store.close();fs.rmSync(dir,{recursive:true,force:true});}
});

test('offline phone export is AES-GCM password encrypted and tamper evident, no PIN or supplier data',async()=>{
 const crypto=require('node:crypto');const {LanSyncServer}=require('../app/lan-sync-server.cjs');
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'alhamd-offline-')),store=new Store(path.join(dir,'state.sqlite'));
 const initial={users:[{id:'u1',role:'admin',pin:'SECRET_PIN_XY'}],orders:[{id:'o1',clientId:'c1',total:900,paid:25}],clients:[{id:'c1',name:'ConfidentialCustomer',phone:'011'}],items:[],treasury:[],suppliers:[{id:'s1',name:'SecretSupplier'}]};
 store.save(JSON.stringify(initial));const server=new LanSyncServer({appDir:path.resolve(__dirname,'../app'),dataDir:dir,store,port:0});
 try{
  const info=await server.start(),base=`http://127.0.0.1:${info.port}`;
  let r=await fetch(base+'/api/pair',{method:'POST',headers:{'Content-Type':'application/json',Origin:base},body:JSON.stringify({code:info.pairCode})});assert.equal(r.status,200);
  const cookie=String(r.headers.get('set-cookie')).split(';')[0],password='test-long-password-2026';
  r=await fetch(base+'/api/offline-export',{method:'POST',headers:{Origin:base,'Content-Type':'application/json',Cookie:cookie},body:JSON.stringify({passphrase:password})});assert.equal(r.status,200);
  const sealed=await r.json(),serialized=JSON.stringify(sealed);
  assert.equal(sealed.magic,'ALHAMD-MOBILE-SEALED-1');assert.doesNotMatch(serialized,/ConfidentialCustomer|SECRET_PIN_XY|SecretSupplier/);
  const key=crypto.pbkdf2Sync(password,Buffer.from(sealed.salt,'base64'),sealed.iterations,32,'sha256');
  const encrypted=Buffer.from(sealed.ciphertext,'base64'),dec=crypto.createDecipheriv('aes-256-gcm',key,Buffer.from(sealed.iv,'base64'));
  dec.setAuthTag(encrypted.subarray(-16));const result=JSON.parse(Buffer.concat([dec.update(encrypted.subarray(0,-16)),dec.final()]).toString());
  assert.equal(result.clients[0].name,'ConfidentialCustomer');assert.equal(result.orders[0].total,900);assert.equal(result.users,undefined);
  const forged=Buffer.from(encrypted);forged[3]^=1;const damaged=crypto.createDecipheriv('aes-256-gcm',key,Buffer.from(sealed.iv,'base64'));damaged.setAuthTag(forged.subarray(-16));assert.throws(()=>{damaged.update(forged.subarray(0,-16));damaged.final()});
 }finally{server.close();store.close();fs.rmSync(dir,{recursive:true,force:true});}
});
