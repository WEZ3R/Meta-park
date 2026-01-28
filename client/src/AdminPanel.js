import React from 'react';
import { useGlobalState } from './GlobalState';

const styles = {
  container: {
    textAlign: 'center',
    padding: '2rem',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '2rem',
    color: '#e94560',
  },
  status: {
    fontSize: '1.2rem',
    marginBottom: '2rem',
    padding: '1rem',
    background: '#16213e',
    borderRadius: '8px',
  },
  buttonContainer: {
    display: 'flex',
    gap: '1.5rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  buttonError: {
    padding: '1rem 2rem',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    background: '#ef4444',
    color: 'white',
    transition: 'transform 0.1s, box-shadow 0.2s',
    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
  },
  buttonReset: {
    padding: '1rem 2rem',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    background: '#4ade80',
    color: '#1a1a2e',
    transition: 'transform 0.1s, box-shadow 0.2s',
    boxShadow: '0 4px 15px rgba(74, 222, 128, 0.4)',
  },
  statusIndicator: {
    display: 'inline-block',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    marginRight: '10px',
  },
};

function AdminPanel() {
  const { isShutdown, updateShutdown } = useGlobalState();

  const handleActivateError = () => {
    updateShutdown(true);
  };

  const handleReset = () => {
    updateShutdown(false);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Admin Panel</h1>

      <div style={styles.status}>
        <span
          style={{
            ...styles.statusIndicator,
            background: isShutdown ? '#ef4444' : '#4ade80',
          }}
        />
        Current Status: <strong>{isShutdown ? 'SHUTDOWN' : 'OPERATIONAL'}</strong>
      </div>

      <div style={styles.buttonContainer}>
        <button
          style={styles.buttonError}
          onClick={handleActivateError}
          onMouseOver={(e) => {
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'scale(1)';
          }}
        >
          Activate Error
        </button>

        <button
          style={styles.buttonReset}
          onClick={handleReset}
          onMouseOver={(e) => {
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'scale(1)';
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export default AdminPanel;
