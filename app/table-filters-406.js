/* Rich, table-specific quick filters. All predicates run before pagination/export. */
(function(root){
 'use strict';
 const extras={
  clientsTableBody:[['has_opening','لهم رصيد افتتاحي'],['has_sales','لهم فواتير'],['no_sales','بدون فواتير'],['has_phone','لهم رقم هاتف'],['no_phone','بدون رقم هاتف'],['has_address','لهم عنوان']],
  suppliersTableBody:[['has_opening','لهم رصيد افتتاحي'],['has_purchases','لهم وارد مسجل'],['no_purchases','بدون وارد'],['has_phone','لهم رقم هاتف'],['no_phone','بدون رقم هاتف']],
  inventoryTableBody:[['safe','الرصيد الدفتري أعلى من حد الطلب'],['free406','متاح غير محجوز'],['no_free406','لا يوجد متاح للصرف'],['has_barcode','لها باركود']],
  stockTakeTableBody:[['counted','تم جردها فعليًا'],['uncounted','لم تُجرد بعد'],['available','رصيد دفتري موجب']],
  ordersTableBody:[['unpaid','لم يسدد منها شيء'],['discounted','بها خصم'],['no_discount','بدون خصم'],['client_type:cash','عميل نقدي'],['client_type:registered','عميل مسجل'],['has_files','بها مرفقات'],['no_files','بدون مرفقات'],['has_assignee','لها مسؤول تشغيل'],['no_assignee','بدون مسؤول تشغيل'],['delivery_today','موعد تسليمها اليوم']],
  purchasesTableBody:[['unpaid406','بدون سداد عند التسجيل']],
  servicesTableBody:[['partial406','مسددة جزئيًا'],['unpaid406','لم يسدد منها شيء']],
  serviceCatalogTableBody:[['has_notes','لها ملاحظات']],quotesTableBody:[['valid','سارية الصلاحية']],
  treasuryTableBody:[['type:manual_deposit','إيداع رأسمال'],['type:service_in','تحصيل خدمة'],['type:service_out','سداد خدمة'],['type:opening_balance','رصيد مرحل']],
  opsTable149_jobs:[['has_assignee','لها مسؤول تشغيل'],['no_assignee','بدون مسؤول تشغيل'],['due','بها مبالغ متبقية']],
  opsTable149_pricing:[['has_setup','لها تكلفة تجهيز'],['has_minimum','لها حد أدنى']],
  opsTable149_waste:[['void','سجلات ملغاة']]
 };
 const safeTextColumns=new Set(['name','category','unit','client','supplier','item','status','stage','assignee','kind','type','user','role','party','chargedTo','ref']);
 const dateOptions=[['date:today','تاريخ التسجيل: اليوم'],['date406:yesterday','تاريخ التسجيل: أمس'],['date:week','تاريخ التسجيل: آخر 7 أيام'],['date:month','تاريخ التسجيل: هذا الشهر'],['date406:year','تاريخ التسجيل: هذا العام']];
 function extraOptions(key){return extras[key]||[];}
 function dateMatch(value,mode,today){const day=String(value||'').slice(0,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||!/^\d{4}-\d{2}-\d{2}$/.test(today))return false;if(mode==='year')return day.slice(0,4)===today.slice(0,4);if(mode==='yesterday'){const t=new Date(today+'T12:00:00Z');t.setUTCDate(t.getUTCDate()-1);return day===t.toISOString().slice(0,10);}return false;}
 const api={extraOptions,dateMatch,safeTextColumns};root.TableFilters406=api;if(typeof module==='object')module.exports=api;
 if(typeof root.tableQuickOptions!=='function')return;
 const oldOptions=root.tableQuickOptions,oldMatch=root.tableQuickMatch;
 root.tableQuickOptions=function(key){
  const rows=_sourceRowsForTable163(key),output=[],seen=new Set(),add=(value,label)=>{if(!seen.has(value)){seen.add(value);output.push([value,label]);}};
  for(const[value,label]of oldOptions(key))add(value,key==='purchasesTableBody'?({due:'به آجل عند التسجيل',paid:'مسدد عند التسجيل',partial:'مسدد جزئيًا عند التسجيل'}[value]||label):label);
  for(const pair of extraOptions(key))add(...pair);
  if((TABLE_DEFS[key]?.cols||[]).some(col=>col.type==='date')||rows.some(row=>row.date||row.openedAt))for(const pair of dateOptions)add(...pair);
  for(const col of tableCols(key)){
   if(col.type!=='text'||!safeTextColumns.has(col.id))continue;
   const values=new Set();for(const row of rows){const value=String(col.get(row)??'').trim();if(value&&value!=='—')values.add(value);if(values.size>=30)break;}
   for(const value of [...values].sort((a,b)=>a.localeCompare(b,'ar')))add('col:'+col.id+':'+value,col.label+': '+value);
  }
  const active=tableView(key).quick;if(active&&!seen.has(active))add(active,'الفلتر المحفوظ (غيّر الاختيار لإلغائه)');
  return output;
 };
 root.tableQuickMatch=function(key,row,value){
  if(value?.startsWith('date406:'))return dateMatch(row.date||row.openedAt,value.slice(8),_todayIso163());
  if(value==='free406'||value==='no_free406'){const available=Number(row.qty||0)-(typeof Operations149==='object'?Operations149.reserved(appState,row.id):0);return value==='free406'?available>0:available<=0;}
  if(value==='unpaid406')return Number(row.paid||0)<=.004&&Number(key==='servicesTableBody'?row.amount:row.total)>0;
  if(value==='partial406')return Number(row.paid||0)>.004&&Number(row.amount||0)-Number(row.paid||0)>.004;
  return oldMatch(key,row,value);
 };
 function refreshQuickBars(){for(const key of Object.keys(TABLE_DEFS))if(document.getElementById(key+'Tools'))root.tableTools(key);}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refreshQuickBars,{once:true});else refreshQuickBars();
})(globalThis);
