
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Task, TaskCategory, Department, TaskStatus } from '../types';
import { X, IndianRupee } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData: Task | null;
}

export const TaskModal: React.FC<Props> = ({ isOpen, onClose, initialData }) => {
  const { addTask, updateTask, users } = useApp();
  
  const [formData, setFormData] = useState<Partial<Task>>({
    task_name: '',
    department: Department.FINANCE,
    category: TaskCategory.MONTHLY,
    due_date: new Date().toISOString().split('T')[0],
    applicable_period: '',
    description: '',
    assigned_person_id: '',
    status: TaskStatus.PENDING,
    amount: 0
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      // Default assignment to first user in default dept (Finance)
      const defaultUser = users.find(u => u.department === Department.FINANCE);
      setFormData({
        task_name: '',
        department: Department.FINANCE,
        category: TaskCategory.MONTHLY,
        due_date: new Date().toISOString().split('T')[0],
        applicable_period: '',
        description: '',
        assigned_person_id: defaultUser?.user_id || '',
        status: TaskStatus.PENDING,
        amount: 0
      });
    }
  }, [initialData, users]);

  // Filter users based on selected department
  const departmentUsers = users.filter(u => u.department === formData.department);

  // Update assigned person if department changes and current person is not in new dept
  useEffect(() => {
    const currentAssigned = users.find(u => u.user_id === formData.assigned_person_id);
    if (currentAssigned && currentAssigned.department !== formData.department) {
      const newDefault = users.find(u => u.department === formData.department);
      setFormData(prev => ({...prev, assigned_person_id: newDefault?.user_id || ''}));
    }
  }, [formData.department, users, formData.assigned_person_id]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialData) {
      updateTask({ ...initialData, ...formData } as Task);
    } else {
      addTask({
        ...formData,
        task_id: Math.random().toString(36).substr(2, 9),
      } as Task);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">{initialData ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Task Name</label>
            <input 
              required
              type="text" 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow"
              value={formData.task_name}
              onChange={e => setFormData({...formData, task_name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
              <select 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                value={formData.department}
                onChange={e => setFormData({...formData, department: e.target.value as Department})}
              >
                {Object.values(Department).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value as TaskCategory})}
              >
                {Object.values(TaskCategory).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
              <input 
                required
                type="date" 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                value={formData.due_date}
                onChange={e => setFormData({...formData, due_date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Applicable Period</label>
              <input 
                required
                type="text" 
                placeholder="e.g. Jan 2024"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                value={formData.applicable_period}
                onChange={e => setFormData({...formData, applicable_period: e.target.value})}
              />
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Payment Amount (Optional)</label>
             <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IndianRupee className="h-4 w-4 text-slate-400" />
                </div>
                <input 
                  type="number"
                  min="0" 
                  placeholder="0.00"
                  className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                />
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Person</label>
            <select 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              value={formData.assigned_person_id}
              onChange={e => setFormData({...formData, assigned_person_id: e.target.value})}
            >
              <option value="" disabled>Select User</option>
              {departmentUsers.map(u => <option key={u.user_id} value={u.user_id}>{u.name} ({u.role})</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea 
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium shadow-sm transition-colors"
            >
              Save Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
