import React from 'react';
import { Card, Input, Select, Button } from '../ui';
import { Search, Filter, X } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterConfig {
  search?: {
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
  };
  selects?: Array<{
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    options: FilterOption[];
  }>;
  checkboxes?: Array<{
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
  }>;
  dateRange?: {
    startDate: string;
    endDate: string;
    onStartDateChange: (date: string) => void;
    onEndDateChange: (date: string) => void;
  };
  onClear?: () => void;
  hasActiveFilters?: boolean;
}

interface FilterBarProps {
  filters: FilterConfig;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, className = '' }) => {
  return (
    <Card className={className}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filters.search && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={filters.search.placeholder || "Search..."}
                className="pl-10"
                value={filters.search.value}
                onChange={(e) => filters.search!.onChange(e.target.value)}
              />
            </div>
          )}
          
          {filters.selects?.map((select, index) => (
            <Select
              key={index}
              placeholder={select.placeholder}
              value={select.value}
              onChange={(e) => select.onChange(e.target.value)}
              options={select.options}
            />
          ))}
        </div>

        {filters.dateRange && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={filters.dateRange.startDate}
              onChange={(e) => filters.dateRange!.onStartDateChange(e.target.value)}
            />
            <Input
              label="End Date"
              type="date"
              value={filters.dateRange.endDate}
              onChange={(e) => filters.dateRange!.onEndDateChange(e.target.value)}
            />
          </div>
        )}

        {filters.checkboxes && (
          <div className="flex flex-wrap gap-4">
            {filters.checkboxes.map((checkbox, index) => (
              <label key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={checkbox.checked}
                  onChange={(e) => checkbox.onChange(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                />
                <span>{checkbox.label}</span>
              </label>
            ))}
          </div>
        )}

        {filters.onClear && filters.hasActiveFilters && (
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={filters.onClear}>
              <X className="h-4 w-4 mr-1" />
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};