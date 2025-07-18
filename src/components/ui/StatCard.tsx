
import React from "react";

interface StatCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-2">
        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-md">
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${
            trend.isPositive 
              ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" 
              : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
          }`}>
            {trend.isPositive ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                <polyline points="16 7 22 7 22 13"></polyline>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline>
                <polyline points="16 17 22 17 22 11"></polyline>
              </svg>
            )}
            {trend.value}%
          </div>
        )}
      </div>
      <div className="mt-2">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
