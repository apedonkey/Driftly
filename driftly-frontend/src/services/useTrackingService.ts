import {
  useEffect,
  useState,
} from 'react';

/**
 * Types for tracking events and analytics
 */
export interface TrackingEvent {
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

export interface FlowAnalytics {
  metrics: {
    open: number;
    click: number;
    clickThroughRate: number;
  };
  timeSeriesData: Array<{
    date: string;
    open?: number;
    click?: number;
  }>;
  stepAnalytics: Array<{
    stepId: string;
    open?: number;
    click?: number;
    clickThroughRate?: number;
  }>;
}

/**
 * A hook for interacting with the email tracking service
 * Uses mock data for now but structured to use the real API later
 */
export const useTrackingService = (flowId?: string) => {
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [analytics, setAnalytics] = useState<FlowAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const baseUrl = process.env.REACT_APP_API_URL || 'https://api.driftly.app';

  /**
   * Fetch tracking events for a flow
   */
  const fetchEvents = async (options: {
    flowId: string;
    startDate?: string;
    endDate?: string;
    type?: 'open' | 'click';
    limit?: number;
    page?: number;
  }) => {
    if (!options.flowId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // For now, we'll use mock data
      // In production, this would be a real API call:
      // const response = await fetch(`${baseUrl}/api/tracking/events/${options.flowId}?...`);
      
      // Mock data for events
      const mockEvents: TrackingEvent[] = [
        {
          id: '1',
          type: 'open',
          flowId: options.flowId,
          stepId: 'step1',
          contactId: 'contact1',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0'
        },
        {
          id: '2',
          type: 'click',
          flowId: options.flowId,
          stepId: 'step1',
          contactId: 'contact1',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 5).toISOString(), // 2 days ago + 5 min
          url: 'https://example.com',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0'
        },
        {
          id: '3',
          type: 'open',
          flowId: options.flowId,
          stepId: 'step1',
          contactId: 'contact2',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          ipAddress: '192.168.1.2',
          userAgent: 'Mozilla/5.0'
        },
        {
          id: '4',
          type: 'open',
          flowId: options.flowId,
          stepId: 'step2',
          contactId: 'contact1',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0'
        }
      ];
      
      // Filter events based on options
      let filteredEvents = [...mockEvents];
      
      if (options.startDate) {
        filteredEvents = filteredEvents.filter(e => 
          new Date(e.timestamp) >= new Date(options.startDate!)
        );
      }
      
      if (options.endDate) {
        filteredEvents = filteredEvents.filter(e => 
          new Date(e.timestamp) <= new Date(options.endDate!)
        );
      }
      
      if (options.type) {
        filteredEvents = filteredEvents.filter(e => e.type === options.type);
      }
      
      // Sort by timestamp descending
      filteredEvents.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      // Apply pagination
      const page = options.page || 1;
      const limit = options.limit || 100;
      const start = (page - 1) * limit;
      const paginatedEvents = filteredEvents.slice(start, start + limit);
      
      setEvents(paginatedEvents);
      
      return {
        events: paginatedEvents,
        pagination: {
          total: filteredEvents.length,
          page,
          limit,
          pages: Math.ceil(filteredEvents.length / limit)
        }
      };
    } catch (err: any) {
      setError(err);
      return {
        events: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          pages: 0
        }
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch analytics for a flow
   */
  const fetchAnalytics = async (options: {
    flowId: string;
    startDate?: string;
    endDate?: string;
    groupBy?: 'hour' | 'day' | 'week' | 'month';
  }) => {
    if (!options.flowId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // For now, we'll use mock data
      // In production, this would be a real API call:
      // const response = await fetch(`${baseUrl}/api/tracking/analytics/${options.flowId}?...`);
      
      // Mock analytics data
      const mockAnalytics: FlowAnalytics = {
        metrics: {
          open: 150,
          click: 75,
          clickThroughRate: 50
        },
        timeSeriesData: [
          {
            date: '2023-07-18',
            open: 50,
            click: 25
          },
          {
            date: '2023-07-19',
            open: 100,
            click: 50
          }
        ],
        stepAnalytics: [
          {
            stepId: 'step1',
            open: 100,
            click: 50,
            clickThroughRate: 50
          },
          {
            stepId: 'step2',
            open: 50,
            click: 25,
            clickThroughRate: 50
          }
        ]
      };
      
      setAnalytics(mockAnalytics);
      return mockAnalytics;
    } catch (err: any) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generate tracking URLs and HTML for both open and click tracking
   */
  const generateTrackingCode = (flowId: string, stepId: string) => {
    const trackingPixelUrl = `${baseUrl}/tracking/pixel.gif?flowId=${flowId}&stepId=${stepId}&contactId={{contactId}}&t=${Date.now()}`;
    const trackingPixelHtml = `<img src="${trackingPixelUrl}" alt="" width="1" height="1" style="display:none;" />`;
    
    const clickTrackingTemplate = `${baseUrl}/tracking/redirect?flowId=${flowId}&stepId=${stepId}&contactId={{contactId}}&url={{YOUR_URL}}`;
    const clickTrackingExample = `<a href="${clickTrackingTemplate}">Click here</a>`;
    
    return {
      trackingPixelUrl,
      trackingPixelHtml,
      clickTrackingTemplate,
      clickTrackingExample
    };
  };

  // Automatically fetch analytics if flowId is provided
  useEffect(() => {
    if (flowId) {
      fetchAnalytics({ flowId });
    }
  }, [flowId]);

  return {
    events,
    analytics,
    loading,
    error,
    fetchEvents,
    fetchAnalytics,
    generateTrackingCode
  };
};

export default useTrackingService; 