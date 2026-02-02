
import React from 'react';
import { useApp } from '../store/AppContext';
import { UserRole } from '../types';

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentTab, setTab }) => {
  const { currentUser, logout } = useApp();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', roles: [UserRole.OWNER, UserRole.ACCOUNTANT, UserRole.EMPLOYEE] },
    { id: 'expenses', label: 'Expenses', icon: '💸', roles: [UserRole.OWNER, UserRole.ACCOUNTANT, UserRole.EMPLOYEE] },
    { id: 'custody', label: 'Petty Cash', icon: '💰', roles: [UserRole.OWNER, UserRole.ACCOUNTANT, UserRole.EMPLOYEE] },
    { id: 'logs', label: 'Audit Logs', icon: '📜', roles: [UserRole.OWNER, UserRole.ACCOUNTANT] },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 min-h-screen flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-tight text-indigo-400">CashFlow SaaS</h1>
        <p className="text-xs text-slate-400 mt-1">SME Management</p>
      </div>

      <nav className="flex-1 mt-6 px-4">
        {menuItems.map((item) => {
          if (!currentUser || !item.roles.includes(currentUser.role)) return null;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                currentTab === item.id ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center space-x-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold uppercase">
            {currentUser?.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{currentUser?.name}</p>
            <p className="text-xs text-slate-400 truncate uppercase">{currentUser?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full mt-4 text-left text-xs text-slate-400 hover:text-red-400 transition-colors px-2"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
