import React from 'react';
import { Toaster } from 'sonner';
import { useTheme } from '../../context/ThemeContext';

const CustomToaster: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Toaster
      position="top-right"
      richColors
      theme={theme}
      duration={4000}
      closeButton
      toastOptions={{
        style: {
          background: 'hsl(var(--card))',
          color: 'hsl(var(--card-foreground))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '0.75rem',
        },
        className: 'sonner-toast',
      }}
    />
  );
};

export default CustomToaster;
