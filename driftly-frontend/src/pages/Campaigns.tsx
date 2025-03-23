import React, {
  useEffect,
  useState,
} from 'react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import {
  ArrowPathIcon,
  CalendarIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import {
  flowService,
  trackingService,
} from '../services/api';

interface Flow {
  id: string;
  name: string;
  description?: string;
  status: string;
  contactCount: number;
  messagesSent: number;
  openRate: number;
  clickRate: number;
  createdAt: string;
  updatedAt?: string;
  steps?: any[];
  creator?: string;
}

interface FlowWithTracking extends Flow {
  trackingStats?: {
    opens: number;
    clicks: number;
    clickThroughRate: number;
  }
}

// Mock campaign data
const mockCampaigns = [
  {
    id: 1,
    name: 'April Newsletter',
    status: 'sent',
    recipients: 1245,
    openRate: '32.4%',
    clickRate: '8.7%',
    sentDate: '2023-04-10',
    createdBy: 'John Doe'
  },
  {
    id: 2,
    name: 'Product Update Announcement',
    status: 'draft',
    recipients: 0,
    openRate: '-',
    clickRate: '-',
    sentDate: '-',
    createdBy: 'John Doe'
  },
  {
    id: 3,
    name: 'Spring Promotion',
    status: 'sent',
    recipients: 2567,
    openRate: '41.2%',
    clickRate: '12.5%',
    sentDate: '2023-03-15',
    createdBy: 'Sarah Miller'
  },
  {
    id: 4,
    name: 'Customer Feedback Survey',
    status: 'scheduled',
    recipients: 1890,
    openRate: '-',
    clickRate: '-',
    sentDate: '2023-04-20',
    createdBy: 'John Doe'
  },
  {
    id: 5,
    name: 'Product Demo Invitation',
    status: 'draft',
    recipients: 0,
    openRate: '-',
    clickRate: '-',
    sentDate: '-',
    createdBy: 'Emily Parker'
  },
  {
    id: 6,
    name: 'Year-End Review',
    status: 'sent',
    recipients: 3250,
    openRate: '28.7%',
    clickRate: '5.3%',
    sentDate: '2022-12-15',
    createdBy: 'David Wilson'
  },
  {
    id: 7,
    name: 'Webinar Registration',
    status: 'scheduled',
    recipients: 750,
    openRate: '-',
    clickRate: '-',
    sentDate: '2023-05-05',
    createdBy: 'Sarah Miller'
  },
  {
    id: 8,
    name: 'Customer Onboarding Sequence',
    status: 'active',
    recipients: 482,
    openRate: '45.8%',
    clickRate: '17.2%',
    sentDate: 'Ongoing',
    createdBy: 'John Doe'
  }
];

// Status components
const CampaignStatus = ({ status }: { status: string }) => {
  switch (status) {
    case 'draft':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
          <span className="h-2 w-2 mr-1 rounded-full bg-gray-400"></span>
          Draft
        </span>
      );
    case 'scheduled':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/30 text-blue-300">
          <ClockIcon className="h-3 w-3 mr-1" />
          Scheduled
        </span>
      );
    case 'sending':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/30 text-yellow-300">
          <ArrowPathIcon className="h-3 w-3 mr-1 animate-spin" />
          Sending
        </span>
      );
    case 'sent':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-300">
          <CheckCircleIcon className="h-3 w-3 mr-1" />
          Sent
        </span>
      );
    case 'active':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900/30 text-purple-300">
          <ArrowPathIcon className="h-3 w-3 mr-1" />
          Active
        </span>
      );
    case 'failed':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/30 text-red-300">
          <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
          Failed
        </span>
      );
    default:
      return null;
  }
};

