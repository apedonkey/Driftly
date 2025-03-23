import React, {
  useEffect,
  useState,
} from 'react';

import {
  ArrowPathIcon,
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

interface TrackingEventsListProps {
  flowId: string;
}

const TrackingEventsList: React.FC<TrackingEventsListProps> = ({ flowId }) => {
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 20,
    pages: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [eventType, setEventType] = useState<'all' | 'open' | 'click'>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  // Calculate date range for last 7 days as default
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  }, []);
  
  // Fetch events when filters change
  useEffect(() => {
    if (!flowId) return;
    
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const options: any = {
          page: pagination.page,
          limit: pagination.limit
        };
        
        if (eventType !== 'all') {
          options.type = eventType;
        }
        
        if (startDate) {
          options.startDate = startDate;
        }
        
        if (endDate) {
          options.endDate = endDate;
        }
        
        const response = await trackingService.getEvents(flowId, options);
        
        if (response && response.success) {
          setEvents(response.data.events.map((event: any) => ({
            ...event,
            type: event.type as 'open' | 'click'
          })));
          setPagination({
            total: response.data.pagination.total,
            page: response.data.pagination.page,
            limit: response.data.pagination.limit,
            pages: response.data.pagination.pages
          });
        } else {
          setError('Failed to load tracking events');
        }
      } catch (err) {
        console.error('Error fetching tracking events:', err);
        setError('An error occurred while loading tracking events');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [flowId, pagination.page, pagination.limit, eventType, startDate, endDate]);
  
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
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setPagination({ ...pagination, page: newPage });
    }
  };
  
  // Handle filter change
  const applyFilters = () => {
    setPagination({ ...pagination, page: 1 });
  };
  
  return (
    <div className="bg-secondary-bg rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-medium text-white mb-2">Email Tracking Events</h3>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Event Type
            </label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value as 'all' | 'open' | 'click')}
              className="block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-accent-blue focus:border-accent-blue text-white text-sm"
            >
              <option value="all">All Events</option>
              <option value="open">Opens</option>
              <option value="click">Clicks</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-accent-blue focus:border-accent-blue text-white text-sm"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-accent-blue focus:border-accent-blue text-white text-sm"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={applyFilters}
              className="w-full px-3 py-2 bg-accent-blue hover:bg-blue-600 text-white rounded-md focus:outline-none flex justify-center items-center space-x-1"
            >
              <ArrowPathIcon className="h-4 w-4" />
              <span>Apply Filters</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Events Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Event
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Step
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Contact
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Date/Time
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="bg-secondary-bg divide-y divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-400">
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent-blue"></div>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-red-400">
                  {error}
                </td>
              </tr>
            ) : events.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-400">
                  No tracking events found
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    <div className="flex items-center">
                      {event.type === 'open' ? (
                        <EnvelopeOpenIcon className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <LinkIcon className="h-5 w-5 text-blue-500 mr-2" />
                      )}
                      <span className="capitalize">{event.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {event.stepId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {event.contactId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatDate(event.timestamp)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {event.type === 'click' && event.url && (
                      <a href={event.url} target="_blank" rel="noopener noreferrer" className="text-accent-blue hover:underline">
                        {truncateUrl(event.url)}
                      </a>
                    )}
                    {event.ipAddress && (
                      <div className="text-xs text-gray-400 mt-1">
                        IP: {event.ipAddress}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {!loading && !error && events.length > 0 && (
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-700">
          <div className="text-sm text-gray-400">
            Showing <span className="font-medium text-white">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
            <span className="font-medium text-white">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            of <span className="font-medium text-white">{pagination.total}</span> results
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

export default TrackingEventsList; 