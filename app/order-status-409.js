(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.OrderStatus409=api;})(globalThis,function(){
 'use strict';const statuses=['قيد التنفيذ','جاهز للتسليم','تم التسليم'];
 function plan(record,status,user,at=new Date().toISOString()){
  if(!statuses.includes(status))throw Error('حالة غير صالحة');
  if(record.status===status)return JSON.parse(JSON.stringify(record));
  const next=JSON.parse(JSON.stringify(record));next.status=status;next.ops149||={};
  next.ops149.stage=status==='قيد التنفيذ'?'انتظار التصميم':status;
  next.ops149.history=[...(next.ops149.history||[]),{at,stage:next.ops149.stage,user:String(user||''),note:'تغيير الحالة من قائمة الإجراءات'}];return next;
 }
 function isTransition(before,after,user){
  if(!statuses.includes(after.status)||before.status===after.status)return false;
  const last=after.ops149?.history?.at(-1);if(!last||!/^\d{4}-\d{2}-\d{2}T/.test(last.at||''))return false;
  return JSON.stringify(plan(before,after.status,user,last.at))===JSON.stringify(after);
 }
 return {statuses,plan,isTransition};
});
