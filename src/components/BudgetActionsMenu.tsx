import React, { useRef, useEffect } from 'react';
import { MoreVertical, Copy, Archive, Trash2 } from 'lucide-react';
import { Budget } from '../types';
import { Button } from './ui';

interface BudgetActionsMenuProps {
  budget: Budget;
  isOpen: boolean;
  onToggle: () => void;
  onAction: (action: string) => void;
}

const BudgetActionsMenu: React.FC<BudgetActionsMenuProps> = ({
  budget,
  isOpen,
  onToggle,
  onAction,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        if (isOpen) {
          onToggle();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggle]);

  const menuItems = [
    {
      id: 'duplicate',
      label: 'Duplicate Budget',
      icon: Copy,
      onClick: () => onAction('duplicate'),
      className: 'text-gray-700 hover:bg-gray-100',
    },
    {
      id: 'archive',
      label: budget.isArchived ? 'Unarchive Budget' : 'Archive Budget',
      icon: Archive,
      onClick: () => onAction('archive'),
      className: 'text-gray-700 hover:bg-gray-100',
    },
    {
      id: 'delete',
      label: 'Delete Budget',
      icon: Trash2,
      onClick: () => onAction('delete'),
      className: 'text-red-600 hover:bg-red-50',
      separator: true,
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <Button variant="ghost" size="sm" onClick={onToggle}>
        <MoreVertical className="h-4 w-4" />
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="py-1">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <React.Fragment key={item.id}>
                  {item.separator && index > 0 && (
                    <div className="border-t border-gray-100 my-1"></div>
                  )}
                  <button
                    onClick={item.onClick}
                    className={`flex items-center w-full px-4 py-2 text-sm transition-colors ${item.className}`}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {item.label}
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetActionsMenu;