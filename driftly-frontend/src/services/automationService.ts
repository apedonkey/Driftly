import axios from 'axios';

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

class AutomationService {
  async getAutomations(): Promise<any[]> {
    const response = await api.get('/automations');
    return response.data;
  }

  async getAutomation(id: string): Promise<any> {
    const response = await api.get(`/automations/${id}`);
    return response.data;
  }

  async createAutomation(data: any): Promise<any> {
    const response = await api.post('/automations', data);
    return response.data;
  }

  async updateAutomation(id: string, data: any): Promise<any> {
    const response = await api.put(`/automations/${id}`, data);
    return response.data;
  }

  async deleteAutomation(id: string): Promise<any> {
    const response = await api.delete(`/automations/${id}`);
    return response.data;
  }

  async getAutomationAnalytics(id: string): Promise<any> {
    const response = await api.get(`/automations/${id}/analytics`);
    return response.data;
  }

  async toggleAutomation(id: string): Promise<any> {
    const response = await api.post(`/automations/${id}/toggle`);
    return response.data;
  }

  async updateAutomationSteps(id: string, steps: any[]): Promise<any> {
    const response = await api.put(`/automations/${id}/steps`, { steps });
    return response.data;
  }

  async triggerAutomation(id: string): Promise<any> {
    const response = await api.post(`/automations/${id}/trigger`);
    return response.data;
  }

  // Error handling methods
  async getAutomationErrors(id: string, filters?: Record<string, string>): Promise<any[]> {
    let url = `/automations/${id}/errors`;
    
    if (filters && Object.keys(filters).length > 0) {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value);
        }
      });
      url += `?${queryParams.toString()}`;
    }
    
    const response = await api.get(url);
    return response.data;
  }

  async getAutomationErrorStats(id: string): Promise<any> {
    const response = await api.get(`/automations/${id}/error-stats`);
    return response.data;
  }

  async getContactsInError(id: string): Promise<any[]> {
    const response = await api.get(`/automations/${id}/error-contacts`);
    return response.data;
  }

  async retryContact(automationId: string, contactId: string): Promise<any> {
    const response = await api.post(`/automations/${automationId}/error-contacts/${contactId}/retry`);
    return response.data;
  }

  async retryAllContacts(automationId: string): Promise<any> {
    const response = await api.post(`/automations/${automationId}/error-contacts/retry-all`);
    return response.data;
  }

  // Contact management methods
  async getAutomationContacts(id: string): Promise<any[]> {
    const response = await api.get(`/automations/${id}/contacts`);
    return response.data;
  }

  async addContactsToAutomation(id: string, contactIds: string[]): Promise<any> {
    const response = await api.post(`/automations/${id}/contacts`, { contactIds });
    return response.data;
  }

  async removeContactFromAutomation(automationId: string, contactId: string): Promise<any> {
    const response = await api.delete(`/automations/${automationId}/contacts/${contactId}`);
    return response.data;
  }

  async resetContact(automationId: string, contactId: string): Promise<any> {
    const response = await api.post(`/automations/${automationId}/contacts/${contactId}/reset`);
    return response.data;
  }

  // Testing methods
  async testAutomationStep(automationId: string, stepId: string, testData: any): Promise<any> {
    const response = await api.post(`/automations/${automationId}/test-step/${stepId}`, { testData });
    return response.data;
  }
}

export const automationService = new AutomationService(); 