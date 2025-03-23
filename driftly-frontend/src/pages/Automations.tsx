import React, {
  useEffect,
  useState,
} from 'react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import {
  BoltIcon,
  ChartBarIcon,
  PauseIcon,
  PencilIcon,
  PlayIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

import Badge from '../components/ui/Badge';
// UI Components
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import Spinner from '../components/ui/Spinner';
import { automationService } from '../services/api';

interface Automation {
  id: string;
  name: string;
  description: string;
  status: string;
  isActive?: boolean;
  triggerType?: string;
  steps: Array<{
    id: string;
    type: string;
    subject?: string;
  }>;
  contactCount?: number;
  messagesSent?: number;
  openRate?: number;
  clickRate?: number;
  triggers?: Array<{
    type: string;
    config?: any;
  }>;
  createdAt: string;
  updatedAt?: string;
}

const Automations: React.FC = () => {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch automations
  useEffect(() => {
    const fetchAutomations = async () => {
      try {
        setLoading(true);
        const response = await automationService.getAutomations();
        setAutomations(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching automations:', err);
        setError('Failed to load automations. Please try again later.');
        setLoading(false);
      }
    };

    fetchAutomations();
  }, []);

  // Handle activation/deactivation
  const toggleAutomationStatus = async (id: string, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await automationService.deactivateAutomation(id);
      } else {
        await automationService.activateAutomation(id);
      }
      
      // Update local state
      setAutomations(automations.map(automation => 
        automation.id === id 
          ? { ...automation, status: currentStatus ? 'inactive' : 'active' } 
          : automation
      ));
    } catch (err) {
      console.error(`Error ${currentStatus ? 'deactivating' : 'activating'} automation:`, err);
      setError(`Failed to ${currentStatus ? 'deactivate' : 'activate'} automation. Please try again.`);
    }
  };

  // Handle deletion
  const deleteAutomation = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this automation? This action cannot be undone.')) {
      return;
    }
    
    try {
      await automationService.deleteAutomation(id);
      
      // Remove from local state
      setAutomations(automations.filter(automation => automation.id !== id));
    } catch (err) {
      console.error('Error deleting automation:', err);
      setError('Failed to delete automation. Please try again.');
    }
  };

  // Handle manually triggering automation
  const triggerAutomation = async (id: string) => {
    try {
      await automationService.triggerAutomation(id);
      setSuccessMessage(`Automation triggered successfully. Processing contacts...`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error triggering automation:', err);
      setError('Failed to trigger automation. Please try again.');
    }
  };

  // Format trigger type for display
  const formatTriggerType = (automation: Automation) => {
    if (!automation.triggers || automation.triggers.length === 0) {
      return 'Manual';
    }
    
    const trigger = automation.triggers[0];
    switch (trigger.type) {
      case 'manual':
        return 'Manual';
      case 'scheduled':
        return 'Scheduled';
      case 'event':
        return 'Event-Based';
      default:
        return trigger.type.charAt(0).toUpperCase() + trigger.type.slice(1);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-primary-bg">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-primary-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="Automations"
          description="Create and manage your email automation workflows"
          rightContent={
            <div className="flex space-x-4">
              <Link
                to="/login"
                className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="bg-accent-blue text-white hover:bg-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Get started
              </Link>
            </div>
          }
          action={
            <Button
              variant="primary"
              size="md"
              icon={<PlusIcon className="h-5 w-5" />}
              onClick={() => navigate('/automations/builder/new')}
            >
              Create Automation
            </Button>
          }
        />

        {error && (
          <div className="mt-6 rounded-md bg-red-900/30 p-4 border-l-4 border-red-400">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mt-6 rounded-md bg-green-900/30 p-4 border-l-4 border-green-400">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-green-300">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8">
          {automations.length === 0 ? (
            <EmptyState
              title="No automations yet"
              description="Get started by creating your first automation workflow to engage with your contacts automatically."
              action={
                <Button
                  variant="primary"
                  size="md"
                  icon={<PlusIcon className="h-5 w-5" />}
                  onClick={() => navigate('/automations/builder/new')}
                >
                  Create Automation
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {automations.map((automation) => (
                <Card key={automation.id} className="overflow-hidden shadow hover:shadow-md transition-shadow duration-300 bg-secondary-bg border border-gray-700">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-medium text-white truncate" title={automation.name}>
                        {automation.name}
                      </h3>
                      <Badge 
                        variant={automation.status === 'active' ? 'success' : 'gray'}
                        className="ml-2"
                      >
                        {automation.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2" title={automation.description}>
                      {automation.description || 'No description provided'}
                    </p>
                    
                    <div className="flex justify-between items-center mb-4 text-sm text-gray-400">
                      <span className="flex items-center">
                        <span className="inline-block h-2 w-2 rounded-full bg-indigo-600 mr-2"></span>
                        {formatTriggerType(automation)}
                      </span>
                      <span>{automation.steps?.length || 0} steps</span>
                    </div>
                    
                    <div className="mt-6 border-t border-gray-700 pt-4">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-800 rounded-md p-2">
                          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Contacts</p>
                          <p className="text-lg font-semibold text-white">{automation.contactCount || 0}</p>
                        </div>
                        <div className="bg-gray-800 rounded-md p-2">
                          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Open Rate</p>
                          <p className="text-lg font-semibold text-white">
                            {automation.openRate ? `${Math.round(automation.openRate * 100)}%` : 'N/A'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center border-t border-gray-700 pt-4 mt-2">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Edit Automation"
                            onClick={() => navigate(`/automations/builder/${automation.id}`)}
                            className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-700"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title={automation.status === 'active' ? 'Deactivate' : 'Activate'}
                            onClick={() => toggleAutomationStatus(automation.id, automation.status === 'active')}
                            className={`${automation.status === 'active' ? 'text-green-500 hover:text-green-300' : 'text-gray-400 hover:text-white'}`}
                          >
                            {automation.status === 'active' ? 
                              <PauseIcon className="h-5 w-5" /> : 
                              <PlayIcon className="h-5 w-5" />
                            }
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Trigger Automation"
                            onClick={() => triggerAutomation(automation.id)}
                            className="text-amber-500 hover:text-amber-300"
                            disabled={automation.status !== 'active'}
                          >
                            <BoltIcon className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Delete Automation"
                            onClick={() => deleteAutomation(automation.id)}
                            className="text-red-500 hover:text-red-300"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="View Analytics"
                          onClick={() => navigate(`/automations/analytics/${automation.id}`)}
                          className="text-indigo-500 hover:text-indigo-300"
                        >
                          <ChartBarIcon className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Automations; 