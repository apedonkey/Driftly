import React, { useState } from 'react';

interface TestVariableProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
}

const TestVariable: React.FC<TestVariableProps> = ({ name, value, onChange }) => {
  return (
    <div className="mb-2">
      <label className="block text-xs font-medium text-gray-400 mb-1">
        {name}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full px-2 py-1 text-sm border border-gray-700 bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-accent-blue focus:border-accent-blue text-white"
        placeholder={`Enter test value for ${name}`}
      />
    </div>
  );
};

interface EmailPreviewProps {
  subject: string;
  content: string;
  customVariables?: Record<string, string>;
  flowId?: string;
  stepId?: string;
  showTracking?: boolean;
  trackingPixel?: string;
}

const EmailPreview: React.FC<EmailPreviewProps> = ({ 
  subject, 
  content,
  customVariables = {},
  flowId,
  stepId,
  showTracking = false,
  trackingPixel
}) => {
  const [testData, setTestData] = useState<Record<string, string>>({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    company: 'ACME Corp',
    ...customVariables
  });
  
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [showEmailSource, setShowEmailSource] = useState(false);
  
  // Replace variable placeholders with test values
  const replaceVariables = (text: string): string => {
    let result = text;
    
    // Replace all {{variable}} patterns with the corresponding test value
    Object.keys(testData).forEach(key => {
      const pattern = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(pattern, testData[key] || '');
    });
    
    return result;
  };
  
  // Prepare HTML content with replaced variables and tracking pixel
  const prepareHtmlContent = () => {
    let finalContent = replaceVariables(content);
    
    // Add tracking pixel if provided and tracking is enabled
    if (showTracking && trackingPixel) {
      // Insert tracking pixel before the closing body tag if it exists
      if (finalContent.includes('</body>')) {
        finalContent = finalContent.replace('</body>', `${trackingPixel}</body>`);
      } else {
        // Otherwise append it to the end
        finalContent = `${finalContent}${trackingPixel}`;
      }
    }
    
    return { __html: finalContent };
  };
  
  // Update test variable
  const updateTestVariable = (name: string, value: string) => {
    setTestData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Get the raw email HTML with tracking and variable replacements
  const getEmailSource = () => {
    let finalContent = replaceVariables(content);
    
    // Add tracking pixel if provided and tracking is enabled
    if (showTracking && trackingPixel) {
      // Insert tracking pixel before the closing body tag if it exists
      if (finalContent.includes('</body>')) {
        finalContent = finalContent.replace('</body>', `${trackingPixel}</body>`);
      } else {
        // Otherwise append it to the end
        finalContent = `${finalContent}${trackingPixel}`;
      }
    }
    
    return finalContent;
  };
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-medium text-white">Email Preview</h3>
          <p className="text-sm text-gray-400">See how your email will look to recipients</p>
        </div>
        <div className="space-x-2">
          <button
            onClick={() => setShowEmailSource(!showEmailSource)}
            className="px-3 py-1 text-xs text-white bg-gray-700 rounded hover:bg-gray-600 focus:outline-none"
          >
            {showEmailSource ? 'Hide Source' : 'View Source'}
          </button>
          <button
            onClick={() => setShowTestPanel(!showTestPanel)}
            className="px-3 py-1 text-xs text-white bg-accent-blue rounded hover:bg-blue-600 focus:outline-none"
          >
            {showTestPanel ? 'Hide Test Panel' : 'Show Test Panel'}
          </button>
        </div>
      </div>
      
      {/* Tracking indicator if tracking is enabled */}
      {showTracking && trackingPixel && (
        <div className="mb-4 p-2 bg-green-800/20 border border-green-700 rounded-md">
          <div className="flex items-center">
            <svg className="h-4 w-4 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-green-300">Email tracking is enabled for this message</span>
          </div>
        </div>
      )}
      
      {/* Email source view if enabled */}
      {showEmailSource && (
        <div className="mb-4 p-3 bg-gray-800 border border-gray-700 rounded-md overflow-x-auto">
          <pre className="text-xs text-gray-300 whitespace-pre-wrap">{getEmailSource()}</pre>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Preview Panel */}
        <div className={`lg:col-span-${showTestPanel ? '2' : '3'} bg-white rounded-md overflow-hidden`}>
          <div className="px-4 py-3 bg-gray-100 border-b border-gray-300">
            <div className="text-gray-600 text-sm mb-1">From: Driftly &lt;no-reply@driftly.app&gt;</div>
            <div className="text-gray-600 text-sm mb-1">To: {testData.firstName} {testData.lastName} &lt;{testData.email}&gt;</div>
            <div className="text-gray-900 font-medium">{replaceVariables(subject)}</div>
          </div>
          
          <div className="p-6 min-h-[400px] text-gray-900">
            <div dangerouslySetInnerHTML={prepareHtmlContent()} />
          </div>
        </div>
        
        {/* Test Panel */}
        {showTestPanel && (
          <div className="lg:col-span-1 bg-secondary-bg rounded-md p-4">
            <h4 className="font-medium text-white mb-3">Test Variables</h4>
            <p className="text-xs text-gray-400 mb-4">Customize values to see how your email looks with different data</p>
            
            {Object.keys(testData).map(key => (
              <TestVariable
                key={key}
                name={key}
                value={testData[key]}
                onChange={(value) => updateTestVariable(key, value)}
              />
            ))}
            
            <button
              onClick={() => setTestData({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                company: 'ACME Corp',
                ...customVariables
              })}
              className="w-full mt-2 px-3 py-1 text-xs text-white bg-gray-700 rounded hover:bg-gray-600 focus:outline-none"
            >
              Reset to Defaults
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailPreview; 