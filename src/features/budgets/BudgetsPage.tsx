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

// UI Components
import { 
  Button, 
  EmptyState, 
  Alert,
  Input,
  Badge
} from '../../components/ui';

// Modal Components
import { BudgetFormModal } from '../../components/modals';
import { DuplicateBudgetModal } from '../../components/modals/DuplicateBudgetModal';
import { DeleteConfirmModal, ArchiveConfirmModal } from '../../components/ui';
import { AIBudgetCreationModal } from '../../components/modals/AIBudgetCreationModal';

// Feature Components
import { BudgetsList } from '../../components/features/budget';

// Types
import { Budget, DuplicateBudgetOptions, CreateBudgetForm } from '../../types';
import { CreateBudgetWithTemplateForm } from '../../types/template';
import { useCreateBudgetWithTemplate } from '../../hooks/useBudgetTemplate';
import { CreateAIBudgetResult } from '../../services/aiBudgetService';

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

// AI Budget Data interface
interface AIBudgetData {
  monthlyIncome: number;
  financialGoals: string;
  currentExpenses: string;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  budgetName?: string;
}

// Simple Tooltip component
const Tooltip: React.FC<{ 
  content: string; 
  children: React.ReactNode; 
}> = ({ content, children }) => {
  const [show, setShow] = useState(false);
  
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute z-50 px-2 py-1 text-xs text-white bg-black rounded bottom-full mb-1 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
        </div>
      )}
    </div>
  );
};

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

    // Calculate stats
    const stats: BudgetStats = {
      total: budgets.length,
      active: budgets.filter(b => !b.isArchived).length,
      archived: budgets.filter(b => b.isArchived).length,
    };

    return {
      activeBudgets,
      archivedBudgets,
      stats,
      filteredCount: filtered.length,
    };
  }, [budgets, filters]);
};

