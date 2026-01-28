'use client';

import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [isShutdown, setIsShutdown] = useState(false);

  const checkStatus = async () => {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      setIsShutdown(data.isShutdown);
    } catch (e) {
      console.error('Failed to fetch status');
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 500);
    return () => clearInterval(interval);
  }, []);

  const updateShutdown = async (value: boolean) => {
    await fetch('/api/updateState', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shutdown: value })
    });
    checkStatus();
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: '#1a1a2e',
      color: 'white',
      fontFamily: 'sans-serif'
    }}>
      <h1 style={{ color: '#e94560', marginBottom: '2rem' }}>Admin Panel</h1>

      <div style={{
        fontSize: '1.5rem',
        marginBottom: '2rem',
        padding: '1rem 2rem',
        background: '#16213e',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <span style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: isShutdown ? '#ef4444' : '#4ade80'
        }} />
        Status: <strong>{isShutdown ? 'SHUTDOWN' : 'OPERATIONAL'}</strong>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={() => updateShutdown(true)}
          style={{
            padding: '1rem 2rem',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            background: '#ef4444',
            color: 'white'
          }}
        >
          Activate Error
        </button>

        <button
          onClick={() => updateShutdown(false)}
          style={{
            padding: '1rem 2rem',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            background: '#4ade80',
            color: '#1a1a2e'
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
