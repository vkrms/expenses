import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, List, Settings, Leaf } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { ReminderSettings } from './components/ReminderSettings';
import { ThemeSettings } from './components/ThemeSettings';
import { ThemeProvider } from './lib/theme';
import { storage } from './lib/storage';
import { Expense } from './types';
import { isSupabaseConfigured } from './lib/supabase';
import { STORAGE_KEYS } from './constants';
import { format, isSameDay, parseISO } from 'date-fns';

function AppContent() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const location = useLocation();

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await storage.getExpenses();
      setExpenses(data);
    } catch (error) {
      console.error('Failed to load expenses', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Reminder Logic
  useEffect(() => {
    const checkReminder = () => {
      // 1. Check if reminders are enabled
      const enabled = localStorage.getItem(STORAGE_KEYS.REMINDER_ENABLED) === 'true';
      if (!enabled) return;

      // 2. Check time
      const timeStr = localStorage.getItem(STORAGE_KEYS.REMINDER_TIME) || '20:00';
      const [hours, minutes] = timeStr.split(':').map(Number);
      const now = new Date();
      const reminderTime = new Date();
      reminderTime.setHours(hours, minutes, 0, 0);

      if (now < reminderTime) return; // Too early

      // 3. Check if we already reminded today
      const lastReminded = localStorage.getItem(STORAGE_KEYS.LAST_REMINDED_DATE);
      const todayStr = format(now, 'yyyy-MM-dd');
      
      if (lastReminded === todayStr) return; // Already reminded today

      // 4. Check if we already have expenses for today
      // Note: We use the expenses state here. 
      const hasExpensesToday = expenses.some(e => isSameDay(parseISO(e.date), now));

      if (hasExpensesToday) {
        // We have data, so no need to remind, but let's mark as 'reminded' to suppress further checks today
        localStorage.setItem(STORAGE_KEYS.LAST_REMINDED_DATE, todayStr);
        return;
      }

      // 5. Trigger Notification
      if (Notification.permission === 'granted') {
         const title = 'Log your meals!';
         const options = {
           body: "You haven't tracked any food expenses today yet.",
           icon: 'https://picsum.photos/192/192',
           tag: 'daily-reminder',
           badge: 'https://picsum.photos/96/96',
         };

         if (navigator.serviceWorker && navigator.serviceWorker.controller) {
           navigator.serviceWorker.ready.then(registration => {
             registration.showNotification(title, options);
           });
         } else {
           new Notification(title, options);
         }
         
         // Mark as reminded
         localStorage.setItem(STORAGE_KEYS.LAST_REMINDED_DATE, todayStr);
      }
    };

    // Check immediately on load/change
    if (!loading) {
        checkReminder();
    }

    // Set up interval to check every minute
    const interval = setInterval(checkReminder, 60000);
    return () => clearInterval(interval);

  }, [expenses, loading]);

  const handleAddExpense = async (expense: Omit<Expense, 'id' | 'created_at'>) => {
    await storage.addExpense(expense);
    await fetchExpenses();
    setShowAddModal(false);
  };

  const handleDeleteExpense = async (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      await storage.deleteExpense(id);
      await fetchExpenses();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans pb-24 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10 safe-top transition-colors duration-200">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 p-1.5 rounded-lg text-white">
              <Leaf className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">NutriSpend</h1>
          </div>
          {!isSupabaseConfigured() && (
             <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
               Demo Mode (Local Storage)
             </span>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        {showAddModal ? (
          <ExpenseForm onAdd={handleAddExpense} onCancel={() => setShowAddModal(false)} />
        ) : (
          <Routes>
            <Route path="/" element={<Dashboard expenses={expenses} />} />
            <Route 
              path="/list" 
              element={
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">History</h2>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{expenses.length} records</span>
                  </div>
                  <ExpenseList expenses={expenses} onDelete={handleDeleteExpense} />
                </div>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <div className="space-y-6">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Settings</h2>
                  
                  <ThemeSettings />
                  <ReminderSettings />
                  
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">About</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      NutriSpend helps you track your food budget for the last 30 days. 
                      Use the "Smart Add" feature to input meals using natural language.
                    </p>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      Version 1.2.0
                    </div>
                  </div>
                </div>
              } 
            />
          </Routes>
        )}
      </main>

      {/* Floating Action Button (FAB) */}
      {!showAddModal && (
        <button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-24 right-6 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-xl shadow-emerald-200 dark:shadow-emerald-900/40 flex items-center justify-center hover:bg-emerald-700 hover:scale-105 transition-all z-20"
          aria-label="Add Expense"
        >
          <PlusCircle className="w-8 h-8" />
        </button>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 safe-bottom z-10 transition-colors duration-200">
        <div className="max-w-3xl mx-auto flex justify-around items-center h-16">
          <Link 
            to="/" 
            className={`flex flex-col items-center gap-1 w-full h-full justify-center ${location.pathname === '/' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
          >
            <LayoutDashboard className="w-6 h-6" />
            <span className="text-[10px] font-medium">Overview</span>
          </Link>
          <Link 
            to="/list" 
            className={`flex flex-col items-center gap-1 w-full h-full justify-center ${location.pathname === '/list' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
          >
            <List className="w-6 h-6" />
            <span className="text-[10px] font-medium">History</span>
          </Link>
          <Link 
            to="/settings" 
            className={`flex flex-col items-center gap-1 w-full h-full justify-center ${location.pathname === '/settings' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
          >
            <Settings className="w-6 h-6" />
            <span className="text-[10px] font-medium">Settings</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </ThemeProvider>
  );
}