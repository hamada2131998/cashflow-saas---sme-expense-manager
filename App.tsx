import React, { useState } from 'react';
import { AppProvider, useApp } from './store/AppContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ExpenseManager from './components/ExpenseManager';
import CustodyManager from './components/CustodyManager';
import AuditLogs from './components/AuditLogs';

const LoginView: React.FC = () => {
  const { login, isLoading } = useApp();

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-right" dir="rtl">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600" />
        <div className="mb-8">
          <h1 className="text-2xl font-black text-slate-900">CashFlow SaaS</h1>
          <p className="text-slate-500 text-sm mt-1">اختر حساباً للتجربة (كلمة المرور: password123)</p>
        </div>
        <div className="space-y-4">
          <button 
            disabled={isLoading}
            onClick={() => login('owner@a.com')} 
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-all text-right"
          >
            <p className="font-bold text-slate-900">حساب المالك (Company A)</p>
            <p className="text-xs text-slate-500">صلاحيات كاملة واعتماد مصروفات</p>
          </button>
          <button 
            disabled={isLoading}
            onClick={() => login('sarah@a.com')} 
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-all text-right"
          >
            <p className="font-bold text-slate-900">حساب المحاسب (Company A)</p>
            <p className="text-xs text-slate-500">مراجعة المصروفات والتقارير</p>
          </button>
          <button 
            disabled={isLoading}
            onClick={() => login('john@a.com')} 
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-all text-right"
          >
            <p className="font-bold text-slate-900">حساب موظف (Company A)</p>
            <p className="text-xs text-slate-500">رفع إيصالات ومتابعة العهدة الشخصية</p>
          </button>
          <button 
            disabled={isLoading}
            onClick={() => login('emp@b.com')} 
            className="w-full p-4 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition-all text-right"
          >
            <p className="font-bold text-slate-900">موظف شركة ب (Company B)</p>
            <p className="text-xs text-slate-500">اختبار عزل البيانات (Multi-tenancy)</p>
          </button>
        </div>
        {isLoading && <div className="mt-4 text-center text-indigo-600 font-medium animate-pulse">جاري التحميل...</div>}
      </div>
    </div>
  );
};

const AuthenticatedApp: React.FC = () => {
  const [tab, setTab] = useState('dashboard');
  const { currentUser } = useApp();

  if (!currentUser) return <LoginView />;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar currentTab={tab} setTab={setTab} />
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto max-h-screen">
        <div className="max-w-6xl mx-auto">
          {tab === 'dashboard' && <Dashboard />}
          {tab === 'expenses' && <ExpenseManager />}
          {tab === 'custody' && <CustodyManager />}
          {tab === 'logs' && <AuditLogs />}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AuthenticatedApp />
    </AppProvider>
  );
};

export default App;
