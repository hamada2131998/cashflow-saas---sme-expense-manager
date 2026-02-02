import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Company, Expense, CashCustody, Branch, AuditLog, UserRole, ExpenseStatus, AppState } from '../types';
import { ExpenseService } from '../client/api';
import axios from 'axios';

interface AppContextType extends AppState {
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  addExpense: (expense: any) => Promise<void>;
  updateExpenseStatus: (expenseId: string, status: ExpenseStatus) => Promise<void>;
  addCustodyFunds: (userId: string, amount: number) => Promise<void>;
  refreshData: () => Promise<void>;
  getEmployeeCustody: (employeeId: string) => CashCustody | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [custodyRecords, setCustodyRecords] = useState<CashCustody[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshData = useCallback(async () => {
    if (!localStorage.getItem('token')) return;
    setIsLoading(true);
    try {
      const [expRes, custRes, logsRes] = await Promise.all([
        ExpenseService.getAll({}),
        axios.get('/api/custody'),
        axios.get('/api/audit-logs')
      ]);
      setExpenses(expRes.data);
      setCustodyRecords(custRes.data);
      setLogs(logsRes.data);
    } catch (e) {
      console.error("Failed to sync with server", e);
      if ((e as any).response?.status === 401) logout();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getEmployeeCustody = useCallback((employeeId: string) => {
    return custodyRecords.find(c => c.employeeId === employeeId || (c as any).userId === employeeId);
  }, [custodyRecords]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      refreshData();
    }
  }, [refreshData]);

  const login = async (email: string, password = 'password123') => {
    setIsLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
      await refreshData();
    } catch (e) {
      alert("Login failed. Check credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setExpenses([]);
    setCustodyRecords([]);
    setLogs([]);
  };

  const addExpense = async (data: any) => {
    try {
      await ExpenseService.create(data);
      await refreshData();
    } catch (e) {
      alert("Failed to submit expense.");
    }
  };

  const updateExpenseStatus = async (id: string, status: ExpenseStatus) => {
    try {
      await ExpenseService.updateStatus(id, status);
      await refreshData();
    } catch (e: any) {
      alert(e.response?.data?.error || "Approval/Rejection failed.");
    }
  };

  const addCustodyFunds = async (userId: string, amount: number) => {
    try {
      await axios.patch(`/api/custody/${userId}/adjust`, { amount });
      await refreshData();
    } catch (e) {
      alert("Failed to adjust funds.");
    }
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      currentCompany,
      expenses,
      custodyRecords,
      branches: [], 
      users: [], 
      logs,
      isLoading,
      login,
      logout,
      addExpense,
      updateExpenseStatus,
      addCustodyFunds,
      refreshData,
      getEmployeeCustody
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
