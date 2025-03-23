import axios from 'axios';

import { Contact } from '../types/Contact';
import {
  analyticsData,
  contacts,
  flows,
  settings,
  templates,
  users,
} from './mockData';

// Define API URL constant
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Define interfaces for our data types
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface Flow {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  contactCount: number;
  messagesSent: number;
  openRate: number;
  clickRate: number;
  status: string;
  steps?: any[];
  [key: string]: any;
}

interface Automation {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  contactCount?: number;
  isActive?: boolean;
  steps: Array<{
    id: string;
    type: 'email' | 'delay' | 'condition' | 'action';
    name: string;
    subject?: string;
    body?: string;
    delayDays?: number;
    delayHours?: number;
    condition?: {
      type: string;
      value?: string;
    };
    action?: {
      type: string;
      value?: string;
    };
    order: number;
  }>;
  triggers?: Array<{
    type: 'manual' | 'scheduled' | 'event' | 'form_submission' | 'api_trigger';
    config?: any;
  }>;
  [key: string]: any;
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  createdAt: string;
  steps: {
    order: number;
    subject: string;
    body: string;
    delayDays: number;
    delayHours: number;
  }[];
  [key: string]: any;
}

interface Settings {
  apiKey: string;
  webhook: any;
  [key: string]: any;
}

interface ApiResponse<T> {
  success: boolean;
  count?: number;
  data: T;
}

// Rename to APIContact to avoid conflicts with imported Contact
interface APIContact {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status: string;
  lastError?: {
    stepId: string;
    errorType: string;
    errorMessage: string;
    timestamp: string;
  };
  [key: string]: any;
}

// Add the Error interface
interface Error {
  date: string;
  contactId: string;
  stepId: string;
  stepName: string;
  errorType: string;
  errorMessage: string;
  additionalData?: any;
}

// Interfaces for automation analytics and error stats
interface ErrorTypeData {
  type: string;
  count: number;
  percentage: number;
}

interface StepErrorData {
  stepId: string;
  stepName: string;
  count: number;
  percentage: number;
}

interface ErrorStat {
  count: number;
  name: string;
}

interface ErrorStats {
  totalErrors: number;
  byStep: Record<string, ErrorStat>;
  byType: Record<string, number>;
  recentErrors?: Error[];
}

interface StepMetric {
  stepId: string;
  name: string;
  totalProcessed: number;
  successRate: number;
  avgProcessingTime: number;
  errorCount: number;
  errorRate: number;
  errorDetails: Array<{
    errorType: string;
    count: number;
  }>;
  processingTimes: Array<{
    date: string;
    avgTime: number;
  }>;
}

interface DailyTrend {
  date: string;
  active: number;
  completed: number;
  paused: number;
  error: number;
}

interface ErrorRecord {
  date: string;
  stepId: string;
  stepName: string;
  errorType: string;
  count: number;
}

interface ProcessingMetrics {
  totalProcessed: number;
  averageProcessingTime: number;
  successRate: number;
  lastProcessed: string;
}

interface AnalyticsResponse {
  contactCount: number;
  statusCounts: {
    active: number;
    completed: number;
    paused: number;
    error: number;
  };
  stepMetrics: StepMetric[];
  trend: DailyTrend[];
  errors: ErrorRecord[];
  processingMetrics: ProcessingMetrics;
}

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle token expiration
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Mock API response helper
const mockResponse = <T>(data: T, delay = 300): Promise<ApiResponse<T>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ 
        success: true,
        count: Array.isArray(data) ? data.length : undefined,
        data 
      });
    }, delay);
  });
};

// Auth services
export const authService = {
  login: (email: string, password: string) => {
    // Simple mock authentication
    const user = users.find(u => u.email === email);
    if (user && password === 'password') {
      localStorage.setItem('token', 'mock-token-12345');
      localStorage.setItem('user', JSON.stringify(user));
      return mockResponse({ user, token: 'mock-token-12345' });
    }
    return Promise.reject({ response: { status: 401, data: { message: 'Invalid credentials' } } });
  },
  register: (name: string, email: string, password: string) => {
    const newUser = { id: (users.length + 1).toString(), name, email, createdAt: new Date().toISOString() };
    users.push(newUser);
    localStorage.setItem('token', 'mock-token-12345');
    localStorage.setItem('user', JSON.stringify(newUser));
    return mockResponse({ user: newUser, token: 'mock-token-12345' });
  },
  forgotPassword: (email: string) => {
    const user = users.find(u => u.email === email);
    if (!user) {
      return Promise.reject({ response: { status: 404, data: { message: 'User not found' } } });
    }
    return mockResponse({ message: 'Password reset instructions sent' });
  },
  resetPassword: (token: string, password: string) => {
    return mockResponse({ message: 'Password has been reset' });
  },
  getProfile: () => {
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      return Promise.reject({ response: { status: 401, data: { message: 'Unauthorized' } } });
    }
    return mockResponse({ user: JSON.parse(userJson) });
  },
  updateProfile: (data: Partial<User>) => {
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      return Promise.reject({ response: { status: 401, data: { message: 'Unauthorized' } } });
    }
    const user = JSON.parse(userJson);
    const updatedUser = { ...user, ...data };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return mockResponse({ user: updatedUser });
  },
  changePassword: (currentPassword: string, newPassword: string) => {
    return mockResponse({ message: 'Password updated successfully' });
  },
};

