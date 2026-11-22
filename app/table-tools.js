/* Shared typed filters, Excel Export, and Excel Import operate on raw rows before pagination. */
const TC=(id,label,get,type='text')=>({id,label,get,type});
const _safeAppState163=()=>(typeof appState!=='undefined'&&appState)?appState:{};
const _todayIso163=()=>typeof todayStr==='function'?todayStr():new Date().toISOString().slice(0,10);
const TABLE_DEFS={
 ordersTableBody:{title:'المبيعات',cols:[TC('no','رقم الفاتورة',o=>o.orderNo,'number'),TC('date','التاريخ',o=>o.date,'date'),TC('client','العميل',o=>o.clientName),TC('desc','البيان',o=>o.jobType),TC('qty','الكمية',o=>o.quantity,'number'),TC('discount','الخصم',o=>o.discount||0,'number'),TC('total','الإجمالي',o=>o.total,'number'),TC('paid','المدفوع',orderPaid,'number'),TC('due','المتبقي',orderRemaining,'number'),TC('delivery','موعد التسليم',o=>o.deliveryDate,'date'),TC('status','الحالة',o=>o.status)]},
 inventoryTableBody:{title:'الأصناف والمخزون',cols:[TC('code','الكود',o=>o.code),TC('name','الصنف',o=>o.name),TC('category','التصنيف',o=>o.category),TC('unit','الوحدة',o=>o.unit),TC('qty','الرصيد',o=>o.qty,'number'),TC('cost','آخر سعر شراء',o=>o.buyPrice,'cost'),TC('price','سعر البيع',o=>o.sellPrice,'number'),TC('min','حد الطلب',o=>o.minQty,'number')]},
 stockTakeTableBody:{title:'جرد المخزن',cols:[TC('code','الكود',o=>o.code),TC('name','الصنف',o=>o.name),TC('category','التصنيف',o=>o.category),TC('unit','الوحدة',o=>o.unit),TC('cost','متوسط التكلفة',o=>o.avgCost166??o.buyPrice,'cost'),TC('qty','الرصيد الدفتري',o=>o.qty,'number'),TC('actual','الرصيد الفعلي',o=>o.lastActualCount??o.qty,'number'),TC('diff','فرق الكمية',o=>r2((o.lastActualCount??o.qty)-o.qty),'number'),TC('value','قيمة الفرق',o=>r2(((o.lastActualCount??o.qty)-o.qty)*Number(o.avgCost166??o.buyPrice??0)),'cost')]},
 purchasesTableBody:{title:'فواتير الوارد',cols:[TC('id','رقم الوارد',o=>o.id),TC('date','التاريخ',o=>o.date,'date'),TC('supplier','المورد',o=>o.supplierName),TC('item','الخامة',o=>o.itemName),TC('qty','الكمية',o=>o.qty,'number'),TC('price','سعر الوحدة',o=>o.unitPrice,'number'),TC('total','الإجمالي',o=>o.total,'number'),TC('paid','المدفوع',o=>o.paid,'number'),TC('due','المتبقي',o=>o.due,'number')]},
 clientsTableBody:{title:'العملاء',cols:[TC('name','العميل',o=>o.name),TC('phone','الهاتف',o=>o.phone),TC('address','العنوان',o=>o.address),TC('sales','إجمالي المبيعات',o=>(typeof ledgerIndex!=='undefined'&&ledgerIndex||typeof buildLedgerIndex==='function'&&buildLedgerIndex())?.spent?.get(o.id)||0,'number'),TC('balance','رصيد الحساب (الموجب مديونية)',o=>getClientBalance(o.id),'number')]},
 suppliersTableBody:{title:'الموردون',cols:[TC('name','المورد',o=>o.name),TC('phone','الهاتف',o=>o.phone),TC('items','الخامات',o=>o.items),TC('balance','رصيد الحساب (الموجب مستحق للمورد)',o=>getSupplierBalance(o.id),'number')]},
 treasuryTableBody:{title:'الخزينة',cols:[TC('date','التاريخ',o=>o.date,'date'),TC('type','نوع الحركة',o=>({sales_return_refund:'رد مرتجع مبيعات',collection:'تحصيل عميل',supplier_payment:'سداد مورد',expense:'مصروف',opening_balance:'رصيد مرحل',manual_deposit:'إيداع',service_in:'تحصيل خدمة',service_out:'سداد خدمة'})[o.type]||o.type),TC('desc','البيان',o=>o.desc),TC('in','وارد',o=>o.inAmount,'number'),TC('out','صادر',o=>o.outAmount,'number'),TC('user','المستخدم',o=>o.user)]},
 servicesTableBody:{title:'الخدمات',cols:[TC('id','الرقم',o=>o.id),TC('date','التاريخ',o=>o.date,'date'),TC('kind','النوع',o=>o.kind==='provided'?'أقدمها':'تُقدَّم لي'),TC('title','الخدمة',o=>o.title),TC('party','الطرف',o=>o.partyName),TC('total','الإجمالي',o=>o.amount,'number'),TC('paid','المدفوع',o=>o.paid,'number'),TC('due','المتبقي',o=>r2(o.amount-o.paid),'number'),TC('notes','ملاحظات',o=>o.notes)]},
 quotesTableBody:{title:'عروض الأسعار والمسودات',cols:[TC('no','رقم العرض',o=>o.no,'number'),TC('status','الحالة',quoteState),TC('date','التاريخ',o=>o.date,'date'),TC('client','العميل',o=>o.clientName),TC('desc','البيان',o=>o.jobType),TC('total','الإجمالي',o=>o.total,'number'),TC('valid','صالح حتى',o=>o.validUntil,'date')]},
 usersTableBody:{title:'المستخدمون',cols:[TC('username','اسم الدخول',o=>o.username),TC('name','اسم المستخدم',o=>o.name),TC('role','الدور',o=>({admin:'مدير النظام',cashier:'محاسب / كاشير',storekeeper:'أمين مخزن / تشغيل'})[o.role]||o.role)]},
 serviceCatalogTableBody:{title:'قائمة الخدمات والأسعار',cols:[TC('code','الكود',o=>o.code),TC('category','التصنيف',o=>o.category),TC('name','اسم الخدمة',o=>o.name),TC('unit','الوحدة',o=>o.unit),TC('cost','التكلفة',o=>o.cost,'cost'),TC('price','سعر البيع',o=>o.price,'number'),TC('notes','ملاحظات',o=>o.notes)]},
 dashRecentOrdersTable:{title:'أحدث أوامر التشغيل',cols:[TC('no','رقم الفاتورة',o=>o.orderNo,'number'),TC('date','التاريخ',o=>o.date,'date'),TC('client','العميل',o=>o.clientName),TC('desc','البيان',o=>o.jobType),TC('total','الإجمالي',o=>o.total,'number'),TC('due','المتبقي',orderRemaining,'number'),TC('status','الحالة',o=>o.status)]},
 statementMovements:{title:'حركات كشف الحساب',cols:[TC('date','التاريخ',o=>o.date,'date'),TC('ref','المرجع',o=>o.ref),TC('desc','البيان',o=>o.desc),TC('debit','مدين / مستحق',o=>o.debit,'number'),TC('credit','دائن / سداد',o=>o.credit,'number'),TC('balance','الرصيد التراكمي',o=>o.bal,'number')]},
 opsTable149_jobs:{title:'التشغيل والملفات',cols:[TC('no','الفاتورة',o=>o.orderNo,'number'),TC('client','العميل',o=>o.clientName),TC('job','الشغل',o=>o.jobType),TC('delivery','موعد التسليم',o=>o.deliveryDate||'','date'),TC('stage','مرحلة التشغيل',o=>o.ops149?.stage||o.status||'قيد التنفيذ'),TC('assignee','المسؤول',o=>o.ops149?.assignee||'')]},
 opsTable149_pricing:{title:'التسعير والباركود',cols:[TC('item','الصنف / الخدمة',r=>{const s=_safeAppState163();const recs=[...(s.items||[]).map(i=>({value:'stock:'+i.id,label:i.name})),...(s.serviceCatalog||[]).map(i=>({value:'service:'+i.id,label:i.name}))];return recs.find(x=>x.value===r.ref)?.label||'منتج محذوف';}),TC('tiers','شرائح الكمية',r=>(r.tiers||[]).map(t=>t.min+'–'+(t.max??'∞')+': '+t.price).join(' | ')),TC('setup','تجهيز',r=>r.setup||0,'number'),TC('minimum','حد أدنى',r=>r.minimum||0,'number'),TC('status','الحالة',r=>r.enabled===false?'متوقف':'مفعّل')]},
 opsTable149_shifts:{title:'ورديات الكاشير',cols:[TC('user','المسؤول',s=>s.user||''),TC('openedAt','الفتح',s=>String(s.openedAt||'').slice(0,16).replace('T',' '),'date'),TC('closedAt','الإقفال',s=>s.closedAt?String(s.closedAt).slice(0,16).replace('T',' '):'مفتوحة'),TC('diff','الفروق',s=>s.closedAt?Object.entries(s.difference||{}).map(([k,v])=>k+': '+v).join(' | '):'—')]},
 opsTable149_reservations:{title:'حجز الخامات',cols:[TC('quote','عرض السعر',r=>{const s=_safeAppState163();const q=(s.quotes||[]).find(x=>x.id===r.quoteId);return q?'#Q'+q.no:'عرض محذوف';}),TC('client','العميل',r=>{const s=_safeAppState163();const q=(s.quotes||[]).find(x=>x.id===r.quoteId);return q?.clientName||'';}),TC('status','الحالة',r=>{const s=_safeAppState163();const q=(s.quotes||[]).find(x=>x.id===r.quoteId);const isActive=r.status==='active'&&q&&!['تم التحويل','مرفوض'].includes(q.status);return isActive?'محجوز':r.status==='consumed'?'تم الصرف':'محرر / ملغي';}),TC('items','الخامات المحجوزة',r=>{const s=_safeAppState163();return (r.lines||[]).map(l=>((s.items||[]).find(i=>i.id===l.itemId)?.name||l.itemId)+': '+l.qty).join(' | ');})]},
 opsTable149_waste:{title:'الهالك والتكاليف',cols:[TC('type','النوع',x=>x.type149||''),TC('order','الفاتورة',x=>{const s=_safeAppState163();const o=(s.orders||[]).find(o=>o.id===x.orderId);return o?'#'+o.orderNo:'عام';}),TC('desc','البيان',x=>x.reason||x.desc||''),TC('amount','الكمية / القيمة',x=>x.type149==='هالك'?Number(x.qty||0):Number(x.amount||0),'number'),TC('charged','على حساب',x=>x.chargedTo==='client'?'العميل — راجع تحصيلها':'المطبعة'),TC('date','التاريخ',x=>x.date||'','date')]}
};
function tableCols(key){return (TABLE_DEFS[key]?.cols||[]).filter(c=>c.type!=='cost'||can('stock_cost')&&!ss().hideCosts);}
function tableView(key){const all=ss().tableViews||={};const v=all[key]||={rules:[],sort:'',dir:'asc',quick:''};if(!Array.isArray(v.rules))v.rules=[];if(!('quick'in v))v.quick='';return v;}
function tableNumber(value){const n=arabicKey(value).replace(/[,٬\s]/g,'').replace(/٫/g,'.');return n===''?NaN:Number(n);}
function _matchDateWindow163(dateStr,mode){
 const d=String(dateStr||'').slice(0,10),today=_todayIso163();
 if(!d)return false;
 if(mode==='today')return d===today;
 if(mode==='month')return d.slice(0,7)===today.slice(0,7);
 if(mode==='week'){
  const dt=new Date(today+'T00:00:00');dt.setDate(dt.getDate()-6);
  const w=`${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
  return d>=w&&d<=today;
 }
 return true;
}
function _sourceRowsForTable163(key){
 const s=_safeAppState163();
 if(typeof PAGE_STATE!=='undefined'&&Array.isArray(PAGE_STATE?.[key]?.raw)&&PAGE_STATE[key].raw.length)return PAGE_STATE[key].raw;
 switch(key){
  case'ordersTableBody':case'dashRecentOrdersTable':case'opsTable149_jobs':return s.orders||[];
  case'inventoryTableBody':case'stockTakeTableBody':return s.items||[];
  case'purchasesTableBody':return s.purchases||[];
  case'clientsTableBody':return s.clients||[];
  case'suppliersTableBody':return s.suppliers||[];
  case'treasuryTableBody':return s.treasury||[];
  case'servicesTableBody':return s.services||[];
  case'serviceCatalogTableBody':return s.serviceCatalog||[];
  case'quotesTableBody':return s.quotes||[];
  case'usersTableBody':return s.users||[];
  case'opsTable149_pricing':return s.pricing149||[];
  case'opsTable149_shifts':return s.shifts149||[];
  case'opsTable149_reservations':return s.reservations149||[];
  case'opsTable149_waste':return [...(s.waste149||[]).map(x=>({...x,type149:'هالك'})),...(s.costs149||[]).map(x=>({...x,type149:'تكلفة'}))];
  default:return [];
 }
}
function tableQuickMatch(key,row,value){
 if(!value||value==='all')return true;
 if(value.startsWith('col:')){
  const parts=value.split(':'),colId=parts[1],target=parts.slice(2).join(':');
  const col=(TABLE_DEFS[key]?.cols||[]).find(c=>c.id===colId);
  if(!col)return true;
  return String(col.get(row)??'').trim()===target;
 }
 if(value.startsWith('date:'))return _matchDateWindow163(row.date||row.openedAt,value.slice(5));
 const s=_safeAppState163(),today=_todayIso163();
 switch(key){
  case'clientsTableBody':{
   const bal=getClientBalance(row.id);
   if(value==='owed')return bal>0;
   if(value==='credit')return bal<0;
   if(value==='zero')return Math.abs(bal)<.005;
   if(value==='has_opening')return Math.abs(Number(row.initialBalance||0))>.004;
   if(value==='has_sales')return (s.orders||[]).some(o=>o.clientId===row.id);
   if(value==='no_sales')return !(s.orders||[]).some(o=>o.clientId===row.id);
   if(value==='active_orders')return (s.orders||[]).some(o=>o.clientId===row.id&&o.status!=='تم التسليم');
   if(value==='has_phone')return Boolean(String(row.phone||'').trim());
   if(value==='no_phone')return !String(row.phone||'').trim();
   if(value==='has_address')return Boolean(String(row.address||'').trim());
   if(value.startsWith('address:'))return String(row.address||'').trim()===value.slice(8);
   if(value.startsWith('name:'))return String(row.name||'').trim()===value.slice(5);
   return true;
  }
  case'suppliersTableBody':{
   const b=getSupplierBalance(row.id);
   if(value==='owed')return b>0;
   if(value==='credit')return b<0;
   if(value==='zero')return Math.abs(b)<.005;
   if(value==='has_opening')return Math.abs(Number(row.balance||0))>.004;
   if(value==='has_purchases')return (s.purchases||[]).some(p=>p.supplierId===row.id);
   if(value==='no_purchases')return !(s.purchases||[]).some(p=>p.supplierId===row.id);
   if(value==='has_phone')return Boolean(String(row.phone||'').trim());
   if(value==='no_phone')return !String(row.phone||'').trim();
   if(value.startsWith('items:'))return String(row.items||'').trim()===value.slice(6);
   if(value.startsWith('name:'))return String(row.name||'').trim()===value.slice(5);
   return true;
  }
  case'inventoryTableBody':
  case'stockTakeTableBody':{
   const qty=Number(row.qty||0),min=Number(row.minQty||0),actual=Number(row.lastActualCount??row.qty??0),diff=r2(actual-qty);
   if(value==='low')return qty<=min;
   if(value==='out')return qty<=0;
   if(value==='available')return qty>0;
   if(value==='safe')return qty>min;
   if(value==='reserved')return typeof Operations149?.reserved==='function'&&Operations149.reserved(s,row.id)>0;
   if(value==='has_barcode')return Boolean(String(row.barcode149||'').trim());
   if(value==='diff_any')return Math.abs(diff)>.004;
   if(value==='diff_shortage')return diff<-.004;
   if(value==='diff_surplus')return diff>.004;
   if(value==='diff_match')return Math.abs(diff)<=.004;
   if(value==='counted')return row.lastActualCount!==undefined&&row.lastActualCount!==null;
   if(value==='uncounted')return row.lastActualCount===undefined||row.lastActualCount===null;
   if(value.startsWith('category:'))return String(row.category||'عام')===value.slice(9);
   if(value.startsWith('unit:'))return String(row.unit||'')===value.slice(5);
   if(value.startsWith('name:'))return String(row.name||'')===value.slice(5);
   return true;
  }
  case'ordersTableBody':
  case'dashRecentOrdersTable':
  case'opsTable149_jobs':{
   const rem=orderRemaining(row),paid=orderPaid(row),st=row.ops149?.stage||row.status||'قيد التنفيذ';
   if(value==='due')return rem>.004;
   if(value==='paid')return rem<=.004;
   if(value==='partial')return paid>.004&&rem>.004;
   if(value==='unpaid')return paid<=.004&&rem>.004;
   if(value==='processing'||value==='active')return !['تم التسليم','ملغي'].includes(row.status)&&st!=='تم التسليم';
   if(value==='delivered')return row.status==='تم التسليم'||st==='تم التسليم';
   if(value==='overdue')return Boolean(row.deliveryDate&&row.deliveryDate<today&&row.status!=='تم التسليم'&&st!=='تم التسليم');
   if(value==='delivery_today')return row.deliveryDate===today;
   if(value==='discounted')return Number(row.discount||row.invDiscount||0)>.004;
   if(value==='no_discount')return Number(row.discount||row.invDiscount||0)<=.004;
   if(value==='client_type:cash')return !row.clientId||row.clientName==='عميل نقدي';
   if(value==='client_type:registered')return Boolean(row.clientId&&row.clientName!=='عميل نقدي');
   if(value==='has_files')return Array.isArray(row.attachments149)&&row.attachments149.length>0;
   if(value==='no_files')return !Array.isArray(row.attachments149)||row.attachments149.length===0;
   if(value==='has_assignee')return Boolean(String(row.ops149?.assignee||'').trim());
   if(value==='no_assignee')return !String(row.ops149?.assignee||'').trim();
   if(value.startsWith('status:'))return String(row.status||'')===value.slice(7);
   if(value.startsWith('stage:'))return st===value.slice(6);
   if(value.startsWith('assignee:'))return String(row.ops149?.assignee||'')===value.slice(9);
   if(value.startsWith('client:'))return String(row.clientName||'')===value.slice(7);
   if(value.startsWith('desc:')||value.startsWith('job:'))return String(row.jobType||'')===value.replace(/^(desc|job):/,'');
   if(value.startsWith('method:'))return String(row.paymentMethod||'')===value.slice(7)||(row.paymentParts149||[]).some(p=>p.method===value.slice(7));
   return true;
  }
  case'purchasesTableBody':{
   const due=Number(row.due||0),paid=Number(row.paid||0);
   if(value==='due')return due>.004;
   if(value==='paid')return due<=.004;
   if(value==='partial')return paid>.004&&due>.004;
   if(value==='unpaid')return paid<=.004&&due>.004;
   if(value.startsWith('supplier:'))return String(row.supplierName||'')===value.slice(9);
   if(value.startsWith('item:'))return String(row.itemName||'')===value.slice(5);
   return true;
  }
  case'servicesTableBody':{
   const due=Number(row.amount||0)-Number(row.paid||0),paid=Number(row.paid||0);
   if(value==='due')return due>.004;
   if(value==='paid')return due<=.004;
   if(value==='partial')return paid>.004&&due>.004;
   if(value.startsWith('kind:'))return String(row.kind||'')===value.slice(5);
   if(value.startsWith('partyType:'))return String(row.partyType||'')===value.slice(10);
   if(value.startsWith('party:'))return String(row.partyName||'')===value.slice(6);
   if(value.startsWith('title:'))return String(row.title||'')===value.slice(6);
   return true;
  }
  case'serviceCatalogTableBody':{
   if(value==='has_cost')return Number(row.cost||0)>0;
   if(value==='no_cost')return Number(row.cost||0)<=0;
   if(value==='has_notes')return Boolean(String(row.notes||'').trim());
   if(value.startsWith('category:'))return String(row.category||'عام')===value.slice(9);
   if(value.startsWith('unit:'))return String(row.unit||'')===value.slice(5);
   if(value.startsWith('name:'))return String(row.name||'')===value.slice(5);
   return true;
  }
  case'quotesTableBody':{
   const st=quoteState(row);
   if(value==='open')return !['تم التحويل','مرفوض'].includes(st);
   if(value==='converted')return st==='تم التحويل';
   if(value==='rejected')return st==='مرفوض';
   if(value==='draft')return st==='مسودة'||row.status==='مسودة';
   if(value==='expired')return Boolean(row.validUntil&&row.validUntil<today&&!['تم التحويل','مرفوض'].includes(st));
   if(value==='valid')return Boolean((!row.validUntil||row.validUntil>=today)&&!['تم التحويل','مرفوض'].includes(st));
   if(value.startsWith('client:'))return String(row.clientName||'')===value.slice(7);
   if(value.startsWith('desc:'))return String(row.jobType||'')===value.slice(5);
   return true;
  }
  case'treasuryTableBody':{
   if(value==='incoming')return Number(row.inAmount)>0;
   if(value==='outgoing')return Number(row.outAmount)>0;
   if(value.startsWith('type:'))return String(row.type||'')===value.slice(5);
   if(value.startsWith('method:'))return String(row.paymentMethod||'')===value.slice(7);
   if(value.startsWith('user:'))return String(row.user||'')===value.slice(5);
   return true;
  }
  case'usersTableBody':{
   if(value.startsWith('role:'))return String(row.role||'')===value.slice(5);
   if(value==='status:active')return !row.disabled;
   if(value==='status:disabled')return Boolean(row.disabled);
   return true;
  }
  case'statementMovements':{
   if(value==='debit')return Number(row.debit||0)>0;
   if(value==='credit')return Number(row.credit||0)>0;
   if(value.startsWith('kind:'))return String(row.kind||'')===value.slice(5);
   return true;
  }
  case'opsTable149_pricing':{
   if(value==='enabled')return row.enabled!==false;
   if(value==='disabled')return row.enabled===false;
   if(value==='kind:stock')return String(row.ref||'').startsWith('stock:');
   if(value==='kind:service')return String(row.ref||'').startsWith('service:');
   if(value==='has_setup')return Number(row.setup||0)>0;
   if(value==='has_minimum')return Number(row.minimum||0)>0;
   return true;
  }
  case'opsTable149_shifts':{
   if(value==='open')return !row.closedAt;
   if(value==='closed')return Boolean(row.closedAt);
   if(value==='has_diff')return Boolean(row.closedAt&&Object.values(row.difference||{}).some(v=>Math.abs(Number(v||0))>.004));
   if(value==='matched')return Boolean(row.closedAt&&!Object.values(row.difference||{}).some(v=>Math.abs(Number(v||0))>.004));
   if(value.startsWith('user:'))return String(row.user||'')===value.slice(5);
   return true;
  }
  case'opsTable149_reservations':{
   const q=(s.quotes||[]).find(x=>x.id===row.quoteId);
   const isActive=row.status==='active'&&q&&!['تم التحويل','مرفوض'].includes(q.status);
   if(value==='active')return Boolean(isActive);
   if(value==='consumed')return row.status==='consumed';
   if(value==='released')return !isActive&&row.status!=='consumed';
   if(value.startsWith('client:'))return String(q?.clientName||'')===value.slice(7);
   return true;
  }
  case'opsTable149_waste':{
   if(value.startsWith('type:'))return String(row.type149||'')===value.slice(5);
   if(value.startsWith('charged:'))return (row.chargedTo||'shop')===value.slice(8);
   if(value==='active')return !row.voidAt;
   if(value==='void')return Boolean(row.voidAt);
   return true;
  }
  default:return true;
 }
}
function _appendDynamicColumnQuickOptions163(key,baseOptions){
 const seenValues=new Set(baseOptions.map(x=>x[0])),seenLabels=new Set(baseOptions.map(x=>x[1]));
 const out=baseOptions.slice();
 const add=(v,l)=>{if(!v||!l||seenValues.has(v)||seenLabels.has(l))return;seenValues.add(v);seenLabels.add(l);out.push([v,l]);};
 const rows=_sourceRowsForTable163(key);
 const cols=tableCols(key);
 for(const col of cols){
  const distinct=[];
  const valSet=new Set();
  for(const r of rows){
   if(!r||typeof r!=='object')continue;
   let raw;
   try{raw=col.get(r);}catch{continue;}
   const str=String(raw??'').trim();
   if(!str||str==='—'||valSet.has(str))continue;
   valSet.add(str);
   distinct.push(str);
   if(distinct.length>=20)break;
  }
  for(const val of distinct){
   const disp=['number','cost'].includes(col.type)&&typeof formatCurrency==='function'&&['discount','total','paid','due','sales','balance','in','out','value','cost','price','setup','minimum','amount','debit','credit'].includes(col.id)?formatCurrency(Number(val)||0):val;
   add(`col:${col.id}:${val}`,`${col.label}: ${disp}`);
  }
 }
 return out;
}
function tableQuickOptions(key){
 const s=_safeAppState163();
 const common=[['all','كل السجلات']];
 const uniqSort=arr=>[...new Set(arr.map(x=>String(x||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ar'));
 if(key==='clientsTableBody'){
  return [...common,['owed','عملاء عليهم مديونية'],['credit','عملاء لهم رصيد دائن'],['zero','حسابات بدون رصيد'],['active_orders','عملاء لهم أوامر قيد التشغيل']];
 }
 if(key==='suppliersTableBody'){
  return [...common,['owed','مبالغ مستحقة للمورد'],['credit','رصيد لصالحنا'],['zero','حسابات بدون رصيد']];
 }
 if(key==='inventoryTableBody'){
  const cats=uniqSort((s.items||[]).map(x=>x.category||'عام'));
  return [...common,['available','متوفر بالمخزن'],['low','أقل من حد الطلب'],['out','نفد من المخزن'],['reserved','أصناف عليها حجز خامات'],...cats.map(x=>['category:'+x,'تصنيف: '+x])];
 }
 if(key==='stockTakeTableBody'){
  return [...common,['diff_any','أصناف بها فروق جرد'],['diff_shortage','أصناف بها عجز جرد'],['diff_surplus','أصناف بها زيادة جرد'],['diff_match','أصناف مطابقة للجرد'],['low','أقل من حد الطلب'],['out','نفد من المخزن']];
 }
 if(key==='ordersTableBody'||key==='dashRecentOrdersTable'){
  return [...common,['due','فواتير عليها متبقي'],['paid','فواتير مسددة'],['partial','فواتير مسددة جزئياً'],['processing','قيد التشغيل'],['status:جاهز للتسليم','جاهز للتسليم'],['delivered','تم التسليم'],['overdue','متأخرة عن موعد التسليم'],['date:today','فواتير اليوم'],['date:month','فواتير هذا الشهر']];
 }
 if(key==='opsTable149_jobs'){
  return [...common,['active','أوامر قيد التشغيل حالياً'],['stage:انتظار التصميم','المرحلة: انتظار التصميم'],['stage:الطباعة','المرحلة: الطباعة'],['stage:التشطيب','المرحلة: التشطيب'],['stage:جاهز للتسليم','المرحلة: جاهز للتسليم'],['delivered','تم التسليم'],['overdue','متأخرة عن موعد التسليم'],['delivery_today','موعد تسليمها اليوم']];
 }
 if(key==='purchasesTableBody'){
  return [...common,['due','وارد عليه مستحق'],['paid','وارد مسدد'],['partial','وارد مسدد جزئياً'],['date:today','وارد اليوم'],['date:month','وارد هذا الشهر']];
 }
 if(key==='servicesTableBody'){
  return [...common,['due','خدمات عليها متبقي'],['paid','خدمات مسددة'],['kind:provided','خدمات أقدمها'],['kind:received','خدمات تُقدَّم لي']];
 }
 if(key==='serviceCatalogTableBody'){
  const cats=uniqSort((s.serviceCatalog||[]).map(x=>x.category||'عام'));
  return [...common,['has_cost','خدمات محددة التكلفة'],['no_cost','خدمات بدون تكلفة'],...cats.map(c=>['category:'+c,'تصنيف: '+c])];
 }
 if(key==='quotesTableBody'){
  return [...common,['open','عروض نشطة'],['converted','تم تحويلها لفواتير'],['draft','مسودات'],['rejected','عروض مرفوضة'],['expired','منتهية الصلاحية']];
 }
 if(key==='treasuryTableBody'){
  return [...common,['incoming','حركات واردة'],['outgoing','حركات صادرة'],['type:collection','تحصيل عميل'],['type:supplier_payment','سداد مورد'],['type:expense','مصروفات'],['type:sales_return_refund','ردود مرتجعات المبيعات'],['date:today','حركات اليوم'],['date:month','حركات هذا الشهر']];
 }
 if(key==='usersTableBody'){
  return [...common,['role:admin','مدير النظام'],['role:cashier','محاسب / كاشير'],['role:storekeeper','أمين مخزن / تشغيل'],['status:active','الحسابات النشطة'],['status:disabled','الحسابات الموقوفة']];
 }
 if(key==='statementMovements'){
  return [...common,['debit','حركات مدين / مستحق فقط'],['credit','حركات دائن / سداد فقط'],['kind:order','فواتير مبيعات'],['kind:pur','فواتير وارد خامات'],['kind:pay','سندات خزينة وتحصيل'],['kind:adj','قيود تسوية']];
 }
 if(key==='opsTable149_pricing'){
  return [...common,['enabled','قواعد تسعير مفعّلة'],['disabled','قواعد تسعير متوقفة'],['kind:stock','أصناف مخزنية'],['kind:service','خدمات']];
 }
 if(key==='opsTable149_shifts'){
  return [...common,['open','ورديات مفتوحة'],['closed','ورديات مقفولة'],['has_diff','ورديات بها فروق جرد'],['matched','ورديات مطابقة']];
 }
 if(key==='opsTable149_reservations'){
  return [...common,['active','حجوزات نشطة'],['consumed','تم الصرف للفاتورة'],['released','محرر / ملغي']];
 }
 if(key==='opsTable149_waste'){
  return [...common,['type:هالك','هالك خامات'],['type:تكلفة','تكلفة إضافية'],['charged:shop','على حساب المطبعة'],['charged:client','على حساب العميل'],['active','سجلات فعّالة']];
 }
 return common;
}
function setTableQuickFilter(key,value){const v=tableView(key);v.quick=String(value||'');saveState(false);refreshTableView(key);}
function tableApply(key,rows){const view=tableView(key),cols=tableCols(key),map=new Map(cols.map(c=>[c.id,c])),numeric=c=>['number','cost'].includes(c.type);let out=rows.filter(row=>tableQuickMatch(key,row,view.quick)&&(view.rules||[]).every(r=>{const c=map.get(r.col);if(!c)return true;const v=c.get(row);if(r.op==='empty')return v==null||v==='';if(r.op==='notempty')return v!=null&&v!=='';if(numeric(c)){const a=Number(v||0),b=tableNumber(r.value),d=tableNumber(r.to);if(!Number.isFinite(b))return true;return ({eq:a===b,gt:a>b,gte:a>=b,lt:a<b,lte:a<=b,between:a>=b&&a<=d})[r.op]??true;}const a=c.type==='date'?String(v||'').slice(0,10):arabicKey(v),b=c.type==='date'?r.value:arabicKey(r.value);if(!b)return true;return ({contains:smartMatch(v,r.value),eq:a===b,gt:a>b,gte:a>=b,lt:a<b,lte:a<=b,between:a>=b&&a<=r.to})[r.op]??true;}));const c=map.get(view.sort);if(c){const dir=view.dir==='desc'?-1:1;out=out.map((row,i)=>({row,i})).sort((a,b)=>{const av=c.get(a.row),bv=c.get(b.row);const d=numeric(c)?Number(av||0)-Number(bv||0):arabicKey(av).localeCompare(arabicKey(bv),'ar',{numeric:true});return d*dir||a.i-b.i;}).map(x=>x.row);}return out;}
function tableTools(key,container){
 if(!TABLE_DEFS[key])return;
 const st=PAGE_STATE[key]||={page:0,all:[]};let bar=gid(key+'Tools');
 if(!bar){bar=document.createElement('div');bar.id=key+'Tools';bar.className='no-print table-tools-bar162 flex flex-nowrap justify-start gap-1.5 items-center px-2 py-1.5 border rounded-xl bg-slate-50 dark:bg-slate-800 dark:border-slate-600 text-xs overflow-hidden';if(container)container.prepend(bar);else gid(key)?.closest('table')?.parentElement.before(bar);}
 else{bar.classList.remove('flex-wrap','justify-between','overflow-x-auto');bar.classList.add('table-tools-bar162','flex-nowrap','justify-start','overflow-hidden');}
 const v=tableView(key);
 const quick=tableQuickOptions(key);const reorder=window.canReorderTable157?.(key);
 const html=`<div class="table-tools-group162 flex flex-nowrap gap-1.5 items-center min-w-0"><select aria-label="فلترة سريعة" class="border rounded-lg px-1.5 py-1 font-bold bg-white dark:bg-slate-700 min-w-0" onchange="setTableQuickFilter('${key}',this.value)">${quick.map(([value,label])=>`<option value="${escapeHtml(value)}" ${String(v.quick||'')===value?'selected':''}>${escapeHtml(label)}</option>`).join('')}</select><button type="button" class="border rounded-lg px-2 py-1 font-bold bg-white dark:bg-slate-700 inline-flex items-center justify-center min-w-0 whitespace-nowrap" onclick="openTableFilter('${key}')"><i class="fa-solid fa-filter ml-1"></i>فلترة متقدمة</button><button type="button" onclick="resetTableView('${key}')" class="border rounded-lg px-2 py-1 font-bold bg-white dark:bg-slate-700 inline-flex items-center justify-center min-w-0 whitespace-nowrap">مسح الفلترة</button>${reorder?`<button type="button" onclick="toggleColumnReorder157('${key}')" class="border rounded-lg px-2 py-1 font-bold bg-white dark:bg-slate-700 inline-flex items-center justify-center min-w-0 whitespace-nowrap">ترتيب الأعمدة</button>`:''}</div><div class="table-tools-group162 flex flex-nowrap gap-1.5 items-center min-w-0">${can('export')?`<button type="button" class="border rounded-lg px-2 py-1 bg-white dark:bg-slate-700 font-bold hover:bg-emerald-50 dark:hover:bg-slate-600 transition inline-flex items-center justify-center min-w-0 whitespace-nowrap" onclick="exportTableExcel('${key}')"><i class="fa-solid fa-file-excel text-emerald-600 ml-1"></i>تصدير Excel</button>`:''}<button type="button" class="border rounded-lg px-2 py-1 bg-white dark:bg-slate-700 font-bold hover:bg-teal-50 dark:hover:bg-slate-600 transition inline-flex items-center justify-center min-w-0 whitespace-nowrap" onclick="importTableExcel('${key}')"><i class="fa-solid fa-file-import text-teal-600 ml-1"></i>استيراد Excel</button>${can('export')?`<button type="button" onclick="openDocumentPDF('${key==='statementMovements'?'statement':key}')" class="border rounded-lg px-2 py-1 bg-white dark:bg-slate-700 font-bold hover:bg-rose-50 dark:hover:bg-slate-600 transition inline-flex items-center justify-center min-w-0 whitespace-nowrap"><i class="fa-solid fa-file-pdf text-rose-600 ml-1"></i>حفظ تقرير PDF</button>`:''}</div>`;
 if(bar.dataset.viewState!==html){bar.dataset.viewState=html;bar.innerHTML=html;}
 bar.querySelectorAll?.('[data-table-status]')?.forEach(el=>el.remove());
 if(typeof window.decorateAlphaSortButtonsInToolbars162==='function')window.decorateAlphaSortButtonsInToolbars162(key);
}
function refreshTableView(key){const st=typeof PAGE_STATE!=='undefined'?PAGE_STATE[key]:null;if(st){st.page=0;st.render?.();}if(key==='statementMovements'&&typeof STMT!=='undefined'){STMT.page=0;renderStatement();}if(String(key||'').startsWith('opsTable149_')&&typeof window.Operations149UI?.render==='function'){window.Operations149UI.render();}}
function resetTableView(key){ss().tableViews[key]={rules:[],sort:'',dir:'asc',quick:''};saveState(false);refreshTableView(key);}
let FILTER_DRAFT=null;
function openTableFilter(key){if(appState.isLocked)return;FILTER_DRAFT={key,...JSON.parse(JSON.stringify(tableView(key)))};gid('tableFilterModal')?.remove();const el=document.createElement('div');el.id='tableFilterModal';el.className='fixed inset-0 bg-black/60 flex items-center justify-center p-4';el.style.zIndex=10001;el.innerHTML='<section role="dialog" aria-modal="true" class="bg-white text-slate-800 rounded-2xl p-5 max-w-4xl w-full max-h-[90vh] overflow-auto"><h2 class="font-bold text-lg mb-3"></h2><p class="text-xs mb-3">تُطبّق كل الشروط معًا على نتائج البحث والفترة المختارة، وتشمل كل الصفحات. التصدير يتبع نفس النتائج والترتيب.</p><div id="tableSortControls" class="flex gap-2 mb-4"></div><div id="tableFilterRules" class="space-y-3"></div><button type="button" class="border rounded-lg px-3 py-2 mt-3" onclick="FILTER_DRAFT.rules.push({col:tableCols(FILTER_DRAFT.key)[0].id,op:\'contains\',value:\'\',to:\'\'});drawFilterRules()">+ شرط جديد</button><p id="filterError" role="status" class="text-rose-600 mt-2"></p><div class="flex justify-end gap-2 mt-4"><button onclick="gid(\'tableFilterModal\').remove()" class="border rounded-lg px-4 py-2">إلغاء</button><button onclick="commitTableFilter()" class="bg-teal-700 text-white rounded-lg px-4 py-2">تطبيق</button></div></section>';document.body.append(el);el.querySelector('h2').textContent='فلترة وترتيب — '+TABLE_DEFS[key].title;const cols=tableCols(key);gid('tableSortControls').innerHTML=`<label>ترتيب حسب <select class="border p-2 rounded-lg" onchange="FILTER_DRAFT.sort=this.value"><option value="">الترتيب الافتراضي</option>${cols.map(c=>`<option value="${c.id}" ${FILTER_DRAFT.sort===c.id?'selected':''}>${escapeHtml(c.label)}</option>`).join('')}</select></label><label>الاتجاه <select class="border p-2 rounded-lg" onchange="FILTER_DRAFT.dir=this.value"><option value="asc">تصاعدي (الأقل أولاً)</option><option value="desc" ${FILTER_DRAFT.dir==='desc'?'selected':''}>تنازلي (الأعلى أولاً)</option></select></label>`;drawFilterRules();}
function drawFilterRules(){const cols=tableCols(FILTER_DRAFT.key);gid('tableFilterRules').innerHTML=FILTER_DRAFT.rules.map((r,i)=>{const c=cols.find(c=>c.id===r.col)||cols[0],ops=c.type==='text'?[['contains','يحتوي على'],['eq','يساوي'],['empty','فارغ'],['notempty','غير فارغ']]:[['eq','يساوي'],['gt','أكبر / بعد'],['gte','أكبر أو يساوي / من'],['lt','أقل / قبل'],['lte','أقل أو يساوي / حتى'],['between','بين قيمتين'],['empty','فارغ'],['notempty','غير فارغ']];if(!ops.some(x=>x[0]===r.op))r.op=ops[0][0];return `<div class="flex flex-wrap gap-2 border rounded-lg p-3"><select class="border p-2 rounded-lg" onchange="FILTER_DRAFT.rules[${i}].col=this.value;drawFilterRules()">${cols.map(c=>`<option value="${c.id}" ${r.col===c.id?'selected':''}>${escapeHtml(c.label)}</option>`).join('')}</select><select class="border p-2 rounded-lg" onchange="FILTER_DRAFT.rules[${i}].op=this.value;drawFilterRules()">${ops.map(([v,t])=>`<option value="${v}" ${r.op===v?'selected':''}>${t}</option>`).join('')}</select>${['empty','notempty'].includes(r.op)?'':`<input aria-label="قيمة الشرط" type="${c.type==='date'?'date':'text'}" class="border p-2 rounded-lg" value="${escapeHtml(r.value||'')}" oninput="FILTER_DRAFT.rules[${i}].value=this.value">${r.op==='between'?`<input aria-label="القيمة الثانية" type="${c.type==='date'?'date':'text'}" class="border p-2 rounded-lg" value="${escapeHtml(r.to||'')}" oninput="FILTER_DRAFT.rules[${i}].to=this.value">`:''}`}<button class="border rounded-lg p-2" onclick="FILTER_DRAFT.rules.splice(${i},1);drawFilterRules()">حذف الشرط</button></div>`;}).join('')||'<p class="text-slate-500">لا توجد شروط؛ يمكنك استخدام الترتيب وحده.</p>';}
function commitTableFilter(){const d=FILTER_DRAFT,cols=tableCols(d.key);for(const r of d.rules){const c=cols.find(c=>c.id===r.col);if(!c||['empty','notempty'].includes(r.op))continue;const num=['number','cost'].includes(c.type),a=num?tableNumber(r.value):r.value,b=num?tableNumber(r.to):r.to;if(!r.value||num&&!Number.isFinite(a)||r.op==='between'&&(!r.to||num&&!Number.isFinite(b)||a>b)){gid('filterError').textContent='راجع قيم الشروط وحدود النطاق؛ البداية يجب ألا تزيد عن النهاية.';return;}}ss().tableViews[d.key]={rules:d.rules,sort:d.sort,dir:d.dir,quick:d.quick||''};saveState(false);gid('tableFilterModal').remove();refreshTableView(d.key);}
const tablePaged=pageRows;pageRows=function(key,rows,render){const filtered=tableApply(key,rows);const st=PAGE_STATE[key]||={page:0};st.raw=rows;const result=tablePaged(key,filtered,render);tableTools(key);return result;};
// One schema supplies filtering, sorting, Excel and PDF, preventing mismatched columns.
function tableTotalsRow(key,rows,cols){if(!ss().tableTotals?.[key])return null;const sums=new Set(['qty','discount','total','paid','due','sales','balance','in','out','actual','diff','value']);return cols.map((c,i)=>i===0?'إجمالي النتائج':sums.has(c.id)&&['number','cost'].includes(c.type)?r2(rows.reduce((a,o)=>a+Number(c.get(o)||0),0)):'');}
const reportBeforeTools=tableReport;tableReport=function(key){const st=PAGE_STATE[key],def=TABLE_DEFS[key];if(!st||!def)return reportBeforeTools(key);const cols=tableCols(key);return {title:def.title,html:reportHeader(def.title)+`<p>عدد النتائج: ${st.all.length} — جميع الصفحات حسب الفلترة والترتيب الحاليين.</p><table><thead><tr>${cols.map(c=>'<th>'+escapeHtml(c.label)+'</th>').join('')}</tr></thead><tbody>${st.all.map(o=>'<tr>'+cols.map(c=>'<td>'+escapeHtml(String(['discount','total','paid','due','sales','balance','in','out','value','cost','price'].includes(c.id)&&['number','cost'].includes(c.type)?formatCurrency(c.get(o)||0):c.get(o)??''))+'</td>').join('')+'</tr>').join('')}</tbody>${tableTotalsRow(key,st.all,cols)?'<tfoot><tr>'+tableTotalsRow(key,st.all,cols).map(v=>'<td><b>'+escapeHtml(String(v))+'</b></td>').join('')+'</tr></tfoot>':''}</table>`};};

// Browser XLSX builder fallback using JSZip so exportTableExcel works in both Electron and Browser modes
async function buildXlsxBlobInBrowser(payload){
 const {columns,rows,title}=payload||{};
 const xmlEsc=v=>String(v??'').replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g,'').slice(0,32767).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
 const colName=n=>{let s='';for(n++;n;n=Math.floor((n-1)/26))s=String.fromCharCode(65+(n-1)%26)+s;return s;};
 if(!window.JSZip){
  // Fallback CSV if JSZip is not loaded
  const cell=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
  const csv='\ufeff'+[columns.map(c=>c.label),...rows].map(r=>r.map(cell).join(',')).join('\r\n');
  return {blob:new Blob([csv],{type:'text/csv;charset=utf-8'}),ext:'csv'};
 }
 const cellXml=(v,c,r,header=false)=>{
  const pos=colName(c)+r;
  if(!header&&columns[c]?.type==='number'&&v!==''&&v!=null&&Number.isFinite(Number(v)))return `<c r="${pos}" s="2"><v>${Number(v)}</v></c>`;
  return `<c r="${pos}" t="inlineStr" s="${header?1:0}"><is><t xml:space="preserve">${xmlEsc(v)}</t></is></c>`;
 };
 const all=[columns.map(c=>c.label),...rows];
 const last=colName(Math.max(0,columns.length-1))+(rows.length+1);
 const ns='http://schemas.openxmlformats.org/spreadsheetml/2006/main';
 const zip=new window.JSZip();
 zip.file('[Content_Types].xml','<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>');
 zip.file('_rels/.rels','<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');
 zip.file('xl/workbook.xml',`<workbook xmlns="${ns}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${xmlEsc((title||'التقرير').slice(0,31))}" sheetId="1" r:id="rId1"/></sheets></workbook>`);
 zip.file('xl/_rels/workbook.xml.rels','<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>');
 zip.file('xl/styles.xml',`<styleSheet xmlns="${ns}"><fonts count="2"><font><sz val="11"/><name val="Arial"/></font><font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Arial"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF0F766E"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="3"><xf fontId="0" fillId="0" borderId="0" xfId="0"><alignment readingOrder="2" vertical="center"/></xf><xf fontId="1" fillId="2" borderId="0" xfId="0" applyFill="1" applyFont="1"><alignment readingOrder="2" wrapText="1"/></xf><xf numFmtId="4" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"><alignment readingOrder="2"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`);
 zip.file('xl/worksheets/sheet1.xml',`<worksheet xmlns="${ns}"><dimension ref="A1:${last}"/><sheetViews><sheetView workbookViewId="0" rightToLeft="1"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="20"/><cols>${columns.map((c,i)=>`<col min="${i+1}" max="${i+1}" width="${c.type==='number'?18:26}" customWidth="1"/>`).join('')}</cols><sheetData>${all.map((r,i)=>`<row r="${i+1}" ${i===0?'ht="32" customHeight="1"':''}>${r.map((v,c)=>cellXml(v,c,i+1,i===0)).join('')}</row>`).join('')}</sheetData><autoFilter ref="A1:${last}"/><pageMargins left="0.3" right="0.3" top="0.5" bottom="0.5" header="0.2" footer="0.2"/></worksheet>`);
 const blob=await zip.generateAsync({type:'blob',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
 return {blob,ext:'xlsx'};
}

async function exportTableExcel(key){
 if(appState.isLocked||!can('export'))return permDeny();
 const st=PAGE_STATE[key],cols=tableCols(key);
 if(!st||!TABLE_DEFS[key])return;
 const payload={
  title:TABLE_DEFS[key].title,
  columns:cols.map(c=>({label:c.label,type:['number','cost'].includes(c.type)?'number':'text'})),
  rows:st.all.map(o=>cols.map(c=>ss().hideCosts&&(PrivacyColumns630.groups(key,c.label).length>0||['cost'].includes(c.type))?'محجوب':c.get(o)??''))
 };
 try{
  if(window.api?.saveExcel){
   const r=await window.api.saveExcel(payload);
   if(r?.ok){showToast('تم حفظ Excel — '+st.all.length+' سجل','success');return r;}
   if(r?.canceled)return r;
   if(r?.error)throw Error(r.error);
  }
  const {blob,ext}=await buildXlsxBlobInBrowser(payload);
  const safeName=String(payload.title||'تقرير').replace(/[<>:"/\\|?*\x00-\x1f]/g,'_')+'_'+(typeof todayStr==='function'?todayStr():new Date().toISOString().slice(0,10))+'.'+ext;
  if(typeof window.saveFileWithDialog32==='function'){
   const saved=await window.saveFileWithDialog32(blob,safeName,ext==='xlsx'?'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':'text/csv','ملف Excel',ext);
   if(saved?.canceled)return saved;
   showToast('تم حفظ Excel — '+st.all.length+' سجل','success');
   return {ok:true,path:saved?.path||safeName};
  }
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=safeName;document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),10000);
  showToast('تم حفظ Excel — '+st.all.length+' سجل','success');
  return {ok:true,path:safeName};
 }catch(e){showToast(e.message||'تعذر تصدير ملف Excel','danger');}
}

// ============================================================================
// EXCEL / CSV TABLE IMPORT (استيراد Excel لجميع جداول البرنامج مع معاينة ذكية)
// ============================================================================
function parseCsvGrid(text){
 text=String(text||'').replace(/^\uFEFF/,'');
 const first=text.split(/\r?\n/,1)[0]||'';
 const delim=(first.match(/;/g)||[]).length>(first.match(/,/g)||[]).length?';':(first.includes('\t')?'\t':',');
 const rows=[];let row=[],cell='',quote=false;
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(c==='"'&&quote&&text[i+1]==='"'){cell+='"';i++;}
  else if(c==='"')quote=!quote;
  else if(c===delim&&!quote){row.push(cell.trim());cell='';}
  else if((c==='\n'||c==='\r')&&!quote){
   if(c==='\r'&&text[i+1]==='\n')i++;
   row.push(cell.trim());
   if(row.some(x=>String(x).trim()!==''))rows.push(row);
   row=[];cell='';
  }else cell+=c;
 }
 row.push(cell.trim());
 if(row.some(x=>String(x).trim()!==''))rows.push(row);
 return rows;
}

async function parseXlsxGrid(file){
 if(!window.JSZip)throw Error('مكوّن قراءة ملفات Excel (JSZip) غير محمّل.');
 const zip=await window.JSZip.loadAsync(file);
 const readStr=async p=>{const f=zip.file(p);return f?f.async('string'):'';};
 const parseXml=txt=>{const d=new DOMParser().parseFromString(txt,'application/xml');if(d.querySelector('parsererror'))throw Error('ملف Excel غير صالح.');return d;};
 const wbXml=await readStr('xl/workbook.xml');
 if(!wbXml)throw Error('لا يحتوي الملف على مصنف Excel قياسي.');
 const wb=parseXml(wbXml);
 const relId=wb.querySelector('sheet')?.getAttribute('r:id')||wb.querySelector('sheet')?.getAttribute('id');
 let sheetPath='xl/worksheets/sheet1.xml';
 const relsXml=await readStr('xl/_rels/workbook.xml.rels');
 if(relsXml&&relId){
  const relDoc=parseXml(relsXml);
  const relNode=[...relDoc.getElementsByTagName('Relationship')].find(x=>x.getAttribute('Id')===relId);
  if(relNode){
   let target=relNode.getAttribute('Target')||'';
   sheetPath=target.startsWith('/')?target.slice(1):'xl/'+target.replace(/^\.?\/+/,'');
  }
 }
 const sharedXml=await readStr('xl/sharedStrings.xml');
 const shared=sharedXml?[...parseXml(sharedXml).getElementsByTagName('si')].map(si=>[...si.getElementsByTagName('t')].map(t=>t.textContent).join('')):[];
 const sheetXml=await readStr(sheetPath)||await readStr('xl/worksheets/sheet1.xml');
 if(!sheetXml)throw Error('تعذر العثور على ورقة العمل داخل ملف Excel.');
 const doc=parseXml(sheetXml);
 const colIdx=ref=>{const m=/^[A-Z]+/.exec(String(ref||'').toUpperCase());if(!m)return -1;let n=0;for(const ch of m[0])n=n*26+ch.charCodeAt(0)-64;return n-1;};
 return [...doc.getElementsByTagName('row')].map(rowEl=>{
  const cells=[];
  let fallbackIdx=0;
  for(const c of [...rowEl.getElementsByTagName('c')]){
   const idx=colIdx(c.getAttribute('r'));
   const i=idx>=0?idx:fallbackIdx;
   fallbackIdx=i+1;
   const type=c.getAttribute('t');
   let val='';
   if(type==='inlineStr')val=[...c.getElementsByTagName('t')].map(t=>t.textContent).join('');
   else{
    val=c.getElementsByTagName('v')[0]?.textContent||'';
    if(type==='s')val=shared[Number(val)]??val;
   }
   cells[i]=String(val??'').trim();
  }
  return cells;
 }).filter(r=>r.some(x=>String(x??'').trim()!==''));
}

function cleanNumImport(val,def=0){
 if(val===undefined||val===null||val==='')return def;
 const s=String(val).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[^0-9.-]/g,'');
 const n=Number(s);
 return Number.isFinite(n)?Math.round(n*100)/100:def;
}

function importTableExcelRows(key,gridRows){
 if(!Array.isArray(gridRows)||!gridRows.length)throw Error('الملف فارغ ولا يحتوي على صفوف بيانات.');
 const def=TABLE_DEFS[key];
 if(!def)throw Error('الجدول غير مدعوم للاستيراد.');
 const normHeader=s=>typeof arabicKey==='function'?arabicKey(String(s||'')):String(s||'').trim().toLowerCase();
 const firstRow=gridRows[0].map(normHeader);
 const expectedLabels=def.cols.map(c=>normHeader(c.label));
 // Detect if row 0 is a header row
 const isHeader=firstRow.some(h=>expectedLabels.some(el=>h&&el&&(h.includes(el)||el.includes(h)))||/^(رقم|كود|الاسم|اسم|العميل|المورد|الصنف|الخامة|التاريخ|الإجمالي|الكمية|الهاتف|الخدمة|البيان|code|name|date|total|phone|qty)$/i.test(h));
 const dataRows=isHeader?gridRows.slice(1):gridRows;
 if(!dataRows.length)throw Error('لا توجد صفوف بيانات بعد سطر العناوين.');

 // Map column IDs to column index in the imported file
 const colMap={};
 def.cols.forEach((c,defaultIdx)=>{
  if(isHeader){
   const lbl=normHeader(c.label);
   let found=firstRow.findIndex(h=>h===lbl||h.includes(lbl)||lbl.includes(h));
   if(found<0){
    const synonyms={
     no:['رقم','فاتوره','عرض','order','no'],
     code:['كود','رمز','code','sku'],
     name:['اسم','العميل','المورد','الصنف','الخدمه','name','title'],
     client:['عميل','العميل','client','customer'],
     supplier:['مورد','المورد','supplier','vendor'],
     item:['خامه','الخامه','صنف','الصنف','item'],
     category:['تصنيف','فئه','category'],
     unit:['وحده','الوحدة','unit'],
     qty:['كميه','الكميه','رصيد','الرصيد','qty','quantity'],
     actual:['فعلي','الرصيد الفعلي','actual'],
     cost:['تكلفه','التكلفه','شراء','سعر الشراء','cost'],
     price:['سعر','سعر البيع','سعر الوحده','price'],
     min:['حد الطلب','الحد الادني','min'],
     discount:['خصم','الخصم','discount'],
     total:['اجمالي','الاجمالي','قيمه','total','amount'],
     paid:['مدفوع','المدفوع','مسدد','paid'],
     due:['متبقي','المتبقي','مديونيه','due','remaining'],
     phone:['هاتف','تليفون','موبايل','رقم الهاتف','phone','mobile'],
     address:['عنوان','العنوان','address'],
     balance:['رصيد','رصيد الحساب','الرصيد','balance'],
     date:['تاريخ','التاريخ','date'],
     delivery:['تسليم','موعد التسليم','delivery'],
     status:['حاله','الحاله','status'],
     desc:['بيان','البيان','وصف','desc','description'],
     in:['وارد','ايداع','مقبوض','in'],
     out:['صادر','صرف','مصروف','out'],
     notes:['ملاحظات','ملاحظه','notes']
    };
    const syns=(synonyms[c.id]||[]).map(normHeader);
    found=firstRow.findIndex(h=>syns.some(syn=>h===syn||h.includes(syn)));
   }
   colMap[c.id]=found>=0?found:defaultIdx;
  }else{
   colMap[c.id]=defaultIdx;
  }
 });

 const getVal=(row,colId)=>String(row[colMap[colId]]??'').trim();
 const today=typeof todayStr==='function'?todayStr():new Date().toISOString().slice(0,10);
 let added=0,updated=0;

 if(key==='inventoryTableBody'||key==='stockTakeTableBody'){
  appState.items=appState.items||[];
  for(const r of dataRows){
   const name=getVal(r,'name')||getVal(r,'code');
   if(!name)continue;
   const code=getVal(r,'code')||('ITM-'+String(appState.items.length+101));
   const category=getVal(r,'category')||'خامات عامة';
   const unit=getVal(r,'unit')||'فرخ';
   const qty=cleanNumImport(getVal(r,'qty'),0);
   const buyPrice=cleanNumImport(getVal(r,'cost'),0);
   const sellPrice=cleanNumImport(getVal(r,'price'),buyPrice);
   const minQty=cleanNumImport(getVal(r,'min'),10);
   const actualStr=getVal(r,'actual');
   const existing=appState.items.find(it=>(code&&String(it.code||'').toLowerCase()===code.toLowerCase())||String(it.name||'').trim()===name);
   if(existing){
    existing.name=name;existing.category=category;existing.unit=unit;
    if(getVal(r,'qty')!=='')existing.qty=qty;
    if(getVal(r,'cost')!=='')existing.buyPrice=buyPrice;
    if(getVal(r,'price')!=='')existing.sellPrice=sellPrice;
    if(getVal(r,'min')!=='')existing.minQty=minQty;
    if(key==='stockTakeTableBody'&&actualStr!=='')existing.lastActualCount=cleanNumImport(actualStr,existing.qty);
    updated++;
   }else{
    const newItem={id:'i_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7),code,name,category,unit,qty,buyPrice,sellPrice,minQty};
    if(key==='stockTakeTableBody'&&actualStr!=='')newItem.lastActualCount=cleanNumImport(actualStr,qty);
    appState.items.push(newItem);
    added++;
   }
  }
 }else if(key==='clientsTableBody'){
  appState.clients=appState.clients||[];
  for(const r of dataRows){
   const name=getVal(r,'name');if(!name)continue;
   const phone=getVal(r,'phone');
   const address=getVal(r,'address');
   const bal=cleanNumImport(getVal(r,'balance'),0);
   const existing=appState.clients.find(c=>c.name===name||(phone&&c.phone===phone));
   if(existing){
    if(phone)existing.phone=phone;
    if(address)existing.address=address;
    if(getVal(r,'balance')!=='')existing.initialBalance=bal;
    updated++;
   }else{
    appState.clients.push({id:'c_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7),name,phone,address,initialBalance:bal});
    added++;
   }
  }
 }else if(key==='suppliersTableBody'){
  appState.suppliers=appState.suppliers||[];
  for(const r of dataRows){
   const name=getVal(r,'name');if(!name)continue;
   const phone=getVal(r,'phone');
   const items=getVal(r,'items');
   const bal=cleanNumImport(getVal(r,'balance'),0);
   const existing=appState.suppliers.find(s=>s.name===name||(phone&&s.phone===phone));
   if(existing){
    if(phone)existing.phone=phone;
    if(items)existing.items=items;
    if(getVal(r,'balance')!=='')existing.balance=bal;
    updated++;
   }else{
    appState.suppliers.push({id:'s_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7),name,phone,items,balance:bal});
    added++;
   }
  }
 }else if(key==='ordersTableBody'||key==='dashRecentOrdersTable'){
  appState.orders=appState.orders||[];
  appState.clients=appState.clients||[];
  for(const r of dataRows){
   const clientName=getVal(r,'client')||'عميل نقدي';
   const jobType=getVal(r,'desc')||'أمر طباعة';
   const total=cleanNumImport(getVal(r,'total'),0);
   if(! getVal(r,'client')&&!getVal(r,'desc')&&total===0)continue;
   const orderNo=cleanNumImport(getVal(r,'no'),0)||(Math.max(1000,...appState.orders.map(o=>Number(o.orderNo)||0))+1);
   const date=getVal(r,'date')||today;
   const qty=Math.max(1,cleanNumImport(getVal(r,'qty'),1));
   const discount=cleanNumImport(getVal(r,'discount'),0);
   const paid=cleanNumImport(getVal(r,'paid'),0);
   const deliveryDate=getVal(r,'delivery')||date;
   const status=getVal(r,'status')||'قيد التنفيذ';
   let client=appState.clients.find(c=>c.name===clientName);
   if(!client&&clientName!=='عميل نقدي'){
    client={id:'c_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6),name:clientName,phone:'',address:'',initialBalance:0};
    appState.clients.push(client);
   }
   const existing=appState.orders.find(o=>String(o.orderNo)===String(orderNo));
   if(existing){
    existing.clientName=clientName;existing.jobType=jobType;existing.quantity=qty;existing.discount=discount;existing.total=total;existing.paid=paid;existing.remaining=Math.max(0,total-paid);existing.deliveryDate=deliveryDate;existing.status=status;
    updated++;
   }else{
    appState.orders.push({
     id:'o_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7),
     orderNo,date,clientId:client?client.id:'',clientName,jobType,quantity:qty,discount,total,paid,remaining:Math.max(0,total-paid),deliveryDate,status,
     lines:[{kind:'manual',desc:jobType,qty,price:qty>0?Math.round(((total+discount)/qty)*100)/100:total,discount,amount:total}]
    });
    added++;
   }
  }
 }else if(key==='purchasesTableBody'){
  appState.purchases=appState.purchases||[];
  appState.suppliers=appState.suppliers||[];
  appState.items=appState.items||[];
  for(const r of dataRows){
   const supplierName=getVal(r,'supplier')||'مورد عام';
   const itemName=getVal(r,'item');
   if(!itemName)continue;
   const qty=cleanNumImport(getVal(r,'qty'),1);
   const unitPrice=cleanNumImport(getVal(r,'price'),0);
   const total=cleanNumImport(getVal(r,'total'),qty*unitPrice);
   const paid=cleanNumImport(getVal(r,'paid'),0);
   const due=Math.max(0,total-paid);
   const date=getVal(r,'date')||today;
   let sup=appState.suppliers.find(s=>s.name===supplierName);
   if(!sup){sup={id:'s_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6),name:supplierName,phone:'',items:itemName,balance:0};appState.suppliers.push(sup);}
   let item=appState.items.find(i=>i.name===itemName);
   if(!item){item={id:'i_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6),code:'ITM-'+(appState.items.length+101),name:itemName,category:'خامات عامة',unit:'فرخ',qty:0,buyPrice:unitPrice,sellPrice:unitPrice,minQty:10};appState.items.push(item);}
   if(Math.abs(total-AccountingMath401.lineTotal(qty,unitPrice))>.001)throw Error('إجمالي الوارد المستورد لا يساوي الكمية × السعر؛ سجّل الخصم من فاتورة الوارد');
   const importedId=getVal(r,'id');if(importedId&&appState.purchases.some(p=>p.id===importedId))throw Error('رقم الوارد المستورد موجود بالفعل؛ استخدم تعديل المستند الأصلي');
   const prepared=PurchaseBatch400.plan(appState,{supplierId:sup.id,lines:[{itemId:item.id,qty,unitPrice}],paid,date,method:'غير محدد — وارد مستورد',user:getCurrentUser().name||getCurrentUser().username});
   if(importedId){const generated=prepared.purchases[0].id;prepared.purchases[0].id=importedId;prepared.treasury.forEach(t=>{if(t.purchaseId===generated)t.purchaseId=importedId;});}
   PurchaseBatch400.apply(appState,prepared);
   added++;
  }
 }else if(key==='treasuryTableBody'){
  appState.treasury=appState.treasury||[];
  for(const r of dataRows){
   const desc=getVal(r,'desc');
   const inAmount=cleanNumImport(getVal(r,'in'),0);
   const outAmount=cleanNumImport(getVal(r,'out'),0);
   if(!desc&&inAmount===0&&outAmount===0)continue;
   const date=getVal(r,'date')||today;
   const rawType=getVal(r,'type');
   const type=rawType.includes('تحصيل')?'collection':rawType.includes('مورد')?'supplier_payment':rawType.includes('رصيد')?'opening_balance':outAmount>0?'expense':'manual_deposit';
   appState.treasury.push({
    id:'t_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7),
    date,type,desc:desc||'حركة مستوردة من Excel',inAmount,outAmount,paymentMethod:'نقدي (الخزينة)',user:getVal(r,'user')||(typeof getCurrentUser==='function'?getCurrentUser().name:'المدير')
   });
   added++;
  }
 }else if(key==='servicesTableBody'){
  appState.services=appState.services||[];
  for(const r of dataRows){
   const title=getVal(r,'title');if(!title)continue;
   const date=getVal(r,'date')||today;
   const kindStr=getVal(r,'kind');
   const kind=kindStr.includes('لي')?'received':'provided';
   const partyName=getVal(r,'party')||'خدمة عامة';
   const amount=cleanNumImport(getVal(r,'total'),0);
   const paid=cleanNumImport(getVal(r,'paid'),0);
   const notes=getVal(r,'notes');
   appState.services.push({
    id:getVal(r,'id')||('srv_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7)),
    date,kind,title,partyType:'other',partyId:'',partyName,amount,paid,notes
   });
   added++;
  }
 }else if(key==='serviceCatalogTableBody'){
  appState.serviceCatalog=appState.serviceCatalog||[];
  for(const r of dataRows){
   const name=getVal(r,'name');if(!name)continue;
   const code=getVal(r,'code')||('SRV-'+(appState.serviceCatalog.length+101));
   const category=getVal(r,'category')||'عام';
   const unit=getVal(r,'unit')||'خدمة';
   const cost=cleanNumImport(getVal(r,'cost'),0);
   const price=cleanNumImport(getVal(r,'price'),0);
   const notes=getVal(r,'notes');
   const existing=appState.serviceCatalog.find(s=>String(s.code||'').toLowerCase()===code.toLowerCase()||s.name===name);
   if(existing){
    existing.category=category;existing.unit=unit;existing.cost=cost;existing.price=price;existing.notes=notes;
    updated++;
   }else{
    appState.serviceCatalog.push({id:'sc_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7),code,category,name,unit,cost,price,notes});
    added++;
   }
  }
 }else if(key==='quotesTableBody'){
  appState.quotes=appState.quotes||[];
  for(const r of dataRows){
   const clientName=getVal(r,'client')||'عميل';
   const jobType=getVal(r,'desc')||'عرض سعر';
   const total=cleanNumImport(getVal(r,'total'),0);
   if(!getVal(r,'client')&&!getVal(r,'desc')&&total===0)continue;
   const no=cleanNumImport(getVal(r,'no'),0)||(appState.quotes.length+101);
   const date=getVal(r,'date')||today;
   const validUntil=getVal(r,'valid')||date;
   const status=getVal(r,'status')||'قيد المراجعة';
   appState.quotes.push({
    id:'q_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7),
    no,date,validUntil,clientName,jobType,total,status,lines:[{kind:'manual',desc:jobType,qty:1,price:total,discount:0,amount:total}]
   });
   added++;
  }
 }else if(key==='usersTableBody'){
  if(typeof isAdmin==='function'&&!isAdmin())throw Error('استيراد المستخدمين متاح للمدير فقط.');
  appState.users=appState.users||[];
  for(const r of dataRows){
   const username=getVal(r,'username');
   const name=getVal(r,'name')||username;
   if(!username)continue;
   const roleStr=getVal(r,'role');
   const role=roleStr.includes('مدير')?'admin':roleStr.includes('مخزن')?'storekeeper':'cashier';
   const existing=appState.users.find(u=>u.username===username);
   if(existing){existing.name=name;existing.role=role;updated++;}
   else{appState.users.push({id:'u_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6),username,name,role,pin:'1234',pinDefault:true});added++;}
  }
 }else if(key==='statementMovements'&&window.STMT?.id){
  appState.adjustments=appState.adjustments||[];
  for(const r of dataRows){
   const desc=getVal(r,'desc');
   const debit=cleanNumImport(getVal(r,'debit'),0);
   const credit=cleanNumImport(getVal(r,'credit'),0);
   if(debit===0&&credit===0)continue;
   appState.adjustments.push({
    id:'adj_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6),
    party:window.STMT.kind||'client',partyId:window.STMT.id,date:getVal(r,'date')||today,
    dir:debit>0?'debit':'credit',amount:debit>0?debit:credit,note:desc||'قيد مستورد من Excel'
   });
   added++;
  }
 }

 if(added===0&&updated===0)throw Error('لم يتم العثور على سجلات صالحة للاستيراد في هذا الملف.');
 saveState();
 if(typeof updateAllUI==='function')updateAllUI();
 refreshTableView(key);
 return {added,updated,total:added+updated};
}

function showTableExcelImportModal(key,fileName,gridRows){
 gid('tableExcelImportModal')?.remove();
 const def=TABLE_DEFS[key];
 const previewRows=gridRows.slice(0,25);
 const modal=document.createElement('div');
 modal.id='tableExcelImportModal';
 modal.className='fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[35000]';
 modal.innerHTML=`
  <section dir="rtl" class="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl p-5 max-w-4xl w-full max-h-[90vh] overflow-auto shadow-2xl space-y-4">
   <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
    <div>
     <h3 class="font-black text-lg flex items-center gap-2"><i class="fa-solid fa-file-import text-teal-600"></i><span>معاينة استيراد Excel — ${escapeHtml(def?.title||'الجدول')}</span></h3>
     <p class="text-xs text-slate-500 mt-1">الملف: <b>${escapeHtml(fileName)}</b> • إجمالي الصفوف المقروءة: <b>${gridRows.length}</b></p>
    </div>
    <button type="button" id="closeExcelImportModalBtn" class="px-3 py-1 border rounded-lg text-xs font-bold">إغلاق ✕</button>
   </div>
   <div class="overflow-x-auto border rounded-xl max-h-[50vh] dark:border-slate-700">
    <table class="w-full text-xs text-right">
     <tbody>
      ${previewRows.map((r,idx)=>`<tr class="border-b dark:border-slate-700 ${idx===0?'bg-teal-50/70 dark:bg-slate-700 font-black':''}">${r.map(cell=>`<td class="p-2 border-l dark:border-slate-700">${escapeHtml(String(cell??''))}</td>`).join('')}</tr>`).join('')}
     </tbody>
    </table>
   </div>
   <p id="excelImportModalErr" class="text-xs text-rose-600 font-bold"></p>
   <div class="flex justify-end gap-2 pt-2 border-t dark:border-slate-700">
    <button type="button" id="cancelExcelImportModalBtn" class="px-4 py-2 border rounded-xl text-xs font-bold">إلغاء</button>
    <button type="button" id="confirmExcelImportModalBtn" class="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow"><i class="fa-solid fa-check"></i><span>اعتماد واستيراد البيانات للجدول</span></button>
   </div>
  </section>`;
 document.body.append(modal);
 const close=()=>modal.remove();
 modal.querySelector('#closeExcelImportModalBtn')?.addEventListener('click',close);
 modal.querySelector('#cancelExcelImportModalBtn')?.addEventListener('click',close);
 modal.querySelector('#confirmExcelImportModalBtn')?.addEventListener('click',()=>{
  try{
   const res=importTableExcelRows(key,gridRows);
   close();
   showToast(`تم استيراد بيانات Excel إلى ${def?.title||'الجدول'} بنجاح (إضافة: ${res.added} • تحديث: ${res.updated})`,'success');
  }catch(e){
   const errEl=modal.querySelector('#excelImportModalErr');
   if(errEl)errEl.textContent=e.message||'تعذر استيراد البيانات';
  }
 });
}

async function importTableExcel(key){
 if(appState.isLocked)return permDeny();
 if(!TABLE_DEFS[key])return;
 const inp=document.createElement('input');
 inp.type='file';
 inp.accept='.xlsx,.xlsm,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv';
 inp.onchange=async()=>{
  const file=inp.files?.[0];
  if(!file)return;
  try{
   const ext=(file.name.split('.').pop()||'').toLowerCase();
   let gridRows=[];
   if(ext==='csv'||file.type==='text/csv'){
    gridRows=parseCsvGrid(await file.text());
   }else if(['xlsx','xlsm'].includes(ext)){
    gridRows=await parseXlsxGrid(file);
   }else{
    throw Error('يرجى اختيار ملف Excel بصيغة (.xlsx) أو (.csv) فقط.');
   }
   if(!gridRows.length)throw Error('الملف المختار لا يحتوي على بيانات قابلة للقراءة.');
   showTableExcelImportModal(key,file.name,gridRows);
  }catch(e){
   showToast(e.message||'تعذر قراءة ملف Excel','danger');
  }
 };
 inp.click();
}
window.importTableExcel=importTableExcel;
window.importTableExcelRows=importTableExcelRows;
window.exportTableExcel=exportTableExcel;

const tableCSVBefore=exportTableToCSV;exportTableToCSV=function(id,name){const key=gid(id)?.tBodies[0]?.id;if(!TABLE_DEFS[key]||!PAGE_STATE[key])return tableCSVBefore(id,name);if(appState.isLocked||!can('export'))return permDeny();const cell=v=>'"'+String(v??'').replace(/^[=+@\t\r]|^-(?=\D)/,"'$&").replace(/"/g,'""')+'"',cols=tableCols(key),rows=[cols.map(c=>c.label),...PAGE_STATE[key].all.map(o=>cols.map(c=>c.get(o)))],a=document.createElement('a'),url=URL.createObjectURL(new Blob(['\ufeff'+rows.map(row=>row.map(cell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}));a.href=url;a.download=(name||TABLE_DEFS[key].title)+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);};
for(const [key,name] of Object.entries({ordersTableBody:'renderOrdersTable',inventoryTableBody:'renderInventoryTable',stockTakeTableBody:'renderStockTakeTable',purchasesTableBody:'renderPurchasesTable',clientsTableBody:'renderClientsTable',suppliersTableBody:'renderSuppliersTable',treasuryTableBody:'renderTreasuryTable',servicesTableBody:'renderServicesTable',quotesTableBody:'renderQuotes',usersTableBody:'renderUsersTable',dashRecentOrdersTable:'renderDashboard'})){const original=window[name];window[name]=function(...args){const st=PAGE_STATE[key]||={page:0};st.all=[];const r=original(...args);st.render=window[name];if(!st.all.length){pageRows(key,[],window[name]);const body=gid(key);if(body&&!body.rows.length)body.innerHTML='<tr><td colspan="20" class="p-5 text-center text-slate-500">لا توجد نتائج مطابقة للفلترة.</td></tr>';}tableTools(key);return r;};}
const statementMatchBefore=statementEntries;statementEntries=function(c){const raw=statementMatchBefore(c),rows=tableApply('statementMovements',raw);PAGE_STATE.statementMovements={all:rows,raw,render:renderStatement};return rows;};
const statementRenderTools=renderStatement;renderStatement=function(){const r=statementRenderTools();if(gid('statementNavV12'))tableTools('statementMovements',gid('statementNavV12'));return r;};
const statementCsvBefore=exportStatementCSV;exportStatementCSV=function(){if(appState.isLocked||!can('export'))return permDeny();const rows=PAGE_STATE.statementMovements?.all;if(!rows)return statementCsvBefore();const cols=tableCols('statementMovements'),cell=v=>'"'+String(v??'').replace(/^[=+@\t\r]|^-(?=\D)/,"'$&").replace(/"/g,'""')+'"';const a=document.createElement('a'),url=URL.createObjectURL(new Blob(['\ufeff'+[cols.map(c=>c.label),...rows.map(o=>cols.map(c=>c.get(o)))].map(row=>row.map(cell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}));a.href=url;a.download='كشف_حساب.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);};

const importRowsBefore640=importTableExcelRows;importTableExcelRows=function(...args){const snapshot640=JSON.stringify(appState),committed640=lastCommittedState;try{return importRowsBefore640.apply(this,args);}catch(e){appState=JSON.parse(lastCommittedState!==committed640?lastCommittedState:snapshot640);ledgerIndex=null;throw e;}};window.importTableExcelRows=importTableExcelRows;
