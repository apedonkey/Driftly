import React, {
  useEffect,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

import {
  ArrowPathIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

import BillingHistory from '../components/subscription/BillingHistory';
import BillingPlans from '../components/subscription/BillingPlans';
import PaymentMethodManagement
  from '../components/subscription/PaymentMethodManagement';
import SubscriptionUsageMetrics
  from '../components/subscription/SubscriptionUsageMetrics';
import { billingService } from '../services/billingService';

const tabs = [
  { id: 'overview', name: 'Overview', icon: ChartBarIcon },
  { id: 'plans', name: 'Plans', icon: BuildingOfficeIcon },
  { id: 'payment-methods', name: 'Payment Methods', icon: CreditCardIcon },
  { id: 'history', name: 'Billing History', icon: DocumentTextIcon },
];

const BillingDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchSubscriptionDetails();
  }, [refreshTrigger]);

  const fetchSubscriptionDetails = async () => {
    try {
      setLoading(true);
      const response = await billingService.getSubscriptionDetails();
      setSubscriptionDetails(response);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load subscription details');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-700 rounded-lg"></div>
          <div className="h-64 bg-gray-700 rounded-lg"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-secondary-bg rounded-lg shadow-md p-6">
          <div className="flex items-center text-red-400 mb-4">
            <ExclamationCircleIcon className="h-6 w-6 mr-2" />
            <h3 className="text-lg font-medium">Error Loading Billing Information</h3>
          </div>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Retry
          </button>
        </div>
      );
    }

    switch (currentTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <SubscriptionUsageMetrics onMetricsUpdated={handleRefresh} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Current Plan</h3>
                {subscriptionDetails ? (
                  <div className="bg-secondary-bg rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xl font-semibold text-white capitalize">{subscriptionDetails.planName} Plan</h4>
                        <p className="text-gray-400 mt-1">
                          {subscriptionDetails.status === 'active' ? 'Active' : 'Inactive'} • 
                          Renews {new Date(subscriptionDetails.renewalDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">${subscriptionDetails.amount}<span className="text-sm text-gray-400">/{subscriptionDetails.billingFrequency}</span></p>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex">
                      <button
                        onClick={() => setCurrentTab('plans')}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue"
                      >
                        Change Plan
                      </button>
                      <button
                        onClick={() => navigate('/settings/subscription')}
                        className="ml-3 inline-flex items-center px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-white bg-transparent hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        Manage Subscription
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-secondary-bg rounded-lg shadow-md p-6">
                    <p className="text-gray-400">No active subscription found.</p>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Payment Method</h3>
                <div className="bg-secondary-bg rounded-lg shadow-md p-6">
                  {subscriptionDetails?.paymentMethod ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CreditCardIcon className="h-10 w-10 text-gray-400" />
                        <div className="ml-4">
                          <p className="text-white font-medium capitalize">
                            {subscriptionDetails.paymentMethod.brand} •••• {subscriptionDetails.paymentMethod.last4}
                          </p>
                          <p className="text-sm text-gray-400">
                            Expires {subscriptionDetails.paymentMethod.expMonth}/{subscriptionDetails.paymentMethod.expYear}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setCurrentTab('payment-methods')}
                        className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-white bg-transparent hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-400 mb-4">No payment method on file.</p>
                      <button
                        onClick={() => setCurrentTab('payment-methods')}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue"
                      >
                        Add Payment Method
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Recent Invoices</h3>
              <BillingHistory limit={3} showViewAll={true} />
            </div>
          </div>
        );
        
      case 'plans':
        return <BillingPlans onPlanChanged={handleRefresh} />;
        
      case 'payment-methods':
        return <PaymentMethodManagement onPaymentMethodUpdated={handleRefresh} />;
        
      case 'history':
        return <BillingHistory limit={10} showViewAll={false} />;
        
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Billing & Subscription</h1>
        <p className="mt-2 text-gray-400">Manage your subscription, payment methods, and billing history</p>
      </div>
      
      <div className="mb-6 border-b border-gray-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`
                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                ${currentTab === tab.id
                  ? 'border-accent-blue text-accent-blue'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-400'
                }
              `}
              aria-current={currentTab === tab.id ? 'page' : undefined}
            >
              <tab.icon
                className={`
                  -ml-0.5 mr-2 h-5 w-5
                  ${currentTab === tab.id ? 'text-accent-blue' : 'text-gray-500 group-hover:text-gray-400'}
                `}
                aria-hidden="true"
              />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>
      
      <div className="py-4">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default BillingDashboard; 