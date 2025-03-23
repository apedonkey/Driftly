import React, {
  useEffect,
  useState,
} from 'react';

import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  ArrowLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';

import Navigation from '../components/Navigation';
import { templateService } from '../services/api';

interface TemplateStep {
  order: number;
  subject: string;
  body: string;
  delayDays: number;
  delayHours: number;
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: TemplateStep[];
}

const TemplateDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  
  useEffect(() => {
    const fetchTemplate = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await templateService.getTemplate(id);
        
        if (response && response.success && response.data) {
          // Sort steps by order
          const templateData = response.data;
          templateData.steps = templateData.steps.sort((a: TemplateStep, b: TemplateStep) => a.order - b.order);
          setTemplate(templateData);
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
  }, [id]);
  
  // Format delay time
  const formatDelay = (days: number, hours: number) => {
    if (days === 0 && hours === 0) {
      return 'Immediately';
    }
    
    const parts = [];
    if (days > 0) {
      parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
    }
    
    if (hours > 0) {
      parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
    }
    
    return parts.join(' and ');
  };
  
  // Render HTML content
  const renderHtml = (html: string) => {
    return { __html: html };
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-primary-bg">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-blue"></div>
          </div>
        </main>
      </div>
    );
  }
  
  if (error || !template) {
    return (
      <div className="min-h-screen bg-primary-bg">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link to="/templates" className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-4">
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back to Templates
            </Link>
          </div>
          
          <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded-md">
            {error || 'Template not found'}
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-primary-bg">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/templates" className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-4">
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Templates
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center">
                <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-gray-700 text-gray-300 mr-2">
                  {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                </span>
                <span className="text-gray-400 text-sm">
                  {template.steps.length} {template.steps.length === 1 ? 'email' : 'emails'}
                </span>
              </div>
              
              <h1 className="text-3xl font-bold text-white mt-2">{template.name}</h1>
              <p className="mt-1 text-gray-400">{template.description}</p>
            </div>
            
            <div className="mt-4 md:mt-0 flex space-x-4">
              <Link
                to={`/flow-builder?template=${template.id}`}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue"
              >
                Use Template
              </Link>
              
              <Link
                to={`/templates/edit/${template.id}`}
                className="inline-flex items-center px-4 py-2 border border-gray-700 rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Edit Template
              </Link>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Email steps sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-secondary-bg rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-700">
                <h2 className="text-lg font-medium text-white">Email Steps</h2>
              </div>
              
              <div className="p-2">
                {template.steps.map((step, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveStep(index)}
                    className={`w-full text-left px-4 py-3 rounded-md mb-2 flex items-center justify-between ${
                      activeStep === index
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-300 hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center mr-3 text-xs">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium truncate max-w-[180px]">{step.subject}</p>
                        <div className="flex items-center text-xs text-gray-400 mt-1">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          <span>
                            {index === 0 
                              ? 'Immediately' 
                              : `After ${formatDelay(step.delayDays, step.delayHours)}`}
                          </span>
                        </div>
                      </div>
                    </div>
                    {activeStep === index && <ChevronRightIcon className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Email preview */}
          <div className="lg:col-span-3">
            <div className="bg-secondary-bg rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium text-white">
                    {template.steps[activeStep].subject}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {activeStep === 0 
                      ? 'Sent immediately' 
                      : `Sent ${formatDelay(template.steps[activeStep].delayDays, template.steps[activeStep].delayHours)} after previous email`}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                    disabled={activeStep === 0}
                    className={`p-1 rounded ${
                      activeStep === 0 ? 'text-gray-600' : 'text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setActiveStep(Math.min(template.steps.length - 1, activeStep + 1))}
                    disabled={activeStep === template.steps.length - 1}
                    className={`p-1 rounded ${
                      activeStep === template.steps.length - 1 ? 'text-gray-600' : 'text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Subject Line
                  </label>
                  <div className="px-3 py-2 border border-gray-700 bg-gray-800 rounded-md text-white">
                    {template.steps[activeStep].subject}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Email Content
                  </label>
                  <div className="border border-gray-700 rounded-md overflow-hidden">
                    <div className="bg-white p-6 min-h-[300px] overflow-auto">
                      <div 
                        dangerouslySetInnerHTML={renderHtml(template.steps[activeStep].body)} 
                        className="text-gray-800"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TemplateDetail; 