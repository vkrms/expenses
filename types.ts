export interface Expense {
  id?: string;
  created_at?: string;
  description: string;
  amount: number;
  date: string; // ISO Date string YYYY-MM-DD
  category: ExpenseCategory;
}

export enum ExpenseCategory {
  FOOD = 'Food',
  DRINK = 'Drink',
  SNACK = 'Snack',
  GROCERY = 'Grocery',
  DINING_OUT = 'Dining Out',
  OTHER = 'Other'
}

export interface ChartData {
  name: string;
  value: number;
  fill?: string;
}

export interface DailyTotal {
  date: string;
  amount: number;
}