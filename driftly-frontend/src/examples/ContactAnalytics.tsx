import React from 'react';

import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChartBarIcon,
  EnvelopeIcon,
  TagIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

// This is an example file showing how to implement contact analytics functionality
// to integrate with the ContactManager page

// Mock data interfaces
interface AnalyticsStat {
  id: string;
  name: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  period: string;
}

interface TimeSeriesData {
  date: string;
  value: number;
}

interface SourceData {
  name: string;
  value: number;
  color: string;
}

interface TagDistribution {
  name: string;
  count: number;
}

export const ContactAnalyticsExample: React.FC = () => {
  // State variables to add to ContactManager.tsx
  const [showAnalytics, setShowAnalytics] = React.useState(false);
  const [timeRange, setTimeRange] = React.useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [analyticsLoading, setAnalyticsLoading] = React.useState(false);
  const [analyticsError, setAnalyticsError] = React.useState<string | null>(null);
  
  // Mock analytics data
  const [stats, setStats] = React.useState<AnalyticsStat[]>([]);
  const [growthData, setGrowthData] = React.useState<TimeSeriesData[]>([]);
  const [engagementData, setEngagementData] = React.useState<TimeSeriesData[]>([]);
  const [sourceData, setSourceData] = React.useState<SourceData[]>([]);
  const [tagDistribution, setTagDistribution] = React.useState<TagDistribution[]>([]);

  // Function to fetch analytics data
  const fetchAnalyticsData = React.useCallback(async () => {
    // In a real implementation, this would call an API with the selected time range
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock data based on selected time range
      const mockStats: AnalyticsStat[] = [
        {
          id: 'total_contacts',
          name: 'Total Contacts',
          value: timeRange === '7d' ? 423 : timeRange === '30d' ? 578 : timeRange === '90d' ? 842 : 1254,
          change: timeRange === '7d' ? 5.2 : timeRange === '30d' ? 12.8 : timeRange === '90d' ? 24.5 : 42.3,
          changeType: 'increase',
          period: timeRange
        },
        {
          id: 'new_contacts',
          name: 'New Contacts',
          value: timeRange === '7d' ? 32 : timeRange === '30d' ? 87 : timeRange === '90d' ? 215 : 432,
          change: timeRange === '7d' ? 3.1 : timeRange === '30d' ? 7.5 : timeRange === '90d' ? -2.8 : 15.7,
          changeType: timeRange === '90d' ? 'decrease' : 'increase',
          period: timeRange
        },
        {
          id: 'email_engagement',
          name: 'Email Engagement',
          value: timeRange === '7d' ? 28 : timeRange === '30d' ? 34 : timeRange === '90d' ? 36 : 39,
          change: timeRange === '7d' ? -2.3 : timeRange === '30d' ? 1.5 : timeRange === '90d' ? 3.2 : 5.4,
          changeType: timeRange === '7d' ? 'decrease' : 'increase',
          period: timeRange
        },
        {
          id: 'conversion_rate',
          name: 'Conversion Rate',
          value: timeRange === '7d' ? 3.2 : timeRange === '30d' ? 4.1 : timeRange === '90d' ? 4.8 : 5.2,
          change: timeRange === '7d' ? 0.5 : timeRange === '30d' ? 1.2 : timeRange === '90d' ? 1.9 : 2.1,
          changeType: 'increase',
          period: timeRange
        }
      ];
      
      // Generate time series data
      const endDate = new Date();
      const startDate = new Date();
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
      startDate.setDate(endDate.getDate() - days);
      
      const mockGrowthData: TimeSeriesData[] = [];
      const mockEngagementData: TimeSeriesData[] = [];
      
      let cumulativeContacts = timeRange === '7d' ? 391 : timeRange === '30d' ? 491 : timeRange === '90d' ? 627 : 822;
      let baseEngagement = timeRange === '7d' ? 26 : timeRange === '30d' ? 32 : timeRange === '90d' ? 34 : 37;
      
      for (let i = 0; i <= days; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateString = currentDate.toISOString().split('T')[0];
        
        // Growth data - cumulative with some variability
        const newContacts = Math.floor(Math.random() * 5) + (timeRange === '7d' ? 4 : timeRange === '30d' ? 3 : 2);
        cumulativeContacts += newContacts;
        mockGrowthData.push({
          date: dateString,
          value: cumulativeContacts
        });
        
        // Engagement data - percentage with small fluctuations
        const engagementChange = (Math.random() - 0.5) * 2;
        const engagement = Math.max(15, Math.min(50, baseEngagement + engagementChange));
        baseEngagement = engagement;
        mockEngagementData.push({
          date: dateString,
          value: engagement
        });
      }
      
      // Source distribution data
      const mockSourceData: SourceData[] = [
        { name: 'Website', value: 42, color: '#3B82F6' },
        { name: 'Referral', value: 28, color: '#10B981' },
        { name: 'Social Media', value: 18, color: '#8B5CF6' },
        { name: 'Email', value: 8, color: '#F59E0B' },
        { name: 'Other', value: 4, color: '#6B7280' }
      ];
      
      // Tag distribution data
      const mockTagDistribution: TagDistribution[] = [
        { name: 'Lead', count: 215 },
        { name: 'Customer', count: 187 },
        { name: 'VIP', count: 76 },
        { name: 'Cold', count: 64 },
        { name: 'Unresponsive', count: 36 }
      ];
      
      setStats(mockStats);
      setGrowthData(mockGrowthData);
      setEngagementData(mockEngagementData);
      setSourceData(mockSourceData);
      setTagDistribution(mockTagDistribution);
    } catch (error) {
      setAnalyticsError('Failed to load analytics data');
      console.error('Error fetching analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [timeRange]);

  // Fetch data when time range changes
  React.useEffect(() => {
    if (showAnalytics) {
      fetchAnalyticsData();
    }
  }, [fetchAnalyticsData, showAnalytics, timeRange]);

  // Simple line chart component
  const LineChart: React.FC<{ data: TimeSeriesData[], label: string, color: string }> = ({ data, label, color }) => {
    if (!data.length) return null;
    
    // Calculate chart dimensions
    const width = 100;
    const height = 50;
    const padding = 5;
    
    // Get min/max values for scaling
    const values = data.map(d => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    
    // Scale values to fit in chart height
    const scaleY = (value: number) => {
      if (maxValue === minValue) return height / 2; // Avoid division by zero
      return height - padding - ((value - minValue) / (maxValue - minValue)) * (height - padding * 2);
    };
    
    // Create points for SVG path
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = scaleY(d.value);
      return `${x},${y}`;
    });
    
    const pathD = `M${points.join(' L')}`;
    
    return (
      <div className="w-full relative">
        <div className="text-xs text-gray-400 mb-1">{label}</div>
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          <path
            d={pathD}
            stroke={color}
            strokeWidth="2"
            fill="none"
          />
        </svg>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{data[0].date.split('-').slice(1).join('/')}</span>
          <span>{data[data.length - 1].date.split('-').slice(1).join('/')}</span>
        </div>
      </div>
    );
  };

  // Simple donut chart component
  const DonutChart: React.FC<{ data: SourceData[] }> = ({ data }) => {
    // Calculate total for percentages
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    // Calculate segments for the donut chart
    let cumulativePercentage = 0;
    const segments = data.map(item => {
      const percentage = (item.value / total) * 100;
      const startAngle = cumulativePercentage;
      cumulativePercentage += percentage;
      const endAngle = cumulativePercentage;
      
      // Convert angles to radians for SVG arc
      const startAngleRad = (startAngle / 100) * Math.PI * 2 - Math.PI / 2;
      const endAngleRad = (endAngle / 100) * Math.PI * 2 - Math.PI / 2;
      
      // Calculate SVG arc path
      const radius = 40;
      const largeArcFlag = percentage > 50 ? 1 : 0;
      
      const x1 = radius * Math.cos(startAngleRad) + 50;
      const y1 = radius * Math.sin(startAngleRad) + 50;
      const x2 = radius * Math.cos(endAngleRad) + 50;
      const y2 = radius * Math.sin(endAngleRad) + 50;
      
      return {
        ...item,
        percentage,
        path: `M 50 50 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
      };
    });
    
    return (
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 100 100">
            {segments.map((segment, index) => (
              <path
                key={index}
                d={segment.path}
                fill={segment.color}
                stroke="#1F2937"
                strokeWidth="1"
              />
            ))}
            <circle cx="50" cy="50" r="25" fill="#1F2937" />
          </svg>
        </div>
        
        <div className="mt-4 w-full space-y-2">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 mr-2" style={{ backgroundColor: segment.color }}></div>
                <span className="text-sm text-gray-300">{segment.name}</span>
              </div>
              <span className="text-sm text-gray-400">{segment.percentage.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Stats card component
  const StatCard: React.FC<{ stat: AnalyticsStat }> = ({ stat }) => {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-400">{stat.name}</p>
            <p className="text-2xl font-semibold text-white mt-1">
              {stat.id === 'email_engagement' || stat.id === 'conversion_rate'
                ? `${stat.value}%`
                : stat.value.toLocaleString()}
            </p>
          </div>
          <div className={`flex items-center px-2 py-1 rounded-full text-xs ${
            stat.changeType === 'increase' 
              ? 'bg-green-900/30 text-green-300' 
              : stat.changeType === 'decrease' 
              ? 'bg-red-900/30 text-red-300'
              : 'bg-gray-700 text-gray-300'
          }`}>
            {stat.changeType === 'increase' ? (
              <ArrowUpIcon className="h-3 w-3 mr-1" />
            ) : stat.changeType === 'decrease' ? (
              <ArrowDownIcon className="h-3 w-3 mr-1" />
            ) : null}
            {Math.abs(stat.change).toFixed(1)}%
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">vs previous {stat.period}</p>
      </div>
    );
  };

  // Tag distribution chart
  const TagChart: React.FC<{ data: TagDistribution[] }> = ({ data }) => {
    // Calculate max value for scaling
    const max = Math.max(...data.map(d => d.count));
    
    return (
      <div className="space-y-3">
        <div className="text-sm font-medium text-white mb-2">Top Tags</div>
        {data.map((tag, index) => (
          <div key={index} className="flex flex-col">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-300">{tag.name}</span>
              <span className="text-gray-400">{tag.count}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: `${(tag.count / max) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Analytics dashboard component to integrate in ContactManager
  return (
    <div>
      {/* Add this button to the header section of ContactManager */}
      <button
        onClick={() => setShowAnalytics(!showAnalytics)}
        className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-white hover:bg-gray-700"
      >
        <ChartBarIcon className="h-5 w-5 mr-1" />
        {showAnalytics ? 'Hide Analytics' : 'Contact Analytics'}
      </button>
      
      {/* Analytics Dashboard */}
      {showAnalytics && (
        <div className="mt-6">
          <div className="bg-secondary-bg rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-medium text-white flex items-center">
                <ChartBarIcon className="h-5 w-5 mr-2 text-blue-400" />
                Contact Analytics
              </h2>
              
              {/* Time range selector */}
              <div className="flex bg-gray-800 rounded-md overflow-hidden">
                {(['7d', '30d', '90d', '1y'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 text-sm font-medium focus:outline-none ${
                      timeRange === range 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            
            {analyticsLoading ? (
              <div className="p-6 text-center">
                <p className="text-gray-400">Loading analytics data...</p>
              </div>
            ) : analyticsError ? (
              <div className="p-6 text-center">
                <p className="text-red-400">{analyticsError}</p>
                <button
                  onClick={fetchAnalyticsData}
                  className="mt-2 inline-flex items-center px-3 py-1 border border-gray-600 rounded-md text-xs font-medium text-white hover:bg-gray-700"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="p-4">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {stats.map(stat => (
                    <StatCard key={stat.id} stat={stat} />
                  ))}
                </div>
                
                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Contact Growth Chart */}
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-md font-medium text-white mb-4 flex items-center">
                      <UsersIcon className="h-4 w-4 mr-1 text-blue-400" />
                      Contact Growth
                    </h3>
                    <LineChart 
                      data={growthData} 
                      label="Total Contacts" 
                      color="#3B82F6" 
                    />
                  </div>
                  
                  {/* Email Engagement Chart */}
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-md font-medium text-white mb-4 flex items-center">
                      <EnvelopeIcon className="h-4 w-4 mr-1 text-green-400" />
                      Email Engagement
                    </h3>
                    <LineChart 
                      data={engagementData} 
                      label="Open Rate %" 
                      color="#10B981" 
                    />
                  </div>
                  
                  {/* Source Distribution */}
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-md font-medium text-white mb-4">
                      Source Distribution
                    </h3>
                    <DonutChart data={sourceData} />
                  </div>
                  
                  {/* Tag Distribution */}
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-md font-medium text-white mb-4 flex items-center">
                      <TagIcon className="h-4 w-4 mr-1 text-purple-400" />
                      Tags
                    </h3>
                    <TagChart data={tagDistribution} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Integration Instructions for ContactManager.tsx:
 * 
 * 1. Add imports:
 *    - Import ChartBarIcon, ArrowUpIcon, ArrowDownIcon, UsersIcon, EnvelopeIcon, TagIcon from '@heroicons/react/24/outline'
 * 
 * 2. Add interfaces for analytics data:
 *    - AnalyticsStat, TimeSeriesData, SourceData, TagDistribution
 * 
 * 3. Add state variables:
 *    - const [showAnalytics, setShowAnalytics] = React.useState(false);
 *    - const [timeRange, setTimeRange] = React.useState<'7d' | '30d' | '90d' | '1y'>('30d');
 *    - const [analyticsLoading, setAnalyticsLoading] = React.useState(false);
 *    - const [analyticsError, setAnalyticsError] = React.useState<string | null>(null);
 *    - const [stats, setStats] = React.useState<AnalyticsStat[]>([]);
 *    - const [growthData, setGrowthData] = React.useState<TimeSeriesData[]>([]);
 *    - const [engagementData, setEngagementData] = React.useState<TimeSeriesData[]>([]);
 *    - const [sourceData, setSourceData] = React.useState<SourceData[]>([]);
 *    - const [tagDistribution, setTagDistribution] = React.useState<TagDistribution[]>([]);
 * 
 * 4. Add the fetchAnalyticsData function and useEffect hook
 * 
 * 5. Create the visualization components:
 *    - LineChart, DonutChart, StatCard, TagChart
 * 
 * 6. Add a button to toggle the analytics panel in the header:
 *    <button
 *      onClick={() => setShowAnalytics(!showAnalytics)}
 *      className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-white hover:bg-gray-700"
 *    >
 *      <ChartBarIcon className="h-5 w-5 mr-1" />
 *      {showAnalytics ? 'Hide Analytics' : 'Contact Analytics'}
 *    </button>
 * 
 * 7. Add the analytics dashboard panel to the main content section:
 *    {showAnalytics && (
 *      <div className="mt-6">
 *        // Analytics Dashboard goes here
 *      </div>
 *    )}
 */ 