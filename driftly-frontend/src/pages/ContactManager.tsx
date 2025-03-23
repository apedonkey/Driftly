import React from 'react';

import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  ArrowLeftIcon,
  ArrowPathIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';

import ContactEditModal from '../components/ContactEditModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import Navigation from '../components/Navigation';
import { contactService } from '../services/api';

// Update the Contact interface to match the structure returned by the API
interface Contact {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  status: 'active' | 'completed' | 'unsubscribed';
  flowProgress: {
    currentStep: number;
    totalSteps: number;
    nextEmailDate: string;
  };
  stats: {
    emailsSent: number;
    emailsOpened: number;
    linksClicked: number;
  };
  tags: string[];
  createdAt?: string;
  lastActive?: string;
  stage?: string;
}

// API response type
interface ApiResponse<T> {
  success: boolean;
  count?: number;
  data: T;
}

const ContactManager: React.FC = () => {
  const { flowId } = useParams<{ flowId: string }>();
  const navigate = useNavigate();
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filter, setFilter] = React.useState('all'); // 'all', 'active', 'completed', 'unsubscribed'
  const [showAddContact, setShowAddContact] = React.useState(false);
  const [newContact, setNewContact] = React.useState({
    email: '',
    firstName: '',
    lastName: '',
    tags: ''
  });
  const [importing, setImporting] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [editingContact, setEditingContact] = React.useState<Contact | null>(null);
  const [deletingContact, setDeletingContact] = React.useState<Contact | null>(null);
  const [customFields, setCustomFields] = React.useState([]);
  const [scoringRules, setScoringRules] = React.useState([]);
  const [timelineEvents, setTimelineEvents] = React.useState([]);
  const [isExporting, setIsExporting] = React.useState(false);
  const [showCustomFields, setShowCustomFields] = React.useState(false);
  const [showScoring, setShowScoring] = React.useState(false);
  const [showTimeline, setShowTimeline] = React.useState(false);

  React.useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        if (!flowId) {
          setError('Flow ID is missing');
          setLoading(false);
          return;
        }
        
        const response = await contactService.getContacts(flowId);
        console.log('Contacts API response:', response);
        
        if (response && response.success && Array.isArray(response.data)) {
          // Transform the API response to match our Contact interface
          const transformedContacts = response.data.map((contact: any) => ({
            id: contact.id,
            email: contact.email,
            firstName: contact.firstName || '',
            lastName: contact.lastName || '',
            name: contact.name || '',
            phone: contact.phone || '',
            status: contact.status || 'active',
            flowProgress: contact.flowProgress || {
              currentStep: 1,
              totalSteps: 3,
              nextEmailDate: contact.lastActive || new Date().toISOString()
            },
            stats: contact.stats || {
              emailsSent: 0,
              emailsOpened: 0,
              linksClicked: 0
            },
            tags: contact.tags || [],
            createdAt: contact.createdAt || contact.lastActive,
            lastActive: contact.lastActive,
            stage: contact.stage
          }));
          
          setContacts(transformedContacts);
        } else {
          console.error('Invalid API response structure:', response);
          setContacts([]);
          setError('Received invalid data format from server.');
        }
      } catch (err) {
        console.error('Error fetching contacts:', err);
        setError('Failed to load contacts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [flowId]);

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!flowId) {
        throw new Error('Flow ID is missing');
      }
      
      if (!newContact.email.trim()) {
        throw new Error('Email is required');
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newContact.email)) {
        throw new Error('Invalid email format');
      }
      
      // Convert tags string to array
      const tags = newContact.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);
      
      const contactData = {
        email: newContact.email,
        firstName: newContact.firstName,
        lastName: newContact.lastName,
        tags
      };
      
      await contactService.addContact(flowId, contactData);
      
      // Refresh contacts list
      const response = await contactService.getContacts(flowId);
      if (response && response.success && Array.isArray(response.data)) {
        // Transform the API response to match our Contact interface
        const transformedContacts = response.data.map((contact: any) => ({
          id: contact.id,
          email: contact.email,
          firstName: contact.firstName || '',
          lastName: contact.lastName || '',
          name: contact.name || '',
          phone: contact.phone || '',
          status: contact.status || 'active',
          flowProgress: contact.flowProgress || {
            currentStep: 1,
            totalSteps: 3,
            nextEmailDate: contact.lastActive || new Date().toISOString()
          },
          stats: contact.stats || {
            emailsSent: 0,
            emailsOpened: 0,
            linksClicked: 0
          },
          tags: contact.tags || [],
          createdAt: contact.createdAt || contact.lastActive,
          lastActive: contact.lastActive,
          stage: contact.stage
        }));
        
        setContacts(transformedContacts);
      }
      
      // Reset form
      setNewContact({
        email: '',
        firstName: '',
        lastName: '',
        tags: ''
      });
      
      setShowAddContact(false);
    } catch (err: any) {
      console.error('Error adding contact:', err);
      setError(err.message || 'Failed to add contact. Please try again later.');
    }
  };

  const handleImportContacts = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      if (!flowId) {
        throw new Error('Flow ID is missing');
      }
      
      setImporting(true);
      
      const formData = new FormData();
      formData.append('file', file);
      
      await contactService.importContacts(flowId, formData);
      
      // Refresh contacts list
      const response = await contactService.getContacts(flowId);
      if (response && response.success && Array.isArray(response.data)) {
        // Transform the API response to match our Contact interface
        const transformedContacts = response.data.map((contact: any) => ({
          id: contact.id,
          email: contact.email,
          firstName: contact.firstName || '',
          lastName: contact.lastName || '',
          name: contact.name || '',
          phone: contact.phone || '',
          status: contact.status || 'active',
          flowProgress: contact.flowProgress || {
            currentStep: 1,
            totalSteps: 3,
            nextEmailDate: contact.lastActive || new Date().toISOString()
          },
          stats: contact.stats || {
            emailsSent: 0,
            emailsOpened: 0,
            linksClicked: 0
          },
          tags: contact.tags || [],
          createdAt: contact.createdAt || contact.lastActive,
          lastActive: contact.lastActive,
          stage: contact.stage
        }));
        
        setContacts(transformedContacts);
      }
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Error importing contacts:', err);
      setError('Failed to import contacts. Please try again later.');
    } finally {
      setImporting(false);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      if (!flowId) {
        throw new Error('Flow ID is missing');
      }
      
      await contactService.deleteContact(flowId, contactId);
      
      // Update contacts list
      setContacts(contacts.filter(contact => contact.id !== contactId));
    } catch (err) {
      console.error('Error deleting contact:', err);
      setError('Failed to delete contact. Please try again later.');
    }
  };

  const handleEditContact = async (updatedContact: Partial<Contact>) => {
    try {
      if (!flowId || !editingContact) {
        throw new Error('Flow ID or Contact is missing');
      }
      
      await contactService.updateContact(flowId, editingContact.id, updatedContact);
      
      // Refresh contacts list
      const response = await contactService.getContacts(flowId);
      if (response && response.success && Array.isArray(response.data)) {
        const transformedContacts = response.data.map((contact: any) => ({
          id: contact.id,
          email: contact.email,
          firstName: contact.firstName || '',
          lastName: contact.lastName || '',
          name: contact.name || '',
          phone: contact.phone || '',
          status: contact.status || 'active',
          flowProgress: contact.flowProgress || {
            currentStep: 1,
            totalSteps: 3,
            nextEmailDate: contact.lastActive || new Date().toISOString()
          },
          stats: contact.stats || {
            emailsSent: 0,
            emailsOpened: 0,
            linksClicked: 0
          },
          tags: contact.tags || [],
          createdAt: contact.createdAt || contact.lastActive,
          lastActive: contact.lastActive,
          stage: contact.stage
        }));
        
        setContacts(transformedContacts);
      }
      
      setEditingContact(null);
    } catch (err: any) {
      console.error('Error updating contact:', err);
      throw new Error(err.message || 'Failed to update contact');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      if (!flowId || !deletingContact) {
        throw new Error('Flow ID or Contact is missing');
      }
      
      await contactService.deleteContact(flowId, deletingContact.id);
      
      // Update contacts list
      setContacts(contacts.filter(contact => contact.id !== deletingContact.id));
      setDeletingContact(null);
    } catch (err: any) {
      console.error('Error deleting contact:', err);
      throw new Error(err.message || 'Failed to delete contact');
    }
  };

  // Filter contacts based on status and search term
  const filteredContacts = contacts.filter(contact => {
    const matchesFilter = 
      filter === 'all' || 
      contact.status === filter;
    
    const matchesSearch = 
      searchTerm === '' || 
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-primary-bg">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to={flowId ? `/flow-builder/${flowId}` : '/'} className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-4">
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            {flowId ? 'Back to Flow Editor' : 'Back to Dashboard'}
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Contact Manager</h1>
              <p className="mt-1 text-gray-400">Manage contacts in your email nurture flow</p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-2">
              <button
                onClick={() => setShowAddContact(!showAddContact)}
                className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-white hover:bg-gray-700"
              >
                <PlusCircleIcon className="h-5 w-5 mr-1" />
                Add Contact
              </button>
              <div className="relative">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImportContacts}
                  className="sr-only"
                  accept=".csv"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importing}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue disabled:opacity-50"
                >
                  {importing ? (
                    <>
                      <ArrowPathIcon className="h-5 w-5 mr-1 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    'Import CSV'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded-md">
            {error}
          </div>
        )}
        
        {showAddContact && (
          <div className="mb-6 bg-secondary-bg rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-lg font-medium text-white">Add New Contact</h2>
            </div>
            <div className="p-4">
              <form onSubmit={handleAddContact}>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="email" className="block text-sm font-medium text-white">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="email"
                        id="email"
                        value={newContact.email}
                        onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                        className="block w-full px-3 py-2 border border-gray-700 bg-gray-800 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                        placeholder="user@example.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label htmlFor="firstName" className="block text-sm font-medium text-white">
                      First Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="firstName"
                        value={newContact.firstName}
                        onChange={(e) => setNewContact({ ...newContact, firstName: e.target.value })}
                        className="block w-full px-3 py-2 border border-gray-700 bg-gray-800 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                        placeholder="John"
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label htmlFor="lastName" className="block text-sm font-medium text-white">
                      Last Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="lastName"
                        value={newContact.lastName}
                        onChange={(e) => setNewContact({ ...newContact, lastName: e.target.value })}
                        className="block w-full px-3 py-2 border border-gray-700 bg-gray-800 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label htmlFor="tags" className="block text-sm font-medium text-white">
                      Tags
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="tags"
                        value={newContact.tags}
                        onChange={(e) => setNewContact({ ...newContact, tags: e.target.value })}
                        className="block w-full px-3 py-2 border border-gray-700 bg-gray-800 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                        placeholder="tag1, tag2, tag3"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-400">Separate tags with commas</p>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddContact(false)}
                    className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-white hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue"
                  >
                    Add Contact
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
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
            </div>
            
            <div className="mt-4 md:mt-0 flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === 'all' 
                    ? 'bg-gray-700 text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === 'active' 
                    ? 'bg-gray-700 text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === 'completed' 
                    ? 'bg-gray-700 text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setFilter('unsubscribed')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === 'unsubscribed' 
                    ? 'bg-gray-700 text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                Unsubscribed
              </button>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="spinner"></div>
            <p className="mt-2 text-gray-400">Loading contacts...</p>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="text-center py-12 bg-secondary-bg rounded-lg">
            <p className="text-gray-400">
              {searchTerm 
                ? 'No contacts match your search criteria.' 
                : filter !== 'all' 
                  ? `No ${filter} contacts found.` 
                  : 'No contacts added to this flow yet.'}
            </p>
            <button
              onClick={() => setShowAddContact(true)}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue"
            >
              Add your first contact
            </button>
          </div>
        ) : (
          <div className="bg-secondary-bg rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Progress
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Engagement
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Added
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-secondary-bg divide-y divide-gray-700">
                  {filteredContacts.map((contact) => (
                    <tr key={contact.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-white">
                              {contact.firstName} {contact.lastName}
                            </div>
                            <div className="text-sm text-gray-400">
                              {contact.email}
                            </div>
                            {contact.tags.length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {contact.tags.map((tag, index) => (
                                  <span key={index} className="inline-block px-2 py-0.5 text-xs rounded bg-gray-700 text-gray-300">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          contact.status === 'active'
                            ? 'bg-green-900/30 text-green-300'
                            : contact.status === 'completed'
                              ? 'bg-blue-900/30 text-blue-300'
                              : 'bg-red-900/30 text-red-300'
                        }`}>
                          {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {contact.flowProgress.currentStep} of {contact.flowProgress.totalSteps}
                        </div>
                        {contact.status === 'active' && (
                          <div className="text-xs text-gray-400">
                            Next: {new Date(contact.flowProgress.nextEmailDate).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {contact.stats.emailsOpened} / {contact.stats.emailsSent} opened
                        </div>
                        <div className="text-xs text-gray-400">
                          {contact.stats.linksClicked} clicks
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setEditingContact(contact)}
                          className="text-accent-blue hover:text-blue-400 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeletingContact(contact)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {editingContact && (
          <ContactEditModal
            contact={editingContact}
            isOpen={!!editingContact}
            onClose={() => setEditingContact(null)}
            onSave={handleEditContact}
          />
        )}

        {deletingContact && (
          <DeleteConfirmationModal
            isOpen={!!deletingContact}
            onClose={() => setDeletingContact(null)}
            onConfirm={handleDeleteConfirm}
            title="Delete Contact"
            message={`Are you sure you want to delete ${deletingContact.firstName} ${deletingContact.lastName}? This action cannot be undone.`}
          />
        )}
      </main>
    </div>
  );
};

export default ContactManager;
