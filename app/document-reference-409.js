(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.DocumentReference409=api;})(globalThis,function(){
 'use strict';
 function reference(record,prefix='EXT'){
  if(record.documentNo409)return String(record.documentNo409);
  if(record.orderNo||record.no||record.receiptBatch400)return String(record.orderNo||record.no||record.receiptBatch400);
  const id=String(record.id||'');if(/^(?:EXT|SVC|IN|PUR)-\d+$/i.test(id))return id;
  // A deterministic display-only reference for historical UUID records. Never changes their ledger key.
  let hash=2166136261;for(const ch of id){hash^=ch.charCodeAt(0);hash=Math.imul(hash,16777619);}
  return prefix+'-'+String(hash>>>0).padStart(10,'0');
 }
 function next(records,prefix='EXT'){
  let n=1000;const used=new Set(records.map(r=>reference(r,prefix)));
  for(const r of records){const m=new RegExp('^'+prefix+'-(\\d{4,7})$').exec(String(r.documentNo409||''));if(m)n=Math.max(n,Number(m[1]));}
  do{n++;}while(used.has(prefix+'-'+n));return prefix+'-'+n;
 }
 function validate(value,records,id){const no=String(value||'').trim();if(!no||no.length>40||/[\u0000-\u001f<>]/.test(no))throw Error('أدخل رقم مستند واضحًا من 1 إلى 40 حرفًا');if(records.some(r=>r.id!==id&&reference(r)===no))throw Error('رقم المستند مستخدم بالفعل');return no;}
 return {reference,next,validate};
});
