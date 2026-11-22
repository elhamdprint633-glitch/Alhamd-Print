/* Document metadata only. Uses the existing decimal engine for display. */
(function(root,factory){const api=factory(typeof module==='object'?require('./accounting-math-401.js'):root.AccountingMath401,root);root.InvoiceColumns406=api;if(typeof module==='object')module.exports=api;})(globalThis,function(math,root){
 'use strict';
 const extra=[['notes','ملاحظات البند'],['code','كود الصنف'],['unit','الوحدة'],['kind','نوع البند'],['spec','المواصفات الفنية'],['gross','قيمة البند قبل خصمه'],['discountRate','نسبة خصم البند']];
 const defaults={notes:true,code:false,unit:false,kind:false,spec:false,gross:false,discountRate:false};
 const specs=[['color','لون الخامة'],['size','المقاس'],['ink','ألوان الطباعة'],['sides','الوش / الظهر'],['finish','التشطيب'],['material','نوع الخامة']];
 const clean=v=>typeof v==='string'||typeof v==='number'?String(v).slice(0,160):'';
 const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function metadata(line,index,state,editingId){
  const previous=(state.orders||[]).find(o=>o.id===editingId)?.lines?.[index];
  const same=previous&&(previous.itemId||'')===(line.itemId||'')&&(previous.serviceCatalogId||'')===(line.serviceCatalogId||'');
  const item=line.itemId?(state.items||[]).find(i=>i.id===line.itemId):line.serviceCatalogId?(state.serviceCatalog||[]).find(i=>i.id===line.serviceCatalogId):null;
  return {code:clean(same&&previous.code!==undefined?previous.code:item?.code),unit:clean(same&&previous.unit!==undefined?previous.unit:item?.unit)};
 }
 function value(id,line,index){switch(id){
  case'notes':return String(line.notes||'');case'code':return clean(line.code);case'unit':return clean(line.unit);
  case'kind':return line.itemId?'خامة مخزنية':line.serviceCatalogId?'خدمة من الدليل':line.kind==='service'?'خدمة / بيان يدوي':'بيان يدوي';
  case'spec':return specs.filter(([key])=>['string','number','boolean'].includes(typeof line.spec149?.[key])).map(([key,label])=>label+': '+String(line.spec149[key])).join('\n');
  case'gross':return root.formatCurrency?root.formatCurrency(math.lineTotal(line.qty,line.price)):String(math.lineTotal(line.qty,line.price));
  case'discountRate':return line.discountType==='pct'?clean(line.discountValue)+'%':'—';default:return '';
 }}
 function cell(id,line,index){return '<td data-col="'+id+'" class="p-2 border border-slate-300 whitespace-pre-line break-words leading-relaxed">'+escape(value(id,line,index)||'—')+'</td>';}
 function extraCells(line,index){return extra.filter(([key])=>key!=='notes').map(([key])=>cell(key,line,index)).join('');}
 return{extra,defaults,metadata,value,cell,extraCells,escape};
});
