import React from 'react';

export default function SpeechBubble({ text, isTyping = false }) {
  return (
    <div style={{ position: 'relative', maxWidth: 400 }}>
      <div className="glass" style={{
        padding: '18px 22px',
        borderRadius: 20,
        borderBottomLeftRadius: 4,
        border: '1px solid var(--border-glow)',
        boxShadow: '0 0 20px var(--accent-glow)',
        fontSize: 15,
        lineHeight: 1.6,
        color: 'var(--text-primary)',
        fontFamily: 'Nunito, sans-serif',
        fontWeight: 600,
        minHeight: 56,
      }}>
        {isTyping ? (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '4px 0' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: '50%',
                background: 'var(--accent-cyan)',
                animation: `bounce 1s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
              }} />
            ))}
          </div>
        ) : text}
      </div>
      {/* Tail */}
      <div style={{
        position: 'absolute', bottom: -1, left: 16,
        width: 0, height: 0,
        borderLeft: '12px solid transparent',
        borderRight: '0px solid transparent',
        borderTop: '16px solid var(--border-glow)',
      }} />
      <div style={{
        position: 'absolute', bottom: 2, left: 17,
        width: 0, height: 0,
        borderLeft: '10px solid transparent',
        borderRight: '0px solid transparent',
        borderTop: '14px solid var(--bg-glass)',
      }} />
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
