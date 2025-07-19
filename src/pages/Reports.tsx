
import React from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  BarChart3,
  LineChart,
  TrendingUp
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const Reports: React.FC = () => {
  const { t } = useLanguage();
  
  const reportCards = [
    {
      title: t("reports.dailySales") ,
      description: t("reports.dailySalesDesc"),
      icon: <Calendar className="w-8 h-8 text-blue-500" />,
      link: "/reports/daily-sales",
    },
    {
      title: t("reports.monthlySales"),
      description: t("reports.monthlySalesDesc"),
      icon: <BarChart3 className="w-8 h-8 text-green-500" />,
      link: "/reports/monthly-sales",
    },
    {
      title: t("reports.yearlySales") ,
      description: t("reports.yearlySalesDesc"),
      icon: <LineChart className="w-8 h-8 text-purple-500" />,
      link: "/reports/annual-sales",
    },
    {
      title: t("reports.dailyStock"),
      description: t("reports.dailyStockDesc"),
      icon: <Calendar className="w-8 h-8 text-orange-500" />,
      link: "/reports/daily-stock",
    },
    {
      title: t("reports.monthlyStock") ,
      description: t("reports.monthlyStockDesc"),
      icon: <BarChart3 className="w-8 h-8 text-red-500" />,
      link: "/reports/monthly-stock",
    },
    {
      title: t("reports.yearlyStock") ,
      description: t("reports.yearlyStockDesc"),
      icon: <TrendingUp className="w-8 h-8 text-yellow-500" />,
      link: "/reports/annual-stock",
    }
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("reports.title")}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              View and export various reports for your inventory management
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportCards.map((card, index) => (
            <Link
              to={card.link}
              key={index}
              className="block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all duration-200"
            >
              <div className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                    {card.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                      {card.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {card.description}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;
