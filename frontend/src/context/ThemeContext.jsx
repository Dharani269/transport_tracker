import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = {
  dark: {
    bg: '#0f172a',
    sidebar: '#1e293b',
    card: '#1e293b',
    cardBorder: '#334155',
    text: '#f1f5f9',
    subtext: '#94a3b8',
    accent: '#6366f1',
    accentHover: '#4f46e5',
    input: '#0f172a',
    inputBorder: '#334155',
    tableHead: '#0f172a',
    tableRow: '#1e293b',
    tableRowHover: '#273549',
    navActive: '#6366f1',
  },
  light: {
    bg: '#f1f5f9',
    sidebar: '#ffffff',
    card: '#ffffff',
    cardBorder: '#e2e8f0',
    text: '#0f172a',
    subtext: '#64748b',
    accent: '#6366f1',
    accentHover: '#4f46e5',
    input: '#f8fafc',
    inputBorder: '#cbd5e1',
    tableHead: '#f8fafc',
    tableRow: '#ffffff',
    tableRowHover: '#f1f5f9',
    navActive: '#6366f1',
  },
  ocean: {
    bg: '#0a1628',
    sidebar: '#0d2137',
    card: '#0d2137',
    cardBorder: '#1a3a5c',
    text: '#e0f2fe',
    subtext: '#7dd3fc',
    accent: '#0ea5e9',
    accentHover: '#0284c7',
    input: '#0a1628',
    inputBorder: '#1a3a5c',
    tableHead: '#0a1628',
    tableRow: '#0d2137',
    tableRowHover: '#112840',
    navActive: '#0ea5e9',
  },
};

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState(() => localStorage.getItem('theme') || 'dark');
  const theme = themes[themeName];

  useEffect(() => { localStorage.setItem('theme', themeName); }, [themeName]);

  return (
    <ThemeContext.Provider value={{ theme, themeName, setThemeName }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
