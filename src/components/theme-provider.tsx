'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

export type Theme = 'light' | 'dark';
const ThemeContext = createContext<{ theme: Theme; setTheme: (theme: Theme) => void }>({
  theme: 'light', setTheme: () => {},
});

export function ThemeProvider({ initialTheme, children }: { initialTheme: Theme; children: ReactNode }) {
  const [theme, updateTheme] = useState(initialTheme);
  function setTheme(next: Theme) {
    document.documentElement.dataset.theme = next;
    document.cookie = `chgu-theme=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
    updateTheme(next);
  }
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
