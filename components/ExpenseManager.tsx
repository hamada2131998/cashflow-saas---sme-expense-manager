
import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { UserRole, ExpenseStatus } from '../types';

const ExpenseManager: React.FC = () => {
  const { expenses, currentUser, addExpense, updateExpenseStatus, users, branches, getEmployeeCustody } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ amount: '', description: '', branchId: '' });

  const canApprove = currentUser?.role === UserRole.OWNER || currentUser?.role === UserRole.ACCOUNTANT;

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    addExpense({
      amount: parseFloat(formData.amount),
      description: formData.description,
      employeeId: currentUser.id,
      branchId: formData.branchId || currentUser.branchId
    });
    setFormData({ amount: '', description: '', branchId: '' });
    setIsAdding(false);
  };

  const filteredExpenses = expenses.filter(exp => {
    if (currentUser?.role === UserRole.EMPLOYEE) return exp.employeeId === currentUser.id;
    return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Expense Management</h2>
        {currentUser?.role === UserRole.EMPLOYEE && (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {isAdding ? 'Cancel' : '+ Record Expense'}
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAddExpense} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount ($)</label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Branch (Optional)</label>
              <select
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.branchId}
                onChange={e => setFormData({ ...formData, branchId: e.target.value })}
              >
                <option value="">Select Branch</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700">
            Submit Expense
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Employee</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Description</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Amount</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
              {canApprove && <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredExpenses.map(exp => {
              const employee = users.find(u => u.id === exp.employeeId);
              const custody = getEmployeeCustody(exp.employeeId);
              
              return (
                <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{employee?.name}</div>
                    <div className="text-xs text-slate-400">{employee?.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{exp.description}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">${exp.amount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                      exp.status === ExpenseStatus.APPROVED ? 'bg-emerald-100 text-emerald-700' :
                      exp.status === ExpenseStatus.REJECTED ? 'bg-rose-100 text-rose-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {exp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{exp.date}</td>
                  {canApprove && (
                    <td className="px-6 py-4">
                      {exp.status === ExpenseStatus.PENDING && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => updateExpenseStatus(exp.id, ExpenseStatus.APPROVED)}
                            className="px-2 py-1 bg-emerald-600 text-white rounded text-xs hover:bg-emerald-700"
                            title="Approve and Deduct from Custody"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateExpenseStatus(exp.id, ExpenseStatus.REJECTED)}
                            className="px-2 py-1 bg-rose-600 text-white rounded text-xs hover:bg-rose-700"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredExpenses.length === 0 && (
          <div className="py-12 text-center text-slate-400">No expenses found for this company.</div>
        )}
      </div>
    </div>
  );
};

export default ExpenseManager;
