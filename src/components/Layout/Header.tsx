
import React from "react";
import NotificationsDropdown from "../ui/NotificationsDropdown";
import UserProfileDropdown from "../ui/UserProfileDropdown";

const Header: React.FC = () => {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            My Inventory
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <NotificationsDropdown />
          <UserProfileDropdown />
        </div>
      </div>
    </header>
  );
};

export default Header;
