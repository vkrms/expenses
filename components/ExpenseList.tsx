import React from 'react';
import { Expense, ExpenseCategory } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { format, parseISO } from 'date-fns';
import { Trash2 } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDelete }) => {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🥗</span>
        </div>
        <h3 className="text-gray-900 font-medium">No expenses yet</h3>
        <p className="text-gray-500 text-sm mt-1">Start tracking your food journey!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => (
        <div 
          key={expense.id} 
          className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-emerald-200 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
              style={{ backgroundColor: CATEGORY_COLORS[expense.category] }}
            >
              {expense.category[0]}
            </div>
            <div>
              <p className="font-medium text-gray-900">{expense.description}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{format(parseISO(expense.date), 'MMM d, yyyy')}</span>
                <span>•</span>
                <span>{expense.category}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-bold text-gray-900">
              ${expense.amount.toFixed(2)}
            </span>
            <button
              onClick={() => expense.id && onDelete(expense.id)}
              className="text-gray-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
              aria-label="Delete expense"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};