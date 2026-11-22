'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto');
const Finance=require('../app/financial-integrity-166.cjs');
const Crypto=require('../app/backup-crypto-166.cjs');
const {AdminRecovery}=require('../app/admin-recovery.cjs');
const {Store}=require('../app/store.cjs');
const Perms=require('../app/server-permissions-166.cjs');
const base=()=>({users:[{id:'u1',role:'admin'}],currentUser:'u1',isLocked:false,clients:[{id:'c1',name:'أحمد'}],suppliers:[{id:'s1',name:'مورد'}],items:[{id:'i1',qty:25.1234,buyPrice:4.5,avgCost166:4.125}],orders:[{id:'o1',clientId:'c1',total:100,paid:40,lines:[{desc:'طباعة',qty:2,price:50,itemId:'i1'}]}],purchases:[{id:'p1',supplierId:'s1',itemId:'i1',qty:2.1234,unitPrice:10,total:21.23,paid:11.23,due:10}],treasury:[{id:'t1',type:'collection',clientId:'c1',orderId:'o1',inAmount:10,outAmount:0}],adjustments:[],services:[],quotes:[],reservations149:[],stockAdjustments153:[]});
const cloned=s=>JSON.parse(JSON.stringify(s));
test('accounting persistence accepts coherent 4-decimal inventory and linked records',()=>{
 assert.equal(Finance.validate(base()),true);
});
test('accounting persistence rejects nonfinite or negative amounts and invalid quantities',()=>{
 const s=base(),alter=(fn)=>{const b=cloned(s);fn(b);assert.throws(()=>Finance.validate(b));};
 alter(b=>b.orders[0].total=-100);alter(b=>b.orders[0].total='NaN');alter(b=>b.orders[0].paid=200);
 alter(b=>b.items[0].qty=-1);alter(b=>b.items[0].qty=1.123456);
 alter(b=>b.purchases[0].qty=1.000001);alter(b=>b.purchases[0].total=30);alter(b=>b.purchases[0].due=90);
 alter(b=>b.treasury[0].outAmount=3);alter(b=>b.treasury[0].inAmount=-1);
 alter(b=>b.stockAdjustments153=[{id:'sc1',itemId:'i1',bookQty:5,actualQty:7,deltaQty:3,unitCost:5,valueDelta:15}]);
});
test('accounting persistence rejects broken customer, material, supplier and treasury foreign keys',()=>{
 const arr=[b=>b.orders[0].clientId='missing',b=>b.orders[0].lines[0].itemId='missing',b=>b.purchases[0].supplierId='missing',b=>b.purchases[0].itemId='missing',b=>b.treasury[0].orderId='missing',b=>b.treasury[0].clientId='missing'];
 for(const change of arr){const b=base();change(b);assert.throws(()=>Finance.validate(b));}
});
test('invalid accounting save is atomic and leaves prior committed data unchanged',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'alhamd-166-')),store=new Store(path.join(dir,'data.sqlite'));
 try{const s=base();store.save(JSON.stringify(s));const original=store.load(),revision=store.revision;for(const breakIt of [b=>b.items[0].qty=22.123456,b=>b.orders[0].total=-1,b=>b.treasury[0].orderId='no-record']){const corrupted=cloned(s);breakIt(corrupted);assert.throws(()=>store.save(JSON.stringify(corrupted),revision));assert.equal(store.load(),original);assert.equal(store.revision,revision);}}
 finally{store.close();fs.rmSync(dir,{recursive:true,force:true});}
});
test('financial deletion snapshots are recorded immutably even if renderer supplies an empty audit',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'alhamd-audit-')),store=new Store(path.join(dir,'data.sqlite'));
 try{
  const s=base();store.save(JSON.stringify(s));const next=cloned(s);next.orders=[];next.treasury=[];next.purchases=[];next.auditTrail166=[];
  store.save(JSON.stringify(next),store.revision,{auditDeletion:true});const saved=JSON.parse(store.load());
  assert.equal(saved.auditTrail166.length,3);assert.deepEqual(new Set(saved.auditTrail166.map(x=>x.collection)),new Set(['orders','treasury','purchases']));
  const further=cloned(saved);further.auditTrail166=[];store.save(JSON.stringify(further),store.revision,{auditDeletion:true});
  assert.equal(JSON.parse(store.load()).auditTrail166.length,3);
 }finally{store.close();fs.rmSync(dir,{recursive:true,force:true});}
});
test('employee permission check is enforced at storage boundary independent of hidden UI buttons',()=>{
 const s=base(),user={id:'x',role:'staff',perms:{inv_create:true,inv_edit:false,sets_shop:false,cli_add:true,stock_adjust:false}};
 const forbid=fn=>{const next=cloned(s);fn(next);assert.throws(()=>Perms.assertChanges(s,next,user));};
 forbid(n=>n.shopSettings={name:'غير مصرح'});forbid(n=>n.users.push({id:'u2',role:'admin'}));forbid(n=>n.orders[0].total=300);
 const allowed=cloned(s);allowed.orders.push({id:'o2',clientId:'c1',total:12,paid:0});assert.equal(Perms.assertChanges(s,allowed,user),true);
 const cheating=cloned(s);cheating.orders.push({id:'o2',clientId:'c1',total:12,paid:0});cheating.items[0].qty=1;assert.throws(()=>Perms.assertChanges(s,cheating,user),/غير مصرح/);
 const applied=cloned(s);applied.orders.push({id:'o2',clientId:'c1',total:12,paid:0,stockUsed:[{itemId:'i1',qty:2.1234}]});applied.items[0].qty=23;assert.equal(Perms.assertChanges(s,applied,user),true);
});
test('admin recovery key is random, scrypt-only, bound to one admin and invalid after PIN changes',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'alhamd-recovery-'));
 try{const recovery=new AdminRecovery(dir),pinHash='strongly-salted-hash-1',secret=recovery.issue(pinHash,'admin123');assert.match(secret,/^[A-F0-9]{8}(-[A-F0-9]{8}){5}$/);
  const onDisk=fs.readFileSync(path.join(dir,'admin-recovery.json'),'utf8');assert.doesNotMatch(onDisk,new RegExp(secret.replace(/-/g,'')));assert.equal(recovery.targetUserId(),'admin123');
  assert.equal(recovery.verify(secret,pinHash,'admin123'),true);assert.equal(recovery.verify(secret,'another-hash','admin123'),false);assert.equal(recovery.verify(secret,pinHash,'admin-other'),false);assert.equal(recovery.verify('1234',pinHash,'admin123'),false);
  const newer=recovery.issue(pinHash,'admin123');assert.notEqual(newer,secret);assert.equal(recovery.verify(secret,pinHash,'admin123'),false);assert.equal(recovery.verify(newer,'new-hash-after-reset','admin123'),false);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('AES-GCM encrypted backups: full round trip, wrong key/password, tampering and no insecure fallback',()=>{
 const secret=Buffer.from('private financial statement: 35000 EGP'),key=crypto.randomBytes(32),pass='strong portable password for backup';
 const encrypted=Crypto.encrypt(secret,{secret:key}),portable=Crypto.encrypt(secret,{mode:'portable',secret:pass});
 assert.deepEqual(Crypto.decrypt(encrypted,{deviceKey:key}),secret);assert.deepEqual(Crypto.decrypt(portable,{passphrase:pass}),secret);
 assert.doesNotMatch(encrypted,/private financial statement/);assert.doesNotMatch(portable,/private financial statement/);
 assert.throws(()=>Crypto.decrypt(encrypted,{deviceKey:crypto.randomBytes(32)}));assert.throws(()=>Crypto.decrypt(portable,{passphrase:'wrong password that is long enough'}));
 assert.throws(()=>Crypto.encrypt(secret,{secret:null}));assert.throws(()=>Crypto.encrypt(secret,{mode:'portable',secret:'short'}));
 const obj=JSON.parse(encrypted),ct=Buffer.from(obj.data,'base64');ct[0]^=1;obj.data=ct.toString('base64');assert.throws(()=>Crypto.decrypt(JSON.stringify(obj),{deviceKey:key}));
});
test('phone projection never includes admin credentials, purchase costs, settings, or supplier details',()=>{
 const {project}=require('../app/mobile-projection.cjs');const s=base();s.users[0].pin='$scrypt$very-sensitive';s.orders[0].costSnapshot149=[{unitCost:500}];
 s.orders[0].lines[0].secretCost=450;s.shopSettings={bankPassword:'hidden-password'};
 const p=project(s,7),txt=JSON.stringify(p);assert.equal(p.revision,7);assert.ok(p.orders[0]);
 for(const secret of ['$scrypt$very-sensitive','unitCost','secretCost','bankPassword','supplierId','مورد'])assert.doesNotMatch(txt,new RegExp(secret.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
});
