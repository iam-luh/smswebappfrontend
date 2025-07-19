
import React from "react";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="max-w-lg w-full rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm">
        <div className="p-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Welcome to Your Inventory Management System</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">Manage your inventory efficiently with our powerful tools</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a 
                href="/dashboard" 
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
              >
                Go to Dashboard
              </a>
              <a 
                href="/settings" 
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                Configure Settings
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
