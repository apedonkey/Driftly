import React from 'react';

import {
  ArrowPathIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

// This is an example file showing how to implement advanced contact import functionality
// to integrate with the ContactManager page

interface ImportStats {
  total: number;
  successful: number;
  failed: number;
  duplicates: number;
}

interface ImportError {
  row: number;
  email: string;
  error: string;
}

export const ContactImportExample: React.FC = () => {
  // State variables to add to ContactManager.tsx
  const [importing, setImporting] = React.useState(false);
  const [importStats, setImportStats] = React.useState<ImportStats | null>(null);
  const [importErrors, setImportErrors] = React.useState<ImportError[]>([]);
  const [showImportDetails, setShowImportDetails] = React.useState(false);
  const [mappedColumns, setMappedColumns] = React.useState<Record<string, string>>({});
  const [previewData, setPreviewData] = React.useState<string[][]>([]);
  const [csvHeaders, setCsvHeaders] = React.useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Function to handle file selection - add to ContactManager.tsx
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setImporting(true);
      
      // Read the file and parse CSV
      const text = await readFileAsText(file);
      const { headers, data } = parseCSV(text);
      
      // Set the CSV headers and a preview of the data
      setCsvHeaders(headers);
      setPreviewData(data.slice(0, 5)); // Preview first 5 rows
      
      // Initialize column mapping with best guesses
      const initialMapping: Record<string, string> = {};
      headers.forEach(header => {
        const lowerHeader = header.toLowerCase();
        if (lowerHeader.includes('email')) {
          initialMapping[header] = 'email';
        } else if (lowerHeader.includes('first') || lowerHeader === 'fname') {
          initialMapping[header] = 'firstName';
        } else if (lowerHeader.includes('last') || lowerHeader === 'lname') {
          initialMapping[header] = 'lastName';
        } else if (lowerHeader.includes('phone')) {
          initialMapping[header] = 'phone';
        } else if (lowerHeader.includes('tag')) {
          initialMapping[header] = 'tags';
        }
      });
      
      setMappedColumns(initialMapping);
      setShowImportDetails(true);
      setImporting(false);
    } catch (err) {
      console.error('Error reading CSV file:', err);
      setImporting(false);
      // setError('Failed to read CSV file. Please ensure it is a valid CSV.');
    }
  };

  // Function to handle importing contacts - add to ContactManager.tsx
  const handleImportContacts = async () => {
    // Make sure we have at least the email column mapped
    if (!Object.values(mappedColumns).includes('email')) {
      // setError('You must map a column to Email Address');
      return;
    }
    
    try {
      setImporting(true);
      
      // In a real implementation, you would:
      // 1. Convert the CSV data to contacts based on the column mapping
      // 2. Call an API to import the contacts
      // 3. Handle success/failure for each row
      
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate import results
      const mockStats: ImportStats = {
        total: previewData.length + 20, // Simulating more rows than preview
        successful: previewData.length + 15,
        failed: 3,
        duplicates: 2
      };
      
      const mockErrors: ImportError[] = [
        { row: 8, email: 'invalid@', error: 'Invalid email format' },
        { row: 12, email: 'missing@domain', error: 'Invalid email format' },
        { row: 17, email: 'test@example.com', error: 'Email already exists' }
      ];
      
      setImportStats(mockStats);
      setImportErrors(mockErrors);
      setImporting(false);
      
      // After successful import, you would refresh the contacts list
      // fetchContacts();
    } catch (err) {
      console.error('Error importing contacts:', err);
      setImporting(false);
      // setError('Failed to import contacts. Please try again later.');
    }
  };

  // Helper function to read file as text
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file as text'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  };

  // Helper function to parse CSV
  const parseCSV = (text: string): { headers: string[], data: string[][] } => {
    // Simple CSV parser - in a real app, you might use a more robust library
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const data = lines.slice(1)
      .filter(line => line.trim() !== '')
      .map(line => line.split(',').map(cell => cell.trim()));
    
    return { headers, data };
  };

  // Render a column mapping dropdown - add to ContactManager.tsx
  const ColumnMappingDropdown = ({ header }: { header: string }) => (
    <div className="flex items-center mb-4">
      <div className="w-1/3 font-medium text-white">{header}</div>
      <div className="w-2/3">
        <select
          value={mappedColumns[header] || ''}
          onChange={(e) => setMappedColumns({...mappedColumns, [header]: e.target.value})}
          className="block w-full px-3 py-2 border border-gray-700 bg-gray-800 rounded-md shadow-sm text-white focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
        >
          <option value="">-- Don't import --</option>
          <option value="email">Email Address</option>
          <option value="firstName">First Name</option>
          <option value="lastName">Last Name</option>
          <option value="phone">Phone Number</option>
          <option value="tags">Tags</option>
        </select>
      </div>
    </div>
  );

  // Render import details section - add to ContactManager.tsx
  const ImportDetailsSection = () => (
    <div className="mt-6 bg-secondary-bg rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-medium text-white">Import Contacts</h2>
      </div>
      <div className="p-4">
        {!importStats ? (
          <>
            <h3 className="text-md font-medium text-white mb-4">Map CSV Columns</h3>
            {csvHeaders.map(header => (
              <ColumnMappingDropdown key={header} header={header} />
            ))}
            
            <h3 className="text-md font-medium text-white mb-2 mt-6">Preview</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    {csvHeaders.map(header => (
                      <th key={header} className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        {header}
                        {mappedColumns[header] && (
                          <span className="block text-gray-500">→ {mappedColumns[header]}</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-secondary-bg divide-y divide-gray-700">
                  {previewData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowImportDetails(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-white hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportContacts}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue"
              >
                Import Contacts
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center mb-6">
              <CheckCircleIcon className="h-8 w-8 text-green-400 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-white">Import Complete</h3>
                <p className="text-gray-400">
                  Successfully imported {importStats.successful} out of {importStats.total} contacts
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-xl font-semibold text-white">{importStats.total}</div>
                <div className="text-sm text-gray-400">Total contacts</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-xl font-semibold text-green-400">{importStats.successful}</div>
                <div className="text-sm text-gray-400">Successfully imported</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-xl font-semibold text-yellow-400">{importStats.duplicates}</div>
                <div className="text-sm text-gray-400">Duplicates skipped</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="text-xl font-semibold text-red-400">{importStats.failed}</div>
                <div className="text-sm text-gray-400">Failed to import</div>
              </div>
            </div>
            
            {importErrors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-md font-medium text-white mb-2">Import Errors</h3>
                <div className="bg-gray-800 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Row
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Error
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {importErrors.map((error, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                            {error.row}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                            {error.email}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-red-400">
                            {error.error}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowImportDetails(false);
                  setImportStats(null);
                  setImportErrors([]);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue"
              >
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // In the actual ContactManager component, you would:
  return (
    <div>
      {/* 1. Replace the existing import button with this enhanced version */}
      <div className="relative">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="sr-only"
          accept=".csv"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue disabled:opacity-50"
        >
          {importing ? (
            <>
              <ArrowPathIcon className="h-5 w-5 mr-1 animate-spin" />
              Processing...
            </>
          ) : (
            'Import CSV'
          )}
        </button>
      </div>

      {/* 2. Show the import details when a file is selected */}
      {showImportDetails && <ImportDetailsSection />}
    </div>
  );
};

/**
 * Integration Instructions for ContactManager.tsx:
 * 
 * 1. Add imports:
 *    - Import additional icons from '@heroicons/react/24/outline'
 * 
 * 2. Add new state variables:
 *    - const [importStats, setImportStats] = React.useState<ImportStats | null>(null);
 *    - const [importErrors, setImportErrors] = React.useState<ImportError[]>([]);
 *    - const [showImportDetails, setShowImportDetails] = React.useState(false);
 *    - const [mappedColumns, setMappedColumns] = React.useState<Record<string, string>>({});
 *    - const [previewData, setPreviewData] = React.useState<string[][]>([]);
 *    - const [csvHeaders, setCsvHeaders] = React.useState<string[]>([]);
 * 
 * 3. Replace the simple handleImportContacts function with the enhanced version above
 * 
 * 4. Add the helper functions (readFileAsText, parseCSV) and component renderers 
 *    (ColumnMappingDropdown, ImportDetailsSection)
 * 
 * 5. Update the import button in the UI to use handleFileSelect instead of directly starting import
 * 
 * 6. Add the ImportDetailsSection component to show when showImportDetails is true
 */ 