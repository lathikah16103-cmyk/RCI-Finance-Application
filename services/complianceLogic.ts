
import { Task, TaskCategory, Department, TaskStatus, User, UserRole } from '../types';

// Helper to format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const generateInitialTasks = (users: User[]): Task[] => {
  const tasks: Task[] = [];
  const currentYear = new Date().getFullYear();
  
  // Identify our 2 users
  const adminUser = users.find(u => u.role === UserRole.ADMIN) || users[0];
  const staffUser = users.find(u => u.role === UserRole.USER) || users[1] || users[0];

  const createId = () => Math.random().toString(36).substr(2, 9);

  // 1. Monthly Tasks (Generate for next 3 months)
  for (let m = 0; m < 3; m++) {
    const today = new Date();
    const targetMonth = new Date(today.getFullYear(), today.getMonth() + m, 1);
    const monthName = targetMonth.toLocaleString('default', { month: 'long' });
    const period = `${monthName} ${targetMonth.getFullYear()}`;
    
    const nextMonthYear = targetMonth.getMonth() === 11 ? targetMonth.getFullYear() + 1 : targetMonth.getFullYear();
    const nextMonthIndex = (targetMonth.getMonth() + 1) % 12;

    // Finance - GSTR-1 (13th of next month) -> Assign to Staff
    tasks.push({
      task_id: createId(),
      task_name: 'GSTR-1 Filing',
      department: Department.FINANCE,
      category: TaskCategory.MONTHLY,
      due_date: formatDate(new Date(nextMonthYear, nextMonthIndex, 13)),
      applicable_period: period,
      description: 'File GSTR-1 for outward supplies.',
      status: TaskStatus.PENDING,
      assigned_person_id: staffUser.user_id,
      amount: 0 // Filing usually implies 0 tax, just reporting, but maybe late fees
    });

    // Finance - GST Remittance (20th of next month) -> Assign to Admin
    tasks.push({
      task_id: createId(),
      task_name: 'GST Payment Remittance',
      department: Department.FINANCE,
      category: TaskCategory.MONTHLY,
      due_date: formatDate(new Date(nextMonthYear, nextMonthIndex, 20)),
      applicable_period: period,
      description: 'Remit GST payment to government.',
      status: TaskStatus.PENDING,
      assigned_person_id: adminUser.user_id,
      amount: 45000 + (m * 2000) // Varied amounts
    });

    // Finance - TDS Payment (7th of next month) -> Assign to Staff
    tasks.push({
      task_id: createId(),
      task_name: 'TDS Payment',
      department: Department.FINANCE,
      category: TaskCategory.MONTHLY,
      due_date: formatDate(new Date(nextMonthYear, nextMonthIndex, 7)),
      applicable_period: period,
      description: 'Deposit Tax Deducted at Source.',
      status: TaskStatus.PENDING,
      assigned_person_id: staffUser.user_id,
      amount: 12500
    });

    // HR - PF Payment (15th) -> Assign to Admin (Since HR user is removed)
    tasks.push({
      task_id: createId(),
      task_name: 'PF Payment',
      department: Department.HR,
      category: TaskCategory.MONTHLY,
      due_date: formatDate(new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 15)),
      applicable_period: period,
      description: 'Provident Fund monthly payment.',
      status: TaskStatus.PENDING,
      assigned_person_id: adminUser.user_id,
      amount: 85000
    });

    // Finance - Bank Reconciliation (10th of next month) -> Assign to Staff
    tasks.push({
      task_id: createId(),
      task_name: 'Bank Reconciliation (BRS)',
      department: Department.FINANCE,
      category: TaskCategory.MONTHLY,
      due_date: formatDate(new Date(nextMonthYear, nextMonthIndex, 10)),
      applicable_period: period,
      description: 'Complete bank reconciliation for all accounts.',
      status: TaskStatus.PENDING,
      assigned_person_id: staffUser.user_id,
      amount: 0
    });
  }

  // 2. Quarterly Tasks
  const quarters = [
    { name: 'Q1 (Apr-Jun)', due: `${currentYear}-07-31` },
    { name: 'Q2 (Jul-Sep)', due: `${currentYear}-10-31` },
    { name: 'Q3 (Oct-Dec)', due: `${currentYear + 1}-01-31` },
    { name: 'Q4 (Jan-Mar)', due: `${currentYear + 1}-05-31` },
  ];

  quarters.forEach(q => {
    tasks.push({
      task_id: createId(),
      task_name: 'TDS Return Filing',
      department: Department.FINANCE,
      category: TaskCategory.QUARTERLY,
      due_date: q.due,
      applicable_period: q.name,
      description: 'Quarterly TDS Return filing (24Q/26Q).',
      status: TaskStatus.PENDING,
      assigned_person_id: adminUser.user_id, 
      amount: 0
    });
  });

  // 3. Annual Tasks
  tasks.push({
    task_id: createId(),
    task_name: 'GSTR-9 Annual Return',
    department: Department.FINANCE,
    category: TaskCategory.ANNUAL,
    due_date: `${currentYear}-12-31`,
    applicable_period: `FY ${currentYear-1}-${currentYear}`,
    description: 'Annual GST Return.',
    status: TaskStatus.PENDING,
    assigned_person_id: adminUser.user_id,
    amount: 0
  });

  tasks.push({
    task_id: createId(),
    task_name: 'Income Tax Return (ITR)',
    department: Department.FINANCE,
    category: TaskCategory.ANNUAL,
    due_date: `${currentYear}-09-30`,
    applicable_period: `FY ${currentYear-1}-${currentYear}`,
    description: 'Corporate Income Tax Return Filing.',
    status: TaskStatus.PENDING,
    assigned_person_id: adminUser.user_id,
    amount: 150000 // Estimated Tax
  });

  return tasks;
};

export const updateTaskStatuses = (tasks: Task[]): Task[] => {
  const today = new Date().toISOString().split('T')[0];
  return tasks.map(task => {
    if (task.status === TaskStatus.COMPLETED) return task;
    
    if (task.due_date < today) {
      return { ...task, status: TaskStatus.OVERDUE };
    }
    return task;
  });
};
