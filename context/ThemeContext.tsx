
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import type { Theme, ThemeContextType } from '../types';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem('portalTheme') as Theme | null;
    return storedTheme || 'default-blue';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    root.classList.remove('theme-default-blue', 'theme-forest-green', 'theme-deep-purple');
    root.classList.add(`theme-${theme}`);
    
    localStorage.setItem('portalTheme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};