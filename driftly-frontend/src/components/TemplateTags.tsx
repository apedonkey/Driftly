import React, { useState } from 'react';

import {
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface TemplateTagsProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  suggestedTags?: string[];
}

const TemplateTags: React.FC<TemplateTagsProps> = ({ 
  selectedTags, 
  onChange,
  suggestedTags = ['welcome', 'onboarding', 'sales', 'follow-up', 're-engagement', 'feedback', 'promotional', 'educational', 'events']
}) => {
  const [newTag, setNewTag] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Add a new tag 
  const addTag = (tag: string) => {
    // Normalize tag - lowercase and trim
    const normalizedTag = tag.toLowerCase().trim();
    
    // Don't add empty tags or duplicates
    if (!normalizedTag || selectedTags.includes(normalizedTag)) {
      setNewTag('');
      return;
    }
    
    // Add the tag
    onChange([...selectedTags, normalizedTag]);
    setNewTag('');
  };
  
  // Remove a tag
  const removeTag = (tagToRemove: string) => {
    onChange(selectedTags.filter(tag => tag !== tagToRemove));
  };
  
  // Handle key press in the input field
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(newTag);
    }
  };
  
  // Handle suggestion click
  const handleSuggestionClick = (tag: string) => {
    addTag(tag);
    setShowSuggestions(false);
  };
  
  // Filter suggested tags to exclude already selected ones
  const filteredSuggestions = suggestedTags.filter(
    tag => !selectedTags.includes(tag)
  );
  
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-400">
        Tags
      </label>
      
      {/* Selected tags */}
      <div className="flex flex-wrap gap-2">
        {selectedTags.map(tag => (
          <div 
            key={tag} 
            className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-accent-blue/20 text-accent-blue"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 text-accent-blue hover:text-white focus:outline-none"
            >
              <XMarkIcon className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      
      {/* Add new tag */}
      <div className="relative">
        <div className="flex">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setShowSuggestions(true)}
            className="block w-full px-3 py-2 border border-gray-700 bg-gray-800 rounded-l-md shadow-sm focus:outline-none focus:ring-accent-blue focus:border-accent-blue text-white text-sm"
            placeholder="Add a tag..."
          />
          <button
            type="button"
            onClick={() => addTag(newTag)}
            className="inline-flex items-center px-3 py-2 border border-l-0 border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-accent-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>
        
        {/* Tag suggestions */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-md shadow-lg">
            <ul className="py-1 max-h-60 overflow-auto">
              {filteredSuggestions.map(tag => (
                <li
                  key={tag}
                  onClick={() => handleSuggestionClick(tag)}
                  className="px-3 py-2 text-sm text-white hover:bg-gray-700 cursor-pointer"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <p className="text-xs text-gray-400">
        Tags help organize and find your templates more easily
      </p>
    </div>
  );
};

export default TemplateTags; 