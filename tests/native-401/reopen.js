(async()=>{
 const check=(value,message)=>{if(!value)throw Error(message);};
 check(window.__stateReady&&!window.__startupError,'reopen startup');
 check(appState.isLocked,'must start locked');
 gid('lockUserSelect').value='qa-cash';gid('lockPinInput').value='5826';await unlockSystem();
 check(!appState.isLocked,'reopen unlock');
 check(appState.orders.length===1&&appState.purchases.length===1,'durable documents');
 check(appState.items.find(i=>i.id==='qa-i').qty===18,'durable stock');
 check(getClientBalance('qa-c')===70&&getSupplierBalance('qa-s')===100,'durable balances');
 check(getTreasuryBalance()===-20,'durable cash');
 check(appState.treasury.filter(t=>t.serviceId==='qa-svc').length===2,'durable service receipts');
 previewInvoice(appState.orders[0].id);
 check(!window.__startupError,'reopened invoice preview');
 return {result:'passed',reopened:true,version:window.api.appInfo().version,customerBalance:70,supplierBalance:100,stock:18};
})()
