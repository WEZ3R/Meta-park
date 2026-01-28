import React from 'react';
import { useGlobalState } from './GlobalState';

const styles = {
  container: {
    textAlign: 'center',
    padding: '2rem',
  },
  statusOk: {
    fontSize: '3rem',
    color: '#4ade80',
    fontWeight: 'bold',
    padding: '3rem',
    background: 'rgba(74, 222, 128, 0.1)',
    borderRadius: '16px',
    border: '3px solid #4ade80',
    animation: 'pulse-green 2s infinite',
  },
  statusError: {
    fontSize: '3rem',
    color: '#ef4444',
    fontWeight: 'bold',
    padding: '3rem',
    background: 'rgba(239, 68, 68, 0.2)',
    borderRadius: '16px',
    border: '3px solid #ef4444',
    animation: 'blink 0.5s infinite',
  },
  loading: {
    fontSize: '2rem',
    color: '#888',
  },
  indicator: {
    marginTop: '2rem',
    fontSize: '1rem',
    color: '#666',
  },
};

// Add CSS animation via style tag
const AnimationStyles = () => (
  <style>{`
    @keyframes blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0.3; }
    }
    @keyframes pulse-green {
      0%, 100% { box-shadow: 0 0 20px rgba(74, 222, 128, 0.3); }
      50% { box-shadow: 0 0 40px rgba(74, 222, 128, 0.6); }
    }
  `}</style>
);

function Screen() {
  const { isShutdown, loading } = useGlobalState();

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={styles.loading}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <AnimationStyles />
      {isShutdown ? (
        <div style={styles.statusError}>
          SYSTEM ERROR
        </div>
      ) : (
        <div style={styles.statusOk}>
          Everything is fine
        </div>
      )}
      <p style={styles.indicator}>
        Status: {isShutdown ? 'SHUTDOWN' : 'OPERATIONAL'} | Polling every 500ms
      </p>
    </div>
  );
}

export default Screen;
