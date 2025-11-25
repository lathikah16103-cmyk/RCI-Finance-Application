import React from 'react';
import { useApp } from '../context/AppContext';
import { Download, FileText, Table } from 'lucide-react';
import { Department } from '../types';

export const Reports: React.FC = () => {
  const { tasks } = useApp();

  const handleExportCSV = () => {
    const headers = ['Task Name', 'Department', 'Category', 'Due Date', 'Status', 'Assigned To'];
    const rows = tasks.map(t => [
      t.task_name,
      t.department,
      t.category,
      t.due_date,
      t.status,
      t.assigned_person_id
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "compliance_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // Logic for Report Summary
  const deptStats = Object.values(Department).map(dept => {
    const deptTasks = tasks.filter(t => t.department === dept);
    const total = deptTasks.length;
    const completed = deptTasks.filter(t => t.status === 'Completed').length;
    const overdue = deptTasks.filter(t => t.status === 'Overdue').length;
    return { dept, total, completed, overdue, percent: total ? Math.round((completed/total)*100) : 0 };
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Reports & Exports</h1>
        <div className="flex gap-2">
           <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
          >
            <Table className="w-4 h-4" /> Export CSV
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-brand-600 text-white hover:bg-brand-700 px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" /> Print PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
           <h2 className="text-lg font-bold text-slate-800">Executive Summary</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {deptStats.map((stat) => (
            <div key={stat.dept} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-600">{stat.dept} Department</h3>
                <span className={`text-sm font-bold px-2 py-1 rounded-full ${stat.percent === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                  {stat.percent}% Compliant
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total Tasks</span>
                  <span className="font-medium">{stat.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Completed</span>
                  <span className="font-medium text-emerald-600">{stat.completed}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Overdue</span>
                  <span className="font-medium text-red-600">{stat.overdue}</span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
                  <div 
                    className="bg-brand-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${stat.percent}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Print Only Section */}
      <div className="hidden print:block mt-8">
        <h2 className="text-xl font-bold mb-4">Full Task List</h2>
        <table className="w-full text-left text-xs border border-slate-300">
          <thead>
            <tr className="bg-slate-100">
              <th className="p-2 border">Task</th>
              <th className="p-2 border">Due Date</th>
              <th className="p-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(t => (
              <tr key={t.task_id}>
                <td className="p-2 border">{t.task_name}</td>
                <td className="p-2 border">{t.due_date}</td>
                <td className="p-2 border">{t.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};