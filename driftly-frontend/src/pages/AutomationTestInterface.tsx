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
  BeakerIcon,
  CheckCircleIcon,
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
  config: any;
}

interface TestResult {
  success: boolean;
  result: any;
  message: string;
  error?: string;
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

const AutomationTestInterface = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [automation, setAutomation] = useState<Automation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStepId, setSelectedStepId] = useState<string>('');
  const [testDataJson, setTestDataJson] = useState<string>('{\n  "email": "test@example.com",\n  "firstName": "Test",\n  "lastName": "User"\n}');
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Load automation data
  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const automationData = await automationService.getAutomation(id);
        
        // Type cast the automation data to match the expected Automation interface
        const formattedAutomation: Automation = {
          _id: automationData._id,
          name: automationData.name,
          description: automationData.description,
          isActive: automationData.isActive,
          steps: automationData.steps as unknown as Step[],
        };
        
        setAutomation(formattedAutomation);
        
        // Set first step as default selection if available
        if (automationData.steps && automationData.steps.length > 0) {
          setSelectedStepId(automationData.steps[0].id);
        }
      } catch (error) {
        console.error('Error fetching automation:', error);
        setErrorMessage('Failed to load automation data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  const handleTestStep = async () => {
    if (!id || !selectedStepId) return;
    
    // Validate JSON
    let testData;
    try {
      testData = JSON.parse(testDataJson);
    } catch (error) {
      toast.error('Please check your test data format');
      return;
    }
    
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const result = await automationService.testAutomationStep(id, selectedStepId, testData);
      setTestResult(result);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      console.error('Error testing step:', error);
      setTestResult({
        success: false,
        result: null,
        message: 'Error executing step test',
        error: error.message || 'Unknown error'
      });
      
      toast.error(error.response?.data?.message || 'Error executing step test');
    } finally {
      setIsTesting(false);
    }
  };
  
  // Get template test data based on step type
  const getTemplateData = () => {
    if (!automation || !selectedStepId) return;
    
    const step = automation.steps.find(s => s.id === selectedStepId);
    if (!step) return;
    
    let template: Record<string, any> = {
      email: "test@example.com",
      firstName: "Test",
      lastName: "User"
    };
    
    switch (step.type) {
      case 'email':
        // No additional fields needed
        break;
      case 'condition':
        if (step.config.condition === 'open') {
          template.emailOpens = [{ timestamp: new Date().toISOString() }];
        } else if (step.config.condition === 'click') {
          template.emailClicks = [{ timestamp: new Date().toISOString(), url: "https://example.com" }];
        } else if (step.config.condition === 'attribute') {
          template[step.config.attribute] = step.config.value;
        }
        break;
      case 'action':
        if (step.config.action === 'update') {
          template.customFields = { [step.config.field]: "Value to update" };
        } else if (step.config.action === 'tag') {
          template.tags = ["existing-tag"];
        }
        break;
      default:
        // Default template is sufficient
        break;
    }
    
    setTestDataJson(JSON.stringify(template, null, 2));
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
          <ExclamationCircleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-lg font-medium text-white">Automation not found</h3>
          <p className="mt-1 text-sm text-gray-400">
            {errorMessage || "The automation you're looking for doesn't exist or you don't have access to it."}
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
            title="Test Automation Steps"
            description={`Test individual steps of the ${automation.name} automation`}
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
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 shadow hover:shadow-md transition-shadow duration-300">
              <h3 className="text-lg font-medium text-white mb-6">Step Configuration</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Select Step to Test
                  </label>
                  <select 
                    value={selectedStepId} 
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      setSelectedStepId(e.target.value);
                      setTestResult(null);
                    }}
                    className="block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    {automation.steps.map((step) => (
                      <option key={step.id} value={step.id}>
                        {step.name} ({step.type})
                      </option>
                    ))}
                  </select>
                  <div className="mt-2 text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={getTemplateData}
                    >
                      Get Template
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Test Data (JSON)
                  </label>
                  <textarea 
                    value={testDataJson} 
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTestDataJson(e.target.value)} 
                    rows={12}
                    className="font-mono text-sm block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Enter test data in JSON format"
                  />
                  <p className="mt-2 text-sm text-gray-400">
                    Provide sample contact data to test this step with.
                  </p>
                </div>
                
                <div className="pt-4">
                  <Button
                    variant="primary"
                    onClick={handleTestStep}
                    disabled={isTesting || !selectedStepId}
                    className="w-full"
                  >
                    {isTesting ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <BeakerIcon className="h-5 w-5 mr-2" />
                        Test Step
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 shadow hover:shadow-md transition-shadow duration-300">
              <h3 className="text-lg font-medium text-white mb-6">Test Results</h3>
              
              {testResult ? (
                <div className="space-y-6">
                  <div className="flex items-center">
                    <div className={`rounded-full p-2 mr-3 ${testResult.success ? 'bg-green-900/40' : 'bg-red-900/40'}`}>
                      {testResult.success ? (
                        <CheckCircleIcon className="h-6 w-6 text-green-500" />
                      ) : (
                        <ExclamationCircleIcon className="h-6 w-6 text-red-500" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-base font-medium text-white">
                        {testResult.success ? 'Test Successful' : 'Test Failed'}
                      </h4>
                      <p className="text-sm text-gray-400">{testResult.message}</p>
                    </div>
                  </div>
                  
                  {testResult.error && (
                    <div className="bg-red-900/30 border border-red-700 rounded-md p-4">
                      <h4 className="text-sm font-medium text-red-300 mb-2">Error Details</h4>
                      <p className="text-sm text-red-300">{testResult.error}</p>
                    </div>
                  )}
                  
                  <div className="bg-secondary-bg border border-gray-700 rounded-md p-4">
                    <h4 className="text-sm font-medium text-white mb-2">Result Data</h4>
                    <pre className="text-xs text-gray-400 overflow-auto max-h-96 rounded bg-gray-800 p-2">
                      {JSON.stringify(testResult.result, null, 2)}
                    </pre>
                  </div>
                  
                  {testResult.success && (
                    <div className="bg-green-900/30 border border-green-700 rounded-md p-4">
                      <h4 className="text-sm font-medium text-green-300 mb-2">Next Steps</h4>
                      <p className="text-sm text-green-300">
                        The step processed successfully. You can use this data to verify your automation is working as expected.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <BeakerIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h4 className="mt-2 text-base font-medium text-white">No tests run yet</h4>
                  <p className="mt-1 text-sm">Select a step and click "Test Step" to see results</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomationTestInterface; 