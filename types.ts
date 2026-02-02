
export enum UserRole {
  OWNER = 'OWNER',
  ACCOUNTANT = 'ACCOUNTANT',
  EMPLOYEE = 'EMPLOYEE'
}

export enum ExpenseStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface Company {
  id: string;
  name: string;
  subscriptionStatus: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface User {
  id: string;
  companyId: string;
  name: string;
  email: string;
  role: UserRole;
  branchId?: string;
}

export interface Branch {
  id: string;
  companyId: string;
  name: string;
}

export interface CashCustody {
  id: string;
  employeeId: string;
  companyId: string;
  currentBalance: number;
  lastUpdated: string;
}

export interface Expense {
  id: string;
  companyId: string;
  employeeId: string;
  branchId?: string;
  amount: number;
  description: string;
  date: string;
  status: ExpenseStatus;
  attachmentUrl?: string;
  reviewedBy?: string; // User ID
  reviewedAt?: string;
}

export interface AuditLog {
  id: string;
  companyId: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface AppState {
  currentUser: User | null;
  currentCompany: Company | null;
  expenses: Expense[];
  custodyRecords: CashCustody[];
  branches: Branch[];
  users: User[];
  logs: AuditLog[];
}
