/* Alhamd Print 4.0.0 — one-commit, multi-material incoming purchase plan.
 * Pure planning: no state is changed until all lines and financial amounts pass validation.
 * Purchase records intentionally remain one line per material for compatibility with
 * existing stock, supplier, treasury, statement, edit and audit reports.
 */
(function(root, factory) {
    const api = factory(typeof module === 'object' && module.exports ? require('./accounting-math-401.js') : root.AccountingMath401);
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) root.PurchaseBatch400 = api;
})(typeof window !== 'undefined' ? window : null, function(math) {
    'use strict';
    const round = math.round;
    const D=typeof module==='object'?require('./discounts-408.js'):window.Discounts408;
    function invalid(message) { throw new Error(message); }
    function decimal(value, label, precision, positive) {
        if (value === '' || value === null || value === undefined || typeof value === 'boolean') invalid('يجب إدخال ' + label);
        const valueNum = Number(value);
        if (!Number.isFinite(valueNum) || Math.abs(valueNum) > 1e12 || (positive ? valueNum <= 0 : valueNum < 0)) invalid('قيمة غير صحيحة في ' + label);
        const rounded = round(valueNum, precision);
        if (Math.abs(rounded - valueNum) > 1e-8 || (positive && rounded <= 0)) invalid(label + ': الحد الأقصى ' + precision + ' منازل عشرية');
        return rounded;
    }
    function plan(state, { supplierId, lines, paid, date, method = 'نقدي', user = '', now = Date.now(), discountType = 'amt', discountValue = 0 }) {
        const suppliers = Array.isArray(state?.suppliers) ? state.suppliers : [];
        const items = Array.isArray(state?.items) ? state.items : [];
        const purchases = Array.isArray(state?.purchases) ? state.purchases : [];
        const treasury = Array.isArray(state?.treasury) ? state.treasury : [];
        const supplier = suppliers.find(s => String(s.id) === String(supplierId));
        if (!supplier) invalid('اختَر المورد الصحيح قبل اعتماد الوارد');
        if (!Array.isArray(lines) || !lines.length) invalid('أضف خامة واحدة على الأقل إلى قائمة الوارد');
        if (lines.length > 250) invalid('الحد الأقصى للدفعة الواحدة 250 خامة');
        const payment = decimal(paid, 'المبلغ المدفوع', 2, false);
        const updated = new Map();
        const prepared = [];
        for (let idx = 0; idx < lines.length; idx++) {
            const line = lines[idx];
            const item = items.find(x => String(x.id) === String(line.itemId));
            if (!item) invalid('الخامة رقم ' + (idx + 1) + ' غير موجودة في المخزن');
            const qty = decimal(line.qty, 'كمية ' + item.name, 4, true);
            const unitPrice = decimal(line.unitPrice, 'سعر ' + item.name, 2, false);
            const total = math.lineTotal(qty, unitPrice);
            if (!Number.isFinite(total) || total > 1e12) invalid('إجمالي خامة ' + item.name + ' خارج الحدود المسموحة');
            const prior = updated.get(String(item.id)) || {
                item, qty: decimal(item.qty ?? 0, 'رصيد المخزون ' + item.name, 4, false),
                average: decimal(item.avgCost166 ?? item.buyPrice ?? 0, 'متوسط تكلفة ' + item.name, 4, false)
            };
            const newQty = round(prior.qty + qty, 4);
            if (newQty > 1e12) invalid('رصيد المخزون بعد التوريد يتجاوز الحد المسموح');
            const average = newQty > 0 ? round((prior.qty * prior.average + qty * unitPrice) / newQty, 4) : unitPrice;
            updated.set(String(item.id), { item, qty: newQty, average, price: unitPrice });
            prepared.push({ item, itemId: item.id, itemName: item.name, qty, unitPrice, total,notes:String(line.notes||'').slice(0,1500),discountType:line.discountType||'amt',discountValue:line.discountValue||0 });
        }
        const bill=D.bill(prepared.map(l=>({...l,price:l.unitPrice})),{type:discountType,value:discountValue});
        prepared.forEach((l,i)=>{l.discount408=bill.lines[i];l.total=bill.lines[i].net408;});
        // Discount reduces acquisition value, never quantity. Recompute weighted averages from net cents.
        if(bill.discount>0){updated.clear();for(const l of prepared){const prior=updated.get(String(l.itemId))||{item:l.item,qty:Number(l.item.qty||0),average:Number(l.item.avgCost166??l.item.buyPrice??0)};const q=round(prior.qty+l.qty,4);updated.set(String(l.itemId),{item:l.item,qty:q,average:q>0?round((prior.qty*prior.average+l.total)/q,4):0,price:round(l.total/l.qty,4)});}}
        const total=bill.total;
        if (!Number.isFinite(total) || total > 1e12) invalid('إجمالي الدفعة أكبر من الحد المسموح');
        if (payment > total) invalid('المدفوع أكبر من إجمالي الدفعة');
        let maxId = 1000;
        const used = new Set(purchases.map(x => String(x.id)));
        for (const p of purchases) { const m = /^(?:PUR-)(\d+)$/.exec(String(p.id)); if (m) maxId = Math.max(maxId, Number(m[1])); }
        const created = [], cash = [];
        const existingCashIds = new Set(treasury.map(t => String(t.id)));
        let remainder = payment;
        const groupId = 'IN-' + String(maxId + 1);
        const day = String(date || '').trim();
        if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || Number.isNaN(Date.parse(day + 'T00:00:00Z')) || new Date(day + 'T00:00:00Z').toISOString().slice(0,10) !== day) invalid('تاريخ فاتورة الوارد غير صالح');
        prepared.forEach((line, index) => {
            let id;
            do { id = 'PUR-' + (++maxId); } while (used.has(id));
            used.add(id);
            const linePaid = Math.min(line.total, remainder);
            remainder = round(remainder - linePaid, 2);
            const purchase = {
                id, receiptBatch400: groupId, receiptLine400: index + 1,
                date: day, supplierId: supplier.id, supplierName: supplier.name,
                itemId: line.itemId, itemName: line.itemName, qty: line.qty,
                unitPrice: line.unitPrice, total: line.total, paid: linePaid,notes:line.notes,
                due: round(line.total - linePaid, 2), paymentMethod: method,
                ...(bill.discount>0?{discountSchema408:true,gross408:line.discount408.gross408,lineDiscount408:line.discount408.discount,invoiceDiscount408:line.discount408.invoiceDiscount408,discountType:line.discount408.discountType,discountValue:line.discount408.discountValue,invoiceDiscountType408:discountType,invoiceDiscountValue408:Number(discountValue),discount408:round(line.discount408.discount+line.discount408.invoiceDiscount408,2)}:{})
            };
            created.push(purchase);
            if (linePaid > 0) {
                let idCash = 't_' + String(now) + '_' + String(index);
                let suffix = 1;
                while (existingCashIds.has(idCash)) idCash = 't_' + String(now) + '_' + index + '_' + suffix++;
                existingCashIds.add(idCash);
                cash.push({ id: idCash, date: day, type: 'supplier_payment',
                    desc: `سداد لوارد [${line.itemName}] من المورد (${supplier.name}) — دفعة ${groupId}`,
                    inAmount: 0, outAmount: linePaid, supplierId: null, purchaseId: purchase.id,
                    kind: 'purchase_payment', paymentMethod: method, user });
            }
        });
        if (remainder !== 0) invalid('تعذر توزيع المدفوع على البنود؛ لم يتم اعتماد الوارد');
        return { total, paid: payment, due: round(total-payment,2), groupId, purchases: created, treasury: cash, stock: [...updated.values()] };
    }
    function apply(state, prepared) {
        // This operation is deliberately synchronous: the caller then makes ONE saveState() call.
        // saveState() rolls back the in-memory state if durable storage rejects the update.
        for (const s of prepared.stock) {
            s.item.qty = s.qty;
            s.item.avgCost166 = s.average;
            s.item.buyPrice = s.price;
            delete s.item.lastActualCount;
        }
        state.purchases.push(...prepared.purchases);
        state.treasury.push(...prepared.treasury);
        return prepared;
    }
    return Object.freeze({ plan, apply });
});
