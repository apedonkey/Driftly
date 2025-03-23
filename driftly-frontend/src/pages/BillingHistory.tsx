import React from 'react';

import { Link } from 'react-router-dom';

import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

import Navigation from '../components/Navigation';

// Mock invoice data
const mockInvoices: {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  paymentMethod: {
    brand: string;
    last4: string;
  };
}[] = [
  {
    id: 'INV-001',
    date: '2023-08-15',
    description: 'Professional Plan - Monthly',
    amount: 79.00,
    status: 'paid',
    paymentMethod: {
      brand: 'visa',
      last4: '4242'
    }
  },
  {
    id: 'INV-002',
    date: '2023-07-15',
    description: 'Professional Plan - Monthly',
    amount: 79.00,
    status: 'paid',
    paymentMethod: {
      brand: 'visa',
      last4: '4242'
    }
  },
  {
    id: 'INV-003',
    date: '2023-06-15',
    description: 'Basic Plan - Monthly',
    amount: 29.00,
    status: 'paid',
    paymentMethod: {
      brand: 'visa',
      last4: '4242'
    }
  },
  {
    id: 'INV-004',
    date: '2023-05-15',
    description: 'Basic Plan - Monthly',
    amount: 29.00,
    status: 'paid',
    paymentMethod: {
      brand: 'mastercard',
      last4: '8888'
    }
  },
  {
    id: 'INV-005',
    date: '2023-04-15',
    description: 'Basic Plan - Monthly',
    amount: 29.00,
    status: 'paid',
    paymentMethod: {
      brand: 'mastercard',
      last4: '8888'
    }
  }
];

interface Invoice {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  paymentMethod: {
    brand: string;
    last4: string;
  };
}

const BillingHistory: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const [invoices, setInvoices] = React.useState<Invoice[]>(mockInvoices);
  const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice | null>(null);
  const [showInvoiceDetails, setShowInvoiceDetails] = React.useState(false);
  const [filter, setFilter] = React.useState<'all' | 'paid' | 'pending' | 'failed'>('all');
  const [isExporting, setIsExporting] = React.useState(false);
  
  // Filter invoices based on status
  const filteredInvoices = invoices.filter(invoice => 
    filter === 'all' || invoice.status === filter
  );
  
  const handleViewInvoiceDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceDetails(true);
  };
  
  const handleExportInvoices = async () => {
    setIsExporting(true);
    
    try {
      // In a real app, this would call an API to generate a CSV or PDF
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock download success
      const downloadLink = document.createElement('a');
      downloadLink.href = '#';
      downloadLink.download = 'billing_history.csv';
      downloadLink.click();
    } catch (error) {
      console.error('Error exporting invoices:', error);
    } finally {
      setIsExporting(false);
    }
  };
  
  // Format invoice status for display
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-300">
            <CheckCircleIcon className="h-3 w-3 mr-1" />
            Paid
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/30 text-yellow-300">
            <ClockIcon className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/30 text-red-300">
            <XCircleIcon className="h-3 w-3 mr-1" />
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-primary-bg">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/settings" className="text-sm text-gray-400 hover:text-white">
            ← Back to Settings
          </Link>
          
          <h1 className="text-3xl font-bold text-white mt-4">Billing History</h1>
          <p className="mt-1 text-gray-400">View and download your billing history and invoices</p>
        </div>
        
        {/* Billing History */}
        <div className="bg-secondary-bg rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-medium text-white">Invoices</h2>
            
            <div className="flex items-center space-x-3">
              <div className="relative z-10 inline-flex shadow-sm rounded-md">
                <button
                  type="button"
                  onClick={() => setFilter('all')}
                  className={`relative inline-flex items-center px-3 py-2 rounded-l-md border ${
                    filter === 'all' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-gray-700 text-gray-400 hover:text-white'
                  } text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-accent-blue focus:border-accent-blue`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('paid')}
                  className={`relative inline-flex items-center px-3 py-2 border-t border-b ${
                    filter === 'paid' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-gray-700 text-gray-400 hover:text-white'
                  } text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-accent-blue focus:border-accent-blue`}
                >
                  Paid
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('pending')}
                  className={`relative inline-flex items-center px-3 py-2 border-t border-b ${
                    filter === 'pending' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-gray-700 text-gray-400 hover:text-white'
                  } text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-accent-blue focus:border-accent-blue`}
                >
                  Pending
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('failed')}
                  className={`relative inline-flex items-center px-3 py-2 rounded-r-md border ${
                    filter === 'failed' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-gray-700 text-gray-400 hover:text-white'
                  } text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-accent-blue focus:border-accent-blue`}
                >
                  Failed
                </button>
              </div>
              
              <button
                onClick={handleExportInvoices}
                disabled={isExporting || filteredInvoices.length === 0}
                className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                    Export CSV
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {filteredInvoices.length === 0 ? (
              <div className="p-6 text-center">
                <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-500" />
                <p className="mt-2 text-gray-400">No invoices found</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Invoice #
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-secondary-bg divide-y divide-gray-700">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {invoice.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(invoice.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {invoice.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        ${invoice.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusDisplay(invoice.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <button
                          onClick={() => handleViewInvoiceDetails(invoice)}
                          className="text-accent-blue hover:text-blue-400 mr-4"
                        >
                          View
                        </button>
                        <a 
                          href="#" 
                          className="text-accent-blue hover:text-blue-400"
                          onClick={(e) => {
                            e.preventDefault();
                            // In a real app, this would download the PDF
                          }}
                        >
                          Download
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        
        {/* Invoice Details Modal */}
        {showInvoiceDetails && selectedInvoice && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
              </div>
              
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-gray-700 sm:mx-0 sm:h-10 sm:w-10">
                      <DocumentTextIcon className="h-6 w-6 text-accent-blue" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-white">
                        Invoice {selectedInvoice.id}
                      </h3>
                      <div className="mt-4 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Date:</span>
                          <span className="text-sm text-white">
                            {new Date(selectedInvoice.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Description:</span>
                          <span className="text-sm text-white">{selectedInvoice.description}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Amount:</span>
                          <span className="text-sm text-white">${selectedInvoice.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Status:</span>
                          <span className="text-sm">{getStatusDisplay(selectedInvoice.status)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-400">Payment Method:</span>
                          <span className="text-sm text-white capitalize">
                            {selectedInvoice.paymentMethod.brand} •••• {selectedInvoice.paymentMethod.last4}
                          </span>
                        </div>
                        <div className="pt-4 border-t border-gray-700">
                          <h4 className="text-sm font-medium text-white mb-2">Invoice Summary</h4>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Subtotal:</span>
                            <span className="text-white">${selectedInvoice.amount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Tax:</span>
                            <span className="text-white">$0.00</span>
                          </div>
                          <div className="flex justify-between text-sm font-medium mt-2">
                            <span className="text-gray-400">Total:</span>
                            <span className="text-white">${selectedInvoice.amount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <a
                    href="#"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-accent-blue text-base font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      // In a real app, this would download the PDF
                    }}
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                    Download PDF
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setShowInvoiceDetails(false);
                      setSelectedInvoice(null);
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-gray-800 text-base font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BillingHistory; 