import React from 'react';

import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom';

import { ArrowLeftIcon } from '@heroicons/react/24/outline';

import Navigation from '../components/Navigation';
import TemplateEditor from '../components/TemplateEditor';

const TemplateEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';
  
  const handleSaveSuccess = () => {
    // Show success toast or notification
    navigate('/templates');
  };
  
  return (
    <div className="min-h-screen bg-primary-bg">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/templates" className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-4">
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Templates
          </Link>
          
          <h1 className="text-3xl font-bold text-white">
            {isNew ? 'Create New Template' : 'Edit Template'}
          </h1>
          <p className="mt-1 text-gray-400">
            {isNew 
              ? 'Create a new email sequence template for your campaigns'
              : 'Modify your existing template to suit your needs'
            }
          </p>
        </div>
        
        <TemplateEditor 
          templateId={!isNew ? id : undefined}
          onSave={handleSaveSuccess}
        />
      </main>
    </div>
  );
};

export default TemplateEdit; 