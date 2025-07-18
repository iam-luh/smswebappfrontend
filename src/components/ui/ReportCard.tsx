
import React from "react";
import { Link } from "react-router-dom";

interface ReportCardProps {
  title: string;
  description: string;
  to: string;
  icon: React.ReactNode;
}

const ReportCard: React.FC<ReportCardProps> = ({ title, description, to, icon }) => {
  return (
    <Link 
      to={to} 
      className="block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:bg-secondary/30 transition-colors"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-primary/10 p-2 rounded-lg">
          {icon}
        </div>
        <h3 className="text-lg font-medium">{title}</h3>
      </div>
      <p className="text-gray-500 dark:text-gray-400">{description}</p>
    </Link>
  );
};

export default ReportCard;
