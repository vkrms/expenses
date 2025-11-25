import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Check, Clock } from 'lucide-react';
import { STORAGE_KEYS } from '../constants';

export const ReminderSettings: React.FC = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState('20:00'); // Default 8 PM

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
    
    // Load saved settings
    const savedEnabled = localStorage.getItem(STORAGE_KEYS.REMINDER_ENABLED);
    const savedTime = localStorage.getItem(STORAGE_KEYS.REMINDER_TIME);
    
    if (savedEnabled === 'true') setEnabled(true);
    if (savedTime) setTime(savedTime);
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications');
      return;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === 'granted') {
      setEnabled(true);
      localStorage.setItem(STORAGE_KEYS.REMINDER_ENABLED, 'true');
      
      // Send a test notification
      if (navigator.serviceWorker && navigator.serviceWorker.ready) {
        const registration = await navigator.serviceWorker.ready;
        registration.showNotification('Reminders Enabled', {
          body: `You'll be reminded daily at ${time} if you haven't logged any meals.`,
          icon: 'https://picsum.photos/192/192'
        });
      } else {
        new Notification('Reminders Enabled', {
          body: `You'll be reminded daily at ${time} if you haven't logged any meals.`,
          icon: 'https://picsum.photos/192/192'
        });
      }
    }
  };

  const toggleEnabled = () => {
    if (!enabled) {
      if (permission === 'granted') {
        setEnabled(true);
        localStorage.setItem(STORAGE_KEYS.REMINDER_ENABLED, 'true');
      } else {
        requestPermission();
      }
    } else {
      setEnabled(false);
      localStorage.setItem(STORAGE_KEYS.REMINDER_ENABLED, 'false');
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTime(newTime);
    localStorage.setItem(STORAGE_KEYS.REMINDER_TIME, newTime);
  };

  return (
    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-emerald-800 p-2 rounded-xl text-emerald-600 dark:text-emerald-100 shadow-sm">
            {enabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Daily Reminders</h3>
            <p className="text-xs text-gray-600 dark:text-emerald-100/70">Get notified to track your meals.</p>
          </div>
        </div>
        
        <button
          onClick={toggleEnabled}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
            enabled ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {enabled && (
        <div className="pt-3 border-t border-emerald-100/50 dark:border-emerald-800 flex items-center justify-between animate-fade-in">
          <label className="flex items-center gap-2 text-sm text-emerald-800 dark:text-emerald-100 font-medium">
            <Clock className="w-4 h-4" />
            Remind me at:
          </label>
          <input
            type="time"
            value={time}
            onChange={handleTimeChange}
            className="bg-white dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2 outline-none shadow-sm"
          />
        </div>
      )}
      
      {permission === 'denied' && (
        <p className="text-xs text-red-500 dark:text-red-400 mt-2">
          Notifications are blocked in your browser settings. Please enable them to use this feature.
        </p>
      )}
    </div>
  );
};