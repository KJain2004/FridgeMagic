import React, { useMemo } from 'react';

export default function StarsBg() {
  const stars = useMemo(() => Array.from({ length: 60 }, (_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1,
    dur: `${Math.random() * 4 + 3}s`,
    delay: `${Math.random() * 5}s`,
  })), []);

  return (
    <div className="stars-bg">
      {stars.map(s => (
        <div key={s.id} className="star" style={{
          top: s.top, left: s.left,
          width: s.size, height: s.size,
          '--dur': s.dur, '--delay': s.delay,
        }} />
      ))}
    </div>
  );
}
