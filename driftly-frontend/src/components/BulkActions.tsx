import React from 'react';

import { TrashIcon } from '@heroicons/react/24/outline';

interface BulkActionsProps {
  selectedCount: number;
  onBulkDelete: () => void;
}

export const BulkActions: React.FC<BulkActionsProps> = ({ selectedCount, onBulkDelete }) => {
  return (
    <div className='bg-gray-800 p-4 mb-6 rounded-lg flex items-center justify-between'>
      <div className='text-white'>
        <span className='font-medium'>{selectedCount}</span> contacts selected
      </div>
      <div>
        <button
          onClick={onBulkDelete}
          className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
        >
          <TrashIcon className='h-4 w-4 mr-2' />
          Delete Selected
        </button>
      </div>
    </div>
  );
}; 