interface AnalyticsParams {
  dateRange?: string;
  period?: string;
  [key: string]: any;
}

// Flow services
export const flowService = {
  // Helper function to get flows from localStorage or use default flows
  getFlowsFromStorage: () => {
    const storedFlows = localStorage.getItem('flows');
    if (storedFlows) {
      return JSON.parse(storedFlows);
    }
    // If no stored flows, initialize with default flows
    localStorage.setItem('flows', JSON.stringify(flows));
    return flows;
  },

  // Helper function to update flows in localStorage
  updateFlowsInStorage: (updatedFlows: any[]) => {
    localStorage.setItem('flows', JSON.stringify(updatedFlows));
  },

  getFlows: () => {
    const storedFlows = flowService.getFlowsFromStorage();
    return mockResponse(storedFlows);
  },

  getFlow: (id: string) => {
    const storedFlows = flowService.getFlowsFromStorage();
    const flow = storedFlows.find((f: Flow) => f.id === id);
    if (!flow) {
      return Promise.reject({ response: { status: 404, data: { message: 'Flow not found' } } });
    }
    return mockResponse(flow);
  },

  createFlow: (data: Partial<Flow>) => {
    // Generate a unique ID using timestamp and random string
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 9);
    const newFlowId = `flow-${timestamp}-${randomStr}`;
    
    console.log('Generated flow ID:', newFlowId);
    
    // Create the new flow object with the generated ID first
    const newFlow = {
      ...data, // Spread the input data first
      id: newFlowId, // Then explicitly set the ID to ensure it's not overwritten
      createdAt: new Date().toISOString(),
      contactCount: 0,
      messagesSent: 0,
      openRate: 0,
      clickRate: 0,
      status: 'inactive',
      description: data.description || '',
      name: data.name || 'Untitled Flow',
    };
    
    // Ensure the flow has all required fields
    if (!newFlow.id) {
      console.error('Failed to generate flow ID');
      return Promise.reject({ response: { status: 500, data: { message: 'Failed to create flow' } } });
    }
    
    console.log('Creating new flow:', newFlow);
    
    // Get current flows from storage
    const storedFlows = flowService.getFlowsFromStorage();
    // Add new flow
    storedFlows.push(newFlow);
    // Update storage
    flowService.updateFlowsInStorage(storedFlows);
    
    return mockResponse(newFlow);
  },

  updateFlow: (id: string, data: Partial<Flow>) => {
    const storedFlows = flowService.getFlowsFromStorage();
    const index = storedFlows.findIndex((f: Flow) => f.id === id);
    if (index === -1) {
      return Promise.reject({ response: { status: 404, data: { message: 'Flow not found' } } });
    }
    const updatedFlow = { ...storedFlows[index], ...data };
    storedFlows[index] = updatedFlow;
    flowService.updateFlowsInStorage(storedFlows);
    return mockResponse(updatedFlow);
  },
  
  // New function to specifically update just the steps of a flow
  updateFlowSteps: (id: string, steps: any[]) => {
    console.log('Updating steps for flow:', id);
    console.log('New steps:', steps);
    
    const storedFlows = flowService.getFlowsFromStorage();
    const index = storedFlows.findIndex((f: Flow) => f.id === id);
    
    if (index === -1) {
      console.error('Flow not found with ID:', id);
      return Promise.reject({ response: { status: 404, data: { message: 'Flow not found' } } });
    }
    
    // Ensure all steps have required properties and proper order
    const formattedSteps = steps.map((step, idx) => ({
      ...step,
      id: step.id || `step-${Date.now()}-${idx}`,
      order: idx // Ensure steps are in correct order
    }));
    
    // Update just the steps property
    storedFlows[index].steps = formattedSteps;
    
    // Update storage
    flowService.updateFlowsInStorage(storedFlows);
    
    // Return the updated flow object
    return mockResponse(storedFlows[index]);
  },

  deleteFlow: (id: string) => {
    console.log('Attempting to delete flow with ID:', id);
    
    const storedFlows = flowService.getFlowsFromStorage();
    console.log('Current flows:', storedFlows);
    
    // Find the flow by ID
    const index = storedFlows.findIndex((f: Flow) => {
      console.log('Comparing flow ID:', f.id, 'with:', id);
      return f.id === id;
    });
    
    console.log('Found flow at index:', index);
    
    if (index === -1) {
      console.error('Flow not found with ID:', id);
      return Promise.reject({ response: { status: 404, data: { message: 'Flow not found' } } });
    }
    
    // Remove the flow from the array
    const deletedFlow = storedFlows[index];
    storedFlows.splice(index, 1);
    
    // Update storage
    flowService.updateFlowsInStorage(storedFlows);
    
    // Also remove any associated contacts
    delete contacts[id as keyof typeof contacts];
    
    // Return a success response with the deleted flow's ID
    return mockResponse({ id: deletedFlow.id, message: 'Flow deleted successfully' });
  },

  activateFlow: (id: string) => {
    const storedFlows = flowService.getFlowsFromStorage();
    const index = storedFlows.findIndex((f: Flow) => f.id === id);
    if (index === -1) {
      return Promise.reject({ response: { status: 404, data: { message: 'Flow not found' } } });
    }
    storedFlows[index].status = 'active';
    flowService.updateFlowsInStorage(storedFlows);
    return mockResponse(storedFlows[index]);
  },

  deactivateFlow: (id: string) => {
    const storedFlows = flowService.getFlowsFromStorage();
    const index = storedFlows.findIndex((f: Flow) => f.id === id);
    if (index === -1) {
      return Promise.reject({ response: { status: 404, data: { message: 'Flow not found' } } });
    }
    storedFlows[index].status = 'inactive';
    flowService.updateFlowsInStorage(storedFlows);
    return mockResponse(storedFlows[index]);
  },

  getFlowAnalytics: (id: string, params?: AnalyticsParams) => {
    const analytics = analyticsData[id as keyof typeof analyticsData];
    if (!analytics) {
      return Promise.reject({ response: { status: 404, data: { message: 'Analytics not found' } } });
    }
    
    let period = 'daily';
    if (params && params.period) {
      period = params.period;
    }
    
    return mockResponse(analytics[period as keyof typeof analytics]);
  },
  // Add missing getTemplate function that's used in FlowBuilder.tsx
  getTemplate: (id: string) => {
    const template = templates.find(t => t.id === id);
    if (!template) {
      return Promise.reject({ response: { status: 404, data: { message: 'Template not found' } } });
    }
    return mockResponse(template);
  }
};

