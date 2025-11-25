
import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TaskStatus, Department } from '../types';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ListChecks, 
  TrendingUp, 
  Download, 
  ArrowUpRight, 
  ArrowDownRight,
  Wallet
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { tasks, currentUser } = useApp();

  // --- Calculations ---

  // 1. Operational Stats
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    const pending = tasks.filter(t => t.status === TaskStatus.PENDING).length;
    const overdue = tasks.filter(t => t.status === TaskStatus.OVERDUE).length;
    const rate = total ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending, overdue, rate };
  }, [tasks]);

  // 2. Financial Stats
  const finance = useMemo(() => {
    const totalLiability = tasks.reduce((sum, t) => sum + (t.amount || 0), 0);
    const paid = tasks.filter(t => t.status === TaskStatus.COMPLETED).reduce((sum, t) => sum + (t.amount || 0), 0);
    const pending = tasks.filter(t => t.status === TaskStatus.PENDING).reduce((sum, t) => sum + (t.amount || 0), 0);
    const overdue = tasks.filter(t => t.status === TaskStatus.OVERDUE).reduce((sum, t) => sum + (t.amount || 0), 0);
    
    // Percentages for progress bars
    const paidPct = totalLiability ? (paid / totalLiability) * 100 : 0;
    const pendingPct = totalLiability ? (pending / totalLiability) * 100 : 0;
    const overduePct = totalLiability ? (overdue / totalLiability) * 100 : 0;

    return { totalLiability, paid, pending, overdue, paidPct, pendingPct, overduePct };
  }, [tasks]);

  // 3. Charts Data
  const charts = useMemo(() => {
    // Cash Flow (Next 6 Months)
    const cashFlowMap: Record<string, number> = {};
    const today = new Date();
    for(let i=0; i<6; i++) {
        const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
        const key = d.toLocaleString('default', { month: 'short' });
        cashFlowMap[key] = 0;
    }
    tasks.forEach(t => {
        if (!t.amount) return; // Include all liabilities (paid or not) to show projected budget
        const dueDate = new Date(t.due_date);
        const key = dueDate.toLocaleString('default', { month: 'short' });
        if (cashFlowMap[key] !== undefined) {
            cashFlowMap[key] += t.amount;
        }
    });
    const cashFlowData = Object.keys(cashFlowMap).map(key => ({ name: key, Amount: cashFlowMap[key] }));

    // Department Liability Distribution
    const deptData = [
      { name: 'Finance', value: tasks.filter(t => t.department === Department.FINANCE).reduce((s, t) => s + (t.amount||0), 0), color: '#3b82f6' }, // Blue
      { name: 'HR', value: tasks.filter(t => t.department === Department.HR).reduce((s, t) => s + (t.amount||0), 0), color: '#8b5cf6' }, // Purple
    ].filter(d => d.value > 0);

    return { cashFlowData, deptData };
  }, [tasks]);

  // 4. Lists
  const upcomingTasks = tasks.filter(t => t.status === TaskStatus.PENDING)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 5);
    
  const overdueTasks = tasks.filter(t => t.status === TaskStatus.OVERDUE);

  // --- Actions ---

  const handleExportFinancials = () => {
    const headers = ['Task Name', 'Department', 'Due Date', 'Status', 'Amount (INR)', 'Assigned To'];
    const rows = tasks.map(t => [
      `"${t.task_name}"`,
      t.department,
      t.due_date,
      t.status,
      t.amount || 0,
      t.assigned_person_id
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Financial_Compliance_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-slate-500 mt-1">Real-time financial compliance and operational oversight.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExportFinancials}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-brand-600 px-4 py-2.5 rounded-xl font-semibold shadow-sm transition-all"
          >
            <Download className="w-4 h-4" /> Export Financials
          </button>
        </div>
      </div>

      {/* Hero Financial Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-xl text-white p-6 md:p-8">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Wallet className="w-64 h-64 transform translate-x-12 -translate-y-12" />
        </div>
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Total Liability */}
          <div className="flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-slate-700 pb-6 lg:pb-0 lg:pr-8">
            <p className="text-slate-400 font-medium mb-1 flex items-center gap-2">
              Total Annual Liability <AlertCircle className="w-4 h-4" />
            </p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">{formatCurrency(finance.totalLiability)}</h2>
            <div className="mt-4 flex items-center gap-2 text-sm text-emerald-400 bg-emerald-400/10 w-fit px-3 py-1 rounded-full">
              <TrendingUp className="w-4 h-4" /> Projected for FY {new Date().getFullYear()}-{new Date().getFullYear()+1}
            </div>
          </div>

          {/* Payment Status Bars */}
          <div className="lg:col-span-2 flex flex-col justify-center space-y-6">
            
            {/* Paid */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <div>
                  <span className="text-lg font-semibold text-emerald-400">Paid</span>
                  <span className="text-xs text-slate-400 ml-2">Completed Transactions</span>
                </div>
                <span className="text-xl font-bold">{formatCurrency(finance.paid)}</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${finance.paidPct}%` }}></div>
              </div>
            </div>

            {/* Pending & Overdue Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="font-medium text-amber-400 flex items-center gap-2"><Clock className="w-4 h-4"/> Pending</span>
                  <span className="font-bold">{formatCurrency(finance.pending)}</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-1.5">
                  <div className="bg-amber-500 h-full rounded-full transition-all duration-1000" style={{ width: `${finance.pendingPct}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="font-medium text-red-400 flex items-center gap-2"><AlertCircle className="w-4 h-4"/> Overdue</span>
                  <span className="font-bold">{formatCurrency(finance.overdue)}</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-1.5">
                  <div className="bg-red-500 h-full rounded-full transition-all duration-1000" style={{ width: `${finance.overduePct}%` }}></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Operational KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile 
          label="Task Completion" 
          value={`${stats.rate}%`} 
          subLabel={`${stats.completed}/${stats.total} Tasks`}
          icon={CheckCircle2} 
          trend="up"
          color="emerald"
        />
        <StatTile 
          label="Pending Tasks" 
          value={stats.pending} 
          subLabel="Action Required"
          icon={Clock} 
          trend="neutral"
          color="amber"
        />
        <StatTile 
          label="Overdue Alerts" 
          value={stats.overdue} 
          subLabel="Immediate Attention"
          icon={AlertCircle} 
          trend="down"
          color="red"
        />
        <StatTile 
          label="Total Tasks" 
          value={stats.total} 
          subLabel="Current Cycle"
          icon={ListChecks} 
          trend="neutral"
          color="blue"
        />
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cash Flow Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-slate-800 text-lg">Projected Cash Outflow</h3>
             <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">Next 6 Months</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer>
              <BarChart data={charts.cashFlowData}>
                 <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [formatCurrency(value), 'Liability']}
                 />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                 <YAxis hide />
                 <Bar dataKey="Amount" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="font-bold text-slate-800 text-lg mb-4">Liability by Dept</h3>
          <div className="flex-1 min-h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.deptData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {charts.deptData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-sm font-medium text-slate-400">Total Split</span>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {charts.deptData.map(d => (
              <div key={d.name} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                <span className="text-slate-600">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Task Priority Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Urgent/Upcoming */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800">Upcoming Payments & Filings</h3>
            <button className="text-xs font-semibold text-brand-600 hover:text-brand-700">View All</button>
          </div>
          <div className="flex-1 divide-y divide-slate-100">
            {upcomingTasks.length === 0 ? (
               <div className="p-8 text-center text-slate-400">No pending tasks for the immediate future.</div>
            ) : (
              upcomingTasks.map(task => (
                <div key={task.task_id} className="p-4 hover:bg-slate-50 transition-colors group">
                  <div className="flex justify-between items-center">
                    <div className="flex items-start gap-3">
                       <div className="p-2 bg-blue-50 text-blue-600 rounded-lg mt-1">
                          {task.amount ? <IndianRupee size={16} /> : <FileTextIcon size={16} />}
                       </div>
                       <div>
                          <p className="font-semibold text-slate-800 text-sm">{task.task_name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{task.department} • {task.category}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="font-mono font-bold text-slate-700 text-sm">{task.amount ? formatCurrency(task.amount) : 'Filing'}</p>
                       <p className="text-xs text-slate-500 mt-0.5">{new Date(task.due_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Critical/Overdue */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-red-50/50">
            <h3 className="font-bold text-red-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" /> Critical Attention Needed
            </h3>
            <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">{overdueTasks.length}</span>
          </div>
          <div className="flex-1 divide-y divide-slate-100">
             {overdueTasks.length === 0 ? (
               <div className="p-8 text-center flex flex-col items-center text-emerald-600">
                 <CheckCircle2 className="w-12 h-12 mb-2 opacity-50" />
                 <p className="font-medium">All clear! No overdue items.</p>
               </div>
            ) : (
              overdueTasks.map(task => (
                <div key={task.task_id} className="p-4 bg-red-50/10 hover:bg-red-50 transition-colors border-l-4 border-red-500">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{task.task_name}</p>
                      <p className="text-xs text-red-600 font-semibold mt-0.5">Due: {new Date(task.due_date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                       <p className="font-mono font-bold text-red-600 text-sm">{task.amount ? formatCurrency(task.amount) : '-'}</p>
                       <span className="text-[10px] uppercase font-bold text-red-400">Overdue</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

// --- Sub Components ---

const StatTile = ({ label, value, subLabel, icon: Icon, trend, color }: any) => {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600',
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend === 'up' && <ArrowUpRight className="w-4 h-4 text-emerald-500" />}
        {trend === 'down' && <ArrowDownRight className="w-4 h-4 text-red-500" />}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-xs text-slate-400 mt-1">{subLabel}</p>
      </div>
    </div>
  );
};

const IndianRupee = ({ size }: { size: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12"/><path d="M6 8h12"/><path d="m6 13 8.5-10"/><path d="M6 13h3"/><path d="M9 13c6.667 0 6.667-10 0-10"/></svg>
);

const FileTextIcon = ({ size }: { size: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
);
