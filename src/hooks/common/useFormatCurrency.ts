import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency as formatCurrencyUtil, formatCompactCurrency as formatCompactUtil } from '../../utils';

export const useFormatCurrency = () => {
  const { user } = useAuth();
  const currency = user?.currency || 'PHP';

  const formatCurrency = (amount: number, options?: Intl.NumberFormatOptions) => {
    return formatCurrencyUtil(amount, currency, options);
  };

  const formatCompactCurrency = (amount: number) => {
    return formatCompactUtil(amount, currency);
  };

  return { formatCurrency, formatCompactCurrency, currency };
};