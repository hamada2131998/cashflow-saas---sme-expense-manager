
import { UserRole, ExpenseStatus, Company, User, Branch, CashCustody, Expense } from './types';

export const MOCK_COMPANY: Company = {
  id: 'comp-1',
  name: 'Global Tech Solutions',
  subscriptionStatus: 'ACTIVE',
  createdAt: '2023-01-15',
};

export const MOCK_BRANCHES: Branch[] = [
  { id: 'br-1', companyId: 'comp-1', name: 'Main HQ' },
  { id: 'br-2', companyId: 'comp-1', name: 'Downtown Office' },
];

export const MOCK_USERS: User[] = [
  { id: 'u-1', companyId: 'comp-1', name: 'Ahmed Owner', email: 'owner@tech.com', role: UserRole.OWNER },
  { id: 'u-2', companyId: 'comp-1', name: 'Sarah Accountant', email: 'sarah@tech.com', role: UserRole.ACCOUNTANT },
  { id: 'u-3', companyId: 'comp-1', name: 'John Doe', email: 'john@tech.com', role: UserRole.EMPLOYEE, branchId: 'br-1' },
  { id: 'u-4', companyId: 'comp-1', name: 'Jane Smith', email: 'jane@tech.com', role: UserRole.EMPLOYEE, branchId: 'br-2' },
];

export const MOCK_CUSTODY: CashCustody[] = [
  { id: 'cc-1', employeeId: 'u-3', companyId: 'comp-1', currentBalance: 5000, lastUpdated: new Date().toISOString() },
  { id: 'cc-2', employeeId: 'u-4', companyId: 'comp-1', currentBalance: 3200, lastUpdated: new Date().toISOString() },
];

export const MOCK_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    companyId: 'comp-1',
    employeeId: 'u-3',
    branchId: 'br-1',
    amount: 150,
    description: 'Office stationery and printer ink',
    date: '2024-05-10',
    status: ExpenseStatus.APPROVED,
    reviewedBy: 'u-2',
    reviewedAt: '2024-05-11',
  },
  {
    id: 'exp-2',
    companyId: 'comp-1',
    employeeId: 'u-4',
    branchId: 'br-2',
    amount: 45.5,
    description: 'Taxi for client meeting',
    date: '2024-05-12',
    status: ExpenseStatus.PENDING,
  },
  {
    id: 'exp-3',
    companyId: 'comp-1',
    employeeId: 'u-3',
    branchId: 'br-1',
    amount: 200,
    description: 'Internet subscription reimbursement',
    date: '2024-05-13',
    status: ExpenseStatus.REJECTED,
    reviewedBy: 'u-2',
    reviewedAt: '2024-05-14',
  }
];