// Contact services
export const contactService = {
  getContacts: (flowId: string) => {
    const flowContacts = contacts[flowId as keyof typeof contacts];
    if (!flowContacts) {
      return mockResponse([]);
    }
    return mockResponse(flowContacts);
  },
  getContact: (flowId: string, contactId: string) => {
    const flowContacts = contacts[flowId as keyof typeof contacts];
    if (!flowContacts) {
      return Promise.reject({ response: { status: 404, data: { message: 'Flow not found' } } });
    }
    const contact = flowContacts.find((c: any) => c.id === contactId);
    if (!contact) {
      return Promise.reject({ response: { status: 404, data: { message: 'Contact not found' } } });
    }
    
    // Cast to "any" to avoid TypeScript errors with possible missing fields
    const contactAny = contact as any;
    
    // Add tracking and flow progress data for the UI
    const enhancedContact = {
      id: contactAny.id || '',
      email: contactAny.email || '',
      name: contactAny.name || '',
      firstName: contactAny.firstName,
      lastName: contactAny.lastName,
      phone: contactAny.phone || '',
      status: contactAny.status || 'active',
      flowProgress: contactAny.flowProgress || {
        currentStep: Math.floor(Math.random() * 5) + 1,
        totalSteps: 5,
        nextEmailDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString() // 2 days from now
      },
      stats: contactAny.stats || {
        emailsSent: Math.floor(Math.random() * 10) + 1,
        emailsOpened: Math.floor(Math.random() * 8) + 1,
        linksClicked: Math.floor(Math.random() * 5)
      },
      tags: contactAny.tags || [],
      lastActive: contactAny.lastActive || new Date().toISOString(),
      createdAt: contactAny.createdAt || new Date().toISOString(),
      stage: contactAny.stage || ['Welcome Email', 'Follow Up 1', 'Follow Up 2', 'Final Email'][Math.floor(Math.random() * 4)]
    };
    
    return mockResponse(enhancedContact);
  },
  addContact: (flowId: string, data: Partial<Contact>) => {
    if (!contacts[flowId as keyof typeof contacts]) {
      (contacts as any)[flowId] = [];
    }
    
    // Create a new contact with all required fields
    const newContact = {
      id: Math.random().toString(36).substring(2, 9),
      email: data.email || '',
      name: data.name || '',
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone || '',
      status: data.status || 'active',
      flowProgress: {
        currentStep: 1,
        totalSteps: 5,
        nextEmailDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString() // 2 days from now
      },
      stats: {
        emailsSent: 0,
        emailsOpened: 0,
        linksClicked: 0
      },
      tags: data.tags || [],
      lastActive: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      stage: 'Welcome Email'
    };
    
    (contacts as any)[flowId].push(newContact);
    return mockResponse(newContact);
  },
  updateContact: (flowId: string, contactId: string, data: Partial<Contact>) => {
    const flowContacts = contacts[flowId as keyof typeof contacts];
    if (!flowContacts) {
      return Promise.reject({ response: { status: 404, data: { message: 'Flow not found' } } });
    }
    const contactIndex = flowContacts.findIndex((c: any) => c.id === contactId);
    if (contactIndex === -1) {
      return Promise.reject({ response: { status: 404, data: { message: 'Contact not found' } } });
    }
    
    // Get the existing contact as any to avoid type issues
    const existingContact = flowContacts[contactIndex] as any;
    
    // Update the contact in our mock data
    flowContacts[contactIndex] = {
      ...existingContact,
      ...data
    };
    
    // Ensure the returned contact has all required fields for the Contact interface
    const enhancedContact = {
      id: existingContact.id || '',
      email: data.email || existingContact.email || '',
      name: data.name || existingContact.name || '',
      firstName: data.firstName !== undefined ? data.firstName : existingContact.firstName,
      lastName: data.lastName !== undefined ? data.lastName : existingContact.lastName,
      phone: data.phone || existingContact.phone || '',
      status: data.status || existingContact.status || 'active',
      flowProgress: data.flowProgress || existingContact.flowProgress || {
        currentStep: Math.floor(Math.random() * 5) + 1,
        totalSteps: 5,
        nextEmailDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString() // 2 days from now
      },
      stats: data.stats || existingContact.stats || {
        emailsSent: Math.floor(Math.random() * 10) + 1,
        emailsOpened: Math.floor(Math.random() * 8) + 1,
        linksClicked: Math.floor(Math.random() * 5)
      },
      tags: data.tags || existingContact.tags || [],
      lastActive: existingContact.lastActive || new Date().toISOString(),
      createdAt: existingContact.createdAt || new Date().toISOString(),
      stage: data.stage || existingContact.stage || ['Welcome Email', 'Follow Up 1', 'Follow Up 2', 'Final Email'][Math.floor(Math.random() * 4)]
    };
    
    return mockResponse(enhancedContact);
  },
  deleteContact: (flowId: string, contactId: string) => {
    const flowContacts = contacts[flowId as keyof typeof contacts];
    if (!flowContacts) {
      return Promise.reject({ response: { status: 404, data: { message: 'Flow not found' } } });
    }
    const index = flowContacts.findIndex((c: any) => c.id === contactId);
    if (index === -1) {
      return Promise.reject({ response: { status: 404, data: { message: 'Contact not found' } } });
    }
    flowContacts.splice(index, 1);
    return mockResponse({ message: 'Contact deleted successfully' });
  },
  importContacts: (flowId: string, formData: any) => {
    // Simulate adding multiple contacts
    if (!contacts[flowId as keyof typeof contacts]) {
      (contacts as any)[flowId] = [];
    }
    
    // Add 5 mock imported contacts
    const newContacts = [];
    for (let i = 0; i < 5; i++) {
      const newContact = {
        id: Math.random().toString(36).substring(2, 9),
        name: `Imported Contact ${i+1}`,
        email: `imported${i+1}@example.com`,
        phone: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        tags: ['imported'],
        lastActive: new Date().toISOString(),
        stage: 'Welcome Email',
      };
      (contacts as any)[flowId].push(newContact);
      newContacts.push(newContact);
    }
    
    return mockResponse({ 
      message: 'Contacts imported successfully', 
      count: 5,
      contacts: newContacts
    });
  },
};

