import React from 'react';

import { Link } from 'react-router-dom';

import {
  ChevronRightIcon,
  CreditCardIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

// Mock subscription data
const mockSubscription = {
  plan: 'Professional',
  status: 'active',
  billingFrequency: 'monthly',
  startDate: 'April 10, 2023',
  renewalDate: 'May 10, 2023',
  amount: 79,
  contacts: {
    limit: 5000,
    current: 2279,
  }
};

// Mock payment methods
const mockPaymentMethods = [
  {
    id: 'pm_1',
    type: 'card',
    isDefault: true,
    brand: 'Visa',
    last4: '4242',
    expMonth: 12,
    expYear: 2024,
  }
];

// Mock recent invoices
const mockInvoices = [
  {
    id: 'inv_001',
    date: 'April 10, 2023',
    description: 'Professional Plan - Monthly',
    amount: 79,
    status: 'paid',
  },
  {
    id: 'inv_002',
    date: 'March 10, 2023',
    description: 'Professional Plan - Monthly',
    amount: 79,
    status: 'paid',
  },
  {
    id: 'inv_003',
    date: 'February 10, 2023',
    description: 'Professional Plan - Monthly',
    amount: 79,
    status: 'paid',
  },
];

const Billing: React.FC = () => {
  return (
    <div className="p-6">
      {/* Header with Sign in and Get started buttons */}
      <div className="mb-12">
        <div className="flex justify-end mb-6">
          <div className="flex space-x-4">
            <Link
              to="/login"
              className="text-gray-300 hover:bg-gray-700 hover:text-white px-4 py-2 rounded-md text-sm font-medium border border-gray-700"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="bg-accent-blue text-white hover:bg-blue-600 px-4 py-2 rounded-md text-sm font-medium shadow-sm"
            >
              Get started
            </Link>
          </div>
        </div>
        
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Billing & Subscription</h1>
          <p className="text-gray-400">Manage your subscription, payment methods, and billing history.</p>
        </header>
      </div>
      
      {/* Main content */}
      <div className="space-y-8">
        {/* Current Subscription */}
        <div className="bg-secondary-bg rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-medium text-white">Current Subscription</h2>
            <Link 
              to="/settings/subscription"
              className="text-accent-blue hover:text-blue-400 text-sm flex items-center"
            >
              Manage
              <ChevronRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between mb-4">
                  <div>
                    <div className="text-sm text-gray-400">Plan</div>
                    <div className="text-white font-medium">{mockSubscription.plan}</div>
                  </div>
                  <div>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      {mockSubscription.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="text-sm text-gray-400">Billing frequency</div>
                  <div className="text-white font-medium capitalize">{mockSubscription.billingFrequency}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-400">Start date</div>
                    <div className="text-white font-medium">{mockSubscription.startDate}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Renewal date</div>
                    <div className="text-white font-medium">{mockSubscription.renewalDate}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="mb-4">
                  <div className="text-sm text-gray-400">Monthly amount</div>
                  <div className="text-white font-medium">${mockSubscription.amount}.00</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-400 mb-2">Contact usage</div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>{mockSubscription.contacts.current} contacts</span>
                    <span>{mockSubscription.contacts.limit} limit</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-accent-blue h-2 rounded-full" 
                      style={{ width: `${(mockSubscription.contacts.current / mockSubscription.contacts.limit) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Payment Methods */}
        <div className="bg-secondary-bg rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-medium text-white">Payment Methods</h2>
            <button className="text-accent-blue hover:text-blue-400 text-sm">
              Add new
            </button>
          </div>
          <div className="p-6">
            {mockPaymentMethods.map(method => (
              <div key={method.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-700 rounded-md mr-4">
                    <CreditCardIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-white">
                        {method.brand} •••• {method.last4}
                      </p>
                      {method.isDefault && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-gray-700 text-gray-300 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      Expires {method.expMonth}/{method.expYear}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="text-gray-400 hover:text-white text-sm">
                    Edit
                  </button>
                  <button className="text-gray-400 hover:text-white text-sm">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Billing History */}
        <div className="bg-secondary-bg rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-medium text-white">Billing History</h2>
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Invoice
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {mockInvoices.map(invoice => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {invoice.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {invoice.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                      ${invoice.amount}.00
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        {invoice.status === 'paid' ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <button className="flex items-center text-accent-blue hover:text-blue-400">
                        <DocumentTextIcon className="h-4 w-4 mr-1" />
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing; 