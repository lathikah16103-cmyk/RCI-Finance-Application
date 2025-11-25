import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  CalendarDays, 
  CheckSquare, 
  FileBarChart, 
  Bell, 
  LogOut, 
  Menu,
  X,
  UserCircle,
  Briefcase
} from 'lucide-react';
import { UserRole } from '../types';

export const Layout: React.FC = () => {
  const { currentUser, logout, notifications, markNotificationRead } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Protected Route Logic
  React.useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const unreadCount = notifications.filter(n => n.user_id === currentUser.user_id && !n.is_read).length;
  const myNotifications = notifications
    .filter(n => n.user_id === currentUser.user_id)
    .sort((a, b) => new Date(b.notification_date).getTime() - new Date(a.notification_date).getTime());

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/calendar', label: 'Calendar', icon: CalendarDays },
    { to: '/tasks', label: 'Task List', icon: CheckSquare },
    { to: '/reports', label: 'Reports', icon: FileBarChart },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white shadow-xl">
        <div className="p-6 flex items-center gap-2 border-b border-slate-700">
          <Briefcase className="w-8 h-8 text-brand-500" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">ComplyMATE</h1>
            <p className="text-xs text-slate-400">Finance & HR Compliance</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${isActive ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-4 px-2">
            <UserCircle className="w-10 h-10 text-slate-400" />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{currentUser.name}</p>
              <p className="text-xs text-slate-400 truncate">{currentUser.role} • {currentUser.department}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-600 text-slate-200 py-2 rounded-md transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header & Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 md:px-8 z-10">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6 text-slate-600" />
            </button>
            <h2 className="text-xl font-semibold text-slate-800 hidden sm:block">
              {navItems.find(n => n.to === location.pathname)?.label || 'Overview'}
            </h2>
          </div>

          <div className="relative">
            <button 
              onClick={() => setNotifOpen(!notifOpen)}
              className="p-2 relative hover:bg-slate-100 rounded-full transition-colors"
            >
              <Bell className="w-6 h-6 text-slate-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notifOpen && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-slate-200 z-50 max-h-[80vh] flex flex-col">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-semibold text-slate-800">Notifications</h3>
                  <button onClick={() => setNotifOpen(false)}><X className="w-4 h-4 text-slate-400" /></button>
                </div>
                <div className="overflow-y-auto flex-1 p-2 space-y-2">
                  {myNotifications.length === 0 ? (
                    <p className="text-center text-slate-400 py-8">No notifications</p>
                  ) : (
                    myNotifications.map(n => (
                      <div 
                        key={n.notification_id} 
                        onClick={() => markNotificationRead(n.notification_id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${n.is_read ? 'bg-white border-slate-100 opacity-60' : 'bg-blue-50 border-blue-100'}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${n.type === 'OVERDUE' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                            {n.type}
                          </span>
                          <span className="text-xs text-slate-400">{new Date(n.notification_date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm font-medium text-slate-800">{n.task_name}</p>
                        <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-64 bg-slate-900 shadow-xl flex flex-col">
              <div className="p-4 border-b border-slate-700 flex justify-between items-center text-white">
                <span className="font-bold text-lg">Menu</span>
                <button onClick={() => setSidebarOpen(false)}><X className="w-6 h-6" /></button>
              </div>
              <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                      ${isActive ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-800'}
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};