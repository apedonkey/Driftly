import React from 'react';

import { Link } from 'react-router-dom';

import {
  ArrowPathIcon,
  CreditCardIcon,
  PlusCircleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

import Navigation from '../components/Navigation';

// Mock payment methods data
const mockPaymentMethods = [
  {
    id: 'pm_123456',
    type: 'card',
    isDefault: true,
    brand: 'visa',
    last4: '4242',
    expMonth: 12,
    expYear: 2024
  },
  {
    id: 'pm_789012',
    type: 'card',
    isDefault: false,
    brand: 'mastercard',
    last4: '8888',
    expMonth: 8,
    expYear: 2025
  }
];

// Mock payment method validation
const validateCard = (values: any) => {
  const errors: Record<string, string> = {};
  
  if (!values.cardNumber) {
    errors.cardNumber = 'Card number is required';
  } else if (!/^\d{16}$/.test(values.cardNumber.replace(/\s/g, ''))) {
    errors.cardNumber = 'Card number must be 16 digits';
  }
  
  if (!values.cardholderName) {
    errors.cardholderName = 'Cardholder name is required';
  }
  
  if (!values.expiryMonth) {
    errors.expiryMonth = 'Expiry month is required';
  }
  
  if (!values.expiryYear) {
    errors.expiryYear = 'Expiry year is required';
  }
  
  if (!values.cvc) {
    errors.cvc = 'CVC is required';
  } else if (!/^\d{3,4}$/.test(values.cvc)) {
    errors.cvc = 'CVC must be 3 or 4 digits';
  }
  
  return errors;
};

const PaymentMethods: React.FC = () => {
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [paymentMethods, setPaymentMethods] = React.useState(mockPaymentMethods);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedMethodId, setSelectedMethodId] = React.useState('');
  
  // Form state
  const [formValues, setFormValues] = React.useState({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    setAsDefault: false
  });
  
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormValues({
      ...formValues,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateCard(formValues);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setLoading(true);
    
    try {
      // This would call your payment processor API in a real app
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful payment method addition
      const newPaymentMethod = {
        id: `pm_${Date.now()}`,
        type: 'card',
        isDefault: formValues.setAsDefault,
        brand: formValues.cardNumber.startsWith('4') ? 'visa' : 'mastercard',
        last4: formValues.cardNumber.slice(-4),
        expMonth: parseInt(formValues.expiryMonth),
        expYear: parseInt(formValues.expiryYear)
      };
      
      // If new card is default, update other cards
      const updatedMethods = paymentMethods.map(method => ({
        ...method,
        isDefault: formValues.setAsDefault ? false : method.isDefault
      }));
      
      setPaymentMethods([...updatedMethods, newPaymentMethod]);
      
      // Reset form
      setFormValues({
        cardNumber: '',
        cardholderName: '',
        expiryMonth: '',
        expiryYear: '',
        cvc: '',
        setAsDefault: false
      });
      
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding payment method:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSetDefault = async (id: string) => {
    setLoading(true);
    
    try {
      // This would call your payment processor API in a real app
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update payment methods
      const updatedMethods = paymentMethods.map(method => ({
        ...method,
        isDefault: method.id === id
      }));
      
      setPaymentMethods(updatedMethods);
    } catch (error) {
      console.error('Error setting default payment method:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeletePaymentMethod = async () => {
    if (!selectedMethodId) return;
    
    setLoading(true);
    
    try {
      // This would call your payment processor API in a real app
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update payment methods
      const updatedMethods = paymentMethods.filter(method => method.id !== selectedMethodId);
      setPaymentMethods(updatedMethods);
      setDeleteDialogOpen(false);
      setSelectedMethodId('');
    } catch (error) {
      console.error('Error deleting payment method:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const openDeleteDialog = (id: string) => {
    setSelectedMethodId(id);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-primary-bg">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/settings" className="text-sm text-gray-400 hover:text-white">
            ← Back to Settings
          </Link>
          
          <h1 className="text-3xl font-bold text-white mt-4">Payment Methods</h1>
          <p className="mt-1 text-gray-400">Manage your payment methods for billing</p>
        </div>
        
        {/* Payment Methods List */}
        <div className="bg-secondary-bg rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-medium text-white">Your Payment Methods</h2>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue focus:ring-offset-gray-900"
            >
              <PlusCircleIcon className="h-5 w-5 mr-1" />
              Add Payment Method
            </button>
          </div>
          
          <div className="p-6">
            {paymentMethods.length === 0 ? (
              <div className="text-center py-6">
                <CreditCardIcon className="h-12 w-12 mx-auto text-gray-500" />
                <p className="mt-2 text-gray-400">No payment methods added yet</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue focus:ring-offset-gray-900"
                >
                  <PlusCircleIcon className="h-5 w-5 mr-1" />
                  Add Payment Method
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="bg-gray-800 rounded-lg p-4 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="bg-gray-700 rounded-lg p-2 mr-4">
                        <CreditCardIcon className="h-6 w-6 text-gray-300" />
                      </div>
                      <div>
                        <div className="flex items-center">
                          <span className="text-white font-medium capitalize">
                            {method.brand} •••• {method.last4}
                          </span>
                          {method.isDefault && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-300">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">
                          Expires {method.expMonth}/{method.expYear}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {!method.isDefault && (
                        <button
                          onClick={() => handleSetDefault(method.id)}
                          disabled={loading}
                          className="text-sm text-accent-blue hover:text-blue-400"
                        >
                          Set as default
                        </button>
                      )}
                      <button
                        onClick={() => openDeleteDialog(method.id)}
                        disabled={loading || (method.isDefault && paymentMethods.length > 1)}
                        className={`text-sm ${
                          method.isDefault && paymentMethods.length > 1
                            ? 'text-gray-500 cursor-not-allowed'
                            : 'text-red-400 hover:text-red-300'
                        }`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Add Payment Method Form */}
        {showAddForm && (
          <div className="bg-secondary-bg rounded-lg shadow-md overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-lg font-medium text-white">Add Payment Method</h2>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleAddPaymentMethod}>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-6">
                    <label htmlFor="cardholderName" className="block text-sm font-medium text-white">
                      Cardholder Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="cardholderName"
                        name="cardholderName"
                        value={formValues.cardholderName}
                        onChange={handleInputChange}
                        className={`block w-full px-3 py-2 border ${
                          formErrors.cardholderName ? 'border-red-500' : 'border-gray-700'
                        } bg-gray-800 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm`}
                        placeholder="John Doe"
                      />
                      {formErrors.cardholderName && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.cardholderName}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="sm:col-span-6">
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-white">
                      Card Number
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        value={formValues.cardNumber}
                        onChange={handleInputChange}
                        className={`block w-full px-3 py-2 border ${
                          formErrors.cardNumber ? 'border-red-500' : 'border-gray-700'
                        } bg-gray-800 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm`}
                        placeholder="4242 4242 4242 4242"
                      />
                      {formErrors.cardNumber && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.cardNumber}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label htmlFor="expiryMonth" className="block text-sm font-medium text-white">
                      Expiry Month
                    </label>
                    <div className="mt-1">
                      <select
                        id="expiryMonth"
                        name="expiryMonth"
                        value={formValues.expiryMonth}
                        onChange={handleInputChange}
                        className={`block w-full px-3 py-2 border ${
                          formErrors.expiryMonth ? 'border-red-500' : 'border-gray-700'
                        } bg-gray-800 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm`}
                      >
                        <option value="">Month</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                          <option key={month} value={month}>
                            {month.toString().padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                      {formErrors.expiryMonth && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.expiryMonth}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label htmlFor="expiryYear" className="block text-sm font-medium text-white">
                      Expiry Year
                    </label>
                    <div className="mt-1">
                      <select
                        id="expiryYear"
                        name="expiryYear"
                        value={formValues.expiryYear}
                        onChange={handleInputChange}
                        className={`block w-full px-3 py-2 border ${
                          formErrors.expiryYear ? 'border-red-500' : 'border-gray-700'
                        } bg-gray-800 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm`}
                      >
                        <option value="">Year</option>
                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                      {formErrors.expiryYear && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.expiryYear}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label htmlFor="cvc" className="block text-sm font-medium text-white">
                      CVC
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="cvc"
                        name="cvc"
                        value={formValues.cvc}
                        onChange={handleInputChange}
                        className={`block w-full px-3 py-2 border ${
                          formErrors.cvc ? 'border-red-500' : 'border-gray-700'
                        } bg-gray-800 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm`}
                        placeholder="123"
                      />
                      {formErrors.cvc && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.cvc}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="sm:col-span-6">
                    <div className="flex items-center">
                      <input
                        id="setAsDefault"
                        name="setAsDefault"
                        type="checkbox"
                        checked={formValues.setAsDefault}
                        onChange={handleInputChange}
                        className="h-4 w-4 rounded border-gray-700 text-accent-blue focus:ring-accent-blue focus:ring-offset-gray-900"
                      />
                      <label htmlFor="setAsDefault" className="ml-2 text-sm text-gray-300">
                        Set as default payment method
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-white hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue focus:ring-offset-gray-900"
                  >
                    {loading ? (
                      <>
                        <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : 'Add Payment Method'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Security Note */}
        <div className="bg-gray-800 rounded-lg p-4 text-sm text-gray-400">
          <h3 className="font-medium text-white">Payment Security</h3>
          <p className="mt-1">
            Your payment information is securely processed and stored by our payment provider.
            We never store your full card details on our servers.
          </p>
        </div>
        
        {/* Delete Confirmation Dialog */}
        {deleteDialogOpen && (
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
                      <TrashIcon className="h-6 w-6 text-red-300" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-white">
                        Delete Payment Method
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-400">
                          Are you sure you want to delete this payment method? This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={handleDeletePaymentMethod}
                    disabled={loading}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {loading ? (
                      <>
                        <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : 'Delete'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteDialogOpen(false)}
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

export default PaymentMethods; 