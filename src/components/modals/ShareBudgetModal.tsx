// src/components/modals/ShareBudgetModal.tsx
import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  Eye, 
  Edit, 
  Crown,
  MoreVertical,
  Trash2,
  Copy,
  Check
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Modal, Button, Input, Select, Badge, LoadingSpinner, Alert } from '../ui';
import { FormField } from '../forms';
import { Budget } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useAddCollaborator, useBudgetCollaborators, useRemoveCollaborator, useUpdateCollaboratorRole } from '../../hooks/useApi';

// Form validation schema
const addCollaboratorSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['VIEWER', 'EDITOR'], {
    errorMap: () => ({ message: 'Please select a role' })
  })
});

type AddCollaboratorForm = z.infer<typeof addCollaboratorSchema>;

interface ShareBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: Budget | null;
}

const roleOptions = [
  { value: 'VIEWER', label: 'Viewer', description: 'Can view budget data only' },
  { value: 'EDITOR', label: 'Editor', description: 'Can edit categories and transactions' },
];

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'OWNER': return Crown;
    case 'EDITOR': return Edit;
    case 'VIEWER': return Eye;
    default: return Shield;
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'OWNER': return 'bg-yellow-100 text-yellow-800';
    case 'EDITOR': return 'bg-green-100 text-green-800';
    case 'VIEWER': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const ShareBudgetModal: React.FC<ShareBudgetModalProps> = ({
  isOpen,
  onClose,
  budget
}) => {
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // API hooks
  const { data: collaboratorsData, isLoading } = useBudgetCollaborators(budget?.id || '');
  const addCollaboratorMutation = useAddCollaborator(budget?.id || '');
  const updateRoleMutation = useUpdateCollaboratorRole(budget?.id || '');
  const removeCollaboratorMutation = useRemoveCollaborator(budget?.id || '');

  // Form setup
  const form = useForm<AddCollaboratorForm>({
    resolver: zodResolver(addCollaboratorSchema),
    defaultValues: {
      email: '',
      role: 'VIEWER'
    }
  });

  // Check if current user is owner
  const isOwner = budget?.userId === user?.id || collaboratorsData?.owner?.user.id === user?.id;

  // Handle form submission
  const handleAddCollaborator = async (data: AddCollaboratorForm) => {
    try {
      await addCollaboratorMutation.mutateAsync(data);
      form.reset();
      setShowAddForm(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  // Handle role update
  const handleUpdateRole = async (collaboratorId: string, newRole: 'VIEWER' | 'EDITOR') => {
    try {
      await updateRoleMutation.mutateAsync({
        collaboratorId,
        data: { role: newRole }
      });
      setActiveDropdown(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  // Handle remove collaborator
  const handleRemoveCollaborator = async (collaboratorId: string) => {
    if (window.confirm('Are you sure you want to remove this collaborator?')) {
      try {
        await removeCollaboratorMutation.mutateAsync(collaboratorId);
        setActiveDropdown(null);
      } catch (error) {
        // Error handled by mutation
      }
    }
  };

  // Handle copy share link (future feature)
  const handleCopyShareLink = () => {
    const shareLink = `${window.location.origin}/budgets/${budget?.id}`;
    navigator.clipboard.writeText(shareLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (!budget) return null;

  const allCollaborators = [
    ...(collaboratorsData?.owner ? [collaboratorsData.owner] : []),
    ...(collaboratorsData?.collaborators || [])
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Budget"
      size="md"
    >
      <div className="space-y-6">
        {/* Budget Info */}
        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: budget.color }}
          />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{budget.name}</h3>
            <p className="text-sm text-gray-600">
              {allCollaborators.length} {allCollaborators.length === 1 ? 'person has' : 'people have'} access
            </p>
          </div>
          {isOwner && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyShareLink}
              className="flex items-center space-x-2"
            >
              {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
            </Button>
          )}
        </div>

        {/* Add Collaborator Form */}
        {isOwner && (
          <div className="space-y-4">
            {!showAddForm ? (
              <Button
                onClick={() => setShowAddForm(true)}
                className="w-full flex items-center justify-center space-x-2"
                variant="secondary"
              >
                <UserPlus className="h-4 w-4" />
                <span>Add People</span>
              </Button>
            ) : (
              <form onSubmit={form.handleSubmit(handleAddCollaborator)} className="space-y-4">
                <div className="flex space-x-3">
                  <div className="flex-1">
                    <FormField
                      label="Email Address"
                      error={form.formState.errors.email?.message}
                    >
                      <Input
                        type="email"
                        placeholder="Enter email address"
                        {...form.register('email')}
                      />
                    </FormField>
                  </div>
                  <div className="w-32">
                    <FormField
                      label="Role"
                      error={form.formState.errors.role?.message}
                    >
                      <Select 
                        options={roleOptions} 
                        placeholder="Select role"
                        {...form.register('role')}
                      />
                    </FormField>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="submit"
                    disabled={addCollaboratorMutation.isPending}
                    className="flex-1"
                  >
                    {addCollaboratorMutation.isPending ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Adding...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4" />
                        <span>Send Invitation</span>
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowAddForm(false);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Show error if any */}
        {(addCollaboratorMutation.error || updateRoleMutation.error || removeCollaboratorMutation.error) && (
          <Alert type="error">
            {addCollaboratorMutation.error?.message || 
             updateRoleMutation.error?.message || 
             removeCollaboratorMutation.error?.message}
          </Alert>
        )}

        {/* Collaborators List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>People with access</span>
            </h4>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-3">
              {allCollaborators.map((collaborator) => {
                const RoleIcon = getRoleIcon(collaborator.role);
                const isCurrentUser = collaborator.user.id === user?.id;
                
                return (
                  <div
                    key={collaborator.id || 'owner'}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {collaborator.user.firstName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900">
                            {collaborator.user.firstName}
                            {isCurrentUser && (
                              <span className="text-sm text-gray-500 ml-1">(You)</span>
                            )}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600">{collaborator.user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Badge className={`flex items-center space-x-1 ${getRoleColor(collaborator.role)}`}>
                        <RoleIcon className="h-3 w-3" />
                        <span className="text-xs font-medium">
                          {collaborator.role.charAt(0) + collaborator.role.slice(1).toLowerCase()}
                        </span>
                      </Badge>

                      {/* Only show dropdown for non-owners and if current user is owner */}
                      {isOwner && collaborator.role !== 'OWNER' && !isCurrentUser && (
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActiveDropdown(
                              activeDropdown === collaborator.id ? null : collaborator.id
                            )}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>

                          {activeDropdown === collaborator.id && (
                            <div className="absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                              <div className="py-1">
                                <div className="px-3 py-2 text-sm font-medium text-gray-700 border-b border-gray-100">
                                  Change Role
                                </div>
                                {roleOptions.map(option => (
                                  <button
                                    key={option.value}
                                    onClick={() => handleUpdateRole(collaborator.id, option.value as 'VIEWER' | 'EDITOR')}
                                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                                      collaborator.role === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                    }`}
                                    disabled={updateRoleMutation.isPending}
                                  >
                                    <div className="flex items-center space-x-2">
                                      {React.createElement(getRoleIcon(option.value), { className: "h-4 w-4" })}
                                      <div>
                                        <div className="font-medium">{option.label}</div>
                                        <div className="text-xs text-gray-500">{option.description}</div>
                                      </div>
                                    </div>
                                  </button>
                                ))}
                                <div className="border-t border-gray-100 mt-1">
                                  <button
                                    onClick={() => handleRemoveCollaborator(collaborator.id)}
                                    className="w-full text-left px-3 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center space-x-2"
                                    disabled={removeCollaboratorMutation.isPending}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span>Remove Access</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex space-x-3">
            <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">Permission Levels:</p>
              <ul className="text-blue-800 space-y-1">
                <li><strong>Viewer:</strong> Can view budget data and transactions</li>
                <li><strong>Editor:</strong> Can create, edit, and delete categories and transactions</li>
                <li><strong>Owner:</strong> Full control including sharing and deleting the budget</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};