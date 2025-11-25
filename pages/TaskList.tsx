
import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Task, TaskStatus, UserRole, Department } from '../types';
import { Search, Plus, Trash2, Edit2, CheckCircle, UploadCloud, FileText, Paperclip, IndianRupee } from 'lucide-react';
import { TaskModal } from '../components/TaskModal';

export const TaskList: React.FC = () => {
  const { tasks, markTaskComplete, deleteTask, attachFile, currentUser, users } = useApp();
  const [filterText, setFilterText] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingTaskId, setUploadingTaskId] = useState<string | null>(null);

  const filteredTasks = tasks.filter(task => {
    const matchesText = task.task_name.toLowerCase().includes(filterText.toLowerCase());
    const matchesDept = deptFilter === 'All' || task.department === deptFilter;
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    return matchesText && matchesDept && matchesStatus;
  }).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const triggerUpload = (taskId: string) => {
    setUploadingTaskId(taskId);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadingTaskId) {
      attachFile(uploadingTaskId, file);
      setUploadingTaskId(null);
      // Reset input
      e.target.value = '';
    }
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === 0) return '-';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileChange}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Task Management</h1>
        {currentUser?.role === UserRole.ADMIN && (
          <button 
            onClick={handleAdd}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <select 
            className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
          >
            <option value="All">All Departments</option>
            {Object.values(Department).map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select 
             className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
             value={statusFilter}
             onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Task Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned To</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">No tasks found matching your filters.</td>
                </tr>
              ) : (
                filteredTasks.map(task => {
                  const assignedUser = users.find(u => u.user_id === task.assigned_person_id);
                  return (
                    <tr key={task.task_id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-800">{task.task_name}</p>
                          {task.attachment && (
                            <a 
                              href={task.attachment.url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-slate-400 hover:text-brand-600 transition-colors"
                              title={`View ${task.attachment.name}`}
                            >
                              <Paperclip className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">{task.category}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                          {task.department}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-800">{new Date(task.due_date).toLocaleDateString()}</div>
                        <div className="text-xs text-slate-500">{task.applicable_period}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-700 font-mono">
                          {formatCurrency(task.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                             {assignedUser?.name.charAt(0)}
                           </div>
                           <span className="text-sm text-slate-700 truncate max-w-[100px]">{assignedUser?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <StatusBadge status={task.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* File Upload Button */}
                          <button
                            onClick={() => triggerUpload(task.task_id)}
                            title="Upload File"
                            className={`p-1.5 rounded-md transition-colors ${task.attachment ? 'text-blue-600 hover:bg-blue-50' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
                          >
                             {task.attachment ? <FileText className="w-5 h-5" /> : <UploadCloud className="w-5 h-5" />}
                          </button>

                          {task.status !== TaskStatus.COMPLETED && (
                            <button 
                              onClick={() => markTaskComplete(task.task_id)}
                              title="Mark Complete"
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                          )}
                          
                          <button 
                            onClick={() => handleEdit(task)}
                            title="Edit"
                            className="p-1.5 text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>

                          {currentUser?.role === UserRole.ADMIN && (
                            <button 
                              onClick={() => deleteTask(task.task_id)}
                              title="Delete"
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {isModalOpen && (
        <TaskModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          initialData={editingTask} 
        />
      )}
    </div>
  );
};

const StatusBadge = ({ status }: { status: TaskStatus }) => {
  const styles = {
    [TaskStatus.PENDING]: 'bg-amber-100 text-amber-700',
    [TaskStatus.COMPLETED]: 'bg-emerald-100 text-emerald-700',
    [TaskStatus.OVERDUE]: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${styles[status]}`}>
      {status}
    </span>
  );
};
