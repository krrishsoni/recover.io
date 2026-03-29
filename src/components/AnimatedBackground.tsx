import React from 'react';

// Generates star positions deterministically
const STARS = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  top: `${(i * 17 + 7) % 100}%`,
  left: `${(i * 23 + 13) % 100}%`,
  dur: `${2.5 + (i % 5) * 0.8}s`,
  delay: `${(i % 7) * 0.5}s`,
  size: i % 5 === 0 ? 3 : 2,
}));

export const AnimatedBackground: React.FC = () => (
  <div className="animated-bg">
    <div className="orb orb-purple" />
    <div className="orb orb-pink" />
    <div className="orb orb-teal" />
    <div className="orb orb-blue" />
    {STARS.map(s => (
      <div
        key={s.id}
        className="star"
        style={{
          top: s.top,
          left: s.left,
          width: s.size,
          height: s.size,
          '--dur': s.dur,
          '--delay': s.delay,
        } as React.CSSProperties}
      />
    ))}
  </div>
);
