import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const GlobalStateContext = createContext();

export function GlobalStateProvider({ children }) {
  const [isShutdown, setIsShutdown] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch status from server
  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/status');
      const data = await response.json();
      setIsShutdown(data.isShutdown);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  }, []);

  // Update state on server
  const updateShutdown = useCallback(async (shutdown) => {
    try {
      const response = await fetch('/updateState', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shutdown }),
      });
      const data = await response.json();
      if (data.success) {
        setIsShutdown(data.isShutdown);
      }
    } catch (error) {
      console.error('Error updating state:', error);
    }
  }, []);

  // Poll server every 500ms
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 500);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const value = {
    isShutdown,
    loading,
    updateShutdown,
  };

  return (
    <GlobalStateContext.Provider value={value}>
      {children}
    </GlobalStateContext.Provider>
  );
}

export function useGlobalState() {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }
  return context;
}
