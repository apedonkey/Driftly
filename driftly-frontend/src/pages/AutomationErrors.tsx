import {
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  ArrowLeftIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

import AutomationTabs from '../components/AutomationTabs';
import SimpleNavigation from '../components/SimpleNavigation';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';
import Spinner from '../components/ui/Spinner';
import { automationService } from '../services/api';

interface Automation {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
  steps: Array<Step>;
}

interface Step {
  id: string;
  name: string;
  type: 'email' | 'delay' | 'condition' | 'action';
}

interface Contact {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status: string;
  lastError?: {
    stepId: string;
    errorType: string;
    errorMessage: string;
    timestamp: string;
  };
}

interface Error {
  date: string;
  contactId: string;
  stepId: string;
  stepName: string;
  errorType: string;
  errorMessage: string;
  additionalData?: any;
}

interface ErrorStat {
  count: number;
  name: string;
}

interface ErrorStats {
  totalErrors: number;
  byStep: Record<string, ErrorStat>;
  byType: Record<string, number>;
  recentErrors?: Error[];
}

// Create a simple toast implementation
const toast = {
  success: (message: string) => {
    console.log('Success:', message);
    // In a real app, this would show a toast notification
  },
  error: (message: string) => {
    console.error('Error:', message);
    // In a real app, this would show a toast notification
  }
};

const AutomationErrors = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [automation, setAutomation] = useState<Automation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errors, setErrors] = useState<Error[]>([]);
  const [errorStats, setErrorStats] = useState<ErrorStats | null>(null);
  const [contactsInError, setContactsInError] = useState<Contact[]>([]);
  
  // Filters
  const [activeTab, setActiveTab] = useState<string>('errors');
  const [stepFilter, setStepFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [startDateFilter, setStartDateFilter] = useState<string>('');
  const [endDateFilter, setEndDateFilter] = useState<string>('');
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  
  // Load automation and initial error data
  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get all data
        const automationData = await automationService.getAutomation(id);
        const errorsData = await automationService.getAutomationErrors(id);
        const errorStatsData = await automationService.getAutomationErrorStats(id);
        const contactsData = await automationService.getContactsInError(id);
        
        // Type cast the automation data to match the expected Automation interface
        const formattedAutomation: Automation = {
          _id: automationData._id,
          name: automationData.name,
          description: automationData.description,
          isActive: automationData.isActive,
          steps: automationData.steps as unknown as Step[],
        };
        
        setAutomation(formattedAutomation);
        setErrors(errorsData);
        
        // Explicitly set recentErrors without trying to access it from errorStatsData
        setErrorStats({
          totalErrors: errorStatsData.totalErrors,
          byStep: errorStatsData.byStep,
          byType: errorStatsData.byType,
          recentErrors: errorsData.slice(0, 10) // Just use the first 10 errors from errorsData
        });
        
        setContactsInError(contactsData);
      } catch (error) {
        console.error('Error fetching automation error data:', error);
        toast.error('Failed to load error data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  // Apply filters when changed
  useEffect(() => {
    if (!id) return;
    
    const fetchFilteredErrors = async () => {
      try {
        const filters: Record<string, string> = {};
        
        if (stepFilter !== 'all') {
          filters.stepId = stepFilter;
        }
        
        if (typeFilter !== 'all') {
          filters.errorType = typeFilter;
        }
        
        if (startDateFilter) {
          filters.startDate = startDateFilter;
        }
        
        if (endDateFilter) {
          filters.endDate = endDateFilter;
        }
        
        const errorsData = await automationService.getAutomationErrors(id, filters);
        setErrors(errorsData);
      } catch (error) {
        console.error('Error fetching filtered errors:', error);
      }
    };
    
    fetchFilteredErrors();
  }, [id, stepFilter, typeFilter, startDateFilter, endDateFilter]);
  
  const handleRetryContact = async (contactId: string) => {
    try {
      await automationService.retryContact(id!, contactId);
      
      // Update contacts list
      const updatedContacts = contactsInError.filter(c => c._id !== contactId);
      setContactsInError(updatedContacts);
      
      toast.success('Contact set for retry');
    } catch (error) {
      console.error('Error retrying contact:', error);
      toast.error('Failed to retry contact');
    }
  };
  
  const handleRetryAllContacts = async () => {
    if (!id || contactsInError.length === 0) return;
    
    setIsRetrying(true);
    try {
      await automationService.retryAllContacts(id);
      
      // Clear contacts list
      setContactsInError([]);
      
      toast.success(`All ${contactsInError.length} contacts set for retry`);
    } catch (error) {
      console.error('Error retrying all contacts:', error);
      toast.error('Failed to retry contacts');
    } finally {
      setIsRetrying(false);
    }
  };
  
  const getContactsInError = async () => {
    try {
      const contactsData = await automationService.getContactsInError(id!);
      setContactsInError(contactsData);
    } catch (error) {
      console.error('Error fetching contacts in error:', error);
      toast.error('Failed to load contacts in error state');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }
  
  if (!automation) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <ExclamationCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Automation not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The automation you're looking for doesn't exist or you don't have access to it.
          </p>
          <div className="mt-6">
            <Button 
              variant="primary" 
              onClick={() => navigate('/automations')}
            >
              Back to Automations
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-primary-bg min-h-screen">
      <SimpleNavigation />
      
      <div className="flex h-[calc(100vh-4rem)]">
        <AutomationTabs automationId={id!} />
        
        <div className="flex-1 overflow-y-auto p-8">
          <PageHeader
            title={`${automation.name} Error Management`}
            description="Monitor and resolve issues with your automation workflow"
            action={
              <Button
                variant="secondary"
                size="md"
                icon={<ArrowLeftIcon className="h-5 w-5" />}
                onClick={() => navigate('/automations')}
              >
                Back to Automations
              </Button>
            }
          />
          
          <div className="mt-8">
            <Card className="p-6 shadow hover:shadow-md transition-shadow duration-300">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Error Overview</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Errors</p>
                  <p className="mt-2 text-2xl font-bold text-red-600">{errorStats?.totalErrors || 0}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Contacts in Error</p>
                  <p className="mt-2 text-2xl font-bold text-amber-600">{contactsInError.length}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Most Common Error</p>
                  <p className="mt-2 text-base font-medium text-gray-900">
                    {Object.entries(errorStats?.byType || {}).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Most Problematic Step</p>
                  <p className="mt-2 text-base font-medium text-gray-900">
                    {Object.entries(errorStats?.byStep || {})
                      .sort((a, b) => b[1].count - a[1].count)[0]?.[1].name || 'None'}
                  </p>
                </div>
              </div>
            </Card>
          </div>
          
          <div className="mt-8">
            <Card className="p-6 shadow hover:shadow-md transition-shadow duration-300">
              <div className="mb-4 border-b">
                <div className="flex space-x-4">
                  <button
                    className={`pb-2 px-1 ${activeTab === 'errors' 
                      ? 'border-b-2 border-indigo-500 text-indigo-600 font-medium' 
                      : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('errors')}
                  >
                    All Errors
                  </button>
                  <button
                    className={`pb-2 px-1 ${activeTab === 'contacts' 
                      ? 'border-b-2 border-indigo-500 text-indigo-600 font-medium' 
                      : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => {
                      setActiveTab('contacts');
                      getContactsInError();
                    }}
                  >
                    Contacts with Errors
                  </button>
                </div>
              </div>
              
              <div className="mt-6">
                {/* Errors Tab */}
                {activeTab === 'errors' && (
                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                      <div className="w-full md:w-1/4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Filter by Step
                        </label>
                        <select
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          value={stepFilter}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStepFilter(e.target.value)}
                        >
                          <option value="all">All Steps</option>
                          {automation.steps.map(step => (
                            <option key={step.id} value={step.id}>{step.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="w-full md:w-1/4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Filter by Error Type
                        </label>
                        <select
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          value={typeFilter}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTypeFilter(e.target.value)}
                        >
                          <option value="all">All Types</option>
                          {errorStats && Object.keys(errorStats.byType).map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="w-full md:w-1/4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Date
                        </label>
                        <input
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          type="date"
                          value={startDateFilter}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDateFilter(e.target.value)}
                        />
                      </div>
                      
                      <div className="w-full md:w-1/4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Date
                        </label>
                        <input
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          type="date"
                          value={endDateFilter}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDateFilter(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-secondary-bg">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Step
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Error Type
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Message
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-secondary-bg divide-y divide-gray-700">
                          {errorStats && errorStats.recentErrors && errorStats.recentErrors.length > 0 ? (
                            errorStats.recentErrors.map((error, index) => (
                              <tr key={`error-${index}`}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                  {new Date(error.date).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                  {error.stepName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-400">
                                  {error.errorType}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-400 max-w-md truncate">
                                  {error.errorMessage}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-400">
                                No errors found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {/* Contacts Tab */}
                {activeTab === 'contacts' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-medium text-gray-900">Contacts in Error State</h3>
                      {contactsInError.length > 0 && (
                        <Button
                          variant="primary"
                          onClick={handleRetryAllContacts}
                          disabled={isRetrying}
                        >
                          {isRetrying ? (
                            <>
                              <Spinner size="sm" className="mr-2" />
                              Retrying...
                            </>
                          ) : (
                            <>
                              <ArrowPathIcon className="h-5 w-5 mr-2" />
                              Retry All
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-secondary-bg">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Contact
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Failed Step
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Error
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Time
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-secondary-bg divide-y divide-gray-700">
                          {contactsInError.length > 0 ? (
                            contactsInError.map(contact => {
                              const stepName = automation.steps.find(s => s.id === contact.lastError?.stepId)?.name || 'Unknown Step';
                              
                              return (
                                <tr key={contact._id}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                    {contact.firstName && contact.lastName
                                      ? `${contact.firstName} ${contact.lastName}`
                                      : contact.email}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                    {stepName}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-red-400 max-w-md truncate">
                                    {contact.lastError?.errorType}: {contact.lastError?.errorMessage}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                    {contact.lastError?.timestamp 
                                      ? new Date(contact.lastError.timestamp).toLocaleString() 
                                      : 'Unknown'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRetryContact(contact._id)}
                                    >
                                      Retry
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-400">
                                No contacts in error state
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomationErrors; 