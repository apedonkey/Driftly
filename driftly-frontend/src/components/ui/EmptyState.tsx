import React from 'react';

import { InboxIcon } from '@heroicons/react/24/outline';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
}) => {
  return (
    <div className="text-center bg-secondary-bg shadow-sm rounded-lg p-12 border border-gray-700">
      <div className="flex flex-col items-center">
        {icon || (
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-800">
            <InboxIcon className="h-8 w-8 text-gray-400" />
          </div>
        )}
        <h3 className="mt-4 text-lg font-medium text-white">{title}</h3>
        {description && (
          <p className="mt-2 text-sm text-gray-400 max-w-sm mx-auto">
            {description}
          </p>
        )}
        {action && <div className="mt-6">{action}</div>}
      </div>
    </div>
  );
};

export default EmptyState; 