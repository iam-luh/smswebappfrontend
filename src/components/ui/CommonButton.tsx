
import React from "react";
import { Button, ButtonProps } from "./button";
import { cn } from "@/lib/utils";

interface CommonButtonProps extends ButtonProps {
  icon?: React.ReactNode;
  className?: string;
}

export const PrimaryButton: React.FC<CommonButtonProps> = ({
  children,
  icon,
  className,
  ...props
}) => (
  <Button
    className={cn("bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2", className)}
    {...props}
  >
    {icon}
    {children}
  </Button>
);

export const OutlineButton: React.FC<CommonButtonProps> = ({
  children,
  icon,
  className,
  ...props
}) => (
  <Button
    variant="outline"
    className={cn("border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2", className)}
    {...props}
  >
    {icon}
    {children}
  </Button>
);

export const SecondaryButton: React.FC<CommonButtonProps> = ({
  children,
  icon,
  className,
  ...props
}) => (
  <Button
    variant="secondary"
    className={cn("flex items-center gap-2", className)}
    {...props}
  >
    {icon}
    {children}
  </Button>
);
