import React from 'react';

import { Link } from 'react-router-dom';

import {
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

import Navigation from '../components/Navigation';

// Mock data for pricing plans
const pricingPlans = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Everything you need to get started with email marketing',
    price: 29,
    frequency: 'month',
    features: [
      '1,000 contacts',
      '10,000 emails per month',
      'Basic email templates',
      'Contact management',
      'Basic automation',
      'Email analytics',
    ],
    notIncluded: [
      'Custom branding',
      'Advanced segmentation',
      'A/B testing',
      'API access',
      'Dedicated support',
    ],
    cta: 'Start Basic',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Professional',
    description: 'Advanced features for growing businesses',
    price: 79,
    frequency: 'month',
    features: [
      '5,000 contacts',
      '50,000 emails per month',
      'Advanced email templates',
      'Contact management',
      'Advanced automation',
      'Detailed analytics',
      'Custom branding',
      'Advanced segmentation',
      'A/B testing',
    ],
    notIncluded: [
      'API access',
      'Dedicated support',
    ],
    cta: 'Start Professional',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Custom solutions for large organizations',
    price: 249,
    frequency: 'month',
    features: [
      '25,000 contacts',
      'Unlimited emails',
      'Premium email templates',
      'Contact management',
      'Advanced automation',
      'Advanced analytics & reporting',
      'Custom branding',
      'Advanced segmentation',
      'A/B testing',
      'API access',
      'Dedicated support',
      'Custom integrations',
    ],
    notIncluded: [],
    cta: 'Contact Sales',
    popular: false,
  },
];

const Pricing: React.FC = () => {
  const [billingFrequency, setBillingFrequency] = React.useState<'month' | 'year'>('month');
  
  const getAdjustedPrice = (basePrice: number) => {
    if (billingFrequency === 'year') {
      // 20% discount for annual billing
      return Math.round(basePrice * 12 * 0.8);
    }
    return basePrice;
  };

  return (
    <div className="min-h-screen bg-primary-bg">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">Simple, transparent pricing</h1>
          <p className="mt-4 text-xl text-gray-400 max-w-3xl mx-auto">
            Choose the plan that's right for you and start growing your business with Driftly's powerful email marketing tools.
          </p>
          
          {/* Billing frequency toggle */}
          <div className="mt-12 flex justify-center">
            <div className="relative bg-gray-800 rounded-lg p-1 flex">
              <button
                onClick={() => setBillingFrequency('month')}
                className={`${
                  billingFrequency === 'month' 
                    ? 'bg-accent-blue text-white' 
                    : 'text-gray-300 hover:text-white'
                } relative w-32 py-2 text-sm font-medium rounded-md focus:outline-none transition-colors`}
              >
                Monthly billing
              </button>
              <button
                onClick={() => setBillingFrequency('year')}
                className={`${
                  billingFrequency === 'year' 
                    ? 'bg-accent-blue text-white' 
                    : 'text-gray-300 hover:text-white'
                } relative w-32 py-2 text-sm font-medium rounded-md focus:outline-none transition-colors`}
              >
                Annual billing
                <span className="absolute -top-2 -right-2 px-2 py-0.5 text-xs font-medium rounded-full bg-green-900 text-green-300">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Pricing plans */}
        <div className="mt-16 grid grid-cols-1 gap-y-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
          {pricingPlans.map((plan) => (
            <div 
              key={plan.id} 
              className={`relative bg-secondary-bg rounded-lg shadow-md overflow-hidden border ${
                plan.popular 
                  ? 'border-accent-blue' 
                  : 'border-gray-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 w-full bg-accent-blue text-center py-1.5">
                  <span className="text-sm font-medium text-white">Most popular</span>
                </div>
              )}
              
              <div className={`p-6 ${plan.popular ? 'pt-10' : ''}`}>
                <h2 className="text-2xl font-bold text-white">{plan.name}</h2>
                <p className="mt-1 text-sm text-gray-400">{plan.description}</p>
                
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold text-white">
                    ${getAdjustedPrice(plan.price)}
                  </span>
                  <span className="ml-1 text-xl font-medium text-gray-400">
                    /{billingFrequency === 'month' ? 'mo' : 'yr'}
                  </span>
                </div>
                
                <Link 
                  to={plan.id === 'enterprise' ? '/contact-sales' : '/signup'}
                  className="mt-6 block w-full py-3 px-4 rounded-md shadow bg-accent-blue text-white font-medium text-center hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue focus:ring-offset-gray-900"
                >
                  {plan.cta}
                </Link>
              </div>
              
              <div className="px-6 pt-6 pb-8 border-t border-gray-700">
                <h3 className="text-sm font-medium text-white">What's included</h3>
                <ul className="mt-4 space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-400 flex-shrink-0 mr-2" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {plan.notIncluded.length > 0 && (
                  <>
                    <h3 className="mt-8 text-sm font-medium text-white">Not included</h3>
                    <ul className="mt-4 space-y-3">
                      {plan.notIncluded.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <XMarkIcon className="h-5 w-5 text-gray-500 flex-shrink-0 mr-2" />
                          <span className="text-sm text-gray-500">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* FAQ section */}
        <div className="mt-24">
          <h2 className="text-2xl font-bold text-white text-center">Frequently asked questions</h2>
          
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <div className="bg-secondary-bg rounded-lg p-6">
              <h3 className="text-lg font-medium text-white">How does the billing cycle work?</h3>
              <p className="mt-2 text-base text-gray-400">
                You'll be billed either monthly or annually depending on your preference. You can change your billing frequency at any time from your account settings.
              </p>
            </div>
            
            <div className="bg-secondary-bg rounded-lg p-6">
              <h3 className="text-lg font-medium text-white">Can I change plans later?</h3>
              <p className="mt-2 text-base text-gray-400">
                Yes! You can upgrade or downgrade your plan at any time. If you upgrade, the changes will take effect immediately. If you downgrade, the changes will take effect at the end of your current billing cycle.
              </p>
            </div>
            
            <div className="bg-secondary-bg rounded-lg p-6">
              <h3 className="text-lg font-medium text-white">What happens if I go over my contact limit?</h3>
              <p className="mt-2 text-base text-gray-400">
                If you exceed your plan's contact limit, we'll notify you and provide options to upgrade to a higher tier plan or remove contacts to stay within your current limit.
              </p>
            </div>
            
            <div className="bg-secondary-bg rounded-lg p-6">
              <h3 className="text-lg font-medium text-white">How secure is my payment information?</h3>
              <p className="mt-2 text-base text-gray-400">
                All payment information is securely processed through our payment provider and we never store your full credit card details on our servers. We use industry-standard encryption to protect all data.
              </p>
            </div>
          </div>
        </div>
        
        {/* Contact sales CTA */}
        <div className="mt-24 bg-accent-blue/10 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white">Need a custom solution?</h2>
          <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto">
            Our enterprise plan is flexible and can be tailored to your specific needs. Talk to our sales team to get a custom quote.
          </p>
          <Link
            to="/contact-sales"
            className="mt-6 inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-accent-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue focus:ring-offset-gray-900"
          >
            Contact sales
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Pricing; 