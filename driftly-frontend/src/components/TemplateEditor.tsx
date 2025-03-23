import React, {
  useEffect,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

import {
  ArrowDownIcon,
  ArrowUpIcon,
  DocumentDuplicateIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

import { templateService } from '../services/api';
import EmailPreview from './EmailPreview';
import RichTextEditor from './RichTextEditor';
import TemplateTags from './TemplateTags';
import TrackingPixelManager from './TrackingPixelManager';

interface EditorProps {
  templateId?: string;
  onSave?: (template: any) => void;
  onCancel?: () => void;
}

interface TemplateStep {
  order: number;
  subject: string;
  body: string;
  delayDays: number;
  delayHours: number;
}

const TemplateEditor: React.FC<EditorProps> = ({ templateId, onSave, onCancel }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isNew, setIsNew] = useState<boolean>(!templateId);
  const [activeStep, setActiveStep] = useState<number>(0);
  
  // Template data
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [steps, setSteps] = useState<TemplateStep[]>([
    {
      order: 0,
      subject: '',
      body: '',
      delayDays: 0,
      delayHours: 0
    }
  ]);
  
  // Tracking data
  const [showTracking, setShowTracking] = useState<boolean>(false);
  const [trackingPixel, setTrackingPixel] = useState<string>('');

  // Load template data if editing an existing template
  useEffect(() => {
    if (templateId) {
      const fetchTemplate = async () => {
        try {
          setLoading(true);
          setError(null);
          
          // Fetch the template
          const response = await templateService.getTemplate(templateId);
          
          if (response && response.success && response.data) {
            const template = response.data;
            
            // Set template data
            setName(template.name);
            setDescription(template.description || '');
            setCategory(template.category || '');
            setTags(template.tags || []);
            
            // Sort steps by order
            const sortedSteps = [...template.steps].sort((a, b) => a.order - b.order);
            setSteps(sortedSteps);
          } else {
            setError('Failed to load template. Invalid response format.');
          }
        } catch (err) {
          console.error('Error fetching template:', err);
          setError('Failed to load template. Please try again later.');
        } finally {
          setLoading(false);
        }
      };
      
      fetchTemplate();
    }
  }, [templateId]);

  // Add a new step
  const addStep = () => {
    const newOrder = steps.length;
    const newStep: TemplateStep = {
      order: newOrder,
      subject: '',
      body: '',
      delayDays: 0,
      delayHours: 0
    };
    
    setSteps([...steps, newStep]);
    // Set the new step as active
    setActiveStep(newOrder);
  };

  // Remove a step
  const removeStep = (index: number) => {
    if (steps.length <= 1) {
      // Don't allow removing the last step
      return;
    }
    
    const newSteps = steps.filter((_, i) => i !== index);
    
    // Update order values
    newSteps.forEach((step, i) => {
      step.order = i;
    });
    
    setSteps(newSteps);
    
    // Update active step if necessary
    if (activeStep >= newSteps.length) {
      setActiveStep(Math.max(0, newSteps.length - 1));
    } else if (activeStep === index) {
      setActiveStep(Math.max(0, activeStep - 1));
    }
  };

  // Move a step up
  const moveStepUp = (index: number) => {
    if (index <= 0) return;
    
    const newSteps = [...steps];
    const temp = newSteps[index];
    newSteps[index] = newSteps[index - 1];
    newSteps[index - 1] = temp;
    
    // Update order values
    newSteps.forEach((step, i) => {
      step.order = i;
    });
    
    setSteps(newSteps);
    
    // Update active step if necessary
    if (activeStep === index) {
      setActiveStep(index - 1);
    } else if (activeStep === index - 1) {
      setActiveStep(index);
    }
  };

  // Move a step down
  const moveStepDown = (index: number) => {
    if (index >= steps.length - 1) return;
    
    const newSteps = [...steps];
    const temp = newSteps[index];
    newSteps[index] = newSteps[index + 1];
    newSteps[index + 1] = temp;
    
    // Update order values
    newSteps.forEach((step, i) => {
      step.order = i;
    });
    
    setSteps(newSteps);
    
    // Update active step if necessary
    if (activeStep === index) {
      setActiveStep(index + 1);
    } else if (activeStep === index + 1) {
      setActiveStep(index);
    }
  };

  // Duplicate a step
  const duplicateStep = (index: number) => {
    const stepToDuplicate = steps[index];
    const newStep: TemplateStep = {
      ...stepToDuplicate,
      order: steps.length
    };
    
    const newSteps = [...steps, newStep];
    
    setSteps(newSteps);
    // Set the new step as active
    setActiveStep(newSteps.length - 1);
  };

  // Update a field in a step
  const updateStepField = (index: number, field: keyof TemplateStep, value: any) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  // Insert tracking pixel into email body
  const insertTrackingPixel = (index: number, trackingPixelHtml: string) => {
    setTrackingPixel(trackingPixelHtml);
    setShowTracking(true);
  };

  // Insert tracked link into the editor
  const insertTrackedLink = (index: number, trackedLink: string) => {
    // This will depend on how you implement the rich text editor
    // For now, we'll just provide a popup with the link for manual insertion
    const linkText = window.prompt('Enter link text:', 'Click here');
    if (linkText) {
      const linkHtml = `<a href="${trackedLink}">${linkText}</a>`;
      alert('Copy this tracked link HTML to your clipboard and paste it in the editor:\n\n' + linkHtml);
    }
  };

  // Save the template
  const saveTemplate = async () => {
    if (!name.trim()) {
      setError('Template name is required');
      return;
    }
    
    if (steps.some(step => !step.subject.trim())) {
      setError('All steps must have a subject');
      return;
    }
    
    if (steps.some(step => !step.body.trim())) {
      setError('All steps must have content');
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      const templateData = {
        name,
        description,
        category,
        tags,
        steps
      };
      
      let response;
      
      if (isNew) {
        response = await templateService.createTemplate(templateData);
      } else {
        response = await templateService.updateTemplate(templateId!, templateData);
      }
      
      if (response && response.success) {
        if (onSave) {
          onSave(response.data);
        } else {
          // Navigate back to templates list
          navigate('/templates');
        }
      } else {
        setError('Failed to save template. Please try again.');
      }
    } catch (err) {
      console.error('Error saving template:', err);
      setError('Failed to save template. Please try again later.');
    } finally {
      setSaving(false);
    }
  };

  // Preview HTML
  const previewHtml = (html: string) => {
    // You can implement a preview modal or panel here
    console.log('Previewing HTML:', html);
  };

  // Handle cancel
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      // Navigate back to templates list
      navigate('/templates');
    }
  };

  // Step tabs component
  const StepTabs = () => (
    <div className="flex overflow-x-auto space-x-2 py-2 mb-4 border-b border-gray-700">
      {steps.map((step, index) => (
        <button
          key={index}
          className={`px-4 py-2 text-sm rounded-t-md whitespace-nowrap ${
            activeStep === index
              ? 'bg-accent-blue text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
          onClick={() => setActiveStep(index)}
        >
          {step.subject ? (
            <>Email {index + 1}: {step.subject.substring(0, 20)}{step.subject.length > 20 ? '...' : ''}</>
          ) : (
            <>Email {index + 1}</>
          )}
        </button>
      ))}
      <button
        className="px-4 py-2 text-sm bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-t-md flex items-center"
        onClick={addStep}
      >
        <PlusIcon className="w-4 h-4 mr-1" />
        Add Step
      </button>
    </div>
  );

  // Step editor component
  const TemplateStepEditor = ({ step, index }: { step: TemplateStep, index: number }) => (
    <div className="mb-8">
      {/* Step editor header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-medium text-white">Step {index + 1}</h3>
        <div className="flex space-x-2">
          <button
            disabled={index === 0}
            onClick={() => moveStepUp(index)}
            className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            title="Move Up"
          >
            <ArrowUpIcon className="w-5 h-5" />
          </button>
          <button
            disabled={index === steps.length - 1}
            onClick={() => moveStepDown(index)}
            className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            title="Move Down"
          >
            <ArrowDownIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => duplicateStep(index)}
            className="p-1 text-gray-400 hover:text-white"
            title="Duplicate"
          >
            <DocumentDuplicateIcon className="w-5 h-5" />
          </button>
          <button
            disabled={steps.length <= 1}
            onClick={() => removeStep(index)}
            className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            title="Remove"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Subject field */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Subject Line
        </label>
        <input
          type="text"
          value={step.subject}
          onChange={(e) => updateStepField(index, 'subject', e.target.value)}
          className="block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-accent-blue focus:border-accent-blue text-white"
          placeholder="Enter email subject line"
        />
      </div>

      {/* Delay settings */}
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Delay (Days)
          </label>
          <input
            type="number"
            min="0"
            value={step.delayDays}
            onChange={(e) => updateStepField(index, 'delayDays', parseInt(e.target.value) || 0)}
            className="block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-accent-blue focus:border-accent-blue text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Delay (Hours)
          </label>
          <input
            type="number"
            min="0"
            max="23"
            value={step.delayHours}
            onChange={(e) => updateStepField(index, 'delayHours', parseInt(e.target.value) || 0)}
            className="block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-accent-blue focus:border-accent-blue text-white"
          />
        </div>
      </div>

      {/* Rich text editor */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Email Content
        </label>
        <RichTextEditor
          value={step.body}
          onChange={(value) => updateStepField(index, 'body', value)}
        />
      </div>

      {/* Tracking Pixel Manager */}
      <div className="mb-6">
        <TrackingPixelManager
          flowId={templateId || 'new-template'}
          stepId={`step-${index}`}
          onInsertPixel={(pixelHtml) => insertTrackingPixel(index, pixelHtml)}
          onInsertLink={(link) => insertTrackedLink(index, link)}
        />
      </div>

      {/* Email Preview */}
      <EmailPreview
        subject={step.subject}
        content={step.body}
        showTracking={showTracking}
        trackingPixel={trackingPixel}
        flowId={templateId || 'new-template'}
        stepId={`step-${index}`}
      />
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-accent-blue"></div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      {/* Error display */}
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Template header fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Template Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-accent-blue focus:border-accent-blue text-white"
              placeholder="Enter template name"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-accent-blue focus:border-accent-blue text-white"
              placeholder="Enter template description"
            />
          </div>
        </div>
        
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-accent-blue focus:border-accent-blue text-white"
            >
              <option value="">Select a category</option>
              <option value="welcome">Welcome</option>
              <option value="onboarding">Onboarding</option>
              <option value="engagement">Engagement</option>
              <option value="sales">Sales</option>
              <option value="retention">Retention</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Tags
            </label>
            <TemplateTags
              selectedTags={tags}
              onChange={setTags}
            />
          </div>
        </div>
      </div>

      {/* Email steps section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Email Steps</h2>
        <StepTabs />
        {steps[activeStep] && <TemplateStepEditor step={steps[activeStep]} index={activeStep} />}
      </div>

      {/* Action buttons */}
      <div className="flex justify-end space-x-4 mt-8">
        <button
          onClick={handleCancel}
          className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-md focus:outline-none"
        >
          Cancel
        </button>
        <button
          onClick={saveTemplate}
          disabled={saving}
          className="px-6 py-3 bg-accent-blue hover:bg-blue-600 text-white rounded-md focus:outline-none disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : (isNew ? 'Create Template' : 'Update Template')}
        </button>
      </div>
    </div>
  );
};

export default TemplateEditor; 