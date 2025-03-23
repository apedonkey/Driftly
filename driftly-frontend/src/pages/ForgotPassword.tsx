import React, { useState } from 'react';

import { Link } from 'react-router-dom';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call
      console.log('Requesting password reset for:', email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful submission
      setIsSubmitted(true);
    } catch (err) {
      setError('Failed to send password reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-primary-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 mx-auto">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Or{' '}
            <Link to="/login" className="font-medium text-accent-blue hover:text-blue-400">
              sign in to your account
            </Link>
          </p>
        </div>
        
        {isSubmitted ? (
          <div className="bg-green-900/30 text-green-300 p-6 rounded-md mt-8">
            <h3 className="text-lg font-medium mb-2">Email sent</h3>
            <p className="text-sm">
              If an account exists with the email <span className="font-medium">{email}</span>, you'll receive a password reset link shortly.
            </p>
            <p className="text-sm mt-4">
              Please check your email and follow the instructions to reset your password.
            </p>
            <div className="mt-6">
              <Link
                to="/login"
                className="text-sm font-medium text-accent-blue hover:text-blue-400"
              >
                Return to login
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-900/50 text-red-300 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-400 mb-1">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-3 bg-gray-800 border border-gray-700 placeholder-gray-500 text-white focus:outline-none focus:ring-accent-blue focus:border-accent-blue focus:z-10 sm:text-sm"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-accent-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue focus:ring-offset-gray-900 disabled:opacity-70"
              >
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                Send reset instructions
              </button>
            </div>
            
            <div className="flex items-center justify-center">
              <div className="text-sm">
                <Link to="/login" className="font-medium text-accent-blue hover:text-blue-400">
                  Back to login
                </Link>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
