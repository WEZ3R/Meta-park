import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Screen from './Screen';
import AdminPanel from './AdminPanel';

const styles = {
  app: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  nav: {
    background: '#16213e',
    padding: '1rem 2rem',
    display: 'flex',
    gap: '2rem',
    borderBottom: '2px solid #0f3460',
  },
  link: {
    color: '#e94560',
    textDecoration: 'none',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    transition: 'background 0.2s',
  },
  content: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
};

function App() {
  return (
    <div style={styles.app}>
      <nav style={styles.nav}>
        <Link
          to="/"
          style={styles.link}
          onMouseOver={(e) => e.target.style.background = '#0f3460'}
          onMouseOut={(e) => e.target.style.background = 'transparent'}
        >
          Status Screen
        </Link>
        <Link
          to="/admin"
          style={styles.link}
          onMouseOver={(e) => e.target.style.background = '#0f3460'}
          onMouseOut={(e) => e.target.style.background = 'transparent'}
        >
          Admin Panel
        </Link>
      </nav>
      <div style={styles.content}>
        <Routes>
          <Route path="/" element={<Screen />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
