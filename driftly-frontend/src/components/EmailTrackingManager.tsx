import React, { useState } from 'react';

import {
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  CogIcon,
  DevicePhoneMobileIcon,
  InformationCircleIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

interface EmailTrackingManagerProps {
  flowId: string;
  stepId: string;
  baseUrl?: string;
  showAnalytics?: boolean;
  openRate?: number;
  clickRate?: number;
  uniqueOpens?: number;
  totalOpens?: number;
  uniqueClicks?: number;
  totalClicks?: number;
  analyticsData?: any;
}

/**
 * Component that manages email tracking features including tracking pixels, click tracking,
 * and shows analytics data if available
 */
const EmailTrackingManager: React.FC<EmailTrackingManagerProps> = ({ 
  flowId,
  stepId,
  baseUrl = 'https://api.driftly.app/tracking',
  showAnalytics = false,
  openRate = 0,
  clickRate = 0,
  uniqueOpens = 0,
  totalOpens = 0,
  uniqueClicks = 0,
  totalClicks = 0,
  analyticsData = null
}) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("pixel");
  const [advancedOptions, setAdvancedOptions] = useState<boolean>(false);
  
  // Generate common tracking parameters
  const baseParams = `flowId=${flowId}&stepId=${stepId}&contactId={{contactId}}`;
  
  // Generate tracking URL with query parameters and cache buster
  const cacheBuster = `&t={{timestamp}}`;
  const trackingUrl = `${baseUrl}/pixel.gif?${baseParams}${cacheBuster}`;
  
  // Generate HTML for tracking pixel
  const trackingHtml = `<img src="${trackingUrl}" alt="" width="1" height="1" style="display:none;" />`;
  
  // Generate HTML for click tracking
  const clickTrackingExample = `<a href="${baseUrl}/redirect?${baseParams}&url={{YOUR_URL}}">Click here</a>`;
  
  // Generate HTML for DNS tracking (requires DNS setup)
  const dnsTrackingExample = `<img src="https://{{contactId}}.track.${baseUrl.replace(/https?:\/\//, '')}/open.gif" alt="" width="1" height="1" style="display:none;" />`;
  
  // Generate HTML for backup tracking methods
  const cssTrackingExample = `<style>
@import url("${baseUrl}/css/${baseParams}");
</style>`;

  const backgroundTrackingExample = `<div style="background-image:url('${trackingUrl}')"></div>`;
  
  // Handle copy to clipboard
  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-white">Email Tracking</h2>
        {showAnalytics && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-4 w-4 rounded-full bg-blue-500 mr-1"></div>
              <span className="text-sm text-gray-300">Opens: {openRate}%</span>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0 h-4 w-4 rounded-full bg-green-500 mr-1"></div>
              <span className="text-sm text-gray-300">Clicks: {clickRate}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Tracking Options Tabs */}
      <div className="border-b border-gray-600">
        <nav className="-mb-px flex space-x-4" aria-label="Tracking Methods">
          <button
            onClick={() => setActiveTab("pixel")}
            className={`pb-2 px-1 border-b-2 transition ${
              activeTab === "pixel"
                ? "border-accent-blue text-accent-blue"
                : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-400"
            }`}
          >
            Tracking Pixel
          </button>
          <button
            onClick={() => setActiveTab("link")}
            className={`pb-2 px-1 border-b-2 transition ${
              activeTab === "link"
                ? "border-accent-blue text-accent-blue"
                : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-400"
            }`}
          >
            Link Tracking
          </button>
          <button
            onClick={() => setActiveTab("advanced")}
            className={`pb-2 px-1 border-b-2 transition ${
              activeTab === "advanced"
                ? "border-accent-blue text-accent-blue"
                : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-400"
            }`}
          >
            Advanced
          </button>
          {showAnalytics && (
            <button
              onClick={() => setActiveTab("analytics")}
              className={`pb-2 px-1 border-b-2 transition ${
                activeTab === "analytics"
                  ? "border-accent-blue text-accent-blue"
                  : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-400"
              }`}
            >
              Analytics
            </button>
          )}
        </nav>
      </div>

      {/* Tracking Pixel Tab */}
      {activeTab === "pixel" && (
        <div className="space-y-3">
          <div className="bg-gray-800 rounded-md p-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-sm font-medium text-white">Tracking Pixel HTML</h3>
              <button
                onClick={() => handleCopy(trackingHtml, 'pixel')}
                className="text-xs p-1.5 text-white bg-gray-700 rounded hover:bg-gray-600 flex items-center"
              >
                {copied === 'pixel' ? (
                  <>
                    <ClipboardDocumentCheckIcon className="h-4 w-4 mr-1 text-green-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <ClipboardDocumentIcon className="h-4 w-4 mr-1" />
                    Copy Code
                  </>
                )}
              </button>
            </div>
            <pre className="bg-gray-900 p-3 rounded text-xs text-gray-300 overflow-x-auto">
              {trackingHtml}
            </pre>
            <p className="mt-2 text-xs text-gray-400">
              Add this invisible tracking pixel to your email HTML right before the closing &lt;/body&gt; tag.
            </p>
          </div>
        </div>
      )}

      {/* Link Tracking Tab */}
      {activeTab === "link" && (
        <div className="space-y-3">
          <div className="bg-gray-800 rounded-md p-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-sm font-medium text-white">Link Tracking Example</h3>
              <button
                onClick={() => handleCopy(clickTrackingExample, 'link')}
                className="text-xs p-1.5 text-white bg-gray-700 rounded hover:bg-gray-600 flex items-center"
              >
                {copied === 'link' ? (
                  <>
                    <ClipboardDocumentCheckIcon className="h-4 w-4 mr-1 text-green-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <ClipboardDocumentIcon className="h-4 w-4 mr-1" />
                    Copy Code
                  </>
                )}
              </button>
            </div>
            <pre className="bg-gray-900 p-3 rounded text-xs text-gray-300 overflow-x-auto">
              {clickTrackingExample}
            </pre>
            <p className="mt-2 text-xs text-gray-400">
              Replace &lt;YOUR_URL&gt; with the destination URL (URL encoded). This tracks when recipients click links.
            </p>
          </div>
        </div>
      )}

      {/* Advanced Tab */}
      {activeTab === "advanced" && (
        <div className="space-y-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-white">Advanced Tracking Options</h3>
            <button
              onClick={() => setAdvancedOptions(!advancedOptions)}
              className="text-xs p-1.5 text-white bg-gray-700 rounded hover:bg-gray-600 flex items-center"
            >
              <CogIcon className="h-4 w-4 mr-1" />
              {advancedOptions ? "Hide Options" : "Show Options"}
            </button>
          </div>
          
          {advancedOptions && (
            <>
              {/* CSS Tracking */}
              <div className="bg-gray-800 rounded-md p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-sm font-medium text-white">CSS Import Tracking (Backup Method)</h3>
                  <button
                    onClick={() => handleCopy(cssTrackingExample, 'css')}
                    className="text-xs p-1.5 text-white bg-gray-700 rounded hover:bg-gray-600 flex items-center"
                  >
                    {copied === 'css' ? (
                      <>
                        <ClipboardDocumentCheckIcon className="h-4 w-4 mr-1 text-green-400" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <ClipboardDocumentIcon className="h-4 w-4 mr-1" />
                        Copy Code
                      </>
                    )}
                  </button>
                </div>
                <pre className="bg-gray-900 p-3 rounded text-xs text-gray-300 overflow-x-auto">
                  {cssTrackingExample}
                </pre>
                <p className="mt-2 text-xs text-gray-400">
                  CSS imports can bypass some image blocking. Add this to your email to improve tracking reliability.
                </p>
              </div>

              {/* Background Image Tracking */}
              <div className="bg-gray-800 rounded-md p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-sm font-medium text-white">Background Image Tracking (Backup Method)</h3>
                  <button
                    onClick={() => handleCopy(backgroundTrackingExample, 'bg')}
                    className="text-xs p-1.5 text-white bg-gray-700 rounded hover:bg-gray-600 flex items-center"
                  >
                    {copied === 'bg' ? (
                      <>
                        <ClipboardDocumentCheckIcon className="h-4 w-4 mr-1 text-green-400" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <ClipboardDocumentIcon className="h-4 w-4 mr-1" />
                        Copy Code
                      </>
                    )}
                  </button>
                </div>
                <pre className="bg-gray-900 p-3 rounded text-xs text-gray-300 overflow-x-auto">
                  {backgroundTrackingExample}
                </pre>
                <p className="mt-2 text-xs text-gray-400">
                  Background images may load when regular images are blocked. Add this to improve tracking reliability.
                </p>
              </div>
            </>
          )}

          <div className="bg-gray-700/30 rounded-md p-3 text-sm text-gray-300">
            <div className="flex items-start mb-2">
              <InformationCircleIcon className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
              <p className="font-medium">Why use multiple tracking methods?</p>
            </div>
            <ul className="list-disc list-inside space-y-1 text-gray-400 ml-7">
              <li>Email clients like Gmail, Outlook, or Apple Mail may block images</li>
              <li>Using multiple tracking methods increases the chances of detecting opens</li>
              <li>Link tracking is the most reliable method as it requires user interaction</li>
              <li>Advanced tracking methods can help bypass some image blocking techniques</li>
            </ul>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && showAnalytics && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* Opens Metrics */}
            <div className="bg-gray-800 rounded-md p-3">
              <h3 className="text-xs font-medium text-gray-400 mb-1">Opens</h3>
              <div className="flex justify-between items-baseline">
                <p className="text-xl font-semibold text-white">{uniqueOpens}</p>
                <p className="text-xs text-gray-400">Rate: {openRate}%</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">Total: {totalOpens} opens</p>
            </div>
            
            {/* Clicks Metrics */}
            <div className="bg-gray-800 rounded-md p-3">
              <h3 className="text-xs font-medium text-gray-400 mb-1">Clicks</h3>
              <div className="flex justify-between items-baseline">
                <p className="text-xl font-semibold text-white">{uniqueClicks}</p>
                <p className="text-xs text-gray-400">Rate: {clickRate}%</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">Total: {totalClicks} clicks</p>
            </div>
          </div>
          
          {/* Device and Location Stats */}
          {analyticsData && (
            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* Devices */}
              <div className="bg-gray-800 rounded-md p-3">
                <div className="flex items-center mb-2">
                  <DevicePhoneMobileIcon className="h-4 w-4 text-accent-blue mr-1" />
                  <h3 className="text-xs font-medium text-gray-400">Devices</h3>
                </div>
                {analyticsData.devices && Object.keys(analyticsData.devices).length > 0 ? (
                  <div className="space-y-1">
                    {Object.entries(analyticsData.devices).map(([device, count]: [string, any]) => (
                      <div key={device} className="flex justify-between items-center">
                        <p className="text-xs text-gray-300 capitalize">{device}</p>
                        <p className="text-xs text-gray-400">{count} ({Math.round((count / uniqueOpens) * 100)}%)</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">No device data available</p>
                )}
              </div>
              
              {/* Locations */}
              <div className="bg-gray-800 rounded-md p-3">
                <div className="flex items-center mb-2">
                  <MapPinIcon className="h-4 w-4 text-accent-blue mr-1" />
                  <h3 className="text-xs font-medium text-gray-400">Locations</h3>
                </div>
                {analyticsData.locations && Object.keys(analyticsData.locations).length > 0 ? (
                  <div className="space-y-1">
                    {Object.entries(analyticsData.locations).slice(0, 5).map(([location, count]: [string, any]) => (
                      <div key={location} className="flex justify-between items-center">
                        <p className="text-xs text-gray-300">{location}</p>
                        <p className="text-xs text-gray-400">{count} ({Math.round((count / uniqueOpens) * 100)}%)</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">No location data available</p>
                )}
              </div>
            </div>
          )}
          
          <div className="text-center">
            <a 
              href={`/analytics/${flowId}`} 
              className="inline-flex items-center text-accent-blue hover:text-blue-400"
            >
              <ChartBarIcon className="h-5 w-5 mr-1" />
              View detailed analytics
            </a>
          </div>
        </div>
      )}

      {/* Info section at the bottom */}
      <div className="bg-gray-700/30 rounded-md p-3 text-sm text-gray-300">
        <div className="flex items-start mb-2">
          <InformationCircleIcon className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
          <p className="font-medium">How email tracking works:</p>
        </div>
        <ol className="list-decimal list-inside space-y-2 text-gray-400 ml-7">
          <li>The tracking pixel is a 1x1 transparent GIF image that loads when the email is opened</li>
          <li>The click tracking redirects through our server before sending the user to your actual URL</li>
          <li>Both methods record the event with details about the recipient and email</li>
          <li>Advanced tracking methods increase reliability when standard methods are blocked</li>
          <li>The <code className="bg-gray-700 px-1 rounded">{'{{contactId}}'}</code> placeholder is automatically replaced with the recipient's ID</li>
          <li>Replace <code className="bg-gray-700 px-1 rounded">{'{{YOUR_URL}}'}</code> with your actual destination URL (must be URL encoded)</li>
        </ol>
      </div>
      
      {showAnalytics && (
        <div className="text-center mt-2">
          <a 
            href={`/analytics/${flowId}`} 
            className="inline-flex items-center text-accent-blue hover:text-blue-400"
          >
            <ChartBarIcon className="h-5 w-5 mr-1" />
            View detailed analytics
          </a>
        </div>
      )}
    </div>
  );
};

export default EmailTrackingManager; 