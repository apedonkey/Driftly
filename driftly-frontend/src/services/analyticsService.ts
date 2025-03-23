import {
  analyticsData,
  flows,
} from './mockData';

// Define Flow interface to include the steps property
interface Flow {
  id: string;
  name: string;
  description: string;
  status: string;
  createdAt: string;
  contactCount: number;
  messagesSent: number;
  openRate: number;
  clickRate: number;
  steps?: {
    id: string;
    subject: string;
    body?: string;
    delayDays?: number;
    delayHours?: number;
    order: number;
    [key: string]: any;
  }[];
  [key: string]: any;
}

export interface EmailEvent {
  id: string;
  flowId: string;
  stepId: string;
  contactId: string;
  type: 'sent' | 'opened' | 'clicked';
  timestamp: string;
  metadata?: {
    [key: string]: any;
  };
}

export interface AnalyticsTimeSeriesPoint {
  date: string;
  sent?: number;
  opened?: number;
  clicked?: number;
  [key: string]: any;
}

export interface StepPerformance {
  stepId: string;
  stepName: string;
  sent: number;
  opened: number;
  clicked: number;
  openRate: number;
  clickRate: number;
  position: number;
}

export interface FlowAnalyticsSummary {
  totalContacts: number;
  totalEmailsSent: number;
  totalEmailsOpened: number;
  totalEmailsClicked: number;
  openRate: number;
  clickRate: number;
  clickToOpenRate: number;
  performanceByStep: StepPerformance[];
  timeSeriesData: AnalyticsTimeSeriesPoint[];
  contactStatuses: {
    status: string;
    count: number;
    percentage: number;
  }[];
}

// Helper function to get flow based on ID
const getFlow = (flowId: string): Flow | undefined => {
  return flows.find(flow => flow.id === flowId) as Flow | undefined;
};

// Helper function to calculate rates
const calculateRates = (sent: number, opened: number, clicked: number) => {
  const openRate = sent > 0 ? (opened / sent) * 100 : 0;
  const clickRate = sent > 0 ? (clicked / sent) * 100 : 0;
  const clickToOpenRate = opened > 0 ? (clicked / opened) * 100 : 0;
  
  return {
    openRate,
    clickRate,
    clickToOpenRate
  };
};

// Generate mock step performance data
const generateStepPerformanceData = (flowId: string, timeSeries: AnalyticsTimeSeriesPoint[]): StepPerformance[] => {
  const flow = getFlow(flowId);
  if (!flow || !flow.steps) return [];
  
  // Calculate total sent/opened/clicked from time series
  const totals = timeSeries.reduce((acc, day) => {
    acc.sent += day.sent || 0;
    acc.opened += day.opened || 0;
    acc.clicked += day.clicked || 0;
    return acc;
  }, { sent: 0, opened: 0, clicked: 0 });
  
  // Distribute these totals among steps with some variability
  return flow.steps.map((step: {id: string; subject?: string; order?: number}, index: number) => {
    // Earlier steps have more engagement
    const dropOffFactor = 1 - (index * 0.1);
    
    // Calculate metrics with some randomness and dropoff
    const sent = Math.floor(totals.sent * dropOffFactor * (0.9 + Math.random() * 0.2));
    const opened = Math.floor(sent * (0.5 + (Math.random() * 0.3)));
    const clicked = Math.floor(opened * (0.3 + (Math.random() * 0.3)));
    
    const { openRate, clickRate } = calculateRates(sent, opened, clicked);
    
    return {
      stepId: step.id,
      stepName: step.subject || `Step ${index + 1}`,
      sent,
      opened,
      clicked,
      openRate,
      clickRate,
      position: index
    };
  });
};

// Generate contact statuses mock data
const generateContactStatusesData = (totalContacts: number) => {
  // Define possible statuses
  const statuses = ['Active', 'Completed', 'Unsubscribed', 'Bounced'];
  
  // Assign a percentage to each status (should add up to 100%)
  const percentages = [65, 20, 10, 5];
  
  return statuses.map((status, index) => {
    const percentage = percentages[index];
    const count = Math.floor((percentage / 100) * totalContacts);
    
    return {
      status,
      count,
      percentage
    };
  });
};

// Main analytics service
export const analyticsService = {
  getFlowAnalytics: (flowId: string, period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<FlowAnalyticsSummary> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const flow = getFlow(flowId);
          if (!flow) {
            reject(new Error('Flow not found'));
            return;
          }
          
          // Get mock time series data
          const mockData = analyticsData[flowId as keyof typeof analyticsData];
          if (!mockData) {
            reject(new Error('Analytics data not found'));
            return;
          }
          
          const timeSeriesData = mockData[period];
          
          // Calculate total metrics from time series
          const totals = timeSeriesData.reduce((acc, day) => {
            acc.sent += day.sent || 0;
            acc.opened += day.opened || 0;
            acc.clicked += day.clicked || 0;
            return acc;
          }, { sent: 0, opened: 0, clicked: 0 });
          
          // Calculate rates
          const { openRate, clickRate, clickToOpenRate } = calculateRates(
            totals.sent, 
            totals.opened, 
            totals.clicked
          );
          
          // Generate step performance data
          const performanceByStep = generateStepPerformanceData(flowId, timeSeriesData);
          
          // Create analytics summary
          const summary: FlowAnalyticsSummary = {
            totalContacts: flow.contactCount || 0,
            totalEmailsSent: totals.sent,
            totalEmailsOpened: totals.opened,
            totalEmailsClicked: totals.clicked,
            openRate,
            clickRate,
            clickToOpenRate,
            performanceByStep,
            timeSeriesData,
            contactStatuses: generateContactStatusesData(flow.contactCount || 0)
          };
          
          resolve(summary);
        } catch (error) {
          reject(error);
        }
      }, 500); // Simulate API delay
    });
  },
  
  // Get a list of all flows with basic analytics
  getFlowsWithAnalytics: (): Promise<any[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const flowsWithAnalytics = flows.map(flow => {
          // Get analytics data if available
          const flowAnalytics = analyticsData[flow.id as keyof typeof analyticsData];
          
          // Default analytics metrics
          let sent = 0;
          let opened = 0;
          let clicked = 0;
          
          if (flowAnalytics) {
            // Sum up data from the most recent period
            const latestData = flowAnalytics.daily.slice(-7); // Last 7 days
            
            sent = latestData.reduce((total, day) => total + (day.sent || 0), 0);
            opened = latestData.reduce((total, day) => total + (day.opened || 0), 0);
            clicked = latestData.reduce((total, day) => total + (day.clicked || 0), 0);
          }
          
          // Calculate rates
          const { openRate, clickRate, clickToOpenRate } = calculateRates(sent, opened, clicked);
          
          // Return flow with analytics
          return {
            ...flow,
            analytics: {
              sent,
              opened,
              clicked,
              openRate,
              clickRate,
              clickToOpenRate
            }
          };
        });
        
        resolve(flowsWithAnalytics);
      }, 500); // Simulate API delay
    });
  },
  
  // Log an email event (sent, opened, clicked)
  logEmailEvent: (event: Omit<EmailEvent, 'id' | 'timestamp'>): Promise<EmailEvent> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Create a new event with ID and timestamp
        const newEvent: EmailEvent = {
          ...event,
          id: `event-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          timestamp: new Date().toISOString()
        };
        
        // In a real implementation, we would save this event to a database
        console.log('Logged email event:', newEvent);
        
        resolve(newEvent);
      }, 200);
    });
  }
};

export default analyticsService; 