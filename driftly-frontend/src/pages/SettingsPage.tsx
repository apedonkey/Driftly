import React from 'react';

import { Link } from 'react-router-dom';

import {
  Cog6ToothIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

import Navigation from '../components/Navigation';

// Mock user data
const mockUser = {
  name: 'John Doe',
  email: 'john@example.com',
  subscriptionPlan: 'Professional',
  subscriptionStatus: 'active',
  company: 'Acme Inc.',
  role: 'Owner'
};

const settingCategories = [
  {
    id: 'account',
    name: 'Account',
    icon: UserIcon,
    settings: [
      {
        id: 'profile',
        name: 'Profile',
        description: 'Manage your account information',
        href: '/settings/profile',
      },
      {
        id: 'security',
        name: 'Security',
        description: 'Update your password and security settings',
        href: '/settings/security',
      },
      {
        id: 'team',
        name: 'Team Members',
        description: 'Manage team members and permissions',
        href: '/settings/team',
      }
    ]
  },
  {
    id: 'billing',
    name: 'Billing & Subscription',
    icon: CreditCardIcon,
    settings: [
      {
        id: 'subscription',
        name: 'Subscription Management',
        description: 'View and manage your subscription plan',
        href: '/settings/subscription',
      },
      {
        id: 'payment-methods',
        name: 'Payment Methods',
        description: 'Manage your payment methods',
        href: '/settings/payment-methods',
      },
      {
        id: 'billing-history',
        name: 'Billing History',
        description: 'View your past invoices and payments',
        href: '/settings/billing-history',
      }
    ]
  },
  {
    id: 'preferences',
    name: 'Preferences',
    icon: Cog6ToothIcon,
    settings: [
      {
        id: 'notifications',
        name: 'Notifications',
        description: 'Configure your notification preferences',
        href: '/settings/notifications',
      },
      {
        id: 'api',
        name: 'API Keys',
        description: 'Manage your API keys and integrations',
        href: '/settings/api',
      }
    ]
  }
];

const SettingsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-primary-bg">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        
        {/* Account Overview */}
        <div className="mt-8 bg-secondary-bg rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-lg font-medium text-white">Account Overview</h2>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-8">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-400">Account Information</h3>
                <dl className="mt-4 space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-400">Name</dt>
                    <dd className="text-sm text-white">{mockUser.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-400">Email</dt>
                    <dd className="text-sm text-white">{mockUser.email}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-400">Company</dt>
                    <dd className="text-sm text-white">{mockUser.company}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-400">Role</dt>
                    <dd className="text-sm text-white">{mockUser.role}</dd>
                  </div>
                </dl>
                
                <div className="mt-6">
                  <Link
                    to="/settings/profile"
                    className="text-sm text-accent-blue hover:text-blue-400 font-medium"
                  >
                    Edit profile
                  </Link>
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-400">Subscription</h3>
                <dl className="mt-4 space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-400">Plan</dt>
                    <dd className="text-sm text-white">{mockUser.subscriptionPlan}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-400">Status</dt>
                    <dd className="text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-300">
                        Active
                      </span>
                    </dd>
                  </div>
                </dl>
                
                <div className="mt-6">
                  <Link
                    to="/settings/subscription"
                    className="text-sm text-accent-blue hover:text-blue-400 font-medium"
                  >
                    Manage subscription
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Settings Categories */}
        <div className="mt-8 space-y-8">
          {settingCategories.map((category) => (
            <div key={category.id} className="bg-secondary-bg rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-lg font-medium text-white flex items-center">
                  <category.icon className="h-5 w-5 mr-2 text-gray-400" />
                  {category.name}
                </h2>
              </div>
              
              <div className="p-6">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {category.settings.map((setting) => (
                    <Link
                      key={setting.id}
                      to={setting.href}
                      className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors"
                    >
                      <h3 className="text-md font-medium text-white">{setting.name}</h3>
                      <p className="mt-1 text-sm text-gray-400">{setting.description}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Danger Zone */}
        <div className="mt-8 bg-secondary-bg rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-lg font-medium text-white flex items-center">
              <ShieldCheckIcon className="h-5 w-5 mr-2 text-red-400" />
              Danger Zone
            </h2>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col space-y-6">
              <div>
                <h3 className="text-md font-medium text-white">Delete Account</h3>
                <p className="mt-1 text-sm text-gray-400">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <button
                  className="mt-3 inline-flex items-center px-4 py-2 border border-red-600 rounded-md text-sm font-medium text-red-400 hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-900"
                >
                  Delete account
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage; 