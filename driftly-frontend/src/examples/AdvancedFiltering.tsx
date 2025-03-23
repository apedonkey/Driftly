import React from 'react';

import {
  AdjustmentsHorizontalIcon,
  FunnelIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

// This is an example file showing how to implement advanced filtering and search functionality
// to integrate with the ContactManager page

interface Contact {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status: string;
  tags: string[];
  createdAt?: string;
  lastActive?: string;
  stats: {
    emailsSent: number;
    emailsOpened: number;
    linksClicked: number;
  };
}

interface FilterCriteria {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface SavedFilter {
  id: string;
  name: string;
  criteria: FilterCriteria[];
}

export const AdvancedFilteringExample: React.FC = () => {
  // State variables to add to ContactManager.tsx
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = React.useState(false);
  const [filterCriteria, setFilterCriteria] = React.useState<FilterCriteria[]>([]);
  const [savedFilters, setSavedFilters] = React.useState<SavedFilter[]>([]);
  const [activeFilterId, setActiveFilterId] = React.useState<string | null>(null);
  const [saveFilterName, setSaveFilterName] = React.useState('');
  const [showSaveFilterForm, setShowSaveFilterForm] = React.useState(false);

  // Function to add a new filter criterion
  const addFilterCriterion = () => {
    const newCriterion: FilterCriteria = {
      id: Date.now().toString(),
      field: 'status',
      operator: 'equals',
      value: ''
    };
    setFilterCriteria([...filterCriteria, newCriterion]);
  };

  // Function to update a filter criterion
  const updateFilterCriterion = (id: string, field: string, value: string) => {
    setFilterCriteria(
      filterCriteria.map(criterion => 
        criterion.id === id ? { ...criterion, [field]: value } : criterion
      )
    );
  };

  // Function to remove a filter criterion
  const removeFilterCriterion = (id: string) => {
    setFilterCriteria(filterCriteria.filter(criterion => criterion.id !== id));
  };

  // Function to clear all filters
  const clearAllFilters = () => {
    setFilterCriteria([]);
    setSearchTerm('');
    setActiveFilterId(null);
  };

  // Function to save the current filter
  const saveCurrentFilter = () => {
    if (!saveFilterName.trim() || filterCriteria.length === 0) return;
    
    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: saveFilterName,
      criteria: [...filterCriteria]
    };
    
    setSavedFilters([...savedFilters, newFilter]);
    setActiveFilterId(newFilter.id);
    setSaveFilterName('');
    setShowSaveFilterForm(false);
  };

  // Function to apply a saved filter
  const applySavedFilter = (filterId: string) => {
    const filter = savedFilters.find(f => f.id === filterId);
    if (filter) {
      setFilterCriteria([...filter.criteria]);
      setActiveFilterId(filterId);
    }
  };

  // Function to delete a saved filter
  const deleteSavedFilter = (filterId: string) => {
    setSavedFilters(savedFilters.filter(f => f.id !== filterId));
    if (activeFilterId === filterId) {
      setActiveFilterId(null);
      setFilterCriteria([]);
    }
  };

  // Filter contacts based on criteria
  const filterContacts = (contacts: Contact[]) => {
    // First apply text search
    let filtered = contacts;
    
    if (searchTerm) {
      filtered = filtered.filter(contact => 
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Then apply advanced filter criteria
    if (filterCriteria.length > 0) {
      filtered = filtered.filter(contact => {
        return filterCriteria.every(criterion => {
          const { field, operator, value } = criterion;
          
          switch (field) {
            case 'status':
              return operator === 'equals' 
                ? contact.status === value 
                : contact.status !== value;
              
            case 'tag':
              return operator === 'includes' 
                ? contact.tags.some(tag => tag.toLowerCase().includes(value.toLowerCase()))
                : !contact.tags.some(tag => tag.toLowerCase().includes(value.toLowerCase()));
              
            case 'emailsOpened':
              const openRate = contact.stats.emailsOpened / (contact.stats.emailsSent || 1);
              const comparableValue = parseFloat(value) / 100; // Convert percentage to decimal
              
              switch (operator) {
                case 'greaterThan': return openRate > comparableValue;
                case 'lessThan': return openRate < comparableValue;
                default: return openRate === comparableValue;
              }
              
            case 'createdAt':
              const contactDate = new Date(contact.createdAt || '').getTime();
              const filterDate = new Date(value).getTime();
              
              switch (operator) {
                case 'before': return contactDate < filterDate;
                case 'after': return contactDate > filterDate;
                default: return false;
              }
              
            default:
              return true;
          }
        });
      });
    }
    
    return filtered;
  };

  // Render the advanced filter controls
  const AdvancedFilterControls = () => (
    <div className="bg-secondary-bg rounded-lg shadow-md overflow-hidden mb-6">
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-medium text-white">Advanced Filters</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowSaveFilterForm(!showSaveFilterForm)}
            className="text-sm text-accent-blue hover:text-blue-400"
            disabled={filterCriteria.length === 0}
          >
            Save Filter
          </button>
          <button
            onClick={clearAllFilters}
            className="text-sm text-red-400 hover:text-red-300"
          >
            Clear All
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {showSaveFilterForm && (
          <div className="mb-4 p-3 bg-gray-800 rounded-md">
            <label htmlFor="filterName" className="block text-sm font-medium text-white mb-1">
              Filter Name
            </label>
            <div className="flex">
              <input
                type="text"
                id="filterName"
                value={saveFilterName}
                onChange={(e) => setSaveFilterName(e.target.value)}
                className="flex-grow px-3 py-2 border border-gray-700 bg-gray-800 rounded-l-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                placeholder="My Filter"
              />
              <button
                onClick={saveCurrentFilter}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-accent-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue"
                disabled={!saveFilterName.trim() || filterCriteria.length === 0}
              >
                Save
              </button>
            </div>
          </div>
        )}
      
        {savedFilters.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-white mb-2">Saved Filters</h3>
            <div className="flex flex-wrap gap-2">
              {savedFilters.map(filter => (
                <div
                  key={filter.id}
                  className={`flex items-center rounded-full py-1 pl-3 pr-1 text-sm ${
                    activeFilterId === filter.id 
                      ? 'bg-accent-blue text-white' 
                      : 'bg-gray-800 text-gray-300'
                  }`}
                >
                  <span className="mr-1">{filter.name}</span>
                  <button
                    onClick={() => applySavedFilter(filter.id)}
                    className={`p-1 rounded-full ${
                      activeFilterId === filter.id 
                        ? 'hover:bg-blue-600 text-white' 
                        : 'hover:bg-gray-700 text-gray-400'
                    }`}
                    title="Apply Filter"
                  >
                    <FunnelIcon className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => deleteSavedFilter(filter.id)}
                    className={`p-1 rounded-full ${
                      activeFilterId === filter.id 
                        ? 'hover:bg-blue-600 text-white' 
                        : 'hover:bg-gray-700 text-gray-400'
                    }`}
                    title="Delete Filter"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {filterCriteria.length === 0 ? (
          <div className="text-center py-3">
            <p className="text-gray-400">No filters applied. Add a filter to begin.</p>
            <button
              onClick={addFilterCriterion}
              className="mt-2 inline-flex items-center px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-white hover:bg-gray-700"
            >
              Add Filter
            </button>
          </div>
        ) : (
          <>
            {filterCriteria.map(criterion => (
              <div key={criterion.id} className="mb-3 p-3 bg-gray-800 rounded-md flex flex-wrap md:flex-nowrap md:items-center gap-2">
                <div className="w-full md:w-1/4">
                  <select
                    value={criterion.field}
                    onChange={(e) => updateFilterCriterion(criterion.id, 'field', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-700 bg-gray-800 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                  >
                    <option value="status">Status</option>
                    <option value="tag">Tag</option>
                    <option value="emailsOpened">Open Rate</option>
                    <option value="createdAt">Created Date</option>
                  </select>
                </div>
                
                <div className="w-full md:w-1/4">
                  <select
                    value={criterion.operator}
                    onChange={(e) => updateFilterCriterion(criterion.id, 'operator', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-700 bg-gray-800 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                  >
                    {criterion.field === 'status' && (
                      <>
                        <option value="equals">Equals</option>
                        <option value="notEquals">Not Equals</option>
                      </>
                    )}
                    {criterion.field === 'tag' && (
                      <>
                        <option value="includes">Contains</option>
                        <option value="notIncludes">Does Not Contain</option>
                      </>
                    )}
                    {criterion.field === 'emailsOpened' && (
                      <>
                        <option value="greaterThan">Greater Than</option>
                        <option value="lessThan">Less Than</option>
                        <option value="equals">Equals</option>
                      </>
                    )}
                    {criterion.field === 'createdAt' && (
                      <>
                        <option value="before">Before</option>
                        <option value="after">After</option>
                      </>
                    )}
                  </select>
                </div>
                
                <div className="w-full md:w-1/3">
                  {criterion.field === 'status' ? (
                    <select
                      value={criterion.value}
                      onChange={(e) => updateFilterCriterion(criterion.id, 'value', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-700 bg-gray-800 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                    >
                      <option value="">Select Status</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="unsubscribed">Unsubscribed</option>
                    </select>
                  ) : criterion.field === 'emailsOpened' ? (
                    <div className="flex items-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={criterion.value}
                        onChange={(e) => updateFilterCriterion(criterion.id, 'value', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-700 bg-gray-800 rounded-l-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                        placeholder="50"
                      />
                      <span className="inline-flex items-center px-3 py-2 rounded-r-md border border-l-0 border-gray-700 bg-gray-800 text-white">
                        %
                      </span>
                    </div>
                  ) : criterion.field === 'createdAt' ? (
                    <input
                      type="date"
                      value={criterion.value}
                      onChange={(e) => updateFilterCriterion(criterion.id, 'value', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-700 bg-gray-800 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                    />
                  ) : (
                    <input
                      type="text"
                      value={criterion.value}
                      onChange={(e) => updateFilterCriterion(criterion.id, 'value', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-700 bg-gray-800 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                      placeholder={criterion.field === 'tag' ? "Enter tag..." : "Enter value..."}
                    />
                  )}
                </div>
                
                <div className="w-auto flex items-center justify-end space-x-2">
                  <button
                    onClick={() => removeFilterCriterion(criterion.id)}
                    className="inline-flex items-center p-1 border border-transparent rounded-full text-gray-400 hover:bg-gray-700 hover:text-white"
                    aria-label="Remove filter"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
            
            <div className="flex items-center justify-between pt-3">
              <button
                onClick={addFilterCriterion}
                className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-white hover:bg-gray-700"
              >
                Add Filter
              </button>
              
              <span className="text-sm text-gray-400">
                {filterCriteria.length} {filterCriteria.length === 1 ? 'filter' : 'filters'} applied
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // In ContactManager.tsx, this would replace or enhance the existing search input
  const EnhancedSearchBar = () => (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="relative rounded-md shadow-sm max-w-lg w-full">
          <input
            type="text"
            className="block w-full px-4 py-2 border border-gray-700 bg-gray-800 rounded-md leading-5 text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="text-gray-400 hover:text-white"
              title="Advanced Filters"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-2">
          {/* Status filter buttons would go here */}
        </div>
      </div>
      
      {showAdvancedFilters && <AdvancedFilterControls />}
    </div>
  );

  // This is just an example component that doesn't render anything useful
  return (
    <div>
      <EnhancedSearchBar />
    </div>
  );
};

/**
 * Integration Instructions for ContactManager.tsx:
 * 
 * 1. Add imports:
 *    - Import FunnelIcon, XMarkIcon, AdjustmentsHorizontalIcon from '@heroicons/react/24/outline'
 * 
 * 2. Add new state variables:
 *    - const [showAdvancedFilters, setShowAdvancedFilters] = React.useState(false);
 *    - const [filterCriteria, setFilterCriteria] = React.useState<FilterCriteria[]>([]);
 *    - const [savedFilters, setSavedFilters] = React.useState<SavedFilter[]>([]);
 *    - const [activeFilterId, setActiveFilterId] = React.useState<string | null>(null);
 *    - const [saveFilterName, setSaveFilterName] = React.useState('');
 *    - const [showSaveFilterForm, setShowSaveFilterForm] = React.useState(false);
 * 
 * 3. Add the interface definitions for FilterCriteria and SavedFilter
 * 
 * 4. Add all the handler functions for managing filters:
 *    - addFilterCriterion, updateFilterCriterion, removeFilterCriterion
 *    - clearAllFilters, saveCurrentFilter, applySavedFilter, deleteSavedFilter
 * 
 * 5. Replace the existing filter function with the enhanced filterContacts function
 * 
 * 6. Replace the existing search UI with the EnhancedSearchBar component
 * 
 * 7. Add the AdvancedFilterControls component to render when showAdvancedFilters is true
 */ 