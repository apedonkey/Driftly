export interface Contact {
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