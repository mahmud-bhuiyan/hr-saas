import { HiMoon, HiSun } from 'react-icons/hi2';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle = () => {
  const { colorScheme, toggleColorScheme } = useTheme();
  const isDark = colorScheme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleColorScheme}
      className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? (
        <HiSun className="h-5 w-5 text-amber-400" aria-hidden />
      ) : (
        <HiMoon className="h-5 w-5 text-indigo-500" aria-hidden />
      )}
    </button>
  );
};
