import { useEffect } from 'react';

export function DarkModeProvider({ children }) {
  useEffect(() => {
    // Ensure dark mode is enabled
    document.documentElement.classList.add('dark');
  }, []);

  return <>{children}</>;
}


