import { supabase, isSupabaseConfigured } from './supabase';
import { Expense } from '../types';
import { SUPABASE_TABLE, MOCK_EXPENSES, STORAGE_KEYS } from '../constants';

// Helper to simulate network delay for local storage
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const storage = {
  async getExpenses(): Promise<Expense[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from(SUPABASE_TABLE)
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as Expense[] || [];
    } else {
      // Fallback to Local Storage
      await delay(300);
      const stored = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      if (!stored) {
        // Initialize with some mock data for demo purposes
        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(MOCK_EXPENSES));
        return MOCK_EXPENSES as Expense[];
      }
      return JSON.parse(stored) as Expense[];
    }
  },

  async addExpense(expense: Omit<Expense, 'id' | 'created_at'>): Promise<Expense> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from(SUPABASE_TABLE)
        .insert([expense])
        .select()
        .single();
      
      if (error) throw error;
      return data as Expense;
    } else {
      await delay(300);
      const stored = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      const currentExpenses = stored ? JSON.parse(stored) : [];
      const newExpense: Expense = {
        ...expense,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString()
      };
      const updated = [newExpense, ...currentExpenses];
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(updated));
      return newExpense;
    }
  },

  async deleteExpense(id: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase
        .from(SUPABASE_TABLE)
        .delete()
        .eq('id', id);
      if (error) throw error;
    } else {
      await delay(100);
      const stored = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      if (stored) {
        const current = JSON.parse(stored) as Expense[];
        const updated = current.filter(e => e.id !== id);
        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(updated));
      }
    }
  }
};