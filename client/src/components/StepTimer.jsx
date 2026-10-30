import React, { useState, useEffect, useRef } from 'react';

export default function StepTimer({ seconds, label }) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    setRemaining(seconds);
    setRunning(false);
    setDone(false);
  }, [seconds]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            setDone(true);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const progress = seconds > 0 ? ((seconds - remaining) / seconds) * 100 : 0;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const timeStr = `${mins}:${String(secs).padStart(2, '0')}`;

  const reset = () => {
    setRemaining(seconds);
    setRunning(false);
    setDone(false);
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: done ? 'rgba(104, 211, 145, 0.1)' : 'var(--bg-secondary)',
      border: `1px solid ${done ? 'var(--success)' : 'var(--border)'}`,
      borderRadius: 12, padding: '10px 14px', marginTop: 8,
    }}>
      {/* Circular progress */}
      <div style={{ position: 'relative', width: 44, height: 44, flexShrink: 0 }}>
        <svg viewBox="0 0 44 44" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="22" cy="22" r="18" fill="none" stroke="var(--border)" strokeWidth="3" />
          <circle
            cx="22" cy="22" r="18" fill="none"
            stroke={done ? 'var(--success)' : 'var(--accent-cyan)'}
            strokeWidth="3"
            strokeDasharray={`${2 * Math.PI * 18}`}
            strokeDashoffset={`${2 * Math.PI * 18 * (1 - progress / 100)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: done ? 18 : 9, fontWeight: 700,
          color: done ? 'var(--success)' : 'var(--text-primary)',
        }}>
          {done ? '✓' : timeStr}
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>
          {label || 'Timer'}
        </div>
        {done && (
          <div style={{ fontSize: 13, color: 'var(--success)', fontWeight: 600 }}>
            ✅ Step complete!
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        {!done && (
          <button
            onClick={() => setRunning(r => !r)}
            style={{
              background: running
                ? 'rgba(252,129,129,0.15)'
                : 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))',
              border: running ? '1px solid var(--danger)' : 'none',
              color: running ? 'var(--danger)' : '#fff',
              padding: '6px 14px', borderRadius: 8,
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'Space Grotesk, sans-serif',
            }}
          >
            {running ? '⏸ Pause' : remaining < seconds ? '▶ Resume' : '▶ Start'}
          </button>
        )}
        <button onClick={reset} style={{
          background: 'transparent', border: '1px solid var(--border)',
          color: 'var(--text-muted)', padding: '6px 10px', borderRadius: 8,
          fontSize: 12, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif',
        }}>↺</button>
      </div>
    </div>
  );
}
