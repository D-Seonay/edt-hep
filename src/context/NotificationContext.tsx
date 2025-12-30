// src/context/NotificationContext.tsx
import { createContext, useContext, useState, useEffect, useMemo } from 'react';

interface NotificationContextType {
  showNotifications: boolean;
  toggleNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [showNotifications, setShowNotifications] = useState(() => {
    return localStorage.getItem('showNotifications') !== 'false';
  });

  useEffect(() => {
    localStorage.setItem('showNotifications', JSON.stringify(showNotifications));
  }, [showNotifications]);

  const toggleNotifications = () => {
    setShowNotifications(prev => !prev);
  };

  const value = useMemo(() => ({ showNotifications, toggleNotifications }), [showNotifications]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
