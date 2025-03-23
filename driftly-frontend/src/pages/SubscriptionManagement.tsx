import React from 'react';

import { Link } from 'react-router-dom';

import {
  ArrowPathIcon,
  ArrowUpIcon,
  CheckIcon,
  CreditCardIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

import Navigation from '../components/Navigation';

// Mock subscription data
const mockSubscription = {
  plan: 'pro',
  planName: 'Professional',
  status: 'active',
  billingFrequency: 'month',
  startDate: '2023-08-15',
  renewalDate: '2023-09-15',
  amount: 79,
  contactLimit: 5000,
  currentContacts: 3254,
  paymentMethod: {
    id: 'pm_123456',
    brand: 'visa',
    last4: '4242',
    expMonth: 12,
    expYear: 2024
  }
};

const SubscriptionManagement: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = React.useState(false);
  const [selectedPlan, setSelectedPlan] = React.useState('');
  const [billingFrequency, setBillingFrequency] = React.useState<'month' | 'year'>(
    mockSubscription.billingFrequency as 'month' | 'year'
  );
  
  const handleChangeBillingFrequency = async () => {
    // This would call the API to update the billing frequency
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setBillingFrequency(billingFrequency === 'month' ? 'year' : 'month');
    } catch (error) {
      console.error('Error changing billing frequency:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpgrade = async (planId: string) => {
    // This would call the API to upgrade the subscription
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Here you would update the subscription state
      setSelectedPlan('');
      setUpgradeDialogOpen(false);
    } catch (error) {
      console.error('Error upgrading subscription:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancelSubscription = async () => {
    // This would call the API to cancel the subscription
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCancelDialogOpen(false);
    } catch (error) {
      console.error('Error canceling subscription:', error);
    } finally {
      setLoading(false);
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
          
          <h1 className="text-3xl font-bold text-white mt-4">Subscription Management</h1>
          <p className="mt-1 text-gray-400">Manage your subscription plan and billing information</p>
        </div>
        
        {/* Current Plan */}
        <div className="bg-secondary-bg rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-lg font-medium text-white">Current Plan</h2>
          </div>
          
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white flex items-center">
                  {mockSubscription.planName}
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-300">
                    Active
                  </span>
                </h3>
                <p className="mt-1 text-gray-400">
                  ${mockSubscription.amount}/{billingFrequency === 'month' ? 'mo' : 'yr'} • Renews on {new Date(mockSubscription.renewalDate).toLocaleDateString()}
                </p>
              </div>
              
              <div>
                <button
                  onClick={() => setUpgradeDialogOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue focus:ring-offset-gray-900"
                >
                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                  Upgrade
                </button>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-400">Contact Limit</h4>
                <div className="mt-2 flex items-center">
                  <span className="text-2xl font-semibold text-white">{mockSubscription.currentContacts.toLocaleString()}</span>
                  <span className="ml-1 text-sm text-gray-400">/ {mockSubscription.contactLimit.toLocaleString()}</span>
                </div>
                <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`bg-accent-blue h-2 rounded-full ${
                      mockSubscription.currentContacts / mockSubscription.contactLimit > 0.9 ? 'bg-red-500' : ''
                    }`}
                    style={{ width: `${Math.min(100, (mockSubscription.currentContacts / mockSubscription.contactLimit) * 100)}%` }}
                  ></div>
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  {mockSubscription.contactLimit - mockSubscription.currentContacts} contacts remaining
                </p>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-400">Billing Frequency</h4>
                <p className="mt-2 text-lg font-medium text-white capitalize">
                  {billingFrequency === 'month' ? 'Monthly' : 'Annual'}
                </p>
                <button
                  onClick={handleChangeBillingFrequency}
                  className="mt-2 text-sm text-accent-blue hover:text-blue-400 font-medium"
                >
                  Switch to {billingFrequency === 'month' ? 'annual' : 'monthly'} billing
                </button>
                {billingFrequency === 'month' && (
                  <p className="mt-1 text-xs text-green-400">
                    Save 20% with annual billing
                  </p>
                )}
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-400">Payment Method</h4>
                <div className="mt-2 flex items-center">
                  <CreditCardIcon className="h-6 w-6 text-gray-300 mr-2" />
                  <span className="text-lg font-medium text-white capitalize">
                    {mockSubscription.paymentMethod.brand} •••• {mockSubscription.paymentMethod.last4}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  Expires {mockSubscription.paymentMethod.expMonth}/{mockSubscription.paymentMethod.expYear}
                </p>
                <Link
                  to="/settings/payment-methods"
                  className="mt-2 text-sm text-accent-blue hover:text-blue-400 font-medium"
                >
                  Manage payment methods
                </Link>
              </div>
            </div>
            
            <div className="mt-8 flex justify-between items-center border-t border-gray-700 pt-6">
              <div>
                <h4 className="text-sm font-medium text-white">Need to cancel?</h4>
                <p className="mt-1 text-sm text-gray-400">
                  Your subscription will remain active until the end of your current billing period.
                </p>
              </div>
              <button
                onClick={() => setCancelDialogOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue focus:ring-offset-gray-900"
              >
                Cancel subscription
              </button>
            </div>
          </div>
        </div>
        
        {/* Billing History */}
        <div className="bg-secondary-bg rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-700">
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
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Invoice
                  </th>
                </tr>
              </thead>
              <tbody className="bg-secondary-bg divide-y divide-gray-700">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    Aug 15, 2023
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    Professional Plan - Monthly
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    $79.00
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-300">
                      Paid
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <a href="#" className="text-accent-blue hover:text-blue-400">
                      Download
                    </a>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    Jul 15, 2023
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    Professional Plan - Monthly
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    $79.00
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-300">
                      Paid
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <a href="#" className="text-accent-blue hover:text-blue-400">
                      Download
                    </a>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    Jun 15, 2023
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    Basic Plan - Monthly
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    $29.00
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-300">
                      Paid
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <a href="#" className="text-accent-blue hover:text-blue-400">
                      Download
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Cancel Subscription Dialog */}
        {cancelDialogOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
              </div>
              
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-900/30 sm:mx-0 sm:h-10 sm:w-10">
                      <ExclamationCircleIcon className="h-6 w-6 text-red-300" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-white">
                        Cancel Subscription
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-400">
                          Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period on {new Date(mockSubscription.renewalDate).toLocaleDateString()}.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={handleCancelSubscription}
                    disabled={loading}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {loading ? (
                      <>
                        <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                        Canceling...
                      </>
                    ) : 'Confirm Cancellation'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCancelDialogOpen(false)}
                    disabled={loading}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-gray-800 text-base font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Keep Subscription
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Upgrade Dialog */}
        {upgradeDialogOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
              </div>
              
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-white">
                        Upgrade Your Plan
                      </h3>
                      <div className="mt-4">
                        <div className="space-y-4">
                          <div 
                            className={`p-4 border rounded-md cursor-pointer ${
                              selectedPlan === 'enterprise' 
                                ? 'border-accent-blue bg-accent-blue/10' 
                                : 'border-gray-700 hover:border-gray-600'
                            }`}
                            onClick={() => setSelectedPlan('enterprise')}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="text-md font-medium text-white">Enterprise Plan</h4>
                                <p className="text-sm text-gray-400 mt-1">25,000 contacts, unlimited emails</p>
                              </div>
                              <div className="flex items-center">
                                <span className="text-lg font-medium text-white mr-2">
                                  $249/{billingFrequency === 'month' ? 'mo' : 'yr'}
                                </span>
                                {selectedPlan === 'enterprise' && (
                                  <CheckIcon className="h-5 w-5 text-accent-blue" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={() => handleUpgrade(selectedPlan)}
                    disabled={loading || !selectedPlan}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-accent-blue text-base font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : 'Upgrade Plan'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpgradeDialogOpen(false)}
                    disabled={loading}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-gray-800 text-base font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
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

export default SubscriptionManagement; 