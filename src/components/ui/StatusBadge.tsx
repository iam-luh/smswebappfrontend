
import React from "react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "Active" | "Inactive" | string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const isActive = status === "Active";
  
  return (
    <span 
      className={cn(
        "px-3 py-1 rounded-full text-xs font-medium inline-block",
        isActive 
          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        className
      )}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
