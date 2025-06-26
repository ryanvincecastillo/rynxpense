// src/components/modals/LeaveBudgetModal.tsx
import React from 'react';
import { LogOut, AlertTriangle } from 'lucide-react';
import { Modal, Button, Alert, LoadingSpinner } from '../ui';
import { Budget } from '../../types';
import { useLeaveBudget } from '../../hooks/useApi';

interface LeaveBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: Budget | null;
  onSuccess?: () => void;
}

export const LeaveBudgetModal: React.FC<LeaveBudgetModalProps> = ({
  isOpen,
  onClose,
  budget,
  onSuccess
}) => {
  const leaveBudgetMutation = useLeaveBudget();

  const handleLeaveBudget = async () => {
    if (!budget) return;

    try {
      await leaveBudgetMutation.mutateAsync(budget.id);
      onClose();
      onSuccess?.();
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (!budget) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Leave Shared Budget"
      size="sm"
    >
      <div className="space-y-4">
        {/* Warning */}
        <Alert type="warning">
          <AlertTriangle className="h-4 w-4" />
          <div>
            <p className="font-medium">Are you sure you want to leave this budget?</p>
            <p className="text-sm mt-1">
              You will lose access to "{budget.name}" and all its data. 
              The budget owner can re-invite you if needed.
            </p>
          </div>
        </Alert>

        {/* Budget Info */}
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: budget.color }}
          />
          <div>
            <h3 className="font-medium text-gray-900">{budget.name}</h3>
            <p className="text-sm text-gray-600">Shared budget</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 pt-4">
          <Button
            onClick={handleLeaveBudget}
            disabled={leaveBudgetMutation.isPending}
            variant="danger"
            className="flex-1"
          >
            {leaveBudgetMutation.isPending ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <LogOut className="h-4 w-4 mr-2" />
                Leave Budget
              </>
            )}
          </Button>
          <Button
            onClick={onClose}
            variant="secondary"
            className="flex-1"
            disabled={leaveBudgetMutation.isPending}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};