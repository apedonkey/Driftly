import React, { useState } from 'react';

import { Link } from 'react-router-dom';

import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  EllipsisVerticalIcon,
  EnvelopeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  PlusIcon,
  TagIcon,
} from '@heroicons/react/24/outline';

// Mock contact data
const mockContacts = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+1 (555) 123-4567',
    status: 'Lead',
    tags: ['Marketing', 'Website'],
    lastActivity: '2 hours ago',
    score: 85
  },
  {
    id: 2,
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    phone: '+1 (555) 987-6543',
    status: 'Customer',
    tags: ['Enterprise', 'High Value'],
    lastActivity: '1 day ago',
    score: 92
  },
  {
    id: 3,
    name: 'David Wilson',
    email: 'david.wilson@example.com',
    phone: '+1 (555) 456-7890',
    status: 'Lead',
    tags: ['Cold Outreach'],
    lastActivity: '3 days ago',
    score: 45
  },
  {
    id: 4,
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@example.com',
    phone: '+1 (555) 789-0123',
    status: 'Customer',
    tags: ['SMB', 'Tech'],
    lastActivity: '4 hours ago',
    score: 78
  },
  {
    id: 5,
    name: 'James Smith',
    email: 'james.smith@example.com',
    phone: '+1 (555) 234-5678',
    status: 'Opportunity',
    tags: ['Enterprise', 'Finance'],
    lastActivity: '2 days ago',
    score: 67
  },
  {
    id: 6,
    name: 'Jessica Brown',
    email: 'jessica.brown@example.com',
    phone: '+1 (555) 876-5432',
    status: 'Lead',
    tags: ['Newsletter'],
    lastActivity: '5 days ago',
    score: 32
  },
  {
    id: 7,
    name: 'Daniel Lee',
    email: 'daniel.lee@example.com',
    phone: '+1 (555) 345-6789',
    status: 'Customer',
    tags: ['SMB', 'Recurring'],
    lastActivity: '6 hours ago',
    score: 89
  },
  {
    id: 8,
    name: 'Olivia Martinez',
    email: 'olivia.martinez@example.com',
    phone: '+1 (555) 567-8901',
    status: 'Lead',
    tags: ['Website', 'Demo Request'],
    lastActivity: '1 week ago',
    score: 56
  }
];

// Status colors
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Lead':
      return 'bg-blue-900/30 text-blue-300';
    case 'Opportunity':
      return 'bg-yellow-900/30 text-yellow-300';
    case 'Customer':
      return 'bg-green-900/30 text-green-300';
    case 'Churned':
      return 'bg-red-900/30 text-red-300';
    default:
      return 'bg-gray-900/30 text-gray-300';
  }
};

// Score color
const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  return 'text-red-400';
};

