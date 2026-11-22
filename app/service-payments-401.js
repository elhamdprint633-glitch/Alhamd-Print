(function(root, factory) {
    const math = typeof module === 'object' && module.exports ? require('./accounting-math-401.js') : root.AccountingMath401;
    const api = factory(math);
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) root.ServicePayments401 = api;
})(typeof window !== 'undefined' ? window : null, function(math) {
    'use strict';
    function reconcile(state, service, {date, paymentDate, user = '', id} = {}) {
        const rows = (state.treasury || []).filter(t => t.serviceId === service.id);
        const incoming = service.kind === 'provided';
        const desired = service.inTreasury ? math.round(service.paid || 0) : 0;
        const current = math.round(rows.reduce((sum, t) => sum + Number(incoming ? t.inAmount || 0 : t.outAmount || 0), 0));
        if (!Number.isFinite(desired) || desired < 0 || desired > Number(service.amount)) throw Error('مدفوع الخدمة غير صالح');
        if (rows.some(t => Number(incoming ? t.outAmount || 0 : t.inAmount || 0) > 0)) throw Error('لا يمكن تبديل اتجاه خدمة لها دفعات؛ اعكس الدفعات أولاً');
        // Reducing paid cash requires an explicit reversal, never rewriting old dates.
        if (desired < current) throw Error('لا يمكن إنقاص مدفوع الخدمة أو إلغاء قيد الخزينة بعد السداد؛ راجع الدفعات من مصدرها');
        const delta = math.round(desired - current);
        if (!delta) return null;
        const record = {id: id || 't_s_' + (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now() + '_' + Math.random().toString(36).slice(2)),
            date: paymentDate || (rows.length ? date : service.date || date), type: incoming ? 'service_in' : 'service_out',
            desc: `${incoming ? 'تحصيل' : 'سداد'} خدمة #${service.id} - ${service.title} (${service.partyName})`,
            inAmount: incoming ? delta : 0, outAmount: incoming ? 0 : delta,
            clientId: null, supplierId: null, serviceId: service.id, kind: 'service_payment', paymentMethod:service.paymentMethod||'نقدي', user};
        if (state.treasury.some(t => t.id === record.id)) throw Error('رقم سند خدمة مكرر');
        state.treasury.push(record);
        return record;
    }
    function entries(service, treasury) {
        const rows=(treasury||[]).filter(t=>t.serviceId===service.id).map(t=>({id:t.id,date:String(t.date||service.date||''),amount:math.round(Number(t.inAmount||0)+Number(t.outAmount||0))})).filter(t=>t.amount>0);
        const allocated=rows.reduce((n,t)=>n+math.scaled(t.amount,2),0n),unlinked=math.scaled(service.paid||0,2)-allocated;
        if(unlinked>0n)rows.push({id:'legacy:'+service.id,date:String(service.date||''),amount:Number(unlinked)/100});
        return rows;
    }
    return Object.freeze({reconcile, entries});
});
