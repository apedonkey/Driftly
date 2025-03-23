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

interface SubscriptionMetrics {
  isActive: boolean;
  metrics?: {
    flowCount: number;
    flowLimit: number;
    daysRemaining: number;
    renewalDate: string;
    planType: string;
  };
}

interface SubscriptionDetails {
  isActive: boolean;
  subscription?: {
    id: string;
    status: string;
    flowCount: number;
    planType: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    stripeData: any;
  };
}

interface BillingPlan {
  _id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  currency: string;
  displayOrder: number;
  isActive: boolean;
  stripePriceId: string;
  features: string[];
  limits: {
    maxFlows: number;
    maxContacts: number;
    maxEmails: number;
  };
}

class BillingService {
  // Get subscription details
  async getSubscriptionDetails(): Promise<SubscriptionDetails> {
    const response = await api.get('/billing/subscription');
    return response.data.data;
  }

  // Get subscription usage metrics
  async getSubscriptionMetrics(): Promise<SubscriptionMetrics> {
    const response = await api.get('/billing/metrics');
    return response.data.data;
  }

  // Get billing history
  async getBillingHistory(): Promise<any> {
    const response = await api.get('/billing/history');
    return response.data;
  }

  // Get all available billing plans
  async getBillingPlans(): Promise<BillingPlan[]> {
    const response = await api.get('/billing/plans');
    return response.data.data;
  }

  // Get a specific billing plan
  async getBillingPlan(planId: string): Promise<BillingPlan> {
    const response = await api.get(`/billing/plans/${planId}`);
    return response.data.data;
  }

  // Create a checkout session
  async createCheckoutSession(): Promise<{ sessionId: string; url: string }> {
    const response = await api.post('/billing/create-checkout-session');
    return response.data;
  }

  // Cancel subscription
  async cancelSubscription(): Promise<any> {
    const response = await api.post('/billing/cancel-subscription');
    return response.data;
  }

  // Update subscription quantity based on flow usage
  async updateSubscriptionQuantity(activeFlowCount: number): Promise<any> {
    const response = await api.post('/billing/update-subscription', { activeFlowCount });
    return response.data;
  }

  // Change billing plan
  async changePlan(planId: string): Promise<any> {
    const response = await api.post('/billing/change-plan', { planId });
    return response.data;
  }

  // Change billing frequency (monthly/yearly)
  async changeBillingFrequency(frequency: 'month' | 'year'): Promise<any> {
    const response = await api.post('/billing/change-frequency', { frequency });
    return response.data;
  }

  // Get a specific invoice
  async getInvoice(invoiceId: string): Promise<any> {
    const response = await api.get(`/billing/invoices/${invoiceId}`);
    return response.data;
  }
}

export const billingService = new BillingService(); 