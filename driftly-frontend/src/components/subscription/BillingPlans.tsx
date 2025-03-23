import React, {
  useEffect,
  useState,
} from 'react';

import {
  ArrowPathIcon,
  CheckIcon,
  CreditCardIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

import { billingService } from '../../services/billingService';

interface BillingPlansProps {
  currentPlanId?: string;
  onPlanChanged?: () => void;
}

type BillingFrequency = 'month' | 'year';

// Define a custom interface for our component's subscription state
interface SubscriptionState {
  isActive: boolean;
  planId?: string;
  planName?: string;
  billingFrequency?: BillingFrequency;
  price?: number;
  renewalDate?: string;
  status?: string;
}

const BillingPlans: React.FC<BillingPlansProps> = ({ 
  currentPlanId,
  onPlanChanged 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionState | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedFrequency, setSelectedFrequency] = useState<BillingFrequency>('month');
  const [changingPlan, setChangingPlan] = useState(false);
  const [changingFrequency, setChangingFrequency] = useState(false);
  const [showUpgradeConfirm, setShowUpgradeConfirm] = useState(false);

  useEffect(() => {
    fetchBillingPlans();
    fetchSubscriptionDetails();
  }, []);

  const fetchBillingPlans = async () => {
    try {
      setLoading(true);
      const response = await billingService.getBillingPlans();
      setPlans(response);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load billing plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionDetails = async () => {
    try {
      const response = await billingService.getSubscriptionDetails();
      
      // Map the API response to our component's subscription state format
      const subscriptionState: SubscriptionState = {
        isActive: response.isActive,
      };
      
      if (response.subscription) {
        // Use the id property, which is likely to be the plan ID
        subscriptionState.planId = response.subscription.id || '';
        subscriptionState.planName = response.subscription.planType || '';
        subscriptionState.status = response.subscription.status;
        subscriptionState.renewalDate = response.subscription.currentPeriodEnd;
        
        // Try to extract billing frequency from stripeData or default to 'month'
        subscriptionState.billingFrequency = 
          (response.subscription.stripeData?.plan?.interval || 'month') as BillingFrequency;
      }
      
      setCurrentSubscription(subscriptionState);
      
      // Set the selected frequency and plan ID based on the subscription data
      if (subscriptionState.billingFrequency) {
        setSelectedFrequency(subscriptionState.billingFrequency);
      }
      
      if (subscriptionState.planId) {
        setSelectedPlanId(subscriptionState.planId);
      }
    } catch (err: any) {
      console.error('Failed to load subscription details', err);
    }
  };

  const handleFrequencyChange = async (frequency: BillingFrequency) => {
    if (!currentSubscription || currentSubscription.billingFrequency === frequency) {
      return;
    }

    try {
      setChangingFrequency(true);
      await billingService.changeBillingFrequency(frequency);
      setSelectedFrequency(frequency);
      await fetchSubscriptionDetails();
      if (onPlanChanged) {
        onPlanChanged();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to change billing frequency');
    } finally {
      setChangingFrequency(false);
    }
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
    if (planId !== currentSubscription?.planId) {
      setShowUpgradeConfirm(true);
    }
  };

  const handlePlanChange = async () => {
    if (!selectedPlanId || selectedPlanId === currentSubscription?.planId) {
      setShowUpgradeConfirm(false);
      return;
    }

    try {
      setChangingPlan(true);
      await billingService.changePlan(selectedPlanId);
      setShowUpgradeConfirm(false);
      await fetchSubscriptionDetails();
      if (onPlanChanged) {
        onPlanChanged();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to change plan');
    } finally {
      setChangingPlan(false);
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
          <h3 className="text-lg font-medium">Error Loading Plans</h3>
        </div>
        <p className="text-gray-400 mb-4">{error}</p>
        <button
          onClick={fetchBillingPlans}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue"
        >
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-secondary-bg rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-700">
        <h3 className="text-lg font-medium text-white">Billing Plans</h3>
      </div>
      
      <div className="p-6">
        {/* Billing Frequency Toggle */}
        <div className="mb-8">
          <div className="flex justify-center">
            <div className="relative bg-gray-800 rounded-lg inline-flex p-1">
              <button
                onClick={() => handleFrequencyChange('month')}
                disabled={changingFrequency}
                className={`relative py-2 px-6 text-sm font-medium rounded-md transition-all duration-200 ${
                  selectedFrequency === 'month'
                    ? 'text-white bg-accent-blue shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => handleFrequencyChange('year')}
                disabled={changingFrequency}
                className={`relative py-2 px-6 text-sm font-medium rounded-md transition-all duration-200 ${
                  selectedFrequency === 'year'
                    ? 'text-white bg-accent-blue shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {changingFrequency ? (
                  <span className="flex items-center">
                    <ArrowPathIcon className="h-4 w-4 mr-1 animate-spin" />
                    Yearly
                  </span>
                ) : (
                  'Yearly (Save 15%)'
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Plans Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {plans.map((plan) => {
            const isCurrentPlan = currentSubscription?.planId === plan.id;
            const isSelected = selectedPlanId === plan.id;
            const price = selectedFrequency === 'month' ? plan.monthlyPrice : plan.yearlyPrice;
            
            return (
              <div
                key={plan.id}
                className={`border rounded-lg overflow-hidden transition-all duration-200 ${
                  isSelected
                    ? 'border-accent-blue shadow-lg shadow-accent-blue/20'
                    : 'border-gray-700 hover:border-gray-500'
                }`}
              >
                {plan.popular && (
                  <div className="bg-accent-blue text-white py-1 px-4 text-xs font-medium text-center">
                    MOST POPULAR
                  </div>
                )}
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-3xl font-bold text-white">${price}</span>
                    <span className="ml-1 text-gray-400">/{selectedFrequency}</span>
                  </div>
                  
                  <p className="mt-2 text-sm text-gray-400">{plan.description}</p>
                  
                  <ul className="mt-6 space-y-4">
                    {plan.features.map((feature: string, index: number) => (
                      <li key={index} className="flex">
                        <CheckIcon className="h-5 w-5 text-green-400 shrink-0 mr-2" />
                        <span className="text-sm text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-8">
                    {isCurrentPlan ? (
                      <button
                        disabled
                        className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 cursor-not-allowed"
                      >
                        Current Plan
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePlanSelect(plan.id)}
                        className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue"
                      >
                        {plan.price > (currentSubscription?.price || 0) ? 'Upgrade' : 'Downgrade'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Plan Change Confirmation Modal */}
      {showUpgradeConfirm && selectedPlanId && (
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
                    <CreditCardIcon className="h-6 w-6 text-blue-300" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-white">
                      Change Subscription Plan
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-400">
                        You're about to change your subscription plan. Your billing will be adjusted accordingly and will take effect immediately. Do you want to continue?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  disabled={changingPlan}
                  onClick={handlePlanChange}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-accent-blue text-base font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {changingPlan ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : 'Confirm Change'}
                </button>
                <button
                  type="button"
                  disabled={changingPlan}
                  onClick={() => setShowUpgradeConfirm(false)}
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

export default BillingPlans; 