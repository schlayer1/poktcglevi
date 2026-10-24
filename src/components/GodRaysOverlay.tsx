import React from 'react';

interface GodRaysOverlayProps {
  variant?: 'rainbow' | 'victory' | 'gold';
  className?: string;
  showShockwave?: boolean;
}

export const GodRaysOverlay: React.FC<GodRaysOverlayProps> = ({
  variant = 'rainbow',
  className = '',
  showShockwave = true
}) => {
  // SVG Ray generator: 16 symmetric conical ray blades
  const rays = Array.from({ length: 16 }).map((_, i) => {
    const angle = (i * 360) / 16;
    return (
      <path
        key={i}
        d="M 500 500 L 450 0 L 550 0 Z"
        transform={`rotate(${angle} 500 500)`}
        className={
          variant === 'rainbow'
            ? i % 4 === 0
              ? 'fill-amber-300/40'
              : i % 4 === 1
              ? 'fill-cyan-300/35'
              : i % 4 === 2
              ? 'fill-fuchsia-400/35'
              : 'fill-emerald-300/35'
            : variant === 'victory'
            ? i % 2 === 0
              ? 'fill-amber-300/45'
              : 'fill-yellow-400/25'
            : 'fill-amber-300/30'
        }
      />
    );
  });

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-40 flex items-center justify-center overflow-hidden select-none ${className}`}
    >
      {/* 1. Backdrop Dim with Radial Warmth */}
      <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[3px] transition-opacity duration-700" />

      {/* 2. Expanding Light Shockwave on Entry */}
      {showShockwave && (
        <div className="absolute w-[90vmin] h-[90vmin] rounded-full border-4 sm:border-8 border-amber-300/70 shadow-[0_0_80px_rgba(251,191,36,0.9)] animate-[ping_1.8s_cubic-bezier(0,0,0.2,1)_infinite]" />
      )}

      {/* 3. Primary Rotating Golden Sunburst (Clockwise) */}
      <div className="absolute w-[160vmax] h-[160vmax] flex items-center justify-center animate-[spin_24s_linear_infinite] opacity-80 mix-blend-screen">
        <svg viewBox="0 0 1000 1000" className="w-full h-full">
          <defs>
            <radialGradient id="sunburstGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="25%" stopColor="#fbbf24" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>
          {rays}
        </svg>
      </div>

      {/* 4. Secondary Counter-Rotating Prismatic Rays (Counter-Clockwise) */}
      <div className="absolute w-[140vmax] h-[140vmax] flex items-center justify-center animate-[spin_32s_linear_infinite_reverse] opacity-55 mix-blend-screen">
        <svg viewBox="0 0 1000 1000" className="w-full h-full">
          {rays}
        </svg>
      </div>

      {/* 5. Center Golden Core Flare & Corona */}
      <div
        className="absolute w-[45vmin] h-[45vmin] rounded-full blur-2xl opacity-90 animate-pulse pointer-events-none"
        style={{
          background:
            variant === 'rainbow'
              ? 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(251,191,36,0.9) 35%, rgba(139,92,246,0.5) 70%, transparent 100%)'
              : 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(251,191,36,0.9) 45%, rgba(245,158,11,0.4) 75%, transparent 100%)'
        }}
      />

      {/* 6. Floating Sparkling Star Particles */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[
          { top: '22%', left: '28%', delay: '0s', size: 'w-7 h-7' },
          { top: '30%', left: '72%', delay: '0.4s', size: 'w-9 h-9' },
          { top: '65%', left: '20%', delay: '0.8s', size: 'w-8 h-8' },
          { top: '70%', left: '78%', delay: '1.2s', size: 'w-10 h-10' },
          { top: '15%', left: '50%', delay: '0.6s', size: 'w-6 h-6' },
          { top: '80%', left: '48%', delay: '1.0s', size: 'w-7 h-7' }
        ].map((star, sIdx) => (
          <div
            key={sIdx}
            style={{
              top: star.top,
              left: star.left,
              animationDelay: star.delay
            }}
            className={`absolute ${star.size} text-amber-200 drop-shadow-[0_0_15px_#fbbf24] animate-bounce`}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full animate-spin">
              <path d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z" />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
};