// Template services
export const templateService = {
  getTemplates: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/templates`);
      return response.data;
    } catch (error) {
      console.error('Error fetching templates:', error);
      // Fall back to mock data if API fails
      return templateService._getMockTemplates();
    }
  },
  
  getTemplate: async (id: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/templates/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching template ${id}:`, error);
      // Fall back to mock data if API fails
      return templateService._getMockTemplate(id);
    }
  },
  
  createTemplate: async (data: Partial<Template>) => {
    try {
      const response = await axios.post(`${API_URL}/api/templates`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  },
  
  updateTemplate: async (id: string, data: Partial<Template>) => {
    try {
      const response = await axios.put(`${API_URL}/api/templates/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating template ${id}:`, error);
      throw error;
    }
  },
  
  deleteTemplate: async (id: string) => {
    try {
      const response = await axios.delete(`${API_URL}/api/templates/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting template ${id}:`, error);
      throw error;
    }
  },
  
  // Fallback to mock if API fails or for development
  _getMockTemplates: () => mockResponse(templates),
  _getMockTemplate: (id: string) => {
    const template = templates.find(t => t.id === id);
    if (!template) {
      return Promise.reject({ response: { status: 404, data: { message: 'Template not found' } } });
    }
    return mockResponse(template);
  },
};

// Settings services
export const settingsService = {
  getSettings: () => mockResponse(settings),
  updateSettings: (data: Partial<Settings>) => {
    Object.assign(settings, data);
    return mockResponse(settings);
  },
  getApiKey: () => mockResponse({ apiKey: settings.apiKey }),
  regenerateApiKey: () => {
    settings.apiKey = 'new-mock-api-key-' + Math.random().toString(36).substring(2, 9);
    return mockResponse({ apiKey: settings.apiKey });
  },
  updateWebhook: (data: any) => {
    settings.webhook = { ...settings.webhook, ...data };
    return mockResponse(settings.webhook);
  },
};

// Tracking services - mock implementation for email tracking
export const trackingService = {
  // Get tracking events for a flow
  getEvents: (flowId: string, options?: {
    startDate?: string;
    endDate?: string;
    type?: 'open' | 'click';
    limit?: number;
    page?: number;
  }) => {
    // Mock tracking events data with open and click events
    const mockEvents = [
      {
        id: '1',
        type: 'open',
        flowId,
        stepId: 'step1',
        contactId: 'contact1',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      },
      {
        id: '2',
        type: 'click',
        flowId,
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
        flowId,
        stepId: 'step1',
        contactId: 'contact2',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        ipAddress: '192.168.1.2',
        userAgent: 'Mozilla/5.0'
      }
    ];

    // Apply filters based on options
    let filteredEvents = [...mockEvents];
    
    if (options?.startDate) {
      filteredEvents = filteredEvents.filter(e => 
        new Date(e.timestamp) >= new Date(options.startDate!)
      );
    }
    
    if (options?.endDate) {
      filteredEvents = filteredEvents.filter(e => 
        new Date(e.timestamp) <= new Date(options.endDate!)
      );
    }
    
    if (options?.type) {
      filteredEvents = filteredEvents.filter(e => e.type === options.type);
    }
    
    // Sort by timestamp descending
    filteredEvents.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    // Apply pagination
    const page = options?.page || 1;
    const limit = options?.limit || 100;
    const start = (page - 1) * limit;
    const paginatedEvents = filteredEvents.slice(start, start + limit);
    
    return mockResponse({
      events: paginatedEvents,
      pagination: {
        total: filteredEvents.length,
        page,
        limit,
        pages: Math.ceil(filteredEvents.length / limit)
      }
    });
  },
  
  // Get analytics for a flow
  getAnalytics: (flowId: string, options?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'hour' | 'day' | 'week' | 'month';
  }) => {
    // Mock analytics data
    const analyticsData = {
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
    
    return mockResponse({ data: analyticsData });
  },
  
  // Generate tracking code for email templates
  generateTrackingCode: (flowId: string, stepId: string, baseUrl = process.env.REACT_APP_API_URL || 'https://api.driftly.app') => {
    // Use the actual API endpoint if in production
    if (process.env.NODE_ENV === 'production') {
      return api.get(`/tracking/generate/${flowId}/${stepId}`)
        .then(response => response.data);
    }
    
    // For development, use mock data
    const trackingPixelUrl = `${baseUrl}/tracking/pixel.gif?flowId=${flowId}&stepId=${stepId}&contactId={{contactId}}&t=${Date.now()}`;
    const trackingPixelHtml = `<img src="${trackingPixelUrl}" alt="" width="1" height="1" style="display:none;" />`;
    
    const clickTrackingTemplate = `${baseUrl}/tracking/redirect?flowId=${flowId}&stepId=${stepId}&contactId={{contactId}}&url={{YOUR_URL}}`;
    const clickTrackingExample = `<a href="${clickTrackingTemplate}">Click here</a>`;
    
    return mockResponse({
      trackingPixelUrl,
      trackingPixelHtml,
      clickTrackingTemplate,
      clickTrackingExample
    });
  }
};

// Mock automations data
const automations: Automation[] = [
  {
    id: '1',
    name: 'Welcome Sequence',
    description: 'Onboard new users with a series of emails',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    contactCount: 142,
    steps: [
      {
        id: 'step1',
        type: 'email',
        name: 'Welcome Email',
        subject: 'Welcome to Driftly!',
        body: '<p>Thank you for signing up. We\'re excited to have you!</p>',
        order: 0
      },
      {
        id: 'step2',
        type: 'delay',
        name: 'Wait 2 Days',
        delayDays: 2,
        delayHours: 0,
        order: 1
      },
      {
        id: 'step3',
        type: 'condition',
        name: 'Check First Email Open',
        condition: {
          type: 'open',
          value: 'step1'
        },
        order: 2
      },
      {
        id: 'step4',
        type: 'email',
        name: 'Feature Overview',
        subject: 'Discover what you can do with Driftly',
        body: '<p>Here are some of our top features...</p>',
        order: 3
      }
    ],
    triggers: [
      {
        type: 'manual'
      }
    ]
  },
  {
    id: '2',
    name: 'Re-engagement Campaign',
    description: 'Bring back inactive users',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'inactive',
    contactCount: 87,
    steps: [
      {
        id: 'step1',
        type: 'email',
        name: 'We Miss You',
        subject: 'We haven\'t seen you in a while!',
        body: '<p>It\'s been a while since you logged in...</p>',
        order: 0
      },
      {
        id: 'step2',
        type: 'delay',
        name: 'Wait 3 Days',
        delayDays: 3,
        delayHours: 0,
        order: 1
      },
      {
        id: 'step3',
        type: 'action',
        name: 'Add Tag',
        action: {
          type: 'tag',
          value: 'reengagement-attempt'
        },
        order: 2
      }
    ],
    triggers: [
      {
        type: 'scheduled',
        config: {
          frequency: 'weekly'
        }
      }
    ]
  }
];

// Automation services
export const automationService = {
  // Helper function to get automations from localStorage or use default automations
  getAutomationsFromStorage: () => {
    const storedAutomations = localStorage.getItem('automations');
    if (storedAutomations) {
      return JSON.parse(storedAutomations);
    }
    // If no stored automations, initialize with default automations
    localStorage.setItem('automations', JSON.stringify(automations));
    return automations;
  },

  // Helper function to update automations in localStorage
  updateAutomationsInStorage: (updatedAutomations: Automation[]) => {
    localStorage.setItem('automations', JSON.stringify(updatedAutomations));
  },

  getAutomations: () => {
    const storedAutomations = automationService.getAutomationsFromStorage();
    return mockResponse(storedAutomations);
  },

  getAutomation: async (id: string): Promise<Automation & { _id: string; isActive: boolean }> => {
    const storedAutomations = automationService.getAutomationsFromStorage();
    const automation = storedAutomations.find((a: Automation) => a.id === id);
    
    if (!automation) {
      return Promise.reject({ response: { status: 404, data: { message: 'Automation not found' } } });
    }
    
    // Create enhanced steps with config property
    const enhancedSteps = (automation.steps || []).map((step: Automation['steps'][0]) => {
      // Create a config object based on the step type
      let config: Record<string, any> = {};
      
      if (step.type === 'email') {
        config = {
          subject: step.subject || '',
          body: step.body || ''
        };
      } else if (step.type === 'delay') {
        config = {
          days: step.delayDays || 0,
          hours: step.delayHours || 0
        };
      } else if (step.type === 'condition') {
        config = step.condition || { type: 'default', value: '' };
      } else if (step.type === 'action') {
        config = step.action || { type: 'default', value: '' };
      }
      
      return {
        ...step,
        config
      };
    });
    
    // Ensure we're returning the data property directly with added properties expected by components
    return {
      ...automation,
      // Replace steps with enhanced steps including config property
      steps: enhancedSteps,
      // Ensure description is a string not undefined
      description: automation.description || '',
      // Add _id and isActive properties for compatibility with component interfaces
      _id: automation.id,
      isActive: automation.status === 'active'
    };
  },

  createAutomation: (data: Partial<Automation>) => {
    const storedAutomations = automationService.getAutomationsFromStorage();
    const newId = (storedAutomations.length + 1).toString();
    const now = new Date().toISOString();
    
    const newAutomation: Automation = {
      id: newId,
      name: data.name || 'Untitled Automation',
      description: data.description || '',
      createdAt: now,
      updatedAt: now,
      status: 'inactive',
      contactCount: 0,
      steps: data.steps || [],
      triggers: data.triggers || [{ type: 'manual' }]
    };
    
    storedAutomations.push(newAutomation);
    automationService.updateAutomationsInStorage(storedAutomations);
    
    return mockResponse(newAutomation);
  },

  updateAutomation: (id: string, data: Partial<Automation>) => {
    const storedAutomations = automationService.getAutomationsFromStorage();
    const index = storedAutomations.findIndex((a: Automation) => a.id === id);
    
    if (index === -1) {
      return Promise.reject({ response: { status: 404, data: { message: 'Automation not found' } } });
    }
    
    // Update automation with new data
    const updatedAutomation: Automation = {
      ...storedAutomations[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    storedAutomations[index] = updatedAutomation;
    automationService.updateAutomationsInStorage(storedAutomations);
    
    return mockResponse(updatedAutomation);
  },

  deleteAutomation: (id: string) => {
    const storedAutomations = automationService.getAutomationsFromStorage();
    const index = storedAutomations.findIndex((a: Automation) => a.id === id);
    
    if (index === -1) {
      return Promise.reject({ response: { status: 404, data: { message: 'Automation not found' } } });
    }
    
    storedAutomations.splice(index, 1);
    automationService.updateAutomationsInStorage(storedAutomations);
    
    return mockResponse({ success: true });
  },

  activateAutomation: (id: string) => {
    const storedAutomations = automationService.getAutomationsFromStorage();
    const index = storedAutomations.findIndex((a: Automation) => a.id === id);
    
    if (index === -1) {
      return Promise.reject({ response: { status: 404, data: { message: 'Automation not found' } } });
    }
    
    storedAutomations[index].status = 'active';
    storedAutomations[index].updatedAt = new Date().toISOString();
    
    automationService.updateAutomationsInStorage(storedAutomations);
    
    return mockResponse(storedAutomations[index]);
  },

  deactivateAutomation: (id: string) => {
    const storedAutomations = automationService.getAutomationsFromStorage();
    const index = storedAutomations.findIndex((a: Automation) => a.id === id);
    
    if (index === -1) {
      return Promise.reject({ response: { status: 404, data: { message: 'Automation not found' } } });
    }
    
    storedAutomations[index].status = 'inactive';
    storedAutomations[index].updatedAt = new Date().toISOString();
    
    automationService.updateAutomationsInStorage(storedAutomations);
    
    return mockResponse(storedAutomations[index]);
  },

  updateAutomationSteps: (id: string, steps: Automation['steps']) => {
    const storedAutomations = automationService.getAutomationsFromStorage();
    const index = storedAutomations.findIndex((a: Automation) => a.id === id);
    
    if (index === -1) {
      return Promise.reject({ response: { status: 404, data: { message: 'Automation not found' } } });
    }
    
    storedAutomations[index].steps = steps;
    storedAutomations[index].updatedAt = new Date().toISOString();
    
    automationService.updateAutomationsInStorage(storedAutomations);
    
    return mockResponse(storedAutomations[index]);
  },

  getAutomationAnalytics: async (id: string): Promise<AnalyticsResponse> => {
    // Find the actual automation to get relevant data
    const storedAutomations = automationService.getAutomationsFromStorage();
    const automation = storedAutomations.find((a: Automation) => a.id === id);
    
    if (!automation) {
      return Promise.reject({ response: { status: 404, data: { message: 'Automation not found' } } });
    }

    const contactCount = automation.contactCount || Math.floor(Math.random() * 1000) + 500;
    const isActive = automation.status === 'active';
    
    // Generate realistic status counts based on the actual automation
    const statusCounts = {
      active: isActive ? Math.floor(contactCount * 0.6) : Math.floor(contactCount * 0.2),
      completed: Math.floor(contactCount * (isActive ? 0.25 : 0.7)),
      paused: Math.floor(contactCount * 0.1),
      error: Math.floor(contactCount * 0.05)
    };
    
    // Ensure totals add up correctly
    const calculatedTotal = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
    if (calculatedTotal !== contactCount) {
      statusCounts.active += (contactCount - calculatedTotal);
    }
    
    // Generate step metrics based on actual steps in the automation
    const stepMetrics: StepMetric[] = automation.steps.map((step: Automation['steps'][0], index: number) => {
      const stepTotalProcessed = Math.floor(contactCount * (1 - (index * 0.15))) + 50;
      const successRate = 0.95 - (index * 0.03);
      const errorRate = 1 - successRate;
      const errorCount = Math.floor(stepTotalProcessed * errorRate);
      
      return {
        stepId: step.id,
        name: step.name || step.subject || `Step ${index + 1}`,
        totalProcessed: stepTotalProcessed,
        successRate: successRate,
        avgProcessingTime: 1 + (Math.random() * index),
        errorCount: errorCount,
        errorRate: errorRate,
        errorDetails: [
          { errorType: 'email_delivery_failed', count: Math.floor(errorCount * 0.7) },
          { errorType: 'rate_limited', count: Math.floor(errorCount * 0.3) }
        ],
        processingTimes: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          avgTime: 1 + Math.random() * (index * 0.5)
        }))
      };
    });
    
    // Generate daily trends for the past 14 days
    const trend = Array.from({ length: 14 }, (_, i) => {
      // Start with higher numbers for more recent days
      const factor = 1 - (i / 28);
      const total = Math.floor(contactCount * factor * (0.1 + Math.random() * 0.05));
      
      return {
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        active: Math.floor(total * (isActive ? 0.6 : 0.2)),
        completed: Math.floor(total * (isActive ? 0.25 : 0.65)),
        paused: Math.floor(total * 0.1),
        error: Math.floor(total * 0.05)
      };
    });
    
    // Generate errors based on the step metrics
    const errors = stepMetrics.flatMap((metric: StepMetric, stepIndex: number) => {
      return Array.from({ length: Math.floor(metric.errorCount / 10) }, (_, i) => {
        const errorTypes = ['email_delivery_failed', 'rate_limited', 'contact_validation_failed', 'condition_error'];
        return {
          date: new Date(Date.now() - (Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
          stepId: metric.stepId,
          stepName: metric.name,
          errorType: errorTypes[Math.floor(Math.random() * errorTypes.length)],
          count: Math.floor(Math.random() * 10) + 1
        };
      });
    });
    
    // Generate overall processing metrics
    const processingMetrics = {
      totalProcessed: stepMetrics.reduce((sum: number, metric: StepMetric) => sum + metric.totalProcessed, 0),
      averageProcessingTime: stepMetrics.reduce((sum: number, metric: StepMetric) => sum + metric.avgProcessingTime, 0) / stepMetrics.length,
      successRate: stepMetrics.reduce((sum: number, metric: StepMetric) => sum + metric.successRate, 0) / stepMetrics.length,
      lastProcessed: new Date().toISOString()
    };
    
    const analyticsData: AnalyticsResponse = {
      contactCount,
      statusCounts,
      stepMetrics,
      trend,
      errors,
      processingMetrics
    };

    const response = await mockResponse(analyticsData);
    return response.data;
  },

  getAutomationErrorStats: async (id: string): Promise<ErrorStats> => {
    // Find the actual automation to get relevant data
    const storedAutomations = automationService.getAutomationsFromStorage();
    const automation = storedAutomations.find((a: Automation) => a.id === id);
    
    if (!automation) {
      return Promise.reject({ response: { status: 404, data: { message: 'Automation not found' } } });
    }

    // Estimate total errors to be around 5% of contact count
    const contactCount = automation.contactCount || Math.floor(Math.random() * 1000) + 500;
    const totalErrors = Math.floor(contactCount * 0.05);
    
    // Distribute errors across steps, with more errors in earlier steps
    const stepErrorCounts: StepErrorData[] = [];
    let errorsSoFar = 0;
    
    automation.steps.forEach((step: Automation['steps'][0], index: number) => {
      // Earlier steps have more errors
      const stepErrorPercent = 0.4 / Math.pow(1.4, index);
      const stepErrors = Math.floor(totalErrors * stepErrorPercent);
      
      errorsSoFar += stepErrors;
      
      stepErrorCounts.push({
        stepId: step.id,
        stepName: step.name || step.subject || `Step ${index + 1}`,
        count: stepErrors,
        percentage: parseFloat((stepErrors / totalErrors * 100).toFixed(1))
      });
    });
    
    // Make sure the total adds up exactly by adjusting the first step if needed
    const calculatedTotal = stepErrorCounts.reduce((sum, item) => sum + item.count, 0);
    if (calculatedTotal !== totalErrors) {
      stepErrorCounts[0].count += (totalErrors - calculatedTotal);
      // Recalculate percentage
      stepErrorCounts[0].percentage = parseFloat((stepErrorCounts[0].count / totalErrors * 100).toFixed(1));
    }
    
    // Distribute error types based on step types
    const errorTypes: {[key: string]: number} = {
      'email_delivery_failed': 0,
      'contact_validation_error': 0,
      'condition_evaluation_error': 0,
      'rate_limited': 0,
      'timeout': 0,
      'other': 0
    };
    
    automation.steps.forEach((step: Automation['steps'][0], index: number) => {
      const stepError = stepErrorCounts[index].count;
      
      if (step.type === 'email') {
        errorTypes['email_delivery_failed'] += Math.floor(stepError * 0.7);
        errorTypes['contact_validation_error'] += Math.floor(stepError * 0.2);
        errorTypes['other'] += Math.floor(stepError * 0.1);
      } else if (step.type === 'condition') {
        errorTypes['condition_evaluation_error'] += Math.floor(stepError * 0.8);
        errorTypes['other'] += Math.floor(stepError * 0.2);
      } else if (step.type === 'delay') {
        errorTypes['timeout'] += Math.floor(stepError * 0.6);
        errorTypes['other'] += Math.floor(stepError * 0.4);
      } else {
        errorTypes['rate_limited'] += Math.floor(stepError * 0.4);
        errorTypes['other'] += Math.floor(stepError * 0.6);
      }
    });
    
    // Ensure error type totals add up correctly
    const typeTotal = Object.values(errorTypes).reduce((sum, count) => sum + count, 0);
    if (typeTotal !== totalErrors) {
      errorTypes['other'] += (totalErrors - typeTotal);
    }
    
    // Convert to array format
    const byType: ErrorTypeData[] = Object.entries(errorTypes)
      .filter(([_, count]) => count > 0)
      .map(([type, count]) => ({
        type,
        count, 
        percentage: parseFloat((count / totalErrors * 100).toFixed(1))
      }));
    
    const result: ErrorStats = {
      totalErrors,
      byStep: stepErrorCounts.reduce((acc, item) => {
        acc[item.stepId] = {
          count: item.count,
          name: item.stepName
        };
        return acc;
      }, {} as Record<string, ErrorStat>),
      byType: byType.reduce((acc, item) => {
        acc[item.type] = item.count;
        return acc;
      }, {} as Record<string, number>)
    };

    const response = await mockResponse(result);
    return response.data;
  },

  triggerAutomation: (id: string, contactIds?: string[]): Promise<{ success: boolean, message: string }> => {
    const storedAutomations = automationService.getAutomationsFromStorage();
    const automation = storedAutomations.find((a: Automation) => a.id === id);
    
    if (!automation) {
      return Promise.reject({ response: { status: 404, data: { message: 'Automation not found' } } });
    }
    
    // In a real implementation, this would queue contacts for processing
    return mockResponse({ 
      success: true, 
      message: contactIds 
        ? `Triggered automation for ${contactIds.length} contacts` 
        : 'Triggered automation for all eligible contacts' 
    }).then(response => response.data);
  },

  // Error handling methods
  getAutomationErrors: async (id: string, filters?: Record<string, string>): Promise<Error[]> => {
    const response = await mockResponse([
      {
        date: new Date().toISOString(),
        contactId: 'contact-1',
        stepId: 'step-1',
        stepName: 'Send Welcome Email',
        errorType: 'email_delivery_failed',
        errorMessage: 'Failed to deliver email: mailbox full'
      },
      {
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        contactId: 'contact-2',
        stepId: 'step-2',
        stepName: 'Check Open Rate',
        errorType: 'condition_error',
        errorMessage: 'Failed to evaluate condition: data missing'
      }
    ]);
    return response.data;
  },

  getContactsInError: async (id: string): Promise<APIContact[]> => {
    const response = await mockResponse([
      {
        _id: 'contact-1',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        status: 'error',
        lastError: {
          stepId: 'step-1',
          errorType: 'email_delivery_failed',
          errorMessage: 'Failed to deliver email: mailbox full',
          timestamp: new Date().toISOString()
        }
      },
      {
        _id: 'contact-2',
        email: 'jane@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        status: 'error',
        lastError: {
          stepId: 'step-2',
          errorType: 'condition_error',
          errorMessage: 'Failed to evaluate condition: data missing',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      }
    ]);
    return response.data;
  },

  retryContact: async (automationId: string, contactId: string): Promise<{
    success: boolean;
    message: string;
  }> => {
    const response = await mockResponse({ success: true, message: 'Contact set for retry' });
    return response.data;
  },

  retryAllContacts: async (automationId: string): Promise<{
    success: boolean;
    message: string;
  }> => {
    const response = await mockResponse({ success: true, message: 'All contacts set for retry' });
    return response.data;
  },

  // Testing methods
  testAutomationStep: async (automationId: string, stepId: string, testData: Record<string, unknown>): Promise<{
    success: boolean;
    result: {
      processed: boolean;
      processingTime: string;
      nextStep: string;
      [key: string]: any;
    };
    message: string;
  }> => {
    // Simulate a successful test for demonstration
    const response = await mockResponse({
      success: true,
      result: {
        ...testData,
        processed: true,
        processingTime: '0.23s',
        nextStep: 'step-2'
      },
      message: 'Step executed successfully'
    });
    return response.data;
  },
};

export default api;
