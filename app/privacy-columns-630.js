(function(root,f){const api=f();if(typeof module==='object')module.exports=api;else root.PrivacyColumns630=api;})(globalThis,function(){'use strict';
 const normalize=x=>String(x||'').replace(/[\u064b-\u065f\u0670\u200e\u200f]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/\s+/g,' ').trim();
 const isDate=label=>/^(?:ال)?(?:تاريخ|موعد|صالح حتي|الفتح|الاقفال)(?:\s|$)/.test(normalize(label));
 function groups(key,label){const n=normalize(label);if(isDate(n)||/كمية|كميه|عدد|حد الطلب/.test(n))return [];
  const stock=/inventory|stockTake|stocktake/.test(key);if(stock&&!/سعر|تكلف|قيمة/.test(n))return [];
  if(!/سعر|تكلف|مبلغ|مدين|دائن|خصم|مدفوع|مسدد|متبقي|مستحق|رصيد|ربح|ارباح|قيمة|اجمالي|وارد|صادر|تحصيل|مقبوض|مصروف/.test(n)&&!(key==='opsTable149_shifts'&&/فروق/.test(n)))return [];
  if(/statement|stmt/i.test(key))return ['__statement630'];
  if(/treasury|shifts/i.test(key))return ['treasury','treasuryTableAmounts'];
  if(/clients/i.test(key))return ['clientsDue'];if(/suppliers/i.test(key))return ['suppliersDue'];
  if(/purchases/i.test(key))return /سعر|تكلف/.test(n)?['colPurchaseAmounts','costs']:['colPurchaseAmounts'];
  if(/quotes|purchaseRequests/i.test(key))return ['colQuoteTotal'];
  if(/services|external/i.test(key))return ['colServiceAmounts'];
  if(stock||/serviceCatalog/.test(key)){if(/سعر البيع/.test(n))return ['colItemSellPrice'];if(/سعر|تكلف/.test(n))return ['costs'];return [/stockTake|stocktake/.test(key)?'stockActual':'stockBook'];}
  if(/orders|dashRecent/i.test(key)){const specific=/خصم/.test(n)?'colOrderDiscount':/مدفوع|مسدد/.test(n)?'colOrderPaid':/متبقي/.test(n)?'colOrderRemaining':'colOrderTotal';return ['sales',specific];}
  if(/pricing|cost|waste/i.test(key))return ['costs'];return ['__financial630'];
 }
 function headerFor(headers,cell,index){const origin=cell.dataset?.originColumn157;if(origin!==undefined)return headers.find(h=>h.dataset?.originColumn157===origin)||headers[index];const tagged=headers.find(h=>Number(h.dataset?.originColumn157)===index);return tagged||headers[index];}
 return {normalize,isDate,groups,headerFor};});
