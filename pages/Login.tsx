
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { UserRole } from '../types';

export const Login: React.FC = () => {
  const { users, login } = useApp();
  const navigate = useNavigate();
  
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const selectedUser = users.find(u => u.user_id === selectedUserId);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedUser) {
      setError('Please select a user');
      return;
    }

    // Password Check for Admin
    if (selectedUser.role === UserRole.ADMIN) {
      if (!password) {
        setError('Password is required for Admin');
        return;
      }
      if (password !== selectedUser.password) {
        setError('Invalid password. Try "admin"');
        return;
      }
    }

    // Success
    login(selectedUser.user_id);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-8 text-center bg-slate-50 border-b border-slate-100">
          <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/30">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">ComplyMATE</h1>
          <p className="text-slate-500 mt-2">Finance & HR Compliance Management</p>
        </div>
        
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Select User</label>
            <div className="grid gap-3">
              {users.map(user => (
                <div 
                  key={user.user_id}
                  onClick={() => {
                    setSelectedUserId(user.user_id);
                    setError('');
                    setPassword('');
                  }}
                  className={`cursor-pointer flex items-center p-3 rounded-xl border transition-all ${selectedUserId === user.user_id ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500' : 'border-slate-200 hover:border-brand-300'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${selectedUserId === user.user_id ? 'bg-brand-200 text-brand-700' : 'bg-slate-100 text-slate-500'}`}>
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${selectedUserId === user.user_id ? 'text-brand-900' : 'text-slate-700'}`}>{user.name}</p>
                    <p className="text-xs text-slate-500">{user.role}</p>
                  </div>
                  {selectedUserId === user.user_id && <div className="w-3 h-3 bg-brand-500 rounded-full"></div>}
                </div>
              ))}
            </div>
          </div>

          {selectedUser?.role === UserRole.ADMIN && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-sm font-medium text-slate-700 mb-2">Admin Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password (try: 'admin')"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  autoFocus
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-100 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={!selectedUserId}
            className={`w-full py-3 rounded-xl font-bold text-white shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 transition-all ${!selectedUserId ? 'bg-slate-300 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700 hover:translate-y-[-1px]'}`}
          >
            Sign In <ArrowRight className="w-4 h-4" />
          </button>
        </form>
        
        <div className="p-4 bg-slate-50 text-center text-xs text-slate-400 border-t border-slate-100">
          Authorized Personnel Only • Secure Login
        </div>
      </div>
    </div>
  );
};
