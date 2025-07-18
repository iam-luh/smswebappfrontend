
import React from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./context-menu";
import { Edit, Trash2 } from "lucide-react";

interface ActionContextMenuProps {
  children: React.ReactNode;
  onEdit?: () => void;
  onDelete: () => void;
  editLabel?: string;
  deleteLabel?: string;
  hideEdit?: boolean;
}

const ActionContextMenu: React.FC<ActionContextMenuProps> = ({
  children,
  onEdit,
  onDelete,
  editLabel = "Edit",
  deleteLabel = "Delete",
  hideEdit = false
}) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-lg z-50">
        {!hideEdit && onEdit && (
          <ContextMenuItem 
            onClick={onEdit}
            className="flex items-center gap-2 cursor-pointer px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Edit className="h-4 w-4" />
            {editLabel}
          </ContextMenuItem>
        )}
        <ContextMenuItem 
          onClick={onDelete}
          className="flex items-center gap-2 cursor-pointer px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <Trash2 className="h-4 w-4" />
          {deleteLabel}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default ActionContextMenu;
