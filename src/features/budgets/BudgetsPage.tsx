// src/features/budgets/BudgetsPage.tsx
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
  MoreVertical,
  TrendingUp,
  AlertCircle,
  Clock,
  Users
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
import { useCreateAIBudget } from '../../hooks/useAIBudget';

// UI Components
import { 
  Button, 
  EmptyState, 
  Alert,
  Input,
  Badge,
  LoadingSpinner
} from '../../components/ui';

// Modal Components
import { AIBudgetCreationModal, BudgetFormModal, LeaveBudgetModal, ShareBudgetModal } from '../../components/modals';
import { DuplicateBudgetModal } from '../../components/modals/DuplicateBudgetModal';
import { DeleteConfirmModal, ArchiveConfirmModal } from '../../components/ui';

// Feature Components
import { BudgetsList } from '../../components/features/budget';

// Types
import { Budget, DuplicateBudgetOptions, CreateBudgetForm } from '../../types';
import { CreateBudgetWithTemplateForm } from '../../types/template';
import { useCreateBudgetWithTemplate } from '../../hooks/useBudgetTemplate';
import { AIBudgetRequest } from '../../services/aiBudgetService';

// Types and Interfaces
type SortOption = 'name' | 'created' | 'updated' | 'netActual' | 'totalTransactions';

interface BudgetFilters {
  search: string;
  includeArchived: boolean;
  sortBy: SortOption;
  sortOrder: 'asc' | 'desc';
  showSharedOnly: boolean;
}

interface BudgetStats {
  total: number;
  active: number;
  archived: number;
  shared: number;
}

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

