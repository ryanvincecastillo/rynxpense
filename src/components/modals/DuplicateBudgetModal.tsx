import React, { useState } from 'react';
import { Copy, Calendar, Clock, Info } from 'lucide-react';
import { Modal, Button, Card, Badge } from '../../components/ui';
import { Budget, DuplicateBudgetOptions } from '../../types';

interface DuplicateBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: Budget | null;
  onDuplicate: (options: DuplicateBudgetOptions) => void;
  isLoading: boolean;
}

export const DuplicateBudgetModal: React.FC<DuplicateBudgetModalProps> = ({
  isOpen,
  onClose,
  budget,
  onDuplicate,
  isLoading
}) => {
  const [includeRecurring, setIncludeRecurring] = useState(false);
  const [includeRecent, setIncludeRecent] = useState(false);
  const [recentDays, setRecentDays] = useState(30);

  const handleDuplicate = () => {
    onDuplicate({
      includeRecurringTransactions: includeRecurring,
      includeRecentTransactions: includeRecent,
      recentDays: includeRecent ? recentDays : undefined,
    });
  };

  const resetOptions = () => {
    setIncludeRecurring(false);
    setIncludeRecent(false);
    setRecentDays(30);
  };

  React.useEffect(() => {
    if (!isOpen) {
      resetOptions();
    }
  }, [isOpen]);

  if (!budget) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Duplicate Budget"
      size="md"
    >
      <div className="space-y-6">
        {/* Budget Info */}
        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: budget.color }}
          />
          <div>
            <h3 className="font-semibold text-gray-900">{budget.name}</h3>
            <p className="text-sm text-gray-600">
              Will be duplicated as "{budget.name} (Copy)"
            </p>
          </div>
        </div>

        {/* Duplication Options */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center">
            <Copy className="h-4 w-4 mr-2" />
            What to include in the duplicate?
          </h4>

          {/* Option 1: Structure Only */}
          <Card className={`p-4 border-2 cursor-pointer transition-all ${
            !includeRecurring && !includeRecent 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}>
            <div className="flex items-start space-x-3">
              <input
                type="radio"
                id="structure-only"
                name="duplicate-option"
                checked={!includeRecurring && !includeRecent}
                onChange={() => {
                  setIncludeRecurring(false);
                  setIncludeRecent(false);
                }}
                className="mt-1"
              />
              <div className="flex-1">
                <label htmlFor="structure-only" className="font-medium text-gray-900 cursor-pointer">
                  Budget Structure Only
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  Copy categories with planned amounts. Start fresh with no transactions.
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="secondary" size="sm">Categories</Badge>
                  <Badge variant="secondary" size="sm">Planned Amounts</Badge>
                  <Badge variant="secondary" size="sm">Colors</Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Option 2: With Recurring Transactions */}
          <Card className={`p-4 border-2 cursor-pointer transition-all ${
            includeRecurring 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}>
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="include-recurring"
                checked={includeRecurring}
                onChange={(e) => {
                  setIncludeRecurring(e.target.checked);
                  if (e.target.checked) setIncludeRecent(false);
                }}
                className="mt-1"
              />
              <div className="flex-1">
                <label htmlFor="include-recurring" className="font-medium text-gray-900 cursor-pointer flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Include Recurring Transactions
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  Perfect for monthly budgets! Copies recurring transactions like salary, rent, loan payments.
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="success" size="sm">Monthly Bills</Badge>
                  <Badge variant="success" size="sm">Salary</Badge>
                  <Badge variant="success" size="sm">Loan Payments</Badge>
                </div>
                
                {includeRecurring && (
                  <div className="mt-3 p-3 bg-green-100 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm text-green-700">
                      <Info className="h-4 w-4" />
                      <span>Recurring transactions will be scheduled for next occurrence and marked as pending for review.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Option 3: With Recent Transactions */}
          <Card className={`p-4 border-2 cursor-pointer transition-all ${
            includeRecent 
              ? 'border-amber-500 bg-amber-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}>
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="include-recent"
                checked={includeRecent}
                onChange={(e) => {
                  setIncludeRecent(e.target.checked);
                  if (e.target.checked) setIncludeRecurring(false);
                }}
                className="mt-1"
              />
              <div className="flex-1">
                <label htmlFor="include-recent" className="font-medium text-gray-900 cursor-pointer flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Include Recent Transactions
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  Copy recent transactions as templates. Useful for similar spending patterns.
                </p>
                
                {includeRecent && (
                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Copy transactions from last:
                      </label>
                      <select
                        value={recentDays}
                        onChange={(e) => setRecentDays(Number(e.target.value))}
                        className="block w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                      >
                        <option value={7}>7 days</option>
                        <option value={14}>14 days</option>
                        <option value={30}>30 days</option>
                        <option value={60}>60 days</option>
                        <option value={90}>90 days</option>
                      </select>
                    </div>
                    
                    <div className="p-3 bg-amber-100 rounded-lg">
                      <div className="flex items-center space-x-2 text-sm text-amber-700">
                        <Info className="h-4 w-4" />
                        <span>Recent transactions will be copied as pending and marked with "(Copied)" for easy identification.</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="warning" size="sm">Recent Expenses</Badge>
                  <Badge variant="warning" size="sm">Spending Patterns</Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Summary */}
        <div className="border-t pt-4">
          <h5 className="font-medium text-gray-900 mb-2">What will be copied:</h5>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Budget structure and categories</span>
            </div>
            {includeRecurring && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Recurring transactions (scheduled for next occurrence)</span>
              </div>
            )}
            {includeRecent && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>Recent transactions (last {recentDays} days)</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleDuplicate}
            isLoading={isLoading}
            className="w-full sm:w-auto sm:flex-1 order-1 sm:order-2"
          >
            <Copy className="h-4 w-4 mr-2" />
            Duplicate Budget
          </Button>
        </div>
      </div>
    </Modal>
  );
};