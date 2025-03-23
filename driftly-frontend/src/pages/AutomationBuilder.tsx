import React from 'react';

import {
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  ArrowLeftIcon,
  ArrowsUpDownIcon,
  PlusCircleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

import AutomationTabs from '../components/AutomationTabs';
import SimpleNavigation from '../components/SimpleNavigation';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { automationService } from '../services/api';

// Interfaces for automation data
interface AutomationStep {
  id: string;
  type: 'email' | 'delay' | 'condition' | 'action';
  name: string;
  subject?: string;
  body?: string;
  delayDays?: number;
  delayHours?: number;
  condition?: {
    type: 'open' | 'click' | 'custom';
    value?: string;
  };
  action?: {
    type: 'tag' | 'notify' | 'update' | 'webhook';
    value?: string;
    // For webhook specific configs
    webhookUrl?: string;
    webhookMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    webhookHeaders?: Record<string, string>;
    webhookBody?: string;
    // For tag and update actions
    fieldName?: string;
    fieldValue?: string;
  };
  order: number;
  nextSteps?: {
    default?: string;
    yes?: string;
    no?: string;
  };
}

interface Automation {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  steps: AutomationStep[];
  contactCount?: number;
  messagesSent?: number;
  openRate?: number;
  clickRate?: number;
  createdAt?: string;
  status?: string;
  triggers?: {
    type: 'manual' | 'scheduled' | 'event' | 'form_submission' | 'api_trigger';
    config?: {
      schedule?: {
        frequency?: 'daily' | 'weekly' | 'monthly';
        time?: string;
        days?: string[];
      };
      event?: {
        eventType?: string;
        conditions?: any[];
      };
      form?: {
        formId?: string;
      };
      api?: {
        webhookKey?: string;
      };
    };
  }[];
}

// API response type
interface ApiResponse<T> {
  success: boolean;
  count?: number;
  data: T;
}

const AutomationBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [automation, setAutomation] = React.useState<Automation>({
    id: '',
    name: 'Untitled Automation',
    description: '',
    isActive: false,
    steps: [],
    triggers: [{ type: 'manual' }]
  });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [activeStep, setActiveStep] = React.useState<string | null>(null);
  const [showPreview, setShowPreview] = React.useState(false);
  const [showAutomationDetails, setShowAutomationDetails] = React.useState(false);
  const [isSavingSteps, setIsSavingSteps] = React.useState(false);
  const [isReordering, setIsReordering] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [draggedStepId, setDraggedStepId] = React.useState<string | null>(null);

  // Get template ID from query params if it exists
  const queryParams = new URLSearchParams(location.search);
  const templateId = queryParams.get('template');

  React.useEffect(() => {
    const fetchAutomation = async () => {
      try {
        setLoading(true);
        
        if (id) {
          // Fetch existing automation
          const response = await automationService.getAutomation(id);
          console.log('Automation API response:', response);
          
          if (response && response.success && response.data) {
            // Transform response to match our interface
            const automationData = response.data as any;
            
            setAutomation({
              id: automationData.id,
              name: automationData.name || 'Untitled Automation',
              description: automationData.description || '',
              isActive: automationData.status === 'active',
              steps: Array.isArray(automationData.steps) ? automationData.steps.map((step: any) => ({
                id: step.id,
                type: step.type || 'email',
                name: step.name || '',
                subject: step.subject || '',
                body: step.body || '',
                delayDays: step.delayDays || 0,
                delayHours: step.delayHours || 0,
                condition: step.condition || undefined,
                action: step.action || undefined,
                order: step.order || 0,
                nextSteps: step.nextSteps || undefined
              })) : [],
              triggers: automationData.triggers || [{ type: 'manual' }]
            });
            
            // Only set active step if we have steps
            const steps = automationData.steps || [];
            if (Array.isArray(steps) && steps.length > 0) {
              setActiveStep(steps[0].id);
            }
          } else {
            console.error('Invalid automation API response:', response);
            setError('Failed to load automation data. Invalid response format.');
          }
        } else {
          // Create new automation
          setAutomation({
            id: '',
            name: 'Untitled Automation',
            description: '',
            isActive: false,
            steps: [],
            triggers: [{ type: 'manual' }]
          });
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching automation:', err);
        setError('Failed to load automation. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAutomation();
  }, [id, templateId]);

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const payload = {
        name: automation.name,
        description: automation.description,
        steps: automation.steps,
        triggers: automation.triggers
      };
      
      let response;
      
      if (automation.id) {
        // Update existing automation
        response = await automationService.updateAutomation(automation.id, payload);
      } else {
        // Create new automation
        response = await automationService.createAutomation(payload);
      }
      
      if (response && response.success) {
        if (!automation.id) {
          // If we created a new automation, redirect to the edit page
          navigate(`/automations/builder/${response.data.id}`);
        }
        
        setSuccessMessage('Automation saved successfully');
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError('Failed to save automation. Please try again.');
      }
    } catch (err) {
      console.error('Error saving automation:', err);
      setError('Failed to save automation. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddStep = (type: AutomationStep['type'] = 'email') => {
    const newStep: AutomationStep = {
      id: `temp-${Date.now()}`,
      type,
      name: `New ${type} step`,
      subject: type === 'email' ? 'New Email' : undefined,
      body: type === 'email' ? '<p>Your email content here</p>' : undefined,
      delayDays: type === 'delay' ? 1 : undefined,
      delayHours: type === 'delay' ? 0 : undefined,
      condition: type === 'condition' ? { type: 'open' } : undefined,
      action: type === 'action' ? { type: 'tag' } : undefined,
      order: automation.steps.length,
      nextSteps: type === 'condition' ? { default: 'yes' } : undefined
    };
    
    setAutomation(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
    
    setActiveStep(newStep.id);
  };

  const handleDeleteStep = (stepId: string) => {
    setAutomation(prev => {
      const updatedSteps = prev.steps.filter(step => step.id !== stepId);
      
      // Reorder the remaining steps
      const reorderedSteps = updatedSteps.map((step, index) => ({
        ...step,
        order: index
      }));
      
      // Reset active step if needed
      if (activeStep === stepId) {
        const firstRemainingStep = reorderedSteps[0];
        setActiveStep(firstRemainingStep ? firstRemainingStep.id : null);
      }
      
      return {
        ...prev,
        steps: reorderedSteps
      };
    });
  };

  const handleStepChange = (stepId: string, field: string, value: any) => {
    setAutomation(prev => ({
      ...prev,
      steps: prev.steps.map(step => {
        if (step.id === stepId) {
          // Handle nested fields like condition.type
          if (field.includes('.')) {
            const [parent, child] = field.split('.');
            return {
              ...step,
              [parent]: {
                ...(step[parent as keyof AutomationStep] as any || {}),
                [child]: value
              }
            };
          }
          return { ...step, [field]: value };
        }
        return step;
      })
    }));
  };

  const getActiveStep = () => {
    return automation.steps.find(step => step.id === activeStep);
  };

  const renderStepEditor = () => {
    const step = getActiveStep();
    if (!step) return <div className="p-4">Select a step to edit</div>;

    switch (step.type) {
      case 'email':
        return (
          <div className="p-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-white">Step Name</label>
              <input
                type="text"
                value={step.name || ''}
                onChange={(e) => handleStepChange(step.id, 'name', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-white">Subject</label>
              <input
                type="text"
                value={step.subject || ''}
                onChange={(e) => handleStepChange(step.id, 'subject', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-white">Body</label>
              <textarea
                value={step.body || ''}
                onChange={(e) => handleStepChange(step.id, 'body', e.target.value)}
                rows={10}
                className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        );
      case 'delay':
        return (
          <div className="p-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-white">Step Name</label>
              <input
                type="text"
                value={step.name || ''}
                onChange={(e) => handleStepChange(step.id, 'name', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-white">Delay (days)</label>
              <input
                type="number"
                min="0"
                value={step.delayDays || 0}
                onChange={(e) => handleStepChange(step.id, 'delayDays', parseInt(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-white">Delay (hours)</label>
              <input
                type="number"
                min="0"
                max="23"
                value={step.delayHours || 0}
                onChange={(e) => handleStepChange(step.id, 'delayHours', parseInt(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        );
      case 'condition':
        return (
          <div className="p-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-white">Step Name</label>
              <input
                type="text"
                value={step.name || ''}
                onChange={(e) => handleStepChange(step.id, 'name', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-white">Condition Type</label>
              <select
                value={step.condition?.type || 'open'}
                onChange={(e) => handleStepChange(step.id, 'condition.type', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="open">Email Open</option>
                <option value="click">Email Click</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            {step.condition?.type === 'custom' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-white">Custom Condition</label>
                <input
                  type="text"
                  value={step.condition.value || ''}
                  onChange={(e) => handleStepChange(step.id, 'condition.value', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            )}
            
            <div className="mt-6 border-t border-gray-700 pt-4">
              <h4 className="text-base font-medium text-white mb-2">Branching Logic</h4>
              <p className="text-sm text-gray-400 mb-4">
                Configure what happens after this condition is evaluated
              </p>
              
              <div className="bg-green-900/30 p-4 rounded-md mb-4 border border-green-700">
                <div className="flex items-center mb-2">
                  <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                  <h5 className="text-sm font-medium text-green-300">If condition is true (Yes)</h5>
                </div>
                <select
                  value={step.nextSteps?.yes || ''}
                  onChange={(e) => handleStepChange(step.id, 'nextSteps.yes', e.target.value)}
                  className="mt-1 block w-full rounded-md border-green-700 bg-gray-800 text-white shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
                >
                  <option value="">Continue to next step in sequence</option>
                  {automation.steps
                    .filter(s => s.id !== step.id)
                    .map(s => (
                      <option key={s.id} value={s.id}>
                        Go to: {s.name || `Step ${s.order + 1}`}
                      </option>
                    ))
                  }
                  <option value="exit">Exit automation</option>
                </select>
              </div>
              
              <div className="bg-red-900/30 p-4 rounded-md border border-red-700">
                <div className="flex items-center mb-2">
                  <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                  <h5 className="text-sm font-medium text-red-300">If condition is false (No)</h5>
                </div>
                <select
                  value={step.nextSteps?.no || ''}
                  onChange={(e) => handleStepChange(step.id, 'nextSteps.no', e.target.value)}
                  className="mt-1 block w-full rounded-md border-red-700 bg-gray-800 text-white shadow-sm focus:border-red-500 focus:ring-red-500 text-sm"
                >
                  <option value="">Continue to next step in sequence</option>
                  {automation.steps
                    .filter(s => s.id !== step.id)
                    .map(s => (
                      <option key={s.id} value={s.id}>
                        Go to: {s.name || `Step ${s.order + 1}`}
                      </option>
                    ))
                  }
                  <option value="exit">Exit automation</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 'action':
        return (
          <div className="p-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-white">Step Name</label>
              <input
                type="text"
                value={step.name || ''}
                onChange={(e) => handleStepChange(step.id, 'name', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-white">Action Type</label>
              <select
                value={step.action?.type || 'tag'}
                onChange={(e) => handleStepChange(step.id, 'action.type', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="tag">Tag Contact</option>
                <option value="notify">Send Notification</option>
                <option value="update">Update Contact</option>
                <option value="webhook">Call Webhook</option>
              </select>
            </div>

            {step.action?.type === 'tag' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-white">Tag Name</label>
                <input
                  type="text"
                  value={step.action?.value || ''}
                  onChange={(e) => handleStepChange(step.id, 'action.value', e.target.value)}
                  placeholder="Enter tag name"
                  className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            )}

            {step.action?.type === 'notify' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-white">Notification Message</label>
                <textarea
                  value={step.action?.value || ''}
                  onChange={(e) => handleStepChange(step.id, 'action.value', e.target.value)}
                  rows={3}
                  placeholder="Enter notification message"
                  className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            )}

            {step.action?.type === 'update' && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-white">Field Name</label>
                  <select
                    value={step.action?.fieldName || ''}
                    onChange={(e) => handleStepChange(step.id, 'action.fieldName', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">Select a field</option>
                    <option value="firstName">First Name</option>
                    <option value="lastName">Last Name</option>
                    <option value="email">Email</option>
                    <option value="status">Status</option>
                    <option value="custom">Custom Field</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-white">Field Value</label>
                  <input
                    type="text"
                    value={step.action?.fieldValue || ''}
                    onChange={(e) => handleStepChange(step.id, 'action.fieldValue', e.target.value)}
                    placeholder="Enter field value"
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </>
            )}

            {step.action?.type === 'webhook' && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-white">Webhook URL</label>
                  <input
                    type="text"
                    value={step.action?.webhookUrl || ''}
                    onChange={(e) => handleStepChange(step.id, 'action.webhookUrl', e.target.value)}
                    placeholder="https://example.com/webhook"
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-white">Method</label>
                  <select
                    value={step.action?.webhookMethod || 'POST'}
                    onChange={(e) => handleStepChange(step.id, 'action.webhookMethod', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-white">Headers (JSON)</label>
                  <textarea
                    value={step.action?.webhookHeaders ? JSON.stringify(step.action.webhookHeaders, null, 2) : '{}'}
                    onChange={(e) => {
                      try {
                        const headers = JSON.parse(e.target.value);
                        handleStepChange(step.id, 'action.webhookHeaders', headers);
                      } catch (error) {
                        // Don't update if invalid JSON
                      }
                    }}
                    rows={3}
                    placeholder={'{\n  "Content-Type": "application/json"\n}'}
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-white">Body (JSON)</label>
                  <textarea
                    value={step.action?.webhookBody || ''}
                    onChange={(e) => handleStepChange(step.id, 'action.webhookBody', e.target.value)}
                    rows={5}
                    placeholder={'{\n  "contact": "{{contact.email}}",\n  "event": "automation_step"\n}'}
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    You can use variables like {'{{contact.email}}'}, {'{{contact.firstName}}'}, etc.
                  </p>
                </div>
              </>
            )}

          </div>
        );
      default:
        return <div className="p-4">Unknown step type</div>;
    }
  };

  const renderTriggerEditor = () => {
    return (
      <div className="p-4 border-t border-gray-700">
        <h3 className="text-lg font-medium text-white mb-4">Triggers</h3>
        {automation.triggers?.map((trigger, index) => (
          <div key={index} className="mb-4 p-4 border border-gray-700 rounded-md">
            <div className="mb-2">
              <label className="block text-sm font-medium text-white">Trigger Type</label>
              <select
                value={trigger.type}
                onChange={(e) => {
                  const updatedTriggers = [...(automation.triggers || [])];
                  updatedTriggers[index] = { ...updatedTriggers[index], type: e.target.value as any };
                  setAutomation(prev => ({ ...prev, triggers: updatedTriggers }));
                }}
                className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="manual">Manual</option>
                <option value="scheduled">Scheduled</option>
                <option value="event">Event Based</option>
                <option value="form_submission">Form Submission</option>
                <option value="api_trigger">API Trigger</option>
              </select>
            </div>
            
            {trigger.type === 'scheduled' && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white">Frequency</label>
                  <select
                    value={trigger.config?.schedule?.frequency || 'daily'}
                    onChange={(e) => {
                      const updatedTriggers = [...(automation.triggers || [])];
                      updatedTriggers[index] = { 
                        ...updatedTriggers[index],
                        config: {
                          ...updatedTriggers[index].config,
                          schedule: {
                            ...updatedTriggers[index].config?.schedule,
                            frequency: e.target.value as any
                          }
                        }
                      };
                      setAutomation(prev => ({ ...prev, triggers: updatedTriggers }));
                    }}
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white">Time</label>
                  <input
                    type="time"
                    value={trigger.config?.schedule?.time || '09:00'}
                    onChange={(e) => {
                      const updatedTriggers = [...(automation.triggers || [])];
                      updatedTriggers[index] = { 
                        ...updatedTriggers[index],
                        config: {
                          ...updatedTriggers[index].config,
                          schedule: {
                            ...updatedTriggers[index].config?.schedule,
                            time: e.target.value
                          }
                        }
                      };
                      setAutomation(prev => ({ ...prev, triggers: updatedTriggers }));
                    }}
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                
                {trigger.config?.schedule?.frequency === 'weekly' && (
                  <div>
                    <label className="block text-sm font-medium text-white">Days</label>
                    <div className="mt-2 grid grid-cols-7 gap-2">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                        const dayLower = day.toLowerCase();
                        const isSelected = trigger.config?.schedule?.days?.includes(dayLower);
                        
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              const updatedTriggers = [...(automation.triggers || [])];
                              const currentDays = updatedTriggers[index].config?.schedule?.days || [];
                              const updatedDays = isSelected
                                ? currentDays.filter(d => d !== dayLower)
                                : [...currentDays, dayLower];
                              
                              updatedTriggers[index] = { 
                                ...updatedTriggers[index],
                                config: {
                                  ...updatedTriggers[index].config,
                                  schedule: {
                                    ...updatedTriggers[index].config?.schedule,
                                    days: updatedDays
                                  }
                                }
                              };
                              setAutomation(prev => ({ ...prev, triggers: updatedTriggers }));
                            }}
                            className={`p-2 text-xs font-medium rounded-md ${
                              isSelected
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-700 text-gray-400 hover:bg-gray-800'
                            }`}
                          >
                            {day.substring(0, 1)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {trigger.type === 'event' && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white">Event Type</label>
                  <select
                    value={trigger.config?.event?.eventType || 'signup'}
                    onChange={(e) => {
                      const updatedTriggers = [...(automation.triggers || [])];
                      updatedTriggers[index] = { 
                        ...updatedTriggers[index],
                        config: {
                          ...updatedTriggers[index].config,
                          event: {
                            ...updatedTriggers[index].config?.event,
                            eventType: e.target.value
                          }
                        }
                      };
                      setAutomation(prev => ({ ...prev, triggers: updatedTriggers }));
                    }}
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="signup">Sign Up</option>
                    <option value="purchase">Purchase</option>
                    <option value="page_visit">Page Visit</option>
                    <option value="custom">Custom Event</option>
                  </select>
                </div>
              </div>
            )}
            
            {trigger.type === 'form_submission' && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white">Form ID</label>
                  <input
                    type="text"
                    value={trigger.config?.form?.formId || ''}
                    onChange={(e) => {
                      const updatedTriggers = [...(automation.triggers || [])];
                      updatedTriggers[index] = { 
                        ...updatedTriggers[index],
                        config: {
                          ...updatedTriggers[index].config,
                          form: {
                            ...updatedTriggers[index].config?.form,
                            formId: e.target.value
                          }
                        }
                      };
                      setAutomation(prev => ({ ...prev, triggers: updatedTriggers }));
                    }}
                    placeholder="Enter your form ID"
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            )}
            
            {trigger.type === 'api_trigger' && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white">Webhook Key</label>
                  <div className="flex mt-1">
                    <input
                      type="text"
                      value={trigger.config?.api?.webhookKey || generateWebhookKey()}
                      readOnly
                      className="flex-1 rounded-l-md border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updatedTriggers = [...(automation.triggers || [])];
                        updatedTriggers[index] = { 
                          ...updatedTriggers[index],
                          config: {
                            ...updatedTriggers[index].config,
                            api: {
                              webhookKey: generateWebhookKey()
                            }
                          }
                        };
                        setAutomation(prev => ({ ...prev, triggers: updatedTriggers }));
                      }}
                      className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-700 rounded-r-md bg-gray-700 text-gray-300 sm:text-sm hover:bg-gray-800"
                    >
                      Regenerate
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    Use this key in your API calls to trigger this automation
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
        <button
          onClick={() => {
            setAutomation(prev => ({
              ...prev,
              triggers: [...(prev.triggers || []), { type: 'manual' }]
            }))
          }}
          className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusCircleIcon className="h-4 w-4 mr-1" /> Add Trigger
        </button>
      </div>
    );
  };

  // Helper function to generate a random webhook key
  const generateWebhookKey = () => {
    return `wh_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  };

  return (
    <div className="bg-primary-bg min-h-screen">
      <SimpleNavigation />
      
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Add the AutomationTabs component */}
        {automation.id && <AutomationTabs automationId={automation.id} />}
        
        <div className="flex-1 overflow-y-auto p-8">
          <div className="mb-6 flex justify-between">
            <div>
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<ArrowLeftIcon className="h-5 w-5" />}
                  onClick={() => navigate('/automations')}
                >
                  Back to Automations
                </Button>
              </div>
              <h1 className="text-2xl font-bold text-white mt-2">
                {automation.id ? 'Edit Automation' : 'Create New Automation'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="primary"
                size="md"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label htmlFor="automation-name" className="block text-sm font-medium text-white mb-1">
                  Name
                </label>
                <input
                  id="automation-name"
                  type="text"
                  value={automation.name || ''}
                  onChange={(e) => setAutomation(prev => ({ ...prev, name: e.target.value }))}
                  className="block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="automation-description" className="block text-sm font-medium text-white mb-1">
                  Description
                </label>
                <input
                  id="automation-description"
                  type="text"
                  value={automation.description || ''}
                  onChange={(e) => setAutomation(prev => ({ ...prev, description: e.target.value }))}
                  className="block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
          
          {error && (
            <div className="mb-6 rounded-md bg-red-900/30 p-4 border-l-4 border-red-400">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {successMessage && (
            <div className="mb-6 rounded-md bg-green-900/30 p-4 border-l-4 border-green-400">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-green-300">{successMessage}</p>
                </div>
              </div>
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="flex bg-secondary-bg rounded-lg shadow overflow-hidden">
              {/* Step sidebar */}
              <div className="w-72 bg-gray-800 border-r border-gray-700 overflow-y-auto">
                <div className="p-4">
                  <div className="flex justify-between mb-4">
                    <h2 className="text-lg font-medium text-white">Automation Steps</h2>
                    <div className="flex">
                      <button
                        onClick={() => setIsReordering(!isReordering)}
                        className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-700"
                        title={isReordering ? "Exit reordering mode" : "Reorder steps"}
                      >
                        <ArrowsUpDownIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  {automation.steps.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 bg-gray-800 rounded-md border border-gray-700">
                      <p className="text-sm">No steps added yet</p>
                      <p className="text-sm mt-1">Create your first step below</p>
                    </div>
                  ) : (
                    <ul className="space-y-2 mb-4">
                      {automation.steps.map((step) => (
                        <li
                          key={step.id}
                          className={`p-3 rounded-md cursor-pointer border ${
                            activeStep === step.id ? 'bg-indigo-900/40 border-indigo-700' : 'border-gray-700 hover:bg-gray-700'
                          } transition-colors duration-150`}
                          onClick={() => setActiveStep(step.id)}
                          draggable={isReordering}
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', step.id);
                            setDraggedStepId(step.id);
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            const draggedId = e.dataTransfer.getData('text/plain');
                            if (draggedId && draggedId !== step.id) {
                              const draggedIndex = automation.steps.findIndex(s => s.id === draggedId);
                              const targetIndex = automation.steps.findIndex(s => s.id === step.id);
                              
                              const updatedSteps = [...automation.steps];
                              const [draggedStep] = updatedSteps.splice(draggedIndex, 1);
                              updatedSteps.splice(targetIndex, 0, draggedStep);
                              
                              // Update order property
                              const reorderedSteps = updatedSteps.map((s, idx) => ({
                                ...s,
                                order: idx
                              }));
                              
                              setAutomation(prev => ({
                                ...prev,
                                steps: reorderedSteps
                              }));
                            }
                          }}
                        >
                          <div className="flex items-center">
                            <span className={`w-3 h-3 rounded-full mr-3 flex-shrink-0 ${
                              step.type === 'email' ? 'bg-blue-500' : 
                              step.type === 'delay' ? 'bg-yellow-500' : 
                              step.type === 'condition' ? 'bg-purple-500' : 
                              'bg-green-500'
                            }`}></span>
                            <span className="flex-1 text-sm font-medium truncate">{step.name || `Step ${step.order + 1}`}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteStep(step.id);
                              }}
                              className="ml-2 text-gray-400 hover:text-red-500 p-1 rounded hover:bg-gray-700"
                              aria-label="Delete step"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2 mt-6">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleAddStep('email')}
                      className="bg-blue-900/30 text-blue-300 border-blue-700 hover:bg-blue-900/50"
                      icon={<PlusCircleIcon className="h-4 w-4 mr-1" />}
                    >
                      Email
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleAddStep('delay')}
                      className="bg-yellow-900/30 text-yellow-300 border-yellow-700 hover:bg-yellow-900/50"
                      icon={<PlusCircleIcon className="h-4 w-4 mr-1" />}
                    >
                      Delay
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleAddStep('condition')}
                      className="bg-purple-900/30 text-purple-300 border-purple-700 hover:bg-purple-900/50"
                      icon={<PlusCircleIcon className="h-4 w-4 mr-1" />}
                    >
                      Condition
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleAddStep('action')}
                      className="bg-green-900/30 text-green-300 border-green-700 hover:bg-green-900/50"
                      icon={<PlusCircleIcon className="h-4 w-4 mr-1" />}
                    >
                      Action
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Step editor */}
              <div className="flex-1 overflow-y-auto">
                <div className="border-b border-gray-700 bg-secondary-bg">
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-white">
                      {getActiveStep() ? `Edit ${getActiveStep()?.type} step` : 'Select a step to edit'}
                    </h3>
                  </div>
                </div>
                
                <div className="p-6">
                  {renderStepEditor()}
                  {renderTriggerEditor()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutomationBuilder; 