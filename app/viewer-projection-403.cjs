'use strict';
const Money=require('./accounting-math-401.js'),Settlement=require('./settlement-150-model.js'),Operations=require('./operations-149-model.js'),Features=require('./features-147-model.js');
const pick=(o,keys)=>Object.fromEntries(keys.filter(k=>Object.prototype.hasOwnProperty.call(o||{},k)).map(k=>[k,o[k]]));
const fields={
 clients:['id','name','phone','phone2','address','initialBalance'],
 suppliers:['id','name','phone','phone2','address','material','balance'],
 items:['id','code','name','category','unit','qty','minQty','buyPrice','sellPrice','avgCost166'],
 orders:['id','orderNo','date','time','clientId','clientName','jobType','specs','quantity','subtotal','discount','invDiscount','total','paid','status','deliveryDate','paymentMethod'],
 purchases:['id','receiptBatch400','receiptLine400','date','supplierId','supplierName','itemId','itemName','qty','unitPrice','total','paid','due','paymentMethod','gross408','lineDiscount408','invoiceDiscount408','discount408'],
 treasury:['id','date','type','desc','notes','inAmount','outAmount','clientId','supplierId','orderId','purchaseId','serviceId','kind','paymentMethod','user'],
 services:['id','date','kind','partyType','partyId','partyName','title','amount','paid','notes','inTreasury','external407','paymentMethod','gross408','lineDiscount408','invoiceDiscount408','discount408'],
 quotes:['id','orderNo','date','clientId','clientName','jobType','specs','quantity','subtotal','discount','total','status','validUntil','deliveryDate','convertedNo'],
 adjustments:['id','date','party','partyId','debit','credit','desc','note','reason','user'],
 stockAdjustments153:['id','date','itemId','itemName','bookQty','actualQty','deltaQty','unitCost','valueDelta','reason','user'],
 waste149:['id','date','orderId','itemId','qty','unitCost','chargedTo','reason','voidAt','user'],
 costs149:['id','date','orderId','desc','amount','treasuryId','mode','voidAt','user'],
 shifts149:['id','openedAt','closedAt','closedBy','user','opening','expected','counted','difference','note'],
 reservations149:['id','quoteId','status','at','orderId','consumedAt','releasedAt'],
 serviceCatalog:['id','name','category','unit','price','cost'],
 pricing149:['id','ref','enabled','extraColor','back','setup','minimum']
};
const ServicePayments=require('./service-payments-401.js');
const lineFields=['desc','notes','qty','price','amount','total','kind','discount','discountType','discountValue','itemId','serviceCatalogId','itemName','code','unit'];
const cents=v=>Number(Money.scaled(Number(v)||0,2));
function projectViewer(input,revision){
 const s=typeof input==='string'?JSON.parse(input):input||{};const statement610=require('./statements-610.js').index(s);
 const profitReport650=require('./workspace-650.js').profit(s),profitIndex650=new Map(profitReport650.rows.map(r=>[r.id,r]));
 const rows=name=>Array.isArray(s[name])?s[name]:[];const contact630=new Map(rows('clients').map(c=>[c.id,c]));
 const result={schema:2,readOnly:true,revision:Number(revision)||0,syncedAt:new Date().toISOString(),shop:{name:String(s.shopSettings?.name||'الحمد برنت'),currency:String(s.shopSettings?.money?.symbol??'ج.م').slice(0,12)}};
 const shop630=s.shopSettings||{},inv630=shop630.inv||{},secs630=inv630.secs||{};result.shop.invoiceIdentity630={showClientName:secs630.clientName!==false,showClientPhone:secs630.clientPhone!==false,showClientAddress:secs630.clientAddress!==false,name:secs630.shopName===false?'':String(inv630.customShopName||shop630.name||'الحمد برنت').slice(0,300),subTitle:secs630.subtitle===false?'':String(inv630.customShopSubTitle||shop630.subTitle||'للطباعة والدعاية والإعلان').slice(0,300),phone1:secs630.phones===false?'':String(inv630.customShopPhone1||shop630.phone1||'').slice(0,80),phone2:secs630.phones===false?'':String(inv630.customShopPhone2||shop630.phone2||'').slice(0,80),address:secs630.address===false?'':String(inv630.customShopAddress||shop630.address||'').slice(0,600)};
 result.shop.invoiceColumns=Object.fromEntries(['idx','desc','qty','price','disc','amount','notes','code','unit','kind','spec','gross','discountRate'].map(key=>[key,key==='desc'||(s.shopSettings?.inv?.cols?.[key]??!['code','unit','kind','spec','gross','discountRate'].includes(key))!==false]));
 const clientPlan411=Settlement.plan(s),paid=clientPlan411.paid;
 const servicePayments407=new Map();for(const t of rows('treasury'))if(t.serviceId){if(!servicePayments407.has(t.serviceId))servicePayments407.set(t.serviceId,[]);servicePayments407.get(t.serviceId).push(t);}
 for(const [name,keys]of Object.entries(fields))result[name]=rows(name).map(row=>{
  const value=pick(row,keys);if(name==='orders'||name==='quotes'){const c=contact630.get(row.clientId);if(c){value.clientPhone=String(c.phone||'').slice(0,80);value.clientAddress=String(c.address||'').slice(0,600);}}if(name==='clients'||name==='suppliers'){const d=statement610(name==='clients'?'client':'supplier',row.id);if(d)value.statement610={opening:d.opening,entries:d.entries.map(e=>({seq:e.seq,date:e.date,time:e.time,ref:e.ref,kind:e.kind,src:e.src,sourceKind:e.sourceKind,desc:e.desc,debit:e.debit,credit:e.credit,counterparty411:!!e.counterparty411}))};}
  if((name==='services'||name==='purchases')&&row.discountSchema408)value.notes=String(row.notes||'')+'\nقبل الخصم: '+row.gross408+' · خصم البنود: '+(row.lineDiscount408||0)+' · خصم الفاتورة: '+(row.invoiceDiscount408||0)+' · الصافي: '+(row.amount??row.total);
  if(name==='services')value.payments407=ServicePayments.entries(row,servicePayments407.get(row.id)||[]).map(p=>({date:p.date.slice(0,40),amount:p.amount}));
  if(name==='services'&&row.external407===true)value.lines407=(row.lines407||[]).map(l=>pick(l,['title','unit','qty','price','amount']));
  if(name==='orders'||name==='quotes')value.lines=(Array.isArray(row.lines)?row.lines:[]).map(l=>({...pick(l,lineFields),specText404:Operations.specFields.filter(([k])=>['string','number','boolean'].includes(typeof l.spec149?.[k])&&String(l.spec149[k]).trim()).map(([k,label])=>label+': '+String(l.spec149[k]).slice(0,500)).join(' · ')}));
  if(name==='orders'){value.opsStage404=String(row.ops149?.stage||row.status||'قيد التنفيذ').slice(0,100);value.opsAssignee404=String(row.ops149?.assignee||'').slice(0,120);value.settledPaid150=paid.get(row.id)??Number(row.paid||0);value.remaining=Math.max(0,Money.round(Number(row.total||0)-value.settledPaid150));const profit=profitIndex650.get(row.id);value.costKnown=!!profit&&profit.profit!==null;if(value.costKnown){value.cost=profit.cost;value.profit=profit.profit;}value.costSnapshot149=Array.isArray(row.costSnapshot149)?row.costSnapshot149.map(l=>pick(l,['itemId','serviceCatalogId','qty','unitCost'])):[];}
  if(name==='pricing149')value.tiers=(Array.isArray(row.tiers)?row.tiers:[]).map(l=>pick(l,['min','max','price']));
  if(name==='reservations149')value.lines=(Array.isArray(row.lines)?row.lines:[]).map(l=>pick(l,['itemId','qty']));
  if(name==='shifts149')for(const key of ['opening','expected','counted','difference'])if(value[key]&&typeof value[key]==='object')value[key]=Object.fromEntries(Object.entries(value[key]).filter(([,v])=>typeof v==='number'||typeof v==='string'&&Number.isFinite(Number(v))).map(([k,v])=>[k,Number(v)]));
  return value;
 });
 result.salesReturns640=rows('salesReturns640').map(n=>{const c=contact630.get(n.clientId)||{};return {...pick(n,['id','no','date','clientId','clientName','total','refund','credit','reason','user','orderId']),orderNo:n.no,originalOrderNo640:n.orderNo,title:'إشعار دائن '+n.no,title640:'إشعار دائن — مرتجع مبيعات',totalLabel640:'صافي الإشعار الدائن',paidLabel640:'المردود للعميل',remainingLabel640:'تخفيض الحساب / رصيد دائن',clientPhone:String(c.phone||'').slice(0,80),clientAddress:String(c.address||'').slice(0,600),paid:n.refund,settledPaid150:n.refund,remaining:n.credit,paymentMethod:n.method||'',specs:'مرتجع على فاتورة #'+n.orderNo+' · '+n.reason,lines:(n.lines||[]).map(l=>pick(l,lineFields)),stock640:(n.stock||[]).map(l=>pick(l,['itemId','itemName','qty','unit']))};});
 const Workspace650=require('./workspace-650.js'),Workflow650=require('./workflow-650.js'),Corrections650=require('./corrections-650.js');
 const profit650=profitReport650;result.profit650=profit650.rows.map(r=>({...r,title:'ربحية #'+r.orderNo,notes:r.profit===null?'التكلفة التاريخية غير مسجلة؛ الربح غير معروف':'ربح تشغيلي للطلب بعد المرتجعات والتسويات والتكاليف المحملة'}));result.profitSummary650={...profit650.totals,unknown:profit650.unknown,unallocated:Money.round(profit650.unallocated.reduce((n,r)=>n+r.amount,0))};
 result.proofApprovals650=rows('proofApprovals650').map(p=>{const o=rows('orders').find(o=>o.id===p.orderId);return {...pick(p,['id','orderId','action','customerDate','channel','notes','user','createdAt']),date:p.customerDate||String(p.createdAt||'').slice(0,10),title:(p.action==='approve'?'اعتماد بروفة':'إلغاء اعتماد')+' #'+(o?.orderNo||''),status:o&&Workflow650.approval(s,o)?.id===p.id?'اعتماد حالي':'اعتماد سابق / ملغى',attachmentName:String(p.attachment?.name||'').slice(0,180)};});
 result.corrections650=rows('corrections650').map(n=>({...pick(n,['id','no','date','reason','user','collection','recordId','refund','method']),title:'إشعار تصحيح '+n.no,sourceTitle:String(n.source?.title||n.source?.desc||n.source?.itemName||n.source?.id||''),postings:{treasury:(n.postings?.treasury||[]).map(t=>pick(t,fields.treasury)),adjustments:(n.postings?.adjustments||[]).map(a=>pick(a,fields.adjustments)),stock:(n.postings?.stock||[]).map(x=>pick(x,['itemId','qty','average']))}}));
 const today650=Workspace650.today(s,new Date().toLocaleDateString('en-CA',{timeZone:'Africa/Cairo'}));result.today650=[];for(const [key,list]of Object.entries(today650))for(const x of list)result.today650.push({id:key+':'+x.id,title:({due:'تسليم اليوم',late:'طلب متأخر',proof:'اعتماد بروفة',receivables:'متابعة تحصيل'})[key]+' — '+(x.orderNo?'#'+x.orderNo+' · '+x.clientName:x.name),category:key,date:x.deliveryDate||'',orderId:x.orderNo?x.id:'',clientId:key==='receivables'?x.id:x.clientId||'',amount:key==='receivables'?x.due650:undefined,status:x.ops149?.stage||x.status||'مستحق'});
 for(const o of result.orders){const source=rows('orders').find(x=>x.id===o.id),p=profit650.rows.find(x=>x.id===o.id);o.proofRequired650=Workflow650.gated(source);const approved=Workflow650.approval(s,source);o.proofStatus650=approved?'معتمد بتاريخ '+approved.customerDate+' عبر '+approved.channel:Workflow650.gated(source)?'ينتظر اعتماد البروفة':'الاعتماد غير مطلوب';if(p){o.profit=p.profit;o.cost=p.cost;o.costKnown=p.profit!==null;} }
 for(const k of ['purchases','services','costs149','waste149'])for(const row of result[k])if(Corrections650.reversed(s,k,row.id))row.correctionStatus650='تم عكس المستند؛ الأصل محفوظ';
 const wallet={};
 for(const t of rows('treasury')){const method=Features.methodOf(t,rows('orders'),rows('purchases'));wallet[method]=(wallet[method]||0)+cents(t.inAmount)-cents(t.outAmount);}
 for(const shift of result.shifts149)if(!shift.closedAt){const source=rows('shifts149').find(r=>r.id===shift.id)||{};shift.expected={};for(const method of new Set([...Object.keys(wallet),...Object.keys(source.opening||{}),...Object.keys(source.baseline||{})]))shift.expected[method]=(cents(source.opening?.[method])+(wallet[method]||0)-cents(source.baseline?.[method]))/100;}
 const client=new Map(result.clients.map(c=>[c.id,cents(c.initialBalance)])),supplier=new Map(result.suppliers.map(p=>[p.id,cents(p.balance)]));
 const add=(map,id,n)=>{if(map.has(id))map.set(id,map.get(id)+n);};
 for(const o of result.orders)add(client,o.clientId,cents(o.total)-cents(o.paid));
 for(const p of result.purchases)add(supplier,p.supplierId,cents(p.due));
 for(const t of result.treasury){
  if(t.clientId&&t.type==='collection'&&!Settlement.deposit(t))add(client,t.clientId,-cents(t.inAmount));
  if(t.supplierId&&t.type==='supplier_payment'&&t.kind!=='purchase_payment'&&!/^سداد نقدي لوارد/.test(t.desc||''))add(supplier,t.supplierId,-cents(t.outAmount));
 }
 for(const a of result.adjustments)add(a.party==='client'?client:supplier,a.partyId,cents(a.debit)-cents(a.credit));
 for(const v of result.services){const sign=(v.partyType==='client')===(v.kind==='provided')?1:-1;add(v.partyType==='client'?client:supplier,v.partyId,sign*(cents(v.amount)-cents(v.paid)));}
 const P=require('./party-ledger-411.js'),net=P.balances(s),sp=P.supplierPlan(s);
 for(const c of result.clients)c.currentBalance=net.clients.get(c.id)||0;
 for(const p of result.suppliers)p.currentBalance=net.suppliers.get(p.id)||0;
 for(const [list,paid]of [[result.services,sp.services],[result.purchases,sp.purchases]])for(const v of list)if(paid.has(v.id)){const effective=paid.get(v.id);if(effective>Number(v.paid||0))v.notes=String(v.notes||'')+' · يتضمن سدادًا أو مقاصة من الحساب العام: '+Money.round(effective-Number(v.paid||0));v.paid=effective;if('due' in v)v.due=Money.round(v.total-effective);}
 for(const v of result.services)if(v.partyType==='client'&&clientPlan411.servicePaid.has(v.id)){const effective=clientPlan411.servicePaid.get(v.id);if(effective>Number(v.paid||0))v.notes=String(v.notes||'')+' · يتضمن تسوية من الحساب العام: '+Money.round(effective-Number(v.paid||0));v.paid=effective;}
 const quotes=new Map(rows('quotes').map(q=>[q.id,q])),reserved=new Map();
 for(const r of rows('reservations149'))if(r.status==='active'&&quotes.has(r.quoteId)&&!['تم التحويل','مرفوض'].includes(quotes.get(r.quoteId).status))for(const line of r.lines||[])reserved.set(line.itemId,Money.round((reserved.get(line.itemId)||0)+Number(line.qty||0),4));
 for(const i of result.items){i.reservedQty=reserved.get(i.id)||0;i.availableQty=Money.round(Number(i.qty||0)-i.reservedQty,4);}
 const total=(name,key)=>result[name].reduce((sum,r)=>sum+cents(r[key]),0)/100;
 result.summary={salesReturns640:result.salesReturns640.reduce((n,r)=>n+cents(r.total),0)/100,refunds640:result.salesReturns640.reduce((n,r)=>n+cents(r.refund),0)/100,sales:total('orders','total'),treasuryIn:total('treasury','inAmount'),treasuryOut:total('treasury','outAmount'),treasuryBalance:Money.round(total('treasury','inAmount')-total('treasury','outAmount')),receivables:Money.round(result.clients.reduce((v,c)=>v+Math.max(0,c.currentBalance),0)),clientCredits:Money.round(result.clients.reduce((v,c)=>v+Math.max(0,-c.currentBalance),0)),payables:Money.round(result.suppliers.reduce((v,c)=>v+Math.max(0,c.currentBalance),0)),supplierCredits:Money.round(result.suppliers.reduce((v,c)=>v+Math.max(0,-c.currentBalance),0)),stockValue:Money.round(result.items.reduce((v,i)=>v+Number(i.qty||0)*Number(i.avgCost166??i.buyPrice??0),0)),orders:result.orders.length,items:result.items.length,clients:result.clients.length,suppliers:result.suppliers.length};
 return result;
}
module.exports={projectViewer};
