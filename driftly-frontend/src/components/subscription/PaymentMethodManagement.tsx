import React, {
  useEffect,
  useState,
} from 'react';

import {
  ArrowPathIcon,
  CheckCircleIcon,
  CreditCardIcon,
  ExclamationCircleIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

interface PaymentMethodManagementProps {
  onPaymentMethodUpdated?: () => void;
}

const PaymentMethodManagement: React.FC<PaymentMethodManagementProps> = ({ 
  onPaymentMethodUpdated 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Form state for new payment method
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would fetch from the billingService
      // This is mocked for demonstration purposes
      const mockPaymentMethods = [
        {
          id: 'pm_1234567890',
          brand: 'visa',
          last4: '4242',
          expMonth: 12,
          expYear: 2024,
          isDefault: true,
          holderName: 'John Doe',
        },
        {
          id: 'pm_0987654321',
          brand: 'mastercard',
          last4: '8888',
          expMonth: 10,
          expYear: 2023,
          isDefault: false,
          holderName: 'John Doe',
        }
      ];
      
      setPaymentMethods(mockPaymentMethods);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefaultPaymentMethod = async (paymentMethodId: string) => {
    try {
      setProcessingAction(paymentMethodId);
      // In a real implementation, this would call the billingService
      // await billingService.setDefaultPaymentMethod(paymentMethodId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setPaymentMethods(methods => methods.map(method => ({
        ...method,
        isDefault: method.id === paymentMethodId
      })));
      
      setSuccessMessage('Default payment method updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
      
      if (onPaymentMethodUpdated) {
        onPaymentMethodUpdated();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to set default payment method');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleRemovePaymentMethod = async (paymentMethodId: string) => {
    if (paymentMethods.length === 1) {
      setError('You cannot remove your only payment method');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    try {
      setProcessingAction(`remove_${paymentMethodId}`);
      // In a real implementation, this would call the billingService
      // await billingService.removePaymentMethod(paymentMethodId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setPaymentMethods(methods => methods.filter(method => method.id !== paymentMethodId));
      
      setSuccessMessage('Payment method removed successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
      
      if (onPaymentMethodUpdated) {
        onPaymentMethodUpdated();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to remove payment method');
    } finally {
      setProcessingAction(null);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!cardNumber.trim()) {
      errors.cardNumber = 'Card number is required';
    } else if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
      errors.cardNumber = 'Please enter a valid 16-digit card number';
    }
    
    if (!expiryDate.trim()) {
      errors.expiryDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      errors.expiryDate = 'Please use MM/YY format';
    }
    
    if (!cvc.trim()) {
      errors.cvc = 'CVC is required';
    } else if (!/^\d{3,4}$/.test(cvc)) {
      errors.cvc = 'CVC must be 3 or 4 digits';
    }
    
    if (!cardholderName.trim()) {
      errors.cardholderName = 'Cardholder name is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setProcessingAction('addPayment');
      // In a real implementation, this would call the billingService
      // await billingService.addPaymentMethod({ cardNumber, expiryDate, cvc, cardholderName, isDefault });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update local state with a mock new payment method
      const [month, year] = expiryDate.split('/');
      const newPaymentMethod = {
        id: `pm_new${Date.now()}`,
        brand: 'visa',
        last4: cardNumber.slice(-4),
        expMonth: parseInt(month),
        expYear: parseInt(`20${year}`),
        isDefault: isDefault,
        holderName: cardholderName,
      };
      
      if (isDefault) {
        setPaymentMethods(methods => [
          ...methods.map(method => ({ ...method, isDefault: false })),
          newPaymentMethod
        ]);
      } else {
        setPaymentMethods(methods => [...methods, newPaymentMethod]);
      }
      
      setShowAddPaymentModal(false);
      setSuccessMessage('Payment method added successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Reset form
      setCardNumber('');
      setExpiryDate('');
      setCvc('');
      setCardholderName('');
      setIsDefault(false);
      
      if (onPaymentMethodUpdated) {
        onPaymentMethodUpdated();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add payment method');
    } finally {
      setProcessingAction(null);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };
  
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
  };
  
  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/[^\d]/g, '');
    
    if (value.length <= 2) {
      setExpiryDate(value);
    } else {
      setExpiryDate(`${value.slice(0, 2)}/${value.slice(2, 4)}`);
    }
  };

  const getCardIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return (
          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="4" fill="#1434CB" />
            <path d="M10.83 15.25H8.56L9.88 8.75H12.15L10.83 15.25Z" fill="white" />
            <path d="M16.4 8.91C15.95 8.75 15.13 8.58 14.53 8.58C12.53 8.58 11.21 9.58 11.21 10.91C11.19 11.91 12.15 12.41 12.88 12.75C13.63 13.08 13.85 13.33 13.85 13.66C13.85 14.16 13.21 14.41 12.61 14.41C11.78 14.41 11.33 14.3 10.61 14L10.33 14.83C10.78 15 11.58 15.5 12.58 15.5C14.71 15.5 15.93 14.16 15.93 12.75C15.93 11.66 15.31 11 14.31 10.5C13.66 10.16 13.31 9.91 13.31 9.58C13.31 9.25 13.66 8.91 14.38 8.91C15.01 8.91 15.48 9.08 15.85 9.25L16.4 8.91Z" fill="white" />
            <path d="M17.35 12.58C17.51 12 17.95 11 17.95 11H18C18 11 18.01 11.24 18.15 11.75L18.43 13H17.18L17.35 12.58Z" fill="white" />
            <path d="M19.38 15.25H17.31L17.23 14.8H15.7L15.45 15.25H13.98L15.93 10C16.09 9.5 16.48 8.75 17.13 8.75H18.4L19.38 15.25Z" fill="white" />
            <path d="M7.59 8.83L5.44 13.08C5.34 13.41 5.22 13.5 4.97 13.5C4.74 13.5 4.24 13.41 3.84 13.33L3.75 13.16L3 8.66C3.39 8.58 4.24 8.41 4.84 8.33C5.44 8.25 5.92 8.58 6.04 9.08L6.52 11.58C6.52 11.58 6.69 10.91 6.82 10.58L7.37 8.91C7.4 8.83 7.5 8.75 7.59 8.83Z" fill="white" />
          </svg>
        );
      case 'mastercard':
        return (
          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="4" fill="#F7F7F7" />
            <path d="M15.32 6H8.68C7.14 6 5.58 6.67 4.87 8.10L12 15.23L19.13 8.10C18.42 6.67 16.86 6 15.32 6Z" fill="#EB001B" />
            <path d="M12 15.23L4.87 8.1C4.16 9.53 4.16 11.47 4.87 12.9L12 20.03L19.13 12.9C19.84 11.47 19.84 9.53 19.13 8.1L12 15.23Z" fill="#F79E1B" />
            <path d="M19.13 12.9C19.84 11.47 19.84 9.53 19.13 8.1C18.42 6.67 16.86 6 15.32 6H12V20.03L19.13 12.9Z" fill="#FF5F00" />
          </svg>
        );
      case 'amex':
        return (
          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="4" fill="#1F72CD" />
            <path d="M3.5 9L5.5 14H7L9 9H7.5L6.25 12.5L5 9H3.5Z" fill="white" />
            <path d="M9.5 9L10 10H12V9H9.5Z" fill="white" />
            <path d="M9.5 14L10 13H12V14H9.5Z" fill="white" />
            <path d="M10 10L9.5 11H12V10H10Z" fill="white" />
            <path d="M10 13L9.5 12H12V13H10Z" fill="white" />
            <path d="M12.5 9L14.5 14H16L18 9H16.5L15.25 12.5L14 9H12.5Z" fill="white" />
            <path d="M18.5 9L19 10H21V9H18.5Z" fill="white" />
            <path d="M18.5 14L19 13H21V14H18.5Z" fill="white" />
            <path d="M19 10L18.5 11H21V10H19Z" fill="white" />
            <path d="M19 13L18.5 12H21V13H19Z" fill="white" />
          </svg>
        );
      default:
        return <CreditCardIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-secondary-bg rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="h-32 bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-secondary-bg rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-medium text-white">Payment Methods</h3>
        <button
          onClick={() => setShowAddPaymentModal(true)}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-accent-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Payment Method
        </button>
      </div>
      
      {error && (
        <div className="bg-red-900/20 border-l-4 border-red-500 p-4 m-4">
          <div className="flex">
            <ExclamationCircleIcon className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-900/20 border-l-4 border-green-500 p-4 m-4">
          <div className="flex">
            <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
            <p className="text-sm text-green-300">{successMessage}</p>
          </div>
        </div>
      )}
      
      <div className="p-6">
        {paymentMethods.length === 0 ? (
          <div className="text-center py-8">
            <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No payment methods</h3>
            <p className="text-gray-400 mb-4">Add a payment method to pay for your subscription.</p>
            <button
              onClick={() => setShowAddPaymentModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Payment Method
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div 
                key={method.id} 
                className={`bg-gray-800 rounded-lg p-4 flex items-center justify-between ${
                  method.isDefault ? 'border border-accent-blue' : ''
                }`}
              >
                <div className="flex items-center">
                  {getCardIcon(method.brand)}
                  <div className="ml-4">
                    <p className="text-white font-medium capitalize">
                      {method.brand} •••• {method.last4}
                      {method.isDefault && (
                        <span className="ml-2 text-xs bg-accent-blue text-white py-0.5 px-2 rounded-full">
                          Default
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-400">
                      {method.holderName} • Expires {method.expMonth}/{method.expYear}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {!method.isDefault && (
                    <button
                      onClick={() => handleSetDefaultPaymentMethod(method.id)}
                      disabled={processingAction === method.id}
                      className="text-accent-blue hover:text-blue-400 font-medium text-sm focus:outline-none"
                    >
                      {processingAction === method.id ? (
                        <span className="flex items-center">
                          <ArrowPathIcon className="h-4 w-4 mr-1 animate-spin" />
                          Setting...
                        </span>
                      ) : 'Set Default'}
                    </button>
                  )}
                  <button
                    onClick={() => handleRemovePaymentMethod(method.id)}
                    disabled={processingAction === `remove_${method.id}`}
                    className="text-red-500 hover:text-red-400 focus:outline-none"
                  >
                    {processingAction === `remove_${method.id}` ? (
                      <ArrowPathIcon className="h-5 w-5 animate-spin" />
                    ) : (
                      <TrashIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Add Payment Method Modal */}
      {showAddPaymentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>
            
            <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleAddPaymentMethod}>
                <div className="bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-900/30 sm:mx-0 sm:h-10 sm:w-10">
                      <CreditCardIcon className="h-6 w-6 text-blue-300" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-white">
                        Add Payment Method
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-400">
                            Card Number
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              id="cardNumber"
                              value={cardNumber}
                              onChange={handleCardNumberChange}
                              maxLength={19}
                              className={`block w-full px-3 py-2 border ${
                                formErrors.cardNumber ? 'border-red-500' : 'border-gray-700'
                              } rounded-md shadow-sm bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm`}
                              placeholder="1234 5678 9012 3456"
                            />
                            {formErrors.cardNumber && (
                              <p className="mt-1 text-sm text-red-500">{formErrors.cardNumber}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-400">
                              Expiry Date
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                id="expiryDate"
                                value={expiryDate}
                                onChange={handleExpiryDateChange}
                                maxLength={5}
                                className={`block w-full px-3 py-2 border ${
                                  formErrors.expiryDate ? 'border-red-500' : 'border-gray-700'
                                } rounded-md shadow-sm bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm`}
                                placeholder="MM/YY"
                              />
                              {formErrors.expiryDate && (
                                <p className="mt-1 text-sm text-red-500">{formErrors.expiryDate}</p>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <label htmlFor="cvc" className="block text-sm font-medium text-gray-400">
                              CVC
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                id="cvc"
                                value={cvc}
                                onChange={(e) => setCvc(e.target.value.replace(/[^\d]/g, ''))}
                                maxLength={4}
                                className={`block w-full px-3 py-2 border ${
                                  formErrors.cvc ? 'border-red-500' : 'border-gray-700'
                                } rounded-md shadow-sm bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm`}
                                placeholder="123"
                              />
                              {formErrors.cvc && (
                                <p className="mt-1 text-sm text-red-500">{formErrors.cvc}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-400">
                            Cardholder Name
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              id="cardholderName"
                              value={cardholderName}
                              onChange={(e) => setCardholderName(e.target.value)}
                              className={`block w-full px-3 py-2 border ${
                                formErrors.cardholderName ? 'border-red-500' : 'border-gray-700'
                              } rounded-md shadow-sm bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm`}
                              placeholder="John Doe"
                            />
                            {formErrors.cardholderName && (
                              <p className="mt-1 text-sm text-red-500">{formErrors.cardholderName}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            id="isDefault"
                            name="isDefault"
                            type="checkbox"
                            checked={isDefault}
                            onChange={(e) => setIsDefault(e.target.checked)}
                            className="h-4 w-4 text-accent-blue focus:ring-accent-blue border-gray-700 rounded"
                          />
                          <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-400">
                            Make this my default payment method
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={processingAction === 'addPayment'}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-accent-blue text-base font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {processingAction === 'addPayment' ? (
                      <>
                        <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : 'Add Payment Method'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddPaymentModal(false)}
                    disabled={processingAction === 'addPayment'}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-gray-800 text-base font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodManagement; 