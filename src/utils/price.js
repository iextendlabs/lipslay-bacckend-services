// Central price formatting utility
// Usage: formatPrice(100) => 'AED 100.00'

function formatPrice(amount, currency = 'AED') {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return '';
  return `${currency} ${parseFloat(amount).toFixed(2)}`;
}

module.exports = { formatPrice };
