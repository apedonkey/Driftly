import React from 'react';

import {
  PencilIcon,
  PlusIcon,
  TagIcon,
  TrashIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

// This is an example file showing how to implement contact segmentation functionality
// to integrate with the ContactManager page

interface Contact {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  tags: string[];
  // other properties...
}

interface Segment {
  id: string;
  name: string;
  description?: string;
  criteria: SegmentCriteria[];
  contactCount: number;
  createdAt: string;
  updatedAt: string;
}

interface SegmentCriteria {
  id: string;
  field: string;
  operator: string;
  value: string;
}

export const ContactSegmentationExample: React.FC = () => {
  // State variables to add to ContactManager.tsx
  const [segments, setSegments] = React.useState<Segment[]>([]);
  const [showSegments, setShowSegments] = React.useState(false);
  const [selectedSegmentId, setSelectedSegmentId] = React.useState<string | null>(null);
  const [isCreatingSegment, setIsCreatingSegment] = React.useState(false);
  const [isEditingSegment, setIsEditingSegment] = React.useState(false);
  const [newSegmentName, setNewSegmentName] = React.useState('');
  const [newSegmentDescription, setNewSegmentDescription] = React.useState('');
  const [newSegmentCriteria, setNewSegmentCriteria] = React.useState<SegmentCriteria[]>([]);

  // Mock data for segments
  React.useEffect(() => {
    // In a real implementation, this would fetch from an API
    const mockSegments: Segment[] = [
      {
        id: '1',
        name: 'Active Subscribers',
        description: 'Contacts who are active and have opened at least one email',
        criteria: [
          { id: '1', field: 'status', operator: 'equals', value: 'active' },
          { id: '2', field: 'emailsOpened', operator: 'greaterThan', value: '0' }
        ],
        contactCount: 156,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        name: 'New Contacts',
        description: 'Contacts added in the last 7 days',
        criteria: [
          { id: '3', field: 'createdAt', operator: 'after', value: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() }
        ],
        contactCount: 34,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        name: 'High Engagement',
        description: 'Contacts with high email open rates',
        criteria: [
          { id: '4', field: 'emailsOpened', operator: 'greaterThan', value: '50' }
        ],
        contactCount: 78,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    setSegments(mockSegments);
  }, []);

  // Function to add a new segment criterion
  const addSegmentCriterion = () => {
    const newCriterion: SegmentCriteria = {
      id: Date.now().toString(),
      field: 'status',
      operator: 'equals',
      value: ''
    };
    setNewSegmentCriteria([...newSegmentCriteria, newCriterion]);
  };

  // Function to update a segment criterion
  const updateSegmentCriterion = (id: string, field: string, value: string) => {
    setNewSegmentCriteria(
      newSegmentCriteria.map(criterion => 
        criterion.id === id ? { ...criterion, [field]: value } : criterion
      )
    );
  };

  // Function to remove a segment criterion
  const removeSegmentCriterion = (id: string) => {
    setNewSegmentCriteria(newSegmentCriteria.filter(criterion => criterion.id !== id));
  };

  // Function to create a new segment
  const handleCreateSegment = () => {
    if (!newSegmentName.trim() || newSegmentCriteria.length === 0) return;
    
    // In a real implementation, this would call an API
    const newSegment: Segment = {
      id: Date.now().toString(),
      name: newSegmentName,
      description: newSegmentDescription || undefined,
      criteria: [...newSegmentCriteria],
      contactCount: 0, // This would be calculated by the backend
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setSegments([...segments, newSegment]);
    resetSegmentForm();
  };

  // Function to update an existing segment
  const handleUpdateSegment = () => {
    if (!selectedSegmentId || !newSegmentName.trim() || newSegmentCriteria.length === 0) return;
    
    // In a real implementation, this would call an API
    const updatedSegments = segments.map(segment => 
      segment.id === selectedSegmentId 
        ? {
            ...segment,
            name: newSegmentName,
            description: newSegmentDescription || undefined,
            criteria: [...newSegmentCriteria],
            updatedAt: new Date().toISOString()
          }
        : segment
    );
    
    setSegments(updatedSegments);
    resetSegmentForm();
  };

  // Function to delete a segment
  const handleDeleteSegment = (segmentId: string) => {
    // In a real implementation, this would call an API
    setSegments(segments.filter(segment => segment.id !== segmentId));
    
    if (selectedSegmentId === segmentId) {
      setSelectedSegmentId(null);
    }
  };

  // Function to apply a segment as a filter
  const applySegmentFilter = (segmentId: string) => {
    // In a real implementation, this would set filter criteria based on segment
    setSelectedSegmentId(segmentId);
    
    // Mock implementation - we would typically:
    // 1. Get the segment's criteria
    // 2. Apply those criteria to the contact filter
    // 3. Refresh the contacts list
    
    const segment = segments.find(s => s.id === segmentId);
    if (segment) {
      console.log(`Applied segment filter: ${segment.name}`);
      
      // You would typically update filterCriteria state here:
      // setFilterCriteria(segment.criteria);
      
      // And then trigger a re-filter of the contacts:
      // const filteredContacts = filterContacts(contacts);
      // setFilteredContacts(filteredContacts);
    }
  };

  // Function to edit an existing segment
  const startEditingSegment = (segmentId: string) => {
    const segment = segments.find(s => s.id === segmentId);
    if (!segment) return;
    
    setSelectedSegmentId(segmentId);
    setNewSegmentName(segment.name);
    setNewSegmentDescription(segment.description || '');
    setNewSegmentCriteria([...segment.criteria]);
    setIsEditingSegment(true);
    setIsCreatingSegment(false);
  };

  // Function to reset the segment form
  const resetSegmentForm = () => {
    setNewSegmentName('');
    setNewSegmentDescription('');
    setNewSegmentCriteria([]);
    setIsCreatingSegment(false);
    setIsEditingSegment(false);
    setSelectedSegmentId(null);
  };

  // Render segment form for creating or editing segments
  const SegmentForm = () => (
    <div className="bg-gray-800 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-medium text-white mb-4">
        {isEditingSegment ? 'Edit Segment' : 'Create New Segment'}
      </h3>
      
      <div className="mb-4">
        <label htmlFor="segmentName" className="block text-sm font-medium text-white mb-1">
          Segment Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          id="segmentName"
          value={newSegmentName}
          onChange={(e) => setNewSegmentName(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-700 bg-gray-800 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
          placeholder="e.g., Active Subscribers"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="segmentDescription" className="block text-sm font-medium text-white mb-1">
          Description
        </label>
        <textarea
          id="segmentDescription"
          value={newSegmentDescription}
          onChange={(e) => setNewSegmentDescription(e.target.value)}
          rows={2}
          className="block w-full px-3 py-2 border border-gray-700 bg-gray-800 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
          placeholder="Brief description of this segment"
        />
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-white">
            Segment Criteria <span className="text-red-400">*</span>
          </label>
          <button
            type="button"
            onClick={addSegmentCriterion}
            className="inline-flex items-center px-2 py-1 border border-gray-600 rounded-md text-xs font-medium text-white hover:bg-gray-700"
          >
            <PlusIcon className="h-3 w-3 mr-1" />
            Add Criterion
          </button>
        </div>
        
        {newSegmentCriteria.length === 0 ? (
          <div className="text-center py-3 border border-dashed border-gray-700 rounded-md">
            <p className="text-gray-400 text-sm">No criteria added yet.</p>
            <button
              type="button"
              onClick={addSegmentCriterion}
              className="mt-2 inline-flex items-center px-3 py-1 border border-gray-600 rounded-md text-xs font-medium text-white hover:bg-gray-700"
            >
              <PlusIcon className="h-3 w-3 mr-1" />
              Add Criterion
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {newSegmentCriteria.map(criterion => (
              <div key={criterion.id} className="p-2 bg-gray-700 rounded-md flex flex-wrap md:flex-nowrap items-center gap-2">
                <div className="w-full md:w-1/4">
                  <select
                    value={criterion.field}
                    onChange={(e) => updateSegmentCriterion(criterion.id, 'field', e.target.value)}
                    className="block w-full px-3 py-1 border border-gray-600 bg-gray-700 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue text-xs"
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
                    onChange={(e) => updateSegmentCriterion(criterion.id, 'operator', e.target.value)}
                    className="block w-full px-3 py-1 border border-gray-600 bg-gray-700 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue text-xs"
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
                      onChange={(e) => updateSegmentCriterion(criterion.id, 'value', e.target.value)}
                      className="block w-full px-3 py-1 border border-gray-600 bg-gray-700 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue text-xs"
                    >
                      <option value="">Select Status</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="unsubscribed">Unsubscribed</option>
                    </select>
                  ) : criterion.field === 'emailsOpened' ? (
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={criterion.value}
                      onChange={(e) => updateSegmentCriterion(criterion.id, 'value', e.target.value)}
                      className="block w-full px-3 py-1 border border-gray-600 bg-gray-700 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue text-xs"
                      placeholder="50"
                    />
                  ) : criterion.field === 'createdAt' ? (
                    <input
                      type="date"
                      value={criterion.value}
                      onChange={(e) => updateSegmentCriterion(criterion.id, 'value', e.target.value)}
                      className="block w-full px-3 py-1 border border-gray-600 bg-gray-700 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue text-xs"
                    />
                  ) : (
                    <input
                      type="text"
                      value={criterion.value}
                      onChange={(e) => updateSegmentCriterion(criterion.id, 'value', e.target.value)}
                      className="block w-full px-3 py-1 border border-gray-600 bg-gray-700 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue text-xs"
                      placeholder="Enter value..."
                    />
                  )}
                </div>
                
                <div className="w-auto flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeSegmentCriterion(criterion.id)}
                    className="inline-flex items-center p-1 border border-transparent rounded-full text-gray-400 hover:bg-gray-600 hover:text-white"
                    aria-label="Remove criterion"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={resetSegmentForm}
          className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-white hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={isEditingSegment ? handleUpdateSegment : handleCreateSegment}
          disabled={!newSegmentName.trim() || newSegmentCriteria.length === 0}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue disabled:opacity-50"
        >
          {isEditingSegment ? 'Update Segment' : 'Create Segment'}
        </button>
      </div>
    </div>
  );

  // Render segments list
  const SegmentsList = () => (
    <div className="bg-secondary-bg rounded-lg shadow-md overflow-hidden mb-6">
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-medium text-white">Contact Segments</h2>
        <button
          onClick={() => {
            setIsCreatingSegment(true);
            setIsEditingSegment(false);
            setSelectedSegmentId(null);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          New Segment
        </button>
      </div>
      
      <div className="p-4">
        {segments.length === 0 ? (
          <div className="text-center py-6">
            <UserGroupIcon className="h-12 w-12 mx-auto text-gray-500" />
            <p className="mt-2 text-gray-400">No segments created yet</p>
            <button
              onClick={() => setIsCreatingSegment(true)}
              className="mt-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Create First Segment
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {segments.map(segment => (
              <div key={segment.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-md font-medium text-white flex items-center">
                      <TagIcon className="h-4 w-4 text-gray-400 mr-1" />
                      {segment.name}
                      <span className="ml-2 text-xs rounded-full bg-gray-700 px-2 py-0.5 text-gray-300">
                        {segment.contactCount} contacts
                      </span>
                    </h3>
                    {segment.description && (
                      <p className="mt-1 text-sm text-gray-400">{segment.description}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Last updated: {new Date(segment.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => applySegmentFilter(segment.id)}
                      className={`inline-flex items-center px-3 py-1 border rounded-md text-xs font-medium ${
                        selectedSegmentId === segment.id 
                          ? 'border-transparent bg-accent-blue text-white'
                          : 'border-gray-600 text-white hover:bg-gray-700'
                      }`}
                    >
                      {selectedSegmentId === segment.id ? 'Applied' : 'Apply Filter'}
                    </button>
                    <button
                      onClick={() => startEditingSegment(segment.id)}
                      className="inline-flex items-center px-2 py-1 border border-gray-600 rounded-md text-xs font-medium text-white hover:bg-gray-700"
                    >
                      <PencilIcon className="h-3 w-3 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteSegment(segment.id)}
                      className="inline-flex items-center px-2 py-1 border border-gray-600 rounded-md text-xs font-medium text-white hover:bg-gray-700"
                    >
                      <TrashIcon className="h-3 w-3 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
                
                {/* Display segment criteria */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {segment.criteria.map((criterion, index) => {
                    let criterionText = '';
                    
                    switch (criterion.field) {
                      case 'status':
                        criterionText = `Status ${criterion.operator === 'equals' ? 'is' : 'is not'} ${criterion.value}`;
                        break;
                      case 'tag':
                        criterionText = `Tag ${criterion.operator === 'includes' ? 'contains' : 'does not contain'} "${criterion.value}"`;
                        break;
                      case 'emailsOpened':
                        criterionText = `Open rate ${criterion.operator === 'greaterThan' ? '>' : criterion.operator === 'lessThan' ? '<' : '='} ${criterion.value}%`;
                        break;
                      case 'createdAt':
                        const dateStr = new Date(criterion.value).toLocaleDateString();
                        criterionText = `Created ${criterion.operator === 'before' ? 'before' : 'after'} ${dateStr}`;
                        break;
                      default:
                        criterionText = `${criterion.field} ${criterion.operator} ${criterion.value}`;
                    }
                    
                    return (
                      <span key={criterion.id} className="inline-block px-2 py-1 text-xs rounded bg-gray-700 text-gray-300">
                        {criterionText}
                        {index < segment.criteria.length - 1 && <span className="ml-1 mr-1">AND</span>}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // This would be integrated into ContactManager.tsx
  return (
    <div>
      {/* Add a button to toggle segments panel in the ContactManager */}
      <button
        onClick={() => setShowSegments(!showSegments)}
        className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-white hover:bg-gray-700"
      >
        <UserGroupIcon className="h-5 w-5 mr-1" />
        {showSegments ? 'Hide Segments' : 'Manage Segments'}
      </button>
      
      {/* Show the segments panel when toggled */}
      {showSegments && (
        <div className="mt-6">
          {isCreatingSegment || isEditingSegment ? <SegmentForm /> : <SegmentsList />}
        </div>
      )}
    </div>
  );
};

/**
 * Integration Instructions for ContactManager.tsx:
 * 
 * 1. Add imports:
 *    - Import TagIcon, UserGroupIcon, PlusIcon, TrashIcon, PencilIcon from '@heroicons/react/24/outline'
 * 
 * 2. Add interfaces for Segment and SegmentCriteria
 * 
 * 3. Add new state variables:
 *    - const [segments, setSegments] = React.useState<Segment[]>([]);
 *    - const [showSegments, setShowSegments] = React.useState(false);
 *    - const [selectedSegmentId, setSelectedSegmentId] = React.useState<string | null>(null);
 *    - const [isCreatingSegment, setIsCreatingSegment] = React.useState(false);
 *    - const [isEditingSegment, setIsEditingSegment] = React.useState(false);
 *    - const [newSegmentName, setNewSegmentName] = React.useState('');
 *    - const [newSegmentDescription, setNewSegmentDescription] = React.useState('');
 *    - const [newSegmentCriteria, setNewSegmentCriteria] = React.useState<SegmentCriteria[]>([]);
 * 
 * 4. Add a useEffect to fetch segments (mockSegments for now)
 * 
 * 5. Add all the handler functions for managing segments:
 *    - addSegmentCriterion, updateSegmentCriterion, removeSegmentCriterion
 *    - handleCreateSegment, handleUpdateSegment, handleDeleteSegment
 *    - applySegmentFilter, startEditingSegment, resetSegmentForm
 * 
 * 6. Add the SegmentForm and SegmentsList components
 * 
 * 7. Add a button near the search/filter controls to toggle the segments panel:
 *    <button onClick={() => setShowSegments(!showSegments)} className="...">
 *      <UserGroupIcon className="h-5 w-5 mr-1" />
 *      {showSegments ? 'Hide Segments' : 'Manage Segments'}
 *    </button>
 * 
 * 8. Add the segments panel below the search/filter controls:
 *    {showSegments && (
 *      <div className="mt-6">
 *        {isCreatingSegment || isEditingSegment ? <SegmentForm /> : <SegmentsList />}
 *      </div>
 *    )}
 * 
 * 9. Integrate the selectedSegmentId with the existing filtering logic in contactManager
 */ 