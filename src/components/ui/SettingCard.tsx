
import React from "react";
import { Link } from "react-router-dom";

interface SettingCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
}

const SettingCard: React.FC<SettingCardProps> = ({ title, description, icon, to }) => {
  return (
    <Link 
      to={to} 
      className="block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-start space-x-4">
        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        </div>
      </div>
    </Link>
  );
};

export default SettingCard;
