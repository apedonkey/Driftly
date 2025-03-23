import React, {
  useEffect,
  useState,
} from 'react';

import { Link } from 'react-router-dom';

import {
  ArrowLeftIcon,
  DocumentDuplicateIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

import Navigation from '../components/Navigation';
import { templateService } from '../services/api';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  tags?: string[];
  steps: {
    order: number;
    subject: string;
    body: string;
    delayDays: number;
    delayHours: number;
  }[];
}

const categoryLabels: Record<string, string> = {
  'welcome': 'Welcome',
  'onboarding': 'Onboarding',
  'sales': 'Sales',
  'follow-up': 'Follow-up',
  're-engagement': 'Re-engagement',
  'promotional': 'Promotional',
  'educational': 'Educational',
  'events': 'Events',
  'custom': 'Custom'
};

const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'welcome':
      return 'bg-emerald-100 text-emerald-800';
    case 'onboarding':
      return 'bg-sky-100 text-sky-800';
    case 'sales':
      return 'bg-amber-100 text-amber-800';
    case 'follow-up':
      return 'bg-indigo-100 text-indigo-800';
    case 're-engagement':
      return 'bg-rose-100 text-rose-800';
    case 'promotional':
      return 'bg-purple-100 text-purple-800';
    case 'educational':
      return 'bg-teal-100 text-teal-800';
    case 'events':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const Templates: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  
  // Filters
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // All unique tags from templates
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  
  // Load templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch templates
        const response = await templateService.getTemplates();
        
        if (response && response.success) {
          setTemplates(response.data || []);
          
          // Extract unique tags from all templates
          const tags = response.data.flatMap((template: Template) => template.tags || []);
          // Use Array.filter for uniqueness instead of Set to avoid TS2802 error
          const uniqueTags = tags.filter((tag: string, index: number, self: string[]) => 
            self.indexOf(tag) === index
          );
          setAvailableTags(uniqueTags);
        } else {
          setError('Failed to load templates');
        }
      } catch (err) {
        console.error('Error fetching templates:', err);
        setError('Failed to load templates. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTemplates();
  }, []);
  
  // Delete a template
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }
    
    try {
      setDeleting(id);
      
      const response = await templateService.deleteTemplate(id);
      
      if (response && response.success) {
        // Remove the deleted template from state
        setTemplates(templates.filter(template => template.id !== id));
      } else {
        setError('Failed to delete template');
      }
    } catch (err) {
      console.error('Error deleting template:', err);
      setError('Failed to delete template. Please try again later.');
    } finally {
      setDeleting(null);
    }
  };
  
  // Handle category filter click
  const handleCategoryFilter = (category: string) => {
    setActiveCategory(category);
  };
  
  // Handle tag filter click
  const handleTagFilter = (tag: string) => {
    setActiveTag(tag === activeTag ? null : tag);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setActiveCategory('all');
    setActiveTag(null);
    setSearchTerm('');
  };
  
  // Check if any filters are active
  const hasActiveFilters = activeCategory !== 'all' || activeTag !== null || searchTerm !== '';

  // Filter templates based on category, tag, and search term
  const filteredTemplates = React.useMemo(() => {
    if (!templates || !Array.isArray(templates)) {
      return [];
    }
    
    return templates.filter(template => {
      // Category filter
      const matchesCategory = 
        activeCategory === 'all' || 
        (template.category && template.category.toLowerCase() === activeCategory.toLowerCase());
      
      // Tag filter
      const matchesTag = 
        !activeTag || 
        (template.tags && template.tags.includes(activeTag));
      
      // Search filter
      const matchesSearch = 
        searchTerm === '' || 
        (template.name && template.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (template.description && template.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesCategory && matchesTag && matchesSearch;
    });
  }, [templates, activeCategory, activeTag, searchTerm]);

  return (
    <div className="min-h-screen bg-primary-bg">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <Link to="/" className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-4">
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
            
            <h1 className="text-3xl font-bold text-white">Template Library</h1>
            <p className="mt-1 text-gray-400">Choose from our pre-built email sequences or create your own</p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Link 
              to="/templates/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Create Template
            </Link>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-grow">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-md border-0 bg-gray-800 py-2 pl-10 pr-3 text-white placeholder:text-gray-400 focus:ring-accent-blue sm:text-sm"
                placeholder="Search templates..."
              />
            </div>
            
            {/* Filter Toggle */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-700 rounded-md text-sm font-medium text-white bg-transparent hover:bg-gray-700"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 flex h-2 w-2 rounded-full bg-accent-blue"></span>
              )}
            </button>
            
            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center px-4 py-2 border border-gray-700 rounded-md text-sm font-medium text-white bg-transparent hover:bg-gray-700"
              >
                <XMarkIcon className="h-4 w-4 mr-2" />
                Clear Filters
              </button>
            )}
          </div>
          
          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-3 p-4 bg-secondary-bg rounded-md">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-white mb-2">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    className={`px-3 py-1 text-xs rounded-full ${
                      activeCategory === 'all' 
                        ? 'bg-accent-blue text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    onClick={() => handleCategoryFilter('all')}
                  >
                    All Categories
                  </button>
                  {Object.keys(categoryLabels).map(category => (
                    <button
                      key={category}
                      className={`px-3 py-1 text-xs rounded-full ${
                        activeCategory === category 
                          ? 'bg-accent-blue text-white' 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                      onClick={() => handleCategoryFilter(category)}
                    >
                      {categoryLabels[category]}
                    </button>
                  ))}
                </div>
              </div>
              
              {availableTags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-white mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map(tag => (
                      <button
                        key={tag}
                        className={`px-3 py-1 text-xs rounded-full ${
                          activeTag === tag 
                            ? 'bg-accent-blue text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                        onClick={() => handleTagFilter(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded-md">
            {error}
          </div>
        )}
        
        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-blue"></div>
          </div>
        ) : (
          <div>
            {/* No templates found message */}
            {filteredTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <DocumentDuplicateIcon className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-white mb-1">No templates found</h3>
                <p className="text-gray-400 mb-6 max-w-md">
                  {hasActiveFilters 
                    ? 'No templates match your current filters. Try adjusting your search or filters.' 
                    : 'You haven\'t created any templates yet. Get started by creating your first template.'}
                </p>
                {hasActiveFilters ? (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center px-4 py-2 border border-gray-700 rounded-md text-sm font-medium text-white bg-transparent hover:bg-gray-700"
                  >
                    Clear Filters
                  </button>
                ) : (
                  <Link 
                    to="/templates/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Create Template
                  </Link>
                )}
              </div>
            ) : (
              /* Template Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map(template => (
                  <div 
                    key={template.id} 
                    className="bg-secondary-bg rounded-lg overflow-hidden border border-gray-700 hover:border-gray-500 transition-colors"
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getCategoryColor(template.category)}`}>
                              {categoryLabels[template.category] || 'Custom'}
                            </span>
                            <span className="ml-2 text-sm text-gray-400">
                              {template.steps.length} {template.steps.length === 1 ? 'step' : 'steps'}
                            </span>
                          </div>
                          <h3 className="text-white text-lg font-medium truncate">
                            {template.name}
                          </h3>
                        </div>
                        <div className="flex ml-4">
                          <Link
                            to={`/templates/edit/${template.id}`}
                            className="text-gray-400 hover:text-white p-1"
                            title="Edit"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(template.id)}
                            disabled={deleting === template.id}
                            className="text-gray-400 hover:text-red-500 p-1 ml-1"
                            title="Delete"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                        {template.description || 'No description provided'}
                      </p>
                      
                      {/* Tags */}
                      {template.tags && template.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {template.tags.map(tag => (
                            <span 
                              key={tag}
                              className="inline-flex items-center rounded-full bg-accent-blue/20 px-2 py-0.5 text-xs font-medium text-accent-blue"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <Link
                        to={`/templates/${template.id}`}
                        className="inline-flex items-center text-accent-blue hover:text-blue-400 text-sm font-medium"
                      >
                        View Details
                        <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Templates;
