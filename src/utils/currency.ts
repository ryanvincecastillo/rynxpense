export const formatCurrency = (
  amount: number,
  currency: string = 'PHP',
  options?: Intl.NumberFormatOptions
): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  }).format(amount);
};

export const formatCompactCurrency = (
  amount: number,
  currency: string = 'PHP'
): string => {
  if (amount >= 1000000) {
    return formatCurrency(amount / 1000000, currency, { 
      minimumFractionDigits: 1,
      maximumFractionDigits: 1 
    }).replace(/[₱$€£¥]/, '') + 'M';
  }
  if (amount >= 1000) {
    return formatCurrency(amount / 1000, currency, { 
      minimumFractionDigits: 1,
      maximumFractionDigits: 1 
    }).replace(/[₱$€£¥]/, '') + 'k';
  }
  return formatCurrency(amount, currency);
};

export const parseCurrencyAmount = (value: string): number => {
  // Remove currency symbols and parse
  return parseFloat(value.replace(/[₱$€£¥,]/g, '')) || 0;
};