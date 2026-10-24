import { useState, useEffect } from 'react';

export interface ResponsiveLayoutState {
  isPortrait: boolean;
  isLandscape: boolean;
  isMobile: boolean;
  isMobilePortrait: boolean;
  isMobileLandscape: boolean;
  width: number;
  height: number;
}

export function useResponsiveLayout(): ResponsiveLayoutState {
  const getLayout = (): ResponsiveLayoutState => {
    if (typeof window === 'undefined') {
      return {
        isPortrait: false,
        isLandscape: true,
        isMobile: false,
        isMobilePortrait: false,
        isMobileLandscape: false,
        width: 1024,
        height: 768
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isPortrait = height > width || window.matchMedia('(orientation: portrait)').matches;
    const isLandscape = !isPortrait;

    // Mobile is true for phones in portrait (< 768px width) or phones in landscape (height <= 500px and width < 1000px)
    const isMobile = width < 768 || (height <= 500 && width < 1000);
    const isMobilePortrait = isPortrait && width < 768;
    const isMobileLandscape = isLandscape && height <= 500;

    return {
      isPortrait,
      isLandscape,
      isMobile,
      isMobilePortrait,
      isMobileLandscape,
      width,
      height
    };
  };

  const [layout, setLayout] = useState<ResponsiveLayoutState>(getLayout);

  useEffect(() => {
    const handleUpdate = () => {
      setLayout(getLayout());
    };

    window.addEventListener('resize', handleUpdate);
    window.addEventListener('orientationchange', handleUpdate);

    const mql = window.matchMedia('(orientation: portrait)');
    if (mql?.addEventListener) {
      mql.addEventListener('change', handleUpdate);
    }

    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('orientationchange', handleUpdate);
      if (mql?.removeEventListener) {
        mql.removeEventListener('change', handleUpdate);
      }
    };
  }, []);

  return layout;
}