const Contacts: React.FC = () => {
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Toggle selection for a single contact
  const toggleContactSelection = (contactId: number) => {
    if (selectedContacts.includes(contactId)) {
      setSelectedContacts(selectedContacts.filter(id => id !== contactId));
    } else {
      setSelectedContacts([...selectedContacts, contactId]);
    }
  };
  
  // Toggle selection for all contacts
  const toggleAllSelection = () => {
    if (selectedContacts.length === mockContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(mockContacts.map(contact => contact.id));
    }
  };
  
  // Filter contacts based on search query
  const filteredContacts = mockContacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery) ||
    contact.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-6">
      {/* Header with Sign in and Get started buttons */}
      <div className="mb-12">
        <div className="flex justify-end mb-6">
          <div className="flex space-x-4">
            <Link
              to="/login"
              className="text-gray-300 hover:bg-gray-700 hover:text-white px-4 py-2 rounded-md text-sm font-medium border border-gray-700"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="bg-accent-blue text-white hover:bg-blue-600 px-4 py-2 rounded-md text-sm font-medium shadow-sm"
            >
              Get started
            </Link>
          </div>
        </div>
        
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Contacts</h1>
          <p className="text-gray-400">Manage and organize your contacts</p>
        </header>
      </div>
      
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex space-x-2 w-full sm:w-auto">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-700 rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue focus:ring-offset-gray-900"
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filter
          </button>
          
          <button className="inline-flex items-center px-3 py-2 border border-gray-700 rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue focus:ring-offset-gray-900">
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export
          </button>
          
          <button className="inline-flex items-center px-3 py-2 border border-gray-700 rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue focus:ring-offset-gray-900">
            <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
            Import
          </button>
          
          <button className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue focus:ring-offset-gray-900">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Contact
          </button>
        </div>
      </div>
      
      {/* Filters */}
      {showFilters && (
        <div className="bg-secondary-bg rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-400 mb-1">
                Status
              </label>
              <select
                id="status-filter"
                className="block w-full py-2 px-3 border border-gray-700 bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm text-white"
              >
                <option value="">All Statuses</option>
                <option value="lead">Lead</option>
                <option value="opportunity">Opportunity</option>
                <option value="customer">Customer</option>
                <option value="churned">Churned</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="tag-filter" className="block text-sm font-medium text-gray-400 mb-1">
                Tag
              </label>
              <select
                id="tag-filter"
                className="block w-full py-2 px-3 border border-gray-700 bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm text-white"
              >
                <option value="">All Tags</option>
                <option value="marketing">Marketing</option>
                <option value="website">Website</option>
                <option value="enterprise">Enterprise</option>
                <option value="smb">SMB</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="score-filter" className="block text-sm font-medium text-gray-400 mb-1">
                Score
              </label>
              <select
                id="score-filter"
                className="block w-full py-2 px-3 border border-gray-700 bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm text-white"
              >
                <option value="">All Scores</option>
                <option value="high">High (80+)</option>
                <option value="medium">Medium (60-79)</option>
                <option value="low">Low (&lt;60)</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="date-filter" className="block text-sm font-medium text-gray-400 mb-1">
                Last Activity
              </label>
              <select
                id="date-filter"
                className="block w-full py-2 px-3 border border-gray-700 bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm text-white"
              >
                <option value="">Any time</option>
                <option value="today">Today</option>
                <option value="week">This week</option>
                <option value="month">This month</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button className="text-sm text-gray-400 hover:text-white mr-4">
              Clear all
            </button>
            <button className="text-sm font-medium text-accent-blue hover:text-blue-400">
              Apply filters
            </button>
          </div>
        </div>
      )}
      
      {/* Selected Actions */}
      {selectedContacts.length > 0 && (
        <div className="bg-secondary-bg rounded-lg mb-6 p-4 flex items-center justify-between">
          <div className="text-sm text-white">
            <span className="font-medium">{selectedContacts.length}</span> contacts selected
          </div>
          <div className="flex space-x-3">
            <button className="text-sm text-white hover:text-gray-300">
              Add tag
            </button>
            <button className="text-sm text-white hover:text-gray-300">
              Change status
            </button>
            <button className="text-sm text-white hover:text-gray-300">
              Add to campaign
            </button>
            <button className="text-sm text-red-400 hover:text-red-300">
              Delete
            </button>
          </div>
        </div>
      )}
      
      {/* Contacts Table */}
      <div className="bg-secondary-bg rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-accent-blue focus:ring-accent-blue focus:ring-opacity-50 border-gray-600 rounded"
                      checked={selectedContacts.length === mockContacts.length}
                      onChange={toggleAllSelection}
                    />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Tags
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Score
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Last Activity
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-accent-blue focus:ring-accent-blue focus:ring-opacity-50 border-gray-600 rounded"
                      checked={selectedContacts.includes(contact.id)}
                      onChange={() => toggleContactSelection(contact.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center text-white">
                        {contact.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">{contact.name}</div>
                        <div className="flex items-center text-sm text-gray-400 space-x-2">
                          <EnvelopeIcon className="h-3 w-3" />
                          <span>{contact.email}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-400 space-x-2">
                          <PhoneIcon className="h-3 w-3" />
                          <span>{contact.phone}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(contact.status)}`}>
                      {contact.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {contact.tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-700 text-gray-300">
                          <TagIcon className="mr-1 h-3 w-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${getScoreColor(contact.score)}`}>
                      {contact.score}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {contact.lastActivity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                      <button className="text-gray-400 hover:text-white">
                        <EnvelopeIcon className="h-5 w-5" />
                      </button>
                      <button className="text-gray-400 hover:text-white">
                        <PhoneIcon className="h-5 w-5" />
                      </button>
                      <div className="relative">
                        <button className="text-gray-400 hover:text-white">
                          <EllipsisVerticalIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-700 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-400">
                Showing <span className="font-medium">1</span> to <span className="font-medium">8</span> of{' '}
                <span className="font-medium">68</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-700 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700">
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-700 bg-gray-900 text-sm font-medium text-white">
                  1
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-700 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700">
                  2
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-700 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700">
                  3
                </button>
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-700 bg-gray-800 text-sm font-medium text-gray-400">
                  ...
                </span>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-700 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700">
                  8
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-700 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700">
                  9
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-700 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700">
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
          <div className="flex sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md text-gray-400 bg-gray-800 hover:bg-gray-700">
              Previous
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md text-gray-400 bg-gray-800 hover:bg-gray-700">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacts; 