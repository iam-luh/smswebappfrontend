import React from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "./context-menu";
import { Edit, Trash2, Trash } from "lucide-react";

interface ActionContextMenuProps {
  children: React.ReactNode;
  onEdit?: () => void;
  onDelete: () => void;
  onBulkDelete?: () => void;
  editLabel?: string;
  deleteLabel?: string;
  bulkDeleteLabel?: string;
  hideEdit?: boolean;
  showBulkDelete?: boolean;
}

const EnhancedActionContextMenu: React.FC<ActionContextMenuProps> = ({
  children,
  onEdit,
  onDelete,
  onBulkDelete,
  editLabel = "Edit",
  deleteLabel = "Delete",
  bulkDeleteLabel = "Delete All Variants",
  hideEdit = false,
  showBulkDelete = false
}) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-lg z-50">
        {!hideEdit && onEdit && (
          <>
            <ContextMenuItem 
              onClick={onEdit}
              className="flex items-center gap-2 cursor-pointer px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Edit className="h-4 w-4" />
              {editLabel}
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}
        
        <ContextMenuItem 
          onClick={onDelete}
          className="flex items-center gap-2 cursor-pointer px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <Trash2 className="h-4 w-4" />
          {deleteLabel}
        </ContextMenuItem>
        
        {showBulkDelete && onBulkDelete && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem 
              onClick={onBulkDelete}
              className="flex items-center gap-2 cursor-pointer px-3 py-2 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-800/20"
            >
              <Trash className="h-4 w-4" />
              {bulkDeleteLabel}
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default EnhancedActionContextMenu;
