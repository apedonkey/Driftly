import React, { useState } from 'react';

import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface ContactExportProps {
  onExport: (format: 'csv' | 'json' | 'excel') => void;
  isExporting: boolean;
}

export const ContactExport: React.FC<ContactExportProps> = ({
  onExport,
  isExporting,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'json' | 'excel'>('csv');

  const handleExport = () => {
    onExport(selectedFormat);
  };

  return (
    <div className="flex items-center space-x-4">
      <div>
        <label htmlFor="exportFormat" className="sr-only">
          Export Format
        </label>
        <select
          id="exportFormat"
          value={selectedFormat}
          onChange={(e) => setSelectedFormat(e.target.value as any)}
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-700 bg-gray-800 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm rounded-md text-white"
          disabled={isExporting}
        >
          <option value="csv">CSV</option>
          <option value="json">JSON</option>
          <option value="excel">Excel</option>
        </select>
      </div>
      <button
        type="button"
        onClick={handleExport}
        disabled={isExporting}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent-blue hover:bg-accent-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue disabled:opacity-50"
      >
        {isExporting ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Exporting...
          </>
        ) : (
          <>
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export
          </>
        )}
      </button>
    </div>
  );
}; 