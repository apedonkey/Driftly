import React, { useState } from 'react';

import {
  Link,
  Outlet,
  useLocation,
} from 'react-router-dom';

import {
  ArrowLeftOnRectangleIcon,
  ArrowsRightLeftIcon,
  Bars3Icon,
  ChartBarIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  DocumentDuplicateIcon,
  EnvelopeIcon,
  HomeIcon,
  QuestionMarkCircleIcon,
  UserGroupIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

// Company logo component
const CompanyLogo = () => (
  <div className="flex items-center h-12 px-4">
    <span className="text-xl font-bold text-white">Driftly</span>
  </div>
);

interface NavItemProps {
  to: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  isActive: boolean;
  hasBadge?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, isActive, hasBadge }) => (
  <Link
    to={to}
    className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md ${
      isActive 
        ? 'bg-gray-700/50 text-white' 
        : 'text-gray-300 hover:bg-gray-700/30 hover:text-white'
    } transition-colors`}
  >
    <Icon className="mr-3 h-5 w-5" />
    <span>{label}</span>
    {hasBadge && (
      <span className="ml-auto bg-accent-blue text-white px-2 py-0.5 rounded-full text-xs">
        New
      </span>
    )}
  </Link>
);

interface NavigationSectionProps {
  title?: string;
  children: React.ReactNode;
}

const NavigationSection: React.FC<NavigationSectionProps> = ({ title, children }) => {
  return (
    <div className="space-y-1 px-2">
      {title && (
        <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {title}
        </h3>
      )}
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
};

const AppShell: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Helper function to check if a route is active
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="flex h-screen bg-primary-bg text-white">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-secondary-bg shadow-lg">
        <div className="flex flex-col h-full">
          <div className="flex-shrink-0 border-b border-gray-700">
            <CompanyLogo />
          </div>
          
          <div className="flex-1 flex flex-col overflow-y-auto py-4 space-y-6">
            
            <NavigationSection>
              <NavItem 
                to="/dashboard" 
                icon={HomeIcon} 
                label="Dashboard" 
                isActive={isActive('/dashboard')} 
              />
              <NavItem 
                to="/contacts" 
                icon={UserGroupIcon} 
                label="Contacts" 
                isActive={isActive('/contacts')} 
              />
              <NavItem 
                to="/campaigns" 
                icon={EnvelopeIcon} 
                label="Campaigns" 
                isActive={isActive('/campaigns')} 
              />
              <NavItem 
                to="/templates" 
                icon={DocumentDuplicateIcon} 
                label="Templates" 
                isActive={isActive('/templates')} 
              />
              <NavItem 
                to="/analytics" 
                icon={ChartBarIcon} 
                label="Analytics" 
                isActive={isActive('/analytics')} 
              />
              <NavItem 
                to="/automations" 
                icon={ArrowsRightLeftIcon} 
                label="Automations" 
                isActive={isActive('/automations')} 
                hasBadge 
              />
            </NavigationSection>
            
            <NavigationSection title="Account">
              <NavItem 
                to="/settings" 
                icon={Cog6ToothIcon} 
                label="Settings" 
                isActive={isActive('/settings')} 
              />
              <NavItem 
                to="/billing/dashboard" 
                icon={CreditCardIcon} 
                label="Billing" 
                isActive={isActive('/billing')} 
              />
              <NavItem 
                to="/help-support" 
                icon={QuestionMarkCircleIcon} 
                label="Help & Support" 
                isActive={isActive('/help-support')} 
              />
            </NavigationSection>
          </div>

          <div className="flex-shrink-0 border-t border-gray-700 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center text-sm font-medium text-white">
                JD
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">John Doe</p>
                <p className="text-xs text-gray-400">john@example.com</p>
              </div>
              <button 
                className="ml-auto text-gray-400 hover:text-white"
                aria-label="Sign out"
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden bg-secondary-bg fixed w-full z-10 border-b border-gray-700">
        <div className="flex items-center justify-between h-16 px-4">
          <CompanyLogo />
          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
          >
            <span className="sr-only">Open main menu</span>
            {isMobileMenuOpen ? (
              <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
            ) : (
              <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Background overlay */}
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75" aria-hidden="true" onClick={() => setIsMobileMenuOpen(false)}></div>
          
          {/* Sidebar component */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-secondary-bg">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button 
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
            
            <div className="flex-1 h-0 overflow-y-auto pt-5 pb-4">
              <div className="flex-shrink-0 flex items-center px-4 mb-4">
                <CompanyLogo />
              </div>
              
              <div className="overflow-y-auto py-4 h-full">
                <NavigationSection>
                  <NavItem 
                    to="/dashboard" 
                    icon={HomeIcon} 
                    label="Dashboard" 
                    isActive={isActive('/dashboard')} 
                  />
                  <NavItem 
                    to="/contacts" 
                    icon={UserGroupIcon} 
                    label="Contacts" 
                    isActive={isActive('/contacts')} 
                  />
                  <NavItem 
                    to="/campaigns" 
                    icon={EnvelopeIcon} 
                    label="Campaigns" 
                    isActive={isActive('/campaigns')} 
                  />
                  <NavItem 
                    to="/templates" 
                    icon={DocumentDuplicateIcon} 
                    label="Templates" 
                    isActive={isActive('/templates')} 
                  />
                  <NavItem 
                    to="/analytics" 
                    icon={ChartBarIcon} 
                    label="Analytics" 
                    isActive={isActive('/analytics')} 
                  />
                  <NavItem 
                    to="/automations" 
                    icon={ArrowsRightLeftIcon} 
                    label="Automations" 
                    isActive={isActive('/automations')} 
                    hasBadge 
                  />
                </NavigationSection>
                
                <NavigationSection title="Account">
                  <NavItem 
                    to="/settings" 
                    icon={Cog6ToothIcon} 
                    label="Settings" 
                    isActive={isActive('/settings')} 
                  />
                  <NavItem 
                    to="/billing/dashboard" 
                    icon={CreditCardIcon} 
                    label="Billing" 
                    isActive={isActive('/billing')} 
                  />
                  <NavItem 
                    to="/help-support" 
                    icon={QuestionMarkCircleIcon} 
                    label="Help & Support" 
                    isActive={isActive('/help-support')} 
                  />
                </NavigationSection>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col md:pl-64 flex-1">
        <main className="flex-1 bg-primary-bg">
          <div className="md:hidden h-16"></div>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppShell; 