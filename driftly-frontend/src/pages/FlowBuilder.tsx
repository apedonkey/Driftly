import React from 'react';

import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  ArrowLeftIcon,
  ArrowPathIcon,
  ArrowsUpDownIcon,
  DocumentArrowUpIcon,
  DocumentDuplicateIcon,
  PencilIcon,
  PlusCircleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

import SimpleNavigation from '../components/SimpleNavigation';
import {
  flowService,
  templateService,
} from '../services/api';

interface FlowStep {
  id: string;
  subject: string;
  body: string;
  delayDays: number;
  delayHours: number;
  order: number;
}

interface Flow {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  steps: FlowStep[];
  contactCount?: number;
  messagesSent?: number;
  openRate?: number;
  clickRate?: number;
  createdAt?: string;
  status?: string;
}

// API response type
interface ApiResponse<T> {
  success: boolean;
  count?: number;
  data: T;
}

const FlowBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [flow, setFlow] = React.useState<Flow>({
    id: '',
    name: 'Untitled Flow',
    description: '',
    isActive: false,
    steps: []
  });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [activeStep, setActiveStep] = React.useState<string | null>(null);
  const [showPreview, setShowPreview] = React.useState(false);
  const [showFlowDetails, setShowFlowDetails] = React.useState(false);
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  // Add state for step operations
  const [isSavingSteps, setIsSavingSteps] = React.useState(false);
  const [isReordering, setIsReordering] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [draggedStepId, setDraggedStepId] = React.useState<string | null>(null);

  // Get template ID from query params if it exists
  const queryParams = new URLSearchParams(location.search);
  const templateId = queryParams.get('template');

  React.useEffect(() => {
    const fetchFlow = async () => {
      try {
        setLoading(true);
        
        if (id) {
          // Fetch existing flow
          const response = await flowService.getFlow(id);
          console.log('Flow API response:', response);
          
          if (response && response.success && response.data) {
            // Transform response to match our interface
            const flowData = response.data as any; // Type assertion to any to avoid property access errors
            
            setFlow({
              id: flowData.id,
              name: flowData.name || 'Untitled Flow',
              description: flowData.description || '',
              isActive: flowData.status === 'active',
              steps: Array.isArray(flowData.steps) ? flowData.steps.map((step: any) => ({
                id: step.id,
                subject: step.subject || '',
                body: step.body || '',
                delayDays: step.delayDays || 0,
                delayHours: step.delayHours || 0,
                order: step.order || 0
              })) : []
            });
            
            // Only set active step if we have steps
            const steps = flowData.steps || [];
            if (Array.isArray(steps) && steps.length > 0) {
              setActiveStep(steps[0].id);
            }
          } else {
            console.error('Invalid flow API response:', response);
            setError('Failed to load flow data. Invalid response format.');
          }
        } else if (templateId) {
          // Create new flow from template
          const response = await templateService.getTemplate(templateId);
          console.log('Template API response:', response);
          
          if (response && response.success && response.data) {
            const template = response.data;
            
            setFlow({
              id: '',
              name: template.name,
              description: template.description || '',
              isActive: false,
              steps: template.steps ? template.steps.map((step: any, index: number) => ({
                id: `temp-${index}`,
                subject: step.subject || '',
                body: step.body || '',
                delayDays: step.delayDays || 1,
                delayHours: step.delayHours || 0,
                order: step.order || index
              })) : []
            });
            
            if (template.steps && template.steps.length > 0) {
              setActiveStep(`temp-0`);
            }
          } else {
            console.error('Invalid template API response:', response);
            setError('Failed to load template data. Invalid response format.');
          }
        } else {
          // Create new flow with one empty step
          setFlow({
            id: '',
            name: 'Untitled Flow',
            description: '',
            isActive: false,
            steps: [{
              id: 'temp-0',
              subject: '',
              body: '',
              delayDays: 1,
              delayHours: 0,
              order: 0
            }]
          });
          setActiveStep('temp-0');
        }
      } catch (err) {
        console.error('Error fetching flow:', err);
        setError('Failed to load flow. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFlow();
  }, [id, templateId]);

  const handleSave = async () => {
    try {
      setError(null);
      setSaving(true);
      
      // Validate the flow
      if (!flow.name.trim()) {
        setError('Flow name is required');
        setSaving(false);
        return;
      }
      
      // Make sure all steps have a subject and body
      for (const step of flow.steps) {
        if (!step.subject.trim()) {
          setError(`Step ${step.order + 1} is missing a subject line`);
          setActiveStep(step.id);
          setSaving(false);
          return;
        }
        if (!step.body.trim()) {
          setError(`Step ${step.order + 1} is missing an email body`);
          setActiveStep(step.id);
          setSaving(false);
          return;
        }
      }
      
      // Transform flow data to match API expectations
      const flowData = {
        ...flow,
        status: flow.isActive ? 'active' : 'inactive',
        contactCount: flow.contactCount || 0,
        messagesSent: flow.messagesSent || 0,
        openRate: flow.openRate || 0,
        clickRate: flow.clickRate || 0,
        createdAt: flow.createdAt || new Date().toISOString()
      };
      
      console.log('Saving flow data:', flowData);
      
      let response;
      if (flow.id) {
        // Update existing flow
        response = await flowService.updateFlow(flow.id, flowData);
      } else {
        // Create new flow
        response = await flowService.createFlow(flowData);
        console.log('Create flow response:', response);
        
        if (response && response.success) {
          // Use proper type casting for the response
          const newFlowId = (response as unknown as ApiResponse<any>).data.id;
          setFlow(prevFlow => ({
            ...prevFlow,
            id: newFlowId
          }));
          
          // Show success message before redirecting
          setSuccessMessage('Flow created successfully');
          
          // Wait a moment before redirecting to ensure the flow is saved
          setTimeout(() => {
            // Navigate to the campaigns page after creating
            navigate('/campaigns');
          }, 1000);
        } else {
          console.error('Invalid create flow response:', response);
          setError('Failed to create flow. Invalid response format.');
          setSaving(false);
          return;
        }
      }
      
      // Clear any errors
      setError(null);
      
      // This would typically be handled by a toast notification
      console.log('Flow saved successfully');
    } catch (err: any) {
      console.error('Error saving flow:', err);
      setError(err.message || 'Failed to save flow. Please try again later.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddStep = () => {
    const newStep: FlowStep = {
      id: `temp-${Date.now()}`,
      subject: '',
      body: '',
      delayDays: 1,
      delayHours: 0,
      order: flow.steps.length
    };
    
    setFlow({
      ...flow,
      steps: [...flow.steps, newStep]
    });
    
    setActiveStep(newStep.id);
  };

  const handleDeleteStep = (stepId: string) => {
    if (flow.steps.length <= 1) {
      setError('Flow must have at least one step');
      return;
    }
    
    const updatedSteps = flow.steps.filter(step => step.id !== stepId);
    
    // Reorder steps
    const reorderedSteps = updatedSteps.map((step, index) => ({
      ...step,
      order: index
    }));
    
    setFlow({
      ...flow,
      steps: reorderedSteps
    });
    
    // Set active step to the first one if the active step was deleted
    if (activeStep === stepId) {
      setActiveStep(reorderedSteps[0]?.id || null);
    }
  };

  const handleStepChange = (stepId: string, field: keyof FlowStep, value: any) => {
    const updatedSteps = flow.steps.map(step => {
      if (step.id === stepId) {
        return {
          ...step,
          [field]: value
        };
      }
      return step;
    });
    
    setFlow({
      ...flow,
      steps: updatedSteps
    });
  };

  const getActiveStep = () => {
    return flow.steps.find(step => step.id === activeStep) || null;
  };

  const getStepDelay = (step: FlowStep) => {
    if (step.order === 0) {
      return 'Immediately';
    }
    
    const days = step.delayDays;
    const hours = step.delayHours;
    
    if (days === 0 && hours === 0) {
      return 'Immediately';
    }
    
    let delay = '';
    if (days > 0) {
      delay += `${days} ${days === 1 ? 'day' : 'days'}`;
    }
    
    if (hours > 0) {
      if (delay) {
        delay += ' and ';
      }
      delay += `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    }
    
    return `After ${delay}`;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      const allowedTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/csv'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setUploadError('Please upload a valid Excel, Word, or CSV file');
        return;
      }
      
      setUploadedFile(file);
      setUploadError(null);
      
      // Here you would typically process the file and extract email addresses
      // For now, we'll just log the file name
      console.log('File uploaded:', file.name);
    }
  };

  // Add function to save just the steps
  const handleSaveSteps = async () => {
    if (!flow.id) {
      setError('Please save the flow first before updating steps');
      return;
    }

    try {
      setIsSavingSteps(true);
      
      // Validate the steps
      for (const step of flow.steps) {
        if (!step.subject.trim()) {
          setError(`Step ${step.order + 1} is missing a subject line`);
          setActiveStep(step.id);
          setIsSavingSteps(false);
          return;
        }
        if (!step.body.trim()) {
          setError(`Step ${step.order + 1} is missing an email body`);
          setActiveStep(step.id);
          setIsSavingSteps(false);
          return;
        }
      }
      
      // Save just the steps
      const response = await flowService.updateFlowSteps(flow.id, flow.steps);
      
      // Show success message and clear after 3 seconds
      setSuccessMessage('Steps saved successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Clear any errors
      setError(null);
    } catch (err: any) {
      console.error('Error saving steps:', err);
      setError(err.message || 'Failed to save steps. Please try again later.');
    } finally {
      setIsSavingSteps(false);
    }
  };

  // Add a function to duplicate a step
  const handleDuplicateStep = (stepId: string) => {
    const stepToDuplicate = flow.steps.find(step => step.id === stepId);
    if (!stepToDuplicate) return;
    
    const newStep: FlowStep = {
      ...stepToDuplicate,
      id: `temp-${Date.now()}`,
      order: flow.steps.length,
      subject: `${stepToDuplicate.subject} (Copy)`
    };
    
    setFlow({
      ...flow,
      steps: [...flow.steps, newStep]
    });
    
    setActiveStep(newStep.id);
  };

  // Function to handle start of drag
  const handleDragStart = (e: React.DragEvent, stepId: string) => {
    setDraggedStepId(stepId);
    e.dataTransfer.setData('text/plain', stepId);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Function to handle drop
  const handleDrop = (e: React.DragEvent, targetStepId: string) => {
    e.preventDefault();
    if (!draggedStepId || draggedStepId === targetStepId) return;
    
    const sourceIndex = flow.steps.findIndex(step => step.id === draggedStepId);
    const targetIndex = flow.steps.findIndex(step => step.id === targetStepId);
    
    if (sourceIndex === -1 || targetIndex === -1) return;
    
    // Create a copy of steps array
    const updatedSteps = [...flow.steps];
    
    // Remove the dragged item
    const [draggedStep] = updatedSteps.splice(sourceIndex, 1);
    
    // Insert it at the target position
    updatedSteps.splice(targetIndex, 0, draggedStep);
    
    // Re-number the order property
    const reorderedSteps = updatedSteps.map((step, idx) => ({
      ...step,
      order: idx
    }));
    
    setFlow({
      ...flow,
      steps: reorderedSteps
    });
    
    setDraggedStepId(null);
  };

  // Function to handle dragover
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const toggleReorderingMode = () => {
    setIsReordering(!isReordering);
  };

  return (
    <div className="min-h-screen bg-primary-bg">
      <SimpleNavigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-4">
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          
          {/* Flow Details Section */}
          <div className="bg-secondary-bg rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Flow Details</h2>
              <button
                onClick={() => setShowFlowDetails(!showFlowDetails)}
                className="inline-flex items-center text-sm text-gray-400 hover:text-white"
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                {showFlowDetails ? 'Done Editing' : 'Edit Details'}
              </button>
            </div>
            
            {showFlowDetails ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Flow Name
                  </label>
                  <input
                    type="text"
                    value={flow.name}
                    onChange={(e) => setFlow({ ...flow, name: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-700 bg-gray-800 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                    placeholder="Enter flow name..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Description
                  </label>
                  <textarea
                    value={flow.description}
                    onChange={(e) => setFlow({ ...flow, description: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-700 bg-gray-800 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                    placeholder="Add a description for your flow..."
                    rows={3}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-white">{flow.name}</h3>
                {flow.description && (
                  <p className="text-gray-400">{flow.description}</p>
                )}
              </div>
            )}
          </div>

          {/* File Upload Section */}
          <div className="bg-secondary-bg rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Upload Contact List</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col w-full h-32 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer hover:bg-gray-700">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <DocumentArrowUpIcon className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="mb-2 text-sm text-gray-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-400">
                      Excel, Word, or CSV files (MAX. 10MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".xlsx,.xls,.doc,.docx,.csv"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
              
              {uploadError && (
                <div className="text-red-400 text-sm">{uploadError}</div>
              )}
              
              {uploadedFile && (
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-md">
                  <div className="flex items-center">
                    <DocumentArrowUpIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-white">{uploadedFile.name}</span>
                  </div>
                  <button
                    onClick={() => setUploadedFile(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded-md">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="mb-6 bg-green-900/30 border border-green-500 text-green-300 px-4 py-3 rounded-md">
            {successMessage}
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-12">
            <div className="spinner"></div>
            <p className="mt-2 text-gray-400">Loading flow...</p>
          </div>
        ) : showPreview ? (
          <div className="bg-secondary-bg rounded-lg shadow-md overflow-hidden p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Flow Preview</h2>
            
            <div className="space-y-8">
              {flow.steps.map((step, index) => (
                <div key={step.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-accent-blue rounded-full h-8 w-8 flex items-center justify-center mr-3">
                      <span className="text-white font-medium">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-white">{step.subject || 'No Subject'}</h3>
                        <span className="text-sm text-gray-400">{getStepDelay(step)}</span>
                      </div>
                      <div className="mt-2 text-gray-300 whitespace-pre-wrap">
                        {step.body || 'No content'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 text-center">
              <button
                onClick={() => setShowPreview(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-white hover:bg-gray-700"
              >
                Back to Editor
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-secondary-bg rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium text-white">Email Sequence</h2>
                  <p className="text-sm text-gray-400">Configure your email nurture flow</p>
                </div>
                <button
                  onClick={toggleReorderingMode}
                  className={`text-sm px-3 py-1 rounded-md ${isReordering ? 'bg-accent-blue text-white' : 'text-gray-400 border border-gray-700'}`}
                >
                  <ArrowsUpDownIcon className="h-4 w-4 inline mr-1" />
                  {isReordering ? 'Done' : 'Reorder'}
                </button>
              </div>
              
              <div className="p-4">
                <div className="space-y-2">
                  {flow.steps.map((step, index) => (
                    <div 
                      key={step.id}
                      onClick={() => !isReordering && setActiveStep(step.id)}
                      draggable={isReordering}
                      onDragStart={(e) => isReordering && handleDragStart(e, step.id)}
                      onDragOver={isReordering ? handleDragOver : undefined}
                      onDrop={(e) => isReordering && handleDrop(e, step.id)}
                      className={`flex items-center justify-between p-3 rounded-md cursor-pointer 
                        ${activeStep === step.id ? 'bg-gray-700' : 'hover:bg-gray-700'}
                        ${isReordering ? 'border border-dashed border-gray-600' : ''}
                      `}
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-accent-blue rounded-full h-6 w-6 flex items-center justify-center mr-3">
                          <span className="text-white text-xs font-medium">{index + 1}</span>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-white">
                            {step.subject || 'No Subject'}
                          </h3>
                          <p className="text-xs text-gray-400">
                            {getStepDelay(step)}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        {!isReordering && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicateStep(step.id);
                              }}
                              className="text-gray-400 hover:text-white p-1"
                              title="Duplicate step"
                            >
                              <DocumentDuplicateIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteStep(step.id);
                              }}
                              className="text-gray-400 hover:text-white p-1"
                              title="Delete step"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={handleAddStep}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-white hover:bg-gray-700"
                  >
                    <PlusCircleIcon className="h-5 w-5 mr-1" />
                    Add Email
                  </button>
                  
                  {flow.id && (
                    <button
                      onClick={handleSaveSteps}
                      disabled={isSavingSteps}
                      className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-blue hover:bg-blue-600 focus:outline-none disabled:opacity-50"
                    >
                      <ArrowPathIcon className={`h-5 w-5 mr-1 ${isSavingSteps ? 'animate-spin' : ''}`} />
                      {isSavingSteps ? 'Saving...' : 'Save Steps'}
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2 bg-secondary-bg rounded-lg shadow-md overflow-hidden">
              {activeStep ? (
                <div>
                  <div className="p-4 border-b border-gray-700">
                    <h2 className="text-lg font-medium text-white">Email Editor</h2>
                    <p className="text-sm text-gray-400">
                      {getActiveStep()?.order === 0 
                        ? 'First email sent immediately when contact is added' 
                        : 'Configure when this email is sent after the previous one'}
                    </p>
                  </div>
                  
                  <div className="p-4">
                    {getActiveStep()?.order !== 0 && (
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-white mb-2">
                          Send this email after
                        </label>
                        <div className="flex space-x-4">
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Days</label>
                            <input
                              type="number"
                              min="0"
                              value={getActiveStep()?.delayDays || 0}
                              onChange={(e) => handleStepChange(
                                activeStep,
                                'delayDays',
                                parseInt(e.target.value) || 0
                              )}
                              className="block w-20 px-3 py-2 border border-gray-700 bg-gray-800 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Hours</label>
                            <input
                              type="number"
                              min="0"
                              max="23"
                              value={getActiveStep()?.delayHours || 0}
                              onChange={(e) => handleStepChange(
                                activeStep,
                                'delayHours',
                                parseInt(e.target.value) || 0
                              )}
                              className="block w-20 px-3 py-2 border border-gray-700 bg-gray-800 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="mb-4">
                      <label htmlFor="subject" className="block text-sm font-medium text-white mb-2">
                        Subject Line
                      </label>
                      <input
                        type="text"
                        id="subject"
                        value={getActiveStep()?.subject || ''}
                        onChange={(e) => handleStepChange(activeStep, 'subject', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-700 bg-gray-800 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                        placeholder="Enter email subject..."
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="body" className="block text-sm font-medium text-white mb-2">
                        Email Content
                      </label>
                      <textarea
                        id="body"
                        value={getActiveStep()?.body || ''}
                        onChange={(e) => handleStepChange(activeStep, 'body', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-700 bg-gray-800 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                        placeholder="Write your email content here..."
                        rows={12}
                      />
                      <p className="mt-2 text-xs text-gray-400">
                        Use variables like {'{'}{'{'} firstName {'}'}{'}'} to personalize your email.
                      </p>
                    </div>
                    
                    <div className="mt-4 flex justify-between">
                      <button
                        onClick={() => setShowPreview(true)}
                        className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-white hover:bg-gray-700"
                      >
                        Preview All Emails
                      </button>
                      
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue disabled:opacity-50"
                      >
                        <ArrowPathIcon className={`h-5 w-5 mr-1 ${saving ? 'animate-spin' : ''}`} />
                        {flow.id ? (saving ? 'Saving...' : 'Save Flow') : (saving ? 'Creating...' : 'Create Flow')}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-400">Select an email from the sequence to edit it</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default FlowBuilder;
