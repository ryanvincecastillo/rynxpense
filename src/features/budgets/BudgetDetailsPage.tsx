// BudgetDetailsPage.tsx - Enhanced with new Budget Planning Tab
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';

import { useBudget, useBudgetSummary, useBudgetCategories, useTransactions } from '../../hooks/useApi';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Alert, LoadingSpinner } from '../../components/ui';
import { useBudgetState } from '../../hooks/useBudgetState';
import { useBudgetActions } from '../../hooks/useBudgetActions';
import BudgetHeader from '../../components/BudgetHeader';
import BudgetActionsMenu from '../../components/BudgetActionsMenu';
import BudgetSummaryCards from '../../components/BudgetSummaryCards'; // Updated import
import BudgetTabs from '../../components/BudgetTabs';
import BudgetOverviewTab from '../../components/BudgetOverviewTab';
import BudgetPlanningTab from '../../components/BudgetPlanningTab'; // Updated import
import BudgetTransactionsTab from '../../components/BudgetTransactionsTab';
import BudgetModals from '../../components/BudgetModals'; // Updated import

const BudgetDetailsPage: React.FC = () => {
  const { budgetId } = useParams<{ budgetId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Centralized state management
  const {
    activeTab,
    setActiveTab,
    modalState,
    setModalState,
    filters,
    setFilters,
    editingItem,
    setEditingItem,
  } = useBudgetState();

  // API hooks
  const { data: budget, isLoading: budgetLoading, error: budgetError } = useBudget(budgetId!);
  const { data: summary, isLoading: summaryLoading } = useBudgetSummary(budgetId!);
  const { data: categoriesData, isLoading: categoriesLoading } = useBudgetCategories(budgetId!);
  const { data: transactionsResponse, isLoading: transactionsLoading } = useTransactions({
    budgetId: budgetId!,
    limit: 50,
    sortBy: 'date',
    sortOrder: 'desc',
    ...filters.transactions,
  });

  // Centralized action handlers
  const budgetActions = useBudgetActions({
    budget,
    budgetId: budgetId!,
    navigate,
    setModalState,
    setEditingItem,
  });

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: user?.currency || 'PHP',
    }).format(amount);
  };

  // Enhanced category action handler for the new planning tab
  const handleCategoryActionEnhanced = (action: string, category?: any, data?: any) => {
    switch (action) {
      case 'create':
        setEditingItem(prev => ({ ...prev, category: null }));
        setModalState(prev => ({ ...prev, showCategoryModal: true }));
        break;
      case 'edit':
        if (category) {
          setEditingItem(prev => ({ ...prev, category }));
          setModalState(prev => ({ ...prev, showCategoryModal: true }));
        }
        break;
      case 'toggleActive':
        if (category) {
          budgetActions.handleCategoryAction('toggleActive', category);
        }
        break;
      case 'delete':
        if (category) {
          budgetActions.handleCategoryAction('delete', category);
        }
        break;
      default:
        budgetActions.handleCategoryAction(action, category, data);
        break;
    }
  };

  // Enhanced modal submit handler
  const handleModalSubmitEnhanced = (type: string, data: any) => {
    if (type === 'category') {
      if (editingItem.category) {
        // Update existing category
        budgetActions.handleCategoryAction('update', editingItem.category, data);
      } else {
        // Create new category
        budgetActions.handleCategoryAction('create', undefined, {
          budgetId,
          ...data,
        });
      }
    } else {
      // Handle other modal types
      budgetActions.handleModalSubmit(type, data);
    }
  };

  if (budgetLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (budgetError || !budget) {
    return (
      <div className="space-y-6">
        <Alert type="error">
          Budget not found or you don't have permission to access it.
        </Alert>
        <Link to="/budgets">
          <Button variant="secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Budgets
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <BudgetHeader
        budget={budget}
        onEdit={() => setModalState(prev => ({ ...prev, showEditModal: true }))}
        onQuickAction={budgetActions.handleQuickAction}
        formatCurrency={formatCurrency}
      >
        <BudgetActionsMenu
          budget={budget}
          isOpen={modalState.showActionsMenu}
          onToggle={() => setModalState(prev => ({ ...prev, showActionsMenu: !prev.showActionsMenu }))}
          onAction={budgetActions.handleMenuAction}
        />
      </BudgetHeader>

      {/* Summary Cards */}
      <BudgetSummaryCards 
        summary={summary} 
        formatCurrency={formatCurrency}
        isLoading={summaryLoading}
        categoriesData={categoriesData} // Pass categories data for enhanced display
      />

      {/* Tabs Navigation */}
      <BudgetTabs 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        summary={summary}
      />

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <BudgetOverviewTab
          categoriesData={categoriesData}
          formatCurrency={formatCurrency}
          onQuickAction={budgetActions.handleQuickAction}
        />
      )}

      {activeTab === 'budget-planning' && (
        <BudgetPlanningTab
          categoriesData={categoriesData}
          filters={{
            type: filters.categories.type,
            showInactive: filters.categories.showInactive,
            searchTerm: '', // Add search term to existing filters
          }}
          onFiltersChange={(newFilters) => setFilters(prev => ({ 
                      ...prev, 
                      categories: {
                        type: newFilters.type,
                        showInactive: newFilters.showInactive,
                        searchTerm: newFilters.searchTerm ?? prev.categories.searchTerm,
                      }
                    }))}
          onCategoryAction={handleCategoryActionEnhanced}
          formatCurrency={formatCurrency}
          isLoading={categoriesLoading}
        />
      )}

      {activeTab === 'transactions' && (
        <BudgetTransactionsTab
          transactions={transactionsResponse?.data || []}
          categoriesData={categoriesData}
          filters={filters.transactions}
          onFiltersChange={(newFilters) => setFilters(prev => ({ ...prev, transactions: newFilters }))}
          onTransactionAction={budgetActions.handleTransactionAction}
          formatCurrency={formatCurrency}
          isLoading={transactionsLoading}
        />
      )}

      {/* All Modals */}
      <BudgetModals
        budget={budget}
        categoriesData={categoriesData}
        modalState={modalState}
        editingItem={editingItem}
        onClose={budgetActions.handleCloseModal}
        onSubmit={handleModalSubmitEnhanced}
        formatCurrency={formatCurrency}
      />
    </div>
  );
};

export default BudgetDetailsPage;