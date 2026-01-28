'use client';

import { useState, useEffect } from 'react';

export default function PageA() {
  const [isShutdown, setIsShutdown] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/status');
        const data = await res.json();
        setIsShutdown(data.isShutdown);
      } catch (e) {
        console.error('Failed to fetch status');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 500);
    return () => clearInterval(interval);
  }, []);

  if (isShutdown) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '4rem',
        fontWeight: 'bold',
        background: '#000',
        color: '#ef4444',
        animation: 'blink 0.5s infinite'
      }}>
        <style>{`@keyframes blink { 0%, 50% { opacity: 1 } 51%, 100% { opacity: 0.3 } }`}</style>
        SYSTEM ERROR
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: '#000'
    }}>
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      >
        <source src="/camera-1.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
