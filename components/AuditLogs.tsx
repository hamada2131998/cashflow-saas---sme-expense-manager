
import React from 'react';
import { useApp } from '../store/AppContext';

const AuditLogs: React.FC = () => {
  const { logs, users } = useApp();

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">Audit Trail</h2>
        <p className="text-slate-500">Every action performed in your company is logged here for security.</p>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto">
          {logs.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {logs.map(log => {
                const user = users.find(u => u.id === log.userId);
                return (
                  <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex space-x-3">
                        <div className={`mt-1 w-2 h-2 rounded-full ${
                          log.action.includes('LOGIN') ? 'bg-emerald-400' :
                          log.action.includes('EXPENSE') ? 'bg-indigo-400' :
                          'bg-slate-400'
                        }`} />
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{log.action}</p>
                          <p className="text-sm text-slate-600 mt-0.5">{log.details}</p>
                          <p className="text-xs text-slate-400 mt-1">Performed by {user?.name} ({user?.role})</p>
                        </div>
                      </div>
                      <time className="text-xs text-slate-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </time>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 italic">
              No activity logs recorded yet for this session.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
