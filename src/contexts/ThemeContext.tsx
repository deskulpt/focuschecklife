import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeMode = 'light' | 'dark' | 'high-contrast';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  reducedMotion: boolean;
  setReducedMotion: (reduced: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem('theme-mode');
    return (stored as ThemeMode) || 'light';
  });

  const [fontSize, setFontSizeState] = useState(() => {
    const stored = localStorage.getItem('font-size');
    return stored ? Number(stored) : 100;
  });

  const [reducedMotion, setReducedMotionState] = useState(() => {
    return localStorage.getItem('reduced-motion') === 'true';
  });

  const setTheme = (t: ThemeMode) => {
    setThemeState(t);
    localStorage.setItem('theme-mode', t);
  };

  const setFontSize = (s: number) => {
    setFontSizeState(s);
    localStorage.setItem('font-size', String(s));
  };

  const setReducedMotion = (r: boolean) => {
    setReducedMotionState(r);
    localStorage.setItem('reduced-motion', String(r));
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'high-contrast');
    if (theme === 'dark') root.classList.add('dark');
    if (theme === 'high-contrast') root.classList.add('high-contrast');
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
  }, [fontSize]);

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reducedMotion);
  }, [reducedMotion]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, fontSize, setFontSize, reducedMotion, setReducedMotion }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
