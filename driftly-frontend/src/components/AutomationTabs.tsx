import React from 'react';

import {
  Link,
  useLocation,
} from 'react-router-dom';

interface AutomationTabsProps {
  automationId: string;
}

const AutomationTabs: React.FC<AutomationTabsProps> = ({ automationId }) => {
  const location = useLocation();
  
  const tabs = [
    { name: 'Editor', path: `/automations/builder/${automationId}` },
    { name: 'Analytics', path: `/automations/analytics/${automationId}` },
    { name: 'Errors', path: `/automations/${automationId}/errors` },
    { name: 'Test Interface', path: `/automations/${automationId}/test` },
  ];
  
  const isActive = (path: string) => {
    // Check if the current location path matches the tab path or contains it
    return location.pathname === path || 
           // Special case for editor to handle both builder URLs
           (path.includes('/builder/') && location.pathname.includes('/builder/')) ||
           // Handle analytics URL pattern
           (path.includes('/analytics/') && location.pathname.includes('/analytics/'));
  };
  
  return (
    <div className="w-64 bg-gray-900 border-r border-gray-700 h-full px-4 py-6">
      <h3 className="text-xl text-white font-medium mb-6">Automation</h3>
      <nav className="flex flex-col space-y-1">
        {tabs.map((tab) => (
          <Link
            key={tab.name}
            to={tab.path}
            className={`px-3 py-3 rounded-md text-sm font-medium transition-colors duration-150 ${
              isActive(tab.path)
                ? 'bg-indigo-700 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            {tab.name}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default AutomationTabs; 