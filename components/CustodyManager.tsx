
import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { UserRole } from '../types';

const CustodyManager: React.FC = () => {
  const { custodyRecords, users, currentUser, addCustodyFunds } = useApp();
  const [topupModal, setTopupModal] = useState<{ open: boolean; employeeId: string; amount: string }>({
    open: false,
    employeeId: '',
    amount: ''
  });

  const canManage = currentUser?.role === UserRole.OWNER || currentUser?.role === UserRole.ACCOUNTANT;

  const handleTopup = () => {
    if (!topupModal.employeeId || !topupModal.amount) return;
    addCustodyFunds(topupModal.employeeId, parseFloat(topupModal.amount));
    setTopupModal({ open: false, employeeId: '', amount: '' });
  };

  const filteredRecords = custodyRecords.filter(c => {
    if (currentUser?.role === UserRole.EMPLOYEE) return c.employeeId === currentUser.id;
    return true;
  });

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Petty Cash (Cash Custody)</h2>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecords.map(record => {
          const employee = users.find(u => u.id === record.employeeId);
          return (
            <div key={record.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                    {employee?.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{employee?.name}</h3>
                    <p className="text-xs text-slate-500">Last updated: {new Date(record.lastUpdated).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Current Balance</p>
                <p className={`text-4xl font-black ${record.currentBalance < 500 ? 'text-rose-600' : 'text-slate-900'}`}>
                  ${record.currentBalance.toLocaleString()}
                </p>
                {record.currentBalance < 500 && (
                  <p className="mt-1 text-xs text-rose-500 font-medium">⚠️ Low balance alert</p>
                )}
              </div>
              {canManage && (
                <button
                  onClick={() => setTopupModal({ open: true, employeeId: record.employeeId, amount: '' })}
                  className="w-full py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-indigo-600 hover:text-white transition-all"
                >
                  Top Up Funds
                </button>
              )}
            </div>
          );
        })}
      </div>

      {topupModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
            <h3 className="text-xl font-bold mb-4">Add Funds to Custody</h3>
            <p className="text-sm text-slate-500 mb-6">
              Topping up for: <span className="font-bold text-slate-900">
                {users.find(u => u.id === topupModal.employeeId)?.name}
              </span>
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount to Add ($)</label>
                <input
                  type="number"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. 1000"
                  value={topupModal.amount}
                  onChange={e => setTopupModal({ ...topupModal, amount: e.target.value })}
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setTopupModal({ ...topupModal, open: false })}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTopup}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                >
                  Add Funds
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustodyManager;
