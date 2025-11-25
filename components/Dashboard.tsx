import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Expense, ExpenseCategory } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { format, subDays, parseISO, isSameDay } from 'date-fns';

interface DashboardProps {
  expenses: Expense[];
}

export const Dashboard: React.FC<DashboardProps> = ({ expenses }) => {
  const totalSpend = useMemo(() => expenses.reduce((acc, curr) => acc + curr.amount, 0), [expenses]);
  
  const categoryData = useMemo(() => {
    const map = new Map<ExpenseCategory, number>();
    expenses.forEach(e => {
      const current = map.get(e.category) || 0;
      map.set(e.category, current + e.amount);
    });
    
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const last30DaysData = useMemo(() => {
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dailyExpenses = expenses.filter(e => isSameDay(parseISO(e.date), date));
      const dailyTotal = dailyExpenses.reduce((acc, curr) => acc + curr.amount, 0);
      
      data.push({
        date: format(date, 'MMM dd'),
        amount: dailyTotal
      });
    }
    return data;
  }, [expenses]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
        <h2 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wide">30-Day Total</h2>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-4xl font-extrabold text-gray-900 dark:text-white">${totalSpend.toFixed(2)}</span>
          <span className="text-sm text-gray-400 dark:text-gray-500">USD</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 min-h-[300px] transition-colors">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Spend by Category</h3>
          <div className="h-64 w-full">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name as ExpenseCategory] || '#ccc'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `$${value.toFixed(2)}`}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#111' }}
                    itemStyle={{ color: '#111' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">No data available</div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 min-h-[300px] transition-colors">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Daily Trend</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last30DaysData}>
                <XAxis 
                  dataKey="date" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  interval={6}
                  stroke="#9ca3af"
                />
                <YAxis 
                  hide={true} 
                />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#111' }}
                  itemStyle={{ color: '#111' }}
                />
                <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};