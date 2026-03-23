import { useEffect } from 'react';

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Ensure dark mode is enabled
    document.documentElement.classList.add('dark');
  }, []);

  return <>{children}</>;
}
