import React from 'react';

import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

// Main layout components
import AppShell from './components/AppShell';
import TestHelpSupport from './components/TestHelpSupport';
// Auth context
import { AuthProvider } from './contexts/AuthContext';
import Analytics from './pages/Analytics';
import AutomationAnalytics from './pages/AutomationAnalytics';
import AutomationBuilder from './pages/AutomationBuilder';
import AutomationErrors from './pages/AutomationErrors';
import Automations from './pages/Automations';
import AutomationTestInterface from './pages/AutomationTestInterface';
import Billing from './pages/Billing';
import BillingDashboard from './pages/BillingDashboard';
import BillingHistory from './pages/BillingHistory';
import Campaigns from './pages/Campaigns';
import ContactDetail from './pages/ContactDetail';
import ContactManager from './pages/ContactManager';
import Contacts from './pages/Contacts';
// Main pages
import Dashboard from './pages/Dashboard';
// Flow pages
import FlowBuilder from './pages/FlowBuilder';
// Authentication pages
import ForgotPassword from './pages/ForgotPassword';
import HelpSupport from './pages/HelpSupport';
import Login from './pages/Login';
import PaymentMethods from './pages/PaymentMethods';
import Pricing from './pages/Pricing';
import SettingsPage from './pages/SettingsPage';
import Signup from './pages/Signup';
import SubscriptionManagement from './pages/SubscriptionManagement';
import TemplateDetail from './pages/TemplateDetail';
import TemplateEdit from './pages/TemplateEdit';
// Template pages
import Templates from './pages/Templates';

const App: React.FC = () => {
  // Mock authentication state - in a real app, this would come from an auth context
  const isAuthenticated = true;

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Authentication routes */}
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/signup" element={!isAuthenticated ? <Signup /> : <Navigate to="/dashboard" />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Public pages */}
          <Route path="/pricing" element={<Pricing />} />
          
          {/* Test page for Help & Support */}
          <Route path="/test-help" element={<TestHelpSupport />} />
          
          {/* Routes rendered directly without AppShell to avoid auth issues */}
          <Route path="/flows/new" element={<FlowBuilder />} />
          <Route path="/flows/:id" element={<FlowBuilder />} />
          <Route path="/flows/template/:templateId" element={<FlowBuilder />} />
          
          {/* Automation routes outside AppShell */}
          <Route path="/automations/builder/new" element={<AutomationBuilder />} />
          <Route path="/automations/builder/:id" element={<AutomationBuilder />} />
          
          {/* Flow-specific routes */}
          <Route path="/flows/:flowId/contacts" element={<ContactManager />} />
          <Route path="/flows/:flowId/contacts/:contactId" element={<ContactDetail />} />
          
          {/* Protected app routes */}
          <Route element={isAuthenticated ? <AppShell /> : <Navigate to="/login" />}>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            
            {/* Main app pages */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/campaigns" element={<Campaigns />} />
            
            {/* Template routes */}
            <Route path="/templates" element={<Templates />} />
            <Route path="/templates/:id" element={<TemplateDetail />} />
            <Route path="/templates/new" element={<TemplateEdit />} />
            <Route path="/templates/edit/:id" element={<TemplateEdit />} />
            
            {/* Analytics routes */}
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/analytics/:flowId" element={<Analytics />} />
            
            {/* Automation routes */}
            <Route path="/automations" element={<Automations />} />
            <Route path="/automations/create" element={<AutomationBuilder />} />
            <Route path="/automations/:id/edit" element={<AutomationBuilder />} />
            <Route path="/automations/:id/analytics" element={<AutomationAnalytics />} />
            <Route path="/automations/:id/errors" element={<AutomationErrors />} />
            <Route path="/automations/:id/test" element={<AutomationTestInterface />} />
            
            {/* Billing routes */}
            <Route path="/billing" element={<Billing />} />
            <Route path="/billing/dashboard" element={<BillingDashboard />} />
            
            {/* Settings routes */}
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/subscription" element={<SubscriptionManagement />} />
            <Route path="/settings/payment-methods" element={<PaymentMethods />} />
            <Route path="/settings/billing-history" element={<BillingHistory />} />
            
            {/* Add Help & Support route inside the AppShell */}
            <Route path="/help-support" element={<HelpSupport />} />
            
            {/* Catch-all route for protected app */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
