import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 50, padding: '6px 14px', cursor: 'pointer',
        transition: 'none', color: 'var(--text-secondary)',
        fontSize: 13, fontWeight: 600, fontFamily: 'Space Grotesk, sans-serif',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-blue)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <div style={{
        width: 36, height: 20, background: isDark
          ? 'linear-gradient(135deg, #1a3a5c, #2d6a9f)'
          : 'linear-gradient(135deg, #63b3ed, #76e4f7)',
        borderRadius: 10, position: 'relative',
        boxShadow: isDark ? '0 0 8px rgba(99,179,237,0.4)' : '0 0 8px rgba(118,228,247,0.6)',
      }}>
        <div style={{
          position: 'absolute', top: 3, width: 14, height: 14,
          borderRadius: '50%',
          left: isDark ? 3 : 19,
          background: isDark ? '#63b3ed' : '#fff',
          boxShadow: isDark ? '0 0 6px #63b3ed' : '0 2px 4px rgba(0,0,0,0.15)',
        }} />
      </div>
      <span>{isDark ? '🌙 Dark' : '☀️ Light'}</span>
    </button>
  );
}
