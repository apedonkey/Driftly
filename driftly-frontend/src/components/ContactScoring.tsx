import React, { useState } from 'react';

import {
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

export interface ScoringRule {
  id: string;
  name: string;
  condition: string;
  points: number;
}

interface ContactScoringProps {
  rules: ScoringRule[];
  onAddRule: (rule: Omit<ScoringRule, 'id'>) => void;
  onDeleteRule: (id: string) => void;
}

export const ContactScoring: React.FC<ContactScoringProps> = ({
  rules,
  onAddRule,
  onDeleteRule,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRule, setNewRule] = useState<Omit<ScoringRule, 'id'>>({
    name: '',
    condition: '',
    points: 10,
  });

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    onAddRule(newRule);
    setNewRule({
      name: '',
      condition: '',
      points: 10,
    });
    setShowAddForm(false);
  };

  return (
    <div className="bg-secondary-bg rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-medium text-white">Contact Scoring</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-accent-blue hover:bg-accent-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Rule
        </button>
      </div>

      {showAddForm && (
        <div className="p-4 border-b border-gray-700 bg-gray-800">
          <form onSubmit={handleAddRule}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="rule-name" className="block text-sm font-medium text-white">
                  Rule Name <span className="text-red-400">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="rule-name"
                    value={newRule.name}
                    onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-700 bg-gray-900 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                    placeholder="e.g. High Email Engagement"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="rule-points" className="block text-sm font-medium text-white">
                  Points <span className="text-red-400">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    id="rule-points"
                    value={newRule.points}
                    onChange={(e) => setNewRule({ ...newRule, points: parseInt(e.target.value) })}
                    className="block w-full px-3 py-2 border border-gray-700 bg-gray-900 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                    min="1"
                    max="100"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="rule-condition" className="block text-sm font-medium text-white">
                  Condition <span className="text-red-400">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="rule-condition"
                    value={newRule.condition}
                    onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-700 bg-gray-900 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                    placeholder="e.g. emails.opened > 5"
                    required
                  />
                </div>
                <p className="mt-1 text-sm text-gray-400">
                  Use properties like emails.opened, emails.clicked, or contact.status in your condition
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-white hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue"
              >
                Add Rule
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="p-4">
        {rules.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-400">No scoring rules added yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Rule Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Condition
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Points
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-secondary-bg divide-y divide-gray-700">
                {rules.map((rule) => (
                  <tr key={rule.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {rule.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-white">
                      {rule.condition}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      +{rule.points}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => onDeleteRule(rule.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}; 