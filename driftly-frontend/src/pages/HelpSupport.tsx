import React, {
  useEffect,
  useState,
} from 'react';

import { Link } from 'react-router-dom';

import {
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  CodeBracketIcon,
  CogIcon,
  CreditCardIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  InformationCircleIcon,
  LightBulbIcon,
  PresentationChartLineIcon,
  QuestionMarkCircleIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

interface FAQ {
  question: string;
  answer: string;
}

// Categories for the sidebar navigation
interface Category {
  id: string;
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

// Document interface
interface DocumentLink {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  category: string;
}

const HelpSupport: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'documentation' | 'faq' | 'contact'>('documentation');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('getting-started');
  const [filteredDocs, setFilteredDocs] = useState<DocumentLink[]>([]);

  // Define categories for the sidebar
  const categories: Category[] = [
    { id: 'getting-started', name: 'Getting Started', icon: DocumentTextIcon },
    { id: 'advanced-features', name: 'Advanced Features', icon: CogIcon },
    { id: 'best-practices', name: 'Best Practices', icon: LightBulbIcon },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: WrenchScrewdriverIcon },
  ];

  // Define all documentation links with detailed metadata
  const documentLinks: DocumentLink[] = [
    // Getting Started
    {
      id: 'platform-overview',
      title: 'Platform Overview',
      description: 'Learn about Driftly\'s key features and capabilities',
      icon: InformationCircleIcon,
      category: 'getting-started'
    },
    {
      id: 'account-setup',
      title: 'Account Setup & Configuration',
      description: 'Set up your account and configure your basic settings',
      icon: UserGroupIcon,
      category: 'getting-started'
    },
    {
      id: 'first-automation',
      title: 'Creating Your First Automation',
      description: 'Step-by-step guide to creating your first automation workflow',
      icon: CogIcon,
      category: 'getting-started'
    },
    {
      id: 'importing-contacts',
      title: 'Importing Contacts',
      description: 'Learn how to import and manage your contact lists',
      icon: UserGroupIcon,
      category: 'getting-started'
    },
    {
      id: 'template-basics',
      title: 'Template Basics',
      description: 'Create and manage email templates for your campaigns',
      icon: DocumentTextIcon,
      category: 'getting-started'
    },
    {
      id: 'billing-setup',
      title: 'Billing & Subscription Setup',
      description: 'Set up your billing information and manage your subscription',
      icon: CreditCardIcon,
      category: 'getting-started'
    },
    
    // Advanced Features
    {
      id: 'conditional-logic',
      title: 'Conditional Logic',
      description: 'Create advanced automation workflows with conditional branches',
      icon: CodeBracketIcon,
      category: 'advanced-features'
    },
    {
      id: 'analytics-reporting',
      title: 'Analytics & Reporting',
      description: 'Track and analyze performance with detailed reports',
      icon: PresentationChartLineIcon,
      category: 'advanced-features'
    },
    {
      id: 'api-integration',
      title: 'API Integration',
      description: 'Connect Driftly with other tools using our robust API',
      icon: CodeBracketIcon,
      category: 'advanced-features'
    },
    {
      id: 'custom-actions',
      title: 'Custom Actions',
      description: 'Build custom actions to extend automation capabilities',
      icon: CogIcon,
      category: 'advanced-features'
    },
    {
      id: 'advanced-segmentation',
      title: 'Advanced Segmentation',
      description: 'Create sophisticated audience segments for targeted messaging',
      icon: UserGroupIcon,
      category: 'advanced-features'
    },
    {
      id: 'dynamic-content',
      title: 'Dynamic Content',
      description: 'Personalize emails with dynamic, data-driven content',
      icon: DocumentTextIcon,
      category: 'advanced-features'
    },
    
    // Best Practices
    {
      id: 'email-deliverability',
      title: 'Email Deliverability',
      description: 'Best practices to ensure your emails reach recipients',
      icon: EnvelopeIcon,
      category: 'best-practices'
    },
    {
      id: 'segmentation-strategies',
      title: 'Segmentation Strategies',
      description: 'Effective strategies for audience segmentation',
      icon: UserGroupIcon,
      category: 'best-practices'
    },
    {
      id: 'ab-testing',
      title: 'A/B Testing',
      description: 'Guidelines for effective A/B testing to optimize performance',
      icon: PresentationChartLineIcon,
      category: 'best-practices'
    },
    {
      id: 'automation-optimization',
      title: 'Automation Optimization',
      description: 'Tips to optimize your automation workflows for better results',
      icon: CogIcon,
      category: 'best-practices'
    },
    {
      id: 'data-management',
      title: 'Data Management',
      description: 'Best practices for managing your data and maintaining quality',
      icon: ShieldCheckIcon,
      category: 'best-practices'
    },
    {
      id: 'compliance-guidelines',
      title: 'Compliance Guidelines',
      description: 'Stay compliant with email and data protection regulations',
      icon: ShieldCheckIcon,
      category: 'best-practices'
    },
    
    // Troubleshooting
    {
      id: 'common-issues',
      title: 'Common Issues & Solutions',
      description: 'Solutions for frequently encountered problems',
      icon: WrenchScrewdriverIcon,
      category: 'troubleshooting'
    },
    {
      id: 'error-codes',
      title: 'Error Codes & Meanings',
      description: 'Detailed explanations of error codes and how to resolve them',
      icon: QuestionMarkCircleIcon,
      category: 'troubleshooting'
    },
    {
      id: 'subscription-issues',
      title: 'Subscription & Billing Issues',
      description: 'Troubleshoot problems with your subscription or billing',
      icon: CreditCardIcon,
      category: 'troubleshooting'
    },
    {
      id: 'performance-troubleshooting',
      title: 'Performance Troubleshooting',
      description: 'Diagnose and fix performance issues in your automations',
      icon: WrenchScrewdriverIcon,
      category: 'troubleshooting'
    },
    {
      id: 'contact-sync-issues',
      title: 'Contact Synchronization Issues',
      description: 'Resolve problems with contact importing and syncing',
      icon: UserGroupIcon,
      category: 'troubleshooting'
    }
  ];

  const faqs: FAQ[] = [
    {
      question: 'How do I create a new automation?',
      answer: 'To create a new automation, navigate to the Automations page and click the "Create Automation" button. This will take you to the Automation Builder where you can design your automation flow by adding steps like emails, delays, and conditions.'
    },
    {
      question: 'How can I track the performance of my automation?',
      answer: 'You can track your automation\'s performance through the Analytics tab on the automation detail page. This shows metrics like open rates, click rates, and conversion rates. For error monitoring, use the Errors tab to identify any issues with your automation.'
    },
    {
      question: 'What types of conditions can I add to my automation?',
      answer: 'You can add various conditions based on contact properties, behavior, or event triggers. For example, you can create branches for contacts who opened an email versus those who didn\'t, or segment based on custom attributes.'
    },
    {
      question: 'How do I import contacts?',
      answer: 'You can import contacts by going to the Contacts page and clicking the "Import" button. You can upload a CSV file with your contacts\' information. Ensure your CSV file has required fields like email and name properly formatted.'
    },
    {
      question: 'What\'s the difference between campaigns and automations?',
      answer: 'Campaigns are typically one-time email sends to a segment of your audience, while automations are ongoing, triggered sequences that can include multiple steps, conditions, and actions based on user behavior or time delays.'
    }
  ];

  // Filter documentation links based on the active category
  useEffect(() => {
    const filtered = documentLinks.filter(doc => doc.category === activeCategory);
    setFilteredDocs(filtered);
  }, [activeCategory]);

  const toggleFaq = (index: number) => {
    if (activeFaq === index) {
      setActiveFaq(null);
    } else {
      setActiveFaq(index);
    }
  };

  const SidebarNavItem = ({ category }: { category: Category }) => {
    const isActive = activeCategory === category.id;
    const Icon = category.icon;
    
    return (
      <button
        onClick={() => setActiveCategory(category.id)}
        className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md w-full text-left ${
          isActive
            ? 'bg-gray-700/50 text-white'
            : 'text-gray-300 hover:bg-gray-700/30 hover:text-white'
        } transition-colors`}
      >
        <Icon className="mr-3 h-5 w-5" />
        <span>{category.name}</span>
      </button>
    );
  };

  const DocumentCard = ({ document }: { document: DocumentLink }) => {
    const Icon = document.icon;
    
    return (
      <a 
        href={`#/docs/${document.id}`}
        className="block bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-1">
            <Icon className="h-5 w-5 text-accent-blue" />
          </div>
          <div className="ml-3">
            <h3 className="text-md font-medium text-white">{document.title}</h3>
            <p className="mt-1 text-sm text-gray-400">{document.description}</p>
          </div>
        </div>
      </a>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
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
          <h1 className="text-3xl font-bold text-white">Help & Support</h1>
          <p className="mt-2 text-gray-400">Get the help you need to make the most of Driftly</p>
        </header>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Sidebar */}
        <div className="md:w-64 flex-shrink-0">
          <div className="bg-secondary-bg rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <h2 className="font-medium text-white">Categories</h2>
            </div>
            <div className="p-2 space-y-1">
              {categories.map(category => (
                <SidebarNavItem key={category.id} category={category} />
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Tab Navigation */}
          <div className="border-b border-gray-700 mb-6">
            <div className="flex space-x-8">
              <button
                className={`py-4 px-1 ${
                  activeTab === 'documentation'
                    ? 'border-b-2 border-accent-blue text-accent-blue'
                    : 'text-gray-400 hover:text-gray-300'
                } font-medium text-sm flex items-center space-x-2`}
                onClick={() => setActiveTab('documentation')}
              >
                <DocumentTextIcon className="w-5 h-5" />
                <span>Documentation</span>
              </button>
              <button
                className={`py-4 px-1 ${
                  activeTab === 'faq'
                    ? 'border-b-2 border-accent-blue text-accent-blue'
                    : 'text-gray-400 hover:text-gray-300'
                } font-medium text-sm flex items-center space-x-2`}
                onClick={() => setActiveTab('faq')}
              >
                <QuestionMarkCircleIcon className="w-5 h-5" />
                <span>FAQ</span>
              </button>
              <button
                className={`py-4 px-1 ${
                  activeTab === 'contact'
                    ? 'border-b-2 border-accent-blue text-accent-blue'
                    : 'text-gray-400 hover:text-gray-300'
                } font-medium text-sm flex items-center space-x-2`}
                onClick={() => setActiveTab('contact')}
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                <span>Contact Support</span>
              </button>
            </div>
          </div>

          {/* Documentation Tab */}
          {activeTab === 'documentation' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-white">
                  {categories.find(cat => cat.id === activeCategory)?.name}
                </h2>
                <p className="mt-1 text-gray-400">
                  {activeCategory === 'getting-started' && 'Everything you need to get up and running with Driftly'}
                  {activeCategory === 'advanced-features' && 'Take your automation to the next level with advanced capabilities'}
                  {activeCategory === 'best-practices' && 'Learn best practices to maximize your success with Driftly'}
                  {activeCategory === 'troubleshooting' && 'Solutions to common issues and problems'}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDocs.map(doc => (
                  <DocumentCard key={doc.id} document={doc} />
                ))}
              </div>
            </div>
          )}

          {/* FAQ Tab */}
          {activeTab === 'faq' && (
            <div className="bg-secondary-bg rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-700">
                <h2 className="font-medium text-white">Frequently Asked Questions</h2>
              </div>
              <div className="divide-y divide-gray-700">
                {faqs.map((faq, index) => (
                  <div key={index} className="p-4">
                    <button
                      className="flex justify-between items-center w-full text-left font-medium text-white focus:outline-none"
                      onClick={() => toggleFaq(index)}
                    >
                      <span>{faq.question}</span>
                      <ChevronDownIcon 
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          activeFaq === index ? 'transform rotate-180' : ''
                        }`} 
                      />
                    </button>
                    {activeFaq === index && (
                      <div className="mt-2 text-gray-300 text-sm">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Support Tab */}
          {activeTab === 'contact' && (
            <div className="bg-secondary-bg rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Contact Our Support Team</h2>
              
              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="mt-1 block w-full border border-gray-700 rounded-md shadow-sm py-2 px-3 bg-gray-800 text-white focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                    placeholder="Your name"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="mt-1 block w-full border border-gray-700 rounded-md shadow-sm py-2 px-3 bg-gray-800 text-white focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                    placeholder="your.email@example.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-300">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    className="mt-1 block w-full border border-gray-700 rounded-md shadow-sm py-2 px-3 bg-gray-800 text-white focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                    placeholder="How can we help you?"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="mt-1 block w-full border border-gray-700 rounded-md shadow-sm py-2 px-3 bg-gray-800 text-white focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                    placeholder="Please describe your issue in detail..."
                  ></textarea>
                </div>
                
                <div>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-accent-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpSupport; 