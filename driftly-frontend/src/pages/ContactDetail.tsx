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
  AtSymbolIcon,
  CalendarIcon,
  ChartBarIcon,
  CheckBadgeIcon,
  ClockIcon,
  PencilIcon,
  PhoneIcon,
  TagIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

import ContactEditModal from '../components/ContactEditModal';
import ContactTrackingHistory from '../components/ContactTrackingHistory';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import Navigation from '../components/Navigation';
import { contactService } from '../services/api';
import { Contact } from '../types/Contact';

const ContactDetail: React.FC = () => {
  const { flowId, contactId } = useParams<{ flowId: string; contactId: string }>();
  const navigate = useNavigate();
  
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'tracking'>('overview');
  
  // UI state
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  
  // Fetch contact data
  useEffect(() => {
    if (!flowId || !contactId) return;
    
    const fetchContact = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await contactService.getContact(flowId, contactId);
        
        if (response && response.success) {
          // Ensure the response data conforms to the Contact interface
          const contactData = response.data as Contact;
          
          // Set default values for required fields if they're missing
          if (!contactData.status) {
            contactData.status = 'active';
          }
          
          if (!contactData.flowProgress) {
            contactData.flowProgress = {
              currentStep: 1,
              totalSteps: 1,
              nextEmailDate: new Date().toISOString()
            };
          }
          
          if (!contactData.stats) {
            contactData.stats = {
              emailsSent: 0,
              emailsOpened: 0,
              linksClicked: 0
            };
          }
          
          setContact(contactData);
        } else {
          setError('Failed to load contact data');
        }
      } catch (err) {
        console.error('Error fetching contact:', err);
        setError('An error occurred while loading the contact');
      } finally {
        setLoading(false);
      }
    };
    
    fetchContact();
  }, [flowId, contactId]);
  
  // Handle contact update
  const handleContactUpdate = async (updatedContact: Partial<Contact>) => {
    if (!flowId || !contactId) return;
    
    try {
      setLoading(true);
      
      const response = await contactService.updateContact(flowId, contactId, updatedContact);
      
      if (response && response.success) {
        // Ensure we're preserving the Contact interface fields
        if (contact) {
          // Merge the existing contact data with the updated data
          const mergedContact = {
            ...contact,
            ...response.data,
          };
          setContact(mergedContact);
        } else {
          // If contact was null, ensure the response has all required fields
          const contactData = response.data as Contact;
          if (!contactData.status) contactData.status = 'active';
          if (!contactData.flowProgress) {
            contactData.flowProgress = {
              currentStep: 1,
              totalSteps: 1,
              nextEmailDate: new Date().toISOString()
            };
          }
          if (!contactData.stats) {
            contactData.stats = {
              emailsSent: 0,
              emailsOpened: 0,
              linksClicked: 0
            };
          }
          setContact(contactData);
        }
        setIsEditModalOpen(false);
      } else {
        setError('Failed to update contact');
      }
    } catch (err) {
      console.error('Error updating contact:', err);
      setError('An error occurred while updating the contact');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle contact deletion
  const handleContactDelete = async () => {
    if (!flowId || !contactId) return;
    
    try {
      setLoading(true);
      
      const response = await contactService.deleteContact(flowId, contactId);
      
      if (response && response.success) {
        navigate(`/flows/${flowId}/contacts`);
      } else {
        setError('Failed to delete contact');
        setIsDeleteModalOpen(false);
      }
    } catch (err) {
      console.error('Error deleting contact:', err);
      setError('An error occurred while deleting the contact');
      setIsDeleteModalOpen(false);
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate open rate
  const calculateOpenRate = () => {
    if (!contact || contact.stats.emailsSent === 0) return 0;
    return Math.round((contact.stats.emailsOpened / contact.stats.emailsSent) * 100);
  };
  
  // Calculate click rate
  const calculateClickRate = () => {
    if (!contact || contact.stats.emailsOpened === 0) return 0;
    return Math.round((contact.stats.linksClicked / contact.stats.emailsOpened) * 100);
  };
  
  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Generate contact name for display
  const getContactName = () => {
    if (contact?.name) return contact.name;
    if (contact?.firstName && contact?.lastName) return `${contact.firstName} ${contact.lastName}`;
    if (contact?.firstName) return contact.firstName;
    if (contact?.lastName) return contact.lastName;
    return contact?.email || 'Unknown Contact';
  };
  
  if (loading && !contact) {
    return (
      <div className="min-h-screen bg-primary-bg">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-accent-blue"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error && !contact) {
    return (
      <div className="min-h-screen bg-primary-bg">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button
            onClick={() => navigate(`/flows/${flowId}/contacts`)}
            className="flex items-center text-gray-400 hover:text-white"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            Back to Contacts
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-primary-bg">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error message */}
        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {/* Back button */}
        <div className="mb-6">
          <Link
            to={`/flows/${flowId}/contacts`}
            className="flex items-center text-gray-400 hover:text-white"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            Back to Contacts
          </Link>
        </div>
        
        {/* Contact header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="flex items-center">
            <div className="bg-gray-700 p-3 rounded-full mr-4">
              <UserCircleIcon className="h-8 w-8 text-gray-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{getContactName()}</h1>
              <p className="text-gray-400">{contact?.email}</p>
            </div>
          </div>
          
          <div className="flex mt-4 md:mt-0 space-x-3">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md flex items-center"
            >
              <PencilIcon className="h-5 w-5 mr-1" />
              Edit
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-md"
            >
              Delete
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-700 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-accent-blue text-accent-blue'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'activity'
                  ? 'border-accent-blue text-accent-blue'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              Activity
            </button>
            <button
              onClick={() => setActiveTab('tracking')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tracking'
                  ? 'border-accent-blue text-accent-blue'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              Email Tracking
            </button>
          </nav>
        </div>
        
        {/* Tab content */}
        {activeTab === 'overview' && contact && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Contact Information */}
            <div className="bg-secondary-bg rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-4">Contact Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <AtSymbolIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="text-white">{contact.email}</p>
                  </div>
                </div>
                
                {contact.phone && (
                  <div className="flex items-start">
                    <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-400">Phone</p>
                      <p className="text-white">{contact.phone}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start">
                  <CheckBadgeIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-400">Status</p>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      contact.status === 'active' ? 'bg-green-900/30 text-green-300' : 
                      contact.status === 'completed' ? 'bg-blue-900/30 text-blue-300' : 
                      'bg-gray-700 text-gray-300'
                    }`}>
                      {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                    </div>
                  </div>
                </div>
                
                {contact.tags && contact.tags.length > 0 && (
                  <div className="flex items-start">
                    <TagIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-400">Tags</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {contact.tags.map(tag => (
                          <span 
                            key={tag} 
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-accent-blue/20 text-accent-blue"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start">
                  <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-400">Added</p>
                    <p className="text-white">{formatDate(contact.createdAt)}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <ClockIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-400">Last Active</p>
                    <p className="text-white">{formatDate(contact.lastActive)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Email Campaign Progress */}
            <div className="bg-secondary-bg rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-4">Campaign Progress</h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-400">Current Stage</p>
                <p className="text-white font-medium">{contact.stage || 'Not started'}</p>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-400">Progress</p>
                <div className="mt-1 relative pt-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block text-accent-blue">
                        Step {contact.flowProgress.currentStep} of {contact.flowProgress.totalSteps}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-accent-blue">
                        {Math.round((contact.flowProgress.currentStep / contact.flowProgress.totalSteps) * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mt-1 text-xs flex rounded bg-gray-700">
                    <div 
                      style={{ width: `${(contact.flowProgress.currentStep / contact.flowProgress.totalSteps) * 100}%` }} 
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-accent-blue"
                    ></div>
                  </div>
                </div>
              </div>
              
              {contact.flowProgress.nextEmailDate && (
                <div className="mb-4">
                  <p className="text-sm text-gray-400">Next Email</p>
                  <p className="text-white">{formatDate(contact.flowProgress.nextEmailDate)}</p>
                </div>
              )}
            </div>
            
            {/* Email Engagement Stats */}
            <div className="bg-secondary-bg rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-4">Email Engagement</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 rounded p-3">
                  <p className="text-gray-400 text-sm">Emails Sent</p>
                  <p className="text-white text-xl font-semibold">{contact.stats.emailsSent}</p>
                </div>
                
                <div className="bg-gray-800 rounded p-3">
                  <p className="text-gray-400 text-sm">Opens</p>
                  <p className="text-white text-xl font-semibold">{contact.stats.emailsOpened}</p>
                </div>
                
                <div className="bg-gray-800 rounded p-3">
                  <p className="text-gray-400 text-sm">Clicks</p>
                  <p className="text-white text-xl font-semibold">{contact.stats.linksClicked}</p>
                </div>
                
                <div className="bg-gray-800 rounded p-3">
                  <p className="text-gray-400 text-sm">Open Rate</p>
                  <p className="text-white text-xl font-semibold">{calculateOpenRate()}%</p>
                </div>
              </div>
              
              <div className="mt-4">
                <button
                  onClick={() => setActiveTab('tracking')}
                  className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md flex items-center justify-center"
                >
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  View Full Activity
                </button>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'activity' && (
          <div className="bg-secondary-bg rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-4">Contact Activity Feed</h3>
            <p className="text-gray-400 text-center py-8">Activity feed coming soon</p>
          </div>
        )}
        
        {activeTab === 'tracking' && contactId && (
          <ContactTrackingHistory contactId={contactId} flowId={flowId} />
        )}
      </div>
      
      {/* Edit Modal */}
      {isEditModalOpen && contact && (
        <ContactEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          contact={contact}
          onSave={handleContactUpdate}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleContactDelete}
          title="Delete Contact"
          message="Are you sure you want to delete this contact? This action cannot be undone."
        />
      )}
    </div>
  );
};

export default ContactDetail; 