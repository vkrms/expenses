import React, { useState } from 'react';
import { ExpenseCategory, Expense } from '../types';
import { parseExpenseText } from '../lib/gemini';
import { Loader2, Mic, Plus, Sparkles, Send } from 'lucide-react';

interface ExpenseFormProps {
  onAdd: (expense: Omit<Expense, 'id' | 'created_at'>) => Promise<void>;
  onCancel: () => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onAdd, onCancel }) => {
  const [mode, setMode] = useState<'manual' | 'ai'>('ai');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manual State
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>(ExpenseCategory.FOOD);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // AI State
  const [aiInput, setAiInput] = useState('');

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    setLoading(true);
    try {
      await onAdd({
        description,
        amount: parseFloat(amount),
        category,
        date
      });
      setDescription('');
      setAmount('');
    } catch (err) {
      console.error(err);
      setError('Failed to add expense.');
    } finally {
      setLoading(false);
    }
  };

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    setLoading(true);
    setError(null);
    try {
      if (!process.env.API_KEY) {
        throw new Error("Please Configure API Key in environment to use AI features.");
      }
      const extractedExpenses = await parseExpenseText(aiInput);
      if (extractedExpenses.length === 0) {
        setError("Could not understand the expense. Please try again or use manual mode.");
      } else {
        // Add all extracted expenses
        for (const expense of extractedExpenses) {
          await onAdd(expense);
        }
        setAiInput('');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "AI processing failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 max-w-lg mx-auto transition-colors">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Add Expense</h2>
        <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          <button
            onClick={() => setMode('ai')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${mode === 'ai' ? 'bg-white dark:bg-gray-600 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
          >
            <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> Smart</span>
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${mode === 'manual' ? 'bg-white dark:bg-gray-600 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
          >
            Manual
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm border border-red-100 dark:border-red-900/50">
          {error}
        </div>
      )}

      {mode === 'manual' ? (
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <input
              type="text"
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900 outline-none transition-all"
              placeholder="e.g., Tuna Sandwich"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-400">฿</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900 outline-none transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900 outline-none transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(ExpenseCategory).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`text-xs py-2 px-1 rounded-lg border transition-all ${category === cat ? 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-semibold' : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /> Add Expense</>}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleAiSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tell me what you bought</label>
            <textarea
              required
              rows={4}
              value={aiInput}
              onChange={e => setAiInput(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-900 outline-none transition-all resize-none"
              placeholder="e.g., I bought a latte for $4.50 and a bagel for $3 at Starbucks just now."
            />
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">Powered by Gemini. Can detect multiple items.</p>
          </div>
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-4 h-4" /> Analyze & Add</>}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};