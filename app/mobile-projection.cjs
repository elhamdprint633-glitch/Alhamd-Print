'use strict';
// This whitelist is a privacy boundary: never send PIN hashes, staff accounts, costs, suppliers or full database.
const pick=(o,fields)=>Object.fromEntries(fields.filter(k=>Object.prototype.hasOwnProperty.call(o||{},k)).map(k=>[k,o[k]]));
const fields={
 clients:['id','name','phone','phone2','initialBalance','address'],
 orders:['id','orderNo','date','time','clientId','clientName','jobType','specs','quantity','subtotal','discount','total','paid','remaining','status','deliveryDate','lines','paymentMethod','settledPaid150'],
 treasury:['id','date','type','desc','inAmount','outAmount','clientId','orderId','kind','paymentMethod'],
 adjustments:['id','date','party','partyId','debit','credit','desc','note'],
 services:['id','date','partyType','partyId','kind','amount','paid','desc','name']
};
function project(state,revision){
 const s=typeof state==='string'?JSON.parse(state):state||{};
 const clientIds=new Set((s.clients||[]).map(c=>String(c.id)));
 const clientOrderIds=new Set((s.orders||[]).filter(o=>!o.clientId||clientIds.has(String(o.clientId))).map(o=>String(o.id)));
 const result={schema:1,revision:Number(revision)||0,syncedAt:new Date().toISOString()};
 for(const [name,keys]of Object.entries(fields)){
  let list=Array.isArray(s[name])?s[name]:[];
  if(name==='treasury')list=list.filter(t=>(t.clientId&&clientIds.has(String(t.clientId)))||(t.orderId&&clientOrderIds.has(String(t.orderId))));
  if(name==='adjustments')list=list.filter(a=>a.party==='client'&&clientIds.has(String(a.partyId)));
  if(name==='services')list=list.filter(a=>a.partyType==='client'&&clientIds.has(String(a.partyId)));
  result[name]=list.map(rec=>{
   const safe=pick(rec,keys);
   if(name==='orders')safe.lines=(Array.isArray(rec.lines)?rec.lines:[]).map(l=>pick(l,['desc','qty','price','amount','total','kind','discount','itemName']));
   return safe;
  });
 }
 return result;
}
module.exports={project};
