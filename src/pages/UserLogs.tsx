
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, User, Calendar, Activity } from "lucide-react";
import { userLogService, UserLog } from "../services/userLogService";
import { toast } from "sonner";
import DataPagination from "../components/common/DataPagination";
import { formatDate } from "../utils/dateUtils";

const UserLogs: React.FC = () => {
  const [logs, setLogs] = useState<UserLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<UserLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 10;

  const actionTypes = ["Login", "Logout", "Create", "Update", "Delete", "View"];

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, searchQuery, selectedAction]);

  const fetchLogs = async () => {
    try {
      const data = (await userLogService.getAllLogs()).reverse();
      setLogs(data);
      toast.success("User logs loaded successfully");
    } catch (error) {
      toast.error("Failed to load user logs");
      console.error("Error fetching logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = logs;

    if (searchQuery) {
      filtered = filtered.filter(log =>
        log.action?.toLowerCase?.().includes(searchQuery?.toLowerCase?.()) ||
        log.details?.toLowerCase?.().includes(searchQuery?.toLowerCase?.()) ||
        log.userId?.toString?.().includes(searchQuery)
      );
    }

    if (selectedAction) {
      filtered = filtered.filter(log => log.action === selectedAction);
    }

    setFilteredLogs(filtered);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getActionBadgeColor = (action: string) => {
    switch (action?.toLowerCase?.()) {
      case 'login':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'logout':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'create':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'update':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'delete':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading user logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link to="/settings" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Activity Logs</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Monitor user activities and system events</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Search Input */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Logs
            </label>
            <input
              type="text"
              placeholder="Search by action, details, or user ID..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Action Filter */}
          <div className="min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Action
            </label>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Actions</option>
              {actionTypes.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>

          {/* Reset Button */}
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedAction('');
            }}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedLogs.map((log) => (
                <tr key={log.logId} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {log.userId}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionBadgeColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {log.details || 'No details available'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {log.ipAddress || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-300">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(log.actionTime)}
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    {filteredLogs.length === 0 ? 'No logs found' : 'No logs match your filters'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredLogs.length > 0 && totalPages > 1 && (
          <div className="px-6 py-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-center">
              <DataPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
              Showing {Math.min(filteredLogs.length, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(filteredLogs.length, currentPage * itemsPerPage)} of {filteredLogs.length} entries
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserLogs;
