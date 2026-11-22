/* Conservative three-way merge for local-network sync. Conflicts are reported, never overwritten silently. */
(function(root){
 'use strict';
 const clone=v=>v===undefined?undefined:JSON.parse(JSON.stringify(v));
 const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 function merge(base,local,remote){
  const conflicts=[];
  function value(b,l,r,path){
   if(equal(l,b))return clone(r);
   if(equal(r,b)||equal(l,r))return clone(l);
   if(Array.isArray(b)&&Array.isArray(l)&&Array.isArray(r)){
    const records=[...b,...l,...r].every(x=>x&&typeof x==='object'&&!Array.isArray(x)&&x.id!=null);
    if(records){const bm=new Map(b.map(x=>[String(x.id),x])),lm=new Map(l.map(x=>[String(x.id),x])),rm=new Map(r.map(x=>[String(x.id),x]));const keys=[...new Set([...b,...r,...l].map(x=>String(x.id)))],out=[];for(const id of keys){const v=value(bm.get(id),lm.get(id),rm.get(id),path+'['+id+']');if(v!==undefined)out.push(v);}return out;}
    if([...b,...l,...r].every(x=>typeof x==='string'||typeof x==='number')){const bset=new Set(b),lset=new Set(l),rset=new Set(r),all=[...new Set([...r,...l])];return all.filter(x=>lset.has(x)&&rset.has(x)||!bset.has(x)&&(lset.has(x)||rset.has(x))||bset.has(x)&&(lset.has(x)&&rset.has(x)));}
   }
   if(b&&l&&r&&typeof b==='object'&&typeof l==='object'&&typeof r==='object'&&!Array.isArray(b)&&!Array.isArray(l)&&!Array.isArray(r)){
    const out={},keys=new Set([...Object.keys(b),...Object.keys(l),...Object.keys(r)]);for(const k of keys){const v=value(b[k],l[k],r[k],path?path+'.'+k:k);if(v!==undefined)out[k]=v;}return out;
   }
   conflicts.push(path||'(root)');return clone(l);
  }
  const state=value(base||{},local||{},remote||{},'');return {state,conflicts:[...new Set(conflicts)]};
 }
 const api={merge};root.LanStateMerge=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
