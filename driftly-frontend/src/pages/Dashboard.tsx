import React from 'react';

import { Link } from 'react-router-dom';

import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  EnvelopeIcon,
  EnvelopeOpenIcon,
  UserGroupIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';

// Mock data for dashboard
const statsCards = [
  { 
    id: 'total-contacts', 
    title: 'Total Contacts', 
    value: '3,721', 
    icon: UserGroupIcon,
    change: { value: '+12%', isPositive: true, text: 'from last month' },
    linkText: 'View all contacts',
    linkUrl: '/contacts'
  },
  { 
    id: 'campaigns-sent', 
    title: 'Campaigns Sent', 
    value: '24', 
    icon: EnvelopeIcon,
    change: { value: '+4', isPositive: true, text: 'from last month' },
    linkText: 'View all campaigns',
    linkUrl: '/campaigns'
  },
  { 
    id: 'avg-open-rate', 
    title: 'Avg. Open Rate', 
    value: '28.6%', 
    icon: EnvelopeOpenIcon,
    change: { value: '-2.3%', isPositive: false, text: 'from last month' },
    linkText: 'View email analytics',
    linkUrl: '/analytics/email'
  }
];

const recentActivity = [
  { 
    id: 1, 
    type: 'contact', 
    action: 'added', 
    name: 'Sarah Johnson', 
    timestamp: '3 minutes ago',
    details: 'New contact from website form'
  },
  { 
    id: 2, 
    type: 'campaign', 
    action: 'sent', 
    name: 'April Newsletter', 
    timestamp: '1 hour ago',
    details: 'Sent to 1,245 contacts'
  },
  { 
    id: 4, 
    type: 'automation', 
    action: 'triggered', 
    name: 'Welcome Sequence', 
    timestamp: '4 hours ago',
    details: '12 contacts entered workflow'
  },
  { 
    id: 5, 
    type: 'contact', 
    action: 'updated', 
    name: 'David Wilson', 
    timestamp: '5 hours ago',
    details: 'Status changed to Customer'
  }
];

const upcomingTasks = [
  { 
    id: 1, 
    title: 'Follow up with Enterprise leads', 
    dueDate: 'Today', 
    priority: 'high' 
  },
  { 
    id: 2, 
    title: 'Review campaign performance', 
    dueDate: 'Tomorrow', 
    priority: 'medium' 
  },
  { 
    id: 3, 
    title: 'Update contact segments', 
    dueDate: 'Apr 28', 
    priority: 'low' 
  }
];

// Helper function to get activity icon
const getActivityIcon = (type: string) => {
  switch (type) {
    case 'contact':
      return <UserPlusIcon className="h-5 w-5 text-blue-400" />;
    case 'campaign':
      return <EnvelopeIcon className="h-5 w-5 text-purple-400" />;
    case 'automation':
      return <ChartBarIcon className="h-5 w-5 text-yellow-400" />;
    default:
      return <UserGroupIcon className="h-5 w-5 text-gray-400" />;
  }
};

// Helper function to get priority badge style
const getPriorityBadgeStyle = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-900/30 text-red-300';
    case 'medium':
      return 'bg-yellow-900/30 text-yellow-300';
    case 'low':
      return 'bg-green-900/30 text-green-300';
    default:
      return 'bg-gray-900/30 text-gray-300';
  }
};

const Dashboard: React.FC = () => {
  return (
    <div className="p-6">
      {/* Header with Sign in and Get started buttons */}
      <div className="mb-12">
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
        
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Welcome back! Here's an overview of your account.</p>
        </header>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((card) => (
          <div key={card.id} className="bg-secondary-bg rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">{card.title}</p>
                <p className="mt-2 text-3xl font-bold text-white">{card.value}</p>
              </div>
              <div className="p-2 bg-gray-800 rounded-lg">
                <card.icon className="h-6 w-6 text-gray-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {card.change.isPositive ? (
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-400 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 text-red-400 mr-1" />
              )}
              <span className={`text-sm ${card.change.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {card.change.value}
              </span>
              <span className="text-xs text-gray-500 ml-1">{card.change.text}</span>
            </div>
            <div className="mt-4">
              <Link to={card.linkUrl} className="text-sm text-accent-blue hover:text-blue-400">
                {card.linkText}
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-secondary-bg rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-medium text-white">Recent Activity</h2>
          </div>
          <div className="p-6">
            <ul className="space-y-6">
              {recentActivity.map((activity) => (
                <li key={activity.id} className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">
                      {activity.name}
                      <span className="ml-1 text-gray-400 font-normal">
                        {activity.action === 'added' && 'was added'}
                        {activity.action === 'sent' && 'was sent'}
                        {activity.action === 'replied' && 'replied'}
                        {activity.action === 'triggered' && 'was triggered'}
                        {activity.action === 'updated' && 'was updated'}
                      </span>
                    </p>
                    <p className="text-sm text-gray-400">{activity.details}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-6 text-center">
              <button className="text-sm text-accent-blue hover:text-blue-400">
                View all activity
              </button>
            </div>
          </div>
        </div>

        {/* Tasks & Upcoming */}
        <div className="bg-secondary-bg rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-medium text-white">Tasks</h2>
          </div>
          <div className="p-6">
            <ul className="space-y-4">
              {upcomingTasks.map((task) => (
                <li key={task.id} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded text-accent-blue focus:ring-accent-blue focus:ring-opacity-50 bg-gray-700 border-gray-600"
                    />
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-white">{task.title}</p>
                      <div className="mt-2 flex justify-between">
                        <span className="text-xs text-gray-400">Due: {task.dueDate}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityBadgeStyle(task.priority)}`}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <button className="w-full flex items-center justify-center py-2 px-4 border border-gray-700 rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700">
                + Add new task
              </button>
            </div>
          </div>
          
          {/* Subscription Info */}
          <div className="px-6 py-4 border-t border-gray-700 mt-4">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Subscription</h3>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-white">Professional Plan</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-300">
                  Active
                </span>
              </div>
              <div className="flex items-center text-gray-400 text-sm">
                <UserGroupIcon className="h-4 w-4 mr-1" />
                <span>2,279 / 5,000 contacts used</span>
              </div>
              <div className="mt-4">
                <Link
                  to="/billing"
                  className="text-sm text-accent-blue hover:text-blue-400"
                >
                  Manage subscription
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
