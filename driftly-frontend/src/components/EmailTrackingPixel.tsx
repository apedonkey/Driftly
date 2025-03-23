import React, { useState } from 'react';

import {
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/24/outline';

interface EmailTrackingPixelProps {
  flowId: string;
  stepId: string;
  baseUrl?: string;
}

/**
 * Component that generates tracking pixel code for email templates
 * This allows tracking of email opens and can be included in email templates
 */
const EmailTrackingPixel: React.FC<EmailTrackingPixelProps> = ({ 
  flowId,
  stepId,
  baseUrl = 'https://api.driftly.app/tracking'
}) => {
  const [copied, setCopied] = useState(false);
  
  // Generate tracking URL with query parameters
  const trackingUrl = `${baseUrl}/pixel.gif?flowId=${flowId}&stepId=${stepId}&contactId={{contactId}}&type=open&t=${Date.now()}`;
  
  // Generate HTML for tracking pixel
  const trackingHtml = `<img src="${trackingUrl}" alt="" width="1" height="1" style="display:none;" />`;
  
  // Generate HTML for click tracking
  const clickTrackingExample = `<a href="${baseUrl}/redirect?flowId=${flowId}&stepId=${stepId}&contactId={{contactId}}&type=click&url={{YOUR_URL}}">Click here</a>`;
  
  // Handle copy to clipboard
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };
  
  return (
    <div className="bg-secondary-bg rounded-lg p-4 space-y-4">
      <h2 className="text-lg font-medium text-white">Email Tracking</h2>
      
      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-2">Open Tracking Pixel</h3>
        <p className="text-sm text-gray-400 mb-3">
          Add this invisible image to your email template to track when recipients open your emails.
        </p>
        <div className="relative">
          <pre className="bg-gray-800 p-3 rounded-md text-sm text-gray-300 overflow-x-auto">{trackingHtml}</pre>
          <button
            onClick={() => handleCopy(trackingHtml)}
            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white"
            title="Copy to clipboard"
          >
            {copied ? 
              <ClipboardDocumentCheckIcon className="h-5 w-5 text-green-400" /> : 
              <ClipboardDocumentIcon className="h-5 w-5" />
            }
          </button>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-2">Click Tracking</h3>
        <p className="text-sm text-gray-400 mb-3">
          Wrap your links with this redirect URL to track when recipients click links in your emails.
        </p>
        <div className="relative">
          <pre className="bg-gray-800 p-3 rounded-md text-sm text-gray-300 overflow-x-auto">{clickTrackingExample}</pre>
          <button
            onClick={() => handleCopy(clickTrackingExample)}
            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white"
            title="Copy to clipboard"
          >
            {copied ? 
              <ClipboardDocumentCheckIcon className="h-5 w-5 text-green-400" /> : 
              <ClipboardDocumentIcon className="h-5 w-5" />
            }
          </button>
        </div>
      </div>
      
      <div className="bg-gray-700/30 rounded-md p-3 text-sm text-gray-300">
        <p className="mb-2 font-medium">How it works:</p>
        <ol className="list-decimal list-inside space-y-1 text-gray-400">
          <li>The tracking pixel is a 1x1 transparent GIF image that loads when the email is opened</li>
          <li>The click tracking redirects through our server before sending the user to your actual URL</li>
          <li>The <code className="bg-gray-700 px-1 rounded">{'{{contactId}}'}</code> placeholder is automatically replaced with the recipient's ID</li>
          <li>Replace <code className="bg-gray-700 px-1 rounded">{'{{YOUR_URL}}'}</code> with your actual destination URL</li>
        </ol>
      </div>
    </div>
  );
};

export default EmailTrackingPixel; 