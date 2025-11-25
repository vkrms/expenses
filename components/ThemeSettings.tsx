import React from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme, Theme } from '../lib/theme';

export const ThemeSettings: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const options: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
    { value: 'system', label: 'System', icon: <Monitor className="w-4 h-4" /> },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-4">
      <div className="flex items-center gap-3">
        <div className="bg-emerald-50 dark:bg-emerald-900/30 p-2 rounded-xl text-emerald-600 dark:text-emerald-400">
          <Moon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">App Appearance</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">Choose your preferred theme.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => setTheme(option.value)}
            className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
              theme === option.value
                ? 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-medium'
                : 'bg-gray-50 dark:bg-gray-700/50 border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {option.icon}
            <span className="text-xs">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};