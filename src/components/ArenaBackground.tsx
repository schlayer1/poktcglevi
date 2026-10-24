import React from 'react';

export type ArenaType =
  | 'rocko'
  | 'misty'
  | 'majorbob'
  | 'erika'
  | 'koga'
  | 'sabrina'
  | 'pyro'
  | 'giovanni'
  | 'gary'
  | 'papa'
  | 'stadium';

interface ArenaBackgroundProps {
  arena: ArenaType;
  className?: string;
}

export const ArenaBackground: React.FC<ArenaBackgroundProps> = ({
  arena,
  className = ''
}) => {
  // Normalize arena key
  const arenaKey: ArenaType = arena || 'rocko';
  const imageSrc = `/images/arenas/${arenaKey}.jpg`;

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}>
      {/* 1. High-Resolution Anime Stadium Backdrop */}
      <img
        src={imageSrc}
        alt={`${arenaKey} Arena`}
        className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.08] transition-all duration-700"
      />

      {/* 2. Cinematic Vignette & Readability Gradient (Darkens Top Header & Bottom Cards) */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-transparent to-slate-950/90 pointer-events-none" />
      <div className="absolute inset-0 bg-radial from-transparent via-black/20 to-black/70 pointer-events-none" />

      {/* 3. Thematic Arena Lighting & Atmosphere Overlays */}
      {arenaKey === 'rocko' && (
        <>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl" />
        </>
      )}

      {arenaKey === 'misty' && (
        <>
          <div className="absolute inset-0 bg-cyan-500/10 mix-blend-overlay" />
          <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-sky-500/20 to-transparent blur-xl" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-cyan-400/15 rounded-full blur-3xl animate-pulse" />
        </>
      )}

      {arenaKey === 'majorbob' && (
        <>
          <div className="absolute top-10 left-10 w-72 h-72 bg-yellow-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-10 right-10 w-72 h-72 bg-amber-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute inset-0 bg-yellow-500/5 mix-blend-color-dodge" />
        </>
      )}

      {arenaKey === 'erika' && (
        <>
          <div className="absolute inset-0 bg-emerald-500/10 mix-blend-soft-light" />
          <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-lime-400/15 to-transparent blur-2xl" />
        </>
      )}

      {arenaKey === 'koga' && (
        <>
          <div className="absolute inset-0 bg-purple-900/15 mix-blend-overlay" />
          <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-purple-600/15 to-transparent blur-2xl" />
        </>
      )}

      {arenaKey === 'sabrina' && (
        <>
          <div className="absolute inset-0 bg-fuchsia-950/20 mix-blend-color-dodge" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        </>
      )}

      {arenaKey === 'pyro' && (
        <>
          <div className="absolute bottom-0 inset-x-0 h-56 bg-gradient-to-t from-rose-600/25 via-orange-500/15 to-transparent blur-2xl" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-orange-500/15 rounded-full blur-3xl animate-pulse" />
        </>
      )}

      {arenaKey === 'giovanni' && (
        <>
          <div className="absolute inset-0 bg-amber-950/15 mix-blend-multiply" />
          <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-amber-400/15 to-transparent blur-3xl" />
        </>
      )}

      {(arenaKey === 'gary' || arenaKey === 'stadium') && (
        <>
          <div className="absolute top-0 inset-x-0 h-56 bg-gradient-to-b from-indigo-500/20 via-sky-500/10 to-transparent blur-3xl" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-amber-400/10 rounded-full blur-3xl animate-pulse" />
        </>
      )}

      {arenaKey === 'papa' && (
        <>
          <div className="absolute inset-0 bg-amber-950/15 mix-blend-soft-light" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-amber-400/10 rounded-full blur-3xl" />
        </>
      )}

      {/* 4. Subtle 3D Depth Floor Glow Ring (accentuates center battleground without clutter) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
        <div className="w-[75vw] max-w-[950px] h-[42vh] max-h-[380px] rounded-[50%] border-2 border-amber-300/40 shadow-[0_0_60px_rgba(251,191,36,0.2)]" />
      </div>
    </div>
  );
};
