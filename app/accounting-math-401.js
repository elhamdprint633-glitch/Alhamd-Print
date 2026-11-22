(function(root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) root.AccountingMath401 = api;
})(typeof window !== 'undefined' ? window : null, function() {
    'use strict';
    // Decimal rounding, half away from zero. Avoid binary-float half-cent errors.
    function scaled(value, places) {
        if (typeof value === 'boolean' || value === null || String(value).trim() === '' || !Number.isFinite(Number(value))) throw Error('قيمة رقمية غير صالحة');
        const match = String(value).trim().match(/^([+-]?)(\d*)(?:\.(\d*))?(?:e([+-]?\d+))?$/i);
        if (!match || !(match[2] || match[3]) || !Number.isInteger(places) || places < 0 || places > 8) throw Error('قيمة عشرية غير صالحة');
        const sign = match[1] === '-' ? -1n : 1n;
        const digits = BigInt((match[2] || '') + (match[3] || ''));
        const shift = places + Number(match[4] || 0) - (match[3] || '').length;
        if (Math.abs(shift) > 400) throw Error('قيمة خارج الحدود المسموحة');
        if (shift >= 0) return sign * digits * 10n ** BigInt(shift);
        const divisor = 10n ** BigInt(-shift);
        return sign * ((digits + divisor / 2n) / divisor);
    }
    const round = (value, places = 2) => Number(scaled(value, places)) / 10 ** places;
    function lineTotal(qty, price) {
        const product = scaled(qty, 4) * scaled(price, 4);
        const absolute = product < 0n ? -product : product;
        return Number((product < 0n ? -1n : 1n) * ((absolute + 500000n) / 1000000n)) / 100;
    }
    function reversePurchase(item, purchase) {
        const qty = round(Number(item.qty) - Number(purchase.qty), 4);
        if (qty < 0) throw Error('لا يمكن عكس وارد تم استهلاك كميته؛ سجّل تسوية موثقة بدلاً من حذف الوارد');
        const value = Number(item.qty) * Number(item.avgCost166 ?? item.buyPrice ?? 0) - (purchase.discountSchema408?Number(purchase.total):Number(purchase.qty) * Number(purchase.unitPrice));
        // Never conceal a negative residual value by replacing it with zero.
        // A consumed receipt needs a cost adjustment, not retroactive cancellation.
        const tolerance = Math.max(0.005, Math.abs(Number(item.qty)) * 0.000051);
        if (value < -tolerance || qty === 0 && Math.abs(value) > tolerance) throw Error('عكس الوارد سيشوّه قيمة المخزون بعد الاستهلاك؛ سجّل تسوية موثقة');
        return {qty, average: qty > 0 ? round(Math.max(0, value) / qty, 4) : 0};
    }
    function returnedAverage(item, qty, unitCost) {
        const totalQty = round(Number(item.qty) + Number(qty), 4);
        return totalQty > 0 ? round((Number(item.qty) * Number(item.avgCost166 ?? item.buyPrice ?? 0) + Number(qty) * Number(unitCost)) / totalQty, 4) : 0;
    }
    function replacementCost(qty, oldQty, oldCost, currentCost) {
        if (!(Number(qty) > 0)) throw Error('كمية غير صالحة');
        const retained = Math.min(Number(qty), Number(oldQty) || 0);
        return round((retained * Number(oldCost) + (Number(qty) - retained) * Number(currentCost)) / Number(qty), 4);
    }
    function consumedAverage(item, qty, unitCost) {
        const left = round(Number(item.qty) - Number(qty), 4);
        if (left < 0) throw Error('المخزون غير كافٍ');
        const value = Number(item.qty) * Number(item.avgCost166 ?? item.buyPrice ?? 0) - Number(qty) * Number(unitCost);
        if (value < -Math.max(.01,Number(item.qty)*.00011)) throw Error('تكلفة الخصم تتجاوز قيمة المخزون');
        return left > 0 ? round(Math.max(0,value)/left,4) : 0;
    }
    const treasuryBalance = rows => Number(rows.reduce((sum,t)=>sum+scaled(t.inAmount||0,2)-scaled(t.outAmount||0,2),0n))/100;
    return Object.freeze({treasuryBalance, scaled, round, lineTotal, reversePurchase, returnedAverage, replacementCost, consumedAverage});
});
