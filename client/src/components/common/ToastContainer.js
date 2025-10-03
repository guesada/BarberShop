import React from 'react';
import { Toaster } from 'react-hot-toast';
import { useAppSelector } from '../../store';
import { selectEffectiveTheme } from '../../store/slices/uiSlice';

const ToastContainer = () => {
  const theme = useAppSelector(selectEffectiveTheme);
  
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{
        top: 20,
        right: 20,
      }}
      toastOptions={{
        // Default options for all toasts
        duration: 4000,
        style: {
          background: theme === 'dark' ? '#3A322A' : '#FFFFFF',
          color: theme === 'dark' ? '#FFFFFF' : '#2D2720',
          border: `1px solid ${theme === 'dark' ? '#483E34' : '#E0E0E0'}`,
          borderRadius: '12px',
          fontSize: '14px',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          fontWeight: '500',
          padding: '16px',
          boxShadow: theme === 'dark' 
            ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)'
            : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          maxWidth: '400px',
          minWidth: '280px',
        },
        
        // Success toasts
        success: {
          duration: 3000,
          style: {
            background: theme === 'dark' ? '#1B5E20' : '#E8F5E9',
            color: theme === 'dark' ? '#C8E6C9' : '#2E7D32',
            border: `1px solid ${theme === 'dark' ? '#2E7D32' : '#A5D6A7'}`,
          },
          iconTheme: {
            primary: '#4CAF50',
            secondary: theme === 'dark' ? '#1B5E20' : '#E8F5E9',
          },
        },
        
        // Error toasts
        error: {
          duration: 5000,
          style: {
            background: theme === 'dark' ? '#B71C1C' : '#FFEBEE',
            color: theme === 'dark' ? '#FFCDD2' : '#C62828',
            border: `1px solid ${theme === 'dark' ? '#C62828' : '#EF9A9A'}`,
          },
          iconTheme: {
            primary: '#F44336',
            secondary: theme === 'dark' ? '#B71C1C' : '#FFEBEE',
          },
        },
        
        // Loading toasts
        loading: {
          duration: Infinity,
          style: {
            background: theme === 'dark' ? '#1A237E' : '#E3F2FD',
            color: theme === 'dark' ? '#BBDEFB' : '#1565C0',
            border: `1px solid ${theme === 'dark' ? '#1565C0' : '#90CAF9'}`,
          },
          iconTheme: {
            primary: '#2196F3',
            secondary: theme === 'dark' ? '#1A237E' : '#E3F2FD',
          },
        },
        
        // Custom toast types
        blank: {
          style: {
            background: theme === 'dark' ? '#FF6B35' : '#FFF3E0',
            color: theme === 'dark' ? '#FFFFFF' : '#E65100',
            border: `1px solid ${theme === 'dark' ? '#FF5722' : '#FFCC80'}`,
          },
        },
      }}
    />
  );
};

export default ToastContainer;