const BudgetsPage: React.FC = () => {
  const { user } = useAuth();
  const { formatCurrency } = useFormatCurrency();
  const { showError, showSuccess } = useToast();

  // Modal States
  const createModal = useModal();
  const deleteModal = useModal();
  const archiveModal = useModal();
  const duplicateModal = useModal();

  // New AI modal states
  const [showAIModal, setShowAIModal] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  // Component State
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

  // Extract budgets array from API response
  const budgets: Budget[] = budgetsResponse?.data || [];

  // Filter budgets using custom hook
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

  // AI Modal Handlers
  const handleAIModalOpen = useCallback(() => {
    setShowAIModal(true);
  }, []);

  const handleAIModalClose = useCallback(() => {
    setShowAIModal(false);
  }, []);

  const handleCreateWithAI = useCallback(async (data: AIBudgetData) => {
    try {
      // Your AI creation logic here
      console.log('Creating budget with AI:', data);
      
      // Example implementation - replace with your actual AI service call
      // const result = await createAIBudget(data);
      // handleAIBudgetSuccess(result);
      
      setShowAIModal(false);
      showSuccess('AI Budget created successfully! 🤖✨');
    } catch (error: any) {
      showError(error.message || 'Failed to create AI budget');
    }
  }, [showSuccess, showError]);

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

  const handleArchiveBudget = useCallback(async () => {
    if (!budgetToArchive) return;
    
    try {
      await updateBudgetMutation.mutateAsync({
        id: budgetToArchive.id,
        data: {isArchived: !budgetToArchive.isArchived },
      });
      archiveModal.close();
      showSuccess(`Budget ${budgetToArchive.isArchived ? 'unarchived' : 'archived'} successfully!`);
      setBudgetToArchive(null);
    } catch (error: any) {
      showError(error.message || 'Failed to archive budget');
    }
  }, [budgetToArchive, updateBudgetMutation, archiveModal, showSuccess, showError]);

  const handleDuplicateBudget = useCallback(async (options: DuplicateBudgetOptions) => {
    if (!budgetToDuplicate) return;
    
    try {
      await duplicateBudgetMutation.mutateAsync({
        budgetId: budgetToDuplicate.id,
        ...options,
      });
      duplicateModal.close();
      showSuccess('Budget duplicated successfully!');
      setBudgetToDuplicate(null);
    } catch (error: any) {
      showError(error.message || 'Failed to duplicate budget');
    }
  }, [budgetToDuplicate, duplicateBudgetMutation, duplicateModal, showSuccess, showError]);

  // Event Handlers
  const handleEditBudget = useCallback((budget: Budget) => {
    setEditingBudget(budget);
    createModal.open();
  }, [createModal]);

  const handleDeleteConfirm = useCallback((budget: Budget) => {
    setBudgetToDelete(budget);
    deleteModal.open();
  }, [deleteModal]);

  const handleArchiveConfirm = useCallback((budget: Budget) => {
    setBudgetToArchive(budget);
    archiveModal.open();
  }, [archiveModal]);

  const handleDuplicateConfirm = useCallback((budget: Budget) => {
    setBudgetToDuplicate(budget);
    duplicateModal.open();
  }, [duplicateModal]);

  const handleNewBudget = useCallback(() => {
    setEditingBudget(null);
    createModal.open();
  }, [createModal]);

  // Handle filter changes
  const handleFilterChange = useCallback(
    (key: keyof BudgetFilters, value: any) => {
      setFilters(prev => ({ ...prev, [key]: value }));
    },
    []
  );

  // Render Modern Header
  const renderHeader = () => (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Budgets</h1>
        <p className="text-gray-600">
          Manage your budgets and track your financial goals
        </p>
      </div>

      {/* Modern Action Buttons */}
      <div className="flex items-center gap-3">
        {/* Primary CTA - Smart Budget Creation */}
        <div className="relative group">
          <Button
            onClick={handleAIModalOpen}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
                       text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-300 
                       hover:shadow-xl hover:scale-105 group relative overflow-hidden font-medium"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 
                            group-hover:opacity-20 transition-opacity duration-300"></div>
            <div className="relative flex items-center space-x-2.5">
              <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
              <span>Create Budget</span>
              <div className="hidden sm:block w-px h-4 bg-white/30 ml-1"></div>
              <span className="hidden sm:inline text-xs opacity-90">Smart</span>
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
        </div>

        {/* Secondary Actions - Dropdown Menu */}
        <div className="relative" data-dropdown>
          <Button
            onClick={() => setShowCreateMenu(!showCreateMenu)}
            variant="secondary"
            className="px-4 py-3 bg-white border-2 border-gray-200 hover:border-gray-300 
                       text-gray-700 hover:text-gray-900 rounded-xl transition-all duration-200
                       hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <div className="flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">Quick Actions</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                showCreateMenu ? 'rotate-180' : ''
              }`} />
            </div>
          </Button>

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
                           duration-150 flex items-center space-x-3 group opacity-60 cursor-not-allowed"
                disabled
              >
                <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 
                                rounded-lg flex items-center justify-center">
                  <Upload className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Import Budget</p>
                  <p className="text-sm text-gray-500">Coming soon</p>
                </div>
              </button>
            </div>
          )}
        </div>
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
        isAILoading={createBudgetMutation.isPending}
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

      <DuplicateBudgetModal
        isOpen={duplicateModal.isOpen}
        onClose={duplicateModal.close}
        budget={budgetToDuplicate}
        onDuplicate={handleDuplicateBudget}
        isLoading={duplicateBudgetMutation.isPending}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleDeleteBudget}
        itemName={budgetToDelete?.name || ''}
        itemType="budget"
        isLoading={deleteBudgetMutation.isPending}
      />

      <ArchiveConfirmModal
        isOpen={archiveModal.isOpen}
        onClose={archiveModal.close}
        onConfirm={handleArchiveBudget}
        itemName={budgetToArchive?.name || ''}
        itemType="budget"
        isArchived={budgetToArchive?.isArchived || false}
        isLoading={updateBudgetMutation.isPending}
      />
    </>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading budgets...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <Alert type="error">
          <p className="font-medium">Error loading budgets</p>
          <p className="text-sm">{error.message}</p>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Modernized Header Section */}
      {renderHeader()}

      {/* Filters and Controls */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search budgets..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Archive Toggle */}
            <Button
              variant={filters.includeArchived ? 'primary' : 'secondary'}
              onClick={() => handleFilterChange('includeArchived', !filters.includeArchived)}
              className="flex items-center space-x-2"
            >
              {filters.includeArchived ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span>{filters.includeArchived ? 'Hide' : 'Show'} Archived</span>
            </Button>
          </div>

          {/* Sort and View Controls */}
          <div className="flex items-center gap-3">
            {/* Sort */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-') as [SortOption, 'asc' | 'desc'];
                  setFilters(prev => ({ ...prev, sortBy, sortOrder }));
                }}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="created-desc">Newest First</option>
                <option value="created-asc">Oldest First</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="updated-desc">Recently Updated</option>
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="p-2"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="p-2"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <span>{filteredData.stats.total} Total</span>
            <span>{filteredData.stats.active} Active</span>
            {filteredData.stats.archived > 0 && (
              <span>{filteredData.stats.archived} Archived</span>
            )}
          </div>
          
          {filters.search && (
            <Badge variant="secondary">
              {filteredData.filteredCount} result{filteredData.filteredCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </div>

      {/* Budgets List */}
      
        {/* Active Budgets */}
        {filteredData.activeBudgets.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Budgets</h2>
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }
            >
              {filteredData.activeBudgets.map((budget) => (
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
        {filters.includeArchived && filteredData.archivedBudgets.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-500 mb-4">Archived Budgets</h2>
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }
            >
              {filteredData.archivedBudgets.map((budget) => (
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
      {filteredData.activeBudgets.length === 0 && !filters.includeArchived && (
        <EmptyState
          icon={Plus}
          title="No budgets found"
          description={filters.search ? 
            "No budgets match your search criteria." : 
            "Get started by creating your first budget."
          }
          action={
            <Button onClick={handleAIModalOpen}>
              Create Budget
            </Button>
          }
        />
      )}

      {/* Modals */}
      {renderModals()}
    </div>
  );
};

export default BudgetsPage;