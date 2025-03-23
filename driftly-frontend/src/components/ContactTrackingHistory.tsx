import React, {
  useEffect,
  useState,
} from 'react';

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EnvelopeOpenIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';

import { trackingService } from '../services/api';

interface TrackingEvent {
  id: string;
  type: 'open' | 'click';
  flowId: string;
  stepId: string;
  contactId: string;
  timestamp: string;
  url?: string;
  ipAddress?: string;
  userAgent?: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface ContactTrackingHistoryProps {
  contactId: string;
  flowId?: string; // Optional - can filter by flow
}

const ContactTrackingHistory: React.FC<ContactTrackingHistoryProps> = ({ contactId, flowId }) => {
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch tracking events when component mounts or when filters change
  useEffect(() => {
    const fetchContactEvents = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // In a real implementation, we would have a dedicated endpoint for contact events
        // For now, we'll simulate it using our existing mock data
        const response = await trackingService.getEvents(flowId || 'all', {
          page: pagination.page,
          limit: pagination.limit
        });
        
        if (response && response.success) {
          // Filter events for this contact only
          const contactEvents = response.data.events
            .filter((event: any) => event.contactId === contactId)
            .map((event: any) => ({
              ...event,
              type: event.type as 'open' | 'click'
            }));
          
          setEvents(contactEvents);
          setPagination({
            ...pagination,
            total: contactEvents.length,
            pages: Math.ceil(contactEvents.length / pagination.limit)
          });
        } else {
          setError('Failed to load tracking events');
        }
      } catch (err) {
        console.error('Error fetching contact tracking events:', err);
        setError('An error occurred while loading tracking data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchContactEvents();
  }, [contactId, flowId, pagination.page, pagination.limit]);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Truncate URL for display
  const truncateUrl = (url: string, maxLength = 30) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };
  
  // Get device/browser info from user agent
  const getBrowserInfo = (userAgent: string) => {
    if (!userAgent) return 'Unknown';
    
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('MSIE') || userAgent.includes('Trident')) return 'Internet Explorer';
    
    return 'Other Browser';
  };
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setPagination({ ...pagination, page: newPage });
    }
  };
  
  // Get step name (in a real app, we would fetch this from the flow steps data)
  const getStepName = (stepId: string) => {
    // This is a placeholder - in a real app we would get the actual step name
    return stepId.replace('step', 'Email ');
  };
  
  if (loading && events.length === 0) {
    return (
      <div className="bg-secondary-bg rounded-lg p-4">
        <h3 className="text-lg font-medium text-white mb-4">Contact Activity</h3>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent-blue"></div>
        </div>
      </div>
    );
  }
  
  if (error && events.length === 0) {
    return (
      <div className="bg-secondary-bg rounded-lg p-4">
        <h3 className="text-lg font-medium text-white mb-4">Contact Activity</h3>
        <div className="text-center text-red-400 py-4">{error}</div>
      </div>
    );
  }
  
  if (events.length === 0) {
    return (
      <div className="bg-secondary-bg rounded-lg p-4">
        <h3 className="text-lg font-medium text-white mb-4">Contact Activity</h3>
        <div className="text-center text-gray-400 py-4">No tracking events found for this contact</div>
      </div>
    );
  }
  
  return (
    <div className="bg-secondary-bg rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-medium text-white mb-2">Contact Activity</h3>
        <p className="text-sm text-gray-400">Track email engagement for this contact</p>
      </div>
      
      {/* Activity Timeline */}
      <div className="p-4">
        <ul className="space-y-4">
          {events.map((event) => (
            <li key={event.id} className="relative pl-6 pb-4 border-l border-gray-700">
              {/* Event indicator */}
              <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-secondary-bg flex items-center justify-center">
                {event.type === 'open' ? (
                  <EnvelopeOpenIcon className="h-5 w-5 text-green-500" />
                ) : (
                  <LinkIcon className="h-5 w-5 text-blue-500" />
                )}
              </div>
              
              {/* Event content */}
              <div className="ml-2">
                <p className="text-white">
                  <span className="font-medium">
                    {event.type === 'open' ? 'Opened email' : 'Clicked link'} 
                  </span>
                  {' '}in {getStepName(event.stepId)}
                </p>
                <p className="text-sm text-gray-400">{formatDate(event.timestamp)}</p>
                
                {/* Additional details */}
                <div className="mt-2 text-xs text-gray-500 space-y-1">
                  {event.ipAddress && (
                    <p>IP: {event.ipAddress}</p>
                  )}
                  {event.userAgent && (
                    <p>Browser: {getBrowserInfo(event.userAgent)}</p>
                  )}
                  {event.type === 'click' && event.url && (
                    <p>
                      URL: <a href={event.url} target="_blank" rel="noopener noreferrer" className="text-accent-blue hover:underline">
                        {truncateUrl(event.url)}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-700">
          <div className="text-sm text-gray-400">
            Showing <span className="font-medium text-white">{Math.min(events.length, pagination.limit)}</span> of{' '}
            <span className="font-medium text-white">{pagination.total}</span> events
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-2 py-1 rounded text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="px-2 py-1 rounded text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactTrackingHistory; 