const Campaigns: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [campaigns, setCampaigns] = useState<FlowWithTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deletingCampaign, setDeletingCampaign] = useState<FlowWithTracking | null>(null);
  const navigate = useNavigate();
  
  // Function to handle new campaign creation
  const handleNewCampaign = () => {
    navigate('/flows/new');
  };
  
  // Handle edit campaign
  const handleEditCampaign = (campaignId: string) => {
    navigate(`/flows/${campaignId}`);
  };
  
  // Fetch campaigns (flows) data on component mount
  useEffect(() => {
    const fetchFlows = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await flowService.getFlows();
        if (response && response.success && response.data) {
          const flowsWithTracking: FlowWithTracking[] = [];
          
          // For each flow, fetch tracking statistics if available
          for (const flow of response.data) {
            try {
              const trackingResponse = await trackingService.getAnalytics(flow.id);
              if (trackingResponse && trackingResponse.success && trackingResponse.data) {
                flowsWithTracking.push({
                  ...flow,
                  trackingStats: {
                    opens: trackingResponse.data.data.metrics ? trackingResponse.data.data.metrics.open : 0,
                    clicks: trackingResponse.data.data.metrics ? trackingResponse.data.data.metrics.click : 0,
                    clickThroughRate: trackingResponse.data.data.metrics ? trackingResponse.data.data.metrics.clickThroughRate : 0
                  }
                });
              } else {
                flowsWithTracking.push(flow);
              }
            } catch (err) {
              console.error(`Error fetching tracking data for flow ${flow.id}:`, err);
              flowsWithTracking.push(flow);
            }
          }
          
          setCampaigns(flowsWithTracking);
        } else {
          setError('Failed to load campaigns. Invalid response format.');
        }
      } catch (err) {
        console.error('Error fetching campaigns:', err);
        setError('Failed to load campaigns. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFlows();
  }, []);
  
  // Apply filters
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (campaign.description && campaign.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handle status filter change
  const handleFilterChange = (status: string | null) => {
    setStatusFilter(status === statusFilter ? 'all' : status || 'all');
  };

  // Open delete confirmation modal
  const confirmDeleteCampaign = (campaign: FlowWithTracking) => {
    setDeletingCampaign(campaign);
  };

  // Handle campaign deletion
  const handleDeleteFlow = async () => {
    if (!deletingCampaign) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const flowId = deletingCampaign.id;
      const response = await flowService.deleteFlow(flowId);
      
      if (response && response.success) {
        // Remove the deleted flow from the list
        setCampaigns(prevCampaigns => prevCampaigns.filter(c => c.id !== flowId));
        
        // Show success message
        setSuccessMessage('Campaign deleted successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError('Failed to delete campaign. Invalid response.');
      }
    } catch (err) {
      console.error('Error deleting campaign:', err);
      setError('Failed to delete campaign. Please try again later.');
      throw err; // Rethrow for the confirmation modal to catch
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header with Sign in and Get started buttons */}
      <div className="mb-12 pb-6 border-b border-gray-700">
        <div className="flex justify-end mb-6">
          <div className="flex space-x-4">
            <Link
              to="/login"
              className="text-gray-300 hover:bg-gray-700 hover:text-white px-4 py-2 rounded-md text-sm font-medium border border-gray-700"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="bg-accent-blue text-white hover:bg-blue-600 px-4 py-2 rounded-md text-sm font-medium shadow-sm"
            >
              Get started
            </Link>
          </div>
        </div>
        
        <header className="mb-4">
          <h1 className="text-2xl font-bold text-white mb-2">Campaigns</h1>
          <p className="text-gray-400">Create and manage your email campaigns</p>
        </header>
      </div>
      
      {/* Campaign Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-secondary-bg rounded-lg shadow-md p-6">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Campaigns</p>
              <p className="mt-2 text-3xl font-bold text-white">{campaigns.length}</p>
            </div>
            <div className="p-2 bg-gray-800 rounded-lg">
              <EnvelopeIcon className="h-6 w-6 text-gray-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-secondary-bg rounded-lg shadow-md p-6">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Open Rate (Avg)</p>
              <p className="mt-2 text-3xl font-bold text-white">
                {campaigns.length > 0 
                  ? `${(campaigns.reduce((sum, campaign) => sum + (campaign.openRate || 0), 0) / campaigns.length).toFixed(1)}%` 
                  : '0%'}
              </p>
            </div>
            <div className="p-2 bg-gray-800 rounded-lg">
              <EnvelopeIcon className="h-6 w-6 text-gray-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-secondary-bg rounded-lg shadow-md p-6">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Click Rate (Avg)</p>
              <p className="mt-2 text-3xl font-bold text-white">
                {campaigns.length > 0 
                  ? `${(campaigns.reduce((sum, campaign) => sum + (campaign.clickRate || 0), 0) / campaigns.length).toFixed(1)}%` 
                  : '0%'}
              </p>
            </div>
            <div className="p-2 bg-gray-800 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-gray-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-secondary-bg rounded-lg shadow-md p-6">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Subscribers</p>
              <p className="mt-2 text-3xl font-bold text-white">
                {campaigns.reduce((sum, campaign) => sum + (campaign.contactCount || 0), 0).toLocaleString()}
              </p>
            </div>
            <div className="p-2 bg-gray-800 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-4 w-full sm:w-auto items-center">
          <div>
            <select
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm rounded-md"
              value={statusFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
            >
              <option value="all">All Campaigns</option>
              <option value="draft">Drafts</option>
              <option value="scheduled">Scheduled</option>
              <option value="sending">Sending</option>
              <option value="sent">Sent</option>
              <option value="active">Active</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          
          <button 
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue focus:ring-offset-gray-900"
            onClick={handleNewCampaign}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Campaign
          </button>
        </div>
      </div>
      
      {/* Campaigns Table */}
      <div className="bg-secondary-bg rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <ArrowPathIcon className="h-8 w-8 mx-auto animate-spin text-accent-blue" />
            <p className="text-white mt-2">Loading campaigns...</p>
          </div>
        ) : filteredCampaigns.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Campaign Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Recipients
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Open Rate
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Click Rate
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Sent Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Created By
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-secondary-bg divide-y divide-gray-700">
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-700 rounded-md flex items-center justify-center">
                          <EnvelopeIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{campaign.name}</div>
                          <div className="text-sm text-gray-400">ID: #{campaign.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <CampaignStatus status={campaign.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {campaign.contactCount > 0 ? campaign.contactCount.toLocaleString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {campaign.openRate ? `${campaign.openRate}%` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {campaign.clickRate ? `${campaign.clickRate}%` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      <div className="flex items-center">
                        {campaign.createdAt ? (
                          <>
                            <CalendarIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                            {new Date(campaign.createdAt).toLocaleDateString()}
                          </>
                        ) : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {campaign.creator || 'System'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2 justify-end">
                        <button
                          onClick={() => handleEditCampaign(campaign.id)}
                          className="text-blue-400 hover:text-blue-300"
                          title="Edit Campaign"
                        >
                          <PencilIcon className="h-5 w-5" />
                          <span className="sr-only">Edit</span>
                        </button>
                        
                        <Link
                          to={`/analytics/${campaign.id}`}
                          className="text-green-400 hover:text-green-300"
                          title="View Analytics"
                        >
                          <ChartBarIcon className="h-5 w-5" />
                          <span className="sr-only">Analytics</span>
                        </Link>

                        <button
                          onClick={() => confirmDeleteCampaign(campaign)}
                          className="text-red-400 hover:text-red-300"
                          title="Delete Campaign"
                        >
                          <TrashIcon className="h-5 w-5" />
                          <span className="sr-only">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-400 mb-4">No campaigns found</p>
            <button
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-blue hover:bg-blue-600"
              onClick={handleNewCampaign}
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create your first campaign
            </button>
          </div>
        )}
        
        {/* Pagination - only show if we have campaigns */}
        {filteredCampaigns.length > 0 && (
          <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-700 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredCampaigns.length}</span> of{' '}
                  <span className="font-medium">{filteredCampaigns.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-700 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700">
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button className="relative inline-flex items-center px-4 py-2 border border-gray-700 bg-gray-900 text-sm font-medium text-white">
                    1
                  </button>
                  <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-700 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700">
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
            <div className="flex sm:hidden">
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md text-gray-400 bg-gray-800 hover:bg-gray-700">
                Previous
              </button>
              <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md text-gray-400 bg-gray-800 hover:bg-gray-700">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deletingCampaign && (
        <DeleteConfirmationModal
          isOpen={!!deletingCampaign}
          onClose={() => setDeletingCampaign(null)}
          onConfirm={handleDeleteFlow}
          title="Delete Campaign"
          message={`Are you sure you want to delete "${deletingCampaign.name}"? This action cannot be undone and will remove all campaign data including contacts and analytics.`}
        />
      )}
    </div>
  );
};

export default Campaigns; 