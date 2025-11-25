import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { TaskList } from './pages/TaskList';
import { CalendarView } from './pages/CalendarView';
import { Reports } from './pages/Reports';
import { Login } from './pages/Login';

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="tasks" element={<TaskList />} />
            <Route path="calendar" element={<CalendarView />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  );
};

export default App;