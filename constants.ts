import { ExpenseCategory } from './types';

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  [ExpenseCategory.FOOD]: '#10b981', // Emerald 500
  [ExpenseCategory.DRINK]: '#3b82f6', // Blue 500
  [ExpenseCategory.SNACK]: '#f59e0b', // Amber 500
  [ExpenseCategory.GROCERY]: '#8b5cf6', // Violet 500
  [ExpenseCategory.DINING_OUT]: '#ef4444', // Red 500
  [ExpenseCategory.OTHER]: '#9ca3af', // Gray 400
};

export const MOCK_EXPENSES = [
  { id: '1', description: 'Lunch at Cafe', amount: 15.50, date: new Date().toISOString().split('T')[0], category: ExpenseCategory.DINING_OUT },
  { id: '2', description: 'Groceries', amount: 45.20, date: new Date(Date.now() - 86400000).toISOString().split('T')[0], category: ExpenseCategory.GROCERY },
];

export const SUPABASE_TABLE = 'expenses';

// Storage Keys
export const STORAGE_KEYS = {
  REMINDER_ENABLED: 'nutrispend_reminder_enabled',
  REMINDER_TIME: 'nutrispend_reminder_time',
  LAST_REMINDED_DATE: 'nutrispend_last_reminded',
  EXPENSES: 'nutrispend_expenses',
  THEME: 'nutrispend_theme'
};