import React, { useState } from 'react';

import {
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: string[];
  required: boolean;
}

interface CustomFieldsProps {
  fields: CustomField[];
  onAddField: (field: Omit<CustomField, 'id'>) => void;
  onDeleteField: (id: string) => void;
}

export const CustomFields: React.FC<CustomFieldsProps> = ({
  fields,
  onAddField,
  onDeleteField,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newField, setNewField] = useState<Omit<CustomField, 'id'>>({
    name: '',
    type: 'text',
    options: [],
    required: false,
  });
  const [optionsInput, setOptionsInput] = useState('');

  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    onAddField({
      ...newField,
      options: newField.type === 'select' ? newField.options : undefined,
    });
    setNewField({
      name: '',
      type: 'text',
      options: [],
      required: false,
    });
    setOptionsInput('');
    setShowAddForm(false);
  };

  const handleOptionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOptionsInput(e.target.value);
    setNewField({
      ...newField,
      options: e.target.value.split(',').map(opt => opt.trim()).filter(opt => opt),
    });
  };

  return (
    <div className="bg-secondary-bg rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-medium text-white">Custom Fields</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-accent-blue hover:bg-accent-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Field
        </button>
      </div>

      {showAddForm && (
        <div className="p-4 border-b border-gray-700 bg-gray-800">
          <form onSubmit={handleAddField}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="field-name" className="block text-sm font-medium text-white">
                  Field Name <span className="text-red-400">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="field-name"
                    value={newField.name}
                    onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-700 bg-gray-900 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                    placeholder="e.g. Company Size"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="field-type" className="block text-sm font-medium text-white">
                  Field Type <span className="text-red-400">*</span>
                </label>
                <div className="mt-1">
                  <select
                    id="field-type"
                    value={newField.type}
                    onChange={(e) => setNewField({ ...newField, type: e.target.value as any })}
                    className="block w-full px-3 py-2 border border-gray-700 bg-gray-900 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                    required
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="select">Select (Dropdown)</option>
                  </select>
                </div>
              </div>

              {newField.type === 'select' && (
                <div className="sm:col-span-6">
                  <label htmlFor="field-options" className="block text-sm font-medium text-white">
                    Options <span className="text-red-400">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="field-options"
                      value={optionsInput}
                      onChange={handleOptionsChange}
                      className="block w-full px-3 py-2 border border-gray-700 bg-gray-900 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                      placeholder="Option 1, Option 2, Option 3"
                      required={newField.type === 'select'}
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-400">Separate options with commas</p>
                </div>
              )}

              <div className="sm:col-span-6">
                <div className="flex items-center">
                  <input
                    id="field-required"
                    type="checkbox"
                    checked={newField.required}
                    onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-700 text-accent-blue focus:ring-accent-blue"
                  />
                  <label htmlFor="field-required" className="ml-2 text-sm text-white">
                    This field is required
                  </label>
                </div>
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
                Add Field
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="p-4">
        {fields.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-400">No custom fields added yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Field Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Required
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-secondary-bg divide-y divide-gray-700">
                {fields.map((field) => (
                  <tr key={field.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {field.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {field.type.charAt(0).toUpperCase() + field.type.slice(1)}
                      {field.type === 'select' && field.options && field.options.length > 0 && (
                        <div className="mt-1 text-xs text-gray-400">
                          Options: {field.options.join(', ')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {field.required ? 'Yes' : 'No'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => onDeleteField(field.id)}
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