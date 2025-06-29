// DuplicateBudgetModal.tsx - Mobile-First Version
import React, { useState, useEffect } from 'react';
import { Copy, Calendar, Clock, Info, Check } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button, Badge } from '../ui';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Budget {
  id: string;
  name: string;
  description?: string;
  color: string;
}

interface DuplicateBudgetOptions {
  includeRecurringTransactions: boolean;
  includeRecentTransactions: boolean;
  recentDays?: number;
}

interface DuplicateBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: Budget | null;
  onDuplicate: (options: DuplicateBudgetOptions) => void;
  isLoading: boolean;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface OptionCardProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  badges: string[];
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

const OptionCard: React.FC<OptionCardProps> = ({
  id,
  title,
  description,
  icon,
  badges,
  isSelected,
  onSelect,
  disabled = false,
}) => {
  return (
    <div
      onClick={!disabled ? onSelect : undefined}
      className={`
        relative p-4 rounded-lg border-2 transition-all cursor-pointer
        ${isSelected
          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-20'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}

      <div className="flex items-start space-x-3">
        <input
          type="radio"
          id={id}
          name="duplicate-option"
          checked={isSelected}
          onChange={onSelect}
          disabled={disabled}
          className="mt-1 sr-only"
        />
        
        <div className={`
          p-2 rounded-lg flex-shrink-0
          ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}
        `}>
          <div className={`
            w-5 h-5
            ${isSelected ? 'text-blue-600' : 'text-gray-600'}
          `}>
            {icon}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <label htmlFor={id} className="font-medium text-gray-900 cursor-pointer block">
            {title}
          </label>
          <p className="text-sm text-gray-600 mt-1 leading-relaxed">
            {description}
          </p>
          <div className="flex flex-wrap gap-1 mt-3">
            {badges.map((badge, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                size="sm"
                className="text-xs"
              >
                {badge}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface RecentDaysPickerProps {
  value: number;
  onChange: (days: number) => void;
  disabled?: boolean;
}

const RecentDaysPicker: React.FC<RecentDaysPickerProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const options = [7, 14, 30, 60, 90];

  return (
    <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
      <label className="block text-sm font-medium text-amber-800 mb-2">
        Include transactions from the last:
      </label>
      <div className="grid grid-cols-3 gap-2">
        {options.map((days) => (
          <button
            key={days}
            type="button"
            onClick={() => onChange(days)}
            disabled={disabled}
            className={`
              px-3 py-2 text-sm font-medium rounded-lg border transition-all
              ${value === days
                ? 'bg-amber-200 border-amber-300 text-amber-900'
                : 'bg-white border-amber-200 text-amber-700 hover:bg-amber-100'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {days} days
          </button>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const DuplicateBudgetModal: React.FC<DuplicateBudgetModalProps> = ({
  isOpen,
  onClose,
  budget,
  onDuplicate,
  isLoading
}) => {
  const [selectedOption, setSelectedOption] = useState<'structure' | 'recurring' | 'recent'>('structure');
  const [recentDays, setRecentDays] = useState(30);

  const resetOptions = () => {
    setSelectedOption('structure');
    setRecentDays(30);
  };

  useEffect(() => {
    if (!isOpen) {
      resetOptions();
    }
  }, [isOpen]);

  const handleDuplicate = () => {
    const options: DuplicateBudgetOptions = {
      includeRecurringTransactions: selectedOption === 'recurring',
      includeRecentTransactions: selectedOption === 'recent',
      recentDays: selectedOption === 'recent' ? recentDays : undefined,
    };
    
    onDuplicate(options);
  };

  if (!budget) return null;

  const duplicateOptions = [
    {
      id: 'structure',
      title: 'Budget Structure Only',
      description: 'Copy categories with planned amounts. Start fresh with no transactions.',
      icon: <Copy className="w-5 h-5" />,
      badges: ['Categories', 'Planned Amounts', 'Colors'],
      value: 'structure' as const,
    },
    {
      id: 'recurring',
      title: 'Include Recurring Transactions',
      description: 'Perfect for monthly budgets! Copies recurring transactions like salary, rent, loan payments.',
      icon: <Calendar className="w-5 h-5" />,
      badges: ['Structure', 'Recurring Payments', 'Scheduled Income'],
      value: 'recurring' as const,
    },
    {
      id: 'recent',
      title: 'Include Recent Transactions',
      description: 'Copy recent transaction history to get a realistic starting point for your new budget.',
      icon: <Clock className="w-5 h-5" />,
      badges: ['Structure', 'Recent History', 'Quick Start'],
      value: 'recent' as const,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Duplicate Budget"
      size="md"
      className="sm:max-w-md mx-4 sm:mx-auto"
    >
      <div className="space-y-4">
        {/* Budget Info */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <div
            className="w-6 h-6 rounded-full flex-shrink-0 border-2 border-white shadow-sm"
            style={{ backgroundColor: budget.color }}
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{budget.name}</h3>
            <p className="text-sm text-gray-600">
              Will be duplicated as "<span className="font-medium">{budget.name} (Copy)</span>"
            </p>
          </div>
        </div>

        {/* Options Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Copy className="h-4 w-4 text-gray-600" />
            <h4 className="font-medium text-gray-900">
              What to include in the duplicate?
            </h4>
          </div>

          {/* Duplication Options */}
          <div className="space-y-3">
            {duplicateOptions.map((option) => (
              <OptionCard
                key={option.id}
                id={option.id}
                title={option.title}
                description={option.description}
                icon={option.icon}
                badges={option.badges}
                isSelected={selectedOption === option.value}
                onSelect={() => setSelectedOption(option.value)}
                disabled={isLoading}
              />
            ))}
          </div>

          {/* Recent Days Picker */}
          {selectedOption === 'recent' && (
            <RecentDaysPicker
              value={recentDays}
              onChange={setRecentDays}
              disabled={isLoading}
            />
          )}
        </div>

        {/* Summary */}
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Your duplicate will include:</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                  <span>Budget structure and categories</span>
                </div>
                {selectedOption === 'recurring' && (
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <span>Recurring transactions (scheduled for next occurrence)</span>
                  </div>
                )}
                {selectedOption === 'recent' && (
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                    <span>Recent transactions (last {recentDays} days)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          
          <Button
            type="button"
            onClick={handleDuplicate}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Duplicating...
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate Budget
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DuplicateBudgetModal;