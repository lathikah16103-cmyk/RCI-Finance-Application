import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task, TaskStatus } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const CalendarView: React.FC = () => {
  const { tasks } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getTasksForDay = (day: number) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${month}-${dayStr}`;
    return tasks.filter(t => t.due_date === dateStr);
  };

  const renderCells = () => {
    const cells = [];
    
    // Empty cells for previous month
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="h-32 bg-slate-50/50 border border-slate-100"></div>);
    }

    // Days
    for (let d = 1; d <= daysInMonth; d++) {
      const dayTasks = getTasksForDay(d);
      const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), d).toDateString();

      cells.push(
        <div key={d} className={`h-32 border border-slate-100 p-2 overflow-y-auto ${isToday ? 'bg-blue-50/50' : 'bg-white'}`}>
          <div className="flex justify-between items-center mb-1">
             <span className={`text-sm font-semibold ${isToday ? 'text-brand-600 bg-brand-100 w-6 h-6 flex items-center justify-center rounded-full' : 'text-slate-700'}`}>{d}</span>
             {dayTasks.length > 0 && <span className="text-[10px] text-slate-400">{dayTasks.length} due</span>}
          </div>
          <div className="space-y-1">
            {dayTasks.map(task => (
              <div 
                key={task.task_id}
                className={`text-[10px] p-1 rounded truncate border-l-2 cursor-pointer
                  ${task.status === TaskStatus.COMPLETED ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 
                    task.status === TaskStatus.OVERDUE ? 'bg-red-50 border-red-500 text-red-700' : 'bg-amber-50 border-amber-500 text-amber-700'
                  }`}
                title={task.task_name}
              >
                {task.task_name}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return cells;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Calendar</h1>
        <div className="flex items-center gap-4 bg-white p-1 rounded-lg shadow-sm border border-slate-200">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-md"><ChevronLeft className="w-5 h-5 text-slate-600"/></button>
          <span className="font-bold text-slate-800 min-w-[140px] text-center">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-md"><ChevronRight className="w-5 h-5 text-slate-600"/></button>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden flex-1 flex flex-col">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        {/* Grid */}
        <div className="grid grid-cols-7 flex-1">
          {renderCells()}
        </div>
      </div>
      
      <div className="mt-4 flex gap-4 text-sm justify-end">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-500 rounded-sm"></div> <span>Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div> <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-sm"></div> <span>Overdue</span>
        </div>
      </div>
    </div>
  );
};