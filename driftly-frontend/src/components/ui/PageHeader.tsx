import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  rightContent?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  action,
  rightContent,
}) => {
  return (
    <div className="md:flex md:items-center md:justify-between">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl sm:tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-gray-400 max-w-2xl">
            {description}
          </p>
        )}
      </div>
      <div className="mt-4 flex items-center md:mt-0 md:ml-4">
        {rightContent}
        {action && (
          <div className={`flex ${rightContent ? 'ml-4' : ''}`}>
            {action}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader; 