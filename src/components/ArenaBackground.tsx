import React from 'react';

export type ArenaType = 'rocko' | 'misty' | 'majorbob' | 'erika' | 'gary' | 'papa' | 'stadium';

interface ArenaBackgroundProps {
  arena: ArenaType;
  className?: string;
}

export const ArenaBackground: React.FC<ArenaBackgroundProps> = ({
  arena,
  className = ''
}) => {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}>
      {/* 1. ROCKO (Rock / Cave Stadium) */}
      {arena === 'rocko' && (
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-amber-950/60 to-stone-900">
          {/* Rocky canyon silhouettes */}
          <svg className="absolute inset-0 w-full h-full opacity-40" preserveAspectRatio="none" viewBox="0 0 1000 600">
            <polygon points="0,0 250,0 180,260 80,320 0,280" fill="#292524" />
            <polygon points="1000,0 750,0 820,260 920,320 1000,280" fill="#292524" />
            <polygon points="0,600 300,600 200,480 0,520" fill="#1c1917" />
            <polygon points="1000,600 700,600 800,480 1000,520" fill="#1c1917" />
            {/* Glowing amber crystal veins */}
            <line x1="120" y1="100" x2="160" y2="240" stroke="#f59e0b" strokeWidth="3" filter="drop-shadow(0 0 8px #f59e0b)" />
            <line x1="880" y1="120" x2="840" y2="220" stroke="#f59e0b" strokeWidth="3" filter="drop-shadow(0 0 8px #f59e0b)" />
          </svg>
          {/* Stadium floodlights */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
        </div>
      )}

      {/* 2. MISTY (Cerulean Water Pool Gym) */}
      {arena === 'misty' && (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-sky-950/70 to-blue-950">
          {/* Water tiles and ripples */}
          <svg className="absolute inset-0 w-full h-full opacity-35" preserveAspectRatio="none" viewBox="0 0 1000 600">
            <defs>
              <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0369a1" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="1000" height="600" fill="url(#waterGrad)" />
            {/* Floating pool lane markers */}
            <line x1="200" y1="0" x2="200" y2="600" stroke="#38bdf8" strokeWidth="2" strokeDasharray="12,12" opacity="0.4" />
            <line x1="800" y1="0" x2="800" y2="600" stroke="#38bdf8" strokeWidth="2" strokeDasharray="12,12" opacity="0.4" />
            {/* Shimmering pool light caustics */}
            <circle cx="350" cy="200" r="140" fill="#38bdf8" opacity="0.15" filter="blur(40px)" />
            <circle cx="650" cy="400" r="160" fill="#06b6d4" opacity="0.15" filter="blur(50px)" />
          </svg>
          <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-cyan-500/10 to-transparent blur-xl" />
        </div>
      )}

      {/* 3. MAJOR BOB (Electric Stadium) */}
      {arena === 'majorbob' && (
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-yellow-950/50 to-neutral-900">
          <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none" viewBox="0 0 1000 600">
            {/* Industrial hazard stripes & metal girders */}
            <line x1="0" y1="50" x2="1000" y2="50" stroke="#eab308" strokeWidth="4" strokeDasharray="20,20" />
            <line x1="0" y1="550" x2="1000" y2="550" stroke="#eab308" strokeWidth="4" strokeDasharray="20,20" />
            {/* Electric coils */}
            <circle cx="100" cy="300" r="70" stroke="#facc15" strokeWidth="3" fill="none" opacity="0.5" />
            <circle cx="900" cy="300" r="70" stroke="#facc15" strokeWidth="3" fill="none" opacity="0.5" />
          </svg>
          <div className="absolute top-10 left-10 w-72 h-72 bg-yellow-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-10 right-10 w-72 h-72 bg-amber-400/20 rounded-full blur-3xl animate-pulse" />
        </div>
      )}

      {/* 4. ERIKA (Floral Botanical Greenhouse) */}
      {arena === 'erika' && (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-emerald-950/60 to-green-950">
          <svg className="absolute inset-0 w-full h-full opacity-35" preserveAspectRatio="none" viewBox="0 0 1000 600">
            {/* Greenhouse glass dome arches */}
            <path d="M 100,0 Q 500,200 900,0" stroke="#4ade80" strokeWidth="2" fill="none" opacity="0.4" />
            <path d="M 200,0 Q 500,300 800,0" stroke="#4ade80" strokeWidth="2" fill="none" opacity="0.4" />
            {/* Floral accents */}
            <circle cx="200" cy="480" r="60" fill="#10b981" opacity="0.2" filter="blur(30px)" />
            <circle cx="800" cy="480" r="60" fill="#f43f5e" opacity="0.2" filter="blur(30px)" />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/10 via-transparent to-transparent" />
        </div>
      )}

      {/* 5. GARY / INDIGO PLATEAU (Grand Championship Arena) */}
      {(arena === 'gary' || arena === 'stadium') && (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-indigo-950/70 to-slate-900">
          <svg className="absolute inset-0 w-full h-full opacity-40" preserveAspectRatio="none" viewBox="0 0 1000 600">
            {/* Grand stadium crowd rings & floodlight beams */}
            <ellipse cx="500" cy="300" rx="420" ry="220" stroke="#6366f1" strokeWidth="3" fill="none" opacity="0.6" />
            <ellipse cx="500" cy="300" rx="350" ry="180" stroke="#a855f7" strokeWidth="1.5" fill="none" strokeDasharray="10,10" opacity="0.4" />
            {/* Spotlights */}
            <polygon points="0,0 250,300 180,300" fill="#38bdf8" opacity="0.12" />
            <polygon points="1000,0 750,300 820,300" fill="#f43f5e" opacity="0.12" />
          </svg>
          <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-indigo-500/20 to-transparent blur-2xl" />
        </div>
      )}

      {/* 6. PAPA (Warm Living Room Arena) */}
      {arena === 'papa' && (
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-amber-950/40 to-stone-900">
          {/* Wood floor planks & warm table mat */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[85%] h-[80%] rounded-[40px] border-4 border-amber-600/30 bg-amber-900/10 shadow-2xl backdrop-blur-[2px]" />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>
      )}

      {/* 3D Battle Arena Ring Centerpiece (Common to all arenas) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Outer glowing stadium ellipse */}
        <div className="relative w-[85vw] max-w-[1100px] h-[55vh] max-h-[500px] rounded-[50%] border-3 border-amber-400/40 shadow-[0_0_50px_rgba(251,191,36,0.15)] flex items-center justify-center">
          {/* Center Dividing Line with Pokéball Logo */}
          <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
          <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-3 border-amber-400/80 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center shadow-[0_0_25px_rgba(251,191,36,0.5)]">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-3 border-amber-400 bg-slate-900" />
          </div>
        </div>
      </div>
    </div>
  );
};
