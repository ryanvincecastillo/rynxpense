// src/features/budgets/BudgetsPage.tsx - Fixed AI Integration
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Grid3X3, 
  List, 
  Filter,
  SortAsc,
  Eye,
  EyeOff,
  Sparkles,
  ChevronDown,
  Upload
} from 'lucide-react';

// Hooks
import { 
  useBudgets, 
  useCreateBudget, 
  useUpdateBudget, 
  useDeleteBudget, 
  useDuplicateBudget 
} from '../../hooks/useApi';
import { useAuth } from '../../contexts/AuthContext';
import { useFormatCurrency, useToast, useModal, useDebounce } from '../../hooks/common';
import { useCreateAIBudget } from '../../hooks/useAIBudget'; // Import AI hook

// UI Components
import { 
  Button, 
  EmptyState, 
  Alert,
  Input,
  Badge
} from '../../components/ui';

// Modal Components
import { AIBudgetCreationModal, BudgetFormModal } from '../../components/modals';
import { DuplicateBudgetModal } from '../../components/modals/DuplicateBudgetModal';
import { DeleteConfirmModal, ArchiveConfirmModal } from '../../components/ui';

// Feature Components
import { BudgetsList } from '../../components/features/budget';

// Types
import { Budget, DuplicateBudgetOptions, CreateBudgetForm } from '../../types';
import { CreateBudgetWithTemplateForm } from '../../types/template';
import { useCreateBudgetWithTemplate } from '../../hooks/useBudgetTemplate';
import { AIBudgetRequest } from '../../services/aiBudgetService'; // Import AI types

// Types and Interfaces
type SortOption = 'name' | 'created' | 'updated';
type ViewMode = 'grid' | 'list';

interface BudgetFilters {
  search: string;
  includeArchived: boolean;
  sortBy: SortOption;
  sortOrder: 'asc' | 'desc';
}

interface BudgetStats {
  total: number;
  active: number;
  archived: number;
}

// AI Budget Data interface - Updated to match enhanced modal
interface AIBudgetData {
  monthlyIncome: number;
  financialGoals: string;
  currentExpenses: string;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  budgetName?: string;
  dependents?: number;
  debtAmount?: number;
  savingsGoal?: number;
}

// Custom hook for filtering budgets
const useBudgetFilters = (budgets: Budget[], filters: BudgetFilters) => {
  return useMemo(() => {
    let filtered = [...budgets];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(budget =>
        budget.name.toLowerCase().includes(searchLower) ||
        budget.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updated':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        default:
          comparison = 0;
      }
      
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    // Separate active and archived
    const activeBudgets = filtered.filter(budget => !budget.isArchived);
    const archivedBudgets = filtered.filter(budget => budget.isArchived);

    return {
      activeBudgets,
      archivedBudgets,
      filteredCount: filtered.length,
    };
  }, [budgets, filters]);
};

