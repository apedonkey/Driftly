import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LockClosedIcon } from '@heroicons/react/24/outline';

interface ResetPasswordFormInputs {
  password: string;
  confirmPassword: string;
}

const ResetPassword: React.FC = () => {
  const { resetPassword, loading, error } = useAuth();
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordFormInputs>();
  const password = watch('password');

  const onSubmit = async (data: ResetPasswordFormInputs) => {
    try {
      if (!token) {
        throw new Error('Reset token is missing');
      }
      await resetPassword(token, data.password);
      navigate('/login', { state: { message: 'Password reset successful. You can now log in with your new password.' } });
    } catch (err) {
      // Error is handled in the AuthContext
      console.error('Reset password error:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-secondary-bg p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Enter your new password below
          </p>
        </div>
        
        {error && (
          <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {!token ? (
          <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded relative" role="alert">
            <p className="font-medium">Invalid reset link</p>
            <p className="text-sm mt-2">The password reset link is invalid or has expired. Please request a new password reset link.</p>
            <div className="mt-4">
              <Link to="/forgot-password" className="font-medium text-accent-blue hover:text-blue-400">
                Request new reset link
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters'
                    }
                  })}
                  className="appearance-none rounded-t-md relative block w-full px-3 py-3 pl-10 border border-gray-700 bg-gray-800 placeholder-gray-400 text-white focus:outline-none focus:ring-accent-blue focus:border-accent-blue focus:z-10 sm:text-sm"
                  placeholder="New password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  {...register('confirmPassword', { 
                    required: 'Please confirm your password',
                    validate: value => value === password || 'Passwords do not match'
                  })}
                  className="appearance-none rounded-b-md relative block w-full px-3 py-3 pl-10 border border-gray-700 bg-gray-800 placeholder-gray-400 text-white focus:outline-none focus:ring-accent-blue focus:border-accent-blue focus:z-10 sm:text-sm"
                  placeholder="Confirm new password"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Resetting password...' : 'Reset password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