const BudgetsPage: React.FC = () => {
  const { user } = useAuth();
  const { formatCurrency } = useFormatCurrency();
  const { toast } = useToast();
  const { isOpen, open: openModal, close: closeModal } = useModal();

  // State Management
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [modalType, setModalType] = useState<string | null>(null);
  const [filters, setFilters] = useState<BudgetFilters>({
    search: '',
    includeArchived: false,
    sortBy: 'updated',
    sortOrder: 'desc',
    showSharedOnly: false
  });

  // Debounced search
  const debouncedSearch = useDebounce(filters.search, 300);

  // API Hooks
  const { 
    data: budgetsData, 
    isLoading: budgetsLoading, 
    error: budgetsError 
  } = useBudgets({
    search: debouncedSearch,
    includeArchived: filters.includeArchived,
    page: 1,
    limit: 50
  });

  const createBudgetMutation = useCreateBudget();
  const updateBudgetMutation = useUpdateBudget();
  const deleteBudgetMutation = useDeleteBudget();
  const duplicateBudgetMutation = useDuplicateBudget();
  const createBudgetWithTemplateMutation = useCreateBudgetWithTemplate();
  const createAIBudgetMutation = useCreateAIBudget();

  // Computed Values
  const budgets = budgetsData?.data || [];
  
  const filteredAndSortedBudgets = useMemo(() => {
    let filtered = [...budgets];

    // Apply shared filter
    if (filters.showSharedOnly) {
      filtered = filtered.filter(budget => budget.isShared);
    }

    // Sort budgets
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'created':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'updated':
          aValue = new Date(a.updatedAt);
          bValue = new Date(b.updatedAt);
          break;
        case 'netActual':
          aValue = a.summary?.netActual || 0;
          bValue = b.summary?.netActual || 0;
          break;
        case 'totalTransactions':
          aValue = a._count?.transactions || 0;
          bValue = b._count?.transactions || 0;
          break;
        default:
          aValue = new Date(a.updatedAt);
          bValue = new Date(b.updatedAt);
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [budgets, filters]);

  const budgetStats: BudgetStats = useMemo(() => {
    return {
      total: budgets.length,
      active: budgets.filter((b: Budget) => !b.isArchived).length,
      archived: budgets.filter((b: Budget) => b.isArchived).length,
      shared: budgets.filter((b: Budget) => b.isShared).length
    };
  }, [budgets]);

  // Event Handlers
  const handleCreateBudget = useCallback(async (data: CreateBudgetForm) => {
    try {
      await createBudgetMutation.mutateAsync(data);
      toast.success('Budget created successfully!');
      closeModal();
    } catch (error) {
      toast.error('Failed to create budget');
    }
  }, [createBudgetMutation, toast, closeModal]);

  const handleCreateBudgetWithTemplate = useCallback(async (data: CreateBudgetWithTemplateForm) => {
    try {
      await createBudgetWithTemplateMutation.mutateAsync(data);
      toast.success('Budget created from template successfully!');
      closeModal();
    } catch (error) {
      toast.error('Failed to create budget from template');
    }
  }, [createBudgetWithTemplateMutation, toast, closeModal]);

  const handleCreateAIBudget = useCallback(async (data: AIBudgetData) => {
    try {
      const aiRequest: AIBudgetRequest = {
        userInput: data.financialGoals || data.currentExpenses || 'Create a budget',
        monthlyIncome: data.monthlyIncome,
        currency: 'PHP',
        additionalContext: {
          familySize: data.dependents,
          goals: data.financialGoals ? [data.financialGoals] : []
        }
      };
      
      await createAIBudgetMutation.mutateAsync(aiRequest);
      toast.success('AI Budget created successfully!');
      closeModal();
    } catch (error) {
      toast.error('Failed to create AI budget');
    }
  }, [createAIBudgetMutation, toast, closeModal]);

  const handleEditBudget = useCallback((budget: Budget) => {
    setSelectedBudget(budget);
    setModalType('edit');
    openModal();
  }, [openModal]);

  const handleDuplicateBudget = useCallback((budget: Budget) => {
    setSelectedBudget(budget);
    setModalType('duplicate');
    openModal();
  }, [openModal]);

  const handleConfirmDuplicate = useCallback(async (options: DuplicateBudgetOptions) => {
    if (!selectedBudget) return;
    
    try {
      await duplicateBudgetMutation.mutateAsync({
        budgetId: selectedBudget.id,
        ...options
      });
      toast.success('Budget duplicated successfully!');
      closeModal();
    } catch (error) {
      toast.error('Failed to duplicate budget');
    }
  }, [selectedBudget, duplicateBudgetMutation, toast, closeModal]);

  const handleArchiveBudget = useCallback((budget: Budget) => {
    setSelectedBudget(budget);
    setModalType('archive');
    openModal();
  }, [openModal]);

  const handleConfirmArchive = useCallback(async () => {
    if (!selectedBudget) return;
    
    try {
      await updateBudgetMutation.mutateAsync({
        id: selectedBudget.id,
        data: { isArchived: !selectedBudget.isArchived }
      });
      
      const action = selectedBudget.isArchived ? 'unarchived' : 'archived';
      toast.success(`Budget ${action} successfully!`);
      closeModal();
    } catch (error) {
      toast.error('Failed to update budget');
    }
  }, [selectedBudget, updateBudgetMutation, toast, closeModal]);

  const handleDeleteBudget = useCallback((budget: Budget) => {
    setSelectedBudget(budget);
    setModalType('delete');
    openModal();
  }, [openModal]);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedBudget) return;
    
    try {
      await deleteBudgetMutation.mutateAsync(selectedBudget.id);
      toast.success('Budget deleted successfully!');
      closeModal();
    } catch (error) {
      toast.error('Failed to delete budget');
    }
  }, [selectedBudget, deleteBudgetMutation, toast, closeModal]);

  const handleFilterChange = useCallback((key: keyof BudgetFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      includeArchived: false,
      sortBy: 'updated',
      sortOrder: 'desc',
      showSharedOnly: false
    });
  }, []);

  const openCreateModal = useCallback((type: 'regular' | 'template' | 'ai') => {
    setModalType(type);
    openModal();
  }, [openModal]);

  const hasActiveFilters = useMemo(() => {
    return filters.search || 
           filters.includeArchived || 
           filters.showSharedOnly || 
           filters.sortBy !== 'updated' || 
           filters.sortOrder !== 'desc';
  }, [filters]);

  // Loading State
  if (budgetsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600">Loading your budgets...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (budgetsError) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Alert className="max-w-md mx-auto mt-8">
          <AlertCircle className="h-4 w-4" />
          <div>
            <h3 className="font-medium">Failed to load budgets</h3>
            <p className="text-sm mt-1">Please try refreshing the page</p>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 border-b border-gray-200/60 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            {/* Main Header Row */}
            <div className="flex items-center justify-between mb-6">
              {/* Left - Title and Welcome */}
              <div className="flex items-center space-x-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    My Budgets
                  </h1>
                  {/* <p className="text-sm text-gray-600 mt-0.5">
                    Welcome back! Manage your finances with ease.
                  </p> */}
                </div>
              </div>

              {/* Right - Quick Actions */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`${hasActiveFilters ? 'bg-blue-100 text-blue-700 border-blue-200' : 'hover:bg-gray-100'} transition-all duration-200`}
                  >
                    <Filter className="h-4 w-4" />
                    <span className="ml-2">Filters</span>
                    {hasActiveFilters && <div className="w-2 h-2 bg-blue-500 rounded-full ml-1"></div>}
                  </Button>
                </div>
                
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => openCreateModal('ai')}
                  className="bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-700 border-purple-200 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">AI Budget</span>
                </Button>
                
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => openCreateModal('regular')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">New Budget</span>
                </Button>
              </div>
            </div>

            {/* Minimal Stats - Inline with title or completely removable */}
            <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                {budgetStats.total} Total
              </span>
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                {budgetStats.active} Active
              </span>
              {budgetStats.shared > 0 && (
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  {budgetStats.shared} Shared
                </span>
              )}
              {budgetStats.archived > 0 && (
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  {budgetStats.archived} Archived
                </span>
              )}
            </div>

            {/* Search and Quick Filters - Mobile Optimized */}
            <div className="space-y-3">
              {/* Search Bar - Full width on mobile */}
              <div className="w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none z-10" />
                  <input
                    type="text"
                    placeholder="Search budgets..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-300 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Control Row - Responsive layout */}
              <div className="flex items-center justify-between gap-2">
                {/* Left - Quick Filter Toggles */}
                <div className="flex items-center gap-1 sm:gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFilterChange('includeArchived', !filters.includeArchived)}
                    className={`${filters.includeArchived ? 'bg-gray-100 text-gray-700' : 'text-gray-500'} transition-all duration-200 px-2 sm:px-3`}
                  >
                    <Eye className="h-4 w-4" />
                    <span className="hidden sm:inline ml-2">Archived</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFilterChange('showSharedOnly', !filters.showSharedOnly)}
                    className={`${filters.showSharedOnly ? 'bg-purple-100 text-purple-700' : 'text-gray-500'} transition-all duration-200 px-2 sm:px-3`}
                  >
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline ml-2">Shared</span>
                  </Button>
                </div>

                {/* Right - Advanced Filters Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`${hasActiveFilters ? 'bg-blue-100 text-blue-700 border-blue-200' : 'text-gray-500'} transition-all duration-200 px-2 sm:px-3`}
                >
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">More Filters</span>
                  {hasActiveFilters && <div className="w-2 h-2 bg-blue-500 rounded-full ml-1"></div>}
                </Button>
              </div>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <div className="mt-4 animate-in slide-in-from-top-2 duration-200">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Sort Options */}
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
                      <div className="flex gap-2">
                        <select
                          value={filters.sortBy}
                          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        >
                          <option value="updated">Last Updated</option>
                          <option value="created">Date Created</option>
                          <option value="name">Name</option>
                          <option value="netActual">Net Balance</option>
                          <option value="totalTransactions">Transactions</option>
                        </select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                          className="px-3 hover:bg-gray-100"
                        >
                          <SortAsc className={`h-4 w-4 transition-transform duration-200 ${filters.sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                        </Button>
                      </div>
                    </div>

                    {/* Clear Filters */}
                    {hasActiveFilters && (
                      <div className="flex items-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleClearFilters}
                          className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                        >
                          Clear filters
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto  py-6">
        {filteredAndSortedBudgets.length === 0 ? (
          <EmptyState
            title={
              filters.search || hasActiveFilters
                ? 'No budgets found'
                : 'No budgets yet'
            }
            description={
              filters.search || hasActiveFilters
                ? 'Try adjusting your search or filters'
                : 'Create your first budget to start managing your finances'
            }
            action={
              !filters.search && !hasActiveFilters ? (
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button
                    variant="secondary"
                    onClick={() => openCreateModal('ai')}
                    className="bg-gradient-to-r from-purple-100 to-blue-100 hover:from-purple-200 hover:to-blue-200 text-purple-700 border-purple-200"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Create with AI
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => openCreateModal('regular')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Budget
                  </Button>
                </div>
              ) : undefined
            }
            className="mt-12"
          />
        ) : (
          <BudgetsList
            budgets={filteredAndSortedBudgets}
            onEdit={handleEditBudget}
            onDuplicate={handleDuplicateBudget}
            onArchive={handleArchiveBudget}
            onDelete={handleDeleteBudget}
            formatCurrency={formatCurrency}
          />
        )}
      </div>

      {/* Modals */}
      {isOpen && modalType === 'regular' && (
        <BudgetFormModal
          isOpen={true}
          onClose={closeModal}
          onSubmit={handleCreateBudget}
          isLoading={createBudgetMutation.isPending}
        />
      )}

      {isOpen && modalType === 'template' && (
        <BudgetFormModal
          isOpen={true}
          onClose={closeModal}
          onSubmit={handleCreateBudget}
          isLoading={createBudgetWithTemplateMutation.isPending}
        />
      )}

      {isOpen && modalType === 'ai' && (
        <AIBudgetCreationModal
          isOpen={true}
          onClose={closeModal}
          onCreateWithAI={handleCreateAIBudget}
          onCreateWithTemplate={(templateId: string) => console.log('Template:', templateId)}
          onCreateManual={() => openCreateModal('regular')}
          isAILoading={createAIBudgetMutation.isPending}
        />
      )}

      {isOpen && modalType === 'edit' && selectedBudget && (
        <BudgetFormModal
          isOpen={true}
          onClose={closeModal}
          onSubmit={async (data) => {
            await updateBudgetMutation.mutateAsync({
              id: selectedBudget.id,
              data
            });
            closeModal();
          }}
          editingBudget={selectedBudget}
          isLoading={updateBudgetMutation.isPending}
        />
      )}

      {isOpen && modalType === 'duplicate' && selectedBudget && (
        <DuplicateBudgetModal
          isOpen={true}
          onClose={closeModal}
          onDuplicate={handleConfirmDuplicate}
          budget={selectedBudget}
          isLoading={duplicateBudgetMutation.isPending}
        />
      )}

      {isOpen && modalType === 'share' && selectedBudget && (
        <ShareBudgetModal
          isOpen={true}
          onClose={closeModal}
          budget={selectedBudget}
        />
      )}
      
      {/* {isOpen && modalType === 'leave' && selectedBudget && (
        <LeaveBudgetModal
          isOpen={true}
          onClose={closeModal}
          budget={selectedBudget}
          onSuccess={handleLeaveBudgetSuccess}
        />
      )} */}

      {isOpen && modalType === 'archive' && selectedBudget && (
        <ArchiveConfirmModal
          isOpen={true}
          onClose={closeModal}
          onConfirm={handleConfirmArchive}
          itemName={selectedBudget.name}
          itemType="budget"
          isArchived={selectedBudget.isArchived}
          isLoading={updateBudgetMutation.isPending}
        />
      )}

      {isOpen && modalType === 'delete' && selectedBudget && (
        <DeleteConfirmModal
          isOpen={true}
          onClose={closeModal}
          onConfirm={handleConfirmDelete}
          itemName={selectedBudget.name}
          itemType="budget"
          isLoading={deleteBudgetMutation.isPending}
        />
      )}
    </div>
  );
};

export default BudgetsPage;