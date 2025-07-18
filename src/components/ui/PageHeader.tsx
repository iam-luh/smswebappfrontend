
import React, { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  description, 
  children 
}) => {
  return (
    <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
        {description && (
          <p className="text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-3">
          {children}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
