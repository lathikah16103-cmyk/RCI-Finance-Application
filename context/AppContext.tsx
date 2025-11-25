
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, User, Notification, UserRole, Department, TaskStatus } from '../types';
import { generateInitialTasks, updateTaskStatuses } from '../services/complianceLogic';

// Reduced to 2 Users as requested
const MOCK_USERS: User[] = [
  { 
    user_id: 'u1', 
    name: 'System Admin', 
    email: 'admin@comply.com', 
    role: UserRole.ADMIN, 
    department: Department.FINANCE,
    password: 'admin' // Simple password for demo
  },
  { 
    user_id: 'u2', 
    name: 'Finance Staff', 
    email: 'staff@comply.com', 
    role: UserRole.USER, 
    department: Department.FINANCE 
  }
];

interface AppContextType {
  tasks: Task[];
  users: User[];
  currentUser: User | null;
  notifications: Notification[];
  login: (userId: string) => void;
  logout: () => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  markTaskComplete: (taskId: string) => void;
  markNotificationRead: (notifId: string) => void;
  attachFile: (taskId: string, file: File) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users] = useState<User[]>(MOCK_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Initialize Data
  useEffect(() => {
    const loadData = () => {
      let loadedTasks = generateInitialTasks(MOCK_USERS);
      loadedTasks = updateTaskStatuses(loadedTasks);
      setTasks(loadedTasks);
      checkNotifications(loadedTasks);
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const checkNotifications = (currentTasks: Task[]) => {
    const today = new Date();
    const newNotifications: Notification[] = [];

    currentTasks.forEach(task => {
      if (task.status === TaskStatus.COMPLETED) return;

      const dueDate = new Date(task.due_date);
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      let message = '';
      let type: 'REMINDER' | 'OVERDUE' = 'REMINDER';

      if (diffDays === 7 || diffDays === 3) {
        message = `Reminder: ${task.task_name} is due in ${diffDays} days.`;
      } else if (diffDays === 0) {
        message = `Alert: ${task.task_name} is due today!`;
      } else if (diffDays < 0) {
        message = `Overdue: ${task.task_name} was due on ${task.due_date}.`;
        type = 'OVERDUE';
      }

      if (message) {
        newNotifications.push({
          notification_id: Math.random().toString(36).substr(2, 9),
          user_id: task.assigned_person_id,
          task_id: task.task_id,
          task_name: task.task_name,
          message,
          notification_date: new Date().toISOString(),
          is_read: false,
          type
        });
      }
    });

    setNotifications(prev => [...prev, ...newNotifications]);
  };

  const login = (userId: string) => {
    const user = users.find(u => u.user_id === userId);
    if (user) setCurrentUser(user);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addTask = (task: Task) => {
    setTasks(prev => [...prev, task]);
    
    // Notify Assigned User
    const newNotification: Notification = {
      notification_id: Math.random().toString(36).substr(2, 9),
      user_id: task.assigned_person_id,
      task_id: task.task_id,
      task_name: task.task_name,
      message: `New Assignment: ${task.task_name}`,
      notification_date: new Date().toISOString(),
      is_read: false,
      type: 'ASSIGNMENT'
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const updateTask = (updatedTask: Task) => {
    // Check if assignee changed to trigger notification
    setTasks(prev => {
      const oldTask = prev.find(t => t.task_id === updatedTask.task_id);
      if (oldTask && oldTask.assigned_person_id !== updatedTask.assigned_person_id) {
        const newNotification: Notification = {
          notification_id: Math.random().toString(36).substr(2, 9),
          user_id: updatedTask.assigned_person_id,
          task_id: updatedTask.task_id,
          task_name: updatedTask.task_name,
          message: `Task reassigned to you: ${updatedTask.task_name}`,
          notification_date: new Date().toISOString(),
          is_read: false,
          type: 'ASSIGNMENT'
        };
        setNotifications(curr => [newNotification, ...curr]);
      }
      return prev.map(t => t.task_id === updatedTask.task_id ? updatedTask : t);
    });
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.task_id !== taskId));
  };

  const markTaskComplete = (taskId: string) => {
    if (!currentUser) return;
    setTasks(prev => prev.map(t => {
      if (t.task_id === taskId) {
        return {
          ...t,
          status: TaskStatus.COMPLETED,
          completed_by_id: currentUser.user_id,
          completed_at: new Date().toISOString()
        };
      }
      return t;
    }));
  };

  const markNotificationRead = (notifId: string) => {
    setNotifications(prev => prev.map(n => n.notification_id === notifId ? { ...n, is_read: true } : n));
  };

  const attachFile = (taskId: string, file: File) => {
    // Create a fake URL for the file attachment
    const attachment = {
      name: file.name,
      url: URL.createObjectURL(file), 
      uploaded_at: new Date().toISOString(),
      type: file.type
    };

    setTasks(prev => prev.map(t => {
      if (t.task_id === taskId) {
        // Create Assignment Notification if an Admin uploads a file for a user task? 
        // For now, just update the task
        return { ...t, attachment };
      }
      return t;
    }));
  };

  return (
    <AppContext.Provider value={{
      tasks,
      users,
      currentUser,
      notifications,
      login,
      logout,
      addTask,
      updateTask,
      deleteTask,
      markTaskComplete,
      markNotificationRead,
      attachFile
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
