import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../types/game';
import { soundManager } from '../services/soundManager';
import { Sparkles } from 'lucide-react';

interface HoloCardProps {
  card: Card;
  className?: string;
  interactive?: boolean;
  onTap?: () => void;
}

export const HoloCard: React.FC<HoloCardProps> = ({
  card,
  className = '',
  interactive = true,
  onTap
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const hasPlayedShine = useRef<boolean>(false);

  const isRare = card.isEx || card.stage === 'Rang 2' || card.hp >= 120;

  // 1. Gyroscope tracking on Mobile / Fire Tablet 11
  useEffect(() => {
    if (!interactive) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      // gamma: -90 to 90 (left-right tilt)
      // beta: -180 to 180 (front-back tilt, around 45deg is normal tablet angle)
      const normX = Math.max(-1, Math.min(1, e.gamma / 25));
      const normY = Math.max(-1, Math.min(1, (e.beta - 45) / 25));

      setCoords({ x: normX, y: normY });
      setIsHovered(true);

      if (isRare && !hasPlayedShine.current && Math.abs(normX) > 0.4) {
        hasPlayedShine.current = true;
        soundManager.playSfx('card_shine');
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [interactive, isRare]);

  // 2. Pointer / Touch drag handling
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, ((e.clientX - rect.left) / rect.width) * 2 - 1));
    const y = Math.max(-1, Math.min(1, ((e.clientY - rect.top) / rect.height) * 2 - 1));

    setCoords({ x, y });
    setIsHovered(true);

    if (isRare && !hasPlayedShine.current) {
      hasPlayedShine.current = true;
      soundManager.playSfx('card_shine');
    }
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    setCoords({ x: 0, y: 0 });
    hasPlayedShine.current = false;
  };

  // 3D Tilt Angles
  const rotateX = -coords.y * 18;
  const rotateY = coords.x * 18;
  const shineX = (coords.x + 1) * 50;
  const shineY = (coords.y + 1) * 50;
  const rainbowAngle = (coords.x * 45) + 115;

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={onTap}
      style={{ perspective: '1000px', touchAction: 'none' }}
      className={`relative select-none ${interactive ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* 3D Rotating Card Body */}
      <div
        className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl transition-transform ease-out duration-150"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) ${isHovered ? 'scale3d(1.04, 1.04, 1.04)' : 'scale3d(1, 1, 1)'}`,
          boxShadow: isHovered
            ? `${-coords.x * 20}px ${-coords.y * 20 + 20}px 35px rgba(0,0,0,0.7), 0 0 25px rgba(251,191,36,0.5)`
            : '0 15px 30px rgba(0,0,0,0.6)'
        }}
      >
        {/* Layer 1: Base Card Scan Image */}
        <img
          src={card.cardImageUrl}
          alt={card.name}
          className="w-full h-full object-contain bg-slate-950 pointer-events-none"
          onError={(e) => {
            (e.target as HTMLImageElement).src = card.artworkUrl;
          }}
        />

        {/* Layer 2: Prismatic Rainbow Foil Bar (TCG Pocket Specular) */}
        {isRare && (
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{
              mixBlendMode: 'color-dodge',
              opacity: isHovered ? 0.75 : 0.35,
              background: `linear-gradient(${rainbowAngle}deg, 
                rgba(255, 0, 0, 0.4) 0%, 
                rgba(255, 154, 0, 0.4) 14%, 
                rgba(208, 222, 33, 0.4) 28%, 
                rgba(79, 220, 74, 0.4) 42%, 
                rgba(63, 218, 216, 0.4) 56%, 
                rgba(47, 201, 226, 0.4) 70%, 
                rgba(28, 127, 238, 0.4) 84%, 
                rgba(95, 21, 242, 0.4) 100%)`
            }}
          />
        )}

        {/* Layer 3: Dynamic Specular Spotlight / Flare */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-200"
          style={{
            mixBlendMode: 'overlay',
            opacity: isHovered ? 0.85 : 0.2,
            background: `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.3) 25%, transparent 60%)`
          }}
        />

        {/* Layer 4: Shimmering Glitter Stars for EX Cards */}
        {isRare && isHovered && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <Sparkles className="absolute top-8 left-6 w-8 h-8 text-yellow-200 animate-spin opacity-80" />
            <Sparkles className="absolute bottom-12 right-6 w-10 h-10 text-white animate-pulse opacity-90" />
            <Sparkles className="absolute top-1/2 left-1/3 w-6 h-6 text-amber-300 animate-ping opacity-75" />
          </div>
        )}

        {/* Layer 5: Card Border Specular Gleam */}
        <div
          className="absolute inset-0 rounded-2xl border-2 pointer-events-none transition-colors duration-300"
          style={{
            borderColor: isRare
              ? isHovered ? 'rgba(253, 224, 71, 0.9)' : 'rgba(251, 191, 36, 0.6)'
              : 'rgba(255, 255, 255, 0.3)'
          }}
        />
      </div>
    </div>
  );
};
