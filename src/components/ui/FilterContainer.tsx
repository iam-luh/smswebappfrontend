
import React, { ReactNode } from "react";

interface FilterContainerProps {
  children: ReactNode;
  className?: string;
}

const FilterContainer: React.FC<FilterContainerProps> = ({ children, className }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow p-4 mb-6 ${className}`}>
      <div className="flex flex-wrap gap-4 items-end">
        {children}
      </div>
    </div>
  );
};

export default FilterContainer;
