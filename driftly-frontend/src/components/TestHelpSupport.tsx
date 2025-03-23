import React from 'react';

import { Link } from 'react-router-dom';

const TestHelpSupport: React.FC = () => {
  return (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold mb-4">Test Help & Support Link</h1>
      <p className="mb-4">Click the button below to directly access the Help & Support page:</p>
      <Link 
        to="/help-support" 
        className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
      >
        Go to Help & Support
      </Link>
    </div>
  );
};

export default TestHelpSupport; 