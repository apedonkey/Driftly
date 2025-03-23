import React from 'react';

import {
  AdjustmentsHorizontalIcon,
  CheckCircleIcon,
  PencilIcon,
  PlusIcon,
  StarIcon,
  TrashIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

// This is an example file showing how to implement contact scoring functionality
// to integrate with the ContactManager page

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  tags: string[];
  score: number;
  lastActivity?: string;
  source?: string;
}

interface ScoringRule {
  id: string;
  name: string;
  description?: string;
  condition: {
    field: string;
    operator: 'equals' | 'contains' | 'exists' | 'greater_than' | 'less_than' | 'empty';
    value?: string | number;
  };
  points: number;
  isActive: boolean;
}

export const ContactScoringExample: React.FC = () => {
  // State variables to add to ContactManager.tsx
  const [showScoring, setShowScoring] = React.useState(false);
  const [scoringRules, setScoringRules] = React.useState<ScoringRule[]>([]);
  const [isCreatingRule, setIsCreatingRule] = React.useState(false);
  const [isEditingRule, setIsEditingRule] = React.useState(false);
  const [selectedRuleId, setSelectedRuleId] = React.useState<string | null>(null);
  
  const [newRuleName, setNewRuleName] = React.useState('');
  const [newRuleDescription, setNewRuleDescription] = React.useState('');
  const [newRuleCondition, setNewRuleCondition] = React.useState<ScoringRule['condition']>({
    field: 'email',
    operator: 'contains',
    value: ''
  });
  const [newRulePoints, setNewRulePoints] = React.useState<number>(5);
  
  // Mock data for contacts and scoring rules
  const [contacts, setContacts] = React.useState<Contact[]>([]);

  // Generate some mock data on component mount
  React.useEffect(() => {
    // Mock scoring rules
    const mockRules: ScoringRule[] = [
      {
        id: '1',
        name: 'Has company email',
        description: 'Contact uses a business email domain',
        condition: {
          field: 'email',
          operator: 'contains',
          value: '.com'
        },
        points: 10,
        isActive: true
      },
      {
        id: '2',
        name: 'Complete profile',
        description: 'Contact has phone number',
        condition: {
          field: 'phone',
          operator: 'exists'
        },
        points: 5,
        isActive: true
      },
      {
        id: '3',
        name: 'VIP contact',
        description: 'Contact has VIP tag',
        condition: {
          field: 'tags',
          operator: 'contains',
          value: 'VIP'
        },
        points: 20,
        isActive: true
      },
      {
        id: '4',
        name: 'Recent activity',
        description: 'Contact has activity in the last 30 days',
        condition: {
          field: 'lastActivity',
          operator: 'greater_than',
          value: '30 days ago'
        },
        points: 15,
        isActive: false
      }
    ];
    
    setScoringRules(mockRules);
    
    // Mock contacts
    const mockContacts: Contact[] = [
      {
        id: '1',
        name: 'John Smith',
        email: 'john@acme.com',
        phone: '+1 555-123-4567',
        status: 'active',
        tags: ['VIP', 'Customer'],
        score: 35,
        lastActivity: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        source: 'Website'
      },
      {
        id: '2',
        name: 'Emma Johnson',
        email: 'emma.johnson@gmail.com',
        status: 'active',
        tags: ['Lead'],
        score: 10,
        lastActivity: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        source: 'Referral'
      },
      {
        id: '3',
        name: 'Michael Williams',
        email: 'michael@techcorp.com',
        phone: '+1 555-987-6543',
        status: 'active',
        tags: ['Customer'],
        score: 15,
        lastActivity: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        source: 'Email'
      }
    ];
    
    setContacts(mockContacts);
  }, []);

  // Function to create a new scoring rule
  const handleCreateRule = () => {
    if (!newRuleName.trim() || !newRuleCondition.field) return;
    
    // In a real implementation, this would call an API
    const newRule: ScoringRule = {
      id: Date.now().toString(),
      name: newRuleName,
      description: newRuleDescription || undefined,
      condition: { ...newRuleCondition },
      points: newRulePoints,
      isActive: true
    };
    
    setScoringRules([...scoringRules, newRule]);
    resetRuleForm();
  };

  // Function to update an existing rule
  const handleUpdateRule = () => {
    if (!selectedRuleId || !newRuleName.trim() || !newRuleCondition.field) return;
    
    // In a real implementation, this would call an API
    const updatedRules = scoringRules.map(rule => 
      rule.id === selectedRuleId 
        ? {
            ...rule,
            name: newRuleName,
            description: newRuleDescription || undefined,
            condition: { ...newRuleCondition },
            points: newRulePoints
          }
        : rule
    );
    
    setScoringRules(updatedRules);
    resetRuleForm();
  };

  // Function to toggle a rule's active status
  const toggleRuleActive = (ruleId: string) => {
    // In a real implementation, this would call an API
    const updatedRules = scoringRules.map(rule => 
      rule.id === ruleId 
        ? { ...rule, isActive: !rule.isActive }
        : rule
    );
    
    setScoringRules(updatedRules);
  };

  // Function to delete a rule
  const handleDeleteRule = (ruleId: string) => {
    // In a real implementation, this would call an API
    setScoringRules(scoringRules.filter(rule => rule.id !== ruleId));
    
    if (selectedRuleId === ruleId) {
      setSelectedRuleId(null);
    }
  };

  // Function to edit an existing rule
  const startEditingRule = (ruleId: string) => {
    const rule = scoringRules.find(r => r.id === ruleId);
    if (!rule) return;
    
    setSelectedRuleId(ruleId);
    setNewRuleName(rule.name);
    setNewRuleDescription(rule.description || '');
    setNewRuleCondition({ ...rule.condition });
    setNewRulePoints(rule.points);
    setIsEditingRule(true);
    setIsCreatingRule(false);
  };

  // Function to reset the rule form
  const resetRuleForm = () => {
    setNewRuleName('');
    setNewRuleDescription('');
    setNewRuleCondition({
      field: 'email',
      operator: 'contains',
      value: ''
    });
    setNewRulePoints(5);
    setIsCreatingRule(false);
    setIsEditingRule(false);
    setSelectedRuleId(null);
  };

  // Function to recalculate all contact scores
  const recalculateScores = () => {
    // In a real implementation, this would call an API
    // For this example, we'll calculate scores based on our rules
    
    const activeRules = scoringRules.filter(rule => rule.isActive);
    
    const updatedContacts = contacts.map(contact => {
      let score = 0;
      
      activeRules.forEach(rule => {
        const { field, operator, value } = rule.condition;
        
        // Check if the contact meets the condition
        const contactValue = contact[field as keyof Contact];
        
        let conditionMet = false;
        
        switch (operator) {
          case 'equals':
            if (typeof contactValue === 'string') {
              conditionMet = contactValue === value;
            } else if (Array.isArray(contactValue)) {
              conditionMet = contactValue.includes(value as string);
            }
            break;
          case 'contains':
            if (typeof contactValue === 'string') {
              conditionMet = contactValue.includes(value as string);
            } else if (Array.isArray(contactValue)) {
              conditionMet = contactValue.some(v => v.includes(value as string));
            }
            break;
          case 'exists':
            conditionMet = contactValue !== undefined && contactValue !== null && contactValue !== '';
            break;
          case 'greater_than':
            if (field === 'lastActivity' && contactValue) {
              const activityDate = new Date(contactValue as string).getTime();
              const compareDate = new Date().getTime() - 30 * 24 * 60 * 60 * 1000; // 30 days ago
              conditionMet = activityDate > compareDate;
            } else if (typeof contactValue === 'number') {
              conditionMet = contactValue > (value as number);
            }
            break;
          case 'less_than':
            if (typeof contactValue === 'number') {
              conditionMet = contactValue < (value as number);
            }
            break;
          case 'empty':
            conditionMet = contactValue === undefined || contactValue === null || contactValue === '';
            break;
        }
        
        if (conditionMet) {
          score += rule.points;
        }
      });
      
      return { ...contact, score };
    });
    
    setContacts(updatedContacts);
  };

  // Format the condition for display
  const formatCondition = (condition: ScoringRule['condition']) => {
    const { field, operator, value } = condition;
    
    let fieldDisplay = field.charAt(0).toUpperCase() + field.slice(1);
    if (field === 'lastActivity') fieldDisplay = 'Last Activity';
    
    switch (operator) {
      case 'equals':
        return `${fieldDisplay} equals "${value}"`;
      case 'contains':
        return `${fieldDisplay} contains "${value}"`;
      case 'exists':
        return `${fieldDisplay} exists`;
      case 'greater_than':
        if (field === 'lastActivity') {
          return `${fieldDisplay} is within the last 30 days`;
        }
        return `${fieldDisplay} > ${value}`;
      case 'less_than':
        return `${fieldDisplay} < ${value}`;
      case 'empty':
        return `${fieldDisplay} is empty`;
      default:
        return `${fieldDisplay} ${operator} ${value || ''}`;
    }
  };

  // Render scoring rule form
  const ScoringRuleForm = () => (
    <div className="bg-gray-800 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-medium text-white mb-4">
        {isEditingRule ? 'Edit Scoring Rule' : 'Create New Scoring Rule'}
      </h3>
      
      <div className="mb-4">
        <label htmlFor="ruleName" className="block text-sm font-medium text-white mb-1">
          Rule Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          id="ruleName"
          value={newRuleName}
          onChange={(e) => setNewRuleName(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-700 bg-gray-800 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
          placeholder="e.g., Has company email"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="ruleDescription" className="block text-sm font-medium text-white mb-1">
          Description
        </label>
        <textarea
          id="ruleDescription"
          value={newRuleDescription}
          onChange={(e) => setNewRuleDescription(e.target.value)}
          rows={2}
          className="block w-full px-3 py-2 border border-gray-700 bg-gray-800 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
          placeholder="Briefly describe what this rule does"
        />
      </div>
      
      {/* Condition section */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-white mb-2">
          Condition <span className="text-red-400">*</span>
        </h4>
        <div className="p-3 bg-gray-700 rounded-md">
          <div className="mb-3">
            <label className="block text-sm font-medium text-white mb-1">
              Field
            </label>
            <select
              value={newRuleCondition.field}
              onChange={(e) => setNewRuleCondition({ ...newRuleCondition, field: e.target.value, value: '' })}
              className="block w-full px-3 py-2 border border-gray-600 bg-gray-700 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
            >
              <option value="email">Email</option>
              <option value="name">Name</option>
              <option value="phone">Phone</option>
              <option value="status">Status</option>
              <option value="tags">Tags</option>
              <option value="lastActivity">Last Activity</option>
              <option value="source">Source</option>
            </select>
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium text-white mb-1">
              Operator
            </label>
            <select
              value={newRuleCondition.operator}
              onChange={(e) => setNewRuleCondition({ ...newRuleCondition, operator: e.target.value as any, value: '' })}
              className="block w-full px-3 py-2 border border-gray-600 bg-gray-700 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
            >
              <option value="equals">Equals</option>
              <option value="contains">Contains</option>
              <option value="exists">Exists</option>
              <option value="greater_than">Greater Than</option>
              <option value="less_than">Less Than</option>
              <option value="empty">Is Empty</option>
            </select>
          </div>
          
          {/* Value field - only show for operators that need it */}
          {newRuleCondition.operator !== 'exists' && newRuleCondition.operator !== 'empty' && (
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Value
              </label>
              
              {newRuleCondition.field === 'status' ? (
                <select
                  value={newRuleCondition.value as string || ''}
                  onChange={(e) => setNewRuleCondition({ ...newRuleCondition, value: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-600 bg-gray-700 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                >
                  <option value="">Select a status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="lead">Lead</option>
                  <option value="customer">Customer</option>
                </select>
              ) : newRuleCondition.field === 'source' ? (
                <select
                  value={newRuleCondition.value as string || ''}
                  onChange={(e) => setNewRuleCondition({ ...newRuleCondition, value: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-600 bg-gray-700 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                >
                  <option value="">Select a source</option>
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="Email">Email</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={newRuleCondition.value as string || ''}
                  onChange={(e) => setNewRuleCondition({ ...newRuleCondition, value: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-600 bg-gray-700 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                  placeholder={`Value for ${newRuleCondition.field}`}
                />
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Points section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-white mb-1">
          Points <span className="text-red-400">*</span>
        </label>
        <input
          type="number"
          value={newRulePoints}
          onChange={(e) => setNewRulePoints(parseInt(e.target.value) || 0)}
          min="-100"
          max="100"
          className="block w-full px-3 py-2 border border-gray-700 bg-gray-800 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
        />
        <p className="mt-1 text-xs text-gray-400">
          Use positive points to reward, negative points to penalize
        </p>
      </div>
      
      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={resetRuleForm}
          className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-white hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={isEditingRule ? handleUpdateRule : handleCreateRule}
          disabled={!newRuleName.trim() || !newRuleCondition.field}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue disabled:opacity-50"
        >
          {isEditingRule ? 'Update Rule' : 'Create Rule'}
        </button>
      </div>
    </div>
  );

  // Render rules list
  const ScoringRulesList = () => (
    <div className="bg-secondary-bg rounded-lg shadow-md overflow-hidden mb-6">
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-medium text-white">Scoring Rules</h2>
        <div className="flex space-x-2">
          <button
            onClick={recalculateScores}
            className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-white hover:bg-gray-700"
          >
            <AdjustmentsHorizontalIcon className="h-4 w-4 mr-1" />
            Apply Rules
          </button>
          <button
            onClick={() => {
              setIsCreatingRule(true);
              setIsEditingRule(false);
              setSelectedRuleId(null);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            New Rule
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {scoringRules.length === 0 ? (
          <div className="text-center py-6">
            <StarIcon className="h-12 w-12 mx-auto text-gray-500" />
            <p className="mt-2 text-gray-400">No scoring rules created yet</p>
            <button
              onClick={() => setIsCreatingRule(true)}
              className="mt-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Create First Rule
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {scoringRules.map(rule => (
              <div key={rule.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-md font-medium text-white flex items-center">
                      <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                      {rule.name}
                      {rule.isActive ? (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-300">
                          <CheckCircleIcon className="h-3 w-3 mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                          <XCircleIcon className="h-3 w-3 mr-1" />
                          Inactive
                        </span>
                      )}
                    </h3>
                    
                    {rule.description && (
                      <p className="mt-1 text-sm text-gray-400">{rule.description}</p>
                    )}
                    
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-700 text-gray-300">
                        {formatCondition(rule.condition)}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-900/30 text-blue-300">
                        {rule.points > 0 ? `+${rule.points}` : rule.points} points
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleRuleActive(rule.id)}
                      className="inline-flex items-center px-2 py-1 border border-gray-600 rounded-md text-xs font-medium text-white hover:bg-gray-700"
                    >
                      {rule.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => startEditingRule(rule.id)}
                      className="inline-flex items-center px-2 py-1 border border-gray-600 rounded-md text-xs font-medium text-white hover:bg-gray-700"
                    >
                      <PencilIcon className="h-3 w-3 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="inline-flex items-center px-2 py-1 border border-gray-600 rounded-md text-xs font-medium text-white hover:bg-gray-700"
                    >
                      <TrashIcon className="h-3 w-3 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Render contact scores table
  const ContactScoresTable = () => (
    <div className="bg-secondary-bg rounded-lg shadow-md overflow-hidden mb-6">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-medium text-white">Contact Scores</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Tags
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Score
              </th>
            </tr>
          </thead>
          <tbody className="bg-secondary-bg divide-y divide-gray-700">
            {contacts.map(contact => (
              <tr key={contact.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {contact.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {contact.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex flex-wrap gap-1">
                    {contact.tags.map((tag, idx) => (
                      <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-700 text-gray-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className={`inline-flex items-center px-2 py-1 rounded font-medium ${
                    contact.score >= 30 
                      ? 'bg-green-900/30 text-green-300' 
                      : contact.score >= 15 
                      ? 'bg-yellow-900/30 text-yellow-300'
                      : 'bg-gray-700 text-gray-300'
                  }`}>
                    <StarIcon className="h-4 w-4 mr-1" />
                    {contact.score}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // This would be integrated into ContactManager.tsx
  return (
    <div>
      {/* Add a button to toggle scoring panel in the ContactManager */}
      <button
        onClick={() => setShowScoring(!showScoring)}
        className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-white hover:bg-gray-700"
      >
        <StarIcon className="h-5 w-5 mr-1" />
        {showScoring ? 'Hide Scoring' : 'Contact Scoring'}
      </button>
      
      {/* Show the scoring panel when toggled */}
      {showScoring && (
        <div className="mt-6">
          {isCreatingRule || isEditingRule ? <ScoringRuleForm /> : (
            <>
              <ScoringRulesList />
              <ContactScoresTable />
            </>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Integration Instructions for ContactManager.tsx:
 * 
 * 1. Add imports:
 *    - Import StarIcon, PlusIcon, TrashIcon, PencilIcon, AdjustmentsHorizontalIcon, CheckCircleIcon, XCircleIcon from '@heroicons/react/24/outline'
 * 
 * 2. Add interfaces:
 *    - ScoringRule interface for scoring rule data structure
 *    - Update Contact interface to include score field if not already present
 * 
 * 3. Add state variables:
 *    - const [showScoring, setShowScoring] = React.useState(false);
 *    - const [scoringRules, setScoringRules] = React.useState<ScoringRule[]>([]);
 *    - const [isCreatingRule, setIsCreatingRule] = React.useState(false);
 *    - const [isEditingRule, setIsEditingRule] = React.useState(false);
 *    - const [selectedRuleId, setSelectedRuleId] = React.useState<string | null>(null);
 *    - const [newRuleName, setNewRuleName] = React.useState('');
 *    - const [newRuleDescription, setNewRuleDescription] = React.useState('');
 *    - const [newRuleCondition, setNewRuleCondition] = React.useState<ScoringRule['condition']>({
 *        field: 'email',
 *        operator: 'contains',
 *        value: ''
 *      });
 *    - const [newRulePoints, setNewRulePoints] = React.useState<number>(5);
 * 
 * 4. Add helper functions:
 *    - handleCreateRule, handleUpdateRule, toggleRuleActive, handleDeleteRule
 *    - startEditingRule, resetRuleForm, recalculateScores, formatCondition
 * 
 * 5. Create the components:
 *    - ScoringRuleForm for adding/editing rules
 *    - ScoringRulesList for displaying all rules
 *    - ContactScoresTable for displaying contact scores
 * 
 * 6. Add a button to toggle the scoring panel in the header:
 *    <button
 *      onClick={() => setShowScoring(!showScoring)}
 *      className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-white hover:bg-gray-700"
 *    >
 *      <StarIcon className="h-5 w-5 mr-1" />
 *      {showScoring ? 'Hide Scoring' : 'Contact Scoring'}
 *    </button>
 * 
 * 7. Add the scoring panel to the main content section:
 *    {showScoring && (
 *      <div className="mt-6">
 *        {isCreatingRule || isEditingRule ? <ScoringRuleForm /> : (
 *          <>
 *            <ScoringRulesList />
 *            <ContactScoresTable />
 *          </>
 *        )}
 *      </div>
 *    )}
 */ 