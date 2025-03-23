import React from 'react';

import { Link } from 'react-router-dom';

import { ArrowLeftIcon } from '@heroicons/react/24/outline';

import Navigation from '../components/Navigation';
import { useAuth } from '../contexts/AuthContext';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState('account');
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error', text: string } | null>(null);

  React.useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Password validation
      if (newPassword && newPassword !== confirmPassword) {
        throw new Error('New passwords do not match');
      }

      if (newPassword && newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters');
      }

      // Success message
      setMessage({
        type: 'success',
        text: 'Settings updated successfully'
      });
      
      // Reset password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to update settings'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-bg">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-gray-400">Manage your account preferences</p>
          </div>
          <div className="flex space-x-4">
            <Link
              to="/login"
              className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="bg-accent-blue text-white hover:bg-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Get started
            </Link>
          </div>
        </div>
        
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-4">
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="mt-1 text-gray-400">Manage your account and application settings</p>
        </div>
        
        <div className="bg-secondary-bg rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-700">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('account')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'account'
                    ? 'border-b-2 border-accent-blue text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Account
              </button>
              <button
                onClick={() => setActiveTab('api')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'api'
                    ? 'border-b-2 border-accent-blue text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                API Integration
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === 'account' ? (
              <div>
                {message && (
                  <div className={`mb-6 px-4 py-3 rounded-md ${
                    message.type === 'success' 
                      ? 'bg-green-900/30 border border-green-500 text-green-300' 
                      : 'bg-red-900/30 border border-red-500 text-red-300'
                  }`}>
                    {message.text}
                  </div>
                )}
                
                <form onSubmit={handleSaveChanges}>
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-medium text-white">Personal Information</h3>
                      <p className="mt-1 text-sm text-gray-400">Update your account information and preferences</p>
                      
                      <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                          <label htmlFor="name" className="block text-sm font-medium text-white">
                            Full Name
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              id="name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="block w-full px-3 py-2 border border-gray-700 bg-gray-800 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                              placeholder="John Doe"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-3">
                          <label htmlFor="email" className="block text-sm font-medium text-white">
                            Email Address
                          </label>
                          <div className="mt-1">
                            <input
                              type="email"
                              id="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="block w-full px-3 py-2 border border-gray-700 bg-gray-800 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                              placeholder="user@example.com"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-white">Change Password</h3>
                      <p className="mt-1 text-sm text-gray-400">Update your password to keep your account secure</p>
                      
                      <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-6">
                          <label htmlFor="current-password" className="block text-sm font-medium text-white">
                            Current Password
                          </label>
                          <div className="mt-1 relative">
                            <input
                              type={showCurrentPassword ? "text" : "password"}
                              id="current-password"
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              className="block w-full px-3 py-2 border border-gray-700 bg-gray-800 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                              placeholder="••••••••"
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                              {showCurrentPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="sm:col-span-3">
                          <label htmlFor="new-password" className="block text-sm font-medium text-white">
                            New Password
                          </label>
                          <div className="mt-1 relative">
                            <input
                              type={showNewPassword ? "text" : "password"}
                              id="new-password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="block w-full px-3 py-2 border border-gray-700 bg-gray-800 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                              placeholder="••••••••"
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                              {showNewPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="sm:col-span-3">
                          <label htmlFor="confirm-password" className="block text-sm font-medium text-white">
                            Confirm New Password
                          </label>
                          <div className="mt-1 relative">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              id="confirm-password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="block w-full px-3 py-2 border border-gray-700 bg-gray-800 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                              placeholder="••••••••"
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-medium text-white">API Integration</h3>
                <p className="mt-1 text-sm text-gray-400">Manage your API keys and integration settings</p>
                
                <div className="mt-6 bg-gray-800 p-4 rounded-md border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-white">API Key</h4>
                      <p className="text-xs text-gray-400 mt-1">Use this key to authenticate API requests</p>
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-1 border border-gray-600 rounded-md text-sm font-medium text-white hover:bg-gray-700"
                    >
                      Generate New Key
                    </button>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center">
                      <input
                        type="text"
                        readOnly
                        value="••••••••••••••••••••••••••••••"
                        className="block w-full px-3 py-2 border border-gray-700 bg-gray-900 rounded-md shadow-sm text-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                      />
                      <button
                        type="button"
                        className="ml-2 inline-flex items-center px-3 py-2 border border-gray-600 rounded-md text-sm font-medium text-white hover:bg-gray-700"
                      >
                        Show
                      </button>
                      <button
                        type="button"
                        className="ml-2 inline-flex items-center px-3 py-2 border border-gray-600 rounded-md text-sm font-medium text-white hover:bg-gray-700"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h4 className="text-sm font-medium text-white">Webhook URL</h4>
                  <p className="text-xs text-gray-400 mt-1">Configure your webhook URL to receive events</p>
                  
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder="https://your-domain.com/webhook"
                      className="block w-full px-3 py-2 border border-gray-700 bg-gray-800 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                    />
                  </div>
                  
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-white">Events to send</h5>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center">
                        <input
                          id="event-email-sent"
                          type="checkbox"
                          className="h-4 w-4 text-accent-blue focus:ring-accent-blue border-gray-700 rounded bg-gray-800"
                        />
                        <label htmlFor="event-email-sent" className="ml-2 block text-sm text-gray-300">
                          Email Sent
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="event-email-opened"
                          type="checkbox"
                          className="h-4 w-4 text-accent-blue focus:ring-accent-blue border-gray-700 rounded bg-gray-800"
                        />
                        <label htmlFor="event-email-opened" className="ml-2 block text-sm text-gray-300">
                          Email Opened
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="event-link-clicked"
                          type="checkbox"
                          className="h-4 w-4 text-accent-blue focus:ring-accent-blue border-gray-700 rounded bg-gray-800"
                        />
                        <label htmlFor="event-link-clicked" className="ml-2 block text-sm text-gray-300">
                          Link Clicked
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="event-flow-completed"
                          type="checkbox"
                          className="h-4 w-4 text-accent-blue focus:ring-accent-blue border-gray-700 rounded bg-gray-800"
                        />
                        <label htmlFor="event-flow-completed" className="ml-2 block text-sm text-gray-300">
                          Flow Completed
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue"
                    >
                      Save Webhook Settings
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
