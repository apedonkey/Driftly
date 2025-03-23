import React, {
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { ArrowLeftIcon } from '@heroicons/react/24/outline';

import AutomationTabs from '../components/AutomationTabs';
import SimpleNavigation from '../components/SimpleNavigation';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';
import Spinner from '../components/ui/Spinner';
import { automationService } from '../services/api';

interface Step {
  id: string;
  name: string;
  type: string;
}

interface StatusCounts {
  active: number;
  completed: number;
  paused: number;
  error: number;
}

interface AnalyticsData {
  contactCount: number;
  statusCounts: StatusCounts;
  stepMetrics: Array<{
    stepId: string;
    name: string;
    totalProcessed: number;
    successRate: number;
    avgProcessingTime: number;
    errorCount?: number;
    errorRate?: number;
    errorDetails?: Array<{
      errorType: string;
      count: number;
    }>;
    processingTimes?: Array<{
      date: string;
      avgTime: number;
    }>;
  }>;
  trend: Array<{
    date: string;
    active: number;
    completed: number;
    paused: number;
    error: number;
  }>;
  errors?: Array<{
    date: string;
    stepId: string;
    stepName: string;
    errorType: string;
    count: number;
  }>;
  processingMetrics?: {
    totalProcessed: number;
    averageProcessingTime: number;
    successRate: number;
    lastProcessed: string;
  };
}

interface ChartDataItem {
  name: string;
  value: number;
}

const COLORS = ['#4ade80', '#3b82f6', '#f97316', '#ef4444'];

const AutomationAnalytics: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [automation, setAutomation] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorStats, setErrorStats] = useState<{totalErrors: number} | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Fetch automation details
        const automationResponse = await automationService.getAutomation(id);
        setAutomation(automationResponse);
        
        // Fetch analytics data
        const analyticsResponse = await automationService.getAutomationAnalytics(id);
        setAnalyticsData(analyticsResponse);
        
        // Fetch error stats
        const errorStatsResponse = await automationService.getAutomationErrorStats(id);
        setErrorStats(errorStatsResponse);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching automation analytics:', err);
        setError('Failed to load analytics data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const getStatusData = (): ChartDataItem[] => {
    if (!analyticsData) return [];
    
    return [
      { name: 'Active', value: analyticsData.statusCounts.active },
      { name: 'Completed', value: analyticsData.statusCounts.completed },
      { name: 'Paused', value: analyticsData.statusCounts.paused },
      { name: 'Error', value: analyticsData.statusCounts.error }
    ];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-primary-bg">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-primary-bg min-h-screen">
        <SimpleNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PageHeader
            title="Analytics Error"
            description={error}
            action={
              <Button
                variant="secondary"
                size="md"
                icon={<ArrowLeftIcon className="h-5 w-5" />}
                onClick={() => navigate('/automations')}
              >
                Back to Automations
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  if (!automation || !analyticsData) {
    return (
      <div className="bg-primary-bg min-h-screen">
        <SimpleNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PageHeader
            title="Automation Not Found"
            description="The requested automation could not be found."
            action={
              <Button
                variant="secondary"
                size="md"
                icon={<ArrowLeftIcon className="h-5 w-5" />}
                onClick={() => navigate('/automations')}
              >
                Back to Automations
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-primary-bg min-h-screen">
      <SimpleNavigation />
      
      <div className="flex h-[calc(100vh-4rem)]">
        <AutomationTabs automationId={id!} />
        
        <div className="flex-1 overflow-y-auto p-8">
          <PageHeader
            title={`${automation.name} Analytics`}
            description="View performance metrics for this automation workflow"
            action={
              <Button
                variant="secondary"
                size="md"
                icon={<ArrowLeftIcon className="h-5 w-5" />}
                onClick={() => navigate('/automations')}
              >
                Back to Automations
              </Button>
            }
          />

          <div className="mt-8 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6 shadow hover:shadow-md transition-shadow duration-300">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Total Contacts</h3>
              <p className="mt-2 text-3xl font-bold text-white">{analyticsData.contactCount}</p>
            </Card>
            
            <Card className="p-6 shadow hover:shadow-md transition-shadow duration-300">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Active</h3>
              <p className="mt-2 text-3xl font-bold text-green-500">{analyticsData.statusCounts.active}</p>
              <p className="text-sm text-gray-400 mt-2">
                {(analyticsData.statusCounts.active / analyticsData.contactCount * 100).toFixed(1)}% of contacts
              </p>
            </Card>
            
            <Card className="p-6 shadow hover:shadow-md transition-shadow duration-300">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Completed</h3>
              <p className="mt-2 text-3xl font-bold text-blue-500">{analyticsData.statusCounts.completed}</p>
              <p className="text-sm text-gray-400 mt-2">
                {(analyticsData.statusCounts.completed / analyticsData.contactCount * 100).toFixed(1)}% of contacts
              </p>
            </Card>
            
            <Card className="p-6 shadow hover:shadow-md transition-shadow duration-300">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Issues</h3>
              <p className="mt-2 text-3xl font-bold text-red-500">{analyticsData.statusCounts.error}</p>
              <p className="text-sm text-gray-400 mt-2">
                {(analyticsData.statusCounts.error / analyticsData.contactCount * 100).toFixed(1)}% of contacts
              </p>
            </Card>
          </div>

          {analyticsData.processingMetrics && (
            <div className="mt-8">
              <Card className="p-6 shadow hover:shadow-md transition-shadow duration-300">
                <h3 className="text-lg font-medium text-white mb-6">Processing Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Total Processed</p>
                    <p className="mt-2 text-2xl font-bold text-white">{analyticsData.processingMetrics.totalProcessed}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Avg Processing Time</p>
                    <p className="mt-2 text-2xl font-bold text-indigo-500">{analyticsData.processingMetrics.averageProcessingTime} sec</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Success Rate</p>
                    <p className="mt-2 text-2xl font-bold text-green-500">{(analyticsData.processingMetrics.successRate * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Last Processed</p>
                    <p className="mt-2 text-lg font-bold text-white">
                      {new Date(analyticsData.processingMetrics.lastProcessed).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          <div className="mt-8 grid gap-6 grid-cols-1 lg:grid-cols-2">
            <Card className="p-6 shadow hover:shadow-md transition-shadow duration-300">
              <h3 className="text-lg font-medium text-white mb-6">Contact Status Distribution</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getStatusData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={(entry: ChartDataItem) => `${entry.name}: ${entry.value}`}
                    >
                      {getStatusData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [value, 'Contacts']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
            
            <Card className="p-6 shadow hover:shadow-md transition-shadow duration-300">
              <h3 className="text-lg font-medium text-white mb-6">Contact Status Trend (Last 14 Days)</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analyticsData.trend.slice(-7)} // Last 7 days only to avoid crowding
                    margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" angle={-45} textAnchor="end" height={70} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="active" name="Active" fill="#4ade80" />
                    <Bar dataKey="completed" name="Completed" fill="#3b82f6" />
                    <Bar dataKey="paused" name="Paused" fill="#f97316" />
                    <Bar dataKey="error" name="Error" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <div className="mt-8">
            <Card className="p-6 shadow hover:shadow-md transition-shadow duration-300">
              <h3 className="text-lg font-medium text-white mb-6">Average Processing Times</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={analyticsData.stepMetrics
                      .filter(metric => metric.processingTimes && metric.processingTimes.length > 0)
                      .flatMap(metric => 
                        metric.processingTimes?.map(pt => ({
                          date: pt.date,
                          avgTime: pt.avgTime,
                          step: metric.name
                        })) || []
                      )}
                    margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" angle={-45} textAnchor="end" height={70} />
                    <YAxis label={{ value: 'Processing Time (sec)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    {analyticsData.stepMetrics
                      .filter(metric => metric.processingTimes && metric.processingTimes.length > 0)
                      .map((metric, index) => (
                        <Line 
                          key={metric.stepId} 
                          type="monotone" 
                          dataKey="avgTime" 
                          name={metric.name} 
                          stroke={`#${Math.floor(Math.random()*16777215).toString(16)}`} 
                          activeDot={{ r: 8 }}
                          connectNulls 
                        />
                      ))
                    }
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {analyticsData.errors && analyticsData.errors.length > 0 && (
            <div className="mt-8">
              <Card className="p-6 shadow hover:shadow-md transition-shadow duration-300">
                <h3 className="text-lg font-medium text-white mb-6">Error Distribution</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={Object.entries(
                            analyticsData.errors.reduce((acc, curr) => {
                              acc[curr.errorType] = (acc[curr.errorType] || 0) + curr.count;
                              return acc;
                            }, {} as Record<string, number>)
                          ).map(([name, value]) => ({ name, value }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={120}
                          fill="#ef4444"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {Object.entries(
                            analyticsData.errors.reduce((acc, curr) => {
                              acc[curr.errorType] = (acc[curr.errorType] || 0) + curr.count;
                              return acc;
                            }, {} as Record<string, number>)
                          ).map(([name, value], index) => (
                            <Cell key={`cell-${index}`} fill={`#${(index * 2 + 8).toString(16)}4444`} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} occurrences`, 'Error Count']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="h-80 overflow-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead className="bg-secondary-bg">
                        <tr>
                          <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Error Type
                          </th>
                          <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Count
                          </th>
                          <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Step
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-secondary-bg divide-y divide-gray-700">
                        {analyticsData.errors.map((error, index) => (
                          <tr key={`error-${index}`}>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-400">
                              {error.errorType}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-400">
                              {error.count}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-400">
                              {error.stepName}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            </div>
          )}

          <div className="mt-8">
            <Card className="p-6 shadow hover:shadow-md transition-shadow duration-300">
              <h3 className="text-lg font-medium text-white mb-6">Step Performance</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-secondary-bg">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Step Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Processed
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Success Rate
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Errors
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Avg. Processing Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-secondary-bg divide-y divide-gray-700">
                    {analyticsData.stepMetrics.map((metric, index) => {
                      const step = automation.steps.find((s: Step) => s.id === metric.stepId) || { type: 'unknown' };
                      
                      return (
                        <tr key={metric.stepId || index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                            {metric.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                              ${step.type === 'email' ? 'bg-blue-900/30 text-blue-300' : ''}
                              ${step.type === 'delay' ? 'bg-yellow-900/30 text-yellow-300' : ''}
                              ${step.type === 'condition' ? 'bg-purple-900/30 text-purple-300' : ''}
                              ${step.type === 'action' ? 'bg-green-900/30 text-green-300' : ''}
                              ${step.type === 'unknown' ? 'bg-gray-900/30 text-gray-300' : ''}
                            `}>
                              {step.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {metric.totalProcessed}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {(metric.successRate * 100).toFixed(1)}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {metric.errorCount || 0} 
                            {metric.errorCount !== undefined && metric.errorCount > 0 && metric.errorRate && (
                              <span className="ml-1 text-red-600">
                                ({(metric.errorRate * 100).toFixed(1)}%)
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {metric.avgProcessingTime} sec
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {analyticsData.stepMetrics.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  No step metrics available yet
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomationAnalytics; 