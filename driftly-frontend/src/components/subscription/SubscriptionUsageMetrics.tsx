import React, {
  useEffect,
  useState,
} from 'react';

import {
  ArrowPathIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

import { billingService } from '../../services/billingService';

interface SubscriptionMetricsProps {
  onMetricsUpdated?: () => void;
}

const SubscriptionUsageMetrics: React.FC<SubscriptionMetricsProps> = ({ onMetricsUpdated }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [newFlowCount, setNewFlowCount] = useState<number>(0);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await billingService.getSubscriptionMetrics();
      setMetrics(response);
      if (response.metrics) {
        setNewFlowCount(response.metrics.flowCount);
      }
      setError(null);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load subscription metrics');
      setLoading(false);
    }
  };

  const handleUpdateSubscription = async () => {
    try {
      setUpdateLoading(true);
      await billingService.updateSubscriptionQuantity(newFlowCount);
      setShowUpdateConfirm(false);
      await fetchMetrics();
      if (onMetricsUpdated) {
        onMetricsUpdated();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update subscription');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleShowUpdateConfirm = () => {
    if (newFlowCount !== metrics.metrics.flowCount) {
      setShowUpdateConfirm(true);
    }
  };

  if (loading) {
    return (
      <div className="bg-secondary-bg rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="h-24 bg-gray-700 rounded mb-4"></div>
        <div className="h-12 bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-secondary-bg rounded-lg shadow-md p-6">
        <div className="flex items-center text-red-400 mb-4">
          <ExclamationCircleIcon className="h-6 w-6 mr-2" />
          <h3 className="text-lg font-medium">Error Loading Metrics</h3>
        </div>
        <p className="text-gray-400 mb-4">{error}</p>
        <button
          onClick={fetchMetrics}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue"
        >
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Retry
        </button>
      </div>
    );
  }

  if (!metrics.isActive || !metrics.metrics) {
    return (
      <div className="bg-secondary-bg rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <InformationCircleIcon className="h-6 w-6 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-white">No Active Subscription</h3>
        </div>
        <p className="text-gray-400 mb-4">
          You don't have an active subscription. Upgrade your plan to access advanced features.
        </p>
      </div>
    );
  }

  const { flowCount, flowLimit, daysRemaining, renewalDate, planType } = metrics.metrics;
  const flowUsagePercentage = (flowCount / flowLimit) * 100;

  return (
    <div className="bg-secondary-bg rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-700">
        <h3 className="text-lg font-medium text-white">Subscription Usage</h3>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Flow Usage */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400">Active Flows</h4>
            <div className="mt-2 flex items-center justify-between">
              <div>
                <span className="text-2xl font-semibold text-white">{flowCount}</span>
                <span className="ml-1 text-sm text-gray-400">/ {flowLimit}</span>
              </div>
              <div className="text-sm">
                {flowUsagePercentage >= 90 ? (
                  <span className="text-red-400">
                    {flowUsagePercentage.toFixed(0)}% Used
                  </span>
                ) : (
                  <span className="text-green-400">
                    {flowUsagePercentage.toFixed(0)}% Used
                  </span>
                )}
              </div>
            </div>
            <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  flowUsagePercentage >= 90 ? 'bg-red-500' : 'bg-accent-blue'
                }`}
                style={{ width: `${Math.min(100, flowUsagePercentage)}%` }}
              ></div>
            </div>
            
            {flowCount < flowLimit && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Adjust Active Flows
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="1"
                    max={flowLimit}
                    value={newFlowCount}
                    onChange={(e) => setNewFlowCount(Math.min(flowLimit, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="max-w-[100px] rounded-md border-gray-700 bg-gray-900 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <button
                    onClick={handleShowUpdateConfirm}
                    disabled={newFlowCount === flowCount}
                    className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-accent-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    Update
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  Your subscription will be updated to reflect this change.
                </p>
              </div>
            )}
          </div>
          
          {/* Billing Cycle */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400">Current Billing Cycle</h4>
            <div className="mt-2">
              <p className="text-lg font-medium text-white">
                {daysRemaining} days remaining
              </p>
              <p className="text-sm text-gray-400">
                Renews on {new Date(renewalDate).toLocaleDateString()}
              </p>
            </div>
            <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full" 
                style={{ width: `${Math.min(100, 100 - (daysRemaining / 30) * 100)}%` }}
              ></div>
            </div>
          </div>
          
          {/* Plan Details */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400">Current Plan</h4>
            <p className="mt-2 text-lg font-medium text-white capitalize">
              {planType} Plan
            </p>
            <div className="mt-2">
              <a 
                href="/settings/subscription" 
                className="text-accent-blue hover:text-blue-400 text-sm font-medium"
              >
                View plan details
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Update Confirmation Modal */}
      {showUpdateConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>
            
            <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-900/30 sm:mx-0 sm:h-10 sm:w-10">
                    <InformationCircleIcon className="h-6 w-6 text-blue-300" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-white">
                      Update Subscription
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-400">
                        You're about to update your subscription from {flowCount} to {newFlowCount} active flows. 
                        Your billing will be adjusted accordingly. Do you want to continue?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  disabled={updateLoading}
                  onClick={handleUpdateSubscription}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-accent-blue text-base font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {updateLoading ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : 'Confirm Update'}
                </button>
                <button
                  type="button"
                  disabled={updateLoading}
                  onClick={() => setShowUpdateConfirm(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-gray-800 text-base font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionUsageMetrics; 