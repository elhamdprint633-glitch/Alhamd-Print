(function(root, factory) {
  const api = factory(typeof module === 'object' ? require('./accounting-math-401.js') : root.AccountingMath401);
  if (typeof module === 'object') module.exports = api;
  else root.BalancePreview600 = api;
})(globalThis, function(M) {
  'use strict';
  // Informational only: the existing signed ledger supplies balance and the
  // existing invoice calculator supplies net total and payment. No posting.
  function calculate({balance = 0, total = 0, paid = 0, previousDue = 0}) {
    const cents = n => M.scaled(n, 2);
    const old = cents(balance), net = cents(total), payment = cents(paid), previous = cents(previousDue);
    return {previous: Number(old) / 100, forecast: Number(old + net - payment - previous) / 100};
  }
  function direction(type, value) {
    if (Math.abs(value) < .005) return 'الحساب خالص';
    return (type === 'supplier' ? value > 0 : value < 0) ? 'له عندنا' : 'عليه لنا';
  }
  return {calculate, direction};
});
