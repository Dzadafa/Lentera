import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { getSetting, setSetting } from '../db';

export type FontScale = 'small' | 'medium' | 'large';

interface FontScaleContextType {
  fontScale: FontScale;
  scaleMultiplier: number;
  setFontScale: (scale: FontScale) => Promise<void>;
  scaleFont: (baseSize: number) => number;
}

const SCALE_MULTIPLIERS: Record<FontScale, number> = {
  small: 0.9,
  medium: 1.0,
  large: 1.15,
};

const FontScaleContext = createContext<FontScaleContextType>({
  fontScale: 'medium',
  scaleMultiplier: 1.0,
  setFontScale: async () => {},
  scaleFont: (size) => size,
});

export const FontScaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontScale, setFontScaleState] = useState<FontScale>('medium');

  useEffect(() => {
    void (async () => {
      try {
        const saved = await getSetting('font_scale');
        if (saved === 'small' || saved === 'medium' || saved === 'large') {
          setFontScaleState(saved);
        }
      } catch {
        // Fallback default
      }
    })();
  }, []);

  const setFontScale = async (scale: FontScale) => {
    setFontScaleState(scale);
    try {
      await setSetting('font_scale', scale);
    } catch {
      // Abaikan bila ada galat persistensi
    }
  };

  const scaleMultiplier = SCALE_MULTIPLIERS[fontScale];

  const scaleFont = useMemo(
    () => (baseSize: number) => Math.round(baseSize * scaleMultiplier),
    [scaleMultiplier]
  );

  return (
    <FontScaleContext.Provider value={{ fontScale, scaleMultiplier, setFontScale, scaleFont }}>
      {children}
    </FontScaleContext.Provider>
  );
};

export const useFontScale = (): FontScaleContextType => {
  return useContext(FontScaleContext);
};
