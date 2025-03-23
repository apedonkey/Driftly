import React, {
  useEffect,
  useState,
} from 'react';

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Colors,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import {
  Bar,
  Line,
  Pie,
} from 'react-chartjs-2';
import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  ChartBarIcon,
  ChartPieIcon,
  ClockIcon,
  EnvelopeIcon,
  EnvelopeOpenIcon,
  FunnelIcon,
  HandRaisedIcon,
  ListBulletIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

import SimpleNavigation from '../components/SimpleNavigation';
import {
  flowService,
  trackingService,
} from '../services/api';

// Register the required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  Colors
);

interface Flow {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  contactCount: number;
  [key: string]: any;
}

interface FlowAnalytics {
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
    openRate?: number;
    clickRate?: number;
  }>;
}

const Analytics: React.FC = () => {
  const { flowId } = useParams<{ flowId: string }>();
  const navigate = useNavigate();
  
  // State variables
  const [flows, setFlows] = useState<Flow[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [analytics, setAnalytics] = useState<FlowAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'events'>('overview');

  // Fetch all flows on component mount
  useEffect(() => {
    const fetchFlows = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await flowService.getFlows();
        
        if (response && response.success && response.data) {
          setFlows(response.data);
          
          // If a flowId is provided in the URL, set it as selected
          if (flowId) {
            const flow = response.data.find((f: Flow) => f.id === flowId);
            if (flow) {
              setSelectedFlow(flow);
            } else {
              setError(`Flow with ID ${flowId} not found`);
            }
          } else if (response.data.length > 0) {
            // If no flowId is provided, select the first flow
            setSelectedFlow(response.data[0]);
            navigate(`/analytics/${response.data[0].id}`, { replace: true });
          }
        }
      } catch (err) {
        console.error('Error fetching flows:', err);
        setError('Failed to load flows. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFlows();
  }, [flowId, navigate]);

  // Fetch analytics data when selected flow or period changes
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!selectedFlow) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await trackingService.getAnalytics(selectedFlow.id, {
          groupBy: period
        });
        
        if (response && response.success && response.data && response.data.data) {
          setAnalytics(response.data.data);
        } else {
          setError('Failed to load analytics data. Invalid response format.');
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [selectedFlow, period]);

  // Handle flow change in dropdown
  const handleFlowChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const flow = flows.find(f => f.id === event.target.value);
    if (flow) {
      setSelectedFlow(flow);
      navigate(`/analytics/${flow.id}`);
    }
  };

  // Handle period change
  const handlePeriodChange = (newPeriod: 'day' | 'week' | 'month') => {
    setPeriod(newPeriod);
  };

  // Configure chart options and data
  const getTimeSeriesChartData = () => {
    if (!analytics || !analytics.timeSeriesData) return null;
    
    const labels = analytics.timeSeriesData.map(item => item.date);

    return {
      labels,
      datasets: [
        {
          label: 'Opens',
          data: analytics.timeSeriesData.map(item => item.open || 0),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
        },
        {
          label: 'Clicks',
          data: analytics.timeSeriesData.map(item => item.click || 0),
          borderColor: '#F59E0B',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
        },
      ],
    };
  };

  const getTimeSeriesOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
  };

  const getStepPerformanceChartData = () => {
    if (!analytics || !analytics.stepAnalytics || analytics.stepAnalytics.length === 0) return null;

    return {
      labels: analytics.stepAnalytics.map(step => step.stepId),
      datasets: [
        {
          label: 'Open Rate (%)',
          data: analytics.stepAnalytics.map(step => step.openRate),
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          borderRadius: 4,
        },
        {
          label: 'Click Rate (%)',
          data: analytics.stepAnalytics.map(step => step.clickRate),
          backgroundColor: 'rgba(245, 158, 11, 0.7)',
          borderRadius: 4,
        },
      ],
    };
  };

  const getStepPerformanceOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
  };

  const getContactStatusChartData = () => {
    if (!analytics || !analytics.stepAnalytics) return null;

    const statuses = analytics.stepAnalytics.map(step => step.stepId);
    const counts = analytics.stepAnalytics.map(step => step.open || 0);

    return {
      labels: statuses,
      datasets: [
        {
          data: counts,
          backgroundColor: [
            'rgba(79, 70, 229, 0.7)',
            'rgba(16, 185, 129, 0.7)',
            'rgba(245, 158, 11, 0.7)',
            'rgba(239, 68, 68, 0.7)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const getContactStatusOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
      },
    },
  };

  // Format numbers for display
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Format percentage for display
  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  // Get period label for display
  const getPeriodLabel = () => {
    switch (period) {
      case 'day':
        return 'daily';
      case 'week':
        return 'weekly';
      case 'month':
        return 'monthly';
      default:
        return '';
    }
  };

  // Render loading state
  if (loading && !analytics) {
    return (
      <div className="min-h-screen bg-primary-bg">
        <SimpleNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-white">Loading analytics data...</div>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error && !analytics) {
    return (
      <div className="min-h-screen bg-primary-bg">
        <SimpleNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col justify-center items-center h-64">
            <div className="text-red-500 mb-4">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-accent-blue text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-bg">
      <SimpleNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Analytics</h1>
            <p className="text-gray-400">Track and analyze your campaign performance</p>
          </div>
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
        </header>
        
        {/* Page header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Email Analytics</h1>
            <p className="text-gray-400">Track and analyze your flow performance</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
            {/* Flow selector */}
            <div>
              <label htmlFor="flow-selector" className="sr-only">Select flow</label>
              <select
                id="flow-selector"
                value={selectedFlow?.id || ''}
                onChange={handleFlowChange}
                className="bg-secondary-bg border border-gray-700 text-white rounded-md px-4 py-2 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-accent-blue"
              >
                {flows.map(flow => (
                  <option key={flow.id} value={flow.id}>
                    {flow.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Time period selector */}
            <div className="bg-secondary-bg border border-gray-700 rounded-md flex overflow-hidden">
              <button
                onClick={() => handlePeriodChange('day')}
                className={`px-3 py-2 text-sm ${
                  period === 'day' ? 'bg-accent-blue text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => handlePeriodChange('week')}
                className={`px-3 py-2 text-sm ${
                  period === 'week' ? 'bg-accent-blue text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => handlePeriodChange('month')}
                className={`px-3 py-2 text-sm ${
                  period === 'month' ? 'bg-accent-blue text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>
        </div>
        
        {/* Stats cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Contacts */}
            <div className="bg-secondary-bg rounded-lg p-4">
              <div className="flex items-center">
                <div className="rounded-md bg-indigo-900/40 p-2 mr-3">
                  <UsersIcon className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Contacts</p>
                  <p className="text-xl font-semibold text-white">
                    {formatNumber(analytics.metrics.open)}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Total Emails Sent */}
            <div className="bg-secondary-bg rounded-lg p-4">
              <div className="flex items-center">
                <div className="rounded-md bg-blue-900/40 p-2 mr-3">
                  <EnvelopeIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Emails Sent</p>
                  <p className="text-xl font-semibold text-white">
                    {formatNumber(analytics.metrics.click)}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Open Rate */}
            <div className="bg-secondary-bg rounded-lg p-4">
              <div className="flex items-center">
                <div className="rounded-md bg-green-900/40 p-2 mr-3">
                  <EnvelopeOpenIcon className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Open Rate</p>
                  <p className="text-xl font-semibold text-white">
                    {formatPercentage(analytics.metrics.open)}
                  </p>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {formatNumber(analytics.metrics.open)} opens
              </div>
            </div>
            
            {/* Click Rate */}
            <div className="bg-secondary-bg rounded-lg p-4">
              <div className="flex items-center">
                <div className="rounded-md bg-yellow-900/40 p-2 mr-3">
                  <HandRaisedIcon className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Click Rate</p>
                  <p className="text-xl font-semibold text-white">
                    {formatPercentage(analytics.metrics.clickThroughRate)}
                  </p>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {formatNumber(analytics.metrics.click)} clicks
              </div>
            </div>
          </div>
        )}
        
        {/* Charts section */}
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Email engagement over time */}
            <div className="bg-secondary-bg rounded-lg p-4">
              <h2 className="text-lg font-medium text-white mb-4 flex items-center">
                <ChartBarIcon className="h-5 w-5 mr-2 text-blue-400" />
                Email Engagement ({getPeriodLabel()})
              </h2>
              <div className="h-80">
                {getTimeSeriesChartData() && (
                  <Line data={getTimeSeriesChartData()!} options={getTimeSeriesOptions} />
                )}
              </div>
            </div>
            
            {/* Step performance comparison */}
            <div className="bg-secondary-bg rounded-lg p-4">
              <h2 className="text-lg font-medium text-white mb-4 flex items-center">
                <FunnelIcon className="h-5 w-5 mr-2 text-green-400" />
                Step Performance
              </h2>
              <div className="h-80">
                {getStepPerformanceChartData() && (
                  <Bar data={getStepPerformanceChartData()!} options={getStepPerformanceOptions} />
                )}
              </div>
            </div>
            
            {/* Contact Status Distribution */}
            <div className="bg-secondary-bg rounded-lg p-4">
              <h2 className="text-lg font-medium text-white mb-4 flex items-center">
                <ChartPieIcon className="h-5 w-5 mr-2 text-purple-400" />
                Contact Status Distribution
              </h2>
              <div className="h-80">
                {getContactStatusChartData() && (
                  <Pie data={getContactStatusChartData()!} options={getContactStatusOptions} />
                )}
              </div>
            </div>
            
            {/* Email steps details */}
            <div className="bg-secondary-bg rounded-lg p-4">
              <h2 className="text-lg font-medium text-white mb-4 flex items-center">
                <ListBulletIcon className="h-5 w-5 mr-2 text-orange-400" />
                Email Steps
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Step
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Opens
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Clicks
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Open Rate
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Click Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {analytics.stepAnalytics.map((step, index) => (
                      <tr key={step.stepId} className="hover:bg-gray-700/30">
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-white">
                          {step.stepId}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">
                          {formatNumber(step.open || 0)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">
                          {formatNumber(step.click || 0)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          <span className="text-green-400">
                            {formatPercentage(step.openRate || 0)}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          <span className="text-yellow-400">
                            {formatPercentage(step.clickRate || 0)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {/* Flow info section */}
        {selectedFlow && (
          <div className="bg-secondary-bg rounded-lg p-4 mb-6">
            <h2 className="text-lg font-medium text-white mb-4 flex items-center">
              <ClockIcon className="h-5 w-5 mr-2 text-blue-400" />
              Flow Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-400">Flow Name</p>
                <p className="text-md text-white">{selectedFlow.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Status</p>
                <p className="text-md">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedFlow.status === 'active' ? 'bg-green-900/30 text-green-300' : 'bg-gray-700 text-gray-300'
                  }`}>
                    {selectedFlow.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Created On</p>
                <p className="text-md text-white">
                  {new Date(selectedFlow.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
            
            <div className="mt-4">
              <Link
                to={`/flows/${selectedFlow.id}`}
                className="inline-flex items-center text-accent-blue hover:text-blue-400"
              >
                <span>Edit Flow</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
