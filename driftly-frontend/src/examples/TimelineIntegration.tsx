import React from 'react';

import { ClockIcon } from '@heroicons/react/24/outline';

import {
  ContactTimeline,
  TimelineEvent,
} from '../components/ContactTimeline';

// This is an example file showing how to integrate the ContactTimeline component
// into the ContactManager page

interface Contact {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  // other contact properties...
}

export const TimelineIntegrationExample: React.FC = () => {
  // State variables to add to ContactManager.tsx
  const [selectedContactForTimeline, setSelectedContactForTimeline] = React.useState<Contact | null>(null);
  const [timelineEvents, setTimelineEvents] = React.useState<TimelineEvent[]>([]);
  
  // Function to fetch timeline events for a contact - add to ContactManager.tsx
  const fetchTimelineEvents = async (contactId: string) => {
    try {
      // In a real implementation, this would call an API endpoint
      // For now, we'll generate mock data
      const mockEvents: TimelineEvent[] = [
        {
          id: '1',
          contactId: contactId,
          type: 'email_sent',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
          data: {
            emailId: 'email1',
            emailSubject: 'Welcome to our service!'
          }
        },
        {
          id: '2',
          contactId: contactId,
          type: 'email_opened',
          timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
          data: {
            emailId: 'email1',
            emailSubject: 'Welcome to our service!'
          }
        },
        {
          id: '3',
          contactId: contactId,
          type: 'link_clicked',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
          data: {
            emailId: 'email1',
            linkUrl: 'https://example.com/onboarding'
          }
        },
        {
          id: '4',
          contactId: contactId,
          type: 'email_sent',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          data: {
            emailId: 'email2',
            emailSubject: 'Follow-up: Getting Started Guide'
          }
        },
        {
          id: '5',
          contactId: contactId,
          type: 'status_change',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          data: {
            oldStatus: 'new',
            newStatus: 'active'
          }
        }
      ];
      
      setTimelineEvents(mockEvents);
    } catch (err) {
      console.error('Error fetching timeline events:', err);
      // setError('Failed to load timeline events');
    }
  };
  
  // Function to handle viewing a contact's timeline - add to ContactManager.tsx
  const handleViewTimeline = (contact: Contact) => {
    setSelectedContactForTimeline(contact);
    fetchTimelineEvents(contact.id);
  };
  
  // Add this to the Actions column in the table in ContactManager.tsx
  const ActionButtonExample = ({ contact }: { contact: Contact }) => (
    <button
      onClick={() => handleViewTimeline(contact)}
      className="text-gray-400 hover:text-white mr-4"
      title="View Timeline"
    >
      <ClockIcon className="h-5 w-5 inline" />
    </button>
  );
  
  // Add this before the closing </main> tag in ContactManager.tsx
  const TimelineComponentExample = () => (
    selectedContactForTimeline && (
      <div className="mt-8">
        <div className="bg-secondary-bg rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-medium text-white">
              Activity Timeline for {selectedContactForTimeline.firstName} {selectedContactForTimeline.lastName}
            </h2>
            <button
              onClick={() => setSelectedContactForTimeline(null)}
              className="text-gray-400 hover:text-white"
            >
              &times;
            </button>
          </div>
          <div className="p-4">
            <ContactTimeline events={timelineEvents} contactId={selectedContactForTimeline.id} />
          </div>
        </div>
      </div>
    )
  );
  
  // This component doesn't render anything, it's just an example
  return null;
};

/**
 * Integration Instructions for ContactManager.tsx:
 * 
 * 1. Add imports:
 *    - Import ClockIcon from '@heroicons/react/24/outline'
 *    - Import { ContactTimeline, TimelineEvent } from '../components/ContactTimeline'
 * 
 * 2. Add state variables:
 *    - const [selectedContactForTimeline, setSelectedContactForTimeline] = React.useState<Contact | null>(null);
 *    - const [timelineEvents, setTimelineEvents] = React.useState<TimelineEvent[]>([]);
 * 
 * 3. Add the fetchTimelineEvents and handleViewTimeline functions as shown above
 * 
 * 4. Modify the Actions column in the table to include the timeline button:
 *    <button onClick={() => handleViewTimeline(contact)} className="text-gray-400 hover:text-white mr-4" title="View Timeline">
 *      <ClockIcon className="h-5 w-5 inline" />
 *    </button>
 * 
 * 5. Add the Timeline component at the bottom of the main content:
 *    {selectedContactForTimeline && (
 *      <div className="mt-8">
 *        <div className="bg-secondary-bg rounded-lg shadow-md overflow-hidden">
 *          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
 *            <h2 className="text-lg font-medium text-white">
 *              Activity Timeline for {selectedContactForTimeline.firstName} {selectedContactForTimeline.lastName}
 *            </h2>
 *            <button onClick={() => setSelectedContactForTimeline(null)} className="text-gray-400 hover:text-white">
 *              &times;
 *            </button>
 *          </div>
 *          <div className="p-4">
 *            <ContactTimeline events={timelineEvents} contactId={selectedContactForTimeline.id} />
 *          </div>
 *        </div>
 *      </div>
 *    )}
 */ 