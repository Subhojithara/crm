"use client";

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react'; // Ensure you have lucide-react installed
import { Button } from '@/components/ui/button';

const DarkModeToggle = () => {
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    // Check for user preference in localStorage
    const storedMode = localStorage.getItem('theme');
    if (storedMode === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else if (storedMode === 'light') {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      // If no preference, use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
        setIsDark(true);
      }
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setIsDark(!isDark);
  };

  return (
    <Button variant="ghost" onClick={toggleDarkMode} aria-label="Toggle Dark Mode">
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
};

export default DarkModeToggle; 