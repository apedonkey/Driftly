import React, { useState } from 'react';

import { trackingService } from '../services/api';

interface TrackingPixelManagerProps {
  flowId: string;
  stepId: string;
  onInsertPixel: (trackingPixelHtml: string) => void;
  onInsertLink: (link: string) => void;
}

const TrackingPixelManager: React.FC<TrackingPixelManagerProps> = ({
  flowId,
  stepId,
  onInsertPixel,
  onInsertLink
}) => {
  const [trackingCode, setTrackingCode] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [originalUrl, setOriginalUrl] = useState<string>('https://example.com');
  
  // Fetch tracking code
  const fetchTrackingCode = async () => {
    setLoading(true);
    try {
      const response = await trackingService.generateTrackingCode(flowId, stepId);
      if (response && response.success) {
        setTrackingCode(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch tracking code:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // When component mounts, fetch tracking code
  React.useEffect(() => {
    fetchTrackingCode();
  }, [flowId, stepId]);
  
  // Create tracked link
  const createTrackedLink = () => {
    if (!trackingCode) return;
    
    // Replace the {{YOUR_URL}} placeholder with the actual URL
    const trackedLink = trackingCode.clickTrackingTemplate.replace('{{YOUR_URL}}', encodeURIComponent(originalUrl));
    
    onInsertLink(trackedLink);
  };
  
  return (
    <div className="bg-secondary-bg rounded-md p-4 mt-4">
      <h3 className="text-lg font-medium text-white mb-2">Email Tracking</h3>
      <p className="text-sm text-gray-400 mb-4">
        Add tracking elements to your email to monitor opens and clicks
      </p>
      
      {/* Open Tracking Pixel */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-white mb-1">Email Open Tracking</h4>
        <p className="text-xs text-gray-400 mb-2">
          Add an invisible tracking pixel to your email to track when recipients open it
        </p>
        <button
          onClick={() => trackingCode && onInsertPixel(trackingCode.trackingPixelHtml)}
          disabled={loading || !trackingCode}
          className="w-full px-3 py-2 text-sm text-white bg-accent-blue rounded hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Insert Tracking Pixel'}
        </button>
      </div>
      
      {/* Click Tracking */}
      <div>
        <h4 className="text-sm font-medium text-white mb-1">Link Click Tracking</h4>
        <p className="text-xs text-gray-400 mb-2">
          Create tracked links to monitor when recipients click on links in your email
        </p>
        <div className="mb-2">
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Original URL
          </label>
          <input
            type="text"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            className="block w-full px-2 py-1 text-sm border border-gray-700 bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-accent-blue focus:border-accent-blue text-white"
            placeholder="Enter URL to track"
          />
        </div>
        <button
          onClick={createTrackedLink}
          disabled={loading || !trackingCode || !originalUrl}
          className="w-full px-3 py-2 text-sm text-white bg-accent-blue rounded hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Create Tracked Link'}
        </button>
      </div>
    </div>
  );
};

export default TrackingPixelManager; 