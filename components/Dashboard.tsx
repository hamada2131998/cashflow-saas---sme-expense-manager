
import React, { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { UserRole, ExpenseStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { getSmartInsights } from '../services/gemini';

const Dashboard: React.FC = () => {
  const { currentUser, expenses, custodyRecords, users } = useApp();
  const [insights, setInsights] = useState<string | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Derived metrics
  const totalExpenses = expenses.filter(e => e.status === ExpenseStatus.APPROVED).reduce((acc, curr) => acc + curr.amount, 0);
  const pendingCount = expenses.filter(e => e.status === ExpenseStatus.PENDING).length;
  
  const custodySummary = custodyRecords.map(c => ({
    name: users.find(u => u.id === c.employeeId)?.name || 'Unknown',
    balance: c.currentBalance
  }));

  const expenseByEmployee = users
    .filter(u => u.role === UserRole.EMPLOYEE)
    .map(u => ({
      name: u.name,
      total: expenses
        .filter(e => e.employeeId === u.id && e.status === ExpenseStatus.APPROVED)
        .reduce((sum, e) => sum + e.amount, 0)
    }));

  const handleGetInsights = async () => {
    setLoadingInsights(true);
    const result = await getSmartInsights(expenses, users);
    setInsights(result);
    setLoadingInsights(false);
  };

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'];

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
        <p className="text-slate-500">Welcome back, {currentUser?.name}</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Total Approved Expenses</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-1">${totalExpenses.toFixed(2)}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Pending Approvals</p>
          <h3 className="text-3xl font-bold text-amber-600 mt-1">{pendingCount}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Total Company Custody</p>
          <h3 className="text-3xl font-bold text-emerald-600 mt-1">
            ${custodyRecords.reduce((a, b) => a + b.currentBalance, 0).toFixed(2)}
          </h3>
        </div>
        <div className="bg-indigo-600 p-6 rounded-xl shadow-md text-white">
          <p className="text-sm font-medium opacity-80">Subscription Status</p>
          <h3 className="text-3xl font-bold mt-1">Active</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart: Expenses per Employee */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h4 className="text-lg font-semibold mb-4">Spending by Employee</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenseByEmployee}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart: Petty Cash Balances */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h4 className="text-lg font-semibold mb-4">Petty Cash Distribution</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={custodySummary}
                  dataKey="balance"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                >
                  {custodySummary.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Insights Section */}
      {(currentUser?.role === UserRole.OWNER || currentUser?.role === UserRole.ACCOUNTANT) && (
        <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-semibold text-indigo-900 flex items-center">
                <span className="mr-2">✨</span> AI Smart Insights
              </h4>
              <p className="text-sm text-indigo-700">Powered by Gemini for your business audit.</p>
            </div>
            <button
              onClick={handleGetInsights}
              disabled={loadingInsights}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {loadingInsights ? 'Analyzing...' : 'Refresh Insights'}
            </button>
          </div>
          {insights ? (
            <div className="prose prose-sm text-indigo-900 whitespace-pre-wrap">
              {insights}
            </div>
          ) : (
            <p className="text-indigo-400 italic text-sm">Click the button to generate smart financial observations.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
