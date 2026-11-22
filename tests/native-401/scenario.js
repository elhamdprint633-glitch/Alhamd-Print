(async()=>{
 const assert=(condition,message)=>{if(!condition)throw Error(message);};
 assert(window.__stateReady&&!window.__startupError,'startup failed: '+window.__startupError);
 assert(window.api.nativeDesktop,'native bridge missing');
 document.getElementById('lockPinInput').value='1234';await unlockSystem();
 assert(!appState.isLocked,'unlock failed');
 // Linux QA has no Windows DPAPI provider. Encrypted backup/restore is tested separately.
 appState.autoBackupConfig.onActions=false;
 appState.clients.push({id:'qa-c',name:'عميل تجربة',initialBalance:0});
 appState.suppliers.push({id:'qa-s',name:'مورد تجربة',balance:0});
 appState.items.push({id:'qa-i',name:'ورق تجربة',code:'QA-01',qty:10,buyPrice:10,avgCost166:10,sellPrice:25,minQty:1,unit:'فرخ'});
 saveState(false);
 const batch=PurchaseBatch400.plan(appState,{supplierId:'qa-s',lines:[{itemId:'qa-i',qty:10,unitPrice:20}],paid:100,date:'2026-11-07'});
 PurchaseBatch400.apply(appState,batch);saveState(false);
 assert(getSupplierBalance('qa-s')===100,'supplier due');assert(appState.items.find(i=>i.id==='qa-i').avgCost166===15,'weighted cost');
 newSale();gid('orderClientSelect').value='qa-c';
 const row=document.querySelector('#saleLines .sale-line');row.querySelector('.sl-picker').value='stock:qa-i';onInvoiceItemSelect(row.querySelector('.sl-picker'));
 row.querySelector('.sl-qty').value=2;row.querySelector('.sl-price').value=25;gid('salePaid').value=20;calcSale();saveSale('new');
 const order=appState.orders.at(-1);assert(order?.total===50,'sale total');assert(order.paid===20,'deposit');assert(getClientBalance('qa-c')===30,'client debt');
 assert(appState.items.find(i=>i.id==='qa-i').qty===18,'sale stock');
 appState.treasury.push({id:'qa-receipt',date:'2026-11-07 12:00',type:'collection',kind:'payment',orderId:order.id,clientId:'qa-c',inAmount:10,outAmount:0,paymentMethod:'نقدي'});saveState(false);
 assert(orderRemaining(appState.orders.find(o=>o.id===order.id))===20,'settlement');assert(getClientBalance('qa-c')===20,'no double receipt');
 const cashBefore=getTreasuryBalance();
 const svc={id:'qa-svc',date:'2026-11-06',kind:'provided',partyType:'client',partyId:'qa-c',partyName:'عميل تجربة',title:'خدمة تجربة',amount:100,paid:30,inTreasury:true};
 ServicePayments401.reconcile(appState,svc,{date:'2026-11-06 10:00',id:'qa-service-1'});appState.services.push(svc);saveState(false);
 svc.paid=50;ServicePayments401.reconcile(appState,svc,{date:'2026-11-07 13:00',id:'qa-service-2'});saveState(false);
 const payments=appState.treasury.filter(t=>t.serviceId===svc.id);assert(payments.length===2,'service installments');assert(payments[0].inAmount===30&&payments[1].inAmount===20,'service deltas');assert(payments[0].date.startsWith('2026-11-06')&&payments[1].date.startsWith('2026-11-07'),'service dates');assert(getTreasuryBalance()===cashBefore+50,'cash service once');
 // Persist and reload the real IPC/SQLite state.
 const saved=JSON.parse(window.api.load());assert(saved.orders.at(-1).total===50,'durable invoice');assert(saved.treasury.filter(t=>t.serviceId==='qa-svc').length===2,'durable receipts');
 assert(saved.auditTrail166.some(t=>t.action==='edit'&&t.collection==='services'),'edit audit');
 previewInvoice(order.id);
 const documentPayload=currentDocument('invoice');
 const pdf=await window.api.savePDF({...documentPayload,options:{paper:'A4',orientation:'portrait',margin:10,scale:100,pageNumbers:true}});
 assert(pdf.ok&&pdf.bytes>1000,'native PDF export failed: '+JSON.stringify(pdf));
 assert(!window.__startupError,'UI error: '+window.__startupError);
 // Admin PIN confirmation must not replace the signed-in employee session.
 closeModal('modalPrintInvoice');
 appState.users.push({id:'qa-cash',name:'كاشير تجربة',username:'qa-cash',role:'cashier',pin:window.api.hashPin('5826')});saveState(false);
 assert(window.api.verifyPin('qa-cash','5826',false).ok,'cashier login');appState.currentUser='qa-cash';saveState(false);
 assert(window.api.verifyPin(null,'1234',true).ok,'admin confirmation');saveState(false);
 assert(appState.currentUser==='qa-cash','admin check switched employee');
 return {pdfBytes:pdf.bytes,version:window.api.appInfo().version,orders:saved.orders.length,purchases:saved.purchases.length,stock:saved.items.find(i=>i.id==='qa-i').qty,average:15,customerBalance:getClientBalance('qa-c'),supplierBalance:getSupplierBalance('qa-s'),cashBalance:getTreasuryBalance(),servicePayments:payments.map(t=>({date:t.date,inAmount:t.inAmount})),result:'passed'};
})()
