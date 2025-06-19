export const CURRENCIES = [
  { value: 'PHP', label: 'Philippine Peso (PHP) - ₱' },
  { value: 'USD', label: 'US Dollar (USD) - $' },
  { value: 'EUR', label: 'Euro (EUR) - €' },
  { value: 'GBP', label: 'British Pound (GBP) - £' },
  { value: 'JPY', label: 'Japanese Yen (JPY) - ¥' },
  { value: 'CAD', label: 'Canadian Dollar (CAD) - C$' },
  { value: 'AUD', label: 'Australian Dollar (AUD) - A$' },
  { value: 'SGD', label: 'Singapore Dollar (SGD) - S$' },
  { value: 'HKD', label: 'Hong Kong Dollar (HKD) - HK$' },
  { value: 'CNY', label: 'Chinese Yuan (CNY) - ¥' },
] as const;

export const DEFAULT_CURRENCY = 'PHP';