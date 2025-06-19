import React from 'react';
import { FormField } from './FormField';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  colors: string[];
  error?: string;
  required?: boolean;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  value,
  onChange,
  colors,
  error,
  required
}) => {
  return (
    <FormField label={label} error={error} required={required}>
      <div className="grid grid-cols-5 gap-2">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={`w-10 h-10 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              value === color
                ? 'border-gray-800 scale-110 shadow-lg'
                : 'border-gray-300 hover:border-gray-500 hover:scale-105'
            }`}
            style={{ backgroundColor: color }}
            title={`Select ${color} color`}
          />
        ))}
      </div>
    </FormField>
  );
};