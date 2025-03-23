import React, {
  useEffect,
  useState,
} from 'react';

import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

import { billingService } from '../../services/billingService';

interface BillingHistoryProps {
  limit?: number;
  showViewAll?: boolean;
}

const statusColors = {
  paid: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800',
};

const BillingHistory: React.FC<BillingHistoryProps> = ({ 
  limit = 5,
  showViewAll = true 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    fetchBillingHistory();
  }, []);

  const fetchBillingHistory = async () => {
    try {
      setLoading(true);
      const response = await billingService.getBillingHistory();
      setInvoices(response.slice(0, limit));
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load billing history');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      setDownloading(invoiceId);
      const invoice = await billingService.getInvoice(invoiceId);
      
      // Create a temporary link to download the PDF
      const blob = new Blob([invoice], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setDownloading(null);
    } catch (err: any) {
      console.error('Failed to download invoice', err);
      setError(err.response?.data?.error || 'Failed to download invoice');
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-secondary-bg rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="h-48 bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-secondary-bg rounded-lg shadow-md p-6">
        <div className="flex items-center text-red-400 mb-4">
          <ExclamationCircleIcon className="h-6 w-6 mr-2" />
          <h3 className="text-lg font-medium">Error Loading Billing History</h3>
        </div>
        <p className="text-gray-400 mb-4">{error}</p>
        <button
          onClick={fetchBillingHistory}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue"
        >
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Retry
        </button>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="bg-secondary-bg rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No billing history</h3>
          <p className="text-gray-400">Your billing history will appear here once you have been billed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-secondary-bg rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-medium text-white">Billing History</h3>
        {showViewAll && invoices.length > 0 && (
          <a 
            href="/settings/billing/history" 
            className="text-accent-blue hover:text-blue-400 text-sm font-medium"
          >
            View all
          </a>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
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
                Invoice
              </th>
            </tr>
          </thead>
          <tbody className="bg-secondary-bg divide-y divide-gray-700">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-800/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {new Date(invoice.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {invoice.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  ${invoice.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[invoice.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleDownloadInvoice(invoice.id)}
                    disabled={downloading === invoice.id}
                    className="text-accent-blue hover:text-blue-400 focus:outline-none"
                  >
                    {downloading === invoice.id ? (
                      <span className="flex items-center">
                        <ArrowPathIcon className="h-4 w-4 mr-1 animate-spin" />
                        Downloading...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                        Download
                      </span>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {showViewAll && invoices.length > 0 && (
        <div className="bg-gray-800/50 px-6 py-4 border-t border-gray-700 sm:hidden">
          <a 
            href="/settings/billing/history" 
            className="block w-full text-center text-accent-blue hover:text-blue-400 text-sm font-medium"
          >
            View all billing history
          </a>
        </div>
      )}
    </div>
  );
};

export default BillingHistory; 