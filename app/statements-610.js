(function(root,f){const api=f(typeof module==='object'?require('./accounting-math-401.js'):root.AccountingMath401,typeof module==='object'?require('./service-payments-401.js'):root.ServicePayments401,typeof module==='object'?require('./party-ledger-411.js'):root.PartyLedger411);if(typeof module==='object')module.exports=api;else root.Statements610=api;})(globalThis,function(M,ServicePayments401,P){'use strict';const r2=M.round,isOrderDepositEntry=P.deposit,isPurchasePaymentEntry=P.purchasePay,servicePartySign=(type,kind)=>(type==='client')===(kind==='provided')?1:-1;
function base(appState,type,id) {
    const isC = type === 'client';
    const party = isC ? appState.clients.find(c => c.id === id) : appState.suppliers.find(s => s.id === id);
    if (!party) return null;
    const E = []; let seq = 0;
    const add = (o) => E.push(Object.assign({ seq: seq++, debit: 0, credit: 0, time: '' }, o));
    if (isC) {
        appState.orders.filter(o => o.clientId === id).forEach(o => {
            add({ date: o.date, time: o.time || '', ref: '#' + (o.orderNo||o.id), kind: 'order', src: o.id, desc: `فاتورة مبيعات: ${o.jobType || ''}${o.specs ? ' — ' + o.specs : ''}${o.status === 'ملغي' ? ' (ملغاة)' : ''}`, debit: Number(o.total) || 0 });
            if (Number(o.paid) > 0) add({ date: o.date, time: o.time || '', ref: '#' + (o.orderNo||o.id), kind: 'pay', src: o.id, sourceKind: 'order', desc: `دفعة مقدمة / عربون على الفاتورة #${o.orderNo}`, credit: Number(o.paid) });
        });
        appState.treasury.filter(t => t.clientId === id && t.type === 'collection' && !isOrderDepositEntry(t)).forEach(t => add({ date: (t.date || '').split(' ')[0], time: (t.date || '').split(' ')[1] || '', ref: 'سند تحصيل', kind: 'tre', src: t.id, desc: t.desc || 'تحصيل من العميل', credit: Number(t.inAmount) || 0 }));
    } else {
        appState.purchases.filter(p => p.supplierId === id).forEach(p => {
            add({ date: p.date, ref: '#' + p.id, kind: 'pur', src: p.id, desc: `فاتورة شراء خامات: ${p.itemName || ''} (كمية: ${p.qty})`, debit: Number(p.total) || 0 });
            if (Number(p.paid) > 0) add({ date: p.date, ref: '#' + p.id, kind: 'pay', src: p.id, sourceKind: 'pur', desc: `دفعة على فاتورة الشراء #${p.id}`, credit: Number(p.paid) });
        });
        appState.treasury.filter(t => t.supplierId === id && t.type === 'supplier_payment' && !isPurchasePaymentEntry(t)).forEach(t => add({ date: (t.date || '').split(' ')[0], time: (t.date || '').split(' ')[1] || '', ref: 'سند صرف', kind: 'tre', src: t.id, desc: t.desc || 'سداد للمورد', credit: Number(t.outAmount) || 0 }));
    }
    (appState.adjustments || []).filter(a => a.party === type && a.partyId === id).forEach(a => add({ date: a.date, ref: 'قيد تسوية', kind: 'adj', src: a.id, desc: a.desc || 'قيد تسوية', debit: Number(a.debit) || 0, credit: Number(a.credit) || 0 }));
    const servicePayments407=new Map();for(const t of appState.treasury)if(t.serviceId){if(!servicePayments407.has(t.serviceId))servicePayments407.set(t.serviceId,[]);servicePayments407.get(t.serviceId).push(t);}
    (appState.services || []).filter(s => s.partyType === type && s.partyId === id).forEach(s => {
        const sign = servicePartySign(type, s.kind);
        add({ date: s.date, ref: s.id, kind: 'service', src: s.id, desc: 'خدمة: ' + s.title, debit: sign > 0 ? Number(s.amount) : 0, credit: sign < 0 ? Number(s.amount) : 0 });
        for (const payment of ServicePayments401.entries(s, servicePayments407.get(s.id)||[])) add({ date: payment.date.slice(0,10), time: payment.date.slice(11), ref: s.id, kind: 'pay', src: s.id, sourceKind: 'service', desc: 'دفعة خدمة: ' + s.title, debit: sign < 0 ? payment.amount : 0, credit: sign > 0 ? payment.amount : 0 });
    });
    E.sort((a, b) => (a.date || '').localeCompare(b.date || '') || (a.time || '').localeCompare(b.time || '') || a.seq - b.seq);
    return { party, isC, opening: Number(isC ? party.initialBalance : party.balance) || 0, entries: E };
}
function index(s){const groups=new Map();for(const type of ['client','supplier'])for(const p of s[type==='client'?'clients':'suppliers']||[])groups.set(type+':'+p.id,{clients:type==='client'?[p]:[],suppliers:type==='supplier'?[p]:[],orders:[],purchases:[],treasury:[],adjustments:[],services:[]});const add=(type,id,key,row)=>{const g=groups.get(type+':'+id);if(g){g.seen610||={};const seen=g.seen610[key]||=new Set();if(!seen.has(row)){seen.add(row);g[key].push(row);}}};for(const o of s.orders||[])add('client',o.clientId,'orders',o);for(const p of s.purchases||[])add('supplier',p.supplierId,'purchases',p);for(const a of s.adjustments||[])add(a.party,a.partyId,'adjustments',a);const services=new Map();for(const v of s.services||[]){add(v.partyType,v.partyId,'services',v);services.set(v.id,v);}for(const t of s.treasury||[]){add('client',t.clientId,'treasury',t);add('supplier',t.supplierId,'treasury',t);const v=services.get(t.serviceId);if(v)add(v.partyType,v.partyId,'treasury',t);}return function(type,id){const g=groups.get(type+':'+id);if(!g)return null;const d=base(g,type,id),other=d.party[type==='client'?'supplierId411':'clientId411'],opp=other?groups.get((type==='client'?'supplier':'client')+':'+other):null;if(opp){const x=base(opp,type==='client'?'supplier':'client',other);d.opening=r2(d.opening-x.opening);d.entries.push(...x.entries.map(e=>({...e,debit:e.credit,credit:e.debit,counterparty411:true,sourceParty610:type==='client'?'supplier':'client'})));d.linked411=true;}d.entries.sort((a,b)=>String(a.date||'').localeCompare(String(b.date||''))||String(a.time||'').localeCompare(String(b.time||''))||a.seq-b.seq);d.entries=d.entries.map((e,seq)=>({...e,seq}));return d;};}
function compute(d,{from='',to='',full=false}={}){if(!d)return null;const C=v=>M.scaled(v||0,2);let balance=C(d.opening),cut=-1,clearedAt='';for(let i=0;i<d.entries.length;i++){const e=d.entries[i];balance+=C(e.debit)-C(e.credit);if(balance===0n){cut=i;clearedAt=e.date||'';}}const entries=full?d.entries:d.entries.slice(cut+1);let opening=full||cut<0?C(d.opening):0n;for(const e of entries)if(from&&e.date<from)opening+=C(e.debit)-C(e.credit);const rows=entries.filter(e=>(!from||e.date>=from)&&(!to||e.date<=to)).map(e=>({...e}));let bal=opening,debit=0n,credit=0n;for(const e of rows){debit+=C(e.debit);credit+=C(e.credit);bal+=C(e.debit)-C(e.credit);e.bal=Number(bal)/100;}return {d,open:Number(opening)/100,rows,tD:Number(debit)/100,tC:Number(credit)/100,close:Number(bal)/100,clearedAt:!full?clearedAt:'',hiddenSettled:!full&&cut>=0,full};}
return {index,compute};});
