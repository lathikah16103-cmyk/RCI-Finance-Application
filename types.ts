
export enum UserRole {
  ADMIN = 'Admin',
  USER = 'User',
}

export enum Department {
  FINANCE = 'Finance',
  HR = 'HR',
}

export enum TaskCategory {
  MONTHLY = 'Monthly',
  QUARTERLY = 'Quarterly',
  HALF_YEARLY = 'Half-Yearly',
  ANNUAL = 'Annual',
}

export enum TaskStatus {
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  OVERDUE = 'Overdue',
}

export interface User {
  user_id: string;
  name: string;
  email: string;
  role: UserRole;
  department: Department;
  password?: string; // Added for Admin auth
}

export interface Task {
  task_id: string;
  task_name: string;
  department: Department;
  category: TaskCategory;
  due_date: string; // ISO String YYYY-MM-DD
  applicable_period: string;
  description: string;
  status: TaskStatus;
  assigned_person_id: string;
  completed_by_id?: string;
  completed_at?: string;
  amount?: number; // Added for financial tracking
  attachment?: {
    name: string;
    url: string;
    uploaded_at: string;
    type: string;
  };
}

export interface Notification {
  notification_id: string;
  user_id: string;
  task_id: string;
  task_name: string;
  message: string;
  notification_date: string;
  is_read: boolean;
  type: 'REMINDER' | 'OVERDUE' | 'COMPLETED' | 'ASSIGNMENT';
}
