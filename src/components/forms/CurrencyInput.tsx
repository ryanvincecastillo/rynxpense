import React from 'react';
import { Input } from '../ui';
import { useFormatCurrency } from '../../hooks/common';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  error?: string;
  required?: boolean;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  label,
  error,
  required,
  ...props
}) => {
  const { currency } = useFormatCurrency();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || 0;
    onChange(val);
  };

  return (
    <div className="relative">
      <Input
        type="number"
        value={value}
        onChange={handleChange}
        label={label}
        error={error}
        required={required}
        step="0.01"
        min="0"
        {...props}
      />
      <div className="absolute right-3 top-8 text-gray-500 pointer-events-none">
        {currency}
      </div>
    </div>
  );
};