
import React from "react";
import { Link } from "react-router-dom";
import { PrimaryButton } from "../components/ui/CommonButton";

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-400 dark:text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M16 16s-1.5-2-4-2-4 2-4 2"></path>
          <line x1="9" y1="9" x2="9.01" y2="9"></line>
          <line x1="15" y1="9" x2="15.01" y2="9"></line>
        </svg>
      </div>
      <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-6">Page Not Found</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <PrimaryButton asChild>
        <Link to="/">
          Return to Dashboard
        </Link>
      </PrimaryButton>
    </div>
  );
};

export default NotFound;