const BudgetsPage: React.FC = () => {
  // Authentication
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const { formatCurrency } = useFormatCurrency();

  // Modals
  const createModal = useModal();
  const deleteModal = useModal();
  const archiveModal = useModal();
  const duplicateModal = useModal();

  // State
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);
  const [budgetToArchive, setBudgetToArchive] = useState<Budget | null>(null);
  const [budgetToDuplicate, setBudgetToDuplicate] = useState<Budget | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  // Filter State
  const [filters, setFilters] = useState<BudgetFilters>({
    search: '',
    includeArchived: false,
    sortBy: 'created',
    sortOrder: 'desc',
  });

  // Debounced search
  const debouncedSearch = useDebounce(filters.search, 300);

  // API Queries and Mutations
  const { data: budgetsResponse, isLoading, error } = useBudgets();
  const createBudgetMutation = useCreateBudget();
  const updateBudgetMutation = useUpdateBudget();
  const deleteBudgetMutation = useDeleteBudget();
  const duplicateBudgetMutation = useDuplicateBudget();
  const createWithTemplateMutation = useCreateBudgetWithTemplate();
  
  // AI Budget Creation Hook
  const createAIBudgetMutation = useCreateAIBudget({
    onSuccess: (result) => {
      setShowAIModal(false);
      console.log('✅ AI Budget created successfully:', result);
      // Success toast is handled by the hook
    },
    onError: (error) => {
      console.error('❌ AI Budget creation failed:', error);
      // Error toast is handled by the hook
    }
  });

  // Extract budgets array from API response
  const budgets: Budget[] = budgetsResponse?.data || [];

  // Filter budgets using custom hook (assuming this exists)
  const filteredData = useBudgetFilters(budgets, {
    ...filters,
    search: debouncedSearch,
  });

  // Outside click handler for dropdown
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-dropdown]')) {
        setShowCreateMenu(false);
      }
    };

    if (showCreateMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
      return () => document.removeEventListener('mousedown', handleOutsideClick);
    }
  }, [showCreateMenu]);

  // Helper function to convert AIBudgetData to AIBudgetRequest
  const convertToAIRequest = useCallback((data: AIBudgetData): AIBudgetRequest => {
    // Build a comprehensive user input string from the form data
    const userInputParts = [
      `Monthly Income: ₱${data.monthlyIncome.toLocaleString()}`,
      `Financial Goals: ${data.financialGoals}`,
      `Current Expenses: ${data.currentExpenses}`,
      `Risk Tolerance: ${data.riskTolerance}`,
    ];

    if (data.dependents && data.dependents > 0) {
      userInputParts.push(`Dependents: ${data.dependents}`);
    }

    if (data.debtAmount && data.debtAmount > 0) {
      userInputParts.push(`Current Debt: ₱${data.debtAmount.toLocaleString()}`);
    }

    if (data.savingsGoal && data.savingsGoal > 0) {
      userInputParts.push(`Savings Goal: ₱${data.savingsGoal.toLocaleString()} per month`);
    }

    return {
      userInput: userInputParts.join('. '),
      monthlyIncome: data.monthlyIncome,
      currency: 'PHP',
      additionalContext: {
        familySize: data.dependents || 0,
        goals: [data.financialGoals],
        occupation: 'Not specified',
        location: 'Philippines'
      }
    };
  }, []);

  // AI Modal Handlers
  const handleAIModalOpen = useCallback(() => {
    setShowAIModal(true);
  }, []);

  const handleAIModalClose = useCallback(() => {
    setShowAIModal(false);
  }, []);

  const handleCreateWithAI = useCallback(async (data: AIBudgetData) => {
    try {
      console.log('🤖 Creating budget with AI:', data);
      
      // Convert AIBudgetData to AIBudgetRequest format
      const aiRequest = convertToAIRequest(data);
      console.log('📤 AI Request:', aiRequest);
      
      // Call the AI budget creation mutation
      await createAIBudgetMutation.mutateAsync(aiRequest);
      
    } catch (error: any) {
      console.error('❌ AI Budget creation failed:', error);
      showError(error.message || 'Failed to create AI budget');
    }
  }, [createAIBudgetMutation, convertToAIRequest, showError]);

  const handleCreateWithTemplate = useCallback(async (templateId: string) => {
    try {
      await createWithTemplateMutation.mutateAsync({
        name: 'New Budget from Template',
        description: 'Created from template',
        color: '#3B82F6',
        applyTemplate: true,
        templateId
      });
      setShowAIModal(false);
      showSuccess('Budget created from template successfully!');
    } catch (error: any) {
      showError(error.message || 'Failed to create budget from template');
    }
  }, [createWithTemplateMutation, showSuccess, showError]);

  const handleCreateManual = useCallback(() => {
    handleNewBudget();
    setShowAIModal(false);
  }, []);

  // Original Handlers
  const handleNewBudget = useCallback(() => {
    setEditingBudget(null);
    createModal.open();
  }, [createModal]);

  const handleEditBudget = useCallback((budget: Budget) => {
    setEditingBudget(budget);
    createModal.open();
  }, [createModal]);

  const handleCreateBudget = useCallback(async (data: CreateBudgetForm) => {
    try {
      await createBudgetMutation.mutateAsync(data);
      createModal.close();
      showSuccess('Budget created successfully!');
      setEditingBudget(null);
    } catch (error: any) {
      showError(error.message || 'Failed to create budget');
    }
  }, [createBudgetMutation, createModal, showSuccess, showError]);

  const handleUpdateBudget = useCallback(async (data: CreateBudgetForm) => {
    if (!editingBudget) return;
    
    try {
      await updateBudgetMutation.mutateAsync({
        id: editingBudget.id,
        data,
      });
      createModal.close();
      showSuccess('Budget updated successfully!');
      setEditingBudget(null);
    } catch (error: any) {
      showError(error.message || 'Failed to update budget');
    }
  }, [editingBudget, updateBudgetMutation, createModal, showSuccess, showError]);

  const handleDeleteConfirm = useCallback((budget: Budget) => {
    setBudgetToDelete(budget);
    deleteModal.open();
  }, [deleteModal]);

  const handleDeleteBudget = useCallback(async () => {
    if (!budgetToDelete) return;
    
    try {
      await deleteBudgetMutation.mutateAsync(budgetToDelete.id);
      deleteModal.close();
      showSuccess('Budget deleted successfully!');
      setBudgetToDelete(null);
    } catch (error: any) {
      showError(error.message || 'Failed to delete budget');
    }
  }, [budgetToDelete, deleteBudgetMutation, deleteModal, showSuccess, showError]);

  const handleArchiveConfirm = useCallback((budget: Budget) => {
    setBudgetToArchive(budget);
    archiveModal.open();
  }, [archiveModal]);

  const handleArchiveBudget = useCallback(async () => {
    if (!budgetToArchive) return;
    
    try {
      await updateBudgetMutation.mutateAsync({
        id: budgetToArchive.id,
        data: { isArchived: !budgetToArchive.isArchived },
      });
      archiveModal.close();
      showSuccess(`Budget ${budgetToArchive.isArchived ? 'unarchived' : 'archived'} successfully!`);
      setBudgetToArchive(null);
    } catch (error: any) {
      showError(error.message || 'Failed to archive budget');
    }
  }, [budgetToArchive, updateBudgetMutation, archiveModal, showSuccess, showError]);

  const handleDuplicateConfirm = useCallback((budget: Budget) => {
    setBudgetToDuplicate(budget);
    duplicateModal.open();
  }, [duplicateModal]);

  const handleDuplicateBudget = useCallback(async (options: DuplicateBudgetOptions) => {
    if (!budgetToDuplicate) return;
    
    try {
      await duplicateBudgetMutation.mutateAsync({
        budgetId: budgetToDuplicate.id,
        options,
      });
      duplicateModal.close();
      showSuccess('Budget duplicated successfully!');
      setBudgetToDuplicate(null);
    } catch (error: any) {
      showError(error.message || 'Failed to duplicate budget');
    }
  }, [budgetToDuplicate, duplicateBudgetMutation, duplicateModal, showSuccess, showError]);

  // Statistics
  const stats: BudgetStats = useMemo(() => {
    const total = budgets.length;
    const active = budgets.filter(b => !b.isArchived).length;
    const archived = budgets.filter(b => b.isArchived).length;
    
    return { total, active, archived };
  }, [budgets]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert type="error" title="Error Loading Budgets">
        {error.message || 'Failed to load budgets'}
      </Alert>
    );
  }

  // Page Header Component
  const renderHeader = () => (
    <div className="flex flex-col overflow-hidden">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Budgets</h1>
        
        {/* Action Button */}
        <div className="flex items-center">
          <div className="relative group">
            <Button
              onClick={handleAIModalOpen}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
                        text-white rounded-xl shadow-lg transition-all duration-300 
                        hover:shadow-xl hover:scale-105 group relative overflow-hidden font-medium
                        px-3 py-2 sm:px-6 sm:py-3"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 
                              group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="relative flex items-center space-x-1.5 sm:space-x-2">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 group-hover:animate-pulse" />
                <span className="hidden sm:inline">Create Budget</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCreateMenu(!showCreateMenu);
                  }}
                  className="p-0.5 sm:ml-1 sm:p-1 rounded-lg hover:bg-white/20 transition-colors duration-200"
                  aria-label="Show creation options"
                >
                  <ChevronDown 
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 ${
                      showCreateMenu ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
              </div>
            </Button>

            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 
                            group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
              <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                AI, Templates, or Manual creation
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 
                                border-transparent border-t-gray-900"></div>
              </div>
            </div>

            {/* Dropdown Menu */}
            {showCreateMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl 
                              border border-gray-200 py-2 z-50 animate-in slide-in-from-top-2 
                              duration-200">
                
                {/* Smart Creation Option */}
                <button
                  onClick={() => {
                    handleAIModalOpen();
                    setShowCreateMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors 
                            duration-150 flex items-center space-x-3 group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-blue-100 
                                  rounded-lg flex items-center justify-center group-hover:scale-105 
                                  transition-transform duration-200">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Smart Creation</p>
                    <p className="text-sm text-gray-500">AI, templates, or manual</p>
                  </div>
                </button>

                {/* Manual Creation Option */}
                <button
                  onClick={() => {
                    handleNewBudget();
                    setShowCreateMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors 
                            duration-150 flex items-center space-x-3 group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-green-100 
                                  rounded-lg flex items-center justify-center group-hover:scale-105 
                                  transition-transform duration-200">
                    <Plus className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Quick Manual</p>
                    <p className="text-sm text-gray-500">Start from scratch now</p>
                  </div>
                </button>

                {/* Divider */}
                <div className="border-t border-gray-100 my-2"></div>

                {/* Import Option (Future feature) */}
                <button
                  onClick={() => setShowCreateMenu(false)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors 
                            duration-150 flex items-center space-x-3 group opacity-50 cursor-not-allowed"
                  disabled
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 
                                  rounded-lg flex items-center justify-center">
                    <Upload className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-600">Import Budget</p>
                    <p className="text-sm text-gray-400">Coming soon...</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <p className="text-gray-600">
          Manage your budgets and track your financial goals
        </p>
      </div>
    </div>
  );

  // Render Modals
  const renderModals = () => (
    <>
      {/* AI Budget Creation Modal */}
      <AIBudgetCreationModal
        isOpen={showAIModal}
        onClose={handleAIModalClose}
        onCreateWithAI={handleCreateWithAI}
        onCreateWithTemplate={handleCreateWithTemplate}
        onCreateManual={handleCreateManual}
        isAILoading={createAIBudgetMutation.isPending}
        isTemplateLoading={createWithTemplateMutation.isPending}
      />

      {/* Keep existing modals for other functionalities */}
      <BudgetFormModal
        isOpen={createModal.isOpen}
        onClose={createModal.close}
        editingBudget={editingBudget}
        onSubmit={editingBudget ? handleUpdateBudget : handleCreateBudget}
        isLoading={createBudgetMutation.isPending || updateBudgetMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleDeleteBudget}
        title="Delete Budget"
        message={`Are you sure you want to delete "${budgetToDelete?.name}"? This action cannot be undone.`}
        isLoading={deleteBudgetMutation.isPending} 
        itemName={''}
      />

      {/* Archive Confirmation Modal */}
      <ArchiveConfirmModal
        isOpen={archiveModal.isOpen}
        onClose={archiveModal.close}
        onConfirm={handleArchiveBudget}
        title={`${budgetToArchive?.isArchived ? 'Unarchive' : 'Archive'} Budget`}
        message={`Are you sure you want to ${budgetToArchive?.isArchived ? 'unarchive' : 'archive'} "${budgetToArchive?.name}"?`}
        isLoading={updateBudgetMutation.isPending} itemName={''} 
        isArchived={false}
      />

      {/* Duplicate Budget Modal */}
      <DuplicateBudgetModal
        isOpen={duplicateModal.isOpen}
        onClose={duplicateModal.close}
        budget={budgetToDuplicate}
        onDuplicate={handleDuplicateBudget}
        isLoading={duplicateBudgetMutation.isPending}
      />
    </>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      {renderHeader()}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search budgets..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setFilters(prev => ({ ...prev, includeArchived: !prev.includeArchived }))}
            className="flex items-center space-x-2"
          >
            {filters.includeArchived ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{filters.includeArchived ? 'Hide' : 'Show'} Archived</span>
          </Button>
          
          {stats.total > 0 && (
            <Badge variant="secondary">
              {stats.active} Active{stats.archived > 0 && `, ${stats.archived} Archived`}
            </Badge>
          )}
        </div>
      </div>

      {/* Budgets List */}
      <div className="space-y-8">
        {/* Active Budgets */}
        {filteredData.activeBudgets?.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Budgets</h2>
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }
            >
              {filteredData.activeBudgets.map((budget: Budget) => (
                <BudgetsList
                  key={budget.id}
                  budget={budget}
                  onEdit={handleEditBudget}
                  onDuplicate={handleDuplicateConfirm}
                  onArchive={handleArchiveConfirm}
                  onDelete={handleDeleteConfirm}
                  formatCurrency={formatCurrency}
                  viewMode={viewMode}
                />
              ))}
            </div>
          </div>
        )}

        {/* Archived Budgets */}
        {filters.includeArchived && filteredData.archivedBudgets?.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-500 mb-4">Archived Budgets</h2>
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }
            >
              {filteredData.archivedBudgets.map((budget: Budget) => (
                <BudgetsList
                  key={budget.id}
                  budget={budget}
                  onEdit={handleEditBudget}
                  onDuplicate={handleDuplicateConfirm}
                  onArchive={handleArchiveConfirm}
                  onDelete={handleDeleteConfirm}
                  formatCurrency={formatCurrency}
                  viewMode={viewMode}
                  className="opacity-75"
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!filteredData.activeBudgets || filteredData.activeBudgets.length === 0) && !filters.includeArchived && (
          <EmptyState
            icon={Plus}
            title="No budgets found"
            description={filters.search ? 
              "No budgets match your search criteria." : 
              "Get started by creating your first budget."
            }
            action={
              <Button onClick={handleAIModalOpen}>
                <Sparkles className="w-4 h-4 mr-2" />
                Create Budget
              </Button>
            }
          />
        )}
      </div>

      {/* Modals */}
      {renderModals()}
    </div>
  );
};

export default BudgetsPage;